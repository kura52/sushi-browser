// const keytar = require('keytar')
// const CryptoUtil = require('../brave/js/lib/cryptoUtil')
const {BrowserWindow, ipcMain} = require('electron')
const urlParse = require('url').parse
const {crypto} = require('./databaseFork')
const uuid = require("node-uuid")

const passCrypto = require('./crypto')('sushi-browser-password-key'.split("").reverse().join(""))

function init(){

  const savePassword = async (tab, username, origin, url, _password) => {
    if (!origin) {
      return
    }
    const password = passCrypto.encrypt(_password)
    if(await crypto.findOne({username, origin, password})) return

    const key = uuid.v4()

    tab.hostWebContents2.send('show-notification',{id:tab.id,key,text:'Would you like to save this password?', buttons:['Yes','No','Never']})

    ipcMain.once(`reply-notification-${key}`,(e,ret)=>{
      if(ret.pressIndex == 0){
        crypto.update({username, origin},{username, origin, url, password, never: false, updated_at: Date.now()}, { upsert: true }).then(_=>_)
      }
      else if(ret.pressIndex == 2){
        crypto.update({username, origin},{username, origin, url, never: true, updated_at: Date.now()}, { upsert: true }).then(_=>_)
      }
    })
  }

  ipcMain.on('get-password', (e, origin) => {
    crypto.find({origin}).then(datas => {
      for(let data of datas) data.password = passCrypto.decrypt(data.password)
      datas.sort((a,b) => b.time - a.time )
      e.returnValue = datas
    })
  })

  // const updatePassword = (e, username, origin) => {
  //   if (!origin) {
  //     return
  //   }
  //
  //   const key = uuid.v4()
  //
  //   tab.hostWebContents2.send('show-notification',{id:tab.id,key,text:'Would you like to update this password?', buttons:['Yes','No']})
  //
  //   ipcMain.once(`reply-notification-${key}`,(e,ret)=>{
  //     if(ret.pressIndex == 0){
  //       tab.updatePassword()
  //       return
  //     }
  //     tab.noUpdatePassword()
  //   })
  //
  // }

  return {savePassword}

}

export default init()
