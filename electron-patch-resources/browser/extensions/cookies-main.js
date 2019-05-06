const {ipcFuncMainCb, getIpcNameFunc} = require('./util-main')
const {session} = require('electron')

module.exports = function(sendToBackgroundPages) {

  session.defaultSession.on('changed', (event, cookie, cause, removed)=>{
    sendToBackgroundPages('CHROME_COOKIES_ONCHANGED',{removed, cookie, cause})
  })

  ipcFuncMainCb('cookies', 'get', (e, details, cb) => {
    session.defaultSession.cookies.get(details, (error, cookie) => {
      let first = cookie

      if (Array.isArray(cookie) && cookie.length) {
        first = cookie[0]
      }
      cb(first)
    })
  })

  ipcFuncMainCb('cookies', 'getAll', (e, details, cb) => {
    session.defaultSession.cookies.get(details, (error, cookie) => {
      if (!Array.isArray(cookie)) {
        cookie = [cookie]
      }
      cb(cookie)
    })
  })

  ipcFuncMainCb('cookies', 'set', (e, details, cb) => {
    session.defaultSession.cookies.set(details, (error) => {
      session.defaultSession.cookies.get(details, (error, cookie) => {
        let first = cookie

        if (Array.isArray(cookie) && cookie.length) {
          first = cookie[0]
        }
        cb(first)
      })
    })
  })

  ipcFuncMainCb('cookies', 'remove', (e, details, cb) => {
    session.defaultSession.cookies.remove(details.url, details.name, ()=>cb(details))
  })
}