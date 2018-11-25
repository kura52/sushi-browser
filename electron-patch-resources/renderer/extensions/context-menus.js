const {Event} = require('./event')
const {getIpcNameFunc, ipcFuncRenderer, shortId} = require('./util')
const {ipcRenderer} = require('electron')

class ContextMenus {
  constructor(extensionId) {
    this._extensionId = extensionId
    this.onClicked = new Event()
    this.onClickEvents = {}

    ipcRenderer.on('CHROME_CONTEXTMENUS_ONCLICKED',(e, info, tab)=>{
      this.onClicked.emit(info, tab)
      const onClick = this.onClickEvents[info.menuItemId]
      if(onClick) onClick(info, tab)
    })

    for(let name of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) this[name] = name == 'constructor' ? this[name] : this[name].bind(this)
  }

  create(createProperties, callback) {
    if(!createProperties.id) createProperties.id = shortId()
    if(createProperties.onclick){
      // this.onClicked.addListener(createProperties.onclick)
      this.onClickEvents[createProperties.id] = createProperties.onclick
      delete createProperties.onclick
    }
    ipcFuncRenderer(this.constructor.name, 'create', callback, this._extensionId, createProperties)
  }

  update(id, updateProperties, callback) {
    if(updateProperties.onclick){
      // if(this.onClickEvents[id]) this.onClicked.removeListener(this.onClickEvents[id])
      // this.onClicked.addListener(updateProperties.onclick)
      this.onClickEvents[id] = updateProperties.onclick
      delete updateProperties.onclick
    }
    ipcFuncRenderer(this.constructor.name, 'update', callback, this._extensionId, id, updateProperties)
  }

  remove(menuItemId, callback){
    ipcFuncRenderer(this.constructor.name, 'remove', callback, this._extensionId, menuItemId)
  }

  removeAll(callback) {
    ipcFuncRenderer(this.constructor.name, 'removeAll', callback, this._extensionId)
  }
}

exports.setup = (...args) => {
  return new ContextMenus(...args)
}
