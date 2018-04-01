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
const MenuList = require('./automationMenuList')

const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'
const isWin = navigator.userAgent.includes('Windows')
l10n.init()

const opColumns = [
  {name:'#',width:10,maxWidth:48},
  {name:'Command',width:20,maxWidth:200},
  {name:'Target',width:30,maxWidth:300},
  {name:'Value',width:20,maxWidth:500},
  {name:'Info',width:20,maxWidth:700}
]

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
    this.state = {}
    this.mmove = ::this.mmove
    this.mup = ::this.mup
  }

  mdown(name,maxWidth,e) {
    this.drag = true
    this.name = name

    if(e.type === "mousedown") {
      var event = e;
    } else {
      var event = e.changedTouches[0];
    }

    this.x = event.pageX

    document.body.addEventListener("mousemove", this.mmove, false);
    document.body.addEventListener("touchmove", this.mmove, false);
    document.body.addEventListener("mouseleave", this.mup, false);
    document.body.addEventListener("touchleave", this.mup, false);
    document.body.addEventListener("mouseup", this.mup, false);
  }

  mmove(e) {
    console.log('mmove')
    if(!this.drag) return

    if(e.type === "mousemove") {
      var event = e;
    } else {
      var event = e.changedTouches[0];
    }

    e.preventDefault();

    const move = event.pageX - this.x
    this.x = event.pageX
    const dom = ReactDOM.findDOMNode(this.refs[this.name])
    const size = parseInt(dom.style.maxWidth) + move
    dom.style.maxWidth = `${size}px`
    // dom.style.width = `${size}px`
    dom.style.flex = `${size} 0 auto`
    PubSub.publishSync('row-size',{name:this.name, maxWidth:size})
    PubSub.publish('update-datas')
  }

  mup(e) {
    console.log('mup')
    this.drag = false
    document.body.removeEventListener("mouseup", this.mup, false);
    document.body.removeEventListener("mouseleave", this.mup, false);
    document.body.removeEventListener("touchleave", this.mup, false);
    document.body.removeEventListener("mousemove", this.mmove, false);
    document.body.removeEventListener("touchmove", this.mmove, false);
    PubSub.publishSync('row-size',{name:this.name, maxWidth:parseInt(ReactDOM.findDOMNode(this.refs[this.name]).style.maxWidth)})
    PubSub.publish('update-datas')
  }

  renderHeader(){
    const headers = opColumns.map((col,i)=>{
      return <div ref={col.name} className="rt-resizable-header -cursor-pointer rt-th" key={i}
                  style={{flex: `${col.width} 0 auto`,width:col.width,maxWidth:col.maxWidth}}>
        <div>{col.name}</div>
        <div onMouseDown={this.mdown.bind(this,col.name,col.maxWidth)} className="rt-resizer"></div>
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
          <Commands datas={this.props.datas} selectedMenu={this.props.selectedMenu} ref="command"/>
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
    this.state = {}
    this.state.menuItems = ipc.sendSync('get-automation-order')
    this.state.values = {key:'', command:'', target:'', value:''}
    this.state.selectedMenu = false
    this.handleSelectorReply = ::this.handleSelectorReply

    window.addEventListener('resize', ::this.handleResize,{ passive: true });
    window.addEventListener('beforeunload',_=>{
      if(this.state.isRecording) chrome.runtime.sendMessage({event:'end-op'})
    })
  }

  componentDidMount(){
    if(this.state.menuItems.length) this.selectItem(this.state.menuItems[0].key)

    chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
      if(request.event == "send-op" && this.state.selectedMenu == request.menuKey){
        const datas = [{key:'root', title:'root', is_file:false, children2: JSON.parse(request.opList)}]
        PubSub.publish('update-datas',datas)

        let values = {command:'', target:'', value:''}
        const selectedOps = this.refs.table.refs.command.getSelectedOps()
        if(selectedOps.length){
          for(let selectedOp of selectedOps.slice(0).reverse()){
            const op = datas[0].children2.find(x=>x.key == selectedOp)
            if(!op) continue
            values = {key:op.key, command:op.name, target:op.optSelector, value:op.value}
            break
          }
        }
        this.setState({values})
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
    if(!this.state.isRecording && !this.state.selectedMenu) return
    if(this.state.isRecording){
      chrome.runtime.sendMessage({event:'end-op'})
    }
    else{
      chrome.runtime.sendMessage({event:'start-op',key: this.state.selectedMenu,opKeys:this.refs.table.refs.command.getSelectedOps()})
    }
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

  updateAutomationOrder(){
    ipc.send('update-automation-order',this.state.menuItems)
  }

  getItemInfo() {
    if(this.state.selectedMenu) chrome.runtime.sendMessage({event: 'get-op', menuKey: this.state.selectedMenu})
  }

  addItem(){
    const key = uuid.v4()
    this.state.menuItems.push({key,name:'New Operations'})
    this.state.selectedMenu = key
    this.setState({})
    this.getItemInfo()
    this.updateAutomationOrder()
  }

  removeItem(key){
    const index = this.state.menuItems.findIndex(x=>x.key == key)
    if(this.state.menuItems[index - 1]) {
      this.state.selectedMenu = this.state.menuItems[index - 1].key
    }
    else if(this.state.menuItems[index + 1]){
      this.state.selectedMenu = this.state.menuItems[index + 1].key
    }
    else {
      this.state.selectedMenu = null
    }
    this.state.menuItems.splice(index,1)
    this.setState({})
    this.getItemInfo()
    ipc.send('delete-automation',key)
  }

  selectItem(key){
    this.state.selectedMenu = key
    this.setState({})
    this.getItemInfo()
  }

  updateItems(items){
    this.state.menuItems = items
    this.setState({})
    this.updateAutomationOrder()
  }

  updateOp(name,value){
    chrome.runtime.sendMessage({event:'update-op',menuKey: this.state.selectedMenu,opKey:this.state.values.key,name,value})
  }

  handleSelectorReply(e,selector){
    this.updateOp('optSelector',selector)
    this.isTargetSelector = false
  }

  render(){
    return <div className="main">
      <nav className="navbar navbar-light bg-faded">
        <form className="form-inline">
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
                 size={window.innerHeight - 235} onChange={()=>{}} onDragStarted={()=>{} } node={{}}
                 onDragFinished={()=>{}} notifyChange={()=>{}} existsAllFixedPanel={::this.existsAllFixedPanel}>
        <SplitPane order={-1} split="vertical" ref={'pane_left'} key="pane"
                   size={200} onChange={()=>{}} onDragStarted={()=>{} } node={{}}
                   onDragFinished={()=>{}} notifyChange={()=>{}} existsAllFixedPanel={::this.existsAllFixedPanel}>
          <div className="split-window" key='fixed-left'>
            <div className="split-window" key='menu'>
              <div className="ReactTable">
                <div className="rt-table">
                  <div className="rt-thead -header" style={{width: 'inherit',top: 0,backgroundColor: '#f9fafb',position:'sticky'}}>
                    <div className="rt-tr">
                      <div className="rt-resizable-header -cursor-pointer rt-th">
                        <div>Project</div>
                      </div>
                    </div>
                  </div>
                  <MenuList items={this.state.menuItems} selected={this.state.selectedMenu} updateItems={::this.updateItems}
                            addItem={::this.addItem} removeItem={::this.removeItem} selectItem={::this.selectItem}/>
                </div>
              </div>
            </div>
          </div>
          <div className="split-window" key='commands'>
            <ReactTable ref="table" selectedMenu={this.state.selectedMenu}/>

            <Divider/>
            <div className="field">
              <label style={{verticalAlign: 'baseline', paddingLeft: 10, paddingRight: 10}} className="right-pad">Command</label>
              <div className="ui input" style={{width: 'calc(100% - 150px)'}}>
                <input type="text" style={{width: 300, padding: '.3em 1em'}} value={this.state.values.command}
                       onChange={e=>{this.state.values.command = e.target.value;this.setState({})}} onBlur={e=>this.updateOp('name',e.target.value)}/>
              </div>
              <div className='spacer5'/>
              <label style={{verticalAlign: 'baseline', paddingLeft: 10, paddingRight: 35}} className="right-pad">Target</label>
              <div className="ui input" style={{width: 'calc(100% - 150px)'}}>
                <input type="text" style={{width: 300, padding: '.3em 1em'}} value={this.state.values.target}
                       onChange={e=>{this.state.values.target = e.target.value;this.setState({})}} onBlur={e=>this.updateOp('optSelector',e.target.value)}/>
                <Button style={this.isTargetSelector ? {backgroundColor: '#cacbcd'} : {}} icon='target' onClick={_=>{
                  if(this.isTargetSelector){
                    ipc.send('select-target',false)
                    ipc.removeListener('select-target-reply',this.handleSelectorReply)
                    this.isTargetSelector = false
                  }
                  else{
                    ipc.send('select-target',true)
                    ipc.once('select-target-reply',this.handleSelectorReply)
                    this.isTargetSelector = true
                  }
                }}/>
              </div>
              <div className='spacer5'/>
              <label style={{verticalAlign: 'baseline', paddingLeft: 10, paddingRight: 39}} className="right-pad">Value</label>
              <div className="ui input" style={{width: 'calc(100% - 150px)'}}>
                <input type="text" style={{width: 300, padding: '.3em 1em'}} value={this.state.values.value}
                       onChange={e=>{this.state.values.value = e.target.value;this.setState({})}} onBlur={e=>this.updateOp('value',e.target.value)}/>
              </div>
            </div>
          </div>
        </SplitPane>
        <div className="split-window" key='fixed-bottom'>
          <div className="ReactTable">
            <div className="rt-table">
              <div className="rt-thead -header" style={{width: '100vw',top: 0,backgroundColor: '#f9fafb',position:'sticky'}}>
                <div className="rt-tr">
                  <div className="rt-resizable-header -cursor-pointer rt-th"
                       style={{textAlign: 'initial', marginLeft: 5}}>
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

ReactDOM.render(<Automation />,  document.getElementById('app'))