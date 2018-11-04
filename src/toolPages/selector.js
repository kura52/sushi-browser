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

const l10n = require('../../brave/js/l10n')
l10n.init()

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

const REG_LIST = [
  ['Images (jpg, png, …)', /\.(?:jp(?:e?g|e|2)|gif|png|tiff?|bmp|ico)$/i],
  ['GIF', /\.gif$/i],
  ['JPEG', /\.jp(e?g|e|2)$/i],
  ['PNG', /\.png$/i],
  ['Videos (mpeg, avi, …)', /\.(?:mpeg|ra?m|avi|mp(?:g|e|4)|mov|divx|asf|qt|wmv|m\dv|rv|vob|asx|ogm|ogv|webm|flv|mkv)$/i],
  ['Audio (mp3, wav, …)', /\.(?:mp3|wav|og(?:g|a)|flac|midi?|rm|aac|wma|mka|ape)$/i],
  ['Archives (zip, …)', /\.(?:z(?:ip|[0-9]{2})|r(?:ar|[0-9]{2})|jar|bz2|gz|tar|rpm|7z(?:ip)?|lzma|xz)$/i],
  ['Software (exe, …)', /\.(?:exe|msi|dmg|bin|xpi|iso)$/i],
  ['Documents (pdf, …)', /\.(?:pdf|xlsx?|docx?|odf|odt|rtf)$/i]
]

const CONT_REG_LIST = [
  ['Audio (mp3, wav, …)', /^audio/],
  ['Documents (pdf, …)', /\.(?:pdf|xlsx?|docx?|odf|odt|rtf)$/i],
  ['Images (jpg, png, …)', /(?:jp(?:e?g|e|2)|gif|png|tiff?|bmp|ico)$/],
  ['GIF', /gif$/],
  ['JPEG', /\jp(e?g|e|2)$/],
  ['PNG', /png$/],
  ['Videos (mpeg, avi, …)', /^video/]
]

