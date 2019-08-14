import robot from 'robotjs'
import {app, BrowserWindow, ipcMain, nativeImage, webContents as _webContents} from 'electron'
import {EventEmitter} from 'events'
import evem from './evem'
import fs from 'fs'
import winctl from "../../resource/winctl";
import DpiUtils from './DpiUtils'
import mainState from "../mainState";

let Browser = new Proxy({},  { get: function(target, name){ Browser = require('./Browser').Browser; return typeof Browser[name] == 'function' ? Browser[name].bind(Browser) : Browser[name]}})
let BrowserPanel = new Proxy({},  { get: function(target, name){ BrowserPanel = require('./BrowserPanel'); return typeof BrowserPanel[name] == 'function' ? BrowserPanel[name].bind(BrowserPanel) : BrowserPanel[name]}})
let BrowserView = new Proxy({},  { get: function(target, name){ BrowserView = require('./BrowserView'); return typeof BrowserView[name] == 'function' ? BrowserView[name].bind(BrowserView) : BrowserView[name]}})

let isFirstLoad

export default class webContents extends EventEmitter {

  static _initializer() {
    if (this.isInit) return
    this.isInit = true

    this.webContentsMap = new Map()
    this.activedIds = []

    ipcMain.on('disable-webContents-focus', (e,val)=>{
      console.log('webContents.disableFocus1' ,val)
      webContents.disableFocus = val
    })

    ipcMain.on('arrange-panels', (e,val)=>{
      console.log('webContents.disableFocus2' ,val)
      webContents.disableFocus = val

      const bw = BrowserWindow.fromWebContents(e.sender)
      const panels = BrowserPanel.getBrowserPanelsFromBrowserWindow(bw)
      if(val){
        Browser.disableOnActivated.add(bw.id)
        for(const panel of panels){
          panel.cpWin.nativeWindowBw.setWindowPos(winctl.HWND.TOPMOST, 0, 0, 0, 0, 83)
        }
      }
      else{
        Browser.disableOnActivated.delete(bw.id)
        for(const panel of panels){
          panel.cpWin.nativeWindowBw.setWindowPos(winctl.HWND.NOTOPMOST, 0, 0, 0, 0, 83)
        }
      }
    })


    ipcMain.on('webContents_event', async (e, name, tabId, key, ...args)=>{
      const cont = this.fromId(tabId)
      if(cont){
        let val
        try{
          if(name == 'executeJavaScript'){
            val = await new Promise(r=>cont[name](...args,(result)=>r(result)))
          }
          else{
            val = await cont[name](...args)
          }
        }catch(e2){

        }finally{
          if(key){
            e.sender.send(`webContents_event_${tabId}_${key}`, val)
          }
          else{
            e.returnValue = val
          }
        }
      }
      else{
        if(key){
          e.sender.send(`webContents_event_${tabId}_${key}`, null)
        }
        else{
          e.returnValue = null
        }
      }
    })
  }

  static getAllWebContents(){
    try{
      return [...this.webContentsMap.values(), ..._webContents.getAllWebContents()]
    }catch(e){
      return [..._webContents.getAllWebContents()]
    }
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
    return id ? this.webContentsMap.get(id) || _webContents.fromId(id) : null
  }

  static async reopenLastClosedTab(){
    return Browser.bg.evaluate(() => {
      return new Promise(resolve => {
        chrome.sessions.getRecentlyClosed((sessions) => {
          chrome.sessions.restore((sessions[0].tab || sessions[0].window).sessionId, () => resolve())
        })
      })
    })
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

    this.setMaxListeners(0)
    this._initEvent()

    // this.session
    // this.hostWebContents
    // this.devToolsWebContents
    // this.debugger
  }

