import { app, Menu, clipboard, BrowserWindow, ipcMain, session,webContents } from 'electron'
const uuid = require("node-uuid")

function getCurrentWindow(){
  const focus = BrowserWindow.getFocusedWindow()
  if(focus && focus.getTitle().includes('Sushi Browser')) return focus
  return BrowserWindow.getAllWindows().find(w=>w.getTitle().includes('Sushi Browser'))
}

function getFocusedWebContents(){
  let cont
  const tmp = webContents.getFocusedWebContents()
  if(tmp && !tmp.isDestroyed() && !tmp.isBackgroundPage()) {
    if(tmp.isGuest()){
      return new Promise(resolve=>resolve(tmp))
    }
    else{
      cont = tmp
    }
  }

  if(!cont){
    const win = getCurrentWindow()
    cont = win.webContents
  }
  const key = uuid.v4()
  return new Promise((resolve,reject)=>{
    ipcMain.once(`get-focused-webContent-reply_${key}`,(e,tabId)=>{
      resolve(webContents.fromTabID(tabId))
    })
    cont.send('get-focused-webContent',key)
  })

}

export default {
  getFocusedWebContents,
  getCurrentWindow
}