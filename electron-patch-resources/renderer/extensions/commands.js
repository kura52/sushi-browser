const {Event2} = require('./event')
const {getIpcNameFunc, simpleIpcFunc} = require('./util')
const {ipcRenderer} = require('electron')

class Commands {
  constructor (extensionId, manifest) {
    const getIpcName = getIpcNameFunc(this.constructor.name)
    this.onCommand = new Event2(this.constructor.name, 'onCommand', extensionId)
    this._manifest = manifest

    for(let name of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) this[name] = name == 'constructor' ? this[name] : this[name].bind(this)
  }

  getAll(callback){
    const results = []
    const commands = this._manifest.commands
    if(commands){
      const process = ipcRenderer.sendSync('get-process-info')
      const plat = process.platform == 'win32' ? 'windows' : process.platform == 'darwin' ? 'mac' : 'linux'
      for(let [command,val] of Object.entries(commands)){
        if(val.suggested_key){
          results.push({
            name:command,
            shortcut:val.suggested_key[plat] || val.suggested_key.default,
            description: val.description
          })
        }
      }
      callback(results)
    }
  }
}

exports.setup = (...args) => {
  return new Commands(...args)
}
