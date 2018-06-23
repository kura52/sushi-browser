window.debug = require('debug')('info')
// require('debug').enable("info")
import process from './process'
import {ipcRenderer as ipc} from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import uuid from 'node-uuid';
import Selection from '../render/react-selection/indexTable';
import path from 'path';

import ReactTable from 'react-table';

const expand = require('brace-expansion');
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'

function showDialog(input,id){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('show-dialog-exploler',key,input,id)
    ipc.once(`show-dialog-exploler-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function cancelItems(items){
  showDialog({
    normal: true,
    title: 'Confirm',
    text: 'Are you sure you want to delete the following files?',
    buttons:['Yes','No']
  }).then(value => {
    console.log(value)
    for(let item of items){
      ipc.send("download-cancel", item)
    }
  })
}

function downloadingItemReply(callback){
  ipc.on('download-progress', (event, item) => {
    callback(item,event.sender)
  })
}

function fetchDownload(range){
  console.log("fetchDownload",range)
  ipc.send('fetch-downloader-data',range)
}


function downloadReply(callback){
  ipc.on('downloader-data-reply', (event, data) => {
    callback(data)
  })
}

function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function round(val, precision) {
  const digit = Math.pow(10, precision)
  return Math.round(val * digit) / digit
}

function getAppropriateByteUnit(byte){
  if(byte / 1024 < 1){
    return [byte,"B"]
  }
  else if(byte / 1024 / 1024 < 1){
    return [round(byte /1024,2),"KB"]
  }
  else if(byte / 1024 / 1024 / 1024 < 1){
    return [round(byte /1024 / 1024 ,2),"MB"]
  }
  return [round(byte /1024 / 1024 / 1024,2), "GB"]
}


function getAppropriateTimeUnit(time){
  if(time / 60 < 1){
    return [Math.round(time),"s"]
  }
  else if(time / 60 / 60 < 1){
    return [Math.round(time /60),"m",Math.round(time % 60),"s"]
  }
  else if(time / 60 / 60 / 24 < 1){
    return [Math.round(time / 60 / 60),"h",Math.round((time / 60) % 60),"m"]
  }
  return [Math.round(time / 60 / 60 / 24),"d",Math.round((time/60/60) % 24),"h"]
}

function calcSpeedSec(item){
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

function calcSpeed(item){
  const diff =item.now - item.created_at
  const percent = round(item.receivedBytes / item.totalBytes * 100,1)
  const speed = item.speed ? calcSpeedSec(item) : item.receivedBytes / diff * 1000
  const restTime = (item.totalBytes - item.receivedBytes) / speed

  return {diff,percent,speed,restTime}
}


function formatDate(longDate) {
  const date = new Date(longDate)
  return `${date.getFullYear()}/${('0' + (date.getMonth() + 1)).slice(-2)}/${('0' + date.getDate()).slice(-2)} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`
}

// Custom Formatter component
function PercentCompleteFormatter(props){
  const percentComplete = `${props.value}%`
  return <div className="progress">
    <div className={`progress-bar ${props.value == 100 ? 'bg-success' : ''}`} role="progressbar"
         aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style={{width: percentComplete,justifyContent: props.value < 25 ? 'baseline' : void 0}}>
      {percentComplete == '0%' ? '' : percentComplete}
    </div>
  </div>
}

let debounceInterval = 40, debounceTimer
let [concurrentDownload,downloadNum] = ipc.sendSync('get-sync-main-states',['concurrentDownload','downloadNum'])
global.multiSelection = false
class Downloader extends React.Component {
  static defaultProps = { rowKey: 'id' };

  constructor(props,context) {
    super(props,context);
    this.columns = [
      { accessor: 'menu', Header: 'Menu', Cell: this.getMenuIcons, resizable: true, minWidth: 20, maxWidth: 95 },
      { accessor: 'name', Header: 'Name', resizable: true, sortable: true,filterable:true, minWidth: 20, maxWidth: 250 },
      { accessor: 'progress', Header: 'Progress', Cell: PercentCompleteFormatter, minWidth: 10, maxWidth:150  },
      { accessor: 'size', Header: 'Size', resizable: true, sortable: true,filterable:true, minWidth: 10, maxWidth:80  },
      { accessor: 'est', Header: 'Est. Time', resizable: true, sortable: true,filterable:true, minWidth: 10, maxWidth:90  },
      { accessor: 'speed', Header: 'Speed', resizable: true, sortable: true,filterable:true, minWidth: 10, maxWidth:80  },
      { accessor: 'starttime', Header: 'Start Time',resizable: true, sortable: true,filterable:true, minWidth:10, maxWidth:150  },
      { accessor: 'url', Header: 'URL', resizable: true, sortable: true,filterable:true,minWidth:10 },
    ]
    this.state = {downloads: new Map(), rows: [], selectedIds: []};
  }

  debounceSetState = (newState) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(()=>this.setState(newState),debounceInterval)
  }

  componentDidMount(){
    document.querySelector('.rt-tbody').style.height = `calc(100vh - 106px - ${document.querySelector('.navbar').offsetHeight}px)`
    window.addEventListener('resize',_=>{
      document.querySelector('.rt-tbody').style.height = `calc(100vh - 106px - ${document.querySelector('.navbar').offsetHeight}px)`
    });
    this.event = (e,name)=>{
      if(name == 'Start'){
        this.handleStart()
      }
      else if(name == 'Pause'){
        this.handlePause()
      }
      else if(name == 'Cancel Download'){
        this.handleCancel()
      }
      else if(name == 'Remove Row'){
        this.handleRemove()
      }
      else if(name == 'Show Folder'){
        this.handleOpenFolder()
      }
      else if(name == 'Open File'){
        this.handleOpenFile()
      }
      else if(name == 'Copy File Path'){
        this.handleCopyPath()
      }
      else if(name == 'Copy URL'){
        this.handleCopyUrl()
      }
    }
    ipc.on('download-menu-reply', this.event)

    downloadingItemReply((item,sender)=>{
      item.sender = sender
      item.created_at = item.startTime
      console.log(item.key || item.created_at.toString(),item)
      if(this.state.downloads.has(item.key || item.created_at.toString())){
        this.state.rows[this.state.rows.findIndex(x=>x.id === (item.key || item.created_at.toString()))] = this.buildItem(item)
      }
      else{
        this.state.rows.unshift(this.buildItem(item))
      }
      this.state.downloads.set(item.key || item.created_at.toString(),item)
      this.debounceSetState({data: this.state.rows.slice(0)})
    })

    downloadReply((data,flag)=>{
      for(let item of data){
        item.fromDB = true
        const has = this.state.downloads.has(item.key)
        this.state.downloads.set(item.key ,item)
        if(has){
          this.state.rows[this.state.rows.findIndex(x=>x.id === item.key)] = this.buildItem(item)
        }
        else{
          this.state.rows.push(this.buildItem(item))
        }
      }
      this.debounceSetState({data: this.state.rows.slice(0)})
    })
    fetchDownload({})

    document.addEventListener('keydown',e=>{
      if(e.ctrlKey && e.key == 'a'){
        const ids = []
        for(let ele of document.querySelectorAll('virtual')){
          const key = ele.dataset.key
          ids.push(key)
          ele.parentNode.parentNode.classList.add('row-selected')
        }
        this.state.selectedIds = ids
        this.setState({})
      }
    })

  }

  componentWillUnmount() {
    ipc.removeListener("download-menu-reply",this.event)
  }

  onClick = (key,e,tr)=>{
    const rowIdx = this.state.rows.findIndex(x=>x.id === key)
    console.log(key,rowIdx,this.state.rows[rowIdx],e,tr)
    this.onRowClick(rowIdx,this.state.rows[rowIdx],e,tr)
  }

  onRowClick = (rowIdx, row, e, tr)=>{
    if(!e){
      return
    }
    if(!global.multiSelection && !e.ctrlKey && !e.shiftKey){
      this.clearSelect(1)
    }

    if(e.shiftKey && this.state.selectedIds.length){
      const prevId = this.state.selectedIds[this.state.selectedIds.length - 1]
      const prevInd = this.state.rows.findIndex(x=>x.id === prevId)
      const min = rowIdx == prevInd ? rowIdx : prevInd < rowIdx ? prevInd + 1 : rowIdx
      const max = rowIdx == prevInd ? rowIdx : prevInd < rowIdx ? rowIdx : prevInd - 1
      for(let i = min;i<=max;i++){
        const row = this.state.rows[i]
        const node = document.querySelector(`[data-key='${row.id}']`)
        if(!node) continue
        tr = node.parentNode.parentNode
        let ind = this.state.selectedIds.findIndex(r => r == row.id);
        if(ind == -1){
          this.state.selectedIds.push(row.id)
          tr.classList.add('row-selected')
        }
        else{
          this.state.selectedIds.splice(ind,1)
          tr.classList.remove('row-selected')
        }
      }
    }
    else{
      let ind = this.state.selectedIds.findIndex(r => r == row.id);
      if(ind == -1){
        this.state.selectedIds.push(row.id)
        tr.classList.add('row-selected')
      }
      else{
        this.state.selectedIds.splice(ind,1)
        tr.classList.remove('row-selected')
      }
    }
    console.log(this)
    this.setState({})
  }


  play(item){
    if(item.fromDB){
      ipc.send("download-retry", item.url, item.savePath, item.key)
    }
    else{
      ipc.send("download-pause", item)
    }
  }

  getMenuIcons = (props)=>{
    const item = props.value
    const arr = [<virtual data-key={props.original.id}></virtual>]
    if(!(item.state == "completed" || (item.state == "progressing" && !item.isPaused))){
      arr.push(<i onClick={_=>this.play(item)} className="fa fa-play-circle-o menu-item" aria-hidden="true"></i>)
    }
    if(item.state == "progressing" && !item.isPaused){
      arr.push(<i onClick={_=>ipc.send("download-pause",item)} className="fa fa-pause-circle-o menu-item" aria-hidden="true"></i>)
    }
    arr.push(<i onClick={_=>ipc.send("download-open-folder", item.savePath)} className="fa fa-folder-o menu-item" aria-hidden="true"></i>)
    if(item.state != "cancelled"){
      arr.push(<i onClick={_=>ipc.send("download-open",item)} className="fa fa-file-o menu-item" aria-hidden="true"></i>)
    }
    if(item.state != "completed" && item.state != "cancelled"){
      arr.push(<i onClick={_=>cancelItems([item])} className="fa fa-trash-o menu-item" aria-hidden="true"></i>)
    }
    arr.push(<i onClick={_=>this.downloaderRemove([item.key])} className="fa fa-times menu-item" aria-hidden="true"></i>)
    return arr
  }

  buildItem(item) {
    const rest = calcSpeed(item)
    const isProgress = item.state == "progressing" && !!rest.restTime

    return {
      id: item.key || item.created_at.toString(),
      created_at: item.created_at,
      menu: item,
      name: item.filename,
      size: item.totalBytes ? `${getAppropriateByteUnit(item.totalBytes).join(" ")}` : '-',
      progress: isProgress ? rest.percent : item.state == "completed" ? 100 : 0,
      est: isProgress ? `${getAppropriateTimeUnit(rest.restTime).join(" ")}` : '-',
      speed: isProgress ? `${item.speed ||getAppropriateByteUnit(rest.speed).join(" ")}/s` : '-',
      starttime: item.created_at ? formatDate(item.created_at) : '-',
      url: item.url
    }
  }

  afterSelect = (selectedTargets) =>{
    console.log('afterSelect',selectedTargets)
    if(selectedTargets.length == 0) return

    for(let ele of selectedTargets){
      const cl = ele.classList
      cl.remove('row-selected2')
      const v = ele.querySelector('virtual')
      if(v) {
        const key = v.dataset.key
        const ind = this.state.selectedIds.findIndex(x => x == key)
        if (ind == -1) {
          cl.add('row-selected')
          this.state.selectedIds.push(key)
        }
        else {
          cl.remove('row-selected')
          this.state.selectedIds.splice(ind, 1)
        }
      }
    }
    this.setState({selectedIds: this.state.selectedIds})
  }

  clearSelect = (noUpdate) =>{
    for(let ele of document.querySelectorAll('.row-selected')){
      ele.classList.remove('row-selected')
    }
    console.log('clearSelect')
    if(noUpdate !==  1)
      this.setState({selectedIds:[]})
  }

  getSelectedMap = ()=>{
    const map = {}
    for(let x of this.state.selectedIds){
      const item = this.state.downloads.get(x)
      map[x] = item
    }
    return map
  }

  async getVideoUrls(urls,callback){
    for(let url of urls){
      const key = Math.random().toString()
      new Promise((resolve,reject)=>{
        ipc.send('get-video-urls',key,url)
        ipc.once(`get-video-urls-reply_${key}`,(e,info)=>{
          if(!info) resolve()
          callback(info.url,info.filename)
        })
      })
    }
  }

  handleNewDownload = ()=>{
    showDialog({
      inputable: true, title: 'New Download',
      text: `Please enter URLs and save directory`,
      initValue: ["",""],
      option: ['textArea','dialog',void 0,'toggle'],
      needInput: ["URLs  (You can expand URLs. Example: file{a,b,c}.jpg , file{00..10}.png, file{0..4..2}.gif)",
        "Save Directory","FileName(Optional) (You can use tags (name/ext/base/sub/host/y/m/d/hh/mm/ss). Example: {name}_{y}.{ext})",
        'Attempt to find and download video']
    }).then(value => {
      console.log(7778,value)
      if (!value) return
      let urls = []
      const _urls = value[0].split(/\r?\n/)
      _urls.forEach(x=>urls.push(...expand(x)))

      const directory = value[1]
      const fname = value[2]
      const tryVideo = value[3]

      const func = (url,fname)=>{
        if(fname){
          ipc.send('set-save-path',url,path.join(directory,fname),true)
        }
        else{
          ipc.send('set-save-directory',url,directory)
        }
        setTimeout(_=>ipc.send('download-start',url),0)
      }

      if(tryVideo){
        this.getVideoUrls(urls,func)
      }
      else{
        for(let url of urls) func(url,fname)
      }
    })
  }

  handleStart = ()=>{
    for(let item of Object.values(this.getSelectedMap())){
      if(item.state == "completed" || (item.state == "progressing" && !item.isPaused)) continue
      if(item.fromDB){
        ipc.send("download-retry", item.url, item.savePath, item.key)
      }
      else{
        ipc.send("download-pause", item,'resume')
      }
    }
  }

  handlePause = ()=>{
    for(let item of Object.values(this.getSelectedMap())){
      if(item.state == "progressing" && !item.isPaused){
        ipc.send("download-pause",item,'pause')
      }
    }
  }

  handleCancel = ()=>{
    const items = []
    for(let item of Object.values(this.getSelectedMap())){
      if(item.state != "completed" && item.state != "cancelled"){
        items.push(item)
      }
    }
    if(items.length)cancelItems(items)
  }

  downloaderRemove = (keys)=>{
    for(let key of keys){
      this.state.downloads.delete(key)
      const ind = this.state.rows.findIndex(x=>x.id === key)
      this.state.rows.splice(ind,1)
    }
    ipc.send('remove-downloader',keys)
    this.setState({})
  }

  handleRemove = ()=>{
    const keys = []
    for(let item of Object.values(this.getSelectedMap())){
      keys.push(item.key)
    }
    this.downloaderRemove(keys)
  }

  handleRemoveAll = ()=>{
    const keys = []
    for(let [key,item] of this.state.downloads){
      if(item.state == "completed" || item.state == "cancelled"){
        keys.push(key)
      }
    }
    this.downloaderRemove(keys)
  }

  handleOpenFolder = ()=>{
    for(let item of Object.values(this.getSelectedMap())){
      ipc.send("download-open-folder", item.savePath)
    }
  }

  handleOpenFile = ()=>{
    for(let item of Object.values(this.getSelectedMap())){
      if(item.state != "cancelled") ipc.send("download-open",item)
    }
  }

  handleCopyPath = ()=>{
    ipc.send("set-clipboard",Object.values(this.getSelectedMap()).map(item=> item.savePath))
  }

  handleCopyUrl = ()=>{
    ipc.send("set-clipboard",Object.values(this.getSelectedMap()).map(item=> item.url))
  }

  onChange(type,e){
    if(type == 'concurrentDownload') concurrentDownload = e.target.value
    else if(type == 'downloadNum') downloadNum = e.target.value
    ipc.send('save-state',{tableName:'state',key:type,val:e.target.value})
  }

  onChangeMultiSelection(e){
    global.multiSelection = !global.multiSelection
    this.setState({})
  }

  render() {
    return  (
      <Selection ref="select" target=".rt-tr" selectedClass="row-selected2"
                 onClick={this.onClick} downloads={this.state.downloads} afterSelect={this.afterSelect} clearSelect={this.clearSelect}>
        <nav className="navbar navbar-light bg-faded">
          <form className="form-inline">
            <button onClick={_=>this.handleNewDownload()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="fa fa-plus-circle" aria-hidden="true"></i>New DL
            </button>
            <button onClick={_=>this.handleStart()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="fa fa-play-circle-o" aria-hidden="true"></i>Start
            </button>
            <button onClick={_=>this.handlePause()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="fa fa-pause-circle-o" aria-hidden="true"></i>Pause
            </button>
            <button onClick={_=>this.handleCancel()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="fa fa-trash-o" aria-hidden="true"></i>Cancel DL
            </button>
            <button onClick={_=>this.handleRemove()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="fa fa-times" aria-hidden="true"></i>Remove Row
            </button>
            <button onClick={_=>this.handleRemoveAll(true)} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="fa fa-window-close" aria-hidden="true"></i>Remove Finished
            </button>
            <button onClick={_=>this.handleOpenFolder()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="fa fa-folder-o" aria-hidden="true"></i>Show Folder
            </button>
            <button onClick={_=>this.handleOpenFile()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="fa fa-file-o" aria-hidden="true"></i>Open File
            </button>
            <button onClick={_=>this.handleCopyPath()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="fa fa-clipboard" aria-hidden="true"></i>Copy Path
            </button>
            <button onClick={_=>this.handleCopyUrl()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="fa fa-clipboard" aria-hidden="true"></i>Copy URL
            </button>

            <div className="form-check form-check-inline">
              <label className="form-check-label">
                <input className="form-check-input" type="checkbox" checked={global.multiSelection} onChange={::this.onChangeMultiSelection}/>Multiple Selection
              </label>
            </div>

          <div className="divider-vertical" />

            Concurrent downloads:
            <select className="form-control form-control-sm" onChange={this.onChange.bind(this,'concurrentDownload')}>
              {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(x=><option selected={concurrentDownload == x}value={x}>{x}</option>)}
            </select>
            Downloads per server:
            <select className="form-control form-control-sm" onChange={this.onChange.bind(this,'downloadNum')}>
              {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(x=><option selected={downloadNum == x} value={x}>{x}</option>)}
            </select>
          </form>
        </nav>
        <ReactTable
          pageSizeOptions={[30,100,250,500,1000]}
          defaultPageSize={100}
          data={this.state.rows.slice(0)}
          defaultFilterMethod={(filter, row, column) => {
            const id = filter.pivotId || filter.id
            return row[id] !== undefined ? String(row[id]).includes(filter.value) : true
          }}
          // onFetchData={this.fetchData}
          columns={this.columns}
          onPageChange={(pageIndex)=>this.clearSelect()}
          onFilteredChange={(column, value) => {this.clearSelect()}}
        />
      </Selection>);
  }
}
require('./themeForPage')('themeDownloader')

ReactDOM.render(<Downloader/>,  document.getElementById('app'))