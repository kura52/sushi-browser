import {ipcMain} from "electron";
import mainState from "../mainState";

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

    // if(!val) delete extInfos[extensionId]
  }

  const uninstallExtension = async (extensionId) => {

    await Browser.bg.evaluate(extensionId => {
      return new Promise(resolve => {
        chrome.management.uninstall(extensionId, () => {
          resolve()
        })
      })
    },extensionId)

    // delete extInfos[extensionId]
  }

  module.exports.enableExtension = enableExtension
  module.exports.uninstallExtension = uninstallExtension

  ipcMain.on('delete-extension',(e,extensionId)=>{
    uninstallExtension(extensionId)
  })

  ipcMain.on('enable-extension',(e,extensionId,val)=>{
    enableExtension(extensionId, val)
  })


  require('./browserAction')

}

