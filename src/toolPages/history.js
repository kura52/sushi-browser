window.debug = require('debug')('info')
// require('debug').enable("info")
import process from './process'
import {ipcRenderer as ipc} from './ipcRenderer'
import localForage from "../LocalForage";
import path from 'path';
import React from 'react';
import ReactDOM from 'react-dom';
import {Container, List, Menu, Input, Button} from 'semantic-ui-react';
import {StickyContainer, Sticky} from 'react-sticky';
import moment from 'moment';
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'
import Clusterize from 'clusterize.js';

import l10n from '../../brave/js/l10n';
const initPromise = l10n.init()
import '../defaultExtension/contentscript'



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


let resourcePath
localForage.getItem('favicon-set').then(setTime=>{
  ipc.send("favicon-get",setTime ? parseInt(setTime) : null)
  ipc.once("favicon-get-reply",(e,ret)=>{
    localForage.setItem('favicon-set',Date.now().toString())
    for(let [k,v] of Object.entries(ret)){
      localForage.setItem(k,v)
    }
  })
})

let accessKey, accessPort
async function faviconGet(h){
  return h.favicon ? (await localForage.getItem(h.favicon)) || `http://localhost:${accessPort}/?key=${accessKey}&file=${resourcePath}/file.svg` : `http://localhost:${accessPort}/?key=${accessKey}&file=${resourcePath}/file.svg`
}

ipc.send("get-resource-path",{})
ipc.once("get-resource-path-reply",(e,data)=>{
  resourcePath = data
})

function fetchHistory(range){
  ipc.send('fetch-history',range)
}

function searchHistory(cond){
  ipc.send('search-history',cond)
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

class TopMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {items:['48 Hours Ago','All'], activeItem: '48 Hours Ago' }
    this.updateDatas = []
    this.token = {}
    this.cond =  {start: moment().subtract(48, 'hours').valueOf()}

  }

  removeHistory(e){
    chrome.ipcRenderer.send('remove-history',JSON.parse(e.target.closest('a').dataset.key))
  }

  componentDidMount() {
    fetchHistory(this.cond)
    historyReply(async (data)=>{
      this.list = await new HistoryList().build(data)
      if(this.clusterize){
        this.clusterize.update(this.list)
      }
      else{
        this.clusterize = new Clusterize({
          rows: this.list,
          scrollId: 'scrollArea',
          contentId: 'contentArea'
        });
      }
      for(let ele of document.querySelectorAll(".trash-link")){
        ele.addEventListener('click',this.removeHistory)
      }
    })
    this.eventUpdateDatas = (e,data)=>{
      this.updateDatas.push(data)
    }
    ipc.on("update-datas",this.eventUpdateDatas)

    this.token = intervalRun(()=>{
      if(this.updateDatas.length > 0){
        fetchHistory(this.cond)
        this.updateDatas = []
      }
    },this.token)
  }

  handleItemClick(e, { name }){
    this.setState({ activeItem: name })
    switch(name){
      case 'All':
        this.cond = {}
        this.token = onceRun(()=>fetchHistory(this.cond),this.token)
        break;
      case '48 Hours Ago':
        this.cond = {start: moment().subtract(parseInt(name), 'hours').valueOf()}
        this.token = onceRun(()=>fetchHistory(this.cond),this.token)
        break;
      default:
        this.cond = {start: moment().subtract(parseInt(name), 'days').valueOf()}
        this.token = onceRun(()=>fetchHistory(this.cond),this.token)
        break;
    }

  }

  setToken(token){
    this.token = token
  }

  onChange(e,data) {
    e.preventDefault()
    clearTimeout(this.timer);
    this.timer = setTimeout(()=>{
      if(data.value){
        this.token = onceRun(()=>searchHistory(escapeRegExp(data.value).split(/[ 　]+/,-1).filter(x=>x)),this.token)
      }
      else{
        this.token = onceRun(()=>fetchHistory(this.cond),this.token)
      }
    }, 200)
  }

  render() {
    console.log(this.token)
    const { activeItem } = this.state
    console.log(this.state)
    return (
      <StickyContainer>
        <Sticky>
          <div>
            <Menu pointing secondary >
              {this.state.items.map(item=>{
                return <Menu.Item key={item} name={item} active={activeItem === item} onClick={activeItem === item ? (void 0) : ::this.handleItemClick} />
              })}
              {/*<Menu.Item as='a' href={`${baseURL}/history_full.html`} key="history-full" name="Fulltext History"/>*/}
              <Menu.Menu >
                <Menu.Item>
                  <Input ref='input' icon='search' placeholder='Search...' onChange={::this.onChange}/>
                </Menu.Item>
                <Menu.Item>
                  <Button style={{left: -22}} icon='cancel' onClick={_=>{
                    const key = Math.random().toString()
                    ipc.send('show-dialog-exploler',key,{text: "Are you sure you want to delete all the history data?", buttons: ['OK', 'Cancel'], normal:true})
                    ipc.once(`show-dialog-exploler-reply_${key}`,(event,ret)=>{
                      if(ret === 0) chrome.ipcRenderer.send('remove-history',{all: true})

                    })
                    }
                  } content="Clear All history"/>
                </Menu.Item>
              </Menu.Menu>
              <Menu.Item as='a' href='chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html' id='top-link' key="top" name="Top" style={{
                borderLeft: "2px solid rgba(34,36,38,.15)",
                marginLeft: 20,
                paddingLeft: 30
              }}/>
              <Menu.Item as='a' href='chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite.html' id='bookmark-link' key="favorite" name={l10n.translation('bookmarks')}/>
              <Menu.Item as='a' href={`${baseURL}/download.html`} key="download" name={l10n.translation('downloads')}/>
              <Menu.Item as='a' href={`${baseURL}/note.html`} key="note" name={l10n.translation('note')}/>
              <Menu.Item as='a' href={`${baseURL}/settings.html`} key="settings" name={l10n.translation('settings')}/>
            </Menu>
          </div>
        </Sticky>
        <div id="scrollArea" style="height: calc(100vh - 46px); overflow-y: scroll;">
          <div role="list" id="contentArea" className="ui divided relaxed list">
          </div>
        </div>
      </StickyContainer>
    )
  }
}

