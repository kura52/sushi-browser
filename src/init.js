import { app, Menu, clipboard, BrowserWindow, ipcMain, session,webContents } from 'electron'
// import ExtensionsMain from './extension/ExtensionsMain'
import PubSub from './render/pubsub'
import mainState from './mainState'
const BrowserWindowPlus = require('./BrowserWindowPlus')
const extensionMenu = require('./chromeEvent')
// const loadDevtool = require('electron-load-devtool');
import path from 'path'
import uuid from 'node-uuid'
const os = require('os')
const isDarwin = process.platform == 'darwin'
const mime = require('mime')
import url from 'url'
const youtubedl = require('youtube-dl')
import {getFocusedWebContents, getCurrentWindow} from './util'

// process.on('unhandledRejection', console.dir);

// process.on('unhandledRejection', error => {
//   // Will print "unhandledRejection err is not defined"
//   console.log('unhandledRejection', error);
// });

const isWin = os.platform() == 'win32'

process.userAgent = `Mozilla/5.0 (${isWin ? 'Windows NT 10.0; Win64; x64': isDarwin ? 'Macintosh; Intel Mac OS X 10_12_2' : 'X11; Linux x86_64'}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${process.versions.chrome} Safari/537.36`

const defaultConf = {
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
  flashAllowed: [ { setting: 'allow', primaryPattern: '*' } ]
}

setFlash(app)
app.commandLine.appendSwitch('touch-events', 'enabled');
// ipcMain.setMaxListeners(0)

