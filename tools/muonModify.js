const sh = require('shelljs')
const path = require('path')
const fs = require('fs')

// sh.cd('../node_modules/electron-prebuilt/dist/resources/')
sh.cd('../node_modules/electron/dist/resources/')

if(sh.exec('asar e electron.asar electron').code !== 0) {
  console.log("ERROR")
  process.exit()
}

const file = path.join(sh.pwd().toString(),sh.ls('electron/browser/api/extensions.js')[0])

const contents = fs.readFileSync(file).toString()
const result = contents
// .replace(/getInfo\.populate/g,'{}')
  .replace('tabContents.close(tabContents)',"tabContents.hostWebContents && tabContents.hostWebContents.send('menu-or-key-events','closeTab',tabId)")
  .replace("evt.sender.send('chrome-tabs-create-response-' + responseId, tab.tabValue(), error)","evt.sender.send('chrome-tabs-create-response-' + responseId, tab && tab.tabValue(), error)")
  .replace('  if (updateProperties.active || updateProperties.selected || updateProperties.highlighted) {',
    `  if (updateProperties.active || updateProperties.selected || updateProperties.highlighted) {
    process.emit('chrome-tabs-updated-from-extension', tabId)`)
  .replace('chromeTabsRemoved(tabId)',`chromeTabsRemoved(tabId)
  delete tabIndexMap[tabId]`)
  .replace('return result','return result.sort(function(a, b){ return a.index - b.index })')

  .replace('var getTabValue = function (tabId) {',`const tabIndexMap = {},tabOpenerMap = {}
ipcMain.on('set-tab-opener',(e,tabId,openerTabId)=>{
  if(openerTabId) tabOpenerMap[tabId] = openerTabId
})
ipcMain.on('get-tab-opener',(e,tabId)=>{
  ipcMain.emit(\`get-tab-opener-reply_\${tabId}\`,null,tabOpenerMap[tabId])
})
ipcMain.on('get-tab-opener-sync',(e,tabId)=>{
  e.returnValue = tabOpenerMap[tabId]
})
ipcMain.on('get-tab-value-sync',(e,tabId)=>{
  e.returnValue = getTabValue(tabId) || null
})
ipcMain.on('new-tab-mode',(e,val)=>{
  newTabMode = val
})
ipcMain.on('update-tab-index-org',(e,tabId,index)=>tabIndexMap[tabId] = index)
var getTabValue = function (tabId) {`)

  .replace("sendToBackgroundPages('all', getSessionForTab(tabId), 'chrome-tabs-created', tabs[tabId].tabValue)",`const val = tabs[tabId].tabValue
  if(val.url=='chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html'){
    val.url = newTabMode
  }
  const opener = tabOpenerMap[tabId]
  if(val.windowId == -1){
    if(opener){
      val.windowId = BrowserWindow.fromWebContents(webContents.fromTabID(opener).hostWebContents).id
    }
    else{
      ipcMain.once(\`new-window-tabs-created_\${tabId}\`,(e,index)=>{
        tabIndexMap[tabId] = index
        tabOpenerMap[tabId] = null
        delete val.openerTabId
        val.index = index
        val.windowId = BrowserWindow.fromWebContents(e.sender.hostWebContents).id
        sendToBackgroundPages('all', getSessionForTab(tabId), 'chrome-tabs-created', val)
        sendToBackgroundPages('all', getSessionForTab(tabId), 'chrome-tabs-updated', tabId, {status:'loading'}, val)
      })
      return tabId
    }
  }

  if(opener){
    val.openerTabId = opener
    sendToBackgroundPages('all', getSessionForTab(tabId), 'chrome-tabs-created', val)
    sendToBackgroundPages('all', getSessionForTab(tabId), 'chrome-tabs-updated', tabId, {status:'loading'}, val)
    console.log('dddddddd',tabId,val.openerTabId)
  }
  else{
    let win = BrowserWindow.fromId(val.windowId)
    if(!win || !win.getTitle().includes('Sushi Browser')){
      const focus = BrowserWindow.getFocusedWindow()
      if(focus && focus.getTitle().includes('Sushi Browser')){
        win = focus
      }
      else{
        win = BrowserWindow.getAllWindows().find(w=>w.getTitle().includes('Sushi Browser'))
      }
    }
    const cont = win.webContents
    const key = Math.random().toString()
    ipcMain.once(\`get-focused-webContent-reply_\${key}\`,(e,openerTabId)=>{
      tabOpenerMap[tabId] = openerTabId
      val.openerTabId = openerTabId
      sendToBackgroundPages('all', getSessionForTab(tabId), 'chrome-tabs-created', val)
      sendToBackgroundPages('all', getSessionForTab(tabId), 'chrome-tabs-updated', tabId, {status:'loading'}, val)
    })
    cont.send('get-focused-webContent',key,void 0,void 0,true)
  }`)

  .replace('return tabContents && tabContents.tabValue()',`const ret = tabContents && !tabContents.isDestroyed() && tabContents.tabValue()
  let index,opener
  if(ret) {
    if((index = tabIndexMap[ret.id]) !== (void 0)) ret.index = index
    if(!ret.status) ret.status ="loading"
    if(ret.openerTabId == -1 && (opener = tabOpenerMap[ret.id])){
      ret.openerTabId = opener
    }
    else{
      delete ret.openerTabId
    }
  }
  return ret`)

  .replace('  if (!error && createProperties.partition) {',`  if(createProperties.url == 'chrome://newtab/'){
    createProperties.url = newTabMode
  }
  if(!createProperties.openerTabId || createProperties.openerTabId == -1){
    if(!win){
      const focus = BrowserWindow.getFocusedWindow()
      if(focus && focus.getTitle().includes('Sushi Browser')){
        win = focus
      }
      else{
        win = BrowserWindow.getAllWindows().find(w=>w.getTitle().includes('Sushi Browser'))  
      }
    }
    const cont = win.webContents
    const key = Math.random().toString()
    ipcMain.once(\`get-focused-webContent-reply_\${key}\`,(e,tabId)=>{
      const opener = webContents.fromTabID(tabId)
      ses = opener && opener.session
      if (!error && createProperties.partition) {
        // createProperties.partition always takes precendence
        ses = session.fromPartition(createProperties.partition, {
          parent_partition: createProperties.parent_partition
        })
        // don't pass the partition info through
        delete createProperties.partition
        delete createProperties.parent_partition
      }

      if (error) {
        console.error(error)
        return cb(null, error)
      }

      createProperties.userGesture = true

      try {
        // handle url, active, index and pinned in browser-laptop
        webContents.createTab(
          win.webContents,
          ses,
          createProperties,
          (tab) => {
            if (tab) {
              cb(tab)
            } else {
              cb(null, 'An unexpected error occurred')
            }
          }
        )
      } catch (e) {
        console.error(e)
        cb(null, 'An unexpected error occurred: ' + e.message)
      }
    })
    cont.send('get-focused-webContent',key,void 0)
    return
  }

  if (!error && createProperties.partition) {`)
  .replace("tabValues[tabId].url.startsWith('chrome://brave')","tabValues[tabId].url && tabValues[tabId].url.startsWith('chrome://brave')")

  .replace(`evt.sender.send('chrome-tabs-update-response-' + responseId, response)`,"evt.sender.send('chrome-tabs-update-response-' + responseId, getTabValue(tabId))")

  .replace(`tabs[tabId].tabValue = tabValue
  let changeInfo = {}

  for (var key in tabValue) {
    if (!deepEqual(tabValue[key], oldTabInfo[key])) {
      changeInfo[key] = tabValue[key]
    }
  }

  if (Object.keys(changeInfo).length > 0) {
    if (changeInfo.active) {
      sendToBackgroundPages('all', getSessionForTab(tabId), 'chrome-tabs-activated', tabId, {tabId: tabId, windowId: tabValue.windowId})
      process.emit('chrome-tabs-activated', tabId, {tabId: tabId, windowId: tabValue.windowId})
    }
    sendToBackgroundPages('all', getSessionForTab(tabId), 'chrome-tabs-updated', tabId, changeInfo, tabValue)
    process.emit('chrome-tabs-updated', tabId, changeInfo, tabValue)
  }
}
`,`const func = ()=>{
    let changeInfo = {}

    for (var key in tabValue) {
      if (!deepEqual(tabValue[key], oldTabInfo[key])) {
        changeInfo[key] = tabValue[key]
      }
    }
    if (Object.keys(changeInfo).length > 0) {
      if (changeInfo.active) {
        sendToBackgroundPages('all', getSessionForTab(tabId), 'chrome-tabs-activated', tabId, {tabId: tabId, windowId: tabValue.windowId})
        process.emit('chrome-tabs-activated', tabId, {tabId: tabId, windowId: tabValue.windowId})
      }
      sendToBackgroundPages('all', getSessionForTab(tabId), 'chrome-tabs-updated', tabId, changeInfo, tabValue)
      process.emit('chrome-tabs-updated', tabId, changeInfo, tabValue)
    }
    tabs[tabId].tabValue = tabValue
  }

  if(tabValue.windowId == -1 || tabOpenerMap[tabId]  === void 0 || tabIndexMap[tabId] === void 0){
    if(tabValue.url.startsWith('chrome://brave/')) return
    let retry = 0
    const id = setInterval(_=>{
      tabValue = getTabValue(tabId)
      if(!tabValue || retry++ > 40){
        clearInterval(id)
        return
      }
      if(tabValue.windowId == -1 || tabOpenerMap[tabId]  === void 0 || tabIndexMap[tabId] === void 0) return

      func()
      clearInterval(id)
    },50)
  }
  else{
    func()
  }
}`)
    .replace('var sendToBackgroundPages = function (extensionId, session, event) {',`var sendToBackgroundPages = function (extensionId, session, event, arg1) {
  if(event == 'chrome-tabs-created'){
    BrowserWindow.getAllWindows().forEach(win=>{
      if(win.getTitle().includes('Sushi Browser')){
        win.webContents.send('tab-create',arg1)
      }
    })
  }`)
  .replace('if (tabs[tabId]) {','if (tabs[tabId] || (tab && tab.tabValue && tab.tabValue.url && tab.tabValue.url.startsWith("chrome-devtools://"))) {')

fs.writeFileSync(file,result)


// const file2 = path.join(sh.pwd().toString(),sh.ls('electron/browser/api/browser-window.js')[0])
// const contents2 = fs.readFileSync(file2).toString()
// const result2 = contents2.replace(`if (window.webContents.equal(webContents)) return window`,`if (window.webContents.getId() === webContents.getId()) return window`)
// fs.writeFileSync(file2,result2)


if(sh.exec('asar pack electron electron.asar').code !== 0) {
  console.log("ERROR")
  process.exit()
}

// sh.rm('-rf','electron')