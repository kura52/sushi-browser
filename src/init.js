import {app, Menu, clipboard, BrowserWindow, ipcMain, session, shell, protocol, screen} from 'electron'
import {Browser, BrowserPanel, BrowserView, webContents} from './remoted-chrome/BrowserView'
// import ExtensionsMain from './extension/ExtensionsMain'
import PubSub from './render/pubsub'
import mainState from './mainState'
const locale = require('../brave/app/locale')
const BrowserWindowPlus = require('./BrowserWindowPlus')
const InitSetting = require('./InitSetting')
const seq = require('./sequence')
// const loadDevtool = require('electron-load-devtool');
import path from 'path'
import uuid from 'node-uuid'
import nm from 'nanomatch'
const fs = require('fs')
const os = require('os')
const isDarwin = process.platform == 'darwin'
const isLinux = process.platform === 'linux'
const isWin = process.platform == 'win32'
const LRUCache = require('lru-cache')
const {getUrlFromCommandLine,getNewWindowURL} = require('./cmdLine')
import {getFocusedWebContents, getCurrentWindow} from './util'
const open = require('./open')
const sharedState = require('./sharedStateMain')
const defaultConf = require('./defaultConf')
const urlutil = require('./render/urlutil')
const tor = require('../brave/app/tor')
// require('./chromeEvents')

let adblock,httpsEverywhere,trackingProtection,extensions,videoProcessList = []
ipcMain.setMaxListeners(0)

sharedState.extensionMenu = {}

// process.on('unhandledRejection', console.dir);

// process.on('unhandledRejection', error => {
//   // Will print "unhandledRejection err is not defined"
//   console.log('unhandledRejection', error);
// });

// require('./chrome-extension')

function exec(command) {
  console.log(command)
  return new Promise(function(resolve, reject) {
    require('child_process').exec(command, function(error, stdout, stderr) {
      if (error) {
        return reject(error);
      }
      resolve({stdout, stderr});
    });
  });
}



process.userAgent = `Mozilla/5.0 (${isWin ? 'Windows NT 10.0; Win64; x64': isDarwin ? 'Macintosh; Intel Mac OS X 10_12_2' : 'X11; Linux x86_64'}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${process.versions.chrome} Safari/537.36`

const players = [
  { value: 'vlc', text: 'VLC Media Player',os:['win','mac','linux']},
  { value: 'PotPlayerMini64', text: 'PotPlayer',os:['win']},
  { value: 'mplayerx', text: 'MPlayerX',os:['mac']},
  { value: 'smplayer', text: 'SMPlayer',os:['win','mac','linux']},
  { value: 'C:\\Program Files\\MPC-HC\\mpc-hc64.exe', text: 'Media Player Classic(MPC-HC)',os:['win']},
  { value: 'C:\\Program Files\\MPC-BE x64\\mpc-be64.exe', text: 'MPC-BE',os:['win']},

  // { value: 'C:\\Program Files (x86)\\DearMob\\5KPlayer\\5KPlayer.exe', text: '5K Player',os:['win']},
  // { value: '5kplayer', text: '5K Player',os:['mac']},

  { value: 'kmplayer', text: 'KMPlayer',os:['win','mac']},
  { value: 'gom', text: 'GOM Player',os:['win','mac']},


  { value: 'itunes', text: 'iTunes',os:['win','mac']},
  { value: 'quicktime player', text: 'QuickTime Player',os:['mac']},

  { value: 'C:\\Program Files (x86)\\Kodi\\kodi.exe', text: 'Kodi',os:['win']},
  { value: 'kodi', text: 'Kodi',os:['mac','linux']},

  { value: 'mpv', text: 'MPV Player',os:['win','mac','linux']},
  { value: 'wmplayer', text: 'Windows Media Player',os:['win']},
]

app.setName('Sushi Browser')
app.commandLine.appendSwitch('touch-events', 'enabled');

// if(isLinux){
  app.disableHardwareAcceleration()
// app.disableDomainBlockingFor3DAPIs()
// }

// ipcMain.setMaxListeners(0)

// const RegVideo = /1tv|1up\.com|20min|220\.ro|22tracks|24video|3qsdn|3sat|4tube|56\.com|5min|6play|8tracks|91porn|9c9media|9gag|9now\.com\.au|abc\.net\.au|abcnews|abcotvs|academicearth|acast|addanime|adn|adobetv|adobetvchannel|adobetvshow|adobetvvideo|adultswim|aenetworks|afreecatv|airmozilla|aljazeera|allocine|alphaporno|amcnetworks|anderetijden|animeondemand|anvato|anysex|aparat|appleconnect|appledaily|appletrailers|archive\.org|ard|arkena|arte\.tv|asiancrush|asiancrushplaylist|atresplayer|atttechchannel|atvat|audimedia|audioboom|audiomack|auroravid|awaan|awaan|azmedien|azmedienplaylist|azmedienshowplaylist|baiduvideo|bambuser|bandcamp|bangumi\.bilibili\.com|bbc|bbc\.co\.uk|beatport|beeg|behindkink|bellmedia|bet|bigflix|bild|bilibili|biobiochiletv|biqle|bleacherreport|bleacherreportcms|blinkx|bloomberg|bokecc|bostonglobe|bpb|bravotv|break|brightcove|buzzfeed|byutv|byutvevent|camdemy|camdemyfolder|camwithher|canalc2\.tv|canalplus|canvas|carambatv|carambatvpage|cartoonnetwork|cbc\.ca|cbs|cbsinteractive|cbslocal|cbsnews|cbssports|ccma|cctv|cda|ceskatelevize|ceskatelevizeporady|channel9|charlierose|chaturbate|chilloutzone|chirbit|cinchcast|clipfish|cliphunter|cliprs|clipsyndicate|closertotruth|cloudtime|cloudy|clubic|clyp|cmt\.com|cnbc|cnn|cnnarticle|cnnblogs|collegerama|comcarcoff|comedycentral|comedycentralfullepisodes|comedycentralshortname|comedycentraltv|condenast|corus|coub|cracked|crackle|criterion|crooksandliars|crunchyroll|crunchyroll|csnne|cspan|ctsnews|ctvnews|culturebox\.francetvinfo\.fr|cultureunplugged|curiositystream|cwtv|dailymail|dailymotioncloud|daisuki|daisukiplaylist|daum\.net|dbtv|dctptv|deezerplaylist|defense\.gouv\.fr|democracynow|dhm|digitallyspeaking|digiteka|discovery|discoverygo|discoverygoplaylist|discoverynetworksde|discoveryvr|disney|dotsub|douyushow|douyutv|dplay|dplayit|dramafever|drbonanza|dropbox|drtuber|drtv|dumpert|dvtv|eagleplatform|ebaumsworld|echomsk|egghead|ehow|einthusan|eitb\.tv|ellentv|elpais|embedly|empflix|engadget|eporner|eroprofile|escapist|espn|espnarticle|esrivideo|etonline|europa|everyonesmixtape|expotv|extremetube|eyedotv|facebook|facebookpluginsvideo|faz\.net|fc2|fczenit|fernsehkritik\.tv|filmon|firstpost|fivetv|flickr|flipagram|folketinget|footyroom|formula1|fox|fox9|foxgay|foxnews|foxsports|france2\.fr|franceculture|franceinter|francetv|francetvembed|francetvinfo\.fr|freesound|freespeech\.org|freshlive|funimation|funnyordie|fusion|fxnetworks|gameinformer|gameone|gameone|gamersyde|gamespot|gamestar|gaskrank|gazeta|gdcvault|generic|gfycat|giantbomb|giga|glide|globo|globoarticle|go90|godtube|golem|googledrive|goshgay|gputechconf|groupon|hark|hbo|hearthisat|heise|hellporno|helsinki|hentaistigma|hetklokhuis|hgtv\.com|historicfilms|history|hitbox|hitrecord|hornbunny|hotnewhiphop|hotstar|howcast|howstuffworks|hrti|hrtiplaylist|huajiao|huffpost|hypem|iconosquare|ign\.com|imdb|imgur|imguralbum|ina|inc|indavideo|indavideoembed|infoq|instagram|instagram|internetvideoarchive|iprima|iqiyi|ir90tv|itv|ivi|ivideon|iwara|izlesene|jamendo|jamendoalbum|jeuxvideo|jove|jpopsuki\.tv|jwplatform|kaltura|kamcord|kanalplay|kankan|karaoketv|karrierevideos|keek|keezmovies|ketnet|khanacademy|kickstarter|konserthusetplay|kontrtube|krasview|ku6|kusi|kuwo|la7\.it|laola1tv|lci|lcp|lcpplay|learnr|lecture2go|lego|lemonde|leplaylist|letvcloud|libsyn|life|limelight|litv|liveleak|livestream|lnkgo|loc|localnews8|lovehomeporn|lrt\.lt|lynda|macgamestore|mailru|makerschannel|makertv|mangomolo|matchtv|mdr|media\.ccc\.de|medialaan|mediaset|medici|meipai|melonvod|meta|metacafe|metacritic|mgoon|mgtv|miaopai|minhateca|ministrygrid|minoto|miomio\.tv|mitele|mixcloud|mixer|mlb|mnet|moevideo|mofosex|mojvideo|moniker|morningstar|motherless|motorsport|movieclips|moviefap|moviezine|movingimage|mpora|msn|mtg|mtv|mtv\.de|mtv81|mtvservices|muenchentv|musicplayon|mva|mwave|mwavemeetgreet|myspace|myspass|myvi|myvidster|n-tv\.de|natgeo|naver|nba|nbc|nbcnews|nbcolympics|nbcsports|nbcsportsvplayer|ndr|ndtv|nerdcubedfeed|netease|netzkino|newgrounds|newgroundsplaylist|newstube|nextmedia|nextmediaactionnews|nexttv|nfb|nfl\.com|nhkvod|nhl\.com|nick\.com|nick\.de|nicknight|niconicoplaylist|nintendo|njoy|njpwworld|nobelprize|noco|nonktube|noovo|normalboots|nosvideo|nova|nowness|nowtv (currently broken)|nowtvlist|nowvideo|noz|npo|npo\.nl|npr|nrk|nrkplaylist|nrkskole|nrktv|nrktvdirekte|nrktvepisodes|nrktvseries|ntv\.ru|nuvid|nytimes|nytimesarticle|nzz|ocw\.mit\.edu|odatv|odnoklassniki|oktoberfesttv|on\.aol\.com|ondemandkorea|onet\.pl|onet\.tv|onetmvp|onionstudios|ooyala|ooyalaexternal|openload|oratv|orf|packtpub|packtpubcourse|pandatv|pandora\.tv|parliamentlive\.tv|patreon|pbs|pcmag|people|periscope|philharmoniedeparis|phoenix\.de|photobucket|piksel|pinkbike|pladform|play\.fm|playstv|playtvak|playvid|playwire|pluralsight|plus\.google|podomatic|pokemon|polskieradio|polskieradiocategory|porncom|pornflip|pornhd|pornhub|pornhubplaylist|pornhubuservideos|pornotube|pornovoisines|pornoxo|presstv|primesharetv|promptfile|prosiebensat1|puls4|pyvideo|qqmusic|r7|r7article|radio\.de|radiobremen|radiocanada|radiocanadaaudiovideo|radiofrance|radiojavan|rai|raiplay|raiplaylive|rbmaradio|rds|redbulltv|redtube|regiotv|rentv|rentvarticle|restudy|reuters|reverbnation|revision|revision3|rice|ringtv|rmcdecouverte|rockstargames|roosterteeth|rottentomatoes|roxwel|rozhlas|rtbf|rte|rtl\.nl|rtl2|rtp|rts|rtve\.es|rtvnh|rudo|ruhd|ruleporn|rutube|rutv|ruutu|ruv|safari|sandia|sapo|savefrom\.net|sbs|schooltv|screen\.yahoo|screencast|screencastomatic|scrippsnetworks|seeker|senateisvp|sendtonews|servingsys|sexu|shahid|shared|showroomlive|sina|skylinewebcams|skynewsarabia|skysports|slideshare|slutload|smotri|snotr|sohu|sonyliv|soundcloud|soundgasm|southpark\.cc\.com|southpark\.de|southpark\.nl|southparkstudios\.dk|spankbang|spankwire|spiegel|spiegeltv|spike|sport5|sportboxembed|sportdeutschland|sportschau|sprout|srgssr|srgssrplay|stanfordoc|steam|stitcher|streamable|streamango|streamcloud\.eu|streamcz|streetvoice|sunporno|svt|svtplay|swrmediathek|syfy|sztvhu|t-online\.de|tagesschau|tagesschau|tass|tastytrade|tbs|tdslifeway|teachertube|teachingchannel|teamcoco|teamfourstar|techtalks|techtv\.mit\.edu|ted|tele13|telebruxelles|telecinco|telegraaf|telemb|telequebec|teletask|telewebion|tf1|tfo|theintercept|theoperaplatform|theplatform|theplatformfeed|thescene|thesixtyone|thestar|thesun|theweatherchannel|thisamericanlife|thisav|thisoldhouse|tinypic|tmz|tmzarticle|tnaflix|tnaflixnetworkembed|toggle|toongoggles|tosh|tou\.tv|toypics|toypicsuser|traileraddict (currently broken)|trilulilu|trutv|tube8|tubitv|tumblr|tunein|tunepk|turbo|tutv|tv\.dfb\.de|tv2|tv2\.hu|tv2article|tv3|tv4|tv5mondeplus|tva|tvanouvelles|tvanouvellesarticle|tvc|tvcarticle|tvigle|tvland\.com|tvn24|tvnoe|tvp|tvplayer|tweakers|twitch|twitter|udemy|udnembed|uktvplay|unistra|uol\.com\.br|uplynk|upskill|upskillcourse|urort|urplay|usanetwork|usatoday|ustream|ustudio|varzesh3|vbox7|veehd|veoh|vessel|vesti|vevo|vevoplaylist|vgtv|vh1\.com|viafree|vice|viceland|vidbit|viddler|videa|video\.google|video\.mit\.edu|videodetective|videofy\.me|videomega|videomore|videopremium|videopress|videoweed|vidio|vidme|vidzi|vier|viewlift|viewliftembed|viewster|viidea|viki|vimple|vine|vine|viu|viu|vivo|vlive|vodlocker|vodpl|vodplatform|voicerepublic|voxmedia|vporn|vpro|vrak|vrt|vrv|vshare|vube|vuclip|vvvvid|vyborymos|vzaar|walla|washingtonpost|wat\.tv|watchindianporn|wdr|wdr|webcaster|webcasterfeed|webofstories|webofstoriesplaylist|weiqitv|wholecloud|wimp|wistia|wnl|worldstarhiphop|wrzuta\.pl|wsj|wsjarticle|xbef|xboxclips|xfileshare|fastvideo\.me|xhamster|xhamsterembed|xiami|xminus|xnxx|xstream|xtube|xtubeuser|xuite|xvideos|xxxymovies|yahoo|yam|yandexmusic|yesjapan|yinyueta|ynet|youjizz|youku|youporn|yourupload|zapiks|zaq1|zdf|zdfchannel|zingmp3/

