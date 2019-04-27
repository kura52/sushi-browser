import {BrowserWindow, ipcMain} from "electron";
import mainState from "../mainState";
import sharedState from "../sharedStateMain";
import PubSub from "../render/pubsub";
import evem from './evem'

let Browser = new Proxy({},  { get: function(target, name){ Browser = require('./Browser').Browser; return typeof Browser[name] == 'function' ? Browser[name].bind(Browser) : Browser[name]}})
let BrowserPanel = new Proxy({},  { get: function(target, name){ BrowserPanel = require('./BrowserPanel'); return typeof BrowserPanel[name] == 'function' ? BrowserPanel[name].bind(BrowserPanel) : BrowserPanel[name]}})
let webContents = require('./webContents')

export default class BrowserView {

  static _initializer() {
    if (this.isInit) return
    this.isInit = true

    this.webContentsMap = new Map()
  }

  static async createNewTab(browserWindow, panelKey, tabKey, tabIndex, url, topZOrder) {
    // console.log('createNewTab',(panelKey, tabKey, tabIndex, url))
    if (panelKey) {
      const panel = BrowserPanel.getBrowserPanel(panelKey)
      if(panel){
        return panel.addBrowserView(tabKey, url, tabIndex, topZOrder)
      }
      else{
        const panel = await new BrowserPanel({browserWindow, panelKey, tabKey, url})
        return panel.tabKeys[tabKey][1]
      }
    }
  }

  static async newTab(cont, tab) {
    if (tab && tab.openerTabId && !BrowserPanel.hasTabId(tab.openerTabId)) {
      await new Promise(r => setTimeout(r, 20))
      return await this.newTab(cont, tab)
    }
    if (this.newTabCreateing) {
      await new Promise(r => setTimeout(r, 20))
      console.log(999, cont.id)
      return await this.newTab(cont, tab)
    }
    // console.log('newTab', cont)
    // if(!cont.hostWebContents2) return

    let [_1, _2, panel, bv] = BrowserPanel.getBrowserPanelByTabId(cont.id)
    if (bv) return bv
    // console.trace(44445, cont.id)

    this.newTabCreateing = true

    const id = cont.id
    let currentTab
    if (tab) {
      currentTab = await Browser.bg.evaluate((tabId, validIds, windowId) => {
        return new Promise(resolve => {
          chrome.tabs.query({windowId}, tabs => {
            for (let i = tabs.length - 1; i >= 0; i--) {
              if (validIds.includes(tabs[i].id)) return resolve(tabs[i])
            }
            resolve(tabs[0])
          })
        })
      }, id, BrowserPanel.getAllTabIds(), tab.windowId)
    }
    else {
      [tab, currentTab] = await Browser.bg.evaluate((tabId, validIds) => {
        return new Promise(resolve => {
          chrome.tabs.get(tabId, tab => {
            chrome.tabs.query({windowId: tab.windowId}, tabs => {
              for (let i = tabs.length - 1; i >= 0; i--) {
                if (validIds.includes(tabs[i].id)) return resolve([tab, tabs[i]])
              }
              resolve([tab, tabs[0]])
            })
          })
        })
      }, id, BrowserPanel.getAllTabIds())
    }

    console.log(2233, tab, currentTab)

    panel = BrowserPanel.getBrowserPanelByWindowId(tab.windowId)
    if (!panel) {
      await new Promise(r => setTimeout(r, 30))
      panel = BrowserPanel.getBrowserPanelByWindowId(tab.windowId)
    }
    if (panel) {
      const bv = panel.getBrowserView({tabId: tab.id})
      // console.log(77777,bv)
      if (bv) {
        this.newTabCreateing = false
        return bv
      }

      console.log(444451)
      return new Promise(r => {

        const closingFunc = () => {
          this.newTabCreateing = false
          ipcMain.removeListener('create-web-contents-reply', func)
        }
        evem.once(`close-tab_${id}`, closingFunc)

        const func = async (e, newTabId, panelKey, tabKey, tabIds) => {
          console.log('create-web-contents-reply', [id, newTabId], tabIds)
          if (newTabId == id) {

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
            panel.browserWindow.webContents.send('tab-create', {
              id: newTabId,
              openerTabId: tab.openerTabId
            })

            r(data[1])

            this.newTabCreateing = false
            evem.removeListener(`close-tab_${id}`, closingFunc)
            ipcMain.removeListener('create-web-contents-reply', func)
          }
        }
        ipcMain.on('create-web-contents-reply', func)


        const disposition = !mainState.alwaysOpenLinkBackground && tab.active ? 'foreground-tab' : 'background-tab'
        console.log(444453, panel.browserWindow.webContents.getURL(), id)
        panel.browserWindow.webContents.send('create-web-contents', {
          id: tab.openerTabId || currentTab.id,
          targetUrl: tab.url,
          disposition,
          guestInstanceId: id
        })
      })
    }
    else {
      console.log(444452)
      this.newTabCreateing = false
      const [panel, bv] = await new BrowserPanel({webContents: cont, windowId: tab.windowId})
      return bv
    }

  }

