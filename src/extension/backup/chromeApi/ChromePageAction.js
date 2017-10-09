import {BrowserWindow,ipcMain} from 'electron'

//@todo No Implemention
export default class ChromePageAction {
  constructor(appId){
    this.appId = appId
  }

  setIcon(){
    console.log("mock_setIcon")
  }
  show(){
    console.log("mock_show")

  }
}

