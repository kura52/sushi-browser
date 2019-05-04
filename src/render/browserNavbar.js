const React = require('react')
const ReactDOM = require('react-dom');
const {Component} = React
import { Dropdown,Modal,Divider } from 'semantic-ui-react';
import localForage from "../LocalForage";
import path from 'path'
const PubSub = require('./pubsub')
const {remote} = require('electron')
const {Menu, webContents} = remote
// const {searchHistory} = require('./databaseRender')
const ipc = require('electron').ipcRenderer
import MenuOperation from './MenuOperation'
const favorite = require('electron').remote.require('./remoted-chrome/favorite')
const browserActionMap = require('./browserActionDatas')
const BrowserActionMenu = require('./BrowserActionMenu')
const VpnList = require('./VpnList')

const BrowserNavbarLocation = require('./BrowserNavbarLocation')
const SyncReplace = require('./SyncReplace')
import RightTopBottonSet from './RightTopBottonSet'
const NavbarMenu = require('./NavbarMenu')
const {NavbarMenuItem,NavbarMenuBarItem,NavbarMenuSubMenu} = require('./NavbarMenuItem')
const FloatSyncScrollButton = require('./FloatSyncScrollButton')
const mainState = require('./mainStateRemote')
const moment = require('moment')
const Clipboard = require('clipboard')
const FavoriteExplorer = require('../toolPages/favoriteBase')
const HistoryExplorer = require('../toolPages/historyBase')
const TabHistoryExplorer = require('../toolPages/tabHistoryBase')
const TabTrashExplorer = require('../toolPages/tabTrashHistoryBase')
const SavedStateExplorer = require('../toolPages/savedStateBase')
const {messages,locale} = require('./localAndMessage')
const urlParse = require('../../brave/urlParse')
const sharedState = require('./sharedState')
const getTheme = require('./theme')
import ResizeObserver from 'resize-observer-polyfill'
import uuid from 'node-uuid'
import menuSortContextMenu from './menuSortContextMenu'
const isDarwin = navigator.userAgent.includes('Mac OS X')
const isWin = navigator.userAgent.includes('Windows')


new Clipboard('.clipboard-btn')

const DEFAULT_USERAGENT = navigator.userAgent

const NEXUS_USERAGENT = 'Mozilla/5.0 (Linux; Android 7.1.2; Nexus 6P Build/NJH47D; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/65.0.3325.109 Mobile Safari/537.36'
const GALAXY_S9_USERAGENT = 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G965F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.109 Mobile Safari/537.36'
const IPHONE_USERAGENT = 'Mozilla/5.0 (iPod touch; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1'

const IE6_USERAGENT = 'Mozilla/4.0 (compatible; MSIE 6.0; Windows XP)'
const IE9_USERAGENT = 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)'
const IE11_USERAGENT = 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko'
const EDGE_USERAGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134'
const FIREFOX_USERAGENT = `Mozilla/5.0 (${isWin ? 'Windows NT 10.0; Win64; x64' : isDarwin ? 'Macintosh; Intel Mac OS X 10.13' : 'X11; Linux x86_64'}; rv:61.0) Gecko/20100101 Firefox/61.0`
const OPERA_USERAGENT = `Mozilla/5.0 (${isWin ? 'Windows NT 10.0; Win64; x64' : isDarwin ? 'Macintosh; Intel Mac OS X 10_13_2' : 'X11; Linux x86_64'}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.170 Safari/537.36 OPR/53.0.2907.68`
const SAFARI_USERAGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/604.1.28 (KHTML, like Gecko) Version/11.0 Safari/604.1.28'

const WINDOWS_USERAGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
const MAC_USERAGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
const LINUX_USERAGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'


let lastExecTime = new Date().getTime()
const interval = 500

function isFixedPanel(key){
  const sp = key.split('-')
  return sp[0] == 'fixed' && sp[1]
}

function isFloatPanel(key){
  return key.startsWith('fixed-float')
}

function equalArray(a,b){
  const len = a.length
  if(len != b.length) return false
  for(let i=0;i<len;i++){
    if(a[i] !== b[i]) return false
  }
  return true
}

function equalArray2(a,b){
  const len = a.length
  if(len != b.length) return false
  for(let i=0;i<len;i++){
    if(a[i][0] !== b[i][0]) return false
  }
  return true
}

function showConvertDialog(url,fname,tabId,callback){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('show-dialog-exploler',key,{convert: true, initValue:[url, fname]},tabId)
    ipc.once(`show-dialog-exploler-reply_${key}`,(event,ret)=>{
      callback(ret)
    })
  })
}

const tabs = new Set()

function BrowserNavbarBtn(props){
  return <a href="javascript:void(0)" onContextMenu={props.onContextMenu} style={props.style} className={`${props.className||''} draggable-source ${props.disabled?'disabled':''} ${props.sync ? 'sync' : ''}`} title={props.title} onClick={props.onClick}><i style={props.styleFont} className={`fa fa-${props.icon}`}/>{props.children}</a>
}

let [alwaysOnTop,multistageTabs,verticalTab,{left,right,backSide},orderOfAutoComplete,numOfSuggestion,numOfHistory,displayFullIcon,addressBarNewTab,historyBadget,versions,bookmarkBar,bookmarkBarTopPage,extensionOnToolbar,statusBar,mobilePanelSyncScroll] =
  ipc.sendSync('get-sync-main-states',['alwaysOnTop','multistageTabs','verticalTab','navbarItems','orderOfAutoComplete','numOfSuggestion','numOfHistory','displayFullIcon','addressBarNewTab','historyBadget','versions','bookmarkBar','bookmarkBarTopPage','extensionOnToolbar','statusBar','mobilePanelSyncScroll'])
numOfSuggestion = parseInt(numOfSuggestion), numOfHistory = parseInt(numOfHistory)
sharedState.bookmarkBar = bookmarkBar
sharedState.bookmarkBarTopPage = bookmarkBarTopPage
sharedState.statusBar = statusBar
sharedState.mobilePanelSyncScroll = mobilePanelSyncScroll


class BrowserNavbar extends Component{
  constructor(props) {
    super(props)
    this.state = {userAgent: DEFAULT_USERAGENT,
      pdfMode:'normal',currentIndex:0,historyList:[],left,right,backSide}
    this.canRefresh = this.props.page.canRefresh
    this.location = this.props.page.location
    this.richContents = this.props.richContents
    this.sync = this.props.tab.sync
  }

  initEvents(){
    console.log(`zoom_${this.props.tabkey}`)
    this.tokenZoom = PubSub.subscribe(`zoom_${this.props.tabkey}`,(msg,percent)=>{
      this.setState({zoom:percent})
      if(this.props.tab.sync) this.props.parent.syncZoom(percent,this.props.tab.sync)
    })
    this.tokenReplaceInfo = PubSub.subscribe(`update-replace-info_${this.props.tabkey}`,(msg,replaceInfo)=>{
      this.refs.syncReplace.setVals(replaceInfo)
    })
    // this.tokenPdfMode = PubSub.subscribe('set-pdfmode-enable',(msg,mode)=>this.setState({pdfMode:mode}))

    this.tokenBindWindow = PubSub.subscribe(`bind-window_${this.props.tab.key}`,::this._bindWindow)

    this.tokenForceUpdate = PubSub.subscribe('force-update-navbar',_=>{
      this.forceUpdates = true
      this.setState({})
    })

    this.tokenMenuSort = PubSub.subscribe('sort-menu',(msg,navbarItems)=>{
      this.setState({left:navbarItems.left,right:navbarItems.right,backSide:navbarItems.backSide})
      left = navbarItems.left
      right = navbarItems.right
      backSide = navbarItems.backSide
    })

    this.tokenMultistageTabs = PubSub.subscribe('change-multistage-tabs',(msg,val)=>{
      multistageTabs = val
      this.forceUpdates = true
      this.setState({})
    })
    let marginEle = ReactDOM.findDOMNode(this).querySelector(".navbar-margin")
    let rdTabBar = marginEle.parentNode.parentNode.parentNode.parentNode.querySelector(".rdTabBar")
    console.log(marginEle,rdTabBar)

    const self = this

    const ro = new ResizeObserver((entries, observer) => {
      if(this.props.toggleNav != 1){
        if(multistageTabs) return
        rdTabBar.style.left = '0px'
        return
      }
      for (const entry of entries) {
        if(entry.target.parentNode.parentNode.parentNode.style.width == "0px") return
        const {_left, top, width, height} = entry.contentRect;
        const left =  entry.target.offsetLeft
        if (!rdTabBar) {
          marginEle = ReactDOM.findDOMNode(this).querySelector(".navbar-margin")
          rdTabBar = marginEle.parentNode.parentNode.parentNode.parentNode.querySelector(".rdTabBar")
          console.log(marginEle,rdTabBar)
        }
        if(width != 0){
          rdTabBar.style.width = `calc(${width}px ${rdTabBar.getAttribute("bar-margin")||""})`
          rdTabBar.setAttribute("nav-width",`${width}px`)
        }
        // console.log(66,`calc(${width}px ${sp.join(" ")}`)
        if(left != 0 && this.props.toggleNav !== 3) rdTabBar.style.left = `${left}px`
      }
    });
    ro.observe(marginEle)

    if(this.props.tab.mobile){
      setTimeout(_=>{
        this.state.userAgent = this.props.tab.mobile
        this.setState({mobile: this.props.tab.mobile})
        const tabId = this.props.tab.wvId
        if(!tabs.has(tabId)){
          const cont = this.getWebContents(this.props.tab)
          cont.setUserAgent(this.state.userAgent)
          cont.reload()
        }
      },500)
    }
    // if(this.props.tab.adBlockThis === false){
    //   setTimeout(_=>{
    //     const tabId = this.props.tab.wvId
    //     this.setState({adBlockThis: this.props.tab.adBlockThis})
    //     if(!tabs.has(tabId)){
    //       // ipc.send('set-adblock-enable',{tabId:this.props.tab.wvId,global:false})
    //       this.getWebContents(this.props.tab).reload()
    //     }
    //   },500)
    // }
  }

