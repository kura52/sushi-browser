import {ipcMain,app} from 'electron'
import {getFocusedWebContents, getCurrentWindow} from './util'
import mainState from './mainState'
const uuid = require('node-uuid')
const locale = require('../brave/app/locale')
const isLinux = process.platform === 'linux'

function checkDefault(){
  const key = uuid.v4()
  const bw = getCurrentWindow()
  bw.webContents.send('show-notification',{key,text:locale.translation('makeBraveDefault').replace('Brave','Sushi Browser'), buttons:[locale.translation('9218430445555521422'),locale.translation('notNow'),locale.translation('8926389886865778422')]})

  ipcMain.once(`reply-notification-${key}`,(e,ret)=>{
    if(ret.pressIndex === 0){
      app.setAsDefaultProtocolClient('https')
      app.setAsDefaultProtocolClient('http')
    }
    else if(ret.pressIndex == 2){
      mainState.checkDefaultBrowser = false
    }
  })
}
if(!isLinux){
  ipcMain.on('default-browser',checkDefault)
  if(mainState.checkDefaultBrowser && !app.isDefaultProtocolClient('http')){
    setTimeout(checkDefault,1000)
  }
}