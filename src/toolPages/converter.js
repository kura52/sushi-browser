window.debug = require('debug')('info')
// require('debug').enable("info")
import {ipcRenderer as ipc} from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import uuid from 'node-uuid';
import Selection from '../render/react-selection/indexTable'
import ReactTable from 'react-table'
import presets from './videoPreset'

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

global.multiSelection = true
class Selector extends React.Component {
  static defaultProps = { rowKey: 'id' };

  constructor(props,context) {
    super(props,context);
    this.columns = [
      { accessor: 'no', Header: 'No', resizable: true, minWidth: 5,maxWidth: 40},
      { accessor: 'file', Header: 'File', resizable: true, sortable: true,filterable:true, minWidth: 20, maxWidth: 250 },
      { accessor: 'progress', Header: 'Progress', Cell: PercentCompleteFormatter, minWidth: 10, maxWidth:150  },
    ]

    const data = {links:[],resources:[]} //JSON.parse(getUrlVars().data)
    this.links = data.links
    this.type = 'link'
    this.resources = data.resources
    this.checkLists = new Map()

    this.state = {selectedIds: []}
    this.state.rows = []
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
      ipc.send('ffmpeg-scan',key,ret)
      ipc.once(`ffmpeg-scan-reply_${key}`,(e,results)=>{
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

    this.selectChange = ::this.selectChange

    PubSub.subscribe('add-files',(e,{files,results})=>{
      files.forEach((file,i)=>{
        this.handleFile(file,results[i],i==0)
      })
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
    preset.keepAspectRatio = true

    const video = {video:{duration,encode,width,height,fps,bitrate},audios,out:preset}
    this.state.videos[file] = video
    if(setState){
      this.setState({active:file})
    }
    console.log(video)
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

  getActiveVideo(){
    return this.state.videos[this.state.active] || {video:{},audios:[],out:{}}
  }

  handleChange(e,key){
    const {video,audios,out} = this.getActiveVideo()
    out[key] = e.target.value === void 0 ? e.target.checked : e.target.value
    this.setState({})
  }

  handleChange2(e,key,data){
    const {video,audios,out} = this.getActiveVideo()
    out[key] = data.checked === void 0 ? data.value : data.checked
    this.setState({})
  }

  handleAudioChange2(e,key,data){
    const {video,audios,out} = this.getActiveVideo()
    out.AudioList[0][key] = data.checked === void 0 ? data.value : data.checked
    this.setState({})
  }

  handleChangeRadio(e,key,value){
    const {video,audios,out} = this.getActiveVideo()
    out[key] = value
    this.setState({})
  }

  handleAudioChangeRadio(e,key,value){
    const {video,audios,out} = this.getActiveVideo()
    out.AudioList[0][key] = value
    this.setState({})
  }


  handleChangeDeblock(e,key){
    const {video,audios,out} = this.getActiveVideo()
    const val = parseInt(e.target.value)
    out[key] = val == 0 ? 0 : val + 4
    this.setState({})
  }

  handleRotateChange(e,key,data,num){
    const {video,audios,out} = this.getActiveVideo()
    const org = out[key].split(':')
    org[num] = `${org[num].split("=")[0]}=${data}`
    out[key] = org.join(":")
    this.setState({})
  }

  handleTuneChange(e,key,val){
    const {video,audios,out} = this.getActiveVideo()
    let org = out[key].split(/, */)
    if(val == 'fastdecode-add'){
      org.push('fastdecode')
      org = [...new Set(org)]
    }
    else if(val == 'fastdecode-remove'){
      org = org.filter(x=>x!='fastdecode')
    }
    else if(val == ''){
      org = org.filter(x=>x=='fastdecode')
    }
    else{
      org = org.filter(x=>x=='fastdecode')
      org.push(val)
      org = [...new Set(org)]
    }

    out[key] = org.join(", ")
    this.setState({})
  }

  handleSurround(val){
    const {video,audios,out} = this.getActiveVideo()
    if(val){
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
    else{
      out.AudioList = out.AudioList.slice(0,1)
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
              <input className="input-number" type="number" min="0" max={state.video.width} value={width} onChange={e=>{
                if(state.out.keepAspectRatio) state.out.PictureHeight =  Math.round(e.target.value / ar[0] * ar[1])
                this.handleChange(e,'PictureWidth')
              }} />
            </div>

            <label className="right-pad2">Height:</label>
            <div className="ui input">
              <input className="input-number" type="number" min="0" max={state.video.height} value={height} onChange={e=>this.handleChange(e,'PictureHeight')} disabled={state.out.keepAspectRatio}/>
            </div>

            <div className='spacer5'/>
            <Checkbox style={{verticalAlign: 'middle'}} toggle checked={state.out.keepAspectRatio} onChange={(e,data)=>this.handleChange2(e,'keepAspectRatio',data)}/>
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
          <div class="ui input">
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

  renderVideo(){
    const state = this.getActiveVideo()

    const presetMap = {},presetRMap = {}
    ;['ultrafast','superfast','veryfast','faster','fast','medium','slow','slower','veryslow','placebo'].forEach((x,i)=>{presetMap[x] = (i+1).toString();presetRMap[(i+1).toString()] = x})

    return  <div className="ui bottom attached segment active tab">
      <div className="panel-flex" >
        <div style={{width: 350}}>
          <div className="field">
            <label className="bold">Video</label>
          </div>

          <label style={{verticalAlign: 'baseline', paddingRight: 28}} className="right-pad">Video Codec:</label>
          <Dropdown className="video-codec" selection options={this.makeValues2(['H.264 (x264)','x264'],['H.264 (Intel QSV)','qsv_h264'],['H.265 (x265)','x265'],['H.265 (Intel QSV)','qsv_h265'],['VP9','VP9'],['MPEG-4','mpeg4'],['MPEG-2','mpeg2'],['Theora','theora'],['VP8','VP8'])}
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

          <div className="ui radio checkbox" onClick={e=>this.handleChangeRadio(e,'VideoQualityType',2)}>
            <input type="radio" className="hidden" value="2" name="quality" checked={state.out.VideoQualityType == 2}/>
            <label>Constant Quality: {state.out.VideoQualitySlider} RF {parseInt(state.out.VideoQualitySlider) == 0 ? '(RF 0 is Lossless)' : ''}</label>
          </div>
          <br/>
          <div class="ui input" style={{marginTop: -4, paddingLeft: 20, width: 320}}>
            <input type="range" min="0" max="51" name="duration" disabled={state.out.VideoQualityType == 1}
                   value={51 - parseInt(state.out.VideoQualitySlider)} onChange={e=>{e.target.value = 51 - parseInt(e.target.value);this.handleChange(e,'VideoQualitySlider')}}/>
          </div>
          <div style={{marginTop: -5, paddingLeft: 20, width: 320}}>
            <label>| Lower Quality</label><label style={{float:'right'}}>Placebo Quality |</label>
          </div>
          <div className='spacer4'/>

          <div className="ui radio checkbox input" onClick={e=>this.handleChangeRadio(e,'VideoQualityType',1)}>
            <input type="radio" className="hidden" value="1" name="avg" checked={state.out.VideoQualityType == 1}/>
            <label className="avg" style={{display: 'inline'}}>Avg Bitrate: </label>
            <input style={{width: 80, verticalAlign: '-1px'}} className="input-number" type="number" min="1" disabled={state.out.VideoQualityType == 2}
                   value={state.out.VideoAvgBitrate} onChange={e=>this.handleChange(e,'VideoAvgBitrate')}/> kbps
          </div>
          <div className='spacer4'/>

          <div style={{paddingLeft: 24}}>
            <Checkbox style={{verticalAlign: 'middle'}} toggle disabled={state.out.VideoQualityType == 2} checked={state.out.VideoTwoPass} onChange={(e,data)=>this.handleChange2(e,'VideoTwoPass',data)}/>
            <span style={{verticalAlign: 'text-bottom'}} className="toggle-label">2-Pass Encoding</span>
            <br/>

            <Checkbox style={{verticalAlign: 'middle'}} toggle disabled={state.out.VideoQualityType == 2} checked={state.out.VideoTurboTwoPass} onChange={(e,data)=>this.handleChange2(e,'VideoTurboTwoPass',data)}/>
            <span style={{verticalAlign: 'text-bottom'}} className="toggle-label">Turbo first pass</span>
          </div>
        </div>

      </div>

      <div className="field">
        <label className="bold">Optimise Video</label>
      </div>

      <label style={{verticalAlign: 'bottom', paddingRight: 12}}>Encoder Preset:</label>
      <div class="ui input">
        <input type="range" min="1" max="10" value={presetMap[state.out.VideoPreset]} onChange={e=>{e = {target: {value: presetRMap[e.target.value]}};this.handleChange(e,'VideoPreset')}}/>
        <label style={{paddingLeft: 5, paddingTop: 4}}>{state.out.VideoPreset && `${state.out.VideoPreset[0].toUpperCase()}${state.out.VideoPreset.slice(1)}`}</label>
      </div>
      <div className='spacer5'/>

      <label style={{verticalAlign: 'baseline', paddingRight: 19}} className="right-pad">Encoder Tune:</label>
      <Dropdown className="video-tune" selection options={this.makeValues3(['None',''],'Film','Animation','Grain','Still Image','PSNR','SSIM','Fast Decode','Zero Latency')}
                value={state.out.VideoTune.split(/, */).filter(x=>x != 'fastdecode')[0]} onChange={(e,data)=>this.handleTuneChange(e,'VideoTune',data.value)}/>

      <Checkbox style={{verticalAlign: 'middle'}} toggle checked={state.out.VideoTune.includes('fastdecode')}
                onChange={(e,data)=>{this.handleTuneChange(e,'VideoTune',data.checked ? 'fastdecode-add' : 'fastdecode-remove')}}/>

      <span style={{verticalAlign: 'text-bottom'}} className="toggle-label">Fast Decode</span>
      <div className='spacer5'/>

      <label style={{verticalAlign: 'baseline'}} className="right-pad">Encoder Profile:</label>
      <Dropdown className="video-profile" selection options={this.makeValues3('Auto','High','Main','Baseline')}
                value={state.out.VideoProfile} onChange={(e,data)=>this.handleChange2(e,'VideoProfile',data)}/>

      <label style={{verticalAlign: 'baseline'}} className="right-pad">Encoder Level:</label>
      <Dropdown selection options={this.makeValues('Auto','1.0','1b','1.1','1.2','1.3','2.0','2.1','2.2','3.0','3.1','3.2','4.0','4.1','4.2','5.0','5.1','5.2')}
                value={state.out.VideoLevel} onChange={(e,data)=>this.handleChange2(e,'VideoLevel',data)}/>
      <div className='spacer5'/>

      <div className="ui form">
        <label style={{verticalAlign: '30px', paddingRight: 20}} className="right-pad">Extra Options:</label>
        <TextArea style={{width: '80%'}} value={state.out.VideoOptionExtra} onChange={(e,data)=>this.handleChange2(e,'VideoOptionExtra',data)}/>
      </div>

    </div>
  }

  renderAudio(){
    const state = this.getActiveVideo()

    return  <div className="ui bottom attached segment active tab">
      <div className="field">
        <label className="bold">Audio Tracks</label>
      </div>

      <label style={{verticalAlign: 'baseline'}} className="right-pad">Audio Codec:</label>
      <Dropdown className="video-codec" selection options={this.makeValues2(['None','none'],['AAC (avcodec)','aac'],['MP3','mp3'],['Auto Passthru','copy'],['AAC Passthru','copy:aac'],['MP3 Passthru','copy:mp3'],
        ['AC3 Passthru','copy:ac3'],['E-AC3 Passthru','copy:eac3'],['DTS Passthru','copy:dts'],['DTS-HD Passthru','copy:dtshd'],['TrueHD Passthru','copy:truehd'])}
                value={state.out.AudioList[0].AudioEncoder} onChange={(e,data)=>this.handleChange2(e,'AudioEncoder',data)}/>

      <div className='spacer5'/>

      <label style={{verticalAlign: 'baseline', paddingRight: 33}} className="right-pad">Mixdown:</label>
      <Dropdown className="video-codec" selection options={this.makeValues2(['Mono','mono'],['Mono (Left Only)','left_only'],['Mono (Right Only)','right_only'],['Stereo','dpl2'])}
                value={state.out.AudioList[0].AudioMixdown} onChange={(e,data)=>this.handleChange2(e,'AudioMixdown',data)}/>
      <div className='spacer5'/>

      {/*<Checkbox style={{verticalAlign: 'middle'}} toggle /><span style={{verticalAlign: 'text-bottom'}} className="toggle-label">Include All Tracks</span>*/}
      {/*<br/>*/}
      <Checkbox style={{verticalAlign: 'middle'}} toggle checked={state.out.AudioList.length > 1}
                onChange={(e,data)=>{this.handleSurround(data.checked)}}/>
      <span style={{verticalAlign: 'text-bottom'}} className="toggle-label">Surround</span>


      <div className="field">
        <label className="bold">Quality</label>
      </div>



      <div className="ui radio checkbox input" onClick={e=>this.handleAudioChangeRadio(e,'AudioTrackQualityEnable',false)}>
        <input type="radio" className="hidden" value="bitrate" name="audioQuality" checked={!state.out.AudioList[0].AudioTrackQualityEnable}/>
        <label className="avg" style={{display: 'inline', paddingRight: 4}}>Bitrate: </label>
        <Dropdown className="bitrate" selection options={this.makeValues2(...['32','40','48','56','64','80','96','112','128','160','192','224','256','320','384','448','512','576','640'].map(x=>[x,parseInt(x)]))}
                  disabled={state.out.AudioList[0].AudioTrackQualityEnable} value={parseInt(state.out.AudioList[0].AudioBitrate)} onChange={(e,data)=>this.handleAudioChange2(e,'AudioBitrate',data)}/> kbps
      </div>
      <div className='spacer4'/>

      <div className="ui radio checkbox input" onClick={e=>this.handleAudioChangeRadio(e,'AudioTrackQualityEnable',true)}>
        <input type="radio" className="hidden" value="quality" name="audioQuality" checked={state.out.AudioList[0].AudioTrackQualityEnable}/>
        <label className="avg" style={{display: 'inline'}}>Quality: </label>
        <Dropdown selection options={this.makeValues2(...['1','2','3','4','5','6','7','8','9','10'].map(x=>[x,parseInt(x)]))}
                  disabled={!state.out.AudioList[0].AudioTrackQualityEnable} value={parseInt(state.out.AudioList[0].AudioTrackQuality)} onChange={(e,data)=>this.handleAudioChange2(e,'AudioTrackQuality',data)}/>
      </div>
      <div className='spacer4'/>

    </div>
  }

  renderConverter() {
    const state = this.getActiveVideo()
    console.log(state)
    return <div>
      <Divider/>

      {!state.video.width ? "" :
        <div className="field">
          <label className="bold right-pad">Source</label>
          <label>{this.state.active || ""}</label>
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
          <input type="time" min="00:00:00" max={state.out.endAt || state.video.duration} value={state.out.startAt || "00:00:00"} step="1" onChange={e=>this.handleChange(e,'startAt')} />
        </div>
        &nbsp;〜&nbsp;
        <div className="ui input">
          <input type="time" min="00:00:00" max={state.video.duration} value={state.out.endAt || state.video.duration} step="1" onChange={e=>this.handleChange(e,'endAt')}/>
        </div>
      </div>

      <div className='spacer4'/>

      <div className="field">
        <label className="bold">Output Settings</label>
        <br/>
        <label style={{verticalAlign: 'baseline'}} className="right-pad">Container</label>
        <Dropdown selection options={this.makeValues2(['MP4','mp4'],['MKV','mkv'])} value={state.out.FileFormat} onChange={(e,data)=>this.handleChange2(e,'FileFormat',data)}/>

        <Checkbox style={{verticalAlign: 'middle'}} toggle checked={state.out.Mp4HttpOptimize} onChange={(e,data)=>this.handleChange2(e,'Mp4HttpOptimize',data)}/>
        <span style={{verticalAlign: 'text-bottom'}} className="toggle-label">Web Optimized</span>

        <Checkbox style={{verticalAlign: 'middle'}} toggle checked={state.out.Mp4iPodCompatible}  onChange={(e,data)=>this.handleChange2(e,'Mp4iPodCompatible',data)}/>
        <span style={{verticalAlign: 'text-bottom'}} className="toggle-label">iPod 5G Support</span>
      </div>

      <div className='spacer2'/>

      <div>
        <div onClick={this.selectChange} aligned="left" className="ui attached tabular menu">
          <a className={this.tabClass('Picture')}>Picture</a>
          <a className={this.tabClass('Filters')}>Filters</a>
          <a className={this.tabClass('Video')}>Video</a>
          <a className={this.tabClass('Audio')}>Audio</a>
        </div>
        {this.tabs[this.state.activeTab]()}
      </div>

    </div>
  }

  changePreset(preset){
    const state = this.getActiveVideo()
    if((state.out.PresetName) == preset) return

    const newPreset = findPreset(preset)
    newPreset.keepAspectRatio = true

    defaultData.defaultVideoPreset = preset
    state.out = newPreset
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
        <Selector/>
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