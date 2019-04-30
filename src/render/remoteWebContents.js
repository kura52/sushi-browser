const remoteWebContents = require('electron').remote.require('./remoted-chrome/Browser').webContents
const ipc = require('electron').ipcRenderer

const cont = new Proxy(remoteWebContents, {
  get: (target, name) => {
    if(name == 'fromId'){
      return (tabId) => {
        return new Proxy(remoteWebContents.fromId(tabId), {
          get: (target, name) => {
            if(name == 'getURL' ||
              name == 'isDestroyed'){
              return (...args) => ipc.sendSync('webContents_event', name, false, ...args)
            }
            else if(name == 'getNavigationHistory' ||
              name == 'getActiveIndex' ||
              name == 'length' ||
              name == 'getTitleAtIndex' ||
              name == 'getURLAtIndex' ||
              name == 'getTitle' ||
              name == 'send'||
              name == 'focus'||
              name == 'loadURL'||
              name == 'isLoading'||
              name == 'setAudioMuted'){
              const key = Math.random().toString()
              return (...args) => {
                return new Promise(r => {
                  ipc.send('webContents_event', name, tabId, key, ...args)
                  ipc.once(`webContents_event_${tabId}_${key}`, (e, result) =>{
                    r(result)
                  })
                })
              }
            }
            else{
              return target[name]
            }
          }
        })
      }
    }
    else{
      return target[name]
    }
  }
})
export default cont

