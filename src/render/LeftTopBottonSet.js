const React = require('react')
import MenuOperation from './MenuOperation'

export default function LeftTopBottonSet(props){
  return <div className="title-button-set" style={props.style}>
    <span className="typcn typcn-times" onClick={MenuOperation.windowClose}></span>
    <span className="typcn typcn-minus" onClick={MenuOperation.windowMinimize}></span>
    <span className="typcn typcn-media-stop-outline" onClick={MenuOperation.windowMaximize}></span>
  </div>
}