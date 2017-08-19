window.debug = require('debug')('info')
import process from './process'
const ipc = require('electron').ipcRenderer
const path = require('path')
const React = require('react')
const ReactDOM = require('react-dom')
const isAccelerator = require("electron-is-accelerator")
const { Grid, Sidebar, Segment, Container, Menu, Input,Divider, Button, Checkbox, Icon, Table, Dropdown } = require('semantic-ui-react')
const { StickyContainer, Sticky } = require('react-sticky');
const l10n = require('../../brave/js/l10n')
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'
l10n.init()

const isDarwin = navigator.userAgent.includes('Mac OS X')
const keyMapping = {
  keySettings: l10n.translation(isDarwin ? 'preferences' : 'settings'),
  keyNewTab: l10n.translation('newTab'),
  keyNewPrivateTab: l10n.translation('newPrivateTab'),
  keyNewWindow: l10n.translation('newWindow'),
  keyOpenLocation: l10n.translation('openLocation'),
  keyCloseTab: l10n.translation('closeTab'),
  keyCloseWindow: l10n.translation('closeWindow'),
  keySavePageAs: l10n.translation('savePageAs'),
  keyPrint: l10n.translation('print'),
  keyQuit: l10n.translation('quitApp').replace('Brave','Sushi Browser'),
  keyUndo: l10n.translation('undo'),
  keyRedo: l10n.translation('redo'),
  keyCut: l10n.translation('cut'),
  keyCopy: l10n.translation('copy'),
  keyPaste: l10n.translation('paste'),
  keyPasteWithoutFormatting: l10n.translation('pasteWithoutFormatting'),
  keySelectAll: l10n.translation('selectAll'),
  keyFindOnPage: l10n.translation('findOnPage'),
  keyFindNext:  l10n.translation('findNext'),
  keyFindPrevious:  l10n.translation('findPrevious'),
  keyActualSize: l10n.translation('actualSize'),
  keyZoomIn: l10n.translation('zoomIn'),
  keyZoomOut: l10n.translation('zoomOut'),
  keyStop: l10n.translation('stop'),
  keyReloadPage: l10n.translation('reloadPage'),
  keyCleanReload: l10n.translation('cleanReload'),
  keyToggleDeveloperTools: l10n.translation('toggleDeveloperTools'),
  keyToggleFullScreenView: l10n.translation('toggleFullScreenView'),
  keyHome: l10n.translation('home'),
  keyBack: l10n.translation('back'),
  keyForward: l10n.translation('forward'),
  keyReopenLastClosedTab: l10n.translation('reopenLastClosedTab'),
  keyShowAllHistory: l10n.translation('showAllHistory'),
  keyBookmarkPage: l10n.translation('bookmarkPage'),
  keyBookmarksManager: l10n.translation('bookmarksManager'),
  keyViewPageSource: l10n.translation('viewPageSource'),
  keyMinimize: l10n.translation('minimize'),
  keySelectNextTab: l10n.translation('selectNextTab'),
  keySelectPreviousTab: l10n.translation('selectPreviousTab'),
  keyTab1: l10n.translation('3635030235490426869'),
  keyTab2: l10n.translation('4888510611625056742'),
  keyTab3: l10n.translation('5860209693144823476'),
  keyTab4: l10n.translation('5846929185714966548'),
  keyTab5: l10n.translation('7955383984025963790'),
  keyTab6: l10n.translation('3128230619496333808'),
  keyTab7: l10n.translation('3391716558283801616'),
  keyTab8: l10n.translation('6606070663386660533'),
  keyLastTab: l10n.translation('9011178328451474963'),
  keyToggleMenuBar: 'Toggle MenuBar',
  keyChangeFocusPanel: 'Change Focus Panel',
  keySplitLeft: 'Split Left',
  keySplitRight: 'Split Right',
  keySplitTop: 'Split Top',
  keySplitBottom: 'Split Bottom',
  keySwapPosition: 'Swap Position',
  keySwitchDirection: 'Switch Direction',
  keyAlignHorizontal: 'Align Horizontal',
  keyAlignVertical: 'Align Vertical',
  keySwitchSyncScroll: 'Switch Sync Scroll',
  keyOpenSidebar: 'Open Sidebar',
  keyChangeMobileAgent: 'Change to Mobile Agent',
  keyDetachPanel: 'Detach Panel',
  keyClosePanel: 'Close Panel',
  keyDownloadsManager: l10n.translation('downloadsManager'),
  keyHideBrave: l10n.translation('hideBrave').replace('Brave','Sushi Browser'),
  keyHideOthers: l10n.translation('hideOthers'),
  keyQuit: l10n.translation('quitApp').replace('Brave','Sushi Browser')
}


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
              <Menu.Item as='a' href={`${baseURL}/favorite.html`} key="favorite" name={l10n.translation('bookmarks')}/>
              <Menu.Item as='a' href={`${baseURL}/history.html`} key="history" name={l10n.translation('history')}/>
              <Menu.Item as='a' href={`${baseURL}/download.html`} key="download" name={l10n.translation('downloads')}/>
              <Menu.Item as='a' href={`${baseURL}/explorer.html`} key="file-explorer" name="File Explorer"/>
              <Menu.Item as='a' href={`${baseURL}/terminal.html`} key="terminal" name="Terminal"/>
              <Menu.Item key="settings" name={l10n.translation('settings')} active={true}/>
            </Menu>
          </div>
        </Sticky>
        <TopList setToken={::this.setToken}/>
      </StickyContainer>
    )
  }
}