  async _initEvent(){

    const page = await this._getPage()

    this._evEvents[`webNavigation-onBeforeNavigate_${this.id}`] = (details) =>{
      // console.log('did-finish-load', extFrameId == 0 ? 'main' : 'sub')
      if(details.frameId == 0){
        this.emitAndSend('did-start-loading', {sender: this} ,this.id)
      }
    }

    this._evEvents[`webNavigation-onCompleted_${this.id}`] = (details) =>{
      // console.log('did-finish-load', extFrameId == 0 ? 'main' : 'sub')
      if(details.frameId == 0){
        this.emitAndSend('did-finish-load', {sender: this})
      }
    }

    this._evEvents[`webNavigation-onCommitted_${this.id}`] = (details) =>{
      if(details.frameId == 0){
        this.emitAndSend('did-fail-load', {sender: this}, -3, void 0, details.url)
      }
    }

    this._evEvents[`webNavigation-onErrorOccurred_${this.id}`] = (details) =>{
      if(details.frameId == 0){
        this.emitAndSend('did-fail-load', {sender: this}, details.error, void 0, details.url)
      }
    }

    //'did-fail-load'

    this._pEvents['frameStartedLoading'] = frame => {
      if(!frame.parentFrame()){
        console.log('did-start-loading', !frame.parentFrame(),this.id)
        this.emitAndSend('did-start-loading', {sender: this} ,this.id)
        // this.emit('did-start-navigation', {sender: this}, frame.url(), true, !frame.parentFrame())
      }
    }
    this._pEvents['frameStoppedLoading'] = frame => {
      // console.log('did-stop-loading', !frame.parentFrame())
      if(!frame.parentFrame()){
        this.emitAndSend('did-stop-loading', {sender: this})
      }
    }
    this._pEvents['domcontentloaded'] = () => {
      // console.log('dom-ready')
      console.log(91,'dom-ready')
      this.emit('dom-ready', {sender: this})
    }

    this._evEvents[`tabs-onUpdated_${this.id}`] = (changeInfo) =>{
      console.log(91,'updated',changeInfo)
      if(changeInfo.favIconUrl != null){
        // console.log('page-favicon-updated')
        this.emitAndSend('page-favicon-updated', {sender: this}, [changeInfo.favIconUrl])
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
        this.emitAndSend('page-title-updated', {sender: this}, changeInfo.title)
      }
    }

    // 'new-window'

    this._pEvents['framenavigated'] = frame => {
      if(!frame.parentFrame()) {
        console.log('did-start-navigation', !frame.parentFrame())
        this.emitAndSend('did-start-navigation', {sender: this}, frame.url(), true, !frame.parentFrame())
      }
    }

    this._pEvents['close'] = event => {
      console.log('destroyed')
      const data = BrowserPanel.getBrowserPanelByTabId(this.id)
      if(data[3]) data[3].destroy(false)

      for(let event of Object.entries(this._evEvents)) evem.removeListener(...event)
      for(let event of Object.entries(this._pEvents)) page.removeListener(...event)

      webContents.webContentsMap.delete(this.id)
      this.emitAndSend('destroyed')
      this.destroyed = true
    }

    // 'devtools-opened'
    // 'found-in-page'
    // 'cursor-changed'
    // 'context-menu'

    for(let event of Object.entries(this._evEvents)) evem.on(...event)
    for(let event of Object.entries(this._pEvents)) page.on(...event)

  }

