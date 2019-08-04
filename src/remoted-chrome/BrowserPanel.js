import winctl from "../../resource/winctl";
import {BrowserWindow, ipcMain} from "electron";
import DpiUtils from './DpiUtils'
import os from 'os'

const isWin7 = os.platform() == 'win32' && os.release().startsWith('6.1')
const isLinux = process.platform === 'linux'

console.log(77888,os.release())

let Browser = new Proxy({},  { get: function(target, name){ Browser = require('./Browser').Browser; return typeof Browser[name] == 'function' ? Browser[name].bind(Browser) : Browser[name]}})
let PopupPanel = new Proxy({},  { get: function(target, name){ PopupPanel = require('./Browser').PopupPanel; return typeof PopupPanel[name] == 'function' ? PopupPanel[name].bind(PopupPanel) : PopupPanel[name]}})
let BrowserView = require('./BrowserView')
let webContents = require('./webContents')

// const BROWSER_NAME = 'Chromium'
// const BROWSER_NAME = 'Microsoft Edge'
// const BROWSER_NAME = 'Brave'
// const BROWSER_NAME = 'Cent Browser'
// const BROWSER_NAME = 'Kinza'
// const BROWSER_NAME = 'Iron'
// const BROWSER_NAME = 'Vivaldi'
// const BROWSER_NAME = 'Slimjet'
// const BROWSER_NAME = 'Comodo Dragon'

export default class BrowserPanel {
  static async _initializer() {
    if (this.isInit) return
    this.isInit = true
    this.destKeySet = new Set()
    this.bindedWindows = new Set()

    this.BROWSER_NAME = this.BROWSER_NAME || require('../minimist')(process.argv.slice(1))['browser-name'] || 'Google Chrome'


    await Browser._initializer()

    this.panelKeys = {}
  }

  static getBrowserPanel(panelKey) {
    return this.panelKeys && this.panelKeys[panelKey]
  }

  static getBrowserPanelFromNativeWindow(nativeWindow){
    for (const browserPanel of Object.values(this.panelKeys)) {
      if (browserPanel.cpWin.nativeWindow == nativeWindow) return browserPanel
    }
  }

  static getBrowserPanelsFromBrowserWindow(browserWindow) {
    const result = []
    for (const browserPanel of Object.values(this.panelKeys)) {
      if (browserPanel.browserWindow == browserWindow) result.push(browserPanel)
    }
    return result
  }

  static getBrowserPanelByTabId(tabId) {
    for (const [panelKey, browserPanel] of Object.entries(this.panelKeys)) {
      // if(rejectPanelKey && panelKey == rejectPanelKey) continue
      for (const [tabKey, [_tabId, browserView]] of Object.entries(browserPanel.tabKeys)) {
        if (tabId == _tabId) return [panelKey, tabKey, browserPanel, browserView]
      }
    }
    return []
  }

  static getAllTabIds() {
    const result = []
    for (const browserPanel of Object.values(this.panelKeys)) {
      for (const [tabId, browserView] of Object.values(browserPanel.tabKeys)) {
        result.push(tabId)
      }
    }
    return result
  }

  static hasTabId(tabId) {
    for (const browserPanel of Object.values(this.panelKeys)) {
      for (const [_tabId, browserView] of Object.values(browserPanel.tabKeys)) {
        if (tabId == _tabId) return true
      }
    }
    return false
  }

  static getBrowserPanelByWindowId(windowId) {
    for (const browserPanel of Object.values(this.panelKeys)) {
      if (browserPanel.windowId == windowId) return browserPanel
    }
  }

