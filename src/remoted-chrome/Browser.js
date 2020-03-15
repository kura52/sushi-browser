import path from 'path'
import fs from 'fs'
import os from 'os'
import puppeteer from '../../resource/puppeteer'
import extensionServer from './extensionServer'
import emptyPort from './emptyPort'
import winctl from '../../resource/winctl'
import electron, {app, BrowserWindow, ipcMain, dialog} from 'electron'
import PubSub from "../render/pubsub"
import extInfos from '../extensionInfos'
import backgroundPageModify from './backgroundPageModify'
import hjson from 'hjson'
import evem from './evem'
import mainState from "../mainState";
import DpiUtils from './DpiUtils'
import BraveExtensionsManifest from './BraveExtensionsManifest'
import sharedState from '../sharedStateMain'
import LRUCache from 'lru-cache'

const isWin = process.platform == 'win32'
const isLinux = process.platform === 'linux'
const isDarwin = process.platform === 'darwin'
const isWin7 = os.platform() == 'win32' && os.release().startsWith('6.1')
const isWin10 = os.platform() == 'win32' && os.release().startsWith('10')

const CUSTOM_CHROMIUM_PATH = isLinux ?
    path.join(__dirname, '../../../../custom_chromium/chrome') :
    isWin ? path.join(__dirname, '../../../../custom_chromium/chrome.exe'):
        path.join(__dirname, '../../../custom_chromium/Chromium.app/Contents/MacOS/Chromium')

const CUSTOM_BRAVE_PATH = path.join(__dirname, '../../../../custom_chromium/brave.exe')

const FORBIDDEN_HEADER_FIELDS = new Set([
  'accept-charset',
  'accept-encoding',
  'access-control-request-headers',
  'access-control-request-method',
  'connection',
  'content-length',
  'cookie',
  'cookie2',
  'date',
  'dnt',
  'expect',
  'host',
  'keep-alive',
  'origin',
  'referer',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'user-agent',
  'via'
])

console.log(CUSTOM_CHROMIUM_PATH,990)

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
function diffArray(arr1, arr2) {
  return arr1.filter(e=>!arr2.includes(e))
}

class Browser{
  static setUserDataDir(userDataDir){
    this.userDataDir = userDataDir
  }

