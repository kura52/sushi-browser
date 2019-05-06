/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'
const {session,webContents,BrowserWindow} = require('electron')
const {AdBlockClient, FilterOptions} = require('ad-block')
const {siteHacks} = require('./siteHacks')
const getBaseDomain = require('./js/lib/baseDomain').getBaseDomain
// const DataFile = require('./dataFile')
const urlParse = require('./urlParse')
const LRUCache = require('lru-cache')
// const redirectUrlsCache = new LRUCache(5000)

const fs = require('fs')
const path = require('path')
const url = require('url')
const mime = require('mime')
const mainState = require('../lib/mainState')
const {ipcMain} = require('electron')
// process.downloadParams = new Map()

const whitelistHosts = ['disqus.com', 'a.disquscdn.com']

const transparent1pxGif = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
/**
 * Maps filtering request resourceTypes to ones that our adBlock library understands
 */
const mapFilterType = {
  mainFrame: FilterOptions.document,
  subFrame: FilterOptions.subdocument,
  stylesheet: FilterOptions.stylesheet,
  script: FilterOptions.script,
  image: FilterOptions.image,
  object: FilterOptions.object,
  xhr: FilterOptions.xmlHttpRequest,
  other: FilterOptions.other
}

const filterableProtocols = ['http:', 'https:', 'ws:', 'wss:', 'magnet:', 'file:']

const cache = new LRUCache(1000)
const referers = new LRUCache(1000)

const RegNormal = /^(application\/(font|javascript|json|x-javascript|xml)|text\/(css|html|javascript|plain))/
const RegRichMedia = /^(video|audio|application\/x\-mpegurl|application\/vnd\.apple\.mpegurl)/
const RegForDL = /^(application\/(pdf|zip|x\-zip\-compressed|x\-lzh)|image|video|audio)/
const RegForDLExt = /\.(?:z(?:ip|[0-9]{2})|r(?:ar|[0-9]{2})|jar|bz2|gz|tar|rpm|7z(?:ip)?|lzma|xz|mp3|wav|og(?:g|a)|flac|midi?|rm|aac|wma|mka|ape|exe|msi|dmg|bin|xpi|iso|pdf|xlsx?|docx?|odf|odt|rtf|jp(?:e?g|e|2)|gif|png|tiff?|bmp|ico|jp(e?g|e|2)|png|mpeg|ra?m|avi|mp(?:g|e|4)|mov|divx|asf|qt|wmv|m\dv|rv|vob|asx|ogm|ogv|webm|flv|mkv)$/i


function shouldIgnoreUrl (details) {
  // data:, is a special origin from SecurityOrigin::urlWithUniqueSecurityOrigin
  // and usually occurs when there is an https in an http main frame
  if (details.firstPartyUrl === 'data:,') {
    return false
  }

  // Ensure host is well-formed (RFC 1035) and has a non-empty hostname
  try {
    const firstPartyUrl = urlParse(details.firstPartyUrl)
    if (!filterableProtocols.includes(firstPartyUrl.protocol)) {
      return true
    }
  } catch (e) {
    console.warn('Error parsing ' + details.firstPartyUrl)
  }

  try {
    // TODO(bridiver) - handle RFS check and cancel http/https requests with 0 or > 255 length hostames
    const parsedUrl = urlParse(details.url)
    if (filterableProtocols.includes(parsedUrl.protocol)) {
      return false
    }
  } catch (e) {
    console.warn('Error parsing ' + details.url)
  }
  return true
}

const getMainFrameUrl = (details) => {
  if (details.resourceType === 'mainFrame') {
    return details.url
  }
  if(!details.webContentsId){
    details.webContentsId = referers.get(details.referrer)
    if(!details.webContentsId) return null
  }
  let tab = tabCache.get(details.webContentsId)
  if(!tab){
    tab = webContents.fromId(details.webContentsId)
    tabCache.set(details.webContentsId, tab)
  }
  try {
    const url = tab.getURL()
    if(details.webContentsId) mainFrameCache.set(details.webContentsId, url)
    return url
  } catch (ex) {}
  return details.firstPartyUrl || null
}


