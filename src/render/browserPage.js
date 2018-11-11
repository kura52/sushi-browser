import ResizeObserver from "resize-observer-polyfill";

const path = require('path')
const React = require('react')
const uuid = require("node-uuid")
import ReactDOM from 'react-dom'
const {Component} = React
const ipc = require('electron').ipcRenderer
const PubSub = require('./pubsub');
const {remote} = require('electron');
const {Menu} = remote
const BrowserPageSearch = require('./BrowserPageSearch')
const AutofillPopup = require('./AutofillPopup')
const isDarwin = navigator.userAgent.includes('Mac OS X')
const sharedState = require('./sharedState')
const mainState = require('./mainStateRemote')
const DevToolsPanel = require('./DevToolsPanel')
const MobilePanel = require('./MobilePanel')
const StatusBar = require('./StatusBar')
// const isWin = navigator.userAgent.includes('Windows')

const refs2 = {}
const STATUS_BAR_HEIGHT = 20

function stringEscape(string){
  return ('' + string).replace(/['\\\n\r\u2028\u2029]/g, function (character) {
    // Escape all characters not included in SingleStringCharacters and
    // DoubleStringCharacters on
    // http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.4
    switch (character) {
      case "'":
      case '\\':
        return '\\' + character
      // Four possible LineTerminator characters need to be escaped:
      case '\n':
        return '\\n'
      case '\r':
        return '\\r'
      case '\u2028':
        return '\\u2028'
      case '\u2029':
        return '\\u2029'
    }
  })
}

function webviewHandler (self, fnName) {
  return function (e,...args) {
    if (self.props[fnName])
      self.props[fnName](e, self.props.tab.page, ...args)
  }
}

const webviewEvents = {
  // 'guest-ready': 'onGuestReady',
  // 'will-attach-webview': 'onTabIdChanged', //@TODO ELECTRON
  'load-commit': 'onLoadCommit',
  // 'did-start-loading': 'onDidStartLoading',
  'did-stop-loading': 'onDidStopLoading',
  'did-finish-load': 'onDidFinishLoading',
  'did-fail-load': 'onDidFailLoad',
  // 'did-fail-provisional-load':'onDidFailLoad',
  // 'did-frame-finish-load': 'onDidFrameFinishLoad',
  // 'did-redirect-navigation': 'onDidGetRedirectRequest',
  'dom-ready': 'onDomReady',
  // 'page-title-updated': 'onPageTitleSet',
  // 'close': 'onClose',
  // 'destroyed': 'onDestroyed',
  // 'ipc-message': 'onIpcMessage',
  // 'console-message': 'onConsoleMessage',
  'page-favicon-updated': 'onFaviconUpdate',
  // 'new-window': "onNewWindow",
  // 'will-navigate' : "onWillNavigate",
  'did-navigate' : "onDidNavigate",
  'did-start-navigation' : "onLoadStart", //@TODO ELECTRON
  // 'did-navigate-in-page' : 'onDidNavigateInPage',
  'update-target-url' : 'onUpdateTargetUrl',
  'cursor-changed': 'onCursorChanged'
}

class BrowserPage extends Component {
  constructor(props) {
    super(props)
    this.state = {isSearching: false,src:this.props.tab.guestInstanceId === (void 0) ? this.props.tab.page.navUrl : (void 0)}
    this.wvEvents = {}
    this.refs2 = {}

    this.handleMouseDown = ::this.handleMouseDown
    this.handleMouseUp = ::this.handleMouseUp
    this.handleWheel = ::this.handleWheel
    this.handleMouseMove = ::this.handleMouseMove
    this.handleMouseEnter = ::this.handleMouseEnter
    this.handleMouseLeave = ::this.handleMouseLeave
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('componentDidUpdate',prevProps, this.props)
    const style = this.props.pos
    if(style.zIndex > 0 && (prevProps.pos.top != style.top ||
      prevProps.pos.left != style.left ||
      prevProps.pos.width != style.width ||
      prevProps.pos.height != style.height ||
      prevProps.pos.zIndex != style.zIndex)){
      ipc.send('set-bound-browser-view', this.props.k2, this.props.k, style.left, style.top, style.width, style.height, style.zIndex)
    }
  }

