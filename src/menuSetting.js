const {app,Menu,shell,ipcMain,BrowserWindow,session,webContents} = require('electron')
const BrowserWindowPlus = require('./BrowserWindowPlus')
const locale = require('../brave/app/locale')
import mainState from './mainState'
import {getFocusedWebContents, getCurrentWindow} from './util'

const isDarwin = process.platform === 'darwin'
const topURL = mainState.newTabMode == 'myHomepage' ? mainState.myHomepage : `chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/${mainState.newTabMode}.html`

const createFileSubmenu = () => {
  const submenu = [
    {
      label: locale.translation('newTab'),
      accelerator: mainState.keyNewTab,
      click(item, focusedWindow) {
        getFocusedWebContents().then(cont=>{
          cont && cont.hostWebContents.send('new-tab',cont.getId(),topURL)
        })
      }
    },
    {
      label: locale.translation('newPrivateTab'),
      accelerator: 'Shift+CmdOrCtrl+P',
      click(item, focusedWindow) {
        getFocusedWebContents().then(cont=>{
          cont && cont.hostWebContents.send('new-tab',cont.getId(),topURL,true)
        })
      }
    },
    {
      label: locale.translation('newWindow'),
      accelerator: mainState.keyNewWindow,
      click(item, focusedWindow) {
        BrowserWindowPlus.load({id:focusedWindow.id,sameSize:true})
      }
    },
    { type: 'separator' },
    {
      label: locale.translation('openLocation'),
      accelerator: mainState.keyOpenLocation,
      click(item, focusedWindow) {
        getFocusedWebContents().then(cont=>{
          cont && cont.hostWebContents.send('focus-location-bar',cont.getId())
        })
      }
    },
    { type: 'separator' },
    {
      label: locale.translation('closeTab'),
      accelerator: mainState.keyCloseTab,
      click(item, focusedWindow) {
        getFocusedWebContents().then(cont=>{
          cont && cont.hostWebContents.send('meun-or-key-events','close-tab',cont.getId())
        })
      }
    },
    {
      // This should be disabled when no windows are active.
      label: locale.translation('closeWindow'),
      accelerator: mainState.keyCloseWindow,
      click(item, focusedWindow) {
        focusedWindow.close()
      }
    },
    { type: 'separator' },
    {
      label: locale.translation('savePageAs'),
      accelerator: mainState.keySavePageAs,
      click(item, focusedWindow) {
        getFocusedWebContents().then(cont=>{
          if(cont){
            PubSub.publishSync('need-set-save-filename')
            cont.downloadURL(cont.getURL(), true)
          }
        })
      }
    },
    { type: 'separator' },
    {
      label: locale.translation('print'),
      accelerator: mainState.keyPrint,
      click(item, focusedWindow) {
        getFocusedWebContents().then(cont=>{
          cont && cont.print()
        })
      }
    }
  ]

  if (!isDarwin) {
    submenu.push({ type: 'separator' })
    submenu.push({
      label: locale.translation('quit'),
      accelerator: mainState.keyQuit,
      click: function () { app.quit() }
    })
  }

  return submenu
}


const createEditSubmenu = () => {
  const submenu = [
    {
      label: locale.translation('undo'),
      accelerator: mainState.keyUndo,
      role: 'undo'
    }, {
      label: locale.translation('redo'),
      accelerator: mainState.keyRedo,
      role: 'redo'
    },
    { type: 'separator' },
    {
      label: locale.translation('cut'),
      accelerator: mainState.keyCut,
      role: 'cut'
    }, {
      label: locale.translation('copy'),
      accelerator: mainState.keyCopy,
      role: 'copy'
    }, {
      label: locale.translation('paste'),
      accelerator: mainState.keyPaste,
      role: 'paste'
    }, {
      label: locale.translation('pasteWithoutFormatting'),
      accelerator: mainState.keyPasteWithoutFormatting,
      click: function (item, focusedWindow) {
        focusedWindow.webContents.pasteAndMatchStyle()
      }
    },
    { type: 'separator' },
    {
      label: 'Delete',
      accelerator: 'Delete',
      click: function (item, focusedWindow) {
        focusedWindow.webContents.delete()
      }
    }, {
      label: 'Select All',
      accelerator: 'CmdOrCtrl+A',
      role: 'selectall'
    },
    // { type: 'separator' },
    // CommonMenu.findOnPageMenuItem(),
    // {
    //   label: locale.translation('findNext'),
    //   visible: false,
    //   accelerator: 'CmdOrCtrl+G'
    // }, {
    //   label: locale.translation('findPrevious'),
    //   visible: false,
    //   accelerator: 'Shift+CmdOrCtrl+G'
    // },
    // CommonMenu.separatorMenuItem
    // NOTE: macOS inserts "start dictation" and "emoji and symbols" automatically
  ]

  // if (!isDarwin) {
  //   submenu.push(CommonMenu.preferencesMenuItem())
  // }

  return submenu
}


