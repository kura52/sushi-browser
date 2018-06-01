window.debug = require('debug')('info')
import process from './process'
const ipc = require('electron').ipcRenderer
const path = require('path')
const React = require('react')
const ReactDOM = require('react-dom')
const isAccelerator = require("electron-is-accelerator")
const {  Form, TextArea, Grid, Sidebar, Segment, Container, Menu, Input,Divider, Button, Checkbox, Icon, Table, Dropdown } = require('semantic-ui-react');
const { StickyContainer, Sticky } = require('react-sticky');
const l10n = require('../../brave/js/l10n')
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'
l10n.init()

const isDarwin = navigator.userAgent.includes('Mac OS X')
const isWin = navigator.userAgent.includes('Windows')

const keyMapping = {
  keySettings: l10n.translation(isDarwin ? 'preferences' : 'settings'),
  keyNewTab: l10n.translation('newTab'),
  keyNewPrivateTab: l10n.translation('newPrivateTab'),
  keyNewSessionTab: l10n.translation('newSessionTab'),
  keyNewWindow: l10n.translation('newWindow'),
  keyOpenLocation: l10n.translation('openLocation'),
  keyCloseTab: l10n.translation('tabCloseLabel'),
  keyCloseWindow: l10n.translation('closeWindow'),
  keyClosePanel: l10n.translation('closeAllTabsMenuLabel'),
  keyCloseOtherTabs: l10n.translation('closeOtherTabs'),
  keyCloseTabsToLeft: l10n.translation('closeTabsToLeft'),
  keyCloseTabsToRight: l10n.translation('closeTabsToRight'),
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
  keyClicktabReloadtabs: l10n.translation('clicktabReloadtabs'),
  keyClicktabReloadothertabs: l10n.translation('clicktabReloadothertabs'),
  keyClicktabReloadlefttabs: l10n.translation('clicktabReloadlefttabs'),
  keyClicktabReloadrighttabs: l10n.translation('clicktabReloadrighttabs'),
  keyToggleDeveloperTools: l10n.translation('toggleDeveloperTools'),
  keyToggleFullScreenView: l10n.translation('toggleFullScreenView'),
  keyHome: l10n.translation('home'),
  keyBack: l10n.translation('back'),
  keyForward: l10n.translation('forward'),
  keyReopenLastClosedTab: l10n.translation('reopenLastClosedTab'),
  keyClicktabUcatab: l10n.translation('clicktabUcatab'),
  keyShowAllHistory: l10n.translation('showAllHistory'),
  keyBookmarkPage: l10n.translation('bookmarkPage'),
  keyAddBookmarkAll: l10n.translation('5078638979202084724'),
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
  keySplitLeftTabs: 'Split left tabs to left',
  keySplitRightTabs: 'Split right tabs to right',
  keySwapPosition: 'Swap Position',
  keySwitchDirection: 'Switch Direction',
  keyAlignHorizontal: 'Align Horizontal',
  keyAlignVertical: 'Align Vertical',
  keySwitchSyncScroll: 'Switch Sync Scroll',
  keyOpenSidebar: 'Open Sidebar',
  keyChangeMobileAgent: 'Change to Mobile Agent',
  keyDetachPanel: 'Detach Panel',

  // keyDownloadAll: 'Download All',
  // keyPageTranslate: l10n.translation('2473195200299095979'),

  //clipboard
  keyClicktabCopyTabUrl: l10n.translation('clicktabCopyTabUrl').replace('&apos;',"'"),
  keyClicktabCopyUrlFromClipboard: l10n.translation('clicktabCopyUrlFromClipboard'),
  keyPasteAndOpen: 'Paste and Open',
  keyCopyTabInfo: 'Copy Tab Info',
  keyCopyAllTabInfos: 'Copy All Tab Infos',

  //util
  keyDuplicateTab: l10n.translation('3007771295016901659'),
  keyUnpinTab: l10n.translation('pinTab'),
  keyUnmuteTab: l10n.translation('muteTab'),
  keyFreezeTabMenuLabel: l10n.translation('freezeTabMenuLabel'),
  keyProtectTabMenuLabel: l10n.translation('protectTabMenuLabel'),
  keyLockTabMenuLabel: l10n.translation('lockTabMenuLabel'),
  keyDownloadsManager: l10n.translation('downloadsManager'),
  keyHideBrave: l10n.translation('hideBrave').replace('Brave','Sushi Browser'),
  keyHideOthers: l10n.translation('hideOthers'),
  keyQuit: l10n.translation('quitApp').replace('Brave','Sushi Browser')
}

