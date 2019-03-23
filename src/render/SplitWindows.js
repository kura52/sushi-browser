const React = require('react')
const ReactDOM = require('react-dom')
const {Component} = React
import localForage from "../LocalForage";
const SplitPane = require('./split_pane/SplitPane')
const TabPanel = require("./TabPanel")
const PubSub = require('./pubsub')
const uuid = require("node-uuid")
const ipc = require('electron').ipcRenderer
const {remote} = require('electron')
const {BrowserWindow} = remote
const mainState = require('./mainStateRemote')
import MenuOperation from './MenuOperation'
import url from 'url'
import VerticalTabPanel from './VerticalTabPanel'
const FloatPanel = require('./FloatPanel')
const FindPanel = require('./FindPanel')
const {token} = require('./databaseRender')
const PanelOverlay = require('./PanelOverlay')
const DownloadList = require("./DownloadList")
import firebase,{storage,auth,database} from 'firebase'
const sharedState = require('./sharedState')
const getTheme = require('./theme')
let [MARGIN,verticalTabPosition,themeInfo,autoDeleteDownloadList,enableDownloadList] = ipc.sendSync('get-sync-main-states',['syncScrollMargin','verticalTabPosition','themeInfo','autoDeleteDownloadList','enableDownloadList'])
sharedState.theme = themeInfo
sharedState.autoDeleteDownloadList = autoDeleteDownloadList

function setStyle(){
  const s = document.createElement('style')
  s.setAttribute('type', 'text/css')
  s.setAttribute('id', 'style_element_')
  const style =  `.rdTabAddButton:hover {
    background-image: ${`${getTheme('images','theme_tab_background')} !important` || 'none'};
    opacity: 0.8;
}
${sharedState.theme.tints && sharedState.theme.tints.buttons ? `.browser-navbar a {
    color: hsl(${sharedState.theme.tints.buttons[0] * 360},${sharedState.theme.tints.buttons[1] * 100}%,${sharedState.theme.tints.buttons[2] * 100}%);
}` : ''}
.ui.blue.segment:not(.inverted) {
    border-image: ${getTheme('images','theme_toolbar') || getTheme('images','theme_frame')} 15 round;
}
.ui.horizontal.segments {
    ${getTheme('colors','toolbar') ? `background-colospr: ${getTheme('colors','toolbar')}` : ''};
    ${getTheme('colors','bookmark_text') ? `color: ${getTheme('colors','bookmark_text')}` : ''};
}
.ui.blue.segment>.folder-open, .ui.blue.segment>.folder {
    color: ${getTheme('colors','bookmark_text')||'black'};
}`
  s.appendChild(document.createTextNode(style));
  document.head.appendChild(s)
}

if(sharedState.theme){
  setStyle()
}


let count = 0
// ipc.setMaxListeners(0)
const isDarwin = navigator.userAgent.includes('Mac OS X')

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

function insertCss(colors){
  const s = document.createElement('style');
  s.setAttribute('type', 'text/css');
  s.appendChild(document.createTextNode());
  document.head.appendChild(s)
}

function isFixedPanel(key){
  return key.startsWith('fixed-')
}

function getUuid(){
  console.log(count)
  return `${Date.now()}_${uuid.v4()}_${count++}`
}


function getPanelId(key) {
  const keySplit = key.split("_")
  // setInterval(_=>console.log(console.log('getPanleIdd',key,keySplit[keySplit.length-1])),10)
  return parseInt(keySplit[keySplit.length - 1]);
}

function getWebContents(tab){
  if(!tab.wv || !tab.wvId) return
  return global.currentWebContents[tab.wvId]
}

