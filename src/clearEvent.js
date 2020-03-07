import {app,ipcMain} from 'electron'
import {
  image, favicon, tabState, history, visit, savedState, download, downloader, state, syncReplace,
  note, automation, automationOrder, windowState, searchEngine, token, videoController
} from './databaseFork'
import {Browser} from './remoted-chrome/Browser'

import path from 'path'
import fs from 'fs'
import mainState from "./mainState";

const m = {
  async clearBrowsingData(_,opt2,browserDatas){
    const opt = opt2 ? {since: opt2.updated_at['$lte']} : {}
    const dataToRemove = {}
    for(let browserData of browserDatas){
      dataToRemove[browserData] = true
    }

    console.log(dataToRemove, opt)
    return Browser.bg.evaluate((dataToRemove, opt) => {
      return new Promise(async resolve => {
        chrome.browsingData.remove(opt, dataToRemove, resolve)
      })
    }, dataToRemove, opt)
  },

  async clearSessionManager(_,opt2){
    const optBack = {user: true}
    const userSavedState = await savedState.find(optBack)
    const arr = JSON.stringify(userSavedState).match(/"tabKey":"(.+?)"/g) || []
    arr.map(x=>x.slice(10,-1))
    const userSavedTabState = await tabState.find({tabKey: {$in: arr}})

    await tabState.remove(opt2||{}, { multi: true })
    await tabState.remove({tabKey: {$in: userSavedTabState.map(r=>r.tabKey)}}, { multi: true })
    await tabState.insert(userSavedTabState)

    await windowState.remove(opt2||{}, { multi: true })

    const opt = opt2 ? {user: {$ne: true}, created_at: opt2.updated_at} : {user: {$ne: true}}
    await savedState.remove(opt||{}, { multi: true })
  },

  async clearHistory(_,opt2){
    let i = 0
    for(let table of [image,history,visit]){
      const opt = (opt2 && i++==2) ? {created_at: opt2.updated_at} : opt2
      await table.remove(opt||{}, { multi: true })
    }
    // ses.clearHistory()

    if(!opt2){
      const resourcePath = path.join(app.getPath('userData'),'resource')
      const capturePath = path.join(resourcePath,'capture')
      if (fs.existsSync(capturePath)) {
        fs.readdir(capturePath, (err, list)=>{
          for(let file of list){
            fs.unlink(path.join(capturePath,file),_=>_)
          }
        })
      }
    }
    await this.clearBrowsingData(_,opt2,['history'])
  },

  async clearUserSession(_,opt2){
    const opt = opt2 ? {user: true, created_at: opt2.updated_at} : {user: true}
    await savedState.remove(opt||{}, { multi: true })
  },

  async clearFavicon(_,opt2){
    await favicon.remove(opt2||{}, { multi: true })
  },

  async clearAutomation(_,opt2){
    for(let table of [automation,automationOrder]){
      await table.remove(opt2||{}, { multi: true })
    }
  },

  async clearVideoController(_,opt2){
    await videoController.remove(opt2||{}, { multi: true })
  },
  async clearNote(_,opt2){
    await note.remove(opt2||{}, { multi: true })
    if(!(await note.findOne({key:"root"}))){
      await note.insert([
        {"is_file":false,"title":"root","updated_at":1497713000000,"children":["f1bf9993-3bc4-4874-ac7d-7656054c1850"],"key":"root"},
        {"key":"f1bf9993-3bc4-4874-ac7d-7656054c1850","title":"example","is_file":true,"created_at":1514732400000,"updated_at":1514732400000}]
      )
    }
  },

  async clearDownload(_,opt2){
    let i = 0
    for(let table of [download,downloader]){
      const opt = (opt2 &&  i++==1) ? {now: opt2.updated_at} : opt2
      await table.remove(opt||{}, { multi: true })
    }
    await this.clearBrowsingData(_,opt2,['downloads'])
  },

  async clearGeneralSettings(){
    await syncReplace.remove({}, { multi: true })
    await searchEngine.remove({}, { multi: true })
    await searchEngine.insert([
      {"name":"Amazon","base":"https://www.amazon.com","image":"https://www.amazon.com/favicon.ico","search":"https://www.amazon.com/exec/obidos/external-search/?field-keywords=%s&mode=blended","autocomplete":"https://completion.amazon.com/search/complete?method=completion&q=%s&search-alias=aps&client=amazon-search-ui&mkt=1","shortcut":"a","ind":0,"updated_at":1502539595508},
      {"name":"Bing","base":"https://www.bing.com","image":"https://www.bing.com/favicon.ico","search":"https://www.bing.com/search?q=%s","autocomplete":"https://api.bing.com/osjson.aspx?query=%s&language={language}&form=OSDJAS","shortcut":"b","ind":1,"updated_at":1502539595526},
      {"name":"DuckDuckGo","base":"https://duckduckgo.com","image":"https://duckduckgo.com/favicon.ico","search":"https://duckduckgo.com/?q=%s&t=sushi","autocomplete":"https://ac.duckduckgo.com/ac/?q=%s&type=list","shortcut":"d","ind":2,"updated_at":1502539595527},
      {"name":"GitHub","base":"https://github.com/search","image":"https://assets-cdn.github.com/favicon.ico","search":"https://github.com/search?q=%s","shortcut":"gi","ind":3,"updated_at":1502539595527},
      {"name":"Google","base":"https://www.google.com","image":"https://www.google.com/favicon.ico","search":"https://www.google.com/search?q=%s","autocomplete":"https://suggestqueries.google.com/complete/search?client=chrome&q=%s","shortcut":"g","ind":4,"updated_at":1502539595528},
      {"name":"Google - Past hour","base":"https://www.google.com","image":"https://www.google.com/favicon.ico","search":"https://www.google.com/search?q=%s&tbs=qdr:h","autocomplete":"https://suggestqueries.google.com/complete/search?client=chrome&q=%s","shortcut":"gh","ind":5,"updated_at":1502539595528},
      {"name":"Google - Past 24 hours","base":"https://www.google.com","image":"https://www.google.com/favicon.ico","search":"https://www.google.com/search?q=%s&tbs=qdr:d","autocomplete":"https://suggestqueries.google.com/complete/search?client=chrome&q=%s","shortcut":"gd","ind":6,"updated_at":1502539595528},
      {"name":"Google - Past week","base":"https://www.google.com","image":"https://www.google.com/favicon.ico","search":"https://www.google.com/search?q=%s&tbs=qdr:w","autocomplete":"https://suggestqueries.google.com/complete/search?client=chrome&q=%s","shortcut":"gw","ind":7,"updated_at":1502539595528},
      {"name":"Google - Past month","base":"https://www.google.com","image":"https://www.google.com/favicon.ico","search":"https://www.google.com/search?q=%s&tbs=qdr:m","autocomplete":"https://suggestqueries.google.com/complete/search?client=chrome&q=%s","shortcut":"gm","ind":8,"updated_at":1502539595529},
      {"name":"Google - Past year","base":"https://www.google.com","image":"https://www.google.com/favicon.ico","search":"https://www.google.com/search?q=%s&tbs=qdr:y","autocomplete":"https://suggestqueries.google.com/complete/search?client=chrome&q=%s","shortcut":"gy","ind":9,"updated_at":1502539595529},
      {"name":"Stack Overflow","base":"https://stackoverflow.com/search","image":"https://cdn.sstatic.net/sites/stackoverflow/img/favicon.ico","search":"https://stackoverflow.com/search?q=%s","shortcut":"s","ind":10,"updated_at":1502539595529},
      {"name":"Mozilla Developer Network (MDN)","base":"https://developer.mozilla.org/search","image":"https://developer.cdn.mozilla.net/static/img/favicon32.png","search":"https://developer.mozilla.org/search?q=%s","shortcut":"m","ind":11,"updated_at":1502539595529},
      {"name":"Twitter","base":"https://twitter.com","image":"https://twitter.com/favicon.ico","search":"https://twitter.com/search?q=%s&source=desktop-search","shortcut":"t","ind":12,"updated_at":1502539595529},
      {"name":"Wikipedia","base":"https://en.wikipedia.org","image":"https://en.wikipedia.org/favicon.ico","search":"https://en.wikipedia.org/wiki/Special:Search?search=%s","shortcut":"w","ind":13,"updated_at":1502539595530},
      {"name":"Yahoo","base":"https://search.yahoo.com","image":"https://search.yahoo.com/favicon.ico","search":"https://search.yahoo.com/search?p=%s&fr=opensearch","autocomplete":"https://search.yahoo.com/sugg/os?command=%s&output=fxjson&fr=opensearch","shortcut":"y","ind":14,"updated_at":1502539595530},
      {"name":"YouTube","base":"https://www.youtube.com","image":"https://www.youtube.com/favicon.ico","search":"https://www.youtube.com/results?search_type=search_videos&search_query=%s&search_sort=relevance&search_category=0&page=","autocomplete":"https://suggestqueries.google.com/complete/search?output=chrome&client=chrome&hl=it&q=%s&ds=yt","shortcut":"yt","ind":15,"updated_at":1502539595531},
      {"name":"StartPage","base":"https://www.startpage.com","image":"https://www.startpage.com/graphics/favicon/sp-favicon-16x16.png","search":"https://www.startpage.com/do/dsearch?query=%s&cat=web&pl=opensearch","autocomplete":"https://www.startpage.com/cgi-bin/csuggest?query=%s&limit=10&format=json","shortcut":"sp","ind":16,"updated_at":1502539595531},
      {"name":"Infogalactic","base":"https://infogalactic.com","image":"https://infogalactic.com/favicon.ico","search":"https://infogalactic.com/w/index.php?title=Special:Search&search=%s","autocomplete":"https://infogalactic.com/w/api.php?action=opensearch&search=%s&namespace=0","shortcut":"i","ind":17,"updated_at":1502539595531},
      {"name":"Wolfram Alpha","base":"https://www.wolframalpha.com","image":"https://www.wolframalpha.com/favicon.ico?v=2","search":"https://www.wolframalpha.com/input/?i=%s","shortcut":"wa","ind":18,"updated_at":1502539595531},
      {"name":"Semantic Scholar","base":"https://www.semanticscholar.org","image":"https://www.semanticscholar.org/img/favicon.png","search":"https://www.semanticscholar.org/search?q=%s","shortcut":"ss","ind":19,"updated_at":1502539595531},
      {"name":"Qwant","base":"https://www.qwant.com/","image":"https://www.qwant.com/favicon.ico","search":"https://www.qwant.com/?q=%s&client=sushi","autocomplete":"https://api.qwant.com/api/suggest/?q=%s&client=sushi","shortcut":"q","ind":20,"updated_at":1502539595532},
      {"name":"Yandex","base":"https://yandex.com","image":"https://www.yandex.com/favicon.ico","search":"https://yandex.com/search/?text=%s&clid=2274777","shortcut":"ya","ind":21,"updated_at":1502539595532},
      {"name":"Ecosia","base":"https://www.ecosia.org/","image":"https://cdn.ecosia.org/assets/images/ico/favicon.ico","search":"https://www.ecosia.org/search?q=%s","autocomplete":"https://ac.ecosia.org/autocomplete?q=%s&type=list","shortcut":"e","ind":22,"updated_at":1502539595532},
      {"name":"searx","base":"https://searx.me","image":"https://searx.me/favicon.ico","search":"https://searx.me/?q=%s&categories=general","shortcut":"x","ind":23,"updated_at":1502539595532},
      {"ind":25,"multiple":["Google - Past week","Google - Past month","Google - Past year","Google"],"name":"google multi search","search":"","shortcut":"g4","type":"two-row","updated_at":1502560596759},
      {"ind":24,"multiple":["Google - Past year","Google"],"name":"google past year and normal","search":"","shortcut":"g2","type":"two","updated_at":1502605575604}
    ])
    await state.remove({key: 1})
    await state.insert({
        key: 1,
        info: {
          key: 1,
          clearHistoryOnClose: mainState.clearHistoryOnClose,
          clearDownloadOnClose: mainState.clearDownloadOnClose,
          clearPasswordOnClose: mainState.clearPasswordOnClose,
          clearGeneralSettingsOnClose: mainState.clearGeneralSettingsOnClose,
          clearSessionManagerOnClose: mainState.clearSessionManagerOnClose,
          clearFaviconOnClose: mainState.clearFaviconOnClose,
          clearVideoControllerOnClose: mainState.clearVideoControllerOnClose,
          clearAutomationOnClose: mainState.clearAutomationOnClose,
          clearNoteOnClose: mainState.clearNoteOnClose,
          clearUserSessionOnClose: mainState.clearUserSessionOnClose,

          clearCookiesOnClose: mainState.clearCookiesOnClose,
          clearFormDataOnClose: mainState.clearFormDataOnClose,
          clearPluginDataOnClose: mainState.clearPluginDataOnClose,
          clearAppCacheOnClose: mainState.clearAppCacheOnClose,
          clearCacheOnClose: mainState.clearCacheOnClose,
          clearFileSystemsOnClose: mainState.clearFileSystemsOnClose,
          clearLocalStorageOnClose: mainState.clearLocalStorageOnClose,
          clearIndexedDBOnClose: mainState.clearIndexedDBOnClose,
          clearWebSQLOnClose: mainState.clearWebSQLOnClose,
        },
        updated_at: Date.now()
      }
    )
  }
}

