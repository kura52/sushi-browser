const React = require('react')
const ReactDOM = require('react-dom');
const {Component} = React
import { Dropdown,Modal,Divider } from 'semantic-ui-react';
import localForage from "../LocalForage";
import path from 'path'
const PubSub = require('./pubsub')
const {remote} = require('electron')
const BrowserWindowPlus = remote.require('./BrowserWindowPlus')
const {Menu} = remote
// const {searchHistory} = require('./databaseRender')
const ipc = require('electron').ipcRenderer
import MenuOperation from './MenuOperation'
import {favorite} from './databaseRender'
// const getCaches = remote.require('./CacheList');
const {webContents} = remote
const browserActionMap = require('./browserActionDatas')
const BrowserActionMenu = require('./BrowserActionMenu')
const VpnList = require('./VpnList')

const BrowserNavbarLocation = require('./BrowserNavbarLocation')
const SyncReplace = require('./SyncReplace')
import RightTopBottonSet from './RightTopBottonSet'
const NavbarMenu = require('./NavbarMenu')
const {NavbarMenuItem,NavbarMenuBarItem,NavbarMenuSubMenu} = require('./NavbarMenuItem')
const FloatSyncScrollButton = require('./FloatSyncScrollButton')
const mainState = remote.require('./mainState')
const moment = require('moment')
const Clipboard = require('clipboard')
const FavoriteExplorer = require('../toolPages/favoriteBase')
const HistoryExplorer = require('../toolPages/historyBase')
const TabHistoryExplorer = require('../toolPages/tabHistoryBase')
const SavedStateExplorer = require('../toolPages/savedStateBase')
const {messages,locale} = require('./localAndMessage')
const urlParse = require('../../brave/urlParse')
const sharedState = require('./sharedState')
import ResizeObserver from 'resize-observer-polyfill'
import uuid from 'node-uuid'
import menuSortContextMenu from './menuSortContextMenu'
const isDarwin = navigator.userAgent.includes('Mac OS X')
const isWin = navigator.userAgent.includes('Windows')


new Clipboard('.clipboard-btn')

const MOBILE_USERAGENT = 'Mozilla/5.0 (Linux; Android 7.1.2; Nexus 6P Build/NJH47D; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/64.0.3282.137 Mobile Safari/537.36'

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

let [alwaysOnTop,multistageTabs,verticalTab,{left,right,backSide},orderOfAutoComplete,numOfSuggestion,numOfHistory,displayFullIcon,addressBarNewTab,historyBadget,versions,bookmarkBar,bookmarkBarTopPage,extensionOnToolbar] = ipc.sendSync('get-sync-main-states',['alwaysOnTop','multistageTabs','verticalTab','navbarItems','orderOfAutoComplete','numOfSuggestion','numOfHistory','displayFullIcon','addressBarNewTab','historyBadget','versions','bookmarkBar','bookmarkBarTopPage','extensionOnToolbar'])
numOfSuggestion = parseInt(numOfSuggestion), numOfHistory = parseInt(numOfHistory)
sharedState.bookmarkBar = bookmarkBar
sharedState.bookmarkBarTopPage = bookmarkBarTopPage


let staticDisableExtensions = []
class BrowserNavbar extends Component{
  constructor(props) {
    super(props)
    this.state = {userAgentBefore: MOBILE_USERAGENT,
      pdfMode:'normal',currentIndex:0,historyList:[],disableExtensions:staticDisableExtensions,left,right,backSide}
    this.canRefresh = this.props.page.canRefresh
    this.location = this.props.page.location
    this.richContents = this.props.richContents
    this.sync = this.props.tab.sync
  }

