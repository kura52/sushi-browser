import {ipcMain,app,dialog,BrowserWindow,shell,webContents,session,clipboard,nativeImage} from 'electron'
const BrowserWindowPlus = require('./BrowserWindowPlus')
import fs from 'fs-extra'
import sh from 'shelljs'
import PubSub from './render/pubsub'
import uuid from 'node-uuid'
const seq = require('./sequence')
const {state,favorite,history,visit,downloader,tabState,windowState,savedState} = require('./databaseFork')
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
const sharedState = require('./sharedStateMain')
const hjson = require('hjson')

const bindPath = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/bind.html'
const transLang = {eng:'en', dan:'da', dut:'nl', fin:'fi', fre:'fr', ger:'de', heb:'he', ita:'it', jpn:'ja', kor:'ko', nor:'nb', pol:'pl', por:'pt', rus:'ru', spa:'es', swe:'sv', chi:'zh', cze:'cs', gre:'el', ice:'is', lav:'lv', lit:'lt', rum:'ro', hun:'hu', est:'et', bul:'bg', scr:'hr', scc:'sr', gle:'ga', glg:'gl', tur:'tr', ukr:'uk', hin:'hi', mac:'mk', ben:'bn', ind:'id', lat:'la', may:'ms', mal:'ml', wel:'cy', nep:'ne', tel:'te', alb:'sq', tam:'ta', bel:'be', jav:'jw', oci:'oc', urd:'ur', bih:'bh', guj:'gu', tha:'th', ara:'ar', cat:'ca', epo:'eo', baq:'eu', ina:'ia', kan:'kn', pan:'pa', gla:'gd', swa:'sw', slv:'sl', mar:'mr', mlt:'mt', vie:'vi', fry:'fy', slo:'sk', fao:'fo', sun:'su', uzb:'uz', amh:'am', aze:'az', geo:'ka', tir:'ti', per:'fa', bos:'bs', sin:'si', nno:'nn', xho:'xh', zul:'zu', grn:'gn', sot:'st', tuk:'tk', kir:'ky', bre:'br', twi:'tw', yid:'yi', som:'so', uig:'ug', kur:'ku', mon:'mn', arm:'hy', lao:'lo', snd:'sd', roh:'rm', afr:'af', ltz:'lb', bur:'my', khm:'km', tib:'bo', div:'dv', ori:'or', asm:'as', cos:'co', ine:'ie', kaz:'kk', lin:'ln', mol:'mo', pus:'ps', que:'qu', sna:'sn', tgk:'tg', tat:'tt', tog:'to', yor:'yo', mao:'mi', wol:'wo', abk:'ab', aar:'aa', aym:'ay', bak:'ba', bis:'bi', dzo:'dz', fij:'fj', kal:'kl', hau:'ha', ipk:'ik', iku:'iu', kas:'ks', kin:'rw', mlg:'mg', nau:'na', orm:'om', run:'rn', smo:'sm', sag:'sg', san:'sa', ssw:'ss', tso:'ts', tsn:'tn', vol:'vo', zha:'za', lug:'lg', glv:'gv'}
const zoomMapping = new Map([
  [20,-8.9],[21,-8.6],[22,-8.4],[23,-8],[24,-7.9],[25,-7.7],[26,-7.4],[27,-7.2],[28,-7],[29,-6.8],[30,-6.6],[31,-6.5],[32,-6.3],[33,-6],[34,-5.9],[35,-5.8],[36,-5.6],[37,-5.5],[38,-5.3],[39,-5.2],[40,-5],[41,-4.9],[42,-4.8],[43,-4.6],[44,-4.5],[45,-4.4],[46,-4.3],[47,-4.1],[48,-4],[49,-3.9],[50,-3.8],[51,-3.7],[52,-3.6],[53,-3.5],[54,-3.4],[55,-3.3],[56,-3.2],[57,-3.1],[58,-3],[59,-2.9],[60,-2.8],[61,-2.7],[62,-2.6],[63,-2.5],[64,-2.49],[65,-2.4],[66,-2.3],[67,-2.2],[68,-2.1],[69,-2],[70,-1.99],[71,-1.9],[72,-1.8],[73,-1.7],[74,-1.68],[75,-1.6],[76,-1.5],[77,-1.4],[78,-1.39],[79,-1.3],[80,-1.2],[81,-1.18],[82,-1.1],[83,-1],[84,-0.98],[85,-0.9],[86,-0.8],[87,-0.79],[88,-0.7],[89,-0.67],[90,-0.6],[91,-0.5],[92,-0.48],[93,-0.4],[94,-0.36],[95,-0.3],[96,-0.2],[97,-0.19],[98,-0.1],[99,-0.08],[100,0],[101,0.08],[102,0.1],[103,0.18],[104,0.2],[105,0.29],[106,0.3],[107,0.39],[108,0.4],[109,0.49],[110,0.5],[111,0.59],[112,0.6],[113,0.69],[114,0.7],[115,0.79],[116,0.8],[117,0.88],[118,0.9],[119,0.97],[120,1],[121,1.06],[122,1.1],[123,1.15],[124,1.2],[125,1.24],[126,1.28],[127,1.3],[128,1.37],[129,1.4],[130,1.46],[131,1.5],[132,1.54],[133,1.58],[134,1.6],[135,1.66],[136,1.7],[137,1.74],[138,1.78],[139,1.8],[140,1.86],[141,1.9],[142,1.94],[143,1.98],[144,2],[145,2.05],[146,2.09],[147,2.1],[148,2.16],[149,2.2],[150,2.24],[151,2.27],[152,2.3],[153,2.35],[154,2.38],[155,2.4],[156,2.45],[157,2.49],[158,2.5],[159,2.56],[160,2.59],[161,2.6],[162,2.66],[163,2.69],[164,2.7],[165,2.76],[166,2.79],[167,2.8],[168,2.86],[169,2.89],[170,2.9],[171,2.95],[172,2.99],[173,3],[174,3.05],[175,3.08],[176,3.1],[177,3.14],[178,3.17],[179,3.2],[180,3.23],[181,3.26],[182,3.29],[183,3.3],[184,3.35],[185,3.38],[186,3.4],[187,3.44],[188,3.47],[189,3.5],[190,3.53],[191,3.56],[192,3.59],[193,3.6],[194,3.64],[195,3.67],[196,3.7],[197,3.73],[198,3.76],[199,3.78],[200,3.8],[201,3.84],[202,3.86],[203,3.89],[204,3.9],[205,3.95],[206,3.97],[207,4],[208,4.03],[209,4.05],[210,4.08],[211,4.1],[212,4.13],[213,4.16],[214,4.18],[215,4.2],[216,4.23],[217,4.26],[218,4.28],[219,4.3],[220,4.33],[221,4.36],[222,4.38],[223,4.4],[224,4.43],[225,4.45],[226,4.48],[227,4.5],[228,4.53],[229,4.55],[230,4.58],[231,4.6],[232,4.62],[233,4.65],[234,4.67],[235,4.69],[236,4.7],[237,4.74],[238,4.76],[239,4.79],[240,4.8],[241,4.83],[242,4.85],[243,4.88],[244,4.9],[245,4.92],[246,4.94],[247,4.97],[248,4.99],[249,5],[250,5.03],[251,5.05],[252,5.08],[253,5.1],[254,5.12],[255,5.14],[256,5.16],[257,5.18],[258,5.2],[259,5.23],[260,5.25],[261,5.27],[262,5.29],[263,5.3],[264,5.33],[265,5.35],[266,5.37],[267,5.39],[268,5.4],[269,5.43],[270,5.45],[271,5.47],[272,5.49],[273,5.5],[274,5.53],[275,5.55],[276,5.57],[277,5.59],[278,5.6],[279,5.63],[280,5.65],[281,5.67],[282,5.69],[283,5.7],[284,5.73],[285,5.75],[286,5.77],[287,5.79],[288,5.8],[289,5.83],[290,5.84],[291,5.86],[292,5.88],[293,5.9],[294,5.92],[295,5.94],[296,5.96],[297,5.97],[298,5.99],[299,6],[300,6.03],[301,6.05],[302,6.07],[303,6.08],[304,6.1],[305,6.12],[306,6.14],[307,6.16],[308,6.17],[309,6.19],[310,6.2],[311,6.23],[312,6.24],[313,6.26],[314,6.28],[315,6.3],[316,6.31],[317,6.33],[318,6.35],[319,6.37],[320,6.38],[321,6.4],[322,6.42],[323,6.43],[324,6.45],[325,6.47],[326,6.48],[327,6.5],[328,6.52],[329,6.54],[330,6.55],[331,6.57],[332,6.58],[333,6.6],[334,6.62],[335,6.63],[336,6.65],[337,6.67],[338,6.68],[339,6.7],[340,6.72],[341,6.73],[342,6.75],[343,6.76],[344,6.78],[345,6.8],[346,6.81],[347,6.83],[348,6.84],[349,6.86],[350,6.87],[351,6.89],[352,6.9],[353,6.92],[354,6.94],[355,6.95],[356,6.97],[357,6.98],[358,7],[359,7.01],[360,7.03],[361,7.04],[362,7.06],[363,7.07],[364,7.09],[365,7.1],[366,7.12],[367,7.13],[368,7.15],[369,7.16],[370,7.18],[371,7.19],[372,7.2],[373,7.22],[374,7.24],[375,7.25],[376,7.27],[377,7.28],[378,7.3],[379,7.31],[380,7.32],[381,7.34],[382,7.35],[383,7.37],[384,7.38],[385,7.4],[386,7.41],[387,7.42],[388,7.44],[389,7.45],[390,7.47],[391,7.48],[392,7.49],[393,7.5],[394,7.52],[395,7.54],[396,7.55],[397,7.56],[398,7.58],[399,7.59],[400,7.6],[401,7.62],[402,7.63],[403,7.65],[404,7.66],[405,7.67],[406,7.69],[407,7.7],[408,7.71],[409,7.73],[410,7.74],[411,7.75],[412,7.77],[413,7.78],[414,7.79],[415,7.8],[416,7.82],[417,7.83],[418,7.85],[419,7.86],[420,7.87],[421,7.89],[422,7.9],[423,7.91],[424,7.92],[425,7.94],[426,7.95],[427,7.96],[428,7.98],[429,7.99],[430,8],[431,8.01],[432,8.03],[433,8.04],[434,8.05],[435,8.06],[436,8.08],[437,8.09],[438,8.1],[439,8.12],[440,8.13],[441,8.14],[442,8.15],[443,8.16],[444,8.18],[445,8.19],[446,8.2],[447,8.21],[448,8.23],[449,8.24],[450,8.25],[451,8.26],[452,8.27],[453,8.29],[454,8.3],[455,8.31],[456,8.32],[457,8.34],[458,8.35],[459,8.36],[460,8.37],[461,8.38],[462,8.39],[463,8.4],[464,8.42],[465,8.43],[466,8.44],[467,8.45],[468,8.47],[469,8.48],[470,8.49],[471,8.5],[472,8.51],[473,8.52],[474,8.54],[475,8.55],[476,8.56],[477,8.57],[478,8.58],[479,8.59],[480,8.6],[481,8.62],[482,8.63],[483,8.64],[484,8.65],[485,8.66],[486,8.67],[487,8.68],[488,8.69],[489,8.7],[490,8.72],[491,8.73],[492,8.74],[493,8.75],[494,8.76],[495,8.77],[496,8.78],[497,8.79],[498,8.8],[499,8.82],[500,8.83]
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
  console.log(url,`${extRootPath}.crx`,getCurrentWindow().webContents.getURL())
  ipcMain.emit('noneed-set-save-filename',null,url)
  ipcMain.emit('set-save-path', null,url, `${extRootPath}.crx`,true)
  e.sender.downloadURL(url)

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
      if(retry++ > 10000) clearInterval(intId)
      if(!global.downloadItems.find(x=>x.savePath == `${extRootPath}.crx`)){
        try{
          console.log(`${extRootPath}.crx`,retry)
          if(!fs.existsSync(`${extRootPath}.crx`)) return
          clearInterval(intId)
          const ret = await exec(`"${exePath[0]}" x -y -o"${extRootPath}_crx" "${extRootPath}.crx"`)
          console.log(345,ret)
          let manifestPath = path.join(`${extRootPath}_crx`,'manifest.json')
          if (!fs.existsSync(manifestPath)) {
            manifestPath = require("glob").sync(`${extRootPath}_crx/**/manifest.json`)[0]
          }
          const dir = path.dirname(manifestPath)

          const manifestContents = hjson.parse(removeBom(fs.readFileSync(manifestPath).toString()))
          const verPath = path.join(extRootPath,manifestContents.version)
          fs.mkdirSync(extRootPath)
          fs.renameSync(dir, verPath)
          if(fs.existsSync(`${extRootPath}_crx`)){
            fs.removeSync(`${extRootPath}_crx`)
          }
          fs.unlink(`${extRootPath}.crx`,_=>_)
          if(!manifestContents.theme){
            await chromeManifestModify(id,verPath)
          }
          extensions.loadExtension(session.defaultSession,id,verPath,void 0,void 0,true)
        }catch(e){
          console.log(3333222,e)
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


// for(let method of ['onMessage']){
//   const registBackgroundPages = new Map()
//   const name = `browser-runtime-webext-${method}`
//   ipcMain.on(`regist-${name}`,(e,id)=> registBackgroundPages.set(e.sender,id))
//   ipcMain.on(`unregist-${name}`,(e)=> registBackgroundPages.delete(e.sender))
//   ipcMain.on(`browser-message-webext`,(e,key,appId,message,sender)=>{
//     for(let [cont,id] of registBackgroundPages) {
//       // console.log(name, key, message, sender,id,appId)
//       if (cont.isDestroyed()) {
//         registBackgroundPages.delete(cont)
//         continue
//       }
//       if(id != appId || (e.sender.getId() === cont.getId() && !sender.tab)) continue
//       // console.log(name, key, message, sender)
//       ipcMain.once(`browser-message-webext-reply-bg_${key}`,(e2,valid,val)=>{
//         if(valid){
//           e.sender.send(`browser-message-webext-reply_${key}`,val)
//         }
//       })
//       if(sender.content) sender.tabId = e.sender.getId()
//       cont.send(name, key, message, sender)
//     }
//   })
// }

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
    event.returnValue = hjson.parse(removeBom(fs.readFileSync(localePath)))
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
        }
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


simpleIpcFunc('chrome-windows-remove',windowId=> {
  const win = windowId ? BrowserWindow.fromId(windowId) : BrowserWindow.getFocusedWindow()
  win && win.close()
})

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
  const cont = (sharedState[tabId] || webContents.fromTabID(tabId))
  if(cont && !cont.isDestroyed() && !cont.isBackgroundPage() && cont.isGuest()) {
    if(cont.hostWebContents) cont.hostWebContents.send('chrome-tabs-event', {tabId,changeInfo}, 'updated')
  }
})

process.on('chrome-tabs-updated-from-extension', (tabId) => {
  // console.log(tabId,tab)
  const cont = (sharedState[tabId] || webContents.fromTabID(tabId))
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
  const cont = tabId === null || tabId === (void 0) ? (await getFocusedWebContents()) : (sharedState[tabId] || webContents.fromTabID(tabId))
  reloadProperties ? cont.reloadIgnoringCache() : cont.reload()
  cb()
})

simpleIpcFuncCb('chrome-tabs-move',(tabIds, moveProperties,cb)=> {
  console.log('chrome-tabs-move',tabIds, moveProperties)
  if(!tabIds || !tabIds.length) return cb()

  const key = uuid.v4()
  const fromWin = BrowserWindow.fromWebContents((sharedState[tabIds[0]] || webContents.fromTabID(tabIds[0])).hostWebContents)
  if(moveProperties.windowId && fromWin.id !== moveProperties.windowId){
    const toWin = BrowserWindow.fromId(moveProperties.windowId)
    fromWin.webContents.send('chrome-tabs-move-detach',key,tabIds,moveProperties.windowId)
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
  (sharedState[tabId] || webContents.fromTabID(tabId)).executeScriptInTab('dckpbojndfoinamcdamhkjhnjnmjkfjd',
    `document.documentElement.innerText`,{},
    (err, url, result) => cb(transLang[franc(result[0])] || 'en')
  )
})

simpleIpcFuncCb('chrome-tabs-insertCSS',async (extensionId,tabId,details,cb)=>{
  const cont = tabId === null || tabId === (void 0) ? (await getFocusedWebContents()) : (sharedState[tabId] || webContents.fromTabID(tabId))
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
  const fromWin = BrowserWindow.fromWebContents((sharedState[tabId] || webContents.fromTabID(tabId)).hostWebContents)
  fromWin.webContents.send('chrome-tabs-duplicate',key,tabId)
  ipcMain.once(`chrome-tabs-duplicate-reply_${key}`,(e,tabId)=>{
    cb(tabId)
  })
})


simpleIpcFuncCb('chrome-tabs-saveAsPDF',async (pageSettings,cb)=>{
  getFocusedWebContents().then(cont=> {
    const filepath = dialog.showDialog(BrowserWindow.fromWebContents(cont.hostWebContents),
      {
        defaultPath: path.join(app.getPath('downloads'), `${cont.getTitle()}.pdf`),
        type: 'select-saveas-file',
        extensions: [['pdf']]
      },filepaths=>{
        if (!filepaths || filepaths.length > 1) {
          cb('canceled')
          return
        }
        cont.printToPDF({landscape: pageSettings.orientation === 1}, (error, data) => {
          if (error) {
            cb('not_saved')
            return
          }
          fs.writeFile(filepaths[0], data, (error) => {
            if (error) {
              cb('not_saved')
              return
            }
            cb('saved')
          })
        })
      })
  })
})

simpleIpcFuncCb('chrome-tabs-captureVisibleTab',(tabId,options,cb)=>{
  options = options || {}
  const cont = (sharedState[tabId] || webContents.fromTabID(tabId))
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
  const cont = tabId === null || tabId === (void 0) ? (await getFocusedWebContents()) : (sharedState[tabId] || webContents.fromTabID(tabId))
  cb(cont.getZoomPercent()/100)
})

simpleIpcFuncCb('chrome-tabs-setZoom',async (tabId,zoomFactor,cb)=>{
  const cont = tabId === null || tabId === (void 0) ? (await getFocusedWebContents()) : (sharedState[tabId] || webContents.fromTabID(tabId))
  cont.setZoomLevel(zoomMapping.get(parseInt(parseFloat(zoomFactor))))
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
simpleIpcFunc('chrome-webNavigation-getAllFrames',details=>{
  const {frameCache} = require('../brave/adBlock')
  console.log(details)
  const tab = sharedState[details.tabId] || webContents.fromTabID(details.tabId)
  const url = tab.getURL()
  const ret = [{errorOccurred: false, frameId: 0, parentFrameId: -1, processId: 1, url}]
  const arr = frameCache.get(url) || []
  for(let x of arr){
    if(x.tabId == details.tabId){
      console.log(x)
      ret.push({errorOccurred: false, frameId: x.frameId, parentFrameId: 0, processId: 1, url: x.url})
    }
  }
  return ret
})



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

function makeDownloadItem(item){
  return {
    id: item.idForExtension,
    url: item.orgUrl,
    finalUrl: item.url,
    referrer: null,
    filename: item.savePath,
    incognito: false,
    danger: 'safe',
    mime: item.mimeType,
    startTime: new Date(item.created_at).toISOString(),
    endTime: item.ended && new Date(item.ended).toISOString(),
    estimatedEndTime: item.est_end && new Date(item.est_end).toISOString(),
    state: item.state == 'completed' ? 'complete' : item.state == 'progressing' ? 'in_progress' : 'interrupted',
    paused: item.isPaused,
    canResume: true,
    error: null,
    bytesReceived: item.receivedBytes,
    totalBytes: item.totalBytes,
    fileSize: item.totalBytes,
    exists: true,
    byExtensionId: null,
    byExtensionName: null
  }
}

function parseOrderBy(orderBy,trans){
  if(!orderBy) return {created_at: -1}

  if(!Array.isArray(orderBy)) orderBy = [orderBy]

  const ret = {}
  orderBy.forEach(x=>{
    if(!trans[x]) return
    ret[trans[x]] = x[0]=='-' ? -1 : 1
  })

  return ret
}

function getDLState(state){
  if(state == "complete") return 'completed'
  else if(state == "in_progress") return 'progressing'
  else if(state == "interrupted") return { $or: ['cancelled','cancelled'] }
  else { return void 0}
}


const transDL = {
  id: "idForExtension",
  url: "orgUrl",
  finalUrl: "url",
  filename: "savePath",
  startTime: "created_at",
  endTime: "ended",
  estimatedEndTime: "est_end",
  mime: "mimeType",
  state: "state",
  paused: "isPaused",
  bytesReceived: "receivedBytes",
  totalBytes: "totalBytes",
  fileSize: "totalBytes"
}

function makeDLCond(query){
  let cond = []

  if(query.query){
    const reg = new RegExp(escapeRegExp(query.query))
    cond.push({$or: [{filename: reg},{url: reg},{orgUrl: reg}]})
  }

  if(query.startedBefore) cond.push({created_at: { $lte: Date.parse(query.startedBefore)}})
  if(query.startedAfter) cond.push({created_at: { $gte: Date.parse(query.startedAfter)}})
  if(query.startTime) cond.push({created_at: Date.parse(query.startTime)})

  if(query.endedBefore) cond.push({ended: { $lte: Date.parse(query.endedBefore)}})
  if(query.endedAfter) cond.push({ended: { $gte: Date.parse(query.endedAfter)}})
  if(query.endTime) cond.push({ended: Date.parse(query.endTime)})

  if(query.totalBytesLess) cond.push({totalBytes: { $lte: Date.parse(query.totalBytesLess)}})
  if(query.totalBytesGreater) cond.push({totalBytes: { $gte: Date.parse(query.totalBytesGreater)}})
  if(query.totalBytes) cond.push({totalBytes: Date.parse(query.totalBytes)})
  if(query.fileSize) cond.push({totalBytes: Date.parse(query.fileSize)})

  if(query.filenameRegex) cond.push({savePath: new RegExp(query.filenameRegex)})
  if(query.filename) cond.push({savePath: query.filename})

  if(query.urlRegex) cond.push({orgUrl: new RegExp(query.urlRegex)})
  if(query.url) cond.push({orgUrl: query.url})

  if(query.finalUrlRegex) cond.push({url: new RegExp(query.finalUrlRegex)})
  if(query.finalUrl) cond.push({url: query.finalUrl})

  if(query.id) cond.push({idForExtension: query.id})
  if(query.mime) cond.push({mimeType: query.mime})
  if(query.state) cond.push({state: getDLState(query.state)})
  if(query.paused) cond.push({isPaused: query.paused})
  if(query.bytesReceived) cond.push({receivedBytes: query.bytesReceived})

  cond = !cond.length ? {} : cond.length == 1 ? cond[0] : {$and : cond}
  return cond
}

simpleIpcFuncCb('chrome-downloads-search',(query,cb)=>{
  const cond = makeDLCond(query)
  console.log(cond)
  let promise
  if(query.limit === 0){
    promise = downloader.find_sort([cond],[parseOrderBy(query.orderBy,transDL)])
  }
  else{
    const limit = query.limit || 1000
    promise = downloader.find_sort_limit([cond],[parseOrderBy(query.orderBy,transDL)],[limit])
  }
  promise.then(rets=>{
    cb(rets.map(makeDownloadItem))
  })
})

simpleIpcFuncCb('chrome-downloads-erase',(query,cb)=>{
  const cond = makeDLCond(query)
  let promise
  if(query.limit === 0){
    promise = downloader.find_sort([cond],[parseOrderBy(query.orderBy,transDL)])
  }
  else{
    const limit = query.limit || 1000
    promise = downloader.find_sort_limit([cond],[parseOrderBy(query.orderBy,transDL)],[limit])
  }
  promise.then(rets=>{
    const _ids = rets.map(item=>item._id)
    const ids = rets.map(item=>item.idForExtension)
    downloader.remove({_id: {$in : ids}}, { multi: true }).then(ret2=>{
      cb(ids)
    })
  })

})

//#bookmarks
async function getFavoriteParentIdAndIndex(key){
  // console.log(44422,key)
  let rec = await favorite.findOne({children:{$elemMatch: key}})
  if(!rec){
    rec =  await favorite.findOne({key:'root'})
    return [rec.key,rec.length]
  }
  const index = rec.children.findIndex(x=>x === key)
  return [rec.key,index]
}


async function getBookmarks(idOrIdList, cb){
  if(!Array.isArray(idOrIdList)) idOrIdList = [idOrIdList]
  const ret = []
  for(let id of idOrIdList){
    if(!id || id === '0') id = 'root'
    const [parentId,index] = await getFavoriteParentIdAndIndex(id)
    const x = await favorite.findOne({key:id})
    const data = {id:x.key == 'root' ? '0' : x.key, url:x.url,index,title:x.title,dateAdded:x.created_at}
    if(parentId !== void 0) data.parentId = parentId == 'root' ? '0' : parentId
    if(!x.is_file) data.dateGroupModified = x.updated_at
    ret.push(data)
  }
  if(cb) cb(ret)
  else{ return ret }
}

function modifyRoot(root){
  const rootFiles = {id:'1',title:'Root',dateAdded:root.created_at,dateGroupModified: root.updated_at,parentId:'0',children: []}
  const newChildren = []
  let i = 0,j = 0
  for(let child of root.children){
    if(child.url){
      child.parentId = '1'
      child.index = i++
      rootFiles.children.push(child)
    }
    else{
      child.index = j++
      newChildren.push(child)
    }
  }
  rootFiles.index = j
  newChildren.push(rootFiles)
  root.children = newChildren
}

async function recurGet(parentId,keys,count=99999999){
  keys = keys.map(x=>!x || x === '0' ? 'root' : x)
  const ret = await favorite.find({key:{$in: keys}})
  const datas = []
  const promises = []
  keys.forEach((key,i)=>{
    const x = ret.find(x=>x.key == key)
    if(!x) return
    const index = i
    const data = {id:x.key == 'root' ? '0' : x.key ,url:x.url,index,title:x.title,dateAdded:x.created_at}
    if(parentId !== void 0) data.parentId = parentId == 'root' ? '0' : parentId
    if(x.is_file){
      data.type = 'bookmark'
    }
    else{
      data.type = 'folder'
      data.dateGroupModified = x.updated_at
    }

    if(x.children && count > 0){
      promises.push(recurGet(x.key,x.children,count--))
    }
    else{
      promises.push(false)
    }
    datas.push(data)
  })
  const rets = await Promise.all(promises)
  rets.map((ret,i)=>{
    if(ret) datas[i].children = ret
  })

  // if(keys[0] == 'root'){
  //   modifyRoot(datas[0])
  // }
  if(datas[0] && datas[0].children)console.log(6664,keys[0],datas[0].id,datas[0].children.length)
  return datas
}

simpleIpcFuncCb('chrome-bookmarks-get',getBookmarks)

simpleIpcFuncCb('chrome-bookmarks-getChildren',(id, cb)=>{
  recurGet(void 0, [id], 1).then(ret=>cb(ret[0].children))
})

simpleIpcFuncCb('chrome-bookmarks-getRecent',(numberOfItems, cb)=>{
  favorite.find_sort_limit([{}],[{ updated_at: -1 }],[numberOfItems]).then(ret=>getBookmarks(ret.map(x=>x.key)).then(val=>cb(val)))
})

simpleIpcFuncCb('chrome-bookmarks-getTree',(cb)=>{
  recurGet(void 0, ['root']).then(ret=>{cb(ret)})
})

simpleIpcFuncCb('chrome-bookmarks-getSubTree',(id, cb)=>{
  recurGet(void 0, [id]).then(ret=>cb(ret))
})

simpleIpcFuncCb('chrome-bookmarks-search',(query, cb)=>{
  if(typeof query == "string") query = { query }

  let cond = []
  if(query.query){
    const reg = new RegExp(escapeRegExp(query.query))
    cond.push({$or: [{title: reg},{url: reg}]})
  }

  if(query.title) cond.push({title: query.title})
  if(query.url) cond.push({url: query.url})

  cond = !cond.length ? {} : cond.length == 1 ? cond[0] : {$and : cond}
  favorite.find(cond).then(ret=>getBookmarks(ret.map(x=>x.key)).then(val=>cb(val)))
})

async function bookmarkInsert(bookmark, cb){
  const buildItem = ({id,url,title,index,parentId,now})=>{
    if(parentId == 'root') parentId = '0'
    const data = {id,index,parentId,title,dateAdded: now, dateGroupModified: now}
    if(url) data.url = url
    return data
  }

  const key = uuid.v4(), now = Date.now()
  if(!bookmark.parentId) bookmark.parentId = 'root'

  const data = {key,title:bookmark.title,is_file:!!bookmark.url,created_at: now, updated_at: now}
  if(bookmark.url) data.url = bookmark.url
  else{ data.children = [] }

  const ret = await favorite.findOne({ key: bookmark.parentId })
  if(!ret) cb()

  const ins = await favorite.insert(data)
  if(bookmark.index === void 0){
    ret.children.push(key)
    bookmark.index = ret.children.length
  }
  else{
    ret.children.splice(bookmark.index,0,key)
  }
  const upd = await favorite.update({ key: bookmark.parentId }, { $set:{children:ret.children, updated_at: now} })
  cb(buildItem({...bookmark,now}))
}
simpleIpcFuncCb('chrome-bookmarks-create',bookmarkInsert)

simpleIpcFuncCb('chrome-bookmarks-move',async (id, destination, cb)=>{
  console.log('move',id,destination)
  const [parentId,index] = await getFavoriteParentIdAndIndex(id)

  //insert
  let now = Date.now
  if(!destination.parentId) destination.parentId = 'root'
  const ret = await favorite.findOne({ key: destination.parentId })
  if(!ret) return

  if(destination.index === void 0){
    ret.children.push(id)
    destination.index = ret.children.length
  }
  else{
    ret.children.splice(destination.index,0,id)
  }
  const upd = await favorite.update({ key: destination.parentId }, { $set:{children:ret.children, updated_at: now} })

  if(upd > 0){
    //remove
    const upd = await favorite.update({ key: parentId }, { $pull: { children: id }, $set:{updated_at: Date.now()} })
  }

})

simpleIpcFuncCb('chrome-bookmarks-update',(id, changes, cb)=>{
  favorite.update({ key: id }, { $set: {...changes,updated_at: Date.now()}}).then(ret2=>{
    getBookmarks(id).then(val=>cb(val[0]))
  })
})

simpleIpcFuncCb('chrome-bookmarks-remove', (id, cb)=>{
  favorite.findOne({ key: id }).then(async ret=>{
    if(ret.is_file || !ret.children.length){
      const [parentId,index] = await getFavoriteParentIdAndIndex(id)
      favorite.remove({key: id},).then(ret2=>{
        favorite.update({ key: parentId }, { $pull: { children: id }, $set:{updated_at: Date.now()} }).then(_=>cb())
      })
    }
  })
})

simpleIpcFuncCb('chrome-bookmarks-removeTree',async (id, cb)=>{
  const [parentId,index] = await getFavoriteParentIdAndIndex(id)
  ipcMain.emit('delete-favorite',null,"1",[id],[parentId])
  cb()
})

async function getTabStates(limit){
  const recs = await tabState.find_sort_limit([{close:1}],[{updated_at: -1}],[limit])
  const result = []
  for(let rec of recs){
    const ind = rec.currentIndex
    const title = rec.titles.split("\t")[ind]
    const url = rec.urls.split("\t")[ind]
    result.push({
      active:rec.active,
      audible:false,
      autoDiscardable:true,
      discarded:false,
      highlighted:rec.active,
      id:rec.id,
      incognito:false,
      index:rec.index,
      openerTabId:rec.openerTabId,
      pinned:rec.pinned,
      selected:rec.active,
      title,
      url,
      windowId:rec.windowId,
      sessionId:rec.tabKey,
      lastAccessed:rec.updated_at
    })
  }
  return result
}
function allKeys(node,arr){
  if(node.l){
    if (node.l.tabs) {
      if(node.l) arr.push(...node.l.tabs.map(x=>x.tabKey))
    }
    else{
      allKeys(node.l,arr)
    }
  }
  if(node.r){
    if (node.r.tabs) {
      if(node.r) arr.push(...node.r.tabs.map(x=>x.tabKey))
    }
    else{
      allKeys(node.r,arr)
    }
  }
  return arr
}

async function getWindowStates(limit){
  const winStates = await windowState.find_sort_limit([{close:1}],[{updated_at: -1}],[limit])
  const keys = winStates.map(x=>x.id)
  const states = await savedState.find({_id:{$in:keys}})

  const result = []
  for(let wState of winStates){
    const state = states.find(x=>x._id == wState.id)
    if(!state) continue
    const win = state.wins.find(win=>win.winState.key == wState.key)
    const keys2 = allKeys(win.winState,[])
    console.log(win.winState,keys2)
    const tabRecs = await tabState.find({tabKey:{$in:keys2}})
    const tabs = []
    for(let rec of tabRecs){
      const ind = rec.currentIndex
      const title = rec.titles.split("\t")[ind]
      const url = rec.urls.split("\t")[ind]
      tabs.push({
        active:rec.active,
        audible:false,
        autoDiscardable:true,
        discarded:false,
        highlighted:rec.active,
        id:rec.id,
        incognito:false,
        index:rec.index,
        openerTabId:rec.openerTabId,
        pinned:rec.pinned,
        selected:rec.active,
        title,
        url,
        windowId:rec.windowId,
        sessionId:rec.tabKey,
        lastAccessed:rec.updated_at
      })
    }

    if(tabs.length > 1){
      result.push({
        alwaysOnTop:false,
        focused:false,
        incognito:false,
        sessionId:wState.key,
        state:"normal",
        tabs,
        type:"normal",
        lastAccessed:winStates[0].updated_at
      })
    }
    else if(tabs[0]){
      result.push(tabs[0])
    }
  }

  return result
}

//#sessions

async function getRecentlyClosed(filter, cb){
  const limit = (filter && filter.maxResults) || 25
  const tabs = await getTabStates(limit)
  const windows = await getWindowStates(limit)

  tabs.push(...windows)
  tabs.sort((a,b)=> b.lastAccessed - a.lastAccessed)

  const set = new Set()
  const result = []

  for(let e of tabs){
    if(set.has(e.sessionId)) continue

    if(e.tabs){
      result.push({lastModified: e.lastAccessed,window: e})
      set.add(e.sessionId)
    }
    else{
      result.push({lastModified: e.lastAccessed,tab: e})
      set.add(e.sessionId)
    }
  }
  cb(result.slice(0,limit))
}

simpleIpcFuncCb('chrome-sessions-getRecentlyClosed',getRecentlyClosed)

simpleIpcFuncCb('chrome-sessions-restore', async (sessionId, cb)=>{
  if(!sessionId){
    const recent1 = await new Promise((resolve)=> getRecentlyClosed({maxResults:1},resolve))
    sessionId = recent1[0] && ((recent1[0].tab || recent1[0].window).sessionId)
  }
  getFocusedWebContents().then(async cont=>{
    if(sessionId.match(/^\d+_/)){
      cont.hostWebContents.send('restore-tabs-from-tabKey',sessionId,cont.getId())
      ipcMain.once(`restore-tabs-from-tabKey-reply_${sessionId}`,(e,tabId)=>{
        cb('tab',tabId)
      })
    }
    else{

      const winStates = await windowState.findOne({key:sessionId})
      const state = await savedState.findOne({_id:winStates.id})
      const win = state.wins.find(win=>win.winState.key == sessionId)

      const key = uuid.v4()
      ipcMain.emit('open-savedState',{sender:cont.hostWebContents},key,cont.getId(),win)
      ipcMain.once(`open-savedState-reply_${key}`,_=>{
        cb('window') //@TODO
      })
    }
  })
})

// simpleIpcFuncCb('browser-sessions-setTabValue', async (tabId, key, value, cb)=>{})
// simpleIpcFuncCb('browser-sessions-getTabValue', async (tabId, key, cb)=>{})
// simpleIpcFuncCb('browser-sessions-removeTabValue', async (tabId, key, cb)=>{})
// simpleIpcFuncCb('browser-sessions-setWindowValue', async (windowId, key, value, cb)=>{})
// simpleIpcFuncCb('browser-sessions-getWindowValue', async (windowId, key, cb)=>{})
// simpleIpcFuncCb('browser-sessions-removeWindowValue', async (windowId, key, cb)=>{})

//#sidebar
simpleIpcFuncCb('chrome-sidebarAction-open',async (id, cb)=>{
  const url = `chrome-extension://${id}/${extInfos[id].manifest.sidebar_action.default_panel}`
  getCurrentWindow().webContents.send('open-fixed-panel',url)
})

simpleIpcFuncCb('chrome-sidebarAction-close',async (id, cb)=>{
  const url = `chrome-extension://${id}/${extInfos[id].manifest.sidebar_action.default_panel}`
  getCurrentWindow().webContents.send('close-fixed-panel',url)
})

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
            cont.send('chrome-browserAction-onClicked', id, cont.getId())
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