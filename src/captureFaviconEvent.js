import {webContents,ipcMain,app } from 'electron'
import path from 'path'
import { favicon } from './database'
import request from 'request'
const underscore = require('underscore')
const Jimp = require('jimp')
const ico = require('icojs');
import {getFocusedWebContents} from './util'
// require('locus')


const resourcePath = path.join((app ? app.getPath('userData') : process.argv[2]).replace('brave','sushiBrowser').replace('sushi-browser','sushiBrowser').replace('sushiBrowserDB','sushiBrowser'),'resource')

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

function dataUriToBuffer (uri) {

  // split the URI up into the "metadata" and the "data" portions
  var firstComma = uri.indexOf(',');
  if (-1 === firstComma || firstComma <= 4) throw new TypeError('malformed data: URI');

  // remove the "data:" scheme and parse the metadata
  var meta = uri.substring(5, firstComma).split(';');

  var type = meta[0] || 'text/plain';
  var typeFull = type;
  var base64 = false;
  var charset = '';
  for (var i = 1; i < meta.length; i++) {
    if ('base64' == meta[i]) {
      base64 = true;
    } else {
      typeFull += ';' + meta[i];
      if (0 == meta[i].indexOf('charset=')) {
        charset = meta[i].substring(8);
      }
    }
  }
  // defaults to US-ASCII only if type is not provided
  if (!meta[0] && !charset.length) {
    typeFull += ';charset=US-ASCII';
    charset = 'US-ASCII';
  }

  // get the encoded data portion and decode URI-encoded chars
  var data = unescape(uri.substring(firstComma + 1));

  var encoding = base64 ? 'base64' : 'ascii';
  var buffer = new Buffer(data, encoding);

  // set `.type` and `.typeFull` properties to MIME type
  buffer.type = type;
  buffer.typeFull = typeFull;

  // set the `.charset` property
  buffer.charset = charset;

  return buffer;
}

const fetchFavIcon = (url, redirects) => {
  if (typeof redirects === 'undefined') redirects = 0

  return new Promise((resolve,reject)=>{

    console.log(url)
    request({ url: url, encoding: null }, (err, response, blob) => {
      blob = 'data:' + response.headers['content-type'] + ';base64,' + blob.toString('base64')
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
          try{
            if (matchP) return
            if ((prefix.length >= fileTypes[fileType].length) ||
              (fileTypes[fileType].compare(prefix, 0, fileTypes[fileType].length) !== 0)) return

            blob = 'data:image/' + fileType + blob.substr(tail)
            matchP = true
          }
          catch(e){
            console.log(e)
            reject("err1")
            return
          }
        })
        if (!matchP) {
          reject("err2");
          return
        }
      } else if (tail > 0 && tail + 8 >= blob.length){
        reject("err3");
        return;
      }

      if(blob.length < 2200){
        console.log(138,Date.now())
        resolve(blob)
        return
      }

      const img = dataUriToBuffer(blob)
      console.log(img.type)

      if(img.type.match(/(png|jpg|jpeg)$/)){
        console.log(144,Date.now())
        Jimp.read(img, function (err, image) {
          if (err || !image) {
            console.log("ERROR Failed to save file", err);
            resolve(blob)
          }
          if(Math.max(image.bitmap.width,image.bitmap.height) <= 20){
            console.log(146,Date.now())
            resolve(blob)
          }
          else{
            console.log(147,Date.now())
            if(image.bitmap.width > image.bitmap.height){
              image = image.resize(20,Jimp.AUTO,Jimp.RESIZE_BICUBIC)
            }
            else{
              image = image.resize(Jimp.AUTO,20,Jimp.RESIZE_BICUBIC)
            }
            image.getBase64(Jimp.AUTO, function (err, src) {
              resolve(src)
            })
            //   .toBuffer().then(data=>{
            //   resolve(`data:image/png;base64,${data.toString('base64')}`)
            // })
          }

        })
      }
      else if(img.type.endsWith('icon') && ico.isICO(img)){
        console.log(148,Date.now())
        try{
          ico.parse(img).then(function (images) {
            console.log(149,Date.now())
            const icoImage = images[0]
            const imgBuffer = Buffer.from(icoImage.buffer)
            console.log(151,Date.now())
            Jimp.read(imgBuffer, function (err, image) {
              if (err || !image) {
                console.log("ERROR Failed to save file", err);
                resolve(blob)
              }
              if(Math.max(image.bitmap.width,image.bitmap.height) <= 20){
                console.log(146,Date.now())
                resolve(`data:image/png;base64,${imgBuffer.toString('base64')}`)
              }
              else{
                console.log(147,Date.now())
                if(image.bitmap.width > image.bitmap.height){
                  image = image.resize(20,Jimp.AUTO,Jimp.RESIZE_BICUBIC)
                }
                else{
                  image = image.resize(Jimp.AUTO,20,Jimp.RESIZE_BICUBIC)
                }
                image.getBase64(Jimp.AUTO, function (err, src) {
                  resolve(src)
                })
              }
            })
          }).catch(e=>{
            console.log(154,Date.now())
            resolve(blob)
          })
        }catch(e){
          console.log(1544,Date.now())
          resolve(blob)
        }
      }
      else{
        console.log(155,Date.now())
        resolve(blob)
      }
    })
  })
}

export default function faviconUpdate(url) {
  fetchFavIcon(url).then(ret => {
    console.log(1,url)
    if (ret) {
      favicon.update({url}, {$set: {data: ret, updated_at: Date.now()}}).then(_=>_)
    }
    else {
      favicon.update({url}, {$set: {status: "ERROR-NOREPLY", updated_at: Date.now()}}).then(_=>_)
    }
  }).catch(err => {
    console.log(err)
    if (err.toString().match(/^\d{3}$/)) {
      if (err == "403" || err == "404" || err == "503") {
        favicon.update({url}, {$set: {status: err, updated_at: Date.now()}}).then(_=>_)
      }
      else {
        favicon.update({url}, {$set: {status: err, updated_at: Date.now()}}).then(_=>_)
      }
    }
    else {
      favicon.update({url}, {$set: {status: "ERROR", updated_at: Date.now()}}).then(_=>_)
    }
  })
};
