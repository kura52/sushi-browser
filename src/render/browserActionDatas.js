const electron = require('electron')
const {remote} = electron
const ipc = electron.ipcRenderer
const PubSub = require('./pubsub')
const browserActionMap = new Map()

function load(extInfos) {
  for (let [k,v] of Object.entries(extInfos)) {
    if(!('url' in v) || v.name == "brave" || v.theme) continue
    console.log(51,v)
    const o = {name:v.name,url:v.url,basePath:v.base_path,optionPage: v.manifest.options_page || (v.manifest.options_ui && v.manifest.options_ui.page),
      enabled:v.manifest.enabled ,icons:v.manifest.icons, version: v.manifest.version, description: v.manifest.description,orgId: v.base_path.split(/[\/\\]/).slice(-2,-1)[0] }
    if(v.manifest.page_action){
      o.default_icon = v.manifest.page_action.default_icon
      o.default_popup = v.manifest.page_action.default_popup
      o.default_title = v.manifest.page_action.default_title
    }
    if(v.manifest.browser_action){
      o.default_icon = v.manifest.browser_action.default_icon
      o.default_popup = v.manifest.browser_action.default_popup
      o.default_title = v.manifest.browser_action.default_title
    }
    if(v.manifest.background){
      o.background = v.manifest.background.page
    }

    console.log(o)
    browserActionMap.set(k,o)
  }
}
ipc.on('extension-ready',(e,info)=>{
  load(info)
  PubSub.publish('force-update-navbar')
})

ipc.on('extension-disable',(e,extensionId)=>{
  browserActionMap.delete(extensionId)
  PubSub.publish('force-update-navbar')
})

const key = Math.random().toString()
ipc.send('get-extension-info',key)
ipc.once(`get-extension-info-reply_${key}`,(e,extInfos)=>load(extInfos))



export default browserActionMap