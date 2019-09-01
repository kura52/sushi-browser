import {ipcMain} from 'electron'
const path = require('path')
const pty = require(path.join(__dirname,'../node_modules/node-pty').replace(/app.asar([\/\\])/,'app.asar.unpacked$1'))
const os = require('os')

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

const processes = new Set()

class PtyProcess{
  constructor(key,sender,cmd){
    this.key = key
    this.sender = sender
    this.resize = false
    this.write = false
    this.pingReplyTime = Date.now()

    const ptyProcess = pty.fork(cmd && os.platform() === 'win32' ? 'cmd.exe' : shell, [], {
      experimentalUseConpty: false,
      name: 'xterm-color',
      cwd: process.env.HOME,
      env: process.env
    });
    this.ptyProcess = ptyProcess

    ptyProcess.on('data', (data)=>{
      console.log("data-pty")
      try{
        this.sender.send(`pty-out_${this.key}`, data)
      }catch(e){
        console.log(e)
      }
    });

    ipcMain.on(`send-pty_${this.key}`, (event,data)=>{
      console.log(`send-pty_${this.key}`, event,data)
      ptyProcess.write(typeof data === 'string' ? data.replace(/\r?\n/g, os.EOL) : data)
      // if(!this.resize && !this.write){
      //   console.log("send-pty")
      //   this.write = true
      //   ptyProcess.write(typeof data === 'string' ? data.replace(/\r?\n/g, os.EOL) : data)
      //   this.write = false
      //   console.log("send-end-pty")
      // }
      // else{
      //   let retry = 0
      //   const id = setInterval(_=>{
      //     console.log("write",this.write)
      //     if(retry++ > 1000) clearInterval(id)
      //     if(this.resize || this.write) return
      //     clearInterval(id)
      //     console.log("send-pty")
      //     this.write = true
      //     ptyProcess.write(typeof data === 'string' ? data.replace(/\r?\n/g, os.EOL) : data)
      //     this.write = false
      //     console.log("send-end-pty")
      //   },50)
      // }
    })

    ipcMain.on(`resize_${this.key}`, (event,data)=>{
      ptyProcess.resize(data.cols, data.rows)
      event.sender.send(`fit_${this.key}`, data)
      // if(!this.resize && !this.write){
      //   console.log("resize", this.resize)
      //   this.resize = true
      //   ptyProcess.resize(data.cols, data.rows)
      //   this.resize = false
      //   event.sender.send(`fit_${this.key}`, data)
      //   console.log("ok")
      // }
      // else {
      //   let retry = 0
      //   const id = setInterval(_ => {
      //     console.log("resize", this.resize)
      //     if (retry++ > 1000) clearInterval(id)
      //     if (this.resize || this.write) return
      //
      //     clearInterval(id)
      //     console.log(data)
      //     this.resize = true
      //     ptyProcess.resize(data.cols, data.rows)
      //     this.resize = false
      //     event.sender.send(`fit_${this.key}`, data)
      //     console.log("ok")
      //   }, 50)
      // }
      // console.log(data)
    })

    const id = setInterval(_=>{
      if((Date.now() - this.pingReplyTime) / 1000 > 30){
        console.log("destroy1")
        ptyProcess.destroy()
        processes.delete(ptyProcess)
        ipcMain.removeAllListeners(`ping-reply_${this.key}`)
        clearInterval(id)
      }
      ipcMain.once(`ping-reply_${this.key}`,_ =>{
        this.pingReplyTime = Date.now()
      })
      try{
        this.sender.send(`ping_${this.key}`)
      }catch(e){
        console.log(e)
        clearInterval(id)
        console.log("destroy2")
        ptyProcess.destroy()
        processes.delete(ptyProcess)
      }
    },3000)
  }

  destroy(){
    console.log("destroy3")
    this.ptyProcess.destroy()
  }
}

ipcMain.on('start-pty',(event, key, cmd) => {
  const process = new PtyProcess(key, event.sender, cmd)
  processes.add(process)
  ipcMain.emit('start-pty-reply',null,key)
})

export default processes