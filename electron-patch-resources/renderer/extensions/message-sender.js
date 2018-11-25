const { ipcRenderer } = require('electron')

module.exports = function(tabId, extensionId){
  const contents = tabId && (ipcRenderer.sendSync('get-message-sender-info', tabId))
  this.tab = contents ? Object.assign({
    audible: false,
    autoDiscardable: true,
    discarded: false,
    id: tabId }, contents) : null
  this.id = extensionId
  this.url = (contents && contents.url) || `chrome-extension://${extensionId}`
}