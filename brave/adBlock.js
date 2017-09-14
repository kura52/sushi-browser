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
const fs = require('fs')
const path = require('path')
const mainState = require('../lib/mainState')
const {ipcMain} = require('electron')
process.downloadParams = new Map()

let mapFilterType = {
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
  ses.webRequest.onBeforeRequest((details, callback) => {
    if(details.method == 'POST' && details.resourceType == 'mainFrame' && details.uploadData){
      console.log(details)
      process.downloadParams.set(details.firstPartyUrl,[details.uploadData,Date.now()])
    }
    if(!mainState.adBlockEnable || (tabs.has(details.tabId) && !tabs.get(details.tabId))){
      callback({})
      return
    }

    const mainFrameUrl = getMainFrameUrl(details)
    // this can happen if the tab is closed and the webContents is no longer available
    if (!mainFrameUrl || mainFrameUrl.startsWith('chrome')) {
      // return {
      //   resourceName: module.exports.resourceName
      // }
      callback({})
      return
    }


    if (shouldIgnoreUrl(details)) {
      callback({})
      return
    }

    // if(details.resourceType !== 'mainFrame'){
    //   if(details.firstPartyUrl === details.url) rlog(details)
    // }
    const firstPartyUrl = urlParse(mainFrameUrl)



    // this can happen if the tab is closed and the webContents is no longer available
    if (!firstPartyUrl) {
      callback({ cancel: true })
      return
    }


    let firstPartyUrlHost = firstPartyUrl.hostname || ''
    const urlHost = urlParse(details.url).hostname

    if(mainState.adBlockDisableSite[firstPartyUrlHost]){
      callback({})
      return
    }

    const cancel = firstPartyUrl.protocol &&
      (
        shouldCheckMainFrame ||
        (
          (
            details.resourceType !== 'mainFrame' &&
            isThirdPartyHost(firstPartyUrlHost, urlHost)
          ) ||
          (
            siteHacks[firstPartyUrl.hostname] &&
            siteHacks[firstPartyUrl.hostname].allowFirstPartyAdblockChecks
          )
        )
      ) &&
      firstPartyUrl.protocol.startsWith('http') &&
      mapFilterType[details.resourceType] !== undefined &&
      adblock.matches(details.url, mapFilterType[details.resourceType], firstPartyUrl.host)

    callback({
      cancel,
      // resourceName
    })
  });
}

let adblock
fs.readFile(path.join(__dirname, '../resource/ABPFilterParserData.dat'),  function (err, text) {
  adblock = new AdBlockClient()
  adblock.deserialize(text);
  startAdBlocking(adblock,null,false)
});

module.exports = ses=>startAdBlocking(adblock,null,false,ses)