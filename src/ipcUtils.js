import {ipcMain,app,dialog,BrowserWindow,shell,webContents,session,clipboard,nativeImage} from 'electron'
const BrowserWindowPlus = require('./BrowserWindowPlus')
import fs from 'fs'
import sh from 'shelljs'
import uuid from 'node-uuid'
import PubSub from './render/pubsub'
import {toKeyEvent} from 'keyboardevent-from-electron-accelerator'
import https from 'https'
import URL from 'url'

const os = require('os')
const seq = require('./sequence')
const {state,favorite,tabState,visit,savedState,automation,automationOrder,note} = require('./databaseFork')
const db = require('./databaseFork')
const FfmpegWrapper = require('./FfmpegWrapper')
const defaultConf = require('./defaultConf')

import path from 'path'
const ytdl = require('ytdl-core')
const youtubedl = require('youtube-dl')
import {getFocusedWebContents,getCurrentWindow} from './util'
const isWin = process.platform == 'win32'
const isLinux = process.platform === 'linux'
const meiryo = isWin && Intl.NumberFormat().resolvedOptions().locale == 'ja'
import mainState from './mainState'
import extensionInfos from "./extensionInfos";
import {history, token} from "./databaseFork";
const open = require('./open')
const {readMacro,readMacroOff,readTargetSelector,readTargetSelectorOff,readComplexSearch} = require('./readMacro')
const sharedState = require('./sharedStateMain')
const bindPath = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/bind.html'

function exec(command) {
  console.log(command)
  return new Promise(function(resolve, reject) {
    require('child_process').exec(command, function(error, stdout, stderr) {
      if (error) {
        return reject(error);
      }
      resolve({stdout, stderr});
    });
  });
}


function getBindPage(tabId){
  return webContents.getAllWebContents().filter(wc=>wc.getId() === tabId)
}

function scaling(num){
  return Math.round(num * mainState.scaleFactor)
}

function diffArray(arr1, arr2) {
  return arr1.filter(e=>!arr2.includes(e))
}

