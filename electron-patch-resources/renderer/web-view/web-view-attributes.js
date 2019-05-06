'use strict'

const ipcRenderer = require('@electron/internal/renderer/ipc-renderer-internal')
const WebViewImpl = require('@electron/internal/renderer/web-view/web-view')
const webViewConstants = require('@electron/internal/renderer/web-view/web-view-constants')
const errorUtils = require('@electron/internal/common/error-utils')

// Helper function to resolve url set in attribute.
const a = document.createElement('a')

const resolveURL = function (url) {
  if (url === '') return ''
  a.href = url
  return a.href
}

// Attribute objects.
// Default implementation of a WebView attribute.
class WebViewAttribute {
  constructor (name, webViewImpl) {
    this.name = name
    this.value = webViewImpl.webviewNode[name] || ''
    this.webViewImpl = webViewImpl
    this.ignoreMutation = false
    this.defineProperty()
  }

  // Retrieves and returns the attribute's value.
  getValue () {
    return this.webViewImpl.webviewNode.getAttribute(this.name) || this.value
  }

  // Sets the attribute's value.
  setValue (value) {
    this.webViewImpl.webviewNode.setAttribute(this.name, value || '')
  }

  // Changes the attribute's value without triggering its mutation handler.
  setValueIgnoreMutation (value) {
    this.ignoreMutation = true
    this.setValue(value)
    this.ignoreMutation = false
  }

  // Defines this attribute as a property on the webview node.
  defineProperty () {
    return Object.defineProperty(this.webViewImpl.webviewNode, this.name, {
      get: () => {
        return this.getValue()
      },
      set: (value) => {
        return this.setValue(value)
      },
      enumerable: true
    })
  }

  // Called when the attribute's value changes.
  handleMutation () {}
}

// An attribute that is treated as a Boolean.
class BooleanAttribute extends WebViewAttribute {
  getValue () {
    return this.webViewImpl.webviewNode.hasAttribute(this.name)
  }

  setValue (value) {
    if (value) {
      this.webViewImpl.webviewNode.setAttribute(this.name, '')
    } else {
      this.webViewImpl.webviewNode.removeAttribute(this.name)
    }
  }
}

// Attribute representing the state of the storage partition.
class PartitionAttribute extends WebViewAttribute {
  constructor (webViewImpl) {
    super(webViewConstants.ATTRIBUTE_PARTITION, webViewImpl)
    this.validPartitionId = true
  }

  handleMutation (oldValue, newValue) {
    newValue = newValue || ''

    // The partition cannot change if the webview has already navigated.
    if (!this.webViewImpl.beforeFirstNavigation) {
      window.console.error(webViewConstants.ERROR_MSG_ALREADY_NAVIGATED)
      this.setValueIgnoreMutation(oldValue)
      return
    }
    if (newValue === 'persist:') {
      this.validPartitionId = false
      window.console.error(webViewConstants.ERROR_MSG_INVALID_PARTITION_ATTRIBUTE)
    }
  }
}

// Attribute that handles the location and navigation of the webview.
class SrcAttribute extends WebViewAttribute {
  constructor (webViewImpl) {
    super(webViewConstants.ATTRIBUTE_SRC, webViewImpl)
    this.setupMutationObserver()
  }

  getValue () {
    if (this.webViewImpl.webviewNode.hasAttribute(this.name)) {
      return resolveURL(this.webViewImpl.webviewNode.getAttribute(this.name))
    } else {
      return this.value
    }
  }

  setValueIgnoreMutation (value) {
    super.setValueIgnoreMutation(value)

    // takeRecords() is needed to clear queued up src mutations. Without it, it
    // is possible for this change to get picked up asyncronously by src's
    // mutation observer |observer|, and then get handled even though we do not
    // want to handle this mutation.
    this.observer.takeRecords()
  }

  handleMutation (oldValue, newValue) {
    // Once we have navigated, we don't allow clearing the src attribute.
    // Once <webview> enters a navigated state, it cannot return to a
    // placeholder state.
    if (!newValue && oldValue) {
      // src attribute changes normally initiate a navigation. We suppress
      // the next src attribute handler call to avoid reloading the page
      // on every guest-initiated navigation.
      this.setValueIgnoreMutation(oldValue)
      return
    }
    this.parse()
  }

  // The purpose of this mutation observer is to catch assignment to the src
  // attribute without any changes to its value. This is useful in the case
  // where the webview guest has crashed and navigating to the same address
  // spawns off a new process.
  setupMutationObserver () {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const { oldValue } = mutation
        const newValue = this.getValue()
        if (oldValue !== newValue) {
          return
        }
        this.handleMutation(oldValue, newValue)
      }
    })
    const params = {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: [this.name]
    }
    this.observer.observe(this.webViewImpl.webviewNode, params)
  }

  parse () {
    if (!this.webViewImpl.elementAttached || !this.webViewImpl.attributes[webViewConstants.ATTRIBUTE_PARTITION].validPartitionId || !this.getValue()) {
      return
    }
    if (this.webViewImpl.guestInstanceId == null) {
      if (this.webViewImpl.beforeFirstNavigation) {
        this.webViewImpl.beforeFirstNavigation = false
        this.webViewImpl.createGuest()
      }
      return
    }

    // Navigate to |this.src|.
    const opts = {}
    const httpreferrer = this.webViewImpl.attributes[webViewConstants.ATTRIBUTE_HTTPREFERRER].getValue()
    if (httpreferrer) {
      opts.httpReferrer = httpreferrer
    }
    const useragent = this.webViewImpl.attributes[webViewConstants.ATTRIBUTE_USERAGENT].getValue()
    if (useragent) {
      opts.userAgent = useragent
    }

    const guestInstanceId = this.webViewImpl.guestInstanceId
    const method = 'loadURL'
    const args = [this.getValue(), opts]

    const [error] = ipcRenderer.sendSync('ELECTRON_BROWSER_SYNC_CALL_TO_GUEST_VIEW', guestInstanceId, method, args)
    if (error) {
      throw errorUtils.deserialize(error)
    }
  }
}

