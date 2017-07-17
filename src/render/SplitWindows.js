const React = require('react')
const ReactDOM = require('react-dom')
const {Component} = React
const SplitPane = require('./split_pane/SplitPane')
const TabPanel = require("./TabPanel")
const PubSub = require('./pubsub')
const uuid = require("node-uuid")
const ipc = require('electron').ipcRenderer
const {remote} = require('electron')
const {BrowserWindow} = remote
const mainState = remote.require('./mainState')
import url from 'url'
const FloatPanel = require('./FloatPanel')
const {token} = require('./databaseRender')
import firebase,{storage,auth,database} from 'firebase'
let MARGIN = 30
let count = 0
// ipc.setMaxListeners(0)

const baseTime = new Date("2017/01/01").getTime()

const config = {
  apiKey: "AIzaSyCZFJ_UVwezRCWS3IMfGusPMZqmZsN6zdE",
  authDomain: "browser-b2ecd.firebaseapp.com",
  databaseURL: "https://browser-b2ecd.firebaseio.com",
  projectId: "browser-b2ecd",
  storageBucket: "browser-b2ecd.appspot.com",
  messagingSenderId: "427711452647"
}

firebase.initializeApp(config)

function isFixedPanel(key){
  return key.startsWith('fixed-')
}

function getUuid(){
  console.log(count)
  return `${Date.now()}_${uuid.v4()}_${count++}`
}


function getPanelId(key) {
  const keySplit = key.split("_")
  return parseInt(keySplit[keySplit.length - 1]);
}

function getWindowId(winId, key) {
  return winId * 100000 + getPanelId(key);
}

function getParam() {
  if (window.location.search.length < 2) return

  const parameters = window.location.search.substring(1).split('&')
  const result = {}
  for (let param of parameters) {
    const element = param.split('=')
    const paramName = decodeURIComponent(element[0])
    const paramValue = decodeURIComponent(element[1])

    result[paramName] = decodeURIComponent(paramValue)
  }
  return result
}

function toBlob(base64) {
  var bin = atob(base64);
  const len = bin.length
  var buffer = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buffer[i] = bin.charCodeAt(i);
  }
  return buffer
}

export default class SplitWindows extends Component{
  constructor(props) {
    super(props)
    this.currentWebContents = {}
    global.currentWebContents = this.currentWebContents

    let winState
    const mState = mainState.winState
    if(mState){
      const _winState = JSON.parse(mState)
      if(_winState.l){
        winState = this.parseRestoreDate(_winState,{})
        const maxState = JSON.parse(mainState.maxState)
        console.log(maxState,this.getKeyPosition(this.getFixedPanelKey('right'),winState,true))
        if(maxState.maximize){
          let pos
          if(pos = this.getKeyPosition(this.getFixedPanelKey('right'),winState,true)){
            pos.node.size = maxState.width - (maxState.maxWidth - pos.node.size)
          }
          if(pos = this.getKeyPosition(this.getFixedPanelKey('bottom'),winState,true)){
            pos.node.size = maxState.height - (maxState.maxHeight - pos.node.size)
          }
        }
      }
      if(winState.toggleNav == 2 || winState.toggleNav == 3) winState.toggleNav = 0
    }

    const param = getParam()
    console.log(67,param)
    if(param){
      winState = {dirc: "v",size: '100%',l: [getUuid(),[]],r: null,p: null,key:uuid.v4(),toggleNav: mainState.toggleNav || 0,attach:JSON.parse(decodeURIComponent(param.tabparam))}
      for(let at of winState.attach){
        remote.getWebContents(at.wvId,cont=>{
          this.currentWebContents[at.wvId] = cont
        })
      }
    }

    console.log(22222222222222,winState)
    // const root = {dirc: "v",size: 50,l: [getUuid(),[]],r: [getUuid(),[]],p: null,key:uuid.v4(),toggleNav: 0}
    const root = winState || {dirc: "v",size: '100%',l: [getUuid(),[]],r: null,p: null,key:uuid.v4(),toggleNav: mainState.toggleNav || 0}
    // root.l = {dirc: "h",size: 50,l: [getUuid(),[]],r: [getUuid(),[]],p: root, pd: "l",key:uuid.v4()}
    this.state = {root,floatPanels: new Map()}
    this.refs2 = {}
    this.prevGetScrollState = JSON.stringify({})
    this.prevGetScrollDate = 0
    this.nc = Date.now()
    this.prevNc = 0
    this.htmlContentSet = new Set()
    this.windowId = remote.getCurrentWindow().id
    this.tabEvents = []
    this.hidePanels = {}
  }


