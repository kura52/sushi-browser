import { app, Menu, clipboard, BrowserWindow, ipcMain, session,webContents,shell } from 'electron'
// import ExtensionsMain from './extension/ExtensionsMain'
import PubSub from './render/pubsub'
import mainState from './mainState'
const locale = require('../brave/app/locale')
const BrowserWindowPlus = require('./BrowserWindowPlus')
const extensionMenu = require('./chromeEvents')
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
const mime = require('mime')
const LRUCache = require('lru-cache')
import url from 'url'
const {getUrlFromCommandLine,getNewWindowURL} = require('./cmdLine')
import {getFocusedWebContents, getCurrentWindow} from './util'
const open = require('./open')
const sharedState = require('./sharedStateMain')
const defaultConf = require('./defaultConf')
let adblock,httpsEverywhere,trackingProtection,extensions,videoProcessList = []

// process.on('unhandledRejection', console.dir);

// process.on('unhandledRejection', error => {
//   // Will print "unhandledRejection err is not defined"
//   console.log('unhandledRejection', error);
// });

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

const isWin = os.platform() == 'win32'

process.userAgent = `Mozilla/5.0 (${isWin ? 'Windows NT 10.0; Win64; x64': isDarwin ? 'Macintosh; Intel Mac OS X 10_12_2' : 'X11; Linux x86_64'}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${process.versions.chrome} Safari/537.36`