async function clearEvent(event, targets, opt, opt2){
  const set = new Set(['passwords', 'cookies', 'formData', 'pluginData', 'appcache', 'cache', 'fileSystems', 'localStorage', 'indexedDB', 'webSQL'])

  console.log(2243,targets,opt2)
  const browserDatas = []
  for(let target of targets){
    if(set.has(target)){
      browserDatas.push(target)
    }
    else{
      await m[target](opt, opt2)
    }
  }

  if(browserDatas.length){
    await m.clearBrowsingData(opt, opt2, browserDatas)
  }

}

ipcMain.on('clear-browsing-data', (event, targets, range)=>{

  let opt2
  if(range){
    if(range.clearType == 'before'){
      opt2 = { updated_at: { $lte: Date.now() - parseInt(range.clearDays) * 24 * 60 * 60 * 1000 }}
    }
    // else if(range.clearType == 'range'){
    //   opt2 = { updated_at: (
    //       range.clearStart === void 0 ? { $lte: Date.parse(`${range.clearEnd} 00:00:00`) + 24 * 60 * 60 * 1000 } :
    //         range.clearEnd === void 0 ? { $gte: Date.parse(`${range.clearStart} 00:00:00`) } :
    //           { $gte: Date.parse(`${range.clearStart} 00:00:00`), $lte: Date.parse(`${range.clearEnd} 00:00:00`) + 24 * 60 * 60 * 1000 }
    //     )}
    // }
  }
  clearEvent(event, targets, void 0, opt2)
})

export default clearEvent
