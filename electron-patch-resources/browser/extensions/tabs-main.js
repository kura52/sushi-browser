const {ipcFuncMain, ipcFuncMainCb, getIpcNameFunc, shortId, getFocusedWebContents, getCurrentWindow} = require('./util-main')
const {ipcMain, BrowserWindow, webContents, session} = require('electron')
const fs = require('fs')
const path = require('path')
const franc = require('./franc-min')

const transLang = {eng:'en', dan:'da', dut:'nl', fin:'fi', fre:'fr', ger:'de', heb:'he', ita:'it', jpn:'ja', kor:'ko', nor:'nb', pol:'pl', por:'pt', rus:'ru', spa:'es', swe:'sv', chi:'zh', cze:'cs', gre:'el', ice:'is', lav:'lv', lit:'lt', rum:'ro', hun:'hu', est:'et', bul:'bg', scr:'hr', scc:'sr', gle:'ga', glg:'gl', tur:'tr', ukr:'uk', hin:'hi', mac:'mk', ben:'bn', ind:'id', lat:'la', may:'ms', mal:'ml', wel:'cy', nep:'ne', tel:'te', alb:'sq', tam:'ta', bel:'be', jav:'jw', oci:'oc', urd:'ur', bih:'bh', guj:'gu', tha:'th', ara:'ar', cat:'ca', epo:'eo', baq:'eu', ina:'ia', kan:'kn', pan:'pa', gla:'gd', swa:'sw', slv:'sl', mar:'mr', mlt:'mt', vie:'vi', fry:'fy', slo:'sk', fao:'fo', sun:'su', uzb:'uz', amh:'am', aze:'az', geo:'ka', tir:'ti', per:'fa', bos:'bs', sin:'si', nno:'nn', xho:'xh', zul:'zu', grn:'gn', sot:'st', tuk:'tk', kir:'ky', bre:'br', twi:'tw', yid:'yi', som:'so', uig:'ug', kur:'ku', mon:'mn', arm:'hy', lao:'lo', snd:'sd', roh:'rm', afr:'af', ltz:'lb', bur:'my', khm:'km', tib:'bo', div:'dv', ori:'or', asm:'as', cos:'co', ine:'ie', kaz:'kk', lin:'ln', mol:'mo', pus:'ps', que:'qu', sna:'sn', tgk:'tg', tat:'tt', tog:'to', yor:'yo', mao:'mi', wol:'wo', abk:'ab', aar:'aa', aym:'ay', bak:'ba', bis:'bi', dzo:'dz', fij:'fj', kal:'kl', hau:'ha', ipk:'ik', iku:'iu', kas:'ks', kin:'rw', mlg:'mg', nau:'na', orm:'om', run:'rn', smo:'sm', sag:'sg', san:'sa', ssw:'ss', tso:'ts', tsn:'tn', vol:'vo', zha:'za', lug:'lg', glv:'gv'}

const getIpcName = getIpcNameFunc('Tabs')

const tabOpenerMap = {}
ipcMain.on('set-tab-opener',(e,tabId,openerTabId)=>{
  if(openerTabId) tabOpenerMap[tabId] = openerTabId
})

ipcMain.on('get-tab-opener',(e,tabId)=>{
  ipcMain.emit(`get-tab-opener-reply_${tabId}`,null,tabOpenerMap[tabId])
})

ipcMain.on('get-tab-opener-sync',(e,tabId)=>{
  e.returnValue = tabOpenerMap[tabId]
})

async function getTabValue(event, tabId){
  const contents = tabId ? webContents.fromId(tabId) : (await getFocusedWebContents())
  if (!contents) {
    event.returnValue = null
    return
  }

  const hostWebContents = contents.hostWebContents2
  // console.log(hostWebContents)
  // if(!hostWebContents){
  //   event.returnValue = null
  //   return
  // }
  // else{
  //   console.log(BrowserWindow.fromWebContents(hostWebContents))
  // }
  const _tabValue = {
    audible: false,
    autoDiscardable: true,
    discarded: false,
    id: tabId,
    mutedInfo: {muted: contents.isAudioMuted()},
    status: contents.isLoading ? 'loading' : 'complete',
    title: contents.getTitle(),
    url: contents.getURL(),
    windowId: hostWebContents && BrowserWindow.fromWebContents(hostWebContents).id,
  }

  if(tabOpenerMap[tabId]) _tabValue.openerTabId = tabOpenerMap[tabId]

  if(!hostWebContents){
    event.returnValue = _tabValue
    return event.returnValue
  }

  const requestId = shortId()
  hostWebContents.send('CHROME_TABS_TAB_VALUE', requestId, tabId)

  return await new Promise(r=>{
    ipcMain.once(`CHROME_TABS_TAB_VALUE_RESULT_${requestId}`,(event2, tabValue)=>{
      event.returnValue = {..._tabValue, ...tabValue}
      r(event.returnValue)
    })
  })
}

