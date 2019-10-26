const React = require('react')
const {Component} = React
const {remote} = require('electron');
const mainState = require('./mainStateRemote')
const {app,Menu,clipboard} = remote
import Tabs from './draggable_tab/components/Tabs'
import Tab from './draggable_tab/components/Tab'
const {BrowserNavbar} = require('./browserNavbar')
const PubSub = require('./pubsub')
const uuid = require('node-uuid')
const ReactDOM = require('react-dom')
const ipc = require('electron').ipcRenderer
const path = require('path');
const {favicon,history,media,syncReplace,tabState} = require('./databaseRender')
const favorite = require('electron').remote.require('./remoted-chrome/favorite')
const db = require('./databaseRender')
const Notification = require('./Notification')
const InputableDialog = require('./InputableDialog')
const ImportDialog = require('./ImportDialog')
const ConverterDialog = require('./ConverterDialog')
import BookmarkBar from "./BookmarkBar";
import url from 'url'
const moment = require('moment')
const urlutil = require('./urlutil')
const {messages,locale} = require('./localAndMessage')
const isWin = navigator.userAgent.includes('Windows')
const isLinux = navigator.userAgent.includes('Linux')
const sharedState = require('./sharedState')
const BrowserPageStatus = require('./BrowserPageStatus')
// const autoHighLightInjection = require('./autoHighLightInjection')
const InputPopup = require('./InputPopup')
const browserActionMap = require('./browserActionDatas')

let searchProviders,spAliasMap,autocompleteUrl
updateSearchEngine();

// const chromes =  require('electron').remote.getGlobal('chrome')

// ipc.setMaxListeners(0)
// window.setInterval(()=>{console.log(ipc.listenerCount('new-tab'))},1000)
let topURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html',
  bookmarksURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite.html',
  historyURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/history.html'
const sidebarURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite_sidebar.html'
const blankURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/blank.html'
const REG_VIDEO = /^https:\/\/www\.(youtube)\.com\/watch\?v=(.+)&?|^http:\/\/www\.(dailymotion)\.com\/video\/(.+)$|^https:\/\/(vimeo)\.com\/(\d+)$/
const REG_HIGHLIGHT_SITES = /www\.google\..+?q=|search\.yahoo\.c.+?p=|www\.baidu\.com.+?wd|\.baidu\.com.+?word=|www\.ask\.com.+?q=|\.bing\.com.+?q=|www\.youdao\.com.+?q=/
sharedState.homeURL = topURL

let [newTabMode,inputsVideo,disableTabContextMenus,priorityTabContextMenus,reloadIntervals,closeTabBehavior,keepWindowLabel31,multistageTabs,maxrowLabel,addressBarNewTab,alwaysOpenLinkBackground,adBlockEnable,searchWordHighlight,searchWordHighlightRecursive,openTabPosition,tabPreview,tabPreviewRecent,fullscreenTransition,showAddressBarFavicon,showAddressBarBookmarks,openTabNextLabel] =
  ipc.sendSync('get-sync-main-states',['newTabMode','inputsVideo','disableTabContextMenus','priorityTabContextMenus','reloadIntervals','closeTabBehavior','keepWindowLabel31','multistageTabs','maxrowLabel','addressBarNewTab','alwaysOpenLinkBackground','adBlockEnable','searchWordHighlight','searchWordHighlightRecursive','openTabPosition','tabPreview','tabPreviewRecent','fullscreenTransition','showAddressBarFavicon','showAddressBarBookmarks','openTabNextLabel'])

sharedState.tabPreview = tabPreview
sharedState.tabPreviewRecent = tabPreviewRecent
// sharedState.searchWordHighlight = searchWordHighlight
// sharedState.searchWordHighlightRecursive = searchWordHighlightRecursive
sharedState.showAddressBarFavicon = showAddressBarFavicon
sharedState.showAddressBarBookmarks = showAddressBarBookmarks

disableTabContextMenus = new Set(disableTabContextMenus)
// sharedState.searchWords = {}


function getNewTabPage(){
  const arr = ipc.sendSync('get-sync-main-states',[
    newTabMode == 'myHomepage' ? 'myHomepage' : newTabMode == 'top' ? 'topPage' :
      newTabMode == 'favorite' ? 'bookmarksPage' :
        newTabMode == 'history' ? 'historyPage' : 'none',
    'bookmarksPage','historyPage','myHomepage'])
  topURL = arr[0] || `chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/${newTabMode}.html`
  bookmarksURL = arr[1] || bookmarksURL
  historyURL = arr[2] || historyURL
  sharedState.homeURL = arr[3] || topURL
  sharedState.topURL = topURL
}

function diffArray(arr1, arr2) {
  return arr1.filter(e=>!arr2.includes(e))
}

function sameArray(arr1, arr2) {
  if(arr1.length != arr2.length) return false
  for(let i=0;i<arr1.length;i++){
    if(arr1[i] != arr2[i]) return false
  }
  return true
}

ipc.on('update-mainstate',(e,key,val)=>{
  if(key == 'myHomepage' || key == 'newTabMode'){
    getNewTabPage()
  }
})
getNewTabPage()

let isRecording
ipc.on('record-op',(e,val)=>{
  isRecording = val
})

const activeTabs = {}
const closingPos = {}

const convertUrlMap = new Map([
  ['about:blank','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/blank.html'],
  ['chrome://bookmarks-sidebar/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite_sidebar.html'],
  ['chrome://tab-history-sidebar/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/tab_history_sidebar.html'],
  ['chrome://tab-trash-sidebar/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/tab_trash_sidebar.html'],
  ['chrome://download-sidebar/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/download_sidebar.html'],
  ['chrome://note-sidebar/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/note_sidebar.html'],
  ['chrome://note/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/note.html'],
  ['chrome://session-manager-sidebar/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/saved_state_sidebar.html'],
  ['chrome://history-sidebar/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/history_sidebar.html'],
  ['chrome://explorer/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/explorer.html'],
  ['chrome://explorer-sidebar/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/explorer_sidebar.html'],
  ['chrome://download/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/download.html'],
  ['chrome://terminal/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/terminal.html'],
  ['chrome://converter/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/converter.html'],
  ['chrome://automation/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/automation.html'],
  ['chrome://setting/','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html'],
  ['chrome://setting#general','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#general'],
  ['chrome://setting#search','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#search'],
  ['chrome://setting#tabs','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#tabs'],
  ['chrome://setting#keyboard','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#keyboard'],
  ['chrome://setting#extensions','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#extensions'],
])

const firefoxAddonSite = 'https://addons.mozilla.org'
const allSelectedkeys = sharedState.allSelectedkeys
const gRefs2 = {}

function updateSearchEngine(){
  const vals = ipc.sendSync('get-sync-main-states',['searchProviders','searchEngine'])
  searchProviders = {...vals[0]}
  const searchEngine = vals[1]
  autocompleteUrl = (searchProviders[searchEngine] && searchProviders[searchEngine].autocomplete) || searchProviders['Google'].autocomplete
  spAliasMap = new Map(Object.values(searchProviders).map(sp=> [sp.shortcut,sp.name]))
}

ipc.on("update-search-engine",updateSearchEngine)

function convertURL(url){
  return url == 'chrome://newtab/' ? topURL :
    url == 'chrome://bookmarks2/' ? bookmarksURL :
      url == 'chrome://history2/' ? historyURL :
        convertUrlMap.has(url) ? convertUrlMap.get(url) : url
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

function recursiveDeepCopy(o) {
  var newO,
    i;

  if (typeof o !== 'object') {
    return o;
  }
  if (!o) {
    return o;
  }

  if ('[object Array]' === Object.prototype.toString.apply(o)) {
    newO = [];
    for (i = 0; i < o.length; i += 1) {
      newO[i] = recursiveDeepCopy(o[i]);
    }
    return newO;
  }

  newO = {};
  for (i in o) {
    if (o.hasOwnProperty(i)) {
      newO[i] = recursiveDeepCopy(o[i]);
    }
  }
  return newO;
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
      ipc.removeListener(key,value)
    }
  }
}

function tabAdd(self, url, isSelect=true,privateMode = false,guestInstanceId,mobile,adBlockThis,fields,last=false) {
  const t = self.createTab({default_url:convertURL(url),privateMode,guestInstanceId,fields,rest:{mobile,adBlockThis}})
  const key = t.key


  if(openTabNextLabel || last == 'next'){
    const index = self.state.tabs.findIndex(t=>t.key == self.state.selectedTab)
    if(index != null){
      self.state.tabs.splice(index + 1, 0, t)
    }
    else{
      self.state.tabs.push(t)
    }
  }
  else if(last){
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
    // sharedState.allSelectedkeys.add(key)
    console.log("selected01",key)
    self.setState({selectedTab: key})
    self.focus_webview(t,t.page.location != topURL,t.page.location == topURL)
  }
  else
    self.setState({})

  return t
}

function exeScript(wv,callback,evalFunc,...args){
  let strs = `(${evalFunc.toString()})()`.split(/___SPLIT___,?/)
  if(strs.length > 1) strs.splice(1,0,...args)
  // console.log(strs.join('\n'))
  wv.executeJavaScript(strs.join(';\n'),callback)
}

function exeScriptInIsolation(wv,callback,evalFunc,...args){
  let strs = `(${evalFunc.toString()})()`.split(/___SPLIT___,?/)
  if(strs.length > 1) strs.splice(1,0,...args)
  // console.log(strs.join('\n'))
  const key = uuid.v4()
  wv.send('execute-script-in-isolation-world', key, strs.join(';\n'))
  ipc.once(`execute-script-in-isolation-world-reply_${key}`,(e,...args) =>callback(...args))
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
  tabBar: {},
  tab:{},
  tabTitle: {},
  tabCloseIcon: {},
  tabBefore: {},
  tabAfter: {}
};

let ttime = 0
let guestIds = {}
let historyMap = new Map([
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html',[locale.translation('topPage'),'resource/file.svg']],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/blank.html',['Blank','resource/file.svg']],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite.html',[locale.translation('bookmarks'),'resource/file.svg']],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/history.html',[locale.translation('history'),'resource/file.svg']],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/tab_history.html',['Tab History','resource/file.svg']],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/explorer.html',[locale.translation('fileExplorer'),'resource/file.svg']],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/download.html',[locale.translation('downloads'),'resource/file.svg']],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/converter.html',[locale.translation('videoConverter'),'resource/file.svg']],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/automation.html',[locale.translation('Automation'),'resource/file.svg']],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/terminal.html',[locale.translation('terminal'),'resource/file.svg']],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html',[locale.translation('settings'),'resource/file.svg']],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/note.html',[locale.translation('note'),'resource/file.svg']],
])

// const withWindowCreateTabs = new Set()
export default class TabPanel extends Component {
  constructor(props) {
    super(props);
    const self = this

    if(!gRefs2[this.props.k]) gRefs2[this.props.k] = {}
    this.refs2 = gRefs2[this.props.k]

    this.initFunction()
    const tokens = {pubsub:this.initEventListener(),ipc:this.initIpcEvents()}
    this.uuid = uuid.v4().replace(/\-/g,"")
    console.log(65654,props)

    if(this.mounted === false){
    }
    else if(this.props.attach){
      console.log('TabAttach',this.props.attach)
      const attachTabs = this.props.attach.data
      this.props.attach.delete()
      let tabs
      tabs = attachTabs.map(tab=>{
        // console.log(37,{c_page:tab.c_page,c_key:tab.c_key,privateMode:tab.privateMode,pin:tab.pin,wvId:tab.wvId,guestInstanceId: tab.guestInstanceId,rest:tab.rest})
        return this.createTab({c_page:tab.c_page,privateMode:tab.privateMode,tabPreview:tab.tabPreview,pin:tab.pin,protect:tab.protect,lock:tab.lock,mute:tab.mute,fields:tab.fields,reloadInterval:tab.reloadInterval,guestInstanceId: tab.guestInstanceId,rest:tab.rest})
      })

      this.state = {tokens,
        oppositeGlobal: ipc.sendSync('get-sync-main-state','oppositeGlobal'),
        tabs,
        tabBar:props.k.match(/^fixed-bottom/) ? 1 : props.k.match(/^fixed-(left|right)/) ? 0 :(void 0),
        prevAddKeyCount: [null,[]],
        notifications: [],
        history: [],
        tabKeys: []
      }

      ipc.send("change-title",this.state.tabs[0].page.title)
      this.state.selectedTab = this.state.tabs[0].key
      this.state.selectedKeys = [this.state.selectedTab]
      sharedState.allSelectedkeys.add(this.state.selectedTab)

      this.focus_webview(this.state.tabs[0],false)
      this.props.child[0] = this
    }
    else if(this.props.node[2] && this.props.node[2].length > 1){
      console.log('TabSplit')
      this.props.node.pop()
      const indexes = this.props.node.pop()
      const fromTabs = this.props.node.pop()
      const tabs = indexes.map(i=>{
        const tab = fromTabs[i]
        return this.createTab({c_page:tab.page,c_wv:tab.wv,c_div:tab.div,c_key:tab.key,privateMode:tab.privateMode,tabPreview:tab.tabPreview,pin:tab.pin,protect:tab.protect,lock:tab.lock,mute:tab.mute,fields:tab.fields,reloadInterval:tab.reloadInterval,guestInstanceId: tab.guestInstanceId
          ,rest:{rSession:tab.rSession,wvId:tab.wvId,openlink: tab.openlink,sync:tab.sync,syncReplace:tab.syncReplace,dirc:tab.dirc,ext:tab.ext,oppositeMode:tab.oppositeMode,bind:tab.bind,mobile:tab.mobile,adBlockThis:tab.adBlockThis}})
      })
      this.state = {tokens,
        oppositeGlobal: ipc.sendSync('get-sync-main-state','oppositeGlobal'),
        tabs,
        tabBar:props.k.match(/^fixed-bottom/) ? 1 : props.k.match(/^fixed-(left|right)/) ? 0 :(void 0),
        prevAddKeyCount: [null,[]],
        notifications: [],
        history: [],
        tabKeys: []
      }
      const selectedTab = this.state.tabs[0]
      this.state.selectedTab = selectedTab.key
      this.state.selectedKeys = [this.state.selectedTab]
      sharedState.allSelectedkeys.add(this.state.selectedTab)


      if(selectedTab.wvId == global.lastMouseDown[1]){
        global.lastMouseDown = [[...document.querySelectorAll('.split-window')].find(e=>e.classList.length == 1),
          selectedTab.wvId, this.props.k]
        console.log(888,global.lastMouseDown)
      }

      this.focus_webview(this.state.tabs[0],false)
      this.props.child[0] = this
    }
    else if(this.props.child[0] === undefined || this.props.node[4]){
      let params
      if(this.props.node[4]){
        params = this.props.node.pop()
        this.props.node.pop()
        this.props.node.pop()
      }
      console.log('TabCreate')
      const tab = this.createTab(params && {default_url:params.url,privateMode: params.privateMode,guestInstanceId: params.guestInstanceId, fields: params.fields,
        rest:{bind:params.bind,mobile:params.mobile,adBlockThis:params.adBlockThis,tabPreview:params.tabPreview}})
      // withWindowCreateTabs.add(tab.key)

      if(params && params.guestInstanceId)ipc.send('create-web-contents-reply2',params.guestInstanceId, this.props.k, tab.key)

      this.state = {tokens,
        oppositeGlobal: ipc.sendSync('get-sync-main-state','oppositeGlobal'),
        tabs:[tab],
        tabBar:props.k.match(/^fixed-bottom/) ? 1 : props.k.match(/^fixed-(left|right)/) ? 0 :(void 0),
        prevAddKeyCount: [null,[]],
        notifications:[],
        selectedTab: tab.key,
        selectedKeys: [tab.key],
        history: [],
        tabKeys: []}
      sharedState.allSelectedkeys.add(tab.key)
      this.focus_webview(tab,false)
      this.props.child[0] = this
    }
    else if(this.props.child[0].state){
      const {state} = this.props.child[0]
      console.log('TabNoCreate',state.tabs.map(t=>{return {...t}}),state.selectedTab)
      state.tabs.forEach(tab=> removeEvents(ipc,tab.events))
      state.tokens.pubsub.forEach(x=>PubSub.unsubscribe(x))
      state.tokens.ipc.forEach(x=>removeEvents(ipc,x))
      this.state = {tokens,
        oppositeGlobal: ipc.sendSync('get-sync-main-state','oppositeGlobal'),
        tabs: state.tabs.map(tab=>this.createTab({c_page:tab.page,c_wv:tab.wv,c_div:tab.div,c_key:tab.key,privateMode:tab.privateMode,tabPreview:tab.tabPreview,pin:tab.pin,protect:tab.protect,lock:tab.lock,mute:tab.mute,fields:tab.fields,reloadInterval:tab.reloadInterval,guestInstanceId: tab.guestInstanceId,
          rest:{rSession:tab.rSession,wvId:tab.wvId,openlink: tab.openlink,sync:tab.sync,syncReplace:tab.syncReplace,dirc:tab.dirc,ext:tab.ext,oppositeMode:tab.oppositeMode,bind:tab.bind,mobile:tab.mobile,adBlockThis:tab.adBlockThis}})),
        tabBar:state.tabBar,
        prevAddKeyCount: state.prevAddKeyCount.slice(0),
        notifications: state.notifications,
        selectedTab: state.selectedTab,
        selectedKeys: state.selectedKeys,
        history: state.history,
        tabKeys: state.tabKeys
      }
      this.props.child[0] = this
    }
    else{
      console.log('RestoreTab',this.props.child)
      const restoreTabs = this.props.child
      const tabs = []
      const keepTabs = ipc.sendSync('get-sync-main-state','startsWith') == 'startsWithOptionLastTime'
      let forceKeep = false
      const rSessions = ipc.sendSync('get-sync-rSession',restoreTabs.map(tab=>tab.tabKey))
      console.log(4354,rSessions)
      let i = 0
      let selectedTab
      for(let tab of restoreTabs){
        console.log(544,tab)
        if(!keepTabs && !tab.forceKeep && !tab.pin) continue
        forceKeep = tab.forceKeep
        const rSession = rSessions[i]
        if(rSession){
          rSession.urls = rSession.urls.split("\t")
          rSession.titles = rSession.titles.split("\t")
          rSession.positions = rSession.positions ? JSON.parse(rSession.positions) : []
        }
        const n_tab = this.createTab({default_url:tab.url || (rSession && rSession.urls[rSession.currentIndex]),initPos: rSession && rSession.positions[rSession.currentIndex],privateMode:tab.privateMode,tabPreview:tab.tabPreview,pin:tab.pin,protect:tab.protect,lock:tab.lock,mute:tab.mute,fields:tab.fields,reloadInterval:tab.reloadInterval,guestInstanceId: tab.guestInstanceId,rest:{rSession}})
        if(tab.lock){
          const id = setInterval(_=>{
            if(n_tab.wvId){
              mainState.add('lockTabs',n_tab.wvId,1)
              exeScript(n_tab.wv, void 0, ()=> {
                for (let link of document.querySelectorAll('a:not([target="_blank"])')) {
                  if (link.href == "") {
                  }
                  else{
                    link.target = "_blank"
                    link.dataset.lockTab = "1"
                  }
                }
              },'')
              clearInterval(id)
            }
          },300)
        }
        // if(tab.protect){
        //   const id = setInterval(_=>{
        //     if(n_tab.wvId){
        //       mainState.add('pockTabs',n_tab.wvId,1)
        //       exeScript(n_tab.wv, void 0, ()=> {
        //         if(window._unloadEvent_) return
        //         window._unloadEvent_ = e => e.returnValue = ''
        //         window.addEventListener("beforeunload", window._unloadEvent_)
        //       },'')
        //       clearInterval(id)
        //     }
        //   },300)
        // }
        tabs.push(n_tab)
        if(rSession) tabState.insert({tabKey:n_tab.key,titles:rSession.titles.join("\t"),urls:rSession.urls.join("\t"),positions: JSON.stringify(rSession.positions),currentIndex:rSession.currentIndex, updated_at: Date.now()})
        // withWindowCreateTabs.add(n_tab.key)
        if(tab.active) selectedTab = n_tab.key
        i++
      }
      if(tabs.length == 0){
        const n_tab = this.createTab()
        tabs.push(n_tab)
        // withWindowCreateTabs.add(n_tab.key)
      }

      this.state = {tokens,
        tabs,
        oppositeGlobal: ipc.sendSync('get-sync-main-state','oppositeGlobal'),
        tabBar:props.k.match(/^fixed-bottom/) ? 1 : props.k.match(/^fixed-(left|right)/) ? 0 :(void 0),
        prevAddKeyCount: [null,[]],
        notifications:[],
        selectedTab: selectedTab || (forceKeep ? tabs[0].key : tabs[tabs.length - 1].key),
        history: [],
        tabKeys: []
      }
      ipc.send("change-title",tabs[0].page.title)
      this.state.selectedKeys = [this.state.selectedTab]
      sharedState.allSelectedkeys.add(this.state.selectedTab)
      this.props.child[0] = this
    }
  }

  initFunction(){
    this.historyKeys = {}

    this.syncZoom = ::this.syncZoom
    this.toggleNavPanel = ::this.toggleNavPanel
    this.detachPanel = ::this.detachPanel
    this.search = ::this.search
    this.updateReplaceInfo = ::this.updateReplaceInfo
    this.scrollPage = ::this.scrollPage
    this.changeOppositeMode = ::this.changeOppositeMode
    this.changeSyncMode = ::this.changeSyncMode
    this.handleTabSelect = ::this.handleTabSelect
    this.handleCloseRemoveOtherContainer = ::this.handleCloseRemoveOtherContainer
    this.handleTabClose = ::this.handleTabClose
    // this.handleTabAddOtherContainer = ::this.handleTabAddOtherContainer
    this.handleTabAddButtonClick = ::this.handleTabAddButtonClick
    this.handleTabPositionChange = ::this.handleTabPositionChange
    this.handleContextMenu = ::this.handleContextMenu
    this.handleContextMenuTree = ::this.handleContextMenuTree
    // this.handleTabAddOtherPanel = ::this.handleTabAddOtherPanel
    this.multiSelectionClick = ::this.multiSelectionClick
    this.handleKeyDown = ::this.handleKeyDown
    this.createNewTabFromOtherWindow = ::this.createNewTabFromOtherWindow
    this.resetSelection = ::this.resetSelection
    this.getNextSelectedTab = ::this.getNextSelectedTab
    this.createTab = ::this.createTab
    this.webViewCreate = ::this.webViewCreate
    this.screenShot = ::this.screenShot
    // this.searchWordHighlight = ::this.searchWordHighlight
    this.navigateTo = ::this.navigateTo
    this.updateIdle = ::this.updateIdle
    this.maximizePanel = ::this.maximizePanel
    this.focus_webview = ::this.focus_webview

    if((multistageTabs && maxrowLabel != 0) || openTabPosition != 'default'){
      this.componentWillUpdate = (prevProps, prevState)=>{
        if(multistageTabs && maxrowLabel != 0 && this.state.tabKeys.length !== this.state.tabs.length){
          this.refs2[`tabs-${this.props.k}`].updateWidth()
        }
        if(openTabPosition != 'default'){
          const adds = [],rests = []
          const now = Date.now()
          this.state.tabs.forEach(e=>((this.state.tabKeys.includes(e.key) || (now - parseInt(e.key.split("_")[0]) > 300)) ? rests : adds).push(e))
          if(adds.length > 0){
            const newTabs = openTabPosition == 'left' ? [...adds,...rests] : [...rests,...adds]
            this.state.tabs.splice(0,this.state.tabs.length, ...newTabs)
            this.setState({})
          }
        }
      }
    }
  }