function shellEscape(s){
  return '"'+s.replace(/(["\t\n\r\f'$`\\])/g,'\\$1')+'"'
}


function formatDate(date) {
  return `${date.getFullYear()}${('0' + (date.getMonth() + 1)).slice(-2)}${('0' + date.getDate()).slice(-2)}_${('0' + date.getHours()).slice(-2)}${('0' + date.getMinutes()).slice(-2)}${('0' + date.getSeconds()).slice(-2)}`;
}


function eachSlice(arr,size){
  const newArray = []
  for (let i = 0, l = arr.length; i < l; i += size){
    newArray.push(arr.slice(i, i + size))
  }
  return newArray
}

ipcMain.on('file-system',(event,key,method,arg)=>{
  if(!['stat','readdir','rename'].includes(method)) return
  fs[method](...arg,(err,rets)=>{
    if(err){
      console.log(err)
    }
    else if(method == 'stat'){
      rets = {isDirectory:rets.isDirectory(),mtime:rets.mtime,size:rets.size}
    }
    event.sender.send(`file-system-reply_${key}`,rets)
  })
})

ipcMain.on('file-system-list',(event,key,method,args)=>{
  if(!['stat','readdir'].includes(method)) return
  Promise.all(args.map(arg=>{
    return new Promise((resolve,reject)=>{
      fs[method](...arg,(err,rets)=>{
        if(err){
          resolve(null)
          return
        }
        if(method == 'stat'){
          rets = {isDirectory:rets.isDirectory(),mtime:rets.mtime,size:rets.size}
        }
        resolve(rets)
      })
    })
  })).then(rets=>{
    event.sender.send(`file-system-list-reply_${key}`,rets.filter(x=>x))
  })
})

ipcMain.on('shell-list',(event,key,method,args)=>{
  if(!['mv'].includes(method)) return
  event.sender.send(`shell-list-reply_${key}`,args.map(arg=>sh[method](...arg).code))
})

ipcMain.on('app-method',(event,key,method,arg)=>{
  if(!['getPath'].includes(method)) return
  event.sender.send(`app-method-reply_${key}`,app[method](arg))
})

ipcMain.on('move-trash',(event,key,args)=>{
  for(let arg of args){
    shell.moveItemToTrash(arg)
  }
  event.sender.send(`move-trash-reply_${key}`,{})
})

ipcMain.on('create-file',(event,key,path,isFile)=>{
  if(isFile){
    fs.writeFile(path,'',_=> event.sender.send(`create-file-reply_${key}`,{}))
  }
  else{
    fs.mkdir(path,_=> event.sender.send(`create-file-reply_${key}`,{}))
  }
})

ipcMain.on('show-dialog-exploler',(event,key,info,tabId)=>{
  const cont = tabId !== 0 && (sharedState[tabId] || webContents.fromTabID(tabId))
  console.log(tabId,cont)
  if(info.inputable || info.normal || info.convert){
    const key2 = uuid.v4();
    (cont ? event.sender : event.sender.hostWebContents).send('show-notification',
      {id:(cont || event.sender).getId(),
        key: key2, title: info.title, text: info.text,
        initValue: info.normal ? void 0 : info.initValue,
        needInput: info.normal || info.convert ? void 0 : info.needInput || [""],
        convert: info.convert,
        option: info.normal ? void 0 : info.option || [""],
        buttons : info.normal ? info.buttons : void 0})

    ipcMain.once(`reply-notification-${key2}`,(e,ret)=>{
      if(ret.pressIndex !== 0){
        event.sender.send(`show-dialog-exploler-reply_${key}`)
      }
      else{
        console.log(`show-dialog-exploler-reply_${key}`)
        event.sender.send(`show-dialog-exploler-reply_${key}`,ret.value || ret.pressIndex)
      }
    })
  }
  else{
    let option = { defaultPath:info.defaultPath, type: 'select-folder' }
    if(info.needVideo){
      option.type = 'select-open-multi-file'
      option.extensions =  ['3gp','3gpp','3gpp2','asf','avi','dv','flv','m2t','m4v','mkv','mov','mp4','mpeg','mpg','mts','oggtheora','ogv','rm','ts','vob','webm','wmv']
    }
    else if(info.needIcon){
      option.type = 'select-open-file'
      option.extensions =  ['ico','icon','png','gif','bmp','jpg','jpeg']
    }
    dialog.showDialog(BrowserWindow.getFocusedWindow(), option, (selected) => {
      if (selected && selected.length > 0) {
        event.sender.send(`show-dialog-exploler-reply_${key}`,info.needVideo ? selected : selected[0])
      }
      else{
        event.sender.send(`show-dialog-exploler-reply_${key}`)
      }
    })
  }
})


ipcMain.on('get-favorites',(event,key,dbKey)=>{
  favorite.findOne({key: dbKey}).then(ret=>{
    favorite.find({key:{$in: ret.children}}).then(ret2=>{
      event.sender.send(`get-favorites-reply_${key}`,ret2)
    })
  })
})


ipcMain.on('insert-favorite',(event,key,writePath,data,isNote)=>{
  console.log("insert",writePath,data)
  const db = isNote ? note : favorite
  db.insert({key,...data,created_at: Date.now(), updated_at: Date.now()}).then(ret=>{
    db.update({ key: writePath }, { $push: { children: key }, $set:{updated_at: Date.now()} }).then(ret2=>{
      if(ret2 == 0 && writePath == 'top-page'){
        db.insert({key:writePath, children: [key], is_file: false, title: 'Top Page' ,created_at: Date.now(), updated_at: Date.now()}).then(ret=>{
          db.update({ key: 'root' }, { $push: { children: 'top-page' }, $set:{updated_at: Date.now()} }).then(ret2=> {
            event.sender.send(`insert-favorite-reply_${key}`,key)
          })
        })
      }
      else{
        event.sender.send(`insert-favorite-reply_${key}`,key)
      }
    })
  })
})

ipcMain.on('insert-favorite2',(event,key,writePath,dbKey,data,isNote)=>{
  console.log("insert",writePath,data)
  const db = isNote ? note : favorite
  db.findOne({key:writePath}).then(rec=>{
    const ind = rec.children.findIndex(x=>x == dbKey)
    rec.children.splice(ind+1,0,key)
    console.log("insert2",rec)
    db.insert({key,...data,created_at: Date.now(), updated_at: Date.now()}).then(ret=>{
      console.log("insert3",ret)
      db.update({ key: writePath }, { $set:{children: rec.children,updated_at: Date.now()}}).then(ret2=>{
        event.sender.send(`insert-favorite2-reply_${key}`,key)
      })
    })
  })
})

ipcMain.on('rename-favorite',async (event,key,dbKey,newName,isNote)=>{
  console.log(99,dbKey,newName)
  const db = isNote ? note : favorite
  if(isNote){
    const d = await db.findOne({ key: dbKey })
    if(d && d.title == newName.title) return
  }
  db.update({ key: dbKey }, { $set: {...newName,updated_at: Date.now()}}).then(ret2=>{
    event.sender.send(`rename-favorite-reply_${key}`,key)
  })
})


async function recurGet(keys,num,isNote){
  const db = isNote ? note : favorite
  const ret = await db.find({key:{$in: keys}})
  const datas = []
  const promises = []

  for(let x of ret){
    const data = {key:x.key,title:x.title,url:x.url,favicon:x.favicon,is_file:x.is_file}
    if(x.children){
      promises.push(recurGet(num ? x.children.slice(num) : x.children,void 0,isNote))
    }
    else{
      promises.push(false)
    }
    datas.push(data)
  }
  const rets = await Promise.all(promises)
  rets.map((ret,i)=>{
    if(ret) datas[i].children2 = ret
  })
  return datas
}

ipcMain.on('get-all-favorites',async(event,key,dbKeys,num,isNote)=>{
  const ret = await recurGet(dbKeys,num,isNote)
  event.sender.send(`get-all-favorites-reply_${key}`,ret)
})

ipcMain.on('get-all-states',async(event,key,range)=>{
  const cond =  !Object.keys(range).length ? range :
    {$or: [{ created_at: (
          range.start === void 0 ? { $lte: range.end } :
            range.end === void 0 ? { $gte: range.start } :
              { $gte: range.start ,$lte: range.end }
        )}, {user: true}]}
  const ret = await savedState.find_sort([cond],[{ created_at: -1 }])
  event.sender.send(`get-all-states-reply_${key}`,ret)
})

ipcMain.on('get-favorites-shallow', async(event,key,dbKey,limit)=>{
  const x = await favorite.findOne({key:dbKey})
  const result = {key:x.key,title:x.title,url:x.url,favicon:x.favicon,is_file:x.is_file}
  if(x.children){
    const ret = await favorite.find({key:{$in: x.children.slice(0,limit)}})
    result.children = ret.map(x=>({key:x.key,title:x.title,url:x.url,favicon:x.favicon,is_file:x.is_file}))
  }
  event.sender.send(`get-favorites-shallow-reply_${key}`,result)
})

async function recurFind(keys,list,isNote){
  const db = isNote ? note : favorite
  const ret = await db.find({key:{$in: keys}})
  const addKey = []
  let children = ret.map(x=>{
    if(x.is_file){
      addKey.push(x.url)
    }
    return x.children
  })
  const nextKeys = Array.prototype.concat.apply([],children).filter(ret=>ret)
  list.splice(list.length,0,...addKey)
  if(nextKeys && nextKeys.length > 0) {
    return (await recurFind(nextKeys, list, isNote))
  }
}

ipcMain.on('open-favorite',async (event,key,dbKeys,tabId,type,isNote)=>{
  let list = []
  const cont = tabId !== 0 && (sharedState[tabId] || webContents.fromTabID(tabId))
  const ret = await recurFind(dbKeys,list,isNote)
  const host = cont ? event.sender : event.sender.hostWebContents
  if(type == "openInNewTab" || type=='openInNewPrivateTab' || type=='openInNewTorTab' || type=='openInNewSessionTab'){
    for(let url of list){
      await new Promise((resolve,reject)=>{
        setTimeout(_=>{
          if(tabId){
            host.send("new-tab",tabId,url,type=='openInNewSessionTab' ? `persist:${seq()}` : type=='openInNewTorTab' ? 'persist:tor' : type=='openInNewPrivateTab' ? `${seq(true)}` : false)
          }
          else{
            host.send("new-tab-opposite", event.sender.getId(),url,(void 0),type=='openInNewSessionTab' ? `persist:${seq()}` : type=='openInNewTorTab' ? 'persist:tor' : type=='openInNewPrivateTab' ? `${seq(true)}` : false)
          }
          resolve()
        },200)
      })
    }
  }
  else{
    const win = BrowserWindow.fromWebContents(host)
    ipcMain.once('get-private-reply',(e,privateMode)=>{
      console.log(67866,JSON.stringify({urls:list.map(url=>{return {url}}), type: type == 'openInNewWindow' ? 'new-win' : type == 'openInNewWindowWithOneRow' ? 'one-row' : 'two-row'}))
      BrowserWindowPlus.load({id:win.id,sameSize:true,tabParam:JSON.stringify({urls:list.map(url=>{return {url}}),
          type: type == 'openInNewWindow' ? 'new-win' : type == 'openInNewWindowWithOneRow' ? 'one-row' : 'two-row'})})
    })
    win.webContents.send('get-private', (cont || event.sender).getId())
  }

  console.log(list)
  event.sender.send(`open-favorite-reply_${key}`,key)
})


ipcMain.on('open-savedState',async (event,key,tabId,datas)=>{
  let list = []
  const cont = tabId !== 0 && (sharedState[tabId] || webContents.fromTabID(tabId))
  const host = cont ? event.sender : event.sender.hostWebContents

  const win = BrowserWindow.fromWebContents(host)
  console.log(52,datas,52)
  ipcMain.once('get-private-reply',(e,privateMode)=>{
    if(typeof datas == "string"){
      BrowserWindowPlus.load({id:win.id,sameSize:true,tabParam:JSON.stringify({urls:[{tabKey:datas}],type: 'new-win'})})
    }
    else{
      if(!Array.isArray(datas)) datas = [datas]
      for(let newWin of datas){
        BrowserWindowPlus.load({id:win.id, x:newWin.x, y:newWin.y, width:newWin.width, height:newWin.height,
          maximize: newWin.maximize, tabParam:JSON.stringify(newWin)})
      }
    }
  })
  win.webContents.send('get-private', (cont || event.sender).getId())


  console.log(list)
  event.sender.send(`open-savedState-reply_${key}`,key)
})

ipcMain.on('delete-savedState',(event,key,dbKey)=>{
  let opt = [{_id: dbKey}]
  if(typeof dbKey != "string"){
    opt = [dbKey, { multi: true }]
  }
  savedState.remove(...opt).then(ret=>{
    event.sender.send(`delete-savedState-reply_${key}`,key)
  })
})


ipcMain.on('rename-savedState',(event,key,dbKey,newName)=>{
  console.log(99,dbKey,newName)
  savedState.update({_id: dbKey }, { $set: {...newName,updated_at: Date.now()}}).then(ret2=>{
    event.sender.send(`rename-savedState-reply_${key}`,key)
  })
})


async function recurDelete(keys,list,isNote){
  const db = isNote ? note : favorite
  const ret = await db.find({key:{$in: keys}})
  const nextKeys = Array.prototype.concat.apply([],ret.map(ret=>ret.children)).filter(ret=>ret)
  list.splice(list.length,0,...nextKeys)
  if(nextKeys && nextKeys.length > 0) {
    return (await recurDelete(nextKeys, list,isNote))
  }
}

ipcMain.on('delete-favorite',(event,key,dbKeys,parentKeys,isNote)=>{
  let deleteList = dbKeys
  const db = isNote ? note : favorite
  recurDelete(dbKeys,deleteList,isNote).then(ret=>{
    deleteList = [...new Set(deleteList)]
    console.log('del',deleteList)
    db.remove({key: {$in : deleteList}}, { multi: true }).then(ret2=>{
      Promise.all(parentKeys.map((parentKey,i)=>{
        const dbKey = dbKeys[i]
        db.update({ key: parentKey }, { $pull: { children: dbKey }, $set:{updated_at: Date.now()} })
      })).then(ret3=>{
        event.sender.send(`delete-favorite-reply_${key}`,key)
      })
    })
  })
})

ipcMain.on('move-favorite',async (event,key,args,isNote)=>{
  console.log(99,args)
  const db = isNote ? note : favorite
  if(!args[0][3]){
    for(let arg of args){
      const [dbKey,oldDirectory,newDirectory,dropKey] = arg
      await db.update({ key: oldDirectory }, { $pull: { children: dbKey }, $set:{updated_at: Date.now()}})
      await db.update({ key: newDirectory }, { $push: { children: dbKey }, $set:{updated_at: Date.now()}})
    }
  }
  else{
    for(let arg of args.reverse()){
      const [dbKey,oldDirectory,newDirectory,dropKey] = arg
      await db.update({ key: oldDirectory }, { $pull: { children: dbKey }, $set:{updated_at: Date.now()}})
      const ret2 = await db.findOne({key: newDirectory})
      const children = ret2.children
      const ind = children.findIndex(x=>x == dropKey)
      children.splice(ind+1,0,dbKey)
      console.log(88,children)
      await db.update({ key: newDirectory }, { $set: {children, updated_at: Date.now()}})
    }
  }
  event.sender.send(`move-favorite-reply_${key}`,key)
})

const resourcePath = path.join(app.getPath('userData'),'resource')

ipcMain.on('get-resource-path',e=>{
  console.log(77,resourcePath)
  e.sender.send('get-resource-path-reply',resourcePath)
})


ipcMain.on('force-click',(event,{x,y})=> {
  event.sender.sendInputEvent({ type: 'mouseDown', x, y, button: 'left',clickCount: 1});
  event.sender.sendInputEvent({ type: 'mouseUp', x, y, button: 'left',clickCount: 1});
})

ipcMain.on('force-mouse-up',(event,{x,y})=> {
  event.sender.sendInputEvent({ type: 'mouseUp', x, y, button: 'left',clickCount: 1});

})

ipcMain.on('toggle-fullscreen',(event,cancel)=> {
  const win = BrowserWindow.fromWebContents(event.sender.hostWebContents || event.sender)
  const isFullScreen = win.isFullScreen()
  if(cancel && !isFullScreen) return
  win.webContents.send('switch-fullscreen',!isFullScreen)
  win.setFullScreenable(true)
  const menubar = win.isMenuBarVisible()
  win.setFullScreen(!isFullScreen)
  win.setMenuBarVisibility(menubar)
  win.setFullScreenable(false)
})


ipcMain.on('toggle-fullscreen-sync',(event,val)=> {
  const win = BrowserWindow.fromWebContents(event.sender.hostWebContents || event.sender)
  const isFullScreen = win.isFullScreen()
  if(val === 1 && !isFullScreen){
    event.returnValue = isFullScreen
    return
  }

  win.webContents.send('switch-fullscreen',!isFullScreen)
  win.setFullScreenable(true)
  const menubar = win.isMenuBarVisible()
  win.setFullScreen(!isFullScreen)
  win.setMenuBarVisibility(menubar)
  win.setFullScreenable(false)
  event.returnValue = !isFullScreen
})

function getYoutubeFileSize(url){
  const u = URL.parse(url)
  const options = {method: 'GET', hostname: u.hostname, port: 443, path: `${u.pathname}${u.search}`,
    headers: { 'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7',
      'Accept-Language': 'en-us,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'User-Agent': process.userAgent }};
  return new Promise(r=>{
    let resolved
    setTimeout(_=>{
      resolved = true
      r()
    },5000)
    const req = https.request(options, function(res) {
        if(!resolved){
          resolved = true
          console.log(888,res.headers)
          r(res.headers['content-length'] ? parseInt(res.headers['content-length']) : void 0)
        }
        res.destroy()
      }
    )
    req.end()
  })
}

const LRUCache = require('lru-cache')
const videoUrlsCache = new LRUCache(1000)
ipcMain.on('video-infos',(event,{url})=>{
  console.log(2222,url)
  const cache = videoUrlsCache.get(url)
  if(cache){
    event.sender.send(`video-infos-reply_${url}`,{cache:true,...cache})
    return
  }
  youtubedl.getInfo(url,void 0,{maxBuffer: 7000 * 1024}, async function(err, info) {
    if (err){
      console.log(err)
      videoUrlsCache.set(url,{error:err})
      event.sender.send(`video-infos-reply_${url}`,{error:err})
      return
    }
    // console.log(info)
    if(!info){
      if(url.includes("youtube.com/")){
        ytdl.getInfo(url, (err, info)=> {
          if (err){
            videoUrlsCache.set(url,{error:err})
            event.sender.send(`video-infos-reply_${url}`,{error:'error2'})
          }
          else{
            const title = info.title
            const formats = info.formats
            videoUrlsCache.set(url,{title,formats})
            event.sender.send(`video-infos-reply_${url}`,{title,formats})
          }
        })
      }
      else{
        videoUrlsCache.set(url,{error:'error'})
        event.sender.send(`video-infos-reply_${url}`,{error:'error3'})
      }
    }
    else{
      const title = info.title
      if(Array.isArray(info)){
        for(let i of info){
          const title = i.title
          videoUrlsCache.set(url, { title, formats: i.formats });
          event.sender.send(`video-infos-reply_${url}`, { title, formats: i.formats });
        }
      }
      else{
        if(url.includes("youtube.com/")){
          for(let f of info.formats){
            if(f.filesize) continue
            f.filesize = await getYoutubeFileSize(f.url)
          }
        }
        videoUrlsCache.set(url, { title, formats: info.formats});
        event.sender.send(`video-infos-reply_${url}`, { title, formats: info.formats });
      }
    }
  });
})


ipcMain.on('get-video-urls',(event,key,url)=>{
  youtubedl.getInfo(url,void 0,{maxBuffer: 7000 * 1024}, function(err, info) {
    console.log(err, info)
    if (err){
      event.sender.send(`get-video-urls-reply_${key}`,null)
      return
    }
    event.sender.send(`get-video-urls-reply_${key}`,{url: info.url, filename: info.filename})
  })
})

ipcMain.on('open-page',async (event,url)=>{
  const cont = await getFocusedWebContents()
  if(cont) cont.hostWebContents.send('new-tab', cont.getId(), url)
})

ipcMain.on('search-page',async (event,text)=>{
  const cont = await getFocusedWebContents()
  if(cont) cont.hostWebContents.send('search-text', cont.getId(), text)
})

if(isWin){
  ipcMain.on('need-meiryo',e=>{
    e.sender.send('need-meiryo-reply',meiryo)
  })
}

ipcMain.on("change-title",(e,title)=>{
  const bw = BrowserWindow.fromWebContents(e.sender.webContents)
  if(title){
    bw.setTitle(`${title} - Sushi Browser`)
  }
  else{
    const cont = bw.webContents
    const key = uuid.v4()
    return new Promise((resolve,reject)=>{
      ipcMain.once(`get-focused-webContent-reply_${key}`,(e,tabId)=>{
        const focusedCont = (sharedState[tabId] || webContents.fromTabID(tabId))
        if(focusedCont){
          if(!bw.isDestroyed()) bw.setTitle(`${focusedCont.getTitle()} - Sushi Browser`)
        }
      })
      cont.send('get-focused-webContent',key)
    })
    bw.setTitle(`${title} - Sushi Browser`)
  }
})

let startSender
ipcMain.on('select-target',(e,val,selector)=>{
  const set = new Set()
  for(let win of BrowserWindow.getAllWindows()) {
    if(win.getTitle().includes('Sushi Browser')){
      set.add(win.webContents)
    }
  }

  const macro = val ? readTargetSelector() : readTargetSelectorOff()
  for(let cont of webContents.getAllWebContents()){
    if(!cont.isDestroyed() && !cont.isBackgroundPage() && set.has(cont.hostWebContents)){
      cont.executeScriptInTab('dckpbojndfoinamcdamhkjhnjnmjkfjd',macro, {},()=>{})
    }
  }
  if(val){
    startSender = e.sender
  }
  else{
    startSender.send('select-target-reply',selector)
  }
})



let handleAddOp,handleReplyDialog,isRecording
ipcMain.on('record-op',(e,val)=>{
  isRecording = val
  if(val){
    handleAddOp = (e2,op)=>{
      e.sender.send('add-op',op)
    }
    ipcMain.on('add-op',handleAddOp)

    handleReplyDialog = (e2,{key,title,message,result,tabId,url,now})=>{
      const op =  {key, name: 'dialog', value:result ? 'ok' : 'cancel', url, tabId, now}
      e.sender.send('add-op',op)
    }
    ipcMain.on('reply-dialog',handleReplyDialog)
  }
  else{
    ipcMain.removeListener('add-op',handleAddOp)
    ipcMain.removeListener('reply-dialog',handleReplyDialog)
  }

  const set = new Set()
  for(let win of BrowserWindow.getAllWindows()) {
    if(win.getTitle().includes('Sushi Browser')){
      set.add(win.webContents)
      win.webContents.send('record-op',val)
    }
  }

  const macro = val ? readMacro() : readMacroOff()
  for(let cont of webContents.getAllWebContents()){
    if(!cont.isDestroyed() && !cont.isBackgroundPage() && set.has(cont.hostWebContents)){
      cont.executeScriptInTab('dckpbojndfoinamcdamhkjhnjnmjkfjd',macro, {},()=>{})
    }
  }

})

const extInfos = require('./extensionInfos')
ipcMain.on('get-main-state',(e,key,names)=>{
  const ret = {}
  names.forEach(name=>{
    if(name == "ALL_KEYS"){
      for(let [key,val] of Object.entries(mainState)){
        if(key.startsWith("key") || key.endsWith("Video")){
          ret[key] = val
        }
      }
    }
    else if(name == "isRecording"){
      ret[name] = isRecording ? readMacro() : void 0
    }
    else if(name == "alwaysOpenLinkNewTab"){
      ret[name] = mainState.lockTabs[e.sender.isDestroyed() ? null : e.sender.getId()] ? 'speLinkAllLinks' : mainState[name]
    }
    else if(name == "isVolumeControl"){
      ret[name] = mainState.isVolumeControl[e.sender.isDestroyed() ? null : e.sender.getId()]
    }
    else if(name == "extensions"){
      const extensions = {}
      const disableExtensions = mainState.disableExtensions
      for (let [k,v] of Object.entries(extInfos)) {
        if(!('url' in v) || v.name == "brave") continue
        const orgId = v.base_path.split(/[\/\\]/).slice(-2,-1)[0]
        extensions[k] = {name:v.name,url:v.url,basePath:v.base_path,version: (v.manifest.version || v.version),theme:v.theme,
          optionPage: v.manifest.options_page || (v.manifest.options_ui && v.manifest.options_ui.page),
          background: v.manifest.background && v.manifest.background.page,icons:v.manifest.icons,
          description: (v.manifest.description || v.description),enabled: !disableExtensions.includes(orgId) }
      }
      ret[name] = extensions
    }
    else if(name == 'themeInfo'){
      const theme = extInfos[mainState.enableTheme] && extInfos[mainState.enableTheme].theme
      if(theme){
        if(theme.images && !theme.datas){
          theme.datas = {}
          for(let name of ['theme_ntp_background','theme_ntp_attribution']){
            if(!theme.images[name]) continue
            const file = path.join(theme.base_path,theme.images[name])
            if(file && fs.existsSync(file)){
              theme.datas[name] = nativeImage.createFromPath(file).toDataURL()
            }
          }
        }
        for(let page of ['themeTopPage','themeBookmark','themeHistory','themeDownloader','themeExplorer','themeBookmarkSidebar','themeHistorySidebar','themeSessionManagerSidebar','themeTabTrashSidebar','themeTabHistorySidebar','themeExplorerSidebar']){
          theme[page] = mainState[page]
        }
      }
      ret[name] = theme
    }
    else if(name == 'fullScreen'){
      ret[name] = mainState.fullScreenIds[e.sender.getId()]
    }
    else{
      ret[name] = mainState[name]
    }
  })

  e.sender.send(`get-main-state-reply_${key}`,ret)
})


ipcMain.on('save-state',async (e,{tableName,key,val})=>{
  if(tableName == 'state'){
    if(key == 'disableExtensions'){
      console.log(val,mainState[key],Object.values(extInfos))
      for(let orgId of diffArray(val,mainState[key])){
        console.log(orgId,Object.values(extInfos))
        const ext = Object.values(extInfos).find(x=>x.base_path && x.base_path.includes(orgId))
        if(ext){
          if(orgId == "jpkfjicglakibpenojifdiepckckakgk"){
            for(let cont of webContents.getAllWebContents()){
              if(!cont.isDestroyed() && cont.isBackgroundPage()) cont.send('disable-mouse-gesture',true)
            }
          }
          else{
            session.defaultSession.extensions.disable(ext.id)
          }
        }
      }
      for(let orgId of diffArray(mainState[key],val)){
        const ext = Object.values(extInfos).find(x=>x.base_path && x.base_path.includes(orgId))
        if(ext) {
          if (orgId == "jpkfjicglakibpenojifdiepckckakgk") {
            for(let cont of webContents.getAllWebContents()){
              if(!cont.isDestroyed() && cont.isBackgroundPage()) cont.send('disable-mouse-gesture',false)
            }
          }
          else {
            session.defaultSession.extensions.enable(ext.id)
          }
        }
      }
    }
    else if(key == 'httpsEverywhereEnable'){
      require('../brave/httpsEverywhere')()
    }
    else if(key == 'trackingProtectionEnable'){
      require('../brave/trackingProtection')()
    }
    else if(key == 'noScript'){
      defaultConf.javascript[0].setting = val ? 'block' : 'allow'
      session.defaultSession.userPrefs.setDictionaryPref('content_settings', defaultConf)
    }
    else if(key == 'blockCanvasFingerprinting'){
      defaultConf.canvasFingerprinting[0].setting = val ? 'block' : 'allow'
      session.defaultSession.userPrefs.setDictionaryPref('content_settings', defaultConf)
    }
    else if(key == 'downloadPath'){
      if(fs.existsSync(val)) {
        app.setPath('downloads',val)
      }
      else{
        return
      }
    }
    else if(key == 'enableTheme'){
      const theme = extInfos[val] && extInfos[val].theme
      if(theme && theme.images){
        theme.sizes = {}
        for(let name of ['theme_toolbar','theme_tab_background']){
          if(!theme.images[name]) continue
          const file = path.join(theme.base_path,theme.images[name])
          if(file && fs.existsSync(file)){
            theme.sizes[name] = nativeImage.createFromPath(file).getSize()
          }
        }
      }
      for(let win of BrowserWindow.getAllWindows()) {
        if(win.getTitle().includes('Sushi Browser')){
          win.webContents.send('update-theme',theme)
        }
      }
    }
    mainState[key] = val
    state.update({ key: 1 }, { $set: {[key]: mainState[key]} }).then(_=>_)
  }
  else{
    if(tableName　== "searchEngine"){
      const stateName = "searchProviders"
      mainState[stateName] = {}
      for(let ele of val){
        mainState[stateName][ele.name] = ele
      }
    }
    else{
      mainState[tableName] = val
    }

    const table = db[tableName]
    await table.remove({},{ multi: true })
    table.insert(val).then(_=>_)
  }

  if(tableName == "searchEngine" || key == "searchEngine"){
    e.sender.hostWebContents.send("update-search-engine")
  }
  else{
    if(e.sender.hostWebContents) e.sender.hostWebContents.send("update-mainstate",key,val)
  }
})

ipcMain.on('menu-or-key-events',(e,name,...args)=>{
  getFocusedWebContents().then(cont=>{
    if(name == 'toggleDeveloperTools'){
      cont && cont.openDevTools()
      return
    }
    cont && cont.hostWebContents.send('menu-or-key-events',name,cont.getId(),...args)
  })
})


if(isWin) {
  ipcMain.on('get-win-hwnd', async (e, key) => {
    const winctl = require('winctl')
    e.sender.send(`get-win-hwnd-reply_${key}`, winctl.GetActiveWindow().getHwnd())
  })


  ipcMain.on('set-active', async (e, key, hwnd) => {
    const winctl = require('winctl')
    const aWin = winctl.GetActiveWindow()
    const aWinHwnd = aWin.getHwnd()
    if(bindMap[key] === aWinHwnd){
      setTimeout(_=>{
        console.log('set-active')
        aWin.setWindowPos(winctl.HWND.BOTTOM,0,0,0,0,19+1024) // 19 = winctl.SWP.NOMOVE|winctl.SWP.NOSIZE|winctl.SWP.NOACTIVATE
      },100)
    }
    // const win = (await winctl.FindWindows(win => (hwnd || hwndMap[key]) == win.getHwnd()))[0]
    // setTimeout(_=>{
    //   console.log('set-active')
    //   win.setWindowPos(winctl.HWND.TOPMOST,0,0,0,0,19+1024)
    //   win.setWindowPos(winctl.HWND.NOTOPMOST,0,0,0,0,19+1024)
    // },100)
  })

}

const restoredMap = {}
const hwndMap = {}
const bindMap = {}
ipcMain.on('set-pos-window',async (e,{id,hwnd,key,x,y,width,height,top,active,tabId,checkClose,restore})=>{
  const FRAME = parseInt(mainState.bindMarginFrame)
  const TITLE_BAR = parseInt(mainState.bindMarginTitle)
  if(isWin){
    let org
    if(hwnd){
      hwndMap[key] = hwnd
    }
    const winctl = require('winctl')
    const win = id ? (await winctl.FindWindows(win => id == win.getHwnd()))[0] : winctl.GetActiveWindow()
    if(!id){
      const cn = win.getClassName()
      if(cn == 'Shell_TrayWnd' || cn == 'TaskManagerWindow' || cn == 'Progman' || cn == 'MultitaskingViewFrame' || win.getTitle().includes(' - Sushi Browser')){
        e.sender.send(`set-pos-window-reply_${key}`,(void 0))
        return
      }
      win.setWindowLongPtr()
      console.log('setWindowPos1')
      win.setWindowPos(0,0,0,0,0,39+1024)
      bindMap[key] = win.getHwnd()
    }

    if(restoredMap[key] !== (void 0)){
      clearTimeout(restoredMap[key])
      win.setWindowLongPtr()
      console.log('setWindowPos2')
      win.setWindowPos(0,0,0,0,0,39+1024);
      delete restoredMap[key]
    }

    if(restore){
      // console.log(32322,styleMap[key])
      win.setWindowLongPtrRestore()
      console.log('setWindowPos3')
      win.setWindowPos(0,0,0,0,0,39+1024);
      console.log('setWindowPos51',win.getTitle())
      const tid = setTimeout(_=>{
        win.setWindowPos(winctl.HWND.NOTOPMOST,x||0,y||0,width||0,height||0,(x !== (void 0) ? 16 : 19)+1024) // 19 = winctl.SWP.NOMOVE|winctl.SWP.NOSIZE|winctl.SWP.NOACTIVATE
        // if(winctl.GetActiveWindow().getHwnd() !== id){
        win.setWindowPos(winctl.HWND.BOTTOM,0,0,0,0,19+1024) // 19 = winctl.SWP.NOMOVE|winctl.SWP.NOSIZE|winctl.SWP.NOACTIVATE
        // }
      },100)
      restoredMap[key] = tid
      return
    }

    if(checkClose || !win){
      e.sender.send(`set-pos-window-reply_${key}`,checkClose ? {needClose:!win} : (void 0))
      if(!win) return
      const title = win.getTitle()
      for (let wc of getBindPage(tabId)) {
        wc.send('update-bind-title', title)
      }
      if(checkClose) return
    }

    if(top){
      if(x){
        x = scaling(x + FRAME / 2)
        y = scaling(y + TITLE_BAR + FRAME / 2)
        width = scaling(Math.max(0,width - FRAME))
        height = scaling(Math.max(0,height - (TITLE_BAR + FRAME)))
      }
      // console.log(top == 'above' ? winctl.HWND.TOPMOST : winctl.HWND.BOTTOM,x||0,y||0,width||0,height||0,(x !== (void 0) ? 16 : 19)+1024)

      if(top == 'above'){
        console.log('setWindowPos4',win.getTitle())
        win.setWindowPos(winctl.HWND.TOPMOST,x||0,y||0,width||0,height||0,(x !== (void 0) ? 16 : 19)+1024) // 19 = winctl.SWP.NOMOVE|winctl.SWP.NOSIZE|winctl.SWP.NOACTIVATE
      }
      else{
        console.log('setWindowPos5',win.getTitle()) //hatudouriyuu
        win.setWindowPos(winctl.HWND.NOTOPMOST,x||0,y||0,width||0,height||0,(x !== (void 0) ? 16 : 19)+1024) // 19 = winctl.SWP.NOMOVE|winctl.SWP.NOSIZE|winctl.SWP.NOACTIVATE

        // if(winctl.GetActiveWindow().getHwnd() !== id) {
        //   const eWin = (await winctl.FindWindows(win => (hwnd || hwndMap[key]) == win.getHwnd()))[0]
        //   eWin.setWindowPos(winctl.HWND.TOPMOST, 0, 0, 0, 0, 19 + 1024)
        //   eWin.setWindowPos(winctl.HWND.NOTOPMOST, 0, 0, 0, 0, 19 + 1024)
        // }

        if(winctl.GetActiveWindow().getHwnd() !== id){
          win.setWindowPos(winctl.HWND.BOTTOM,0,0,0,0,19+1024) // 19 = winctl.SWP.NOMOVE|winctl.SWP.NOSIZE|winctl.SWP.NOACTIVATE
        }
      }

    }
    else if(x + y + width + height !== 0){
      x = scaling(x + FRAME / 2)
      y = scaling(y + TITLE_BAR + FRAME / 2)
      width = scaling(Math.max(0,width - FRAME))
      height = scaling(Math.max(0,height - (TITLE_BAR + FRAME)))
      win.move(x,y,width,height)
    }
    if(active) {
      const win2 = winctl.GetActiveWindow()
      console.log('setWindowPos6',win.getTitle(),win2.getTitle())
      win.setWindowPos(winctl.HWND.TOPMOST,0,0,0,0,19+1024)
      win.setWindowPos(winctl.HWND.NOTOPMOST,0,0,0,0,19+1024)
      win2.setWindowPos(winctl.HWND.TOPMOST,0,0,0,0,19+1024)
      win2.setWindowPos(winctl.HWND.NOTOPMOST,0,0,0,0,19+1024)
    }
    if(key) e.sender.send(`set-pos-window-reply_${key}`,[win.getHwnd(),win.getTitle()])
  }
  else if(isLinux){
    const i = id ? 'i' : ''
    id = id || ':ACTIVE:'

    if(restoredMap[key]){
      await exec(`wmctrl -v${i} -r ${id} -b add,above 2>&1`)
      delete restoredMap[key]
    }

    if(restore){
      restoredMap[key] = 1
    }
    if(checkClose){
      // const ret = (await exec(`wmctrl -l | grep ${id}`)).stdout
      // console.log(ret)
      // e.sender.send(`set-pos-window-reply_${key}`,{needClose:!ret})
      // if(ret){
      //   const title = ret.match(/[^ ]+ +[^ ]+ +[^ ]+ (.+)/)[1]
      //   for (let wc of getBindPage(tabId)) {
      //     wc.send('update-bind-title', title)
      //   }
      // }
      return
    }

    const commands = []
    if(id == ':ACTIVE:'){
      const ret = (await exec(`wmctrl -v -a :ACTIVE: 2>&1`)).stdout
      const mat = ret.match(/: *(0x[0-9a-f]+)/)
      const level = (await exec(`wmctrl -l | grep "${mat[1]}" 2>&1`)).stdout.match(/[^ ]+ +([^ ]+)/)[1]
      if(level == "-1"){
        e.sender.send(`set-pos-window-reply_${key}`)
        return
      }
      commands.push(`wmctrl -v${i} -r ${id} -b remove,maximized_vert,maximized_horz 2>&1`)
    }
    if(top){
      commands.push(`wmctrl -v${i} -r ${id} -b ${top == 'above' ? 'add,above' : 'remove,above'} 2>&1`)
    }
    if(x !== (void 0) && x + y + width + height !== 0){
      x = scaling(x + FRAME / 2)
      y = scaling(y + TITLE_BAR + FRAME / 2)
      width = scaling(Math.max(0,width - FRAME))
      height = scaling(Math.max(0,height - (TITLE_BAR + FRAME)))
      commands.push(`wmctrl -v${i} -r ${id} -e 0,${x},${y},${width},${height} 2>&1`)
    }

    let reply
    for(let command of commands){
      const ret = await exec(command)
      const id = ret.stdout.match(/: *(0x[0-9a-f]+)/)
      reply = id[1]
    }
    if(active) {
      const ret = await exec(`wmctrl -v -a :ACTIVE: 2>&1`)
      const mat = ret.stdout.match(/: *(0x[0-9a-f]+)/)
      await exec(`wmctrl -v${i} -a ${id} 2>&1`)
      await exec(`wmctrl -v${i} -a ${mat[1]} 2>&1`)
    }
    if(key){
      const name = (await exec(`wmctrl -l | grep "${reply}" 2>&1`)).stdout.match(/[^ ]+ +[^ ]+ +[^ ]+ (.+)/)[1]
      e.sender.send(`set-pos-window-reply_${key}`,[reply,name])
    }
  }
})

let timer,timers={}
ipcMain.on('change-tab-infos',(e,changeTabInfos)=> {
  const f = function (cont,c) {
    if (c.index !== (void 0)) {
      // if(timers[c.tabId]) clearTimeout(timers[c.tabId])
      // timers[c.tabId] = setTimeout(()=>{
      console.log('change-tab-infos', c)
      // cont.setTabIndex(c.index)
      ipcMain.emit('update-tab-index-org', null, c.tabId, c.index)
      // delete timers[c.tabId]
      // }, 10)
    }
    if (c.active) {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        console.log('change-tab-infos', c)
        if (!cont.isDestroyed()) cont.setActive(c.active)
        timer = void 0
      }, 10)
    }
  };
  for(let c of changeTabInfos){
    let cont = sharedState[c.tabId] || webContents.fromTabID(c.tabId)
    if(cont) {
      f(cont,c)
    }
    else{
      let retry = 0
      const id = setInterval(_=>{
        if(retry++ > 100){
          clearInterval(id)
          return
        }
        cont = sharedState[c.tabId] || webContents.fromTabID(c.tabId)
        if(cont) f(cont,c)
      },10)
    }
  }
})

// ipcMain.on('need-get-inner-text',(e,key)=>{
// if(mainState.historyFull){
//   ipcMain.once('get-inner-text',(e,location,title,text)=>{
//     historyFull.update({location},{location,title,text,updated_at: Date.now()}, { upsert: true }).then(_=>_)
//   })
// }
// e.sender.send(`need-get-inner-text-reply_${key}`,mainState.historyFull)
// })

ipcMain.on('play-external',(e,url)=> open(mainState.sendToVideo,url))

ipcMain.on('download-m3u8',(e,url,fname,tabId,userAgent,referer,needInput)=>{
  const youtubeDl = path.join(__dirname,'../node_modules/youtube-dl/bin/youtube-dl').replace(/app.asar([\/\\])/,'app.asar.unpacked$1')
  const ffmpeg = path.join(__dirname, `../resource/bin/ffmpeg/${process.platform === 'win32' ? 'win' : process.platform === 'darwin' ? 'mac' : 'linux'}/ffmpeg`).replace(/app.asar([\/\\])/,'app.asar.unpacked$1')
  let downloadPath = path.join(app.getPath('downloads'),`${fname.split(".").slice(0,-1).join(".")}.%(ext)s`)

  const dl = function () {
    console.log(`${shellEscape(youtubeDl)} --hls-prefer-native --ffmpeg-location=${shellEscape(ffmpeg)} -o ${shellEscape(downloadPath)} ${shellEscape(url)}`)
    ipcMain.once('start-pty-reply', (e, key) => {
      ipcMain.emit(`send-pty_${key}`, null, `${isWin ? '& ' : ''}${shellEscape(youtubeDl)} --user-agent ${shellEscape(userAgent)} --referer ${shellEscape(referer)} --hls-prefer-native --ffmpeg-location=${shellEscape(ffmpeg)} -o ${shellEscape(downloadPath)} ${shellEscape(url)}\n`)
    })
    e.sender.send('new-tab', tabId, 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/terminal.html')
  }

  if(needInput){
    dialog.showDialog(BrowserWindow.fromWebContents(e.sender),{defaultPath: downloadPath,type: 'select-saveas-file',includeAllFiles:true },filepaths=>{
      if (!filepaths || filepaths.length > 1) return
      downloadPath = filepaths[0]
      dl()
    })
  }
  else{
    dl()
  }
})

let numVpn = 1
ipcMain.on('vpn-event',async (e,key,address)=>{
  if(mainState.vpn || !address){
    const ret2 = await exec(`rasdial /disconnect`)
    console.log(ret2)
    mainState.vpn = (void 0)
    e.sender.send('vpn-event-reply')
  }

  if(!address || !address.match(/^[a-zA-Z\d.\-_:]+$/)) return
  const name = address.split(".")[0]
  try{
    numVpn = (numVpn + 1) % 2
    const ret = await exec(`powershell "Set-VpnConnection -Name sushib-${numVpn} -ServerAddress ${address} -TunnelType Sstp -AuthenticationMethod MsChapv2"`)
    console.log(ret)
  }catch(e2){
    console.log(e2)
    try{
      const ret = await exec(`powershell "Add-VpnConnection -Name sushib-${numVpn} -ServerAddress ${address} -TunnelType Sstp -AuthenticationMethod MsChapv2"`)
      console.log(ret)
    }catch(e3){
      console.log(e3)
    }
  }
  try{
    const ret2 = await exec(`rasdial sushib-${numVpn} vpn vpn`)
    e.sender.send('show-notification',{key,text:'VPN connection SUCCESS', buttons:['OK']})
    console.log(ret2)
    mainState.vpn = name
  }catch(e2){
    e.sender.send('show-notification',{key,text:'VPN connection FAILED', buttons:['OK']})
  }
  e.sender.send('vpn-event-reply')

})

ipcMain.on('audio-extract',e=>{
  const focusedWindow = BrowserWindow.getFocusedWindow()
  dialog.showDialog(focusedWindow,{
    type: 'select-open-multi-file',
    name: 'Select Video Files',
    extensions: ['3gp','3gpp','3gpp2','asf','avi','dv','flv','m2t','m4v','mkv','mov','mp4','mpeg','mpg','mts','oggtheora','ogv','rm','ts','vob','webm','wmv']
  },async files=>{
    if (files && files.length > 0) {
      for(let fileList of eachSlice(files,6)){
        const promises = []
        for(let file of fileList){
          const key = Math.random().toString()
          promises.push(new Promise((resolve)=>{
            new FfmpegWrapper(file).exe(resolve)
          }))
        }
        await Promise.all(promises)
      }
    }
  })
})

ipcMain.on('get-country-names',e=>{
  const locale = app.getLocale()
  let i = 0
  let base
  for(let line of fs.readFileSync(path.join(__dirname,'../resource/country.txt')).toString().split("\n")){
    if(i++===0){
      base = line.split("\t").slice(1)
    }
    if(line.startsWith(locale)){
      const ret = {}
      line.split("\t").slice(1).forEach((x,i)=>{
        ret[base[i]] = x
      })
      console.log(ret)
      e.sender.send('get-country-names-reply',ret)
      break
    }
  }
})

let prevCount = {}
ipcMain.on('get-on-dom-ready',(e,tabId,tabKey,rSession,closingPos)=>{
  const cont = (sharedState[tabId] || webContents.fromTabID(tabId))
  if(!cont || cont.isDestroyed()){
    e.sender.send(`get-on-dom-ready-reply_${tabId}`,null)
    return
  }
  saveTabState(cont, rSession, tabKey, void 0, closingPos)
  if(mainState.flash) cont.authorizePlugin(mainState.flash)

  let currentEntryIndex,entryCount = cont.getEntryCount()
  if(rSession){
    if(entryCount > (prevCount[tabKey] || 1)){
      currentEntryIndex = rSession.currentIndex + 1
      entryCount = rSession.currentIndex + 2
    }
    else{
      currentEntryIndex = rSession.currentIndex
      entryCount = rSession.urls.length
    }
  }
  else{
    currentEntryIndex = cont.getCurrentEntryIndex()
  }

  e.sender.send(`get-on-dom-ready-reply_${tabId}`,{currentEntryIndex,entryCount,title: cont.getTitle(),rSession})
})

ipcMain.on('tab-close-handler',(e,tabId,tabKey,rSession,closingPos)=>{
  const cont = (sharedState[tabId] || webContents.fromTabID(tabId))
  if(!cont || cont.isDestroyed()) return
  saveTabState(cont, rSession, tabKey, void 0, closingPos, 1)
})

ipcMain.on('get-update-title',(e,tabId,tabKey,rSession,closingPos)=>{
  const cont = (sharedState[tabId] || webContents.fromTabID(tabId))
  if(!cont || cont.isDestroyed()){
    e.sender.send(`get-update-title-reply_${tabId}`,null)
    return
  }
  saveTabState(cont, rSession, tabKey, void 0, closingPos)

  let currentEntryIndex,entryCount = cont.getEntryCount()
  if(rSession){
    if(entryCount > (prevCount[tabKey] || 1)){
      currentEntryIndex = rSession.currentIndex + 1
      entryCount = rSession.currentIndex + 2
    }
    else{
      currentEntryIndex = rSession.currentIndex
      entryCount = rSession.urls.length
    }
  }
  else{
    currentEntryIndex = cont.getCurrentEntryIndex()
  }

  const url = cont.getURL()
  const ret = cont ? {
    title: cont.getTitle(),
    currentEntryIndex,
    entryCount,
    url,
    rSession
  } : null

  e.sender.send(`get-update-title-reply_${tabId}`,ret)
  visit.insert({url,created_at:Date.now()})
})

ipcMain.on('get-did-finish-load',(e,tabId,tabKey,rSession)=>{
  const cont = (sharedState[tabId] || webContents.fromTabID(tabId))
  if(!cont || cont.isDestroyed()){
    e.sender.send(`get-did-finish-load-reply_${tabId}`,null)
    return
  }

  let currentEntryIndex,entryCount = cont.getEntryCount()
  if(rSession){
    if(entryCount > (prevCount[tabKey] || 1)){
      currentEntryIndex = rSession.currentIndex + 1
      entryCount = rSession.currentIndex + 2
      console.log(77,currentEntryIndex,entryCount)
    }
    else{
      currentEntryIndex = rSession.currentIndex
      entryCount = rSession.urls.length
      console.log(78,currentEntryIndex,entryCount)
    }
  }
  else{
    currentEntryIndex = cont.getCurrentEntryIndex()
  }

  const ret = cont ? {
    currentEntryIndex,
    entryCount,
    url: cont.getURL(),
    title: cont.getTitle()
  } : null

  e.sender.send(`get-did-finish-load-reply_${tabId}`,ret)
})

const destroyedMap = new Map()
function addDestroyedFunc(cont,tabId,sender,msg){
  if(destroyedMap.has(tabId)){
    const arr = destroyedMap.get(tabId)
    arr.push([sender,msg])
  }
  else{
    destroyedMap.set(tabId,[[sender,msg]])
    cont.once('destroyed',_=>{
      for(let [sender,msg] of destroyedMap.get(tabId)){
        sender.send(msg,'destroy')
      }
    })
  }
}

ipcMain.on('get-did-start-loading',(e,tabId)=>{
  const cont = (sharedState[tabId] || webContents.fromTabID(tabId))
  const msg = `get-did-start-loading-reply_${tabId}`
  if(!cont || cont.isDestroyed()){
    e.sender.send(msg)
    return
  }
  addDestroyedFunc(cont,tabId,e.sender,msg)
  cont.on('did-start-loading',e2=> {
    e.sender.send(msg,true)
  })
})

// ipcMain.on('get-did-stop-loading',(e,tabId)=>{
//   const cont = (sharedState[tabId] || webContents.fromTabID(tabId))
//   const msg = `get-did-stop-loading-reply_${tabId}`
//   if(!cont){
//     e.sender.send(msg)
//     return
//   }
//   addDestroyedFunc(cont,tabId,e.sender,msg)
//   cont.on('did-stop-loading',e2=> {
//     const ret = {
//       currentEntryIndex: cont.getCurrentEntryIndex(),
//       entryCount: cont.getEntryCount(),
//       url: cont.getURL()
//     }
//     e.sender.send(msg, ret)
//   })
// })


const detachTabs = []
ipcMain.on('detach-tab',(e,tabId)=>{
  const cont = webContents.fromTabID(tabId)
  detachTabs.push([e.sender,tabId,cont.getURL()])
  cont._detachGuest()
})

PubSub.subscribe("web-contents-created",(msg,[tabId,sender])=>{
  console.log("web-contents-created",tabId)
  const cont = (sharedState[tabId] || webContents.fromTabID(tabId))
  if(!cont) return
  console.log("web-contents-created",tabId,cont.guestInstanceId,cont.getURL())

  if(!sender.isDestroyed()) sender.send('web-contents-created',tabId)

  if(detachTabs.length){
    console.log(5483543,detachTabs)
    const ind = detachTabs.findIndex(t=>{
      return t[2] == cont.getURL()
    })
    if(ind !== -1){
      detachTabs[ind][0].send(`detach-tab_${detachTabs[ind][1]}`,tabId)
      detachTabs.splice(ind, 1)
      return
    }
  }

  cont.on('page-title-updated',e2=> {
    if(!sender.isDestroyed()) sender.send('page-title-updated',tabId)
  })

})

ipcMain.on('get-navbar-menu-order',e=>{
  e.returnValue = mainState.navbarItems
})

function setTabState(cont,cb){
  const tabId = cont.getId()
  ipcMain.once(`get-tab-opener-reply_${tabId}`,(e,openerTabId)=>{
    const tabValue = cont.tabValue()
    cb({id:tabId, openerTabId, index:tabValue.index, windowId:tabValue.windowId,active:tabValue.active,pinned:tabValue.pinned})
  })
  ipcMain.emit('get-tab-opener',null,tabId)
}

function saveTabState(cont, rSession, tabKey, noUpdate, closingPos, close) {
  closingPos = closingPos || {}

  let histNum = cont.getEntryCount(),
    currentIndex = cont.getCurrentEntryIndex(),
    historyList = []
  const urls = [], titles = [], positions = []
  if (!rSession) {
    for (let i = 0; i < histNum; i++) {
      const url = cont.getURLAtIndex(i)
      const title = cont.getTitleAtIndex(i)
      const pos = closingPos[url] || ""
      urls.push(url)
      titles.push(title)
      positions.push(pos)
      historyList.push([url, title, pos])
    }
    if (currentIndex > -1 && !noUpdate) {
      setTabState(cont,vals => tabState.update({tabKey}, {...vals ,tabKey,titles: titles.join("\t"),urls: urls.join("\t"),positions:JSON.stringify(positions),currentIndex, close, updated_at: Date.now() }, {upsert: true}))
    }
  }
  else {
    console.log(998,histNum > (prevCount[tabKey] || 1),currentIndex == histNum - 1,rSession.urls)
    if (histNum > (prevCount[tabKey] || 1) && currentIndex == histNum - 1) {
      const url = cont.getURLAtIndex(currentIndex)
      const title = cont.getTitleAtIndex(currentIndex)
      const pos = closingPos[url] || ""
      rSession.urls = rSession.urls.slice(0, rSession.currentIndex + 1)
      rSession.titles = rSession.titles.slice(0, rSession.currentIndex + 1)
      rSession.positions = rSession.positions.slice(0, rSession.currentIndex + 1)
      if(rSession.urls[rSession.urls.length-1] != url){
        rSession.urls.push(url)
        rSession.titles.push(title)
        rSession.positions.push(pos)
      }
      rSession.currentIndex = rSession.urls.length - 1
      if (currentIndex > -1 && !noUpdate) {
        setTabState(cont,vals => tabState.update({tabKey}, {$set: {...vals , titles: rSession.titles.join("\t"),urls: rSession.urls.join("\t"),positions:JSON.stringify(positions),currentIndex: rSession.currentIndex,updated_at: Date.now() } }))
      }
    }
    if (currentIndex > -1 && !noUpdate) {
      setTabState(cont,vals => tabState.update({tabKey}, {$set: {...vals ,currentIndex: rSession.currentIndex, updated_at: Date.now()}}))
    }
    historyList = rSession.urls.map((x, i) => [x, rSession.titles[i], rSession.positions[i]])
    currentIndex = rSession.currentIndex
  }
  if(!noUpdate) prevCount[tabKey] = histNum
  return {currentIndex, historyList}
}

ipcMain.on('get-cont-history',(e,tabId,tabKey,rSession)=>{
  const cont = (sharedState[tabId] || webContents.fromTabID(tabId))
  if(!cont || cont.isDestroyed()){
    e.sender.send(`get-cont-history-reply_${tabId}`)
    return
  }
  let {currentIndex, historyList} = saveTabState(cont, rSession, tabKey, true);
  e.sender.send(`get-cont-history-reply_${tabId}`,currentIndex,historyList,rSession,mainState.disableExtensions,mainState.adBlockEnable,mainState.pdfMode,mainState.navbarItems)
})
ipcMain.on('get-session-sequence',(e,isPrivate)=> {
  e.returnValue = seq(isPrivate)
})

ipcMain.on('menu-or-key-events-main',(e,msg,tabId)=>{
  e.sender.send('menu-or-key-events',msg,tabId)
})

ipcMain.on('show-notification-sort-menu',(e,key,tabId)=>{
  e.sender.send('show-notification',{key,text:'End sorting the menu?', buttons:['OK']})
  ipcMain.once(`reply-notification-${key}`,(e,ret)=>{
    e.sender.send(`show-notification-sort-menu-reply_${key}`)
  })
})

ipcMain.on('get-extension-info',(e,key)=>{
  e.sender.send(`get-extension-info-reply_${key}`,extInfos)
})

ipcMain.on('get-sync-main-states',(e,keys)=>{
  e.returnValue = keys.map(key=>{
    if(key == 'inputsVideo'){
      const ret = {}
      for(let [key,val] of Object.entries(mainState)){
        if(key.startsWith('keyVideo')){
          for(let v of val){
            if(!v) continue
            const e = toKeyEvent(v)
            const val2 = e.key ? {key: e.key} : {code: e.code}
            if(e.ctrlKey) val2.ctrlKey = true
            if(e.metaKey) val2.metaKey = true
            if(e.shiftKey) val2.shiftKey = true
            if(e.altKey) val2.altKey = true
            let key2 = key.slice(8)
            ret[JSON.stringify(val2)] = `${key2.charAt(0).toLowerCase()}${key2.slice(1)}`
          }
        }
        else if(key.endsWith('Video')){
          ret[key.slice(0,-5)] = val
        }
      }
      return ret
    }
    else if(key == 'themeInfo'){
      const theme = extInfos[mainState.enableTheme] && extInfos[mainState.enableTheme].theme
      if(!theme) return
      if(theme.images){
        if(!theme.sizes){
          theme.sizes = {}
          for(let name of ['theme_toolbar','theme_tab_background']){
            if(!theme.images[name]) continue
            const file = path.join(theme.base_path,theme.images[name])
            if(file && fs.existsSync(file)){
              theme.sizes[name] = nativeImage.createFromPath(file).getSize()
            }
          }
        }
        if(!theme.datas){
          theme.datas = {}
          for(let name of ['theme_ntp_background','theme_ntp_attribution']){
            if(!theme.images[name]) continue
            const file = path.join(theme.base_path,theme.images[name])
            if(file && fs.existsSync(file)){
              theme.datas[name] = nativeImage.createFromPath(file).toDataURL()
            }
          }
        }
      }
      return theme
    }
    else{
      return mainState[key]
    }
  })
})

ipcMain.on('get-sync-main-state',(e,key)=>{
  e.returnValue = mainState[key] || null
})

ipcMain.on('get-sync-rSession',(e,keys)=>{
  tabState.find({tabKey:{$in:keys}}).then(rec=>{
    e.returnValue = rec
  })
})

ipcMain.on('set-clipboard',(e,data)=>{
  clipboard.writeText(data.join(os.EOL))
})


ipcMain.on('download-start',(e,url)=>{
  try{
    e.sender.hostWebContents.downloadURL(url,true)
  }
  catch(e){
    getCurrentWindow().webContents.downloadURL(url,true)
  }
})

ipcMain.on('print-to-pdf',(e,key,tabId,savePath,options)=>{
  const cont = (sharedState[tabId] || webContents.fromTabID(tabId))
  if(!path.isAbsolute(savePath)){
    savePath = path.join(app.getPath('desktop'),savePath)
  }

  if(cont && !cont.isDestroyed()) cont.printToPDF(options, (error, data) => {
    fs.writeFile(savePath, data, (error) => {
      e.sender.send(`print-to-pdf-reply_${key}`)
    })
  })
})

ipcMain.on('open-update-cmd',e=>{
  shell.showItemInFolder(path.join(__dirname, '../../../update.cmd'))
})

ipcMain.on('screen-shot',(e,{full,type,rect,tabId,tabKey,quality=92,savePath,autoPlay})=>{
  const capture = (cb,image)=>{
    if(cb) cb()
    if(type == 'clipboard'){
      clipboard.writeImage(image)
    }
    else{
      const isJpeg = type == 'JPEG'
      let writePath
      if(savePath){
        if(path.isAbsolute(savePath)){
          writePath = savePath
        }
        else{
          writePath = path.join(app.getPath('desktop'),savePath)
        }
      }
      else{
        writePath = path.join(app.getPath('desktop'),`screenshot-${formatDate(new Date())}.${isJpeg ? 'jpg' : 'png'}`)
      }
      fs.writeFile(writePath,isJpeg ? image.toJPEG(quality) : image.toPNG(),_=>{
        if(autoPlay){
          e.sender.send(`screen-shot-reply_${tabId}`)
        }
        else{
          shell.showItemInFolder(writePath)
        }
      })
    }
  }

  if(full || (e.sender.hostWebContents && rect)){
    const cont = (sharedState[tabId] || webContents.fromTabID(tabId))
    if(cont && !cont.isDestroyed()){
      cont.executeScriptInTab('dckpbojndfoinamcdamhkjhnjnmjkfjd',
        `(function(){
          const d = document.body,dd = document.documentElement,
          width = Math.max(d.scrollWidth, d.offsetWidth, dd.clientWidth, dd.scrollWidth, dd.offsetWidth),
          height = Math.max(d.scrollHeight, d.offsetHeight, dd.clientHeight, dd.scrollHeight, dd.offsetHeight);
          if(d.style.overflow) d.dataset.overflow = d.style.overflow
          d.style.overflow = 'hidden'
          return {width,height}
        })()`, {},(err, url, result)=>{
          const key = Math.random().toString()
          cont.hostWebContents.send('webview-size-change',tabKey,key,`${result[0].width}px`,`${result[0].height}px`,true)
          ipcMain.once(`webview-size-change-reply_${key}`,(e)=>{
            cont.capturePage(rect || {x:0,y:0,width:scaling(result[0].width),height:scaling(result[0].height) },capture.bind(this,_=>{
              cont.hostWebContents.send('webview-size-change',tabKey,key,'100%','100%')
              cont.executeScriptInTab('dckpbojndfoinamcdamhkjhnjnmjkfjd',
                `(function(){
          document.body.style.overflow = document.body.dataset.overflow || null
        })()`, {},(err, url, result)=>{})
            }))
          })
        })
    }
  }
  else{
    const args = [capture.bind(this,null)]
    if(rect) args.unshift(rect)
    const cont = (e.sender.hostWebContents ? (sharedState[tabId] || webContents.fromTabID(tabId)) : e.sender)
    if(cont && !cont.isDestroyed()) cont.capturePage(...args)
  }
})

ipcMain.on('save-and-play-video',(e,url,win)=>{
  win = win || BrowserWindow.fromWebContents(e.sender)
  win.webContents.downloadURL(url,true)
  let retry = 0
  const id = setInterval(_=>{
    if(retry++ > 1000){
      clearInterval(id)
      return
    }
    const item = global.downloadItems.find(x=>x.orgUrl == url)
    if(item && (item.percent > 0 || (item.aria2c && item.aria2c.processed / item.aria2c.total > 0.005))){
      clearInterval(id)
      shell.openItem(item.savePath)
    }
  },100)
})

ipcMain.on('execCommand-copy',e=>{
  console.log(888948848)
  e.sender.sendInputEvent({type: 'keyDown', keyCode: 'c', modifiers: ['control']});
  e.sender.sendInputEvent({type: 'keyUp', keyCode: 'c', modifiers: ['control']});
})

ipcMain.on('get-isMaximized',e=>{
  const win = BrowserWindow.fromWebContents(e.sender)
  e.returnValue = win.isMaximized() || win.isFullScreen()
})

ipcMain.on('set-audio-muted',(e,tabId,val,changeTabPanel)=>{
  const cont = webContents.fromTabID(tabId)
  if(cont && !cont.isDestroyed()) cont.setAudioMuted(val)
  if(changeTabPanel){

    for(let win of BrowserWindow.getAllWindows()) {
      if(win.getTitle().includes('Sushi Browser')){
        win.webContents.send('chrome-tabs-event',{tabId,changeInfo:{muted: val}},'updated')
      }
    }
  }

})

ipcMain.on('get-automation',async e=>{
  const datas = await automation.find({})
  e.sender.send('get-automation-reply',datas)
})

ipcMain.on('update-automation',(e,key,ops)=>{
  automation.update({key},{key, ops, updated_at: Date.now()}, { upsert: true }).then(_=>_)
})

ipcMain.on('update-automation-order',async (e,datas,menuKey)=>{
  await automationOrder.remove({})
  const key = '1'
  automationOrder.update({key},{key, datas, menuKey, updated_at: Date.now()}, { upsert: true }).then(_=>_)
})

ipcMain.on('get-automation-order',async (e,datas)=>{
  const rec = await automationOrder.findOne({})
  e.returnValue = rec ? {datas:rec.datas, menuKey:rec.menuKey} : {datas:[]}
})

ipcMain.on('delete-automation',async (e,key)=>{
  await automation.remove({key})
  await automationOrder.remove({key})
})

ipcMain.on('run-puppeteer',(e, dir, file)=> {
  ipcMain.once('start-pty-reply', (e, key) => {
    ipcMain.emit(`send-pty_${key}`, null, `cd ${dir}\nnode ${file}\n`)
  })
  e.sender.hostWebContents.send('new-tab', e.sender.getId(), 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/terminal.html')
})

ipcMain.on('start-complex-search',(e,key,tabId,operation,noMacro)=>{
  const macro = noMacro ? '' : readComplexSearch()
  const cont = webContents.fromTabID(tabId)
  if(cont && !cont.isDestroyed()){
    cont.executeScriptInTab('dckpbojndfoinamcdamhkjhnjnmjkfjd',`${macro}\n${operation}`, {},(err, url, result)=>{
      e.sender.send(`start-complex-search-reply_${key}`,result[0])
    })
  }
})

ipcMain.on('history-count-reset',async (e,key,_id,count)=>{
  const ret = await history.findOne({_id})
  await history.update({_id}, {$set:{count}})
  e.sender.send(`history-count-reset-reply_${key}`,ret.count)
})

ipcMain.on('history-pin',async (e,key,_id,val)=>{
  let max = -1
  if(!val){
    await history.update({_id}, {$unset:{pin: true}})
  }
  else{
    for(let rec of (await history.find({pin: {$exists: true}}))){
      max = Math.max(rec.pin, max)
    }
    await history.update({_id}, {$set:{pin: max+1}})
  }
  e.sender.send(`history-pin-reply_${key}`,max+1)
})

ipcMain.on('remove-history',async (e,val)=> {
  const opt = val.all ? {} :
    val.date ? {updated_at:{ $gte: Date.parse(`${val.date.replace(/\//g,'-')} 00:00:00`) ,$lte: Date.parse(`${val.date.replace(/\//g,'-')} 00:00:00`) + 24 * 60 * 60 * 1000 }} :
      {_id: val._id}
  history.remove(opt, { multi: true })
})

ipcMain.on('quit-browser',(e,type)=>{
  ipcMain.emit('save-all-windows-state',null,'quit')
  ipcMain.once('wait-saveState-on-quit',()=>{
    if(type == 'restart') app.relaunch()
    BrowserWindow.getAllWindows().forEach(win=>win.close())
    app.quit()
  })
})

ipcMain.on('close-window',e=>{
  BrowserWindow.fromWebContents(e.sender.webContents).close()
})

ipcMain.on('find-event',(e,tabId,method,...args)=>{
  if(!method.includes('find') && !method.includes('Find')) return
  const cont = webContents.fromTabID(tabId)
  if(cont && !cont.isDestroyed()){
    cont[method](...args)
  }
})

ipcMain.on('visit-timer',(e,type)=>{
  for(let win of BrowserWindow.getAllWindows()) {
    if(win.getTitle().includes('Sushi Browser')){
      win.webContents.send('visit-state-update',type)
    }
  }
})

ipcMain.on('browser-load',async (e,arg)=>{
  const win = await BrowserWindowPlus.load(arg)
  e.returnValue = win.id
})

ipcMain.on('rectangular-selection',(e,val)=>{
  mainState.rectSelection = val ? [e.sender,val] : void 0
  if(val) require('./menuSetting')()
})


ipcMain.on("full-screen-html",(e,val)=>{
  mainState.fullScreenIds[e.sender.getId()] = val
})

// ipcMain.on('get-firefox-url',(e,key,url)=>{
//   session.defaultSession.webRequest.fetch(url, {'user-agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:57.0) Gecko/20100101 Firefox/57.0`}, (err, response, body) => {
//      e.sender.send(`get-firefox-url-reply_${key}`,body.toString())
//   })
// })

// ipcMain.on('send-keys',(e,keys)=>{
//   e.sender.sendInputEvent(keys)
// })

// async function recurSelect(keys){
//   const ret = await favorite.find({key:{$in: keys}})
//   const addKey = []
//   let children = ret.map(x=>{
//     if(x.is_file){
//       addKey.push(x.url)
//     }
//     else{
//       recurSelect(x.children)
//     }
//   })
//   const nextKeys = Array.prototype.concat.apply([],children).filter(ret=>ret)
//   list.splice(list.length,0,...addKey)
//   if(nextKeys && nextKeys.length > 0) {
//     return (await recurFind(nextKeys, list))
//   }
// }
//
// ipcMain.on('get-all-favorites',async (event,key)=>{
//   let list = []
//   const ret = await recurSelect(['root'])
//   const cont = event.sender.hostWebContents
//   for(let url of list){
//     await new Promise((resolve,reject)=>{
//       setTimeout(_=>{
//         cont.send("new-tab-opposite",event.sender.getId(),url)
//         resolve()
//       },200)
//
//     })
//   }
//   console.log(list)
//   event.sender.send(`open-favorite-reply_${key}`,key)
//
// })