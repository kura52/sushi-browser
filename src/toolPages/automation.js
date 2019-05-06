window.debug = require('debug')('info')
// require('debug').enable("info")
import {ipcRenderer as ipc} from './ipcRenderer'
import React from 'react';
import ReactDOM from 'react-dom';
import uuid from 'node-uuid';
import Selection from '../render/react-selection/indexTable';
import path from 'path';
const PubSub = require('pubsub-js')
const { Form, TextArea, Grid, Sidebar, Segment, Container, Menu, Input, Divider, Button, Checkbox, Icon, Table, Dropdown,Popup } = require('semantic-ui-react');
const { StickyContainer, Sticky } = require('react-sticky');
const SplitPane = require('../render/split_pane/SplitPane')
const Commands = require('./automationInfinite')
const MenuList = require('./automationMenuList')
const AutomationExportDialog = require('./automationExportDialog')

const puppeteer = require('./puppeteer/Puppeteer')
const helper = require('./puppeteer/helper')
const util = Function(require('./puppeteer/orgUtils'))()

const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'
const isWin = navigator.userAgent.includes('Windows')
const TOP_URL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html'
const CHROME_TOP_URL = 'chrome-search://local-ntp/local-ntp.html'

import l10n from '../../brave/js/l10n';
const initPromise = l10n.init()
import '../defaultExtension/contentscript'


const opColumns = [
  {name:'#',width:10,maxWidth:48},
  {name:'Command',width:20,maxWidth:200},
  {name:'Target',width:30,maxWidth:300},
  {name:'Value',width:20,maxWidth:500},
  {name:'Info',width:20,maxWidth:700}
]


function dateFormat(d) {
  const m = d.getMonth() + 1
  const da = d.getDate()
  const w = d.getDay()
  const h = d.getHours()
  const mi = d.getMinutes()
  const s = d.getSeconds()

  return `${d.getFullYear()}/${m < 10 ? '0'+ m : m}/${da < 10 ? '0'+ da : da} ${h < 10 ? '0'+ h : h}:${mi < 10 ? '0'+ mi : mi}:${s < 10 ? '0'+ s : s}`
}

function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\\-]/g, '\\$&'); // $& means the whole matched string
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


function isInputable(op){
  return (op.tag == 'input' && !(/^checkbox|radio|file|submit|image|reset|button|range|color$/).test(op.type || "")) ||
    op.tag == 'textarea' || op.contentEditable
}


