window.debug = require('debug')('info')
// require('debug').enable("info")
import process from './process'
import {ipcRenderer as ipc} from './ipcRenderer'
import React from 'react';
import ReactDOM from 'react-dom';
import {Progress, Segment, Container, List, Menu, Input, Icon, Button} from 'semantic-ui-react';
import {StickyContainer, Sticky} from 'react-sticky';
import moment from 'moment';
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'

import l10n from '../../brave/js/l10n';
const initPromise = l10n.init()
import '../defaultExtension/contentscript'


function downloadingItemReply(callback){
  ipc.on('download-progress', (event, item) => {
    callback(item,event.sender)
  })
}

function fetchDownload(range){
  console.log("fetchDownload",range)
  ipc.send('fetch-downloader-data',range)
}

function searchDownload(cond){
  ipc.send('search-download',cond)
}

function downloadReply(callback){
  ipc.on('downloader-data-reply', (event, data) => {
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

function formatDate(longDate) {
  const date = new Date(longDate)
  return `${('0' + (date.getMonth() + 1)).slice(-2)}/${('0' + date.getDate()).slice(-2)} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`
}

class TopMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  setToken(token){
    this.token = token
  }

  onChange(e,data) {
    this.setState({word: new RegExp(escapeRegExp(data.value),'i')})
  }

  render() {
    return (
      <StickyContainer>
        <Sticky>
          <div>
            <Menu pointing secondary >
              <Menu.Item as='a' href={`${baseURL}/favorite_sidebar.html`} key="favorite" icon="star"/>
              <Menu.Item as='a' href={`${baseURL}/history_sidebar.html`} key="history" icon="history"/>
              <Menu.Item as='a' key="download" icon="download" active={true}/>
              <Menu.Item as='a' href={`${baseURL}/video_controller_sidebar.html`} key="video-controller" icon="play"/>
              <Menu.Item as='a' href={`${baseURL}/note_sidebar.html`} key="note" icon="sticky note"/>
              <Menu.Item as='a' href={`${baseURL}/saved_state_sidebar.html`} key="database" icon="database"/>
              <Menu.Item as='a' href={`${baseURL}/tab_trash_sidebar.html`} key="trash" icon="trash"/>
              <Menu.Item as='a' href={`${baseURL}/tab_history_sidebar.html`} key="tags" icon="tags"/>
              <Menu.Item as='a' href={`${baseURL}/explorer_sidebar.html`} key="file-explorer" icon="folder"/>
            </Menu>
            <Input ref='input' icon='search' placeholder='Search...' size="small" onChange={::this.onChange}/>
          </div>
        </Sticky>
        <DownloadList word={this.state.word} setToken={::this.setToken}/>
      </StickyContainer>
    )
    return <div style={{paddingTop: "10px"}}><DownloadList setToken={::this.setToken}/></div>
  }
}

let debounceInterval = 40, debounceTimer
class DownloadList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {downloads: new Map()}
  }

  debounceSetState = (newState) => {
    const now = Date.now()
    if(this.processing && now - this.processing < 5000) return
    for(let [k,v] of Object.entries(newState)){
      this.state[k] = v
    }
    debounceTimer = setTimeout(()=>{
      this.setState({})
      this.processing = false
    },debounceInterval)
  }

  componentDidMount() {
    downloadingItemReply((item,sender)=>{
      item.sender = sender
      item.created_at = item.startTime
      this.state.downloads.set(item.key || item.created_at.toString(),item)
      this.debounceSetState({})
    })

    downloadReply((data,flag)=>{
      let num = 0
      for(let item of data){
        item.fromDB = true
        if(!this.state.downloads.has(item.key || item.created_at.toString()) || num<1000){
          this.state.downloads.set(item.key || item.created_at.toString(),item)
          num++
        }
      }
      this.debounceSetState({})
    })
    this.props.setToken(intervalRun(()=>fetchDownload({})))
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
      return [Math.round(time),"sec"]
    }
    else if(time / 60 / 60 < 1){
      return [Math.round(time /60),"min",Math.round(time % 60),"sec"]
    }
    else if(time / 60 / 60 / 24 < 1){
      return [Math.round(time / 60 / 60),"hour",Math.round((time / 60) % 60),"min"]
    }
    return [Math.round(time / 60 / 60 / 24),"day",Math.round((time/60/60) % 24),"hour"]
  }

  calcSpeedSec(item){
    let speed = item.speed
    if(!speed){
      return 1
    }
    else if(speed.includes("TB")){
      return parseFloat(speed) * 1024 * 1024 * 1024 * 1024
    }
    else if(speed.includes("GB")){
      return parseFloat(speed) * 1024 * 1024 * 1024
    }
    else if(speed.includes("MB")){
      return parseFloat(speed) * 1024 * 1024
    }
    else if(speed.includes("KB")){
      return parseFloat(speed) * 1024
    }
    else{
      const val = parseFloat(speed)
      return isNaN(val) ? 1 : val
    }
  }

  calcSpeed(item){
    const diff =item.now - item.created_at
    const percent = this.round(item.receivedBytes / item.totalBytes * 100,2)
    const speed = item.speed ? this.calcSpeedSec(item) : item.receivedBytes / diff * 1000
    const restTime = (item.totalBytes - item.receivedBytes) / speed

    return {diff,percent,speed,restTime}
  }

  play(item){
    if(item.fromDB || item.state == "cancelled"){
      ipc.send("download-retry", item.url, item.savePath, item.key)
    }
    else{
      ipc.send("download-pause", item)
    }
  }

  buildItem(item) {
    const rest = this.calcSpeed(item)
    const isPregressing = item.state == "progressing"
    const progress = isPregressing ? `${item.speed || this.getAppropriateByteUnit(rest.speed).join(" ")}/s ${this.getAppropriateByteUnit(item.receivedBytes).join(" ")} of ${this.getAppropriateByteUnit(item.totalBytes).join(" ")}（${this.getAppropriateTimeUnit(rest.restTime).join(" ")} left）`.replace(/NaN/g,'-') :
      item.state == "completed" ? "Completed" : "Canceled"

    const date = isPregressing ? null : <span style={{fontSize: 12, paddingRight: 3, verticalAlign: 1}}>[{item.now ? formatDate(item.now) : ''}]</span>

    const fname = item.filename

    return <div className="ui horizontal segments dl-list">
    <div className="ui blue segment" key={item.savePath}>
      {!(item.state == "completed" || (item.state == "progressing" && !item.isPaused)) ?
        <i className="play icon download-list-above" onClick={_=>this.play(item)}></i> :
        item.state == "progressing" && !item.isPaused ?
        <i className="pause icon download-list-above" onClick={_=>ipc.send("download-pause",item)}></i> : ""
      }
      {item.state == "completed" ?
        <i className="folder icon download-list-above" onClick={()=>ipc.send("download-open-folder", item.savePath)}></i> :
        item.state != "cancelled" ?
          <i className="stop icon download-list-bottom" onClick={_=>ipc.send("download-cancel", item)}></i> : ''
      }
      {/*{item.state == "completed" ? <div><a href="#" onClick={()=>ipc.send("download-open",item)}>{fname}</a></div> : <div>{fname}</div>}*/}
      <div><a className="title" href="javascript:void(0)" onClick={()=>ipc.send("download-open",item)}>{fname}</a></div>
      <div style={{fontSize: isPregressing ? 12 : 13}}>{date}{progress.length > 28 ? `${progress.substr(0, 28)}...` :progress}</div>
    </div>
    </div>

    // return <List.Item key={`${item.savePath}_${item.created_at}`}>
    //   <List.Content>
    //     <a className="description" style={{
    //       float: 'right',
    //       marginRight: 15,
    //       fontSize: "12px"
    //     }}>{moment(item.now).format("MM/DD HH:mm:ss")}</a>
    //     <List.Header as='a' target="_blank" href={item.url}>{item.filename.length > 55 ? `${item.filename.substr(0, 55)}...` : item.filename}</List.Header>
    //     <List.Description>{item.url.length > 125 ? `${item.url.substr(0, 125)}...` : item.url}</List.Description>
    //     {item.state == "progressing" && !item.isPaused ? <List.Description>{`${item.speed ||this.getAppropriateByteUnit(rest.speed).join(" ")}/sec - ${this.getAppropriateByteUnit(item.receivedBytes).join(" ")} of ${this.getAppropriateByteUnit(item.totalBytes).join(" ")}（${this.getAppropriateTimeUnit(rest.restTime).join(" ")} left）`}</List.Description> : ""}
    //     {item.receivedBytes ? <Progress percent={rest.percent}  size='small' color='blue' label {...(item.state == "progressing" ? {active: true} : item.state == "completed" ? {success : true} : {})} /> : ""}
    //     <div style={{display: "flex"}}>
    //       {item.sender && item.state == "progressing" ? item.isPaused ?
    //         <Button size='mini' onClick={()=>item.sender.send("download-pause",item)}><Icon name="play"></Icon>Resume</Button> :
    //         <Button size='mini' onClick={()=>item.sender.send("download-pause",item)}><Icon name="pause"></Icon>Pause</Button> : ""
    //       }
    //       {item.state == "completed" ?
    //         <Button size='mini' onClick={()=>openFolder(item.savePath)}><Icon name="folder"></Icon>Open Folder</Button> :
    //         !item.sender ? null : item.state == "cancelled" ?
    //           <Button size='mini' onClick={()=>item.sender.send("download-retry", item.url, item.savePath, item.key)}><Icon name="video play"></Icon>Retry</Button> :
    //           <Button size='mini' onClick={()=>item.sender.send("download-cancel", item)}><Icon name="stop"></Icon>Cancel</Button>
    //       }
    //     </div>
    //   </List.Content>
    // </List.Item>;
  }

  render() {
    const arr = [...this.state.downloads.values()]
    arr.sort((a,b)=> b.created_at - a.created_at)

    const downloadList = []
    for (let item of arr) {
      if(!this.props.word || this.props.word.test(item.filename))
        downloadList.push(this.buildItem(item))
    }

    return <div style={{flexDirection: 'column', display: 'flex', paddingTop: 10,margin: '0 6px'}}>
      {downloadList}
    </div>
  }
}

const App = () => (
    <TopMenu/>
)

;(async ()=>{
  await initPromise
  ReactDOM.render(<App />,  document.getElementById('app'))
})()