const startsWithOptions = [
  {
    key: 'startsWithOptionLastTime',
    value: 'startsWithOptionLastTime',
    text: l10n.translation('startsWithOptionLastTime'),
  },
  {
    key: 'newTab',
    value: 'newTab',
    text: l10n.translation('newTab'),
  }
]

const newTabModeOptions = [
  {
    key: 'myHomepage',
    value: 'myHomepage',
    text: l10n.translation('startsWithOptionHomePage'),
  },
  {
    key: 'top',
    value: 'top',
    text: 'Top Page',
  },
  {
    key: 'bookmarks',
    value: 'favorite',
    text: l10n.translation('bookmarks'),
  },
  {
    key: 'history',
    value: 'history',
    text: l10n.translation('history'),
  },
  {
    key: 'terminal',
    value: 'terminal',
    text: 'Terminal',
  },
  {
    key: 'blank',
    value: 'blank',
    text: l10n.translation('newTabEmpty'),
  }
]


const syncScrollMarginOptions = Array.from(new Array(21)).map((v,n)=>{
  return {value: n*5 ,text: `${n*5}px`}
})

const downloadNumOptions = Array.from(new Array(8)).map((v,n)=>{
  return {value: n+1 ,text: n+1}
})

const sideBarDirectionOptions = [
  {
    key: 'left',
    value: 'left',
    text: 'Left',
  },
  {
    key: 'right',
    value: 'right',
    text: 'Right',
  },
  {
    key: 'bottom',
    value: 'bottom',
    text: 'Bottom',
  }
]

const availableLanguages = [
  'bn-BD',
  'bn-IN',
  'zh-CN',
  'cs',
  'nl-NL',
  'en-US',
  'fr-FR',
  'de-DE',
  'hi-IN',
  'id-ID',
  'it-IT',
  'ja-JP',
  'ko-KR',
  'ms-MY',
  'pl-PL',
  'pt-BR',
  'ru',
  'sl',
  'es',
  'ta',
  'te',
  'tr-TR',
  'uk'
]

const languageOptions = availableLanguages.map(x=>{
  return {
    key: x,
    value: x,
    text: l10n.translation(x),
  }
})

let generalDefault
class GeneralSetting extends React.Component {
  constructor(props) {
    super(props)
    this.state = generalDefault
  }

  onChange(name,e,data){
    ipc.send('save-state',{tableName:'state',key:name,val:data.value || data.checked})
  }

