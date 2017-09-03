const {ipcMain,shell} = require('electron')
const path = require('path')
import {download} from './databaseFork'
import {getCurrentWindow} from './util'
import fs from 'fs'

export default class DownloadEvent {
  constructor(){
    ipcMain.on('download-retry',(event,url,savePath)=>{
      ipcMain.emit('set-save-path', null, path.basename(savePath))
      getCurrentWindow().webContents.downloadURL(url,true)
    })

    ipcMain.on('download-open-folder',(event,path)=>{
      shell.showItemInFolder(path)
    })

    ipcMain.on('fetch-download', async (event, range) => {
      console.log('fetch-download', event, range)
      const cond =  !Object.keys(range).length ? range :
      { created_at: (
        range.start === void 0 ? { $lte: range.end } :
          range.end === void 0 ? { $gte: range.start } :
          { $gte: range.start ,$lte: range.end }
      )}

      console.log(432542,cond)
      const data = await download.find_sort([cond],[{ created_at: -1 }])
      console.log(data)
      event.sender.send('download-reply', data);
    })

    ipcMain.on('search-download', async (event, cond) => {
      console.log(cond)
      if(Array.isArray(cond)){
        const arr = []
        for (let e of cond) {
          e = new RegExp(e,'i')
          arr.push({ $or: [{ url: e }, { filename: e }]})
        }
        cond = cond.length == 1 ? arr[0] : { $and: arr}
      }
      else{
        cond = { $or: [{ url: cond }, { filename: cond }]}
      }
      const data = await download.find_sort([cond],[{ created_at: -1 }])
      event.sender.send('download-reply', data, true);
    })

    ipcMain.on('download-open',(event,data)=>{
      if(fs.existsSync(`${data.savePath}.mtd`)){
        shell.openItem(`${data.savePath}.mtd`)
      }
      else{
        shell.openItem(data.savePath)
      }
    })
  }

}