
window.debug = require('debug')('info')
import process from './process'
const ipc = require('electron').ipcRenderer
const path = require('path')
const React = require('react')
const ReactDOM = require('react-dom')
const { Sidebar, Segment, Container, Menu, Input,Divider, Button, Checkbox, Icon, Table, Dropdown } = require('semantic-ui-react')
const { StickyContainer, Sticky } = require('react-sticky');
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'


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
    this.state = {searchProviders: []}
    this.emitChange = ::this.emitChange
    this.onBlur = ::this.onBlur
    this.changeCheck = ::this.changeCheck
    this.addSite = ::this.addSite
  }

  componentWillMount(){
    ipc.send("get-main-state","searchProviders searchEngine")
    ipc.once("get-main-state-reply",(e,data)=>{
      const [searchProviders, searchEngine] = data
      let arr = []
      for(let [name,value] of Object.entries(searchProviders)){
        arr[value.ind] = value
      }
      this.setState({searchProviders: arr.filter(x=>x),default: searchEngine})
    })
  }


  changeCheck(e,i,name,data){
    const val = data.toggle
    ipc.send('save-state',{tableName:'state',key:'searchEngine',val:name})
    this.setState({default: name})
  }

  emitChange(e){
    const name = e.target.dataset.name
    const i = parseInt(e.target.dataset.num)
    const val = e.target.innerText
    if(name == "name" && this.state.searchProviders[i][name] == this.state.default){
      ipc.send('save-state',{tableName:'state',key:'searchEngine',val})
    }
    this.state.searchProviders[i][name] = val
    ipc.send('save-state',{tableName:'searchEngine',val:this.state.searchProviders})
  }

  onBlur(e){
    this.emitChange(e)
    this.setState({})
  }

  typeChange(i,e,data){
    console.log(i,e,data)
    this.state.searchProviders[i].type = data.value
    ipc.send('save-state',{tableName:'searchEngine',val:this.state.searchProviders})
    this.setState({})
  }

  multipleChange(i,e,data){
    console.log(i,e,data)
    this.state.searchProviders[i].multiple = data.value
    ipc.send('save-state',{tableName:'searchEngine',val:this.state.searchProviders})
    this.setState({})
  }


  buildSearchEngineColumns(){
    const ret = []
    for(let values of this.state.searchProviders){
      if(values.multiple) continue
      ret.push(this.buildSearchEngineColumn(values.ind,values.name,values.search,values.shortcut))
    }
    return ret
  }

  buildSearchEngineColumn(i,name,url,alias){
    const checked = name == this.state.default
    return <tr key={`tr${i}`}>
      <td key={`default${i}`}>
        <Checkbox disabled={checked} checked={checked} toggle onChange={(e,data)=>this.changeCheck(e,i,name,data)}/>
      </td>
      <td key={`name${i}`} data-num={i} data-name='name' onInput={this.emitChange} onBlur={this.onBlur} contentEditable>{name}</td>
      <td key={`search${i}`} data-num={i} data-name='search' onInput={this.emitChange} onBlur={this.onBlur} contentEditable>{url}</td>
      <td key={`shortcut${i}`} data-num={i} data-name='shortcut' onInput={this.emitChange} onBlur={this.onBlur} contentEditable>{alias}</td>
    </tr>
  }

  buildMultiSearchColumns(){
    let options = []
    for(let values of this.state.searchProviders){
      if(values.multiple) continue
      options.push({ key: values.name, text: values.name, value: values.name })
    }

    const ret = []
    for(let values of this.state.searchProviders){
      if(!values.multiple) continue
      ret.push(this.buildMultiSearchColumn(values.ind,values.name,values.multiple,values.type,values.shortcut,options))
    }
    return ret
  }

  buildMultiSearchColumn(i,name,multiple,type,alias,options){
    console.log(333,type)
    const checked = name == this.state.default
    return <tr key={`tr${i}`}>
      <td key={`default${i}`}>
        <Checkbox disabled={checked} checked={checked} toggle onChange={(e,data)=>this.changeCheck(e,i,name,data)}/>
      </td>
      <td key={`name${i}`} data-num={i} data-name='name' onInput={this.emitChange} onBlur={this.emitChange} contentEditable>{name}</td>
      <td key={`multiple${i}`}>
        <Dropdown placeholder='State' fluid multiple search selection onChange={this.multipleChange.bind(this,i)} options={options} defaultValue={multiple}/>
      </td>
      <td key={`type${i}`}>
        <Dropdown placeholder='State' fluid selection className="type" onChange={this.typeChange.bind(this,i)}
                  options={[
          { key: 'basic', text: 'open a panel', value: 'basic' },
          { key: 'two', text: 'open two panel', value: 'two' },
          { key: 'new-win', text: 'open to new window', value: 'new-win' },
          { key: 'one-line', text: ' one line in new window', value: 'one-line' },
          { key: 'two-line', text: 'two line in new window', value: 'two-line' },
          { key: 'three-line', text: 'three line in new window', value: 'three-line' },
        ]} defaultValue={type}/>
      </td>
      <td key={`shortcut${i}`} data-num={i} data-name='shortcut' onInput={this.emitChange} onBlur={this.onBlur} contentEditable>{alias}</td>
    </tr>
  }

  addSite(multiple){
    const max = Math.max(...this.state.searchProviders.map(x=>x.ind))+1
    const newRecord = {name:"",search:"",shortcut:"", ind:max,updated_at:Date.now()}
    if(multiple){
      newRecord.multiple = []
      newRecord.type = 'one-line'
    }
    this.state.searchProviders.push(newRecord)
    this.setState({})
  }

  render() {
    return <div>
      <h3>Multi Search</h3>
      <Divider/>
      <table className="ui celled compact table">
        <thead>
        <tr>
          <th>Default</th>
          <th>Name</th>
          <th>Search List</th>
          <th>Type</th>
          <th>Alias</th>
        </tr>
        </thead>
        <tbody>
        {this.buildMultiSearchColumns()}
        </tbody>
        <tfoot className="full-width">
        <tr>
          <th>
          </th>
          <th colspan="4">
            <button className="ui small icon primary button" onClick={_=>this.addSite(true)}>Add Search Engine</button>
          </th>
        </tr>
        </tfoot>
      </table>


      <h3>Search Engine</h3>
      <Divider/>
      <table className="ui celled compact table">
        <thead>
        <tr>
          <th>Default</th>
          <th>Name</th>
          <th>Search URL</th>
          <th>Alias</th>
        </tr>
        </thead>
        <tbody>
        {this.buildSearchEngineColumns()}
        </tbody>
        <tfoot className="full-width">
        <tr>
          <th>
          </th>
          <th colspan="4">
            <button className="ui small icon primary button" onClick={_=>this.addSite()}>Add Search Engine</button>
          </th>
        </tr>
        </tfoot>
      </table>
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
    console.log
    this.state = {page: location.hash.startsWith("#") ? location.hash.slice(1) : 'general'}
  }

  isActive(str){
    return str == this.state.page
  }

  getMenu(name,icon){
    return <Menu.Item as="a" href={`#${name}`} active={this.isActive(name)}
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