  componentDidMount() {
    this.webContentsCreated = (event, tabId)=>{
      remote.getWebContents(tabId,tab=>{
        this.currentWebContents[tabId] = tab
        const pageUpdate = ()=> {
          console.log(tab.getTitle())
          const keys = []
          this.allKeys(this.state.root,keys)
          for(let key of keys){
            this.refs2[key].updateTitle(tab)
          }
        }
        tab.on('page-title-updated',pageUpdate)

        const getResponseDetails = (e, record) => {
          PubSub.publish('rich-media-insert',record)
        }
        ipc.on('did-get-response-details', getResponseDetails)
        const self = this
        const cleanupWebContents = ()=>{
          delete self.currentWebContents[tabId]
          tab.removeListener('page-title-updated',pageUpdate)
          tab.removeListener('did-get-response-details',getResponseDetails)
        }

        this.tabEvents.push([tab,'destroyed',cleanupWebContents])
        tab.once('destroyed', cleanupWebContents)
      })


    }
    ipc.on('web-contents-created', this.webContentsCreated)


    this.syncDatasEvent = async (e,{sync_at,email,password,base64})=>{
      console.log(666,{email,password,base64})
      let uid
      const user = auth().currentUser
      if (!user) {
        const result = await auth().signInWithEmailAndPassword(email, password)
        uid = result.uid
      }
      else{
        uid = user.uid
      }

      const bTime = (sync_at == 0 ? sync_at : sync_at - baseTime).toString(36)
      const storageRef = storage().ref(`users/${uid}`)
      const dbRef = database().ref(`users/${uid}/s`)
      let vals = (await dbRef.orderByKey().limitToLast(20).once('value')).val()
      if(vals && Object.keys(vals)[0] > bTime){
        vals = (await dbRef.orderByKey().once('value')).val()
      }

      for(let key of Object.keys(vals || {})){
        console.log(key,bTime)
        if(key > bTime){
          const url = await storageRef.child(`${key}.gz`).getDownloadURL()
          fetch(url).then(response=>{
            return response.blob();
          }).then(blob=>{
            const reader = new FileReader();
            reader.onload = _=>{ipc.send('sync-datas-to-main',reader.result.split(',')[1])}
            reader.readAsDataURL(blob)
          })
        }
      }

      const now = Date.now()
      const setTime = (now - baseTime).toString(36)
      const ref = storageRef.child(`${setTime}.gz`)
      ref.put(toBlob(base64)).then((snapshot)=>{
        dbRef.update({
          [setTime]: ""
        });
        token.update({key:'sync_at'},{key:'sync_at', sync_at: now}, { upsert: true }).then(_=>_)
      });


    }

    ipc.on('sync-datas',this.syncDatasEvent)


    this.toggleNavEvent = (e,num)=>{
      this.state.root.toggleNav = num != (void 0) ? num : (this.state.root.toggleNav + 1) % 2
      mainState.set('toggleNav',this.state.root.toggleNav)
      this.setState({})
    }
    ipc.on('toggle-nav',this.toggleNavEvent)

    this.menuSticky = (e)=>{
      if(!this.menuStickyFlag && e.clientY < 5){
        this.menuStickyFlag = true
        this.state.root.toggleNav = 3
        this.setState({})
      }
      else if(this.menuStickyFlag && e.clientY > 80 && !e.target.closest(".navbar-main")){
        this.menuStickyFlag = false
        this.state.root.toggleNav = 2
        this.setState({})
      }
    }
    this.menuSticky = ::this.menuSticky


    this.switchFullscreenEvent = (e,flag)=>{
      if(flag){
        this._toggleNav = this.state.root.toggleNav
        this.state.root.toggleNav = 2
        // mainState.set('toggleNav',2)
        document.addEventListener('mousemove',this.menuSticky,{passive: true})
      }
      else{
        this.state.root.toggleNav = this._toggleNav
        // mainState.set('toggleNav',this._toggleNav)
        this._toggleNav = void 0
        document.removeEventListener('mousemove',this.menuSticky)
      }
      this.setState({})
    }
    ipc.on('switch-fullscreen',this.switchFullscreenEvent)

    this.getWinStateEvent = _=>{
      if(this.getAllKey().filter(key=>!isFixedPanel(key)).length === 0){
        ipc.send('get-window-state-reply',this.prevState)
      }
      else{
        ipc.send('get-window-state-reply',this.jsonfyiable(this.state.root,{},true))
      }
    }
    ipc.on('get-window-state',this.getWinStateEvent)

    this.getTabId = (activeElement)=>{
      let tabId
      if (activeElement.tagName == 'BODY') {
      }
      else if(activeElement.tagName == 'WEBVIEW'){
        tabId = this.refs2[activeElement.className.slice(1)].getSelectedTabId()
      }
      else{
        const closestElement = activeElement.closest(".split-window")
        if (closestElement) {
          tabId = this.refs2[closestElement.classList[1].slice(1)].getSelectedTabId()
        }
      }
      return tabId;
    }
    this.getFocusedWebContent = (e,key)=>{
      console.log(document.activeElement,window.lastMouseDown)
      let tabId = this.getTabId(document.activeElement) || ( window.lastMouseDown&& this.getTabId(global.lastMouseDown))

      if(!tabId){
        tabId = this.refs2[this.isTopLeft].getSelectedTabId()
      }
      console.log(2323,tabId)
      ipc.send(`get-focused-webContent-reply_${key}`,tabId)
    }
    ipc.on('get-focused-webContent',this.getFocusedWebContent)


    this.tokenAlign = PubSub.subscribe("align",(_,e)=>{

      const mapDepth = this.getDepth()

      const fixedObj = this.existsAllFixedPanel()
      const wMod = fixedObj.left + fixedObj.right
      const hMod = fixedObj.top + fixedObj.bottom

      console.log("wMod",wMod)
      console.log("hmod",hMod)

      const w = window.innerWidth - wMod
      const h = window.innerHeight - hMod
      const event = {dirc: e!="v" ? "vertical" : "horizontal",size: e!="v" ? w/mapDepth.get("max")[0]: h/mapDepth.get("max")[1],map:mapDepth}
      PubSub.publish("align-panel",event)
    })

    const self = this

    this.search = (e)=>{
      if (e.srcElement == this && e.ctrlKey && e.keyCode == 70) { // Ctrl+F
        const winInfos = self.getScrollPriorities(0)
        PubSub.publish("body-keydown",{key:winInfos[0][0],ctrlKey: e.ctrlKey,keyCode: e.keyCode})
      }
    }
    document.body.addEventListener("keydown",this.search)

    ipc.on('rlog', (e, args)=> {
      console.log(...args)
    })

  }

