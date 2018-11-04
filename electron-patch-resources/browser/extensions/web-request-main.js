const {ipcMain} = require('electron')
const {getIpcNameFunc, eventRegist, shortId} = require('./util-main')
const getIpcName = getIpcNameFunc('WebRequest')

const methods = [
  'onAuthRequired',
  'onBeforeRedirect',
  'onBeforeRequest',
  'onBeforeSendHeaders',
  'onCompleted',
  'onErrorOccurred',
  'onHeadersReceived',
  'onResponseStarted',
  'onSendHeaders'
]

const eventObj = {}
for(let method of methods){
  eventObj[method] = eventRegist(getIpcName(method))
}
const matchesPattern = function (pattern, url) {
  if (pattern === '<all_urls>') return true
  const regexp = new RegExp(`^${pattern.replace(/[-[\]{}()^$|+?.\\/\s]/g, '\\$&').replace(/\*/g, '.*')}$`)
  return url.match(regexp)
}

module.exports = function(session, sendToBackgroundPage){

  for(let method of methods){
    let properties = {}, adblocks = []
    const webRequestEvent = (details, cb) => {
      const promises = []
      for (let [extensionId, eventId, filter] of Object.values(properties)) {
        if (filter) {
          if ((filter.urls && !filter.urls.some(pattern => matchesPattern(pattern, details.url))) ||
            (filter.types && !filter.types.some(t => t == details.resourceType.replace('Frame', '_frame'))) ||
            (filter.tabId !== void 0 && details.webContentsId && details.webContentsId != filter.tabId)
          ) continue

        }

        if(cb){
          promises.push(new Promise(r=>{
            ipcMain.once(`${getIpcName(method, extensionId)}_${eventId}_RESULT`, (e, result) =>{
              r(result)
            })
          }))
        }

        sendToBackgroundPage(extensionId, getIpcName(method, extensionId), eventId, {
          tabId: details.webContentsId || -1,
          frameId: 0,
          parentFrameId: -1,
          type: details.resourceType.replace('Frame', '_frame'),
          ...details
        })

        // console.log([method, extensionId, eventId].join("\t"))
        const ret = {}
      }
      for(let func of adblocks){
        promises.push(new Promise(r =>{
          func(details, r)
        }))
      }
      if(cb){
        // console.log(22222234,promises.length)
        Promise.all(promises).then(results => {
          // console.log(22222235,results)
          const finalResult = {}
          for(let result of results){
            result = result || {}
            if(result.cancel !== void 0) finalResult.cancel = finalResult.cancel || result.cancel
            if(result.statusLine !== void 0) finalResult.statusLine = result.statusLine
            if(result.requestHeaders !== void 0) finalResult.requestHeaders = Object.assign(finalResult.requestHeaders || {}, result.requestHeaders)
            if(result.responseHeaders !== void 0) finalResult.responseHeaders = Object.assign(finalResult.responseHeaders || {}, result.responseHeaders)
         }
         cb(finalResult)
        })
      }
    }

    eventObj[method].regist((extensionId, eventId, filter)=>{
      if(method != 'onBeforeRequest' && method != 'onHeadersReceived' && !Object.keys(properties).length){
        session.webRequest[method](webRequestEvent)
      }
      properties[`${extensionId}${eventId}`] = [extensionId, eventId, filter]
    })
    eventObj[method].unregist((extensionId, eventId)=>{
      delete properties[`${extensionId}${eventId}`]
      if(method != 'onBeforeRequest' && method != 'onHeadersReceived' && !Object.keys(properties).length){
        session.webRequest[method](null)
      }
    })

    if(method == 'onBeforeRequest' || method == 'onHeadersReceived'){
      session.webRequest[method](webRequestEvent)
      ipcMain.on(`add-${method}`, (func) =>{
        adblocks.push(func)
      })
    }
  }

}
