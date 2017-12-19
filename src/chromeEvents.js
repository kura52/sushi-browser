import {ipcMain,app,dialog,BrowserWindow,shell,webContents,session,clipboard,nativeImage} from 'electron'
const BrowserWindowPlus = require('./BrowserWindowPlus')
import fs from 'fs-extra'
import sh from 'shelljs'
import PubSub from './render/pubsub'
import uuid from 'node-uuid'
const seq = require('./sequence')
const {state,favorite,history,visit,downloader} = require('./databaseFork')
const db = require('./databaseFork')
const franc = require('franc')
const chromeManifestModify = require('./chromeManifestModify')
const extensions = require('../brave/extension/extensions')
const defaultConf = require('./defaultConf')
const merge = require('deepmerge')
import nm from 'nanomatch'
import path from 'path'
import {getCurrentWindow,getFocusedWebContents} from './util'
const isWin = process.platform == 'win32'
const isLinux = process.platform === 'linux'
import mainState from './mainState'

const bindPath = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/bind.html'
const transLang = {eng:'en', dan:'da', dut:'nl', fin:'fi', fre:'fr', ger:'de', heb:'he', ita:'it', jpn:'ja', kor:'ko', nor:'nb', pol:'pl', por:'pt', rus:'ru', spa:'es', swe:'sv', chi:'zh', cze:'cs', gre:'el', ice:'is', lav:'lv', lit:'lt', rum:'ro', hun:'hu', est:'et', bul:'bg', scr:'hr', scc:'sr', gle:'ga', glg:'gl', tur:'tr', ukr:'uk', hin:'hi', mac:'mk', ben:'bn', ind:'id', lat:'la', may:'ms', mal:'ml', wel:'cy', nep:'ne', tel:'te', alb:'sq', tam:'ta', bel:'be', jav:'jw', oci:'oc', urd:'ur', bih:'bh', guj:'gu', tha:'th', ara:'ar', cat:'ca', epo:'eo', baq:'eu', ina:'ia', kan:'kn', pan:'pa', gla:'gd', swa:'sw', slv:'sl', mar:'mr', mlt:'mt', vie:'vi', fry:'fy', slo:'sk', fao:'fo', sun:'su', uzb:'uz', amh:'am', aze:'az', geo:'ka', tir:'ti', per:'fa', bos:'bs', sin:'si', nno:'nn', xho:'xh', zul:'zu', grn:'gn', sot:'st', tuk:'tk', kir:'ky', bre:'br', twi:'tw', yid:'yi', som:'so', uig:'ug', kur:'ku', mon:'mn', arm:'hy', lao:'lo', snd:'sd', roh:'rm', afr:'af', ltz:'lb', bur:'my', khm:'km', tib:'bo', div:'dv', ori:'or', asm:'as', cos:'co', ine:'ie', kaz:'kk', lin:'ln', mol:'mo', pus:'ps', que:'qu', sna:'sn', tgk:'tg', tat:'tt', tog:'to', yor:'yo', mao:'mi', wol:'wo', abk:'ab', aar:'aa', aym:'ay', bak:'ba', bis:'bi', dzo:'dz', fij:'fj', kal:'kl', hau:'ha', ipk:'ik', iku:'iu', kas:'ks', kin:'rw', mlg:'mg', nau:'na', orm:'om', run:'rn', smo:'sm', sag:'sg', san:'sa', ssw:'ss', tso:'ts', tsn:'tn', vol:'vo', zha:'za', lug:'lg', glv:'gv'}
const zoomMapping = new Map([
  [25,-6],[33,-5],[50,-4],[67,-3],[75,-2],[90,-1],[100,0],
  [110,1],[125,2],[150,3],[175,4],[200,5],[250,6],[300,7],[400,8],[500,9]
])

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

function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}


