window.debug = require('debug')('info')
// require('debug').enable("info")
import process from './process'
import {ipcRenderer as ipc} from 'electron';
import uuid from 'node-uuid';
import React from 'react';
import ReactDOM from 'react-dom';
import path from 'path';
import Selection from '../render/react-selection/index'
import Tree from '../render/rc-tree/index';
import {StickyContainer, Sticky} from 'react-sticky';
import {Menu, Segment} from 'semantic-ui-react';
import l10n from '../../brave/js/l10n';
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'
l10n.init()


const {TreeNode} = Tree
let homePath

// const Promise = require("bluebird")

function clickFile(node){
  if(node.props.isLeaf){
    ipc.sendToHost("open-tab-opposite",node.props.eventKey.replace(/\\/g,'/'))
  }
  else{
    node.onExpand()
  }
}

function app(method,arg){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('app-method',key,method,arg)
    ipc.once(`app-method-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function fs(method,arg){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('file-system',key,method,arg)
    ipc.once(`file-system-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function fsList(method,args){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('file-system-list',key,method,args)
    ipc.once(`file-system-list-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}


function shList(method,args){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('shell-list',key,method,args)
    ipc.once(`shell-list-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}


function moveTrash(args){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('move-trash',key,args)
    ipc.once(`move-trash-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
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


function createFile(path,isFile){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('create-file',key,path,isFile)
    ipc.once(`create-file-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}


class FileExplorer extends React.Component{
  constructor(props) {
    super(props)
    this.nodes = new Map()
    this.nodeMap = new Map()
    this.renderFolder = ::this.renderFolder
    this.keyDown = ::this.keyDown
    this.keyUp = ::this.keyUp
    this.state = {items: props.items,treeItems:this.renderFolder(props.items),multiple:false}
  }

  componentDidMount(){
    document.querySelector(".fa.fa-caret-right.caret").click()
    document.addEventListener("keydown",this.keyDown)
    document.addEventListener("keyup",this.keyUp)
    ReactDOM.findDOMNode(this.refs.stickey).style.height = "100%"
    this.initEvents()
  }

  initEvents() {
    this.event = (e, cmd) => {
      if(cmd == "delete") {
        const key = this.menuKey
        this.menuKey = (void 0)
        const keys = [...new Set([key, ...this.refs.tree.state.selectedKeys])].filter(x=>x)
        if (window.confirm(`Are you sure to move the following files to trash?\n${keys.join("\n")}`)) {
          console.log(keys)
          moveTrash(keys).then(_ => {
            const parentNodes = this.getNodesFromKeys(this.getNodesFromKeys(keys).map(n => n.props.parent && n.props.parent.path))
            console.log(parentNodes)
            Promise.all(this.reloadDatas([...new Set(parentNodes)])).then(_ => {
              this.setState({treeItems: this.renderFolder(this.state.items)})
            })
          })
        }
      }
      else if(cmd == "rename"){
        const key = this.menuKey
        this.menuKey = (void 0)
        const keys = [key || this.refs.tree.state.selectedKeys[0]]
        showDialog({
          inputable: true, title: 'Rename',
          text: `Enter a new Name`,
          initValue: [path.basename(keys[0])]
        }).then(value => {
          if (!value) return
          value = value[0]
          const nodes = this.getNodesFromKeys(keys)
          const parentNodes = this.getNodesFromKeys(nodes.map(n => n.props.parent && n.props.parent.path))
          fs('rename',[keys[0],path.join(parentNodes[0].props.k,value)]).then(_ => {
            Promise.all(this.reloadDatas(parentNodes)).then(_ => {
              this.setState({treeItems: this.renderFolder(this.state.items)})
            })
          })
        })
      }
      else if(cmd == "create-file" || cmd == "create-dirctory") {
        const isFile = cmd == "create-file"
        const key = this.menuKey
        this.menuKey = (void 0)
        const keys = [key || this.refs.tree.state.selectedKeys[0]]
        showDialog({
          inputable: true, title: `New ${isFile ? 'File' : 'Directory'}`,
          text: `Enter a new ${isFile ? 'file' : 'directory'} name`
        }).then(value => {
          console.log(value)
          if (!value) return
          value = value[0]
          const nodes = this.getNodesFromKeys(keys)
          const parentNodes = this.getNodesFromKeys(nodes.map(n => n.props.parent && n.props.parent.path))
          let writePath = path.join(nodes[0].props.isLeaf ? parentNodes[0].props.k : keys[0],value)
          createFile(writePath, isFile).then(_ => {
            Promise.all(this.reloadDatas(nodes[0].props.isLeaf ? parentNodes : nodes)).then(_ => {
              this.setState({treeItems: this.renderFolder(this.state.items)},_=>{
                if(isFile) clickFile(this.getNodesFromKeys([writePath])[0])
              })
            })
          })
        })
      }
    }
    ipc.on('explorer-menu-reply', this.event)
  }

  componentWillUnmount(){
    ipc.removeListener("explorer-menu-reply",this.event)
  }

  keyDown(e){
    if(e.keyCode == 17){ // Ctrl
      this.setState({multiple:true})
      console.log(e)
    }
    else if (e.keyCode == 46) { // Del
      const keys = this.refs.tree.state.selectedKeys
      if (window.confirm(`Are you sure to move the following files to trash?\n${keys.join("\n")}`)) {
        console.log(keys)
        moveTrash(keys).then(_ => {
          const parentNodes = this.getNodesFromKeys(this.getNodesFromKeys(keys).map(n => n.props.parent && n.props.parent.path))
          console.log(parentNodes)
          Promise.all(this.reloadDatas([...new Set(parentNodes)])).then(_ => {
            this.setState({treeItems: this.renderFolder(this.state.items)})
          })
        })
      }
    }
  }

  keyUp(e){
    if(e.keyCode == 17){
      this.setState({multiple:false})
      console.log(e)
    }
  }

  async getChildren(nodePath) {
    const files = await fs('readdir',[nodePath])

    const cpaths = []
    const existFiles = []
    for (let file of files) {
      if(file.startsWith(".")) continue
      existFiles.push(file)
      const cpath = path.join(nodePath, file)
      cpaths.push([cpath])
    }
    const statsList = await fsList('stat',cpaths)
    console.log(statsList)
    const newChildren = []
    statsList.forEach((stats,i)=>{
      newChildren.push({
        name: existFiles[i],
        path: cpaths[i][0],
        type: stats.isDirectory ? 'directory' : 'file',
        mtime: stats.mtime,
        size: stats.size,
        children: []
      })
    })
    return newChildren
  }

  handleMouseDown(key,e){
    if(e.which == 3){
      ipc.send("explorer-menu",[...new Set([key,...this.refs.tree.state.selectedKeys])].filter(x=>x))
      this.menuKey = key
    }
  }

  setRef(item,ele){
    this.nodes.set(item.path,ele)
    if(!this.nodeMap.has(item.path)) this.nodeMap.set(item.path,item.children)
  }

  renderFolder(items,parent) {
    console.log(items)
    const ret = []
    for(let item of items){
      let children  = null;
      if(this.nodeMap.has(item.path)){
        item.children = this.nodeMap.get(item.path)
      }
      if (item.children.length > 0) {
        children = item.children.sort((a, b)=>a.type < b.type ? -1
          : a.type > b.type ? 1
            : a.path < b.path ? -1 :
              a.path > b.path ? 1 : 0);
        ret.push(<TreeNode item={item} refParent={this} parent={parent} k={item.path} key={item.path}
                           title={item.name} refChildren={item.children} onMouseDown={this.handleMouseDown.bind(this,item.path)}>{this.renderFolder(item.children,item)}</TreeNode>)
      }
      else{
        ret.push(<TreeNode item={item} refParent={this} parent={parent} k={item.path} key={item.path}
                           title={item.name} isLeaf={item.type == 'file'} refChildren={item.children} onMouseDown={this.handleMouseDown.bind(this,item.path)}/>)
      }
    }
    return ret
  }


  onDragStart(info) {
    console.log('start', info);
  }

  onDragEnter(info) {
    console.log('enter', info);
    // this.setState({
    //   expandedKeys: info.expandedKeys,
    // });
  }

  getNodesFromKeys(keys){
    const keySet = new Set(keys)
    const ret = []
    for(let key of keys){
      if(this.nodes.has(key)) ret.push(this.nodes.get(key))
    }
    return ret
  }

  rejectKeysHaveParent(selectedKeys) {
    const keysNotHaveParent = []
    for (let key of selectedKeys) {
      let addFlag = true
      for (let key2 of selectedKeys) {
        if (key != key2 && key.startsWith(key2)) {
          addFlag = false
          break
        }
      }
      if (addFlag) keysNotHaveParent.push(key)
    }
    return keysNotHaveParent;
  }


  moveFiles(dest, keysNotHaveParent) {
    const to = `${path.join(dest, 'x').slice(0,-1)}.`
    const renameArgs = keysNotHaveParent.map(from => [from, to])
    console.log(renameArgs.map(x=>x.join(",")))
    console.log(`2 ${keysNotHaveParent.join(",")} to ${dest}`)
    shList('mv', renameArgs).then(_ => {
      const destNode = this.getNodesFromKeys([dest])[0]
      const fromNodes = this.getNodesFromKeys(keysNotHaveParent)
      const parentNodes = this.getNodesFromKeys(fromNodes.map(n=>n.props.parent && n.props.parent.path))
      console.log(destNode,fromNodes,parentNodes)
      Promise.all(this.reloadDatas([...new Set([destNode,...parentNodes])])).then(_=>{
        this.refs.tree.setState({selectedKeys:[]},_=>{
          this.setState({treeItems: this.renderFolder(this.state.items)})
        })
      })
    })
  }

  reloadDatas(nodes){
    return nodes.map(treeNode=>{
      const children = this.nodeMap.get(treeNode.props.k)
      children.splice(0, children.length)
      return (async ()=>{
        ;(await this.getChildren(treeNode.props.eventKey)).forEach(x=>{
          children.push(x)
        })
      })()
    })
  }

  getPreviousNode(key){
    const parent = this.nodes.get(key).props.parent
    if(!parent) return (void 0)
    const index = parent.children.findIndex(x=> x.path == key)
    return this.nodes.get((index === 0 ? parent : parent.children[index - 1]).path)
  }

  onDrop(info) {
    console.log('drop', info);
    let dropKey = info.node.props.eventKey
    let dropNodeIsLeaf = info.node.props.isLeaf
    let position = info.dropPosition
    let dropNodeParent = info.node.props.parent
    if(position == -1){
      const node = this.getPreviousNode(dropKey)
      dropKey = node.props.k
      dropNodeIsLeaf = node.props.isLeaf
    }
    if(position == 1 && info.node.props.expanded && info.node.props.children && info.node.props.children.length > 0){
      dropNodeParent = dropNodeParent.children.find(child=>child.path == dropKey)
    }

    const dragKey = info.dragNode.props.eventKey

    const selectedKeys = [...new Set([dragKey,...info.selectedKeys])].filter(x=>x)
    if(selectedKeys.find(key=>key == dropKey)) return

    const isDropToNode = !info.dropToGap

    if(!dropNodeIsLeaf && isDropToNode){
      for(let key of selectedKeys){
        if(dropKey.startsWith(key)) return
      }
      const keysNotHaveParent = this.rejectKeysHaveParent(selectedKeys);
      if(keysNotHaveParent.length == 0) return
      this.moveFiles(dropKey, keysNotHaveParent)
    }
    else{
      console.log(dropNodeParent.path,selectedKeys)
      for(let key of selectedKeys){
        if(dropNodeParent.path.startsWith(key)) return
      }
      const keysNotHaveParent = this.rejectKeysHaveParent(selectedKeys);
      if(keysNotHaveParent.length == 0) return
      this.moveFiles(dropNodeParent.path, keysNotHaveParent)
    }
  }



  onLoadData(treeNode) {
    console.log("load",treeNode)
    const children = this.nodeMap.get(treeNode.props.k)
    children.splice(0, children.length)
    ;(async ()=>{
      ;(await this.getChildren(treeNode.props.eventKey)).forEach(x=>{
        children.push(x)
      })
      this.setState({treeItems: this.renderFolder(this.state.items)})
    })()
    return new Promise((resolve) => {resolve()});
  }

  afterSelect(selectedTargets){
    if(selectedTargets.length == 0) return
    const targetSet = new Set()
    for(let a of selectedTargets){
      targetSet.add(a.parentNode)
    }
    const selectedKeys = []
    for(let [k,node] of this.nodes){
      const ele = ReactDOM.findDOMNode(node)
      if(!ele){
        this.nodes.delete(k)
        this.nodeMap.delete(k)
        continue
      }
      if(targetSet.has(ele)){
        targetSet.delete(ele)
        selectedKeys.push(k)
        if(targetSet.size == 0) break
      }
    }
    console.log(selectedKeys)
    this.refs.tree.addSelectedKeys(selectedKeys)
  }

  clearSelect(){
    this.refs.tree.clearSelect()
  }

  selectFolder(){
    showDialog({defaultPath:homePath}).then(directory=>{
      if(!directory) return
      this.nodes = new Map()
      this.nodeMap = new Map()
      const items = [{
        name: path.basename(directory),
        path: directory,
        type: 'directory',
        expanded: true,
        children: []
      }]
      this.setState({items,treeItems: this.renderFolder(items)},
        _=>document.querySelector(".fa.fa-caret-right.caret").click())
    })
  }

  renderStickey(children){
    let menu
    if(this.props.sidebar){
      menu = <Menu pointing secondary >
        <Menu.Item as='a' href={`${baseURL}/favorite_sidebar.html`} key="favorite" icon="star"/>
        <Menu.Item as='a' href={`${baseURL}/history_sidebar.html`} key="history" icon="history"/>
        <Menu.Item as='a' href={`${baseURL}/tab_history_sidebar.html`} key="tags" icon="tags"/>
        <Menu.Item key="file-explorer" icon="folder" active={true}/>
        <Menu.Item key="open" icon="folder open" onClick={::this.selectFolder} />
      </Menu>
    }
    else{
      menu =  <Menu pointing secondary >
        <Menu.Item key="open" name="Open Directory" active={true} onClick={::this.selectFolder}
                   style={{backgroundColor: 'rgb(228, 242, 255)', borderRadius: '4px 4px 0px 0px'}}/>
        <Menu.Item as='a' href={<Menu.Item as='a' href={`chrome://newtab/`} key="top" name="Top"/>} key="top" name="Top"/>
        <Menu.Item as='a' href={`chrome://bookmarks/`} key="favorite" name={l10n.translation('bookmarks')}/>
        <Menu.Item as='a' href={`chrome://history/`} key="history" name={l10n.translation('history')}/>
        <Menu.Item as='a' href={`${baseURL}/download.html`} key="download" name={l10n.translation('downloads')}/>
        {/*<Menu.Item key="file-explorer" name="File Explorer" active={true}/>*/}
        <Menu.Item as='a' href={`${baseURL}/terminal.html`} key="terminal" name="Terminal"/>
        <Menu.Item as='a' href={`${baseURL}/settings.html`} key="settings" name={l10n.translation('settings')}/>
      </Menu>
    }

    return <StickyContainer ref="stickey">
      <Sticky>
        <div>
          {menu}
        </div>
      </Sticky>
      {children}
    </StickyContainer>
  }

  renderMain(){
    return <Selection ref="select" target=".target" selectedClass="rc-tree-node-selected"
                      afterSelect={::this.afterSelect} clearSelect={::this.clearSelect}>
      <div className="draggable-container">
        <Tree
          ref="tree"
          draggable
          onDragStart={::this.onDragStart}
          onDragEnter={::this.onDragEnter}
          onDrop={::this.onDrop}
          loadData={::this.onLoadData}
          // onDoubleClick={(e)=>console.log(e)}
          multiple={this.state.multiple}
          clickFile={clickFile}
          singleClick={this.props.sidebar}
          // onMouseEnter={(e)=>console.log(e)}
        >
          {this.state.treeItems}
        </Tree>
      </div>
    </Selection>
  }
  render() {
    console.log("r",this.state)
    return this.renderStickey(this.renderMain())
  }
}

async function getHome(){
  homePath = await app('getPath','home')
  return homePath
}

export default {FileExplorer,getHome}