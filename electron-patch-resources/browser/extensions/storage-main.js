const path = require('path')
const fs = require('fs')
const {app, ipcMain} = require('electron')
const { ipcFuncMainCb } = require('./util-main')

module.exports = function(manifestMap){

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

  const readChromeStorageFile = (storageType, extensionId, cb) => {
    const filePath = getChromeStoragePath(storageType, extensionId)
    console.log(filePath)
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err && err.code === 'ENOENT') {
        return cb({err:null, data:null})
      }
      cb({err, data})
    })
  }

  const writeChromeStorageFile = (storageType, extensionId, data, cb) => {
    const filePath = getChromeStoragePath(storageType, extensionId)

    mkdirp(path.dirname(filePath), err => {
      if (err) { /* we just ignore the errors of mkdir or mkdirp */ }
      fs.writeFile(filePath, data, cb)
    })
  }

  ipcFuncMainCb('storage','read',(e,storageType, extensionId,cb)=>{
    readChromeStorageFile(storageType, extensionId,cb)
  })

  ipcFuncMainCb('storage','write',(e,storageType, extensionId, json, cb)=>{
    writeChromeStorageFile(storageType, extensionId, json, cb)
  })
}