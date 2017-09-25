const {session,ipcMain,app,shell} = require('electron')
const {spawn} = require('child_process')
const moment = require('moment')
const fs = require('fs')
const path = require('path')


function exec(command) {
  console.log(command)
  return new Promise(function(resolve, reject) {
    require('child_process').exec(command, function(error, stdout, stderr) {
      if (error) {
        resolve({stdout:error.toString()});
      }
      resolve({stdout, stderr});
    });
  });
}

function shellEscape(s){
  return '"'+s.replace(/(["\s'$`\\])/g,'\\$1')+'"'
}

const binaryPath = path.join(__dirname, `../resource/bin/ffmpeg/${process.platform === 'win32' ? 'win' : process.platform === 'darwin' ? 'mac' : 'linux'}/ffmpeg`).replace(/app.asar([\/\\])/,'app.asar.unpacked$1')

export default class FfmpegWrapper{
  constructor(filePath){
    this.filePath = filePath
  }

  async exe(callBack){
    console.log(111,this.filePath,`${binaryPath} -i ${shellEscape(this.filePath)}`)
    const ret = await exec(`${binaryPath} -i ${shellEscape(this.filePath)}`)
    const m = ret.stdout.match(/: Audio: ([a-zA-Z\d]+)/)

    const ext = m[1] == 'aac' ? 'm4a' : m[1]

    const dirName = path.dirname(this.filePath)
    const fnames = path.basename(this.filePath).split(".")

    let fname
    if(fnames[fnames.length - 1].match(/3gp|3gpp|3gpp2|asf|avi|dv|flv|m2t|m4v|mkv|mov|mp4|mpeg|mpg|mts|oggtheora|ogv|rm|ts|vob|webm|wmv/)){
      fname = path.join(dirName,`${fnames.slice(0,fnames.length-1).join(".")}.${ext}`)
    }
    else{
      fname = path.join(dirName,`${this.filePath}.${ext}`)
    }

    let params = ['-i',this.filePath,'-vn','-acodec', 'copy', fname]
    console.log(binaryPath,params)
    this.ffmpeg = spawn(binaryPath,params)

    this.ffmpeg.stdout.on('data', (data) => {
      console.log(`***${data}`)
      const msg = data.toString()
      callBack()
    });
    this.ffmpeg.on('close', (code) => {
      console.log(`*r**${code}`)
      callBack()
    })

  }

  kill(){
    this.ffmpeg.stdin.pause()
    this.ffmpeg.kill()
    fs.unlink(this.filePath,e=> {})
  }
}