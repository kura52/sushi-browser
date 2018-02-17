global.debug = require('debug')('info')
const databaseForked = require('./databaseForked')
import { app } from 'electron'
import fs from 'fs-extra'
import path from 'path'
const isDarwin = process.platform === 'darwin'

process.on('unhandledRejection', r => console.error(r));

function isPortable(){
  const file = path.join(__dirname,'../resource/portable.txt').replace(/app.asar([\/\\])/,'app.asar.unpacked$1')
  return fs.existsSync(file) && fs.readFileSync(file).toString().includes('true')
}

function changePortable(folder){
  if(isPortable()){
    const portablePath = path.join(__dirname,`../../../${isDarwin ? '../' : ''}${folder}`)
    console.log(portablePath)
    if(!fs.existsSync(portablePath)){
      fs.ensureDirSync(portablePath)
      const noPortablePath = app.getPath('userData')
      if(fs.existsSync(noPortablePath)){
        fs.copySync(noPortablePath,portablePath)
      }
    }
    app.setPath('userData', portablePath)
  }
}

if(databaseForked){
  const fs = require('fs-extra')
  if(isDarwin){
    app.dock.hide()
  }
  app.setPath('userData', app.getPath('userData').replace('brave','sushiBrowserDB').replace('sushi-browser','sushiBrowserDB'))
  changePortable('sushiBrowserDB')
  const appPath = app.getPath('userData')
  if (!fs.existsSync(appPath)) {
    fs.mkdirSync(appPath)
  }

  console.log(111,app.getPath('userData'),app.getPath('temp'))
  databaseForked()
}
else{
  const fs = require('fs-extra')
  const path = require('path')

  global.originalUserDataPath = app.getPath('userData')
  app.setPath('userData', app.getPath('userData').replace('brave','sushiBrowser').replace('sushi-browser','sushiBrowser'))
  changePortable('sushiBrowser')
  const appPath = app.getPath('userData')
  if (!fs.existsSync(appPath)) {
    fs.mkdirSync(appPath)
  }

  const resourcePath = path.join(app.getPath('userData'),'resource')
  if (!fs.existsSync(resourcePath)) {
    fs.mkdirSync(resourcePath)
    fs.copySync(path.join(__dirname,'../resource/file.png'),path.join(resourcePath,'file.png'))
  }

  require('./init')
}

