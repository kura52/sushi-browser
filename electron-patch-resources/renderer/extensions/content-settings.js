const {ipcFuncRenderer} = require('./util')

exports.setup = (extensionId) => {
  const contentSettings = {}
  for(let type of ['cookies','images','javascript','location','plugins','popups','notifications','fullscreen','mouselock','microphone','camera','unsandboxedPlugins','automaticDownloads','canvasFingerprinting']){
    contentSettings[type] = {
      get(details,callback){
        ipcFuncRenderer('contentSettings','get',callback,details,extensionId,type)
      },
      set(details,callback){
        ipcFuncRenderer('contentSettings','set',callback,details,extensionId,type)
      },
      clear(details,callback){
        ipcFuncRenderer('contentSettings','clear',callback,details,extensionId,type)
      }
    }
  }
  return contentSettings
}
