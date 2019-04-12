import {ipcMain} from "electron";

const {Browser} = require('../remoted-chrome/Browser')
const extInfos = require('../extensionInfos')


module.exports.init = (verChange) => {
  const enableExtension = async (extensionId, val) => {
    await Browser.bg.evaluate((extensionId,val) => {
      return new Promise(resolve => {
        chrome.management.setEnabled(extensionId, val , () => {
          resolve()
        })
      })
    },extensionId,val)

    delete extInfos[extensionId]
  }

  const uninstallExtension = async (extensionId) => {
    await Browser.bg.evaluate(extensionId => {
      return new Promise(resolve => {
        chrome.management.uninstall(extensionId, () => {
          resolve()
        })
      })
    },extensionId)

    delete extInfos[extensionId]
  }

  module.exports.enableExtension = enableExtension
  module.exports.uninstallExtension = uninstallExtension

  ipcMain.on('delete-extension',(e,extensionId)=>{
    uninstallExtension(extensionId)
  })

  require('./browserAction')

}