const RegNormalResource = /^((?:application\/(?:x(?:-javascript|ml)|j(?:avascript|son))|text\/(?:javascript|plain|html|css)|image))/
const RegRichMedia = /^(video|audio)/
// const RegVideo = /1tv|1up\.com|20min|220\.ro|22tracks|24video|3qsdn|3sat|4tube|56\.com|5min|6play|8tracks|91porn|9c9media|9gag|9now\.com\.au|abc\.net\.au|abcnews|abcotvs|academicearth|acast|addanime|adn|adobetv|adobetvchannel|adobetvshow|adobetvvideo|adultswim|aenetworks|afreecatv|airmozilla|aljazeera|allocine|alphaporno|amcnetworks|anderetijden|animeondemand|anvato|anysex|aparat|appleconnect|appledaily|appletrailers|archive\.org|ard|arkena|arte\.tv|asiancrush|asiancrushplaylist|atresplayer|atttechchannel|atvat|audimedia|audioboom|audiomack|auroravid|awaan|awaan|azmedien|azmedienplaylist|azmedienshowplaylist|baiduvideo|bambuser|bandcamp|bangumi\.bilibili\.com|bbc|bbc\.co\.uk|beatport|beeg|behindkink|bellmedia|bet|bigflix|bild|bilibili|biobiochiletv|biqle|bleacherreport|bleacherreportcms|blinkx|bloomberg|bokecc|bostonglobe|bpb|bravotv|break|brightcove|buzzfeed|byutv|byutvevent|camdemy|camdemyfolder|camwithher|canalc2\.tv|canalplus|canvas|carambatv|carambatvpage|cartoonnetwork|cbc\.ca|cbs|cbsinteractive|cbslocal|cbsnews|cbssports|ccma|cctv|cda|ceskatelevize|ceskatelevizeporady|channel9|charlierose|chaturbate|chilloutzone|chirbit|cinchcast|clipfish|cliphunter|cliprs|clipsyndicate|closertotruth|cloudtime|cloudy|clubic|clyp|cmt\.com|cnbc|cnn|cnnarticle|cnnblogs|collegerama|comcarcoff|comedycentral|comedycentralfullepisodes|comedycentralshortname|comedycentraltv|condenast|corus|coub|cracked|crackle|criterion|crooksandliars|crunchyroll|crunchyroll|csnne|cspan|ctsnews|ctvnews|culturebox\.francetvinfo\.fr|cultureunplugged|curiositystream|cwtv|dailymail|dailymotioncloud|daisuki|daisukiplaylist|daum\.net|dbtv|dctptv|deezerplaylist|defense\.gouv\.fr|democracynow|dhm|digitallyspeaking|digiteka|discovery|discoverygo|discoverygoplaylist|discoverynetworksde|discoveryvr|disney|dotsub|douyushow|douyutv|dplay|dplayit|dramafever|drbonanza|dropbox|drtuber|drtv|dumpert|dvtv|eagleplatform|ebaumsworld|echomsk|egghead|ehow|einthusan|eitb\.tv|ellentv|elpais|embedly|empflix|engadget|eporner|eroprofile|escapist|espn|espnarticle|esrivideo|etonline|europa|everyonesmixtape|expotv|extremetube|eyedotv|facebook|facebookpluginsvideo|faz\.net|fc2|fczenit|fernsehkritik\.tv|filmon|firstpost|fivetv|flickr|flipagram|folketinget|footyroom|formula1|fox|fox9|foxgay|foxnews|foxsports|france2\.fr|franceculture|franceinter|francetv|francetvembed|francetvinfo\.fr|freesound|freespeech\.org|freshlive|funimation|funnyordie|fusion|fxnetworks|gameinformer|gameone|gameone|gamersyde|gamespot|gamestar|gaskrank|gazeta|gdcvault|generic|gfycat|giantbomb|giga|glide|globo|globoarticle|go90|godtube|golem|googledrive|goshgay|gputechconf|groupon|hark|hbo|hearthisat|heise|hellporno|helsinki|hentaistigma|hetklokhuis|hgtv\.com|historicfilms|history|hitbox|hitrecord|hornbunny|hotnewhiphop|hotstar|howcast|howstuffworks|hrti|hrtiplaylist|huajiao|huffpost|hypem|iconosquare|ign\.com|imdb|imgur|imguralbum|ina|inc|indavideo|indavideoembed|infoq|instagram|instagram|internetvideoarchive|iprima|iqiyi|ir90tv|itv|ivi|ivideon|iwara|izlesene|jamendo|jamendoalbum|jeuxvideo|jove|jpopsuki\.tv|jwplatform|kaltura|kamcord|kanalplay|kankan|karaoketv|karrierevideos|keek|keezmovies|ketnet|khanacademy|kickstarter|konserthusetplay|kontrtube|krasview|ku6|kusi|kuwo|la7\.it|laola1tv|lci|lcp|lcpplay|learnr|lecture2go|lego|lemonde|leplaylist|letvcloud|libsyn|life|limelight|litv|liveleak|livestream|lnkgo|loc|localnews8|lovehomeporn|lrt\.lt|lynda|macgamestore|mailru|makerschannel|makertv|mangomolo|matchtv|mdr|media\.ccc\.de|medialaan|mediaset|medici|meipai|melonvod|meta|metacafe|metacritic|mgoon|mgtv|miaopai|minhateca|ministrygrid|minoto|miomio\.tv|mitele|mixcloud|mixer|mlb|mnet|moevideo|mofosex|mojvideo|moniker|morningstar|motherless|motorsport|movieclips|moviefap|moviezine|movingimage|mpora|msn|mtg|mtv|mtv\.de|mtv81|mtvservices|muenchentv|musicplayon|mva|mwave|mwavemeetgreet|myspace|myspass|myvi|myvidster|n-tv\.de|natgeo|naver|nba|nbc|nbcnews|nbcolympics|nbcsports|nbcsportsvplayer|ndr|ndtv|nerdcubedfeed|netease|netzkino|newgrounds|newgroundsplaylist|newstube|nextmedia|nextmediaactionnews|nexttv|nfb|nfl\.com|nhkvod|nhl\.com|nick\.com|nick\.de|nicknight|niconicoplaylist|nintendo|njoy|njpwworld|nobelprize|noco|nonktube|noovo|normalboots|nosvideo|nova|nowness|nowtv (currently broken)|nowtvlist|nowvideo|noz|npo|npo\.nl|npr|nrk|nrkplaylist|nrkskole|nrktv|nrktvdirekte|nrktvepisodes|nrktvseries|ntv\.ru|nuvid|nytimes|nytimesarticle|nzz|ocw\.mit\.edu|odatv|odnoklassniki|oktoberfesttv|on\.aol\.com|ondemandkorea|onet\.pl|onet\.tv|onetmvp|onionstudios|ooyala|ooyalaexternal|openload|oratv|orf|packtpub|packtpubcourse|pandatv|pandora\.tv|parliamentlive\.tv|patreon|pbs|pcmag|people|periscope|philharmoniedeparis|phoenix\.de|photobucket|piksel|pinkbike|pladform|play\.fm|playstv|playtvak|playvid|playwire|pluralsight|plus\.google|podomatic|pokemon|polskieradio|polskieradiocategory|porncom|pornflip|pornhd|pornhub|pornhubplaylist|pornhubuservideos|pornotube|pornovoisines|pornoxo|presstv|primesharetv|promptfile|prosiebensat1|puls4|pyvideo|qqmusic|r7|r7article|radio\.de|radiobremen|radiocanada|radiocanadaaudiovideo|radiofrance|radiojavan|rai|raiplay|raiplaylive|rbmaradio|rds|redbulltv|redtube|regiotv|rentv|rentvarticle|restudy|reuters|reverbnation|revision|revision3|rice|ringtv|rmcdecouverte|rockstargames|roosterteeth|rottentomatoes|roxwel|rozhlas|rtbf|rte|rtl\.nl|rtl2|rtp|rts|rtve\.es|rtvnh|rudo|ruhd|ruleporn|rutube|rutv|ruutu|ruv|safari|sandia|sapo|savefrom\.net|sbs|schooltv|screen\.yahoo|screencast|screencastomatic|scrippsnetworks|seeker|senateisvp|sendtonews|servingsys|sexu|shahid|shared|showroomlive|sina|skylinewebcams|skynewsarabia|skysports|slideshare|slutload|smotri|snotr|sohu|sonyliv|soundcloud|soundgasm|southpark\.cc\.com|southpark\.de|southpark\.nl|southparkstudios\.dk|spankbang|spankwire|spiegel|spiegeltv|spike|sport5|sportboxembed|sportdeutschland|sportschau|sprout|srgssr|srgssrplay|stanfordoc|steam|stitcher|streamable|streamango|streamcloud\.eu|streamcz|streetvoice|sunporno|svt|svtplay|swrmediathek|syfy|sztvhu|t-online\.de|tagesschau|tagesschau|tass|tastytrade|tbs|tdslifeway|teachertube|teachingchannel|teamcoco|teamfourstar|techtalks|techtv\.mit\.edu|ted|tele13|telebruxelles|telecinco|telegraaf|telemb|telequebec|teletask|telewebion|tf1|tfo|theintercept|theoperaplatform|theplatform|theplatformfeed|thescene|thesixtyone|thestar|thesun|theweatherchannel|thisamericanlife|thisav|thisoldhouse|tinypic|tmz|tmzarticle|tnaflix|tnaflixnetworkembed|toggle|toongoggles|tosh|tou\.tv|toypics|toypicsuser|traileraddict (currently broken)|trilulilu|trutv|tube8|tubitv|tumblr|tunein|tunepk|turbo|tutv|tv\.dfb\.de|tv2|tv2\.hu|tv2article|tv3|tv4|tv5mondeplus|tva|tvanouvelles|tvanouvellesarticle|tvc|tvcarticle|tvigle|tvland\.com|tvn24|tvnoe|tvp|tvplayer|tweakers|twitch|twitter|udemy|udnembed|uktvplay|unistra|uol\.com\.br|uplynk|upskill|upskillcourse|urort|urplay|usanetwork|usatoday|ustream|ustudio|varzesh3|vbox7|veehd|veoh|vessel|vesti|vevo|vevoplaylist|vgtv|vh1\.com|viafree|vice|viceland|vidbit|viddler|videa|video\.google|video\.mit\.edu|videodetective|videofy\.me|videomega|videomore|videopremium|videopress|videoweed|vidio|vidme|vidzi|vier|viewlift|viewliftembed|viewster|viidea|viki|vimple|vine|vine|viu|viu|vivo|vlive|vodlocker|vodpl|vodplatform|voicerepublic|voxmedia|vporn|vpro|vrak|vrt|vrv|vshare|vube|vuclip|vvvvid|vyborymos|vzaar|walla|washingtonpost|wat\.tv|watchindianporn|wdr|wdr|webcaster|webcasterfeed|webofstories|webofstoriesplaylist|weiqitv|wholecloud|wimp|wistia|wnl|worldstarhiphop|wrzuta\.pl|wsj|wsjarticle|xbef|xboxclips|xfileshare|fastvideo\.me|xhamster|xhamsterembed|xiami|xminus|xnxx|xstream|xtube|xtubeuser|xuite|xvideos|xxxymovies|yahoo|yam|yandexmusic|yesjapan|yinyueta|ynet|youjizz|youku|youporn|yourupload|zapiks|zaq1|zdf|zdfchannel|zingmp3/

