import {webContents,ipcMain,app } from 'electron'
import fs from 'fs'
import path from 'path'
import { favicon,history,image,sock } from './databaseFork'
import uuid from 'node-uuid'
import {request} from './request'
import mainState from './mainState'
const underscore = require('underscore')
const Jimp = require('jimp')
import {getFocusedWebContents} from './util'
// require('locus')


const resourcePath = path.join(app.getPath('userData'),'resource')
const capturePath = path.join(resourcePath,'capture')
if (!fs.existsSync(capturePath)) {
  fs.mkdirSync(capturePath)
}

async function captureCurrentPage(_id,pageUrl,loc,base64,sender,tabId){
  const cont = tabId ? webContents.fromTabID(tabId) : (await getFocusedWebContents())
  // eval(locus)
  if(cont){
    const url = cont.getURL()
    console.log(tabId,url,pageUrl,loc)
    if(url != pageUrl && url != loc) return

    if(base64){
      cont.capturePage((imageBuffer)=>{
      sender.send(`take-capture-reply_${base64}`,`data:image/jpeg;base64,${imageBuffer.toJPEG(parseInt(mainState.tabPreviewQuality)).toString("base64")}`,imageBuffer.getSize())
      })
      return
    }

    const title = cont.getTitle()
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
      const filePath = path.join(capturePath,`${id}.jpg`)
      fs.writeFile(filePath, imageBuffer.toJPEG(80), function(err) {
        if (err) {
          console.log("ERROR Failed to save file", err);
        }

        sock.send({path: filePath},msg=>{
          if(doc){
            image.update({url:pageUrl}, {$set:{path:`${id}.jpg`, title: title, updated_at: d}})
            console.log(4)
          }
          else{
            image.insert({url:pageUrl, path:`${id}.jpg`, title: title, created_at: d, updated_at: d})
            console.log(5)
          }
          history.update({_id},{$set:{capture:`${id}.jpg`, updated_at: d}})
        })
      })
    });

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
ipcMain.on('take-capture', (event,{id,url,loc,base64,tabId}) => {
  if(captures[url]) return
  captures[url] = true
  captureCurrentPage(id,url,loc,base64,event.sender,tabId).then(_=>{
    delete captures[url]
  })
})


ipcMain.on('get-favicon', (event) => {
  getFavicon().then(_=>_)
})


ipcMain.on('get-a-favicon', (event,url) => {
  faviconUpdate(url)
})

// getFavicon().then(_=>_)
