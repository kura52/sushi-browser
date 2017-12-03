const React = require('react')
const ReactDOM = require('react-dom');
const {Component} = React
const ipc = require('electron').ipcRenderer
import { Dropdown } from 'semantic-ui-react';
const {remote} = require('electron')
const {Menu} = remote
const {messages,locale} = require('./localAndMessage')
const defaultIcons = {},popups = {},bgs = {}

ipc.on('chrome-browser-action-set-icon-ipc-all',(e,extensionId,val) => {
  if(!val.path) return
  let _icon = typeof val.path === "object" ? Object.values(val.path)[0] : val.path
  if(_icon.startsWith('chrome-extension://')) _icon = _icon.split("/").slice(3).join("/")
  defaultIcons[extensionId] = _icon
})

ipc.on('chrome-browser-action-set-popup-ipc-all',(e,extensionId,val) => {
  if(!val.popup) return
  popups[extensionId] = val.popup
})

ipc.on('chrome-browser-action-set-background-ipc-all',(e,extensionId,val) => {
  if(!val.color) return
  bgs[extensionId] = val.color
})

const defaults = {}
class BrowserActionWebView extends Component {
  constructor(props) {
    super(props)
    this.state = {style:{opacity: 0.01}}
    this.first = true
  }

  componentDidMount() {
    const webview = this.refs.webview

    webview.addEventListener('did-attach', () => {
      webview.enablePreferredSizeMode(true);
    });

    webview.addEventListener('preferred-size-changed', () => {
      console.log(webview)
      webview.getPreferredSize((preferredSize) => {
        console.log(preferredSize)
        const width = preferredSize.width
        const height = preferredSize.height + 15
        this.setState({style:{width,height}},_=>{
          setTimeout(_=>{
            this.props.setClassName("")

            const div = webview.parentNode
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

    })
  }

  onClose = ()=>{
    this.close = true
  }

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
    const icon = `${values.basePath}/${defaultIcons[props.id] ? defaultIcons[props.id] : values.default_icon ? (typeof values.default_icon === "object" ? Object.values(values.default_icon)[0] : values.default_icon) : Object.values(values.icons)[0]}`;
    this.state = {icon,className: 'opacity001'}
  }

  componentDidMount(){
    this.iconSet = (e,tabId,val) => {
      const {tab,values} = this.props
      // console.log("icon-get",e,tabId,val)
      if(tab.wvId !== tabId || !val.path) return
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
      if(this.props.tab.wvId !== tabId) return
      if(this.state.title !== val.title) this.setState({title: val.title})
    }
    ipc.on(`chrome-browser-action-set-title-ipc-${this.props.id}`,this.titleSet)

    this.badgeSet = (e,tabId,val) => {
      if(this.props.tab.wvId !== tabId) return
      if(this.state.text !== val.text) this.setState({text: val.text})
    }
    ipc.on(`chrome-browser-action-set-badge-ipc-${this.props.id}`,this.badgeSet)

    this.backgroundSet = (e,tabId,val) => {
      if(this.props.tab.wvId !== tabId) return
      if(Array.isArray(val.color)){
        val.color = `rgba(${val.color.join(',')})`
      }
      if(this.state.color !== val.color) this.setState({color: val.color})
    }
    ipc.on(`chrome-browser-action-set-background-ipc-${this.props.id}`,this.backgroundSet)

    this.popupSet = (e,tabId,val) => {
      if(this.props.tab.wvId !== tabId) return
      if(this.state.popup !== val.popup) this.setState({popup: val.popup})
    }
    ipc.on(`chrome-browser-action-set-popup-ipc-${this.props.id}`,this.popupSet)
  }

  componentWillUnmount(){
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

  render(){
    let retry = 0
    const id = this.props.id
    const values = this.props.values
    return <Dropdown onMouseDown={::this.handleClick} onOpen={_=>{if(this.refs && this.refs.popupView) this.refs.popupView.reload()}} onClose={_=>{if(this.refs && this.refs.popupView) this.refs.popupView.onClose()}}
      // onDragStart={e=>console.log(4342355,e)} onDragEnter={e=>{console.log(4342344,e)}}
                     scrolling className={`draggable-source nav-button sort-${id}`} key={id} trigger={<a href="javascript:void(0)"  title={this.state.title || values.name}>
      <img style={{width:16,height:16,verticalAlign:'middle'}} src={`file://${this.state.icon}`} onError={(e)=>{
        console.log(99854,this.state.icon)
        if(retry++ > 10) return
        e.target.src =  `file://${values.basePath}/${values.default_icon ? (typeof values.default_icon === "object" ? Object.values(values.default_icon)[0] : values.default_icon) : Object.values(values.icons)[0]}`
      }} />
      {this.state.text ? <div className="browserActionBadge" style={{backgroundColor: this.state.color || bgs[this.props.id]}}>{this.state.text}</div> : null}
    </a>} icon={null}>
      <Dropdown.Menu className={`browser-action nav-menu ${this.state.className}`} >
        {this.state.popup || popups[this.props.id] || values.default_popup ? <BrowserActionWebView ref="popupView" url={`chrome-extension://${id}/${this.state.popup || popups[this.props.id] || values.default_popup}`} setClassName={::this.setClassName}/>: ""}
      </Dropdown.Menu>
    </Dropdown>
  }
}