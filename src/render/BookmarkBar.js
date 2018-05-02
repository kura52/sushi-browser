import localForage from "../LocalForage";

const React = require('react')
const {Component} = React
const ReactDOM = require('react-dom')

const {remote} = require('electron');
const {app,Menu,clipboard} = remote

const PubSub = require('./pubsub')
const uuid = require('node-uuid')
const mainState = remote.require('./mainState')
const NavbarMenu = require('./NavbarMenu')
const {NavbarMenuItem,NavbarMenuBarItem,NavbarMenuSubMenu} = require('./NavbarMenuItem')
const FavoriteExplorer = require('../toolPages/favoriteBase')

const ipc = require('electron').ipcRenderer
const {favorite} = require('./databaseRender')
const sharedState = require('./sharedState')

let _result,_update

function getTextWidth(text, font) {
  const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"))
  const context = canvas.getContext("2d")
  context.font = font
  const metrics = context.measureText(text)
  return metrics.width
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

async function faviconGet(x){
  return x.favicon == "resource/file.png" ? (void 0) : x.favicon && (await localForage.getItem(x.favicon))
}

function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function isFloatPanel(key){
  return key.startsWith('fixed-float')
}

// function insertFavorite(writePath,data){
//   return new Promise((resolve,reject)=>{
//     const key = uuid.v4()
//     ipc.send('insert-favorite',key,writePath,data)
//     ipc.once(`insert-favorite-reply_${key}`,(event,ret)=>{
//       resolve(ret)
//     })
//   })
// }
//
// function renameFavorite(dbKey,newName){
//   return new Promise((resolve,reject)=>{
//     const key = uuid.v4()
//     ipc.send('rename-favorite',key,dbKey,newName)
//     ipc.once(`rename-favorite-reply_${key}`,(event,ret)=>{
//       resolve(ret)
//     })
//   })
// }

function openFavorite(dbKey,id,type){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('open-favorite',key,dbKey,id,type)
    ipc.once(`open-favorite-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

// function deleteFavorite(dbKey,newName){
//   return new Promise((resolve,reject)=>{
//     const key = uuid.v4()
//     ipc.send('delete-favorite',key,dbKey,newName)
//     ipc.once(`delete-favorite-reply_${key}`,(event,ret)=>{
//       resolve(ret)
//     })
//   })
// }
//
// function showDialog(input,id){
//   return new Promise((resolve,reject)=>{
//     const key = uuid.v4()
//     ipc.send('show-dialog-exploler',key,input,id)
//     ipc.once(`show-dialog-exploler-reply_${key}`,(event,ret)=>{
//       resolve(ret)
//     })
//   })
// }

export default class BookmarkBarWrapper extends Component {
  constructor(props){
    super(props)
    this.prev = -999
  }

  componentWillMount() {
    this.props.refs2[`bookmarkbar-${this.props.tab.key}`] = this
  }

  isShow(){
    return sharedState.bookmarkBar || (sharedState.bookmarkBarTopPage && this.props.tab.page.navUrl == this.props.topURL)
  }

  shouldComponentUpdate(nextProps, nextState) {
    const val = this.isShow()
    const cond = this.prev !== val
    if(!cond){
      this.prev = val
    }
    else{
      this.props.webViewCreate()
    }
    return cond
  }

  componentWillUnmount() {
    if(this.props.refs2[`bookmarkbar-${this.props.tab.key}`] == this){
      delete this.props.refs2[`bookmarkbar-${this.props.tab.key}`]
    }
  }

  render(){
    return this.isShow() ? <BookmarkBar {...this.props}/> : null
  }
}

class BookmarkBar extends Component {
  constructor(props) {
    super(props)
    this.state = {bookmarks:[]}
    this.refs2 = {}
    this.calcNum= ::this.calcNum
  }

  getWebContents(tab){
    if(!tab.wv || !tab.wvId) return
    return this.props.currentWebContents[tab.wvId]
  }

  getKey(node,ind=1){
    if(!node.id) return 'root'
    const arr = node.id.split('/')
    return arr[arr.length - ind]
  }

  handleFileMouseDown(node,e){
    if(e.button == 2){
      ipc.send("favorite-menu","__BAR__")
      this.menuKey = [node]
    }
    this.mouseDown = e.target
    this.button = e.button
  }

  handleFileMouseUp(url,e){
    if(this.mouseDown !== e.target || this.button !== e.button) return
    this.mouseDown = void 0
    this.button = void 0

    const tab = this.props.tab
    if(e.button == 0){
      this.props.navigateTo(tab.page, url, tab)
    }
    else if(e.button == 1){
      tab.events['create-web-contents'](null, {id:tab.wvId,targetUrl:url,disposition:'background-tab'})
    }
    else{
    }
  }

  handleFolderMouseUp(url,e){
    if(this.mouseDown !== e.target || this.button !== e.button) return

    const tab = this.props.tab
    if(e.button == 0 || e.button == 1){
      this.props.navigateTo(tab.page, url, tab)
    }
    else{
    }
    this.mouseDown = void 0
    this.button = void 0
  }

  calcNum(){
    let i = 0
    let overflow = false

    const barWidth = ReactDOM.findDOMNode(this.refs.bar).offsetWidth
    let accumWidth = 27
    for(let f of _result.children){
      const favicon = f.is_file && f.favicon !== "resource/file.png" ?  1 : void 0
      const title = multiByteSlice(f.title,15)
      const width = (favicon ? 19 : 17) + 12 + getTextWidth(title,'14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"')
      accumWidth += width
      if(accumWidth > barWidth){
        overflow = true
        break
      }
      i++
    }
    return i
  }

  async updateBookmark(){
    const isFloat = isFloatPanel(this.props.k)
    const bookmarks = [<NavbarMenu k={this.props.k} isFloat={isFloat} ref={r=>this.refs2.last = r} onClick={_=>_} timeOut={50} style={{float: 'right'}} key={'last'}
                                   badget={
                                     <span className="bookmark-right-arrow"><i className="fa fa-angle-double-right"></i></span>}>
      <div className="divider" />
      <div role="option" className="item favorite infinite-classic">
        <FavoriteExplorer cont={_=>this.getWebContents(this.props.tab)} searchNum={this.calcNum}
                          onClick={_=> {this.refs2.last.setState({visible:false})}}/>
      </div>
    </NavbarMenu>]

    for(let f of _result.children){
      const favicon = f.is_file ? (await faviconGet(f)) : void 0
      const title = multiByteSlice(f.title,15)

      let ele
      if(f.is_file){
        ele = <a className="bookmark-item" key={f.key}
                 onMouseUp={this.handleFileMouseUp.bind(this, f.url)}
                 onMouseDown={this.handleFileMouseDown.bind(this, f)}>
          {favicon ? <img className="favi-favorite" src={favicon}/> :
            <i class="infinite-tree-folder-icon fa fa-file doc"/> }
          <span className="infinite-tree-title">{title}</span>
        </a>
      }
      else{
        const ref = `favoriteMenu${f.key}`
        ele = <NavbarMenu k={this.props.k} isFloat={isFloat} ref={r=>this.refs2[ref] = r} onClick={_=>_} timeOut={50} alignLeft={true} key={f.key}
                          badget={
                            <a className="bookmark-item"
                               onMouseDown={this.handleFileMouseDown.bind(this, f)}>
                              <i className="infinite-tree-folder-icon folder-icon fa fa-folder folder"/>
                              <span className="infinite-tree-title">{title}</span>
                            </a>}>
          <div className="divider" />
          <div role="option" className="item favorite infinite-classic">
            <FavoriteExplorer cont={_=>this.getWebContents(this.props.tab)} searchKey={f.key}
                              onClick={_=> {this.refs2[ref].setState({visible:false})}}/>
          </div>
        </NavbarMenu>
      }
      bookmarks.push(ele)
    }
    this.setState({bookmarks})
  }

  componentWillMount() {
    this.initEvents()

    this.eventUpdateDatas = (e,data)=>{
      if(!_update){
        _update = uuid.v4()
        ipc.send('get-favorites-shallow',_update,'root',70)
      }

      ipc.once(`get-favorites-shallow-reply_${_update}`,(e,result)=>{
        _update = false
        _result = result
        this.updateBookmark()
      })
    }
    ipc.on("update-datas",this.eventUpdateDatas)

    if(!_result){
      const key = uuid.v4()
      ipc.send('get-favorites-shallow',key,'root',70)
      ipc.once(`get-favorites-shallow-reply_${key}`,(e,result)=>{
        _result = result
        this.updateBookmark()
      })
    }
    else{
      this.updateBookmark()
    }
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.tokenResize)
    ipc.removeListener("update-datas",this.eventUpdateDatas)
  }

  initEvents() {
    this.event = (e, cmd) => {
      if(!this.menuKey) return
      if(cmd == "openInNewTab" || cmd == "openInNewPrivateTab" || cmd == "openInNewSessionTab" || cmd == "openInNewWindow" || cmd == "openInNewWindowWithOneRow" || cmd == "openInNewWindowWithTwoRow") {
        const nodes = this.menuKey
        this.menuKey = (void 0)
        openFavorite(nodes.map(n=>n.key),this.props.tab.wvId,cmd).then(_=>{
          console.log(324234235346545)
          this.props.onClick && this.props.onClick()
        })
      }
      // else if(cmd == "delete") {
      //   const nodes = this.menuKey
      //   this.menuKey = (void 0)
      //   const parentNodes = nodes.map(n => n.getParent())
      //   deleteFavorite(nodes.map(n=>this.getKey(n)),parentNodes.map(parent=>this.getKey(parent))).then(_ => {
      //     if(isMain) this.eventUpdateDatas()
      //   })
      // }
      // else if(cmd == "edit"){
      //   const nodes = this.menuKey
      //   this.menuKey = (void 0)
      //   showDialog({
      //     inputable: true, title: 'Rename',
      //     text: `Enter a new Name`,
      //     initValue: nodes[0].type == 'file' ? [nodes[0].name,nodes[0].url] : [nodes[0].name],
      //     needInput: nodes[0].type == 'file' ? ["Title","URL"] : ["Title"]
      //   },this.props.cont ? this.props.cont.getId() : (void 0)).then(value => {
      //     if (!value) return
      //     const data = nodes[0].type == 'file' ? {title:value[0], url:value[1]} : {title:value[0]}
      //     console.log(this.getKey(nodes[0]),data)
      //     renameFavorite(this.getKey(nodes[0]),data).then(_=>_)
      //   })
      // }
      // else if(cmd == "addBookmark" || cmd == "addFolder") {
      //   const isPage = cmd == "addBookmark"
      //   const nodes = this.menuKey
      //   this.menuKey = (void 0)
      //   showDialog({
      //     inputable: true, title: `New ${isPage ? 'Page' : 'Directory'}`,
      //     text: `Enter a new ${isPage ? 'page title and URL' : 'directory name'}`,
      //     needInput: isPage ? ["Title","URL"] : [""]
      //   },this.props.cont ? this.props.cont.getId() : (void 0)).then(value => {
      //     if (!value) return
      //     const data = isPage ? {title:value[0], url:value[1], is_file:true} : {title:value[0], is_file:false,children:[]}
      //     insertFavorite(this.getKey(nodes[0].getParent()),data).then(_=>_)
      //   })
      // }
    }
    ipc.on('favorite-menu-reply', this.event)
  }
  render(){
    return <div ref="bar" className="bookmark-bar">
      {this.state.bookmarks}
    </div>
  }
}