import firebase from 'firebase'
import {ipcMain,session,app,nativeImage} from 'electron'
import path from 'path'
import {getCurrentWindow} from './util'
import {state,
  searchEngine,
  favorite,
  visit,
  history,
  image,
  tabState,
  windowState,
  savedState,
  favicon,
  download,
  downloader,
  automation,
  automationOrder,
  note,
  token} from './databaseFork'
import fs from 'fs'
import zlib from 'zlib'
import crypto from 'crypto'
import mainState from "./mainState"
import passCrypto from './crypto'
import importData from './bookmarksExporter'


let firebaseUtils


async function intervalRun(timeout = 60*60*6*1000){
  clearInterval(clearId)
  const interval = 60*60*6*1000
  const tokenData = await token.findOne({login: true})
  const diff = Date.now() - (tokenData ? tokenData.sync_at : 0)
  timeout = diff > interval ? 0 : interval - diff

  setTimeout(_=>{
    process()
    clearId = setInterval(process,interval)
  },timeout)
}

async function getData(table, table_name, column, sync_at, results){
  const data = await table.find({ [column]: { $gte: sync_at } })
  if(data){
    results[table_name] = data
  }
}

let email,clearId
async function process(){
  const tokenData = await token.findOne({login: true})
  const sync_at = (tokenData && tokenData.sync_at) || 0
  const results = {}

  const promises = []

  if(mainState.syncGeneralSettings){
    promises.push(getData(state, 'state', 'updated_at', sync_at, results))
    promises.push(getData(searchEngine, 'searchEngine', 'updated_at', sync_at, results))
  }
  if(mainState.syncBookmarks){
    promises.push(getData(favorite, 'favorite', 'updated_at', sync_at, results))
  }
  if(mainState.syncBrowsingHistory){
    promises.push(getData(visit, 'visit', 'created_at', sync_at, results))
    promises.push(getData(history, 'history', 'updated_at', sync_at, results))
    promises.push(getData(image, 'image', 'updated_at', sync_at, results))

    const capturePath = path.join(path.join(app.getPath('userData'),'resource'),'capture')
    const realImages = []
    if (fs.existsSync(capturePath)) {
      for(let file of fs.readdirSync(capturePath)){
        try{
          const filePath = path.join(capturePath,file)
          if(fs.statSync(filePath).mtime.getTime() > sync_at){
            realImages.push([file,nativeImage.createFromPath(filePath).toDataURL()])
          }
        }catch(e){
          console.log(e)
        }
      }
      results.realImages = realImages
    }
  }
  if(mainState.syncSessionTools){
    promises.push(getData(tabState, 'tabState', 'updated_at', sync_at, results))
    promises.push(getData(windowState, 'windowState', 'updated_at', sync_at, results))
    promises.push(getData(savedState, 'savedState', 'created_at', sync_at, results))
  }
  if(mainState.syncFavicons){
    promises.push(getData(favicon, 'favicon', 'updated_at', sync_at, results))
  }
  if(mainState.syncDownloadHistory){
    promises.push(getData(download, 'download', 'updated_at', sync_at, results))
    promises.push(getData(downloader, 'downloader', 'now', sync_at, results))
  }
  if(mainState.syncAutomation){
    promises.push(getData(automation, 'automation', 'updated_at', sync_at, results))
    promises.push(getData(automationOrder, 'automationOrder', 'updated_at', sync_at, results))
  }
  if(mainState.syncNote){
    promises.push(getData(note, 'note', 'updated_at', sync_at, results))
  }
  if(mainState.syncPassword){
    const password = await new Promise(r=>{
      session.defaultSession.autofill.getAutofillableLogins(r)
    })
    results.password = password.map(x=>{
      x.password = passCrypto.encrypt(x.password)
      return x
    })
  }

  await Promise.all(promises)

  // console.log(favoriteList)
  zlib.gzip(JSON.stringify(results),
    (error, buf)=>{
      if (error) throw error;

      if(!firebaseUtils) firebaseUtils = require('./FirebaseUtils')
      const password = firebaseUtils.decryptPassword(tokenData.email,tokenData.password)
      const cipher = crypto.createCipher('aes-256-ctr', password)

      // console.log(new Buffer(buf).toString('base64'))
      const win = getCurrentWindow()
      setTimeout(_=>(win || getCurrentWindow()).webContents.send('sync-datas',
        {sync_at,email:tokenData.email,password,
          base64:cipher.update(buf).toString('base64')}),win ? 0 : 5000)
    })
}


ipcMain.on('sync-datas-to-main',(e,base64,password)=>{
  const decipher = crypto.createDecipher('aes-256-ctr',password);
  zlib.gunzip(decipher.update(Buffer.from(base64, 'base64')), async (err, binary)=>{
    const restoreDatas = JSON.parse(binary.toString('utf-8'))
    fs.writeFileSync("/home/kura52/a.json",binary.toString('utf-8'))

    const imports = []
    if(mainState.syncGeneralSettings) imports.push('generalSettings')
    if(mainState.syncBookmarks) imports.push('bookmarks')
    if(mainState.syncBrowsingHistory) imports.push('browsingHistory')
    if(mainState.syncSessionTools) imports.push('sessionTools')
    if(mainState.syncFavicons) imports.push('favicons')
    if(mainState.syncDownloadHistory) imports.push('downloadHistory')
    if(mainState.syncAutomation) imports.push('automation')
    if(mainState.syncNote) imports.push('note')
    if(mainState.syncPassword) imports.push('password')

    importData(imports, restoreDatas, false, true)

    // for (let hist of historyList) {
    //   const ret = await history.findOne({location:hist.location})
    //   if(ret){
    //     const updData = {updated_at:hist.updated_at}
    //     if(hist.count > ret.count){
    //       updData.count = hist.count
    //     }
    //     await history.update({location: hist.location}, {$set:updData})
    //   }
    //   else{
    //     hist.created_at = hist.updated_at
    //     await history.insert(hist)
    //   }
    // }
    //
    // const now = Date.now()
    // for(let fav of favoriteList) {
    //   const ret = await favorite.findOne({key:fav.key})
    //   if(ret){
    //     if(!fav.is_file) {
    //       fav.children = fav.children || []
    //       if(ret.children){
    //         fav.children = ret.children.concat(fav.children)
    //       }
    //       fav.children = [...new Set(fav.children)]
    //       await favorite.update({key: fav.key}, {$set: {children: fav.children,updated_at: now}})
    //     }
    //   }
    //   else{
    //     fav.created_at = now
    //     fav.updated_at = now
    //     await favorite.insert(fav)
    //   }
    // }
  })
})

ipcMain.on('start-sync',async (e,val)=>{
  if(val){
    intervalRun(0)
  }
  else{
    clearInterval(clearId)
  }
})

token.findOne({login: true}).then(val=>{
  console.log('syncLoop',val)
  if(val){
    if(!firebaseUtils) firebaseUtils = require('./FirebaseUtils')
    firebaseUtils.checkAndLogin().then(ret=>{
      console.log('syncLoop1',ret)
      if(ret){
        email = ret
        intervalRun()
      }
    })
  }
})