const isThirdPartyHost = (baseContextHost, testHost) => {
  // TODO: Always return true if these are IP addresses that aren't the same
  if (!testHost || !baseContextHost) {
    return true
  }
  const documentDomain = getBaseDomain(baseContextHost)
  if (testHost.length > documentDomain.length) {
    return (testHost.substr(testHost.length - documentDomain.length - 1) !== '.' + documentDomain)
  } else {
    return (testHost !== documentDomain)
  }
}


const registeredSession = new Set()
const beforeRequestFilteringFns = []
const frameCache = new LRUCache(2000)
const mainFrameCache = new LRUCache(200)
const tabCache = new LRUCache(200)
function registerForBeforeRequest (session) {
  if(registeredSession.has(session)) return


  ipcMain.emit('add-onBeforeRequest',(details, cb) => {

    if(details.resourceType == 'mainFrame'){
      mainFrameCache.set(details.webContentsId, details.url)
    }
    details.firstPartyUrl = getMainFrameUrl(details) || mainFrameCache.get(details.webContentsId)
    // console.log('adblock',details.webContentsId, details.firstPartyUrl ,details.url)
    // console.log(details)

    if(details.referrer && details.webContentsId){
      referers.set(details.referrer,details.webContentsId)
    }

    if (shouldIgnoreUrl(details)) {
      cb({})
      return
    }

    if(/*details.resourceType === 'subFrame' &&*/ details.firstPartyUrl){
      const arr = frameCache.get(details.firstPartyUrl)
      if(arr){
        arr.push(details)
      }
      else{
        frameCache.set(details.firstPartyUrl,[details])
      }
    }

    const firstPartyUrl = details.firstPartyUrl
    // this can happen if the tab is closed and the webContents is no longer available
    if (!firstPartyUrl) {
      cb({ cancel: true })
      return
    }

    for (let i = 0; i < beforeRequestFilteringFns.length; i++) {
      let results = beforeRequestFilteringFns[i](details,firstPartyUrl)

      // console.log(details,results)
      if (results.cancel) {
        if (details.resourceType === 'image') {
          cb({ redirectURL: transparent1pxGif })
          return
        }
        else {
          cb({ cancel: true })
          return
        }
        return
      } else if (results.resourceName === 'siteHacks' && results.cancel === false) {
        cb({})
        return
      }

      if (results.redirectURL) {
        cb({redirectURL: results.redirectURL})
        return
      }
    }
    cb({})
  })

  ipcMain.emit('add-onHeadersReceived',(details, cb) => {
    setTimeout(_=>{
      // if(details.statusCode === 301 || details.statusCode === 302){
      //   redirectUrlsCache.set((details.responseHeaders.Location || details.responseHeaders.location || details.responseHeaders.LOCATION)[0], details.url)
      // }
      const headers = details.responseHeaders, newURL = details.url
      const contType = headers['Content-Type'] || headers['content-type'] || headers['CONTENT-TYPE']
      if(!contType) return

      // console.log(contType[0])

      const matchNormal = contType && contType[0].match(RegNormal)
      if(!matchNormal && ((contType && contType[0].match(RegForDL)) || newURL.match(RegForDLExt))){
        // console.log(6755,contType && contType[0],newURL,tab.getURL())
        const url = details.firstPartyUrl
        const map = cache.get(url)
        if(map){
          map[newURL] = contType && contType[0]
        }
        else{
          cache.set(url,{[newURL]:contType && contType[0]})
        }
      }

      const urlMatch = newURL.match(/\.(mp4|webm|avi|3gp|m3u8)$/)
      if((!contType || matchNormal || contType[0].startsWith('image')) && !urlMatch) return

      let record,ret,parseUrl
      if(ret = (contType[0].match(RegRichMedia))){
        let len = headers['Content-Length'] || headers['content-length'] || headers['CONTENT-LENGTH']
        len = len ? len[0] : null
        parseUrl = url.parse(newURL)
        const pathname = parseUrl.pathname
        const ind = pathname.lastIndexOf('/')
        record = {tabId:details.webContentsId,type:ret[0],contType,size:len,url:newURL,fname: pathname.slice(ind+1)}
      }
      else{
        let len = headers['Content-Length'] || headers['content-length'] || headers['CONTENT-LENGTH']
        len = len ? len[0] : null
        parseUrl = url.parse(newURL)
        const pathname = parseUrl.pathname
        let type
        if(ret = (pathname && (type = mime.getType(pathname)) && type.match(RegRichMedia))){
          const ind = pathname.lastIndexOf('/')
          record = {tabId:details.webContentsId,type:ret[0],contType,size:len,url:newURL,fname: pathname.slice(ind+1)}
        }
        else if(urlMatch){
          const ind = pathname.lastIndexOf('/')
          record = {tabId:details.webContentsId,contType,size:len,url:newURL,fname: pathname.slice(ind+1)}
        }
      }


      if(record){
        // console.log(record)
        let cont
        for(let w of BrowserWindow.getAllWindows()){
          if(w.getTitle().includes('Sushi Browser')){
            cont = w.webContents
            if(cont && !cont.isDestroyed()) cont.send("did-get-response-details",record)
          }
        }
      }
    },0)
    let extUrl
    if(details.webContentsId && (extUrl = webContents.fromId(details.webContentsId).getURL()).startsWith('chrome-extension:')){
      if(details.headers['Access-Control-Request-Headers']){
        details.responseHeaders['Access-Control-Allow-Headers'] = details.headers['Access-Control-Request-Headers'].split(',')
      }
      if(details.headers['Access-Control-Request-Method']){
        details.responseHeaders['Access-Control-Allow-Methods'] = [details.headers['Access-Control-Request-Method']]
      }
      delete details.responseHeaders['content-security-policy']
      delete details.responseHeaders['x-frame-options']
      delete details.responseHeaders['x-content-type-options']
      delete details.responseHeaders['x-xss-protection']
      return cb({
        responseHeaders: {
          ...details.responseHeaders,
          "Access-Control-Allow-Origin": [extUrl.match(/^(chrome-extension:\/\/[^\/]+)/)[0]],
          "Access-Control-Allow-Credentials":  ['true']
        }
      })
      // details.responseHeaders["Access-Control-Allow-Origin"] = [new URL(details.url).origin]
      // details.responseHeaders["Access-Control-Allow-Credentials"] = ['true']

      // if(details.headers['Access-Control-Request-Headers']){
      //   details.responseHeaders['Access-Control-Allow-Headers'] = details.headers['Access-Control-Request-Headers'].split(',')
      // }
      // if(details.headers['Access-Control-Request-Method']){
      //   details.responseHeaders['Access-Control-Allow-Methods'] = [details.headers['Access-Control-Request-Method']]
      // }
      // delete details.responseHeaders['content-security-policy']
      // delete details.responseHeaders['x-frame-options']
      // delete details.responseHeaders['x-content-type-options']
      // delete details.responseHeaders['x-xss-protection']
      // return cb({
      //   responseHeaders: details.responseHeaders
      // })
    }
    return cb({})
  })


  ipcMain.emit('add-onBeforeSendHeaders',(details, cb) => {
    let extUrl
    // console.log(777,details)
    if(details.webContentsId && (extUrl = webContents.fromId(details.webContentsId).getURL()).startsWith('chrome-extension:')){
      // console.log(88366,details.requestHeaders)
      details.requestHeaders.Origin = new URL(details.url).origin //extUrl.match(/^(chrome-extension:\/\/[^\/]+)/)[0]
      // if(details.requestHeaders['Accept-Encoding']){
      //   details.requestHeaders['Accept-Encoding'] = details.requestHeaders['Accept-Encoding'].split(", ").filter(x=>x != 'gzip').join(', ')
      // }
      return cb({
        cancel: false, requestHeaders:details.requestHeaders
      })
    }
    return cb({})
  })

}


