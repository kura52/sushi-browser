const {ipcMain,shell} = require('electron')
const path = require('path')
import {download,downloader} from './databaseFork'
import {getCurrentWindow} from './util'
import fs from 'fs'
import {Browser} from './remoted-chrome/Browser'

export default class DownloadEvent {
  constructor(){
    ipcMain.on('download-retry',(event,url,savePath,key)=>{
      downloader.findOne({key}).then(ret=> {
        downloader.remove({key}, {multi: true}).then(_ => {
          ipcMain.emit('set-save-path', null, url, path.basename(savePath))
          ipcMain.emit('set-download-key', null, url, key)
          Browser.downloadURL(url, void 0, ret && (ret.requestHeaders || ret.referer), key)
        })
      })
    })

    ipcMain.on('download-open-folder',(event,path)=>{
      shell.showItemInFolder(path)
    })

    ipcMain.on('fetch-downloader-data', async (event, range) => {
      const cond =  !Object.keys(range).length ? range :
        { created_at: (
          range.start === void 0 ? { $lte: range.end } :
            range.end === void 0 ? { $gte: range.start } :
              { $gte: range.start ,$lte: range.end }
        )}

      const data = await downloader.find_sort([cond],[{ created_at: -1 }])
      event.sender.send('downloader-data-reply', data)
    })

    ipcMain.on('remove-downloader', async (event, keys) => {
      downloader.remove({key: {$in : keys}}, { multi: true }).then(_=>_)
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
      try{
        shell.openExternal(`file://${data.savePath}`)
      }
      catch(e){
        try{
          shell.openExternal(`file://${data.savePath}.crdownload`)
        }
        catch(e){}
      }
    })
  }

}