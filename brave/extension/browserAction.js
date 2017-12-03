const {webContents,ipcMain} = require('electron')
const {getFocusedWebContents, getCurrentWindow} = require('../../lib/util')

for(let [eventName,name] of [
  ['chrome-browser-action-set-title','title'],
  ['chrome-browser-action-set-icon','icon'],
  ['chrome-browser-action-set-popup','popup'],
  ['chrome-browser-action-registered','icon'],
  ['chrome-browser-action-registered','popup'],
  ['chrome-browser-action-set-badge-text','badge'],
  ['chrome-browser-action-set-badge-background-color','background'],
]){

  process.on(eventName, (extensionId, details) => {
    console.log(eventName, extensionId, details)
    const tabId = details.tabId
    if(tabId){
      const cont = webContents.fromTabID(tabId)
      if(cont && cont.hostWebContents) cont.hostWebContents.send(`chrome-browser-action-set-${name}-ipc-${extensionId}`,tabId,details)
    }
    else{
      for(let cont of webContents.getAllWebContents()){
        if(cont && !cont.isDestroyed() && !cont.isBackgroundPage() && !cont.hostWebContents) {
          if(name == 'icon') cont.send('chrome-browser-action-set-icon-ipc-all',extensionId,details)
          else if(name == 'popup')cont.send('chrome-browser-action-set-popup-ipc-all',extensionId,details)
        }
      }
    }
  })
}

process.on('chrome-browser-action-popup', (extensionId, tabId, name, popup, props) => {
  console.log('chrome-browser-action-popup', extensionId, tabId, name, popup, props)
  // let nodeProps = {
  //   left: props.x,
  //   top: props.y + 20,
  //   src: popup
  // }
  //
  // let win = BrowserWindow.getFocusedWindow()
  // if (!win) {
  //   return
  // }
  //
  // win.webContents.send(messages.NEW_POPUP_WINDOW, extensionId, popup, nodeProps)
})
