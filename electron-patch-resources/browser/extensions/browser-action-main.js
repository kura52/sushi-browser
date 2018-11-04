const {ipcFuncMainCb, getIpcNameFunc, shortId} = require('./util-main')
const {ipcMain} = require('electron')
const getIpcName = getIpcNameFunc('browserAction')

module.exports = function(sendToBackgroundPage, getTabValue) {

  ipcMain.on('chrome-browserAction-onClicked', (e, extensionId, tabId)=>{
    sendToBackgroundPage(extensionId, getIpcName('onClicked'), getTabValue(tabId))
  })

  ipcFuncMainCb('browserAction', 'getInfo', (e, extensionId, details, property, cb)=> {
    for (let win of BrowserWindow.getAllWindows()) {
      if (win.getTitle().includes('Sushi Browser')) {
        if (!win.webContents.isDestroyed()){
          const key = shortId()
          win.webContents.send(`chrome-browser-action-get-info-${extensionId}`, key, details)
          ipcMain.once(`chrome-browser-action-get-info-${extensionId}-reply_${key}`,(e, info) => {
            cb(info[property])
          })
        }
      }
    }
    cb()
  })

  ipcFuncMainCb('browserAction', 'enable', (e, extensionId, tabId, value, cb)=> {
    for (let win of BrowserWindow.getAllWindows()) {
      if (win.getTitle().includes('Sushi Browser')) {
        if (!win.webContents.isDestroyed()){
          win.webContents.send(`chrome-browser-action-enable-${extensionId}`, tabId, value)
        }
      }
    }
    cb()
  })


}