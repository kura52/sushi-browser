const {Event} = require('./event')
const {ipcFuncRenderer, simpleIpcFunc} = require('./util')
const {ipcRenderer} = require('electron')


class Sessions {
  constructor (extensionId, chrome) {
    this._extensionId = extensionId
    this._chrome = chrome

    this.initEvents()

    for(let name of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) this[name] = name == 'constructor' ? this[name] : this[name].bind(this)
  }

  initEvents(){
    this.onChanged = new Event()

    ipcRenderer.on('CHROME_SESSIONS_ONCHANGED', (event, changeInfo) => {
      this.onChanged.emit(changeInfo)
    })
  }

  getRecentlyClosed(filter, callback){
    if(typeof filter === 'function') [filter,callback] = [null,filter]
    simpleIpcFunc('chrome-sessions-getRecentlyClosed',callback,filter)
  }

  restore(sessionId, callback){
    if(typeof sessionId === 'function') [sessionId,callback] = [null,sessionId]
    simpleIpcFunc('chrome-sessions-restore',(type,tabId)=>{
      if(type == "tab"){
        this._chrome.tabs.get(tabId,tab=>callback({lastModified:Date.now(),tab}))
      }
      else{
        callback({lastModified:Date.now(),window:{}}) //@TODO
      }
    },sessionId)
  }
  
}

exports.setup = (...args) => {
  return new Sessions(...args)
}
