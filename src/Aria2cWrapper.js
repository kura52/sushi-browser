const {session,ipcMain,app,shell} = require('electron')
const {spawn} = require('child_process')
const moment = require('moment')
const fs = require('fs')
const path = require('path')
import uuid from 'node-uuid'
import mainState from './mainState'
import {downloader} from './databaseFork'

const binaryPath = path.join(__dirname, '../resource/bin/aria2',
  process.platform == 'win32' ? 'win/aria2c.exe' :
    process.platform == 'darwin' ? 'mac/bin/aria2c' : 'linux/aria2c').replace(/app.asar([\/\\])/,'app.asar.unpacked$1')



function getCookieStr(url){
  const now = moment().unix()
  return new Promise((resolve,reject)=>{
    session.defaultSession.cookies.get({url}, (error, cookies) => {
      const cookieArray = []
      if(error){
        reject()
        return
      }

      if(!error && cookies.expirationDate >= now){
        cookieArray.push(`${cookies.name}=${cookies.value}`)
      }
      resolve(cookieArray.join('; '))
    })
  })
}

function getByte(str){
  if(!str) return 0
  const match = str.match(/([\d\.]+)([KMGT]?i?B)/)
  const num = parseFloat(match[1])
  if(match[2] == 'B'){
    return num
  }
  else if(match[2] == 'KiB'){
    return num * 1024
  }
  else if(match[2] == 'MiB'){
    return num * 1024 * 1024
  }
  else if(match[2] == 'GiB'){
    return num * 1024 * 1024 * 1024
  }
  else if(match[2] == 'TiB'){
    return num * 1024 * 1024 * 1024
  }
}

const downloadItems = new Set()
let count = 0
export default class Aria2cWrapper{
  constructor({url,orgUrl,mimeType,savePath,downloadNum=1,overwrite,timeMap,aria2cKey}){
    this.key = aria2cKey || uuid.v4()
    this.resumeFlg = !!aria2cKey
    this.url = url
    this.orgUrl = orgUrl
    this.mimeType = mimeType
    this.savePath = savePath
    this.overwrite = overwrite
    this.timeMap = timeMap
    this.downloadNum = downloadNum
    this.status = 'PROCESSING'
    this.stdoutCallbacks = []
    this.closeCallbacks = []
    this.errorCallbacks = []
    this.idForExtension = (this.created_at - 1512054000000) * 100 + (count++ % 100)
    ipcMain.emit('download-starting',null,this.orgUrl,this.idForExtension)
  }

  errorCallback(){
    for(let c of this.errorCallbacks){
      setTimeout(c,100)
    }
    this.errorCallbacks = []
  }

  closeCallback(){
    this.updateDownloader()
    downloadItems.delete(this)
    for(let c of this.closeCallbacks){
      setTimeout(c,100)
    }
    this.closeCallbacks = []
  }

  calcSpeedSec(item){
    let speed = item.speed
    if(!speed){
      return 1
    }
    else if(speed.includes("TB")){
      return parseFloat(speed) * 1024 * 1024 * 1024 * 1024
    }
    else if(speed.includes("GB")){
      return parseFloat(speed) * 1024 * 1024 * 1024
    }
    else if(speed.includes("MB")){
      return parseFloat(speed) * 1024 * 1024
    }
    else if(speed.includes("KB")){
      return parseFloat(speed) * 1024
    }
    else{
      const val = parseFloat(speed)
      return isNaN(val) ? 1 : val
    }
  }

  updateDownloader(){
    const item = this
    const est_end = Date.now() + (item.totalBytes - item.receivedBytes) / this.calcSpeedSec(item)
    downloader.update({key:item.key},{
      key: item.key,
      idForExtension: item.idForExtension,
      isPaused: item.isPaused(),
      url: item.getURL(),
      orgUrl: item.orgUrl,
      filename: path.basename(item.getSavePath()),
      receivedBytes: item.getReceivedBytes(),
      totalBytes: item.getTotalBytes(),
      state: item.getState(),
      speed: item.speed ? item.speed.replace('i','') : void 0,
      est_end,
      savePath: item.getSavePath(),
      mimeType: item.mimeType,
      created_at: item.created_at,
      ended: item.getState() == 'completed' ? Date.now() : null,
      now: Date.now()
    },{ upsert: true })
  }

  stdoutCallback(){
    this.updateDownloader()
    for(let c of this.stdoutCallbacks){
      c()
    }
  }

