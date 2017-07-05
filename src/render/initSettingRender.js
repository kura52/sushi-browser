if(!("InitSettingRender" in global)){
  global.InitSettingRender = {}
  global.InitSettingRender = require('electron').remote.getGlobal('InitSetting')
}

export default global.InitSettingRender
