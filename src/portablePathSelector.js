import {ipcMain,app,BrowserWindow} from 'electron'
import {getCurrentWindow} from './util'
const uuid = require('node-uuid')
const path = require('path')
const fs = require('fs')

function portableResourcePathSelector(){
  console.log(785675676,global.portable)
  const key = uuid.v4()
  const bw = getCurrentWindow()
  bw.webContents.send('show-notification',{key,text:`It is launched in Portable version. Whether User Data is stored in\nPortable path(${global.portable.portable}) or\nDefault path(${global.portable.default})`, buttons:['Portable','Default(Auto Restart)']})

  ipcMain.once(`reply-notification-${key}`,(e,ret)=>{
    fs.writeFileSync(global.portable.file,ret.pressIndex === 0 ? 'portable' : 'default')
    if(ret.pressIndex === 1){
      app.relaunch()
      BrowserWindow.getAllWindows().forEach(win=>{
        win.close()
      })
      app.quit()
    }
  })
}

if(global.portable.state == 'true'){
  console.log(34543543,global.portable)
  setTimeout(_=>portableResourcePathSelector(),2000)
}
