import { app, Menu, clipboard, BrowserWindow, ipcMain, session,webContents } from 'electron'
const uuid = require("node-uuid")

function getCurrentWindow(){
  const focus = BrowserWindow.getFocusedWindow()
  if(focus && focus.getTitle().includes('Sushi Browser')) return focus
  return BrowserWindow.getAllWindows().find(w=>w.getTitle().includes('Sushi Browser'))
}

function getFocusedWebContents(needSelectedText){
  let cont
  const tmp = webContents.getFocusedWebContents()
  if(tmp && !tmp.isDestroyed() && !tmp.isBackgroundPage()) {
    if(tmp.isGuest()){
      console.log(88,tmp)
      return new Promise(resolve=>resolve(tmp))
    }
    else{
      cont = tmp
      console.log(99,cont)
    }
  }

  console.log(77,cont)
  if(!cont){
    let win = getCurrentWindow()
    if(!win){
      // const key = uuid.v4()
      return new Promise((resolve,reject)=>{
        // let retry = 0
        // const id = setInterval(()=> {
        //   if((win = getCurrentWindow())){
        //     clearInterval(id)
        //     ipcMain.once(`get-focused-webContent-reply_${key}`,(e,tabId)=>{
        //       resolve(webContents.fromTabID(tabId))
        //     })
        //     win.webContents.send('get-focused-webContent',key)
        //   }
        //   else if(retry++ > 100){
        //     clearInterval(id)
        //     resolve(null)
        //   }
        // }, 200)
        resolve(null)
      })
    }

    cont = win.webContents
  }
  const key = uuid.v4()
  return new Promise((resolve,reject)=>{
    ipcMain.once(`get-focused-webContent-reply_${key}`,(e,tabId)=>{
      resolve(tabId === -1 ? cont : webContents.fromTabID(tabId))
    })
    cont.send('get-focused-webContent',key,void 0,needSelectedText)
  })

}

export default {
  getFocusedWebContents,
  getCurrentWindow
}