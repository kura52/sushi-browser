const {ipcFuncMainCb,getIpcNameFunc} = require('./util-main')
const { ipcMain} = require('electron')

module.exports = function(){
  ipcFuncMainCb('BrowsingData','remove', (e,options,dataToRemove,cb)=>{
    if(options.since) return cb()

    const arr = ['cookies','appcache','fileSystems','indexedDB','localStorage','serviceWorkers','webSQL']
    const map = {cache: 'clearCache',downloads: 'clearDownload',formData: 'clearAutofillData', history: 'clearHistory',passwords: 'clearPassword'}

    for(let [key,val] of Object.entries(dataToRemove)){
      if(val) continue
      let args
      if(arr.includes(key)){
        args = ['clearStorageData',{storages: [key]}]
      }
      else if(map[key]){
        args = [map[key]]
      }
      if(args) ipcMain.emit('clear-browsing-data',null,...args)
    }
    cb()
  })

}