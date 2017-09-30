window.debug = require('debug')('info')
// require('debug').enable("info")
import process from './process'
import {ipcRenderer as ipc} from 'electron';
import path from 'path';
import React from 'react';
import ReactDOM from 'react-dom';
import {Container, List, Menu, Input} from 'semantic-ui-react';
import {StickyContainer, Sticky} from 'react-sticky';
import moment from 'moment';
import l10n from '../../brave/js/l10n';
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'
import Clusterize from 'clusterize.js';
import ReactDOMServer from 'react-dom/server';

l10n.init()



const convertUrlMap = new Map([
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html',''],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/blank.html','about:blank'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite.html','chrome://bookmarks/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite_sidebar.html','chrome://bookmarks-sidebar/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/history.html','chrome://history/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/history_full.html','chrome://history-fulltext/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/history_sidebar.html','chrome://history-sidebar/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/explorer.html','chrome://explorer/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/explorer_sidebar.html','chrome://explorer-sidebar/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/tabs_sidebar.html','chrome://tabs-sidebar/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/download.html','chrome://download/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/terminal.html','chrome://terminal/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html','chrome://settings/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#general','chrome://settings#general'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#search','chrome://settings#search'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#tabs','chrome://settings#tabs'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#keyboard','chrome://settings#keyboard'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#extension','chrome://settings#extension'],
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


let resourcePath
let setTime = localStorage.getItem('favicon-set')
ipc.send("favicon-get",setTime ? parseInt(setTime) : null)
ipc.once("favicon-get-reply",(e,ret)=>{
  localStorage.setItem('favicon-set',Date.now().toString())
  for(let [k,v] of Object.entries(ret)){
    localStorage.setItem(k,v)
  }
})

function faviconGet(h){
  return h.favicon ? localStorage.getItem(h.favicon) || `file://${resourcePath}/file.png` : `file://${resourcePath}/file.png`
}

ipc.send("get-resource-path",{})
ipc.once("get-resource-path-reply",(e,data)=>{
  resourcePath = data
})

function fetchHistory(range){
  ipc.send('fetch-history',range,true,1000)
}

function searchHistory(cond){
  ipc.send('search-history',cond,true,1000)
}

function historyReply(callback){
  ipc.on('history-reply', (event, data) => {
    callback(data)
  })
}

function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function onceRun(func,id){
  func()
  if(id) window.clearInterval(id)
  return null
}

function intervalRun(func,id){
  func()
  if(id) window.clearInterval(id)
  return window.setInterval(func, 3000)
}

let filter,keyword
class TopMenu extends React.Component {
  constructor(props) {
    super(props)
    this.updateDatas = []
  }

  componentDidMount() {
    fetchHistory({})
    historyReply((data)=>{
      this.list = new HistoryList().build(data)
      if(this.clusterize){
        this.clusterize.update(this.list)
      }
      else{
        this.clusterize = new Clusterize({
          rows: this.list,
          scrollId: 'scrollArea',
          contentId: 'contentArea',
          rows_in_block: 1000,
          blocks_in_cluster: 2,
        });
      }
    })
    this.eventUpdateDatas = (e,data)=>{
      this.updateDatas.push(data)
    }
    ipc.on("update-datas",this.eventUpdateDatas)

    this.token = intervalRun(()=>{
      if(this.updateDatas.length > 0){
        fetchHistory({})
        this.updateDatas = []
      }
    },this.token)
  }


  setToken(token){
    this.token = token
  }

  onChange(e,data) {
    e.preventDefault()
    clearTimeout(this.timer);
    this.timer = setTimeout(()=>{
      filter = !data.value ? undefined : new RegExp(`(.{0,30}${escapeRegExp(data.value).split(/[ 　]+/,-1).join('|')}.{0,30})`,'ig')
      keyword = !data.value ? undefined : new RegExp(`(${escapeRegExp(data.value).split(/[ 　]+/,-1).join('|')})`,'ig')
      this.token = onceRun(()=>searchHistory(escapeRegExp(data.value).split(/[ 　]+/,-1).filter(x=>x)),this.token)
    }, 500)
  }

  render() {
    console.log(this.token)
    console.log(this.state)
    return (
      <StickyContainer>
        <Sticky>
          <div>
            <Menu pointing secondary >
              {/*{this.state.items.map(item=>{*/}
                {/*return <Menu.Item key={item} name={item} active={activeItem === item} onClick={::this.handleItemClick} />*/}
              {/*})}*/}
              <Menu.Item as='a' href={`${baseURL}/history.html`} key="history" name={l10n.translation('history')}/>
              <Menu.Item key="history-full" name="Fulltext History" active={true}/>
              <Menu.Item as='a' href={`${baseURL}/top.html`} key="top" name="Top" style={{
                borderLeft: "2px solid rgba(34,36,38,.15)",
                marginLeft: 20,
                paddingLeft: 30
              }}/>
              <Menu.Item as='a' href={`${baseURL}/favorite.html`} key="favorite" name={l10n.translation('bookmarks')}/>
              <Menu.Item key="history" name={l10n.translation('history')} active={true}/>
              <Menu.Item as='a' href={`${baseURL}/download.html`} key="download" name={l10n.translation('downloads')}/>
              <Menu.Item as='a' href={`${baseURL}/explorer.html`} key="file-explorer" name="File Explorer"/>
              <Menu.Item as='a' href={`${baseURL}/terminal.html`} key="terminal" name="Terminal"/>
              <Menu.Item as='a' href={`${baseURL}/settings.html`} key="settings" name={l10n.translation('settings')}/>
            </Menu>
          </div>
        </Sticky>
        <Input ref='input' icon='search' placeholder='Search...' onChange={::this.onChange}/>
        <div id="scrollArea" style="height: calc(100vh - 46px); overflow-y: scroll;">
          <div role="list" id="contentArea" className="ui divided relaxed list">
          </div>
        </div>
      </StickyContainer>
    )
  }
}

class HistoryList{
  build(data) {
    const historyList = []
    let pre = {location:false}
    data.forEach((h,i)=>{
      h.updated_at = moment(h.updated_at).format("YYYY/MM/DD HH:mm:ss")
      h.yyyymmdd = h.updated_at.slice(0,10)
      if(pre.yyyymmdd != h.yyyymmdd){
        historyList.push(`<h4>${h.yyyymmdd}</h4>`)
      }
      if(h.location === pre.location){
        if(!pre.title) pre.title = h.title
        if(!pre.favicon) pre.favicon = h.favicon
        historyList[historyList.length-1] = this.buildItem(pre)
      }
      else{
        historyList.push(this.buildItem(h))
        pre = h
      }
    })
    return historyList
  }

  escape(str){
  return str.replace(/[&'`"<> \n]/g, function(match) {
      return {
        '&': '&amp;',
        ' ': '&nbsp;',
        '\n': '<br/>',
        "'": '&#x27;',
        '`': '&#x60;',
        '"': '&quot;',
        '<': '&lt;',
        '>': '&gt;',
      }[match]
    });
  }

  getText(text){
    if(filter){
      return this.escape(text.match(filter).join("\n")).replace(keyword,'<b>$1</b>')
    }
    else{
      return this.escape(text.length > 1000 ? `${text.substr(0, 1000)}...` : text)
    }
  }

  buildItem(h) {
    const favicon = faviconGet(h)
    return `<div role="listitem" class="item">
      <img src="${favicon}" style="width: 20px; height: 20px; float: left; margin-right: 4px; margin-top: 6px;"/>
      <div class="content">
        <a class="description" style="float:right;margin-right:15px;font-size: 12px">${h.updated_at.slice(5)}</a>
        ${!h.title ? "" : `<a class="header" target="_blank" href=${h.location}>${h.title}</a>`}
        ${!h.location ? "" : `<span class="description" style="fontSize: 8px;" >${this.getText(h.text)}</span>`}
      </div>
    </div>`;
  }

}

const App = () => (
  <Container>
    <TopMenu/>
  </Container>
)


ReactDOM.render(<App />,  document.getElementById('app-full'))