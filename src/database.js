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

const db = {};
db.history = new Datastore({filename: path.join(resourcePath,'history.db'), autoload: true})
// db.searchHistory = new Datastore({filename: path.join(resourcePath,'searchHistory.db'), autoload: true})
db.favorite = new Datastore({filename: path.join(resourcePath,'favorite.db'), autoload: true})
db.download = new Datastore({filename: path.join(resourcePath,'download.db'), autoload: true})
db.state = new Datastore({filename: path.join(resourcePath,'state.db'), autoload: true})
// db.media = new Datastore({filename: path.join(resourcePath,'media.db'), autoload: true})
db.syncReplace = new Datastore({filename: path.join(resourcePath,'syncReplace.db'), autoload: true})
// db.crypto = new Datastore({filename: path.join(resourcePath,'crypto.db'), autoload: true})
db.image = new Datastore({filename: path.join(resourcePath,'image.db'), autoload: true})
db.favicon = new Datastore({filename: path.join(resourcePath,'favicon.db'), autoload: true})
db.token = new Datastore({filename: path.join(resourcePath,'token.db'), autoload: true})


;(async ()=>{
  await db.history.ensureIndex({ fieldName: 'location' })
  await db.history.ensureIndex({ fieldName: 'title' })
  await db.history.ensureIndex({ fieldName: 'updated_at' })
  await db.favorite.ensureIndex({ fieldName: 'key' })
  await db.favicon.ensureIndex({ fieldName: 'url' })
  await db.image.ensureIndex({ fieldName: 'url' })
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