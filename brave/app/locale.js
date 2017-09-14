/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const L20n = require('l20n')
const path = require('path')
const ipcMain = require('electron').ipcMain
const electron = require('electron')
const app = electron.app
const {LANGUAGE, REQUEST_LANGUAGE} = require('../js/constants/messages')

// Exhaustive list of identifiers used by top and context menus
var rendererIdentifiers = function () {
  return [
    'downloadsManager',
    'confirmClearPasswords',
    'passwordCopied',
    'flashInstalled',
    'goToPrefs',
    'goToAdobe',
    'allowFlashPlayer',
    'allowWidevine',
    'about',
    'aboutApp',
    'quit',
    'quitApp',
    'addToReadingList',
    'viewPageSource',
    'copyImageAddress',
    'openImageInNewTab',
    'saveImage',
    'copyImage',
    'searchImage',
    'copyLinkAddress',
    'copyEmailAddress',
    'saveLinkAs',
    'allowFlashOnce',
    'allowFlashAlways',
    'openFlashPreferences',
    'openInNewWindow',
    'openInNewSessionTab',
    'openInNewSessionTabs',
    'openInNewPrivateTab',
    'openInNewPrivateTabs',
    'openInNewTab',
    'openInNewTabs',
    'openAllInTabs',
    'disableAdBlock',
    'disableTrackingProtection',
    'muteTab',
    'unmuteTab',
    'pinTab',
    'unpinTab',
    'deleteFolder',
    'deleteBookmark',
    'deleteBookmarks',
    'deleteHistoryEntry',
    'deleteHistoryEntries',
    'deleteLedgerEntry',
    'ledgerBackupText1',
    'ledgerBackupText2',
    'ledgerBackupText3',
    'ledgerBackupText4',
    'ledgerBackupText5',
    'editFolder',
    'editBookmark',
    'unmuteTabs',
    'muteTabs',
    'muteOtherTabs',
    'addBookmark',
    'addFolder',
    'newTab',
    'closeTab',
    'closeOtherTabs',
    'closeTabsToRight',
    'closeTabsToLeft',
    'closeTabPage',
    'bookmarkPage',
    'bookmarkLink',
    'openFile',
    'openLocation',
    'openSearch',
    'importFrom',
    'closeWindow',
    'savePageAs',
    'share',
    'undo',
    'redo',
    'cut',
    'copy',
    'paste',
    'pasteAndGo',
    'pasteAndSearch',
    'pasteWithoutFormatting',
    'delete',
    'selectAll',
    'findNext',
    'findPrevious',
    'file',
    'edit',
    'view',
    'actualSize',
    'zoomIn',
    'zoomOut',
    'toolbars',
    'stop',
    'reloadPage',
    'reloadTab',
    'cleanReload',
    'reload',
    'clone',
    'detach',
    'readingView',
    'tabManager',
    'textEncoding',
    'inspectElement',
    'toggleDeveloperTools',
    'toggleBrowserConsole',
    'toggleFullScreenView',
    'home',
    'back',
    'forward',
    'reopenLastClosedWindow',
    'showAllHistory',
    'clearCache',
    'clearHistory',
    'clearSiteData',
    'clearBrowsingData',
    'recentlyClosed',
    'recentlyVisited',
    'bookmarks',
    'addToFavoritesBar',
    'window',
    'minimize',
    'zoom',
    'selectNextTab',
    'selectPreviousTab',
    'moveTabToNewWindow',
    'mergeAllWindows',
    'downloads',
    'history',
    'bringAllToFront',
    'help',
    'sendUsFeedback',
    'services',
    'hideBrave',
    'hideOthers',
    'showAll',
    'newPrivateTab',
    'newSessionTab',
    'newWindow',
    'reopenLastClosedTab',
    'print',
    'emailPageLink',
    'tweetPageLink',
    'facebookPageLink',
    'pinterestPageLink',
    'googlePlusPageLink',
    'linkedInPageLink',
    'bufferPageLink',
    'redditPageLink',
    'findOnPage',
    'find',
    'checkForUpdates',
    'preferences',
    'settings',
    'bookmarksManager',
    'importBrowserData',
    'exportBookmarks',
    'submitFeedback',
    'bookmarksToolbar',
    'bravery',
    'braverySite',
    'braveryGlobal',
    'braveryPayments',
    'braveryStartUsingPayments',
    'blockPopups',
    'learnSpelling',
    'forgetLearnedSpelling',
    'lookupSelection',
    // Other identifiers
    'aboutBlankTitle',
    'urlCopied',
    'autoHideMenuBar',
    'unexpectedErrorWindowReload',
    'updateChannel',
    'licenseText',
    'allow',
    'deny',
    'permissionCameraMicrophone',
    'permissionLocation',
    'permissionNotifications',
    'permissionWebMidi',
    'permissionDisableCursor',
    'permissionFullscreen',
    'permissionExternal',
    'permissionProtocolRegistration',
    'permissionMessage',
    'tabsSuggestionTitle',
    'bookmarksSuggestionTitle',
    'historySuggestionTitle',
    'aboutPagesSuggestionTitle',
    'searchSuggestionTitle',
    'topSiteSuggestionTitle',
    'addFundsNotification',
    'reconciliationNotification',
    'reviewSites',
    'addFunds',
    'turnOffNotifications',
    'copyToClipboard',
    'smartphoneTitle',
    'displayQRCode',
    'updateLater',
    'updateHello',
    'notificationPasswordWithUserName',
    'notificationUpdatePasswordWithUserName',
    'notificationUpdatePassword',
    'notificationPassword',
    'notificationPasswordSettings',
    'notificationPaymentDone',
    'notificationTryPayments',
    'notificationTryPaymentsYes',
    'prefsRestart',
    'areYouSure',
    'dismiss',
    'yes',
    'no',
    'noThanks',
    'neverForThisSite',
    'passwordsManager',
    'extensionsManager',
    'downloadItemPause',
    'downloadItemResume',
    'downloadItemCancel',
    'downloadItemRedownload',
    'downloadItemCopyLink',
    'downloadItemPath',
    'downloadItemDelete',
    'downloadItemClear',
    'downloadToolbarHide',
    'downloadItemClearCompleted',
    'torrentDesc',
    // Caption buttons in titlebar (min/max/close - Windows only)
    'windowCaptionButtonMinimize',
    'windowCaptionButtonMaximize',
    'windowCaptionButtonRestore',
    'windowCaptionButtonClose',
    'closeFirefoxWarning',
    'importSuccess',
    'licenseTextOk',
    'closeFirefoxWarningOk',
    'importSuccessOk',
    'connectionError',
    'unknownError',
    'allowAutoplay',

    //Add
    'default',
    'name',
    'searchEngine',
    'searchEngines',
    'engineGoKey',
    'general',
    'generalSettings',
    'search',
    'tabs',
    'extensions',
    'myHomepage',
    'startsWith',
    'startsWithOptionLastTime',
    'newTabMode',
    'newTabEmpty',
    'import',
    'bn-BD',
    'bn-IN',
    'zh-CN',
    'cs',
    'nl-NL',
    'en-US',
    'fr-FR',
    'de-DE',
    'hi-IN',
    'id-ID',
    'it-IT',
    'ja-JP',
    'ko-KR',
    'ms-MY',
    'pl-PL',
    'pt-BR',
    'ru',
    'sl',
    'es',
    'ta',
    'te',
    'tr-TR',
    'uk',
    'requiresRestart',
    'enableFlash',
    'startsWithOptionHomePage',
    'updateAvail',
    'notNow',
    'makeBraveDefault',
    'saveToPocketDesc',

    //chrome
    '994289308992179865',
    '1725149567830788547',
    '4643612240819915418',
    '4256316378292851214',
    '2019718679933488176',
    '782057141565633384',
    '5116628073786783676',
    '1465176863081977902',
    '3007771295016901659',
    '5078638979202084724',
    '4589268276914962177',
    '3551320343578183772',
    '2448312741937722512',
    '1524430321211440688',
    '42126664696688958',
    '2663302507110284145',
    '3635030235490426869',
    '4888510611625056742',
    '5860209693144823476',
    '5846929185714966548',
    '7955383984025963790',
    '3128230619496333808',
    '3391716558283801616',
    '6606070663386660533',
    '9011178328451474963',
    '9065203028668620118',
    '2473195200299095979',
    '1047431265488717055',
    '9218430445555521422',
    '8926389886865778422',
    '2893168226686371498',
    '4289540628985791613',
    '3095995014811312755',
    '59174027418879706',
    '6550675742724504774'
  ]
}

