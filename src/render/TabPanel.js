const React = require('react')
const {Component} = React
const {remote} = require('electron');
const {app,Menu,clipboard} = remote
import Tabs from './draggable_tab/components/Tabs'
import Tab from './draggable_tab/components/Tab'
const {BrowserNavbar} = require('./browserNavbar')
const {BrowserPage} = require('./browserPage')
const PubSub = require('./pubsub')
const uuid = require('node-uuid')
const ReactDOM = require('react-dom')
const ipc = require('electron').ipcRenderer
const path = require('path');
const fs = remote.require('fs')
const mkdirp = remote.require('mkdirp')
const {favicon,history,media,favorite} = require('./databaseRender')
const db = require('./databaseRender')
const Notification = require('./Notification')
const InputableDialog = require('./InputableDialog')
const ImportDialog = require('./ImportDialog')
import url from 'url'
const mainState = remote.require('./mainState')
const BrowserWindowPlus = remote.require('./BrowserWindowPlus')
const moment = require('moment')
const urlutil = require('./urlutil')
const {messages,locale} = require('./localAndMessage')

const canFlash = mainState.flash
let searchProviders,spAliasMap
updateSearchEngine();

// const chromes =  require('electron').remote.getGlobal('chrome')

// ipc.setMaxListeners(0)
// window.setInterval(()=>{console.log(ipc.listenerCount('new-tab'))},1000)
const svg = `<svg version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
     width="16px" height="16px" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;" xml:space="preserve">
  <path fill="#4285f4" d="M25.251,6.461c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615V6.461z">
    <animateTransform attributeType="xml"
      attributeName="transform"
      type="rotate"
      from="0 25 25"
      to="360 25 25"
      dur="1.2s"
      repeatCount="indefinite"/>
    </path>
  </svg>`

let topURL
const sidebarURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite_sidebar.html'
const blankURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/blank.html'
const REG_VIDEO = /^https:\/\/www\.(youtube)\.com\/watch\?v=(.+)&?|^http:\/\/www\.(dailymotion)\.com\/video\/(.+)$|^https:\/\/(vimeo)\.com\/(\d+)$/
let newTabMode = mainState.newTabMode

function getNewTabPage(){
  topURL = newTabMode == 'myHomepage' ? mainState.myHomepage : `chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/${newTabMode}.html`
}

ipc.on('update-mainstate',(e,key,val)=>{
  if(key == 'myHomepage' || key == 'newTabMode'){
    getNewTabPage()
  }
})
getNewTabPage()

const convertUrlMap = new Map([
  ['about:blank','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/blank.html'],
  ['chrome://bookmarks/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite.html'],
  ['chrome://bookmarks-sidebar/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite_sidebar.html'],
  ['chrome://history/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/history.html'],
  ['chrome://history-sidebar/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/history_sidebar.html'],
  ['chrome://explorer/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/explorer.html'],
  ['chrome://explorer-sidebar/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/explorer_sidebar.html'],
  ['chrome://tabs-sidebar/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/tabs_sidebar.html'],
  ['chrome://download/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/download.html'],
  ['chrome://terminal/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/terminal.html'],
  ['chrome://settings/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html'],
  ['chrome://settings#general','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#general'],
  ['chrome://settings#search','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#search'],
  ['chrome://settings#tabs','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#tabs'],
  ['chrome://settings#keyboard','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#keyboard'],
  ['chrome://settings#extension','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#extension'],
])


function updateSearchEngine(){
  searchProviders = {...mainState.searchProviders}
  spAliasMap = new Map(Object.values(searchProviders).map(sp=> [sp.shortcut,sp.name]))
}

ipc.on("update-search-engine",updateSearchEngine)

function convertURL(url){
  return convertUrlMap.has(url) ? convertUrlMap.get(url) : url
}

function multiByteSlice(str,end) {
  let len = 0
  str = escape(str);
  const strLen = str.length
  let i
  for (i=0;i<strLen;i++,len++) {
    if(len >= end) break
    if (str.charAt(i) == "%") {
      if (str.charAt(++i) == "u") {
        i += 3;
        len++;
      }
      i++;
    }
  }
  return `${unescape(str.slice(0,i))}${i == str.length ? "" :"..."}`;
}

function isFixedPanel(key){
  return key.startsWith('fixed-')
}

function isFixedVerticalPanel(key){
  return key.match(/^fixed\-[lr]/)
}


function isFloatPanel(key){
  return key.startsWith('fixed-float')
}

function removeEvents(ipc,events){
  for (var key in events) {
    if (events.hasOwnProperty(key)) {
      const value = events[key]
      if(key == 'ipc-message'){
        value[0].removeEventListener('ipc-message',value[1] )
      }
      else{
        ipc.removeListener(key,value)
      }
    }
  }
}

function tabAdd(self, url, isSelect=true,privateMode = false,guestInstanceId,mobile,adBlockThis,last=false) {
  const t = self.createTab({default_url:url,privateMode,guestInstanceId,rest:{mobile,adBlockThis}})
  const key = t.key


  if(last){
    self.state.tabs.push(t)
  }
  else{
    const addNum = self.state.prevAddKeyCount[0] == self.state.selectedTab ? self.state.prevAddKeyCount[1] : []
    addNum.push(key)
    const index = self.state.tabs.findIndex(x=>x.key == self.state.selectedTab)
    self.state.tabs.splice(index + addNum.length, 0, t)
    self.state.prevAddKeyCount = [self.state.selectedTab, addNum]
  }

  if(isSelect){
    self.state.selectedKeys.push(key)
    console.log("selected01",key)
    self.setState({selectedTab: key})
    self.focus_webview(t)
  }
  else
    self.setState({})

  return t
}

function exeScript(wv,callback,evalFunc,...args){
  let strs = `(${evalFunc.toString()})()`.split('___SPLIT___')
  if(strs.length > 1) strs.splice(1,0,...args)
  // console.log(strs.join('\n'))
  wv.executeScriptInTab('dckpbojndfoinamcdamhkjhnjnmjkfjd',strs.join('\n'),{},callback)
}

const tabsClassNames = {
  tabWrapper: 'chrome-tabs',
  tabBar: 'chrome-tabs-content',
  tab:      'chrome-tab',
  tabBeforeTitle: 'chrome-tab-favicon',
  tabTitle: 'chrome-tab-title',
  tabCloseIcon: '',
  tabActive: 'chrome-tab-current'
};

// tabWrapper: 'chrome-tabs',
//   tabBar: 'chrome-tabs-content',
//   tabBarAfter: '',
//   tab: 'chrome-tab',
//   tabBefore: '',
//   tabAfter: '',
//   tabBeforeTitle: '',
//   tabTitle: 'chrome-tab-title',
//   tabAfterTitle: '',
//   tabCloseIcon: 'chrome-tab-close',
//   tabActive: 'chrome-tab-current',
//   tabHover: '',

const tabsStyles = {
  tabWrapper: {},
  tabBar: {padding: 0},
  tab:{},
  tabTitle: {},
  tabCloseIcon: {},
  tabBefore: {},
  tabAfter: {}
};

let ttime = 0
let guestIds = {}
let historyMap = new Map([
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html',['Top','resource/file.png']],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/blank.html',['Blank','resource/file.png']],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite.html',['Bookmarks','resource/file.png']],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/history.html',['History','resource/file.png']],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/explorer.html',['Explorer','resource/file.png']],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/download.html',['Download','resource/file.png']],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/terminal.html',['Terminal','resource/file.png']],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html',['History','resource/file.png']],
])

export default class TabPanel extends Component {
  constructor(props) {
    super(props);
    const self = this
    const tokens = {pubsub:this.initEventListener(),ipc:this.initIpcEvents()}
    this.uuid = uuid.v4().replace(/\-/g,"")
    console.log(65654,props)

    if(this.mounted === false){
    }
    else if(this.props.attach){
      console.log(this.props.attach)
      const attachTabs = this.props.attach.data
      this.props.attach.delete()
      let tabs
      tabs = attachTabs.map(tab=>{
        // console.log(37,{c_page:tab.c_page,c_key:tab.c_key,privateMode:tab.privateMode,pin:tab.pin,wvId:tab.wvId,guestInstanceId: tab.guestInstanceId,rest:tab.rest})
        return this.createTab({c_page:tab.c_page,privateMode:tab.privateMode,pin:tab.pin,guestInstanceId: tab.guestInstanceId,rest:tab.rest})
      })

      this.state = {tokens,
        oppositeGlobal: mainState.oppositeGlobal,
        tabs,
        tabBar:props.k.match(/^fixed-bottom/) ? 1 : props.k.match(/^fixed-(left|right)/) ? 0 :(void 0),
        prevAddKeyCount: [null,[]],
        notifications: [],
        history: [],
        tabKeys: []
      }
      this.state.selectedTab = this.state.tabs[0].key
      this.state.selectedKeys = [this.state.selectedTab]

      this.focus_webview(this.state.tabs[0],false)
      this.props.child[0] = this.state
    }
    else if(this.props.node[2] && this.props.node[2].length > 1){
      console.log('TabSplit')
      this.props.node.pop()
      const indexes = this.props.node.pop()
      const fromTabs = this.props.node.pop()
      const tabs = indexes.map(i=>{
        const tab = fromTabs[i]
        return this.createTab({c_page:tab.page,c_wv:tab.wv,c_key:tab.key,privateMode:tab.privateMode,pin:tab.pin
          ,rest:{wvId:tab.wvId,openlink: tab.openlink,sync:tab.sync,syncReplace:tab.syncReplace,dirc:tab.dirc,ext:tab.ext,oppositeMode:tab.oppositeMode,bind:tab.bind,mobile:tab.mobile,adBlockThis:tab.adBlockThis}})
      })
      this.state = {tokens,
        oppositeGlobal: mainState.oppositeGlobal,
        tabs,
        tabBar:props.k.match(/^fixed-bottom/) ? 1 : props.k.match(/^fixed-(left|right)/) ? 0 :(void 0),
        prevAddKeyCount: [null,[]],
        notifications: [],
        history: [],
        tabKeys: []
      }
      this.state.selectedTab = this.state.tabs[0].key
      this.state.selectedKeys = [this.state.selectedTab]

      this.focus_webview(this.state.tabs[0],false)
      this.props.child[0] = this.state
    }
    else if(this.props.child[0] === undefined || this.props.node[4]){
      let params
      if(this.props.node[4]){
        params = this.props.node.pop()
        this.props.node.pop()
        this.props.node.pop()
      }
      console.log('TabCreate')
      const tab = this.createTab(params && {default_url:params.url,privateMode: params.privateMode,rest:{bind:params.bind,mobile:params.mobile,adBlockThis:params.adBlockThis}})
      this.state = {tokens,
        oppositeGlobal: mainState.oppositeGlobal,
        tabs:[tab],
        tabBar:props.k.match(/^fixed-bottom/) ? 1 : props.k.match(/^fixed-(left|right)/) ? 0 :(void 0),
        prevAddKeyCount: [null,[]],
        notifications:[],
        selectedTab: tab.key,
        selectedKeys: [tab.key],
        history: [],
        tabKeys: []}
      this.focus_webview(tab,false)
      this.props.child[0] = this.state
    }
    else if(this.props.child[0].tabs){
      console.log('TabNoCreate')
      this.props.child[0].tabs.forEach(tab=> removeEvents(ipc,tab.events))
      this.props.child[0].tokens.pubsub.forEach(x=>PubSub.unsubscribe(x))
      this.props.child[0].tokens.ipc.forEach(x=>removeEvents(ipc,x))
      this.state = {tokens,
        oppositeGlobal: mainState.oppositeGlobal,
        tabs: this.props.child[0].tabs.map(tab=>this.createTab({c_page:tab.page,c_wv:tab.wv,c_key:tab.key,privateMode:tab.privateMode,pin:tab.pin,
          rest:{wvId:tab.wvId,openlink: tab.openlink,sync:tab.sync,syncReplace:tab.syncReplace,dirc:tab.dirc,ext:tab.ext,oppositeMode:tab.oppositeMode,bind:tab.bind,mobile:tab.mobile,adBlockThis:tab.adBlockThis}})),
        tabBar:this.props.child[0].tabBar,
        prevAddKeyCount: this.props.child[0].prevAddKeyCount.slice(0),
        notifications: this.props.child[0].notifications,
        selectedTab: this.props.child[0].selectedTab,
        selectedKeys: this.props.child[0].selectedKeys,
        history: this.props.child[0].history,
        tabKeys: this.props.child[0].tabKeys
      }
      this.props.child[0] = this.state
    }
    else{
      console.log('RestoreTab',this.props.child)
      const restoreTabs = this.props.child
      const tabs = []
      const keepTabs = mainState.startsWith == 'startsWithOptionLastTime'
      let forceKeep = false
      for(let tab of restoreTabs){
        console.log(544,tab)
        if(!keepTabs && !tab.forceKeep && !tab.pin) continue
        forceKeep = tab.forceKeep
        tabs.push(this.createTab({default_url:tab.url,privateMode:tab.privateMode,pin:tab.pin}))
      }
      if(tabs.length == 0) tabs.push(this.createTab())

      this.state = {tokens,
        tabs,
        oppositeGlobal: mainState.oppositeGlobal,
        tabBar:props.k.match(/^fixed-bottom/) ? 1 : props.k.match(/^fixed-(left|right)/) ? 0 :(void 0),
        prevAddKeyCount: [null,[]],
        notifications:[],
        selectedTab: forceKeep ? tabs[0].key : tabs[tabs.length - 1].key,
        selectedKeys: [forceKeep ? tabs[0].key : tabs[tabs.length - 1].key],
        history: [],
        tabKeys: []
      }
      this.props.child[0] = this.state
    }
  }

