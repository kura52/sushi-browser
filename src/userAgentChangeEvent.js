import { ipcMain,session } from 'electron'

let first = true
const tabs = new Map()
ipcMain.on('user-agent-change', async (event, datas) => {
  tabs.set(datas.tabId,datas.ua)
  if(first){
    const ret = session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
      const ua = tabs.get(details.tabId)
      if(ua){
        details.requestHeaders['User-Agent'] = ua
        callback({requestHeaders: details.requestHeaders });
      }
      else{
        callback({})
      }
    });
    first = false
  }
})
