import path from 'path'
import fs from 'fs'
import os from 'os'
import puppeteer from '../../resource/puppeteer'
import {EventEmitter} from 'events'
import extensionServer from './extensionServer'
import emptyPort from './emptyPort'
import robot from 'robotjs'
import winctl from '../../resource/winctl'
import {app, BrowserWindow, ipcMain, nativeImage, webContents as _webContents} from 'electron'
import mainState from '../mainState'
import util from 'util'
import {exec as _exec} from 'child_process'
import PubSub from "../render/pubsub"
import sharedState from '../sharedStateMain'
import extInfos from '../extensionInfos'
import backgroundPageModify from './backgroundPageModify'


import hjson from 'hjson'

const exec = util.promisify(_exec);

const evem = new EventEmitter()
evem.setMaxListeners(0)

const isWin = process.platform == 'win32'
const isLinux = process.platform === 'linux'

class Browser{
  static setUserDataDir(userDataDir){
    this.userDataDir = userDataDir
  }

  static async _initializer(){
    if(this._browser != null) return

    let executablePath
    if(fs.existsSync(executablePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe')){}
    else if(fs.existsSync(executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')){}
    else if(fs.existsSync(executablePath = path.join(app.getPath('home'),'AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'))){}
    else{}

    this._browser = await puppeteer.launch({
      ignoreDefaultArgs: true,
      defaultViewport: null,
      executablePath,
      args: [
        // '--no-first-run',
        //    '--enable-automation',
        '--metrics-recording-only',
        '--disable-infobars',
        // '--enable-prompt-on-repost',
        // '--disable-breakpad',
        '--remote-debugging-pipe',
        // '--silent-debugger-extension-api',
        '--disable-default-apps',
        '--disable-features=site-per-process',
        `--user-data-dir=${this.userDataDir}`,
        // `--lang=en`,
        `--load-extension=${path.resolve(__dirname, '../../resource/extension/default/1.0_0/').replace(/app.asar([\/\\])/,'app.asar.unpacked$1')}`,
        'about:blank'
      ]})

    this.listeners = {}
    this._pagePromises = {}

    await this.initBgPage()

    this.initExtension()

    await this.initTargetCreated()

    await this.backGroundPageObserve()

    this.startObserve()

    this.onResize()

    ipcMain.on('move-window', browserWindowId => {
      for(const browserPanel of Object.values(BrowserPanel.panelKeys)){
        if(browserPanel.browserWindow && browserPanel.browserWindow.id == browserWindowId){
          ipcMain.emit('set-position-browser-view', {sender: browserPanel.browserWindow.webContents}, browserPanel.panelKey)
        }
      }
    })

    ipcMain.on('state-change-window', (browserWindowId, eventName) => {
      for(const browserPanel of Object.values(BrowserPanel.panelKeys)){
        if(browserPanel.browserWindow && browserPanel.browserWindow.id == browserWindowId){
          if(eventName == 'focus'){
            browserPanel.cpWin.nativeWindow.setWindowPos(winctl.HWND.TOPMOST,0,0,0,0,83)
            browserPanel.cpWin.nativeWindow.setWindowPos(winctl.HWND.NOTOPMOST,0,0,0,0,83)
            browserPanel.cpWin.nativeWindowBw.setWindowPos(winctl.HWND.TOPMOST,0,0,0,0,83)
            browserPanel.cpWin.nativeWindowBw.setWindowPos(winctl.HWND.NOTOPMOST,0,0,0,0,83)
          }
          else if(eventName == 'minimize'){
            browserPanel.cpWin.nativeWindow.showWindow(6)
          }
          else if(eventName == 'restore'){
            browserPanel.cpWin.nativeWindow.showWindow(9)
          }
        }
      }
    })

    ipcMain.on('tab-moved', (e, {tabId,fromIndex,toIndex,before}) => {
      const [panelKey, tabKey, browserPanel, browserView] = BrowserPanel.getBrowserPanelByTabId(tabId)
      BrowserPanel.moveTabs([tabId], panelKey, {index: toIndex, tabKey})
    })

    ipcMain.on('top-to-browser-window', bwWinId => {
      for(const browserPanel of Object.values(BrowserPanel.panelKeys)){
        if(browserPanel.browserWindow.id == bwWinId){
          if(winctl.GetActiveWindow().getHwnd() == browserPanel.cpWin.nativeWindow.getHwnd()){
            browserPanel.cpWin.nativeWindowBw.setWindowPos(winctl.HWND.TOPMOST,0,0,0,0,83)
            browserPanel.cpWin.nativeWindowBw.setWindowPos(winctl.HWND.NOTOPMOST,0,0,0,0,83)
          }
          return
        }
      }
    })

    ipcMain.on('fullscreen-change', async (e, enabled) => {
      console.log('fullscreen-change', e, enabled)
      const [_1, _2, browserPanel, _3] = BrowserPanel.getBrowserPanelByTabId(e.sender.id)
      if(enabled){
        browserPanel.cpWin.chromeNativeWindow.setParent(null)
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
      else{
        browserPanel.cpWin.chromeNativeWindow.setParent(browserPanel.cpWin.nativeWindow.getHwnd())
        const dim = browserPanel.cpWin.nativeWindow.dimensions()
        browserPanel.cpWin.chromeNativeWindow.move(...getChromeWindowBoundArray(dim.right - dim.left, dim.bottom - dim.top))
      }
    })

    ipcMain.on('get-access-key-and-port', e => {
      e.sender.send('get-access-key-and-port-reply', [this.serverKey, this.port])
    })

    this.addListener('webNavigation', 'onCompleted', details=>{
      evem.emit(`webNavigation-onCompleted_${details.tabId}`, details.frameId)
    })

    this.addListener('webNavigation', 'onCommitted', details=>{
      evem.emit(`webNavigation-onCommitted_${details.tabId}`, details)
    }, details => details.transitionQualifiers.find(x=>x.endsWith('_redirect')))

    this.addListener('webNavigation', 'onErrorOccurred', details=>{
      // console.log(`webNavigation-onErrorOccurred_${details.tabId}`, details)
    })

    this.addListener('tabs', 'onCreated', tab=>{
      if(webContents.webContentsMap && webContents.webContentsMap.has(tab.id)) return
      const cont = new webContents(tab.id)
      BrowserView.newTab(cont, tab)
    })

    this.addListener('tabs', 'onMoved', (tabId, {windowId, fromIndex, toIndex})=>{
      // const cont = new webContents(tabId)
      // BrowserView.movedTab(cont, windowId, fromIndex, toIndex)
      BrowserPanel.MovedTabs(tabId, {windowId, fromIndex, toIndex})
    })

    this.addListener('tabs', 'onAttached', (tabId, {newWindowId, newPosition})=>{
      // const cont = new webContents(tabId)
      // BrowserView.movedTab(cont, newWindowId, null, newPosition)
      // const [panelKey, tabKey, panel, bv] = BrowserPanel.getBrowserPanelByTabId(tabId)
      // BrowserPanel.moveTabs([tabId], panelKey, {index: newPosition, tabKey}, void 0, false)
    })

    this.addListener('tabs', 'onUpdated', (tabId, changeInfo, tab)=>{
      evem.emit(`tabs-onUpdated_${tabId}`, changeInfo)
      const cont = webContents.fromId(tabId)
      changeInfo.url = void 0
      if(cont && cont.hostWebContents2) cont.hostWebContents2.send('chrome-tabs-event',{tabId, changeInfo}, 'updated')
    })

    this.addListener('tabs', 'onActivated', (activeInfo)=>{
      const cont = webContents.fromId(activeInfo.tabId)
      // console.log(activeInfo, cont.hostWebContents2)
      if(cont && cont.hostWebContents2) cont.hostWebContents2.send('chrome-tabs-event',{tabId: activeInfo.tabId, changeInfo: {active: true}}, 'updated')
    })

    this.addListener('tabs', 'onRemoved', removedTabId => {
      evem.emit(`close-tab_${removedTabId}`)
      const cont = webContents.fromId(removedTabId)
      if(cont && cont.hostWebContents2) cont.hostWebContents2.send('chrome-tabs-event',{tabId: removedTabId}, 'removed')

      for(const [panelKey, browserPanel] of Object.entries(BrowserPanel.panelKeys)){
        for(const [tabKey, [tabId, browserView]] of Object.entries(browserPanel.tabKeys)){
          console.log(99977,browserView)
          if(tabId != removedTabId) continue
          if(!browserView.isDestroyed()) browserView.destroy()
          if(!Object.keys(browserPanel.tabKeys).length){
            delete BrowserPanel.panelKeys[panelKey]
            browserPanel.cpWin.nativeWindow.destroyWindow()
          }
          return
        }
      }
    })

    // this.addListener('windows', 'onCreated', window => {
    //   console.log(9992,window)
    //   for(const tab of window.tabs){
    //     if(webContents.webContentsMap && webContents.webContentsMap.has(tab.id)) continue
    //     const cont = new webContents(tab.id)
    //     BrowserView.newTab(cont)
    //   }
    // }, void 0, (window) => new Promise(r=> chrome.windows.get(window.id, {populate: true}, window => r([window]))))

    this.addListener('windows', 'onRemoved', removedWinId => {
      for(const [panelKey, browserPanel] of Object.entries(BrowserPanel.panelKeys)){
        if(browserPanel.windowId == removedWinId){
          browserPanel.destroy()
          return
        }
      }
    })

    evem.on('ipc.send', (channel, tabId, ...args)=>{
      // console.log(channel, tabId)
      ipcMain.emit(channel, {sender: Number.isInteger(tabId) ? new webContents(tabId): new BackgroundPage(tabId)}, ...args)
    })
  }

  static close(){
    this._browser.close()
    this.closed = true
  }

  static initExtension(){
    require('./browser/browser-action-main')
    require('./browser/commands-main')
    require('./browser/context-menus-main')
  }

  static startObserve(){
    // let prevMousePos = {},  prevStates = {}
    // setInterval(()=>{
    //   const mousePos = screen.getCursorScreenPoint()
    //   if(mousePos.x === prevMousePos.x && mousePos.y === prevMousePos.y) return
    //   prevMousePos = mousePos
    //
    //   for(let win of BrowserWindow.getAllWindows()){
    //     if(win.forceNotIgnoreMouse) continue
    //     const bounds = win.getBounds()
    //     const out = (mousePos.x < bounds.x ||	mousePos.x > bounds.x + bounds.width
    //       ||	mousePos.y < bounds.y ||	mousePos.y > bounds.y + bounds.height)
    //
    //     const realPos = { x: mousePos.x - bounds.x, y: mousePos.y - bounds.y }
    //
    //
    //     if(realPos.x < 4 || realPos.y < 4 || bounds.width - realPos.x < 4  || bounds.height - realPos.y < 4){
    //       // console.log(bounds, mousePos, realPos)
    //
    //       win.setIgnoreMouseEvents(false)
    //       win.ignoreMouseEvents = false
    //       prevStates[win.id] = 'out'
    //       continue
    //     }
    //
    //     if(out){
    //       if(prevStates[win.id] == 'in') {
    //         win.setIgnoreMouseEvents(false)
    //         win.ignoreMouseEvents = false
    //       }
    //       prevStates[win.id] = 'out'
    //       continue
    //     }
    //
    //     win.webContents.executeJavaScript(`var _ce_ = document.elementFromPoint(${realPos.x}, ${realPos.y}); _ce_ && _ce_.className`,(result)=>{
    //       if(result == 'browser-page'){
    //         if(prevStates[win.id] == 'out') {
    //           win.setIgnoreMouseEvents(true)
    //           win.ignoreMouseEvents = true
    //         }
    //         prevStates[win.id] = 'in'
    //       }
    //       else{
    //         if(prevStates[win.id] == 'in') {
    //           win.setIgnoreMouseEvents(false)
    //           win.ignoreMouseEvents = false
    //         }
    //         prevStates[win.id] = 'out'
    //       }
    //     })
    //   }
    // },20)
  }

  static async modifyBackgroundPage(bgPage){
    await bgPage.evaluateOnNewDocument(backgroundPageModify, this.port, this.serverKey)
    await bgPage.reload()
  }

  static async backGroundPageObserve(){
    for(const target of this._browser.targets()){
      if(target.type() != 'background_page') continue

      const bgPage = await target.page()
      if(this.cachedBgTarget.has(target._targetId)) continue

      await this.modifyBackgroundPage(bgPage)
      this.cachedBgTarget.set(target._targetId, [target, bgPage])
    }
    setTimeout(()=>this.backGroundPageObserve(),5000)
  }

  static onResize(){
    this.bg.evaluate((api, method, serverKey, port) => {
      const cache = {}
      let preFocused = -1
      setInterval(async ()=>{
        let focused
        chrome.windows.getAll(windows => {
          for(const window of windows){
            if(window.focused){
              focused = window.id
              if(preFocused != window.id){
                preFocused = focused
                fetch(`http://localhost:${port}?key=${serverKey}&data=${encodeURIComponent(JSON.stringify({api, method: 'focusChanged', result: [focused]}))}`)
              }
            }

            const preWindow = cache[window.id]
            if(preWindow){
              if((window.left != preWindow.left || window.top != preWindow.top || window.width != preWindow.width || window.height != preWindow.height)
                && window.width != 0 && preWindow.width != 0){
                console.log(port, serverKey, api,method,window)
                // chrome.tabs.query({active:true,windowId: window.id}, tabs => {
                fetch(`http://localhost:${port}?key=${serverKey}&data=${encodeURIComponent(JSON.stringify({api, method, result: [{
                    id: window.id,
                    x: window.left - preWindow.left,
                    y: window.top - preWindow.top,
                    width: window.width - preWindow.width,
                    height: window.height - preWindow.height,
                    // topMargin: window.height - tabs[0].height - 8,
                    // sideMargin: (window.width - tabs[0].width) / 2
                  }
                  ]}))}`)
                // })
              }
            }
            cache[window.id] = {left: window.left, top: window.top, width: window.width, height: window.height}
          }
          if(!focused && preFocused != -1){
            preFocused = -1
            fetch(`http://localhost:${port}?key=${serverKey}&data=${encodeURIComponent(JSON.stringify({api, method: 'focusChanged', result: [preFocused]}))}`)
          }
        })
      },50)

    }, 'windows', 'resize', this.serverKey, this.port)

    // evem.on('windows.resize', window => {
    //   BrowserPanel.topMargin = window.topMargin
    //   BrowserPanel.sideMargin = window.sideMargin
    // })

    // evem.on('windows.resize', window => {
    //   const panel = BrowserPanel.getBrowserPanelByWindowId(window.id)
    //   console.log({
    //     x: window.x,
    //     y: window.y,
    //     width: window.width,
    //     height: window.height,
    //   })
    //   const bounds = panel.browserWindow.getBounds()
    //   panel.browserWindow.setBounds({
    //     x: bounds.x + window.x,
    //     y: bounds.y + window.y,
    //     width: bounds.width + window.width,
    //     height: bounds.height + window.height
    //   })
    // })
    //
    evem.on('windows.focusChanged', async windowId => {
      console.log(windowId)
      // if(windowId == -1){
      //   console.log('onFocusChanged', windowId, new Date().getTime())
      //   const focusedWinId = (await exec(`wmctrl -v -a :ACTIVE: 2>&1`)).stdout.match(/: *(0x[0-9a-f]+)/)[1]
      //   const allBw = BrowserWindow.getAllWindows()
      //   if(!allBw.some(bw => bw.isFocused())){
      //     for(const bw of allBw){
      //       if(bw.isAlwaysOnTop()){
      //         console.log('bw.setAlwaysOnTop(false)')
      //         console.log('bw.focus()')
      //         bw.tmpFocus = ()=> exec(`wmctrl -vi -a ${focusedWinId}`)
      //         bw.setAlwaysOnTop(false)
      //         setTimeout(()=>bw.focus(),0)
      //
      //       }
      //     }
      //   }
      //
      //   return
      // }
      for(const browserPanel of Object.values(BrowserPanel.panelKeys)){
        if(browserPanel.windowId == windowId){
          browserPanel.cpWin.nativeWindowBw.setWindowPos(winctl.HWND.TOPMOST,0,0,0,0,83)
          browserPanel.cpWin.nativeWindow.setWindowPos(winctl.HWND.TOPMOST,0,0,0,0,83)
          browserPanel.cpWin.nativeWindowBw.setWindowPos(winctl.HWND.NOTOPMOST,0,0,0,0,83)
          browserPanel.cpWin.nativeWindow.setWindowPos(winctl.HWND.NOTOPMOST,0,0,0,0,83)
          return
        }
      }
    })
  }

  static async initBgPage() {
    await new Promise(r => {
      emptyPort((err, ports) => {
        this.serverKey = Math.random().toString()
        this.port = ports[0]
        extensionServer(this.port, this.serverKey, d => evem.emit(`${d.api}.${d.method}`, ...d.result))
        r()
      }, 1)
    })


    let bgTarget = await this._browser.targets().find(t => t.url().includes('dckpbojndfoinamcdamhkjhnjnmjkfjd'))
    if (!bgTarget) {
      for (let i = 0; i < 1000; i++) {
        bgTarget = await new Promise(r => {
          setTimeout(async () => {
            r(await this._browser.targets().find(t => t.url().includes('dckpbojndfoinamcdamhkjhnjnmjkfjd')))
          }, 10)
        })
        if (bgTarget) break
      }
    }
    this.bg = await bgTarget.page()

    this.cachedBgTarget = new Map([[bgTarget._targetId,[bgTarget, this.bg]]])
    await this.modifyBackgroundPage(this.bg)

    const extensions = await this.getExtensionInfo()
    extensions.forEach(e => extInfos.setInfo(e))
    for(let win of BrowserWindow.getAllWindows().filter(w=>w.getTitle().includes('Sushi Browser'))){
      if(!win.webContents.isDestroyed()){
        for(const installInfo of extensions){
          win.webContents.send('extension-ready',{[installInfo.id]:{...installInfo}})
        }
      }
    }

    this.bg.evaluate((serverKey, port) => {
      window.ipcRenderer = {
        port,
        serverKey,
        events: window.ipcRenderer ? window.ipcRenderer.events : {},
        send(channel, ...args) {
          fetch(`http://localhost:${this.port}?key=${this.serverKey}&data=${encodeURIComponent(JSON.stringify({
            api: 'ipc',
            method: 'send',
            result: [channel, chrome.runtime.id, ...args]
          }))}`)
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
      chrome.runtime.onMessage.addListener((message, sender) => {
        if (!message.ipcToBg) return
        fetch(`http://localhost:${window.ipcRenderer.port}?key=${window.ipcRenderer.serverKey}&data=${encodeURIComponent(JSON.stringify({
          api: 'ipc',
          method: 'send',
          result: [message.channel, sender.tab.id, ...message.args]
        }))}`)
      })


    }, this.serverKey, this.port)
  }

  static async initTargetCreated() {
    this._browser.on('targetcreated', async target => {

      if(target.type() == 'background_page'){
        const bgPage = await target.page()
        if(this.cachedBgTarget.has(bgPage._targetId)) return

        await this.modifyBackgroundPage(bgPage)
        this.cachedBgTarget.add(bgPage._targetId)
        return
      }

      if (target.type() != 'page' || target.url().startsWith('chrome-devtools:')) return

      console.log('targetcreated', target.url())

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
        this._pagePromises[tabId] = target.page()
      } else {
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
    evem.on(key, listener)

    if(this.listeners[key]){
      this.listeners[key].push(listener)
      return
    }
    this.listeners[key] = [listener]

    this.bg.evaluate((api, method, serverKey, port, validateFunc, modifyPromisedFunc) => {
      if(!chrome[api] || !chrome[api][method]){
        console.log(`ERROR: ${api}.${method}`)
        return
      }

      if(modifyPromisedFunc) modifyPromisedFunc = Function(modifyPromisedFunc)()

      chrome[api][method].addListener(async (...result) => {
        if(!validateFunc || validateFunc(...result)){
          if(modifyPromisedFunc)  result = await modifyPromisedFunc(...result)
          fetch(`http://localhost:${port}?key=${serverKey}&data=${encodeURIComponent(JSON.stringify({api, method, result}))}`)
        }
      })
    }, api, method, this.serverKey, this.port, validateFunc, modifyPromisedFunc && `return ${modifyPromisedFunc.toString()}`)
  }

  static async getExtensionInfo(){

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

    const {getPath1,getPath2,extensionPath} =　require('../chromeExtensionUtil')
    const result = await this.bg.evaluate(() => {
      return new Promise(resolve => {
        chrome.management.getAll(result => resolve(result.filter(x=>!x.isApp && x.id != 'ghbmnnjooekpmoecnnnilnnbdlolhkhi')))
      })
    })

    const extensions = []
    for(let e of result){
      let extensionPath = getPath2(e.id) || getPath1(e.id)
      extensionPath = extensionPath.replace(/app.asar([\/\\])/,'app.asar.unpacked$1')
      const manifestPath = path.join(extensionPath, 'manifest.json')
      const manifestContents = hjson.parse(removeBom(fs.readFileSync(manifestPath).toString()))
      delete e.icons
      e = {...manifestContents, ...e}
      e.url = e.homepageUrl
      // e.options_page = e.optionsUrl
      e.base_path = extensionPath

      console.log(845677,e)

      const installInfo = {
        id: e.id,
        name: e.name,
        url: e.url,
        base_path: e.base_path,
        manifest: e
      }
      transInfos(installInfo)
      extensions.push(installInfo)

      const commands = installInfo.manifest.commands
      if(commands){
        const plat = os.platform() == 'win32' ? 'windows' : os.platform() == 'darwin' ? 'mac' : 'linux'
        for(let [command,val] of Object.entries(commands)){
          if(val.suggested_key){
            PubSub.publish('add-shortcut',{id:installInfo.id,key:val.suggested_key[plat] || val.suggested_key.default,command})
          }
        }

      }
    }
    return extensions
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

}

class BrowserPanel{
  static async _initializer(){
    if(this.isInit) return
    this.isInit = true
    this.destKeySet = new Set()

    await Browser._initializer()

    this.panelKeys = {}
  }

  static getBrowserPanel(panelKey){
    return this.panelKeys && this.panelKeys[panelKey]
  }

  static getBrowserPanelByTabId(tabId){
    for(const [panelKey, browserPanel] of Object.entries(this.panelKeys)){
      // if(rejectPanelKey && panelKey == rejectPanelKey) continue
      for(const [tabKey, [_tabId, browserView]] of Object.entries(browserPanel.tabKeys)){
        if(tabId == _tabId) return [panelKey, tabKey, browserPanel, browserView]
      }
    }
    return []
  }

  static getAllTabIds(){
    const result = []
    for(const browserPanel of Object.values(this.panelKeys)){
      for(const [tabId, browserView] of Object.values(browserPanel.tabKeys)){
        result.push(tabId)
      }
    }
    return result
  }

  static hasTabId(tabId){
    for(const browserPanel of Object.values(this.panelKeys)){
      for(const [_tabId, browserView] of Object.values(browserPanel.tabKeys)){
        if(tabId == _tabId) return true
      }
    }
    return false
  }

  static getBrowserPanelByWindowId(windowId){
    for(const browserPanel of Object.values(this.panelKeys)){
      if(browserPanel.windowId == windowId) return browserPanel
    }
  }

  static async MovedTabs(tabId, {windowId, fromIndex, toIndex}){

    const [_1, _2, panel, bv] = BrowserPanel.getBrowserPanelByTabId(tabId)
    const browserWindow = panel.browserWindow

    browserWindow.webContents.send('move-tab-from-moved', tabId, toIndex)
  }

  static async moveTabs(moveTabIds, destPanelKey, {index, tabKey}, browserWindow, bounds){
    let browserPanel = this.getBrowserPanel(destPanelKey)

    if(!browserPanel &&　this.destKeySet.has(destPanelKey)){
      await new Promise(r=>setTimeout(r,500))
      browserPanel = this.getBrowserPanel(destPanelKey)
    }
    this.destKeySet.add(destPanelKey)

    console.log(index,2222)

    if(browserPanel){
      // if(index == null){
      //   const tabId = browserPanel.tabKeys[tabKey][0]
      //   const tab = await Browser.bg.evaluate((tabId) => {
      //     return new Promise(resolve => {
      //       chrome.tabs.get(tabId, tab => resolve(tab))
      //     })
      //   }, tabId)
      //   index = tab.index
      // }
      for(let tabId of moveTabIds){
        const [_1, _2, panel, bv] = BrowserPanel.getBrowserPanelByTabId(tabId)
        if(destPanelKey != panel.panelKey) bv.webContents.hostWebContents2.send('chrome-tabs-event',{tabId, changeInfo: {panelKey:panel.panelKey}}, 'removed')
        bv.destroy(false)
      }
      const tabs = await Browser.bg.evaluate((tabIds, moveProperties) => {
        return new Promise(resolve => {
          chrome.tabs.move(tabIds, moveProperties, tabs => resolve(tabs))
        })
      }, moveTabIds, {windowId: browserPanel.windowId, index})

      for(let tabId of moveTabIds) {
        browserPanel.attachBrowserView(tabId, tabKey)
      }
    }
    else{
      if(!browserWindow){
        const [_1, _2, panel, bv] = BrowserPanel.getBrowserPanelByTabId(moveTabIds[0])
        browserWindow = panel.browserWindow
      }
      console.log(2223)
      const [_1, _2, panel, bv] = BrowserPanel.getBrowserPanelByTabId(moveTabIds[0])
      if(destPanelKey != panel.panelKey) bv.webContents.hostWebContents2.send('chrome-tabs-event',{tabId: moveTabIds[0], changeInfo: {panelKey:panel.panelKey}}, 'removed')
      bv.destroy(false)
      console.log(2224)
      const destPanel = await new BrowserPanel({ browserWindow, panelKey: destPanelKey, tabKey, tabId: moveTabIds[0], bounds })
      console.log(2225)

      if(moveTabIds.length > 1){
        for(let tabId of moveTabIds.slice(1)){
          const [_1, _2, panel, bv] = BrowserPanel.getBrowserPanelByTabId(tabId, destPanelKey)
          if(destPanelKey != panel.panelKey) bv.webContents.hostWebContents2.send('chrome-tabs-event',{tabId, changeInfo: {panelKey:panel.panelKey}}, 'removed')
          bv.destroy(false)
        }
        const tabs = await Browser.bg.evaluate((tabIds, moveProperties) => {
          return new Promise(resolve => {
            chrome.tabs.move(tabIds, moveProperties, tabs => resolve(tabs))
          })
        }, moveTabIds.slice(1), {windowId: browserPanel.windowId, index: 1})
      }
    }
  }

  constructor({browserWindow, panelKey, tabKey, webContents, windowId, url, tabId, bounds}) {
    console.log(999777,{panelKey, tabKey, windowId, url, tabId, browserWindow: browserWindow && browserWindow.id, bounds})
    return (async ()=>{
      await BrowserPanel._initializer()

      if(panelKey){
        this.browserWindow = browserWindow
        this.browserWindow.once('closed', ()=>this.destroy())
        let win
        if(tabId){
          win = await Browser.bg.evaluate((tabId, bounds, sideMargin, topMargin) => {
            return new Promise(resolve => {
              const createData = bounds ? {tabId, left: bounds.x - sideMargin, top: bounds.y - topMargin,
                width: bounds.width + sideMargin * 2, height: bounds.height + topMargin + 8} : {tabId}
              chrome.windows.create(createData, window => resolve(window))
            })
          }, tabId, bounds, BrowserPanel.sideMargin, BrowserPanel.topMargin)
        }
        else{
          if(!BrowserPanel._isNotFirst){
            const tmpWin = await Browser.bg.evaluate(() => {
              return new Promise(resolve => {
                chrome.windows.getAll({populate: true}, windows => {
                  const window = windows[0]
                  const tab = window.tabs[0]
                  window.tabWidth = tab.width
                  window.tabHeight = tab.height
                  resolve(window)
                })
              })
            })
            console.log(4343444, tmpWin.width ,tmpWin.tabWidth, tmpWin.height ,tmpWin.tabHeight)
            BrowserPanel.topMargin = tmpWin.height - tmpWin.tabHeight - 8 //- 38
            BrowserPanel.sideMargin = (tmpWin.width - tmpWin.tabWidth) / 2

            let chromeNativeWindow = winctl.GetActiveWindow()
            const dim = chromeNativeWindow.dimensions()
            if(!chromeNativeWindow.getTitle().includes('Google Chrome') || !(tmpWin.left == dim.left && tmpWin.top == dim.top && tmpWin.width == (dim.right - dim.left)  && tmpWin.height == (dim.bottom - dim.top))){
              chromeNativeWindow = (await winctl.FindWindows(win => {
                if(!win.getTitle().includes('Google Chrome')) return false
                const dim = win.dimensions()
                return tmpWin.left == dim.left && tmpWin.top == dim.top && tmpWin.width == (dim.right - dim.left)  && tmpWin.height == (dim.bottom - dim.top)
              }))[0]
            }

            console.log(2243344,chromeNativeWindow.getTitle())
            chromeNativeWindow.setWindowLongPtrEx(0x00000080)

            win = await Browser.bg.evaluate((url, windowId) => {
              return new Promise(resolve => {
                chrome.windows.update(windowId, { state: 'minimized' }, () => {
                  setTimeout(()=>chrome.windows.remove(windowId),5000)
                  chrome.windows.create({url, focused: true}, window => {
                    resolve(window)
                  })
                })
              })
            }, url, tmpWin.id)
            BrowserPanel._isNotFirst = true

          }
          else{
            win = await Browser.bg.evaluate((url, bounds, sideMargin, topMargin) => {
              const createData = bounds ? {url, left: bounds.x - sideMargin, top: bounds.y - topMargin,
                width: bounds.width + sideMargin * 2, height: bounds.height + topMargin + 8} : {url}
              return new Promise(resolve => chrome.windows.create(createData, window => resolve(window)))
            }, url, bounds, BrowserPanel.sideMargin, BrowserPanel.topMargin)
          }
        }

        this.cpWin = await this.createChromeParentWindow(win)

        this.panelKey = panelKey
        this.windowId = win.id
        BrowserPanel.panelKeys[panelKey] = this
        this.tabKeys = {[tabKey]: [win.tabs[0].id, new BrowserView(this, tabKey, win.tabs[0].id)]}

        return this
      }
      else{
        this.windowId = windowId

        const win = await Browser.bg.evaluate((windowId, isNotFirst) => {
          return new Promise(resolve => {
            chrome.windows.get(windowId, {populate: !isNotFirst},window => {
              if(!isNotFirst){
                window.tabWidth = window.tabs[0].width
                window.tabHeight = window.tabs[0].height
              }
              resolve(window)
            })
          })
        }, windowId, BrowserPanel._isNotFirst)


        if(!BrowserPanel._isNotFirst){
          BrowserPanel._isNotFirst = true
          BrowserPanel.topMargin = win.height - win.tabHeight - 8
          BrowserPanel.sideMargin = (win.width - win.tabWidth) / 2
        }

        const x = win.left + BrowserPanel.sideMargin,
          y = win.top + BrowserPanel.topMargin,
          width = win.width,
          height = getWinHeight(win.height)

        const bw = webContents.hostWebContents2 ? BrowserWindow.fromWebContents(webContents.hostWebContents2) :
          require('../util').getCurrentWindow()

        this.browserWindow = await require('../BrowserWindowPlus').load({id:bw.id,
          x, y, width, height, tabParam:JSON.stringify({urls:[{url: void 0, guestInstanceId: webContents && webContents.id}],type: 'new-win'})})
        this.browserWindow.on('closed', ()=>this.destroy())

        this.cpWin = await this.createChromeParentWindow(win)

        return new Promise(r => {
          const key = Math.random().toString()
          const id = webContents.id
          const intervalId = setInterval(()=>this.browserWindow.webContents.send('get-panel-and-tab-info', id, key),10)

          ipcMain.once(`get-panel-and-tab-info-reply_${key}`,async (e, panelKey, tabKey)=>{
            clearInterval(intervalId)
            console.log(`get-panel-and-tab-info-reply_${key}`, panelKey, tabKey)
            this.panelKey = panelKey
            BrowserPanel.panelKeys[panelKey] = this
            this.tabKeys = {[tabKey]: [id, new BrowserView(this, tabKey, id)]}
            const bv = BrowserPanel.getBrowserPanel(panelKey).attachBrowserView(id, tabKey)

            // webContents.hostWebContents2.send('tab-create', {id: newTabId, url: (await webContents.getURLAsync()), openerTabId: tab.openerTabId})

            r([this, this.tabKeys[tabKey][1]])
          })

        })
      }

    })()
  }

  async createChromeParentWindow(cWin){
    let chromeNativeWindow = winctl.GetActiveWindow()
    const dim = chromeNativeWindow.dimensions()
    if(!chromeNativeWindow.getTitle().includes('Google Chrome') || !(cWin.left == dim.left && cWin.top == dim.top && cWin.width == (dim.right - dim.left)  && cWin.height == (dim.bottom - dim.top))){
      chromeNativeWindow = (await winctl.FindWindows(win => {
        if(!win.getTitle().includes('Google Chrome')) return false
        const dim = win.dimensions()
        return cWin.left == dim.left && cWin.top == dim.top && cWin.width == (dim.right - dim.left)  && cWin.height == (dim.bottom - dim.top)
      }))[0]
    }
    chromeNativeWindow.moveRelative(9999,9999,0,0)
    const title = Math.random().toString()
    const _title = this.browserWindow.getTitle()

    this.browserWindow.setTitle(title)
    const nativeWindowBw = await winctl.FindByTitle(title)
    this.browserWindow.setTitle(_title)
    this.browserWindow.nativeWindow = nativeWindowBw

    // const childBrowserWindow = new BrowserWindow({x:0, y:0, width:0, height:0, title,movable:false,  minimizable : false, maximizable: false, closable: false, frame: false, titleBarStyle: 'hidden', autoHideMenuBar: true})
    //
    // const nativeWindow = await winctl.FindByTitle(title)
    // childBrowserWindow.setTitle("tmp")

    const hwnd = nativeWindowBw.createWindow()
    const nativeWindow = (await winctl.FindWindows(win => win.getHwnd() == hwnd))[0]

    // nativeWindow.setParent(nativeWindowBw.getHwnd())
    chromeNativeWindow.setParent(nativeWindow.getHwnd())
    // chromeNativeWindow.move(...getChromeWindowBoundArray(cWin.width, cWin.height))
    chromeNativeWindow.move(...getChromeWindowBoundArray(0,0))
    chromeNativeWindow.setWindowPos(winctl.HWND.TOPMOST,0,0,0,0,83)
    chromeNativeWindow.setWindowPos(winctl.HWND.NOTOPMOST,0,0,0,0,83)


    nativeWindowBw.setWindowLongPtr(0x00040000)

    return {chromeNativeWindow, nativeWindow, nativeWindowBw}
    // return {chromeNativeWindow, nativeWindow, nativeWindowBw, childBrowserWindow}
  }

  destroy(){
    for(const [tabKey, [_tabId, browserView]] of Object.entries(this.tabKeys)){
      browserView.destroy()
    }
    console.log(5555555,Object.keys(this.tabKeys).length)
    if(!Object.keys(this.tabKeys).length){
      delete BrowserPanel.panelKeys[this.panelKey]
      // chromeNativeWindow.setWindowPos(winctl.HWND.BOTTOM,0,0,0,0,83)
      this.cpWin.nativeWindow.destroyWindow()
    }
  }

  removeBrowserView(tabId){
    this.getBrowserView({tabId}).destroy()
  }

  async addBrowserView(tabKey, url, index){
    const tab = await Browser.bg.evaluate((windowId, index, url) => {
      return new Promise(resolve => {
        chrome.tabs.create({windowId, index, url}, tab => resolve(tab))
      })
    }, this.windowId, index, url)
    const bv = new BrowserView(this, tabKey, tab.id)
    this.tabKeys[tabKey] = [tab.id, bv]
    return bv
  }

  attachBrowserView(tabId, tabKey){
    const bv = new BrowserView(this, tabKey, tabId)
    this.tabKeys[tabKey] = [tabId, bv]
    return bv
  }

  getBrowserView({tabId, tabKey}){
    if(tabId){
      const obj = Object.values(this.tabKeys).find(x => x[0] == tabId)
      return obj && obj[1]
    }
    else{
      return this.tabKeys[tabKey] && this.tabKeys[tabKey][1]
    }
  }

  _updateWindow(updateInfo){
    return Browser.bg.evaluate((windowId, updateInfo) => {
      return new Promise(resolve => {
        chrome.windows.update(windowId, updateInfo, window => resolve(window))
      })
    }, this.windowId, updateInfo)
  }

  setAlwaysOnTop(enable){
    this.cpWin.nativeWindow.setWindowPos(enable ? winctl.HWND.TOPMOST : winctl.HWND.NOTOPMOST,0,0,0,0,83)
  }

  setBounds(bounds){
    if(bounds.width){
      this.cpWin.nativeWindow.move(bounds.x, bounds.y, bounds.width, bounds.height)
      this.cpWin.chromeNativeWindow.move(...getChromeWindowBoundArray(bounds.width, bounds.height))
    }
    else{
      const dim = this.cpWin.nativeWindow.dimensions()
      this.cpWin.nativeWindow.move(bounds.x, bounds.y, dim.right - dim.left, dim.bottom - dim.top)
    }
    // this._updateWindow({
    //   left: bounds.x ? bounds.x : void 0,
    //   top: bounds.y ? bounds.y - BrowserPanel.topMargin : void 0,
    //   width: bounds.width ? bounds.width : void 0,
    //   height: bounds.height ? bounds.height + BrowserPanel.topMargin: void 0,
    //   focused: bounds.zIndex > 0 ? true : void 0,
    //   state: 'normal'
    // })
  }

  // async getTabs(queryInfo){
  //   const tabs = await Browser.bg.evaluate((windowId, queryInfo) => {
  //     return new Promise(resolve => {
  //       chrome.tabs.query({windowId, ...queryInfo}, tabs => resolve(tabs))
  //     })
  //   }, this.windowId, queryInfo)
  //   return tabs.map(t =>Object.entries(this.tabKeys).find(x=>x[1][0] == t.id)[1][1])
  // }

}

class BrowserView{

  static _initializer() {
    if (this.isInit) return
    this.isInit = true

    this.webContentsMap = new Map()
  }

  static async createNewTab(browserWindow, panelKey, tabKey, tabIndex, url, alwaysOnTop){
    // console.log('createNewTab',(panelKey, tabKey, tabIndex, url))
    if(panelKey){
      const panel = BrowserPanel.getBrowserPanel(panelKey)
      if(panel){
        if(alwaysOnTop) panel.setAlwaysOnTop(true)
        return panel.addBrowserView(tabKey, url, tabIndex)
      }
      else{
        const panel = await new BrowserPanel({browserWindow, panelKey, tabKey, url})
        if(alwaysOnTop) panel.setAlwaysOnTop(true)
        return panel.tabKeys[tabKey][1]
      }
    }
  }

  static async newTab(cont, tab){
    if(tab && tab.openerTabId && !BrowserPanel.hasTabId(tab.openerTabId)){
      await new Promise(r=>setTimeout(r,20))
      return await this.newTab(cont, tab)
    }
    if(this.newTabCreateing){
      await new Promise(r=>setTimeout(r,20))
      console.log(999,cont.id)
      return await this.newTab(cont, tab)
    }
    // console.log('newTab', cont)
    // if(!cont.hostWebContents2) return

    let [_1, _2, panel, bv] = BrowserPanel.getBrowserPanelByTabId(cont.id)
    if(bv) return bv
    console.log(44445, cont.id)

    this.newTabCreateing = true

    const id = cont.id
    let currentTab
    if(tab){
      currentTab = await Browser.bg.evaluate((tabId, validIds, windowId) => {
        return new Promise(resolve => {
          chrome.tabs.query({windowId}, tabs => {
            for(let i = tabs.length - 1;i>=0;i--){
              if(validIds.includes(tabs[i].id)) return resolve(tabs[i])
            }
            resolve(tabs[0])
          })
        })
      }, id, BrowserPanel.getAllTabIds(), tab.windowId)
    }
    else{
      [tab, currentTab] = await Browser.bg.evaluate((tabId, validIds) => {
        return new Promise(resolve => {
          chrome.tabs.get(tabId, tab => {
            chrome.tabs.query({windowId: tab.windowId}, tabs => {
              for(let i = tabs.length - 1;i>=0;i--){
                if(validIds.includes(tabs[i].id)) return resolve([tab, tabs[i]])
              }
              resolve([tab, tabs[0]])
            })
          })
        })
      }, id, BrowserPanel.getAllTabIds())
    }

    console.log(2233,tab, currentTab)

    panel = BrowserPanel.getBrowserPanelByWindowId(tab.windowId)
    if(!panel){
      await new Promise(r=>setTimeout(r,30))
      panel = BrowserPanel.getBrowserPanelByWindowId(tab.windowId)
    }
    if(panel){
      const bv = panel.getBrowserView({tabId: tab.id})
      // console.log(77777,bv)
      if(bv){
        this.newTabCreateing = false
        return bv
      }

      console.log(444451)
      return new Promise(r => {

        const closingFunc = ()=>{
          this.newTabCreateing = false
          ipcMain.removeListener('create-web-contents-reply',func)
        }
        evem.once(`close-tab_${id}`,closingFunc)

        const func = async (e, newTabId, panelKey, tabKey, tabIds)=>{
          console.log('create-web-contents-reply',[id,newTabId], tabIds)
          if(tabIds.includes(id)){

            const data = [id, new BrowserView(panel, tabKey, id)]
            panel.tabKeys[tabKey] = data

            // let panel = BrowserPanel.getBrowserPanel(panelKey), bv
            // if(panel){
            //   panel.tabKeys[tabKey] = [id, new BrowserView(panel, tabKey, id)]
            //   bv = panel.attachBrowserView(id, tabKey)
            // }
            // else{
            //   [panel, bv] = await new BrowserPanel({webContents, windowId: tab.windowId})
            // }

            // BrowserPanel.getBrowserPanel(panelKey).attachBrowserView(tab.id, tabKey)
            panel.browserWindow.webContents.send('tab-create', {id: newTabId, url: (await cont.getURLAsync()), openerTabId: tab.openerTabId})

            r(data[1])

            this.newTabCreateing = false
            evem.removeListener(`close-tab_${id}`,closingFunc)
            ipcMain.removeListener('create-web-contents-reply',func)
          }
        }
        ipcMain.on('create-web-contents-reply',func)


        const disposition = !mainState.alwaysOpenLinkBackground && tab.active ? 'foreground-tab' : 'background-tab'
        console.log(444453,panel.browserWindow.webContents.getURL(), id)
        panel.browserWindow.webContents.send('create-web-contents', { id: tab.openerTabId || currentTab.id,  targetUrl: tab.url, disposition, guestInstanceId: id})
      })
    }
    else{
      console.log(444452)
      this.newTabCreateing = false
      const [panel, bv] = await new BrowserPanel({webContents: cont, windowId: tab.windowId})
      return bv
    }

  }

  static async movedTab(cont, windowId, fromIndex, toIndex){ //@TODO NEED FIX
    if(!cont.hostWebContents2) return

    let [_1, _2, panel, bv] = BrowserPanel.getBrowserPanelByTabId(cont.id)

    const toPanel = BrowserPanel.getBrowserPanelByWindowId(windowId)
    if(!toPanel){
      if(panel) panel.removeBrowserView(cont.id)

      const [_, bv] = await new BrowserPanel({webContents: cont, windowId})
      return bv
    }
    else{
      const id = cont.id
      await new Promise(async r => {
        const func = (e, newTabId, panelKey, tabKey, tabIds)=>{
          console.log('create-web-contents-reply',[id,newTabId], tabIds)
          if(tabIds.includes(id)){
            r()
            ipcMain.removeListener('create-web-contents-reply',func)
          }
        }
        ipcMain.on('create-web-contents-reply',func)

        cont.hostWebContents2.send('create-web-contents', { id,  disposition, guestInstanceId: id})
      })

      cont.hostWebContents2.send('chrome-tabs-event',{tabId: id}, 'removed')
    }
  }

  static getAllViews(){
    return [...this.webContentsMap.values()]
  }

  static fromWebContents(webContents){
    return this.webContentsMap.get(webContents)
  }

  constructor(_browserPanel, tabKey, tabId) {
    BrowserView._initializer()

    this._browserPanel = _browserPanel
    this.tabKey = tabKey

    this.webContents = new webContents(tabId)
    this.newTabHandler()
    BrowserView.webContentsMap.set(this.webContents, this)
  }

  newTabHandler(){
    const tabId = this.webContents.id
    sharedState[tabId] = this.webContents

    console.log('newTabHandler', this.webContents.id)

    let win
    for(let w of BrowserWindow.getAllWindows()){
      console.log(1222,w.getTitle())
      if(w.getTitle().includes('Sushi Browser')){
        if(!win) win = w
        PubSub.publish("web-contents-created",[tabId,w.webContents])
      }
    }

    this.webContents.on('media-started-playing', (e) => {
      mainState.mediaPlaying[tabId] = true
      for(let win of BrowserWindow.getAllWindows()) {
        if(win.getTitle().includes('Sushi Browser')){
          if(!win.webContents.isDestroyed()) win.webContents.send('update-media-playing',tabId,true)
        }
      }
    })

    this.webContents.on('media-paused', (e) => {
      delete mainState.mediaPlaying[tabId]
      for(let win of BrowserWindow.getAllWindows()) {
        if(win.getTitle().includes('Sushi Browser')){
          if(!win.webContents.isDestroyed()) win.webContents.send('update-media-playing',tabId,false)
        }
      }
    })

    this.webContents.on('close', () => {
      delete sharedState[tabId]
      // tab.forceClose()
    })
  }

  setBrowserPanel(browserPanel){
    this._browserPanel = browserPanel
  }

  isDestroyed(){
    return !!this.destroyed
  }

  destroy(webContentsDestroy = true){
    delete this._browserPanel.tabKeys[this.tabKey]
    this.destroyed = true
    for(const [cont, view] of BrowserView.webContentsMap.entries()){
      if(view == this){
        BrowserView.webContentsMap.delete(cont)
        if(webContentsDestroy && !this.webContents.isDestroyed()) this.webContents.destroy()
        return
      }
    }
  }

  setBounds(bounds){
    this._browserPanel.setBounds(bounds)
  }
}

class webContents extends EventEmitter {

  static _initializer() {
    if (this.isInit) return
    this.isInit = true

    this.webContentsMap = new Map()
  }

  static getAllWebContents(){
    return [...this.webContentsMap.values(), ..._webContents.getAllWebContents()]
  }

  static async getFocusedWebContents(){
    const hostCont = await _webContents.getFocusedWebContents()
    if(hostCont) return hostCont
    const tab = await Browser.bg.evaluate(() => {
      return new Promise(resolve => {
        chrome.windows.getLastFocused({populate: true}, window => resolve(window.tabs.find(t=>t.active)))
      })
    })

    return this.webContentsMap.get(tab.id)
  }

  static fromId(id){
    return this.webContentsMap.get(id) || _webContents.fromId(id)
  }

  constructor(tabId) {
    super()
    webContents._initializer()

    // console.trace()

    const cont = webContents.webContentsMap.get(tabId)
    if(cont) return cont

    this.id = tabId
    this._evEvents = {}
    this._pEvents = {}

    webContents.webContentsMap.set(this.id, this)

    this._initEvent()

    // this.session
    // this.hostWebContents
    // this.devToolsWebContents
    // this.debugger
  }

  async _initEvent(){
    const page = await this._getPage()

    this._evEvents[`webNavigation-onCompleted_${this.id}`] = (extFrameId) =>{
      // console.log('did-finish-load', extFrameId == 0 ? 'main' : 'sub')
      this.emit('did-finish-load', {sender: this})
    }

    this._evEvents[`webNavigation-onCommitted_${this.id}`] = (details) =>{
      if(details.frameId == 0){
        this.emit('did-fail-load', {sender: this}, -3, void 0, details.url)
      }
    }

    this._evEvents[`webNavigation-onErrorOccurred_${this.id}`] = (details) =>{
      if(details.frameId == 0){
        this.emit('did-fail-load', {sender: this}, details.error, void 0, details.url)
      }
    }

    //'did-fail-load'

    this._pEvents['frameStartedLoading'] = frame => {
      if(!frame.parentFrame()){
        console.log('did-start-loading', !frame.parentFrame(),this.id)
        this.emit('did-start-loading', {sender: this} ,this.id)
        // this.emit('did-start-navigation', {sender: this}, frame.url(), true, !frame.parentFrame())
      }
    }
    this._pEvents['frameStoppedLoading'] = frame => {
      // console.log('did-stop-loading', !frame.parentFrame())
      if(!frame.parentFrame()){
        this.emit('did-stop-loading', {sender: this})
      }
    }
    this._pEvents['domcontentloaded'] = () => {
      // console.log('dom-ready')
      this.emit('dom-ready', {sender: this})
    }

    this._evEvents[`tabs-onUpdated_${this.id}`] = (changeInfo) =>{
      console.log('updated',changeInfo)
      if(changeInfo.favIconUrl != null){
        // console.log('page-favicon-updated')
        this.emit('page-favicon-updated', {sender: this}, [changeInfo.favIconUrl])
      }
      if(changeInfo.audible != null){
        if(changeInfo.audible){
          // console.log('media-started-playing')
          this.emit('media-started-playing', {sender: this})
        }
        else{
          // console.log('media-paused')
          this.emit('media-paused', {sender: this})
        }
      }
      // if(changeInfo.status == 'loading'){
      //   console.log('did-start-loading2',)
      //   this.emit('did-start-loading', {sender: this})
      // }
      // else if(changeInfo.status == 'complete'){
      //   console.log('did-finish-load2')
      //   this.emit('did-finish-load', {sender: this})
      // }
      // if(changeInfo.url != null){
      //   console.log('update-target-url')
      //   this.emit('update-target-url')
      // }
      if(changeInfo.title != null){
        // console.log('page-title-updated')
        this.emit('page-title-updated', {sender: this}, changeInfo.title)
      }
    }

    // 'new-window'

    this._pEvents['framenavigated'] = frame => {
      // console.log('did-start-navigation', !frame.parentFrame())
      this.emit('did-start-navigation', {sender: this}, frame.url(), true, !frame.parentFrame())
    }

    // did-navigate

    this._pEvents['close'] = event => {
      console.log('destroyed')
      const data = BrowserPanel.getBrowserPanelByTabId(this.id)
      if(data[3]) data[3].destroy(false)

      this.destroyed = true
      for(let event of Object.entries(this._evEvents)) evem.removeListener(...event)
      for(let event of Object.entries(this._pEvents)) page.removeListener(...event)
      webContents.webContentsMap.delete(this.id)
      this.emit('destroyed')
    }

    // 'devtools-opened'
    // 'found-in-page'
    // 'cursor-changed'
    // 'context-menu'

    for(let event of Object.entries(this._evEvents)) evem.on(...event)
    for(let event of Object.entries(this._pEvents)) page.on(...event)

  }

  _getPage(){
    if(this.page) return this.page

    return (async () => {
      if(!Browser._pagePromises[this.id]) {
        let targetInfo
        for(let i=0;i<100;i++){
          targetInfo = await (Browser.bg.evaluate((tabId) => {
            return new Promise(resolve => {
              chrome.debugger.getTargets(targetInfos => resolve(targetInfos.find(t => t.tabId == tabId)))
            })
          }, this.id))
          if(targetInfo) break
          await new Promise(r=>setTimeout(r,20))
        }
        if(!targetInfo) return null

        let target
        for(let i=0;i<100;i++){
          target = Browser._browser.targets().find(t=>t._targetId == targetInfo.id)
          if(target) break
          await new Promise(r=>setTimeout(r,20))
        }
        console.log(3)

        Browser._pagePromises[this.id] = target.page()
      }

      if(this.page || (this.page = await (Browser._pagePromises[this.id]))) return this.page

      for(let i=0;i<100;i++){
        await (new Promise(r=>setTimeout(r,50)))
        if(Browser._pagePromises[this.id]){
          this.page = await (Browser._pagePromises[this.id])
          if(this.page) return this.page
        }
      }
    })()

  }

  _getTabInfo(){
    return Browser.bg.evaluate((tabId) => {
      return new Promise(resolve => {
        chrome.tabs.get(tabId, tab => resolve(tab))
      })
    }, this.id)
  }

  _updateTab(updateProperties){
    return Browser.bg.evaluate((tabId, updateProperties) => {
      return new Promise(resolve => {
        chrome.tabs.update(tabId, updateProperties, tab => resolve(tab))
      })
    }, this.id, updateProperties)
  }

  _getBrowserView(){
    return BrowserView.webContentsMap && BrowserView.webContentsMap.get(this)
  }

  _getBrowserPanel(){
    const bv = this._getBrowserView()
    return bv && bv._browserPanel
  }

  async _sendKey(key, modifier){
    if(!this._getBrowserPanel()) return
    this._getBrowserPanel().cpWin.chromeNativeWindow.setForegroundWindow(true)
    if(modifier){
      robot.keyTap(key, modifier)
    }
    else{
      robot.keyTap(key)
    }
  }

  get hostWebContents2(){
    const bp = this._getBrowserPanel()
    return bp && bp.browserWindow.webContents
  }

  destroy(){
    console.log('2222sclose', this)
    const page = this._getPage()
    if(page.constructor.name == 'Promise'){
      page.then(page=> !page.isClosed() && page.close())
    }
    else{
      if(!page.isClosed()) page.close()
    }
  }

  loadURL(url, options){
    Browser.bg.evaluate((tabId, url) => {
      return new Promise(resolve => {
        chrome.tabs.update(tabId, {url}, tab => resolve(tab))
      })
    }, this.id, url)
  }

  loadFile(filePath, options){
    this.loadURL(`file://${filePath}`, options)
  }

  downloadURL(url){
    this.hostWebContents.downloadURL(url)
  }

  getURL(){
    const page = this._getPage()
    return page.constructor.name == 'Promise' ? '' : page.url() || ""
  }

  async getURLAsync(){
    return (await this._getPage()).url() || ''
  }

  async getTitle(){
    return (await this._getTabInfo()).title
  }

  isDestroyed(){
    return !!this.destroyed
  }

  focus(){
    const panel = this._getBrowserPanel()
    if(!panel) return

    if(require('../util').getCurrentWindow().id == panel.browserWindow.id){
      panel.cpWin.nativeWindow.setWindowPos(winctl.HWND.TOPMOST,0,0,0,0,83)
      panel.cpWin.nativeWindow.setWindowPos(winctl.HWND.NOTOPMOST,0,0,0,0,83)
    }
  }

  setActive(){
    this._updateTab({active: true})
  }

  setForegroundWindow(){
    if(!this._getBrowserPanel()) return
    this._getBrowserPanel().cpWin.chromeNativeWindow.setForegroundWindow(true)
  }

  async isFocused(){
    return (await this._getTabInfo()).active
  }

  async isLoading(){
    return (await this._getTabInfo()).status == 'loading'
  }

  isLoadingMainFrame(){
    return this.isLoading() //@TODO
  }

  isWaitingForResponse(){
    //@TODO
  }

  stop(){
    //@TODO
  }

  reload(){
    return Browser.bg.evaluate((tabId) => {
      return new Promise(resolve => {
        chrome.tabs.reload(tabId, {bypassCache: false}, () => resolve())
      })
    }, this.id)
  }

  reloadIgnoringCache(){
    return Browser.bg.evaluate((tabId) => {
      return new Promise(resolve => {
        chrome.tabs.reload(tabId, {bypassCache: true}, () => resolve())
      })
    }, this.id)
  }

  canGoBack(){
    return this._getPage().canGo(-1)
  }

  canGoForward(){
    return this._getPage().canGo(1)
  }

  canGoToOffset(offset){
    return this._getPage().canGo(offset)
  }

  clearHistory(){
    //@TODO
  }

  goBack(){
    this._getPage().goBack()
  }

  goForward(){
    this._getPage().goForward()
  }

  goToIndex(index){
    this._getPage().goToIndex(index)
  }

  goToOffset(offset){
    this._getPage()._go(offset)
  }

  isCrashed(){
    //@TODO
  }

  setUserAgent(userAgent){
    this._getPage().setUserAgent(userAgent)
    this.userAgent = userAgent
  }

  async getUserAgent(){
    return this.userAgent || await Browser._browser.userAgent()
  }

  async insertCSS(css){
    (await this._getPage()).addStyleTag({content: css})
  }

  async executeJavaScript(code, userGesture, callback){
    if(typeof userGesture === 'function') [userGesture, callback] = [null, userGesture]

    ;(await this._getPage()).evaluate(code).then(value=>callback && callback(value), reason=>callback && callback(null))
  }

  executeJavaScriptInIsolate(code, userGesture, callback){
    Browser.bg.evaluate((tabId, code) => {
      return new Promise(resolve => {
        chrome.tabs.reload(tabId, {code}, (result) => resolve(result))
      })
    }, this.id, code).then(result=>callback(result[0]))
  }

  setIgnoreMenuShortcuts(ignore){
    //@TODO
  }

  setAudioMuted(muted){
    this._updateTab({muted})
  }

  async isAudioMuted(){
    return (await this._getTabInfo()).mutedInfo.muted
  }

  isCurrentlyAudible(){
    //@TODO
  }

  setZoomFactor(factor){
    Browser.bg.evaluate((tabId, factor) => {
      return new Promise(resolve => {
        chrome.tabs.setZoom(tabId, factor, () => resolve())
      })
    }, this.id, factor)
  }

  getZoomFactor(callback){
    Browser.bg.evaluate((tabId) => {
      return new Promise(resolve => {
        chrome.tabs.getZoom(tabId, zoomFactor => resolve(zoomFactor))
      })
    }, this.id).then(callback)
  }

  setZoomLevel(level){
    //@TODO
  }

  getZoomLevel(callback){
    //@TODO
  }

  setVisualZoomLevelLimits(minimumLevel, maximumLevel){
    //@TODO
  }

  setLayoutZoomLevelLimits(minimumLevel, maximumLevel){
    //@TODO
  }

  undo(){
    //@TODO
  }

  redo(){
    //@TODO
  }

  cut(){
    //@TODO
  }

  copy(){
    //@TODO
  }

  copyImageAt(x, y){
    //@TODO
  }

  paste(){
    //@TODO
  }

  pasteAndMatchStyle(){
    //@TODO
  }

  delete(){
    //@TODO
  }

  selectAll(){
    //@TODO
  }

  unselect(){
    //@TODO
  }

  replace(text){
    //@TODO
  }

  replaceMisspelling(text){
    //@TODO
  }

  insertText(text){
    //@TODO
  }

  findInPage(text, options){
    this._sendKey('f', 'control')
  }

  async stopFindInPage(action){
    await this._sendKey('f', 'control')
    robot.keyTap('escape')
  }

  capturePage(rect, callback){
    if(callback == void 0){
      [callback, rect] = [rect, void 0]
    }
    this._getPage().screenshot({clip: rect, encoding: 'png'}).then(image=>callback(nativeImage.createFromBuffer(image)))


    // this._getPage().screenshot({clip: rect, encoding: 'base64'}).then(image=>{
    //   console.log(22)
    //   callback(nativeImage.createFromDataURL("data:image/png;base64,"+ image))
    // })
  }

  hasServiceWorker(callback){
    //@TODO
  }

  unregisterServiceWorker(callback){
    //@TODO
  }

  getPrinters(){
    //@TODO
  }

  print(options, callback){
    this.executeJavaScript('window.print()')
  }

  printToPDF(options, callback){
    //@TODO
    this._getPage().pdf().then(value=> callback(void 0, value), reason => callback(reason))
  }

  addWorkSpace(path){
    //@TODO
  }

  removeWorkSpace(path){
    //@TODO
  }

  setDevToolsWebContents(devToolsWebContents){
    //@TODO
  }

  openDevTools(options){
    this._sendKey('f12')
  }

  closeDevTools(){
    this._sendKey('f12')
  }

  isDevToolsOpened(){
    //@TODO
  }

  isDevToolsFocused(){
    //@TODO
  }

  toggleDevTools(){
    this._sendKey('f12')
  }

  inspectElement(x, y){
    //@TODO
  }

  inspectServiceWorker(){
    //@TODO
  }

  send(channel, ...args){
    //@TODO
    Browser.bg.evaluate((tabId, channel, ...args) => {
      chrome.tabs.sendMessage(tabId, {ipc: true, channel, args})
    }, this.id, channel, ...args)
  }

  enableDeviceEmulation(parameters){
    //@TODO
  }

  disableDeviceEmulation(){
    //@TODO
  }

  async _modifiers(event, callback){
    if(event.modifiers && event.modifiers.length){
      for(const modifier of event.modifiers){
        await this._getPage().keyboard.down(modifier);
      }
    }
    if(callback) await callback()
    if(event.modifiers && event.modifiers.length){
      for(const modifier of event.modifiers){
        await this._getPage().keyboard.up(modifier);
      }
    }
  }

  async sendInputEvent(event){
    const mouse = this._getPage().mouse
    const keyboard = this._getPage().keyboard
    if(event.type == 'mouseDown'){
      await this._modifiers(async ()=>{
        await mouse.move(event.x, event.y)
        await mouse.down({button: event.button, clickCount: event.clickCount})
      })
    }
    else if(event.type == 'mouseUp'){
      await this._modifiers(async ()=>{
        await mouse.move(event.x, event.y)
        await mouse.up({button: event.button, clickCount: event.clickCount})
      })
    }
    else if(event.type == 'click'){
      await this._modifiers(async ()=>{
        await mouse.click({x: event.x, y: event.y})
      })
    }
    else if(event.type == 'mouseWheel'){
      await this._modifiers(async ()=>{
        await mouse.move(event.x, event.y)
        await mouse.wheel({deltaX: event.deltaX, deltaY: event.deltaY})
      })
    }
    else if(event.type == 'mouseMove'){
      await mouse.move(event.x, event.y)
    }
    else if(event.type == 'mouseEnter'){
      //@TODO
    }
    else if(event.type == 'mouseLeave'){
      //@TODO
    }
    else if(event.type == 'keyDown'){
      await this._modifiers(async ()=>{
        //@TODO
        await keyboard.down(event.keyCode)
      })
    }
    else if(event.type == 'keyUp'){
      await this._modifiers(async ()=>{
        //@TODO
        await keyboard.up(event.keyCode)
      })
    }
    else if(event.type == 'char'){
      await this._modifiers(async ()=>{
        //@TODO
        await keyboard.press(event.keyCode)
      })
    }
  }

  beginFrameSubscription(onlyDirty ,callback){
    //@TODO
  }

  endFrameSubscription(){
    //@TODO
  }

  startDrag(item){
    //@TODO
  }

  async savePage(fullPath, saveType, callback){
    //@TODO
    if(saveType == 'MHTML'){
      const session = await this._getPage().target().createCDPSession()
      await session.send('Page.enable')
      const {data} = await session.send('Page.captureSnapshot')
      fs.writeFileSync(fullPath, data)
      callback()
    }
  }


  isOffscreen(){
    //@TODO
  }

  startPainting(){
    //@TODO
  }

  stopPainting(){
    //@TODO
  }

  isPainting(){
    //@TODO
  }

  setFrameRate(fps){
    //@TODO
  }

  getFrameRate(){
    //@TODO
  }

  invalidate(){
    //@TODO
  }

  getWebRTCIPHandlingPolicy(){
    //@TODO
  }

  setWebRTCIPHandlingPolicy(policy){
    //@TODO
  }

  getOSProcessId(){
    //@TODO
  }

  getProcessId(){
    //@TODO
  }

  takeHeapSnapshot(filePath){
    //@TODO
  }

  setBackgroundThrottling(allowed){
    //@TODO
  }

  async getNavigationHistory(){
    return (await this._getPage()).getNavigationHistory()
  }

  async length(){
    return (await this.getNavigationHistory()).entries.length
  }

  async getActiveIndex(){
    return (await this.getNavigationHistory()).currentIndex
  }

  async getURLAtIndex(index){
    const history = (await this.getNavigationHistory())
    return history.entries[index].url
  }

  async getTitleAtIndex(index){
    const history = (await this.getNavigationHistory())
    return history.entries[index].title
  }
}


class BackgroundPage{
  constructor(extensionId){
    this.id = extensionId
  }

  send(channel, ...args){
    Browser.bg.evaluate((channel, ...args) => {
      if(window.ipcRenderer.events[channel]) window.ipcRenderer.events[channel]({},...args)
    }, channel, ...args)
  }
}

function getChromeWindowBoundArray(width, height){
  return [- BrowserPanel.sideMargin, - BrowserPanel.topMargin, width + BrowserPanel.sideMargin * 2, height + BrowserPanel.topMargin + 8]
}

function getWinHeight(height){
  return height - BrowserPanel.topMargin
}

function removeBom(x){
  return x.charCodeAt(0) === 0xFEFF ? x.slice(1) : x
}

export default {
  Browser,
  BrowserPanel,
  BrowserView,
  webContents
}