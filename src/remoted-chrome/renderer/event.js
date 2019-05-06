const {getIpcNameFunc} = require('./util')

export default function(ipcRenderer){
  class Event {
    constructor (firstExecuteCallback) {
      this.listeners = []
      this.firstExecuteCallback = firstExecuteCallback
      this.first = false

      for(let name of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) this[name] = name == 'constructor' ? this[name] : this[name].bind(this)
    }

    addListener (callback) {
      console.log('addListener', this)
      if(this.first){
        this.firstExecuteCallback && this.firstExecuteCallback()
        this.first = true
      }
      this.listeners.push(callback)
    }

    removeListener (callback) {
      const index = this.listeners.indexOf(callback)
      if (index !== -1) {
        this.listeners.splice(index, 1)
      }
    }

    hasListener (callback) {
      return this.listeners.some(ele => ele == callback)
    }

    hasListeners () {
      return !!this.listeners.length
    }

    emit (...args) {
      for (const listener of this.listeners) {
        listener(...args)
      }
    }
  }

  class Event2 {
    constructor (name, method, extensionId, needReturn) {
      this.listeners = new Map()
      this.name = name
      this.method = method
      this.extensionId = extensionId
      this.needReturn = needReturn
      this.ipcName = getIpcNameFunc(name)(method, extensionId)
      ipcRenderer.on(this.ipcName, (event, ...args) => this.emit(...args))

      for(let name of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) this[name] = name == 'constructor' ? this[name] : this[name].bind(this)
    }

    addListener (callback, ...args) {
      const eventId = Math.random().toString()
      console.log('addListener',this.name,this.method,this.extensionId,callback,eventId)
      this.listeners.set(eventId, callback)
      ipcRenderer.send(`${getIpcNameFunc(this.name)(this.method)}_REGIST`, this.extensionId, eventId, ...args)
    }

    removeListener (callback) {
      for(let [eventId, _callback] of this.listeners){
        if(_callback == callback){
          this.listeners.delete(eventId)
          ipcRenderer.send(`${getIpcNameFunc(this.name)(this.method)}_UNREGIST`, this.extensionId, eventId)
          break
        }
      }
    }

    hasListener (callback) {
      for(let [eventId, _callback] of this.listeners){
        if(_callback == callback){
          return true
        }
      }
      return false
    }

    hasListeners () {
      return !!this.listeners.size
    }

    emit (eventId, ...args) {
      // console.log('emit', this.name,this.method,this.extensionId,eventId, ...args)
      try{
        const result = this.listeners.get(eventId)(...args)
        if(this.needReturn) ipcRenderer.send(`${this.ipcName}_${eventId}_RESULT`, result)
      }catch(e){
        console.log(e, 'emit', this.name,this.method,this.extensionId,eventId, ...args)
      }
    }
  }

  return {Event, Event2}
}
