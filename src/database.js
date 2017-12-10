const path = require("path")
const Datastore = require('promisify-me')(require('nedb'), 'nedb')
import * as fs from "fs"
import { app } from 'electron'
// const {ipcMain} = require('electron')

const resourcePath = path.join(app.getPath('userData'),'resource')
if (!fs.existsSync(resourcePath)) {
  fs.mkdirSync(resourcePath)
}

const favoritePath = path.join(resourcePath,'favorite.db')
if (!fs.existsSync(favoritePath)) {
  fs.writeFileSync(favoritePath,
    `{"is_file":false,"title":"root","updated_at":1497713000000,"children":[],"key":"root","_id":"zplOMCoNb1BzCt15"}`)
}

const searchEnginePath = path.join(resourcePath,'searchEngine.db')
if (!fs.existsSync(searchEnginePath)) {
  fs.writeFileSync(searchEnginePath,
    `{"name":"Amazon","base":"https://www.amazon.com","image":"https://www.amazon.com/favicon.ico","search":"https://www.amazon.com/exec/obidos/external-search/?field-keywords=%s&mode=blended","autocomplete":"https://completion.amazon.com/search/complete?method=completion&q=%s&search-alias=aps&client=amazon-search-ui&mkt=1","shortcut":"a","ind":0,"updated_at":1502539595508,"_id":"oBpB1LbmeM1a0Dma"}
{"name":"Bing","base":"https://www.bing.com","image":"https://www.bing.com/favicon.ico","search":"https://www.bing.com/search?q=%s","autocomplete":"https://api.bing.com/osjson.aspx?query=%s&language={language}&form=OSDJAS","shortcut":"b","ind":1,"updated_at":1502539595526,"_id":"HAezRddP1JyJ2Muw"}
{"name":"DuckDuckGo","base":"https://duckduckgo.com","image":"https://duckduckgo.com/favicon.ico","search":"https://duckduckgo.com/?q=%s&t=sushi","autocomplete":"https://ac.duckduckgo.com/ac/?q=%s&type=list","shortcut":"d","ind":2,"updated_at":1502539595527,"_id":"Nrx2sDC6pREg6UAu"}
{"name":"GitHub","base":"https://github.com/search","image":"https://assets-cdn.github.com/favicon.ico","search":"https://github.com/search?q=%s","shortcut":"gi","ind":3,"updated_at":1502539595527,"_id":"VICu6LKzQSXkBGt6"}
{"name":"Google","base":"https://www.google.com","image":"https://www.google.com/favicon.ico","search":"https://www.google.com/search?q=%s","autocomplete":"https://suggestqueries.google.com/complete/search?client=chrome&q=%s","shortcut":"g","ind":4,"updated_at":1502539595528,"_id":"QBZa4kejfrlxdAMn"}
{"name":"Google - Past hour","base":"https://www.google.com","image":"https://www.google.com/favicon.ico","search":"https://www.google.com/search?q=%s&tbs=qdr:h","autocomplete":"https://suggestqueries.google.com/complete/search?client=chrome&q=%s","shortcut":"gh","ind":5,"updated_at":1502539595528,"_id":"YiJDkJv141OSKMgQ"}
{"name":"Google - Past 24 hours","base":"https://www.google.com","image":"https://www.google.com/favicon.ico","search":"https://www.google.com/search?q=%s&tbs=qdr:d","autocomplete":"https://suggestqueries.google.com/complete/search?client=chrome&q=%s","shortcut":"gd","ind":6,"updated_at":1502539595528,"_id":"FuteiXvlVFUWie3h"}
{"name":"Google - Past week","base":"https://www.google.com","image":"https://www.google.com/favicon.ico","search":"https://www.google.com/search?q=%s&tbs=qdr:w","autocomplete":"https://suggestqueries.google.com/complete/search?client=chrome&q=%s","shortcut":"gw","ind":7,"updated_at":1502539595528,"_id":"HrlttjDVejEe71z7"}
{"name":"Google - Past month","base":"https://www.google.com","image":"https://www.google.com/favicon.ico","search":"https://www.google.com/search?q=%s&tbs=qdr:m","autocomplete":"https://suggestqueries.google.com/complete/search?client=chrome&q=%s","shortcut":"gm","ind":8,"updated_at":1502539595529,"_id":"Fg8ohlnVL8DbIIvG"}
{"name":"Google - Past year","base":"https://www.google.com","image":"https://www.google.com/favicon.ico","search":"https://www.google.com/search?q=%s&tbs=qdr:y","autocomplete":"https://suggestqueries.google.com/complete/search?client=chrome&q=%s","shortcut":"gy","ind":9,"updated_at":1502539595529,"_id":"s1KZS9ItxPqSAYzu"}
{"name":"Stack Overflow","base":"https://stackoverflow.com/search","image":"https://cdn.sstatic.net/sites/stackoverflow/img/favicon.ico","search":"https://stackoverflow.com/search?q=%s","shortcut":"s","ind":10,"updated_at":1502539595529,"_id":"JNvstiDEhdjbCVys"}
{"name":"Mozilla Developer Network (MDN)","base":"https://developer.mozilla.org/search","image":"https://developer.cdn.mozilla.net/static/img/favicon32.png","search":"https://developer.mozilla.org/search?q=%s","shortcut":"m","ind":11,"updated_at":1502539595529,"_id":"R82v4c25wApK5ioY"}
{"name":"Twitter","base":"https://twitter.com","image":"https://twitter.com/favicon.ico","search":"https://twitter.com/search?q=%s&source=desktop-search","shortcut":"t","ind":12,"updated_at":1502539595529,"_id":"tb62Mww3OB9iesBm"}
{"name":"Wikipedia","base":"https://en.wikipedia.org","image":"https://en.wikipedia.org/favicon.ico","search":"https://en.wikipedia.org/wiki/Special:Search?search=%s","shortcut":"w","ind":13,"updated_at":1502539595530,"_id":"mtJZZnMvXknJyr0l"}
{"name":"Yahoo","base":"https://search.yahoo.com","image":"https://search.yahoo.com/favicon.ico","search":"https://search.yahoo.com/search?p=%s&fr=opensearch","autocomplete":"https://search.yahoo.com/sugg/os?command=%s&output=fxjson&fr=opensearch","shortcut":"y","ind":14,"updated_at":1502539595530,"_id":"0ibilyG1ybckwJy1"}
{"name":"YouTube","base":"https://www.youtube.com","image":"https://www.youtube.com/favicon.ico","search":"https://www.youtube.com/results?search_type=search_videos&search_query=%s&search_sort=relevance&search_category=0&page=","autocomplete":"https://suggestqueries.google.com/complete/search?output=chrome&client=chrome&hl=it&q=%s&ds=yt","shortcut":"yt","ind":15,"updated_at":1502539595531,"_id":"VI56ZS76i4LEJX6b"}
{"name":"StartPage","base":"https://www.startpage.com","image":"https://www.startpage.com/graphics/favicon/sp-favicon-16x16.png","search":"https://www.startpage.com/do/dsearch?query=%s&cat=web&pl=opensearch","autocomplete":"https://www.startpage.com/cgi-bin/csuggest?query=%s&limit=10&format=json","shortcut":"sp","ind":16,"updated_at":1502539595531,"_id":"vZrvSpZKWYSka7mG"}
{"name":"Infogalactic","base":"https://infogalactic.com","image":"https://infogalactic.com/favicon.ico","search":"https://infogalactic.com/w/index.php?title=Special:Search&search=%s","autocomplete":"https://infogalactic.com/w/api.php?action=opensearch&search=%s&namespace=0","shortcut":"i","ind":17,"updated_at":1502539595531,"_id":"bpXZgxcxBFJtAQ5Q"}
{"name":"Wolfram Alpha","base":"https://www.wolframalpha.com","image":"https://www.wolframalpha.com/favicon.ico?v=2","search":"https://www.wolframalpha.com/input/?i=%s","shortcut":"wa","ind":18,"updated_at":1502539595531,"_id":"MFh0FjKjNRqDfa0e"}
{"name":"Semantic Scholar","base":"https://www.semanticscholar.org","image":"https://www.semanticscholar.org/img/favicon.png","search":"https://www.semanticscholar.org/search?q=%s","shortcut":"ss","ind":19,"updated_at":1502539595531,"_id":"bSosXM9oxpqtHIxy"}
{"name":"Qwant","base":"https://www.qwant.com/","image":"https://www.qwant.com/favicon.ico","search":"https://www.qwant.com/?q=%s&client=sushi","autocomplete":"https://api.qwant.com/api/suggest/?q=%s&client=sushi","shortcut":"q","ind":20,"updated_at":1502539595532,"_id":"6dv2GeOA9lQQSSNm"}
{"name":"Yandex","base":"https://yandex.com","image":"https://www.yandex.com/favicon.ico","search":"https://yandex.com/search/?text=%s&clid=2274777","shortcut":"ya","ind":21,"updated_at":1502539595532,"_id":"OKghtRp5U6Yb3Suc"}
{"name":"Ecosia","base":"https://www.ecosia.org/","image":"https://cdn.ecosia.org/assets/images/ico/favicon.ico","search":"https://www.ecosia.org/search?q=%s","autocomplete":"https://ac.ecosia.org/autocomplete?q=%s&type=list","shortcut":"e","ind":22,"updated_at":1502539595532,"_id":"i0caTQ0MN1uZIxHE"}
{"name":"searx","base":"https://searx.me","image":"https://searx.me/favicon.ico","search":"https://searx.me/?q=%s&categories=general","shortcut":"x","ind":23,"updated_at":1502539595532,"_id":"d2UypyMpCeNUAmip"}
{"_id":"5ZvjMR9AGnxR65c7","ind":25,"multiple":["Google - Past week","Google - Past month","Google - Past year","Google"],"name":"google multi search","search":"","shortcut":"g4","type":"two-row","updated_at":1502560596759}
{"_id":"9jWNJxgQ5P2X8K1K","ind":24,"multiple":["Google - Past year","Google"],"name":"google past year and normal","search":"","shortcut":"g2","type":"two","updated_at":1502605575604}
`)
}


