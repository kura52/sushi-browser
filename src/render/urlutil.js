/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

// characters, then : with optional //
const topLevelDomains = /^((?:s(?:[dgjsvxz]|t(?:a(?:t(?:e(?:bank|farm)|oil)|r(?:hub)?|ples|da)|o(?:r(?:ag)?e|ckholm)|c(?:group)?|ud(?:io|y)|ream|yle)?|a(?:n(?:dvik(?:coromant)?|ofi)|ms(?:club|ung)|fe(?:ty)?|l(?:on|e)|arland|kura|po?|rl|ve|xo|s)?|h(?:o(?:p(?:ping)?|w(?:time)?|uji|es)|a(?:ngrila|rp|w)|i(?:ksh)?a|riram|ell)?|c(?:[ab]|h(?:o(?:larships|ol)|aeffler|midt|warz|ule)|johnson|ience|o[rt])?|e(?:cur(?:ity|e)|(?:rvice)?s|a(?:rch|t)|lect|ner|ven|xy?|ek|w)?|o(?:ft(?:bank|ware)|l(?:utions|ar)|c(?:cer|ial)|n[gy]|hu|y)?|u(?:pp(?:l(?:ies|y)|ort)|r(?:gery|f)|zuki|cks)?|p(?:readbetting|iegel|ace|ot)|w(?:i(?:ftcover|ss)|atch)|i(?:n(?:gles|a)|lk|te)?|y(?:mantec|stems|dney)?|k(?:y(?:pe)?|in?)?|m(?:art|ile)?|l(?:ing)?|n(?:cf)?|b[is]?|r[lt]?|fr)|c(?:[dgkmnvwxz]|o(?:m(?:p(?:a(?:ny|re)|uter)|m(?:unity|bank)|cast|sec)?|n(?:s(?:truction|ulting)|t(?:ractors|act)|dos)|o(?:[lp]|king(?:channel)?)|(?:l(?:leg|ogn)|ffe)e|u(?:pons?|ntry|rses)|rsica|ach|des)?|a(?:r(?:e(?:ers?)?|avan|tier|d?s)?|p(?:ital(?:one)?|etown)|s(?:[ah]|e(?:ih)?|ino)|n(?:cerresearch|on)|t(?:ering|holic)?|l(?:vinklein|l)?|m(?:era|p)?|fe|b)?|h(?:r(?:istmas|ysler|ome)|a(?:n?nel|se|t)|intai|urch|eap|loe)?|l(?:i(?:ni(?:que|c)|ck)|o(?:thing|ud)|ub(?:med)?|eaning|aims)?|i(?:t(?:y(?:eats)?|adel|ic?)|priani|rcle|sco)?|r(?:edit(?:union|card)?|uises?|icket|own|s)?|e(?:[bo]|nter|rn)|y(?:(?:mr|o)u)?|u(?:isinella)?|b(?:[ans]|re)|f[ad]?|s?c)|a(?:l(?:l(?:finanz|state|y)|i(?:baba|pay)|s(?:ace|tom)|faromeo)?|m(?:e(?:rican(?:express|family)|x)|(?:sterd|f)am|ica)?|c(?:c(?:ountants?|enture)|t(?:ive|or)|ademy|o)?|u(?:di(?:ble|o)?|t(?:hor|os?)|ction|spost)?|b(?:b(?:ott|vie)?|udhabi|ogado|arth|le|c)|r(?:a(?:mco|b)|chi|te?|my|pa)?|i(?:r(?:force|bus|tel)|go?)?|n(?:alytics|droid|quan|z)?|f(?:amilycompany|rica|l)?|p(?:artments|p(?:le)?)|s(?:sociates|[di]a)?|t(?:torney|hleta)?|g(?:akhan|ency)?|d(?:ult|ac|s)?|e(?:tna|ro|g)?|q(?:uarelle)?|a(?:rp|a)|z(?:ure)?|vianca|kdn|ol?|ws?|xa?)|b(?:[dfgjqstvwy]|a(?:r(?:c(?:lay(?:card|s)|elona)|efoot|gains)?|n(?:[dk]|a(?:narepublic|mex))|s(?:ket|e)ball|uhaus|yern|idu|by)?|o(?:[mtx]|o(?:k(?:ing)?|ts)?|s(?:t(?:ik|on)|ch)|ehringer|utique|ats|fa|nd)?|l(?:o(?:(?:omber)?g|ckbuster)|a(?:ck(?:friday)?|nco)|ue)?|r(?:o(?:(?:th|k)er|adway)|idgestone|adesco|ussels)?|e(?:a(?:uty|ts)|st(?:buy)?|ntley|rlin|er|t)?|u(?:ild(?:ers)?|dapest|siness|gatti|zz|y)|i(?:[doz]|(?:bl|k)e|ngo?)?|n(?:pparibas|l)?|b(?:[ct]|va)?|h(?:arti)?|m[sw]?|c[gn]|zh?)|m(?:[dfghknpqrvwxyz]|o(?:[eim]|n(?:tblanc|ster|ash|ey)|v(?:i(?:star|e))?|r(?:tgage|mon)|to(?:rcycles)?|bi(?:l[ey])?|scow|par|da)?|a(?:r(?:ket(?:ing|s)?|shalls|riott)|n(?:agement|go)?|i(?:son|f)|(?:keu)?p|serati|drid|ttel|cys)?|e(?:(?:lbourn|tlif)e|m(?:orial|e)|d(?:ia)?|rckmsd|nu?|et|o)?|i(?:t(?:subishi)?|crosoft|n[it]|ami|l)|c(?:d(?:onalds)?|kinsey)?|u(?:tu(?:elle|al)|seum)?|t(?:[nr]|pc)?|l[bs]?|ma?|sd?|ba)|f(?:[jkm]|i(?:r(?:(?:eston)?|mdal)e|na(?:nc(?:ial|e)|l)|d(?:elity|o)|sh(?:ing)?|t(?:ness)?|at|lm)?|o(?:o(?:d(?:network)?|tball)?|r(?:sale|ex|um|d)|undation|x)?|a(?:i(?:rwinds|th|l)|s(?:hion|t)|rm(?:ers)?|mily|ns?|ge)|l(?:i(?:(?:ck)?r|ghts)|o(?:rist|wers)|smidth|y)|r(?:o(?:nt(?:doo|ie)r|gans)|e(?:senius|e)|l)?|u(?:ji(?:xerox|tsu)|rniture|tbol|nd?)|e(?:rr(?:ari|ero)|edback|dex)|tr|yi)|t(?:[fglnptwz]|r(?:a(?:vel(?:ers(?:insurance)?|channel)?|d(?:ing|e)|ining)|ust|v)?|e(?:l(?:e(?:fonica|city))?|ch(?:nology)?|masek|nnis|am|va)|o(?:(?:ol|ur)s|y(?:ota|s)|[dr]ay|shiba|kyo|tal|wn|p)?|a(?:t(?:a(?:motors|r)|too)|ipei|obao|rget|xi?|lk|b)|i(?:(?:cket|p)s|(?:end|a)a|r(?:es|ol)|ffany)|h(?:eat(?:er|re)|d)?|u(?:nes|shu|be|i)|j(?:(?:max)?x)?|k(?:maxx)?|m(?:all)?|ci?|dk?|vs?)|p(?:[gkmsty]|r(?:o(?:d(?:uctions)?|pert(?:ies|y)|gressive|tection|mo|f)?|a(?:merica|xi)|u(?:dential)?|ess|ime)?|a(?:r(?:t(?:(?:ner)?s|y)|i?s)|n(?:asonic|erai)|mperedchef|ssagens|ge|y)?|h(?:o(?:to(?:graphy|s)?|ne)|armacy|ilips|ysio|d)?|i(?:c(?:t(?:ures|et)|s)|n[gk]?|oneer|aget|zza|d)|l(?:a(?:y(?:station)?|ce)|u(?:mbing|s))?|o(?:litie|ker|hl|rn|st)|f(?:izer)?|ccw|et?|nc?|wc?|ub)|l(?:[bckrvy]|a(?:n(?:c(?:aster|ome|ia)|d(?:rover)?|xess)|m(?:borghini|er)|t(?:robe|ino)?|w(?:yer)?|dbrokes|caixa|salle)?|i(?:fe(?:(?:insuranc|styl)e)?|n(?:coln|de|k)|m(?:ited|o)|(?:ll|ps)y|v(?:ing|e)|(?:xi|d)l|ghting|aison|ke)?|o(?:c(?:ker|us)|tt[eo]|ans?|ndon|ft|ve|l)|e(?:g(?:al|o)|clerc|frak|ase|xus)|u(?:x(?:ury|e)|ndbeck|pin)?|p(?:lfinancia)?l|t(?:da?)?|d?s|gbt)|g(?:[fhnpqstwy]|o(?:[ptv]|o(?:d(?:hands|year)|g(?:le)?)?|l(?:d(?:point)?|f)|daddy)|r(?:a(?:(?:phic|ti)s|inger)|o(?:cery|up)|een|ipe)?|a(?:l(?:l(?:ery|up|o))?|mes?|rden|p)?|u(?:i(?:tars|de)|ardian|cci|ge|ru)?|l(?:a(?:de|ss)|ob(?:al|o)|e)?|e(?:nt(?:ing)?|orge|a)?|i(?:v(?:ing|es)|fts?)?|m(?:[ox]|ail|bh)?|b(?:iz)?|g(?:ee)?|dn?)|d(?:[jmz]|e(?:l(?:ivery|oitte|ta|l)|nt(?:ist|al)|al(?:er|s)?|si(?:gn)?|mocrat|gree|v)?|i(?:s(?:co(?:unt|ver)|h)|rect(?:ory)?|amonds|gital|et|y)|o(?:[gt]|c(?:tor|s)|wnload|mains|osan|dge|ha)?|a(?:[dy]|t(?:[ae]|ing|sun)|bur|nce)|u(?:n(?:lop|s)|pont|rban|bai|ck)|v(?:ag|r)|(?:cl)?k|rive|ds|hl|np|tv)|r(?:e(?:a(?:l(?:t(?:or|y)|estate)|d)|d(?:umbrella|stone)?|p(?:ublican|air|ort)|n(?:t(?:als)?)?|s(?:tauran)?t|i(?:sen?|t)|liance|views?|cipes|xroth|hab)?|i(?:[lop]|c(?:h(?:ardli)?|oh)|ghtathome)|o(?:c(?:her|ks)|gers|deo|om)?|a(?:cing|dio|id)|u(?:gby|hr|n)?|s(?:vp)?|yukyu|mit|we?)|h(?:[mnr]|o(?:me(?:s(?:ense)?|depot|goods)|s(?:t(?:ing)?|pital)|t(?:ele?s|mail)?|l(?:dings|iday)|n(?:eywell|da)|[ru]se|ckey|w)|e(?:alth(?:care)?|l(?:sinki|p)|r(?:mes|e))|i(?:samitsu|tachi|phop|v)|a(?:mburg|ngout|ir|us)|y(?:undai|att)|dfc(?:bank)?|u(?:ghes)?|gtv|kt?|sbc|tc?|bo)|e(?:[egh]|x(?:(?:traspac|chang)e|p(?:osed|ress|ert))|n(?:gineer(?:ing)?|terprises|ergy)|(?:(?:tisala)?|quipmen)t|s(?:(?:uranc|tat)e|q)?|d(?:u(?:cation)?|eka)|u(?:rovision|s)?|r(?:icsson|ni)?|ve(?:rbank|nts)|m(?:erck|ail)|p(?:ost|son)|a(?:rth|t)|co?)|i(?:[dlq]|n(?:[gk]|t(?:e(?:rnationa)?l|uit)?|s(?:ur(?:anc)?|titut)e|(?:vestment|dustrie)s|f(?:initi|o))?|s(?:t(?:anbul)?|elect|maili)?|m(?:mo(?:bilien)?|amat|db)?|(?:kan|vec)?o|c(?:[eu]|bc)|t(?:au|v)?|r(?:ish)?|(?:ee)?e|piranga|[bf]m|inet|wc)|n(?:[lpuz]|e(?:t(?:(?:ban|wor)k|flix)?|x(?:(?:tdirec)?t|us)|w(?:holland|s)?|ustar|c)?|o(?:rt(?:hwesternmutual|on)|w(?:ruz|tv)?|kia)?|a(?:t(?:ionwide|ura)|goya|dex|me|vy|b)?|i(?:k(?:on|e)|ssa[ny]|nja|co)?|r[aw]?|fl?|go?|y?c|ba|hk|tt)|v(?:[cg]|i(?:s(?:ta(?:print)?|ion|a)|(?:aje|lla)s|(?:kin)?g|(?:rgi)?n|v[ao]|deo|p)?|o(?:l(?:kswagen|vo)|t(?:[eo]|ing)|yage|dka)|e(?:r(?:sicherung|isign)|(?:nture|ga)s|t)?|a(?:n(?:guard|a)|cations)?|(?:laandere)?n|u(?:elos)?)|w(?:[fs]|e(?:ather(?:channel)?|b(?:site|cam|er)|d(?:ding)?|i(?:bo|r))|a(?:l(?:mart|ter|es)|ng(?:gou)?|tch(?:es)?|rman)|i(?:n(?:(?:dow|ner)s|e)?|lliamhill|en|ki)|o(?:lterskluwer|r(?:ks?|ld)|odside|w)|hoswho|t[cf]|me)|o(?:r(?:i(?:entexpres|gin)s|a(?:cl|ng)e|g(?:anic)?)|n(?:(?:yoursid)?e|l(?:ine)?|g)|l(?:ayan(?:group)?|dnavy|lo)|(?:kinaw|sak)a|b(?:server|i)|t(?:suka|t)|ff(?:ice)?|m(?:ega)?|pen|oo|vh)|k(?:[gmwz]|e(?:rry(?:propertie|logistic|hotel)s)?|i(?:[am]|nd(?:er|le)|tchen|wi)?|o(?:matsu|sher|eln)|(?:aufe)?n|p(?:mg|n)?|r(?:e?d)?|y(?:oto)?|uokgroup|ddi|f?h)|j(?:o(?:[ty]|b(?:urg|s))?|e(?:welry|tzt|ep)?|p(?:morgan|rs)?|u(?:niper|egos)|a(?:guar|va)|c[bp]|l[cl]|mp?|io|nj)|y(?:[et]|o(?:(?:koham|g)a|u(?:tube)?|dobashi)|a(?:maxun|chts|ndex|hoo)|un)|u(?:[agkmyz]|n(?:i(?:versity|com)|o)|b(?:ank|s)|connect|p?s|ol)|x(?:(?:(?:er|b)o|x)x|i(?:hua)?n|finity|peria|yz)|z(?:[mw]|a(?:ppos|ra)?|ip(?:po)?|uerich|ero|one)|q(?:ue(?:bec|st)|pon|vc|a)))$/
const rscheme = /^(?:[a-z\u00a1-\uffff0-9-+]+)(?::(\/\/)?)(?!\d)/i
const httpScheme = 'http://'
const httpsScheme = 'https://'
const fileScheme = 'file://'
const defaultScheme = httpScheme
const os = require('os')
const punycode = require('punycode')
const urlParse = require('url').parse
const urlFormat = require('url').format

