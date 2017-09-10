import {ipcMain} from 'electron'
import {getFocusedWebContents, getCurrentWindow} from './util'
import {request} from './request'
import {state} from './databaseFork'
import mainState from './mainState'
const locale = require('../brave/app/locale')
const uuid = require('node-uuid')
const path = require('path')
const fs = require('fs')


function checkUpdate(ver,checkedVersion){
  request('https://sushib.me/check.json',(err,res,body)=>{
    const updVer = JSON.parse(body).ver
    console.log(ver,updVer,checkedVersion,mainState.checkedVersion)
    if(mainState.checkedVersion > checkedVersion) checkedVersion = mainState.checkedVersion
    if(updVer > ver && updVer > checkedVersion){
      const key = uuid.v4()
      const bw = getCurrentWindow()
      bw.webContents.send('show-notification',{key,text:`${locale.translation('updateAvail').replace('Brave','Sushi Browser')} (Version: ${updVer})`, buttons:['Check Website','No Thanks']})

      ipcMain.once(`reply-notification-${key}`,(e,ret)=>{
        mainState.checkedVersion = updVer
        if(ret.pressIndex === 0){
          getFocusedWebContents().then(cont=>{
            if(cont) cont.hostWebContents.send('new-tab', cont.getId(), 'https://sushib.me/download.html')
          })
        }
      })
    }
  })
}

state.findOne({key: 1}).then(rec=>{
  const {checkedVersion} = rec
  const ver = fs.readFileSync(path.join(__dirname,'../VERSION.txt')).toString()
  setTimeout(_=>checkUpdate(ver,checkedVersion || '0.00'),1000)

  setInterval(_=>checkUpdate(ver,checkedVersion || '0.00'),1000*3600*5)
})