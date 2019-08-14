const mainState = require('../../../lib/mainState')
const electron = require('electron')
const winctl = require("../index")
const childProcess = require('child_process')
const util = require('util')
const path = require("path")
const {execSync} = childProcess
const exec = util.promisify(childProcess.exec)

let Browser = new Proxy({},  { get: function(target, name){ Browser = require('../../../lib/remoted-chrome/Browser').Browser; return typeof Browser[name] == 'function' ? Browser[name].bind(Browser) : Browser[name]}})

function scaling(num){
  return Math.round(num * mainState.scaleFactor)
}

class WinCtl{

  static moveTopFunc(){
    setTimeout(()=>{
      if(this.moveTopQueue.length){
        const winctlList = [...new Set(this.moveTopQueue.reverse())].reverse()
        this.moveTopQueue = []
        this.moveTopMain(winctlList)
      }
      this.moveTopFunc()
    },50)
  }

  static async moveTopMain(ids){
    this.moveTopTime = Date.now()

    let focusedWin
    for(const bw of electron.BrowserWindow.getAllWindows()){
      if(bw.isFocused()){
        focusedWin = new WinCtl()
        focusedWin.setBrowserWindow(bw)
        break
      }
    }

    if(!focusedWin){
      const winId = await Browser.bg.evaluate(() => {
        return new Promise(resolve => {
          chrome.windows.getAll((wins)=>{
            for(const win of wins){
              if(win.focused) return resolve(win.id)
            }
            resolve(null)
          })
        })
      })

      if(winId){
        focusedWin = new WinCtl()
        focusedWin.setChromeWindowId(winId)
      }
    }

    let chromeUpdateded = false
    for(const _id of ids){
      const id = parseInt(_id.slice(1))
      if(_id[0] == 'c' && focusedWin){
        await Browser.bg.evaluate((windowId) => {
          return new Promise(resolve => {
            chrome.windows.update(windowId, {focused: true}, () => resolve())
          })
        }, id)
        chromeUpdateded = true
      }
      else{
        electron.BrowserWindow.fromId(id).moveTop()
      }
    }
    if(chromeUpdateded && focusedWin){
      if(focusedWin.id[0] == 'c'){
        await Browser.bg.evaluate((windowId) => {
          return new Promise(resolve => {
            chrome.windows.update(windowId, {focused: true}, () => resolve())
          })
        }, parseInt(focusedWin.id.slice(1)))
      }
      else{
        focusedWin.bw.focus()
      }
    }
  }

  static _initializer(){
    this.HWND = {
      NOTOPMOST: -2,
      TOPMOST: -1,
      TOP: 0,
      BOTTOM: 1
    }
    this.moveTopTime = 0
    this.moveTopQueue = []

    this.moveTopFunc()
  }

  static GetActiveWindow2() {
    for(const bw of electron.BrowserWindow.getAllWindows()){
      if(bw.isFocused()){
        const win = new WinCtl()
        win.setBrowserWindow(bw)
        return win
      }
    }

    if(Browser.focusedWindowId != -1){
      const win = new WinCtl()
      win.setChromeWindowId(Browser.focusedWindowId)
      return win
    }

    return new WinCtl(-1)
  }

  static WindowFromPoint2() {
    return false //@TODO
  }

  constructor(id){
    this.id = id
  }

  setChromeWindowId(windowId){
    this.windowId = windowId
    this.id = 'c' + windowId
  }

  setBrowserWindow(bw){
    this.bw = bw
    this.id = 'b' + bw.id
  }

  getTitle(){
    if(this.windowId){
      return Browser.bg.evaluate((windowId) => {
        return new Promise(resolve => chrome.windows.get(windowId, () => resolve()))
      }, this.windowId)
    }
    else if(this.bw){
      return this.bw.getTitle()
    }
  }

  getHwnd(){
    return this.id
  }

  getClassName(){
    return '' //no-op
  }

  setForegroundWindowEx(){
    if(this.windowId){
      return Browser.bg.evaluate((windowId) => {
        return new Promise(resolve => chrome.tabs.query({windowId, active: true},
          (tabs) => resolve(tabs[0].title)))
      }, this.windowId)
    }
    else if(this.bw){
      return this.bw.focus()
    }
  }

  setWindowPos(type){
    //@TODO
    // if(this.bw){
    //   if(type == WinCtl.HWND.TOPMOST){
    //     this.bw.setAlwaysOnTop(true)
    //   }
    //   else if(type == WinCtl.HWND.NOTOPMOST){
    //     this.bw.setAlwaysOnTop(false)
    //   }
    // }
    // else{
    //   if(type == WinCtl.HWND.TOPMOST){
    //   }
    //   else if(type == WinCtl.HWND.NOTOPMOST){
    //   }
    // }
  }

  moveTop(){
    WinCtl.moveTopQueue.push(this.id)
  }

  setWindowLongPtr(){
    // no-op
  }

  setWindowLongPtrRestore(){
    // no-op
  }

  setWindowLongPtrEx(val){
    // if(val == 0x00000080){
    //   execSync(`${wmctrl} -vi -r ${this.id} -b 'add,skip_taskbar' 2>&1`)
    // }
  }

  setWindowLongPtrExRestore(){
    // if(val == 0x00000080){
    //   execSync(`${wmctrl} -vi -r ${this.id} -b 'remove,skip_taskbar' 2>&1`)
    // }
  }

  setParent(){
    // no-op
  }

  async showWindow(nCmdShow){
    if(!this.windowId) return

    if(nCmdShow == 0 || nCmdShow == 6){ //SW_HIDE, SW_MINIMIZE
      Browser.bg.evaluate((windowId) => chrome.windows.update(windowId, {state: 'minimized'}), this.windowId)
    }
    else if(nCmdShow == 5){ //SW_SHOW
      Browser.bg.evaluate((windowId) => chrome.windows.update(windowId, {focused: true}), this.windowId)
    }
    else if(nCmdShow == 9){ //SW_RESTORE
      Browser.bg.evaluate((windowId) => chrome.windows.update(windowId, {state: 'normal'}), this.windowId)
    }
  }

  async move(x, y, width, height){
    // console.trace(x,y,width,height)
    // x = scaling(x)
    // y = scaling(y)
    // width = scaling(width)
    // height = scaling(height)

    if(this.windowId){
      await Browser.bg.evaluate((windowId, left,top,width,height) => {
        return new Promise(resolve => {
          chrome.windows.update(windowId, {left,top,width,height}, () => resolve())
        })
      }, this.windowId, x,y,width,height)
    }
    else if(this.bw){
      this.bw.setBounds({ x: left, y: top, width, height })
    }
  }

  moveRelative(){
    // no-op
  }

  async dimensions(){
    if(this.windowId){
      return Browser.bg.evaluate((windowId) => {
        return new Promise(resolve => {
          chrome.windows.get(windowId, (win) =>
            resolve({left: win.left, top: win.top, right: win.left + win.width, bottom: win.top + win.height}))
        })
      }, this.windowId)
    }
    else if(this.bw){
      const bounds = this.bw.getBounds()
      return {left: bounds.x, top: bounds.y, right: bounds.x + bounds.width, bottom: bounds.y + bounds.height}
    }
  }

  destroyWindow(){
    if(this.windowId){
      return Browser.bg.evaluate((windowId) => {
        return new Promise(resolve => chrome.windows.remove(windowId, () => resolve()))
      }, this.windowId)
    }
    else if(this.bw){
      this.bw.destroy()
    }
  }

}

WinCtl._initializer()

module.exports = WinCtl;