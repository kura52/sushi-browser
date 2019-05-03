window.debug = require('debug')('info')
// require('debug').enable("info")
import process from './process';
import {ipcRenderer as ipc} from './ipcRenderer'
import localForage from "../LocalForage";
import path from 'path';
import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import uuid from 'node-uuid';
import { Container, Card, Menu, Input, Button } from 'semantic-ui-react';
import {StickyContainer, Sticky} from 'react-sticky';
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd';

import l10n from '../../brave/js/l10n';
const initPromise = l10n.init()
import '../defaultExtension/contentscript'


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

let theme
let resourcePath
// localForage.getItem('favicon-set').then(setTime=>{
//   ipc.send("favicon-get",setTime ? parseInt(setTime) : null)
//   ipc.once("favicon-get-reply",(e,ret)=>{
//     localForage.setItem('favicon-set',Date.now().toString())
//     for(let [k,v] of Object.entries(ret)){
//       localForage.setItem(k,v)
//     }
//   })
// })

let accessKey, accessPort
async function faviconGet(h){
  console.log(99887766,h.favicon)
  return `chrome://favicon/${h.location}`
}

ipc.send("get-resource-path",{})
ipc.once("get-resource-path-reply",(e,data)=>{
  resourcePath = data
})

function fetchHistory(range){
  ipc.send('fetch-frequently-history',range)
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
  return window.setInterval(func, 10000)
}

function multiByteLen(str) {
  let len = 0;
  str = escape(str);
  const strLen = str.length
  for (let i=0;i<strLen;i++,len++) {
    if (str.charAt(i) == "%") {
      if (str.charAt(++i) == "u") {
        i += 3;
        len++;
      }
      i++;
    }
  }
  return len;
}

function multiByteSlice(str,end) {
  let len = 0
  str = escape(str);
  const strLen = str.length
  let i
  for (i=0;i<strLen;i++,len++) {
    if(len >= end) break
    if (str.charAt(i) == "%") {
      if (str.charAt(++i) == "u") {
        i += 3;
        len++;
      }
      i++;
    }
  }
  return `${unescape(str.slice(0,i))}${i == str.length ? "" :"..."}`;
}


