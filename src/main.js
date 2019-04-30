// require('v8-compile-cache')
console.log(process.argv)
global.debug = require('debug')('info')
const databaseForked = require('./databaseForked')
let app
import fs from 'fs-extra'
import path from 'path'
const isDarwin = process.platform === 'darwin'

process.on('uncaughtException', r => {
  console.trace('uncaughtException',r)
})
process.on('unhandledRejection', r => {
  console.trace('unhandledRejection',r)
})

;(function(){
  try{
    app = require('electron').app
  }catch(e){}
}())

function getPortable(){
  if(!global.portable){
    const file = path.join(__dirname,'../resource/portable.txt').replace(/app.asar([\/\\])/,'app.asar.unpacked$1')
    global.portable = {
      state: fs.existsSync(file) && fs.readFileSync(file).toString().replace(/[ \r\n]/g,''),
      default: path.dirname(app ? app.getPath('userData'): process.argv[2]),
      portable: path.join(__dirname,`../../../${isDarwin ? '../../' : ''}`),
      file
    }
    console.log(5545435,global.portable)
  }
  return global.portable
}

function changePortable(folder){
  const portableData = getPortable().state
  if(portableData == 'true' || portableData == 'portable'){
    const portablePath = path.join(__dirname,`../../../${isDarwin ? '../../' : ''}${folder}`)
    console.log(portablePath)
    // if(!fs.existsSync(portablePath)){
    //   fs.ensureDirSync(portablePath)
    //   const noPortablePath = app.getPath('userData')
    //   if(fs.existsSync(noPortablePath)){
    //     fs.copySync(noPortablePath,portablePath)
    //   }
    // }
    if(app) app.setPath('userData', portablePath)
  }
}

;(()=>{

  if(databaseForked){
    if(isDarwin){
      app.dock.hide()
    }
    // app.setPath('userData', app.getPath('userData').replace('Electron','sushiBrowserDB').replace('sushi-browser','sushiBrowserDB'))
    // changePortable('db')
    const appPath = process.argv[2]
    if (!fs.existsSync(appPath)) {
      fs.mkdirSync(appPath)
    }

    databaseForked()
  }
  else{
    global.originalUserDataPath = app.getPath('userData')
    app.setPath('userData', app.getPath('userData').replace('Electron','sushiBrowser').replace('sushi-browser','sushiBrowser').replace('sushiBrowser', 'sushiBrowserChrome'))
    changePortable('data')
    console.log(7773477,process.argv)

    const isWin = process.platform == 'win32'
    if(isWin && process.argv[1] == '--update-delete'){
      const sh = require('shelljs')
      const glob = require("glob")
      setTimeout(_=>{
        const files = glob.sync(path.join(__dirname, '../../..', '_update_*'))
        if (files.length && glob.sync(path.join(files[files.length - 1], "sushi-browser-portable")).length) {
          const dir = files[files.length - 1]
          console.log(dir)
          if(dir.match(/_update_[\d\.]+$/)) sh.rm('-rf', dir)
        }
      },100)
    }

    const appPath = app.getPath('userData')
    if (!fs.existsSync(appPath)) {
      fs.mkdirSync(appPath)
    }

    const resourcePath = path.join(app.getPath('userData'),'resource')
    if (!fs.existsSync(resourcePath)) {
      fs.mkdirSync(resourcePath)
    }
    if(!fs.existsSync(path.join(resourcePath,'file.svg'))){
      fs.copySync(path.join(__dirname,'../resource/file.svg'),path.join(resourcePath,'file.svg'))
    }

    require('./init')
  }
})()
