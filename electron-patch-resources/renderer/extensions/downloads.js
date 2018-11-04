const {simpleIpcFunc} = require('./util')

exports.setup = () => {
  return {
    download(options, callback){
      simpleIpcFunc('download',callback,options)
    },
    pause(downloadId, callback){
      simpleIpcFunc('pause',callback,downloadId)
    },
    resume(downloadId, callback){
      simpleIpcFunc('resume',callback,downloadId)
    },
    cancel(downloadId, callback){
      simpleIpcFunc('cancel',callback,downloadId)
    },
    open(downloadId){
      simpleIpcFunc('open',_=>_,downloadId)
    },
    show(downloadId){
      simpleIpcFunc('show',_=>_,downloadId)
    },
    showDefaultFolder(){
      simpleIpcFunc('showDefaultFolder',_=>_)
    },
    search(query, callback) {
      simpleIpcFunc('chrome-downloads-search', _ => {
        console.log(query, _)
        callback(_)
      }, query)
    },
    erase(query, callback){
      simpleIpcFunc('erase',callback,query)
    },
    //@TODO
    getFileIcon(downloadId, options, callback){
      callback('data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==')
    }

  }
}
