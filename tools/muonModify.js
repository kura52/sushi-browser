const sh = require('shelljs')
const path = require('path')
const fs = require('fs')

// sh.cd('../node_modules/electron-prebuilt/dist/resources/')
sh.cd('../node_modules/electron/dist/resources/')

if(sh.exec('asar e electron.asar electron').code !== 0) {
  console.log("ERROR")
  process.exit()
}

const file = path.join(sh.pwd().toString(),sh.ls('electron/browser/api/extensions.js')[0])

const contents = fs.readFileSync(file).toString()
const result = contents
  // .replace(/getInfo\.populate/g,'{}')
  .replace('tabContents.close(tabContents)',"tabContents.hostWebContents && tabContents.hostWebContents.send('menu-or-key-events','closeTab',tabId)")
  .replace("evt.sender.send('chrome-tabs-create-response-' + responseId, tab.tabValue(), error)","evt.sender.send('chrome-tabs-create-response-' + responseId, tab && tab.tabValue(), error)")
  .replace('  if (updateProperties.active || updateProperties.selected || updateProperties.highlighted) {',
    `  if (updateProperties.active || updateProperties.selected || updateProperties.highlighted) {
    process.emit('chrome-tabs-updated-from-extension', tabId)`)
  .replace('  if (!error && createProperties.partition) {',`  if(!createProperties.openerTabId){
    const cont = win.webContents
    const key = Math.random().toString()
    ipcMain.once(\`get-focused-webContent-reply_${key}\`,(e,tabId)=>{
      const opener = webContents.fromTabID(tabId)
      ses = opener.session
      if (!error && createProperties.partition) {
        // createProperties.partition always takes precendence
        ses = session.fromPartition(createProperties.partition, {
          parent_partition: createProperties.parent_partition
        })
        // don't pass the partition info through
        delete createProperties.partition
        delete createProperties.parent_partition
      }

      if (error) {
        console.error(error)
        return cb(null, error)
      }

      createProperties.userGesture = true

      try {
        // handle url, active, index and pinned in browser-laptop
        webContents.createTab(
          win.webContents,
          ses,
          createProperties,
          (tab) => {
            if (tab) {
              cb(tab)
            } else {
              cb(null, 'An unexpected error occurred')
            }
          }
        )
      } catch (e) {
        console.error(e)
        cb(null, 'An unexpected error occurred: ' + e.message)
      }
    })
    cont.send('get-focused-webContent',key,void 0)
    return
  }

  if (!error && createProperties.partition) {`)
fs.writeFileSync(file,result)



if(sh.exec('asar pack electron electron.asar').code !== 0) {
  console.log("ERROR")
  process.exit()
}

// sh.rm('-rf','electron')