async function tabsQuery(queryInfo, cb){
  const tabIds = []
  for(let content of webContents.getAllWebContents()){
    if(!content.hostWebContents2) continue
    tabIds.push(content.id)
  }

  // convert current window identifier to the actual current window id
  if (queryInfo.windowId === -2 || queryInfo.currentWindow === true) {
    delete queryInfo.currentWindow
    const focusedWindow = getCurrentWindow()
    if (focusedWindow) {
      queryInfo.windowId = focusedWindow.id
    }
  }

  const queryKeys = Object.keys(queryInfo)
  // get the values for all tabs
  const tabValues = {}
  for(let tabId of tabIds){
    tabValues[tabId] = (await getTabValue({}, tabId)) || {}
  }

  console.log(tabValues, queryInfo)
  const result = []
  tabIds.forEach((tabId) => {
    // delete tab from the list if any key doesn't match
    if (!queryKeys.map((queryKey) => (tabValues[tabId][queryKey] === queryInfo[queryKey])).includes(false)) {
      result.push(tabValues[tabId])
    }
  })

  cb(result.sort(function(a, b){ return a.index - b.index }))
}

function recurTabGet(win, cb, error, ses, createProperties, retry) {
  const cont = win.webContents
  const key = shortId()
  cont.send('get-focused-webContent', key, void 0)
  ipcMain.once(`get-focused-webContent-reply_${key}`, (e, tabId) => {
    if (!tabId) {
      if(retry > 10) return cb(null, error)
      return setTimeout(()=>recurTabGet(win, cb, error, ses, createProperties, retry + 1) ,30)
    }
    const opener = webContents.fromId(tabId)
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
      // windowId
      // index
      // pinned
      opener.emit('new-window', null, createProperties.url, null, createProperties.active ? 'foreground-tab' : 'background-tab')
      ipcMain.once('CHROME_TABS_ONCREATED', (event, tab) => { //@TODO FIX
        cb(tab)
      })
    } catch (e) {
      console.error(e)
      cb(null, 'An unexpected error occurred: ' + e.message)
    }
  })
};

