const React = require('react')
const ReactDOM = require('react-dom');
const {Component} = React
const ipc = require('electron').ipcRenderer
import { Dropdown } from 'semantic-ui-react';
const {remote} = require('electron')
const {Menu} = remote
const {messages,locale} = require('./localAndMessage')
let [defaultIcons,popups,bgs,titles,texts] = ipc.sendSync('get-sync-main-states',['browserActionDefaultIcons','browserActionPopups','browserActionBgs','browserActionTitles','browserActionTexts'])

ipc.on('chrome-browser-action-set-ipc-all',(e,extensionId,name,val) => {
  if(val.path){
    let _icon = typeof val.path === "object" ? Object.values(val.path)[0] : val.path
    if(_icon.startsWith('chrome-extension://')) _icon = _icon.split("/").slice(3).join("/")
    defaultIcons[extensionId] = _icon
  }
  else if(val.popup){
    popups[extensionId] = val.popup
  }
  else if(val.color){
    if(Array.isArray(val.color)){
      val.color = `rgba(${val.color.join(',')})`
    }
    bgs[extensionId] = val.color
  }
  else if(val.text){
    texts[extensionId] = val.text
  }
  else if(val.title){
    titles[extensionId] = val.title
  }
})

const defaults = {}
class BrowserActionWebView extends Component {
  constructor(props) {
    super(props)
    this.state = {style:{opacity: 0.01}}
    this.first = true

    this.ipcEvent = e=> {
      if (e.channel == 'window-close') {
        this.props.close()
      }
    }
    this.didAttachEvent = () => {
      this.refs.webview.enablePreferredSizeMode(true);
    }

    let count,time
    this.preferredSizeEvent = (e) => {
      const webview = this.refs.webview
      const now  = Date.now()
      if(now - time < 1000){
        if(count++ > 7){
          count = 0
          time = now
          return
        }
      }
      else{
        count = 0
      }
      time = now

      console.log(webview)
      webview.getPreferredSize((preferredSize) => {
        console.log(preferredSize)
        const width = preferredSize.width
        const height = preferredSize.height
        this.setState({style:{width,height}},_=>{
          setTimeout(_=>{
            this.props.setClassName("")

            const div = webview.parentNode
            if(!div) return
            const rect = div.parentNode.getBoundingClientRect()
            if(rect.x + width > window.innerWidth){
              div.style.setProperty("left", `${36 -width}px`, "important")
              console.log(999999,window.innerWidth,width,rect.x,window.innerWidth - width - rect.x + 18)
            }
            // div.style.setProperty("width", `${width+10}px`, "important")
            // div.style.height = `${height+10}px`
            div.style.setProperty("top", '23px', "important")
            div.style.overflowY = 'hidden'
            div.style.setProperty("min-width", 'fit-content', "important")
            if(this.first){
              this.first = false
              if(this.refs.webview) this.refs.webview.reload()
            }
          },200)
        })
      })

    }
  }


  componentDidUpdate(prevProps, prevState) {
    this.componentDidMount()
  }

  componentDidMount() {
    const webview = this.refs.webview
    if(webview){
      if(!this.close && this.noCloseFlg){
        webview.reload()
        this.noCloseFlg = false
      }
      webview.addEventListener('ipc-message',this.ipcEvent)
      webview.addEventListener('did-attach',this.didAttachEvent );
      webview.addEventListener('preferred-size-changed',this.preferredSizeEvent)
    }
  }

  onClose = ()=>{
    this.close = this.noCloseFlg ? false: true
  }

  noClose = ()=> this.noCloseFlg = true

  reload = ()=>{
    this.close = false
    this.setState({})
  }

  render(){
    return this.close ? null : <webview ref="webview" className="popup" src={this.props.url} style={this.state.style}/>
  }
}

export default class BrowserActionMenu extends Component{
  constructor(props) {
    super(props)
    const values = props.values
    const icon = `${values.basePath}/${defaultIcons[props.id] ? defaultIcons[props.id] : values.default_icon ? (typeof values.default_icon === "object" ? Object.values(values.default_icon)[0] : values.default_icon) : values.icons ? Object.values(values.icons)[0] : ""}`;
    this.state = {icon,className: 'opacity001'}
    this.close = ::this.close
  }

  componentDidMount(){
    this.outerClick = e=>{
      if(!e.srcElement.closest(`.sort-${this.props.id}`)){
        this.close()
      }
    }
    this.iconSet = (e,tabId,val) => {
      const {tab,values} = this.props
      // console.log("icon-get",e,tabId,val)
      if(tabId !== null && (tab.wvId !== tabId || !val.path)) return
      let path = val.path
      if(!path[0]){
        for (let name in path) {
          if (path.hasOwnProperty(name)) {
            path = path[name]
            break
          }
        }
      }
      let _icon = path
      if(_icon.startsWith('chrome-extension://')) _icon = _icon.split("/").slice(3).join("/")
      const icon = `${values.basePath}/${_icon}`
      if(this.state.icon !== icon)  this.setState({icon})
    }
    ipc.on(`chrome-browser-action-set-icon-ipc-${this.props.id}`,this.iconSet)

    this.titleSet = (e,tabId,val) => {
      if(tabId !== null && this.props.tab.wvId !== tabId) return
      if(this.state.title !== val.title) this.setState({title: val.title})
    }
    ipc.on(`chrome-browser-action-set-title-ipc-${this.props.id}`,this.titleSet)

    this.badgeSet = (e,tabId,val) => {
      if(tabId !== null && this.props.tab.wvId !== tabId) return
      if(this.state.text !== val.text) this.setState({text: val.text})
    }
    ipc.on(`chrome-browser-action-set-badge-ipc-${this.props.id}`,this.badgeSet)

    this.backgroundSet = (e,tabId,val) => {
      if(tabId !== null && this.props.tab.wvId !== tabId) return
      if(Array.isArray(val.color)){
        val.color = `rgba(${val.color.join(',')})`
      }
      if(this.state.color !== val.color) this.setState({color: val.color})
    }
    ipc.on(`chrome-browser-action-set-background-ipc-${this.props.id}`,this.backgroundSet)

    this.popupSet = (e,tabId,val) => {
      if(tabId !== null && this.props.tab.wvId !== tabId) return
      if(this.state.popup !== val.popup) this.setState({popup: val.popup})
    }
    ipc.on(`chrome-browser-action-set-popup-ipc-${this.props.id}`,this.popupSet)
  }

