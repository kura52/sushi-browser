import {ipcMain,session} from 'electron'
import {webContents} from './remoted-chrome/BrowserView'
import fs from 'fs'
import uuid from 'node-uuid'
import PubSub from './render/pubsub'
import mainState from './mainState'
import UglifyJS from "./uglify-es/start/node"

const UglifyOptions = {mangle:false,compress:{ booleans: false, collapse_vars: false, comparisons: false, conditionals: false, dead_code: false, evaluate: false, hoist_props: false, if_return: false, inline: false, join_vars: false, loops: false, negate_iife: false, reduce_funcs: false, reduce_vars: false, sequences: false, side_effects: false, switches: false}}

function wait(time){
  return new Promise(r=>setTimeout(r),time)
}

function simpleIpcFunc(name,callback){
  ipcMain.on(name,(event,key,...args)=>{
    if(key){
      if(callback){
        event.sender.send(`${name}-reply_${key}`,callback(...args))
      }
      else{
        event.sender.send(`${name}-reply_${key}`)
      }
    }
    else{
      callback(...args)
    }
  })
}

function simpleIpcFuncCb(name,callback){
  ipcMain.on(name,(event,key,...args)=>{
    if(callback){
      callback(...args,(...args2)=>{
        event.sender.send(`${name}-reply_${key}`,...args2)
      })
    }
  })
}


function stringToArray (str) {
  return str.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
}

function setMouseArgs(options){
  const delay = options.delay || 20
  delete options.delay
  options.button =  options.button || 'left'
  options.clickCount = options.clickCount || 1
  return delay
}

simpleIpcFunc('auto-play-operation',(tabId,method,...args)=>{
  const cont = webContents.fromId(tabId)
  if(!cont || cont.isDestroyed()) return

  return cont[method](...args)
})

simpleIpcFuncCb('auto-play-mouse',async (type,tabId,x,y,options,cb)=>{
  const delay = setMouseArgs(options)
  const cont = webContents.fromId(tabId)
  if(!cont || cont.isDestroyed()) return cb()

  if(type == 'click'){
    cont.sendInputEvent({ type: 'mouseDown',x,y, ...options})
    if(delay) await wait(delay)
    cont.sendInputEvent({ type: 'mouseUp',x,y, ...options})
  }
  else if(type == 'move'){
    cont.sendInputEvent({ type: 'mouseMove',x,y})
  }
  else if(type == 'down'){
    cont.sendInputEvent({ type: 'mouseDown',x,y, ...options})
  }
  else if(type == 'up'){
    cont.sendInputEvent({ type: 'mouseUp',x,y, ...options})
  }
  cb()
})


simpleIpcFuncCb('auto-play-keyboard',async (mode,tabId,key,text,options,cb)=>{
  const cont = webContents.fromId(tabId)
  if(!cont || cont.isDestroyed()) return cb()

  if(mode != 'type') {
    if (mode == 'down') {
      cont.sendInputEvent({type: 'keyDown', keyCode: key, ...options})
      cont.sendInputEvent({type: 'char', keyCode: text === void 0 ? key : text, ...options})
    }
    else if (mode == 'press') {
      cont.sendInputEvent({type: 'char', keyCode: key, ...options})
    }
    else if (mode == 'up') {
      cont.sendInputEvent({type: 'keyUp', keyCode: key, ...options})
    }
    else if (mode == 'click') {
      cont.sendInputEvent({type: 'keyDown', keyCode: key, ...options})
      cont.sendInputEvent({type: 'char', keyCode: text === void 0 ? key : text, ...options})
      await wait(options.delay)
      cont.sendInputEvent({type: 'keyUp', keyCode: key, ...options})
    }
    return cb()
  }

  const chars = stringToArray(text)
  function type() {
    let ch = chars.shift()
    if (ch === void 0) return cb()

    cont.webContents.sendInputEvent({type: 'keyDown', keyCode: ch, ...options})
    cont.webContents.sendInputEvent({type: 'char', keyCode: ch, ...options})
    cont.webContents.sendInputEvent({type: 'keyUp', keyCode: ch, ...options})
    setTimeout(type, options.delay)
  }
  type()
})

ipcMain.on('auto-play-evaluate',async (e,key,tabId,code)=>{
  console.log(key,tabId,code)
  ipcMain.emit('add-context-alert',null,key)
  const url = `javascript:(function(){const _extends=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var e in n)Object.prototype.hasOwnProperty.call(n,e)&&(t[e]=n[e])}return t};let ret=${UglifyJS.minify(code,UglifyOptions).code};(async ()=>alert('${key}' + JSON.stringify({a:(await ret)})))()}())`
  console.log(url)
  const cont = webContents.fromId(tabId)
  if(cont && !cont.isDestroyed()) cont.loadURL(url)
  ipcMain.once(`add-context-alert-reply_${key}`,(e2,result)=>{
    e.sender.send(`auto-play-evaluate-reply_${key}`,result)
  })
})

ipcMain.on('auto-get-sync',(e,tabId,type)=>{
  const cont = webContents.fromId(tabId)
  let data = null
  if(type == 'url' && cont && !cont.isDestroyed()){
    data = cont.getURL()
  }
  e.returnValue = data
})

simpleIpcFunc('auto-get-async',async (tabId,type)=>{
  const cont = webContents.fromId(tabId)
  if(!cont || cont.isDestroyed()){}
  if(type == 'back'){
    cont.goBack()
  }
  else if(type == 'forward'){
    cont.goForward()
  }
  else if(type == 'reload'){
    cont.reload()
  }
  return true
})

ipcMain.on('auto-play-auth',(e,tabId,user,pass)=>{
  const cont = webContents.fromId(tabId)
  if(cont && !cont.isDestroyed()) cont.hostWebContents2.send('auto-play-auth',user,pass)
})

ipcMain.on('auto-play-notification',(e,tabId,value)=>{
  const cont = webContents.fromId(tabId)
  if(cont && !cont.isDestroyed()) cont.hostWebContents2.send('auto-play-notification',value)
})

ipcMain.on('open-dev-tool',(e)=>{
  if(!e.sender.isDestroyed()) e.sender.toggleDevTools()
})

simpleIpcFunc('read-file',async (file)=>{
  return fs.readFileSync(file).toString()
})

// ipcMain.on('set-cookies',async (e,key,tabId,items)=>{
//   const cont = webContents.fromId(tabId)
//   for(let item of items){
//     await new Promise(resolve=>cont.session.cookies.set(item, err=>{console.log(err);resolve()}))
//   }
//   e.sender.send(`set-cookies-reply_${key}`)
// })