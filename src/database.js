const path = require("path")
import * as fs from "fs"
const { once } = require('events')
const { createInterface } = require('readline')

const Sequelize = require('sequelize')
const {Op} = Sequelize

const resourcePath = path.join(process.argv[2],'resource')
console.log(77777,resourcePath)
if (!fs.existsSync(resourcePath)) {
  fs.mkdirSync(resourcePath)
}

const db = {}

const dbPromise = (async ()=>{
  const dbPath = path.join(resourcePath,'db.sqlite')
  console.log(dbPath)

  const existsDbFile = fs.existsSync(dbPath)

  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
    // benchmark: true,
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000
    }
  })


  // sequelize.query('PRAGMA LOCKING_MODE = EXCLUSIVE')
  sequelize.query('PRAGMA JOURNAL_MODE = WAL')

  const dir = './entity'
  db.migrationMeta = require(`${dir}/MigrationMeta`)(sequelize)
  db.automation = require(`${dir}/Automation`)(sequelize)
  db.automationOrder = require(`${dir}/AutomationOrder`)(sequelize)
  db.download = require(`${dir}/Download`)(sequelize)
  db.downloader = require(`${dir}/Downloader`)(sequelize)
  db.favicon = require(`${dir}/Favicon`)(sequelize)
  db.history = require(`${dir}/History`)(sequelize)
  db.image = require(`${dir}/Image`)(sequelize)
  db.inputHistory = require(`${dir}/InputHistory`)(sequelize)
  db.note = require(`${dir}/Note`)(sequelize)
  db.savedState = require(`${dir}/SavedState`)(sequelize)
  db.searchEngine = require(`${dir}/SearchEngine`)(sequelize)
  db.state = require(`${dir}/State`)(sequelize)
  db.syncReplace = require(`${dir}/SyncReplace`)(sequelize)
  db.tabState = require(`${dir}/TabState`)(sequelize)
  db.videoController = require(`${dir}/VideoController`)(sequelize)
  db.visit = require(`${dir}/Visit`)(sequelize)
  db.windowState = require(`${dir}/WindowState`)(sequelize)

  if(!existsDbFile){
    await db.migrationMeta.sync({ force: false, alter: true })
    await db.automation.sync({ force: false, alter: true })
    await db.automationOrder.sync({ force: false, alter: true })
    await db.download.sync({ force: false, alter: true })
    await db.downloader.sync({ force: false, alter: true })
    await db.favicon.sync({ force: false, alter: true })
    await db.history.sync({ force: false, alter: true })
    await db.image.sync({ force: false, alter: true })
    await db.inputHistory.sync({ force: false, alter: true })
    await db.note.sync({ force: false, alter: true })
    await db.savedState.sync({ force: false, alter: true })
    await db.searchEngine.sync({ force: false, alter: true })
    await db.state.sync({ force: false, alter: true })
    await db.syncReplace.sync({ force: false, alter: true })
    await db.tabState.sync({ force: false, alter: true })
    await db.videoController.sync({ force: false, alter: true })
    await db.visit.sync({ force: false, alter: true })
    await db.windowState.sync({ force: false, alter: true })
  }

  if(!(await db.migrationMeta.findOne())){
    for(const table of ['history2.db',
      'visit.db',
      'tabState.db',
      'searchEngine.db',
      'note.db',
      'download.db',
      'downloader.db',
      'state.db',
      'syncReplace.db',
      'image.db',
      'favicon.db',
      'savedState.db',
      'windowState.db',
      'automation.db',
      'automationOrder.db',
      'inputHistory.db',
      'videoController.db']){
      const file = path.join(resourcePath, table)
      const tableName = table.replace(/\.db/,'').replace('2','')
      const sqliteTable = db[tableName]
      console.log(sqliteTable)
      if(fs.existsSync(file)){
        console.log(654389,file)

        const rl = createInterface({
          input: fs.createReadStream(file),
          crlfDelay: Infinity
        })

        let first = true
        let arr = []
        let i = 0
        rl.on('line', async line => {
          if(!line.startsWith('{"$$')){
            arr.push(line)
            if(arr.length > 3000){
              const arr2 = arr
              arr = []
              const dataList = JSON.parse(`[${arr2.join(',')}]`)
              if(tableName != 'savedState'){
                for(const x of dataList) delete x._id
              }

              if(first){
                first = false
                await sqliteTable.truncate()
              }
              console.log('insert10', Date.now())
              await sqliteTable.bulkCreate(dataList)
              console.log('insert1', Date.now())
            }
          }
        })

        await once(rl, 'close')

        if(arr.length){
          const dataList = JSON.parse(`[${arr.join(',')}]`)
          if(tableName != 'savedState'){
            for(const x of dataList) delete x._id
          }

          if(first){
            await sqliteTable.truncate()
            first = false
          }
          await sqliteTable.bulkCreate(dataList)
        }
      }
    }
    const ver = fs.readFileSync(path.join(__dirname,'../VERSION.txt')).toString()
    await db.migrationMeta.upsert({ver, info: {text: 'first migration'}, update_at: Date.now()})
  }

  if(!(await db.note.findOne({}))){
    await db.note.insert([
      {"is_file":false,"title":"root","updated_at":1497713000000,"children":["f1bf9993-3bc4-4874-ac7d-7656054c1850"],"key":"root"},
      {"key":"f1bf9993-3bc4-4874-ac7d-7656054c1850","title":"example","is_file":true,"created_at":1514732400000,"updated_at":1514732400000}
    ])
  }

  if(!(await db.searchEngine.findOne({}))){
    await db.searchEngine.insert([
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
  }

  return db
})()

db.searchHistories = async (regText,limit,searchHistoryOrderCount) =>{
  // console.log("searchStart",Date.now())
  let cond = regText.split(/ +/,-1).filter(x=>x)
  console.log('regText', cond)

  const arr = []
  for (let e of cond) {
    arr.push({ title: {[Op.like]: `%${e}%`}})
    arr.push({ location: {[Op.like]: `%${e}%`}})
  }

  const sort = searchHistoryOrderCount ? [ ['count', "DESC"], ['updated_at', "DESC"] ] : [ ['updated_at', "DESC"] ]
  const findOpt = {
    where: {[Op.or]: arr},
    limit,
    order: sort
  }

  const ret1 =  await db.history.find(findOpt)

  return {history: ret1}
}

db.close = () => {
  console.log('sequelize.close()')
  sequelize.close()
}

// db.getMediaList = async (limit) => {
//   return await db.media.find().sort({created_at: -1}).limit(limit).exec()
// }

export default dbPromise