const players = [
  { value: 'vlc', text: 'VLC Media Player',os:['win','mac','linux']},
  { value: 'PotPlayerMini64', text: 'PotPlayer',os:['win']},
  { value: 'mplayerx', text: 'MPlayerX',os:['mac']},
  { value: 'smplayer', text: 'SMPlayer',os:['win','mac','linux']},
  { value: 'C:\\Program Files\\MPC-HC\\mpc-hc64.exe', text: 'Media Player Classic(MPC-HC)',os:['win']},

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

InitSetting.val.then(setting=>{
  if(setting.enableFlash){
    setFlash(app)
  }
  else{
    defaultConf.flashEnabled = [ { setting: 'deny', primaryPattern: '*' } ]
  }
  if(isLinux || !setting.enableWidevine){
    defaultConf.plugins =  []
  }
  else{
    try{
      const widevinePath = path.join(global.originalUserDataPath,'Extensions/WidevineCdm')
      if(require("glob").sync(path.join(widevinePath,"*")).length == 0){
        const src = path.join(__dirname, '../resource/bin/widevine',
          isWin ? 'win/WidevineCdm' : isDarwin ? 'mac/WidevineCdm' : '').replace(/app.asar([\/\\])/,'app.asar.unpacked$1')
        require('fs-extra').copySync(src,widevinePath)
      }
    }catch(e){
      console.log(e)
    }
  }
  defaultConf.javascript[0].setting = setting.noScript ? 'block' : 'allow'
  defaultConf.canvasFingerprinting[0].setting = setting.blockCanvasFingerprinting ? 'block' : 'allow'
  session.defaultSession.userPrefs.setDictionaryPref('content_settings', defaultConf)
  console.log(678,session.defaultSession.userPrefs.getDictionaryPref('content_settings'))
})
app.setName('Sushi Browser')
app.commandLine.appendSwitch('touch-events', 'enabled');

// ipcMain.setMaxListeners(0)

const RegNormal = /^(application\/(font|javascript|json|x-javascript|xml)|text\/(css|html|javascript|plain))/
const RegRichMedia = /^(video|audio|application\/x\-mpegurl|application\/vnd\.apple\.mpegurl)/
const RegForDL = /^(application\/(pdf|zip|x\-zip\-compressed|x\-lzh)|image|video|audio)/
const RegForDLExt = /\.(?:z(?:ip|[0-9]{2})|r(?:ar|[0-9]{2})|jar|bz2|gz|tar|rpm|7z(?:ip)?|lzma|xz|mp3|wav|og(?:g|a)|flac|midi?|rm|aac|wma|mka|ape|exe|msi|dmg|bin|xpi|iso|pdf|xlsx?|docx?|odf|odt|rtf|jp(?:e?g|e|2)|gif|png|tiff?|bmp|ico|jp(e?g|e|2)|png|mpeg|ra?m|avi|mp(?:g|e|4)|mov|divx|asf|qt|wmv|m\dv|rv|vob|asx|ogm|ogv|webm|flv|mkv)$/i
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

let ptyProcessSet,passwordManager,extensionInfos,syncReplaceName
app.on('ready', async ()=>{
  console.log(1)
  require('./captureEvent')

  const ses = session.defaultSession
  // ses.setEnableBrotli(true)
  // ses.contentSettings.set("*","*","plugins",mainState.flashPath,"allow")
  ses.userPrefs.setDictionaryPref('content_settings', defaultConf)
  ses.userPrefs.setBooleanPref('autofill.enabled', true)
  ses.userPrefs.setBooleanPref('profile.password_manager_enabled', true)
  ses.userPrefs.setBooleanPref('credentials_enable_service', true)
  ses.userPrefs.setBooleanPref('credentials_enable_autosignin', true)


  // ses.autofill.getAutofillableLogins((result) => {
  //   // console.log(1,result)
  // })
  // ses.autofill.getBlackedlistLogins((result) => {
  //   // console.log(2,result)
  // })

  // loadDevtool(loadDevtool.REACT_DEVELOPER_TOOLS);
  //console.log(app.getPath('pepperFlashSystemPlugin'))
  extensionInfos = require('./extensionInfos')
  rlog(process)
  console.log(process.versions)


  // console.log(app.getPath('userData'))
  new (require('./downloadEvent'))()
  require('./historyEvent')
  require('./favoriteEvent')
  require('./messageEvent')
  require('./tabMoveEvent')
  require('./saveEvent')
  require('./userAgentChangeEvent')
  require('./clearEvent')


  ptyProcessSet = require('./ptyProcess')
  // ptyProcessSet = new Set()
  passwordManager = require('./passwordManagerMain')
  require('./importer')
  require('./bookmarksExporter')
  const setting = await InitSetting.val
  require('./faviconsEvent')(async _ => {
    console.log(332,process.argv,getUrlFromCommandLine(process.argv))
    await createWindow(true,isDarwin ? getNewWindowURL() : getUrlFromCommandLine(process.argv))

    adblock = require('../brave/adBlock')
    httpsEverywhere = require('../brave/httpsEverywhere')
    trackingProtection = require('../brave/trackingProtection')


    require('./ipcUtils')
    require('./VideoConverter')
    require('./tabContextMenu')
    require('./syncLoop')

    require('./menuSetting')
    process.emit('app-initialized')

    extensions = require('../brave/extension/extensions')
    // extensions.init(setting.ver !== fs.readFileSync(path.join(__dirname, '../VERSION.txt')).toString())
    extensions.init(true)

    require('./checkUpdate')
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

app.on('window-all-closed', function () {
  console.log('window-all-closed',2221)
  // require('./databaseFork')._kill()
  if (!isDarwin || beforeQuit) {
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
    app.quit()
  }
  else{

  }
})


app.on('will-quit', (e) => {
  console.log('will-quit')
  for(let cont of webContents.getAllWebContents()){
    cont.removeAllListeners('destroyed')
  }
  if(mainState.vpn){
    exec(`rasdial /disconnect`).then(ret=>{})
  }
  if(isDarwin){
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


// app.on('will-quit', (e) => {
//   console.log(33333)
// })

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


const cache = new LRUCache(1000)
app.on('web-contents-created', (e, tab) => {
  contextMenu(tab)
  if (tab.isBackgroundPage() || !tab.isGuest()) {
    return
  }
  let tabId = tab.getId()
  sharedState[tabId] = tab

  let win
  for(let w of BrowserWindow.getAllWindows()){
    if(w.getTitle().includes('Sushi Browser')){
      if(!win) win = w
      PubSub.publish("web-contents-created",[tabId,w.webContents])
    }
  }


  const focus = BrowserWindow.getFocusedWindow()
  if(focus && focus.getTitle().includes('Sushi Browser')){
    win = focus
  }

  const cont = win.webContents
  const key = Math.random().toString()

  tab.on('save-password', (e, username, origin) => {
    console.log('save-password', username, origin)
    passwordManager.savePassword(tab, username, origin)
  })

  tab.on('update-password', (e, username, origin) => {
    console.log('update-password', username, origin)
    passwordManager.updatePassword(tab, username, origin)
  })

  tab.on('close', () => {
    delete sharedState[tabId]
    tab.forceClose()
  })

  tab.on('did-get-response-details', (e, status, newURL, originalURL, httpResponseCode, requestMethod, referrer, headers, resourceType) => {
    const contType = headers['content-type']

    const matchNormal = contType && contType[0].match(RegNormal)
    if(!matchNormal && ((contType && contType[0].match(RegForDL)) || newURL.match(RegForDLExt))){
      // console.log(6755,contType && contType[0],newURL,tab.getURL())
      const url = tab.getURL()
      const map = cache.get(url)
      if(map){
        map[newURL] = contType && contType[0]
      }
      else{
        cache.set(url,{[newURL]:contType && contType[0]})
      }
    }

    if(!contType || matchNormal || contType[0].startsWith('image')) return

    let record,ret,parseUrl
    if(ret = (contType[0].match(RegRichMedia))){
      let len = headers['content-length']
      len = len ? len[0] : null
      parseUrl = url.parse(newURL)
      const pathname = parseUrl.pathname
      const ind = pathname.lastIndexOf('/')
      record = {tabId,type:ret[0],contType,size:len,url:newURL,fname: pathname.slice(ind+1)}
    }
    else{
      let len = headers['content-length']
      len = len ? len[0] : null
      parseUrl = url.parse(newURL)
      const pathname = parseUrl.pathname
      let type
      if(ret = (pathname && (type = mime.getType(pathname)) && type.match(RegRichMedia))){
        const ind = pathname.lastIndexOf('/')
        record = {tabId,type:ret[0],contType,size:len,url:newURL,fname: pathname.slice(ind+1)}
      }
    }

    if(record){
      let cont
      for(let w of BrowserWindow.getAllWindows()){
        if(w.getTitle().includes('Sushi Browser')){
          cont = w.webContents
          cont.send("did-get-response-details",record)
        }
      }
      // console.log(newURL,cont && parseUrl.host.match(RegVideo))
      // if(cont && (parseUrl.host.match(RegVideo) || url.parse(referrer).host.match(RegVideo))){
      //   youtubedl.getInfo(newURL, function(err, info) {
      //     if (err){
      //       cont.send('video-infos-additional',{error:'error'})
      //     }
      //     console.log(info)
      //     const title = info.title
      //     cont.send('video-infos-additional',{title,formats:info.formats.slice(0.12)})
      //   });
      // }
    }
  })

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
  rlog('open-url-from-tab',e, source, targetUrl, disposition)
  source.hostWebContents && source.hostWebContents.send('create-web-contents',{id:source.getId(),targetUrl,disposition})
})

let recentUrl = []
let addContents
ipcMain.on("set-recent-url",(e,url)=>recentUrl.push(url))

process.on("should-create-web-contents",(e,source, windowContainerType, frameName, targetUrl, partitionId)=>{
  console.log("should-create-web-contents", windowContainerType, frameName, targetUrl, partitionId)
  recentUrl.push(targetUrl)
})

process.on('add-new-contents', async (e, source, newTab, disposition, size, userGesture) => {
  if(mainState.alwaysOpenLinkBackground) disposition = 'background-tab'
  console.log('add-new-contents', e, source.getURL(), newTab.guestInstanceId, newTab.getURL(), disposition, size, userGesture)
  if (newTab.isBackgroundPage()) {
    if (newTab.isDevToolsOpened()) {
      newTab.devToolsWebContents.focus()
    } else {
      newTab.openDevTools()
    }
    return
  }

  const targetUrl = recentUrl.shift()
  console.log('add-new-contents', newTab.guestInstanceId);
  // eval(locus)
  // console.log(tabEvent)
  // if(newTab.guestInstanceId && tabEvent.windowId !== -1){
  //   const win = BrowserWindow.fromId(tabEvent.windowId)
  //   // win.webContents.send("close-tab-from-other-window-clone",{key:tabEvent.key, id:source.id,targetUrl,disposition,guestInstanceId: newTab.guestInstanceId})
  //   tabEvent.windowId = -1
  //   return
  // }

  ipcMain.emit('chrome-webNavigation-onCreatedNavigationTarget',null,{
    tabId: newTab.getId(),
    url: targetUrl,
    processId: -1,
    sourceTabId: source.getId(),
    sourceFrameId: 0,
    sourceProcessId: -1,
    timeStamp: Date.now()
  })

  console.log(disposition)
  if ((disposition === 'new-window' || disposition === 'new-popup') && mainState.generalWindowOpenLabel == 'linkTargetWindow') {
    const currentWindow = getCurrentWindow()
    ipcMain.once('get-private-reply',(e,privateMode)=>{
      BrowserWindowPlus.load({id:currentWindow.id,x:size.x,y:size.y,width:size.width,height:size.height,disposition,
        tabParam:JSON.stringify([{wvId:newTab.webContents.getId(),guestInstanceId: newTab.guestInstanceId,privateMode}])})
    })
    currentWindow.webContents.send('get-private', source.getId())

  }
  else{
    let cont = source.hostWebContents
    // console.log(3333,cont)
    if(!cont){
      let host,_url
      if((_url = source.getURL()) && _url.startsWith('chrome://brave')){
        host = source
      }
      source = await getFocusedWebContents()
      if(!source){
        setTimeout(async _=>{
          source = await getFocusedWebContents()
          ipcMain.emit('set-tab-opener',null,newTab.getId(),source.getId())
          (host || source.hostWebContents).send('create-web-contents', { id: source.getId(), targetUrl, disposition, guestInstanceId: newTab.guestInstanceId })
        },3000)
        return
      }
      cont = host || source.hostWebContents
    }
    console.log('set-tab-opener',null,newTab.getId(),source.getId())
    ipcMain.emit('set-tab-opener',null,newTab.getId(),source.getId())

    if(source.getURL().startsWith('chrome-extension')){
      getFocusedWebContents(false,true).then(source=>{
        console.log(cont.getURL(),source.getURL());
        cont.send('create-web-contents', { id: source.getId(), targetUrl, disposition, guestInstanceId: newTab.guestInstanceId })
      })
      return
    }
    console.log(22249)
    cont.send('create-web-contents',{id:source.getId(),targetUrl,disposition,guestInstanceId: newTab.guestInstanceId})
  }
  // e.preventDefault()
})


function setFlash(app){
  let ppapi_flash_path,flash_path;
  try {
    flash_path = app.getPath('pepperFlashSystemPlugin')
  } catch (e) {
  }

  if(process.platform  == 'win32'){
    let path_flash = flash_path ? require("glob").sync(flash_path) : []

    if(path_flash.length > 0) {
      ppapi_flash_path = path_flash[0]
      app.commandLine.appendSwitch('ppapi-flash-path', ppapi_flash_path);
    }
  }
  else if (process.platform == 'linux') {
    const path_flash = require("glob").sync(`${process.env["HOME"]}/.config/google-chrome/PepperFlash/**/libpepflashplayer.so`)
    if (path_flash.length > 0) {
      ppapi_flash_path = path_flash[0]
      app.commandLine.appendSwitch('ppapi-flash-path', ppapi_flash_path);
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

function createWindow (first,url) {
  const initWindow = BrowserWindowPlus.load
  ((void 0),first,url)
  return initWindow
}

ipcMain.on('init-private-mode',(e,key,partition)=>{
  const ses = session.fromPartition(partition)
  ses.userPrefs.setDictionaryPref('content_settings', defaultConf)
  ses.userPrefs.setBooleanPref('autofill.enabled', true)
  ses.userPrefs.setBooleanPref('profile.password_manager_enabled', true)
  ses.userPrefs.setBooleanPref('credentials_enable_service', true)
  ses.userPrefs.setBooleanPref('credentials_enable_autosignin', true)
  adblock.adBlock(ses)
  httpsEverywhere(ses)
  trackingProtection(ses)
  extensions.loadAll(ses)
  e.sender.send(`init-private-mode-reply_${key}`,1)
})

let explorerMenu,favoriteMenu,savedStateMenu,downloadMenu
ipcMain.on("explorer-menu",(e,path)=>{
  explorerMenu = {sender:e.sender,path}
  setTimeout(_=>explorerMenu=(void 0),1000)
})

ipcMain.on("favorite-menu",(e,path)=>{
  favoriteMenu = {sender:e.sender,path}
  setTimeout(_=>favoriteMenu=(void 0),1000)
})

ipcMain.on("download-menu",(e,item)=>{
  downloadMenu = {sender:e.sender,item}
  setTimeout(_=>downloadMenu=(void 0),1000)
})

ipcMain.on("savedState-menu",(e,canDelete)=>{
  savedStateMenu = {sender:e.sender,canDelete}
  setTimeout(_=>savedStateMenu=(void 0),1000)
})

function getSelectionLinks(webContents,props){
  return new Promise((resolve,reject)=>{
    if(!webContents.hostWebContents) return resolve()
    webContents.executeScriptInTab('dckpbojndfoinamcdamhkjhnjnmjkfjd',
      `(function(){
          const set = new Set()
          for(let n of window.getSelection().getRangeAt(0).cloneContents().querySelectorAll('a')){
            if(n.href && n.href != "#" && !n.href.startsWith('javascript')) set.add(n.href)
          }
          return [...set]
        })()`, {},(err, url, result)=>{
        resolve(result[0])
      })
  })
}

function getLinks(webContents,props,selection){
  return new Promise((resolve,reject)=>{
    if(!webContents.hostWebContents) return resolve()
    webContents.executeScriptInTab('dckpbojndfoinamcdamhkjhnjnmjkfjd',
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
        })()`, {},(err, url, result)=>{
        resolve(result[0])
      })
  })
}

function makeDownloadSelectorUrl(props,[links,imgs]){
  const resources = cache.get(props.pageURL) || {}
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
  win.webContents.send('new-tab', webContents.getId(), url)
}

const webContents2 = webContents
function contextMenu(webContents) {

  const baseSet = new Set([locale.translation('copyLinkAddress'),
    locale.translation('1047431265488717055'),
    locale.translation('copy'),
    locale.translation('delete'),
    locale.translation("cut"),
    locale.translation("paste")])

  webContents.on('context-menu', async (e, props) => {
    console.log(props.pageURL)
    const disableContextMenus = new Set(mainState.disableContextMenus)

    let menuItems = []
    const {mediaFlags, editFlags} = props
    const text = props.selectionText.trim()
    const hasText = text.length > 0
    const can = type => editFlags[`can${type}`] && hasText

    const downloadPrompt = (item, win) => {
      PubSub.publishSync('need-set-save-filename',props.srcURL)
      win.webContents.downloadURL(props.srcURL,true)
    }

    var targetWindow = BrowserWindow.getFocusedWindow()
    if (!targetWindow) return

    const isIndex = props.pageURL.match(/^chrome:\/\/brave.+?\/index.html/)
    console.log(props.pageURL)
    // const sidebar = props.pageURL.match(/^chrome\-extension:\/\/.+?_sidebar.html/)
    // if (isIndex && !favoriteMenu && !savedStateMenu) return

    if(favoriteMenu){
      const favMenu = favoriteMenu

      menuItems.push({label: locale.translation('openInNewTab'),click: (item,win)=>{favMenu.sender.send(`favorite-menu-reply`,'openInNewTab')}})
      menuItems.push({label: locale.translation('openInNewPrivateTab'),click: (item,win)=>{favMenu.sender.send(`favorite-menu-reply`,'openInNewPrivateTab')}})
      menuItems.push({label: locale.translation('openInNewSessionTab'),click: (item,win)=>{favMenu.sender.send(`favorite-menu-reply`,'openInNewSessionTab')}})
      menuItems.push({label: locale.translation('openInNewWindow'),click: (item,win)=>{favMenu.sender.send(`favorite-menu-reply`,'openInNewWindow')}})
      menuItems.push({label: 'Open Link in New Window with a Row',click: (item,win)=>{favMenu.sender.send(`favorite-menu-reply`,'openInNewWindowWithOneRow')}})
      menuItems.push({label: 'Open Link in New Window with two Rows',click: (item,win)=>{favMenu.sender.send(`favorite-menu-reply`,'openInNewWindowWithTwoRow')}})

      menuItems.push({type: 'separator'})

      menuItems.push({label: locale.translation('9065203028668620118'),click: (item,win)=>{favMenu.sender.send(`favorite-menu-reply`,'edit')}})
      menuItems.push({type: 'separator'})

      menuItems.push({label: locale.translation('copy'),click: (item,win)=>{clipboard.writeText(favMenu.path.join(os.EOL))}})
      menuItems.push({label: locale.translation('delete'),click: (item,win)=>{favMenu.sender.send(`favorite-menu-reply`,'delete')}})
      menuItems.push({type: 'separator'})

      menuItems.push({label: locale.translation('addBookmark'),click: (item,win)=>{favMenu.sender.send(`favorite-menu-reply`,'addBookmark')}})
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
      menuItems.push({label: locale.translation('openInNewWindow'),click: (item,win)=>{saveMenu.sender.send(`savedState-menu-reply`,'openInNewWindow')}})
      if(saveMenu.canDelete){
        menuItems.push({label: locale.translation('9065203028668620118'),click: (item,win)=>{saveMenu.sender.send(`savedState-menu-reply`,'edit')}})
        menuItems.push({label: locale.translation('delete'),click: (item,win)=>{saveMenu.sender.send(`savedState-menu-reply`,'delete')}})
      }
      var menu = Menu.buildFromTemplate(menuItems)
      menu.popup(targetWindow)
      return
    }
    else if(explorerMenu){
      const expMenu = explorerMenu
      menuItems.push({label: 'Copy Path',click: (item,win)=>{clipboard.writeText(expMenu.path.join(os.EOL))}})
      menuItems.push({label: 'Create New File',click: (item,win)=>{expMenu.sender.send(`explorer-menu-reply`,'create-file')}})
      menuItems.push({label: 'Create New Directory',click: (item,win)=>{expMenu.sender.send(`explorer-menu-reply`,'create-dirctory')}})
      menuItems.push({label: 'Rename',click: (item,win)=>{expMenu.sender.send(`explorer-menu-reply`,'rename')}})
      menuItems.push({label: 'Delete (Move to Trash)',click: (item,win)=>{expMenu.sender.send(`explorer-menu-reply`,'delete')}})
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
      menuItems.push({t: 'back', label: locale.translation('back'),enabled:webContents.canGoBack(),  click: (item, win)=>win.webContents.send('go-navigate', webContents.getId(), 'back')})
      menuItems.push({t: 'forward', label: locale.translation('forward'),enabled: webContents.canGoForward(), click: (item, win)=>win.webContents.send('go-navigate', webContents.getId(), 'forward')})
      menuItems.push({t: 'reload', label: locale.translation('reload'),enabled: !webContents.isLoading(), click: (item, win)=>win.webContents.send('go-navigate', webContents.getId(), 'reload')})
      menuItems.push({type: 'separator'})
    }

    // helper to call code on the element under the cursor
    const callOnElement = js => {
      webContents.executeScriptInTab('dckpbojndfoinamcdamhkjhnjnmjkfjd',
        `var el = document.elementFromPoint(${props.x}, ${props.y})
          ${js}`,{}
      )
    }

    // links
    if (props.linkURL) {
      menuItems.push({
        t: 'openInNewTab', label: locale.translation('openInNewTab'), click: (item, win) => {
          win.webContents.send('new-tab', webContents.getId(), props.linkURL)
        }
      })
      menuItems.push({
        label: 'Open Link in Opposite Tab', click: (item, win) => {
          win.webContents.send('new-tab-opposite', webContents.getId(), props.linkURL)
        }
      })
      menuItems.push({
        t: 'openInNewPrivateTab', label: locale.translation('openInNewPrivateTab'), click: (item, win) => {
          win.webContents.send('new-tab', webContents.getId(), props.linkURL,Math.random().toString())
        }
      })
      menuItems.push({
        t: 'openInNewSessionTab', label: locale.translation('openInNewSessionTab'), click: (item, win) => {
          win.webContents.send('new-tab', webContents.getId(), props.linkURL,`persist:${seq()}`)
        }
      })
      menuItems.push({
        t: 'openInNewWindow', label: locale.translation('openInNewWindow'), click: (item, win) => {
          ipcMain.once('get-private-reply',(e,privateMode)=>{
            BrowserWindowPlus.load({id:win.id,sameSize:true,tabParam:JSON.stringify({urls:[{url:props.linkURL,privateMode}],type:'new-win'})})
          })
          win.webContents.send('get-private', webContents.getId())
        }
      })
      menuItems.push({type: 'separator'})
    }

    if (props.linkURL) {
      const isVideoURL = props.linkURL.split("?").slice(-2)[0].match(/\.(3gp|3gpp|3gpp2|asf|avi|dv|flv|m2t|m4v|mkv|mov|mp4|mpeg|mpg|mts|oggtheora|ogv|rm|ts|vob|webm|wmv|aac|m4a|mp3|oga|wav)$/)

      menuItems.push({
        t: '5317780077021120954', label: locale.translation('5317780077021120954'), click: (item, win) => {
          win.webContents.downloadURL(props.linkURL,true)
        }
      })
      menuItems.push({
        t: 'saveLinkAs', label: locale.translation('saveLinkAs'), click: (item, win) => {
          PubSub.publishSync('need-set-save-filename',props.linkURL)
          console.log("Save Link",win)
          win.webContents.downloadURL(props.linkURL,true)
        }
      })

      menuItems.push({t: 'copyLinkAddress', label: locale.translation('copyLinkAddress'), click: () => clipboard.writeText(props.linkURL)})
      if(props.mediaType === 'none'){
        menuItems.push({t: '1047431265488717055', label: locale.translation('1047431265488717055'), click: () => clipboard.writeText(props.linkText)})
      }

      if(isVideoURL){
        menuItems.push({label: 'Save and Play Video', click: (item, win) => ipcMain.emit('save-and-play-video',null,props.linkURL,win)})
        if(!disableContextMenus.has('Send URL to Video Player')) menuItems.push({label: `Send URL to ${players.find(x=>x.value == mainState.sendToVideo).text}`, click: () => videoProcessList.push(open(props.linkURL,mainState.sendToVideo))})
      }
      menuItems.push({type: 'separator'})
      if(!hasText && props.mediaType === 'none'){
        const type = mainState.searchProviders[mainState.searchEngine].type
        for(let suffix of type ? [''] : mainState.oppositeGlobal ? ['(o)','(c)'] : ['(c)','(o)']){
          menuItems.push({
            t: 'openSearch', label: locale.translation('openSearch').replace(/{{\s*selectedVariable\s*}}/, props.linkText.length > 20 ? `${props.linkText.substr(0, 20)}...` : props.linkText) + suffix,
            click: (item, win) =>  win.webContents.send('search-text', webContents.getId(), props.linkText,suffix == '(o)')
          })
        }
      }
    }

    // images
    if (isImage) {
      menuItems.push({
        t: 'openImageInNewTab', label: locale.translation('openImageInNewTab'), click: (item, win) => {
          win.webContents.send('new-tab', webContents.getId(), props.srcURL)
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
        label:  'Play Video in Popup Window',
        click: (item, win) => win.webContents.send('pin-video', webContents.getId(), true)
      })
      menuItems.push({
        label:  'Play Video in Floating Panel',
        click: (item, win) => win.webContents.send('pin-video', webContents.getId())
      })
      menuItems.push({type: 'separator'})
      menuItems.push({
        t: '4643612240819915418', label:  locale.translation('4643612240819915418'), //'Open Video in New Tab',
        click: (item, win) => win.webContents.send('new-tab', webContents.getId(), props.srcURL)
      })
      menuItems.push({t: '4256316378292851214', label: locale.translation('4256316378292851214'), //'Save Video As...',
        click: downloadPrompt})
      menuItems.push({t: '782057141565633384', label: locale.translation('782057141565633384'), //'Copy Video URL',
        click: () => clipboard.writeText(props.srcURL)})

      menuItems.push({label: 'Save and Play Video', click: (item, win) => ipcMain.emit('save-and-play-video',null,props.srcURL,win)})

      const player = players.find(x=>x.value == mainState.sendToVideo)
      if(player) menuItems.push({t: 'Send URL to Video Player', label: `Send URL to ${player.text}`, click: () => videoProcessList.push(open(props.srcURL,mainState.sendToVideo))})
      menuItems.push({type: 'separator'})
    }

    // audios
    if (isAudio) {
      menuItems.push({
        t: '2019718679933488176', label: locale.translation('2019718679933488176'), //'Open Audio in New Tab',
        click: (item, win) => win.webContents.send('new-tab', webContents.getId(), props.srcURL)
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
      if (isDarwin) {
        menuItems.push({t: 'copy', label: locale.translation("copy"), enabled: can('Copy'),
          click(item, focusedWindow) { getFocusedWebContents().then(cont =>cont && cont.copy())}
        })
      }
      else{
        menuItems.push({t: 'copy', label: locale.translation("copy"), role: 'copy', enabled: can('Copy')})
      }
      if(mainState.contextMenuSearchEngines.length == 0){
        const type = mainState.searchProviders[mainState.searchEngine].type
        for(let suffix of type ? [''] : mainState.oppositeGlobal ? ['(o)','(c)'] : ['(c)','(o)']){
          menuItems.push({
            t: 'openSearch', label: locale.translation('openSearch').replace(/{{\s*selectedVariable\s*}}/, text.length > 20 ? `${text.substr(0, 20)}...` : text) + suffix,
            click: (item, win) => win.webContents.send('search-text', webContents.getId(), text,suffix == '(o)')
          })
        }
      }
      else{
        for(let engine of mainState.contextMenuSearchEngines){
          let labelShortcut = ''
          let searchShortcut = ''
          if(engine != mainState.searchEngine){
            const shortcut = mainState.searchProviders[engine].shortcut
            labelShortcut = `${shortcut}:`
            searchShortcut = `${shortcut} `
          }
          const type = mainState.searchProviders[engine].type
          for(let suffix of type ? [''] : mainState.oppositeGlobal ? ['(o)','(c)'] : ['(c)','(o)']){
            menuItems.push({
              t: 'openSearch', label: labelShortcut + locale.translation('openSearch').replace(/{{\s*selectedVariable\s*}}/, text.length > 20 ? `${text.substr(0, 20)}...` : text) + suffix,
              click: (item, win) =>  win.webContents.send('search-text', webContents.getId(), `${searchShortcut}${text}`,suffix == '(o)')
            })
          }
        }
      }
      const links = await getSelectionLinks(webContents,props)
      if(links && links.length) {
        menuItems.push({type: 'separator'})
        menuItems.push({label: 'Copy Links', click: (item,win)=> clipboard.writeText(links.join(os.EOL))})
        menuItems.push({label: locale.translation('openalllinksLabel'), click: (item,win)=>{
            for(let link of links){
              setTimeout(_=>win.webContents.send('new-tab', webContents.getId(), link),0)
            }
          }})
        menuItems.push({label: 'Download Selection', click: (item,win)=> startDownloadSelector(win,webContents,props,true)})
      }
      menuItems.push({type: 'separator'})
    }

    if(isNoAction) {
      menuItems.push({
        t: 'savePageAs', label: locale.translation('savePageAs'), click: (item, win) => {
          PubSub.publishSync('need-set-save-filename',webContents.getURL())
          win.webContents.downloadURL(webContents.getURL(), true)
        }
      })

      menuItems.push({
        t: 'bookmarkPage', label: locale.translation('bookmarkPage'), click: (item, win) => {
          win.webContents.send('add-favorite', webContents.getId())
        }
      })
      menuItems.push({t: 'print', label: locale.translation('print'), click: () => webContents.print()})
      menuItems.push({t: '2473195200299095979', label: syncReplaceName, click: (item, win) => win.webContents.send('sync-replace-from-menu', webContents.getId())})
      menuItems.push({type: 'separator'})

      menuItems.push({label: 'Download All', click: (item,win)=> startDownloadSelector(win,webContents,props)})
      menuItems.push({type: 'separator'})

      menuItems.push({
        label: 'Sync Scroll Left to Right', click: (item, win) => {
          win.webContents.send('open-panel', {url: webContents.getURL(), sync: uuid.v4(), id: webContents.getId()})
        }
      })
      menuItems.push({
        label: 'Sync Scroll Right to Left', click: (item, win) => {
          win.webContents.send('open-panel', {
            url: webContents.getURL(),
            sync: uuid.v4(),
            id: webContents.getId(),
            dirc: -1
          })
        }
      })
      menuItems.push({type: 'separator'})

      menuItems.push({
        t: 'viewPageSource', label: locale.translation('viewPageSource'), click: (item, win) => {
          win.webContents.send('new-tab', webContents.getId(), `view-source:${webContents.getURL()}`)
        }
      })
    }
    menuItems.push({
      t: 'inspectElement', label: locale.translation('inspectElement'), click: item => {
        webContents.inspectElement(props.x, props.y)
        if (webContents.isDevToolsOpened())
          webContents.devToolsWebContents.focus()
      }
    })

    if(Object.keys(extensionMenu).length){
      for(let [extensionId, propertiesList] of Object.entries(extensionMenu)){
        const menuList = []
        // console.log(propertiesList)
        for(let {properties, menuItemId, icon} of propertiesList){
          let contextsPassed = false
          const info = {}
          if(!properties.contexts || !properties.contexts.length) properties.contexts = ['all']
          for(let context of properties.contexts){
            if (isTextSelected && (context === 'selection' || context === 'all')) {
              info['selectionText'] = props.selectionText;
              contextsPassed = true;
            } else if (isLink && (context === 'link' || context === 'all')) {
              info['linkUrl'] = props.linkURL;
              contextsPassed = true;
            } else if (isImage && (context === 'image' || context === 'all')) {
              info['mediaType'] = 'image';
              contextsPassed = true;
            } else if (isInputField && (context === 'editable' || context === 'all')) {
              info['editable'] = true;
              contextsPassed = true;
            } else if (props.pageURL && (context === 'page' || context === 'all')) {
              info['pageUrl'] = props.pageURL;
              contextsPassed = true;
            } else if (isVideo && (context === 'video' || context === 'all')) {
              info['mediaType'] = 'video';
              contextsPassed = true;
            } else if (isAudio && (context === 'audio' || context === 'all')) {
              info['mediaType'] = 'audio';
              contextsPassed = true;
            } else if (props.frameURL && (context === 'frame' || context === 'all')) {
              info['frameURL'] = props.frameURL;
              contextsPassed = true;
            }
          }
          // TODO (Anthony): Browser Action context menu
          if(!contextsPassed || properties.contexts[0] === 'browser_action') continue

          if(props.srcURL) info['srcURL'] = props.srcURL
          info['menuItemId'] = menuItemId

          const item = {
            label: properties.title,
            click(){
              process.emit('chrome-context-menus-clicked',extensionId, webContents.getId(), info)}
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
            icon: menuList[0].icon.replace(/\.svg$/,'.png'),
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
        menu.popup(targetWindow)
      }
      else{
        (webContents.hostWebContents || webContents).executeScriptInTab('dckpbojndfoinamcdamhkjhnjnmjkfjd',
          `(function(){
          const eventMoveHandler = e=>{
            chrome.ipcRenderer.send('context-menu-move',{})
            document.removeEventListener('mousemove',eventMoveHandler)
          }
          const eventUpHandler = e=>{
            if(e.which == 3){
              chrome.ipcRenderer.send('context-menu-up',{})
              document.removeEventListener('mouseup',eventUpHandler)
            }
          }
          document.addEventListener('mousemove',eventMoveHandler)
          document.addEventListener('mouseup',eventUpHandler)
        })()`, {},_=>{
            let isMove = false
            ipcMain.once('context-menu-move',e => isMove = true)
            ipcMain.once('context-menu-up',e => {
              if(!isMove){
                menu.popup(targetWindow)
              }
            })
          })
      }
    }catch(e){
      console.log(e)
    }
  })
};