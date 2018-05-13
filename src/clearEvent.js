import {app,ipcMain,session} from 'electron'
import {favorite,image,favicon,tabState,history,visit,savedState,download,downloader,state,syncReplace} from './databaseFork'

import path from 'path'
import fs from 'fs'
import mainState from "./mainState";

const m = {
  async clearHistory(ses){
    for(let table of [image,favicon,tabState,history,visit,savedState]){
      await table.remove({}, { multi: true })
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

  async clearDownload(){
    for(let table of [download,downloader]){
      await table.remove({}, { multi: true })
    }
  },

  clearStorageData(ses,opt){
    const args = opt ? [opt,()=>{}] : [()=>{}]
    ses.clearStorageData(...args)
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

  async clearGeneralSettings(){
    await syncReplace.remove({}, { multi: true })
    await state.update({ key: 1 }, {
      key: 1,
      clearHistoryOnClose: mainState.clearHistoryOnClose,
      clearDownloadOnClose: mainState.clearDownloadOnClose,
      clearCacheOnClose: mainState.clearCacheOnClose,
      clearStorageDataOnClose: mainState.clearStorageDataOnClose,
      clearAutocompleteDataOnClose: mainState.clearAutocompleteDataOnClose,
      clearAutofillDataOnClose: mainState.clearAutofillDataOnClose,
      clearPasswordOnClose: mainState.clearPasswordOnClose,
      clearGeneralSettingsOnClose: mainState.clearGeneralSettingsOnClose,
      clearFavoriteOnClose: mainState.clearFavoriteOnClose
    }
      )
  },

  async clearFavorite(){
    await favorite.remove({}, { multi: true })
    await favorite.insert({"is_file":false,"title":"root","updated_at":1497713000000,"children":[],"key":"root","_id":"zplOMCoNb1BzCt15"})
  }
}

async function clearEvent(event, targets,opt){
  console.log(targets)
  for(let target of targets){
    await m[target](session.defaultSession,opt)
  }
}

ipcMain.on('clear-browsing-data', clearEvent)

export default clearEvent
