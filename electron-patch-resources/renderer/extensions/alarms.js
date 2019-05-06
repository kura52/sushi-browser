const {Event} = require('./event')
const {ipcFuncRenderer} = require('./util')
const {ipcRenderer} = require('electron')

class Alarms {
  constructor(extensionId) {
    this._extensionId = extensionId
    this.onAlarm = new Event()

    ipcRenderer.on('CHROME_ALARMS_ONALARM', (e, wasCleared) => {
      this.onAlarm.emit(wasCleared)
    })

    for(let name of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) this[name] = name == 'constructor' ? this[name] : this[name].bind(this)
  }

  create(name, alarmInfo){
    ipcFuncRenderer(this.constructor.name, 'create', void 0, this._extensionId, name, alarmInfo)
  }

  get(name, callback){
    ipcFuncRenderer(this.constructor.name, 'get', callback, this._extensionId, name)
  }

  getAll(callback){
    ipcFuncRenderer(this.constructor.name, 'getAll', callback, this._extensionId)
  }

  clear(name, callback){
    ipcFuncRenderer(this.constructor.name, 'clear', callback, this._extensionId, name)
  }

  clearAll(callback){
    ipcFuncRenderer(this.constructor.name, 'clearAll', callback, this._extensionId)
  }
}

exports.setup = (...args) => {
  return new Alarms(...args)
}
