import ToolbarResizer from "./ToolbarResizer";

const path = require('path')
const React = require('react')
const uuid = require("node-uuid")
import ReactDOM from 'react-dom'
const {Component} = React
const ipc = require('electron').ipcRenderer
const PubSub = require('./pubsub');
const sharedState = require('./sharedState')
const {remote} = require('electron')
const mainState = require('./mainStateRemote')
// const isWin = navigator.userAgent.includes('Windows')


export default class DevToolsPanel extends Component {
  constructor(props) {
    super(props)
    this.state  = {}
    this.tabIdChanged = ::this.tabIdChanged
    this.setHeight = ::this.setHeight
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
    console.log("devToolsPanel")
    const webview = this.refs.devWebview
    webview.addEventListener('tab-id-changed',this.tabIdChanged)
    this.token = PubSub.subscribe(`detach-tab`,(msg,val)=>{
      this.setState({detach: val})
    })
  }

  componentWillUnmount() {
    const webview = this.refs.devWebview
    if(webview) webview.removeEventListener('tab-id-changed',this.tabIdChanged)
    PubSub.unsubscribe(this.token)
    ipc.send('close-tab-pretask',this.tabId)
  }


  getWebContents(tab){
    if(!tab.wv || !tab.wvId) return
    return global.currentWebContents[tab.wvId]
  }

  setHeight(height, mouseUp){
    this.props.devToolsInfo.height = height
    this.props.parent.setState({})
    if(mouseUp) mainState.set('devToolsHeight',height)
  }

  render() {
    const devToolsInfo = this.props.devToolsInfo
    return this.state.detach ? null : <span style={this.props.style}>
      <ToolbarResizer height={devToolsInfo.height} setHeight={this.setHeight} minus={true}
                      style={{position: 'relative', height: 5, margin: '-2px 0' ,backgroundColor: '#a2a2a2', backgroundClip: 'padding-box',
                        borderTop: '2px solid rgba(255, 255, 255, 0)', borderBottom: '2px solid rgba(255, 255, 255, 0)' }}/>
      <webview className="dev-tool" ref="devWebview" style={{height: devToolsInfo.height - 1}} src='chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/blank.html'/>
    </span>
  }
}