import process from './process'
import {ipcRenderer as ipc} from 'electron';
import localForage from "../LocalForage";
import uuid from 'node-uuid';
import React from 'react';
import ReactDOM from 'react-dom';
import path from 'path';
import {StickyContainer, Sticky} from 'react-sticky';
import {Menu, Segment, Input} from 'semantic-ui-react';
import Selection from '../render/react-selection/index'
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'

import InfiniteTree from '../render/react-infinite-tree';
import rowRenderer from '../render/react-infinite-tree/renderer';
import moment from "moment/moment";

const isMain = location.href.startsWith("chrome://brave/")

let openType
const key = uuid.v4()
ipc.send("get-main-state",key,[isMain ? 'toolbarLink' : 'sidebarLink'])
ipc.once(`get-main-state-reply_${key}`,(e,data)=> {
  openType = data[isMain ? 'toolbarLink' : 'sidebarLink']
})

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

function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}



function dateFormat(d) {
  const m = d.getMonth() + 1
  const da = d.getDate()
  const w = d.getDay()
  const h = d.getHours()
  const mi = d.getMinutes()
  const s = d.getSeconds()

  return `${d.getFullYear()}/${m < 10 ? '0'+ m : m}/${da < 10 ? '0'+ da : da} ${h < 10 ? '0'+ h : h}:${mi < 10 ? '0'+ mi : mi}:${s < 10 ? '0'+ s : s}`
}

