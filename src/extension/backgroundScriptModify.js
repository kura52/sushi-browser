function simpleIpcFunc(name,callback,...args){
  const key = Math.random().toString()
  chrome.ipcRenderer.once(`${name}-reply_${key}`,(event,...results)=>{
    if(callback) callback(...results)
  })
  chrome.ipcRenderer.send(name,key,...args)
}

simpleIpcFunc('chrome-management-get',details=> chrome.app._details = details,chrome.runtime.id)
chrome.app.getDetails = _=>chrome.app._details

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
chrome.extension.isAllowedIncognitoAccess = (callback)=> callback(true)

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
  const ipc = chrome.ipcRenderer

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
      if(window.id === -1){
        chrome.windows.getLastFocused(getInfo,callback)
      }
      else{
        callback(window)
      }
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
    simpleIpcFunc('chrome-windows-create',_=>setTimeout(_=>chrome.windows.getCurrent({},callback),3000),createData)
  }

  const methods = ['onCreated','onRemoved','onFocusChanged']

  for(let method of methods){
    const name = `chrome-windows-${method}`
    const ipcEvents = {}
    chrome.windows[method] = {
      addListener(cb) {
        console.log(method)
        ipcEvents[cb] = (e, details) => cb(details)
        ipc.send(`regist-${name}`)
        if(name == 'onCreated'){
          ipc.on(name, windowId=>{
            chrome.windows.get(windowId, {}, ipcEvents[cb])
          })
        }
        else{
          ipc.on(name,ipcEvents[cb])
        }
      },
      removeListener(cb){
        ipc.send(`unregist-${name}`)
        ipc.removeListener(name, ipcEvents[cb])
      },
      hasListener(cb){
        return !!ipcEvents[cb]
      }
    }
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
    },
    hasListener(cb){
      return !!onUpdated[cb]
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
    },
    hasListener(cb){
      return !!onCreated[cb]
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
    },
    hasListener(cb){
      return !!onRemoved[cb]
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
    },
    hasListener(cb){
      return !!onActivated[cb]
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
    },
    hasListener(cb){
      return !!onSelectionChanged[cb]
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
    },
    hasListener(cb){
      return !!onActiveChanged[cb]
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

if(chrome.privacy){
  const settingObj = {set(){},get(){return true},clear(){},onChange:{addListener(){},removeListener(){},hasListener(){}}}
  chrome.privacy.network = {}
  chrome.privacy.network.networkPredictionEnabled = settingObj

  chrome.privacy.services.alternateErrorPagesEnabled = settingObj
  chrome.privacy.services.instantEnabled = settingObj
  chrome.privacy.services.safeBrowsingEnabled = settingObj
  chrome.privacy.services.searchSuggestEnabled = settingObj
  chrome.privacy.services.spellingServiceEnabled = settingObj
  chrome.privacy.services.translationServiceEnabled = settingObj

  chrome.privacy.websites = {}
  chrome.privacy.websites.thirdPartyCookiesAllowed = settingObj
  chrome.privacy.websites.hyperlinkAuditingEnabled = settingObj
  chrome.privacy.websites.referrersEnabled = settingObj
  chrome.privacy.websites.protectedContentEnabled = settingObj
}



if(chrome.webNavigation){
  const ipc = chrome.ipcRenderer
  const methods = ['onBeforeNavigate','onCommitted','onDOMContentLoaded','onCompleted','onErrorOccurred','onCreatedNavigationTarget']

  for(let method of methods){
    const name = `chrome-webNavigation-${method}`
    const ipcEvents = {}
    chrome.webNavigation[method] = {
      addListener(cb) {
        console.log(method)
        ipcEvents[cb] = (e, details) => cb(details)
        ipc.send(`regist-${name}`)
        ipc.on(name, ipcEvents[cb])
      },
      removeListener(cb){
        ipc.send(`unregist-${name}`)
        ipc.removeListener(name, ipcEvents[cb])
      },
      hasListener(cb){
        return !!ipcEvents[cb]
      }
    }
  }
}

if(chrome.proxy){
  let datas

  chrome.proxy.settings.get = (details,callback)=> callback(datas)

  const ipcEvents = new Set()
  chrome.proxy.settings.set = (details,callback)=>{
    console.log(details)
    datas = details
    console.log('chrome-proxy-settings-set',details)
    simpleIpcFunc('chrome-proxy-settings-set',(...args)=>{
      callback(...args)
      for(let cb of ipcEvents){
        cb(datas)
      }
    },details)
  }

  chrome.proxy.settings.clear = (details,callback)=>{
    datas = {}
    simpleIpcFunc('chrome-proxy-settings-set',(...args)=>{
      callback(...args)
      for(let cb of ipcEvents){
        cb({})
      }
    },{})

  }
  chrome.proxy.settings.onChange = {
    addListener(cb) {
      ipcEvents.add(cb)
    },
    removeListener(cb){
      ipcEvents.delete(cb)
    },
    hasListener(cb){
      return ipcEvents.includes(cb)
    }
  }
}

if(chrome.pageAction){
  chrome.pageAction = chrome.browserAction
  chrome.browserAction.show = chrome.browserAction.enable
  chrome.browserAction.hide = chrome.browserAction.disable
}