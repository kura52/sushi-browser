/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const electron = require('electron')
const electronLocalshortcut = require('electron-localshortcut')
const isDarwin = process.platform === 'darwin'
const {getFocusedWebContents, getCurrentWindow} = require('../../lib/util')
const mainState = require('../../lib/mainState')
const isAccelerator = require("electron-is-accelerator")
const PubSub = require('../../lib/render/pubsub')

module.exports.register = (win) => {
  // Most of these events will simply be listened to by the app store and acted
  // upon.  However sometimes there are no state changes, for example with focusing
  // the URL bar.  In those cases it's acceptable for the individual components to
  // listen to the events.
  const simpleWebContentEvents = [
    [mainState.keyFindOnPage_1, 'findOnPage_1'],
    [mainState.keySelectNextTab_1, 'selectNextTab_1'],
    [mainState.keySelectNextTab_2, 'selectNextTab_2'],
    [mainState.keySelectPreviousTab_1, 'selectPreviousTab_1'],
    [mainState.keySelectPreviousTab_2, 'selectPreviousTab_2'],
    [mainState.keyLastTab, 'lastTab'],
    [mainState.keyFindNext, 'findNext'],
    [mainState.keyFindPrevious, 'findPrevious'],
    [mainState.keyToggleDeveloperTools_1, 'toggleDeveloperTools_1'],
    [mainState.keyZoomIn_1, 'zoomIn_1'],
    [mainState.keyZoomOut_1, 'zoomOut_1'],
    [mainState.keyTab1, 'tab1'],
    [mainState.keyTab2, 'tab2'],
    [mainState.keyTab3, 'tab3'],
    [mainState.keyTab4, 'tab4'],
    [mainState.keyTab5, 'tab5'],
    [mainState.keyTab6, 'tab6'],
    [mainState.keyTab7, 'tab7'],
    [mainState.keyTab8, 'tab8'],
    [mainState.keyViewPageSource, 'viewPageSource']
  ]

  if (!isDarwin) {
    simpleWebContentEvents.push(
      [mainState.keyReloadPage_1, 'reloadPage_1'],
      [mainState.keyCleanReload_1, 'cleanReload_1'],
      [mainState.keyCloseWindow_1, 'closeWindow_1'],
      [mainState.keyOpenLocation_1, 'openLocation_1'],
      [mainState.keyBack_1, 'back_1'],
      [mainState.keyForward_1, 'forward_1']
    )
  }

  simpleWebContentEvents.forEach((shortcutEventName) =>{
    if(!isAccelerator(shortcutEventName[0])) return

    console.log(44,shortcutEventName)
    electronLocalshortcut.register(win, shortcutEventName[0], () => {
      const name = shortcutEventName[1].split('_')[0]
      console.log(44,name,shortcutEventName)
      getFocusedWebContents().then(cont=>{
        if(!cont) return

        if(name == 'toggleDeveloperTools'){
          cont.openDevTools()
        }
        else if(name == 'zoomIn'){
          cont.zoomIn()
        }
        else if(name == 'zoomOut'){
          cont.zoomOut()
        }
        else if(name == 'reloadPage'){
          cont.reload()
        }
        else if(name == 'cleanReload'){
          cont.reloadIgnoringCache()
        }
        else if(name == 'closeWindow'){
          electron.BrowserWindow.fromWebContents(cont.hostWebcontents2).close()
        }
        else if(name == 'openLocation'){
          cont.hostWebcontents2.send('focus-location-bar',cont.getId())
        }
        else if(name == 'back'){
          cont.goBack()
        }
        else if(name == 'forward'){
          cont.goForward()
        }
        else{
          cont.hostWebcontents2.send('menu-or-key-events',name,cont.getId())
        }
      })
    })
})

  electronLocalshortcut.register(win, 'Shift+F8', () => {
    win.toggleDevTools()
    console.log(win)
  })

  PubSub.subscribe('add-shortcut',(msg,{id,key,command}) => {
    console.log(333,key,command)
    electronLocalshortcut.register(win, key.replace('Period','.').replace('Comma',',').replace(',nd','Command').replace(/ /g,""), () => {
      ipcMain.emit('chrome-commands-exec',null,{id,command})
    })
  })

}

module.exports.unregister = (win) => {
  electronLocalshortcut.unregisterAll(win)
}
