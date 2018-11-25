const {getIpcNameFunc, shortId} = require('./util')
const {Event} = require('./event')
const getIpcName = getIpcNameFunc('WebRequest')
const {ipcRenderer} = require('electron')
const Port = require('./port')
const url = require('url')


class Runtime {
  constructor(extensionId, manifest, isBackgroundPage, isExtensionPage, chrome, webContentsKey) {
    this.id = extensionId
    this._manifest = manifest
    this._isBackgroundPage = isBackgroundPage
    this._isExtensionPage = isExtensionPage
    this._chrome = chrome
    this._webContentsKey = webContentsKey
    this.onConnect = new Event()
    this.onMessage = new Event()

    this.onRequestExternal = new Event() //@TODO FIX
    this.onConnectExternal = new Event() //@TODO FIX
    this.onMessageExternal = new Event() //@TODO FIX

    this.onStartup = new Event() //@TODO NOOP
    this.onInstalled = new Event() //@TODO NOOP
    this.onSuspend = new Event() //@TODO NOOP
    this.onSuspendCanceled = new Event() //@TODO NOOP
    this.onUpdateAvailable = new Event() //@TODO NOOP
    this.onBrowserUpdateAvailable = new Event() //@TODO NOOP

    this.PlatformOs = {MAC: 'mac', WIN: 'win', ANDROID: 'android', CROS: 'cros', LINUX: 'linux', OPENBSD: 'openbsd'}
    this.PlatformArch = {ARM: 'arm', X86_32: 'x86-32', X86_64: 'x86-64'}
    this.PlatformNaclArch = {ARM: 'arm', X86_32: 'x86-32', X86_64: 'x86-64'}
    this.RequestUpdateCheckStatus = {THROTTLED: 'throttled', NO_UPDATE: 'no_update', UPDATE_AVAILABLE: 'update_available'}
    this.OnInstalledReason = {INSTALL: 'install', UPDATE: 'update', CHROME_UPDATE: 'chrome_update', SHARED_MODULE_UPDATE: 'shared_module_update'}
    this.OnRestartRequiredReason = {APP_UPDATE: 'app_update', OS_UPDATE: 'os_update', PERIODIC: 'periodic'}

    this._map = {}
    this.noProxy = new Set(['boolean', 'number', 'string', 'symbol', 'undefined'])

    if (!this._isExtensionPage) {
      delete this.getBackgroundPage
      delete this.openOptionsPage
      delete this.setUninstallURL
      delete this.reload
      delete this.requestUpdateCheck
      delete this.restart
      delete this.getPlatformInfo
      delete this.getPackageDirectoryEntry
    }

    const map = this._map
    const self = this
    const noProxy = this.noProxy
    if(this._isBackgroundPage){
      ipcRenderer.on('get-background-data', (e, rendererId, key, dataKey, type, name, data) => {
        console.log('get-background-data', rendererId, key, dataKey, type, name, data)
        let result = null
        try{
          let o = map[dataKey] === void 0 ? window : map[dataKey]

          if(type == 'get'){
            result = o[name]
            if(typeof result == 'function') result = result.bind(o)
            map[key] = result
          }
          else if(type == 'set'){
            data = this._makeRemoteFunc(data, rendererId)
            o[name] = data
          }
          else if(type == 'defineProperty'){
            data = this._makeRemoteFunc(data, rendererId)
            result = Object.defineProperty(o, name, data)
            map[key] = result
          }
          else if(type == 'apply'){
            data = data.map(d => this._makeRemoteFunc(d, rendererId))
            result = o(...data)
            map[key] = result
          }
        }catch(e){ console.log(e)}
        ipcRenderer.send(`get-background-data-reply_${key}`, result,
          typeof result == 'function' ? 'function' : self._checkProxy(result))
      })
    }

    for(let name of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) this[name] = name == 'constructor' ? this[name] : this[name].bind(this)
  }

  _makeRemoteFunc(data, rendererId){
    if(data != null && data.__function_){
      return (...args) =>{
        return ipcRenderer.send('send-args-renderer', data.__function_, rendererId, args)
      }
    }
    return data
  }

  _checkProxy(data){
    if(Array.isArray(data)){
      for(let v of data){
        if(this._checkProxy(v) == 'proxy') return 'proxy'
      }
    }
    else if(data != null && data.constructor.name == 'Object'){
      for(let v of Object.values(data)){
        if(this._checkProxy(v) == 'proxy') return 'proxy'
      }
    }
    else{
      if(!data || this.noProxy.has(typeof data)){
        return 'no-proxy'
      }
      else{
        return 'proxy'
      }
    }
  }

  _buildProxyValue(data){
    if(typeof data == 'function'){
      const key = shortId()
      const func = (e, args) => data(...args)
      ipcRenderer.once(`send-args-renderer_${key}`,func)
      setTimeout(()=>ipcRenderer.removeListener(`send-args-renderer_${key}`,func),3000)
      return {__function_: key}
    }
    return data
  }


  _makeProxy(key2, type2){
    const self = this
    return new Proxy(type2 == 'function' ? ()=>{} : {}, {
      get(target, property, receiver){
        const {key, result, type} = ipcRenderer.sendSync('background-data', self.id, key2, 'get', self._buildProxyValue(property))
        return type == 'no-proxy' ? result : self._makeProxy(key, type)
      },
      set(target, property, value, receiver){
        const {key, result, type} = ipcRenderer.sendSync('background-data', self.id, key2, 'set', property, self._buildProxyValue(value))
        return value
      },
      apply(target, thisArg, argumentsList){
        const {key, result, type} = ipcRenderer.sendSync('background-data', self.id, key2, 'apply', void 0, argumentsList.map(x=> self._buildProxyValue(x)))
        return type == 'no-proxy' ? result : self._makeProxy(key, type)
      },
      defineProperty(target, property, descriptor) {
        const {key, result, type} = ipcRenderer.sendSync('background-data', self.id, key2, 'defineProperty', property, self._buildProxyValue(descriptor))
        return type == 'no-proxy' ? result : self._makeProxy(key, type)
      }
    })
  }