  static async MovedTabs(tabId, {windowId, fromIndex, toIndex}) {
    let [_1, _2, panel, bv] = BrowserPanel.getBrowserPanelByTabId(tabId)
    if (!panel) {
      for (let i = 0; i < 100; i++) {
        await new Promise(r => setTimeout(r, 20))
        ;[_1, _2, panel, bv] = BrowserPanel.getBrowserPanelByTabId(tabId)
        if (panel) break
      }
    }
    const browserWindow = panel.browserWindow


    console.log('move-tab-from-moved', tabId, toIndex)
    browserWindow.webContents.send('move-tab-from-moved', tabId, toIndex)
  }

  static async moveTabs(moveTabIds, destPanelKey, {index, tabKey}, browserWindow, bounds) {
    console.log(moveTabIds, destPanelKey, {index, tabKey}, browserWindow, bounds)
    let browserPanel = this.getBrowserPanel(destPanelKey)

    if (!browserPanel && this.destKeySet.has(destPanelKey)) {
      for (let i = 0; i < 100; i++) {
        await new Promise(r => setTimeout(r, 20))
        browserPanel = this.getBrowserPanel(destPanelKey)
        if (browserPanel) break
      }
    }
    this.destKeySet.add(destPanelKey)

    // console.trace(index, 2222)

    if (browserPanel) {
      // if(index == null){
      //   const tabId = browserPanel.tabKeys[tabKey][0]
      //   const tab = await Browser.bg.evaluate((tabId) => {
      //     return new Promise(resolve => {
      //       chrome.tabs.get(tabId, tab => resolve(tab))
      //     })
      //   }, tabId)
      //   index = tab.index
      // }
      for (let tabId of moveTabIds) {
        const [_1, _2, panel, bv] = BrowserPanel.getBrowserPanelByTabId(tabId)
        if (destPanelKey != panel.panelKey) bv.webContents.hostWebContents2.send('chrome-tabs-event', { tabId, changeInfo: {panelKey: panel.panelKey}}, 'removed')
        bv.destroy(false)
      }
      const tabs = await Browser.bg.evaluate((tabIds, moveProperties) => {
        return new Promise(resolve => {
          chrome.tabs.move(tabIds, moveProperties, tabs => resolve(tabs))
        })
      }, moveTabIds, {windowId: browserPanel.windowId, index})
      console.log('chrome-tabs-move', moveTabIds, {windowId: browserPanel.windowId, index})

      for (let tabId of moveTabIds) {
        browserPanel.attachBrowserView(tabId, tabKey)
      }
    }
    else {
      if (!browserWindow) {
        const [_1, _2, panel, bv] = BrowserPanel.getBrowserPanelByTabId(moveTabIds[0])
        if(!panel){
          for(let i=0;i<100;i++){
            await new Promise(r=>setTimeout(r,30))
            ;[_1, _2, panel, bv] = BrowserPanel.getBrowserPanelByTabId(moveTabIds[0])
            if(panel) break
          }
        }
        browserWindow = panel.browserWindow
      }
      console.log(2223)
      let [_1, _2, panel, bv] = BrowserPanel.getBrowserPanelByTabId(moveTabIds[0])
      if(!panel){
        for(let i=0;i<100;i++){
          console.log(2223)
          await new Promise(r=>setTimeout(r,30))
          ;[_1, _2, panel, bv] = BrowserPanel.getBrowserPanelByTabId(moveTabIds[0])
          if(panel) break
        }
      }
      if (destPanelKey != panel.panelKey) bv.webContents.hostWebContents2.send('chrome-tabs-event', { tabId: moveTabIds[0], changeInfo: {panelKey: panel.panelKey}}, 'removed')
      bv.destroy(false)
      console.log(2224)
      const destPanel = await new BrowserPanel({ browserWindow, panelKey: destPanelKey, tabKey, tabId: moveTabIds[0], bounds })
      console.log(2225)

      if (moveTabIds.length > 1) {
        for (let tabId of moveTabIds.slice(1)) {
          const [_1, _2, panel, bv] = BrowserPanel.getBrowserPanelByTabId(tabId, destPanelKey)
          if (destPanelKey != panel.panelKey) bv.webContents.hostWebContents2.send('chrome-tabs-event', { tabId, changeInfo: {panelKey: panel.panelKey}}, 'removed')
          bv.destroy(false)
        }
        const tabs = await Browser.bg.evaluate((tabIds, moveProperties) => {
          return new Promise(resolve => {
            chrome.tabs.move(tabIds, moveProperties, tabs => resolve(tabs))
          })
        }, moveTabIds.slice(1), {windowId: browserPanel.windowId, index: 1})
        console.log('chrome-tabs-move', moveTabIds, {windowId: browserPanel.windowId, index})
      }
    }
  }

