import { app, Menu, clipboard, BrowserWindow, ipcMain, session } from 'electron'
import {Browser, BrowserPanel ,webContents} from './remoted-chrome/Browser'
const uuid = require("node-uuid")
const sharedState = require('./sharedStateMain')

function getCurrentWindow(){
  const focus = Browser.getFocusedWindow()
  if(focus && focus.getTitle().includes('Sushi Browser')) return focus
  return BrowserWindow.getAllWindows().find(w=>w.getTitle().includes('Sushi Browser'))
}

async function getFocusedWebContents(needSelectedText,skipBuildInSearch,callback,retry=0){
  let cont
  if(!skipBuildInSearch){
    // console.log(2222,await webContents.getFocusedWebContents)
    const tmp = await webContents.getFocusedWebContents()
    if(tmp && !tmp.isDestroyed() /*&& !tmp.isBackgroundPage()*/ && !(/*tmp.tabValue().openerTabId == -1 && */ tmp.getURL().match(/^(chrome\-devtools)/))) { //@TODO ELECTRON
      if(tmp.hostWebContents2){
        return new Promise(resolve=>resolve(tmp))
      }
      else if(tmp.root){
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

  const bw = BrowserWindow.fromWebContents(cont)
  if(bw){
    const panels = BrowserPanel.getBrowserPanelsFromBrowserWindow(bw)
    if(panels && panels.length == 1){
      const panel = panels[0]
      const tab = await panel.getActiveTab()
      if(tab){
        return callback ? callback(sharedState[tab.id] || webContents.fromId(tab.id)) :
          Promise.resolve(sharedState[tab.id] || webContents.fromId(tab.id))
      }
    }
  }

  console.log('getFocusedWebContents2')
  if(callback){
    console.log('getFocusedWebContents3')
    ipcMain.once(`get-focused-webContent-reply_${key}`,(e,tabId)=>{
      if(tabId < 1){
        console.log('tabId',tabId,retry)
        setTimeout(_=>getFocusedWebContents(needSelectedText,skipBuildInSearch,callback,++retry),300)
      }
      else{
        callback(sharedState[tabId] || webContents.fromId(tabId))
      }
    })
    cont.send('get-focused-webContent',key,void 0,needSelectedText,void 0,retry)
  }
  else{
    console.log('getFocusedWebContents4')
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