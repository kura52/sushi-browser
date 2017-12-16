const {BrowserWindow, webContents,dialog,ipcMain,app,shell} = require('electron')
import mainState from './mainState'
const Aria2cWrapper = require('./Aria2cWrapper')
const FfmpegWrapper = require('./FfmpegWrapper')
const {redirectUrlsCache} = require('../brave/adBlock')

const path = require('path')
import {download,downloader} from './databaseFork'
import PubSub from './render/pubsub'
import fs from 'fs'
const URL = require('url')
const downloadPath = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/download.html'
const downloadPath2 = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/download_all.html'
const timeMap = new Map()
global.downloadItems = []
const retry = new Set()


function exec(command) {
  console.log(command)
  return new Promise(function(resolve, reject) {
    require('child_process').exec(command, function(error, stdout, stderr) {
      if (error) {
        return reject(error);
      }
      resolve({stdout, stderr});
    });
  });
}

function shellEscape(s){
  return '"'+s.replace(/(["\s'$`\\])/g,'\\$1')+'"'
}

function set(map,url,value){
  if(map[url] === void 0){
    map[url] = [value]
  }
  else{
    map[url].push(value)
  }
}


export default class Download {
  getData(map,url){
    if(map[url] === void 0){
      const rUrl = redirectUrlsCache.get(url)
      if(rUrl){
        return this.getData(map,rUrl)
      }
    }
    else{
      const shifted = map[url].shift()
      if(!map[url].length) delete map[url]
      if(shifted !== void 0) this.orgUrl = url
      return shifted
    }
  }

  constructor(win){
    this.needSavePath = {}
    this.savePath = {}
    this.dlKey = {}
    this.saveDirectory = {}
    this.audioExtract = {}
    this.overwrite = {}

    const eventNeedSetSaveFilename = (event,url)=>{
      set(this.needSavePath,url,true)
    }

    ipcMain.on('set-save-path',(e,url,fname,absolute)=>{
      set(this.savePath,url,absolute ? fname : path.join(app.getPath('downloads'), fname))
    })

    ipcMain.on('set-download-key',(e,url,key)=>{
      set(this.dlKey,url,key)
    })

    ipcMain.on('set-save-directory',(e,url,directory)=>{
      set(this.saveDirectory,url,directory)
    })

    ipcMain.on('set-audio-extract',(e,url)=>{
      set(this.audioExtract,url,true)
    })

    ipcMain.on('need-set-save-filename',(e,url)=>{
      set(this.needSavePath,url,true)
    })
    // ipcMain.on('need-set-save-filename',eventSetSaveFilename)
    PubSub.subscribe('need-set-save-filename',eventNeedSetSaveFilename)

    const ses = win.webContents.session
    ses.on('will-download', (event, item, webContents) => {
      if (!webContents || webContents.isDestroyed()) {
        event.preventDefault()
        return
      }

      // let initialNav = false
      // const controller = webContents.controller()
      // if (controller && controller.isValid() && controller.isInitialNavigation()) {
      //   console.log('webContents.forceClose()',webContents.getURL())
      //   webContents.forceClose()
      //   initialNav = true
      // }

      console.log(item)

      // item.setSavePath(path.join(app.getPath('temp'),Math.random().toString()))
      // item.pause()
      // item.setPrompt(false)

      let active = true, url,fname
      try{
        url = item.getURL()
        this.orgUrl = url
        fname = item.getFilename()
      }catch(e){
        console.log(e)
        return
      }

      if(!retry.has(url)){
        console.log('cancel')
        item.destroy()
        // const _item = item
        // setTimeout(_=>{if(!_item.isDestroyed())_item.cancel(),1000})
        active = false
      }

      let savePath = this.getData(this.savePath,url),
      audioExtract = this.getData(this.audioExtract,url),
      overwrite = false

      if(url.startsWith("file://")){
        if(active){
          item.destroy()
        }
        return
      }

      const bw = (!webContents.isDestroyed() && BrowserWindow.fromWebContents(webContents)) || BrowserWindow.getFocusedWindow()
      if(bw !== win) return

      win.webContents.send(`download-start-tab_${webContents.getId()}`)

      const needSavePath = this.getData(this.needSavePath,url)

      if(needSavePath){
        console.log("needSavePath")
        const filepath = dialog.showSaveDialog(win,{defaultPath: path.join(app.getPath('downloads'), fname || path.basename(url)) })
        if(!filepath){
          if(active){
            item.destroy()
          }
          return
        }
        savePath = filepath
        overwrite = true
      }
      else if(!savePath){
        if(url.endsWith(".pdf") || url.endsWith(".PDF") ){
          if(active){
            item.destroy()
          }
          return
        }
        const saveDirectory = this.getData(this.saveDirectory,url)
        // console.log(3333000,saveDirectory)
        savePath = path.join(saveDirectory || app.getPath('downloads'), fname || path.basename(url))
      }

      if (retry.has(url)) {
        console.log('retry')
        retry.delete(url)
        if(this.getData(overwrite,url)){
          savePath = this.getUniqFileName(savePath)
        }
        item.setPrompt(false)
        item.setSavePath(savePath)
        timeMap.set(savePath, Date.now())
        this.downloadReady(item, url, webContents,win)
      }
      else {
        // console.log(JSON.stringify({a: mainState.downloadNum}))
        // const postData = process.downloadParams.get(url)
        // // console.log(postData,url)
        // if(postData && (Date.now() - postData[1] < 100 * 1000)){
        //   process.downloadParams.delete(url)
        //   this.downloadReady(item, url, webContents,win)
        //   return
        // }
        let id, updated, ended, isError,
          mimeType = item.getMimeType()

        const aria2cKey = this.getData(this.dlKey,url)
        const dl = new Aria2cWrapper({url,orgUrl:this.orgUrl,mimeType,savePath,downloadNum: mainState.downloadNum,overwrite,timeMap,aria2cKey})

        dl.download().then(_=>{
          dl.once('error', (_) => {
            console.log('error')
            win.webContents.send('download-progress', this.buildItem(dl));
            if(!isError){
              isError = true
              retry.add(url)
              global.downloadItems = global.downloadItems.filter(i => i !== dl)
              set(this.savePath,url,savePath)
              set(this.audioExtract,url,audioExtract)
              if(overwrite) set(this.overwrite,url,true)
              webContents.downloadURL(url, true)
            }
          })
          this.downloadReady(dl, url, webContents,win,audioExtract)
        })

      }
    })
  }

  downloadReady(item, url, webContents,win,audioExtract) {
    global.downloadItems.push(item)

    const eventPause = (event, data, type) => {
      console.log('resume',data,item)
      if (data.key ? data.key !== item.key : data.savePath !== item.getSavePath()) return
      if(type == 'resume'){
        item.resume()
      }
      else if(type == 'pause'){
        item.pause()
      }
      else if (item.isPaused())
        item.resume()
      else
        item.pause()
    }
    ipcMain.on('download-pause', eventPause)

    const eventCancel = (event, data) => {
      if (data.key ? data.key !== item.key : data.savePath !== item.getSavePath()) return
      item.cancel()
      ipcMain.removeListener('download-pause', eventPause)
      ipcMain.removeListener('download-cancel', eventCancel)
      global.downloadItems = global.downloadItems.filter(i => i !== item)
      // timeMap.delete(item.getSavePath())
    }
    ipcMain.on('download-cancel', eventCancel)

    item.on('updated', (event, state) => {
      for (let wc of this.getDownloadPage()) {
        wc.send('download-progress', this.buildItem(item))
      }
      win.webContents.send('download-progress', this.buildItem(item))
    })

    item.once('done', async (event, state) => {
      console.log(111,audioExtract)
      if(audioExtract){
        new FfmpegWrapper(item.getSavePath()).exe(_=>_)
      }
      for (let wc of this.getDownloadPage()) {
        wc.send('download-progress', this.buildItem(item))
      }
      win.webContents.send('download-progress', this.buildItem(item))

      download.insert({
        state: item.getState(),
        savePath: item.getSavePath(),
        filename: path.basename(item.getSavePath()),
        url: url,
        totalBytes: item.getTotalBytes(),
        now: Date.now(),
        created_at: Date.now(),
        updated_at: Date.now()
      })

      ipcMain.removeListener('download-pause', eventPause)
      ipcMain.removeListener('download-cancel', eventCancel)
      global.downloadItems = global.downloadItems.filter(i => i !== item)
      timeMap.delete(item.getSavePath())
      // ipcMain.removeListener('set-save-filename',eventSetSaveFilename)
    })
    win.webContents.send('download-start')
  }


  makePath(basePath,index){
    if(index === 0) return basePath
    const base = path.basename(basePath)
    const val = base.lastIndexOf('.')
    if(val == -1){
      return `${basePath} (${index})`
    }
    else{
      return path.join(path.dirname(basePath),`${base.slice(0,val)} (${index})${base.slice(val)}`)
    }
  }

  getUniqFileName(basePath,index=0){
    const savePath = this.makePath(basePath,index)
    return fs.existsSync(savePath) ? this.getUniqFileName(basePath,index+1) : savePath
  }

  buildItem(item) {
    return {
      key: item.key,
      isPaused: item.isPaused(),
      canResume: item.canResume(),
      url: item.getURL(),
      filename: path.basename(item.getSavePath()),
      receivedBytes: item.getReceivedBytes(),
      totalBytes: item.getTotalBytes(),
      state: item.getState(),
      speed: item.speed ? item.speed.replace('i','') : void 0,
      savePath: item.getSavePath(),
      startTime: timeMap.get(item.getSavePath()),
      now: Date.now()
    };
  }

  getDownloadPage(){
    return webContents.getAllWebContents().filter(wc=>{
      const a = wc.getURL().replace(":///","://")
      return a === downloadPath.replace(/\\/g,'/').replace(":///","://") || a === downloadPath2.replace(/\\/g,'/').replace(":///","://")
    })
  }
}

downloader.find({isPaused:false,state:"progressing"}).then(records=>{
  for(let item of records){
    ipcMain.emit("download-retry", null, item.url, item.savePath, item.key) //元アイテムを消す
  }
})