const { ipcRenderer } = require('electron')
const {ipcFuncRenderer} = require('./util')
const {Event} = require('./event')


const getData = (storageType, extensionId, keys, cb) => {
  ipcFuncRenderer('storage', 'read', ({err, data}) => {
    if (err) throw err
    if (!cb) throw new TypeError('No callback provided')

    if (data !== null) {
      cb(data)
    } else {
      // Disabled due to false positive in StandardJS
      // eslint-disable-next-line standard/no-callback-literal
      cb({})
    }
  }, storageType, extensionId, keys)
}

const setStorage = (storageType, extensionId, type, data, cb) => {
  ipcFuncRenderer('storage', 'write', ({err,data}) => {
    if (err) throw err
    if (cb) cb(data)
  }, storageType, extensionId, type, data)
}

const getStorageManager = (storageType, extensionId, onChanged) => {
  return {
    get (keys, callback) {
      let defaults = {}
      if(typeof keys === 'function') [keys,callback] = [null,keys]
      if(keys != null){
        switch (typeof keys) {
          case 'string':
            keys = [keys]
            break
          case 'object':
            if (!Array.isArray(keys)) {
              defaults = keys
              keys = Object.keys(keys)
            }
            break
        }
      }
      getData(storageType, extensionId, keys,  data => {
        if (keys == null) return callback(data)

        // Disabled due to false positive in StandardJS
        // eslint-disable-next-line standard/no-callback-literal
        if (keys.length === 0) return callback({})

        let items = {}
        keys.forEach(function (key) {
          var value = data[key]
          if (value == null) value = defaults[key]
          if (value != null) items[key] = value
        })
        callback(items)
      })
    },

    set (items, callback) {
      if(!items) return callback && callback()
      const changeInfos = {}
      if(Object.keys(changeInfos).length) onChanged.emit(changeInfos, storageType)
      setStorage(storageType, extensionId, 'set', items, changeInfos => {
        if(callback) callback()
        if(Object.keys(changeInfos).length) onChanged.emit(changeInfos, storageType)
      })
    },

    remove (keys, callback) {
      if (!Array.isArray(keys)) {
        keys = [keys]
      }

      setStorage(storageType, extensionId, 'remove', keys, changeInfos => {
        if(callback) callback()
        if(Object.keys(changeInfos).length) onChanged.emit(changeInfos, storageType)
      })
    },

    clear (callback) {
      setStorage(storageType, extensionId, 'clear', callback)
    }
  }
}

module.exports = {
  setup: extensionId => {
    const onChanged = new Event()
    return {
      sync: getStorageManager('sync', extensionId, onChanged),
      local: getStorageManager('local', extensionId, onChanged),
      managed: getStorageManager('managed', extensionId, onChanged), //@TODO FIX
      onChanged
    }
  }
}
