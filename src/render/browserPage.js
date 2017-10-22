const path = require('path')
const React = require('react')
const uuid = require("node-uuid")
import ReactDOM from 'react-dom'
const {Component} = React
const ipc = require('electron').ipcRenderer
const PubSub = require('./pubsub');
const {remote} = require('electron');
const {Menu} = remote
const fs = remote.require('fs')
const BrowserPageSearch = require('./BrowserPageSearch')
const BrowserPageStatus = require('./BrowserPageStatus')
const AutofillPopup = require('./AutofillPopup')
const isDarwin = navigator.userAgent.includes('Mac OS X')
// const isWin = navigator.userAgent.includes('Windows')

function webviewHandler (self, fnName) {
  return function (e) {
    if (self.props[fnName])
      self.props[fnName](e, self.props.tab.page)
  }
}

const webviewEvents = {
  'guest-ready': 'onGuestReady',
  'load-commit': 'onLoadCommit',
  // 'did-start-loading': 'onDidStartLoading',
  // 'did-stop-loading': 'onDidStopLoading',
  'did-finish-load': 'onDidFinishLoading',
  'did-fail-load': 'onDidFailLoad',
  'did-fail-provisional-load':'onDidFailLoad',
  'did-frame-finish-load': 'onDidFrameFinishLoad',
  'did-get-redirect-request': 'onDidGetRedirectRequest',
  'dom-ready': 'onDomReady',
  // 'page-title-updated': 'onPageTitleSet',
  // 'close': 'onClose',
  // 'destroyed': 'onDestroyed',
  // 'ipc-message': 'onIpcMessage',
  // 'console-message': 'onConsoleMessage',
  'page-favicon-updated': 'onFaviconUpdate',
  // 'new-window': "onNewWindow",
  // 'will-navigate' : "onWillNavigate",
  // 'did-navigate' : "onDidNavigate",
  'load-start' : "onLoadStart",
  // 'did-navigate-in-page' : 'onDidNavigateInPage',
  'update-target-url' : 'onUpdateTargetUrl'
}

class BrowserPage extends Component {
  constructor(props) {
    super(props)
    this.state = {isSearching: false,src:this.props.tab.guestInstanceId === (void 0) ? this.props.tab.page.navUrl : (void 0)}
    this.wvEvents = {}
  }


  componentDidMount() {
    const webview = this.refs.webview
    // if(isWin) webview.webpreferences = `defaultFontFamily: {standard: 'Meiryo UI', serif: 'MS PMincho', sansSerif: 'Meiryo UI', monospace: 'MS Gothic'}`

    // webview.addEventListener('did-fail-provisional-load', (e) => {
    //   console.log(e)
    // })
    webview.plugins = true
    // webview.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.109 Safari/537.366'

    if(this.props.tab.guestInstanceId){
      webview.attachGuest(this.props.tab.guestInstanceId)
      console.log("webview.attachGuest(this.props.tab.guestInstanceId)",this.props.tab.guestInstanceId)
    }

    if(this.props.tab.privateMode){
      webview.partition = this.props.tab.privateMode
      webview.setAttribute('src', this.state.src)
      ipc.send('init-private-mode',this.props.tab.privateMode)
    }
    console.log(this.props.tab.privateMode)

    for (var k in webviewEvents)
      webview.addEventListener(k, webviewHandler(this, webviewEvents[k]))

    this.wvEvents['ipc-message'] = (e, page) =>{
      if(e.channel == 'webview-scroll'){
        PubSub.publishSync("scroll-sync-webview",{sync:this.props.tab.sync,...e.args[0]})
      }
      else if(e.channel == 'link-drop'){
        console.log(e)
        const {screenX,screenY,url,text} = e.args[0]
        const cont = e.sender

        const wx = window.screenX
        const wy = window.screenY

        const ele = document.elementFromPoint(screenX - wx, screenY - wy)
        if(ele.tagName == "WEBVIEW"){
          const dropped = ele.dataset.key
          const src = e.target.dataset.key
          if(src !== dropped){
            if(url){
              ele.loadURL(url)
            }
            else{
              PubSub.publish(`drag-search_${ele.className.slice(1)}`,{key:ele.dataset.key, text})
            }
          }
        }
      }
    }
    webview.addEventListener('ipc-message',this.wvEvents['ipc-message'])

    this.wvEvents['found-in-page'] = (e) => {
      this.clear = e.result.activeMatchOrdinal == e.result.matches
      this.first = e.result.activeMatchOrdinal == 1
      console.log(this.clear,e.result.activeMatchOrdinal, e.result.matches)
      if (e.result.activeMatchOrdinal) {
        this.setState({result_string: `${e.result.activeMatchOrdinal}/${e.result.matches}`})
      }
      else{
        this.setState({result_string: "0/0"})
      }
    }
    webview.addEventListener('found-in-page',this.wvEvents['found-in-page'] )

    const tokenDidStartLoading = PubSub.subscribe(`did-start-loading_${this.props.tab.key}`,_=>{
      this.setState({isSearching: false})

    })
    //
    // webview.addEventListener('will-detach',e=>console.log('will-detach',e))
    // webview.addEventListener('did-detach',e=>console.log('did-detach',e))
    // webview.addEventListener('guest-ready',e=>console.log('guest-ready',e))

    this.tokenWebviewKeydown = PubSub.subscribe("webview-keydown",(msg,e)=>{
      if(e.wv === webview) this.onHandleKeyDown(e.event)
    })

    this.refs.browserPage.addEventListener('wheel',::this.handleWheel,{passive: true})

    this.props.tab.returnWebView(webview)
    this.props.tab.guestInstanceId = (void 0)

    PubSub.publish(`regist-webview_${this.props.k}`,this.props.tab)

    this.searchEvent = (e, name, id, args)=> {
      const tab = this.props.tab
      if (!tab.wvId || id !== tab.wvId) return

      if(name == 'findOnPage'){
        this.setState({isSearching: true})
        this.refs.browserPage.querySelector('.browser-page-search input').focus()
      }
      else if(name == 'findNext'){
        if(this.state.isSearching) this.onPageSearch(this.previous_text)
      }
      else if(name == 'findPrevious'){
        if(this.state.isSearching) this.onPageSearch(this.previous_text,false)
      }

    }
    ipc.on('menu-or-key-events', this.searchEvent)

    console.log("BrowserPage componentDidMount(",webview,this.props)
  }

