const {session,ipcMain,app,shell} = require('electron')
const {exec,spawn} = require('child_process')
const fs = require('fs')
const path = require('path')
import uuid from 'node-uuid'

const ffMpegBinaryPath = path.join(__dirname, `../resource/bin/ffmpeg/${process.platform === 'win32' ? 'win' : process.platform === 'darwin' ? 'mac' : 'linux'}/ffmpeg`)
  .replace(/app.asar([\/\\])/,'app.asar.unpacked$1')

const handbrakeBinaryPath = path.join(__dirname, '../resource/bin/handbrake',
  process.platform == 'win32' ? 'win/handbrake.exe' :
    process.platform == 'darwin' ? 'mac/bin/handbrake' : 'linux/HandBrakeCLI').replace(/app.asar([\/\\])/,'app.asar.unpacked$1')


let count = 0
export default class handbrakeWrapper{
  constructor(){
    this.key = uuid.v4()
  }

  ffmpegExe(command) {
    return new Promise(function(resolve, reject) {
      exec(`${ffMpegBinaryPath} ${command}`,(error, stdout, stderr)=>{
        if (error) {
          resolve({stdout, stderr, error});
        }
        resolve({stdout, stderr});
      });
    });
  }

  async handbrakeSpawn(videos){
    for(let info of videos){

      const {startAt,endAt,fileName,...preset} = info.out
      delete preset.startAt
      delete preset.endAt
      delete preset.endAt

      fs.writeFileSync(presetFilePath, JSON.stringify(videos.out))

      await new Promise(resolve=>{
        this.addPreset = exec(`${handbrakeBinaryPath} --preset-import-file ${presetFilePath}`,(error, stdout, stderr)=>{
          console.log(stdout)
        })
      })

      this.handbrake = spawn(handbrakeBinaryPath,['-z',info.presetName,'-o',info.out.fileName])


      this.handbrake.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      await new Promise(resolve=>{
        this.handbrake.on('close', (code) => {
          resolve()
        })
      })
    }


  }

  kill(){
    if(this.handbrake){
      this.handbrake.stdin.pause()
      this.handbrake.kill()
    }
  }
}