const {ipcMain, webContents, session, app} = require('electron')
const {shortId} = require('./extensions/util-main')

module.exports = function(manifestMap, backgroundPages, sendToBackgroundPage, sendToBackgroundPages){

  ipcMain.on('update-tab',(e,tabId)=>{
    sendToBackgroundPages('CHROME_TABS_ONUPDATED', tabId)
  })

// Dispatch web contents events to Chrome APIs
  const hookWebContentsEvents = function (webContents) {
    const tabId = webContents.id

    if(webContents.hostWebContents) return

    sendToBackgroundPages('CHROME_TABS_ONCREATED', tabId)

    require('./extensions/web-navigation-main')(webContents, sendToBackgroundPage)

    // webContents.on('did-fail-load', (e,errorCode,errorDescription,validatedURL,isMainFrame,frameProcessId,frameRoutingId)=>{
    //   if(!isMainFrame)
    //     sendToBackgroundPages('CHROME_TABS_ONUPDATED', tabId)
    // })

    for(let name of ['did-fail-load',
      'did-finish-load',
      'did-start-loading',
      'did-stop-loading',
      'did-start-navigation',
      // 'did-navigate',
      // 'did-navigate-in-page',
      'page-title-updated',
      'page-favicon-updated']){
      webContents.on(name, (e,...args)=>{
        sendToBackgroundPages('CHROME_TABS_ONUPDATED', tabId)
      })
    }

    webContents.once('destroyed', () => {
      sendToBackgroundPages('CHROME_TABS_ONREMOVED', tabId)
    })
  }

// Handle the chrome.* API messages.
  const nextId = {val: 0}

  ipcMain.on('CHROME_RUNTIME_CONNECT', async function (event, extensionId, connectInfo, webContentsKey) {
    const backgroundPage = backgroundPages[extensionId] && backgroundPages[extensionId].webContents
    for(let page of new Set([backgroundPage,...webContents.getAllWebContents()])) {
      if (!page || page.isDestroyed() || !page.getURL().startsWith(`chrome-extension://${extensionId}`)) {
        continue
      }

      const portId = ++nextId.val
      page.sendToAll(`CHROME_RUNTIME_ONCONNECT_${extensionId}`, event.sender.id, portId, connectInfo, webContentsKey)
      const success = await new Promise(r=>{
        ipcMain.once(`CHROME_RUNTIME_ONCONNECT_RES_${extensionId}`, (e2, canConnect) => {
          console.log(`CHROME_RUNTIME_ONCONNECT_RES_${extensionId}`)
          if (canConnect) {
            event.returnValue = {tabId: page.id, portId: portId}

            event.sender.once('render-view-deleted', () => {
              if (page.isDestroyed()) return
              page.sendToAll(`CHROME_PORT_DISCONNECT_${portId}`)
            })
            r(true)
          }
          else {
            r(false)
          }
        })
      })
      if(success) return
    }
    event.returnValue = null
  })

  ipcMain.on('CHROME_I18N_MANIFEST', function (event, extensionId) {
    event.returnValue = manifestMap[extensionId]
  })

  const resultID = {val: 1}
  ipcMain.on('CHROME_RUNTIME_SENDMESSAGE', function (event, extensionId, message, originResultID, webContentsKey) {
    // console.log('CHROME_RUNTIME_SENDMESSAGE', event.sender.getURL(), extensionId, message, originResultID, Date.now())
    const backgroundPage = backgroundPages[extensionId] && backgroundPages[extensionId].webContents
    for(let page of new Set([backgroundPage,...webContents.getAllWebContents()])) {
      if (!page || page.isDestroyed() || !page.getURL().startsWith(`chrome-extension://${extensionId}`)) {
        continue
      }
      const val = resultID.val

      console.log(`CHROME_RUNTIME_ONMESSAGE_${extensionId}`, val)
      page.sendToAll(`CHROME_RUNTIME_ONMESSAGE_${extensionId}`, event.sender.id, message, val, webContentsKey)
      const callback = (event2, result) => {
        // console.log(`CHROME_RUNTIME_ONMESSAGE_RESULT_${val}`,event.sender.isDestroyed(),event.sender.getURL(), Date.now(),result)
        if(!event.sender.isDestroyed()) event.sender.sendToAll(`CHROME_RUNTIME_SENDMESSAGE_RESULT_${originResultID}`, result)
        console.log(`CHROME_RUNTIME_SENDMESSAGE_RESULT_${originResultID}`)
      }
      ipcMain.on(`CHROME_RUNTIME_ONMESSAGE_RESULT_${val}`, callback)
      setTimeout(() => ipcMain.removeListener(`CHROME_RUNTIME_ONMESSAGE_RESULT_${val}`, callback), 1000 * 120)
      resultID.val++
    }
  })


  ipcMain.on('send-args-renderer', (e, key, rendererId, args) => {
    console.log('send-args-renderer', key, rendererId, args)
    webContents.fromId(rendererId).send(`send-args-renderer_${key}`, args)
  })

  ipcMain.on('background-data', (e, extensionId, dataKey, type, name, data) => {
    const key = shortId()
    console.log(extensionId, 'get-background-data', e.sender.getURL(),key, dataKey, type, name, data)
    const success = sendToBackgroundPage(extensionId, 'get-background-data', e.sender.id, key, dataKey, type, name, data)
    if(!success){
      return e.returnValue = {key: false, result: void 0, type: 'no-proxy'}
    }

    ipcMain.once(`get-background-data-reply_${key}`, (e2, result, type) => {
      console.log(`get-background-data-reply_${key}`, result, type)
      e.returnValue = {key, result, type}
    })
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
  require('./extensions/alarms-main')(sendToBackgroundPage)

  return hookWebContentsEvents
}