const React = require('react')
const ReactDOM = require('react-dom');
const {Component} = React
const ipc = require('electron').ipcRenderer
import { Dropdown } from 'semantic-ui-react';
const {remote} = require('electron')
const {Menu} = remote

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
          setTimeout(_=>this.props.setClassName(""),200)
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
        const iconGet = (e,val) => {
          console.log(e,val)
          values.default_icon = val.path
          const icon = `${values.basePath}/${values.default_icon ? (typeof values.default_icon === "object" ? Object.values(values.default_icon)[0] : values.default_icon) : Object.values(values.icons)[0]}`;
          this.setState({icon})
        }
        ipc.once('chrome-browser-action-set-icon-ipc',iconGet)
        setTimeout(_=>ipc.removeListener('chrome-browser-action-set-icon-ipc',iconGet),5000)
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
      menuItems.push(({label: values.default_title || values.name, click: _=>cont.hostWebContents.send('new-tab', tabId, `https://chrome.google.com/webstore/detail/${extensionId}`)}))
      if(values.optionPage) menuItems.push(({label: 'Open Option Page' || values.name, click: _=>cont.hostWebContents.send('new-tab', tabId, `chrome-extension://${extensionId}/${values.optionPage}`)}))
      const menu = Menu.buildFromTemplate(menuItems)
      menu.popup(remote.getCurrentWindow())
  }

  render(){
    const id = this.props.id
    const values = this.props.values
    return <Dropdown onMouseDown={::this.handleClick} scrolling className="nav-button" key={id} trigger={<a href="#" title={values.name}><img style={{width:16,height:16,verticalAlign:'middle'}} src={`file://${this.state.icon}`}/></a>} pointing='top right' icon={null}>
      <Dropdown.Menu className={`browser-action nav-menu ${this.state.className}`}>
        {values.default_popup ? <BrowserActionWebView url={`chrome-extension://${id}/${values.default_popup}`} setClassName={::this.setClassName}/>: ""}
      </Dropdown.Menu>
    </Dropdown>
  }
}