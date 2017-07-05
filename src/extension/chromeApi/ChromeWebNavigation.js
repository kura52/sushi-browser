import {BrowserWindow,ipcMain} from 'electron'

export default class ChromeWebNavigation {
  constructor(appId){
    this.appId = appId
    this.callbacks = {}
  }

  addEvent(msg) {
    const addListener = (callback)=>{
      if (!this.callbacks[msg]) {
        this.callbacks[msg] = [callback]
        ipcMain.on(msg, (e, args)=> {
          for (let callback of this.callbacks[msg]) {
            // console.log(msg,args)
            callback(args)
          }
        })
      }
      else{
        this.callbacks[msg].push(callback)
      }
    }

    const hasListener = (callback) => {
      this.callbacks[msg] ? this.callbacks[msg].includes(callback) : false
    }

    return {
      addListener,
      hasListener: (callback) => this.callbacks[fname] ? this.callbacks[fname].includes(callback) : false
    }
  }

  get onBeforeNavigate() {
    return ::this.addEvent('chrome-webNavigation-onBeforeNavigate')
  }

  get onCommitted(){
    return ::this.addEvent('chrome-webNavigation-onCommitted')
  }

  get onCreatedNavigationTarget(){
    return ::this.addEvent('chrome-webNavigation-onCreatedNavigationTarget')
  }

}