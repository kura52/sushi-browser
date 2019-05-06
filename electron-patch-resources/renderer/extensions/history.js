const {simpleIpcFunc} = require('./util')

exports.setup = () => {
  return {
    search(query,callback){
      simpleIpcFunc('search',callback,query)
    },
    addUrl(details,callback){
      simpleIpcFunc('addUrl',callback,details)
    },
    getVisits(details,callback){
      simpleIpcFunc('getVisits',callback,details)
    },
    deleteUrl(details,callback){
      simpleIpcFunc('deleteUrl',callback,details)
    },
    deleteRange(details,callback){
      simpleIpcFunc('deleteRange',callback,details)
    },
    deleteAll(callback){
      simpleIpcFunc('deleteAll',callback)
    }
  }
}