  emitAndSend(name, event, ...args){
    // console.log(91, name)
    this.emit(name, event, ...args)
    for (let win of BrowserWindow.getAllWindows()) {
      if (win.getTitle().includes('Sushi Browser')) {
        if (!win.webContents.isDestroyed()){
          win.webContents.send(`${name}_${this.id}`, ...args)
        }
      }
    }
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
    this._getBrowserPanel().cpWin.chromeNativeWindow.setForegroundWindowEx()
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

  async getHostWebContents2Aasync(){
    for(let i=0;i<100;i++){
      const bp = this._getBrowserPanel()
      const ret = bp && bp.browserWindow.webContents
      if(ret) return ret
      await new Promise(r=>setTimeout(r,100))
    }
  }


  destroy(){
    console.log('2222sclose', this.id)
    const page = this._getPage()
    if(page.constructor.name == 'Promise'){
      page.then(page=>{
        if(!page.isClosed()){
          // const bp = this._getBrowserPanel()
          // if(Object.keys(bp.tabKeys).length == 1) bp.cpWin.chromeNativeWindow.setParent(null)
          page.close()
        }
      })
    }
    else{
      if(!page.isClosed()){
        // const bp = this._getBrowserPanel()
        // if(Object.keys(bp.tabKeys).length == 1)  bp.cpWin.chromeNativeWindow.setParent(null)
        page.close()
      }
    }
  }

  async loadURL(url, options){
    if(isFirstLoad === void 0){
      isFirstLoad = false
      if(!(await require('../databaseFork').state.findOne({key: 1}))){
        try{
          require('../BrowserWindowPlus').saveState(this._getBrowserPanel().browserWindow,_=>{})
        }catch(e){}
        url = 'chrome://welcome/'
      }
    }

    try{ new URL(url) }catch(e){ url = mainState.searchProviders[mainState.searchEngine].search.replace('%s',url) }
    Browser.bg.evaluate((tabId, url) => {
      return new Promise(resolve => {
        chrome.tabs.update(tabId, {url}, tab => resolve(tab))
      })
    }, this.id, url)
  }

  loadFile(filePath, options){
    this.loadURL(`file://${filePath}`, options)
  }

  downloadURL(url, referer){
    Browser.downloadURL(url, this, referer)
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
    if(webContents.disableFocus || this._bindWindow) return

    const panel = this._getBrowserPanel()
    if(!panel || panel.cpWin.nativeWindow.hidePanel) return

    if(require('../util').getCurrentWindow().id == panel.browserWindow.id){
      this.setForegroundWindow()
      // panel.moveTopNativeWindow()
      // console.trace('focus')
    }
  }

  moveTop(){
    if(webContents.disableFocus || this._bindWindow) return

    const panel = this._getBrowserPanel()
    if(!panel || panel.cpWin.nativeWindow.hidePanel) return

    if(require('../util').getCurrentWindow().id == panel.browserWindow.id){
      // console.log('moveTopNativeWindow5')
      panel.moveTopNativeWindow()
    }
  }

  setActive(){
    webContents.activedIds.push([this.id, Date.now()])
    this._updateTab({active: true})
  }

  setForegroundWindow(){
    if(webContents.disableFocus || this._bindWindow) return

    const panel = this._getBrowserPanel()
    if(!panel || panel.cpWin.nativeWindow.hidePanel) return
    panel.cpWin.chromeNativeWindow.setForegroundWindowEx()
  }

  async isFocused(){
    return (await this._getTabInfo()).active
  }

  async isLoading(){
    return (await this._getTabInfo()).status == 'loading'
  }

  async isComplete() {
    return (await this._getTabInfo()).status == 'complete';
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
    return this.userAgent || await Browser.getUserAgent()
  }

  async insertCSS(css){
    (await this._getPage()).addStyleTag({content: css})
  }

  async executeJavaScript(code, userGesture, callback){
    if(typeof userGesture === 'function') [userGesture, callback] = [null, userGesture]

    try{
      const value = await (await this._getPage()).evaluate(code)
      callback && callback(value)
      return value
    }catch(e){
      callback && callback(null)
    }
  }

  executeJavaScriptInIsolate(code, userGesture, callback){
    if(typeof userGesture === 'function') [userGesture, callback] = [null, userGesture]

    Browser.bg.evaluate((tabId, code) => {
      return new Promise(resolve => {
        chrome.tabs.executeScript(tabId, {code}, (result) => resolve(result))
      })
    }, this.id, code).then(result=>callback && callback(result[0]))
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
    this.executeJavaScriptInIsolate("document.execCommand('cut')")
  }

  copy(){
    this.executeJavaScriptInIsolate("document.execCommand('copy')")
  }

  copyImageAt(x, y){
    //@TODO
  }

  paste(){
    this.executeJavaScriptInIsolate("document.execCommand('paste')")
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

  async capturePage(rect, callback, noActiveSkip, fullPage ){
    if (typeof(rect) == 'function') {
      [callback, noActiveSkip, rect] = [rect, callback, void 0]
    }

    if(noActiveSkip){
      const active = await Browser.bg.evaluate((tabId) => {
        return new Promise(resolve => {
          chrome.tabs.get(tabId,tab => resolve(tab.active))
        })
      },this.id)
      if(!active){
        callback(null)
        return
      }
    }

    const start = Date.now()
    if(rect || fullPage || this.getURL().startsWith('chrome')){
      this._getPage().screenshot({clip: rect, fullPage}).then(image=>{
        console.log(11,Date.now() - start)
        const img = nativeImage.createFromBuffer(image)
        console.log(12,Date.now() - start)
        callback(img)
      })
    }
    else{
      const dataUrl = await Browser.bg.evaluate((tabId) => {
        return new Promise(resolve => {
          // chrome.tabs.getCurrent(ctab => {
          chrome.tabs.update(tabId, {active: true},(tab)=>{
            if(chrome.runtime.lastError) resolve()
            chrome.tabs.captureVisibleTab(tab.windowId, {format: 'png'}, (dataUrl) => {
              if(chrome.runtime.lastError) resolve()
              resolve(dataUrl)
              // chrome.tabs.update(ctab.id, {active: true})
            })
          })
          // })
        })
      },this.id)

      console.log(11,Date.now() - start)
      if(dataUrl){
        const img = nativeImage.createFromDataURL(dataUrl)
        callback(img)
      }
      else{
        callback()
      }
      console.log(12,Date.now() - start)
    }

    // this._getPage().screenshot({clip: rect, encoding: 'png'}).then(image=>callback(nativeImage.createFromBuffer(image)))


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
    this._sendKey('j',['control','shift'])
  }

  closeDevTools(){
    this._sendKey('j',['control','shift'])
  }

  isDevToolsOpened(){
    //@TODO
  }

  isDevToolsFocused(){
    //@TODO
  }

  toggleDevTools(){
    this._sendKey('j',['control','shift'])
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
      await this._modifiers(event, async ()=>{
        await mouse.move(event.x, event.y)
        await mouse.down({button: event.button, clickCount: event.clickCount})
      })
    }
    else if(event.type == 'mouseUp'){
      await this._modifiers(event, async ()=>{
        await mouse.move(event.x, event.y)
        await mouse.up({button: event.button, clickCount: event.clickCount})
      })
    }
    else if(event.type == 'click'){
      await this._modifiers(event, async ()=>{
        await mouse.click({x: event.x, y: event.y})
      })
    }
    else if(event.type == 'mouseWheel'){
      await this._modifiers(event, async ()=>{
        await mouse.move(event.x, event.y)
        await mouse.wheel({deltaX: event.deltaX * -1, deltaY: event.deltaY * -1})
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
      await this._modifiers(event, async ()=>{
        //@TODO
        await keyboard.down(event.keyCode)
      })
    }
    else if(event.type == 'keyUp'){
      await this._modifiers(event, async ()=>{
        //@TODO
        await keyboard.up(event.keyCode)
      })
    }
    else if(event.type == 'char'){
      await this._modifiers(event, async ()=>{
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
    const now = Date.now()

    if(!this.navCache || now - this.navCache[0] > 50){
      let val = (await this._getPage()).getNavigationHistory()
      this.navCache = [now, val]
    }
    return this.navCache[1]
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

  async duplicate(){
    return Browser.bg.evaluate((tabId) => {
      return new Promise(resolve => {
        chrome.tabs.duplicate(tabId, () => resolve())
      })
    }, this.id)
  }

  bindWindow(val){
    this._bindWindow = val
    const [_1, _2, panel, _3] = BrowserPanel.getBrowserPanelByTabId(this.id)
    panel.bindWindow(val)
  }

  async emulate(device){
    const page = await this._getPage()
    page.emulate(device);
    const devtoolsProtocolClient = await page.target().createCDPSession()
    await devtoolsProtocolClient.send("Emulation.setEmitTouchEventsForMouse", { enabled: true })
  }

  async viewport(){
    const page = await this._getPage()
    return page.viewport()
  }

  async setViewport(viewport){
    const page = await this._getPage()

    const [_1, _2, panel, _3] = BrowserPanel.getBrowserPanelByTabId(this.id)

    if(panel.browserWindow._fullscreen){
      page.setViewport(null)
      return
    }

    const dim = await DpiUtils.dimensions(panel.cpWin.nativeWindow)
    const width = dim.right - dim.left

    const url = page.url()

    if(this.viewPortUrl && this.viewPortUrl != url && !url.startsWith('chrome') && this.viewPortUrl.startsWith('chrome')){
      await page.setViewport(null)
      await Browser.bg.evaluate((windowId) => {
        return new Promise(resolve => {
          chrome.windows.update(windowId,{width: 600},window => resolve())
        })
      },panel.windowId)
      delete this.viewPortUrl
      console.log('reset',this.viewPortUrl, url)
    }

    const _viewport = page.viewport()

    if(!_viewport){
      if(width < 500){
        await page.setViewport(viewport)
        this.viewPortUrl = url
      }
      return
    }
    else if(width > 500){
      await page.setViewport(null)
      delete this.viewPortUrl
      return
    }

    if(_viewport.width != viewport.width || _viewport.height != viewport.height){
      await page.setViewport(viewport)
      this.viewPortUrl = url
    }
  }

  toggleFullscreen(){
    this._sendKey('f11')
  }

  async getLayoutMetrics(){
    return (await this._getPage())._client.send('Page.getLayoutMetrics')
  }

  openChromeMenu(){
    this._sendKey('f', 'alt')
  }
}