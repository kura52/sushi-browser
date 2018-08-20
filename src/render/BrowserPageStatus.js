const React = require('react')
const PubSub = require('./pubsub')
const getTheme = require('./theme')
const sharedState = require('./sharedState')
const {Component} = React

export default class BrowserPageStatus extends Component {
  componentDidMount() {
    this.token = PubSub.subscribe(`change-status-${this.props.tab.key}`,_=>this.setState({}))
  }

  componentWillUnmount() {
    if(this.token) PubSub.unsubscribe(this.token)
  }

  render(){
    let style = {backgroundColor: getTheme('colors','toolbar') || void 0,
      color: (getTheme('colors','bookmark_text') || void 0)}
    let status = this.props.tab.page.statusText
    if (!status && this.props.tab.page.isLoading)
      status = 'Loading...'
    else if(status){
      try{
        status = decodeURIComponent(status)
      }catch(e){
        console.log(e)
      }
    }
    return sharedState.statusBar ? null : <div style={style} className={`${(status ? 'visible' : 'hidden')} browser-page-status`}>{!status || status.length <= 100 ? status : `${status.substr(0,100)}...`}</div>

  }

}