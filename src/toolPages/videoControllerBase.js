// require('debug').enable("info")
import process from './process'
import {ipcRenderer as ipc} from './ipcRenderer'
import React from 'react';
import ReactDOM from 'react-dom';
import {Segment, Container, Menu, Button, Dropdown, Divider, Checkbox} from 'semantic-ui-react';
import {StickyContainer, Sticky} from 'react-sticky';
import noUiSlider from './noUiSlider/noUiSlider'
import uuid from "node-uuid";
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'


function equalVideos(a,b){
  const len = a.length
  if(len != b.length) return false
  for(let i=0;i<len;i++){
    if(a[i].tabId !== b[i].tabId) return false
  }
  return true
}

function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function showDialog(input,id){
  return new Promise((resolve,reject)=>{
    const key = Math.random().toString()
    ipc.send('show-dialog-exploler',key,input,id)
    ipc.once(`show-dialog-exploler-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function chart() {
  let canvas, context, container

  const px = (window.devicePixelRatio > 1) ? 2 : 1
  const prepareChart = eq => {

    if(!container) container = document.querySelector('.ui.container.video-controller')
    const scale = Math.min((container.clientWidth - 15) / 330, 1.5)
    canvas = document.getElementById('chart')
    //330x40
    canvas.style.width = 315 * scale + 'px'
    canvas.style.height = 40 * scale + 'px'
    canvas.width = px * 315 * scale
    canvas.height = px * 40 * scale
    context = canvas.getContext('2d')
    context.scale(scale, scale)
    context.beginPath()
    context.moveTo(px * 12, px * 20)
    context.lineTo(px * 300, px * 20)
    context.lineWidth = px * 1
    context.strokeStyle = 'rgb(229,229,229)'
    context.stroke()
    context.beginPath()
    for (let l = eq.length, i = 0; i < l; i++) {
      context.moveTo(px * ((i * 32) + 12), px * 5)
      context.lineTo(px * ((i * 32) + 12), px * 35)
    }
    context.lineWidth = px * 1
    context.strokeStyle = 'rgb(229,229,229)'
    context.stroke()
    context.beginPath()
    context.stroke()
    context.font = px * 6 + 'px Arial'
    context.textAlign = 'right'
    context.fillStyle = 'rgb(50,90,140)'
    context.fillText('+12', px * 8, px * (6 + 3))
    context.fillText('-12', px * 8, px * (40 - 3))
    context.textAlign = 'left'
    context.fillText('+12', px * 303, px * (6 + 3))
    context.fillText('-12', px * 303, px * (40 - 3))
    context.closePath()
    refreshChart(eq)
  }

  const refreshChart = eq => {
    //------------ line ------------//
    let points = []
    for (var  l = eq.length, i = 1; i < l; i++) {
      points.push({
        x: ((i - 1) * 32) + 12,
        y: 20 - (15 / 12) * eq[i],
        xc: 0,
        xy: 0
      })
    }
    context.beginPath()
    context.moveTo(px * points[0].x, px * points[0].y)
    for (var i = 1; i < points.length - 2; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2
      const yc = (points[i].y + points[i + 1].y) / 2
      context.quadraticCurveTo(px * points[i].x, px * points[i].y, px * xc, px * yc)
    }
    context.quadraticCurveTo(px * points[i].x, px * points[i].y, px * points[i + 1].x, px * points[i + 1].y)
    context.lineWidth = px * 1
    context.strokeStyle = 'rgb(50,90,140)'
    context.stroke()

    //------------ gradient ------------//
    const gradiend = context.createLinearGradient(px * 0, px * 0, px * 0, px * 40)
    gradiend.addColorStop(0, "rgba(50,90,140,200)")
    gradiend.addColorStop(0.5, "rgba(255,255,255,0)")
    gradiend.addColorStop(1, "rgba(50,90,140,200)")
    points = []

    for (var  l = eq.length, i = 1; i < l; i++) {
      points.push({
        x: ((i - 1) * 32) + 12,
        y: 20 - (15 / 12) * eq[i],
        xc: 0,
        xy: 0
      })
    }
    context.beginPath()
    context.moveTo(px * 12, px * 20)
    context.lineTo(px * points[0].x, px * points[0].y)
    for (var i = 1; i < points.length - 2; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2
      const yc = (points[i].y + points[i + 1].y) / 2
      context.quadraticCurveTo(px * points[i].x, px * points[i].y, px * xc, px * yc)
    }
    context.quadraticCurveTo(px * points[i].x, px * points[i].y, px * points[i + 1].x, px * points[i + 1].y)
    context.lineTo(px * 300, px * 20)
    context.closePath()
    context.fillStyle = gradiend
    context.fill()

  }
  return {
    prepareChart: prepareChart,
    refreshChart: refreshChart
  }
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
    const l10n = this.props.l10n
    return (
      <StickyContainer>
        {this.props.sidebar ? <Sticky>
          <div>
            <Menu pointing secondary>
              <Menu.Item as='a' href={`${baseURL}/favorite_sidebar.html`} key="favorite" icon="star"/>
              <Menu.Item as='a' href={`${baseURL}/history_sidebar.html`} key="history" icon="history"/>
              <Menu.Item as='a' href={`${baseURL}/download_sidebar.html`} key="download" icon="download"/>
              <Menu.Item as='a' key="video-controller" icon="play" active={true}/>
              <Menu.Item as='a' href={`${baseURL}/note_sidebar.html`} key="note" icon="sticky note"/>
              <Menu.Item as='a' href={`${baseURL}/saved_state_sidebar.html`} key="database" icon="database"/>
              <Menu.Item as='a' href={`${baseURL}/tab_trash_sidebar.html`} key="trash" icon="trash"/>
              <Menu.Item as='a' href={`${baseURL}/tab_history_sidebar.html`} key="tags" icon="tags"/>
              <Menu.Item as='a' href={`${baseURL}/explorer_sidebar.html`} key="file-explorer" icon="folder"/>
            </Menu>
          </div>
        </Sticky> : null}
        <VideoController word={this.state.word} videos={this.props.videos} data={this.props.data} sidebar={this.props.sidebar} toolPage={this.props.toolPage} tabId={this.props.tabId} setToken={::this.setToken}/>
      </StickyContainer>
    )
  }
}

const videoFilters = [
  {name: 'brightness', defaultValue: 100, max: 500, step: 5, unit: '%', margin: 3.15625},
  {name: 'contrast', defaultValue: 100, max: 500, step: 5, unit: '%', margin: 14.71875},
  {name: 'saturate', defaultValue: 100, max: 500, step: 5, unit: '%', margin: 16.3125},
  {name: 'grayscale', defaultValue: 0, max: 100, step: 1, unit: '%', margin: 8.546875},
  {name: 'invert', defaultValue: 0, max: 100, step: 1, unit: '%', margin: 31.828125},
  {name: 'sepia', defaultValue: 0, max: 100, step: 1, unit: '%', margin: 35.703125},
  {name: 'hue-rotate', defaultValue: 0, max: 360, step: 1, unit: 'deg', margin: 0},
  {name: 'blur', defaultValue: 0, max: 100, step: 1, unit: 'px', margin: 42.796875},
  {name: 'opacity', defaultValue: 100, max: 100, step: 1, unit: '%', margin: 20.359375}
]

const EQ = [
  { label: '32', f: 32, gain: 0, type: 'lowshelf' },
  { label: '64', f: 64, gain: 0, type: 'peaking' },
  { label: '125', f: 125, gain: 0, type: 'peaking' },
  { label: '250', f: 250, gain: 0, type: 'peaking' },
  { label: '500', f: 500, gain: 0, type: 'peaking' },
  { label: '1k', f: 1000, gain: 0, type: 'peaking' },
  { label: '2k', f: 2000, gain: 0, type: 'peaking' },
  { label: '4k', f: 4000, gain: 0, type: 'peaking' },
  { label: '8k', f: 8000, gain: 0, type: 'peaking' },
  { label: '16k', f: 16000, gain: 0, type: 'highshelf' }
]

let PRESETS = [
  { name: 'Default', default: true, gains: [0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000] },
  { name: 'Classical', default: true, gains: [0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, -4.3200, -4.3200, -4.3200, -5.7600] },
  { name: 'Club', default: true, gains: [0.0000, 0.0000, 4.8000, 3.3600, 3.3600, 3.3600, 1.9200, 0.0000, 0.0000, 0.0000] },
  { name: 'Dance', default: true, gains: [5.7600, 4.3200, 1.4400, 0.0000, 0.0000, -3.3600, -4.3200, -4.3200, 0.0000, 0.0000] },
  { name: 'Full Bass', default: true, gains: [4.8000, 5.7600, 5.7600, 3.3600, 0.9600, -2.4000, -4.8000, -6.2400, -6.7200, -6.7200] },
  { name: 'Full Bass & Treble', default: true, gains: [4.3200, 3.3600, 0.0000, -4.3200, -2.8800, 0.9600, 4.8000, 6.7200, 7.2000, 7.2000] },
  { name: 'Full Treble', default: true, gains: [-5.7600, -5.7600, -5.7600, -2.4000, 1.4400, 6.7200, 9.6000, 9.6000, 9.6000, 10.0800] },
  { name: 'Headphones', default: true, gains: [2.8800, 6.7200, 3.3600, -1.9200, -1.4400, 0.9600, 2.8800, 5.7600, 7.6800, 8.6400] },
  { name: 'Laptop Speakers', default: true, gains: [2.8800, 6.7200, 3.3600, -1.9200, -1.4400, 0.9600, 2.8800, 5.7600, 7.6800, 8.6400] },
  { name: 'Large Hall', default: true, gains: [6.2400, 6.2400, 3.3600, 3.3600, 0.0000, -2.8800, -2.8800, -2.8800, 0.0000, 0.0000] },
  { name: 'Live', default: true, gains: [-2.8800, 0.0000, 2.4000, 3.3600, 3.3600, 3.3600, 2.4000, 1.4400, 1.4400, 1.4400] },
  { name: 'Party', default: true, gains: [4.3200, 4.3200, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 4.3200, 4.3200] },
  { name: 'Pop', default: true, gains: [0.9600, 2.8800, 4.3200, 4.8000, 3.3600, 0.0000, -1.4400, -1.4400, 0.9600, 0.9600] },
  { name: 'Reggae', default: true, gains: [0.0000, 0.0000, 0.0000, -3.3600, 0.0000, 3.8400, 3.8400, 0.0000, 0.0000, 0.0000] },
  { name: 'Rock', default: true, gains: [4.8000, 2.8800, -3.3600, -4.8000, -1.9200, 2.4000, 5.2800, 6.7200, 6.7200, 6.7200] },
  { name: 'Ska', default: true, gains: [-1.4400, -2.8800, -2.4000, 0.0000, 2.4000, 3.3600, 5.2800, 5.7600, 6.7200, 5.7600] },
  { name: 'Soft', default: true, gains: [2.8800, 0.9600, 0.0000, -1.4400, 0.0000, 2.4000, 4.8000, 5.7600, 6.7200, 7.2000] },
  { name: 'Soft rock', default: true, gains: [2.4000, 2.4000, 1.4400, 0.0000, -2.4000, -3.3600, -1.9200, 0.0000, 1.4400, 5.2800] },
  { name: 'Techno', default: true, gains: [4.8000, 3.3600, 0.0000, -3.3600, -2.8800, 0.0000, 4.8000, 5.7600, 5.7600, 5.2800] }
]

PRESETS = PRESETS.map(x=> {
  x.key = x.value = x.text = x.name
  return x
})

const DEFAULT_PRESETS = JSON.stringify(PRESETS)

for(const f of videoFilters){
  f.regexp = new RegExp(`${f.name}\\(([\\d+.%]+)`)
}

class VideoController extends React.Component {
  constructor(props) {
    super(props)

    this.handleChange = ::this.handleChange
    this.abRepeatOnChange = ::this.abRepeatOnChange
    this.presetChange = ::this.presetChange
    this.getVideoList = ::this.getVideoList
    this.resetEffect = ::this.resetEffect
    this.resetEqualizer = ::this.resetEqualizer

    this.intervalIds = []

    if(props.videos == null) this.getVideoList()

    const videos = props.videos || []
    let index = -1

    if(props.tabId) index = videos.length > 0 ? videos.findIndex(x=>x.tabId == props.tabId) : void 0
    if(index == -1) index = videos.length > 0 ? videos.findIndex(x=>x.active) : void 0
    if(index == -1) index = 0
    const selected = index === void 0 ? void 0 : videos[index].tabId

    this.prevFilter = [void 0, {}]

    const presets = PRESETS
    this.state = {videos, selected , index, presets}
  }

  getVideoList(){
    const key = Math.random().toString()
    ipc.send('get-all-tabs-video-list', key)
    ipc.once(`get-all-tabs-video-list-reply_${key}`, (e, videos, presets) => {
      let newState = { videos }
      if(presets) newState.presets = presets

      if(!videos.length){
        newState = {videos, index: void 0, selected: void 0}
      }
      else if(!this.state.selected){
        let index = -1
        if(this.props.tabId) index =  videos.length > 0 ? videos.findIndex(x=>x.tabId == this.props.tabId) : void 0
        if(index == -1) index = videos.length > 0 ? videos.findIndex(x=>x.active) : void 0
        if(index == -1) index = 0
        const selected = index === void 0 ? void 0 : videos[index].tabId
        newState = {videos, index}
        setTimeout(()=>this.setState({selected}),0)
      }
      else{
        if(!equalVideos(videos,this.state.videos)){
          let index =  videos.length > 0 ? videos.findIndex(x=>this.state.selected) : void 0
          if(index == -1) videos.findIndex(x=>x.active)
          if(index == -1) index = 0
          const selected = index === void 0 ? void 0 : videos[index].tabId
          newState = {videos, index}
          setTimeout(()=>this.setState({selected}),0)
        }

        const tmp = newState.videos[this.state.index]
        if(tmp && tmp.tabId == this.state.selected){
          newState.videos[this.state.index] = this.state.videos[this.state.index]
        }
        else{
          const ind = newState.videos.findIndex(v=>v.tabId == this.state.selected)
          if(ind != -1){
            newState.videos[ind] = this.state.videos[this.state.index]
          }
        }
      }
      this.setState(newState)
    })
  }

  componentDidMount() {
    if(!this.props.sidebar && !this.props.toolPage){
      const seg = document.querySelector('.sort-videoController .ui.basic.segment')
      seg.style.height = `${seg.closest('.div-back').clientHeight - 60}px`
    }

    const slider = document.querySelector('.ab-range-slider')
    let start = [0, 60]
    let range =  {'min': 0, 'max': 60}
    let disabled = true

    if(this.state.selected){
      const v = this.state.videos[this.state.index]
      if(v.duration != null){
        start = v.abRepeatRange || [0, v.duration]
        range = {'min': 0, 'max': v.duration}
      }
      disabled = !v.abRepeat
    }

    noUiSlider.create(slider, {
      start,
      connect: true,
      step: 0.1,
      keyboardSupport: true,
      range
    })

    slider.noUiSlider.on('update', (values, handle)=>{
      if(!this.abRange) return

      const v = this.state.videos[this.state.index]
      v.abRepeatRange = this.abRange.noUiSlider.get().map(m=>parseFloat(m))
      if(!this.abRangeNoUpdateFlag){
        ipc.send('change-video-value', v.tabId, v.location, 'abRepeat', [v.abRepeat,v.abRepeatRange])
      }
      console.log(values, handle)
    })

    this.abRange = slider
    if(disabled) slider.setAttribute('disabled', true)


    this.getVideoList()
    this.intervalIds.push(setInterval(this.getVideoList,2000))

    this.intervalIds.push(setInterval(() => {
      if(this.state.selected){
        const key = Math.random().toString()
        ipc.send('get-tab-video', key, this.state.selected)
        ipc.once(`get-tab-video-reply_${key}`, (e, video) => {
          if(!video) return

          this.state.videos[this.state.index] = {...this.state.videos[this.state.index], ...video }
          this.setState({})
        })
      }
    },100))

    this.chart = chart()
    if(this.state.selected){
      const v = this.state.videos[this.state.index]
      this.chart.prepareChart([1, ...v.equalizer])
    }
    else{
      this.chart.prepareChart([1,0,0,0,0,0,0,0,0,0,0])
    }

    window.onresize = () => {
      if(!this.state.selected){
        this.chart.prepareChart([1,0,0,0,0,0,0,0,0,0,0])
        return
      }
      const v = this.state.videos[this.state.index]
      this.chart.prepareChart([1, ...v.equalizer])
    }
  }

  componentWillUnmount() {
    for(const id of this.intervalIds) clearInterval(id)
  }

  componentDidUpdate(prevProps, prevState){
    if(this.state.selected !== prevState.selected){
      if(this.state.selected == null){
        this.abRangeUpdate(0,60, 0, 60, void 0, true)
      }
      else{
        const v = this.state.videos[this.state.index]
        if(this.chart){
          this.chart.prepareChart([1, ...v.equalizer])
        }

        if(v.abRepeat){
          this.abRangeUpdate(v.abRepeatRange[0], v.abRepeatRange[1], 0, v.duration, !v.abRepeat, v, true)
        }
        else{
          this.abRangeUpdate(0,v.duration || 60, 0, v.duration || 60, !v.abRepeat, v, true)
        }
      }
    }
  }

  abRangeUpdate(start, end, min, max, disabled, v, isNoUpdate){
    if(isNoUpdate) this.abRangeNoUpdateFlag = true

    if(disabled != null){
      if(disabled){
        this.abRange.setAttribute('disabled', true)
      }
      else{
        this.abRange.removeAttribute('disabled')
      }
      if(v) v.abRepeat = !disabled
    }

    if(min != null || max != null){
      this.abRange.noUiSlider.updateOptions({range: {'min': min, 'max': max}})
    }

    if(start != null || end != null){
      this.abRange.noUiSlider.set([start, end])
    }
    if(isNoUpdate) this.abRangeNoUpdateFlag = false
    this.setState({})
  }

  onInput(name, e){
    const v = this.state.videos[this.state.index]
    let val = name.startsWith('equalizer#') ? parseFloat(e.target.value) : parseInt(e.target.value)

    if(name.startsWith('filter#')){
      const fname = name.substring(7)
      const f = videoFilters.find(x=>x.name == fname)
      const fstr = `${fname}(${val}${f.unit})`
      if(v.filter == 'none'){
        val = fstr
      }
      else{
        val = `${v.filter.replace(new RegExp(`${fname}\\(.+?\\)`),'')} ${fstr}`
      }
      name = 'filter'
    }
    else if(name.startsWith('equalizer#')){
      const fname = name.substring(10)
      const eqInd = EQ.findIndex(x=>x.label == fname)
      v.equalizer[eqInd] = val
      // if(this.preEqualizer && this.preEqualizer.every((e,i)=> e == v.equalizer[i])) return

      name = 'equalizer'
      val = [v.preset, v.equalizer]
      this.chart.prepareChart([1,...v.equalizer])
      // this.preEqualizer = v.equalizer.slice(0)
    }

    if(['volume', 'playbackRate', 'boost', 'zoom'].includes(name)){
      val = val / 100.0
    }
    if(name != 'equalizer'){
      v[name] = val
    }

    ipc.send('change-video-value', v.tabId, v.location, name, val)
    this.setState({})
  }

  resetEqualizer(){
    const v = this.state.videos[this.state.index]
    ipc.send('change-video-value', v.tabId, v.location, 'equalizer', ['Default', [0,0,0,0,0,0,0,0,0,0]])
    this.chart.prepareChart([1,0,0,0,0,0,0,0,0,0,0])
  }

  resetEffect(){
    const v = this.state.videos[this.state.index]
    ipc.send('change-video-value', v.tabId, v.location, 'filter', 'none')
  }

  setAsDefault(type, isReset){
    const v = this.state.videos[this.state.index]
    ipc.send('change-video-value', void 0, '_default_', type, isReset ? void 0 : type == 'equalizer' ? [v.preset, v.equalizer] : v[type])

    if(isReset){
      if(type == 'equalizer'){
        this.resetEqualizer()
      }
      else if(type == 'filter'){
        this.resetEffect()
      }
    }
  }

  getTimeFull(seconds){
    if(seconds == null) return '00:00:00'

    return `${Math.floor(seconds / 3600).toString().padStart(2, '0')}:${Math.floor((seconds / 60) % 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}.${Math.round((seconds % 1) * 1000).toString().padStart(3, '0')}`
  }

  getTime(seconds){
    if(seconds == null) return '00:00'

    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`
  }

  handleChange(e, { value }){
    setTimeout(()=>this.setState({ selected: value, index: this.state.videos.findIndex(v=>v.tabId == value) }),0)
  }

  seek(type){
    const v = this.state.videos[this.state.index]
    ipc.send('change-video-value', v.tabId, v.location, 'seek', [type, this.props.data.mediaSeek1Video, this.props.data.mediaSeek3Video])
  }

  onClick(type){
    const v = this.state.videos[this.state.index]
    ipc.send('change-video-value', v.tabId, v.location, type)
  }

  onWheel(e){
    e.preventDefault()
    e.target.value = parseInt(e.target.value) + (e.target.step.includes(".") ? parseFloat(e.target.step) : parseInt(e.target.step)) * e.deltaY / 100
    e.target.oninput(e)
  }

  getThumbnails(isCapture, isDownload, imageWidth){
    const v = this.state.videos[this.state.index]
    ipc.send('get-thumbnails', v.tabId, isCapture, isDownload, imageWidth)
  }

  extractFilters(filterStyle){
    if(filterStyle == null) return {}
    if(this.prevFilter[0] == filterStyle) return this.prevFilter[1]

    const result = {}
    for(const f of videoFilters){
      const m = filterStyle.match(f.regexp)
      if(m){
        const num = f.unit == '%' && !m[1].endsWith('%') ? Math.round(parseFloat(m[1]) * 100) : parseInt(m[1])
        result[f.name] = num
      }
    }

    this.prevFilter = [filterStyle, result]
    return result
  }

  getAbRangeTime(){
    if(!this.abRange) return [0,0]
    const val = this.abRange.noUiSlider.get()
    return val.map(x=>parseFloat(x))
  }

  abRepeatOnChange(){
    const v = this.state.videos[this.state.index]
    if(v.abRepeat){
      this.abRangeUpdate(0,v.duration || 60, 0, v.duration || 60, true, v)
    }
    else{
      this.abRangeUpdate(0, v.duration || 60, 0, v.duration || 60, false, v)
    }
  }

  abRepeatTimeChange(index, e){
    const x = e.target.value.split(":")
    const val = x.length == 2 ? parseInt(x[0]) * 60 * 60 + parseInt(x[1]) * 60 : parseFloat(x[0]) * 60 * 60 + parseInt(x[1]) * 60 + parseFloat(x[2])
      this.abRange.noUiSlider.set(index == 0 ? [val, null] : [null, val])
  }

  abRepeatTimeReset(target, e){
    const v = this.state.videos[this.state.index]
    this.abRange.noUiSlider.set(target == 'A' ? [0, null] : target == 'B' ? [null, v.duration] : [0, v.duration])
  }

  presetChange(e, { value }){
    const v = this.state.videos[this.state.index]
    const preset = this.state.presets.find(x=>x.name == value)
    v.equalizer = preset.gains
    ipc.send('change-video-value', v.tabId, v.location, 'equalizer', [value, v.equalizer])
    this.chart.prepareChart([1,...v.equalizer])
    this.setState({})
  }

  async presetUpdate(type, e){
    const v = this.state.videos[this.state.index]
    if(type == 'add'){
      let name
      if(this.props.tabId){
        const value = await showDialog({
          inputable: true,
          title: 'Dialog',
          text: 'New preset name',
          needInput:  [""]
        }, this.props.tabId)
        name = value && value[0]
      }
      else{
        name = window.prompt('New preset name')
      }
      if(!name) return

      const preset = { name, key: name, value: name, text: name, default: true, gains: v.equalizer }
      this.state.presets.push(preset)
    }
    else if(type == 'save'){
      const preset = this.state.presets.find(x=>x.name == v.preset)
      preset.gains = v.equalizer
    }
    else if(type == 'del'){
      this.state.presets = this.state.presets.filter(x=>x.name != v.preset)
      this.presetChange(void 0, { value: 'Default' })
    }
    else if(type == 'reset'){
      this.state.presets = JSON.parse(DEFAULT_PRESETS)
      this.presetChange(void 0, { value: 'Default' })
    }
    ipc.send('update-preset', type, type == 'reset' ? void 0 : this.state.presets)
    this.setState({})
  }

  render() {
    const options = this.state.videos.map(v => ({key: v.tabId, value: v.tabId, text: v.title.length > 80 ? `${v.title.substr(0, 80)}...` : v.title}))
    let v = this.state.videos[this.state.index]

    const resolution = v && v.resolution
    const volume = v && Math.round(v.volume * 100)
    const boost = v && Math.round(v.boost * 100)
    const zoom = v && Math.round(v.zoom * 100)
    const playbackRate = v && Math.round(v.playbackRate * 100)
    const filter = this.extractFilters(v && v.filter)
    const equalizer = (v && v.equalizer) || [0,0,0,0,0,0,0,0,0,0]
    const preset = v && v.preset
    const abRange = this.getAbRangeTime()

    v = v || {}

    return <Container className='video-controller'>
      <Segment basic>
        <Dropdown selection options={options} value={this.state.selected}
                  onChange={this.handleChange} />
        <div className="spacer2"/>

        <span className="buttons">
          <span style={{padding: 3}}/>
          <i className={`${v.paused ? 'play' : 'pause'} icon`} aria-hidden="true" onClick={()=>this.seek('play')} />
          <i className={`repeat icon ${v.loop ? '' : 'disabled'}`} aria-hidden="true" onClick={()=>this.seek('loop')} />
          <span className="v-divider"/>
          <i className="step backward icon" aria-hidden="true" onClick={()=>this.seek('step-backward')} />
          <i className="step forward icon" aria-hidden="true" onClick={()=>this.seek('step-forward')} />
          <span className="v-divider"/>
          <i className="fast backward icon" aria-hidden="true" onClick={()=>this.seek('backward2')} />
          <i className="backward icon" aria-hidden="true" onClick={()=>this.seek('backward1')} />
          <i className="forward icon" aria-hidden="true" onClick={()=>this.seek('forward1')} />
          <i className="fast forward icon" aria-hidden="true" onClick={()=>this.seek('forward2')} />
        </span>

        <div className="spacer2" style={{height: 5}}/>

        <label className="range-label"></label>

        <div className="ui input">
          <input type="range" min="0" max={v.duration} name="currentTime" step="1" value={v.currentTime} style={{maxWidth: 800}} onInput={this.onInput.bind(this, 'currentTime')}
                 onWheel={e => {
                   e.preventDefault()
                   e.target.value = parseInt(e.target.value) + 5 * e.deltaY / 100
                   e.target.oninput(e)
                 }}/>
        </div>
        <label className="range-value">{this.getTime(v.currentTime)} / {this.getTime(v.duration)}</label>

        <div style={{height: 4}} className="spacer2"/>

        <label style={{paddingLeft: 10}} className="range-label">Resolution:{resolution}</label>

        <Divider/>

        <label style={{paddingRight: 0}} className="range-label name" onClick={()=>this.onInput('volume', {target: {value: 100}})}>Volume</label>

        <span className="buttons" style={{verticalAlign: '-4px'}}>
          <i style={{margin: '0 2px 0 1px'}} className={`${v.muted ? 'volume off' : 'volume up'} icon`} aria-hidden="true" onClick={() => this.onClick('mute')} />
        </span>

        <div className="ui input">
          <input type="range" min="0" max="100" name="boost" step="1" value={volume} onInput={this.onInput.bind(this, 'volume')} onWheel={this.onWheel}/>
        </div>
        <label className="range-value">{volume}%</label>

        <div style={{height: 8}} className="spacer2"/>

        <label className="range-label name" onClick={()=>this.onInput('boost', {target: {value: 100}})}>Vol Boost</label>
        <div className="ui input">
          <input type="range" min="0" max="800" name="boost" step="10" value={boost} onInput={this.onInput.bind(this, 'boost')} onWheel={this.onWheel}/>
        </div>
        <label className="range-value">{boost}%</label>

        <div className="spacer2"/>

        <label style={{marginRight: 21.046875}} className="range-label name" onClick={()=>this.onInput('playbackRate', {target: {value: 100}})}>Speed</label>
        <div className="ui input">
          <input type="range" min="0" max="1600" name="playbackRate" step="10" value={playbackRate} onInput={this.onInput.bind(this, 'playbackRate')} onWheel={this.onWheel}/>
        </div>
        <label className="range-value">{playbackRate}%</label>

        <div className="spacer2"/>

        <label style={{marginRight: 23.15625}} className="range-label name" onClick={()=>this.onInput('zoom', {target: {value: 100}})}>Zoom</label>
        <div className="ui input">
          <input disabled={!v.maximize} type="range" min="0" max="300" name="zoom" step="10" value={zoom} onInput={this.onInput.bind(this, 'zoom')} onWheel={this.onWheel}/>
        </div>
        <label className="range-value">{zoom}%</label>

        <Divider/>

        <Checkbox label='A-B Repeats' checked={!!v.abRepeat} onChange={this.abRepeatOnChange}/>
        <span style={{paddingLeft: 15, paddingRight: 4}}>Reset:</span>
        <Button compact primary disabled={!v.abRepeat} style={{padding: '0.35928571em 0.625em'}} onClick={this.abRepeatTimeReset.bind(this, 'A')}>A</Button>
        <Button compact primary disabled={!v.abRepeat} style={{padding: '0.35928571em 0.625em'}} onClick={this.abRepeatTimeReset.bind(this, 'B')}>B</Button>
        <Button compact primary disabled={!v.abRepeat} style={{padding: '0.35928571em 0.625em'}} onClick={this.abRepeatTimeReset.bind(this, 'AB')}>AB</Button>

        <div className="spacer2"/>

        <div className="ui input">
          <input type="time" className="input-time" step="0.1" min="00:00:00" max={this.getTimeFull(abRange[1])}
                 disabled={!v.abRepeat} value={this.getTimeFull(abRange[0])} onInput={this.abRepeatTimeChange.bind(this,0)} />
        </div>
        &nbsp;〜&nbsp;
        <div className="ui input">
          <input type="time" className="input-time" step="0.1" min={this.getTimeFull(abRange[0])} max={this.getTimeFull(v.duration)}
                 disabled={!v.abRepeat} value={this.getTimeFull(abRange[1])} onInput={this.abRepeatTimeChange.bind(this,1)}/>
        </div>
        <br/>

        <div className="ui input" style={{padding: '15px 0 0 5px', width: '100%'}}>
          <div className="ab-range-slider" style={{width: 'calc(100% - 20px)'}}/>
        </div>

        <Divider/>

        <span className='video buttons'>
          <Button compact primary onClick={()=>this.onClick('active')}>Focus</Button>
          <Button compact primary onClick={() => this.onClick('maximize')}>{v.maximize ? 'Normal' : 'Maximize'}</Button>
          <Button compact primary onClick={() => setTimeout(()=>this.onClick('fullscreen'),100)}>Fullscreen</Button>
        </span>

        <Divider/>

        <span className='video buttons'>
          <Button compact primary onClick={()=>this.getThumbnails(true, true)}>Capture</Button>
          <Button compact primary title="Thumbnails" onClick={()=>this.getThumbnails(false, false, 240)}>Thumb</Button>
          <Button compact primary title="DL Thumbnails" onClick={()=>this.getThumbnails(false, true)}>DL Thumb</Button>
        </span>

        <Divider/>

        <label className="range-label name" onClick={this.resetEqualizer}>[Equalizer]</label>
        <span className='video buttons others'>
          <Button compact primary onClick={this.setAsDefault.bind(this, 'equalizer', false)}>Set as Default</Button>
          <Button compact primary onClick={this.setAsDefault.bind(this, 'equalizer', true)}>Reset Default</Button>
        </span>

        <div style={{marginBottom: '0.4em'}} className="spacer2"/>

        <span style={{paddingRight: 6}}>
          <Dropdown onChange={this.presetChange} selection options={this.state.presets} value={preset}/>
        </span>
        <span style={{display: 'inline-block', verticalAlign: '-20px'}}>
          <span className='video buttons' style={{lineHeight: '26px'}}>
            <Button compact primary onClick={this.presetUpdate.bind(this, 'add')}>Add</Button>
            <Button compact primary onClick={this.presetUpdate.bind(this, 'save')}>Save</Button>
            <br/>
            <Button compact primary onClick={this.presetUpdate.bind(this, 'del')}>Del</Button>
            <Button compact primary onClick={this.presetUpdate.bind(this, 'reset')}>Reset</Button>
          </span>
        </span>

        <div className="spacer2"/>

        <canvas id='chart'/>
        <div className="spacer2"/>

        {EQ.map((eq,ind) => {
          return <span>
            <label style={ eq.label.includes('5') ? null : {marginRight: eq.label == '16k' ? 0.796875 : eq.label.endsWith('k') ? 8.90625 : 8.125 } } className="range-label name" onClick={()=>this.onInput(`equalizer#${eq.label}`, {target: {value: '0'}})}>{`${eq.label[0].toUpperCase()}${eq.label.substring(1)}`}</label>
            <div className="ui input">
              <input type="range" min="-12" max="12" name={eq.label} step="0.1" value={equalizer[ind] == null ? 0 : equalizer[ind]}
                     onInput={this.onInput.bind(this, `equalizer#${eq.label}`)} onWheel={this.onWheel}/>
            </div>
            <label className="range-value">{equalizer[ind] == null ? 0 : equalizer[ind]}</label>
            {ind == EQ.length - 1 ? null : <div className="spacer2"/>}
          </span>
        })}

        <Divider/>

        <label className="range-label name" onClick={this.resetEffect}>[Effect]</label>
        <span className='video buttons others'>
          <Button compact primary onClick={this.setAsDefault.bind(this, 'filter', false)}>Set as Default</Button>
          <Button compact primary onClick={this.setAsDefault.bind(this, 'filter', true)}>Reset Default</Button>
        </span>
        <div className="spacer2"/>

        {videoFilters.map((f,ind) => {
          return <span>
            <label style={{marginRight: f.margin}} className="range-label name" onClick={()=>this.onInput(`filter#${f.name}`, {target: {value: f.defaultValue}})}>{`${f.name[0].toUpperCase()}${f.name.substring(1)}`}</label>
            <div className="ui input">
              <input type="range" min="0" max={f.max} name={f.name} step={f.step} value={filter[f.name] == null ? f.defaultValue : filter[f.name]} onInput={this.onInput.bind(this, `filter#${f.name}`)} onWheel={this.onWheel}/>
            </div>
            <label className="range-value">{filter[f.name] == null ? f.defaultValue : filter[f.name]}{f.unit}</label>
            {ind == videoFilters.length - 1 ? null : <div className="spacer2"/>}
          </span>
        })}

        <Divider/>

        <label className="range-label">[Options]</label>

        <div className="spacer2"/>

        <Checkbox label='Show Current Time Badge' checked={!!v.showCurrentTime} onChange={() => this.onClick('showCurrentTime')}/>

        <div className="spacer2"/>

      </Segment>
    </Container>
  }
}

export default (props) => (
  <TopMenu videos={props.videos} data={props.data} sidebar={props.sidebar} toolPage={props.toolPage} l10n={props.l10n} tabId={props.tabId}/>
)
