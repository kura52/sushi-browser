'use strict'

const { ipcMain, app, webContents, BrowserWindow, session } = require('electron')
const { getAllWebContents } = process.atomBinding('web_contents')
const renderProcessPreferences = process.atomBinding('render_process_preferences').forAllWebContents()
const mime = require('./extensions/mime')

const { Buffer } = require('buffer')
const fs = require('fs')
const path = require('path')
const url = require('url')

const hjson = require('@electron/internal/browser/extensions/hjson')

// Mapping between extensionId(hostname) and manifest.
const manifestMap = {}  // extensionId => manifest
const devToolsExtensionIds = new Set()

const generateExtensionIdFromName = function (name) {
  return name.replace(/[\W_]+/g, '-').toLowerCase()
}

const isWindowOrWebView = function (webContents) {
  const type = webContents.getType()
  return type === 'window' || type === 'webview' || type === 'browserView'
}

const isWebView = function (webContents) {
  const type = webContents.getType()
  return type === 'webview' || type === 'browserView'
}

const removeBom = function(x){
  return x.charCodeAt(0) === 0xFEFF ? x.slice(1) : x
}

// Create or get manifest object from |srcDirectory|.
const getManifestFromPath = function (srcDirectory, admin) {
  let manifest
  let manifestContent

  try {
    manifestContent = fs.readFileSync(path.join(srcDirectory, 'manifest.json'))
  } catch (readError) {
    console.warn(`Reading ${path.join(srcDirectory, 'manifest.json')} failed.`)
    console.warn(readError.stack || readError)
    throw readError
  }

  try {
    manifest = hjson.parse(removeBom(manifestContent.toString()).replace('\\u003Call_urls>','<all_urls>'))
    manifest.base_path = srcDirectory
    manifest.current_locale = app.getLocale()
    manifest.admin = admin

    manifest.id = path.basename(path.parse(srcDirectory).dir)
    if(manifest.id == 'default') manifest.id = 'dckpbojndfoinamcdamhkjhnjnmjkfjd'
    manifest.url = `https://chrome.google.com/webstore/detail/${manifest.id}`
  } catch (parseError) {
    console.warn(`Parsing ${path.join(srcDirectory, 'manifest.json')} failed.`)
    console.warn(parseError.stack || parseError)
    throw parseError
  }

  if (!manifestMap[manifest.id]) {
    const extensionId = manifest.id
    manifestMap[extensionId] = manifest
    Object.assign(manifest, {
      srcDirectory: srcDirectory,
      extensionId: extensionId,
      // We can not use 'file://' directly because all resources in the extension
      // will be treated as relative to the root in Chrome.
      startPage: url.format({
        protocol: 'chrome-extension',
        slashes: true,
        hostname: extensionId,
        pathname: manifest.devtools_page
      })
    })
    return manifest
  } else if (manifest && manifest.id) {
    console.warn(`Attempted to load extension "${manifest.id}" that has already been loaded.`)
    return manifest
  }
}

// Manage the background pages.
const backgroundPages = {}

const startBackgroundPages = function (manifest) {
  if (backgroundPages[manifest.extensionId] || !manifest.background) return

  let html
  let name
  if (manifest.background.page) {
    name = manifest.background.page
    html = fs.readFileSync(path.join(manifest.srcDirectory, manifest.background.page))
  } else {
    name = '_generated_background_page.html'
    const scripts = manifest.background.scripts.map((name) => {
      return `<script src="${name}"></script>`
    }).join('')
    html = Buffer.from(`<html><body>${scripts}</body></html>`)
  }

  const contents = webContents.create({
    partition: 'persist:__chrome_extension',
    isBackgroundPage: true,
    commandLineSwitches: ['--background-page']
  })
  backgroundPages[manifest.extensionId] = { html: html, webContents: contents, name: name }
  contents.loadURL(url.format({
    protocol: 'chrome-extension',
    slashes: true,
    hostname: manifest.extensionId,
    pathname: name
  }))
}

const removeBackgroundPages = function (manifest) {
  if (!backgroundPages[manifest.extensionId]) return

  backgroundPages[manifest.extensionId].webContents.destroy()
  delete backgroundPages[manifest.extensionId]
}

const sendToBackgroundPages = function (...args) {
  for (const page of Object.values(backgroundPages)) {
    page.webContents._sendInternalToAll(...args)
  }
}

const sendToBackgroundPage = function (extensionId, ...args) {
  // console.log('sendToBackgroundPage',backgroundPages[extensionId].webContents.getURL(),...args)
   backgroundPages[extensionId].webContents.send(...args)
}

const chromeExtensionApi = require('./chrome-extension-api')
const hookWebContentsEvents = chromeExtensionApi(manifestMap, backgroundPages, sendToBackgroundPage, sendToBackgroundPages)

