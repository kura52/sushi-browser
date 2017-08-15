window.debug = require('debug')('info')
// require('debug').enable("info")
import process from './process'
var ipc = require('electron').ipcRenderer
const React = require('react')
const ReactDOM = require('react-dom')
const {  Progress, Segment, Container, List, Menu, Input,Icon,Button } = require('semantic-ui-react')
const { StickyContainer, Sticky } = require('react-sticky');
const moment = require('moment')
const l10n = require('../../brave/js/l10n')
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'
l10n.init()

function downloadingItemReply(callback){
  ipc.on('download-progress', (event, item) => {
    callback(item,event.sender)
  })
}

function fetchDownload(range){
  console.log("fetchDownload",range)
  ipc.send('fetch-download',range)
}

function searchDownload(cond){
  ipc.send('search-download',cond)
}

function downloadReply(callback){
  ipc.on('download-reply', (event, data) => {
    callback(data)
  })
}

function openFolder(path){
  ipc.send("download-open-folder", path)
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
    this.state = { }
  }

  setToken(token){
    this.token = token
  }

  onChange(e,data) {
    e.preventDefault()
    clearTimeout(this.timer);
    this.timer = setTimeout(()=>{
      searchDownload(escapeRegExp(data.value))
    }, 200)
  }

  render() {
    return (
      <StickyContainer>
        <Sticky>
          <div>
            <Menu pointing secondary>
              <Menu.Item as='a' href={`${baseURL}/top.html`} key="top" name="Top"/>
              <Menu.Item as='a' href={`${baseURL}/favorite.html`} key="favorite" name={l10n.translation('bookmarks')}/>
              <Menu.Item as='a' href={`${baseURL}/history.html`} key="history" name={l10n.translation('history')}/>
              <Menu.Item key="download" name={l10n.translation('downloads')} active={true}/>
              <Menu.Item as='a' href={`${baseURL}/explorer.html`} key="file-explorer" name="File Explorer"/>
              <Menu.Item as='a' href={`${baseURL}/terminal.html`} key="terminal" name="Terminal"/>
              <Menu.Item as='a' href={`${baseURL}/settings.html`} key="settings" name={l10n.translation('settings')}/>
              {/*<Menu.Item>*/}
                {/*<Input ref='input' icon='search' placeholder='Search...' onChange={::this.onChange}/>*/}
              {/*</Menu.Item>*/}
            </Menu>
          </div>
        </Sticky>
        <DownloadList setToken={::this.setToken}/>
      </StickyContainer>
    )
    return <div style={{paddingTop: "10px"}}><DownloadList setToken={::this.setToken}/></div>
  }
}

class DownloadList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {downloads: new Map()}
  }

  componentDidMount() {
    downloadingItemReply((item,sender)=>{
      item.sender = sender
      item.created_at = item.startTime
      this.state.downloads.set(item.created_at,item)
      this.setState({})
    })

    downloadReply((data,flag)=>{
      let num = 0
      for(let e of data){
        if(!this.state.downloads.has(e.created_at) || num<1000){
          this.state.downloads.set(e.created_at,e)
          num++
        }
      }
      this.setState({})
    })
    this.props.setToken(intervalRun(()=>fetchDownload({})))
  }

  render() {
    const arr = [...this.state.downloads.values()]
    arr.sort((a,b)=> b.created_at - a.created_at)

    const downloadList = []
    for (let item of arr) {
      downloadList.push(this.buildItem(item))
    }

    return <List divided relaxed>
      {downloadList}
    </List>
  }

  round(val, precision) {
    const digit = Math.pow(10, precision)
    return Math.round(val * digit) / digit
  }

  getAppropriateByteUnit(byte){
    if(byte / 1024 < 1){
      return [byte,"B"]
    }
    else if(byte / 1024 / 1024 < 1){
      return [this.round(byte /1024,2),"KB"]
    }
    else if(byte / 1024 / 1024 / 1024 < 1){
      return [this.round(byte /1024 / 1024 ,2),"MB"]
    }
    return [this.round(byte /1024 / 1024 / 1024,2), "GB"]
  }


  getAppropriateTimeUnit(time){
    if(time / 60 < 1){
      return [time,"sec"]
    }
    else if(time / 60 / 60 < 1){
      return [Math.round(time /60),"min",Math.round(time % 60),"sec"]
    }
    else if(time / 60 / 60 / 24 < 1){
      return [Math.round(time / 60 / 60),"hour",Math.round(time % (60*60)),"min"]
    }
    return [Math.round(time / 60 / 60 / 24),"day",Math.round(time % (60 * 60 * 24)),"hour"]
  }

  calcSpeed(item){
    const diff =item.now - item.created_at
    const percent = this.round(item.receivedBytes / item.totalBytes * 100,2)
    const speed = item.receivedBytes / diff * 1000
    const restTime = (item.totalBytes - item.receivedBytes) / speed

    return {diff,percent,speed,restTime}
  }

  buildItem(item) {
    const rest = this.calcSpeed(item)

    return <List.Item key={`${item.savePath}_${item.created_at}`}>
      <List.Content>
        <a className="description" style={{
          float: 'right',
          marginRight: 15,
          fontSize: "12px"
        }}>{moment(item.now).format("MM/DD HH:mm:ss")}</a>
        <List.Header as='a' target="_blank" href={item.url}>{item.filename.length > 55 ? `${item.filename.substr(0, 55)}...` : item.filename}</List.Header>
        <List.Description>{item.url.length > 125 ? `${item.url.substr(0, 125)}...` : item.url}</List.Description>
        {item.state == "progressing" && !item.isPaused ? <List.Description>{`${this.getAppropriateByteUnit(rest.speed).join(" ")}/sec - ${this.getAppropriateByteUnit(item.receivedBytes).join(" ")} of ${this.getAppropriateByteUnit(item.totalBytes).join(" ")}（${this.getAppropriateTimeUnit(rest.restTime).join(" ")} left）`}</List.Description> : ""}
        {item.receivedBytes ? <Progress percent={rest.percent}  size='small' color='blue' label {...(item.state == "progressing" ? {active: true} : item.state == "completed" ? {success : true} : {})} /> : ""}
        <div style={{display: "flex"}}>
          {item.state == "progressing" ? item.isPaused ?
            <Button size='mini' onClick={()=>item.sender.send("download-pause",item)}><Icon name="play"></Icon>Resume</Button> :
            <Button size='mini' onClick={()=>item.sender.send("download-pause",item)}><Icon name="pause"></Icon>Pause</Button> : ""
          }
          {item.state == "completed" ?
            <Button size='mini' onClick={()=>window.openFolder(item.savePath)}><Icon name="folder"></Icon>Open Folder</Button> :
            item.state == "cancelled" ?
              <Button size='mini' onClick={()=>item.sender.send("download-retry", item.url)}><Icon name="video play"></Icon>Retry</Button> :
              <Button size='mini' onClick={()=>item.sender.send("download-cancel", item)}><Icon name="stop"></Icon>Cancel</Button>
          }
        </div>
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