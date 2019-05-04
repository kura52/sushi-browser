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
const mainState = require('./mainStateRemote')
// const isWin = navigator.userAgent.includes('Windows')


export default class MobilePanel extends Component {
  constructor(props) {
    super(props)
    this.setWidth = ::this.setWidth
    this.move = ::this.move
    this.blur = ::this.blur
    this.focus = ::this.focus
    this.minimize = ::this.minimize
    this.unminimize = ::this.unminimize
    this.closeMobileWindow = ::this.closeMobileWindow
    this.isPanel = props.mobilePanel.isPanel
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
        webContents.toggleDevTools() //@TODO ELECTRON
        break
      }
    }
  }

  initPanel(){
    this.div = ReactDOM.findDOMNode(this.refs.div)
    const r = this.div.getBoundingClientRect()

    let tabId = this.props.tab.wvId, key = this.props.tab.key

    this.win.on('move',this.move)
    this.win.on('blur',this.blur)
    this.win.on('focus',this.focus)
    this.win.on('minimize',this.minimize)
    this.win.on('restore',this.unminimize)

    ipc.on(`resize-mobile-panel_${key}`,(e,width,height)=>{
      this.setWidth(width, true)
    })

    this.ro = new ResizeObserver((entries, observer) => {
      for (const entry of entries) {
        const r = this.div.getBoundingClientRect()
        ipc.send('mobile-panel-operation',{type: 'resize', key, tabId,x:window.screenX + r.left,y:window.screenY + r.top,width:r.width,height:r.height})
      }
    })
    this.wv = this.props.parent.refs2.webview
    this.ro.observe(this.wv)

    return r
  }

  async componentDidMount() {
    console.log("mobilePanel")
    let tabId = this.props.tab.wvId, key = this.props.tab.key

    if(!tabId){
      for(let i=0;i<100;i++){
        await new Promise(r=>setTimeout(r,100))
        tabId = this.props.tab.wvId
        if(tabId) break
      }
    }
    this.win = remote.getCurrentWindow()

    if(this.props.mobilePanel.isPanel){
      const r =  this.initPanel()
      ipc.send('mobile-panel-operation',{type: 'create',detach: !this.props.mobilePanel.isPanel, key, tabId, url: this.props.tab.page.navUrl,
        x:window.screenX + r.left,y:window.screenY + r.top,width:r.width,height:r.height})
    }
    else{
      ipc.send('mobile-panel-operation',{type: 'create',detach: !this.props.mobilePanel.isPanel, key, tabId, url: this.props.tab.page.navUrl,
        x:window.screenX,y:window.screenY,width:600,height:800})
    }

    this.tokenNavigate = PubSub.subscribe(`did-navigate_${this.props.tab.key}`,(msg,url)=>{
      ipc.send('mobile-panel-operation',{type: 'url', key, tabId, url})
    })

    ipc.once(`mobile-panel-close_${this.props.tab.key}`,this.closeMobileWindow)
  }

  componentDidUpdate(prevProps, prevState){
    if(!this.props.tab.fields.mobilePanel) return

    if(this.isPanel !== this.props.tab.fields.mobilePanel.isPanel){
      this.isPanel = this.props.tab.fields.mobilePanel.isPanel
      if(this.isPanel){
        setTimeout(_=>this.initPanel(),100)
      }
      else{
        setTimeout(_=>this.deletedPanel(),100)
      }
    }
  }

  closeMobileWindow(){
    delete this.props.tab.fields.mobilePanel
    this.props.parent.setState({})
    PubSub.publish('force-update-navbar')
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
    ipc.send('mobile-panel-operation',{type: 'below', key: this.props.tab.key, tabId: this.props.tab.wvId, show: this.props.isActive})
  }

  minimize(e){
    console.log('minimize')
    ipc.send('mobile-panel-operation',{type: 'minimize', key: this.props.tab.key, tabId: this.props.tab.wvId})
  }

  unminimize(e){
    console.log('unminimize')
    ipc.send('mobile-panel-operation',{type: 'unminimize', key: this.props.tab.key, tabId: this.props.tab.wvId})
  }

  focus(e){
    console.log('focus')
    const r = this.div.getBoundingClientRect()
    if(this.props.isActive){
      ipc.send('mobile-panel-operation',{type: 'above', key: this.props.tab.key, tabId: this.props.tab.wvId})
    }
  }

  deletedPanel(){
    this.win.removeListener('move',this.move)
    this.win.removeListener('blur',this.blur)
    this.win.removeListener('focus',this.focus)
    this.win.removeListener('minimize',this.minimize)
    this.win.removeListener('restore',this.unminimize)

    if(this.ro) this.ro.unobserve(this.wv)
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.tokenNavigate)
    ipc.send('mobile-panel-operation',{type: 'close', key: this.props.tab.key, tabId: this.props.tab.wvId})
    this.deletedPanel()
    ipc.removeListener(`mobile-panel-close_${this.props.tab.key}`,this.closeMobileWindow)
  }


  getWebContents(tab){
    if(!tab.wv || !tab.wvId) return
    return global.currentWebContents[tab.wvId]
  }

  setWidth(width, mouseUp){
    this.props.mobilePanel.width = width
    this.props.parent.setState({})
    if(mouseUp) mainState.set('mobilePanelWidth',width)
    // const r = this.div.getBoundingClientRect()
    // ipc.send('mobile-panel-operation',{type: 'resize', key: this.props.tab.key, tabId: this.props.tab.wvId, x:window.screenX + r.left,y:window.screenY + r.top,width:r.width,height:r.height})

  }

  render() {
    const mobilePanel = this.props.mobilePanel
    return !mobilePanel.isPanel ? null : <span style={{float: 'left', height: '100%', display: 'flex'}}>
      <div ref="div" className={`mobile-panel m${this.props.tab.key}`} style={{width: mobilePanel.width}} >
      </div>
      <VerticalTabResizer width={mobilePanel.width} setWidth={(width)=>this.setWidth(width, true)} direction='left' />
    </span>
  }
}