class HistoryList{
  async build(data) {
    const historyList = []
    let pre = {location:false}
    for(let h of data){
      h.updated_at = moment(h.updated_at).format("YYYY/MM/DD HH:mm:ss")
      h.yyyymmdd = h.updated_at.slice(0,10)
      if(pre.yyyymmdd != h.yyyymmdd){
        historyList.push(`<h4>${h.yyyymmdd}<a data-key='{"date":"${h.yyyymmdd}"}' class="trash-link left-pad"><i class="cancel icon"></i></a></h4>`)
      }
      if(h.location === pre.location){
        if(!pre.title) pre.title = h.title
        if(!pre.favicon) pre.favicon = h.favicon
        historyList[historyList.length-1] = await this.buildItem(pre)
      }
      else{
        historyList.push(await this.buildItem(h))
        pre = h
      }
    }
    return historyList
  }


  async buildItem(h) {
    const favicon = await faviconGet(h)
    return `<div role="listitem" class="item">
      <img src="${favicon}" style="width: 20px; height: 20px; float: left; margin-right: 4px; margin-top: 6px;"/>
      <div class="content">
        <a class="description" style="float:right;margin-right:15px;font-size: 12px">${h.updated_at.slice(5)}</a>
        ${!h.title ? "" : `<a class="header" target="_blank" href=${h.location}>${h.title.length > 55 ? `${h.title.substr(0, 55)}...` : h.title}</a>
<span class="additional-info">[${h.count}pv${h.time ? `, ${getAppropriateTimeUnit(h.time / 1000)}` : ''}]</span>
<a data-key='{"_id":"${h._id}"}' class="trash-link"><i class="cancel icon"></i></a><br>`}
        ${!h.location ? "" : `<a class="description" target="_blank" style="fontSize: 12px;" href=${h.location}>${h.location.length > 125 ? `${h.location.substr(0, 125)}...` : convertURL(h.location)}</a>`}
        ${h.title ? "" : `<a data-key='{"_id":"${h._id}"}' class="trash-link"><i class="cancel icon"></i></a>`}
      </div>
    </div>`;
  }

}

const App = () => (
  <Container>
    <TopMenu/>
  </Container>
)

require('./themeForPage')('themeHistory')

;(async ()=>{
  [accessKey, accessPort] = await new Promise(r=>{
    ipc.send('get-access-key-and-port')
    ipc.once('get-access-key-and-port-reply',(e,data)=>r(data))
  })
  await initPromise
  ReactDOM.render(<App />,  document.getElementById('app'))
})()