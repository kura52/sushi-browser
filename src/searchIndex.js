// const fs = require('fs')
// const path = require('path')
// const JSONStream = require('JSONStream')
// const SearchIndex = require('search-index')
//
// export default class IndexedDB{
//   constructor(dbPath){
//     const self = this
//     this.dbPath = dbPath
//
//     return new Promise((resolve,reject)=>{
//       SearchIndex({
//         indexPath: 'si',
//         // nGramLength: 3,
//         // separator: /[\/\|' \.,\-|(\n)]+/,
//       }, self.init(dbPath,resolve,reject))
//     })
//
//   }
//
//   init(dbName,callback){
//     const self = this
//     console.log("init")
//     return (err, index)=>{
//       if(err){
//         console.log(err)
//         reject(err)
//         return
//       }
//       let i = 0
//       fs.createReadStream(dbName)
//         .pipe(JSONStream.parse())
//         .pipe(index.defaultPipeline())
//         .pipe(index.add())
//         .on('data', function(d) {
//           // if(i++ % 1000 == 0)console.log(d)
//         })
//         .on('end', function() {
//           console.log('end')
//           self.historyIndex = index
//           callback(self)
//         })
//     }
//   }
//
//   search(q) {
//     return new Promise((resolve,reject)=>{
//       this.historyIndex.search(q).on('data', ret=> resolve(ret))
//     })
//   }
//
//   insert(data) {
//     return new Promise((resolve,reject)=>{
//       this.historyIndex.concurrentAdd({}, data, function(err) {
//         resolve()
//       })
//     })
//   }
//
//   save(savePath){
//     return new Promise((resolve,reject)=>{
//       this.historyIndex.dbReadStream()
//         .pipe(JSONStream.stringify())
//         .pipe(fs.createWriteStream(savePath))
//         .on('close', function() {
//           resolve()
//         })
//     })
//   }
// }
//
// (async function(){
//   console.log(Date.now())
//   const db = await new IndexedDB(path.join(__dirname,'../resource/historyIndex.db'))
//   console.log(Date.now())
//   await db.save(path.join(__dirname,'../resource/historyIndex2.db'))
//   console.log(Date.now())
// })()