let sock = require('axon').socket('rep')
const fs = require('fs')
const path = require('path')
const url = require('url')
const Sequelize = require('sequelize')
const { Op } = Sequelize

let app
;(function(){
  try{
    app = require('electron').app
  }catch(e){}
}())
// import extensionServer from './extensionServer'
console.log(7776666,app, process.platform === 'darwin')
const isDarwin = process.platform === 'darwin'
const resizeFile = require('./resizeFile')

// if(!isDarwin){
//   const reply = function(data){
//     process.send(data == void 0 ? null : data)
//   }
//   sock = {
//     on(name, callback){
//       process.on(name, (msg) => {
//         callback(msg, reply)
//       });
//     },
//     connect(){}
//   }
// }

function keyTrans(key){
  if(key == '$and'){
    return Op.and
  }
  else if(key == '$or'){
    return Op.or
  }
  else if(key == '$gte'){
    return Op.gte
  }
  else if(key == '$gt'){
    return Op.gt
  }
  else if(key == '$lte'){
    return Op.lte
  }
  else if(key == '$lt'){
    return Op.lt
  }
  else if(key == '$in'){
    return Op.in
  }
  else if(key == '$not'){
    return Op.not
  }
  else if(key == '$ne'){
    return Op.ne
  }
  else{
    return key
  }
}

function transQuery(query, after = {}, pKeyTrans){
  if(Array.isArray(query)){
    let key = 0
    if(pKeyTrans == null){
      after = []
    }
    else{
      after[pKeyTrans] = []
    }
    const after2 = pKeyTrans == null ? after : after[pKeyTrans]
    for(const val of query){
      transQuery(val, after2, key)
      ++key
    }
  }
  else if (typeof query === 'object' && query !== null) {
    if(pKeyTrans == null){
      after = {where: {}}
    }
    else{
      after[pKeyTrans] = {}
    }
    const after2 = pKeyTrans == null ? after.where : after[pKeyTrans]
    for(const [key, val] of Object.entries(query)) {
      transQuery(val, after2, keyTrans(key))
    }
  }
  else {
    after[pKeyTrans] = query
  }
  return after
}

function getPortable(){
  const file = path.join(__dirname,'../resource/portable.txt').replace(/app.asar([\/\\])/,'app.asar.unpacked$1')
  return fs.existsSync(file) && fs.readFileSync(file).toString().replace(/[ \r\n]/g,'')
}

let port,port2,key,pingTime

let result = _=>{
  const dbPromise = require('./database')
  const getFavicon = require('./captureFaviconEvent')
  // extensionServer(port2, key)

  dbPromise.then(db => {
    sock.connect(port,'127.0.0.1')
    sock.on('message', async function(msg,reply) {
      // if(msg.ping){
      //   pingTime = Date.now()
      //   return
      // }
      try{
        if(msg.path){
          resizeFile(msg.path,reply)
          return
        }
        else if(msg.favicon){
          if(msg.favicon != 'resource/file.svg') getFavicon(msg.favicon)
          return
        }

        // console.log(434222,msg)
        // if(msg.methods[1] != 'insert' && msg.methods[1] != 'remove' && msg.methods[1] != 'update') msg.args = strToReg(msg.args)
        // console.log(msg)
        let me = db
        const exeMethods = msg.methods[msg.methods.length - 1].split("_",-1)
        for(let method of msg.methods.slice(0,msg.methods.length - 1)){
          me = me[method]
        }

        let ret = me
        if(exeMethods.length > 1 && Array.isArray(msg.args[0]) && msg.args.length == exeMethods.length){
          let args = {}
          exeMethods.map((method,i)=>{
            if(method == 'find'){
              args = transQuery(msg.args[i][0])
            }
            else if(method == 'limit'){
              args.limit = msg.args[i][0]
            }
            else if(method == 'sort'){
              const sortKeys = []
              for(const [key,val] of Object.entries(msg.args[i][0])){
                sortKeys.push([key, val == 1 ? 'ASC' : val == -1 ? 'DESC' : val])
              }
              args.order = sortKeys
            }
          })
          // console.log(97,args)
          // console.log(977,ret)
          ret = ret[exeMethods[0]](args)
        }
        else{
          if(exeMethods == 'find' || exeMethods == 'findOne' || exeMethods == 'remove'){
            msg.args[0] = transQuery(msg.args[0])
            // console.log(98,...msg.args)
            // console.log(987,ret)
            ret = ret[exeMethods](...msg.args)
          }
          else if(exeMethods == 'update'){
            msg.args[0] = transQuery(msg.args[0])
            if(msg.args[1].$push){
              const target = msg.args[1].$push
              const key = Object.keys(target)[0]
              await ret.arrayPush(msg.args[0], key, target[key])
            }
            if(msg.args[1].$pull){
              const target = msg.args[1].$pull
              const key = Object.keys(target)[0]
              await ret.arrayPull(msg.args[0], key, target[key])
            }
            if(msg.args[1].$merge){
              const target = msg.args[1].$merge
              const key = Object.keys(target)[0]
              await ret.mergeJson(msg.args[0], key, target[key])
            }
            if(msg.args[1].$set) msg.args[1] = msg.args[1].$set
            // console.log(99,...msg.args)
            // console.log(997,ret)
            // console.log('update',ret, ...msg.args)
            ret = ret.update2(...msg.args)
          }
          else{
            ret = ret[exeMethods](...msg.args)
          }
        }

        ret.then(ret => {
          reply({ key: msg.key, result: ret })
        })
      }catch(e){
        console.error(e,msg)
        reply({ key: msg && msg.key, result: null })
      }
    })
  })
}

const portableData = getPortable()
const sushiPath = (portableData == 'true' || portableData == 'portable') ?
  path.join(__dirname,`../../../${isDarwin ? '../../' : ''}data`).replace(/app.asar([\/\\])/,'app.asar.unpacked$1') :
  app ? app.getPath('userData').replace('brave','sushiBrowser').replace('sushi-browser','sushiBrowser') : process.argv[2]

const filePath = path.join(sushiPath,'resource/fork.txt').replace(/\\/g,"/")
console.log(4444444,filePath,sushiPath)
if(fs.existsSync(filePath)){
  const content = fs.readFileSync(filePath).toString().split("\t")
  const date = parseInt(content[0])
  key = content[1]
  port = parseInt(content[2])
  port2 = parseInt(content[3])
  if(Date.now() - date > 60 * 1000){
    result = false
  }
  const movePath = filePath.replace(/fork\.txt$/,"_fork.txt")
  if(fs.existsSync(movePath)){
    fs.unlinkSync(movePath)
  }
  fs.rename(filePath, movePath, function (err) {
    console.log(err)
  })
}
else{
  result = false
}

// setInterval(_=> pingTime && Date.now() - pingTime > 6000 && app.quit(),500)

export default result


