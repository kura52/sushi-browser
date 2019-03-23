/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Some parts of this file are derived from:
 * HTTPS Everywhere <https://github.com/EFForg/https-everywhere>
 * Copyright (C) 2010-2017 Electronic Frontier Foundation and others
 */

'use strict'

const urlParse = require('./urlParse')
const LRUCache = require('lru-cache')
const fs = require('fs')
const path = require('path')
const {session,webContents} = require('electron')
const mainState = require('../lib/mainState')
const {registerForBeforeRequest,beforeRequestFilteringFns} = require('./adBlock')
const {ipcMain} = require('electron')


const filterableProtocols = ['http:', 'https:', 'ws:', 'wss:', 'magnet:', 'file:']

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

/**
 * Gets applicable hostname patterns for a given URL. Ex: for x.y.google.com,
 * rulesets matching x.y.google.com, *.y.google.com, and *.google.com are
 * applicable.
 * @param {string} url The url to get hostname patterns for
 * @return {Array.<string>}
 */
function　getHostnamePatterns(url) {
  var host = urlParse(url).hostname
  if (!host) {
    return []
  }
  var hostPatterns = [host]
  var segmented = host.split('.')

  // Since targets can contain a single wildcard, replace each label of the
  // hostname with "*" in turn.
  segmented.forEach((label, index) => {
    // copy the original array
    var tmp = segmented.slice()
    tmp[index] = '*'
    hostPatterns.push(tmp.join('.'))
  })
  // Now eat away from the left with * so that for x.y.z.google.com we also
  // check *.z.google.com and *.google.com.
  for (var i = 2; i <= segmented.length - 2; ++i) {
    hostPatterns.push('*.' + segmented.slice(i, segmented.length).join('.'))
  }
  return hostPatterns
}

// Map of ruleset ID to ruleset content
var db = null
// Map of hostname pattern to ruleset ID
var targets = null
// Counter for detecting infinite redirect loops
var redirectCounter = {}
// Blacklist of canonicalized hosts (host+pathname) that lead to redirect loops
var redirectBlacklist = []
// Canonicalized hosts that have been recently redirected via a 307
var recent307Counter = {}
// Map of url to applyRuleset response
var cachedRewrites = new LRUCache(100)


function loadRulesets (data) {
  var parsedData = JSON.parse(data)
  targets = parsedData.targets
  db = parsedData.rulesetStrings
  return true
}

/**
 * Rewrites a URL from HTTP to HTTPS if an HTTPS Everywhere rule is applicable.
 * @param {string} url The URL to rewrite
 * @return {{redirectURL: string|undefined, ruleset: string|undefined}}
 */
function getRewrittenUrl (url) {
  // Rulesets not yet loaded
  if (!db || !targets) {
    return undefined
  }

  var cachedRewrite = cachedRewrites.get(url)
  if (cachedRewrite) {
    return cachedRewrite
  } else {
    // Get the set of ruleset IDs applicable to this host
    let rulesetIds = getHostnamePatterns(url).reduce((prev, hostname) => {
      var target = targets[hostname]
      return target ? prev.concat(target) : prev
    }, [])

    for (var i = 0; i < rulesetIds.length; ++i) {
      // Try applying each ruleset
      let result = applyRuleset(url, db[rulesetIds[i]])
      if (result) {
        cachedRewrites.set(url, result)
        // Redirect to the first rewritten URL
        return result
      }
    }
    return undefined
  }
}

/**
 * Applies a applicable rewrite ruleset to a URL
 * @param {string} url original URL
 * @param {Object} applicableRule applicable ruleset
 * @return {{redirectURL: string|undefined, ruleset: string|undefined}|null}
 */
function applyRuleset (url, applicableRule) {
  var i, ruleset, exclusion, rule, fromPattern, newUrl, exclusionPattern
  ruleset = applicableRule.ruleset
  exclusion = ruleset.exclusion
  rule = ruleset.rule
  // If covered by an exclusion, callback the original URL without trying any
  // more rulesets.
  if (exclusion) {
    for (i = 0; i < exclusion.length; ++i) {
      exclusionPattern = new RegExp(exclusion[i].pattern)
      if (exclusionPattern.test(url)) {
        return null
      }
    }
  }
  // Find the first rule that triggers a substitution
  for (i = 0; i < rule.length; ++i) {
    fromPattern = new RegExp(rule[i].from)
    newUrl = url.replace(fromPattern, rule[i].to)
    if (newUrl !== url) {
      return {
        redirectURL: newUrl,
        ruleset: ruleset.name
      }
    }
  }
  return null
}

