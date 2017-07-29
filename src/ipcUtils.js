import {ipcMain,app,dialog,BrowserWindow,shell,webContents} from 'electron'
import fs from 'fs'
import sh from 'shelljs'
import uuid from 'node-uuid'
import {favorite} from './databaseFork'
import path from 'path'
const ytdl = require('ytdl-core')
const youtubedl = require('youtube-dl')
import {getFocusedWebContents} from './util'
const isWin = process.platform == 'win32'
const meiryo = isWin && Intl.NumberFormat().resolvedOptions().locale == 'ja'

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

ipcMain.on('show-dialog-exploler',(event,key,info)=>{
  if(info.inputable){
    const key2 = uuid.v4()
    event.sender.hostWebContents.send('show-notification',{id:event.sender.getId(),key:key2,title:info.title,text:info.text,initValue:info.initValue,needInput:info.needInput || [""]})
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
      event.sender.send(`insert-favorite-reply_${key}`,key)
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

ipcMain.on('open-favorite',async (event,key,dbKeys,tabId)=>{
  let list = []
  const ret = await recurFind(dbKeys,list)
  const cont = event.sender.hostWebContents
  for(let url of list){
    await new Promise((resolve,reject)=>{
      setTimeout(_=>{
        if(tabId){
          event.sender.send("new-tab",tabId,url,false)
        }
        else{
          cont.send("new-tab-opposite", event.sender.getId(),url)
        }
        resolve()
      },200)

    })
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

ipcMain.on('need-meiryo',e=>{
  e.sender.send('need-meiryo-reply',meiryo)
})

if(isWin){
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
}
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