/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import {ipcMain,dialog,BrowserWindow,importer,session, app} from 'electron'
import {getCurrentWindow} from './util'
const uuid = require('node-uuid')
import {favorite,history,favicon} from './databaseFork'

var isImportingBookmarks = false
var hasBookmarks
var importedSites
let sender,key,type

ipcMain.on("import-browser-data",e=>{
  sender = (e.sender.hostWebContents2 || e.sender)
  importer.initialize()
})

const importData = (selected) => {
  console.log(selected)
  importer.importData(selected)
}

const importHTML = (selected) => {
  const files = dialog.showOpenDialog(getCurrentWindow(),{
    properties: ['openFile'],
    filters: [
      {name: 'HTML File', extensions: ['html', 'htm']},
      {name: 'All Files', extensions: ['*']}
    ]
  },files=>{
    if (files && files.length > 0) {
      const file = files[0]
      importer.importHTML(file)
    }
  })
}

function getTime(time){
  return time ? time * 1000 : Date.now()
}

importer.on('update-supported-browsers', (e, detail) => {
  isImportingBookmarks = false
  console.log('detail',detail)
  key = uuid.v4()
  sender.send("show-notification",{key,import:true,detail})
  ipcMain.once(`reply-notification-${key}`,(e,ret)=>{
    console.log(ret)
    if(ret.pressIndex == 0){
      if(ret.value.type == 5){
        type = 'html'
        importHTML(ret.value)
      }
      else{
        type = 'data'
        importData(ret.value)
      }
    }
  })
})

importer.on('add-password-form', (e, detail) => {
})

let isImportingHistory
importer.on('add-history-page', async (e, hist, visitSource) => {
  isImportingHistory = true
  console.log("history-start")
  for (let i = 0; i < hist.length; ++i) {
    if(await history.findOne({location:hist[i].url})){}
    else{
      await history.insert({
        location: hist[i].url,
        title: hist[i].title,
        count: 1,
        created_at: hist[i].last_visit * 1000,
        updated_at: hist[i].last_visit * 1000
      })
    }
  }
  console.log("history-end")
  isImportingHistory = false
})

importer.on('add-homepage', (e, detail) => {
})

async function recurAddFolder(b,map){
  const key = uuid.v4()
  const folder = {
    key,
    title:b.title,
    is_file:false,
    children: [],
    created_at: getTime(b.creation_time),
    updated_at: getTime(b.creation_time),
  }
  if(b.path.length == 0){
    await favorite.update({key: 'root'}, { $push: { children: key }, $set:{updated_at: Date.now()}})
  }
  else{
    let p_folder = map.get(b.path.join("/"))
    if(!p_folder){
      const path = b.path.slice(0,b.path.length - 1)
      const parentB = {
        key : uuid.v4(),
        title:b.path[b.path.length - 1],
        is_file:false,
        path,
        children: [],
        created_at: getTime(b.creation_time),
        updated_at: getTime(b.creation_time)
      }
      await recurAddFolder(parentB,map)
      p_folder = map.get(b.path.join("/"))
    }
    p_folder.children.push(key)
  }
  map.set([...b.path,folder.title].join("/"),folder)
}

let isImportingBookmark
importer.on('add-bookmarks', async (e, bookmarks, topLevelFolder) => {
  isImportingBookmark = true
  console.log("favorite-start")
  // if(type == 'html'){
  //   bookmarks.sort((a,b)=> a.path.join("/") < b.path.join("/") ? -1 : 1)
  // }
  let sites = []
  let map = new Map()
  for (let i = 0; i < bookmarks.length; ++i) {
    // console.log(bookmarks[i])
    let path = bookmarks[i].path

    if(path.length == 1 && !map.has(path.join("/"))){
      const key = uuid.v4()
      const folder = {
        key,
        title:path[0],
        is_file:false,
        children: [],
        created_at: getTime(bookmarks[i].creation_time),
        updated_at: getTime(bookmarks[i].creation_time),
      }
      await favorite.update({key: 'root'}, { $push: { children: key }, $set:{updated_at: Date.now()}})
      map.set(path.join("/"),folder)
    }

    if (bookmarks[i].is_folder) {
      await recurAddFolder(bookmarks[i],map)
    }
    else {
      const key = uuid.v4()
      const site = {
        key,
        url: bookmarks[i].url,
        title:bookmarks[i].title,
        is_file:true,
        created_at: getTime(bookmarks[i].creation_time),
        updated_at: getTime(bookmarks[i].creation_time)
      }
      if(path.length == 0){
        await favorite.update({key: 'root'}, { $push: { children: key }, $set:{updated_at: Date.now()}})
      }
      else{
        let folder = map.get(path.join("/"))
        if(!folder){
          const k = uuid.v4()
          const f = {
            key:k,
            title:path[path.length - 1],
            is_file:false,
            children: [],
            created_at: getTime(bookmarks[i].creation_time),
            updated_at: getTime(bookmarks[i].creation_time),
          }
          let p_folder = map.get(path.slice(0,path.length - 1).join("/"))
          console.log(1,p_folder)
          if(!p_folder){
            const b = bookmarks[i]
            const path2 = b.path.slice(0,b.path.length - 1)
            const parentB = {
              key : uuid.v4(),
              title:b.path[b.path.length - 1],
              is_file:false,
              path: path2,
              children: [],
              created_at: getTime(b.creation_time),
              updated_at:getTime(b.creation_time),
            }
            await recurAddFolder(parentB,map)
            p_folder = map.get(path.slice(0,path.length - 1).join("/"))
          }
          p_folder.children.push(k)
          map.set(path.join("/"),f)
          folder = f
        }
        folder.children.push(key)
      }
      map.set(key,site)
    }
  }
  await favorite.insert([...map.values()])
  console.log("favorite-end")
  isImportingBookmark = false
  // console.log(sites,topLevelFolder)
})

