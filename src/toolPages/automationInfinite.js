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
const PubSub = require('pubsub-js')
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'

import InfiniteTree from '../render/react-infinite-tree';
import rowRenderer from '../render/react-infinite-tree/automationCommandRenderer.js';

async function faviconGet(x){
  return x.favicon == "resource/file.png" ? (void 0) : x.favicon && (await localForage.getItem(x.favicon))
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

function insertFavorite(writePath,data){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('insert-favorite',key,writePath,data)
    ipc.once(`insert-favorite-reply_${key}`,(event,ret)=>{
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
  let ind = 0
  for(let x of datas){
    const id = `${nodePath}/${x.key}`
    const data = {
      id,
      no: ++ind,
      type: 'file',
      ...x
    }
    if(x.children2){
      data.children = await treeBuild(x.children2,id)
    }
    newChildren.push(data)
  }
  return newChildren
}

let selectedNodes = [];
export default class Commands extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const doc = ReactDOM.findDOMNode(this.refs.content)
    const scroll = doc.querySelector('.infinite-tree-scroll')
    const setHeight = _=>{
      scroll.style.height = `${scroll.parentNode.parentNode.clientHeight}px`
    }

    PubSub.subscribe("resize",setHeight)
    setHeight()
  }

  getSelectedOps(){
    return selectedNodes.map(x=>x.id.split("/").slice(-1)[0])
  }

  // afterSelect(selectedTargets){
  //   if(selectedTargets.length == 0) return
  //
  //   const tree = this.refs.content.refs.iTree.tree
  //
  //   const targetNodes = selectedTargets.map(ele=>{
  //     const nodeId = ele.dataset.id
  //     return tree.getNodeById(nodeId)
  //   })
  //
  //   for(let currentNode of targetNodes){
  //     const index = selectedNodes.indexOf(currentNode);
  //
  //     // Remove current node if the array length of selected nodes is greater than 1
  //     if (index >= 0 && selectedNodes.length > 1) {
  //       currentNode.state.selected = false;
  //       selectedNodes.splice(index, 1);
  //       tree.updateNode(currentNode, {}, { shallowRendering: true },true);
  //     }
  //
  //     // Add current node to the selected nodes
  //     if (index < 0) {
  //       currentNode.state.selected = true;
  //       selectedNodes.push(currentNode);
  //       tree.updateNode(currentNode, {}, { shallowRendering: true },true);
  //     }
  //   }
  //
  //   tree.update()
  // }
  //
  // clearSelect(){
  //   const tree = this.refs.content.refs.iTree.tree
  //   // Empty an array of selected nodes
  //   selectedNodes.forEach(selectedNode => {
  //     selectedNode.state.selected = false;
  //     tree.updateNode(selectedNode, {}, { shallowRendering: true },true)
  //   });
  //   selectedNodes = [];
  //
  //   tree.update()
  // }

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

  render(){
    return <Contents ref="content" selectedMenu={this.props.selectedMenu}/>
    // return <StickyContainer ref="stickey">
    //   <Selection ref="select" target=".infinite-tree-item" selectedClass="selection-selected"
    //              afterSelect={::this.afterSelect} clearSelect={::this.clearSelect}>
    //     <Contents ref="content"/>
    //   </Selection>
    // </StickyContainer>
  }
}

class Contents extends React.Component {
  constructor(props) {
    super(props)
  }

  isScrollBottom(){
    if(!this.scroll){
      this.scroll = ReactDOM.findDOMNode(this.refs.iTree).querySelector('.infinite-tree-scroll')
    }
    console.log(114,this.scroll.scrollTop, this.scroll.clientHeight)
    return this.currentDatas[0].children2.length && this.scroll.scrollTop + this.scroll.clientHeight == this.scroll.scrollHeight
  }

  scrollToBottom(){
    this.scroll.scrollTop = this.scroll.scrollHeight
  }

  updatePreview(node) {
    console.log(node)
  }

  async loadAllData(datas){
    if(!datas) datas = this.currentDatas
    this.currentDatas = datas
    // const prevState = this.prevState || (await localForage.getItem("automation-open-node"))
    // this.prevState = (void 0)

    const ret = datas
    const data = (await treeBuild(ret,''))[0].children

    // console.log(data)
    // treeAllData = data

    // localForage.setItem("automation-open-node",prevState)
    // const openNodes = prevState ? prevState.split("\t",-1) : (void 0)
    const openNodes = void 0
    const tree = this.refs.iTree.tree
    if(tree){
      tree.loadData(data,false,openNodes)

      const newNodes = []
      selectedNodes.forEach((node,i)=>{
        const currentNode = tree.getNodeById(node.id)
        if(!currentNode) return
        currentNode.state.selected = true;
        newNodes.push(currentNode)
        tree.updateNode(currentNode, {}, { shallowRendering: true },i!=selectedNodes.length-1);
      })
      selectedNodes = newNodes
    }
    else{
      setTimeout(_=>tree.loadData(data,false,openNodes),100)
    }
  }

  async eventUpdateDatas(e,datas){
    const doScroll = this.isScrollBottom()
    await this.loadAllData(datas)
    if(doScroll) this.scrollToBottom()
  }

  componentDidMount() {
    this.loadAllData([{key:'root', title:'root', is_file:false, children2: []}])
    PubSub.subscribe('update-datas',::this.eventUpdateDatas)

    const tree = this.refs.iTree.tree
    this.onMouseDown = (event)=>{
      if(!this.refs.iTree) return
      const currentNode = tree.getNodeFromPoint(event.x, event.y);
      if (!currentNode) {
        return;
      }

      if(event.which == 3){
        const nodes = [...new Set([currentNode,...selectedNodes])]
        ipc.send("automation-menu",nodes.map(node=>(node.url || node.title)))
        this.menuKey = nodes
        return
      }
    }
    tree.contentElement.addEventListener('mousedown',this.onMouseDown)
    this.initEvents()
    this.initDragEvents()
  }

  componentWillUnmount() {
    const tree = this.refs.iTree.tree
    tree.contentElement.removeEventListener('mousedown',this.onMouseDown)
    document.removeEventListener('dragstart', this.onDragStart);
    document.removeEventListener('dragend',this.onDragEnd);
    tree.contentElement.removeEventListener('dragover',this.onDragOver);
    if(this.event) ipc.removeListener("automation-menu-reply",this.event)
  }

  initEvents() {
    this.event = (e, cmd) => {
      if(cmd == "openInNewTab" || cmd == "openInNewPrivateTab" || cmd == "openInNewTorTab" || cmd == "openInNewSessionTab" || cmd == "openInNewWindow" || cmd == "openInNewWindowWithOneRow" || cmd == "openInNewWindowWithTwoRow") {
        const nodes = this.menuKey
        this.menuKey = (void 0)
        openFavorite(nodes.map(n=>this.getKey(n)),this.props.cont ? this.props.cont.getId() : (void 0),cmd).then(_=>{
          console.log(324234235346545)
          this.props.onClick && this.props.onClick()
        })
      }
      else if(cmd == "delete") {
        const nodes = this.menuKey
        this.menuKey = (void 0)
        const parentNodes = nodes.map(n => n.getParent())
        deleteFavorite(nodes.map(n=>this.getKey(n)),parentNodes.map(parent=>this.getKey(parent))).then(_ => {
          this.eventUpdateDatas()
        })
      }
      else if(cmd == "edit"){
        const nodes = this.menuKey
        this.menuKey = (void 0)
        showDialog({
          inputable: true, title: 'Rename',
          text: `Enter a new Name`,
          initValue: nodes[0].type == 'file' ? [nodes[0].name,nodes[0].url] : [nodes[0].name],
          needInput: nodes[0].type == 'file' ? ["Title","URL"] : ["Title"]
        },this.props.cont ? this.props.cont.getId() : (void 0)).then(value => {
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
        },this.props.cont ? this.props.cont.getId() : (void 0)).then(value => {
          if (!value) return
          const data = isPage ? {title:value[0], url:value[1], is_file:true} : {title:value[0], is_file:false,children:[]}
          insertFavorite(this.getKey(nodes[0].getParent()),data).then(_=>_)
        })
      }
    }
    ipc.on('automation-menu-reply', this.event)
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

    this.onDragEnd = async (e) => {
      if(currentElement){
        console.log('dragend')

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
          // this.prevState = await localForage.getItem("automation-open-node")
          chrome.runtime.sendMessage({event:'move-op',menuKey: this.props.selectedMenu,opKey:renameArgs[0][0],args:renameArgs})
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
    document.addEventListener('dragend',this.onDragEnd);


    this.onDragOver = (e) => {
      e.preventDefault();

      const event = e

      const movementX = event.x - (Number(draggingX) || event.x);
      const movementY = event.y - (Number(draggingY) || event.y);

      draggingX = event.x;
      draggingY = event.y;

      if (movementY === 0) return

      let el = document.elementFromPoint(event.x, event.y);
      while (el && el.parentElement !== tree.contentElement) {
        el = el.parentElement;
      }
      if(!el) return

      const id = el.getAttribute(tree.options.nodeIdAttr);
      if (id === undefined) return

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
        <InfiniteTree
          rows_in_block={30}
          blocks_in_cluster={3}
          ref="iTree"
          noDataText=""
          rowRenderer={rowRenderer()}
          selectable={true} // Defaults to true
          shouldSelectNode={(node) => { // Defaults to null
            if (!node || (node === this.refs.iTree.tree.getSelectedNode())) {
              return false; // Prevent from deselecting the current node
            }
            return true;
          }}
          onClick={(event) => {
            if(event.target.className == "fa fa-times menu-item"){
              chrome.runtime.sendMessage({event:'remove-op', menuKey: this.props.selectedMenu, opKey:event.target.closest('.infinite-tree-item').dataset.id.split("/").slice(-1)[0]})
              return
            }
            console.log(666456,event)
            const tree = this.refs.iTree.tree
            const currentNode = tree.getNodeFromPoint(event.x, event.y);
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
                selectedNodes.splice(0, selectedNodes.length);

                // Select current node
                tree.state.selectedNode = currentNode;
                currentNode.state.selected = true;
                tree.updateNode(currentNode, {}, { shallowRendering: true });

              }

              // if(currentNode.type == 'file'){
              //   if(this.props.favoritePage){
              //     selectedNodes.forEach(selectedNode => {
              //       selectedNode.state.selected = false
              //       tree.updateNode(selectedNode, {}, { shallowRendering: true },true)
              //     });
              //     selectedNodes = [];
              //   }
              //   else{
              //     if(this.props.cont){
              //       this.props.cont.hostWebContents.send('new-tab',this.props.cont.getId(),currentNode.url)
              //       if(this.props.onClick) this.props.onClick()
              //     }
              //     else{
              //       ipc.sendToHost("open-tab-opposite",currentNode.url,true)
              //     }
              //     return;
              //   }
              // }
              // else{
              //   tree.toggleNode(currentNode);
              //   return;
              // }
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
            if(this.props.selectedMenu) chrome.runtime.sendMessage({event: 'get-op', menuKey: this.props.selectedMenu})
          }}
          onDoubleClick={(event) => {
            // if(this.props.favoritePage) {
            //   const tree = this.refs.iTree.tree
            //   const currentNode = tree.getNodeFromPoint(event.x, event.y);
            //   if (!currentNode) {
            //     return;
            //   }
            //   ipc.sendToHost("open-tab", currentNode.url, true)
            // }
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
            // localForage.setItem("automation-open-node",this.refs.iTree.tree.getOpenNodes().map(node=>node.id).join("\t"))
          }}
          onCloseNode={(node) => {
            // localForage.setItem("automation-open-node",this.refs.iTree.tree.getOpenNodes().map(node=>node.id).join("\t"))
          }}
        />
    );
  }
}
