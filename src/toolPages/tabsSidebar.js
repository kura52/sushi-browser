window.debug = require('debug')('info')
// require('debug').enable("info")
import process from './process'
const ipc = require('electron').ipcRenderer
const uuid = require('node-uuid')
const React = require('react')
const ReactDOM = require('react-dom')
const path = require('path')
const Tree = require('../render/rc-tree/index')
const { StickyContainer, Sticky } = require('react-sticky');
const moment = require('moment')
const { Menu,Segment } = require('semantic-ui-react')
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'
// ipc.setMaxListeners(0)

const {TreeNode} = Tree


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

function getHistory(name){
  let cond
  switch(name){
    case 'All':
      cond = {}
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

  return new Promise((resolve,reject)=>{
    ipc.send('fetch-history',cond)
    ipc.once('history-reply',(event,ret)=>{
      resolve(ret)
    })
  })
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

function faviconGet(x){
  return x.favicon == "resource/file.png" ? (void 0) : x.favicon && localStorage.getItem(x.favicon)
}

ipc.send("get-resource-path",{})
ipc.once("get-resource-path-reply",(e,data)=>{
  resourcePath = data
})


class HistoryExplorer extends React.Component{
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
    // setImmediate(_=>ReactDOM.findDOMNode(this).querySelectorAll(".fa.fa-caret-ri
    // ght.caret")[0].click())
    // this.initEvents()
    document.addEventListener("keydown",this.keyDown)
    document.addEventListener("keyup",this.keyUp)
    ReactDOM.findDOMNode(this.refs.stickey).style.height = "100%"
    setInterval(_=>{
      const notExpandKeys = new Set()
      const currentExpandKeys = new Set(this.refs.tree.state.expandedKeys)
      for(let key of this.nodeMap.keys()){
        if(!currentExpandKeys.has(key)) notExpandKeys.add(key)
      }
      this.onLoadData(this.nodes.get('root')).then(_=>{
        const expandedKeys = []
        for(let key of this.nodeMap.keys()){
          if(!notExpandKeys.has(key)) expandedKeys.push(key)
        }
        this.refs.tree.setState({expandedKeys})
      })
    },1000)
  }


  componentWillUnmount(){
    document.addEventListener("keydown", this.keyDown)
    document.addEventListener("keyup", this.keyUp)
  }

  keyDown(e){
    if(e.keyCode == 17){ // Ctrl
      this.setState({multiple:true})
      console.log(e)
    }
  }

  keyUp(e){
    if(e.keyCode == 17){
      this.setState({multiple:false})
      console.log(e)
    }
  }

  buildItem(h,nodePath) {
    const name = h.title  || h.location
    console.log(h)
    return {
      name: `[${h.updated_at.slice(11,16)}] ${name && name.length > 55 ? `${name.substr(0, 55)}...` : name}`,
      url: convertURL(h.location),
      path: path.join(nodePath,h.location),
      favicon: h.favicon == "resource/file.png" ? (void 0) : h.favicon && favicons[h.favicon] ? `file://${favicons[h.favicon]}` : (void 0),
      type: 'file',
      children: []
    }
  }

  async getChildren(nodePath) {
    if(nodePath == "root"){
      const key = uuid.v4()
      ipc.sendToHost('get-tabs-state',key)
      const arr = await new Promise((resolve,reject)=>{
        ipc.once(`get-tabs-state-reply_${key}`,(e,arr)=>{
          resolve(arr)
        })
      })
      const newChildren = []
      arr.forEach((panel,i)=>{
        let prefix = ""
        if(panel.key.startsWith('fixed')){
          const sp = panel.key.split("-")
          if(sp[1]=="float"){
            prefix = "Float "
          }
          else{
            prefix = `${sp[1][0].toUpperCase()}${sp[1].slice(1)} `
          }
        }
        const tabChildren = []
        const panelChildName = `${prefix}Panel ${`00${i+1}`.slice(-2)}`
        const panelPath = path.join(nodePath,panelChildName)
        panel.tabs.forEach((tab,j)=>{
          const name = `Tab ${`00${j+1}`.slice(-2)}`
          const tabPath = path.join(panelPath,name)
          const children = tab.historyList.map((h,k)=>{
            const url = convertURL(h.url)
            const title = `${k+1}. ${convertURL(h.title)|| url}`
            return {
              name: title,
              className: tab.currentIndex == k ? 'now' : (void 0),
              url,
              path: path.join(tabPath,k.toString()),
              favicon: faviconGet(h),
              type: 'file',
              children: []
            }
          })
          tabChildren.push({
            name,
            className: tab.selectedTab ? 'selected-tab' : 'not-selected',
            path: tabPath,
            type: 'directory',
            children
          })
          this.nodeMap.set(tabPath,children)
        })

        newChildren.push({
          name: panelChildName,
          path: panelPath,
          type: 'directory',
          children: tabChildren
        })
        this.nodeMap.set(panelPath,tabChildren)
      })
      return newChildren
    }
    // else{
    //   const dbKey = path.basename(nodePath)
    //   console.log(dbKey)
    //   const ret = await getHistory(dbKey)
    //
    //   const newChildren = []
    //   let pre = {location:false}
    //   for(let h of ret){
    //     h.updated_at = moment(h.updated_at).format("YYYY/MM/DD HH:mm:ss")
    //     h.yyyymmdd = h.updated_at.slice(0,10)
    //     if(pre.yyyymmdd != h.yyyymmdd){
    //       newChildren.push({
    //         name: `${h.yyyymmdd}`,
    //         path: path.join(nodePath,h.yyyymmdd),
    //         favicon: 'empty',
    //         type: 'file',
    //         children: []
    //       })
    //     }
    //     if(h.location === pre.location){
    //       if(!pre.title) pre.title = h.title
    //       if(!pre.favicon) pre.favicon = h.favicon
    //       newChildren[newChildren.length-1] = this.buildItem(pre,nodePath)
    //     }
    //     else{
    //       newChildren.push(this.buildItem(h,nodePath))
    //       pre = h
    //     }
    //   }
    //   return newChildren
    // }
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
        console.log(111,item.children.length,item.path)
        ret.push(<TreeNode item={item} refParent={this} parent={parent} k={item.path} key={item.path}
                           className={item.className} title={item.name} refChildren={item.children}>{this.renderFolder(item.children,item)}</TreeNode>)
      }
      else{
        console.log(222,item.path)
        ret.push(<TreeNode item={item} refParent={this} parent={parent} k={item.path} key={item.path} favicon={item.favicon}
                           className={item.className} title={item.name} url={item.url} isLeaf={item.type == 'file'} refChildren={item.children}/>)
      }
    }
    return ret
  }


  getNodesFromKeys(keys){
    const keySet = new Set(keys)
    const ret = []
    for(let key of keys){
      if(this.nodes.has(key)) ret.push(this.nodes.get(key))
    }
    return ret
  }

  onLoadData(treeNode) {
    console.log("load",treeNode)
    const children = this.nodeMap.get(treeNode.props.k)
    children.splice(0, children.length)
    const promise = (async ()=>{
      ;(await this.getChildren(treeNode.props.eventKey)).forEach(x=>{
        children.push(x)
      })
      this.setState({treeItems: this.renderFolder(this.state.items)})
    })()
    return promise;
  }


  clickFile(node){
    if(node.props.favicon == "empty"){}
    else if(node.props.isLeaf){
      ipc.sendToHost("open-tab-opposite",node.props.url,true)
    }
    else{
      node.onExpand()
    }
  }

  renderStickey(children){
    return <StickyContainer ref="stickey">
      <Sticky>
        <div>
          <Menu pointing secondary >
            <Menu.Item as='a' href={`${baseURL}/favorite_sidebar.html`} key="favorite" icon="star"/>
            <Menu.Item as='a' href={`${baseURL}/history_sidebar.html`} key="history" icon="history"/>
            <Menu.Item key="tabs" icon="align justify" active={true}/>
            <Menu.Item as='a' href={`${baseURL}/explorer_sidebar.html`} key="file-explorer" icon="folder"/>
          </Menu>
        </div>
      </Sticky>
      {children}
    </StickyContainer>
  }

  renderMain(){
    return  <Tree
      ref="tree"
      loadData={::this.onLoadData}
      // onDoubleClick={(e)=>console.log(e)}
      multiple={this.state.multiple}
      clickFile={::this.clickFile}
      singleClick={this.props.sidebar}
    >
      {this.state.treeItems}
    </Tree>
  }

  render() {
    console.log("r",this.state)
    return this.renderStickey(this.renderMain())
  }
}





ReactDOM.render(<HistoryExplorer items={[{
  name: 'history',
  path: 'root',
  type: 'directory',
  expanded: true,
  children: []
}]} sidebar={true} />,  document.querySelector('.l-content .explorer.history'))