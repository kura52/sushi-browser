import ToolbarResizer from "./ToolbarResizer";

const path = require('path')
const React = require('react')
const uuid = require("node-uuid")
import ReactDOM from 'react-dom'
import {Checkbox} from "semantic-ui-react";
const {Component} = React
const ipc = require('electron').ipcRenderer
const PubSub = require('./pubsub');
const sharedState = require('./sharedState')
const {remote} = require('electron')
const mainState = remote.require('./mainState')

const options = {case:false,or:false,reg:false}


function stringEscape(string){
  return ('' + string).replace(/['\\\n\r\u2028\u2029]/g, function (character) {
    // Escape all characters not included in SingleStringCharacters and
    // DoubleStringCharacters on
    // http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.4
    switch (character) {
      case "'":
      case '\\':
        return '\\' + character
      // Four possible LineTerminator characters need to be escaped:
      case '\n':
        return '\\n'
      case '\r':
        return '\\r'
      case '\u2028':
        return '\\u2028'
      case '\u2029':
        return '\\u2029'
    }
  })
}

function multiByteSliceReverse(str,end) {
  let len = 0
  str = escape(str);
  const strLen = str.length
  let i
  for (i=0;i<strLen;i++,len++) {
    if(len >= end) break
    if (str.charAt(i) == "%") {
      if (str.charAt(++i) == "u") {
        i += 3;
        len++;
      }
      i++;
    }
  }
  return [unescape(str.slice(0,i)),len];
}

function multiByteSlice(str,end, elip) {
  let len = 0
  str = escape(str);
  const strLen = str.length
  let i
  for (i=0;i<strLen;i++,len++) {
    if(len >= end) break
    if (str.charAt(i) == "%") {
      if (str.charAt(++i) == "u") {
        i += 3;
        len++;
      }
      i++;
    }
  }
  if(elip) return `${unescape(str.slice(0,i))}${i == str.length ? "" :"..."}`
  return unescape(str.slice(0,i))
}

function stringReverse(s) {
  var rv = "";
  for (var i = 0, n = s.length; i < n; i++) {
    rv = rv + s[n - i - 1];
  }
  return rv;
}


export default class FindPanel extends Component {
  constructor(props) {
    super(props)
    this.state  = {searchResult: []}
    this.tabMap = {}
    this.setHeight = ::this.setHeight
  }