const videoKeyMapping = {
  keyVideoPlayOrPause: l10n.translation('playOrPause').replace(/\(.\)/,''),
  keyVideoFrameStep: l10n.translation('frameStep').replace(/\(.\)/,''),
  keyVideoFrameBackStep: l10n.translation('frameBackStep').replace(/\(.\)/,''),
  keyVideoRewind1: l10n.translation('rewind1').replace(/\(.\)/,'') + '1',
  keyVideoRewind2: l10n.translation('rewind1').replace(/\(.\)/,'') + '2',
  keyVideoRewind3: l10n.translation('rewind1').replace(/\(.\)/,'') + '3',
  keyVideoForward1: l10n.translation('forward1').replace(/\(.\)/,'') + '1',
  keyVideoForward2: l10n.translation('forward1').replace(/\(.\)/,'') + '2',
  keyVideoForward3: l10n.translation('forward1').replace(/\(.\)/,'') + '3',
  keyVideoNormalSpeed: l10n.translation('normalSpeed').replace(/\(.\)/,''),
  keyVideoHalveSpeed: l10n.translation('halveSpeed').replace(/\(.\)/,''),
  keyVideoDoubleSpeed: l10n.translation('doubleSpeed').replace(/\(.\)/,''),
  keyVideoDecSpeed: l10n.translation('decSpeed').replace(/\(.\)/,''),
  keyVideoIncSpeed: l10n.translation('incSpeed').replace(/\(.\)/,''),
  keyVideoFullscreen: l10n.translation('fullscreen').replace(/\(.\)/,''),
  keyVideoExitFullscreen: l10n.translation('exitFullscreen').replace(/\(.\)/,''),
  keyVideoMute: l10n.translation('mute').replace(/\(.\)/,''),
  keyVideoDecreaseVolume: l10n.translation('decreaseVolume').replace(/\(.\)/,''),
  keyVideoIncreaseVolume: l10n.translation('increaseVolume').replace(/\(.\)/,''),
  keyVideoPlRepeat: l10n.translation('plRepeat').replace(/\(.\)/,''),
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

const downloadNumOptions = Array.from(new Array(16)).map((v,n)=>{
  return {value: n+1 ,text: n+1}
})

const concurrentDownloadOptions = Array.from(new Array(21)).map((v,n)=>{
  return {value: n ,text: n}
})

const sendToVideoOptionsAll = [
  { value: 'vlc', text: 'VLC Media Player',os:['win','mac','linux']},
  { value: 'PotPlayerMini64', text: 'PotPlayer',os:['win']},
  { value: 'mplayerx', text: 'MPlayerX',os:['mac']},
  { value: 'smplayer', text: 'SMPlayer',os:['win','mac','linux']},
  { value: 'C:\\Program Files\\MPC-HC\\mpc-hc64.exe', text: 'Media Player Classic(MPC-HC)',os:['win']},

  // { value: 'C:\\Program Files (x86)\\DearMob\\5KPlayer\\5KPlayer.exe', text: '5K Player',os:['win']},
  // { value: '5kplayer', text: '5K Player',os:['mac']},

  { value: 'kmplayer', text: 'KMPlayer',os:['win','mac']},
  { value: 'gom', text: 'GOM Player',os:['win','mac']},


  { value: 'itunes', text: 'iTunes',os:['win','mac']},
  { value: 'quicktime player', text: 'QuickTime Player',os:['mac']},

  { value: 'C:\\Program Files (x86)\\Kodi\\kodi.exe', text: 'Kodi',os:['win']},
  { value: 'kodi', text: 'Kodi',os:['mac','linux']},

  { value: 'mpv', text: 'MPV Player',os:['win','mac','linux']},
  { value: 'wmplayer', text: 'Windows Media Player',os:['win']},
]

const sendToVideoOptions = sendToVideoOptionsAll.filter(x=>isWin ? x.os.includes('win') : isDarwin ? x.os.includes('mac') : x.os.includes('linux'))

const videoClickOptions = [
  {
    key: 'nothing',
    value: '',
    text: l10n.translation('7701040980221191251'),
  },
  {
    key: 'playOrPause',
    value: 'playOrPause',
    text: l10n.translation('playOrPause'),
  },
  {
    key: 'fullscreen',
    value: 'fullscreen',
    text: l10n.translation('fullscreen').replace(/\(.\)/,''),
  },
  {
    key: 'mute',
    value: 'mute',
    text: l10n.translation('mute').replace(/\(.\)/,''),
  }
]


const videoWheelOptions = [
  {
    key: 'nothing',
    value: '',
    text: l10n.translation('7701040980221191251'),
  },
  {
    key: 'rewind1',
    value: 'rewind1',
    text: l10n.translation('mediaSeeking').replace(/\(.\)/,'') + '1',
  },
  {
    key: 'decreaseVolume',
    value: 'decreaseVolume',
    text: l10n.translation('volumeControl'),
  },
  {
    key: 'decSpeed',
    value: 'decSpeed',
    text: l10n.translation('changeSpeed'),
  },
  {
    key: 'frameBackStep',
    value: 'frameBackStep',
    text: `${l10n.translation('frameStep').replace(/\(.\)/,'')} / ${l10n.translation('frameBackStep').replace(/\(.\)/,'')}`,
  }
]

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


const zoomBehaviorOptions = [
  { value: 'chrome', text: 'Same as Chrome'},...Array.from(new Array(25)).map((v,n)=>({value: (n+1).toString() ,text: `${n+1}%`}))
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

const contextMenus = [
  ['back', l10n.translation('back')],
  ['forward', l10n.translation('forward')],
  ['reload', l10n.translation('reload')],

  ['divider', null],

  ['openSearch', l10n.translation('openSearch').replace(/{{ *selectedVariable *}}/,'')],
  ['Copy Links', 'Copy Links'],
  ['openalllinksLabel', l10n.translation('openalllinksLabel')],
  ['Download Selection', 'Download Selection'],
  ['savePageAs', l10n.translation('savePageAs')],
  ['bookmarkPage', l10n.translation('bookmarkPage')],
  ['print', l10n.translation('print')],
  ['2473195200299095979', l10n.translation('2473195200299095979')],

  ['divider', null],

  ['Download All', 'Download All'],

  ['divider', null],

  ['Sync Scroll Left to Right', 'Sync Scroll Left to Right'],
  ['Sync Scroll Right to Left', 'Sync Scroll Right to Left'],

  ['divider', null],

  ['viewPageSource', l10n.translation('viewPageSource')],
  ['inspectElement', l10n.translation('inspectElement')],

  ['divider', null],

  ['openInNewTab', l10n.translation('openInNewTab')],
  ['Open Link in Opposite Tab', 'Open Link in Opposite Tab'],
  ['openInNewPrivateTab', l10n.translation('openInNewPrivateTab')],
  ['openInNewTorTab', 'Open Links in New Tor Tabs'],
  ['openInNewSessionTab', l10n.translation('openInNewSessionTab')],
  ['openInNewWindow', l10n.translation('openInNewWindow')],
  ['5317780077021120954', l10n.translation('5317780077021120954')],
  ['saveLinkAs', l10n.translation('saveLinkAs')],
  ['copyLinkAddress', l10n.translation('copyLinkAddress')],
  ['1047431265488717055', l10n.translation('1047431265488717055')],
  ['Save and Play Video', 'Save and Play Video'],
  ['Send URL to Video Player', 'Send URL to Video Player'],

  ['divider', null],

  ['cut', l10n.translation('cut')],
  ['copy', l10n.translation('copy')],
  ['paste', l10n.translation('paste')],

  ['divider', null],

  ['openImageInNewTab', l10n.translation('openImageInNewTab')],
  ['saveImage', l10n.translation('saveImage')],
  ['copyImage', l10n.translation('copyImage')],
  ['copyImageAddress', l10n.translation('copyImageAddress')],
  ['994289308992179865', l10n.translation('994289308992179865')],
  ['Muted', 'Muted'],
  ['1725149567830788547', l10n.translation('1725149567830788547')],
  ['Play Video in Popup Window', 'Play Video in Popup Window'],
  ['Play Video in Floating Panel', 'Play Video in Floating Panel'],
  ['4643612240819915418', l10n.translation('4643612240819915418')],
  ['4256316378292851214', l10n.translation('4256316378292851214')],
  ['782057141565633384', l10n.translation('782057141565633384')],
  ['2019718679933488176', l10n.translation('2019718679933488176')],
  ['5116628073786783676', l10n.translation('5116628073786783676')],
  ['1465176863081977902', l10n.translation('1465176863081977902')]
]

const tabContextMenus = [
  ['newTab', l10n.translation('newTab')],
  ['newPrivateTab', l10n.translation('newPrivateTab')],
  ['newSessionTab', l10n.translation('newSessionTab')],

  ['divider', null],

  ['Split Left','Split Left'],
  ['Split Right','Split Right'],
  ['Split Top','Split Top'],
  ['Split Bottom','Split Bottom'],

  ['divider', null],

  ['Split left tabs to left','Split left tabs to left'],
  ['Split right tabs to right','Split right tabs to right'],
  ['Floating Panel','Floating Panel'],

  ['divider', null],

  ['Swap Position','Swap Position'],
  ['Switch Direction','Switch Direction'],

  ['divider', null],

  ['Align Horizontal','Align Horizontal'],
  ['Align Vertical','Align Vertical'],

  ['divider', null],

  ['clicktabCopyTabUrl',l10n.translation('clicktabCopyTabUrl').replace('&apos;',"'")],
  ['clicktabCopyUrlFromClipboard',l10n.translation('clicktabCopyUrlFromClipboard')],
  ['Paste and Open','Paste and Open'],
  ['Copy Tab Info','Copy Tab Info'],
  ['Copy All Tab Infos','Copy All Tab Infos'],

  ['divider', null],

  ['reload', l10n.translation('reload')],
  ['cleanReload', l10n.translation('cleanReload')],
  ['clicktabReloadtabs', l10n.translation('clicktabReloadtabs')],
  ['clicktabReloadothertabs', l10n.translation('clicktabReloadothertabs')],
  ['clicktabReloadlefttabs', l10n.translation('clicktabReloadlefttabs')],
  ['clicktabReloadrighttabs', l10n.translation('clicktabReloadrighttabs')],
  ['autoReloadTabLabel', l10n.translation('autoReloadTabLabel')],
  ['3007771295016901659', l10n.translation('3007771295016901659')],
  ['unpinTab', l10n.translation('pinTab')],
  ['unmuteTab', l10n.translation('muteTab')],
  ['freezeTabMenuLabel', l10n.translation('freezeTabMenuLabel')],
  ['protectTabMenuLabel', l10n.translation('protectTabMenuLabel')],
  ['lockTabMenuLabel', l10n.translation('lockTabMenuLabel')],

  ['divider', null],

  ['closeTab', l10n.translation('closeTab')],
  ['closeOtherTabs', l10n.translation('closeOtherTabs')],
  ['closeTabsToLeft', l10n.translation('closeTabsToLeft')],
  ['closeTabsToRight', l10n.translation('closeTabsToRight')],
  ['closeAllTabsMenuLabel',l10n.translation('closeAllTabsMenuLabel')],

  ['divider', null],

  ['reopenLastClosedTab', l10n.translation('reopenLastClosedTab')],
  ['clicktabUcatab', l10n.translation('clicktabUcatab')],
  ['bookmarkPage', l10n.translation('bookmarkPage')],
  ['5078638979202084724', l10n.translation('5078638979202084724')],

  ['divider', null],

  ['reloads', l10n.translation('reload')],
  ['cleanReloads', l10n.translation('cleanReload')],
  ['5453029940327926427', l10n.translation('5453029940327926427')],

  ['divider', null],

  ['Close This Tree','Close This Tree']
]

const languageOptions = availableLanguages.map(x=>{
  return {
    key: x,
    value: x,
    text: l10n.translation(x),
  }
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
              <Menu.Item as='a' href={`chrome://newtab/`} key="top" name="Top"/>
              <Menu.Item as='a' href={`chrome://bookmarks/`} key="favorite" name={l10n.translation('bookmarks')}/>
              <Menu.Item as='a' href={`chrome://history/`} key="history" name={l10n.translation('history')}/>
              <Menu.Item as='a' href={`${baseURL}/download.html`} key="download" name={l10n.translation('downloads')}/>
              <Menu.Item as='a' href={`${baseURL}/explorer.html`} key="file-explorer" name="File Explorer"/>
              <Menu.Item as='a' href={`${baseURL}/terminal.html`} key="terminal" name="Terminal"/>
              <Menu.Item key="settings" name={l10n.translation('settings')} active={true}/>
              <Menu.Item as='a' href={`${baseURL}/automation.html`} key="automation" name="Automation"/>
              <Menu.Item as='a' href={`${baseURL}/converter.html`} key="converter" name="Video Converter"/>
            </Menu>
          </div>
        </Sticky>
        <TopList setToken={::this.setToken}/>
      </StickyContainer>
    )
  }
}

let generalDefault
class GeneralSetting extends React.Component {
  constructor(props) {
    super(props)
    this.state = generalDefault
    this.clear = []
  }


  onChange(name,e,data){
    ipc.send('save-state',{tableName:'state',key:name,val:data.value || data.checked})
  }

  onChange2(name,e,data){
    if(data.checked){
      this.clear.push(name)
    }
    else{
      this.clear = this.clear.filter(x=> x !== name)
    }
    this.setState({})
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
          <label>{l10n.translation('8986267729801483565')}</label>
          <Input ref="dl" style={{width: 400}} onChange={this.onChange.bind(this,'downloadPath')} defaultValue={this.state.downloadPath || this.state.defaultDownloadPath}/>
          <Button icon='folder' onClick={_=>{
            const key = Math.random().toString()
            ipc.send('show-dialog-exploler',key,{defaultPath:this.state.downloadPath || this.state.defaultDownloadPath})
            ipc.once(`show-dialog-exploler-reply_${key}`,(event,ret)=>{
              if(!ret) return
              this.refs.dl.inputRef.value = ret
              this.onChange('downloadPath',{},{value:ret})
            })
          }}/>
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

        {isDarwin || isWin ? <div className="field">
          <label>Widevine</label>
          <Checkbox defaultChecked={this.state.enableWidevine} toggle onChange={this.onChange.bind(this,'enableWidevine')}/>
          <span className="toggle-label">{`${l10n.translation('enableFlash').replace('Adobe Flash','Widevine')} (${l10n.translation('requiresRestart').replace('* ','')})`}</span>
        </div> : null}
        {isDarwin || isWin ? <br/> : null}


        <Grid>
          <Grid.Row>
            <Grid.Column width={6}>
              <div className="field">
                <label>{l10n.translation('8026334261755873520')}</label>

                <Checkbox toggle onChange={this.onChange2.bind(this,'clearHistory')}/>
                <span className="toggle-label">{l10n.translation('browsingHistory')}</span>
                <br/>
                <Checkbox toggle onChange={this.onChange2.bind(this,'clearDownload')}/>
                <span className="toggle-label">{l10n.translation('downloadHistory')}</span>
                <br/>
                <Checkbox toggle onChange={this.onChange2.bind(this,'clearCache')}/>
                <span className="toggle-label">{l10n.translation('cachedImagesAndFiles')}</span>
                <br/>
                <Checkbox toggle onChange={this.onChange2.bind(this,'clearStorageData')}/>
                <span className="toggle-label">{l10n.translation('allSiteCookies')}</span>
                <br/>
                <Checkbox toggle onChange={this.onChange2.bind(this,'clearAutocompleteData')}/>
                <span className="toggle-label">{l10n.translation('autocompleteData')}</span>
                <br/>
                <Checkbox toggle onChange={this.onChange2.bind(this,'clearAutofillData')}/>
                <span className="toggle-label">{l10n.translation('autofillData')}</span>
                <br/>
                <Checkbox toggle onChange={this.onChange2.bind(this,'clearPassword')}/>
                <span className="toggle-label">{l10n.translation('1375321115329958930')}</span>
                <br/>
                <Checkbox toggle onChange={this.onChange2.bind(this,'clearGeneralSettings')}/>
                <span className="toggle-label">{l10n.translation('generalSettings')}</span>
                <br/>
                <Checkbox toggle onChange={this.onChange2.bind(this,'clearFavorite')}/>
                <span className="toggle-label">{l10n.translation('bookmarks')}</span>
                <br/>
                <Button disabled={!this.clear.length} primary content={l10n.translation('clearBrowsingDataNow')} onClick={_=>ipc.send("clear-browsing-data",this.clear)}/>
              </div>
            </Grid.Column>
            <Grid.Column width={6} style={{marginTop: 0}}>
              <div className="field">
                <label>{l10n.translation('privateDataMessage').replace("Brave","Sushi Browser")}</label>

                <Checkbox toggle onChange={this.onChange.bind(this,'clearHistoryOnClose')} defaultChecked={this.state.clearHistoryOnClose}/>
                <span className="toggle-label">{l10n.translation('browsingHistory')}</span>
                <br/>
                <Checkbox toggle onChange={this.onChange.bind(this,'clearDownloadOnClose')} defaultChecked={this.state.clearDownloadOnClose}/>
                <span className="toggle-label">{l10n.translation('downloadHistory')}</span>
                <br/>
                <Checkbox toggle onChange={this.onChange.bind(this,'clearCacheOnClose')} defaultChecked={this.state.clearCacheOnClose}/>
                <span className="toggle-label">{l10n.translation('cachedImagesAndFiles')}</span>
                <br/>
                <Checkbox toggle onChange={this.onChange.bind(this,'clearStorageDataOnClose')} defaultChecked={this.state.clearStorageDataOnClose}/>
                <span className="toggle-label">{l10n.translation('allSiteCookies')}</span>
                <br/>
                <Checkbox toggle onChange={this.onChange.bind(this,'clearAutocompleteDataOnClose')} defaultChecked={this.state.clearAutocompleteDataOnClose}/>
                <span className="toggle-label">{l10n.translation('autocompleteData')}</span>
                <br/>
                <Checkbox toggle onChange={this.onChange.bind(this,'clearAutofillDataOnClose')} defaultChecked={this.state.clearAutofillDataOnClose}/>
                <span className="toggle-label">{l10n.translation('autofillData')}</span>
                <br/>
                <Checkbox toggle onChange={this.onChange.bind(this,'clearPasswordOnClose')} defaultChecked={this.state.clearPasswordOnClose}/>
                <span className="toggle-label">{l10n.translation('1375321115329958930')}</span>
                <br/>
                <Checkbox toggle onChange={this.onChange.bind(this,'clearGeneralSettingsOnClose')} defaultChecked={this.state.clearGeneralSettingsOnClose}/>
                <span className="toggle-label">{l10n.translation('generalSettings')}</span>
                <br/>
                <Checkbox toggle onChange={this.onChange.bind(this,'clearFavoriteOnClose')} defaultChecked={this.state.clearFavoriteOnClose}/>
                <span className="toggle-label">{l10n.translation('bookmarks')}</span>
                <br/>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <br/>
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


        <div className="field">
          <label>{l10n.translation('ssInterval')}&nbsp;({l10n.translation('secondsLabel')})</label>
          <Input onChange={this.onChange.bind(this,'autoSaveInterval')} defaultValue={this.state.autoSaveInterval}/>
        </div>
        <br/>

        <div className="field">
          <label>{l10n.translation('zoom')} ({l10n.translation('requiresRestart').replace('* ','')})</label>
          <Dropdown onChange={this.onChange.bind(this,'zoomBehavior')} selection options={zoomBehaviorOptions} defaultValue={this.state.zoomBehavior}/>
        </div>
        <br/>

        <div className="field">
          <label>{l10n.translation('autocompleteData')} ({l10n.translation('requiresRestart').replace('* ','')})</label>
        </div>

        <Grid>
          <Grid.Row>
            <Grid.Column width={3}><label>Order of AutoComplete</label></Grid.Column>
            <Grid.Column width={8}><Dropdown onChange={this.onChange.bind(this,'orderOfAutoComplete')} selection
                                             options={[
                                               {key:'suggestionToHistory',value:'suggestionToHistory',text:'Suggestion -> History'},
                                               {key:'historyToSuggestion',value:'historyToSuggestion',text:'History -> Suggestion'},
                                             ]}
                                             defaultValue={this.state.orderOfAutoComplete}/></Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={3}><label>Number of Suggestions</label></Grid.Column>
            <Grid.Column width={8}><Dropdown onChange={this.onChange.bind(this,'numOfSuggestion')} selection
                                             options={concurrentDownloadOptions} defaultValue={this.state.numOfSuggestion}/></Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={3}><label>Number of Histories</label></Grid.Column>
            <Grid.Column width={8}><Dropdown onChange={this.onChange.bind(this,'numOfHistory')} selection
                                             options={concurrentDownloadOptions} defaultValue={this.state.numOfHistory}/></Grid.Column>
          </Grid.Row>
        </Grid>

        <br/>
        <br/>



        <div className="field">
          <label>Protection</label>
          <Checkbox defaultChecked={this.state.httpsEverywhereEnable} toggle onChange={this.onChange.bind(this,'httpsEverywhereEnable')}/>
          <span className="toggle-label">Enable HTTPS Everywhere</span>
          <br/>

          <Checkbox defaultChecked={this.state.trackingProtectionEnable} toggle onChange={this.onChange.bind(this,'trackingProtectionEnable')}/>
          <span className="toggle-label">Enable Tracing Protection (e.g. Google Analytics)</span>
          <br/>

          <Checkbox defaultChecked={this.state.noScript} toggle onChange={this.onChange.bind(this,'noScript')}/>
          <span className="toggle-label">{l10n.translation('noScriptPref')}</span>
          <br/>

          <Checkbox defaultChecked={this.state.blockCanvasFingerprinting} toggle onChange={this.onChange.bind(this,'blockCanvasFingerprinting')}/>
          <span className="toggle-label">{l10n.translation('blockCanvasFingerprinting')}</span>
          <br/>
        </div>
        <br/>

        <div className="field">
          <label>Default Sidebar Position</label>
          <Dropdown onChange={this.onChange.bind(this,'sideBarDirection')} selection options={sideBarDirectionOptions} defaultValue={this.state.sideBarDirection}/>
        </div>
        <br/>

        <div className="field">
          <label>{l10n.translation('openInNewTab')}  ({l10n.translation('requiresRestart').replace('* ','')})</label>
          <Checkbox defaultChecked={this.state.sidebarLink} toggle onChange={this.onChange.bind(this,'sidebarLink')}/>
          <span className="toggle-label">SideBar Link</span>
          <br/>

          <Checkbox defaultChecked={this.state.toolbarLink} toggle onChange={this.onChange.bind(this,'toolbarLink')}/>
          <span className="toggle-label">ToolBar Link</span>
          <br/>

          <Checkbox defaultChecked={this.state.addressBarNewTab} toggle onChange={this.onChange.bind(this,'addressBarNewTab')}/>
          <span className="toggle-label">AddressBar Link</span>
          <br/>

          <Checkbox defaultChecked={this.state.bookmarkbarLink} toggle onChange={this.onChange.bind(this,'bookmarkbarLink')}/>
          <span className="toggle-label">BookmarkBar Link</span>
          <br/>
        </div>
        <br/>

        <div className="field">
          <label>Special Behavior</label>
          <Checkbox defaultChecked={this.state.extensionOnToolbar} toggle onChange={this.onChange.bind(this,'extensionOnToolbar')}/>
          <span className="toggle-label">Show Chrome Extension Icon on Toolbar({l10n.translation('requiresRestart').replace('* ','')})</span>
          <br/>
          {isDarwin ? null : <Checkbox defaultChecked={this.state.displayFullIcon} toggle onChange={this.onChange.bind(this,'displayFullIcon')}/>}
          {isDarwin ? null : <span className="toggle-label">Show Fullscreen Button({l10n.translation('requiresRestart').replace('* ','')})</span>}
          {isDarwin ? null : <br/>}
          <Checkbox defaultChecked={this.state.enableMouseGesture} toggle onChange={this.onChange.bind(this,'enableMouseGesture')}/>
          <span className="toggle-label">Enable Mouse Gesture({l10n.translation('requiresRestart').replace('* ','')})</span>
          <br/>
          <Checkbox defaultChecked={this.state.tripleClick} toggle onChange={this.onChange.bind(this,'tripleClick')}/>
          <span className="toggle-label">Enable horizontal position moving (When you triple left clicking)</span>
          <br/>
          <Checkbox defaultChecked={this.state.longPressMiddle} toggle onChange={this.onChange.bind(this,'longPressMiddle')}/>
          <span className="toggle-label">Enable behavior change when long press of middle mouse button ({l10n.translation('requiresRestart').replace('* ','')})</span>
          <br/>
          <Checkbox defaultChecked={this.state.doubleShift} toggle onChange={this.onChange.bind(this,'doubleShift')}/>
          <span className="toggle-label">Enable anything search (When you double pressing the shift key)  ({l10n.translation('requiresRestart').replace('* ','')})</span>
          <br/>
          <Checkbox defaultChecked={this.state.historyBadget} toggle onChange={this.onChange.bind(this,'historyBadget')}/>
          <span className="toggle-label">Show Back/Forward Button's Badget ({l10n.translation('requiresRestart').replace('* ','')})</span>
        </div>
        <br/>

        <div className="field">
          <label>Send URL to external media player</label>
          <Dropdown onChange={this.onChange.bind(this,'sendToVideo')} selection options={sendToVideoOptions} defaultValue={this.state.sendToVideo}/>
        </div>
        <br/>

        <div className="field">
          <label>Concurrent Download(0 means no limit)</label>
          <Dropdown onChange={this.onChange.bind(this,'concurrentDownload')} selection options={concurrentDownloadOptions} defaultValue={this.state.concurrentDownload}/>
        </div>
        <br/>

        <div className="field">
          <label>Max number of connections per item (Parallel Download)</label>
          <Dropdown onChange={this.onChange.bind(this,'downloadNum')} selection options={downloadNumOptions} defaultValue={parseInt(this.state.downloadNum)}/>
        </div>
        <br/>

        <div className="field">
          <label>Sync Scroll Margin({l10n.translation('requiresRestart').replace('* ','')})</label>
          <Dropdown onChange={this.onChange.bind(this,'syncScrollMargin')} selection options={syncScrollMarginOptions} defaultValue={this.state.syncScrollMargin}/>
        </div>
        <br/>

        <div className="field">
          <label>Bind Window Frame Margin</label>
          <Input onChange={this.onChange.bind(this,'bindMarginFrame')} defaultValue={this.state.bindMarginFrame}/>
          <label>Bind Window Title Margin</label>
          <Input onChange={this.onChange.bind(this,'bindMarginTitle')} defaultValue={this.state.bindMarginTitle}/>
        </div>

        {/*<div className="field">*/}
        {/*<label>{l10n.translation('2893168226686371498').replace('…','')} (Windows/Mac)</label>*/}
        {/*<Button primary content={l10n.translation('9218430445555521422')} onClick={_=>ipc.send("default-browser",{})}/>*/}
        {/*</div>*/}

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

  contextMenuSearchEngineChange(e,data){
    this.state.contextMenuSearchEngines = data.value
    ipc.send('save-state',{tableName:'state',key:'contextMenuSearchEngines',val:data.value})
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
    let optionsAll = []
    for(let values of this.state.searchProviders){
      const data = { key: values.name, text: values.name, value: values.name }
      optionsAll.push(data)
      if(values.multiple) continue
      options.push(data)
    }

    const ret = []
    for(let values of this.state.searchProviders){
      if(!values.multiple) continue
      ret.push(this.buildMultiSearchColumn(values.ind,values.name,values.multiple,values.type,values.shortcut,options))
    }
    return {ret,optionsAll}
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
    const {ret,optionsAll} = this.buildMultiSearchColumns()

    return <div>
      <h3>Right Click Menu Search Engines</h3>
      <Divider/>
      <Dropdown fluid multiple search selection onChange={::this.contextMenuSearchEngineChange} options={optionsAll} defaultValue={this.state.contextMenuSearchEngines}/>

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
        {ret}
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


let TabDefault
class TabsSetting extends React.Component {
  constructor(props) {
    super(props)
    this.state = {...TabDefault,errors:{}}
    this.mouseOptions = this.makeOptions(['clicktabNothing','newTab','newPrivateTab','newSessionTab','Split Left','Split Right','Split Top','Split Bottom','Split left tabs to left','Split right tabs to right','Floating Panel','Swap Position','Switch Direction','Align Horizontal','Align Vertical','clicktabCopyTabUrl','clicktabCopyUrlFromClipboard','Paste and Open','Copy Tab Info','Copy All Tab Infos','reload','cleanReload','clicktabReloadtabs','clicktabReloadothertabs','clicktabReloadlefttabs','clicktabReloadrighttabs','3007771295016901659','unpinTab','unmuteTab','freezeTabMenuLabel','protectTabMenuLabel','lockTabMenuLabel','closeTab','closeOtherTabs','closeTabsToLeft','closeTabsToRight','closeAllTabsMenuLabel','reopenLastClosedTab','clicktabUcatab','bookmarkPage','5078638979202084724'])
  }

  onChange2(isTab,name,e,data){
    const disableMenu = isTab ? 'disableTabContextMenus' : 'disableContextMenus'
    const val = data.checked
    if(val){
      this.state[disableMenu] = this.state[disableMenu].filter(x=>x!==name)
    }
    else{
      this.state[disableMenu].push(name)
    }
    ipc.send('save-state',{tableName:'state',key:disableMenu,val:this.state[disableMenu]})

    this.setState({})
  }

  emitChange(isTab,name,e){
    const val = e.target.innerText
    const priorityMenu = isTab ? 'priorityTabContextMenus' : 'priorityContextMenus'
    if(val == "" || val === void 0){
      delete this.state[priorityMenu]
    }
    else{
      this.state[priorityMenu][name] = val
    }
    ipc.send('save-state',{tableName:'state',key:priorityMenu,val:this.state[priorityMenu]})
  }

  onBlur(isTab,name,e){
    this.emitChange(isTab, name, e)
    this.setState({})
  }

  renderRows(isTab){
    const disableMenu = isTab ? 'disableTabContextMenus' : 'disableContextMenus'
    const priorityMenu = isTab ? 'priorityTabContextMenus' : 'priorityContextMenus'
    const ret = []
    let i = 0
    let divider
    for(let [key,name] of (isTab ? tabContextMenus : contextMenus)){
      if(key == 'divider'){
        divider = true
        continue
      }
      ret.push(
        <tr key={`tr${i}`} style={divider ? {borderTop: '3px double rgba(34,36,38,.15)'} : {}}>
          <td key={`default${i}`}>
            <Checkbox defaultChecked={!this.state[disableMenu].find(x=>x==key)} toggle onChange={this.onChange2.bind(this,isTab,key)}/>
          </td>
          <td key={`name${i}`} >{name}</td>
          <td key={`shortcut${i}`} data-num={i} data-name='shortcut' onInput={this.emitChange.bind(this,isTab,key)} onBlur={this.onBlur.bind(this,isTab,key)} contentEditable>{this.state[priorityMenu][key]||"0"}</td>
        </tr>)
      divider = false
      i++
    }

    return ret
  }

  onChange(name,e,data){
    // if(name == 'blackListVideo') data = {value: data.value.split("\n")}
    ipc.send('save-state',{tableName:'state',key:name,val:data.checked === void 0 ? data.value : data.checked})
    this.setState({})
  }

  onChange3(name,ind,e,data){
    this.state[name][ind] = data.value
    ipc.send('save-state',{tableName:'state',key:name,val:this.state[name]})
    this.setState({})
  }

  makeOption(key,trans=true){
    return {
      key: key,
      value: key,
      text: (trans && !key.includes(' ')) ? l10n.translation(key) : key
    }
  }

  makeOptions(keys,trans=true){
    return keys.map(key=>this.makeOption(key,trans))
  }

  changeTheme(theme){
    let style
    if(theme == 'default'){
      style = {
        colorNormalText: '#222',
        colorNormalBackground: '#d0d0d0',
        colorActiveText: '#222',
        colorActiveBackground: '#f2f2f2',
        colorTabDot: '#777',
        colorUnreadText: '#9f0000',
        colorUnreadBackground: '#d0d0d0',
        showBorderActiveTab: false,
        colorTabMode: '#37a9fd'
      }
    }
    else if(theme == 'dark'){
      style = {
        colorNormalText: '#aaa',
        colorNormalBackground: '#4f4f4f',
        colorActiveText: '#fff',
        colorActiveBackground: '#343434',
        colorTabDot: '#fff',
        colorUnreadText: '#ab7f00',
        colorUnreadBackground: '#4f4f4f',
        showBorderActiveTab: true,
        colorTabMode: '#7fffd4'
      }
    }
    for(let [key,val] of Object.entries(style)){
      this.state[key] = val
      if(key == 'showBorderActiveTab'){
        this.refs[key].inputRef.checked = val
      }
      else{
        this.refs[key].inputRef.value = val
      }
      ipc.send('save-state',{tableName:'state',key,val})
    }
  }

  render() {
    return <div>
      <h3>{l10n.translation('tabs')} ({l10n.translation('requiresRestart').replace('* ','')})</h3>
      <Divider/>

      <h4 style={{marginTop:0, marginBottom: 20}}>{l10n.translation('generalSettings')}</h4>

      <Grid>
        <Grid.Row>
          <Grid.Column width={6}><label>{l10n.translation('generalWindowOpenLabel')}</label></Grid.Column>
          <Grid.Column width={5}><Dropdown onChange={this.onChange.bind(this,'generalWindowOpenLabel')} selection
                                           options={this.makeOptions(['linkTargetTab','linkTargetWindow'])}
                                           defaultValue={this.state.generalWindowOpenLabel}/></Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={6}><label>{l10n.translation('focusTabLabelBegin')}</label></Grid.Column>
          <Grid.Column width={5}><Dropdown onChange={this.onChange.bind(this,'closeTabBehavior')} selection
                                           options={this.makeOptions(['focusTabLeftTab','focusTabRightTab','focusTabLastSelectedTab','focusTabOpenerTab','focusTabOpenerTabRtl','focusTabLastOpenedTab','focusTabFirstTab','focusTabLastTab'])}
                                           defaultValue={this.state.closeTabBehavior}/></Grid.Column>
        </Grid.Row>
      </Grid>

      <div className='spacer'/>

      <div className="field">
        <Checkbox defaultChecked={this.state.keepWindowLabel31} toggle onChange={this.onChange.bind(this,'keepWindowLabel31')}/>
        <span className="toggle-label">{l10n.translation('keepWindowLabel31')}</span>
      </div>

      <div className='spacer2'/>

      <div className="field">
        <label>{l10n.translation('autoReloadTabLabel')}&nbsp;({l10n.translation('secondsLabel')}):&nbsp;</label>
        <Input style={{width: 40,paddingRight:32}} onChange={this.onChange3.bind(this,'reloadIntervals',0)} defaultValue={this.state.reloadIntervals[0]}/>
        <Input style={{width: 40,paddingRight:32}} onChange={this.onChange3.bind(this,'reloadIntervals',1)} defaultValue={this.state.reloadIntervals[1]}/>
        <Input style={{width: 40,paddingRight:32}} onChange={this.onChange3.bind(this,'reloadIntervals',2)} defaultValue={this.state.reloadIntervals[2]}/>
        <Input style={{width: 40,paddingRight:32}} onChange={this.onChange3.bind(this,'reloadIntervals',3)} defaultValue={this.state.reloadIntervals[3]}/>
        <Input style={{width: 40,paddingRight:32}} onChange={this.onChange3.bind(this,'reloadIntervals',4)} defaultValue={this.state.reloadIntervals[4]}/>
      </div>

      <Divider/>

      <h4 style={{marginTop:0, marginBottom: 20}}>{l10n.translation('newTab')}</h4>

      <div className="field">
        <Checkbox defaultChecked={this.state.openTabNextLabel} toggle onChange={this.onChange.bind(this,'openTabNextLabel')}/>
        <span className="toggle-label">{l10n.translation('openTabNextLabel')}</span>
      </div>


      <div className='spacer2'/>

      <Grid>
        <Grid.Row>
          <Grid.Column width={6}><label style={{paddingLeft: 60}}>Open New Tabs At:</label></Grid.Column>
          <Grid.Column width={5}><Dropdown onChange={this.onChange.bind(this,'openTabPosition')} selection
                                           options={[{value: 'default',text:'Default Position'},{value: 'left',text: 'Left End'},{value: 'right',text: 'Right End'}]}
                                           defaultValue={this.state.openTabPosition}/></Grid.Column>
        </Grid.Row>
      </Grid>

      <div className='spacer'/>

      <Grid>
        <Grid.Row>
          <Grid.Column width={6}><label style={{paddingLeft: 60}}>{l10n.translation('speLinkLabel')}</label></Grid.Column>
          <Grid.Column width={5}><Dropdown onChange={this.onChange.bind(this,'alwaysOpenLinkNewTab')} selection
                                           options={this.makeOptions(['speLinkNone','speLinkExternal','speLinkAllLinks'])}
                                           defaultValue={this.state.alwaysOpenLinkNewTab}/></Grid.Column>
        </Grid.Row>
      </Grid>

      <div className='spacer'/>

      <div className="field">
        <Checkbox defaultChecked={this.state.alwaysOpenLinkBackground} toggle onChange={this.onChange.bind(this,'alwaysOpenLinkBackground')}/>
        <span className="toggle-label">Open New Tab in Background</span>
      </div>

      <div className='spacer'/>

      <div className="field">
        <Checkbox defaultChecked={this.state.oppositeGlobal} toggle onChange={this.onChange.bind(this,'oppositeGlobal')}/>
        <span className="toggle-label">Opposite Mode (If a link is about to be opened in the new background, it opens in the oppopsite tab.)</span>
      </div>

      <Divider/>
      <h4 style={{marginTop:0, marginBottom: 20}}>{l10n.translation('showOntabLabel')}</h4>

      <div className="field">
        <Checkbox defaultChecked={this.state.multistageTabs} toggle onChange={this.onChange.bind(this,'multistageTabs')}/>
        <span className="toggle-label">{l10n.translation('tabScrollMultibar')}</span>
      </div>

      <div className='spacer2'/>

      <Grid>
        <Grid.Row>
          <Grid.Column width={3}><label>{l10n.translation('maxrowLabel')}</label></Grid.Column>
          <Grid.Column width={8}><Dropdown onChange={this.onChange.bind(this,'maxrowLabel')} selection
                                           options={concurrentDownloadOptions}
                                           defaultValue={this.state.maxrowLabel}/></Grid.Column>
        </Grid.Row>
      </Grid>

      <div className='spacer'/>

      <div className="field">
        <label>{l10n.translation('minWidthLabel')}&nbsp;</label>
        <Input onChange={this.onChange.bind(this,'tabMinWidth')} defaultValue={this.state.tabMinWidth}/>
        <label>&nbsp;{l10n.translation('widthToLabel')}&nbsp;</label>
        <Input onChange={this.onChange.bind(this,'tabMaxWidth')} defaultValue={this.state.tabMaxWidth}/>
        <label>&nbsp;{l10n.translation('widthPixelsLabel')}</label>
      </div>

      <Divider/>
      <h4 style={{marginTop:0, marginBottom: 20}}>{l10n.translation('5431318178759467895')}</h4>


      <div className="field">
        <Checkbox style={{verticalAlign: 'middle'}} defaultChecked={this.state.themeColorChange} toggle onChange={this.onChange.bind(this,'themeColorChange')}/>
        <span style={{verticalAlign: 'baseline'}} className="toggle-label">{l10n.translation('paintTabs')}</span>
      </div>

      <div className='spacer2'/>

      <div className="field">
        <span style={{verticalAlign: 'baseline',paddingLeft:60}} className="toggle-label">{l10n.translation('currentTabLabel')}&nbsp;&nbsp;&nbsp;{l10n.translation('textcolorLabel')}:&nbsp;&nbsp;</span>
        <Input ref='colorActiveText' onChange={this.onChange.bind(this,'colorActiveText')} defaultValue={this.state.colorActiveText}/>
        <span style={{verticalAlign: 'baseline'}} className="toggle-label">&nbsp;{l10n.translation('bgColorLabel')}:&nbsp;&nbsp;</span>
        <Input ref='colorActiveBackground' onChange={this.onChange.bind(this,'colorActiveBackground')} defaultValue={this.state.colorActiveBackground}/>
      </div>

      <div className='spacer2'/>

      <div className="field">
        <Checkbox style={{verticalAlign: 'middle'}} defaultChecked={this.state.enableColorOfNoSelect} toggle onChange={this.onChange.bind(this,'enableColorOfNoSelect')}/>
        <span style={{verticalAlign: 'baseline'}} className="toggle-label">{l10n.translation('unreadTabLabel')}&nbsp;&nbsp;&nbsp;{l10n.translation('textcolorLabel')}:&nbsp;&nbsp;</span>
        <Input ref='colorUnreadText' onChange={this.onChange.bind(this,'colorUnreadText')} defaultValue={this.state.colorUnreadText}/>
        <span style={{verticalAlign: 'baseline'}} className="toggle-label">&nbsp;{l10n.translation('bgColorLabel')}:&nbsp;&nbsp;</span>
        <Input ref='colorUnreadBackground' onChange={this.onChange.bind(this,'colorUnreadBackground')} defaultValue={this.state.colorUnreadBackground}/>
      </div>

      <div className='spacer2'/>

      <div className="field">
        <span style={{verticalAlign: 'baseline',paddingLeft:60}} className="toggle-label">{l10n.translation('otherTabsLabel')}&nbsp;&nbsp;&nbsp;{l10n.translation('textcolorLabel')}:&nbsp;&nbsp;</span>
        <Input ref='colorNormalText' onChange={this.onChange.bind(this,'colorNormalText')} defaultValue={this.state.colorNormalText}/>
        <span style={{verticalAlign: 'baseline'}} className="toggle-label">&nbsp;{l10n.translation('bgColorLabel')}:&nbsp;&nbsp;</span>
        <Input ref='colorNormalBackground' onChange={this.onChange.bind(this,'colorNormalBackground')} defaultValue={this.state.colorNormalBackground}/>
      </div>

      <div className='spacer2'/>

      <div className="field">
        <span style={{verticalAlign: 'baseline',paddingLeft:60}} className="toggle-label">Dashed line when dragging:&nbsp;&nbsp;</span>
        <Input ref='colorTabDot' onChange={this.onChange.bind(this,'colorTabDot')} defaultValue={this.state.colorTabDot}/>
      </div>

      <div className='spacer2'/>

      <div className="field">
        <span style={{verticalAlign: 'baseline',paddingLeft:60}} className="toggle-label">Color of Mute/Pin/Reload Icon:&nbsp;&nbsp;</span>
        <Input ref='colorTabMode' onChange={this.onChange.bind(this,'colorTabMode')} defaultValue={this.state.colorTabMode}/>
      </div>

      <div className='spacer2'/>

      <div className="field">
        <Checkbox ref='showBorderActiveTab' style={{verticalAlign: 'middle'}} defaultChecked={this.state.showBorderActiveTab} toggle onChange={this.onChange.bind(this,'showBorderActiveTab')}/>
        <span style={{verticalAlign: 'baseline'}} className="toggle-label">Show Bottom Border in Current Tab</span>
      </div>


      <div className='spacer2'/>

      <div className="field">
        <Button primary content='Default Theme' onClick={_=>this.changeTheme('default')}/>
        <Button primary content='Dark Theme' onClick={_=>this.changeTheme('dark')}/>
      </div>

      <Divider/>

      <h4 style={{marginTop:0, marginBottom: 20}}>{l10n.translation('tabbarscrollingCaption')}</h4>

      <div className="field">
        <Checkbox defaultChecked={this.state.scrollTab} toggle onChange={this.onChange.bind(this,'scrollTab')}/>
        <span className="toggle-label">{l10n.translation('tabbarscrollingSelectTabLabel')}</span>
      </div>

      <div className='spacer2'/>

      <div className="field">
        <Checkbox defaultChecked={this.state.reverseScrollTab} toggle onChange={this.onChange.bind(this,'reverseScrollTab')}/>
        <span className="toggle-label">{l10n.translation('tabbarscrollingInverseLabel')}</span>
      </div>

      <Divider/>

      <h4 style={{marginTop:0, marginBottom: 20}}>{l10n.translation('tabFocusLabel')}</h4>

      <div className="field">
        <Checkbox style={{verticalAlign: 'middle'}} defaultChecked={this.state.mouseHoverSelectLabelBegin} toggle onChange={this.onChange.bind(this,'mouseHoverSelectLabelBegin')}/>
        <span style={{verticalAlign: 'baseline'}} className="toggle-label">{l10n.translation('mouseHoverSelectLabelBegin')}&nbsp;</span>
        <Input onChange={this.onChange.bind(this,'mouseHoverSelectLabelBeginDelay')} defaultValue={this.state.mouseHoverSelectLabelBeginDelay}/>
        &nbsp;{l10n.translation('millisecondsLabel')}
      </div>
      <div className='spacer2'/>

      <div className="field">
        <Checkbox defaultChecked={this.state.tabFlipLabel} toggle onChange={this.onChange.bind(this,'tabFlipLabel')}/>
        <span className="toggle-label">{l10n.translation('tabFlipLabel')}</span>
      </div>

      <Divider/>

      <h4 style={{marginTop:0, marginBottom: 20}}>{l10n.translation('mouseClickLabel')}</h4>

      <Grid>
        <Grid.Row>
          <Grid.Column width={3}><label>{l10n.translation('doubleLabel')}</label></Grid.Column>
          <Grid.Column width={8}><Dropdown onChange={this.onChange.bind(this,'doubleClickTab')} selection
                                           options={this.mouseOptions}
                                           defaultValue={this.state.doubleClickTab}/></Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={3}><label>{l10n.translation('middleLabel')}</label></Grid.Column>
          <Grid.Column width={8}><Dropdown onChange={this.onChange.bind(this,'middleClickTab')} selection
                                           options={this.mouseOptions}
                                           defaultValue={this.state.middleClickTab}/></Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={3}><label>{l10n.translation('altLabel')}</label></Grid.Column>
          <Grid.Column width={8}><Dropdown onChange={this.onChange.bind(this,'altClickTab')} selection
                                           options={this.mouseOptions}
                                           defaultValue={this.state.altClickTab}/></Grid.Column>
        </Grid.Row>
      </Grid>

      <div className='spacer'/>

      <h4 style={{marginTop:0, marginBottom: 20}}>{l10n.translation('newTabButtonLabel').replace('を表示','')}</h4>

      <Grid>
        <Grid.Row>
          <Grid.Column width={3}><label>Right Click</label></Grid.Column>
          <Grid.Column width={8}><Dropdown onChange={this.onChange.bind(this,'rightClickTabAdd')} selection
                                           options={this.mouseOptions}
                                           defaultValue={this.state.rightClickTabAdd}/></Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={3}><label>{l10n.translation('middleLabel')}</label></Grid.Column>
          <Grid.Column width={8}><Dropdown onChange={this.onChange.bind(this,'middleClickTabAdd')} selection
                                           options={this.mouseOptions}
                                           defaultValue={this.state.middleClickTabAdd}/></Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={3}><label>{l10n.translation('altLabel')}</label></Grid.Column>
          <Grid.Column width={8}><Dropdown onChange={this.onChange.bind(this,'altClickTabAdd')} selection
                                           options={this.mouseOptions}
                                           defaultValue={this.state.altClickTabAdd}/></Grid.Column>
        </Grid.Row>
      </Grid>

      <div className='spacer2'/>
      <Divider/>

      <h4>{l10n.translation('5513242761114685513')}</h4>
      <table className="ui celled compact table" style={{borderCollapse: 'collapse'}}>
        <thead>
        <tr>
          <th>{l10n.translation('default')}</th>
          <th>{l10n.translation('name')}</th>
          <th>Priority</th>
        </tr>
        </thead>
        <tbody>
        {this.renderRows('tab')}
        </tbody>
      </table>
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
        <label>{val}</label>
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


let contextMenuDefault
class ContextMenuSetting extends React.Component {
  constructor(props) {
    super(props)
    this.state = {...contextMenuDefault,errors:{}}
  }

  onChange(isTab,name,e,data){
    const disableMenu = isTab ? 'disableTabContextMenus' : 'disableContextMenus'
    const val = data.checked
    if(val){
      this.state[disableMenu] = this.state[disableMenu].filter(x=>x!==name)
    }
    else{
      this.state[disableMenu].push(name)
    }
    ipc.send('save-state',{tableName:'state',key:disableMenu,val:this.state[disableMenu]})

    this.setState({})
  }

  emitChange(isTab,name,e){
    const val = e.target.innerText
    const priorityMenu = isTab ? 'priorityTabContextMenus' : 'priorityContextMenus'
    if(val == "" || val === void 0){
      delete this.state[priorityMenu]
    }
    else{
      this.state[priorityMenu][name] = val
    }
    ipc.send('save-state',{tableName:'state',key:priorityMenu,val:this.state[priorityMenu]})
  }

  onBlur(isTab,name,e){
    this.emitChange(isTab, name, e)
    this.setState({})
  }

  renderRows(isTab){
    const disableMenu = isTab ? 'disableTabContextMenus' : 'disableContextMenus'
    const priorityMenu = isTab ? 'priorityTabContextMenus' : 'priorityContextMenus'
    const ret = []
    let i = 0
    let divider
    for(let [key,name] of (isTab ? tabContextMenus : contextMenus)){
      if(key == 'divider'){
        divider = true
        continue
      }
      ret.push(
        <tr key={`tr${i}`} style={divider ? {borderTop: '3px double rgba(34,36,38,.15)'} : {}}>
          <td key={`default${i}`}>
            <Checkbox defaultChecked={!this.state[disableMenu].find(x=>x==key)} toggle onChange={this.onChange.bind(this,isTab,key)}/>
          </td>
          <td key={`name${i}`} >{name}</td>
          <td key={`shortcut${i}`} data-num={i} data-name='shortcut' onInput={this.emitChange.bind(this,isTab,key)} onBlur={this.onBlur.bind(this,isTab,key)} contentEditable>{this.state[priorityMenu][key]||"0"}</td>
        </tr>)
      divider = false
      i++
    }

    return ret
  }

  render() {
    return <div>
      <h3>{l10n.translation('5513242761114685513')}</h3>
      <Divider/>

      <table className="ui celled compact table" style={{borderCollapse: 'collapse'}}>
        <thead>
        <tr>
          <th>{l10n.translation('default')}</th>
          <th>{l10n.translation('name')}</th>
          <th>Priority</th>
        </tr>
        </thead>
        <tbody>
        {this.renderRows()}
        </tbody>
      </table>

    </div>
  }
}

let videoDefault
class VideoSetting extends React.Component {
  constructor(props) {
    super(props)
    this.state = {...videoDefault,errors:{}}
  }

  onChange(name,e,data){
    if(name == 'blackListVideo') data = {value: data.value.split("\n")}
    ipc.send('save-state',{tableName:'state',key:name,val:data.checked === void 0 ? data.value : data.checked})
    this.setState({})
  }

  onChange2(name,num,e,data){
    if(data.value == "" || isAccelerator(data.value)){
      const datas = this.state[name]
      datas[num] = data.value
      ipc.send('save-state',{tableName:'state',key:name,val:datas })
      this.state.errors[name+num] = false
    }
    else{
      this.state.errors[name+num] = true
    }
    this.setState({})
  }

  eachRender(key,val){
    if(!this.state[key]) return null

    let arr = [this.state[key][0],this.state[key][1],this.state[key][2]]
    return  <Grid.Row>
      <Grid.Column width={3}>
        <label style={{verticalAlign: -9}}>{val}</label>
      </Grid.Column>
      {arr.map((x,i)=>{
        return <Grid.Column width={3}>
          <Input fluid error={!!this.state.errors[key+i]} onChange={this.onChange2.bind(this,key,i)} defaultValue={x}/>
        </Grid.Column>
      })}
    </Grid.Row>
  }

  renderRows(){
    const ret = []
    for(let [key,val] of Object.entries(videoKeyMapping)){
      val = val.replace('…','')
      let row = this.eachRender(key,val)
      if(row) ret.push(row)

    }

    return ret
  }

  render() {
    return <div>
      <h3>{l10n.translation('6146563240635539929')}</h3>
      <Divider/>

      <h4>{l10n.translation('8260864402787962391')}</h4>
      <Divider/>
      <Grid>
        <Grid.Row>
          <Grid.Column width={4}><label>Mouse Click</label></Grid.Column>
          <Grid.Column width={7}><Dropdown onChange={this.onChange.bind(this,'clickVideo')} selection options={videoClickOptions} defaultValue={this.state.clickVideo}/></Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={4}><label>Mouse Double Click</label></Grid.Column>
          <Grid.Column width={7}><Dropdown onChange={this.onChange.bind(this,'dbClickVideo')} selection options={videoClickOptions} defaultValue={this.state.dbClickVideo}/></Grid.Column>
        </Grid.Row>
      </Grid>
      <br/>

      <h4>{l10n.translation('mouseWheelFunctions')}</h4>
      <Divider/>
      <Grid>
        <Grid.Row>
          <Grid.Column width={4}><label>Mouse Wheel</label></Grid.Column>
          <Grid.Column width={7}><Dropdown onChange={this.onChange.bind(this,'wheelMinusVideo')} selection options={videoWheelOptions} defaultValue={this.state.wheelMinusVideo}/></Grid.Column>
        </Grid.Row>
      </Grid>
      <Grid>
        <Grid.Row>
          <Grid.Column width={4}><label>Shift+Mouse Wheel</label></Grid.Column>
          <Grid.Column width={7}><Dropdown onChange={this.onChange.bind(this,'shiftWheelMinusVideo')} selection options={videoWheelOptions} defaultValue={this.state.shiftWheelMinusVideo}/></Grid.Column>
        </Grid.Row>
      </Grid>
      <Grid>
        <Grid.Row>
          <Grid.Column width={4}><label>Ctrl+Mouse Wheel</label></Grid.Column>
          <Grid.Column width={7}><Dropdown onChange={this.onChange.bind(this,'ctrlWheelMinusVideo')} selection options={videoWheelOptions} defaultValue={this.state.ctrlWheelMinusVideo}/></Grid.Column>
        </Grid.Row>
      </Grid>
      <Grid>
        <Grid.Row>
          <Grid.Column width={4}><label>Shift+Ctrl+Mouse Wheel</label></Grid.Column>
          <Grid.Column width={7}><Dropdown onChange={this.onChange.bind(this,'shiftCtrlWheelMinusVideo')} selection options={videoWheelOptions} defaultValue={this.state.shiftCtrlWheelMinusVideo}/></Grid.Column>
        </Grid.Row>
      </Grid>
      <br/>
      <br/>
w
      <div className="field">
        <Checkbox defaultChecked={this.state.reverseWheelVideo} toggle onChange={this.onChange.bind(this,'reverseWheelVideo')}/>
        <span className="toggle-label">{l10n.translation('reverseWheelMediaSeeking').replace(/\(.\)/,'')}</span>
      </div>
      <br/>


      <h4>{l10n.translation('mediaSeeking').replace(/\(.\)/,'')}</h4>
      <Divider/>

      <Grid>
        <Grid.Row>
          <Grid.Column width={4}><label>{l10n.translation('mediaSeeking').replace(/\(.\)/,'')+'1'}</label></Grid.Column>
          <Grid.Column width={7}><Input onChange={this.onChange.bind(this,'mediaSeek1Video')} defaultValue={this.state.mediaSeek1Video}/>{' '+l10n.translation('minimumPageTimeLow').replace(/5 */,'')}</Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={4}><label>{l10n.translation('mediaSeeking').replace(/\(.\)/,'')+'2'}</label></Grid.Column>
          <Grid.Column width={7}><Input onChange={this.onChange.bind(this,'mediaSeek2Video')} defaultValue={this.state.mediaSeek2Video}/>{' '+l10n.translation('minimumPageTimeLow').replace(/5 */,'')}</Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={4}><label>{l10n.translation('mediaSeeking').replace(/\(.\)/,'')+'3'}</label></Grid.Column>
          <Grid.Column width={7}><Input onChange={this.onChange.bind(this,'mediaSeek3Video')} defaultValue={this.state.mediaSeek3Video}/>{' '+l10n.translation('minimumPageTimeLow').replace(/5 */,'')}</Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={4}><label>{l10n.translation('volumeControl').replace(/\(.\)/,'')}</label></Grid.Column>
          <Grid.Column width={7}><Input onChange={this.onChange.bind(this,'audioSeekVideo')} defaultValue={this.state.audioSeekVideo}/>%</Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={4}><label>{l10n.translation('changeSpeed').replace(/\(.\)/,'')}</label></Grid.Column>
          <Grid.Column width={7}><Input onChange={this.onChange.bind(this,'speedSeekVideo')} defaultValue={this.state.speedSeekVideo}/>%</Grid.Column>
        </Grid.Row>
      </Grid>
      <br/>
      <br/>

      <h4>{l10n.translation('1524430321211440688')}</h4>
      <Divider/>

      <div className="field">
        <Checkbox defaultChecked={this.state.enableKeyDownVideo} toggle onChange={this.onChange.bind(this,'enableKeyDownVideo')}/>
        <span className="toggle-label">Enable Keyboard Shortcut</span>
      </div>
      <br/>

      <p>Please refer <a target="_blank" href="https://github.com/electron/electron/blob/master/docs/api/accelerator.md">here</a> for input method of shortcut</p>
      <br/>

      <Grid >
        {this.renderRows()}
      </Grid>
      <br/>


      <h4>Black List Sites (Forward match)</h4>
      <Divider/>
      <Form>
        <TextArea autoHeight placeholder='input URLs' onChange={this.onChange.bind(this,'blackListVideo')} defaultValue={this.state.blackListVideo.join("\n")}/>
      </Form>
      <Divider/>

    </div>
  }
}

let extensionDefault
class ExtensionSetting extends React.Component {
  constructor(props) {
    super(props)
    this.state = {extensions:extensionDefault.extensions}
  }


  changeCheck(id,data){
    this.state.extensions[id].enabled = data.checked
    const val = []
    for(let [id,values] of Object.entries(this.state.extensions)){
      const orgId = values.basePath.split(/[\/\\]/).slice(-2,-1)[0]
      if(!values.enabled) val.push(orgId)
    }
    ipc.send('save-state',{tableName:'state',key:'disableExtensions',val})
    this.setState({})
  }

  buildSearchEngineColumns(){
    const ret = []
    let i = 0
    for(let [id,v] of Object.entries(this.state.extensions)){
      if(['dckpbojndfoinamcdamhkjhnjnmjkfjd','jdbefljfgobbmcidnmpjamcbhnbphjnb'].includes(id)) continue
      ret.push(this.buildSearchEngineColumn(i++,id,v))
    }
    return ret
  }


  buildSearchEngineColumn(i,id,v){
    console.log(id,v)
    const orgId = v.basePath.split(/[\/\\]/).slice(-2,-1)[0]
    const cannotDisable = orgId == "jpkfjicglakibpenojifdiepckckakgk" || orgId == "occjjkgifpmdgodlplnacmkejpdionan"
    const icon = v.icons ? v.icons[Math.max(...Object.keys(v.icons))] : ""
    return <tr key={`tr${i}`}>
      <td key={`icon${i}`}><img style={{width:32,height:32,margin:'auto'}} src={`file://${v.basePath}/${icon}`}/></td>
      <td key={`name${i}`}><a target="_blank" href={`https://chrome.google.com/webstore/detail/${orgId}`}>{v.name}</a></td>
      <td key={`description${i}`} >{v.description}</td>
      <td key={`version${i}`} style={{width: 40}}>{v.version}</td>
      <td key={`option${i}`} style={{fontSize: 20,textAlign: 'center'}}>
        {v.enabled && v.optionPage ? <a href="#" onClick={_=> ipc.sendToHost("open-tab", `chrome-extension://${id}/${v.optionPage}`, true)}>
          <i aria-hidden="true" class="setting icon"></i>
        </a> : null}
      </td>
      <td key={`enabled${i}`}>
        <Checkbox checked={v.enabled} disabled={cannotDisable} toggle onChange={(e,data)=>this.changeCheck(id,data)}/>
      </td>
      <td key={`background${i}`} style={{fontSize: 20,textAlign: 'center'}}>
        {v.enabled && v.background ? <a href="#" onClick={_=> ipc.sendToHost("load-url", `chrome-extension://${id}/${v.background}`, true)}>
          <i aria-hidden="true" class="bug icon"></i>
        </a> : null}
      </td>
      <td key={`delete${i}`} style={{fontSize: 20,textAlign: 'center'}}>
        {cannotDisable ? null : <a href="#" onClick={_=> ipc.send("delete-extension",id,orgId)}>
          <i aria-hidden="true" class="trash icon"></i>
        </a>}
      </td>
    </tr>
  }

  render() {
    return <div>
      <h3>{l10n.translation('extensions')}</h3>

      <table className="ui celled compact table">
        <thead>
        <tr>
          <th></th>
          <th>{l10n.translation('name')}</th>
          <th>{l10n.translation('4289540628985791613')}</th>
          <th>{l10n.translation('3095995014811312755')}</th>
          <th>{l10n.translation('6550675742724504774')}</th>
          <th>{l10n.translation('59174027418879706')}</th>
          <th>{l10n.translation('4989966318180235467')}</th>
          <th>{l10n.translation('6326175484149238433').replace('Chrome','Sushi Browser')}</th>

        </tr>
        </thead>
        <tbody>
        {this.buildSearchEngineColumns()}
        </tbody>
        <tfoot className="full-width">
        <tr>
          <th>
          </th>
          <th colspan="7">
          </th>
        </tr>
        </tfoot>
      </table>
    </div>
  }

}

const routings = {
  'general' : <GeneralSetting/>,
  'search' : <SearchSetting/>,
  'tabs' : <TabsSetting/>,
  'contextMenu' : <ContextMenuSetting/>,
  'keyboard' : <KeyboardSetting/>,
  'video' : <VideoSetting/>,
  'extensions' : <ExtensionSetting/>,
}

class TopList extends React.Component {
  constructor(props) {
    super(props)
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
      {l10n.translation(name == "keyboard" ? '1524430321211440688' : name == 'video' ? '6146563240635539929' : name == 'contextMenu'? '5513242761114685513' : name)}
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
        {this.getMenu('contextMenu','square outline')}
        {this.getMenu('keyboard','keyboard')}
        {this.getMenu('video','video')}
        {this.getMenu('extensions','industry')}
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

const key = Math.random().toString()
ipc.send("get-main-state",key,['startsWith','newTabMode','myHomepage','searchProviders','searchEngine','language','enableFlash','concurrentDownload','downloadNum','sideBarDirection','scrollTab',
  'doubleShift','tripleClick','enableMouseGesture','extensionOnToolbar','syncScrollMargin','contextMenuSearchEngines','ALL_KEYS','bindMarginFrame','bindMarginTitle','longPressMiddle','checkDefaultBrowser','sendToVideo',
  'multistageTabs','tabMinWidth','httpsEverywhereEnable','trackingProtectionEnable','autoSaveInterval','noScript','blockCanvasFingerprinting','browsingHistory', 'downloadHistory',
  'disableContextMenus','disableTabContextMenus','priorityContextMenus','priorityTabContextMenus','reloadIntervals','generalWindowOpenLabel','keepWindowLabel31',
  'closeTabBehavior','reverseScrollTab','tabMaxWidth','mouseHoverSelectLabelBegin','mouseHoverSelectLabelBeginDelay','tabFlipLabel','doubleClickTab','middleClickTab','altClickTab',
  'maxrowLabel','orderOfAutoComplete','numOfSuggestion','numOfHistory','openTabNextLabel','rightClickTabAdd','middleClickTabAdd','altClickTabAdd','displayFullIcon','downloadPath',
  'defaultDownloadPath','alwaysOpenLinkNewTab','openTabPosition','alwaysOpenLinkBackground','addressBarNewTab','oppositeGlobal','colorNormalText','colorNormalBackground','colorActiveText',
  'colorActiveBackground','colorTabDot','colorUnreadText','colorUnreadBackground','enableColorOfNoSelect','themeColorChange','showBorderActiveTab','historyBadget','colorTabMode',
  'clearHistoryOnClose','clearDownloadOnClose','clearCacheOnClose','clearStorageDataOnClose','clearAutocompleteDataOnClose','clearAutofillDataOnClose','clearPasswordOnClose','clearGeneralSettingsOnClose','clearFavoriteOnClose',
  'enableWidevine','toolbarLink','sidebarLink','bookmarkbarLink','zoomBehavior'])
ipc.once(`get-main-state-reply_${key}`,(e,data)=>{
  generalDefault = data
  keyboardDefault = data
  TabDefault = data
  videoDefault = data
  extensionDefault = data
  contextMenuDefault = data

  const {searchProviders, searchEngine, contextMenuSearchEngines} = data
  let arr = []
  for(let [name,value] of Object.entries(searchProviders)){
    arr[value.ind] = value
  }
  searchDefault = {searchProviders: arr.filter(x=>x),default: searchEngine,contextMenuSearchEngines}

  ReactDOM.render(<App />,  document.getElementById('app'))
})
