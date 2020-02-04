const electron = require('electron')
const {BrowserWindow,app,ipcMain,Menu} = electron
import {Browser, BrowserPanel, BrowserView} from './remoted-chrome/Browser'
import DpiUtils from './remoted-chrome/DpiUtils'
const url = require('url')
const path = require('path')
const fs = require('fs')
const InitSetting = require('./InitSetting')
import { state,searchEngine,savedState,windowState } from './databaseFork'
import mainState from './mainState'
import {settingDefault} from '../resource/defaultValue'
import PubSub from './render/pubsub'
const uuid = require("node-uuid")
const isDarwin = process.platform === 'darwin'
const isWin = process.platform == 'win32';
const isLinux = process.platform == 'linux';
const lang = Intl.NumberFormat().resolvedOptions().locale
const locale = require('../brave/app/locale')
const localShortcuts = require('../brave/app/localShortcuts')

const normalSize = {}
let saved = false
let unmouted

async function clearDatas(){
  const targets = []
  if(mainState.clearHistoryOnClose) targets.push('clearHistory')
  if(mainState.clearDownloadOnClose) targets.push('clearDownload')
  if(mainState.clearPasswordOnClose) targets.push('passwords')
  if(mainState.clearGeneralSettingsOnClose) targets.push('clearGeneralSettings')
  if(mainState.clearSessionManagerOnClose) targets.push('clearSessionManager')
  if(mainState.clearFaviconOnClose) targets.push('clearFavicon')
  if(mainState.clearVideoControllerOnClose) targets.push('clearVideoController')
  if(mainState.clearAutomationOnClose) targets.push('clearAutomation')
  if(mainState.clearNoteOnClose) targets.push('clearNote')
  if(mainState.clearUserSessionOnClose) targets.push('clearUserSession')

  if(mainState.clearCookiesOnClose) targets.push('cookies')
  if(mainState.clearFormDataOnClose) targets.push('formData')
  if(mainState.clearPluginDataOnClose) targets.push('pluginData')
  if(mainState.clearAppCacheOnClose) targets.push('appcache')
  if(mainState.clearCacheOnClose) targets.push('cache')
  if(mainState.clearFileSystemsOnClose) targets.push('fileSystems')
  if(mainState.clearLocalStorageOnClose) targets.push('localStorage')
  if(mainState.clearIndexedDBOnClose) targets.push('indexedDB')
  if(mainState.clearWebSQLOnClose) targets.push('webSQL')

  if(targets.length){
    let opt2
    if(mainState.clearType == 'before'){
      opt2 = { updated_at: { $lte: Date.now() - parseInt(mainState.clearDays) * 24 * 60 * 60 * 1000 }}
    }
    const clearEvent = require('./clearEvent')
    await clearEvent(null,targets,void 0, opt2)
  }
}


async function savedStateUpdate(states,closeKey){
  for(const win of states.wins){
    if(!win.winState.l) return
  }

  const doc = await savedState.insert(states)
  const updated_at = Date.now()
  for(let win of doc.wins){
    const key = win.winState.key
    const val = {key,id:doc._id, updated_at}
    if(key == closeKey) val.close = 1
    await windowState.update({key}, val, { upsert: true })
  }
}

let autoSaveStarted
let prevStates = ""
const _startAutoSaveAllWindowsState = async _=>{
  const states = await saveAllWindowsState()
  if(!states.wins.length || (states.wins.length == 1 && !states.wins[0].winState.l && !states.wins[0].winState.r)) return

  const statesStr = JSON.stringify(states.wins.map(state=>state.winState))
  if(prevStates == statesStr) return
  states.created_at = Date.now()
  prevStates = statesStr
  await savedStateUpdate(states)
}

function startAutoSaveAllWindowsState(){
  if(autoSaveStarted) return
  setInterval(_startAutoSaveAllWindowsState,(parseInt(mainState.autoSaveInterval)||60) * 1000)
  autoSaveStarted = true
}

