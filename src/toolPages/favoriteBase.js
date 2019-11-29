import process from './process'
import {ipcRenderer as ipc} from './ipcRenderer'
import localForage from "../LocalForage";
import uuid from 'node-uuid';
import React from 'react';
import ReactDOM from 'react-dom';
import path from 'path';
import {StickyContainer, Sticky} from 'react-sticky';
import {Menu, Segment, Input} from 'semantic-ui-react';
import classNames from 'classnames'
import elementClass from 'element-class'
import escapeHTML from 'escape-html'
import Selection from '../render/react-selection/index'
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'

import InfiniteTree from '../render/react-infinite-tree';
import rowRenderer from '../render/react-infinite-tree/renderer';

const isMain = location.href.startsWith("file://")

let openType
const key = uuid.v4()
ipc.send("get-main-state",key,[isMain ? 'toolbarLink' : 'sidebarLink'])
ipc.once(`get-main-state-reply_${key}`,(e,data)=> {
  openType = data[isMain ? 'toolbarLink' : 'sidebarLink']
})

async function faviconGet(x){
  return x.favicon == "resource/file.svg" ? (void 0) :
    isMain ? x.favicon && (await localForage.getItem(x.favicon)) :
      `chrome://favicon/${x.url}`
}

function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
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

// function getFavorites(dbKey){
//   return new Promise((resolve,reject)=>{
//     const key = uuid.v4()
//     ipc.send('get-favorites',key,dbKey)
//     ipc.once(`get-favorites-reply_${key}`,(event,ret)=>{
//       resolve(ret)
//     })
//   })
// }

