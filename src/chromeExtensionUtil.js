import fs from 'fs'
import path from 'path'
import {app} from 'electron'

const extensionPath = path.join(app.getPath('userData'),'resource/extension')
if (!fs.existsSync(extensionPath)) {
  fs.mkdirSync(extensionPath)
}

const proxyPath = path.join(app.getPath('userData'),'proxy')
if (!fs.existsSync(proxyPath)) {
  fs.mkdirSync(proxyPath)
}

export default {
  getPath1(appId){
    const extRootPath = path.join(__dirname,'../resource/extension').replace(/app.asar([\/\\])/,'app.asar.unpacked$1')
    let appPath = path.join(extRootPath,appId)
    if(!fs.existsSync(appPath)){
      return null
    }
    const version = fs.readdirSync(appPath).sort().pop()
    const basePath = path.join(appPath,version)
    return basePath
  },
  getPath2(appId){
    let appPath = path.join(extensionPath,appId)
    if(!fs.existsSync(appPath)){
      return null
    }
    const version = fs.readdirSync(appPath).sort().pop()
    const basePath = path.join(appPath,version)
    return basePath
  },
  extensionPath
}