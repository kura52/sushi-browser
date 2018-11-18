const {webContents,ipcMain} = require('electron')
const {getFocusedWebContents, getCurrentWindow} = require('../../lib/util')
const mainState = require('../../lib/mainState')

mainState.browserActionDefaultIcons = {}
mainState.browserActionPopups = {}
mainState.browserActionBgs = {}
mainState.browserActionTitles = {}
mainState.browserActionTexts = {}

function setMainState(extensionId,name,val){
  if(val.path){
    let _icon = typeof val.path === "object" ? Object.values(val.path)[0] : val.path
    if(_icon.startsWith('chrome-extension://')) _icon = _icon.split("/").slice(3).join("/")
    mainState.browserActionDefaultIcons[extensionId] = _icon
  }
  else if(val.popup){
    mainState.browserActionPopups[extensionId] = val.popup
  }
  else if(val.color){
    if(Array.isArray(val.color)){
      val.color = `rgba(${val.color.join(',')})`
    }
    mainState.browserActionBgs[extensionId] = val.color
  }
  else if(val.text){
    mainState.browserActionTexts[extensionId] = val.text
  }
  else if(val.title){
    mainState.browserActionTitles[extensionId] = val.title
  }
}


for(let [eventName,name] of [
  ['chrome-browser-action-set-title','title'],
  ['chrome-browser-action-set-icon','icon'],
  ['chrome-browser-action-set-popup','popup'],
  ['chrome-browser-action-registered','icon'],
  ['chrome-browser-action-registered','popup'],
  ['chrome-browser-action-set-badge-text','badge'],
  ['chrome-browser-action-set-badge-background-color','background'],
]){

  ipcMain.on(eventName, (e, extensionId, details) => {
    console.log(eventName, extensionId, details)
    const tabId = details.tabId
    if(tabId){
      const cont = webContents.fromId(tabId)
      if(cont && cont.hostWebContents2) cont.hostWebContents2.send(`chrome-browser-action-set-${name}-ipc-${extensionId}`,tabId,details)
    }
    else{
      for(let cont of webContents.getAllWebContents()){
        if(cont && !cont.isDestroyed() /*&& !cont.isBackgroundPage()*/ && !cont.hostWebContents2) {
          cont.send(`chrome-browser-action-set-${name}-ipc-${extensionId}`,null ,details)
          cont.send(`chrome-browser-action-set-ipc-all`,extensionId,name,details)
          setMainState(extensionId,name,details)
        }
      }
    }
  })
}
