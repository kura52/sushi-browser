import VerticalTabResizer from "./VerticalTabResizer";

const path = require('path')
const React = require('react')
const uuid = require("node-uuid")
import ReactDOM from 'react-dom'
import ResizeObserver from "resize-observer-polyfill";
const {Component} = React
const ipc = require('electron').ipcRenderer
const PubSub = require('./pubsub');
const sharedState = require('./sharedState')
const {remote} = require('electron')
const mainState = remote.require('./mainState')
// const isWin = navigator.userAgent.includes('Windows')


export default class DevToolsPanel extends Component {
  constructor(props) {
    super(props)
    this.state  = {}
    this.setWidth = ::this.setWidth
    this.move = ::this.move
    this.blur = ::this.blur
    this.focus = ::this.focus
  }

  async tabIdChanged(e){
    this.tabId = e.tabID
    let devWebContents
    for(let i=0;i<100;i++){
      await new Promise(r=>setTimeout(_=>{
        devWebContents = global.currentWebContents[this.tabId]
        r()
      },100))
      if(devWebContents){
        const webContents = this.getWebContents(this.props.tab)
        webContents.setDevToolsWebContents(devWebContents)
        webContents.toggleDevTools()
        break
      }
    }
  }

  componentDidMount() {
    console.log("mobilePanel")

    this.div = ReactDOM.findDOMNode(this.refs.div)
    const r = this.div.getBoundingClientRect()

    const tabId = this.props.tab.wvId,
      key = this.props.tab.key

    ipc.send('mobile-panel-operation',{type: 'create', key, tabId, url: this.props.tab.page.navUrl,
      x:window.screenX + r.left,y:window.screenY + r.top,width:r.width,height:r.height})

    this.tokenNavigate = PubSub.subscribe(`did-navigate_${this.props.tab.key}`,(msg,url)=>{
      ipc.send('mobile-panel-operation',{type: 'url', key, tabId, url})
    })

    this.win = remote.getCurrentWindow()
    this.win.on('move',this.move)
    this.win.on('blur',this.blur)
    this.win.on('focus',this.focus)

    ipc.on(`resize-mobile-panel_${key}`,(e,width,height)=>{
      this.setWidth(width, true)
    })

    this.ro = new ResizeObserver((entries, observer) => {
      for (const entry of entries) {
        const r = this.div.getBoundingClientRect()
        ipc.send('mobile-panel-operation',{type: 'resize', key, tabId,x:window.screenX + r.left,y:window.screenY + r.top,width:r.width,height:r.height})
      }
    })
    this.wv = this.props.parent.refs.webview
    this.ro.observe(this.wv)
  }


  move(e){
    setTimeout(_=>{
      console.log('move')
      const r = this.div.getBoundingClientRect()
      ipc.send('mobile-panel-operation',{type: 'resize', key: this.props.tab.key, tabId: this.props.tab.wvId, x:window.screenX + r.left,y:window.screenY + r.top,width:r.width,height:r.height})
    },0)
  }

  blur(e){
    console.log('blur')
    const r = this.div.getBoundingClientRect()
    ipc.send('mobile-panel-operation',{type: 'below', key: this.props.tab.key, tabId: this.props.tab.wvId, show: this.props.isActive})
  }

  focus(e){
    console.log('focus')
    const r = this.div.getBoundingClientRect()
    if(this.props.isActive){
      ipc.send('mobile-panel-operation',{type: 'above', key: this.props.tab.key, tabId: this.props.tab.wvId})
    }
  }

  componentWillUnmount() {
    // const webview = this.refs.devWebview
    // if(webview) webview.removeEventListener('tab-id-changed',this.tabIdChanged)
    ipc.send('mobile-panel-operation',{type: 'close', key: this.props.tab.key, tabId: this.props.tab.wvId})
    PubSub.unsubscribe(this.tokenNavigate)

    this.win.removeListener('move',this.move)
    this.win.removeListener('blur',this.blur)
    this.win.removeListener('focus',this.focus)

    this.ro.unobserve(this.wv)
  }


  getWebContents(tab){
    if(!tab.wv || !tab.wvId) return
    return global.currentWebContents[tab.wvId]
  }

  setWidth(width, mouseUp){
    this.props.mobilePanel.width = width
    this.props.parent.setState({})
    if(mouseUp) mainState.set('mobilePanelWidth',width)
  }

  render() {
    const mobilePanel = this.props.mobilePanel
    return this.state.detach ? null : <span style={{float: 'left', height: '100%', display: 'flex'}}>
      <div ref="div" className={`mobile-panel m${this.props.tab.key}`} style={{width: mobilePanel.width}} >
      </div>
      <div className="vertical-divider" style={{margin: 0}} />
    </span>
  }
}