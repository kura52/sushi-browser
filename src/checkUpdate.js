import {ipcMain} from 'electron'
import {getFocusedWebContents, getCurrentWindow} from './util'
import https from 'https'
import {state} from './databaseFork'
import mainState from './mainState'
const locale = require('../brave/app/locale')
const uuid = require('node-uuid')
const path = require('path')
const fs = require('fs')


const options = {
  hostname: 'sushib.me',
  path: '/check.json'
}


function checkUpdate(ver,checkedVersion){
  let body = ""
  const req = https.request(options, (res) => {
    res.on('data', (chunk) => {
      body += chunk
    });
    res.on('end', () => {
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
    });
  });
  req.end()
}

state.findOne({key: 1}).then(rec=>{
  const {checkedVersion} = rec
  const ver = fs.readFileSync(path.join(__dirname,'../VERSION.txt')).toString()
  setTimeout(_=>checkUpdate(ver,checkedVersion || '0.00'),1000)

  setInterval(_=>checkUpdate(ver,checkedVersion || '0.00'),1000*3600*5)
})