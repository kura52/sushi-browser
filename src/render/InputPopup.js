const React = require('react')
const ReactDOM = require('react-dom');
const {Component} = React
const ipc = require('electron').ipcRenderer
import { Search } from 'semantic-ui-react';
const uuid = require('node-uuid')
const sharedState = require('./sharedState')
const NavbarMenu = require('./NavbarMenu')
const {remote} = require('electron')
const mainState = remote.require('./mainState')

function isString(obj) {
  return typeof obj === 'string' || obj instanceof String;
}

export default class InputPopup extends Component {
  constructor(props) {
    super(props)
    this.state = {value: '', results: []}
    this.updateResult = ::this.updateResult
    this.handleClose = ::this.handleClose

  }

  componentDidMount() {
  }

  componentWillUnmount() {
    if(!this.decideResult){
      this.resumeValue()
    }
  }


  // resetComponent(noBlur){
  //   if(!noBlur && this.input) this.input.blur()
  //   this.prevValue = void 0
  //   document.removeEventListener('mousedown',this.outerClick,{once:true})
  //   this.setState({ results: []})
  // }

  handleClose(){
    this.setState({value: '', results: []})
    this.refs.navMenu.menuClose()
    this.input = void 0
  }

  updateValue(selector,optSelector,val){
    if(isString(val))val = val.replace(/\r?\n/g,"\\n").replace(/'/,"\\'")
    this.props.tab.wv.executeScriptInTab('dckpbojndfoinamcdamhkjhnjnmjkfjd',
      `(function(){
        if(!window.__form_value___){
          window.__form_value___ = {}
        }
        const ele = document.querySelector('${selector}') || document.querySelector('${optSelector}')
        const tag = ele.tagName && ele.tagName.toLowerCase()
        const type = ele.type && ele.type.toLowerCase()
        if(window.__form_value___['${selector}'] === void 0){
          let val = ele.value
          if (tag == 'input' && (type == 'checkbox' || type == 'radio')) val = ele.checked
          else if(tag == 'select') val = ele.selectedOptions
          else if(tag != 'input' && tag != 'textarea') val = ele.innerText
          window.__form_value___['${selector}'] = val
        }
        if (tag == 'input' && (type == 'checkbox' || type == 'radio')) ele.checked = '${val}' == 'true'
        else if(tag == 'select'){
          const set = new Set(JSON.parse('${val}').map(x=>x.index))
          for(let i=0;i<ele.length;i++){
            ele[i].selected = set.has(i)
          }
        }
        else if(tag != 'input' && tag != 'textarea') ele.innerText = '${val}'
        else{
          ele.value = '${val}'
        }
      }())`,{},()=>{})
  }

  resumeValue(){
    this.props.tab.wv.executeScriptInTab('dckpbojndfoinamcdamhkjhnjnmjkfjd',
      `(function(){
        if(window.__form_value___  !== void 0){
          for(let [selector, val] of Object.entries(window.__form_value___)){
            const ele = document.querySelector(selector) 
            const tag = ele.tagName && ele.tagName.toLowerCase()
            const type = ele.type && ele.type.toLowerCase()
            if (tag == 'input' && (type == 'checkbox' || type == 'radio')) ele.checked = val
            else if(tag == 'select'){
              const set = new Set([...val].map(x=>x.index))
              for(let i=0;i<ele.length;i++){
                ele[i].selected = set.has(i)
              }
            }
            else if(tag != 'input' && tag != 'textarea') ele.innerText = val
            else{
              ele.value = val
            }  
          }
          window.__form_value___ = void 0
        }
      }())`,{},()=>{})
  }

  findItems(title){
    for(let history of this.props.inHistory){
      for(let item of history.value){
        if(item.value == title && (item.optSelector == this.props.optSelector || item.selector == this.props.selector)){
          return history
        }
      }
    }
  }

  handleResultSelect(e, result) {
    console.log(result)

    if(this.check.checked){
      const items = this.findItems(result.result.title)
      for(let item of items.value){
        this.updateValue(item.selector,item.optSelector,item.value)
      }
    }
    else{
      this.updateValue(this.props.selector,this.props.optSelector,result.result.title)
    }

    this.decideResult = true
    this.handleClose()
    this.props.focus_webview(this.props.tab)
  }

  handleSearchChange(e, value){
    this.state.value = value.value
    this.updateResult()
  }

  handleSelectionChange(e,value){
    e.target.value = value.result.title

    if(this.check.checked){
      const items = this.findItems(value.result.title)
      for(let item of items.value){
        this.updateValue(item.selector,item.optSelector,item.value)
      }
    }
    else{
      this.updateValue(this.props.selector,this.props.optSelector,value.result.title)
    }

  }

  onMouseDown(e){
    this.mouseDown = e.target
    this.button = e.button
    this.mouseDownPos = e.target.clientWidth - e.offsetX
  }

  onMouseUp(e){
    if(e.button == 2 || !this.mouseDown || this.button !== e.button) return
    this.mouseDown = void 0
    this.button = void 0
    if(e.button == 0 && this.mouseDownPos > 0){
      e.target.click()
    }
    this.mouseDownPos = void 0
  }


  onKeyDown (e) {
    console.log("keydown",e)
    if (e.keyCode == 13) {
      const select = ReactDOM.findDOMNode(this.refs.input).querySelector("div.results.transition > div.active.result > div > div.title")
      if(select){
        const title = select.innerHTML.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        select.click()
        return
      }
    }
  }

  async updateResult(isHandleClick){
    const searchValues = this.state.value.split(/ +/)

    const inHistory = this.props.inHistory
    if(!inHistory.sorted){
      inHistory.sort((a,b)=> b.now - a.now)
      inHistory.sorted = true
    }
    const results = []
    const set = new Set()
    for(let history of inHistory){
      if(isString(history.value)) history.value = JSON.parse(history.value)
      for(let item of history.value){
        if(!set.has(item.value) && (item.optSelector == this.props.optSelector || item.selector == this.props.selector) &&
          searchValues.every(val=> item.value.includes(val))){
          results.push({title: item.value})
          set.add(item.value)
          break
        }
      }
    }
    this.setState({results})

    if(isHandleClick){
      if(!this.input){
        for(let i=0;i<100;i++){
          await new Promise(r=>setTimeout(r,10))
          const ref = ReactDOM.findDOMNode(this.refs.input)
          if(ref){
            this.input = ref.querySelector("input")
            break
          }
        }
      }
      this.input.focus()

      const check = document.createElement('input')
      check.type = 'checkbox'
      check.className = 'input-popup-check'
      check.checked = mainState.inputHistoryAll
      check.style.marginLeft = '3px'
      check.addEventListener('mousedown',e=>{
        mainState.set('inputHistoryAll',!e.target.checked)
        e.stopPropagation()
        e.preventDefault()
      })

      const span = document.createElement('span')
      span.style.padding = '0 3px 0 3px'
      span.innerHTML = 'All Form'

      this.input.parentNode.appendChild(check)
      this.input.parentNode.appendChild(span)
      this.check = check
    }

  }

  render() {
    console.log(this.props)

    return <span className='input-popup-wrapper' style={{left: this.props.left, top: this.props.top}}>
        <NavbarMenu ref="navMenu" className="input-popup" icon="chevron-circle-down" onClick={_=>this.updateResult(true)} rightDisplay={true}>
          <Search
            icon={null}
            showNoResults={false}
            loading={false}
            onResultSelect={::this.handleResultSelect}
            onSearchChange={::this.handleSearchChange}
            onSelectionChange={::this.handleSelectionChange}
            onMouseDown={::this.onMouseDown}
            onMouseUp={::this.onMouseUp}
            results={this.state.results}
            value={this.state.value}
            ref="input"
            minCharacters={0}
            // onFocus={::this.onFocus}
            // onBlur={::this.onBlur}
            onKeyDown={::this.onKeyDown}
            size="mini"
            // onContextMenu={this.props.onContextMenu}
          />
        </NavbarMenu>
      </span>
  }
}
