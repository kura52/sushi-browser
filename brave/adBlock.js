/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'
const {session,webContents} = require('electron')
const {AdBlockClient, FilterOptions} = require('ad-block')
const {siteHacks} = require('./siteHacks')
const getBaseDomain = require('./js/lib/baseDomain').getBaseDomain
// const DataFile = require('./dataFile')
const urlParse = require('./urlParse')
const LRUCache = require('lru-cache')
const redirectUrlsCache = new LRUCache(5000)

const fs = require('fs')
const path = require('path')
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

function shouldIgnoreUrl (details) {
  // internal requests
  if (details.tabId === -1) {
    return true
  }

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
  if (tab && !tab.isDestroyed()) {
    return tab.getURL()
  }
  return null
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
}


const tabs = new Map()
mainState.adBlockEnable = true
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
  adblock = new AdBlockClient()
  adblock.deserialize(text);
  startAdBlocking(adblock,null,false)
});

module.exports = {
  adBlock: ses=>startAdBlocking(adblock,null,false,ses),
  registerForBeforeRequest,
  beforeRequestFilteringFns,
  redirectUrlsCache,
  frameCache
}