  initIpcEvents(){
    const eventNotification = (msg,data)=>{
      if(!this.mounted) return
      if(data.id){
        const ret = this.state.tabs.find(tab=>{
          return data.id == tab.wvId
        })
        if(!ret) return
      }
      else if(!this.props.isTopLeft){
        return
      }
      this.state.notifications.push(data)
      this.setState({})
    }
    ipc.on("show-notification",eventNotification)

    const closeTabFromOtherWindow = (msg,data)=>{
      if(!this.mounted) return
      const _tabs = this.state.tabs
      let i = 0
      console.log(data,_tabs)
      const promises = []
      for(let tab of _tabs){
        if(data.keySet.includes(tab.key)){
          const p = new Promise((resolve,reject)=>{
            this.getWebContents(tab).detach(_=>{
              resolve({wvId:tab.wvId,c_page:tab.page,c_key:tab.key,privateMode:tab.privateMode,pin:tab.pin,
                rest:{wvId:tab.wvId,openlink: tab.openlink,sync:tab.sync,syncReplace:tab.syncReplace,dirc:tab.dirc,ext:tab.ext,oppositeMode:tab.oppositeMode,bind:tab.bind,mobile:tab.mobile,adBlockThis:tab.adBlockThis},guestInstanceId: tab._guestInstanceId || this.getWebContents(tab).guestInstanceId})
            })
          })
          promises.push(p)
        }
        i++
      }

      if(promises.length == 0) return

      Promise.all(promises).then(vals=>{
        ipc.send("detach-tab-to-main",vals)
        if(vals.length == 1)
          PubSub.publish(`close_tab_${this.props.k}`, {key: vals[0].c_key})
        else
          PubSub.publish(`close-panel_${this.props.k}`)
      })
    }
    ipc.on(`close-tab-from-other-window`,closeTabFromOtherWindow)

    const eventCloseSyncTab = (msg,port)=>{
      if(!this.mounted) return
      for(let tab of this.state.tabs){
        if(tab.page.location == `http://localhost:${port}/sync.html`){
          PubSub.publish(`close_tab_${this.props.k}`,{key: tab.key})
        }
      }
    }
    ipc.on("close-sync-tab",eventCloseSyncTab)


    return [
      {'show-notification': eventNotification},
      {'close-tab-from-other-window': closeTabFromOtherWindow},
      {'close-sync-tab': eventCloseSyncTab}
    ]
  }

  initEventListener() {
    const tokenResize = PubSub.subscribe('resize', ()=> {
      this.webViewCreate()
    })
    const tokenDrag = PubSub.subscribe('drag', (msg, val)=> {
      this.drag = val
    })

    const tokenClose = PubSub.subscribe(`close-panel_${this.props.k}`, (msg)=> {
      mainState.set('keepOpen',1)
      this.props.close(this.props.k)
      this.TabPanelClose()
      setTimeout(_=>mainState.set('keepOpen',0),2000)
      // if(!this.props.parent.state.r) remote.getCurrentWindow().hide()
    })

    const tokenIncludeKey = PubSub.subscribe('include-key',(msg,key)=>{
      const tab = this.state.tabs.find(x => x.key == key)
      if(tab) PubSub.publish(`include-key-reply_${key}`,this.props.k)
    })

    const tokenRichMedia = PubSub.subscribe('rich-media-insert',(msg,record)=>{
      const tab = this.state.tabs.find(t =>t.wvId == record.tabId)
      if(!tab) return
      if(tab.page.navUrl.match(REG_VIDEO)){
        return
      }
      tab.page.richContents.push(record)
      // ipc.once('video-infos-additional',(e,{title,formats,error})=>{
      //   if(error) return
      //   for(let f of formats){
      //     if(f.protocol.includes('m3u8')) continue
      //     const fname = `${title}_${f.format.replace(/ /g,'')}.${f.ext}`
      //     tab.page.richContents.push({url:f.url,type:'video',fname})
      //   }
      // })
      // ;(async ()=>{await media.insert({...record, updated_at: Date.now()}) })()
      this.refs[`navbar-${tab.key}`].setState({})
      if(record.url == tab.page.navUrl){
        this.navigateTo(tab.page, `chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/video.html?url=${encodeURIComponent(record.url)}${record.contType ? `&type=${encodeURIComponent(record.contType)}` : ''}`, tab)
      }
    })

    const tokenMultiScroll = PubSub.subscribe('multi-scroll-webviews',(msg,{deltaY,webviews})=>{
      let wv,cont
      const tab = this.state.tabs.find(t =>t.wv && (wv = webviews.find(w=>w == ReactDOM.findDOMNode(t.wv))))
      if(!tab) return
      cont = this.getWebContents(tab)
      // cont.sendInputEvent({ type: 'mouseWheel', x: wv.x, y: wv.y, deltaX: 0, deltaY, canScroll: true});
      exeScript(tab.wv,(void 0), ()=> {
        ___SPLIT___
        ;
        const c = window.scrollTo(window.scrollX, window.scrollY + y)
      }, `const y = ${deltaY * -1}`)
    })

    const tokenBodyKeydown = PubSub.subscribe('body-keydown', (msg,e)=> {
      if(this.props.k !== e.key) return
      this.handleKeyDown(e)
    })


    const tokenCloseTab = PubSub.subscribe(`close_tab_${this.props.k}`, (msg,{key,selectedTab,isUpdateState=true})=> {
      if (!this.mounted) return
      const _tabs = this.state.tabs
      const i = this.state.tabs.findIndex(x => x.key == key)
      if(i === -1){//@TODO
        this.setState({})
        return
      }

      // ipc.send('chrome-tab-removed', parseInt(_tabs[i].key))
      this._closeBind(_tabs[i])

      if(_tabs[i].events) removeEvents(ipc, _tabs[i].events)
      if(this.state.tabs.length==1){
        this.state.tabs.splice(i, 1)
        mainState.set('keepOpen',1)
        this.props.close(this.props.k)
        this.TabPanelClose(key)
        setTimeout(_=>mainState.set('keepOpen',0),2000)
        // if(!this.props.parent.state.r) remote.getCurrentWindow().hide()
      }
      else{
        this.addCloseTabHistory({}, i)
        this.state.tabs.splice(i, 1)
        if(isUpdateState){
          console.log("selected02",selectedTab || this.getPrevSelectedTab(key,_tabs,i))
          this.setState({
            tabs: _tabs,
            // selectedTab: _tabs.length > i ? _tabs[i].key : _tabs.length > 0 ? _tabs[i - 1].key : null
            selectedTab: selectedTab || this.getPrevSelectedTab(key,_tabs,i)
          });
        }
      }
    })

    if(this.isFixed) return [tokenResize,tokenDrag,tokenClose,tokenBodyKeydown,tokenIncludeKey,tokenRichMedia,tokenMultiScroll,tokenCloseTab]


    const tokenNewTabFromKey = PubSub.subscribe(`new-tab-from-key_${this.props.k}`, (msg,{url,mobile,adBlockThis,notSelected,privateMode})=> {
      if (!this.mounted) return
      console.log(`new-tab-from-key_${this.props.k}`,this)
      tabAdd(this, url, !notSelected,privateMode,(void 0),(void 0),(void 0));
    })

    const tokenToggleDirction = PubSub.subscribe(`switch-direction_${this.props.k}`, (msg)=> {
      this.props.toggleDirc(this.props.k)
    })

    const tokenSwapPosition = PubSub.subscribe(`swap-position_${this.props.k}`, (msg)=> {
      this.props.swapPosition(this.props.k)
    })

    const scrollSync = (tab, left, winInfo, top, id)=> {
      exeScript(tab.wv,id ? ()=>clearInterval(id) : (void 0), ()=> {
        ___SPLIT___
        ;
        const a = 0
        if (window.__scrollSync__ !== 0 && !(x == window.scrollX && y == window.scrollY)){
          window.scrollTo(x, y)
        }
      }, `const x = ${left}`, `const y = ${(tab.syncReplace ? 0 : winInfo[2]) + top}`)
    }

    const tokenSync2 = PubSub.subscribe('scroll-sync-webview', (msg, {top, left, scrollbar,sync})=> {
      if(!this.mounted) return
      // console.log(sync)
      if(!sync) return
      const tab = this.state.tabs.find(x => x.sync == sync)
      if(!tab) return
      const winInfos = this.props.getScrollPriorities(scrollbar,tab.dirc || 1)
      const index = winInfos.findIndex(x=>x[0] == this.props.k)
      const winInfo = winInfos[index]

      if (index != 0) {
        if (top === void 0) {
          let retry = 0
          const id = window.setInterval(()=> {
            retry++
            if(retry > 1000) {
              clearInterval(id)
              return
            }
            if (!tab.wv || !this.getWebContents(tab)) return
            scrollSync(tab, left, winInfo, 0, id)
          }, 300)
        }
        else
          scrollSync(tab, left, winInfo, top)
      }
      else {
        this.scrollbar = scrollbar
      }
    })

    const tokenCloseSyncTabs = PubSub.subscribe('close-sync-tabs',(msg,{k,sync})=>{
      if(this.props.k == k || !sync) return
      const tab = this.state.tabs.find(x => x.sync == sync)
      if(tab) this.handleTabClose({noSync: true},tab.key)
    })

    const tokenSyncZoom = PubSub.subscribe('sync-zoom',(msg,{k,sync,percent})=>{
      if(this.props.k == k || !sync) return
      const tab = this.state.tabs.find(x => x.sync == sync)
      if(tab){
        this.getWebContents(tab).setZoomLevel(global.zoomMapping.get(percent))
      }
    })

    const tokenSyncSelectTab = PubSub.subscribe('sync-select-tab',(msg,{k,sync})=>{
      if(this.props.k == k || !sync) return
      const tab = this.state.tabs.find(x => x.sync == sync)
      console.log("selected03",tab.key)
      if(tab) this.setState({selectedTab: tab.key})
    })

    const tokenOpposite = PubSub.subscribe('set-opposite-enable',(msg,enable)=>{
      for(let tab of this.state.tabs){
        tab.oppositeMode = enable
      }
      this.setState({oppositeGlobal:enable})
    })

    const tokenSplit = PubSub.subscribe('drag-split',(msg,{type,dropTabKey,droppedKey})=>{
      const index = this.state.tabs.findIndex(x => x.key == dropTabKey)
      if(index === -1) return

      const dirc = type == "left" || type == "right" ? 'v' : 'h'
      const pos = type == "left" || type == "top" ? -1 : 1
      if(this.state.tabs.length > 1 || droppedKey != this.props.k) {
        if(this.state.tabs.length > 1){
          this.props.split(droppedKey,dirc,pos,this.state.tabs,index)
        }
        else{
          this.props.split(droppedKey,dirc,pos,[...this.state.tabs,'dummy'],index) //@TODO
        }
        this.handleTabClose({}, dropTabKey)
        PubSub.publish(`close_tab_${this.props.k}`,{key:dropTabKey})
      }
      else{
        this.props.split(droppedKey, dirc, pos * -1)
      }
    })

    const tokenSearch = PubSub.subscribe(`drag-search_${this.props.k}`,(msg,{key,text})=>{
      const tab = this.state.tabs.find(x=>x.key == key)
      if(tab) this.search(tab,text,false)
    })

    // return [tokenResize,tokenDrag,tokenSplit,tokenClose,tokenToggleDirction,tokenSync,tokenSync2,tokenBodyKeydown,tokenNewTabFromKey]
    return [tokenResize,tokenDrag,tokenClose,tokenToggleDirction,tokenSwapPosition,tokenSync2,tokenCloseSyncTabs,tokenSyncZoom,tokenSyncSelectTab,tokenBodyKeydown,tokenNewTabFromKey,tokenCloseTab,tokenIncludeKey,tokenRichMedia,tokenMultiScroll,tokenOpposite,tokenSplit,tokenSearch]
  }


