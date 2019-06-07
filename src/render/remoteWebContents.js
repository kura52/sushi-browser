const remoteWebContents = require('electron').remote.require('./remoted-chrome/Browser').webContents
const ipc = require('electron').ipcRenderer

export default new Proxy(remoteWebContents, {
  get: (target, name) => {
    if(name == 'fromId'){
      return (tabId) => {
        let rWebContents
        return new Proxy({}, {
          get: (target, name) => {
            if(name == 'getURL' ||
              name == 'isDestroyed'){
              return (...args) => ipc.sendSync('webContents_event', name, tabId, false, ...args)
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
            else if(name == 'executeJavaScript'){
              const key = Math.random().toString()
              return (...args) => {
                const callback = args[args.length - 1]
                ipc.send('webContents_event', name, tabId, key, ...args.slice(0, args.length - 1))
                ipc.once(`webContents_event_${tabId}_${key}`, (e, result) =>{
                  callback(result)
                })
              }

            }
            else{
              if(!rWebContents) rWebContents = remoteWebContents.fromId(tabId)
              return rWebContents[name]
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

