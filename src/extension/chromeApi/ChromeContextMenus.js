import {BrowserWindow,ipcMain} from 'electron'

//@todo No Implemention
export default class ChromeContextMenus {
  constructor(appId){
    this.appId = appId
  }

  create(){
    console.log("mock_create")
  }

  remove(){
    console.log("mock_remove")
  }

  get onClicked(){
    console.log("mock_onClicked")
    return {
      addListener(){console.log("mock_addListener")},
      hasListener(){console.log("mock_hasListener")},
      removeListener(){console.log("mock_removeListener")}

    }
  }

}