async function saveAllWindowsState(){
  const wins = []
  for(let bw of BrowserWindow.getAllWindows()){
    if(!bw.getTitle().includes('Sushi Browser')) continue
    const key = Math.random().toString()
    bw.webContents.send('get-window-state2',key)

    const win = await new Promise(resolve=>{
      const maximize = bw.isMaximized()
      const bounds = maximize ? normalSize[bw.id] : bw.getBounds()
      const maxBounds = bw.getBounds()
      ipcMain.once(`get-window-state2-reply_${key}`,(e,ret)=>{
        resolve({...bounds, maximize,maxBounds, toggleNav:mainState.toggleNav==2 || mainState.toggleNav==3 ? 0 :mainState.toggleNav,winState:ret})
      })
    })
    wins.push(win)
  }
  return {wins}
}

async function saveAllWindowsStateHandler(e,key){
  console.log(575,key)
  const states = await saveAllWindowsState()
  if(key){
    e && e.sender.send(`save-all-windows-state-reply_${key}`)
  }
  states.created_at = Date.now()
  if(key == 'quit'){
    await state.update({key: 2},{key: 2, created_at: states.created_at, updated_at: Date.now()},{upsert: true})
    console.log(5275,key)
  }
  if(!key) states.user = true
  await savedStateUpdate(states,key)
  console.log('saveAllWindowsStateHandler')
  ipcMain.emit('wait-saveState-on-quit')
}

ipcMain.on('save-all-windows-state',saveAllWindowsStateHandler)