  componentDidUpdate(prevProps, prevState) {
    console.log(this.jsonfyiable(this.state.root,{}),this.state.root)
    if(this.getAllKey().filter(key=>!isFixedPanel(key)).length === 0){
      require('electron').remote.getCurrentWindow().close()
    }
  }

  componentWillUnmount() {
    for(let key of Object.keys(this.hidePanels)){
      this.close(key)
      this.refs2[key].TabPanelClose()
    }

    document.body.removeEventListener("keydown",this.search)
    ipc.removeListener('sync-datas',this.syncDatasEvent)
    ipc.removeListener("toggle-nav",this.toggleNavEvent)
    ipc.removeListener("switch-fullscreen",this.switchFullscreenEvent)
    ipc.removeListener("get-window-state",this.getWinStateEvent)
    ipc.removeListener("get-focused-webContent",this.getFocusedWebContent)

    PubSub.unsubscribe(this.tokenAlign)

    for(let[tab,key,val] of this.tabEvents){
      tab.removeListener(key,val)
    }
  }

  notifyChange(date){
    this.nc = date
  }

  parseRestoreDate(node,obj){
    if(node.l.tabs) {
      obj.l = [node.l.key,node.l.tabs]
    }
    else{
      obj.l = {}
      this.parseRestoreDate(node.l,obj.l)
    }
    if(!node.r){}
    else if (node.r.tabs) {
      obj.r = [node.r.key,node.r.tabs]
    }
    else{
      obj.r = {}
      this.parseRestoreDate(node.r,obj.r)
    }

    obj.dirc = node.dirc
    obj.size = node.size
    obj.pd = node.pd
    obj.key = node.key
    obj.toggleNav = node.toggleNav

    return obj
  }

  allKeysAndTabs(node=this.state.root,arr,order){
    this._allKeysAndTabs(node,arr,order)
    for (var [key, value] of this.state.floatPanels.entries()) {
      order[0] = order[0]+1
      const tabs = this.refs2[key].getTabsInfo()
      arr.push({order:order[0],key,tabs})
    }

  }
  _allKeysAndTabs(node=this.state.root,arr,order){
    if (!Array.isArray(node.l) && node.l instanceof Object) {
      order[0] = order[0]+1
      this._allKeysAndTabs(node.l,arr,order)
    }
    else{
      if(node.l){
        order[0] = order[0]+1
        const key = node.l[0]
        const tabs = this.refs2[key].getTabsInfo()
        arr.push({order:order[0],key,tabs})
      }
    }
    if (!Array.isArray(node.r) && node.r instanceof Object) {
      order[0] = order[0]+1
      this._allKeysAndTabs(node.r,arr,order)
    }
    else{
      if(node.r){
        order[0] = order[0]+1
        const key = node.r[0]
        const tabs = this.refs2[key].getTabsInfo()
        arr.push({order:order[0],key,tabs})
      }
    }
    return arr
  }

  allKeys(node,arr){
    if (!Array.isArray(node.l) && node.l instanceof Object) {
      this.allKeys(node.l,arr)
    }
    else{
      if(node.l) arr.push(node.l[0])
    }
    if (!Array.isArray(node.r) && node.r instanceof Object) {
      this.allKeys(node.r,arr)
    }
    else{
      if(node.r) arr.push(node.r[0])
    }
    return arr
  }

