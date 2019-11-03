const favorite = require('electron').remote.require('./remoted-chrome/favorite')

const React = require('react')
const ReactDOM = require('react-dom');
const {Component} = React
const ipc = require('electron').ipcRenderer
import { Search } from 'semantic-ui-react';
const uuid = require('node-uuid')
const PubSub = require('./pubsub')
const urlutil = require('./urlutil')
const sharedState = require('./sharedState')

const convertUrlMap = new Map([
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html',''],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/blank.html','about:blank'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite.html','chrome://bookmarks2/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite_sidebar.html','chrome://bookmarks-sidebar/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/history.html','chrome://history2/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/tab_history_sidebar.html','chrome://tab-history-sidebar/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/tab_trash_sidebar.html','chrome://tab-trash-sidebar/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/download_sidebar.html','chrome://download-sidebar/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/note_sidebar.html','chrome://note-sidebar/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/note.html','chrome://note/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/saved_state_sidebar.html','chrome://session-manager-sidebar/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/history_sidebar.html','chrome://history-sidebar/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/explorer.html','chrome://explorer/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/explorer_sidebar.html','chrome://explorer-sidebar/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/download.html','chrome://download/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/terminal.html','chrome://terminal/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/converter.html','chrome://converter/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/automation.html','chrome://automation/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html','chrome://setting/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#general','chrome://setting#general'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#search','chrome://setting#search'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#tabs','chrome://setting#tabs'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#keyboard','chrome://setting#keyboard'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#extensions','chrome://setting#extensions'],
])


const convertUrlReg = /^chrome\-extension:\/\/dckpbojndfoinamcdamhkjhnjnmjkfjd\/(video|ace|bind)\.html\?url=([^&]+)/
const convertUrlPdfReg = /^chrome\-extension:\/\/jdbefljfgobbmcidnmpjamcbhnbphjnb\/content\/web\/viewer\.html\?file=(.+?)$/
const convertUrlPdfReg2 = /^chrome\-extension:\/\/jdbefljfgobbmcidnmpjamcbhnbphjnb\/comicbed\/index\.html#\?url=(.+?)$/

function convertURL(url){
  if(!url) return
  if(convertUrlMap.has(url)){
    return convertUrlMap.get(url)
  }
  else{
    const match = url.match(convertUrlReg)
    let matchPdf
    if(match){
      return decodeURIComponent(match[2])
    }
    else if(matchPdf = (url.match(convertUrlPdfReg) || url.match(convertUrlPdfReg2))){
      return decodeURIComponent(matchPdf[1])
    }
    return url
  }
}

function isFloatPanel(key){
  return key.startsWith('fixed-float')
}

function getAppropriateTimeUnit(time){
  if(time / 60 < 1){
    return `${Math.round(time)}s`
  }
  else if(time / 60 / 60 < 1){
    return `${Math.round(time /60)}m${Math.round(time % 60)}s`
  }
  else if(time / 60 / 60 / 24 < 1){
    return `${Math.round(time /60 / 60)}h${Math.round((time / 60) % 60)}m`
  }
  return `${Math.round(time /60 / 60 / 24)}d${Math.round((time/60/60) % 24)}h`
}

export default class BrowserNavbarLocation extends Component {
  constructor(props) {
    super(props)
    this.keyEvent2 = (e,id)=>{
      console.log('keyEvent2', id,this.props.tab.wvId)
      if (!this.props.tab.wvId || id !== this.props.tab.wvId) return
      this.keyEvent(e, 'navbar-search')
    }
    this.keyEvent = ::this.keyEvent
    // this.torEvent = ::this.torEvent
    this.outerClick = ::this.outerClick
    this.onFocus = ::this.onFocus
    this.onBlur = ::this.onBlur
    this.getValue = ::this.getValue
    this.isFloat = isFloatPanel(props.k)
  }