function removeBom(x){
  return x.charCodeAt(0) === 0xFEFF ? x.slice(1) : x
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

ipcMain.on('add-extension',(e,{id,url})=>{
  let extRootPath
  if(id){
    if(!id.match(/^[a-z]+$/)) return
    extRootPath = path.join(extensionPath,id) // path.join(__dirname,'../resource/extension',id).replace(/app.asar([\/\\])/,'app.asar.unpacked$1')
    const chromeVer = process.versions.chrome
    url = `https://clients2.google.com/service/update2/crx?response=redirect&prodversion=${chromeVer}&x=id%3D${id}%26uc`
  }
  else if(url){
    id = require('url').parse(url).pathname.split("/").slice(-1)[0].slice(0,-4)
    extRootPath = path.join(extensionPath,id)
  }
  console.log(url,`${extRootPath}.crx`)
  ipcMain.emit('set-save-path', null,url, `${extRootPath}.crx`,true)
  getCurrentWindow().webContents.downloadURL(url, true)

  let exePath = require("glob").sync(path.join(__dirname,'../../7zip/*/{7za,7za.exe}'))
  if(!exePath.length){
    exePath = require("glob").sync(path.join(__dirname,'../../app.asar.unpacked/resource/bin/7zip/*/{7za,7za.exe}'))
    if(!exePath.length){
      return
    }
  }
  let retry = 0
  setTimeout(_=>{
    const intId = setInterval(async _=>{
      console.log(234,global.downloadItems)
      if(retry++ > 100) clearInterval(intId)
      if(!global.downloadItems.find(x=>x.savePath == `${extRootPath}.crx`)){
        try{
          console.log(`${extRootPath}.crx`,retry)
          if(!fs.existsSync(`${extRootPath}.crx`)) return
          clearInterval(intId)
          const ret = await exec(`${exePath[0]} x -o"${extRootPath}_crx" "${extRootPath}.crx"`)
          console.log(345,ret)
          let manifestPath = path.join(`${extRootPath}_crx`,'manifest.json')
          if (!fs.existsSync(manifestPath)) {
            manifestPath = require("glob").sync(`${extRootPath}_crx/**/manifest.json`)[0]
          }
          const dir = path.dirname(manifestPath)

          const verPath = path.join(extRootPath,JSON.parse(fs.readFileSync(manifestPath)).version)
          fs.mkdirSync(extRootPath)
          fs.renameSync(dir, verPath)
          if(fs.existsSync(`${extRootPath}_crx`)){
            fs.removeSync(`${extRootPath}_crx`)
          }
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
  extensions.disableExtension(extensionId)
  if(basePath){
    const delPath = path.join(basePath,'..')
    if(delPath.includes(orgId)){
      sh.rm('-r',delPath)
    }
  }

})

//#app
const extInfos = require('./extensionInfos')
simpleIpcFunc('chrome-app-getDetails',id=>extInfos[id])

//#runtime
simpleIpcFunc('chrome-runtime-openOptionsPage',id=>{
  if(extInfos[id].manifest.options_ui && extInfos[id].manifest.options_ui.page){
    getFocusedWebContents().then(cont=>cont.hostWebContents.send('new-tab', cont.getId(), `chrome-extension://${id}/${extInfos[id].manifest.options_ui.page.split("/").filter(x=>x).join("/")}`))
  }
})



//#i18n
simpleIpcFunc('chrome-i18n-getAcceptLanguages',_=>{
  const lang = app.getLocale()
  return [lang == 'zh-CN' || lang == 'pt-BR' ? lang.replace('-','_') : lang.slice(0,2)]
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
    event.returnValue = JSON.parse(removeBom(fs.readFileSync(localePath)))
  }catch(e){
    event.returnValue = false
  }
})


simpleIpcFunc('chrome-i18n-detectLanguage',inputText=> transLang[franc(inputText)] || 'en')

//#windows
simpleIpcFunc('chrome-windows-create',createData=>{
  if(createData.tabId){
    const wins = BrowserWindow.getAllWindows()
    if(!wins) return

    for(let win of wins.filter(w=>w.getTitle().includes('Sushi Browser'))){
      try {
        if(!win.webContents.isDestroyed()){
          win.webContents.send('chrome-windows-create-from-tabId',createData);
        }pc
      }catch(e){
        // console.log(e)
      }
    }
  }
  else{
    BrowserWindowPlus.load({id:getCurrentWindow().id,x:createData.left,y:createData.top,
      height:createData.height,width:createData.width,
      tabParam:JSON.stringify({urls:[{url:createData.url,privateMode:false}],type:'new-win'})})
  }
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


simpleIpcFunc('chrome-windows-remove',windowId=> BrowserWindow.fromId(windowId).close())

simpleIpcFunc('chrome-windows-get-attributes',windowIds=>{
  return windowIds.map(windowId=>{
    const win = BrowserWindow.fromId(windowId)
    if(!win) return {}
    const state =  win.isDestroyed() ? 'normal' : win.isMinimized() ? 'minimized' : win.isMaximized() ? 'maximized' : win.isFullScreen() ? 'fullscreen' : 'normal'
    return {state,type:'normal'}
  })
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

simpleIpcFuncCb('chrome-tabs-current-tabId',cb=>{
  getFocusedWebContents().then(cont=>cb(cont.getId()))
})

simpleIpcFuncCb('chrome-tabs-reload',async (tabId, reloadProperties,cb)=> {
  const cont = tabId === null || tabId === (void 0) ? (await getFocusedWebContents()) : webContents.fromTabID(tabId)
  reloadProperties ? cont.reloadIgnoringCache() : cont.reload()
  cb()
})

simpleIpcFuncCb('chrome-tabs-move',(tabIds, moveProperties,cb)=> {
  console.log('chrome-tabs-move',tabIds, moveProperties)
  if(!tabIds || !tabIds.length) return cb()

  const key = uuid.v4()
  const fromWin = BrowserWindow.fromWebContents(webContents.fromTabID(tabIds[0]).hostWebContents)
  if(moveProperties.windowId && fromWin.id !== moveProperties.windowId){
    const toWin = BrowserWindow.fromId(moveProperties.windowId)
    fromWin.webContents.send('chrome-tabs-move-detach',key,tabIds)
    ipcMain.once(`chrome-tabs-move-detach-reply_${key}`,(e,datas)=>{
      toWin.send('chrome-tabs-move-attach',moveProperties.index,datas)
    })
    ipcMain.once(`chrome-tabs-move-finished_${key}`,_=>cb([fromWin.id,toWin.id]))
  }
  else{
    fromWin.webContents.send('chrome-tabs-move-inner',key,tabIds,moveProperties.index)
    ipcMain.once(`chrome-tabs-move-finished_${key}`,_=>cb([fromWin.id]))
  }

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


simpleIpcFuncCb('chrome-tabs-duplicate',async (tabId,cb)=>{
  const key = uuid.v4()
  const fromWin = BrowserWindow.fromWebContents(webContents.fromTabID(tabId).hostWebContents)
  fromWin.webContents.send('chrome-tabs-duplicate',key,tabId)
  ipcMain.once(`chrome-tabs-duplicate-reply_${key}`,(e,tabId)=>{
    cb(tabId)
  })
})


simpleIpcFuncCb('chrome-tabs-saveAsPDF',async (pageSettings,cb)=>{
  getFocusedWebContents().then(cont=>{
    const filepath = dialog.showSaveDialog(BrowserWindow.fromWebContents(cont.hostWebContents),{defaultPath: path.join(app.getPath('downloads'), `${cont.getTitle()}.pdf`) })
    if(!filepath){
      cb('canceled')
      return
    }
    cont.printToPDF({landscape:pageSettings.orientation === 1},(error, data) => {
      if (error){
        cb('not_saved')
        return
      }
      fs.writeFile(filepath, data, (error) => {
        if (error){
          cb('not_saved')
          return
        }
        cb('saved')
      })
    })
  })
})

simpleIpcFuncCb('chrome-tabs-captureVisibleTab',(tabId,options,cb)=>{
  options = options || {}
  const cont = webContents.fromTabID(tabId)
  if(cont){
    cont.capturePage(image=>{
      if(options.format == 'png'){
        cb(`data:image/png;base64,${image.toPNG().toString('base64')}`)
      }
      else{
        cb(`data:image/jpeg;base64,${image.toJPEG(options.quality || 92).toString("base64")}`)
      }
    })
  }
})

simpleIpcFuncCb('chrome-tabs-getZoom',async (tabId,cb)=>{
  const cont = tabId === null || tabId === (void 0) ? (await getFocusedWebContents()) : webContents.fromTabID(tabId)
  cb(cont.getZoomPercent()/100)
})

simpleIpcFuncCb('chrome-tabs-setZoom',async (tabId,zoomFactor,cb)=>{
  const cont = tabId === null || tabId === (void 0) ? (await getFocusedWebContents()) : webContents.fromTabID(tabId)
  cont.setZoomLevel(zoomMapping.get(cont.getZoomPercent()))
  cb()
})

const tabsEventMethods = ['onMoved','onDetached','onAttached']

for(let method of tabsEventMethods){
  const registBackgroundPages = new Set()
  const name = `chrome-tabs-${method}`
  ipcMain.on(`regist-${name}`,(e)=> registBackgroundPages.add(e.sender))
  ipcMain.on(`unregist-${name}`,(e)=> registBackgroundPages.delete(e.sender))
  ipcMain.on(`${name}-to-main`,(e,tabId,info)=>{
    for(let cont of registBackgroundPages) {
      if (!cont.isDestroyed()) {
        if(method == 'onMoved') info.windowId = BrowserWindow.fromWebContents(e.sender).id
        else if(method == 'onDetached') info.oldWindowId = BrowserWindow.fromWebContents(e.sender).id
        else if(method == 'onAttached') info.newWindowId = BrowserWindow.fromWebContents(e.sender).id
        cont.send(name, tabId, info)
      }
      else{
        registBackgroundPages.delete(cont)
      }
    }
  })
}


//#cookies
simpleIpcFuncCb('chrome-cookies-remove',(details,cb)=>{
  session.defaultSession.cookies.remove(details.url, details.name, _=>cb(details))
})

//#management
simpleIpcFunc('chrome-management-getAll',_=> Object.values(extInfos).filter(x=>x.id).map(x=>{
    x.type = 'extension'
    x = {...x,...x.manifest}
    return x
  })
)

simpleIpcFunc('chrome-management-get',id => {
  let x = extInfos[id]
  x.type = 'extension'
  x = {...x,...x.manifest}
  return x
})

ipcMain.on('chrome-management-get-sync',(e,id)=>{
  let x = extInfos[id]
  x.type = 'extension'
  x = {...x,...x.manifest}
  e.returnValue = x
})

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
  console.log(3456,details)
  let config
  if(!details || !details.value){
    config = {
      proxyRules: 'direct://'
    }
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

//#history
simpleIpcFuncCb('chrome-history-search',(query,cb)=>{
  console.log(query)
  const limit = query.maxResults || 100
  const condText = {}
  if(query.text){
    const reg = escapeRegExp(query.text)
    condText['$or'] = [{ title: reg }, { location: reg }]
  }

  const condTime = {}
  if(query.startTime || query.endTime){
    const range = {}
    if(query.startTime) range['$gte'] = query.startTime
    if(query.endTime) range['$lte'] = query.endTime
    condTime.updated_at = range
  }

  let cond = {}
  if(Object.keys(condText).length && Object.keys(condTime).length){
    cond['$and'] = [condText,condTime]
  }
  else if(Object.keys(condText).length){
    cond = condText
  }
  else if(Object.keys(condTime).length){
    cond = condTime
  }

  console.log("cond",cond)
  history.find_sort_limit([cond],[{updated_at: -1}],[limit]).then(records=>{
    console.log(records[0])
    cb(records.map(rec=>{
      return {id:rec._id,url:rec.location,title:rec.title,lastVisitTime:rec.updated_at,visitCount:rec.count,typedCount:0}
    }))
  })
  // session.defaultSession.cookies.remove(details.url, details.name, _=>cb(details))
})

simpleIpcFuncCb('chrome-history-addUrl',(details,cb)=>{
  history.findOne({location: details.url}).then(ret=>{
    if(!ret){
      history.insert({
        location: details.url,
        created_at: Date.now(),
        updated_at: Date.now(),
        count: 0
      }).then(_=>cb())
    }
    else{
      cb()
    }
  })
})

simpleIpcFuncCb('chrome-history-getVisits',async (details,cb)=>{
  if(!details.url) return cb([])
  const hist = await history.findOne({location:details.url})
  visit.find({url: details.url}).then(records=>{
    const ret = records.map(r=>{
      return {id:hist ? hist._id : r._id,visitId:r._id,visitTime:r.created_at,referringVisitId:'',transition:'link'}
    })
    cb(ret)
  })
})

simpleIpcFuncCb('chrome-history-deleteUrl',(details,cb)=>{
  if(!details.url) return cb()
  history.remove({location: details.url}, { multi: true }).then(_=>cb())
})

simpleIpcFuncCb('chrome-history-deleteRange',(details,cb)=>{
  if(!details.startTime || !details.endTime) return cb()
  history.remove({updated_at: { $gte: details.startTime ,$lte: details.endTime }}, { multi: true }).then(_=>cb())
})

simpleIpcFuncCb('chrome-history-deleteAll',(cb)=>{
  history.remove({}, { multi: true }).then(_=>cb())
})

//#downloads
simpleIpcFuncCb('chrome-downloads-download',(options,cb)=>{
  if(!options.url) return cb()
  if(options.filename) ipcMain.emit('set-save-path',null,options.url,options.filename)
  if(options.conflictAction) ipcMain.emit('set-conflictAction',null,options.url,options.conflictAction)
  if(options.saveAs) ipcMain.emit('need-set-save-filename',null,options.url,options.saveAs)
  getCurrentWindow().webContents.downloadURL(options.url,true)
  ipcMain.once('download-starting',(e,url,id)=>{
    if(url == options.url) cb(id)
  })
})

simpleIpcFuncCb('chrome-downloads-pause',(downloadId,cb)=>{
  ipcMain.emit('download-pause',null,{id:downloadId},'pause')
  cb()
})

simpleIpcFuncCb('chrome-downloads-resume',(downloadId,cb)=>{
  ipcMain.emit('download-pause',null,{id:downloadId},'resume')
  cb()
})

simpleIpcFuncCb('chrome-downloads-cancel',(downloadId,cb)=>{
  ipcMain.emit('download-cancel',null,{id:downloadId})
  cb()
})

simpleIpcFuncCb('chrome-downloads-open',(downloadId,cb)=>{
  downloader.findOne({idForExtension: downloadId}).then(ret=>{
    shell.openItem(ret.savePath)
    cb()
  })
})

simpleIpcFuncCb('chrome-downloads-show',(downloadId,cb)=>{
  downloader.findOne({idForExtension: downloadId}).then(ret=>{
    shell.showItemInFolder(ret.savePath)
    cb()
  })
})

simpleIpcFuncCb('chrome-downloads-showDefaultFolder',(cb)=>{
  shell.showItemInFolder(app.getPath('downloads'))
})

// simpleIpcFuncCb('chrome-downloads-search',(query,cb)=>{
//
// })
//
// simpleIpcFuncCb('chrome-downloads-erase',(query,cb)=>{
//
// })

//#commands
for(let method of ['onCommand']){
  const registBackgroundPages = new Map()
  const name = `chrome-commands-${method}`
  ipcMain.on(`regist-${name}`,(e,id)=> registBackgroundPages.set(e.sender,id))
  ipcMain.on(`unregist-${name}`,(e)=> registBackgroundPages.delete(e.sender))
  PubSub.subscribe('chrome-commands-exec',(msg,{id,command})=>{
    for(let [cont,id2] of registBackgroundPages) {
      if(id != id2) continue
      if (!cont.isDestroyed()) {
        if(command == '_execute_browser_action' || command == '_execute_page_action'){
          getFocusedWebContents().then(cont=>{
            ipc.send('chrome-browserAction-onClicked', id, cont.getId())
          })
        }
        else{
          cont.send(name, command)
        }
      }
      else{
        registBackgroundPages.delete(cont)
      }
    }
  })
}


//#contentSettings
const contentSettingsMap = {}
simpleIpcFuncCb('chrome-contentSettings-get',(details,extensionId,type,cb)=>{
  if(!contentSettingsMap[extensionId] || !contentSettingsMap[extensionId][type]) return cb({})

  for(let val of contentSettingsMap[extensionId][type]){
    const resource = details.resourceIdentifier ? details.resourceIdentifier.id : void 0
    const matchPrimary = nm.some(details.primaryUrl, [val.primaryPattern=='<all_urls>' ? "**" : val.primaryPattern.replace(/\*/,'**')])
    const matchSecondary = !details.secondaryUrl || nm.some(details.secondaryUrl, [val.secondaryPattern=='<all_urls>' ? "**" : val.secondaryPattern.replace(/\*/,'**')])
    const matchResource = !resource || resource == val.resourceId
    if(matchPrimary && matchSecondary && matchResource){
      return cb(val)
    }
  }
})

//#browsingData
simpleIpcFuncCb('chrome-browsingData-remove',(options,dataToRemove,cb)=>{
  if(options.since) return cb()

  const arr = ['cookies','appcache','fileSystems','indexedDB','localStorage','serviceWorkers','webSQL']
  const map = {cache: 'clearCache',downloads: 'clearDownload',formData: 'clearAutofillData', history: 'clearHistory',passwords: 'clearPassword'}

  for(let [key,val] of Object.entries(dataToRemove)){
    if(val) continue
    let args
    if(arr.includes(key)){
      args = ['clearStorageData',{storages: [key]}]
    }
    else if(map[key]){
      args = [map[key]]
    }
    if(args) ipcMain.emit('clear-browsing-data',null,...args)
  }
  cb()
})


simpleIpcFuncCb('chrome-contentSettings-set',(details,extensionId,type,cb)=>{
  if(!contentSettingsMap[extensionId]){
    contentSettingsMap[extensionId] = {}
  }
  if(!contentSettingsMap[extensionId][type]){
    contentSettingsMap[extensionId][type] = []
  }

  contentSettingsMap[extensionId][type].push({primaryPattern: details.primaryPattern,setting: details.setting})
  if(details.secondaryPattern) contentSettingsMap[extensionId][type].secondaryPattern = details.secondaryPattern
  if(details.resourceIdentifier) contentSettingsMap[extensionId][type].resourceId = details.resourceIdentifier.id

  let conf = defaultConf
  for(let val of Object.values(contentSettingsMap)){
    conf = merge(conf,val)
  }
  console.log(conf)
  session.defaultSession.userPrefs.setDictionaryPref('content_settings', conf)
  cb()
})


simpleIpcFuncCb('chrome-contentSettings-clear',(details,extensionId,type,cb)=>{
  if(!contentSettingsMap[extensionId] || !contentSettingsMap[extensionId][type]) return cb()
  delete contentSettingsMap[extensionId][type]
  cb()
})

//#browserAction
for(let method of ['onClicked']){
  const registBackgroundPages = new Set()
  const name = `chrome-browserAction-${method}`
  ipcMain.on(`regist-${name}`,(e)=> registBackgroundPages.add(e.sender))
  ipcMain.on(`unregist-${name}`,(e)=> registBackgroundPages.delete(e.sender))
  ipcMain.on(name,(e,id,tab)=>{
    for(let cont of registBackgroundPages) {
      if (!cont.isDestroyed()) {
        cont.send(name, id,tab)
      }
      else{
        registBackgroundPages.delete(cont)
      }
    }
  })
}

//#topSites
simpleIpcFuncCb('chrome-topSites-get',(cb)=>{
  history.find_sort_limit([{}],[{ count: -1 }],[50]).then(records=>{
    const ret = {}
    let i = 0
    for(let r of records){
      if(!ret[r.location]){
        ret[r.location] = r.title
        if(++i==20) break
      }
    }
    const arr = []
    for(let [url,title] of Object.entries(ret)){
      arr.push({url,title})
    }
    cb(arr)
  })
})

//#clipboard
simpleIpcFuncCb('chrome-clipboard-setImageData',(data,cb)=>{
  clipboard.writeImage(nativeImage.createFromDataURL(data))
  cb()
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
    Object.assign(properties,contextMenuVals[extensionId][menuItemId])
    delete contextMenuVals[extensionId][menuItemId]
  }
  // console.log('chrome-context-menus-create',{properties, menuItemId, icon})
  extensionMenu[extensionId].push({properties, menuItemId, icon})
})

export default extensionMenu