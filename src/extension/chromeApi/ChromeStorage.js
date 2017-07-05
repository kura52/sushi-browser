//Copy from electron/lib/renderer/extensions/storage.js


export default class ChromeStorage {
  constructor(appId){
    this.appId = appId
    this.sync = this.getStorageManager('sync', appId)
    this.local = this.getStorageManager('local', appId)
    this.managed = this.getStorageManager('managed', appId)

    this.onChanged = ::this.addEvent()
    this.listeners = []
  }

  addEvent() {
    const addListener = (callback)=>{
      this.listeners.push(callback)
    }
    return {
      addListener
    }
  }

  getStorage(storageType){
    const data = window.localStorage.getItem(`__chrome.storage.${storageType}__${this.appId}`)
    if (data != null) {
      return JSON.parse(data)
    } else {
      return {}
    }
  }

  setStorage(storageType, storage){
    const json = JSON.stringify(storage)
    window.localStorage.setItem(`__chrome.storage.${storageType}__${this.appId}`, json)
    // console.log(`__chrome.storage.${storageType}__${this.appId}`, json)
  }

  scheduleCallback(items, callback){
    setTimeout(function () {
      callback(items)
    })
  }

  getStorageManager(storageType){
    const self = this
    return {
      get (keys, callback) {
        const storage = self.getStorage(storageType)
        if (keys == null) return self.scheduleCallback(storage, callback)

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
        if (keys.length === 0) return self.scheduleCallback({}, callback)

        let items = {}
        keys.forEach(function (key) {
          var value = storage[key]
          if (value == null) value = defaults[key]
          items[key] = value
        })
        self.scheduleCallback(items, callback)
      },

      set (items, callback) {
        const storage = self.getStorage(storageType)

        const changes = {}
        Object.keys(items).forEach(function (name) {
          const oldValue = storage[name]
          storage[name] = items[name]
          changes[name] = {oldValue,newValue:items[name]}
        })

        self.setStorage(storageType, storage)

        for(let listen of self.listeners){
          listen(changes,storageType)
        }
        setTimeout(callback)
      },

      remove (keys, callback) {
        const storage = self.getStorage(storageType)

        if (!Array.isArray(keys)) {
          keys = [keys]
        }
        keys.forEach(function (key) {
          delete storage[key]
        })

        self.setStorage(storageType, storage)

        setTimeout(callback)
      },

      clear (callback) {
        self.setStorage(storageType, {})

        setTimeout(callback)
      }
    }
  }

}