importer.on('add-favicons', async (e, detail) => {
  console.log("favicons-start")
  while(true){
    if(isImportingHistory || isImportingBookmark){
      await new Promise(r=>setTimeout(r,200))
    }
    else{
      break
    }
  }
  for(let entry of detail){
    const furl = entry.favicon_url.includes('made-up-favicon') ? uuid.v4() : entry.favicon_url
    for (let url of entry.urls) {
      if(!entry.png_data || entry.png_data == 'data:image/png;base64,' || furl.startsWith("data:")) continue
      favicon.update({url:furl},  {url:furl, data: entry.png_data, updated_at: Date.now()}, { upsert: true }).then(_=>_)
      let datas
      if(datas = await history.find({location: url})){
        for(let data of datas){
          await history.update({_id: data._id},{ $set:{favicon: furl,updated_at: Date.now()}})
        }
      }

      if(datas = await favorite.find({url: url})){
        for(let data of datas){
          await favorite.update({_id: data._id},{ $set:{favicon: furl,updated_at: Date.now()}})
        }
      }

      if(!(await favicon.findOne({url: furl}))){
        await favicon.insert({url:furl , created_at: Date.now(),updated_at: Date.now()})
      }
    }
  }
  console.log("favicons-end")
})

importer.on('add-keywords', (e, templateUrls, uniqueOnHostAndPath) => {
})

importer.on('add-autofill-form-data-entries', (e, detail) => {
})

const shouldSkipCookie = (cookie) => {
  // Bypassing cookie mismatch error in
  // https://github.com/brave/browser-laptop/issues/11401
  const googleDomain = /^.*\.google.com(\..+)*$/
  if (cookie.domain.match(googleDomain) &&
    ['OSID', 'LSID', 'SIDCC'].includes(cookie.name)) {
    return true
  }
  return false
}
module.exports.shouldSkipCookie = shouldSkipCookie

importer.on('add-cookies', (e, cookies) => {
  console.log("cookies-start")
  for (let i = 0; i < cookies.length; ++i) {
    const cookie = {
      url: cookies[i].url,
      name: cookies[i].name,
      value: cookies[i].value,
      domain: cookies[i].domain,
      path: cookies[i].path,
      secure: cookies[i].secure,
      httpOnly: cookies[i].httponly,
      expirationDate: cookies[i].expiry_date
    }
    if (shouldSkipCookie(cookie)) {
      continue
    }
    session.defaultSession.cookies.set(cookie, (error) => {
      if (error) console.error(error)
    })
  }
  console.log("cookies-end")
})


const showImportWarning = function () {
  dialog.showMessageBox(BrowserWindow.getActiveWindow(), {
    type: 'info',
    buttons: ['OK'],
    title: 'Import Warning',
    message: 'Firefox must be closed during data import. Please close and try again.'
  },ret=>cb(ret === 0, '', false));
}

const showImportSuccess = function () {
  dialog.showMessageBox(BrowserWindow.getActiveWindow(), {
    type: 'info',
    buttons: ['OK'],
    title: 'Import Success',
    message: 'Your data is currently being imported. Once the import is complete, you will be able to see it on the bookmark or history screen.'
  });
}

app.on('show-warning-dialog', (e) => {
  showImportWarning()
})

importer.on('import-success', (e) => {
  showImportSuccess()
})

importer.on('import-dismiss', (e) => {
})
