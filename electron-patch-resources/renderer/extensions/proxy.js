const {simpleIpcFunc} = require('./util')

exports.setup = () => {
  let data = {}
  return {
    get(details, callback) {
      callback(data)
    },
    set(details, callback) {
      data = details
      simpleIpcFunc('chrome-proxy-settings-set', (...args) => {
        callback(...args)
      }, details)
    },
    clear(details, callback) {
      data = {}
      simpleIpcFunc('chrome-proxy-settings-set', (...args) => {
        callback(...args)
      }, {})
    }
  }
}
