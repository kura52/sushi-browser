window.debug = require('debug')('info')
// require('debug').enable("info")
import process from './process'
import {ipcRenderer as ipc} from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import uuid from 'node-uuid';
import Selection from '../render/react-selection/indexTable'
import path from 'path';
const PubSub = require('pubsub-js')

import ReactTable from 'react-table'

const {  Form, TextArea, Grid, Sidebar, Segment, Container, Menu, Input, Divider, Button, Checkbox, Icon, Table, Dropdown } = require('semantic-ui-react');
const { StickyContainer, Sticky } = require('react-sticky');
const l10n = require('../../brave/js/l10n')
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'
l10n.init()


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
      { accessor: 'url', Header: 'URL', resizable: true, sortable: true,  minWidth: 30 },
      { accessor: 'description', Header: 'Description', resizable: true, sortable: true, minWidth: 20}
    ]

    const data = {links:[],resources:[]} //JSON.parse(getUrlVars().data)
    this.links = data.links
    this.type = 'link'
    this.resources = data.resources
    this.checkLists = new Map()

    this.state = {selectedIds: []}
    this.state.rows = this.buildLinks()
  }

  buildLinks(){
    this.state.downloads = new Map()
    return []
    // return this.links.map(([url,description],num)=>{
    //   const types = []
    //   for(let [name,reg] of REG_LIST){
    //     if(url.match(reg)) types.push(name)
    //   }
    //   const item =  {id: (num+1).toString(), url, description, types}
    //   this.state.downloads.set(item.id,item)
    //   return item
    // })
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

  handleOpen = _=>{
    const key = Math.random().toString()
    ipc.send('show-dialog-exploler',key,{defaultPath:defaultData.defaultDownloadPath,needVideo:true})
    ipc.once(`show-dialog-exploler-reply_${key}`,(event,ret)=>{
      this.setState({filePath:ret})

      const key = uuid.v4()
      ipc.send('handbrake-scan',key,ret)
      ipc.once(`handbrake-scan-reply_${key}`,(e,results)=>{
        PubSub.publish('add-files',{files:ret,results})
      })

    })
  }
  handleCopyUrl = ()=>{
    ipc.send("set-clipboard",Object.values(this.getSelectedMap()).map(item=> item.url))
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
    // for(let [name,reg] of REG_LIST){
    //   const ele = <div>
    //     <div className="form-check form-check-inline">
    //       <label className="form-check-label">
    //         <input className="form-check-input" type="checkbox" onChange={this.onChange.bind(this,name,reg)}/>{name}
    //       </label>
    //     </div>
    //   </div>
    //   ret.push(ele)
    // }
    return ret
  }

  render() {
    return  (
      <Selection ref="select" target=".rt-tr" selectedClass="row-selected2"
                 onClick={this.onClick} downloads={this.state.downloads} afterSelect={this.afterSelect} clearSelect={this.clearSelect}>
        <nav className="navbar navbar-light bg-faded">
          <form className="form-inline">
            <button onClick={_=>this.handleOpen()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i aria-hidden="true" className="folder open icon"></i>Open
            </button>

            <div className="divider-vertical" />

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
          defaultPageSize={100}
          data={this.state.rows.slice(0)}
          defaultSortMethod
          // onFetchData={this.fetchData}
          columns={this.columns}
          onPageChange={(pageIndex)=>this.clearSelect()}
        />
      </Selection>);
  }
}

let defaultData
class Converter extends React.Component {
  constructor(props) {
    super(props)
    this.state = defaultData
    this.state.videos = {}

    PubSub.subscribe('add-files',(e,{files,results})=>{
      files.forEach((file,i)=>{
        this.handleFile(file,results[i],i==0)
      })
    })
  }

  handleFile(file,result,setState){
    let match,duration,encode,width,height,par,dar,fps
    if(match = result.match(/Duration: (.+?),/)) duration = match[1].slice(0,8)
    if(match = result.match(/Stream .+?: Video: (.+?) \[/)) encode = match[1]
    if(match = result.match(/(\d+)x(\d+) \[PAR (\d+):(\d+) DAR (.+?):(.+?)\], (\d+) kb\/s/)){
      width = match[1]
      height = match[2]
      par = [match[3],match[4]]
      dar = [match[5],match[6]]
    }
    if(match = result.match(/([\d\.]+) fps,/)) fps = match[1]

    const audios = []
    for(let result2 of result.split(/Stream .+?: Audio: /)){
      let codec,hz,stereo,bitrate
      if(match = result2.match(/^(.+?) \[/)) codec = match[1]
      if(!codec) continue
      if(match = result2.match(/(\d+) Hz, (.+?),.+?(\d+) kb\/s/)){
        hz = match[1]
        stereo = match[2]
        bitrate = match[3]
      }
      audios.push({codec,hz,stereo,bitrate})
    }
    const video = {video:{duration,encode,width,height,par,dar,fps},audios}
    this.state.videos[file] = video
    if(setState){
      this.setState({active:file})
    }
    console.log(video)
  }

  render() {
    const state = this.state.videos[this.state.active] || {video:{},audios:[]}
    return <div>
      <Divider/>

      <div className="field">
        <label>Cut:&nbsp;</label>
        <div className="ui input">
          <input type="time" min="00:00:00" max={state.video.duration} value="00:00:00" step="1"/>
        </div>
        &nbsp;〜&nbsp;
        <div className="ui input">
          <input type="time" min="00:00:00" max={state.video.duration} value={state.video.duration} step="1"/>
        </div>
      </div>


    </div>
  }
}

const App = () => (
  <div className="main">
    <div className="cont">
      <Selector/>
      <Converter/>
    </div>
    <div className="side1">
    </div>
  </div>
)


ipc.send("get-main-state",['defaultDownloadPath'])
ipc.once("get-main-state-reply",(e,data)=>{
  defaultData = data
  ReactDOM.render(<App />,  document.getElementById('app'))
})