  render() {
    console.log(this.state.startsWith,this.state.myHomepage)
    return <div>
      <h3>{l10n.translation('generalSettings')}</h3>
      <Divider/>
      <div className="ui form">
        <div className="field">
          <label>{l10n.translation('startsWith').replace('Brave','Sushi Browser')}</label>
          <Dropdown onChange={this.onChange.bind(this,'startsWith')} selection options={startsWithOptions} defaultValue={this.state.startsWith}/>
        </div>
        <div className="field">
          <label>{l10n.translation('newTabMode')}</label>
          <Dropdown onChange={this.onChange.bind(this,'newTabMode')} selection options={newTabModeOptions} defaultValue={this.state.newTabMode}/>
        </div>
        <div className="field">
          <label>{l10n.translation('myHomepage')}</label>
          <Input onChange={this.onChange.bind(this,'myHomepage')} defaultValue={this.state.myHomepage}/>
        </div>
        <br/>


        <div className="field">
          <label>{`${l10n.translation('2663302507110284145')} (${l10n.translation('requiresRestart').replace('* ','')})`}</label>
          <Dropdown onChange={this.onChange.bind(this,'language')} selection options={languageOptions} defaultValue={this.state.language}/>
        </div>
        <br/>

        <div className="field">
          <label>Adobe Flash Player</label>
          <Checkbox defaultChecked={this.state.enableFlash} toggle onChange={this.onChange.bind(this,'enableFlash')}/>
          <span className="toggle-label">{`${l10n.translation('enableFlash')} (${l10n.translation('requiresRestart').replace('* ','')})`}</span>
        </div>
        <br/>

        <div className="field">
          <label>Default Sidebar Position</label>
          <Dropdown onChange={this.onChange.bind(this,'sideBarDirection')} selection options={sideBarDirectionOptions} defaultValue={this.state.sideBarDirection}/>
        </div>
        <br/>


        <div className="field">
          <label>Tabs</label>
          <Checkbox defaultChecked={this.state.scrollTab} toggle onChange={this.onChange.bind(this,'scrollTab')}/>
          <span className="toggle-label">Enable mouse wheel scroll tab selection ({l10n.translation('requiresRestart').replace('* ','')})</span>
        </div>
        <br/>


        <div className="field">
          <label>Special Behavior</label>
          <Checkbox defaultChecked={this.state.tripleClick} toggle onChange={this.onChange.bind(this,'tripleClick')}/>
          <span className="toggle-label">Enable horizontal position moving (When you triple left clicking)</span>
          <br/>
          <Checkbox defaultChecked={this.state.doubleShift} toggle onChange={this.onChange.bind(this,'doubleShift')}/>
          <span className="toggle-label">Enable anything search (When you double pressing the shift key)  ({l10n.translation('requiresRestart').replace('* ','')})</span>
        </div>
        <br/>

        <div className="field">
          <label>Sync Scroll Margin({l10n.translation('requiresRestart').replace('* ','')})</label>
          <Dropdown onChange={this.onChange.bind(this,'syncScrollMargin')} selection options={syncScrollMarginOptions} defaultValue={this.state.syncScrollMargin}/>
        </div>
        <br/>

        <div className="field">
          <label>Max number of connections per item (Parallel Download)</label>
          <Dropdown onChange={this.onChange.bind(this,'downloadNum')} selection options={downloadNumOptions} defaultValue={this.state.downloadNum}/>
        </div>
        <br/>

        <div className="field">
          <label>{l10n.translation('importBrowserData').replace('…','')}</label>
          <Button primary content={l10n.translation('import')} onClick={_=>ipc.send("import-browser-data",{})}/>
        </div>

        <div className="field">
          <label>{l10n.translation('exportBookmarks').replace('…','')}</label>
          <Button primary content={l10n.translation('42126664696688958')} onClick={_=>ipc.send("export-bookmark",{})}/>
        </div>

        <br/>
        <br/>
        <br/>

      </div>
    </div>
  }
}

let searchDefault
class SearchSetting extends React.Component {
  constructor(props) {
    super(props)
    this.state = searchDefault
    this.emitChange = ::this.emitChange
    this.onBlur = ::this.onBlur
    this.changeCheck = ::this.changeCheck
    this.addSite = ::this.addSite
  }

