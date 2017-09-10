window.debug = require('debug')('info')
// require('debug').enable("info")
import process from './process'
const ipc = require('electron').ipcRenderer
const path = require('path')
const React = require('react')
const ReactDOM = require('react-dom')
const moment = require('moment')
const { Container, Card, Menu, Input } = require('semantic-ui-react')
const { StickyContainer, Sticky } = require('react-sticky');
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'
const l10n = require('../../brave/js/l10n')
l10n.init()

let resourcePath
let setTime = localStorage.getItem('favicon-set')
ipc.send("favicon-get",setTime ? parseInt(setTime) : null)
ipc.once("favicon-get-reply",(e,ret)=>{
  localStorage.setItem('favicon-set',Date.now().toString())
  for(let [k,v] of Object.entries(ret)){
    localStorage.setItem(k,v)
  }
})

function faviconGet(h){
  return h.favicon ? localStorage.getItem(h.favicon) || `file://${resourcePath}/file.png` : `file://${resourcePath}/file.png`
}

ipc.send("get-resource-path",{})
ipc.once("get-resource-path-reply",(e,data)=>{
  resourcePath = data
})

function fetchHistory(range){
  ipc.send('fetch-frequently-history',range)
}

function historyReply(callback){
  ipc.on('history-reply', (event, data) => {
    callback(data)
  })
}

function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function onceRun(func,id){
  func()
  if(id) window.clearInterval(id)
  return null
}

function intervalRun(func,id){
  func()
  if(id) window.clearInterval(id)
  return window.setInterval(func, 10000)
}

function multiByteLen(str) {
  let len = 0;
  str = escape(str);
  const strLen = str.length
  for (let i=0;i<strLen;i++,len++) {
    if (str.charAt(i) == "%") {
      if (str.charAt(++i) == "u") {
        i += 3;
        len++;
      }
      i++;
    }
  }
  return len;
}

function multiByteSlice(str,end) {
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
  return `${unescape(str.slice(0,i))}${i == str.length ? "" :"..."}`;
}

class TopMenu extends React.Component {
  constructor(props) {
    super(props)
  }

  setToken(token){
    this.token = token
  }

  render() {
    return (
      <StickyContainer>
        <Sticky>
          <div>
            <Menu pointing secondary >
              <Menu.Item key="top" name="Top" active={true}/>
              <Menu.Item as='a' href={`${baseURL}/favorite.html`} key="favorite" name={l10n.translation('bookmarks')}/>
              <Menu.Item as='a' href={`${baseURL}/history.html`} key="history" name={l10n.translation('history')}/>
              <Menu.Item as='a' href={`${baseURL}/download.html`} key="download" name={l10n.translation('downloads')}/>
              <Menu.Item as='a' href={`${baseURL}/explorer.html`} key="file-explorer" name="File Explorer"/>
              <Menu.Item as='a' href={`${baseURL}/terminal.html`} key="terminal" name="Terminal"/>
              <Menu.Item as='a' href={`${baseURL}/settings.html`} key="settings" name={l10n.translation('settings')}/>
            </Menu>
          </div>
        </Sticky>
        <TopSearch/>
        <TopList setToken={::this.setToken}/>
      </StickyContainer>
    )
  }
}

class TopSearch extends React.Component {

  componentDidMount() {
    this.refs.input.focus()
    console.log("mount")
  }

  sendHost(e){
    console.log(222222)
    ipc.sendToHost("navbar-search",{})
    e.target.value = ""
    e.target.blur()
    e.preventDefault()
  }


  render(){
    return <div className="ui big icon input">
      <input ref="input" type="text" placeholder="Focus Location Bar" onFocus={this.sendHost}/>
      <i aria-hidden="true" className="search icon"></i>
    </div>
  }

}

class HistoryList{
  build(data) {
    const historyList = []
    let pre = {location:false}
    let count = 0
    for(let h of data){
      if(count > 14) break
      if(h.location.startsWith('chrome-extension')) continue
      h.updated_at = moment(h.updated_at).format("YYYY/MM/DD HH:mm:ss")
      if(h.location !== pre.location){
        historyList.push(this.buildItem(h))
        count += 1
        pre = h
      }
    }
    return historyList
  }


  buildItem(h) {
    const favicon = faviconGet(h)
    return <div role="listitem" className="item">
      <img src={favicon} style="width: 20px; height: 20px; float: left; margin-right: 4px; margin-top: 6px;"/>
      <div className="content">
        <a className="description" style="float:right;margin-right:15px;font-size: 12px">{h.updated_at.slice(5)}</a>
        {!h.title ? "" : <a className="header" target="_blank" href={h.location}>{h.title.length > 55 ? `${h.title.substr(0, 55)}...` : h.title}</a>}
        {!h.location ? "" : <a className="description" target="_blank" style="fontSize: 12px;" href={h.location}>{h.location.length > 125 ? `${h.location.substr(0, 125)}...` : h.location}</a>}
      </div>
    </div>;
  }

}

class TopList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {history: {freq:[],upd:[]}}
  }

  componentDidMount() {
    historyReply((data)=>{
      this.setState({history: data})
    })
    fetchHistory({})
  }

  render() {
    const topList = new Map()
    let pre = {location:false}
    this.state.history.freq.forEach((h,i)=>{
      if(h.location.startsWith('chrome-extension')) return
      if(h.location === pre.location){
        if(!pre.title) pre.title = h.title
        if(!pre.favicon) pre.favicon = h.favicon
        topList[topList.length-1] = this.buildItem(pre)
      }
      else{
        if(topList.has(h.location)){
          const ele = topList.get(h.location)
          h.count += ele[1]
        }
        topList.set(h.location,[this.buildItem(h),h.count])
        pre = h
      }
    })

    let result = []
    for(let val of topList.values()){
      result.push(val[0])
    }

    const hlist= new HistoryList().build(this.state.history.upd)

    return <div><Card.Group >
      {result.slice(0,18)}
    </Card.Group>
      <div className="ui divider"/>
      <div role="list" className="ui divided relaxed list">
        {hlist}
      </div>
    </div>
  }

  buildItem(h) {
    const favicon = faviconGet(h)
    return <Card key={h._id}>
      <Card.Description>
        {!h.title ? "" : <Card.Header as='a' href={h.location}><img src={favicon} style={{width: 16, height: 16, verticalAlign: "text-top"}}/>{multiByteSlice(h.title,32)} ({h.count}pv)</Card.Header>}
      </Card.Description>
      {h.path ? <a href={h.location} style={{textAlign:"center"}}><img className="capture" style={{width:160,height:100,objectFit: "contain"}} src={`file://${resourcePath}/capture/${h.path}`}/></a> : null}
    </Card>;
  }
}

const App = () => (
  <Container>
    <TopMenu/>
  </Container>
)


ReactDOM.render(<App />,  document.getElementById('app'))