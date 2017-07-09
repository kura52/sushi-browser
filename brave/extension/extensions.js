// const browserActions = require('./extensions/browserActions')
// const contextMenus = require('./extensions/contextMenus')
const fs = require('fs-extra')
const path = require('path')
const chromeExtensionPath = require('../../lib/extension/chromeExtensionPath')
const {BrowserWindow,app} = require('electron')
// Takes Content Security Policy flags, for example { 'default-src': '*' }
// Returns a CSP string, for example 'default-src: *;'
let concatCSP = (cspDirectives) => {
  let csp = ''
  for (let directive in cspDirectives) {
    csp += directive + ' ' + cspDirectives[directive] + '; '
  }
  return csp.trim()
}



module.exports.init = () => {
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
    loadExtension(componentId, extensionPath)
  })
  componentUpdater.on('component-not-updated', () => {
    // console.log('update-not-updated')
  })
  componentUpdater.on('component-registered', (e, extensionId) => {
    const extensionPath = extensions.getIn([extensionId, 'filePath'])
    // If we don't have info on the extension yet, check for an update / install
    if (!extensionPath) {
      componentUpdater.checkNow(extensionId)
    } else {
      loadExtension(extensionId, extensionPath)
    }
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

  process.on('extension-ready', (installInfo) => {
    require('../../lib/extensionInfos').setInfo(installInfo)
    // extensionInfo.setState(installInfo.id, extensionStates.ENABLED)
    // extensionInfo.setInstallInfo(installInfo.id, installInfo)
    // installInfo.filePath = installInfo.base_path
    // installInfo.base_path = fileUrl(installInfo.base_path)
    // extensionActions.extensionInstalled(installInfo.id, installInfo)
    // extensionActions.extensionEnabled(installInfo.id)
  })

  let loadExtension = (extensionId, extensionPath, manifest = {}, manifestLocation = 'unpacked') => {
    fs.exists(path.join(extensionPath, 'manifest.json'), (exists) => {
      if (exists) {
        session.defaultSession.extensions.load(extensionPath, manifest, manifestLocation)
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
    const extRootPath = path.join(app.getPath('userData'),'resource/extension')
    if(!fs.existsSync(extRootPath)) {
      fs.mkdirSync(extRootPath)
    }
    const appPath = path.join(extRootPath,appId)
    const orgPath = path.join(__dirname,'../../resource/extension',appId)
    if(true || !fs.existsSync(appPath)){
      if(fs.existsSync(orgPath)){
        fs.copySync(orgPath, appPath)
      }
      else{
        const dirPath = chromeExtensionPath(appId)
        fs.copySync(dirPath, appPath)
      }
    }
    const version = fs.readdirSync(appPath).sort().pop()
    const basePath = path.join(appPath,version)
    return [appId,basePath]
  }

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

  loadExtension('dckpbojndfoinamcdamhkjhnjnmjkfjd',getPath('default')[1],(void 0),'component')
  loadExtension(...getPath('jdbefljfgobbmcidnmpjamcbhnbphjnb'),(void 0),'component')
  if(process.platform != 'win32'){
    loadExtension(...getPath('occjjkgifpmdgodlplnacmkejpdionan'))
  }

  const appIds = fs.readFileSync(path.join(__dirname,'../../resource/extensions.txt')).toString().split(/\r?\n/)
  for(let appId of appIds) {
    if(appId.match(/^[a-z]+$/)){
      loadExtension(...getPath(appId))
    }
  }

  // loadExtension(...getPath('occjjkgifpmdgodlplnacmkejpdionan'))
  // loadExtension(...getPath('aeolcjbaammbkgaiagooljfdepnjmkfd'))
  // loadExtension(...getPath('khpcanbeojalbkpgpmjpdkjnkfcgfkhb'))
  // loadExtension(...getPath('niloccemoadcdkdjlinkgdfekeahmflj'))
  // loadExtension(...getPath('aapbdbdomjkkjkaonfhkkikfgjllcleb'))
}
