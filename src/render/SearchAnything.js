import React,{Component} from 'react'
import { Search, Modal } from 'semantic-ui-react';
const uuid = require('node-uuid')
const ipc = require('electron').ipcRenderer
const urlutil = require('./urlutil')

const convertUrlMap = new Map([
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html',''],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/blank.html','about:blank'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite.html','chrome://bookmarks2/'],
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
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html','chrome://setting/'],
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

export default class SearchAnything extends Component{

  constructor(props){
    super(props)
    this.state = {results: []}
    this.keyDown = ::this.keyDown
    this.keyUp = ::this.keyUp
    this.onBlur = ::this.onBlur
  }

  getInput(){
    return ReactDOM.findDOMNode(this.refs.input).querySelector("input")
  }

  keyEvent(e){
    this.input.focus()
  }

  componentWillUnmount() {
    document.removeEventListener("keydown",this.keyDown,{passive:true})
    document.removeEventListener("keyup",this.keyUp,{passive:true})
    // document.removeEventListener("mousedown",this.onBlur)
    this.resetComponent()
  }

  componentDidMount() {
    document.addEventListener("keydown",this.keyDown,{passive:true})
    document.addEventListener("keyup",this.keyUp,{passive:true})
    // document.addEventListener("mousedown",this.onBlur)
  }

  keyUp(e){
    if (e.keyCode != 16 || !this.keyd) return

    this.keyu = true
    setTimeout(_=>this.keyu = false, 300);
  }

  keyDown(e){
    if (e.keyCode != 16) return
    if (this.keyu) {
      this.setState({modalOpen: true})
      this.keyd = false
      return
    }

    this.keyd = true
    setTimeout(_=>this.keyd = false, 300);
  }

  resetComponent(){
    this.setState({ results: [],value: ""})
  }

  openPage(url){
    ipc.send('open-page',url)
    this.modalClose()
  }

  searchPage(text){
    ipc.send('search-page',text)
    this.modalClose()
  }

  handleResultSelect(e, result) {
    if(!result.title) result = result.result
    this.openPage(this.state.results.find(x=> x.title === result.title).url)
    this.resetComponent()
  }


  handleSearchChange(e, value){
    this.setState({value:value.value})
    if (this.state.value.length < 1) return this.resetComponent()

    const key = uuid.v4()
    const cLoc = this.state.value
    ipc.once(`search-history-loc-reply_${key}`, (e, ret)=> {
      if(cLoc != this.state.value) return
      let results = ret.history.map(x=> {
        return {
          title: x.title || (x.location.length > 75 ? `${x.location.substr(0, 75)}...` : x.location),
          description: x.location.length > 100 ? `${x.location.substr(0, 100)}...` : convertURL(x.location),
          url: x.location
        }
      })

      this.setState({
        results: _.uniqBy(results.filter(x => x.title), x => x.title).slice(0, 15)
      })
    })
    ipc.send('search-history-loc', key,_.escapeRegExp(this.state.value), 100)
  }

  onBlur(e){
    console.log(e)
    if(e.relatedTarget.closest(".anything")) return
    this.setState({modalOpen: false, results: [],value: ""})
  }

  modalClose(){
    this.setState({modalOpen: false, results: [],value: ""})
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
        return
      }
      const input = e.target.value
      if(urlutil.isURL(input)){
        const url = urlutil.getUrlFromInput(input)
        this.canUpdate = true
        this.openPage(url)
      }
      else{
        this.canUpdate = true
        this.searchPage(input)
      }

    }
  }

  onOpen(e){
    setTimeout(_=>{
      this.input = this.getInput()
      this.input.style.padding = '.47861429em 1em'
      this.input.style.borderRadius = '15px'
      this.input.focus()
    },0)

  }

  render(){
    return <Modal className="anything" style={{top: 80}} dimmer={false} size="small" open={this.state.modalOpen}
                  onMount={::this.onOpen}>
      <Modal.Content>
        <h4 style={{lineHeight: 0}}>Search Everywhere</h4>
        <Search
          size="small"
          icon={null}
          showNoResults={false}
          loading={false}
          onResultSelect={::this.handleResultSelect}
          onSearchChange={::this.handleSearchChange}
          onBlur={this.onBlur}
          results={this.state.results.map(x=>{return {title:x.title,description: x.description}})}
          value={this.state.value}
          ref="input"
          onKeyDown={::this.onKeyDown}
        />
      </Modal.Content>
    </Modal>
  }
}
