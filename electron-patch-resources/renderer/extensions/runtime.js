const {getIpcNameFunc, shortId} = require('./util')
const {Event} = require('./event')
const getIpcName = getIpcNameFunc('WebRequest')
const {ipcRenderer} = require('electron')
const Port = require('./port')
const url = require('url')


class Runtime {
  constructor(extensionId, manifest, isBackgroundPage, isExtensionPage) {
    this.id = extensionId
    this._manifest = manifest
    this._isBackgroundPage = isBackgroundPage
    this._isExtensionPage = isExtensionPage
    this.onConnect = new Event()
    this.onMessage = new Event()
    this.onInstalled = new Event()

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
  }

  getBackgroundPage(callback){
    return {} //@TODO NOOP
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
    return url.format({
      protocol: 'chrome-extension',
      slashes: true,
      hostname: this.id,
      pathname: path || "/"
    })
  }

  connect(...args) {
    console.log(`connect`, ...args)
    if (this._isBackgroundPage) {
      console.error('chrome.runtime.connect is not supported in background page')
      return
    }

    // Parse the optional args.
    let targetExtensionId = this.id
    let connectInfo = {name: ''}
    if (args.length === 1) {
      connectInfo = args[0]
    } else if (args.length === 2) {
      [targetExtensionId, connectInfo] = args
    }

    const {tabId, portId} = ipcRenderer.sendSync('CHROME_RUNTIME_CONNECT', targetExtensionId, connectInfo)
    return new Port(tabId, portId, this.id, connectInfo.name)
  }


  sendMessage(...args) {
    console.log(`sendMessage`, ...args)
    if (this._isBackgroundPage) {
      console.error('chrome.runtime.sendMessage is not supported in background page')
      return
    }

    const originResultID = shortId()
    // Parse the optional args.
    let targetExtensionId = this.id
    let message
    if (args.length === 1) {
      message = args[0]
    } else if (args.length === 2) {
      // A case of not provide extension-id: (message, responseCallback)
      if (typeof args[1] === 'function') {
        ipcRenderer.on(`CHROME_RUNTIME_SENDMESSAGE_RESULT_${originResultID}`, (event, result) => args[1](result))
        message = args[0]
      } else {
        [targetExtensionId, message] = args
      }
    } else {
      console.error('options is not supported')
      ipcRenderer.on(`CHROME_RUNTIME_SENDMESSAGE_RESULT_${originResultID}`, (event, result) => args[2](result))
    }

    ipcRenderer.send('CHROME_RUNTIME_SENDMESSAGE', targetExtensionId, message, originResultID)
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