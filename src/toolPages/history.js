window.debug = require('debug')('info')
// require('debug').enable("info")
import process from './process'
const ipc = require('electron').ipcRenderer
const path = require('path')
const React = require('react')
const ReactDOM = require('react-dom')
const { Container, List, Menu, Input } = require('semantic-ui-react')
const { StickyContainer, Sticky } = require('react-sticky');
const moment = require('moment')
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'


const convertUrlMap = new Map([
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html',''],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/blank.html','about:blank'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite.html','chrome://bookmarks/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite_sidebar.html','chrome://bookmarks-sidebar/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/history.html','chrome://history/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/history_sidebar.html','chrome://history-sidebar/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/explorer.html','chrome://explorer/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/explorer_sidebar.html','chrome://explorer-sidebar/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/tabs_sidebar.html','chrome://tabs-sidebar/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/download.html','chrome://download/'],
  ['chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/terminal.html','chrome://terminal/'],
])

const convertUrlReg = /^chrome\-extension:\/\/dckpbojndfoinamcdamhkjhnjnmjkfjd\/(video|ace)\.html\?url=([^&]+)/
const convertUrlPdfReg = /^chrome\-extension:\/\/jdbefljfgobbmcidnmpjamcbhnbphjnb\/content\/web\/viewer\.html\?file=(.+?)$/

function convertURL(url){
  if(!url) return
  if(convertUrlMap.has(url)){
    return convertUrlMap.get(url)
  }
  else{
    const match = url.match(convertUrlReg)
    let matchPdf
    if(match){
      return decodeURIComponent(match[2])
    }
    else if(matchPdf = url.match(convertUrlPdfReg)){
      return decodeURIComponent(matchPdf[1])
    }
    return url
  }
}


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
  ipc.send('fetch-history',range)
}

function searchHistory(cond){
  ipc.send('search-history',cond)
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

class TopMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {items:['48 Hours Ago','7 Days Ago','30 Days Ago','All'], activeItem: '48 Hours Ago' }
  }

  handleItemClick(e, { name }){
    this.setState({ activeItem: name })
    let cond
    switch(name){
      case 'All':
        this.token = onceRun(()=>fetchHistory({}),this.token)
        break;
      case '48 Hours Ago':
        this.token = intervalRun(()=>fetchHistory({start: moment().subtract(parseInt(name), 'hours').valueOf()}),this.token)
        break;
      default:
        this.token = onceRun(()=>fetchHistory({start: moment().subtract(parseInt(name), 'days').valueOf()}),this.token)
        break;
    }

  }

  setToken(token){
    this.token = token
  }

  onChange(e,data) {
    e.preventDefault()
    clearTimeout(this.timer);
    this.timer = setTimeout(()=>{
      this.token = onceRun(()=>searchHistory(escapeRegExp(data.value).split(/[ 　]+/,-1).filter(x=>x)),this.token)
    }, 200)
  }

  render() {
    console.log(this.token)
    const { activeItem } = this.state
    console.log(this.state)
    return (
      <StickyContainer>
        <Sticky>
          <div>
            <Menu pointing secondary >
              {this.state.items.map(item=>{
                return <Menu.Item key={item} name={item} active={activeItem === item} onClick={::this.handleItemClick} />
              })}
              <Menu.Item as='a' href={`${baseURL}/top.html`} key="top" name="Top" style={{
                borderLeft: "2px solid rgba(34,36,38,.15)",
                marginLeft: 20,
                paddingLeft: 30
              }}/>
              <Menu.Item as='a' href={`${baseURL}/favorite.html`} key="favorite" name="Favorite"/>
              {/*<Menu.Item as='a' href={`${baseURL}/download.html`} key="download" name="Download"/>*/}
              <Menu.Item as='a' href={`${baseURL}/explorer.html`} key="file-explorer" name="File Explorer"/>
              <Menu.Item as='a' href={`${baseURL}/terminal.html`} key="terminal" name="Terminal"/>
              <Menu.Menu position='right'>
                <Menu.Item>
                  <Input ref='input' icon='search' placeholder='Search...' onChange={::this.onChange}/>
                </Menu.Item>
              </Menu.Menu>
            </Menu>
          </div>
        </Sticky>
        <HistoryList setToken={::this.setToken}/>
      </StickyContainer>
    )
  }
}

class HistoryList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {history: []}
  }

  componentDidMount() {
    historyReply((data)=>{
      this.setState({history: data})
    })
    this.props.setToken(intervalRun(()=>fetchHistory({start: moment().subtract(48, 'hours').valueOf()})))
  }

  render() {
    const historyList = []
    let pre = {location:false}
    this.state.history.forEach((h,i)=>{
      h.updated_at = moment(h.updated_at).format("YYYY/MM/DD HH:mm:ss")
      h.yyyymmdd = h.updated_at.slice(0,10)
      if(pre.yyyymmdd != h.yyyymmdd){
        historyList.push(<h4 key={h.yyyymmdd}>{h.yyyymmdd}</h4>)
      }
      if(h.location === pre.location){
        if(!pre.title) pre.title = h.title
        if(!pre.favicon) pre.favicon = h.favicon
        historyList[historyList.length-1] = this.buildItem(pre)
      }
      else{
        historyList.push(this.buildItem(h))
        pre = h
      }
    })

    return <List divided relaxed>
      {historyList}
    </List>
  }

  buildItem(h) {
    const favicon = faviconGet(h)
    return <List.Item key={h._id}>
      <img src={favicon}
           style={{width: 20, height: 20, float: 'left', marginRight: 4, marginTop: 6}}/>
      <List.Content>
        <a className="description" style={{
          float: 'right',
          marginRight: 15,
          fontSize: "12px"
        }}>{h.updated_at.slice(5)}</a>
        {!h.title ? "" : <List.Header as='a' target="_blank" href={h.location}>{h.title.length > 55 ? `${h.title.substr(0, 55)}...` : h.title}</List.Header>}
        {!h.location ? "" : <List.Description as='a' target="_blank" style={{fontSize: "12px"}} href={h.location}>{h.location.length > 125 ? `${h.location.substr(0, 125)}...` : convertURL(h.location)}</List.Description>}
      </List.Content>
    </List.Item>;
  }
}

const App = () => (
  <Container>
    <TopMenu/>
  </Container>
)


ReactDOM.render(<App />,  document.getElementById('app'))