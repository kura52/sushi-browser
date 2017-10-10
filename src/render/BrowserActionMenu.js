const React = require('react')
const ReactDOM = require('react-dom');
const {Component} = React
const ipc = require('electron').ipcRenderer
import { Dropdown } from 'semantic-ui-react';
const {remote} = require('electron')
const {Menu} = remote
const {messages,locale} = require('./localAndMessage')


class BrowserActionWebView extends Component {
  constructor(props) {
    super(props)
    this.state = {style:{opacity: 0.01}}
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
        const height = preferredSize.height
        this.setState({style:{width,height}},_=>{
          setTimeout(_=>{
            this.props.setClassName("")

            const div = webview.parentNode
            const rect = div.getBoundingClientRect()
            if(rect.x + width > window.innerWidth){
              div.style.setProperty("left", `${window.innerWidth - width - rect.x + 18}px`, "important")
            }
          },200)
        })
      })

    })
  }

  render(){
    return <webview ref="webview" className="popup" src={this.props.url} style={this.state.style}/>
  }
}

export default class BrowserActionMenu extends Component{
  constructor(props) {
    super(props)
    const values = props.values
    const icon = `${values.basePath}/${values.default_icon ? (typeof values.default_icon === "object" ? Object.values(values.default_icon)[0] : values.default_icon) : Object.values(values.icons)[0]}`;
    this.state = {icon,className: 'opacity001'}
  }

  componentDidMount(){
    this.iconGet = (e,tabId,val) => {
      const {tab,values} = this.props
      console.log("icon-get",e,tabId,val)
      if(tab.wvId !== tabId) return
      let _icon = val.path ? typeof val.path === "object" ? Object.values(val.path)[0] : val.path : Object.values(values.icons)[0]
      if(_icon.startsWith('chrome-extension://')) _icon = _icon.split("/").slice(3).join("/")
      this.setState({icon: `${values.basePath}/${_icon}`})
    }
    ipc.on(`chrome-browser-action-set-icon-ipc-${this.props.id}`,this.iconGet)
  }

  componentWillUnmount(){
    ipc.removeListener(`chrome-browser-action-set-icon-ipc-${this.props.id}`,this.iconGet)
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
      if(values.default_icon){
        let props = {
          x: e.x,
          y: e.y,
          screenX: e.screenX,
          screenY: e.screenY,
          offsetX: e.offsetX,
          offsetY: e.offsetY
        }

        console.log('chrome-browser-action-clicked', extensionId, tabId.toString(), "", props)
        ipc.send('chrome-browser-action-clicked', extensionId, tabId.toString(), "", props);
        return
      }
      else if (values.default_popup) {
        // console.log('chrome-browser-action-clicked', extensionId, tabId.toString(), "", props)
        // ipc.send('chrome-browser-action-clicked', extensionId, tabId.toString(), "", props);
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
    return <Dropdown onMouseDown={::this.handleClick}
                     // onDragStart={e=>console.log(4342355,e)} onDragEnter={e=>{console.log(4342344,e)}}
                     scrolling draggable className="nav-button" key={id} trigger={<a href="javascript:void(0)"  title={values.name}><img style={{width:16,height:16,verticalAlign:'middle'}} src={`file://${this.state.icon}`} onError={(e)=>{
                       console.log(99854,this.state.icon)
                       if(retry++ > 10) return
                       e.target.src =  `file://${values.basePath}/${values.default_icon ? (typeof values.default_icon === "object" ? Object.values(values.default_icon)[0] : values.default_icon) : Object.values(values.icons)[0]}`
                     }} /></a>} icon={null}>
      <Dropdown.Menu className={`browser-action nav-menu ${this.state.className}`}>
        {values.default_popup ? <BrowserActionWebView url={`chrome-extension://${id}/${values.default_popup}`} setClassName={::this.setClassName}/>: ""}
      </Dropdown.Menu>
    </Dropdown>
  }
}