function getParam() {
  if (window.location.search.length < 2) return

  const parameters = window.location.search.substring(1).split('&')
  const result = {}
  for (let param of parameters) {
    const element = param.split('=')
    const paramName = decodeURIComponent(element[0])
    const paramValue = decodeURIComponent(element[1])

    result[paramName] = paramValue
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

function equallyDivide(x,n){
  return [...new Array(n)].map((v,i) => Math.floor((x+i)/n))
}

function removeEvents(ipc,events){
  for (var key in events) {
    if (events.hasOwnProperty(key)) {
      const value = events[key]
      ipc.removeListener(key,value)
    }
  }
}


export default class SplitWindows extends Component{
  initBind(){
    this.split = ::this.split
    this.close = ::this.close
    this.getScrollPriorities = ::this.getScrollPriorities
    this.getOpposite = ::this.getOpposite
    this.getPrevFocusPanel = ::this.getPrevFocusPanel
    this.addFloatPanel = ::this.addFloatPanel
    this.toggleDirc = ::this.toggleDirc
    this.swapPosition = ::this.swapPosition
    this.getAllKey = ::this.getAllKey
    this.getKeyPosition = ::this.getKeyPosition
    this.fixedPanelOpen = ::this.fixedPanelOpen
    this.hidePanel = ::this.hidePanel
    this.deleteAttach = ::this.deleteAttach
    this.orderingIndexes = ::this.orderingIndexes
    this.closeFloat = ::this.closeFloat
    this.allKeys = ::this.allKeys
    this.arrangePanels = ::this.arrangePanels
    this.arrangePanelKeyDown = ::this.arrangePanelKeyDown
    this.arrangePanelMouseMove = ::this.arrangePanelMouseMove
    this.toggleFindPanel = ::this.toggleFindPanel
  }

  restoreState(param){
    if(!param || !param.tabparam.includes('"winState":')) return

    const setting = JSON.parse(param.tabparam)
    let winState = {}
    const _winState = setting.winState
    if(_winState.l){
      winState = this.parseRestoreDate(_winState,{},true)
      const maxState = {width: setting.width, height: setting.height, maximize: setting.maximize,
        maxWidth: setting.maximize && setting.maxBounds.width,maxHeight: setting.maximize && setting.maxBounds.height}

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
    return winState
  }

  constructor(props) {
    super(props)
    this.currentWebContents = {}
    this.tabValues = {}
    this.sizeMap = {}
    this.focused = true
    this.actived = true
    sharedState.tabValues = this.tabValues
    global.currentWebContents = this.currentWebContents
    global.adBlockDisableSite = ipc.sendSync('get-sync-main-state','adBlockDisableSite')
    this.initBind()

    const param = getParam()
    console.log(67,param)

    let winState = this.restoreState(param)
    if(!winState){
      const mState = ipc.sendSync('get-sync-main-state','winState')
      if(mState){
        const _winState = JSON.parse(mState)
        if(_winState.l){
          winState = this.parseRestoreDate(_winState,{})
          const maxState = JSON.parse(ipc.sendSync('get-sync-main-state','maxState'))
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

      if(param){
        console.log(param.tabparam)
        const attach = JSON.parse(param.tabparam)
        if(Array.isArray(attach)){
          winState = {dirc: "v",size: '100%',l: [getUuid(),[]],r: null,p: null,key:uuid.v4(),toggleNav: param.toggle !== (void 0) ? parseInt(param.toggle) : ipc.sendSync('get-sync-main-state','toggleNav') || 0,attach}
          for(let at of winState.attach){
            this.currentWebContents[at.wvId] = ipc.sendSync('get-shared-state-main',at.wvId)
          }
        }
        else{
          if(attach.type == 'new-win'){
            // console.log(3333,{key: getUuid(),tabs: attach.urls.map(({url,privateMode})=>{return {pin:false,tabKey:uuid.v4(),url,privateMode}})})
            winState = this.parseRestoreDate({dirc: "v",size: '100%',l: {key: getUuid(),tabs: attach.urls.map(({url,tabKey,privateMode,guestInstanceId})=>{return {forceKeep:true,pin:false,tabKey:tabKey || uuid.v4(),url,privateMode,guestInstanceId}})},
              r: null,key:uuid.v4(),toggleNav: ipc.sendSync('get-sync-main-state','toggleNav') || 0},{})
            console.log(88888,winState)
          }
          else{
            console.log(33321,attach)
            const recurDivide = (urls,percentages,obj,rest)=>{
              if(urls.length == 0) return

              const url = urls.pop()
              const percent = percentages.pop()
              if(urls.length == 0){
                obj.r = {key: getUuid(),tabs: [{forceKeep:true,pin:false,tabKey:uuid.v4(),url}]}
              }
              else{
                obj.r = {dirc: "v", size: `${percent / rest * 100}%`, l:{key: getUuid(),tabs: [{forceKeep:true,pin:false,tabKey:uuid.v4(),url}]}, r:null , pd: "r",key:uuid.v4()}
              }
              rest = rest - percent
              if(urls.length > 0){
                recurDivide(urls,percentages,obj.r,rest)
              }
            }

            const divide = attach.type == "one-row" ? 1 : attach.type == "two-row" ? 2 : 3
            attach.urls = attach.urls.map(x=>x.url)
            if(attach.urls.length < divide){
              attach.urls = attach.urls.concat(attach.urls).concat(attach.urls).slice(0,divide)
            }

            const divides = equallyDivide(attach.urls.length,divide).reverse()
            let sum = 0
            let arrays = []
            for(let d of divides){
              arrays.push(attach.urls.slice(sum,sum+d))
              sum+=d
            }


            let datas
            if(divide == 1){
              const percentages = equallyDivide(100,arrays[0].length)
              const url = arrays[0][0]
              const percent = percentages.pop()
              datas = {dirc: "v",key:uuid.v4(),size: `${percent}%`,l: {key: getUuid(),tabs: [{forceKeep:true,pin:false,tabKey:uuid.v4(),url}]}, r: null}
              recurDivide(arrays[0].slice(1).reverse(),percentages,datas,100 - percent)
            }
            else if(divide == 2){
              const percentages = equallyDivide(100,arrays[0].length)
              const url = arrays[0][0]
              const percent = percentages.pop()

              const percentages2 = equallyDivide(100,arrays[1].length)
              const url2 = arrays[1][0]
              const percent2 = percentages2.pop()

              datas = {dirc: "h",key:uuid.v4(),size: '50%',l: {dirc: "v",key:uuid.v4(),size: `${percent}%`,pd:"l",l: {key: getUuid(),tabs: [{forceKeep:true,pin:false,tabKey:uuid.v4(),url}]}, r: null},
                r: {dirc: "v",key:uuid.v4(),size: `${percent2}%`,pd:"r",l: {key: getUuid(),tabs: [{forceKeep:true,pin:false,tabKey:uuid.v4(),url:url2}]}, r: null}}

              recurDivide(arrays[0].slice(1).reverse(),percentages,datas.l,100 - percent)
              recurDivide(arrays[1].slice(1).reverse(),percentages2,datas.r,100 - percent2)
              if(datas.l.r===null){
                datas.l = datas.l.l
                datas.l.pd = "l"
              }
              if(datas.r.r===null){
                datas.r = datas.r.l
                datas.r.pd = "r"
              }
            }
            else{
              const percentages = equallyDivide(100,arrays[0].length)
              const url = arrays[0][0]
              const percent = percentages.pop()

              const percentages2 = equallyDivide(100,arrays[1].length)
              const url2 = arrays[1][0]
              const percent2 = percentages2.pop()

              const percentages3 = equallyDivide(100,arrays[2].length)
              const url3 = arrays[2][0]
              const percent3 = percentages3.pop()

              datas = {dirc: "h",key:uuid.v4(),size: '33%',
                l: {dirc: "v",key:uuid.v4(),size: `${percent}%`,pd:"l",l: {key: getUuid(),tabs: [{forceKeep:true,pin:false,tabKey:uuid.v4(),url}]}, r: null},
                r: {dirc: "h",key:uuid.v4(),size: '49%',pd:"r",
                  l: {dirc: "v",key:uuid.v4(),size: `${percent2}%`,pd:"l",l: {key: getUuid(),tabs: [{forceKeep:true,pin:false,tabKey:uuid.v4(),url:url2}]}, r: null},
                  r: {dirc: "v",key:uuid.v4(),size: `${percent3}%`,pd:"r",l: {key: getUuid(),tabs: [{forceKeep:true,pin:false,tabKey:uuid.v4(),url:url3}]}, r: null}}}
              recurDivide(arrays[0].slice(1).reverse(),percentages,datas.l,100 - percent)
              recurDivide(arrays[1].slice(1).reverse(),percentages2,datas.r.l,100 - percent2)
              recurDivide(arrays[2].slice(1).reverse(),percentages3,datas.r.r,100 - percent3)
              if(datas.l.r===null){
                datas.l = datas.l.l
                datas.l.pd = "l"
              }
              if(datas.r.l.r===null){
                datas.r.l = datas.r.l.l
                datas.r.l.pd = "l"
              }
              if(datas.r.r.r===null){
                datas.r.r = datas.r.r.l
                datas.r.r.pd = "r"
              }
            }
            console.log(3443333,datas)
            winState = this.parseRestoreDate({...datas,toggleNav: ipc.sendSync('get-sync-main-state','toggleNav') || 0},{})

          }
        }
      }
    }

    console.log(22222222222222,winState)
    if(winState) winState.key = uuid.v4()
    // const root = {dirc: "v",size: 50,l: [getUuid(),[]],r: [getUuid(),[]],p: null,key:uuid.v4(),toggleNav: 0}
    const root = winState || {dirc: "v",size: '100%',l: [getUuid(),[]],r: null,p: null,key:uuid.v4(),toggleNav: ipc.sendSync('get-sync-main-state','toggleNav') || 0}
    // root.l = {dirc: "h",size: 50,l: [getUuid(),[]],r: [getUuid(),[]],p: root, pd: "l",key:uuid.v4()}
    this.state = {root,floatPanels: new Map(),verticalTabPosition}
    this.refs2 = {}
    this.prevGetScrollState = JSON.stringify({})
    this.prevGetScrollDate = 0
    this.nc = Date.now()
    this.prevNc = 0
    this.htmlContentSet = new Set()
    this.windowId = remote.getCurrentWindow().id
    this.hidePanels = {}
    this.preIndexes = {}
  }


  componentDidMount() {
    this.pageUpdate = (e,tabId)=> {
      // console.log(tab.getTitle())
      const keys = []
      this.allKeys(this.state.root,keys)
      for(let key of keys){
        this.refs2[key].updateTitle(tabId)
      }
    }
    ipc.on('page-title-updated',this.pageUpdate)

    this.getResponseDetails = (e, record) => {
      PubSub.publish('rich-media-insert',record)
    }
    ipc.on('did-get-response-details', this.getResponseDetails)


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
        console.log(33343,key,bTime)
        if(key > bTime){
          const url = await storageRef.child(`${key}.gz`).getDownloadURL()
          fetch(url).then(response=>{
            return response.blob();
          }).then(blob=>{
            const reader = new FileReader();
            reader.onload = _=>{ipc.send('sync-datas-to-main',reader.result.split(',')[1], password)}
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
        console.log(email,now)
        token.update({email},{$set: {sync_at: now}}).then(_=>_)
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
      if(!this.menuStickyFlag && e.offsetY < 5){
        this.menuStickyFlag = true
        this.state.root.toggleNav = 3
        this.setState({})
        ipc.send('change-browser-view-z-index', true)
      }
      else if(this.menuStickyFlag && e.offsetY > 80 && !e.target.closest(".navbar-main")){
        this.menuStickyFlag = false
        this.state.root.toggleNav = 2
        this.setState({})
        ipc.send('change-browser-view-z-index', false)
      }
    }
    this.menuSticky = ::this.menuSticky


    this.switchFullscreenEvent = (e,flag)=>{
      if(flag){
        this._toggleNav = this.state.root.toggleNav
        this.state.root.toggleNav = 2
        // mainState.set('toggleNav',2)
        this.tokenMouseMove = PubSub.subscribe('webview-mousemove',(msg,e)=>{
          this.menuSticky(e)
        })
      }
      else{
        this.state.root.toggleNav = this._toggleNav
        // mainState.set('toggleNav',this._toggleNav)
        this._toggleNav = void 0
        PubSub.unsubscribe(this.tokenMouseMove)
      }
      this.setState({})
    }
    ipc.on('switch-fullscreen',this.switchFullscreenEvent)

    this.getWinStateEvent = _=>{
      const keys = this.getAllKey()
      for(let key of keys){
        if(this.refs2[key]){
          const panel = this.refs2[key]
          for(let tab of panel.state.tabs){
            panel._closeBind(tab)
          }
        }
      }

      if(keys.filter(key=>!isFixedPanel(key)).length === 0){
        ipc.send('get-window-state-reply',this.prevState)
      }
      else{
        ipc.send('get-window-state-reply',this.jsonfyiable(this.state.root,{},true))
      }
    }
    ipc.on('get-window-state',this.getWinStateEvent)


    this.getWinStateEvent2 = (e,key)=>{
      ipc.send(`get-window-state2-reply_${key}`,this.jsonfyiable(this.state.root,{},true))
    }
    ipc.on('get-window-state2',this.getWinStateEvent2)

    const self = this
    this.getTab = (activeElement)=>{
      let tab,k
      if (activeElement.tagName == 'BODY') {
      }
      else if(activeElement.dataset.webview){
        k = activeElement.className.slice(1)
        tab = self.refs2[k].getSelectedTab()
      }
      else{
        const closestElement = activeElement.closest(".split-window")
        if (closestElement && closestElement.classList[1]) {
          k = closestElement.classList[1].slice(1)
          tab = self.refs2[k].getSelectedTab()
        }
      }
      return [tab,k]
    }

    this.getTabId = (activeElement)=>{
      const tabInfo = this.getTab(activeElement)
      return tabInfo[0] && tabInfo[0].wvId
    }

    this.getFocusedWebContent = (e,key,needPrivate,needSelectedText,queueGet)=>{
      if(queueGet){
        const tabId = global.openerQueue.shift()
        if(tabId){
          console.log((`get-focused-webContent-reply_${key}`,tabId))
          ipc.send(`get-focused-webContent-reply_${key}`,tabId)
          return
        }
      }
      const act = global.lastMouseDown[0] || document.activeElement //@TODO ELECTRON document.activeElement
      if(needSelectedText && act.tagName == 'INPUT' && act.type == 'text'){
        ipc.send(`get-focused-webContent-reply_${key}`,-1)
        return
      }
      console.log(act,global.lastMouseDown)
      let tabId = this.getTabId(act)

      // if(!tabId && retry > 9){
      //   tabId = this.refs2[this.isTopLeft].getSelectedTabId()
      // }
      console.log(2323,tabId)
      if(needPrivate){
        const keys = []
        this.allKeys(this.state.root,keys)
        for(let key of keys){
          if(this.refs2[key]){
            const tab = this.refs2[key].getTabFromTabId(tabId)
            if(tab){
              ipc.send(`get-focused-webContent-reply_${key}`,tabId,tab)
              break
            }
          }
        }
      }
      else{
        ipc.send(`get-focused-webContent-reply_${key}`,tabId)
      }
    }
    ipc.on('get-focused-webContent',this.getFocusedWebContent)


    this.fullScreenState = (e,isFullscreen)=>{
      this.setState({fullscreen: isFullscreen})
    }
    ipc.on('enter-full-screen',this.fullScreenState)
    ipc.on('leave-full-screen',this.fullScreenState)


    this.eventChromeTabsMoveInner = async (e,sendKey,tabIds,indexOrKey,isBack,selectedTab)=>{
      const isIndex = Number.isFinite(indexOrKey)
      const keys = []
      const oldIndexes = {}
      this.allKeys(this.state.root,keys)
      const map = {}
      let order = 0,indexKey,realIndex
      for(let key of keys){
        let i = 0
        for(let tab of this.refs2[key].state.tabs){
          if(tabIds.includes(tab.wvId)){
            if(map[key]){
              map[key].push([tab,i,order])
            }
            else{
              map[key] = [[tab,i,order]]
            }
            oldIndexes[tab.wvId] = order
          }
          if(isIndex ? indexOrKey == order : indexOrKey == tab.key){
            if(!map[key]){
              map[key] = []
            }
            indexKey = key
            realIndex = i
          }
          i++
          order++
        }
      }

      const keyArr = Object.keys(map)
      if(!indexKey){
        indexKey = keyArr[keyArr.length - 1]
        realIndex = this.refs2[indexKey].state.tabs.length
      }
      let befores = [],afters = [],beforeOthers = [],afterOthers = []

      let isBefore = true
      const funcs = {}
      for(let key of keyArr){
        if(key == indexKey){
          isBefore = false
          continue
        }
        const tabs = this.refs2[key].state.tabs
        const others = isBefore ? beforeOthers : afterOthers
        for(let ele of map[key]){
          const tab = ele[0]
          ipc.send('move-browser-view', key, tab.key, 'detach')
          const n_tab = this.refs2[indexKey].createTab({c_page:tab.page,c_wv:tab.wv,c_div:tab.div,c_key:tab.key,privateMode:tab.privateMode,pin:tab.pin,protect:tab.protect,lock:tab.lock,mute:tab.mute,reloadInterval:tab.reloadInterval,
            rest:{rSession:tab.rSession,wvId:tab.wvId,openlink: tab.openlink,sync:tab.sync,syncReplace:tab.syncReplace,dirc:tab.dirc,ext:tab.ext,oppositeMode:tab.oppositeMode,bind:tab.bind,mobile:tab.mobile,adBlockThis:tab.adBlockThis}})
          others.push([n_tab,ele[1],ele[0]])
        }
        funcs[key] =_=>{
          for(let ele of others.slice(0).reverse()){
            // this.refs2[key].handleTabClose({},ele[0].key)
            if(ele[2].events) removeEvents(ipc,ele[2].events)
            const closeTab = tabs.splice(ele[1],1)[0]
            this.refs2[key].state.selectedTab = this.refs2[key].getNextSelectedTab(ele[0],closeTab,ele[1])
          }
        }
      }


      const tabs = this.refs2[indexKey].state.tabs
      for(let ele of map[indexKey]){
        if(ele[1] < realIndex){
          befores.push(ele)
        }
        else{
          afters.push(ele)
        }
      }
      if(isIndex) realIndex += befores.length

      const befores2 = befores.slice(0).sort((a,b)=>tabIds.findIndex(t=>t==a[0].wvId) > tabIds.findIndex(t=>t==b[0].wvId))
      const afters2 = afters.slice(0).sort((a,b)=>tabIds.findIndex(t=>t==a[0].wvId) > tabIds.findIndex(t=>t==b[0].wvId))


      const range = beforeOthers.length + afterOthers.length + afters.length
      tabs.splice(isBack ? realIndex+1 : realIndex,0,...beforeOthers.map(x=>x[0]),...befores2.map(x=>x[0]),...afters2.map(x=>x[0]),...afterOthers.map(x=>x[0]))
      const tabs2 = tabs.slice(0)
      for(let ele of befores.reverse()){
        tabs.splice(ele[1],1)
      }
      for(let ele of afters.reverse()){
        tabs.splice(ele[1]+range,1)
      }
      this.refs2[indexKey].setState(selectedTab ? {selectedTab} : {},_=>{
        for(let key of keyArr) {
          if(key == indexKey) continue
          const panel = this.refs2[key]
          setTimeout(_=> {
            funcs[key]()
            panel.setState({})
            if (!panel.state.tabs.length) PubSub.publish(`close-panel_${panel.props.k}`, 100)
          },30)
        }
        if(sendKey) ipc.send(`chrome-tabs-move-finished_${sendKey}`)
      })

      const newIndexes = {}
      // order = 0
      let before
      for(let key of keys){
        let i = 0
        for(let tab of this.refs2[key].state.tabs){
          const order = tabIds.findIndex(t=>t == tab.wvId)
          if(order != -1){
            newIndexes[tab.wvId] = [order,before]
          }
          before = tab
          //order++
        }
      }

      for(let [tabId,toIndexes] of Object.entries(newIndexes)){
        tabId = parseInt(tabId)
        ipc.send('chrome-tabs-onMoved-to-main',tabId,{fromIndex:oldIndexes[tabId],toIndex: toIndexes[0]})
        PubSub.publish('tab-moved',{tabId,fromIndex:oldIndexes[tabId],toIndex: toIndexes[0],before: toIndexes[1]})
      }
      // }
    }
    ipc.on('chrome-tabs-move-inner',this.eventChromeTabsMoveInner)



    this.eventChromeTabsMoveDetach = async (e,sendKey,tabIds,winId)=>{
      const keys = []
      const oldIndexes = {}
      this.allKeys(this.state.root,keys)
      const map = {}
      let order = 0
      for(let key of keys){
        let i = 0
        for(let tab of this.refs2[key].state.tabs){
          if(tabIds.includes(tab.wvId)){
            if(map[key]){
              map[key].push([tab,i,order])
            }
            else{
              map[key] = [[tab,i,order]]
            }
            oldIndexes[tab.wvId] = order
          }
          i++
          order++
        }
      }

      const keyArr = Object.keys(map)
      const detaches = []

      for(let key of keyArr){
        const tabs = this.refs2[key].state.tabs
        const datas = []
        for(let ele of map[key]){
          const tab = ele[0]
          const panel = this.refs2[key]
          ipc.send('move-browser-view', key, tab.key, 'detach')
          const d = resolve({wvId:tab.wvId,c_page:tab.page,c_key:tab.key,privateMode:tab.privateMode,tabPreview:tab.tabPreview,pin:tab.pin,freeze:tab.freeze,protect:tab.protect,lock:tab.lock,mute:tab.mute,fields:tab.fields,reloadInterval:tab.reloadInterval,
            rest:{rSession:tab.rSession,wvId:tab.wvId,openlink: tab.openlink,sync:tab.sync,syncReplace:tab.syncReplace,dirc:tab.dirc,ext:tab.ext,oppositeMode:tab.oppositeMode,bind:tab.bind,mobile:tab.mobile,adBlockThis:tab.adBlockThis},guestInstanceId: tab.wvId})

          ipc.send('chrome-tabs-onDetached-to-main',d.wvId,{oldPosition: oldIndexes[d.wvId]})
          detaches.push(ele)
          datas.push(d)
        }

        console.log(434234,datas)
        ipc.send(`chrome-tabs-move-detach-reply_${sendKey}`,datas)
        // setTimeout(_=>{
        //   for(let ele of detaches.reverse()){
        //     if(ele[0].events) removeEvents(ipc,ele[0].events)
        //     const closeTab = tabs.splice(ele[1],1)[0]
        //     this.refs2[key].state.selectedTab = this.refs2[key].getNextSelectedTab(ele[0],closeTab,ele[1])
        //   }
        //   for(let key of keyArr) {
        //     const panel = this.refs2[key]
        //     panel.setState({})
        //     if(!panel.state.tabs.length) panel.props.close(panel.props.k)
        //   }
        //   ipc.send(`chrome-tabs-move-finished_${sendKey}`)
        // },100)
      }
    }
    ipc.on('chrome-tabs-move-detach',this.eventChromeTabsMoveDetach)


    this.eventChromeTabsMoveAttach = (e,index,datas)=>{
      const keys = []
      this.allKeys(this.state.root,keys)
      const map = {}
      let order = 0,indexKey,realIndex
      for(let key of keys){
        let i = 0
        for(let tab of this.refs2[key].state.tabs){
          if(index == order){
            indexKey = key
            realIndex = i
            break
          }
          i++
          order++
        }
      }

      console.log(index,datas,indexKey,realIndex,map)
      const keyArr = keys
      if(!indexKey){
        indexKey = keyArr[keyArr.length - 1]
        realIndex = this.refs2[indexKey].state.tabs.length
      }
      console.log(index,datas,indexKey,realIndex)
      const panel = this.refs2[indexKey]
      const tabs = panel.state.tabs

      const tabIds = new Set()
      for(let data of datas){
        tabIds.add(data.wvId)
        this.currentWebContents[data.wvId] = ipc.sendSync('get-shared-state-main',data.wvId)
        const n_tab = panel.createTab({c_page:data.c_page,c_key:data.c_key,privateMode:data.privateMode,tabPreview:data.tabPreview,pin:data.pin,protect:data.protect,lock:data.lock,mute:data.mute,fields:tab.fields,reloadInterval:tab.reloadInterval,guestInstanceId:data.guestInstanceId,rest:data.rest})
        tabs.splice(realIndex++, 0, n_tab)
      }
      this.refs2[indexKey].setState({})

      // order = 0
      // for(let key of keys){
      //   let i = 0
      //   for(let tab of this.refs2[key].state.tabs){
      //     if(tabIds.has(tab.wvId)){
      //       ipc.send('chrome-tabs-onAttached-to-main',tab.wvId,{newPosition: order})
      //     }
      //     order++
      //   }
      // }
    }
    ipc.on('chrome-tabs-move-attach',this.eventChromeTabsMoveAttach)

    this.eventTabCreate = (e,tabValue)=>{
      this.tabValues[tabValue.id] = (tabValue.url == 'chrome://newtab/' || tabValue.url == 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html') ? void 0 : tabValue.openerTabId
    }
    ipc.on('tab-create',this.eventTabCreate)

    this.eventOpenFixedPanel = (e,url)=>{
      const sideBarDirection = ipc.sendSync('get-sync-main-state','sideBarDirection')
      const n = this.isExistsFixedPanel(sideBarDirection)
      if(n){
        const key = n.node[n.dirc][0]
        const panel = this.refs2[key]
        for(let tab of panel.state.tabs){
          if(tab.page.navUrl == url) return
        }
        ipc.emit('new-tab',null,panel.state.tabs[panel.state.tabs.length - 1].wvId, url)
      }
      else{
        this.addFixedPanel("v",sideBarDirection=="left" ? -1 : 1,void 0,url)
      }
    }

    this.eventCloseFixedPanel = (e,url)=>{
      const sideBarDirection = ipc.sendSync('get-sync-main-state','sideBarDirection')
      const n = this.isExistsFixedPanel(sideBarDirection)
      if(n){
        const key = n.node[n.dirc][0]
        const panel = this.refs2[key]
        for(let tab of panel.state.tabs){
          if(tab.page.navUrl == url){
            panel.handleTabClose({},tab.key)
            return
          }
        }
      }
    }
    ipc.on('open-fixed-panel',this.eventOpenFixedPanel)
    ipc.on('close-fixed-panel',this.eventCloseFixedPanel)


    this.eventVisitStateUpdate = (e,type)=>{
      const prev = this.focused && this.actived
      if(type == 'focus'){
        this.focused = true
        sharedState.inActive = false
        this.setState({})
      }
      else if(type == 'blur'){
        this.focused = false
        sharedState.inActive = true
        this.setState({})
      }
      else if(type == 'idle'){
        this.actived = false
      }
      else{
        this.actived = true
      }

      const current = this.focused && this.actived
      if(prev != current){
        const keys = []
        this.allKeys(this.state.root,keys)
        for(let key of keys){
          if(this.refs2[key]) this.refs2[key].updateIdle(!current)
        }
      }
    }
    ipc.on('visit-state-update', this.eventVisitStateUpdate)

    this.eventUpdateTheme = (e,theme)=>{
      sharedState.theme = theme
      const ele = document.querySelector('#style_element_')

      if(sharedState.theme){
        if(ele) ele.parentNode.removeChild(ele)
        setStyle()
      }
      else if(ele && !sharedState.theme){
        ele.parentNode.removeChild(ele)
      }

      this.setState({})
    }
    ipc.on('update-theme', this.eventUpdateTheme)

    this.eventChromeTabsTabValue = (e, requestId, tabId)=>{
      const keys = []
      this.allKeys(this.state.root,keys)
      let order = 0
      for(let key of keys){
        const tabs = this.refs2[key].state.tabs
        const index = tabs.findIndex(t=>t.wvId == tabId)
        const tab = tabs[index]
        if(tab){
          const active = this.refs2[key].state.selectedTab == tab.key
          const bound = tab.div.getBoundingClientRect()
          e.sender.send(`CHROME_TABS_TAB_VALUE_RESULT_${requestId}`, {
            active,
            favIconUrl: tab.page.favicon,
            height: bound.height,
            incognito: !!tab.privateMode,
            index: order + index,
            highlighted: active,
            pinned: tab.pin,
            selected: active,
            width: bound.width,
          })
          return
        }
        order += tabs.length
      }
      e.sender.send(`CHROME_TABS_TAB_VALUE_RESULT_${requestId}`, {})
    }
    ipc.on('CHROME_TABS_TAB_VALUE', this.eventChromeTabsTabValue)


    this.tokenAlign = PubSub.subscribe("align",(_,e)=>{
      if(!this.state.root.r) return
      const mapDepth = this.getDepth()

      const fixedObj = this.existsAllFixedPanel()
      const wMod = fixedObj.left + fixedObj.right
      const hMod = fixedObj.top + fixedObj.bottom

      console.log("wMod",wMod)
      console.log("hmod",hMod)

      const vTab = document.querySelector('.vertical-tab')
      const w = window.innerWidth - wMod - (vTab ? vTab.offsetWidth : 0)
      const h = window.innerHeight - hMod
      const event = {dirc: e!="v" ? "vertical" : "horizontal",size: e!="v" ? w/mapDepth.get("max")[0]: h/mapDepth.get("max")[1],map:mapDepth}
      PubSub.publish("align-panel",event)
    })

    this.tokenAllDetach = PubSub.subscribe('all-detach',async (_,e)=>{
      const arr = this.getScrollPriorities()
      if(arr.length == 1) return

      const [screenX,screenY] = [window.screenX,window.screenY]
      const bounds = arr.map(ele=>{
        const key = ele[0]
        const panel = this.refs2[key]
        console.log(ReactDOM.findDOMNode(panel))
        console.log(71,ReactDOM.findDOMNode(panel).getBoundingClientRect())
        const bound = ReactDOM.findDOMNode(panel).getBoundingClientRect()
        return {left:Math.round(bound.left)+1,top:Math.round(bound.top)+1,width:Math.round(bound.width)+1,height:Math.round(bound.height)+1}
      })

      let i =0
      for(let ele of arr){
        const key = ele[0]
        const panel = this.refs2[key]
        const b = bounds[i]
        if(i===0){
          MenuOperation.windowResizeForSplit()
          if(isDarwin){
            setTimeout(_=>remote.getCurrentWindow().setBounds({x:b.left+screenX,y:b.top+screenY,width:b.width,height:b.height}),1000)
          }
          else{
            remote.getCurrentWindow().setBounds({x:b.left+screenX,y:b.top+screenY,width:b.width,height:b.height})
          }
        }
        else{
          await panel.detachPanel({x:b.left+screenX,y:b.top+screenY,width:b.width,height:b.height}),20*i
        }
        i++
      }
    })


    this.tokenSetVerticalTabState = PubSub.subscribe('set-vertical-tab-state',(msg,val)=>{
      const updVal = val==this.state.verticalTabPosition ? "none" : val
      this.setState({verticalTabPosition: updVal})
      mainState.set('verticalTabPosition',updVal)
    })

    this.tokenSetState = PubSub.subscribe('set-state-split-window',_=>this.setState({}))

    this.tokenArrange = PubSub.subscribe('toggle-arrange',_=>this.arrangePanels('all'))
    // const self = this
    //
    // this.search = (e)=>{
    //   if (e.srcElement == this && e.ctrlKey && e.keyCode == 70) { // Ctrl+F
    //     const winInfos = self.getScrollPriorities(0)
    //     PubSub.publish("body-keydown",{key:winInfos[0][0],ctrlKey: e.ctrlKey,keyCode: e.keyCode})
    //   }
    // }
    // document.body.addEventListener("keydown",this.search)
  }

  componentDidUpdate(prevProps, prevState) {
    console.log(this.jsonfyiable(this.state.root,{}),this.state.root)
    if(this.getAllKey().filter(key=>!isFixedPanel(key)).length === 0){
      ipc.send('close-window')
    }
  }

  componentWillUnmount() {
    for(let key of Object.keys(this.hidePanels)){
      this.close(key)
      this.refs2[key].TabPanelClose()
    }

    // document.body.removeEventListener("keydown",this.search)
    ipc.removeListener('sync-datas',this.syncDatasEvent)
    ipc.removeListener("toggle-nav",this.toggleNavEvent)
    ipc.removeListener("switch-fullscreen",this.switchFullscreenEvent)
    ipc.removeListener("get-window-state",this.getWinStateEvent)
    ipc.removeListener("get-focused-webContent",this.getFocusedWebContent)
    ipc.removeListener("enter-full-screen",this.fullScreenState)
    ipc.removeListener("leave-full-screen",this.fullScreenState)
    ipc.removeListener("page-title-updated",this.pageUpdate)
    ipc.removeListener("did-get-response-details",this.getResponseDetails)
    ipc.removeListener('chorme-tabs-move-inner',this.eventChromeTabsMoveInner)
    ipc.removeListener('chorme-tabs-move-detach',this.eventChromeTabsMoveDetach)
    ipc.removeListener('chorme-tabs-move-attach',this.eventChromeTabsMoveAttach)
    ipc.removeListener('tab-create',this.eventTabCreate)
    ipc.removeListener('open-fixed-panel',this.eventOpenFixedPanel)
    ipc.removeListener('close-fixed-panel',this.eventCloseFixedPanel)
    ipc.removeListener('visit-state-update', this.eventVisitStateUpdate)
    ipc.removeListener('update-theme', this.eventUpdateTheme)
    ipc.removeListener('CHROME_TABS_TAB_VALUE', this.eventChromeTabsTabValue)
    ipc.removeListener('CHROME_TABS_TAB_VALUE', this.eventChromeTabsTabValue)

    PubSub.unsubscribe(this.tokenAlign)
    PubSub.unsubscribe(this.tokenAllDetach)
    PubSub.unsubscribe(this.tokenSetVerticalTabState)
    PubSub.unsubscribe(this.tokenSetState)

    document.removeEventListener('keydown',this.arrangePanelKeyDown)
    document.removeEventListener('mousemove',this.arrangePanelMouseMove)
    clearInterval(this.arrangeId)
  }

  notifyChange(date){
    this.nc = date
  }

  parseRestoreDate(node,obj,force=false){
    if(node.l.tabs) {
      obj.l = [node.l.key,force ? node.l.tabs.map(t=>{t.forceKeep = true; return t}) : node.l.tabs]
    }
    else{
      obj.l = {}
      this.parseRestoreDate(node.l,obj.l,force)
    }
    if(!node.r){}
    else if (node.r.tabs) {
      obj.r = [node.r.key,force ? node.r.tabs.map(t=>{t.forceKeep = true; return t}) : node.r.tabs]
    }
    else{
      obj.r = {}
      this.parseRestoreDate(node.r,obj.r,force)
    }

    obj.dirc = node.dirc
    obj.size = node.size
    obj.pd = node.pd
    obj.key = node.key
    obj.toggleNav = node.toggleNav

    return obj
  }

  async allKeysAndTabs(node=this.state.root,arr,order){ // probably nouse
    await this._allKeysAndTabs(node,arr,order)
    for (var [key, value] of this.state.floatPanels.entries()) {
      order[0] = order[0]+1
      const tabs = await this.refs2[key].getTabsInfo()
      arr.push({order:order[0],key,tabs})
    }

  }
  async _allKeysAndTabs(node=this.state.root,arr,order){
    if (!Array.isArray(node.l) && node.l instanceof Object) {
      order[0] = order[0]+1
      await this._allKeysAndTabs(node.l,arr,order)
    }
    else{
      if(node.l){
        order[0] = order[0]+1
        const key = node.l[0]
        const tabs = await this.refs2[key].getTabsInfo()
        arr.push({order:order[0],key,tabs})
      }
    }
    if (!Array.isArray(node.r) && node.r instanceof Object) {
      order[0] = order[0]+1
      await this._allKeysAndTabs(node.r,arr,order)
    }
    else{
      if(node.r){
        order[0] = order[0]+1
        const key = node.r[0]
        const tabs = await this.refs2[key].getTabsInfo()
        arr.push({order:order[0],key,tabs})
      }
    }
    return arr
  }


  allKeys(node=this.state.root,arr){
    this._allKeys(node,arr)
    arr.push(...this.state.floatPanels.keys())

    return arr
  }

  _allKeys(node,arr){
    if (!Array.isArray(node.l) && node.l instanceof Object) {
      this._allKeys(node.l,arr)
    }
    else{
      if(node.l) arr.push(node.l[0])
    }
    if (!Array.isArray(node.r) && node.r instanceof Object) {
      this._allKeys(node.r,arr)
    }
    else{
      if(node.r) arr.push(node.r[0])
    }
    return arr
  }


  orderingIndexes(){
    const keys = []
    const indexes = {}
    this.allKeys(this.state.root,keys)
    let j = 0
    const changeTabInfos = []
    for(let key of keys){
      for(let tab of this.refs2[key].state.tabs){
        if(this.preIndexes[tab.wvId] !== j){
          changeTabInfos.push({tabId:tab.wvId,index:j})
        }
        indexes[tab.wvId] = j
        j++
      }
    }
    if(changeTabInfos.length) {
      this.preIndexes = indexes
      ipc.send('change-tab-infos', changeTabInfos)
    }
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
        const tabPanel = this.refs2[obj.l].state
        obj.l = {key:obj.l, tabs:tabPanel.tabs.map(tab=>{return {tabKey:tab.key, title:tab.page.title, url:tab.page.navUrl, pin:!!tab.pin, protect:!!tab.protect, lock:!!tab.lock, mute:!!tab.mute, fields:tab.fields, reloadInterval:!!tab.reloadInterval, active: tab.key == tabPanel.selectedTab}}).filter(tab=> tab.tabKey !== undefined && (!tab.privateMode || tab.privateMode.match(/^persist:\d/)))}
      }

      if(typeof obj.r === "string"){
        // obj.r = [obj.r,[]]
        const tabPanel = this.refs2[obj.r].state
        obj.r = {key:obj.r, tabs:tabPanel.tabs.map(tab=>{return {tabKey:tab.key, title:tab.page.title, url:tab.page.navUrl, pin:!!tab.pin, protect:!!tab.protect, lock:!!tab.lock, mute:!!tab.mute, fields:tab.fields, reloadInterval:!!tab.reloadInterval, active: tab.key == tabPanel.selectedTab}}).filter(tab=> tab.tabKey !== undefined && (!tab.privateMode || tab.privateMode.match(/^persist:\d/)))}
      }
    }

    return obj
  }


  _split(node,key,direction,pos,tabs,indexes,params){
    let flag = false
    if(!Array.isArray(node.l) && node.l instanceof Object){
      flag = this._split(node.l,key,direction,pos,tabs,indexes,params)
      if(flag) return flag
    }
    else{
      if(node.l[0] == key){
        if(node.p || node.r) {
          console.log("add right")
          node.l = pos == 1 ? {dirc: direction, size: '50%', l: node.l, r: [getUuid(), [], tabs, indexes,params], p: node, pd: "l",key:uuid.v4()} :
            {dirc: direction, size: '50%', l:[getUuid(), [], tabs, indexes,params] , r: node.l, p: node, pd: "l",key:uuid.v4()}
        }
        else{
          console.log("update right", tabs, indexes,params)
          Object.assign(node,pos == 1 ? {dirc: direction, size: '50%', l: node.l, r: [getUuid(), [], tabs, indexes,params], p: null} :
            {dirc: direction, size: '50%', l: [getUuid(), [], tabs, indexes,params], r:node.l , p: null})
          console.log(node)
        }
        this.setState({})
        PubSub.publish("resize")
        flag = true
        return flag
      }
    }

    if(!Array.isArray(node.r) && node.r instanceof Object){
      flag = this._split(node.r,key,direction,pos,tabs,indexes,params)
      if(flag) return flag
    }
    else {
      if(node.r[0] == key){
        if(node.p || node.l) {
          console.log("add left")
          node.r = pos == 1 ? {dirc: direction, size: '50%', l: node.r, r: [getUuid(), [], tabs, indexes,params], p: node, pd: "r",key:uuid.v4()} :
            {dirc: direction, size: '50%', l:[getUuid(), [], tabs, indexes,params], r:node.r , p: node, pd: "r",key:uuid.v4()}
        }
        else{
          console.log("update left")
          Object.assign(node,pos == 1 ? {dirc: direction, size: '50%', l: [getUuid(), [], tabs, indexes,params], r: node.r, p: null} :
            {dirc: direction, size: '50%', l: node.r, r:[getUuid(), [], tabs, indexes,params] , p: null})
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
    if(!Array.isArray(index)) index = [index]
    if(params && params.fields) params.fields = JSON.parse(JSON.stringify(params.fields))
    if(index[0] !== void 0) ipc.send('no-attach-browser-view',key, index.map(i=>tabs[i].key))
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
    ipc.send("change-title")
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

  getScrollPriorities(scrollbar=15,dirc=1){
    let jsonState,now
    if(this.scrollbar === scrollbar && this.nc===this.prevNc){
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
    this.scrollbar = scrollbar
    const browserNav = document.querySelector(".browser-navbar:not(.fixed-panel) .navbar-margin")
    const modify = browserNav.parentNode.style.visibility == "hidden" ? 0 : document.querySelector(".rdTabBar").offsetHeight + (browserNav.style.width != "0px" ? 0 : browserNav.offsetHeight)
    console.log(3300,modify)
    const arr = this._getScrollPriorities(this.state.root,[])

    arr.sort((a,b)=> a[1].left == b[1].left ? a[1].top > b[1].top : dirc * a[1].left < dirc * b[1].left ? -1 : 1)
    let accum = 0
    // arr.forEach(x=>{
    //   console.log(`${x[1].left}\t${x[1].top}\t${x[0]}\t${x[2]}`)
    // })
    const ret = arr.map((x,i)=>{
      const delta = x[1].height - modify - scrollbar
      console.log("aaaa",x[1].height - modify - scrollbar,x[1].height,modify,scrollbar)
      console.log("bbbb",delta,accum + delta - (i>0 ? MARGIN : 0),MARGIN)
      accum += delta - (i>0 ? MARGIN : 0)
      return [...x,accum - delta, x[1].height - modify - scrollbar]
    })
    ret[0][4] = accum - MARGIN
    console.log(8553,accum - MARGIN,scrollbar)

    this.prevGetScroll = ret
    this.prevGetScrollState = jsonState || JSON.stringify(this.jsonfyiable(this.state.root,{}))
    this.prevGetScrollDate = now || Date.now()
    this.prevNc = this.nc

    return ret
  }

  checkTopRight(obj,i) {
    if(isDarwin){
      return i == 0 && obj.l
    }
    else{
      return (obj.r && obj.l && (obj.dirc == "v" && (i == 1 || this.hidePanels[obj.r[0]]) ) || (obj.dirc == "h" && i == 0)) || !(obj.r && obj.l);
    }
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
    const allKeys = this.getAllKey()
    for(let ele of [...global.lastMouseDownSet.keys()].reverse()){
      eles.push(ele)
      if (ele.tagName == 'BODY') {
      }
      else if(ele.tagName == 'WEBVIEW'){
        const key = ele.className.slice(1)
        if(k != key && !isFixedPanel(key)){
          global.lastMouseDownSet  = new Set(eles.reverse())
          if(allKeys.includes(key)) return key
        }
      }
      else{
        const closestElement = ele.closest(".split-window")
        if (closestElement && closestElement.classList[1]) {
          const key = closestElement.classList[1].slice(1)
          if(k != key && !isFixedPanel(key)){
            global.lastMouseDownSet  = new Set(eles.reverse())
            if(allKeys.includes(key)) return key
          }
        }
      }
    }
    return allKeys.find(key=>k != key && !isFixedPanel(key))
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
    this.orderingIndexes()
  }

  arrangePanelKeyDown(e){
    if(e.key == 'Shift' || e.key == 'Alt' || e.key == 'Control' || e.key == 'Meta' || e.key == 'Process') return

    console.log(77766,e)
    if(!this.mouseMove) return
    const ele = document.elementFromPoint(this.mouseMove.pageX,this.mouseMove.pageY).closest('.arrange-img')
    if(!ele) return

    const tabId = parseInt(ele.className.split("tabId-")[1])

    const modifiers = []
    if(e.altKey) modifiers.push('Alt')
    if(e.ctrlKey) modifiers.push('Control')
    if(e.shiftKey) modifiers.push('Meta')
    if(e.metaKey) modifiers.push('Shift')
    ipc.send('send-input-event', {type: 'keyDown',tabId,keyCode: e.key, modifiers})
  }

  arrangePanelMouseMove(e){
    this.mouseMove = e
  }

  arrangePanels(k){
    if(this.state.arrange && sharedState.arrange !== k){
      sharedState.arrange = k
      return this.setState({})
    }
    if(this.state.arrange){
      ipc.send('end-arrange-mode')
      clearInterval(this.arrangeId)
      sharedState.arrange = false
      this.state._arrange = {...this.state.arrange}
      this.setState({arrange: null,renderArrange: null})
      // ipc.send('clear-captures')
      // this.sizeMap = {}
      document.removeEventListener('keydown',this.arrangePanelKeyDown)
      document.removeEventListener('mousemove',this.arrangePanelMouseMove)
    }
    else{
      document.addEventListener('keydown',this.arrangePanelKeyDown)
      document.addEventListener('mousemove',this.arrangePanelMouseMove)
      sharedState.arrange = k
      this.state._arrange = this.state.arrange

      const arr = []
      let tabIds = []
      this.setKeys(arr)
      for(let key of arr){
        this.refs2[key].webViewCreate()
        tabIds.push(...this.refs2[key].state.tabs.map(t=>t.wvId))
      }

      let rowNum = Math.ceil(Math.sqrt(tabIds.length))
      let rect = document.querySelector('.typcn.typcn-minus').getBoundingClientRect()
      let wholeWidth = window.innerWidth
      let top = rect.y + rect.height + 30
      let wholeHeight = window.innerHeight - top

      let num = 0, doing
      const arrange = []
      const func = first=>{
        if(doing) return
        doing = true
        if(num++ % 2 == 0){
          const arr = []
          tabIds = []
          this.setKeys(arr)
          for(let key of arr){
            tabIds.push(...this.refs2[key].state.tabs.map(t=>t.wvId))
          }

          rect = document.querySelector('.typcn.typcn-minus').getBoundingClientRect()
          wholeWidth = window.innerWidth
          top = rect.y + rect.height + 30
          wholeHeight = window.innerHeight - top
        }

        const base64 = uuid.v4()
        ipc.send('take-capture', {base64, tabIds})
        ipc.once(`take-capture-reply_${base64}`,async (e,data)=>{
          if(this.state.arrange) {
            for (let d of data) {
              if (d[1]) {
                const prevD = this.state.arrange.data.find(d2 => d2[3] == d[3])
                d[1] = prevD && prevD[1]
              }
            }
          }
          if(first || this.state.arrange){
            this.state.arrange = {top,tabIds,wholeWidth,wholeHeight,data}
            await this.renderArrange()
          }
          doing = false
        })
      }
      func(true)
      this.arrangeId = setInterval(_=>func(),300)

    }
  }

  async renderArrange(){
    const results = []
    const {top,tabIds,wholeWidth,wholeHeight,data} = this.state.arrange

    const eachHeight = this.getOptimizeHeight(wholeWidth,wholeHeight,data)

    const getWidthImageTabIdAndWidth = []
    for(let [tabId, img, size, key] of data){
      const width = Math.floor((size.width + 2) / (size.height + 2) * eachHeight - 2 )
      if(!img || img === true || !this.sizeMap[tabId] || this.sizeMap[tabId].width != width){
        getWidthImageTabIdAndWidth.push([tabId, width])
      }
    }

    const key = uuid.v4()
    ipc.send('get-captures', key,getWidthImageTabIdAndWidth)
    await new Promise(r=>{
      ipc.once(`get-captures-reply_${key}`,(e,imgInfo)=>{
        data.forEach(([tabId, img, size, key],i)=>{
          if(imgInfo[tabId]){
            const [img,size2] = imgInfo[tabId]
            this.sizeMap[tabId] = size2
            data[i] = [tabId, img, size, key]
          }
        })
        r()
      })
    })

    const h = {}
    for(let [tabId, dataURL, size, key] of data){
      h[tabId] = [dataURL,(size.width + 2) / (size.height + 2) * eachHeight , size.width, size.height, key]
    }

    const arr = [], selectedTabIds = new Set()
    this.setKeys(arr)
    for(let key of arr){
      const tabPanel = this.refs2[key]
      if(!tabPanel) continue
      const selectedTab = tabPanel.state.selectedTab
      const tab = this.refs2[key].state.tabs.find(t=>t.key == selectedTab)
      selectedTabIds.add(tab.wvId)
    }

    for(let tabId of tabIds){
      const data = h[tabId]
      if(!data) continue
      const [dataURL, eachWidth, realWidth, realHeight, key] = data
      const imgWidth = this.sizeMap[tabId].width, imgHeight = this.sizeMap[tabId].height
      results.push(<div key={`d${key}`} className={`arrange-img tabId-${tabId}`} style={{width: eachWidth, height: eachHeight, display: 'flex', border: `1px solid ${selectedTabIds.has(tabId) ? '#08cefb': 'rgb(80, 80, 80)'}`}}>
        <img key={`i${key}`} src={dataURL} style={{width: imgWidth, height: imgHeight, objectFit: 'cover'}}
             onDragStart={()=>false}
             onMouseDown={e=>this.handleArrangeEvent(e,tabId,realWidth,realHeight,imgWidth,imgHeight)}
             onMouseUp={e=>this.handleArrangeEvent(e,tabId,realWidth,realHeight,imgWidth,imgHeight)}
             onClick={e=>this.handleArrangeEvent(e,tabId,realWidth,realHeight,imgWidth,imgHeight)}
          // onDoubleClick={()=>this.handleSelectTab(tabId)}
             onWheel={e=>this.handleArrangeEvent(e,tabId,realWidth,realHeight,imgWidth,imgHeight)}
             onMouseMove={e=>this.handleArrangeEvent(e,tabId,realWidth,realHeight,imgWidth,imgHeight)}
        />
      </div>)
    }


    this.setState({renderArrange: <div key='arrange-fixed-wrapper' className='visible transition' style={{display: 'flex',position: 'fixed', zIndex: 99999999999,
        backgroundColor: 'rgb(80, 80, 80)',left: 0, top, width: wholeWidth, height: wholeHeight}}>
        <div key='arrange-wrapper' style={{display: 'flex',flexWrap: 'wrap',alignContent: 'flex-start', margin: 'auto', justifyContent: 'center'}}>{results}</div>
      </div>})
  }

  setKeys(arr) {
    const k = sharedState.arrange
    if (k === 'all') {
      this.allKeys(this.state.root, arr)
    }
    else {
      arr.push(k)
    }
  }

  getOptimizeHeight(wholeWidth,wholeHeight,data){
    let i = 1
    for(let j=0;j<1000;j++){
      i += 1 / (j < 10 ? 100.0 :  10.0)
      const eachHeight = wholeHeight / i
      let totalWidth = 0, num = 1
      for(let [tabId, dataURL, size] of data){
        const eachWidth = (size.width + 2) / (size.height + 2) * eachHeight
        if(eachWidth + totalWidth > wholeWidth){
          if(++num > Math.floor(i)) break
          totalWidth = eachWidth
        }
        else{
          totalWidth += eachWidth
        }
      }
      if(num <=  Math.floor(i) && totalWidth <= wholeWidth){
        return eachHeight
      }
    }
  }

  handleArrangeEvent(e,tabId,realWidth,realHeight,imgWidth,imgHeight){
    console.log(9343,e,realWidth,realHeight,imgWidth,imgHeight)
    const x = e.offsetX / imgWidth * realWidth
    const y = e.offsetY / imgHeight * realHeight
    const button = e.button == 0 ? 'left' : e.button == 1 ? 'middle' : 'right'
    if(e.type == 'mousedown'){
      if(button == 'right'){
        this.handleSelectTab(tabId)
      }
      else{
        ipc.send('send-input-event', {type: 'mouseDown',tabId,x,y,button})
      }
    }
    else if(e.type == 'mouseup' && button != 'right') ipc.send('send-input-event', {type: 'mouseUp',tabId,x,y,button})
    else if(e.type == 'wheel' && e.wheelDelta != 0) ipc.send('send-input-event', {type: 'mouseWheel',tabId,x,y,deltaY:e.deltaY * -1})
    else if(e.type == 'mousemove') ipc.send('send-input-event', {type: 'mouseMove',tabId,x,y})
  }

  handleSelectTab(tabId){
    sharedState.arrange = false
    clearInterval(this.arrangeId)
    this.setState({arrange: null})

    const arr = []
    this.allKeys(this.state.root,arr)
    for(let key of arr){
      const tab = this.refs2[key].state.tabs.find(t=>t.wvId == tabId)
      if(tab){
        this.refs2[key].setState({selectedTab: tab.key})
        this.refs2[key].focus_webview(tab)
        break
      }
    }
  }

  getFixedPanelKey(dirc){
    return `fixed-${dirc}`
  }

  isExistsFixedPanel(dirc){
    return this.getKeyPosition(this.getFixedPanelKey(dirc),this.state.root,true)
  }

  addFixedPanel(direction,pos,node=this.state.root,url){
    const fixedKey = this.getFixedPanelKey(direction == "v" ? pos == 1 ? "right" :"left" : pos == 1 ? "bottom" : "top") + `-${Math.random().toString().replace(".","")}_${count++}`
    const newData = url ? [fixedKey,[],undefined,[undefined],{url, mobile: undefined, adBlockThis: true,fields: {}, privateMode: false, guestInstanceId: undefined}] : [fixedKey,[]]

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
        node = {dirc: direction, size:newSize , l:node ,r: newData,p: null,key:uuid.v4(),toggleNav:node.toggleNav}
        node.l.p = node
        node.l.pd = "l"
      }
      else{
        console.log(2,fpanels.right)
        if(fpanels.right > 0) node.size = (wholeSize - 200) - (wholeSize - refSize)
        console.log(node.size)
        node = {dirc: direction, size: 200, l: newData,r: node,p: null,key:uuid.v4(),toggleNav:node.toggleNav}
        node.r.p = node
        node.r.pd = "r"
      }
      this.state.root = node
    }
    else{
      Object.assign(node,pos == 1 ? {dirc: direction, size: wholeSize - 201, l: node.l, r: newData, p: null} :
        {dirc: direction, size: 200, l: newData, r:node.l , p: null})
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
      const refSize = ref.size === void 0 ? 0 : ref.size.toString().includes("%") ?
        ((x == "top" || x == "bottom") ? size.height  : size.width) * parseInt(ref.size) / 100 : ref.size
      obj[x] = node ? (x == "top" || x == "left") ? refSize :
        (x=="bottom" ? size.height : size.width) - refSize : 0
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


    localForage.getItem(key).then(getSize=>{
      console.log("sizeee3",getSize,key)
      if(getSize){
        const fixedObj = this.existsAllFixedPanel()

        size = getSize == "0%" ? 200 : getSize.includes("%") ? getSize : parseInt(getSize)
        const size2 = key.match(/^fixed-left/) ? size : wholeSize - size

        // if(fixedObj.right && this.state.root.l[0] == key){
        //   size = size + fixedObj.right
        // }

        panel.sizeChange(size2,false)

        console.log("sizeee2",{key,size,psize:panel.state.size,wholeSize,otherSize})
        PubSub.publishSync("resizeWindow",direction == "v" ? {old_w:wholeSize,new_w:wholeSize - size,old_h:otherSize,new_h:otherSize} :
          {old_w:otherSize,new_w:otherSize,old_h:wholeSize,new_h:wholeSize - size})
        // panel.sizeChange(size2,false)
        localForage.removeItem(key)
        delete this.hidePanels[key]
        this.setState({})
      }
      else{
        size = key.match(/^fixed-left/) ? panel.state.size : wholeSize - panel.state.size
        localForage.setItem(key,size.toString())
        console.log("sizeee",{key,size,psize:panel.state.size,wholeSize,otherSize})
        this.hidePanels[key] = true
        this.setState({})
        panel.sizeChange(ret.dirc == "l" ? 0 : 100,true)
        PubSub.publishSync("resizeWindow",direction == "v" ? {old_w:wholeSize - size,new_w:wholeSize,old_h:otherSize,new_h:otherSize} :
          {old_w:otherSize,new_w:otherSize,old_h:wholeSize - size,new_h:wholeSize})
      }
    })
  }

  deleteAttach(){
    delete this.state.root.attach
    this.setState({})
  }

  addFloatPanel(tabs,index,oneLine){
    const key = `${this.getFixedPanelKey('float')}${oneLine ? '-one' : ''}-${Math.random().toString().replace(".","")}_${count++}`
    this.state.floatPanels.set(key,[key, [], tabs, [index],(void 0)])
    this.setState({})
  }

  toggleFindPanel(){
    this.setState({findPanelHeight: this.state.findPanelHeight === void 0 ? mainState.findPanelHeight : void 0})
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
                      key={x[0]} node={x} split={this.split} close={this.close}
                      getScrollPriorities={this.getScrollPriorities} child={x[1]} fullscreen={this.state.fullscreen}
                      toggleNav={this.state.root.toggleNav} parent={this} getOpposite={this.getOpposite}
                      getPrevFocusPanel={this.getPrevFocusPanel} addFloatPanel={this.addFloatPanel}
                      toggleDirc={this.toggleDirc} swapPosition={this.swapPosition} getAllKey={this.getAllKey}
                      currentWebContents={this.currentWebContents} htmlContentSet={this.htmlContentSet} getKeyPosition={this.getKeyPosition}
                      fixedPanelOpen={this.fixedPanelOpen} hidePanel={this.hidePanel} windowId={this.windowId}
                      attach={this.state.root.attach && {delete: this.deleteAttach,data:this.state.root.attach}}
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
                key={x[0]} node={x} split={this.split} close={this.closeFloat}
                getScrollPriorities={this.getScrollPriorities} child={x[1]}
                toggleNav={x[0].startsWith('fixed-float-one') ? 1 : this.state.root.toggleNav} parent={this} addFloatPanel={this.addFloatPanel}
                getPrevFocusPanel={this.getPrevFocusPanel} getAllKey={this.getAllKey} float={true}
                currentWebContents={this.currentWebContents} htmlContentSet={this.htmlContentSet} getKeyPosition={this.getKeyPosition}
                fixedPanelOpen={this.fixedPanelOpen} hidePanel={this.hidePanel} windowId={this.windowId}
                attach={this.state.root.attach && {delete: this.deleteAttach,data:this.state.root.attach}}
      />
    </FloatPanel>
  }

  render() {
    const arr = []
    for (var [key, value] of this.state.floatPanels.entries()) {
      arr.push(this.renderFloatPanel(value))
    }

    const dlList = this.state.dlList
    let height = this.state.findPanelHeight !== void 0 ? this.state.findPanelHeight : 0
    height += dlList ? 50 : 0

    return <span>
      <div className="wrap-split-window" style={ height ? {height: `calc(100% - ${height}px)`}: null}>
        {/*<VerticalTabPanel key="vd" parent={this} tabValues={this.tabValues} direction={this.state.verticalTabPosition}/>*/}
        {this.state.verticalTabPosition == "left" ? <VerticalTabPanel key="vd" parent={this} tabValues={this.tabValues} toggleNav={this.state.root.toggleNav} direction={this.state.verticalTabPosition}/> : null}
        {this.recur(this.state.root,0,true,{val:false})}
        {this.state.verticalTabPosition == "right" ? <VerticalTabPanel key="vd" parent={this} tabValues={this.tabValues} toggleNav={this.state.root.toggleNav} direction={this.state.verticalTabPosition}/> : null}
        <div>{arr}</div>
        <PanelOverlay/>
        {this.state.arrange ? this.state.renderArrange: null}
      </div>
      <DownloadList enableDownloadList={enableDownloadList} parent={this}/>
      {this.state.findPanelHeight !== void 0 ? <FindPanel parent={this} findPanelHeight={this.state.findPanelHeight}/> : null}
    </span>
  }
}
