const {ipcMain, webContents, session, app} = require('electron')
const {shortId} = require('./extensions/util-main')

module.exports = function(manifestMap, backgroundPages, sendToBackgroundPage, sendToBackgroundPages){

// Dispatch web contents events to Chrome APIs
  const hookWebContentsEvents = function (webContents) {
    const tabId = webContents.id

    sendToBackgroundPages('CHROME_TABS_ONCREATED', tabId)

    require('./extensions/web-navigation-main')(webContents, sendToBackgroundPage)

    for(let event of ['did-finish-load',
      'did-fail-load',
      'did-start-loading',
      'did-stop-loading',
      'did-start-navigation',
      'did-navigate',
      'did-navigate-in-page',
      'page-title-updated',
      'page-favicon-updated',]){
      sendToBackgroundPages('CHROME_TABS_ONUPDATED', tabId)
    }

    webContents.once('destroyed', () => {
      sendToBackgroundPages('CHROME_TABS_ONREMOVED', tabId)
    })
  }

// Handle the chrome.* API messages.
  const nextId = {val: 0}

  ipcMain.on('CHROME_RUNTIME_CONNECT', function (event, extensionId, connectInfo) {
    const page = backgroundPages[extensionId]
    console.log(`CHROME_RUNTIME_CONNECT`, extensionId, connectInfo,page && page.webContents.getURL())
    if (!page) {
      console.error(`Connect to unknown extension ${extensionId}`)
      return
    }

    const portId = ++nextId.val
    event.returnValue = {tabId: page.webContents.id, portId: portId}

    event.sender.once('render-view-deleted', () => {
      if (page.webContents.isDestroyed()) return
      page.webContents.sendToAll(`CHROME_PORT_DISCONNECT_${portId}`)
    })
    page.webContents.sendToAll(`CHROME_RUNTIME_ONCONNECT_${extensionId}`, event.sender.id, portId, connectInfo)
  })

  ipcMain.on('CHROME_I18N_MANIFEST', function (event, extensionId) {
    event.returnValue = manifestMap[extensionId]
  })

  const resultID = {val: 1}
  ipcMain.on('CHROME_RUNTIME_SENDMESSAGE', function (event, extensionId, message, originResultID) {
    // console.log('CHROME_RUNTIME_SENDMESSAGE', event.sender.getURL(), extensionId, message, originResultID)
    const page = backgroundPages[extensionId]
    if (!page) {
      console.error(`Connect to unknown extension ${extensionId}`)
      return
    }

    console.log(`CHROME_RUNTIME_ONMESSAGE_${extensionId}`)
    page.webContents.sendToAll(`CHROME_RUNTIME_ONMESSAGE_${extensionId}`, event.sender.id, message, resultID.val)
    ipcMain.once(`CHROME_RUNTIME_ONMESSAGE_RESULT_${resultID.val}`, (event2, result) => {
      console.log(`CHROME_RUNTIME_ONMESSAGE_RESULT_${resultID.val}`)
      event.sender.send(`CHROME_RUNTIME_SENDMESSAGE_RESULT_${originResultID}`, result)
      console.log(`CHROME_RUNTIME_SENDMESSAGE_RESULT_${originResultID}`)
    })
    resultID.val++
  })

  const {tabMain, tabsQuery, getTabValue} = require('./extensions/tabs-main')
  tabMain(manifestMap, resultID, nextId)

  require('./extensions/windows-main')(manifestMap, sendToBackgroundPages, tabsQuery)
  require('./extensions/storage-main')(manifestMap)

  app.once('ready', function () {
    require('./extensions/web-request-main')(session.defaultSession, sendToBackgroundPage)
    require('./extensions/idle-main')(manifestMap)
    require('./extensions/cookies-main')(sendToBackgroundPages)
    require('./extensions/sessions-main')(sendToBackgroundPages)
    require('./extensions/commands-main')(sendToBackgroundPage)
    require('./extensions/browsing-data-main')(sendToBackgroundPage)
  })

  require('./extensions/browser-action-main')(sendToBackgroundPage, getTabValue)
  require('./extensions/context-menus-main')(manifestMap, sendToBackgroundPage, getTabValue)
  require('./extensions/i18n-main')(manifestMap)
  require('./extensions/management-main')(manifestMap)

  return hookWebContentsEvents
}