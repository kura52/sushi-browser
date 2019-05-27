const React = require('react')
import MenuOperation from './MenuOperation'
const ipc = require('electron').ipcRenderer
const getTheme = require('./theme')
import PubSub from './pubsub'
const isDarwin = navigator.userAgent.includes('Mac OS X')
const sharedState = require('./sharedState')

export default function RightTopBottonSet(props){
  return <div className="title-button-set" style={{...props.style,height: 27,color:getTheme('colors','bookmark_text')||getTheme('colors','tab_text')||'black'}}>
    {isDarwin ? null : <span className={`fa fa-th ${sharedState.arrange == 'all' ? 'active-arrange' : ''}`} onClick={_=>PubSub.publish('toggle-arrange')}></span>}
    {props.displayFullIcon ? <span className={props.toggleNav == 3 ? "typcn typcn-arrow-minimise" : "typcn typcn-arrow-maximise"} onClick={_=>ipc.send('toggle-fullscreen')}></span> : null}
    <span className="typcn typcn-minus" onClick={MenuOperation.windowMinimize}></span>
    <span className="typcn typcn-media-stop-outline" onClick={MenuOperation.windowMaximize}></span>
    <span className="typcn typcn-times" onClick={MenuOperation.windowClose}></span>
  </div>
}