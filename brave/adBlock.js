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
const redirectUrlsCache = new LRUCache(5000)

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
  const tab = webContents.fromTabID(details.tabId)
  try {
    return tab.getURL()
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
const frameCache = new LRUCache(200)
function registerForBeforeRequest (session) {
  if(registeredSession.has(session)) return
  session.webRequest.onBeforeRequest((details, cb) => {
    if (shouldIgnoreUrl(details)) {
      cb({})
      return
    }

    if(details.resourceType === 'subFrame' && details.firstPartyUrl){
      const arr = frameCache.get(details.firstPartyUrl)
      if(arr){
        arr.push(details)
      }
      else{
        frameCache.set(details.firstPartyUrl,[details])
      }
    }

    const firstPartyUrl = getMainFrameUrl(details)
    // this can happen if the tab is closed and the webContents is no longer available
    if (!firstPartyUrl) {
      cb({ cancel: true })
      return
    }

    for (let i = 0; i < beforeRequestFilteringFns.length; i++) {
      let results = beforeRequestFilteringFns[i](details,firstPartyUrl)
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


  session.webRequest.onHeadersReceived((details, cb) => {
    setTimeout(_=>{
      if(details.statusCode === 301 || details.statusCode === 302){
        redirectUrlsCache.set((details.responseHeaders.Location || details.responseHeaders.location || details.responseHeaders.LOCATION)[0], details.firstPartyUrl)
      }
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

      if(!contType || matchNormal || contType[0].startsWith('image')) return

      let record,ret,parseUrl
      if(ret = (contType[0].match(RegRichMedia))){
        let len = headers['Content-Length'] || headers['content-length'] || headers['CONTENT-LENGTH']
        len = len ? len[0] : null
        parseUrl = url.parse(newURL)
        const pathname = parseUrl.pathname
        const ind = pathname.lastIndexOf('/')
        record = {tabId:details.tabId,type:ret[0],contType,size:len,url:newURL,fname: pathname.slice(ind+1)}
      }
      else{
        let len = headers['Content-Length'] || headers['content-length'] || headers['CONTENT-LENGTH']
        len = len ? len[0] : null
        parseUrl = url.parse(newURL)
        const pathname = parseUrl.pathname
        let type
        if(ret = (pathname && (type = mime.getType(pathname)) && type.match(RegRichMedia))){
          const ind = pathname.lastIndexOf('/')
          record = {tabId:details.tabId,type:ret[0],contType,size:len,url:newURL,fname: pathname.slice(ind+1)}
        }
      }

      if(record){
        console.log(record)
        let cont
        for(let w of BrowserWindow.getAllWindows()){
          if(w.getTitle().includes('Sushi Browser')){
            cont = w.webContents
            if(cont && !cont.isDestroyed()) cont.send("did-get-response-details",record)
          }
        }
      }
    },0)
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


const startAdBlocking = (adblock, resourceName, shouldCheckMainFrame,ses=session.defaultSession) => {
  beforeRequestFilteringFns.push((details,mainFrameUrl) => {
    // if(details.method == 'POST' && details.resourceType == 'mainFrame' && details.uploadData){
    //   console.log(details)
    //   process.downloadParams.set(details.firstPartyUrl,[details.uploadData,Date.now()])
    // }
    if(!mainState.adBlockEnable || (tabs.has(details.tabId) && !tabs.get(details.tabId))){
      return {}
    }

    const firstPartyUrl = urlParse(mainFrameUrl)

    if(mainState.adBlockDisableSite[firstPartyUrl.host]){
      return {}
    }

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

  ses.webRequest.onBeforeRedirect((details) => {
    redirectUrlsCache.set(details.redirectURL,details.url)
  })
}

let adblock
fs.readFile(path.join(__dirname, '../resource/ABPFilterParserData.dat'),  function (err, text) {
  // adblock = new AdBlockClient()
  // adblock.deserialize(text);
  // startAdBlocking(adblock,null,false)
});

module.exports = {
  adBlock: ses=>startAdBlocking(adblock,null,false,ses),
  registerForBeforeRequest,
  beforeRequestFilteringFns,
  redirectUrlsCache,
  frameCache,
  cache
}