// Transfer the content scripts to renderer.
const contentScripts = {}
const contentScriptsEntry = {}

ipcMain.on('get-render-process-preferences', e =>{
  e.returnValue = [...Object.values(contentScriptsEntry)]
})

const injectContentScripts = function (manifest) {
  if (contentScripts[manifest.id] || !manifest.content_scripts) return

  const readArrayOfFiles = function (relativePath) {
    return {
      url: `chrome-extension://${manifest.extensionId}/${relativePath}`,
      code: String(fs.readFileSync(path.join(manifest.srcDirectory, relativePath)))
    }
  }

  const contentScriptToEntry = function (script) {
    return {
      matches: script.matches,
      exclude_matches: script.exclude_matches,
      include_globs: script.include_globs,
      exclude_globs: script.exclude_globs,
      js: script.js ? script.js.map(readArrayOfFiles) : [],
      css: script.css ? script.css.map(readArrayOfFiles) : [],
      runAt: script.run_at || 'document_idle'
    }
  }

  try {
    const entry = {
      extensionId: manifest.extensionId,
      admin: manifest.admin,
      name: manifest.name,
      contentScripts: manifest.content_scripts.map(contentScriptToEntry)
    }
    contentScripts[manifest.id] = renderProcessPreferences.addEntry(entry)
    contentScriptsEntry[manifest.id] = entry
  } catch (e) {
    console.error('Failed to read content scripts', e)
  }
}

const removeContentScripts = function (manifest) {
  if (!contentScripts[manifest.id]) return

  renderProcessPreferences.removeEntry(contentScripts[manifest.id])
  delete contentScripts[manifest.id]
  delete contentScriptsEntry[manifest.id]
}

// Transfer the |manifest| to a format that can be recognized by the
// |DevToolsAPI.addExtensions|.
const manifestToExtensionInfo = function (manifest) {
  return {
    startPage: manifest.startPage,
    srcDirectory: manifest.srcDirectory,
    name: manifest.id,
    // name: manifest.name, //@TODO CHECK
    exposeExperimentalAPIs: true
  }
}

// Load the extensions for the window.
const loadExtension = function (manifest) {
  startBackgroundPages(manifest)
  injectContentScripts(manifest)
}

const loadDevToolsExtensions = function (win, manifests) {
  if (!win.devToolsWebContents) return
  if(manifests.every(manifest => !manifest.devtools_page)) return

  manifests.forEach(loadExtension)

  const extensionInfoArray = manifests.map(manifestToExtensionInfo)
  extensionInfoArray.forEach((extension) => {
    win.devToolsWebContents._grantOriginAccess(extension.startPage)
  })
  win.devToolsWebContents.executeJavaScript(`DevToolsAPI.addExtensions(${JSON.stringify(extensionInfoArray)})`)
}

ipcMain.on('web-contents-created', function (event, webContents) {
  if (!isWindowOrWebView(webContents)) return

  console.log('web-contents-created',45454)
  hookWebContentsEvents(webContents)
  webContents.on('devtools-opened', function () {
    loadDevToolsExtensions(webContents, Object.values(manifestMap))
  })
})

const accessKey = `${process.hrtime()}_${Math.random().toString()}`
ipcMain.on('get-access-key', e => {
  e.returnValue = accessKey
})

const cache = {}
// The chrome-extension: can map a extension URL request to real file path.
const chromeExtensionHandler = function (request, callback) {
  if(cache[request.url] && !request.headers.Range){
    return callback({...cache[request.url][0], data: cache[request.url][1]()})
  }

  const parsed = new URL(request.url)
  if (!parsed.hostname || !parsed.pathname) return callback()

  const manifest = manifestMap[parsed.hostname]
  if (!manifest) return callback({statusCode: 404})

  // const page = backgroundPages[parsed.hostname]
  // if (page && parsed.path === `/${page.name}`) {
  //   // Disabled due to false positive in StandardJS
  //   // eslint-disable-next-line standard/no-callback-literal
  //   return callback({
  //     mimeType: 'text/html',
  //     data: page.html
  //   })

  const isGetFile = parsed.hostname == 'dckpbojndfoinamcdamhkjhnjnmjkfjd' && parsed.searchParams.get('file')
  if(isGetFile && parsed.searchParams.get('key') != accessKey) return callback({statusCode: 500})
  const filePath = path.join(manifest.base_path,parsed.pathname)
  const isValidPath = filePath.startsWith(path.join(manifest.base_path))
  if(!isValidPath) return callback({statusCode: 500})

  const validFilePath = isGetFile ? parsed.searchParams.get('file').replace(/^file:\/\//,"") : isValidPath ? filePath : ''
  // console.log(validFilePath)

  fs.stat(validFilePath, (err, stats) => {
    if(err) return callback({statusCode: 404})

    let type = mime.getType(validFilePath)
    const range = request.headers.Range
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const fileSize = stats.size
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
      cache[request.url] = [{
        statusCode: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': end - start + 1,
          'Content-Type': type,
        }
      },()=>fs.createReadStream(validFilePath, {start, end, highWaterMark: 1024 * 1024})]
      callback({...cache[request.url][0], data: cache[request.url][1]()})
    }
    else {
      cache[request.url] = [{
        statusCode: 200,
        headers: {
          'Cache-Control': 'public',
          'Content-Length': stats.size,
          'Content-Type': type && `${type}${type.startsWith('text') ? '; charset=UTF-8' : ''}`
        }
      },()=>fs.createReadStream(validFilePath, {highWaterMark: 1024 * 1024})]
      callback({...cache[request.url][0], data: cache[request.url][1]()})
    }
  })

}

