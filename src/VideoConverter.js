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


function execAsync(command) {
  console.log(command)
  return new Promise(function(resolve, reject) {
    exec(command, function(error, stdout, stderr) {
      if (error) {
        resolve({stdout:error.toString()});
      }
      resolve({stdout, stderr});
    });
  });
}

function replaceFileName(fname,out,directroy,ext){
  const dirParse = path.parse(directroy)
  const fnameParse = path.parse(fname)
  const date = new Date()
  const base = `${fnameParse.name}.${ext}`,
    name = fnameParse.name,
    sub = dirParse.dir.split("/").slice(-1)[0],
    host = dirParse.dir.split("/")[2],
    y = date.getFullYear(),
    m = ('0' + (date.getMonth() + 1)).slice(-2),
    d = ('0' + date.getDate()).slice(-2),
    hh = ('0' + date.getHours()).slice(-2),
    mm = ('0' + date.getMinutes()).slice(-2),
    ss = ('0' + date.getSeconds()).slice(-2)

  return out.replace(/({.+?})/g,p=>{
    if(p == '{name}') return name
    else if(p == '{ext}') return ext
    else if(p == '{base}') return base
    else if(p == '{sub}') return host == sub ? "" : sub
    else if(p == '{host}') return host
    else if(p == '{y}') return y
    else if(p == '{m}') return m
    else if(p == '{d}') return d
    else if(p == '{hh}') return hh
    else if(p == '{mm}') return mm
    else if(p == '{ss}') return ss
    return p
  })
}

function round(val, precision) {
  const digit = Math.pow(10, precision)
  return Math.round(val * digit) / digit
}

function calcSec(str){
  console.log(str)
  const sp = str.split(":")

  let h = 0,m = 0,s = 0
  if(sp.length == 3){
    [h,m,s] = sp
  }
  else if(sp.length == 2){
    [h,m] = sp
  }
  else{
    h = sp[0]
  }

  return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s)
}

