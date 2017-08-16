const React = require('react')
const ReactDOM = require('react-dom');
const {Component} = React
import { Dropdown } from 'semantic-ui-react'
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

const BrowserNavbarLocation = require('./BrowserNavbarLocation')
const SyncReplace = require('./SyncReplace')
import RightTopBottonSet from './RightTopBottonSet'
const NavbarMenu = require('./NavbarMenu')
const {NavbarMenuItem,NavbarMenuBarItem} = require('./NavbarMenuItem')
const FloatSyncScrollButton = require('./FloatSyncScrollButton')
const mainState = remote.require('./mainState')
const moment = require('moment')
const Clipboard = require('clipboard')
const FavoriteExplorer = require('../toolPages/favorite')
const {messages,locale} = require('./localAndMessage')
import ResizeObserver from 'resize-observer-polyfill'
import uuid from 'node-uuid'
const isDarwin = navigator.userAgent.includes('Mac OS X')

new Clipboard('.clipboard-btn')

const MOBILE_USERAGENT = 'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 5 Build/LMY48B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.65 Mobile Safari/537.36'

let lastExecTime = new Date().getTime()
const interval = 500

function isFixedPanel(key){
  const sp = key.split('-')
  return sp[0] == 'fixed' && sp[1]
}

function isFloatPanel(key){
  return key.startsWith('fixed-float')
}


const tabs = new Set()

function BrowserNavbarBtn(props){
  return <a href="#" style={props.style} className={`${props.disabled?'disabled':''} ${props.sync ? 'sync' : ''}`} title={props.title} onClick={props.onClick}><i style={props.styleFont} className={`fa fa-${props.icon}`}/></a>
}

let alwaysOnTop = [mainState.alwaysOnTop]

