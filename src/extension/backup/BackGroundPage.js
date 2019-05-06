const {BrowserWindow} = require('electron')
import path from 'path'
import fs from 'fs'


const SCRIPT_PAGE = '__bg_script_page__.html'

export default class BackGroundPage {
  constructor(bgWin, appId, {basePath, page, scripts} = {}) {
    this.bgWin = bgWin
    this.appId = appId
    console.log({basePath, page, scripts})
    if (page) {
      page = path.join(basePath, page)
    }
    else if (scripts) {
      const scriptTags = scripts.map(script => `<script type="text/javascript" src="${script}"></script>`)
      const contents = `<!DOCTYPE html><html><head><meta charset="UTF-8">${scriptTags.join("")}</head><body>bgScript</body></html>`
      const scriptFullPath = path.join(basePath, SCRIPT_PAGE)
      fs.writeFileSync(scriptFullPath, contents)
      page = scriptFullPath
    }

    if (page) {
      console.log(path.join(__dirname, 'preload/extBgPreload.js'))
      // this.bgWin = new BrowserWindow({
      //   webPreferences: {
      //     preload: path.join(__dirname, 'preload/extBgPreload.js'),
      //     nodeIntegration: false
      //   },
      //   show: false
      // });
      // this.bgWin.hide();
      this.page = page
      // this.bgWin.loadURL();
      // this.bgWin.webContents.toggleDevTools()
    }
  }
  getWebviewTag(){
    return `<webview id="${this.appId}" src="file://${this.page}" preload="${path.join(__dirname, 'preload/extBgPreload.js')}" style="display:inline-flex; width:640px; height:480px"></webview>`
  }
}