  async download({retry,resume} = {}){
    if(this.status == 'CANCEL') return
    if(this.status == 'PAUSE'){
      this.retry = true
      setTimeout(_=>this.download({retry:true,resume}),500)
      return
    }

    if(!retry){
      setTimeout(_=>this.stdoutCallback(),100)
    }
    if(mainState.concurrentDownload && downloadItems.size >= parseInt(mainState.concurrentDownload)){
      this.retry = true
      setTimeout(_=>this.download({retry:true,resume}),50)
      return
    }
    this.retry = false
    downloadItems.add(this)
    const cookie = await getCookieStr(this.url)

    if(this.resumeFlg){
      resume = this.resumeFlg
      this.resumeFlg = false
    }
    if(!resume && !this.overwrite) this.savePath = this.getUniqFileName(this.savePath)

    let params = cookie ? [`--header=Cookie:${cookie}`] : []
    params = [...params,`-x${this.downloadNum}`,'--check-certificate=false','--summary-interval=1','--file-allocation=none','--bt-metadata-only=true',
      `--user-agent=${process.userAgent}`,`--dir=${path.dirname(this.savePath)}`,`--out=${path.basename(this.savePath)}`,`${this.url}`]

    if(!resume && this.overwrite){
      params.push('--auto-file-renaming=false','--allow-overwrite=true')
    }
    else{
      params.push('-c')
    }

    this.created_at = Date.now()
    this.timeMap.set(this.savePath, this.created_at)

    console.log(params)
    this.aria2c = spawn(binaryPath,params)

    this.aria2c.stdout.on('data', (data) => {
      console.log(`***${data}`)
      const msg = data.toString()
      if(msg.includes('Status Legend:')){
        if(msg.includes('(OK)')){
          this.status = 'COMPLETE'
        }
        else if(msg.includes('(ERR)') && this.status != 'PAUSE' && this.status != 'CANCEL' ){
          this.status = 'ERROR'
        }
        console.log(this.status)
      }
      else{
        const match = msg.split("FILE:")[0].match(/\[(.+)\]/g)
        if(match && match.length){
          console.log(33335,match[match.length - 1])
          const match2 = match[match.length - 1].match(/ (\d+.+?B)\/(\d+.+?B)\((\d+)%\).+?DL:(\d+.+?B)/)
          if(match2 && match2[4]){
            this.processed = match2[1]
            this.total = match2[2]
            this.percent = parseInt(match2[3])
            this.speed = match2[4]
            console.log(this.processed,this.total,this.percent,this.speed)
          }
        }
      }
      this.stdoutCallback()
      // console.log(`stdout: ${data}`);
    });
    this.aria2c.on('close', (code) => {
      console.log(`*r**${code}`)
      if(this.status != 'PAUSE' && this.status != 'CANCEL' ) this.status = code === 0 ? 'COMPLETE' : 'ERROR'
      if(this.status == 'ERROR'){
        this.errorCallback()
      }
      if(this.status != 'PAUSE'){
        this.closeCallback()
      }
    });
    this.status = 'PROCESSING'

  }

  getURL(){
    return this.url
  }
  getSavePath(){
    return this.savePath
  }
  isPaused(){
    console.log(this.status)
    return this.status == 'PAUSE'
  }
  resume(){
    if(this.status == 'COMPLETE' || this.status == 'PROCESSING') return
    console.log('resume')
    this.status = 'PROCESSING'
    this.download({retry:this.retry,resume:!this.aria2c ? this.resumeFlg : true})
    this.stdoutCallback()
  }
  pause(){
    if(this.status != 'PROCESSING') return

    downloadItems.delete(this)
    this.status = 'PAUSE'
    if(this.aria2c){
      this.aria2c.stdin.pause()
      this.aria2c.kill()
    }
    this.stdoutCallback()
  }
  cancel(){
    this.status = 'CANCEL'
    if(this.aria2c){
     this.aria2c.stdin.pause()
     this.aria2c.kill()
    }
    console.log(this.savePath)
    fs.unlink(this.savePath,e=> {
      setTimeout(
        _=>{fs.unlink(`${this.savePath}.aria2`,e=> {
          console.log(e)
        })},1000)
    })
    this.closeCallback()
  }
  kill(){
    this.pause()
    this.stdoutCallbacks = []
    this.closeCallbacks = []
    this.errorCallbacks = []
  }
  canResume(){
    return fs.existsSync(this.savePath)
  }
  getState(){
    if(this.status == 'CANCEL'){
      return 'cancelled'
    }
    else if(this.status == 'COMPLETE'){
      return 'completed'
    }
    else if(this.status == 'ERROR'){
      return 'cancelled'
    }
    else{
      return 'progressing'
    }
  }
  getReceivedBytes(){
    // console.log(dl.status, dl.getStats())
    return getByte(this.processed)
  }
  getTotalBytes(){
    return getByte(this.total)
  }

  on(name, callback){
    if(this.status == 'COMPLETE' || this.status == 'ERROR'){
      setTimeout(callback,300)
    }
    else{
      this.stdoutCallbacks.push(callback)
    }
  }
  once(name, callback){
    if(name == 'done'){
      if(this.status == 'COMPLETE'){
        setTimeout(callback,300)
      }
      else{
        this.closeCallbacks.push(callback)
      }
    }
    else{
      if(this.status == 'ERROR'){
        setTimeout(callback,300)
      }
      else {
        this.errorCallbacks.push(callback)
      }
    }
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

  isAria2c(){
    true
  }
}