'use strict'

let shouldLog = null

/**
 * This method checks if a security message should be logged.
 * It does so by determining whether we're running as Electron,
 * which indicates that a developer is currently looking at the
 * app.
 *
 * @returns {boolean} - Should we log?
 */
const shouldLogSecurityWarnings = function () {
  if (shouldLog !== null) {
    return shouldLog
  }

  const { platform, execPath, env } = process

  switch (platform) {
    case 'darwin':
      shouldLog = execPath.endsWith('MacOS/Electron') ||
                  execPath.includes('Electron.app/Contents/Frameworks/')
      break
    case 'freebsd':
    case 'linux':
      shouldLog = execPath.endsWith('/electron')
      break
    case 'win32':
      shouldLog = execPath.endsWith('\\electron.exe')
      break
    default:
      shouldLog = false
  }

  if ((env && env.ELECTRON_DISABLE_SECURITY_WARNINGS) ||
      (window && window.ELECTRON_DISABLE_SECURITY_WARNINGS)) {
    shouldLog = false
  }

  if ((env && env.ELECTRON_ENABLE_SECURITY_WARNINGS) ||
      (window && window.ELECTRON_ENABLE_SECURITY_WARNINGS)) {
    shouldLog = true
  }

  return shouldLog
}

/**
 * Checks if the current window is remote.
 *
 * @returns {boolean} - Is this a remote protocol?
 */
const getIsRemoteProtocol = function () {
  if (window && window.location && window.location.protocol) {
    return /^(http|ftp)s?/gi.test(window.location.protocol)
  }
}

/**
 * Tries to determine whether a CSP without `unsafe-eval` is set.
 *
 * @returns {boolean} Is a CSP with `unsafe-eval` set?
 */
const isUnsafeEvalEnabled = function () {
  const { webFrame } = require('electron')

  return new Promise((resolve) => {
    webFrame.executeJavaScript(`(${(() => {
      try {
        new Function('') // eslint-disable-line no-new,no-new-func
      } catch (err) {
        return false
      }
      return true
    }).toString()})()`, resolve)
  })
}

const moreInformation = `\nFor more information and help, consult
https://electronjs.org/docs/tutorial/security.\n This warning will not show up
once the app is packaged.`

/**
 * #1 Only load secure content
 *
 * Checks the loaded resources on the current page and logs a
 * message about all resources loaded over HTTP or FTP.
 */
const warnAboutInsecureResources = function () {
  if (!window || !window.performance || !window.performance.getEntriesByType) {
    return
  }

  const resources = window.performance
    .getEntriesByType('resource')
    .filter(({ name }) => /^(http|ftp):/gi.test(name || ''))
    .map(({ name }) => `- ${name}`)
    .join('\n')

  if (!resources || resources.length === 0) {
    return
  }

  const warning = `This renderer process loads resources using insecure
  protocols.This exposes users of this app to unnecessary security risks.
  Consider loading the following resources over HTTPS or FTPS. \n ${resources}
  \n ${moreInformation}`

  console.warn('%cElectron Security Warning (Insecure Resources)',
    'font-weight: bold;', warning)
}

/**
 * #2 on the checklist: Disable the Node.js integration in all renderers that
 * display remote content
 *
 * Logs a warning message about Node integration.
 */
const warnAboutNodeWithRemoteContent = function (nodeIntegration) {
  if (!nodeIntegration) return

  if (getIsRemoteProtocol()) {
    const warning = `This renderer process has Node.js integration enabled
    and attempted to load remote content from '${window.location}'. This
    exposes users of this app to severe security risks.\n ${moreInformation}`

    console.warn('%cElectron Security Warning (Node.js Integration with Remote Content)',
      'font-weight: bold;', warning)
  }
}

// Currently missing since it has ramifications and is still experimental:
//   #3 Enable context isolation in all renderers that display remote content
//
// Currently missing since we can't easily programmatically check for those cases:
//   #4 Use ses.setPermissionRequestHandler() in all sessions that load remote content

/**
 * #5 on the checklist: Do not disable websecurity
 *
 * Logs a warning message about disabled webSecurity.
 */
const warnAboutDisabledWebSecurity = function (webPreferences) {
  if (!webPreferences || webPreferences.webSecurity !== false) return

  const warning = `This renderer process has "webSecurity" disabled. This
  exposes users of this app to severe security risks.\n ${moreInformation}`

  console.warn('%cElectron Security Warning (Disabled webSecurity)',
    'font-weight: bold;', warning)
}

