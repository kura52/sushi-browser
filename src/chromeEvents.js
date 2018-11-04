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
  return webContents.getAllWebContents().filter(wc=>wc.id === tabId)
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


async function extInstall(extRootPath, retry, intId, id) {
  let exePath = require("glob").sync(path.join(__dirname,'../../7zip/*/{7za,7za.exe}'))
  if(!exePath.length){
    exePath = require("glob").sync(path.join(__dirname,'../../app.asar.unpacked/resource/bin/7zip/*/{7za,7za.exe}'))
    if(!exePath.length){
      return
    }
  }

  try {
    console.log(`${extRootPath}.crx`, retry)
    if (!fs.existsSync(`${extRootPath}.crx`)) return
    clearInterval(intId)
    const ret = await exec(`"${exePath[0]}" x -y -o"${extRootPath}_crx" "${extRootPath}.crx"`)
    console.log(345, ret)
    let manifestPath = path.join(`${extRootPath}_crx`, 'manifest.json')
    if (!fs.existsSync(manifestPath)) {
      manifestPath = require("glob").sync(`${extRootPath}_crx/**/manifest.json`)[0]
    }
    const dir = path.dirname(manifestPath)

    const manifestContents = hjson.parse(removeBom(fs.readFileSync(manifestPath).toString()))
    const verPath = path.join(extRootPath, manifestContents.version)
    if(!id) id = manifestContents
    fs.mkdirSync(extRootPath)
    fs.renameSync(dir, verPath)
    if (fs.existsSync(`${extRootPath}_crx`)) {
      fs.removeSync(`${extRootPath}_crx`)
    }
    fs.unlink(`${extRootPath}.crx`, _ => _)
    if (!manifestContents.theme) {
      await chromeManifestModify(id, verPath)
    }
    extensions.loadExtension(verPath)
  } catch (e) {
    console.log(3333222, e)
  }
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

  let retry = 0
  setTimeout(_=>{
    const intId = setInterval(async _=>{
      console.log(234,global.downloadItems)
      if(retry++ > 10000) clearInterval(intId)
      if(!global.downloadItems.find(x=>x.savePath == `${extRootPath}.crx`)){
        await extInstall(extRootPath, retry, intId, id)
      }
    },300)
  },2000)
})

ipcMain.on('delete-extension',(e,extensionId,orgId)=>{
  const basePath = getPath2(orgId) || getPath1(orgId)
  extensions.disableExtension(extensionId)
  console.log(55454,extensionId,orgId)
  setTimeout(_=>{
    if(basePath){
      const delPath = path.join(basePath,'..')
      if(delPath.includes(orgId)){
        sh.rm('-rf',delPath)
      }
    }
  },1000)

})

//#app
const extInfos = require('./extensionInfos')

//#windows
simpleIpcFunc('chrome-windows-get-attributes',windowIds=>{
  return windowIds.map(windowId=>{
    const win = BrowserWindow.fromId(windowId)
    if(!win) return {}
    const state =  win.isDestroyed() ? 'normal' : win.isMinimized() ? 'minimized' : win.isMaximized() ? 'maximized' : win.isFullScreen() ? 'fullscreen' : 'normal'
    return {state,type:'normal'}
  })
})


//#tabs
simpleIpcFunc('chrome-tabs-read-file',(extensionId,file)=> {
  const basePath = getPath2(extensionId) || getPath1(extensionId)
  console.log(basePath,extensionId,file)
  return fs.readFileSync(path.join(basePath,file)).toString()
})

simpleIpcFuncCb('chrome-tabs-current-tabId',cb=>{
  getFocusedWebContents().then(cont=>cb(cont.id))
})


simpleIpcFuncCb('chrome-tabs-move',(tabIds, moveProperties,cb)=> {
  console.log('chrome-tabs-move',tabIds, moveProperties)
  if(!tabIds || !tabIds.length) return cb()

  const key = uuid.v4()
  const fromWin = BrowserWindow.fromWebContents((sharedState[tabIds[0]] || webContents.fromId(tabIds[0])).hostWebContents2)
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

simpleIpcFuncCb('chrome-tabs-duplicate',async (tabId,cb)=>{
  const key = uuid.v4()
  const fromWin = BrowserWindow.fromWebContents((sharedState[tabId] || webContents.fromId(tabId)).hostWebContents2)
  fromWin.webContents.send('chrome-tabs-duplicate',key,tabId)
  ipcMain.once(`chrome-tabs-duplicate-reply_${key}`,(e,tabId)=>{
    cb(tabId)
  })
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

simpleIpcFunc('chrome-webNavigation-getAllFrames',details=>{
  const {frameCache} = {}//require('../brave/adBlock')
  console.log(details)
  const tab = sharedState[details.tabId] || webContents.fromId(details.tabId)
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
  // if(datas[0] && datas[0].children)console.log(6664,keys[0],datas[0].id,datas[0].children.length)
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
      cont.hostWebContents2.send('restore-tabs-from-tabKey',sessionId,cont.id)
      ipcMain.once(`restore-tabs-from-tabKey-reply_${sessionId}`,(e,tabId)=>{
        cb('tab',tabId)
      })
    }
    else{

      const winStates = await windowState.findOne({key:sessionId})
      const state = await savedState.findOne({_id:winStates.id})
      const win = state.wins.find(win=>win.winState.key == sessionId)

      const key = uuid.v4()
      ipcMain.emit('open-savedState',{sender:cont.hostWebContents2},key,cont.id,win)
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


export default {extInstall, extensionPath}