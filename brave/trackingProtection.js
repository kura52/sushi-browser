/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const urlParse = require('./urlParse')
const TrackingProtection = require('tracking-protection').CTPParser
const fs = require('fs')
const path = require('path')
const {session,webContents} = require('electron')
const getBaseDomain = require('./js/lib/baseDomain').getBaseDomain
const mainState = require('../lib/mainState')
const {registerForBeforeRequest,beforeRequestFilteringFns} = require('./adBlock')

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



const LRUCache = require('lru-cache')

let trackingProtection
let cachedFirstParty = new LRUCache(50)

// Temporary whitelist until we find a better solution
const whitelistHosts = ['connect.facebook.net', 'connect.facebook.com', 'staticxx.facebook.com', 'www.facebook.com', 'scontent.xx.fbcdn.net', 'pbs.twimg.com', 'scontent-sjc2-1.xx.fbcdn.net', 'platform.twitter.com', 'syndication.twitter.com', 'cdn.syndication.twimg.com']

let isBindCallback
const startTrackingProtection = (ses=session.defaultSession) => {
  if(!isBindCallback && mainState.trackingProtectionEnable) {
    fs.readFile(path.join(__dirname, '../resource/TrackingProtection.dat'),  function (err, text) {
      trackingProtection = new TrackingProtection()
      trackingProtection.deserialize(text)

      beforeRequestFilteringFns.push(onBeforeHttpRequest)
      registerForBeforeRequest(ses)
    })
  }
}

function onBeforeHttpRequest(details,mainFrameUrl){
  if(!mainState.trackingProtectionEnable) return {}

  const firstPartyUrl = urlParse(mainFrameUrl)
  let firstPartyUrlHost = firstPartyUrl.hostname || ''
  if (firstPartyUrlHost.startsWith('www.')) {
    firstPartyUrlHost = firstPartyUrlHost.substring(4)
  }
  if (firstPartyUrl.protocol && firstPartyUrl.protocol.startsWith('http')) {
    if (!cachedFirstParty.get(firstPartyUrlHost)) {
      let firstPartyHosts = trackingProtection.findFirstPartyHosts(firstPartyUrlHost)
      cachedFirstParty.set(firstPartyUrlHost, (firstPartyHosts && firstPartyHosts.split(',')) || [])
    }
  }
  const urlHost = urlParse(details.url).hostname
  const cancel = firstPartyUrl.protocol &&
    details.resourceType !== 'mainFrame' &&
    firstPartyUrl.protocol.startsWith('http') &&
    !whitelistHosts.includes(urlHost) &&
    cachedFirstParty.get(firstPartyUrlHost) &&
    trackingProtection.matchesTracker(firstPartyUrlHost, urlHost) &&
    urlHost !== firstPartyUrl.hostname &&
    !cachedFirstParty.get(firstPartyUrlHost).find((baseHost) =>
      !isThirdPartyHost(baseHost, urlHost))

  return {
    cancel
  }
}


startTrackingProtection()

module.exports.init = () => {
  trackingProtection = new TrackingProtection()
  dataFile.init(module.exports.resourceName, undefined, startTrackingProtection,
    (data) => trackingProtection.deserialize(data))
}


module.exports = startTrackingProtection