function showDialog(input,id){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('show-dialog-exploler',key,input,id)
    ipc.once(`show-dialog-exploler-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function getUrlVars(){
  var vars = {};
  var param = location.search.substring(1).split('&');
  for(var i = 0; i < param.length; i++) {
    var keySearch = param[i].search(/=/);
    var key = '';
    if(keySearch != -1) key = param[i].slice(0, keySearch);
    var val = param[i].slice(param[i].indexOf('=', 0) + 1);
    if(key != '') vars[key] = decodeURIComponent(val);
  }
  return vars;
}

function eachSlice(arr,size){
  const newArray = []
  for (let i = 0, l = arr.length; i < l; i += size){
    newArray.push(arr.slice(i, i + size))
  }
  return newArray
}

global.multiSelection = true
class Selector extends React.Component {
  static defaultProps = { rowKey: 'id' };

  constructor(props,context) {
    super(props,context);
    this.columns = [
      { accessor: 'id', Header: 'id', Cell: props=>([<virtual data-key={props.value}></virtual>,props.value]), resizable: true, minWidth: 5,maxWidth: 40},
      { accessor: 'url', Header: 'URL', resizable: true, sortable: true, filterable:true, minWidth: 30 },
      { accessor: 'description', Header: 'Description', resizable: true, sortable: true, filterable:true, minWidth: 20}
    ]

    const data = JSON.parse(getUrlVars().data)
    this.links = data.links
    this.type = 'link'
    this.resources = data.resources
    this.checkLists = new Map()
    this.filters = []

    this.state = {selectedIds: []}
    this.state.rows = this.buildLinks()
  }

  buildLinks(){
    this.state.downloads = new Map()
    return this.links.map(([url,description],num)=>{
      const types = []
      for(let [name,reg] of REG_LIST){
        if(url.match(reg)) types.push(name)
      }
      const item =  {id: (num+1).toString(), url, description, types}
      this.state.downloads.set(item.id,item)
      return item
    })
  }

  buildResource(){
    this.state.downloads = new Map()
    const ret = []
    let num = 0
    for(let [url,data] of Object.entries(this.resources)){
      let contType,description
      if(Array.isArray(data)){
        description = data[0]
        contType = data[1]
      }
      else{
        contType = data
      }
      const types = []
      for(let [name,reg] of REG_LIST){
        if(url.match(reg)) types.push(name)
      }
      if(!types.length && contType){
        for(let [name,reg] of CONT_REG_LIST){
          if(contType.match(reg)) types.push(name)
        }
      }
      const item = {id: (++num).toString(), url, description, types}
      ret.push(item)
      this.state.downloads.set(item.id,item)
    }
    return ret
  }

  componentDidMount(){
    document.querySelector('.rt-tbody').style.height = `calc(100vh - 106px - ${document.querySelector('.navbar').offsetHeight}px)`
    window.addEventListener('resize',_=>{
      document.querySelector('.rt-tbody').style.height = `calc(100vh - 106px - ${document.querySelector('.navbar').offsetHeight}px)`
    });
    this.event = (e,name)=>{
      if(name == 'Copy URL'){
        this.handleCopyUrl()
      }
    }
    ipc.on('download-menu-reply', this.event)


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
      map[item.id] = item
    }
    return map
  }

  async getVideoUrls(urls,callback){
    for(let urlList of eachSlice(urls,4)){
      const promises = []
      for(let url of urlList){
        const key = Math.random().toString()
        promises.push(new Promise((resolve,reject)=>{
          ipc.send('get-video-urls',key,url)
          ipc.once(`get-video-urls-reply_${key}`,(e,info)=>{
            if(info) callback(info.url,info.filename)
            resolve()
          })
        }))
      }
      await Promise.all(promises)
    }
  }

  handleNewDownload = (urls)=>{
    showDialog({
      inputable: true, title: 'New Download',
      text: `Please enter URLs and save directory`,
      initValue: [urls.join("\n"),""],
      option: ['textArea','dialog',void 0,'toggle'],
      needInput: ["URLs","Save Directory","FileName(Optional)",'Attempt to find and download video (Using youtube-dl)']
    }).then(value => {
      console.log(7778,value)
      if (!value) return
      const urls = value[0].split(/\r?\n/)
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
      ipc.send('send-to-host', "open-tab",'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/download.html',true)
    })
  }

  handleCopyUrl = ()=>{
    ipc.send("set-clipboard",Object.values(this.getSelectedMap()).map(item=> item.url))
  }

  handleStart = (type)=>{
    let items
    if(type == 'all'){
      let rows = this.state.rows
      for(let {id,value} of this.filters){
        if(value){
          rows = this.state.rows.filter(x=>x[id].includes(value))
        }
      }
      items = rows
    }
    else{
      items = Object.values(this.getSelectedMap())
    }
    const urls = items.map(x=>x.url)
    this.handleNewDownload(urls)
  }

  switchDisplay = (type)=>{
    if(this.type == type) return

    this.type = type
    this.checkLists = new Map()
    if(type == 'link'){
      this.clearSelect(1)
      this.setState({rows: this.buildLinks()})
    }
    else{
      this.clearSelect(1)
      this.setState({rows: this.buildResource()})
    }
  }

  onChange(name,reg){
    if(this.checkLists.has(name)){
      this.checkLists.delete(name)
    }
    else{
      this.checkLists.set(name,reg)
    }

    const newRows = []
    if(!this.checkLists.size){
      for(let row of this.state.downloads.values()){
        newRows.push(row)
      }
      this.setState({rows:newRows})
      return
    }
    for(let row of this.state.downloads.values()){
      for(let v of this.checkLists.values()){
        if(row.url.match(v)){
          newRows.push(row)
          break
        }
      }
    }
    this.setState({rows:newRows})
  }

  onChangeMultiSelection(e){
    global.multiSelection = !global.multiSelection
    this.setState({})
  }

  buildCheckList(){
    const ret = []
    for(let [name,reg] of REG_LIST){
      const ele = <div>
        <div className="form-check form-check-inline">
          <label className="form-check-label">
            <input className="form-check-input" type="checkbox" onChange={this.onChange.bind(this,name,reg)}/>{name}
          </label>
        </div>
      </div>
      ret.push(ele)
    }
    return ret
  }

  render() {
    return  (
      <Selection ref="select" target=".rt-tr" selectedClass="row-selected2"
                 onClick={this.onClick} downloads={this.state.downloads} afterSelect={this.afterSelect} clearSelect={this.clearSelect}>
        <nav className="navbar navbar-light bg-faded">
          <form className="form-inline">
            <button onClick={_=>this.handleStart()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="fa fa-play-circle-o" aria-hidden="true"></i>{l10n.translation('downloadSelection')}
            </button>
            <button onClick={_=>this.handleStart('all')} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="fa fa-play-circle-o" aria-hidden="true"></i>{l10n.translation('downloadAll')}
            </button>

            <div className="divider-vertical" />

            <div className="btn-group" role="group">
              <button style={{marginRight: 0}} onClick={_=>this.switchDisplay('link')} className={`btn btn-sm align-middle btn-outline-secondary${this.type == 'link' ? ' active' : ''}`} type="button">
                <i className="fa fa-link" aria-hidden="true"></i>Links({this.links.length})
              </button>
              <button onClick={_=>this.switchDisplay('resource')} className={`btn btn-sm align-middle btn-outline-secondary${this.type == 'resource' ? ' active' : ''}`} type="button">
                <i className="fa fa-file-image-o" aria-hidden="true"></i>Images and Medias({Object.keys(this.resources).length})
              </button>
            </div>

            <div>
              <div className="form-check form-check-inline">
                <label className="form-check-label">
                  <input className="form-check-input" type="checkbox" checked={global.multiSelection} onChange={::this.onChangeMultiSelection}/>Multiple Selection
                </label>
              </div>
            </div>

            <div className="divider-vertical" />

            {this.buildCheckList()}
          </form>
        </nav>
        <ReactTable
          pageSizeOptions={[30,100,250,500,1000]}
          defaultPageSize={500}
          data={this.state.rows.slice(0)}
          defaultFilterMethod={(filter, row, column) => {
            const id = filter.pivotId || filter.id
            return row[id] !== undefined ? String(row[id]).includes(filter.value) : true
          }}
          defaultSortMethod
          // onFetchData={this.fetchData}
          columns={this.columns}
          onPageChange={(pageIndex)=>this.clearSelect()}
          onFilteredChange={(column, value) => {
            this.clearSelect()
            this.filters = column
          }}
        />
      </Selection>);
  }
}

ReactDOM.render(<Selector/>,  document.getElementById('app'))