window.debug = require('debug')('info')
// require('debug').enable("info")
import {ipcRenderer as ipc} from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import uuid from 'node-uuid';
import Selection from '../render/react-selection/indexTable';
import path from 'path';
const PubSub = require('pubsub-js')
const { Form, TextArea, Grid, Sidebar, Segment, Container, Menu, Input, Divider, Button, Checkbox, Icon, Table, Dropdown } = require('semantic-ui-react');
const { StickyContainer, Sticky } = require('react-sticky');
const l10n = require('../../brave/js/l10n')
const SplitPane = require('../render/split_pane/SplitPane')
const Commands = require('./automationInfinite')

const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'
const isWin = navigator.userAgent.includes('Windows')
l10n.init()


function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function getUrlVars(){
  var vars = {};
  var param = location.search.substring(1).split('&');
  for(var i = 0; i < param.length; i++) {
    var keySearch = param[i].search(/=/);
    var key = '';
    if(keySearch != -1) key = param[i].slice(0, keySearch);
    var val = param[i].slice(param[i].indexOf('=', 0) + 1);
    if(key != '') vars[key] = decodeURIComponent(val);
  }
  return vars;
}

function eachSlice(arr,size){
  const newArray = []
  for (let i = 0, l = arr.length; i < l; i += size){
    newArray.push(arr.slice(i, i + size))
  }
  return newArray
}

function equalArray(a,b){
  const len = a.length
  if(len != b.length) return false
  for(let i=0;i<len;i++){
    if(a[i] !== b[i]) return false
  }
  return true
}

class ReactTable extends React.Component {
  constructor(props){
    super(props)
    this.state = {columns : props.columns, datas: props.datas}
  }

  renderHeader(){
    const headers = this.state.columns.map((col,i)=>{
      return <div className="rt-resizable-header -cursor-pointer rt-th" key={i}
                  style={{flex: `${col.width} 0 auto`,width:col.width,maxWidth:col.maxWidth}}>
        <div>{col.name}</div>
        <div className="rt-resizer"></div>
      </div>
    })
    return <div className="rt-thead -header" style={{minWidth: 80,position: 'sticky',top: 0,backgroundColor: '#f9fafb'}}>
      <div className="rt-tr">{headers}</div>
    </div>
  }

  render(){
    return <div className="ReactTable">
      <div className="rt-table">
        {this.renderHeader()}
        <div className="rt-tbody" style={{minWidth: 80}}>
          <Commands datas={this.props.datas}/>
        </div>
      </div>
    </div>
  }
}

let defaultData
const key = Math.random().toString()

class Automation extends React.Component {
  constructor(props) {
    super(props)
    this.state = defaultData
    this.opColumns = [
      {name:'#',width:10,maxWidth:40},
      {name:'Command',width:20,maxWidth:200},
      {name:'Target',width:30,maxWidth:300},
      {name:'Value',width:20,maxWidth:200},
      {name:'URL',width:20,maxWidth:200}
    ]

    window.addEventListener('resize', ::this.handleResize,{ passive: true });
  }

  componentDidMount(){
    chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
      if(request.event == "send-op"){
        const datas = [{key:'root', title:'root', is_file:false, children2: JSON.parse(request.opList)}]
        PubSub.publish('update-datas',datas)
      }
    })
  }

  handleResize(e) {
    const w = window.innerWidth
    const h = window.innerHeight
    if(w==this.w && h==this.h) return

    PubSub.publish("resizeWindow",{old_w:this.w,old_h:this.h,new_w:w,new_h:h,native:true})
    this.w = w
    this.h = h
  }

  handleRecord(){
    chrome.runtime.sendMessage({event:this.state.isRecording ? 'end-op' : 'start-op'})
    this.setState({isRecording: !this.state.isRecording})
  }

  existsAllFixedPanel(){
    const obj = {top:0,right:0}
    ;["bottom","left"].forEach(x=>{
      const ref = this.refs[`pane_${x}`].state
      const size = this.refs[`pane_${x}`].getSize()
      obj[x] = (x == "top" || x == "left") ? ref.size :
        (x=="bottom" ? size.height : size.width) - ref.size
      if(obj[x] == "0%") obj[x] = 0
    })
    console.log(333,obj)
    return obj
  }

  render(){
    return <div className="main">
      <nav className="navbar navbar-light bg-faded">
        <form className="form-inline">
          <button onClick={_=>this.handleNewDownload()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
            <i className="fa fa-plus-circle" aria-hidden="true"></i>New
          </button>
          <button onClick={_=>this.handleRecord()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
            <i className="fa fa-video-camera" aria-hidden="true"></i>Record{this.state.isRecording ? ' Stop' : ''}
          </button>
          <button onClick={_=>this.handleStart()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
            <i className="fa fa-play-circle-o" aria-hidden="true"></i>Play
          </button>
          <button onClick={_=>this.handlePause()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
            <i className="fa fa-pause-circle-o" aria-hidden="true"></i>Pause
          </button>
          <button onClick={_=>this.handleStart()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
            <i className="fa fa-fighter-jet" aria-hidden="true"></i>Play All
          </button>
          <button onClick={_=>this.handlePause()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
            <i className="fa fa-external-link-square" aria-hidden="true"></i>Export
          </button>

        </form>
      </nav>
      <SplitPane order={-1} split="horizontal" ref={'pane_bottom'} heightModify={45}
                 size={window.innerHeight - 245} onChange={()=>{}} onDragStarted={()=>{} } node={{}}
                 onDragFinished={()=>{}} notifyChange={()=>{}} existsAllFixedPanel={::this.existsAllFixedPanel}>
        <SplitPane order={-1} split="vertical"  ref={'pane_left'}
                   size={200} onChange={()=>{}} onDragStarted={()=>{} } node={{}}
                   onDragFinished={()=>{}} notifyChange={()=>{}} existsAllFixedPanel={::this.existsAllFixedPanel}>
          <div className="split-window" key='fixed-left'></div>
          <div className="split-window">
            <ReactTable columns={this.opColumns}/>

            <Divider/>
            <div className="field">
              <label style={{verticalAlign: 'baseline', paddingLeft: 10, paddingRight: 10}} className="right-pad">Command</label>
              <div className="ui input">
                <input type="text" style={{width: 300, padding: '.3em 1em'}} value={null} onChange={null}/>
              </div>
              <div className='spacer4'/>
              <label style={{verticalAlign: 'baseline', paddingLeft: 10, paddingRight: 35}} className="right-pad">Target</label>
              <div className="ui input">
                <input type="text" style={{width: 300, padding: '.3em 1em'}} value={null} onChange={null}/>
              </div>
              <div className='spacer4'/>
              <label style={{verticalAlign: 'baseline', paddingLeft: 10, paddingRight: 39}} className="right-pad">Value</label>
              <div className="ui input">
                <input type="text" style={{width: 300, padding: '.3em 1em'}} value={null} onChange={null}/>
              </div>
            </div>
          </div>
        </SplitPane>
        <div className="split-window" key='fixed-bottom'>
          <div className="ReactTable">
            <div className="rt-table">
              <div className="rt-thead -header" style={{width: '100vw',top: 0,backgroundColor: '#f9fafb',position:'absolute'}}>
                <div className="rt-tr">
                  <div className="rt-resizable-header -cursor-pointer rt-th" style={{}}>
                    <div>Log</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SplitPane>
    </div>
  }
}
ipc.send("get-main-state",key,['defaultDownloadPath'])
ipc.once(`get-main-state-reply_${key}`,(e,data)=>{
  defaultData = data
  ReactDOM.render(<Automation />,  document.getElementById('app'))
})