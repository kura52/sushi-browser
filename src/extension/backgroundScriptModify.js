;(function(){
  try{
    chrome
  }catch(e){
    return
  }
  function simpleIpcFunc(name,callback,...args){
    const key = Math.random().toString()
    chrome.ipcRenderer.once(`${name}-reply_${key}`,(event,...results)=>{
      if(callback) callback(...results)
    })
    chrome.ipcRenderer.send(name,key,...args)
  }
  const convertUrlMap = {
    // 'chrome://newtab/': 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html',
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

  window.close = _=> chrome.windows.hostClose()

// chrome.runtime.onMessage._addListener = chrome.runtime.onMessage.addListener
// chrome.runtime.onMessage.addListener = (func)=>{
//   chrome.runtime.onMessage._addListener((message,sender,sendResponse)=>{
//     if(sender.tab && chrome.tabs){
//       const tabValue = chrome.ipcRenderer.sendSync('get-tab-value-sync',sender.tab.id)
//       if(tabValue){
//         sender.tab.index = tabValue.index
//         sender.tab.openerTabId = tabValue.openerTabId
//         sender.tab.status = tabValue.status
//       }
//     }
//     return func(message,sender,sendResponse)
//   })
// }

// if(chrome.windows){
//   const ipc = chrome.ipcRenderer
//
//   if(!chrome.windows._getAll) chrome.windows._getAll = chrome.windows.getAll
//   chrome.windows.getAll = (getInfo, callback)=>{
//     if(typeof getInfo === 'function') [getInfo,callback] = [null,getInfo]
//     getInfo = getInfo || {}
//     if(getInfo) delete getInfo.windowTypes
//     chrome.windows._getAll(getInfo, windows=>{
//       if(getInfo && getInfo.populate && !windows[0].tabs.length){
//         setTimeout(_=>chrome.windows._getAll(getInfo, windows=>{
//           simpleIpcFunc('chrome-windows-get-attributes',rets=>callback(windows.map((w,i)=>Object.assign(w,rets[i]))),windows.map(w=>w.id))
//         }),2000)
//       }
//       else{
//         simpleIpcFunc('chrome-windows-get-attributes',rets=>callback(windows.map((w,i)=>Object.assign(w,rets[i]))),windows.map(w=>w.id))
//       }
//     })
//   }
//
//
//   if(!chrome.windows._getCurrent) chrome.windows._getCurrent = chrome.windows.getCurrent
//   chrome.windows.getCurrent = (getInfo, callback)=>{
//     if(typeof getInfo === 'function') [getInfo,callback] = [null,getInfo]
//     getInfo = getInfo || {}
//     if(getInfo) delete getInfo.windowTypes
//     chrome.windows._getCurrent(getInfo, window=>{
//       if(window.id === -1){
//         chrome.windows.getLastFocused(getInfo,callback)
//       }
//       else{
//         simpleIpcFunc('chrome-windows-get-attributes',ret=>callback && callback({...window,...ret[0]}),[window.id])
//       }
//     })
//   }
//
//
//   chrome.windows.get = (windowId, getInfo, callback) =>{
//     if(typeof getInfo === 'function') [getInfo,callback] = [null,getInfo]
//
//     if(getInfo) delete getInfo.windowTypes
//     chrome.windows.getAll(getInfo, windows=>{
//       if(!windows) callback(null)
//       for(let window of windows){
//         if(window.id == windowId){
//           callback(window)
//           return
//         }
//       }
//       callback(null)
//     })
//   }
//   chrome.windows.getLastFocused = (getInfo,callback) => {
//     simpleIpcFunc('chrome-windows-getLastFocused',(windowId)=>{
//       chrome.windows.get(windowId, getInfo, callback)
//     })
//   }
//
//   chrome.windows.create = (createData,callback)=> {
//     if (typeof createData === 'function') [createData, callback] = [null, createData]
//     console.log(2224, createData)
//     if (createData && createData.url){
//       if (!createData.url.includes("://")) {
//         createData.url = `chrome-extension://${chrome.runtime.id}/${createData.url.split("/").filter(x => x).join("/")}`
//       }
//       createData.url = convertUrlMap[createData.url] || createData.url
//     }
//     simpleIpcFunc('chrome-windows-create',_=>setTimeout(_=>chrome.windows.getCurrent({populate:true},callback),3000),createData)
//   }
//
//   chrome.windows.remove = (windowId,callback)=> simpleIpcFunc('chrome-windows-remove',callback,windowId)
//
//   for(let method of ['onCreated','onRemoved','onFocusChanged']){
//     const name = `chrome-windows-${method}`
//     const ipcEvents = {}
//     chrome.windows[method] = {
//       addListener(cb) {
//         console.log(method)
//         ipc.send(`regist-${name}`)
//         ipcEvents[cb] = method == 'onCreated' ? (e,windowId)=>{ chrome.windows.get(windowId, {}, cb) } : (e, details) => cb(details)
//         ipc.on(name,ipcEvents[cb])
//       },
//       removeListener(cb){
//         ipc.send(`unregist-${name}`)
//         ipc.removeListener(name, ipcEvents[cb])
//       },
//       hasListener(cb){
//         return !!ipcEvents[cb]
//       },
//       hasListeners(){
//         return !!Object.keys(ipcEvents).length
//       }
//     }
//   }
// }
//
// if(chrome.tabs){
//   if(!chrome.tabs._query) chrome.tabs._query = chrome.tabs.query
//   chrome.tabs.query = (queryInfo,callback)=>{
//     if(queryInfo.lastFocusedWindow !== void 0){
//       delete queryInfo.lastFocusedWindow
//     }
//     if(queryInfo.windowType !== void 0){
//       delete queryInfo.windowType
//     }
//     if(queryInfo.currentWindow == false){
//       delete queryInfo.currentWindow
//     }
//     chrome.tabs._query(queryInfo,callback)
//   }
//
//   if(!chrome.tabs._create) chrome.tabs._create = chrome.tabs.create
//   chrome.tabs.create = (createProperties, callback)=> {
//     if(createProperties){
//       if(createProperties.url) {
//         if(!createProperties.url.includes("://")) {
//           createProperties.url = `chrome-extension://${chrome.runtime.id}/${createProperties.url.split("/").filter(x => x).join("/")}`
//         }
//         createProperties.url = convertUrlMap[createProperties.url] || createProperties.url
//       }
//       if(createProperties.selected !== void 0) {
//         createProperties.active = createProperties.selected
//       }
//       if(createProperties.highlighted !== void 0) {
//         createProperties.active = createProperties.highlighted
//       }
//     }
//     chrome.tabs._create(createProperties, (_tab)=>{
//       let retry = 0
//       const id = setInterval(_=>chrome.tabs.get(_tab.id,tab=>{
//         if(++retry > 200 || (tab && tab.url)){
//           clearInterval(id)
//           setTimeout(_=>callback && callback(tab),250)
//         }
//       }),10)
//     })
//   }
//
//
//   if(!chrome.tabs._update) chrome.tabs._update = chrome.tabs.update
//   chrome.tabs.update = (tabId, updateProperties, callback)=>{
//     const func = (tabId, updateProperties, callback)=>{
//       if(updateProperties.muted !== void 0){
//         ipc.send('set-audio-muted',tabId,updateProperties.muted,true)
//       }
//       chrome.tabs._update(tabId, updateProperties, callback)
//     }
//
//     if(!Number.isFinite(tabId) && tabId !== null && tabId !== void 0){
//       [tabId,updateProperties,callback] = [null,tabId,updateProperties]
//       simpleIpcFunc('chrome-tabs-current-tabId',tabId=>{
//         func(tabId, updateProperties, callback)
//       })
//     }
//     else if(!tabId){
//       simpleIpcFunc('chrome-tabs-current-tabId',tabId=>{
//         func(tabId, updateProperties, callback)
//       })
//     }
//     else{
//       func(tabId, updateProperties, callback)
//     }
//   }
//
//   chrome.tabs.reload = (tabId, reloadProperties, callback)=>{
//     if(!Number.isFinite(tabId)){
//       if(Object.prototype.toString.call(tabId)=="[object Object]" && tabId !== null && tabId !== void 0){
//         [tabId,reloadProperties,callback] = [null,tabId,reloadProperties]
//       }
//       else if(typeof tabId === 'function'){
//         [tabId,reloadProperties,callback] = [null,null,tabId]
//       }
//     }
//     if(typeof tabId === 'function'){
//       [reloadProperties,callback] = [null,reloadProperties]
//     }
//     simpleIpcFunc('chrome-tabs-reload',callback,tabId, reloadProperties)
//   }
//
//   chrome.tabs.move = (tabIds, moveProperties, callback)=>{
//     console.log(tabIds, moveProperties)
//     if(Number.isFinite(tabIds)){
//       tabIds = [tabIds]
//     }
//     simpleIpcFunc('chrome-tabs-move',winIds=>{
//       chrome.windows.getAll({populate:true},windows=>{
//         const tabs = []
//         for(let win of windows){
//           if(!winIds.includes(win.id)) continue
//           for(let tab of win.tabs){
//             if(tabIds.includes(tab.id)) tabs.push(tab)
//           }
//         }
//         if(callback) callback(tabs)
//       })
//     },tabIds, moveProperties)
//   }
//
//   chrome.tabs.getAllInWindow = (windowId, callback)=>{
//     if(typeof windowId === 'function') [windowId,callback] = [null,windowId]
//     chrome.tabs.query(windowId ? {windowId} : {},callback)
//   }
//
//   chrome.tabs.detectLanguage = (tabId, callback)=>{
//     if(typeof tabId === 'function') [tabId,callback] = [null,tabId]
//
//     console.log(tabId)
//     chrome.tabs.get(tabId, tab=>{
//       simpleIpcFunc('chrome-tabs-detectLanguage',callback,tabId)
//     })
//   }
//
//   chrome.tabs.captureVisibleTab = (windowId,options,callback) => {
//     if(!Number.isFinite(windowId)){
//       if(Object.prototype.toString.call(windowId)=="[object Object]"){
//         [windowId,options,callback] = [null,windowId,options]
//       }
//       else if(typeof windowId === 'function'){
//         [windowId,options,callback] = [null,null,windowId]
//       }
//     }
//     if(typeof windowId === 'function'){
//       [options,callback] = [null,options]
//     }
//     chrome.tabs.query(windowId ? {windowId} : {},tabs=>{
//       if(tabs && tabs.length){
//         for(let tab of tabs){
//           if(tab.active){
//             simpleIpcFunc('chrome-tabs-captureVisibleTab',callback,tab.id,options)
//             return
//           }
//         }
//       }
//     })
//   }
//   chrome.tabs.getZoom =(tabId, callback)=>simpleIpcFunc('chrome-tabs-getZoom',callback,tabId)
//
//   chrome.tabs.setZoom =(tabId, zoomFactor, callback)=>simpleIpcFunc('chrome-tabs-setZoom',callback,tabId,zoomFactor)
//
//   if(!chrome.tabs._executeScript) chrome.tabs._executeScript = chrome.tabs.executeScript
//   chrome.tabs.executeScript = (tabId,details,callback) => {
//     if(details.file){
//       simpleIpcFunc('chrome-tabs-read-file',code=>{
//         details.code = code
//         delete details.file
//         chrome.tabs.executeScript(tabId, details, callback)
//       },chrome.runtime.id,details.file)
//       return
//     }
//     console.log('executeScript',tabId,details)
//     if (!Number.isFinite(tabId) && tabId !== null && tabId !== void 0) {
//       [tabId,details,callback] = [null,tabId,details]
//       simpleIpcFunc('chrome-tabs-current-tabId',tabId=>{
//         chrome.tabs._executeScript(tabId, details, callback)
//       })
//     }
//     else if(!tabId){
//       simpleIpcFunc('chrome-tabs-current-tabId',tabId=>{
//         console.log(tabId)
//         chrome.tabs._executeScript(tabId, details, callback)
//       })
//     }
//     else{
//       chrome.tabs._executeScript(tabId,details,callback)
//     }
//   }
//
//   chrome.tabs.insertCSS = (tabId,details,callback) => {
//     if(!Number.isFinite(tabId)){
//       if(Object.prototype.toString.call(tabId)=="[object Object]"){
//         [tabId,details,callback] = [null,tabId,details]
//       }
//     }
//     simpleIpcFunc('chrome-tabs-insertCSS',code=>{
//       chrome.tabs.executeScript(tabId,{code},callback)
//     },chrome.runtime.id,tabId,details)
//   }
//
//   chrome.tabs.duplicate = (tabId,callback) => {
//     simpleIpcFunc('chrome-tabs-duplicate',callback && (tabId=>chrome.tabs.get(parseInt(tabId), callback)),tabId)
//   }
//
//   chrome.tabs.saveAsPDF = (pageSettings,callback) => {
//     simpleIpcFunc('chrome-tabs-saveAsPDF',callback,pageSettings)
//   }
//
//   const ipc = chrome.ipcRenderer
//   const extensionId = chrome.runtime.id
//
//   for(let event_name of ['updated', 'created', 'removed', 'activated','activeChanged','selectionChanged']){
//     const ipcEvent = {},name = `chrome-tabs-${event_name}`
//     chrome.tabs[`on${event_name.charAt(0).toUpperCase()}${event_name.slice(1)}`] = {
//       addListener: function (cb) {
//         ipcEvent[cb] = function(evt, tabId, changeInfo, tab) {
//           if(tab && tab.url && tab.url.startsWith('chrome://brave/')) return
//           // console.log(name, tabId, changeInfo, tab)
//           if(event_name == 'activated'){
//             cb(changeInfo, tab);
//           }
//           else{
//             cb(tabId, changeInfo, tab);
//           }
//         }
//         ipc.send(`register-chrome-tabs-${event_name}`, extensionId);
//         ipc.on(name, ipcEvent[cb])
//       },
//       removeListener: function(cb){
//         ipc.removeListener(name, ipcEvent[cb])
//       },
//       hasListener(cb){
//         return !!ipcEvent[cb]
//       },
//       hasListeners(){
//         return !!Object.keys(ipcEvent).length
//       }
//     }
//   }
//
//
//   for(let method of ['onMoved','onDetached','onAttached']){
//     const name = `chrome-tabs-${method}`
//     const ipcEvents = {}
//     chrome.tabs[method] = {
//       addListener(cb) {
//         console.log(method)
//         ipcEvents[cb] = (e, tabId, info) => cb(tabId, info)
//         ipc.send(`regist-${name}`)
//         ipc.on(name, ipcEvents[cb])
//       },
//       removeListener(cb){
//         ipc.send(`unregist-${name}`)
//         ipc.removeListener(name, ipcEvents[cb])
//       },
//       hasListener(cb){
//         return !!ipcEvents[cb]
//       },
//       hasListeners(){
//         return !!Object.keys(ipcEvents).length
//       }
//     }
//   }
//
// }

  // if(chrome.browserAction){
  //   chrome.pageAction = chrome.browserAction
  //   chrome.pageAction.show = chrome.browserAction.enable
  //   chrome.pageAction.hide = chrome.browserAction.disable
  //
  //
  //   const ipc = chrome.ipcRenderer
  //   const method = 'onClicked'
  //   const name = `chrome-browserAction-${method}`
  //   const ipcEvents = {}
  //   chrome.browserAction.onClicked = {
  //     addListener: function (cb) {
  //       console.log("addevent")
  //       ipcEvents[cb] = function(evt,id, tabId) {
  //         if(chrome.runtime.id == id){
  //           chrome.tabs.get(parseInt(tabId), cb)
  //         }
  //       }
  //       ipc.send(`regist-${name}`)
  //       ipc.on('chrome-browserAction-onClicked', ipcEvents[cb])
  //     },
  //     removeListener: function(cb){
  //       ipc.send(`unregist-${name}`)
  //       ipc.removeListener('chrome-browserAction-onClicked', ipcEvents[cb])
  //     },
  //     hasListener(cb){
  //       return !!onClicked[cb]
  //     },
  //     hasListeners(){
  //       return !!Object.keys(onClicked).length
  //     }
  //   }
  //
  //   chrome.browserAction._setIcon = chrome.browserAction.setIcon
  //   chrome.browserAction.setIcon = (details,callback) => {
  //     if(details.imageData){
  //       callback && callback()
  //     }
  //     else{
  //       chrome.browserAction._setIcon(details,callback)
  //     }
  //   }
  // }

  if(chrome.sessions){

    if('browser' in this){
      const tabMap = new Map(), winMap = new Map()
      browser.sessions.setTabValue = (tabId, key, value) => {
        const values = tabMap.get(tabId)
        if(values){
          values.set(key,value)
        }
        else{
          tabMap.set(new Map([[key,value]]))
        }
        return new Promise(r=>r())
      }
      browser.sessions.getTabValue = (tabId, key) => {
        const values = tabMap.get(tabId)
        if(values){
          return new Promise(r=>r(values.get(key)))
        }
        else{
          return new Promise(r=>r())
        }
      }
      browser.sessions.removeTabValue = (tabId, key) => {
        const values = tabMap.get(tabId)
        if(values) values.delete(key)
        return new Promise(r=>r())
      }

      browser.sessions.setWindowValue = (windowId, key, value) => {
        const values = winMap.get(windowId)
        if(values){
          values.set(key,value)
        }
        else{
          winMap.set(new Map([[key,value]]))
        }
        return new Promise(r=>r())
      }
      browser.sessions.getWindowValue = (windowId, key) => {
        const values = winMap.get(windowId)
        if(values){
          return new Promise(r=>r(values.get(key)))
        }
        else{
          return new Promise(r=>r())
        }
      }
      browser.sessions.removeWindowValue = (windowId, key)  => {
        const values = winMap.get(windowId)
        if(values) values.delete(key)
        return new Promise(r=>r())
      }

    }
  }

  if('browser' in this){
    browser.sidebarAction = {}
    browser.sidebarAction.open  = callback => simpleIpcFunc('chrome-sidebarAction-open',callback,chrome.runtime.id)
    browser.sidebarAction.close  = callback => simpleIpcFunc('chrome-sidebarAction-close',callback,chrome.runtime.id)

    Array.concat = (...args)=>Array.prototype.concat.call(...args)
    Array.every = (...args)=>Array.prototype.every.call(...args)
    Array.filter = (...args)=>Array.prototype.filter.call(...args)
    Array.forEach = (...args)=>Array.prototype.forEach.call(...args)
    Array.indexOf = (...args)=>Array.prototype.indexOf.call(...args)
    Array.join = (...args)=>Array.prototype.join.call(...args)
    Array.lastIndexOf = (...args)=>Array.prototype.lastIndexOf.call(...args)
    Array.map = (...args)=>Array.prototype.map.call(...args)
    Array.pop = (...args)=>Array.prototype.pop.call(...args)
    Array.push = (...args)=>Array.prototype.push.call(...args)
    Array.reduce = (...args)=>Array.prototype.reduce.call(...args)
    Array.reduceRight = (...args)=>Array.prototype.reduceRight.call(...args)
    Array.reverse = (...args)=>Array.prototype.reverse.call(...args)
    Array.shift = (...args)=>Array.prototype.shift.call(...args)
    Array.slice = (...args)=>Array.prototype.slice.call(...args)
    Array.some = (...args)=>Array.prototype.some.call(...args)
    Array.sort = (...args)=>Array.prototype.sort.call(...args)
    Array.splice = (...args)=>Array.prototype.splice.call(...args)
    Array.unshift = (...args)=>Array.prototype.unshift.call(...args)
    String.charAt = (...args)=>String.prototype.charAt.call(...args)
    String.charCodeAt = (...args)=>String.prototype.charCodeAt.call(...args)
    String.concat = (...args)=>String.prototype.concat.call(...args)
    String.endsWith = (...args)=>String.prototype.endsWith.call(...args)
    String.includes = (...args)=>String.prototype.includes.call(...args)
    String.indexOf = (...args)=>String.prototype.indexOf.call(...args)
    String.lastIndexOf = (...args)=>String.prototype.lastIndexOf.call(...args)
    String.localeCompare = (...args)=>String.prototype.localeCompare.call(...args)
    String.match = (...args)=>String.prototype.match.call(...args)
    String.normalize = (...args)=>String.prototype.normalize.call(...args)
    String.replace = (...args)=>String.prototype.replace.call(...args)
    String.search = (...args)=>String.prototype.search.call(...args)
    String.slice = (...args)=>String.prototype.slice.call(...args)
    String.split = (...args)=>String.prototype.split.call(...args)
    String.startsWith = (...args)=>String.prototype.startsWith.call(...args)
    String.substr = (...args)=>String.prototype.substr.call(...args)
    String.substring = (...args)=>String.prototype.substring.call(...args)
    String.toLocaleLowerCase = (...args)=>String.prototype.toLocaleLowerCase.call(...args)
    String.toLocaleUpperCase = (...args)=>String.prototype.toLocaleUpperCase.call(...args)
    String.toLowerCase = (...args)=>String.prototype.toLowerCase.call(...args)
    String.toUpperCase = (...args)=>String.prototype.toUpperCase.call(...args)
    String.trim = (...args)=>String.prototype.trim.call(...args)
    String.trimLeft = (...args)=>String.prototype.trimLeft.call(...args)
    String.trimRight = (...args)=>String.prototype.trimRight.call(...args)
  }

  if(('browser' in this) && browser.permissions){
    browser.permissions.contains = (permissions) => new Promise(r=>r(true)) //@TODO
  }

  try{
    if(browser){
      if(!browser.clipboard) browser.clipboard = {}
      browser.clipboard.setImageData = (imageData, imageType)=>{
        return new Promise((resolve,reject)=>{
          const base64String = btoa(new Uint8Array(imageData).reduce((data, byte) => data + String.fromCharCode(byte), ''))
          simpleIpcFunc('chrome-clipboard-setImageData',(...args)=>resolve(...args),`${imageType == 'jpeg' ? 'data:image/jpeg;base64,' : 'data:image/png;base64,'}${base64String}`)
        })
      }
    }

  }catch(e){}

}())