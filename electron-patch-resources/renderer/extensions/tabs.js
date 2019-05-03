const {Event} = require('./event')
const {getIpcNameFunc, ipcFuncRenderer, shortId, simpleIpcFunc, deepEqual} = require('./util')
const {ipcRenderer} = require('electron')
const Tab = require('./tab')
const Port = require('./port')

let nextId = 0

const convertUrlMap = {
  'chrome://bookmarks2/': 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite.html',
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

class Tabs {
  constructor (extensionId, manifest, isBackgroundPage, chrome, webContentsKey) {
    this._extensionId = extensionId
    this._manifest = manifest
    this._isBackgroundPage = isBackgroundPage
    this._webContentsKey = webContentsKey
    this._chrome = chrome
    this.tabValues = {}

    this.MutedInfoReason = {USER: "user", CAPTURE: "capture", EXTENSION: "extension"}
    this.ZoomSettingsMode = {AUTOMATIC: "automatic", MANUAL: "manual", DISABLED: "disabled"}
    this.ZoomSettingsScope = {PER_ORIGIN: "per-origin", PER_TAB: "per-tab"}
    this.TabStatus = {LOADING: "loading", COMPLETE: "complete"}
    this.WindowType = {NORMAL: "normal", POPUP: "popup", PANEL: "panel", APP: "app", DEVTOOLS: "devtools"}

    this.initEvents()

    for(let name of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) this[name] = name == 'constructor' ? this[name] : this[name].bind(this)
  }

  initEvents(){
    for(let event of [
      'onUpdated',
      'onCreated',
      'onRemoved',
      'onSelectionChanged',
      'onActiveChanged',
      'onActivated',
      'onHighlightChanged',
      'onHighlighted',

      'onReplaced',
      'onZoomChange'
    ]){
      this[event] = new Event()
    }

    for(let method of ['onMoved','onDetached','onAttached']){
      const name = `chrome-tabs-${method}`
      const ipcEvents = {}
      this[method] = {
        addListener(cb) {
          ipcEvents[cb] = (e, tabId, info) => cb(tabId, info)
          ipcRenderer.send(`regist-${name}`)
          ipcRenderer.on(name, ipcEvents[cb])
        },
        removeListener(cb){
          ipcRenderer.send(`unregist-${name}`)
          ipcRenderer.removeListener(name, ipcEvents[cb])
        },
        hasListener(cb){
          return !!ipcEvents[cb]
        },
        hasListeners(){
          return !!Object.keys(ipcEvents).length
        }
      }
    }
    // onReplaced
    // onZoomChange

    ipcRenderer.on('CHROME_TABS_ONCREATED', (event, tabId) => {
      console.log('CHROME_TABS_ONCREATED', tabId)
      const tab = Tab(tabId)
      console.log('CHROME_TABS_ONCREATED2')
      this.tabValues[tabId] = tab
      ipcRenderer.send('CHROME_TABS_ONCREATED', tab)
      this.onCreated.emit(tab)
      console.log(444,tabId, {status:'loading'}, tab)
      this.onUpdated.emit(tabId, {status:'loading'}, tab)
    })

    ipcRenderer.on('CHROME_TABS_ONREMOVED', (event, tabId) => {
      this.onRemoved.emit(tabId)
    })

    ipcRenderer.on('CHROME_TABS_ONUPDATED', (event, tabId) => {
      const tabValue = Tab(tabId)
      const oldTabInfo = this.tabValues[tabId] || {}
      let changeInfo = {}

      for (var key in tabValue) {
        if (!deepEqual(tabValue[key], oldTabInfo[key])) {
          changeInfo[key] = tabValue[key]
        }
      }

      if (Object.keys(changeInfo).length > 0) {
        const tab = Tab(tabId)
        this.onUpdated.emit(tabId, changeInfo, tab)
        if(changeInfo.active){
          for(let event of ['onSelectionChanged',
            'onActiveChanged',
            'onActivated',
            'onHighlightChanged',
            'onHighlighted']){
            if(this[event].listeners.length){
              this[event].emit({windowId: ipcRenderer.sendSync('get-browser-window-from-web-contents', tabId)})
            }
          }
        }
      }
    })
  }

  get(tabId, callback){
    setTimeout(()=>callback(Tab(tabId)),0)
  }

  getCurrent(callback){
    ipcFuncRenderer('tabs', 'getFocusedWebContents',tabId=>{
      callback(Tab(tabId))
    })
  }

  sendRequest(tabId, request, responseCallback){
    this.sendMessage(tabId, request, responseCallback)
  }

  getSelected(windowId, callback){
    if (!Number.isFinite(windowId) && windowId !== null && windowId !== void 0) {
      [windowId,callback] = [null,windowId]
    }
    this.query(windowId ? {active: true,windowId} : {active: true},tabs=>callback(tabs && tabs[0]))
  }

  getAllInWindow(windowId, callback){
    if(typeof windowId === 'function') [windowId,callback] = [null,windowId]
    this.query(windowId ? {windowId} : {}, callback)
  }

  create(createProperties, callback){
    if(createProperties){
      if(createProperties.url) {
        if(!createProperties.url.includes("://")) {
          createProperties.url = `chrome-extension://${chrome.runtime.id}/${createProperties.url.split("/").filter(x => x).join("/")}`
        }
        createProperties.url = convertUrlMap[createProperties.url] || createProperties.url
      }
      if(createProperties.selected !== void 0) {
        createProperties.active = createProperties.selected
      }
      if(createProperties.highlighted !== void 0) {
        createProperties.active = createProperties.highlighted
      }
    }
    ipcFuncRenderer(this.constructor.name, 'create', callback, createProperties)
  }

  duplicate(tabId, callback){
    const key = shortId()
    ipcRenderer.send('chrome-tabs-duplicate', key, tabId)
    ipcRenderer.once(`chrome-tabs-duplicate-reply_${key}`, (e, newTabId) => {
      callback(Tab(newTabId))
    })
  }

  query(queryInfo, callback){
    if(queryInfo.lastFocusedWindow !== void 0){
      delete queryInfo.lastFocusedWindow
    }
    if(queryInfo.windowType !== void 0){
      delete queryInfo.windowType
    }
    if(queryInfo.currentWindow == false){
      delete queryInfo.currentWindow
    }
    ipcFuncRenderer(this.constructor.name, 'query', callback, queryInfo)
  }

  highlight(highlightInfo, callback){
    let tabIds = highlightInfo.tabs
    if(Number.isFinite(tabIds)){
      tabIds = [tabIds]
    }
    for(let tabId of tabIds){
      this.update(tabId, {active: true}, ()=>callback([])) //@TODO FIX
    }
  }

  update(tabId, updateProperties, callback){
    const func = (tabId, updateProperties, callback)=>{
      if(updateProperties.muted !== void 0){
        ipcRenderer.send('set-audio-muted',tabId,updateProperties.muted,true)
      }
      updateProperties.active = updateProperties.active || updateProperties.highlighted ||updateProperties.selected
      ipcFuncRenderer(this.constructor.name, 'update', ()=>callback(Tab(tabId)), tabId, updateProperties)
    }

    if(!Number.isFinite(tabId) && tabId !== null && tabId !== void 0){
      [tabId,updateProperties,callback] = [null,tabId,updateProperties]
      simpleIpcFunc('chrome-tabs-current-tabId',tabId=>{
        func(tabId, updateProperties, callback)
      })
    }
    else if(!tabId){
      simpleIpcFunc('chrome-tabs-current-tabId',tabId=>{
        func(tabId, updateProperties, callback)
      })
    }
    else{
      func(tabId, updateProperties, callback)
    }
  }

  move(tabIds, moveProperties, callback){
    if(Number.isFinite(tabIds)){
      tabIds = [tabIds]
    }
    simpleIpcFunc('chrome-tabs-move',winIds=>{
      this._chrome.windows.getAll({populate:true},windows=>{
        const tabs = []
        for(let win of windows){
          if(!winIds.includes(win.id)) continue
          for(let tab of win.tabs){
            if(tabIds.includes(tab.id)) tabs.push(tab)
          }
        }
        if(callback) callback(tabs)
      })
    },tabIds, moveProperties)
  }

  reload(tabId, reloadProperties, callback){
    if(!Number.isFinite(tabId)){
      if(Object.prototype.toString.call(tabId)=="[object Object]" && tabId !== null && tabId !== void 0){
        [tabId,reloadProperties,callback] = [null,tabId,reloadProperties]
      }
      else if(typeof tabId === 'function'){
        [tabId,reloadProperties,callback] = [null,null,tabId]
      }
    }
    if(typeof tabId === 'function'){
      [reloadProperties,callback] = [null,reloadProperties]
    }
    ipcFuncRenderer(this.constructor.name, 'reload', callback, tabId, reloadProperties)
  }

  remove(tabIds, callback){
    if(Number.isFinite(tabIds)){
      tabIds = [tabIds]
    }
    ipcFuncRenderer(this.constructor.name, 'remove', callback, tabIds)
  }

  detectLanguage(tabId, callback){
    if(typeof tabId === 'function') [tabId,callback] = [null,tabId]

    this.get(tabId, tab=>{
      ipcFuncRenderer(this.constructor.name, 'detectLanguage', callback, tabId)
    })
  }

  captureVisibleTab(windowId, options, callback){
    if(!Number.isFinite(windowId)){
      if(Object.prototype.toString.call(windowId)=="[object Object]"){
        [windowId,options,callback] = [null,windowId,options]
      }
      else if(typeof windowId === 'function'){
        [windowId,options,callback] = [null,null,windowId]
      }
    }
    if(typeof windowId === 'function'){
      [options,callback] = [null,options]
    }
    this.query(windowId ? {windowId} : {},tabs=>{
      if(tabs && tabs.length){
        for(let tab of tabs){
          if(tab.active){
            ipcFuncRenderer(this.constructor.name, 'captureVisibleTab',callback,tab.id,options)
            return
          }
        }
      }
    })
  }

  insertCSS(tabId, details, callback){
    if(!Number.isFinite(tabId)){
      if(Object.prototype.toString.call(tabId)=="[object Object]"){
        [tabId,details,callback] = [null,tabId,details]
      }
    }
    ipcFuncRenderer('tabs', 'insertCSS',code=>{
      this.executeScript(tabId,{code},callback)
    },this._extensionId,tabId,details)
  }

  setZoom(tabId, zoomFactor, callback){
    ipcFuncRenderer('tabs', 'setZoom', callback, tabId, zoomFactor)
  }

  getZoom(tabId, callback){
    ipcFuncRenderer('tabs', 'getZoom', callback, tabId)
  }

  // setZoomSettings(tabId, zoomSettings, callback){} //@TODO NOOP
  // getZoomSettings(tabId, callback){} //@TODO NOOP
  // discard(tabId, callback){} //@TODO NOOP

  connect(tabId, connectInfo){
    const portId = ipcRenderer.send('CHROME_TABS_CONNECT', tabId, this._extensionId, connectInfo, this._webContentsKey)
    return new Port(tabId, portId, this.id, connectInfo.name)
  }

  saveAsPDF(pageSettings,callback){
    ipcFuncRenderer('tabs', 'saveAsPDF', callback, pageSettings)
  }

  executeScript (tabId, details, callback) {
    if (!Number.isFinite(tabId) && tabId !== null && tabId !== void 0) {
      [tabId,details,callback] = [null,tabId,details]
    }

    const requestId = ++nextId
    ipcRenderer.once(`CHROME_TABS_EXECUTESCRIPT_RESULT_${requestId}`, (event, result) => {
      // Disabled due to false positive in StandardJS
      // eslint-disable-next-line standard/no-callback-literal
      if(callback) callback([event.result])
    })
    ipcRenderer.send('CHROME_TABS_EXECUTESCRIPT', requestId, tabId, this._extensionId, details)
  }

  sendMessage (tabId, message, options, responseCallback) {
    if(typeof options == 'function'){
      responseCallback = options
    }
    const originResultID = shortId()
    if (responseCallback) {
      ipcRenderer.once(`CHROME_TABS_SEND_MESSAGE_RESULT_${originResultID}`, (event, result) => responseCallback(result))
    }
    ipcRenderer.send('CHROME_TABS_SEND_MESSAGE', tabId, this._extensionId, this._isBackgroundPage, message, originResultID, this._webContentsKey)
  }
}

exports.setup = (...args) => {
  return new Tabs(...args)
}
