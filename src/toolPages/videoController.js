window.debug = require('debug')('info')
// require('debug').enable("info")
import process from './process'
import {ipcRenderer as ipc} from './ipcRenderer'
import React from 'react';
import ReactDOM from 'react-dom';
import {Progress, Segment, Container, List, Menu, Input, Icon, Button, Dropdown} from 'semantic-ui-react';
import {StickyContainer, Sticky} from 'react-sticky';
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'

import l10n from '../../brave/js/l10n';
const initPromise = l10n.init()
import '../defaultExtension/contentscript'


function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
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

class VideoController extends React.Component {
  constructor(props) {
    super(props)

    this.handleChange = ::this.handleChange

    let index =  props.videos.length > 0 ? props.videos.findIndex(x=>x.active) : void 0
    if(index == -1) index = 0
    const selected = index === void 0 ? void 0 : props.videos[index].tabId

    this.state = {videos: props.videos, selected , index}
  }


  componentDidMount() {
    const slider = document.getElementById('test-slider')
    noUiSlider.create(slider, {
      start: [20, 80],
      connect: true,
      step: 1,
      orientation: 'horizontal',
      range: {
        'min': 0,
        'max': 100
      },
    })

    setInterval(() => {
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
        this.setState(newState)
      })
    },1000)
  }

  onInput(name, e){
    const v = this.state.videos[this.state.index]
    let val = parseInt(e.target.value)
    if(['volume', 'playbackRate', 'boost'].includes(name)){
      val = val / 100.0
    }
    v[name] = val

    ipc.send('change-video-value', v.tabId, name, val)
    this.setState({})
  }

  getTime(seconds){
    if(seconds == null) return '00:00'

    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`
  }

  handleChange(e, { value }){
    this.setState({ selected: value })
  }

  seek(type){
    const v = this.state.videos[this.state.index]
    ipc.send('change-video-value', v.tabId, 'seek', [type, this.props.data.mediaSeek1Video, this.props.data.mediaSeek3Video])
  }

  onClick(type){
    const v = this.state.videos[this.state.index]
    ipc.send('change-video-value', v.tabId, type)
  }

  render() {

    const options = this.state.videos.map(v => ({key: v.tabId, value: v.tabId, text: v.title}))
    let v = this.state.videos[this.state.index]

    const volume = v && Math.round(v.volume * 100)
    const boost = v && Math.round(v.boost * 100)
    const playbackRate = v && Math.round(v.playbackRate * 100)

    v = v || {}

    return <Container>
      <Segment basic>
        <Dropdown selection options={options} value={this.state.selected}
                  onChange={this.handleChange} />

        <div className="spacer2"/>

        <span className="buttons">
          <i className="fast backward icon" aria-hidden="true" onClick={()=>this.seek('backward2')} />
          <i className="backward icon" aria-hidden="true" onClick={()=>this.seek('backward1')} />
          <i className="step backward icon" aria-hidden="true" onClick={()=>this.seek('step-backward')} />
          <i className={`${v.paused ? 'play' : 'pause'} icon`} aria-hidden="true" onClick={()=>this.seek('play')} />
          <i className="step forward icon" aria-hidden="true" onClick={()=>this.seek('step-forward')} />
          <i className="forward icon" aria-hidden="true" onClick={()=>this.seek('forward1')} />
          <i className="fast forward icon" aria-hidden="true" onClick={()=>this.seek('forward2')} />
        </span>

        <div className="spacer2"/>

        <label className="range-label"></label>
        <div className="ui input">
          <input type="range" min="0" max={v.duration} name="currentTime" step="1" value={v.currentTime} onInput={this.onInput.bind(this, 'currentTime')}/>
        </div>
        <label className="range-value">{this.getTime(v.currentTime)} / {this.getTime(v.duration)}</label>

        <div className="spacer2"/>

        特定のビデオだけ細かく更新
        全ビデオを更新しているが、対象のビデオだけ更新
        リピート/区間リピート
        ビデオエフェクト
        イコライザー
        Zoom
        サムネイル

        <div className="spacer2"/>
        thumbnail
        <div className="spacer2"/>

        <div className="spacer2"/>
        <Button compact primary onClick={() => this.onClick('maximize')}>{v.maximize ? 'Normal' : 'Maximize'}</Button>
        <Button compact primary onClick={() => setTimeout(()=>this.onClick('fullscreen'),100)}>Fullscreen</Button>
        <div className="spacer2"/>
        Repeat

        <div className="spacer2"/>

        <label className="range-label">Volume:</label>
        <div className="ui input">
          <input type="range" min="0" max="100" name="boost" step="1" value={volume} onInput={this.onInput.bind(this, 'volume')}/>
        </div>
        <label className="range-value">{volume}%</label>

        <span className="buttons" style={{verticalAlign: '-2px'}}>
          <i className={`${v.muted ? 'volume off' : 'volume up'} icon`} aria-hidden="true" onClick={() => this.onClick('mute')} />
        </span>

        <div className="spacer2"/>

        <label className="range-label">Vol Boost:</label>
        <div className="ui input">
          <input type="range" min="0" max="800" name="boost" step="10" value={boost} onInput={this.onInput.bind(this, 'boost')}/>
        </div>
        <label className="range-value">{boost}%</label>

        <div className="spacer2"/>

        zoom
        <div className="spacer2"/>

        <label className="range-label">Speed:</label>
        <div className="ui input">
          <input type="range" min="0" max="1600" name="playbackRate" step="10" value={playbackRate} onInput={this.onInput.bind(this, 'playbackRate')}/>
        </div>
        <label className="range-value">{playbackRate}%</label>


        <div className="spacer2"/>
        brightness(100%) contrast(100%) saturate(100%) grayscale(0%) invert(0%) sepia(0%) hue-rotate(0deg) blur(0px)
        brightness
        <div className="spacer2"/>
        contrast
        <div className="spacer2"/>

        Equalizer
        <div className="spacer2"/>

        <div className="spacer2"></div>

        <label className="range-label">left</label>
        <div className="ui input">
          <div id="test-slider" style="width:200px;"></div>
        </div>
        <label className="range-value">right</label>

        <div className="spacer2"></div>

        <label style="vertical-align: -2px; padding-right: 10px;">left</label>
        <div className="ui input">
          <input type="range" min="0" max="100" name="imageQuality" step="1" value="80"
                 style="padding: 0.2em 0px;"/>
        </div>
        <label style="vertical-align: -2px; padding-left: 10px;">right</label>

        <div className="spacer2"></div>

        <label style="vertical-align: -2px; padding-right: 10px;">left</label>
        <div className="ui input">
          <input type="range" min="0" max="100" name="imageQuality" step="1" value="80"
                 style="padding: 0.2em 0px;"/>
        </div>
        <label style="vertical-align: -2px; padding-left: 10px;">right</label>

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