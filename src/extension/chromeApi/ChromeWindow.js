import {BrowserWindow,ipcMain} from 'electron'
import chromeTabs from './ChromeTabs'


export default class ChromeWindow{
  constructor(appId,bWin){
    this.bWin = bWin
    this.appId = appId
  }

  getTabs(){
    return new Promise((resolve)=>{
      chromeTabs.getAllInWindow(this.bWin.id,resolve)
    })
  }

}
