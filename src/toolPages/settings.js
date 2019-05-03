import uuid from "node-uuid";

window.debug = require('debug')('info')
import process from './process'
import {ipcRenderer as ipc} from './ipcRenderer'
const path = require('path')
const React = require('react')
const ReactDOM = require('react-dom')
const isAccelerator = require("electron-is-accelerator")
const {  Form, TextArea, Grid, Sidebar, Segment, Container, Menu, Input,Divider, Button, Checkbox, Icon, Table, Dropdown } = require('semantic-ui-react');
const { StickyContainer, Sticky } = require('react-sticky');
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'

import l10n from '../../brave/js/l10n';
const initPromise = l10n.init()
import '../defaultExtension/contentscript'

const isDarwin = navigator.userAgent.includes('Mac OS X')
const isWin = navigator.userAgent.includes('Windows')

;(async ()=>{
  await initPromise

  const keyMapping = {
    keyNewTab: l10n.translation('newTab'),
    // keyNewPrivateTab: l10n.translation('newPrivateTab'),
    // keyNewTorTab: 'New Tor Tab',
    // keyNewSessionTab: l10n.translation('newSessionTab'),
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
    keyRestart: l10n.translation("restartBrowser"),
    keyQuit: l10n.translation('quitApp').replace('Brave','Sushi Browser'),
    keyUndo: l10n.translation('undo'),
    keyRedo: l10n.translation('redo'),
    keyCut: l10n.translation('cut'),
    keyCopy: l10n.translation('copy'),
    keyPaste: l10n.translation('paste'),
    keyPasteWithoutFormatting: l10n.translation('pasteWithoutFormatting'),
    keySelectAll: l10n.translation('selectAll'),
    keyFindOnPage: l10n.translation('findOnPage'),
    keyToggleFindOnPage: 'Toggle Find in Page',
    keyFindNext:  l10n.translation('findNext'),
    keyFindPrevious:  l10n.translation('findPrevious'),
    keyFindAll: 'FindAll',
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
    // keyToggleFullScreenView: l10n.translation('toggleFullScreenView'),
    keyHome: l10n.translation('home'),
    keyBack: l10n.translation('back'),
    keyForward: l10n.translation('forward'),
    keyReopenLastClosedTab: l10n.translation('reopenLastClosedTab'),
    keyClicktabUcatab: l10n.translation('clicktabUcatab'),
    keyAddBookmarkAll: l10n.translation('5078638979202084724'),
    keyBookmarksManager: l10n.translation('bookmarksManager'),
    keyBookmarkPage: l10n.translation('bookmarkPage'),
    keyShowAllHistory: l10n.translation('showAllHistory'),
    keyNote: l10n.translation("openNote"),
    keySettings: l10n.translation(isDarwin ? 'preferences' : 'settings'),
    keyFileExploler: l10n.translation("openFileExploler"),
    keyTerminal: l10n.translation("openTerminal"),
    keyAutomation: l10n.translation("openAutomation"),
    keyVideoConverter: l10n.translation("openVideoConverter"),
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
    keyMultiRowTabs: l10n.translation('multiRowTabs'),
    keyTabPreview: l10n.translation("tabPreview"),
    keyToggleMenuBar: l10n.translation("toggleMenuBar"),
    keyChangeFocusPanel: l10n.translation("changeFocusPanel"),
    keySplitLeft: l10n.translation("splitLeft"),
    keySplitRight: l10n.translation("splitRight"),
    keySplitTop: l10n.translation("splitTop"),
    keySplitBottom: l10n.translation("splitBottom"),
    keySplitLeftTabs: l10n.translation("splitLeftTabsToLeft"),
    keySplitRightTabs: l10n.translation("splitRightTabsToRight"),
    keySwapPosition: l10n.translation("swapPosition"),
    keySwitchDirection: l10n.translation("switchDirection"),
    keyAlignHorizontal: l10n.translation("alignHorizontal"),
    keyAlignVertical: l10n.translation("alignVertical"),
    keyArrangePanel: 'Arrange All Panel',
    keyArrangePanelEach: 'Arrange Panel',
    keySwitchSyncScroll: l10n.translation("switchSyncScroll"),
    keyOpenSidebar: l10n.translation("openSidebar"),
    // keySearchHighlight: l10n.translation("enableSearchHighlight"),
    keyChangeMobileAgent: l10n.translation("changeToMobileAgent"),
    keyDetachPanel: l10n.translation("detachPanel"),
    // keyFloatingPanel: l10n.translation("floatingPanel"),
    keyMaximizePanel: 'Maximize Panel',

    // keyDownloadAll: l10n.translation("downloadAll"),
    // keyPageTranslate: l10n.translation('2473195200299095979'),

    //clipboard
    keyClicktabCopyTabUrl: l10n.translation('clicktabCopyTabUrl').replace('&apos;',"'"),
    keyClicktabCopyUrlFromClipboard: l10n.translation('clicktabCopyUrlFromClipboard'),
    keyPasteAndOpen: l10n.translation("pasteAndOpen"),
    keyCopyTabInfo: l10n.translation("copyTabInfo"),
    keyCopyAllTabTitles: l10n.translation("copyAllTabTitles"),
    keyCopyAllTabUrls: l10n.translation("copyAllTabURLs"),
    keyCopyAllTabInfos: l10n.translation("copyAllTabInfos"),

    //util
    keyDuplicateTab: l10n.translation('3007771295016901659'),
    keyUnpinTab: l10n.translation('pinTab'),
    keyUnmuteTab: l10n.translation('muteTab'),
    keyFreezeTabMenuLabel: l10n.translation('freezeTabMenuLabel'),
    keyProtectTabMenuLabel: l10n.translation('protectTabMenuLabel'),
    keyLockTabMenuLabel: l10n.translation('lockTabMenuLabel'),
    keyDownloadsManager: l10n.translation('downloadsManager'),
    keyScreenShotFullClipBoard: l10n.translation("fullPageCaptureToClipboard"),
    keyScreenShotFullJpeg: l10n.translation("fullPageCaptureAsJPEG"),
    keyScreenShotFullPng: l10n.translation("fullPageCaptureAsPNG"),
    keyScreenShotSelectionClipBoard: l10n.translation("selectionCaptureToClipboard"),
    keyScreenShotSelectionJpeg: l10n.translation("selectionCaptureAsJPEG"),
    keyScreenShotSelectionPng: l10n.translation("selectionCaptureAsPNG"),
    keyHideBrave: l10n.translation('hideBrave').replace('Brave','Sushi Browser'),
    keyHideOthers: l10n.translation('hideOthers'),
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
      text: l10n.translation('8870318296973696995'),
    },
    {
      key: 'top',
      value: 'top',
      text: l10n.translation("topPage"),
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
      text: l10n.translation('terminal'),
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

  const historySuggestionOptions = Array.from(new Array(51)).map((v,n)=>{
    return {value: n ,text: n}
  })

  const sendToVideoOptionsAll = [
    { value: 'vlc', text: 'VLC Media Player',os:['win','mac','linux']},
    { value: 'PotPlayerMini64', text: 'PotPlayer',os:['win']},
    { value: 'mplayerx', text: 'MPlayerX',os:['mac']},
    { value: 'smplayer', text: 'SMPlayer',os:['win','mac','linux']},
    { value: 'C:\\Program Files\\MPC-HC\\mpc-hc64.exe', text: 'Media Player Classic(MPC-HC)',os:['win']},
    { value: 'C:\\Program Files\\MPC-BE x64\\mpc-be64.exe', text: 'MPC-BE',os:['win']},

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
      text: l10n.translation('leftSide'),
    },
    {
      key: 'right',
      value: 'right',
      text: l10n.translation('rightSide'),
    },
    {
      key: 'bottom',
      value: 'bottom',
      text: l10n.translation('bottomSide'),
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
    ['copyLinks', l10n.translation('copyLinks')],
    ['openalllinksLabel', l10n.translation('openalllinksLabel')],
    ['downloadSelection', l10n.translation('downloadSelection')],
    ['savePageAs', l10n.translation('savePageAs')],
    ['bookmarkPage', l10n.translation('bookmarkPage')],
    ['print', l10n.translation('print')],
    ['2473195200299095979', l10n.translation('2473195200299095979')],

    ['divider', null],

    ['downloadAll', l10n.translation('downloadAll')],

    ['divider', null],

    ['syncScrollLeftToRight', l10n.translation('syncScrollLeftToRight')],
    ['syncScrollRightToLeft', l10n.translation('syncScrollRightToLeft')],

    ['divider', null],

    ['addToNotes(c)', `${l10n.translation('addToNotes')}(c)`],
    ['addToNotes(o)', `${l10n.translation('addToNotes')}(o)`],

    ['divider', null],

    ['viewPageSource', l10n.translation('viewPageSource')],
    ['inspectElement', l10n.translation('inspectElement')],

    ['divider', null],

    ['openInNewTab', l10n.translation('openInNewTab')],
    ['openLinkInOppositeTab', l10n.translation('openLinkInOppositeTab')],
    // ['openInNewPrivateTab', l10n.translation('openInNewPrivateTab')],
    // ['Open Link in Tor Tab', 'Open Links in New Tor Tabs'],
    // ['openInNewSessionTab', l10n.translation('openInNewSessionTab')],
    ['openInNewWindow', l10n.translation('openInNewWindow')],
    ['5317780077021120954', l10n.translation('5317780077021120954')],
    ['saveLinkAs', l10n.translation('saveLinkAs')],
    ['copyLinkAddress', l10n.translation('copyLinkAddress')],
    ['1047431265488717055', l10n.translation('1047431265488717055')],
    ['saveAndPlayVideo', l10n.translation('saveAndPlayVideo')],
    ['sendURLToVideoPlayer', l10n.translation('sendURLToVideoPlayer')],

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
    ['playVideoInPopupWindow', l10n.translation('playVideoInPopupWindow')],
    // ['playVideoInFloatingPanel', l10n.translation('playVideoInFloatingPanel')],
    ['4643612240819915418', l10n.translation('4643612240819915418')],
    ['4256316378292851214', l10n.translation('4256316378292851214')],
    ['782057141565633384', l10n.translation('782057141565633384')],
    ['2019718679933488176', l10n.translation('2019718679933488176')],
    ['5116628073786783676', l10n.translation('5116628073786783676')],
    ['1465176863081977902', l10n.translation('1465176863081977902')]
  ]

  const tabContextMenus = [
    ['newTab', l10n.translation('newTab')],
    // ['newPrivateTab', l10n.translation('newPrivateTab')],
    // ['New Tor Tab', 'New Tor Tab'],
    // ['newSessionTab', l10n.translation('newSessionTab')],

    ['divider', null],

    ['splitLeft', l10n.translation('splitLeft')],
    ['splitRight', l10n.translation('splitRight')],
    ['splitTop', l10n.translation('splitTop')],
    ['splitBottom', l10n.translation('splitBottom')],

    ['divider', null],

    ['splitLeftTabsToLeft', l10n.translation('splitLeftTabsToLeft')],
    ['splitRightTabsToRight', l10n.translation('splitRightTabsToRight')],
    // ['floatingPanel', l10n.translation('floatingPanel')],

    ['divider', null],

    ['swapPosition', l10n.translation('swapPosition')],
    ['switchDirection', l10n.translation('switchDirection')],

    ['divider', null],

    ['alignHorizontal', l10n.translation('alignHorizontal')],
    ['alignVertical', l10n.translation('alignVertical')],

    ['divider', null],

    ['Arrange All Panel', 'Arrange All Panel'],
    ['Arrange Panel', 'Arrange Panel'],

    ['divider', null],

    ['clicktabCopyTabUrl',l10n.translation('clicktabCopyTabUrl').replace('&apos;',"'")],
    ['clicktabCopyUrlFromClipboard',l10n.translation('clicktabCopyUrlFromClipboard')],
    ['pasteAndOpen', l10n.translation('pasteAndOpen')],
    ['copyTabInfo', l10n.translation('copyTabInfo')],
    ['copyAllTabTitles', l10n.translation('copyAllTabTitles')],
    ['copyAllTabURLs', l10n.translation('copyAllTabURLs')],
    ['copyAllTabInfos', l10n.translation('copyAllTabInfos')],

    ['divider', null],

    ['reload', l10n.translation('reload')],
    ['cleanReload', l10n.translation('cleanReload')],
    ['clicktabReloadtabs', l10n.translation('clicktabReloadtabs')],
    ['clicktabReloadothertabs', l10n.translation('clicktabReloadothertabs')],
    ['clicktabReloadlefttabs', l10n.translation('clicktabReloadlefttabs')],
    ['clicktabReloadrighttabs', l10n.translation('clicktabReloadrighttabs')],
    ['maximizePanel', 'Maximize Panel'],
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

    ['closeThisTree', l10n.translation('closeThisTree')]
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
                <Menu.Item as='a' href='chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html' id='top-link' key="top" name="Top"/>
                <Menu.Item as='a' href='chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite.html' id='bookmark-link' key="favorite" name={l10n.translation('bookmarks')}/>
                <Menu.Item as='a' href='chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/history.html' id='history-link' key="history" name={l10n.translation('history')}/>
                <Menu.Item as='a' href={`${baseURL}/download.html`} key="download" name={l10n.translation('downloads')}/>
                <Menu.Item as='a' href={`${baseURL}/note.html`} key="note" name={l10n.translation('note')}/>
                <Menu.Item key="settings" name={l10n.translation('settings')} active={true}/>
                <Menu.Item as='a' href={`${baseURL}/explorer.html`} key="file-explorer" name={l10n.translation('fileExplorer')}/>
                <Menu.Item as='a' href={`${baseURL}/terminal.html`} key="terminal" name={l10n.translation('terminal')}/>
                <Menu.Item as='a' href={`${baseURL}/automation.html`} key="automation" name={l10n.translation('automation')}/>
                <Menu.Item as='a' href={`${baseURL}/converter.html`} key="converter" name={l10n.translation("videoConverter")}/>
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
      this.clearRange = {clearType: 'all', clearDays: 30, clearStart: this.today(-1),clearEnd:this.today()}
      this.imports = []
      this.exports = []
    }


    today(add=0){
      const now = new Date()
      return `${now.getFullYear()}-${("0"+(now.getMonth()+1+add)).slice(-2)}-${("0"+now.getDate()).slice(-2)}`
    }

    onChange(name,e,data){
      ipc.send('save-state',{tableName:'state',key:name,val:data.value || data.checked})
    }

    onChange2(name,e,data){
      if(data.checked)
        this.clear.push(name)
      else
        this.clear = this.clear.filter(x=> x !== name)
      this.setState({})
    }

    onChangeClear(name,e,data){
      this.clearRange[name] = data.value || data.checked
      this.setState({})
    }

    onChangeImport(name,e,data){
      if(data.checked)
        this.imports.push(name)
      else
        this.imports = this.imports.filter(x=> x !== name)
      this.setState({})
    }

    onChangeExport(name,e,data){
      if(data.checked)
        this.exports.push(name)
      else
        this.exports = this.exports.filter(x=> x !== name)
      this.setState({})
    }


    handleChangeRadio(clearType){
      ipc.send('save-state',{tableName:'state',key:'clearType',val:clearType})
      this.setState({clearType})
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
            <label>{l10n.translation('8870318296973696995')}</label>
            <Input onChange={this.onChange.bind(this,'myHomepage')} defaultValue={this.state.myHomepage}/>
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

          {/*<div className="field">*/}
            {/*<label>Adobe Flash Player</label>*/}
            {/*<Checkbox defaultChecked={this.state.enableFlash} toggle onChange={this.onChange.bind(this,'enableFlash')}/>*/}
            {/*<span className="toggle-label">{`${l10n.translation('enableFlash')} (${l10n.translation('requiresRestart').replace('* ','')})`}</span>*/}
          {/*</div>*/}
          {/*<br/>*/}

          {/*{isDarwin || isWin ? <div className="field">*/}
            {/*<label>Widevine</label>*/}
            {/*<Checkbox defaultChecked={this.state.enableWidevine} toggle onChange={this.onChange.bind(this,'enableWidevine')}/>*/}
            {/*<span className="toggle-label">{`${l10n.translation('enableFlash').replace('Adobe Flash','Widevine')} (${l10n.translation('requiresRestart').replace('* ','')})`}</span>*/}
          {/*</div> : null}*/}
          {/*{isDarwin || isWin ? <br/> : null}*/}


          {/*<div className="field">*/}
            {/*<label>{l10n.translation("protection")}</label>*/}
            {/*<Checkbox defaultChecked={this.state.httpsEverywhereEnable} toggle onChange={this.onChange.bind(this,'httpsEverywhereEnable')}/>*/}
            {/*<span className="toggle-label">{l10n.translation("enableHTTPSEverywhere")}</span>*/}
            {/*<br/>*/}

            {/*<Checkbox defaultChecked={this.state.trackingProtectionEnable} toggle onChange={this.onChange.bind(this,'trackingProtectionEnable')}/>*/}
            {/*<span className="toggle-label">{l10n.translation("enableTracingProtection")}</span>*/}
            {/*<br/>*/}

            {/*<Checkbox defaultChecked={this.state.noScript} toggle onChange={this.onChange.bind(this,'noScript')}/>*/}
            {/*<span className="toggle-label">{l10n.translation('noScriptPref')}</span>*/}
            {/*<br/>*/}

            {/*<Checkbox defaultChecked={this.state.blockCanvasFingerprinting} toggle onChange={this.onChange.bind(this,'blockCanvasFingerprinting')}/>*/}
            {/*<span className="toggle-label">{l10n.translation('blockCanvasFingerprinting')}</span>*/}
            {/*<br/>*/}
          {/*</div>*/}
          {/*<br/>*/}

          <div className="field">
            <label>{l10n.translation('autocompleteData')} ({l10n.translation('requiresRestart').replace('* ','')})</label>
          </div>

          <Grid>
            <Grid.Row>
              <Grid.Column width={3}><label>{l10n.translation("orderOfAutoComplete")}</label></Grid.Column>
              <Grid.Column width={8}><Dropdown onChange={this.onChange.bind(this,'orderOfAutoComplete')} selection
                                               options={[
                                                 {key:'suggestionToHistory',value:'suggestionToHistory',text: l10n.translation("suggestionHistory")},
                                                 {key:'historyToSuggestion',value:'historyToSuggestion',text: l10n.translation("historySuggestion")},
                                               ]}
                                               defaultValue={this.state.orderOfAutoComplete}/></Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={3}><label>{l10n.translation("numberOfSuggestions")}</label></Grid.Column>
              <Grid.Column width={8}><Dropdown onChange={this.onChange.bind(this,'numOfSuggestion')} selection
                                               options={concurrentDownloadOptions} defaultValue={this.state.numOfSuggestion}/></Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={3}><label>{l10n.translation("numberOfHistories")}</label></Grid.Column>
              <Grid.Column width={8}><Dropdown onChange={this.onChange.bind(this,'numOfHistory')} selection
                                               options={historySuggestionOptions} defaultValue={this.state.numOfHistory}/></Grid.Column>
            </Grid.Row>
          </Grid>

          <br/>
          <Checkbox defaultChecked={this.state.searchHistoryOrderCount} toggle onChange={this.onChange.bind(this,'searchHistoryOrderCount')}/>
          <span className="toggle-label">{l10n.translation("sortHistoryInDescendingOrderOfPV")}</span>
          <br/>


          <br/>

          <div className="field">
            <label>{l10n.translation('zoom')} ({l10n.translation('requiresRestart').replace('* ','')})</label>
            <Dropdown onChange={this.onChange.bind(this,'zoomBehavior')} selection options={zoomBehaviorOptions} defaultValue={this.state.zoomBehavior}/>
          </div>
          <br/>

          <div className="field">
            <label>{l10n.translation("defaultSidebarPosition")}</label>
            <Dropdown onChange={this.onChange.bind(this,'sideBarDirection')} selection options={sideBarDirectionOptions} defaultValue={this.state.sideBarDirection}/>
          </div>
          <br/>

          <div className="field">
            <label>{l10n.translation('openInNewTab')}  ({l10n.translation('requiresRestart').replace('* ','')})</label>
            <Checkbox defaultChecked={this.state.sidebarLink} toggle onChange={this.onChange.bind(this,'sidebarLink')}/>
            <span className="toggle-label">{l10n.translation("sideBarLink")}</span>
            <br/>

            <Checkbox defaultChecked={this.state.toolbarLink} toggle onChange={this.onChange.bind(this,'toolbarLink')}/>
            <span className="toggle-label">{l10n.translation("toolBarLink")}</span>
            <br/>

            <Checkbox defaultChecked={this.state.addressBarNewTab} toggle onChange={this.onChange.bind(this,'addressBarNewTab')}/>
            <span className="toggle-label">{l10n.translation("addressBarLink")}</span>
            <br/>

            <Checkbox defaultChecked={this.state.bookmarkbarLink} toggle onChange={this.onChange.bind(this,'bookmarkbarLink')}/>
            <span className="toggle-label">{l10n.translation("bookmarkBarLink")}</span>
            <br/>
          </div>
          <br/>


          <div className="field">
            <label>Input History</label>

            <Checkbox defaultChecked={this.state.inputHistory} toggle onChange={this.onChange.bind(this,'inputHistory')}/>
            <span className="toggle-label">Enable input history function</span>

            <div style={{height: 5}}/>

            <span>Maximum number of characters:&nbsp;</span>
            <Input onChange={this.onChange.bind(this,'inputHistoryMaxChar')} defaultValue={this.state.inputHistoryMaxChar}/>
          </div>
          <br/>


          <div className="field">
            <label>Special Behavior</label>
            <Checkbox defaultChecked={this.state.rectangularSelection} toggle onChange={this.onChange.bind(this,'rectangularSelection')}/>
            <span className="toggle-label">{l10n.translation("enableRectangularSelection")} </span>
            <br/>
            <Checkbox defaultChecked={this.state.extensionOnToolbar} toggle onChange={this.onChange.bind(this,'extensionOnToolbar')}/>
            <span className="toggle-label">{l10n.translation("showChromeExtensionIconOnToolbar")} ({l10n.translation('requiresRestart').replace('* ','')})</span>
            <br/>
            {/*{isDarwin ? null : <Checkbox defaultChecked={this.state.displayFullIcon} toggle onChange={this.onChange.bind(this,'displayFullIcon')}/>}*/}
            {/*{isDarwin ? null : <span className="toggle-label">{l10n.translation("showFullscreenButton")} ({l10n.translation('requiresRestart').replace('* ','')})</span>}*/}
            {/*{isDarwin ? null : <br/>}*/}
            <Checkbox defaultChecked={this.state.enableMouseGesture} toggle onChange={this.onChange.bind(this,'enableMouseGesture')}/>
            <span className="toggle-label">{l10n.translation("enableMouseGesture")} ({l10n.translation('requiresRestart').replace('* ','')})</span>
            <br/>
            {/*<Checkbox defaultChecked={this.state.fullscreenTransitionKeep} toggle onChange={this.onChange.bind(this,'fullscreenTransitionKeep')}/>*/}
            {/*<span className="toggle-label">{l10n.translation("maintainFullscreenModeEvenAfterPageTransition")}</span>*/}
            {/*<br/>*/}
            {/*<Checkbox defaultChecked={this.state.fullscreenTransition} toggle onChange={this.onChange.bind(this,'fullscreenTransition')}/>*/}
            {/*<span className="toggle-label">{l10n.translation("cancelFullscreenModeAtPageTransition")} ({l10n.translation('requiresRestart').replace('* ','')})</span>*/}
            {/*<br/>*/}
            <Checkbox defaultChecked={this.state.historyBadget} toggle onChange={this.onChange.bind(this,'historyBadget')}/>
            <span className="toggle-label">{l10n.translation("showBackForwardButtonSBadge")} ({l10n.translation('requiresRestart').replace('* ','')})</span>
            <br/>
            <Checkbox defaultChecked={this.state.focusLocationBar} toggle onChange={this.onChange.bind(this,'focusLocationBar')}/>
            <span className="toggle-label">{l10n.translation("showFocusLocationBarOfTopPage")} </span>
            <br/>
            <Checkbox defaultChecked={this.state.enableDownloadList} toggle onChange={this.onChange.bind(this,'enableDownloadList')}/>
            <span className="toggle-label">{l10n.translation("enableBottomDownloadList")} ({l10n.translation('requiresRestart').replace('* ','')})</span>
            <br/>
            <Checkbox defaultChecked={this.state.autoDeleteDownloadList} toggle onChange={this.onChange.bind(this,'autoDeleteDownloadList')}/>
            <span className="toggle-label">{l10n.translation("deleteFromDownloadListWhenDownloadIsCompleted")} ({l10n.translation('requiresRestart').replace('* ','')})</span>
            <br/>
            {/*<Checkbox defaultChecked={this.state.enableSmoothScrolling} toggle onChange={this.onChange.bind(this,'enableSmoothScrolling')}/>*/}
            {/*<span className="toggle-label">{l10n.translation("useSmoothScroll").replace("*","")} ({l10n.translation('requiresRestart').replace('* ','')})</span>*/}
            {/*<br/>*/}
            <Checkbox defaultChecked={this.state.showAddressBarFavicon} toggle onChange={this.onChange.bind(this,'showAddressBarFavicon')}/>
            <span className="toggle-label">Show the favicon at the left end of the address bar ({l10n.translation('requiresRestart').replace('* ','')})</span>
            <br/>
            <Checkbox defaultChecked={this.state.showAddressBarBookmarks} toggle onChange={this.onChange.bind(this,'showAddressBarBookmarks')}/>
            <span className="toggle-label">Show bookmark add icon on the right end of the address bar ({l10n.translation('requiresRestart').replace('* ','')})</span>
            <br/>
            <Checkbox defaultChecked={this.state.longPressMiddle} toggle onChange={this.onChange.bind(this,'longPressMiddle')}/>
            <span className="toggle-label">{l10n.translation("enableBehaviorChangeWhenLongPressOfMiddleMouseButton")} ({l10n.translation('requiresRestart').replace('* ','')})</span>
            <br/>
            <Checkbox defaultChecked={this.state.tripleClick} toggle onChange={this.onChange.bind(this,'tripleClick')}/>
            <span className="toggle-label">{l10n.translation("enableHorizontalPositionMoving")}</span>
            {/*<br/>*/}
            {/*<Checkbox defaultChecked={this.state.doubleShift} toggle onChange={this.onChange.bind(this,'doubleShift')}/>*/}
            {/*<span className="toggle-label">{l10n.translation("enableAnythingSearch")}  ({l10n.translation('requiresRestart').replace('* ','')})</span>*/}
          </div>
          <br/>

          {isWin || true ? <div className="field">
            <label>Enable Rocker Gestures</label>

            <div className="field">
              <label style={{fontWeight: 'initial', display: 'inline'}}>Right -> Left MouseDown &nbsp;</label>
              <Dropdown onChange={this.onChange.bind(this,'rockerGestureLeft')} selection
                        options={[{value: 'none', text: l10n.translation('clicktabNothing')},...Object.entries(keyMapping).filter(x=>!['keyMinimize','keyLastTab','keyFindNext','keyFindPrevious','keyTab1','keyTab2','keyTab3','keyTab4','keyTab5','keyTab6','keyTab7','keyTab8'].includes(x[0])).map(x=>({value:x[1],text:x[1]}))]} defaultValue={this.state.rockerGestureLeft}/>
            </div>
            <div className="field">
              <label style={{fontWeight: 'initial', display: 'inline'}}>Left -> Right MouseDown &nbsp;</label>
              <Dropdown onChange={this.onChange.bind(this,'rockerGestureRight')} selection
                        options={[{value: 'none', text: l10n.translation('clicktabNothing')},...Object.entries(keyMapping).filter(x=>!['keyMinimize','keyLastTab','keyFindNext','keyFindPrevious','keyTab1','keyTab2','keyTab3','keyTab4','keyTab5','keyTab6','keyTab7','keyTab8'].includes(x[0])).map(x=>({value:x[1],text:x[1]}))]} defaultValue={this.state.rockerGestureRight}/>
            </div>
          </div> : null}
          <br/>

          <div className="field">
            <label>{l10n.translation("sendURLToExternalMediaPlayer")}</label>
            <Dropdown onChange={this.onChange.bind(this,'sendToVideo')} selection options={sendToVideoOptions} defaultValue={this.state.sendToVideo}/>
          </div>
          <br/>

          <div className="field">
            <label>{l10n.translation("concurrentDownload")}</label>
            <Dropdown onChange={this.onChange.bind(this,'concurrentDownload')} selection options={concurrentDownloadOptions} defaultValue={this.state.concurrentDownload}/>
          </div>
          <br/>

          <div className="field">
            <label>{l10n.translation("maxNumberOfConnectionsPerItem")}</label>
            <Dropdown onChange={this.onChange.bind(this,'downloadNum')} selection options={downloadNumOptions} defaultValue={parseInt(this.state.downloadNum)}/>
          </div>
          <br/>

          <div className="field">
            <label>{l10n.translation("customWindowIcon")}({l10n.translation('requiresRestart').replace('* ','')})</label>
            <Input ref="iconSet" style={{width: 400}} onChange={this.onChange.bind(this,'windowCustomIcon')} defaultValue={this.state.windowCustomIcon}/>
            <Button icon='folder' onClick={_=>{
              const key = Math.random().toString()
              ipc.send('show-dialog-exploler',key,{defaultPath: this.state.windowCustomIcon, needIcon: true})
              ipc.once(`show-dialog-exploler-reply_${key}`,(event,ret)=>{
                if(!ret) return
                this.refs.iconSet.inputRef.value = ret
                this.onChange('windowCustomIcon',{},{value:ret})
              })
            }}/>
          </div>

          <div className="field">
            <label>{l10n.translation("syncScrollMargin")}({l10n.translation('requiresRestart').replace('* ','')})</label>
            <Dropdown onChange={this.onChange.bind(this,'syncScrollMargin')} selection options={syncScrollMarginOptions} defaultValue={this.state.syncScrollMargin}/>
          </div>
          <br/>

          <div className="field">
            <label>{l10n.translation("bindWindowFrameMargin")}</label>
            <Input onChange={this.onChange.bind(this,'bindMarginFrame')} defaultValue={this.state.bindMarginFrame}/>
            <label>{l10n.translation("bindWindowTitleMargin")}</label>
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


  class DataSetting extends React.Component {
    constructor(props) {
      super(props)
      this.state = generalDefault
      this.clear = []
      this.clearRange = {clearType: 'all', clearDays: 30, clearStart: this.today(-1),clearEnd:this.today()}
      this.imports = []
      this.exports = []
    }


    today(add=0){
      const now = new Date()
      return `${now.getFullYear()}-${("0"+(now.getMonth()+1+add)).slice(-2)}-${("0"+now.getDate()).slice(-2)}`
    }

    onChange(name,e,data){
      ipc.send('save-state',{tableName:'state',key:name,val:data.value || data.checked})
    }

    onChange2(name,e,data){
      if(data.checked)
        this.clear.push(name)
      else
        this.clear = this.clear.filter(x=> x !== name)
      this.setState({})
    }

    onChangeClear(name,e,data){
      this.clearRange[name] = data.value || data.checked
      this.setState({})
    }

    onChangeImport(name,e,data){
      if(data.checked)
        this.imports.push(name)
      else
        this.imports = this.imports.filter(x=> x !== name)
      this.setState({})
    }

    onChangeExport(name,e,data){
      if(data.checked)
        this.exports.push(name)
      else
        this.exports = this.exports.filter(x=> x !== name)
      this.setState({})
    }


    handleChangeRadio(clearType){
      ipc.send('save-state',{tableName:'state',key:'clearType',val:clearType})
      this.setState({clearType})
    }

    render() {
      console.log(this.state.startsWith,this.state.myHomepage)
      return <div>
        <h3>{l10n.translation('data')}</h3>
        <Divider/>
        <div className="ui form">
          <div className="field">
            <label>{l10n.translation('ssInterval')}&nbsp;({l10n.translation('secondsLabel')})</label>
            <Input onChange={this.onChange.bind(this,'autoSaveInterval')} defaultValue={this.state.autoSaveInterval}/>
          </div>
          <br/>

          <div className="field">
            <label>{l10n.translation('importBrowserData').replace('…','')} ({l10n.translation('requiresRestart').replace('* ','')})</label>
            <Button primary content={l10n.translation('import')} onClick={_=>ipc.send('open-page','chrome://settings/importData')}/>
          </div>
          <br/>

          <div className="field">
            <label>{l10n.translation('exportBookmarks').replace('…','')}</label>
            <Button primary content={l10n.translation('42126664696688958')} onClick={_=>ipc.send("export-bookmark",{})}/>
          </div>
          <br/>
          <br/>


          <Grid>
            <Grid.Row>
              <Grid.Column width={6}>
                <div className="field">
                  <label>{l10n.translation('settingsImport').replace('…','')}</label>

                  <Checkbox toggle onChange={this.onChangeImport.bind(this,'generalSettings')}/>
                  <span className="toggle-label">{l10n.translation('generalSettings')}</span>
                  <br/>
                  {/*<Checkbox toggle onChange={this.onChangeImport.bind(this,'bookmarks')}/>*/}
                  {/*<span className="toggle-label">{l10n.translation('bookmarks')}</span>*/}
                  {/*<br/>*/}
                  <Checkbox toggle onChange={this.onChangeImport.bind(this,'browsingHistory')}/>
                  <span className="toggle-label">{l10n.translation('browsingHistory')}</span>
                  <br/>
                  <Checkbox toggle onChange={this.onChangeImport.bind(this,'sessionTools')}/>
                  <span className="toggle-label">{l10n.translation('sessionTools')}</span>
                  <br/>
                  <Checkbox toggle onChange={this.onChangeImport.bind(this,'favicons')}/>
                  <span className="toggle-label">{l10n.translation('favicon')}</span>
                  <br/>
                  <Checkbox toggle onChange={this.onChangeImport.bind(this,'downloadHistory')}/>
                  <span className="toggle-label">{l10n.translation('downloadHistory')}</span>
                  <br/>
                  <Checkbox toggle onChange={this.onChangeImport.bind(this,'automation')}/>
                  <span className="toggle-label">{l10n.translation('automation')}</span>
                  <br/>
                  <Checkbox toggle onChange={this.onChangeImport.bind(this,'note')}/>
                  <span className="toggle-label">{l10n.translation('note')}</span>
                  <br/>
                  <Checkbox toggle onChange={this.onChangeImport.bind(this,'password')}/>
                  <span className="toggle-label">{l10n.translation('passwordsPassword')}</span>
                  <br/>

                  <Button style={{maxWidth: 240}} disabled={!this.imports.length} primary  onClick={_=>ipc.send("import-setting",this.imports,true)}>
                    {l10n.translation('import')} <br/>
                    <span style={{fontSize: 12}}>*{l10n.translation('deleteAllDataAndImportRestoreData')}</span>
                  </Button>
                  <br/>
                  <br/>
                  <Button style={{maxWidth: 240}} disabled={!this.imports.length} primary onClick={_=>ipc.send("import-setting",this.imports,false)}>
                    Incremental Import <br/>
                    <span style={{fontSize: 12}}>*Overwrite restored data with current data (compare update dates)</span>
                  </Button>
                </div>
              </Grid.Column>
              <Grid.Column width={6} style={{marginTop: 0}}>
                <div className="field">
                  <label>{l10n.translation('settingsExport').replace('…','')}</label>

                  <Checkbox toggle onChange={this.onChangeExport.bind(this,'generalSettings')}/>
                  <span className="toggle-label">{l10n.translation('generalSettings')}</span>
                  <br/>
                  {/*<Checkbox toggle onChange={this.onChangeExport.bind(this,'bookmarks')}/>*/}
                  {/*<span className="toggle-label">{l10n.translation('bookmarks')}</span>*/}
                  {/*<br/>*/}
                  <Checkbox toggle onChange={this.onChangeExport.bind(this,'browsingHistory')}/>
                  <span className="toggle-label">{l10n.translation('browsingHistory')}</span>
                  <br/>
                  <Checkbox toggle onChange={this.onChangeExport.bind(this,'sessionTools')}/>
                  <span className="toggle-label">{l10n.translation('sessionTools')}</span>
                  <br/>
                  <Checkbox toggle onChange={this.onChangeExport.bind(this,'favicons')}/>
                  <span className="toggle-label">{l10n.translation('favicon')}</span>
                  <br/>
                  <Checkbox toggle onChange={this.onChangeExport.bind(this,'downloadHistory')}/>
                  <span className="toggle-label">{l10n.translation('downloadHistory')}</span>
                  <br/>
                  <Checkbox toggle onChange={this.onChangeExport.bind(this,'automation')}/>
                  <span className="toggle-label">{l10n.translation('automation')}</span>
                  <br/>
                  <Checkbox toggle onChange={this.onChangeExport.bind(this,'note')}/>
                  <span className="toggle-label">{l10n.translation('note')}</span>
                  <br/>
                  <Checkbox toggle onChange={this.onChangeExport.bind(this,'password')}/>
                  <span className="toggle-label">{l10n.translation('passwordsPassword')}</span>
                  <br/>

                  <Button disabled={!this.exports.length} primary content={l10n.translation('42126664696688958')} onClick={_=>ipc.send("export-setting",this.exports)}/>
                </div>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <br/>
          <br/>
          <br/>


          <div className="field">
            <label>{l10n.translation('8026334261755873520')}</label>
            <div className="panel-column">
              <div className="field">
                <div className="ui radio checkbox" onClick={e=>this.onChangeClear('clearType',e,{value: 'all'})}>
                  <input type="radio" className="hidden" readOnly tabIndex={0} value="all" checked={this.clearRange.clearType == 'all'}/>
                  <label className="right-pad">{l10n.translation("allData")}</label>
                </div>
                <br/>

                <div className="ui radio checkbox" onClick={e=>this.onChangeClear('clearType',e,{value: 'before'})}>
                  <input type="radio" className="hidden" readOnly tabIndex={0} value="before" checked={this.clearRange.clearType == 'before'}/>
                  <label className="right-pad">{l10n.translation('clearDataGreaterThan30DaysAgoFromNow').split("30")[0]}</label>
                  <div className="ui input date" style={{paddingBottom: 8, paddingTop: 10}}>
                    <input type="text" onChange={e=>this.onChangeClear('clearDays',e,e.target)} defaultValue={this.clearRange.clearDays}/>
                  </div>
                  <span style={{paddingLeft: 4}}>{l10n.translation('clearDataGreaterThan30DaysAgoFromNow').split("30")[1]}</span>
                </div>
                <br/>

                <div className="ui radio checkbox" onClick={e=>this.onChangeClear('clearType',e,{value: 'range'})}>
                  <input type="radio" className="hidden" readOnly tabIndex={0} value="range" checked={this.clearRange.clearType == 'range'}/>
                  <label className="right-pad">{l10n.translation("range")}</label>

                  <div className="ui input date">
                    <input type="date" onChange={e=>this.onChangeClear('clearStart',e,e.target)} defaultValue={this.clearRange.clearStart}/>
                  </div>
                  &nbsp;〜&nbsp;
                  <div className="ui input date">
                    <input type="date" onChange={e=>this.onChangeClear('clearEnd',e,e.target)} defaultValue={this.clearRange.clearEnd}/>
                  </div>
                </div>
              </div>
            </div>
            <Checkbox toggle onChange={this.onChange2.bind(this,'clearGeneralSettings')}/>
            <span className="toggle-label">{l10n.translation('generalSettings')}&nbsp;({l10n.translation('clearAllData')})</span>
            <br/>
            <Checkbox toggle onChange={this.onChange2.bind(this,'clearFavorite')}/>
            <span className="toggle-label">{l10n.translation("bookmarksUserSavedSessions")}</span>
            <br/>
            <Checkbox toggle onChange={this.onChange2.bind(this,'clearHistory')}/>
            <span className="toggle-label">{l10n.translation('browsingHistory')}</span>
            <br/>
            <Checkbox toggle onChange={this.onChange2.bind(this,'clearSessionManager')}/>
            <span className="toggle-label">{l10n.translation('sessionTools')}</span>
            <br/>
            <Checkbox toggle onChange={this.onChange2.bind(this,'clearFavicon')}/>
            <span className="toggle-label">{l10n.translation('favicon')}</span>
            <br/>
            <Checkbox toggle onChange={this.onChange2.bind(this,'clearDownload')}/>
            <span className="toggle-label">{l10n.translation('downloadHistory')}</span>
            <br/>
            <Checkbox toggle onChange={this.onChange2.bind(this,'clearAutomation')}/>
            <span className="toggle-label">{l10n.translation('automation')}</span>
            <br/>
            <Checkbox toggle onChange={this.onChange2.bind(this,'clearNote')}/>
            <span className="toggle-label">{l10n.translation('note')}</span>
            <br/>
            <Checkbox toggle onChange={this.onChange2.bind(this,'clearCache')}/>
            <span className="toggle-label">{l10n.translation('cachedImagesAndFiles')}&nbsp;({l10n.translation('clearAllData')})</span>
            <br/>
            <Checkbox toggle onChange={this.onChange2.bind(this,'clearStorageData')}/>
            <span className="toggle-label">{l10n.translation('allSiteCookies')}&nbsp;({l10n.translation('clearAllData')})</span>
            <br/>
            <Checkbox toggle onChange={this.onChange2.bind(this,'clearAutocompleteData')}/>
            <span className="toggle-label">{l10n.translation('autocompleteData')}&nbsp;({l10n.translation('clearAllData')})</span>
            <br/>
            <Checkbox toggle onChange={this.onChange2.bind(this,'clearAutofillData')}/>
            <span className="toggle-label">{l10n.translation('autofillData')}&nbsp;({l10n.translation('clearAllData')})</span>
            <br/>
            <Checkbox toggle onChange={this.onChange2.bind(this,'clearPassword')}/>
            <span className="toggle-label">{l10n.translation('1375321115329958930')}&nbsp;({l10n.translation('clearAllData')})</span>
            <br/>
            <Button disabled={!this.clear.length} primary content={l10n.translation('clearBrowsingDataNow')} onClick={_=>ipc.send("clear-browsing-data",this.clear,this.clearRange)}/>
          </div>
          <br/>

          <div className="field">
            <label>{l10n.translation('privateDataMessage').replace("Brave","Sushi Browser")}</label>
            <div className="panel-column">
              <div className="field">
                <div className="ui radio checkbox" onClick={e=>this.handleChangeRadio('all')}>
                  <input type="radio" className="hidden" readOnly tabIndex={0} value="all" checked={this.state.clearType == 'all'}/>
                  <label className="right-pad">{l10n.translation("allData")}</label>
                </div>
                <br/>

                <div className="ui radio checkbox" onClick={e=>this.handleChangeRadio('before')}>
                  <input type="radio" className="hidden" readOnly tabIndex={0} value="before" checked={this.state.clearType == 'before'}/>
                  <label className="right-pad">{l10n.translation('clearDataGreaterThan30DaysAgoFromNow').split("30")[0]}</label>
                  <div className="ui input date" style={{paddingBottom: 8, paddingTop: 10}}>
                    <input type="text" onChange={e=>this.onChange('clearDays',e,e.target)} defaultValue={this.state.clearDays}/>
                  </div>
                  <span style={{paddingLeft: 4}}>{l10n.translation('clearDataGreaterThan30DaysAgoFromNow').split("30")[1]}</span>
                </div>
                <br/>

              </div>
            </div>

            <Checkbox toggle onChange={this.onChange.bind(this,'clearGeneralSettingsOnClose')} defaultChecked={this.state.clearGeneralSettingsOnClose}/>
            <span className="toggle-label">{l10n.translation('generalSettings')}&nbsp;({l10n.translation('clearAllData')})</span>
            <br/>
            <Checkbox toggle onChange={this.onChange.bind(this,'clearFavoriteOnClose')} defaultChecked={this.state.clearFavoriteOnClose}/>
            <span className="toggle-label">{l10n.translation("bookmarksUserSavedSessions")}</span>
            <br/>
            <Checkbox toggle onChange={this.onChange.bind(this,'clearHistoryOnClose')} defaultChecked={this.state.clearHistoryOnClose}/>
            <span className="toggle-label">{l10n.translation('browsingHistory')}</span>
            <br/>
            <Checkbox toggle onChange={this.onChange.bind(this,'clearSessionManagerOnClose')} defaultChecked={this.state.clearSessionManagerOnClose}/>
            <span className="toggle-label">{l10n.translation('sessionTools')}</span>
            <br/>
            <Checkbox toggle onChange={this.onChange.bind(this,'clearFaviconOnClose')} defaultChecked={this.state.clearFaviconOnClose}/>
            <span className="toggle-label">{l10n.translation('favicon')}</span>
            <br/>
            <Checkbox toggle onChange={this.onChange.bind(this,'clearDownloadOnClose')} defaultChecked={this.state.clearDownloadOnClose}/>
            <span className="toggle-label">{l10n.translation('downloadHistory')}</span>
            <br/>
            <Checkbox toggle onChange={this.onChange.bind(this,'clearAutomationOnClose')} defaultChecked={this.state.clearAutomationOnClose}/>
            <span className="toggle-label">{l10n.translation('automation')}</span>
            <br/>
            <Checkbox toggle onChange={this.onChange.bind(this,'clearNoteOnClose')} defaultChecked={this.state.clearNoteOnClose}/>
            <span className="toggle-label">{l10n.translation('note')}</span>
            <br/>
            <Checkbox toggle onChange={this.onChange.bind(this,'clearCacheOnClose')} defaultChecked={this.state.clearCacheOnClose}/>
            <span className="toggle-label">{l10n.translation('cachedImagesAndFiles')}&nbsp;({l10n.translation('clearAllData')})</span>
            <br/>
            <Checkbox toggle onChange={this.onChange.bind(this,'clearStorageDataOnClose')} defaultChecked={this.state.clearStorageDataOnClose}/>
            <span className="toggle-label">{l10n.translation('allSiteCookies')}&nbsp;({l10n.translation('clearAllData')})</span>
            <br/>
            <Checkbox toggle onChange={this.onChange.bind(this,'clearAutocompleteDataOnClose')} defaultChecked={this.state.clearAutocompleteDataOnClose}/>
            <span className="toggle-label">{l10n.translation('autocompleteData')}&nbsp;({l10n.translation('clearAllData')})</span>
            <br/>
            <Checkbox toggle onChange={this.onChange.bind(this,'clearAutofillDataOnClose')} defaultChecked={this.state.clearAutofillDataOnClose}/>
            <span className="toggle-label">{l10n.translation('autofillData')}&nbsp;({l10n.translation('clearAllData')})</span>
            <br/>
            <Checkbox toggle onChange={this.onChange.bind(this,'clearPasswordOnClose')} defaultChecked={this.state.clearPasswordOnClose}/>
            <span className="toggle-label">{l10n.translation('1375321115329958930')}&nbsp;({l10n.translation('clearAllData')})</span>
            <br/>
          </div>
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
      this.deleteSite = ::this.deleteSite
    }

    onChange(name,e,data){
      ipc.send('save-state',{tableName:'state',key:name,val:data.value || data.checked})
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
      if(name == "name" && this.state.searchProviders.find(x=>x.ind==i)[name] == this.state.default){
        ipc.send('save-state',{tableName:'state',key:'searchEngine',val})
      }
      this.state.searchProviders.find(x=>x.ind==i)[name] = val
      ipc.send('save-state',{tableName:'searchEngine',val:this.state.searchProviders})
    }

    onBlur(e){
      this.emitChange(e)
      this.setState({})
    }

    typeChange(i,e,data){
      console.log(i,e,data)
      this.state.searchProviders.find(x=>x.ind==i).type = data.value
      ipc.send('save-state',{tableName:'searchEngine',val:this.state.searchProviders})
      this.setState({})
    }

    multipleChange(i,e,data){
      console.log(i,e,data)
      this.state.searchProviders.find(x=>x.ind==i).multiple = data.value
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
        <td key={`delete${i}`} style={{fontSize: 20, textAlign: 'center'}}>
          <a href="javascript:void(0)" onClick={_=>this.deleteSite(i)}> <i aria-hidden="true" className="trash icon"></i></a>
        </td>
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
                      { key: 'basic', text: l10n.translation("openInAPanel"), value: 'basic' },
                      { key: 'two', text: l10n.translation("openIn2Panels"), value: 'two' },
                      { key: 'new-win', text: l10n.translation("openInANewWindow"), value: 'new-win' },
                      { key: 'one-row', text: l10n.translation("openInANewWindowWithARow"), value: 'one-row' },
                      { key: 'two-row', text: l10n.translation("openInNewWindowWith2Rows"), value: 'two-row' },
                      { key: 'three-row', text: l10n.translation("openInANewWindowWith3Rows"), value: 'three-row' },
                    ]} defaultValue={type}/>
        </td>
        <td key={`shortcut${i}`} data-num={i} data-name='shortcut' onInput={this.emitChange} onBlur={this.onBlur} contentEditable>{alias}</td>
        <td key={`delete${i}`} style={{fontSize: 20, textAlign: 'center'}}>
          <a href="javascript:void(0)" onClick={_=>this.deleteSite(i)}> <i aria-hidden="true" className="trash icon"></i></a>
        </td>
      </tr>
    }

    addSite(multiple){
      const max = Math.max(...this.state.searchProviders.map(x=>x.ind))+1
      const newRecord = {name:`name${max}`,search: multiple ? "" : `url${max}`,shortcut:`s${max}`, ind:max,updated_at:Date.now()}
      if(multiple){
        newRecord.multiple = []
        newRecord.type = 'one-row'
      }
      this.state.searchProviders.push(newRecord)
      this.setState({})
    }

    deleteSite(i){
      const ind = this.state.searchProviders.findIndex(x=>x.ind == i)
      this.state.searchProviders.splice(ind,1)
      ipc.send('save-state',{tableName:'searchEngine',val:this.state.searchProviders})
      this.setState({})
    }

    render() {
      const {ret,optionsAll} = this.buildMultiSearchColumns()

      return <div>
        <h3>{l10n.translation("rightClickMenuSearchEngines")}</h3>
        <Divider/>
        <Dropdown fluid multiple search selection onChange={::this.contextMenuSearchEngineChange} options={optionsAll} defaultValue={this.state.contextMenuSearchEngines}/>

        <br/>
        <div className="field">
          <label>{l10n.translation("searchMethods")}&nbsp;</label>
          <Dropdown onChange={this.onChange.bind(this,'searchEngineDisplayType')} selection options={[
            {value:'co' , text: l10n.translation("currentAndOpposite")},
            {value:'c' , text: l10n.translation("current")},
            {value:'o' , text: l10n.translation("opposite")},
          ]} defaultValue={this.state.searchEngineDisplayType}/>
        </div>

        <h3>{l10n.translation("multiSearch")}</h3>
        <table className="ui celled compact table">
          <thead>
          <tr>
            <th>{l10n.translation('default')}</th>
            <th>{l10n.translation('name')}</th>
            <th>{l10n.translation('searchEngines')}</th>
            <th>{l10n.translation('2448312741937722512')}</th>
            <th>{l10n.translation('engineGoKey')}</th>
            <th>{l10n.translation('delete')}</th>
          </tr>
          </thead>
          <tbody>
          {ret}
          </tbody>
          <tfoot className="full-width">
          <tr>
            <th>
            </th>
            <th colspan="5">
              <button className="ui small icon primary button" onClick={_=>this.addSite(true)}>{l10n.translation("addSearchEngine")}</button>
            </th>
          </tr>
          </tfoot>
        </table>


        <h3>{l10n.translation('searchEngine')}</h3>
        <table className="ui celled compact table">
          <thead>
          <tr>
            <th>{l10n.translation('default')}</th>
            <th>{l10n.translation('name')}</th>
            <th>Search URL</th>
            <th>{l10n.translation('engineGoKey')}</th>
            <th>{l10n.translation('delete')}</th>
          </tr>
          </thead>
          <tbody>
          {this.buildSearchEngineColumns()}
          </tbody>
          <tfoot className="full-width">
          <tr>
            <th>
            </th>
            <th colspan="5">
              <button className="ui small icon primary button" onClick={_=>this.addSite()}>{l10n.translation("addSearchEngine")}</button>
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
      this.mouseOptions = this.makeOptions(['clicktabNothing','newTab','splitLeft','splitRight','splitTop','splitBottom','splitLeftTabsToLeft','splitRightTabsToRight',
        'floatingPanel','swapPosition','switchDirection','alignHorizontal','alignVertical','clicktabCopyTabUrl',
        'clicktabCopyUrlFromClipboard','pasteAndOpen','copyTabInfo','copyAllTabTitles','copyAllTabURLs','copyAllTabInfos','reload','cleanReload', 'maximizePanel',
        'clicktabReloadtabs','clicktabReloadothertabs','clicktabReloadlefttabs','clicktabReloadrighttabs','3007771295016901659','unpinTab','unmuteTab',
        'freezeTabMenuLabel','protectTabMenuLabel','lockTabMenuLabel','closeTab','closeOtherTabs','closeTabsToLeft','closeTabsToRight','closeAllTabsMenuLabel',
        'reopenLastClosedTab','clicktabUcatab','bookmarkPage','5078638979202084724'])
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
        text: (trans && !key.includes(' ')) && !l10n.translation(key).startsWith('[') ? l10n.translation(key) : tabContextMenus.find(t=>t[0] == key)[1]
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

    handleChangeTabPreviewQuality(e){
      const val = parseInt(e.target.value)
      this.setState({tabPreviewQuality: val })
      ipc.send('save-state',{tableName:'state',key:'tabPreviewQuality',val})
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
                                             options={[{key: 'nearlyChrome', value: 'nearlyChrome', text: l10n.translation("almostTheSameAsChrome")},
                                               ...this.makeOptions(['focusTabLeftTab','focusTabRightTab','focusTabLastSelectedTab','focusTabOpenerTab','focusTabOpenerTabRtl','focusTabLastOpenedTab','focusTabFirstTab','focusTabLastTab'])]}
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

        {/*<div className='spacer2'/>*/}

        {/*<div className="field">*/}
          {/*<label>{l10n.translation("tabBarTopMargin")}:&nbsp;</label>*/}
          {/*<Input onChange={this.onChange.bind(this,'tabBarMarginTop')} defaultValue={this.state.tabBarMarginTop}/>*/}
          {/*<label>px</label>*/}
        {/*</div>*/}

        {/*<div className='spacer2'/>*/}

        {/*<div className="field">*/}
          {/*<Checkbox defaultChecked={this.state.removeTabBarMarginTop} toggle onChange={this.onChange.bind(this,'removeTabBarMarginTop')}/>*/}
          {/*<span className="toggle-label">{l10n.translation("removeTopMarginWhenMaximizing")}</span>*/}
        {/*</div>*/}

        <Divider/>

        <h4 style={{marginTop:0, marginBottom: 20}}>{l10n.translation('newTab')}</h4>

        <div className="field">
          <Checkbox defaultChecked={this.state.openTabNextLabel} toggle onChange={this.onChange.bind(this,'openTabNextLabel')}/>
          <span className="toggle-label">{l10n.translation('openTabNextLabel')}</span>
        </div>


        <div className='spacer2'/>

        <Grid>
          <Grid.Row>
            <Grid.Column width={6}><label style={{paddingLeft: 60}}>{l10n.translation("openNewTabsAt")}</label></Grid.Column>
            <Grid.Column width={5}><Dropdown onChange={this.onChange.bind(this,'openTabPosition')} selection
                                             options={[{value: 'default',text: l10n.translation("defaultPosition")},{value: 'left',text: l10n.translation("leftEnd")},{value: 'right',text: l10n.translation("rightEnd")}]}
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
          <span className="toggle-label">{l10n.translation("openNewTabInBackground")}</span>
        </div>

        <div className='spacer'/>

        <div className="field">
          <Checkbox defaultChecked={this.state.oppositeGlobal} toggle onChange={this.onChange.bind(this,'oppositeGlobal')}/>
          <span className="toggle-label">{l10n.translation("oppositeMode")}</span>
        </div>

        <Divider/>
        <h4 style={{marginTop:0, marginBottom: 20}}>{l10n.translation("tabPreview")}</h4>

        <div className="field">
          <Checkbox defaultChecked={this.state.tabPreview} toggle onChange={this.onChange.bind(this,'tabPreview')}/>
          <span className="toggle-label">Enable Tab Preview</span>
        </div>

        <div className='spacer2'/>

        <div className="field">
          <label>{l10n.translation("delayTime")}&nbsp;</label>
          <Input onChange={this.onChange.bind(this,'tabPreviewWait')} defaultValue={this.state.tabPreviewWait}/>
          <label>&nbsp;{l10n.translation('millisecondsLabel')}</label>
        </div>

        <div className='spacer2'/>

        <div className="field">
          <label>{l10n.translation('width')}&nbsp;</label>
          <Input onChange={this.onChange.bind(this,'tabPreviewSizeWidth')} defaultValue={this.state.tabPreviewSizeWidth}/>
          <label>&nbsp;{l10n.translation('height')}&nbsp;</label>
          <Input onChange={this.onChange.bind(this,'tabPreviewSizeHeight')} defaultValue={this.state.tabPreviewSizeHeight}/>
        </div>
        <div className='spacer2'/>

        <div className="field">
          <label>{l10n.translation("slideHeight")}&nbsp;</label>
          <Input onChange={this.onChange.bind(this,'tabPreviewSlideHeight')} defaultValue={this.state.tabPreviewSlideHeight}/>
        </div>

        <div className='spacer2'/>

        <label style={{verticalAlign: '7px', paddingRight: 10}}>{l10n.translation("tabPreviewImageQuality")}</label>
        <div className="ui input">
          <input style={{padding: '.2em 0'}} type="range" min="0" max="100" name="imageQuality" step="1" value={this.state.tabPreviewQuality} onInput={e=>this.handleChangeTabPreviewQuality(e)}/>
        </div>
        <label style={{verticalAlign: '7px', paddingLeft: 10}}>{this.state.tabPreviewQuality}</label>

        {/*<div className='spacer2'/>*/}

        {/*<div className="field">*/}
          {/*<Checkbox defaultChecked={this.state.tabPreviewRecent} toggle onChange={this.onChange.bind(this,'tabPreviewRecent')}/>*/}
          {/*<span className="toggle-label">{l10n.translation("displayCurrentPreview")}</span>*/}
        {/*</div>*/}


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

        <div className='spacer2'/>

        <div className="field">
          <Checkbox defaultChecked={this.state.tabCirculateSelection} toggle onChange={this.onChange.bind(this,'tabCirculateSelection')}/>
          <span className="toggle-label">{l10n.translation("circulateTabSelection")}</span>
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
            <Grid.Column width={3}><label>{l10n.translation("rightClick")}</label></Grid.Column>
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
          <span style={{verticalAlign: 'baseline',paddingLeft:60}} className="toggle-label">{l10n.translation("dashedLineWhenDragging")}&nbsp;&nbsp;</span>
          <Input ref='colorTabDot' onChange={this.onChange.bind(this,'colorTabDot')} defaultValue={this.state.colorTabDot}/>
        </div>

        <div className='spacer2'/>

        <div className="field">
          <span style={{verticalAlign: 'baseline',paddingLeft:60}} className="toggle-label">{l10n.translation("colorOfMutePinReloadIcon")}&nbsp;&nbsp;</span>
          <Input ref='colorTabMode' onChange={this.onChange.bind(this,'colorTabMode')} defaultValue={this.state.colorTabMode}/>
        </div>

        <div className='spacer2'/>

        <div className="field">
          <Checkbox ref='showBorderActiveTab' style={{verticalAlign: 'middle'}} defaultChecked={this.state.showBorderActiveTab} toggle onChange={this.onChange.bind(this,'showBorderActiveTab')}/>
          <span style={{verticalAlign: 'baseline'}} className="toggle-label">{l10n.translation("showBottomBorderInCurrentTab")}</span>
        </div>


        <div className='spacer2'/>

        <div className="field">
          <Button primary content={l10n.translation("defaultTheme")} onClick={_=>this.changeTheme('default')}/>
          <Button primary content={l10n.translation("darkTheme")} onClick={_=>this.changeTheme('dark')}/>
        </div>

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
        <p><a target="_blank" href="https://github.com/electron/electron/blob/master/docs/api/accelerator.md">{l10n.translation('pleaseReferHereForInputMethodOfShortcut')}</a></p>
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
      this.emitChange2 = ::this.emitChange2
      this.onBlur2 = ::this.onBlur2
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

    typeChange(i,e,data){
      console.log(i,e,data)
      this.state.sendUrlContextMenus.find(x=>x.ind==i).type = data.value
      ipc.send('save-state',{tableName:'state',key:'sendUrlContextMenus',val:this.state.sendUrlContextMenus})
      this.setState({})
    }

    changeCheck(e,i,data){
      const val = data.checked
      this.state.sendUrlContextMenus.find(x=>x.ind==i).enable = val
      ipc.send('save-state',{tableName:'state',key:'sendUrlContextMenus',val:this.state.sendUrlContextMenus})
      this.setState({})
    }

    emitChange2(e){
      const name = e.target.dataset.name
      const i = parseInt(e.target.dataset.num)
      const val = e.target.innerText
      this.state.sendUrlContextMenus.find(x=>x.ind==i)[name] = val
      ipc.send('save-state',{tableName:'state',key:'sendUrlContextMenus',val:this.state.sendUrlContextMenus})
    }

    onBlur2(e){
      this.emitChange2(e)
      this.setState({})
    }

    buildSendToColumns(){
      const ret = []
      for(let values of this.state.sendUrlContextMenus){
        const i = values.ind
        const col = <tr key={`tr${i}`}>
          <td key={`enable${i}`}>
            <Checkbox checked={values.enable} toggle onChange={(e,data)=>this.changeCheck(e,i,data)}/>
          </td>
          <td key={`name${i}`} data-num={i} data-name='name' onInput={this.emitChange2} onBlur={this.onBlur2} contentEditable>{values.name}</td>
          <td key={`type${i}`}>
            <Dropdown placeholder='State' fluid selection className="type" onChange={this.typeChange.bind(this,i)}
                      options={[
                        { text: 'New Tab', value: 'new' },
                        { text: 'New Opposite Tab', value: 'opposite' },
                        { text: 'Command', value: 'command' },
                        { text: 'Command in Terminal', value: 'terminal' },
                      ]} defaultValue={values.type}/>
          </td>
          <td key={`sendTo${i}`} data-num={i} data-name='sendTo' onInput={this.emitChange2} onBlur={this.onBlur2} contentEditable>{values.sendTo}</td>
          <td key={`delete${i}`} style={{fontSize: 20, textAlign: 'center'}}>
            <a href="javascript:void(0)" onClick={_=>this.deleteMenu(i)}> <i aria-hidden="true" className="trash icon"></i></a>
          </td>
        </tr>
        ret.push(col)
      }
      return ret
    }

    addMenu(){
      const max = Math.max(...this.state.sendUrlContextMenus.map(x=>x.ind),0)+1
      const newRecord = {enable:true, name:`name${max}`, type:'new', sendTo:'%s', ind:max,updated_at:Date.now()}
      this.state.sendUrlContextMenus.push(newRecord)
      this.setState({})
    }

    deleteMenu(i){
      const ind = this.state.sendUrlContextMenus.findIndex(x=>x.ind == i)
      this.state.sendUrlContextMenus.splice(ind,1)
      ipc.send('save-state',{tableName:'state', key:'sendUrlContextMenus', val:this.state.sendUrlContextMenus})
      this.setState({})
    }

    render() {
      return <div>
        <h3>{l10n.translation('5513242761114685513')}</h3>
        <Divider/>

        <h3>{l10n.translation("sendURL")}</h3>
        <table className="ui celled compact table">
          <thead>
          <tr>
            <th>{l10n.translation('59174027418879706')}</th>
            <th>{l10n.translation('name')}</th>
            <th>{l10n.translation("sendType")}</th>
            <th>{l10n.translation("sendURLCommand")}</th>
            <th>{l10n.translation('delete')}</th>
          </tr>
          </thead>
          <tbody>
          {this.buildSendToColumns()}
          </tbody>
          <tfoot className="full-width">
          <tr>
            <th>
            </th>
            <th colSpan="4">
              <button className="ui small icon primary button" onClick={_ => this.addMenu()}>Add
              </button>
            </th>
          </tr>
          </tfoot>
        </table>

        <h3>{l10n.translation('contextMain')}</h3>
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
          return <Grid.Column width={2}>
            <Input fluid error={!!this.state.errors[key+i]} onChange={this.onChange2.bind(this,key,i)} defaultValue={x}/>
          </Grid.Column>
        })}
        <Grid.Column width={3}><Input onChange={this.onChange.bind(this,`regex${key.charAt(0).toUpperCase()}${key.slice(1)}`)} defaultValue={this.state[`regex${key.charAt(0).toUpperCase()}${key.slice(1)}`]}/></Grid.Column>
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

        <br/>
        <br/>
        <Grid>
          <Grid.Row>
            <Grid.Column width={4}><h4>{l10n.translation('8260864402787962391')}</h4></Grid.Column>
            <Grid.Column width={4}></Grid.Column>
            <Grid.Column width={3}><h4 style={{paddingLeft: 2}}>URL Filter (RegExp)</h4></Grid.Column>
          </Grid.Row>
        </Grid>

        <Divider/>
        <Grid>
          <Grid.Row>
            <Grid.Column width={4}><label>{l10n.translation("mouseClick")}</label></Grid.Column>
            <Grid.Column width={4}><Dropdown onChange={this.onChange.bind(this,'clickVideo')} selection options={videoClickOptions} defaultValue={this.state.clickVideo}/></Grid.Column>
            <Grid.Column width={3}><Input onChange={this.onChange.bind(this,'regexClickVideo')} defaultValue={this.state.regexClickVideo}/></Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={4}><label>{l10n.translation("mouseDoubleClick")}</label></Grid.Column>
            <Grid.Column width={4}><Dropdown onChange={this.onChange.bind(this,'dbClickVideo')} selection options={videoClickOptions} defaultValue={this.state.dbClickVideo}/></Grid.Column>
            <Grid.Column width={3}><Input onChange={this.onChange.bind(this,'regexDbClickVideo')} defaultValue={this.state.regexDbClickVideo}/></Grid.Column>
          </Grid.Row>
        </Grid>
        <br/>

        <br/>
        <br/>
        <Grid>
          <Grid.Row>
            <Grid.Column width={4}><h4>{l10n.translation('mouseWheelFunctions')}</h4></Grid.Column>
            <Grid.Column width={4}></Grid.Column>
            <Grid.Column width={3}><h4 style={{paddingLeft: 2}}>URL Filter (RegExp)</h4></Grid.Column>
          </Grid.Row>
        </Grid>

        <Divider/>
        <Grid>
          <Grid.Row>
            <Grid.Column width={4}><label>{l10n.translation("mouseWheel")}</label></Grid.Column>
            <Grid.Column width={4}><Dropdown onChange={this.onChange.bind(this,'wheelMinusVideo')} selection options={videoWheelOptions} defaultValue={this.state.wheelMinusVideo}/></Grid.Column>
            <Grid.Column width={3}><Input onChange={this.onChange.bind(this,'regexWheelMinusVideo')} defaultValue={this.state.regexWheelMinusVideo}/></Grid.Column>
          </Grid.Row>
        </Grid>
        <Grid>
          <Grid.Row>
            <Grid.Column width={4}><label>{l10n.translation("shiftMouseWheel")}</label></Grid.Column>
            <Grid.Column width={4}><Dropdown onChange={this.onChange.bind(this,'shiftWheelMinusVideo')} selection options={videoWheelOptions} defaultValue={this.state.shiftWheelMinusVideo}/></Grid.Column>
            <Grid.Column width={3}><Input onChange={this.onChange.bind(this,'regexShiftWheelMinusVideo')} defaultValue={this.state.regexShiftWheelMinusVideo}/></Grid.Column>
          </Grid.Row>
        </Grid>
        <Grid>
          <Grid.Row>
            <Grid.Column width={4}><label>{l10n.translation("ctrlMouseWheel")}</label></Grid.Column>
            <Grid.Column width={4}><Dropdown onChange={this.onChange.bind(this,'ctrlWheelMinusVideo')} selection options={videoWheelOptions} defaultValue={this.state.ctrlWheelMinusVideo}/></Grid.Column>
            <Grid.Column width={3}><Input onChange={this.onChange.bind(this,'regexCtrlWheelMinusVideo')} defaultValue={this.state.regexCtrlWheelMinusVideo}/></Grid.Column>
          </Grid.Row>
        </Grid>
        <Grid>
          <Grid.Row>
            <Grid.Column width={4}><label>{l10n.translation("shiftCtrlMouseWheel")}</label></Grid.Column>
            <Grid.Column width={4}><Dropdown onChange={this.onChange.bind(this,'shiftCtrlWheelMinusVideo')} selection options={videoWheelOptions} defaultValue={this.state.shiftCtrlWheelMinusVideo}/></Grid.Column>
            <Grid.Column width={3}><Input onChange={this.onChange.bind(this,'regexShiftCtrlWheelMinusVideo')} defaultValue={this.state.regexShiftCtrlWheelMinusVideo}/></Grid.Column>
          </Grid.Row>
        </Grid>
        <br/>
        <br/>

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
            <Grid.Column width={4}><Input onChange={this.onChange.bind(this,'mediaSeek1Video')} defaultValue={this.state.mediaSeek1Video}/>{' '+l10n.translation('minimumPageTimeLow').replace(/5 */,'')}</Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={4}><label>{l10n.translation('mediaSeeking').replace(/\(.\)/,'')+'2'}</label></Grid.Column>
            <Grid.Column width={4}><Input onChange={this.onChange.bind(this,'mediaSeek2Video')} defaultValue={this.state.mediaSeek2Video}/>{' '+l10n.translation('minimumPageTimeLow').replace(/5 */,'')}</Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={4}><label>{l10n.translation('mediaSeeking').replace(/\(.\)/,'')+'3'}</label></Grid.Column>
            <Grid.Column width={4}><Input onChange={this.onChange.bind(this,'mediaSeek3Video')} defaultValue={this.state.mediaSeek3Video}/>{' '+l10n.translation('minimumPageTimeLow').replace(/5 */,'')}</Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={4}><label>{l10n.translation('volumeControl').replace(/\(.\)/,'')}</label></Grid.Column>
            <Grid.Column width={4}><Input onChange={this.onChange.bind(this,'audioSeekVideo')} defaultValue={this.state.audioSeekVideo}/>%</Grid.Column>
            <Grid.Column width={4} style={{paddingTop: 6}}>
              <Checkbox defaultChecked={this.state.keepAudioSeekValueVideo} toggle onChange={this.onChange.bind(this,'keepAudioSeekValueVideo')}/>
              <span className="toggle-label">{l10n.translation("keepValue​​inLocalStorage")}</span>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={4}><label>{l10n.translation('changeSpeed').replace(/\(.\)/,'')}</label></Grid.Column>
            <Grid.Column width={4}><Input onChange={this.onChange.bind(this,'speedSeekVideo')} defaultValue={this.state.speedSeekVideo}/>%</Grid.Column>
          </Grid.Row>
        </Grid>
        <br/>
        <br/>

        <br/>
        <br/>
        <Grid>
          <Grid.Row>
            <Grid.Column width={3}><h4>{l10n.translation('1524430321211440688')}</h4></Grid.Column>
            <Grid.Column width={2}></Grid.Column>
            <Grid.Column width={2}></Grid.Column>
            <Grid.Column width={2}></Grid.Column>
            <Grid.Column width={3}><h4 style={{paddingLeft: 2}}>URL Filter (RegExp)</h4></Grid.Column>
          </Grid.Row>
        </Grid>
        <Divider/>

        <div className="field">
          <Checkbox defaultChecked={this.state.enableKeyDownVideo} toggle onChange={this.onChange.bind(this,'enableKeyDownVideo')}/>
          <span className="toggle-label">{l10n.translation("enableKeyboardShortcut")}</span>
        </div>
        <br/>

        <p><a target="_blank" href="https://github.com/electron/electron/blob/master/docs/api/accelerator.md">{l10n.translation('pleaseReferHereForInputMethodOfShortcut')}</a></p>
        <br/>

        <Grid >
          {this.renderRows()}
        </Grid>
        <br/>


        <h4>{l10n.translation("blackListSites")}</h4>
        <Divider/>
        <Form>
          <TextArea autoHeight placeholder='input URLs' onChange={this.onChange.bind(this,'blackListVideo')} defaultValue={this.state.blackListVideo.join("\n")}/>
        </Form>
        <Divider/>

      </div>
    }
  }

  let extensionDefault, accessKey, accessPort
  class ExtensionSetting extends React.Component {
    constructor(props) {
      super(props)
      this.state = {extensions:extensionDefault.extensions}
    }


    changeCheck(id,data){
      this.state.extensions[id].enabled = data.checked
      ipc.send("enable-extension",id,data.checked)
      this.setState({})
    }

    buildExtensionColumns(){
      const ret = []
      let i = 0
      for(let [id,v] of Object.entries(this.state.extensions)){
        if(['jdbefljfgobbmcidnmpjamcbhnbphjnb'].includes(id) || v.theme) continue
        ret.push(this.buildExtensionColumn(i++,id,v))
      }
      return ret
    }

    buildExtensionColumn(i,id,v){
      console.log(id,v)
      const orgId = v.basePath.split(/[\/\\]/).slice(-2,-1)[0]
      const cannotDisable =  orgId == "occjjkgifpmdgodlplnacmkejpdionan"
      const icon = v.icons ? v.icons[Math.max(...Object.keys(v.icons))] : ""
      const iconUrl = `file://${v.basePath}/${icon}`
      return <tr key={`tr${i}`}>
        <td key={`icon${i}`}><img style={{width:32,height:32,margin:'auto'}} src={`http://localhost:${accessPort}/?key=${accessKey}&file=${iconUrl}`}/></td>
        <td key={`name${i}`}><a target="_blank" href={`https://chrome.google.com/webstore/detail/${orgId}`}>{v.name}</a></td>
        <td key={`description${i}`} >{v.description}</td>
        <td key={`version${i}`} style={{width: 40}}>{v.version}</td>
        <td key={`option${i}`} style={{fontSize: 20,textAlign: 'center'}}>
          {v.enabled && v.optionPage ? <a href="javascript:void(0)" onClick={_=> ipc.send('send-to-host', "open-tab", `chrome-extension://${id}/${v.optionPage}`, true)}>
            <i aria-hidden="true" class="setting icon"></i>
          </a> : null}
        </td>
        <td key={`enabled${i}`}>
          <Checkbox checked={v.enabled} disabled={cannotDisable} toggle onChange={(e,data)=>this.changeCheck(id,data)}/>
        </td>
        <td key={`background${i}`} style={{fontSize: 20,textAlign: 'center'}}>
          {v.enabled && v.background ? <a href="javascript:void(0)" onClick={_=> ipc.send('send-to-host', "load-url", `chrome-extension://${id}/${v.background}`, true)}>
            <i aria-hidden="true" class="bug icon"></i>
          </a> : null}
        </td>
        <td key={`delete${i}`} style={{fontSize: 20,textAlign: 'center'}}>
          {cannotDisable ? null : <a href="javascript:void(0)" onClick={_=>{
            ipc.send("delete-extension",id,orgId)
            delete this.state.extensions[id]
            this.setState({})
          }}>
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
            <th>{l10n.translation('remove')}</th>
          </tr>
          </thead>
          <tbody>
          {this.buildExtensionColumns()}
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

        <br/>

        <Button primary content='Install from local file(.crx)'
                onClick={_=>ipc.send('install-from-local-file-extension')}/>

      </div>
    }

  }

  class ThemeSetting extends React.Component {
    constructor(props) {
      super(props)
      this.state = extensionDefault
    }


    changeCheckTheme(id,data){
      ipc.send('save-state',{tableName:'state',key:'enableTheme',val:id})
      this.setState({enableTheme: id})
    }

    buildThemeColumns(){
      const ret = []
      let i = 0
      for(let [id,v] of Object.entries(this.state.extensions)){
        if(!v.theme) continue
        ret.push(this.buildThemeColumn(i++,id,v))
      }
      return ret
    }

    buildThemeColumn(i,id,v){
      console.log(id,v,this.state.enableTheme)
      const orgId = v.basePath.split(/[\/\\]/).slice(-2,-1)[0]
      const enable = this.state.enableTheme == id

      return <tr key={`tr${i}`}>
        <td key={`name${i}`}><a target="_blank" href={`https://chrome.google.com/webstore/detail/${id}`}>{v.name}</a></td>
        <td key={`description${i}`} >{v.description}</td>
        <td key={`version${i}`} style={{width: 40}}>{v.version}</td>
        <td key={`enabled${i}`}>
          <Checkbox checked={enable} disabled={enable} toggle onChange={(e,data)=>this.changeCheckTheme(id,data)}/>
        </td>
        <td key={`delete${i}`} style={{fontSize: 20,textAlign: 'center'}}>
          <a href="javascript:void(0)" onClick={_=>{
            ipc.send("delete-extension",id,id)
            delete this.state.extensions[id]
            if(this.state.enableTheme == id){
              ipc.send('save-state',{tableName:'state',key:'enableTheme',val: null})
              this.setState({enableTheme: null})
            }
            else{
              this.setState({})
            }
          }}>
            <i aria-hidden="true" class="trash icon"></i>
          </a>
        </td>
      </tr>
    }

    onChange(name,e,data){
      ipc.send('save-state',{tableName:'state',key:name,val:data.value || data.checked})
    }

    render() {
      const enable = !this.state.enableTheme
      return <div className="ui form">
        <h3>{l10n.translation('theme')}</h3>
        <table className="ui celled compact table">
          <thead>
          <tr>
            <th>{l10n.translation('name')}</th>
            <th>{l10n.translation('4289540628985791613')}</th>
            <th>{l10n.translation('3095995014811312755')}</th>
            <th>{l10n.translation('59174027418879706')}</th>
            <th>{l10n.translation('remove')}</th>
          </tr>
          </thead>
          <tbody>
          <tr key={`tr`}>
            <td key={`name`}>Default</td>
            <td key={`description`}>{l10n.translation("defaultTheme")}</td>
            <td key={`version`} style={{width: 40}}>1.0.0</td>
            <td key={`enabled`}>
              <Checkbox checked={enable} disabled={enable} toggle onChange={(e, data) =>{
                ipc.send('save-state',{tableName:'state',key:'enableTheme',val: null})
                this.setState({enableTheme: null})
              }}/>
            </td>
            <td key={`delete`} style={{fontSize: 20, textAlign: 'center'}}/>
          </tr>
          {this.buildThemeColumns()}
          </tbody>
          <tfoot className="full-width">
          <tr>
            <th>
            </th>
            <th colspan="4">
            </th>
          </tr>
          </tfoot>
        </table>

        <div className="field">
          <label>{l10n.translation("pagesToApply")}</label>
          <br/>

          <Checkbox defaultChecked={this.state.themeTopPage} toggle onChange={this.onChange.bind(this,'themeTopPage')}/>
          <span className="toggle-label">{l10n.translation("topPage")}</span>
          <br/>

          <Checkbox defaultChecked={this.state.themeBookmark} toggle onChange={this.onChange.bind(this,'themeBookmark')}/>
          <span className="toggle-label">{l10n.translation("bookmarks")}</span>
          <br/>

          <Checkbox defaultChecked={this.state.themeHistory} toggle onChange={this.onChange.bind(this,'themeHistory')}/>
          <span className="toggle-label">{l10n.translation("history")}</span>
          <br/>

          <Checkbox defaultChecked={this.state.themeDownloader} toggle onChange={this.onChange.bind(this,'themeDownloader')}/>
          <span className="toggle-label">{l10n.translation("downloads")}</span>
          <br/>

          <Checkbox defaultChecked={this.state.themeExplorer} toggle onChange={this.onChange.bind(this,'themeExplorer')}/>
          <span className="toggle-label">{l10n.translation("fileExplorer")}</span>
          <br/>

          <Checkbox defaultChecked={this.state.themeBookmarkSidebar} toggle onChange={this.onChange.bind(this,'themeBookmarkSidebar')}/>
          <span className="toggle-label">{l10n.translation("bookmarksSidebar")}</span>
          <br/>

          <Checkbox defaultChecked={this.state.themeHistorySidebar} toggle onChange={this.onChange.bind(this,'themeHistorySidebar')}/>
          <span className="toggle-label">{l10n.translation("historySidebar")}</span>
          <br/>

          <Checkbox defaultChecked={this.state.themeSessionManagerSidebar} toggle onChange={this.onChange.bind(this,'themeSessionManagerSidebar')}/>
          <span className="toggle-label">{l10n.translation("sessionManagerSidebar")}</span>
          <br/>

          <Checkbox defaultChecked={this.state.themeTabTrashSidebar} toggle onChange={this.onChange.bind(this,'themeTabTrashSidebar')}/>
          <span className="toggle-label">{l10n.translation("trashOfTabsSidebar")}</span>
          <br/>

          <Checkbox defaultChecked={this.state.themeTabHistorySidebar} toggle onChange={this.onChange.bind(this,'themeTabHistorySidebar')}/>
          <span className="toggle-label">{l10n.translation("historyOfTabsSidebar")}</span>
          <br/>

          <Checkbox defaultChecked={this.state.themeExplorerSidebar} toggle onChange={this.onChange.bind(this,'themeExplorerSidebar')}/>
          <span className="toggle-label">{l10n.translation("fileExplorerSidebar")}</span>

        </div>
        <br/>
      </div>
    }
  }


  // class SyncDataSetting extends React.Component {
  //   constructor(props) {
  //     super(props)
  //     this.state = generalDefault
  //   }
  //
  //
  //   onChange(name,e,data){
  //     this.setState({[name]: data.value})
  //     // ipc.send('save-state',{tableName:'state',key:name,val:data.value || data.checked})
  //   }
  //
  //   loginSync(type){
  //     const key = Math.random().toString()
  //     const email = type == 'login' ? this.state.loginEmail : this.state.newEmail
  //     const password = type == 'login' ? this.state.loginPassword : this.state.newPassword
  //     ipc.send("login-sync",{key,type,email,password})
  //     ipc.once(`login-sync-reply_${key}`,(e,result,message)=>{
  //       if(result && (type == 'login' || type == 'regist')){
  //         this.state.emailSync = email
  //       }
  //       else{
  //         delete this.state.emailSync
  //       }
  //       this.setState({result,message})
  //     })
  //   }
  //
  //
  //   render() {
  //     return <div className="ui form">
  //       <h3>{l10n.translation('syncDatas')}</h3>
  //       <Divider/>
  //       <div className="ui icon info message" style={{width: 'initial'}}>
  //         <div className="content">
  //           It is a function to synchronize data between devices.<br/>
  //           For initial registration, please input "{l10n.translation('email')}" and "{l10n.translation('passwordsPassword')}" in "New User" and click "{l10n.translation('839736845446313156')}" button.<br/>
  //           After that, if you login with the registered user information, data synchronization processing will be performed every 6 hours.
  //         </div>
  //       </div>
  //       <br/>
  //       <Grid>
  //         <Grid.Row>
  //           <Grid.Column width={5}>
  //             {this.state.emailSync ?
  //               <div className="field">
  //                 <label>{l10n.translation('5222676887888702881')}</label>
  //
  //                 <lable>{l10n.translation('email')}：{this.state.emailSync}</lable>
  //                 <br/>
  //                 <br/>
  //                 <Button primary content={l10n.translation('5222676887888702881')} onClick={_=>this.loginSync('logout')}/>
  //                 <br/>
  //                 <br/>
  //                 <Button primary content='Sync Now!' onClick={_=>ipc.send('start-sync',true)}/>
  //               </div>
  //               :
  //               <div className="field">
  //                 <label>{l10n.translation('1864111464094315414')}</label>
  //
  //                 <div className="field">
  //                   <Input onChange={this.onChange.bind(this,'loginEmail')} placeholder={l10n.translation('email')}/>
  //                 </div>
  //                 <div className="field">
  //                   <Input onChange={this.onChange.bind(this,'loginPassword')} placeholder={l10n.translation('passwordsPassword')} onKeyDown={e=>e.keyCode == 13 && this.loginSync('login')}/>
  //                 </div>
  //
  //                 <Button primary content={l10n.translation('1864111464094315414')} onClick={_=>this.loginSync('login')}/>
  //               </div>}
  //           </Grid.Column>
  //           {this.state.emailSync ? null :<Grid.Column width={5} style={{marginTop: 0}}>
  //             <div className="field">
  //               <label>New User</label>
  //
  //               <div className="field">
  //                 <Input onChange={this.onChange.bind(this,'newEmail')} placeholder={l10n.translation('email')}/>
  //               </div>
  //               <div className="field">
  //                 <Input onChange={this.onChange.bind(this,'newPassword')} placeholder={l10n.translation('passwordsPassword')} onKeyDown={e=>e.keyCode == 13 && this.loginSync('regist')}/>
  //               </div>
  //
  //               <Button primary content={l10n.translation('839736845446313156')} onClick={_=>this.loginSync('regist')}/>
  //             </div>
  //           </Grid.Column>}
  //         </Grid.Row>
  //       </Grid>
  //       <br/>
  //
  //       {this.state.message ? <div className={`ui ${this.state.result ? 'info' : 'negative'} message`} style={{width: 'initial'}}>
  //         <div className="header">
  //           {this.state.message}
  //         </div>
  //       </div> : null}
  //
  //
  //       <br/>
  //       <div className="field">
  //         <label>{l10n.translation('data')}</label>
  //         <Checkbox toggle onChange={this.onChange.bind(this,'syncGeneralSettings')} defaultChecked={this.state.syncGeneralSettings}/>
  //         <span className="toggle-label">{l10n.translation('generalSettings')}</span>
  //         <br/>
  //         <Checkbox toggle onChange={this.onChange.bind(this,'syncBookmarks')} defaultChecked={this.state.syncBookmarks}/>
  //         <span className="toggle-label">{l10n.translation('bookmarks')}</span>
  //         <br/>
  //         <Checkbox toggle onChange={this.onChange.bind(this,'syncBrowsingHistory')} defaultChecked={this.state.syncBrowsingHistory}/>
  //         <span className="toggle-label">{l10n.translation('browsingHistory')}</span>
  //         <br/>
  //         <Checkbox toggle onChange={this.onChange.bind(this,'syncSessionTools')} defaultChecked={this.state.syncSessionTools}/>
  //         <span className="toggle-label">{l10n.translation('sessionTools')}</span>
  //         <br/>
  //         <Checkbox toggle onChange={this.onChange.bind(this,'syncFavicons')} defaultChecked={this.state.syncFavicons}/>
  //         <span className="toggle-label">{l10n.translation('favicon')}</span>
  //         <br/>
  //         <Checkbox toggle onChange={this.onChange.bind(this,'syncDownloadHistory')} defaultChecked={this.state.syncDownloadHistory}/>
  //         <span className="toggle-label">{l10n.translation('downloadHistory')}</span>
  //         <br/>
  //         <Checkbox toggle onChange={this.onChange.bind(this,'syncAutomation')} defaultChecked={this.state.syncAutomation}/>
  //         <span className="toggle-label">{l10n.translation('automation')}</span>
  //         <br/>
  //         <Checkbox toggle onChange={this.onChange.bind(this,'syncNote')} defaultChecked={this.state.syncNote}/>
  //         <span className="toggle-label">{l10n.translation('note')}</span>
  //         <br/>
  //         <Checkbox toggle onChange={this.onChange.bind(this,'syncPassword')} defaultChecked={this.state.syncPassword}/>
  //         <span className="toggle-label">{l10n.translation('passwordsPassword')}</span>
  //       </div>
  //
  //     </div>
  //   }
  // }

  const routings = {
    general : <GeneralSetting/>,
    data : <DataSetting/>,
    search : <SearchSetting/>,
    tabs : <TabsSetting/>,
    contextMenu : <ContextMenuSetting/>,
    keyboard : <KeyboardSetting/>,
    video : <VideoSetting/>,
    extensions : <ExtensionSetting/>,
    theme : <ThemeSetting/>,
    // syncDatas: <SyncDataSetting/>
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
                        onClick={_=>{
                          ReactDOM.findDOMNode(this).querySelector('.pusher').scrollTo(0,0)
                          this.setState({page:name})
                        }}
      >
        <Icon name={icon}/>
        { l10n.translation(name == "keyboard" ? '1524430321211440688' : name == 'video' ? '6146563240635539929' : name == 'contextMenu'? '5513242761114685513' : name)}
      </Menu.Item>
    }

    route(name){

    }

    render() {
      return <Sidebar.Pushable style={{minHeight: 'calc(100vh - 58px)'}} as={Segment}>
        <Sidebar as={Menu} animation='slide along' width='thin' visible={true} icon='labeled' vertical inverted>
          <Menu.Item></Menu.Item>
          {this.getMenu('general','browser')}
          {this.getMenu('data','database')}
          {this.getMenu('search','search')}
          {this.getMenu('tabs','table')}
          {this.getMenu('contextMenu','square outline')}
          {this.getMenu('keyboard','keyboard')}
          {this.getMenu('video','video')}
          {this.getMenu('theme','picture')}
          {this.getMenu('extensions','industry')}
          {/*{this.getMenu('syncDatas','exchange')}*/}
          <Menu.Item as="a" href='javascript:void(0)' onClick={_=>ipc.send('open-page','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/options_page.html')} active={false}>
            {l10n.translation('mouseGesture')}
          </Menu.Item>
          <Menu.Item as="a" href='javascript:void(0)' onClick={_=>ipc.send('open-page','chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/input_history.html')} active={false}>
            Input History
          </Menu.Item>
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
    'doubleShift','tripleClick','enableMouseGesture','fullscreenTransition','autoDeleteDownloadList','extensionOnToolbar','syncScrollMargin','contextMenuSearchEngines','ALL_KEYS','bindMarginFrame','bindMarginTitle','longPressMiddle','checkDefaultBrowser','sendToVideo',
    'multistageTabs','tabMinWidth','httpsEverywhereEnable','trackingProtectionEnable','autoSaveInterval','noScript','blockCanvasFingerprinting','browsingHistory', 'downloadHistory',
    'disableContextMenus','disableTabContextMenus','priorityContextMenus','priorityTabContextMenus','reloadIntervals','generalWindowOpenLabel','keepWindowLabel31','tabPreview','tabPreviewQuality',
    'closeTabBehavior','reverseScrollTab','tabCirculateSelection','tabMaxWidth','mouseHoverSelectLabelBegin','mouseHoverSelectLabelBeginDelay','tabFlipLabel','doubleClickTab','middleClickTab','altClickTab',
    'maxrowLabel','orderOfAutoComplete','numOfSuggestion','numOfHistory','openTabNextLabel','rightClickTabAdd','middleClickTabAdd','altClickTabAdd','displayFullIcon','downloadPath','windowCustomIcon',
    'defaultDownloadPath','alwaysOpenLinkNewTab','openTabPosition','alwaysOpenLinkBackground','addressBarNewTab','oppositeGlobal','colorNormalText','colorNormalBackground','colorActiveText',
    'colorActiveBackground','colorTabDot','colorUnreadText','colorUnreadBackground','enableColorOfNoSelect','themeColorChange','showBorderActiveTab','historyBadget','colorTabMode','enableDownloadList','focusLocationBar',
    'clearHistoryOnClose','clearDownloadOnClose','clearCacheOnClose','clearStorageDataOnClose','clearAutocompleteDataOnClose','clearAutofillDataOnClose','clearPasswordOnClose','clearGeneralSettingsOnClose','clearFavoriteOnClose',
    'clearSessionManagerOnClose','clearFaviconOnClose','clearAutomationOnClose','clearNoteOnClose','clearType','clearDays',
    'enableWidevine','toolbarLink','sidebarLink','bookmarkbarLink','zoomBehavior','tabPreviewSizeWidth','tabPreviewSizeHeight','tabPreviewSlideHeight','tabPreviewWait','searchEngineDisplayType','tabPreviewRecent',
    'sendUrlContextMenus','extensions','tabBarMarginTop','removeTabBarMarginTop','enableTheme','themeTopPage','themeBookmark','themeHistory','themeDownloader','themeExplorer','themeBookmarkSidebar','themeHistorySidebar',
    'themeSessionManagerSidebar','themeTabTrashSidebar','themeTabHistorySidebar','themeExplorerSidebar','searchHistoryOrderCount','rectangularSelection','fullscreenTransitionKeep','enableSmoothScrolling','showAddressBarFavicon','showAddressBarBookmarks'
    ,'emailSync','syncGeneralSettings','syncBookmarks','syncBrowsingHistory','syncSessionTools','syncFavicons','syncDownloadHistory','syncAutomation','syncNote','syncPassword','rockerGestureLeft','rockerGestureRight','inputHistory','inputHistoryMaxChar',
    'regexClickVideo','regexDbClickVideo','regexWheelMinusVideo','regexShiftWheelMinusVideo','regexCtrlWheelMinusVideo','regexShiftCtrlWheelMinusVideo','regexKeyVideoPlayOrPause',
    'regexKeyVideoFrameStep','regexKeyVideoFrameBackStep','regexKeyVideoRewind1','regexKeyVideoRewind2','regexKeyVideoRewind3','regexKeyVideoForward1','regexKeyVideoForward2','regexKeyVideoForward3','regexKeyVideoNormalSpeed','regexKeyVideoHalveSpeed','regexKeyVideoDoubleSpeed',
    'regexKeyVideoDecSpeed','regexKeyVideoIncSpeed','regexKeyVideoFullscreen','regexKeyVideoExitFullscreen','regexKeyVideoMute','regexKeyVideoDecreaseVolume','regexKeyVideoIncreaseVolume','regexKeyVideoPlRepeat'])
  ipc.once(`get-main-state-reply_${key}`,async (e,data)=>{
    generalDefault = data
    keyboardDefault = data
    TabDefault = data
    videoDefault = data
    extensionDefault = data
    contextMenuDefault = data

    const {searchProviders, searchEngine, contextMenuSearchEngines,searchEngineDisplayType} = data
    let arr = []
    for(let [name,value] of Object.entries(searchProviders)){
      arr[value.ind] = value
    }
    searchDefault = {searchProviders: arr.filter(x=>x),default: searchEngine,contextMenuSearchEngines,searchEngineDisplayType}

    ;[accessKey, accessPort] = await new Promise(r=>{
      ipc.send('get-access-key-and-port')
      ipc.once('get-access-key-and-port-reply',(e,data)=>r(data))
    })
    ReactDOM.render(<App />,  document.getElementById('app'))
  })
})()