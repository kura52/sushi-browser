window.debug = require('debug')('info')
import process from './process'
const ipc = require('electron').ipcRenderer
const path = require('path')
const React = require('react')
const ReactDOM = require('react-dom')
const {  Form, TextArea, Grid, Sidebar, Segment, Container, Menu, Input,Divider, Button, Checkbox, Icon, Table, Dropdown } = require('semantic-ui-react');
const { StickyContainer, Sticky } = require('react-sticky');
const l10n = require('../../brave/js/l10n')
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'
l10n.init()

class Converter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return <div>
      <h3>Video Converter</h3>
      <Divider/>

      <Grid columns={7}>
        <Grid.Row>
          <Grid.Column>
            <label>File Format</label>
            <Dropdown onChange={_=>_} selection
                      options={[
                        {key:'suggestionToHistory',value:'suggestionToHistory',text:'Suggestion -> '},
                        {key:'historyToSuggestion',value:'historyToSuggestion',text:'History -> '},
                      ]}
                      defaultValue={'suggestionToHistory'}/>
          </Grid.Column>
          <Grid.Column>
            <label>File Format</label>
            <Dropdown onChange={_=>_} selection
                      options={[
                        {key:'suggestionToHistory',value:'suggestionToHistory',text:'Suggestion -> '},
                        {key:'historyToSuggestion',value:'historyToSuggestion',text:'History -> '},
                      ]}
                      defaultValue={'suggestionToHistory'}/>
          </Grid.Column>
          <Grid.Column>
            <label>File Format</label>
            <Dropdown onChange={_=>_} selection
                      options={[
                        {key:'suggestionToHistory',value:'suggestionToHistory',text:'Suggestion -> '},
                        {key:'historyToSuggestion',value:'historyToSuggestion',text:'History -> '},
                      ]}
                      defaultValue={'suggestionToHistory'}/>
          </Grid.Column>
          <Grid.Column>
            <label>File Format</label>
            <Dropdown onChange={_=>_} selection
                      options={[
                        {key:'suggestionToHistory',value:'suggestionToHistory',text:'Suggestion -> '},
                        {key:'historyToSuggestion',value:'historyToSuggestion',text:'History -> '},
                      ]}
                      defaultValue={'suggestionToHistory'}/>
          </Grid.Column>
        </Grid.Row>

      </Grid>
    </div>
  }
}

class TopMenu extends React.Component {
  constructor(props) {
    super(props)
  }


  render() {
    return (
      <StickyContainer>
        <Sticky>
          <div>
            <Menu pointing secondary >
              <Menu.Item as='a' href={`chrome://newtab/`} key="top" name="Top"/>
              <Menu.Item as='a' href={`chrome://bookmarks/`} key="favorite" name={l10n.translation('bookmarks')}/>
              <Menu.Item as='a' href={`chrome://history/`} key="history" name={l10n.translation('history')}/>
              <Menu.Item as='a' href={`${baseURL}/download.html`} key="download" name={l10n.translation('downloads')}/>
              <Menu.Item as='a' href={`${baseURL}/explorer.html`} key="file-explorer" name="File Explorer"/>
              <Menu.Item as='a' href={`${baseURL}/terminal.html`} key="terminal" name="Terminal"/>
              <Menu.Item key="settings" name={l10n.translation('settings')} active={true}/>
            </Menu>
          </div>
        </Sticky>
        <Segment basic>
        <Converter/>
        </Segment>
      </StickyContainer>
    )
  }
}
const App = () => (
  <Container>
    <TopMenu/>
  </Container>
)


ipc.send("get-main-state",['startsWith'])
ipc.once("get-main-state-reply",(e,data)=>{
  ReactDOM.render(<App />,  document.getElementById('app'))
})