const createHistorySubmenu = () => {
  const submenu = [
  ]
  return submenu
}

const createWindowSubmenu = () => {
  const submenu = [
    {
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
      // "Minimize all" added automatically
    },
    {
      label: `Toggle MenuBar`,
      accelerator: 'Alt+CmdOrCtrl+T',
      click: function (item, focusedWindow) {
        if (focusedWindow) focusedWindow.webContents.send('toggle-nav')
      }
    },
    {
      label: 'Toggle Full Screen',
      accelerator: isDarwin ? 'Ctrl+Cmd+F' : 'F11',
      click(item, focusedWindow) {
        if (focusedWindow) {
          const isFullScreen = focusedWindow.isFullScreen()
          focusedWindow.webContents.send('switch-fullscreen',!isFullScreen)
          focusedWindow.setFullScreenable(true)
          const menubar = focusedWindow.isMenuBarVisible()
          focusedWindow.setFullScreen(!isFullScreen)
          focusedWindow.setMenuBarVisibility(menubar)
          focusedWindow.setFullScreenable(false)
        }
      }
    }
    // {
    //   label: locale.translation('zoom'),
    //   visible: false
    // },
    // CommonMenu.separatorMenuItem,
    // {
    //   label: locale.translation('selectNextTab'),
    //   accelerator: 'Ctrl+Tab',
    //   click: function (item, focusedWindow) {
    //     CommonMenu.sendToFocusedWindow(focusedWindow, [messages.SHORTCUT_NEXT_TAB])
    //   }
    // }, {
    //   label: locale.translation('selectPreviousTab'),
    //   accelerator: 'Ctrl+Shift+Tab',
    //   click: function (item, focusedWindow) {
    //     CommonMenu.sendToFocusedWindow(focusedWindow, [messages.SHORTCUT_PREV_TAB])
    //   }
    // }, {
    //   label: locale.translation('moveTabToNewWindow'),
    //   visible: false
    // }, {
    //   label: locale.translation('mergeAllWindows'),
    //   visible: false
    // },
    // CommonMenu.separatorMenuItem,
    // CommonMenu.bookmarksManagerMenuItem(),
    // CommonMenu.downloadsMenuItem(),
    // CommonMenu.extensionsMenuItem(),
    // CommonMenu.passwordsMenuItem()
  ]

  if (isDarwin) {
    submenu.push(
      { type: 'separator' },
      {
        label: 'Bring All to Front',
        role: 'front'
      }
    )
  }
  else{

    submenu.push(
      {
        label: 'Toggle Developer Tools',
        accelerator: (function () {
          if (process.platform === 'darwin') {
            return 'Alt+Command+I'
          } else {
            return 'Ctrl+Shift+I'
          }
        })(),
        click: function (item, focusedWindow) {
          if (focusedWindow) focusedWindow.toggleDevTools()
        }
      }
    )
  }

  return submenu
}