const db = {};
db.history = new Datastore({filename: path.join(resourcePath,'history.db'), autoload: true})
db.visit = new Datastore({filename: path.join(resourcePath,'visit.db'), autoload: true})
db.tabState = new Datastore({filename: path.join(resourcePath,'tabState.db'), autoload: true})
// db.historyFull = new Datastore({filename: path.join(resourcePath,'historyFull.db'), autoload: true})
// db.searchHistory = new Datastore({filename: path.join(resourcePath,'searchHistory.db'), autoload: true})
db.searchEngine = new Datastore({filename: path.join(resourcePath,'searchEngine.db'), autoload: true})
db.favorite = new Datastore({filename: path.join(resourcePath,'favorite.db'), autoload: true})
db.download = new Datastore({filename: path.join(resourcePath,'download.db'), autoload: true})
db.downloader = new Datastore({filename: path.join(resourcePath,'downloader.db'), autoload: true})
db.state = new Datastore({filename: path.join(resourcePath,'state.db'), autoload: true})
// db.media = new Datastore({filename: path.join(resourcePath,'media.db'), autoload: true})
db.syncReplace = new Datastore({filename: path.join(resourcePath,'syncReplace.db'), autoload: true})
// db.crypto = new Datastore({filename: path.join(resourcePath,'crypto.db'), autoload: true})
db.image = new Datastore({filename: path.join(resourcePath,'image.db'), autoload: true})
db.favicon = new Datastore({filename: path.join(resourcePath,'favicon.db'), autoload: true})
db.token = new Datastore({filename: path.join(resourcePath,'token.db'), autoload: true})
db.extension = new Datastore({filename: path.join(resourcePath,'extension.db'), autoload: true})
db.savedState = new Datastore({filename: path.join(resourcePath,'savedState.db'), autoload: true})


