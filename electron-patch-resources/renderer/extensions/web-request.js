const {Event2} = require('./event')
const {getIpcNameFunc} = require('./util')
const {ipcRenderer} = require('electron')

class WebRequest {
  constructor (extensionId) {
    const getIpcName = getIpcNameFunc(this.constructor.name)

    for(let method of [
      'onAuthRequired',
      'onBeforeRedirect',
      'onBeforeRequest',
      'onBeforeSendHeaders',
      'onCompleted',
      'onErrorOccurred',
      'onHeadersReceived',
      'onResponseStarted',
      'onSendHeaders'
    ]){

      this[method] = new Event2(this.constructor.name, method, extensionId, true)
    }
  }
}

exports.setup = (...args) => {
  return new WebRequest(...args)
}