function isSpecialKey(op){
  return op.keyChar == 'Tab' || op.keyChar == 'F5' || op.keyChar == 'Backspace' || op.keyChar == 'Delete' ||
    op.keyChar == 'Left' || op.keyChar == 'Up' || op.keyChar == 'Right' || op.keyChar == 'Down' ||
    (op.ctrlKey && (op.keyChar == 'A' || op.keyChar == 'X' || op.keyChar == 'C' || op.keyChar == 'V')) ||
    (op.tag == 'input' && op.keyChar == 'Enter')
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

let initData
const initDataWaitPromise = new Promise(r=>{
  const key = Math.random().toString()
  ipc.send('get-automation-order',key)
  ipc.once(`get-automation-order-reply_${key}`,(e, x) =>{
    initData = x
    r()
  })
})


class Automation extends React.Component {
  constructor(props) {
    super(props)
    this.state = defaultData
    this.state.menuItems = initData.datas
    this.state.selectedMenu = initData.menuKey

    if(!this.state.menuItems.length) this.addItem()

    this.state.values = {key:'', command:'', target:'', value:''}
    this.state.log = ''
    this.handleSelectorReply = ::this.handleSelectorReply

    window.addEventListener('resize', ::this.handleResize,{ passive: true });
    window.addEventListener('beforeunload',_=>{
      if(this.state.isRecording) chrome.runtime.sendMessage({event:'end-op'})
    })
  }

  componentDidMount(){
    if(this.state.menuItems.length && this.state.selectedMenu){
      this.selectItem(this.state.selectedMenu)
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
      if(request.event == "send-op" && (this.state.selectedMenu == request.menuKey || !this.state.selectedMenu)){
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

  onChange(name,e,data){
    const val = data.checked === void 0 ? data.value : data.checked
    ipc.send('save-state',{tableName:'state',key:name,val})
    this.setState({})
  }

  onChangeText(name,e){
    const val = e.target.value
    ipc.send('save-state',{tableName:'state',key:name,val})
    this.setState({[name]:val})
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

  isScrollBottom(){
    if(!this.scroll){
      this.scroll = ReactDOM.findDOMNode(this.refs.textArea)
    }
    return this.scroll.scrollTop + this.scroll.clientHeight == this.scroll.scrollHeight
  }

  scrollToBottom(){
    // if(this.isScrollBottom())
    if(!this.scroll){
      this.scroll = ReactDOM.findDOMNode(this.refs.textArea)
    }
      this.scroll.scrollTop = this.scroll.scrollHeight
  }

  updateLog(str){
    this.setState({log: `${this.state.log ? `${this.state.log}\n` : ''}[${dateFormat(new Date())}] ${str}`})
    this.scrollToBottom()
  }

  getCodes(mode){
    const refContent = this.refs.table.refs.command.refs.content
    const datas = refContent.currentDatas[0].children2
    console.log(datas)

    const codes = mode == 'play' ? [
      ['const browser = await puppeteer.launch()',''],
      ['let page = await browser.newPage({active: false})',''],
      ['let dialogPromise','']
    ] :
      ['const browser = await puppeteer.launch({headless: false})',
        'let page = await browser.newPage()',
        'let dialogPromise',
        ''
      ]

    const events = new Set(['wait'])

    for(let op of datas){
      const pageOrFrame = op.frame && op.frame > 0 ? `(await page.frames()).find(f=>f.url()=='${helper.stringEscape(op.url)}')` : 'page'

      let str = ""
      if(op.name == 'mousedown'){
        str = `await mouseDown(${pageOrFrame}, '${helper.stringEscape(op.optSelector)}')`
        events.add('mouseDown')
      }
      else if(op.name == 'mouseup'){
        str = `await mouseUp(${pageOrFrame}, '${helper.stringEscape(op.optSelector)}')`
        events.add('mouseUp')
      }
      else if(op.name == 'click'){
        str = `await click(${pageOrFrame}, '${helper.stringEscape(op.optSelector)}')`
        events.add('click')
      }
      else if(op.name == 'dblclick'){
        str = `await dblclick(${pageOrFrame}, '${helper.stringEscape(op.optSelector)}', {clickCount: 2})`
        events.add('dblclick')
      }
      else if(op.name == 'keydown'){
        if(isSpecialKey(op) || !isInputable(op)){
          if(op.ctrlKey){
            if(op.keyChar == 'A'){
              str = 'await selectAll(page)'
              events.add('selectAll')
            }
            else if(op.keyChar == 'X'){
              str = 'await cut(page)'
              events.add('cut')
            }
            else if(op.keyChar == 'C'){
              str = 'await copy(page)'
              events.add('copy')
            }
            else if(op.keyChar == 'V'){
              str = 'await paste(page)'
              events.add('paste')
            }
          }
          else{
            str = `await press(${pageOrFrame}, '${helper.stringEscape(op.optSelector)}', '${helper.stringEscape(op.keyChar)}')`
            events.add('press')
          }
        }
        else{
          str = `await clearAndType(${pageOrFrame}, '${helper.stringEscape(op.optSelector)}', '${helper.stringEscape(op.value)}')`
          events.add('clearAndType')
        }
      }
      else if(op.name == 'input' || op.name == 'change'){
        if(op.tag == 'select'){
          const value = JSON.parse(op.value).map(x=>`'${helper.stringEscape(x.value)}'`).join(', ')
          str = `await select(${pageOrFrame}, '${helper.stringEscape(op.optSelector)}', ${value})`
          events.add('select')
        }
        else if(op.checked === void 0){
          str = `await input(${pageOrFrame}, '${helper.stringEscape(op.optSelector)}', '${helper.stringEscape(op.value)}')`
          events.add('input')
        }
        else{
          str = `await check(${pageOrFrame}, '${helper.stringEscape(op.optSelector)}', ${helper.stringEscape(op.checked)})`
          events.add('check')
        }
      }
      // else if(op.name == 'select'){
      // }
      else if(op.name == 'submit'){
        str = `await submit(${pageOrFrame}, '${helper.stringEscape(op.optSelector)}')`
        events.add('submit')
      }
      else if(op.name == 'scroll'){
        str = `await scroll(${pageOrFrame}, '${helper.stringEscape(op.optSelector)}', ${op.value})`
        events.add('scroll')
      }
      else if(op.name == 'mousemove'){
        str = `await hover(${pageOrFrame}, '${helper.stringEscape(op.optSelector)}')`
        events.add('hover')
      }
      else if(op.name == 'focusin'){
        str = `await focus(${pageOrFrame}, '${helper.stringEscape(op.optSelector)}')`
        events.add('focus')
      }
      else if(op.name == 'focusout'){
        str = `await blur(${pageOrFrame}, '${helper.stringEscape(op.optSelector)}')`
        events.add('blur')
      }
      else if(op.name == 'cut'){
        str = 'await cut(page)'
        events.add('cut')
      }
      else if(op.name == 'copy'){
        str = 'await copy(page)'
        events.add('copy')
      }
      else if(op.name == 'paste'){
        str = 'await paste(page)'
        events.add('paste')
      }
      else if(op.name == 'back'){
        str = 'await page.goBack()'
      }
      else if(op.name == 'forward'){
        str = 'await page.goForward()'
      }
      // else if(op.name == 'goIndex'){
      //   str = `await page.goIndex('${helper.stringEscape(op.optSelector)}')`
      // }
      else if(op.name == 'navigate'){
        str = `await page.goto('${helper.stringEscape(op.value == TOP_URL ? 'chrome://newtab/' : op.value)}')`
      }
      else if(op.name == 'tabCreate'){
        str = `await newPage(browser, '${helper.stringEscape(op.value)}')`
        events.add('newPage')
      }
      else if(op.name == 'tabRemoved'){
        str = 'await page.close()'
      }
      else if(op.name == 'tabSelected'){
        const match = op.value == TOP_URL ? new RegExp(`^(${escapeRegExp(op.value)}|${escapeRegExp(CHROME_TOP_URL)})$`)
          : `'${helper.stringEscape(op.value)}'`
        str = `page = await selectPage(browser, ${match})`
        events.add('selectPage')
        if(mode == 'play' && codes[codes.length - 1][0].includes('await newPage')){
          codes[codes.length - 1][0] = codes[codes.length - 1][0].replace(/\)$/,', true)')
        }
        else if(mode == 'export' && codes[codes.length - 1].includes('await newPage')){
          codes[codes.length - 1] = codes[codes.length - 1].replace(/\)$/,', true)')
        }
      }
      else if(op.name == 'tabLoaded'){
        str = 'await page.waitForNavigation()'
        if(mode == 'play'){
          if(codes.length > 1 && codes[codes.length - 1][0].includes('await selectPage') &&
            codes[codes.length - 2][0].includes('await newPage')) continue

          if(codes[codes.length - 1][0].match(/await (newPage|selectPage)/)){
            codes[codes.length - 1][0] = codes[codes.length - 1][0].replace(/\)$/,', true)')
          }
          else{
            codes[codes.length - 1][0] = codes[codes.length - 1][0].replace('await ','')
          }
        }
        else if(mode == 'export'){
          if(codes.length > 1 && codes[codes.length - 1].includes('await selectPage') &&
            codes[codes.length - 2].includes('await newPage')) continue

          if(codes[codes.length - 1].match(/await (newPage|selectPage)/)){
            codes[codes.length - 1] = codes[codes.length - 1].replace(/\)$/,', true)')
          }
          else{
            codes[codes.length - 1] = codes[codes.length - 1].replace('await ','')
          }
        }
      }
      else if(op.name == 'dialog'){
        str = `await dialogPromise`
        const listen = `dialogPromise = dialog(page, ${op.value == 'ok' ? 'true' : 'false'})`
        events.add('dialog')
        if(mode == 'play'){
          codes.push([listen,''], codes.pop())
        }
        else if(mode == 'export'){
          codes.push(listen, codes.pop())
        }
      }
      const updateExecuting = `for(let e of document.querySelectorAll('[data-id]')){
        e.style.backgroundColor = e.dataset.id == '/root/${op.key}' ? '#ffffe6' : null
      }`
      if(mode == 'play'){
        codes.push([str,updateExecuting])
      }
      else if(mode == 'export'){
        codes.push(str)
      }
    }

    const funcs = []
    for(let event of events){
      const func = util[event].toString()
      if(func.startsWith('async')){
        funcs.push(func.replace('async','async function'))
      }
      else{
        funcs.push(`function ${func}`)
      }
    }

    console.log(funcs.join("\n"))
    console.log(codes.join("\n"))
    return {funcs,codes}
  }

  evaluate(code){
    eval(code)
  }

  handlePlay(){
    const refContent = this.refs.table.refs.command.refs.content
    this.state.pause = false
    this.setState({playing: !this.state.playing})

    const {funcs,codes} = this.getCodes('play')

    eval(`${funcs.join("\n")}
    ;(async () => {
      ${codes.map((x,i)=> `this.updateLog(\`${x[0]}\`);
      if(!this.state.playing){
        for(let e of document.querySelectorAll('[data-id]')){
          e.style.backgroundColor = null
        }
        return
      }
      else if(this.state.pause){
        while(true){
          await wait(100)
          if(!this.state.pause) break
        }
      }
      ${x[1]}
      refContent.setState({})
      ${x[0]}
      ${codes[i+1] && codes[i+1][0].includes("page.waitForNavigation") ? "" : `await wait(${this.state.autoPlaySpeed * 20} + 200)` }
      `).join("\n")}
      await browser.close()
      for(let e of document.querySelectorAll('[data-id]')){
        e.style.backgroundColor = null
      }
      this.setState({playing: false})
    })()`)
  }

  handlePause(){
    this.setState({pause: !this.state.pause})
  }

  handleExport(){
    this.setState({dialog: true})
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
    ipc.send('update-automation-order',this.state.menuItems,this.state.selectedMenu)
  }

  getItemInfo() {
    chrome.runtime.sendMessage({event: 'get-op', menuKey: this.state.selectedMenu})
  }

  addItem(){
    const key = uuid.v4()
    this.state.menuItems.push({key,name:`New Operations ${('0'+(this.state.menuItems.length+1)).slice(-2)}`})
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
    if(!this.state.menuItems.length){
      this.addItem()
    }
    else{
      this.updateAutomationOrder()
    }
  }

  selectItem(key){
    this.state.selectedMenu = key
    this.setState({})
    this.getItemInfo()
    this.updateAutomationOrder()
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

  handleChangePlaySpeed(e){
    if(isNaN(e.target.value)) return
    const key = 'autoPlaySpeed'
    const val = parseInt(e.target.value)
    ipc.send('save-state',{tableName:'state',key,val})
    this.state[key] = val
    this.setState({})
  }

  render(){
    return <div className="main">
      <nav className="navbar navbar-light bg-faded">
        <form className="form-inline">
          <button onClick={_=>this.handleRecord()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
            <i className="fa fa-video-camera" aria-hidden="true"></i>Record{this.state.isRecording ? ' Stop' : ''}
          </button>
          <button onClick={_=>this.handlePlay()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
            <i className={this.state.playing ? "fa fa-stop-circle-o" : "fa fa-play-circle-o"} aria-hidden="true"></i>{this.state.playing ? 'Stop' : 'Play'}
          </button>
          <button onClick={_=>this.handlePause()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
            <i className={this.state.pause ? "fa fa-play-circle" : "fa fa-pause-circle-o"} aria-hidden="true"></i>{this.state.pause ? 'Resume' : 'Pause'}
          </button>
          {/*<button onClick={_=>this.handleStart()} className="btn btn-sm align-middle btn-outline-secondary" type="button">*/}
            {/*<i className="fa fa-fighter-jet" aria-hidden="true"></i>Play All*/}
          {/*</button>*/}
          <button onClick={_=>this.handleExport()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
            <i className="fa fa-external-link-square" aria-hidden="true"></i>Export/Playground
          </button>
          <Popup
            trigger={<button  className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="fa fa-cog" aria-hidden="true"></i>Settings
            </button>}
            flowing
            on='click'
          >
            <h5>Playback Speed</h5>

            <label style={{verticalAlign: 'super',paddingRight: 5}} className="right-pad">Fast</label>
            <div className="ui input">
              <input style={{width:250}} type="range" min="0" max="100" name="playSpeed" step="1" value={this.state.autoPlaySpeed} onInput={::this.handleChangePlaySpeed}/>
            </div>
            <label style={{verticalAlign: 'super',paddingLeft: 5}}>Slow</label>
            <div className='spacer4'/>

            <h5>Inspect</h5>
            <div className='spacer4'/>
            <div className="field">
              <Checkbox defaultChecked={this.state.autoHighlight} toggle onChange={this.onChange.bind(this,'autoHighlight')}/>
              <span className="toggle-label">Highlight Elements</span>
            </div>
            <div className='spacer2'/>

            <h5>Events Recorded</h5>
            <div className='spacer2'/>
            <Grid>
              <Grid.Row>
                <Grid.Column width={8}>
                  <div className="field">
                    <Checkbox defaultChecked={this.state.autoMousedown} toggle onChange={this.onChange.bind(this,'autoMousedown')}/>
                    <span className="toggle-label">Mousedown</span>
                  </div>
                  <div className="field">
                    <Checkbox defaultChecked={this.state.autoMouseup} toggle onChange={this.onChange.bind(this,'autoMouseup')}/>
                    <span className="toggle-label">Mouseup</span>
                  </div>
                  <div className="field">
                    <Checkbox defaultChecked={this.state.autoClick} toggle onChange={this.onChange.bind(this,'autoClick')}/>
                    <span className="toggle-label">Click</span>
                  </div>
                  <div className="field">
                    <Checkbox defaultChecked={this.state.autoDblclick} toggle onChange={this.onChange.bind(this,'autoDblclick')}/>
                    <span className="toggle-label">Dblclick</span>
                  </div>
                  <div className="field">
                    <Checkbox defaultChecked={this.state.autoKeydown} toggle onChange={this.onChange.bind(this,'autoKeydown')}/>
                    <span className="toggle-label">Keydown</span>
                  </div>
                  <div className="field">
                    <Checkbox defaultChecked={this.state.autoInput} toggle onChange={this.onChange.bind(this,'autoInput')}/>
                    <span className="toggle-label">Input</span>
                  </div>
                  <div className="field">
                    <Checkbox defaultChecked={this.state.autoChange} toggle onChange={this.onChange.bind(this,'autoChange')}/>
                    <span className="toggle-label">Change</span>
                  </div>
                  <div className="field">
                    <Checkbox defaultChecked={this.state.autoSelect} toggle onChange={this.onChange.bind(this,'autoSelect')}/>
                    <span className="toggle-label">Select</span>
                  </div>
                  <div className="field">
                    <Checkbox defaultChecked={this.state.autoSubmit} toggle onChange={this.onChange.bind(this,'autoSubmit')}/>
                    <span className="toggle-label">Submit</span>
                  </div>
                  <div className="field">
                    <Checkbox defaultChecked={this.state.autoScroll} toggle onChange={this.onChange.bind(this,'autoScroll')}/>
                    <span className="toggle-label">Scroll</span>
                  </div>
                  <div className="field">
                    <Checkbox defaultChecked={this.state.autoMousemove} toggle onChange={this.onChange.bind(this,'autoMousemove')}/>
                    <span className="toggle-label">Mousemove</span>
                  </div>
                </Grid.Column>
                <Grid.Column width={8}>
                  <div className="field">
                    <Checkbox defaultChecked={this.state.autoFocusin} toggle onChange={this.onChange.bind(this,'autoFocusin')}/>
                    <span className="toggle-label">Focusin</span>
                  </div>
                  <div className="field">
                    <Checkbox defaultChecked={this.state.autoFocusout} toggle onChange={this.onChange.bind(this,'autoFocusout')}/>
                    <span className="toggle-label">Focusout</span>
                  </div>
                  <div className="field">
                    <Checkbox defaultChecked={this.state.autoCut} toggle onChange={this.onChange.bind(this,'autoCut')}/>
                    <span className="toggle-label">Cut</span>
                  </div>
                  <div className="field">
                    <Checkbox defaultChecked={this.state.autoCopy} toggle onChange={this.onChange.bind(this,'autoCopy')}/>
                    <span className="toggle-label">Copy</span>
                  </div>
                  <div className="field">
                    <Checkbox defaultChecked={this.state.autoPaste} toggle onChange={this.onChange.bind(this,'autoPaste')}/>
                    <span className="toggle-label">Paste</span>
                  </div>
                  <div className="field">
                    <Checkbox defaultChecked={this.state.autoBack} toggle onChange={this.onChange.bind(this,'autoBack')}/>
                    <span className="toggle-label">Back</span>
                  </div>
                  <div className="field">
                    <Checkbox defaultChecked={this.state.autoForward} toggle onChange={this.onChange.bind(this,'autoForward')}/>
                    <span className="toggle-label">Forward</span>
                  </div>
                  {/*<div className="field">*/}
                    {/*<Checkbox defaultChecked={this.state.autoGoIndex} toggle onChange={this.onChange.bind(this,'autoGoIndex')}/>*/}
                    {/*<span className="toggle-label">GoIndex</span>*/}
                  {/*</div>*/}
                  <div className="field">
                    <Checkbox defaultChecked={this.state.autoNavigate} toggle onChange={this.onChange.bind(this,'autoNavigate')}/>
                    <span className="toggle-label">Navigate</span>
                  </div>
                  <div className="field">
                    <Checkbox defaultChecked={this.state.autoTabCreate} toggle onChange={this.onChange.bind(this,'autoTabCreate')}/>
                    <span className="toggle-label">TabCreate</span>
                  </div>
                  <div className="field">
                    <Checkbox defaultChecked={this.state.autoTabRemoved} toggle onChange={this.onChange.bind(this,'autoTabRemoved')}/>
                    <span className="toggle-label">TabRemoved</span>
                  </div>
                  <div className="field">
                    <Checkbox defaultChecked={this.state.autoTabSelected} toggle onChange={this.onChange.bind(this,'autoTabSelected')}/>
                    <span className="toggle-label">TabSelected</span>
                  </div>
                </Grid.Column>
              </Grid.Row>
            </Grid>

            <h5>Hover Behavior</h5>
            <label style={{verticalAlign: 'baseline'}} className="right-pad">Wait time until Hover (Mousemove) is recorded</label>
            <div className="ui input">
              <input type="text" style={{width: 70, padding: '.3em 1em'}} value={this.state.autoMousemoveTime} onChange={this.onChangeText.bind(this,'autoMousemoveTime')}/>
            </div>
            <label style={{verticalAlign: 'baseline'}}>sec</label>
          </Popup>
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
          <div className="ReactTable" style={{height: '100%'}}>
            <div className="rt-table">
              <div className="rt-thead -header" style={{width: '100vw',top: 0,backgroundColor: '#f9fafb',position:'sticky',flex: 'none'}}>
                <div className="rt-tr">
                  <div className="rt-resizable-header -cursor-pointer rt-th"
                       style={{textAlign: 'initial', marginLeft: 5}}>
                    <div>Log</div>
                  </div>
                </div>
              </div>
              <TextArea ref="textArea" style={{height: '100%', outline: 'none', resize: 'none', border: 'none'}} value={this.state.log}/>
            </div>
          </div>
        </div>
      </SplitPane>
      {this.state.dialog ? <AutomationExportDialog fname={this.state.menuItems.find(x=>x.key == this.state.selectedMenu).name.replace(/ /g,'_').toLowerCase() + '.js'} code={this.getCodes('export')} onClose={_=>this.setState({dialog:false})} eval={::this.evaluate}/> : null}
    </div>
  }
}

ipc.send("get-main-state",key,['autoMousedown','autoMouseup','autoClick','autoDblclick','autoKeydown','autoInput','autoChange','autoSelect','autoSubmit','autoScroll','autoMousemove','autoFocusin','autoFocusout','autoCut','autoCopy','autoPaste','autoBack','autoForward','autoGoIndex','autoNavigate','autoTabCreate','autoTabRemoved','autoTabSelected','autoMousemoveTime','autoHighlight','autoPlaySpeed'])
ipc.once(`get-main-state-reply_${key}`,async (e,data)=>{
  defaultData = data
  await initPromise
  await initDataWaitPromise
  ReactDOM.render(<Automation />,  document.getElementById('app'))
})