app.on('session-created', function (ses) {
  ses.protocol.registerStreamProtocol('chrome-extension', chromeExtensionHandler, function (error) {
    if (error) {
      console.error(`Unable to register chrome-extension protocol: ${error}`)
    }
  })
})

// The persistent path of "DevTools Extensions" preference file.
let loadedDevToolsExtensionsPath = null

app.on('will-quit', function () {
  try {
    const loadedDevToolsExtensions = Array.from(devToolsExtensionIds)
      .map(id => manifestMap[id].srcDirectory)
    if (loadedDevToolsExtensions.length > 0) {
      try {
        fs.mkdirSync(path.dirname(loadedDevToolsExtensionsPath))
      } catch (error) {
        // Ignore error
      }
      fs.writeFileSync(loadedDevToolsExtensionsPath, JSON.stringify(loadedDevToolsExtensions))
    } else {
      fs.unlinkSync(loadedDevToolsExtensionsPath)
    }
  } catch (error) {
    // Ignore error
  }
})

// We can not use protocol or BrowserWindow until app is ready.
app.once('ready', function () {

  session.fromPartition('persist:__chrome_extension').webRequest.onHeadersReceived((details, callback) => {
    callback({
      cancel: false,
      responseHeaders: {
        ...details.responseHeaders,
        "Access-Control-Allow-Origin": ["*"]
      }
    })
  })

  // Load persisted extensions.
  loadedDevToolsExtensionsPath = path.join(app.getPath('userData'), 'DevTools Extensions')
  try {
    const loadedDevToolsExtensions = JSON.parse(fs.readFileSync(loadedDevToolsExtensionsPath))
    if (Array.isArray(loadedDevToolsExtensions)) {
      for (const srcDirectory of loadedDevToolsExtensions) {
        // Start background pages and set content scripts.
        BrowserWindow.addDevToolsExtension(srcDirectory)
      }
    }
  } catch (error) {
    // Ignore error
  }

  // The public API to add/remove extensions.
  BrowserWindow.addExtension = function (srcDirectory) {
    const manifest = getManifestFromPath(srcDirectory)
    if (manifest) {
      loadExtension(manifest)
      for (const webContents of getAllWebContents()) {
        if (isWindowOrWebView(webContents)) {
          loadDevToolsExtensions(webContents, [manifest])
        }
      }
      return manifest.id
    }
  }

  BrowserWindow.addExtensionWebview = function (srcDirectory, admin) {
    const manifest = getManifestFromPath(srcDirectory, admin)
    if (manifest) {
      loadExtension(manifest)
      for (const webContents of getAllWebContents()) {
        if (isWebView(webContents)) {
          loadDevToolsExtensions(webContents, [manifest])
        }
      }
      return manifest
    }
  }


  BrowserWindow.removeExtension = function (id) {
    const manifest = manifestMap[id]
    if (!manifest) return

    removeBackgroundPages(manifest)
    removeContentScripts(manifest)
    delete manifestMap[id]
  }

  BrowserWindow.getExtensions = function () {
    const extensions = {}
    Object.keys(manifestMap).forEach(function (id) {
      const manifest = manifestMap[id]
      extensions[id] = {id, name: manifest.name, version: manifest.version}
    })
    return extensions
  }

  BrowserWindow.addDevToolsExtension = function (srcDirectory) {
    const extensionId = BrowserWindow.addExtension(srcDirectory)
    if (extensionId) {
      devToolsExtensionIds.add(extensionId)
    }
    return extensionId
  }

  BrowserWindow.removeDevToolsExtension = function (id) {
    BrowserWindow.removeExtension(id)
    devToolsExtensionIds.delete(id)
  }

  BrowserWindow.getDevToolsExtensions = function () {
    const extensions = BrowserWindow.getExtensions()
    const devExtensions = {}
    Array.from(devToolsExtensionIds).forEach(function (id) {
      if (!extensions[id]) return
      devExtensions[id] = extensions[id]
    })
    return devExtensions
  }
})
