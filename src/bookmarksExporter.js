/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import mainState from "./mainState";

const path = require('path')
const moment = require('moment')
const fs = require('fs')
const {dialog,app,BrowserWindow,ipcMain,nativeImage} = require('electron')
import {state,searchEngine,favorite,visit,history,image,tabState,windowState,savedState,favicon,download,downloader,automation,automationOrder,note} from './databaseFork'
import {settingDefault} from "../resource/defaultValue";
const os = require('os')

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
  const focusedWindow = BrowserWindow.getFocusedWindow()
  const fileName = moment().format('DD_MM_YYYY') + '.html'
  const defaultPath = path.join(app.getPath('downloads'), fileName)

  dialog.showDialog(focusedWindow, {
    defaultPath: defaultPath,
    type: 'select-saveas-file',
    extensions: [['html']]
  }, (fileNames) => {
    if (fileNames && fileNames.length == 1) {
      getAllFavorites().then(ret=>{
        fs.writeFileSync(fileNames[0], createBookmarkHTML(ret))
      })
    }
  })
})

ipcMain.on('export-setting', (e,exports) => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  const fileName = moment().format('DD_MM_YYYY') + '.json'
  const defaultPath = path.join(app.getPath('downloads'), fileName)

  dialog.showDialog(focusedWindow, {
    defaultPath: defaultPath,
    type: 'select-saveas-file',
    extensions: [['json']]
  }, async fileNames => {
    if (fileNames && fileNames.length == 1) {
      const results = {}
      for(let name of exports){
        if(name == 'generalSettings'){
          results.state = await state.findOne({key: 1})
          results.searchEngine = await searchEngine.find({})
        }
        else if(name == 'bookmarks'){
          results.favorite = await favorite.find({})
        }
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
      }
      fs.writeFileSync(fileNames[0], JSON.stringify(results))
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

ipcMain.on('import-setting', (e,imports) => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  const fileName = moment().format('DD_MM_YYYY') + '.json'
  const defaultPath = path.join(app.getPath('downloads'), fileName)

  dialog.showDialog(focusedWindow, {
    defaultPath: defaultPath,
    type: 'select-open-file',
    extensions: [['json']]
  }, async fileNames => {
    if (fileNames && fileNames.length == 1) {
      const restoreDatas = JSON.parse(fs.readFileSync(fileNames[0]).toString())

      for(let name of imports){
        if(name == 'generalSettings' && restoreDatas.startsWith !== void 0){
          const setting = restoreDatas
          state.update({ key: 1 }, setting).then(_=>_)
          try{
            if(setting && setting.adBlockDisableSite.length){
              setting.adBlockDisableSite = JSON.parse(setting.adBlockDisableSite)
            }
          }catch(e){
            setting.adBlockDisableSite = {}
          }
          for(let [key,dVal] of Object.entries(settingDefault)){
            setOptionVal(key,dVal,setting[key])
          }
        }
        else if(name == 'generalSettings' && restoreDatas.state){
          const setting = restoreDatas.state
          state.update({ key: 1 }, setting).then(_=>_)
          try{
            if(setting && setting.adBlockDisableSite.length){
              setting.adBlockDisableSite = JSON.parse(setting.adBlockDisableSite)
            }
          }catch(e){
            setting.adBlockDisableSite = {}
          }
          for(let [key,dVal] of Object.entries(settingDefault)){
            setOptionVal(key,dVal,setting[key])
          }

          deleteInsert(searchEngine,restoreDatas.searchEngine).then(_=>{
            for(let win of BrowserWindow.getAllWindows()) {
              if(win.getTitle().includes('Sushi Browser')){
                if(!win.webContents.isDestroyed()) win.webContents.send('update-search-engine')
              }
            }
          })
        }
        else if(name == 'bookmarks'){
          deleteInsert(favorite,restoreDatas.favorite)
        }
        else if(name == 'browsingHistory'){
          deleteInsert(visit,restoreDatas.visit)
          deleteInsert(history,restoreDatas.history)
          deleteInsert(image,restoreDatas.image)

          const capturePath = path.join(path.join(app.getPath('userData'),'resource'),'capture')
          if (fs.existsSync(capturePath)) {
            for(let [file,data] of restoreDatas.realImages){
              const filePath = path.join(capturePath,file)
              if(!fs.existsSync(filePath)){
                try{
                  fs.writeFile(filePath,nativeImage.createFromDataURL(data).toPNG(),err=>{
                    console.log(err)
                  })
                }catch(e){
                  console.log(e)
                }
              }
            }
          }
        }
        else if(name == 'sessionTools'){
          deleteInsert(tabState,restoreDatas.tabState)
          deleteInsert(windowState,restoreDatas.windowState)
          deleteInsert(savedState,restoreDatas.savedState)
        }
        else if(name == 'favicons'){
          deleteInsert(favicon,restoreDatas.favicon)
        }
        else if(name == 'downloadHistory'){
          deleteInsert(download,restoreDatas.download)
          deleteInsert(downloader,restoreDatas.downloader)
        }
        else if(name == 'automation'){
          deleteInsert(automation,restoreDatas.automation)
          deleteInsert(automationOrder,restoreDatas.automationOrder)
        }
        else if(name == 'note'){
          deleteInsert(note,restoreDatas.note)
        }
      }
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