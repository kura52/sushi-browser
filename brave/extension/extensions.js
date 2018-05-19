// const browserActions = require('./extensions/browserActions')
// const contextMenus = require('./extensions/contextMenus')
const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const chromeExtensionPath = require('../../lib/extension/chromeExtensionPath')
const chromeManifestModify = require('../../lib/chromeManifestModify')
const {BrowserWindow,componentUpdater,app} = require('electron')
const extInfos = require('../../lib/extensionInfos')
const mainState = require('../../lib/mainState')
const PubSub = require('../../lib/render/pubsub')
const hjson = require('hjson');
// Takes Content Security Policy flags, for example { 'default-src': '*' }
// Returns a CSP string, for example 'default-src: *;'
let concatCSP = (cspDirectives) => {
  let csp = ''
  for (let directive in cspDirectives) {
    csp += directive + ' ' + cspDirectives[directive] + '; '
  }
  return csp.trim()
}

function removeBom(x){
  return x.charCodeAt(0) === 0xFEFF ? x.slice(1) : x
}


module.exports.init = (verChange) => {
//   browserActions.init()
//   contextMenus.init()

  const {componentUpdater, session} = require('electron')
  componentUpdater.on('component-checking-for-updates', () => {
    // console.log('checking for update')
  })
  componentUpdater.on('component-update-found', () => {
    // console.log('update-found')
  })
  componentUpdater.on('component-update-ready', () => {
    // console.log('update-ready')
  })
  componentUpdater.on('component-update-updated', (e, extensionId, version) => {
    // console.log('update-updated', extensionId, version)
  })
  componentUpdater.on('component-ready', (e, componentId, extensionPath) => {
    console.log('component-ready', componentId, extensionPath)
    // Re-setup the loadedExtensions info if it exists
    // loadExtension(componentId, extensionPath)
  })
  componentUpdater.on('component-not-updated', () => {
    // console.log('update-not-updated')
  })
  componentUpdater.on('component-registered', (e, extensionId) => {
    // const extensionPath = extensions.getIn([extensionId, 'filePath'])
    // // If we don't have info on the extension yet, check for an update / install
    // if (!extensionPath) {
    //   componentUpdater.checkNow(extensionId)
    // } else {
    //   loadExtension(extensionId, extensionPath)
    // }
  })

  process.on('reload-sync-extension', () => {
    console.log('reloading sync')
    // disableExtension(config.syncExtensionId)
  })

  process.on('extension-load-error', (error) => {
    console.error(error)
  })

  process.on('extension-unloaded', (extensionId) => {
    // if (extensionId === config.syncExtensionId) {
    //   // Reload sync extension to restart the background script
    //   setImmediate(() => {
    //     enableExtension(config.syncExtensionId)
    //   })
    // }
  })

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
    if (!fs.existsSync(localePath)) {
      localePath = path.join(basePath, `_locales/${locale}/messages.json`)
      if (!fs.existsSync(localePath)) {
        localePath = path.join(basePath, `_locales/${installInfo.manifest.default_locale}/messages.json`)
        if (!installInfo.manifest.default_locale || !fs.existsSync(localePath)) {
          return
        }
      }
    }
    console.log(localePath)
    const messages = hjson.parse(removeBom(fs.readFileSync(localePath).toString()))
    search(installInfo,messages)
  }

  process.on('extension-ready', (installInfo) => {
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
  })

  const loadExtension = (ses,extensionId, extensionPath, manifest = {}, manifestLocation = 'unpacked') => {
    if(!extensionPath) return
    extensionPath = extensionPath.replace(/app.asar([\/\\])/,'app.asar.unpacked$1')
    const manifestPath = path.join(extensionPath, 'manifest.json')
    console.log(manifestPath)
    fs.exists(manifestPath, (exists) => {
      if (exists) {
        // if(extInfos[extensionId]) return
        // try{
        //   const mani = JSON.parse(fs.readFileSync(manifestPath).toString())
        //   console.log(mani)
        //   mani.id = extensionId
        //   transInfos(mani)
        //   extInfos.setInfo(mani)
        //   console.log(mani)
        // }catch(e){
        //   console.log(e)
        // }
        console.log('load',extensionPath)
        ses.extensions.load(extensionPath, manifest, manifestLocation)
      } else {
        // This is an error condition, but we can recover.
        // extensionInfo.setState(extensionId, undefined)
        componentUpdater.checkNow(extensionId)
      }
    })
  }
  module.exports.loadExtension = loadExtension

  const enableExtension = (extensionId) => {
    session.defaultSession.extensions.enable(extensionId)

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

  const disableExtension = (extensionId) => {
    session.defaultSession.extensions.disable(extensionId)

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
  module.exports.loadAll = function(ses){
    loadExtension(ses,'dckpbojndfoinamcdamhkjhnjnmjkfjd',getPath1('default'),(void 0),'component')
    componentUpdater.registerComponent('oimompecagnajdejgnnjijobebaeigek', 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCmhe+02cLPPAViaevk/fzODKUnb/ysaAeD8lpE9pwirV6GYOm+naTo7xPOCh8ujcR6Ryi1nPTq2GTG0CyqdDyOsZ1aRLuMZ5QqX3dJ9jXklS0LqGfosoIpGexfwggbiLvQOo9Q+IWTrAO620KAzYU0U6MV272TJLSmZPUEFY6IGQIDAQAB')

    loadExtension(ses,'jdbefljfgobbmcidnmpjamcbhnbphjnb',getPath1('jdbefljfgobbmcidnmpjamcbhnbphjnb'),(void 0),'component')
    componentUpdater.registerComponent('jdbefljfgobbmcidnmpjamcbhnbphjnb', 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqmqh6Kxmj00IjKvjPsCtw6g2BHvKipjS3fBD0IInXZZ57u5oZfw6q42L7tgWDLrNDPvu3XDH0vpECr+IcgBjkM+w6+2VdTyPj5ubngTwvBqCIPItetpsZNJOJfrFw0OIgmyekZYsI+BsK7wiMtHczwfKSTi0JKgrwIRhHbEhpUnCxFhi+zI61p9jwMb2EBFwxru7MtpP21jG7pVznFeLV9W9BkNL1Th9QBvVs7GvZwtIIIniQkKtqT1wp4IY9/mDeM5SgggKakumCnT9D37ZxDnM2K13BKAXOkeH6JLGrZCl3aXmqDO9OhLwoch+LGb5IaXwOZyGnhdhm9MNA3hgEwIDAQAB')

    if(mainState.enableMouseGesture){
      let ext = ['jpkfjicglakibpenojifdiepckckakgk',getPath1('jpkfjicglakibpenojifdiepckckakgk')]
      if(verChange) chromeManifestModify(...ext)
      loadExtension(ses,...ext,(void 0),'component')
    }

    if(process.platform != 'win32'){
      let ext = ['occjjkgifpmdgodlplnacmkejpdionan',getPath1('occjjkgifpmdgodlplnacmkejpdionan')]
      if(verChange) chromeManifestModify(...ext)
      loadExtension(ses,...ext,(void 0),'component')
    }
    for(let e of ['igiofjhpmpihnifddepnpngfjhkfenbp']){
      ext = [e, getPath1(e)]
      if(verChange) chromeManifestModify(...ext)
      loadExtension(ses,...ext)
    }

    //for(let fullPath of require("glob").sync(path.join(__dirname,'../../resource/extension/*').replace(/app.asar([\/\\])/,'app.asar.unpacked$1'))) {
    for(let fullPath of require("glob").sync(path.join(extensionPath,'*'))) {
      const appId = fullPath.split(/[\/]/).slice(-1)[0]
      console.log(555,appId,mainState.disableExtensions)
      if(!appId.match(/crx$/) && !rejectExtensions.includes(appId)){
        // if(!first && appId == 'niloccemoadcdkdjlinkgdfekeahmflj') continue
        let ext = [appId,getPath2(appId)]
        if(verChange) chromeManifestModify(...ext)
        console.log('modi',appId)
        loadExtension(ses,...ext)
      }
    }
    first = false
  }
  module.exports.loadAll(session.defaultSession)
}
