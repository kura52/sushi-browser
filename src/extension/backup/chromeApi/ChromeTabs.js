import {BrowserWindow,ipcMain} from 'electron'
import uuid from "node-uuid"

const getCurrentWindow = ()=> {
  const focus = BrowserWindow.getFocusedWindow()
  if(focus && focus.getTitle().includes('Sushi Browser')) return focus
  return BrowserWindow.getAllWindows().find(w=>w.getTitle().includes('Sushi Browser'))

}
function getCurrentWebContents(bWin){
  const key = uuid.v4()
  bWin.webContents.send("chrome-tabs-query",key,{activeTabinActivePanel: true})
  return new Promise((resolve)=> {
    ipcMain.once(`chrome-tabs-query-res_${key}`, (e, tabs)=> {
      console.log('1chrome-tabs-query-res', key,tabs)
      resolve(tabs.length == 1 ? tabs[0] : {})
    })
  })
}

export default class ChromeTabs {
  constructor(appId){
    this.appId = appId
    this.callbacks = {}
  }

  addEvent(msg) {
    const addListener = (callback)=>{
      if (!this.callbacks[msg]) {
        this.callbacks[msg] = [callback]
        ipcMain.on(msg, (e, ...args)=> {
          for (let callback of this.callbacks[msg]) {
            callback(...args)
          }
        })
      }
      else{
        this.callbacks[msg].push(callback)
      }
    }

    const hasListener = (callback) => {
      this.callbacks[msg] ? this.callbacks[msg].includes(callback) : false
    }

    return {
      addListener,
      hasListener: (callback) => this.callbacks[fname] ? this.callbacks[fname].includes(callback) : false
    }
  }

  getAllInWindow(windowId,callback){
    console.log(windowId)
    const bWin = BrowserWindow.fromId(windowId / 100000)
    const key = uuid.v4()
    console.log('2chrome-tabs-query', key, {})
    ipcMain.once(`chrome-tabs-query-res_${key}`,(e,tabs)=>{
      // console.log('2chrome-tabs-query-res', key, tabs)
      callback(tabs)
    })
    bWin.webContents.send('chrome-tabs-query', key, {panelId: windowId % 100000})
  }

  get(tabId,callback){
    this.query({tabId},callback)
  }

  query({tabId, url, windowId, index},callback){
    let ret = [];
    const bWin = windowId ? BrowserWindow.fromId(windowId / 100000) : getCurrentWindow()
    if(!bWin){
      console.log(tabId, url, windowId, index)
      return
    }
    const key = uuid.v4()
    console.log('chrome-tabs-query', key, {tabId, url, index})
    ipcMain.once(`chrome-tabs-query-res_${key}`, (e, tabs)=> {
      console.log('chrome-tabs-query-res', key, tabs)
      callback(tabId ? tabs[0] : tabs)
    })
    const cond = {tabId, url, index}
    if(windowId){
      cond.panelId = windowId % 100000
    }
    else if(!tabId){
      cond.activePanel = true
    }
    bWin.webContents.send('chrome-tabs-query', key, cond)
  }

  //@TODO options
  sendMessage(tabId, message, responseCallback){
    console.log(tabId, message)
    ipcMain.once(`chrome-msg-to-tabs-reply:${this.appId}:${this.tab.id}`,(e,response)=>{
      responseCallback(response)
    })

    for(let win of BrowserWindow.getAllWindows()){
      win.webContents.send(`chrome-msg-to-tabs:${this.appId}:${this.tab.id}`, message, responseCallback)
    }
  }

  get onRemoved() {
    return ::this.addEvent('chrome-tab-removed')
  }

  get onSelectionChanged(){
    return ::this.addEvent('chrome-tab-selectionChanged')
  }

  get onUpdated(){
    return ::this.addEvent('chrome-tab-updated')
  }

  get onActivated(){
    return ::this.addEvent('chrome-tab-selectionChanged')
  }

  reload(reloadProperties,callback){
    const key = uuid.v4()
    getCurrentWebContents(getCurrentWindow()).then((tab)=>{
      getCurrentWindow().webContents.send(`chrome-tab-event`, key, 'reload',{contId: tab.contId,...reloadProperties})
    })
  }
  create(createProperties, callback){
    const key = uuid.v4()
    if(callback){
      ipcMain.once(`chrome-tab-event-reply:${key}`,(e,response)=>{
        callback(response)
      })
    }
    getCurrentWebContents(getCurrentWindow()).then((tab)=>{
      getCurrentWindow().webContents.send(`chrome-tab-event`, key, 'create',{contId: tab.contId,...createProperties},!!callback)
    })
  }
  remove(tabIds, callback){
    if(!isNaN(tabIds)) tabIds = [tabIds]
    const key = uuid.v4()
    if(callback){
      ipcMain.once(`chrome-tab-event-reply:${key}`,(e,response)=>{
        callback(response)
      })
    }
    getCurrentWebContents(getCurrentWindow()).then((tab)=>{
      getCurrentWindow().webContents.send(`chrome-tab-event`, key, 'remove',{contId: tab.contId, tabIds},!!callback)
    })
  }

  executeScript(tabId, details, callback){
    if(isNaN(arguments[0])){
      details = arguments[0]
      callback = arguments[1]
    }

    const key = uuid.v4()
    if(callback){
      ipcMain.once(`chrome-tab-event-reply:${key}`,(e,response)=>{
        callback(response)
      })
    }
    getCurrentWebContents(getCurrentWindow()).then((tab)=>{
      getCurrentWindow().webContents.send(`chrome-tab-event`, key, 'executeScript',{contId: tab.contId,tabId, ...details},!!callback)
    })
  }


}
