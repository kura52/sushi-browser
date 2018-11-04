const {ipcFuncRenderer} = require('./util')

class BrowsingData {
  constructor () {
    this.types = {appcache : true, cache : true, cookies : true, downloads : true, fileSystems : true, formData : true, history : true, indexedDB : true, localStorage : true, serverBoundCertificates : false, passwords : true, pluginData : false, serviceWorkers : true, webSQL : true}
    for(let key of Object.keys(this.types)){
      this[`remove${key.charAt(0).toUpperCase()}${key.slice(1)}`] = (options,callback) => this.remove(options,{[key]: true},callback)
    }
  }

  settings(callback){
    callback({options:{},dataToRemove:types,DataTypeSet:types})
  }

  remove(options,dataToRemove,callback){
    ipcFuncRenderer(this.constructor.name, 'remove', callback,options,dataToRemove)
  }
}

exports.setup = (...args) => {
  return new BrowsingData(...args)
}
