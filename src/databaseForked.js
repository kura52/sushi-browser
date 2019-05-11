let sock = require('axon').socket('rep')
const fs = require('fs')
const path = require('path')
const url = require('url')

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

function getPortable(){
  const file = path.join(__dirname,'../resource/portable.txt').replace(/app.asar([\/\\])/,'app.asar.unpacked$1')
  return fs.existsSync(file) && fs.readFileSync(file).toString().replace(/[ \r\n]/g,'')
}

let port,port2,key,pingTime

let result = _=>{
  const db = require('./database')
  const getFavicon = require('./captureFaviconEvent')
  // extensionServer(port2, key)

  function strToReg(obj){
    let match
    if(Array.isArray(obj)){
      obj = obj.map(ele=> strToReg(ele))
    }
    else if(Object.prototype.toString.call(obj)=="[object Object]"){
      for(let [k,v] of Object.entries(obj)){
        obj[k] = strToReg(v)
      }
    }
    else if(typeof obj === "string" && (match = obj.match(/^\/(.+?)\/([gimuy])?$/))){
      obj = new RegExp(match[1],match[2])
    }
    return obj
  }

  sock.connect(port,'127.0.0.1')
  sock.on('message', function(msg,reply) {
    // if(msg.ping){
    //   pingTime = Date.now()
    //   return
    // }
    if(msg.path){
      resizeFile(msg.path,reply)
      return
    }
    else if(msg.favicon){
      if(msg.favicon != 'resource/file.svg') getFavicon(msg.favicon)
      return
    }

    if(msg.methods[1] != 'insert' && msg.methods[1] != 'delete' && msg.methods[1] != 'update') msg.args = strToReg(msg.args)
    // console.log(msg)
    let me = db
    const exeMethods = msg.methods[msg.methods.length - 1].split("_",-1)
    for(let method of msg.methods.slice(0,msg.methods.length - 1)){
      me = me[method]
    }

    let ret = me
    if(exeMethods.length > 1 && Array.isArray(msg.args[0]) && msg.args.length == exeMethods.length){
      exeMethods.map((method,i)=>{
        ret = ret[method](...msg.args[i])
      })
    }
    else{
      // console.log(43344,msg.methods.slice(0,msg.methods.length - 1)[0],exeMethods[0],msg.args)
      ret = ret[exeMethods[0]](...msg.args)
    }

    ;(ret.exec ? ret.exec() : ret).then(ret => {
      reply({ key: msg.key, result: ret })
    })
  });
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
  if(Date.now() - date > 15 * 1000){
    result = false
  }
  fs.unlink(filePath, function (err) {
    console.log(err)
  })
}
else{
  result = false
}

// setInterval(_=> pingTime && Date.now() - pingTime > 6000 && app.quit(),500)

export default result


