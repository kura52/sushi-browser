import {ipcMain,app,dialog,BrowserWindow,shell,webContents,session} from 'electron'
const BrowserWindowPlus = require('./BrowserWindowPlus')
import fs from 'fs'
import sh from 'shelljs'
import uuid from 'node-uuid'
import PubSub from './render/pubsub'
const seq = require('./sequence')
const {state,favorite,historyFull} = require('./databaseFork')
const db = require('./databaseFork')
const FfmpegWrapper = require('./FfmpegWrapper')

import path from 'path'
const ytdl = require('ytdl-core')
const youtubedl = require('youtube-dl')
import {getFocusedWebContents} from './util'
const isWin = process.platform == 'win32'
const isLinux = process.platform === 'linux'
const meiryo = isWin && Intl.NumberFormat().resolvedOptions().locale == 'ja'
import mainState from './mainState'
const open = require('./open')
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
        if(err) reject(err)
        if(method == 'stat'){
          rets = {isDirectory:rets.isDirectory(),mtime:rets.mtime,size:rets.size}
        }
        resolve(rets)
      })
    })
  })).then(rets=>{
    event.sender.send(`file-system-list-reply_${key}`,rets)
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
  const cont = tabId !== 0 && webContents.fromTabID(tabId)
  console.log(tabId,cont)
  if(info.inputable){
    const key2 = uuid.v4();
    (cont ? event.sender : event.sender.hostWebContents).send('show-notification',{id:(cont || event.sender).getId(),key:key2,title:info.title,text:info.text,initValue:info.initValue,needInput:info.needInput || [""]})
    ipcMain.once(`reply-notification-${key2}`,(e,ret)=>{
      if(ret.pressIndex !== 0){
        event.sender.send(`show-dialog-exploler-reply_${key}`)
      }
      else{
        console.log(`show-dialog-exploler-reply_${key}`)
        event.sender.send(`show-dialog-exploler-reply_${key}`,ret.value)
      }
    })
  }
  else{
    dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
      defaultPath:info.defaultPath,properties: ['openDirectory']}, (selected) => {
      if (Array.isArray(selected)) {
        event.sender.send(`show-dialog-exploler-reply_${key}`,selected[0])
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


ipcMain.on('insert-favorite',(event,key,writePath,data)=>{
  console.log("insert",writePath,data)
  favorite.insert({key,...data,created_at: Date.now(), updated_at: Date.now()}).then(ret=>{
    favorite.update({ key: writePath }, { $push: { children: key }, $set:{updated_at: Date.now()} }).then(ret2=>{
      if(ret2 == 0 && writePath == 'top-page'){
        favorite.insert({key:writePath, children: [key], is_file: false, title: 'Top Page' ,created_at: Date.now(), updated_at: Date.now()}).then(ret=>{
          favorite.update({ key: 'root' }, { $push: { children: 'top-page' }, $set:{updated_at: Date.now()} }).then(ret2=> {
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


ipcMain.on('rename-favorite',(event,key,dbKey,newName)=>{
  console.log(99,dbKey,newName)
  favorite.update({ key: dbKey }, { $set: {...newName,updated_at: Date.now()}}).then(ret2=>{
    event.sender.send(`rename-favorite-reply_${key}`,key)
  })
})


async function recurGet(keys){
  const ret = await favorite.find({key:{$in: keys}})
  const datas = []
  const promises = []
  for(let x of ret){
    const data = {key:x.key,title:x.title,url:x.url,favicon:x.favicon,is_file:x.is_file}
    if(x.children){
      promises.push(recurGet(x.children))
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

ipcMain.on('get-all-favorites',async(event,key,dbKeys)=>{
  const ret = await recurGet(dbKeys)
  event.sender.send(`get-all-favorites-reply_${key}`,ret)
})



async function recurFind(keys,list){
  const ret = await favorite.find({key:{$in: keys}})
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
    return (await recurFind(nextKeys, list))
  }
}

ipcMain.on('open-favorite',async (event,key,dbKeys,tabId,type)=>{
  let list = []
  const cont = tabId !== 0 && webContents.fromTabID(tabId)
  const ret = await recurFind(dbKeys,list)
  const host = cont ? event.sender : event.sender.hostWebContents
  if(type == "openInNewTab" || type=='openInNewPrivateTab' || type=='openInNewSessionTab'){
    for(let url of list){
      await new Promise((resolve,reject)=>{
        setTimeout(_=>{
          if(tabId){
            host.send("new-tab",tabId,url,type=='openInNewSessionTab' ? `persist:${seq()}` : type=='openInNewPrivateTab' ? Math.random().toString() : false)
          }
          else{
            host.send("new-tab-opposite", event.sender.getId(),url,(void 0),type=='openInNewSessionTab' ? `persist:${seq()}` : type=='openInNewPrivateTab' ? Math.random().toString() : false)
          }
          resolve()
        },200)
      })
    }
  }
  else{
    const win = BrowserWindow.fromWebContents(host)
    ipcMain.once('get-private-reply',(e,privateMode)=>{
      console.log(67866,JSON.stringify({urls:list.map(url=>{return {url}}),
        type: type == 'openInNewWindow' ? 'new-win' : type == 'openInNewWindowWithOneRow' ? 'one-row' : 'two-row'}))
      BrowserWindowPlus.load({id:win.id,sameSize:true,tabParam:JSON.stringify({urls:list.map(url=>{return {url}}),
        type: type == 'openInNewWindow' ? 'new-win' : type == 'openInNewWindowWithOneRow' ? 'one-row' : 'two-row'})})
    })
    win.webContents.send('get-private', (cont || event.sender).getId())
  }

  console.log(list)
  event.sender.send(`open-favorite-reply_${key}`,key)

})

async function recurDelete(keys,list){
  const ret = await favorite.find({key:{$in: keys}})
  const nextKeys = Array.prototype.concat.apply([],ret.map(ret=>ret.children)).filter(ret=>ret)
  list.splice(list.length,0,...nextKeys)
  if(nextKeys && nextKeys.length > 0) {
    return (await recurDelete(nextKeys, list))
  }
}

ipcMain.on('delete-favorite',(event,key,dbKeys,parentKeys)=>{
  let deleteList = dbKeys
  recurDelete(dbKeys,deleteList).then(ret=>{
    deleteList = [...new Set(deleteList)]
    console.log('del',deleteList)
    favorite.remove({key: {$in : deleteList}}).then(ret2=>{
      Promise.all(parentKeys.map((parentKey,i)=>{
        const dbKey = dbKeys[i]
        favorite.update({ key: parentKey }, { $pull: { children: dbKey }, $set:{updated_at: Date.now()} })
      })).then(ret3=>{
        event.sender.send(`delete-favorite-reply_${key}`,key)
      })
    })
  })
})

ipcMain.on('move-favorite',async (event,key,args)=>{
  console.log(99,args)
  if(!args[0][3]){
    for(let arg of args){
      const [dbKey,oldDirectory,newDirectory,dropKey] = arg
      await favorite.update({ key: oldDirectory }, { $pull: { children: dbKey }, $set:{updated_at: Date.now()}})
      await favorite.update({ key: newDirectory }, { $push: { children: dbKey }, $set:{updated_at: Date.now()}})
    }
  }
  else{
    for(let arg of args.reverse()){
      const [dbKey,oldDirectory,newDirectory,dropKey] = arg
      await favorite.update({ key: oldDirectory }, { $pull: { children: dbKey }, $set:{updated_at: Date.now()}})
      const ret2 = await favorite.findOne({key: newDirectory})
      const children = ret2.children
      const ind = children.findIndex(x=>x == dropKey)
      children.splice(ind+1,0,dbKey)
      console.log(88,children)
      await favorite.update({ key: newDirectory }, { $set: {children, updated_at: Date.now()}})
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

ipcMain.on('toggle-fullscreen',(event)=> {
  const win = BrowserWindow.fromWebContents(event.sender)
  const isFullScreen = win.isFullScreen()
  win.webContents.send('switch-fullscreen',!isFullScreen)
  win.setFullScreenable(true)
  const menubar = win.isMenuBarVisible()
  win.setFullScreen(!isFullScreen)
  win.setMenuBarVisibility(menubar)
  win.setFullScreenable(false)
})

ipcMain.on('video-infos',(event,{url})=>{
  youtubedl.getInfo(url, function(err, info) {
    if (err){
      event.sender.send('video-infos-reply',{error:'error'})
    }
    console.log(info)
    if(!info){
      if(url.includes("youtube")){
        ytdl.getInfo(url, (err, info)=> {
          if (err){
            event.sender.send('video-infos-reply',{error:'error'})
          }
          else{
            const title = info.title
            const formats = info.formats
            event.sender.send('video-infos-reply',{title,formats:formats.slice(0.12)})
          }
        })
      }
      else{
        event.sender.send('video-infos-reply',{error:'error'})
      }
    }
    else{
      const title = info.title
      event.sender.send('video-infos-reply',{title,formats:info.formats.slice(0.12)})
    }
  });
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
  const bw = BrowserWindow.fromWebContents(e.sender)
  if(title){
    bw.setTitle(`${title} - Sushi Browser`)
  }
  else{
    const cont = bw.webContents
    const key = uuid.v4()
    return new Promise((resolve,reject)=>{
      ipcMain.once(`get-focused-webContent-reply_${key}`,(e,tabId)=>{
        const focusedCont = webContents.fromTabID(tabId)
        if(focusedCont){
          bw.setTitle(`${focusedCont.getTitle()} - Sushi Browser`)
        }
      })
      cont.send('get-focused-webContent',key)
    })
    bw.setTitle(`${title} - Sushi Browser`)
  }
})


ipcMain.on('get-main-state',(e,names)=>{
  const ret = {}
  names.forEach(name=>{
    if(name == "ALL_KEYS"){
      for(let [key,val] of Object.entries(mainState)){
        if(key.startsWith("key")){
          ret[key] = val
        }
      }
    }
    else{
      ret[name] = mainState[name]
    }
  })

  const extInfos = require('./extensionInfos')
  const extensions = {}
  const disableExtensions = mainState.disableExtensions
  for (let [k,v] of Object.entries(extInfos)) {
    if(!('url' in v) || v.name == "brave") continue
    extensions[k] = {name:v.name,url:v.url,basePath:v.base_path,optionPage: v.manifest.options_page,icons:v.manifest.icons, version: v.manifest.version, description: v.manifest.description,enabled: !disableExtensions.includes(k) }
  }
  ret.extensions = extensions
  e.sender.send('get-main-state-reply',ret)
})


ipcMain.on('save-state',async (e,{tableName,key,val})=>{
  if(tableName == 'state'){
    if(key == 'disableExtensions'){
      for(let extensionId of diffArray(val,mainState[key])){
        session.defaultSession.extensions.disable(extensionId)
      }
      for(let extensionId of diffArray(mainState[key],val)){
        session.defaultSession.extensions.enable(extensionId)
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
    e.sender.hostWebContents.send("update-mainstate",key,val)
  }
})

ipcMain.on('menu-or-key-events',(e,name)=>{
  getFocusedWebContents().then(cont=>{
    cont && cont.hostWebContents.send('menu-or-key-events',name,cont.getId())
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
  for(let c of changeTabInfos){
    const cont = webContents.fromTabID(c.tabId)
    if(cont){
      if(c.active){
        if(timer) clearTimeout(timer)
        timer = setTimeout(()=>{
          console.log('change-tab-infos',c)
          cont.setActive(c.active)
          timer = void 0
        }, 10)
      }
      if(c.index !== (void 0)){
        if(timers[c.tabId]) clearTimeout(timers[c.tabId])
        timers[c.tabId] = setTimeout(()=>{
          console.log('change-tab-infos',c)
          cont.setTabIndex(c.index)
          delete timers[c.tabId]
        }, 10)
      }
    }
  }
})

ipcMain.on('need-get-inner-text',(e,key)=>{
  if(mainState.historyFull){
    ipcMain.once('get-inner-text',(e,location,title,text)=>{
      historyFull.update({location},{location,title,text,updated_at: Date.now()}, { upsert: true }).then(_=>_)
    })
  }
  e.sender.send(`need-get-inner-text-reply_${key}`,mainState.historyFull)
})

ipcMain.on('play-external',(e,url)=> open(url,mainState.sendToVideo))

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
  const files = dialog.showOpenDialog(focusedWindow,{
    properties: ['openFile'],
    filters: [{
      name: 'Select Video Files',
      extensions: ['3gp','3gpp','3gpp2','asf','avi','dv','flv','m2t','m4v','mkv','mov','mp4','mpeg','mpg','mts','oggtheora','ogv','rm','ts','vob','webm','wmv']
    }]
  })
  if (files && files.length > 0) {
    for(let file of files){
      new FfmpegWrapper(file).exe(_=>_)
    }
  }
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

ipcMain.on('get-on-dom-ready',(e,tabId)=>{
  const cont = webContents.fromTabID(tabId)
  if(!cont){
    e.sender.send(`get-on-dom-ready-reply_${tabId}`,null)
    return
  }
  if(mainState.flash) cont.authorizePlugin(mainState.flash)

  e.sender.send(`get-on-dom-ready-reply_${tabId}`,{
    currentEntryIndex: cont.getCurrentEntryIndex(),
    entryCount: cont.getEntryCount(),
    title: cont.getTitle()
  })
})

ipcMain.on('get-update-title',(e,tabId)=>{
  const cont = webContents.fromTabID(tabId)
  const ret = cont ? {
    title: cont.getTitle(),
    currentEntryIndex: cont.getCurrentEntryIndex(),
    entryCount: cont.getEntryCount(),
    url: cont.getURL()
  } : null

  e.sender.send(`get-update-title-reply_${tabId}`,ret)
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
  const cont = webContents.fromTabID(tabId)
  const msg = `get-did-start-loading-reply_${tabId}`
  if(!cont){
    e.sender.send(msg)
    return
  }
  addDestroyedFunc(cont,tabId,e.sender,msg)
  cont.on('did-start-loading',e2=> {
    e.sender.send(msg,true)
  })
})

ipcMain.on('get-did-stop-loading',(e,tabId)=>{
  const cont = webContents.fromTabID(tabId)
  const msg = `get-did-stop-loading-reply_${tabId}`
  if(!cont){
    e.sender.send(msg)
    return
  }
  addDestroyedFunc(cont,tabId,e.sender,msg)
  cont.on('did-stop-loading',e2=> {
    const ret = {
      currentEntryIndex: cont.getCurrentEntryIndex(),
      entryCount: cont.getEntryCount(),
      url: cont.getURL()
    }
    e.sender.send(msg, ret)
  })
})

PubSub.subscribe("web-contents-created",(msg,[tabId,sender])=>{
  console.log("web-contents-created",tabId)
  const cont = webContents.fromTabID(tabId)
  if(!cont) return

  sender.send('web-contents-created',tabId)

  cont.on('page-title-updated',e2=> {
    sender.send('page-title-updated',tabId)
  })

})

ipcMain.on('get-sync-cont-history',(e,tabId)=>{
  const cont = webContents.fromTabID(tabId)
  if(!cont) e.returnValue = []
  const historyList = []
  let histNum,currentIndex
  if(cont){
    histNum = cont.getEntryCount()
    currentIndex = cont.getCurrentEntryIndex()
    for(let i=0;i<histNum;i++){
      historyList.push(cont.getURLAtIndex(i))
    }
  }
  e.returnValue = [histNum,currentIndex,historyList]
})
ipcMain.on('get-session-sequence',e=> {
  e.returnValue = seq()
})

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