// const keytar = require('keytar')
// const CryptoUtil = require('../brave/js/lib/cryptoUtil')
const {BrowserWindow, ipcMain} = require('electron')
const urlParse = require('url').parse
// const {crypto} = require('./databaseFork')
const uuid = require("node-uuid")

/**
 * Obtains a squashed settings object of all matching host patterns with more exact matches taking precedence
 * @param {Object} siteSettings - The top level app state site settings indexed by hostPattern.
 * @param {string} location - The current page location to get settings for.
 * @return {Object} A merged settings object for the specified site setting or undefined
 */
// const getSiteSettingsForURL = (siteSettings, location) => {
//   if (!location || !siteSettings) {
//     return undefined
//   }
//   // Example: https://www.brianbondy.com:8080/projects
//   //   parsedUrl.host: www.brianbondy.com:8080
//   //   parsedUrl.hostname: www.brianbondy.com
//   //   parsedUrl.protocol: https:
//
//   // Stores all related settingObjs with the most specific ones first
//   // They will be reduced to a single setting object.
//   let settingObjs = []
//
//   const parsedUrl = urlParse(location)
//   if (!parsedUrl.host || !parsedUrl.hostname || !parsedUrl.protocol) {
//     return undefined
//   }
//
//   settingObjs.push(
//     `${parsedUrl.protocol}//${parsedUrl.host}`,
//     `${parsedUrl.protocol}//${parsedUrl.hostname}:*`,
//     `${parsedUrl.protocol}//*`
//   )
//   if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
//     settingObjs.push(`https?://${parsedUrl.host}`,
//       `https?://${parsedUrl.hostname}:*`)
//   }
//
//   let host = parsedUrl.host
//   while (host.length > 0) {
//     const parsedUrl = urlParse(location)
//     host = host.split('.').slice(1).join('.')
//     location = `${parsedUrl.protocol}//${host}`
//     settingObjs.push(
//       `${parsedUrl.protocol}//*.${parsedUrl.host}`,
//       `${parsedUrl.protocol}//*.${parsedUrl.hostname}:*`
//     )
//     if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
//       settingObjs.push(`https?://*.${parsedUrl.host}`,
//         `https?://*.${parsedUrl.hostname}:*`)
//     }
//   }
//   settingObjs.push('*')
//
//   const settingObj = settingObjs.reduce((mergedSettingObj, settingObj) => settingObjs.concat(mergedSettingObj),[])
//
//   if (settingObj.size === 0) {
//     return undefined
//   }
//   return settingObj
// }


// Don't show the keytar prompt more than once per 24 hours
// let throttleKeytar = false
//
// let masterKey
//
// /**
//  * Gets the master key for encrypting login credentials from the OS keyring.
//  */
// const getMasterKey = () => {
//   if (throttleKeytar) {
//     return null
//   }
//
//   const appName = 'Sushi Browser'
//
//   const accountName = 'password manager'
//   let masterKey = keytar.getPassword(appName, accountName)
//
//   let success = false
//
//   if (masterKey === null) {
//     // Either the user denied access or no master key has ever been created.
//     // We can't tell the difference so try making a new master key.
//     success = keytar.addPassword(appName, accountName, CryptoUtil.getRandomBytes(32).toString('hex'))
//
//     if (success) {
//       // A key should have been created
//       masterKey = keytar.getPassword(appName, accountName)
//     }
//   }
//
//   if (typeof masterKey === 'string') {
//     // Convert from hex to binary
//     return (new Buffer(masterKey, 'hex')).toString('binary')
//   } else {
//     throttleKeytar = true
//     setTimeout(() => {
//       throttleKeytar = false
//     }, 1000 * 60 * 60 * 24)
//     return null
//   }
// }