  async keyEvent(e, msg, ...args){
    if (msg == 'navbar-search') {
      if(args[1]){
        ipc.send('send-to-webContents',this.props.tab.wvId,`navbar-search-reply_${args[1]}`)
      }
      const input = (this.input || ReactDOM.findDOMNode(this.refs.input).querySelector("input"))
      console.log(5644, 'focus-browser-window', input)
      for(let i=0;i<5;i++){
        await new Promise(r=>setTimeout(r,100))
        const key = Math.random().toString()
        ipc.send('focus-browser-window', key)
        await new Promise(r=>{
          ipc.once(`focus-browser-window-reply_${key}`, r)
        })
        input.focus()
        await new Promise(r=>setTimeout(r,50))
        console.log(56441, input == document.activeElement)
        if(input == document.activeElement) return
      }
    }
  }

  // torEvent(e,cond){
  //   this.canUpdate = true
  //   if(cond.finished){
  //     this.props.wv.reload()
  //     this.setState({torProgress: void 0})
  //   }
  //   else{
  //     this.setState({torProgress: cond.progress})
  //   }
  // }

  componentWillMount() {
    this.resetComponent()
  }

  componentDidMount() {
    console.log(55553,this.props.page.navUrl,this.props.page.location)
    ipc.on('focus-location-bar',this.keyEvent2)
    // if(this.props.tab.privateMode == 'persist:tor') ipc.on('tor-progress',this.torEvent)
    this.addEvent(this.props)

    this.input = ReactDOM.findDOMNode(this.refs.input).querySelector("input")
    this.input.addEventListener('focus', this.onFocus)
    this.input.addEventListener('blur', this.onBlur)
    // const input = (this.input || ReactDOM.findDOMNode(this.refs.input).querySelector("input"))
    // input.addEventListener('focus',::this.onFocus)
    // input.addEventListener('blur',::this.onBlur)
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.token)
    if(this.props.tab.privateMode == 'persist:tor') ipc.removeListener('focus-location-bar',this.keyEvent2)
    ipc.removeListener('focus-location-bar',this.keyEvent2)
    // ipc.removeListener('tor-progress',this.torEvent)
    ipc.removeListener(`send-to-host_${this.props.tab.wvId}`,this.keyEvent)
    this.input.removeEventListener('focus', this.onFocus)
    this.input.removeEventListener('blur', this.onBlur)
  }

  addEvent(props) {
    ipc.removeListener(`send-to-host_${props.tab.wvId}`,this.keyEvent)
    ipc.on(`send-to-host_${props.tab.wvId}`,this.keyEvent)
  }

  componentWillReceiveProps(nextProps) {
    if(!this.props.wv && nextProps.wv){
      this.input = ReactDOM.findDOMNode(this.refs.input).querySelector("input")
      this.addEvent(nextProps)
    }
  }

  componentDidUpdate(prevProps, prevState){
    if(!this.input) return
    const ele = this.input.parentNode.nextElementSibling
    if(!ele) return
    const rect = this.input.getBoundingClientRect()
    ele.style.maxHeight = `${window.innerHeight - (rect.top + rect.height) - 5}px`
    ele.style.maxWidth = `${window.innerWidth - rect.left}px`
    ele.style.left = `${rect.left}px`
  }

  resetComponent(noBlur){
    if(this.props.tab.fields && this.props.tab.fields.mobilePanel){
      ipc.send('mobile-panel-operation',{type: 'above', key: this.props.tab.key, tabId: this.props.tab.wvId, force: true})
    }

    if(this.isFloat || this.props.isMaximize){
      PubSub.publish(`menu-showed_${this.props.k}`,false)
    }
    if(!noBlur && this.input) this.input.blur()
    this.prevValue = void 0
    document.removeEventListener('mousedown',this.outerClick,{once:true})
    PubSub.unsubscribe(this.tokenMouseDown)
    this.setState({ results: []})
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(this.canUpdate){
      this.canUpdate = false
      return true
    }

    if(!this.input) this.input = ReactDOM.findDOMNode(this.refs.input).querySelector("input")
    this.location = nextProps.page.location

    return document.activeElement !== this.input || this.input.value === nextProps.page.location || this.input.value == ""
  }

  handleResultSelect(e, result) {
    if(!result.title) result = result.result
    this.canUpdate = true
    const val = this.state.results.find(x=> x.title === result.title)
    if(val.description){
      if(this.props.addressBarNewTab){
        this.props.tab.events['new-tab'](e, this.props.tab.wvId,val.url,this.props.tab.privateMode)
      }
      else{
        this.props.onEnterLocation(val.url)
      }
    }
    else{
      this.props.search(this.props.tab, val.url, false, this.props.addressBarNewTab)
    }
    this.resetComponent()
  }

  removeDuplication(a, b){
    if(!a.length || !b.length) return b
    return b.filter(x=>!a.find(y=>y.url == x.url))
  }

  handleSearchChange(e, value){
    // console.log("start",Date.now())
    this.props.onChangeLocation.bind(this)(e.target.value)
    if (this.props.page.location.length < 1) return this.resetComponent(true);

    ipc.send('change-browser-view-z-index', true)

    if(this.props.tab.fields && this.props.tab.fields.mobilePanel){
      ipc.send('mobile-panel-operation',{type: 'below', key: this.props.tab.key, tabId: this.props.tab.wvId, force: true})
    }
    // if ((lastExecTime + interval) <= new Date().getTime()) {
    //   lastExecTime = new Date().getTime()

    const key = uuid.v4()
    const cLoc = this.props.page.location

    const promises = []

    if(this.prevValue == this.props.page.location){
      this.setState({})
      return
    }
    this.prevValue = this.props.page.location

    if(this.props.autoCompleteInfos.numOfSuggestion > 0){
      promises.push(fetch(this.props.autoCompleteInfos.url.replace("%s",encodeURIComponent(this.props.page.location))).then(res=>{
        return res.json()
      }).then(json=>{
        try{
          let results = json[1].map(x=>({ title: x, url: x }))
          console.log(json[1])
          return {suggestion: results.slice(0, this.props.autoCompleteInfos.numOfSuggestion)}
        }catch(e){
          return {suggestion: []}
        }
      }))
    }

    if(this.props.autoCompleteInfos.numOfBookmark > 0) {
      promises.push(new Promise(resolve => {
        ipc.once(`search-favorite-reply_${key}`, (e, ret) => {
          if (cLoc != this.props.page.location) return

          const results = ret.map(x => ({
            title: x.title || (x.location.length > 75 ? `${x.location.substr(0, 75)}...` : x.location),
            description: <span><span>{x.location.length > 90 ? `${x.location.substr(0, 90)}...` : convertURL(x.location)}</span><span className="suggestion-visit">[Bookmark]</span></span>,
            url: x.location
          }))
          resolve({bookmark: results})
        })
        ipc.send('search-favorite', key, this.props.page.location, this.props.autoCompleteInfos.numOfBookmark)
      }))
    }

    if(this.props.autoCompleteInfos.numOfHistory > 0) {
      promises.push(new Promise(resolve => {
        ipc.once(`search-history-loc-reply_${key}`, (e, ret) => {
          if (cLoc != this.props.page.location) return

          const results = ret.history.map(x => ({
            title: x.title || (x.location.length > 75 ? `${x.location.substr(0, 75)}...` : x.location),
            description: <span><span>{x.location.length > 90 ? `${x.location.substr(0, 90)}...` : convertURL(x.location)}</span><span className="suggestion-visit">[{x.count}pv{x.time ? `, ${getAppropriateTimeUnit(x.time / 1000)}` : ''}]</span></span>,
            url: x.location
          }))
          resolve({history: _.uniqBy(results.filter(x => x.title), x => x.title).slice(0, this.props.autoCompleteInfos.numOfHistory)})
        })
        ipc.send('search-history-loc', key, _.escapeRegExp(this.props.page.location), 100)
      }))
    }

    Promise.all(promises).then(values=>{
      const order = this.props.autoCompleteInfos.orderOfAutoComplete

      let suggestion = values.find(x=>x.suggestion)
      suggestion = suggestion ? suggestion.suggestion : []

      let bookmark = values.find(x=>x.bookmark)
      bookmark = bookmark ? bookmark.bookmark : []

      let history = values.find(x=>x.history)
      history = history ? history.history : []

      let results
      if(order == 'suggestionToBookmarkToHistory' || order == 'suggestionToHistory'){
        history = this.removeDuplication(bookmark, history)
        results = [...suggestion, ...bookmark, ...history]
      }
      else if(order == 'suggestionToHistoryToBookmark'){
        bookmark = this.removeDuplication(history, bookmark)
        results = [...suggestion, ...history, ...bookmark]
      }
      else if(order == 'bookmarkToSuggestionToHistory'){
        history = this.removeDuplication(bookmark, history)
        results = [...bookmark, ...suggestion, ...history]
      }
      else if(order == 'bookmarkToHistoryToSuggestion'){
        history = this.removeDuplication(bookmark, history)
        results = [...bookmark, ...history, ...suggestion]
      }
      else if(order == 'historyToSuggestionToBookmark'){
        bookmark = this.removeDuplication(history, bookmark)
        results = [...history, ...suggestion, ...bookmark]
      }
      else if(order == 'historyToBookmarkToSuggestion' || order == 'historyToSuggestion'){
        bookmark = this.removeDuplication(history, bookmark)
        results = [...history, ...bookmark, ...suggestion]
      }

      if(this.isFloat || this.props.isMaximize){
        PubSub.publish(`menu-showed_${this.props.k}`,true)
      }
      if(this.input == document.activeElement) this.setState({ results })
    })
  }

  handleSelectionChange(e,value){
    if(!value.result) return
    if(value.result.description){
      e.target.value = value.result.description.children[0].children.children
    }
    else{
      e.target.value = value.result.title
    }
  }

  onFocus(e){
    const input = this.input || ReactDOM.findDOMNode(this.refs.input).querySelector("input")
    input.select()

    if((this.isFloat || this.props.isMaximize) && input.value != ""){
      PubSub.publish(`menu-showed_${this.props.k}`,true)
    }
  }

  onBlur(e){
    if(this.mouseDown) return
    this.resetComponent()
  }

  onMouseDown(e){
    this.mouseDown = e.target
    this.button = e.button
    this.mouseDownPos = e.target.clientWidth - e.offsetX
    // if(this.isFloat || this.props.isMaximize){
    // }
  }

  onMouseUp(e){
    if(e.button == 2 || !this.mouseDown || this.button !== e.button) return
    this.mouseDown = void 0
    this.button = void 0
    if(e.button == 0 && this.mouseDownPos > 0 && e.target.selectionStart  == 0 && e.target.selectionEnd == 0){
      console.log(865975,e.button, this.mouseDownPos)
      e.target.click()
    }
    else if(e.button == 1){
      const content = e.target.closest('.content')
      const description = content.querySelector('.description>span>span')

      if(description){
        const targetUrl = description.textContent
        this.props.tab.events['create-web-contents'](e, {id:this.props.tab.wvId,targetUrl,disposition:'background-tab'})
      }
      else{
        const word = content.querySelector('.title').textContent
        this.props.search(this.props.tab, word, true, this.props.addressBarNewTab)
      }
      document.addEventListener('mousedown',this.outerClick,{once:true})
      this.tokenMouseDown = PubSub.subscribe('webview-mousedown',(msg,e)=>this.outerClick(e))
    }
    this.mouseDownPos = void 0

    e.preventDefault()
  }

  outerClick(e){
    if(!e.target.closest(`.input-group`)) this.onBlur(e)
  }


  onKeyDown (e) {
    console.log("keydown",e)
    if (e.keyCode == 13) {
      const select = ReactDOM.findDOMNode(this.refs.input).querySelector("div.results.transition > div.active.result > div > div.title")
      if(select){
        const title = select.innerHTML.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        const url = this.state.results.find(x=> x.title === title).url
        select.click()
        this.canUpdate = true
        this.resetComponent()
        // this.props.onEnterLocation(url)
        return
      }
      const input = e.target.value
      const newTab = e.altKey || this.props.addressBarNewTab || this.props.tab.lock
      if(urlutil.isURL(input)){
        const url = urlutil.getUrlFromInput(input)
        this.canUpdate = true
        if(newTab){
          this.props.tab.events['new-tab'](e, this.props.tab.wvId,url,this.props.tab.privateMode)
        }
        else{
          this.props.onEnterLocation(url)
        }
        this.resetComponent()
        // ;(this.input || ReactDOM.findDOMNode(this.refs.input).querySelector("input")).value = url
      }
      else{
        this.props.search(this.props.tab, input, false, newTab)
        this.canUpdate = true
        this.resetComponent()
      }
      this.setState({ results: []})
    }
    // else if(e.manualEvent){
    //   const val = keycode(e.keyCodeVal)
    //   this.props.page.location = ""
    //   if(val && val.length == 1) this.props.page.location = val
    //   this.setState({})
    // }
  }

  getValue(){
    const convertUrl = convertURL(this.props.page.location)
    // console.log(520,{
    //   prevLocation: this.prevLocation, convertUrl,
    //   prevInputValue:this.prevInputValue, inputValue: this.input && this.input.value,
    //   prevLocValue: this.prevLocValue,
    //   value: document.activeElement == this.input ? this.input.value : convertUrl
    // })
    if(this.prevLocation == convertUrl && this.prevInputValue == (this.input && this.input.value)){
      return this.prevLocValue
    }
    const value = document.activeElement == this.input ? this.input.value : convertUrl

    this.prevLocation = convertUrl
    this.prevInputValue = this.input && this.input.value
    this.prevLocValue = value

    return value
  }

  render() {
    console.log(this.props)
    const { results } = this.state
    return !sharedState.showAddressBarFavicon && !sharedState.showAddressBarBookmarks ?
      <Search
        icon={null}
        showNoResults={false}
        loading={false}
        onResultSelect={::this.handleResultSelect}
        onSearchChange={::this.handleSearchChange}
        onSelectionChange={::this.handleSelectionChange}
        onMouseDown={::this.onMouseDown}
        onMouseUp={::this.onMouseUp}
        results={results.map(x=>{return {title:x.title,description: x.description}})}
        value={this.getValue()}
        key="input"
        ref="input"
        onKeyDown={::this.onKeyDown}
        onContextMenu={this.props.onContextMenu}
      />  :
      <span className={`address-bar-wrapper ${sharedState.showAddressBarFavicon ? ' favicon' : ''} ${sharedState.showAddressBarBookmarks ? ' bookmarks' : ''}`}>
        {sharedState.showAddressBarFavicon ? <a className="address-bar" style={{backgroundImage: `url(${this.props.tab.page.title && this.props.tab.page.favicon !== 'loading' ? this.props.tab.page.favicon : ''})`}}
                                                href={this.props.tab.page.navUrl} onClick={e=>{e.stopPropagation();e.preventDefault();return false}}/> : null }
        <Search
          icon={null}
          showNoResults={false}
          loading={false}
          onResultSelect={::this.handleResultSelect}
          onSearchChange={::this.handleSearchChange}
          onSelectionChange={::this.handleSelectionChange}
          onMouseDown={::this.onMouseDown}
          onMouseUp={::this.onMouseUp}
          results={results.map(x=>{return {title:x.title,description: x.description}})}
          value={this.getValue()}
          key="input"
          ref="input"
          onKeyDown={::this.onKeyDown}
          onContextMenu={this.props.onContextMenu}
        />
        {sharedState.showAddressBarBookmarks ? <a onClick={async e=>{
          const key = uuid.v4()
          await favorite.create({parentId: 'root', url: this.props.page.location, title: this.props.page.title})

          const rect = e.target.getBoundingClientRect()
          const span = document.createElement('span')
          span.innerHTML = `<div class="ui bottom right inverted popup transition visible" style="position: fixed; z-index: 99999; width: 140px; left: ${rect.x - 114}px; top: ${rect.y + 12}px;">
<div class="content">Bookmark Added</div>
</div>`
          document.body.appendChild(span)
          setTimeout(_=>{
            document.body.removeChild(span)
          },2500)

        }} className="address-bar-favorite"><i className="fa fa-star" aria-hidden="true"/></a> : null}
        </span>

  }
}
