import {ipcRenderer as ipc} from 'electron';
import localForage from "../LocalForage";
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

async function faviconGet(h){
  return h.favicon ? (await localForage.getItem(h.favicon)) || `file://${resourcePath}/file.png` : `file://${resourcePath}/file.png`
}

ipc.send("get-resource-path",{})
ipc.once("get-resource-path-reply",(e,data)=>{
  resourcePath = data
})

function showDialog(input){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('show-dialog-exploler',key,input)
    ipc.once(`show-dialog-exploler-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function getFavorites(dbKey){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('get-favorites',key,dbKey)
    ipc.once(`get-favorites-reply_${key}`,(event,ret)=>{
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

function openFavorite(dbKey,id){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('open-favorite',key,dbKey,id)
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

export default class FavoriteExplorer extends React.Component{
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
    // ReactDOM.findDOMNode(this).querySelector(".fa.fa-caret-right.caret").click()
    this.onLoadData(this.nodes.get('root')).then(_=>{
      this.refs.tree.setState({expandedKeys: [...this.nodeMap.keys()]})
    })
    this.initEvents()
    if(!this.props.cont){
      document.addEventListener("keydown",this.keyDown)
      document.addEventListener("keyup",this.keyUp)
      ReactDOM.findDOMNode(this.refs.stickey).style.height = "100%"
      setInterval(_=>{
        const children = this.nodeMap.get("root")
        children.splice(0, children.length)
        this.getChildren("root").then(ret=>{
          ret.forEach(x=>children.push(x))
          this.setState({treeItems: this.renderFolder(this.state.items)})
        })
      },5000)
    }
  }

  initEvents() {
    this.event = (e, cmd) => {
      if(cmd == "open") {
        const key = this.menuKey
        this.menuKey = (void 0)
        const keys = [...new Set([key,...this.refs.tree.state.selectedKeys])].filter(x=>x)
        const nodes = this.getNodesFromKeys(keys)
        openFavorite(keys.map(k=>path.basename(k)),this.props.cont ? this.props.cont.getId() : (void 0)).then(_=>_)
      }
      else if(cmd == "delete") {
        const key = this.menuKey
        this.menuKey = (void 0)
        const keys = [...new Set([key,...this.refs.tree.state.selectedKeys])].filter(x=>x)
        const nodes = this.getNodesFromKeys(keys)
        const parentNodes = this.getNodesFromKeys(nodes.map(n => n.props.parent && n.props.parent.path))
        deleteFavorite(keys.map(k=>path.basename(k)),parentNodes.map(parent=>path.basename(parent.props.k))).then(ret => {
          Promise.all(this.reloadDatas([...new Set(parentNodes)])).then(_ => {
            this.setState({treeItems: this.renderFolder(this.state.items)})
          })
        })
      }
      else if(cmd == "rename"){
        const key = this.menuKey
        this.menuKey = (void 0)
        const keys = [key || this.refs.tree.state.selectedKeys[0]]
        const nodes = this.getNodesFromKeys(keys)
        showDialog({
          inputable: true, title: 'Rename',
          text: `Enter a new Name`,
          initValue: nodes[0].props.isLeaf ? [nodes[0].props.title,nodes[0].props.url] : [nodes[0].props.title],
          needInput: nodes[0].props.isLeaf ? ["Title","URL"] : ["Title"]
        }).then(value => {
          if (!value) return
          const nodes = this.getNodesFromKeys(keys)
          const parentNodes = this.getNodesFromKeys(nodes.map(n => n.props.parent && n.props.parent.path))
          let writePath = keys[0]
          const data = nodes[0].props.isLeaf ? {title:value[0], url:value[1]} : {title:value[0]}
          renameFavorite(path.basename(writePath),data).then(ret => {
            Promise.all(this.reloadDatas(parentNodes)).then(_ => {
              this.setState({treeItems: this.renderFolder(this.state.items)})
            })
          })
        })
      }
      else if(cmd == "create-page" || cmd == "create-dirctory") {
        const isPage = cmd == "create-page"
        const key = this.menuKey
        this.menuKey = (void 0)
        const keys = [key || this.refs.tree.state.selectedKeys[0]]
        showDialog({
          inputable: true, title: `New ${isPage ? 'Page' : 'Directory'}`,
          text: `Enter a new ${isPage ? 'page title and URL' : 'directory name'}`,
          needInput: isPage ? ["Title","URL"] : [""]
        }).then(value => {
          console.log(value)
          if (!value) return
          const nodes = this.getNodesFromKeys(keys)
          const parentNodes = this.getNodesFromKeys(nodes.map(n => n.props.parent && n.props.parent.path))
          let writePath = nodes[0].props.isLeaf ? parentNodes[0].props.k : keys[0]
          const data = isPage ? {title:value[0], url:value[1], is_file:true} : {title:value[0], is_file:false,children:[]}
          insertFavorite(path.basename(writePath),data).then(ret => {
            Promise.all(this.reloadDatas(nodes[0].props.isLeaf ? parentNodes : nodes)).then(_ => {
              this.setState({treeItems: this.renderFolder(this.state.items)})
            })
          })
        })
      }
    }
    ipc.on('favorite-menu-reply', this.event)
  }

  componentWillUnmount(){
    if(this.event) ipc.removeListener("favorite-menu-reply",this.event)
    if(!this.props.cont) {
      document.addEventListener("keydown", this.keyDown)
      document.addEventListener("keyup", this.keyUp)
    }
  }

  keyDown(e){
    if(e.keyCode == 17){ // Ctrl
      this.setState({multiple:true})
      console.log(e)
    }
    else if (e.keyCode == 46) { // Del
      if (window.confirm(`Are you sure to delete items?`)) {
        const keys = this.refs.tree.state.selectedKeys
        const nodes = this.getNodesFromKeys(keys)
        const parentNodes = this.getNodesFromKeys(nodes.map(n => n.props.parent && n.props.parent.path))
        deleteFavorite(keys.map(k=>path.basename(k)),parentNodes.map(parent=>path.basename(parent.props.k))).then(ret => {
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
    const dbKey = path.basename(nodePath)
    console.log(dbKey)
    const ret = await getFavorites(dbKey)
    const newChildren = []
    for(let x of ret){
      return {
        name: x.title,
        url: x.url,
        path: path.join(nodePath,x.key),
        favicon: await faviconGet(x),
        type: x.is_file ? 'file' : 'directory',
        children: []
      }
    }
    console.log(newChildren)
    return newChildren
  }

  handleMouseDown(key,e){
    if(e.which == 3){
      const keys = [...new Set([key,...this.refs.tree.state.selectedKeys])]
      ipc.send("favorite-menu",this.getNodesFromKeys(keys).map(node=>(node.props.url || node.props.title)))
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
        children = item.children
        ret.push(<TreeNode item={item} refParent={this} parent={parent} k={item.path} key={item.path}
                           title={item.name} refChildren={item.children} onMouseDown={this.handleMouseDown.bind(this,item.path)}>{this.renderFolder(item.children,item)}</TreeNode>)
      }
      else{
        ret.push(<TreeNode item={item} refParent={this} parent={parent} k={item.path} key={item.path} favicon={item.favicon}
                           title={item.name} url={item.url} isLeaf={item.type == 'file'} refChildren={item.children} onMouseDown={this.handleMouseDown.bind(this,item.path)}/>)
      }
    }
    return ret
  }


  onDragStart(info) {
    console.log('start', info);
  }

  onDragEnter(info) {
    console.log('enter', info);
    this.setState({
      expandedKeys: info.expandedKeys,
    });
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


  moveFiles(dest, keysNotHaveParent,dropKey) {
    const to = path.basename(dest)
    const renameArgs = keysNotHaveParent.map(from =>{
      const arr = from.split(/[\\\/]/)
      return [arr[arr.length-1],arr[arr.length-2],to,dropKey]
    })
    console.log(renameArgs.map(x=>x.join(",")))
    console.log(`2 ${keysNotHaveParent.join(",")} to ${dest}`)
    const destNode = this.getNodesFromKeys([dest])[0]
    const fromNodes = this.getNodesFromKeys(keysNotHaveParent)
    console.log(fromNodes,keysNotHaveParent)
    const parentNodes = this.getNodesFromKeys(fromNodes.map(n=>n.props.parent && n.props.parent.path))
    moveFavorite(renameArgs).then(_ => {
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
    console.log(dropKey,info.node.props.title)

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
      this.moveFiles(dropNodeParent.path, keysNotHaveParent,path.basename(dropKey))
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


  clickFile(node){
    if(node.props.isLeaf){
      if(this.props.cont){
        this.props.cont.hostWebContents.send('new-tab',this.props.cont.getId(),node.props.url)
        if(this.props.onClick) this.props.onClick()
      }
      else{
        ipc.sendToHost("open-tab-opposite",node.props.url,true)
      }
    }
    else{
      node.onExpand()
    }
  }

  renderStickey(children){
    console.log(this.props)
    let menu
    if(this.props.sidebar){
      menu = <Menu pointing secondary >
        <Menu.Item key="favorite" icon="star" active={true}/>
        <Menu.Item as='a' href={`${baseURL}/history_sidebar.html`} key="history" icon="history"/>
        <Menu.Item as='a' href={`${baseURL}/tab_history_sidebar.html`} key="tags" icon="tags"/>
        <Menu.Item as='a' href={`${baseURL}/explorer_sidebar.html`} key="file-explorer" icon="folder"/>
      </Menu>
    }
    else{
      menu = <Menu pointing secondary >
        <Menu.Item as='a' href={`chrome://newtab/`} key="top" name="Top"/>
        <Menu.Item key="favorite" name={l10n.translation('bookmarks')} active={true}/>
        <Menu.Item as='a' href={`chrome://history/`} key="history" name={l10n.translation('history')}/>
        <Menu.Item as='a' href={`${baseURL}/download.html`} key="download" name={l10n.translation('downloads')}/>
        <Menu.Item as='a' href={`${baseURL}/explorer.html`} key="file-explorer" name="File Explorer"/>
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
          clickFile={::this.clickFile}
          singleClick={!!this.props.cont || this.props.sidebar}
          // onMouseEnter={(e)=>console.log(e)}
        >
          {this.state.treeItems}
        </Tree>
      </div>
    </Selection>
  }


  renderMainPart(){
    return <Tree
      ref="tree"
      draggable
      onDragStart={::this.onDragStart}
      onDragEnter={::this.onDragEnter}
      onDrop={::this.onDrop}
      loadData={::this.onLoadData}
      // onDoubleClick={(e)=>console.log(e)}
      multiple={this.state.multiple}
      clickFile={::this.clickFile}
      singleClick={!!this.props.cont}
    >
      {this.state.treeItems}
    </Tree>
  }

  render() {
    console.log("r",this.state)
    return this.props.cont ? this.renderMainPart() : this.renderStickey(this.renderMain())
  }
}



