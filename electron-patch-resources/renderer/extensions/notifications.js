class Notifications {
  constructor () {
    this.notifications = {}
    this.onClosedEvents = new Set()
    this.onClickedEvent = new Set()

    this.onClosed = {
      addListener(cb) {
        this.onClosedEvents.add(cb)
      },
      removeListener(cb){
        this.onClosedEvents.delete(cb)
      },
      hasListener(cb){
        return this.onClosedEvents.has(cb)
      },
      hasListeners(){
        return !!this.onClosedEvents.length
      }
    }

    this.onClicked = {
      addListener(cb) {
        this.onClickedEvent.add(cb)
      },
      removeListener(cb){
        this.onClickedEvent.delete(cb)
      },
      hasListener(cb){
        return this.onClickedEvent.has(cb)
      },
      hasListeners(){
        return !!this.onClickedEvent.length
      }
    }


    this.onButtonClicked = {
      addListener(cb) {},
      removeListener(cb){},
      hasListener(cb){},
      hasListeners(){}
    }

  }

  create(notificationId, options, callback){
    if(typeof notificationId !== "string" && notificationId !== null && notificationId !== void 0 ){
      [notificationId,options,callback] = [Math.random().toString(),notificationId,options]
    }
    const params = {}
    if(options.imageUrl) params.icon = options.imageUrl.includes(':') ? options.imageUrl : `chrome-extension://${chrome.runtime.id}/${options.imageUrl}`
    if(options.iconUrl) params.icon = options.iconUrl.includes(':') ? options.iconUrl : `chrome-extension://${chrome.runtime.id}/${options.iconUrl}`
    if(options.message) params.body = options.message
    if(options.contextMessage){
      if(params.body){
        params.body += `\n${options.contextMessage}`
      }
      else{
        params.body = options.contextMessage
      }
    }
    const n = new Notification(options.title||"",params)
    this.notifications[notificationId] = [n,options]

    n.onclose = ()=>{
      for(let method of this.onClosedEvents){
        method(notificationId,true)
      }
    }
    n.onclick = ()=>{
      for(let method of this.onClickedEvent){
        method(notificationId)
      }
    }
    if(callback) callback(notificationId)
  }

  update(notificationId, options, callback){
    const [n,oldOptions] = this.notifications[notificationId]
    n.close()

    options = Object.merge(oldOptions,options)
    this.create = (notificationId, options, callback && (_=>callback(true)))
  }

  clear(notificationId, callback){
    if(this.notifications[notificationId]){
      const [n,options] = this.notifications[notificationId]
      delete this.notifications[notificationId]
      n.close()
    }
  }

  getAll(callback){
    const ret = []
    for(let [id,val] of this.notifications){
      ret.push(Object.assign({id,notificationId:id}, val))
    }
    callback(ret)
  }

}

exports.setup = (...args) => {
  return new Notifications(...args)
}