  componentDidMount() {
    this.refs2.browserPage = this.$LI.dom
    this.refs2.bps = this.$LI.children[0].children
    this.refs2.webview = this.$LI.dom.querySelector(`.w${this.props.k2}`)

    // const webview = this.refs2.webview
    const style = this.props.pos
    let tabId
    if(this.props.tab.guestInstanceId){
      tabId = this.props.tab.guestInstanceId
      ipc.send('move-browser-view', this.props.k2, this.props.k, 'attach', tabId,
        style.left, style.top, style.width, style.height, style.zIndex, true)
    }
    else{
      tabId = ipc.sendSync('create-browser-view', this.props.k2, this.props.k, style.left, style.top,
        style.width, style.height, style.zIndex, this.props.tab.privateMode ? (void 0) : this.state.src)
    }
    const webview = remote.webContents.fromId(tabId)
    this.webview = webview
    // const shadow = webview.shadowRoot.querySelector('object') //@TODO ELECTRON

    // webview.plugins = true
    // webview.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.109 Safari/537.366'

    this.props.tab.guestInstanceId = void 0

    if(this.props.tab.privateMode){
      const key = this.props.tab.key
      webview.partition = this.props.tab.privateMode
      ipc.send('init-private-mode',key,this.props.tab.privateMode)
      ipc.once(`init-private-mode-reply_${key}`,_=>webview.setAttribute('src', this.state.src))

    }
    console.log(this.props.tab.privateMode)

    for (var k in webviewEvents)
      webview.on(k, webviewHandler(this, webviewEvents[k]),{passive:true})

    // const supportedWebViewEvents = [
    //   'load-commit',
    //   'did-attach',
    //   'did-finish-load',
    //   'did-fail-load',
    //   // 'did-frame-finish-load',
    //   'did-start-loading',
    //   'did-stop-loading',
    //   'dom-ready',
    //   // 'console-message',
    //   'context-menu',
    //   'devtools-opened',
    //   'devtools-closed',
    //   'devtools-focused',
    //   'new-window',
    //   'will-navigate',
    //   'did-start-navigation',
    //   'did-navigate',
    //   // 'did-frame-navigate',
    //   'did-navigate-in-page',
    //   'focus-change',
    //   'close',
    //   'crashed',
    //   'gpu-crashed',
    //   'plugin-crashed',
    //   'destroyed',
    //   'page-title-updated',
    //   'page-favicon-updated',
    //   'enter-html-full-screen',
    //   'leave-html-full-screen',
    //   'media-started-playing',
    //   'media-paused',
    //   'found-in-page',
    //   'did-change-theme-color',
    //   'update-target-url',
    //   'cursor-changed'
    // ]
    //
    // for(let name of supportedWebViewEvents){
    //   webview.on(name, (e,...args)=>{
    //     console.log(54555531,name,e,...args)
    //   })
    // }

    this.wvEvents[`send-to-host_${tabId}`] = (e, msg, ...args) =>{
      if(msg == 'webview-scroll'){
        PubSub.publishSync("scroll-sync-webview",{sync:this.props.tab.sync,...args[0]})
      }
      else if(msg == 'link-drop'){ //@TODO ELECTRON
        console.log(e)
        const {screenX,screenY,url,text} = args[0]
        const cont = e.sender

        const rect = e.target.getBoundingClientRect()
        const wx = rect.x
        const wy = rect.y

        const ele = document.elementFromPoint(screenX - window.screenX + wx, screenY - window.screenY + wy)
        if(ele.tagName == "WEBVIEW"){
          const dropped = ele.dataset.key
          const src = e.target.dataset.key
          if(src !== dropped){
            if(url){
              PubSub.publish(`drag-search_${ele.className.slice(1)}`,{key:ele.dataset.key, url,text})
            }
            else{
              PubSub.publish(`drag-search_${ele.className.slice(1)}`,{key:ele.dataset.key, text})
            }
          }
        }
      }
      else if(msg == 'webview-mousedown' || msg == 'webview-mouseup'){
        const button = args[0]
        PubSub.publishSync(msg,{target: this.refs2.webview, button})
      }
      else if(msg == 'webview-mousemove'){
        const clientY = args[0]
        PubSub.publishSync(msg,{ target: this.refs2.webview, offsetY: clientY /*+ this.refs2.webview.getBoundingClientRect().y*/})
      }
      else if(msg == 'webview-keydown'){
        PubSub.publishSync(msg,{ target: this.refs2.webview, ...args[0]})
      }
    }
    ipc.on(`send-to-host_${tabId}`,this.wvEvents[`send-to-host_${tabId}`])

    // this.wvEvents['found-in-page'] = (e) => {
    //   this.clear = e.result.activeMatchOrdinal == e.result.matches   //@TODO framework bug
    //   this.first = e.result.activeMatchOrdinal == 1   //@TODO framework bug
    //   if (e.result.activeMatchOrdinal) {
    //     this.setState({result_string: `${e.result.activeMatchOrdinal}/${e.result.matches}`})
    //   }
    //   else{
    //     this.setState({result_string: "0/0"})
    //   }
    // }

    this.wvEvents['found-in-page'] = (e, result) => {
      if (result.activeMatchOrdinal) {
        this.setState({result_string: `${result.activeMatchOrdinal}/${result.matches}`})
      }
      else{
        this.setState({result_string: "0/0"})
      }
    }

    webview.on('found-in-page',this.wvEvents['found-in-page'])

    this.tokenDidNavigate = PubSub.subscribe(`did-navigate_${this.props.tab.key}`,_=>{
      this.setState({isSearching: false})
    })

    this.tokenWebviewKeydown = PubSub.subscribe("webview-keydown",(msg,e)=>{
      if(e.target === this.refs2.webview) this.onHandleKeyDown(e)
    })

    console.log("returnWebView",webview, tabId, this.refs2.webview)
    const tab = remote.webContents.fromId(tabId)
    global.currentWebContents[tabId] = tab
    this.props.tab.returnWebView(webview, tabId, this.refs2.webview)
    this.props.tab.guestInstanceId = (void 0)

    PubSub.publish(`regist-webview_${this.props.k}`,this.props.tab)

    this.searchEvent = async (e, name, id, word, type, toggle)=> {
      const tab = this.props.tab
      if (!tab.wvId || id !== tab.wvId) return

      if(name == 'toggleFindOnPage'){
        name = 'findOnPage'
        toggle = true
      }

      if(name == 'findOnPage'){
        if(word){
          this.refs2.bps.setState({value: word})
          if(type == 'OR') this.refs2.bps.or = true
        }
        else{
          if(toggle && this.state.isSearching){
            return this.setState({isSearching: false})
          }
          await new Promise(r=>{
            webview.executeJavaScript('window.getSelection().toString()', (result)=>{
              if(result) this.refs2.bps.setState({value: result})
              r()
            })
          })
        }
        this.setState({isSearching: true})
        this.refs2.bps.setState({focus: true})
      }
      else if(name == 'findNext'){
        if(this.state.isSearching) this.onPageSearch(this.previous_text)
      }
      else if(name == 'findPrevious'){
        if(this.state.isSearching) this.onPageSearch(this.previous_text,false)
      }

    }
    ipc.on('menu-or-key-events', this.searchEvent)

    this.changeSizeEvent = (e,tabKeyOrTabId,key,width,height,reply)=>{
      if(this.props.tab.key !== tabKeyOrTabId && this.props.tab.wvId !== tabKeyOrTabId) return
      this.refs2.webview.style.width = width
      this.refs2.webview.style.height = height
      if(reply) setTimeout(_=>ipc.send(`webview-size-change-reply_${key}`),1200)
    }
    ipc.on('webview-size-change', this.changeSizeEvent)

    console.log("BrowserPage componentDidMount(",webview,this.props)
  }

