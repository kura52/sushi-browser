window.debug = require('debug')('info')
// require('debug').enable("info")
import {ipcRenderer as ipc} from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import uuid from 'node-uuid';
import Selection from '../render/react-selection/indexTable';
import ReactTable from 'react-table';
import presets from './videoPreset';
import path from 'path';
const isWin = navigator.userAgent.includes('Windows')


const PubSub = require('pubsub-js')

const { Form, TextArea, Grid, Sidebar, Segment, Container, Menu, Input, Divider, Button, Checkbox, Icon, Table, Dropdown } = require('semantic-ui-react');
const { StickyContainer, Sticky } = require('react-sticky');
const l10n = require('../../brave/js/l10n')
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'
l10n.init()

function aspect(width, height) {
  if(!width || !height) return [1,1]

  let r,m = width,n = height
  if(m < n) {
    r = m
    m = n
    n = r
  }
  while ((r = m % n) != 0) {
    m = n
    n = r
  }
  return [width/n,height/n];
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

function equalArray(a,b){
  const len = a.length
  if(len != b.length) return false
  for(let i=0;i<len;i++){
    if(a[i] !== b[i]) return false
  }
  return true
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

global.multiSelection = false
class Selector extends React.Component {
  static defaultProps = { rowKey: 'id' };

  constructor(props,context) {
    super(props,context);
    this.columns = [
      { accessor: 'id', Header: 'No', resizable: true, minWidth: 10, maxWidth: 40 },
      { accessor: 'menu', Header: 'Menu', Cell: this.getMenuIcons, resizable: true, minWidth: 10, maxWidth: 52 },
      { accessor: 'file', Header: 'File', resizable: true, sortable: true, minWidth: 40, maxWidth: 800 },
      { accessor: 'progress', Header: 'Progress', Cell: PercentCompleteFormatter, minWidth: 10, maxWidth:150 },
      { accessor: 'msg', Header: 'Info', minWidth: 10, maxWidth:300 },
    ]

    const data = {links:[],resources:[]} //JSON.parse(getUrlVars().data)
    this.links = data.links
    this.type = 'link'
    this.resources = data.resources
    this.checkLists = new Map()

    this.state = {selectedIds: []}
    this.state.rows = []
    this.selectedIds = []
  }

  getMenuIcons = (props)=>{
    const row = props.value
    const arr = [<virtual data-key={props.original.id}></virtual>]

    const state = this.getFiles()

    if(row.status == 'converting'){
      if(!isWin) arr.push(<i onClick={_=>this.props.parent.handlePause([row.file])} className="pause icon menu-item" aria-hidden="true"></i>)
      arr.push(<i onClick={_=>this.props.parent.handleStop([row.file])} className="stop icon menu-item" aria-hidden="true"></i>)
    }
    else if(row.status == 'paused'){
      arr.push(<i onClick={_=>this.props.parent.handleStart([row.file])} className="play icon menu-item" aria-hidden="true"></i>)
      arr.push(<i onClick={_=>this.props.parent.handleStop([row.file])} className="stop icon menu-item" aria-hidden="true"></i>)
    }
    else{
      arr.push(<i onClick={_=>this.props.parent.handleStart([row.file])} className="play icon menu-item" aria-hidden="true"></i>)
      arr.push(<i onClick={_=>this.props.parent.handleRemove([row.file])} className="remove icon menu-item" aria-hidden="true"></i>)
    }

    // if(!(item.state == "completed" || (item.state == "progressing" && !item.isPaused))){
    //   arr.push(<i onClick={_=>this.play(item)} className="fa fa-play-circle-o menu-item" aria-hidden="true"></i>)
    // }
    // if(item.state == "progressing" && !item.isPaused){
    //   arr.push(<i onClick={_=>ipc.send("download-pause",item)} className="fa fa-pause-circle-o menu-item" aria-hidden="true"></i>)
    // }
    // arr.push(<i onClick={_=>ipc.send("download-open-folder", item.savePath)} className="fa fa-folder-o menu-item" aria-hidden="true"></i>)
    // if(item.state != "cancelled"){
    //   arr.push(<i onClick={_=>ipc.send("download-open",item)} className="fa fa-file-o menu-item" aria-hidden="true"></i>)
    // }
    // if(item.state != "completed" && item.state != "cancelled"){
    //   arr.push(<i onClick={_=>cancelItems([item])} className="fa fa-trash-o menu-item" aria-hidden="true"></i>)
    // }
    // arr.push(<i onClick={_=>this.downloaderRemove([item.key])} className="fa fa-times menu-item" aria-hidden="true"></i>)
    return arr
  }

  componentDidMount(){
    document.querySelector('.rt-tbody').style.height = `calc(100vh - 106px - ${document.querySelector('.navbar').offsetHeight}px)`
    window.addEventListener('resize',_=>{
      document.querySelector('.rt-tbody').style.height = `calc(100vh - 106px - ${document.querySelector('.navbar').offsetHeight}px)`
    });


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

    const params = getUrlVars()
    if(params.data){
      const {path,info} = JSON.parse(params.data)
      this.handleSelectedFile({},[path]).then(_=>{
        if(Array.isArray(info)){
          this.props.parent.state.activeTab = 'Audio'
          this.props.parent.handleChangeRadio({},'audioExtract',true)
          this.props.parent.handleAudioChange2({},'AudioEncoder',{value:info[0]})
          this.props.parent.handleAudioChange2({},'AudioBitrate',{value:info[1]})
          this.props.parent.handleStart([path])
        }
        else{
          this.props.parent.changePreset(info)
          this.props.parent.handleStart([path])
        }
      })
    }
  }

  componentDidUpdate(prevProps, prevState){
    if(this.state.selectedIds.length && !equalArray(this.selectedIds,this.state.selectedIds)){
      this.props.parent.setState({actives: this.state.selectedIds.map(id=> this.state.rows.find(x=>x.id === id).file)})
      this.selectedIds = this.state.selectedIds.slice(0)
    }
  }

  onClick = (key,e,tr)=>{
    const rowIdx = this.state.rows.findIndex(x=>x.id === key)
    console.log(rowIdx,key,e,tr)
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
        let ind = this.state.selectedIds.findIndex(r => r == row.id)
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
      let ind = this.state.selectedIds.findIndex(r => r == row.id)
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

  // getSelectedMap = ()=>{
  //   const map = {}
  //   for(let x of this.state.selectedIds){
  //     const item = this.state.downloads.get(x)
  //     map[item.id] = item
  //   }
  //   return map
  // }
  //

  handleSelectedFile = (event,ret)=>{
    this.setState({filePath:ret})

    const key = uuid.v4()
    ipc.send('ffmpeg-scan',key,ret)
    return new Promise(resolve=>{
      ipc.once(`ffmpeg-scan-reply_${key}`,(e,results)=>{
        const firstId = Math.max(0,...this.state.rows.map(x=>parseInt(x.id))) + 1
        let i = firstId
        for(let file of ret){
          if(this.state.rows.find(r=>r.file == file)) continue
          const row = {id:(i++).toString(),file,progress:0,status:'not-start'}
          row.menu = row
          this.state.rows.push(row)
        }
        this.props.addFiles(ret, results)

        this.clearSelect()
        const ele = document.querySelector(`[data-key='${firstId}']`)
        const key = ele.dataset.key
        ele.parentNode.parentNode.classList.add('row-selected')
        this.setState({selectedIds: [firstId.toString()]})
        resolve()
      })
    })
  }

  handleOpen = _=>{
    const key = Math.random().toString()
    ipc.send('show-dialog-exploler',key,{defaultPath:defaultData.defaultDownloadPath,needVideo:true})
    ipc.once(`show-dialog-exploler-reply_${key}`,this.handleSelectedFile)
  }
  // handleCopyUrl = ()=>{
  //   ipc.send("set-clipboard",Object.values(this.getSelectedMap()).map(item=> item.url))
  // }

  onChangeMultiSelection(e){
    global.multiSelection = !global.multiSelection
    this.setState({})
  }

  getFiles(){
    return this.props.parent.state.actives
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

            <button onClick={_=>this.props.parent.handleStart(this.getFiles())} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="play icon" aria-hidden="true"></i>Start
            </button>

            {isWin ? null : <button onClick={_=>this.props.parent.handlePause(this.getFiles())} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="pause icon" aria-hidden="true"></i>Pause
            </button>}

            <button onClick={_=>this.props.parent.handleStop(this.getFiles())} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="stop icon" aria-hidden="true"></i>Stop
            </button>


            <button onClick={_=>this.props.parent.handleRemove(this.getFiles())} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="remove icon" aria-hidden="true"></i>Remove Row
            </button>

            <button onClick={_=>this.props.parent.handleRemoveAll()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="remove circle icon" aria-hidden="true"></i>Remove Finished
            </button>

            <div className="divider-vertical" />

            <div>
              <div className="form-check form-check-inline">
                <label className="form-check-label">
                  <input className="form-check-input" type="checkbox" checked={global.multiSelection} onChange={::this.onChangeMultiSelection}/>Multiple Selection
                </label>
              </div>
            </div>
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

function findPreset(preset){
  for(let arr of presets){
    const val = arr.ChildrenArray.find(x=>x.PresetName == preset)
    if(val) return val
  }
}



let defaultData
class Converter extends React.Component {
  constructor(props) {
    super(props)

    this.tabs = {
      Picture: ::this.renderPicture,
      Filters: ::this.renderFilters,
      Video: ::this.renderVideo,
      Audio: ::this.renderAudio
    }

    this.state = defaultData
    this.state.activeTab = 'Picture'
    this.state.videos = {}
    this.state.actives = []
    this.key = uuid.v4()

    this.selectChange = ::this.selectChange


    const handbrakeProgress = (e,val)=>{
      console.log(val)
      const state = this.refs.selector.state.rows.find(r=>r.file == val.file)
      if(val.pause){
        state.status = 'paused'
        this.refs.selector.setState({})
        return
      }

      state.progress = val.progress
      state.msg = val.msg
      state.status = 'converting'
      if(parseInt(state.progress) == 100){
        state.status = 'finished'
      }
      this.refs.selector.setState({})
    }
    ipc.on(`handbrake-progress_${this.key}`,handbrakeProgress)
  }

  addFiles(files,results){
    files.forEach((file,i)=>{
      this.handleFile(file,results[i],i==0)
    })
  }

  handleFile(file,result,setState){
    console.log(file,result)
    let match,duration,encode,width,height,fps,bitrate
    if(match = result.match(/  Duration: ([\d:]+).+?bitrate: (\d+) kb\/s/)){
      duration = match[1]
      bitrate = match[2]
    }

    if(match = result.match(/Video: (.+?), .+?(\d+)x(\d+).+?([\d\.a-z]+) fps/)){
      encode = match[1].split("(").slice(0,2).join("(")
      width = match[2]
      height = match[3]
      fps = match[4]
    }

    const audios = []
    for(let result2 of result.match(/Stream .+?: Audio:.+/g)){
      let codec,hz,stereo,bitrate
      if(match = result2.match(/Audio: (.+?), (\d+) Hz, (.+?),(.+)/)){
        codec = match[1].split("(").slice(0,2).join("(")
        hz = match[2]
        stereo = match[3]
        if(match[4] && (match = match[4].match(/(\d+) kb\/s/))) bitrate = match[1]
      }
      audios.push({codec,hz,stereo,bitrate})
    }

    const preset = findPreset(defaultData.defaultVideoPreset)
    preset.PictureKeepRatio = true

    if(preset.PictureKeepRatio){
      const ar = aspect(width,height)
      preset.PictureWidth =  Math.round(preset.PictureHeight / ar[1] * ar[0])
    }

    preset.destination = path.dirname(file)
    preset.fileName = `{name}_convert.{ext}`

    const video = {video:{file,duration,encode,width,height,fps,bitrate},audios,out:preset} //playing,finished
    this.state.videos[file] = video
    if(setState){
      this.setState({actives:[file]})
    }
    console.log(video)
  }

  handleStart(files){
    const videos = this.getVideos(files)

    ipc.send('handbrake-start',this.key,videos)
  }

  handlePause(files){
    const key = uuid.v4()
    const videos = this.getVideos(files)
    ipc.send('handbrake-pause',key,videos)
  }

  handleStop(files){
    const key = uuid.v4()
    const videos = this.getVideos(files)
    ipc.send('handbrake-stop',key,videos)
  }

  handleRemove(files){
    const key = uuid.v4()
    const set = new Set()
    for(let file of files){
      delete this.state.videos[file]
      set.add(file)
    }
    this.refs.selector.state.rows = this.refs.selector.state.rows.filter(r=>!set.has(r.file) || r.status == 'converting' || r.status == 'paused')
    this.refs.selector.setState({})
  }

  handleRemoveAll(){
    const files = this.refs.selector.state.rows.filter(r=>r.status == 'finished').map(r=>r.file)
    this.handleRemove(files)
  }

  makeValues(...items){
    return items.map(item=>({text:item, value:item}))
  }

  makeValues2(...items){
    return items.map(item=>({text:item[0], value:item[1]}))
  }

  makeValues3(...items){
    return items.map(item=>(Array.isArray(item) ? {text:item[0], value:item[1]} : {text:item, value:item.toLowerCase().replace(/ /g,"")}))
  }

  selectChange(e){
    if(e.target.tagName == 'A') this.setState({activeTab: e.target.text})
  }

  tabClass(item){
    return this.state.activeTab == item ? 'active item' : 'item'
  }


  getVideos(files){
    return files.map(file=>(this.state.videos[file] || {video:{},audios:[],out:{}}))
  }

  getActiveVideos(){
    return this.state.actives.map(active=>(this.state.videos[active] || {video:{},audios:[],out:{}}))
  }

  getActiveVideo(){
    return this.state.videos[this.state.actives[0]] || {video:{},audios:[],out:{}}
  }

  handleChange(e,key){
    for(let activeVideo of this.getActiveVideos()){
      const {video,audios,out} = activeVideo
      out[key] = e.target.value === void 0 ? e.target.checked : e.target.value
    }
    this.setState({})
  }

  handleAudioChange(e,key){
    for(let activeVideo of this.getActiveVideos()){
      const {video,audios,out} = activeVideo
      out.AudioList[0][key] = e.target.value === void 0 ? e.target.checked : e.target.value
    }
    this.setState({})
  }

  handleChange2(e,key,data){
    for(let activeVideo of this.getActiveVideos()){
      const {video,audios,out} = activeVideo
      out[key] = data.checked === void 0 ? data.value : data.checked
    }
    this.setState({})
  }

  handleAudioChange2(e,key,data){
    for(let activeVideo of this.getActiveVideos()) {
      const {video, audios, out} = activeVideo
      out.AudioList[0][key] = data.checked === void 0 ? data.value : data.checked
    }
    this.setState({})
  }

  handleChangeRadio(e,key,value){
    for(let activeVideo of this.getActiveVideos()) {
      const {video, audios, out} = activeVideo
      out[key] = value
    }
    this.setState({})
  }

  handleAudioChangeRadio(e,key,value){
    for(let activeVideo of this.getActiveVideos()) {
      const {video, audios, out} = activeVideo
      out.AudioList[0][key] = value
    }
    this.setState({})
  }


  handleChangeDeblock(e,key){
    for(let activeVideo of this.getActiveVideos()) {
      const {video, audios, out} = activeVideo
      const val = parseInt(e.target.value)
      out[key] = val == 0 ? 0 : val + 4
    }
    this.setState({})
  }

  handleRotateChange(e,key,data,num){
    for(let activeVideo of this.getActiveVideos()) {
      const {video, audios, out} = activeVideo
      const org = out[key].split(':')
      org[num] = `${org[num].split("=")[0]}=${data}`
      out[key] = org.join(":")
    }
    this.setState({})
  }

  handleTuneChange(e,key,val){
    for(let activeVideo of this.getActiveVideos()) {
      const {video, audios, out} = activeVideo
      let org = out[key].split(/, */)
      if(val == 'fastdecode-add') {
        org.push('fastdecode')
        org = [...new Set(org)]
      }
      else if(val == 'fastdecode-remove') {
        org = org.filter(x => x != 'fastdecode')
      }
      else if(val == '') {
        org = org.filter(x => x == 'fastdecode')
      }
      else{
        org = org.filter(x => x == 'fastdecode')
        org.push(val)
        org = [...new Set(org)]
      }

      out[key] = org.join(", ")
    }
    this.setState({})
  }

  handleSurround(val){
    for(let activeVideo of this.getActiveVideos()) {
      const {video, audios, out} = activeVideo
      if (val) {
        const surround = {
          "AudioBitrate": 640,
          "AudioCompressionLevel": -1.0,
          "AudioDitherMethod": "auto",
          "AudioEncoder": "copy:ac3",
          "AudioMixdown": "none",
          "AudioNormalizeMixLevel": false,
          "AudioSamplerate": "auto",
          "AudioTrackQualityEnable": false,
          "AudioTrackQuality": -1.0,
          "AudioTrackGainSlider": 0.0,
          "AudioTrackDRCSlider": 0.0
        }
        out.AudioList.push(surround)
      }
      else {
        out.AudioList = out.AudioList.slice(0, 1)
      }
    }
    this.setState({})
  }

  renderPicture(){
    const state = this.getActiveVideo()

    const ar = aspect(state.video.width,state.video.height)
    const width = Math.min(state.video.width,state.out.PictureWidth)
    const height = Math.min(state.video.height, state.out.PictureHeight)

    return <div className="ui bottom attached segment active tab">
      <div className="panel-flex" >
        <div style={{width: 300}}>
          <div className="field">
            <label className="bold">Size</label>
          </div>

          <div className="field">
            <label className="right-pad">Source:</label>
            {state.video.width && state.video.height ? [
              <label className="right-pad2">{`${state.video.width}x${state.video.height}`},</label>,
              <label className="right-pad2">Aspect:&nbsp;{ar.join(':')}</label>
            ] : ""}
            <br/>

            <label className="right-pad2">Width:</label>
            <div className="ui input right-pad2">
              <input className="input-number" type="number" min="0" max={state.video.width} value={width} onChange={e=>this.handleChange(e,'PictureWidth')} disabled={state.out.PictureKeepRatio}/>
            </div>

            <label className="right-pad2">Height:</label>
            <div className="ui input">
              <input className="input-number" type="number" min="0" max={state.video.height} value={height} onChange={e=>{
                if(state.out.PictureKeepRatio) state.out.PictureWidth =  Math.round(e.target.value / ar[1] * ar[0])
                this.handleChange(e,'PictureHeight')
              }} />
            </div>

            <div className='spacer5'/>
            <Checkbox style={{verticalAlign: 'middle'}} toggle checked={state.out.PictureKeepRatio} onChange={(e,data)=>this.handleChange2(e,'PictureKeepRatio',data)}/>
            <span style={{verticalAlign: 'text-bottom'}} className="toggle-label">Keep Aspect Ratio</span>
          </div>

          <div className='spacer4'/>

          <label style={{verticalAlign: 'baseline'}} className="right-pad">Anamorphic:</label>
          <Dropdown selection options={this.makeValues3('None',['Automatic','auto'],'Loose')} value={state.out.PicturePAR} onChange={(e,data)=>this.handleChange2(e,'PicturePAR',data)}/>

          <div className='spacer5'/>

          <label style={{verticalAlign: 'baseline' ,paddingRight: 31}}>Modulus:</label>
          <Dropdown selection options={this.makeValues2(...['16','8','4','2'].map(x=>([x,parseInt(x)])))} value={state.out.PictureModulus} onChange={(e,data)=>this.handleChange2(e,'PictureModulus',data)}/>

          <div className='spacer2'/>

        </div>
        <div style={{width: 300}}>
          <div className="field">
            <label className="bold">Cropping</label>
          </div>

          <div className="panel-column">
            <div className="field">
              <div className="ui radio checkbox" onClick={e=>this.handleChangeRadio(e,'PictureAutoCrop',true)}>
                <input type="radio" className="hidden" readOnly tabIndex={0} value="0" checked={state.out.PictureAutoCrop}/>
                <label>Automatic</label>
              </div>
              <br/>

              <div className="ui radio checkbox" onClick={e=>this.handleChangeRadio(e,'PictureAutoCrop',false)}>
                <input type="radio" className="hidden" readOnly tabIndex={0} value="1" checked={!state.out.PictureAutoCrop}/>
                <label>Custom</label>
              </div>
            </div>

            <div className='spacer2'/>

            <Grid verticalAlign='middle' columns={4} centered>
              <Grid.Row>
                <Grid.Column>
                  Left
                  <div className="ui input">
                    <input className="input-number" type="number" min="0" max={state.video.width} disabled={state.out.PictureAutoCrop} value={state.out.PictureLeftCrop} onChange={e=>this.handleChange(e,'PictureLeftCrop')}/>
                  </div>
                </Grid.Column>
                <Grid.Column>
                  Top
                  <div className="ui input" style={{paddingBottom: 35}}>
                    <input className="input-number" type="number" min="0" max={state.video.height} disabled={state.out.PictureAutoCrop} value={state.out.PictureTopCrop} onChange={e=>this.handleChange(e,'PictureTopCrop')}/>
                  </div>
                  <br />
                  Bottom
                  <div className="ui input">
                    <input className="input-number" type="number" min="0" max={state.video.height} disabled={state.out.PictureAutoCrop} value={state.out.PictureBottomCrop} onChange={e=>this.handleChange(e,'PictureBottomCrop')}/>
                  </div>
                </Grid.Column>
                <Grid.Column>
                  Right
                  <div className="ui input">
                    <input className="input-number" type="number" min="0" max={state.video.width} disabled={state.out.PictureAutoCrop} value={state.out.PictureRightCrop} onChange={e=>this.handleChange(e,'PictureRightCrop')}/>
                  </div>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </div>
        </div>
      </div>

    </div>
  }

  renderFilters(){
    const state = this.getActiveVideo()

    const deinterlacePreset = state.out.PictureDeinterlaceFilter == 'yadif' ? this.makeValues3('Custom','Default',['Skip Spatial Check','skip-spatial'],'Bob') :
      state.out.PictureDeinterlaceFilter == 'decomb' ? this.makeValues3('Default','Bob','Custom','EEDI2','EEDI2Bob') : []

    const denoisePreset =  state.out.PictureDenoiseFilter == 'hqdn3d' ? this.makeValues3('Weak','Medium','Strong','Custom') :
      state.out.PictureDenoiseFilter == 'nlmeans' ? this.makeValues3('Ultralight','Light','Medium','Strong','Custom') : []

    return <div className="ui bottom attached segment active tab">
      <div className="panel-flex" >
        <div style={{width: 250}}>
          <div className="field">
            <label className="bold">Filters</label>
          </div>

          <label style={{verticalAlign: 'baseline', paddingRight: 15}} className="right-pad">Detelecine:</label>
          <Dropdown selection options={this.makeValues3('Off','Custom','Default')} value={state.out.PictureDetelecine} onChange={(e,data)=>this.handleChange2(e,'PictureDetelecine',data)}/>
          <div className='spacer5'/>

          <label style={{verticalAlign: 'baseline'}} className="right-pad">Deinterlace:</label>
          <Dropdown selection options={this.makeValues3('Off','Yadif','Decomb')} value={state.out.PictureDeinterlaceFilter} onChange={(e,data)=>this.handleChange2(e,'PictureDeinterlaceFilter',data)}/>
          <div className='spacer5'/>

          <label style={{verticalAlign: 'baseline', paddingRight: 30}} className="right-pad">Denoise:</label>
          <Dropdown selection options={this.makeValues3('Off','hqdn3d','NLMeans')} value={state.out.PictureDenoiseFilter} onChange={(e,data)=>this.handleChange2(e,'PictureDenoiseFilter',data)}/>
          <div className='spacer5'/>

          <label style={{verticalAlign: 'bottom', paddingRight: 30}}>Deblock:</label>
          <div className="ui input">
            <input type="range" min="0" max="11" name="duration" step="1" value={state.out.PictureDeblock == 0 ? 0 : state.out.PictureDeblock - 4} onChange={e=>this.handleChangeDeblock(e,'PictureDeblock')}/>
          </div>
          <div className='spacer5'/>

          <Checkbox style={{verticalAlign: 'middle'}} toggle checked={state.out.VideoGrayScale} onChange={(e,data)=>this.handleChange2(e,'VideoGrayScale',data)}/>
          <span style={{verticalAlign: 'text-bottom'}} className="toggle-label">Grayscale</span>
          <div className='spacer5'/>

          <label style={{verticalAlign: 'baseline', paddingRight: 40}}>Rotate:</label>
          <Dropdown selection options={this.makeValues('0','90','180','270')} value={state.out.PictureRotate && state.out.PictureRotate.split(":")[0].split("=")[1]} onChange={(e,data)=>this.handleRotateChange(e,'PictureRotate',data.value,0)}/>
        </div>

        <div style={{width: 220}}>
          <div className="field" style={{paddingTop: state.out.PictureDetelecine == 'custom' ? 30 : 64}}>
            {state.out.PictureDetelecine == 'custom' ? [<div style={{paddingRight: 15}} className="ui input">
              <input type="text" value={state.out.PictureDetelecineCustom} onChange={e=>this.handleChange(e,'PictureDetelecineCustom')}/>
            </div>,<div className='spacer4'/>] : ''}

            <label style={{verticalAlign: 'baseline', paddingRight: 15}} className="right-pad">Preset:</label>
            <Dropdown selection options={deinterlacePreset}  value={state.out.PictureDeinterlacePreset} onChange={(e,data)=>this.handleChange2(e,'PictureDeinterlacePreset',data)}/>
            <div style={{height: state.out.PictureDenoiseFilter !== 'off' ? 3 : 43}}/>


            {state.out.PictureDenoiseFilter !== 'off' ? [<label style={{verticalAlign: 'baseline', paddingRight: 15}}>Preset:</label>,
              <Dropdown selection options={denoisePreset}  value={state.out.PictureDenoisePreset} onChange={(e,data)=>this.handleChange2(e,'PictureDenoisePreset',data)}/>,
              <div className='spacer4'/>] : ''}

            <label style={{verticalAlign: 'bottom'}} className="right-pad">{state.out.PictureDeblock || 'Off' }</label>
            <div style={{height: 38}}/>

            <Checkbox style={{verticalAlign: 'middle'}} toggle  checked={state.out.PictureRotate && state.out.PictureRotate.split(":")[1].split("=")[1]=='1'} onChange={(e,data)=>this.handleRotateChange(e,'PictureRotate',data.checked ? '1' : '0' ,1)}/>
            <span style={{verticalAlign: 'text-bottom'}} className="toggle-label">Flip</span>
          </div>
        </div>

        <div style={{width: 290}}>
          <div className="field" style={{paddingTop: 64}}>
            <label style={{verticalAlign: 'baseline', paddingRight: 15}} className="right-pad">Interlace Detection:</label>
            <Dropdown selection options={state.out.PictureDeinterlaceFilter == 'off' ? [] : this.makeValues3('Off','Custom','Default',['LessSensitive','permissive'],'Fast')}
                      value={state.out.PictureCombDetectPreset} onChange={(e,data)=>this.handleChange2(e,'PictureCombDetectPreset',data)}/>

            {state.out.PictureDenoiseFilter == 'nlmeans' ? [<label style={{verticalAlign: 'baseline', paddingRight: 15, paddingTop: 6}} >Tune:</label>,
              <Dropdown selection options={this.makeValues3('None','Film','Grain','High Motion','Animation','Tape','Sprite')} value={state.out.PictureDenoiseTune} onChange={(e,data)=>this.handleChange2(e,'PictureDenoiseTune',data)}/>,
              <div className='spacer4'/>] : ''}
          </div>
        </div>
      </div>
    </div>
  }

  videoQuality(state){
    const ve = state.out.VideoEncoder
    const max = ve.includes('mpeg') ? 31 : ve.includes('26') ? 51 : 63
    const jsx =
      <span>
          <div className="ui radio checkbox" onClick={e=>this.handleChangeRadio(e,'VideoQualityType',2)}>
            <input type="radio" className="hidden" value="2" name="quality" checked={state.out.VideoQualityType == 2}/>
            <label>Constant Quality: {state.out.VideoQualitySlider} {ve.includes('x2') ? 'QP' : ' RF'} {ve == 'x264' && parseInt(state.out.VideoQualitySlider) == 0 ? '(RF 0 is Lossless)' : ''}</label>
          </div>

          <br/>
          <div className="ui input" style={{marginTop: -4, paddingLeft: 20, width: 320}}>
            <input type="range" min="0" max={max.toString()} name="duration" disabled={state.out.VideoQualityType == 1}
                   value={ve == 'theora' ? parseInt(state.out.VideoQualitySlider) : max - parseInt(state.out.VideoQualitySlider)}
                   onChange={e=>{e.target.value = ve == 'theora' ? parseInt(e.target.value) : max - parseInt(e.target.value);this.handleChange(e,'VideoQualitySlider')}}/>
          </div>
          <div style={{marginTop: -5, paddingLeft: 20, width: 320}}>
            <label>| Lower Quality</label><label style={{float:'right'}}>Higher Quality |</label>
          </div>
        </span>

    return jsx
  }

  optimiseVideo(state){
    const ve = state.out.VideoEncoder

    const presets = ve.includes('x2') ? ['ultrafast','superfast','veryfast','faster','fast','medium','slow','slower','veryslow','placebo'] :
      ve.includes('26') ? ['speed', 'balanced', 'quality'] : ['veryfast','faster','fast','medium','slow','slower','veryslow']

    const presetMap = {},presetRMap = {}
    ;presets.forEach((x,i)=>{presetMap[x] = (i+1).toString();presetRMap[(i+1).toString()] = x})

    const tunes = ve == 'x265' ? [['None',''],'PSNR','SSIM','Grain','Zero Latency'] : [['None',''],'Film','Animation','Grain','Still Image','PSNR','SSIM','Zero Latency']
    const levels = ve == 'qsv_h265' ? ['Auto','1.0','2.0','2.1','3.0','3.1','4.0','4.1','5.0','5.1','5.2','6.0','56.1','6.2'] :
      ['Auto','1.0','1b','1.1','1.2','1.3','2.0','2.1','2.2','3.0','3.1','3.2','4.0','4.1','4.2','5.0','5.1','5.2']


    const jsx =
      <span>
        {ve.match(/26|VP/) ? <span>
          <label style={{verticalAlign: 'bottom', paddingRight: 12}}>Encoder Preset:</label>
          <div className="ui input">
            <input type="range" min="1" max="10" value={presetMap[state.out.VideoPreset]} onChange={e=>{e = {target: {value: presetRMap[e.target.value]}};this.handleChange(e,'VideoPreset')}}/>
            <label style={{paddingLeft: 5, paddingTop: 4}}>{state.out.VideoPreset && `${state.out.VideoPreset[0].toUpperCase()}${state.out.VideoPreset.slice(1)}`}</label>
          </div>
          <div className='spacer5'/>
        </span> : '' }

        {ve.includes('26') ? <span>
          <label style={{verticalAlign: 'baseline', paddingRight: 19}} className="right-pad">Encoder Tune:</label>
          <Dropdown className="video-tune" selection options={this.makeValues3(...tunes)}
                    value={state.out.VideoTune.split(/, */).filter(x=>x != 'fastdecode')[0]} onChange={(e,data)=>this.handleTuneChange(e,'VideoTune',data.value)}/>

          <Checkbox style={{verticalAlign: 'middle'}} toggle checked={state.out.VideoTune.includes('fastdecode')}
                    onChange={(e,data)=>{this.handleTuneChange(e,'VideoTune',data.checked ? 'fastdecode-add' : 'fastdecode-remove')}}/>

          <span style={{verticalAlign: 'text-bottom'}} className="toggle-label">Fast Decode</span>
          <div className='spacer5'/>

          <label style={{verticalAlign: 'baseline'}} className="right-pad">Encoder Profile:</label>
          <Dropdown className="video-profile" selection options={this.makeValues3(...(ve.includes('5') ? ['Auto','Main','Main Still Picture'] : ['Auto','High','Main','Baseline']))}
                    value={state.out.VideoProfile} onChange={(e,data)=>this.handleChange2(e,'VideoProfile',data)}/>
        </span> : '' }

        {ve.includes('26') && ve != 'x265' ? <span>
          <label style={{verticalAlign: 'baseline'}} className="right-pad">Encoder Level:</label>
          <Dropdown selection options={this.makeValues(...levels)}
                    value={state.out.VideoLevel} onChange={(e,data)=>this.handleChange2(e,'VideoLevel',data)}/>
          <div className='spacer5'/>
        </span> : ''}
      </span>

    return jsx
  }

  renderVideo(){
    const state = this.getActiveVideo()
    const ve = state.out.VideoEncoder

    let codecs = [['H.264 (x264)','x264'],['H.264 (Intel QSV)','qsv_h264'],['H.265 (x265)','x265'],['H.265 (Intel QSV)','qsv_h265'],['VP9','VP9'],['MPEG-4','mpeg4'],['MPEG-2','mpeg2'],['Theora','theora'],['VP8','VP8']]
    if(state.out.FileFormat == 'mp4'){
      codecs = codecs.filter(c=>c[1].match(/26|mpeg/))
    }

    return  <div className="ui bottom attached segment active tab">
      <div className="panel-flex" >
        <div style={{width: 350}}>
          <div className="field">
            <label className="bold">Video</label>
          </div>

          <label style={{verticalAlign: 'baseline', paddingRight: 28}} className="right-pad">Video Codec:</label>
          <Dropdown className="video-codec" selection options={this.makeValues2(...codecs)}
                    value={state.out.VideoEncoder} onChange={(e,data)=>this.handleChange2(e,'VideoEncoder',data)}/>
          <div className='spacer5'/>

          <label style={{verticalAlign: 'baseline'}} className="right-pad">Framerate (FPS):</label>
          <Dropdown className="video-fps" selection options={this.makeValues3(['Same as Source',''],'10','12','15','20','23.976','24','25','29.97','30','48','50','59.94','60','72','75','90','100','120')} value={state.out.VideoFramerate} onChange={(e,data)=>this.handleChange2(e,'VideoFramerate',data)}/>
          <div className='spacer5'/>


          <div className="field" style={{paddingLeft: 112}}>

            <div className="ui radio checkbox" onClick={e=>this.handleChangeRadio(e,'VideoFramerateMode','cfr')}>
              <input type="radio" className="hidden" value="cfr" name="fps" checked={state.out.VideoFramerateMode == 'cfr'}/>
              <label>Constant Framerate</label>
            </div>
            <br/>
            <div className="ui radio checkbox" onClick={e=>this.handleChangeRadio(e,'VideoFramerateMode','pfr')}>
              <input type="radio" className="hidden" value="pfr" name="fps" checked={state.out.VideoFramerateMode == 'pfr'}/>
              <label>Peak Framerate</label>
            </div>
          </div>

        </div>

        <div style={{width: 400}}>
          <div className="field">
            <label className="bold">Quality</label>
          </div>

          {this.videoQuality(state)}
          <div className='spacer4'/>

          <div className="ui radio checkbox input" onClick={e=>this.handleChangeRadio(e,'VideoQualityType',1)}>
            <input type="radio" className="hidden" value="1" name="avg" checked={state.out.VideoQualityType == 1}/>
            <label className="avg" style={{display: 'inline'}}>Avg Bitrate: </label>
            <input style={{width: 80, verticalAlign: '-1px'}} className="input-number" type="number" min="1" disabled={state.out.VideoQualityType == 2}
                   value={state.out.VideoAvgBitrate} onChange={e=>this.handleChange(e,'VideoAvgBitrate')}/> kbps
          </div>
          <div className='spacer4'/>

          <div style={{paddingLeft: 24}}>

            {ve.includes('qsv') ? '' : [
              <Checkbox style={{verticalAlign: 'middle'}} toggle disabled={state.out.VideoQualityType == 2} checked={state.out.VideoTwoPass} onChange={(e,data)=>this.handleChange2(e,'VideoTwoPass',data)}/>,
              <span style={{verticalAlign: 'text-bottom'}} className="toggle-label">2-Pass Encoding</span>]}


            {ve.includes('x2') ? [<br/>,
              <Checkbox style={{verticalAlign: 'middle'}} toggle disabled={state.out.VideoQualityType == 2} checked={state.out.VideoTurboTwoPass} onChange={(e,data)=>this.handleChange2(e,'VideoTurboTwoPass',data)}/>,
              <span style={{verticalAlign: 'text-bottom'}} className="toggle-label">Turbo first pass</span>]: ''}

          </div>
        </div>

      </div>

      <div className="field">
        <label className="bold">Optimise Video</label>
      </div>

      {this.optimiseVideo(state)}

      <div className="ui form">
        <label style={{verticalAlign: '30px', paddingRight: 20}} className="right-pad">Extra Options:</label>
        <TextArea style={{width: '80%'}} value={state.out.VideoOptionExtra} onChange={(e,data)=>this.handleChange2(e,'VideoOptionExtra',data)}/>
      </div>

    </div>
  }

  renderAudio(){
    const state = this.getActiveVideo()
    const isAudioExtract = state.out.audioExtract

    const ac = state.out.AudioList[0].AudioEncoder
    let codecs = [['None','none'],['AAC (avcodec)','aac'],['MP3','mp3'],['AC3','ac3'],['Auto Passthru','copy'],['AAC Passthru','copy:aac'],['MP3 Passthru','copy:mp3'],
      ['AC3 Passthru','copy:ac3'],['E-AC3 Passthru','copy:eac3'],['DTS Passthru','copy:dts'],['DTS-HD Passthru','copy:dtshd'],['TrueHD Passthru','copy:truehd']]
    if(state.out.FileFormat == 'mkv'){
      codecs.push(['Vorbis','vorbis'],['FLAC 16-bit','flac16'],['FLAC 24-bit','flac24'],['FLAC Passthru','copy:flac'],['Opus (libopus)','opus'])
    }
    if(isAudioExtract){
      codecs = [['Auto Passthru','copy'],['AAC (avcodec)','aac'],['MP3','mp3'],['AC3','ac3'],['Vorbis','vorbis'],['Opus (libopus)','opus'],['FLAC 16-bit','flac16'],['FLAC 24-bit','flac24']]
    }
    const bitrates = ac == 'aac' ? ['64','80','96','112','128','160','192','224','256','320','384','448','512'] :
      ac == 'mp3' ? ['32','40','48','56','64','80','96','112','128','160','192','224','256','320'] :
        ac == 'ac3' ? ['112','128','160','192','224','256','320','384','448','512','576','640'] :
          ac == 'vorbis' ? ['56','64','80','96','112','128','160','192','224','256','320','384','448'] :
            ['32','40','48','56','64','80','96','112','128','160','192','224','256','320','384','448','512']

    return  <div className="ui bottom attached segment active tab">
      <div className="field">
        <label className="bold">Audio Tracks</label>
      </div>

      <label style={{verticalAlign: 'baseline'}} className="right-pad">Audio Codec:</label>
      <Dropdown className="video-codec" selection options={this.makeValues2(...codecs)}
                value={state.out.AudioList[0].AudioEncoder} onChange={(e,data)=>this.handleAudioChange2(e,'AudioEncoder',data)}/>

      <div className='spacer5'/>

      {ac.includes('copy') ? '' : <span>
      <label style={{verticalAlign: 'baseline', paddingRight: 33}} className="right-pad">Mixdown:</label>
        <Dropdown className="video-codec" selection options={this.makeValues2(...(isAudioExtract ? [['Mono','mono'],['Stereo','dpl2']] : [['Mono','mono'],['Mono (Left Only)','left_only'],['Mono (Right Only)','right_only'],['Stereo','dpl2']]))}
                  value={state.out.AudioList[0].AudioMixdown} onChange={(e,data)=>this.handleAudioChange2(e,'AudioMixdown',data)}/>
        <div className='spacer5'/>
      </span>}

      {/*<Checkbox style={{verticalAlign: 'middle'}} toggle /><span style={{verticalAlign: 'text-bottom'}} className="toggle-label">Include All Tracks</span>*/}
      {/*<br/>*/}

      {ac.match(/copy|flac/) ? '' : <span>
        {isAudioExtract ? '' : <span>
        <Checkbox style={{verticalAlign: 'middle'}} toggle checked={state.out.AudioList.length > 1}
                  onChange={(e,data)=>{this.handleSurround(data.checked)}}/>
         <span style={{verticalAlign: 'text-bottom'}} className="toggle-label">Surround</span>
      </span>}

        <div className="field">
        <label className="bold">Quality</label>
      </div>

        {/*<div className="ui radio checkbox input" onClick={e=>this.handleAudioChangeRadio(e,'AudioTrackQualityEnable',false)}>*/}
        {/*<input type="radio" className="hidden" value="bitrate" name="audioQuality" checked={!state.out.AudioList[0].AudioTrackQualityEnable}/>*/}
        <label className="avg" style={{display: 'inline', paddingRight: 4}}>Bitrate: </label>
        <Dropdown className="bitrate" selection options={this.makeValues2(...bitrates.map(x=>[x,parseInt(x)]))}
                  disabled={state.out.AudioList[0].AudioTrackQualityEnable} value={parseInt(state.out.AudioList[0].AudioBitrate)} onChange={(e,data)=>this.handleAudioChange2(e,'AudioBitrate',data)}/> kbps
        {/*</div>*/}
        <div className='spacer4'/>

        {/*<div className="ui radio checkbox input" onClick={e=>this.handleAudioChangeRadio(e,'AudioTrackQualityEnable',true)}>*/}
        {/*<input type="radio" className="hidden" value="quality" name="audioQuality" checked={state.out.AudioList[0].AudioTrackQualityEnable}/>*/}
        {/*<label className="avg" style={{display: 'inline'}}>Quality: </label>*/}
        {/*<Dropdown selection options={this.makeValues2(...['1','2','3','4','5','6','7','8','9','10'].map(x=>[x,parseInt(x)]))}*/}
        {/*disabled={!state.out.AudioList[0].AudioTrackQualityEnable} value={parseInt(state.out.AudioList[0].AudioTrackQuality)} onChange={(e,data)=>this.handleAudioChange2(e,'AudioTrackQuality',data)}/>*/}
        {/*</div>*/}
      </span>
      }


      <div className="field">
        <label className="bold">Other</label>
      </div>

      <label style={{verticalAlign: 'baseline'}} className="right-pad">Gain:</label>
      <div className="ui input right-pad" style={{verticalAlign: 'middle'}}>
        <input type="range" min="-20" max="20" name="gain" step="1" value={state.out.AudioList[0].AudioTrackGainSlider} onChange={e=>this.handleAudioChange(e,'AudioTrackGainSlider')}/>
      </div>
      <label style={{verticalAlign: 'bottom'}}>{state.out.AudioList[0].AudioTrackGainSlider}dB</label>

      <div className='spacer5'/>

      <label style={{verticalAlign: 'baseline'}} className="right-pad">SampleRate:</label>
      <Dropdown className="video-codec" selection options={this.makeValues3('Auto',['8kHz',8000],['11.025kHz',11025],['12kHz',12000],['16kHz',16000],['22.05kHz',22050],['24kHz',24000],['32kHz',32000],['44.1kHz',44100],['48kHz',48000])}
                value={state.out.AudioList[0].AudioSamplerate} onChange={(e,data)=>this.handleAudioChange2(e,'AudioSamplerate',data)}/>

      <div className='spacer5'/>

    </div>

  }

  renderConverter() {
    const state = this.getActiveVideo()
    const isAudioExtract = state.out && state.out.audioExtract
    console.log(state)
    return <div>
      <Divider/>

      {!state.video.width ? "" :
        <div className="field">
          <label className="bold right-pad">Source</label>
          <label>{this.state.actives[0] || ""}</label>
          <br/>
          <label>[Video]&nbsp;Codec:&nbsp;</label>
          <label className="right-pad2">{state.video.encode},</label>
          <label className="right-pad2">Size:&nbsp;{`${state.video.width}x${state.video.height}`},</label>
          <label className="right-pad2">Bitrate:&nbsp;{state.video.bitrate}&nbsp;kb/s,</label>
          <label>{state.video.fps} fps</label>
          <br/>
          {state.audios.map((a,i)=>{
            return <span key={i}>
              <label>[Audio#{i+1}]&nbsp;Codec:&nbsp;</label>
              <label className="right-pad2">{a.codec},</label>
              {a.bitrate ? <label className="right-pad2">Bitrate:&nbsp;{a.bitrate}&nbsp;kb/s,</label> : ""}
              <label className="right-pad2">{a.hz}&nbsp;Hz,</label>
              <label className="right-pad2">{a.stereo}</label>
          </span>
          })}
        </div>
      }

      <div className='spacer4'/>

      <div className="field">
        <label className="bold right-pad">Time</label>
        <div className="ui input">
          <input type="text" min="00:00:00" max={state.out.stopAt || state.video.duration} value={state.out.startAt || "00:00:00"} step="1" onChange={e=>this.handleChange(e,'startAt')} />
        </div>
        &nbsp;〜&nbsp;
        <div className="ui input">
          <input type="text" min="00:00:00" max={state.video.duration} value={state.out.stopAt || state.video.duration} step="1" onChange={e=>this.handleChange(e,'stopAt')}/>
        </div>
      </div>

      <div className='spacer4'/>

      <div className="field">
        <label className="bold">Output Settings</label>
        <br/>

        <label style={{verticalAlign: 'baseline'}} className="right-pad">Operation</label>
        <div className="field" style={{display: 'inline',paddingLeft: 7}}>
          <div className="ui radio checkbox" style={{paddingRight: 22}} onClick={e=>{ this.state.activeTab = 'Picture';this.handleChangeRadio(e,'audioExtract',false)}}>
            <input type="radio" className="hidden" readOnly tabIndex={0} value="0" checked={!state.out.audioExtract}/>
            <label>Convert Video</label>
          </div>

          <div className="ui radio checkbox" onClick={e=>{ this.state.activeTab = 'Audio';this.handleChangeRadio(e,'audioExtract',true)}}>
            <input type="radio" className="hidden" readOnly tabIndex={0} value="1" checked={state.out.audioExtract}/>
            <label>Extract/Convert Audio</label>
          </div>
        </div>
        <div className='spacer5'/>

        <label style={{verticalAlign: 'baseline'}} className="right-pad">Destination</label>
        <div className="ui input" >
          <input type="text" style={{width: 300,padding: '.3em 1em'}} value={state.out.destination} onChange={e=>this.handleChange(e,'destination')}/>
        </div>
        <Button icon='folder' onClick={_=>{
          const key = Math.random().toString()
          ipc.send('show-dialog-exploler',key,{defaultPath:state.out.destination || defaultData.defaultDownloadPath})
          ipc.once(`show-dialog-exploler-reply_${key}`,(event,ret)=>{
            console.log(ret)
            state.out.destination = ret
            this.setState({})
          })
        }}/>

        <label style={{verticalAlign: 'baseline', paddingLeft: 10, paddingRight: 10}} className="right-pad">FileName</label>
        <div className="ui input">
          <input type="text" style={{width: 300, padding: '.3em 1em'}} value={state.out.fileName} onChange={e=>this.handleChange(e,'fileName')}/>
        </div>

        <div className='spacer5'/>

        <label style={{verticalAlign: 'baseline', paddingRight: 19}} >Container</label>
        <Dropdown selection disabled={isAudioExtract} options={this.makeValues2(['MP4','mp4'],['MKV','mkv'])} value={state.out.FileFormat} onChange={(e,data)=>this.handleChange2(e,'FileFormat',data)}/>

        <Checkbox style={{verticalAlign: 'middle'}} toggle disabled={isAudioExtract} checked={state.out.Mp4HttpOptimize} onChange={(e,data)=>this.handleChange2(e,'Mp4HttpOptimize',data)}/>
        <span style={{verticalAlign: 'text-bottom'}} className="toggle-label">Web Optimized</span>

        <Checkbox style={{verticalAlign: 'middle'}} toggle disabled={isAudioExtract} checked={state.out.Mp4iPodCompatible}  onChange={(e,data)=>this.handleChange2(e,'Mp4iPodCompatible',data)}/>
        <span style={{verticalAlign: 'text-bottom'}} className="toggle-label">iPod 5G Support</span>
      </div>

      <div className='spacer2'/>

      {state.out.PresetName ? <div>
        <div onClick={this.selectChange} aligned="left" className="ui attached tabular menu">
          {isAudioExtract ? [] : [<a className={this.tabClass('Picture')}>Picture</a>,
            <a className={this.tabClass('Filters')}>Filters</a>,
            <a className={this.tabClass('Video')}>Video</a>]}
          <a className={this.tabClass('Audio')}>Audio</a>
        </div>
        {this.tabs[this.state.activeTab]()}
      </div> : null}

    </div>
  }

  changePreset(preset){
    const state = this.getActiveVideo()
    if((state.out.PresetName) == preset) return

    const newPreset = findPreset(preset)

    newPreset.PictureKeepRatio = state.out.PictureKeepRatio
    newPreset.destination = state.out.destination
    newPreset.fileName = state.out.fileName
    newPreset.startAt = state.out.startAt
    newPreset.stopAt = state.out.stopAt

    if(newPreset.PictureKeepRatio){
      const ar = aspect(state.video.width,state.video.height)
      newPreset.PictureWidth =  Math.round(newPreset.PictureHeight / ar[1] * ar[0])
    }

    defaultData.defaultVideoPreset = preset
    state.out = newPreset
    ipc.send('save-state',{tableName:'state',key:'defaultVideoPreset',val: preset})
    this.setState({})
  }


  makePresetList(preset){
    const state = this.getActiveVideo()
    const result = []
    const presetName = state && state.out.PresetName
    for(let dirc of presets){
      const name = dirc.PresetName
      result.push(<a href="#" className="list-group-item list-group-item-action directory">{name}</a>)
      for(let arr of dirc.ChildrenArray){
        result.push(<a href="#" onClick={_=>this.changePreset(arr.PresetName)} className={`list-group-item list-group-item-action${preset == arr.PresetName ? ' active' : ''}`}>{arr.PresetName}</a>)
      }
    }
    return result
  }

  render(){
    const state = this.getActiveVideo()
    return <div className="main">
      <div className="cont">
        <Selector ref="selector" parent={this} addFiles={::this.addFiles}/>
        {this.renderConverter()}
      </div>
      <div className="side1">
        <div className="list-group">
          {this.makePresetList((state.out && state.out.PresetName) || defaultData.defaultVideoPreset)}
        </div>
      </div>
    </div>

  }
}

ipc.send("get-main-state",['defaultDownloadPath','defaultVideoPreset'])
ipc.once("get-main-state-reply",(e,data)=>{
  defaultData = data
  ReactDOM.render(<Converter />,  document.getElementById('app'))
})