import {ipcMain, app, BrowserWindow} from 'electron'
import {webContents, BrowserView} from './remoted-chrome/Browser'
import fs from 'fs'
import path from 'path'
import { favicon,history,image,sock } from './databaseFork'
import uuid from 'node-uuid'
import mainState from './mainState'
const underscore = require('underscore')
const Jimp = require('jimp')
import {getFocusedWebContents} from './util'
const LRUCache = require('lru-cache')
// require('locus')


const resourcePath = path.join(app.getPath('userData'),'resource')
const capturePath = path.join(resourcePath,'capture')
if (!fs.existsSync(capturePath)) {
  fs.mkdirSync(capturePath)
}

async function captureCurrentPage(_id,pageUrl,loc,base64,sender,tabId,noActiveSkip){
  const cont = tabId ? webContents.fromId(tabId) : (await getFocusedWebContents())
  // eval(locus)
  if(cont){
    if(base64){
      cont.capturePage((imageBuffer)=>{
        sender.send(`take-capture-reply_${base64}`,`data:image/jpeg;base64,${imageBuffer && imageBuffer.toJPEG(parseInt(mainState.tabPreviewQuality)).toString("base64")}`,imageBuffer && imageBuffer.getSize())
      },noActiveSkip)
      return
    }

    const url = cont.getURL()
    console.log(tabId,url,pageUrl,loc)
    if(url != pageUrl && url != loc) return

    const title = await cont.getTitle()
    const doc = await image.findOne({url:pageUrl})
    const d = Date.now()

    console.log(3,doc)
    if(doc){
      const capturedDate = doc.updated_at
      if(d - capturedDate < 1000* 60 * 60 * 24 * 30) return
    }

    const id = uuid.v4()
    console.log(2,id,url,pageUrl,loc)

    cont.capturePage((imageBuffer)=>{
      if(!imageBuffer) return

      const filePath = path.join(capturePath,`${id}.jpg`)
      fs.writeFile(filePath, imageBuffer.toJPEG(80), function(err) {
        if (err) {
          console.log("ERROR Failed to save file", err);
        }

        sock.send({key:id, path: filePath},msg=>{
          if(doc){
            image.update({url:pageUrl}, {$set:{path:`${id}.jpg`, title: title, updated_at: d}})
            console.log(4)
          }
          else{
            image.insert({url:pageUrl, path:`${id}.jpg`, title: title, created_at: d, updated_at: d})
            console.log(5)
          }
          history.update({_id},{$set:{capture:`${id}.jpg`, updated_at: d}}).then(()=>{
            if(typeof noActiveSkip === 'string') sender.send(`take-capture-reply_${noActiveSkip}`)
          })
        })
      })
    },noActiveSkip);

  }
}



async function getFavicon(){
  const favicons = await favicon.find_limit([{$and: [{data: { $exists: false }},{status: { $exists: false}}]}],[20])
  for(let favi of favicons){
    const url = favi.url
    if(url == 'loading') continue
    faviconUpdate(url);
  }
}

function faviconUpdate(url) {
  if (url == 'loading') return
  sock.send({favicon: url})
}

const captures = {}
let imgCache = new LRUCache(200)
global.viewCache = {}
ipcMain.on('take-capture', async (event,{id,url,loc,base64,tabId,tabIds,noActiveSkip}) => {
  console.log('take-capture',url,noActiveSkip)
  if(!base64){
    if(captures[url]) return
    captures[url] = true
  }
  if(tabIds){
    const results = []
    for(let tabId of tabIds){
      const cont = webContents.fromId(tabId)
      if(!cont || cont.isDestroyed()) continue

      const win = BrowserWindow.fromWebContents(event.sender)
      // const winId = win.id
      // const viewId = view.id
      // if(global.winViewMap[winId] != viewId){
      //   const seq = viewId + 100000
      //   win.insertBrowserView(view, seq)
      //   global.viewCache[seq] = winId
      //   win.reorderBrowserView(seq, 0)
      // }
      const img = await new Promise(r=>{
        cont.capturePage((imageBuffer)=>{
          r(imageBuffer ?
            [tabId,imageBuffer,imageBuffer.getSize(), Math.random().toString(),imageBuffer.resize({width:100,quality: 'good'}).toJPEG(parseInt(mainState.tabPreviewQuality))] :
            void 0
          )
        },noActiveSkip)
        // setTimeout(()=>r(null),500)
      })
      if(img) results.push(img)
    }
    // const results = await Promise.all(promises)
    const reply = []
    for(let result of results){
      if(!result) continue
      const prevImg = imgCache.get(result[0])
      if(prevImg && Buffer.compare(prevImg[4],result[4]) === 0){
        reply.push([result[0],true,result[2],prevImg[3]])
      }
      else{
        imgCache.set(result[0],result)
        reply.push([result[0],false,result[2],result[3]])
        console.log(111)
      }
    }
    event.sender.send(`take-capture-reply_${base64}`, reply)
  }
  else{
    captureCurrentPage(id,url,loc,base64,event.sender,tabId,noActiveSkip).then(_=>{
      if(!base64) delete captures[url]
    })
  }
})

ipcMain.on('get-captures', (event,key,getWidthImageTabIdAndWidth) => {
  const result = {}
  for(let [tabId, width] of getWidthImageTabIdAndWidth){
    const img = imgCache.get(tabId)
    const resizedImg = img[1].resize({width,quality: 'best'})
    result[tabId] = [`data:image/jpeg;base64,${resizedImg.toJPEG(100).toString("base64")}`,resizedImg.getSize()]
  }
  event.sender.send(`get-captures-reply_${key}`,result)
})


ipcMain.on('get-favicon', (event) => {
  getFavicon().then(_=>_)
})


ipcMain.on('get-a-favicon', (event,url) => {
  faviconUpdate(url)
})

ipcMain.on('end-arrange-mode' ,(e) => {
  const win = BrowserWindow.fromWebContents(e.sender)
  const winId = win.id

  for(let [seq, _winId] of Object.entries(viewCache)){
    if(winId == _winId){
      win.eraseBrowserView(parseInt(seq))
    }
  }
})

// getFavicon().then(_=>_)
