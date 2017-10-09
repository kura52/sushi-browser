import chromeExtensionPath from './chromeExtensionPath'
import BackGroundPage from './BackGroundPage'
import fs from 'fs-extra'
import {existsSync} from 'fs-plus'
import path from 'path'
import initBgChromeApi from './chromeApi/initBgChromeApi'
import {app} from 'electron'

let contentScripts = []

export default class ExtensionBase{
  static getContentsScripts(){
    return contentScripts
  }

  constructor(appId){
    if(!ExtensionBase.contentScripts){
      ExtensionBase.contentScripts = []
    }
    this.appId = appId
    this.appPath = path.join(__dirname,'../../resource/extension',appId)
    if(!fs.existsSync(this.appPath)){
      const dirPath = chromeExtensionPath(appId)
      fs.copySync(dirPath, this.appPath)
    }
    this.version = fs.readdirSync(this.appPath).sort().pop()
    this.basePath = path.join(this.appPath,this.version)
    this.manifest = JSON.parse(fs.readFileSync(path.join(this.basePath,'manifest.json')))
  }

  loadLocal(){
    const localPath = path.join(this.basePath,'_locales')
    if(!existsSync(localPath)) return

    let locale = app.getLocale()
    console.log(path.join(localPath,locale))

    if(!fs.existsSync(path.join(localPath,locale,'messages.json'))){
      locale = this.manifest['default_locale']
      if(!fs.existsSync(path.join(localPath,locale,'messages.json'))) return
    }
    this.localMessages = JSON.parse(fs.readFileSync(path.join(localPath,locale,'messages.json')))

  }

  loadBackground(bgWin){
    if(this.manifest.background){
      initBgChromeApi.execute(this.appId,this.version,this.basePath,this.localMessages,this.manifest)
      const bgPage = new BackGroundPage(bgWin, this.appId,  {basePath:this.basePath,...this.manifest.background})
      return bgPage.getWebviewTag()
    }
  }

  settingContentScripts() {
    const _contentScripts = []
    if (this.manifest.content_scripts) {
      const content_scripts = this.manifest.content_scripts
      for(let scripts of content_scripts){
        const matches = scripts.matches
        const runAt = scripts.run_at
        for (let js of scripts.js) {
          _contentScripts.push({
            js,
            matches,
            runAt,
            requirePath: path.join('../../../resource/extension',this.appId,this.version,js),
          })
        }
      }
      const _baseInfo = {
        basePath: path.join('../../../resource/extension',this.appId,this.version),
        appId: this.appId,
        version: this.version,
        localMessages: this.localMessages,
        scripts: _contentScripts
      }
      contentScripts.push(_baseInfo)
    }
  }

  loadOptionPage(){
    if(this.manifest.options_page){
      const optPage = new OptionPage({basePath:this.basePath,options_page: this.manifest.options_page})
    }

  }

}