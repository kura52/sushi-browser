const {ipcFuncMain, ipcFuncMainCb,getIpcNameFunc, getCurrentWindow} = require('./util-main')
const {app, ipcMain, BrowserWindow} = require('electron')

const getIpcName = getIpcNameFunc('Windows')


async function windowInfo(win, populateTabs, tabsQuery) {
  const  bounds = win.getBounds()
  return {
    incognito: false, //@TODO FIX
    id: win.id,
    focused: win.isFocused(),
    state: win.isDestroyed() ? 'normal' : win.isMinimized() ? 'minimized' : win.isMaximized() ? 'maximized' : win.isFullScreen() ? 'fullscreen' : 'normal',
    type: 'normal',
    top: bounds.y,
    left: bounds.x,
    width: bounds.width,
    height: bounds.height,
    alwaysOnTop: win.isAlwaysOnTop(),
    tabs: populateTabs ? (await new Promise(r=>tabsQuery({windowId: win.id}, r))) : null
  }
}

module.exports = function(manifestMap, sendToBackgroundPages, tabsQuery){

  app.on('browser-window-created', async (event, window)=>{
    window.once('close', (event)=>{
      sendToBackgroundPages('CHROME_WINDOWS_ONREMOVED', window.id)
    })
    sendToBackgroundPages('CHROME_WINDOWS_ONCREATED', await windowInfo(window, false, tabsQuery))
  })

  app.on('browser-window-blur', (event, window)=>{
    sendToBackgroundPages('CHROME_WINDOWS_ONFOCUSCHANGED', window.id)
  })

  app.on('browser-window-focus', (event, window)=>{
    sendToBackgroundPages('CHROME_WINDOWS_ONFOCUSCHANGED', window.id)
  })

  ipcFuncMainCb('windows','get', async (e, windowId, getInfo, cb) => {
    // if (getInfo && getInfo.windowTypes) {
    //   console.warn('getWindow with windowTypes not supported yet')
    // }

    const win = BrowserWindow.fromId(windowId)
    if (getInfo && getInfo.populate) {
      cb(await windowInfo(win, getInfo.populate, tabsQuery))
    }
    else {
      cb(await windowInfo(win, false, tabsQuery))
    }
  })

  ipcFuncMainCb('windows','getCurrent', async (e, getInfo, cb) => {
    // if (getInfo && getInfo.windowTypes) {
    //   console.warn('getWindow with windowTypes not supported yet')
    // }

    const win = getCurrentWindow()
    if (getInfo && getInfo.populate) {
      cb(await windowInfo(win, getInfo.populate, tabsQuery))
    }
    else {
      cb(await windowInfo(win, false, tabsQuery))
    }
  })

  ipcFuncMainCb('windows','getAll', async (e, getInfo, cb) => {
    // if (getInfo && getInfo.windowTypes) {
    //   console.warn('getWindow with windowTypes not supported yet')
    // }

    const wins = []
    for(let win of BrowserWindow.getAllWindows()){
      if (getInfo && getInfo.populate) {
        wins.push(await windowInfo(win, getInfo.populate, tabsQuery))
      }
      else {
        wins.push(await windowInfo(win, false, tabsQuery))
      }
    }
    cb(wins)
  })

  ipcFuncMainCb('windows', 'create', (e, createData, cb) => {
    if(createData.tabId){
      const wins = BrowserWindow.getAllWindows()
      if(!wins) return

      for(let win of wins.filter(w=>w.getTitle().includes('Sushi Browser'))){
        try {
          if(!win.webContents.isDestroyed()){
            win.webContents.send('chrome-windows-create-from-tabId',createData);
          }
        }catch(e){
          // console.log(e)
        }
      }
    }
    else{
      ipcMain.emit('browser-load', {}, {id:getCurrentWindow().id,x:createData.left,y:createData.top,
        height:createData.height,width:createData.width,
        tabParam:JSON.stringify({urls:[{url:createData.url,privateMode:false}],type:'new-win'})})
      setTimeout(async ()=>{
        let max = [-999]
        for(let win of BrowserWindow.getAllWindows()){
          if(win.id > max[0]) max = [win.id, win]
        }
        let win
        for(let i=0;i<30;i++){
          win = await windowInfo(max[1], true, tabsQuery)
          if(win.tabs.length) break
          await new Promise(r=>setTimeout(async ()=>{
            win = await windowInfo(max[1], true, tabsQuery)
            r()
          },100))
        }
        cb(win)
      },100)
    }
  })

  ipcFuncMain('windows','remove',(e, windowId)=> {
    const win = windowId ? BrowserWindow.fromId(windowId) : getCurrentWindow()
    win && win.close()
  })

  ipcFuncMain('windows','getLastFocused',(e, windowId)=> {
    const win = getCurrentWindow()
    return win && win.id
  })


  ipcFuncMainCb('windows', 'update', async (e, windowId, updateInfo, cb)=> {
    let win = BrowserWindow.fromId(windowId)

    if (win) {
      if (updateInfo.focused) {
        win.focus()
      }

      if (updateInfo.left || updateInfo.top ||
        updateInfo.width || updateInfo.height) {
        let bounds = win.getBounds()
        bounds.x = updateInfo.left || bounds.x
        bounds.y = updateInfo.top || bounds.y
        bounds.width = updateInfo.width || bounds.width
        bounds.height = updateInfo.height || bounds.height
        win.setBounds(bounds)
      }

      switch (updateInfo.state) {
        case 'minimized':
          win.minimize()
          break
        case 'maximized':
          win.maximize()
          break
        case 'fullscreen':
          win.setFullScreen(true)
          break
      }

      cb(await windowInfo(win, false, tabsQuery))
    } else {
      console.warn('chrome.windows.update could not find windowId ' + windowId)
      return {}
    }
  })

}