window.debug = require('debug')('info')
// require('debug').enable("info")
import process from './process'
import {ipcRenderer as ipc} from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import uuid from 'node-uuid';
import Selection from '../render/react-selection/indexTable'
import path from 'path';

import ReactTable from 'react-table'


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

function cancelItem(item){
  showDialog({
    normal: true,
    title: 'Confirm',
    text: 'Are you sure you want to delete the following files?',
    buttons:['Yes','No']
  }).then(value => {
    console.log(value)
    // ipc.send("download-cancel", item)
  })
}

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

function calcSpeed(item){
  const diff =item.now - item.created_at
  const percent = round(item.receivedBytes / item.totalBytes * 100,1)
  const speed = item.receivedBytes / diff * 1000
  const restTime = (item.totalBytes - item.receivedBytes) / speed

  return {diff,percent,speed,restTime}
}


function formatDate(longDate) {
  const date = new Date(longDate)
  return `${date.getFullYear()}/${('0' + (date.getMonth() + 1)).slice(-2)}/${('0' + date.getDate()).slice(-2)} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`
}

function chunkArray(a,size){
  const arrays = []
  while(a.length > 0) arrays.push(a.splice(0, size))
  return arrays
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

class Downloader extends React.Component {
  static defaultProps = { rowKey: 'id' };

  constructor(props,context) {
    super(props,context);
    this.columns = [
      { accessor: 'menu', Header: 'Menu', Cell: this.getMenuIcons, resizable: true, minWidth: 20, maxWidth: 85 },
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
      console.log(item,item.startTime,this.state.rows.findIndex(x=>x.id === item.created_at))
      if(this.state.downloads.has(item.created_at)){
        this.state.rows[this.state.rows.findIndex(x=>x.id === item.created_at)] = this.buildItem(item)
      }
      else{
        this.state.rows.unshift(this.buildItem(item))
      }
      this.state.downloads.set(item.created_at,item)
      this.setState({})
    })

    downloadReply((data,flag)=>{
      let num = 0
      for(let item of data){
        const has = this.state.downloads.has(item.created_at)
        if(!has || num<1000){
          this.state.downloads.set(item.created_at,item)
          if(has){
            this.state.rows[this.state.rows.findIndex(x=>x.id === item.created_at)] = this.buildItem(item)
          }
          else{
            this.state.rows.push(this.buildItem(item))
          }
          num++
        }
      }
      this.setState({data: this.state.rows.slice(0)})
    })
    fetchDownload({})

    document.addEventListener('keydown',e=>{
      if(e.ctrlKey && e.key == 'a'){
        const ids = []
        for(let ele of document.querySelectorAll('virtual')){
          const key = parseInt(ele.dataset.key)
          ids.push(key)
          ele.parentNode.parentNode.classList.add('row-selected')
        }
        this.state.selectedIds = ids
      }
      this.setState({})
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
    if(!e.ctrlKey && !e.shiftKey){
      this.clearSelect(1)
    }

    if(e.shiftKey && this.state.selectedIds.length){
      const prevId = this.state.selectedIds[this.state.selectedIds.length - 1]
      const prevInd = this.state.rows.findIndex(x=>x.id === prevId)
      const min = rowIdx == prevInd ? rowIdx : prevInd < rowIdx ? prevInd + 1 : rowIdx
      const max = rowIdx == prevInd ? rowIdx : prevInd < rowIdx ? rowIdx : prevInd - 1
      for(let i = min;i<=max;i++){
        const row = this.state.rows[i]
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
    if(item.state == "cancelled"){
      ipc.send("download-retry", item.url, item.savePath) //元アイテムを消す
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
      arr.push(<i onClick={_=>cancelItem(item)} className="fa fa-trash-o menu-item" aria-hidden="true"></i>)
    }
    return arr
  }

  buildItem(item) {
    const rest = calcSpeed(item)
    const isProgress = item.state == "progressing" && !!rest.restTime

    return {
      id: item.created_at,
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
        const key = parseInt(v.dataset.key)
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
      map[item.savePath] = item
    }
    return map
  }

  async getVideoUrls(urls,callback){
    const arrays = chunkArray(urls,5)
    for(let chunkUrls of arrays){

    }
  }

  handleNewDownload = ()=>{
    showDialog({
      inputable: true, title: 'New Download',
      text: `Please enter URLs and save directory`,
      initValue: ["",""],
      option: ['textArea','dialog',void 0,'toggle'],
      needInput: ["URLs","Save Directory","FileName(Optional)",'Attempt to download video']
    }).then(value => {
      console.log(7778,value)
      if (!value) return
      const urls = value[0].split(/\r?\n/)
      const directroy = value[1]
      const fname = value[2]
      const tryVideo = value[3]

      const func = urls=>{
        let i = 0
        for(let url of urls){
          if(fname){
            ipc.send('set-save-path',url,path.join(directroy,fname),true)
          }
          else{
            ipc.send('set-save-directory',url,directroy)
          }
          setTimeout(_=>ipc.send('download-start',url),50*i++)
        }
      }
      if(tryVideo){
        this.getVideoUrls(urls,func)
      }
      else{
        func(urls)
      }
    })
  }

  handleStart = ()=>{
    for(let item of Object.values(this.getSelectedMap())){
      if(item.state == "completed" || (item.state == "progressing" && !item.isPaused)) continue
      if(item.state == "cancelled"){
        ipc.send("download-retry", item.url, item.savePath) //元アイテムを消す
      }
      else{
        ipc.send("download-pause", item)
      }
    }
  }

  handlePause = ()=>{
    for(let item of Object.values(this.getSelectedMap())){
      if(item.state == "progressing" && !item.isPaused){
        ipc.send("download-pause",item)
      }
    }
  }

  handleCancel = ()=>{
    for(let item of Object.values(this.getSelectedMap())){
      if(item.state != "completed" && item.state != "cancelled"){
        cancelItem(item)
      }
    }
  }

  handleOpenFolder = ()=>{
    for(let path of Object.keys(this.getSelectedMap())){
      ipc.send("download-open-folder", path)
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
            <button className="btn btn-sm align-middle btn-outline-secondary" type="button">
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
            Concurrent downloads:
            <select className="form-control form-control-sm">
              {['-',1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(x=><option>{x}</option>)}
            </select>
            Downloads per server:
            <select className="form-control form-control-sm">
              {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(x=><option>{x}</option>)}
            </select>
          </form>
        </nav>
        <ReactTable
          pageSizeOptions={[30,100,250,500,1000]}
          defaultPageSize={100}
          data={this.state.rows.slice(0)}
          // onFetchData={this.fetchData}
          columns={this.columns}
        />
      </Selection>);
  }
}

ReactDOM.render(<Downloader/>,  document.getElementById('app'))