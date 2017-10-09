import {BrowserWindow, ipcRenderer} from 'electron'

export default class ChromeRuntimeCS {
  constructor(appId,baseFilePath,basePath){
    this.appId = appId
    this.baseFilePath = baseFilePath
    this.basePath = basePath
    this.tab = window.__tab__
    // ipcRenderer.on('set-tab',(e,tab)=>{
    //   console.log(e,tab)
    //   this.tab = tab
    // })
  }

  get onMessage(){
    const addListener = (callback)=>{
      ipcRenderer.on(`chrome-msg-to-tabs:${this.appId}:${this.tab.id}`, (e, message, sender, needResponse) => {
        console.log(`chrome-msg-to-tabs:${this.appId}:${this.tab.id}`, e, message, sender , needResponse)
        callback(message, sender, (response)=> {
          if (needResponse){
            e.sender.send(`chrome-msg-to-tabs-reply:${this.appId}:${this.tab.id}`, response)
          }
        })
      })
    }

    return {
      addListener
    }
  }

  //@TODO extensionId, options, callback
  sendMessage(message, responseCallback){
    console.log(`aachrome-msg-to-manage:${this.appId}`, message, this.tab, !!responseCallback)
    if(responseCallback){
      ipcRenderer.once(`chrome-msg-to-manage-reply:${this.appId}`,(e,response)=>{
        console.log(`xxchrome-msg-to-manage-reply:${this.appId}`, response)
        responseCallback(response)
      })
    }
    ipcRenderer.send(`chrome-msg-to-manage:${this.appId}`, message, this.tab, !!responseCallback)
  }

  //@TODO No Implemented
  get onConnect(){
    const addListener = (callback)=>{
    }

    return {
      addListener
    }
  }

  //@TODO extensionId
  connect(connectInfo){
    const connectId = Date.now()
    console.log(`CS-chrome-connect-to:${this.appId}`, connectInfo, this.tab,connectId)
    ipcRenderer.sendSync(`chrome-connect-to:${this.appId}`, connectInfo, this.tab,connectId)

    const addListener = (callback)=>{
      ipcRenderer.on(`chrome-cmsg-to-connecting:${this.appId}:${connectId}`, (e, message) => {
        console.log(`CS-chrome-cmsg-to-connecting:${this.appId}:${connectId}`, e, message)
        callback(message)
      })
    }
    const onMessage = {addListener}
    const postMessage = (message)=>{
      console.log(Date.now())
      console.log(`CS-chrome-cmsg-to-connected:${this.appId}:${connectId}`, message, this.tab)
      setTimeout(_=>ipcRenderer.send(`chrome-cmsg-to-connected:${this.appId}:${connectId}`, message, this.tab),10)

    }

    const port = {
      ...connectInfo,
      onMessage,
      postMessage
    }
    return port
  }
  getURL(path){
    return this.basePath + (path ? path : "")
  }
}
