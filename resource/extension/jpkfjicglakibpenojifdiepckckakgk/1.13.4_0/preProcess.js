// Copyright 2010 Google Inc. All Rights Reserved.
function simpleIpcFunc(name,callback,args){
  const key = Math.random().toString()
  chrome.ipcRenderer.once(`${name}-reply_${key}`,(event,results)=>{
    callback(results)
  })
  chrome.ipcRenderer.send(name,key,args)
}

chrome.i18n.getAcceptLanguages = callback=> simpleIpcFunc('chrome-i18n-getAcceptLanguages',callback)

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

chrome.extension.isAllowedFileSchemeAccess = (callback)=> callback(true)

if(chrome.contextMenus) {
  chrome.contextMenus._create = chrome.contextMenus.create
  chrome.contextMenus.create = (...args) => {
    console.log(args)
    if (args[0] && Object.prototype.toString.call(args[0]) == "[object Object]") {
      delete args[0].checked
      delete args[0].documentUrlPatterns
      delete args[0].targetUrlPatterns
      delete args[0].enabled
    }
    return chrome.contextMenus._create(...args)
  }
}

if(chrome.windows){
  chrome.windows.create = (createData,callback)=>{
    const key = Math.random().toString()
    const name = 'chrome-windows-create'
    chrome.ipcRenderer.once(`${name}-reply_${key}`,(event)=>{
      setTimeout(_=>chrome.windows.getCurrent({},callback),2000)
    })
    chrome.ipcRenderer.send(name,key,createData)
  }
}

if(chrome.tabs){
  chrome.tabs.getAllInWindow = (windowId, callback)=>{
    chrome.tabs.query({windowId},callback)
  }
  chrome.tabs.detectLanguage = (tabId, callback)=>{
    console.log(tabId)
    chrome.tabs.get(tabId, tab=>{
      simpleIpcFunc('chrome-tabs-detectLanguage',callback,tabId)
    })
  }
}