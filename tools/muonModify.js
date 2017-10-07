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
  .replace('tabContents.close',"tabContents.hostWebContents.send('menu-or-key-events','closeTab',tabId)")
  .replace("evt.sender.send('chrome-tabs-create-response-' + responseId, tab.tabValue(), error)","evt.sender.send('chrome-tabs-create-response-' + responseId, tab && tab.tabValue(), error)")

fs.writeFileSync(file,result)



if(sh.exec('asar pack electron electron.asar').code !== 0) {
  console.log("ERROR")
  process.exit()
}

// sh.rm('-rf','electron')