function tabMain(manifestMap, resultID, nextId){
  ipcFuncMainCb('tabs', 'create', async (e, createProperties, cb2)=> {
    const cb = (tab, error) => {
      // if (!evt.sender.isDestroyed()) {
      if(cb2) cb2(tab, error)
      // }
    }
    try {
      let windowId = createProperties.windowId || -2
      let win = null
      let error = null

      if (windowId === -2) {
        win = getCurrentWindow() || BrowserWindow.getAllWindows()[0]
        if (!win) {
          error = 'No current window'
        }
      } else {
        win = BrowserWindow.fromId(windowId)
        if (!win) {
          error = 'Window not found'
        }
      }

      let ses = session.defaultSession
      if (!error && createProperties.openerTabId) {
        const opener = webContents.tabId(createProperties.openerTabId)
        if (!opener) {
          error = 'No tab found'
        } else {
          ses = opener.session
        }
      }

      if(!createProperties.url){
        createProperties.url = 'chrome://newtab/'
      }
      if(!createProperties.openerTabId || createProperties.openerTabId == -1){
        if(!win){
          const focus = getCurrentWindow()
          if(focus && focus.getTitle().includes('Sushi Browser')){
            win = focus
          }
          else{
            win = BrowserWindow.getAllWindows().find(w=>w.getTitle().includes('Sushi Browser'))
          }
        }
        recurTabGet(win, cb, error, ses, createProperties, 0)
        return
      }
    } catch (e) {
      cb(null, e.message)
    }
  })

  ipcFuncMainCb('tabs', 'query', (e, ...args) => tabsQuery(...args))

  ipcFuncMainCb('tabs', 'update', async (e, tabId, updateProperties, cb)=> {
    const contents = webContents.fromId(tabId)
    contents.hostWebContents2.send('chrome-tabs-event', {tabId, changeInfo: updateProperties}, 'updated')
    cb()
  })

  ipcFuncMainCb('tabs', 'reload', async (e, tabId, reloadProperties, cb)=> {
    const contents = tabId ? webContents.fromId(tabId) :(await getFocusedWebContents())
    reloadProperties ? contents.reloadIgnoringCache() : contents.reload()
    cb()
  })

  ipcFuncMainCb('tabs', 'remove', async (e, tabIds, cb)=> {
    for(let tabId of tabIds){
      const contents = webContents.fromId(tabId)
      contents.hostWebContents2.send('chrome-tabs-event', {tabId}, 'removed')
    }
    cb()
  })

  ipcFuncMainCb('tabs', 'detectLanguage', (e, tabId,cb)=> {
    webContents.fromId(tabId).executeJavaScript(
      `document.documentElement.innerText`,
      (result) => cb(transLang[franc(result)] || 'en')
    )
  })

  ipcFuncMainCb('tabs', 'captureVisibleTab', (e, tabId,options,cb)=>{
    options = options || {}
    const contents = webContents.fromId(tabId)
    if(contents){
      contents.capturePage(image=>{
        if(options.format == 'png'){
          cb(`data:image/png;base64,${image.toPNG().toString('base64')}`)
        }
        else{
          cb(`data:image/jpeg;base64,${image.toJPEG(options.quality || 92).toString("base64")}`)
        }
      })
    }
  })

  ipcFuncMainCb('tabs', 'insertCSS', async (e, extensionId, tabId, details, cb)=>{
    const contents = tabId ? webContents.fromId(tabId) : (await getFocusedWebContents())
    let cssText
    if(details.code){
      cssText = details.code
    }
    else if(details.file){
      try{
        cssText = String(fs.readFileSync(path.join(manifestMap[extensionId], details.file)))
      }catch(e){
        cb()
        return
      }
    }
    else{
      cb()
      return
    }
    if(contents){
      cb(`;(function(){
      const s = document.createElement('style');
      s.setAttribute('type', 'text/css');
      s.appendChild(document.createTextNode(\`${cssText}\`));
      document.head.appendChild(s)
      })()`)
    }
  })

  ipcFuncMainCb('tabs', 'getZoom', async (e, tabId,cb)=>{
    const contents = tabId ? webContents.fromId(tabId) : (await getFocusedWebContents())
    contents.getZoomFactor(factor=>cb(factor))
  })

  ipcFuncMainCb('tabs', 'setZoom', async (e, tabId,zoomFactor,cb)=>{
    const contents = tabId ? webContents.fromId(tabId) : (await getFocusedWebContents())
    contents.setZoomFactor(parseFloat(zoomFactor))
    cb()
  })

  ipcFuncMainCb('tabs', 'saveAsPDF', async (e, pageSettings,cb)=>{
    const contents = (await getFocusedWebContents())
    const filepath = dialog.showDialog(BrowserWindow.fromWebContents(cont.hostWebContents2),
      {
        defaultPath: path.join(app.getPath('downloads'), `${cont.getTitle()}.pdf`),
        type: 'select-saveas-file',
        extensions: [['pdf']]
      },filepaths=>{
        if (!filepaths || filepaths.length > 1) {
          cb('canceled')
          return
        }
        contents.printToPDF({landscape: pageSettings.orientation === 1}, (error, data) => {
          if (error) {
            cb('not_saved')
            return
          }
          fs.writeFile(filepaths[0], data, (error) => {
            if (error) {
              cb('not_saved')
              return
            }
            cb('saved')
          })
        })
      })
  })

  ipcFuncMainCb('tabs' , 'getFocusedWebContents', async (e, cb)=>{
    const contents = (await getFocusedWebContents())
    cb(contents.id)
  })

  ipcMain.on('CHROME_TABS_TAB_VALUE', getTabValue)

  ipcMain.on('CHROME_TABS_SEND_MESSAGE', function (event, tabId, extensionId, isBackgroundPage, message, originResultID, webContentsKey) {
    const contents = webContents.fromId(tabId)
    if (!contents) {
      console.error(`Sending message to unknown tab ${tabId}`)
      return
    }

    const senderTabId = isBackgroundPage ? null : event.sender.id

    contents.sendToAll(`CHROME_RUNTIME_ONMESSAGE_${extensionId}`, senderTabId, message, resultID.val, webContentsKey)
    ipcMain.once(`CHROME_RUNTIME_ONMESSAGE_RESULT_${resultID.val}`, (event, result) => {
      event.sender.send(`CHROME_TABS_SEND_MESSAGE_RESULT_${originResultID}`, result)
    })
    resultID.val++
  })

  ipcMain.on('CHROME_TABS_EXECUTESCRIPT', async function (event, requestId, tabId, extensionId, details) {
    const contents = tabId ? webContents.fromId(tabId) : (await getFocusedWebContents())
    if (!contents) {
      console.error(`Sending message to unknown tab ${tabId}`)
      return
    }

    let code, url
    if (details.file) {
      const manifest = manifestMap[extensionId]
      code = String(fs.readFileSync(path.join(manifest.srcDirectory, details.file)))
      url = `chrome-extension://${extensionId}${details.file}`
    }
    else {
      code = details.code
      url = `chrome-extension://${extensionId}/${String(Math.random()).substr(2, 8)}.js`
    }

    contents.send('CHROME_TABS_EXECUTESCRIPT', event.sender.id, requestId, extensionId, url, code)
  })


  ipcMain.on('CHROME_TABS_CONNECT', function (event, tabId, extensionId, connectInfo, webContentsKey) {
    const tab = webContents.fromId(tabId)
    if (!tab) {
      console.error(`Cannot connect to ${tabId} ${extensionId}`)
      event.returnValue = null
      return
    }

    const portId = ++nextId.val
    tab.send(`CHROME_RUNTIME_ONCONNECT_${extensionId}`, event.sender.id, portId, connectInfo)
    ipcMain.once(`CHROME_RUNTIME_ONCONNECT_RES_${extensionId}`, (e, canConnect) => {
      if(canConnect){
        event.returnValue = portId

        event.sender.once('render-view-deleted', () => {
          if (page.webContents.isDestroyed()) return
          tab.send(`CHROME_PORT_DISCONNECT_${portId}`)
        })
      }
      else{
        event.returnValue = null
      }
    })

  })
}

module.exports = {
  tabMain,
  tabsQuery,
  getTabValue
}