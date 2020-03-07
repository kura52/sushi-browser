const uuid = require('node-uuid')
const ipc = require('electron').ipcRenderer


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
      const methodHandler = {
        apply: function(target, thisArg, argumentsList) {
          const key = uuid.v4()
          const methods = table ? [table,prop] : [prop]
          return new Promise((resolve,reject)=>{
            ipc.once(`db-rend_${key}`,(e,result)=>{
              resolve(result)
            })
            ipc.send('db-rend',{key,methods,table,prop,argumentsList,args: regToStr(argumentsList)})
          })
        }
      }
      return new Proxy(function(){}, methodHandler)
    }
  }
}

const dummy = {insert:'',update:'',findAll:'',find:'',count:'',findOne:'',remove:''}

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
  get media(){return new Proxy(dummy, handler('media'))},
  get image(){return new Proxy(dummy, handler('image'))},
  get favicon(){return new Proxy(dummy, handler('favicon'))},
  get token(){return new Proxy(dummy, handler('token'))},
  get extension(){return new Proxy(dummy, handler('extension'))},
  get savedState(){return new Proxy(dummy, handler('savedState'))}
},handler())

export default db