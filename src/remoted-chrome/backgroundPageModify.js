export default (port, serverKey) => {
  ;(()=>{
    const ipcRenderer = {
      port,
      serverKey,
      send(channel, ...args) {
        const xhr = new XMLHttpRequest();
        const data = JSON.stringify({
          api: 'ipc',
          method: 'send',
          result: [channel, chrome.runtime.id, ...args]
        })
        if(data.length < 1000){
          xhr.open("GET", `http://localhost:${this.port}?key=${this.serverKey}&data=${encodeURIComponent(data)}`);
          xhr.send();
        }
        else{
          xhr.open("POST", `http://localhost:${this.port}?key=${this.serverKey}`)
          xhr.send(data)
        }
      },
      on(eventName, listener) {
        window.ipcRenderer.events[eventName] = listener
      },
      once(eventName, listener) {
        window.ipcRenderer.events[eventName] = (...args) => {
          listener(...args)
          delete this.events[eventName]
        }
      }
    }

    if(!window.ipcRenderer){
      window.ipcRenderer = { events: {} }
    }

    const {getIpcNameFunc, _shortId} = {
      getIpcNameFunc(className){
        return function(method, extensionId){
          if(extensionId){
            return `CHROME_${className.toUpperCase()}_${method.toUpperCase()}_${extensionId}`
          }
          else{
            return `CHROME_${className.toUpperCase()}_${method.toUpperCase()}`
          }
        }
      },
      _shortId() {
        const self = this
        const uuidLength = 8

        const DICT_RANGES = { digits: [48, 58], lowerCase: [97, 123], upperCase: [65, 91] }
        let dict = [];
        let dictIndex = 0, _i = 0

        let rangeType
        for (rangeType in DICT_RANGES) {
          const dictRange = DICT_RANGES[rangeType]
          const lowerBound = dictRange[0], upperBound = dictRange[1]
          for (dictIndex = _i = lowerBound; lowerBound <= upperBound ? _i < upperBound : _i > upperBound; dictIndex = lowerBound <= upperBound ? ++_i : --_i) {
            dict.push(String.fromCharCode(dictIndex))
          }
        }

        dict = dict.sort(() => Math.random() <= 0.5)
        const dictLength = dict.length

        return function(){
          let id = '', randomPartIdx, _j, idIndex
          for (idIndex = _j = 0; 0 <= uuidLength ? _j < uuidLength : _j > uuidLength; idIndex = 0 <= uuidLength ? ++_j : --_j) {
            randomPartIdx = parseInt(Math.random() * dictLength) % dictLength
            id += dict[randomPartIdx]
          }
          return id
        }
      }
    }

    const shortId = _shortId()

    const deepEqual = (x, y) => {
      if (typeof x !== typeof y) {
        return false
      }
      if (typeof x !== 'object') {
        return x === y
      }
      const xKeys = Object.keys(x)
      const yKeys = Object.keys(y)
      if (xKeys.length !== yKeys.length) {
        return false
      }
      for (let prop in x) {
        if (x.hasOwnProperty(prop)) {
          if (!deepEqual(x[prop], y[prop])) {
            return false
          }
        }
      }
      return true
    }

    const {ipcFuncRenderer} = (function(ipcRenderer){
      return {
        getIpcNameFunc,
        ipcFuncRenderer(className,method,callback,...args){
          const requestId = shortId()
          const name = getIpcNameFunc(className)(method)
          let success
          const id = setTimeout(()=>{
            success = true
            console.log(`${name}_RESULT_ERROR_${requestId}`, {}, null)
            if(callback) callback(null)
          },2000)

          ipcRenderer.once(`${name}_RESULT_${requestId}`, (event,...results)=>{
            if(success) return
            clearTimeout(id)
            console.log(`${name}_RESULT_${requestId}`, event,...results)
            if(callback) callback(...results)
          })
          ipcRenderer.send(name, requestId, ...args)
        },
        simpleIpcFunc(name,callback,...args){
          const key = shortId()
          let success
          const id = setTimeout(()=>{
            success = true
            console.log(`${name}-reply_ERROR_${key}`, {}, null)
            if(callback) callback(null)
          },2000)
          ipcRenderer.once(`${name}-reply_${key}`,(event,...results)=>{
            if(success) return
            clearTimeout(id)
            if(callback) callback(...results)
          })
          ipcRenderer.send(name,key,...args)
        },
        deepEqual
      }
    })(ipcRenderer)

    const {Event, Event2} = (function(ipcRenderer){
      class Event {
        constructor (firstExecuteCallback) {
          this.listeners = []
          this.firstExecuteCallback = firstExecuteCallback
          this.first = false

          for(let name of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) this[name] = name == 'constructor' ? this[name] : this[name].bind(this)
        }

        addListener (callback) {
          console.log('addListener', this)
          if(this.first){
            this.firstExecuteCallback && this.firstExecuteCallback()
            this.first = true
          }
          this.listeners.push(callback)
        }

        removeListener (callback) {
          const index = this.listeners.indexOf(callback)
          if (index !== -1) {
            this.listeners.splice(index, 1)
          }
        }

        hasListener (callback) {
          return this.listeners.some(ele => ele == callback)
        }

        hasListeners () {
          return !!this.listeners.length
        }

        emit (...args) {
          for (const listener of this.listeners) {
            listener(...args)
          }
        }
      }

      class Event2 {
        constructor (name, method, extensionId, needReturn) {
          this.listeners = new Map()
          this.name = name
          this.method = method
          this.extensionId = extensionId
          this.needReturn = needReturn
          this.ipcName = getIpcNameFunc(name)(method, extensionId)
          ipcRenderer.on(this.ipcName, (event, ...args) => this.emit(...args))

          for(let name of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) this[name] = name == 'constructor' ? this[name] : this[name].bind(this)
        }

        addListener (callback, ...args) {
          const eventId = Math.random().toString()
          console.log('addListener',this.name,this.method,this.extensionId,callback,eventId)
          this.listeners.set(eventId, callback)
          ipcRenderer.send(`${getIpcNameFunc(this.name)(this.method)}_REGIST`, this.extensionId, eventId, ...args)
        }

        removeListener (callback) {
          for(let [eventId, _callback] of this.listeners){
            if(_callback == callback){
              this.listeners.delete(eventId)
              ipcRenderer.send(`${getIpcNameFunc(this.name)(this.method)}_UNREGIST`, this.extensionId, eventId)
              break
            }
          }
        }

        hasListener (callback) {
          for(let [eventId, _callback] of this.listeners){
            if(_callback == callback){
              return true
            }
          }
          return false
        }

        hasListeners () {
          return !!this.listeners.size
        }

        emit (eventId, ...args) {
          // console.log('emit', this.name,this.method,this.extensionId,eventId, ...args)
          try{
            const result = this.listeners.get(eventId)(...args)
            if(this.needReturn) ipcRenderer.send(`${this.ipcName}_${eventId}_RESULT`, result)
          }catch(e){
            console.log(e, 'emit', this.name,this.method,this.extensionId,eventId, ...args)
          }
        }
      }

      return {Event, Event2}
    })(ipcRenderer);

    // tabs
    if(chrome.tabs){
      chrome.tabs._update = chrome.tabs.update
      chrome.tabs.update = (tabId, updateProperties, callback) => {
        chrome.tabs._update(tabId, updateProperties, callback)
        if(tabId == null) updateProperties = tabId
        if(updateProperties.active || updateProperties.highlighted || updateProperties.selected){
          if(tabId){
            ipcRenderer.send('chrome-tabs-update-active', tabId)
          }
          else{
            chrome.tabs.query({active:true, windowId: -2},(tabs) => {
              ipcRenderer.send('chrome-tabs-update-active', tabs[0].id)
            })
          }
        }
      }
    }

    // browser-action
    if(chrome.browserAction){

      chrome.browserAction.onClicked = new Event()
      ipcRenderer.on('CHROME_BROWSERACTION_ONCLICKED',(e, tabId)=>{
        chrome.tabs.get(tabId, tab => chrome.browserAction.onClicked.emit(tab))
      })

      chrome.browserAction._setTitle = chrome.browserAction.setTitle
      chrome.browserAction.setTitle = (detalis, callback) => {
        chrome.browserAction._setTitle(detalis, callback)
        ipcRenderer.send('chrome-browser-action-set-title', chrome.runtime.id, detalis)
      }

      chrome.browserAction._setIcon = chrome.browserAction.setIcon
      chrome.browserAction.setIcon = (detalis, callback) => {
        chrome.browserAction._setIcon(detalis, callback)
        ipcRenderer.send('chrome-browser-action-set-icon', chrome.runtime.id, detalis)
      }

      chrome.browserAction._setPopup = chrome.browserAction.setPopup
      chrome.browserAction.setPopup = (detalis, callback) => {
        chrome.browserAction._setPopup(detalis, callback)
        ipcRenderer.send('chrome-browser-action-set-popup', chrome.runtime.id, detalis)
      }

      chrome.browserAction._setBadgeText = chrome.browserAction.setBadgeText
      chrome.browserAction.setBadgeText = (detalis, callback) => {
        chrome.browserAction._setBadgeText(detalis, callback)
        ipcRenderer.send('chrome-browser-action-set-badge-text', chrome.runtime.id, detalis)
      }

      chrome.browserAction._setBadgeBackgroundColor = chrome.browserAction.setBadgeBackgroundColor
      chrome.browserAction.setBadgeBackgroundColor = (detalis, callback) => {
        chrome.browserAction._setBadgeBackgroundColor(detalis, callback)
        ipcRenderer.send('chrome-browser-action-set-badge-background-color', chrome.runtime.id, detalis)
      }

      chrome.browserAction._enable = chrome.browserAction.enable
      chrome.browserAction.enable = (tabId, callback) => {
        chrome.browserAction._enable(tabId, callback)
        ipcFuncRenderer('BrowserAction', 'enable', callback, chrome.runtime.id, tabId, true)
      }

      chrome.browserAction._disable = chrome.browserAction.disable
      chrome.browserAction.disable = (tabId, callback) => {
        chrome.browserAction._disable(tabId, callback)
        ipcFuncRenderer('BrowserAction', 'enable', callback, chrome.runtime.id, tabId, false)
      }

    }
    if(chrome.contextMenus){
      chrome.contextMenus.onClicked = new Event()
      const onClickEvents = {}

      ipcRenderer.on('CHROME_CONTEXTMENUS_ONCLICKED',(e, info, tabId)=>{
        chrome.tabs.get(tabId, tab => chrome.contextMenus.onClicked.emit(info, tab))
      })

      chrome.contextMenus._create = chrome.contextMenus.create
      chrome.contextMenus.create = (createProperties, callback) => {
        chrome.contextMenus._create(createProperties, callback)

        if(!createProperties.id) createProperties.id = shortId()
        if(createProperties.onclick){
          onClicked.addListener(createProperties.onclick)
          onClickEvents[createProperties.id] = createProperties.onclick
          delete createProperties.onclick
        }
        console.log('chrome.contextMenus.create', createProperties, callback)
        ipcFuncRenderer('ContextMenus', 'create', callback, chrome.runtime.id, createProperties)
      }

      chrome.contextMenus._update = chrome.contextMenus.update
      chrome.contextMenus.update = (id, updateProperties, callback) => {
        chrome.contextMenus._update(id, updateProperties, callback)
        if(updateProperties.onclick){
          if(onClickEvents[id]) onClicked.removeListener(onClickEvents[id])
          onClicked.addListener(updateProperties.onclick)
          onClickEvents[id] = updateProperties.onclick
          delete updateProperties.onclick
        }
        ipcFuncRenderer('ContextMenus', 'update', callback, chrome.runtime.id, id, updateProperties)
      }

      chrome.contextMenus._remove = chrome.contextMenus.remove
      chrome.contextMenus.remove = (menuItemId, callback) => {
        chrome.contextMenus._remove(menuItemId, callback)
        ipcFuncRenderer('ContextMenus', 'remove', callback, chrome.runtime.id, menuItemId)
      }

      chrome.contextMenus._removeAll = chrome.contextMenus.removeAll
      chrome.contextMenus.removeAll = (callback) => {
        chrome.contextMenus._removeAll(callback)
        ipcFuncRenderer('ContextMenus', 'removeAll', callback, chrome.runtime.id)
      }
    }
    if(chrome.commands){
      chrome.commands.onCommand = new Event2('Commands', 'onCommand', chrome.runtime.id)
    }

  })()
}