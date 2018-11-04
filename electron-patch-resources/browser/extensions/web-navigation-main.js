const {ipcFuncMain, getIpcNameFunc, eventRegist} = require('./util-main')
const getIpcName = getIpcNameFunc('WebNavigation')

const eventObj = {}
for(let method of ['onBeforeNavigate', 'onCompleted', 'onDOMContentLoaded', 'onCommitted', 'onErrorOccurred', 'onCreatedNavigationTarget']){
  eventObj[method] = eventRegist(getIpcName(method))
}

module.exports = function(webContents, sendToBackgroundPage){
  const addEvent = (eventName, webContentsEventName) => {
    let registEvent = {}
    eventObj[eventName].regist((extensionId, eventId)=>{
      registEvent[eventId] = (event, url) => {
        if(!event.isMainFrame) return
        sendToBackgroundPage(extensionId, getIpcName(eventName, extensionId), eventId, {
          frameId: 0,
          parentFrameId: -1,
          processId: webContents.getProcessId(),
          tabId: webContents.id,
          timeStamp: Date.now(),
          error: event.errorDescription,
          url: url || webContents.getURL()
        })
      }
      webContents.on(webContentsEventName, registEvent[eventId])
    })
    eventObj[eventName].unregist((extensionIds, eventId)=>{
      webContents.removeListener(webContentsEventName, registEvent[eventId])
    })
  }
  addEvent('onBeforeNavigate', 'will-navigate')
  addEvent('onCompleted', 'did-navigate')
  addEvent('onDOMContentLoaded', 'dom-ready')
  addEvent('onCommitted', 'load-commit')
  addEvent('onErrorOccurred', 'did-fail-load')


  let onCreatedNavigationTargetEvent = {}
  eventObj.onCreatedNavigationTarget.regist((extensionId, eventId)=>{
    onCreatedNavigationTargetEvent[eventId] = (event, data) => {
      sendToBackgroundPage(extensionId, getIpcName('onCreatedNavigationTarget'), data)
    }
    ipcMain.on('chrome-webNavigation-onCreatedNavigationTarget', onCreatedNavigationTargetEvent[eventId])
  })
  eventObj.onCreatedNavigationTarget.unregist((extensionIds, eventId)=>{
    ipcMain.removeListener('chrome-webNavigation-onCreatedNavigationTarget', onCreatedNavigationTargetEvent[eventId])
  })
}