function init(){

  const savePassword = (tab, username, origin) => {
    if (!origin) {
      return
    }
    let message = `${username}::${origin}`
    const key = uuid.v4()

    tab.hostWebContents2.send('show-notification',{id:tab.id,key,text:'Would you like to save this password?', buttons:['Yes','No','Never']})

    ipcMain.once(`reply-notification-${key}`,(e,ret)=>{
      if(ret.pressIndex == 0){
        tab.savePassword()
      }
      else if(ret.pressIndex == 2){
        tab.neverSavePassword()
      }
    })
  }

  const updatePassword = (e, username, origin) => {
    if (!origin) {
      return
    }

    let message = `${username}::${origin}`
    const key = uuid.v4()

    tab.hostWebContents2.send('show-notification',{id:tab.id,key,text:'Would you like to update this password?', buttons:['Yes','No']})

    ipcMain.once(`reply-notification-${key}`,(e,ret)=>{
      if(ret.pressIndex == 0){
        tab.updatePassword()
        return
      }
      tab.noUpdatePassword()
    })

  }

  return {savePassword,updatePassword}

  // ipcMain.on('notification-response', (e, message, buttonIndex, persist) => {//@TODO
  //   if (passwordCallbacks[message]) {
  //     passwordCallbacks[message](buttonIndex)
  //   }
  // })

  // ipcMain.on('decrypt-password', (e, encrypted, authTag, iv, id) => {
  //   masterKey = masterKey || getMasterKey()
  //   if (!masterKey) {
  //     console.log('Could not access master password; aborting')
  //     return
  //   }
  //   let decrypted = CryptoUtil.decryptVerify(encrypted, authTag, masterKey, iv)
  //   e.sender.send(messages.DECRYPTED_PASSWORD, {
  //     id,
  //     decrypted
  //   })
  // })

  // ipcMain.on('get-passwords', (e, origin, action) => {
  //   crypto.find({origin}).then((passwords)=>{
  //     if (!passwords || passwords.length === 0) {
  //       return
  //     }
  //
  //     let results = passwords.filter((password) => {
  //       return password.origin === origin && password.action === action
  //     })
  //
  //     if (results.length === 0) {
  //       return
  //     }
  //
  //     masterKey = masterKey || getMasterKey()
  //     if (!masterKey) {
  //       console.log('Could not access master password; aborting')
  //       return
  //     }
  //
  //     let isUnique = results.length === 1
  //     results.forEach((result) => {
  //       const password = CryptoUtil.decryptVerify(result.encryptedPassword,
  //         result.authTag,
  //         masterKey,
  //         result.iv)
  //       e.sender.send('got-password', result.username, password, origin, action, isUnique)
  //     })
  //   })
  // })
  //
  // ipcMain.on('show-username-list', (e, origin, action, boundingRect, value) => {
  //   crypto.find({origin}).then((passwords)=>{
  //     if (!passwords || passwords.length === 0) {
  //       return
  //     }
  //
  //     const usernames = {}
  //     const results = passwords.filter((password) => {
  //       return password.username &&
  //         password.username.startsWith(value) &&
  //         password.origin === origin &&
  //         password.action === action
  //     })
  //
  //     if (results.length === 0) {
  //       e.sender.hostWebContents2.send('hide-context-menu')
  //       return
  //     }
  //
  //     masterKey = masterKey || getMasterKey()
  //     if (!masterKey) {
  //       console.log('Could not access master password; aborting')
  //       return
  //     }
  //
  //     results.forEach((result) => {
  //       usernames[result.username] = CryptoUtil.decryptVerify(result.encryptedPassword,
  //           result.authTag,
  //           masterKey,
  //           result.iv) || ''
  //     })
  //     if (Object.keys(usernames).length > 0) {
  //       e.sender.hostWebContents2.send('show-username-list',e.sender.id, usernames, origin, action, boundingRect)
  //       ipcMain.once(`replay-username-list-${e.sender.id}`,(evt,username)=>{
  //         e.sender.send('got-password', username, usernames[username], origin, action, true)
  //       })
  //     } else {
  //       e.sender.hostWebContents2.send('hide-context-menu')
  //     }
  //   })
  // })
  //
  // ipcMain.on('save-password', (e, username, password, origin, action) => {
  //   if (!password || !origin || !action) {
  //     return
  //   }
  //   const originSettings = getSiteSettingsForURL(void 0, origin)
  //   if (originSettings && originSettings.savePasswords === false) {
  //     return
  //   }
  //
  //   masterKey = masterKey || getMasterKey()
  //   if (!masterKey) {
  //     console.log('Could not access master password; aborting')
  //     return
  //   }
  //
  //   crypto.find({origin}).then((passwords)=>{
  //     // If the same password already exists, don't offer to save it TODO
  //
  //     const result = passwords.find((pw) => pw.origin === origin  && pw.action === action && (username ? pw.username === username : !pw.username))
  //
  //     if (result && password === CryptoUtil.decryptVerify(result.encryptedPassword,
  //         result.authTag,
  //         masterKey,
  //         result.iv)) {
  //       return
  //     }
  //
  //     // var message = username
  //     //   ? locale.translation('notificationPasswordWithUserName').replace(/{{\s*username\s*}}/, username).replace(/{{\s*origin\s*}}/, origin)
  //     //   : locale.translation('notificationPassword').replace(/{{\s*origin\s*}}/, origin)
  //
  //     let message = `${username}::${origin}`
  //     const key = uuid.v4()
  //
  //     e.sender.hostWebContents2.send('show-notification',{id:e.sender.id,key,text:'Would you like to save this password?', buttons:['Yes','No']})
  //
  //     ipcMain.once(`reply-notification-${key}`,(e,ret)=>{
  //       if(ret.pressIndex !== 0) return
  //       const encrypted = CryptoUtil.encryptAuthenticate(password, masterKey)
  //       ;(async ()=>{
  //         if(result){
  //           await crypto.update({_id: result._id},{ $set:{origin, action ,username: username || '',
  //             encryptedPassword: encrypted.content, authTag: encrypted.tag,iv: encrypted.iv,updated_at: Date.now()}})
  //           // console.log('update_start')
  //         }
  //         else{
  //           (await crypto.insert({origin, action ,username: username || '',
  //             encryptedPassword: encrypted.content, authTag: encrypted.tag,iv: encrypted.iv,created_at: Date.now(),updated_at: Date.now()}))._id
  //         }
  //       })()
  //     })
  //   })
  //
  // })
}

export default init()
