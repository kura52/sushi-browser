import {BrowserWindow,ipcMain} from 'electron'
import uuid from "node-uuid"

export default class ChromeWindows {
  constructor(appId){
    this.appId = appId
  }

  getAll(getInfo, callback){
    const bWins = BrowserWindow.getAllWindows()
    const ret = [];
    ;(async ()=> {
      for (let bWin of bWins) {
        if(!bWin.getTitle().includes('Sushi Browser')) continue
        const ids = await new Promise(resolve=>{
          const key = uuid.v4()
          ipcMain.once(`chrome-windows-get-panels-res_${key}`,(e,tabs)=>{
            console.log('chrome-windows-get-panels-res', key, {})
            resolve(tabs)
          })
          console.log('chrome-windows-get-panels', key,bWin.webContents)
          bWin.webContents.send('chrome-windows-get-panels', key, false)
          console.log('chrome-windows-get-panels', key, {})
        })
        console.log(bWin)
        for(let id of ids){
          const r = await this._getWindow({id}, getInfo)
          console.log("getAll",r)
          ret.push(r)
        }
      }
      callback(ret)
    })()
  }

  get(windowId, getInfo, callback){
    ;(async ()=>{
      const ret = await this._getWindow({id: windowId}, getInfo)
      // console.log("get",ret)
      callback(ret)
    })()
  }


  getCurrent(getInfo, callback) {
    ;(async ()=>{
      const ret = await this._getCurrent(getInfo)
      // console.log("getCurrent",ret)
      callback(ret)
    })()
  }

  async _getWindow(windowPanel, getInfo){
    windowPanel.tabs = await new Promise((resolve)=>{
      global.chrome[this.appId].tabs.getAllInWindow(windowPanel.id,resolve)
    })
    return windowPanel
  }

  async _getCurrent(getInfo){
    const windowPanel = {}
    windowPanel.tabs = await new Promise((resolve)=>{
      global.chrome[this.appId].tabs.query({},resolve)
    })
    windowPanel.id = windowPanel.tabs[0].windowId
    return windowPanel
  }
}