  initIpcEvents(){
    const eventNotification = (e,data)=>{
      if(!this.mounted) return
      let key
      if(data.id){
        const ret = this.state.tabs.find(tab=>data.id == tab.wvId)
        if(!ret) return
        key = ret.key
      }
      else if(!this.props.isTopLeft){
        return
      }
      else{
        key = this.state.selectedTab
      }
      data._key = key
      this.state.notifications.push(data)
      this.setState({})
    }
    ipc.on("show-notification",eventNotification)

    const closeTabFromOtherWindow = async (e,data)=>{
      if(!this.mounted) return
      const _tabs = this.state.tabs
      let i = 0
      console.log(data,_tabs)
      const vals = []
      for(let tab of _tabs){
        if(data.keySet.includes(tab.key)){
          const cont = this.getWebContents(tab)
          ipc.send('chrome-tabs-onDetached-to-main',tab.wvId,{oldPosition: this.state.tabs.findIndex(t=>t.key==tab.key)})
          const d = {wvId:tab.wvId,c_page:tab.page,c_key:tab.key,privateMode:tab.privateMode,tabPreview:tab.tabPreview,pin:tab.pin,protect:tab.protect,lock:tab.lock,mute:tab.mute,fields:tab.fields,reloadInterval:tab.reloadInterval,
            rest:{rSession:tab.rSession,wvId:tab.wvId,openlink: tab.openlink,sync:tab.sync,syncReplace:tab.syncReplace,dirc:tab.dirc,ext:tab.ext,oppositeMode:tab.oppositeMode,bind:tab.bind,mobile:tab.mobile,adBlockThis:tab.adBlockThis},guestInstanceId: tab.wvId}
          vals.push(d)
          ipc.send('move-browser-view', this.props.k, tab.key, 'detach')
        }
        i++
      }

      if(vals.length == 0) return
      ipc.send("detach-tab-to-main",vals)
      ipc.once('detach-tab-from-other-window-finish-from-main',_=>{
      })
    }
    ipc.on(`close-tab-from-other-window`,closeTabFromOtherWindow)

    const eventCloseSyncTab = (e,port)=>{
      if(!this.mounted) return
      for(let tab of this.state.tabs){
        if(tab.page.location == `http://localhost:${port}/sync.html`){
          PubSub.publish(`close_tab_${this.props.k}`,{key: tab.key})
        }
      }
    }
    ipc.on("close-sync-tab",eventCloseSyncTab)


    const eventChromeWindowsCreateFromTabId = async (e,createData)=>{
      if(!this.mounted) return
      const tab = this.state.tabs.find(t=>t.wvId == createData.tabId)
      if(!tab) return

      ipc.send('move-browser-view', this.props.k, tab.key, 'detach')

      const d = {wvId:tab.wvId,c_page:tab.page,c_key:tab.key,privateMode:tab.privateMode,tabPreview:tab.tabPreview,pin:tab.pin,protect:tab.protect,lock:tab.lock,mute:tab.mute,fields:tab.fields,reloadInterval:tab.reloadInterval,
        rest:{rSession:tab.rSession,wvId:tab.wvId,openlink: tab.openlink,sync:tab.sync,syncReplace:tab.syncReplace,dirc:tab.dirc,ext:tab.ext,oppositeMode:tab.oppositeMode,bind:tab.bind,mobile:tab.mobile,adBlockThis:tab.adBlockThis},guestInstanceId: tab.wvId}
      ipc.send('chrome-tabs-onDetached-to-main',d.wvId,{oldPosition: this.state.tabs.findIndex(t=>t.key==d.c_key)})

      const winId = ipc.sendSync('browser-load',{id:remote.getCurrentWindow().id,x:createData.left,y:createData.top,
        height:createData.height,width:createData.width,tabParam:JSON.stringify([d])})

    }
    ipc.on('chrome-windows-create-from-tabId',eventChromeWindowsCreateFromTabId)

    const eventRestoreTabs = (e,tabKey,tabId)=>{
      if(this.state.tabs.find(t=>t.wvId == tabId)){
        this.restoreTabFromTabKey(tabKey,void 0,void 0,
          tabId=>ipc.send(`restore-tabs-from-tabKey-reply_${tabKey}`,tabId))
      }
    }
    ipc.on('restore-tabs-from-tabKey',eventRestoreTabs)

    const eventFocusInput = (e,data)=>{
      const tab = this.state.tabs.find(t=>t.wvId == data.tabId)
      if(tab){
        if(data.mode == 'in'){
          if(!this.state.tabs.find(t=>tab.key == this.state.selectedTab)) return
          const rect = ReactDOM.findDOMNode(tab.div).getBoundingClientRect()
          const inputPopup = {tabId: data.tabId, key:tab.key,
            left: rect.left + data.x + data.width - 25, top: rect.top + data.y + data.height / 2 - 17,
            modLeft: rect.left, modTop: rect.top, tab, parent: this,
            selector: data.selector, optSelector: data.optSelector, inHistory: data.inHistory}
          this.setState({inputPopup})
        }
        else if(this.state.inputPopup && !document.activeElement.closest('.input-popup-wrapper')){
          this.setState({inputPopup: null})
        }
      }
    }
    ipc.on('focus-input',eventFocusInput)

    const eventMoveTabFromMoved = (e, tabId, toIndex, key)=>{
      const ind = this.state.tabs.findIndex(t=>t.wvId == tabId)
      if(ind != -1){
        const array_move = (arr, old_index, new_index) => {
          if (new_index >= arr.length) {
            let k = new_index - arr.length + 1;
            while (k--) {
              arr.push(void 0);
            }
          }
          arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
          return arr
        }
        const tabs = array_move(this.state.tabs.slice(), ind, toIndex).filter(x=>x)
        if(!sameArray(this.state.tabs, tabs)) this.setState({tabs})
      }
    }
    ipc.on('move-tab-from-moved',eventMoveTabFromMoved)

    const eventArrangeTabs = (e, tabIds)=>{
      for(const tabId of tabIds){
        const ind = this.state.tabs.findIndex(t=>t.wvId == tabId)
        this.state.tabs.splice(0,0,...this.state.tabs.splice(ind, 1))
      }

      this.setState({})
      // ipc.send(`arrage-tab-reply_${key}`)
    }
    ipc.on('arrange-tabs',eventArrangeTabs)

    const eventGetTabsInfo = (e, key)=>{

      const tabIds = []
      for(let tab of this.state.tabs){
        const tabId = tab.wvId || (tab.wv && tab.wv.id)
        if(tabId == null){
          return setTimeout(()=>ipc.emit(`get-tab-ids-${this.props.k}`, null, key),50)
        }
        tabIds.push(tabId)
      }

      ipc.send(`get-tab-ids-reply_${key}`, tabIds, this.state.selectedTab)

    }
    ipc.on(`get-tab-ids-${this.props.k}`,eventGetTabsInfo)

    const cacheGuestInstanceId = {}
    const eventCreateWebContents = (e,{id,targetUrl,disposition,guestInstanceId})=>{
      console.log('0create-web-contents',id,targetUrl,disposition,guestInstanceId,this)
      if (!this.mounted || cacheGuestInstanceId[guestInstanceId])
        return

      const tab = this.state.tabs.find(t=>t.wvId === id)

      if (!tab) return

      if(guestInstanceId) cacheGuestInstanceId[guestInstanceId] = true

      console.log('create-web-contents',tab.page.navUrl,this, id)

      const url = targetUrl

      if(url === void 0 && tab.privateMode && Date.now() - tab.page.createdAt < 3000 &&
        this.state.tabs.filter(t=>t.privateMode === tab.privateMode).length == 1){
        return
      }

      const opposite = (tab.oppositeMode && !global.middleButtonLongPressing) || (!tab.oppositeMode && global.middleButtonLongPressing)

      global.middleButtonLongPressing = (void 0)

      if(!tab.sync && !isFloatPanel(this.props.k) && opposite && disposition !== 'foreground-tab'){
        const oppositeKey = this.props.getOpposite(this.props.k)
        if (oppositeKey && !isFixedPanel(oppositeKey)){
          PubSub.publish(`new-tab-from-key_${oppositeKey}`, {url,mobile:tab.mobile, adBlockThis: tab.adBlockThis,fields: tab.fields,privateMode:tab.privateMode,guestInstanceId})
          return
        }
        else{
          this.props.split(this.props.k, 'v',1, (void 0), (void 0), {url,mobile:tab.mobile,adBlockThis:tab.adBlockThis,fields: tab.fields,privateMode:tab.privateMode,guestInstanceId})
          return
        }
      }

      const t = tabAdd(this, url, disposition === 'foreground-tab',tab.privateMode,guestInstanceId,tab.mobile,tab.adBlockThis,tab.fields)
      ipc.send('create-web-contents-reply2',guestInstanceId, this.props.k, t.key)

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
          cont.hostWebContents2.send('open-panel', {url,sync:t.sync,id:t.wvId,dirc:t.dirc,fore:disposition === 'foreground-tab',replaceInfo: tab.syncReplace,mobile: tab.mobile, adBlockThis: tab.adBlockThis,fields: tab.fields,privateMode:tab.privateMode})
        }, 100)
      }
    }
    ipc.on('create-web-contents',eventCreateWebContents)


    return [
      {'show-notification': eventNotification},
      {'close-tab-from-other-window': closeTabFromOtherWindow},
      {'close-sync-tab': eventCloseSyncTab},
      {'chrome-windows-create-from-tabId': eventChromeWindowsCreateFromTabId},
      {'restore-tabs-from-tabKey': eventRestoreTabs},
      {'focus-input': eventFocusInput},
      {'move-tab-from-moved': eventMoveTabFromMoved},
      {'arrange-tabs': eventArrangeTabs},
      {[`get-tab-ids-${this.props.k}`]: eventGetTabsInfo},
      {'create-web-contents': eventCreateWebContents}
    ]
  }

  initEventListener() {
    const tokenResize = PubSub.subscribe('resize', ()=> {
      this.webViewCreate()
    })
    const tokenWebViewCreate = PubSub.subscribe('web-view-create', ()=> {
      this.webViewCreate()
    })
    const tokenDrag = PubSub.subscribe('drag', (msg, val)=> {
      this.drag = val
    })
    const tokenActiveTabChanged = PubSub.subscribe('active-tab-change', (msg, val)=> {
      console.log('change-visit-state-focus',this.props.k)
      const activeTab = activeTabs[this.props.k]
      if(activeTab && val != activeTab[0].wvId){
        delete activeTabs[this.props.k]
      }
      else if(!activeTab){
        const tab = this.state.tabs.find(t=>t.key == this.state.selectedTab)
        if(val == tab.wvId){
          activeTabs[this.props.k] = [tab,tab.page.navUrl,Date.now()]
        }
      }
    })

    const tokenClose = PubSub.subscribe(`close-panel_${this.props.k}`, (msg,time)=> {
      mainState.set('keepOpen',1)
      this.props.close(this.props.k)
      if(time){
        this.TabPanelClose(void 0,time)
      }
      else{
        this.TabPanelClose()
      }
      setTimeout(_=>mainState.set('keepOpen',0),2000)
      // if(!this.props.parent.state.r) remote.getCurrentWindow().hide()
    })

    const tokenIncludeKey = PubSub.subscribe('include-key',(msg,key)=>{
      const tab = this.state.tabs.find(x => x.key == key)
      if(tab) PubSub.publish(`include-key-reply_${key}`,this.props.k)
    })

    const tokenRichMedia = PubSub.subscribe('rich-media-insert',(msg,record)=>{
      console.log('rich',record)
      const tab = this.state.tabs.find(t =>t.wvId == record.tabId)
      if(!tab) return
      if(!tab.videoEvent){
        setTimeout(_=>tab.wv.send('on-video-event',inputsVideo),200)
        tab.videoEvent = true
      }
      if(tab.page.navUrl.match(REG_VIDEO)){
        return
      }
      else if(record.url.endsWith('.ts')){
        ipc.send('video-infos',{url:tab.page.navUrl})
        ipc.once(`video-infos-reply_${tab.page.navUrl}`,(e,{title,formats,error,cache})=>{
          if(error) return
          console.log(43242342,{title,formats,error,cache})
          for(let f of formats){
            // if(f.protocol.includes('m3u8')) continue
            const format = f.format ? f.format.replace(/ /g,'') : `${f.resolution ? `${f.resolution}${f.quality ? `_${f.quality}` : ''}_${f.profile}_${f.audioEncoding || 'nonaudio'}`: 'audioonly'}`
            const fname = `${f.acodec == 'none' ? '[no-audio]' : f.vcodec == 'none' ? '[audio-only]' : ''}${title}_${format}.${f.protocol && f.protocol.includes('m3u8') ? 'm3u8' : (f.ext||f.container)}`
            if(!cache || !tab.page.richContents.find(x=>x.url == f.url)){
              tab.page.richContents.unshift({url:f.url,type:'video',fname,size: f.filesize})
            }
          }
          this.refs2[`navbar-${tab.key}`].setState({})
        })
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
      if(this.refs2[`navbar-${tab.key}`]) this.refs2[`navbar-${tab.key}`].setState({})
      if(record.url == tab.page.navUrl){
        this.navigateTo(tab.page, `chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/video.html?url=${encodeURIComponent(record.url)}${record.contType ? `&type=${encodeURIComponent(record.contType)}` : ''}`, tab)
      }
    })

    const tokenMultiScroll = PubSub.subscribe('multi-scroll-webviews',(msg,{deltaY,webviews})=>{
      console.log('multi-scroll-webviews2')
      let wv,cont
      const tab = this.state.tabs.find(t =>t.div && (wv = webviews.find(w=>w == t.div.parentNode)))
      if(!tab) return
      cont = this.getWebContents(tab)
      // cont.sendInputEvent({ type: 'mouseWheel', x: wv.x, y: wv.y, deltaX: 0, deltaY, canScroll: true});
      exeScriptInIsolation(tab.wv,(void 0), ()=> {
        ___SPLIT___
        ;
        const c = window.scrollTo(window.scrollX, window.scrollY + y)
      }, `const y = ${deltaY * -1}`)
    })

    const tokenBodyKeydown = PubSub.subscribe('body-keydown', (msg,e)=> {
      if(this.props.k !== e.key) return
      this.handleKeyDown(e)
    })


    const tokenCloseTab = PubSub.subscribe(`close_tab_${this.props.k}`, (msg,{key,selectedTab,isUpdateState=true,time})=> {
      if (!this.mounted) return
      const _tabs = this.state.tabs
      const i = this.state.tabs.findIndex(x => x.key == key)
      sharedState.allSelectedkeys.delete(key)

      if(i === -1){//@TODO
        this.setState({})
        return
      }


      // ipc.send('chrome-tab-removed', parseInt(_tabs[i].key))
      this._closeBind(_tabs[i])

      if(_tabs[i].events) removeEvents(ipc, _tabs[i].events)
      if(this.state.tabs.length==1){
        // this.state.tabs.splice(i, 1)
        mainState.set('keepOpen',1)
        this.props.close(this.props.k)
        if(time){
          this.TabPanelClose(key,time)
        }
        else{
          this.TabPanelClose(key)
        }
        setTimeout(_=>mainState.set('keepOpen',0),2000)
        // if(!this.props.parent.state.r) remote.getCurrentWindow().hide()
      }
      else{
        this.addCloseTabHistory({}, i)
        const closeTab = this.state.tabs.splice(i, 1)[0]
        if(isUpdateState){
          // console.log("selected02",selectedTab || this.getPrevSelectedTab(key,_tabs,i))
          this.setState({
            tabs: _tabs,
            // selectedTab: _tabs.length > i ? _tabs[i].key : _tabs.length > 0 ? _tabs[i - 1].key : null
            selectedTab: selectedTab || this.getPrevSelectedTab(key,_tabs,closeTab,i)
          });
        }

        if(this.state.prevAddKeyCount[0] == key){
          this.state.prevAddKeyCount = [null,[]]
        }
        this.state.prevAddKeyCount[1].forEach((x, ind) => x == key && this.state.prevAddKeyCount[1].splice(ind, 1))
      }
    })

    // const tokenAdblock = PubSub.subscribe('set-adblock-enable',(msg,enable)=> {adBlockEnable = enable;this.setState({})} )

    if(this.isFixed) return [tokenResize,tokenWebViewCreate,tokenDrag,tokenActiveTabChanged,tokenClose,tokenBodyKeydown,tokenIncludeKey,tokenRichMedia,tokenMultiScroll,tokenCloseTab]


    const tokenNewTabFromKey = PubSub.subscribe(`new-tab-from-key_${this.props.k}`, (msg,{url,mobile,adBlockThis,fields,notSelected,privateMode,guestInstanceId,type})=> {
      if (!this.mounted) return
      console.log(`new-tab-from-key_${this.props.k}`,this)
      if(!type || type == 'new-tab'){
        const t = tabAdd(this, url, !notSelected,privateMode,guestInstanceId,mobile,adBlockThis,fields)
        ipc.send('create-web-contents-reply2',guestInstanceId, this.props.k, t.key)
      }
      else if(type == 'load-url'){
        const tab = this.state.tabs.find(x=>x.key==this.state.selectedTab)
        this.navigateTo(tab.page, url, tab)
      }
      else if(type == 'create-web-contents'){
        const tab = this.state.tabs.find(x=>x.key==this.state.selectedTab)
        ipc.emit('create-web-contents', null, {id:tab.wvId,targetUrl:url,disposition:'background-tab'})
      }
    })


    const tokenRestoreTabFromKey = PubSub.subscribe(`restore-tab-opposite-key_${this.props.k}`, (msg,args)=> {
      if (!this.mounted) return
      const tab = this.state.tabs.find(x=>x.key==this.state.selectedTab)
      tab.events['restore-tab'](null,tab.wvId,...args)
    })

    const tokenToggleDirction = PubSub.subscribe(`switch-direction_${this.props.k}`, (msg)=> {
      this.props.toggleDirc(this.props.k)
    })

    const tokenSwapPosition = PubSub.subscribe(`swap-position_${this.props.k}`, (msg)=> {
      this.props.swapPosition(this.props.k)
    })

    const scrollSync = (tab, left, winInfo, top, id)=> {
      exeScriptInIsolation(tab.wv,id ? ()=>clearInterval(id) : (void 0), ()=> {
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
      if(tab){
        if(tab.syncReplace){
          Array.from(new Array(5)).map((_,n)=>{
            this.refs2[`navbar-${tab.key}`].refs.syncReplace.setVal(n,0,false)
          })
          tab.syncReplace = void 0
          tab.sync = void 0
        }
        else{
          this.handleTabClose({noSync: true},tab.key)
        }
      }
    })

    // const tokenSyncZoom = PubSub.subscribe('sync-zoom',(msg,{k,sync,percent})=>{
    //   if(this.props.k == k || !sync) return
    //   const tab = this.state.tabs.find(x => x.sync == sync)
    //   if(tab){
    //     this.getWebContents(tab).setZoomLevel(global.zoomMapping.get(percent))
    //   }
    // })

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

    const tokenSplit = PubSub.subscribe('drag-split',(msg,{type,dropTabKeys,droppedKey})=>{
      const indexes = []
      this.state.tabs.forEach((x,i) =>{
        if(dropTabKeys.includes(x.key)) indexes.push(i)
      })
      if(indexes.length == 0) return

      const dirc = type == "left" || type == "right" ? 'v' : 'h'
      const pos = type == "left" || type == "top" ? -1 : 1
      if(this.state.tabs.length > 1 || droppedKey != this.props.k) {
        if(this.state.tabs.length > 1){
          this.props.split(droppedKey,dirc,pos,this.state.tabs,indexes)
        }
        else{
          this.props.split(droppedKey,dirc,pos,[...this.state.tabs,'dummy'],indexes) //@TODO
        }
        for(let dropTabKey of dropTabKeys){
          this.handleTabClose({}, dropTabKey)
          PubSub.publish(`close_tab_${this.props.k}`,{key:dropTabKey})
        }
      }
      else{
        this.props.split(droppedKey, dirc, pos * -1)
      }

      if(this.refs2[`tabs-${this.props.k}`]) this.refs2[`tabs-${this.props.k}`].unmountMount()
    })

    const tokenSearch = PubSub.subscribe(`drag-search_${this.props.k}`,(msg,{key,text,url})=>{
      const tab = this.state.tabs.find(x=>x.key == key)
      if(!tab) return
      if(tab.page.navUrl.match(/^chrome-extension:\/\/dckpbojndfoinamcdamhkjhnjnmjkfjd\/(favorite|favorite_sidebar)\.html/)){
        if(url){
          this.getWebContents(tab).send('add-favorite-by-drop',url,text)
        }
      }
      else{
        if(url){
          this.navigateTo(tab.page, url, tab)
        }
        else{
          this.search(tab,text,false)
        }
      }
    })


    const tokenMenuShow = PubSub.subscribe(`menu-showed_${this.props.k}`,(msg,show)=>{
      const dom = document.querySelector(`.s${this.props.k}`)
      const isMaximize = dom && dom.style.width == '100vw'
      if(!isMaximize) return

      if(show){
        dom.style.zIndex = 7
      }
      else{
        dom.style.zIndex = 5
      }
    })

    // return [tokenResize,tokenDrag,tokenSplit,tokenClose,tokenToggleDirction,tokenSync,tokenSync2,tokenBodyKeydown,tokenNewTabFromKey]
    return [tokenResize,tokenWebViewCreate,tokenDrag,tokenActiveTabChanged,tokenClose,tokenToggleDirction,tokenSwapPosition,tokenSync2,tokenCloseSyncTabs,tokenSyncSelectTab,tokenBodyKeydown,tokenNewTabFromKey,tokenRestoreTabFromKey,tokenCloseTab,tokenIncludeKey,tokenRichMedia,tokenMultiScroll,tokenOpposite,tokenSplit,tokenSearch,tokenMenuShow]
  }


  filterFromContents(page, navigateTo, tab, self) {
    console.log('filterFromContents',page.navUrl)

    // if (page.navUrl.match(/^(chrome|https:\/\/github\.com)/)) {
    //   return false
    // }
    // else if (page.navUrl.endsWith('.pdf') || page.navUrl.endsWith('.PDF')) {
    //   let fileUrl = page.navUrl
    //   if(fileUrl.startsWith('file:')){
    //     const accessKey = ipc.sendSync('get-access-key')
    //     fileUrl = `chrome-extension://jdbefljfgobbmcidnmpjamcbhnbphjnb/?key=${accessKey}&file=${fileUrl.replace(/^file:\/\//,'')}`
    //   }
    //   const url = ipc.sendSync('get-sync-main-state','pdfMode') == "normal" ?
    //     `chrome-extension://jdbefljfgobbmcidnmpjamcbhnbphjnb/content/web/viewer.html?file=${encodeURIComponent(fileUrl)}` :
    //     `chrome-extension://jdbefljfgobbmcidnmpjamcbhnbphjnb/comicbed/index.html#?url=${encodeURIComponent(fileUrl)}`
    //   navigateTo(url)
    //   return true
    // }
    if(page.navUrl.split("?").slice(-2)[0].match(/\.(3gp|3gpp|3gpp2|asf|avi|dv|flv|m2t|m4v|mkv|mov|mp4|mpeg|mpg|mts|oggtheora|ogv|rm|vob|webm|wmv|aac|m4a|mp3|oga|wav)$/)){
      navigateTo(`chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/video.html?url=${encodeURIComponent(page.navUrl)}`)
      return true
    }
    else if (this.props.htmlContentSet.has(page.navUrl)){
      return false
    }
    // else if(page.navUrl.match(/^file:.+?\.(zip|rar)$/)){
    //   const url = `chrome-extension://jdbefljfgobbmcidnmpjamcbhnbphjnb/comicbed/index.html#?url=${encodeURIComponent(page.navUrl)}`
    //   navigateTo(url)
    //   return true
    // }
    // else if (page.navUrl.match(/^file:.+?\.(abap|abc|as|ada|adb|htaccess|htgroups|htpasswd|conf|htaccess|htgroups|htpasswd|asciidoc|adoc|asm|a|ahk|bat|cmd|bro|cpp|c|cc|cxx|h|hh|hpp|ino|c9search_results|cirru|cr|clj|cljs|CBL|COB|coffee|cf|cson|Cakefile|cfm|cs|css|curly|d|di|dart|diff|patch|Dockerfile|dot|drl|dummy|dummy|e|ge|ejs|ex|exs|elm|erl|hrl|frt|fs|ldr|fth|4th|f|f90|ftl|gcode|feature|.gitignore|glsl|frag|vert|gbs|go|groovy|haml|hbs|handlebars|tpl|mustache|hs|cabal|hx|htm|html|hjson|xhtml|eex|html.eex|erb|rhtml|html.erb|ini|conf|cfg|prefs|io|jack|jade|pug|java|js|jsm|jsx|json|jq|jsx|jl|kt|kts|tex|latex|ltx|bib|less|liquid|lisp|ls|logic|log|lql|lsl|lua|lp|lucene|Makefile|md|GNUmakefile|makefile|OCamlMakefile|make|markdown|mask|matlab|mz|mel|mc|mush|mysql|nix|nsi|nsh|m|mm|ml|mli|pas|p|pl|pm|pgsql|php|phtml|shtml|php3|php4|php5|phps|phpt|aw|ctp|module|ps1|praat|praatscript|psc|proc|plg|prolog|properties|proto|py|r|cshtml|asp|Rd|Rhtml|rst|rb|ru|gemspec|rake|Guardfile|Rakefile|Gemfile|rs|sass|scad|scala|scm|sm|rkt|oak|scheme|scss|sh|bash|.bashrc|sjs|smarty|tpl|snippets|soy|space|sql|sqlserver|styl|stylus|svg|swift|tcl|tex|txt|textile|toml|tsx|twig|swig|ts|typescript|str|vala|vbs|vb|vm|v|vh|sv|svh|vhd|vhdl|wlk|wpgm|wtest|xml|rdf|rss|wsdl|xslt|atom|mathml|mml|xul|xbl|xaml|xq|yaml|yml)$/) ||
    //   page.navUrl.match(/\/[^\?=]+?\.(abap|abc|as|ada|adb|htaccess|htgroups|htpasswd|conf|htaccess|htgroups|htpasswd|asciidoc|adoc|asm|a|ahk|bat|cmd|bro|cpp|c|cxx|h|hh|hpp|ino|c9search_results|cirru|cr|clj|cljs|CBL|COB|coffee|cf|cson|Cakefile|cfm|cs|css|curly|d|di|dart|diff|patch|Dockerfile|dot|drl|dummy|dummy|e|ge|ejs|ex|exs|elm|erl|hrl|frt|fs|ldr|fth|4th|f|f90|ftl|gcode|feature|.gitignore|glsl|frag|vert|gbs|go|groovy|hbs|handlebars|tpl|mustache|hs|cabal|hx|hjson|eex|ini|conf|cfg|prefs|io|jack|jade|pug|java|js|jsm|jsx|json|jq|jsx|jl|kt|kts|tex|latex|ltx|bib|less|liquid|lisp|ls|logic|lql|lsl|lua|lp|lucene|Makefile|md|GNUmakefile|makefile|OCamlMakefile|make|markdown|mask|matlab|mz|mel|mc|mush|mysql|nix|nsi|nsh|m|mm|ml|mli|pas|p|pl|pm|pgsql|phps|phpt|aw|ctp|module|ps1|praat|praatscript|psc|proc|plg|prolog|properties|proto|py|r|cshtml|Rd|Rhtml|rst|rb|gemspec|rake|Guardfile|Rakefile|Gemfile|rs|sass|scad|scala|scm|sm|rkt|oak|scheme|scss|sh|bash|.bashrc|sjs|smarty|tpl|snippets|soy|space|sql|sqlserver|styl|stylus|svg|swift|tcl|tex|txt|textile|toml|tsx|twig|swig|ts|typescript|str|vala|vbs|vb|vm|v|vh|sv|svh|vhd|vhdl|wlk|wpgm|wtest|wsdl|xslt|atom|mathml|mml|xul|xbl|xaml|xq|yaml|yml)$/)) {
    //   if(page.navUrl.endsWith('user.js')) return false
    //
    //   navigateTo(`chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/ace.html?url=${encodeURIComponent(page.navUrl)}`)
    //   return true
    // }
    return false
  }

  closeTabFunc(key,tabs,closeTab,i,nextKey){
    const leftTab = _=> i-1 >= 0 ? tabs[i-1].key : tabs.length > 0 ? tabs[0].key : null
    const rightTab = _=> tabs.length > i ? tabs[i].key : tabs.length > 0 ? tabs[i - 1].key : null

    if(closeTabBehavior == 'focusTabLeftTab'){
      return leftTab()
    }
    else if(closeTabBehavior == 'focusTabRightTab'){
      return rightTab()
    }
    else if(closeTabBehavior == 'focusTabLastSelectedTab'){
      for(let key of this.state.selectedKeys.slice(0).reverse()){
        if(tabs.find(t=>t.key == key)) return key
      }
      return rightTab()
    }
    else if(closeTabBehavior == 'focusTabOpenerTab'){
      if(!closeTab) return rightTab()
      const openerTabId = ipc.sendSync('get-tab-opener',closeTab.wvId)
      const key2 = (this.state.tabs.find(t=>t.wvId == openerTabId)||{}).key
      return key2 || rightTab()
    }
    else if(closeTabBehavior == 'focusTabOpenerTabRtl'){
      if(!closeTab) return leftTab()
      const openerTabId = ipc.sendSync('get-tab-opener',closeTab.wvId)
      const key2 = (this.state.tabs.find(t=>t.wvId == openerTabId)||{}).key
      return key2 || leftTab()
    }
    else if(closeTabBehavior == 'focusTabLastOpenedTab'){
      let max = [-1,null]
      for(let tab of tabs){
        if(tab.wvId > max[0]){
          max = [tab.wvId,tab.key]
        }
      }
      return max[1]
    }
    else if(closeTabBehavior == 'focusTabFirstTab'){
      return tabs[0].key
    }
    else if(closeTabBehavior == 'focusTabLastTab'){
      return tabs[tabs.length-1].key
    }
    else if (closeTabBehavior == 'nearlyChrome'){
      return (nextKey === void 0 ? this._getPrevSelectedTab(key,tabs,closeTab,i) : nextKey) || rightTab()
    }
  }

  _getPrevSelectedTab(key,tabs,closeTab,i){
    let ind,ret = null
    // console.log(key,this.state.prevAddKeyCount,this.state.selectedKeys)
    if((ind = this.state.prevAddKeyCount[1].findIndex(k=>k==key))!= -1){
      if(ind == this.state.prevAddKeyCount[1].length -1){
        ret = [this.state.prevAddKeyCount[0],...this.state.prevAddKeyCount[1]][ind - 1 + 1]
      }
      else{
        ret = [this.state.prevAddKeyCount[0],...this.state.prevAddKeyCount[1]][ind + 1 + 1]
      }
    }

    if(ret && !tabs.find(tab=>tab.key == ret)){
      ret = null
    }

    return ret


    // for(let i = this.state.selectedKeys.length - 1;i > -1 ;i--){
    //   const selected = this.state.selectedKeys[i]
    //   if(key == selected) continue
    //   if(this.state.tabs.some(tab=>tab.key==selected)){
    //     return selected
    //   }
    // }
  }

  getPrevSelectedTab(key,tabs,closeTab,i) {
    const nextKey = this._getPrevSelectedTab(key,tabs,closeTab,i)
    return this.closeTabFunc(key, tabs, closeTab, i,nextKey)
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
        const newTab = addressBarNewTab || tab.lock
        if(urlutil.isURL(location)){
          const url = urlutil.getUrlFromInput(location)
          if(newTab){
            tab.events['new-tab']({}, tab.wvId,url,tab.privateMode)
          }
          else{
            el.value = url
            navigateTo(url)
          }
        }
        else{
          self.search(tab, location,false, newTab)
        }
        document.activeElement.blur()
        // tab.wv.setForegroundWindow()
      }
    }))
    const menu = Menu.buildFromTemplate(menuItems)
    ipc.send('menu-popup')
    ipc.once('menu-popup-reply', ()=> menu.popup(remote.getCurrentWindow(), () => ipc.send('menu-popup-end')))
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
        self.historyBack(cont,tab)
      },
      onClickForward() {
        const cont = self.getWebContents(tab)
        // newPage.navUrl = cont.history[cont.currentIndex+1]
        self.historyForward(cont,tab)
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
        self.historyGoIndex(cont,tab,ind)
      },
      onEnterLocation(location) {
        navigateTo(location)
        self.focus_webview(tab)
      },
      onChangeLocation(location) {
        newPage.location = location
        console.log('location-onChangeLocation',newPage.location)
        // self.setState({})
        self.setStatePartical(tab)
      },
      onLocationContextMenu(e) {
        locationContextMenu(e.target)
      }
    };
  }

  // searchWordHighlight(tab){
  //   autoHighLightInjection(this.getWebContents(tab),word=>{
  //     if(!word){
  //       let tabId = tab.wvId
  //       if(sharedState.searchWordHighlightRecursive){
  //         while(true){
  //           if(!tabId) break
  //           if(sharedState.searchWords[tabId]){
  //             word = sharedState.searchWords[tabId]
  //             break
  //           }
  //           tabId = sharedState.tabValues[tabId]
  //         }
  //       }
  //       else{
  //         if(sharedState.searchWords[tabId]){
  //           const navbar = this.refs2[`navbar-${tab.key}`].state
  //           const currentUrl = this.getWebContents(tab).getURL()
  //           const currentIndex = navbar.historyList[navbar.currentIndex][0] == currentUrl ? navbar.currentIndex : navbar.currentIndex + 1
  //           const url = navbar.historyList[currentIndex -1]
  //           if(url && url[0].match(REG_HIGHLIGHT_SITES)){
  //             word = sharedState.searchWords[tabId]
  //           }
  //         }
  //         else{
  //           const tabId2 = sharedState.tabValues[tabId]
  //           if(sharedState.searchWords[tabId2] &&
  //             this.refs2[`navbar-${tab.key}`].state.currentIndex == 0){
  //             const cont = this.props.currentWebContents[tabId2]
  //             if(!cont.isDestroyed() && cont.getURL().match(REG_HIGHLIGHT_SITES)){
  //               word = sharedState.searchWords[tabId2]
  //             }
  //           }
  //         }
  //       }
  //     }
  //     else{
  //       sharedState.searchWords[tab.wvId] = word
  //     }
  //     if(word) ipc.emit('menu-or-key-events',null,'findOnPage',tab.wvId,word,'OR')
  //   })
  // }

  async refreshHistory(e,page){
    page.navUrl = e.url;
    let location = page.navUrl
    try {
      location = decodeURIComponent(location)
    } catch (e) {}
    page.location = location

    let navUrl = page.navUrl
    console.log(7778884,page.navUrl)
    if(page.hid = await history.findOne({location: navUrl})){
    }
    else{
      while(navUrl != page.navUrl){
        navUrl = page.navUrl
        page.hid = await history.findOne({location: navUrl})
        if(page.hid) return
      }
      console.log(7778885,page.navUrl)
    }
  }

  updateActive(tab){
    const now = Date.now()
    const activeTab = activeTabs[this.props.k]
    if(activeTab && activeTab[0].key == tab.key){
      activeTabs[this.props.k] = [tab,tab.page.navUrl,now]
    }
    else if(!activeTab && tab.key == this.state.selectedTab && global.lastMouseDown[2] == this.props.k){
      activeTabs[this.props.k] = [tab,tab.page.navUrl,now]
    }
  }

  pageHandlers(navigateTo, tab, self, newPage) {
    return {
      onDestroyed(e, page){
        self.handleTabClose({}, tab.key, void 0, true)
      },
//       onUpdateTargetUrl(e, page, url) {
//         if (!self.mounted) return
//         if(page.statusText!==url){
//           page.statusText = url
//           PubSub.publish(`change-status-${tab.key}`)
//           // self.setState({})
//         }
//       },
//       onCursorChanged(e, page, cursor) {
//         if (!self.mounted) return
//         tab.div.parentNode.style.cursor = cursor
//       },
//       onLoadCommit(e, page, url, isMainFrame) {
//         // console.log('onCommitted',e,Date.now(),e.isMainFrame)
//         console.log('onLoadCommit',e)
//         if(isMainFrame){
//           if(page.navUrl != url){
//             self.refreshHistory({url, isMainFrame}, page)
//             self.updateActive(tab)
//           }
//
//           self.filterFromContents(page, navigateTo, tab, self);
//           self.sendOpenLink(tab, page);
//           // ipc.send('chrome-webNavigation-onCommitted',{
//           //   tabId:tab.wvId,
//           //   url:e.url,
//           //   frameId: 0,
//           //   timeStamp: Date.now()
//           // })
//         }
//       },
      // onWillNavigate(e, page) {
      //   console.log('onWillNavigate')
      //   // page.navUrl = e.url
      //   // self.sendOpenLink(tab, page);
      //   // ipc.send('chrome-webNavigation-onBeforeNavigate',self.createChromeWebNavDetails(tab))
      // },
      onDidNavigate(e, page, url) {
        page.didNavigate = true
        console.log('onDidNavigete',e,page)
        // tab.tabPreview = void 0

        // if(fullscreenTransition) ipc.send('toggle-fullscreen',true)

        if(page.navUrl != url) {
          self.refreshHistory({url}, page)
        }
        console.log('change-visit-state-navigate',self.props.k,page.navUrl)
        self.updateActive(tab)

        PubSub.publish(`did-navigate_${tab.key}`,url)
        PubSub.publish('change-tabs')

        setTimeout(_=>self.refs2[`bookmarkbar-${tab.key}`] && self.refs2[`bookmarkbar-${tab.key}`].setState({}),100)
        // page.navUrl = url
        // self.sendOpenLink(tab, page);
        // ipc.send('chrome-webNavigation-onBeforeNavigate',self.createChromeWebNavDetails(tab))
      },
      // onDidNavigateInPage(e, page) {
      //   console.log('onDidNavigateInPage')
      //   self.sendOpenLink(tab, page);
      //   page.navUrl = url
      // },
      onDidFinishLoading(e, page, call) {
        console.log(22009,'onDidFinishLoading',call)
        if (!self.mounted) return

        page.didNavigate = false

        // if(!sharedState.searchWordHighlightRecursive && sharedState.searchWordHighlight){
        //   self.searchWordHighlight(tab)
        // }

        // ipc.send('chrome-webNavigation-onCompleted',{
        //   tabId:tab.wvId,
        //   url:page.navUrl,
        //   frameId: 0,
        //   timeStamp: Date.now()
        // })

        if(tab.initPos){
          if(tab.initPos[0] == page.navUrl){
            tab.wv.executeJavaScript(`window.scrollTo(${tab.initPos[1].x},${tab.initPos[1].y})`,()=>{})
          }
          delete tab.initPos
        }

        if(sharedState.tabPreview){
          const base64 = uuid.v4()
          ipc.send('take-capture', {base64, tabId: tab.wvId, noActiveSkip: true})
          ipc.once(`take-capture-reply_${base64}`,(e,dataURL,size)=>{
            tab.tabPreview = {dataURL,...size}
            PubSub.publish('tab-preview-update',{dataURL,...size})
          })
        }

        ipc.send('get-did-finish-load',tab.wvId,tab.key,tab.rSession)
        ipc.once(`get-did-finish-load-reply_${tab.wvId}`,(e,c)=> {
          console.log(22009,`get-did-finish-load-reply_${tab.wvId}`,c)
          if(!c || !self.mounted) return
          const loc = c.url
          const entryIndex = c.currentEntryIndex
          page.entryIndex = entryIndex
          page.canGoBack = entryIndex !== 0
          page.canGoForward = entryIndex + 1 !== c.entryCount


          const title = c.title
          if(title != page.title){
            if(tab.key == self.state.selectedTab && !this.isFixed && global.lastMouseDown[2] == self.props.k){
              ipc.send("change-title",title)
            }
            page.title = title
          }

          if(page.navUrl != c.url) {
            self.refreshHistory(c, page)
          }

          if (!page.title) {
            page.title = page.location
            if (tab.key == self.state.selectedTab && !this.isFixed) ipc.send("change-title", page.title)
          }
          if (page.eventDownloadStartTab) ipc.removeListener(`download-start-tab_${tab.wvId}`, page.eventDownloadStartTab)
          clearTimeout(page.downloadTimer)
          // console.log(self.refs)
          // self.setState({})
          self.setStatePartical(tab)
          PubSub.publish(`change-status-${tab.key}`)
          if(!call){
            ;(async () => {
              const isExists = typeof page.hid === 'object'  && page.hid !== null
              if(isExists) ++page.hid.count
              if (isExists || (page.hid = await history.findOne({location: page.navUrl}))) {
                console.log(22009, loc, page.hid)
                if ((page.hid.count > 2 && !page.hid.capture) || (page.hid.count > 100 && page.hid.count % 100 == 2)) {
                  const key = Math.random().toString()
                  ipc.send('take-capture', {id: page.hid._id, url: page.navUrl, loc, tabId: tab.wvId, noActiveSkip: key})
                  const listener = () => page.hid.capture = true
                  ipc.once(`take-capture-reply_${key}`,listener)
                  setTimeout(()=>ipc.removeListener(`take-capture-reply_${key}`, listener),15000)
                }
              }
            })()
          }
          // ipc.send('chrome-tab-updated',parseInt(tab.key), e, self.getChromeTab(tab))
        })

      },
      onDidGetRedirectRequest(e, page) { //@TODO ELECTRON webRequest.onBeforeRedirect([filter, ]listener)
        console.log('redirect',e)
        if(page.navUrl != e.url){
          self.refreshHistory(e,page)
          self.updateActive(tab)
        }

      },
      onDidStopLoading(e, page){
        if(page.didNavigate){
          this.onDidFinishLoading(e,page, 'onDidStopLoading')
        }

        if(page.isLoading || page.favicon == 'loading'){
          page.isLoading = false
          if(page.favicon == 'loading'){
            // const url = `${new URL(newPage.navUrl).origin}/favicon.ico`
            // fetch(url,{method: 'HEAD'}).then(res=>{
            //   if(res.status == 200){
            //     this.onFaviconUpdate(null, page, [url])
            //   }
            //   else{
            //     page.favicon = 'resource/file.svg'
            //   }
            // })
            page.favicon = 'resource/file.svg'
            PubSub.publish(`change-status-${tab.key}`)
          }
          self.refs2[`navbar-${tab.key}`].setState({})
          self.setStatePartical(tab)
        }
      },
      async onTabIdChanged(e, page, tabId){
        console.log('onTabIdChanged',  page, tabId)
        if (!self.mounted) return

        self.onTabIdChanged(tabId, tab, true)
      },
      async onLoadStart(e, page, url, isInPlace, isMainFrame) {
        console.log('onLoadStart',e,Date.now() - ttime,Date.now())
        if (!self.mounted || !isMainFrame) return

        if(url.startsWith(firefoxAddonSite)){
          const ua = navigator.userAgent.includes('Windows') ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:61.0) Gecko/20100101 Firefox/61.0' :
            navigator.userAgent.includes('Mac OS X') ? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:61.0) Gecko/20100101 Firefox/61.0' :
              'Mozilla/5.0 (X11; Linux i686; rv:61.0) Gecko/20100101 Firefox/61.0'
          const cont = self.getWebContents(tab)
          tab.firefoxAddon = await cont.getUserAgent()
          cont.setUserAgent(ua)
          if(!tab.firefoxAddon) self.navigateTo(tab.page, url, tab)
        }
        else if(tab.firefoxAddon){
          self.getWebContents(tab).setUserAgent(tab.firefoxAddon)
          delete tab.firefoxAddon
        }

        PubSub.publishSync(`on-load-start_${tab.key}`,url)
        // ipc.send('chrome-webNavigation-onBeforeNavigate',{
        //   tabId:tab.wvId,
        //   url:url,
        //   frameId: 0,
        //   parentFrameId: -1,
        //   processId: -1,
        //   timeStamp: Date.now()
        // })

        let location = page.navUrl
        try{
          location = decodeURIComponent(location)
        }catch(e){}
        tab.page.location = location
        console.log('location-onLoadStart',tab.page.location)

        let match
        if(url.match(REG_VIDEO)){
          ipc.send('video-infos',{url})
          ipc.once(`video-infos-reply_${url}`,(e,{title,formats,error})=>{
            console.log(`video-infos-reply_${url}`,e,{title,formats,error})
            if(error) return
            const arr = [],arr2 = []
            for(let f of formats){
              // if(f.protocol.includes('m3u8')) continue
              const format = f.format ? f.format.replace(/ /g,'') : `${f.resolution ? `${f.resolution}${f.quality ? `_${f.quality}` : ''}_${f.profile}_${f.audioEncoding || 'nonaudio'}`: 'audioonly'}`
              const fname = `${f.acodec == 'none' ? '[no-audio]' : f.vcodec == 'none' ? '[audio-only]' : ''}${title}_${format}.${f.protocol && f.protocol.includes('m3u8') ? 'm3u8' : (f.ext||f.container)}`
              ;(f.acodec == 'none' ? arr2 : arr).push({url:f.url,type:'video',fname,size: f.filesize})
            }
            tab.page.richContents.unshift(...arr.slice(0).reverse(),...arr2.slice(0).reverse())
            console.log(99875556,tab.page)
            self.refs2[`navbar-${tab.key}`].setState({})
          })
        }

        self.sendOpenLink(tab, page);
        // self.getWebContentsAsync(tab.wv,cont=>cont.send("text-editor",page.navUrl))
        self.startProcess(self, page, navigateTo, tab, true)

        // ipc.send('chrome-tab-updated',parseInt(tab.key), e, self.getChromeTab(tab))
        console.log('onLoadStartEnd',Date.now())
        // tab.wv.toggleDevTools();
      },
      onDomReady(e, page, pageIndex) {
        console.log('onDomReady',e,tab,Date.now())
        if (!self.mounted) return

        // if(sharedState.searchWordHighlight){
        //   self.searchWordHighlight(tab)
        // }

        // ipc.send('chrome-webNavigation-onDOMContentLoaded',{
        //   tabId:tab.wvId,
        //   url:page.navUrl,
        //   frameId: 0,
        //   timeStamp: Date.now()
        // })

        console.log(tab.wv,tab.wvId,guestIds.tabId,tab.e&&tab.e.tabId,tab.e,e)

        ipc.send('get-on-dom-ready',tab.wvId,tab.key,tab.rSession,closingPos[tab.key])
        ipc.once(`get-on-dom-ready-reply_${tab.wvId}`,(e,c)=>{
          if(!c) return
          // const domLoadedTime = Date.now()
          // tab.domLoadedTime = domLoadedTime
          if(c.rSession) tab.rSession = c.rSession
          const pre = {
            canGoBack: c.currentEntryIndex !== 0,
            canGoForward:  c.currentEntryIndex + 1 !== c.entryCount
          }

          if(pre.canGoBack == c.currentEntryIndex !== 0 &&
            pre.canGoForward == c.currentEntryIndex + 1 !== c.entryCount &&
            page.canRefresh == false && page.title == c.title) return
          // tab.wv.send('set-tab',{tab:self.getChromeTab(tab)})

          const title = c.title
          if(tab.key == self.state.selectedTab && !this.isFixed && global.lastMouseDown[2] == self.props.k && title != page.title){
            ipc.send("change-title",title)
          }
          page.title = title
          page.domLoaded = true
          // cont.toggleDevTools()

          // self.setState({})
          self.setStatePartical(tab)
        })


      },
      onDidFailLoad(e, page, errorCode, errorDescription, validatedURL, isMainFrame) {
        if(!isMainFrame) return
        if(errorCode == -3){
          this.onDidGetRedirectRequest({url: validatedURL}, page)
          return
        }
        if(page.isLoading){
          page.isLoading = false
          if(page.favicon == 'loading') page.favicon = 'resource/file.svg'
          PubSub.publish(`change-status-${tab.key}`)
          if(!self.refs2[`navbar-${tab.key}`]) return
          self.refs2[`navbar-${tab.key}`].setState({})
          self.setStatePartical(tab)

          if(sharedState.tabPreview){
            const base64 = uuid.v4()
            ipc.send('take-capture', {url: page.navUrl, loc:page.navUrl, base64, tabId: tab.wvId, noActiveSkip: true})
            ipc.once(`take-capture-reply_${base64}`,(e,dataURL,size)=>{
              tab.tabPreview = {dataURL,...size}
              PubSub.publish('tab-preview-update',{dataURL,...size})
            })
          }
        }
        console.log('fail',e)
        // if (page.location !== e.validatedURL || e.errorDescription == 'ERR_ABORTED' || e.errorCode == -3 || e.errorCode == 0) return
        if(["chrome://newtab/","chrome://bookmarks2/","chrome://history2/"].includes(validatedURL)){
          self.navigateTo(page, convertURL(validatedURL), tab)
          return
        }

        // ipc.send('chrome-webNavigation-onErrorOccurred',{
        //   tabId:tab.wvId,
        //   url:page.navUrl,
        //   frameId: 0,
        //   processId: -1,
        //   error: e.errorDescription,
        //   timeStamp: Date.now()
        // })
        // else if(e.validatedURL == "about:blank"){
        //   self.navigateTo(page, blankURL, tab)
        // }
        // self.getWebContents(tab).executeJavaScript(`document.documentElement.innerHTML = '<h1>An Error Occured.<br> Detail : ${e.errorDescription}</h1>'`)
        // page.title = 'Error Page'
        // page.favicon = 'resource/file.svg'
        // self.setState({})
      },
      onDidFrameFinishLoad(e, page, pageIndex) {
        // console.log(e,"onDidFrameFinishLoad")
      },
      onFaviconUpdate(e, page, favicons) {
        if(newPage.navUrl.match(/^https:\/\/www\.google\.([a-z.]+)\/url\?sa=t&/)) return //Google Redirect
        console.log(newPage.navUrl,"onFaviconUpdate", e)
        if(favicons[0].startsWith('chrome-extension:')){
          const id = favicons[0].split('/')[2]
          newPage.favicon = `file://${browserActionMap.get(id).basePath}/${favicons[0].split('/').splice(3).join('/')}`
        }
        else{
          newPage.favicon = favicons[0]
        }
        // self.setState({})
        self.setStatePartical(tab)

        let hist
        if((hist = historyMap.get(newPage.navUrl))){
          if(!hist[1]) hist[1] = newPage.favicon
        }
        else{
          historyMap.set(newPage.navUrl,[newPage.title,newPage.favicon])
        }

        if(!tab.privateMode || tab.privateMode.match(/^persist:\d/)){
          ;(async ()=>{
            let navUrl = newPage.navUrl
            console.log(7778881,newPage.navUrl)
            if(newPage.hid || (newPage.hid = await history.findOne({location: navUrl}))){
              await history.update({_id: newPage.hid._id},{ $set:{favicon: newPage.favicon,updated_at: Date.now()}})
              // console.log('update_favicon')
            }
            else{
              while(navUrl != newPage.navUrl){
                navUrl = newPage.navUrl
                newPage.hid = await history.findOne({location: navUrl})
                if(newPage.hid){
                  await history.update({_id: newPage.hid._id},{ $set:{favicon: newPage.favicon,updated_at: Date.now()}})
                  return
                }
              }
              console.log(7778882,newPage.navUrl)
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
    // console.trace('startProcess', 'favicon', isLoadStart)
    const needFavicon = isLoadStart || page.favicon == "loading"
    const skip = needFavicon ? self.filterFromContents(page, navigateTo, tab, self) : false;
    if (!skip) {
      if(needFavicon){
        page.hid = null
        page.titleSet = false
        // if(!page.isLoading){
        //   page.isLoading = true
        //   PubSub.publish(`change-status-${tab.key}`)
        // }
        const navUrl = page.navUrl
        setTimeout(_=>{
          if(page.isLoading && self.refs2[`navbar-${tab.key}`] && navUrl == page.navUrl){
            page.isLoading = false
            if(page.favicon == 'loading') page.favicon = 'resource/file.svg'
            PubSub.publish(`change-status-${tab.key}`)
            self.refs2[`navbar-${tab.key}`].setState({})
            self.setStatePartical(tab)

            if(tab.initPos){
              if(tab.initPos[0] == page.navUrl){
                tab.wv.executeJavaScript(`window.scrollTo(${tab.initPos[1].x},${tab.initPos[1].y})`,()=>{})
              }
              delete tab.initPos
            }

            if(sharedState.tabPreview){
              const base64 = uuid.v4()
              ipc.send('take-capture', {url: page.navUrl, loc:page.navUrl, base64, tabId: tab.wvId, noActiveSkip: true})
              ipc.once(`take-capture-reply_${base64}`,(e,dataURL,size)=>{
                tab.tabPreview = {dataURL,...size}
                PubSub.publish('tab-preview-update',{dataURL,...size})
              })
            }
          }
        },10000)
        // page.favicon = page.navUrl == '' || page.navUrl.match(/^(file:\/\/|chrome|about)/) ? 'resource/file.svg' : 'loading'
      }

      const eventDownloadStartTab = (event) => {
        const pre = {
          hid: page.hid,
          titleSet: page.titleSet,
          favicon: page.favicon,
          title: page.title,
          canGoBack: page.canGoBack
        }
        // const controller = this.getWebContents(tab).controller()
        // if (controller && controller.isValid() && controller.isInitialNavigation() && self.state.tabs.length > 1) {
        //   self.handleTabClose({noHistory: true, noSync: true}, tab.key)
        // }

        if (!pre.titleSet && !pre.canGoBack && self.state.tabs.length > 1) {
          self.handleTabClose({noHistory: true, noSync: true}, tab.key)
        }
        page.hid = pre.hid
        page.titleSet = pre.titleSet
        page.favicon = pre.favicon
        if(page.isLoading){
          page.isLoading = false
          PubSub.publish(`change-status-${tab.key}`)
        }
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
      // self.setState({})
      self.setStatePartical(tab)
    }

    if (needFavicon && (!tab.privateMode || tab.privateMode.match(/^persist:\d/))) {
      ;(async () => {
        console.log(777888,page.navUrl)
        let navUrl = page.navUrl
        if (page.hid || (page.hid = await history.findOne({location: navUrl}))) {
        }
        else {
          while(navUrl != page.navUrl){
            navUrl = page.navUrl
            page.hid = await history.findOne({location: navUrl})
            if(page.hid) return
          }
          const histUpdateTime = Date.now()
          if(histUpdateTime - tab.histUpdateTime < 20) return
          tab.histUpdateTime = histUpdateTime
          // console.log('insert_start')
        }
      })()
    }
  }

  setStatePartical(tab){
    const page = tab.page
    const _t = this.refs2[`tabs-${this.props.k}`] && ReactDOM.findDOMNode(this.refs2[`tabs-${this.props.k}`])
    const t = _t && _t.querySelector(`#draggable_tabs_${tab.key}`)
    if (t){
      const p = t.querySelector('p')
      const title = `${page.favicon !== 'loading' || page.titleSet || page.location == 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html' ? page.title : page.location} `
      const beforeTitle = <img className='favi-tab' src={page.title && page.favicon !== 'loading' && !page.isLoading ? page.favicon : 'resource/l.png'} onError={(e)=>{e.target.src = 'resource/file.svg'}}/>
      PubSub.publish(`tab-component-update_${tab.key}`,{title,beforeTitle})
    }
    const n = this.refs2[`navbar-${tab.key}`]
    if(n) n.setState({})
    // console.log('setStatePartical',t,n)
  }

  updateOpenLink(openLink){
    if(!openLink) return [Date.now()];
    openLink.push(Date.now())
    if(openLink.length > 4) openLink.shift()
    return openLink
  }

  sendOpenLink(tab, page) {
    console.log(9999999,tab.dirc,tab)
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
        cont.hostWebContents2.send('open-link', {url:page.navUrl, sync:tab.sync, id:tab.wvId, dirc:tab.dirc})
      }, 100)
    }
    // else if (tab.openLink && tab.openLink.length > 3 && tab.openLink[tab.openLink.length-1] - tab.openLink[0] < 1500) {
    //   tab.openLink = this.updateOpenLink(tab.openLink)
    // }
  }

  registWebView(tab, wv, div) {
    tab.wv = wv
    tab.div = div

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
      ipc.send('set-audio-muted',tab.wvId,!!tab.mute)
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

  restoreTabFromTabKey(tabKey,i,restoreIndex=null,callback,openType){
    tabState.findOne({tabKey}).then(rSession=>{
      const urls = rSession.urls
      const titles = rSession.titles
      const positions = rSession.positions
      rSession.urls = urls.split("\t")
      rSession.titles = titles.split("\t")
      rSession.positions = positions ? JSON.parse(positions) : []
      if(restoreIndex !== null) rSession.currentIndex = restoreIndex
      const n_tab = this.createTab({default_url:rSession.urls[rSession.currentIndex],initPos: rSession.positions[rSession.currentIndex], rest:{rSession}})
      tabState.insert({tabKey:n_tab.key,titles,urls,positions,currentIndex:rSession.currentIndex, updated_at: Date.now()})
      if(i === void 0){
        this.state.tabs.push(n_tab)
      }
      else{
        this.state.tabs.splice(i + 1, 0, n_tab)
      }
      const closeTab = this.state.selectedTab
      if(openType == 'load-url'){
        if(this.state.tabs.length == 2){
          setTimeout(()=>this.handleTabClose({}, closeTab),50)
        }
        else{
          this.handleTabClose({}, closeTab)
        }
      }
      console.log("selected20", n_tab.key)
      this.setState(openType == 'create-web-contents' ? {} : {selectedTab: n_tab.key})
      this.focus_webview(n_tab,n_tab.page.location != topURL)
      if(callback) setTimeout(_=>callback(n_tab.wvId),2000)
    })
  }
  registTabEvents(tab) {
    tab.events['add-favorite'] = (e, id)=> {
      if (!this.mounted) return
      if (tab.wvId && id == tab.wvId) {
        ;(async ()=> {
          const [url,title,favicon] = [tab.page.location,tab.page.title,tab.page.favicon]
          await favorite.create({parentId: 'root', url, title})
        })()
      }
    }
    ipc.on('add-favorite', tab.events['add-favorite'])

    tab.events['load-url'] = (e, id, url)=>{
      if (!this.mounted) return
      if (tab.wvId && id == tab.wvId) {
        this.navigateTo(tab.page, url, tab)
      }
    }
    ipc.on('load-url', tab.events['load-url'])

    tab.events['new-tab'] = (e, id, url, privateMode,k,last,openBackground)=> {
      if (!this.mounted) return
      if ((tab.wvId && id == tab.wvId) || (k == this.props.k && tab.key == this.state.selectedTab)) {
        global.openerQueue.push(id || this.state.tabs.find(t=>t.key == this.state.selectedTab).wvId)
        console.log(this)
        const t = tabAdd(this, url, !alwaysOpenLinkBackground && !openBackground, privateMode || tab.privateMode,(void 0),tab.mobile,tab.adBlockThis,tab.fields,last);
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
            cont.hostWebContents2.send('open-panel', {url,sync:t.sync,id:tab.wvId,dirc:t.dirc,replaceInfo: tab.syncReplace,mobile: tab.mobile, adBlockThis: tab.adBlockThis, fields: tab.fields})
          }, 100)
        }
      }
    }
    ipc.on('new-tab', tab.events['new-tab'])

    tab.events['new-tab-opposite'] = (e, id, url,lastMouseDown, privateMode, type = 'new-tab')=> {
      if (!this.mounted) return
      if (tab.wvId && id == tab.wvId) {
        global.openerQueue.push(id)
        const oppositeKey = lastMouseDown ? (this.props.getPrevFocusPanel(this.props.k) || this.props.getOpposite(this.props.k)) : this.props.getOpposite(this.props.k)
        if (oppositeKey && !isFixedPanel(oppositeKey))
          PubSub.publish(`new-tab-from-key_${oppositeKey}`, {url,mobile:tab.mobile, adBlockThis: tab.adBlockThis, fields: tab.fields, privateMode:privateMode || tab.privateMode, type})
        else{
          // const selectedTab =  this.state.selectedTab
          // const t = tabAdd(this, url, "nothing",(void 0),(void 0),tab.mobile,tab.adBlockThis,true);
          // setTimeout(_=> {
          //   const _tabs = this.state.tabs
          //   const i = _tabs.length - 1
          this.props.split(this.props.k, 'v',1, (void 0), (void 0), {url,mobile:tab.mobile,adBlockThis:tab.adBlockThis, fields: tab.fields, privateMode:privateMode || tab.privateMode})
          // PubSub.publish(`close_tab_${this.props.k}`, {key:t.key, selectedTab})
          // },100)
        }
      }
    }
    ipc.on('new-tab-opposite', tab.events['new-tab-opposite'])


    tab.events['restore-tab-opposite'] = (e, id, tabKey,restoreIndex,favicons,openType)=> {
      if (!this.mounted) return
      if (tab.wvId && id == tab.wvId) {
        const oppositeKey = lastMouseDown ? (this.props.getPrevFocusPanel(this.props.k) || this.props.getOpposite(this.props.k)) : this.props.getOpposite(this.props.k)
        if (oppositeKey && !isFixedPanel(oppositeKey))
          PubSub.publish(`restore-tab-opposite-key_${oppositeKey}`, [tabKey,restoreIndex,favicons,openType])
      }
    }
    ipc.on('restore-tab-opposite', tab.events['restore-tab-opposite'])

    tab.events['restore-tab'] = (e, id, tabKey,restoreIndex,favicons,openType)=> {
      if (!this.mounted) return
      if (tab.wvId && id == tab.wvId) {
        for(let [url,favicon] of favicons){
          historyMap.set(url,["",favicon])
        }
        const i = this.state.tabs.findIndex(x=>x.key == tab.key)
        this.restoreTabFromTabKey(tabKey,i,restoreIndex,void 0,openType)
      }
    }
    ipc.on('restore-tab', tab.events['restore-tab'])

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
      else if(name == 'closePanel'){
        PubSub.publish(`close-panel_${this.props.k}`)
      }
      else if(name == 'closeOtherTabs'){
        this.closeOtherTabs(tab.key)
      }
      else if(name == 'closeTabsToLeft'){
        this.closeLeftTabs(tab.key)
      }
      else if(name == 'closeTabsToRight'){
        this.closeRightTabs(tab.key)
      }
      else if(name == 'clicktabReloadtabs'){
        this.state.tabs.forEach(t=>this.getWebContents(t).reload())
      }
      else if(name == 'clicktabReloadothertabs'){
        this.reloadOtherTabs(tab.key)
      }
      else if(name == 'clicktabReloadlefttabs'){
        this.reloadLeftTabs(tab.key)
      }
      else if(name == 'clicktabReloadrighttabs'){
        this.reloadRightTabs(tab.key)
      }
      else if(name == 'navigatePage'){
        this.navigateTo(tab.page,args,tab)
      }
      else if(name == 'reopenLastClosedTab'){
        this.reopenLastClosedTab()
      }
      else if(name == 'clicktabUcatab'){
        this.reopenLastClosedTabAll()
      }
      else if(name == 'clicktabCopyTabUrl'){
        ipc.send("set-clipboard",[tab.page.navUrl])
      }
      else if(name == 'clicktabCopyUrlFromClipboard'){
        this.openClipboardUrl(tab)
      }
      else if(name == 'pasteAndOpen'){
        this.newTabClipboardUrl(tab)
      }
      else if(name == 'copyTabInfo'){
        ipc.send("set-clipboard",[`${this.state.tabs.findIndex(tab2=>tab.key==tab2.key)+1}\t${tab.page.title}\t${tab.page.navUrl}`])
      }
      else if(name == 'copyAllTabTitles'){
        ipc.send("set-clipboard",this.state.tabs.map((t,i)=>t.page.title))
      }
      else if(name == 'copyAllTabUrls'){
        ipc.send("set-clipboard",this.state.tabs.map((t,i)=>t.page.navUrl))
      }
      else if(name == 'copyAllTabInfos'){
        ipc.send("set-clipboard",this.state.tabs.map((t,i)=>`${i+1}\t${t.page.title}\t${t.page.navUrl}`))
      }
      else if(name == 'addBookmark'){
        tab.events['add-favorite'](null, tab.wvId)
      }
      else if(name == 'addBookmarkAll'){
        this.onAddFavorites()
      }
      else if(name == 'unpinTab'){
        tab.pin = !tab.pin
        this.setState({})
      }
      else if(name == 'unmuteTab'){
        tab.mute = !tab.mute
        this.getWebContents(tab).setAudioMuted(tab.mute)
        this.setState({})
      }
      else if(name == 'freezeTabMenuLabel'){
        const val = !(tab.protect && tab.lock)
        this.updateProtectTab(tab,val)
        this.updateLockTab(tab,val)
        this.setState({})
      }
      else if(name == 'protectTabMenuLabel'){
        this.updateProtectTab(tab,!tab.protect)
        this.setState({})
      }
      else if(name == 'lockTabMenuLabel'){
        this.updateLockTab(tab,!tab.lock)
        this.setState({})
      }
      else if(name == 'splitLeftTabs' || name == 'splitRightTabs' || name == 'duplicateTab'){
        const trans = {splitLeftTabs: locale.translation('splitLeftTabsToLeft'),
          splitRightTabs: locale.translation('splitRightTabsToRight'),
          duplicateTab:'3007771295016901659'
        }
        this._handleContextMenu(null,tab.key,null,this.state.tabs,false,true).find(i=>(i.t || i.label) == trans[name]).click()
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
          if(wv.parentNode.parentNode.style.zIndex !== '-1'){
            ret = wv
            break
          }
        }
        if(ret){
          ret.focus()
          if(global.lastMouseDown[0] != ret){
            const tabInfo = this.props.parent.getTab(ret)
            global.lastMouseDown = [ret, tabInfo[0].wvId, tabInfo[1]]
            ipc.send("change-title",tabInfo[0].page.title)
          }
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
        if(tabs.length > 1){
          this.props.split(this.props.k,dirc,pos,tabs,i)
          this.handleTabClose({}, tab.key)
          PubSub.publish(`close_tab_${this.props.k}`,{key:tab.key})
        }
        else{
          this.props.split(this.props.k, dirc, pos * -1)
        }
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
        this.props.fixedPanelOpen({dirc:ipc.sendSync('get-sync-main-state','sideBarDirection')})
      }
      else if(name == 'changeMobileAgent'){
        this.refs2[`navbar-${tab.key}`].handleUserAgent()
      }
      else if(name == 'detachPanel'){
        this.detachPanel()
      }
      // else if(name == 'floatingPanel'){
      //   this._handleContextMenu(null,tab.key,null,this.state.tabs,false,true).find(i=>i.t == name).click()
      // }
      else if(name == 'maximizePanel'){
        this.maximizePanel()
      }
      else if(name == 'zoomIn'){
        this.refs2[`navbar-${tab.key}`].onZoomIn()
      }
      else if(name == 'zoomOut'){
        this.refs2[`navbar-${tab.key}`].onZoomOut()
      }
      else if(name == 'multiRowTabs'){
        sharedState.multistageTabs = !sharedState.multistageTabs
        ipc.send('save-state',{tableName:'state',key:'multistageTabs',val:sharedState.multistageTabs})
        PubSub.publish('change-multistage-tabs',sharedState.multistageTabs)
        PubSub.publish("resizeWindow",{})
      }
      else if(name == 'tabPreview'){
        sharedState.tabPreview = !sharedState.tabPreview
        mainState.set('tabPreview',sharedState.tabPreview)
        PubSub.publish('token-preview-change',sharedState.tabPreview)
      }
      // else if(name == 'searchHighlight'){
      //   sharedState.searchWordHighlight = !sharedState.searchWordHighlight
      //   mainState.set('searchWordHighlight',sharedState.searchWordHighlight)
      //   this.searchWordHighlight(tab)
      //   this.setState({})
      // }
      else if(name == 'screenShotFullClipBoard'){
        this.screenShot(true,'clipboard',tab)
      }
      else if(name == 'screenShotFullJpeg'){
        this.screenShot(true,'JPEG',tab)
      }
      else if(name == 'screenShotFullPng'){
        this.screenShot(true,'PNG',tab)
      }
      else if(name == 'screenShotSelectionClipBoard'){
        this.screenShot(false,'clipboard',tab)
      }
      else if(name == 'screenShotSelectionJpeg'){
        this.screenShot(false,'JPEG',tab)
      }
      else if(name == 'screenShotSelectionPng'){
        this.screenShot(false,'PNG',tab)
      }
      else if(name == 'openLocation'){
        ipc.emit('focus-location-bar',null,tab.wvId)
      }
      else if(name == 'toggleDeveloperTools'){
        const cont = this.getWebContents(tab)
        cont.toggleDevTools()
      }
      else if(name == 'arrangePanel'){
        this.props.parent.arrangePanels('all')
      }
      else if(name == 'arrangePanelEach'){
        this.props.parent.arrangePanels(this.props.k)
      }
      else if(name == 'findAll'){
        this.props.parent.toggleFindPanel()
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

    tab.events[`send-to-host_${tab.wvId}`] = (e, msg, ...args) => {
      if (msg == 'open-tab-opposite') {
        const url = args[1] ? args[0] : `file://${args[0]}`,
          id = tab.wvId
        const type = args[2]
        tab.events['new-tab-opposite'](e, id, url,void 0,void 0, type)
      }
      else if (msg == 'open-tab') {
        const url = args[1] ? args[0] : `file://${args[0]}`,
          id = tab.wvId
        tab.events['new-tab'](e, id, url)
      }
      if (msg == 'restore-tab-opposite') {
        const id = tab.wvId
        tab.events['restore-tab-opposite'](e, id, ...args)
      }
      else if(msg == 'load-url'){
        // this.getWebContents(tab).loadURL(args[0])
        this.navigateTo(tab.page,args[0],tab)
      }
      else if(msg == 'html-content'){
        this.props.htmlContentSet.add(args[0])
        this.navigateTo(tab.page,args[0],tab)
      }
      else if(msg == 'get-tabs-state'){
        const key = args[0]
        const arr = []
        console.log(key)
        this.props.parent.allKeysAndTabs((void 0),arr,[0])
        this.getWebContents(tab).send(`get-tabs-state-reply_${key}`,arr)
      }
      else if(msg == 'history'){
        console.log(222222222,args)
        // if(this.historyKeys[args[1]]) return
        // this.historyKeys[args[1]] = 1
        switch(args[0]){
          case 'back':
            this.historyBack(this.getWebContents(tab),tab)
            break
          case 'forward':
            this.historyForward(this.getWebContents(tab),tab)
            break
          case 'go':
            this.historyGo(this.getWebContents(tab),tab,args[2])
        }
      }
      else if(msg == 'theme-color-computed'){
        sharedState[`color-${tab.key}`] = args[0]
        this.refs2[`tabs-${this.props.k}`].setState({})
      }
      else if(msg == 'scroll-position'){
        if(closingPos[tab.key]){
          closingPos[tab.key][tab.page.navUrl] = args[0]
        }
        else{
          closingPos[tab.key] = {[tab.page.navUrl]: args[0]}
        }
      }
      else if(msg == 'full-screen-mouseup'){
        const rect = tab.div.getBoundingClientRect()
        ipc.send('force-mouse-up',{x: Math.round(rect.x+10),y:Math.round(rect.y+10)})
      }
      else if(msg == 'devTools-close'){
        ipc.emit('menu-or-key-events',null,'toggleDeveloperTools',tab.wvId)
      }
      else if(msg == 'devTools-dock'){
        const cont = this.getWebContents(tab)
        if(cont.devToolsWebContents){
          if(cont.devToolsWebContents.isGuest()){
            ipc.emit('menu-or-key-events',null,'toggleDeveloperTools',tab.wvId)
            mainState.set('devToolsMode','separate')
            ;(async function(){
              let devToolsWebContents
              for(let i=0;i<100;i++){
                await new Promise(r=>{
                  setTimeout(_=>{
                    devToolsWebContents = cont.devToolsWebContents
                    r()
                  },100)
                })
                if(!devToolsWebContents){
                  cont.toggleDevTools()
                  break
                }
              }
            }())
          }
          else{
            cont.toggleDevTools()
            mainState.set('devToolsMode','dock')
            ipc.emit('menu-or-key-events',null,'toggleDeveloperTools',tab.wvId)
          }
        }
      }
      else if(msg == 'scrollPage'){
        this.scrollPage(args[0])
      }
      else if(msg == 'window-close'){
        this.handleTabClose({},tab.key)
      }
    }
    ipc.on(`send-to-host_${tab.wvId}`,tab.events[`send-to-host_${tab.wvId}`])

    tab.events['search-text'] = (e, id, text, opposite)=> {
      if (!this.mounted) return
      if (tab.wvId && id == tab.wvId) {
        this.search(tab, text,opposite,true)
      }
    }
    ipc.on('search-text', tab.events['search-text'])

    tab.events['sync-replace-from-menu'] = async (e, id)=> {
      if (!this.mounted) return
      if (tab.wvId && id == tab.wvId) {
        const rec = await syncReplace.findOne({key: 'syncReplace_0'})
        if(rec){
          console.log(777666,tab.syncReplace,(rec.val.split("\t")))
          this.refs2[`navbar-${tab.key}`].refs.syncReplace.setVal(0,0,!tab.syncReplace)
        }
      }
    }
    ipc.on('sync-replace-from-menu', tab.events['sync-replace-from-menu'])

    tab.events['go-navigate'] = (e, id, type)=> {
      if (!this.mounted) return
      const cont = this.getWebContents(tab)
      if (cont && id == tab.wvId) {
        if (type == 'back') {
          // tab.page.navUrl = cont.history[cont.currentIndex - 1]
          // tab.page.navUrl = cont.getURLAtIndex(cont.getCurrentEntryIndex() - 1)
          this.historyBack(cont,tab)
        }
        else if (type == 'forward') {
          // tab.page.navUrl = cont.history[cont.currentIndex + 1]
          // tab.page.navUrl = cont.getURLAtIndex(cont.getCurrentEntryIndex() + 1)
          this.historyForward(cont,tab)
        }
        else if (type == 'reload') {
          // tab.page.navUrl = cont.history[cont.currentIndex]
          // tab.page.navUrl = cont.getURLAtIndex(cont.getCurrentEntryIndex())
          cont.reload()
        }

      }
    }
    ipc.on('go-navigate', tab.events['go-navigate'])

    tab.events['pin-video'] = (e, id, popup)=> {
      if (!this.mounted || id != tab.wvId) return

      tab.wv.executeJavaScript(`
      if(location.href.startsWith('https://www.youtube.com')){
        var newStyle = document.createElement('style')
        newStyle.type = "text/css"
        document.head.appendChild(newStyle)
        var css = document.styleSheets[0]

        var idx = document.styleSheets[0].cssRules.length;
        css.insertRule(".ytp-popup.ytp-generic-popup { display: none; }", idx)
      }
      var __video_ = document.querySelector('video')
      var __return_val = false
      if(__video_ && (__video_.scrollWidth == window.innerWidth || __video_.scrollHeight == window.innerHeight || __video_.webkitDisplayingFullscreen)){}
      else if(__video_){
        const fullscreenButton = document.querySelector('.ytp-fullscreen-button,.fullscreenButton,.button-bvuiFullScreenOn,.fullscreen-icon,.full-screen-button,.np_ButtonFullscreen,.vjs-fullscreen-control,.qa-fullscreen-button,[data-testid="fullscreen_control"],.vjs-fullscreen-control,.EnableFullScreenButton,.DisableFullScreenButton,.mhp1138_fullscreen,button.fullscreenh,.screenFullBtn,.player-fullscreenbutton')
        if(fullscreenButton){
          const callback = e => {
            e.stopPropagation()
            e.preventDefault()
            document.removeEventListener('mouseup',callback ,true)
            fullscreenButton.click()
            if(location.href.startsWith('https://www.youtube.com')){
              let retry = 0
              const id = setInterval(_=>{
                if(retry++>500) clearInterval(id)
                const e = document.querySelector('.html5-video-player').classList
                if(!e.contains('ytp-autohide')){
                  e.add('ytp-autohide')
                    if(document.querySelector('.ytp-fullscreen-button.ytp-button').getAttribute('aria-expanded') == 'true'){
                      __video_.click()
                    }
                }
              },10)
            }
          }
          document.addEventListener('mouseup',callback ,true);
          __return_val = true
        }
        else{
          const callback = e => {
            e.stopPropagation()
            e.preventDefault()
            document.removeEventListener('mouseup',callback ,true)
            __video_.webkitRequestFullscreen()
          }
          document.addEventListener('mouseup',callback ,true);
          __return_val = true
        }
      } 
      else{
        const iframe = document.querySelector('iframe')
        if(iframe){
          const callback = e => {
          e.stopPropagation()
          e.preventDefault()
          document.removeEventListener('mouseup',callback ,true)
            iframe.webkitRequestFullscreen()
          }
          document.addEventListener('mouseup',callback ,true);
          __return_val = true
        }
      }
      __return_val
    `,(result) => {
        if(result){
          const rect = tab.div.getBoundingClientRect()
          ipc.send('force-mouse-up',{x: Math.round(rect.x+10),y:Math.round(rect.y+10)})
        }

        setTimeout(_=>{
          console.log(11111111,result[0])
          if(popup){
            this.detachTab(tab,{width:720,height:480})
            return
          }

          const _tabs = this.state.tabs
          if(_tabs.length > 1) {
            const i = _tabs.findIndex((x)=>x.key === tab.key)
            this.props.addFloatPanel(_tabs,i,true)
            PubSub.publish(`close_tab_${this.props.k}`,{key:tab.key})
          }
          else{
            const t = this.handleTabAddButtonClick()
            setTimeout(_=> {
              const i = _tabs.findIndex((x)=>x.key === tab.key)
              this.props.addFloatPanel(_tabs, i,true)
              PubSub.publish(`close_tab_${this.props.k}`, {key:tab.key})
            },100)
          }
        },10)
      })
    }
    ipc.on('pin-video', tab.events['pin-video'])
  }

  updateHistory(cont,tab,newIndex){
    const url = tab.rSession.urls[newIndex]
    if(!url) return
    tab.rSession.currentIndex = newIndex
    tab.wv.executeJavaScript(`location.replace("${url}")`,()=>{})
    // const conttent = this.getWebContents(tab)
    // conttent.history = [url, tab.page.navUrl]
    // conttent.currentIndex = 1
    // conttent.goBack()

    tab.initPos = [url, tab.rSession.positions[newIndex]]
    this.refs2[`navbar-${tab.key}`].setState({})
  }

  addOp(name,tab,value){
    if(isRecording) ipc.send('add-op',{key:uuid.v4(),tabId:tab.wvId,name,value,now:Date.now()})
  }

  historyBack(cont,tab){
    if(tab.rSession){
      this.updateHistory(cont,tab,tab.rSession.currentIndex - 1)
    }
    else{
      cont.goBack()
    }
    this.addOp('back',tab)
  }

  historyForward(cont,tab){
    if(tab.rSession){
      this.updateHistory(cont,tab,tab.rSession.currentIndex + 1)
    }
    else {
      cont.goForward()
    }
    this.addOp('forward',tab)
  }

  historyGo(cont,tab,ind){
    if(tab.rSession){
      this.updateHistory(cont,tab, tab.rSession.currentIndex + ind)
    }
    else {
      cont.goToOffset(ind)
    }
    // this.addOp('go',tab,ind)
  }

  historyGoIndex(cont,tab,ind){
    if(tab.rSession){
      this.updateHistory(cont,tab,ind)
    }
    else {
      cont.goToIndex(ind)
    }
    // this.addOp('goIndex',tab,ind)
  }

  registChromeEvent(tab) {
    tab.events['chrome-tabs-event'] = (e,{tabId,changeInfo},type)=> {
      if (!this.mounted || tab.wvId !== tabId) return
      switch (type) {
        case 'updated':
          this.handleTabUpdated(tab,changeInfo)
          break
        case 'removed':
          if(changeInfo && changeInfo.panelKey != this.props.k) return
          if(this.state.tabs.find((x)=> x.key == tab.key)){
            this.handleTabClose({}, tab.key, void 0, true)
          }
          break
      }
    }
    ipc.on('chrome-tabs-event', tab.events['chrome-tabs-event'])

    tab.events['chrome-tabs-duplicate'] = (e,key,tabId)=> {
      if(tab.wvId === tabId) {
        tab.wv.duplicate()
      }
    }
    ipc.on('chrome-tabs-duplicate', tab.events['chrome-tabs-duplicate'])
  }

  loadURL(tab, url){
    if(!tab.wv) return
    if(url.startsWith('chrome-extension') && !tab.wv.hostWebContents && !tab.wv.hostWebContents2){
      require('./remoteWebContents').getAllWebContents().find(x=>x.getURL().startsWith(url)).openDevTools()
      return
    }
    tab.wv.loadURL(url)
  }

  navigateTo(newPage, l, tab, guestInstanceId) {
    if (this.mounted){
      this.addOp('navigate',tab,l)
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
      console.log('location-navigateTo',newPage.location)
      if(!tab.guestInstanceId){
        if(tab.wv){
          this.loadURL(tab, convertURL(l))
        }
        else{
          setTimeout(_=>{
            this.loadURL(tab, convertURL(l))
          },1000)
        }
      }
      else{
        // tab.wv.reload()
        const cont = this.getWebContents(tab)
        if(cont){
          ipc.send('get-update-title',tab.wvId,tab.key,tab.rSession,closingPos[tab.key])
          ipc.once(`get-update-title-reply_${tab.wvId}`,(e,c)=> {
            if(!c) return
            if(c.rSession) tab.rSession = c.rSession
            const title = c.title
            if(tab.key == this.state.selectedTab  && !this.isFixed && global.lastMouseDown[2] == this.props.k && title != tab.page.title){
              ipc.send("change-title",title)
            }
            tab.page.title = title
            tab.page.location = decodeURIComponent(c.url)
            console.log('location-get-update-title',tab.page.location)
            tab.page.titleSet = true
          })
        }
      }
      newPage.navUrl = l
      newPage.richContents = []
      // this.setState({})
      this.setStatePartical(tab)
    }
  }

  createPageObject (loc) {
    loc = loc ||''
    let location
    try {
      location = decodeURIComponent(loc)
    } catch (e) {
      location = loc
    }

    return {
      location,
      navUrl: loc,
      title: loc == 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html' ? 'Top Page' : (loc || 'Loading...'),
      statusText: false,
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
      canRefresh: false,
      favicon: 'loading',
      richContents: [],
      createdAt: Date.now()
    }
  }

  onTabIdChanged(tabId, tab, isStart){
    const page = tab.page
    // guestIds[tab.key] = e
    ipc.send('create-web-contents-reply2',tabId, this.props.k, tab.key, Object.keys(this.props.currentWebContents).map(x=>parseInt(x)))
    if(tabId) tab.wvId = tabId
    console.log(999,tabId)
    // tab._guestInstanceId = e.guestInstanceId

    // if(withWindowCreateTabs.has(tab.key)){
    //   ipc.send(`new-window-tabs-created_${tab.wvId}`,this.state.tabs.findIndex(t=>t.key==tab.key))
    //   withWindowCreateTabs.delete(tab.key)
    // }

    // if(tab.readyAttach){
    //   delete tab.readyAttach
    //   ipc.send('chrome-tabs-onAttached-to-main',tab.wvId,{newPosition: this.state.tabs.findIndex(t=>t.key==tab.key)})
    // }

    if(!isStart) {
      const navigateTo = l=>this.navigateTo(page, l, tab)
      this.startProcess(this, page, navigateTo, tab, isStart)
    }
    else{
      page.favicon = page.navUrl == '' || page.navUrl.match(/^(file:\/\/|chrome|about)/) ? 'resource/file.svg' : 'loading'
      page.isLoading = true
      PubSub.publish(`change-status-${tab.key}`)
      this.setStatePartical(tab)
    }

    console.log('onTabIdChanged', tabId,page)

    // const cont = this.getWebContents(tab)
    //
    // ipc.send('get-did-start-loading',tab.wvId)
    // const didStart = (e,c)=> {
    //   console.log('onDidStartLoading',e,Date.now())
    //   if(!c || !this.mounted) return
    //   if(c=='destroy'){
    //     ipc.removeListener(`get-did-start-loading-reply_${tab.wvId}`,didStart)
    //     return
    //   }
    //   tab.videoEvent = false
    // }
    // ipc.on(`get-did-start-loading-reply_${tab.wvId}`,didStart)
    tab.videoEvent = false
  }


  createTab({default_url,c_page=null,c_wv=null,c_div=null,c_key=null,hist=null,privateMode=false,pin=false,protect=false,lock=false,
              mute=false,fields,reloadInterval=false,guestInstanceId,tabPreview,initPos,rest} = {}){
    default_url = default_url == void 0 ? (isFixedVerticalPanel(this.props.k) ? sidebarURL : topURL) : default_url
    if(default_url) default_url = convertURL(default_url)
    const tab = {events:{},ext:{}}
    if(c_wv) tab.wv = c_wv
    if(c_div) tab.div = c_div
    // if(hist) tab.history = hist
    if(rest) Object.assign(tab,rest)
    if(tab.oppositeMode === (void 0)){
      tab.oppositeMode = isFloatPanel(this.props.k) ? false : this.state ? this.state.oppositeGlobal : ipc.sendSync('get-sync-main-state','oppositeGlobal')
    }
    // if(tab.adBlockThis === (void 0)) tab.adBlockThis = adBlockEnable

    if(guestInstanceId) tab.wvId = tab.guestInstanceId = guestInstanceId
    if(initPos) tab.initPos = [default_url, initPos]

    if(!fields) fields = {}
    else{
      fields = recursiveDeepCopy(fields)
    }
    const key = c_key || `${Date.now().toString()}_${uuid.v4()}`

    const newPage = c_page || this.createPageObject(default_url)
    const navigateTo = (l)=> this.navigateTo(newPage, l, tab)
    const locationContextMenu = (el)=> this.locationContextMenu(el, tab, newPage, this, navigateTo)

    const returnWebView = (wv, tabId, div)=>{
      this.onTabIdChanged(tabId,tab)
      console.log("returnWebview")

      wv.isLoading().then(val => {
        if(!val){
          // tab.pageHandlers.onDidNavigate({},tab.page, default_url)
          this.updateTitle(tab.wvId)
          tab.pageHandlers.onDidStopLoading({},tab.page)
        }
      })

      this.registWebView(tab, wv, div)
      // navigateTo(newPage.location)
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
    if(c_wv){
      // console.trace()
      setTimeout(()=>ipc.send('move-browser-view', this.props.k, key, 'attach', tab.wvId, void 0, void 0, void 0, void 0, this.state.selectedTab == tab.key ? 1 : 0, this.state.tabs.findIndex(t=>tab.key == t.key)),0)
      this.registWebView(tab, c_wv, c_div)
    }

    tab.events['get-panel-and-tab-info'] = (e, id, key)=>{
      if (!this.mounted )
        return

      if (!tab.wvId || tab.wvId !== id)
        return

      ipc.send(`get-panel-and-tab-info-reply_${key}`, this.props.k, tab.key)

    }
    ipc.on('get-panel-and-tab-info',tab.events['get-panel-and-tab-info'])


    tab.syncMode = ({url,dirc,sync,replaceInfo})=> {
      let retryNum = 0
      let winInfos = this.props.getScrollPriorities((void 0),dirc)
      const index = winInfos.findIndex(x=>x[0] == this.props.k)
      let winInfo = winInfos[index]
      console.log('sync-mode', url,dirc,sync,replaceInfo)

      const idParent = setInterval(()=> {
        if(retryNum++ > 3){
          clearInterval(idParent)
        }
        tab.dirc = dirc || 1

        let retry = 0
        const id = setInterval(()=> {
          retry++
          if(retry > 200) {
            clearInterval(id)
            return
          }
          if (!tab.wv || !this.getWebContents(tab)) return

          if(!winInfo){
            const winInfos = this.props.getScrollPriorities(0, dirc);
            const index = winInfos.findIndex(x => x[0] == this.props.k);
            winInfo = winInfos[index];
          }

          exeScriptInIsolation(tab.wv,()=>clearInterval(id), ()=> {
            ___SPLIT___
            console.log(i,y,s,r)
            let retry = 0
            const id = setInterval(()=> {
              retry++
              if(retry > 200) {
                clearInterval(id)
                return
              }
              // console.log(window.scrollY)

              clearInterval(id)

              const loadedEvent = _=>{
                console.log(1)
                if(!window.__blankLast__){
                  console.log(3)
                  const ele = document.createElement('div')
                  ele.id = '__blank-last__'
                  ele.style.height = `${100 * i}vh`
                  ele.style.width = "100%"
                  document.body.appendChild(ele)
                  window.__blankLast__ = true
                }
                let min = 200 > y ? y : 200
                if (!r && window.scrollY < min && y !== window.scrollY){
                  console.log(2)
                  window.scrollTo(window.scrollX, y)
                  const evt = document.createEvent('HTMLEvents')
                  evt.initEvent('scroll', true, true)
                  window.dispatchEvent(evt);
                }
              }

              if(document.readyState == "loading"){
                document.addEventListener("DOMContentLoaded",loadedEvent)
                console.log(4)
              }
              else{
                loadedEvent()
                console.log(5)
              }


              if(!r){
                window.__scrollSync__ = i
                window.__syncKey__ = s
              }
            }, 50)
          }, `const i = ${index}`, `const y = ${winInfo[2]}`,`const s = '${sync}'`,`const r = ${(replaceInfo || tab.syncReplace) ? "true" : "false"}`)
          if(index == 0){
            tab.wv.send('sync-button', true, true)
          }
        }, 500)
      },1000)
    }

    if(rest && rest.bind){
      setTimeout(_=>PubSub.publish(`bind-window_${key}`),200)
    }

    return Object.assign(tab,
      {key ,
        // {key: c_key || Date.now().toString(),
        privateMode,
        pin,
        mute,
        fields,
        reloadInterval,
        protect,
        lock,
        tabPreview,
        page: newPage,
        locationContextMenu,
        navHandlers: this.navHandlers(tab, navigateTo, newPage, locationContextMenu),
        pageHandlers: this.pageHandlers(navigateTo, tab, this, newPage),
        returnWebView
      })
  }

  webViewCreate(){
    if(this.webViewCreateId) return
    this.webViewCreateId = setTimeout(()=>{
      this._webViewCreate()
      this.webViewCreateId = void 0
    },30)
  }

  _webViewCreate(){
    console.log('webview-create1', this.state.tabs.map((tab, index)=>tab.page.navUrl))
    if(this.mounted===false) return
    const div = this.refs[`div-${this.state.selectedTab}`] || document.querySelector(`div.div-back.db${this.state.selectedTab}`)
    if(!div) return

    console.log('webview-create2', this.state.tabs.map((tab, index)=>tab.page.navUrl))
    const dom = document.querySelector(`.s${this.props.k}`)
    const isMaximize = dom && dom.style.width == '100vw'
    const ref = div.getBoundingClientRect()
    const navbar = ReactDOM.findDOMNode(this.refs2[`navbar-${this.state.selectedTab}`])
    PubSub.publish('webview-create', {key: this.props.k,
      val: this.state.tabs.map((tab, index)=> {return  {
          key: tab.key,
          tab,
          index,
          toggleNav: this.props.toggleNav,
          privateMode: tab.privateMode,
          isActive: this.state.selectedTab == tab.key,
          ref: ref,
          navbar: navbar,
          modify: this.props.toggleNav != 2 && this.props.toggleNav != 3 && sharedState.bookmarkBar ? 28 : 0,
          float:this.props.float,
          getCapture: !tab.tabPreview,
          isMaximize
          // chromeTab: this.getChromeTab(tab)
        }}
      ).filter(x=> x.key !== undefined)})
  }

  closeSyncTabs(key){
    if(this.mounted === false) return
    const tab = this.state.tabs.find(x => x.key == key)
    if(!tab || !tab.sync) return
    console.log('closeSyncTab',tab)
    PubSub.publish('close-sync-tabs',{k:this.props.k,sync:tab.sync})
  }

  TabPanelClose(key,time,keepWindow){
    console.log('TabPanelClose',this.state.tabs)
    // ipc.send('operation-overlap-component', 'delete', this.props.k)

    for(let tab of this.state.tabs){
      this._closeBind(tab)
    }

    key = key || this.state.selectedTab
    this.closeSyncTabs(key)
    // const tab = this.state.tabs.find(x => x.key == key)
    // if(tab) ipc.send('chrome-tab-removed',parseInt(tab.key))

    const nextK = this.props.getPrevFocusPanel(this.props.k)
    if(nextK){
      const tabPanel = this.props.parent.refs2[nextK]
      ipc.emit('menu-or-key-events',null,'changeFocusPanel',tabPanel.state.tabs.find(tab=>tab.key == tabPanel.state.selectedTab).wvId)
    }

    if(keepWindow){
      const t = this.handleTabAddButtonClick(null,null,true)
      // setTimeout(_=>this.handleTabClose({}, key),0)
    }
    else{
      this.mounted = false
      if(time){
        setTimeout(_=>PubSub.publish('tab-close', {key: this.props.k}),time)
      }
      else{
        PubSub.publish('tab-close', {key: this.props.k})
      }
      ipc.send('tab-panel-close',this.props.k)
    }
  }

  buildRegExp(fromStr){
    try{
      return new RegExp(fromStr,'i')
    }catch(e){
      return (void 0)
    }
  }

  syncUrl(url,replaceInfo,dirc,currentUrl,force){
    if(!replaceInfo) return url
    const winInfos = this.props.getScrollPriorities((void 0),dirc)
    let index = 0
    if(!force){
      index = winInfos.findIndex(x=>x[0]==this.props.k) - 1
      if(index == -1) return currentUrl ? (void 0) : url
    }
    replaceInfo = replaceInfo.filter(x=>x[0])

    const size = replaceInfo.length
    const info = replaceInfo[index >= size ? (size-1) : index]

    const reg = this.buildRegExp(info[2])
    if(!reg) return url

    const to = info[3].replace(/\$(\$\d)/g,`${this.uuid}$1a${this.uuid}`)

    const ret = url.replace(reg,to)
    console.log(to == info[3] ? ret : ret.replace(new RegExp(`${this.uuid}(.+?)a${this.uuid}`),(_,p1)=>encodeURIComponent(p1)))
    return to == info[3] ? ret : ret.replace(new RegExp(`${this.uuid}(.+?)a${this.uuid}`),(_,p1)=>encodeURIComponent(p1))

  }
  componentWillMount(){
    this.props.parent.refs2[this.props.k] = this
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return !this.noUpdate
  // }


  componentDidMount() {
    console.log('componentDidMount')
    ipc.send('operation-overlap-component', 'create', this.props.k)
    this.mounted = true
    this.isFixed = isFixedPanel(this.props.k)

    this.webViewCreate()

    this.eventOpenPanel = (e, {url,sync,id,dirc=1,fore=true,replaceInfo,needCloseTab=false,mobile,adBlockThis,fields,privateMode})=> {
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
                this.props.split(this.props.k,'v',1,(void 0),(void 0),{url:this.syncUrl(url,orgReplaceInfo,dirc,(void 0),true),mobile:tab.mobile,adBlockThis:tab.adBlockThis,fields:tab.fields,privateMode:tab.privateMode})
                setTimeout(()=>{
                  cont.hostWebContents2.send('open-panel',{url,sync,id,dirc,replaceInfo:tab.syncReplace,needCloseTab:true,mobile:tab.mobile,adBlockThis:tab.adBlockThis,fields:tab.fields,privateMode:tab.privateMode})
                },0)
                return
              }
              this.setState({})
            }
            if(sync) setTimeout(()=>tab.syncMode({url,dirc,sync,replaceInfo}),100)
            return
          }
        })
      }


      if(!key) {
        if(this.isFixed) return

        const tab = needCloseTab ? this.state.tabs[0] : tabAdd(this, this.syncUrl(url,replaceInfo,dirc,(void 0),true),fore,privateMode,(void 0),mobile,adBlockThis,fields)
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
              this.props.split(this.props.k,'v',1,(void 0),(void 0),{url:this.syncUrl(url,replaceInfo,dirc),mobile:tab.mobile,adBlockThis:tab.adBlockThis,fields:tab.fields,privateMode:tab.privateMode})
              setTimeout(()=>{
                cont.hostWebContents2.send('open-panel',{url,sync,id:tab.wvId,dirc,replaceInfo:tab.syncReplace,needCloseTab:true,mobile:tab.mobile,adBlockThis:tab.adBlockThis,fields:tab.fields,privateMode:tab.privateMode})
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

        const syncUrl = this.syncUrl(url,tab.syncReplace,dirc,tab.page.navUrl)
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
    PubSub.publish('update-tabs',this.props.k)
  }

  componentWillUnmount() {
    console.log('componentWillUnmount',this.state.selectedTab)
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

  componentDidUpdate(prevProps, prevState,retry=0){
    PubSub.publish('update-tabs',this.props.k)
    if(!Number.isFinite(retry)) retry = 0
    if(this.didUpdateTimer) clearTimeout(this.didUpdateTimer)
    this.didUpdateTimer = setTimeout(()=>{
      // console.log('componentDidUpdate',{prevProps, prevState,this_selectedTab:this.selectedTab,state:this.state})
      if(!this.drag){
        this.webViewCreate()
        this.props.child[0] = this
      }

      //checkPin
      let needSort,pinTabs = [],normalTabs = []
      for(let tab of this.state.tabs){
        if(!needSort && tab.pin && normalTabs.length) needSort = true
        ;(tab.pin ? pinTabs : normalTabs).push(tab)
      }
      if(needSort) this.setState({tabs: [...pinTabs,...normalTabs]})

      const sameSelected = this.selectedTab == this.state.selectedTab
      console.log('sameSelected',sameSelected,this.selectedTab,this.state.selectedTab)
      // if(sameSelected) return

      const allKeySame = this.state.tabKeys.length == this.state.tabs.length &&
        this.state.tabKeys.every((pre,i)=> this.state.tabs[i].key == pre)

      if(allKeySame && sameSelected) return

      if(!allKeySame){
        PubSub.publish('change-tabs')
      }
      else if(!sameSelected){
        PubSub.publish('change-selected')
      }

      const isChangeSelected = !sameSelected
      if(isChangeSelected) {
        if(this.state.inputPopup && this.state.inputPopup.key != this.state.selectedTab) this.setState({inputPopup: null})
        this.state.selectedKeys = this.state.selectedKeys.filter(key => key != this.state.selectedTab && this.state.tabs.some(tab => tab.key == key))
        this.state.selectedKeys.push(this.state.selectedTab)
        sharedState.allSelectedkeys.add(this.state.selectedTab)
        this.updateVisitState()
      }

      this.state._tabKeys = []
      let i = -1
      const changeTabInfos = []
      const func = ()=>{
        if(changeTabInfos.length){
          console.log('change-tab-infos2',changeTabInfos)
          ipc.send('change-tab-infos',changeTabInfos, this.props.k)
        }
        if(!allKeySame){
          this.props.parent.orderingIndexes()
        }
      }

      for(let tab of this.state.tabs){
        ++i
        console.log(tab.wvId,i)
        if(tab.wvId === (void 0)){
          if(retry < 50){
            return setTimeout(_=>this.componentDidUpdate(prevProps, prevState,retry++),100)
          }
          func()
          return
        }
        this.state._tabKeys.push(tab.key)
        const cont = this.getWebContents(tab)
        let isActive
        if(isChangeSelected){
          isActive = tab.key == this.state.selectedTab //&& global.lastMouseDown[2] == this.props.k
          if(isActive && !this.isFixed){
            console.log("change-title",tab.page.title)
            ipc.send("change-title",tab.page.title)
          }
          if(tab.bind){
            console.log(88988,'tabchange')
            ipc.send('set-pos-window',{id:tab.bind.id,hwnd:tab.bind.hwnd,tabId:tab.wvId,top:isActive ? 'above' : 'not-above'})
          }
          else if(tab.fields.mobilePanel){
            ipc.send('mobile-panel-operation',{type: isActive ? 'above' : 'below', key: tab.key, tabId: tab.wvId, force: true})
          }
        }
        if(isActive){
          console.log({tabId:tab.wvId,active:isActive})
          changeTabInfos.push({tabId:tab.wvId,active:isActive})
        }
      }
      this.selectedTab = this.state.selectedTab
      this.state.tabKeys = this.state._tabKeys

      func()
      this.didUpdateTimer = void 0
    }, 10)
  }

  updateIdle(isIdle){
    console.log('change-idle',isIdle,this.props.k)
    const activeTab = activeTabs[this.props.k]
    if(isIdle && activeTab){
      const now = Date.now()
      const tab = this.state.tabs.find(t=>t.key == this.state.selectedTab)
      delete activeTabs[this.props.k]
    }
    else if(!isIdle && !activeTab){
      const now = Date.now()
      const tab = this.state.tabs.find(t=>t.key == this.state.selectedTab)
      if(global.lastMouseDown[2] == this.props.k){
        activeTabs[this.props.k] = [tab,tab.page.navUrl,now]
      }
    }
  }

  updateVisitState(){
    const activeTab = activeTabs[this.props.k]
    console.log('change-visit-state',this.props.k)
    if(activeTab){
      const now = Date.now()
      const tab = this.state.tabs.find(t=>t.key == this.state.selectedTab)
      if(tab){
        activeTabs[this.props.k] = [tab,tab.page.navUrl,now]
      }
      else{
        delete activeTabs[this.props.k]
      }
    }
    else if(!activeTab){
      const now = Date.now()
      const tab = this.state.tabs.find(t=>t.key == this.state.selectedTab)
      if(global.lastMouseDown[2] == this.props.k){
        activeTabs[this.props.k] = [tab,tab.page.navUrl,now]
      }
    }
  }

  handleTabSelect(e, key, scroll) {
    console.log('handleTabSelect key:', key)

    const tab = this.state.tabs.find(x => x.key == key)
    if(!tab) return

    const selectedTab = this.state.tabs.find(x => x.key == this.state.selectedTab)
    if(scroll && selectedTab.bind){
      if(isWin){
        ipc.send('set-active',this.state.selectedTab,selectedTab.bind.hwnd)
      }
      else{
        remote.getCurrentWindow().focus()
      }
    }

    if(!this.isFixed && global.lastMouseDown[2] == this.props.k){
      ipc.send("change-title",tab.page.title)
    }
    PubSub.publish('sync-select-tab',{k:this.props.k,sync:tab.sync})

    // this.webViewCreate()
    console.log("selected04",key)
    this.selectedTime = Date.now()
    if(this.state.selectedTab != key){
      this.setState({selectedTab: key})
    }
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
        ipc.send('set-pos-window',{key:tab.key,id:tab.bind.id,hwnd:tab.bind.hwnd,tabId:tab.wvId,top:'not-above',restore:true})

      }catch(e){
        console.log(2525,e)
      }
    }
  }

  handleCloseRemoveOtherContainer(e,currentTabs) {
    const tab = this.state.tabs[e.oldIndex]

    console.log('handleCloseRemoveOtherContainer')
    this._closeBind(tab)
    if(currentTabs.length==0){
      console.log('handleCloseRemoveOtherContainer0')
      this.props.close(this.props.k)
      this.TabPanelClose(tab.key,1000)
    }
    else{
      if(tab.events) removeEvents(ipc,tab.events)
      const closeTab = this.state.tabs.splice(e.oldIndex,1)[0]
      // console.log("selected05", this.getPrevSelectedTab(tab.key,this.state.tabs,e.oldIndex))
      this.setState({selectedTab: this.getPrevSelectedTab(tab.key,this.state.tabs,closeTab,e.oldIndex)})
      // ipc.send('chrome-tab-removed',parseInt(tab.key))
    }
  }

  getNextSelectedTab(tab,closeTab,i){
    return this.state.tabs.find(t=>t.key == this.state.selectedTab) ? this.state.selectedTab : this.getPrevSelectedTab(tab.key,this.state.tabs,closeTab,i)
  }

  handleTabClose(e, key,isUpdateState=true, force) {
    ipc.send('disable-webContents-focus', false)
    if (!this.mounted) return
    const i = this.state.tabs.findIndex((x)=> x.key == key)
    const tab = this.state.tabs[i]
    if(!tab || (!force && tab.protect)) return

    console.log('tabClosed key:', key,tab.page.navUrl,this.state.tabs.length)
    console.log('change-visit-state-close',this.props.k,tab.page.navUrl)

    this.addCloseTabHistory(e, i)

    const activeTab = activeTabs[this.props.k]
    if(activeTab && activeTab[0].key == key){
      delete activeTabs[this.props.k]
    }

    sharedState.allSelectedkeys.delete(key)

    this._closeBind(tab)

    if(this.state.tabs.length==1){
      if(!e.noSync) this.closeSyncTabs(key)
      const keepWindow = keepWindowLabel31 && this.props.getAllKey().filter(key=>!isFixedPanel(key)).length == 1 && !isFixedPanel(this.props.k)
      if(!keepWindow) this.props.close(this.props.k)
      this.TabPanelClose(key,void 0,keepWindow)
    }
    else{
      if(!e.noSync) this.closeSyncTabs(key)
      if(tab.events) removeEvents(ipc,tab.events)
      // ipc.send('chrome-tab-removed',parseInt(tab.key))
    }
    console.log('handleTabClose')

    if(tab.events) removeEvents(ipc,tab.events)
    const closeTab = this.state.tabs.splice(i,1)[0]
    const _tabs = this.state.tabs


    if (!this.mounted) return
    // console.log("selected06",_tabs.find(t=>t.key == (this.state.selectedTab !== key ? this.state.selectedTab : this.getPrevSelectedTab(key,_tabs,i))),this.state.selectedTab !== key ? this.state.selectedTab : this.getPrevSelectedTab(key,_tabs,i))

    // console.log('close44',closeTab.key,_tabs.find(t=>t.key == this.state.selectedTab) ? this.state.selectedTab : this.getPrevSelectedTab(key,_tabs,closeTab,i))

    if(isUpdateState){
      this.setState({tabs:_tabs,
        selectedTab: _tabs.find(t=>t.key == this.state.selectedTab) ? this.state.selectedTab : this.getPrevSelectedTab(key,_tabs,closeTab,i)
        // selectedTab: _tabs.length > i ? _tabs[i].key : _tabs.length > 0 ? _tabs[i-1].key : null
      } )
    }

    if(this.state.prevAddKeyCount[0] == key){
      this.state.prevAddKeyCount = [null,[]]
    }
    this.state.prevAddKeyCount[1].forEach((x, ind) => x == key && this.state.prevAddKeyCount[1].splice(ind, 1))

  }

  closeTabs(keys){
    this.resetSelection()
    const len = keys.length
    keys.forEach((key,i)=>{
      this.handleTabClose({}, key, i == len - 1)
    })
  }

  closeOtherTabs(key){
    let arr = []
    for(let tab of this.state.tabs){
      if(tab.key != key) arr.push(tab.key)
    }
    arr.forEach((key,i)=> this.handleTabClose({}, key, i == arr.length - 1))
  }

  closeLeftTabs(key){
    let arr = []
    for(let tab of this.state.tabs){
      if(tab.key == key) break
      arr.push(tab.key)
    }
    arr.forEach((t,i)=> this.handleTabClose({}, t, i == arr.length - 1))
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

  reloadOtherTabs(key){
    let arr = []
    for(let tab of this.state.tabs){
      if(tab.key != key) this.getWebContents(tab).reload()
    }
  }

  reloadLeftTabs(key){
    let arr = []
    for(let tab of this.state.tabs){
      if(tab.key == key) return
      this.getWebContents(tab).reload()
    }
  }

  reloadRightTabs(key){
    let arr = []
    let isAppear = false
    for(let tab of this.state.tabs){
      if(isAppear && tab.key != key){
        this.getWebContents(tab).reload()
      }
      else if(tab.key == key){
        isAppear = true
      }
    }
  }

  updateLockTab(tab,val){
    tab.lock = val
    if(val){
      mainState.add('lockTabs',tab.wvId,1)
      exeScript(tab.wv, void 0, ()=> {
        for (let link of document.querySelectorAll('a:not([target="_blank"])')) {
          if (link.href == "") {
          }
          else{
            link.target = "_blank"
            link.dataset.lockTab = "1"
          }
        }
      },'')
    }
    else{
      mainState.del('lockTabs',tab.wvId)
      exeScript(tab.wv, void 0, ()=> {
        for (let link of document.querySelectorAll('a[data-lock-tab]')) {
          link.removeAttribute('target')
          delete link.dataset.lockTab
        }
      },'')
    }
  }

  updateProtectTab(tab,val){
    tab.protect = val
    if(val){
      mainState.add('protectTabs',tab.wvId,1)
      // exeScript(tab.wv, void 0, ()=> {
      //   if(window._unloadEvent_) return
      //   window._unloadEvent_ = e => e.returnValue = ''
      //   window.addEventListener("beforeunload", window._unloadEvent_)
      // },'')
    }
    else{
      mainState.del('protectTabs',tab.wvId)
      // exeScript(tab.wv, void 0, ()=> {
      //   window.removeEventListener("beforeunload", window._unloadEvent_)
      //   delete window._unloadEvent_
      // },'')
    }
  }

  reopenLastClosedTab(){
    if(this.state.history.length > 0) {
      // const [tabKey,ind] = this.state.history.pop()
      //       // const index = ind - 1 < this.state.tabs.length ? ind - 1 : this.state.tabs.length - 2
      //       // this.restoreTabFromTabKey(tabKey,index)
      require('./remoteWebContents').reopenLastClosedTab()
    }
  }

  reopenLastClosedTabAll(){
    for(let [tabKey,ind] of this.state.history.slice(0).reverse()){
      const index = ind - 1 < this.state.tabs.length ? ind - 1 : this.state.tabs.length - 2
      this.restoreTabFromTabKey(tabKey,index)
    }
    this.state.history = []
  }

  openClipboardUrl(t){
    const location = clipboard.readText()
    if(urlutil.isURL(location)){
      const url = urlutil.getUrlFromInput(location)
      this.navigateTo(t.page, url, t)
    }
    else{
      this.search(t, location, false)
    }
  }

  newTabClipboardUrl(t){
    const locations = clipboard.readText()
    for(let location of locations.split(/\r?\n/)){
      if(!location){}
      if(urlutil.isURL(location)){
        const url = urlutil.getUrlFromInput(location)
        t.events['new-tab']({}, t.wvId,url,t.privateMode)
      }
      else{
        this.search(t, location,false,true)
      }
    }
  }

  maximizePanel(){
    const e = document.querySelector(`.s${this.props.k}`)
    if(e.style.width == '100vw'){
      e.style.position = null
      e.style.width = null
      e.style.height = null
      e.style.left = null
      e.style.top = null
      e.style.zIndex = null
    }
    else{
      e.style.position = 'fixed'
      e.style.width = '100vw'
      e.style.height = '100vh'
      e.style.left = 0
      e.style.top = 0
      e.style.zIndex = 5
    }
    this.setState({})
    this.webViewCreate()
  }

  buildReloadInterval(t,sec){
    const checked = !!t.reloadInterval && t.reloadInterval[0] == sec
    const click = () =>{
      if(checked){
        clearInterval(t.reloadInterval[1])
        t.reloadInterval = false
      }
      else{
        if(t.reloadInterval) clearInterval(t.reloadInterval[1])
        const intervalId = setInterval(_=>{
          const cont = this.getWebContents(t)
          if(!cont || cont.isDestroyed()){
            clearInterval(intervalId)
          }
          else{
            cont.reload()
          }
        },sec*1000)
        t.reloadInterval = [sec,intervalId]
      }
      this.setState({})
    }
    let label = `${sec} ${locale.translation('secondsLabel')}`
    if(sec > 60){
      const min = Math.floor(sec / 60)
      const sec2 = sec % 60
      const labelMin = `${min} ${locale.translation(min == 1 ? 'minuteLabel' : 'minutesLabel')}`
      const labelSec = `${sec2 == 0 ? '' : ` ${sec2} ${locale.translation('secondsLabel')}`}`
      label = `${labelMin}${labelSec}`
    }
    return {label, type: 'checkbox', checked, click }
  }


  addScrollPosition(tab){
    tab.wv && tab.wv.executeJavaScript('({x:window.scrollX ,y:window.scrollY})',
      (result) => {
        if(result){
          if(closingPos[tab.key]){
            closingPos[tab.key][tab.page.navUrl] = result
          }
          else{
            closingPos[tab.key] = {[tab.page.navUrl]: result}
          }
        }
        ipc.send('tab-close-handler',tab.wvId,tab.key,tab.rSession,closingPos[tab.key])
        delete closingPos[tab.key]
      })
  }

  addCloseTabHistory(e, i) {
    if (!e.noHistory && (!this.state.tabs[i].privateMode || this.state.tabs[i].privateMode.match(/^persist:\d/))) {
      const tab = this.state.tabs[i]
      const tabKey = tab.key
      this.state.history.push([tabKey,i])

      const cont = this.getWebContents(tab)
      if(cont && !cont.isDestroyed()) cont.send('record-input-history')
      this.addScrollPosition(tab)
    }
  }

  handleTabUpdated(tab,changeInfo){
    console.log(changeInfo)
    if(changeInfo.active && tab.key != this.state.selectedTab){
      if(Date.now() - this.selectedTime > 500){
        console.log("selected07",tab.key, Date.now() - this.selectedTime)
        this.setState({selectedTab: tab.key}) //@TODO
      }
    }
    if(changeInfo.pinned != (void 0)){
      tab.pin = changeInfo.pinned
      this.setState({})
    }
    if(changeInfo.muted != (void 0)){
      tab.mute = changeInfo.muted
      this.setState({})
    }
    if(changeInfo.url !== (void 0)){
      this.navigateTo(tab.page, changeInfo.url, tab)
    }
    // if(changeInfo.title !== (void 0)){
    //   this.updateTitle(tab.wvId)
    // }
    if(changeInfo.status == 'loading'){
      tab.page.updateTitle = true
    }
    else if(changeInfo.status == 'complete'){
      if(tab.page.updateTitle){
        this.updateTitle(tab.wvId)
      }
    }
  }

  handleTabPositionChange(e, key, currentTabs) {
    if (!this.mounted) return

    // console.log(98)
    console.log("selected08",key)
    this.setState({tabs: currentTabs.map((x)=>this.state.tabs.find((t)=>t.key === x.key)),selectedTab: key});
  }

  // handleTabAddOtherContainer(e, key, currentTabs) {
  //   // console.log(98)
  //   this.state.tabs = currentTabs.map(tab=>{
  //     const orgTab = tab.props.orgTab
  //     return tab.key == key ? this.createTab({c_page:orgTab.page,c_wv:orgTab.wv,c_key:orgTab.key,rest:{wvId:orgTab.wvId,bind:orgTab.bind,mobile:orgTab.mobile,adBlockThis:orgTab.adBlockThis,oppositeMode:orgTab.oppositeMode}}) : orgTab
  //   })
  //   console.log("selected09",key)
  //   this.setState({selectedTab: key})
  // }
  //
  // handleTabAddOtherPanel(key,tabs){
  //   let i = this.state.tabs.findIndex((x)=>x.key===key)
  //   let n_tab
  //
  //   for(let orgTab of tabs){
  //     n_tab = this.createTab({c_page:orgTab.page,c_wv:orgTab.wv,c_key:orgTab.key,rest:{wvId:orgTab.wvId,bind:orgTab.bind,mobile:orgTab.mobile,adBlockThis:orgTab.adBlockThis,oppositeMode:orgTab.oppositeMode}})
  //     this.state.tabs.splice(++i, 0, n_tab)
  //   }
  //   console.log("selected10",n_tab.key)
  //   this.setState({selectedTab: n_tab.key})
  //   this.focus_webview(n_tab)
  // }

  handleTabAddButtonClick(e, currentTabs,selected=false) {
    // key must be unique
    const t = this.createTab()
    const key = t.key;
    // this.state.tabs.splice(i+1, 0,t )
    global.openerQueue.push(this.state.tabs.find(t=>t.key == this.state.selectedTab).wvId)
    if(selected){
      this.state.tabs.splice(this.state.tabs.findIndex(t=>t.key == this.state.selectedTab) + 1, 0, t)
    }
    else{
      this.state.tabs.push(t)
    }
    console.log("selected11",key, selected, this.state.tabs.findIndex(t=>t.key == this.state.selectedTab))
    this.setState({selectedTab: key})
    this.focus_webview(t,t.page.location != topURL,t.page.location == topURL)
    return t
  }

  setSelection(tab){
    tab.selection = tab.selection ? (void 0) : Date.now()
  }
  getPrevSelectTabPos(){
    let prevSelectTab = {selection:-1}
    let ind
    this.state.tabs.forEach((tab,i)=>{
      if(tab.selection && tab.selection > prevSelectTab.selection){
        prevSelectTab = tab
        ind = i
      }
    })
    if(prevSelectTab.selection != -1){
      return [prevSelectTab,ind]
    }
    else{
      ind = this.state.tabs.findIndex(x=>x.key == this.state.selectedTab)
      return [this.state.tabs[ind],ind]
    }
  }
  reverseSelection(from,to){
    if(from < to){
      from = from + 1
    }
    else if(from > to){
      [from,to] = [to,from - 1]
    }
    else{
      return
    }
    for(let i=from;i<=to;i++){
      this.setSelection(this.state.tabs[i])
    }
  }

  resetSelection(){
    for(let tab of this.state.tabs){
      tab.selection = (void 0)
    }
  }

  checkEnableSelection(){
    return this.state.tabs.some(t=>t.selection)
  }

  multiSelectionClick(e,key){
    const enableMulti = e.ctrlKey || e.metaKey || e.shiftKey
    const i = this.state.tabs.findIndex((x)=>x.key===key)
    const tab = this.state.tabs[i]
    const tabSelections = this.state.tabs.map(x=>x.selection)

    let prevSelectTab,ind
    if(!(e.ctrlKey || e.metaKey)){
      [prevSelectTab,ind] = this.getPrevSelectTabPos()
      this.resetSelection()
    }
    if(enableMulti && !this.checkEnableSelection()){
      this.setSelection(this.state.tabs.find((x)=>x.key===this.state.selectedTab))
    }

    if(e.ctrlKey || e.metaKey){
      if(e.shiftKey){
        this.reverseSelection(ind,i)
      }
      else{
        this.setSelection(tab)
      }
    }
    else if(e.shiftKey){
      this.reverseSelection(ind,i)

    }
    const tabSelectionsAfter = this.state.tabs.map(x=>x.selection)

    if(diffArray(tabSelections,tabSelectionsAfter).length) this.setState({})
    return enableMulti
  }

  onAddFavorites(tabKey){
    const keys = []
    const tabs = tabKey ? this.state.tabs.filter(x=>x.key == tabKey) : this.state.tabs
    let head
    const datas = tabs.map((tab,i)=>{
        const {page} = tab
        if(i==0){
          head = multiByteSlice(page.title,12)
        }
        const key = uuid.v4()
        keys.push(key)
        return {url:page.navUrl, title:page.title}
      })
    ;(async ()=> {
      if(tabKey){
        const key = datas[0].key
        await favorite.create(datas)
      }
      else{
        const dirc = moment().format("YYYY/MM/DD HH:mm:ss")
        const folder = await favorite.create({title:`${head} ${dirc}`})
        await favorite.create(datas, folder[0].id)
      }
    })()
  }

  getSelectionTabs(){
    const sTabs = [],nTabs = []
    for(let tab of this.state.tabs){
      if(tab.selection){
        sTabs.push(tab)
      }
      else{
        nTabs.push(tab)
      }
    }
    return [sTabs,nTabs]
  }

  contextMenuItemBuild(items){
    for(let item of items){
      if(item.submenu){
        this.contextMenuItemBuild(item.submenu)
      }
      if(item.data){
        item.click = ()=>{
          ipc.send('tab-contextMenu-clicked',item.data)
        }
      }
    }
  }

  handleContextMenu(e,key,currentTabs,tabs){
    this._handleContextMenu(e,key,currentTabs,tabs)
  }

  handleContextMenuTree(e,key,currentTabs,tabs){
    this._handleContextMenu(e,key,currentTabs,tabs,true)
  }

  _handleContextMenu(e,key,currentTabs,tabs,tree,notPopup){
    if(e) e.preventDefault()
    console.log('context-time1',Date.now())
    const _tabs = this.state.tabs
    const i = _tabs.findIndex((x)=>x.key===key)
    const t = _tabs[i]
    const selections = this.getSelectionTabs()
    const enableSelection = selections[0].length > 0

    var menuItems = []

    if(tree){
      menuItems.push(({ t: 'closeThisTree', label: locale.translation('closeThisTree'), click: ()=>PubSub.publish('close-tree',{key:this.props.k,tabId:t.wvId,tabKey:t.key})}))
      menuItems.push(({ type: 'separator' }))
    }
    // menuItems.push(({ label: 'New Tab', click: ()=>document.querySelector(".rdTabAddButton").click()}))
    menuItems.push(({ t:'newTab',label: locale.translation('newTab'), click: ()=>this.createNewTab(_tabs, i)}))
    // menuItems.push(({ t:'newPrivateTab',label: locale.translation('newPrivateTab'), click: ()=>this.createNewTab(_tabs, i,{default_url:"",privateMode:`${ipc.sendSync('get-session-sequence',true)}`})}))
    // menuItems.push(({ t:'newTorTab',label: 'New Tor Tab', click: ()=>this.createNewTab(_tabs, i,{default_url:"",privateMode:'persist:tor'})}))
    // menuItems.push(({ t:'newSessionTab',label: locale.translation('newSessionTab'), click: ()=>this.createNewTab(_tabs, i,{privateMode:`persist:${ipc.sendSync('get-session-sequence')}`})}))
    menuItems.push(({ type: 'separator' }))

    const splitFunc = (dirc,pos)=> {
      if(enableSelection){
        const arr = [],indexes = []
        this.state.tabs.forEach((tab,i)=> {
          if(tab.selection){
            arr.push(tab.key)
            indexes.push(i)
          }
        })
        if(selections[1].length == 0){
          this.props.split(this.props.k, dirc, pos * -1)
        }
        else{
          this.props.split(this.props.k,dirc,pos,_tabs,indexes)
          arr.forEach((key,i)=> {
            PubSub.publish(`close_tab_${this.props.k}`,{key,isUpdateState:i == arr.length - 1})
          })
        }
      }
      else{
        if(_tabs.length > 1) {
          // ipc.send('send-keys',{type:'keyDown',keyCode:'Right',modifiers: ['control','alt']})
          this.props.split(this.props.k,dirc,pos,_tabs,i)
          this.handleTabClose({}, key)
          PubSub.publish(`close_tab_${this.props.k}`,{key})
        }
        else{
          this.props.split(this.props.k, dirc, pos * -1)
        }
      }
      if(this.refs2[`tabs-${this.props.k}`]) this.refs2[`tabs-${this.props.k}`].unmountMount()
    }

    const splitOtherTabsFunc = (dirc,pos)=> {
      const arr = [],indexes = []
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

      if(!arr.length) return

      if(_tabs.length > 1) {
        this.props.split(this.props.k,dirc,pos,_tabs,indexes)
        arr.forEach((key,i)=> {
          PubSub.publish(`close_tab_${this.props.k}`,{key,isUpdateState:i == arr.length - 1})
        })
      }
      if(this.refs2[`tabs-${this.props.k}`]) this.refs2[`tabs-${this.props.k}`].unmountMount()
    }

    const detachToFloatPanel = _=>{
      if(enableSelection){
        if(selections[1].length == 0){
          const t = this.handleTabAddButtonClick()
          setTimeout(_=> {
            const arr = [],indexes = []
            const _tabs = this.state.tabs
            this.state.tabs.forEach((tab,i)=> {
              if(tab.selection){
                arr.push(tab.key)
                indexes.push(i)
              }
            })
            let j = 0
            for(let i of indexes){
              this.props.addFloatPanel(_tabs,i)
              PubSub.publish(`close_tab_${this.props.k}`,{key:arr[j]})
              j++
            }
          },100)
        }
        else{
          const arr = [],indexes = []
          this.state.tabs.forEach((tab,i)=> {
            if(tab.selection){
              arr.push(tab.key)
              indexes.push(i)
            }
          })
          let j = 0
          for(let i of indexes){
            this.props.addFloatPanel(_tabs,i)
            PubSub.publish(`close_tab_${this.props.k}`,{key:arr[j]})
            j++
          }
        }
      }
      else{
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
    }

    if(!this.isFixed){
      menuItems.push(({ t: 'splitLeft', label: locale.translation('splitLeft'), click: splitFunc.bind(this,'v',-1) }))
      menuItems.push(({ t: 'splitRight', label: locale.translation('splitRight'), click: splitFunc.bind(this,'v',1) }))
      menuItems.push(({ t: 'splitTop', label: locale.translation('splitTop'), click: splitFunc.bind(this,'h',-1) }))
      menuItems.push(({ t: 'splitBottom', label: locale.translation('splitBottom'), click: splitFunc.bind(this,'h',1) }))
      menuItems.push(({ type: 'separator' }))
      // menuItems.push(({ label: 'Split Left Tabs to Left', click: splitOtherTabsFunc.bind(this,'v',-1) }))
      if(!enableSelection){
        menuItems.push(({ t: 'splitLeftTabsToLeft', label: locale.translation('splitLeftTabsToLeft'), click: splitOtherTabsFunc.bind(this,'v',-1) }))
        menuItems.push(({ t: 'splitRightTabsToRight', label: locale.translation('splitRightTabsToRight'), click: splitOtherTabsFunc.bind(this,'v',1) }))
      }

      // menuItems.push(({ t: 'floatingPanel', label: locale.translation('floatingPanel'), click: _=>detachToFloatPanel() }))
      menuItems.push(({ t: 'maximizePanel', label: 'Maximize Panel', click: _=>this.maximizePanel()}))
      menuItems.push(({ type: 'separator' }))
      menuItems.push(({ t: 'swapPosition', label: locale.translation('swapPosition'), click: ()=> { PubSub.publish(`swap-position_${this.props.k}`)} }))
      menuItems.push(({ t: 'switchDirection', label: locale.translation('switchDirection'), click: ()=> { PubSub.publish(`switch-direction_${this.props.k}`)} }))
      menuItems.push(({ type: 'separator' }))
      menuItems.push(({ t: 'alignHorizontal', label: locale.translation('alignHorizontal'), click: ()=> { PubSub.publish('align','h')} }))
      menuItems.push(({ t: 'alignVertical', label: locale.translation('alignVertical'), click: ()=> { PubSub.publish('align','v')} }))
      menuItems.push(({ type: 'separator' }))
    }


    // menuItems.push(({ label: locale.translation('3551320343578183772'), //close tab
    //   click: ()=> this.handleTabClose({}, key)}))

    if(enableSelection){
      menuItems.push(({ t:'clicktabCopyTabUrl',label: locale.translation('clicktabCopyTabUrl').replace('&apos;',"'"), click: ()=>ipc.send("set-clipboard",selections[0].map(t.page.navUrl))}))
      menuItems.push(({ t:'clicktabCopyUrlFromClipboard',label: locale.translation('clicktabCopyUrlFromClipboard'), click: _=>selections[0].forEach(t=>this.openClipboardUrl(t))}))
      menuItems.push(({ t: 'copyTabInfo', label: locale.translation('copyTabInfo'), click: _=>ipc.send("set-clipboard",selections[0].map(t=>`${this.state.tabs.findIndex(tab=>t.key==tab.key)+1}\t${t.page.title}\t${t.page.navUrl}`))}))
      menuItems.push(({ t: 'copyAllTabTitles', label: locale.translation('copyAllTabTitles'), click: _=>ipc.send("set-clipboard",this.state.tabs.map((t,i)=>t.page.title))}))
      menuItems.push(({ t: 'copyAllTabURLs', label: locale.translation('copyAllTabURLs'), click: _=>ipc.send("set-clipboard",this.state.tabs.map((t,i)=>t.page.navUrl))}))
      menuItems.push(({ t: 'copyAllTabInfos', label: locale.translation('copyAllTabInfos'), click: _=>ipc.send("set-clipboard",this.state.tabs.map((t,i)=>`${i+1}\t${t.page.title}\t${t.page.navUrl}`))}))
      menuItems.push(({ type: 'separator' }))

      menuItems.push(({ t:'reloads',label: locale.translation('reload'), click: ()=> selections[0].forEach(t=>this.getWebContents(t).reload())}))
      menuItems.push(({ t:'cleanReloads',label: locale.translation('cleanReload'), click: ()=> selections[0].forEach(t=>this.getWebContents(t).reloadIgnoringCache())}))
      menuItems.push(({ t:'clicktabReloadtabs',label: locale.translation('clicktabReloadtabs'), click: ()=> this.state.tabs.forEach(t=>this.getWebContents(t).reload())}))
      menuItems.push(({ t:'3007771295016901659',label: locale.translation('3007771295016901659'), //'Duplicate',
        click: ()=> {
          for(let t of selections[0]){
            // ipc.send("set-recent-url",t.page.navUrl)
            this.addScrollPosition(t)
            setTimeout(()=>{
              this.restoreTabFromTabKey(t.key)
            },200)
          }
          this.resetSelection()
        } }))

      const allPined = selections[0].every(t=>t.pin)
      menuItems.push(({ t:'unpinTab',label: allPined ? locale.translation('unpinTab') : locale.translation('pinTab'), click: ()=> {
          selections[0].forEach(t=>t.pin = !allPined)
          this.resetSelection()
          this.setState({})
        }}))


      const allMuted = selections[0].every(t=>t.mute)
      menuItems.push(({ t:'unmuteTab',label: allMuted ? locale.translation('unmuteTab') : locale.translation('muteTab'), click: ()=> {
          selections[0].forEach(t=>{t.mute = !allMuted;this.getWebContents(t).setAudioMuted(t.mute)})
          this.resetSelection()
          this.setState({})
        }}))

      menuItems.push(({ type: 'separator' }))
      const allFreezed = selections[0].every(t=>t.protect && t.lock)
      menuItems.push(({ t:'freezeTabMenuLabel',type: 'checkbox',label: locale.translation('freezeTabMenuLabel'), checked: allFreezed,
        click: ()=> {
          selections[0].forEach(t=>{this.updateProtectTab(t,!allFreezed);this.updateLockTab(t,!allFreezed)})
          this.resetSelection()
          this.setState({})
        }}))
      const allProtected = selections[0].every(t=>t.protect)
      menuItems.push(({ t:'protectTabMenuLabel',type: 'checkbox',label: locale.translation('protectTabMenuLabel'), checked: allProtected,
        click: ()=> {
          selections[0].forEach(t=>this.updateProtectTab(t,!allFreezed))
          this.resetSelection()
          this.setState({})
        }}))
      const allLocked = selections[0].every(t=>t.lock)
      menuItems.push(({ t:'lockTabMenuLabel',type: 'checkbox',label: locale.translation('lockTabMenuLabel'), checked: allLocked,
        click: ()=> {
          selections[0].forEach(t=>this.updateLockTab(t,!allFreezed))
          this.resetSelection()
          this.setState({})
        }}))
      menuItems.push(({ type: 'separator' }))

      menuItems.push(({ t:'5453029940327926427',label: locale.translation('5453029940327926427'), click: ()=> this.closeTabs(selections[0].map(t=>t.key))}))
      menuItems.push(({ t:'closeOtherTabs',label: locale.translation('closeOtherTabs'), click: ()=> this.closeTabs(selections[1].map(t=>t.key))}))
    }
    else{
      menuItems.push(({ t:'clicktabCopyTabUrl',label: locale.translation('clicktabCopyTabUrl').replace('&apos;',"'"), click: ()=>ipc.send("set-clipboard",[t.page.navUrl])}))
      menuItems.push(({ t:'clicktabCopyUrlFromClipboard',label: locale.translation('clicktabCopyUrlFromClipboard'), click: _=>this.openClipboardUrl(t)}))
      menuItems.push(({ t: 'pasteAndOpen', label: locale.translation('pasteAndOpen'), click: _=>this.newTabClipboardUrl(t)}))
      menuItems.push(({ t: 'copyTabInfo', label: locale.translation('copyTabInfo'), click: _=>ipc.send("set-clipboard",[`${this.state.tabs.findIndex(tab=>t.key==tab.key)+1}\t${t.page.title}\t${t.page.navUrl}`])}))
      menuItems.push(({ t: 'copyAllTabTitles', label: locale.translation('copyAllTabTitles'), click: _=>ipc.send("set-clipboard",this.state.tabs.map((t,i)=>t.page.title))}))
      menuItems.push(({ t: 'copyAllTabURLs', label: locale.translation('copyAllTabURLs'), click: _=>ipc.send("set-clipboard",this.state.tabs.map((t,i)=>t.page.navUrl))}))
      menuItems.push(({ t: 'copyAllTabInfos', label: locale.translation('copyAllTabInfos'), click: _=>ipc.send("set-clipboard",this.state.tabs.map((t,i)=>`${i+1}\t${t.page.title}\t${t.page.navUrl}`))}))
      menuItems.push(({ type: 'separator' }))

      menuItems.push(({ t:'reload',label: locale.translation('reload'), click: ()=>this.getWebContents(t).reload()}))
      menuItems.push(({ t:'cleanReload',label: locale.translation('cleanReload'), click: ()=>this.getWebContents(t).reloadIgnoringCache()}))
      menuItems.push(({ t:'clicktabReloadtabs',label: locale.translation('clicktabReloadtabs'), click: ()=> this.state.tabs.forEach(t=>this.getWebContents(t).reload())}))
      menuItems.push(({ t:'clicktabReloadothertabs',label: locale.translation('clicktabReloadothertabs'), click: ()=> this.reloadOtherTabs(key)}))
      menuItems.push(({ t:'clicktabReloadlefttabs',label: locale.translation('clicktabReloadlefttabs'), click: ()=> this.reloadLeftTabs(key)}))
      menuItems.push(({ t:'clicktabReloadrighttabs',label: locale.translation('clicktabReloadrighttabs'), click: ()=> this.reloadRightTabs(key)}))


      menuItems.push(({ t:'autoReloadTabLabel',label: locale.translation('autoReloadTabLabel'), submenu: reloadIntervals.map(sec=>this.buildReloadInterval(t,sec))}))
      menuItems.push(({ t:'3007771295016901659',label: locale.translation('3007771295016901659'), //'Duplicate',
        click: ()=> {
          // ipc.send("set-recent-url",t.page.navUrl)
          this.addScrollPosition(t)
          setTimeout(()=>{
            this.restoreTabFromTabKey(t.key)
          },200)
        } }))

      menuItems.push(({ t:'unpinTab',label: t.pin ? locale.translation('unpinTab') : locale.translation('pinTab'), click: ()=> {t.pin = !t.pin;this.setState({})}}))
      menuItems.push(({ t:'unmuteTab',label: t.mute ? locale.translation('unmuteTab') : locale.translation('muteTab'), click: ()=> {t.mute = !t.mute;this.getWebContents(t).setAudioMuted(t.mute);this.setState({})}}))
      menuItems.push(({ type: 'separator' }))
      menuItems.push(({ t:'freezeTabMenuLabel',type: 'checkbox', label: locale.translation('freezeTabMenuLabel'), checked:t.protect && t.lock, click: ()=> {const val = !(t.protect && t.lock);this.updateProtectTab(t,val);this.updateLockTab(t,val);this.setState({})}}))
      menuItems.push(({ t:'protectTabMenuLabel',type: 'checkbox', label: locale.translation('protectTabMenuLabel'), checked:t.protect, click: ()=> {this.updateProtectTab(t,!t.protect);this.setState({})}}))
      menuItems.push(({ t:'lockTabMenuLabel', type: 'checkbox', label: locale.translation('lockTabMenuLabel'), checked:t.lock ,click: ()=> {this.updateLockTab(t,!t.lock);this.setState({})}}))
      menuItems.push(({ type: 'separator' }))
      menuItems.push(({ t:'closeTab',label: locale.translation('closeTab'), click: ()=> this.handleTabClose({}, key)}))
      menuItems.push(({ t:'closeOtherTabs',label: locale.translation('closeOtherTabs'), click: ()=> this.closeOtherTabs(key)}))
      menuItems.push(({ t:'closeTabsToLeft',label: locale.translation('closeTabsToLeft'), click: ()=> this.closeLeftTabs(key)}))
      menuItems.push(({ t:'closeTabsToRight',label: locale.translation('closeTabsToRight'), click: ()=> this.closeRightTabs(key)}))
    }

    menuItems.push(({ label: locale.translation('closeAllTabsMenuLabel'), click: ()=> {
        // console.log(this)
        this.props.close(this.props.k)
        this.TabPanelClose()
      } }))

    menuItems.push(({ type: 'separator' }))

    if(this.state.history.length > 0){
      menuItems.push(({ t:'reopenLastClosedTab',label: locale.translation('reopenLastClosedTab'), click: ()=> this.reopenLastClosedTab() }))
      menuItems.push(({ t:'clicktabUcatab',label: locale.translation('clicktabUcatab'), click: ()=> this.reopenLastClosedTabAll() }))
    }
    menuItems.push(({ t:'bookmarkPage',label: locale.translation('bookmarkPage'),click: this.onAddFavorites.bind(this,t.key) }))
    menuItems.push(({ t:'5078638979202084724',label: locale.translation('5078638979202084724'),click: _=>this.onAddFavorites() }))

    if(notPopup) return menuItems

    menuItems.forEach((x,i)=>x.num = -i + parseInt(priorityTabContextMenus[x.t || x.label] || 0) * 100)
    menuItems = menuItems.sort((a,b)=> b.num - a.num)

    menuItems = menuItems.filter(x=>!disableTabContextMenus.has(x.t || x.label))

    const menuItems2 = []
    menuItems.forEach((x,i)=>{
      menuItems2.push(x)
      if(menuItems[i+1] && parseInt(x.num / 100) != parseInt(menuItems[i+1].num / 100)){
        menuItems2.push({ type: 'separator' })
      }
    })
    menuItems = menuItems2

    menuItems = menuItems.filter((x,i)=>{
      if(i==0) return x.type != 'separator'
      return !(menuItems[i-1].type == 'separator' && x.type == 'separator')
    })

    console.log('context-time2',Date.now())
    const items = ipc.sendSync('get-tab-contextMenu',key,t.page.navUrl,t.wvId)
    console.log('context-time3',Date.now())
    this.contextMenuItemBuild(items)
    menuItems.push(...items)
    let menu = Menu.buildFromTemplate(menuItems)
    console.log('context-time4',Date.now(),menuItems)
    ipc.send('menu-popup')
    ipc.once('menu-popup-reply', ()=> menu.popup({}, () => ipc.send('menu-popup-end')))

  }

  createNewTab(tabs, i = tabs.length -1,opt={}) {
    setTimeout(_=>{
      const n_tab = this.createTab(opt)
      tabs.splice(i + 1, 0, n_tab)
      console.log("selected13",n_tab.key)
      this.setState({tabs,selectedTab: n_tab.key})
      this.focus_webview(n_tab,n_tab.page.location != topURL)
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
        this.props.currentWebContents[data.wvId] = ipc.sendSync('get-shared-state-main',data.wvId)

        n_tab = this.createTab({c_page:data.c_page,c_key:data.c_key,privateMode:data.privateMode,tabPreview:data.tabPreview,pin:data.pin,protect:data.protect,lock:data.lock,mute:data.mute,fields:data.fields,reloadInterval:data.reloadInterval,guestInstanceId:data.guestInstanceId,rest:data.rest})
        tabs.splice(++i, 0, n_tab)
      }

      console.log("selected14",n_tab.key)
      this.setState({selectedTab: n_tab.key})
      this.focus_webview(n_tab,true)
      ipc.send('detach-tab-from-other-window-finish')
    })
  }

  handleKeyDown(e) {
    // if(e.stopPropagation) e.stopPropagation()
    PubSub.publish('webview-keydown',e)
  }

  scrollPage(dirc){
    const tab = this.state.tabs.find(x => x.key == this.state.selectedTab)
    const winInfos = this.props.getScrollPriorities(this.scrollbar === void 0 ? 15 : this.scrollbar,tab.dirc || 1)
    const index = winInfos.findIndex(x=>x[0]==this.props.k)
    const winInfo = winInfos[index]

    console.log(winInfo)

    exeScriptInIsolation(tab.wv,void 0, ()=> {
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
      exeScriptInIsolation(tab.wv, void 0, ()=> {
        console.log(2222)
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
      const val = {url:tab.page.navUrl,sync:uuid.v4(), id:tab.wvId,replaceInfo,mobile: tab.mobile, adBlockThis: tab.adBlockThis, fields: tab.fields, privateMode: tab.privateMode}
      if(replaceInfo){
        val.dirc = this.props.getKeyPosition(this.props.k).dirc == 'l' ? 1 : -1
      }
      console.log(69000,val)
      cont.hostWebContents2.send('open-panel', val);
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
    // PubSub.publish('sync-zoom',{k:this.props.k,percent,sync})
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
      // let e
      // if(!(e = guestIds[tab.key])){
      //   return
      // }
      // tab.wvId = e.tabId
      // console.log(111,tab.wvId,e)
      return
    }
    return this.props.currentWebContents[tab.wvId]
  }

  focus_webview(tab,flag=true,locationBar) {
    // if(isLinux) return

    if(locationBar) return //@TODO
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
      console.log(33311,!t,tab.page.isLoading,!this.getWebContents(tab),tab.page)
      if (!t || (tab.page.isLoading && !tab.page.domLoaded) || !this.getWebContents(tab)) return
      clearInterval(id)
      const active = document.activeElement
      console.log(33300,active)
      if((flag || active.className != 'prompt')|| active.tagName == 'BODY'){
        if(locationBar){
          ipc.emit('focus-location-bar',null,tab.wvId)
        }
        else{
          t.focus()
        }
      }
    }, 100)
  }

  updateTitle(id){
    const tab = this.state.tabs.find(tab => tab.wvId && tab.wvId === id)
    if(!tab) return

    tab.page.updateTitle = false
    ipc.send('get-update-title',tab.wvId,tab.key,tab.rSession,closingPos[tab.key])
    ipc.once(`get-update-title-reply_${tab.wvId}`,(e,c)=> {
      if(!c) return

      if(c.rSession) tab.rSession = c.rSession
      tab.page.canGoBack = c.currentEntryIndex !== 0
      tab.page.canGoForward = c.currentEntryIndex + 1 !== c.entryCount
      tab.page.canRefresh = true
      console.log('onPageTitleSet')
      console.log(c.url)


      if(c.url.startsWith('chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd')){
        tab.page.isLoading = false
        tab.page.favicon = 'resource/file.svg'
        this.refs2[`navbar-${tab.key}`].setState({})
        this.setStatePartical(tab)
      }

      if (!this.mounted) return
      const url = c.url

      const title = c.title
      if (tab.key == this.state.selectedTab && !this.isFixed && global.lastMouseDown[2] == this.props.k && title != tab.page.title) {
        ipc.send("change-title", title)
      }
      tab.page.title = title

      tab.page.navUrl = url

      tab.prevSyncNav = url //@TOOD arrage navurl,location,sync panel
      try {
        tab.page.location = decodeURIComponent(url)
      } catch (e) {
        tab.page.location = url
      }
      console.log('location-get-update-title2',tab.page.location)
      tab.page.titleSet = true

      // console.log(1444,cont.getURL(),tab.page.title)
      let hist
      if ((hist = historyMap.get(url))) {
        if (!hist[0]) hist[0] = tab.page.title
      }
      else {
        historyMap.set(url, [tab.page.title])
      }

      if (!tab.privateMode || tab.privateMode.match(/^persist:\d/)) {
        history.update({location: c.url}, {
          $set: { title: tab.page.title, updated_at: Date.now() }})
      }
      try {
        this.refs2[`navbar-${tab.key}`].refs['loc'].canUpdate = true
      } catch (e) {
        console.log(e)
      }
      this.setStatePartical(tab)
      // ipc.send('chrome-tab-updated',parseInt(tab.key), cont, this.getChromeTab(tab))
    })
  }

  toggleNavPanel(num){
    // tabsStyles.tabBar.display = !this.state.tabBar && (this.props.toggleNav == 0 || this.props.toggleNav == 2) ? "flex" : "none"
    this.setState({tabBar: num})
  }

  showNotification(){
    ipc.send('disable-webContents-focus', true)
    ipc.send('change-browser-view-z-index', true)
  }

  deleteNotification(i,pressIndex,value){
    ipc.send('disable-webContents-focus', false)
    ipc.send(`reply-notification-${this.state.notifications[i].key}`,{pressIndex,value})
    this.state.notifications.splice(i,1)
    this.setState({})
  }


  detachPanel(bounds={}) {
    if(!this.props.parent.state.root.r) return
    const vals = this.state.tabs.map(tab=>{
      ipc.send('move-browser-view', this.props.k, tab.key, 'detach')
      const d = {wvId:tab.wvId,c_page:tab.page,c_key:tab.key,privateMode:tab.privateMode,tabPreview:tab.tabPreview,pin:tab.pin,protect:tab.protect,lock:tab.lock,mute:tab.mute,fields:tab.fields,reloadInterval:tab.reloadInterval,
        rest:{rSession:tab.rSession,wvId:tab.wvId,openlink: tab.openlink,sync:tab.sync,syncReplace:tab.syncReplace,dirc:tab.dirc,ext:tab.ext,oppositeMode:tab.oppositeMode,bind:tab.bind,mobile:tab.mobile,adBlockThis:tab.adBlockThis},guestInstanceId: tab.wvId}
      ipc.send('chrome-tabs-onDetached-to-main',d.wvId,{oldPosition: this.state.tabs.findIndex(t=>t.key==d.c_key)})
      return d
    })
    const winId = ipc.sendSync('browser-load',{id:remote.getCurrentWindow().id,...bounds,tabParam:JSON.stringify(vals)})
  }

  async detachTab(tab,bounds={}) {
    const _tabs = this.state.tabs
    if(_tabs.length > 1) {
      ipc.send('move-browser-view', this.props.k, tab.key, 'detach')
      const d = {wvId:tab.wvId,c_page:tab.page,c_key:tab.key,privateMode:tab.privateMode,tabPreview:tab.tabPreview,pin:tab.pin,protect:tab.protect,lock:tab.lock,mute:tab.mute,fields:tab.fields,reloadInterval:tab.reloadInterval,
        rest:{rSession:tab.rSession,wvId:tab.wvId,openlink: tab.openlink,sync:tab.sync,syncReplace:tab.syncReplace,dirc:tab.dirc,ext:tab.ext,oppositeMode:tab.oppositeMode,bind:tab.bind,mobile:tab.mobile,adBlockThis:tab.adBlockThis},guestInstanceId: tab.wvId}
      ipc.send('chrome-tabs-onDetached-to-main',d.wvId,{oldPosition: this.state.tabs.findIndex(t=>t.key==d.c_key)})
      const winId = ipc.sendSync('browser-load',{id:remote.getCurrentWindow().id,...bounds,_alwaysOnTop:true,toggle:1,tabParam:JSON.stringify([d])})
    }
    else{
      const t = this.handleTabAddButtonClick()
      setTimeout(async _=> {
        ipc.send('move-browser-view', this.props.k, tab.key, 'detach')
        const d = {wvId:tab.wvId,c_page:tab.page,c_key:tab.key,privateMode:tab.privateMode,tabPreview:tab.tabPreview,pin:tab.pin,protect:tab.protect,lock:tab.lock,mute:tab.mute,fields:tab.fields,reloadInterval:tab.reloadInterval,
          rest:{rSession:tab.rSession,wvId:tab.wvId,openlink: tab.openlink,sync:tab.sync,syncReplace:tab.syncReplace,dirc:tab.dirc,ext:tab.ext,oppositeMode:tab.oppositeMode,bind:tab.bind,mobile:tab.mobile,adBlockThis:tab.adBlockThis},guestInstanceId: tab.wvId}
        ipc.send('chrome-tabs-onDetached-to-main',d.wvId,{oldPosition: this.state.tabs.findIndex(t=>t.key==d.c_key)})
        const winId = ipc.sendSync('browser-load',{id:remote.getCurrentWindow().id,...bounds,_alwaysOnTop:true,toggle:1,tabParam:JSON.stringify([d])})
      },100)
    }

  }

  getFocusedTabId(activeElement){
    if(activeElement.tagName == 'WEBVIEW'){
      const tab = this.state.tabs.find(tab=>ReactDOM.findDOMNode(tab.wv) == activeElement)
      if(tab) return tab.wvId
    }
  }

  getSelectedTabId(){
    const tab = this.getSelectedTab()
    if(tab) return tab.wvId
  }

  getSelectedTab(){
    return this.state.tabs.find(tab=>tab.key == this.state.selectedTab)
  }

  getTabFromTabId(id){
    return this.state.tabs.find(x=>x.wvId === id)
  }

  async getTabsInfo(){
    const results = []
    for(let tab of this.state.tabs){
      const historyList = []
      let cont, currentIndex
      if((cont = this.getWebContents(tab))){
        let histNum = await cont.length()
        currentIndex = histNum - (await cont.getActiveIndex()) - 1
        for(let i=histNum -1;i>=0;i--){
          const url = await cont.getURLAtIndex(i)
          const datas = historyMap.get(url)
          historyList.push({title:datas && datas[0],url,favicon: datas && datas[1]}) //tabsPanel Fix
        }
      }
      results.push({currentIndex,historyList,selectedTab: tab.key == this.state.selectedTab})
    }
    return results
  }

  screenShot(full,type,tab){
    if(!full){
      const canvas = document.createElement('canvas')
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      canvas.style.position = 'fixed'
      canvas.style['z-index'] = 9999999
      canvas.style['background'] = 'rgba(204,204,204,.5)'
      canvas.style.cursor = 'crosshair'
      document.body.appendChild(canvas)

      let ctx = canvas.getContext('2d'),
        rect = {},drag

      const draw = ()=>{
        ctx.setLineDash([6]);
        ctx.strokeRect(rect.left, rect.top, rect.w, rect.h)
      }
      const mdown = e=>{
        document.removeEventListener('mousedown',mdown,false)
        document.addEventListener('mouseup',mup,false)
        document.addEventListener('mousemove',mmove,false)

        rect.startX = e.pageX
        rect.startY = e.pageY
        drag = true
      }
      const mmove = e=>{
        if (drag) {
          rect.w = Math.abs(e.pageX - rect.startX)
          rect.h = Math.abs(e.pageY - rect.startY)
          rect.left = Math.min(e.pageX, rect.startX)
          rect.top = Math.min(e.pageY, rect.startY)

          ctx.clearRect(0,0,canvas.width,canvas.height)
          draw()
        }
      }
      const mup = e=>{
        drag = false
        document.body.removeChild(canvas)
        document.removeEventListener('mousemove',mmove,false)
        document.removeEventListener('mouseup',mup,false)
        setTimeout(_=>ipc.send('screen-shot',{full,type,rect:{x:rect.left,y:rect.top,width:rect.w,height:rect.h},tabId:tab.wvId,tabKey:tab.key}),100)
      }
      document.addEventListener('mousedown',mdown,false)
    }
    else{
      ipc.send('screen-shot',{full,type,tabId:tab.wvId,tabKey:tab.key})
    }
  }

  search(tab, text, checkOpposite, forceNewTab){
    const splitText = text.match(/^(.+?)([\t ]+)(.+)$/)
    let engine = ipc.sendSync('get-sync-main-state','searchEngine')
    if(splitText && spAliasMap.has(splitText[1])){
      engine = spAliasMap.get((splitText[1]))
      text = splitText[3]
    }

    let searchMethod = searchProviders[engine]
    if(searchMethod.search){
      searchMethod = {multiple: [searchMethod.name], type: 'basic'}
    }
    const searchs = searchMethod.multiple
    let urls
    if(tab.privateMode == 'persist:tor'){
      urls = searchs.map(engine=> searchProviders[engine].search.replace('www.google.com/search','duckduckgo.com/').replace('tbs=qdr:','df=').replace('%s',text))
    }
    else{
      urls = searchs.map(engine=> searchProviders[engine].search.replace('%s',text))
    }

    if(searchMethod.type == 'basic' || searchMethod.type == 'two'){
      this.searchSameWindow(tab,urls,checkOpposite,searchMethod.type, forceNewTab)
    }
    else{
      ipc.send('browser-load',{id:remote.getCurrentWindow().id,sameSize:true,tabParam:JSON.stringify({urls:urls.map(url=>{return {url}}),type:searchMethod.type})})
    }
  }

  searchSameWindow(tab, urls, checkOpposite, type, forceNewTab){
    let i = 0
    for(let url of urls) {
      global.openerQueue.push(tab.wvId)
      const isFirst = i === 0 || (i === 1 && type == 'two')
      const condBasic = type == 'basic' && checkOpposite && !isFloatPanel(this.props.k) //&& tab.oppositeMode
      const condTwo = type == 'two' && i % 2 == 1
      if (condBasic || condTwo) {
        const oppositeKey = this.props.getOpposite(this.props.k)
        if (!isFirst || (oppositeKey && !isFixedPanel(oppositeKey)))
          PubSub.publish(`new-tab-from-key_${oppositeKey}`, {url, mobile: tab.mobile, adBlockThis: tab.adBlockThis,fields: tab.fields,notSelected: !isFirst,privateMode:tab.privateMode})
        else {
          setTimeout(_=>{
            this.props.split(this.props.k, 'v', 1, (void 0), (void 0), {
              url,
              mobile: tab.mobile,
              adBlockThis: tab.adBlockThis,
              fields: tab.fields,
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
          const t = tabAdd(this, url, isFirst, tab.privateMode, (void 0), tab.mobile, tab.adBlockThis, tab.fields);
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
              cont.hostWebContents2.send('open-panel', {
                url,
                sync: t.sync,
                id: tab.wvId,
                dirc: t.dirc,
                replaceInfo: tab.syncReplace,
                mobile: tab.mobile,
                adBlockThis: tab.adBlockThis,
                fields: tab.fields,
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

    const dom = document.querySelector(`.s${this.props.k}`)
    const isMaximize = dom && dom.style.width == '100vw'

    return (
      <Tabs
        tabsClassNames={tabsClassNames}
        // tabsStyles={tabsStyles}
        selectedTab={this.state.selectedTab}
        onTabSelect={this.handleTabSelect}
        onClose={this.handleCloseRemoveOtherContainer}
        onTabClose={this.handleTabClose}
        // onTabAddOtherContainer={this.handleTabAddOtherContainer}
        onTabAddButtonClick={this.handleTabAddButtonClick}
        onTabPositionChange={this.handleTabPositionChange}
        onTabContextMenu={this.handleContextMenu}
        // handleTabAddOtherPanel={this.handleTabAddOtherPanel}
        multiSelectionClick={this.multiSelectionClick}
        onKeyDown={this.handleKeyDown}
        createNewTabFromOtherWindow={this.createNewTabFromOtherWindow}
        resetSelection={this.resetSelection}
        toggleNav={toggle}
        isTopLeft={this.props.isTopLeft}
        isTopRight={this.props.isTopRight}
        fullscreen={this.props.fullscreen}
        parent={this}
        isOnlyPanel={!this.props.parent.state.root.r}
        windowId={this.props.windowId}
        k={this.props.k}
        refs2={this.refs2}
        key={this.props.k}
        mouseClickHandles={key=>this._handleContextMenu(null,key,null,this.state.tabs,false,true)}
        isMaximize={isMaximize}
        tabs={this.state.tabs.map((tab,num)=>{
          const key = tab.key + this.props.k
          const notifications = this.state.notifications.filter(x=>x._key == tab.key)
          return (<Tab key={tab.key} page={tab.page} orgTab={tab}
                       unread={this.state.selectedTab != tab.key && !allSelectedkeys.has(tab.key)}
                       pin={tab.pin} protect={tab.protect} lock={tab.lock} mute={tab.mute} fields={tab.fields}
                       reloadInterval={tab.reloadInterval} privateMode={tab.privateMode} selection={tab.selection}>
            <div style={{height: '100%'}} className={`div-back db${tab.key}`} ref={`div-${tab.key}`} >
              <BrowserNavbar tabkey={tab.key} k={this.props.k} navHandle={tab.navHandlers} parent={this}
                             privateMode={tab.privateMode} page={tab.page} tab={tab} refs2={this.refs2} key={key} adBlockEnable={adBlockEnable}
                             oppositeGlobal={this.state.oppositeGlobal} toggleNav={toggle} adBlockThis={tab.adBlockThis}
                             historyMap={historyMap} currentWebContents={this.props.currentWebContents} isMaximize={isMaximize} maximizePanel={this.maximizePanel}
                             isTopRight={this.props.isTopRight} isTopLeft={this.props.isTopLeft} fixedPanelOpen={this.props.fixedPanelOpen}
                             tabBar={!this.state.tabBar} hidePanel={this.props.hidePanel} autocompleteUrl={autocompleteUrl}
                             fullscreen={this.props.fullscreen} bind={tab.bind} screenShot={this.screenShot} searchWordHighlight={this.searchWordHighlight}/>
              {notifications.length ? notifications.map((data,i)=>{
                if(data.needInput){
                  this.showNotification()
                  return <InputableDialog data={data} key={i} k={this.props.k} delete={this.deleteNotification.bind(this,i)} />
                }
                else if(data.import){
                  this.showNotification()
                  return <ImportDialog data={data} key={i} k={this.props.k} delete={this.deleteNotification.bind(this,i)} />
                }
                else if(data.convert){
                  this.showNotification()
                  return <ConverterDialog data={data} key={i} k={this.props.k} delete={this.deleteNotification.bind(this,i)} />
                }
                else{
                  this.showNotification()
                  return <Notification data={data} key={i} k={this.props.k} delete={this.deleteNotification.bind(this,i)} />
                }
              }) : null}
              <BookmarkBar key={key} webViewCreate={this.webViewCreate} tab={tab} refs2={this.refs2} topURL={topURL} navigateTo={this.navigateTo} toggleNav={toggle} k={this.props.k} currentWebContents={this.props.currentWebContents}/>
              {/*<BrowserPageStatus tab={tab} k={this.props.k}/>*/}
              {this.state.inputPopup && this.state.inputPopup.key == tab.key ? <InputPopup {...this.state.inputPopup} tab={tab} focus_webview={this.focus_webview}/>: null}
            </div>
          </Tab>)
        })}
      />
    )
  }
};