const crashReporter = require('electron').crashReporter
crashReporter.start({
  productName: 'Sushi Browser',
  companyName: '',
  submitURL: '',
  autoSubmit: false,
  extra: {
    node_env: process.env.NODE_ENV,
    rev: '0.0.1'
  }
})

global.rlog = (...args)=>{
  // setTimeout(_=>global.rlog(...args),3000)
}

let ptyProcessSet
let passwordManager
let extensionInfos
app.on('ready', ()=>{
  require('./captureEvent')

  const ses = session.defaultSession
  // ses.setEnableBrotli(true)
  // ses.contentSettings.set("*","*","plugins",mainState.flashPath,"allow")
  ses.userPrefs.setDictionaryPref('content_settings', defaultConf)
  ses.userPrefs.setBooleanPref('autofill.enabled', true)
  ses.userPrefs.setBooleanPref('profile.password_manager_enabled', true)
  ses.userPrefs.setBooleanPref('credentials_enable_service', true)
  ses.userPrefs.setBooleanPref('credentials_enable_autosignin', true)


  ses.autofill.getAutofillableLogins((result) => {
    // console.log(1,result)
  })
  ses.autofill.getBlackedlistLogins((result) => {
    // console.log(2,result)
  })

  // loadDevtool(loadDevtool.REACT_DEVELOPER_TOOLS);
  //console.log(app.getPath('pepperFlashSystemPlugin'))
  extensionInfos = require('./extensionInfos')
  rlog(process)
  console.log(process.versions)


  require('../brave/adBlock')
  // console.log(app.getPath('userData'))
  new (require('./downloadEvent'))()
  require('./historyEvent')
  require('./favoriteEvent')
  require('./messageEvent')
  require('./tabMoveEvent')
  require('./saveEvent')
  require('./userAgentChangeEvent')
  ptyProcessSet = require('./ptyProcess')
  // ptyProcessSet = new Set()
  require('./ipcUtils')
  require('./syncLoop')
  passwordManager = require('./passwordManagerMain')
  require('./importer')
  require('./bookmarksExporter')
  require('../brave/extension/extensions').init()

  require('./faviconsEvent')(_=>{
    createWindow()
    require('./menuSetting')
    process.emit('app-initialized')
  })
})