  filterFromContents(page, navigateTo, tab, self) {
    console.log('filterFromContents',page.navUrl)

    if (page.navUrl.match(/^(chrome|https:\/\/github\.com)/)) {
      return false
    }
    else if (page.navUrl.endsWith('.pdf') || page.navUrl.endsWith('.PDF')) {
      const url = mainState.pdfMode == "normal" ?
        `chrome-extension://jdbefljfgobbmcidnmpjamcbhnbphjnb/content/web/viewer.html?file=${encodeURIComponent(page.navUrl)}` :
        `chrome-extension://jdbefljfgobbmcidnmpjamcbhnbphjnb/comicbed/index.html#?url=${encodeURIComponent(page.navUrl)}`
      navigateTo(url)
      return true
    }
    else if(page.navUrl.split("?").slice(-2)[0].match(/\.(3gp|3gpp|3gpp2|asf|avi|dv|flv|m2t|m4v|mkv|mov|mp4|mpeg|mpg|mts|oggtheora|ogv|rm|ts|vob|webm|wmv|aac|m4a|mp3|oga|wav)$/)){
      navigateTo(`chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/video.html?url=${encodeURIComponent(page.navUrl)}`)
      return true
    }
    else if (this.props.htmlContentSet.has(page.navUrl)){
      return false
    }
    else if(page.navUrl.match(/^file:.+?\.(zip|rar)$/)){
      const url = `chrome-extension://jdbefljfgobbmcidnmpjamcbhnbphjnb/comicbed/index.html#?url=${encodeURIComponent(page.navUrl)}`
      navigateTo(url)
      return true
    }
    else if (page.navUrl.match(/^file:.+?\.(abap|abc|as|ada|adb|htaccess|htgroups|htpasswd|conf|htaccess|htgroups|htpasswd|asciidoc|adoc|asm|a|ahk|bat|cmd|bro|cpp|c|cc|cxx|h|hh|hpp|ino|c9search_results|cirru|cr|clj|cljs|CBL|COB|coffee|cf|cson|Cakefile|cfm|cs|css|curly|d|di|dart|diff|patch|Dockerfile|dot|drl|dummy|dummy|e|ge|ejs|ex|exs|elm|erl|hrl|frt|fs|ldr|fth|4th|f|f90|ftl|gcode|feature|.gitignore|glsl|frag|vert|gbs|go|groovy|haml|hbs|handlebars|tpl|mustache|hs|cabal|hx|htm|html|hjson|xhtml|eex|html.eex|erb|rhtml|html.erb|ini|conf|cfg|prefs|io|jack|jade|pug|java|js|jsm|jsx|json|jq|jsx|jl|kt|kts|tex|latex|ltx|bib|less|liquid|lisp|ls|logic|log|lql|lsl|lua|lp|lucene|Makefile|md|GNUmakefile|makefile|OCamlMakefile|make|markdown|mask|matlab|mz|mel|mc|mush|mysql|nix|nsi|nsh|m|mm|ml|mli|pas|p|pl|pm|pgsql|php|phtml|shtml|php3|php4|php5|phps|phpt|aw|ctp|module|ps1|praat|praatscript|psc|proc|plg|prolog|properties|proto|py|r|cshtml|asp|Rd|Rhtml|rst|rb|ru|gemspec|rake|Guardfile|Rakefile|Gemfile|rs|sass|scad|scala|scm|sm|rkt|oak|scheme|scss|sh|bash|.bashrc|sjs|smarty|tpl|snippets|soy|space|sql|sqlserver|styl|stylus|svg|swift|tcl|tex|txt|textile|toml|tsx|twig|swig|ts|typescript|str|vala|vbs|vb|vm|v|vh|sv|svh|vhd|vhdl|wlk|wpgm|wtest|xml|rdf|rss|wsdl|xslt|atom|mathml|mml|xul|xbl|xaml|xq|yaml|yml)$/) ||
      page.navUrl.match(/\/[^\?=]+?\.(abap|abc|as|ada|adb|htaccess|htgroups|htpasswd|conf|htaccess|htgroups|htpasswd|asciidoc|adoc|asm|a|ahk|bat|cmd|bro|cpp|c|cxx|h|hh|hpp|ino|c9search_results|cirru|cr|clj|cljs|CBL|COB|coffee|cf|cson|Cakefile|cfm|cs|css|curly|d|di|dart|diff|patch|Dockerfile|dot|drl|dummy|dummy|e|ge|ejs|ex|exs|elm|erl|hrl|frt|fs|ldr|fth|4th|f|f90|ftl|gcode|feature|.gitignore|glsl|frag|vert|gbs|go|groovy|hbs|handlebars|tpl|mustache|hs|cabal|hx|hjson|eex|ini|conf|cfg|prefs|io|jack|jade|pug|java|js|jsm|jsx|json|jq|jsx|jl|kt|kts|tex|latex|ltx|bib|less|liquid|lisp|ls|logic|lql|lsl|lua|lp|lucene|Makefile|md|GNUmakefile|makefile|OCamlMakefile|make|markdown|mask|matlab|mz|mel|mc|mush|mysql|nix|nsi|nsh|m|mm|ml|mli|pas|p|pl|pm|pgsql|phps|phpt|aw|ctp|module|ps1|praat|praatscript|psc|proc|plg|prolog|properties|proto|py|r|cshtml|Rd|Rhtml|rst|rb|gemspec|rake|Guardfile|Rakefile|Gemfile|rs|sass|scad|scala|scm|sm|rkt|oak|scheme|scss|sh|bash|.bashrc|sjs|smarty|tpl|snippets|soy|space|sql|sqlserver|styl|stylus|svg|swift|tcl|tex|txt|textile|toml|tsx|twig|swig|ts|typescript|str|vala|vbs|vb|vm|v|vh|sv|svh|vhd|vhdl|wlk|wpgm|wtest|wsdl|xslt|atom|mathml|mml|xul|xbl|xaml|xq|yaml|yml)$/)) {

      navigateTo(`chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/ace.html?url=${encodeURIComponent(page.navUrl)}`)
      return true
    }
    return false
  }

  getPrevSelectedTab(key,tabs,i){
    let ind,ret
    // console.log(key,this.state.prevAddKeyCount,this.state.selectedKeys)
    if((ind = this.state.prevAddKeyCount[1].findIndex(k=>k==key))!= -1){
      const compKeys2 = [this.state.prevAddKeyCount[0],...this.state.prevAddKeyCount[1]].sort()
      const keys = this.state.selectedKeys.slice(this.state.selectedKeys.length - compKeys2.length)
      const compKeys1 = keys.sort()
      // console.log(compKeys1,compKeys2)
      if(compKeys1.every((x,i)=>x == compKeys2[i])){
        if(this.state.prevAddKeyCount[1].length == 1){
          ret = this.state.prevAddKeyCount[0]
        }
        else if(ind == this.state.prevAddKeyCount[1].length -1){
          ret = this.state.prevAddKeyCount[1][ind -1]
        }
        else{
          ret = this.state.prevAddKeyCount[1][ind +1]
        }
      }
      this.state.prevAddKeyCount[1].splice(ind,1)
    }

    if(ret && !tabs.find(tab=>tab.key == ret)){
      ret = (void 0)
    }
    // console.log(ret)

    return ret || (tabs.length > i ? tabs[i].key : tabs.length > 0 ? tabs[i - 1].key : null)


    // for(let i = this.state.selectedKeys.length - 1;i > -1 ;i--){
    //   const selected = this.state.selectedKeys[i]
    //   if(key == selected) continue
    //   if(this.state.tabs.some(tab=>tab.key==selected)){
    //     return selected
    //   }
    // }
  }

  locationContextMenu(el, tab, newPage, self, navigateTo) {
    const menuItems = []
    menuItems.push(({
      label: locale.translation("cut"), click: function () {
        clipboard.writeText(el.value.slice(el.selectionStart, el.selectionEnd))
        el.value = el.value.slice(0, el.selectionStart) + el.value.slice(el.selectionEnd)
        // self.setState({})
      }
    }))
    menuItems.push(({
      label: locale.translation("copy"), click: function () {
        clipboard.writeText(el.value.slice(el.selectionStart, el.selectionEnd))
      }
    }))
    menuItems.push(({
      label: locale.translation("paste"), click: function () {
        el.value = el.value.slice(0, el.selectionStart) + clipboard.readText() + el.value.slice(el.selectionEnd)
        // self.setState({})
      }
    }))
    menuItems.push(({
      label: locale.translation("pasteAndGo"), click: function () {
        var location = clipboard.readText()
        if(urlutil.isURL(location)){
          const url = urlutil.getUrlFromInput(location)
          el.value = url
          navigateTo(url)
        }
        else{
          self.search(tab, location, false)
        }
      }
    }))
    const menu = Menu.buildFromTemplate(menuItems)
    menu.popup(remote.getCurrentWindow())
  }


  navHandlers(tab, navigateTo, newPage, locationContextMenu) {
    const self = this
    return {
      onClickHome() {
        const cont = self.getWebContents(tab)
        // newPage.navUrl = cont.history[0]
        cont.goToIndex(0)
      },
      onClickBack() {
        console.log(767,tab)
        // console.log(self)
        const cont = self.getWebContents(tab)
        // newPage.navUrl = cont.history[cont.currentIndex-1]
        cont.goBack()
      },
      onClickForward() {
        const cont = self.getWebContents(tab)
        // newPage.navUrl = cont.history[cont.currentIndex+1]
        cont.goForward()
      },
      onClickRefresh() {
        const cont = self.getWebContents(tab)
        // newPage.navUrl = cont.history[cont.currentIndex]
        cont.reload()
      },
      onClickIndex(ind) {
        console.log(4367,tab,ind)
        const cont = self.getWebContents(tab)
        // newPage.navUrl = cont.history[ind]
        cont.goToIndex(ind)
      },
      onEnterLocation(location) {
        navigateTo(location)
        self.focus_webview(tab)
      },
      onChangeLocation(location) {
        newPage.location = location
        self.setState({})
      },
      onLocationContextMenu(e) {
        locationContextMenu(e.target)
      }
    };
  }


  pageHandlers(navigateTo, tab, self, newPage) {
    return {
      onUpdateTargetUrl(e, page) {
        if (!self.mounted) return
        if(page.statusText!==e.url){
          page.statusText = e.url
          self.setState({})
        }
      },
      onLoadCommit(e, page) {
        // console.log('onCommitted',e,Date.now(),e.isMainFrame)
        if(e.isMainFrame){
          page.navUrl = e.url;
          self.filterFromContents(page, navigateTo, tab, self);
          self.sendOpenLink(tab, page);
        }
        // ipc.send('chrome-webNavigation-onCommitted',self.createChromeWebNavDetails(tab,e.url,e))
      },
      // onWillNavigate(e, page) {
      //   console.log('onWillNavigate')
      //   page.navUrl = e.url
      //   self.sendOpenLink(tab, page);
      //   // ipc.send('chrome-webNavigation-onBeforeNavigate',self.createChromeWebNavDetails(tab))
      // },
      // onDidNavigate(e, page) {
      //   console.log('onDidNavigete',e,page)
      //   page.navUrl = e.url
      //   self.sendOpenLink(tab, page);
      //   // ipc.send('chrome-webNavigation-onBeforeNavigate',self.createChromeWebNavDetails(tab))
      // },
      onGuestReady(e, page) {
        guestIds[tab.key] = e
        tab.wvId = e.tabId
        tab._guestInstanceId = e.guestInstanceId

        self.startProcess(self, page, navigateTo, tab)

        console.log('onGuestReady', e.tabId,page)

        const cont = self.getWebContents(tab)
        cont.on('did-start-loading',e=>{
          ttime = Date.now()
          console.log('onDidStartLoading',e,Date.now())
          PubSub.publish(`did-start-loading_${tab.key}`)
        })
        cont.on('did-stop-loading',e=>{
          console.log('onDidStopLoading',e,Date.now(),page)
          console.log(tab.wv)
          if (!self.mounted) return
          // debugger

          const loc = cont.getURL()
          try{
            page.location = decodeURIComponent(loc)
          }catch(e){
            // console.log(cont.getURL(),e)
            page.location = loc
          }
          const entryIndex = cont.getCurrentEntryIndex()
          page.entryIndex = entryIndex
          page.canGoBack = entryIndex !== 0
          page.canGoForward = entryIndex + 1 !== cont.getEntryCount()
          if (!page.title){
            page.title = page.location
            if(tab.key == self.state.selectedTab && !this.isFixed) ipc.send("change-title",page.title)
          }
          page.isLoading = false
          if(page.eventDownloadStartTab) ipc.removeListener(`download-start-tab_${tab.wvId}`,page.eventDownloadStartTab)
          clearTimeout(page.downloadTimer)
          // console.log(self.refs)
          self.setState({})
          ;(async()=>{
            if((typeof page.hid === 'object' && page.hid !== null ) || (page.hid = await history.findOne({location: page.navUrl}))){
              console.log(22,page.hid)
              if(page.hid.count > 2 && !page.hid.capture){
                ipc.send('take-capture', {id : page.hid._id,url: page.navUrl,loc})
              }
            }
          })()
          // ipc.send('chrome-tab-updated',parseInt(tab.key), e, self.getChromeTab(tab))
        })
      },
      // onDidNavigateInPage(e, page) {
      //   console.log('onDidNavigateInPage')
      //   self.sendOpenLink(tab, page);
      //   page.navUrl = e.url
      // },
      onDidGetRedirectRequest(e, page) {
        console.log('redirect',e)
        // console.log('onDidGetRedirectRequest',Date.now())
        if(e.oldURL === decodeURIComponent(page.location)){
          page.navUrl = e.newURL
        }
      },
      onLoadStart(e, page) {
        console.log('onLoadStart',e,Date.now() - ttime,Date.now())
        if (!self.mounted || !e.isMainFrame) return

        page.navUrl = e.url
        let location = page.navUrl
        try{
          location = decodeURIComponent(location)
        }catch(e){}
        tab.page.location = location

        let match
        if((match = e.url.match(REG_VIDEO))){
          ipc.send('video-infos',{url:e.url})
          ipc.once('video-infos-reply',(e,{title,formats,error})=>{
            if(error) return
            for(let f of formats){
              if(f.protocol.includes('m3u8')) continue
              const fname = `${title}_${f.format.replace(/ /g,'')}.${f.ext}`
              tab.page.richContents.push({url:f.url,type:'video',fname})
            }
          })
        }

        self.sendOpenLink(tab, page);
        // self.getWebContentsAsync(tab.wv,cont=>cont.send("text-editor",page.navUrl))
        self.startProcess(self, page, navigateTo, tab, true)

        // ipc.send('chrome-tab-updated',parseInt(tab.key), e, self.getChromeTab(tab))
        console.log('onLoadStartEnd',Date.now())
        // tab.wv.openDevTools();
      },
      onDomReady(e, page, pageIndex) {
        console.log('onDomReady',e,tab,Date.now())
        if (!self.mounted) return

        console.log(canFlash)
        console.log(mainState,mainState.a)
        console.log(tab.wv,tab.wvId,guestIds.tabId,tab.e&&tab.e.tabId,tab.e,e)
        const cont = self.getWebContents(tab)

        if(canFlash) cont.authorizePlugin(canFlash)


        // tab.wv.send('set-tab',{tab:self.getChromeTab(tab)})
        page.canGoBack = cont.getCurrentEntryIndex() !== 0
        page.canGoForward = cont.getCurrentEntryIndex() + 1 !== cont.getEntryCount()
        page.canRefresh = true

        const title = cont.getTitle()
        if(tab.key == self.state.selectedTab && !this.isFixed && title != page.title){
          ipc.send("change-title",title)
        }
        page.title = cont.getTitle()
        // cont.openDevTools()

        self.setState({})
      },
      onDidFailLoad(e, page, pageIndex) {
        console.log('fail',e)
        // if (page.location !== e.validatedURL || e.errorDescription == 'ERR_ABORTED' || e.errorCode == -3 || e.errorCode == 0) return
        if(e.validatedURL == "chrome://newtab/"){
          self.navigateTo(page, topURL, tab)
        }
        // else if(e.validatedURL == "about:blank"){
        //   self.navigateTo(page, blankURL, tab)
        // }
        // self.getWebContents(tab).executeJavaScript(`document.documentElement.innerHTML = '<h1>An Error Occured.<br> Detail : ${e.errorDescription}</h1>'`)
        // page.title = 'Error Page'
        // page.favicon = 'resource/file.png'
        // self.setState({})
      },
      onDidFrameFinishLoad(e, page, pageIndex) {
        // console.log(e,"onDidFrameFinishLoad")
      },
      onFaviconUpdate(e) {
        newPage.favicon = e.favicons[0]
        self.setState({})

        let hist
        if((hist = historyMap.get(newPage.navUrl))){
          if(!hist[1]) hist[1] = newPage.favicon
        }
        else{
          historyMap.set(newPage.navUrl,[newPage.title,newPage.favicon])
        }

        if(!tab.privateMode){
          ;(async ()=>{
            if(newPage.hid || (newPage.hid = await history.findOne({location: newPage.navUrl}))){
              await history.update({_id: typeof newPage.hid == "string" ? newPage.hid : newPage.hid._id},{ $set:{favicon: newPage.favicon,updated_at: Date.now()}})
              // console.log('update_favicon')
            }
            else{
              newPage.hid = (await history.insert({location:newPage.navUrl ,title: newPage.title,favicon: newPage.favicon, created_at: Date.now(),updated_at: Date.now(),count: 1}))._id
              // console.log('insert_favicon')
            }
            const favi = await favicon.findOne({url: newPage.favicon})
            if(!(favi)){
              await favicon.insert({url:newPage.favicon , created_at: Date.now(),updated_at: Date.now()})
              ipc.send('get-a-favicon',newPage.favicon)
            }
            else if(!favi.data){
              ipc.send('get-a-favicon',newPage.favicon)
            }


          })()
        }
        // ipc.send('chrome-tab-updated',parseInt(tab.key), e, self.getChromeTab(tab))
      }
    };
  }