  static getChromeWindowBoundArray(width, height, modify=0){
    return [- BrowserPanel.sideMargin, - BrowserPanel.topMargin + modify, width + BrowserPanel.sideMargin * 2, height + BrowserPanel.topMargin + 8 - modify]
  }

  constructor({browserWindow, panelKey, tabKey, webContents, windowId, url, tabId, bounds}) {
    console.log(999777, {panelKey, tabKey, windowId, url, tabId, browserWindow: browserWindow && browserWindow.id, bounds })
    return this.init(browserWindow, panelKey, tabKey, webContents, windowId, url, tabId, bounds)
  }

  async init(browserWindow, panelKey, tabKey, webContents, windowId, url, tabId, bounds, retry=0){
    if(BrowserPanel.initing){
      await new Promise(r=>setTimeout(r,(++retry)*10))
      if(retry < 20){
        return await this.init(browserWindow, panelKey, tabKey, webContents, windowId, url, tabId, bounds, retry)
      }
    }
    BrowserPanel.initing = true

    await BrowserPanel._initializer()

    const oldWindows = []
    winctl.EnumerateWindows(function(win) {
      if(win.getTitle().endsWith(` - ${BrowserPanel.BROWSER_NAME}`)){
        oldWindows.push(win.getHwnd())
      }
      return true
    })

    let nativeWindow
    // if(bounds){
    //   const nativeWindowHwnd = winctl.CreateWindow2()
    //   nativeWindow = (await winctl.FindWindows(win => win.getHwnd() == nativeWindowHwnd))[0]
    //   nativeWindow.move(bounds.x,bounds.y,bounds.width,bounds.height)
    // }

    if (panelKey) {
      this.browserWindow = browserWindow
      this.browserWindow.once('closed', () => this.destroy())
      const isNotFirst = BrowserPanel._isNotFirst
      let win
      if (tabId) {
        win = await Browser.bg.evaluate((tabId, bounds, sideMargin, topMargin) => {
          return new Promise(resolve => {
            const createData = bounds ? {
              tabId, focused: true, left: bounds.x - sideMargin, top: bounds.y - topMargin,
              width: bounds.width + sideMargin * 2, height: bounds.height + topMargin + 8
            } : {tabId}
            chrome.windows.create(createData, window => resolve(window))
          })
        }, tabId, bounds, BrowserPanel.sideMargin, BrowserPanel.topMargin)
      }
      else {
        if (!isNotFirst) {
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
          console.log(4343444, tmpWin.width, tmpWin.tabWidth, tmpWin.height, tmpWin.tabHeight)
          BrowserPanel.topMargin = tmpWin.height - tmpWin.tabHeight - 8 //- 78
          BrowserPanel.sideMargin = (tmpWin.width - tmpWin.tabWidth) / 2

          if(BrowserPanel.sideMargin > 100){
            BrowserPanel.topMargin = 0
            BrowserPanel.sideMargin = 0
          }

          let chromeNativeWindow = winctl.GetActiveWindow2()
          const dim = DpiUtils.dimensions(chromeNativeWindow)
          console.log(9933,tmpWin, dim)
          if (!chromeNativeWindow.getTitle().endsWith(` - ${BrowserPanel.BROWSER_NAME}`) || !(tmpWin.left == dim.left && tmpWin.top == dim.top && tmpWin.width == (dim.right - dim.left) && tmpWin.height == (dim.bottom - dim.top))) {
            chromeNativeWindow = (await winctl.FindWindows(win => {
              if (!win.getTitle().endsWith(` - ${BrowserPanel.BROWSER_NAME}`)) return false
              const dim = DpiUtils.dimensions(win)
              return tmpWin.left == dim.left && tmpWin.top == dim.top && tmpWin.width == (dim.right - dim.left) && tmpWin.height == (dim.bottom - dim.top)
            }))[0]

            if(!chromeNativeWindow){
              chromeNativeWindow = (await winctl.FindWindows(win => {
                if(!win.getTitle('about:blank') || !win.getTitle().endsWith(` - ${BrowserPanel.BROWSER_NAME}`)) return false
                return true
              }))[0]
            }
          }

          console.log(2243344, chromeNativeWindow.getTitle())
          // if(!Browser.CUSTOM_CHROMIUM){
          for(let i=0;i<5;i++){
            chromeNativeWindow.setForegroundWindowEx()
            chromeNativeWindow.showWindow(0)
            if(isWin7){
              chromeNativeWindow.setWindowLongPtrRestore(0x00800000)
              chromeNativeWindow.setWindowLongPtrRestore(0x00040000)
              chromeNativeWindow.setWindowLongPtrRestore(0x00400000)
            }
            chromeNativeWindow.setWindowLongPtrEx(0x00000080)
            chromeNativeWindow.setWindowPos(0,0,0,0,0,39+1024)
            chromeNativeWindow.showWindow(5)
            await new Promise(r=>setTimeout(r,50))
          }
          // }

          setTimeout(()=> chromeNativeWindow.destroyWindow(),5000)

          win = await Browser.bg.evaluate((url, windowId) => {
            return new Promise(resolve => {
              chrome.tabs.query({windowId}, tabs => {
                chrome.tabs.update(tabs[0].id, {url: 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html'},()=>{
                  chrome.windows.update(windowId, {state: 'minimized'}, () => {
                    setTimeout(() => chrome.windows.remove(windowId), 5000)
                    chrome.windows.create({url, focused: true}, window => {
                      resolve(window)
                    })
                  })
                })
              })
            })
          }, url, tmpWin.id)
          BrowserPanel._isNotFirst = true

        }
        else {
          win = await Browser.bg.evaluate((url, bounds, sideMargin, topMargin) => {
            const createData = bounds ? {
              url, focused: true, left: bounds.x - sideMargin, top: bounds.y - topMargin,
              width: bounds.width + sideMargin * 2, height: bounds.height + topMargin + 8
            } : {url}
            return new Promise(resolve => chrome.windows.create(createData, window => resolve(window)))
          }, url, bounds, BrowserPanel.sideMargin, BrowserPanel.topMargin)
        }
      }

      this.cpWin = await this.createChromeParentWindow(win, oldWindows, nativeWindow)

      this.panelKey = panelKey
      this.windowId = win.id
      BrowserPanel.panelKeys[panelKey] = this
      this.tabKeys = {[tabKey]: [win.tabs[0].id, new BrowserView(this, tabKey, win.tabs[0].id)]}

      // if(!isNotFirst){
      //   await new Promise(r=>setTimeout(r,1000))
      //   await Browser.initPopupPanel()
      // }

      BrowserPanel.initing = false
      // setTimeout(()=>ipcMain.emit('set-position-browser-view', {sender:this.browserWindow.webContents}, panelKey),100)
      return this
    }
    else {
      this.windowId = windowId

      const win = await Browser.bg.evaluate((windowId, isNotFirst) => {
        return new Promise(resolve => {
          chrome.windows.get(windowId, {populate: !isNotFirst}, window => {
            if (!isNotFirst) {
              window.tabWidth = window.tabs[0].width
              window.tabHeight = window.tabs[0].height
            }
            resolve(window)
          })
        })
      }, windowId, BrowserPanel._isNotFirst)


      if (!BrowserPanel._isNotFirst) {
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

      this.browserWindow = await require('../BrowserWindowPlus').load({
        id: bw.id, x, y, width, height,
        tabParam: JSON.stringify({
          urls: [{url: void 0, guestInstanceId: webContents && webContents.id}],
          type: 'new-win'
        })
      })
      this.browserWindow.on('closed', () => this.destroy())

      this.cpWin = await this.createChromeParentWindow(win, oldWindows)

      return new Promise(r => {
        const key = Math.random().toString()
        const id = webContents.id
        const intervalId = setInterval(() => this.browserWindow.webContents.send('get-panel-and-tab-info', id, key), 10)

        ipcMain.once(`get-panel-and-tab-info-reply_${key}`, async (e, panelKey, tabKey) => {
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
  }

  async createChromeParentWindow(cWin, oldWindows, nativeWindow) {
    let chromeNativeWindow

    for(let i=0;i<300;i++){
      chromeNativeWindow = (await winctl.FindWindows(win => {
        if(oldWindows.includes(win.getHwnd()) || !win.getTitle().endsWith(` - ${BrowserPanel.BROWSER_NAME}`)) return false
        return true
      }))[0]
      if(!chromeNativeWindow){
        chromeNativeWindow = winctl.GetActiveWindow2()
        const dim = DpiUtils.dimensions(chromeNativeWindow)
        if (BrowserPanel.bindedWindows.has(chromeNativeWindow.getHwnd()) || !chromeNativeWindow.getTitle().endsWith(` - ${BrowserPanel.BROWSER_NAME}`) ||
          !(cWin.left == dim.left && cWin.top == dim.top && cWin.width == (dim.right - dim.left) && cWin.height == (dim.bottom - dim.top))) {
          chromeNativeWindow = (await winctl.FindWindows(win => {
            if (BrowserPanel.bindedWindows.has(chromeNativeWindow.getHwnd()) || !win.getTitle().endsWith(` - ${BrowserPanel.BROWSER_NAME}`)) return false
            const dim = DpiUtils.dimensions(win)
            return cWin.left == dim.left && cWin.top == dim.top && cWin.width == (dim.right - dim.left) && cWin.height == (dim.bottom - dim.top)
          }))[0]
        }
      }
      if(chromeNativeWindow) break
      await new Promise(r=>setTimeout(r,100))
    }

    if(!Browser.CUSTOM_CHROMIUM){
      chromeNativeWindow.moveRelative(9999, 9999, 0, 0)
    }
    else{
      if(chromeNativeWindow.setChromeWindowId) chromeNativeWindow.setChromeWindowId(cWin.id)

      if(cWin.type == 'normal') chromeNativeWindow.setWindowLongPtrEx(0x00001000)

      chromeNativeWindow.setForegroundWindowEx()
      chromeNativeWindow.showWindow(0)
      if(isWin7){
        chromeNativeWindow.setWindowLongPtrRestore(0x00800000)
        chromeNativeWindow.setWindowLongPtrRestore(0x00040000)
        chromeNativeWindow.setWindowLongPtrRestore(0x00400000)
      }
      chromeNativeWindow.setWindowLongPtrEx(0x00000080)
      chromeNativeWindow.setWindowPos(0,0,0,0,0,39+1024)

      chromeNativeWindow.showWindow(5)
    }
    chromeNativeWindow.hwnd = chromeNativeWindow.getHwnd()
    BrowserPanel.bindedWindows.add(chromeNativeWindow.hwnd)


    let nativeWindowBw
    for(let i=0;i<100;i++){
      try{
        const title = Math.random().toString()
        const _title = this.browserWindow.getTitle()

        this.browserWindow.setTitle(title)
        await new Promise(r=>setTimeout(r,10))
        nativeWindowBw = await winctl.FindByTitle(title)
        this.browserWindow.setTitle(_title)
        break
      }catch(e){}

      await new Promise(r=>setTimeout(r,10))
    }

    this.browserWindow.nativeWindow = nativeWindowBw

    if(nativeWindowBw.setBrowserWindow) nativeWindowBw.setBrowserWindow(this.browserWindow)



    if(!nativeWindow){
      if(Browser.CUSTOM_CHROMIUM){
        nativeWindow = chromeNativeWindow
      }
      else{
        const hwnd = nativeWindowBw.createWindow()
        nativeWindow = (await winctl.FindWindows(win => win.getHwnd() == hwnd))[0]
      }
    }
    // const nativeWindow = nativeWindowBw

    if(!Browser.CUSTOM_CHROMIUM){
      chromeNativeWindow.setParent(nativeWindow.getHwnd())
      DpiUtils.move(chromeNativeWindow,...BrowserPanel.getChromeWindowBoundArray(0, 0))
      chromeNativeWindow.moveTop()
    }

    // nativeWindowBw.setWindowLongPtrEx(0x02000000)
    nativeWindowBw.setWindowLongPtr(0x00040000)

    return {chromeNativeWindow, nativeWindow, nativeWindowBw}
    // return {chromeNativeWindow, nativeWindow, nativeWindowBw, childBrowserWindow}
  }

  destroy() {
    for (const [tabKey, [_tabId, browserView]] of Object.entries(this.tabKeys)) {
      browserView.destroy()
    }
    console.log(5555555, Object.keys(this.tabKeys).length)
    if (!Object.keys(this.tabKeys).length) {
      delete BrowserPanel.panelKeys[this.panelKey]
      this.cpWin.nativeWindow.destroyWindow()
    }
  }

  removeBrowserView(tabId) {
    this.getBrowserView({tabId}).destroy()
  }

  async addBrowserView(tabKey, url, index, topZOrder) {
    const tab = await Browser.bg.evaluate((windowId, index, url) => {
      return new Promise(resolve => {
        chrome.tabs.create({windowId, index, url}, tab => resolve(tab))
      })
    }, this.windowId, index, url)
    const bv = new BrowserView(this, tabKey, tab.id, topZOrder)
    this.tabKeys[tabKey] = [tab.id, bv]
    return bv
  }

  attachBrowserView(tabId, tabKey) {
    const bv = new BrowserView(this, tabKey, tabId)
    this.tabKeys[tabKey] = [tabId, bv]
    return bv
  }


  getAllBrowserViews() {
    const result = []
    for (const val of Object.values(this.tabKeys)) {
      result.push(val[1])
    }
    return result
  }

  getBrowserView({tabId, tabKey}) {
    if(tabId){
      const obj = Object.values(this.tabKeys).find(x => x[0] == tabId)
      return obj && obj[1]
    }
    else{
      return this.tabKeys[tabKey] && this.tabKeys[tabKey][1]
    }
  }

  _updateWindow(updateInfo) {
    return Browser.bg.evaluate((windowId, updateInfo) => {
      return new Promise(resolve => {
        chrome.windows.update(windowId, updateInfo, window => resolve(window))
      })
    }, this.windowId, updateInfo)
  }

  setAlwaysOnTop(enable) {
    this.cpWin.nativeWindow.setWindowPos(enable ? winctl.HWND.TOPMOST : winctl.HWND.NOTOPMOST, 0, 0, 0, 0, 83)
  }

  getActiveTab(){
    return Browser.bg.evaluate((windowId) => {
      return new Promise(resolve => {
        chrome.tabs.query({windowId, active: true}, tabs => resolve(tabs[0]))
      })
    }, this.windowId)
  }

  async setFullscreenBounds(enable){
    const tab = await this.getActiveTab()
    const cont = webContents.fromId(tab.id)

    if(enable){
      cont.setViewport(null)
      this.beforeViewport = await cont.viewport()
    }
    else{
      if(this.beforeViewport) cont.setViewport(this.beforeViewport)
      delete this.beforeViewport
    }
  }

  async setBounds(bounds) {
    if(this.cpWin.nativeWindow.hidePanel) return

    const tab = await this.getActiveTab()
    const modify = 0 //Browser.CUSTOM_CHROMIUM ? 0 : tab.url == 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html' ? 37 : 0

    if (bounds.width) {
      const cont = webContents.fromId(tab.id)
      if(!Browser.CUSTOM_CHROMIUM) cont.setViewport({width: Math.round(bounds.width), height: Math.round(bounds.height - modify)})
      this.bounds = bounds
    }

    if (bounds.width) {
      DpiUtils.move(this.cpWin.nativeWindow,bounds.x, bounds.y, bounds.width, bounds.height)
      if(!Browser.CUSTOM_CHROMIUM){
        DpiUtils.moveForChildWindow(this.cpWin.chromeNativeWindow,...BrowserPanel.getChromeWindowBoundArray(bounds.width, bounds.height, modify),bounds.x, bounds.y)
      }
    }
    else {
      const dim = this.cpWin.nativeWindow.dimensions()
      const {x,y} = DpiUtils.dipToScreenPoint(bounds.x, bounds.y)

      if(isLinux){
        const needMoveTopPanel = this.checkNeedMoveTop()
        if(needMoveTopPanel){
          for(const panel of needMoveTopPanel) panel.moveTopNativeWindow()
        }
      }

      DpiUtils.moveJust(this.cpWin.nativeWindow, x, y, dim.right - dim.left, dim.bottom - dim.top)
      // console.log({bx:bounds.x, by:bounds.y,x, y, w:dim.right - dim.left, h:dim.bottom - dim.top})
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

  moveTopNativeWindow() {
    if (BrowserPanel.contextMenuShowing ||
      webContents.disableFocus ||
      this._bindWindow ||
      this.cpWin.nativeWindow.hidePanel ||
      !this.checkNeedMoveTop()) return

    console.log('moveTopNativeWindow()')

    this.cpWin.nativeWindow.moveTop()
    if(this.browserWindow._alwaysOnTop) this.cpWin.nativeWindow.setWindowPos(winctl.HWND.TOPMOST, 0, 0, 0, 0, 83)

    if(this.panelKey == PopupPanel.instance.panelKey){
      console.log('PopupPanel.instance.moveTop()')
      PopupPanel.instance.moveTop()
      if(this.browserWindow._alwaysOnTop) PopupPanel.instance.nativeWindow.setWindowPos(winctl.HWND.TOPMOST, 0, 0, 0, 0, 83)

    }
  }

  moveTopNativeWindowBw() {
    if (BrowserPanel.contextMenuShowing || !this.checkNeedMoveTop()) return
    // const now = Date.now()

    console.log('moveTopNativeWindowBW()')

    // if(!this.moveTopCache || now - this.moveTopCache > 30){
    //   this.moveTopCache = now
      this.cpWin.nativeWindowBw.moveTop()
      if(this.browserWindow._alwaysOnTop) this.cpWin.nativeWindowBw.setWindowPos(winctl.HWND.TOPMOST, 0, 0, 0, 0, 83)
    // }
  }

  checkNeedMoveTop(){
    if(!isLinux) return true

    const panels = BrowserPanel.getBrowserPanelsFromBrowserWindow(this.browserWindow)

    const ids = [this.cpWin.nativeWindowBw.id]
    for(const panel of panels) ids.push(panel.cpWin.nativeWindow.id)
    return winctl.conflictAboveWindow(ids) ? panels : null

  }

  bindWindow(val){
    if(val){
      this._bindWindow = true
    }
    else{
      delete this._bindWindow
    }
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

function getWinHeight(height){
  return height - BrowserPanel.topMargin
}
