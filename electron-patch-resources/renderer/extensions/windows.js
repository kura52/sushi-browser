const {Event} = require('./event')
const {getIpcNameFunc, ipcFuncRenderer, shortId, simpleIpcFunc, deepEqual} = require('./util')
const {ipcRenderer} = require('electron')
const Window = require('./window')


const convertUrlMap = {
  'chrome://bookmarks/': 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite.html',
  'chrome://history/': 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/history.html',
  'about:blank': 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/blank.html',
  'chrome://bookmarks-sidebar/': 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite_sidebar.html',
  'chrome://tab-history-sidebar/': 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/tab_history_sidebar.html',
  'chrome://tab-trash-sidebar/':'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/tab_trash_sidebar.html',
  'chrome://download-sidebar/':'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/download_sidebar.html',
  'chrome://note-sidebar/':'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/note_sidebar.html',
  'chrome://note/':'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/note.html',
  'chrome://session-manager-sidebar/': 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/saved_state_sidebar.html',
  'chrome://history-sidebar/': 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/history_sidebar.html',
  'chrome://explorer/': 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/explorer.html',
  'chrome://explorer-sidebar/': 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/explorer_sidebar.html',
  'chrome://download/': 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/download.html',
  'chrome://terminal/': 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/terminal.html',
  'chrome://converter/': 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/converter.html',
  'chrome://automation/': 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/automation.html',
  'chrome://settings/': 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html',
  'chrome://settings#general': 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#general',
  'chrome://settings#search': 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#search',
  'chrome://settings#tabs': 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#tabs',
  'chrome://settings#keyboard': 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#keyboard',
  'chrome://settings#extensions': 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/settings.html#extensions',
}

class Windows {
  constructor (extensionId) {
    this._extensionId = extensionId

    this.initEvents()

    for(let name of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) this[name] = name == 'constructor' ? this[name] : this[name].bind(this)
  }

  initEvents(){
    for(let event of ['onCreated', 'onRemoved', 'onFocusChanged']){
      this[event] = new Event()
    }

    ipcRenderer.on('CHROME_WINDOWS_ONCREATED', (event, window) => {
      this.onCreated.emit(window)
    })
    ipcRenderer.on('CHROME_WINDOWS_ONREMOVED', (event, windowId) => {
      this.onRemoved.emit(windowId)
    })
    ipcRenderer.on('CHROME_WINDOWS_ONFOCUSCHANGED', (event, windowId) => {
      this.onFocusChanged.emit(windowId)
    })
  }

  get(windowId, getInfo, callback){
    if(typeof getInfo === 'function') [getInfo,callback] = [null,getInfo]
    ipcFuncRenderer(this.constructor.name, 'get', callback, windowId, getInfo)
  }

  getCurrent(getInfo, callback){
    if(typeof getInfo === 'function') [getInfo,callback] = [null,getInfo]
    ipcFuncRenderer(this.constructor.name, 'getCurrent', callback, getInfo)
  }

  getLastFocused(getInfo, callback){
    ipcFuncRenderer(this.constructor.name, 'getLastFocused', (windowId)=>{
      this.get(windowId, getInfo, callback)
    })
  }

  getAll(getInfo, callback){
    if(typeof getInfo === 'function') [getInfo,callback] = [null,getInfo]
    getInfo = getInfo || {}

    ipcFuncRenderer(this.constructor.name, 'getAll', callback, getInfo)
  }

  create(createData, callback){
    if (typeof createData === 'function') [createData, callback] = [null, createData]
    console.log(2224, createData)
    if (createData && createData.url){
      if (!createData.url.includes("://")) {
        createData.url = `chrome-extension://${this._extensionId}/${createData.url.split("/").filter(x => x).join("/")}`
      }
      createData.url = convertUrlMap[createData.url] || createData.url
    }
    ipcFuncRenderer(this.constructor.name, 'create', callback, createData)
  }

  update(windowId, updateInfo, callback){
    ipcFuncRenderer(this.constructor.name, 'update', callback, windowId, updateInfo)

  }

  remove(windowId, callback){
    ipcFuncRenderer(this.constructor.name, 'remove', callback, windowId)
  }

  hostClose(){
    ipcRenderer.send('send-to-host', 'window-close', {})
  }

}

exports.setup = (...args) => {
  return new Windows(...args)
}
