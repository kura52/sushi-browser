import {ipcMain,app,dialog,BrowserWindow,shell,webContents,session} from 'electron'
const BrowserWindowPlus = require('./BrowserWindowPlus')
import fs from 'fs'
import sh from 'shelljs'
import uuid from 'node-uuid'
import PubSub from './render/pubsub'
const seq = require('./sequence')
const {state,favorite,historyFull} = require('./databaseFork')
const db = require('./databaseFork')
const franc = require('franc')

const transLang = {eng:'en', dan:'da', dut:'nl', fin:'fi', fre:'fr', ger:'de', heb:'he', ita:'it', jpn:'ja', kor:'ko', nor:'nb', pol:'pl', por:'pt', rus:'ru', spa:'es', swe:'sv', chi:'zh', cze:'cs', gre:'el', ice:'is', lav:'lv', lit:'lt', rum:'ro', hun:'hu', est:'et', bul:'bg', scr:'hr', scc:'sr', gle:'ga', glg:'gl', tur:'tr', ukr:'uk', hin:'hi', mac:'mk', ben:'bn', ind:'id', lat:'la', may:'ms', mal:'ml', wel:'cy', nep:'ne', tel:'te', alb:'sq', tam:'ta', bel:'be', jav:'jw', oci:'oc', urd:'ur', bih:'bh', guj:'gu', tha:'th', ara:'ar', cat:'ca', epo:'eo', baq:'eu', ina:'ia', kan:'kn', pan:'pa', gla:'gd', swa:'sw', slv:'sl', mar:'mr', mlt:'mt', vie:'vi', fry:'fy', slo:'sk', fao:'fo', sun:'su', uzb:'uz', amh:'am', aze:'az', geo:'ka', tir:'ti', per:'fa', bos:'bs', sin:'si', nno:'nn', xho:'xh', zul:'zu', grn:'gn', sot:'st', tuk:'tk', kir:'ky', bre:'br', twi:'tw', yid:'yi', som:'so', uig:'ug', kur:'ku', mon:'mn', arm:'hy', lao:'lo', snd:'sd', roh:'rm', afr:'af', ltz:'lb', bur:'my', khm:'km', tib:'bo', div:'dv', ori:'or', asm:'as', cos:'co', ine:'ie', kaz:'kk', lin:'ln', mol:'mo', pus:'ps', que:'qu', sna:'sn', tgk:'tg', tat:'tt', tog:'to', yor:'yo', mao:'mi', wol:'wo', abk:'ab', aar:'aa', aym:'ay', bak:'ba', bis:'bi', dzo:'dz', fij:'fj', kal:'kl', hau:'ha', ipk:'ik', iku:'iu', kas:'ks', kin:'rw', mlg:'mg', nau:'na', orm:'om', run:'rn', smo:'sm', sag:'sg', san:'sa', ssw:'ss', tso:'ts', tsn:'tn', vol:'vo', zha:'za', lug:'lg', glv:'gv'}

import path from 'path'
import {getCurrentWindow,getFocusedWebContents} from './util'
const isWin = process.platform == 'win32'
const isLinux = process.platform === 'linux'
import mainState from './mainState'
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

function simpleIpcFunc(name,callback){
  ipcMain.on(name,(event,key,args)=>{
    if(callback){
      event.sender.send(`${name}-reply_${key}`,callback(args))
    }
    else{
      event.sender.send(`${name}-reply_${key}`)
    }
  })
}


let getPath = (appId) => {
  const extRootPath = path.join(__dirname,'../resource/extension').replace(/app.asar([\/\\])/,'app.asar.unpacked$1')
  // if(!fs.existsSync(extRootPath)) {
  //   fs.mkdirSync(extRootPath)
  // }
  let appPath = path.join(extRootPath,appId)
  if(!fs.existsSync(appPath)){
    return [appId,null]
  }
  const version = fs.readdirSync(appPath).sort().pop()
  const basePath = path.join(appPath,version)
  return [appId,basePath]
}

ipcMain.on('add-extension',(e,id)=>{
  console.log(id)
  if(!id.match(/^[a-z]+$/)) return
  const extRootPath = path.join(__dirname,'../resource/extension',id).replace(/app.asar([\/\\])/,'app.asar.unpacked$1')
  const chromeVer = process.versions.chrome
  const url = `https://clients2.google.com/service/update2/crx?response=redirect&prodversion=${chromeVer}&x=id%3D${id}%26uc`

  ipcMain.emit('set-save-path', null, `${extRootPath}.crx`,true)
  getCurrentWindow().webContents.downloadURL(url, true)

  let exePath = require("glob").sync(path.join(__dirname,'../../7zip/*/{7za,7za.exe}'))
  if(!exePath.length){
    exePath = require("glob").sync(path.join(__dirname,'../../app.asar.unpacked/resource/bin/7zip/*/{7za,7za.exe}'))
    if(!exePath.length){
      return
    }
  }
  setTimeout(_=>{
    const intId = setInterval(async _=>{
      console.log(global.downloadItems)
      if(!global.downloadItems.length){
        clearInterval(intId)
        try{
          const ret = await exec(`${exePath[0]} x -o"${extRootPath}_crx" "${extRootPath}.crx"`)
          console.log(ret)
          const verPath = path.join(extRootPath,JSON.parse(fs.readFileSync(path.join(`${extRootPath}_crx`,'manifest.json'))).version)
          fs.mkdirSync(extRootPath)
          fs.renameSync(`${extRootPath}_crx`, verPath)
          fs.unlink(`${extRootPath}.crx`,_=>_)
        }catch(e){
          console.log(e)
        }
      }
    },300)
  },2000)
})

simpleIpcFunc('chrome-i18n-getAcceptLanguages',_=>app.getLocale().slice(0,2))

ipcMain.on('chrome-i18n-getMessage',(event)=>{
  try{
    const extensionId = event.sender.getURL().split('/')[2]
    const [appId,basePath] = getPath(extensionId)
    const locale = app.getLocale().replace('-',"_")

    let localePath = path.join(basePath,`_locales/${locale}/messages.json`)
    if(!fs.existsSync(localePath)){
      localePath = path.join(basePath,`_locales/${locale.split("_")[0]}/messages.json`)
      if(!fs.existsSync(localePath)){
        event.returnValue = false
        return
      }
    }
    event.returnValue = JSON.parse(fs.readFileSync(localePath))
  }catch(e){
    event.returnValue = false
  }
})

ipcMain.on('chrome-windows-create',(event,key,createData)=>{
  console.log(createData)
  BrowserWindowPlus.load({id:getCurrentWindow().id,x:createData.left,y:createData.top,height:createData.height,width:createData.width,tabParam:JSON.stringify({urls:[{url:createData.url,privateMode:false}],type:'new-win'})})
  event.sender.send(`chrome-windows-create-reply_${key}`)
})


ipcMain.on('chrome-tabs-detectLanguage',(event,key,tabId)=>{
  webContents.fromTabID(tabId).executeScriptInTab('dckpbojndfoinamcdamhkjhnjnmjkfjd',
    `document.documentElement.innerText`,
    {}, (err, url, result) =>{
      console.log(err, url, result)
      console.log(franc(result[0]))
      event.sender.send(`chrome-tabs-detectLanguage-reply_${key}`,transLang[franc(result[0])] || 'en')
    }
  )
})
