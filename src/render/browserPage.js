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
const AutofillPopup = require('./AutofillPopup')
const isDarwin = navigator.userAgent.includes('Mac OS X')
const sharedState = require('./sharedState')
const mainState = remote.require('./mainState')
// const isWin = navigator.userAgent.includes('Windows')

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
  // 'did-frame-finish-load': 'onDidFrameFinishLoad',
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
  'did-navigate' : "onDidNavigate",
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
    const shadow = webview.querySelector("::shadow object")
    shadow.style.width = '100%'
    shadow.style.height = '100%'
    // if(isWin) webview.webpreferences = `defaultFontFamily: {standard: 'Meiryo UI', serif: 'MS PMincho', sansSerif: 'Meiryo UI', monospace: 'MS Gothic'}`

    // webview.addEventListener('did-fail-provisional-load', (e) => {
    //   console.log(e)
    // })
    webview.plugins = true
    // webview.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.109 Safari/537.366'

    if(this.props.tab.guestInstanceId){
      if(webview.attachGuest(this.props.tab.guestInstanceId)){
        this.props.tab.readyAttach = true
      }
      console.log("webview.attachGuest(this.props.tab.guestInstanceId)",this.props.tab.guestInstanceId)
    }

    if(this.props.tab.privateMode){
      const key = this.props.tab.key
      webview.partition = this.props.tab.privateMode
      ipc.send('init-private-mode',key,this.props.tab.privateMode)
      ipc.once(`init-private-mode-reply_${key}`,_=>webview.setAttribute('src', this.state.src))

    }
    console.log(this.props.tab.privateMode)

    for (var k in webviewEvents)
      webview.addEventListener(k, webviewHandler(this, webviewEvents[k]),{passive:true})

    this.wvEvents['ipc-message'] = (e, page) =>{
      if(e.channel == 'webview-scroll'){
        PubSub.publishSync("scroll-sync-webview",{sync:this.props.tab.sync,...e.args[0]})
      }
      else if(e.channel == 'link-drop'){
        console.log(e)
        const {screenX,screenY,url,text} = e.args[0]
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
    }
    webview.addEventListener('ipc-message',this.wvEvents['ipc-message'],{passive:true})

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

    this.wvEvents['found-in-page'] = (e) => {
      if (e.result.activeMatchOrdinal) {
        this.setState({result_string: `${e.result.activeMatchOrdinal}/${e.result.matches}`})
      }
      else{
        this.setState({result_string: "0/0"})
      }
    }

    webview.addEventListener('found-in-page',this.wvEvents['found-in-page'],{passive:true})

    this.tokenDidNavigate = PubSub.subscribe(`did-navigate_${this.props.tab.key}`,_=>{
      this.setState({isSearching: false})
    })
    //
    // webview.addEventListener('will-detach',e=>console.log('will-detach',e))
    // webview.addEventListener('did-detach',e=>console.log('did-detach',e))
    // webview.addEventListener('guest-ready',e=>console.log('guest-ready',e))

    this.tokenWebviewKeydown = PubSub.subscribe("webview-keydown",(msg,e)=>{
      if(e.wv === webview) this.onHandleKeyDown(e.event)
    })

    // webview.addEventListener('wheel',::this.handleWheel)

    this.props.tab.returnWebView(webview)
    this.props.tab.guestInstanceId = (void 0)

    PubSub.publish(`regist-webview_${this.props.k}`,this.props.tab)

    this.searchEvent = async (e, name, id, word, type, toggle)=> {
      const tab = this.props.tab
      if (!tab.wvId || id !== tab.wvId) return

      if(name == 'findOnPage'){
        if(word){
          this.refs.bps.refs.input.value = word
          if(type == 'OR') this.refs.bps.or = true
        }
        else{
          if(toggle && this.state.isSearching){
            return this.setState({isSearching: false})
          }
          await new Promise(r=>{
            webview.executeScriptInTab('dckpbojndfoinamcdamhkjhnjnmjkfjd','window.getSelection().toString()', {},(err, url, result)=>{
              if(result[0]) this.refs.bps.refs.input.value = result[0]
              r()
            })
          })
        }
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

    this.changeSizeEvent = (e,tabKeyOrTabId,key,width,height,reply)=>{
      if(this.props.tab.key !== tabKeyOrTabId && this.props.tab.wvId !== tabKeyOrTabId) return
      webview.style.width = width
      webview.style.height = height
      if(reply) setTimeout(_=>ipc.send(`webview-size-change-reply_${key}`),1200)
    }
    ipc.on('webview-size-change', this.changeSizeEvent)

    console.log("BrowserPage componentDidMount(",webview,this.props)
  }

  componentWillUnmount() {
    for (var k in webviewEvents)
      this.refs.webview.removeEventListener(k, webviewHandler(this, webviewEvents[k]),{passive:true})

    for(var [k,v] in Object.entries(this.wvEvents)){
      this.refs.webview.removeEventListener(k, v,{passive:true})
    }
    this.refs.webview = null

    PubSub.unsubscribe(this.tokenWebviewKeydown)
    PubSub.unsubscribe(this.tokenDidNavigate)

    if(this.searchEvent) ipc.removeListener('menu-or-key-events', this.searchEvent)
    if(this.changeSizeEvent) ipc.removeListener('webview-size-change', this.changeSizeEvent)
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
    const webview = this.refs.webview
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
    this.refs.webview.stopFindInPage('clearSelection')
    this.complexReset()
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
      <BrowserPageSearch ref="bps" isActive={this.state.isSearching} onPageSearch={::this.onPageSearch} progress={this.state.result_string} onClose={::this.onClose}/>
      <webview ref="webview" className={`w${this.props.k2}`} data-key={this.props.k} src={this.props.tab.privateMode ? (void 0) : this.state.src}/>
      <AutofillPopup k={this.props.k}/>
    </div>
  }
}


export default {BrowserPage : BrowserPage}