  startProcess(self, page, navigateTo, tab, isLoadStart) {
    const needFavicon = isLoadStart || page.favicon == "loading"
    const skip = needFavicon ? self.filterFromContents(page, navigateTo, tab, self) : false;
    if (!skip) {
      if(needFavicon){
        page.hid = null
        page.titleSet = false
        page.isLoading = true
        const navUrl = page.navUrl
        setTimeout(_=>{
          if(page.isLoading && this.refs[`navbar-${tab.key}`] && navUrl == page.navUrl){
            page.isLoading = false
            this.refs[`navbar-${tab.key}`].setState({})
          }
        },15000)
        page.favicon = page.navUrl == '' || page.navUrl.match(/^(file:\/\/|chrome|about)/) ? 'resource/file.png' : 'loading'
      }

      const eventDownloadStartTab = (event, data) => {
        const pre = {
          hid: page.hid,
          titleSet: page.titleSet,
          favicon: page.favicon,
          title: page.title,
          canGoBack: page.canGoBack
        }
        if (pre.title === 'New' && !pre.canGoBack && self.state.tabs.length > 1) {
          self.handleTabClose({noHistory: true, noSync: true}, tab.key)
        }
        page.hid = pre.hid
        page.titleSet = pre.titleSet
        page.favicon = pre.favicon
        page.isLoading = false
        self.setState({})
      }

      page.eventDownloadStartTab = eventDownloadStartTab
      window.setTimeout(() => {
        const eventStr = `download-start-tab_${tab.wvId}`
        ipc.once(eventStr, eventDownloadStartTab)
        page.downloadTimer = setTimeout(() => ipc.removeListener(eventStr, eventDownloadStartTab), 1000 * 100)
      }, 100)

      // //Regist WebRequest
      // if(self.props.callbacks['webRequest']){
      //   const webRequest = this.getWebContents(tab.wv).session.webRequest
      //   console.log(self.props.callbacks['webRequest'])
      //   for(let {appId,key,fname,filter} of self.props.callbacks['webRequest']){
      //     webRequest[fname](filter,(details, cb) => {
      //       const detailsPlus = {
      //         tabId: parseInt(tab.key),
      //         frameId: 0,
      //         parentFrameId: -1,
      //         type: details.resourceType.replace('Frame','_frame'),
      //         ...details
      //       }
      //       const ret = chromes[appId].webRequest.exeCallback(fname,key,detailsPlus)
      //
      //       // console.log(ret,fname,key,detailsPlus)
      //       cb(ret||{})
      //     })
      //   }
      // }
      self.setState({})
    }

    if (needFavicon && !tab.privateMode) {
      ;
      (async () => {
        if (page.hid || (page.hid = await history.findOne({location: page.navUrl}))) {
        }
        else {
          page.hid = (await history.insert({
            location: page.navUrl,
            created_at: Date.now(),
            updated_at: Date.now(),
            count: 1
          }))._id
          // console.log('insert_start')
        }
      })()
    }
  }

  updateOpenLink(openLink){
    if(!openLink) return [Date.now()];
    openLink.push(Date.now())
    if(openLink.length > 4) openLink.shift()
    return openLink
  }

  sendOpenLink(tab, page) {
    if(!tab.sync) return

    tab.openLink = this.updateOpenLink(tab.openLink)
    if(tab.dirc && !tab.openLink || tab.openLink.length <= 3 || tab.openLink[tab.openLink.length-1] - tab.openLink[0] >= 1500) {
      let retry = 0
      const id = window.setInterval(()=> {
        retry++
        if (!tab) {
          clearInterval(id)
          return
        }
        if (retry > 1000) {
          clearInterval(id)
          return
        }
        if (!tab.wv || !this.getWebContents(tab)) return
        clearInterval(id)
        const cont = this.getWebContents(tab)
        cont.hostWebContents.send('open-link', {url:page.navUrl, sync:tab.sync, id:tab.wvId, dirc:tab.dirc})
      }, 100)
    }
    // else if (tab.openLink && tab.openLink.length > 3 && tab.openLink[tab.openLink.length-1] - tab.openLink[0] < 1500) {
    //   tab.openLink = this.updateOpenLink(tab.openLink)
    // }
  }

  registWebView(tab, wv) {
    tab.wv = wv

    let retry = 0
    const id = window.setInterval(()=> {
      retry++
      if(!tab){
        clearInterval(id)
        return
      }
      if(retry > 1000) {
        clearInterval(id)
        return
      }
      const cont = this.getWebContents(tab)
      if (!cont) return
      clearInterval(id)
      // cont.setTabValues({windowId: 11})
    }, 100)
    // if(tab.history){
    //   let retry = 0
    //   const id = window.setInterval(()=> {
    //     retry++
    //     if(!tab){
    //       clearInterval(id)
    //       return
    //     }
    //     if(retry > 1000) {
    //       clearInterval(id)
    //       return
    //     }
    //     const cont = this.getWebContents(tab.wv)
    //     if (!cont) return
    //     clearInterval(id)
    //     // cont.history = tab.history.history
    //     // cont.currentIndex =  tab.history.currentIndex
    //     // cont.pendingIndex = tab.history.pendingIndex
    //     // cont.inPageIndex = tab.history.inPageIndex
    //   }, 300)
    // }

    this.registTabEvents(tab)
    this.registChromeEvent(tab)
  }

  registTabEvents(tab) {
    tab.events['add-favorite'] = (e, id)=> {
      if (!this.mounted) return
      if (tab.wvId && id == tab.wvId) {
        ;(async ()=> {
          const [key,url,title,favicon] = [uuid.v4(),tab.page.location,tab.page.title,tab.page.favicon]
          await favorite.insert({key, url, title, favicon, is_file:true, created_at: Date.now(), updated_at: Date.now()})
          await favorite.update({ key: 'root' }, { $push: { children: key }, $set:{updated_at: Date.now()} })
        })()
      }
    }
    ipc.on('add-favorite', tab.events['add-favorite'])

    tab.events['new-tab'] = (e, id, url, privateMode,k)=> {
      if (!this.mounted) return
      if ((tab.wvId && id == tab.wvId) || (k == this.props.k && tab.key == this.state.selectedTab)) {
        console.log(this)
        const t = tabAdd(this, url, true, privateMode || tab.privateMode,(void 0),tab.mobile,tab.adBlockThis);
        if(tab.sync){
          t.sync = uuid.v4()
          t.dirc = tab.dirc
          let retry = 0
          const id = window.setInterval(()=> {
            retry++
            if (!t) {
              clearInterval(id)
              return
            }
            if (retry > 1000) {
              clearInterval(id)
              return
            }
            if (!t.wv) return
            const cont = this.getWebContents(t)
            if (!cont) return
            clearInterval(id)
            cont.hostWebContents.send('open-panel', {url,sync:t.sync,id:tab.wvId,dirc:t.dirc,replaceInfo: tab.syncReplace,mobile: tab.mobile, adBlockThis: tab.adBlockThis})
          }, 100)
        }
      }
    }
    ipc.on('new-tab', tab.events['new-tab'])


    tab.events['new-tab-opposite'] = (e, id, url,lastMouseDown)=> {
      if (!this.mounted) return
      if (tab.wvId && id == tab.wvId) {
        const oppositeKey = lastMouseDown ? (this.props.getPrevFocusPanel(this.props.k) || this.props.getOpposite(this.props.k)) : this.props.getOpposite(this.props.k)
        if (oppositeKey && !isFixedPanel(oppositeKey))
          PubSub.publish(`new-tab-from-key_${oppositeKey}`, {url,mobile:tab.mobile, adBlockThis: tab.adBlockThis, privateMode:tab.privateMode})
        else{
          // const selectedTab =  this.state.selectedTab
          // const t = tabAdd(this, url, "nothing",(void 0),(void 0),tab.mobile,tab.adBlockThis,true);
          // setTimeout(_=> {
          //   const _tabs = this.state.tabs
          //   const i = _tabs.length - 1
          this.props.split(this.props.k, 'v',1, (void 0), (void 0), {url,mobile:tab.mobile,adBlockThis:tab.adBlockThis, privateMode:tab.privateMode})
          // PubSub.publish(`close_tab_${this.props.k}`, {key:t.key, selectedTab})
          // },100)
        }
      }
    }
    ipc.on('new-tab-opposite', tab.events['new-tab-opposite'])


    tab.events['get-private'] = (e, id)=> {
      if (!this.mounted) return
      if (tab.wvId && id == tab.wvId) {
        console.log(id)
        ipc.send('get-private-reply',tab.privateMode)
      }
    }
    ipc.on('get-private', tab.events['get-private'])


    tab.events['menu-or-key-events'] = (e, name, id, args)=> {
      if (!this.mounted) return
      if (!tab.wvId || id !== tab.wvId) return

      let match
      if(name == 'closeTab'){
        this.handleTabClose({},tab.key)
      }
      else if(name == 'navigatePage'){
        this.navigateTo(tab.page,args,tab)
      }
      else if(name == 'reopenLastClosedTab'){
        if(this.state.history.length > 0) {
          const hist = this.state.history.pop()
          const n_tab = this.createTab({default_url: hist.list[hist.currentIndex], hist})
          this.state.tabs.push(n_tab)
          console.log("selected20", n_tab.key)
          this.setState({selectedTab: n_tab.key})
          this.focus_webview(n_tab)
        }
      }
      else if(name == 'selectNextTab' || name == 'selectPreviousTab'){
        const selected = this.state.selectedTab
        const tabs = this.state.tabs
        const index = tabs.findIndex(tab=>tab.key == selected)
        const nextIndex =  (index + (name == 'selectNextTab' ? 1 : -1)  + tabs.length) % tabs.length
        this.setState({selectedTab: tabs[nextIndex].key})
      }
      else if((match = name.match(/^tab(\d)$/)) || name == 'lastTab'){
        const tabs = this.state.tabs
        const num = (match ? parseInt(match[1]) : tabs.length) - 1
        if(num < tabs.length){
          this.setState({selectedTab: tabs[num].key})
        }
      }
      else if(name == 'viewPageSource'){
        const cont = this.getWebContents(tab)
        tab.events['new-tab'](e, id, `view-source:${cont.getURL()}`)
      }
      else if(name == 'changeFocusPanel'){
        const winInfos = this.props.getScrollPriorities()
        const index = winInfos.findIndex(x=>x[0] == this.props.k)
        const nextIndex =  (index + 1 + winInfos.length) % winInfos.length
        const ele = winInfos[nextIndex]
        let ret
        for(let wv of document.querySelectorAll(`.w${ele[0]}`)){
          if(wv.parentNode.parentNode.style.visibility != 'hidden'){
            ret = wv
            break
          }
        }
        if(ret){
          ret.focus()
          global.lastMouseDown = ret
          global.lastMouseDownSet.delete(ret)
          global.lastMouseDownSet.add(ret)
        }
      }
      else if((match = name.match(/^split(Left|Right|Top|Bottom)$/))){
        const tabs = this.state.tabs
        const n = match[1]
        const dirc = n == "Left" || n == "Right" ? 'v' : 'h'
        const pos = n == "Left" || n == "Top" ? -1 : 1
        const i = tabs.findIndex(t=>tab.key == t.key)
        this.props.split(this.props.k,dirc,pos,tabs,i)
      }
      else if(name == 'swapPosition'){
        PubSub.publish(`swap-position_${this.props.k}`)
      }
      else if(name == 'switchDirection'){
        PubSub.publish(`switch-direction_${this.props.k}`)
      }
      else if(name == 'alignHorizontal'){
        PubSub.publish('align','h')
      }
      else if(name == 'alignVertical'){
        PubSub.publish('align','v')
      }
      else if(name == 'switchSyncScroll'){
        this.changeSyncMode()
      }
      else if(name == 'openSidebar'){
        this.props.fixedPanelOpen({dirc:mainState.sideBarDirection})
      }
      else if(name == 'changeMobileAgent'){
        this.refs[`navbar-${tab.key}`].handleUserAgent()
      }
      else if(name == 'detachPanel'){
        this.detachPanel()
      }
      else if(name == 'closePanel'){
        PubSub.publish(`close-panel_${this.props.k}`)
      }

    }
    ipc.on('menu-or-key-events', tab.events['menu-or-key-events'])

    // tab.wv._getId = tab.wv.getId
    // tab.wv.getId = function(){
    //   const obj = {}
    //   Error.captureStackTrace( obj, tab.wv.getId )
    //   const ret = tab.wv._getId()
    //   console.log(ret,obj.stack)
    //   return ret
    // }

    tab.events['ipc-message'] = [tab.wv,(e) => {
      if (e.channel == 'open-tab-opposite') {
        const url = e.args[1] ? e.args[0] : `file://${e.args[0]}`,
          id = tab.wvId
        tab.events['new-tab-opposite'](e, id, url,true)
      }
      else if(e.channel == 'html-content'){
        this.props.htmlContentSet.add(e.args[0])
        this.navigateTo(tab.page,e.args[0],tab)
      }
      else if(e.channel == 'get-tabs-state'){
        const key = e.args[0]
        const arr = []
        console.log(key)
        this.props.parent.allKeysAndTabs((void 0),arr,[0])
        this.getWebContents(tab).send(`get-tabs-state-reply_${key}`,arr)
      }
    }]
    tab.wv.addEventListener('ipc-message',tab.events['ipc-message'][1] )

    tab.events['search-text'] = (e, id, text)=> {
      if (!this.mounted) return
      if (tab.wvId && id == tab.wvId) {
        this.search(tab, text,true)
      }
    }
    ipc.on('search-text', tab.events['search-text'])

    tab.events['go-navigate'] = (e, id, type)=> {
      if (!this.mounted) return
      const cont = this.getWebContents(tab)
      if (cont && id == tab.wvId) {
        if (type == 'back') {
          // tab.page.navUrl = cont.history[cont.currentIndex - 1]
          tab.page.navUrl = cont.getURLAtIndex(cont.getCurrentEntryIndex() - 1)
          cont.goBack()
        }
        else if (type == 'forward') {
          // tab.page.navUrl = cont.history[cont.currentIndex + 1]
          tab.page.navUrl = cont.getURLAtIndex(cont.getCurrentEntryIndex() + 1)
          cont.goForward()
        }
        else if (type == 'reload') {
          // tab.page.navUrl = cont.history[cont.currentIndex]
          tab.page.navUrl = cont.getURLAtIndex(cont.getCurrentEntryIndex())
          cont.reload()
        }

      }
    }
    ipc.on('go-navigate', tab.events['go-navigate'])
  }

