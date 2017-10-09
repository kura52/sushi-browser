export default class ChromeI18n {
  constructor(appId,localMessages){
    this.appId = appId
    this.localMessages = localMessages
  }

  getMessage(messageName){
    const msg = this.localMessages[messageName]
    return msg ? msg.message : (void 0)
  }
}