  getBackgroundPage(callback){
    if(this._isBackgroundPage){
      return callback ? callback(window) : window
    }
    // else{
    //   return window.open(`chrome-extension://${this.id}/${this._manifest.background.page}`)
    // }

    const self = this
    const bgWindow = new Proxy({}, {
      get(target, property, receiver){
        const {key, result, type} = ipcRenderer.sendSync('background-data', self.id, null, 'get', self._buildProxyValue(property))
        return type == 'no-proxy' ? result : self._makeProxy(key, type)
      },
      set(target, property, value, receiver){
        const {key, result, type} = ipcRenderer.sendSync('background-data', self.id, null, 'set', property, self._buildProxyValue(value))
        return value
      },
      apply(target, thisArg, argumentsList){
        const {key, result, type} = ipcRenderer.sendSync('background-data', self.id, null, 'apply', void 0, argumentsList.map(x=> self._buildProxyValue(x)))
        return type == 'no-proxy' ? result : self._makeProxy(key, type)
      },
      defineProperty(target, property, descriptor) {
        const {key, result, type} = ipcRenderer.sendSync('background-data', self.id, null, 'defineProperty', property, self._buildProxyValue(descriptor))
        return type == 'no-proxy' ? result : self._makeProxy(key, type)
      }
    })
    return callback ? callback(bgWindow) : bgWindow

  }

  openOptionsPage(callback){
    const optionPage = this._manifest.options_page || (this._manifest.options_ui && this._manifest.options_ui.page)
    console.error('optionPage')//@TODO
  }

  getManifest(){
    return this._manifest
  }

  setUninstallURL(url, callback){} //@TODO NOOP

  reload(){
    location.reload()
  }

  requestUpdateCheck(callback){
    callback('no_update') //@TODO FIX
  }

  restart(){
    console.error('Function available only for ChromeOS kiosk mode.')
  }

  restartAfterDelay(){
    console.error('Function available only for ChromeOS kiosk mode.')
  }

  getPlatformInfo(callback){
    const process = ipcRenderer.sendSync('get-process-info')
    const arch = process.arch
    const platform = process.platform
    callback({arch: arch == 'x64' ? this.PlatformArch.X86_64 : this.PlatformArch.X86_32,
      nacl_arch: arch == 'x64' ? this.PlatformNaclArch.X86_64 : this.PlatformNaclArch.X86_32,
      os: platform == 'win32' ? this.PlatformOs.WIN :
        platform == 'darwin' ? this.PlatformOs.MAC : this.PlatformOs.LINUX})
  }

  getPackageDirectoryEntry(){
    return {} //@TODO NOOP
  }

  getURL(path) {
    return url.resolve(`https://${this.id}/`, path || '').replace(/^https/, 'chrome-extension')
  }

  connect(...args) {
    console.log(`connect`, ...args)
    // if (this._isBackgroundPage) {
    //   console.error('chrome.runtime.connect is not supported in background page')
    //   return
    // }

    // Parse the optional args.
    let targetExtensionId = this.id
    let connectInfo = {name: ''}
    if (args.length === 1) {
      connectInfo = args[0]
    } else if (args.length === 2) {
      [targetExtensionId, connectInfo] = args
    }

    const {tabId, portId} = ipcRenderer.sendSync('CHROME_RUNTIME_CONNECT', targetExtensionId, connectInfo, this._webContentsKey)
    return new Port(tabId, portId, this.id, connectInfo.name)
  }


  sendMessage(extensionId, message, options, responseCallback) {
    if((extensionId != null && typeof extensionId != 'string') ||
      (typeof extensionId == 'string' && (message == null || typeof message == 'function'))){
      [extensionId, message, options, responseCallback] = [void 0, extensionId, message, options]
    }

    if(typeof options == 'function'){
      [options, responseCallback] = [void 0, options]
    }

    console.log(`sendMessage`, extensionId, message, options)
    // if (this._isBackgroundPage) {
    //   console.log('chrome.runtime.sendMessage is not supported in background page')
    //   return
    // }

    const originResultID = shortId()
    // Parse the optional args.
    let targetExtensionId = extensionId || this.id

    if(responseCallback){
      let isResponsed
      ipcRenderer.once(`CHROME_RUNTIME_SENDMESSAGE_RESULT_${originResultID}`, (event, result) =>{
        isResponsed = true
        responseCallback(result)
      })
      setTimeout(()=>{
        if(!isResponsed){
          console.error(`sendMessageError`, extensionId, message, options)
          responseCallback(null)
        }
      },2000)
    }
    ipcRenderer.send('CHROME_RUNTIME_SENDMESSAGE', targetExtensionId, message, originResultID, this._webContentsKey)
  }

  back(){
    ipcRenderer.send('send-to-host','history','back',Date.now())
  }

  forward(){
    ipcRenderer.send('send-to-host','history','forward',Date.now())
  }

  go(ind){
    ipcRenderer.send('send-to-host','history','go',Date.now(),ind)
  }
}


exports.setup = (...args) => {
  return new Runtime(...args)
}