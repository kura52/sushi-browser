import {ipcMain,dialog,BrowserWindow } from 'electron'
import {getCurrentWindow } from './util'
import uuid from 'node-uuid'


// function messageBox(webContents, message, cb, buttons) {
//   const tabId = webContents.getId()
//   const key = uuid.v4()
//   console.log('show-notification',tabId)
//   webContents.hostWebContents.send('show-notification', {id:tabId,key, text: message, buttons, style:{top:50}})
//   ipcMain.once(`reply-notification-${key}`, (e, ret) => {
//     cb(ret.pressIndex === 0, '', false)
//   })
// }

function messageBox(webContents, message, cb, buttons) {
  let bw = BrowserWindow.fromWebContents(webContents.hostWebContents || webContents)
  if(!bw) bw = getCurrentWindow()
  console.log(55551,message,buttons,bw)
  dialog.showMessageBox(bw, {
    type: 'info',
    buttons,
    title: 'Dialog',
    message: message
  },ret=>cb(ret === 0, '', false));
}

process.on('window-alert', (webContents, extraData, title, message, defaultPromptText,
                            shouldDisplaySuppressCheckbox, isBeforeUnloadDialog, isReload, cb) => {
  messageBox(webContents, message, cb, ['ok']);
})

process.on('window-confirm', (webContents, extraData, title, message, defaultPromptText,
                              shouldDisplaySuppressCheckbox, isBeforeUnloadDialog, isReload, cb) => {
  messageBox(webContents, message, cb, ['ok','cancel']);
})

process.on('window-prompt', (webContents, extraData, title, message, defaultPromptText,
                             shouldDisplaySuppressCheckbox, isBeforeUnloadDialog, isReload, cb) => {
  console.warn('window.prompt is not supported yet')
  let suppress = false
  cb(false, '', suppress)
})