app.on('window-all-closed', function () {
  console.log(2221)
  // require('./databaseFork')._kill()
  if (!isDarwin) {
    for (let ptyProcess of ptyProcessSet){
      ptyProcess.destroy()
    }
    global.__CHILD__.kill()
    app.quit()
  }
})

app.on('before-quit', (e) => {
  for(let cont of webContents.getAllWebContents()){
    cont.removeAllListeners('destroyed')
  }
  if(isDarwin){
    for (let ptyProcess of ptyProcessSet){
      ptyProcess.destroy()
    }
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


app.on('web-contents-created', (e, tab) => {
  contextMenu(tab)
  if (tab.isBackgroundPage() || !tab.isGuest()) {
    return
  }
  let tabId = tab.getId()

  for(let w of BrowserWindow.getAllWindows()){
    if(w.getTitle().includes('Sushi Browser')){
      w.webContents.send("web-contents-created",tabId)
    }
  }

  tab.on('save-password', (e, username, origin) => {
    console.log('save-password', username, origin)
    passwordManager.savePassword(tab, username, origin)
  })

  tab.on('update-password', (e, username, origin) => {
    console.log('update-password', username, origin)
    passwordManager.updatePassword(tab, username, origin)
  })

  tab.on('did-get-response-details', (e, status, newURL, originalURL, httpResponseCode, requestMethod, referrer, headers, resourceType) => {
    const contType = headers['content-type']
    if(contType && contType[0].match(RegNormalResource)) return

    let record,ret,parseUrl
    if(ret = (contType && contType[0].match(RegRichMedia))){
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
      if(ret = (pathname && mime.lookup(pathname).match(RegRichMedia))){
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
  rlog('open-url-from-tab',e, source, targetUrl, disposition)
  source.hostWebContents.send('create-web-contents',{id:source.getId(),targetUrl,disposition})
})

let recentUrl = []
let addContents
ipcMain.on("set-recent-url",(e,url)=>recentUrl.push(url))

process.on("should-create-web-contents",(e,source, windowContainerType, frameName, targetUrl, partitionId)=>{
  // rlog("should-create-web-contents",e,source, windowContainerType, frameName, targetUrl, partitionId)
  recentUrl.push(targetUrl)
})

process.on('add-new-contents', async (e, source, newTab, disposition, size, userGesture) => {
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
  console.log(size)
  rlog('create-web-contents-host',{targetUrl,e, source, newTab, disposition, size, userGesture})
  // eval(locus)
  // console.log(tabEvent)
  // if(newTab.guestInstanceId && tabEvent.windowId !== -1){
  //   const win = BrowserWindow.fromId(tabEvent.windowId)
  //   // win.webContents.send("close-tab-from-other-window-clone",{key:tabEvent.key, id:source.id,targetUrl,disposition,guestInstanceId: newTab.guestInstanceId})
  //   tabEvent.windowId = -1
  //   return
  // }

  if (disposition === 'new-window' || disposition === 'new-popup') {
    const currentWindow = getCurrentWindow()
    BrowserWindowPlus.load({id:currentWindow.id,x:size.x,y:size.y,width:size.width,height:size.height,disposition,
      tabParam:JSON.stringify([{wvId:newTab.webContents.getId() ,guestInstanceId: newTab.guestInstanceId}])})

  }
  else{
    let cont = source.hostWebContents
    console.log(3333,cont)
    if(!cont){
      source = await getFocusedWebContents()
      cont = source.hostWebContents
    }

    console.log(33,source)
    console.log(44,cont)

    console.log(22249)
    cont.send('create-web-contents',{id:source.getId(),targetUrl,disposition,guestInstanceId: newTab.guestInstanceId})
  }
  // e.preventDefault()
})


function setFlash(app){
  let ppapi_flash_path;

  if(process.platform  == 'win32'){
    let path_flash = app.getPath('pepperFlashSystemPlugin') ? require("glob").sync(app.getPath('pepperFlashSystemPlugin')) : []
    // let path_flash = require("glob").sync(`${process.env["USERPROFILE"]}/AppData/Local/Google/Chrome/User Data/PepperFlash/**/pepflashplayer.dll`)
    // let path_flash = require("glob").sync(`C:/Windows/syswow64/Macromed/Flash/pepflashplayer32*.dll`)
    //https://fpdownload.adobe.com/pub/flashplayer/latest/help/install_flash_player_ppapi.exe
    // if(path_flash.length == 0) {
    //   path_flash = require("glob").sync(`C:/Windows/syswow64/Macromed/Flash/pepflashplayer32*.dll`)
    //   if(path_flash.length == 0) {
    //     path_flash = require("glob").sync(`C:/Windows/system32/Macromed/Flash/pepflashplayer32*.dll`)
    //   }
    // }

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
    let path_flash = app.getPath('pepperFlashSystemPlugin') ? require("glob").sync(app.getPath('pepperFlashSystemPlugin')) : require("glob").sync("/Library/Internet Plug-Ins/PepperFlashPlayer/PepperFlashPlayer.plugin")
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

function createWindow (opt) {
  const initWindow = BrowserWindowPlus.load(opt)
  return initWindow
}


let explorerMenu,favoriteMenu
ipcMain.on("favorite-meun",(e,path)=>{
  favoriteMenu = {sender:e.sender,path}
  setTimeout(_=>favoriteMenu=(void 0),1000)
})
ipcMain.on("explorer-meun",(e,path)=>{
  explorerMenu = {sender:e.sender,path}
  setTimeout(_=>explorerMenu=(void 0),1000)
})

const webContents2 = webContents
function contextMenu(webContents) {
  webContents.on('context-menu', (e, props) => {
    console.log(props.pageURL)
    var menuItems = []
    const {mediaFlags, editFlags} = props
    const text = props.selectionText.trim()
    const hasText = text.length > 0
    const can = type => editFlags[`can${type}`] && hasText

    const downloadPrompt = (item, win) => {
      PubSub.publishSync('need-set-save-filename')
      win.webContents.downloadURL(props.srcURL,true)
    }

    var targetWindow = BrowserWindow.getFocusedWindow()
    if (!targetWindow)
      return

    const isIndex = props.pageURL.match(/^chrome:\/\/brave.+?\/index.html/)
    console.log(props.pageURL)
    const sidebar = props.pageURL.match(/^chrome\-extension:\/\/.+?_sidebar.html/)
    if (isIndex && !favoriteMenu)
      return

    if(favoriteMenu){
      const favMenu = favoriteMenu
      if(isIndex || sidebar){
        menuItems.push({label: 'Open',click: (item,win)=>{favMenu.sender.send(`favorite-meun-reply`,'open')}})
        var menu = Menu.buildFromTemplate(menuItems)
        menu.popup(targetWindow)
        return
      }
      else{
        menuItems.push({label: 'Open',click: (item,win)=>{favMenu.sender.send(`favorite-meun-reply`,'open')}})
        menuItems.push({label: 'Copy',click: (item,win)=>{clipboard.writeText(favMenu.path.join(os.EOL))}})
        menuItems.push({label: 'Rename',click: (item,win)=>{favMenu.sender.send(`favorite-meun-reply`,'rename')}})
        menuItems.push({label: 'Delete',click: (item,win)=>{favMenu.sender.send(`favorite-meun-reply`,'delete')}})
        menuItems.push({type: 'separator'})
        menuItems.push({label: 'Create New Page',click: (item,win)=>{favMenu.sender.send(`favorite-meun-reply`,'create-page')}})
        menuItems.push({label: 'Create New Directory',click: (item,win)=>{favMenu.sender.send(`favorite-meun-reply`,'create-dirctory')}})
        menuItems.push({type: 'separator'})
      }
    }

    if(explorerMenu){
      const expMenu = explorerMenu
      menuItems.push({label: 'Copy Path',click: (item,win)=>{clipboard.writeText(expMenu.path.join(os.EOL))}})
      menuItems.push({label: 'Create New File',click: (item,win)=>{expMenu.sender.send(`explorer-meun-reply`,'create-file')}})
      menuItems.push({label: 'Create New Directory',click: (item,win)=>{expMenu.sender.send(`explorer-meun-reply`,'create-dirctory')}})
      menuItems.push({label: 'Rename',click: (item,win)=>{expMenu.sender.send(`explorer-meun-reply`,'rename')}})
      menuItems.push({label: 'Delete (Move to Trash)',click: (item,win)=>{expMenu.sender.send(`explorer-meun-reply`,'delete')}})
      menuItems.push({type: 'separator'})
    }

    if (webContents.canGoBack()) menuItems.push({label: 'Back', click: (item, win)=>win.webContents.send('go-navigate', webContents.getId(), 'back')})
    if (webContents.canGoForward()) menuItems.push({label: 'Forward', click: (item, win)=>win.webContents.send('go-navigate', webContents.getId(), 'forward')})
    if (!webContents.isLoading()) menuItems.push({label: 'Reload', click: (item, win)=>win.webContents.send('go-navigate', webContents.getId(), 'reload')})
    menuItems.push({type: 'separator'})

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
        label: 'Open Link in New Tab', click: (item, win) => {
          win.webContents.send('new-tab', webContents.getId(), props.linkURL)
        }
      })
      menuItems.push({
        label: 'Open Link in Opposite Tab', click: (item, win) => {
          win.webContents.send('new-tab-opposite', webContents.getId(), props.linkURL)
        }
      })
      menuItems.push({
        label: 'Open Link in New Private Tab', click: (item, win) => {
          win.webContents.send('new-tab', webContents.getId(), props.linkURL,true)
        }
      })
      menuItems.push({type: 'separator'})
    }

      if (props.linkURL && props.mediaType === 'none') {
      menuItems.push({label: 'Copy Link Address', click: () => clipboard.writeText(props.linkURL)})
      menuItems.push({label: 'Copy Link Text', click: () => clipboard.writeText(props.linkText)})
      if(!hasText){
        menuItems.push({
          label: `Search [${props.linkText.length > 20 ? `${props.linkText.substr(0, 20)}...` : props.linkText }]`,
          click: (item, win) =>  win.webContents.send('search-text', webContents.getId(), props.linkText)
        })
      }
      menuItems.push({
        label: 'Save Link', click: (item, win) => {
          PubSub.publishSync('need-set-save-filename')
          console.log("Save Link",win)
          win.webContents.downloadURL(props.linkURL,true)
        }
      })
      menuItems.push({type: 'separator'})
      // menuItems.push({
      //   label: 'Open Link in Sync Mode at Left to Right', click: (item, win) => {
      //     win.webContents.send('open-panel', props.linkURL, true)
      //   }
      // })
      // menuItems.push({
      //   label: 'Open Link in Sync Mode at Right to Left', click: (item, win) => {
      //     win.webContents.send('open-panel', props.linkURL, true, undefined, -1)
      //   }
      // })
      // menuItems.push({type: 'separator'})
    }

    // images
    if (props.mediaType == 'image') {
      menuItems.push({label: 'Save Image As...', click: downloadPrompt})
      menuItems.push({label: 'Copy Image', click: () => webContents.copyImageAt(props.x, props.y)})
      menuItems.push({label: 'Copy Image URL', click: () => clipboard.writeText(props.srcURL)})
      menuItems.push({type: 'separator'})
    }

    // videos and audios
    if (props.mediaType == 'video' || props.mediaType == 'audio') {
      menuItems.push({
        label: 'Loop',
        type: 'checkbox',
        checked: mediaFlags.isLooping,
        click: () => callOnElement('el.loop = !el.loop')
      })
      if (mediaFlags.hasAudio)
        menuItems.push({
          label: 'Muted',
          type: 'checkbox',
          checked: mediaFlags.isMuted,
          click: () => callOnElement('el.muted = !el.muted')
        })
      if (mediaFlags.canToggleControls)
        menuItems.push({
          label: 'Show Controls',
          type: 'checkbox',
          checked: mediaFlags.isControlsVisible,
          click: () => callOnElement('el.controls = !el.controls')
        })
      menuItems.push({type: 'separator'})
    }

    // videos
    if (props.mediaType == 'video') {
      menuItems.push({label: 'Save Video As...', click: downloadPrompt})
      menuItems.push({label: 'Copy Video URL', click: () => clipboard.writeText(props.srcURL)})
      menuItems.push({
        label: 'Open Video in New Tab',
        click: (item, win) => win.webContents.send('new-tab', webContents.getId(), props.srcURL)
      })
      menuItems.push({type: 'separator'})
    }

    // audios
    if (props.mediaType == 'audio') {
      menuItems.push({label: 'Save Audio As...', click: downloadPrompt})
      menuItems.push({label: 'Copy Audio URL', click: () => clipboard.writeText(props.srcURL)})
      menuItems.push({
        label: 'Open Audio in New Tab',
        click: (item, win) => win.webContents.send('new-tab', webContents.getId(), props.srcURL)
      })
      menuItems.push({type: 'separator'})
    }

    // clipboard
    if (props.isEditable) {
      menuItems.push({label: 'Cut', role: 'cut', enabled: can('Cut')})
      menuItems.push({label: 'Copy', role: 'copy', enabled: can('Copy')})
      menuItems.push({label: 'Paste', role: 'paste', enabled: editFlags.canPaste})
      menuItems.push({type: 'separator'})
    }
    else if (hasText) {
      menuItems.push({label: 'Copy', role: 'copy', enabled: can('Copy')})
      menuItems.push({
        label: `Search [${text.length > 20 ? `${text.substr(0, 20)}...` : text }]`,
        click: (item, win) => win.webContents.send('search-text', webContents.getId(), text)
      })
      menuItems.push({type: 'separator'})
    }

    menuItems.push({
      label: 'Change Sync Mode at Left to Right', click: (item, win) => {
        win.webContents.send('open-panel', {url:webContents.getURL(), sync:uuid.v4(), id:webContents.getId()})
      }
    })
    menuItems.push({
      label: 'Change Sync Mode at Right to Left', click: (item, win) => {
        win.webContents.send('open-panel', {url:webContents.getURL(), sync:uuid.v4(), id:webContents.getId(),dirc:-1})
      }
    })
    menuItems.push({type: 'separator'})
    menuItems.push({
      label: 'View Page Source', click: (item, win) => {
        win.webContents.send('new-tab', webContents.getId(), `view-source:${webContents.getURL()}`)
      }
    })
    menuItems.push({label: 'Save Page As...', click: (item, win) => {
      PubSub.publishSync('need-set-save-filename')
      win.webContents.downloadURL(webContents.getURL(),true)
    }})
    menuItems.push({label: 'Print', click: ()=>webContents.print()})
    menuItems.push({type: 'separator'})

    menuItems.push({label: 'Add this page to the Favorites', click: (item, win) => {
      win.webContents.send('add-favorite', webContents.getId())
    }})
    menuItems.push({
      label: 'Inspect Element', click: item => {
        webContents.inspectElement(props.x, props.y)
        if (webContents.isDevToolsOpened())
          webContents.devToolsWebContents.focus()
      }
    })

    if(Object.keys(extensionMenu).length){
      const isLink = props.linkURL && props.linkURL !== ''
      const isImage = props.mediaType === 'image'
      const isVideo = props.mediaType === 'video'
      const isAudio = props.mediaType === 'audio'
      const isInputField = props.isEditable || props.inputFieldType !== 'none'
      const isTextSelected = props.selectionText && props.selectionText.length > 0

      for(let [extensionId, propertiesList] of Object.entries(extensionMenu)){
        for(let {properties, menuItemId, icon} of propertiesList){
          let contextsPassed = false
          const info = {}
          if (properties.contexts !== undefined && properties.contexts.length) {
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
          }
          // TODO (Anthony): Browser Action context menu
          if(!contextsPassed || properties.contexts[0] === 'browser_action') continue

          if(props.srcURL) info['srcURL'] = props.srcURL
          info['menuItemId'] = menuItemId


          menuItems.push({type: 'separator'})
          menuItems.push({label: properties.title,
            icon: `${extensionInfos[extensionId].base_path}/${icon}`,
            click(){
              process.emit('chrome-context-menus-clicked',extensionId, webContents.getId(), info)}
          })
        }

      }
    }
    // show menu
    var menu = Menu.buildFromTemplate(menuItems)
    if(isWin){
      menu.popup(targetWindow)
    }
    else{
      webContents.hostWebContents.executeScriptInTab('dckpbojndfoinamcdamhkjhnjnmjkfjd',
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
  })
};