// Attribute specifies HTTP referrer.
class HttpReferrerAttribute extends WebViewAttribute {
  constructor (webViewImpl) {
    super(webViewConstants.ATTRIBUTE_HTTPREFERRER, webViewImpl)
  }
}

// Attribute specifies user agent
class UserAgentAttribute extends WebViewAttribute {
  constructor (webViewImpl) {
    super(webViewConstants.ATTRIBUTE_USERAGENT, webViewImpl)
  }
}

// Attribute that set preload script.
class PreloadAttribute extends WebViewAttribute {
  constructor (webViewImpl) {
    super(webViewConstants.ATTRIBUTE_PRELOAD, webViewImpl)
  }

  getValue () {
    if (!this.webViewImpl.webviewNode.hasAttribute(this.name)) {
      return this.value
    }
    let preload = resolveURL(this.webViewImpl.webviewNode.getAttribute(this.name))
    const protocol = preload.substr(0, 5)
    if (protocol !== 'file:') {
      console.error(webViewConstants.ERROR_MSG_INVALID_PRELOAD_ATTRIBUTE)
      preload = ''
    }
    return preload
  }
}

// Attribute that specifies the blink features to be enabled.
class BlinkFeaturesAttribute extends WebViewAttribute {
  constructor (webViewImpl) {
    super(webViewConstants.ATTRIBUTE_BLINKFEATURES, webViewImpl)
  }
}

// Attribute that specifies the blink features to be disabled.
class DisableBlinkFeaturesAttribute extends WebViewAttribute {
  constructor (webViewImpl) {
    super(webViewConstants.ATTRIBUTE_DISABLEBLINKFEATURES, webViewImpl)
  }
}

// Attribute that specifies the web preferences to be enabled.
class WebPreferencesAttribute extends WebViewAttribute {
  constructor (webViewImpl) {
    super(webViewConstants.ATTRIBUTE_WEBPREFERENCES, webViewImpl)
  }
}

class EnableRemoteModuleAttribute extends WebViewAttribute {
  constructor (webViewImpl) {
    super(webViewConstants.ATTRIBUTE_ENABLEREMOTEMODULE, webViewImpl)
  }

  getValue () {
    return this.webViewImpl.webviewNode.getAttribute(this.name) !== 'false'
  }

  setValue (value) {
    this.webViewImpl.webviewNode.setAttribute(this.name, value ? 'true' : 'false')
  }
}

// Sets up all of the webview attributes.
WebViewImpl.prototype.setupWebViewAttributes = function () {
  this.attributes = {}
  this.attributes[webViewConstants.ATTRIBUTE_PARTITION] = new PartitionAttribute(this)
  this.attributes[webViewConstants.ATTRIBUTE_SRC] = new SrcAttribute(this)
  this.attributes[webViewConstants.ATTRIBUTE_HTTPREFERRER] = new HttpReferrerAttribute(this)
  this.attributes[webViewConstants.ATTRIBUTE_USERAGENT] = new UserAgentAttribute(this)
  this.attributes[webViewConstants.ATTRIBUTE_NODEINTEGRATION] = new BooleanAttribute(webViewConstants.ATTRIBUTE_NODEINTEGRATION, this)
  this.attributes[webViewConstants.ATTRIBUTE_PLUGINS] = new BooleanAttribute(webViewConstants.ATTRIBUTE_PLUGINS, this)
  this.attributes[webViewConstants.ATTRIBUTE_DISABLEWEBSECURITY] = new BooleanAttribute(webViewConstants.ATTRIBUTE_DISABLEWEBSECURITY, this)
  this.attributes[webViewConstants.ATTRIBUTE_ALLOWPOPUPS] = new BooleanAttribute(webViewConstants.ATTRIBUTE_ALLOWPOPUPS, this)
  this.attributes[webViewConstants.ATTRIBUTE_ENABLEREMOTEMODULE] = new EnableRemoteModuleAttribute(this)
  this.attributes[webViewConstants.ATTRIBUTE_PRELOAD] = new PreloadAttribute(this)
  this.attributes[webViewConstants.ATTRIBUTE_BLINKFEATURES] = new BlinkFeaturesAttribute(this)
  this.attributes[webViewConstants.ATTRIBUTE_DISABLEBLINKFEATURES] = new DisableBlinkFeaturesAttribute(this)
  this.attributes[webViewConstants.ATTRIBUTE_WEBPREFERENCES] = new WebPreferencesAttribute(this)
}
