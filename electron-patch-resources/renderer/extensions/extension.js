const {Event} = require('./event')

exports.setup = (chrome) => {
  return {
    getURL: chrome.runtime.getURL.bind(chrome.runtime),
    connect: chrome.runtime.connect.bind(chrome.runtime),
    onConnect: chrome.runtime.onConnect,
    sendMessage: chrome.runtime.sendMessage.bind(chrome.runtime),
    onMessage: chrome.runtime.onMessage,
    sendRequest: chrome.runtime.sendMessage.bind(chrome.runtime), //@TODO FIX
    onRequest: chrome.runtime.onMessage, //@TODO FIX
    getBackgroundPage: chrome.runtime.getBackgroundPage.bind(chrome.runtime),
    getViews(){return {}}, //@TODO NOOP
    isAllowedFileSchemeAccess(callback){callback(true)}, //@TODO FIX
    isAllowedIncognitoAccess(callback){callback(true)}, //@TODO FIX
    setUpdateUrlData(data){}, //@TODO NOOP
    inIncognitoContext: false, //@TODO FIX
    onRequestExternal: new Event(), //@TODO FIX
    onConnectExternal: new Event(), //@TODO FIX
    onMessageExternal: new Event(), //@TODO FIX
  }
}