  componentDidMount() {
    console.log("FindPanel")
    this.refs.input.focus()

    this.tokenChangeTabs = PubSub.subscribe('change-tabs',()=>{

    })

    this.tokenChangeSelected = PubSub.subscribe('change-selected',()=>this.setState({}))
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.tokenChangeTabs)
    PubSub.unsubscribe(this.tokenChangeSelected)
  }


  setHeight(height, mouseUp){
    this.props.parent.setState({findPanelHeight: height})
    if(mouseUp) mainState.set('findPanelHeight',height)
  }

  search(query, next){
    let operation
    if(next){
      operation =  `window.__complex_search_define__.itel_main2('${this.state.reg ? '@RE:' : ''}${stringEscape(query)}',true,${!!this.state.case},${!this.state.or})`
    }
    else{
      operation =  `window.__complex_search_define__.scrollFocusPrev('itel-highlight', 'itel-selected')`
    }
    const key = uuid.v4()
    clearTimeout(this.timer)
    this.timer = setTimeout(_=>{

      const arr = [], allWvIds= []
      this.props.parent.allKeys(void 0,arr)
      let i = 1
      for(let key of arr){
        const tabPanel = this.props.parent.refs2[key]
        const tabs = tabPanel.state.tabs
        let j = 1
        for(let tab of tabs){
          allWvIds.push(tab.wvId)
          this.tabMap[tab.wvId] = [`${i}-${j}`, tab.page.title, tab.key, tabPanel]
          j++
        }
        i++
      }
      ipc.send('start-find-all',key,allWvIds,operation,!next) //@TODO
      ipc.once(`start-find-all-reply_${key}`, (e,result)=>{
        console.log(54353,result)
        this.setState({searchResult: result})
      })
    },300)
  }

  onKeyDown(e) {
    if (e.keyCode == 13) {
      this.query = e.target.value
      this.search(e.target.value, !e.shiftKey)
    }
  }

  onClickNext(e){
    this.search(this.refs.input.value, true)
  }


  onClickPrev(e){
    this.search(this.refs.input.value, true,false)
  }

  changeCheck(e,name,data){
    const val = data.checked
    this.state[name] = val
    for(let name of ['case','or','reg']){
      options[name] = this.state[name]
    }
    this.setState({})
  }

  buildTextNode(prefix,text,suffix){
    const maxLen = Math.round((window.innerWidth - 260) / 6.8)
    const len = maxLen - text.length
    const halfLen = len / 2
    const data = multiByteSliceReverse(stringReverse(prefix), halfLen)
    prefix = stringReverse(data[0])
    const restLen = len - data[1]
    suffix = multiByteSlice(suffix, restLen)
    return <td className="search-all-text">{prefix}<strong style={{backgroundColor: 'yellow'}}>{text}</strong>{suffix}...</td>
  }

  handleMouseDown(no,tabId,tabKey,tabPanel){
    const operation =  `window.__complex_search_define__.itel_main('${this.state.reg ? '@RE:' : ''}${stringEscape(this.query)}',true,${!!this.state.case},${!this.state.or})
      window.__complex_search_define__.scrollFocusNo(${no}, 'itel-highlight', 'itel-selected')`

    ipc.send('start-find-all',tabKey,[tabId],operation,true) //@TODO
    ipc.once(`start-find-all-reply_${tabKey}`, (e,result)=>{
      tabPanel.setState({selectedTab: tabKey})
      this.setState({selected: no})
    })
  }

  renderTr(){
    this.datas = {}
    const tr = []
    for(let [tabId, result, key] of this.state.searchResult){
      if(!result) continue
      let i = 1
      for(let row of result[1]){
        const [no,prefix,text,suffix] = row
        const [seq,title,tabKey,tabPanel] = this.tabMap[tabId]
        this.datas[no] = [tabId,tabKey,tabPanel]
        const textNode = this.buildTextNode(prefix,text,suffix)
        const isSelected = tabPanel.state.selectedTab == tabKey
        tr.push(<tr key={no} className={`${this.state.selected == no ? 'tr-selected' : 'tr-normal'} ${isSelected ? 'tr-selected-tab' : ''}`}
                    onMouseDown={e=>this.handleMouseDown(no,tabId,tabKey,tabPanel)}>
          <td className="search-all-seq">{seq}-{i++}</td>
          <td className="search-all-title">{multiByteSlice(title,26,true)}</td>
          {textNode}
        </tr>)
      }
    }
    return tr
  }

  renderFindPanel(){
    return <div className="find-panel"
                style={{height: this.props.findPanelHeight - 1, background: '#f3f3f3', overflowY: 'auto'}}
                onKeyDown={e=>{
                  if(e.keyCode === 38 ) {//up
                    let no = this.state.selected - 1
                    if(!this.datas[no]) no = this.state.selected
                    this.handleMouseDown(no, this.datas[no])
                    e.stopPropagation()
                    e.preventDefault()
                  }
                  else if(e.keyCode === 40 ) {//down
                    let no = this.state.selected + 1
                    if(!this.datas[no]) no = this.state.selected
                    this.handleMouseDown(no, this.datas[no])
                    e.stopPropagation()
                    e.preventDefault()
                  }
                }}>
      <div className="visible browser-page-search" style={{
        width: 'fit-content',
        position: 'sticky',
        zIndex: 2,
        top: 0,
        right: 0,
        marginRight: 0,
        marginLeft: 'auto'}}>
        <input style={{borderRadius: 'unset', borderTop: 0, width: 350}} className="search-text" ref="input" type="text" placeholder="Search..." onKeyDown={::this.onKeyDown}/>
        <a className="search-button" href="javascript:void(0)"><i className="search-next fa fa-angle-up" style={{fontSize: "1.5em",lineHeight: "1.2",height:"30px"}} onClick={::this.onClickPrev}></i></a>
        <a className="search-button" href="javascript:void(0)"><i className="search-prev fa fa-angle-down" style={{fontSize: "1.5em",lineHeight: "1.3",height:"30px"}} onClick={::this.onClickNext}></i></a>
        <span className="search-num">{'1/1'}</span>
        <Checkbox style={{paddingLeft: 4, borderLeft: '1px solid #aaa'}} label="Match Case" checked={this.state.case} onChange={(e,data)=>this.changeCheck(e,'case',data)}/>
        <Checkbox label="OR" checked={this.state.or} onChange={(e,data)=>this.changeCheck(e,'or',data)}/>
        <Checkbox label="RegExp" checked={this.state.reg} onChange={(e,data)=>this.changeCheck(e,'reg',data)}/>
        <a className="search-button" href="javascript:void(0)">
          <div className="search-close" style={{lineHeight: "1.5",height:"30px",borderRadius: 'unset',borderRight: 0}} onClick={e=>this.props.parent.setState({findPanelHeight: void 0})}>☓</div>
        </a>
      </div>
      <table className="ui celled compact table" style={{marginTop: -31}}>
        <thead>
        <tr>
          <th>No</th>
          <th>Title</th>
          <th>Search Results</th>
        </tr>
        </thead>
        <tbody className="search-all-tbody">
        {this.renderTr()}
        </tbody>
      </table>
    </div>
  }

  render() {
    return <span style={{width: '100%'}}>
      <ToolbarResizer height={this.props.findPanelHeight} setHeight={this.setHeight} minus={true}
                      style={{position: 'relative', height: 5, margin: '-2px 0' ,backgroundColor: '#a2a2a2', backgroundClip: 'padding-box',
                        borderTop: '2px solid rgba(255, 255, 255, 0)', borderBottom: '2px solid rgba(255, 255, 255, 0)' }}/>
      {this.renderFindPanel()}
    </span>
  }
}