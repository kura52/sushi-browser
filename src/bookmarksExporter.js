/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import mainState from "./mainState";

const path = require('path')
const moment = require('moment')
const fs = require('fs')
const {dialog,app,BrowserWindow,ipcMain} = require('electron')
import {favorite, state} from './databaseFork'
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

ipcMain.on('export-setting', _ => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  const fileName = moment().format('DD_MM_YYYY') + '.json'
  const defaultPath = path.join(app.getPath('downloads'), fileName)

  dialog.showDialog(focusedWindow, {
    defaultPath: defaultPath,
    type: 'select-saveas-file',
    extensions: [['json']]
  }, fileNames => {
    if (fileNames && fileNames.length == 1) {
      state.findOne({key: 1}).then(rec=>{
        fs.writeFileSync(fileNames[0], JSON.stringify(rec))
      })
    }
  })
})

ipcMain.on('import-setting', _ => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  const fileName = moment().format('DD_MM_YYYY') + '.json'
  const defaultPath = path.join(app.getPath('downloads'), fileName)

  dialog.showDialog(focusedWindow, {
    defaultPath: defaultPath,
    type: 'select-open-file',
    extensions: [['json']]
  }, fileNames => {
    if (fileNames && fileNames.length == 1) {
      const setting = JSON.parse(fs.readFileSync(fileNames[0]).toString())
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