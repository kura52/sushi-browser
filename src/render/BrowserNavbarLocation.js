const React = require('react')
const ReactDOM = require('react-dom');
const {Component} = React
const ipc = require('electron').ipcRenderer
import { Search } from 'semantic-ui-react'
const uuid = require('node-uuid')
const PubSub = require('./pubsub')
const urlutil = require('./urlutil')

const SKIP_CODES = [8,9,13,16,17,18,19,20,27,33,34,35,36,37,38,39,40,45,46,144,145]

const convertUrlMap = new Map([
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html',''],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/blank.html','about:blank'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite.html','chrome://bookmarks/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite_sidebar.html','chrome://bookmarks-sidebar/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/history.html','chrome://history/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/history_sidebar.html','chrome://history-sidebar/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/explorer.html','chrome://explorer/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/explorer_sidebar.html','chrome://explorer-sidebar/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/tabs_sidebar.html','chrome://tabs-sidebar/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/download.html','chrome://download/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/terminal.html','chrome://terminal/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html','chrome://settings/'],
])

const convertUrlReg = /^chrome\-extension:\/\/dckpbojndfoinamcdamhkjhnjnmjkfjd\/(video|ace)\.html\?url=([^&]+)(&type=)?/
const convertUrlPdfReg = /^chrome\-extension:\/\/jdbefljfgobbmcidnmpjamcbhnbphjnb\/content\/web\/viewer\.html\?file=(.+?)$/

function convertURL(url){
  if(convertUrlMap.has(url)){
    return convertUrlMap.get(url)
  }
  else{
    console.log(url)
    const match = url.match(convertUrlReg)
    let matchPdf
    if(match){
      return decodeURIComponent(match[2])
    }
    else if(matchPdf = url.match(convertUrlPdfReg)){
      return decodeURIComponent(matchPdf[1])
    }
    return url
  }
}

function isFloatPanel(key){
  return key.startsWith('fixed-float')
}

export default class BrowserNavbarLocation extends Component {
  constructor(props) {
    super(props)
    this.keyEvent = ::this.keyEvent
    this.isFloat = isFloatPanel(this.props.k)
  }

  keyEvent(e){
    if (e.channel == 'navbar-search') {
      const input = (this.input || ReactDOM.findDOMNode(this.refs.input).querySelector("input"))
      input.focus()
    }
  }

  componentWillMount() {
    this.resetComponent()
  }

  componentDidMount() {
    if(this.props.wv){
      this.input = ReactDOM.findDOMNode(this.refs.input).querySelector("input")
      this.addEvent(this.props)
    }
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

  resetComponent(){
    if(this.isFloat){
      PubSub.publish(`menu-showed_${this.props.k}`,false)
    }
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
    this.canUpdate = true
    this.props.onEnterLocation(this.state.results.find(x=> x.title === result.title).url)
    this.resetComponent()
  }

  handleSearchChange(e, value){
    // console.log("start",Date.now())
    this.props.onChangeLocation.bind(this)(e.target.value)
    if (this.props.page.location.length < 1) return this.resetComponent();

    // if ((lastExecTime + interval) <= new Date().getTime()) {
    //   lastExecTime = new Date().getTime()

    const key = uuid.v4()
    const cLoc = this.props.page.location
    ipc.once(`search-history-loc-reply_${key}`, (e, ret)=> {
      if(cLoc != this.props.page.location) return
      // console.log("end", Date.now())
      let results = ret.history.map(x=> {
        return {
          title: x.title || (x.location.length > 75 ? `${x.location.substr(0, 75)}...` : x.location),
          description: x.location.length > 100 ? `${x.location.substr(0, 100)}...` : convertURL(x.location),
          url: x.location
        }
      })

      if(this.isFloat){
        PubSub.publish(`menu-showed_${this.props.k}`,true)
      }
      this.setState({
        results: (results.filter(x=>x.title) | _.uniqBy(x=>x.title)).slice(0, 15)
      })
      // console.log("end2", Date.now())
    })
    ipc.send('search-history-loc', key,_.escapeRegExp(this.props.page.location), 100)
    // }
  }


  onFocus(e){
    if(!this.unselect)
      (this.input || ReactDOM.findDOMNode(this.refs.input).querySelector("input")).select()

    if(this.isFloat && (this.input || ReactDOM.findDOMNode(this.refs.input).querySelector("input")).value != ""){
      PubSub.publish(`menu-showed_${this.props.k}`,true)
    }
  }

  onBlur(e){
    if(this.isFloat){
      PubSub.publish(`menu-showed_${this.props.k}`,false)
    }
  }

  onMouseDown(e){
    if(this.isFloat){
      e.target.click()
    }
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
      const url = urlutil.isURL(input) ? urlutil.getUrlFromInput(input) : `https://www.google.com/search?q=${e.target.value}`
      this.canUpdate = true
      this.props.onEnterLocation(url)
      this.resetComponent()
      // this.props.onEnterLocation(e.target.value)
      // if(!this.props.privateMode){
      //   ;(async ()=>{
      //     await searchHistory.insert({text:e.target.value ,created_at: Date.now(),updated_at: Date.now()})
      //   })()
      // }
      ;(this.input || ReactDOM.findDOMNode(this.refs.input).querySelector("input")).value = url
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
    const { results } = this.state
    return (
      <Search
        icon={null}
        showNoResults={false}
        loading={false}
        onResultSelect={::this.handleResultSelect}
        onSearchChange={::this.handleSearchChange}
        onMouseDown={::this.onMouseDown}
        results={results.map(x=>{return {title:x.title,description: x.description}})}
        value={convertURL(this.props.page.location)}
        ref="input"
        onFocus={::this.onFocus}
        onBlur={::this.onBlur}
        onKeyDown={::this.onKeyDown}
        onContextMenu={this.props.onContextMenu}
      />
    )
  }
}