  componentWillUnmount(){
    document.removeEventListener('mousedown',this.outerClick)
    ipc.removeListener(`chrome-browser-action-set-icon-ipc-${this.props.id}`,this.iconSet)
    ipc.removeListener(`chrome-browser-action-set-title-ipc-${this.props.id}`,this.titleSet)
    ipc.removeListener(`chrome-browser-action-set-badge-ipc-${this.props.id}`,this.badgeSet)
    ipc.removeListener(`chrome-browser-action-set-background-ipc-${this.props.id}`,this.backgroundSet)
    ipc.removeListener(`chrome-browser-action-set-popup-ipc-${this.props.id}`,this.popupSet)
  }


  setClassName(className){
    this.setState({className})
  }

  handleClick(e){
    if(document.elementFromPoint(e.clientX, e.clientY).tagName == 'WEBVIEW'){
      return
    }
    console.log(e)
    const extensionId = this.props.id
    const {cont,values} = this.props
    const tabId = cont.getId()

    if(e.which != 3) {

      let props = {
        x: e.x,
        y: e.y,
        screenX: e.screenX,
        screenY: e.screenY,
        offsetX: e.offsetX,
        offsetY: e.offsetY
      }
      if (this.state.popup || popups[extensionId] || values.default_popup) {
        // console.log('chrome-browser-action-clicked', extensionId, tabId.toString(), "", props)
        // ipc.send('chrome-browser-action-clicked', extensionId, tabId.toString(), "", props);
        return
      }
      else if(values.default_icon){
        console.log('chrome-browserAction-onClicked', extensionId, tabId.toString(), "", props)
        // ipc.send('chrome-browser-action-clicked', extensionId, tabId.toString(), "", props);
        ipc.send('chrome-browserAction-onClicked', extensionId, tabId.toString(), "", props);
        return
      }
    }

    const menuItems = []
    menuItems.push(({label: values.default_title || values.name, click: _=>cont.hostWebContents.send('new-tab', tabId, `https://chrome.google.com/webstore/detail/${values.orgId}`)}))
    if(values.optionPage) menuItems.push(({label: locale.translation('9147392381910171771'), click: _=>cont.hostWebContents.send('new-tab', tabId, `chrome-extension://${extensionId}/${values.optionPage}`)}))
    if(values.background) menuItems.push(({label: locale.translation("4989966318180235467"), click: _=>cont.loadURL(`chrome-extension://${extensionId}/${values.background}`)}))
    menuItems.push({label: locale.translation("6326175484149238433").replace('Chrome','Sushi Browser'),click: _=>ipc.send('delete-extension',extensionId,values.orgId)})
    const menu = Menu.buildFromTemplate(menuItems)
    menu.popup(remote.getCurrentWindow())
  }

  close(){
    this.refs.popupView.noClose()
    setTimeout(_=>this.refs.dd.close(),10)
  }

  render(){
    let retry = 0
    const id = this.props.id
    const values = this.props.values
    const popup = this.state.popup || popups[this.props.id] || values.default_popup
    const text = this.state.text || texts[this.props.id]
    const title = this.state.title || titles[this.props.id]
    return <Dropdown onMouseDown={::this.handleClick} onOpen={_=>{if(this.refs && this.refs.popupView){this.refs.popupView.reload()}; document.addEventListener('mousedown',this.outerClick)}} onClose={_=>{if(this.refs && this.refs.popupView){this.refs.popupView.onClose()};document.removeEventListener('mousedown',this.outerClick)}}
      // onDragStart={e=>console.log(4342355,e)} onDragEnter={e=>{console.log(4342344,e)}}
                     scrolling className={`draggable-source nav-button sort-${id}`} ref="dd" key={id} trigger={<a href="javascript:void(0)"  title={title|| values.name}>
      <img style={{width:16,height:16,verticalAlign:'middle'}} src={`file://${this.state.icon}`} onError={(e)=>{
        console.log(99854,this.state.icon)
        if(retry++ > 10) return
        e.target.src =  `file://${values.basePath}/${values.default_icon ? (typeof values.default_icon === "object" ? Object.values(values.default_icon)[0] : values.default_icon) : Object.values(values.icons)[0]}`
      }} />
      {text ? <div className="browserActionBadge" style={{backgroundColor: this.state.color || bgs[this.props.id]}}>{text}</div> : null}
    </a>} icon={null}>
      <Dropdown.Menu className={`browser-action nav-menu ${this.state.className}`} >
        {popup ? <BrowserActionWebView ref="popupView" close={this.close} url={popup.startsWith('chrome-extension://') ? popup : `chrome-extension://${id}/${popup}`} setClassName={::this.setClassName}/>: ""}
      </Dropdown.Menu>
    </Dropdown>
  }
}