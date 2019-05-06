const {simpleIpcFunc} = require('./util')

exports.setup = ()=>{
  return {
    get(callback){
      simpleIpcFunc('chrome-topSites-get',callback)
    }
  }
}
