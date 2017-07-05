import { app, Menu,  BrowserWindow, ipcMain, webContents } from 'electron'

process.on('chrome-browser-action-registered', (extensionId, details) => {
  console.log('chrome-browser-action-registered',extensionId)
})

process.on('chrome-browser-action-set-icon', (extensionId, details) => {
  console.log('chrome-browser-action-set-icon',extensionId)
})

process.on('chrome-browser-action-set-badge-text', (extensionId, details) => {
  console.log('chrome-browser-action-set-badge-text')
})

process.on('chrome-browser-action-set-badge-background-color', (extensionId, details) => {
  console.log('chrome-browser-action-set-badge-background-color')
})

process.on('chrome-browser-action-set-title', (extensionId, details) => {
  console.log('chrome-browser-set-title')
})

process.on('chrome-tabs-created', (tabId) => {
  // rlog('chrome-tabs-created',tabId)
})

process.on('chrome-tabs-updated', (tabId,changeInfo,tab) => {
  // if(changeInfo.status == "complete") return
  if(changeInfo.status == "complete" ||
    (changeInfo.active === (void 0) &&
    changeInfo.pinned === (void 0))) return
  // console.log(tabId,tab)
  const cont = webContents.fromTabID(tabId)
  if(cont && !cont.isDestroyed() && !cont.isBackgroundPage() && cont.isGuest()) {
    if(cont.hostWebContents) cont.hostWebContents.send('chrome-tabs-event', {tabId,changeInfo}, 'updated')
  }
})


process.on('chrome-tabs-removed', (tabId) => {
  rlog('chrome-tabs-removed', tabId)
  const wins = BrowserWindow.getAllWindows()
  if(!wins) return

  for(let win of wins.filter(w=>w.getTitle().includes('Sushi Browser'))){
    try {
      if(!win.webContents.isDestroyed()){
        win.webContents.send('chrome-tabs-event', {tabId}, 'removed');
      }
    }catch(e){
      // console.log(e)
    }
  }
})

let extensionMenu = {}
process.on('chrome-context-menus-remove-all', (extensionId) => {
  delete extensionMenu[extensionId]
})

process.on('chrome-context-menus-create', (extensionId, menuItemId, properties, icon) => {
  if(!extensionMenu[extensionId]) extensionMenu[extensionId] = []
  extensionMenu[extensionId].push({properties, menuItemId, icon})
})

export default extensionMenu