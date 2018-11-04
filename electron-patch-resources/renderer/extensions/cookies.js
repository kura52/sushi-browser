const {Event} = require('./event')
const {ipcFuncRenderer} = require('./util')
const {ipcRenderer} = require('electron')


class Cookies {
  constructor (extensionId, chrome) {
    this._extensionId = extensionId
    this._chrome = chrome

    this.initEvents()
  }

  initEvents(){
    this.onChanged = new Event()

    ipcRenderer.on('CHROME_COOKIES_ONCHANGED', (event, changeInfo) => {
      this.onChanged.emit(changeInfo)
    })
  }

  get(details, callback){
    ipcFuncRenderer(this.constructor.name, 'get', callback, details)
  }

  getAll(details, callback){
    ipcFuncRenderer(this.constructor.name, 'getAll', callback, details)
  }

  set(details, callback){
    ipcFuncRenderer(this.constructor.name, 'set', callback, details)
  }

  remove(details, callback){
    ipcFuncRenderer(this.constructor.name, 'remove', callback, details)
  }

  getAllCookieStores(callback){
    this._chrome.windows.getAll({populate:true},wins=>{
      const tabIds = []
      for(let win of wins) tabIds.push(...win.tabs.map(t=>t.id))
      callback([{id:"0", tabIds}])
    })
  }
  
}

exports.setup = (...args) => {
  return new Cookies(...args)
}
