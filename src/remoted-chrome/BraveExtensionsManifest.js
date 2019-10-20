export default {
  "mnojpmjdmbbfmejpflffifhffcmidifd": {
    "description": "Brave Shields",
    "enabled": true,
    "homepageUrl": "",
    "version": "1.0.0",
    "name": "Brave",
    "manifest_version": 2,
    "default_locale": "en_US",
    "browser_action": {
      "default_title": "Brave Shields",
      "default_popup": "braveShieldsPanel.html"
    },
    "icons": [
      {
        "size": 16,
        "url": "assets/img/icon-16.png"
      },
      {
        "size": 32,
        "url": "assets/img/icon-32.png"
      },
      {
        "size": 48,
        "url": "assets/img/icon-48.png"
      },
      {
        "size": 64,
        "url": "assets/img/icon-64.png"
      },
      {
        "size": 128,
        "url": "assets/img/icon-128.png"
      },
      {
        "size": 256,
        "url": "assets/img/icon-256.png"
      }
    ],
    "id": "mnojpmjdmbbfmejpflffifhffcmidifd",
    "installType": "normal",
    "isApp": false,
    "mayDisable": false,
    "type": "extension",
    "permissions": [ "contentSettings", "settingsPrivate", "management", "tabs", "storage", "webNavigation", "contextMenus", "cookies", "*://*/*", "chrome://favicon/*" ],
  },
  "jidkidbbcafjabdphckchenhfomhnfma": {
    "id": "jidkidbbcafjabdphckchenhfomhnfma",
    "enabled": true,
    "homepageUrl": "",
    "version": "1.0.0",
    "name": "Brave Rewards",
    "manifest_version": 2,
    "description": "Brave Rewards Extension",
    "default_locale": "en_US",
    "incognito": "not_allowed",

    "permissions": [
      "storage",
      "tabs",
      "webRequest",
      "chrome://favicon/*",
      "https://www.twitch.tv/*",
      "https://*.twitter.com/*"
    ],
    "browser_action": {
      "default_popup": "brave_rewards_panel.html",
      "default_icon": {
        "16": "img/bat-16.png",
        "32": "img/bat-32.png",
        "48": "img/bat-48.png",
        "64": "img/bat-64.png",
        "128": "img/bat-128.png",
        "256": "img/bat-256.png"
      }
    },
    "installType": "normal",
    "isApp": false,
    "mayDisable": false,
    "icons": [
      {
        "size": 16,
        "url": "img/bat-16.png"
      },
      {
        "size": 32,
        "url": "img/bat-32.png"
      },
      {
        "size": 48,
        "url": "img/bat-48.png"
      },
      {
        "size": 68,
        "url": "img/bat-68.png"
      },
      {
        "size": 128,
        "url": "img/bat-128.png"
      },
      {
        "size": 256,
        "url": "img/bat-256.png"
      },
    ],
    "content_security_policy": "img-src 'self' chrome: data:; style-src 'self' 'unsafe-inline';font-src 'self' data:;",
  }

}