'use strict'

const { Buffer } = require('buffer')
const fs = require('fs')
const path = require('path')
const util = require('util')
const Module = require('module')
const v8 = require('v8')

// We modified the original process.argv to let node.js load the init.js,
// we need to restore it here.
process.argv.splice(1, 1)

// Clear search paths.
require('../common/reset-search-paths')

// Import common settings.
require('@electron/internal/common/init')

const globalPaths = Module.globalPaths

// Expose public APIs.
globalPaths.push(path.join(__dirname, 'api', 'exports'))

if (process.platform === 'win32') {
  // Redirect node's console to use our own implementations, since node can not
  // handle console output when running as GUI program.
  const consoleLog = function (...args) {
    return process.log(util.format(...args) + '\n')
  }
  const streamWrite = function (chunk, encoding, callback) {
    if (Buffer.isBuffer(chunk)) {
      chunk = chunk.toString(encoding)
    }
    process.log(chunk)
    if (callback) {
      callback()
    }
    return true
  }
  console.log = console.error = console.warn = consoleLog
  process.stdout.write = process.stderr.write = streamWrite
}

// Don't quit on fatal error.
process.on('uncaughtException', function (error) {
  // Do nothing if the user has a custom uncaught exception handler.
  if (process.listeners('uncaughtException').length > 1) {
    return
  }

  // Show error in GUI.
  const dialog = require('electron').dialog
  const stack = error.stack ? error.stack : `${error.name}: ${error.message}`
  const message = 'Uncaught Exception:\n' + stack
  dialog.showErrorBox('A JavaScript error occurred in the main process', message)
})

// Emit 'exit' event on quit.
const { app } = require('electron')

app.on('quit', function (event, exitCode) {
  process.emit('exit', exitCode)
})

if (process.platform === 'win32') {
  // If we are a Squirrel.Windows-installed app, set app user model ID
  // so that users don't have to do this.
  //
  // Squirrel packages are always of the form:
  //
  // PACKAGE-NAME
  // - Update.exe
  // - app-VERSION
  //   - OUREXE.exe
  //
  // Squirrel itself will always set the shortcut's App User Model ID to the
  // form `com.squirrel.PACKAGE-NAME.OUREXE`. We need to call
  // app.setAppUserModelId with a matching identifier so that renderer processes
  // will inherit this value.
  const updateDotExe = path.join(path.dirname(process.execPath), '..', 'update.exe')

  if (fs.existsSync(updateDotExe)) {
    const packageDir = path.dirname(path.resolve(updateDotExe))
    const packageName = path.basename(packageDir).replace(/\s/g, '')
    const exeName = path.basename(process.execPath).replace(/\.exe$/i, '').replace(/\s/g, '')

    app.setAppUserModelId(`com.squirrel.${packageName}.${exeName}`)
  }
}

// Map process.exit to app.exit, which quits gracefully.
process.exit = app.exit

// Load the RPC server.
require('@electron/internal/browser/rpc-server')

// Load the guest view manager.
require('@electron/internal/browser/guest-view-manager')
require('@electron/internal/browser/guest-window-manager')

// Now we try to load app's package.json.
let packagePath = null
let packageJson = null
const searchPaths = ['app', 'app.asar', 'default_app.asar']
for (packagePath of searchPaths) {
  try {
    packagePath = path.join(process.resourcesPath, packagePath)
    packageJson = require(path.join(packagePath, 'package.json'))
    break
  } catch (error) {
    continue
  }
}

if (packageJson == null) {
  process.nextTick(function () {
    return process.exit(1)
  })
  throw new Error('Unable to find a valid app')
}

// Set application's version.
if (packageJson.version != null) {
  app.setVersion(packageJson.version)
}

// Set application's name.
if (packageJson.productName != null) {
  app.setName(packageJson.productName)
} else if (packageJson.name != null) {
  app.setName(packageJson.name)
}

// Set application's desktop name.
if (packageJson.desktopName != null) {
  app.setDesktopName(packageJson.desktopName)
} else {
  app.setDesktopName((app.getName()) + '.desktop')
}

// Set v8 flags
if (packageJson.v8Flags != null) {
  v8.setFlagsFromString(packageJson.v8Flags)
}

// Set the user path according to application's name.
app.setPath('userData', path.join(app.getPath('appData'), app.getName()))
app.setPath('userCache', path.join(app.getPath('cache'), app.getName()))
app.setAppPath(packagePath)

// Load the chrome extension support.
require('@electron/internal/browser/chrome-extension')

const features = process.atomBinding('features')
if (features.isDesktopCapturerEnabled()) {
  // Load internal desktop-capturer module.
  require('@electron/internal/browser/desktop-capturer')
}

// Load protocol module to ensure it is populated on app ready
require('@electron/internal/browser/api/protocol')

// Set main startup script of the app.
const mainStartupScript = packageJson.main || 'index.js'

const KNOWN_XDG_DESKTOP_VALUES = ['Pantheon', 'Unity:Unity7', 'pop:GNOME']

function currentPlatformSupportsAppIndicator () {
  if (process.platform !== 'linux') return false
  const currentDesktop = process.env.XDG_CURRENT_DESKTOP

  if (!currentDesktop) return false
  if (KNOWN_XDG_DESKTOP_VALUES.includes(currentDesktop)) return true
  // ubuntu based or derived session (default ubuntu one, communitheme…) supports
  // indicator too.
  if (/ubuntu/ig.test(currentDesktop)) return true

  return false
}

// Workaround for electron/electron#5050 and electron/electron#9046
if (currentPlatformSupportsAppIndicator()) {
  process.env.XDG_CURRENT_DESKTOP = 'Unity'
}

// Finally load app's main.js and transfer control to C++.
Module._load(path.join(packagePath, mainStartupScript), Module, true)