  registChromeEvent(tab) {
    tab.events[`chrome-tabs-event`] = (e,{tabId,changeInfo},type)=> {
      if (!this.mounted || tab.wvId !== tabId) return
      switch (type) {
        case 'updated':
          this.handleTabUpdated(tab,changeInfo)
          break
        case 'removed':
          this.handleTabClose({}, tab.key)
          break
      }
    }
    ipc.on(`chrome-tabs-event`, tab.events[`chrome-tabs-event`])
    //   if (cond.contId && cond.contId != this.getWebContents(tab.wv).id) return
    //
    //   switch (type) {
    //     case 'reload':
    //       cond.bypassCache ? tab.wv.reload() : tab.wv.reloadIgnoringCache()
    //       break;
    //
    //     case 'create':
    //       console.log(cond)
    //       const {url, index, selected} = cond
    //       this.createNewTab(this.state.tabs, index === (void 0) ? 0 : index - 1, url, selected)
    //       if (needCallback) ipc.send(`chrome-tab-event-reply:${resKey}`, this.getChromeTab(tab))
    //       break;
    //
    //     case 'remove':
    //       for (let tabId of cond.tabIds) {
    //         this.handleTabClose({}, tabId.toString())
    //       }
    //       if (needCallback) ipc.send(`chrome-tab-event-reply:${resKey}`)
    //       break;
    //
    //     case 'executeScript':
    //       cond.tabId = cond.tabId || this.state.selectedTab
    //       if (cond.code) {
    //         const tab = this.state.tabs.find(t=>t.key == cont.tabId.toString())
    //         tab.wv.executeJavaScript(cond.code, false,
    //             needCallback ? (result)=> ipc.send(`chrome-tab-event-reply:${resKey}`, result) : (void 0)
    //         )
    //       }
    //       else {
    //         console.log('mock_executeScript')
    //       }
    //       break;
    //   }
    // }
    // ipc.on(`chrome-tab-event`, tab.events[`chrome-tab-event`])

  }

  navigateTo(newPage, l, tab, guestInstanceId) {
    if (this.mounted){
      console.log(l)
      if(tab.bind){
        this._closeBind(tab)
        tab.bind = (void 0)
      }
      try{
        newPage.location = decodeURIComponent(l)
      }
      catch(e){
        newPage.location = l
      }
      if(!tab.guestInstanceId){
        if(tab.wv){
          const cont = this.getWebContents(tab)
          if(cont){
            cont.loadURL(convertURL(l))
          }
          else{
            tab.wv.setAttribute('src', convertURL(l))
          }
        }
        else{
          setTimeout(_=>{
            const cont = this.getWebContents(tab)
            if(cont){
              cont.loadURL(convertURL(l))
            }
            else{
              tab.wv.setAttribute('src', convertURL(l))
            }
          },1000)
        }
      }
      else{
        // tab.wv.reload()
        const cont = this.getWebContents(tab)
        if(cont){
          const title = cont.getTitle()
          if(tab.key == this.state.selectedTab  && !this.isFixed && title != tab.page.title){
            ipc.send("change-title",title)
          }
          tab.page.title = title
          tab.page.location = decodeURIComponent(this.getWebContents(tab).getURL())
          tab.page.titleSet = true
        }
      }
      newPage.navUrl = l
      newPage.richContents = []
      this.setState({})
    }
  }

  createPageObject (location) {
    return {
      location: location ||'',
      title: 'New',
      statusText: false,
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
      canRefresh: false,
      favicon: 'loading'
    }
  }

  createTab({default_url,c_page=null,c_wv=null,c_key=null,hist=null,privateMode=false,pin=false,guestInstanceId,rest} = {}){
    default_url = default_url || (isFixedVerticalPanel(this.props.k) ? sidebarURL : topURL)
    const tab = {events:{},ext:{}}
    if(c_wv) tab.wv = c_wv
    // if(hist) tab.history = hist
    if(rest) Object.assign(tab,rest)
    if(tab.oppositeMode === (void 0)){
      tab.oppositeMode = isFloatPanel(this.props.k) ? false : this.state ? this.state.oppositeGlobal : mainState.oppositeGlobal
    }
    if(tab.adBlockThis === (void 0)) tab.adBlockThis = true

    if(guestInstanceId) tab.guestInstanceId = guestInstanceId

    const newPage = c_page || this.createPageObject(default_url)
    const navigateTo = (l)=> this.navigateTo(newPage, l, tab)
    const locationContextMenu = (el)=> this.locationContextMenu(el, tab, newPage, this, navigateTo)

    const returnWebView = (wv)=>{
      this.registWebView(tab, wv)
      navigateTo(newPage.location)
      // if(hist){
      // let retry = 0
      // const id = window.setInterval(()=> {
      //   retry++
      //   if(retry > 1000) {
      //     clearInterval(id)
      //     return
      //   }
      //   const cont = this.getWebContents(wv)
      //   console.log(cont)
      //   if (!cont) return
      //   clearInterval(id)
      //   // wv.clearHistory()
      //   for(let url of hist.list){
      //     console.log(33355,url)
      //     wv.setAttribute('src',url)
      //   }
      //   wv.goToIndex(hist.currentIndex)
      // }, 300)
      // }
      // ipc.send('chrome-webNavigation-onCreatedNavigationTarget', this.createChromeWebNavDetails(tab,newPage.location))
    }
    if(c_wv) this.registWebView(tab, c_wv)

    tab.events['create-web-contents'] = (e,{id,targetUrl,disposition,guestInstanceId})=>{
      console.log('0create-web-contents',tab,this)
      if (!this.mounted )
        return

      if (!tab.wvId || tab.wvId !== id)
        return

      console.log('create-web-contents',tab,this)

      const url = targetUrl

      const opposite = (tab.oppositeMode && !global.middleButtonLongPressing) || (!tab.oppositeMode && global.middleButtonLongPressing)

      global.middleButtonLongPressing = (void 0)

      if(!tab.sync && !isFloatPanel(this.props.k) && opposite && disposition !== 'foreground-tab'){
        const oppositeKey = this.props.getOpposite(this.props.k)
        if (oppositeKey && !isFixedPanel(oppositeKey)){
          PubSub.publish(`new-tab-from-key_${oppositeKey}`, {url,mobile:tab.mobile, adBlockThis: tab.adBlockThis,privateMode:tab.privateMode})
          return
        }
        else{
          this.props.split(this.props.k, 'v',1, (void 0), (void 0), {url,mobile:tab.mobile,adBlockThis:tab.adBlockThis,privateMode:tab.privateMode})
          return
        }
      }

      const t = tabAdd(this, url, disposition === 'foreground-tab',tab.privateMode,guestInstanceId,tab.mobile,tab.adBlockThis)

      if(tab.sync){
        t.sync = uuid.v4()
        t.dirc = tab.dirc
        let retry = 0
        const id = window.setInterval(()=> {
          retry++
          if (!t) {
            clearInterval(id)
            return
          }
          if (retry > 1000) {
            clearInterval(id)
            return
          }
          if (!t.wv || !t.wvId) return
          const cont = this.getWebContents(t)
          clearInterval(id)
          cont.hostWebContents.send('open-panel', {url,sync:t.sync,id:t.wvId,dirc:t.dirc,fore:disposition === 'foreground-tab',replaceInfo: tab.syncReplace,mobile: tab.mobile, adBlockThis: tab.adBlockThis,privateMode:tab.privateMode})
        }, 100)
      }
    }
    ipc.on('create-web-contents',tab.events['create-web-contents'])

    tab.syncMode = ({url,dirc,sync,replaceInfo})=> {
      let retryNum = 0
      let winInfos = this.props.getScrollPriorities((void 0),dirc)
      const index = winInfos.findIndex(x=>x[0] == this.props.k)
      const winInfo = winInfos[index]
      console.log('sync-mode', url,dirc,sync,replaceInfo)

      const idParent = window.setInterval(()=> {
        if(retryNum++ > 3){
          clearInterval(idParent)
        }
        tab.dirc = dirc || 1

        let retry = 0
        const id = window.setInterval(()=> {
          retry++
          if(retry > 200) {
            clearInterval(id)
            return
          }
          if (!tab.wv || !this.getWebContents(tab)) return

          if(!winInfos){
            winInfos = this.props.getScrollPriorities((void 0),dirc)
          }

          exeScript(tab.wv,()=>clearInterval(id), ()=> {
            ___SPLIT___
            let retry = 0
            const id = window.setInterval(()=> {
              retry++
              if(retry > 200) {
                clearInterval(id)
                return
              }
              // console.log(window.scrollY)

              clearInterval(id)

              const loadedEvent = _=>{
                if(!window.__blankLast__){
                  const ele = document.createElement('div')
                  ele.id = '__blank-last__'
                  ele.style.height = `${100 * i}vh`
                  ele.style.width = "100%"
                  document.body.appendChild(ele)
                  window.__blankLast__ = true
                }
                if (!r && window.scrollY < Math.min(200,y) && y !== window.scrollY){
                  window.scrollTo(window.scrollX, y)
                  const evt = document.createEvent('HTMLEvents')
                  evt.initEvent('scroll', true, true)
                  window.dispatchEvent(evt);
                }
              }

              if(document.readyState == "loading"){
                document.addEventListener("DOMContentLoaded",loadedEvent)
              }
              else{
                loadedEvent()
              }


              if(!r){
                window.__scrollSync__ = i
                window.__syncKey__ = s
              }
            }, 50)
          }, `const i = ${index}`, `const y = ${winInfo[2]}`,`const s = '${sync}'`,`const r = ${(replaceInfo || tab.syncReplace) ? "true" : "false"}`)
        }, 500)
      },1000)
    }

    const key = c_key || `${Date.now().toString()}_${uuid.v4()}`
    if(rest && rest.bind){
      setTimeout(_=>PubSub.publish(`bind-window_${key}`),200)
    }

    return Object.assign(tab,
      {key ,
        // {key: c_key || Date.now().toString(),
        privateMode,
        pin,
        page: newPage,
        locationContextMenu,
        navHandlers: this.navHandlers(tab, navigateTo, newPage, locationContextMenu),
        pageHandlers: this.pageHandlers(navigateTo, tab, this, newPage),
        returnWebView
      })
  }

  webViewCreate(){
    if(this.mounted===false) return
    const div = this.refs[`div-${this.state.selectedTab}`]
    if(!div) return


    const ref = div.getBoundingClientRect()
    const navbar = ReactDOM.findDOMNode(this.refs[`navbar-${this.state.selectedTab}`])
    PubSub.publish('webview-create', {key: this.props.k,
      val: this.state.tabs.map((tab)=> {return  {
          key: tab.key,
          tab,
          privateMode: tab.privateMode,
          isActive: this.state.selectedTab == tab.key,
          ref: ref,
          navbar: navbar,
          float:this.props.float
          // chromeTab: this.getChromeTab(tab)
        }}
      ).filter(x=> x.key !== undefined)})
  }

  closeSyncTabs(key){
    if(this.mounted === false) return
    const tab = this.state.tabs.find(x => x.key == key)
    console.log('closeSyncTab',tab)
    if(!tab || !tab.sync) return
    PubSub.publish('close-sync-tabs',{k:this.props.k,sync:tab.sync})
  }

