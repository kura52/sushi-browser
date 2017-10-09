const {webContents,ipcMain} = require('electron')
const {getFocusedWebContents, getCurrentWindow} = require('../../lib/util')

process.on('chrome-browser-action-registered', (extensionId, details) => {
  console.log('chrome-browser-action-registered', extensionId, details)
})

process.on('chrome-browser-action-set-icon', (extensionId, details) => {
  console.log('chrome-browser-action-set-icon', extensionId, details)
  getFocusedWebContents().then(cont=>{
    if(cont && cont.hostWebContents) cont.hostWebContents.send(`chrome-browser-action-set-icon-ipc-${extensionId}`,details.tabId || cont.getId(),details)
  })
})

process.on('chrome-browser-action-set-badge-text', (extensionId, details) => {
  console.log('chrome-browser-action-set-badge-text', extensionId, details)
})

process.on('chrome-browser-action-set-badge-background-color', (extensionId, details) => {
  console.log('chrome-browser-action-set-badge-background-color', extensionId, details)
})

process.on('chrome-browser-action-set-title', (extensionId, details) => {
  console.log('chrome-browser-action-set-title', extensionId, details)
})

process.on('chrome-browser-action-popup', (extensionId, tabId, name, popup, props) => {
  console.log('chrome-browser-action-popup', extensionId, tabId, name, popup, props)
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
