export default {
  autoplay:
    [
      { setting: 'allow', primaryPattern: '*' }
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
