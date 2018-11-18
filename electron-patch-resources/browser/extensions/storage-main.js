const path = require('path')
const fs = require('fs')
const {app, ipcMain} = require('electron')
const { ipcFuncMainCb } = require('./util-main')

module.exports = function(manifestMap){
  let makeDir = false

  let gData
  const getChromeStoragePath = (storageType, extensionId) => {
    return path.join(
      app.getPath('userData'), `/Chrome Storage/${extensionId}-${storageType}.json`)
  }

  const mkdirp = (dir, callback) => {
    fs.mkdir(dir, (error) => {
      if (error && error.code === 'ENOENT') {
        mkdirp(path.dirname(dir), (error) => {
          if (!error) {
            mkdirp(dir, callback)
          }
        })
      } else if (error && error.code === 'EEXIST') {
        callback(null)
      } else {
        callback(error)
      }
    })
  }

  const readChromeStorageFile = (storageType, extensionId, keys, cb) => {
    if(!gData) {
      const filePath = getChromeStoragePath(storageType, extensionId)
      try {
        gData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      } catch (e) {
        gData = {}
        return cb({err: null, data: null})
      }
    }
    let ret
    console.log(keys)
    if(keys){
      ret = {}
      for(let key of keys){
        ret[key] = gData[key]
      }
    }
    else{
      ret = gData
    }
    return cb({err: null, data: ret})
  }

  let timeOutId, writting
  const delayWrite = (storageType, extensionId)=>{
    if(writting){
      setTimeout(()=>delayWrite(storageType, extensionId),100)
      return
    }
    writting = true
    const filePath = getChromeStoragePath(storageType, extensionId)
    if(!makeDir){
      mkdirp(path.dirname(filePath), err => {
        if (!err){
          makeDir = true
          fs.writeFile(filePath, JSON.stringify(gData), err => {
            writting = false
          })
        }
      })
      makeDir = true
    }
    else{
      fs.writeFile(filePath, JSON.stringify(gData), err => {
        writting = false
      })
    }
  }

  const writeChromeStorageFile = (storageType, extensionId, type, data, cb) => {
    if(type == 'clear'){
      try {
        const filePath = getChromeStoragePath(storageType, extensionId)
        fs.writeFileSync(filePath, '{}')
        gData = {}
        cb({})
      } catch (err) {
        cb({err})
      }
    }
    else{
      if(!gData) {
        const filePath = getChromeStoragePath(storageType, extensionId)
        try {
          gData = fs.readFileSync(filePath, 'utf8')
        } catch (e) {
          gData = {}
        }
      }

      if(type == 'remove'){
        const changeInfos = {}
        for(let key of data){
          if(gData[key]) changeInfos[key] = {oldValue: gData[key]}
          delete gData[key]
        }
        cb({data: changeInfos})
      }
      else if(type == 'set'){
        if(!data) return cb({data: {}})
        const changeInfos = {}
        Object.keys(data).forEach(function (name) {
          if(gData[name] != data[name]){
            if(gData[name]){
              changeInfos[name] = {oldValue: gData[name], newValue: data[name]}
            }
            else{
              changeInfos[name] = {newValue: data[name]}
            }
          }
          gData[name] = data[name]
        })
        cb({data: changeInfos})
      }
    }
    clearTimeout(timeOutId)
    timeOutId = setTimeout(()=>delayWrite(storageType, extensionId), 5000)
  }

  ipcFuncMainCb('storage','read',(e,storageType, extensionId, keys, cb)=>{
    readChromeStorageFile(storageType, extensionId, keys, cb)
  })

  ipcFuncMainCb('storage','write',(e,storageType, extensionId, type, data, cb)=>{
    writeChromeStorageFile(storageType, extensionId, type, data, cb)
  })
}