  changeCheck(e,i,name,data){
    const val = data.checked
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
                    { key: 'two', text: 'open 2 panels', value: 'two' },
                    { key: 'new-win', text: 'open to new window', value: 'new-win' },
                    { key: 'one-row', text: ' a row in new window', value: 'one-row' },
                    { key: 'two-row', text: '2 rows in new window', value: 'two-row' },
                    { key: 'three-row', text: '3 rows in new window', value: 'three-row' },
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
      newRecord.type = 'one-row'
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
          <th>{l10n.translation('default')}</th>
          <th>{l10n.translation('name')}</th>
          <th>{l10n.translation('searchEngines')}</th>
          <th>{l10n.translation('2448312741937722512')}</th>
          <th>{l10n.translation('engineGoKey')}</th>
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


      <h3>{l10n.translation('searchEngine')}</h3>
      <Divider/>
      <table className="ui celled compact table">
        <thead>
        <tr>
          <th>{l10n.translation('default')}</th>
          <th>{l10n.translation('name')}</th>
          <th>Search URL</th>
          <th>{l10n.translation('engineGoKey')}</th>
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

let keyboardDefault
class KeyboardSetting extends React.Component {
  constructor(props) {
    super(props)
    this.state = {...keyboardDefault,errors:{}}
  }

  onChange(name,e,data){
    if(data.value == "" || isAccelerator(data.value)){
      ipc.send('save-state',{tableName:'state',key:name,val:data.value })
      this.state.errors[name] = false
    }
    else{
      this.state.errors[name] = true
    }
    this.setState({})
  }

  eachRender(key,val){
    return this.state[key] == (void 0) ? null : <Grid.Row>
      <Grid.Column width={4}>
        <label style={{verticalAlign: -9}}>{val}</label>
      </Grid.Column>
      <Grid.Column width={7}>
        <Input fluid error={!!this.state.errors[key]} onChange={this.onChange.bind(this,key)} defaultValue={this.state[key]}/>
      </Grid.Column>
    </Grid.Row>
  }

  renderRows(){
    const ret = []
    for(let [key,val] of Object.entries(keyMapping)){
      val = val.replace('…','')
      let row = this.eachRender(key,val)
      if(row) ret.push(row)

      row = this.eachRender(`${key}_1`,val)
      if(row) ret.push(row)

      row = this.eachRender(`${key}_2`,val)
      if(row) ret.push(row)
    }

    return ret
  }

  render() {
    return <div>
      <h3>{l10n.translation('1524430321211440688')}</h3>
      <Divider/>
      <p>Please refer <a target="_blank" href="https://github.com/electron/electron/blob/master/docs/api/accelerator.md">here</a> for input method of shortcut</p>
      <br/>

      <Grid >
        {this.renderRows()}
      </Grid>
    </div>
  }
}


class ExtensionSetting extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <div>
      <h3>{l10n.translation('extensions')}</h3>
      <Divider/>
    </div>
  }
}

const routings = {
  'general' : <GeneralSetting/>,
  'search' : <SearchSetting/>,
  'tabs' : <TabsSetting/>,
  'keyboard' : <KeyboardSetting/>,
  'extensions' : <ExtensionSetting/>,
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
                      onClick={_=>this.setState({page:name})}
    >
      <Icon name={icon}/>
      {l10n.translation(name == "keyboard" ? '1524430321211440688' : name)}
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
        {/*{this.getMenu('tabs','table')}*/}
        {this.getMenu('keyboard','keyboard')}
        {/*{this.getMenu('extensions','industry')}*/}
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


ipc.send("get-main-state",['startsWith','newTabMode','myHomepage','searchProviders','searchEngine','language','enableFlash','downloadNum','sideBarDirection','scrollTab','doubleShift','tripleClick','syncScrollMargin','ALL_KEYS'])
ipc.once("get-main-state-reply",(e,data)=>{
  generalDefault = data
  keyboardDefault = data

  const {searchProviders, searchEngine} = data
  let arr = []
  for(let [name,value] of Object.entries(searchProviders)){
    arr[value.ind] = value
  }
  searchDefault = {searchProviders: arr.filter(x=>x),default: searchEngine}

  ReactDOM.render(<App />,  document.getElementById('app'))
})
