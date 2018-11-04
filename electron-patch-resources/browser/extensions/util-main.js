const {ipcMain} = require('electron')
const {getIpcNameFunc, _shortId} = require('../../renderer/extensions/common-util')
const {getCurrentWindow, getFocusedWebContents} = require('./window-util-main')

module.exports = {
  getIpcNameFunc,
  shortId: _shortId(),
  getCurrentWindow,
  getFocusedWebContents,
  eventRegist(ipcEventName) {
    const registEventList = [], unregistEventList = [], extensionIds = {}

    ipcMain.on(`${ipcEventName}_REGIST`, function (event, extensionId, eventId, ...args) {
      if(!extensionIds[extensionId]) extensionIds[extensionId] = {}
      extensionIds[extensionId][eventId] = args

      for (let event of registEventList) {
        event(extensionId, eventId, ...args)
      }
    })

    ipcMain.on(`${ipcEventName}_UNREGIST`, function (event, extensionId, eventId) {
      for (let event of unregistEventList) {
        event(extensionId, eventId)
      }
    })

    const regist = (event) => {
      registEventList.push(event)
        // for(let [extensionId, values] of Object.entries(extensionIds)){
        //   for(let [eventId, args] of Object.entries(values)){
        //     event(extensionId, eventId, ...args)
        //   }
        // }
    }

    const unregist = (event) => {
      unregistEventList.push(event)
    }

    return {regist, unregist}
  },
  ipcFuncMain(className, method, callback){
    const name = getIpcNameFunc(className)(method)
    ipcMain.on(name, (event, requestId, ...args)=>{
      console.log(name, event, requestId, ...args)
      event.sender.send(`${name}_RESULT_${requestId}`, callback && callback(event, ...args))
    })
  },
  ipcFuncMainCb(className, method, callback){
    const name = getIpcNameFunc(className)(method)
    ipcMain.on(name, (event, requestId, ...args)=>{
      if(callback){
        callback(event, ...args, (...args2)=>{
          event.sender.send(`${name}_RESULT_${requestId}`, ...args2)
        })
      }
    })
  }
}