/**
 * A simple class for parsing and dealing with URLs.
 * @class UrlUtil
 */
const UrlUtil = {

  /**
   * Extracts the scheme from a value.
   * @param {String} input The input value.
   * @returns {String} The found scheme.
   */
  getScheme: function (input) {
    // This function returns one of following:
    // - scheme + ':' (ex. http:)
    // - scheme + '://' (ex. http://)
    // - null
    let scheme = (rscheme.exec(input) || [])[0]
    return scheme === 'localhost://' ? null : scheme
  },

  /**
   * Checks if an input has a scheme (e.g., http:// or ftp://).
   * @param {String} input The input value.
   * @returns {Boolean} Whether or not the input has a scheme.
   */
  hasScheme: function (input) {
    return !!UrlUtil.getScheme(input)
  },

  /**
   * Prepends file scheme for file paths, otherwise the default scheme
   * @param {String} input path, with opetional schema
   * @returns {String} path with a scheme
   */
  prependScheme: function (input) {
    if (input === undefined || input === null) {
      return input
    }

    // expand relative path
    if (input.startsWith('~/')) {
      input = input.replace(/^~/, os.homedir())
    }

    // detect absolute file paths
    if (input.startsWith('/')) {
      input = fileScheme + input
    }

    // If there's no scheme, prepend the default scheme
    if (!UrlUtil.hasScheme(input)) {
      input = defaultScheme + input
    }

    return input
  },

  canParseURL: function (input) {
    if (typeof window === 'undefined') {
      return true
    }
    try {
      let url = new window.URL(input)
      return !!url
    } catch (e) {
      return false
    }
  },

  canParseURL2: function (input) {
    if (typeof window === 'undefined') {
      return true
    }
    try {
      let url = new window.URL(input)
      if(!url) return false
      const urlSplit = url.hostname.split(".")
      const topLevelDomain = urlSplit[urlSplit.length-1]

      return topLevelDomains.test(topLevelDomain)
    } catch (e) {
      return false
    }
  },

  isImageAddress (url) {
    return (url.match(/\.(jpeg|jpg|gif|png|bmp)$/))
  },

  /**
   * Checks if a string is not a URL.
   * @param {String} input The input value.
   * @returns {Boolean} Returns true if this is not a valid URL.
   */
  isNotURL: function (input) {
    if (input === undefined || input === null) {
      return true
    }
    if (typeof input !== 'string') {
      return true
    }
    // for cases where we have scheme and we dont want spaces in domain names
    const caseDomain = /^[\w]{2,5}:\/\/[^\s/]+\//
    // for cases, quoted strings
    const case1Reg = /^".*"$/
    // for cases:
    // - starts with "?" or "."
    // - contains "? "
    // - ends with "." (and was not preceded by a domain or /)
    const case2Reg = /(^\?)|(\?.+\s)|(^\.)|(^[^.+]*[^/]*\.$)/
    // for cases, pure string
    const case3Reg = /[?./\s:]/
    // for cases, data:uri, view-source:uri and about
    const case4Reg = /^(data|view-source|mailto|about|chrome-extension|chrome-devtools|magnet|chrome|file):.*/

    let str = input.trim()
    const scheme = UrlUtil.getScheme(str)

    console.log(scheme)

    if (str.toLowerCase() === 'localhost') {
      return false
    }
    if (case1Reg.test(str)) {
      return true
    }
    if(str.startsWith("javascript:")){
      return false
    }
    if (case2Reg.test(str) || !case3Reg.test(str) ||
        (scheme === undefined && /\s/g.test(str))) {
      return true
    }
    if (case4Reg.test(str)) {
      return !UrlUtil.canParseURL(str)
    }
    if (scheme && (scheme !== fileScheme)) {
      return !caseDomain.test(str + '/')
    }
    str = UrlUtil.prependScheme(str)
    return !UrlUtil.canParseURL2(str)
  },

  /**
   * Converts an input string into a URL.
   * @param {String} input The input value.
   * @returns {String} The formatted URL.
   */
  getUrlFromInput: function (input) {
    if (input === undefined || input === null) {
      return ''
    }

    input = input.trim()

    input = UrlUtil.prependScheme(input)

    if (UrlUtil.isNotURL(input)) {
      return input
    }

    try {
      return new window.URL(input).href
    } catch (e) {
      return input
    }
  },

  /**
   * Checks if a given input is a valid URL.
   * @param {String} input The input URL.
   * @returns {Boolean} Whether or not this is a valid URL.
   */
  isURL: function (input) {
    input = input.trim()
    return !UrlUtil.isNotURL(input)
  },

  /**
   * Checks if a URL has a given file type.
   * @param {string} url - URL to check
   * @param {string} ext - File extension
   * @return {boolean}
   */
  isFileType: function (url, ext) {
    const pathname = urlParse(url).pathname
    if (!pathname) {
      return false
    }
    return pathname.toLowerCase().endsWith('.' + ext)
  },

  /**
   * Checks if a URL is a view-source URL.
   * @param {String} input The input URL.
   * @returns {Boolean} Whether or not this is a view-source URL.
   */
  isViewSourceUrl: function (url) {
    return url.toLowerCase().startsWith('view-source:')
  },

  /**
   * Checks if a url is a data url.
   * @param {String} input The input url.
   * @returns {Boolean} Whether or not this is a data url.
   */
  isDataUrl: function (url) {
    return typeof url === 'string' && url.toLowerCase().startsWith('data:')
  },

  /**
   * Checks if a url is a phishable url.
   * @param {String} input The input url.
   * @returns {Boolean}
   */
  isPotentialPhishingUrl: function (url) {
    if (typeof url !== 'string') { return false }
    const protocol = urlParse(url.trim().toLowerCase()).protocol
    return ['data:', 'blob:'].includes(protocol)
  },

  /**
   * Checks if a url is an image data url.
   * @param {String} input The input url.
   * @returns {Boolean} Whether or not this is an image data url.
   */
  isImageDataUrl: function (url) {
    return url.toLowerCase().startsWith('data:image/')
  },

  /**
   * Converts a view-source url into a standard url.
   * @param {String} input The view-source url.
   * @returns {String} A normal url.
   */
  getUrlFromViewSourceUrl: function (input) {
    if (!UrlUtil.isViewSourceUrl(input)) {
      return input
    }
    return UrlUtil.getUrlFromInput(input.substring('view-source:'.length))
  },

  /**
   * Converts a URL into a view-source URL.
   * @param {String} input The input URL.
   * @returns {String} The view-source URL.
   */
  getViewSourceUrlFromUrl: function (input) {
    if ((!UrlUtil.isHttpOrHttps(input) && !UrlUtil.isFileScheme(input)) || UrlUtil.isImageAddress(input)) {
      return null
    }
    if (UrlUtil.isViewSourceUrl(input)) {
      return input
    }

    // Normalizes the actual URL before the view-source: scheme like prefix.
    return 'view-source:' + UrlUtil.getUrlFromViewSourceUrl(input)
  },

  /**
   * Extracts the hostname or returns undefined.
   * @param {String} input The input URL.
   * @returns {String} The host name.
   */
  getHostname: function (input, excludePort) {
    try {
      if (excludePort) {
        return new window.URL(input).hostname
      }
      return new window.URL(input).host
    } catch (e) {
      return undefined
    }
  },

  /**
   * Gets applicable hostname patterns for a given URL. Ex: for x.y.google.com,
   * rulesets matching x.y.google.com, *.y.google.com, and *.google.com are
   * applicable.
   * @param {string} url The url to get hostname patterns for
   * @return {Array.<string>}
   */
  getHostnamePatterns: function (url) {
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
  },

  /**
   * Gets PDF location from a potential PDFJS URL
   * @param {string} url
   * @return {string}
   */
  getLocationIfPDF: function (url) {
    if (!url || url.indexOf(`chrome-extension://${pdfjsExtensionId}/`) === -1) {
      return url
    }

    if (url.indexOf('content/web/viewer.html?file=') !== -1) {
      const querystring = require('querystring')
      const parsedUrl = urlParse(url)
      const query = querystring.parse(parsedUrl.query)
      if (query && query.file) {
        return query.file
      }
    }
    return url.replace(`chrome-extension://${pdfjsExtensionId}/`, '')
  },

  /**
   * Converts a potential PDF URL to the PDFJS URL.
   * XXX: This only looks at the URL file extension, not MIME types.
   * @param {string} url
   * @return {string}
   */
  toPDFJSLocation: function (url) {
    if (url && UrlUtil.isHttpOrHttps(url) && UrlUtil.isFileType(url, 'pdf')) {
      return `chrome-extension://${pdfjsExtensionId}/${url}`
    }
    return url
  },

  /**
   * Gets the default favicon URL for a URL.
   * @param {string} url The URL to find a favicon for
   * @return {string} url The base favicon URL
   */
  getDefaultFaviconUrl: function (url) {
    if (UrlUtil.isURL(url)) {
      const loc = urlParse(url)
      return loc.protocol + '//' + loc.host + '/favicon.ico'
    }
    return ''
  },

  getPunycodeUrl: function (url) {
    try {
      const parsed = urlParse(url)
      parsed.hostname = punycode.toASCII(parsed.hostname)
      return urlFormat(parsed)
    } catch (e) {
      return url
    }
  },

  /**
   * Gets the hostPattern from an URL.
   * @param {string} url The URL to get the hostPattern from
   * @return {string} url The URL formmatted as an hostPattern
   */
  getHostPattern: function (url) {
    return `https?://${url}`
  },

  /**
   * Checks if URL is based on http protocol.
   * @param {string} url - URL to check
   * @return {boolean}
   */
  isHttpOrHttps: function (url) {
    return url.startsWith(httpScheme) || url.startsWith(httpsScheme)
  },

  /**
   * Checks if URL is based on file protocol.
   * @param {string} url - URL to check
   * @return {boolean}
   */
  isFileScheme: function (url) {
    return this.getScheme(url) === fileScheme
  },

  /**
   * Gets the origin of a given URL
   * @param {string} url The URL to get the origin from
   * @return {string} url The origin of the given URL
   */
  getUrlOrigin: function (url) {
    return new window.URL(url).origin
  },

  isLocalFile: function (origin) {
    if (!origin) {
      return false
    }

    const localFileOrigins = ['file:', 'blob:', 'data:', 'chrome-extension:', 'chrome:']
    return origin && localFileOrigins.some((localFileOrigin) => origin.startsWith(localFileOrigin))
  },

  getDisplayHost: (url) => {
    const parsedUrl = urlParse(url)
    if (parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:') {
      return parsedUrl.host
    }

    return url
  },

  /**
   * Gets a site origin (scheme + hostname + port) from a URL or null if not
   * available.
   * @param {string} location
   * @return {string|null}
   */
  getOrigin: (location) => {
    // Returns scheme + hostname + port
    if (typeof location !== 'string') {
      return null
    }

    if (location.startsWith('file://')) {
      return 'file:///'
    }

    let parsed = urlParse(location)
    if (parsed.host && parsed.protocol) {
      return parsed.slashes ? [parsed.protocol, parsed.host].join('//') : [parsed.protocol, parsed.host].join('')
    } else {
      return null
    }
  }
}

module.exports = UrlUtil
