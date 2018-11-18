const {ipcRenderer} = require('electron')
const {Event} = require('./extensions/event')
const Tab = require('./extensions/tab')
const Port = require('./extensions/port')
const MessageSender = require('./extensions/message-sender')
const {shortId} = require('./extensions/util')

// Inject chrome API to the |context|
exports.injectTo = function (extensionId, isBackgroundPage, isExtensionPage, context) {
  const chrome = context.chrome = context.chrome || {}
  const manifest = ipcRenderer.sendSync('CHROME_I18N_MANIFEST', extensionId)

  const webContentsKey = shortId()

  // console.log(`CHROME_RUNTIME_ONCONNECT0_${extensionId}`, isBackgroundPage, context)
  ipcRenderer.on(`CHROME_RUNTIME_ONCONNECT_${extensionId}`, (event, tabId, portId, connectInfo, _webContentsKey) => {
    event.sender.send(`CHROME_RUNTIME_ONCONNECT_RES_${extensionId}`, webContentsKey !== _webContentsKey)
    if(webContentsKey == _webContentsKey) return
    console.log(`CHROME_RUNTIME_ONCONNECT_${extensionId}`, (event, tabId, portId, connectInfo))
    chrome.runtime.onConnect.emit(new Port(tabId, portId, extensionId, connectInfo.name))
  })

  ipcRenderer.on(`CHROME_RUNTIME_ONMESSAGE_${extensionId}`, (event, tabId, message, resultID, _webContentsKey) => {
    if(webContentsKey == _webContentsKey) return
    // console.log(`CHROME_RUNTIME_ONMESSAGE_${extensionId}`, (event, tabId, message, resultID))
    chrome.runtime.onMessage.emit(message, new MessageSender(tabId, extensionId), (messageResult) => {
      ipcRenderer.send(`CHROME_RUNTIME_ONMESSAGE_RESULT_${resultID}`, messageResult)
    })
  })

  if(manifest.admin) chrome.ipcRenderer = ipcRenderer

  chrome.csi = _=>({})
  chrome.app = require('./extensions/app').setup(manifest)
  chrome.runtime = require('./extensions/runtime').setup(extensionId, manifest, isBackgroundPage, isExtensionPage, chrome, webContentsKey);
  chrome.extension = require('./extensions/extension').setup(chrome)
  chrome.storage = require('./extensions/storage').setup(extensionId)
  chrome.i18n = require('./extensions/i18n').setup(extensionId)
  chrome.contentSettings = require('./extensions/content-settings').setup(extensionId)

  if(isExtensionPage){
    chrome.tabs = require('./extensions/tabs').setup(extensionId, manifest, isBackgroundPage, chrome, webContentsKey)
    chrome.windows = require('./extensions/windows').setup(extensionId)
    chrome.permissions = require('./extensions/permissions').setup()
    chrome.management = require('./extensions/management').setup(extensionId)
    chrome.browserAction = require('./extensions/browser-action').setup(extensionId)
    chrome.commands = require('./extensions/commands').setup(extensionId, manifest)
    chrome.pageAction = chrome.browserAction

    const permissions = {}
    for(let permission of manifest.permissions) permissions[permission] = true

    if(permissions.cookies) chrome.cookies = require('./extensions/cookies').setup(extensionId, chrome)
    if(permissions.sessions) chrome.sessions = require('./extensions/sessions').setup(extensionId, chrome)
    if(permissions.contextMenus) chrome.contextMenus = require('./extensions/context-menus').setup(extensionId)
    if(permissions.webNavigation) chrome.webNavigation = require('./extensions/web-navigation').setup(extensionId)
    if(permissions.webRequest) chrome.webRequest = require('./extensions/web-request').setup(extensionId)
    if(permissions.idle) chrome.idle = require('./extensions/idle').setup()
    if(permissions.notifications) chrome.notifications = require('./extensions/notifications').setup()
    if(permissions.browsingData) chrome.browsingData = require('./extensions/browsing-data').setup()
    if(permissions.topSites) chrome.topSites = require('./extensions/top-sites').setup()
    if(permissions.bookmarks) chrome.bookmarks = require('./extensions/bookmarks').setup(chrome)
    if(permissions.downloads) chrome.downloads = require('./extensions/downloads').setup()
    if(permissions.history) chrome.history = require('./extensions/history').setup()
    if(permissions.proxy) chrome.proxy = require('./extensions/proxy').setup()
    if(permissions.privacy) chrome.privacy = require('./extensions/privacy').setup()
    if(permissions.alarms) chrome.alarms = require('./extensions/alarms').setup(extensionId)
  }

}