function showDialog(input){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('show-dialog-exploler',key,input)
    ipc.once(`show-dialog-exploler-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}


function insertFavorite(writePath,data){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('insert-favorite',key,writePath,data)
    ipc.once(`insert-favorite-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

class TopMenu extends React.Component {
  constructor(props) {
    super(props)
  }

  setToken(token){
    this.token = token
  }

  render() {
    return (
      <StickyContainer>
        <Sticky>
          <div>
            <Menu pointing secondary >
              <Menu.Item key="top" name="Top" active={true}/>
              <Menu.Item as='a' href='chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite.html' id='bookmark-link' key="favorite" name={l10n.translation('bookmarks')}/>
              <Menu.Item as='a' href='chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/history.html' id='history-link' key="history" name={l10n.translation('history')}/>
              <Menu.Item as='a' href={`${baseURL}/download.html`} key="download" name={l10n.translation('downloads')}/>
              <Menu.Item as='a' href={`${baseURL}/note.html`} key="note" name={l10n.translation('note')}/>
              <Menu.Item as='a' href={`${baseURL}/settings.html`} key="settings" name={l10n.translation('settings')}/>
              <Menu.Item as='a' href={`${baseURL}/explorer.html`} key="file-explorer" name={l10n.translation('fileExplorer')}/>
              <Menu.Item as='a' href={`${baseURL}/terminal.html`} key="terminal" name={l10n.translation('terminal')}/>
              <Menu.Item as='a' href={`${baseURL}/automation.html`} key="automation" name={l10n.translation('automation')}/>
              <Menu.Item as='a' href={`${baseURL}/converter.html`} key="converter" name={l10n.translation('videoConverter')}/>
            </Menu>
          </div>
        </Sticky>
        <TopSearch/>
        <TopList setToken={::this.setToken}/>
      </StickyContainer>
    )
  }
}

class TopSearch extends React.Component {

  componentDidMount() {
    setTimeout(()=>ipc.send('send-to-host', "navbar-search",{}),30)
    console.log("mount")
  }


  sendHost(e){
    console.log(222222)
    ipc.send('send-to-host', "navbar-search",{})
    e.target.value = ""
    e.target.blur()
    e.preventDefault()
  }


  render(){
    return <div className="ui big icon input">
      <input ref="input" type="text" placeholder="Focus Location Bar" onFocus={this.sendHost}/>
      <i aria-hidden="true" className="search icon"></i>
    </div>
  }

}

class HistoryList{

  removeHistory(e){
    ipc.send('remove-history',JSON.parse(e.target.closest('a').dataset.key))
    fetchHistory({})
  }

  async build(data) {
    const historyList = []
    let pre = {location:false}
    let count = 0
    for(let h of data){
      if(count > 7) break
      if(h.location.startsWith('chrome-extension')) continue
      h.updated_at = moment(h.updated_at).format("YYYY/MM/DD HH:mm:ss")
      if(h.location !== pre.location){
        historyList.push(await this.buildItem(h))
        count += 1
        pre = h
      }
    }
    return historyList
  }


  async buildItem(h) {
    const favicon = await faviconGet(h)
    return <div role="listitem" className="item">
      <img src={favicon} style="width: 20px; height: 20px; float: left; margin-right: 4px; margin-top: 6px;"/>
      <div className="content">
        <a className="description" style="float:right;margin-right:15px;font-size: 12px">{h.updated_at.slice(5)}</a>
        {!h.title ? "" : [<a className="header" target="_blank" href={h.location}>{h.title.length > 55 ? `${h.title.substr(0, 55)}...` : h.title}</a>,
<span className="additional-info">[{h.count}pv{h.time ? `, ${getAppropriateTimeUnit(h.time / 1000)}` : ''}]</span>,
<a data-key={`{"_id":"${h._id}"}`} className="trash-link" onClick={this.removeHistory}><i className="cancel icon"></i></a>,<br/>]}
        {!h.location ? "" : <a className="description" target="_blank" style="fontSize: 12px;" href={h.location}>{h.location.length > 125 ? `${h.location.substr(0, 125)}...` : convertURL(h.location)}</a>}
        {h.title ? "" : <a data-key={`{"_id":"${h._id}"}`} className="trash-link" onClick={this.removeHistory}><i className="cancel icon"></i></a>}
      </div>
    </div>;
  }

}

let data
class TopList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {rend:"",removeMap:{}}
  }

  componentDidMount() {
    historyReply((d)=>{
      data = d
      this._render(d)
    })
    fetchHistory({})
  }

  clickButton(){
    showDialog({
      inputable: true, title: `Page`,
      text: `Enter a new page title and URL`,
      needInput: ["Title","URL"]
    }).then(value => {
      console.log(value)
      if (!value) return
      let writePath = 'top-page'
      const data = {title:value[0], url:value[1], is_file:true}
      insertFavorite('top-page',data).then(ret => {
        fetchHistory({})
      })
    })

    const key = uuid.v4()
    ipc.send('insert-favorite',key,writePath,data)
    ipc.once(`insert-favorite-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  }

  async _render(data) {
    const result = []
    const topList = new Map()
    let pre = {location:false}
    for(let h of data.freq.sort((a,b)=> {
      const comp = (a.pin||-999999) - (b.pin||-999999)
      return comp == 0 ? b.count - a.count : comp
    })){
      if(h.location.startsWith('chrome-extension') || this.state.removeMap[h._id]) continue
      if(h.fav){
        result.push(await this.buildItem(h))
        continue
      }
      if(h.location === pre.location){
        if(!pre.title) pre.title = h.title
        if(!pre.favicon) pre.favicon = h.favicon
        topList.set(h.location,[await this.buildItem(h),h.count])
      }
      else{
        if(topList.has(h.location)){
          const ele = topList.get(h.location)
          h.count += ele[1]
        }
        topList.set(h.location,[await this.buildItem(h),h.count])
        pre = h
      }
    }

    let num = result.length
    for(let val of topList.values()){
      result.push(val[0])
      if(++num - 18 >= 0) break
    }

    const hlist= await (new HistoryList().build(data.upd))

    this.setState({rend:<div>
        <Card.Group >
          {result}
          <Button circular icon='plus' onClick={this.clickButton}/>
        </Card.Group>
        <div className={`restore ${this.state.restoreVisible ? '' : 'hidden'}`} >
          {l10n.translation('8251578425305135684')}&nbsp;&nbsp;
          <a onClick={e=>{
            for(let [id,count] of Object.entries(this.state.removeMap)){
              const key = Math.random().toString()
              ipc.send('history-count-reset',key,id,count)
              delete this.state.removeMap[id]
            }
            this.state.restoreVisible = false
            this._render(data)
          }}>{l10n.translation('restoreAll')}</a>
        </div>
        <div className="ui divider"/>
        <div role="list" className="ui divided relaxed list">
          {hlist}
        </div>
      </div>})
  }

  render(){
    return this.state.rend
  }

  async buildItem(h) {
    const favicon = await faviconGet(h)
    return <Card color={h.fav ? 'grey' : (void 0)} key={h._id}>
      <div className={`top-button pin-button ${h.pin ? 'pinned' : ''}`} onClick={e=>{
        e.stopPropagation()
        const key = Math.random().toString()
        ipc.send('history-pin',key,h._id,!h.pin)
        ipc.once(`history-pin-reply_${key}`,(e,val)=>{
          if(val == -1){
            delete h.pin
          }
          else{
            h.pin = val
          }
          this._render(data)
        })
      }}><i className="pin icon" style={{marginTop: 2}}/></div>
      <div className="top-button close-button" onClick={e=>{
        e.stopPropagation()
        const key = Math.random().toString()
        ipc.send('history-count-reset',key,h._id,-1)
        ipc.once(`history-count-reset-reply_${key}`,(e,count)=>{
          this.state.removeMap[h._id] = count
          this.state.restoreVisible = true
          this._render(data)
        })
      }}>×</div>
      <Card.Description>
        {!h.title ? "" : <Card.Header as='a' href={h.location}><img src={favicon} style={{width: 16, height: 16, verticalAlign: "text-top"}}/>{multiByteSlice(h.title,32)} {h.count ? `(${h.count}pv)` : ''}</Card.Header>}
      </Card.Description>
      {h.path ? <a href={h.location} style={{textAlign:"center"}}><img className="capture" style={{width:160,height:100,objectFit: "contain"}} src={`http://localhost:${accessPort}/?key=${accessKey}&file=${resourcePath}/capture/${h.path}`}/></a> : null}
    </Card>;
  }
}

const App = () => (
  <Container>
    <TopMenu/>
  </Container>
)


require('./themeForPage')('themeTopPage')

;(async ()=>{
  [accessKey, accessPort] = await new Promise(r=>{
    ipc.send('get-access-key-and-port')
    ipc.once('get-access-key-and-port-reply',(e,data)=>r(data))
  })
  await initPromise
  ReactDOM.render(<App />,  document.getElementById('app'))
})()