function create(args){
  // console.log(44421,args)
  startAutoSaveAllWindowsState()

  let bw = new BrowserWindow(args)
  if(args.maximize){
    normalSize[bw.id] = {x: args.x, y: args.y, width: args.width, height: args.height}
  }

  bw.on('closed', function (e) {
    console.log("closed!")
    const win = BrowserWindow.getAllWindows().find(w=>w.getTitle().includes('Sushi Browser')) //@TODO ELECTRON
    if(!win){
      console.log(4442)
      BrowserWindow.getAllWindows().forEach(win=>{
        win.close()
      })
    }
  })

  bw.on('close', function (e) {
    console.log('close',e.sender.getTitle())
    localShortcuts.unregister(bw)
    const sendTitle = e.sender.getTitle()
    if(sendTitle.includes('Closed')){ //@TODO ELECTRON
      if(!saved){
        e.preventDefault()
      }
      return
    }
    else if(sendTitle.includes('Sushi Browser')){ //@TODO ELECTRON
      const wins = BrowserWindow.getAllWindows().filter(w=>w.getTitle().includes('Sushi Browser'))
      console.log(wins.length,BrowserWindow.getAllWindows().filter(w=>w.getTitle().includes('Sushi Browser')))
      if(wins.length > 1){ //@TODO close event hang out other windows
        // bw.setSkipTaskbar(true)
        // bw.setTitle('Closed')
        // bw.webContents.send('unmount-components',{})
        // bw.loadURL(`file://${path.join(__dirname, '../blank.html').replace(/\\/g,"/")}`)
        // bw.hide()
        //
        // e.preventDefault()
        // for(let i = 0;i<=global.seqBv;i++){
        //   const view = bw.getAddtionalBrowserView(i)
        //   if(view){
        //     bw.eraseBrowserView(i)
        //     if(!view.isDestroyed()) view.destroy()
        //   }
        // }
        // for(let seq of Object.keys(global.viewCache)){
        //   const i = parseInt(seq)
        //   const view = bw.getAddtionalBrowserView(i)
        //   if(view){
        //     bw.eraseBrowserView(i)
        //     if(!view.isDestroyed()) view.destroy()
        //   }
        // }
        PubSub.publish('chrome-windows-onRemoved',bw.id)
        return
      }
      else if(mainState.keepOpen){
        mainState.keepOpen -= 1
        e.preventDefault()
        setTimeout(_=>{
          try{
            e.sender.close()
          }catch(ex){
            console.log(ex)
          }
        },2000)
        return
      }
      else if(global.downloadItems && global.downloadItems.some(item=>{return (item.getState() == 'progressing' || item.getState() == 'interrupted')})){
        const key = uuid.v4()
        console.log(global.downloadItems, global.downloadItems.forEach(item=>console.log(item.getURL(),item.isAria2c())))
        bw.webContents.send('show-notification',{key,text:'Do you want to close the browser and cancel all downloads?', buttons:['Yes','No']})

        ipcMain.once(`reply-notification-${key}`,(e,ret)=>{
          if(ret.pressIndex !== 0) return
          for(let item of global.downloadItems){
            if(item.aria2c) item.kill()
          }
          global.downloadItems = []
          bw.close()
        })
        e.preventDefault()
        return
      }
      // bw = null
      const maximize = bw.isMaximized()
      console.log(maximize)
      const bounds = maximize ? normalSize[bw.id] : bw.getBounds()
      const maxBounds = bw.getBounds()

      if(!saved){
        console.log(88811)
        let flag = false
        bw.webContents.send('get-window-state', true)
        // ipcMain.once('get-window-state-reply',(e,ret)=>{
        _startAutoSaveAllWindowsState().then(async ()=>{
          console.log(888112)
            console.log(888113)

            console.log('close-save')
            await clearDatas()
            // await new Promise(r=>{session.defaultSession.cookies.get({}, (e,cookies)=>{
            //   fs.writeFileSync(path.join(app.getPath('userData'), 'cookie.txt'),JSON.stringify(cookies)) //@TODO ELECTRON
            //   r()
            // })})

            try{
              const saveState = {}
              for(let key of Object.keys(settingDefault)){
                if(key == "toggleNav") continue
                // if(key == "adBlockDisableSite"){
                //   saveState[key] = JSON.stringify(mainState[key])
                // }
                else{
                  saveState[key] = mainState[key]
                }
              }

              state.update({ key: 1 }, { $set: {key: 1, ver:fs.readFileSync(path.join(__dirname,'../VERSION.txt')).toString(), ...bounds, maximize,maxBounds,
                  toggleNav:mainState.toggleNav==2 || mainState.toggleNav==3 ? 0 :mainState.toggleNav,...saveState, updated_at: Date.now()} }, { upsert: true }).then(_=>{
                InitSetting.reload()
              })

              saved = true
              console.log("getState")
              if(!flag) bw.close()
            }catch(e){
              saved = true
            }
          })
        // })
        setTimeout(_=>{
          if(!flag){
            flag = true
            saved = true
            if(!bw.isDestroyed()) bw.close()
          }
        },60000)
        e.preventDefault()
      }
      else{
        console.log("closing")
        if(!bw.isDestroyed()) PubSub.publish('chrome-windows-onRemoved',bw.id)
        BrowserWindow.getAllWindows().forEach(win=>{
          if(bw!=win) win.close()
        })
      }
    }
  })

  // bw.once('ready-to-show', () => {
  //   bw.show()
  //   if(!bw.isMaximized()){
  //     normalSize[bw.id] = bw.getBounds()
  //   }
  //   if(args.maximize){
  //     bw.maximize()
  //   }
  // })

  bw.on('resize', ()=>{
    if(!bw.isMaximized()){
      normalSize[bw.id] = bw.getNormalBounds()
    }
  })

  bw.on('will-move', e=>{
    // console.log('will-move')
    // e.preventDefault()
    // bw.setSize(300,300)
    if(isWin && bw.isMaximized()){
      e.preventDefault()
      bw.setResizable(true)
      bw.webContents.send('adjust-maxmize-size', false)
      const bounds = bw._isVirtualMaximized
      console.log('will-move', bounds)
      const point = electron.screen.getCursorScreenPoint()
      // const maxBounds = bw.getBounds()

      bounds.x = Math.round(Math.max(0, point.x - bounds.width / 2))
      bounds.y = 0

      bw.setBounds(bounds)
      bw._isVirtualMaximized = false
      bw.webContents.send('maximize',false)
      bw.webContents.send('re-render')
    }
    ipcMain.emit('move-window', bw.id)
  })

  bw.on('move', e=> {
    if(isDarwin){
      bw.webContents.send('maximize',false)
    }
    ipcMain.emit('move-window', bw.id)
  })

  bw.on('blur', ()=> {
    // PubSub.publish('chrome-windows-onFocusChanged',bw.id)
    bw.webContents.send('visit-state-update','blur')
    ipcMain.emit('state-change-window', -1, 'focus')
    // const id = setTimeout(()=>bw.isAlwaysOnTop() && bw.setAlwaysOnTop(false),50)
    // ipcMain.once(`browserPanel-focused_${bw.id}`, ()=> clearTimeout(id))
    // console.log('blur', new Date().getTime())
  })
  bw.on('focus', ()=> {
    if(bw._fullscreen)　bw._fullscreen._sendKey('escape')

    console.log('focus')
    // console.log('focus', new Date().getTime())
    // if(bw.tmpFocus){
    //   const func = bw.tmpFocus
    //   bw.tmpFocus = false
    //   setTimeout(()=>{
    //     console.log('bw.blur()')
    //     func()
    //   },10)
    //
    //   return
    // }
    // if(bw.focusFlag){
    //   bw.focusFlag = false
    //   return
    // }
    // PubSub.publish('chrome-windows-onFocusChanged',bw.id)
    bw.webContents.send('visit-state-update','focus')
    // ipcMain.once(`browserPanel-focused_${bw.id}`, ()=> clearTimeout(id))
    // bw.setAlwaysOnTop(true)
    ipcMain.emit('state-change-window', bw.id, 'focus')
    // bw.focus()
    // bw.focusFlag = true
  })

  let maximizeTimer = Date.now()
  bw.on('maximize',e=>{
    if(isWin){
      const _maximizeTimer = maximizeTimer
      maximizeTimer = Date.now()
      if(maximizeTimer - _maximizeTimer < 100) return

      console.log('maximize1',bw._isVirtualMaximized)
      if(bw._isVirtualMaximized){
        bw.webContents.send('adjust-maxmize-size', false)
        bw.setResizable(true)
        if(bw.isMaximized()) bw.unmaximize()

        const bounds = bw._isVirtualMaximized
        setTimeout(()=>bw.setBounds(bounds),50)
        bw.webContents.send('maximize',false)
        bw._isVirtualMaximized = false
      }
      else{
        bw._isVirtualMaximized = bw._initVirtualMaximized || bw.getNormalBounds()
        bw._initVirtualMaximized = void 0

        console.log('mmax',bw.getBounds(),bw._isMaximized())
        const b = bw.getBounds()
        if(bw.isMaximized()) bw.unmaximize()

        const bounds = {x: b.x, y: b.y, width: b.width, height: b.height}
        bw._maximizedSize = bounds
        // bw.normal()
        setTimeout(()=>{
          bw.webContents.send('adjust-maxmize-size', true)
          bw.setBounds(bounds)
          // bw.setResizable(false)
        },50)
        // bw.setBounds(b)
        bw.webContents.send('maximize',true)
      }
    }
    else{
      bw.webContents.send('maximize',true)
    }
    // console.log(bw.getBounds())
    // ipcMain.emit('state-change-window', bw.id, 'maximize')
  })

  if(!isWin){
    bw.on('unmaximize',_=>{
      bw.webContents.send('maximize',false)
      ipcMain.emit('state-change-window', bw.id, 'unmaximize')
    })
  }

  bw.on('minimize',_=>{
    console.log('minimize')
    ipcMain.emit('state-change-window', bw.id, 'minimize')
  })

  bw.on('restore',_=>{
    bw.setResizable(true)
    if(isWin){
      if(bw._isVirtualMaximized){
        console.log('restore1')
        bw.webContents.send('adjust-maxmize-size', true)
        bw.setBounds(bw._maximizedSize)
      }
      else{
        console.log('restore2')
        bw.webContents.send('adjust-maxmize-size', false)
      }
    }
    ipcMain.emit('state-change-window', bw.id, 'restore')
  })

  if(isDarwin){
    bw.on('enter-full-screen',_=>{
      bw.webContents.send('enter-full-screen',true)
    })

    bw.on('leave-full-screen',_=>{
      bw.webContents.send('leave-full-screen',false)

    })
  }

  return bw
}

