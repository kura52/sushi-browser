import { app, Menu, clipboard, BrowserWindow, ipcMain, session,webContents } from 'electron'
const uuid = require("node-uuid")
const sharedState = require('./sharedStateMain')

function getCurrentWindow(){
  const focus = BrowserWindow.getFocusedWindow()
  if(focus && focus.getTitle().includes('Sushi Browser')) return focus
  return BrowserWindow.getAllWindows().find(w=>w.getTitle().includes('Sushi Browser'))
}

function getFocusedWebContents(needSelectedText,skipBuildInSearch,callback,retry=0){
  let cont
  if(!skipBuildInSearch){
    const tmp = webContents.getFocusedWebContents()
    if(tmp && !tmp.isDestroyed() /*&& !tmp.isBackgroundPage()*/ && !(/*tmp.tabValue().openerTabId == -1 && */ tmp.getURL().match(/^(chrome\-extension|chrome\-devtools)/))) { //@TODO ELECTRON
      if(tmp.hostWebContents2){
        return new Promise(resolve=>resolve(tmp))
      }
      else if(tmp.isRoot){
        cont = tmp
      }
    }
  }

  if(!cont){
    let win = getCurrentWindow()
    if(!win){
      // const key = uuid.v4()
      if(callback){
        return setTimeout(_=>getFocusedWebContents(needSelectedText,skipBuildInSearch,callback,++retry),300)
      }
      else{
        return new Promise((resolve,reject)=>{
          setTimeout(_=>getFocusedWebContents(needSelectedText,skipBuildInSearch,resolve,++retry),300)
        })
      }
    }
    cont = win.webContents
  }
  const key = uuid.v4()

  if(callback){
    ipcMain.once(`get-focused-webContent-reply_${key}`,(e,tabId)=>{
      if(tabId < 1){
        setTimeout(_=>getFocusedWebContents(needSelectedText,skipBuildInSearch,callback,++retry),300)
      }
      else{
        callback((sharedState[tabId] || webContents.fromId(tabId)))
      }
    })
    cont.send('get-focused-webContent',key,void 0,needSelectedText,void 0,retry)
  }
  else{
    return new Promise((resolve,reject)=>{
      ipcMain.once(`get-focused-webContent-reply_${key}`,(e,tabId)=>{
        if(tabId < 1){
          console.log('tabId',tabId,retry)
          setTimeout(_=>getFocusedWebContents(needSelectedText,skipBuildInSearch,resolve,++retry),300)
        }
        else{
          const cont = (sharedState[tabId] || webContents.fromId(tabId))
          resolve(cont)
        }
      })
      cont.send('get-focused-webContent',key,void 0,needSelectedText,void 0,retry)
    })
  }
}

export default {
  getFocusedWebContents,
  getCurrentWindow
}