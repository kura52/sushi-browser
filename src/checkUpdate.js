import {ipcMain} from 'electron'
import {getFocusedWebContents, getCurrentWindow} from './util'
import request from 'request'
import {state} from './databaseFork'
import mainState from './mainState'
const locale = require('../brave/app/locale')
const uuid = require('node-uuid')
const path = require('path')
const fs = require('fs')

function exec(command) {
  console.log(command)
  return new Promise(function(resolve, reject) {
    require('child_process').exec(command, function(error, stdout, stderr) {
      if (error) {
        return reject(error);
      }
      resolve({stdout, stderr});
    });
  });
}

function gt(a,b){
  a = a.split('.')
  const sumA = (parseInt(a[0] || 0)) * 10000 + (parseInt(a[1] || 0)) * 100 + (parseInt(a[2] || 0))
  b = b.split('.')
  const sumB = (parseInt(b[0] || 0)) * 10000 + (parseInt(b[1] || 0)) * 100 + (parseInt(b[2] || 0))
  return sumA > sumB
}

function checkUpdate(ver,checkedVersion){
  request(`https://sushib.me/check.json?a=${Math.floor(Date.now()/1000/3600)}`,(err,res,body)=>{
    if(!body) return
    const updVer = JSON.parse(body).ver
      console.log(ver,updVer,checkedVersion,mainState.checkedVersion)
      if(gt(mainState.checkedVersion,checkedVersion)) checkedVersion = mainState.checkedVersion
      if(gt(updVer,ver) && gt(updVer,checkedVersion)){
        const key = uuid.v4()
        const bw = getCurrentWindow()
        const isWin = process.platform == 'win32'
        bw.webContents.send('show-notification',{key,text:`${locale.translation('updateAvail').replace('Brave','Sushi Browser')} (Version: ${updVer})${isWin ? '\n*When you run update.cmd, automatic update will be done.(Experimental)' : ''}`, buttons:['Check Website','No Thanks']})

        ipcMain.once(`reply-notification-${key}`,(e,ret)=>{
          mainState.checkedVersion = updVer
          if(ret.pressIndex === 0){
            getFocusedWebContents().then(cont=>{
              if(cont) cont.hostWebContents2.send('new-tab', cont.id, 'https://sushib.me/download.html')
            })
          }
        })
      }
  })
}

state.findOne({key: 1}).then(rec=>{
  const {checkedVersion} = rec || {}
  const ver = fs.readFileSync(path.join(__dirname,'../VERSION.txt')).toString()
  setTimeout(_=>checkUpdate(ver,checkedVersion || '0.0.0'),4000)
  //
  setInterval(_=>checkUpdate(ver,checkedVersion || '0.0.0'),1000*3600*5)
})