  componentWillUnmount() {
    console.log('delete-browser-view', this.props.k2, this.props.k)
    for (let k in webviewEvents)
      this.webview.removeListener(k, webviewHandler(this, webviewEvents[k]))

    for(let [k,v] of Object.entries(this.wvEvents)){
      this.webview.removeListener(k, v)
    }
    this.refs2.webview = null

    PubSub.unsubscribe(this.tokenWebviewKeydown)
    PubSub.unsubscribe(this.tokenDidNavigate)

    if(this.searchEvent) ipc.removeListener('menu-or-key-events', this.searchEvent)
    if(this.changeSizeEvent) ipc.removeListener('webview-size-change', this.changeSizeEvent)

    ipc.send('delete-browser-view', this.props.k2, this.props.k)
    // this.getWebContents(this.props.tab).destroy()

    // ipc.send('close-tab-pretask',this.props.tab.wvId)
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

  complexReset() {
    ipc.send('start-complex-search','aa',this.props.tab.wvId,`window.__complex_search_define__ && window.__complex_search_define__.reset_all()`,true)
  }

  onPageSearch(query,next=true,matchCase,or,reg) {
    console.log(555,query)
    const webview = this.refs2.webview
    const cont = this.getWebContents(this.props.tab)
    if(!cont) return

    if(or || reg){
      ipc.send('find-event',this.props.tab.wvId,'stopFindInPage','clearSelection')
      this.previous_text = "__complex_search__"

      if(query === ""){
        this.complexReset()
        this.setState({result_string: ""})
      }
      else{
        let operation
        if(next){
          operation =  `window.__complex_search_define__.itel_main('${reg ? '@RE:' : ''}${stringEscape(query)}',true,${!!matchCase})
      window.__complex_search_define__.scrollFocusNext('itel-highlight', 'itel-selected')`
        }
        else{
          operation =  `window.__complex_search_define__.scrollFocusPrev('itel-highlight', 'itel-selected')`
        }
        const key = uuid.v4()
        clearTimeout(this.timer)
        this.timer = setTimeout(_=>{
          ipc.send('start-complex-search',key,this.props.tab.wvId,operation,!next)
          ipc.once(`start-complex-search-reply_${key}`, (e,result)=>{
            console.log(54353,result)
            this.setState({result_string: result})
          })
        },300)
      }
      return
    }
    else{
      this.complexReset()
    }

    if(query === ""){
      console.log(789,query)
      ipc.send('find-event',this.props.tab.wvId,'stopFindInPage','clearSelection')
      this.previous_text = ""
      this.setState({result_string: ""})
    }
    else if (this.previous_text === query) {
      if(query) ipc.send('find-event',this.props.tab.wvId,'findInPage',query, {
        matchCase,
        forward: next,
        findNext: true
      })
    }
    else {
      this.previous_text = query;
      if(query){
        ipc.send('find-event',this.props.tab.wvId,'findInPage',query,{matchCase,forward: next})
      }
    }
  }

  onHandleKeyDown(e){
    if (e.keyCode == 27) { // ESC
      this.onClose(e,true)
    }
    else if (e.keyCode == 116) { // F5
      const cont = this.getWebContents(this.props.tab)
      cont && cont.reload()
    }
  }

  // handleWheel(e){
  //   if(isDarwin || !(e.ctrlKey || e.metaKey)) return
  //   e.preventDefault()
  //   const webContents = this.getWebContents(this.props.tab)
  //   if(webContents) {
  //     console.log(webContents)
  //     const zoomBehavior = mainState.zoomBehavior
  //     if(e.deltaY > 0){
  //       if(zoomBehavior == 'chrome'){
  //         webContents.zoomOut()
  //       }
  //       else{
  //         webContents.setZoomLevel(sharedState.zoomMapping.get(webContents.getZoomPercent() - parseInt(zoomBehavior)))
  //       }
  //     }
  //     else{
  //       if(zoomBehavior == 'chrome'){
  //         webContents.zoomIn()
  //       }
  //       else{
  //         webContents.setZoomLevel(sharedState.zoomMapping.get(webContents.getZoomPercent() + parseInt(zoomBehavior)))
  //       }
  //     }
  //     const percent = webContents.getZoomPercent()
  //     PubSub.publish(`zoom_${this.props.tab.key}`,percent)
  //   }
  // }

  onClose(e,stopAutoHighlight){
    if(stopAutoHighlight){
      let tabId = this.props.tab.wvId
      while(true){
        if(!tabId) break
        if(sharedState.searchWords[tabId]){
          delete sharedState.searchWords[tabId]
          break
        }
        tabId = sharedState.tabValues[tabId]
      }
    }
    this.webview.stopFindInPage('clearSelection')
    this.complexReset()
    this.previous_text = ""
    this.setState({result_string: "", isSearching: false})
  }

  getWebContents(tab){
    if(!tab.wv || !tab.wvId) return
    return global.currentWebContents[tab.wvId]
  }

  handleMouseDown(e){
    if(e.target.className !== 'browser-page') return
    const modifiers = []
    if(e.shiftKey) modifiers.push('shift')
    if(e.ctrlKey) modifiers.push('control')
    if(e.altKey) modifiers.push('alt')
    if(e.metaKey) modifiers.push('meta')
    this.webview.sendInputEvent({ type: 'mouseDown',x: e.offsetX, y: e.offsetY, modifiers,
      button: e.button == 0 ? 'left' : e.button == 1 ? 'middle' : 'right',clickCount: 1})
    if(!this.webview.isFocused()) this.webview.focus()
  }

  handleMouseUp(e){
    if(e.target.className !== 'browser-page') return
    const modifiers = []
    if(e.shiftKey) modifiers.push('shift')
    if(e.ctrlKey) modifiers.push('control')
    if(e.altKey) modifiers.push('alt')
    if(e.metaKey) modifiers.push('meta')
    this.webview.sendInputEvent({ type: 'mouseUp',x: e.offsetX, y: e.offsetY, modifiers,
      button: e.button == 0 ? 'left' : e.button == 1 ? 'middle' : 'right',clickCount: 1})

  }

  handleWheel(e){
    if(e.target.className !== 'browser-page') return
    this.webview.sendInputEvent({ type: 'mouseWheel', x: e.offsetX, y: e.offsetY,
      deltaX: e.deltaX && e.deltaX * -1, deltaY: e.deltaY && e.deltaY * -1, canScroll: true})
  }

  handleMouseMove(e){
    if(e.target.className !== 'browser-page') return
    this.webview.sendInputEvent({ type: 'mouseMove',x: e.offsetX, y: e.offsetY})
  }

  handleMouseEnter(e){
    if(e.target.className !== 'browser-page') return
    this.webview.sendInputEvent({ type: 'mouseEnter',x: e.offsetX, y: e.offsetY})
  }

  handleMouseLeave(e){
    if(e.target.className !== 'browser-page') return
    this.webview.sendInputEvent({ type: 'mouseLeave',x: e.offsetX, y: e.offsetY})
  }

  render() {
    const devToolsInfo = this.props.tab.fields.devToolsInfo
    const hasDevToolsPanel = devToolsInfo && devToolsInfo.isPanel

    const webViewHeightModify = (hasDevToolsPanel && sharedState.statusBar) ? devToolsInfo.height + STATUS_BAR_HEIGHT :
      hasDevToolsPanel ? devToolsInfo.height : sharedState.statusBar ? STATUS_BAR_HEIGHT : null

    const style = webViewHeightModify ? {height: `calc(100% - ${webViewHeightModify}px)`} : {}

    const mobilePanel = this.props.tab.fields.mobilePanel

    if(mobilePanel && mobilePanel.isPanel) style.width = `calc(100% - ${mobilePanel.width + 1}px)`

    return <div className="browser-page" onKeyDown={::this.onHandleKeyDown} key={this.props.k}
                onMouseDown={this.handleMouseDown} onMouseUp={this.handleMouseUp} onWheel={this.handleWheel} onMouseMove={this.handleMouseMove}
                onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
      <BrowserPageSearch k={this.props.k2} tab={this.props.tab} isSelected={this.props.isActive} isActive={this.state.isSearching} onPageSearch={::this.onPageSearch} progress={this.state.result_string} onClose={::this.onClose} parent={this}/>
      {mobilePanel ? <MobilePanel tab={this.props.tab} mobilePanel={mobilePanel} parent={this} isActive={this.props.isActive}/> : null}
      <div className={`w${this.props.k2}`} key={this.props.k} data-webview="1" data-key={this.props.k} style={style}/>
      {hasDevToolsPanel ? <DevToolsPanel tab={this.props.tab} devToolsInfo={devToolsInfo} parent={this}
                                         style={style.width ? {width: style.width, display: 'inline-block'} : {}}/> : null}
      <AutofillPopup k={this.props.k}/>
      <StatusBar toggleNav={this.props.toggleNav} tab={this.props.tab} refs2={refs2}/>
    </div>
  }
}


export default {BrowserPage : BrowserPage}