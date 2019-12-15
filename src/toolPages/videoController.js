window.debug = require('debug')('info')
// require('debug').enable("info")
import process from './process'
import {ipcRenderer as ipc} from './ipcRenderer'
import React from 'react';
import ReactDOM from 'react-dom';
import {Segment, Container, Menu, Button, Dropdown, Divider, Checkbox} from 'semantic-ui-react';
import {StickyContainer, Sticky} from 'react-sticky';
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'

import l10n from '../../brave/js/l10n';
const initPromise = l10n.init()
import '../defaultExtension/contentscript'


function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}



function chart() {
  let canvas, context
  const px = (window.devicePixelRatio > 1) ? 2 : 1
  const prepareChart = eq => {

    const scale = Math.min((window.innerWidth - 15) / 330, 2)
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
    return (
      <StickyContainer>
        <Sticky>
          <div>
            <Menu pointing secondary >
              <Menu.Item as='a' href={`${baseURL}/favorite_sidebar.html`} key="favorite" icon="star"/>
              <Menu.Item as='a' href={`${baseURL}/history_sidebar.html`} key="history" icon="history"/>
              <Menu.Item as='a' key="download" icon="download" active={true}/>
              <Menu.Item as='a' href={`${baseURL}/note_sidebar.html`} key="note" icon="sticky note"/>
              <Menu.Item as='a' href={`${baseURL}/saved_state_sidebar.html`} key="database" icon="database"/>
              <Menu.Item as='a' href={`${baseURL}/tab_trash_sidebar.html`} key="trash" icon="trash"/>
              <Menu.Item as='a' href={`${baseURL}/tab_history_sidebar.html`} key="tags" icon="tags"/>
              <Menu.Item as='a' href={`${baseURL}/explorer_sidebar.html`} key="file-explorer" icon="folder"/>
            </Menu>
          </div>
        </Sticky>
        <VideoController word={this.state.word} videos={this.props.videos} data={this.props.data} setToken={::this.setToken}/>
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

for(const f of videoFilters){
  f.regexp = new RegExp(`${f.name}\\(([\\d+.%]+)`)
}

class VideoController extends React.Component {
  constructor(props) {
    super(props)

    this.handleChange = ::this.handleChange
    this.abRepeatOnChange = ::this.abRepeatOnChange
    this.presetChange = ::this.presetChange

    let index =  props.videos.length > 0 ? props.videos.findIndex(x=>x.active) : void 0
    if(index == -1) index = 0
    const selected = index === void 0 ? void 0 : props.videos[index].tabId

    this.prevFilter = [void 0, {}]

    this.state = {videos: props.videos, selected , index}
  }


  componentDidMount() {
    const slider = document.querySelector('.ab-range-slider')
    let start = [0, 100]
    let range =  {'min': 0, 'max': 100}
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
      step: 1,
      keyboardSupport: true,
      range
    })

    slider.noUiSlider.on('update', (values, handle)=>{
      if(!this.abRange) return

      const v = this.state.videos[this.state.index]
      v.abRepeatRange = this.abRange.noUiSlider.get().map(m=>parseInt(m))
      ipc.send('change-video-value', v.tabId, 'abRepeat', [v.abRepeat,v.abRepeatRange])

      console.log(values, handle)
    })

    this.abRange = slider
    if(disabled) slider.setAttribute('disabled', true)


    const func = () => {
      const key = Math.random().toString()
      ipc.send('get-all-tabs-video-list', key)
      ipc.once(`get-all-tabs-video-list-reply_${key}`, (e, videos) => {
        let newState = { videos }
        if(!videos.length){
          newState = {videos, index: void 0, selected: void 0}
        }
        else if(!this.state.selected){
          let index =  videos.length > 0 ? videos.findIndex(x=>x.active) : void 0
          if(index == -1) index = 0
          const selected = index === void 0 ? void 0 : videos[index].tabId
          newState = {videos, index}
          setTimeout(()=>this.setState({selected}),0)
        }
        else{
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
    func()
    setInterval(func,2000)

    setInterval(() => {
      if(this.state.selected){
        const key = Math.random().toString()
        ipc.send('get-tab-video', key, this.state.selected)
        ipc.once(`get-tab-video-reply_${key}`, (e, video) => {
          this.state.videos[this.state.index] = {...this.state.videos[this.state.index], ...video }
          this.setState({})
        })
      }
    },100)

    this.chart = chart()
    if(this.state.selected){
      const v = this.state.videos[this.state.index]
      this.chart.prepareChart([1, ...v.equalizer])
    }
    else{
      this.chart.prepareChart([1,0,0,0,0,0,0,0,0,0,0])
    }

    window.onresize = () => {
      if(!this.state.selected) return
      const v = this.state.videos[this.state.index]
      this.chart.prepareChart([1, ...v.equalizer])
    }
  }

  componentDidUpdate(prevProps, prevState){
    if(this.state.selected !== prevState.selected){
      if(this.state.selected == null){
        this.abRangeUpdate(0,100, 0, 100, true)
      }
      else{
        const v = this.state.videos[this.state.index]
        if(v.abRepeat){
          this.abRangeUpdate(v.abRepeatRange[0], v.abRepeatRange[1], 0, v.duration, v.abRepeat, v)
        }
        else{
          this.abRangeUpdate(0,v.duration, 0, v.duration, !v.abRepeat, v)
        }
      }
    }
  }

  abRangeUpdate(start, end, min, max, disabled, v){
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
      this.abRange.noUiSlider.updateOptions({range: {'min': start, 'max': end}})
    }

    if(start != null || end != null){
      this.abRange.noUiSlider.set([start, end])
    }
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

    ipc.send('change-video-value', v.tabId, name, val)
    this.setState({})
  }

  getTime(seconds){
    if(seconds == null) return '00:00'

    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`
  }

  handleChange(e, { value }){
    this.setState({ selected: value, index: this.state.videos.findIndex(v=>v.tabId == value) })
  }

  seek(type){
    const v = this.state.videos[this.state.index]
    ipc.send('change-video-value', v.tabId, 'seek', [type, this.props.data.mediaSeek1Video, this.props.data.mediaSeek3Video])
  }

  onClick(type){
    const v = this.state.videos[this.state.index]
    ipc.send('change-video-value', v.tabId, type)
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
    if(!this.abRange) return ''
    const val = this.abRange.noUiSlider.get()
    return val.map(x=>this.getTime(parseInt(x))).join(' - ')
  }

  abRepeatOnChange(){
    const v = this.state.videos[this.state.index]
    if(v.abRepeat){
      this.abRangeUpdate(0,100, 0, 100, true, v)
    }
    else{
      this.abRangeUpdate(0, v.duration, 0, v.duration, false, v)
    }
  }

  presetChange(e, { value }){
    const v = this.state.videos[this.state.index]
    const preset = PRESETS.find(x=>x.name == value)
    v.equalizer = preset.gains
    ipc.send('change-video-value', v.tabId, 'equalizer', [value, v.equalizer])
    this.chart.prepareChart([1,...v.equalizer])
    this.setState({})
  }

  render() {

    const options = this.state.videos.map(v => ({key: v.tabId, value: v.tabId, text: v.title}))
    let v = this.state.videos[this.state.index]

    const volume = v && Math.round(v.volume * 100)
    const boost = v && Math.round(v.boost * 100)
    const zoom = v && Math.round(v.zoom * 100)
    const playbackRate = v && Math.round(v.playbackRate * 100)
    const filter = this.extractFilters(v && v.filter)
    const equalizer = v && v.equalizer
    const preset = v && v.preset

    v = v || {}

    return <Container>
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

        <div className="spacer2"/>

        <label className="range-label"></label>

        <div className="ui input">
          <input type="range" min="0" max={v.duration} name="currentTime" step="1" value={v.currentTime} onInput={this.onInput.bind(this, 'currentTime')}
                 onWheel={e => {
                   e.preventDefault()
                   e.target.value = parseInt(e.target.value) + 5 * e.deltaY / 100
                   e.target.oninput(e)
                 }}/>
        </div>
        <label className="range-value">{this.getTime(v.currentTime)} / {this.getTime(v.duration)}</label>

        <Divider/>

        <label style={{marginRight: 12}} className="range-label name" onClick={()=>this.onInput('volume', {target: {value: 100}})}>Volume</label>
        <div className="ui input">
          <input type="range" min="0" max="100" name="boost" step="1" value={volume} onInput={this.onInput.bind(this, 'volume')} onWheel={this.onWheel}/>
        </div>
        <label className="range-value">{volume}%</label>

        <span className="buttons" style={{verticalAlign: '-2px'}}>
          <i className={`${v.muted ? 'volume off' : 'volume up'} icon`} aria-hidden="true" onClick={() => this.onClick('mute')} />
        </span>

        <div className="spacer2"/>

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

        <div className="spacer2"/>

        <Checkbox label={v.abRepeat ? `A-B Repeats [${this.getAbRangeTime()}]` : 'A-B Repeats'} checked={!!v.abRepeat}
                  onChange={this.abRepeatOnChange}/>
        <br/>

        <div className="ui input" style={{padding: '15px 0 0 5px'}}>
          <div className="ab-range-slider" style={{width: 'calc(100vw - 62px)'}}/>
        </div>

        <Divider/>

        <Button compact primary onClick={()=>this.onClick('active')}>Focus</Button>
        <Button compact primary onClick={() => this.onClick('maximize')}>{v.maximize ? 'Normal' : 'Maximize'}</Button>
        <Button compact primary onClick={() => setTimeout(()=>this.onClick('fullscreen'),100)}>Fullscreen</Button>

        <Divider/>

        <span style={{whiteSpace: 'pre'}}>
          <Button compact primary onClick={()=>this.getThumbnails(true, true)}>Capture</Button>
          <Button compact primary title="Thumbnails" onClick={()=>this.getThumbnails(false, false, 240)}>Thumb</Button>
          <Button compact primary title="DL Thumbnails" onClick={()=>this.getThumbnails(false, true)}>DL Thumb</Button>
        </span>

        <Divider/>

        <label className="range-label">[Equalizer]</label>
        <div className="spacer2"/>

        <Dropdown onChange={this.presetChange} selection options={PRESETS} value={preset}/>
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

        <label className="range-label">[Effect]</label>
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

      </Segment>
    </Container>
  }
}

const App = (props) => (
  <TopMenu videos={props.videos} data={props.data}/>
)

const key = Math.random().toString()

ipc.send("get-main-state",key,['mediaSeek1Video','mediaSeek3Video','isVolumeControl'])
ipc.once(`get-main-state-reply_${key}`,async (e,data)=>{
  ipc.send('get-all-tabs-video-list', key)
  ipc.once(`get-all-tabs-video-list-reply_${key}`, async (e, videos) => {
    await initPromise
    ReactDOM.render(<App videos={videos} data={data}/>,  document.getElementById('app'))
  })
})