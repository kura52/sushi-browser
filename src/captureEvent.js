import {webContents,ipcMain,app } from 'electron'
import fs from 'fs'
import path from 'path'
import { history,favicon,image } from './databaseFork'
import uuid from 'node-uuid'
import {request} from './request'
const underscore = require('underscore')
import {getFocusedWebContents} from './util'
// require('locus')


const resourcePath = path.join(app.getPath('userData'),'resource')
const capturePath = path.join(resourcePath,'capture')
if (!fs.existsSync(capturePath)) {
  fs.mkdirSync(capturePath)
}

var fileTypes = {
  bmp: new Buffer([ 0x42, 0x4d ]),
  gif: new Buffer([ 0x47, 0x49, 0x46, 0x38, [0x37, 0x39], 0x61 ]),
  ico: new Buffer([ 0x00, 0x00, 0x01, 0x00 ]),
  jpeg: new Buffer([ 0xff, 0xd8, 0xff ]),
  png: new Buffer([ 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a ])
}

var signatureMax = 0
underscore.keys(fileTypes).forEach((fileType) => {
  if (signatureMax < fileTypes[fileType].length) signatureMax = fileTypes[fileType].length
})
signatureMax = Math.ceil(signatureMax * 1.5)


async function captureCurrentPage(_id,pageUrl,loc){
  const cont = await getFocusedWebContents()
  // eval(locus)
  if(cont){
    const url = cont.getURL()
    console.log(2,url,pageUrl,loc)
    if(url != pageUrl && url != loc) return
    const doc = await image.findOne({url:pageUrl})
    const d = Date.now()

    console.log(3,doc)
    if(doc){
      const capturedDate = doc.updated_at
      if(d - capturedDate < 1000* 60 * 60 * 24 * 30) return
    }

    const id = uuid.v4()
    cont.capturePage((imageBuffer)=>{
      fs.writeFile(path.join(capturePath,`${id}.png`), imageBuffer.toJPEG(80), function(err) {
        if (err) {
          console.log("ERROR Failed to save file", err);
        }
        else{
          if(doc){
            image.update({url:pageUrl}, {$set:{path:`${id}.png`, title: cont.getTitle(), updated_at: d}})
          }
          else{
            image.insert({url:pageUrl, path:`${id}.png`, title: cont.getTitle(), created_at: d, updated_at: d})
          }
          history.update({_id},{$set:{capture:`${id}.png`, updated_at: d}})
        }
      })
    })
  }
}


const fetchFavIcon = (url, redirects) => {
  if (typeof redirects === 'undefined') redirects = 0

  return new Promise((resolve,reject)=>{

    console.log(url)
    request({ url: url, responseType: 'blob' }, (err, response, blob) => {
      let matchP, prefix, tail

      if (err) {
        console.log('response error: ' + err.toString() + '\n' + err.stack)
        reject(err.toString())
        return
      }

      if ((response.statusCode === 301) && (response.headers.location)) {
        if (redirects < 3) fetchFavIcon(response.headers.location, redirects++)
        reject("redirect")
        return
      }

      if ((response.statusCode !== 200) || (response.headers['content-length'] === '0')) {
        reject(response.statusCode)
        return
      }

      tail = blob.indexOf(';base64,')
      if (blob.indexOf('data:image/') !== 0) {
        // NB: for some reason, some sites return an image, but with the wrong content-type...
        if (tail <= 0) {
          reject("err1");
          return
        }

        prefix = new Buffer(blob.substr(tail + 8, signatureMax), 'base64')
        underscore.keys(fileTypes).forEach((fileType) => {
          if (matchP) return
          if ((prefix.length >= fileTypes[fileType].length) ||
            (fileTypes[fileType].compare(prefix, 0, fileTypes[fileType].length) !== 0)) return

          blob = 'data:image/' + fileType + blob.substr(tail)
          matchP = true
        })
        if (!matchP) {
          reject("err2");
          return
        }
      } else if (tail > 0 && tail + 8 >= blob.length){
        reject("err3");
        return;
      }

      resolve(blob)
    })
  })
}

function faviconUpdate(url) {
  if(url == 'loading') return
  fetchFavIcon(url).then(ret => {
    console.log(1,url)
    if (ret) {
      favicon.update({url}, {$set: {data: ret, updated_at: Date.now()}})
    }
    else {
      favicon.update({url}, {$set: {status: "ERROR-NOREPLY", updated_at: Date.now()}})
    }
  }).catch(err => {
    console.log(err)
    if (err.toString().match(/^\d{3}$/)) {
      if (err == "403" || err == "404" || err == "503") {
        favicon.update({url}, {$set: {status: err, updated_at: Date.now()}})
      }
      else {
        favicon.update({url}, {$set: {status: err, updated_at: Date.now()}})
      }
    }
    else {
      favicon.update({url}, {$set: {status: "ERROR", updated_at: Date.now()}})
    }
  })
};

async function getFavicon(){
  const favicons = await favicon.find_limit([{$and: [{data: { $exists: false }},{status: { $exists: false}}]}],[20])

  for(let favi of favicons){
    const url = favi.url
    if(url == 'loading') continue
    faviconUpdate(url);
    // request({method: 'GET', url: url, encoding: null
    //     ,headers: {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36'}},
    //   (error, response, body)=>{
    //     if(!error && response.statusCode === 200){
    //       const id = uuid.v4()
    //       try{
    //         const ext = path.basename(url).split(".")[1].split("?")[0]
    //         fs.writeFile(path.join(__dirname, `../resource/favicon/${id}.${ext || 'ico'}`), body, function(err) {
    //           if (err) {
    //             console.log("ERROR Failed to save file", err);
    //           }
    //           else{
    //             favicon.update({url}, {$set:{path:`${id}.${ext || 'ico'}`, updated_at: Date.now()}})
    //           }
    //         })
    //       }catch(e){
    //         console.log(e)
    //       }
    //     }
    //     else if(response && response.statusCode && (response.statusCode == "403" || response.statusCode == "404" || response.statusCode == "503")){
    //       favicon.update({url}, {$set:{status: response.statusCode, updated_at: Date.now()}})
    //       console.log(error,response.statusCode,url)
    //     }
    //     else{
    //       favicon.update({url}, {$set:{status: "ERROR", updated_at: Date.now()}})
    //       console.log(error,response,url)
    //     }
    //   }
    // )
  }
}

ipcMain.on('take-capture', (event,{id,url,loc}) => {
  captureCurrentPage(id,url,loc).then(_=>_)
})


ipcMain.on('get-favicon', (event) => {
  getFavicon().then(_=>_)
})


ipcMain.on('get-a-favicon', (event,url) => {
  faviconUpdate(url)
})

// getFavicon().then(_=>_)
