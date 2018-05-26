import {ipcMain} from 'electron'
import {getFocusedWebContents, getCurrentWindow} from './util'
import {request} from './request'
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
      if(true || gt(updVer,ver) && gt(updVer,checkedVersion)){
        const key = uuid.v4()
        const bw = getCurrentWindow()
        bw.webContents.send('show-notification',{key,text:`${locale.translation('updateAvail').replace('Brave','Sushi Browser')} (Version: ${updVer})`, buttons:['Auto Update','Check Website','No Thanks']})

        ipcMain.once(`reply-notification-${key}`,(e,ret)=>{
          mainState.checkedVersion = updVer
          if(ret.pressIndex === 0){
            const isDarwin = process.platform == 'darwin'
            const isLinux = process.platform === 'linux'
            const fname = `sushi-browser-${updVer}${isLinux ? '' : isDarwin ? '-mac-x64' : `-win-${process.arch}`}.${isLinux ? 'tar.bz2' : 'zip'}`
            const fullPath = path.join(__dirname,'..',fname)
            const extractDirc = path.join(__dirname,'..',`_update_${Date.now()}`)
            const url = `https://sushib.me/dl/${fname}`
            console.log(url)

            ipcMain.emit('set-save-path', null,url, fullPath,true)
            e.sender.downloadURL(url)

            let exePath = require("glob").sync(path.join(__dirname,'../../7zip/*/{7za,7za.exe}'))
            if(!exePath.length){
              exePath = require("glob").sync(path.join(__dirname,'../../app.asar.unpacked/resource/bin/7zip/*/{7za,7za.exe}'))
              if(!exePath.length){
                return
              }
            }
            let retry = 0
            setTimeout(_=>{
              const intId = setInterval(async _=>{
                console.log(234,global.downloadItems)
                if(retry++ > 10000) clearInterval(intId)
                if(!global.downloadItems.find(x=>x.savePath == fullPath)){
                  try{
                    console.log(fullPath,retry)
                    if(!fs.existsSync(fullPath)) return
                    clearInterval(intId)
                    const ret = await exec(`"${exePath[0]}" x -y -o"${extractDirc}" "${fullPath}"`)
                    console.log(345,ret)

                    open(path.join(extractDirc,isDarwin || isLinux ? 'sushi' : 'sushi.exe'))

                    fs.unlink(fullPath,_=>_)
                  }catch(e){
                    console.log(e)
                  }
                }
              },300)
            },2000)
          }
          else if(ret.pressIndex === 1){
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
  setTimeout(_=>checkUpdate(ver,checkedVersion || '0.0.0'),4000)

  setInterval(_=>checkUpdate(ver,checkedVersion || '0.0.0'),1000*3600*5)
})