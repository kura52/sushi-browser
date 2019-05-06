const {Event2} = require('./event')
const {getIpcNameFunc, simpleIpcFunc} = require('./util')
const {ipcRenderer} = require('electron')

class WebNavigation {
  constructor (extensionId) {
    const getIpcName = getIpcNameFunc(this.constructor.name)

    for(let method of ['onBeforeNavigate', 'onCompleted', 'onDOMContentLoaded', 'onCommitted', 'onErrorOccurred', 'onCreatedNavigationTarget']){
      this[method] = new Event2(this.constructor.name, method, extensionId)
    }

    for(let name of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) this[name] = name == 'constructor' ? this[name] : this[name].bind(this)
  }

  getFrame(details, callback){
    this.getAllFrames(details, (results) =>{
      for(let result of results){
        if(details.frameId == result.frameId && (!details.processId || details.processId == result.processId)){
          callback(result)
          return
        }
      }
    })
  }

  getAllFrames(details, callback){
    simpleIpcFunc('chrome-webNavigation-getAllFrames',callback,details)
  }
}

exports.setup = (...args) => {
  return new WebNavigation(...args)
}