  TabPanelClose(key){
    console.log('TabPanelClose')
    for(let tab of this.state.tabs){
      this._closeBind(tab)
    }

    key = key || this.state.selectedTab
    this.closeSyncTabs(key)
    const tab = this.state.tabs.find(x => x.key == key)
    // if(tab) ipc.send('chrome-tab-removed',parseInt(tab.key))

    this.mounted = false
    PubSub.publish('tab-close', {key: this.props.k})
    this.state.tabs.forEach(tab=>{
      removeEvents(ipc,tab.events)
    })
    if(this.eventOpenPanel) ipc.removeListener('open-panel',this.eventOpenPanel)
    if(this.eventOpenLink) ipc.removeListener('open-link',this.eventOpenLink)
  }

  buildRegExp(fromStr){
    try{
      return new RegExp(fromStr,'i')
    }catch(e){
      return (void 0)
    }
  }

  syncUrl(url,replaceInfo,currentUrl,force){
    if(!replaceInfo) return url
    const winInfos = this.props.getScrollPriorities()
    let index = 0
    if(!force){
      index = winInfos.findIndex(x=>x[0]==this.props.k) - 1
      if(index == -1) return currentUrl ? (void 0) : url
    }
    replaceInfo = replaceInfo.filter(x=>x[0])

    const size = replaceInfo.length
    const info = replaceInfo[index >= size ? (size-1) : index]

    const reg = this.buildRegExp(info[1])
    if(!reg) return url

    const to = info[2].replace(/\$(\$\d)/g,`${this.uuid}$1a${this.uuid}`)

    const ret = url.replace(reg,to)
    console.log(to == info[2] ? ret : ret.replace(new RegExp(`${this.uuid}(.+?)a${this.uuid}`),(_,p1)=>encodeURIComponent(p1)))
    return to == info[2] ? ret : ret.replace(new RegExp(`${this.uuid}(.+?)a${this.uuid}`),(_,p1)=>encodeURIComponent(p1))

  }
  componentWillMount(){
    this.props.parent.refs2[this.props.k] = this
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return !this.noUpdate
  // }


  componentDidMount() {
    console.log('componentDidMount')
    this.mounted = true
    this.isFixed = isFixedPanel(this.props.k)

    this.webViewCreate()

    this.eventOpenPanel = (e, {url,sync,id,dirc=1,fore=true,replaceInfo,needCloseTab=false,mobile,adBlockThis,privateMode})=> {
      if(sync && this.isFixed) return

      let orgReplaceInfo = replaceInfo
      let singlePane = false
      let key
      if(id) {
        this.state.tabs.forEach(tab=> {
          const cont = this.getWebContents(tab)
          if (cont && id === tab.wvId) {
            key = tab.key
            tab.syncReplace = replaceInfo || tab.syncReplace
            replaceInfo = tab.syncReplace

            if(this.isFixed) return

            if(sync && !tab.sync){
              tab.sync = sync
              if(this.props.getAllKey().filter(key=>!isFixedPanel(key)).length == 1){
                console.log(url)
                this.props.split(this.props.k,'v',1,(void 0),(void 0),{url:this.syncUrl(url,orgReplaceInfo,(void 0),true),mobile:tab.mobile,adBlockThis:tab.adBlockThis,privateMode:tab.privateMode})
                setTimeout(()=>{
                  cont.hostWebContents.send('open-panel',{url,sync,id,dirc,replaceInfo:tab.syncReplace,needCloseTab:true,mobile:tab.mobile,adBlockThis:tab.adBlockThis,privateMode:tab.privateMode})
                },0)
                return
              }
              this.setState({})
            }
            if(sync) setTimeout(()=>tab.syncMode({url,dirc,sync,replaceInfo:replaceInfo}),100)
            return
          }
        })
      }


      if(!key) {
        if(this.isFixed) return

        const tab = needCloseTab ? this.state.tabs[0] : tabAdd(this, this.syncUrl(url,replaceInfo,(void 0),true),fore,privateMode,(void 0),mobile,adBlockThis)
        // if(needCloseTab) PubSub.publish(`close_tab_${this.props.k}`, {key:this.state.tabs[0].key})

        key = tab.key
        tab.syncReplace = replaceInfo || tab.syncReplace
        replaceInfo = tab.syncReplace
        if(sync){
          if(!tab.sync){
            tab.sync = sync
            if(this.props.getAllKey().filter(key=>!isFixedPanel(key)).length == 1){
              // setTimeout(()=>{
              const cont = this.getWebContents(tab)
              console.log(url)
              this.props.split(this.props.k,'v',1,(void 0),(void 0),{url:this.syncUrl(url,replaceInfo),mobile:tab.mobile,adBlockThis:tab.adBlockThis,privateMode:tab.privateMode})
              setTimeout(()=>{
                cont.hostWebContents.send('open-panel',{url,sync,id:tab.wvId,dirc,replaceInfo:tab.syncReplace,needCloseTab:true,mobile:tab.mobile,adBlockThis:tab.adBlockThis,privateMode:tab.privateMode})
              },0)
              this.setState({})
              // },100)
              return
            }
            this.setState({})
          }
          tab.openLink = this.updateOpenLink(tab.openLink)
          setTimeout(()=>tab.syncMode({url,dirc,sync,replaceInfo:replaceInfo}),100)
        }
      }

      if(orgReplaceInfo){
        setTimeout(()=>PubSub.publish(`update-replace-info_${key}`,replaceInfo),100)
      }
    }

    ipc.on('open-panel',this.eventOpenPanel)


    this.eventOpenLink = (e, {url,sync,id,dirc=1})=> {
      if(this.isFixed) return

      let key,tab
      if(id) {
        this.state.tabs.forEach(tab=> {
          const cont = this.getWebContents(tab)
          if (cont && id === tab.wvId) {
            console.log(444,tab.prevSyncNav,url)
            // if(tab.prevSyncNav == url && tab.page.navUrl != url) return
            tab.prevSyncNav = url
            key = tab.key
            if(!tab.sync){
              tab.sync = sync
              this.setState({})
            }
            setTimeout(()=>tab.syncMode({url,dirc,sync,replaceInfo:tab.syncReplace}),100)
            return
          }
        })
      }
      if(!key && (tab = this.state.tabs.find(x => x.sync == sync))){
        key = tab.key
        console.log(666,tab.prevSyncNav,url)
        if(tab.prevSyncNav == url) return
        tab.prevSyncNav = url
        if(tab.page.navUrl == url) return
        console.log(777,tab.prevSyncNav,url)

        const syncUrl = this.syncUrl(url,tab.syncReplace,tab.page.navUrl)
        if(!syncUrl) return

        this.navigateTo(tab.page,syncUrl , tab)
        if(!tab.sync){
          tab.sync = sync
          this.setState({})
        }
        tab.openLink = this.updateOpenLink(tab.openLink)
        setTimeout(()=>tab.syncMode({url,dirc,sync,replaceInfo:tab.syncReplace}),100)
      }
    }

    ipc.on('open-link',this.eventOpenLink)
    // console.log(this.state)
    this.setState({})
  }

  componentWillUnmount() {
    console.log('componentWillUnmount')
    this.mounted = false
    this.state.tokens.pubsub.forEach(x=>PubSub.unsubscribe(x))
    this.state.tokens.ipc.forEach(x=>removeEvents(ipc,x))
    this.state.tabs.forEach(tab=>{
      removeEvents(ipc,tab.events)
    })
    if(this.eventOpenPanel) ipc.removeListener('open-panel',this.eventOpenPanel)
    if(this.eventOpenLink) ipc.removeListener('open-link',this.eventOpenLink)
    // delete this.props.parent.refs2[this.props.k]
    this.props.parent.setState({})
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.toggleNav !== nextProps.toggleNav){
      this.setState({tabBar: void 0})
    }
  }

  componentDidUpdate(prevProps, prevState){
    // console.log('componentDidUpdate')
    if(!this.drag){
      this.webViewCreate()
      this.props.child[0] = this.state
    }
    const sameSelected = this.selectedTab == this.state.selectedTab
    if(sameSelected) return

    const allKeySame = this.state.tabKeys.length == this.state.tabs.length &&
      this.state.tabKeys.every((pre,i)=> this.state.tabs[i].key == pre)
    // if(allKeySame) return

    const isChangeSelected = !sameSelected
    if(isChangeSelected) {
      this.state.selectedKeys = this.state.selectedKeys.filter(key => key != this.state.selectedTab && this.state.tabs.some(tab => tab.key == key))
      this.state.selectedKeys.push(this.state.selectedTab)
    }


    this.state.tabKeys = []
    let i = 0
    console.log(2222,this.props.panelId)
    this.selectedTab = this.state.selectedTab
    const changeTabInfos = []
    for(let tab of this.state.tabs){
      if(tab.wvId === (void 0)) continue
      this.state.tabKeys.push(tab.key)
      const cont = this.getWebContents(tab)
      let isActive
      if(isChangeSelected){
        isActive = tab.key == this.state.selectedTab
        if(isActive && !this.isFixed){
          ipc.send("change-title",tab.page.title)
        }
        if(tab.bind){
          console.log(88988,'tabchange')
          ipc.send('set-pos-window',{id:tab.bind.id,top:isActive ? 'above' : 'not-above'})
        }
      }
      if(isActive || !allKeySame) changeTabInfos.push({tabId:tab.wvId,active:isActive,index:allKeySame ? (void 0) : (this.props.panelId*1000 + i++)})
    }
    if(changeTabInfos.length > 0){
      ipc.send('change-tab-infos',changeTabInfos)
    }
  }

  handleTabSelect(e, key) {
    console.log('handleTabSelect key:', key)

    const tab = this.state.tabs.find(x => x.key == key)
    if(!tab) return

    if(!this.isFixed){
      ipc.send("change-title",tab.page.title)
    }
    PubSub.publish('sync-select-tab',{k:this.props.k,sync:tab.sync})

    // this.webViewCreate()
    console.log("selected04",key)
    this.setState({selectedTab: key})
    this.focus_webview(tab)
  }

  _closeBind(tab){
    if(tab.bind){
      try{
        PubSub.unsubscribe(tab.bind.token)
        clearInterval(tab.bind.interval)
        const ob = tab.bind.observe
        ob[0].unobserve(ob[1])
        const win = tab.bind.win
        win.removeListener('move',tab.bind.move)
        win.removeListener('blur',tab.bind.blur)
        win.removeListener('focus',tab.bind.focus)
        console.log(889889,'close')
        ipc.send('set-pos-window',{key:tab.key,id:tab.bind.id,top:'not-above',restore:true})

      }catch(e){
        console.log(2525,e)
      }
    }
  }

  handleCloseRemoveOtherContainer(e,currentTabs) {
    const tab = this.state.tabs[e.oldIndex]

    this._closeBind(tab)
    if(currentTabs.length==0){
      this.props.close(this.props.k)
      this.TabPanelClose(tab.key)
    }
    else{
      if(tab.events) removeEvents(ipc,tab.events)
      this.state.tabs.splice(e.oldIndex,1)
      console.log("selected05", this.getPrevSelectedTab(tab.key,this.state.tabs,e.oldIndex))
      this.setState({selectedTab: this.getPrevSelectedTab(tab.key,this.state.tabs,e.oldIndex)})
      // ipc.send('chrome-tab-removed',parseInt(tab.key))
    }
  }

  handleTabClose(e, key,isUpdateState=true) {
    if (!this.mounted) return
    console.log('tabClosed key:', key);
    const i = this.state.tabs.findIndex((x)=> x.key == key)

    this._closeBind(this.state.tabs[i])
    if(this.state.tabs.length==1){
      if(!e.noSync) this.closeSyncTabs(key)
      this.props.close(this.props.k)
      this.TabPanelClose(key)
    }
    else{
      if(!e.noSync) this.closeSyncTabs(key)
      if(this.state.tabs[i].events) removeEvents(ipc,this.state.tabs[i].events)
      // ipc.send('chrome-tab-removed',parseInt(this.state.tabs[i].key))
    }
    console.log('handleTabClose')

    this.addCloseTabHistory(e, i)

    if(this.state.tabs[i].events) removeEvents(ipc,this.state.tabs[i].events)
    this.state.tabs.splice(i,1)
    const _tabs = this.state.tabs

    console.log(94,this.getPrevSelectedTab(key,_tabs,i),key,_tabs,i)

    if (!this.mounted) return
    console.log("selected06",this.state.selectedTab !== key ? this.state.selectedTab : this.getPrevSelectedTab(key,_tabs,i))

    if(isUpdateState){
      this.setState({tabs:_tabs,
        selectedTab: this.state.selectedTab !== key ? this.state.selectedTab : this.getPrevSelectedTab(key,_tabs,i)
        // selectedTab: _tabs.length > i ? _tabs[i].key : _tabs.length > 0 ? _tabs[i-1].key : null
      } )
    }
  }

  closeOtherTabs(key){
    let arr = []
    for(let tab of this.state.tabs){
      if(tab.key != key) arr.push(tab.key)
    }
    arr.forEach((key,i)=> this.handleTabClose({}, key, i == arr.length - 1))
  }

  closeRightTabs(key){
    let arr = []
    let isAppear = false
    for(let tab of this.state.tabs){
      if(isAppear && tab.key != key){
        arr.push(tab.key)
      }
      else if(tab.key == key){
        isAppear = true
      }
    }
    arr.forEach((t,i)=> this.handleTabClose({}, t, i == arr.length - 1))
  }

  addCloseTabHistory(e, i) {
    if (!e.noHistory && !this.state.tabs[i].privateMode) {
      const cont = this.getWebContents(this.state.tabs[i])
      const list = []
      let histNum, currentIndex
      if (cont && !cont.isDestroyed()) {
        // currentIndex = cont.getCurrentEntryIndex()
        // for(let i=0;i<histNum;i++){
        //   list.push(cont.getURLAtIndex(i))
        // }
        currentIndex = 0
        list.push(this.state.tabs[i].page.navUrl)
      }
      else {
        currentIndex = 0
        list.push(this.state.tabs[i].page.navUrl)
      }
      const history = {list, currentIndex}
      this.state.history.push(history)
    }
  }

