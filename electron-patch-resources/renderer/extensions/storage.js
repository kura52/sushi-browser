const { ipcRenderer } = require('electron')
const {ipcFuncRenderer} = require('./util')
const {Event} = require('./event')


const getStorage = (storageType, extensionId, cb) => {
  ipcFuncRenderer('storage', 'read', ({err, data}) => {
    if (err) throw err
    if (!cb) throw new TypeError('No callback provided')

    if (data !== null) {
      cb(JSON.parse(data))
    } else {
      // Disabled due to false positive in StandardJS
      // eslint-disable-next-line standard/no-callback-literal
      cb({})
    }
  }, storageType, extensionId)
}

const setStorage = (storageType, extensionId, storage, cb) => {
  const json = JSON.stringify(storage)
  ipcFuncRenderer('storage', 'write', err => {
    if (err) throw err
    if (cb) cb()
  }, storageType, extensionId, json)
}

const getStorageManager = (storageType, extensionId, onChanged) => {
  return {
    get (keys, callback) {
      getStorage(storageType, extensionId, storage => {
        if (keys == null) return callback(storage)

        let defaults = {}
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

        // Disabled due to false positive in StandardJS
        // eslint-disable-next-line standard/no-callback-literal
        if (keys.length === 0) return callback({})

        let items = {}
        keys.forEach(function (key) {
          var value = storage[key]
          if (value == null) value = defaults[key]
          items[key] = value
        })
        callback(items)
      })
    },

    set (items, callback) {
      getStorage(storageType, extensionId, storage => {
        const changeInfos = {}
        Object.keys(items).forEach(function (name) {
          if(storage[name] != items[name]){
            if(storage[name]){
              changeInfos[name] = {oldValue: storage[name], newValue: items[name]}
            }
            else{
              changeInfos[name] = {newValue: items[name]}
            }
          }
          storage[name] = items[name]
        })
        if(Object.keys(changeInfos).length) onChanged.emit(changeInfos, storageType)
        setStorage(storageType, extensionId, storage, callback)
      })
    },

    remove (keys, callback) {
      getStorage(storageType, extensionId, storage => {
        const changeInfos = {}
        if (!Array.isArray(keys)) {
          keys = [keys]
        }
        keys.forEach(function (key) {
          if(storage[key]) changeInfos[key] = {oldValue: storage[key]}
          delete storage[key]
        })

        if(Object.keys(changeInfos).length) onChanged.emit(changeInfos, storageType)
        setStorage(storageType, extensionId, storage, callback)
      })
    },

    clear (callback) {
      setStorage(storageType, extensionId, {}, callback)
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