function showDialog(input,id){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('show-dialog-exploler',key,input,id)
    ipc.once(`show-dialog-exploler-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}


function getAllStates(name){
  let cond = {}
  if(name){
    switch(name){
      case 'Later than 30 days':
        cond = {end: moment().subtract(30, 'days').valueOf()}
        break;
      case '24 Hours Ago':
        cond = {start: moment().subtract(24, 'hours').valueOf()}
        break;
      case '24-48 Hours Ago':
        cond = {start: moment().subtract(48, 'hours').valueOf(),end: moment().subtract(24, 'hours').valueOf()}
        break;
      default:
        cond = {start: moment().subtract(parseInt(name), 'days').valueOf() ,end: moment().subtract(48, 'hours').valueOf()}
        break;
    }
  }
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('get-all-states',key,cond)
    ipc.once(`get-all-states-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function renameState(dbKey,newName){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('rename-savedState',key,dbKey,newName)
    ipc.once(`rename-savedState-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function openState(id,datas){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('open-savedState',key,id,datas)
    ipc.once(`open-savedState-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function deleteState(dbKey){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('delete-savedState',key,dbKey)
    ipc.once(`delete-savedState-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function traversal(node,arr){
  if(!node) return

  if(node.l){
    if (!node.l.tabs) traversal(node.l,arr)
    else if(node.l.tabs.length) arr.push(...node.l.tabs)
  }

  if(node.r) {
    if (node.r && !node.r.tabs) traversal(node.r, arr)
    else if (node.r.tabs.length) arr.push(...node.r.tabs)
  }

  return arr
}

async function treeBuild(datas){
  const later24h = Date.now() - 60 * 60 * 24 * 1000
  const later24hData = {
    id: '24 Hours Ago',
    name: '24 Hours Ago',
    type : 'directory',
    children: []
  }
  const later48h = Date.now() - 60 * 60 * 48 * 1000
  const later48hData = {
    id: '24-48 Hours Ago',
    name: '24-48 Hours Ago',
    type : 'directory',
    children: []
  }
  const later07d = Date.now() - 60 * 60 * 24 * 7 * 1000
  const later07dData = {
    id: '7 Days Ago',
    name: '7 Days Ago',
    type : 'directory',
    children: []
  }
  const later30d = Date.now() - 60 * 60 * 24 * 30 * 1000
  const later30dData = {
    id: '30 Days Ago',
    name: '30 Days Ago',
    type : 'directory',
    children: []
  }
  const lastData = {
    id: 'Later than 30 Days',
    name: 'Later than 30 Days',
    type : 'directory',
    children: []
  }

  const newChildren = [{
    id: 'saved-sessions',
    name: `User Saved Sessions`,
    type: 'directory',
    children: []
  },later24hData,later48hData,later07dData,later30dData,lastData]

  let pre  = ""
  for(let x of datas){
    const created_at = x.created_at
    x.created_at = dateFormat(new Date(x.created_at))
    x.yyyymmdd = x.created_at.slice(0,10)
    x.name2 = x.created_at.slice(11,16)
    if(pre != x.yyyymmdd){
      (created_at > later24h ? later24hData :
        created_at > later48h ? later48hData :
          created_at > later07d ? later07dData :
            created_at > later30d ? later30dData : lastData).children.push({
        id: x.yyyymmdd,
        name: `[${x.yyyymmdd}]`,
        favicon: 'empty',
        type: 'file'
      })
    }
    pre = x.yyyymmdd

    const id = x._id
    const names = []
    const children = x.wins.map((w,i)=>{
      const arr = []
      const children = traversal(w.winState,arr).map(x=>{
        return {
          id : x.tabKey,
          name: x.title || x.url,
          url: x.url,
          pin: x.pin,
          mute: x.mute,
          lock: x.lock,
          protect: x.protect,
          reloadInterval: x.reloadInterval,
          type: 'file'
        }
      })
      if(!children.length) return null

      names.push(children[0].name)
      return {
        id: `${id}/${i}`,
        datas: w,
        name: `[x:${w.x}, y:${w.y}, w:${w.width}, h:${w.height}${w.maximize ? ', maximized' : ''}] ${children[0].name}${children.length > 1 ? `, ${children.length -1} others`  : ""}`,
        type: 'directory',
        children
      }
    }).filter(x=>x)
    if(!children.length) continue
    const data = {
        id,
        name: x.name || `[${x.user ? x.created_at : x.name2}] ${children.length > 1 ? `[[${children.length} Windows]] ${names.slice(0,2).join(", ")}...` : children[0].name}`,
        user: x.user,
        type: 'directory',
        children: children.length > 1 ? children : children[0].children,
        datas: children.length > 1 ? x.wins : children[0].datas
      }
    ;(data.user ? newChildren[0] : created_at > later24h ? later24hData :
      created_at > later48h ? later48hData :
        created_at > later07d ? later07dData :
          created_at > later30d ? later30dData : lastData).children.push(data)
  }
  return newChildren
}

function searchOpenNodes(nodes,set,tree){
  for(let node of nodes){
    if(node.type == "directory" && set.has(node.id)){
      tree.openNode(node)
      set.delete(node.id)
      if(set.size == 0) break
      searchOpenNodes(node.children,set,tree)
    }
  }
}

async function getAllChildren(name){
  const ret = await getAllStates(name)
  return (await treeBuild(ret))
}


let selectedNodes = [];
let treeAllData,l10n
export default class App extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    ReactDOM.findDOMNode(this.refs.stickey).style.height = "100%"
  }


  recurNewTreeData(datas,reg,openNodes){
    const newDatas = []
    for(let ele of datas){
      if(ele.type == "file"){
        if(reg.test(`${ele.name}\t${ele.url}`)){
          newDatas.push(ele)
        }
      }
      else{
        const newChildren = this.recurNewTreeData(ele.children,reg,openNodes)
        if(newChildren.length > 0){
          openNodes.push(ele.id)
          const ele2 = {...ele,children: newChildren}
          newDatas.push(ele2)
        }
      }
    }
    return newDatas
  }

  async onChange(e,data) {
    const prevState = await localForage.getItem("savedState-sidebar-open-node")
    e.preventDefault()
    if(!treeAllData) return
    let useOrgOpenNodes = !data.value
    const regList = [...new Set(escapeRegExp(data.value).split(/[ 　]+/,-1).filter(x=>x))]
    const reg = new RegExp(regList.length > 1 ? `(?=.*${regList.join(")(?=.*")})`: regList[0],"i")

    console.log(reg)

    const tree = this.refs.content.refs.iTree.tree


    const openNodes = prevState ? prevState.split("\t",-1) : (void 0)
    const newOpenNodes = []
    tree.loadData(this.recurNewTreeData(treeAllData,reg,newOpenNodes),false,useOrgOpenNodes ? openNodes : newOpenNodes)

    localForage.setItem("savedState-sidebar-open-node",prevState)

  }

  render(){
    return <StickyContainer ref="stickey">
      {this.props.sidebar ?
        <Sticky>
          <div>
            <Menu pointing secondary >
              <Menu.Item as='a' href={`${baseURL}/favorite_sidebar.html`} key="favorite" icon="star"/>
              <Menu.Item as='a' href={`${baseURL}/history_sidebar.html`} key="history" icon="history"/>
              <Menu.Item as='a' href={`${baseURL}/download_sidebar.html`} key="download" icon="download"/>
              <Menu.Item as='a' href={`${baseURL}/note_sidebar.html`} key="note" icon="sticky note"/>
              <Menu.Item key="database" icon="database" active={true}/>
              <Menu.Item as='a' href={`${baseURL}/tab_trash_sidebar.html`} key="trash" icon="trash"/>
              <Menu.Item as='a' href={`${baseURL}/tab_history_sidebar.html`} key="tags" icon="tags"/>
              <Menu.Item as='a' href={`${baseURL}/explorer_sidebar.html`} key="file-explorer" icon="folder"/>
            </Menu>
            <Input ref='input' icon='search' placeholder='Search...' size="small" onChange={::this.onChange}/>
          </div>
        </Sticky> :  <Input ref='input' icon='search' placeholder='Search...' size="small" onChange={::this.onChange}/>}
      <Contents ref="content" onClick={this.props.onClick} cont={this.props.cont}/>
    </StickyContainer>
  }
}

class Contents extends React.Component {
  updatePreview(node) {
    console.log(node)
  }

  async loadAllData(name){
    if(!name) this.loaded = true
    const prevState = this.prevState || (await localForage.getItem("savedState-sidebar-open-node"))
    this.prevState = (void 0)
    const data = await getAllChildren(name)
    console.log(data)
    treeAllData = data

    localForage.setItem("savedState-sidebar-open-node",prevState)
    const openNodes = prevState ? prevState.split("\t",-1) : (void 0)
    const tree = this.refs.iTree.tree
    if(tree){
      tree.loadData(data,false,openNodes)
    }
    else{
      setTimeout(_=>tree.loadData(data,false,openNodes),100)
    }
    return data
  }

  async componentDidMount() {
    if(isMain && !this.props.onClick) return

    if(isMain){
      this.loaded = false
      const items = await localForage.getItem("savedState-sidebar-open-node")
      await localForage.setItem("savedState-sidebar-open-node",items ? `${[...new Set([...items.split("	"),'24 Hours Ago'])].join("\t")}` : '24 Hours Ago')
      const promise = this.loadAllData('24 Hours Ago')
      const self = this
      this.scrollEvent = function(e){
        if(self.loaded) return
        const scroll = this.scrollTop
        const range = this.scrollHeight - this.offsetHeight

        if(range - scroll < 300){
          self.loadAllData()
        }
      }
      document.querySelector('.infinite-tree.infinite-tree-scroll').addEventListener('scroll',this.scrollEvent,{passive:true})

      await promise
      const scroll = document.querySelector('.infinite-tree.infinite-tree-scroll')
      if(scroll.clientHeight == scroll.scrollHeight){
        self.loadAllData()
      }
    }
    else{
      this.loadAllData()
    }
    this.eventUpdateDatas = (e,data)=>{
      console.log('eventUpdateDatas')
      this.loadAllData()
    }
    ipc.on("update-datas",this.eventUpdateDatas)

    const tree = this.refs.iTree.tree
    this.onMouseDown = (event)=>{
      if(!this.refs.iTree) return
      const currentNode = tree.getNodeFromPoint(event.x, event.y);
      if (!currentNode) {
        return;
      }

      if(event.which == 3){
        ipc.send("savedState-menu",!currentNode.id.match(/[/_-]/))
        this.menuKey = currentNode
        return
      }
    }
    tree.contentElement.addEventListener('mousedown',this.onMouseDown)
    this.initEvents()
  }

  componentWillUnmount() {
    const tree = this.refs.iTree.tree
    tree.contentElement.removeEventListener('mousedown',this.onMouseDown)
    if(this.event) ipc.removeListener("savedState-menu-reply",this.event)
    if(this.eventUpdateDatas) ipc.removeListener("update-datas",this.eventUpdateDatas)
    if(isMain) {
      const ele = document.querySelector('.infinite-tree.infinite-tree-scroll')
      if(ele) ele.removeEventListener('scroll', this.scrollEvent, {passive: true})
    }
  }

  initEvents() {
    this.event = (e, cmd) => {
      if(cmd == "openInNewWindow") {
        const currentNode = this.menuKey
        this.menuKey = (void 0)
        openState(this.props.cont ? this.props.cont.getId() : (void 0),currentNode.datas || currentNode.id).then(_=>{
          this.props.onClick && this.props.onClick()
        })
      }
      else if(cmd == "delete") {
        const currentNode = this.menuKey
        this.menuKey = (void 0)
        deleteState(currentNode.id).then(_ => {
          if(isMain) this.eventUpdateDatas()
        })
      }
      else if(cmd == "edit"){
        if (this.props.onClick) this.props.onClick()
        const currentNode = this.menuKey
        this.menuKey = (void 0)
        showDialog({
          inputable: true, title: 'Rename',
          text: `Enter a new Name`,
          initValue: [currentNode.name],
          needInput: ["Title"]
        },this.props.cont ? this.props.cont.getId() : (void 0)).then(value => {
          if (!value) return
          const data = {name:value[0]}
          renameState(currentNode.id,data).then(_=>_)
        })
      }
    }
    ipc.on('savedState-menu-reply', this.event)
  }


  getKey(node,ind=1){
    if(!node.id) return 'root'
    const arr = node.id.split('/')
    return arr[arr.length - ind]
  }

  render() {
    const self = this
    return (
      <div style={{paddingLeft:4,paddingTop:4,width:this.props.cont ? '600px' : 'calc(100vw - 4px)'}}>
        <InfiniteTree
          ref="iTree"
          noDataText=""
          loadNodes={(parentNode, done) => {
            console.log(11,parentNode.id)
            getAllChildren(parentNode.id).then(children => done(null, children))
          }}
          rowRenderer={rowRenderer(18)}
          selectable={true}
          shouldSelectNode={(node) => { // Defaults to null
            if (!node || (node === this.refs.iTree.tree.getSelectedNode())) {
              return false; // Prevent from deselecting the current node
            }
            return true;
          }}
          onClick={(event) => {
            const tree = this.refs.iTree.tree
            const currentNode = tree.getNodeFromPoint(event.x, event.y);
            if (!currentNode) {
              return;
            }

            if(currentNode.type == 'file'){
              const type = event.button == 1 ? 'create-web-contents' : openType ? 'new-tab' : 'load-url'
              if(this.props.cont) {
                this.props.cont.hostWebContents.send('restore-tab', this.props.cont.getId(), currentNode.id, void 0, [] ,type)
                if (this.props.onClick) this.props.onClick()
              }
              else{
                ipc.sendToHost("restore-tab-opposite", currentNode.id, void 0, [],type)
              }
              return
            }
            else{
              tree.toggleNode(currentNode);
              return;
            }
          }}
          onKeyDown={(event) => {
            const tree = this.refs.iTree.tree
            const target = event.target || event.srcElement; // IE8
            console.log('onKeyDown', target);
            event.preventDefault();

            const node = tree.getSelectedNode();
            const nodeIndex = tree.getSelectedIndex();

            if (event.keyCode === 37) { // Left
              tree.closeNode(node);
            } else if (event.keyCode === 38) { // Up
              const prevNode = tree.nodes[nodeIndex - 1] || node;
              tree.selectNode(prevNode);
            } else if (event.keyCode === 39) { // Right
              tree.openNode(node);
            } else if (event.keyCode === 40) { // Down
              const nextNode = tree.nodes[nodeIndex + 1] || node;
              tree.selectNode(nextNode);
            }
          }}
          onOpenNode={(node) => {
            localForage.setItem("savedState-sidebar-open-node",this.refs.iTree.tree.getOpenNodes().map(node=>node.id).join("\t"))
          }}
          onCloseNode={(node) => {
            localForage.setItem("savedState-sidebar-open-node",this.refs.iTree.tree.getOpenNodes().map(node=>node.id).join("\t"))
          }}
        />
      </div>
    );
  }
}
