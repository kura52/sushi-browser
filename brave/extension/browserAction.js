const {webContents,ipcMain} = require('electron')
const debug = require('debug')('info')

process.on('chrome-browser-action-registered', (extensionId, details) => {
  debug('chrome-browser-action-registered', extensionId, details)
})

process.on('chrome-browser-action-set-icon', (extensionId, details) => {
  debug('chrome-browser-action-set-icon', extensionId, details)
  for(let cont of webContents.getAllWebContents()){
    if(!cont.getURL().match(/^chrome:\/\/brave.+?\/index.html/)) continue
    cont.send('chrome-browser-action-set-icon-ipc',details)
  }
})

process.on('chrome-browser-action-set-badge-text', (extensionId, details) => {
  debug('chrome-browser-action-set-badge-text', extensionId, details)
})

process.on('chrome-browser-action-set-badge-background-color', (extensionId, details) => {
  debug('chrome-browser-action-set-badge-background-color', extensionId, details)
})

process.on('chrome-browser-action-set-title', (extensionId, details) => {
  debug('chrome-browser-action-set-title', extensionId, details)
})

process.on('chrome-browser-action-popup', (extensionId, tabId, name, popup, props) => {
  debug('chrome-browser-action-popup', extensionId, tabId, name, popup, props)
  // let nodeProps = {
  //   left: props.x,
  //   top: props.y + 20,
  //   src: popup
  // }
  //
  // let win = BrowserWindow.getFocusedWindow()
  // if (!win) {
  //   return
  // }
  //
  // win.webContents.send(messages.NEW_POPUP_WINDOW, extensionId, popup, nodeProps)
})