var ctx = null
var translations = {}
var lang = 'en-US'

// todo: FSI/PDI stripping can probably be replaced once
// https://github.com/l20n/l20n.js/commit/2fea50bf43c43a8e930a519a37f0f64f3626e885
// is released
const FSI = '\u2068'
const PDI = '\u2069'

// Return a translate token from cache or a placeholder
// indicating that no translation is available
exports.translation = function (token, replacements = {}) {
  if (translations[token]) {
    let returnVal = translations[token]
    for (var key in replacements) {
      returnVal = returnVal.replace(new RegExp(FSI + '{{\\s*' + key + '\\s*}}' + PDI), replacements[key])
    }
    return returnVal
  } else {
    // This will return an identifier in upper case useful for determining if a translation was not requested in the menu
    // identifiers above.
    return token.toUpperCase()
  }
}

// Default language locale identifier
const DEFAULT_LANGUAGE = 'en-US'

const availableLanguages = [
  'bn-BD',
  'bn-IN',
  'zh-CN',
  'cs',
  'nl-NL',
  'en-US',
  'fr-FR',
  'de-DE',
  'hi-IN',
  'id-ID',
  'it-IT',
  'ja-JP',
  'ko-KR',
  'ms-MY',
  'pl-PL',
  'pt-BR',
  'ru',
  'sl',
  'es',
  'ta',
  'te',
  'tr-TR',
  'uk'
]

