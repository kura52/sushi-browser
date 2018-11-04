const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const chromeManifestModify = require('../../lib/chromeManifestModify')
const {BrowserWindow,app,nativeImage} = require('electron')
const extInfos = require('../../lib/extensionInfos')
const mainState = require('../../lib/mainState')
const PubSub = require('../../lib/render/pubsub')
const hjson = require('hjson')

function removeBom(x){
  return x.charCodeAt(0) === 0xFEFF ? x.slice(1) : x
}

module.exports.init = (verChange) => {
  const {session} = require('electron')

  function search(obj,messages){
    if(Array.isArray(obj)){
      let i = 0
      for(let v of obj){
        if(Array.isArray(v) || v instanceof Object){
          search(v,messages)
        }
        else if((typeof (v) == "string" || v instanceof String) && v.startsWith('__MSG_')){
          const msg = messages[v.slice(6,-2)]
          if(msg && msg.message){
            obj[i] = msg.message
          }
        }
        ++i
      }
    }
    else if(obj instanceof Object){
      for(let [k,v] of Object.entries(obj)){
        if(Array.isArray(v) || v instanceof Object){
          search(v,messages)
        }
        else if((typeof (v) == "string" || v instanceof String) && v.startsWith('__MSG_')){
          const msg = messages[v.slice(6,-2)]
          if(msg && msg.message){
            obj[k] = msg.message
          }
        }
      }
    }
  }

  function transInfos(installInfo){
    const locale = app.getLocale().replace('-', "_")
    const basePath = installInfo.base_path

    if(!basePath) return
    let localePath = path.join(basePath, `_locales/${locale.split("_")[0]}/messages.json`)
    console.log(661,localePath)
    if (!fs.existsSync(localePath)) {
      localePath = path.join(basePath, `_locales/${locale}/messages.json`)
      console.log(662,localePath)
      if (!fs.existsSync(localePath)) {
        const default_locale = installInfo.manifest.default_locale || installInfo.default_locale
        localePath = path.join(basePath, `_locales/${default_locale}/messages.json`)
        console.log(663,localePath)
        if (!default_locale || !fs.existsSync(localePath)) {
          return
        }
      }
    }
    console.log(552,localePath)
    const messages = hjson.parse(removeBom(fs.readFileSync(localePath).toString()))
    search(installInfo,messages)
  }

  const extensionReady = (installInfo) => {
    console.log('extension-ready',installInfo.id)
    // console.log(434343,installInfo)
    extInfos.setInfo(installInfo)
    transInfos(installInfo)

    const orgId = installInfo.base_path.split(/[\/\\]/).slice(-2,-1)[0]
    if(mainState.disableExtensions.includes(orgId)){
      disableExtension(installInfo.id)
      return
    }

    const overrides = installInfo.manifest.chrome_url_overrides
    if(overrides){
      for(let [key,val] of Object.entries(overrides)){
        if(key=='newtab') mainState.topPage = `${installInfo.url}${val}`
        if(key=='bookmark') mainState.bookmarksPage = `${installInfo.url}${val}`
        if(key=='history') mainState.historyPage = `${installInfo.url}${val}`
      }
    }

    const commands = installInfo.manifest.commands
    if(commands){
      const plat = os.platform() == 'win32' ? 'windows' : os.platform() == 'darwin' ? 'mac' : 'linux'
      for(let [command,val] of Object.entries(commands)){
        if(val.suggested_key){
          PubSub.publish('add-shortcut',{id:installInfo.id,key:val.suggested_key[plat] || val.suggested_key.default,command})
        }
      }

    }

    const wins = BrowserWindow.getAllWindows()
    if(!wins) return

    for(let win of wins.filter(w=>w.getTitle().includes('Sushi Browser'))){
      try {
        if(!win.webContents.isDestroyed()){
          win.webContents.send('extension-ready',{[installInfo.id]:{...installInfo}})
          if(overrides){
            win.webContents.send('update-mainstate','newTabMode')
          }
        }
      }catch(e){
        // console.log(e)
      }
    }
  }

  const loadExtension = (extensionPath, admin) => {
    if(!extensionPath) return
    extensionPath = extensionPath.replace(/app.asar([\/\\])/,'app.asar.unpacked$1')
    const manifestPath = path.join(extensionPath, 'manifest.json')
    console.log('loadExtension',manifestPath)
    fs.exists(manifestPath, (exists) => {
      if (exists) {
        try{
          const manifestContents = hjson.parse(removeBom(fs.readFileSync(manifestPath).toString()))
          if(manifestContents.theme){
            manifestContents.id = path.basename(path.parse(srcDirectory).dir)
            manifestContents.url = `https://chrome.google.com/webstore/detail/${manifestContents.id}`
            manifestContents.manifest = {}
            manifestContents.base_path = extensionPath
            transInfos(manifestContents)
            if(manifestContents.theme) manifestContents.theme.base_path = extensionPath
            extInfos.setInfo(manifestContents)

            if(enable){
              mainState.enableTheme = manifestContents.id

              const theme = manifestContents.theme
              if(theme && theme.images){
                theme.sizes = {}
                for(let name of ['theme_toolbar','theme_tab_background']){
                  if(!theme.images[name]) continue
                  const file = path.join(theme.base_path,theme.images[name])
                  if(file && fs.existsSync(file)){
                    theme.sizes[name] = nativeImage.createFromPath(file).getSize()
                  }
                }
              }

              for(let win of BrowserWindow.getAllWindows()) {
                if(win.getTitle().includes('Sushi Browser')){
                  win.webContents.send('update-theme',manifestContents.theme)
                }
              }
            }

            return
          }

          console.log('load',extensionPath)
          const manifest = BrowserWindow.addExtensionWebview(extensionPath, admin)
          extensionReady({id: manifest.id, name: manifest.name, url: manifest.url, base_path: manifest.base_path, manifest})
        }catch(e){
          console.log(e)
        }
      } else {
        // This is an error condition, but we can recover.
        // extensionInfo.setState(extensionId, undefined)
        // componentUpdater.checkNow(extensionId)
      }
    })
  }
  module.exports.loadExtension = loadExtension

  const disableExtension = (extensionId) => {
    BrowserWindow.removeExtension(extensionId)

    const wins = BrowserWindow.getAllWindows()
    if(!wins) return
    for(let win of wins.filter(w=>w.getTitle().includes('Sushi Browser'))){
      try {
        if(!win.webContents.isDestroyed()){
          win.webContents.send('update-mainstate','newTabMode')
        }
      }catch(e){}
    }
  }

  module.exports.disableExtension = disableExtension

  const {getPath1,getPath2,extensionPath} =　require('../../lib/chromeExtensionUtil')

  require('./browserAction')

  let first = true
  const rejectExtensions = ['jpkfjicglakibpenojifdiepckckakgk','default','jdbefljfgobbmcidnmpjamcbhnbphjnb','occjjkgifpmdgodlplnacmkejpdionan','igiofjhpmpihnifddepnpngfjhkfenbp']
  module.exports.loadAll = function(){
    loadExtension(getPath1('default'), true)
    loadExtension(getPath1('jdbefljfgobbmcidnmpjamcbhnbphjnb'),true)

    if(mainState.enableMouseGesture){
      let ext = ['jpkfjicglakibpenojifdiepckckakgk',getPath1('jpkfjicglakibpenojifdiepckckakgk')]
      if(verChange) chromeManifestModify(...ext)
      loadExtension(ext[1], true)
    }

    if(process.platform != 'win32'){
      let ext = ['occjjkgifpmdgodlplnacmkejpdionan',getPath1('occjjkgifpmdgodlplnacmkejpdionan')]
      if(verChange) chromeManifestModify(...ext)
      loadExtension(ext[1], true)
    }
      let ext = ['igiofjhpmpihnifddepnpngfjhkfenbp', getPath1('igiofjhpmpihnifddepnpngfjhkfenbp')]
      if(verChange) chromeManifestModify(...ext)
      loadExtension(ext[1])

    //for(let fullPath of require("glob").sync(path.join(__dirname,'../../resource/extension/*').replace(/app.asar([\/\\])/,'app.asar.unpacked$1'))) {
    for(let fullPath of require("glob").sync(path.join(extensionPath,'*'))) {
      const appId = fullPath.split(/[\/]/).slice(-1)[0]
      console.log(555,appId,mainState.disableExtensions)
      if(!appId.match(/crx$/) && !rejectExtensions.includes(appId)){
        let ext = [appId,getPath2(appId)]
        if(verChange) chromeManifestModify(...ext)
        console.log('modi',appId)
        loadExtension(ext)
      }
    }
    first = false
  }
  module.exports.loadAll()
}
