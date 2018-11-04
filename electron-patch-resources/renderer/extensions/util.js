const {ipcRenderer} = require('electron')
const {getIpcNameFunc, _shortId} = require('./common-util')
const deepEqual = require('./deep-equal')
const shortId = _shortId()

module.exports = {
  getIpcNameFunc,
  shortId,
  ipcFuncRenderer(className,method,callback,...args){
    const requestId = shortId()
    const name = getIpcNameFunc(className)(method)
    ipcRenderer.once(`${name}_RESULT_${requestId}`, (event,...results)=>{
      console.log(`${name}_RESULT_${requestId}`, event,...results)
      if(callback) callback(...results)
    })
    ipcRenderer.send(name, requestId, ...args)
  },
  simpleIpcFunc(name,callback,...args){
    const key = shortId()
    ipcRenderer.once(`${name}-reply_${key}`,(event,...results)=>{
      if(callback) callback(...results)
    })
    ipcRenderer.send(name,key,...args)
  },
  deepEqual
}