  initEvents(){
    this.tokenZoom = PubSub.subscribe(`zoom_${this.props.tabkey}`,(msg,percent)=>{
      this.setState({zoom:percent})
      if(this.props.tab.sync) this.props.parent.syncZoom(percent,this.props.tab.sync)
    })
    this.tokenReplaceInfo = PubSub.subscribe(`update-replace-info_${this.props.tabkey}`,(msg,replaceInfo)=>{
      this.refs.syncReplace.setVals(replaceInfo)
    })
    this.tokenPdfMode = PubSub.subscribe('set-pdfmode-enable',(msg,mode)=>this.setState({pdfMode:mode}))

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
        [this.state.userAgent,this.state.userAgentBefore] = [this.state.userAgentBefore,this.state.userAgent];
        this.setState({mobile: this.props.tab.mobile})
        const tabId = this.props.tab.wvId
        if(!tabs.has(tabId)){
          ipc.send('user-agent-change',{tabId,ua:this.state.userAgent})
          this.getWebContents(this.props.tab).reload()
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
    this.props.refs2[`navbar-${this.props.tabkey}`] = this
  }

  componentDidMount() {
    this.updateStates()
    this.initEvents()
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.tokenZoom)
    PubSub.unsubscribe(this.tokenReplaceInfo)
    // PubSub.unsubscribe(this.tokenAdblockGlobal)
    PubSub.unsubscribe(this.tokenPdfMode)
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
      this.props.isTopRight === nextProps.isTopRight &&
      this.props.isTopLeft === nextProps.isTopLeft &&
      this.props.fullscreen === nextProps.fullscreen &&
      (this.richContents||[]).length === (nextProps.tab.page.richContents||[]).length &&
      (this.caches||[]).length === (nextState.caches||[]).length &&
      this.state.currentIndex === nextState.currentIndex &&
      equalArray2(this.state.historyList,nextState.historyList) &&
      equalArray(this.state.disableExtensions,nextState.disableExtensions) &&
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
      this.state.pdfMode == nextState.pdfMode &&
      this.props.oppositeGlobal == nextProps.oppositeGlobal &&
      this.props.tabKey == this.tabKey &&
      this.searchWordHighlight == sharedState.searchWordHighlight &&
      this.searchWordHighlightRecursive == sharedState.searchWordHighlightRecursive &&
      this.bookmarkBar == sharedState.bookmarkBar)
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
      this.searchWordHighlight = sharedState.searchWordHighlight
      this.searchWordHighlightRecursive = sharedState.searchWordHighlightRecursive
      this.bookmarkBar = sharedState.bookmarkBar
    }
    return ret
  }

  updateStates(){
    ipc.once(`get-cont-history-reply_${this.props.tab.wvId}`,(e,currentIndex,historyList,rSession,disableExtensions,adBlockGlobal,pdfMode,navbarItems)=>{
      left = navbarItems.left
      right = navbarItems.right
      backSide = navbarItems.backSide
      if(currentIndex === (void 0)) return
      staticDisableExtensions = disableExtensions
      console.log(9995,this.props.tab.rSession)
      if(rSession){
        console.log(9996,rSession)
        this.props.tab.rSession.urls = rSession.urls
        this.props.tab.rSession.titles = rSession.titles
        this.props.tab.rSession.currentIndex = currentIndex
      }
      if(this.props.adBlockEnable != adBlockGlobal) PubSub.publish('set-adblock-enable',adBlockGlobal)
      this.setState({currentIndex,historyList,disableExtensions,pdfMode,...navbarItems})
    })
    ipc.send('get-cont-history',this.props.tab.wvId,this.props.tab.key,this.props.tab.rSession)
  }

  componentWillUpdate(prevProps, prevState) {
    ipc.once(`get-cont-history-reply_${this.props.tab.wvId}`,(e,currentIndex,historyList,rSession,disableExtensions,adBlockGlobal,pdfMode,navbarItems)=>{
      if(currentIndex === (void 0)) return
      staticDisableExtensions = disableExtensions
      console.log(rSession,this.props.tab)
      console.log(9997,this.props.tab.rSession)
      if(rSession){
        console.log(9998,this.props.tab.rSession)
        this.props.tab.rSession.urls = rSession.urls
        this.props.tab.rSession.titles = rSession.titles
        this.props.tab.rSession.currentIndex = currentIndex
      }
      if(!(this.state.currentIndex === currentIndex &&
        equalArray2(this.state.historyList,historyList) &&
        equalArray(this.state.disableExtensions,disableExtensions) &&
        this.state.pdfMode == pdfMode)){
        this.setState({currentIndex,historyList,disableExtensions,pdfMode})
      }
      if(this.props.adBlockEnable != adBlockGlobal) PubSub.publish('set-adblock-enable',adBlockGlobal)

    })
    ipc.send('get-cont-history',this.props.tab.wvId,this.props.tab.key,this.props.tab.rSession)
  }

  onZoomCommon(type){
    const webContents = this.getWebContents(this.props.tab)
    if(webContents){
      const zoomBehavior = mainState.zoomBehavior
      if(zoomBehavior == 'chrome'){
        webContents[type]()
      }
      else{
        webContents.setZoomLevel(sharedState.zoomMapping.get(webContents.getZoomPercent() + parseInt(zoomBehavior) * (type == 'zoomOut' ? -1 : 1)))
      }
      const percent = webContents.getZoomPercent()
      if(!this.refs['main-menu'].state.visible){
        this.state.zoomDisplay = `${percent}%`
        clearTimeout(this.zoomTimeout)
        this.zoomTimeout = setTimeout(_=>{
          this.forceUpdates = true
          this.setState({zoomDisplay:''})
        },1500)
      }
      this.setState({zoom:percent})
      if(this.props.tab.sync) this.props.parent.syncZoom(percent,this.props.tab.sync)
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
    if(webContents) webContents.zoomReset()
    if(!this.refs['main-menu'].state.visible){
      this.state.zoomDisplay = '100%'
      clearTimeout(this.zoomTimeout)
      this.zoomTimeout = setTimeout(_=>{
        this.forceUpdates = true
        this.setState({zoomDisplay:''})
      },1500)
    }
    this.setState({zoom:100})
    if(this.props.tab.sync) this.props.parent.syncZoom(100,this.props.tab.sync)
  }

  onCommon(str){
    const cont = this.getWebContents(this.props.tab)
    const url = str == "history" ? "chrome://history/" : str == "favorite" ? "chrome://bookmarks/" : `chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/${str}.html`
    cont.hostWebContents.send('new-tab', this.props.tab.wvId, url)
    // webContents.getAllWebContents().forEach(x=>{console.log(x.getId(),x.hostWebContents && x.hostWebContents.getId())})
  }


  navigate(url){
    const cont = this.getWebContents(this.props.tab)
    cont.hostWebContents.send('new-tab', this.props.tab.wvId, url)
    // webContents.getAllWebContents().forEach(x=>{console.log(x.getId(),x.hostWebContents && x.hostWebContents.getId())})
  }

  onAddFavorite(url,title,favicon){
    ;(async ()=> {
      const key = uuid.v4()
      await favorite.insert({key, url, title, favicon, is_file:true, created_at: Date.now(), updated_at: Date.now()})
      await favorite.update({ key: 'root' }, { $push: { children: key }, $set:{updated_at: Date.now()} })
    })()
  }

  onMediaDownload(url,fname,audio,needInput,convert){
    if(fname) ipc.send('set-save-path',url,fname)
    if(audio) ipc.send('set-audio-extract',url)
    if(needInput) ipc.send('need-set-save-filename',url)
    if(convert) ipc.send('set-video-convert',url,convert)
    const cont = this.getWebContents(this.props.tab)
    cont.hostWebContents.downloadURL(url,true)
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
  //                             cont.hostWebContents.send('new-tab', this.props.tab.wvId, `file://${path.join(e.path,e.addr)}`)
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

  handleUserAgent(){
    [this.state.userAgent,this.state.userAgentBefore] = [this.state.userAgentBefore,this.state.userAgent];
    ipc.send('user-agent-change',{tabId:this.props.tab.wvId,ua:this.state.userAgent})
    this.props.tab.mobile = !this.state.mobile
    this.setState({mobile: !this.state.mobile})
    this.getWebContents(this.props.tab).reload()
  }

  handleAdBlockGlobal(){
    const val = !this.props.adBlockEnable
    mainState.set('adBlockEnable',val)
    PubSub.publish('set-adblock-enable',val)
  }

  handlePdfMode(){
    const val = this.state.pdfMode == 'normal' ? 'comic' : 'normal'
    PubSub.publish('set-pdfmode-enable',val)
    mainState.set('pdfMode',val)
  }

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
      const wv = ele.querySelector("webview")
      const elem = ele
      if(tab.key === wv.dataset.key){
        setTimeout(_=>{
          ipc.send('set-pos-window',{key:tab.key,id:tab.bind && tab.bind.id
            ,x:window.screenX + r.left,y:window.screenY + r.top,width:r.width,height:r.height,top:'above'})
          ipc.once(`set-pos-window-reply_${tab.key}`,(e,ret)=>{
            if(!ret) return
            const [id,name] = ret
            this.props.parent.navigateTo(tab.page, `chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/bind.html?url=${encodeURIComponent(name)}`, tab)
            const ro = new ResizeObserver((entries, observer) => {
              for (const entry of entries) {
                const r = elem.getBoundingClientRect()
                ipc.send('set-pos-window',{key:tab.key,id:id,x:window.screenX + r.left,y:window.screenY + r.top,width:r.width,height:r.height})
              }
            });
            const key = uuid.v4()
            const interval = setInterval(_=>{
              console.log('interval')
              ipc.send('set-pos-window',{key,id,tabId:tab.wvId,checkClose:true})
              ipc.once(`set-pos-window-reply_${key}`,(e,{needClose})=>{
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
                  ipc.send('set-pos-window',{id,x:window.screenX + r.left,y:window.screenY + r.top,width:r.width,height:r.height})
                },0)
              },
              blur: e=>{
                console.log('blur')
                ipc.send('set-pos-window',{id,top:'not-above',hwnd:tab.bind.hwnd,active:tab.key == this.props.parent.state.selectedTab})
              },
              focus:e=>{
                console.log('focus')
                if(tab.key == this.props.parent.state.selectedTab){
                  ipc.send('set-pos-window',{id,top:'above'})
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
    const dis = ['dckpbojndfoinamcdamhkjhnjnmjkfjd','jdbefljfgobbmcidnmpjamcbhnbphjnb',...this.state.disableExtensions]
    for(let [id,values] of browserActionMap) {
      if(dis.includes(values.orgId) || dis.includes(id)) continue
      ret[id] = <BrowserActionMenu key={id} id={id} values={values} tab={tab} cont={cont} parent={this} selected={selected}/>
    }
    return ret
  }

  loadTabSetting(){
    sharedState.notLoadTabUntilSelected = !sharedState.notLoadTabUntilSelected
    mainState.set('notLoadTabUntilSelected',sharedState.notLoadTabUntilSelected)
    sharedState.enableColorOfNoSelect = sharedState.notLoadTabUntilSelected
    mainState.set('enableColorOfNoSelect',sharedState.notLoadTabUntilSelected)
    this.forceUpdates = true
    this.props.parent.setState({})
  }

  mainMenu(cont,tab,menuActions){
    const hostname = this.props.page.navUrl ? urlParse(this.props.page.navUrl).hostname : ""
    return <NavbarMenu ref="main-menu" className="main-menu" alwaysView={true} k={this.props.k} isFloat={isFloatPanel(this.props.k)} style={{overflowX: 'visible'}}
                       title={locale.translation('settings')} icon="bars" tab={tab.bind && tab}
                       onClick={_=>{
                         PubSub.publishSync(`zoom_${this.props.tabkey}`,this.getWebContents(this.props.tab).getZoomPercent())
                         if(tab.bind){
                           ipc.send('set-pos-window',{id:tab.bind.id,hwnd:tab.bind.hwnd,top:'not-above'})
                         }
                       }
                       }>
      <NavbarMenuBarItem>
        {menuActions}
      </NavbarMenuBarItem>
      <NavbarMenuItem text={locale.translation("newWindow")} icon='clone' onClick={()=>BrowserWindowPlus.load({id:remote.getCurrentWindow().id,sameSize:true})}/>
      <div className="divider" />
      <NavbarMenuItem text={`[${this.props.toggleNav == 0 ? ' ' : '✓'}] OneLine Menu(ALL)`} icon='ellipsis horizontal'
                      onClick={()=>{cont.hostWebContents.send('toggle-nav',this.props.toggleNav == 0 ? 1 : 0);this.setState({})}}/>
      {this.props.toggleNav == 0 ? <NavbarMenuItem text={`[${multistageTabs  ? '✓' : ' '}] Multi Row Tabs`} icon='table'
                                                   onClick={()=>{
                                                     ipc.send('save-state',{tableName:'state',key:'multistageTabs',val:!multistageTabs})
                                                     PubSub.publish('change-multistage-tabs',!multistageTabs)
                                                     PubSub.publish("resizeWindow",{})
                                                   }}/> : null
      }
      <div className="divider" />

      <NavbarMenuItem text={`[${alwaysOnTop ? '✓' : ' '}] ${locale.translation('alwaysOnTop')}`} icon='level up' onClick={()=>{
        alwaysOnTop = !alwaysOnTop
        mainState.set('alwaysOnTop',alwaysOnTop)
        remote.getCurrentWindow().setAlwaysOnTop(alwaysOnTop)
        this.forceUpdates = true
        this.setState({})
      }}/>
      {isDarwin ? null :<NavbarMenuItem text='Bind Selected Window' icon='crosshairs' onClick={_=>this.bindWindow()}/>}
      <NavbarMenuItem text={`[${sharedState.searchWordHighlight ? '✓' : ' '}] Search Highlight`} icon='asterisk' onClick={_=>{
        sharedState.searchWordHighlight = !sharedState.searchWordHighlight
        mainState.set('searchWordHighlight',sharedState.searchWordHighlight)
        this.props.searchWordHighlight(this.props.tab)
        this.refs['main-menu'].menuClose()
        this.setState({})
      }}/>
      <div className="divider" />


      <NavbarMenuItem icon='zoom out' className='zoom-out' onClick={::this.onZoomOut} keepVisible={true} />
      <NavbarMenuItem icon='zoom in' className='zoom-in' onClick={::this.onZoomIn} keepVisible={true} />
      <NavbarMenuItem text={`${parseInt(this.state.zoom)}%`} className='zoom-setting' onClick={::this.noZoom} keepVisible={true} />
      <div className="divider" />

      <NavbarMenuItem text={`[${this.props.adBlockEnable ? '✓' : ' '}] AdBlock(ALL)`} icon='hand paper' onClick={::this.handleAdBlockGlobal}/>
      {this.props.adBlockEnable ? <NavbarMenuItem text={`[${this.props.adBlockThis ? '✓' : ' '}] AdBlock(Tab)`} icon='hand paper' onClick={::this.handleAdBlockThis}/> : null}
      {this.props.adBlockEnable ? <NavbarMenuItem text={`[${global.adBlockDisableSite[hostname] ? ' ' : '✓'}] AdBlock(Domain)`} icon='hand paper' onClick={_=>this.handleAdBlockDomain(hostname)}/> : null}
      <div className="divider" />

      <NavbarMenuSubMenu icon="browser" text="Window SubMenu">
        <NavbarMenuItem text={`[${sharedState.bookmarkBar ? '✓' : ' '}] ${locale.translation('2845382757467349449')}`} icon='bookmark' onClick={_=>{
          sharedState.bookmarkBar = !sharedState.bookmarkBar
          mainState.set('bookmarkBar',sharedState.bookmarkBar)
          this.refs['main-menu'].menuClose()
          this.props.parent.setState({})
        }}/>
        <NavbarMenuItem text={`[${sharedState.bookmarkBarTopPage ? '✓' : ' '}] Show bookmark bar on top page`} icon='bookmark' onClick={_=>{
          sharedState.bookmarkBarTopPage = !sharedState.bookmarkBarTopPage
          mainState.set('bookmarkBarTopPage',sharedState.bookmarkBarTopPage)
          this.refs['main-menu'].menuClose()
          this.props.parent.setState({})
        }}/>
        <NavbarMenuItem text={`[${this.props.toggleNav == 0 ? ' ' : '✓'}] OneLine Menu`} icon='ellipsis horizontal' onClick={()=>{this.props.parent.toggleNavPanel(this.props.toggleNav == 0 ? 1 : 0);this.setState({})}}/>
        <div className="divider" />
        <NavbarMenuItem text='Detach This Panel' icon='space shuttle' onClick={_=>{this.props.parent.detachPanel();this.refs['main-menu'].menuClose()}}/>
        <NavbarMenuItem text='Panels to Windows' icon='cubes' onClick={_=>{PubSub.publish('all-detach');this.refs['main-menu'].menuClose()}}/>
        {isDarwin ? null :<NavbarMenuItem text={this.props.toggleNav == 3 ? 'Normal Screen Mode' : 'Full Screen Mode'} icon={this.props.toggleNav == 3 ? 'compress' : 'expand'}
                                          onClick={()=>{ipc.send('toggle-fullscreen');this.refs['main-menu'].menuClose()}}/>}
      </NavbarMenuSubMenu>
      <NavbarMenuSubMenu icon="hashtag" text={locale.translation('7853747251428735')}>
        {isWin  ? <NavbarMenuItem text={`Change VPN Mode`} icon='plug' onClick={_=>{
          this.setState({vpnList:!this.state.vpnList})
        }
        }/> : null}
        <NavbarMenuItem text={`[${this.props.oppositeGlobal ? '✓' : ' '}] Open Opposite`} icon='columns' onClick={_=>{this.handleOppositeGlobal();this.refs['main-menu'].menuClose()}}/>
        <NavbarMenuItem text={`[${sharedState.searchWordHighlightRecursive ? '✓' : ' '}] Search Highlight Recursive`} icon='asterisk' onClick={_=>{
          sharedState.searchWordHighlightRecursive = !sharedState.searchWordHighlightRecursive
          mainState.set('searchWordHighlightRecursive',sharedState.searchWordHighlightRecursive)
          this.refs['main-menu'].menuClose()
          this.setState({})
        }}/>
        <NavbarMenuItem text={`[${sharedState.notLoadTabUntilSelected ? '✓' : ' '}] Don't load tabs untill selected`} onClick={_=>{this.loadTabSetting();this.refs['main-menu'].menuClose()}}/>
        <div className="divider" />
        <NavbarMenuItem text='Extract Audio from Video' icon='music' onClick={_=>{ipc.send('audio-extract');this.refs['main-menu'].menuClose()}}/>
        <NavbarMenuItem text={`Change Pdf View to ${this.state.pdfMode == 'normal' ? 'Comic' : 'Normal'}`} icon='file pdf outline' onClick={_=>{this.handlePdfMode();this.refs['main-menu'].menuClose()}}/>
        <NavbarMenuItem text='Sync Datas' icon='exchange' onClick={()=>{ipc.send("start-sync",this.props.k);this.refs['main-menu'].menuClose()}}/>
      </NavbarMenuSubMenu>
      <div className="divider" />


      <NavbarMenuItem text={locale.translation("print").replace('…','')} icon='print' onClick={()=>this.getWebContents(this.props.tab).print()}/>
      <NavbarMenuItem text={locale.translation("search")} icon='search' onClick={()=>ipc.emit('menu-or-key-events',null,'findOnPage',this.props.tab.wvId)}/>
      <NavbarMenuItem text={locale.translation("settings").replace('…','')} icon='settings' onClick={()=>this.onCommon("settings")}/>
      <NavbarMenuItem text={locale.translation("toggleDeveloperTools")} icon='bug' onClick={()=>this.getWebContents(this.props.tab).openDevTools()}/>
      <div className="divider" />

      <NavbarMenuItem text='Close This Panel' icon='close' onClick={()=>PubSub.publish(`close-panel_${this.props.k}`)}/>
      <NavbarMenuItem text={locale.translation("closeWindow")} icon='remove circle' onClick={MenuOperation.windowClose}/>

      <div className="divider" />
      <NavbarMenuItem text='Restart Browser' icon='undo rotate60' onClick={()=>ipc.send('restart-browser')}/>

      <div className="divider" />
      <NavbarMenuSubMenu text="About">
        <NavbarMenuItem text={`Browser Version: ${versions.browser}`} onClick={_=>this.navigate('https://sushib.me/download.html')}/>
        <NavbarMenuItem text={`Chromium Version: ${versions.chrome}`} onClick={_=>this.navigate('https://github.com/chromium/chromium/releases')}/>
        <NavbarMenuItem text={`Muon Version: ${versions.Brave}`} onClick={_=>this.navigate('https://sushib.me/download.html')}/>
      </NavbarMenuSubMenu>
    </NavbarMenu>
  }

  fetchFavoriteDate(){
    return new Promise((resolve,reject)=> {
      ipc.send('fetch-favorite', {})
      ipc.once('favorite-reply', (event, data) => {
        resolve(data)
      })
    })
  }

  // favoriteDataHandle(menuItems,ret){
  //   menuItems.splice(0, menuItems.length);
  //   let i = 0
  //   for(let item of ret){
  //     const favicon = (item.favicon != "undefined" && localStorage.getItem(item.favicon)) || "resource/file.png"
  //     menuItems.push(<NavbarMenuItem key={i++} favicon={favicon} text={item.title} onClick={_=>this.navigate(item.url)} />)
  //     if(i > 100) break
  //   }
  //   return menuItems
  // }

  favoriteMenu(cont,onContextMenu){
    const menuItems = []
    return <NavbarMenu className="sort-favorite" k={this.props.k} isFloat={isFloatPanel(this.props.k)} ref="favoriteMenu" title={locale.translation('bookmarks')} icon="star" onClick={_=>_} onContextMenu={onContextMenu} timeOut={50}>
      <NavbarMenuItem bold={true} text='Navigate to the Bookmark Page' onClick={_=>this.onCommon("favorite")} />
      <div className="divider" />
      <NavbarMenuItem bold={true} text='Add this page to the Bookmarks' onClick={_=>this.onAddFavorite(this.props.page.location,this.props.page.title,this.props.page.favicon)} />
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
      const favicon = (item.favicon != "undefined" && localStorage.getItem(item.favicon)) || "resource/file.png"
      menuItems.push(<NavbarMenuItem key={i++} favicon={favicon} text={`[${moment(item.updated_at).format("YYYY/MM/DD HH:mm:ss")}] ${item.title}`} onClick={_=>this.navigate(item.location)} />)
      if(i > 200) break
    }
    return menuItems
  }

  historyMenu(cont,onContextMenu){
    const menuItems = []
    return <NavbarMenu className="sort-history" k={this.props.k} isFloat={isFloatPanel(this.props.k)} ref="historyMenu" title={locale.translation('history')} icon="history" onClick={_=>_} onContextMenu={onContextMenu} timeOut={50}>
      <NavbarMenuItem bold={true} text='Navigate to the History Page' onClick={_=>this.onCommon("history")} />
      <div className="divider" />
      <div role="option" className="item favorite infinite-classic">
        <HistoryExplorer cont={cont} onClick={_=> this.refs.historyMenu.setState({visible:false})}/>
      </div>
    </NavbarMenu>
  }

  tabHistoryMenu(cont,onContextMenu){
    const menuItems = []
    return <NavbarMenu className="sort-tabHistory" k={this.props.k} isFloat={isFloatPanel(this.props.k)} ref="tabHistoryMenu" title="History of Tabs" icon="tags" onClick={_=>_} onContextMenu={onContextMenu} timeOut={50}>
      {/*<NavbarMenuItem bold={true} text='Navigate to the History Page' onClick={_=>this.onCommon("history")} />*/}
      <div className="divider" />
      <div role="option" className="item favorite infinite-classic">
        <TabHistoryExplorer cont={cont} onClick={_=> this.refs.tabHistoryMenu.setState({visible:false})}/>
      </div>
    </NavbarMenu>
  }

  savedStateMenu(cont,onContextMenu){
    const menuItems = []
    return <NavbarMenu className="sort-savedState" k={this.props.k} isFloat={isFloatPanel(this.props.k)} ref="savedStateMenu" title="Super Session Manager" icon="database" onClick={_=>_} onContextMenu={onContextMenu} timeOut={50}>
      <NavbarMenuItem bold={true} text='Save Current Session' onClick={_=>ipc.send('save-all-windows-state')} />
      <div className="divider" />
      <div role="option" className="item favorite infinite-classic">
        <SavedStateExplorer cont={cont} onClick={_=> this.refs.savedStateMenu.setState({visible:false})}/>
      </div>
    </NavbarMenu>
  }

  getTitle(x,historyMap){
    console.log(997,historyMap.get(x[0]))
    const datas = historyMap.get(x[0])
    return datas ? <div className="favi-wrap"><img src={datas[1]} className="favi"/>{x[1]}</div> :  x[1] || x[0]
  }


  buildItems(isFixed,isFloat,rich,cont,onContextMenu){
    const backItems = this.state.historyList.slice(0,this.state.currentIndex)
    const nextItems = this.state.historyList.slice(this.state.currentIndex+1)
    const items = {
      back: <NavbarMenu k={this.props.k} onContextMenu={onContextMenu} mouseOver={true} isFloat={isFloatPanel(this.props.k)} className={`sort-back draggable-source back-next ${backItems.length ? "" : " disabled"}`} title={locale.translation('back')} icon="angle-left fa-lg" onClick={e=>{this.props.navHandle.onClickBack(e);this.forceUpdates=true}} badget={historyBadget && backItems.length ? <div className="browserActionBadge back" >{backItems.length}</div> : null}>
        {(cont ? backItems.reverse().map(
          (x,i)=><NavbarMenuItem key={i} text={this.getTitle(x,this.props.historyMap)} onClick={()=>{this.props.navHandle.onClickIndex(this.state.currentIndex -i -1);this.forceUpdates=true}}/>) : "")}
      </NavbarMenu>,

      forward: <NavbarMenu k={this.props.k} onContextMenu={onContextMenu} mouseOver={true} isFloat={isFloatPanel(this.props.k)} className={`sort-forward draggable-source back-next ${nextItems.length ? "" : " disabled"}`} title={locale.translation('forward')} icon="angle-right fa-lg" onClick={e=>{this.props.navHandle.onClickForward(e);this.forceUpdates=true}} badget={historyBadget && nextItems.length ? <div className="browserActionBadge next" >{nextItems.length}</div> : null} >
        {(cont ? nextItems.map(
          (x,i)=><NavbarMenuItem key={i} text={this.getTitle(x,this.props.historyMap)} onClick={()=>{this.props.navHandle.onClickIndex(this.state.currentIndex +i +1);this.forceUpdates=true}}/>) : "")}
      </NavbarMenu>,

      reload: <BrowserNavbarBtn className="sort-reload" title={locale.translation('reload')} icon="repeat" onContextMenu={onContextMenu} onClick={this.props.navHandle.onClickRefresh} disabled={!this.props.page.canRefresh} />,

      addressBar: <div className="input-group">
        <BrowserNavbarLocation ref="loc" wv={this.props.tab.wv} navbar={this} onEnterLocation={this.props.navHandle.onEnterLocation}
                               onChangeLocation={this.props.navHandle.onChangeLocation} addressBarNewTab={addressBarNewTab} autoCompleteInfos={{url:this.props.autocompleteUrl,orderOfAutoComplete,numOfSuggestion,numOfHistory}}
                               k ={this.props.k} onContextMenu={this.props.navHandle.onLocationContextMenu} tab={this.props.tab} page={this.props.page} privateMode={this.props.privateMode} search={this.props.parent.search}/>
      </div>,

      margin: <div className="navbar-margin" style={{width: this.props.toggleNav != 1 ? 0 : this.props.isTopRight ? '45%' : '50%',minWidth: this.props.toggleNav != 1 ? 0 :'80px',background: 'rgb(221, 221, 221)'}}
                   onDoubleClick={isDarwin ? _=>{
                     const win = remote.getCurrentWindow()
                     if(win.isFullScreen()){}
                     else if(win.isMaximized()){
                       win.unmaximize()
                     }
                     else{
                       win.maximize()
                     }
                   }: null}></div>,

      syncReplace: isFixed ? null : <SyncReplace ref="syncReplace" onContextMenu={onContextMenu} changeSyncMode={this.props.parent.changeSyncMode} replaceInfo={this.props.tab.syncReplace} updateReplaceInfo={this.props.parent.updateReplaceInfo}/>,

      sync: isFixed ? null : <BrowserNavbarBtn className="sort-sync" title="Switch Sync Scroll" icon="circle-o" sync={this.props.tab.sync && !this.props.tab.syncReplace}
                                               onContextMenu={onContextMenu}onClick={()=>{this.props.parent.changeSyncMode();this.refs.syncReplace.clearAllCheck()}}/>,

      float:   isFixed || !this.props.tab.sync || this.props.tab.syncReplace || !this.props.isTopLeft ? null : <FloatSyncScrollButton  onContextMenu={onContextMenu}toggleNav={this.props.toggleNav} scrollPage={this.props.parent.scrollPage}/>,

      opposite: isFloat ? null: <BrowserNavbarBtn className="sort-opposite" title="Switch Opposite Open" icon="external-link-square" sync={this.props.tab.oppositeMode} onContextMenu={onContextMenu} onClick={()=>{this.props.parent.changeOppositeMode()}}/>,

      sidebar: isFixed ? null : <NavbarMenu className="sort-sidebar" k={this.props.k} mouseOver={true} isFloat={isFloatPanel(this.props.k)}
                                            title="Open Sidebar" icon="list-ul" onContextMenu={onContextMenu} onClick={()=>this.props.fixedPanelOpen({dirc:mainState.sideBarDirection})}>
        <NavbarMenuItem key="Left" text="Left" icon="caret left" onClick={()=>this.props.fixedPanelOpen({dirc:"left"})}/>
        <NavbarMenuItem key="Right" text="Right" icon="caret right" onClick={()=>this.props.fixedPanelOpen({dirc:"right"})}/>
        <NavbarMenuItem key="Bottom" text="Bottom" icon="caret down" onClick={()=>this.props.fixedPanelOpen({dirc:"bottom"})}/>
        <div className="divider" />
        <NavbarMenuItem key="verticalLeft" text="Vertical Tabs Left" icon="caret left" onClick={()=>PubSub.publish('set-vertical-tab-state',"left")}/>
        <NavbarMenuItem key="verticalRight" text="Vertical Tabs Right" icon="caret right" onClick={()=>PubSub.publish('set-vertical-tab-state',"right")}/>
      </NavbarMenu>,

      mobile: <BrowserNavbarBtn className="sort-mobile" title="Change to Mobile UserAgent" icon="mobile" styleFont={{fontSize: 20}} sync={this.state.mobile} onContextMenu={onContextMenu}
                                onClick={::this.handleUserAgent}/>,

      favorite: isFixed && !isFloat ? null : this.favoriteMenu(cont,onContextMenu),
      history: isFixed && !isFloat ? null : this.historyMenu(cont,onContextMenu),
      tabHistory: isFixed && !isFloat ? null : this.tabHistoryMenu(cont,onContextMenu),
      savedState: isFixed && !isFloat ? null : this.savedStateMenu(cont,onContextMenu),

      download: <BrowserNavbarBtn className="sort-download" title={locale.translation("downloads")} icon="download" onClick={this.onCommon.bind(this,"download")}/>,
      folder: <BrowserNavbarBtn className="sort-folder" title="File Explorer" icon="folder" onClick={this.onCommon.bind(this,"explorer")}/>,
      terminal: <BrowserNavbarBtn className="sort-terminal" title={locale.translation('4589268276914962177')} icon="terminal" onClick={this.onCommon.bind(this,"terminal")}/>,
      video: <Dropdown scrolling className="sort-video draggable-source nav-button" onContextMenu={onContextMenu} style={{minWidth:0}}
                       trigger={<BrowserNavbarBtn title="Rich Media List" icon="film">{rich && rich.length ? <div className="browserActionBadge video" >{rich.length}</div> : null}</BrowserNavbarBtn>}
                       pointing='top right' icon={null} disabled={!rich || !rich.length}>
        <Dropdown.Menu className="nav-menu">
          <div role="option" className="item" onClick={_=>this.props.tab.events['pin-video'](null,this.props.tab.wvId,true)}>Play Video in Popup Window</div>
          <Divider/>
          <div role="option" className="item" onClick={_=>this.props.tab.events['pin-video'](null,this.props.tab.wvId)}>Play Video in Floating Panel</div>
          <Divider/>
          <div className="org-menu">
            {(rich||[]).map((e,i)=>{
              const url = e.url
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
                {m3u8 ? null : <button className="play-btn" title="Play Video" onClick={e=>{
                  e.stopPropagation()
                  const p = e.target.parentNode.parentNode;(e.target.tagName == "I" ? p.parentNode : p).classList.remove("visible")
                  cont.hostWebContents.send('new-tab', this.props.tab.wvId, url)
                }}>
                  <i className="fa fa-play" aria-hidden="true"></i>
                </button>}

                {m3u8 ? null : <button className="play-btn" title="Download and Play Video" onClick={e=>{
                  e.stopPropagation()
                  const p = e.target.parentNode.parentNode;(e.target.tagName == "I" ? p.parentNode : p).classList.remove("visible")
                  ipc.send('save-and-play-video', url)
                }}>
                  <i className="fa fa-play-circle" aria-hidden="true"></i>
                </button>}

                <button className="play-btn" title="Play External Video Player" onClick={e=>{
                  e.stopPropagation()
                  const p = e.target.parentNode.parentNode;(e.target.tagName == "I" ? p.parentNode : p).classList.remove("visible")
                  ipc.send('play-external',url)
                }}>
                  <i className="fa fa-play-circle-o" aria-hidden="true"></i>
                </button>

                <button className="play-btn" title="Download Video" onClick={e2=>{
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

                {m3u8 ? null : <button className="play-btn" title="Download and Convert Video" onClick={e2=>{
                  e2.stopPropagation()
                  const p = e2.target.parentNode.parentNode;(e2.target.tagName == "I" ? p.parentNode : p).classList.remove("visible")
                  showConvertDialog(url, e.fname, this.props.tab.wvId, this.onMediaDownload.bind(this,url,e.fname,false,false))
                }}>
                  <i className="fa fa-industry" aria-hidden="true"></i>
                </button>}

                {m3u8 ? null : <button className="play-btn" title="Download Video and Extract Audio" onClick={e2=>{
                  e2.stopPropagation()
                  const p = e2.target.parentNode.parentNode;(e2.target.tagName == "I" ? p.parentNode : p).classList.remove("visible")
                  this.onMediaDownload(url,e.fname,true)
                }}>
                  <i className="fa fa-music" aria-hidden="true"></i>
                </button>}
                <button className="clipboard-btn" title="Copy Video URL" data-clipboard-text={url}
                        onClick={e=>{e.stopPropagation();const p = e.target.parentNode.parentNode;(e.target.tagName == "IMG" ? p.parentNode : p).classList.remove("visible")}}>
                  <img width="13" src="data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjEwMjQiIHdpZHRoPSI4OTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHBhdGggZD0iTTEyOCA3NjhoMjU2djY0SDEyOHYtNjR6IG0zMjAtMzg0SDEyOHY2NGgzMjB2LTY0eiBtMTI4IDE5MlY0NDhMMzg0IDY0MGwxOTIgMTkyVjcwNGgzMjBWNTc2SDU3NnogbS0yODgtNjRIMTI4djY0aDE2MHYtNjR6TTEyOCA3MDRoMTYwdi02NEgxMjh2NjR6IG01NzYgNjRoNjR2MTI4Yy0xIDE4LTcgMzMtMTkgNDVzLTI3IDE4LTQ1IDE5SDY0Yy0zNSAwLTY0LTI5LTY0LTY0VjE5MmMwLTM1IDI5LTY0IDY0LTY0aDE5MkMyNTYgNTcgMzEzIDAgMzg0IDBzMTI4IDU3IDEyOCAxMjhoMTkyYzM1IDAgNjQgMjkgNjQgNjR2MzIwaC02NFYzMjBINjR2NTc2aDY0MFY3Njh6TTEyOCAyNTZoNTEyYzAtMzUtMjktNjQtNjQtNjRoLTY0Yy0zNSAwLTY0LTI5LTY0LTY0cy0yOS02NC02NC02NC02NCAyOS02NCA2NC0yOSA2NC02NCA2NGgtNjRjLTM1IDAtNjQgMjktNjQgNjR6IiAvPgo8L3N2Zz4K"/>
                </button>
              </div>
            })}
          </div>
        </Dropdown.Menu>
      </Dropdown>,
      screenshot: <NavbarMenu className="sort-screenshot" k={this.props.k} mouseOver={true} isFloat={isFloatPanel(this.props.k)}
                              title="ScreenShot" icon="camera" onContextMenu={onContextMenu} onClick={_=>_}>
        <NavbarMenuItem key="full-clip" text="Full Page | Clipboard" onClick={()=>this.props.screenShot(true,'clipboard',this.props.tab)}/>
        <NavbarMenuItem key="full-jpeg" text="Full Page | Jpeg"  onClick={()=>this.props.screenShot(true,'JPEG',this.props.tab)}/>
        <NavbarMenuItem key="full-png" text="Full Page | PNG"  onClick={()=>this.props.screenShot(true,'PNG',this.props.tab)}/>
        <div className="divider" />
        <NavbarMenuItem key="sel-clip" text="Selection | Clipboard" onClick={()=>this.props.screenShot(false,'clipboard',this.props.tab)}/>
        <NavbarMenuItem key="sel-jpeg" text="Selection | Jpeg"  onClick={()=>this.props.screenShot(false,'JPEG',this.props.tab)}/>
        <NavbarMenuItem key="sel-png" text="Selection | PNG"  onClick={()=>this.props.screenShot(false,'PNG',this.props.tab)}/>
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

    const navbarStyle = this.props.toggleNav == 2 ? {visibility: "hidden"} : this.props.toggleNav == 3 ? {zIndex: 2, position: "sticky", top: 27} : {}
    // this.props.toggleNav == 1 ? {width : this.props.isTopRight ? '55%' : '50%',float: 'right'} : {}


    return <div className={`navbar-main browser-navbar${isFixed && !isFloat ? " fixed-panel" : ""}`}
                ref="navbar" onDragOver={(e)=>{e.preventDefault();return false}}
                onDrop={(e)=>{e.preventDefault();return false}} style={navbarStyle}>
      {/*<BrowserNavbarBtn title="Rewind" icon="home fa-lg" onClick={this.props.onClickHome} disabled={!this.props.page.canGoBack} />*/}

      {isDarwin && this.props.isTopRight && this.props.toggleNav == 1 && !document.querySelector('.vertical-tab.left') ? <div style={{width: this.props.fullscreen ? 0 : 62}}/>  : null }

      {navBarMenus}
      {this.mainMenu(cont, this.props.tab, backSideMenus)}
      {this.state.vpnList ? <VpnList onClick={_=>this.setState({vpnList:false})}/> : null}
      {isFixed && !isFloat ? <BrowserNavbarBtn style={{fontSize:18}} title="Hide Sidebar" icon={`angle-double-${isFixed == 'bottom' ? 'down' : isFixed}`} onClick={()=>this.props.fixedPanelOpen({dirc:isFixed})}/> : null}
      {!isDarwin && this.props.isTopRight && (this.props.toggleNav == 1 || verticalTab) ? <RightTopBottonSet displayFullIcon={displayFullIcon} style={{lineHeight: 0.9, transform: 'translateX(6px)',paddingTop: 1}}/> : null }

      {isFloat  && this.props.toggleNav == 1 ? <div className="title-button-set" style={{lineHeight: 0.9, transform: 'translateX(6px)'}}>
        <span className="typcn typcn-media-stop-outline" onClick={()=>PubSub.publish(`maximize-float-panel_${this.props.k}`)}></span>
        <span className="typcn typcn-times" onClick={()=>PubSub.publish(`close-panel_${this.props.k}`)}></span>
      </div> : null}
      {this.state.zoomDisplay ?
        <div className="ui dropdown zoom-menu" style={{top: 50, right: 30}}>
          <div className="menu visible transition left nav-menu" style={{overflowX: 'visible', left: 'auto',paddingBottom:3}}>
            <div className="item zoom-out" role="option" onClick={::this.onZoomOut}><i className="zoom out icon" aria-hidden="true"/><span
              className="text"></span></div>
            <div className="item zoom-in" role="option" onClick={::this.onZoomIn}><i className="zoom in icon" aria-hidden="true"/><span
              className="text"></span></div>
            <div className="item zoom-setting" role="option" onClick={::this.noZoom}><span className="text">{this.state.zoomDisplay}</span></div>
          </div>
        </div>: null}

      {this.state.bindWindow ? <Modal basic size='small' open={true}>
        <Modal.Content>
          <p style={{fontSize: 30,textAlign:'center'}}>Please click other window</p>
        </Modal.Content>
      </Modal> : null}
    </div>
  }
}

export default {BrowserNavbar,alwaysOnTop}