  static async _initializer(){
    console.log(4444,path.join(__dirname, '../../../..'))
    if(this._browser != null) return

    let executablePath = require('../minimist')(process.argv.slice(1))['browser-path']

    if(executablePath){
      if(!fs.existsSync(executablePath)){
        await new Promise(r=> dialog.showMessageBox({
          type: 'info',
          buttons: ['OK'],
          message: `The path specified by --browser-path does not exist.
Please enter the correct path of the executable file.`
        },()=>r()))
        return app.quit()
      }
    }
    else if(fs.existsSync(executablePath = CUSTOM_CHROMIUM_PATH) ||
      fs.existsSync(executablePath = CUSTOM_CHROMIUM_PATH)){
      BrowserPanel.BROWSER_NAME = 'Chromium'
    }
    else if(fs.existsSync(executablePath = CUSTOM_BRAVE_PATH)){
      BrowserPanel.BROWSER_NAME = 'Brave'
    }
    else if(fs.existsSync(executablePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe')){}
    else if(fs.existsSync(executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')){}
    else if(fs.existsSync(executablePath = path.join(app.getPath('home'),'AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'))){}
    else{
      executablePath = void 0
    }

    if(!executablePath){
      await new Promise(r=> dialog.showMessageBox({
        type: 'info',
        buttons: ['OK'],
        message: `Sushi browser requires Chrome.
Please install Chrome from https://www.google.com/chrome/
Or, please use the Chromium bundled version.`
      },()=>r()))
      return app.quit()
    }

    this._browser = await puppeteer.launch({
      ignoreDefaultArgs: true,
      // ignoreHTTPSErrors: true,
      defaultViewport: null,
      executablePath,
      // executablePath: `${app.getPath('home')}\\AppData\\Local\\Chromium\\Application\\chrome.exe`,
      // executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge Dev\\Application\\msedge.exe",
      // executablePath: "C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
      // executablePath: `${app.getPath('home')}\\AppData\\Local\\CentBrowser\\Application\\chrome.exe`,
      // executablePath: `${app.getPath('home')}\\AppData\\Local\\Kinza\\Application\\kinza.exe`,
      // executablePath: "C:\\Program Files (x86)\\SRWare Iron\\chrome.exe",
      // executablePath: "C:\\Program Files\\SRWare Iron (64-Bit)\\chrome.exe",
      // executablePath: `${app.getPath('home')}\\AppData\\Local\\Vivaldi\\Application\\vivaldi.exe`,
      // executablePath: "C:\\Program Files\\Slimjet\\slimjet.exe",
      // executablePath: "C:\\Program Files\\Comodo\\Dragon\\dragon.exe",

      args: [
        '--show-component-extension-options',
        '--whitelisted-extension-id=dckpbojndfoinamcdamhkjhnjnmjkfjd',
        '--no-first-run',
        // '--enable-automation',
        '--metrics-recording-only',
        '---no-startup-window',
        // '--enable-prompt-on-repost',
        '--disable-breakpad',
        // '--disable-logging',
        // '--silent-debugger-extension-api',
        // `--lang=en`,
        // '--disable-gpu',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        // '--test-type',
        '--disable-default-apps',
        // '--disable-dev-shm-usage',
        '--disable-features=WebContentsOcclusion',
        // '--disable-features=site-per-process,BlinkGenPropertyTrees,WebContentsOcclusion',
        // '--disable-features=site-per-process',
        `--user-data-dir=${this.userDataDir}`,
        `--load-extension=${path.resolve(__dirname, '../../resource/extension/default/1.0_0/').replace(/app.asar([\/\\])/,'app.asar.unpacked$1')}`,
        'about:blank'
      ],
      pipe: true
    })



    this.tabMoving = 0
    this.prevSyncTabPositionTime = Date.now()
    this.listeners = {}
    this._pagePromises = {}
    this.disableOnActivated = new Set()
    this.windowCache = {}
    this.popUpCache = {}
    this.tabCreatedTimeCache = {}
    this.downloadCache = new LRUCache(2000)

    mainState.versions.chrome = (await this._browser.version()).split("/")[1]

    evem.on('ipc.send', (channel, tabId, ...args)=>{
      // console.log(channel, tabId)
      ipcMain.emit(channel, {sender: Number.isInteger(tabId) ? new webContents(tabId): new BackgroundPage(tabId)}, ...args)
    })

    await this.initBgPage()

    this.initExtension()

    await this.initTargetCreated()

    await this.backGroundPageObserve()

    if(isLinux) this.startObserve()

    this.onResize()
    this.onFocusChanged()

    let prevMove = Date.now()
    ipcMain.on('move-window', browserWindowId => {
      const now = Date.now()
      if(now - prevMove > 1){
        for(const browserPanel of Object.values(BrowserPanel.panelKeys)){
          if(browserPanel.browserWindow && browserPanel.browserWindow.id == browserWindowId){
            ipcMain.emit('set-position-browser-view',
              {sender: browserPanel.browserWindow.webContents}, browserPanel.panelKey)
          }
        }
      }
      prevMove = now
    })

    let minimizedTime = Date.now()
    ipcMain.on('state-change-window', async (browserWindowId, eventName) => {
      if(Date.now() - minimizedTime < 100) return

      if(eventName == 'focus'){
        console.log('state-change-window', 'focus', browserWindowId)
        setTimeout(()=>this.focusedBwWindowIdPre = browserWindowId,100)
        if(browserWindowId == -1) return
        if(!isWin && winctl.moveTopTime && Date.now() - winctl.moveTopTime < 500) return
      }
      for(const browserPanel of Object.values(BrowserPanel.panelKeys)){
        if(browserPanel.browserWindow && browserPanel.browserWindow.id == browserWindowId){
          if(eventName == 'focus'){
            console.log('moveTopNativeWindow+bW1',this.focusedWindowId,this.focusedWindowIdPre)
            if(!isWin && this.focusedWindowIdPre && this.focusedWindowIdPre == browserWindowId) return
            setTimeout(()=>{
              browserPanel.moveTopNativeWindow()
              browserPanel.moveTopNativeWindowBw()
            },0)
          }
          else if(eventName == 'minimize'){
            browserPanel.cpWin.nativeWindow.showWindow(0)
            minimizedTime = Date.now()
          }
          else if(eventName == 'restore'){
            console.log('restore')
            // browserPanel.cpWin.chromeNativeWindow.showWindow(9)
            // await new Promise(r=>setTimeout(()=>{
            //   browserPanel.cpWin.nativeWindow.showWindow(9)
            //   browserPanel.moveTopNativeWindow()
            //   browserPanel.cpWin.nativeWindow.setForegroundWindow()
            //   r()
            // },0))
            setTimeout(()=>{
              console.log('SHOW')
              if(browserPanel.cpWin.nativeWindow.hidePanel) return
              browserPanel.cpWin.nativeWindow.showWindow(9)
              // browserPanel.moveTopNativeWindow()
              // browserPanel.moveTopAll()
              browserPanel.cpWin.nativeWindow.setForegroundWindowEx()
              console.log('setForegroundWindow12')
            },0)
          }
        }
      }
    })

    ipcMain.on('tab-moved', (e, {tabId,fromIndex,toIndex,before,next,other}) => {
      if(other) return
      console.log(11,'tab-moved', tabId,fromIndex,toIndex)
      // const [panelKey, tabKey, browserPanel, browserView] = BrowserPanel.getBrowserPanelByTabId(toIndex == 0 ? next.wvId : before.wvId)

      const [panelKey, tabKey, browserPanel, browserView] = BrowserPanel.getBrowserPanelByTabId(tabId)
      BrowserPanel.moveTabs([tabId], panelKey, {index: toIndex, tabKey})
    })

    ipcMain.on('top-to-browser-window', bwWinId => {
      // if(winctl.moveTopTime && Date.now() - winctl.moveTopTime < 500) return
      const hwnd = winctl.GetActiveWindow2().getHwnd()
      for(const browserPanel of Object.values(BrowserPanel.panelKeys)){
        if(browserPanel.browserWindow.id == bwWinId){
          if(browserPanel.cpWin.nativeWindowBw.getHwnd() == hwnd || browserPanel.cpWin.chromeNativeWindow.getHwnd() == hwnd || winctl.WindowFromPoint2() == hwnd){
            if(!isWin){
              browserPanel.browserWindow.focus()
            }
            else{
              browserPanel.moveTopNativeWindowBw()
            }
            console.log('moveTopNativeWindowBW2',Date.now())
            return
          }
        }
      }
    })

    ipcMain.on('fullscreen-change', async (e, enabled, delay) => {
      if(Browser.CUSTOM_CHROMIUM) return
      // console.log('fullscreen-change', e, enabled)
      const [_1, _2, browserPanel, browserView] = BrowserPanel.getBrowserPanelByTabId(e.sender.id)
      if(enabled && !browserPanel.browserWindow._fullscreen){
        browserPanel.cpWin.chromeNativeWindow.setParent(null)
        browserPanel.browserWindow._fullscreen = browserView.webContents
        // const dim = browserPanel.cpWin.nativeWindow.dimensions()
        // setTimeout(()=>{
        //   console.log(browserPanel.cpWin.chromeNativeWindow.getHwnd(),dim)
        //   browserPanel.cpWin.chromeNativeWindow.move2(dim.left, dim.top, dim.right - dim.left, dim.bottom - dim.top)
        //   browserPanel.cpWin.chromeNativeWindow.setWindowLongPtr(val)
        // },0)

        // await new Promise(r=>setTimeout(r,3000))
        // const dim = browserPanel.cpWin.nativeWindow.dimensions()
        // console.log(dim)
        // browserPanel.cpWin.chromeNativeWindow.setWindowPos(0,0,0, dim.right - dim.left + BrowserPanel.sideMargin * 2, dim.bottom - dim.top + BrowserPanel.topMargin + 8,4)
        // browserPanel.cpWin.chromeNativeWindow.setWindowLongPtr(0x00040000)
        // browserPanel.cpWin.chromeNativeWindow.setWindowPos(0,0,0,0,0,39)
      }
      else if(!enabled && browserPanel.browserWindow._fullscreen){
        if(delay > 0) await new Promise(r=>setTimeout(r,delay))
        browserPanel.cpWin.chromeNativeWindow.setParent(browserPanel.cpWin.nativeWindow.getHwnd())
        const dim = await DpiUtils.dimensions(browserPanel.cpWin.nativeWindow)
        DpiUtils.moveForChildWindow(browserPanel.cpWin.chromeNativeWindow,...BrowserPanel.getChromeWindowBoundArray(dim.right - dim.left, dim.bottom - dim.top),dim.left,dim.top)
        browserPanel.browserWindow._fullscreen = false
      }
      if(!delay) browserPanel.setFullscreenBounds(enabled)
    })

    ipcMain.on('get-access-key-and-port', e => {
      e.sender.send('get-access-key-and-port-reply', [this.serverKey, this.port])
    })

    ipcMain.on('hide-browser-panel', async (e, panelKey, hide) => {
      const panel = BrowserPanel.getBrowserPanel(panelKey)
      if(hide){
        console.log('hide-browser-panel1', panelKey, hide)
        panel.cpWin.nativeWindow.showWindow(0)
        panel.cpWin.nativeWindow.hidePanel = true
      }
      else{
        console.log('hide-browser-panel2', panelKey, hide)
        panel.cpWin.nativeWindow.showWindow(9)
        delete panel.cpWin.nativeWindow.hidePanel
      }
    })

    ipcMain.on('tab-panel-close', (e, panelKey) => {
      const browserWindow = BrowserWindow.fromWebContents(e.sender)
      for(const browserPanel of Object.values(BrowserPanel.panelKeys)){
        if(browserPanel.browserWindow == browserWindow && browserPanel.panelKey != panelKey){
          console.log('upppp!')
          browserPanel.cpWin.nativeWindowBw.setForegroundWindowEx()
          browserPanel.cpWin.nativeWindow.setForegroundWindowEx()
          browserPanel.moveTopAll()
          break
        }
      }

      const panel = BrowserPanel.getBrowserPanel(panelKey)
      if(panel){
        Browser.bg.evaluate((windowId) => chrome.windows.remove(windowId), panel.windowId)
      }
    })

    ipcMain.on('chrome-tabs-update-active', (e,tabId) => {
      const cont = webContents.fromId(tabId)
      if(cont && cont.hostWebContents2) cont.hostWebContents2.send('chrome-tabs-event',{tabId, changeInfo: {active: true}}, 'updated')
    })

    this.addExtensionEvents()

    if(isWin) this.winScollEventHandler()

    // setInterval(()=>{
    //   powerMonitor.querySystemIdleState(60, state => {
    //     if(state == 'idle') this.reloadExtension()
    //   })
    // },30000)

    // setInterval(async ()=>{
    //   for (const [panelKey, panel] of Object.entries(BrowserPanel.panelKeys)) {
    //     const pos = await new Promise(r => {
    //       ipcMain.once(`get-webview-pos-${panelKey}-reply`, (e, pos) => r(pos))
    //       panel.browserWindow.webContents.send('get-webview-pos', panelKey)
    //     })
    //
    //     const win = panel.browserWindow
    //     const winPos = win.getPosition()
    //     panel.setBounds({ x:  Math.round(pos.left + winPos[0]), y: Math.round(pos.top + winPos[1]), width: pos.width, height: pos.height}, true)
    //   }
    // },3000)
  }

  static async winScollEventHandler(){
    if(!mainState.scrollInactiveWindows) return

    const Registry = require('winreg')
    const regKey = new Registry({hive: Registry.HKCU, key: '\\Control Panel\\Desktop'}) //HKEY_CURRENT_USER
    let mouseWheelRouting = await new Promise(resolve => {
      regKey.get('MouseWheelRouting', (err, item) => {
        if(err) return resolve(false)
        resolve(parseInt(item.value, 16) == 2)
      })
    })

    if(mouseWheelRouting) return


    const doWheel = (e, browserPanel) => {
      const pos = browserPanel.browserWindow.getPosition()
      const p = DpiUtils.screenToDipPoint(e.x, e.y)
      browserPanel.browserWindow.webContents.sendInputEvent({
        type: 'mouseWheel', x: p.x - pos[0], y: p.y - pos[1], deltaX: 0, deltaY: e.rotation * -1 * 100, canScroll: true
      })
    }

    const ioHook = require(path.join(__dirname,'../../node_modules/iohook').replace(/app.asar([\/\\])/,'app.asar.unpacked$1'))
    ioHook.start(false)
    ioHook.on('mousewheel', async e => {
      const hwnd = winctl.NonActiveWindowFromPoint()
      if(!hwnd) return
      // const win = (await winctl.FindWindows(win => win.getHwnd() == hwnd))[0]
      // console.log(hwnd,win && win.getTitle()); // { amount: 3,  clicks: 1,  direction: 3,  rotation: 1,  type: 'mousewheel',  x: 776,  y: 850 }

      for (const browserPanel of Object.values(BrowserPanel.panelKeys)) {
        if(browserPanel.cpWin.nativeWindowBw.getHwnd() == hwnd ){
          return doWheel(e, browserPanel)
        }
        else if(browserPanel.cpWin.nativeWindow.getHwnd() == hwnd){
          const activeHwnd = winctl.GetActiveWindow2().getHwnd()
          for (const browserPanel2 of Object.values(BrowserPanel.panelKeys)) {
            if(browserPanel != browserPanel2 &&
              browserPanel.browserWindow == browserPanel2.browserWindow &&
              browserPanel2.cpWin.nativeWindow.getHwnd() == activeHwnd) return
          }
          return doWheel(e, browserPanel)
        }
      }
    })
  }

  static async close(){
    await this._browser.close()
    this.closed = true
  }

  static initExtension(){
    require('./browser/browser-action-main')
    require('./browser/commands-main')
    require('./browser/context-menus-main')
  }

  static async reloadExtension(){
    // this.bg._client.send('Page.disable')
    // await this.bg._client.send('Page.enable')

    this.bg._client.send('Runtime.disable')
    await this.bg._client.send('Runtime.enable')

    await this.bg.reload()
    this.initExtensionEvent()
    this.onResize()
    this.addExtensionEvents()
  }

  static startObserve(){
    let prevMousePos = {},  prevStates = {}
    setInterval(()=>{
      const mousePos = electron.screen.getCursorScreenPoint()
      if(mousePos.x === prevMousePos.x && mousePos.y === prevMousePos.y) return
      prevMousePos = mousePos

      for(let win of BrowserWindow.getAllWindows()){
        if(win.forceNotIgnoreMouse) continue
        const bounds = win.getBounds()
        const out = (mousePos.x < bounds.x ||	mousePos.x > bounds.x + bounds.width
          ||	mousePos.y < bounds.y ||	mousePos.y > bounds.y + bounds.height)

        const realPos = { x: mousePos.x - bounds.x, y: mousePos.y - bounds.y }


        if(realPos.x < 4 || realPos.y < 4 || bounds.width - realPos.x < 4  || bounds.height - realPos.y < 4){
          // console.log(bounds, mousePos, realPos)

          win.setIgnoreMouseEvents(false)
          win.ignoreMouseEvents = false
          prevStates[win.id] = 'out'
          continue
        }

        if(out){
          if(prevStates[win.id] == 'in') {
            win.setIgnoreMouseEvents(false)
            win.ignoreMouseEvents = false
          }
          prevStates[win.id] = 'out'
          continue
        }

        win.webContents.executeJavaScript(`var _ce_ = document.elementFromPoint(${realPos.x}, ${realPos.y}); _ce_ && _ce_.className`,(result)=>{
          if(result == 'browser-page'){
            if(prevStates[win.id] == 'out') {
              win.setIgnoreMouseEvents(true)
              win.ignoreMouseEvents = true
            }
            prevStates[win.id] = 'in'
          }
          else{
            if(prevStates[win.id] == 'in') {
              win.setIgnoreMouseEvents(false)
              win.ignoreMouseEvents = false
            }
            prevStates[win.id] = 'out'
          }
        })
      }
    },20)
  }

  static async modifyBackgroundPage(bgPage, isFast){
    console.log(222144)
    // if(Browser.CUSTOM_CHROMIUM){
    //   await bgPage.evaluate((port, serverKey) => window._setPortAndKey_(port, serverKey), this.port, this.serverKey)
    // }
    // else{
      await bgPage.evaluateOnNewDocument(backgroundPageModify, this.port, this.serverKey)
      if(!isFast){
        await new Promise(r=>setTimeout(r,300))
        await bgPage.evaluate(()=>location.reload())
        await new Promise(r=>setTimeout(r,300))
      }
      else{
        await bgPage.reload()
        await new Promise(r=>setTimeout(r,200))
      }
    // }
  }

  static async backGroundPageObserve(){
    const promises = []

    for(const target of this._browser.targets()){
      if(target.type() != 'background_page') continue

      const bgPage = await target.page()
      if(this.cachedBgTarget.has(target._targetId)) continue

      const p = new Promise(async r=>{
        console.log(77788,target._targetId, target.url())
        await this.modifyBackgroundPage(bgPage)
        this.cachedBgTarget.add(target._targetId)
        this.cachedBgTargetUrl.set(target.url().split("/")[2], bgPage)
        r()
      })
      promises.push(p)
    }

    await Promise.all(promises)
    setTimeout(()=>this.backGroundPageObserve(), 5000)
  }

  static onResize(){
    this.bg.evaluate((api, method, serverKey, port) => {
      const cache = {}
      let preFocused = -1
      setInterval(async ()=>{
        let focused
        chrome.windows.getAll(windows => {
          focused = void 0
          for(const window of windows){
            if(window.focused){
              focused = window.id
              if(preFocused != window.id){
                preFocused = focused
                // console.log(1, 'socketSend')
                chrome.ipcRenderer.socketSend(JSON.stringify({api, method: 'focusChanged', result: [focused]}))
              }
            }

            const preWindow = cache[window.id]
            if(preWindow){
              if((window.left != preWindow.left || window.top != preWindow.top || window.width != preWindow.width || window.height != preWindow.height)
                && window.width != 0 && preWindow.width != 0){
                console.log(port, serverKey, api,method,window)
                // chrome.tabs.query({active:true,windowId: window.id}, tabs => {
                // console.log(2, 'socketSend')
                chrome.ipcRenderer.socketSend(JSON.stringify({api, method, result: [{
                    id: window.id,
                    x: window.left - preWindow.left,
                    y: window.top - preWindow.top,
                    width: window.width - preWindow.width,
                    height: window.height - preWindow.height,
                    // topMargin: window.height - tabs[0].height - 8,
                    // sideMargin: (window.width - tabs[0].width) / 2
                  }
                  ]}))
                // })
              }
            }
            cache[window.id] = {left: window.left, top: window.top, width: window.width, height: window.height}
          }
          if(!focused && preFocused != -1){
            preFocused = -1
            // console.log(3, 'socketSend')
            chrome.ipcRenderer.socketSend(JSON.stringify({api, method: 'focusChanged', result: [preFocused]}))

          }
        })
      },50)
    }, 'windows', 'resize', this.serverKey, this.port)

    let preActiveHwnd = -1
    setInterval(()=>{
      if(isWin){
        const activeHwnd = winctl.GetActiveWindow2().getHwnd()
        if(preActiveHwnd != -1 && preActiveHwnd != activeHwnd){
          for (const browserPanel of Object.values(BrowserPanel.panelKeys)) {
            if (browserPanel.cpWin.nativeWindow.getHwnd() == activeHwnd){
              evem.emit('windows.focusChanged', browserPanel.windowId)
              break
            }
          }
        }
        preActiveHwnd = activeHwnd
      }
    },50)

  }

  static onFocusChanged(){
    evem.on('windows.focusChanged', async windowId => {
      this.focusedWindowId = windowId
      setTimeout(()=>this.focusedWindowIdPre = windowId,100)
      if(winctl.moveTopTime && Date.now() - winctl.moveTopTime < 500) return
      console.log('windows.focusChanged', windowId)

      if(windowId == -1) return
      if(!isWin && this.focusedWindowIdPre && this.focusedWindowIdPre != -1) return
      if(!isWin && this.focusedBwWindowIdPre && this.focusedBwWindowIdPre != -1) return

      for(const browserPanel of Object.values(BrowserPanel.panelKeys)){
        console.log(browserPanel.windowId , windowId)
        if(browserPanel.windowId == windowId){
          for(const browserPanel2 of Object.values(BrowserPanel.panelKeys)){
            if(browserPanel != browserPanel2 && browserPanel.browserWindow.id == browserPanel2.browserWindow.id){
              console.log('moveTopNativeWindow3')
              browserPanel2.moveTopNativeWindow()
            }
          }
          console.log('moveTopNativeWindow+bW4')
          browserPanel.moveTopNativeWindowBw()
          browserPanel.moveTopNativeWindow()
          return
        }
      }
    })
  }

  static async initBgPage() {
    await new Promise(r => {
      emptyPort((err, ports) => {
        this.serverKey = Math.random().toString().replace('.', '')
        this.port = ports[0]
        extensionServer(this.port, this.serverKey, d => evem.emit(`${d.api}.${d.method}`, ...d.result))
        r()
      }, 1)
    })


    let bgTarget = await this._browser.targets().find(t => t.url().startsWith('chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/bg.html'))
    if (!bgTarget) {
      for (let i = 0; i < 1000; i++) {
        bgTarget = await new Promise(r => {
          setTimeout(async () => {
            r(await this._browser.targets().find(t => t.url().startsWith('chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/bg.html')))
          }, 10)
        })
        if (bgTarget) break
      }
    }
    this.bg = await bgTarget.page()

    this.cachedBgTarget = new Set([bgTarget._targetId])
    this.cachedBgTargetUrl = new Map([[bgTarget.url().split("/")[2],this.bg]])
    await this.modifyBackgroundPage(this.bg, true)

    const extensions = await this.getExtensionInfos()
    extensions.forEach(e => extInfos.setInfo(e))
    for(let win of BrowserWindow.getAllWindows().filter(w=>w.getTitle().includes('Sushi Browser'))){
      if(!win.webContents.isDestroyed()){
        for(const installInfo of extensions){
          win.webContents.send('extension-ready',{[installInfo.id]:{...installInfo}})
        }
      }
    }

    this.initExtensionEvent()
  }

  static async initTargetCreated() {
    this._browser.on('targetcreated', async target => {

      console.log('targetcreated', target.url())

      if(target.type() == 'background_page'){
        const bgPage = await target.page()
        if(this.cachedBgTarget.has(bgPage._targetId)) return

        await this.modifyBackgroundPage(bgPage)
        this.cachedBgTarget.add(bgPage._targetId)
        console.log(9998111,target.url().split("/")[2])
        this.cachedBgTargetUrl.set(target.url().split("/")[2], bgPage)
        return
      }

      if (target.type() != 'page' || target.url().startsWith('chrome-devtools:')) return


      const targetMap = await this.bg.evaluate(() => {
        return new Promise(resolve => {
          chrome.debugger.getTargets(targetInfos => {
            const targetMap = {}
            for (let t of targetInfos) {
              console.log(t)
              if (t.tabId && t.type == 'page' && !t.url.startsWith('chrome-devtools://')) targetMap[t.id] = t.tabId
            }
            resolve(targetMap)
          })
        })
      })

      const tabId = targetMap[target._targetId]

      if (tabId) {
        for (let i = 0; i < 50; i++) {
          try{
            this._pagePromises[tabId] = target.page()
          }catch(e){}
          if(this._pagePromises[tabId]) break
          await new Promise(r => setTimeout(r, 300))
        }
      }
      else {
        for (let i = 0; i < 50; i++) {
          await new Promise(r => setTimeout(r, 100))

          const targetMap = {}
          for (let target of this._browser.targets()) {
            targetMap[target._targetId] = target
          }

          const targetArray = await this.bg.evaluate(() => {
            return new Promise(resolve => {
              chrome.debugger.getTargets(targetInfos => {
                const targetArray = []
                for (let t of targetInfos) {
                  if (t.tabId && t.type == 'page' && !t.url.startsWith('chrome-devtools:')) {
                    targetArray.push([t.id, t.tabId])
                  }
                }
                resolve(targetArray)
              })
            })
          })
          let restCount = 0
          for (let [targetId, tabId] of targetArray) {
            if (!this._pagePromises[tabId]) {
              const target = targetMap[targetId]
              if (target) {
                this._pagePromises[tabId] = target.page()
              } else {
                ++restCount
              }
            }
          }
          if (!restCount) break
        }
      }
    })
  }

  static addListener(api, method, listener, validateFunc, modifyPromisedFunc){
    const key = `${api}.${method}`

    if(this.listeners[key]){
      const prevListener = this.listeners[key][0]
      evem.off(key, prevListener)
    }

    evem.on(key, listener)
    this.listeners[key] = [listener]

    this.bg.evaluate((api, method, serverKey, port, validateFunc, modifyPromisedFunc) => {
      if(!chrome[api] || !chrome[api][method]){
        console.log(`ERROR: ${api}.${method}`)
        return
      }

      if(modifyPromisedFunc) modifyPromisedFunc = Function(modifyPromisedFunc)()
      if(validateFunc) validateFunc = Function(validateFunc)()

      chrome[api][method].addListener(async (...result) => {
        if(!validateFunc || validateFunc(...result)){
          if(modifyPromisedFunc)  result = await modifyPromisedFunc(...result)
          const data = JSON.stringify({api, method, result})
          // console.log(4, 'socketSend')
          chrome.ipcRenderer.socketSend(data)
        }
      })
    }, api, method, this.serverKey, this.port, validateFunc && `return ${validateFunc.toString()}`, modifyPromisedFunc && `return ${modifyPromisedFunc.toString()}`)
  }

  static initExtensionEvent(){

    this.bg.evaluate((serverKey, port) => {
      window.ipcRenderer = {
        port,
        serverKey,
        socket: null,
        open: false,
        events: window.ipcRenderer ? window.ipcRenderer.events : {},
        init() {
          this.socket = new WebSocket(`ws://localhost:${this.port}/${this.serverKey}`)
          this.socket.addEventListener('open', (event)=>{
            this.open = true
          })
          this.socket.addEventListener('close', (event)=>{
            this.open = false
            this.init()
          })
        },
        socketSend(data, retry) {
          if(!this.open){
            this.socket.addEventListener('open', (event)=>{
              this.open = true
              this.socket.send(data, retry)
            })
          }
          else{
            this.socket.send(data, retry)
          }
        },
        send(channel, ...args) {
          const data = JSON.stringify({
            api: 'ipc',
            method: 'send',
            result: [channel, chrome.runtime.id, ...args]
          })
          // console.log(5, 'socketSend')
          this.socketSend(data)
        },
        on(eventName, listener) {
          this.events[eventName] = listener
        },
        once(eventName, listener) {
          this.events[eventName] = (...args) => {
            listener(...args)
            delete this.events[eventName]
          }
        },
      }
      window.ipcRenderer.init()

      chrome.runtime.onMessage.addListener((message, sender) => {
        if (!message.ipcToBg || !sender.tab) return false
        // console.log('message', message)

        const data = JSON.stringify({
          api: 'ipc',
          method: 'send',
          result: [message.channel, sender.tab.id, ...message.args]
        })
        // console.log(6, 'socketSend')
        window.ipcRenderer.socketSend(data)
      })
    }, this.serverKey, this.port)
  }

  static addExtensionEvents(){
    this.addListener('webNavigation', 'onBeforeNavigate', details=>{
      evem.emit(`webNavigation-onBeforeNavigate_${details.tabId}`, details)
    })

    this.addListener('webNavigation', 'onCompleted', details=>{
      evem.emit(`webNavigation-onCompleted_${details.tabId}`, details)
    })

    this.addListener('webNavigation', 'onCommitted', details=>{
      evem.emit(`webNavigation-onCommitted_${details.tabId}`, details)
    }, details => details.transitionQualifiers.find(x=>x.endsWith('_redirect')))

    this.addListener('webNavigation', 'onErrorOccurred', details=>{
      // console.log(`webNavigation-onErrorOccurred_${details.tabId}`, details)
    })

    this.addListener('tabs', 'onCreated', async tab=>{

      this.tabCreatedTimeCache[tab.id] = Date.now()

      console.log('tab', 'created', tab.url, tab.openerTabId)
      if(webContents.webContentsMap && webContents.webContentsMap.has(tab.id)) return
      if(tab.url == 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/popup_prepare.html'){
        PopupPanel.tabId = tab.id
        return
      }
      if(this.windowCache[tab.windowId] == 'popup'){
        this.popUpCache[tab.id] = true
        return
      }

      // if(mainState.alwaysOpenLinkBackground){
      //   Browser.bg.evaluate((tabId) => {
      //     return new Promise(resolve => {
      //       chrome.tabs.update(tabId, {active: true}, () => resolve())
      //     })
      //   }, (await require('../util').getFocusedWebContents()).id)
      // }

      const cont = new webContents(tab.id)
      const bv = await BrowserView.newTab(cont, tab)

      this.syncTabPosition(bv._browserPanel.panelKey)

    }, mainState.alwaysOpenLinkBackground ? tab => {
      chrome.tabs.update(tab.openerTabId,{active:true})
      return true
    } : void 0)

    this.addListener('tabs', 'onMoved', (tabId, {windowId, fromIndex, toIndex})=>{
      if(PopupPanel.tabId == tabId || this.popUpCache[tabId]) return
      // const cont = new webContents(tabId)
      // BrowserView.movedTab(cont, windowId, fromIndex, toIndex)
      // console.log(999999,Date.now())
      if(this.tabMoveStart){
        this.tabMoving = Date.now()
        this.tabMoveStart = void 0
      }
      if(Date.now() - this.tabMoving < 1000) return
      // console.log(99999933,this.tabMoveStart, Date.now() - this.tabMoving,Date.now())
      BrowserPanel.MovedTabs(tabId, {windowId, fromIndex, toIndex})
    })

    this.addListener('tabs', 'onAttached', (tabId, {newWindowId, newPosition})=>{
      if(PopupPanel.tabId == tabId || this.popUpCache[tabId]) return
      // const cont = new webContents(tabId)
      // BrowserView.movedTab(cont, newWindowId, null, newPosition)
      // const [panelKey, tabKey, panel, bv] = BrowserPanel.getBrowserPanelByTabId(tabId)
      // BrowserPanel.moveTabs([tabId], panelKey, {index: newPosition, tabKey}, void 0, false)
      BrowserPanel.MovedTabs(tabId, {windowId: newWindowId, fromIndex: -1, toIndex: newPosition})
    })

    this.addListener('tabs', 'onUpdated', (tabId, changeInfo, tab)=>{
      if(PopupPanel.tabId == tabId || this.popUpCache[tabId]) return

      evem.queueEmit(`tabs-onUpdated_${tabId}`, changeInfo)
      const cont = webContents.fromId(tabId)
      if(changeInfo.url){
        cont.emitAndSend('did-navigate', {sender: this} ,changeInfo.url)
        changeInfo.url = void 0
      }
      if(cont && cont.hostWebContents2) cont.hostWebContents2.send('chrome-tabs-event',{tabId, changeInfo}, 'updated')
    })

    // this.addListener('tabs', 'onActivated', (activeInfo)=>{
    //   if(PopupPanel.tabId == activeInfo.tabId || this.popUpCache[activeInfo.tabId]) return
    //   if (this.disableOnActivated.size && this.disableOnActivated.has(BrowserPanel.getBrowserPanelByTabId(activeInfo.tabId)[2].browserWindow.id)) {
    //     return
    //   }
    //
    //   const cont = webContents.fromId(activeInfo.tabId)
    //
    //   const [_1, _2, panel, _3] = BrowserPanel.getBrowserPanelByTabId(activeInfo.tabId)
    //   // console.log(await bv.webContents.viewport())
    //   const modify = cont.getURL() == 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html' ? 37 : 0
    //   if(!Browser.CUSTOM_CHROMIUM && panel && panel.bounds) cont.setViewport({width:panel.bounds.width, height: panel.bounds.height - modify})
    //
    //   const now = Date.now()
    //   const activedIds = []
    //   let shouldChange = true
    //
    //   for(const x of webContents.activedIds){
    //     if(now - x[1] < 120){
    //       if(shouldChange && activeInfo.tabId == x[0])
    //         shouldChange = false
    //       else
    //         activedIds.push(x)
    //     }
    //   }
    //   webContents.activedIds = activedIds
    //
    //   // console.log(activeInfo, cont.hostWebContents2)
    //   if(shouldChange && cont && cont.hostWebContents2) cont.hostWebContents2.send('chrome-tabs-event',{tabId: activeInfo.tabId, changeInfo: {active: true}}, 'updated')
    // })

    this.addListener('tabs', 'onRemoved', async (removedTabId, removeInfo) => {
      console.log('tab.onRemoved')
      if(PopupPanel.tabId == removedTabId || this.popUpCache[removedTabId]) return

      BrowserView.closedTabs[removedTabId] = removeInfo.windowId

      for(let i=0;i<5;i++){
        evem.emit(`close-tab_${removedTabId}`)
        const cont = webContents.fromId(removedTabId)
        if(cont && cont.hostWebContents2){
          cont.hostWebContents2.send('chrome-tabs-event',{tabId: removedTabId}, 'removed')
          break
        }
        else{
          for (const win of BrowserWindow.getAllWindows()) {
            win.getTitle().includes('Sushi Browser') && win.webContents.send('chrome-tabs-event',{tabId: removedTabId}, 'removed')
          }
        }
        await new Promise(r=>setTimeout(r,100))
      }


      console.log(99977,removedTabId)

      for(const [panelKey, browserPanel] of Object.entries(BrowserPanel.panelKeys)){
        for(const [tabKey, [tabId, browserView]] of Object.entries(browserPanel.tabKeys)){
          if(tabId != removedTabId) continue
          if(!browserView.isDestroyed()) browserView.destroy()
          if(!Object.keys(browserPanel.tabKeys).length){
            delete BrowserPanel.panelKeys[panelKey]
            if(!Browser.CUSTOM_CHROMIUM) browserPanel.cpWin.nativeWindow.destroyWindow()
          }
          return
        }
      }
    })

    let historyOnVisitedProcessing = 0
    const {history} = require('../databaseFork')
    this.addListener('history', 'onVisited', async (valid, h)=>{
      ++historyOnVisitedProcessing
      const item =  await history.findOne({location: h.url})
      if(item){
        if(valid){
          await history.update({_id:item._id}, {$set: {location:h.url, updated_at: h.lastVisitTime, count: h.visitCount}})
        }
        else{
          await history.remove({_id:item._id}, { multi: true })
        }
      }
      else if(valid){
        console.log('history', 'onVisited', valid, h)
        await history.insert({location:h.url ,title: h.title || h.url, created_at: h.lastVisitTime ,updated_at: h.lastVisitTime,count: h.visitCount})
      }
      --historyOnVisitedProcessing
    }, void 0, (result) => new Promise(resolve => {
      chrome.history.search({text: result.url},results => resolve([!!results.find(r=>r.url == result.url), result]))
    }))

    this.addListener('history', 'onVisitRemoved', async removed=>{
      for(let i=0;historyOnVisitedProcessing && i<100;i++){
        await new Promise(r=>setTimeout(r,30))
        console.log('history', 'onVisitRemoved','wait')
      }
      if(removed.allHistory){
        history.remove({}, { multi: true })
      }
      else{
        if(typeof removed.urls === 'string'){
          history.remove({location: removed.urls})
        }
        else{
          console.log('history', 'onVisitRemoved', removed)
          history.remove({location: {$in: removed.urls || []}}, { multi: true })
        }
      }
    })

    this.addListener('windows', 'onCreated', window => {
      console.log(9992,window)
      if(this.popuped){
        window.type = 'popup'
        delete this.popuped
      }
      this.windowCache[window.id] = window.type
    })

    this.addListener('windows', 'onRemoved', removedWinId => {
      if(PopupPanel.instance.id == removedWinId){
        for (const win of BrowserWindow.getAllWindows()) {
          win.getTitle().includes('Sushi Browser') && win.webContents.send('close-browser-action')
        }
        PopupPanel.instancePre = PopupPanel.instance
        PopupPanel.instance = {}
        return
      }

      let bw
      for(const browserPanel of Object.values(BrowserPanel.panelKeys)){
        if(browserPanel.windowId == removedWinId){
          bw = browserPanel.browserWindow
          browserPanel.destroy()
          break
        }
      }
    })

    this.addListener('management', 'onInstalled', details => {
      this.updateExtensionInfo(details.id)
    })

    this.addListener('management', 'onUninstalled', id => {
      this.disableExtension(id, true)
    })

    this.addListener('management', 'onEnabled', info => {
      this.updateExtensionInfo(info.id)
    })

    this.addListener('management', 'onDisabled', info => {
      this.disableExtension(info.id)
    })

    for(let method of ['onCreated', 'onRemoved', 'onChanged', 'onMoved', 'onChildrenReordered', 'onImportEnded']){
      this.addListener('bookmarks', method, () => {
        for(let cont of webContents.getAllWebContents()){
          if(!cont.isDestroyed() /*&& !cont.isBackgroundPage()*/ && (cont.hostWebContents2 || !cont.hostWebContents2)) {
            const url = cont.getURL()
            if(cont.root || url.endsWith(`/favorite_sidebar.html`) ||url.endsWith(`/favorite.html`)){
              cont.send('update-datas')
            }
          }
        }
      })
    }

  }

  static _getExtensionInfo(e){
    const {getPath1,getPath2,_} =　require('../chromeExtensionUtil')

    let extensionPath = getPath2(e.id) || getPath1(e.id)
    if(!extensionPath) return false

    extensionPath = extensionPath.replace(/app.asar([\/\\])/,'app.asar.unpacked$1')
    const manifestPath = path.join(extensionPath, 'manifest.json')

    if(!fs.existsSync(manifestPath)) return false
    const manifestContents = hjson.parse(removeBom(fs.readFileSync(manifestPath).toString()))
    delete e.icons
    e = {...manifestContents, ...e}
    e.url = e.homepageUrl
    // e.options_page = e.optionsUrl
    e.base_path = extensionPath

    // console.log(845677,e)

    const installInfo = {
      id: e.id,
      name: e.name,
      url: e.url,
      base_path: e.base_path,
      manifest: e
    }
    transInfos(installInfo)

    const commands = installInfo.manifest.commands
    if(commands){
      const plat = os.platform() == 'win32' ? 'windows' : os.platform() == 'darwin' ? 'mac' : 'linux'
      for(let [command,val] of Object.entries(commands)){
        if(val.suggested_key){
          PubSub.publish('add-shortcut',{id:installInfo.id,key:val.suggested_key[plat] || val.suggested_key.default,command})
        }
      }

    }
    return installInfo
  }

  static async getExtensionInfos(){
    const result = await this.bg.evaluate(() => {
      return new Promise(resolve => {
        chrome.management.getAll(result => resolve(result.filter(x=>!x.isApp && x.id != 'ghbmnnjooekpmoecnnnilnnbdlolhkhi')))
      })
    })

    if(Browser.CUSTOM_CHROMIUM && BrowserPanel.BROWSER_NAME == 'Brave'){
      result.push(...Object.values(BraveExtensionsManifest))
    }

    return result.map(e => this._getExtensionInfo(e)).filter(e => e)
  }

  static async getCookies(url){
    if(!Browser.bg){
      for(let i=0;i<1000;i++){
        await new Promise(r=>setTimeout(r,10))
        if(Browser.bg) break
      }
    }

    return Browser.bg.evaluate(url => {
      return new Promise(resolve => {
        chrome.cookies.getAll({url}, cookies => resolve(cookies))
      })
    }, url)
  }

  static async updateExtensionInfo(id){
    if(BraveExtensionsManifest[id]) return BraveExtensionsManifest[id]

    const e = await this.bg.evaluate((id) => {
      return new Promise(resolve => {
        chrome.management.get(id, result => resolve(result))
      })
    }, id)

    const installInfo = this._getExtensionInfo(e)
    extInfos.setInfo(installInfo)
    for(let win of BrowserWindow.getAllWindows().filter(w=>w.getTitle().includes('Sushi Browser'))){
      if(!win.webContents.isDestroyed()){
        win.webContents.send('extension-ready',{[installInfo.id]:{...installInfo}})
      }
    }
  }

  static disableExtension(id, uninstall){
    delete sharedState.extensionMenu[id]
    if(uninstall) delete extInfos[id]
    for(let bw of BrowserWindow.getAllWindows()){
      if(bw.getTitle().includes('Sushi Browser'))
        bw.webContents.send('extension-disable', id)
    }
  }

  static getUserAgent(){
    return new Promise(async r => {
      for(let i=0;i<1000;i++){
        if(Browser._browser) break
        await new Promise(r=>setTimeout(r,10))
      }
      r(Browser._browser.userAgent())
    })
  }

  static async downloadURL(url, cont, refererOrRequestHeaders, retryKey){
    console.log('downloadURL', url, refererOrRequestHeaders)

    let requestHeaders
    if(typeof refererOrRequestHeaders === 'string'){
      requestHeaders = [{name: 'Referrer', value: refererOrRequestHeaders}]
    }
    else if(refererOrRequestHeaders){
      requestHeaders = []
      for(const h of refererOrRequestHeaders){
        const name = h.name.toLowerCase()
        if(!FORBIDDEN_HEADER_FIELDS.has(name) && !name.startsWith('proxy-') && !name.startsWith('sec-')){
          requestHeaders.push(h)
        }
      }
    }

    let item
    if(retryKey){
      item = await Browser.bg.evaluate((retryKey) => {
        return new Promise(async resolve => {
          chrome.downloads.search({id: retryKey}, results => resolve(results[0]))
        })
      }, parseInt(retryKey.split("\t")[0]))
    }

    if(!item){
      item = await Browser.bg.evaluate((url, tabId, requestHeaders) => {
        return new Promise(async resolve => {
          const options = {
            url,
            conflictAction: 'uniquify',
          }
          console.log(url, tabId, requestHeaders)
          if(requestHeaders){
            options.headers =  requestHeaders
          }
          else if(tabId){
            const referer = (await new Promise(r => chrome.tabs.get(tabId, tab => r(tab)))).url
            options.headers = [{name: 'Referrer', value: referer}]
          }
          chrome.downloads.download(options,
            downloadId => chrome.downloads.search({id: downloadId}, results => resolve(results[0])))

        })
      }, url, cont && cont.id, requestHeaders)
      item.requestHeaders = refererOrRequestHeaders
      Browser.downloadCache.set(item.id, refererOrRequestHeaders === 'string' ? requestHeaders : refererOrRequestHeaders)
    }
    ipcMain.emit('chrome-download-start', null, item, url, cont, retryKey)
  }

  static getRequestHeader(id){
    return Browser.downloadCache.get(id)
  }

  static getFocusedWindow(){
    // console.log('getFocusedWindow')
    const win = BrowserWindow.getFocusedWindow()
    if(win) return win

    const hwnd = winctl.GetActiveWindow2().getHwnd()
    console.log(winctl.GetActiveWindow2().getTitle())
    try{
      for(const browserPanel of Object.values(BrowserPanel.panelKeys)){
        if(browserPanel.cpWin.chromeNativeWindow.hwnd == hwnd){
          return browserPanel.browserWindow
        }
      }
    }catch(e){
      return BrowserWindow.getAllWindows()[0]
    }
  }

  static async initPopupPanel(){
    this.popupPanel = await PopupPanel.newPanel()
    console.log('initPopupPanel')
  }

  static async showPopupPanel(panelKey, tabKey, bounds, url){
    console.log('showPopupPanel')
    if(!this.popupPanel || !PopupPanel.instance.id){
      this.popupPanel = await PopupPanel.newPanel()
      if(PopupPanel.instancePre){
        const bounds = PopupPanel.instancePre.getBounds()
        if(bounds.width != null) this.popupPanel.setBounds(bounds)
      }
    }
    this.popupPanel.setKeys(panelKey, tabKey)

    if(url){
      await this.popupPanel.setActiveCurrentTab()
      this.popupPanel.loadURL(url)
    }

    if(bounds) this.popupPanel.setBounds(bounds)

    return this.popupPanel
  }

  static hidePopupPanel(panelKey, tabKey){
    console.log('hidePopupPanel')
    if(!this.popupPanel) return

    this.popupPanel.hide(panelKey, tabKey)

    return this.popupPanel
  }

  static getTabIds(panelKey){
    // console.log('getTabIds')
    return new Promise(r=>{
      const cont = BrowserPanel.getBrowserPanel(panelKey).browserWindow.webContents
      const key = Math.random().toString()
      cont.send(`get-tab-ids-${panelKey}`, key)
      ipcMain.once(`get-tab-ids-reply_${key}`,(e, myTabIds, selectedTabKey) => {
        r({myTabIds, selectedTabKey})
      })
    })
  }

  static getChromeTabIds(panelKey){
    // console.log('getChromeTabIds')
    const panel = BrowserPanel.getBrowserPanel(panelKey)
    return Browser.bg.evaluate((windowId) => {
      return new Promise(resolve => {
        chrome.windows.get(windowId,{populate: true}, window => resolve(window.tabs.map(tab=>tab.id)))
      })
    },panel.windowId)
  }

  static async syncTabPosition(panelKey){
    if(this.syncTabPositionProcessing) return
    this.syncTabPositionProcessing = true

    // console.log('syncTabPosition')
    let {myTabIds, selectedTabKey} = await this.getTabIds(panelKey)
    let chromeTabIds = await this.getChromeTabIds(panelKey)

    // const shouldRemoveTabIdsFromMy = diffArray(myTabIds, chromeTabIds)
    const shouldRemoveTabIdsFromChrome = diffArray(chromeTabIds, myTabIds)
    //
    // if(shouldRemoveTabIdsFromMy.length + shouldRemoveTabIdsFromChrome.length){
    //   for(const tabId of shouldRemoveTabIdsFromMy){
    //     panel.browserWindow.webContents.send('menu-or-key-events','closeTab',tabId)
    //     await new Promise(r=>setTimeout(r,10))
    //   }
    //
    if(shouldRemoveTabIdsFromChrome.length){
      let flag = true
      for(const tabId of shouldRemoveTabIdsFromChrome){
        if(!this.tabCreatedTimeCache[tabId] || (Date.now() - this.tabCreatedTimeCache[tabId] < 5000)){
          flag = false
          break
        }
      }
      if(flag){
        await this.bg.evaluate(tabIds => new Promise(r=>chrome.tabs.remove(tabIds,()=>r())),shouldRemoveTabIdsFromChrome)
        this.syncTabPositionProcessing = false
        return await this.syncTabPosition(panelKey)
      }
      this.syncTabPositionProcessing = false
      return await new Promise(r=>setTimeout(()=>this.syncTabPosition(panelKey),1700))
    }
    // }

    const panel = BrowserPanel.getBrowserPanel(panelKey)

    console.log('syncTabPosition', myTabIds.join(", "), chromeTabIds.join(", "), mainState.openTabNextLabel)

    // if(mainState.openTabNextLabel){
    //   const key = Math.random().toString()
    //   panel.browserWindow.webContents.send('chrome-tabs-move-inner',key,[newTabId],selectedTabKey,true)
    //   await new Promise(r=>ipcMain.once(`chrome-tabs-move-finished_${key}`,r))
    //
    //   myTabIds = (await this.getTabIds(panelKey)).myTabIds
    //   chromeTabIds = await this.getChromeTabIds(panelKey)
    // }

    let i = 0
    for(const tabId of myTabIds){
      if(tabId != chromeTabIds[i++]){
        // if(mainState.openTabNextLabel){
        //   panel.browserWindow.webContents.send('arrange-tabs',chromeTabIds)
        // }
        // else{
        // console.log(9999991,myTabIds,Date.now())
        const key = Math.random().toString()
        this.tabMoveStart = key
        await this.bg.evaluate((tabIds, windowId) => {
          console.log('syncTabPosition, handleTabSelect', tabIds)
          return new Promise(resolve => chrome.tabs.move(tabIds,{index: 0, windowId}, () => resolve()))
        },myTabIds, panel.windowId)
        // console.log(9999992,Date.now())
        // }
        break
      }
    }
    this.syncTabPositionProcessing = false
  }

}

Browser.CUSTOM_CHROMIUM = (!require('../minimist')(process.argv.slice(1))['browser-path'] ||
  !fs.existsSync(require('../minimist')(process.argv.slice(1))['browser-path'])) &&
  (fs.existsSync(CUSTOM_CHROMIUM_PATH) || fs.existsSync(CUSTOM_BRAVE_PATH))



const BrowserPanel = require("./BrowserPanel")
const BrowserView = require("./BrowserView")
const webContents = require("./webContents")

class PopupPanel{

  static async newPanel(){
    console.log('newPanel')
    const cWin = await Browser.bg.evaluate(() => {
      return new Promise(resolve => {
        chrome.windows.create({
          url: 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/popup_prepare.html',
          type: 'popup',
          state: 'minimized'
        }, window => resolve(window))
      })
    })

    let chromeNativeWindow
    for(let i=0;i<200;i++){
      chromeNativeWindow = (await winctl.FindWindows(win => {
        return win.getTitle().includes('Sushi Browser Popup Prepare')
      }))[0]
      if(chromeNativeWindow) break
      await new Promise(r=>setTimeout(r,50))
    }

    chromeNativeWindow.setWindowLongPtrEx(0x00001000)
    // if(!Browser.CUSTOM_CHROMIUM) {
    for (let i = 0; i < 5; i++) {
      chromeNativeWindow.setForegroundWindowEx()
      console.log('setForegroundWindow13')
      chromeNativeWindow.showWindow(0)
      if(isWin7){
        chromeNativeWindow.setWindowLongPtrRestore(0x00800000)
        chromeNativeWindow.setWindowLongPtrRestore(0x00040000)
        chromeNativeWindow.setWindowLongPtrRestore(0x00400000)
      }
      chromeNativeWindow.setWindowLongPtrEx(0x00000080)
      chromeNativeWindow.showWindow(5)
      await new Promise(r => setTimeout(r, 50))
    }
    // }

    const hwnd = chromeNativeWindow.createWindow()
    let nativeWindow
    if(Browser.CUSTOM_CHROMIUM){
      nativeWindow = chromeNativeWindow
    }
    else{
      nativeWindow = (await winctl.FindWindows(win => win.getHwnd() == hwnd))[0]
    }

    if(!Browser.CUSTOM_CHROMIUM){
      chromeNativeWindow.setParent(nativeWindow.getHwnd())
      DpiUtils.move(chromeNativeWindow,0, 0, 0, 0)
    }

    return new PopupPanel({chromeWindow: cWin, nativeWindow, chromeNativeWindow})
  }

  constructor({chromeWindow, nativeWindow, chromeNativeWindow}){
    console.log('constructor')
    this.id = chromeWindow.id
    this.chromeWindow = chromeWindow
    this.nativeWindow = nativeWindow
    this.chromeNativeWindow = chromeNativeWindow

    nativeWindow.showWindow(0)
    this.minimized = true

    this._bounds = {}

    PopupPanel.instance = this
  }

  destroy(){
    console.log('destroy')
    if(!Browser.CUSTOM_CHROMIUM) this.nativeWindow.destroyWindow()
  }

  setKeys(panelKey, tabKey){
    console.log('setKeys')
    this.panelKey = panelKey
    this.tabKey = tabKey
  }

  getChromeWindowBoundArray(width, height){
    console.log('getChromeWindowBoundArray')
    return [- BrowserPanel.sideMargin, - 27, width + BrowserPanel.sideMargin * 2, height + 27 + 8]
  }

  setBounds(bounds, noMove){
    console.log('setBounds')
    console.log(22233, bounds)
    if(this.minimized){
      this.nativeWindow.showWindow(9)
      this.minimized = false
    }

    if (bounds.width) {
      if(Browser.CUSTOM_CHROMIUM && isWin10){
        // bounds.width = bounds.width + 16
        bounds.height = bounds.height + 28
      }
      this._bounds = bounds
      const pagePromise = Browser._pagePromises[PopupPanel.tabId]
      if(!Browser.CUSTOM_CHROMIUM) pagePromise.then(page=>page.setViewport({width: Math.round(bounds.width), height: Math.round(bounds.height)}))
    }

    if (bounds.width) {
      DpiUtils.move(this.nativeWindow,bounds.x, bounds.y, bounds.width, bounds.height)
      if(!Browser.CUSTOM_CHROMIUM) {
        DpiUtils.moveForChildWindow(this.chromeNativeWindow, ...this.getChromeWindowBoundArray(bounds.width, bounds.height), bounds.x, bounds.y)
      }

      if(!noMove && this.panelKey){
        clearTimeout(this.alwaysOnTopTimer)
        this.alwaysOnTopTimer = setTimeout(()=>this.panelKey && this.nativeWindow.setWindowPos(winctl.HWND.NOTOPMOST, 0, 0, 0, 0, 83),1000)
        this.nativeWindow.setWindowPos(winctl.HWND.TOPMOST, 0, 0, 0, 0, 83)
      }
    }
    else {
      this._bounds.x = bounds.x
      this._bounds.y = bounds.y
      ;(async ()=>{
        const dim = await DpiUtils.dimensions(this.nativeWindow)
        DpiUtils.move(this.nativeWindow,bounds.x, bounds.y, dim.right - dim.left, dim.bottom - dim.top)
      })()
    }
  }

  getBounds(){
    console.log('setBounds')
    return this._bounds
  }

  hide(panelKey, tabKey){
    console.log('hide')
    if(panelKey != this.panelKey || tabKey != this.tabKey) return

    this.setKeys(null, null)
    this.loadURL('chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/popup_prepare.html')
    this.nativeWindow.showWindow(0)
    // this.nativeWindow.showWindow(6)
    this.minimized = true
  }

  moveTop(){
    console.log('moveTop')
    if (!this.panelKey ||
      BrowserPanel.getBrowserPanel(this.panelKey).browserWindow.disableFocus) return

    this.nativeWindow.moveTop()
  }

  setActiveCurrentTab(){
    console.log('setActiveCurrentTab')
    const panel = BrowserPanel.getBrowserPanel(this.panelKey)
    return panel.getBrowserView({tabKey: this.tabKey}).webContents.focus()
  }

  async loadURL(url){
    if (!this.panelKey) return
    console.log('loadURL')
    this.moveTop()


    const page = await (Browser._pagePromises[PopupPanel.tabId])
    page.goto(url)

    // Browser.bg.evaluate((tabId, url) => {
    //   return new Promise(resolve => {
    //     chrome.tabs.update(tabId, {url}, tab => resolve(tab))
    //   })
    // }, PopupPanel.tabId, url)
  }

  async executeJavaScript(code, userGesture, callback, retry){
    if (!this.panelKey) return
    console.log('executeJavaScript')
    if(retry == null){
      if(typeof userGesture === 'function') [userGesture, callback, retry] = [null, userGesture, callback]
      if(retry == null) retry = 0
    }
    else{
      if(typeof userGesture === 'function') [userGesture, callback] = [null, userGesture]
    }
    const page = await (Browser._pagePromises[PopupPanel.tabId])
    // console.log(331,code)
    try{
      const value = await page.evaluate(code)
      callback && callback(value)
      return value
    }catch(e){
      // console.log(333,reason)
      if(retry < 10){
        setTimeout(()=>this.executeJavaScript(code, userGesture, callback, retry+1),200)
      }
      else if(callback){
        callback(null)
      }
    }
  }

}

PopupPanel.instance = {}

class BackgroundPage{
  constructor(extensionId){
    this.id = extensionId
  }

  send(channel, ...args){
    Browser.bg.evaluate((channel, ...args) => {
      if(window.ipcRenderer.events[channel]) window.ipcRenderer.events[channel]({},...args)
    }, channel, ...args)
  }

  isDestroyed(){
    return false
  }
}

function removeBom(x){
  return x.charCodeAt(0) === 0xFEFF ? x.slice(1) : x
}

export default {
  Browser,
  BrowserPanel,
  BrowserView,
  webContents,
  PopupPanel
}