  jsonfyiable(node,obj,saved=false){
    if (!Array.isArray(node.l) && node.l instanceof Object) {
      obj.l = {}
      this.jsonfyiable(node.l,obj.l,saved)
    }
    else{
      obj.l = node.l ? node.l[0] : node.l
    }
    if (!Array.isArray(node.r) && node.r instanceof Object) {
      obj.r = {}
      this.jsonfyiable(node.r,obj.r,saved)
    }
    else{
      obj.r = node.r ? node.r[0] : node.r
    }

    obj.dirc = node.dirc
    obj.size = node.size
    obj.pd = node.pd
    obj.key = node.key
    obj.toggleNav = node.toggleNav

    if(saved){
      const refKey = `pane_${obj.key}`
      if(this.refs[refKey]){
        obj.size = this.refs[refKey].state.size || obj.size
      }

      if(typeof obj.l === "string"){
        // obj.l = [obj.l,[]]
        obj.l = {key:obj.l, tabs:this.refs2[obj.l].state.tabs.map(tab=>{return {tabKey:tab.key, url:tab.page.navUrl, pin:!!tab.pin}}).filter(x=> x.tabKey !== undefined)}
      }

      if(typeof obj.r === "string"){
        // obj.r = [obj.r,[]]
        obj.r = {key:obj.r, tabs:this.refs2[obj.r].state.tabs.map(tab=>{return {tabKey:tab.key, url:tab.page.navUrl, pin:!!tab.pin}}).filter(x=> x.tabKey !== undefined)}
      }
    }

    return obj
  }

  _split(node,key,direction,pos,tabs,index,params){
    let flag = false
    if(!Array.isArray(node.l) && node.l instanceof Object){
      flag = this._split(node.l,key,direction,pos,tabs,index,params)
      if(flag) return flag
    }
    else{
      if(node.l[0] == key){
        if(node.p || node.r) {
          console.log("add right")
          node.l = pos == 1 ? {dirc: direction, size: '50%', l: node.l, r: [getUuid(), [], tabs, index,params], p: node, pd: "l",key:uuid.v4()} :
            {dirc: direction, size: '50%', l:[getUuid(), [], tabs, index,params] , r: node.l, p: node, pd: "l",key:uuid.v4()}
        }
        else{
          console.log("update right")
          Object.assign(node,pos == 1 ? {dirc: direction, size: '50%', l: node.l, r: [getUuid(), [], tabs, index,params], p: null} :
            {dirc: direction, size: '50%', l: [getUuid(), [], tabs, index,params], r:node.l , p: null})
          console.log(node)
        }
        this.setState({})
        PubSub.publish("resize")
        flag = true
        return flag
      }
    }

    if(!Array.isArray(node.r) && node.r instanceof Object){
      flag = this._split(node.r,key,direction,pos,tabs,index,params)
      if(flag) return flag
    }
    else {
      if(node.r[0] == key){
        if(node.p || node.l) {
          console.log("add left")
          node.r = pos == 1 ? {dirc: direction, size: '50%', l: node.r, r: [getUuid(), [], tabs, index,params], p: node, pd: "r",key:uuid.v4()} :
            {dirc: direction, size: '50%', l:[getUuid(), [], tabs, index,params], r:node.r , p: node, pd: "r",key:uuid.v4()}
        }
        else{
          console.log("update left")
          Object.assign(node,pos == 1 ? {dirc: direction, size: '50%', l: [getUuid(), [], tabs, index,params], r: node.r, p: null} :
            {dirc: direction, size: '50%', l: node.r, r:[getUuid(), [], tabs, index,params] , p: null})
        }
        this.setState({})
        PubSub.publish("resize")
        flag = true
        return flag
      }
    }
    return flag
  }

  split(key,direction,pos,tabs,index,params){
    this._split(this.state.root,key,direction,pos,tabs,index,params)
    console.log(this.state.root)
  }

  fixedPanelCloseHook(key,node){
    if(!isFixedPanel(key)) return
    const direction = key.match(/^fixed-(left|right)/) ? "v" : "h"
    const panel = this.refs[`pane_${node.key}`]

    const refSize = panel.getSize()
    const wholeSize = direction == "v" ? refSize.width : refSize.height
    const otherSize = direction != "v" ? refSize.width : refSize.height
    const size = key.match(/^fixed-left/) ? panel.state.size : wholeSize - panel.state.size
    console.log(wholeSize,size)
    PubSub.publish("resizeWindow",direction == "v" ? {old_w:wholeSize - size,new_w:wholeSize,old_h:otherSize,new_h:otherSize} : {old_w:otherSize,new_w:otherSize,old_h:wholeSize - size,new_h:wholeSize})

  }


