const {ipcFuncRenderer} = require('./util')

exports.setup = (extensionId) => {
  return {
    getAll(callback){
      ipcFuncRenderer('management', 'getAll', callback)
    },
    get(id,callback){
      ipcFuncRenderer('management', 'get', callback, id)
    },
    getSelf(callback){
      ipcFuncRenderer('management', 'get', callback, extensionId)
    }
  }
}
