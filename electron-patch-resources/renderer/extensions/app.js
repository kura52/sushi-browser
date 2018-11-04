const {simpleIpcFunc} = require('./util')

exports.setup = (manifest)=>{
  return {
    getDetails(){ return manifest },
    getIsInstalled(){ return false },
    installState(){},
    isInstalled: false
  }
}
