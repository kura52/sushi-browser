function simpleIpcFunc(name,callback,...args){
  const key = Math.random().toString()
  chrome.ipcRenderer.once(`${name}-reply_${key}`,(event,...results)=>{
    if(callback) callback(...results)
  })
  chrome.ipcRenderer.send(name,key,...args)
}

chrome.i18n.getAcceptLanguages = callback=> simpleIpcFunc('chrome-i18n-getAcceptLanguages',callback)
chrome.i18n.getUILanguage = chrome.i18n.getAcceptLanguages //@TODO

chrome.i18n._getMessage = chrome.i18n.getMessage

chrome.i18n.getMessage = (messageName) => {
  if(chrome.i18n._messages_ === false){
    return chrome.i18n._getMessage(messageName)
  }
  else if(!chrome.i18n._messages_){
    chrome.i18n._messages_ = chrome.ipcRenderer.sendSync('chrome-i18n-getMessage')
  }
  const msg = chrome.i18n._messages_[messageName]
  return msg ? msg.message : chrome.i18n._getMessage(messageName)
}

chrome.i18n.detectLanguage = (inputText,callback) => simpleIpcFunc('chrome-i18n-detectLanguage',callback,inputText)

chrome.extension.isAllowedFileSchemeAccess = (callback)=> callback(true)

if(chrome.contextMenus) {
  chrome.contextMenus._create = chrome.contextMenus.create
  chrome.contextMenus.create = (...args) => {
    console.log({...args[0]})
    const ipcSendVal = {}
    if (args[0] && Object.prototype.toString.call(args[0]) == "[object Object]") {
      if(args[0].checked !== void 0){
        ipcSendVal.checked = args[0].checked
        delete args[0].checked
      }
      if(args[0].documentUrlPatterns !== void 0){
        ipcSendVal.documentUrlPatterns = args[0].documentUrlPatterns
        delete args[0].documentUrlPatterns
      }
      if(args[0].targetUrlPatterns !== void 0){
        ipcSendVal.targetUrlPatterns = args[0].targetUrlPatterns
        delete args[0].targetUrlPatterns
      }
      if(args[0].enabled !== void 0){
        ipcSendVal.enabled = args[0].enabled
        delete args[0].enabled
      }
    }
    chrome.ipcRenderer.send('contextMenu-create-properties',chrome.runtime.id,args[0].id || args[0].menuItemId ,ipcSendVal)
    return chrome.contextMenus._create(...args)
  }

  chrome.contextMenus.update = (id, updateProperties, callback) => {
    console.log('chrome.contextMenus.update',id, updateProperties)
    simpleIpcFunc('chrome-context-menus-update',callback,chrome.runtime.id,id,updateProperties)
  }

  chrome.contextMenus.remove = (menuItemId, callback) => {
    console.log('chrome.contextMenus.remove',menuItemId)
    simpleIpcFunc('chrome-context-menus-remove',callback,chrome.runtime.id,menuItemId)
  }
}

if(chrome.windows){
  chrome.windows._getAll = chrome.windows.getAll
  chrome.windows.getAll = (getInfo, callback)=>{
    if(typeof getInfo === 'function') [getInfo,callback] = [null,getInfo]
    getInfo = getInfo || {}
    chrome.windows._getAll(getInfo, callback)
  }


  chrome.windows._getCurrent = chrome.windows.getCurrent
  chrome.windows.getCurrent = (getInfo, callback)=>{
    if(typeof getInfo === 'function') [getInfo,callback] = [null,getInfo]
    getInfo = getInfo || {}
    chrome.windows._getCurrent(getInfo, window=>{
      callback(window.id === -1 ? undefined : window)
    })
  }


  chrome.windows.get = (windowId, getInfo, callback) =>{
    if(typeof getInfo === 'function') [getInfo,callback] = [null,getInfo]

    chrome.windows.getAll(getInfo, windows=>{
      if(!windows) callback(null)
      for(let window of windows){
        if(window.id == windowId){
          callback(window)
          return
        }
      }
      callback(null)
    })
  }
  chrome.windows.getLastFocused = (getInfo,callback) => {
    simpleIpcFunc('chrome-windows-getLastFocused',(windowId)=>{
      chrome.windows.get(windowId, getInfo, callback)
    })
  }

  chrome.windows.create = (createData,callback)=>{
    if(typeof createData === 'function') [createData,callback] = [null,createData]

    const key = Math.random().toString()
    const name = 'chrome-windows-create'
    chrome.ipcRenderer.once(`${name}-reply_${key}`,(event)=>{
      setTimeout(_=>chrome.windows.getCurrent({},callback),2000)
    })
    chrome.ipcRenderer.send(name,key,createData)
  }

}