  _close(node,parent,key){
    let flag = false
    if(!Array.isArray(node.l) && node.l instanceof Object){
      flag = this._close(node.l,node,key)
      if(flag) return flag
    }
    else{
      if(node.l[0] == key){
        if(parent){
          node.r.p = parent
          node.r.pd = node.pd
          parent[node.pd] = node.r
          return this.fixedPanelCloseHook.bind(this,key,node)
        }
        else if(!Array.isArray(node.r) && node.r instanceof Object){
          node.r.toggleNav = node.toggleNav
          node.r.p = null
          node.r.pd = "l"
          this.state.root = node.r
          return this.fixedPanelCloseHook.bind(this,key,node)
        }
        else{
          node.l = node.r
          if(node.l) node.l.pd = "l"
          node.r = null
          node.size = '100%'
          PubSub.publish("resizeWindow",{})
        }
        flag = true
        return flag
      }
    }

    if(!Array.isArray(node.r) && node.r instanceof Object){
      flag = this._close(node.r,node,key)
      if(flag) return flag
    }
    else {
      if (node.r[0] == key) {
        if(parent){
          node.l.p = parent
          node.l.pd = node.pd
          parent[node.pd] = node.l
          return this.fixedPanelCloseHook.bind(this,key,node)
        }
        else if(!Array.isArray(node.l) && node.l instanceof Object){
          node.l.toggleNav = node.toggleNav
          node.l.p = null
          node.l.pd = "l"
          this.state.root = node.l
          return this.fixedPanelCloseHook.bind(this,key,node)
        }
        else{
          node.r = null
          node.size = '100%'
          PubSub.publish("resizeWindow",{})
        }
        flag = true
        return flag
      }
    }
    return flag
  }

  close(key){
    this.prevState = this.jsonfyiable(this.state.root,{},true)
    console.log(this.state.root)

    const isLeft = key.match(/^fixed-left/)
    const rightKey = this.getFixedPanelKey('right')
    let rightSize
    const right = this.getKeyPosition(rightKey,this.state.root,true)
    if(isLeft && right){
      const panel = this.refs[`pane_${right.node.key}`]

      const wholeSize = panel.getSize().width
      // const otherSize = refSize.height
      rightSize = wholeSize - panel.state.size
    }

    const ret = this._close(this.state.root,null,key)
    console.log(ret,this.state.root)
    if(typeof ret == "function") {
      ret()
    }
    this.setState({},_=>{
      if(isLeft){
        const rightKey = this.getFixedPanelKey('right')
        const right = this.getKeyPosition(rightKey,this.state.root,true)
        if(right){
          const panel = this.refs[`pane_${right.node.key}`]
          const wholeSize = panel.getSize().width
          panel.sizeChange(wholeSize - rightSize)
        }
      }
    })
  }

  closeFloat(key){
    this.state.floatPanels.delete(key)
    this.setState({})
  }

  _getDepth(node,dirc,map){
    if (!Array.isArray(node.l) && node.l instanceof Object) {
      map.set(node.key,this._getDepthCount(node.l,0,dirc))
      this._getDepth(node.l,dirc,map)
    }
    else{
      map.set(node.key,1)
    }
    if (!Array.isArray(node.r) && node.r instanceof Object) {
      this._getDepth(node.r,dirc,map)
    }
  }

  _getDepthCount(node,num,dirc){
    let ret_l = 1, ret_r = 1
    if(node.dirc == dirc) {
      if (!Array.isArray(node.l) && node.l instanceof Object) {
        ret_l = this._getDepthCount(node.l, num + 1,dirc)
      }
      if (!Array.isArray(node.r) && node.r instanceof Object) {
        ret_r = this._getDepthCount(node.r, num + 1,dirc)
      }
      console.log(ret_l,ret_r,ret_l+ret_r)
      return ret_l + ret_r
    }
    else{
      if (!Array.isArray(node.l) && node.l instanceof Object) {
        ret_l = this._getDepthCount(node.l, num + 1,dirc)
      }
      if (!Array.isArray(node.r) && node.r instanceof Object) {
        ret_r = this._getDepthCount(node.r, num + 1,dirc)
      }
      return Math.max(ret_l,ret_r)
    }
  }

  getNotFixedPanel(node){
    if(!((node.l && Array.isArray(node.l) && isFixedPanel(node.l[0]))||(node.r && Array.isArray(node.r) && isFixedPanel(node.r[0])))){
      return node
    }
    else if(!Array.isArray(node.l) && node.l instanceof Object){
      return this.getNotFixedPanel(node.l)
    }
    else if(!Array.isArray(node.r) && node.r instanceof Object){
      return this.getNotFixedPanel(node.r)
    }

    return node
  }

  getDepth(){
    let node = this.getNotFixedPanel(this.state.root)

    const defaultVal = [node.dirc == "v" ? 1 : 0,node.dirc == "h" ? 1 : 0]
    const map = new Map(),
      map_v = new Map(),
      map_h = new Map()

    this._getDepth(node,"v",map_v)
    this._getDepth(node,"h",map_h)

    for (let [key, val] of map_v) {
      map.set(key,[val,map_h.get(key)])
    }

    map.set("max",[this._getDepthCount(node,0,"v"),this._getDepthCount(node,0,"h")])
    console.log(map)
    return map
  }

