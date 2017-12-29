import { app, Menu, clipboard, BrowserWindow, ipcMain, session,webContents } from 'electron'
const uuid = require("node-uuid")

function getCurrentWindow(){
  const focus = BrowserWindow.getFocusedWindow()
  if(focus && focus.getTitle().includes('Sushi Browser')) return focus
  return BrowserWindow.getAllWindows().find(w=>w.getTitle().includes('Sushi Browser'))
}

function getFocusedWebContents(needSelectedText,skipBuildInSearch,callback){
  let cont
  if(!skipBuildInSearch){
    const tmp = webContents.getFocusedWebContents()
    if(tmp && !tmp.isDestroyed() && !tmp.isBackgroundPage()) {
      if(tmp.isGuest()){
        return new Promise(resolve=>resolve(tmp))
      }
      else{
        cont = tmp
      }
    }
  }

  if(!cont){
    let win = getCurrentWindow()
    if(!win){
      // const key = uuid.v4()
      return new Promise((resolve,reject)=>{
        setTimeout(_=>getFocusedWebContents(needSelectedText,skipBuildInSearch,resolve),500)
      })
    }
    cont = win.webContents
  }
  const key = uuid.v4()
  return new Promise((resolve,reject)=>{
    ipcMain.once(`get-focused-webContent-reply_${key}`,(e,tabId)=>{
      if(tabId < 1){
        setTimeout(_=>getFocusedWebContents(needSelectedText,skipBuildInSearch,resolve),500)
      }
      else{
        resolve(webContents.fromTabID(tabId))
      }
    })
    cont.send('get-focused-webContent',key,void 0,needSelectedText)
  })

}

export default {
  getFocusedWebContents,
  getCurrentWindow
}