import {remote,ipcRenderer} from 'electron'
const {webContents} = remote
ipcRenderer.setMaxListeners(0);

const methods = ['onBeforeRequest','onBeforeSendHeaders','onSendHeaders','onHeadersReceived','onResponseStarted','onBeforeRedirect','onCompleted','onErrorOccurred']

let self
export default class ChromeWebRequestBG {
  constructor(appId){
    self = this
    this.appId = appId
    this.callbacks = {}
    this.addedContents = {}
    for(let method of methods){
      Object.defineProperty(this, method, { get: () => ::this.addEvent(method)});
    }
  }

  initEvent(){
    ipcRenderer.on('chrome-webRequestBG-add-tab',(e,tab)=>{
      console.log('chrome-webRequestBG-add-tab')
      global.chrome.tabs.get(tab.tabId,(t)=>{
        console.log(t.contId)
        for(let fname of Object.keys(this.callbacks)){
          console.log(this.callbacks[fname])
          for(let [callback,filter] of this.callbacks[fname]){

            if(!this.addedContents[fname]){
              this.addedContents[fname] = new Map()
            }
            const cStr = callback.toString()
            if(!this.addedContents[fname].has(cStr)){
              this.addedContents[fname].set(cStr,new Set())
            }
            if(this.addedContents[fname].get(cStr).has(t.contId)) continue
            this.addedContents[fname].get(cStr).add(t.contId)

            webContents.fromId(t.contId).session.webRequest[fname](filter, (details, cb) => {
              const detailsPlus = {
                frameId: 0,
                parentFrameId: -1,
                type: details.resourceType.replace('Frame', '_frame'),
                ...details
              }
              detailsPlus.tabId = tab.tabId
              const ret = callback(detailsPlus)
              cb(ret || {})
            })
          }
        }
      })

    })
  }

  addEvent(fname) {
    const addListener = (callback,filter,opt_extraInfoSpec)=>{
      console.log(filter)
      this.callbacks[fname] = this.callbacks[fname] || []
      this.callbacks[fname].push([callback,filter])
      this.addCallbacks(fname, filter, callback);
    }

    return {
      addListener,
      hasListener: (callback) => this.callbacks[fname] ?  this.callbacks[fname].includes(callback) : false
    }
  }

  addCallbacks(fname, filter, callback) {
    global.chrome.windows.getAll(null, (wins)=> {
      for (let win of wins) {
        for (let tab of win.tabs) {
          if (tab.contId === (void 0)) continue
          console.log(tab)
          if(!this.addedContents[fname]){
            this.addedContents[fname] = new Map()
          }
          const cStr = callback.toString()
          if(!this.addedContents[fname].has(cStr)){
            this.addedContents[fname].set(cStr,new Set())
          }
          if(this.addedContents[fname].get(cStr).has(tab.contId)) continue
          this.addedContents[fname].get(cStr).add(tab.contId)
          webContents.fromId(tab.contId).session.webRequest[fname](filter, (details, cb) => {
            const detailsPlus = {
              tabId: parseInt(tab.key),
              frameId: 0,
              parentFrameId: -1,
              type: details.resourceType.replace('Frame', '_frame'),
              ...details
            }
            const ret = callback(detailsPlus)
            console.log(ret)
            cb(ret || {})
          })
        }
      }
    })
  }



}

