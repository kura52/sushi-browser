const {ipcRenderer} = require('electron')

module.exports= function(tabId){
  return ipcRenderer.sendSync('CHROME_TABS_TAB_VALUE', tabId)
}