const electron = require('electron')
const {BrowserWindow,app,ipcMain} = electron
const url = require('url')
const path = require('path')
const fs = require('fs')
const initPromise = require('./InitSetting')
import { state } from './databaseFork'
import mainState from './mainState'
const uuid = require("node-uuid")
const isDarwin = process.platform === 'darwin'
const lang = Intl.NumberFormat().resolvedOptions().locale

const normalSize = {}
let saved = false

function create(args){
  console.log(44421,args)
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
    console.log(e.sender.getTitle())
    const sendTitle = e.sender.getTitle()
    if(sendTitle.includes('Closed')){
      if(!saved){
        e.preventDefault()
      }
      return
    }
    else if(sendTitle.includes('Sushi Browser')){
      const wins = BrowserWindow.getAllWindows().filter(w=>w.getTitle().includes('Sushi Browser'))
      console.log(wins.length)
      if(wins.length > 1){ //@TODO close event hang out other windows
        // bw.setSkipTaskbar(true)
        bw.setTitle('Closed')
        bw.webContents.send('unmount-components',{})
        // bw.loadURL(`file://${path.join(__dirname, '../blank.html').replace(/\\/g,"/")}`)
        bw.hide()

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
        bw.webContents.send('show-notification',{key,text:'Do you want to close the browser and cancel all downloads?', buttons:['Yes','No']})

        ipcMain.once(`reply-notification-${key}`,(e,ret)=>{
          if(ret.pressIndex !== 0) return
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
        ipcMain.once('get-window-state-reply',(e,ret)=>{
          try{
            state.update({ key: 1 }, { $set: {key: 1, ver:fs.readFileSync(path.join(__dirname,'../VERSION.txt')).toString(), ...bounds, maximize,maxBounds,
              toggleNav:mainState.toggleNav==2 || mainState.toggleNav==3 ? 0 :mainState.toggleNav,oppositeGlobal:mainState.oppositeGlobal,adBlockEnable:mainState.adBlockEnable,alwaysOnTop:mainState.alwaysOnTop,keepTabs:mainState.keepTabs,downloadNum:mainState.downloadNum,winState:ret} }, { upsert: true }).then(_=>_)
            saved = true
            console.log("getState")
            bw.close()
          }catch(e){
            // console.log(e)
            saved = true
          }
        })
        e.preventDefault()
      }
      else{
        console.log("closing")
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
      normalSize[bw.id] = bw.getBounds()
    }
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

function getSize(id){
  const bw = BrowserWindow.fromId(id)
  const maximize = false //bw.isMaximized()
  const bounds = normalSize[bw.id] //maximize ? normalSize[bw.id] : bw.getBounds()
  return {...bounds,maximize}
}

export default {
  load(opt){
    let initWindow
    initPromise.then((setting)=>{
      let winSetting = opt ? getSize(opt.id) : {x: setting.x, y: setting.y, width: setting.width, height: setting.height, maximize: setting.maximize}
      if(!opt){
        mainState.dragData = null
        mainState.toggleNav = setting.toggleNav === (void 0) ? 0 :setting.toggleNav
        mainState.adBlockEnable = setting.adBlockEnable === (void 0) ? true :setting.adBlockEnable
        mainState.oppositeGlobal = setting.oppositeGlobal === (void 0) ? true :setting.oppositeGlobal
        mainState.alwaysOnTop = setting.alwaysOnTop === (void 0) ? false :setting.alwaysOnTop
        mainState.keepTabs = setting.keepTabs === (void 0) ? false :setting.keepTabs
        mainState.downloadNum = setting.downloadNum === (void 0) ? 1 :setting.downloadNum
        mainState.winState = JSON.stringify(setting.winState)
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
      let [maxWidth,maxHeight] = [0,0]
      for(let display of electron.screen.getAllDisplays()){
        let {x,y,width,height }= display.bounds
        maxWidth = Math.max(maxWidth,x+width)
        maxHeight = Math.max(maxHeight,y+height)
      }
      if(winArg.x >= maxWidth) winArg.x = 100
      if(winArg.y >= maxHeight) winArg.y = 100

      let getParam = ""
      if(opt && opt.tabParam){
        getParam = `?tabparam=${encodeURIComponent(opt.tabParam)}`
        if(opt.x){
          winArg.x = opt.x - (mainState.toggleNav == 1 && winArg.width ? Math.round(winArg.width / 3) : 0)
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
        initWindow.setMenuBarVisibility(true)
        initWindow.loadURL(`chrome://brave/${path.join(__dirname, '../index.html').replace(/\\/g,"/")}${getParam}`)
        // initWindow.webContents.openDevTools()
        initWindow.webContents.once('did-finish-load', () => {
          initWindow.show()
          if(!initWindow.isMaximized()){
            normalSize[initWindow.id] = initWindow.getBounds()
          }
          if(winArg.maximize) initWindow.maximize()
        })

        new (require('./Download'))(initWindow)
      }
      else{
        initWindow = win
        win.setBounds({x: winArg.x, y: winArg.y, width: winArg.width || setting.width, height: winArg.height || setting.height})
        win.setSkipTaskbar(false)
        win.setTitle('Sushi Browser')
        win.loadURL(`chrome://brave/${path.join(__dirname, '../index.html').replace(/\\/g,"/")}${getParam}`)
        console.log(winArg,setting)

        win.webContents.once('did-finish-load', () => {
          win.show()
          if(winArg.maximize) win.maximize()
        })
      }
      // initWindow.webContents.openDevTools()
    })

    // initWindow.loadURL(url.format({
    //   pathname: path.join(__dirname, '../index.html'),
    //   protocol: 'file:',
    //   webPreferences: {
    //     sharedWorker: true,
    //     nodeIntegration: false,
    //     partition: 'default',
    //     webSecurity: false,
    //     allowFileAccessFromFileUrls: true,
    //     allowUniversalAccessFromFileUrls: true
    //   },
    //   slashes: true
    // }))

    // global.rlog = (...args)=>{
    //   const obj = {}
    //   Error.captureStackTrace( obj, global.rlog );
    //
    //   if(Math.round(args[args.length -1]) === args[args.length -1] && args[args.length - 1] >= 2000){
    //     setTimeout(()=>{
    //         try{
    //           if(!initWindow || !initWindow.webContents) return
    //           initWindow.webContents.send("rlog",args)
    //           initWindow.webContents.send("rlog",[obj.stack])
    //         }catch(e){console.log(e)}
    //       }
    //       ,args[args.length -1])
    //   }
    //   else{
    //     try{
    //       if(!initWindow || !initWindow.webContents) return
    //       initWindow.webContents.send("rlog",args)
    //       initWindow.webContents.send("rlog",[obj.stack])
    //     }catch(e){console.log(e)}
    //   }
    // }

    return initWindow
  }
}

