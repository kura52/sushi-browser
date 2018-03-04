const path = require('path')
const childProcess = require('child_process');
const uuid = require('node-uuid')
const {ipcMain} = require('electron')
const sock = require('axon').socket('req')
const fs = require('fs')
const emptyPort = require('./emptyPort')
import { webContents,app } from 'electron'
const isDarwin = process.platform === 'darwin'

emptyPort((err,port)=>{
  sock.bind(port,'127.0.0.1')
  fs.writeFileSync(path.join(app.getPath('userData'),'resource/fork.txt').replace(/\\/g,"/"),`${Date.now()}\t${port}`);
  if(isDarwin){
    global.__CHILD__ = childProcess.exec(path.join(__dirname,'../../../MacOS/sushi-browser'))
  }
  else{
    global.__CHILD__ = childProcess.fork(path.join(__dirname,'main.js'))
  }
})

function regToStr(obj){
  if(Array.isArray(obj)){
    obj = obj.map(ele=> regToStr(ele))
  }
  else if(Object.prototype.toString.call(obj)=='[object Object]'){
    for(let [k,v] of Object.entries(obj)){
      obj[k] = regToStr(v)
    }
  }
  else if(obj instanceof RegExp){
    obj = obj.toString()
  }
  return obj
}

function handler(table){
  return {
    get: function(target, prop, receiver) {
      if(!table && (prop in target)) return target[prop]
      if(prop == 'constructor' || prop == 'then') return target[prop]
      // console.log('get: ' + table + ','+ prop);
      const methodHandler = {
        apply: function(target, thisArg, argumentsList) {
          // console.log('args: ' + argumentsList.join(', '))
          const key = uuid.v4()
          const methods = table ? [table,prop] : [prop]
          return new Promise((resolve,reject)=>{
            sock.send({key,methods,args: regToStr(argumentsList)},msg=>{
              if(msg.key !== key) return
              if((table == "history" || table == "favorite" || table == "tabState") && (prop == "insert" || prop == "update")){
                for(let cont of webContents.getAllWebContents()){
                  if(!cont.isDestroyed() && !cont.isBackgroundPage() && cont.isGuest()) {
                    const url = cont.getURL()
                    if(url.endsWith(`/${table}_sidebar.html`) ||url.endsWith(`/${table}.html`) || (table == "tabState" && url.endsWith(`/tab_history_sidebar.html`))){
                    if(prop == "update"){
                      db[table].findOne(argumentsList[0]).then(ret=>{
                        console.log(111,'update-datas', ret,cont.getURL())
                        cont.send('update-datas', ret)
                      })
                    }
                    else{
                      console.log(222,'update-datas', ret,cont.getURL())
                      cont.send('update-datas', msg.result)
                    }
                  }
                  }
                }
              }
              resolve(msg.result)
            })
          })
        }
      }
      return new Proxy(function(){}, methodHandler)
    }
  }
}

const dummy = {insert:'',update:'',find_count:'',find:'',count:'',findOne:'',remove:''}

const db = new Proxy({
  get history(){return new Proxy(dummy, handler('history'))},
  get visit(){return new Proxy(dummy, handler('visit'))},
  get tabState(){return new Proxy(dummy, handler('tabState'))},
  // get historyFull(){return new Proxy(dummy, handler('historyFull'))},
  get searchEngine(){return new Proxy(dummy, handler('searchEngine'))},
  get favorite(){return new Proxy(dummy, handler('favorite'))},
  get download(){return new Proxy(dummy, handler('download'))},
  get downloader(){return new Proxy(dummy, handler('downloader'))},
  get state(){return new Proxy(dummy, handler('state'))},
  get syncReplace(){return new Proxy(dummy, handler('syncReplace'))},
  // get crypto(){return new Proxy(dummy, handler('crypto'))},
  get image(){return new Proxy(dummy, handler('image'))},
  get favicon(){return new Proxy(dummy, handler('favicon'))},
  get token(){return new Proxy(dummy, handler('token'))},
  get extension(){return new Proxy(dummy, handler('extension'))},
  get savedState(){return new Proxy(dummy, handler('savedState'))},
  get windowState(){return new Proxy(dummy, handler('windowState'))},
  get sock(){ return sock},
  _kill(){child.kill('SIGINT')}
},handler())

ipcMain.on('search-history-loc',(event,key,regText,limit)=>{
  db.searchHistories(regText,limit).then(val=>{
    event.sender.send(`search-history-loc-reply_${key}`,val)
  })
})

ipcMain.on('db-rend',(event,datas)=>{
  sock.send(datas,msg=>{
    if(msg.key !== datas.key) return
    event.sender.send(`db-rend_${datas.key}`,msg.result)
    const {table,prop,argumentsList} = datas
    if((table == "history" || table == "favorite" || table == "tabState") && (prop == "insert" || prop == "update")){
      for(let cont of webContents.getAllWebContents()){
        if(!cont.isDestroyed() && !cont.isBackgroundPage() && cont.isGuest()) {
          const url = cont.getURL()
          if(url.endsWith(`/${table}_sidebar.html`) ||url.endsWith(`/${table}.html`) || (table == "tabState" && url.endsWith(`/tab_history_sidebar.html`))){
            console.log(prop,msg)
            if(prop == "update"){
              console.log(argumentsList)
              db[table].findOne(argumentsList[0]).then(ret=>{
                console.log(ret)
                cont.send('update-datas', ret)
              })
            }
            else{
              cont.send('update-datas', msg.result)
            }
          }
        }
      }
    }
  })
})

setInterval(_=>sock.send({ping:1}),500)

export default db