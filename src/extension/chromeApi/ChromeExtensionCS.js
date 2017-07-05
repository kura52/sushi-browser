export default class ChromeExtensionCS {
  constructor(appId,baseFilePath,basePath,runtime){
    this.appId = appId
    this.baseFilePath = baseFilePath
    this.basePath = basePath
    this.runtime = runtime
  }
  get onMessage(){
    const ret = {}
    for(let method of Object.keys(this.runtime.onMessage)){
      ret[method] = ::this.runtime.onMessage[method]
    }
    return ret
  }

  get sendMessage(){
    return ::this.runtime.sendMessage
  }

  get onConnect(){
    const ret = {}
    for(let method of Object.keys(this.runtime.onConnect)){
      ret[method] = ::this.runtime.onConnect[method]
    }
    return ret
  }

  get connect(){
    return ::this.runtime.connect
  }

  get onRequest(){
    return this.onMessage
  }

  getURL(path){
    return ::this.runtime.getURL(path)
  }

}