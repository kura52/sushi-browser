import {BrowserWindow,ipcMain} from 'electron'

//@todo No Implemention
export default class ChromeBrowserAction {
  constructor(appId){
    this.appId = appId
  }

  get onClicked(){
    return {
      addListener(callback){
        console.log("mock_onClicked_addListener")
      }
    }
  }
  setIcon(){
    console.log("mock_setIcon")
  }
}

