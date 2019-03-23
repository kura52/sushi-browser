import {ipcMain,dialog,BrowserWindow } from 'electron'
import {webContents} from './remoted-chrome/BrowserView'
import {getCurrentWindow } from './util'
import uuid from 'node-uuid'
import mainState from "./mainState";
import db from "./databaseFork";
const contextAlert = new Set()

// function messageBox(webContents, message, cb, buttons) {
//   const tabId = webContents.id
//   const key = uuid.v4()
//   console.log('show-notification',tabId)
//   webContents.hostWebContents2.send('show-notification', {id:tabId,key, text: message, buttons, style:{top:50}})
//   ipcMain.once(`reply-notification-${key}`, (e, ret) => {
//     cb(ret.pressIndex === 0, '', false)
//   })
// }

function messageBox(_webContents, title, message, cb, buttons, type) {
  const key = uuid.v4()
  const tabId = _webContents.id
  const url = _webContents.getURL()
  ;(_webContents.hostWebContents2 || _webContents).send('show-notification',{key,text:message, title, windowDialog: true, buttons,id:tabId})

  ipcMain.once(`reply-notification-${key}`, (e, ret) => {
    cb(ret.pressIndex === 0, '', false)
    ipcMain.emit(`reply-dialog`,null,{key,title,message,result:ret.pressIndex === 0,tabId,url,now:Date.now()})
  })

  for(let cont of webContents.getAllWebContents()){
    if(!cont.isDestroyed() /*&& !cont.isBackgroundPage()*/ && cont.hostWebContents2) {
      if(cont.getURL().startsWith('chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/automation.html')){
        cont.send(`start-dialog`,{key,title,message,buttons,tabId,url,type})
      }
    }
  }
}

ipcMain.on('add-context-alert',(e,key)=> contextAlert.add(key))

process.on('window-alert', (webContents, extraData, title, message, defaultPromptText,
                            shouldDisplaySuppressCheckbox, isBeforeUnloadDialog, isReload, cb) => {
  const key = message && message.slice(0,36)
  if(contextAlert.has(key)){
    cb(true, '', false)
    ipcMain.emit(`add-context-alert-reply_${key}`,null,JSON.parse(message.slice(36)).a)
    contextAlert.delete()
  }
  else{
    messageBox(webContents, title, message, cb, ['ok'], 'alert');
  }
})


process.on('window-confirm', (webContents, extraData, title, message, defaultPromptText,
                              shouldDisplaySuppressCheckbox, isBeforeUnloadDialog, isReload, cb) => {
  messageBox(webContents, title, message, cb, ['ok','cancel'], 'confirm');
})

process.on('window-prompt', (webContents, extraData, title, message, defaultPromptText,
                             shouldDisplaySuppressCheckbox, isBeforeUnloadDialog, isReload, cb) => {
  console.warn('window.prompt is not supported yet')
  let suppress = false
  cb(false, '', suppress)
})