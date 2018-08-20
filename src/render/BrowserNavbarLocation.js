import {favorite} from "./databaseRender";

const React = require('react')
const ReactDOM = require('react-dom');
const {Component} = React
const ipc = require('electron').ipcRenderer
import { Search } from 'semantic-ui-react';
const uuid = require('node-uuid')
const PubSub = require('./pubsub')
const urlutil = require('./urlutil')
const sharedState = require('./sharedState')

const SKIP_CODES = [8,9,13,16,17,18,19,20,27,33,34,35,36,37,38,39,40,45,46,144,145]

const convertUrlMap = new Map([
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html',''],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/blank.html','about:blank'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite.html','chrome://bookmarks/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite_sidebar.html','chrome://bookmarks-sidebar/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/history.html','chrome://history/'],
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
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html','chrome://settings/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#general','chrome://settings#general'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#search','chrome://settings#search'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#tabs','chrome://settings#tabs'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#keyboard','chrome://settings#keyboard'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#extensions','chrome://settings#extensions'],
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
      if (!this.props.tab.wvId || id !== this.props.tab.wvId) return
      this.keyEvent({channel: 'navbar-search'})
    }
    this.keyEvent = ::this.keyEvent
    this.torEvent = ::this.torEvent
    this.outerClick = ::this.outerClick
    this.isFloat = isFloatPanel(props.k)
  }

  keyEvent(e){
    if (e.channel == 'navbar-search') {
      const input = (this.input || ReactDOM.findDOMNode(this.refs.input).querySelector("input"))
      input.focus()
    }
  }

  torEvent(e,cond){
    this.canUpdate = true
    if(cond.finished){
      this.props.wv.reload()
      this.setState({torProgress: void 0})
    }
    else{
      this.setState({torProgress: cond.progress})
    }
  }

  componentWillMount() {
    this.resetComponent()
  }

  componentDidMount() {
    console.log(55553,this.props.page.navUrl,this.props.page.location)
    ipc.on('focus-location-bar',this.keyEvent2)
    if(this.props.tab.privateMode == 'persist:tor') ipc.on('tor-progress',this.torEvent)
    if(this.props.wv){
      this.input = ReactDOM.findDOMNode(this.refs.input).querySelector("input")
      this.addEvent(this.props)
    }
    // const input = (this.input || ReactDOM.findDOMNode(this.refs.input).querySelector("input"))
    // input.addEventListener('focus',::this.onFocus)
    // input.addEventListener('blur',::this.onBlur)
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.token)
    if(this.props.tab.privateMode == 'persist:tor') ipc.removeListener('focus-location-bar',this.keyEvent2)
    ipc.removeListener('tor-progress',this.torEvent)
    if(this.props.wv) this.props.wv.removeEventListener('ipc-message',this.keyEvent)
  }

  addEvent(props) {
    props.wv.removeEventListener('ipc-message',this.keyEvent)
    props.wv.addEventListener('ipc-message',this.keyEvent)
  }

  componentWillReceiveProps(nextProps) {
    if(!this.props.wv && nextProps.wv){
      this.input = ReactDOM.findDOMNode(this.refs.input).querySelector("input")
      this.addEvent(nextProps)
    }
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

  handleSearchChange(e, value){
    // console.log("start",Date.now())
    this.props.onChangeLocation.bind(this)(e.target.value)
    if (this.props.page.location.length < 1) return this.resetComponent(true);

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
          return results.slice(0, this.props.autoCompleteInfos.numOfSuggestion)
        }catch(e){
          return []
        }
      }))
    }

    if(this.props.autoCompleteInfos.numOfHistory > 0) {
      promises.push(new Promise(resolve => {
        ipc.once(`search-history-loc-reply_${key}`, (e, ret) => {
          if (cLoc != this.props.page.location) return
          // console.log("end", Date.now())
          let results = ret.history.map(x => ({
            title: x.title || (x.location.length > 75 ? `${x.location.substr(0, 75)}...` : x.location),
            description: <span><span>{x.location.length > 90 ? `${x.location.substr(0, 90)}...` : convertURL(x.location)}</span><span className="suggestion-visit">[{x.count}pv{x.time ? `, ${getAppropriateTimeUnit(x.time / 1000)}` : ''}]</span></span>,
            url: x.location
          }))
          resolve(_.uniqBy(results.filter(x => x.title), x => x.title).slice(0, this.props.autoCompleteInfos.numOfHistory));
        })
        ipc.send('search-history-loc', key, _.escapeRegExp(this.props.page.location), 100)
      }))
    }

    Promise.all(promises).then(values=>{
      if(this.props.autoCompleteInfos.orderOfAutoComplete == 'historyToSuggestion') values.reverse()
      const results = [...values[0],...(values[1]||[])]
      if(this.isFloat || this.props.isMaximize){
        PubSub.publish(`menu-showed_${this.props.k}`,true)
      }
      this.setState({ results })
    })
  }

  handleSelectionChange(e,value){
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
    // if(this.isFloat || this.props.isMaximize){
    // }
  }

  onMouseUp(e){
    if(e.button == 2 || !this.mouseDown || this.button !== e.button) return
    this.mouseDown = void 0
    this.button = void 0
    if(e.button == 0){
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
    }
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
        value={this.state.torProgress ? `Connecting to the Tor network: ${this.state.torProgress}%...` : convertURL(this.props.page.location)}
        ref="input"
        onFocus={::this.onFocus}
        onBlur={::this.onBlur}
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
          value={this.state.torProgress ? `Connecting to the Tor network: ${this.state.torProgress}%...` : convertURL(this.props.page.location)}
          ref="input"
          onFocus={::this.onFocus}
          onBlur={::this.onBlur}
          onKeyDown={::this.onKeyDown}
          onContextMenu={this.props.onContextMenu}
        />
        {sharedState.showAddressBarBookmarks ? <a onClick={async e=>{
          const key = uuid.v4()
          await favorite.insert({key, url: this.props.page.location, title: this.props.page.title, favicon: this.props.page.favicon,
            is_file:true, created_at: Date.now(), updated_at: Date.now()})
          await favorite.update({ key: 'root' }, { $push: { children: key }, $set:{updated_at: Date.now()} })
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
