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

const options = {case:false,or:false,reg:false,onlyActive:false}


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
    this.prevState = {}
    this.tabMap = {}
    this.setHeight = ::this.setHeight
    this.handleKeyDown = ::this.handleKeyDown
  }


  componentDidMount() {
    console.log("FindPanel")
    this.refs.input.focus()

    this.tokenChangeTabs = PubSub.subscribe('change-tabs',()=>{

    })

    this.tokenChangeSelected = PubSub.subscribe('change-selected',()=>this.setState({}))

    document.addEventListener('keydown',this.handleKeyDown)
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.tokenChangeTabs)
    PubSub.unsubscribe(this.tokenChangeSelected)

    document.removeEventListener('keydown',this.handleKeyDown)
  }

  scrollIntoViewIfNeeded(){
    const tr = document.querySelector('.find-panel .tr-selected')
    const panel = document.querySelector('.find-panel')

    const trRect = tr.getBoundingClientRect()
    const panelRect = panel.getBoundingClientRect()

    if(trRect.y + trRect.height - 31 <= window.innerHeight - panelRect.height){
      panel.scrollTo(0,trRect.y - panelRect.y + panel.scrollTop - 31)
    }
    else if(trRect.y + trRect.height > window.innerHeight){
      panel.scrollTo(0,trRect.y - panelRect.y + panel.scrollTop - panelRect.height + trRect.height)
    }
  }

  onPrev(){
    let dataKey
    Object.entries(this.datas).forEach(([_dataKey,data])=>{
      if(_dataKey == this.state.selected) return
      dataKey = _dataKey
    })

    if(!this.datas[dataKey]) dataKey = this.max
    this.handleMouseDown(dataKey, ...this.datas[dataKey],this.scrollIntoViewIfNeeded)
  }

  onNext(){
    let dataKey, min,next
    Object.entries(this.datas).forEach(([_dataKey,data],i)=>{
      if(i == 0) min = _dataKey
      if(next){
        dataKey = _dataKey
        return
      }
      else if(_dataKey == this.state.selected){
        next = true
      }
    })

    if(!this.datas[dataKey]) dataKey = min
    this.handleMouseDown(dataKey, ...this.datas[dataKey],this.scrollIntoViewIfNeeded)
  }

  handleKeyDown(e){
    if((e.keyCode !== 38 && e.keyCode !== 40) || document.activeElement !== document.body) return
    if(e.keyCode === 38 ) {//up
      this.onPrev()
      e.stopPropagation()
      e.preventDefault()
    }
    else if(e.keyCode === 40 ) {//down
      this.onNext()
      e.stopPropagation()
      e.preventDefault()
    }
  }

  setHeight(height, mouseUp){
    this.props.parent.setState({findPanelHeight: height})
    if(mouseUp) mainState.set('findPanelHeight',height)
  }

  focusSelectedPanelRow(){
    let find
    for(let [dataKey,data] of Object.entries(this.datas)){
      if(data[1] == data[2].state.selectedTab){
        this.handleMouseDown(dataKey, ...data,this.scrollIntoViewIfNeeded)
        find = true
        break
      }
    }

    if(find) return
    for(let [dataKey,data] of Object.entries(this.datas)) {
      this.handleMouseDown(dataKey, ...data, this.scrollIntoViewIfNeeded)
      return
    }
  }

  search(next){ //@TODO 空文字リセット
    const isParamSame = this.prevState.case === this.state.case &&
      this.prevState.or === this.state.or &&
      this.prevState.reg === this.state.reg &&
      this.prevState.onlyActive === this.state.onlyActive &&
      this.prevState.query === this.state.query

    if(!isParamSame){
      this.prevState = this.state
      const operation =  `window.__complex_search_define__.itel_main2('${this.state.reg ? '@RE:' : ''}${stringEscape(this.state.query)}',true,${!!this.state.case},${!this.state.or})`
      const key = uuid.v4()
      // clearTimeout(this.timer)
      // this.timer = setTimeout(_=>{

      const arr = [], allWvIds= []
      this.props.parent.allKeys(void 0,arr)
      let i = 1
      for(let key of arr){
        const tabPanel = this.props.parent.refs2[key]
        const tabs = this.state.onlyActive ? tabPanel.state.tabs.filter(t=>t.key == tabPanel.state.selectedTab) : tabPanel.state.tabs
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
        this.focusSelectedPanelRow()
      })
      // },300)

    }
    else{
      if(next){
        this.onNext()
      }
      else{
        this.onPrev()
      }
    }
  }

  onKeyDown(e) {
    if (e.keyCode == 13) {
      this.state.query = e.target.value
      this.search(!e.shiftKey)
    }
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

  handleMouseDown(dataKey,tabId,tabKey,tabPanel,callback){
    const operation =  `window.__complex_search_define__.itel_main('${this.state.reg ? '@RE:' : ''}${stringEscape(this.state.query)}',true,${!!this.state.case},${!this.state.or})
      window.__complex_search_define__.scrollFocusNo(${dataKey.split("-").slice(-1)[0]}, 'itel-highlight', 'itel-selected')`

    ipc.send('start-find-all',tabKey,[tabId],operation,true) //@TODO
    ipc.once(`start-find-all-reply_${tabKey}`, (e,result)=>{
      tabPanel.setState({selectedTab: tabKey})
      this.setState({selected: dataKey})
      if(callback) callback()
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

        const dataKey = `${seq}-${no}`
        this.datas[dataKey] = [tabId,tabKey,tabPanel]
        this.max = dataKey
        const textNode = this.buildTextNode(prefix,text,suffix)
        const isSelected = tabPanel.state.selectedTab == tabKey
        tr.push(<tr key={dataKey} className={`${this.state.selected == dataKey ? 'tr-selected' : 'tr-normal'} ${isSelected ? 'tr-selected-tab' : ''}`}
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
                style={{height: this.props.findPanelHeight - 1, background: '#f3f3f3', overflowY: 'auto'}} >
      <div className="visible browser-page-search" style={{
        width: 'fit-content',
        position: 'sticky',
        zIndex: 2,
        top: 0,
        right: 0,
        marginRight: 0,
        marginLeft: 'auto'}}>
        <input style={{borderRadius: 'unset', borderTop: 0, width: 350}} className="search-text" ref="input" type="text" placeholder="Search..." onKeyDown={::this.onKeyDown}/>
        <a className="search-button" href="javascript:void(0)">
          <i className="search-next fa fa-angle-up" style={{fontSize: "1.5em",lineHeight: "1.2",height:"30px"}} onClick={::this.onPrev}></i>
        </a>
        <a className="search-button" href="javascript:void(0)">
          <i className="search-prev fa fa-angle-down" style={{fontSize: "1.5em",lineHeight: "1.3",height:"30px"}} onClick={::this.onNext}></i>
        </a>
        <span className="search-num">{'1/1'}</span>
        <Checkbox style={{paddingLeft: 4, borderLeft: '1px solid #aaa'}} label="Match Case" checked={this.state.case} onChange={(e,data)=>this.changeCheck(e,'case',data)}/>
        <Checkbox label="OR" checked={this.state.or} onChange={(e,data)=>this.changeCheck(e,'or',data)}/>
        <Checkbox label="RegExp" checked={this.state.reg} onChange={(e,data)=>this.changeCheck(e,'reg',data)}/>
        <Checkbox label="Only Active" checked={this.state.onlyActive} onChange={(e,data)=>this.changeCheck(e,'onlyActive',data)}/>
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

// デフォルト選択
//
// 検索を連打したとき、shift enter
// 検索の数値
//
// 通常のページ内検索にALLを追加し、クリックするとALL側にフォーカスを移す
// ページ遷移やタブ数が変わったときのリセット処理
//