const convertMap = {
  'ja-JA':'ja-JP',
  'zh-ZH':'zh-CN',
  'en-EN':'en-US',
  'ko-KO':'ko-KR',
  'ms-MS':'ms-MY',
  'bn-BN':'bn-IN',
  'hi-HI':'hi-IN'
}

// Currently configured languages
const configuredLanguages = {}
availableLanguages.forEach(function (lang) {
  configuredLanguages[lang] = true
})

// Return the default locale in xx-XX format I.e. pt-BR
const defaultLocale = function () {
  // If electron has the locale
  if (app.getLocale()) {
    // Retrieve the language and convert _ to -
    var lang = app.getLocale().replace('_', '-')
    // If there is no country code designated use the language code
    if (!configuredLanguages[lang] && !lang.match(/-/)) {
      lang = lang + '-' + lang.toUpperCase()
    }
    lang = convertMap[lang] || lang

    // If we have the language configured
    if (configuredLanguages[lang]) {
      return lang
    } else {
      return DEFAULT_LANGUAGE
    }
  } else {
    return DEFAULT_LANGUAGE
  }
}
exports.defaultLocale = defaultLocale

// Initialize translations for a language
exports.init = function (language) {
  // If this is in the main process
  if (ipcMain) {
    // Respond to requests for translations from the renderer process
    ipcMain.on('translations', function (event, arg) {
      // Return the entire set of translations synchronously
      event.returnValue = translations
    })

    // TODO: There shouldn't need to be a REQUEST_LANGUAGE event at all
    // Respond to requests for the currently configured language code
    ipcMain.on(REQUEST_LANGUAGE, function (event) {
      event.sender.send(LANGUAGE, {
        langCode: lang,
        languageCodes: availableLanguages
      })
    })
  }

  // Currently selected language identifier I.e. 'en-US'
  lang = language || defaultLocale()

  // Languages to support
  const langs = availableLanguages.map(function (lang) {
    return { code: lang }
  })

  const propertyFiles = []
  const appendLangProperties = function (lang) {
    // Property files to parse (only ones containing menu specific identifiers)
    propertyFiles.push(
      path.join(__dirname, '../../resource/extension/default/1.0_0/locales', lang, 'extensions.properties').replace(/app.asar([\/\\])/,'app.asar.unpacked$1'),
      path.join(__dirname, '../../resource/extension/default/1.0_0/locales', lang, 'menu.properties').replace(/app.asar([\/\\])/,'app.asar.unpacked$1'),
      path.join(__dirname, '../../resource/extension/default/1.0_0/locales', lang, 'app.properties').replace(/app.asar([\/\\])/,'app.asar.unpacked$1'),
      path.join(__dirname, '../../resource/extension/default/1.0_0/locales', lang, 'error.properties').replace(/app.asar([\/\\])/,'app.asar.unpacked$1'),
      path.join(__dirname, '../../resource/extension/default/1.0_0/locales', lang, 'passwords.properties').replace(/app.asar([\/\\])/,'app.asar.unpacked$1'),
      path.join(__dirname, '../../resource/extension/default/1.0_0/locales', lang, 'common.properties').replace(/app.asar([\/\\])/,'app.asar.unpacked$1'),
      path.join(__dirname, '../../resource/extension/default/1.0_0/locales', lang, 'newtab.properties').replace(/app.asar([\/\\])/,'app.asar.unpacked$1'),
      path.join(__dirname, '../../resource/extension/default/1.0_0/locales', lang, 'preferences.properties').replace(/app.asar([\/\\])/,'app.asar.unpacked$1'),
      path.join(__dirname, '../../resource/extension/default/1.0_0/locales', lang, 'chrome.properties').replace(/app.asar([\/\\])/,'app.asar.unpacked$1'))
  }

  appendLangProperties(lang)
  if (lang !== DEFAULT_LANGUAGE) {
    // Pass in the default locale as well
    appendLangProperties(DEFAULT_LANGUAGE)
  }

  // If langs change a new context must be created
  const env = new L20n.Env(L20n.fetchResource)
  ctx = env.createContext(langs, propertyFiles)

  // Translate the renderer identifiers
  var identifiers = rendererIdentifiers()
  return ctx.formatValues.apply(ctx, identifiers).then(function (values) {
    // Cache the translations for later retrieval
    values.forEach(function (value, idx) {
      translations[identifiers[idx]] = value
    })
    return lang
  })
}