// const crashReporter = require('electron').crashReporter
// crashReporter.start({
//   productName: 'Sushi Browser',
//   companyName: '',
//   submitURL: '',
//   autoSubmit: false,
//   extra: {
//     node_env: process.env.NODE_ENV,
//     rev: '0.0.1'
//   }
// })

global.rlog = (...args)=>{
  // setTimeout(_=>global.rlog(...args),3000)
}

require('./basicAuth')


setFlash(app)
setWidevine(app)

Browser.setUserDataDir(path.join(app.getPath('userData'), 'Chrome'))

let ptyProcessSet,passwordManager,extensionInfos,syncReplaceName
app.on('ready', async ()=>{
  // webFrame.registerURLSchemeAsBypassingCSP('chrome-extension')

  // const cookieFile = path.join(app.getPath('userData'), 'cookie.txt') //@TODO ELECTRON
  // if(fs.existsSync(cookieFile)){
  //   for(let cookie of JSON.parse(fs.readFileSync(cookieFile))){
  //     session.defaultSession.cookies.set({url:`https://${cookie.domain}`,...cookie},()=>{})
  //   }
  // }

  // session.defaultSession.setPreloads([path.join(__dirname, '../resource/preload-content-scripts.js')])

  InitSetting.val.then(setting=>{
    // if(setting.enableFlash){
    //   setFlash(app)
    // }
    // else{
    // }

    // app.commandLine.appendSwitch('widevine-cdm-path', '/opt/google/chrome/libwidevinecdmadapter.so')
    //https://imfly.gitbooks.io/electron-docs-gitbook/jp/tutorial/using-widevine-cdm-plugin.html
    if(!setting.enableWidevine){
      defaultConf.plugins =  []
    }
    else{
      // try{
      //   const widevinePath = path.join(global.originalUserDataPath,'Extensions/WidevineCdm')
      //   if(require("glob").sync(path.join(widevinePath,"*")).length == 0){
      //     const src = path.join(__dirname, '../resource/bin/widevine',
      //       isWin ? 'win/WidevineCdm' : isDarwin ? 'mac/WidevineCdm' : '').replace(/app.asar([\/\\])/,'app.asar.unpacked$1')
      //     require('fs-extra').copySync(src,widevinePath)
      //   }
      // }catch(e){
      //   console.log(e)
      // }
    }
    defaultConf.javascript[0].setting = setting.noScript ? 'block' : 'allow'
    defaultConf.canvasFingerprinting[0].setting = setting.blockCanvasFingerprinting ? 'block' : 'allow'
    // console.log(678,session.defaultSession.userPrefs.getDictionaryPref('content_settings'))
  })

  console.log(1)
  require('./captureEvent')

  const ses = session.defaultSession
  // ses.setEnableBrotli(true)
  // ses.contentSettings.set("*","*","plugins",mainState.flashPath,"allow")
  // ses.userPrefs.setDictionaryPref('content_settings', defaultConf)
  // ses.userPrefs.setBooleanPref('autofill.enabled', true)
  // ses.userPrefs.setBooleanPref('profile.password_manager_enabled', true)
  // ses.userPrefs.setBooleanPref('credentials_enable_service', true)
  // ses.userPrefs.setBooleanPref('credentials_enable_autosignin', true)
  // ses.userPrefs.setStringPref('download.default_directory', app.getPath('downloads'))


  // ses.autofill.getAutofillableLogins((result) => {
  //   // console.log(1,result)
  // })
  // ses.autofill.getBlackedlistLogins((result) => {
  //   // console.log(2,result)
  // })

  // loadDevtool(loadDevtool.REACT_DEVELOPER_TOOLS);
  //console.log(app.getPath('pepperFlashSystemPlugin'))
  extensionInfos = require('./extensionInfos')
  console.log({arch: process.arch,platform: process.platform},process.versions)


  // console.log(app.getPath('userData'))
  const downloadEvent = require('./downloadEvent')
  new downloadEvent()
  require('./historyEvent')
  require('./favoriteEvent')
  require('./messageEvent')
  require('./tabMoveEvent')
  require('./saveEvent')
  // require('./userAgentChangeEvent')
  require('./clearEvent')


  ptyProcessSet = require('./ptyProcess')
  // ptyProcessSet = new Set()
  // require('./importer')
  require('./bookmarksExporter')
  const setting = await InitSetting.val
  require('./faviconsEvent')(async _ => {
    console.log(332,process.argv,getUrlFromCommandLine(process.argv))
    await createWindow(true,isDarwin ? getNewWindowURL() : getUrlFromCommandLine(process.argv))

    // httpsEverywhere = require('../brave/httpsEverywhere') //@TODO ELECTRON
    // trackingProtection = require('../brave/trackingProtection') @TODO ELECTRON


    require('./ipcUtils')
    require('./ipcAutoOperations')
    require('./VideoConverter')
    require('./tabContextMenu')
    require('./syncLoop')

    // adblock = require('../brave/adBlock') //@TODO ELECTRON
    require('./menuSetting')
    process.emit('app-initialized')

    extensions = require('./extension/extensions')
    // extensions.init(setting.ver !== fs.readFileSync(path.join(__dirname, '../VERSION.txt')).toString())
    extensions.init(true)

    ipcMain.emit('new-tab-mode',{},(mainState.newTabMode == 'myHomepage' ? mainState.myHomepage :
      mainState.newTabMode == 'topPage' ? mainState.topPage :
        mainState.newTabMode == 'favorite' ? mainState.bookmarksPage :
          mainState.newTabMode == 'history' ? mainState.historyPage : "") || `chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/${mainState.newTabMode}.html`
    )

    require('./checkUpdate')
    require('./portablePathSelector')
    // require('./checkDefault')
    const {syncReplace} = require('./databaseFork')
    let rec
    if (rec = await syncReplace.findOne({key: 'syncReplace_0'})) {
      syncReplaceName = rec.val.split("\t")[0]
    }
    else {
      syncReplace.insert({
        key: 'syncReplace_0',
        val: `${locale.translation('2473195200299095979')}\t(.+)\thttps://translate.google.co.jp/translate?sl=auto&tl=${mainState.lang}&hl=${mainState.lang}&ie=UTF-8&u=$$1`
      })
      syncReplaceName = locale.translation('2473195200299095979')
    }
  })
})

