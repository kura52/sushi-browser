const {Event} = require('./event')
const {ipcFuncRenderer} = require('./util')
const {ipcRenderer} = require('electron')

class BrowserAction {
  constructor(extensionId) {
    this._extensionId = extensionId
    this.onClicked = new Event()

    ipcRenderer.on('CHROME_BROWSERACTION_ONCLICKED',(e, tab)=>{
      this.onClicked.emit(tab)
    })
  }

  setTitle(details, callback){
    ipcRenderer.send('chrome-browser-action-set-title', this._extensionId, details)
  }

  getTitle(details, callback){
    ipcFuncRenderer(this.constructor.name, 'getInfo', callback, this._extensionId, details, 'title')
  }

  setIcon(details, callback){
    ipcRenderer.send('chrome-browser-action-set-icon', this._extensionId, details)
  }

  setPopup(details, callback){
    ipcRenderer.send('chrome-browser-action-set-popup', this._extensionId, details)
  }

  getPopup(details, callback){
    ipcFuncRenderer(this.constructor.name, 'getInfo', callback, this._extensionId, details, 'popup')
  }

  setBadgeText(details, callback){
    ipcRenderer.send('chrome-browser-action-set-badge-text', this._extensionId, details)
  }

  getBadgeText(details, callback){
    ipcFuncRenderer(this.constructor.name, 'getInfo', callback, this._extensionId, details, 'text')
  }

  setBadgeBackgroundColor(details, callback){
    ipcRenderer.send('chrome-browser-action-set-badge-background-color', this._extensionId, details)
  }

  getBadgeBackgroundColor(details, callback){
    ipcFuncRenderer(this.constructor.name, 'getInfo', callback, this._extensionId, details, 'color')
  }

  enable(tabId, callback){
    ipcFuncRenderer(this.constructor.name, 'enable', callback, this._extensionId, tabId, true)
  }

  disable(tabId, callback){
    ipcFuncRenderer(this.constructor.name, 'enable', callback, this._extensionId, tabId, false)
  }

}

exports.setup = (...args) => {
  return new BrowserAction(...args)
}