  componentWillUnmount() {
    for (var k in webviewEvents)
      this.refs.webview.removeEventListener(k, webviewHandler(this, webviewEvents[k]))

    for(var [k,v] in this.wvEvents){
      this.refs.webview.removeEventListener(k, v)
    }

    PubSub.unsubscribe(this.tokenWebviewKeydown)

    if(this.searchEvent)
      ipc.removeListener('menu-or-key-events', this.searchEvent)
  }


  // shouldComponentUpdate(nextProps, nextState) {
  //   const ret = !(this.isActive === nextProps.isActive &&
  //   this.isSearching === nextProps.page.isSearching &&
  //   this.location === nextProps.page.location &&
  //   this.statusText === nextProps.page.statusText)
  //
  //   this.isActive = this.props.isActive
  //   this.isSearching = this.props.page.isSearching
  //   this.location = this.props.page.location
  //   this.statusText = this.props.page.statusText
  //   return ret
  // }

  onPageSearch(query,next=true) {
    const webview = ReactDOM.findDOMNode(this.refs.webview)
    const cont = this.getWebContents(this.props.tab)
    if(!cont) return
    const clear = (this.clear && next) || (this.first && !next) //@TODO framework bug
    if(clear){
      webview.stopFindInPage('clearSelection')
    }
    console.log(this.previous_text === query)
    if(query === ""){
      webview.stopFindInPage('clearSelection')
      this.previous_text = ""
      this.setState({result_string: ""})
    }
    else if (this.previous_text === query && !clear) {
      webview.findInPage(query, {
        matchCase:false,
        forward: next,
        findNext: true
      })
    }
    else {
      this.previous_text = query;
      webview.findInPage(query,{forward: next})
    }
  }

  onHandleKeyDown(e){
    if (e.keyCode == 27) { // ESC
      this.onClose(e)
    }
    else if (e.keyCode == 116) { // F5
      const cont = this.getWebContents(this.props.tab)
      cont && cont.reload()
    }
  }

  handleWheel(e){
    if(isDarwin || !(e.ctrlKey || e.metaKey)) return
    const webContents = this.getWebContents(this.props.tab)
    if(webContents) {
      console.log(webContents)
      if(e.deltaY > 0){
        webContents.zoomOut()
      }
      else{
        webContents.zoomIn()
      }
      const percent = webContents.getZoomPercent()
      PubSub.publish(`zoom_${this.props.tab.key}`,percent)
    }
  }

  onClose(e){
    this.refs.webview.stopFindInPage('clearSelection')
    this.previous_text = ""
    this.setState({result_string: "", isSearching: false})
  }

  getWebContents(tab){
    if(!tab.wv || !tab.wvId) return
    return global.currentWebContents[tab.wvId]
  }

  render() {
    // console.log("BrowserPage")
    // const preload = path.join(__dirname, './preload/mainPreload.js')
    return <div className="browser-page" ref="browserPage"  onKeyDown={::this.onHandleKeyDown}>
      <BrowserPageSearch isActive={this.state.isSearching} onPageSearch={::this.onPageSearch} progress={this.state.result_string} onClose={::this.onClose}/>
      <webview ref="webview" className={`w${this.props.k2}`} data-key={this.props.k} src={this.props.tab.privateMode ? (void 0) : this.state.src}/>
      <BrowserPageStatus tab={this.props.tab}/>
      <AutofillPopup k={this.props.k} pos={this.props.pos}/>
    </div>
  }
}


export default {BrowserPage : BrowserPage}