let appMenu
function getTemplate(){
  const template = [
    { label: 'File', submenu: createFileSubmenu() },
    { label: 'Edit', submenu: createEditSubmenu() },
    // { label: locale.translation('view'), submenu: createViewSubmenu() },
    // { label: 'History', submenu: createHistorySubmenu() },
    // { label: 'bookmark', submenu: createBookmarksSubmenu() },
    // {
    //   label: locale.translation('bravery'),
    //   submenu: [
    //     CommonMenu.braverySiteMenuItem(),
    //     CommonMenu.separatorMenuItem,
    //     CommonMenu.braveryPaymentsMenuItem()
    //   ]
    // },
    { label: 'Window', submenu: createWindowSubmenu(), role: 'window' },
    // { label: locale.translation('help'), submenu: createHelpSubmenu(), role: 'help' }
  ]


  if (isDarwin) {
    const name = app.getName()
    template.unshift({
      label: name,
      submenu: [
        {
          label: 'About ' + name,
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          label: 'Hide ' + name,
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Alt+H',
          role: 'hideothers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          label: locale.translation('quit'),
          accelerator: mainState.keyQuit,
          click: function () { app.quit() }
        }
      ]
    })
  }

  // const t = [
  //   {
  //     label: 'File',
  //     submenu: [
  //       { label: 'New &Window',
  //         accelerator: 'CmdOrCtrl+Alt+N',
  //         click: ()=>{BrowserWindowPlus.load()}
  //       },
  //       {
  //         label: 'Close',
  //         accelerator: 'CmdOrCtrl+W',
  //         role: 'close'
  //       }
  //     ]
  //   },
  //   {
  //     label: 'Edit',
  //     submenu: [
  //       {
  //         label: 'Undo',
  //         accelerator: 'CmdOrCtrl+Z',
  //         role: 'undo'
  //       },
  //       {
  //         label: 'Redo',
  //         accelerator: 'CmdOrCtrl+Y',
  //         role: 'redo'
  //       }
  //     ]
  //   },
  //   {
  //     label: 'View',
  //     submenu: [
  //       {
  //         label: `Toggle MenuBar`,
  //         accelerator: 'CmdOrCtrl+Alt+T',
  //         click: function (item, focusedWindow) {
  //           if (focusedWindow) focusedWindow.webContents.send('toggle-nav')
  //         }
  //       },
  //       {
  //         label: 'Toggle Full Screen',
  //         accelerator: (function () {
  //           if (process.platform === 'darwin') {
  //             return 'Ctrl+Command+F'
  //           } else {
  //             return 'F11'
  //           }
  //         })(),
  //         click: function (item, focusedWindow) {
  //           if (focusedWindow) {
  //             focusedWindow.setFullScreenable(true)
  //             const menubar = focusedWindow.isMenuBarVisible()
  //             focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
  //             focusedWindow.setMenuBarVisibility(menubar)
  //             focusedWindow.setFullScreenable(false)
  //           }
  //         }
  //       },
  //       {
  //         label: 'Toggle Developer Tools',
  //         accelerator: (function () {
  //           if (process.platform === 'darwin') {
  //             return 'Alt+Command+I'
  //           } else {
  //             return 'Ctrl+Shift+I'
  //           }
  //         })(),
  //         click: function (item, focusedWindow) {
  //           if (focusedWindow) focusedWindow.toggleDevTools()
  //         }
  //       }
  //     ]
  //   },
  //   {
  //     label: 'Help',
  //     role: 'help',
  //     submenu: [
  //       {
  //         label: 'Learn More',
  //         click: function () { shell.openExternal('http://electron.atom.io') }
  //       }
  //     ]
  //   }
  // ]

  if (isDarwin) {
    const name = app.getName()
    template.unshift({
      label: name,
      submenu: [
        {
          label: 'About ' + name,
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          label: 'Hide ' + name,
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Alt+H',
          role: 'hideothers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click() {
            app.quit()
          }
        }
      ]
    })
    // Window menu.
    template[3].submenu.push(
      {
        type: 'separator'
      },
      {
        label: 'Bring All to Front',
        role: 'front'
      }
    )
  }
  return template
}
let oldMenu = appMenu
appMenu = Menu.buildFromTemplate(getTemplate())
Menu.setApplicationMenu(appMenu)

if (oldMenu) {
  oldMenu.destroy()
}