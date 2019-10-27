const {ipcFuncMain, ipcFuncMainCb, getIpcNameFunc, sendToBackgroundPage} = require('./util-main')
const {ipcMain} = require('electron')
const getIpcName = getIpcNameFunc('ContextMenus')
const extInfos = require('../../extensionInfos')
const sharedState = require('../../sharedStateMain')

ipcMain.on('get-extension-menu',(e) => ipcMain.emit('get-extension-menu-reply', null, sharedState.extensionMenu))

ipcMain.on('chrome-context-menus-clicked', async (e, extensionId, tabId, info)=>{
  sendToBackgroundPage(extensionId, getIpcName('onClicked'), info, tabId)
})

ipcFuncMainCb('contextMenus', 'create', (e, extensionId, createProperties, cb)=> {
  console.log('contextMenu', 'create', extensionId, createProperties)
  const manifest = extInfos[extensionId].manifest
  const icon = Object.values(manifest.icons)[0]
  const menuItemId = createProperties.id

  if(!sharedState.extensionMenu[extensionId]) sharedState.extensionMenu[extensionId] = []
  sharedState.extensionMenu[extensionId].push({properties: createProperties, menuItemId, icon})
  sharedState.extensionMenu[extensionId].sort((a,b) => (a.properties.count || 99) - (b.properties.count || 99))
  //TODO onClick
  cb()
})


ipcFuncMain('contextMenus', 'update', (e, extensionId, id, updateProperties) => {
  const menu = sharedState.extensionMenu[extensionId]
  if(menu){
    const item = menu.find(propeties=>propeties.id === id || propeties.menuItemId === id)
    if(item) Object.assign(item.properties,updateProperties)
  }
})

ipcFuncMain('contextMenus', 'remove', (e, extensionId, menuItemId) => {
  const menu = sharedState.extensionMenu[extensionId]
  if(menu){
    const i = menu.findIndex(propeties=>propeties.menuItemId === menuItemId || propeties.id === menuItemId)
    if(i != -1) menu.splice(i,1)
  }
})

ipcFuncMain('contextMenus', 'removeAll', (e, extensionId) => {
  console.log('contextMenu', 'removeAll', extensionId)
  delete sharedState.extensionMenu[extensionId]
})