let beforeQuitFirst = false
let beforeQuit = false
app.on('before-quit', (e) => {
  console.log('before-quit')
  beforeQuit = true
  if(isDarwin){
    if(!beforeQuitFirst){
      const win = getCurrentWindow()
      if(win){
        e.preventDefault()
        BrowserWindowPlus.saveState(win,_=>{
          beforeQuitFirst = true
          app.quit()
        })
      }
      else{
        beforeQuitFirst = true
        beforeQuit = true
      }
    }
    else{
      beforeQuit = true
    }
  }
})


app.on('window-all-closed', async function () {
  console.log('window-all-closed',2221)
  // require('./databaseFork')._kill()
  if (!isDarwin || beforeQuit) {
    console.log(5556)
    for (let ptyProcess of ptyProcessSet){
      ptyProcess.destroy()
    }
    for(let process of videoProcessList){
      try{
        process.kill()
      }catch(e){}
    }
    ipcMain.emit('handbrake-stop',null)
    global.__CHILD__.kill()

    for(let win of BrowserWindow.getAllWindows()){
      for(let i = 0;i<=global.seqBv;i++){
        if(win.getAddtionalBrowserView(i)) win.eraseBrowserView(i)
      }
      for(let seq of Object.keys(global.viewCache)){
        const i = parseInt(seq)
        if(win.getAddtionalBrowserView(i)) win.eraseBrowserView(i)
      }
    }

    // BrowserView.getAllViews().map(v=> !v.isDestroyed() && v.destroy())
    // webContents.getAllWebContents().map(w=> !w.isDestroyed() && w.getURL().startsWith('chrome-extension:') && w.destroy())
    // await Browser.close()
    console.log(2220099)
    await new Promise(r=>setTimeout(r,100))
    app.quit()
  }
  else{

  }
})


app.on('will-quit',  (e) => {
  console.log('will-quit')
  for(let cont of webContents.getAllWebContents()){
    cont.removeAllListeners('destroyed')
  }
  if(mainState.vpn){
    exec(`rasdial /disconnect`).then(ret=>{})
  }
  if(isDarwin){
    // await clearDatas()
    for (let ptyProcess of ptyProcessSet){
      ptyProcess.destroy()
    }
    for(let process of videoProcessList){
      try{
        process.kill()
      }catch(e){}
    }
    ipcMain.emit('handbrake-stop',null)
    global.__CHILD__.kill()
  }
  console.log(22222)
})


app.on('quit', (e) => {
  console.log('quit', e)
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length == 0) {
    createWindow()
  }
})

//@TODO
// app.on('open-url', (event, path) => {
//   event.preventDefault()
//   if (!appInitialized) {
//     newWindowURL = path
//   } else {
//     const parsedUrl = urlParse(path)
//     if (sessionStore.isProtocolHandled(parsedUrl.protocol)) {
//       focusOrOpenWindow(path)
//     }
//   }
// })
//
// // User clicked on a file or dragged a file to the dock on macOS
// app.on('open-file', (event, path) => {
//   event.preventDefault()
//   path = encodeURI(path)
//   if (!focusOrOpenWindow(path)) {
//     newWindowURL = path
//   }
// })

const popupCache = new LRUCache(100)
ipcMain.on('chrome-extension-popup-id', (e,tabId)=>{
  popupCache.set(tabId,true)
})

ipcMain.on('web-contents-created', (e, tab) => {
  contextMenu(tab)
  const webContents2 = webContents

  tab.on('-add-new-contents', (event, webContents, disposition, userGesture, left, top, width, height, url, frameName) => {
    console.log('-add-new-contents', webContents.getURL(), url)
    if(disposition == 'new-window' || disposition === 'new-popup'){
      // let bw
      // if((bw = BrowserWindow.getAllWindows().find(win=>win.webContents.getURL() == url))){
      //   event.newGuest = bw
      // }
      // else{
      event.newGuest = new BrowserWindow({
        webContents,
        autoHideMenuBar: true,
        parent: BrowserWindow.fromWebContents(tab.hostWebContents2)
      })
      // }
      return
    }
    // const url = contMap.get(webContents)
    // contMap.delete(webContents)
    tab.emit('new-window', event, url, null, disposition, null, null, null, webContents)
  })

  tab.on('new-window', async (event, targetUrl, frameName, disposition, options, features, referrer, _webContents) => {
    console.log('new-window', targetUrl, frameName, disposition)
    // let bw
    // if((bw = BrowserWindow.getAllWindows().find(win=>win.webContents.getURL() == targetUrl))){
    //   console.log('bwww', bw.webContents.getURL(),bw,)
    //   event.newGuest = bw
    //   return
    // }

    let source = tab
    if(popupCache.get(source.id)) source = await getFocusedWebContents()

    if(mainState.alwaysOpenLinkBackground) disposition = 'background-tab'

    console.log(disposition)

    // if ((disposition === 'new-window' || disposition === 'new-popup') && mainState.generalWindowOpenLabel == 'linkTargetWindow') {
    //   const currentWindow = getCurrentWindow()
    //   ipcMain.once('get-private-reply',(e,privateMode)=>{
    //     BrowserWindowPlus.load({id:currentWindow.id,disposition,
    //       tabParam:JSON.stringify([{privateMode}])})
    //   })
    //   currentWindow.webContents.send('get-private', source.id) //@TODO ELECTRON
    //   return
    // }

    ipcMain.emit('create-browser-view',{sender: source.hostWebContents2}, void 0, void 0,
      0, 0, 0, 0, 0, void 0, _webContents)

    const id = source.id
    const func = (e, newTabId, panelKey, tabKey, tabIds)=>{
      console.log('create-web-contents-reply',[id,newTabId], tabIds)
      if(tabIds.includes(id)){
        const cont = webContents.fromId(newTabId)
        // ipcMain.emit('set-tab-opener', null, newTabId, id)
        cont.hostWebContents2.send('tab-create', {id: newTabId, url: cont.getURL(), openerTabId: id})

        ipcMain.emit('chrome-webNavigation-onCreatedNavigationTarget',null,{
          tabId: newTabId,
          url: targetUrl,
          processId: -1,
          sourceTabId: id,
          sourceFrameId: 0,
          sourceProcessId: -1,
          timeStamp: Date.now()
        })
        ipcMain.removeListener('create-web-contents-reply',func)
      }
    }
    ipcMain.on('create-web-contents-reply',func)
    if(source.hostWebContents2)
      source.hostWebContents2.send('create-web-contents', { id, targetUrl, disposition, guestInstanceId: _webContents && _webContents.id})
  })

  // tab.on('will-attach-webview',(e, cont)=>{
  //   debugger
  //   e.sender.send('will-attach-webview')
  // })

  tab.on('devtools-opened', ()=>{
    if(!tab.executeJavascriptInDevTools) return
    tab.executeJavascriptInDevTools(`(async function(){
  window.InspectorFrontendHost.showContextMenuAtPoint = (x, y, items)=>{
    const convertToMenuTemplate = function (items) {
      return items.map(function (item) {
        const transformed = item.type === 'subMenu' ? {
          type: 'submenu',
          label: item.label,
          enabled: item.enabled,
          submenu: convertToMenuTemplate(item.subItems)
        } : item.type === 'separator' ? {
          type: 'separator'
        } : item.type === 'checkbox' ? {
          type: 'checkbox',
          label: item.label,
          enabled: item.enabled,
          checked: item.checked
        } : {
          type: 'normal',
          label: item.label,
          enabled: item.enabled
        }
        if(item.id) transformed.id = item.id
        return transformed
      })
    }

    const useEditMenuItems = function (x, y, items) {
      return items.length === 0 && document.elementsFromPoint(x, y).some(function (element) {
        return element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA' || element.isContentEditable
      })
    }

    let template = convertToMenuTemplate(items)
    if (useEditMenuItems(x, y, template)) {
      template = []
    }
    else if(!items.length){
      return window.DevToolsAPI.contextMenuCleared()
    }
    let context = UI.context.flavor(SDK.ExecutionContext)
    if(context.origin != "chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd" && context.origin != "chrome://brave"){
      context = [...context.runtimeModel._executionContextById].sort((a,b)=> a[0] - b[0]).find(x=>x[1].origin == "chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd")[1]
    }
    context.evaluate({expression: \`chrome.ipcRenderer.send('devTools-contextMenu-open',\${JSON.stringify(template)},\${x},\${y})\`},false)
  }
  
  let closeButton
  for(let i=0;i<100;i++){
    await new Promise(r=>{
      setTimeout(_=>{
        closeButton = document.querySelector(".insertion-point-main").shadowRoot.querySelector(".tabbed-pane-right-toolbar").shadowRoot.querySelector('.toolbar-button.toolbar-item.toolbar-has-glyph.hidden')
        r()
      },100)
    })
    if(closeButton){
      closeButton.classList.remove('hidden')
      closeButton.addEventListener('mousedown',e=>{
        let context = UI.context.flavor(SDK.ExecutionContext)
        if(context.origin != "chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd" && context.origin != "chrome://brave"){
          context = [...context.runtimeModel._executionContextById].sort((a,b)=> a[0] - b[0]).find(x=>x[1].origin == "chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd")[1]
        }
        context.evaluate({expression: "chrome.ipcRenderer.send('send-to-host', 'devTools-close')"},false)
      })

      const dockButton = document.createElement('button')
      dockButton.className = 'toolbar-button toolbar-item toolbar-has-glyph toolbar-state-off'
      dockButton.setAttribute('aria-label','Undock into separate window')
      dockButton.innerHTML = \`<span is="ui-icon" class="toolbar-glyph spritesheet-largeicons largeicon-undock icon-mask" style="--spritesheet-position:-168px 24px; width: 28px; height: 24px;"></span><div is="" class="toolbar-text hidden"></div>\`
      closeButton.parentElement.insertBefore(dockButton,closeButton)

      dockButton.addEventListener('mousedown',e=>{
        let context = UI.context.flavor(SDK.ExecutionContext)
        if(context.origin != "chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd" && context.origin != "chrome://brave"){
          context = [...context.runtimeModel._executionContextById].sort((a,b)=> a[0] - b[0]).find(x=>x[1].origin == "chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd")[1]
        }
        context.evaluate({expression: "chrome.ipcRenderer.send('send-to-host', 'devTools-dock')"},false)
      })

      break
    }
  }
}());`)
  })

  setTimeout(()=>{

    if (/*tab.isBackgroundPage() ||*/ !tab.hostWebContents2) { //@TODO ELECTRON
      return
    }

    let tabId = tab.id
    sharedState[tabId] = tab

    console.log(12223,tab.getURL())
    let win
    for(let w of BrowserWindow.getAllWindows()){
      console.log(1222,w.getTitle())
      if(w.getTitle().includes('Sushi Browser')){
        if(!win) win = w
        PubSub.publish("web-contents-created",[tabId,w.webContents])
      }
    }


    const focus = BrowserWindow.getFocusedWindow()
    if(focus && focus.getTitle().includes('Sushi Browser')){
      win = focus
    }

    // const cont = win.webContents
    const key = Math.random().toString()

    tab.on('media-started-playing', (e) => {
      mainState.mediaPlaying[tabId] = true
      for(let win of BrowserWindow.getAllWindows()) {
        if(win.getTitle().includes('Sushi Browser')){
          if(!win.webContents.isDestroyed()) win.webContents.send('update-media-playing',tabId,true)
        }
      }
    })

    tab.on('media-paused', (e) => {
      delete mainState.mediaPlaying[tabId]
      for(let win of BrowserWindow.getAllWindows()) {
        if(win.getTitle().includes('Sushi Browser')){
          if(!win.webContents.isDestroyed()) win.webContents.send('update-media-playing',tabId,false)
        }
      }
    })

    tab.on('close', () => {
      delete sharedState[tabId]
      // tab.forceClose()
    })
  },0)


  // tab.on('did-get-response-details', (e, status, newURL, originalURL, httpResponseCode, requestMethod, referrer, headers, resourceType) => {
  //   const contType = headers['content-type']
  //   console.log(contType[0])
  //
  //   const matchNormal = contType && contType[0].match(RegNormal)
  //   if(!matchNormal && ((contType && contType[0].match(RegForDL)) || newURL.match(RegForDLExt))){
  //     // console.log(6755,contType && contType[0],newURL,tab.getURL())
  //     const url = tab.getURL()
  //     const map = cache.get(url)
  //     if(map){
  //       map[newURL] = contType && contType[0]
  //     }
  //     else{
  //       cache.set(url,{[newURL]:contType && contType[0]})
  //     }
  //   }
  //
  //   if(!contType || matchNormal || contType[0].startsWith('image')) return
  //
  //   let record,ret,parseUrl
  //   if(ret = (contType[0].match(RegRichMedia))){
  //     let len = headers['content-length']
  //     len = len ? len[0] : null
  //     parseUrl = url.parse(newURL)
  //     const pathname = parseUrl.pathname
  //     const ind = pathname.lastIndexOf('/')
  //     record = {tabId,type:ret[0],contType,size:len,url:newURL,fname: pathname.slice(ind+1)}
  //   }
  //   else{
  //     let len = headers['content-length']
  //     len = len ? len[0] : null
  //     parseUrl = url.parse(newURL)
  //     const pathname = parseUrl.pathname
  //     let type
  //     if(ret = (pathname && (type = mime.getType(pathname)) && type.match(RegRichMedia))){
  //       const ind = pathname.lastIndexOf('/')
  //       record = {tabId,type:ret[0],contType,size:len,url:newURL,fname: pathname.slice(ind+1)}
  //     }
  //   }
  //
  //   if(record){
  //     let cont
  //     for(let w of BrowserWindow.getAllWindows()){
  //       if(w.getTitle().includes('Sushi Browser')){
  //         cont = w.webContents
  //         cont.send("did-get-response-details",record)
  //       }
  //     }
  //   }
  // })

})