const getMainFrameUrl = (details) => {
  if (details.resourceType === 'mainFrame') {
    return details.url
  }
  if(!details.webContentsId){
    return null
  }
  const tab = webContents.fromId(details.webContentsId)
  try {
    const url = tab.getURL()
    return url
  } catch (ex) {}
  return details.firstPartyUrl || null
}

/**
 * Called when the HTTPS Everywhere data file
 * is downloaded and ready.
 */
let isBindCallback
function startHttpsEverywhere(ses=session.defaultSession) {
  if(!isBindCallback && mainState.httpsEverywhereEnable){
    isBindCallback = true
    fs.readFile(path.join(__dirname, '../resource/httpse.json'),  function (err, text) {
      loadRulesets(text)
      beforeRequestFilteringFns.push(onBeforeHttpRequest)
      registerForBeforeRequest(ses)

      ipcMain.emit('add-onBeforeRedirect',(details) => {
        onBeforeRedirect(details)
      })
    })
  }
}

function onBeforeHttpRequest (details,mainFrameUrl, isPrivate) {
  let result = {}

  if(!mainState.httpsEverywhereEnable) return {}

  // Ignore URLs that are not HTTP
  if (urlParse(details.url).protocol !== 'http:') {
    return result
  }

  if (redirectBlacklist.includes(canonicalizeUrl(details.url))) {
    // Don't try to rewrite this request, it'll probably just redirect again.
    return result
  } else {
    let rewritten = getRewrittenUrl(details.url)
    if (rewritten) {
      result.redirectURL = rewritten.redirectURL
      result.ruleset = rewritten.ruleset
    }
  }
  return result
}

function onBeforeRedirect (details, isPrivate) {
  if(!mainState.httpsEverywhereEnable) return
  if (shouldIgnoreUrl(details)) {
    return
  }
  const mainFrameUrl = getMainFrameUrl(details)
  if (!mainFrameUrl ) {
    return
  }
  // Ignore URLs that are not HTTP
  if (!['http:', 'https:'].includes(urlParse(details.url).protocol)) {
    return
  }

  var canonicalUrl = canonicalizeUrl(details.url)

  // If the URL is already blacklisted, we are done
  if (redirectBlacklist.includes(canonicalUrl)) {
    return
  }

  // Heuristic part 1: Count same-page redirects using the request ID
  if (details.id in redirectCounter) {
    redirectCounter[details.id] += 1
    if (redirectCounter[details.id] > 5) {
      // Blacklist this host
      console.log('blacklisting url from HTTPS Everywhere', canonicalUrl)
      redirectBlacklist.push(canonicalUrl)
      return
    }
  } else {
    redirectCounter[details.id] = 1
  }

  // Heuristic part 2: Count internal redirects for server-initiated redirects that
  // increase the request ID on every redirect.
  if (details.statusCode === 307 && ['mainFrame', 'subFrame'].includes(details.resourceType)) {
    if (canonicalUrl in recent307Counter) {
      recent307Counter[canonicalUrl] += 1
      if (recent307Counter[canonicalUrl] > 5) {
        // If this URL has been internally-redirected more than 5 times in 200
        // ms, it's probably an HTTPS-Everywhere redirect loop.
        console.log('blacklisting url from HTTPS Everywhere for too many 307s',canonicalUrl)
        redirectBlacklist.push(canonicalUrl)
      }
    } else {
      recent307Counter[canonicalUrl] = 1
      setTimeout(() => {
        recent307Counter[canonicalUrl] = 0
      }, 200)
    }
  }
}

/**
 * Canonicalizes a URL to host + pathname.
 * @param {string} url
 * @return {string}
 */
function canonicalizeUrl (url) {
  var parsed = urlParse(url)
  return [parsed.host, parsed.pathname].join('')
}

/**
 * Loads HTTPS Everywhere
 */
startHttpsEverywhere()

module.exports = startHttpsEverywhere