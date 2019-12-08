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
        <VideoPlayer word={this.state.word} videos={this.props.videos} setToken={::this.setToken}/>
      </StickyContainer>
    )
  }
}

class VideoPlayer extends React.Component {
  constructor(props) {
    super(props)
    let index =  props.videos.length > 0 ? props.videos.findIndex(x=>x.active) : void 0
    if(index == -1) index = 0

    this.state = {videos: props.videos, selected : index === void 0 ? void 0 : props.videos[index].tabId, index}
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
        this.setState({videos})
      })
    },1000)
  }

  onInput(name, e){
    const v = this.state.videos[this.state.index]
    let val = parseInt(e.target.value)
    if(['volume', 'playbackRate'].includes(name)){
      val = val / 100.0
    }
    v[name] = val

    ipc.send('change-video-value', v.tabId, name, val)
    this.setState({})
  }

  getTime(seconds){
    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`
  }

  render() {

    //@TODO 特定のビデオだけ細かく更新
    //@TODO それぞれのをやる

    const options = this.state.videos.map(v => ({key: v.tabId, value: v.tabId, text: v.title}))
    const v = this.state.videos[this.state.index]

    const volume = v && Math.round(v.volume * 100)
    const playbackRate = v && Math.round(v.playbackRate * 100)

    return <Container>
      <Segment basic>
        <Dropdown selection options={options} defaultValue={this.state.selected} />

        <div className="spacer2"/>

        player(play/pause, frame,
        <div className="spacer2"/>

        <label className="range-label"></label>
        <div className="ui input">
          <input type="range" min="0" max={v.duration} name="currentTime" step="1" value={v.currentTime} onInput={this.onInput.bind(this, 'currentTime')}/>
        </div>
        <label className="range-value">{this.getTime(v.currentTime)}/{this.getTime(v.duration)}</label>

        <div className="spacer2"/>

        <div className="spacer2"/>
        thumbnail
        <div className="spacer2"/>

        <div className="spacer2"/>
        maximize
        <div className="spacer2"/>

        Repeat

        <div className="spacer2"/>

        <label className="range-label">Volume:</label>
        <div className="ui input">
          <input type="range" min="0" max="100" name="volume" step="1" value={volume} onInput={this.onInput.bind(this, 'volume')}/>
        </div>
        <label className="range-value">{volume}%</label>

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
    <TopMenu videos={props.videos}/>
)

const key = Math.random().toString()
ipc.send('get-all-tabs-video-list', key)
ipc.once(`get-all-tabs-video-list-reply_${key}`, async (e, videos) => {
  await initPromise
  ReactDOM.render(<App videos={videos}/>,  document.getElementById('app'))
})