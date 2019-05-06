/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import mainState from "./mainState";

const path = require('path')
const moment = require('moment')
const fs = require('fs')
const {dialog,app,BrowserWindow,ipcMain,nativeImage,session} = require('electron')
import {Browser, webContents} from './remoted-chrome/Browser'
import {getFocusedWebContents} from "./util"

import {
  state,
  searchEngine,
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
  token,
  crypto
} from './databaseFork'
import favorite from './remoted-chrome/favorite'
import {settingDefault} from "../resource/defaultValue";
const os = require('os')
const passCrypto = require('./crypto')('sushi-browser-password-key')

function createBookmarkHTML(ret) {
  const breakTag = os.EOL
  const title = 'Bookmarks'

  return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file. It will be read and overwritten. DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>${title}</TITLE>
<H1>${title}</H1>
<DL><p>
    <DT><H3 PERSONAL_TOOLBAR_FOLDER="true">Bookmarks Bar</H3>
${ret.join(breakTag)}
</DL><p>`
}

function setOptionVal(key,dVal,val){
  mainState[key] = val === (void 0) ? dVal : val
}


ipcMain.on('export-bookmark',_=>{

  getFocusedWebContents().then(async cont=>{
    cont.hostWebContents2.send('new-tab', cont.id, "chrome://bookmarks/")
    for(let i=0;i<100;i++){
      await new Promise(r=>setTimeout(r, 100))
      for(const cont of webContents.getAllWebContents()){
        if((await cont.getURL()) == 'chrome://bookmarks/'){
          console.log(cont.getURL())
          cont.executeJavaScript(()=> chrome.bookmarks.export())
          return
        }
      }
    }
  })
  // const focusedWindow = Browser.getFocusedWindow()
  // const fileName = moment().format('DD_MM_YYYY') + '.html'
  // const defaultPath = path.join(app.getPath('downloads'), fileName)
  //
  // dialog.showSaveDialog(focusedWindow, {
  //   defaultPath: defaultPath,
  //   filters: [
  //     {name: 'HTML File', extensions: ['html']},
  //   ]
  // }, (fileName) => {
  //   if (fileName) {
  //     getAllFavorites().then(ret=>{
  //       fs.writeFileSync(fileName, createBookmarkHTML(ret))
  //     })
  //   }
  // })
})

ipcMain.on('export-setting', (e,exports) => {
  console.log('export-setting')
  const focusedWindow = Browser.getFocusedWindow();
  const fileName = moment().format('DD_MM_YYYY') + '.json'
  const defaultPath = path.join(app.getPath('downloads'), fileName)

  dialog.showSaveDialog(focusedWindow, {
    defaultPath: defaultPath,
    filters: [
      {name: 'JSON File', extensions: ['json']},
    ]
  }, async fileName => {
    if (fileName) {
      const results = {}
      for(let name of exports){
        if(name == 'generalSettings'){
          results.state = await state.findOne({key: 1})
          results.searchEngine = await searchEngine.find({})
          results.token = await token.find({})
        }
        // else if(name == 'bookmarks'){
        //   results.favorite = await favorite.find({})
        // }
        else if(name == 'browsingHistory'){
          results.visit = await visit.find({})
          results.history = await history.find({})
          results.image = await image.find({})

          const capturePath = path.join(path.join(app.getPath('userData'),'resource'),'capture')
          const realImages = []
          if (fs.existsSync(capturePath)) {
            for(let file of fs.readdirSync(capturePath)){
              try{
                realImages.push([file,nativeImage.createFromPath(path.join(capturePath,file)).toDataURL()])
              }catch(e){
                console.log(e)
              }
            }
            results.realImages = realImages
          }
        }
        else if(name == 'sessionTools'){
          results.tabState = await tabState.find({})
          results.windowState = await windowState.find({})
          results.savedState = await savedState.find({})
        }
        else if(name == 'favicons'){
          results.favicon = await favicon.find({})
        }
        else if(name == 'downloadHistory'){
          results.download = await download.find({})
          results.downloader = await downloader.find({})
        }
        else if(name == 'automation'){
          results.automation = await automation.find({})
          results.automationOrder = await automationOrder.find({})
        }
        else if(name == 'note'){
          results.note = await note.find({})
        }
        else if(name == 'password'){
          results.password = await crypto.find({})
        }
      }
      fs.writeFileSync(fileName, JSON.stringify(results))
    }
  })
})

function deleteInsert(table,datas){
  if(!datas) return
  return table.remove({}, { multi: true }).then(_=>{
    table.insert(datas).then(_=>{
      console.log(datas[0])
    })
  })
}

async function incrementalImport(table,datas,compareKey,updateKey){
  if(!datas) return
  const _nowData = await table.find({})
  const nowData = {}

  let updateFlag = false
  let i = 0
  const _idSet = new Set()
  for(let d of _nowData){
    nowData[d[compareKey]] = [d[updateKey],i++,d._id]
    _idSet.add(d._id)
  }
  for(let d of datas){
    const cData = nowData[d[compareKey]]
    if(cData){
      if(d[updateKey] > cData[0]){
        if(cData[2] !== d._id && _idSet.has(d._id)){
          delete d._id
        }
        _nowData[cData[1]] = d
        updateFlag = true
      }
    }
    else{
      if(_idSet.has(d._id)){
        delete d._id
      }
      _nowData.push(d)
      updateFlag = true
    }
  }

  if(updateFlag) deleteInsert(table,_nowData)
}

function diffArray(arr1, arr2) {
  return arr1.filter(e=>!arr2.includes(e))
}

async function incrementalImportRecur(table,datas){
  if(!datas) return
  const _nowData = await table.find({})
  const nowData = {}

  let updateFlag = false
  let i = 0
  const _idSet = new Set()
  for(let d of _nowData){
    nowData[d.key] = [d,i++]
    _idSet.add(d._id)
  }
  for(let d of datas){
    const cData = nowData[d.key]
    if(cData){
      const nData = cData[0]
      if(!d.is_file) {
        if(nData.children && (diffArray(d.children,nData.children).length || diffArray(nData.children,d.children).length)){
          d.children = [...new Set([...nData.children,...(d.children || [])])]
          if(nData._id !== d._id && _idSet.has(d._id)){
            delete d._id
          }
          _nowData[cData[1]] = d
          updateFlag = true
        }
      }
      else{
        if(d.updated_at > nData.updated_at){
          if(nData._id !== d._id && _idSet.has(d._id)){
            delete d._id
          }
          _nowData[cData[1]] = d
          updateFlag = true
        }
      }
    }
    else{
      if(_idSet.has(d._id)){
        delete d._id
      }
      _nowData.push(d)
      updateFlag = true
    }
  }

  if(updateFlag) deleteInsert(table,_nowData)
}


async function importData(imports, restoreDatas, all, ignoreToken) {
  for (let name of imports) {
    if (name == 'generalSettings' && restoreDatas.startsWith !== void 0) {
      const setting = restoreDatas
      state.update({key: 1}, setting).then(_ => _)
      // try {
      //   if (setting && setting.adBlockDisableSite.length) {
      //     setting.adBlockDisableSite = JSON.parse(setting.adBlockDisableSite)
      //   }
      // } catch (e) {
      //   setting.adBlockDisableSite = {}
      // }
      for (let [key, dVal] of Object.entries(settingDefault)) {
        setOptionVal(key, dVal, setting[key])
      }
    }
    else if (name == 'generalSettings' && restoreDatas.state) {
      const setting = restoreDatas.state
      if (all) {
        state.update({key: 1}, setting, {upsert: true}).then(_ => _)
        // try {
        //   if (setting && setting.adBlockDisableSite.length) {
        //     setting.adBlockDisableSite = JSON.parse(setting.adBlockDisableSite)
        //   }
        // } catch (e) {
        //   setting.adBlockDisableSite = {}
        // }
        for (let [key, dVal] of Object.entries(settingDefault)) {
          setOptionVal(key, dVal, setting[key])
        }

        deleteInsert(searchEngine, restoreDatas.searchEngine).then(_ => {
          for (let win of BrowserWindow.getAllWindows()) {
            if (win.getTitle().includes('Sushi Browser')) {
              if (!win.webContents.isDestroyed()) win.webContents.send('update-search-engine')
            }
          }
        })
        deleteInsert(token, restoreDatas.token).then(_ => _)
      }
      else {
        const orgState = await state.findOne({key: 1})
        if (orgState.updated_at > setting.updated_at) {
          state.update({key: 1}, setting, {upsert: true}).then(_ => _)
          // try {
          //   if (setting && setting.adBlockDisableSite.length) {
          //     setting.adBlockDisableSite = JSON.parse(setting.adBlockDisableSite)
          //   }
          // } catch (e) {
          //   setting.adBlockDisableSite = {}
          // }
          for (let [key, dVal] of Object.entries(settingDefault)) {
            setOptionVal(key, dVal, setting[key])
          }
        }
        incrementalImport(searchEngine, restoreDatas.searchEngine, 'search', 'updated_at')
        if(!ignoreToken){
          incrementalImport(token, restoreDatas.token, 'email', 'updated_at')
        }
      }
    }
    // else if (name == 'bookmarks') {
    //   if (all) {
    //     deleteInsert(favorite, restoreDatas.favorite)
    //   }
    //   else {
    //     incrementalImportRecur(favorite,restoreDatas.favorite)
    //   }
    // }
    else if (name == 'browsingHistory') {
      if (all) {
        deleteInsert(visit, restoreDatas.visit)
        deleteInsert(history, restoreDatas.history)
        deleteInsert(image, restoreDatas.image)
      }
      else {
        incrementalImport(visit, restoreDatas.visit, '_id', 'created_at')
        incrementalImport(history, restoreDatas.history, 'location', 'updated_at')
        incrementalImport(image, restoreDatas.image, 'url', 'updated_at')
      }

      const capturePath = path.join(path.join(app.getPath('userData'), 'resource'), 'capture')
      if (fs.existsSync(capturePath)) {
        for (let [file, data] of restoreDatas.realImages) {
          const filePath = path.join(capturePath, file)
          if (!fs.existsSync(filePath)) {
            try {
              fs.writeFile(filePath, nativeImage.createFromDataURL(data).toPNG(), err => {
                console.log(err)
              })
            } catch (e) {
              console.log(e)
            }
          }
        }
      }
    }
    else if (name == 'sessionTools') {
      if (all) {
        deleteInsert(tabState, restoreDatas.tabState)
        deleteInsert(windowState, restoreDatas.windowState)
        deleteInsert(savedState, restoreDatas.savedState)
      }
      else {
        incrementalImport(tabState, restoreDatas.tabState, 'tabKey', 'updated_at')
        incrementalImport(windowState, restoreDatas.windowState, 'key', 'updated_at')
        incrementalImport(savedState, restoreDatas.savedState, '_id', 'created_at')
      }
    }
    else if (name == 'favicons') {
      if (all) {
        deleteInsert(favicon, restoreDatas.favicon)
      }
      else {
        incrementalImport(favicon, restoreDatas.favicon, 'url', 'updated_at')
      }
    }
    else if (name == 'downloadHistory') {
      if (all) {
        deleteInsert(download, restoreDatas.download)
        deleteInsert(downloader, restoreDatas.downloader)
      }
      else {
        incrementalImport(download, restoreDatas.download, '_id', 'updated_at')
        incrementalImport(downloader, restoreDatas.downloader, 'key', 'now')
      }
    }
    else if (name == 'automation') {
      if (all) {
        deleteInsert(automation, restoreDatas.automation)
        deleteInsert(automationOrder, restoreDatas.automationOrder)
      }
      else {
        incrementalImport(automation, restoreDatas.automation, 'key', 'updated_at')
        if (restoreDatas.automationOrder) {
          const nowData = await automationOrder.findOne({})
          for (let d of restoreDatas.automationOrder[0].datas) {
            const ind = nowData.datas.findIndex(x => x.key == d.key)
            if (ind !== -1) {
              nowData.datas[ind] = d
            }
            else {
              nowData.datas.push(d)
            }
          }
          automationOrder.update({key: nowData.key}, nowData, {upsert: true})
        }
      }
    }
    else if (name == 'note') {
      if (all) {
        deleteInsert(note, restoreDatas.note)
      }
      else {
        incrementalImportRecur(note, restoreDatas.note)
      }
    }
    else if (name == 'password' && restoreDatas.password) {
      const ses = session.defaultSession
      if (all) {
        ses.autofill.clearLogins()
      }
      for (let pass of restoreDatas.password) {
        pass.password = passCrypto.decrypt(pass.password)
        ses.autofill.addLogin(pass)
      }
    }
  }
}

export default importData

ipcMain.on('import-setting', (e,imports,all) => {
  const focusedWindow = Browser.getFocusedWindow();
  const fileName = moment().format('DD_MM_YYYY') + '.json'
  const defaultPath = path.join(app.getPath('downloads'), fileName)

  dialog.showOpenDialog(focusedWindow, {
    defaultPath: defaultPath,
    properties: ['openFile'],
    filters: [
      {name: 'JSON File', extensions: ['json']},
      {name: 'All Files', extensions: ['*']}
    ]
  }, async fileNames => {
    if (fileNames && fileNames.length == 1) {
      const restoreDatas = JSON.parse(fs.readFileSync(fileNames[0]).toString())

      await importData(imports, restoreDatas, all);
    }
  })
})

async function recurSelect(keys,indent){
  const favorites = await favorite.find({key:{$in: keys}})
  const space = '  '.repeat(indent)
  const ret = []
  for(let x of favorites){
    if(x.is_file){
      ret.push(`${space}<DT><A HREF="${x.url}" ADD_DATE="${Math.round(x.created_at / 1000)}">${x.title}</A>`)
    }
    else if(x.children.length > 0){
      if(keys[0]!='root'){
        ret.push(`${space}<DT><H3 ADD_DATE="${Math.round(x.created_at / 1000)}" LAST_MODIFIED="${Math.round(x.updated_at / 1000)}">${x.title}</H3>`)
      }
      ret.push(`${space}<DL><p>`)
      ret.push(...(await recurSelect(x.children,indent+2)))
      ret.push(`${space}</DL><p>`)
    }
  }
  return ret
}

async function getAllFavorites(){
  let list = []
  const ret = await recurSelect(['root'],2)
  return ret
}