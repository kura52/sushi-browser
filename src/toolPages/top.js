window.debug = require('debug')('info')
// require('debug').enable("info")
import process from './process'
const ipc = require('electron').ipcRenderer
const path = require('path')
const React = require('react')
const ReactDOM = require('react-dom')
const { Container, Card, Menu, Input } = require('semantic-ui-react')
const { StickyContainer, Sticky } = require('react-sticky');
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'


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
              <Menu.Item as='a' href={`${baseURL}/favorite.html`} key="favorite" name="Favorite"/>
              <Menu.Item as='a' href={`${baseURL}/history.html`} key="history" name="History"/>
              <Menu.Item as='a' href={`${baseURL}/download.html`} key="download" name="Download"/>
              <Menu.Item as='a' href={`${baseURL}/explorer.html`} key="file-explorer" name="File Explorer"/>
              <Menu.Item as='a' href={`${baseURL}/terminal.html`} key="terminal" name="Terminal"/>
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
      <input ref="input" type="text" placeholder="Focus Search Bar" onFocus={this.sendHost}/>
      <i aria-hidden="true" className="search icon"></i>
    </div>
  }

}

class TopList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {history: []}
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
    this.state.history.forEach((h,i)=>{
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

    return <Card.Group >
      {result.slice(0,18)}
    </Card.Group>
  }

  buildItem(h) {
    const favicon = faviconGet(h)
    return <Card key={h._id}>
      <Card.Description>
        {!h.title ? "" : <Card.Header as='a' href={h.location}><img src={favicon} style={{width: 16, height: 16, verticalAlign: "text-top"}}/>{multiByteSlice(h.title,32)} ({h.count}pv)</Card.Header>}
      </Card.Description>
      {h.path ? <a href={h.location} style={{textAlign:"center"}}><img className="capture" style={{width:"160px",height:"120px",objectFit: "contain"}} src={`file://${resourcePath}/capture/${h.path}`}/></a> : null}
    </Card>;
  }
}

const App = () => (
  <Container>
    <TopMenu/>
  </Container>
)


ReactDOM.render(<App />,  document.getElementById('app'))