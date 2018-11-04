const {ipcFuncMainCb} = require('./util-main')
const {ipcMain} = require('electron')

const matchesPattern = function (pattern, url) {
  if (pattern === '<all_urls>') return true
  const regexp = new RegExp(`^${pattern.replace(/[-[\]{}()^$|+?.\\/\s]/g, '\\$&').replace(/\*/g, '.*')}$`)
  return url.match(regexp)
}

module.exports = function(manifestMap){

  const contentSettingsMap = {}
  ipcFuncMainCb('contentSettings','get',(e,details,extensionId,type,cb)=>{
    if(!contentSettingsMap[extensionId] || !contentSettingsMap[extensionId][type]) return cb({})

    for(let val of contentSettingsMap[extensionId][type]){
      const resource = details.resourceIdentifier ? details.resourceIdentifier.id : void 0
      const matchPrimary = matchesPattern(val.primaryPattern, details.primaryUrl)
      const matchSecondary = !details.secondaryUrl || matchesPattern(val.secondaryPattern, details.secondaryUrl)
      const matchResource = !resource || resource == val.resourceId
      if(matchPrimary && matchSecondary && matchResource){
        return cb(val)
      }
    }
  })



  ipcFuncMainCb('contentSettings','set',(e,details,extensionId,type,cb)=>{
    if(!contentSettingsMap[extensionId]){
      contentSettingsMap[extensionId] = {}
    }
    if(!contentSettingsMap[extensionId][type]){
      contentSettingsMap[extensionId][type] = []
    }

    contentSettingsMap[extensionId][type].push({primaryPattern: details.primaryPattern,setting: details.setting})
    if(details.secondaryPattern) contentSettingsMap[extensionId][type].secondaryPattern = details.secondaryPattern
    if(details.resourceIdentifier) contentSettingsMap[extensionId][type].resourceId = details.resourceIdentifier.id

    let conf = defaultConf
    for(let val of Object.values(contentSettingsMap)){
      conf = {...conf,...val}
    }
    // session.defaultSession.userPrefs.setDictionaryPref('content_settings', conf) @TODO FIX
    cb()
  })


  ipcFuncMainCb('contentSettings','clear',(e,details,extensionId,type,cb)=>{
    if(!contentSettingsMap[extensionId] || !contentSettingsMap[extensionId][type]) return cb()
    delete contentSettingsMap[extensionId][type]
    cb()
  })

}