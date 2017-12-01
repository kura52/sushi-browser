import {app,ipcMain,session} from 'electron'
import {favorite,image,favicon,tabState,history,visit,savedState,download,downloader,state,syncReplace} from './databaseFork'

import path from 'path'
import fs from 'fs'

const m = {
  clearHistory(ses){
    for(let table of [image,favicon,tabState,history,visit,savedState]){
      table.remove({}, { multi: true }).then(_=>_)
    }
    ses.clearHistory()

    const resourcePath = path.join(app.getPath('userData'),'resource')
    const capturePath = path.join(resourcePath,'capture')
    if (fs.existsSync(capturePath)) {
      fs.readdir(capturePath, (err, list)=>{
        for(let file of list){
          fs.unlink(path.join(capturePath,file),_=>_)
        }
      })
    }
  },

  clearDownload(){
    for(let table of [download,downloader]){
      table.remove({}, { multi: true }).then(_=>_)
    }
  },

  clearStorageData(ses){
    ses.clearStorageData(() => {})
  },

  clearCache(ses){
    ses.clearCache(() => {})
  },

  clearAutocompleteData(ses){
    ses.autofill.clearAutocompleteData()
  },

  clearAutofillData(ses){
    ses.autofill.clearAutofillData()
  },

  clearPassword(ses){
    ses.autofill.clearLogins()
  },

  clearGeneralSettings(){
    for(let table of [state,syncReplace]){
      table.remove({}, { multi: true }).then(_=>_)
    }
  },

  clearFavorite(){
    favorite.remove({}, { multi: true }).then(_=>_)
  }
}

ipcMain.on('clear-browsing-data', (event, targets) => {
  console.log(targets)
  for(let target of targets){
    for(let ses of [session.defaultSession]){
      m[target](ses)
    }
  }
})