  _getScrollPriorities(node,results){
    if(!Array.isArray(node.l) && node.l instanceof Object){
      results = this._getScrollPriorities(node.l,results)
    }
    else{
      const ele = ReactDOM.findDOMNode(this.refs2[node.l[0]])
      if(ele && !isFixedPanel(node.l[0])) results.push([node.l[0],ele.getBoundingClientRect()])
    }
    if(!Array.isArray(node.r) && node.r instanceof Object){
      results = this._getScrollPriorities(node.r,results)
    }
    else if(node.r){
      const ele = ReactDOM.findDOMNode(this.refs2[node.r[0]])
      if(ele && !isFixedPanel(node.r[0])) results.push([node.r[0],ele.getBoundingClientRect()])
    }
    return results
  }

  getScrollPriorities(scrollbar=0,dirc=1){
    let jsonState,now
    if(this.nc===this.prevNc){
      now = Date.now()
      if(now - this.prevGetScrollDate < 200){
        this.prevGetScrollDate = now
        return this.prevGetScroll
      }

      this.prevGetScrollDate = now
      jsonState = JSON.stringify(this.jsonfyiable(this.state.root,{}))
      console.log(jsonState)
      if(jsonState === this.prevGetScrollState){
        return this.prevGetScroll
      }
    }
    const browserNav = document.querySelector(".browser-navbar:not(.fixed-panel) .navbar-margin")
    const modify = document.querySelector(".rdTabBar").offsetHeight + (browserNav.style.width != "0px" ? 0 : browserNav.offsetHeight)
    console.log(3300,modify)
    const arr = this._getScrollPriorities(this.state.root,[])

    arr.sort((a,b)=> a[1].left == b[1].left ? a[1].top > b[1].top : dirc * a[1].left < dirc * b[1].left ? -1 : 1)
    let accum = 0
    // arr.forEach(x=>{
    //   console.log(`${x[1].left}\t${x[1].top}\t${x[0]}\t${x[2]}`)
    // })
    const ret = arr.map((x,i)=>{
      const delta = x[1].height - modify - scrollbar
      accum += delta - (i>0 ? MARGIN : 0)
      return [...x,accum - delta, x[1].height - modify - scrollbar]
    })
    ret[0][4] = accum - MARGIN

    this.prevGetScroll = ret
    this.prevGetScrollState = jsonState || JSON.stringify(this.jsonfyiable(this.state.root,{}))
    this.prevGetScrollDate = now || Date.now()
    this.prevNc = this.nc

    return ret
  }

  checkTopRight(obj,i) {
    return (obj.r && obj.l && (obj.dirc == "v" && (i == 1 || this.hidePanels[obj.r[0]]) ) || (obj.dirc == "h" && i == 0)) || !(obj.r && obj.l);
  };


  getKeyPosition(key,node=this.state.root,startsWith=false){
    let ret = false
    if(!Array.isArray(node.l) && node.l instanceof Object){
      ret = this.getKeyPosition(key,node.l,startsWith)
      if(ret) return ret
    }
    else{
      if(startsWith ? node.l[0].startsWith(key) : node.l[0] == key){
        return {node, dirc:"l"}
      }
    }

    if(!Array.isArray(node.r) && node.r instanceof Object){
      ret = this.getKeyPosition(key,node.r,startsWith)
      if(ret) return ret
    }
    else {
      if(node.r && (startsWith ? node.r[0].startsWith(key) : node.r[0] == key)){
        return {node, dirc:"r"}
      }
    }

    return ret
  }

  _getOpposite(node){
    let flag = false
    if(!node) return node
    else if(Array.isArray(node)){
      return node[0]
    }
    else if(!Array.isArray(node.l) && node.l instanceof Object){
      flag = this._getOpposite(node.l)
      if(flag) return flag
    }
    else{
      return node.l[0]
    }
  }

  getOpposite(key){
    const obj = this.state.root
    const ret = this.getKeyPosition(key,obj)
    const {node,dirc} = ret || {}
    return this._getOpposite(node[dirc=="l" ? "r" : "l"])
  }

  getPrevFocusPanel(k){
    const eles = []
    for(let ele of [...global.lastMouseDownSet.keys()].reverse()){
      eles.push(ele)
      if (ele.tagName == 'BODY') {
      }
      else if(ele.tagName == 'WEBVIEW'){
        const key = ele.className.slice(1)
        if(k != key && !isFixedPanel(key)){
          global.lastMouseDownSet  = new Set(eles.reverse())
          return this.getAllKey().includes(key) ? key : false
        }
      }
      else{
        const closestElement = ele.closest(".split-window")
        if (closestElement) {
          const key = closestElement.classList[1].slice(1)
          if(k != key && !isFixedPanel(key)){
            global.lastMouseDownSet  = new Set(eles.reverse())
            return this.getAllKey().includes(key) ? key : false
          }
        }
      }
    }
    return false
  }


  toggleDirc(key){
    const obj = this.state.root
    const {node,_} = this.getKeyPosition(key,obj)
    if(node.r === null) return
    node.dirc = node.dirc == "v" ? "h" : "v"
    this.setState({})

    const keys = []
    this.allKeys(this.state.root,keys)
    for(let key of keys){
      if(this.refs2[key]) this.refs2[key].setState({})
    }
  }

