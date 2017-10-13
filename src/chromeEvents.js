import {ipcMain,app,dialog,BrowserWindow,shell,webContents,session} from 'electron'
const BrowserWindowPlus = require('./BrowserWindowPlus')
import fs from 'fs'
import sh from 'shelljs'
import PubSub from './render/pubsub'
const seq = require('./sequence')
const {state,favorite,historyFull} = require('./databaseFork')
const db = require('./databaseFork')
const franc = require('franc')
const chromeManifestModify = require('./chromeManifestModify')
const extensions = require('../brave/extension/extensions')

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
  ipcMain.on(name,(event,key,...args)=>{
    if(callback){
      event.sender.send(`${name}-reply_${key}`,callback(...args))
    }
    else{
      event.sender.send(`${name}-reply_${key}`)
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

const {getPath1,getPath2,extensionPath} = require('./chromeExtensionUtil')

ipcMain.on('add-extension',(e,id)=>{
  console.log(id)
  if(!id.match(/^[a-z]+$/)) return
  const extRootPath = path.join(extensionPath,id) // path.join(__dirname,'../resource/extension',id).replace(/app.asar([\/\\])/,'app.asar.unpacked$1')
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
      console.log(234,global.downloadItems)
      if(!global.downloadItems.length){
        clearInterval(intId)
        try{
          const ret = await exec(`${exePath[0]} x -o"${extRootPath}_crx" "${extRootPath}.crx"`)
          console.log(345,ret)
          const verPath = path.join(extRootPath,JSON.parse(fs.readFileSync(path.join(`${extRootPath}_crx`,'manifest.json'))).version)
          fs.mkdirSync(extRootPath)
          fs.renameSync(`${extRootPath}_crx`, verPath)
          fs.unlink(`${extRootPath}.crx`,_=>_)
          chromeManifestModify(id,verPath)
          extensions.loadExtension(session.defaultSession,id,verPath)
        }catch(e){
          console.log(e)
        }
      }
    },300)
  },2000)
})

ipcMain.on('delete-extension',(e,extensionId,orgId)=>{
  const basePath = getPath2(orgId) || getPath1(orgId)
  extensions.disableExtension(orgId)
  if(basePath){
    const delPath = path.join(basePath,'..')
    if(delPath.includes(orgId)){
      sh.rm('-r',delPath)
    }
  }

})

//#i18n
simpleIpcFunc('chrome-i18n-getAcceptLanguages',_=>{
  const lang = app.getLocale()
  return lang == 'zh-CN' || lang == 'pt-BR' ? lang.replace('-','_') : lang.slice(0,2)
})

