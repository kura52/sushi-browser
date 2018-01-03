const React = require('react')
import MenuOperation from './MenuOperation'
const ipc = require('electron').ipcRenderer

export default function RightTopBottonSet(props){
  return <div className="title-button-set" style={props.style}>
    {props.displayFullIcon ? <span className={props.toggleNav == 3 ? "typcn typcn-arrow-minimise" : "typcn typcn-arrow-maximise"} onClick={_=>ipc.send('toggle-fullscreen')}></span> : null}
    <span className="typcn typcn-minus" onClick={MenuOperation.windowMinimize}></span>
    <span className="typcn typcn-media-stop-outline" onClick={MenuOperation.windowMaximize}></span>
    <span className="typcn typcn-times" onClick={MenuOperation.windowClose}></span>
  </div>
}