const isDarwin = process.platform === 'darwin'
const isLinux = process.platform === 'linux'

const settingDefault =  {
  toggleNav: 0,
  adBlockEnable: true,
  pdfMode: 'normal',
  oppositeGlobal: true,
  alwaysOnTop: false,
  downloadNum: 1,
  searchEngine: 'Google',
  myHomepage: 'https://sushib.me/',
  startsWith: 'newTab',
  newTabMode: 'top',
  language: 'default',
  enableFlash: true,
  sideBarDirection: 'left',
  scrollTab: true,
  doubleShift: true,
  tripleClick: true,
  historyFull: true,
  longPressMiddle: true,
  syncScrollMargin: 30,
  contextMenuSearchEngines: ["Google","google past year and normal","google multi search"],

  bindMarginFrame: isLinux ? 6 : 0,
  bindMarginTitle: isLinux ? 24  : 0,

  checkedVersion: '0.00',
  checkDefaultBrowser: true,
  disableExtensions: [],
  adBlockDisableSite: {},

  sendToVideo: isLinux ? 'vlc' : isDarwin ? '"quicktime player"' : 'wmplayer',
  vpnNames: [],

  //keyboard shortcut default
  keyQuit: 'CmdOrCtrl+Q',
  keyNewTab: 'CmdOrCtrl+T',
  keyNewPrivateTab: 'Shift+CmdOrCtrl+P',
  keyNewSessionTab: 'Shift+CmdOrCtrl+S',
  keyNewWindow: 'CmdOrCtrl+N',
  keyOpenLocation: 'CmdOrCtrl+L',
  keyCloseTab: 'CmdOrCtrl+W',
  keyCloseWindow: 'CmdOrCtrl+Shift+W',
  keySavePageAs: 'CmdOrCtrl+S',
  keyPrint: 'CmdOrCtrl+P',

  keyUndo: 'CmdOrCtrl+Z',
  keyRedo: 'CmdOrCtrl+Y',
  keyCut: 'CmdOrCtrl+X',
  keyCopy: 'CmdOrCtrl+C',
  keyPaste: 'CmdOrCtrl+V',
  keyPasteWithoutFormatting: 'Shift+CmdOrCtrl+V',
  keySelectAll: 'CmdOrCtrl+A',

  keyFindOnPage: 'CmdOrCtrl+F',
  keySettings: 'CmdOrCtrl+,',

  keyActualSize: 'CmdOrCtrl+0',
  keyZoomIn: 'CmdOrCtrl+=',
  keyZoomOut: 'CmdOrCtrl+-',
  keyStop: isDarwin ? 'Cmd+.' : 'Esc',
  keyReloadPage: 'CmdOrCtrl+R',
  keyCleanReload: 'CmdOrCtrl+Shift+R',
  keyToggleDeveloperTools: isDarwin ? 'Cmd+Alt+I' : 'Ctrl+Shift+I',
  keyToggleFullScreenView: isDarwin ? 'Ctrl+Cmd+F' : 'F11',

  keyHome: 'CmdOrCtrl+Shift+H',
  keyBack: 'CmdOrCtrl+[',
  keyForward: 'CmdOrCtrl+]',
  keyReopenLastClosedTab: 'Shift+CmdOrCtrl+T',
  keyShowAllHistory: 'CmdOrCtrl+Y',

  keyBookmarkPage: 'CmdOrCtrl+D',
  keyBookmarksManager: isDarwin ? 'CmdOrCtrl+Alt+B' : 'Ctrl+Shift+O',

  keyMinimize: 'CmdOrCtrl+M',
  keySelectNextTab: 'Ctrl+Tab',
  keySelectPreviousTab: 'Ctrl+Shift+Tab',

  keyDownloadsManager: isDarwin ? 'CmdOrCtrl+Shift+J' : 'Ctrl+J',
  keyHideBrave: 'Command+H',
  keyHideOthers: 'Command+Alt+H',

  //Orginal key binding
  keyToggleMenuBar: 'CmdOrCtrl+Alt+T',
  keyChangeFocusPanel: 'CmdOrCtrl+Alt+Space',

  keySplitLeft: 'CmdOrCtrl+Alt+Left',
  keySplitRight: 'CmdOrCtrl+Alt+Right',
  keySplitTop: 'CmdOrCtrl+Alt+Up',
  keySplitBottom: 'CmdOrCtrl+Alt+Down',

  keySwapPosition: 'CmdOrCtrl+Alt+P',
  keySwitchDirection: 'CmdOrCtrl+Alt+D',

  keyAlignHorizontal: 'CmdOrCtrl+Alt+H',
  keyAlignVertical: 'CmdOrCtrl+Alt+V',

  keySwitchSyncScroll: 'CmdOrCtrl+Alt+S',
  keyOpenSidebar: 'CmdOrCtrl+Alt+B',
  keyChangeMobileAgent: 'CmdOrCtrl+Alt+M',

  keyDetachPanel: 'CmdOrCtrl+Alt+E',
  keyClosePanel: 'CmdOrCtrl+Alt+C',

  //localshortcut
  keyFindOnPage_1: 'F6',
  keySelectNextTab_1: 'CmdOrCtrl+Shift+]',
  keySelectNextTab_2: 'Ctrl+PageDown',
  keySelectPreviousTab_1: 'CmdOrCtrl+Shift+[',
  keySelectPreviousTab_2: 'Ctrl+PageUp',
  keyLastTab: 'CmdOrCtrl+9',
  keyFindNext: 'CmdOrCtrl+G',
  keyFindPrevious: 'CmdOrCtrl+Shift+G',
  keyToggleDeveloperTools_1: 'CmdOrCtrl+Alt+J',
  keyToggleDeveloperTools_2: 'F12',
  keyZoomIn_1: 'CmdOrCtrl+Shift+=',
  keyZoomOut_1: 'CmdOrCtrl+Shift+-',
  keyReloadPage_1: 'F5',
  keyCleanReload_1: 'Ctrl+F5',
  keyCloseWindow_1: 'Ctrl+F4',
  keyOpenLocation_1: 'Alt+D',
  keyBack_1: 'Alt+Left',
  keyForward_1: 'Alt+Right',
  keyViewPageSource: isDarwin ? 'Cmd+Alt+U' : 'Ctrl+U',
  keyTab1: 'CmdOrCtrl+1',
  keyTab2: 'CmdOrCtrl+2',
  keyTab3: 'CmdOrCtrl+3',
  keyTab4: 'CmdOrCtrl+4',
  keyTab5: 'CmdOrCtrl+5',
  keyTab6: 'CmdOrCtrl+6',
  keyTab7: 'CmdOrCtrl+7',
  keyTab8: 'CmdOrCtrl+8',

}


module.exports = {
  settingDefault
}