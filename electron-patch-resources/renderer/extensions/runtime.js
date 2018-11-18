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

    if(this._isBackgroundPage){
      const map = {}
      const noProxy = new Set(['boolean', 'number', 'string', 'symbol', 'undefined'])
      ipcRenderer.on('get-background-data', (e, key, dataKey, type, name, data) => {
        console.log('get-background-data',  key, dataKey, type, name, data)
        let result = null
        try{
          let o = map[dataKey] === void 0 ? window : map[dataKey]

          if(type == 'get'){
            result = o[name]
            map[key] = result
          }
          else if(type == 'set'){
            o[name] = data
          }
          else if(type == 'apply'){
            result = o(...data)
            map[key] = result
          }
        }catch(e){ console.log(e)}
        ipcRenderer.send(`get-background-data-reply_${key}`, result, typeof result == 'function' ? 'function' : !result || noProxy.has(typeof result) ? 'no-proxy' : 'proxy')
      })
    }

    for(let name of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) this[name] = name == 'constructor' ? this[name] : this[name].bind(this)
  }

  _makeProxy(key2, type2){
    const self = this
    return new Proxy(type2 == 'function' ? ()=>{} : {}, {
      get(target, property, receiver){
        const {key, result, type} = ipcRenderer.sendSync('background-data', self.id, key2, 'get', property)
        return type == 'no-proxy' ? result : self._makeProxy(key, type)
      },
      set(target, property, value, receiver){
        const {key, result, type} = ipcRenderer.sendSync('background-data', self.id, key2, 'set', property, value)
        return value
      },
      apply(target, thisArg, argumentsList){
        const {key, result, type} = ipcRenderer.sendSync('background-data', self.id, key2, 'apply', void 0, argumentsList)
        return type == 'no-proxy' ? result : self._makeProxy(key, type)
      }
    })
  }

  getBackgroundPage(callback){
    if(this._isBackgroundPage){
      return callback ? callback(window) : window
    }

    const self = this
    const bgWindow = new Proxy({}, {
      get(target, property, receiver){
        const {key, result, type} = ipcRenderer.sendSync('background-data', self.id, null, 'get', property)
        return type == 'no-proxy' ? result : self._makeProxy(key, type)
      },
      set(target, property, value, receiver){
        const {key, result, type} = ipcRenderer.sendSync('background-data', self.id, null, 'set', property, value)
        return value
      },
      apply(target, thisArg, argumentsList){
        const {key, result, type} = ipcRenderer.sendSync('background-data', self.id, null, 'apply', void 0, argumentsList)
        return type == 'no-proxy' ? result : self._makeProxy(key, type)
      }
    })
    return callback ? callback(bgWindow) : bgWindow

  }

  openOptionsPage(callback){
    const optionPage = this._manifest.options_page || (this._manifest.options_ui && this._manifest.options_ui.page)
    //@TODO
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

    console.log(`sendMessage`, extensionId, message, options, responseCallback)
    // if (this._isBackgroundPage) {
    //   console.log('chrome.runtime.sendMessage is not supported in background page')
    //   return
    // }

    const originResultID = shortId()
    // Parse the optional args.
    let targetExtensionId = extensionId || this.id

    if(responseCallback) ipcRenderer.once(`CHROME_RUNTIME_SENDMESSAGE_RESULT_${originResultID}`, (event, result) => responseCallback(result))
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