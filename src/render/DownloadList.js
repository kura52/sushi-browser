const React = require('react')
const {Component} = React
const ReactDOM = require('react-dom')
const ipc = require('electron').ipcRenderer
const {webContents} = require('electron').remote.require('electron')
const path = require('path')

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

let debounceInterval = 40, debounceTimer
export default class DownloadList extends Component{
  constructor(props) {
    super(props)
    this.downloadSet = new Set()
    this.state = {downloads:new Map(),visible: false}
    this.events = {}
  }

  debounceSetState = (newState) => {
    for(let [k,v] of Object.entries(newState)){
      this.state[k] = v
    }
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(()=>this.setState({}),debounceInterval)
  }

  componentDidMount() {
    this.events['download-progress'] = (event, item) => {
      if(!this.downloadSet.has(item.key || item.savePath)){
        this.downloadSet.add(item.key || item.savePath)
        this.debounceSetState({visible: true})
      }
      this.state.downloads.set(item.key || item.savePath,item)
      console.log(item)
      this.debounceSetState({})
    }
    ipc.on('download-progress',this.events['download-progress'] )

    this.events['download-start'] = (event) => {
      this.debounceSetState({visible: true})
    }
    ipc.on('download-start', this.events['download-start'])
  }

  componentWillUnmount() {
    for(let [k,v] of Object.entries(this.events)){
      ipc.removeListener(k,v)
    }
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
      return [this.round(byte /1024,1),"KB"]
    }
    else if(byte / 1024 / 1024 / 1024 < 1){
      return [this.round(byte /1024 / 1024 ,1),"MB"]
    }
    return [this.round(byte /1024 / 1024 / 1024,1), "GB"]
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
    const diff =item.now - item.startTime
    const percent = this.round(item.receivedBytes / item.totalBytes * 100,2)
    const speed = item.speed ? this.calcSpeedSec(item) : item.receivedBytes / diff * 1000
    const restTime = (item.totalBytes - item.receivedBytes) / speed

    return {diff,percent,speed,restTime}
  }

  buildItem(item) {
    const rest = this.calcSpeed(item)
    const progress = item.state == "progressing" ? `${item.speed || this.getAppropriateByteUnit(rest.speed).join(" ")}/s ${this.getAppropriateByteUnit(item.receivedBytes).join(" ")} of ${this.getAppropriateByteUnit(item.totalBytes).join(" ")}（${this.getAppropriateTimeUnit(rest.restTime).join(" ")} left）`.replace(/NaN/g,'-') :
      item.state == "completed" ? "Completed" : "Canceled"
    const fname = multiByteSlice(item.filename, 23)

    return <div className="ui blue segment" key={item.savePath}>
      {item.state == "progressing" ? item.isPaused ?
        <i className="play icon download-list-above" onClick={()=>ipc.send("download-pause",item)}></i> :
        <i className="pause icon download-list-above" onClick={()=>ipc.send("download-pause",item)}></i> : ""
      }
      {item.state == "completed" ?
        <i className="folder icon download-list-above" onClick={()=>ipc.send("download-open-folder", item.savePath)}></i> :
        item.state == "cancelled" ?
          <i className="video play icon download-list-above"  onClick={()=>ipc.send("download-retry", item.url, item.savePath, item.key)}></i> :
          <i className="stop icon download-list-bottom" onClick={()=>ipc.send("download-cancel", item)}></i>
      }
      {/*{item.state == "completed" ? <div><a href="#" onClick={()=>ipc.send("download-open",item)}>{fname}</a></div> : <div>{fname}</div>}*/}
      <div><a href="javascript:void(0)" onClick={()=>ipc.send("download-open",item)}>{fname}</a></div>
      <div style={item.state == "progressing" ? {fontSize: '12px'} : {}}>{progress.length > 28 ? `${progress.substr(0, 28)}...` :progress}</div>
    </div>

  }

  render() {
    const arr = [...this.state.downloads.values()]
    arr.sort((a,b)=> b.startTime - a.startTime)

    const downloadList = []
    for (let item of arr.slice(0,10)) {
      // console.log(item)
      downloadList.push(this.buildItem(item))
    }

    return <div className="ui horizontal segments dl-list" style={downloadList.length > 0 && this.state.visible ? {} : {display: 'none'}}>
      {downloadList}
      <div className="ui blue segment" key={-1} style={{width: '30px'}}>
        <i className="remove circle icon download-list-above" onClick={()=>{
          this.state.downloads.clear()
          this.setState({visible: false})
        }} />
        <i className="download icon download-list-bottom" onClick={()=>{
          const conts = webContents.getAllWebContents()
          let cont = null
          for(let c of conts){
            if(!c.hostWebContents || c.getURL().startsWith("chrome-devtools://") || c.isDestroyed() || c.isCrashed()) continue
            cont = c
            break
          }
          // console.log(cont.getURL())
          cont.hostWebContents.send('new-tab', cont.getId(), 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/download.html')
        }} />
      </div>
    </div>
  }
}