// app.on('certificate-error', function(event, webContents, url, error, certificate, callback) {
//   event.preventDefault();
//   if(typeof callback == "function")
//     callback(true)
//   else
//     arguments[9](true)
// });
process.on('open-url-from-tab', (e, source, targetUrl, disposition) => {
  if(mainState.alwaysOpenLinkBackground) disposition = 'background-tab'
  console.log('open-url-from-tab',{...e}, source.id, targetUrl, disposition)
  source.hostWebContents2 && source.hostWebContents2.send('create-web-contents',{id:source.id,targetUrl,disposition})
})

// let recentUrl = []
// let addContents
// ipcMain.on("set-recent-url",(e,url)=>recentUrl.push(url))

// process.on("should-create-web-contents",(e,source, windowContainerType, frameName, targetUrl, partitionId)=>{
//   console.log("should-create-web-contents", windowContainerType, frameName, targetUrl, partitionId)
//   recentUrl.push(targetUrl)
// })
//
// process.on('add-new-contents', async (e, source, newTab, disposition, size, userGesture) => {
//   if(mainState.alwaysOpenLinkBackground) disposition = 'background-tab'
//   console.log('add-new-contents', e, source.getURL(), newTab.guestInstanceId, newTab.getURL(), disposition, size, userGesture)
//   // if (newTab.isBackgroundPage()) { @TODO ELECTRON
//   //   if (newTab.isDevToolsOpened()) {
//   //     newTab.devToolsWebContents.focus()
//   //   } else {
//   //     newTab.toggleDevTools()
//   //   }
//   //   return
//   // }
//
//   const targetUrl = recentUrl.shift()
//   console.log('add-new-contents', newTab.guestInstanceId);
//   // eval(locus)
//   // console.log(tabEvent)
//   // if(newTab.guestInstanceId && tabEvent.windowId !== -1){
//   //   const win = BrowserWindow.fromId(tabEvent.windowId)
//   //   // win.webContents.send("close-tab-from-other-window-clone",{key:tabEvent.key, id:source.id,targetUrl,disposition,guestInstanceId: newTab.guestInstanceId})
//   //   tabEvent.windowId = -1
//   //   return
//   // }
//
//   ipcMain.emit('chrome-webNavigation-onCreatedNavigationTarget',null,{
//     tabId: newTab.id,
//     url: targetUrl,
//     processId: -1,
//     sourceTabId: source.id,
//     sourceFrameId: 0,
//     sourceProcessId: -1,
//     timeStamp: Date.now()
//   })
//
//   console.log(disposition)
//   if ((disposition === 'new-window' || disposition === 'new-popup') && mainState.generalWindowOpenLabel == 'linkTargetWindow') {
//     const currentWindow = getCurrentWindow()
//     ipcMain.once('get-private-reply',(e,privateMode)=>{
//       BrowserWindowPlus.load({id:currentWindow.id,x:size.x,y:size.y,width:size.width,height:size.height,disposition,
//         tabParam:JSON.stringify([{wvId:newTab.webContents.id,guestInstanceId: newTab.guestInstanceId,privateMode}])})
//     })
//     currentWindow.webContents.send('get-private', source.id)
//
//   }
//   else{
//     let cont = source.hostWebContents2
//     // console.log(3333,cont)
//     if(!cont){
//       console.log(11)
//       let host,_url
//       if((_url = source.getURL()) && _url.startsWith('chrome://brave')){
//         host = source
//       }
//       else{
//         console.log(115)
//         const tabId = global.bwMap[source.id]
//         source = webContents.fromId(tabId)
//         source.hostWebContents2.send('create-web-contents', { id: source.id, targetUrl, disposition})
//         return
//       }
//       source = await getFocusedWebContents()
//
//       console.log(22)
//       if(!source){
//         setTimeout(async _=>{
//
//           console.log(33)
//           source = await getFocusedWebContents()
//           ipcMain.emit('set-tab-opener',null,newTab.id,source.id)
//           (host || source.hostWebContents2).send('create-web-contents', { id: source.id, targetUrl, disposition, guestInstanceId: newTab.guestInstanceId })
//         },3000)
//         return
//       }
//       cont = host || source.hostWebContents2
//     }
//     console.log('set-tab-opener',null,newTab.id,source.id)
//     ipcMain.emit('set-tab-opener',null,newTab.id,source.id)
//
//     if(source.getURL().startsWith('chrome-extension')){
//       getFocusedWebContents(false,true).then(source=>{
//         console.log(cont.getURL(),source.getURL());
//         cont.send('create-web-contents', { id: source.id, targetUrl, disposition, guestInstanceId: newTab.guestInstanceId })
//       })
//       return
//     }
//     console.log(22249)
//     cont.send('create-web-contents',{id:source.id,targetUrl,disposition,guestInstanceId: newTab.guestInstanceId})
//   }
//   // e.preventDefault()
// })


function setFlash(app){
  let ppapi_flash_path,flash_path;
  try {
    flash_path = app.getPath('pepperFlashSystemPlugin')
  } catch (e) {
  }

  if(process.platform  == 'win32'){
    let path_flash = flash_path ? require("glob").sync(flash_path) : require("glob").sync(process.arch == 'x64' ? "C:\\Windows\\SysWOW64\\Macromed\\Flash\\pepflashplayer*.dll" : "C:\\Windows\\System32\\Macromed\\Flash\\pepflashplayer*.dll")

    if(path_flash.length > 0) {
      ppapi_flash_path = path_flash[0]
      app.commandLine.appendSwitch('ppapi-flash-path', ppapi_flash_path);
    }
  }
  else if (process.platform == 'linux') {
    const path_flash = require("glob").sync(`${process.env["HOME"]}/.config/google-chrome/PepperFlash/**/libpepflashplayer.so`)
    if (path_flash.length > 0) {
      console.log('flash',path_flash)
      ppapi_flash_path = path_flash[0]
      app.commandLine.appendSwitch('ppapi-flash-path', ppapi_flash_path)
    }
  }
  else{
    let path_flash = flash_path ? require("glob").sync(flash_path) : require("glob").sync("/Library/Internet Plug-Ins/PepperFlashPlayer/PepperFlashPlayer.plugin")
    if (path_flash.length > 0) {
      ppapi_flash_path = path_flash[0]
      app.commandLine.appendSwitch('ppapi-flash-path', ppapi_flash_path);
    }
  }
  if(ppapi_flash_path){
    mainState.flashPath = ppapi_flash_path
    mainState.flash = path.basename(ppapi_flash_path)
  }
}


