import winctl from "../../resource/winctl";
import {BrowserWindow, ipcMain} from "electron";

let Browser = new Proxy({},  { get: function(target, name){ Browser = require('./Browser').Browser; return typeof Browser[name] == 'function' ? Browser[name].bind(Browser) : Browser[name]}})
let PopupPanel = new Proxy({},  { get: function(target, name){ PopupPanel = require('./Browser').PopupPanel; return typeof PopupPanel[name] == 'function' ? PopupPanel[name].bind(PopupPanel) : PopupPanel[name]}})
let BrowserView = require('./BrowserView')

export default class BrowserPanel {
  static async _initializer() {
    if (this.isInit) return
    this.isInit = true
    this.destKeySet = new Set()

    await Browser._initializer()

    this.panelKeys = {}
  }

  static getBrowserPanel(panelKey) {
    return this.panelKeys && this.panelKeys[panelKey]
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

    console.trace(index, 2222)

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
        if (destPanelKey != panel.panelKey) bv.webContents.hostWebContents2.send('chrome-tabs-event', {
          tabId,
          changeInfo: {panelKey: panel.panelKey}
        }, 'removed')
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
    } else {
      if (!browserWindow) {
        const [_1, _2, panel, bv] = BrowserPanel.getBrowserPanelByTabId(moveTabIds[0])
        browserWindow = panel.browserWindow
      }
      console.log(2223)
      const [_1, _2, panel, bv] = BrowserPanel.getBrowserPanelByTabId(moveTabIds[0])
      if (destPanelKey != panel.panelKey) bv.webContents.hostWebContents2.send('chrome-tabs-event', {
        tabId: moveTabIds[0],
        changeInfo: {panelKey: panel.panelKey}
      }, 'removed')
      bv.destroy(false)
      console.log(2224)
      const destPanel = await new BrowserPanel({
        browserWindow,
        panelKey: destPanelKey,
        tabKey,
        tabId: moveTabIds[0],
        bounds
      })
      console.log(2225)

      if (moveTabIds.length > 1) {
        for (let tabId of moveTabIds.slice(1)) {
          const [_1, _2, panel, bv] = BrowserPanel.getBrowserPanelByTabId(tabId, destPanelKey)
          if (destPanelKey != panel.panelKey) bv.webContents.hostWebContents2.send('chrome-tabs-event', {
            tabId,
            changeInfo: {panelKey: panel.panelKey}
          }, 'removed')
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

  static getChromeWindowBoundArray(width, height){
    return [- BrowserPanel.sideMargin, - BrowserPanel.topMargin, width + BrowserPanel.sideMargin * 2, height + BrowserPanel.topMargin + 8]
  }

  constructor({browserWindow, panelKey, tabKey, webContents, windowId, url, tabId, bounds}) {
    console.log(999777, {
      panelKey,
      tabKey,
      windowId,
      url,
      tabId,
      browserWindow: browserWindow && browserWindow.id,
      bounds
    })
    return (async () => {
      await BrowserPanel._initializer()

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

            let chromeNativeWindow = winctl.GetActiveWindow()
            const dim = chromeNativeWindow.dimensions()
            if (!chromeNativeWindow.getTitle().includes('Google Chrome') || !(tmpWin.left == dim.left && tmpWin.top == dim.top && tmpWin.width == (dim.right - dim.left) && tmpWin.height == (dim.bottom - dim.top))) {
              chromeNativeWindow = (await winctl.FindWindows(win => {
                if (!win.getTitle().includes('Google Chrome')) return false
                const dim = win.dimensions()
                return tmpWin.left == dim.left && tmpWin.top == dim.top && tmpWin.width == (dim.right - dim.left) && tmpWin.height == (dim.bottom - dim.top)
              }))[0]
            }

            console.log(2243344, chromeNativeWindow.getTitle())
            chromeNativeWindow.setWindowLongPtrEx(0x00000080)

            win = await Browser.bg.evaluate((url, windowId) => {
              return new Promise(resolve => {
                chrome.windows.update(windowId, {state: 'minimized'}, () => {
                  setTimeout(() => chrome.windows.remove(windowId), 5000)
                  chrome.windows.create({url, focused: true}, window => {
                    resolve(window)
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

        this.cpWin = await this.createChromeParentWindow(win)

        this.panelKey = panelKey
        this.windowId = win.id
        BrowserPanel.panelKeys[panelKey] = this
        this.tabKeys = {[tabKey]: [win.tabs[0].id, new BrowserView(this, tabKey, win.tabs[0].id)]}

        if(!isNotFirst) await Browser.initPopupPanel()
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

        this.cpWin = await this.createChromeParentWindow(win)

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

    })()
  }

  async createChromeParentWindow(cWin) {
    let chromeNativeWindow = winctl.GetActiveWindow()
    const dim = chromeNativeWindow.dimensions()
    if (!chromeNativeWindow.getTitle().includes('Google Chrome') || !(cWin.left == dim.left && cWin.top == dim.top && cWin.width == (dim.right - dim.left) && cWin.height == (dim.bottom - dim.top))) {
      chromeNativeWindow = (await winctl.FindWindows(win => {
        if (!win.getTitle().includes('Google Chrome')) return false
        const dim = win.dimensions()
        console.log(win.getTitle(), cWin.left, dim.left, cWin.top, dim.top, cWin.width, (dim.right - dim.left), cWin.height, (dim.bottom - dim.top))
        return cWin.left == dim.left && cWin.top == dim.top && cWin.width == (dim.right - dim.left) && cWin.height == (dim.bottom - dim.top)
      }))[0]
    }
    chromeNativeWindow.moveRelative(9999, 9999, 0, 0)
    chromeNativeWindow.hwnd = chromeNativeWindow.getHwnd()
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
    chromeNativeWindow.move(...BrowserPanel.getChromeWindowBoundArray(0, 0))
    chromeNativeWindow.moveTop()


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
      // chromeNativeWindow.setWindowPos(winctl.HWND.BOTTOM,0,0,0,0,83)
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

  setBounds(bounds) {
    if (bounds.width) {
      this.cpWin.nativeWindow.move(bounds.x, bounds.y, bounds.width, bounds.height)
      this.cpWin.chromeNativeWindow.move(...BrowserPanel.getChromeWindowBoundArray(bounds.width, bounds.height))
    } else {
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

  moveTopNativeWindow() {
    if (BrowserPanel.contextMenuShowing) return
    this.cpWin.nativeWindow.moveTop()
    if(this.panelKey == PopupPanel.instance.panelKey){
      PopupPanel.instance.moveTop()

      // console.log('moveTopNativeWindow')
      // PopupPanel.instance.nativeWindow.setWindowPos(winctl.HWND.TOPMOST, 0, 0, 0, 0, 83)
      // PopupPanel.instance.nativeWindow.setWindowPos(winctl.HWND.TOP, 0, 0, 0, 0, 83)
    }
  }

  moveTopNativeWindowBw() {
    if (BrowserPanel.contextMenuShowing) return
    this.cpWin.nativeWindowBw.moveTop()
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