const tabs = new Map()
ipcMain.on('set-adblock-enable', async (event, datas) => {
  if(datas.global){
    mainState.adBlockEnable = !mainState.adBlockEnable
  }
  else{
    tabs.set(datas.tabId,tabs.has(datas.tabId) ? !tabs.get(datas.tabId) : false)
  }
})

const passRec = new LRUCache(100)
const passwordManager = require('../lib/passwordManagerMain')
ipcMain.on('record-password', (e, {url, origin, time, id, password})=>{
  passRec.set(e.sender.id, {url, origin, time, id, password})
  console.log(6661, e.sender.id, time, url, id, password)
})

const startAdBlocking = (adblock, resourceName, shouldCheckMainFrame,ses=session.defaultSession) => {
  beforeRequestFilteringFns.push((details,mainFrameUrl) => {
    if(details.method == 'POST' && details.resourceType == 'mainFrame' && details.uploadData){
      const tabId = referers.get(details.referrer)
      // console.log(6662,tabId, referers.get(details.referrer) && webContents.fromId(referers.get(details.referrer)).getURL(),details.uploadData[0].bytes.toString())
      const data = passRec.get(tabId)
      if(data && Date.now() - data.time < 5000){
        const cont = webContents.fromId(tabId)
        if(cont.getURL() == data.url){
          // console.log(6663,tabId, referers.get(details.referrer) && webContents.fromId(referers.get(details.referrer)).getURL(),details.uploadData[0].bytes.toString())
          passRec.del(tabId)
          passwordManager.savePassword(cont, data.id, data.origin, data.url, data.password)
        }
      }
    }
    if(!mainState.adBlockEnable || (tabs.has(details.webContentsId) && !tabs.get(details.webContentsId))){
      return {}
    }

    const firstPartyUrl = urlParse(mainFrameUrl)

    if(mainState.adBlockDisableSite[firstPartyUrl.host]){
      return {}
    }

    // firstPartyUrl && console.log( details.url,adblock.matches(details.url, mapFilterType[details.resourceType], firstPartyUrl.host))

    const url = urlParse(details.url)
    const cancel =   firstPartyUrl.protocol &&
      // By default first party hosts are allowed
      (shouldCheckMainFrame || details.resourceType !== 'mainFrame') &&
      // Only check http and https for now
      firstPartyUrl.protocol.startsWith('http') &&
      // Only do adblock if the host isn't in the whitelist
      !whitelistHosts.find((whitelistHost) => whitelistHost === url.hostname || url.hostname.endsWith('.' + whitelistHost)) &&
      // Make sure there's a valid resource type before trying to use adblock
      mapFilterType[details.resourceType] !== undefined &&
      adblock.matches(details.url, mapFilterType[details.resourceType], firstPartyUrl.host)

    return { cancel }
  });
  registerForBeforeRequest(ses)

  // ses.webRequest.onBeforeRedirect((details) => {
  //   redirectUrlsCache.set(details.redirectURL,details.url)
  // })
}

let adblock
fs.readFile(path.join(__dirname, '../resource/ABPFilterParserData.dat'),  function (err, text) {
  adblock = new AdBlockClient()
  adblock.deserialize(text);
  startAdBlocking(adblock,null,false)
});

module.exports = {
  adBlock: ses=>startAdBlocking(adblock,null,false,ses),
  registerForBeforeRequest,
  beforeRequestFilteringFns,
  // redirectUrlsCache,
  frameCache,
  cache
}