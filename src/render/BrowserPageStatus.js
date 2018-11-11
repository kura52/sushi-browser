const React = require('react')
const ReactDOM = require('react-dom');
import {ipcRenderer as ipc} from 'electron'
const PubSub = require('./pubsub')
const getTheme = require('./theme')
const sharedState = require('./sharedState')
const {Component} = React

export default class BrowserPageStatus extends Component {
  componentDidMount() {
    this.token = PubSub.subscribe(`change-status-${this.props.tab.key}`,_=>{
      this.setState({})
    })
  }

  componentWillUnmount() {
    if(this.token) PubSub.unsubscribe(this.token)
  }

  componentDidUpdate(prevProps, prevState){
    const r = this.status ? ReactDOM.findDOMNode(this).getBoundingClientRect() : {left:0, top:0, width:0, height:0}
    ipc.send('set-overlap-component', 'page-status', this.props.k, this.props.tab.key, r.left, r.top, r.width, r.height, !this.status || this.status.length <= 100 ? this.status : `${this.status.substr(0,100)}...`, this.style)

  }

  render(){
    this.style = {backgroundColor: getTheme('colors','toolbar') || void 0,
      color: (getTheme('colors','bookmark_text') || void 0)}
    this.status = this.props.tab.page.statusText
    if (!this.status && this.props.tab.page.isLoading)
      this.status = 'Loading...'
    else if(this.status){
      try{
        this.status = decodeURIComponent(this.status)
      }catch(e){
        console.log(e)
      }
    }
    return sharedState.statusBar ? null : <div style={this.style} className={`${(this.status ? 'visible' : 'hidden')} browser-page-status`}>{!this.status || this.status.length <= 100 ? this.status : `${this.status.substr(0,100)}...`}</div>

  }

}