  componentWillMount(){
    console.log('navbar','componentWillMount',this.props.tabkey,this.props.k)
    this.props.refs2[`navbar-${this.props.tabkey}`] = this
  }

  componentDidMount() {
    console.log('navbar','componentDidMount',this.props.tabkey,this.props.k)
    this.updateStates()
    this.initEvents()
  }

  componentWillUnmount() {
    console.log('navbar','componentWillUnmount',this.props.tabkey,this.props.k)
    PubSub.unsubscribe(this.tokenZoom)
    PubSub.unsubscribe(this.tokenReplaceInfo)
    // PubSub.unsubscribe(this.tokenAdblockGlobal)
    // PubSub.unsubscribe(this.tokenPdfMode)
    PubSub.unsubscribe(this.tokenBindWindow)
    PubSub.unsubscribe(this.tokenForceUpdate)
    PubSub.unsubscribe(this.tokenMenuSort)
    PubSub.unsubscribe(this.tokenMultistageTabs)
    tabs.add(this.props.tab.wvId)
    if(this.props.refs2[`navbar-${this.props.tabkey}`] == this){
      delete this.props.refs2[`navbar-${this.props.tabkey}`]
      delete sharedState[`color-${this.props.tabkey}`]
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(this.forceUpdates){
      this.forceUpdates = false
      return true
    }
    // console.log("should")
    // let currentIndex
    // const cont = nextProps.tab.wv && this.getWebContents(nextProps.tab)
    // if (cont) {
    //   if(cont.isDestroyed()){
    //     return false
    //   }
    //   currentIndex = cont.getCurrentEntryIndex();
    // }
    const ret = !(this.canRefresh === nextProps.page.canRefresh &&
      this.location === nextProps.page.location &&
      this.navUrl === nextProps.page.navUrl &&
      this.wv === nextProps.tab.wv &&
      this.wvId === nextProps.tab.wvId &&
      this.props.toggleNav === nextProps.toggleNav &&
      this.props.isMaximize === nextProps.isMaximize &&
      this.props.isTopRight === nextProps.isTopRight &&
      this.props.isTopLeft === nextProps.isTopLeft &&
      this.props.fullscreen === nextProps.fullscreen &&
      this.props.parent.state.selectedTab == this.props.tab.key &&
      (this.richContents||[]).length === (nextProps.tab.page.richContents||[]).length &&
      (this.caches||[]).length === (nextState.caches||[]).length &&
      this.state.currentIndex === nextState.currentIndex &&
      equalArray2(this.state.historyList,nextState.historyList) &&
      equalArray(this.state.left,nextState.left) &&
      equalArray(this.state.right,nextState.right) &&
      equalArray(this.state.backSide,nextState.backSide) &&
      this.state.zoom === nextState.zoom &&
      this.state.vpnList === nextState.vpnList &&
      this.sync === nextProps.tab.sync &&
      this.syncReplace === nextProps.tab.syncReplace &&
      this.oppositeMode === nextProps.tab.oppositeMode &&
      this.currentIndex == nextProps.page.entryIndex &&
      this.props.bind == nextProps.bind &&
      this.state.mobile == nextState.mobile &&
      this.state.bindWindow == nextState.bindWindow &&
      this.props.adBlockEnable == nextProps.adBlockEnable &&
      this.props.adBlockThis == nextProps.adBlockThis &&
      // this.state.pdfMode == nextState.pdfMode &&
      this.props.oppositeGlobal == nextProps.oppositeGlobal &&
      this.props.tabKey == this.tabKey &&
      // this.searchWordHighlight == sharedState.searchWordHighlight &&
      // this.searchWordHighlightRecursive == sharedState.searchWordHighlightRecursive &&
      this.mobilePanelSyncScroll == sharedState.mobilePanelSyncScroll &&
      this.bookmarkBar == sharedState.bookmarkBar &&
      this.hoverBookmarkBar == sharedState.hoverBookmarkBar &&
      this.bookmarkBarTopPage == sharedState.bookmarkBarTopPage &&
      this.statusBar == sharedState.statusBar &&
      this.hoverStatusBar == sharedState.hoverStatusBar &&
      this.tabPreview == sharedState.tabPreview &&
      this.themeBasePath == (sharedState.theme && sharedState.theme.base_path) &&
      this.mobilePanelIsPanel === (nextProps.tab.fields.mobilePanel && nextProps.tab.fields.mobilePanel.isPanel) &&
      this.arrange == this.props.parent.props.parent.state.arrange
    )
    if(ret){
      this.currentWebContents = nextProps.currentWebContents
      this.wv = nextProps.tab.wv
      this.wvId = nextProps.tab.wvId
      this.canRefresh = nextProps.page.canRefresh
      this.location = nextProps.page.location
      this.navUrl = nextProps.page.navUrl
      this.richContents = (nextProps.tab.page.richContents||[]).slice(0)
      this.caches = nextState.caches
      this.currentIndex = nextProps.page.entryIndex
      this.sync = nextProps.tab.sync
      this.syncReplace = nextProps.tab.syncReplace
      this.oppositeMode = nextProps.tab.oppositeMode
      this.tabKey = nextProps.tabKey
      // this.searchWordHighlight = sharedState.searchWordHighlight
      // this.searchWordHighlightRecursive = sharedState.searchWordHighlightRecursive
      this.mobilePanelSyncScroll = sharedState.mobilePanelSyncScroll
      this.bookmarkBar = sharedState.bookmarkBar
      this.hoverBookmarkBar = sharedState.hoverBookmarkBar
      this.bookmarkBarTopPage = sharedState.bookmarkBarTopPage
      this.statusBar = sharedState.statusBar
      this.hoverStatusBar = sharedState.hoverStatusBar
      this.tabPreview = sharedState.tabPreview
      this.themeBasePath = (sharedState.theme && sharedState.theme.base_path)
      this.mobilePanelIsPanel = nextProps.tab.fields.mobilePanel && nextProps.tab.fields.mobilePanel.isPanel
      this.arrange = this.props.parent.props.parent.state.arrange
    }
    return ret
  }

  updateStates(){
    if(!this.props.tab.wvId) return
    ipc.once(`get-cont-history-reply_${this.props.tab.wvId}`,(e,currentIndex,historyList,rSession,adBlockGlobal,pdfMode,navbarItems)=>{
      left = navbarItems.left
      right = navbarItems.right
      backSide = navbarItems.backSide
      if(currentIndex === (void 0)) return
      console.log(9995,this.props.tab.rSession)
      if(rSession){
        console.log(9996,rSession)
        this.props.tab.rSession.urls = rSession.urls
        this.props.tab.rSession.titles = rSession.titles
        this.props.tab.rSession.positions = rSession.positions
        this.props.tab.rSession.currentIndex = currentIndex
      }
      if(this.props.adBlockEnable != adBlockGlobal) PubSub.publish('set-adblock-enable',adBlockGlobal)
      this.setState({currentIndex,historyList,pdfMode,...navbarItems})
    })
    ipc.send('get-cont-history',this.props.tab.wvId,this.props.tab.key,this.props.tab.rSession)
  }

  componentWillUpdate(prevProps, prevState) {
    if(!this.props.tab.wvId) return
    ipc.once(`get-cont-history-reply_${this.props.tab.wvId}`,(e,currentIndex,historyList,rSession,adBlockGlobal,pdfMode,navbarItems)=>{
      if(currentIndex === (void 0)) return
      console.log(rSession,this.props.tab)
      console.log(9997,this.props.tab.rSession)
      if(rSession){
        console.log(9998,this.props.tab.rSession)
        this.props.tab.rSession.urls = rSession.urls
        this.props.tab.rSession.titles = rSession.titles
        this.props.tab.rSession.positions = rSession.positions
        this.props.tab.rSession.currentIndex = currentIndex
      }
      if(!(this.state.currentIndex === currentIndex &&
        equalArray2(this.state.historyList,historyList) &&
        this.state.pdfMode == pdfMode)){
        this.setState({currentIndex,historyList,pdfMode})
      }
      if(this.props.adBlockEnable != adBlockGlobal) PubSub.publish('set-adblock-enable',adBlockGlobal)

    })
    ipc.send('get-cont-history',this.props.tab.wvId,this.props.tab.key,this.props.tab.rSession)
  }

  publishZoom(percent){
    if(sharedState.statusBar || sharedState.hoverStatusBar)
      PubSub.publish(`zoom-change_${this.props.tab.key}`,percent)
  }

  async onZoomCommon(type){
    const webContents = this.getWebContents(this.props.tab)
    if(webContents){
      const zoomBehavior = mainState.zoomBehavior
      if(zoomBehavior == 'chrome'){
        webContents[type]()
      }
      else{
        const factor = await new Promise(r=>webContents.getZoomFactor(r))
        webContents.setZoomFactor(factor + (parseInt(zoomBehavior) * (type == 'zoomOut' ? -1 : 1)/100.0))
      }
      webContents.getZoomFactor(factor=>{
        const percent = factor * 100
        // if(!this.refs['main-menu'].state.visible){
        //   this.state.zoomDisplay = `${percent}%`
        //   clearTimeout(this.zoomTimeout)
        //   this.zoomTimeout = setTimeout(_=>{
        //     this.forceUpdates = true
        //     this.setState({zoomDisplay:''})
        //   },1500)
        // }
        this.publishZoom(percent)
        this.setState({zoom:percent})
        // if(this.props.tab.sync) this.props.parent.syncZoom(percent,this.props.tab.sync)
      })
    }
  }

  onZoomOut(){
    this.onZoomCommon('zoomOut')
  }
  onZoomIn(){
    this.onZoomCommon('zoomIn')
  }
  noZoom(){
    const webContents = this.getWebContents(this.props.tab)
    if(webContents) webContents.setZoomFactor(1)
    // if(!this.refs['main-menu'].state.visible){
    //   this.state.zoomDisplay = '100%'
    //   clearTimeout(this.zoomTimeout)
    //   this.zoomTimeout = setTimeout(_=>{
    //     this.forceUpdates = true
    //     this.setState({zoomDisplay:''})
    //   },1500)
    // }
    this.publishZoom(100)
    this.setState({zoom:100})
    // if(this.props.tab.sync) this.props.parent.syncZoom(100,this.props.tab.sync)
  }

  onCommon(str){
    const cont = this.getWebContents(this.props.tab)
    const url = str == "history" ? "chrome://history2/" : str == "favorite" ? "chrome://bookmarks2/" : `chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/${str}.html`
    cont.hostWebContents2.send('new-tab', this.props.tab.wvId, url)
    // webContents.getAllWebContents().forEach(x=>{console.log(x.id,x.hostWebContents2 && x.hostWebContents2.id)})
  }


  navigate(url){
    const cont = this.getWebContents(this.props.tab)
    cont.hostWebContents2.send('new-tab', this.props.tab.wvId, url)
    // webContents.getAllWebContents().forEach(x=>{console.log(x.id,x.hostWebContents2 && x.hostWebContents2.id)})
  }

  async onAddFavorite(url,title,favicon){
    const key = uuid.v4()
    await favorite.create({url, title})
  }

  onMediaDownload(url,fname,audio,needInput,convert){
    if(fname) ipc.send('set-save-path',url,fname)
    if(audio) ipc.send('set-audio-extract',url)
    if(needInput) ipc.send('need-set-save-filename',url)
    if(convert) ipc.send('set-video-convert',url,convert)
    const cont = this.getWebContents(this.props.tab)
    cont.downloadURL(url)
  }


  round(val, precision) {
    const digit = Math.pow(10, precision)
    return Math.round(val * digit) / digit
  }

  // async getCacheMediaList(){
  //   const ret = await getCaches()
  //   this.setState({caches : ret})
  // }
  //
  // getCacheMediaItems(){
  //   const rich = this.state.caches
  //   if(!rich||!rich.length) return null;
  //   return rich.map((e,i)=>{
  //     return <Dropdown.Item key={i} text={`${e.fname}  Actual:${e.fullSize ? this.getAppropriateByteUnit(parseInt(e.fullSize)).join("") : ""} Cache:${e.size ? this.getAppropriateByteUnit(e.size).join("") : ""} URL:${e.url}`.slice(0,100)}
  //                           icon={e.type == "audio" ? "music" : e.type }
  //                           onClick={()=>{
  //                             const cont = this.getWebContents(this.props.tab)
  //                             cont.hostWebContents2.send('new-tab', this.props.tab.wvId, `file://${path.join(e.path,e.addr)}`)
  //                           }}/>
  //   })
  // }

  getAppropriateByteUnit(byte){
    if(byte / 1024 < 1){
      return [byte,"B"]
    }
    else if(byte / 1024 / 1024 < 1){
      return [this.round(byte /1024,1),"KB"]
    }
    else if(byte / 1024 / 1024 / 1024 < 1){
      return [this.round(byte /1024 / 1024 ,1),"MB"]
    }
    return [this.round(byte /1024 / 1024 / 1024,1), "GB"]
  }

  getWebContents(tab){
    if(!tab.wv || !tab.wvId) return
    return this.props.currentWebContents[tab.wvId]
  }

  handleUserAgent(newUserAgent){
    if(!newUserAgent){
      newUserAgent = this.props.tab.mobile ? DEFAULT_USERAGENT : NEXUS_USERAGENT
    }
    this.state.userAgent = newUserAgent
    const cont = this.getWebContents(this.props.tab)
    cont.setUserAgent(this.state.userAgent)
    this.props.tab.mobile = newUserAgent == DEFAULT_USERAGENT ? void 0 : newUserAgent
    this.setState({mobile: this.props.tab.mobile})
    cont.reload()
  }

  handleAdBlockGlobal(){
    const val = !this.props.adBlockEnable
    mainState.set('adBlockEnable',val)
    PubSub.publish('set-adblock-enable',val)
  }

  // handlePdfMode(){
  //   const val = this.state.pdfMode == 'normal' ? 'comic' : 'normal'
  //   PubSub.publish('set-pdfmode-enable',val)
  //   mainState.set('pdfMode',val)
  // }

  handleOppositeGlobal(){
    const val = !this.props.oppositeGlobal
    PubSub.publish('set-opposite-enable',val)
    mainState.set('oppositeGlobal',val)
    this.setState({})
  }

  handleAdBlockThis(){
    ipc.send('set-adblock-enable',{tabId:this.props.tab.wvId,global:false})
    this.props.tab.adBlockThis = !this.props.adBlockThis
    this.props.parent.setState({})
  }

  handleAdBlockDomain(hostname){
    const cState = global.adBlockDisableSite[hostname]
    if(cState){
      mainState.del('adBlockDisableSite',hostname)
      delete global.adBlockDisableSite[hostname]
    }
    else{
      mainState.add('adBlockDisableSite',hostname,1)
      global.adBlockDisableSite[hostname] = 1
    }
    this.forceUpdates = true
    this.setState({})
  }

  _bindWindow({win,hwnd=false}){
    win = win || remote.getCurrentWindow()
    const tab = this.props.tab
    for(let ele of document.querySelectorAll('.browser-page-wrapper.visible')){
      const r =  ele.getBoundingClientRect()
      const wv = ele.querySelector(`.w${this.props.k}`)
      const elem = ele
      if(wv && tab.key === wv.dataset.key){
        setTimeout(_=>{
          ipc.send('set-pos-window',{key:tab.key,id:tab.bind && tab.bind.id,tabId:tab.wvId
            ,x:window.screenX + r.left,y:window.screenY + r.top,width:r.width,height:r.height,top:'above'})
          ipc.once(`set-pos-window-reply_${tab.key}`,(e,ret)=>{
            if(!ret) return
            const [id,name] = ret
            this.props.parent.navigateTo(tab.page, `chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/bind.html?url=${encodeURIComponent(name)}`, tab)
            const ro = new ResizeObserver((entries, observer) => {
              for (const entry of entries) {
                const r = elem.getBoundingClientRect()
                ipc.send('set-pos-window',{key:tab.key,tabId:tab.wvId,id:id,x:window.screenX + r.left,y:window.screenY + r.top,width:r.width,height:r.height})
              }
            });
            const key = uuid.v4()
            const interval = setInterval(_=>{
              console.log('interval')
              ipc.send('set-pos-window',{key,id,tabId:tab.wvId,checkClose:true})
              ipc.once(`set-pos-window-reply_${key}`,(e,data)=>{
                const needClose = data.needClose
                if(needClose){
                  PubSub.publish(`close_tab_${this.props.k}`,{key:tab.key})
                }
              })
            },1000)
            const token = PubSub.subscribe(`move-window_${this.props.k}`,_=>tab.bind.move())
            ro.observe(wv)
            tab.bind ={
              id, win, hwnd, token, interval, observe: [ro,wv],
              move: e=>{
                setTimeout(_=>{
                  console.log('move')
                  const r = elem.getBoundingClientRect()
                  ipc.send('set-pos-window',{id,tabId:tab.wvId,x:window.screenX + r.left,y:window.screenY + r.top,width:r.width,height:r.height})
                },0)
              },
              blur: e=>{
                console.log('blur')
                // ipc.send('set-pos-window',{id,top:'not-above',hwnd:tab.bind.hwnd,tabId:tab.wvId,active:tab.key == this.props.parent.state.selectedTab})
              },
              focus:e=>{
                console.log('focus')
                if(tab.key == this.props.parent.state.selectedTab){
                  ipc.send('set-pos-window',{id,tabId:tab.wvId,top:'above'})
                }
              },
            }
            win.on('move',tab.bind.move)
            win.on('blur',tab.bind.blur)
            win.on('focus',tab.bind.focus)

          })
        },100)
        break
      }
    }
  }

  bindWindow(){
    const win = remote.getCurrentWindow()
    if(isWin){
      const key = uuid.v4()
      ipc.send('get-win-hwnd',key)
      ipc.once(`get-win-hwnd-reply_${key}`,(e,hwnd)=>{
        win.once('blur',_=>{
          this.setState({bindWindow:false})
          this._bindWindow({win,hwnd})
        })
        this.setState({bindWindow:true})
      })
    }
    else{
      win.once('blur',_=>{
        this.setState({bindWindow:false})
        this._bindWindow({win})
      })
      this.setState({bindWindow:true})
    }
  }

  browserAction(cont,tab,selected){
    const ret = {}
    const dis = ['jdbefljfgobbmcidnmpjamcbhnbphjnb']
    for(let [id,values] of browserActionMap) {
      if(dis.includes(values.orgId) || dis.includes(id) || !values.enabled) continue
      ret[id] = <BrowserActionMenu key={id} k={this.props.k}  id={id} values={values} tab={tab} cont={cont} parent={this} selected={selected}/>
    }
    return ret
  }

  // loadTabSetting(){
  //   sharedState.notLoadTabUntilSelected = !sharedState.notLoadTabUntilSelected
  //   mainState.set('notLoadTabUntilSelected',sharedState.notLoadTabUntilSelected)
  //   sharedState.enableColorOfNoSelect = sharedState.notLoadTabUntilSelected
  //   mainState.set('enableColorOfNoSelect',sharedState.notLoadTabUntilSelected)
  //   this.forceUpdates = true
  //   this.props.parent.setState({})
  // }

  askDownload(){
    sharedState.askDownload = !sharedState.askDownload
    mainState.set('askDownload',sharedState.askDownload)
    this.forceUpdates = true
    this.props.parent.setState({})
  }

  mainMenu(cont,tab,menuActions){
    const hostname = this.props.page.navUrl ? urlParse(this.props.page.navUrl).hostname : ""
    return <NavbarMenu ref="main-menu" className="main-menu" alwaysView={true} k={this.props.k} isFloat={isFloatPanel(this.props.k) || this.props.isMaximize} style={{overflowX: 'visible'}}
                       title={locale.translation('settings')} icon="bars" tab={tab.bind && tab}
                       onClick={_=>{
                         this.getWebContents(this.props.tab).getZoomFactor(factor=>{
                           PubSub.publishSync(`zoom_${this.props.tabkey}`,factor * 100)
                           if(tab.bind){
                             // ipc.send('set-pos-window',{id:tab.bind.id,hwnd:tab.bind.hwnd,tabId:tab.wvId,top:'not-above'})
                           }
                         })
                       }
                       }>
      <NavbarMenuBarItem>
        {menuActions}
      </NavbarMenuBarItem>
      <NavbarMenuItem text={locale.translation("newWindow")} icon='clone' onClick={()=>ipc.send('browser-load',{id:remote.getCurrentWindow().id,sameSize:true})}/>
      <div className="divider" />
      {this.props.toggleNav == 0 ? <NavbarMenuItem text={`[${multistageTabs  ? '✓' : ' '}] ${locale.translation("multiRowTabs")}`} icon='table'
                                                   onClick={()=>{
                                                     sharedState.multistageTabs = !multistageTabs
                                                     ipc.send('save-state',{tableName:'state',key:'multistageTabs',val:!multistageTabs})
                                                     PubSub.publish('change-multistage-tabs',!multistageTabs)
                                                     PubSub.publish("resizeWindow",{})
                                                   }}/> : null
      }
      <NavbarMenuItem text={`[${sharedState.tabPreview ? '✓' : ' '}] ${locale.translation("tabPreview")}`} icon='picture'
                      onClick={()=>{
                        sharedState.tabPreview = !sharedState.tabPreview
                        mainState.set('tabPreview',sharedState.tabPreview)
                        PubSub.publish('token-preview-change',sharedState.tabPreview)
                      }}/>
      <div className="divider" />

      <NavbarMenuItem text={`[${alwaysOnTop ? '✓' : ' '}] ${locale.translation('alwaysOnTop')}`} icon='level up' onClick={()=>{
        alwaysOnTop = !alwaysOnTop
        ipc.send('set-alwaysOnTop', alwaysOnTop)
        this.forceUpdates = true
        this.setState({})
      }}/>
      {isDarwin ? null :<NavbarMenuItem text={`${locale.translation("bindSelectedWindow")}`} icon='crosshairs' onClick={_=>this.bindWindow()}/>}
      {/*<NavbarMenuItem text={`[${sharedState.searchWordHighlight ? '✓' : ' '}] ${locale.translation("searchHighlight")}`} icon='asterisk' onClick={_=>{*/}
        {/*sharedState.searchWordHighlight = !sharedState.searchWordHighlight*/}
        {/*mainState.set('searchWordHighlight',sharedState.searchWordHighlight)*/}
        {/*this.props.searchWordHighlight(this.props.tab)*/}
        {/*this.refs['main-menu'].menuClose()*/}
        {/*this.setState({})*/}
      {/*}}/>*/}
      {isDarwin ? null : <NavbarMenuItem text={`[${this.props.tab.fields && this.props.tab.fields.mobilePanel ? '✓' : ' '}] Show Mobile Panel`} icon='mobile'
                      onClick={()=>{
                        // if(!this.props.tab.fields) this.props.tab.fields = {}
                        if(this.props.tab.fields.mobilePanel){
                          delete this.props.tab.fields.mobilePanel
                        }
                        else{
                          this.props.tab.fields.mobilePanel = {width: mainState.mobilePanelWidth, isPanel: !mainState.mobilePanelDetach}
                        }
                        this.props.parent.setState({})
                        PubSub.publish('web-view-create')
                      }}/>}
      <div className="divider" />


      <NavbarMenuItem icon='zoom out' className='zoom-out' onClick={::this.onZoomOut} keepVisible={true} />
      <NavbarMenuItem icon='zoom in' className='zoom-in' onClick={::this.onZoomIn} keepVisible={true} />
      <NavbarMenuItem text={`${parseInt(this.state.zoom)}%`} className='zoom-setting' onClick={::this.noZoom} keepVisible={true} />
      <div className="divider" />

      <NavbarMenuItem text={`[${this.props.adBlockEnable ? '✓' : ' '}] ${locale.translation("adBlockALL")}`} icon='hand paper' onClick={::this.handleAdBlockGlobal}/>
      {this.props.adBlockEnable ? <NavbarMenuItem text={`[${this.props.adBlockThis ? '✓' : ' '}] ${locale.translation("adBlockTab")}`} icon='hand paper' onClick={::this.handleAdBlockThis}/> : null}
      {this.props.adBlockEnable ? <NavbarMenuItem text={`[${global.adBlockDisableSite[hostname] ? ' ' : '✓'}] ${locale.translation("adBlockDomain")}`} icon='hand paper' onClick={_=>this.handleAdBlockDomain(hostname)}/> : null}
      <div className="divider" />

      <NavbarMenuSubMenu icon="browser" text="Window SubMenu">
        <NavbarMenuItem text={`[${sharedState.bookmarkBar ? '✓' : ' '}] ${locale.translation('2845382757467349449')}`} icon='bookmark' onClick={_=>{
          sharedState.bookmarkBar = !sharedState.bookmarkBar
          mainState.set('bookmarkBar',sharedState.bookmarkBar)
          sharedState.hoverBookmarkBar = false
          mainState.set('hoverBookmarkBar',false)
          this.refs['main-menu'].menuClose()
          this.props.parent.setState({})
        }}/>
        <NavbarMenuItem text={`[${sharedState.bookmarkBarTopPage ? '✓' : ' '}] ${locale.translation("showBookmarkBarOnTopPage")}`} icon='bookmark' onClick={_=>{
          sharedState.bookmarkBarTopPage = !sharedState.bookmarkBarTopPage
          mainState.set('bookmarkBarTopPage',sharedState.bookmarkBarTopPage)
          this.refs['main-menu'].menuClose()
          this.props.parent.setState({})
        }}/>
        <NavbarMenuItem text={`[${sharedState.hoverBookmarkBar ? '✓' : ' '}] ${locale.translation("showBookmarkBarOnMouseHover")}`} icon='bookmark' onClick={_=>{
          sharedState.bookmarkBar = false
          mainState.set('bookmarkBar',false)
          sharedState.hoverBookmarkBar = !sharedState.hoverBookmarkBar
          mainState.set('hoverBookmarkBar',sharedState.hoverBookmarkBar)
          this.refs['main-menu'].menuClose()
          // PubSub.publish('hover-bookmark-or-status-bar')
          this.props.parent.setState({})
        }}/>
        <div className="divider" />
        <NavbarMenuItem text={`[${sharedState.statusBar ? '✓' : ' '}] Always Show Status Bar`} onClick={_=>{
          sharedState.statusBar = !sharedState.statusBar
          mainState.set('statusBar',sharedState.statusBar)
          sharedState.hoverStatusBar = false
          mainState.set('hoverStatusBar',false)
          this.refs['main-menu'].menuClose()
          this.props.parent.setState({})
        }}/>
        <NavbarMenuItem text={`[${sharedState.hoverStatusBar ? '✓' : ' '}] Show Status Bar on mouse hover`} onClick={_=>{
          sharedState.statusBar = false
          mainState.set('statusBar',false)
          sharedState.hoverStatusBar = !sharedState.hoverStatusBar
          mainState.set('hoverStatusBar',sharedState.hoverStatusBar)
          this.refs['main-menu'].menuClose()
          // PubSub.publish('hover-bookmark-or-status-bar')
          this.props.parent.setState({})
        }}/>
        <div className="divider" />
        <NavbarMenuItem text={`[${this.props.toggleNav == 0 ? ' ' : '✓'}] ${locale.translation("oneLineMenuALL")}`} icon='ellipsis horizontal'
                        onClick={()=>{
                          ipc.emit('toggle-nav',null,this.props.toggleNav == 0 ? 1 : 0)
                          setTimeout(_=>this.props.parent.setState({}),0)
                        }}/>
        <NavbarMenuItem text={`[${this.props.toggleNav == 0 ? ' ' : '✓'}] ${locale.translation("oneLineMenu")}`} icon='ellipsis horizontal' onClick={()=>{this.props.parent.toggleNavPanel(this.props.toggleNav == 0 ? 1 : 0);this.setState({})}}/>
        <div className="divider" />
        <NavbarMenuItem text={`${locale.translation("detachThisPanel")}`} icon='space shuttle' onClick={_=>{this.props.parent.detachPanel();this.refs['main-menu'].menuClose()}}/>
        <NavbarMenuItem text={`${locale.translation("convertPanelsToWindows")}`} icon='cubes' onClick={_=>{PubSub.publish('all-detach');this.refs['main-menu'].menuClose()}}/>
        {/*{isDarwin ? null :<NavbarMenuItem text={this.props.toggleNav == 3 ? locale.translation('normalScreenMode') : locale.translation('fullScreenMode')} icon={this.props.toggleNav == 3 ? 'compress' : 'expand'}*/}
                                          {/*onClick={()=>{ipc.send('toggle-fullscreen');this.refs['main-menu'].menuClose()}}/>}*/}
      </NavbarMenuSubMenu>
      <NavbarMenuSubMenu icon="hashtag" text={locale.translation('7853747251428735')}>
        {isWin  ? <NavbarMenuItem text={`${locale.translation("changeVPNMode")}`} icon='plug' onClick={_=>{
          this.refs['main-menu'].menuClose()
          this.setState({vpnList:!this.state.vpnList})
        }
        }/> : null}
        <NavbarMenuItem text={`[${this.props.oppositeGlobal ? '✓' : ' '}] ${locale.translation("openOnOpposite")}`} icon='columns' onClick={_=>{this.handleOppositeGlobal();this.refs['main-menu'].menuClose()}}/>
        {/*<NavbarMenuItem text={`[${sharedState.searchWordHighlightRecursive ? '✓' : ' '}] ${locale.translation("searchHighlightRecursive")}`} icon='asterisk' onClick={_=>{*/}
          {/*sharedState.searchWordHighlightRecursive = !sharedState.searchWordHighlightRecursive*/}
          {/*mainState.set('searchWordHighlightRecursive',sharedState.searchWordHighlightRecursive)*/}
          {/*this.refs['main-menu'].menuClose()*/}
          {/*this.setState({})*/}
        {/*}}/>*/}

        {/*<NavbarMenuItem text={`[${sharedState.notLoadTabUntilSelected ? '✓' : ' '}] ${locale.translation("donTLoadTabsUntillSelected")}`} onClick={_=>{this.loadTabSetting();this.refs['main-menu'].menuClose()}}/>*/}
        <NavbarMenuItem text={`[${sharedState.askDownload ? '✓' : ' '}] ${locale.translation('7754704193130578113')}`} onClick={_=>{this.askDownload();this.refs['main-menu'].menuClose()}}/>
        <div className="divider" />
        <NavbarMenuItem text={locale.translation("extractAudioFromVideo")} icon='music' onClick={_=>{ipc.send('audio-extract');this.refs['main-menu'].menuClose()}}/>
        {/*<NavbarMenuItem text={this.state.pdfMode == 'normal' ? locale.translation("changePdfViewToComic") : locale.translation("changePdfViewToNormal")} icon='file pdf outline' onClick={_=>{this.handlePdfMode();this.refs['main-menu'].menuClose()}}/>*/}
      </NavbarMenuSubMenu>
      <div className="divider" />


      <NavbarMenuItem text={locale.translation("print").replace('…','')} icon='print' onClick={()=>this.getWebContents(this.props.tab).print()}/>
      {/*<NavbarMenuItem text={locale.translation("print").replace('…','')} icon='print' onClick={()=>ipc.send('reload-extension')}/>*/}
      <NavbarMenuItem text={locale.translation("search")} icon='search' onClick={()=>ipc.emit('menu-or-key-events',null,'findOnPage',this.props.tab.wvId)}/>
      <NavbarMenuItem text={locale.translation("settings").replace('…','')} icon='settings' onClick={()=>this.onCommon("settings")}/>
      <NavbarMenuItem text={locale.translation("toggleDeveloperTools")} icon='bug' onClick={()=>ipc.emit('menu-or-key-events',null,'toggleDeveloperTools',this.props.tab.wvId)}/>
      <div className="divider" />

      <NavbarMenuItem text={locale.translation("closeThisPanel")} icon='close' onClick={()=>PubSub.publish(`close-panel_${this.props.k}`)}/>
      <NavbarMenuItem text={locale.translation("closeWindow")} icon='remove circle' onClick={MenuOperation.windowClose}/>

      <div className="divider" />
      <NavbarMenuItem text={locale.translation("restartBrowser")} icon='undo rotate60' onClick={()=>ipc.send('quit-browser','restart')}/>
      <NavbarMenuItem text={locale.translation("quitApp").replace('Brave','Browser')} icon='window close outline' onClick={()=>ipc.send('quit-browser')}/>

      <div className="divider" />
      <NavbarMenuSubMenu text="About">
        <NavbarMenuItem text={`${locale.translation("browserVersion")}: ${versions.browser}`} onClick={_=>this.navigate('https://sushib.me/download.html')}/>
        <NavbarMenuItem text={`${locale.translation("chromiumVersion")}: ${versions.chrome}`} onClick={_=>this.navigate('https://github.com/chromium/chromium/releases')}/>
      </NavbarMenuSubMenu>
    </NavbarMenu>
  }

  // favoriteDataHandle(menuItems,ret){
  //   menuItems.splice(0, menuItems.length);
  //   let i = 0
  //   for(let item of ret){
  //     const favicon = (item.favicon != "undefined" && localStorage.getItem(item.favicon)) || "resource/file.svg"
  //     menuItems.push(<NavbarMenuItem key={i++} favicon={favicon} text={item.title} onClick={_=>this.navigate(item.url)} />)
  //     if(i > 100) break
  //   }
  //   return menuItems
  // }

  favoriteMenu(cont,onContextMenu){
    const menuItems = []
    return <NavbarMenu className="sort-favorite" k={this.props.k} isFloat={isFloatPanel(this.props.k) || this.props.isMaximize} ref="favoriteMenu" title={locale.translation('bookmarks')} icon="star" onClick={_=>_} onContextMenu={onContextMenu} timeOut={50}>
      <NavbarMenuItem bold={true} text={locale.translation("navigateToTheBookmarkPage")} onClick={_=>this.onCommon("favorite")} />
      <div className="divider" />
      <NavbarMenuItem bold={true} text={locale.translation("addThisPageToTheBookmarks")} onClick={_=>this.onAddFavorite(this.props.page.location,this.props.page.title,this.props.page.favicon)} />
      <div className="divider" />
      <div role="option" className="item favorite infinite-classic">
        <FavoriteExplorer cont={cont} onClick={_=> this.refs.favoriteMenu.setState({visible:false})}/>
      </div>
    </NavbarMenu>
  }

  fetchHistoryDate(){
    return new Promise((resolve,reject)=> {
      ipc.send('fetch-history', {start: moment().subtract(48, 'hours').valueOf()})
      ipc.once('history-reply', (event, data) => {
        resolve(data)
      })
    })
  }

  historyDataHandle(menuItems,ret){
    menuItems.splice(0, menuItems.length);
    let i = 0
    for(let item of ret){
      if(!item.title) continue
      const favicon = (item.favicon != "undefined" && localStorage.getItem(item.favicon)) || "resource/file.svg"
      menuItems.push(<NavbarMenuItem key={i++} favicon={favicon} text={`[${moment(item.updated_at).format("YYYY/MM/DD HH:mm:ss")}] ${item.title}`} onClick={_=>this.navigate(item.location)} />)
      if(i > 200) break
    }
    return menuItems
  }

  historyMenu(cont,onContextMenu){
    const menuItems = []
    return <NavbarMenu className="sort-history" k={this.props.k} isFloat={isFloatPanel(this.props.k) || this.props.isMaximize} ref="historyMenu" title={locale.translation('history')} icon="history" onClick={_=>_} onContextMenu={onContextMenu} timeOut={50}>
      <NavbarMenuItem bold={true} text={locale.translation("navigateToTheHistoryPage")} onClick={_=>this.onCommon("history")} />
      <div className="divider" />
      <div role="option" className="item favorite infinite-classic">
        <HistoryExplorer cont={cont} onClick={_=> this.refs.historyMenu.setState({visible:false})}/>
      </div>
    </NavbarMenu>
  }

  tabHistoryMenu(cont,onContextMenu){
    const menuItems = []
    return <NavbarMenu className="sort-tabHistory" k={this.props.k} isFloat={isFloatPanel(this.props.k) || this.props.isMaximize} ref="tabHistoryMenu" title={locale.translation("historyOfTabs")} icon="tags" onClick={_=>_} onContextMenu={onContextMenu} timeOut={50}>
      {/*<NavbarMenuItem bold={true} text={locale.translation("navigateToTheHistoryPage")} onClick={_=>this.onCommon("history")} />*/}
      <div className="divider" />
      <div role="option" className="item favorite infinite-classic">
        <TabHistoryExplorer cont={cont} onClick={_=> this.refs.tabHistoryMenu.setState({visible:false})}/>
      </div>
    </NavbarMenu>
  }

  tabTrashMenu(cont,onContextMenu){
    const menuItems = []
    return <NavbarMenu className="sort-tabTrash" k={this.props.k} isFloat={isFloatPanel(this.props.k) || this.props.isMaximize} ref="tabTrashMenu" title={locale.translation("trashOfTabs")} icon="trash" onClick={_=>_} onContextMenu={onContextMenu} timeOut={50}>
      {/*<NavbarMenuItem bold={true} text={locale.translation("navigateToTheHistoryPage")} onClick={_=>this.onCommon("history")} />*/}
      <div className="divider" />
      <div role="option" className="item favorite infinite-classic">
        <TabTrashExplorer cont={cont} onClick={_=> this.refs.tabTrashMenu.setState({visible:false})}/>
      </div>
    </NavbarMenu>
  }


  savedStateMenu(cont,onContextMenu){
    const menuItems = []
    return <NavbarMenu className="sort-savedState" k={this.props.k} isFloat={isFloatPanel(this.props.k) || this.props.isMaximize} ref="savedStateMenu" title={locale.translation("sessionManager")} icon="database" onClick={_=>_} onContextMenu={onContextMenu} timeOut={50}>
      <NavbarMenuItem bold={true} text={locale.translation("saveCurrentSession")} onClick={_=>ipc.send('save-all-windows-state')} />
      <div className="divider" />
      <div role="option" className="item favorite infinite-classic">
        <SavedStateExplorer cont={cont} onClick={_=> this.refs.savedStateMenu && this.refs.savedStateMenu.setState({visible:false})}/>
      </div>
    </NavbarMenu>
  }

  getTitle(x,historyMap){
    console.log(997,historyMap.get(x[0]))
    const datas = historyMap.get(x[0])
    return datas ? <div className="favi-wrap"><img src={datas[1]} className="favi"/>{datas[0]}</div> :  x[1] || x[0]
  }

  mobilePanelButton(){
    return [<BrowserNavbarBtn title={""} icon="link" sync={this.props.tab.fields.mobilePanel.isPanel}
                      onClick={()=>{
                        this.props.tab.fields.mobilePanel.isPanel = !this.props.tab.fields.mobilePanel.isPanel
                        ipc.send('mobile-panel-operation',{type: 'detach', key: this.props.tab.key, tabId: this.props.tab.wvId, detach: !this.props.tab.fields.mobilePanel.isPanel})
                        this.props.parent.setState({})
                      }}/>,
      <BrowserNavbarBtn title={""} icon="exchange" sync={sharedState.mobilePanelSyncScroll}
                        onClick={()=>{
                          sharedState.mobilePanelSyncScroll = !sharedState.mobilePanelSyncScroll
                          mainState.set('mobilePanelSyncScroll',sharedState.mobilePanelSyncScroll)
                          this.props.parent.setState({})
                        }}/>,
      ]
  }

  buildItems(isFixed,isFloat,rich,cont,onContextMenu){
    const backItems = this.state.historyList.slice(0,this.state.currentIndex)
    const nextItems = this.state.historyList.slice(this.state.currentIndex+1)
    const items = {
      back: <NavbarMenu k={this.props.k} onContextMenu={onContextMenu} mouseOver={true} isFloat={isFloatPanel(this.props.k) || this.props.isMaximize} className={`sort-back draggable-source back-next ${backItems.length ? "" : " disabled"}`} title={locale.translation('back')} icon="angle-left fa-lg" onClick={e=>{this.props.navHandle.onClickBack(e);this.forceUpdates=true}} badget={historyBadget && backItems.length ? <div className="browserActionBadge back" >{backItems.length}</div> : null}>
        {(cont ? backItems.reverse().map(
          (x,i)=><NavbarMenuItem key={i} text={this.getTitle(x,this.props.historyMap)} onClick={()=>{this.props.navHandle.onClickIndex(this.state.currentIndex -i -1);this.forceUpdates=true}}/>) : "")}
      </NavbarMenu>,

      forward: <NavbarMenu k={this.props.k} onContextMenu={onContextMenu} mouseOver={true} isFloat={isFloatPanel(this.props.k) || this.props.isMaximize} className={`sort-forward draggable-source back-next ${nextItems.length ? "" : " disabled"}`} title={locale.translation('forward')} icon="angle-right fa-lg" onClick={e=>{this.props.navHandle.onClickForward(e);this.forceUpdates=true}} badget={historyBadget && nextItems.length ? <div className="browserActionBadge next" >{nextItems.length}</div> : null} >
        {(cont ? nextItems.map(
          (x,i)=><NavbarMenuItem key={i} text={this.getTitle(x,this.props.historyMap)} onClick={()=>{this.props.navHandle.onClickIndex(this.state.currentIndex +i +1);this.forceUpdates=true}}/>) : "")}
      </NavbarMenu>,

      reload: <BrowserNavbarBtn className="sort-reload" title={locale.translation('reload')} icon="repeat" onContextMenu={onContextMenu} onClick={this.props.navHandle.onClickRefresh} disabled={!this.props.page.canRefresh} />,

      home: <BrowserNavbarBtn className="sort-home" title={locale.translation('480990236307250886')} icon="home" onContextMenu={onContextMenu} onClick={_=>this.props.navHandle.onEnterLocation(sharedState.homeURL)} />,

      addressBar: <div className="input-group">
        <BrowserNavbarLocation ref="loc" wv={this.props.tab.wv} navbar={this} onEnterLocation={this.props.navHandle.onEnterLocation}
                               onChangeLocation={this.props.navHandle.onChangeLocation} addressBarNewTab={addressBarNewTab} autoCompleteInfos={{url:this.props.autocompleteUrl,orderOfAutoComplete,numOfSuggestion,numOfHistory}}
                               isMaximize={this.props.isMaximize} k={this.props.k} onContextMenu={this.props.navHandle.onLocationContextMenu} tab={this.props.tab} page={this.props.page} privateMode={this.props.privateMode} search={this.props.parent.search}/>
      </div>,

      margin: <div className="navbar-margin" style={{
        width: this.props.toggleNav != 1 ? 0 : this.props.isTopRight ? '45%' : '50%',
        minWidth: this.props.toggleNav != 1 ? 0 :'80px',
        background: !sharedState.theme ? getTheme('colors','frame') : `${getTheme('images','theme_frame')} ${getTheme('images','theme_frame') ? (getTheme('colors','frame') || 'initial') : ''} repeat`
      }}
                   onDoubleClick={isDarwin ? _=>{
                     const win = remote.getCurrentWindow()
                     if(win.isFullScreen()){}
                     else if(win.isMaximized()){
                       // win.unmaximize()
                       win.nativeWindow.showWindow(9)
                     }
                     else{
                       // win.maximize()
                       win.nativeWindow.showWindow(3)
                     }
                   }: null}></div>,

      syncReplace: isFixed ? null : <SyncReplace ref="syncReplace" onContextMenu={onContextMenu} changeSyncMode={this.props.parent.changeSyncMode} replaceInfo={this.props.tab.syncReplace} updateReplaceInfo={this.props.parent.updateReplaceInfo}/>,

      sync: isFixed ? null : <BrowserNavbarBtn className="sort-sync" title={locale.translation("switchSyncScroll")} icon="circle-o" sync={this.props.tab.sync && !this.props.tab.syncReplace}
                                               onContextMenu={onContextMenu} onClick={()=>{this.props.parent.changeSyncMode();this.refs.syncReplace.clearAllCheck()}}/>,

      arrange:  isDarwin ? null : <BrowserNavbarBtn className="sort-arrange" title="Arrange Panels" icon="th" sync={sharedState.arrange == this.props.k}
                                               onContextMenu={onContextMenu} onClick={()=>{this.props.parent.props.parent.arrangePanels(this.props.k)}}/>,

      float:   isFixed || !this.props.tab.sync || this.props.tab.syncReplace || !this.props.isTopLeft ? null : <FloatSyncScrollButton wv={this.props.tab.wv}/>,

      opposite: isFloat ? null: <BrowserNavbarBtn className="sort-opposite" title={locale.translation("switchOpenOnOpposite")} icon="external-link-square" sync={this.props.tab.oppositeMode} onContextMenu={onContextMenu} onClick={()=>{this.props.parent.changeOppositeMode()}}/>,

      sidebar: isFixed ? null : <NavbarMenu className="sort-sidebar" k={this.props.k} mouseOver={true} isFloat={isFloatPanel(this.props.k) || this.props.isMaximize}
                                            title={locale.translation("openSidebar")} icon="list-ul" onContextMenu={onContextMenu} onClick={()=>this.props.fixedPanelOpen({dirc:mainState.sideBarDirection})}>
        <NavbarMenuItem key="Left" text={locale.translation("leftSide")} icon="caret left" onClick={()=>this.props.fixedPanelOpen({dirc:"left"})}/>
        <NavbarMenuItem key="Right" text={locale.translation("rightSide")} icon="caret right" onClick={()=>this.props.fixedPanelOpen({dirc:"right"})}/>
        <NavbarMenuItem key="Bottom" text={locale.translation("bottomSide")} icon="caret down" onClick={()=>this.props.fixedPanelOpen({dirc:"bottom"})}/>
        <div className="divider" />
        <NavbarMenuItem key="verticalLeft" text="Vertical Tabs Left" icon="caret left" onClick={()=>PubSub.publish('set-vertical-tab-state',"left")}/>
        <NavbarMenuItem key="verticalRight" text="Vertical Tabs Right" icon="caret right" onClick={()=>PubSub.publish('set-vertical-tab-state',"right")}/>
      </NavbarMenu>,

      mobile: <NavbarMenu className="sort-mobile" k={this.props.k} mouseOver={true} isFloat={isFloatPanel(this.props.k) || this.props.isMaximize}  sync={this.state.mobile} style={{fontSize: 20, lineHeight: 1.4 }}
                          title={locale.translation("changeToMobileUserAgent")} icon="mobile" onContextMenu={onContextMenu} onClick={()=>this.handleUserAgent(this.state.mobile ? DEFAULT_USERAGENT : NEXUS_USERAGENT)}>
        <NavbarMenuItem key="default" text={`${this.state.userAgent == DEFAULT_USERAGENT ? '✓ ' : ''}Default`} onClick={()=>this.handleUserAgent(DEFAULT_USERAGENT)}/>
        <div className="divider" />
        <NavbarMenuItem key="nexus" text={`${this.state.userAgent == NEXUS_USERAGENT ? '✓ ' : ''}Nexus P6`} onClick={()=>this.handleUserAgent(NEXUS_USERAGENT)}/>
        <NavbarMenuItem key="galaxy" text={`${this.state.userAgent == GALAXY_S9_USERAGENT ? '✓ ' : ''}Galaxy S9`} onClick={()=>this.handleUserAgent(GALAXY_S9_USERAGENT)}/>
        <NavbarMenuItem key="iphone" text={`${this.state.userAgent == IPHONE_USERAGENT ? '✓ ' : ''}iPhone`} onClick={()=>this.handleUserAgent(IPHONE_USERAGENT)}/>
        <div className="divider" />
        <NavbarMenuItem key="ie" text={`${this.state.userAgent == IE6_USERAGENT ? '✓ ' : ''}IE6`} onClick={()=>this.handleUserAgent(IE6_USERAGENT)}/>
        <NavbarMenuItem key="ie" text={`${this.state.userAgent == IE9_USERAGENT ? '✓ ' : ''}IE9`} onClick={()=>this.handleUserAgent(IE9_USERAGENT)}/>
        <NavbarMenuItem key="ie" text={`${this.state.userAgent == IE11_USERAGENT ? '✓ ' : ''}IE11`} onClick={()=>this.handleUserAgent(IE11_USERAGENT)}/>
        <div className="divider" />
        <NavbarMenuItem key="edge" text={`${this.state.userAgent == EDGE_USERAGENT ? '✓ ' : ''}Edge`} onClick={()=>this.handleUserAgent(EDGE_USERAGENT)}/>
        <NavbarMenuItem key="firefox" text={`${this.state.userAgent == FIREFOX_USERAGENT ? '✓ ' : ''}Firefox 61`} onClick={()=>this.handleUserAgent(FIREFOX_USERAGENT)}/>
        <NavbarMenuItem key="opera" text={`${this.state.userAgent == OPERA_USERAGENT ? '✓ ' : ''}Opera`} onClick={()=>this.handleUserAgent(OPERA_USERAGENT)}/>
        <NavbarMenuItem key="safari" text={`${this.state.userAgent == SAFARI_USERAGENT ? '✓ ' : ''}Safari (Mac)`} onClick={()=>this.handleUserAgent(SAFARI_USERAGENT)}/>
        <div className="divider" />
        <NavbarMenuItem key="win" text={`${this.state.userAgent == WINDOWS_USERAGENT ? '✓ ' : ''}Chrome 67 (Win)`} onClick={()=>this.handleUserAgent(WINDOWS_USERAGENT)}/>
        <NavbarMenuItem key="mac" text={`${this.state.userAgent == MAC_USERAGENT ? '✓ ' : ''}Chrome 67 (Mac)`} onClick={()=>this.handleUserAgent(MAC_USERAGENT)}/>
        <NavbarMenuItem key="linux" text={`${this.state.userAgent == LINUX_USERAGENT ? '✓ ' : ''}Chrome 67 (Linux)`} onClick={()=>this.handleUserAgent(LINUX_USERAGENT)}/>
      </NavbarMenu>,

      favorite: isFixed && !isFloat ? null : this.favoriteMenu(cont,onContextMenu),
      history: isFixed && !isFloat ? null : this.historyMenu(cont,onContextMenu),
      tabHistory: isFixed && !isFloat ? null : this.tabHistoryMenu(cont,onContextMenu),
      tabTrash: isFixed && !isFloat ? null : this.tabTrashMenu(cont,onContextMenu),
      savedState: isFixed && !isFloat ? null : this.savedStateMenu(cont,onContextMenu),

      download: <BrowserNavbarBtn className="sort-download" title={locale.translation("downloads")} icon="download" onClick={this.onCommon.bind(this,"download")}/>,
      folder: <BrowserNavbarBtn className="sort-folder" title={locale.translation("fileExplorer")} icon="folder" onClick={this.onCommon.bind(this,"explorer")}/>,
      terminal: <BrowserNavbarBtn className="sort-terminal" title={locale.translation('4589268276914962177')} icon="terminal" onClick={this.onCommon.bind(this,"terminal")}/>,
      video: <Dropdown scrolling className="sort-video draggable-source nav-button" onContextMenu={onContextMenu} style={{minWidth:0}}
                       trigger={<BrowserNavbarBtn title={locale.translation("richMediaList")} icon="film">{rich && rich.length ? <div className="browserActionBadge video" >{rich.length}</div> : null}</BrowserNavbarBtn>}
                       pointing='top right' icon={null} disabled={!rich || !rich.length}>
        <Dropdown.Menu className="nav-menu">
          <div role="option" className="item" onClick={_=>this.props.tab.events['pin-video'](null,this.props.tab.wvId,true)}>{locale.translation('playVideoInPopupWindow')}</div>
          <Divider/>
          {/*<div role="option" className="item" onClick={_=>this.props.tab.events['pin-video'](null,this.props.tab.wvId)}>{locale.translation('playVideoInFloatingPanel')}</div>*/}
          {/*<Divider/>*/}
          <div className="org-menu">
            {(rich||[]).map((e,i)=>{
              let url = e.url
              const m3u8 = e.fname.endsWith('.m3u8')
              return <div role="option" className="item" key={i} value={i} icon={e.type == "audio" ? "music" : e.type }
                          onClick={()=>{
                            if(m3u8){
                              ipc.send('download-m3u8',url,e.fname,this.props.tab.wvId,navigator.userAgent,cont.getURL())
                            }
                            else{
                              this.onMediaDownload(url,e.fname)
                            }
                          }}>
                {`${e.fname}  ${e.size ? this.getAppropriateByteUnit(e.size).join("") : ""}`}
                {m3u8 ? null : <button className="play-btn" title={locale.translation("playVideo")} onClick={e=>{
                  e.stopPropagation()
                  const p = e.target.parentNode.parentNode;(e.target.tagName == "I" ? p.parentNode : p).classList.remove("visible")
                  cont.hostWebContents2.send('new-tab', this.props.tab.wvId, url)
                }}>
                  <i className="fa fa-play" aria-hidden="true"></i>
                </button>}

                {m3u8 ? null : <button className="play-btn" title={locale.translation("downloadAndPlayVideo")} onClick={e=>{
                  e.stopPropagation()
                  const p = e.target.parentNode.parentNode;(e.target.tagName == "I" ? p.parentNode : p).classList.remove("visible")
                  ipc.send('save-and-play-video', url)
                }}>
                  <i className="fa fa-play-circle" aria-hidden="true"></i>
                </button>}

                <button className="play-btn" title={locale.translation("playInExternalVideoPlayer")} onClick={e=>{
                  e.stopPropagation()
                  const p = e.target.parentNode.parentNode;(e.target.tagName == "I" ? p.parentNode : p).classList.remove("visible")
                  ipc.send('play-external',url)
                }}>
                  <i className="fa fa-play-circle-o" aria-hidden="true"></i>
                </button>

                <button className="play-btn" title={locale.translation("downloadVideo")} onClick={e2=>{
                  e2.stopPropagation()
                  const p = e2.target.parentNode.parentNode;(e2.target.tagName == "I" ? p.parentNode : p).classList.remove("visible")
                  if(m3u8){
                    ipc.send('download-m3u8',url,e.fname,this.props.tab.wvId,navigator.userAgent,cont.getURL(),true)
                  }
                  else{
                    this.onMediaDownload(url,false,false,true)
                  }
                }}>
                  <i className="fa fa-download" aria-hidden="true"></i>
                </button>

                {m3u8 ? null : <button className="play-btn" title={locale.translation("downloadAndConvertVideo")} onClick={e2=>{
                  e2.stopPropagation()
                  const parent = e2.target.parentNode.parentNode
                  const node = e2.target.tagName == "I" ? parent.parentNode : parent
                  node.classList.remove("visible")
                  showConvertDialog(url, e.fname, this.props.tab.wvId, this.onMediaDownload.bind(this,url,e.fname,false,false))
                }}>
                  <i className="fa fa-industry" aria-hidden="true"></i>
                </button>}

                {m3u8 ? null : <button className="play-btn" title={locale.translation("downloadVideoAndExtractAudio")} onClick={e2=>{
                  e2.stopPropagation()
                  const p = e2.target.parentNode.parentNode;(e2.target.tagName == "I" ? p.parentNode : p).classList.remove("visible")
                  this.onMediaDownload(url,e.fname,true)
                }}>
                  <i className="fa fa-music" aria-hidden="true"></i>
                </button>}
                <button className="clipboard-btn" title={locale.translation("copyVideoURL")} data-clipboard-text={url}
                        onClick={e=>{e.stopPropagation();const p = e.target.parentNode.parentNode;(e.target.tagName == "IMG" ? p.parentNode : p).classList.remove("visible")}}>
                  <img width="13" src="data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjEwMjQiIHdpZHRoPSI4OTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHBhdGggZD0iTTEyOCA3NjhoMjU2djY0SDEyOHYtNjR6IG0zMjAtMzg0SDEyOHY2NGgzMjB2LTY0eiBtMTI4IDE5MlY0NDhMMzg0IDY0MGwxOTIgMTkyVjcwNGgzMjBWNTc2SDU3NnogbS0yODgtNjRIMTI4djY0aDE2MHYtNjR6TTEyOCA3MDRoMTYwdi02NEgxMjh2NjR6IG01NzYgNjRoNjR2MTI4Yy0xIDE4LTcgMzMtMTkgNDVzLTI3IDE4LTQ1IDE5SDY0Yy0zNSAwLTY0LTI5LTY0LTY0VjE5MmMwLTM1IDI5LTY0IDY0LTY0aDE5MkMyNTYgNTcgMzEzIDAgMzg0IDBzMTI4IDU3IDEyOCAxMjhoMTkyYzM1IDAgNjQgMjkgNjQgNjR2MzIwaC02NFYzMjBINjR2NTc2aDY0MFY3Njh6TTEyOCAyNTZoNTEyYzAtMzUtMjktNjQtNjQtNjRoLTY0Yy0zNSAwLTY0LTI5LTY0LTY0cy0yOS02NC02NC02NC02NCAyOS02NCA2NC0yOSA2NC02NCA2NGgtNjRjLTM1IDAtNjQgMjktNjQgNjR6IiAvPgo8L3N2Zz4K"/>
                </button>
              </div>
            })}
          </div>
        </Dropdown.Menu>
      </Dropdown>,
      screenshot: <NavbarMenu className="sort-screenshot" k={this.props.k} mouseOver={true} isFloat={isFloatPanel(this.props.k) || this.props.isMaximize}
                              title={locale.translation("4250229828105606438")} icon="camera" onContextMenu={onContextMenu} onClick={_=>_}>
        <NavbarMenuItem key="full-clip" text={locale.translation("fullPage|Clipboard")} onClick={()=>this.props.screenShot(true,'clipboard',this.props.tab)}/>
        <NavbarMenuItem key="full-jpeg" text={locale.translation("fullPage|Jpeg")}  onClick={()=>this.props.screenShot(true,'JPEG',this.props.tab)}/>
        <NavbarMenuItem key="full-png" text={locale.translation("fullPage|PNG")}  onClick={()=>this.props.screenShot(true,'PNG',this.props.tab)}/>
        <div className="divider" />
        <NavbarMenuItem key="sel-clip" text={locale.translation("selection|Clipboard")} onClick={()=>this.props.screenShot(false,'clipboard',this.props.tab)}/>
        <NavbarMenuItem key="sel-jpeg" text={locale.translation("selection|Jpeg")}  onClick={()=>this.props.screenShot(false,'JPEG',this.props.tab)}/>
        <NavbarMenuItem key="sel-png" text={locale.translation("selection|PNG")}  onClick={()=>this.props.screenShot(false,'PNG',this.props.tab)}/>
      </NavbarMenu>,
      ...this.browserAction(cont, this.props.tab, this.props.parent.state.selectedTab == this.props.tab.key)
    }
    return items
  }

  render() {
    const isFixed = isFixedPanel(this.props.k)
    const isFloat = isFloatPanel(this.props.k)
    console.log("rend")
    const _rich = (this.props.tab.page.richContents || [])
    const map = new Map()
    for(let r of _rich){
      map.set(r.url,r)
    }
    const rich = [...map.values()]

    // const cacheItems = this.getCacheMediaItems()
    const cont = this.getWebContents(this.props.tab)

    const onContextMenu = menuSortContextMenu.bind(null,this.props.tab.wvId,this)

    const items = this.buildItems(isFixed,isFloat,rich,cont,onContextMenu)
    const usedKey = new Set(['float','addressBar','margin'])
    const navBarMenus = [],backSideMenus = [],rightMenus = []

    for(let name of ['left','right','backSide']){
      const menus = name == 'backSide' ? backSideMenus : name == 'left' ? navBarMenus : rightMenus
      for(let key of this.state[name]) {
        menus.push(items[key])
        usedKey.add(key)
      }
      if(name == 'left'){
        menus.push(items.float)
        menus.push(items.addressBar)
        menus.push(items.margin)
      }
    }
    const rights = []
    for(let [key,item] of Object.entries(items)){
      if(!usedKey.has(key)){
        if(extensionOnToolbar && key != 'igiofjhpmpihnifddepnpngfjhkfenbp' && key != 'jpkfjicglakibpenojifdiepckckakgk' && key != 'occjjkgifpmdgodlplnacmkejpdionan'){
          rights.push(item)
        }
        else{
          backSideMenus.push(item)
        }
      }
    }
    if(rights.length) rightMenus.unshift(...rights)
    navBarMenus.push(...rightMenus)

    let navbarStyle = this.props.toggleNav == 2 ? {visibility: "hidden"} : this.props.toggleNav == 3 ? {zIndex: 2, position: "sticky", top: 27} : {}
    // this.props.toggleNav == 1 ? {width : this.props.isTopRight ? '55%' : '50%',float: 'right'} : {}
    const toolbarTheme = getTheme('images','theme_toolbar')
    if(toolbarTheme) navbarStyle = {...navbarStyle,backgroundImage:toolbarTheme,backgroundColor: toolbarTheme ? 'initial' : void 0, backgroundPositionY: toolbarTheme ? -29 : void 0}

    return <div className={`navbar-main browser-navbar${isFixed && !isFloat ? " fixed-panel" : ""}`}
                ref="navbar" onDragOver={(e)=>{e.preventDefault();return false}}
                onDrop={(e)=>{e.preventDefault();return false}} style={navbarStyle}>
      {/*<BrowserNavbarBtn title="Rewind" icon="home fa-lg" onClick={this.props.onClickHome} disabled={!this.props.page.canGoBack} />*/}

      {isDarwin && this.props.isTopRight && this.props.toggleNav == 1 && !document.querySelector('.vertical-tab.left') ? <div style={{width: this.props.fullscreen ? 0 : 62}}/>  : null }

      {this.props.tab.fields.mobilePanel ? this.mobilePanelButton() : null}
      {navBarMenus}
      {this.mainMenu(cont, this.props.tab, backSideMenus)}
      {this.state.vpnList ? <VpnList onClick={_=>this.setState({vpnList:false})}/> : null}
      {isFixed && !isFloat ? <BrowserNavbarBtn style={{fontSize:18}} title="Hide Sidebar" icon={`angle-double-${isFixed == 'bottom' ? 'down' : isFixed}`} onClick={()=>this.props.fixedPanelOpen({dirc:isFixed})}/> : null}
      {!this.props.isMaximize && !isDarwin && this.props.isTopRight && (this.props.toggleNav == 1 || verticalTab) ? <RightTopBottonSet displayFullIcon={displayFullIcon} style={{lineHeight: 0.9, transform: 'translateX(6px)',paddingTop: 1}}/> : null }

      {this.props.isMaximize && this.props.toggleNav == 1 ? <div className="title-button-set" style={{lineHeight: 0.9, transform: 'translateX(6px)'}}>
        {isDarwin ? null : <span className={`fa fa-th ${sharedState.arrange == 'all' ? 'active-arrange' : ''}`} onClick={_=>PubSub.publish('toggle-arrange')}></span>}

        {/*{displayFullIcon ? <span className={this.props.toggleNav == 3 ? "typcn typcn-arrow-minimise" : "typcn typcn-arrow-maximise"} onClick={_=>ipc.send('toggle-fullscreen')}></span> : null}*/}
        <span className="typcn typcn-media-stop-outline" onClick={()=>this.props.maximizePanel()}></span>
      </div> : null}

      {isFloat  && this.props.toggleNav == 1 ? <div className="title-button-set" style={{lineHeight: 0.9, transform: 'translateX(6px)'}}>
        {isDarwin ? null : <span className={`fa fa-th ${sharedState.arrange == 'all' ? 'active-arrange' : ''}`} onClick={_=>PubSub.publish('toggle-arrange')}></span>}
        <span className="typcn typcn-media-stop-outline" onClick={()=>PubSub.publish(`maximize-float-panel_${this.props.k}`)}></span>
        <span className="typcn typcn-times" onClick={()=>PubSub.publish(`close-panel_${this.props.k}`)}></span>
      </div> : null}
      {/*{this.state.zoomDisplay ?*/}
        {/*<div className="ui dropdown zoom-menu" style={{top: 50, right: 30}}>*/}
          {/*<div className="menu visible transition left nav-menu" style={{overflowX: 'visible', left: 'auto',paddingBottom:3}}>*/}
            {/*<div className="item zoom-out" role="option" onClick={::this.onZoomOut}><i className="zoom out icon" aria-hidden="true"/><span*/}
              {/*className="text"></span></div>*/}
            {/*<div className="item zoom-in" role="option" onClick={::this.onZoomIn}><i className="zoom in icon" aria-hidden="true"/><span*/}
              {/*className="text"></span></div>*/}
            {/*<div className="item zoom-setting" role="option" onClick={::this.noZoom}><span className="text">{this.state.zoomDisplay}</span></div>*/}
          {/*</div>*/}
        {/*</div>: null}*/}

      {this.state.bindWindow ? <Modal basic size='small' open={true}>
        <Modal.Content>
          <p style={{fontSize: 30,textAlign:'center'}}>Please click other window</p>
        </Modal.Content>
      </Modal> : null}
    </div>
  }
}

export default {BrowserNavbar,alwaysOnTop}
