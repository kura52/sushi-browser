/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
const electron = require('electron')
const {app,BrowserWindow} = electron
const urlParse = require('url').parse
const isDarwin = process.platform === 'darwin'
const fs = require('fs')
const path = require('path')
const BrowserWindowPlus = require('./BrowserWindowPlus')
const {getFocusedWebContents,getCurrentWindow} = require('./util')
let appInitialized = false
let newWindowURL

const navigatableTypes = ['http:', 'https:', 'about:', 'chrome:', 'chrome-extension:', 'chrome-devtools:', 'file:', 'view-source:', 'ftp:', 'magnet:']

function fileUrl(filePath){
  // It's preferrable to call path.resolve but it's not available
  // because process.cwd doesn't exist in renderers like in file URL
  // drops in the URL bar.
  if (!path.isAbsolute(filePath) && process.cwd) {
    filePath = path.resolve(filePath)
  }
  let fileUrlPath = filePath.replace(/\\/g, '/')

  // Windows drive letter must be prefixed with a slash
  if (fileUrlPath[0] !== '/') {
    fileUrlPath = '/' + fileUrlPath
  }

  return encodeURI('file://' + fileUrlPath)
}

function isProtocolHandled(protocol){
  return true //@TODO ELECTRON
  // protocol = (protocol || '').split(':')[0]
  // return navigatableTypes.includes(`${protocol}:`) ||
  //   electron.session.defaultSession.protocol.isNavigatorProtocolHandled(protocol)
}


const focusOrOpenWindow = function (url) {
  getFocusedWebContents().then(cont=>{
    if(cont){
      if(url){
        cont.hostWebContents2.send('new-tab', cont.id, url)
      }
      else{
        BrowserWindow.fromWebContents(cont.hostWebContents2).focus()
      }
    }
    else{
      if(appInitialized){
        BrowserWindowPlus.load((void 0),(void 0),url)
      }
      else{
        newWindowURL = url
      }
    }
  })

  return true
}

// Checks an array of arguments if it can find a url
const getUrlFromCommandLine = (argv) => {
  if (argv) {
    console.log(552,argv)
    if (argv.length === 2 && !argv[1].startsWith('-')) {
      const parsedUrl = urlParse(argv[1])
      if (isProtocolHandled(parsedUrl.protocol)) {
        return argv[1]
      }
      const filePath = path.resolve(argv[1])
      if (fs.existsSync(filePath)) {
        return fileUrl(filePath)
      }
    }
    let index = argv.indexOf('--')
    if(index === -1) index = argv.length - 2
    if (index !== -1 && index + 1 < argv.length && !argv[index + 1].startsWith('-')) {
      const parsedUrl = urlParse(argv[index + 1])
      if (isProtocolHandled(parsedUrl.protocol)) {
        return argv[index + 1]
      }
      const filePath = path.resolve(argv[index + 1])
      console.log(filePath)
      if (fs.existsSync(filePath)) {
        console.log(filePath)
        return fileUrl(filePath)
      }
    }
  }
  return undefined
}

app.on('will-finish-launching', () => {
  // app.on('activate', () => {
  //   // (macOS) open a new window when the user clicks on the app icon if there aren't any open
  //   focusOrOpenWindow()
  // })

  // User clicked a link when w were the default or via command line like:
  // open -a Brave http://www.brave.com
  app.on('open-url', (event, path) => {
    event.preventDefault()

    const parsedUrl = urlParse(path)
    if (isProtocolHandled(parsedUrl.protocol)) {
      focusOrOpenWindow(path)
      newWindowURL = path
    }

  })

  // User clicked on a file or dragged a file to the dock on macOS
  app.on('open-file', (event, path) => {
    event.preventDefault()
    path = fileUrl(path)
    focusOrOpenWindow(path)
  })
})

// const isSecondInstance = app.makeSingleInstance((argv, workingDirectory) => { // @TODO ELECTRON
//   // Someone tried to run a second instance, we should focus our window.
//   if (isDarwin) {
//     focusOrOpenWindow()
//   } else {
//     console.log(33334,argv,getUrlFromCommandLine(argv))
//     focusOrOpenWindow(getUrlFromCommandLine(argv))
//   }
// })
//
// if (isSecondInstance) {
//   console.log(67686785)
//   if(global.__CHILD__) global.__CHILD__.kill()
//   app.exit(0)
//
// }

function getNewWindowURL(){
  return newWindowURL
}

process.on('app-initialized', () => { appInitialized = true })

export default {
  getUrlFromCommandLine,
  getNewWindowURL,
  focusOrOpenWindow
}

// module.exports.newWindowURL = () => {
//   const openUrl = newWindowURL || getUrlFromCommandLine(process.argv)
//   if (openUrl) {
//     const parsedUrl = urlParse(openUrl)
//     if (isProtocolHandled(parsedUrl.protocol)) {
//       newWindowURL = openUrl
//     }
//   }
//   return newWindowURL
// }
