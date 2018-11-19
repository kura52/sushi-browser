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
    let success
    const id = setTimeout(()=>{
      success = true
      console.log(`${name}_RESULT_ERROR_${requestId}`, {}, null)
      if(callback) callback(null)
    },2000)

    ipcRenderer.once(`${name}_RESULT_${requestId}`, (event,...results)=>{
      if(success) return
      clearTimeout(id)
      console.log(`${name}_RESULT_${requestId}`, event,...results)
      if(callback) callback(...results)
    })
    ipcRenderer.send(name, requestId, ...args)
  },
  simpleIpcFunc(name,callback,...args){
    const key = shortId()
    let success
    const id = setTimeout(()=>{
      success = true
      console.log(`${name}-reply_ERROR_${key}`, {}, null)
      if(callback) callback(null)
    },2000)
    ipcRenderer.once(`${name}-reply_${key}`,(event,...results)=>{
      if(success) return
      clearTimeout(id)
      if(callback) callback(...results)
    })
    ipcRenderer.send(name,key,...args)
  },
  deepEqual
}
