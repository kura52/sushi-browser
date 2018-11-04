const {ipcFuncMain, ipcFuncMainCb, getIpcNameFunc} = require('./util-main')
const {session, ipcMain} = require('electron')
const getIpcName = getIpcNameFunc('ContextMenus')

module.exports = function(manifestMap, sendToBackgroundPage, getTabValue) {
  const extensionMenu = {}

  ipcMain.on('get-extension-menu',(e) => ipcMain.emit('get-extension-menu-reply', null, extensionMenu))

  ipcMain.on('chrome-context-menus-clicked', (e, extensionId, tabId, info)=>{
    sendToBackgroundPage(extensionId, getIpcName('onClicked'), info, getTabValue(tabId))
  })

  ipcFuncMainCb('contextMenus', 'create', (e, extensionId, createProperties, cb)=> {
    const manifest = manifestMap[extensionId]
    const icon = Object.values(manifest.icons)
    const menuItemId = createProperties.id

    if(!extensionMenu[extensionId]) extensionMenu[extensionId] = []
    extensionMenu[extensionId].push({createProperties, menuItemId, icon})
    //TODO onClick
    cb()
  })


  ipcFuncMain('contextMenus', 'update', (e, extensionId, id, updateProperties) => {
    const menu = extensionMenu[extensionId]
    if(menu){
      const item = menu.find(propeties=>propeties.id === id || propeties.menuItemId === id)
      if(item) Object.assign(item.properties,updateProperties)
    }
  })

  ipcFuncMain('contextMenus', 'remove', (e, extensionId, menuItemId) => {
    const menu = extensionMenu[extensionId]
    if(menu){
      const i = menu.findIndex(propeties=>propeties.menuItemId === menuItemId || propeties.id === menuItemId)
       if(i != -1) menu.splice(i,1)
    }
  })

  ipcFuncMain('contextMenus', 'removeAll', (e, extensionId) => {
    delete extensionMenu[extensionId]
  })

}