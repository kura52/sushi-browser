window.debug = require('debug')('info')
import process from './process'
const ipc = require('electron').ipcRenderer
const path = require('path')
const React = require('react')
const ReactDOM = require('react-dom')
const { Sidebar, Segment, Container, Menu, Input,Divider,Icon } = require('semantic-ui-react')
const { StickyContainer, Sticky } = require('react-sticky');
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'


let resourcePath
ipc.send("get-resource-path",{})
ipc.once("get-resource-path-reply",(e,data)=>{
  resourcePath = data
})


class TopMenu extends React.Component {
  constructor(props) {
    super(props)
  }

  setToken(token){
    this.token = token
  }

  render() {
    return (
      <StickyContainer>
        <Sticky>
          <div>
            <Menu pointing secondary >
              <Menu.Item as='a' href={`${baseURL}/top.html`} key="top" name="Top"/>
              <Menu.Item as='a' href={`${baseURL}/favorite.html`} key="favorite" name="Favorite"/>
              <Menu.Item as='a' href={`${baseURL}/history.html`} key="history" name="History"/>
              <Menu.Item as='a' href={`${baseURL}/download.html`} key="download" name="Download"/>
              <Menu.Item as='a' href={`${baseURL}/explorer.html`} key="file-explorer" name="File Explorer"/>
              <Menu.Item as='a' href={`${baseURL}/terminal.html`} key="terminal" name="Terminal"/>
              <Menu.Item key="settings" name="Settings" active={true}/>
            </Menu>
          </div>
        </Sticky>
        <TopList setToken={::this.setToken}/>
      </StickyContainer>
    )
  }
}


class GeneralSetting extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <div>
      <h3>General</h3>
      <Divider/>
    </div>
  }
}

class SearchSetting extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <div>
      <h3>Search</h3>
      <Divider/>
    </div>
  }
}


class TabsSetting extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <div>
      <h3>Tabs</h3>
      <Divider/>
    </div>
  }
}


class KeyboardSetting extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <div>
      <h3>Keyboard</h3>
      <Divider/>
    </div>
  }
}


class ExtensionSetting extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <div>
      <h3>Extension</h3>
      <Divider/>
    </div>
  }
}

const routings = {
  'general' : <GeneralSetting/>,
  'search' : <SearchSetting/>,
  'tabs' : <TabsSetting/>,
  'keyboard' : <KeyboardSetting/>,
  'extension' : <ExtensionSetting/>,
}

class TopList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {page: 'general'}
  }

  isActive(str){
    return str == this.state.page
  }

  getMenu(name,icon){
    return <Menu.Item as="a" active={this.isActive(name)}
                      onClick={_=>this.setState({page:name})} name={name}>
      <Icon name={icon}/>
      {name}
    </Menu.Item>
  }

  route(name){

  }

  render() {
    return <Sidebar.Pushable style={{minHeight: 'calc(100vh - 58px)'}} as={Segment}>
      <Sidebar as={Menu} animation='slide along' width='thin' visible={true} icon='labeled' vertical inverted>
        <Menu.Item></Menu.Item>
        {this.getMenu('general','browser')}
        {this.getMenu('search','search')}
        {this.getMenu('tabs','table')}
        {this.getMenu('keyboard','keyboard')}
        {this.getMenu('extension','industry')}
      </Sidebar>
      <Sidebar.Pusher>
        <Segment basic>
          {routings[this.state.page]}
        </Segment>
      </Sidebar.Pusher>
    </Sidebar.Pushable>
  }

}

const App = () => (
  <Container>
    <TopMenu/>
  </Container>
)


ReactDOM.render(<App />,  document.getElementById('app'))