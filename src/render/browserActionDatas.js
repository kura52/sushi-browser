const {remote} = require('electron')
const extInfos = {...remote.require('./extensionInfos')}
const browserActionMap = new Map()
for (let [k,v] of Object.entries(extInfos)) {
  if(!('url' in v) || v.name == "brave") continue
  console.log(51,v)
  const o = {name:v.name,url:v.url,basePath:v.base_path,optionPage: v.manifest.options_page,icons:v.manifest.icons, version: v.manifest.version, description: v.manifest.description }
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
  console.log(o)
  browserActionMap.set(k,o)
}

export default browserActionMap