if(chrome.tabs){
  chrome.tabs.reload = (tabId, reloadProperties, callback)=>{
    if(!isFinite(tabId)){
      if(Object.prototype.toString.call(tabId)=="[object Object]"){
        [tabId,reloadProperties,callback] = [null,tabId,reloadProperties]
      }
      else if(typeof tabId === 'function'){
        [tabId,reloadProperties,callback] = [null,null,tabId]
      }
    }
    if(typeof tabId === 'function'){
      [reloadProperties,callback] = [null,reloadProperties]
    }
    simpleIpcFunc('chrome-tabs-reload',callback,tabId, reloadProperties)

  }

  chrome.tabs.getAllInWindow = (windowId, callback)=>{
    if(typeof windowId === 'function') [windowId,callback] = [null,windowId]
    chrome.tabs.query(windowId ? {windowId} : {},callback)
  }

  chrome.tabs.detectLanguage = (tabId, callback)=>{
    if(typeof tabId === 'function') [tabId,callback] = [null,tabId]

    console.log(tabId)
    chrome.tabs.get(tabId, tab=>{
      simpleIpcFunc('chrome-tabs-detectLanguage',callback,tabId)
    })
  }

  chrome.tabs.captureVisibleTab = (windowId,options,callback) => {
    if(!isFinite(windowId)){
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
    chrome.tabs.query(windowId ? {windowId} : {},tabs=>{
      if(tabs && tabs.length){
        for(let tab of tabs){
          if(tab.active){
            simpleIpcFunc('chrome-tabs-captureVisibleTab',callback,tab.id,options)
            return
          }
        }
      }
    })
  }

  chrome.tabs.insertCSS = (tabId,details,callback) => {
    if(!isFinite(tabId)){
      if(Object.prototype.toString.call(tabId)=="[object Object]"){
        [tabId,details,callback] = [null,tabId,details]
      }
    }
    simpleIpcFunc('chrome-tabs-insertCSS',callback,chrome.runtime.id,tabId,details)
  }

  const ipc = chrome.ipcRenderer
  const extensionId = chrome.runtime.id

  const onUpdated = {}, onCreated = {}, onRemoved = {}, onActivated = {},
    onSelectionChanged = {}, onActiveChanged = {}

  chrome.tabs.onUpdated = {
    addListener: function (cb) {
      onUpdated[cb] = function(evt, tabId, changeInfo, tab) {
        cb(tabId, changeInfo, tab);
      }
      ipc.send('register-chrome-tabs-updated', extensionId);
      ipc.on('chrome-tabs-updated', onUpdated[cb])
    },
    removeListener: function(cb){
      ipc.removeListener('chrome-tabs-updated', onUpdated[cb])
    }
  }
  chrome.tabs.onCreated = {
    addListener: function (cb) {
      onCreated[cb] = function(evt, tab) {
        cb(tab)
      }
      ipc.send('register-chrome-tabs-created', extensionId);
      ipc.on('chrome-tabs-created', onCreated[cb])
    },
    removeListener: function(cb){
      ipc.removeListener('chrome-tabs-created', onCreated[cb])
    }
  }
  chrome.tabs.onRemoved = {
    addListener: function (cb) {
      onRemoved[cb] = function (evt, tabId, removeInfo) {
        cb(tabId, removeInfo)
      }
      ipc.send('register-chrome-tabs-removed', extensionId);
      ipc.on('chrome-tabs-removed', onRemoved[cb])
    },
    removeListener: function(cb){
      ipc.removeListener('chrome-tabs-removed', onRemoved[cb])
    }
  }
  chrome.tabs.onActivated = {
    addListener: function (cb) {
      onActivated[cb] = function (evt, tabId, activeInfo) {
        cb(activeInfo)
      }
      ipc.send('register-chrome-tabs-activated', extensionId)
      ipc.on('chrome-tabs-activated', onActivated[cb])
    },
    removeListener: function(cb){
      ipc.removeListener('chrome-tabs-activated', onActivated[cb])
    }
  }
  chrome.tabs.onSelectionChanged = {
    addListener: function (cb) {
      onSelectionChanged[cb] = function (evt, tabId, selectInfo) {
        cb(tabId, selectInfo)
      }
      ipc.send('register-chrome-tabs-activated', extensionId)
      ipc.on('chrome-tabs-activated', onSelectionChanged[cb])
    },
    removeListener: function(cb){
      ipc.removeListener('chrome-tabs-activated', onSelectionChanged[cb])
    }
  }
  chrome.tabs.onActiveChanged = {
    addListener: function (cb) {
      onActiveChanged[cb] = function (evt, tabId, selectInfo) {
        cb(tabId, selectInfo)
      }
      ipc.send('register-chrome-tabs-activated', extensionId)
      ipc.on('chrome-tabs-activated', onActiveChanged[cb])
    },
    removeListener: function(cb){
      ipc.removeListener('chrome-tabs-activated', onActiveChanged[cb])
    }
  }
}


if(chrome.cookies){
  chrome.cookies._set = chrome.cookies.set

  chrome.cookies.set = (details, callback)=>{
    if(!callback) return chrome.cookies._set(details, callback)

    chrome.cookies._set(details,cookie=>{
      if(cookie){
        callback(cookie)
      }
      else{
        chrome.cookies.get({name: details.name,url:details.url},callback)
      }
    })
  }
  chrome.cookies.remove = (details, callback)=>{
    simpleIpcFunc('chrome-cookies-remove',callback,details)
  }
}

if(chrome.management){
  chrome.management.getAll = (callback) => simpleIpcFunc('chrome-management-getAll',callback)
  chrome.management.get = (id,callback) => simpleIpcFunc('chrome-management-get',callback,id)
  chrome.management.getSelf = (callback) => simpleIpcFunc('chrome-management-get',callback,chrome.runtime.id)
}

if(chrome.webRequest){
  const ipc = chrome.ipcRenderer
  const extensionId = chrome.runtime.id
  const methods = ['onBeforeRequest','onBeforeSendHeaders','onSendHeaders','onHeadersReceived','onResponseStarted','onBeforeRedirect','onCompleted','onErrorOccurred']

  for(let method of methods){
    const ipcEvents = {}
    const keys = {}
    chrome.webRequest[methods] = {
      addListener: function (cb) {
        console.log(methods)
        keys[cb] = Math.random.toString()
        ipcEvents[cb] = function (e, key2, details) {
          console.log(details)
          ipc.send(`chrome-webRequest-${method}_${keys[cb]}-reply_${key2}`,cb(details))
        }
        ipc.send(`register-chrome-webRequest-${method}`,extensionId, keys[cb])
        ipc.on(`chrome-webRequest-${method}_${keys[cb]}`, ipcEvents[cb])
      },
      removeListener: function(cb){
        ipc.send(`unregister-chrome-webRequest-${method}`,extensionId, keys[cb])
        ipc.removeListener(`chrome-webRequest-${method}_${keys[cb]}`, ipcEvents[cb])
      }
    }
  }

}
// if(!chrome.types) chrome.types = {}
// if(!chrome.types.ChromeSetting) chrome.types.ChromeSetting = {}
// chrome.types.ChromeSetting.set = (details, callback) =>{
//   console.log('chrome.types.ChromeSetting.set is not implemented ')
//   if(callback) callback()
// }
//
// chrome.types.ChromeSetting.get = (details, callback) =>{
//   console.log('chrome.types.ChromeSetting.get is not implemented ')
//   if(callback) callback()
// }