  handleTabUpdated(tab,changeInfo){
    console.log(changeInfo)
    if(changeInfo.active){
      console.log("selected07",tab.key)
      // this.setState({selectedTab: tab.key}) @TODO
    }
    else if(changeInfo.pinned != (void 0)){
      tab.pin = changeInfo.pinned
      this.setState({})
    }
  }

  handleTabPositionChange(e, key, currentTabs) {
    if (!this.mounted) return

    // console.log(98)
    console.log("selected08",key)
    this.setState({tabs: currentTabs.map((x)=>this.state.tabs.find((t)=>t.key === x.key)),selectedTab: key});
  }

  handleTabAddOtherContainer(e, key, currentTabs) {
    // console.log(98)
    this.state.tabs = currentTabs.map(tab=>{
      const orgTab = tab.props.orgTab
      return tab.key == key ? this.createTab({c_page:orgTab.page,c_wv:orgTab.wv,c_key:orgTab.key,rest:{wvId:orgTab.wvId,bind:orgTab.bind,mobile:orgTab.mobile,adBlockThis:orgTab.adBlockThis,oppositeMode:orgTab.oppositeMode}}) : orgTab
    })
    console.log("selected09",key)
    this.setState({selectedTab: key})
  }

  handleTabAddOtherPanel(key,tabs){
    let i = this.state.tabs.findIndex((x)=>x.key===key)
    let n_tab

    for(let orgTab of tabs){
      n_tab = this.createTab({c_page:orgTab.page,c_wv:orgTab.wv,c_key:orgTab.key,rest:{wvId:orgTab.wvId,bind:orgTab.bind,mobile:orgTab.mobile,adBlockThis:orgTab.adBlockThis,oppositeMode:orgTab.oppositeMode}})
      this.state.tabs.splice(++i, 0, n_tab)
    }
    console.log("selected10",n_tab.key)
    this.setState({selectedTab: n_tab.key})
    this.focus_webview(n_tab)
  }

  handleTabAddButtonClick(e, currentTabs) {
    // key must be unique
    const t = this.createTab()
    const key = t.key;
    // this.state.tabs.splice(i+1, 0,t )
    this.state.tabs.push(t)
    console.log("selected11",key)
    this.setState({selectedTab: key})
    this.focus_webview(t)
    return t
  }

  onAddFavorites(){
    const keys = []
    let head
    const datas = this.state.tabs.map((tab,i)=>{
        const {page} = tab
        if(i==0){
          head = multiByteSlice(page.title,12)
        }
        const key = uuid.v4()
        keys.push(key)
        return {key, url:page.navUrl, title:page.title, favicon:page.favicon, is_file:true, created_at: Date.now(), updated_at: Date.now()}
      })
    ;(async ()=> {
      const dirc = moment().format("YYYY/MM/DD HH:mm:ss")
      const key = uuid.v4()
      await favorite.insert(datas)
      await favorite.insert({key, title:`${head} ${dirc}`, is_file:false, created_at: Date.now(), updated_at: Date.now(),children: keys})
      await favorite.update({ key: 'root' }, { $push: { children: key }, $set:{updated_at: Date.now()} })
    })()
  }

  handleContextMenu(e,key,currentTabs,tabs){
    const _tabs = this.state.tabs
    const i = _tabs.findIndex((x)=>x.key===key)
    const t = _tabs[i]
    var menuItems = []
    // menuItems.push(({ label: 'New Tab', click: ()=>document.querySelector(".rdTabAddButton").click()}))
    menuItems.push(({ label: locale.translation('newTab'), click: ()=>this.createNewTab(_tabs, i)}))
    menuItems.push(({ label: locale.translation('newPrivateTab'), click: ()=>this.createNewTab(_tabs, i,{default_url:topURL,privateMode:Math.random().toString()})}))
    menuItems.push(({ type: 'separator' }))

    // menuItems.push(({ label: locale.translation('reload'), click: ()=>this.getWebContents(t).reload()}))

    const splitFunc = (dirc,pos)=> {
      if(_tabs.length > 1) {
        this.props.split(this.props.k,dirc,pos,_tabs,i)
        this.handleTabClose({}, key)
        PubSub.publish(`close_tab_${this.props.k}`,{key})
      }
      else{
        this.props.split(this.props.k, dirc, pos * -1)
      }
    }

    const splitOtherTabsFunc = (dirc,pos)=> {
      const arr = []
      const indexes = []
      let isAppear = false
      this.state.tabs.forEach((tab,i)=>{
        if((pos == -1 && !isAppear && tab.key != key)||
          (pos == 1 && isAppear && tab.key != key)){
          arr.push(tab.key)
          indexes.push(i)
        }
        else if(tab.key == key){
          isAppear = true
        }
      })

      if(_tabs.length > 1) {
        this.props.split(this.props.k,dirc,pos,_tabs,indexes)
        arr.forEach((key,i)=> {
          PubSub.publish(`close_tab_${this.props.k}`,{key,isUpdateState:i == arr.length - 1})
        })
      }
    }

    const detachToFloatPanel = _=>{
      if(_tabs.length > 1) {
        this.props.addFloatPanel(_tabs,i)
        PubSub.publish(`close_tab_${this.props.k}`,{key})
      }
      else{
        const t = this.handleTabAddButtonClick()
        setTimeout(_=> {
          const _tabs = this.state.tabs
          const i = _tabs.findIndex((x)=>x.key === key)
          this.props.addFloatPanel(_tabs, i)
          PubSub.publish(`close_tab_${this.props.k}`, {key})
        },100)
      }
    }

    if(!this.isFixed){
      menuItems.push(({ label: 'Split Left', click: splitFunc.bind(this,'v',-1) }))
      menuItems.push(({ label: 'Split Right', click: splitFunc.bind(this,'v',1) }))
      menuItems.push(({ label: 'Split Top', click: splitFunc.bind(this,'h',-1) }))
      menuItems.push(({ label: 'Split Bottom', click: splitFunc.bind(this,'h',1) }))
    }
    menuItems.push(({ type: 'separator' }))
    // menuItems.push(({ label: 'Split Left Tabs to Left', click: splitOtherTabsFunc.bind(this,'v',-1) }))
    menuItems.push(({ label: 'Split right tabs to right', click: splitOtherTabsFunc.bind(this,'v',1) }))
    menuItems.push(({ label: 'Floating Panel', click: _=>detachToFloatPanel() }))
    menuItems.push(({ type: 'separator' }))
    if(!this.isFixed){
      menuItems.push(({ label: 'Swap Position', click: ()=> { PubSub.publish(`swap-position_${this.props.k}`)} }))
      menuItems.push(({ label: 'Switch Direction', click: ()=> { PubSub.publish(`switch-direction_${this.props.k}`)} }))
      menuItems.push(({ type: 'separator' }))
      menuItems.push(({ label: 'Align Horizontal', click: ()=> { PubSub.publish('align','h')} }))
      menuItems.push(({ label: 'Align Vertical', click: ()=> { PubSub.publish('align','v')} }))
      menuItems.push(({ type: 'separator' }))
    }

    menuItems.push(({ label: locale.translation('3007771295016901659'), //'Duplicate',
      click: ()=> {
        // const n_tab = this.createTab({default_url:t.page.location})
        // _tabs.splice(i + 1, 0,n_tab )
        // this.focus_webview(n_tab)
        // this.setState({selectedTab: n_tab.key})
        ipc.send("set-recent-url",t.page.navUrl)
        this.getWebContents(t).clone()
      } }))

    menuItems.push(({ label: t.pin ? locale.translation('unpinTab') : locale.translation('pinTab'), click: ()=> {t.pin = !t.pin;this.setState({})}}))
    menuItems.push(({ type: 'separator' }))

    // menuItems.push(({ label: locale.translation('3551320343578183772'), //close tab
    //   click: ()=> this.handleTabClose({}, key)}))

    menuItems.push(({ label: 'Close all Tabs', click: ()=> {
      // console.log(this)
      this.props.close(this.props.k)
      this.TabPanelClose()
    } }))

    menuItems.push(({ label: locale.translation('closeOtherTabs'), click: ()=> this.closeOtherTabs(key)}))
    menuItems.push(({ label: locale.translation('closeTabsToRight'), click: ()=> this.closeRightTabs(key)}))


    menuItems.push(({ type: 'separator' }))

    if(this.state.history.length > 0){
      menuItems.push(({ label: locale.translation('reopenLastClosedTab'), click: ()=> {
        const hist = this.state.history.pop()
        const n_tab = this.createTab({default_url:hist.list[hist.currentIndex],hist})
        _tabs.splice(i + 1, 0, n_tab )
        console.log("selected12",n_tab.key)
        this.setState({selectedTab: n_tab.key})
        this.focus_webview(n_tab)
      }
      }))
    }
    menuItems.push(({ label: locale.translation('5078638979202084724'),//'Add pages to Favorites',
      click: ::this.onAddFavorites }))
    let menu = Menu.buildFromTemplate(menuItems)

    menu.popup(remote.getCurrentWindow())
  }

  createNewTab(tabs, i = tabs.length -1,opt={}) {
    setTimeout(_=>{
      const n_tab = this.createTab(opt)
      tabs.splice(i + 1, 0, n_tab)
      console.log("selected13",n_tab.key)
      this.setState({tabs,selectedTab: n_tab.key})
      this.focus_webview(n_tab)
    },100)
  }


  createNewTabFromOtherWindow(tab,trans) {
    const tabs = this.state.tabs
    const keySet = trans.map(t=>t.key)
    ipc.send("close-tab-from-other-window-to-main",{orgK:trans[0].k,windowId:trans[0].windowId,newWindowId:this.props.windowId,keySet})
    ipc.once('detach-tab-from-other-window',(e,datas)=>{
      let i = tabs.findIndex(t=>t.key == tab.key)
      let n_tab

      console.log(tab,datas)

      for(let data of datas){
        remote.getWebContents(data.wvId,cont=>{
          this.props.currentWebContents[data.wvId] = cont
        })
        n_tab = this.createTab({c_page:data.c_page,c_key:data.c_key,privateMode:data.privateMode,pin:data.pin,guestInstanceId:data.guestInstanceId,rest:data.rest})
        tabs.splice(++i, 0, n_tab)
      }

      console.log("selected14",n_tab.key)
      this.setState({selectedTab: n_tab.key})
      this.focus_webview(n_tab)
    })
  }

  handleKeyDown(e) {
    // if(e.stopPropagation) e.stopPropagation()
    PubSub.publish('webview-keydown',{event:{...e},wv:this.state.tabs.find(x => x.key == this.state.selectedTab).wv})
  }

  scrollPage(dirc){
    const tab = this.state.tabs.find(x => x.key == this.state.selectedTab)
    const winInfos = this.props.getScrollPriorities(this.scrollbar === void 0 ? 15 : this.scrollbar,tab.dirc || 1)
    const index = winInfos.findIndex(x=>x[0]==this.props.k)
    const winInfo = winInfos[index]

    console.log(winInfo)

    exeScript(tab.wv,void 0, ()=> {
      ___SPLIT___
      ;
      // console.log((window.__scrollSync__ === 0 ? y2 : y1 ) + window.scrollY)
      const c = window.scrollTo(window.scrollX, (window.__scrollSync__ === 0 ? b : a ) + window.scrollY)
    }, `const a = ${dirc=='next' ? '': '-'} ${winInfo[3]}`, `const b = ${dirc=='next' ? '': '-'} ${winInfo[4]}`)
  }

  changeSyncMode(replaceInfo){
    if(this.isFixed) return

    const tab = this.state.tabs.find(x => x.key == this.state.selectedTab)
    const tabSyncReplace = tab.syncReplace
    const tabSync = tab.sync
    if(tab.sync){
      const sync = tab.sync
      tab.sync = void 0
      tab.syncReplace = void 0
      tab.openLink = void 0
      tab.dirc = void 0
      exeScript(tab.wv, void 0, ()=> {
        const ele = document.getElementById('__blank-last__')
        if(ele) ele.parentNode.removeChild(ele)

        window.__scrollSync__ = void 0
        window.__syncKey__ = void 0
      },'')
      PubSub.publish('close-sync-tabs',{k:this.props.k,sync})
      // this.setState({tabs : this.state.tabs})
      this.setState({})
    }
    if(!tabSync || (tabSyncReplace && !replaceInfo)||(!tabSyncReplace && replaceInfo)){
      const cont = this.getWebContents(tab)
      cont.hostWebContents.send('open-panel', {url:tab.page.navUrl, sync:uuid.v4(), id:tab.wvId,replaceInfo,mobile: tab.mobile, adBlockThis: tab.adBlockThis});
    }
  }

  updateReplaceInfo(replaceInfo){
    const tab = this.state.tabs.find(x => x.key == this.state.selectedTab)
    tab.syncReplace = replaceInfo
  }

  changeOppositeMode(){
    const tab = this.state.tabs.find(x => x.key == this.state.selectedTab)
    tab.oppositeMode = !tab.oppositeMode
    this.setState({})
  }

  syncZoom(percent,sync){
    PubSub.publish('sync-zoom',{k:this.props.k,percent,sync})
  }

  // getTabs(cond) {
  //   let tabs = this.state.tabs
  //
  //   if(cond.activePanel){
  //     if(tabs.find(tab=>{const cont = tab.wv && this.getWebContents(tab.wv); return cont && cont.isFocused()}) === (void 0))
  //       return []
  //   }
  //   tabs = cond.tabId ? tabs.filter(t=>t.key === cond.tabId.toString()) : tabs
  //   tabs = cond.activeTabinActivePanel ? tabs.filter(tab=>{const cont = this.getWebContents(tab.wv); return cont && cont.isFocused()}) : tabs
  //   tabs = cond.contId ? tabs.filter(tab=>{const cont = this.getWebContents(tab.wv); return cont && cont.id == cond.contId}) : tabs
  //   tabs = cond.index ? tabs.slice(cond.index , 1) : tabs
  //   tabs = cond.url && cond.url != '<all_urls>' ? tabs.filter(tab=>tab.page.navUrl == cond.url) : tabs
  //
  //   return tabs.map(tab=>this.getChromeTab(tab))
  // }

