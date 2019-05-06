'use strict'

const ipcMain = require('@electron/internal/browser/ipc-main-internal')

// The history operation in renderer is redirected to browser.
ipcMain.on('ELECTRON_NAVIGATION_CONTROLLER', function (event, method, ...args) {
  event.sender[method](...args)
})

ipcMain.on('ELECTRON_SYNC_NAVIGATION_CONTROLLER', function (event, method, ...args) {
  event.returnValue = event.sender[method](...args)
})

// JavaScript implementation of Chromium's NavigationController.
// Instead of relying on Chromium for history control, we compeletely do history
// control on user land, and only rely on WebContents.loadURL for navigation.
// This helps us avoid Chromium's various optimizations so we can ensure renderer
// process is restarted everytime.
const NavigationController = (function () {
  function NavigationController (webContents) {
    this.webContents = webContents
    this.clearHistory()

    // webContents may have already navigated to a page.
    // if (this.webContents._getURL()) {
    //   this.currentIndex++
    //   this.history.push(this.webContents._getURL())
    // }
    // this.webContents.on('navigation-entry-commited', (event, url, inPage, replaceEntry) => {
    //   if (this.inPageIndex > -1 && !inPage) {
    //     // Navigated to a new page, clear in-page mark.
    //     this.inPageIndex = -1
    //   } else if (this.inPageIndex === -1 && inPage && !replaceEntry) {
    //     // Started in-page navigations.
    //     this.inPageIndex = this.currentIndex
    //   }
    //   if (this.pendingIndex >= 0) {
    //     // Go to index.
    //     this.currentIndex = this.pendingIndex
    //     this.pendingIndex = -1
    //     this.history[this.currentIndex] = url
    //   } else if (replaceEntry) {
    //     // Non-user initialized navigation.
    //     this.history[this.currentIndex] = url
    //   } else {
    //     // Normal navigation. Clear history.
    //     this.history = this.history.slice(0, this.currentIndex + 1)
    //     this.currentIndex++
    //     this.history.push(url)
    //   }
    // })
  }

  NavigationController.prototype.loadURL = function (url, options) {
    if (options == null) {
      options = {}
    }
    this.pendingIndex = -1
    this.webContents._loadURL(url, options)
    return this.webContents.emit('load-url', url, options)
  }

  NavigationController.prototype.getURL = function () {
    return this.webContents._getURL()
  }

  NavigationController.prototype.stop = function () {
    this.pendingIndex = -1
    return this.webContents._stop()
  }

  NavigationController.prototype.reload = function () {
    this.pendingIndex = this.currentIndex
    return this.webContents.reload()
  }

  NavigationController.prototype.reloadIgnoringCache = function () {
    this.pendingIndex = this.currentIndex
    return this.webContents.reloadIgnoringCache()
  }

  NavigationController.prototype.canGoBack = function () {
    return this.webContents.canGoBack()
  }

  NavigationController.prototype.canGoForward = function () {
    return this.webContents.canGoForward()
  }

  NavigationController.prototype.canGoToIndex = function (index) {
    return index >= 0 && index < this.history.length
  }

  NavigationController.prototype.canGoToOffset = function (offset) {
    return this.webContents.canGoToOffset()
  }

  NavigationController.prototype.clearHistory = function () {
    this.history = []
    this.currentIndex = -1
    this.pendingIndex = -1
    this.inPageIndex = -1
  }

  NavigationController.prototype.goBack = function () {
    if (!this.canGoBack()) {
      return
    }
    this.pendingIndex = this.getActiveIndex() - 1
    return this.webContents._goBack()
  }

  NavigationController.prototype.goForward = function () {
    if (!this.canGoForward()) {
      return
    }
    this.pendingIndex = this.getActiveIndex() + 1
    return this.webContents._goForward()
  }

  NavigationController.prototype.goToIndex = function (index) {
    if (!this.canGoToIndex(index)) {
      return
    }
    this.pendingIndex = index
    return this.webContents._loadURL(this.history[this.pendingIndex], {})
  }

  NavigationController.prototype.goToOffset = function (offset) {
    if (!this.canGoToOffset(offset)) {
      return
    }

    return this.webContents._goToOffset(offset)
    // const pendingIndex = this.currentIndex + offset
    // if (this.inPageIndex > -1 && pendingIndex >= this.inPageIndex) {
    //   this.pendingIndex = pendingIndex
    //   return this.webContents._goToOffset(offset)
    // } else {
    //   return this.webContents.goToIndex(pendingIndex)
    // }
  }

  NavigationController.prototype.getActiveIndex = function () {
    const pendingIndex = this.webContents.getPendingEntryIndex()
    if (pendingIndex === -1) {
      return this.webContents.getCurrentEntryIndex()
    } else {
      return pendingIndex
    }
  }

  NavigationController.prototype.length = function () {
    return this.webContents.getEntryCount()
  }

  return NavigationController
})()

module.exports = NavigationController
