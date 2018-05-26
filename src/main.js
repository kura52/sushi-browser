global.debug = require('debug')('info')
const databaseForked = require('./databaseForked')
import { app } from 'electron'
import fs from 'fs-extra'
import path from 'path'
const isDarwin = process.platform === 'darwin'

process.on('unhandledRejection', r => console.error(r));

function getPortable(){
  if(!global.portable){
    const file = path.join(__dirname,'../resource/portable.txt').replace(/app.asar([\/\\])/,'app.asar.unpacked$1')
    global.portable = {
      state: fs.existsSync(file) && fs.readFileSync(file).toString().replace(/[ \r\n]/g,''),
      default: path.dirname(app.getPath('userData')),
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
    app.setPath('userData', portablePath)
  }
}

;(()=>{

  if(databaseForked){
    if(isDarwin){
      app.dock.hide()
    }
    app.setPath('userData', app.getPath('userData').replace('brave','sushiBrowserDB').replace('sushi-browser','sushiBrowserDB'))
    changePortable('db')
    const appPath = app.getPath('userData')
    if (!fs.existsSync(appPath)) {
      fs.mkdirSync(appPath)
    }

    console.log(111,app.getPath('userData'),app.getPath('temp'))
    databaseForked()
  }
  else{
    global.originalUserDataPath = app.getPath('userData')
    app.setPath('userData', app.getPath('userData').replace('brave','sushiBrowser').replace('sushi-browser','sushiBrowser'))
    changePortable('data')
    console.log(7773477,process.argv)

    if(process.argv[1] == '--update'){
      const isWin = process.platform == 'win32'
      const sh = require('shelljs')
      const glob = require("glob")
      const fkill = require('fkill')
      fkill(isWin ? 'sushi' : 'sushi-browser', {force: true}).then(e=>console.log(e))
      const files = glob.sync(path.join(__dirname, '../../../..', '_update_*'))
      if (files.length && glob.sync(path.join(path.join(__dirname, '../../..'), "sushi*")).length &&
        glob.sync(path.join(path.join(__dirname, '../../../..'), "sushi*")).length){
        setTimeout(_=>{
          sh.cp('-Rf', path.join(__dirname, '../../..', '*'), path.join(__dirname, '../../../..','.'))
          sh.mv('-f',path.join(__dirname, '../../../..',isWin ? 'sushiu.exe' : 'sushiu', isWin ? 'sushi.exe' : 'sushi-browser'))
          const {spawn} = require('child_process')
          const p = path.join(__dirname,'../../../..')
          spawn(path.join(p,isWin ? 'sushi.exe' : 'sushi-browser'),['--update-delete'],{detached: true, stdio: 'ignore', cwd: p}).unref()
          setTimeout(_=>app.quit(),0)
        },2000)
        return
      }
    }
    else if(process.argv[1] == '--update-delete'){
      const isWin = process.platform == 'win32'
      const sh = require('shelljs')
      const glob = require("glob")
      const fkill = require('fkill')
      fkill(isWin ? 'sushiu' : 'sushiu', {force: true}).then(e=>console.log(e))
      setTimeout(_=>{
        const files = glob.sync(path.join(__dirname, '../../..', '_update_*'))
        if (files.length && glob.sync(path.join(files[files.length - 1], "sushi*")).length) {
          const dir = files[files.length - 1]
          console.log(dir)
          if(dir.match(/_update_\d+$/)) sh.rm('-rf', dir)
        }
      },2000)
    }
    else {
      const glob = require("glob")
      const files = glob.sync(path.join(__dirname, '../../..', '_update_*'))
      if (files.length && glob.sync(path.join(files[files.length - 1], "sushi*")).length) {
        const dir = files[files.length - 1]
        const {spawn} = require('child_process')
        const isWin = process.platform == 'win32'
        console.log(43432423,path.join(files[files.length - 1], isWin ? 'sushi.exe' : 'sushi-browser'))
        spawn(path.join(files[files.length - 1], isWin ? 'sushiu.exe' : 'sushiu'),['--update'],{detached: true, stdio: 'ignore', cwd: files[files.length - 1]}).unref()
        setTimeout(_=>app.quit(),0)
        return
      }
    }

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
})()