function shellEscape(s){
  return '"'+s.replace(/(["\t\n\r\f'$`\\])/g,'\\$1')+'"'
}

ipcMain.on('ffmpeg-scan',async (e,key,files)=>{
  const fs = new FFmpegScan()
  const arr = []
  for(let file of files){
    const result = await fs.exe(`-i ${shellEscape(file)}`)
    arr.push(result.stderr)
  }
  e.sender.send(`ffmpeg-scan-reply_${key}`,arr)
})

class FFmpegScan{
  exe(command) {
    return new Promise(function(resolve, reject) {
      exec(`${ffMpegBinaryPath} ${command}`,(error, stdout, stderr)=>{
        if (error) {
          resolve({stdout, stderr, error});
        }
        resolve({stdout, stderr});
      });
    });
  }
}

const handBrakes = {}
ipcMain.on('handbrake-start',async (e,key,videos)=>{
  const newVideos = []
  for(let info of videos) {
    const inputFile = info.video.file
    const statedVc = handBrakes[inputFile]
    if(statedVc){
      statedVc.resume(inputFile)
      console.log(inputFile)
    }
    else{
      newVideos.push(info)
    }
  }
  if(newVideos.length){
    const vc = new HandBrakeWrapper()
    const arr = []
    vc.handbrakeSpawn(newVideos, e.sender,key)
  }
})

class HandBrakeWrapper{
  constructor(){
    this.handbrakes = {}
    this.killList = {}
    this.pauseList = {}
    this.queue = []

    this.handlePause = (e,key,videos)=>{
      for(let info of videos) {
        const inputFile = info.video.file
        this.pause(inputFile)
        if(!this.pauseList[inputFile]){
          this.pauseList[inputFile] = 1
        }
        this.sender.send(`handbrake-progress_${this.key}`, {file: inputFile, pause: true})
      }
    }
    ipcMain.on('handbrake-pause',this.handlePause)

    this.handleStop = (e,key,videos)=>{
      if(!e){
        this.queue = []
        for(let status of Object.values(this.handbrakes)){
          status[0].stdin.pause()
          status[0].kill()
        }
      }
      for(let info of videos) {
        const inputFile = info.video.file
        this.kill(inputFile)
        this.killList[inputFile] = 1
        this.sender.send(`handbrake-progress_${this.key}`, {file: inputFile, progress: 100, error: false})
      }
    }
    ipcMain.on('handbrake-stop',this.handleStop)
    const id = setInterval(_=>{
      if(Object.keys(this.pauseList).length + Object.keys(this.handbrakes).length + this.queue.length == 0){
        ipcMain.removeListener('handbrake-stop',this.handleStop)
        ipcMain.removeListener('handbrake-pause',this.handleStop)
        clearInterval(id)
      }
    },10000)
  }

  queueShift(){
    this.func = this.queue.shift()
    this.func && this.func()
  }

  async handbrakeSpawn(videos, sender, key){
    this.key = key
    for(let info of videos) {
      const inputFile = info.video.file
      handBrakes[inputFile] = this
      sender.send(`handbrake-progress_${key}`,{file:inputFile, progress:0})
      this.queue.push(this.process.bind(this,info, key))
    }
    this.sender = sender
    this.queueShift()
  }

  process(info, key){
    if(info.out.audioExtract){
      this.processFfpeg(info, key)
    }
    else{
      this.processHandBrake(info, key)
    }
  }

  async processFfpeg(info, key) {
    const inputFile = info.video.file
    if(this.killList[inputFile]){
      delete handBrakes[inputFile]
      this.queueShift()
      return
    }

    if(this.pauseList[inputFile]){
      this.pauseList[inputFile] = this.func
      this.queueShift()
      return
    }

    for(let [_inputFile,status] of Object.entries(this.handbrakes)){
      if(status[1]){
        this.queue.unshift(this.func)
        return
      }
    }

    let {startAt, stopAt, destination, fileName, audioExtract, ...preset} = info.out
    const a = preset.AudioList[0]
    const options = ['-y', '-i', inputFile, '-vn']

    if(startAt) options.push('-ss', startAt)
    if(stopAt) options.push('-to', stopAt)

    let ext
    if(a.AudioEncoder == 'copy'){
      const ret = await execAsync(`${ffMpegBinaryPath} -i ${shellEscape(inputFile)}`)
      const m = ret.stdout.match(/: Audio: ([a-zA-Z\d]+)/)
      ext = m[1] == 'aac' || m[1] == 'ac3' || m[1] == 'alac' ? 'm4a' : m[1] == 'vorbis' || m[1] == 'opus' ? 'ogg' : m[1]
      options.push('-acodec','copy')
    }
    else{
      const mapping = {aac: 'aac', ac3: 'ac3', mp3: 'libmp3lame', vorbis: 'libvorbis', opus: 'libopus', flac16: 'flac', flac24: 'flac'}
      options.push('-c:a',mapping[a.AudioEncoder])
      if(a.AudioEncoder.startsWith('flac')){
        options.push('-sample_fmt', a.AudioEncoder == 'flac16' ? 's16' : 's24')
      }
      options.push('-b:a', `${a.AudioBitrate}k`, '-ac', a.AudioMixdown == 'dpl2' ? '2' : '1')
      ext = ['aac','ac3'].includes(a.AudioEncoder) ? 'm4a' : a.AudioEncoder == 'mp3' ? 'mp3' : a.AudioEncoder.startsWith('flac') ? 'flac' : 'ogg'
    }

    if(parseInt(a.AudioTrackGainSlider) !== 0) options.push('-af',`volume=${a.AudioTrackGainSlider}dB`)
    if(a.AudioSamplerate != 'auto') options.push('-ar',a.AudioSamplerate)

    fileName = replaceFileName(inputFile, fileName, destination, ext)

    console.log(ffMpegBinaryPath, [...options, '-threads', '0', path.join(destination, fileName)])
    const handbrake = spawn(ffMpegBinaryPath, [...options, '-threads', '0', path.join(destination, fileName)])

    handbrake.stderr.on('data', (data) => {
      const s = data.toString()
      const match = s.match(/time=([\d:\.]+)/)
      if(match) {
        const progress = round((calcSec(match[1].slice(0,8)) + parseInt(match[1].split('.')[1]) /1000.0) / calcSec(info.video.duration) * 100,2)
        const msg = match[2] ? match[2].split(/(avg |\))/)[2] : null
        this.sender.send(`handbrake-progress_${key}`, {file: inputFile, progress, msg:s.replace(/ +/g,' ')})
      }
    });

    handbrake.on('close', (code) => {
      this.sender.send(`handbrake-progress_${key}`, {file: inputFile, progress: 100, error: code !== 0})
      // fs.unlink(presetFilePath, _ => _)
      delete this.handbrakes[inputFile]
      delete handBrakes[inputFile]
      this.queueShift()
    })

    this.handbrakes[inputFile] = [handbrake,true]

  }

  processHandBrake(info, key) {
    console.log(this.handbrakes)
    const inputFile = info.video.file
    if(this.killList[inputFile]){
      delete handBrakes[inputFile]
      this.queueShift()
      return
    }

    if(this.pauseList[inputFile]){
      this.pauseList[inputFile] = this.func
      this.queueShift()
      return
    }

    for(let [_inputFile,status] of Object.entries(this.handbrakes)){
      if(status[1]){
        this.queue.unshift(this.func)
        return
      }
    }

    const presetName = uuid.v4()
    const presetFilePath = path.join(app.getPath('temp'), `${presetName}.json`)

    let {startAt, stopAt, destination, fileName, audioExtract, ...preset} = info.out
    preset.PresetName = presetName
    if(preset.PictureRotate) preset.PictureRotate = preset.PictureRotate.replace(/angle=|hflip=/g,'')

    fs.writeFileSync(presetFilePath, JSON.stringify({PresetList:[preset], VersionMajor: "11", VersionMicro: "0", VersionMinor: "0"}))

    console.log(`${handbrakeBinaryPath} --preset-import-file ${presetFilePath}`)

    fileName = replaceFileName(inputFile, fileName, destination, preset.FileFormat)
    const options = ['-i', inputFile, '-o', path.join(destination, fileName), '--preset-import-file', presetFilePath, '-Z',presetName]

    if(startAt) options.push('--start-at', `duration:${calcSec(startAt)}`)
    if(stopAt) options.push('--stop-at', `duration:${calcSec(stopAt)}`)

    console.log(handbrakeBinaryPath, options)
    const handbrake = spawn(handbrakeBinaryPath, options)

    handbrake.stdout.on('data', (data) => {
      const match = data.toString().match(/Encoding: task \d+ of \d+, ([\d\.]+) %( \([\d\.]+ fps, avg [\d\.]+ fps, ETA .+?\))?/)
      if(match) {
        const progress = parseFloat(match[1])
        const msg = match[2] ? match[2].split(/(avg |\))/)[2] : null
        this.sender.send(`handbrake-progress_${key}`, {file: inputFile, progress, msg})
      }
    });

    handbrake.on('close', (code) => {
      this.sender.send(`handbrake-progress_${key}`, {file: inputFile, progress: 100, error: code !== 0})
      // fs.unlink(presetFilePath, _ => _)
      ipcMain.removeListener('handbrake-stop', this.handleStop)
      delete this.handbrakes[inputFile]
      delete handBrakes[inputFile]
      this.queueShift()
    })

    this.handbrakes[inputFile] = [handbrake,true]
  }

  kill(inputFile){
    for(let [_inputFile,status] of Object.entries(this.handbrakes)){
      if(inputFile == _inputFile){
        status[0].stdin.pause()
        status[0].kill()
        break
      }
    }
  }

  pause(inputFile){
    for(let [_inputFile,status] of Object.entries(this.handbrakes)){
      if(inputFile == _inputFile){
        status[0].kill('SIGSTOP')
        status[1] = false
        return
      }
    }

  }

  resume(inputFile){
    console.log(inputFile)
    console.log(this.handbrakes)
    console.log(this.pauseList)
    for(let [_inputFile,status] of Object.entries(this.handbrakes)){
      if(inputFile == _inputFile){
        status[0].kill('SIGCONT')
        status[1] = true
        delete this.pauseList[inputFile]
        return
      }
    }

    for(let [_inputFile,func] of Object.entries(this.pauseList)){
      if(inputFile == _inputFile){
        this.sender.send(`handbrake-progress_${this.key}`,{file:inputFile, progress:0})
        if(func !== 1){
          this.queue.unshift(func)
        }
        delete this.pauseList[inputFile]
        this.queueShift()
        return
      }
    }
  }
}


