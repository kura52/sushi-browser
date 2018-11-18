const {ipcRenderer} = require('electron')
const {Event} = require('./event')
const Tab = require('./tab')
const MessageSender = require('./message-sender')

module.exports = class Port {
  constructor (tabId, portId, extensionId, name) {
    this.tabId = tabId
    this.portId = portId
    this.disconnected = false

    this.name = name
    this.onDisconnect = new Event()
    this.onMessage = new Event()
    this.sender = new MessageSender(tabId, extensionId)

    ipcRenderer.once(`CHROME_PORT_DISCONNECT_${portId}`, () => {
      this._onDisconnect()
    })
    ipcRenderer.on(`CHROME_PORT_POSTMESSAGE_${portId}`, (event, message) => {
      const sendResponse = function () { console.error('sendResponse is not implemented') }
      this.onMessage.emit(message, this)
    })

    for(let name of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) this[name] = name == 'constructor' ? this[name] : this[name].bind(this)
  }

  disconnect () {
    if (this.disconnected) return

    ipcRenderer.sendToAll(this.tabId, `CHROME_PORT_DISCONNECT_${this.portId}`)
    this._onDisconnect()
  }

  postMessage (message) {
    console.log('postMessage',message)
    ipcRenderer.sendToAll(this.tabId, `CHROME_PORT_POSTMESSAGE_${this.portId}`, message)
  }

  _onDisconnect () {
    this.disconnected = true
    ipcRenderer.removeAllListeners(`CHROME_PORT_POSTMESSAGE_${this.portId}`)
    this.onDisconnect.emit()
  }
}