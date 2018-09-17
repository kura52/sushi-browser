export default {
  autoplay:
    [
      { setting: 'block', primaryPattern: '*' }
      // { setting: 'block', primaryPattern: '*' },
      // { setting: 'allow', primaryPattern: '[*.]www.youtube.com', secondaryPattern: '*', resourceId: undefined },
      // { setting: 'allow', primaryPattern: '[*.]vimeo.com', secondaryPattern: '*', resourceId: undefined },
      // { setting: 'allow', primaryPattern: '[*.]www.dailymotion.com', secondaryPattern: '*', resourceId: undefined },
      // { setting: 'allow', primaryPattern: '[*.]soundcloud.com', secondaryPattern: '*', resourceId: undefined },
      // { setting: 'allow', primaryPattern: '[*.]www.twitch.tv', secondaryPattern: '*', resourceId: undefined },
      // { setting: 'allow', primaryPattern: '[*.]twitter.com', secondaryPattern: '*', resourceId: undefined }
    ],
  doNotTrack: [ { setting: 'block', primaryPattern: '*' } ],
  popups: [ { setting: 'block', primaryPattern: '*' } ],
  adInsertion: [ { setting: 'block', primaryPattern: '*' } ],
  referer: [ { setting: 'allow', primaryPattern: '*' } ],
  javascript:
    [ { setting: 'allow', primaryPattern: '*' },
      { setting: 'allow', secondaryPattern: '*', primaryPattern: 'chrome-extension://*' } ],
  cookies: [ { setting: 'allow', primaryPattern: '*', secondaryPattern: '*' } ],
  ads: [ { setting: 'block', primaryPattern: '*' } ],
  flashEnabled: [ { setting: 'allow', primaryPattern: '*' } ],
  passwordManager: [ { setting: 'allow', primaryPattern: '*' } ],
  runInsecureContent: [ { setting: 'block', primaryPattern: '*' } ],
  canvasFingerprinting: [ { setting: 'allow', primaryPattern: '*' } ],
  torEnabled: [ { setting: 'allow', primaryPattern: '*' } ],
  flashAllowed: [ { setting: 'allow', primaryPattern: '*' } ],
  plugins: [ { setting: 'allow', primaryPattern: '*',resourceId:'widevine' } ]
  // plugins: [ { setting: 'allow', primaryPattern: '*' } ]
}

// export default {
//   "plugins": [
//     { "setting": "block", "primaryPattern": "*"},
//     { "setting": "block", "resourceId": "libpepflashplayer.so", "primaryPattern": "*" },
//     { "setting": "block", "resourceId": undefined, "primaryPattern": "*" },
//     { "setting": "allow", "resourceId": "libpepflashplayer.so", "primaryPattern": "[*.]adobe.com" },
//     { "setting": "allow", "resourceId": "libpepflashplayer.so",  "primaryPattern": "[*.]macromedia.com"  }],
//   "autoplay": [{ "setting": "allow", "primaryPattern": "*" }],
//   "doNotTrack": [{ "setting": "block", "primaryPattern": "*" }],
//   "popups": [{ "setting": "block", "primaryPattern": "*"  }],
//   "dappDetection": [{ "setting": "allow", "primaryPattern": "*" }],
//   "torEnabled": [{ "setting": "allow", "primaryPattern": "*" }],
//   "adInsertion": [{ "setting": "block", "primaryPattern": "*" }],
//   "referer": [{ "setting": "block",  "primaryPattern": "*" }],
//   "javascript": [{ "setting": "allow", "primaryPattern": "*"  },
//     { "setting": "allow", "secondaryPattern": "*", "primaryPattern": "chrome-extension://*" }],
//   "cookies": [{ "setting": "block", "primaryPattern": "*", "secondaryPattern": "*" },
//     { "setting": "allow", "primaryPattern": "*", "secondaryPattern": "[firstParty]" },
//     { "setting": "allow", "primaryPattern": "https://inbox.google.com", "secondaryPattern": "https://hangouts.google.com"  },
//     { "setting": "allow",  "primaryPattern": "https://mail.google.com", "secondaryPattern": "https://hangouts.google.com" }],
//   "ads": [{  "setting": "block",  "primaryPattern": "*" }],
//   "flashEnabled": [{ "setting": "block",  "primaryPattern": "*" }],
//   "passwordManager": [{  "setting": "allow",  "primaryPattern": "*" }],
//   "runInsecureContent": [{ "setting": "block", "primaryPattern": "*" }],
//   "mediaPermission": [{ "setting": "block",   "primaryPattern": "*" }],
//   "canvasFingerprinting": [{ "setting": "block",  "primaryPattern": "*", "secondaryPattern": "*"  },
//     { "setting": "allow", "primaryPattern": "*", "secondaryPattern": "[firstParty]" }],
//   "flashAllowed": [{ "setting": "block", "primaryPattern": "*" }]
// }