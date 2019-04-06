import {downloader} from './databaseFork'
import {Browser} from './remoted-chrome/BrowserView'
import {EventEmitter} from 'events'
import {ipcMain} from "electron";

export default class ChromeDownloadWrapper extends EventEmitter {
  constructor(item){
    super()
    this.item = item
    this.key = item.id

    ipcMain.on(`chrome-downloads-onChanged-${item.id}`, downloadDelta => {
      this.emit('updated')
      if(item.error) this.emit('error')
      if(item.state == 'complete') this.emit('done')
    })

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
  }

  async pause(){
    await Browser.bg.evaluate(downloadId => {
      return new Promise(resolve => {
        chrome.downloads.pause(downloadId, () => resolve())
      })
    }, this.item.id)
  }

  async cancel(){
    await Browser.bg.evaluate(downloadId => {
      return new Promise(resolve => {
        chrome.downloads.cancel(downloadId, () => resolve())
      })
    }, this.item.id)
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
    else if(this.item.state == 'interrupted' || this.item.state == 'complete'){
      return this.item.state
    }
    return 'cancelled'
  }

  getReceivedBytes(){
    return this.item.bytesReceived
  }

  getTotalBytes(){
    return this.item.totalBytes
  }

  on(name, callback){
  }
  once(name, callback){
  }

}