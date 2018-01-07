import {ipcMain} from 'electron'
const extensionMenu = require('./chromeEvents')
const extensionInfos = require('./extensionInfos')
import path from 'path'

function onContextMenu(pageURL, tabId) {
  const menuItems = []
  if (Object.keys(extensionMenu).length) {
    for (let [extensionId, propertiesList] of Object.entries(extensionMenu)) {
      const menuList = []
      for (let {properties, menuItemId, icon} of propertiesList) {
        let contextsPassed = false
        const info = {}
        for (let context of properties.contexts) {
          if (pageURL && context == 'tab') {
            info['pageUrl'] = pageURL
            contextsPassed = true;
          }
        }
        if(!contextsPassed) return []

        info['menuItemId'] = menuItemId

        const item = {
          label: properties.title,
          data: [extensionId, tabId, info]
        }
        if (menuItemId) item.menuItemId = menuItemId
        if (properties.checked !== void 0) item.checked = properties.checked
        if (properties.enabled !== void 0) item.enabled = properties.enabled
        if (properties.documentUrlPatterns !== void 0) {
          const url = pageURL
          // console.log('documentUrlPatterns',url,properties.documentUrlPatterns)
          if (url && !nm.some(url, properties.documentUrlPatterns.map(x => x == '<all_urls>' ? "**" : x.replace(/\*/, '**')))) {
            item.hide = true
          }
        }
        if (!item.hide) {
          const addItem = properties.type == "separator" ? {type: 'separator'} : item
          let parent
          if (properties.parentId && (parent = menuList.find(m => m.menuItemId == properties.parentId))) {
            if (properties.icons) addItem.icon = path.join(extensionInfos[extensionId].base_path, Object.values(properties.icons)[0].replace(/\.svg$/, '.png'))
            if (parent.submenu === void 0) {
              parent.submenu = [addItem]
            }
            else {
              parent.submenu.push(addItem)
            }
          }
          else {
            if(icon) addItem.icon = path.join(extensionInfos[extensionId].base_path, icon)
            if (properties.icons) addItem.icon2 = path.join(extensionInfos[extensionId].base_path, Object.values(properties.icons)[0].replace(/\.svg$/, '.png'))
            menuList.push(addItem)
          }
        }
      }
      if (menuList.length == 1 || menuList.length == 2) {
        menuItems.push({type: 'separator'})
        for (let menu of menuList) {
          if (menu.icon2) {
            menu.icon = menu.icon2
            delete menu.icon2
          }
          menuItems.push(menu)
        }
      }
      else if (menuList.length > 2) {
        menuItems.push({type: 'separator'})
        menuItems.push({
          label: extensionInfos[extensionId].name,
          icon: menuList[0].icon.replace(/\.svg$/,'.png'),
          submenu: menuList
        })
        menuList.forEach(menu => {
          delete menu.icon
          if (menu.icon2) {
            menu.icon = menu.icon2
            delete menu.icon2
          }
        })
      }
    }
  }
  return menuItems
};

ipcMain.on('get-tab-contextMenu',(e,key,pageURL,tabId)=>{
  try{
    e.returnValue = onContextMenu(pageURL,tabId)
  }catch(e){
    e.returnValue = []
  }
})

ipcMain.on('tab-contextMenu-clicked',(e,data)=>{
  process.emit('chrome-context-menus-clicked', ...data)
})