function getNewPopBounds(bw){
  const bounds = bw.getBounds()
  bounds.x += 5
  bounds.y += 5
  return bounds
}

function getSize(opt){
  if(opt.x !== (void 0)){
    if(opt.width === void 0){
      const bw = BrowserWindow.fromId(opt.id)
      const maximize = bw.isMaximized()
      let bounds = maximize ? normalSize[bw.id] : getNewPopBounds(bw)
      opt.width = bounds.width
      opt.height = bounds.height
      opt.maximize = maximize
      if(maximize) opt.maxBounds = bw.getBounds()
    }
    return {x:opt.x,y:opt.y,width:opt.width,height:opt.height, maximize: opt.maximize || false}
  }
  else{
    const bw = BrowserWindow.fromId(opt.id)
    let maximize = opt.sameSize ? bw.isMaximized() : false
    let bounds = opt.sameSize ? maximize ? normalSize[bw.id] : getNewPopBounds(bw) : normalSize[bw.id]
    if(opt.width){
      if(!bounds) bounds = {}
      bounds.width = opt.width
      bounds.height = opt.height
      maximize = false
    }
    return {...bounds,maximize}
  }
}

function setOptionVal(key,dVal,val){
  mainState[key] = val === (void 0) ? dVal : val
}

export default {
  async load(opt,first,url){
    console.trace(opt,first,url)

    if(url && (url.endsWith('\\web-dev-browser\\lib\\main.js') || url.endsWith('/web-dev-browser/lib/main.js'))) url = void 0
    let initWindow
    let setting = await InitSetting.val
    let winSetting

    let saveState
    if(opt){
      winSetting = getSize(opt)
    }
    else{
      const saveStates = (await savedState.find_sort_limit([{}],[{ created_at: -1 }],[10]))
      console.log(2221121223, saveStates.length)
      for(const ss of saveStates){
        if(ss.wins[0].winState.l){
          saveState = ss
          break
        }
      }
      console.log(222112122,first, saveState && saveState.wins[0])
      if(saveState && first){
        setting = {...setting, ...saveState.wins[0]}
      }
      winSetting = {x: setting.x, y: setting.y, width: setting.width, height: setting.height, maximize: setting.maximize, maxBounds: setting.maxBounds}
    }

    mainState.scaleFactor = electron.screen.getPrimaryDisplay().scaleFactor

    // console.log(77677,setting)
    if(!opt){
      for(let [key,dVal] of Object.entries(settingDefault)){
        setOptionVal(key,dVal,setting[key])
      }
      mainState.emailSync = setting.emailSync
      mainState.defaultDownloadPath = app.getPath('downloads')
      app.setPath('downloads',mainState.downloadPath && fs.existsSync(mainState.downloadPath) ? mainState.downloadPath : mainState.defaultDownloadPath)

      mainState.vpn = false
      // for(let extensionId of mainState.disableExtensions){
      //   session.defaultSession.extensions.disable(extensionId)
      // }

      if(mainState.language == 'default'){
        mainState.language = locale.defaultLocale()
      }
      const lang = await locale.init(mainState.language)
      // app.setLocale(lang) @TODO ELECTRON
      mainState.lang = lang == 'zh-CN' ? lang : lang.slice(0,2)

      mainState.dragData = null
      mainState.lockTabs = {}
      mainState.protectTabs = {}
      mainState.versions = {...process.versions,browser: fs.readFileSync(path.join(__dirname,'../VERSION.txt')).toString(), chrome: null}
      mainState.mediaPlaying = {}
      mainState.isVolumeControl = {}
      mainState.fullScreenIds = {}
      if(!mainState.rockerGestureLeft){
        mainState.rockerGestureLeft = isWin ? locale.translation('back') : 'none'
        mainState.rockerGestureRight = isWin ? locale.translation('forward') : 'none'
      }

      mainState.searchProviders = {}
      for(let ele of (await searchEngine.find({}))){
        mainState.searchProviders[ele.name] = ele
      }
      console.log(90756,url)
      if(url && setting.winState) {
        mainState.winState = JSON.stringify({
          dirc: "v",
          key: uuid.v4(),
          l: {
            key: `${Date.now().toString()}_${uuid.v4()}_0`,
            tabs: [{ pin: false, tabKey: `${Date.now().toString()}_${uuid.v4()}` ,forceKeep:true, url }]
          },
          r: null,
          size: "100%",
          toggleNav: setting.winState.toggleNav
        })
      }
      else{
        // if(first && mainState.startsWith !== 'startsWithOptionLastTime' && setting.winState) setting.winState.key = uuid.v4()
        mainState.winState = JSON.stringify(setting.winState)
      }
      console.log(7778,mainState.winState)
      mainState.maxBounds = JSON.stringify(setting.maxBounds)
      mainState.maxState = JSON.stringify({width: setting.width, height: setting.height, maximize: setting.maximize,maxWidth: setting.maximize && setting.maxBounds.width,maxHeight: setting.maximize && setting.maxBounds.height})

      let rec
      if(mainState.startsWith == 'startsWithOptionLastTime' && (rec = await state.findOne({key: 2}))){
        await state.remove({key: 2}, { multi: true })
        const saveState = await savedState.findOne({ created_at: rec.created_at })
        if(saveState){
          for(let newWin of saveState.wins){
            this.load({x:newWin.x, y:newWin.y, width:newWin.width, height:newWin.height,
              maximize: newWin.maximize, tabParam:JSON.stringify(newWin)})
          }
          if(saveState.wins.length) return
        }
      }
    }
    else if(opt.id){
      const newState = Object.assign({...setting.winState},{key:uuid.v4(),dirc: 'v',pd:'l',l:{key: uuid.v4(),tabs: []},size:'100%'})
      delete newState.r
      mainState.winState = JSON.stringify(newState)
    }


    console.log(77,winSetting)
    const fontOpt = process.platform == 'win32' && lang == 'ja' ? {
      defaultFontFamily: {
        standard: 'Meiryo UI',
        serif: 'MS PMincho',
        sansSerif: 'Meiryo UI',
        monospace: 'MS Gothic'
      }
    } : {}

    if(opt && opt._alwaysOnTop){
      winSetting.alwaysOnTop = true
    }
    else{
      winSetting.alwaysOnTop = mainState.alwaysOnTop
    }
    const winArg = {...opt,
      ...winSetting,
      title: 'Sushi Browser',
      fullscreenable: false,
      // A frame but no title bar and windows buttons in titlebar 10.10 OSX and up only?
      titleBarStyle: 'hidden',
      autoHideMenuBar: true,
      // toolbar: false,
      // resize: false,
      hasShadow :false,
      frame: isDarwin,
      show: false,
      // enableLargerThanScreen: true,
      transparent: true,
      // opacity: 0.01,
      // clickThrough: 'pointer-events',
      // alwaysOnTop: true,
      webPreferences: {
        // plugins: true,
        // sharedWorker: true,
        nodeIntegration: true,
        webSecurity: false,
        allowFileAccessFromFileUrls: true,
        allowUniversalAccessFromFileUrls: true,
        ...fontOpt
      }
    }
    if(mainState.windowCustomIcon && fs.existsSync(mainState.windowCustomIcon)) winArg.icon = mainState.windowCustomIcon

    console.log(444,winArg)

    let [maxWidth,maxHeight] = [0,0]
    for(let display of electron.screen.getAllDisplays()){
      let {x,y,width,height }= display.bounds
      maxWidth = Math.max(maxWidth,x+width)
      maxHeight = Math.max(maxHeight,y+height)
    }
    if(winArg.x >= maxWidth) winArg.x = 100
    if(winArg.y >= maxHeight) winArg.y = 100

    let getParam = ""

    if(first){
      getParam="#"
    }
    else if(opt && opt.tabParam){
      getParam = `?tabparam=${encodeURIComponent(opt.tabParam)}${opt.toggle ? `&toggle=${opt.toggle}` : ''}`
      if(opt.dropX){
        winArg.x = opt.dropX - (mainState.toggleNav == 1 && winArg.width ? Math.round(winArg.width / 3) : 0)
        winArg.y = opt.dropY
      }
      else if(opt.x){
        winArg.x = opt.x
        winArg.y = opt.y

      }
      delete winArg.tabParam
      mainState.alwaysOnTop = opt.alwaysOnTop
      console.log(66,opt.alwaysOnTop,66)
      console.log(opt,winArg)
    }


    console.log(909,winArg)

    // const win = BrowserWindow.getAllWindows().find(w=>w.getTitle().includes('Closed')) //@TODO ELECTRON
    // if(!win) {
    winArg.width = winArg.width || setting.width
    winArg.height = winArg.height || setting.height
    // await new Promise(r=>setTimeout(r,1000))
    initWindow = create(winArg)
    if(isWin && winArg.maximize){
      initWindow._initVirtualMaximized = winArg.maximize
    }

    localShortcuts.register(initWindow)
    initWindow.setMenuBarVisibility(true)

    if(isWin){
      initWindow._isMaximized = initWindow.isMaximized
      initWindow.isMaximized = function(){ return this._isVirtualMaximized }
    }

    new (require('./Download'))(initWindow)
    // }
    // else{
    //   initWindow = win
    //   initWindow.setBounds({x: winArg.x, y: winArg.y, width: winArg.width || setting.width, height: winArg.height || setting.height})
    //   initWindow.setSkipTaskbar(false)
    //   initWindow.setTitle('Sushi Browser')
    // }

    console.log(1111, `file://${path.join(__dirname, '../index.html').replace(/\\/g, "/")}${getParam}`)
    initWindow.loadURL(`file://${path.join(__dirname, '../index.html').replace(/\\/g, "/")}${getParam}`)
    // initWindow.webContents.toggleDevTools()

    initWindow.webContents.root = true
    initWindow.webContents.on('context-menu', (e, props) => ipcMain.emit('contextmenu-webContents', e, props))

    const updateWindowState = async () => {
      initWindow.setAlwaysOnTop(!!winArg.alwaysOnTop)
      // for(const panel of BrowserPanel.getBrowserPanelsFromBrowserWindow(initWindow)){
      //   panel.setAlwaysOnTop(!!winArg.alwaysOnTop)
      // }
      initWindow._alwaysOnTop = !!winArg.alwaysOnTop
      initWindow.webContents.send('set-alwaysOnTop', !!winArg.alwaysOnTop)
      initWindow.webContents.setUserAgent(await Browser.getUserAgent())
    }

    updateWindowState()

    // await new Promise(r=>{
    initWindow.webContents.once('did-finish-load', async () => {
      initWindow.show()
      if(first && isLinux){
        const menu = new Menu()
        menu.popup()
        menu.closePopup()
      }
      if (!initWindow.isMaximized()) {
        normalSize[initWindow.id] = initWindow.getBounds()
      }
      if (winArg.maximize){
        if(isWin){
          console.log(777771,winArg.maxBounds)
          setTimeout(async ()=>{
            let count = 0
            for(let i=0;i<1000;i++){
              await new Promise(r=>setTimeout(r,10))
              if(initWindow.nativeWindow && !BrowserView.newPanelCreateing && !BrowserView.newTabCreateing){
                if(count < 8){
                  count++
                  continue
                }
                initWindow.maximize()
                await new Promise(r=>setTimeout(r,500))
                for(const panel of BrowserPanel.getBrowserPanelsFromBrowserWindow(initWindow)){
                  DpiUtils.moveRetry(panel.cpWin.nativeWindow)
                }
                break
              }
              count = 0
            }
          },0)
        }
        else{
          initWindow.maximize()
        }
      }
      updateWindowState()
      // r()
    })
    // })

    PubSub.publish('chrome-windows-onCreated',initWindow.id)
    // initWindow.setIgnoreMouseEvents(true)
    return initWindow
  },
  saveState(bw,callback){
    if(!bw) return
    const maximize = bw.isMaximized()
    const bounds = maximize ? normalSize[bw.id] : bw.getBounds()
    const maxBounds = bw.getBounds()
    bw.webContents.send('get-window-state')
    ipcMain.once('get-window-state-reply',(e,ret)=>{
      try{
        const saveState = {}
        for(let key of Object.keys(settingDefault)){
          if(key == "toggleNav") continue
          // if(key == "adBlockDisableSite"){
          //   saveState[key] = JSON.stringify(mainState[key])
          // }
          else{
            saveState[key] = mainState[key]
          }
        }
        state.update({ key: 1 }, { $set: {key: 1, ver:fs.readFileSync(path.join(__dirname,'../VERSION.txt')).toString(), ...bounds, maximize,maxBounds,
            toggleNav:mainState.toggleNav==2 || mainState.toggleNav==3 ? 0 :mainState.toggleNav,...saveState,winState:ret, updated_at: Date.now()} }, { upsert: true }).then(_=>_)
        saved = true
        console.log("getState")
      }catch(e){
        saved = true
      }
      if(callback) callback()
    })
  }
}