;(async ()=>{
  await db.history.ensureIndex({ fieldName: 'location' })
  await db.history.ensureIndex({ fieldName: 'title' })
  await db.history.ensureIndex({ fieldName: 'updated_at' })
  await db.history.ensureIndex({ fieldName: 'count' })
  await db.visit.ensureIndex({ fieldName: 'url' })
  await db.tabState.ensureIndex({ fieldName: 'tabKey' })
  await db.downloader.ensureIndex({ fieldName: 'key' })
  // await db.historyFull.ensureIndex({ fieldName: 'updated_at' })
  await db.favorite.ensureIndex({ fieldName: 'key' })
  await db.savedState.ensureIndex({ fieldName: 'created_at' })
  await db.favicon.ensureIndex({ fieldName: 'url' })
  await db.image.ensureIndex({ fieldName: 'url' })
  await db.extension.ensureIndex({ fieldName: 'id' })
  await db.savedState.ensureIndex({ fieldName: 'created_at' })

  // await db.searchHistory.ensureIndex({ fieldName: 'text' }).exec()
  // await db.searchHistory.ensureIndex({ fieldName: 'created_at' }).exec()
})()

db.searchHistories = async (regText,limit) =>{
  // console.log("searchStart",Date.now())
  let cond = regText.split(/ +/,-1).filter(x=>x)
  const arr = [],arr2 = []
  for (let e of cond) {
    e = new RegExp(e,'i')
    arr.push({ $or: [{ title: e }, { location: e }]})
    arr2.push({text: e })
  }
  const ret1 =  await db.history.find(arr.length == 1 ? arr[0] : { $and: arr}).sort({ updated_at: -1 }).limit(limit).exec()
  // const ret2 = await db.searchHistory.find(arr2.length == 1 ? arr2[0] : { $and: arr2}).sort({ created_at: -1 }).limit(limit).exec()

  // console.log("searchEnd",Date.now())
  // console.log(ret1.length,ret2.length)
  return {history: ret1}
}


// db.getMediaList = async (limit) => {
//   return await db.media.find().sort({created_at: -1}).limit(limit).exec()
// }

export default db