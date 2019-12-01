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
        <DownloadList word={this.state.word} setToken={::this.setToken}/>
      </StickyContainer>
    )
    return <div style={{paddingTop: "10px"}}><DownloadList setToken={::this.setToken}/></div>
  }
}

let debounceInterval = 40, debounceTimer
class DownloadList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }


  componentDidMount() {
    var slider = document.getElementById('test-slider');
    noUiSlider.create(slider, {
      start: [20, 80],
      connect: true,
      step: 1,
      orientation: 'horizontal', // 'horizontal' or 'vertical'
      range: {
        'min': 0,
        'max': 100
      },
    });

  }


  render() {

    return <Container>
      <Segment basic>
        <Dropdown selection>
          <Dropdown.Menu>
            <Dropdown.Item text='New' />
            <Dropdown.Item text='Open...' description='ctrl + o' />
            <Dropdown.Item text='Save as...' description='ctrl + s' />
            <Dropdown.Item text='Rename' description='ctrl + r' />
            <Dropdown.Item text='Make a copy' />
            <Dropdown.Item icon='folder' text='Move to folder' />
            <Dropdown.Item icon='trash' text='Move to trash' />
            <Dropdown.Divider />
            <Dropdown.Item text='Download As...' />
            <Dropdown.Item text='Publish To Web' />
            <Dropdown.Item text='E-mail Collaborators' />
          </Dropdown.Menu>
        </Dropdown>

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
          <div id="test-slider" style="width:200px;"></div>
        </div>
        <label style="vertical-align: -2px; padding-left: 10px;">right</label>

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

const App = () => (
    <TopMenu/>
)

;(async ()=>{
  await initPromise
  ReactDOM.render(<App />,  document.getElementById('app'))
})()