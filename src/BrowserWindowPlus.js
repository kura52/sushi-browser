const electron = require('electron')
const {BrowserWindow,app,ipcMain,session} = electron
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
const lang = Intl.NumberFormat().resolvedOptions().locale
const locale = require('../brave/app/locale')
const localShortcuts = require('../brave/app/localShortcuts')

const normalSize = {}
let saved = false
let unmouted

function savedStateUpdate(states,closeKey){
  savedState.insert(states).then(doc=>{
    const updated_at = Date.now()
    for(let win of doc.wins){
      const key = win.winState.key
      const val = {key,id:doc._id, updated_at}
      if(key == closeKey) val.close = 1
      windowState.update({key}, val, { upsert: true }).then(_=>_)
    }
  })
}

let autoSaveStarted
function startAutoSaveAllWindowsState(){
  if(autoSaveStarted) return

  let prevStates = ""
  setInterval(async _=>{
    const states = await saveAllWindowsState()
    if(!states.wins.length) return

    const statesStr = JSON.stringify(states.wins.map(state=>state.winState))
    if(prevStates == statesStr) return
    states.created_at = Date.now()
    savedStateUpdate(states)
    prevStates = statesStr
  },(parseInt(mainState.autoSaveInterval)||60) * 1000)

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

ipcMain.on('save-all-windows-state',async (e,key)=>{
  console.log(575,key)
  const states = await saveAllWindowsState()
  if(key){
    e.sender.send(`save-all-windows-state-reply_${key}`)
  }
  states.created_at = Date.now()
  if(!key) states.user = true
  savedStateUpdate(states,key)
})


function create(args){
  // console.log(44421,args)
  startAutoSaveAllWindowsState()
  let bw = new BrowserWindow(args)
  if(args.maximize){
    normalSize[bw.id] = {x: args.x, y: args.y, width: args.width, height: args.height}
  }

  bw.on('closed', function (e) {
    console.log("closed!")
    const win = BrowserWindow.getAllWindows().find(w=>w.getTitle().includes('Sushi Browser'))
    if(!win){
      console.log(4442)
      BrowserWindow.getAllWindows().forEach(win=>{
        win.close()
      })
    }
  })

  bw.on('close', function (e) {
    console.log('close',e.sender.getTitle())
    const sendTitle = e.sender.getTitle()
    if(sendTitle.includes('Closed')){
      if(!saved){
        e.preventDefault()
      }
      return
    }
    else if(sendTitle.includes('Sushi Browser')){
      const wins = BrowserWindow.getAllWindows().filter(w=>w.getTitle().includes('Sushi Browser'))
      console.log(wins.length,BrowserWindow.getAllWindows().filter(w=>w.getTitle().includes('Sushi Browser')))
      if(wins.length > 1){ //@TODO close event hang out other windows
        // bw.setSkipTaskbar(true)
        bw.webContents.send('unmount-components',{})
        unmouted = true
        let flag = false
        const closeFunc = _=>{
          if(!flag){
            flag = true
            unmouted = false
            bw.setTitle('Closed')
            bw.hide()
            PubSub.publish('chrome-windows-onRemoved',bw.id)
          }
        }
        ipcMain.once('unmount-components-reply',closeFunc)
        setTimeout(closeFunc,1500)
        e.preventDefault()
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
        bw.webContents.send('get-window-state',{})
        let flag = false

        ipcMain.once('get-window-state-reply',(e,ret)=>{
          try{
            const saveState = {}
            for(let key of Object.keys(settingDefault)){
              if(key == "toggleNav") continue
              saveState[key] = mainState[key]
            }
            state.update({ key: 1 }, { $set: {key: 1, ver:fs.readFileSync(path.join(__dirname,'../VERSION.txt')).toString(), ...bounds, maximize,maxBounds,
              toggleNav:mainState.toggleNav==2 || mainState.toggleNav==3 ? 0 :mainState.toggleNav,...saveState,winState:ret} }, { upsert: true }).then(_=>{
              InitSetting.reload()
            })

            saved = true
            console.log("getState")
            if(!flag) bw.close()
          }catch(e){
            saved = true
          }
        })
        setTimeout(_=>{
          if(!flag){
            flag = true
            saved = true
            if(!bw.isDestroyed()) bw.close()
          }
        },2000)
        e.preventDefault()
      }
      else{
        console.log("closing")
        BrowserWindow.getAllWindows().forEach(win=>{
          if(bw!=win) win.close()
        })
        PubSub.publish('chrome-windows-onRemoved',bw.id)
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
      normalSize[bw.id] = bw.getBounds()
    }
  })

  bw.on('blur', ()=> PubSub.publish('chrome-windows-onFocusChanged',bw.id))
  bw.on('focus', ()=> PubSub.publish('chrome-windows-onFocusChanged',bw.id))

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
    let initWindow
    const setting = await InitSetting.val
    let winSetting = opt ? getSize(opt) : {x: setting.x, y: setting.y, width: setting.width, height: setting.height, maximize: setting.maximize}

    mainState.scaleFactor = electron.screen.getPrimaryDisplay().scaleFactor

    if(!opt){
      for(let [key,dVal] of Object.entries(settingDefault)){
        setOptionVal(key,dVal,setting[key])
      }
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
      app.setLocale(lang)
      mainState.lang = lang == 'zh-CN' ? lang : lang.slice(0,2)


      mainState.dragData = null

      mainState.searchProviders = {}
      for(let ele of (await searchEngine.find({}))){
        mainState.searchProviders[ele.name] = ele
      }
      console.log(90756,url)
      if(url && setting.winState) {
        mainState.winState = JSON.stringify({
          dirc: "v",
          key: "9b069c3c-bb0d-4267-b0ac-28c6ecb1f1b4",
          l: {
            key: "1505620587125_747c1b38-bf28-4a0f-a855-7e9839adc2cf_0",
            tabs: [{ pin: false, tabKey: "1505620587141_bec149c2-e3da-4ba3-a01a-ce876f2204ac",forceKeep:true, url }]
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
    }
    else if(opt.id){
      const newState = Object.assign({...setting.winState},{key:uuid.v4(),dirc: 'v',pd:'l',l:{key: uuid.v4(),tabs: []},size:'100%'})
      delete newState.r
      mainState.winState = JSON.stringify(newState)
    }


    console.log(77,winSetting)
    const win = BrowserWindow.getAllWindows().find(w=>w.getTitle().includes('Closed'))
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
      fullscreenable: isDarwin,
      // A frame but no title bar and windows buttons in titlebar 10.10 OSX and up only?
      titleBarStyle: 'hidden',
      autoHideMenuBar: true,
      frame: isDarwin,
      show: false,
      webPreferences: {
        plugins: true,
        sharedWorker: true,
        nodeIntegration: false,
        webSecurity: false,
        allowFileAccessFromFileUrls: true,
        allowUniversalAccessFromFileUrls: true,
        // blinkFeatures:'ResizeObserver',
        ...fontOpt
      }
    }
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
    if(!win){
      winArg.width = winArg.width || setting.width
      winArg.height = winArg.height || setting.height
      initWindow = create(winArg)
      localShortcuts.register(initWindow)
      initWindow.setMenuBarVisibility(true)
      initWindow.loadURL(`chrome://brave/${path.join(__dirname, '../index.html').replace(/\\/g,"/")}${getParam}`)
      // initWindow.webContents.openDevTools()
      initWindow.webContents.once('did-finish-load', () => {
        initWindow.show()
        if(!initWindow.isMaximized()){
          normalSize[initWindow.id] = initWindow.getBounds()
        }
        if(winArg.maximize) initWindow.maximize()
        initWindow.setAlwaysOnTop(!!winArg.alwaysOnTop)
      })

      new (require('./Download'))(initWindow)
    }
    else{
      initWindow = win
      win.setBounds({x: winArg.x, y: winArg.y, width: winArg.width || setting.width, height: winArg.height || setting.height})
      win.setSkipTaskbar(false)
      win.setTitle('Sushi Browser')
      // win.reload()
      win.loadURL(`chrome://brave/${path.join(__dirname, '../index.html').replace(/\\/g,"/")}${getParam}`)
      console.log(winArg,setting)

      win.webContents.once('did-finish-load', () => {
        win.show()
        if(winArg.maximize) win.maximize()
        win.setAlwaysOnTop(!!winArg.alwaysOnTop)
      })
    }
    // initWindow.webContents.openDevTools()
    PubSub.publish('chrome-windows-onCreated',initWindow.id)
    return initWindow
  },
  saveState(bw,callback){
    if(!bw) return
    const maximize = bw.isMaximized()
    const bounds = maximize ? normalSize[bw.id] : bw.getBounds()
    const maxBounds = bw.getBounds()
    bw.webContents.send('get-window-state',{})
    ipcMain.once('get-window-state-reply',(e,ret)=>{
      try{
        const saveState = {}
        for(let key of Object.keys(settingDefault)){
          if(key == "toggleNav") continue
          saveState[key] = mainState[key]
        }
        state.update({ key: 1 }, { $set: {key: 1, ver:fs.readFileSync(path.join(__dirname,'../VERSION.txt')).toString(), ...bounds, maximize,maxBounds,
          toggleNav:mainState.toggleNav==2 || mainState.toggleNav==3 ? 0 :mainState.toggleNav,...saveState,winState:ret} }, { upsert: true }).then(_=>_)
        saved = true
        console.log("getState")
      }catch(e){
        saved = true
      }
      if(callback) callback()
    })
  }
}