function getAllFavorites(dbKey,num){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('get-all-favorites',key,dbKey,num ? num() : void 0)
    ipc.once(`get-all-favorites-reply_${key}`,(event,ret)=>{
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

function insertFavorite2(writePath,dbKey,data){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('insert-favorite2',key,writePath,dbKey,data)
    ipc.once(`insert-favorite2-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function renameFavorite(dbKey,newName){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('rename-favorite',key,dbKey,newName)
    ipc.once(`rename-favorite-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function openFavorite(dbKey,id,type){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('open-favorite',key,dbKey,id,type)
    ipc.once(`open-favorite-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function deleteFavorite(dbKey,newName){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('delete-favorite',key,dbKey,newName)
    ipc.once(`delete-favorite-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function moveFavorite(args){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('move-favorite',key,args)
    ipc.once(`move-favorite-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

async function treeBuild(datas,nodePath){
  const newChildren = []
  for(let x of datas){
    const id = `${nodePath}/${x.key}`
    const data = {
      id,
      name: x.title,
      url: x.url,
      favicon: await faviconGet(x),
      // loadOnDemand: !x.is_file,
      type: x.is_file ? 'file' : 'directory'
    }
    if(x.children2){
      data.children = await treeBuild(x.children2,id)
    }
    newChildren.push(data)
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

async function getAllChildren(nodePath,num){
  const dbKey = path.basename(nodePath)
  const ret = await getAllFavorites([dbKey],num)
  // console.log(treeBuild(ret,nodePath))
  return (await treeBuild(ret,''))[0].children
}


let selectedNodes = [];
let treeAllData,l10n
export default class App extends React.Component {
  constructor(props) {
    super(props)
    l10n = this.props.favoritePage && require('../../brave/js/l10n')
  }

  componentDidMount() {
    ReactDOM.findDOMNode(this.refs.stickey).style.height = "100%"
  }

  afterSelect(selectedTargets){
    if(selectedTargets.length == 0) return

    const tree = this.refs.content.refs.iTree.tree
    // const selectedNode = tree.getSelectedNode();
    // if (selectedNodes.length === 0 && selectedNode) {
    //   selectedNodes.push(selectedNode);
    //   tree.state.selectedNode = null;
    // }


    const targetNodes = selectedTargets.map(ele=>{
      const nodeId = ele.dataset.id
      return tree.getNodeById(nodeId)
    })

    for(let currentNode of targetNodes){
      const index = selectedNodes.indexOf(currentNode);

      // Remove current node if the array length of selected nodes is greater than 1
      if (index >= 0 && selectedNodes.length > 1) {
        currentNode.state.selected = false;
        selectedNodes.splice(index, 1);
        tree.updateNode(currentNode, {}, { shallowRendering: true },true);
      }

      // Add current node to the selected nodes
      if (index < 0) {
        currentNode.state.selected = true;
        selectedNodes.push(currentNode);
        tree.updateNode(currentNode, {}, { shallowRendering: true },true);
      }
    }

    tree.update()

  }

  clearSelect(){
    const tree = this.refs.content.refs.iTree.tree
    // Empty an array of selected nodes
    selectedNodes.forEach(selectedNode => {
      selectedNode.state.selected = false;
      tree.updateNode(selectedNode, {}, { shallowRendering: true },true)
    });
    selectedNodes = [];

    tree.update()

  }

  recurNewTreeData(datas,reg){
    const newDatas = []
    for(let ele of datas){
      if(ele.type == "file"){
        if(reg.test(`${ele.name}\t${ele.url}`)){
          newDatas.push(ele)
        }
      }
      else{
        const newChildren = this.recurNewTreeData(ele.children,reg)
        if(newChildren.length > 0){
          newDatas.push({
            id: ele.id,
            name: ele.name,
            url: ele.url,
            favicon: ele.favicon,
            type: ele.type,
            children: newChildren
          })
        }
      }
    }
    return newDatas
  }

  async onChange(e,data) {
    const prevState = await localForage.getItem("favorite-sidebar-open-node")
    e.preventDefault()
    if(!treeAllData) return
    const regList = [...new Set(escapeRegExp(data.value).split(/[ 　]+/,-1).filter(x=>x))]
    const reg = new RegExp(regList.length > 1 ? `(?=.*${regList.join(")(?=.*")})`: regList[0],"i")

    console.log(reg)

    const tree = this.refs.content.refs.iTree.tree


    const openNodes = prevState ? prevState.split("\t",-1) : (void 0)
    tree.loadData(this.recurNewTreeData(treeAllData,reg),false,openNodes)

    localForage.setItem("favorite-sidebar-open-node",prevState)

  }

  render(){
    return <StickyContainer ref="stickey">
      {this.props.sidebar ?
        <Sticky>
          <div>
            <Menu pointing secondary >
              <Menu.Item key="favorite" icon="star" active={true}/>
              <Menu.Item as='a' href={`${baseURL}/history_sidebar.html`} key="history" icon="history"/>
              <Menu.Item as='a' href={`${baseURL}/download_sidebar.html`} key="download" icon="download"/>
              <Menu.Item as='a' href={`${baseURL}/note_sidebar.html`} key="note" icon="sticky note"/>
              <Menu.Item as='a' href={`${baseURL}/saved_state_sidebar.html`} key="database" icon="database"/>
              <Menu.Item as='a' href={`${baseURL}/tab_trash_sidebar.html`} key="trash" icon="trash"/>
              <Menu.Item as='a' href={`${baseURL}/tab_history_sidebar.html`} key="tags" icon="tags"/>
              <Menu.Item as='a' href={`${baseURL}/explorer_sidebar.html`} key="file-explorer" icon="folder"/>
            </Menu>
            <Input ref='input' icon='search' placeholder='Search...' size="small" onChange={::this.onChange}/>
          </div>
        </Sticky> :
        this.props.favoritePage ?
          <Sticky>
            <div>
              <Menu pointing secondary >
                <Menu.Item as='a' href='chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html' id='top-link' key="top" name="Top"/>
                <Menu.Item key="favorite" name={l10n.translation('bookmarks')} active={true}/>
                <Menu.Item as='a' href='chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/history.html' id='history-link' key="history" name={l10n.translation('history')}/>
                <Menu.Item as='a' href={`${baseURL}/download.html`} key="download" name={l10n.translation('downloads')}/>
                <Menu.Item as='a' href={`${baseURL}/note.html`} key="note" name={l10n.translation('note')}/>
                <Menu.Item as='a' href={`${baseURL}/settings.html`} key="settings" name={l10n.translation('settings')}/>
                <Menu.Item as='a' href={`${baseURL}/explorer.html`} key="file-explorer" name={l10n.translation('fileExplorer')}/>
                <Menu.Item as='a' href={`${baseURL}/terminal.html`} key="terminal" name={l10n.translation('terminal')}/>
                <Menu.Item as='a' href={`${baseURL}/automation.html`} key="automation" name={l10n.translation('automation')}/>
                <Menu.Item as='a' href={`${baseURL}/converter.html`} key="converter" name={l10n.translation('videoConverter')}/>
              </Menu>
              <Input ref='input' icon='search' placeholder='Search...' size="small" onChange={::this.onChange}/>
            </div>
          </Sticky>
          : this.props.searchNum || this.props.searchKey ? null
          : <Input ref='input' icon='search' placeholder='Search...' size="small" onChange={::this.onChange}/>}
      {this.props.cont ?  <Contents ref="content" onClick={this.props.onClick} bookmarkbarLink={this.props.bookmarkbarLink}
                                    cont={(typeof this.props.cont) == 'function' ? this.props.cont() : this.props.cont} searchNum={this.props.searchNum} searchKey={this.props.searchKey}/>:
        <Selection ref="select" target=".infinite-tree-item" selectedClass="selection-selected"
                   afterSelect={::this.afterSelect} clearSelect={::this.clearSelect}>
          <Contents ref="content" topPage={this.props.topPage} favoritePage={this.props.favoritePage} searchNum={this.props.searchNum} searchKey={this.props.searchKey}/>
        </Selection>}
    </StickyContainer>
  }
}

class Contents extends React.Component {
  // tree = null;

  updatePreview(node) {
    console.log(node)
  }

  async loadAllData(){
    const prevState = this.prevState || (await localForage.getItem("favorite-sidebar-open-node"))
    this.prevState = (void 0)
    getAllChildren(this.props.searchKey || 'root').then(data=>{
      const limit = this.props.searchNum ? this.props.searchNum() : 0
      console.log(data)
      data = data.slice(limit)
      treeAllData = data.slice(limit)

      localForage.setItem("favorite-sidebar-open-node",prevState)
      const openNodes = prevState ? prevState.split("\t",-1) : (void 0)
      const tree = this.refs.iTree.tree
      if(tree){
        tree.loadData(data,false,openNodes)
      }
      else{
        setTimeout(_=>tree.loadData(data,false,openNodes),100)
      }
    })
  }

  componentDidMount() {
    console.log('fsfsdf','componentDidMount')
    if(isMain && !this.props.onClick) return
    this.loadAllData()
    this.eventUpdateDatas = (e,data)=>{
      console.log('eventUpdateDatas')
      this.loadAllData()
    }
    ipc.on("update-datas",this.eventUpdateDatas)

    this.eventDropLink = (e,url,text)=>{
      let el = document.elementFromPoint(this.mousePoint.x, this.mousePoint.y);
      if(!el) return

      el = el.closest('.infinite-tree-node')
      if(!el) return
      el = el.parentNode

      const tree = this.refs.iTree.tree
      let dropNode = tree.getNodeById(el.dataset.id)
      console.log(dropNode,el,this.mousePoint,url)

      const newDirectory = dropNode.type == 'file' ? this.getKey(dropNode,2) : this.getKey(dropNode,1)
      const dropKey = dropNode && this.getKey(dropNode)

      const key = uuid.v4()
      ipc.send('insert-favorite2',key,newDirectory,dropKey,{title:text || url, url, is_file:true})
      // ipc.once(`insert-favorite2-reply_${key}`,e=>{
      //
      // })
    }
    ipc.on('add-favorite-by-drop',this.eventDropLink)

    const tree = this.refs.iTree.tree
    this.onMouseDown = (event)=>{
      if(!this.refs.iTree) return
      const currentNode = tree.getNodeFromPoint(event.x, event.y);
      if (!currentNode) {
        return;
      }

      if(event.which == 3){
        const nodes = [...new Set([currentNode,...selectedNodes])]
        ipc.send("favorite-menu",nodes.map(node=>(node.url || node.title)))
        this.menuKey = nodes
        return
      }
    }
    tree.contentElement.addEventListener('mousedown',this.onMouseDown)
    this.initEvents()
    this.initDragEvents()
  }

  componentWillUnmount() {
    console.log('fsfsdf','componentWillUnmount')
    const tree = this.refs.iTree.tree
    tree.contentElement.removeEventListener('mousedown',this.onMouseDown)
    document.removeEventListener('dragstart', this.onDragStart);
    document.removeEventListener('dragend',this.onDragEnd,false);
    tree.contentElement.removeEventListener('dragover',this.onDragOver);
    if(this.event) ipc.removeListener("favorite-menu-reply",this.event)
    if(this.eventUpdateDatas) ipc.removeListener("update-datas",this.eventUpdateDatas)
    if(this.eventDropLink) ipc.removeListener('add-favorite-by-drop',this.eventDropLink)
  }

  initEvents() {
    this.event = (e, cmd) => {
      if(cmd == "openInNewTab" || cmd == "openInNewPrivateTab" || cmd == "openInNewTorTab" || cmd == "openInNewSessionTab" || cmd == "openInNewWindow" || cmd == "openInNewWindowWithOneRow" || cmd == "openInNewWindowWithTwoRow") {
        const nodes = this.menuKey
        this.menuKey = (void 0)
        openFavorite(nodes.map(n=>this.getKey(n)),this.props.cont ? this.props.cont.id : this.props.topPage ? -1 : (void 0),cmd).then(_=>{
          console.log(324234235346545)
          this.props.onClick && this.props.onClick()
        })
      }
      else if(cmd == "delete") {
        // const tree = this.refs.iTree.tree
        // const nodeIndex = tree.getSelectedIndex()

        const nodes = this.menuKey
        this.menuKey = (void 0)
        const parentNodes = nodes.map(n => n.getParent())
        deleteFavorite(nodes.map(n=>this.getKey(n)),parentNodes.map(parent=>this.getKey(parent))).then(_ => {
          if(isMain) this.eventUpdateDatas()
          // if(nodeIndex !== -1){
          // const nextNode = tree.nodes[nodeIndex + 1] || tree.nodes[nodeIndex - 1]
          //   selectedNodes.splice(0,selectedNodes.length,nextNode)
          //   setTimeout(_=>tree.selectNode(nextNode),10)
          // }
        })
      }
      else if(cmd == "edit"){
        if (this.props.onClick) this.props.onClick()
        const nodes = this.menuKey
        this.menuKey = (void 0)
        showDialog({
          inputable: true, title: 'Rename',
          text: `Enter a new Name`,
          initValue: nodes[0].type == 'file' ? [nodes[0].name,nodes[0].url] : [nodes[0].name],
          needInput: nodes[0].type == 'file' ? ["Title","URL"] : ["Title"]
        },this.props.cont ? this.props.cont.id : (void 0)).then(value => {
          if (!value) return
          const data = nodes[0].type == 'file' ? {title:value[0], url:value[1]} : {title:value[0]}
          console.log(this.getKey(nodes[0]),data)
          renameFavorite(this.getKey(nodes[0]),data).then(_=>_)
        })
      }
      else if(cmd == "addBookmark" || cmd == "addFolder") {
        const isPage = cmd == "addBookmark"
        const nodes = this.menuKey
        this.menuKey = (void 0)
        showDialog({
          inputable: true, title: `New ${isPage ? 'Page' : 'Directory'}`,
          text: `Enter a new ${isPage ? 'page title and URL' : 'directory name'}`,
          needInput: isPage ? ["Title","URL"] : [""]
        },this.props.cont ? this.props.cont.id : (void 0)).then(value => {
          if (!value) return
          const data = isPage ? {title:value[0], url:value[1], is_file:true} : {title:value[0], is_file:false,children:[]}
          if(nodes[0].type == 'file'){
            insertFavorite2(this.getKey(nodes[0].getParent()),this.getKey(nodes[0]),data).then(_=>_)
          }
          else{
            insertFavorite(this.getKey(nodes[0]),data).then(_=>_)
          }
        })
      }
    }
    ipc.on('favorite-menu-reply', this.event)
  }

  initDragEvents(){

    const tree = this.refs.iTree.tree
    let currentElement,dragImage
    let draggingX = 0;
    let draggingY = 0;
    const head_bottom = 3
    const middle = 6;


    const createDragImage = (e,num)=>{
      const canvas = document.createElement('canvas')
      canvas.className = 'drag-image'
      document.body.appendChild(canvas)
      const context = canvas.getContext('2d')

      canvas.width = 85
      canvas.height = 20

      context.fillStyle = '#666666'
      context.fillRect(0, 0, canvas.width, canvas.height)

      context.fillStyle = '#dddddd'
      context.font = 'bold 13px Arial'
      context.fillText(`${num} Items`, 15, 15)

      e.dataTransfer.setDragImage(canvas, 5, 9)
      return canvas
    }

    const getSelectClass = (el)=>{
      return el.classList.contains('infinite-tree-selected') ? ' infinite-tree-selected' : ''
    }


    this.onDragStart = (e) => {
      draggingX = 0;
      draggingY = 0;
      if(selectedNodes.length > 1){
        const canvas = createDragImage(e,selectedNodes.length)
        dragImage = canvas
      }
    }
    document.addEventListener('dragstart', this.onDragStart);

    document.addEventListener("drop", e=>{
      e.preventDefault()
    }, false)

    document.addEventListener('mousemove',e=>{
      this.mousePoint = {x:e.clientX, y:e.clientY}
    },{passive:true})

    this.onDragEnd = async (e) => {
      console.log('dragend',e)
      if(currentElement){
        console.log('dragend')
        console.log(e.target)

        const tree = this.refs.iTree.tree
        const dropElement = currentElement
        let dropNode = tree.getNodeById(currentElement.dataset.id)

        const dragNode = tree.getNodeById(e.target.dataset.id)

        const dropClassList = dropElement.classList

        let newDirectory,next
        if(dropClassList.contains('folder-item')){
          newDirectory = this.getKey(dropNode)
          dropNode = (void 0)
        }
        else if(dropClassList.contains('top-overlap')){
          newDirectory = this.getKey(dropNode,2)
          const treePrev = dropNode.getPreviousSibling()
          if(treePrev){
            dropNode = treePrev
          }
          else{
            const prev = dropElement.previousSibling
            if(prev){
              dropNode = tree.getNodeById(prev.dataset.id)
            }
            else{
              dropNode = tree.getRootNode()
            }
          }
        }
        else if(!dropClassList.contains('middle') && dropElement.getElementsByClassName('folder-open').length !== 0 && dropNode.hasChildren()){
          newDirectory = this.getKey(dropNode)
        }
        else if(next = dropElement.nextSibling){
          dropNode = tree.getNodeById(next.dataset.id)
          newDirectory = this.getKey(dropNode,2)
          dropNode = dropNode.getPreviousSibling() || tree.getRootNode()
        }
        else{
          newDirectory = 'root'
          dropNode = tree.getRootNode().getLastChild()
        }

        const dropKey = dropNode && this.getKey(dropNode)
        const nodesNotHaveParent = this.rejectKeysHaveParent([...new Set([dragNode,...selectedNodes])])


        const renameArgs = []
        for(let node of nodesNotHaveParent){
          const [dragKey,oldDirectory] = node.id.split('/').slice(-2).reverse()
          if(dragKey === dropKey) continue
          renameArgs.push([dragKey,oldDirectory,newDirectory,dropKey])
        }
        console.log('renameArgs',renameArgs)
        if(renameArgs.length > 0){
          this.prevState = await localForage.getItem("favorite-sidebar-open-node")
          moveFavorite(renameArgs).then(_ =>{
            if(isMain) this.eventUpdateDatas()
          })
        }


        currentElement.className = `infinite-tree-item${currentElement.classList.contains('infinite-tree-selected') ? ' infinite-tree-selected' : ''}`
        if(currentElement.previousSibling) currentElement.previousSibling.classList.remove('bottom-previous-sibling-overlap')
        if(currentElement.nextSibling) currentElement.nextSibling.classList.remove('top-next-sibling-overlap')
        currentElement = (void 0)
      }
      if(dragImage){
        document.body.removeChild(dragImage)
        dragImage = (void 0)
      }
    }
    document.addEventListener('dragend',this.onDragEnd,false);


    this.onDragOver = (e) => {
      e.preventDefault();

      const event = e

      const movementX = event.x - (Number(draggingX) || event.x);
      const movementY = event.y - (Number(draggingY) || event.y);

      draggingX = event.x;
      draggingY = event.y;

      if (movementY === 0) {
        return;
      }

      let el = document.elementFromPoint(event.x, event.y);
      while (el && el.parentElement !== tree.contentElement) {
        el = el.parentElement;
      }
      if (!el /*|| el === ghostElement*/) {
        return;
      }

      const id = el.getAttribute(tree.options.nodeIdAttr);
      if (id === undefined) {
        return;
      }

      if(currentElement && currentElement !== el){
        // console.log('not',currentElement,el)
        currentElement.className = `infinite-tree-item${currentElement.classList.contains('infinite-tree-selected') ? ' infinite-tree-selected' : ''}`
        if(currentElement.previousSibling) currentElement.previousSibling.classList.remove('bottom-previous-sibling-overlap')
        if(currentElement.nextSibling) currentElement.nextSibling.classList.remove('top-next-sibling-overlap')
      }

      const rect = el.getBoundingClientRect();

      const folder = el.getElementsByClassName('folder-icon').length == 0 ? '' : ' folder-item'
      const selectClass = getSelectClass(el)

      const diff = event.y - rect.top
      if(diff < head_bottom){
        el.className = `infinite-tree-item top-overlap${selectClass}`
        if(el.previousSibling) el.previousSibling.className = `infinite-tree-item bottom-previous-sibling-overlap${getSelectClass(el.previousSibling)}`
        if(el.nextSibling) el.nextSibling.classList.remove('top-next-sibling-overlap')
      }
      else if(diff < head_bottom + middle){
        el.className = `infinite-tree-item top-overlap middle${folder}${selectClass}`
        if(el.previousSibling) el.previousSibling.className = `infinite-tree-item${folder ? '' : ' bottom-previous-sibling-overlap'}${getSelectClass(el.previousSibling)}`
        if(el.nextSibling) el.nextSibling.classList.remove('top-next-sibling-overlap')
      }
      else if(diff < head_bottom + middle * 2){
        el.className = `infinite-tree-item bottom-overlap middle${folder}${selectClass}`
        if(el.previousSibling) el.previousSibling.classList.remove('bottom-previous-sibling-overlap')
        if(el.nextSibling) el.nextSibling.className = `infinite-tree-item${folder ? '' : ' top-next-sibling-overlap'}${getSelectClass(el.nextSibling)}`
      }
      else{
        el.className = `infinite-tree-item bottom-overlap${selectClass}`
        if(el.previousSibling) el.previousSibling.classList.remove('bottom-previous-sibling-overlap')
        if(el.nextSibling) el.nextSibling.className = `infinite-tree-item top-next-sibling-overlap${getSelectClass(el.nextSibling)}`
      }

      currentElement = el
    }
    tree.contentElement.addEventListener('dragover',this.onDragOver);

  }

  rejectKeysHaveParent(selectedNodes) {
    const keysNotHaveParent = []
    for (let node of selectedNodes) {
      let addFlag = true
      const key = node.id
      for (let node2 of selectedNodes) {
        const key2 = node2.id
        if (key != key2 && key.startsWith(key2)) {
          addFlag = false
          break
        }
      }
      if (addFlag) keysNotHaveParent.push(node)
    }
    return keysNotHaveParent;
  }

  getKey(node,ind=1){
    if(!node.id) return 'root'
    const arr = node.id.split('/')
    return arr[arr.length - ind]
  }

  render() {
    const self = this
    return (
      <div style={{paddingLeft:4,paddingTop:4,width:(this.props.cont || this.props.topPage) ? '600px' : this.props.favoritePage ? (void 0) :'calc(100vw - 4px)'}}>
        <InfiniteTree
          ref="iTree"
          noDataText=""
          loadNodes={(parentNode, done) => {
            console.log(11,parentNode.id)
            getAllChildren(parentNode.id).then(children => done(null, children))
          }}
          rowRenderer={rowRenderer(!this.props.cont && !this.props.favoritePage ? 14 : 18)}
          selectable={true} // Defaults to true
          // droppable={{
          //   hoverClass: 'infinite-tree-drop-hover',
          //   // accept: (opts) => {
          //   //   const { type, draggableTarget, droppableTarget, node } = opts;
          //   //
          //   //   if (elementClass(event.target).has('infinite-tree-overlay')) {
          //   //     console.log(33333333333)
          //   //     elementClass(event.target).add('hover'); // add hover class
          //   //   } else {
          //   //     const el = self.refs.iTree.tree.contentElement.querySelector('.infinite-tree-overlay');
          //   //     elementClass(el).remove('hover'); // remove hover class
          //   //   }
          //   //
          //   //   return true;
          //   // },
          //   drop: (e, opts) => {
          //   }
          // }}
          shouldSelectNode={(node) => { // Defaults to null
            if (!node || (node === this.refs.iTree.tree.getSelectedNode())) {
              return false; // Prevent from deselecting the current node
            }
            return true;
          }}
          onClick={(event) => {
            let openType2 = this.props.bookmarkbarLink !== void 0 ? this.props.bookmarkbarLink : openType
            const tree = this.refs.iTree.tree
            const currentNode = event.currentNode || tree.getNodeFromPoint(event.x, event.y);
            if (!currentNode) {
              return;
            }


            const multipleSelectionMode = event.ctrlKey || event.metaKey;

            if (!multipleSelectionMode) {
              if (selectedNodes.length > 0) {
                // Call event.stopPropagation() to stop event bubbling
                event.stopPropagation();

                // Empty an array of selected nodes
                selectedNodes.forEach(selectedNode => {
                  selectedNode.state.selected = false;
                  tree.updateNode(selectedNode, {}, { shallowRendering: true });
                });
                selectedNodes = [];

                // Select current node
                tree.state.selectedNode = currentNode;
                currentNode.state.selected = true;
                tree.updateNode(currentNode, {}, { shallowRendering: true });

              }

              if(currentNode.type == 'file'){
                if(this.props.favoritePage){
                  // selectedNodes.forEach(selectedNode => {
                  //   selectedNode.state.selected = false
                  //   tree.updateNode(selectedNode, {}, { shallowRendering: true },true)
                  // });
                  // selectedNodes = [];
                  return
                }
                else{
                  if(this.props.cont){
                    if(event.button == 1){
                      this.props.cont.hostWebContents2.send('create-web-contents',{id:this.props.cont.id,targetUrl:currentNode.url,disposition:'background-tab'})
                    }
                    else{
                      this.props.cont.hostWebContents2.send(openType2 ? 'new-tab' : 'load-url',this.props.cont.id,currentNode.url)
                    }
                    if(this.props.onClick) this.props.onClick()
                  }
                  else if(this.props.topPage){
                    if(event.button == 0){
                      location.href = currentNode.url
                    }
                    else if(event.button == 1){
                      ipc.send('send-to-host', "open-tab-opposite",currentNode.url,true)
                    }
                  }
                  else{
                    ipc.send('send-to-host', "open-tab-opposite",currentNode.url,true,event.button == 1 ? 'create-web-contents' : openType2 ? 'new-tab' : 'load-url')
                  }
                  return;
                }
              }
              else{
                tree.toggleNode(currentNode);
                return;
              }
            }

            // Call event.stopPropagation() to stop event bubbling
            event.stopPropagation();

            const selectedNode = tree.getSelectedNode();
            if (selectedNodes.length === 0 && selectedNode) {
              selectedNodes.push(selectedNode);
              tree.state.selectedNode = null;
            }

            const index = selectedNodes.indexOf(currentNode);

            // Remove current node if the array length of selected nodes is greater than 1
            if (index >= 0 && selectedNodes.length > 1) {
              currentNode.state.selected = false;
              selectedNodes.splice(index, 1);
              tree.updateNode(currentNode, {}, { shallowRendering: true });
            }

            // Add current node to the selected nodes
            if (index < 0) {
              currentNode.state.selected = true;
              selectedNodes.push(currentNode);
              tree.updateNode(currentNode, {}, { shallowRendering: true });
            }
          }}
          onDoubleClick={(event) => {
            if(this.props.favoritePage) {
              const tree = this.refs.iTree.tree
              const currentNode = tree.getNodeFromPoint(event.x, event.y);
              if (!currentNode) {
                return;
              }
              ipc.send('send-to-host', "open-tab", currentNode.url, true)
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
              selectedNodes.splice(0,selectedNodes.length,prevNode)
            } else if (event.keyCode === 39) { // Right
              tree.openNode(node);
            } else if (event.keyCode === 40) { // Down
              const nextNode = tree.nodes[nodeIndex + 1] || node;
              tree.selectNode(nextNode);
              selectedNodes.splice(0,selectedNodes.length,nextNode)
            }
          }}
          // onContentWillUpdate={() => {
          //   console.log('onContentWillUpdate');
          // }}
          // onContentDidUpdate={() => {
          //   this.updatePreview(this.refs.iTree.tree.getSelectedNode());
          // }}
          onOpenNode={(node) => {
            localForage.setItem("favorite-sidebar-open-node",this.refs.iTree.tree.getOpenNodes().map(node=>node.id).join("\t"))
          }}
          onCloseNode={(node) => {
            localForage.setItem("favorite-sidebar-open-node",this.refs.iTree.tree.getOpenNodes().map(node=>node.id).join("\t"))
          }}
          // onClusterDidChange={() => {
          //   const tree = this.refs.iTree.tree
          //   // No overlay on filtered mode
          //   if (tree.filtered) {
          //     return;
          //   }
          //
          //   const overlayElement = document.createElement('div');
          //   const top = tree.nodes.indexOf(tree.getNodeById('<root>.1'));
          //   const bottom = tree.nodes.indexOf(tree.getNodeById('<root>.2'));
          //   const el = tree.contentElement.querySelector('.infinite-tree-item');
          //   if (!el) {
          //     return;
          //   }
          //   const height = parseFloat(getComputedStyle(el).height);
          //
          //   overlayElement.className = classNames(
          //     'infinite-tree-overlay'
          //   );
          //   overlayElement.style.top = top * height + 'px';
          //   overlayElement.style.height = (bottom - top) * height + 'px';
          //   overlayElement.style.lineHeight = (bottom - top) * height + 'px';
          //   overlayElement.appendChild(document.createTextNode('OVERLAY'));
          //   tree.contentElement.appendChild(overlayElement);
          // }}
          // onSelectNode={(node) => {
          //   this.updatePreview(node);
          // }}
        />
      </div>
    );
  }
}