function setWidevine(app){
  let ppapi_widevine_path,widevine_path
  if(process.platform  == 'win32'){
    const path_widevine = require("glob").sync(`C:\\Program Files (x86)\\Google\\Chrome\\Application\\*\\WidevineCdm\\_platform_specific\\*\\widevinecdm.dll`)
    if (path_widevine.length > 0) {
      ppapi_widevine_path = path_widevine[0]
      app.commandLine.appendSwitch('widevine-cdm-path', path.join(ppapi_widevine_path, '..'))
    }
  }
  else if (process.platform == 'linux') {
    const path_widevine = require("glob").sync(`/opt/google/chrome/libwidevinecdm.so`)
    if (path_widevine.length > 0) {
      ppapi_widevine_path = path_widevine[0]
      console.log('widevine', path.join(ppapi_widevine_path, '..'))
      app.commandLine.appendSwitch('widevine-cdm-path', path.join(ppapi_widevine_path, '..'))
    }
  }
  else{
    let path_widevine = widevine_path ? require("glob").sync(widevine_path) : require("glob").sync("/Applications/Google Chrome.app/Contents/Versions/*/Google Chrome Framework.framework/Versions/A/Libraries/WidevineCdm/_platform_specific/*/libwidevinecdm.dylib")
    if (path_widevine.length > 0) {
      ppapi_widevine_path = path_widevine[0]
      app.commandLine.appendSwitch('widevine-cdm-path', path.join(ppapi_widevine_path, '..'))
    }
  }
  if(ppapi_widevine_path){
    mainState.widevinePath = ppapi_widevine_path
    mainState.widevine = path.basename(ppapi_widevine_path)
  }
}

function createWindow (first,url) {
  return BrowserWindowPlus.load((void 0),first,url)
}

ipcMain.on('init-private-mode',(e,key,partition)=>{
  console.log(898989,e,key,partition)
  let options = {}
  if(partition.startsWith('persist')) options.parent_partition = ''

  if (partition == 'persist:tor') {
    options.isolated_storage = true
    options.tor_proxy = 'socks5://127.0.0.1:9250'
    options.tor_path = path.join(__dirname, '../resource/bin/tor',
      process.platform == 'win32' ? 'win/tor.exe' :
        process.platform == 'darwin' ? 'mac/tor' : 'linux/tor').replace(/app.asar([\/\\])/,'app.asar.unpacked$1')

    const torDaemon = new tor.TorDaemon()
    const sendProgress = condition=>{
      for(let w of BrowserWindow.getAllWindows()){
        if(w.getTitle().includes('Sushi Browser')){
          console.log(condition)
          w.webContents.send("tor-progress",condition)
        }
      }
    }
    torDaemon.setup((err) => {
      if (err) {
        console.log(`Tor failed to make directories: ${err}`)
        return
      }
      torDaemon.on('exit', () => {
        console.log('The Tor process has stopped.')
      })
      torDaemon.on('launch', (socksAddr) => {
        const version = torDaemon.getVersion()
        console.log(`tor: daemon listens on ${socksAddr}, version ${version}`)
        // if (version) {
        //   appActions.setVersionInfo('Tor', version)
        // }
        const bootstrapped = (err, progress) => {
          if (err) {
            console.log(`Tor bootstrap error: ${err}`)
            return
          }
          sendProgress({progress})
        }
        const circuitEstablished = (err, ok) => {
          if (ok) {
            sendProgress({finished: true})
          } else {
            if (err) {
              // Wait for tor to re-initialize a circuit (ex: after a clock jump)
              sendProgress('0')
              console.log(17000, `Tor not ready: ${err}`)
            } else {
              console.log('tor still not ready')
            }
          }
        }
        torDaemon.onBootstrap(bootstrapped, (err) => {
          if (err) {
            console.log(`Tor error bootstrapping: ${err}`)
          }
          torDaemon.onCircuitEstablished(circuitEstablished, (err) => {
            if (err) {
              console.log(`Tor error opening a circuit: ${err}`)
            }
          })
        })
      })
      torDaemon.start()
    })
  }

  const ses = session.fromPartition(partition, options)


  if (partition == 'persist:tor') {
    const torConf = {...defaultConf}
    torConf.torEnabled[0].setting = 'block'
    ses.userPrefs.setDictionaryPref('content_settings', torConf)
  }
  else{
    ses.userPrefs.setDictionaryPref('content_settings', defaultConf)
  }
  ses.userPrefs.setBooleanPref('autofill.enabled', true)
  ses.userPrefs.setBooleanPref('profile.password_manager_enabled', true)
  ses.userPrefs.setBooleanPref('credentials_enable_service', true)
  ses.userPrefs.setBooleanPref('credentials_enable_autosignin', true)
  // adblock.adBlock(ses)
  // httpsEverywhere(ses)
  // trackingProtection(ses)
  extensions.loadAll(ses)
  setTimeout(_=>e.sender.send(`init-private-mode-reply_${key}`,1),1000)
})

let explorerMenu,favoriteMenu,savedStateMenu,downloadMenu
ipcMain.on("explorer-menu",(e,path)=>{
  explorerMenu = {sender:e.sender,path}
  setTimeout(_=>explorerMenu=(void 0),1000)
})

ipcMain.on("favorite-menu",(e,path,isNote,isFile)=>{
  favoriteMenu = {sender:e.sender,path,isNote,isFile}
  setTimeout(_=>favoriteMenu=(void 0),1000)
})

ipcMain.on("download-menu",(e,item)=>{
  downloadMenu = {sender:e.sender,item}
  setTimeout(_=>downloadMenu=(void 0),1000)
})

ipcMain.on("savedState-menu",(e,type)=>{
  savedStateMenu = {sender:e.sender,type}
  setTimeout(_=>savedStateMenu=(void 0),1000)
})

function getSelectionLinks(webContents){
  return new Promise((resolve,reject)=>{
    if(!webContents.hostWebContents2) return resolve()
    webContents.executeJavaScript(
      `(function(){
          const set = new Set()
          for(let n of window.getSelection().getRangeAt(0).cloneContents().querySelectorAll('a')){
            if(n.href && n.href != "#" && !n.href.startsWith('javascript')) set.add(n.href)
          }
          return [...set]
        })()`, (result)=>{
        resolve(result)
      })
    setTimeout(()=>resolve(),100) //@TODO ELECTRON
  })
}


function getSelectionHTML(webContents,props){
  return new Promise((resolve,reject)=>{
    if(!webContents.hostWebContents2) return resolve()
    webContents.executeJavaScript(
      `(function(){
          let str = ""
          for(let n of window.getSelection().getRangeAt(0).cloneContents().childNodes){
            str += n.outerHTML || n.textContent
          }
          return str
        })()`, (result)=>{
        resolve(result)
      })
    setTimeout(()=>resolve(),100) //@TODO ELECTRON
  })
}

function getLinks(webContents,props,selection){
  return new Promise((resolve,reject)=>{
    if(!webContents.hostWebContents2) return resolve()
    webContents.executeJavaScript(
      `(function(){
          const mapA = new Map()
          for(let n of ${selection ? 'window.getSelection().getRangeAt(0).cloneContents()' : 'document'}.querySelectorAll('a')){
            if(n.href && n.href != "#" && !n.href.startsWith('javascript')){
              mapA.set(n.href,n.title || n.innerText)
            }
          }
          const mapI = new Map()
          for(let n of ${selection ? 'window.getSelection().getRangeAt(0).cloneContents()' : 'document'}.querySelectorAll('img')){
            if(n.src && !n.src.startsWith('data')){
              let alt = n.alt
              if(!alt){
                let a = n.closest('a')
                if(a) alt = a.title || a.innerText
              }
              mapI.set(n.src,alt)
            }
          }
          return [[...mapA],[...mapI]]
        })()`, (result)=>{
        resolve(result)
      })
  })
}

function makeDownloadSelectorUrl(props,[links,imgs]){
  const resources = {}//adblock.cache.get(props.pageURL) || {} //@TODO
  for(let [url,name] of imgs){
    const contType = resources[url]
    if(contType){
      resources[url] = [name,contType]
    }
    else{
      resources[url] = [name]
    }
  }
  return `chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/selector.html?data=${encodeURIComponent(JSON.stringify({links,resources}))}`
}

async function startDownloadSelector(win,webContents,props,selection){
  const dlLinks = await getLinks(webContents,props,selection)
  const url = makeDownloadSelectorUrl(props,dlLinks)
  win.webContents.send('new-tab', webContents.id, url)
}

