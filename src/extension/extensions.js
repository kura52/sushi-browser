const {Browser} = require('../remoted-chrome/BrowserView')
const extInfos = require('../extensionInfos')


module.exports.init = (verChange) => {
  const {session} = require('electron')


  const disableExtension = async (extensionId) => {

    await Browser.bg.evaluate(() => {
      return new Promise(resolve => {
        chrome.management.setEnabled(extensionId, false , () => {
          resolve()
        })
      })
    })

    delete extInfos[extensionId]

  }

  module.exports.disableExtension = disableExtension

  require('./browserAction')

}
