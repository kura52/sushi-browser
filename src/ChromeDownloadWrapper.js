import {downloader} from './databaseFork'
import {Browser} from './remoted-chrome/Browser'
import {EventEmitter} from 'events'
import path from 'path'
import {ipcMain} from "electron";

export default class ChromeDownloadWrapper extends EventEmitter {
  constructor(item){
    super()
    this.item = item
    this.key = item.id

    this.startObserve()
  }

  startObserve(){
    if(this.intervalId) return
    this.intervalId = setInterval(async ()=>{
      await this.updateState()

      if(this.item.error){
        clearInterval(this.intervalId)
        this.emit('error')
      }
      if(this.item.state == 'complete'){
        clearInterval(this.intervalId)
        this.emit('done')
      }
    },1000)
  }

  async updateState(){
    const item = await Browser.bg.evaluate(downloadId => {
      return new Promise(resolve => {
        chrome.downloads.search({id: downloadId}, results => resolve(results[0]))
      })
    }, this.item.id)
    this.item = item

    downloader.update({key:item.id},{
      key: item.id,
      idForExtension: item.idForExtension,
      isPaused: item.paused,
      url: item.finalUrl,
      orgUrl: item.url,
      referer: this.referer,
      requestHeader: Browser.getRequestHeader(item.id),
      filename: path.basename(item.filename),
      receivedBytes: item.bytesReceived,
      totalBytes: item.totalBytes,
      state: this.getState(),
      speed: void 0,
      est_end: new Date(item.estimatedEndTime).getTime(),
      savePath: item.filename,
      mimeType: item.mime,
      created_at: new Date(item.startTime).getTime(),
      ended: item.state == 'complete' ? Date.now() : null,
      now: Date.now()
    },{ upsert: true })

    this.emit('updated')
  }

  getURL(){
    return this.item.finalUrl
  }

  getReferer(){
    return this.item.referrer
  }

  getSavePath(){
    return this.item.filename
  }

  isPaused(){
    return this.item.paused
  }

  async resume(){
    await Browser.bg.evaluate(downloadId => {
      return new Promise(resolve => {
        chrome.downloads.resume(downloadId, () => resolve())
      })
    }, this.item.id)
    this.startObserve()
  }

  async pause(){
    clearInterval(this.intervalId)
    this.intervalId = void 0
    await Browser.bg.evaluate(downloadId => {
      return new Promise(resolve => {
        chrome.downloads.pause(downloadId, () => resolve())
      })
    }, this.item.id)
    await this.updateState()
  }

  async cancel(){
    clearInterval(this.intervalId)
    this.intervalId = void 0
    await Browser.bg.evaluate(downloadId => {
      return new Promise(resolve => {
        chrome.downloads.cancel(downloadId
        //   , () => {
        //   chrome.downloads.erase({id: downloadId}, () => resolve())
        // }
        )
      })
    }, this.item.id)
    await this.updateState()
    this.emit('done')
  }

  async kill(){
    await this.cancel()
  }

  canResume(){
    return this.item.canResume
  }

  getState(){
    if(this.item.state == 'in_progress'){
      return 'progressing'
    }
    else if(this.item.state == 'interrupted'){
      return 'interrupted'
    }
    else if(this.item.state == 'complete'){
      return 'completed'
    }
    return 'cancelled'
  }

  getReceivedBytes(){
    return this.item.bytesReceived
  }

  getTotalBytes(){
    return this.item.totalBytes
  }

}