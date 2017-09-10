const {session,ipcMain,app,shell} = require('electron')
const {spawn} = require('child_process')
const moment = require('moment')
const fs = require('fs')
const path = require('path')

const binaryPath = path.join(__dirname, '../resource/bin/aria2',
  process.platform == 'win32' ? 'win/aria2c.exe' :
    process.platform == 'darwin' ? 'mac/bin/aria2c' : 'linux/aria2c').replace('app.asar/','app.asar.unpacked/')



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

export default class Aria2cWrapper{
  constructor({url,savePath,downloadNum=1}){
    this.url = url
    this.savePath = savePath
    this.downloadNum = downloadNum
    this.status = 'NOT_START'
    this.stdoutCallbacks = []
    this.closeCallbacks = []
    this.errorCallbacks = []
  }

  errorCallback(){
    for(let c of this.errorCallbacks){
      setTimeout(c,100)
    }
    this.errorCallbacks = []
  }

  closeCallback(){
    for(let c of this.closeCallbacks){
      setTimeout(c,100)
    }
    this.closeCallbacks = []
  }

  stdoutCallback(){
    for(let c of this.stdoutCallbacks){
      c()
    }
  }

  async download(){
    const cookie = await getCookieStr(this.url)

    let params = cookie ? [`--header=Cookie:${cookie}`] : []
    params = [...params,'-c',`-x${this.downloadNum}`,'--auto-file-renaming=false','--allow-overwrite=true',
      '--check-certificate=false','--summary-interval=1','--file-allocation=none','--bt-metadata-only=true',
      `--user-agent=${process.userAgent}`,`--dir=${path.dirname(this.savePath)}`,`--out=${path.basename(this.savePath)}`,`${this.url}`]

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
        const match = msg.match(/\[(.+)\]/g)
        if(match && match.length){
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
    this.download()
  }
  pause(){
    this.status = 'PAUSE'
    this.aria2c.stdin.pause()
    this.aria2c.kill()
  }
  cancel(){
    this.status = 'CANCEL'
    this.aria2c.stdin.pause()
    this.aria2c.kill()
    fs.unlink(this.savePath,e=> {
      fs.unlink(`${this.savePath}.aria2`,e=> {
        console.log(e)
      })
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
  aria2c(){
    true
  }
}