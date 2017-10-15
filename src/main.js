global.debug = require('debug')('info')
const databaseForked = require('./databaseForked')
import { app } from 'electron'
const isDarwin = process.platform === 'darwin'

process.on('unhandledRejection', r => console.error(r));

if(databaseForked){
  const fs = require('fs-extra')
  if(isDarwin){
    app.dock.hide()
  }
  app.setPath('userData', app.getPath('userData').replace('brave','sushiBrowserDB').replace('sushi-browser','sushiBrowserDB'))
  const appPath = app.getPath('userData')
  if (!fs.existsSync(appPath)) {
    fs.mkdirSync(appPath)
  }

  console.log(111,app.getPath('userData'))
  databaseForked()
}
else{
  const fs = require('fs-extra')
  const path = require('path')
  app.setPath('userData', app.getPath('userData').replace('brave','sushiBrowser').replace('sushi-browser','sushiBrowser'))
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

