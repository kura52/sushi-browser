// const browserActions = require('./extensions/browserActions')
// const contextMenus = require('./extensions/contextMenus')
const fs = require('fs-extra')
const path = require('path')
const chromeExtensionPath = require('../../lib/extension/chromeExtensionPath')
const {BrowserWindow,componentUpdater,app} = require('electron')
const extInfos = require('../../lib/extensionInfos')
// Takes Content Security Policy flags, for example { 'default-src': '*' }
// Returns a CSP string, for example 'default-src: *;'
let concatCSP = (cspDirectives) => {
  let csp = ''
  for (let directive in cspDirectives) {
    csp += directive + ' ' + cspDirectives[directive] + '; '
  }
  return csp.trim()
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
    // console.log('component-ready', componentId, extensionPath)
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
    const extensionId = installInfo.id == "knpaeefkaliajllakodljclcnbeplbke" ? 'aapbdbdomjkkjkaonfhkkikfgjllcleb' : installInfo.id
    const locale = app.getLocale().replace('-', "_")
    console.log(extensionId)
    const [appId, basePath] = getPath(extensionId)

    console.log(appId,basePath)
    if(!basePath) return
    let localePath = path.join(basePath, `_locales/${locale}/messages.json`)
    if (!fs.existsSync(localePath)) {
      localePath = path.join(basePath, `_locales/${locale.split("_")[0]}/messages.json`)
      if (!fs.existsSync(localePath)) {
        localePath = path.join(basePath, `_locales/${installInfo.default_locale}/messages.json`)
        if (!installInfo.default_locale || !fs.existsSync(localePath)) {
          return
        }
      }
    }
    const messages = JSON.parse(fs.readFileSync(localePath))
    search(installInfo,messages)
  }

  process.on('extension-ready', (installInfo) => {
    extInfos.setInfo(installInfo)
    transInfos(installInfo)
    // extensionInfo.setState(installInfo.id, extensionStates.ENABLED)
    // extensionInfo.setInstallInfo(installInfo.id, installInfo)
    // installInfo.filePath = installInfo.base_path
    // installInfo.base_path = fileUrl(installInfo.base_path)
    // extensionActions.extensionInstalled(installInfo.id, installInfo)
    // extensionActions.extensionEnabled(installInfo.id)
  })

  let loadExtension = (ses,extensionId, extensionPath, manifest = {}, manifestLocation = 'unpacked') => {
    if(!extensionPath) return
    extensionPath = extensionPath.replace(/app.asar([\/\\])/,'app.asar.unpacked$1')
    const manifestPath = path.join(extensionPath, 'manifest.json')
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
        ses.extensions.load(extensionPath, manifest, manifestLocation)
      } else {
        // This is an error condition, but we can recover.
        // extensionInfo.setState(extensionId, undefined)
        componentUpdater.checkNow(extensionId)
      }
    })
  }

  let enableExtension = (extensionId) => {
    session.defaultSession.extensions.enable(extensionId)
  }

  let disableExtension = (extensionId) => {
    session.defaultSession.extensions.disable(extensionId)
  }

  let getPath = (appId) => {
    const extRootPath = path.join(__dirname,'../../resource/extension').replace(/app.asar([\/\\])/,'app.asar.unpacked$1')
    // if(!fs.existsSync(extRootPath)) {
    //   fs.mkdirSync(extRootPath)
    // }
    let appPath = path.join(extRootPath,appId)
    if(!fs.existsSync(appPath)){
      let chromePath = chromeExtensionPath(appId)
      if(fs.existsSync(chromePath)){
        appPath = chromePath
      }
      else{
        return [appId,null]
      }
    }
    const version = fs.readdirSync(appPath).sort().pop()
    const basePath = path.join(appPath,version)
    return [appId,basePath]
  }

  // let getPath = (appId) => {
  //   const extRootPath = path.join(app.getPath('userData'),'resource/extension')
  //   if(!fs.existsSync(extRootPath)) {
  //     fs.mkdirSync(extRootPath)
  //   }
  //   const appPath = path.join(extRootPath,appId)
  //   const orgPath = path.join(__dirname,'../../resource/extension',appId).replace(/app.asar([\/\\])/,'app.asar.unpacked$1')
  //   if(verChange || true || !fs.existsSync(appPath)){
  //     if(fs.existsSync(orgPath)){
  //       fs.copySync(orgPath, appPath)
  //     }
  //     else{
  //       const dirPath = chromeExtensionPath(appId)
  //       fs.copySync(dirPath, appPath)
  //     }
  //   }
  //   const version = fs.readdirSync(appPath).sort().pop()
  //   const basePath = path.join(appPath,version)
  //   return [appId,basePath]
  // }

  let registerComponent = (extensionId) => {
    // if (!extensionInfo.isRegistered(extensionId) && !extensionInfo.isRegistering(extensionId)) {
    //   extensionInfo.setState(extensionId, extensionStates.REGISTERING)
    //   componentUpdater.registerComponent(extensionId)
    // } else {
    //   const extensions = extensionState.getExxttensions(appStore.getState())
    //   const extensionPath = extensions.getIn([extensionId, 'filePath'])
    //   if (extensionPath) {
    //     // Otheriwse just install it
    //     loadExtension(extensionId, extensionPath)
    //   }
    // }
  }

  require('./browserAction')

  let first = true
  const rejectExtensions = ['jpkfjicglakibpenojifdiepckckakgk','default','jdbefljfgobbmcidnmpjamcbhnbphjnb','occjjkgifpmdgodlplnacmkejpdionan']
  module.exports.loadAll = function(ses){
    loadExtension(ses,...getPath('jpkfjicglakibpenojifdiepckckakgk'),(void 0),'component')
    loadExtension(ses,'dckpbojndfoinamcdamhkjhnjnmjkfjd',getPath('default')[1],(void 0),'component')
    loadExtension(ses,...getPath('jdbefljfgobbmcidnmpjamcbhnbphjnb'),(void 0),'component')
    componentUpdater.registerComponent('jdbefljfgobbmcidnmpjamcbhnbphjnb', 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqmqh6Kxmj00IjKvjPsCtw6g2BHvKipjS3fBD0IInXZZ57u5oZfw6q42L7tgWDLrNDPvu3XDH0vpECr+IcgBjkM+w6+2VdTyPj5ubngTwvBqCIPItetpsZNJOJfrFw0OIgmyekZYsI+BsK7wiMtHczwfKSTi0JKgrwIRhHbEhpUnCxFhi+zI61p9jwMb2EBFwxru7MtpP21jG7pVznFeLV9W9BkNL1Th9QBvVs7GvZwtIIIniQkKtqT1wp4IY9/mDeM5SgggKakumCnT9D37ZxDnM2K13BKAXOkeH6JLGrZCl3aXmqDO9OhLwoch+LGb5IaXwOZyGnhdhm9MNA3hgEwIDAQAB')
    if(process.platform != 'win32'){
      loadExtension(ses,...getPath('occjjkgifpmdgodlplnacmkejpdionan'),(void 0),'component')
    }


    for(let fullPath of require("glob").sync(path.join(__dirname,'../../resource/extension/*').replace(/app.asar([\/\\])/,'app.asar.unpacked$1'))) {
      const appId = fullPath.split(/[\/]/).slice(-1)[0]
      console.log(appId)
      if(appId.match(/^[a-z]+$/) && !rejectExtensions.includes(appId)){
        if(!first && appId == 'niloccemoadcdkdjlinkgdfekeahmflj') continue
        loadExtension(ses,...getPath(appId))
      }
    }
    first = false
  }
  module.exports.loadAll(session.defaultSession)
}