  // static async movedTab(cont, windowId, fromIndex, toIndex) { //@TODO NEED FIX
  //   if (!cont.hostWebContents2) return
  //
  //   let [_1, _2, panel, bv] = BrowserPanel.getBrowserPanelByTabId(cont.id)
  //
  //   const toPanel = BrowserPanel.getBrowserPanelByWindowId(windowId)
  //   if (!toPanel) {
  //     if (panel) panel.removeBrowserView(cont.id)
  //
  //     const [_, bv] = await new BrowserPanel({webContents: cont, windowId})
  //     return bv
  //   }
  //   else {
  //     const id = cont.id
  //     await new Promise(async r => {
  //       const func = (e, newTabId, panelKey, tabKey, tabIds) => {
  //         console.log('create-web-contents-reply', [id, newTabId], tabIds)
  //         if (tabIds.includes(id)) {
  //           r()
  //           ipcMain.removeListener('create-web-contents-reply', func)
  //         }
  //       }
  //       ipcMain.on('create-web-contents-reply', func)
  //
  //       cont.hostWebContents2.send('create-web-contents', {id, disposition, guestInstanceId: id})
  //     })
  //
  //     cont.hostWebContents2.send('chrome-tabs-event', {tabId: id}, 'removed')
  //   }
  // }

  static getAllViews() {
    return [...this.webContentsMap.values()]
  }

  static fromWebContents(webContents) {
    return this.webContentsMap.get(webContents)
  }

  constructor(_browserPanel, tabKey, tabId, topZOrder) {
    BrowserView._initializer()

    this._browserPanel = _browserPanel
    this.tabKey = tabKey

    this.webContents = new webContents(tabId)
    this.newTabHandler()
    BrowserView.webContentsMap.set(this.webContents, this)
  }

  newTabHandler() {
    const tabId = this.webContents.id
    sharedState[tabId] = this.webContents

    console.log('newTabHandler', this.webContents.id)

    let win
    for (let w of BrowserWindow.getAllWindows()) {
      console.log(1222, w.getTitle())
      if (w.getTitle().includes('Sushi Browser')) {
        if (!win) win = w
        PubSub.publish("web-contents-created", [tabId, w.webContents])
      }
    }

    this.webContents.on('media-started-playing', (e) => {
      mainState.mediaPlaying[tabId] = true
      for (let win of BrowserWindow.getAllWindows()) {
        if (win.getTitle().includes('Sushi Browser')) {
          if (!win.webContents.isDestroyed()) win.webContents.send('update-media-playing', tabId, true)
        }
      }
    })

    this.webContents.on('media-paused', (e) => {
      delete mainState.mediaPlaying[tabId]
      for (let win of BrowserWindow.getAllWindows()) {
        if (win.getTitle().includes('Sushi Browser')) {
          if (!win.webContents.isDestroyed()) win.webContents.send('update-media-playing', tabId, false)
        }
      }
    })

    this.webContents.on('close', () => {
      delete sharedState[tabId]
      // tab.forceClose()
    })
  }

  setBrowserPanel(browserPanel) {
    this._browserPanel = browserPanel
  }

  isDestroyed() {
    return !!this.destroyed
  }

  destroy(webContentsDestroy = true) {
    this.destroyed = true
    for (const [cont, view] of BrowserView.webContentsMap.entries()) {
      if (view == this) {
        if (webContentsDestroy && !this.webContents.isDestroyed()) this.webContents.destroy()
        BrowserView.webContentsMap.delete(cont)
        delete this._browserPanel.tabKeys[this.tabKey]
        return
      }
    }
  }

  setBounds(bounds) {
    this._browserPanel.setBounds(bounds)
  }
}