  // addWebRequestCallback(params){
  //   const {appId,key, fname,filter} = params
  //   for(let tab of this.state.tabs){
  //     if(!tab.wv || !this.getWebContents(tab.wv)) continue
  //     const webRequest = this.getWebContents(tab.wv).session.webRequest
  //     webRequest[fname](filter,(details, cb) => {
  //       const detailsPlus = {
  //         tabId: parseInt(tab.key),
  //         frameId: 0,
  //         parentFrameId: -1,
  //         type: details.resourceType.replace('Frame','_frame'),
  //         ...details
  //       }
  //       const ret = chromes[appId].webRequest.exeCallback(fname,key,detailsPlus)
  //       // console.log(ret,fname,key,detailsPlus)
  //       cb(ret||{})
  //     })
  //   }
  // }

  // createChromeWebNavDetails(tab,url,e) {
  //   return {
  //     tabId: parseInt(tab.key),
  //     sourceTabId: parseInt(tab.key), //Not Support
  //     url: url || tab.page.navUrl,
  //     frameId: e && e.isMainFrame ? 0 : Math.random()
  //   };
  // }
  //
  // getChromeTab(tab){
  //   const selected = this.state.selectedTab == tab.key
  //   return {
  //     id: parseInt(tab.key),
  //     index: this.state.tabs.findIndex(t=>t.key == tab.key),
  //     selected,
  //     highlighted :selected,
  //     url: tab.page.navUrl,
  //     windowId: this.props.winId,
  //     contId: tab.wv && this.getWebContents(tab.wv) && this.getWebContents(tab.wv).id,
  //     title: tab.page.title
  //   }
  // }

  getWebContents(tab){
    if(!tab.wv || !tab.wvId){
      let e
      if(!(e = guestIds[tab.key])){
        return
      }
      tab.wvId = e.tabId
      console.log(111,tab.wvId,e)
    }
    return this.props.currentWebContents[tab.wvId]
  }

  focus_webview(tab,flag=true) {
    let retry = 0
    const id = window.setInterval(()=> {
      retry++
      if(!tab){
        clearInterval(id)
        return
      }
      if(retry > 100) {
        clearInterval(id)
        return
      }
      const t = tab.wv
      if (!t || tab.page.isLoading || !this.getWebContents(tab)) return
      clearInterval(id)
      const active = document.activeElement
      if((flag || active.className != 'prompt')|| active.tagName == 'BODY')
        t.focus()
    }, 100)
  }

  updateTitle(cont){
    const id = cont.getId()
    this.state.tabs.forEach(tab=> {
      if (tab.wvId && tab.wvId === id) {
        console.log('onPageTitleSet')
        console.log(cont.getURL())

        if (!this.mounted) return
        const url = cont.getURL()

        const title = cont.getTitle()
        if(tab.key == this.state.selectedTab && !this.isFixed && title != tab.page.title){
          ipc.send("change-title",title)
        }
        tab.page.title = title

        tab.page.navUrl = url
        tab.prevSyncNav = url //@TOOD arrage navurl,location,sync panel
        try{
          tab.page.location = decodeURIComponent(url)
        }catch(e){
          tab.page.location = url
        }
        tab.page.titleSet = true

        // console.log(1444,cont.getURL(),tab.page.title)
        let hist
        if((hist = historyMap.get(url))){
          if(!hist[0]) hist[0] = tab.page.title
        }
        else{
          historyMap.set(url,[tab.page.title])
        }

        if(!tab.privateMode){
          ;(async ()=>{
            // console.log('his-update',tab.page.location)
            if(tab.page.hid || (tab.page.hid = await history.findOne({location: tab.page.navUrl}))){
              await history.update({_id: typeof tab.page.hid == "string" ? tab.page.hid : tab.page.hid._id},{ $set:{title: tab.page.title,updated_at: Date.now()},$inc:{count: 1}})
            }
            else{
              // console.log('his-insert',tab.page.location)
              tab.page.hid = (await history.insert({location:tab.page.navUrl ,title: tab.page.title, created_at: Date.now(),updated_at: Date.now(),count: 1}))._id
            }
          })()
        }
        try{
          this.refs[`navbar-${tab.key}`].refs['loc'].canUpdate = true
        }catch(e){
          console.log(e)
        }
        this.setState({})
        // ipc.send('chrome-tab-updated',parseInt(tab.key), cont, this.getChromeTab(tab))
        return
      }
    })
  }

  toggleNavPanel(num){
    // tabsStyles.tabBar.display = !this.state.tabBar && (this.props.toggleNav == 0 || this.props.toggleNav == 2) ? "flex" : "none"
    this.setState({tabBar: num})
  }

  deleteNotification(i,pressIndex,value){
    ipc.send(`reply-notification-${this.state.notifications[i].key}`,{pressIndex,value})
    this.state.notifications.splice(i,1)
    this.setState({})
  }


  detachPanel(bounds={}) {
    if(!this.props.parent.state.root.r) return
    const promises = this.state.tabs.map(tab=>{
      return new Promise((resolve,reject)=>{
        this.getWebContents(tab).detach(_=>{
          resolve({wvId:tab.wvId,c_page:tab.page,c_key:tab.key,privateMode:tab.privateMode,pin:tab.pin,
            rest:{wvId:tab.wvId,openlink: tab.openlink,sync:tab.sync,syncReplace:tab.syncReplace,dirc:tab.dirc,ext:tab.ext,oppositeMode:tab.oppositeMode,bind:tab.bind,mobile:tab.mobile,adBlockThis:tab.adBlockThis},guestInstanceId: tab._guestInstanceId || this.getWebContents(tab).guestInstanceId})
        })
      })
    })
    Promise.all(promises).then(vals=>{
      BrowserWindowPlus.load({id:remote.getCurrentWindow().id,...bounds,tabParam:JSON.stringify(vals)})
      PubSub.publish(`close-panel_${this.props.k}`)
    })
  }

  getFocusedTabId(activeElement){
    if(activeElement.tagName == 'WEBVIEW'){
      const tab = this.state.tabs.find(tab=>ReactDOM.findDOMNode(tab.wv) == activeElement)
      if(tab) return tab.wvId
    }
  }

  getSelectedTabId(){
    const tab = this.state.tabs.find(tab=>tab.key == this.state.selectedTab)
    if(tab) return tab.wvId
  }

  getTabFromTabId(id){
    return this.state.tabs.find(x=>x.wvId === id)
  }

  getTabsInfo(){
    return this.state.tabs.map(tab=>{
      const historyList = []
      let cont, currentIndex
      if((cont = this.getWebContents(tab))){
        let histNum = cont.getEntryCount()
        currentIndex = histNum - cont.getCurrentEntryIndex() - 1
        for(let i=histNum -1;i>=0;i--){
          const url = cont.getURLAtIndex(i)
          const datas = historyMap.get(url)
          historyList.push({title:datas && datas[0],url,favicon: datas && datas[1]})
        }
      }
      return {currentIndex,historyList,selectedTab: tab.key == this.state.selectedTab}
    })
  }

  search(tab, text, checkOpposite, forceNewTab){
    const splitText = text.match(/^(.+?)([\t ]+)(.+)$/)
    let engine = mainState.searchEngine
    if(splitText && spAliasMap.has(splitText[1])){
      engine = spAliasMap.get((splitText[1]))
      text = splitText[3]
    }

    let searchMethod = searchProviders[engine]
    if(searchMethod.search){
      searchMethod = {multiple: [searchMethod.name], type: 'basic'}
    }
    const searchs = searchMethod.multiple
    const urls = searchs.map(engine=> searchProviders[engine].search.replace('%s',text))

    if(searchMethod.type == 'basic' || searchMethod.type == 'two'){
      this.searchSameWindow(tab,urls,checkOpposite,searchMethod.type, forceNewTab)
    }
    else{
      BrowserWindowPlus.load({id:remote.getCurrentWindow().id,sameSize:true,tabParam:JSON.stringify({urls,type:searchMethod.type})})
    }
  }

  searchSameWindow(tab, urls, checkOpposite, type, forceNewTab){
    let i = 0
    for(let url of urls) {
      const isFirst = i === 0 || (i === 1 && type == 'two')
      const condBasic = type == 'basic' && checkOpposite && !isFloatPanel(this.props.k) && this.state.oppositeGlobal
      const condTwo = type == 'two' && i % 2 == 1
      if (condBasic || condTwo) {
        const oppositeKey = this.props.getOpposite(this.props.k)
        if (!isFirst || (oppositeKey && !isFixedPanel(oppositeKey)))
          PubSub.publish(`new-tab-from-key_${oppositeKey}`, {url, mobile: tab.mobile, adBlockThis: tab.adBlockThis,notSelected: !isFirst,privateMode:tab.privateMode})
        else {
          setTimeout(_=>{
            this.props.split(this.props.k, 'v', 1, (void 0), (void 0), {
              url,
              mobile: tab.mobile,
              adBlockThis: tab.adBlockThis,
              privateMode: tab.privateMode
            })
          },100)
        }
      }
      else {
        if(!checkOpposite && isFirst){
          if(forceNewTab){
            tab.events['new-tab']({}, tab.wvId,url,tab.privateMode)
          }
          else{
            this.navigateTo(tab.page, url, tab)
          }
        }
        else{
          const t = tabAdd(this, url, isFirst, tab.privateMode, (void 0), tab.mobile, tab.adBlockThis);
          if (tab.sync) {
            t.sync = uuid.v4()
            t.dirc = tab.dirc
            let retry = 0
            const id = window.setInterval(() => {
              retry++
              if (!t) {
                clearInterval(id)
                return
              }
              if (retry > 1000) {
                clearInterval(id)
                return
              }
              if (!t.wv) return
              const cont = this.getWebContents(t)
              if (!cont) return
              clearInterval(id)
              cont.hostWebContents.send('open-panel', {
                url,
                sync: t.sync,
                id: tab.wvId,
                dirc: t.dirc,
                replaceInfo: tab.syncReplace,
                mobile: tab.mobile,
                adBlockThis: tab.adBlockThis,
                privateMode: tab.privateMode
              })
            }, 100)
          }
        }
      }
      i++
    }
  }

  render() {
    let toggle = this.state.tabBar !== (void 0) ? this.state.tabBar : this.props.toggleNav
    if(toggle == 1 && this.props.k.match(/fixed\-[lr]/)) toggle = 0
    return (
      <Tabs
        tabsClassNames={tabsClassNames}
        tabsStyles={tabsStyles}
        selectedTab={this.state.selectedTab}
        onTabSelect={::this.handleTabSelect}
        onClose={::this.handleCloseRemoveOtherContainer}
        onTabClose={::this.handleTabClose}
        onTabAddOtherContainer={::this.handleTabAddOtherContainer}
        onTabAddButtonClick={::this.handleTabAddButtonClick}
        onTabPositionChange={::this.handleTabPositionChange}
        onTabContextMenu={::this.handleContextMenu}
        handleTabAddOtherPanel={::this.handleTabAddOtherPanel}
        onKeyDown={::this.handleKeyDown}
        createNewTabFromOtherWindow={::this.createNewTabFromOtherWindow}
        toggleNav={toggle}
        isTopLeft={this.props.isTopLeft}
        isTopRight={this.props.isTopRight}
        fullscreen={this.props.fullscreen}
        parent={this}
        isOnlyPanel={!this.props.parent.state.root.r}
        windowId={this.props.windowId}
        k={this.props.k}
        ref='tabs'
        tabs={this.state.tabs.map((tab)=>{
          return (<Tab key={tab.key} beforeTitle={tab.page.title && tab.page.favicon !== 'loading' ? (<img className='favi' src={tab.page.favicon} onError={(e)=>{e.target.src = 'resource/file.png'}}/>) : (<svg dangerouslySetInnerHTML={{__html: svg }} />)}
                       title={tab.page.favicon !== 'loading' || tab.page.titleSet ? tab.page.title : 'loading'} orgTab={tab} pin={tab.pin} privateMode={tab.privateMode}>
            <div style={{height: '100%'}} className="div-back" ref={`div-${tab.key}`} >
              <BrowserNavbar ref={`navbar-${tab.key}`} tabkey={tab.key} k={this.props.k} {...tab.navHandlers} parent={this} privateMode={tab.privateMode} page={tab.page} tab={tab}
                             richContents={tab.page.richContents} wv={tab.wv} sync={tab.sync} replaceInfo={tab.syncReplace} oppositeMode={tab.oppositeMode} oppositeGlobal={this.state.oppositeGlobal} toggleNav={toggle}
                             scrollPage={::this.scrollPage} historyMap={historyMap} changeSyncMode={::this.changeSyncMode} updateReplaceInfo={::this.updateReplaceInfo}
                             changeOppositeMode={::this.changeOppositeMode} syncZoom={::this.syncZoom} currentWebContents={this.props.currentWebContents}
                             isTopRight={this.props.isTopRight} isTopLeft={this.props.isTopLeft} detachPanel={::this.detachPanel}
                             fixedPanelOpen={this.props.fixedPanelOpen} toggleNavPanel={::this.toggleNavPanel} tabBar={!this.state.tabBar} hidePanel={this.props.hidePanel}
                             fullscreen={this.props.fullscreen} search={::this.search} bind={tab.bind}/>
              {this.state.notifications.map((data,i)=>{
                if(data.needInput){
                  console.log(225,data)
                  return <InputableDialog data={data} key={i} k={this.props.k} delete={this.deleteNotification.bind(this,i)} />
                }
                else if(data.import){
                  return <ImportDialog data={data} key={i} k={this.props.k} delete={this.deleteNotification.bind(this,i)} />
                }
                else{
                  return <Notification data={data} key={i} k={this.props.k} delete={this.deleteNotification.bind(this,i)} />
                }
              })}
            </div>
          </Tab>)
        })}
      />
    )
  }
};
