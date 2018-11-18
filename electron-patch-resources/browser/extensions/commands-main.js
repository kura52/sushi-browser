const {ipcFuncMain, getIpcNameFunc, eventRegist, getFocusedWebContents} = require('./util-main')
const {ipcMain} = require('electron')
const getIpcName = getIpcNameFunc('Commands')

const eventOnCommand = eventRegist(getIpcName('onCommand'))
let first = true

module.exports = function(sendToBackgroundPage){

  const registBackgroundPages = new Map()
  eventOnCommand.regist((extensionId, eventId)=>{
    if(first){
      ipcMain.on('chrome-commands-exec',(e,{id,command})=>{
        for(let [eventId, extensionId] of registBackgroundPages) {
          if(id != extensionId) continue
          if(command == '_execute_browser_action' || command == '_execute_page_action'){
            getFocusedWebContents().then(cont=>{
              cont.send('chrome-browserAction-onClicked', id, cont.id)
            })
          }
          else{
            sendToBackgroundPage(extensionId, getIpcName('onCommand', extensionId), eventId, command)
          }
        }
      })
      first = false
    }
    registBackgroundPages.set(eventId, extensionId)
  })
  eventOnCommand.unregist((extensionIds, eventId)=>{
    registBackgroundPages.delete(eventId)
  })


}