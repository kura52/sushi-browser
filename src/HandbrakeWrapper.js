const {session,ipcMain,app,shell} = require('electron')
const {exec,spawn} = require('child_process')
const fs = require('fs')
const path = require('path')
import uuid from 'node-uuid'

const binaryPath = path.join(__dirname, '../resource/bin/handbrake',
  process.platform == 'win32' ? 'win/handbrake.exe' :
    process.platform == 'darwin' ? 'mac/bin/handbrake' : 'linux/HandBrakeCLI').replace(/app.asar([\/\\])/,'app.asar.unpacked$1')


let count = 0
export default class handbrakeWrapper{
  constructor(){
    this.key = uuid.v4()
  }

  exec(command) {
    return new Promise(function(resolve, reject) {
      exec(`${binaryPath} ${command}`, function(error, stdout, stderr) {
        if (error) {
          return reject(error);
        }
        resolve({stdout, stderr});
      });
    });
  }

  async spawn(){
    this.handbrake = spawn(binaryPath,params)

    this.handbrake.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
    this.handbrake.on('close', (code) => {
    });

  }

  kill(){
    if(this.handbrake){
      this.handbrake.stdin.pause()
      this.handbrake.kill()
    }
  }
  
}