  getAllKey(){
    const keys = []
    this.allKeys(this.state.root,keys)
    console.log(keys)
    return keys
  }

  swapPosition(key){
    const obj = this.state.root
    const {node,_} = this.getKeyPosition(key,obj)
    if(node.r === null) return
      ;[node.l,node.r] = [node.r,node.l]
    node.l.pd = "l"
    node.r.pd = "r"
    this.setState({})
    this.refs[`pane_${node.key}`].swapPosition()
  }

  getFixedPanelKey(dirc){
    return `fixed-${dirc}`
  }

  isExistsFixedPanel(dirc){
    return this.getKeyPosition(this.getFixedPanelKey(dirc),this.state.root,true)
  }

  addFixedPanel(direction,pos,node=this.state.root){
    const fixedKey = this.getFixedPanelKey(direction == "v" ? pos == 1 ? "right" :"left" : pos == 1 ? "bottom" : "top") + `-${Math.random()}_${count++}`

    const ref = this.refs[`pane_${node.key}`].state
    const refSize = this.refs[`pane_${node.key}`].getSize()
    console.log(145,ref)
    const wholeSize = direction == "v" ? refSize.width : refSize.height
    const otherSize = direction != "v" ? refSize.width : refSize.height
    PubSub.publishSync("resizeWindow",direction == "v" ? {old_w:wholeSize,new_w:wholeSize - 200,old_h:otherSize,new_h:otherSize} : {old_w:otherSize,new_w:otherSize,old_h:wholeSize,new_h:wholeSize - 200})

    if(node.r){
      const fpanels = this.existsAllFixedPanel()
      const refSize = typeof (ref.size) == "string" && ref.size.includes("%") ? Math.round(wholeSize * parseInt(ref.size) / 100) : ref.size
      if(pos == 1){
        const newSize = wholeSize - 201
        console.log(1,fpanels.left,newSize,fpanels.left > 0 ? refSize : refSize * newSize / wholeSize)
        // node.size = fpanels.left > 0 ? refSize : refSize * newSize / wholeSize
        console.log(57,node.size,newSize)
        node = {dirc: direction, size:newSize , l:node ,r: [fixedKey,[]],p: null,key:uuid.v4(),toggleNav:node.toggleNav}
        node.l.p = node
        node.l.pd = "l"
      }
      else{
        console.log(2,fpanels.right)
        if(fpanels.right > 0) node.size = (wholeSize - 200) - (wholeSize - refSize)
        console.log(node.size)
        node = {dirc: direction, size: 200, l: [fixedKey,[]],r: node,p: null,key:uuid.v4(),toggleNav:node.toggleNav}
        node.r.p = node
        node.r.pd = "r"
      }
      this.state.root = node
    }
    else{
      Object.assign(node,pos == 1 ? {dirc: direction, size: wholeSize - 201, l: node.l, r: [fixedKey, []], p: null} :
        {dirc: direction, size: 200, l: [fixedKey, []], r:node.l , p: null})
    }
    this.setState({})
    console.log(444,node.r,pos,wholeSize,ref.size)
    PubSub.publishSync("resizeWindow",direction == "v" ? {old_w:wholeSize,new_w:wholeSize,old_h:otherSize,new_h:otherSize} : {old_w:otherSize,new_w:otherSize,old_h:wholeSize,new_h:wholeSize})


  }

  fixedPanelOpen({dirc}){
    let n
    switch(dirc){
      case "top":
      case "bottom":
        if((n = this.isExistsFixedPanel(dirc))){
          const key = n.node[n.dirc][0]
          this.hidePanel(key)
          return
        }
        this.addFixedPanel("h",dirc=="top" ? -1 : 1)
        break
      case "left":
      case "right":
        if((n = this.isExistsFixedPanel(dirc))){
          const key = n.node[n.dirc][0]
          this.hidePanel(key)
          return
        }
        this.addFixedPanel("v",dirc=="left" ? -1 : 1)
        break
    }
  }

  existsAllFixedPanel(){
    const obj = {}
    ;["top","bottom","left","right"].forEach(x=>{
      const {node,_} = this.isExistsFixedPanel(x)
      const ref = node ? this.refs[`pane_${node.key}`].state : {}
      const size = node ? this.refs[`pane_${node.key}`].getSize() : {}
      console.log('existsAllFixedPanel',x,ref)
      obj[x] = node ? (x == "top" || x == "left") ? ref.size :
        (x=="bottom" ? size.height : size.width) - ref.size : 0
      if(obj[x] == "0%") obj[x] = 0
    })
    return obj
  }

