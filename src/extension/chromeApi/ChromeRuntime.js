import {BrowserWindow,ipcMain} from 'electron'

export default class ChromeRuntime {
  constructor(appId,basePath,manifest){
    this.appId = appId
    this.manifest = manifest
    this.basePath = basePath
  }

  get onMessage(){
    const addListener = (callback)=>{
      ipcMain.on(`chrome-msg-to-manage:${this.appId}`, (e, message, sender, needResponse) => {
        console.log(`chrome-msg-to-manage:${this.appId}`)
        callback(message, sender, (response)=> {
          if (needResponse){
            if(e){
              e.sender.send(`chrome-msg-to-manage-reply:${this.appId}`, response)
            }
            else{
              ipcMain.emit(`chrome-msg-to-manage-reply:${this.appId}`, null, response)
            }
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
    console.log(message,responseCallback)
    ipcMain.once(`chrome-msg-to-manage-reply:${this.appId}`,(e,response)=>{
      responseCallback(response)
    })
    ipcMain.emit(`chrome-msg-to-manage:${this.appId}`, null, message,{tab:{id:""}}, !!responseCallback)
  }


  get onConnect(){
    const addListener = (callback)=>{
      ipcMain.on(`chrome-connect-to:${this.appId}`, (e, connectInfo, sender1, connectId) => {
        console.log(`chrome-connect-to:${this.appId}`, connectInfo, sender1,connectId)


        const postMessage = (message)=>{
          console.log(`chrome-cmsg-to-connecting:${this.appId}:${connectId}`,sender1.tab.id, message)
          if(sender1.tab.id > 0){
            e.sender.send(`chrome-cmsg-to-connecting:${this.appId}:${connectId}`, message)
          }
          else{
            ipcMain.emit(`chrome-cmsg-to-connecting:${this.appId}:${connectId}`, message)
          }
        }

        const addListener = (callback)=>{
          console.log(Date.now())
          console.log(`XXchrome-cmsg-to-connected:${this.appId}:${connectId}`)
          ipcMain.on(`chrome-cmsg-to-connected:${this.appId}:${connectId}`, (e, message, sender2) => {
            console.log(`chrome-cmsg-to-connected:${this.appId}:${connectId}`, message)
            callback(message,{postMessage,sender:sender2})
          })
        }
        const onMessage = {addListener}

        const port = {
          ...connectInfo,
          onMessage,
          postMessage
        }
        callback(port)
        return e.returnValue = "return"
      })
    }
    return {
      addListener
    }
  }

  //@TODO extensionId
  connect(connectInfo){
    const connectId = Date.now()
    console.log(connectInfo)
    ipcMain.emit(`chrome-connect-to:${this.appId}`, null, connectInfo,{tab:{id:-1}})

    const addListener = (callback)=>{
      ipcMain.on(`chrome-cmsg-to-connecting:${this.appId}:${connectId}`, (e, message) => {
        console.log(`chrome-cmsg-to-connecting:${this.appId}:${connectId}`, e, message)
        callback(message)
      })
    }
    const onMessage = {addListener}
    const postMessage = (message)=>{
      ipcMain.emit(`chrome-cmsg-to-connected:${this.appId}:${connectId}`, message)
    }

    const port = {
      ...connectInfo,
      onMessage,
      postMessage
    }

    return port
  }

  get onInstalled(){
    const addListener = (callback)=>{
    console.log("mock_onInstalled")
    }
    return {
      addListener
    }
  }

  getManifest(){
    return this.manifest
  }

  getURL(path){
    return this.basePath + (path ? path : "")
  }

}