async function contextMenu(webContents, props) {
  console.log('contextttt',webContents.getURL())

  const baseSet = new Set([locale.translation('copyLinkAddress'),
    locale.translation('1047431265488717055'),
    locale.translation('copy'),
    locale.translation('delete'),
    locale.translation("cut"),
    locale.translation("paste")])

  console.log(props.pageURL)
  const disableContextMenus = new Set(mainState.disableContextMenus)

  // if(mainState.rectSelection){
  let rectSelectText
  if(mainState.rectSelection && mainState.rectSelection[0].id == webContents.id){
    props.selectionText = mainState.rectSelection[1]
    rectSelectText = props.selectionText
  }

  let menuItems = []
  const {mediaFlags, editFlags} = props
  const text = props.selectionText.trim()
  const hasText = text.length > 0
  const can = type => editFlags[`can${type}`] && hasText

  const downloadPrompt = (item, win) => {
    ipcMain.emit('need-set-save-filename',null,props.srcURL)
    webContents.downloadURL(props.srcURL)
  }

  const targetWindow = BrowserWindow.fromWebContents(webContents.hostWebContents2 || webContents)
  if (!targetWindow) return

  const isIndex = props.pageURL.match(/^chrome:\/\/brave.+?\/index.html/)
  console.log(props.pageURL)
  // const sidebar = props.pageURL.match(/^chrome\-extension:\/\/.+?_sidebar.html/)
  // if (isIndex && !favoriteMenu && !savedStateMenu) return

  if(favoriteMenu){
    const favMenu = favoriteMenu
    if(!favMenu.isNote){
      menuItems.push({label: locale.translation('openInNewTab'),click: (item,win)=>{favMenu.sender.send(`favorite-menu-reply`,'openInNewTab')}})
      menuItems.push({label: locale.translation('openInNewPrivateTab'),click: (item,win)=>{favMenu.sender.send(`favorite-menu-reply`,'openInNewPrivateTab')}})
      menuItems.push({t: 'openLinkInNewTorTab', label: locale.translation('openLinkInNewTorTab'),click: (item,win)=>{favMenu.sender.send(`favorite-menu-reply`,'openInNewTorTab')}})
      menuItems.push({label: locale.translation('openInNewSessionTab'),click: (item,win)=>{favMenu.sender.send(`favorite-menu-reply`,'openInNewSessionTab')}})
      menuItems.push({label: locale.translation('openInNewWindow'),click: (item,win)=>{favMenu.sender.send(`favorite-menu-reply`,'openInNewWindow')}})
      menuItems.push({t: 'openLinkInNewWindowWithARow', label: locale.translation('openLinkInNewWindowWithARow'),click: (item,win)=>{favMenu.sender.send(`favorite-menu-reply`,'openInNewWindowWithOneRow')}})
      menuItems.push({t: 'openLinkInNewWindowWithTwoRows', label: locale.translation('openLinkInNewWindowWithTwoRows'),click: (item,win)=>{favMenu.sender.send(`favorite-menu-reply`,'openInNewWindowWithTwoRow')}})
      menuItems.push({type: 'separator'})
    }
    if(!favMenu.isFile){
      menuItems.push({label: locale.translation('9065203028668620118'),click: (item,win)=>{favMenu.sender.send(`favorite-menu-reply`,'edit')}})
      menuItems.push({type: 'separator'})
    }

    menuItems.push({label: locale.translation('copy'),click: (item,win)=>{clipboard.writeText(favMenu.path.join(os.EOL))}})
    menuItems.push({label: locale.translation('delete'),click: (item,win)=>{favMenu.sender.send(`favorite-menu-reply`,'delete')}})
    menuItems.push({type: 'separator'})

    menuItems.push({label: locale.translation(favMenu.isNote ? '7791543448312431591' : 'addBookmark'),click: (item,win)=>{favMenu.sender.send(`favorite-menu-reply`,'addBookmark')}})
    menuItems.push({label: locale.translation('addFolder'),click: (item,win)=>{favMenu.sender.send(`favorite-menu-reply`,'addFolder')}})

    var menu = Menu.buildFromTemplate(menuItems)
    menu.popup(targetWindow)
    return
  }
  else if(downloadMenu){
    const downMenu = downloadMenu
    const {item} = downloadMenu
    if(item.description === void 0){
      for(let name of ['Start','Pause','Cancel Download','Remove Row','Show Folder','Open File','Copy File Path','Copy URL']){
        if(name == 'Start' && (item.state == "completed" || (item.state == "progressing" && !item.isPaused))) continue
        if(name == 'Pause' && !(item.state == "progressing" && !item.isPaused)) continue
        if(name == 'Cancel Download' && !(item.state != "completed" && item.state != "cancelled")) continue
        if(name == 'Open File' && item.state == "cancelled") continue
        menuItems.push({label: name,click: (item,win)=>{downMenu.sender.send('download-menu-reply',name)}})
      }
    }
    else{
      const name = 'Copy URL'
      menuItems.push({label: name,click: (item,win)=>{downMenu.sender.send('download-menu-reply',name)}})
    }
    var menu = Menu.buildFromTemplate(menuItems)
    menu.popup(targetWindow)
    return
  }
  else if(savedStateMenu){
    const saveMenu = savedStateMenu
    if(saveMenu.type == 'item' || saveMenu.type == 'directory'){
      menuItems.push({label: locale.translation('openInNewWindow'),click: (item,win)=>{saveMenu.sender.send(`savedState-menu-reply`,'openInNewWindow')}})
      if(saveMenu.type == 'directory'){
        menuItems.push({label: locale.translation('9065203028668620118'),click: (item,win)=>{saveMenu.sender.send(`savedState-menu-reply`,'edit')}})
        menuItems.push({label: locale.translation('delete'),click: (item,win)=>{saveMenu.sender.send(`savedState-menu-reply`,'delete')}})
      }
    }
    else if(saveMenu.type == 'category'){
      menuItems.push({label: locale.translation('delete'),click: (item,win)=>{saveMenu.sender.send(`savedState-menu-reply`,'delete')}})
    }

    if(menuItems.length){
      const menu = Menu.buildFromTemplate(menuItems)
      menu.popup(targetWindow)
    }
    return
  }
  else if(explorerMenu){
    const expMenu = explorerMenu
    menuItems.push({t: 'copyPath', label: locale.translation('copyPath'),click: (item,win)=>{clipboard.writeText(expMenu.path.join(os.EOL))}})
    menuItems.push({t: 'createNewFile', label: locale.translation('createNewFile'),click: (item,win)=>{expMenu.sender.send(`explorer-menu-reply`,'create-file')}})
    menuItems.push({t: 'createNewDirectory', label: locale.translation('createNewDirectory'),click: (item,win)=>{expMenu.sender.send(`explorer-menu-reply`,'create-dirctory')}})
    menuItems.push({t: 'rename', label: locale.translation('rename'),click: (item,win)=>{expMenu.sender.send(`explorer-menu-reply`,'rename')}})
    menuItems.push({t: 'delete', label: locale.translation('delete'),click: (item,win)=>{expMenu.sender.send(`explorer-menu-reply`,'delete')}})
    menuItems.push({type: 'separator'})
  }


  const isLink = props.linkURL && props.linkURL !== ''
  const isImage = props.mediaType === 'image'
  const isVideo = props.mediaType === 'video'
  const isAudio = props.mediaType === 'audio'
  const isInputField = props.isEditable || props.inputFieldType !== 'none'
  const isTextSelected = props.selectionText && props.selectionText.length > 0

  const isNoAction = !(isTextSelected || isInputField || props.mediaType != 'none' || props.linkURL)

  if(isNoAction){
    menuItems.push({t: 'back', label: locale.translation('back'),enabled:await webContents.canGoBack(),  click: (item, win)=>win.webContents.send('go-navigate', webContents.id, 'back')})
    menuItems.push({t: 'forward', label: locale.translation('forward'),enabled: await webContents.canGoForward(), click: (item, win)=>win.webContents.send('go-navigate', webContents.id, 'forward')})
    menuItems.push({t: 'reload', label: locale.translation('reload'),enabled: !webContents.isLoading(), click: (item, win)=>win.webContents.send('go-navigate', webContents.id, 'reload')})
    menuItems.push({type: 'separator'})
  }

  // helper to call code on the element under the cursor
  const callOnElement = js => {
    webContents.executeJavaScript(
      `var el = document.elementFromPoint(${props.x}, ${props.y})
          ${js}`
    )
  }

  // links
  if (props.linkURL) {
    menuItems.push({
      t: 'openInNewTab', label: locale.translation('openInNewTab'), click: (item, win) => {
        targetWindow.webContents.send('new-tab', webContents.id, props.linkURL)
      }
    })
    menuItems.push({
      t: 'openLinkInOppositeTab', label: locale.translation('openLinkInOppositeTab'), click: (item, win) => {
        targetWindow.webContents.send('new-tab-opposite', webContents.id, props.linkURL)
      }
    })
    menuItems.push({
      t: 'openInNewPrivateTab', label: locale.translation('openInNewPrivateTab'), click: (item, win) => {
        targetWindow.webContents.send('new-tab', webContents.id, props.linkURL,`${seq(true)}`)
      }
    })
    menuItems.push({
      t: 'openLinkInNewTorTab', label: locale.translation('openLinkInNewTorTab'), click: (item, win) => {
        targetWindow.webContents.send('new-tab', webContents.id, props.linkURL,'persist:tor')
      }
    })
    menuItems.push({
      t: 'openInNewSessionTab', label: locale.translation('openInNewSessionTab'), click: (item, win) => {
        targetWindow.webContents.send('new-tab', webContents.id, props.linkURL,`persist:${seq()}`)
      }
    })
    menuItems.push({
      t: 'openInNewWindow', label: locale.translation('openInNewWindow'), click: (item, win) => {
        ipcMain.once('get-private-reply',(e,privateMode)=>{
          BrowserWindowPlus.load({id:win.id,sameSize:true,tabParam:JSON.stringify({urls:[{url:props.linkURL,privateMode}],type:'new-win'})})
        })
        targetWindow.webContents.send('get-private', webContents.id)
      }
    })
    menuItems.push({type: 'separator'})
  }

  if (props.linkURL) {
    const isVideoURL = props.linkURL.split("?").slice(-2)[0].match(/\.(3gp|3gpp|3gpp2|asf|avi|dv|flv|m2t|m4v|mkv|mov|mp4|mpeg|mpg|mts|oggtheora|ogv|rm|ts|vob|webm|wmv|aac|m4a|mp3|oga|wav)$/)

    menuItems.push({
      t: '5317780077021120954', label: locale.translation('5317780077021120954'), click: (item, win) => {
        ipcMain.emit('noneed-set-save-filename',null,props.linkURL)
        webContents.downloadURL(props.linkURL)
      }
    })
    menuItems.push({
      t: 'saveLinkAs', label: locale.translation('saveLinkAs'), click: (item, win) => {
        ipcMain.emit('need-set-save-filename',null,props.linkURL)
        console.log("Save Link",props.linkURL)
        webContents.downloadURL(props.linkURL)
      }
    })

    menuItems.push({t: 'copyLinkAddress', label: locale.translation('copyLinkAddress'), click: () => clipboard.writeText(props.linkURL)})
    if(props.mediaType === 'none'){
      menuItems.push({t: '1047431265488717055', label: locale.translation('1047431265488717055'), click: () => clipboard.writeText(props.linkText)})
    }

    if(isVideoURL){
      menuItems.push({t: 'saveAndPlayVideo', label: locale.translation('saveAndPlayVideo'), click: (item, win) => ipcMain.emit('save-and-play-video',null,props.linkURL,win)})
      if(!disableContextMenus.has('Send URL to Video Player')) menuItems.push({label: `Send URL to ${players.find(x=>x.value == mainState.sendToVideo).text}`, click: () => videoProcessList.push(open(mainState.sendToVideo,props.linkURL))})
    }
    menuItems.push({type: 'separator'})
    if(!hasText && props.mediaType === 'none'){
      for(let send of mainState.sendUrlContextMenus){
        if(!send.enable) continue
        let handleClick
        if(send.type == 'new' || send.type == 'opposite'){
          handleClick = (item, win) => targetWindow.webContents.send(send.type == 'new' ? 'new-tab' : 'new-tab-opposite',
            webContents.id, send.sendTo.replace("%s",props.linkURL))
        }
        else if(send.type == 'command' || send.type == 'terminal'){
          const escape = (s)=> '"'+s.replace(/(["\t\n\r\f'$`\\])/g,'\\$1')+'"'
          const command = send.sendTo.replace("%s",escape(props.linkURL))
          if(send.type == 'command'){
            handleClick = (item, win) => open(command, void 0, void 0, void 0, true)
          }
          else{
            ipcMain.once('start-pty-reply', (e, key) => {
              ipcMain.emit(`send-pty_${key}`, null, `${command}\n`)
            })
            handleClick = (item, win) => targetWindow.webContents.send('new-tab', webContents.id, 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/terminal.html')
          }
        }


        menuItems.push({
          label: `Send URL to ${send.name}`,
          click: handleClick
        })
      }

      const type = mainState.searchProviders[mainState.searchEngine].type
      for(let suffix of type ? [''] : mainState.searchEngineDisplayType == 'c' ? ['(c)'] :
        mainState.searchEngineDisplayType == 'o' ? ['(o)'] : mainState.oppositeGlobal ? ['(o)','(c)'] : ['(c)','(o)']){
        menuItems.push({
          t: 'openSearch', label: locale.translation('openSearch').replace(/{{\s*selectedVariable\s*}}/, props.linkText.length > 20 ? `${props.linkText.substr(0, 20)}...` : props.linkText) + suffix,
          click: (item, win) =>  targetWindow.webContents.send('search-text', webContents.id, props.linkText,suffix == '(o)')
        })
      }
    }
  }

  // images
  if (isImage) {
    menuItems.push({
      t: 'openImageInNewTab', label: locale.translation('openImageInNewTab'), click: (item, win) => {
        targetWindow.webContents.send('new-tab', webContents.id, props.srcURL)
      }
    })
    menuItems.push({t: 'saveImage', label: locale.translation('saveImage'), click: downloadPrompt})
    menuItems.push({t: 'copyImage', label: locale.translation('copyImage'), click: () => webContents.copyImageAt(props.x, props.y)})
    menuItems.push({t: 'copyImageAddress', label: locale.translation('copyImageAddress'), click: () => clipboard.writeText(props.srcURL)})
    menuItems.push({type: 'separator'})
  }

  // videos and audios
  if (isVideo || isAudio) {
    menuItems.push({
      t: '994289308992179865', label: locale.translation('994289308992179865'), //'Loop'
      type: 'checkbox',
      checked: mediaFlags.isLooping,
      click: () => callOnElement('el.loop = !el.loop')
    })
    if (mediaFlags.hasAudio){
      if(!disableContextMenus.has('Muted')) menuItems.push({
        label: 'Muted',
        type: 'checkbox',
        checked: mediaFlags.isMuted,
        click: () => callOnElement('el.muted = !el.muted')
      })
    }
    if (mediaFlags.canToggleControls){
      menuItems.push({
        t: '1725149567830788547', label: locale.translation('1725149567830788547'), //'Show Controls'
        type: 'checkbox',
        checked: mediaFlags.isControlsVisible,
        click: () => callOnElement('el.controls = !el.controls')
      })
    }
    menuItems.push({type: 'separator'})
  }

  // videos
  if (isVideo) {
    menuItems.push({
      t: 'playVideoInPopupWindow', label: locale.translation('playVideoInPopupWindow'),
      click: (item, win) => targetWindow.webContents.send('pin-video', webContents.id, true)
    })
    menuItems.push({
      t: 'playVideoInFloatingPanel', label: locale.translation('playVideoInFloatingPanel'),
      click: (item, win) => targetWindow.webContents.send('pin-video', webContents.id)
    })
    menuItems.push({type: 'separator'})
    menuItems.push({
      t: '4643612240819915418', label:  locale.translation('4643612240819915418'), //'Open Video in New Tab',
      click: (item, win) => targetWindow.webContents.send('new-tab', webContents.id, props.srcURL)
    })
    menuItems.push({t: '4256316378292851214', label: locale.translation('4256316378292851214'), //'Save Video As...',
      click: downloadPrompt})
    menuItems.push({t: '782057141565633384', label: locale.translation('782057141565633384'), //'Copy Video URL',
      click: () => clipboard.writeText(props.srcURL)})

    menuItems.push({t: 'saveAndPlayVideo', label: locale.translation('saveAndPlayVideo'), click: (item, win) => ipcMain.emit('save-and-play-video',null,props.srcURL,win)})

    const player = players.find(x=>x.value == mainState.sendToVideo)
    if(player) menuItems.push({t: 'Send URL to Video Player', label: `${locale.translation('sendURL')} to ${player.text}`, click: () => videoProcessList.push(open(mainState.sendToVideo,props.srcURL))})
    menuItems.push({type: 'separator'})
  }

  // audios
  if (isAudio) {
    menuItems.push({
      t: '2019718679933488176', label: locale.translation('2019718679933488176'), //'Open Audio in New Tab',
      click: (item, win) => targetWindow.webContents.send('new-tab', webContents.id, props.srcURL)
    })
    menuItems.push({t: '5116628073786783676', label: locale.translation('5116628073786783676'), //'Save Audio As...',
      click: downloadPrompt})
    menuItems.push({t: '1465176863081977902', label: locale.translation('1465176863081977902'), //'Copy Audio URL',
      click: () => clipboard.writeText(props.srcURL)})
    menuItems.push({type: 'separator'})
  }

  // clipboard
  if (props.isEditable) {
    menuItems.push({t: 'cut', label: locale.translation("cut"), role: 'cut', enabled: can('Cut')})
    if (isDarwin) {
      menuItems.push({t: 'copy', label: locale.translation("copy"), enabled: can('Copy'),
        click(item, focusedWindow) { getFocusedWebContents().then(cont =>cont && cont.copy())}
      })
    }
    else{
      menuItems.push({t: 'copy', label: locale.translation("copy"), role: 'copy', enabled: can('Copy')})
    }
    menuItems.push({t: 'paste', label: locale.translation("paste"), role: 'paste', enabled: editFlags.canPaste})
    menuItems.push({type: 'separator'})
  }
  else if (hasText) {
    // if (isDarwin) {
    //   menuItems.push({t: 'copy', label: locale.translation("copy"), enabled: can('Copy'),
    //     click(item, focusedWindow) { getFocusedWebContents().then(cont =>cont && cont.copy())}
    //   })
    // }
    // else{
    if(mainState.rectSelection){
      menuItems.push({t: 'copy', label: locale.translation("copy"), click(item, focusedWindow){
          clipboard.writeText(mainState.rectSelection[1])
        }})
    }
    else{
      menuItems.push({t: 'copy', label: locale.translation("copy"), role: 'copy', enabled: can('Copy')})
    }
    // }
    if(mainState.contextMenuSearchEngines.length == 0){
      const type = mainState.searchProviders[mainState.searchEngine].type
      const isURLGo = !type && urlutil.isURL(text)
      for(let suffix of type ? [''] : mainState.searchEngineDisplayType == 'c' ? ['(c)'] :
        mainState.searchEngineDisplayType == 'o' ? ['(o)'] : mainState.oppositeGlobal ? ['(o)','(c)'] : ['(c)','(o)']){
        const label = isURLGo ? locale.translation('2948300991547862301').replace(/<ph name="PAGE_TITLE">/,text).replace(/<\/ph>/,'') :
          locale.translation('openSearch').replace(/{{\s*selectedVariable\s*}}/, text.length > 20 ? `${text.substr(0, 20)}...` : text)
        menuItems.push({
          t: 'openSearch', label: label + suffix,
          click: (item, win) =>  targetWindow.webContents.send(isURLGo ? suffix == '(o)' ? 'new-tab-opposite' : 'new-tab' : 'search-text',
            webContents.id, isURLGo ? urlutil.getUrlFromInput(text) : text ,suffix == '(o)')
        })
      }
    }
    else{
      if(urlutil.isURL(text)){
        for(let suffix of mainState.searchEngineDisplayType == 'c' ? ['(c)'] :
          mainState.searchEngineDisplayType == 'o' ? ['(o)'] : mainState.oppositeGlobal ? ['(o)','(c)'] : ['(c)','(o)']){
          const label = locale.translation('2948300991547862301').replace(/<ph name="PAGE_TITLE">/,text).replace(/<\/ph>/,'')
          menuItems.push({
            t: 'openSearch', label: label + suffix,
            click: (item, win) =>  targetWindow.webContents.send(suffix == '(o)' ? 'new-tab-opposite' : 'new-tab',
              webContents.id, urlutil.getUrlFromInput(text) ,suffix == '(o)')
          })
        }
      }

      for(let engine of mainState.contextMenuSearchEngines){
        if(!mainState.searchProviders[engine]) continue

        let labelShortcut = ''
        let searchShortcut = ''
        if(engine != mainState.searchEngine){
          const shortcut = mainState.searchProviders[engine].shortcut
          labelShortcut = `${shortcut}:`
          searchShortcut = `${shortcut} `
        }
        const type = mainState.searchProviders[engine].type
        for(let suffix of type ? [''] :  mainState.searchEngineDisplayType == 'c' ? ['(c)'] :
          mainState.searchEngineDisplayType == 'o' ? ['(o)'] : mainState.oppositeGlobal ? ['(o)','(c)'] : ['(c)','(o)']){
          const label = labelShortcut + locale.translation('openSearch').replace(/{{\s*selectedVariable\s*}}/, text.length > 20 ? `${text.substr(0, 20)}...` : text)
          menuItems.push({
            t: 'openSearch', label: label + suffix,
            click: (item, win) =>  targetWindow.webContents.send('search-text', webContents.id, `${searchShortcut}${text}` ,suffix == '(o)')
          })
        }
      }
    }

    for(let suffix of mainState.searchEngineDisplayType == 'c' ? ['(c)'] :
      mainState.searchEngineDisplayType == 'o' ? ['(o)'] : mainState.oppositeGlobal ? ['(o)','(c)'] : ['(c)','(o)']){
      menuItems.push({ t: 'addToNotes', label: locale.translation('addToNotes') + suffix, click: async (item,win)=>{
          targetWindow.webContents.send(suffix == '(o)' ? 'new-tab-opposite' : 'new-tab',
            webContents.id, `chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/note.html?content=${encodeURIComponent(rectSelectText ? rectSelectText.replace(/\r?\n/g,"<br/>") :  (await getSelectionHTML(webContents)))}` ,suffix == '(o)')

        }})
    }

    console.log('getSelectionLinks1')
    const links = await getSelectionLinks(webContents,props)
    console.log('getSelectionLinks2')
    if(links && links.length) {
      menuItems.push({type: 'separator'})
      menuItems.push({t: 'copyLinks', label: locale.translation('copyLinks'), click: (item,win)=> clipboard.writeText(links.join(os.EOL))})
      menuItems.push({label: locale.translation('openalllinksLabel'), click: (item,win)=>{
          for(let link of links){
            setTimeout(_=>targetWindow.webContents.send('new-tab', webContents.id, link),0)
          }
        }})
      menuItems.push({t: 'downloadSelection', label: locale.translation('downloadSelection'), click: (item,win)=> startDownloadSelector(win,webContents,props,true)})
    }
    menuItems.push({type: 'separator'})
  }

  if(isNoAction) {
    menuItems.push({
      t: 'savePageAs', label: locale.translation('savePageAs'), click: (item, win) => {
        console.log('down1',webContents.getURL())
        ipcMain.emit('need-set-save-filename',null,webContents.getURL())
        ipcMain.emit('save-page-as',null,webContents.getURL())
        webContents.downloadURL(webContents.getURL())
      }
    })

    menuItems.push({
      t: 'bookmarkPage', label: locale.translation('bookmarkPage'), click: (item, win) => {
        targetWindow.webContents.send('add-favorite', webContents.id)
      }
    })
    menuItems.push({t: 'print', label: locale.translation('print'), click: () => webContents.print()})
    menuItems.push({t: '2473195200299095979', label: syncReplaceName, click: (item, win) => targetWindow.webContents.send('sync-replace-from-menu', webContents.id)})
    menuItems.push({type: 'separator'})

    menuItems.push({t: 'downloadAll', label: locale.translation('downloadAll'), click: (item,win)=> startDownloadSelector(win,webContents,props)})
    menuItems.push({type: 'separator'})

    menuItems.push({
      t: 'syncScrollLeftToRight', label: locale.translation('syncScrollLeftToRight'), click: (item, win) => {
        targetWindow.webContents.send('open-panel', {url: webContents.getURL(), sync: uuid.v4(), id: webContents.id})
      }
    })
    menuItems.push({
      t: 'syncScrollRightToLeft', label: locale.translation('syncScrollRightToLeft'), click: (item, win) => {
        targetWindow.webContents.send('open-panel', {
          url: webContents.getURL(),
          sync: uuid.v4(),
          id: webContents.id,
          dirc: -1
        })
      }
    })
    menuItems.push({type: 'separator'})

    menuItems.push({
      t: 'viewPageSource', label: locale.translation('viewPageSource'), click: (item, win) => {
        targetWindow.webContents.send('new-tab', webContents.id, `view-source:${webContents.getURL()}`)
      }
    })
  }
  menuItems.push({
    t: 'inspectElement', label: locale.translation('inspectElement'), click: async item => {
      if(webContents.devToolsWebContents){
        webContents.inspectElement(props.x, props.y)
        if (webContents.isDevToolsOpened())
          webContents.devToolsWebContents.focus()
      }
      else{
        const cont = webContents
        cont && cont.hostWebContents2.send('menu-or-key-events', 'toggleDeveloperTools', cont.id)
        let devToolsWebContents
        for(let i=0;i<100;i++){
          await new Promise(r=>{
            setTimeout(_=>{
              devToolsWebContents = cont.devToolsWebContents
              r()
            },100)
          })
          if(devToolsWebContents){
            webContents.inspectElement(props.x, props.y)
            if (webContents.isDevToolsOpened())
              webContents.devToolsWebContents.focus()
            break
          }
        }
      }
    }
  })

  console.log(99999988,sharedState.extensionMenu)

  if(Object.keys(sharedState.extensionMenu).length){
    for(let [extensionId, propertiesList] of Object.entries(sharedState.extensionMenu)){
      const menuList = []
      // console.log(propertiesList)
      for(let {properties, menuItemId, icon} of propertiesList){
        let contextsPassed = false
        const info = {}
        if(!properties.contexts || !properties.contexts.length) properties.contexts = ['all']
        for(let context of properties.contexts){
          if (isTextSelected && (context === 'selection' || context === 'all')) {
            info.selectionText = props.selectionText
            contextsPassed = true
          }
          else if (isLink && (context === 'link' || context === 'all')) {
            info.linkUrl = props.linkURL
            contextsPassed = true
          }
          else if (isImage && (context === 'image' || context === 'all')) {
            info.mediaType = 'image'
            contextsPassed = true
          }
          else if (isInputField && (context === 'editable' || context === 'all')) {
            info.editable = true
            contextsPassed = true
          }
          else if (props.pageURL && (context === 'page' || context === 'all')) {
            info.pageUrl = props.pageURL
            contextsPassed = true
          }
          else if (isVideo && (context === 'video' || context === 'all')) {
            info.mediaType = 'video'
            contextsPassed = true
          }
          else if (isAudio && (context === 'audio' || context === 'all')) {
            info.mediaType = 'audio'
            contextsPassed = true
          }
          else if (props.frameURL && (context === 'frame' || context === 'all')) {
            info.frameUrl = props.frameURL
            contextsPassed = true
          }
        }
        // TODO (Anthony): Browser Action context menu
        if(!contextsPassed || properties.contexts[0] === 'browser_action') continue

        if(props.srcURL) info.srcUrl = props.srcURL
        if(props.pageURL) info.pageUrl = props.pageURL
        info.menuItemId = menuItemId

        const item = {
          label: properties.title,
          click(){
            ipcMain.emit('chrome-context-menus-clicked',null, extensionId, webContents.id, info)}
        }
        if(menuItemId) item.menuItemId = menuItemId
        if(properties.checked !== void 0) item.checked = properties.checked
        if(properties.enabled !== void 0) item.enabled = properties.enabled
        if(properties.documentUrlPatterns !== void 0){
          const url = props.pageURL || props.frameURL
          // console.log('documentUrlPatterns',url,properties.documentUrlPatterns)
          if(url && !nm.some(url, properties.documentUrlPatterns.map(x=>x=='<all_urls>' ? "**" : x.replace(/\*/,'**')))){
            item.hide = true
          }
        }
        if(properties.targetUrlPatterns !== void 0){
          const url = props.linkURL
          // console.log('targetUrlPatterns',url,properties.targetUrlPatterns.map(x=>x=='<all_urls>' ? "**" : x.replace(/\*/,'**')))
          if(url && !nm.some(url, properties.targetUrlPatterns.map(x=>x=='<all_urls>' ? "**" : x.replace(/\*/,'**')))){
            item.hide = true
          }
        }
        if(!item.hide){
          const addItem = properties.type == "separator" ? {type: 'separator'} : item
          let parent
          if(properties.parentId && (parent = menuList.find(m=>m.menuItemId == properties.parentId))){
            if(properties.icons) addItem.icon = path.join(extensionInfos[extensionId].base_path,Object.values(properties.icons)[0].replace(/\.svg$/,'.png'))
            if(parent.submenu === void 0){
              parent.submenu = [addItem]
            }
            else{
              parent.submenu.push(addItem)
            }
          }
          else{
            if(icon) addItem.icon = path.join(extensionInfos[extensionId].base_path,icon)
            if(properties.icons) addItem.icon2 = path.join(extensionInfos[extensionId].base_path,Object.values(properties.icons)[0].replace(/\.svg$/,'.png'))
            menuList.push(addItem)
          }
        }
      }
      if(menuList.length == 1 || menuList.length == 2){
        menuItems.push({type: 'separator'})
        for(let menu of menuList){
          if(menu.icon2){
            menu.icon = menu.icon2
            delete menu.icon2
          }
          menuItems.push(menu)
        }
      }
      else if(menuList.length > 2){
        menuItems.push({type: 'separator'})
        menuItems.push({
          label: extensionInfos[extensionId].name,
          icon: menuList[0].icon && menuList[0].icon.replace(/\.svg$/,'.png'),
          submenu: menuList
        })
        menuList.forEach(menu=>{
          delete menu.icon
          if(menu.icon2){
            menu.icon = menu.icon2
            delete menu.icon2
          }
        })
      }
    }
  }

  // show menu
  try{
    if(isIndex){
      console.log(menuItems,baseSet)
      menuItems = menuItems.filter(x=>baseSet.has(x.label))
      if(!menuItems.length) return
    }


    menuItems.forEach((x,i)=>x.num = -i + parseInt(mainState.priorityContextMenus[x.t || x.label] || 0) * 100)
    menuItems = menuItems.sort((a,b)=> b.num - a.num)

    menuItems = menuItems.filter(x=>!disableContextMenus.has(x.t || x.label))

    const menuItems2 = []
    menuItems.forEach((x,i)=>{
      menuItems2.push(x)
      if(menuItems[i+1] && parseInt(x.num / 100) != parseInt(menuItems[i+1].num / 100)){
        menuItems2.push({ type: 'separator' })
      }
    })
    menuItems = menuItems2

    menuItems = menuItems.filter((x,i)=>{
      if(i==0) return x.type != 'separator'
      return !(menuItems[i-1].type == 'separator' && x.type == 'separator')
    })

    const menu = Menu.buildFromTemplate(menuItems)
    if(isWin){
      const closeHandler = () =>  menu.closePopup(targetWindow)
      ipcMain.once('contextmenu-webContents-close', closeHandler)
      webContents.once('did-start-loading', closeHandler)

      // panel.moveTopNativeWindowBw()
      BrowserPanel.contextMenuShowing = true
      menu.popup({window: targetWindow},()=> {
        BrowserPanel.contextMenuShowing = false
        ipcMain.removeListener('contextmenu-webContents-close', closeHandler)
        webContents.removeListener('did-start-loading', closeHandler)
        webContents.focus()
      })
      setTimeout(()=>BrowserPanel.contextMenuShowing = false,500)
      console.log(targetWindow.getTitle())
    }
    else{
      let isMove = false
      ipcMain.once('context-menu-move',e => isMove = true)
      ipcMain.once('context-menu-up',e => {
        console.log(11113)
        if(!isMove){
          console.log(11114)
          menu.popup(targetWindow)
        }
      })
      ;webContents.send('start-mouseup-handler')
    }
  }catch(e){
    console.log(e)
  }
};


ipcMain.on('contextmenu-webContents', async (e, props) => {
  console.log('contextmenu-webContents', props)
  if(!props.pageURL) props.pageURL = await e.sender.getURL()
  contextMenu(e.sender, props)
})