const sock = require('axon').socket('rep')
const fs = require('fs')
const path = require('path')
import { app } from 'electron'
const resizeFile = require('./resizeFile')
const getFavicon = require('./captureFaviconEvent')

let port
let result = _=>{
  const db = require('./database')
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
    if(msg.path){
      resizeFile(msg.path,reply)
      return
    }
    else if(msg.favicon){
      getFavicon(msg.favicon)
      return
    }
    msg.args = strToReg(msg.args)
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
      ret = ret[exeMethods[0]](...msg.args)
    }

    ;(ret.exec ? ret.exec() : ret).then(ret => {
      reply({ key: msg.key, result: ret })
    })
  });
}

const filePath = path.join(app.getPath('userData').replace('brave','sushiBrowser').replace('sushi-browser','sushiBrowser'),'resource/fork.txt').replace(/\\/g,"/")
if(fs.existsSync(filePath)){
  const content = fs.readFileSync(filePath).toString().split("\t")
  const date = parseInt(content[0])
  port = parseInt(content[1])
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

export default result


