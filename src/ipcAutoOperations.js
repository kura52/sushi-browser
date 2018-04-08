import {ipcMain,webContents,session} from 'electron'
import fs from 'fs'
import uuid from 'node-uuid'
import PubSub from './render/pubsub'
import mainState from './mainState'
import UglifyJS from "uglify-es"

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

simpleIpcFunc('auto-play-operation',async (tabId,method,...args)=>{
  return webContents.fromTabID(tabId)[method](...args)
})

simpleIpcFunc('auto-play-mouse',async (type,tabId,x,y,options)=>{
  const delay = setMouseArgs(options)
  const cont = webContents.fromTabID(tabId)
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
})


simpleIpcFuncCb('auto-play-keyboard',async (mode,tabId,value,options,cb)=>{
  const cont = webContents.fromTabID(tabId)

  if(mode != 'type') {
    if (mode == 'down') {
      cont.webContents.sendInputEvent({type: 'keyDown', keyCode: value})
    }
    else if (mode == 'press') {
      cont.webContents.sendInputEvent({type: 'char', keyCode: value})
    }
    else if (mode == 'up') {
      cont.webContents.sendInputEvent({type: 'keyUp', keyCode: value})
    }
    return cb()
  }

  const chars = stringToArray(value)
  console.log(chars)

  function type() {
    let ch = chars.shift()
    if (ch === void 0) return cb()

    cont.webContents.sendInputEvent({type: 'keyDown', keyCode: ch})
    cont.webContents.sendInputEvent({type: 'char', keyCode: ch})
    cont.webContents.sendInputEvent({type: 'keyUp', keyCode: ch})
    setTimeout(type, options.delay)
  }
  type()
})

ipcMain.on('auto-play-evaluate',async (e,key,tabId,code)=>{
  ipcMain.emit('add-context-alert',null,key)
  const url = `javascript:(function(){const _extends=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var e in n)Object.prototype.hasOwnProperty.call(n,e)&&(t[e]=n[e])}return t};const ret=${UglifyJS.minify(code,UglifyOptions).code};alert('${key}' + JSON.stringify(ret))}())`
  console.log(url)
  webContents.fromTabID(tabId).loadURL(url)
  ipcMain.once(`add-context-alert-reply_${key}`,(e2,result)=>{
    e.sender.send(`auto-play-evaluate-reply_${key}`,result)
  })
})

ipcMain.on('auto-get-sync',(e,tabId,type)=>{
  const cont = webContents.fromTabID(tabId)
  let data
  if(type == 'url'){
    data = cont.getURL()
  }
  e.returnValue = data
})

simpleIpcFunc('auto-get-async',async (tabId,type)=>{
  const cont = webContents.fromTabID(tabId)
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