  hidePanel(key){
    const direction = key.match(/^fixed-(left|right)/) ? "v" : "h"

    const obj = this.state.root
    const ret = this.getKeyPosition(key,obj)
    const panel = this.refs[`pane_${ret.node.key}`]

    const refSize = panel.getSize()
    const wholeSize = direction == "v" ? refSize.width : refSize.height
    const otherSize = direction != "v" ? refSize.width : refSize.height
    let size


    const getSize = localStorage.getItem(key)
    if(getSize){
      size = getSize == "0%" ? 200 : getSize.includes("%") ? getSize : parseInt(getSize)
      PubSub.publishSync("resizeWindow",direction == "v" ? {old_w:wholeSize,new_w:wholeSize - size,old_h:otherSize,new_h:otherSize} : {old_w:otherSize,new_w:otherSize,old_h:wholeSize,new_h:wholeSize - size})
      panel.sizeChange(size,false)
      localStorage.removeItem(key)
      this.setState({})
    }
    else{
      localStorage.setItem(key,panel.state.size)
      size = key.match(/^fixed-left/) ? panel.state.size : wholeSize - panel.state.size
      panel.sizeChange(ret.dirc == "l" ? 0 : 100,true)
      this.setState({})
      PubSub.publish("resizeWindow",direction == "v" ? {old_w:wholeSize - size,new_w:wholeSize,old_h:otherSize,new_h:otherSize} : {old_w:otherSize,new_w:otherSize,old_h:wholeSize - size,new_h:wholeSize})
    }
  }

  deleteAttach(){
    delete this.state.root.attach
    this.setState({})
  }

  addFloatPanel(tabs,index){
    const key = this.getFixedPanelKey('float') + `-${Math.random()}_${count++}`
    this.state.floatPanels.set(key,[key, [], tabs, index,(void 0)])
    this.setState({})
  }

  recur(obj,order,isTopRight,isFindIsTopLeft){
    let preFixed
    return (<SplitPane order={order} key={obj.key} k={obj.key} ref={`pane_${obj.key}`} split={obj.dirc == "v" ? "vertical" : "horizontal"}
                       size={obj.size} onChange={()=>{PubSub.publish("resize");}} onDragStarted={()=>{this.resize = false} } node={obj}
                       onDragFinished={ ()=>{this.resize = true;PubSub.publish("resize")}} notifyChange={::this.notifyChange}
                       existsAllFixedPanel={::this.existsAllFixedPanel}>
      {(obj.r && obj.l ? [obj.l,obj.r] : obj.l ? [obj.l,null] : obj.r ? [obj.r,null] : []).map((x,i)=>{

        if(x===null){
          return <div className="split-window" key="null"/>
        }
        else if(!Array.isArray(x) && x instanceof Object){
          return this.recur(x,order+1,this.checkTopRight(obj,i) ? isTopRight : false,isFindIsTopLeft)
        }
        else{
          let isTopLeft = false
          if(!isFindIsTopLeft.val){
            isFindIsTopLeft.val = isTopLeft = !isFixedPanel(x[0])
            if(isTopLeft) this.isTopLeft = x[0]
          }
          return <div className={`split-window s${x[0]}`} key={x[0]}>
            <TabPanel isTopRight={this.checkTopRight(obj,i)  ? isTopRight : false}
                      isTopLeft={isTopLeft} k={x[0]} ref={x[0]}
                      key={x[0]} node={x} split={::this.split} close={::this.close}
                      getScrollPriorities={::this.getScrollPriorities} child={x[1]}
                      toggleNav={this.state.root.toggleNav} parent={this} getOpposite={::this.getOpposite} getPrevFocusPanel={::this.getPrevFocusPanel} addFloatPanel={::this.addFloatPanel}
                      toggleDirc={::this.toggleDirc} swapPosition={::this.swapPosition} getAllKey={::this.getAllKey}
                      currentWebContents={this.currentWebContents} htmlContentSet={this.htmlContentSet}
                      fixedPanelOpen={::this.fixedPanelOpen} hidePanel={::this.hidePanel} windowId={this.windowId}
                      attach={this.state.root.attach && {delete: ::this.deleteAttach,data:this.state.root.attach}}
            />
          </div>
        }
      })}
    </SplitPane>)
  }

  renderFloatPanel(x){
    return  <FloatPanel k={x[0]} key={x[0]} style={{}}>
      <TabPanel isTopRight={false}
                isTopLeft={false} k={x[0]} ref={x[0]}
                key={x[0]} node={x} split={::this.split} close={::this.closeFloat}
                getScrollPriorities={::this.getScrollPriorities} child={x[1]}
                toggleNav={this.state.root.toggleNav} parent={this} addFloatPanel={::this.addFloatPanel}
                getAllKey={::this.getAllKey} float={true}
                currentWebContents={this.currentWebContents} htmlContentSet={this.htmlContentSet}
                fixedPanelOpen={::this.fixedPanelOpen} hidePanel={::this.hidePanel} windowId={this.windowId}
                attach={this.state.root.attach && {delete: ::this.deleteAttach,data:this.state.root.attach}}
      />
    </FloatPanel>
  }

  //
  render() {
    const arr = []
    for (var [key, value] of this.state.floatPanels.entries()) {
      arr.push(this.renderFloatPanel(value))
    }
    return <div>
      {this.recur(this.state.root,0,true,{val:false})}
      <div>{arr}</div>
    </div>
  }
}