ipcMain.on('chrome-i18n-getMessage',(event)=>{
  try{
    const extensionId = event.sender.getURL().split('/')[2]
    const basePath = getPath2(extensionId) || getPath1(extensionId)
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


simpleIpcFunc('chrome-i18n-detectLanguage',inputText=> transLang[franc(inputText)] || 'en')

//#windows
simpleIpcFunc('chrome-windows-create',createData=>{
  BrowserWindowPlus.load({id:getCurrentWindow().id,x:createData.left,y:createData.top,height:createData.height,width:createData.width,tabParam:JSON.stringify({urls:[{url:createData.url,privateMode:false}],type:'new-win'})})
})


const windowsMethods = ['onCreated','onRemoved','onFocusChanged']

for(let method of windowsMethods){
  const registBackgroundPages = new Set()
  const name = `chrome-windows-${method}`
  ipcMain.on(`regist-${name}`,(e)=> registBackgroundPages.add(e.sender))
  ipcMain.on(`unregist-${name}`,(e)=> registBackgroundPages.delete(e.sender))
  PubSub.subscribe(name,(msg,windowId)=>{
    for(let cont of registBackgroundPages) {
      if (!cont.isDestroyed()) {
        cont.send(name, windowId)
      }
      else{
        registBackgroundPages.delete(cont)
      }
    }
  })
}

simpleIpcFunc('chrome-windows-getLastFocused',_=>{
  const win = getCurrentWindow()
  return win && win.id
})

//#tabs
process.on('chrome-tabs-created', (tabId) => {
  console.log('chrome-tabs-created',tabId)
})

process.on('chrome-tabs-updated', (tabId,changeInfo,tab) => {
  // console.log('chrome-tabs-updated',tabId,changeInfo)
  changeInfo.active = (void 0)
  // if(changeInfo.status == "complete") return
  if(changeInfo.status == "complete" ||
    (changeInfo.active === (void 0) &&
    changeInfo.pinned === (void 0))) return
  // console.log(tabId,tab)
  const cont = webContents.fromTabID(tabId)
  if(cont && !cont.isDestroyed() && !cont.isBackgroundPage() && cont.isGuest()) {
    if(cont.hostWebContents) cont.hostWebContents.send('chrome-tabs-event', {tabId,changeInfo}, 'updated')
  }
})

process.on('chrome-tabs-updated-from-extension', (tabId) => {
  // console.log(tabId,tab)
  const cont = webContents.fromTabID(tabId)
  if(cont && !cont.isDestroyed() && !cont.isBackgroundPage() && cont.isGuest()) {
    if(cont.hostWebContents) cont.hostWebContents.send('chrome-tabs-event', {tabId,changeInfo:{active:true}}, 'updated')
  }
})


process.on('chrome-tabs-removed', (tabId) => {
  console.log('chrome-tabs-removed', tabId)
  const wins = BrowserWindow.getAllWindows()
  if(!wins) return

  for(let win of wins.filter(w=>w.getTitle().includes('Sushi Browser'))){
    try {
      if(!win.webContents.isDestroyed()){
        win.webContents.send('chrome-tabs-event', {tabId}, 'removed');
      }
    }catch(e){
      // console.log(e)
    }
  }
})

simpleIpcFuncCb('chrome-tabs-reload',async (tabId, reloadProperties,cb)=> {
  const cont = tabId === null || tabId === (void 0) ? (await getFocusedWebContents()) : webContents.fromTabID(tabId)
  reloadProperties ? cont.reloadIgnoringCache() : cont.reload()
  cb()
})

simpleIpcFuncCb('chrome-tabs-detectLanguage',(tabId,cb)=> {
  webContents.fromTabID(tabId).executeScriptInTab('dckpbojndfoinamcdamhkjhnjnmjkfjd',
    `document.documentElement.innerText`,{},
    (err, url, result) => cb(transLang[franc(result[0])] || 'en')
  )
})

simpleIpcFuncCb('chrome-tabs-insertCSS',async (extensionId,tabId,details,cb)=>{
  const cont = tabId === null || tabId === (void 0) ? (await getFocusedWebContents()) : webContents.fromTabID(tabId)
  let cssText
  if(details.code){
    cssText = details.code
  }
  else if(details.file){
    try{
      const basePath = getPath2(extensionId) || getPath1(extensionId)
      cssText = fs.readFileSync(path.join(basePath,details.file)).toString()
    }catch(e){
      cb()
      return
    }
  }
  else{
    cb()
    return
  }
  if(cont){
    cont.executeScriptInTab('dckpbojndfoinamcdamhkjhnjnmjkfjd',
      `const s = document.createElement('style');
    s.setAttribute('type', 'text/css');
    s.appendChild(document.createTextNode(\`${cssText}\`));
    document.head.appendChild(s)`,{},_=> cb()
    )
  }
})

simpleIpcFuncCb('chrome-tabs-captureVisibleTab',(tabId,options,cb)=>{
  options = options || {}
  const cont = webContents.fromTabID(tabId)
  if(cont){
    cont.capturePage(image=>{
      if(options.format == 'png'){
        cb(`data:png;base64,${image.toPNG().toString('base64')}`)
      }
      else{
        cb(`data:jpg;base64,${image.toJPEG(options.quality || 92).toString("base64")}`)
      }
    })
  }
})

//#cookies
simpleIpcFuncCb('chrome-cookies-remove',(details,cb)=>{
  session.defaultSession.cookies.remove(details.url, details.name, _=>cb(details))
})

//#management
simpleIpcFunc('chrome-management-getAll',_=> Object.values(require('./extensionInfos')))
simpleIpcFunc('chrome-management-get',id => require('./extensionInfos')[id])

//#webNavigation
const webNavigationMethods = ['onBeforeNavigate','onCommitted','onDOMContentLoaded','onCompleted','onErrorOccurred','onCreatedNavigationTarget']

for(let method of webNavigationMethods){
  const registBackgroundPages = new Set()
  const name = `chrome-webNavigation-${method}`
  ipcMain.on(`regist-${name}`,(e)=> registBackgroundPages.add(e.sender))
  ipcMain.on(`unregist-${name}`,(e)=> registBackgroundPages.delete(e.sender))
  ipcMain.on(name,(e,details)=>{
    for(let cont of registBackgroundPages) {
      if (!cont.isDestroyed()) {
        // try{
        //   if(details.processId === void 0) details.processId = webContents.fromTabID(details.tabId).getProcessId()
        // }catch(e){}
        details.processId = -1
        cont.send(name, details)
      }
      else{
        registBackgroundPages.delete(cont)
      }
    }
  })
}

//#proxy
simpleIpcFuncCb('chrome-proxy-settings-set',(details,cb)=>{
  console.log(details)
  let config
  if(!details){
    config = {}
    session.defaultSession.setProxy(config,_=>cb())
    return
  }
  details = details.value
  if(details.mode == 'direct'){
    config = {
      proxyRules: 'direct://'
    }
  }
  else if(details.mode == 'auto_detect'){
    config = {
      pacScript: 'http://wpad/wpad.dat'
    }
  }
  else if(details.mode == 'pac_script'){
    const proxyPath = path.join(app.getPath('userData'),'proxy','proxy.txt')
    if (fs.existsSync(proxyPath)) {
      fs.unlinkSync(proxyPath)
    }
    fs.writeFileSync(proxyPath, details.pacScript.data)
    console.log(432423423,`file://${proxyPath.replace(/\\/g,'/')}`)
    config = {
      pacScript: `file:///${proxyPath.replace(/\\/g,'/')}`
    }
  }
  else if(details.mode == 'fixed_servers'){
    const rules = details.rules
    let proxyRules = []
    if(rules.proxyForHttp){
      proxyRules.push(`http=${rules.proxyForHttp.scheme}://${rules.proxyForHttp.host}`)
    }
    if(rules.proxyForHttps){
      proxyRules.push(`https=${rules.proxyForHttps.scheme}://${rules.proxyForHttps.host}`)
    }
    if(rules.proxyForFtp){
      proxyRules.push(`ftp=${rules.proxyForFtp.scheme}://${rules.proxyForFtp.host}`)
    }
    if(rules.singleProxy){
      proxyRules.push(`${rules.singleProxy.scheme}://${rules.singleProxy.host}`)
    }
    if(rules.fallbackProxy){
      proxyRules.push(`${rules.fallbackProxy.scheme}://${rules.fallbackProxy.host}`)
    }
    config = {
      proxyRules: proxyRules.join(';')
    }
    if(rules && rules.bypassList && rules.bypassList.length){
      config.bypassList = rules.bypassList
    }
  }
  else if(details.mode == 'system'){
    config = {}
  }

  session.defaultSession.setProxy(config,_=>cb())
})

//#contextMenu
let extensionMenu = {}
process.on('chrome-context-menus-remove-all', (extensionId) => {
  delete extensionMenu[extensionId]
})

let contextMenuVals = {}
ipcMain.on('contextMenu-create-properties',(e,extensionId,id,vals)=>{
  if(!contextMenuVals[extensionId]) contextMenuVals[extensionId] = {}
  if(!contextMenuVals[extensionId][id]) contextMenuVals[extensionId][id] = {}
  const menu = contextMenuVals[extensionId][id]
  Object.assign(menu,vals)
  // console.log('contextMenu-create-properties',{...menu})
})

simpleIpcFunc('chrome-context-menus-update',(extensionId,id,updateProperties)=>{
  const menu = extensionMenu[extensionId]
  if(menu){
    const item = menu.find(propeties=>propeties.id === id || propeties.menuItemId === id)
    if(item) Object.assign(item.properties,updateProperties)
  }
})

simpleIpcFunc('chrome-context-menus-remove',(extensionId,menuItemId)=>{
  const menu = extensionMenu[extensionId]
  if(menu){
    const i = menu.findIndex(propeties=>propeties.menuItemId === menuItemId || propeties.id === menuItemId)
    console.log(i,[...menu],menuItemId)
    if(i != -1) menu.splice(i,1)
  }
})

process.on('chrome-context-menus-create', (extensionId, menuItemId, properties, icon) => {
  if(!extensionMenu[extensionId]) extensionMenu[extensionId] = []
  if(contextMenuVals[extensionId] && contextMenuVals[extensionId][menuItemId]){
    console.log('chrome-context-menus-create',{...properties},contextMenuVals[extensionId][menuItemId])
    Object.assign(properties,contextMenuVals[extensionId][menuItemId])
    delete contextMenuVals[extensionId][menuItemId]
  }
  extensionMenu[extensionId].push({properties, menuItemId, icon})
})

export default extensionMenu