class BrowserNavbar extends Component{
  constructor(props) {
    super(props)
    this.state = {userAgentBefore: MOBILE_USERAGENT,adBlockGlobal:mainState.adBlockEnable,pdfMode:mainState.pdfMode,adBlockThis:true}
    this.canGoBack = this.props.page.canGoBack
    this.canGoForward = this.props.page.canGoForward
    this.canRefresh = this.props.page.canRefresh
    this.location = this.props.page.location
    this.richContents = this.props.richContents
    this.sync = this.props.sync
  }
  componentDidMount() {
    this.tokenZoom = PubSub.subscribe(`zoom_${this.props.tabkey}`,(msg,percent)=>{
      this.setState({zoom:percent})
      if(this.props.sync) this.props.syncZoom(percent,this.props.sync)
    })
    this.tokenReplaceInfo = PubSub.subscribe(`update-replace-info_${this.props.tabkey}`,(msg,replaceInfo)=>{
      this.refs.syncReplace.setVals(replaceInfo)
    })
    this.tokenAdblockGlobal = PubSub.subscribe('set-adblock-enable',(msg,enable)=>this.setState({adBlockGlobal:enable}))
    this.tokenPdfMode = PubSub.subscribe('set-pdfmode-enable',(msg,mode)=>this.setState({pdfMode:mode}))

    let marginEle = ReactDOM.findDOMNode(this).querySelector(".navbar-margin")
    let rdTabBar = marginEle.parentNode.parentNode.parentNode.parentNode.querySelector(".rdTabBar")
    console.log(marginEle,rdTabBar)

    const self = this

    const ro = new ResizeObserver((entries, observer) => {
      if(this.props.toggleNav != 1 ){
        rdTabBar.style.left = '0px'
        return
      }
      for (const entry of entries) {
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
        if(left != 0) rdTabBar.style.left = `${left}px`
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
          this.props.wv.reload()
        }
      },500)
    }
    if(this.props.tab.adBlockThis === false){
      setTimeout(_=>{
        const tabId = this.props.tab.wvId
        this.setState({adBlockThis: this.props.tab.adBlockThis})
        if(!tabs.has(tabId)){
          // ipc.send('set-adblock-enable',{tabId:this.props.tab.wvId,global:false})
          this.props.wv.reload()
        }
      },500)
    }


  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.tokenZoom)
    PubSub.unsubscribe(this.tokenReplaceInfo)
    PubSub.unsubscribe(this.tokenAdblockGlobal)
    PubSub.unsubscribe(this.tokenPdfMode)

    tabs.add(this.props.tab.wvId)
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(this.forceUpdates){
      this.forceUpdates = false
      return true
    }
    // console.log("should")
    // let currentIndex
    // const cont = nextProps.wv && this.getWebContents(nextProps.tab)
    // if (cont) {
    //   if(cont.isDestroyed()){
    //     return false
    //   }
    //   currentIndex = cont.getCurrentEntryIndex();
    // }
    const ret = !(this.canGoBack === nextProps.page.canGoBack &&
    this.canGoForward === nextProps.page.canGoForward &&
    this.canRefresh === nextProps.page.canRefresh &&
    this.location === nextProps.page.location &&
    this.navUrl === nextProps.page.navUrl &&
    this.props.toggleNav === nextProps.toggleNav &&
    this.props.isTopRight === nextProps.isTopRight &&
    this.props.isTopLeft === nextProps.isTopLeft &&
    this.props.fullscreen === nextProps.fullscreen &&
    (this.richContents||[]).length === (nextProps.richContents||[]).length &&
    (this.caches||[]).length === (nextState.caches||[]).length &&
    this.state.zoom === nextState.zoom &&
    this.props.sync === nextProps.sync &&
    this.props.oppositeMode === nextProps.oppositeMode &&
    this.currentIndex == nextProps.page.entryIndex &&
    this.state.mobile == nextState.mobile &&
    this.state.adBlockGlobal == nextState.adBlockGlobal &&
    this.state.pdfMode == nextState.pdfMode &&
    this.props.oppositeGlobal == nextProps.oppositeGlobal &&
    this.state.adBlockThis == nextState.adBlockThis)
    if(ret){
      this.canGoBack = nextProps.page.canGoBack
      this.canGoForward = nextProps.page.canGoForward
      this.canRefresh = nextProps.page.canRefresh
      this.location = nextProps.page.location
      this.navUrl = nextProps.page.navUrl
      this.richContents = (nextProps.richContents||[]).slice(0)
      this.caches = nextState.caches
      this.currentIndex = nextProps.page.entryIndex
    }
    return ret
  }

  onZoomOut(){
    const webContents = this.getWebContents(this.props.tab)
    if(webContents){
      webContents.zoomOut()
      const percent = webContents.getZoomPercent()
      this.setState({zoom:percent})
      if(this.props.sync) this.props.syncZoom(percent,this.props.sync)
    }
  }
  onZoomIn(){
    const webContents = this.getWebContents(this.props.tab)
    if(webContents){
      webContents.zoomIn()
      const percent = webContents.getZoomPercent()
      this.setState({zoom:percent})
      if(this.props.sync) this.props.syncZoom(percent,this.props.sync)
    }
  }
  noZoom(){
    const webContents = this.getWebContents(this.props.tab)
    if(webContents) webContents.zoomReset()
    this.setState({zoom:100})
    if(this.props.sync) this.props.syncZoom(100,this.props.sync)
  }

  onCommon(str){
    const cont = this.getWebContents(this.props.tab)
    cont.hostWebContents.send('new-tab', this.props.tab.wvId, `chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/${str}.html`)
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

  onMediaDownload(url,fname){
    if(fname){
      ipc.send('set-save-path',fname)
    }
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

  getCacheMediaItems(){
    const rich = this.state.caches
    if(!rich||!rich.length) return null;
    return rich.map((e,i)=>{
      return <Dropdown.Item key={i} text={`${e.fname}  Actual:${e.fullSize ? this.getAppropriateByteUnit(parseInt(e.fullSize)).join("") : ""} Cache:${e.size ? this.getAppropriateByteUnit(e.size).join("") : ""} URL:${e.url}`.slice(0,100)}
                            icon={e.type == "audio" ? "music" : e.type }
                            onClick={()=>{
                              const cont = this.getWebContents(this.props.tab)
                              cont.hostWebContents.send('new-tab', this.props.tab.wvId, `file://${path.join(e.path,e.addr)}`)
                            }}/>
    })
  }

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
    this.props.wv.reload()
  }

  handleAdBlockGlobal(){
    // ipc.send('set-adblock-enable',{tabId:this.props.tab.wvId,global:true})
    const val = !this.state.adBlockGlobal
    PubSub.publish('set-adblock-enable',val)
    mainState.set('adBlockEnable',val)
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
    this.props.tab.adBlockThis = !this.state.adBlockThis
    this.setState({adBlockThis: !this.state.adBlockThis})
  }

  browserAction(cont){
    const ret = []
    for(let [id,values] of browserActionMap) {
      if(['dckpbojndfoinamcdamhkjhnjnmjkfjd','jdbefljfgobbmcidnmpjamcbhnbphjnb'].includes(id)) continue
      ret.push(<BrowserActionMenu key={id} id={id} values={values} cont={cont} parent={this}/>)
    }
    return ret
  }

  mainMenu(cont){
    const {downloadNum} = mainState
    return <NavbarMenu k={this.props.k} isFloat={isFloatPanel(this.props.k)} style={{overflowX: 'visible'}} title={locale.translation('settings')} icon="bars" onClick={_=>PubSub.publishSync(`zoom_${this.props.tabkey}`,this.getWebContents(this.props.tab).getZoomPercent())}>
      <NavbarMenuBarItem>
        {this.browserAction(cont)}
        <BrowserNavbarBtn title={locale.translation("downloads")} icon="download" onClick={this.onCommon.bind(this,"download")}/>
        <BrowserNavbarBtn title="File Explorer" icon="folder" onClick={this.onCommon.bind(this,"explorer")}/>
        <BrowserNavbarBtn title={locale.translation('4589268276914962177')} icon="terminal" onClick={this.onCommon.bind(this,"terminal")}/>
      </NavbarMenuBarItem>

      <NavbarMenuItem text={locale.translation("newWindow")} icon='clone' onClick={()=>BrowserWindowPlus.load({id:remote.getCurrentWindow().id,sameSize:true})}/>
      <NavbarMenuItem text={this.props.toggleNav == 0 ? 'OneLine Menu(ALL)' : 'Normal Menu(ALL)'} icon='ellipsis horizontal'
                      onClick={()=>{cont.hostWebContents.send('toggle-nav',this.props.toggleNav == 0 ? 1 : 0);this.setState({})}}/>
      <NavbarMenuItem text={this.props.toggleNav == 0 ? 'OneLine Menu' : 'Normal Menu'} icon='ellipsis horizontal' onClick={()=>{this.props.toggleNavPanel(this.props.toggleNav == 0 ? 1 : 0);this.setState({})}}/>
      {isDarwin ? null :<NavbarMenuItem text={this.props.toggleNav == 3 ? 'Normal Screen Mode' : 'Full Screen Mode'} icon={this.props.toggleNav == 3 ? 'compress' : 'expand'}
                      onClick={()=>ipc.send('toggle-fullscreen')}/>}
      <NavbarMenuItem text='Detach This Panel' icon='space shuttle' onClick={this.props.detachPanel}/>
      <NavbarMenuItem text='Panels to Windows' icon='cubes' onClick={_=>PubSub.publish('all-detach')}/>

      <div className="divider" />

      <NavbarMenuItem text={locale.translation("zoomOut")} icon='zoom out' onClick={::this.onZoomOut} keepVisible={true} />
      <NavbarMenuItem text={`${parseInt(this.state.zoom)}% → 100%`} icon='radio' onClick={::this.noZoom} keepVisible={true} />
      <NavbarMenuItem text={locale.translation("zoomIn")} icon='zoom in' onClick={::this.onZoomIn} keepVisible={true} />
      <div className="divider" />

      <NavbarMenuItem text={`AdBlock ${this.state.adBlockGlobal ? 'OFF' : 'ON'}(ALL)`} icon='hand paper' onClick={::this.handleAdBlockGlobal}/>
      {this.state.adBlockGlobal ? <NavbarMenuItem text={`AdBlock ${this.state.adBlockThis ? 'OFF' : 'ON'}`} icon='hand paper' onClick={::this.handleAdBlockThis}/> : null}
      <div className="divider" />

      <NavbarMenuItem text={`Change Pdf View to ${this.state.pdfMode == 'normal' ? 'Comic' : 'Normal'}`} icon='file pdf outline' onClick={::this.handlePdfMode}/>
      <NavbarMenuItem text={`Open Opposite ${this.props.oppositeGlobal ? 'OFF' : 'ON'}(ALL)`} icon='columns' onClick={::this.handleOppositeGlobal}/>
      <div className="divider" />

      <NavbarMenuItem text={`${alwaysOnTop[0] ? 'Disable' : 'Enable'} Always On Top`} icon='level up' onClick={()=>{
        alwaysOnTop[0] = !alwaysOnTop[0]
        mainState.set('alwaysOnTop',alwaysOnTop[0])
        remote.getCurrentWindow().setAlwaysOnTop(alwaysOnTop[0])
        this.forceUpdates = true
        this.setState({})
      }}/>


      {/*<NavbarMenuItem text="Set Parallel DL" icon='arrow-circle-o-down' onClick={_=>_} keepVisible={true} input={downloadNum}*/}
                      {/*onChange={val=>{*/}
                        {/*mainState.set('downloadNum',parseInt(val))*/}
                        {/*this.setState({})*/}
                      {/*}}*/}
      {/*/>*/}

      <div className="divider" />

      <NavbarMenuItem text={locale.translation("settings").replace('…','')} icon='settings' onClick={()=>this.onCommon("settings")}/>
      <NavbarMenuItem text={locale.translation("print").replace('…','')} icon='print' onClick={()=>this.getWebContents(this.props.tab).print()}/>
      <NavbarMenuItem text={locale.translation("toggleDeveloperTools")} icon='bug' onClick={()=>this.getWebContents(this.props.tab).openDevTools()}/>
      <div className="divider" />

      {/*<NavbarMenuItem text={locale.translation("importBrowserData")} icon='sign in' onClick={()=>ipc.send("import-browser-data",{})}/>*/}
      {/*<NavbarMenuItem text={locale.translation('exportBookmarks')} icon='sign out' onClick={()=>ipc.send("export-bookmark",{})}/>*/}
      <NavbarMenuItem text='Sync Datas' icon='exchange' onClick={()=>ipc.send("start-sync",this.props.k)}/>
      <div className="divider" />

      <NavbarMenuItem text='Close This Panel' icon='close' onClick={()=>PubSub.publish(`close-panel_${this.props.k}`)}/>
      <NavbarMenuItem text={locale.translation("closeWindow")} icon='remove circle' onClick={MenuOperation.windowClose}/>
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

  favoriteDataHandle(menuItems,ret){
    menuItems.splice(0, menuItems.length);
    let i = 0
    for(let item of ret){
      const favicon = (item.favicon != "undefined" && localStorage.getItem(item.favicon)) || "resource/file.png"
      menuItems.push(<NavbarMenuItem key={i++} favicon={favicon} text={item.title} onClick={_=>this.navigate(item.url)} />)
      if(i > 100) break
    }
    return menuItems
  }

  favoriteMenu(cont){
    const menuItems = []
    return <NavbarMenu k={this.props.k} isFloat={isFloatPanel(this.props.k)} ref="favoriteMenu" className="scrolling" title={locale.translation('bookmarks')} icon="star" onClick={_=>_} timeOut={50}>
      <NavbarMenuItem bold={true} text='Navigate to the Bookmark Page' onClick={_=>this.onCommon("favorite")} />
      <div className="divider" />
      <NavbarMenuItem bold={true} text='Add this page to the Bookmarks' onClick={_=>this.onAddFavorite(this.props.page.location,this.props.page.title,this.props.page.favicon)} />
      <div className="divider" />
      <div role="option" className="item favorite">
        <FavoriteExplorer cont={cont} items={[{
          name: 'Favorite',
          path: 'root',
          type: 'directory',
          expanded: true,
          children: [],
          onClick: _=> this.refs.favoriteMenu.setState({visible:false})
        }]} />
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

  historyMenu(cont){
    const menuItems = []
    return <NavbarMenu k={this.props.k} isFloat={isFloatPanel(this.props.k)} className="scrolling" title={locale.translation('history')} icon="history" openPromise={this.fetchHistoryDate} onClick={this.historyDataHandle.bind(this,menuItems)}>
      <NavbarMenuItem bold={true} text='Navigate to the History Page' onClick={_=>this.onCommon("history")} />
      <div className="divider" />
    </NavbarMenu>
  }

  getTitle(x,historyMap){
    console.log(997,historyMap.get(x))
    const datas = historyMap.get(x)
    return datas ? <div className="favi-wrap"><img src={datas[1]} className="favi"/>{datas[0]}</div> : datas && datas[0] ? datas[0] : x
  }


  render() {
    const isFixed = isFixedPanel(this.props.k)
    const isFloat = isFloatPanel(this.props.k)
    console.log("rend")
    const _rich = (this.props.richContents || [])
    const map = new Map()
    for(let r of _rich){
      map.set(r.url,r)
    }
    const rich = [...map.values()]

    // const cacheItems = this.getCacheMediaItems()
    const cont = this.props.wv ? this.getWebContents(this.props.tab) : undefined

    const historyList = []
    let histNum,currentIndex
    if(cont){
      histNum = cont.getEntryCount()
      currentIndex = cont.getCurrentEntryIndex()
      for(let i=0;i<histNum;i++){
        historyList.push(cont.getURLAtIndex(i))
      }
    }

    const navbarStyle = this.props.toggleNav == 2 ? {visibility: "hidden"} : this.props.toggleNav == 3 ? {zIndex: 2, position: "sticky", top: 27} : {}
    // this.props.toggleNav == 1 ? {width : this.props.isTopRight ? '55%' : '50%',float: 'right'} : {}


    return <div className={`navbar-main browser-navbar${isFixed && !isFloat ? " fixed-panel" : ""}`} ref="navbar"  onDragOver={(e)=>{e.preventDefault();return false}}
                onDrop={(e)=>{e.preventDefault();return false}} style={navbarStyle}>
      {/*<BrowserNavbarBtn title="Rewind" icon="home fa-lg" onClick={this.props.onClickHome} disabled={!this.props.page.canGoBack} />*/}

      {isDarwin && this.props.isTopRight && this.props.toggleNav == 1 ? <div style={{width: this.props.fullscreen ? 0 : 62}}/>  : null }

      <NavbarMenu k={this.props.k} mouseOver={true} isFloat={isFloatPanel(this.props.k)} className={`back-next ${this.props.page.canGoBack ? "" : " disabled"}`} title={locale.translation('back')} icon="angle-left fa-lg" onClick={e=>{this.props.onClickBack(e);this.forceUpdates=true}}>
        {(cont ? historyList.slice(0,currentIndex).reverse().map(
          (x,i)=><NavbarMenuItem key={i} text={this.getTitle(x,this.props.historyMap)} onClick={()=>{this.props.onClickIndex(currentIndex -i -1);this.forceUpdates=true}}/>) : "")}
      </NavbarMenu>


      <NavbarMenu k={this.props.k} mouseOver={true} isFloat={isFloatPanel(this.props.k)} className={`back-next ${this.props.page.canGoForward ? "" : " disabled"}`} title={locale.translation('forward')} icon="angle-right fa-lg" onClick={e=>{this.props.onClickForward(e);this.forceUpdates=true}} >
        {(cont ? historyList.slice(currentIndex+1).map(
          (x,i)=><NavbarMenuItem key={i} text={this.getTitle(x,this.props.historyMap)} onClick={()=>{this.props.onClickIndex(currentIndex +i +1);this.forceUpdates=true}}/>) : "")}
      </NavbarMenu>


      <BrowserNavbarBtn title={locale.translation('reload')} icon="repeat" onClick={this.props.onClickRefresh} disabled={!this.props.page.canRefresh} />

      <div className="input-group">
        <BrowserNavbarLocation ref="loc" wv={this.props.wv} navbar={this} onEnterLocation={this.props.onEnterLocation} onChangeLocation={this.props.onChangeLocation}
                               k ={this.props.k} onContextMenu={this.props.onLocationContextMenu} tab={this.props.tab} page={this.props.page} privateMode={this.props.privateMode} search={this.props.search}/>
      </div>

      <div className="navbar-margin" style={{width: this.props.toggleNav != 1 ? 0 : this.props.isTopRight ? '45%' : '50%',minWidth: this.props.toggleNav != 1 ? 0 :'80px',background: 'rgb(221, 221, 221)'}}
        onDoubleClick={isDarwin ? _=>{
          const win = remote.getCurrentWindow()
          if(win.isFullScreen()){}
          else if(win.isMaximized()){
            win.unmaximize()
          }
          else{
            win.maximize()
          }
        }: null}></div>
      {isFixed ? null : <SyncReplace ref="syncReplace" changeSyncMode={this.props.changeSyncMode} replaceInfo={this.props.replaceInfo} updateReplaceInfo={this.props.updateReplaceInfo}/>}
      {isFixed ? null : <BrowserNavbarBtn title="Switch Sync Scroll" icon="circle-o" sync={this.props.sync && !this.props.replaceInfo}
                                          onClick={()=>{this.props.changeSyncMode();this.refs.syncReplace.clearAllCheck()}}/>}
      {isFixed || !this.props.sync || this.props.replaceInfo || !this.props.isTopLeft ? null : <FloatSyncScrollButton toggleNav={this.props.toggleNav} scrollPage={this.props.scrollPage}/>}

      {isFloat ? null: <BrowserNavbarBtn title="Switch Opposite Open" icon="external-link-square" sync={this.props.oppositeMode} onClick={()=>{this.props.changeOppositeMode()}}/>}


      {isFixed ? null : <NavbarMenu k={this.props.k} mouseOver={true} isFloat={isFloatPanel(this.props.k)} title="Open Sidebar" icon="list-ul" onClick={()=>this.props.fixedPanelOpen({dirc:mainState.sideBarDirection})}>
        <NavbarMenuItem key="Left" text="Left" icon="caret left" onClick={()=>this.props.fixedPanelOpen({dirc:"left"})}/>
        <NavbarMenuItem key="Right" text="Right" icon="caret right" onClick={()=>this.props.fixedPanelOpen({dirc:"right"})}/>
        <NavbarMenuItem key="Bottom" text="Bottom" icon="caret down" onClick={()=>this.props.fixedPanelOpen({dirc:"bottom"})}/>
      </NavbarMenu>}

      <BrowserNavbarBtn title="Change to Mobile UserAgent" icon="mobile" styleFont={{fontSize: 20}} sync={this.state.mobile}
                        onClick={::this.handleUserAgent}/>

      {isFixed && !isFloat ? null : this.favoriteMenu(cont)}
      {isFixed && !isFloat ? null : this.historyMenu(cont)}

      <Dropdown scrolling className="nav-button" style={{minWidth:0}} trigger={<BrowserNavbarBtn title="Rich Media List" icon="film" />} pointing='top right' icon={null} disabled={!rich || !rich.length}>
        <Dropdown.Menu className="nav-menu">
          {(!rich||!rich.length) ? null : rich.map((e,i)=>{
            const url = e.url
            return <Dropdown.Item key={i} icon={e.type == "audio" ? "music" : e.type }
                                  onClick={()=>this.onMediaDownload(url,e.fname)}>
              {`${e.fname}  ${e.size ? this.getAppropriateByteUnit(e.size).join("") : ""}`}
              <button className="play-btn"  onClick={e=>{
                e.stopPropagation()
                const p = e.target.parentNode.parentNode;(e.target.tagName == "I" ? p.parentNode : p).classList.remove("visible")
                cont.hostWebContents.send('new-tab', this.props.tab.wvId, url)
              }}>
                <i className="fa fa-play" aria-hidden="true"></i>
              </button>
              <button className="clipboard-btn" data-clipboard-text={url}
                      onClick={e=>{e.stopPropagation();const p = e.target.parentNode.parentNode;(e.target.tagName == "IMG" ? p.parentNode : p).classList.remove("visible")}}>
                <img width="13" src="data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjEwMjQiIHdpZHRoPSI4OTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHBhdGggZD0iTTEyOCA3NjhoMjU2djY0SDEyOHYtNjR6IG0zMjAtMzg0SDEyOHY2NGgzMjB2LTY0eiBtMTI4IDE5MlY0NDhMMzg0IDY0MGwxOTIgMTkyVjcwNGgzMjBWNTc2SDU3NnogbS0yODgtNjRIMTI4djY0aDE2MHYtNjR6TTEyOCA3MDRoMTYwdi02NEgxMjh2NjR6IG01NzYgNjRoNjR2MTI4Yy0xIDE4LTcgMzMtMTkgNDVzLTI3IDE4LTQ1IDE5SDY0Yy0zNSAwLTY0LTI5LTY0LTY0VjE5MmMwLTM1IDI5LTY0IDY0LTY0aDE5MkMyNTYgNTcgMzEzIDAgMzg0IDBzMTI4IDU3IDEyOCAxMjhoMTkyYzM1IDAgNjQgMjkgNjQgNjR2MzIwaC02NFYzMjBINjR2NTc2aDY0MFY3Njh6TTEyOCAyNTZoNTEyYzAtMzUtMjktNjQtNjQtNjRoLTY0Yy0zNSAwLTY0LTI5LTY0LTY0cy0yOS02NC02NC02NC02NCAyOS02NCA2NC0yOSA2NC02NCA2NGgtNjRjLTM1IDAtNjQgMjktNjQgNjR6IiAvPgo8L3N2Zz4K"/>
              </button>
            </Dropdown.Item>
          })}
        </Dropdown.Menu>
      </Dropdown>

      {this.mainMenu(cont)}
      {isFixed && !isFloat ? <BrowserNavbarBtn style={{fontSize:18}} title="Hide Sidebar" icon={`angle-double-${isFixed == 'bottom' ? 'down' : isFixed}`} onClick={()=>this.props.fixedPanelOpen({dirc:isFixed})}/> : null}
      {!isDarwin && this.props.isTopRight && this.props.toggleNav == 1 ? <RightTopBottonSet style={{lineHeight: 0.9, transform: 'translateX(6px)',paddingTop: 1}}/> : null }

      {isFloat ? <div className="title-button-set" style={{lineHeight: 0.9, transform: 'translateX(6px)'}}>
        <span className="typcn typcn-media-stop-outline" onClick={()=>PubSub.publish(`maximize-float-panel_${this.props.k}`)}></span>
        <span className="typcn typcn-times" onClick={()=>PubSub.publish(`close-panel_${this.props.k}`)}></span>
      </div> : null}

      {/*<Dropdown scrolling className="nav-button" onClick={()=>{this.getCacheMediaList().then(_=>_)}} trigger={<BrowserNavbarBtn title="Cache Media List" icon="database" />} pointing='top right' icon={null}>*/}
      {/*<Dropdown.Menu className="nav-menu">*/}
      {/*{cacheItems}*/}
      {/*</Dropdown.Menu>*/}
      {/*</Dropdown>*/}

    </div>
  }
}

export default {BrowserNavbar,alwaysOnTop}