/**
 * #6 on the checklist: Define a Content-Security-Policy and use restrictive
 * rules (i.e. script-src 'self')
 *
 * #7 on the checklist: Disable eval
 *
 * Logs a warning message about unset or insecure CSP
 */
const warnAboutInsecureCSP = function () {
  isUnsafeEvalEnabled().then((enabled) => {
    if (!enabled) return

    const warning = `This renderer process has either no Content Security
    Policy set or a policy with "unsafe-eval" enabled. This exposes users of
    this app to unnecessary security risks.\n ${moreInformation}`

    console.warn('%cElectron Security Warning (Insecure Content-Security-Policy)',
      'font-weight: bold;', warning)
  })
}

/**
 * #8 on the checklist: Do not set allowRunningInsecureContent to true
 *
 * Logs a warning message about disabled webSecurity.
 */
const warnAboutInsecureContentAllowed = function (webPreferences) {
  if (!webPreferences || !webPreferences.allowRunningInsecureContent) return

  const warning = `This renderer process has "allowRunningInsecureContent"
  enabled. This exposes users of this app to severe security risks.\n
  ${moreInformation}`

  console.warn('%cElectron Security Warning (allowRunningInsecureContent)',
    'font-weight: bold;', warning)
}

/**
 * #9 on the checklist: Do not enable experimental features
 *
 * Logs a warning message about experimental features.
 */
const warnAboutExperimentalFeatures = function (webPreferences) {
  if (!webPreferences || (!webPreferences.experimentalFeatures)) {
    return
  }

  const warning = `This renderer process has "experimentalFeatures" enabled.
  This exposes users of this app to some security risk. If you do not need
  this feature, you should disable it.\n ${moreInformation}`

  console.warn('%cElectron Security Warning (experimentalFeatures)',
    'font-weight: bold;', warning)
}

/**
 * #10 on the checklist: Do not use enableBlinkFeatures
 *
 * Logs a warning message about enableBlinkFeatures
 */
const warnAboutEnableBlinkFeatures = function (webPreferences) {
  if (webPreferences === null ||
    !webPreferences.hasOwnProperty('enableBlinkFeatures') ||
    webPreferences.enableBlinkFeatures.length === 0) {
    return
  }

  const warning = `This renderer process has additional "enableBlinkFeatures"
  enabled. This exposes users of this app to some security risk. If you do not
  need this feature, you should disable it.\n ${moreInformation}`

  console.warn('%cElectron Security Warning (enableBlinkFeatures)',
    'font-weight: bold;', warning)
}

/**
 * #11 on the checklist: Do Not Use allowpopups
 *
 * Logs a warning message about allowed popups
 */
const warnAboutAllowedPopups = function () {
  if (document && document.querySelectorAll) {
    const domElements = document.querySelectorAll('[allowpopups]')

    if (!domElements || domElements.length === 0) {
      return
    }

    const warning = `A <webview> has "allowpopups" set to true. This exposes
    users of this app to some security risk, since popups are just
    BrowserWindows. If you do not need this feature, you should disable it.\n
    ${moreInformation}`

    console.warn('%cElectron Security Warning (allowpopups)',
      'font-weight: bold;', warning)
  }
}

// Currently missing since we can't easily programmatically check for it:
//   #12WebViews: Verify the options and params of all `<webview>` tags

const logSecurityWarnings = function (webPreferences, nodeIntegration) {
  warnAboutNodeWithRemoteContent(nodeIntegration)
  warnAboutDisabledWebSecurity(webPreferences)
  warnAboutInsecureResources()
  warnAboutInsecureContentAllowed(webPreferences)
  warnAboutExperimentalFeatures(webPreferences)
  warnAboutEnableBlinkFeatures(webPreferences)
  warnAboutInsecureCSP()
  warnAboutAllowedPopups()
}

const getWebPreferences = function () {
  const ipcRenderer = require('@electron/internal/renderer/ipc-renderer-internal')
  const errorUtils = require('@electron/internal/common/error-utils')

  const [ error, result ] = ipcRenderer.sendSync('ELECTRON_BROWSER_GET_LAST_WEB_PREFERENCES')

  if (error) {
    console.warn(`getLastWebPreferences() failed: ${errorUtils.deserialize(error)}`)
    return null
  } else {
    return result
  }
}

module.exports = function (nodeIntegration) {
  const loadHandler = function () {
    if (shouldLogSecurityWarnings()) {
      const webPreferences = getWebPreferences()
      logSecurityWarnings(webPreferences, nodeIntegration)
    }
  }
  window.addEventListener('load', loadHandler, { once: true })
}
