const sh = require('shelljs')
const path = require('path')
const fs = require('fs-extra')
const glob = require("glob")

const MUON_VERSION = fs.readFileSync('../MUON_VERSION.txt').toString()
const APP_VERSION = fs.readFileSync('../VERSION.txt').toString()

const isWindows = process.platform === 'win32'
const isDarwin = process.platform === 'darwin'
const isLinux = process.platform === 'linux'
const outDir = 'release-packed'
const arch = 'x64'
const buildDir = `sushi-browser-${process.platform}-${arch}`
console.log(buildDir)

let appIcon
if (isWindows) {
  appIcon = 'res/app.ico'
} else if (isDarwin) {
  appIcon = 'res/app.icns'
} else {
  appIcon = 'res/app.png'
}


function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}


function fileContentsReplace(file, reg, after) {
  if(typeof reg == "string"){
    reg = new RegExp(escapeRegExp(reg))
  }
  const datas = fs.readFileSync(file).toString()
  if (datas.match(reg)) {
    // console.log(file)
    const result = datas.replace(new RegExp(reg.toString().slice(1,-1), 'g'), after)
    fs.writeFileSync(file, result)
  }
}

function filesContentsReplace(files,reg,after){
  if(Array.isArray(files)){
    for (let file of files) {
      fileContentsReplace(file, reg, after);
    }
  }
  else{
    fileContentsReplace(files,reg,after)
  }
}


function build(){
  const platform = isLinux ? 'darwin,linux' : isWindows ? 'win32' : isDarwin ? 'darwin' : 'mas'
  const ret = sh.exec(`node ./node_modules/electron-packager/cli.js . ${isWindows ? 'brave' : 'sushi-browser'} --platform=${platform} --arch=${arch} --overwrite --icon=${appIcon} --version=${MUON_VERSION}  --asar=true --app-version=${APP_VERSION} --build-version=${MUON_VERSION} --protocol="http" --protocol-name="HTTP Handler" --protocol="https" --protocol-name="HTTPS Handler" --version-string.ProductName="Sushi Browser" --version-string.Copyright="Copyright 2017, Sushi Browser" --version-string.FileDescription="Sushi" --asar-unpack-dir="{node_modules/{node-pty,youtube-dl/bin},node_modules/node-pty/**/*,resource/{bin,extension}/**/*}" --ignore="\\.(cache|babelrc|gitattributes|githug|gitignore|gitattributes|gitignore|gitkeep|gitmodules)|node_modules/(electron-installer-squirrel-windows|electron-installer-debian|node-gyp|electron-download|electron-rebuild|electron-packager|electron-builder|electron-prebuilt|electron-rebuild|electron-winstaller-fixed|muon-winstaller|electron-installer-redhat|react-addons-perf|babel-polyfill|infinite-tree|babel-register|jsx-to-string|happypack|es5-ext|browser-sync-ui|gulp-uglify|devtron|electron$|deasync|webpack|babel-runtime|uglify-es|babel-plugin|7zip-bin|webdriverio|semantic-ui-react/(node_modules|src)|semantic-ui-react/dist/(commonjs|umd)|babili|babel-helper|react-dom|react|@types|@gulp-sourcemaps|js-beautify)|tools|sushi-browser-|release-packed|cppunitlite|happypack|es3ify"`)

  if(ret.code !== 0) {
    console.log("ERROR2")
    process.exit()
  }

  if (isWindows) {
    sh.mv(`brave-${process.platform}-${arch}`, buildDir)
    sh.mv(`${buildDir}/brave.exe`, `${buildDir}/sushi.exe`)
  }

  const pwd = sh.pwd().toString()
  if(isDarwin){
    sh.cd(`${buildDir}/sushi-browser.app/Contents/Resources`)
  }
  else{
    sh.cd(`${buildDir}/resources`)
  }
  if(sh.exec('asar e app.asar app').code !== 0) {
    console.log("ERROR5")
    process.exit()
  }
  sh.rm('app.asar')
  sh.rm('-rf','app/resource/bin')
  sh.rm('-rf','app/resource/extension')
  sh.rm('-rf','app/node_modules/node-pty')
  sh.rm('-rf','app/node_modules/youtube-dl/bin')
  // sh.cp(`${pwd}/resource/extensions.txt`, `app.asar.unpacked/resource/.`)


  sh.mv('app/resource/css/semantic-ui/themes/default/assets','app/resource/css/semantic-ui/themes/default/assets2')
  sh.mv('app.asar.unpacked/resource/extension/default/1.0_0/css/semantic-ui/themes/default/assets',
    'app.asar.unpacked/resource/extension/default/1.0_0/css/semantic-ui/themes/default/assets2')
  if(isDarwin){
    sh.exec(`~/go/bin/node-prune ${pwd}/${buildDir}`)
  }
  else{
    sh.mv(`${pwd}/${buildDir}/LICENSE`,`${pwd}/${buildDir}/_LICENSE`)
    sh.exec(`C:/Users/kura5/go/bin/node-prune ${pwd}/${buildDir}`)
    sh.mv(`${pwd}/${buildDir}/_LICENSE`,`${pwd}/${buildDir}/LICENSE`)
    sh.rm(`${pwd}/${buildDir}/LICENSES.chromium.html`)
    sh.cp(`app/VERSION.txt`,`${pwd}/${buildDir}/VERSION.txt`)
    sh.cp('-Rf',`${pwd}/../WidevineCdm`,`${pwd}/${buildDir}/.`)
    fs.writeFileSync(`${pwd}/${buildDir}/update.cmd`,`@echo off
cd /d %~dp0
for /f "tokens=1" %%i in (VERSION.txt) do (
  set ver=%%i
)

resources\\app.asar.unpacked\\resource\\bin\\aria2\\win\\aria2c.exe --check-certificate=false --auto-file-renaming=false --allow-overwrite=true https://sushib.me/check.json

for /f "tokens=1" %%j in (check.json) do (
  set ver2=%%j
)

set newver=%ver2:~8,6%

echo old:%ver% new:%newver%

if not "%ver%"=="%newver%" (
  resources\\app.asar.unpacked\\resource\\bin\\aria2\\win\\aria2c.exe --check-certificate=false --auto-file-renaming=false --allow-overwrite=true https://sushib.me/dl/sushi-browser-%newver%-win-x64.zip
  resources\\7zip\\win\\7za.exe x -y -o"_update_%newver%" "sushi-browser-%newver%-win-x64.zip"
  
  if exist sushi-browser-%newver%-win-x64.zip (
    del /Q sushi-browser-%newver%-win-x64.zip
  
    taskkill /F /IM sushi.exe
    copy /Y resources\\app.asar.unpacked\\resource\\portable.txt resources\\portable.txt
    rd /s /q resources\\_app
    rd /s /q resources\\app.asar.unpacked
    del /Q resources\\app.asar
    del /Q resources\\electron.asar
    cd _update_%newver%\\sushi-browser-portable
    xcopy /S /E /Y . ..\\..
    cd ..\\..
    powershell Start-Process sushi.exe --update-delete
  )
)`)
  }

  sh.mv('app.asar.unpacked/resource/extension/default/1.0_0/css/semantic-ui/themes/default/assets2',
    'app.asar.unpacked/resource/extension/default/1.0_0/css/semantic-ui/themes/default/assets')
  sh.mv('app/resource/css/semantic-ui/themes/default/assets2','app/resource/css/semantic-ui/themes/default/assets')
  if(sh.exec('asar pack app app.asar').code !== 0) {
    console.log("ERROR7")
    process.exit()
  }
  sh.rm('-rf','app')
  sh.cd(pwd)

  muonModify()

  if (isWindows) {
    const muonInstaller = require('muon-winstaller')
    const resultPromise = muonInstaller.createWindowsInstaller({
      appDirectory: buildDir,
      outputDirectory: outDir,
      title: 'Sushi Browser',
      authors: 'kura52',
      loadingGif: 'res/install.gif',
      // loadingGif: 'res/brave_splash_installing.gif',
      setupIcon: 'res/app.ico',
      iconUrl: 'https://sushib.me/favicon.ico',
      // signWithParams: format('-a -fd sha256 -f "%s" -p "%s" -t http://timestamp.verisign.com/scripts/timstamp.dll', path.resolve(cert), certPassword),
      noMsi: true,
      exe: 'sushi.exe'
    })
    resultPromise.then(() => {
      // sh.mv(`${outDir}/Setup.exe`,`${outDir}/sushi-browser-setup-${arch}.exe`)
    }, (e) => console.log(`No dice: ${e.message}`))
  }
  else if (isDarwin) {
    const identifier = fs.readFileSync(path.join(pwd,'../identifier.txt'))
    if (!identifier) {
      console.error('IDENTIFIER needs to be set to the certificate organization')
      process.exit(1)
    }

    if(sh.exec(`rm -f ${outDir}/sushi-browser.dmg`).code !== 0) {
      console.log("ERROR1")
      process.exit()
    }
    sh.cd(`${buildDir}/sushi-browser.app/Contents/Frameworks`)

    console.log(`codesign --deep --force --strict --verbose --sign ${identifier} *`)
    if(sh.exec(`codesign --deep --force --strict --verbose --sign ${identifier} *`).code !== 0) {
      console.log("ERROR2")
      process.exit()
    }
    sh.cd('../../..')

    if(sh.exec(`codesign --deep --force --strict --verbose --sign ${identifier} sushi-browser.app/`).code !== 0) {
      console.log("ERROR3")
      process.exit()
    }
    sh.cd('..')

    sh.mkdir('dist')
    console.log(`./node_modules/.bin/build --prepackaged="${buildDir}/sushi-browser.app" --mac=dmg --config=res/builderConfig.json`)
    if(sh.exec(`./node_modules/.bin/build --prepackaged="${buildDir}/sushi-browser.app" --mac=dmg --config=res/builderConfig.json`).code !== 0) {
      console.log("ERROR4")
      process.exit()
    }

    sh.cd(`${buildDir}/sushi-browser.app/Contents/Resources`)
    sh.mkdir('-p', `app.asar.unpacked/resource`);
    fs.writeFileSync(`${pwd}/${buildDir}/sushi-browser.app/Contents/Resources/app.asar.unpacked/resource/portable.txt`,'true')

    if(sh.exec(`${isWindows ? '"C:/Program Files/7-Zip/7z.exe"' : '7z'} a -t7z -mx=9 app.asar.unpacked.7z app.asar.unpacked`).code !== 0) {
      console.log("ERROR1")
      process.exit()
    }
    sh.rm('-rf','app.asar.unpacked')
    sh.cd('../../../..')

    if(sh.exec(`ditto -c -k --sequesterRsrc --keepParent ${buildDir}/sushi-browser.app ${outDir}/sushi-browser-${APP_VERSION}.zip`).code !== 0) {
      console.log("ERROR6")
      process.exit()
    }


  }
  else if(isLinux){
    [`./node_modules/.bin/electron-installer-debian --src ${buildDir}/ --dest ${outDir}/ --arch amd64 --config res/linuxPackaging.json`,
      `./node_modules/.bin/electron-installer-redhat --src ${buildDir}/ --dest ${outDir}/ --arch x86_64 --config res/linuxPackaging.json`,
      `cp -R ./${buildDir} ./sushi-browser-portable;echo true > ./sushi-browser-portable/resources/app.asar.unpacked/resource/portable.txt;tar -jcvf ${outDir}/sushi-browser.tar.bz2 ./sushi-browser-portable`].forEach(cmd=>{
      sh.exec(cmd, {async:true}, (code, stdout, stderr) => {
      })
    })
  }
}

function muonModify(){
  const dircs = []
  const pwd = sh.pwd().toString()
  dircs.push(buildDir)
  for(let dirc of dircs){
    const paths = glob.sync(`${pwd}/${dirc}/**/electron.asar`)
    console.log(paths)
    if(paths.length == 1){
      const base = paths[0].split("/").slice(0,-1).join("/")
      sh.cd(`${base}`)
      if(sh.exec('asar e electron.asar electron').code !== 0) {
        console.log("ERROR3")
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
        .replace('chromeTabsRemoved(tabId)',`chromeTabsRemoved(tabId)
  delete tabIndexMap[tabId]`)
        .replace('return result','return result.sort(function(a, b){ return a.index - b.index })')

        .replace('var getTabValue = function (tabId) {',`const tabIndexMap = {},tabOpenerMap = {}
ipcMain.on('set-tab-opener',(e,tabId,openerTabId)=>{
  if(openerTabId) tabOpenerMap[tabId] = openerTabId
})
ipcMain.on('get-tab-opener',(e,tabId)=>{
  ipcMain.emit(\`get-tab-opener-reply_\${tabId}\`,null,tabOpenerMap[tabId])
})
ipcMain.on('get-tab-opener-sync',(e,tabId)=>{
  e.returnValue = tabOpenerMap[tabId]
})
ipcMain.on('get-tab-value-sync',(e,tabId)=>{
  e.returnValue = getTabValue(tabId)
})
ipcMain.on('new-tab-mode',(e,val)=>{
  newTabMode = val
})
ipcMain.on('update-tab-index-org',(e,tabId,index)=>tabIndexMap[tabId] = index)
var getTabValue = function (tabId) {`)

        .replace("sendToBackgroundPages('all', getSessionForTab(tabId), 'chrome-tabs-created', tabs[tabId].tabValue)",`const val = tabs[tabId].tabValue
  if(val.url=='chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html'){
    val.url = newTabMode
  }
  const opener = tabOpenerMap[tabId]
  if(val.windowId == -1){
    if(opener){
      val.windowId = BrowserWindow.fromWebContents(webContents.fromTabID(opener).hostWebContents).id
    }
    else{
      ipcMain.once(\`new-window-tabs-created_\${tabId}\`,(e,index)=>{
        tabIndexMap[tabId] = index
        tabOpenerMap[tabId] = null
        delete val.openerTabId
        val.index = index
        val.windowId = BrowserWindow.fromWebContents(e.sender.hostWebContents).id
        sendToBackgroundPages('all', getSessionForTab(tabId), 'chrome-tabs-created', val)
        sendToBackgroundPages('all', getSessionForTab(tabId), 'chrome-tabs-updated', tabId, {status:'loading'}, val)
      })
      return tabId
    }
  }

  if(opener){
    val.openerTabId = opener
    sendToBackgroundPages('all', getSessionForTab(tabId), 'chrome-tabs-created', val)
    sendToBackgroundPages('all', getSessionForTab(tabId), 'chrome-tabs-updated', tabId, {status:'loading'}, val)
  }
  else{
    let win = BrowserWindow.fromId(val.windowId)
    if(!win || !win.getTitle().includes('Sushi Browser')){
      const focus = BrowserWindow.getFocusedWindow()
      if(focus && focus.getTitle().includes('Sushi Browser')){
        win = focus
      }
      else{
        win = BrowserWindow.getAllWindows().find(w=>w.getTitle().includes('Sushi Browser'))
      }
    }
    const cont = win.webContents
    const key = Math.random().toString()
    ipcMain.once(\`get-focused-webContent-reply_\${key}\`,(e,openerTabId)=>{
      tabOpenerMap[tabId] = openerTabId
      val.openerTabId = openerTabId
      sendToBackgroundPages('all', getSessionForTab(tabId), 'chrome-tabs-created', val)
      sendToBackgroundPages('all', getSessionForTab(tabId), 'chrome-tabs-updated', tabId, {status:'loading'}, val)
    })
    cont.send('get-focused-webContent',key,void 0,void 0,true)
  }`)

        .replace('return tabContents && tabContents.tabValue()',`const ret = tabContents && !tabContents.isDestroyed() && tabContents.tabValue()
  let index,opener
  if(ret) {
    if((index = tabIndexMap[ret.id]) !== (void 0)) ret.index = index
    if(!ret.status) ret.status ="loading"
    if(ret.openerTabId == -1 && (opener = tabOpenerMap[ret.id])){
      ret.openerTabId = opener
    }
    else{
      delete ret.openerTabId
    }
  }
  return ret`)

        .replace('  if (!error && createProperties.partition) {',`  if(createProperties.url == 'chrome://newtab/'){
    createProperties.url = newTabMode
  }
  if(!createProperties.openerTabId || createProperties.openerTabId == -1){
    if(!win){
      const focus = BrowserWindow.getFocusedWindow()
      if(focus && focus.getTitle().includes('Sushi Browser')){
        win = focus
      }
      else{
        win = BrowserWindow.getAllWindows().find(w=>w.getTitle().includes('Sushi Browser'))  
      }
    }
    const cont = win.webContents
    const key = Math.random().toString()
    ipcMain.once(\`get-focused-webContent-reply_\${key}\`,(e,tabId)=>{
      const opener = webContents.fromTabID(tabId)
      ses = opener && opener.session
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
        .replace("tabValues[tabId].url.startsWith('chrome://brave')","tabValues[tabId].url && tabValues[tabId].url.startsWith('chrome://brave')")

        .replace(`evt.sender.send('chrome-tabs-update-response-' + responseId, response)`,"evt.sender.send('chrome-tabs-update-response-' + responseId, getTabValue(tabId))")

        .replace(`tabs[tabId].tabValue = tabValue
  let changeInfo = {}

  for (var key in tabValue) {
    if (!deepEqual(tabValue[key], oldTabInfo[key])) {
      changeInfo[key] = tabValue[key]
    }
  }

  if (Object.keys(changeInfo).length > 0) {
    if (changeInfo.active) {
      sendToBackgroundPages('all', getSessionForTab(tabId), 'chrome-tabs-activated', tabId, {tabId: tabId, windowId: tabValue.windowId})
      process.emit('chrome-tabs-activated', tabId, {tabId: tabId, windowId: tabValue.windowId})
    }
    sendToBackgroundPages('all', getSessionForTab(tabId), 'chrome-tabs-updated', tabId, changeInfo, tabValue)
    process.emit('chrome-tabs-updated', tabId, changeInfo, tabValue)
  }
}
`,`const func = ()=>{
    let changeInfo = {}

    for (var key in tabValue) {
      if (!deepEqual(tabValue[key], oldTabInfo[key])) {
        changeInfo[key] = tabValue[key]
      }
    }
    if (Object.keys(changeInfo).length > 0) {
      if (changeInfo.active) {
        sendToBackgroundPages('all', getSessionForTab(tabId), 'chrome-tabs-activated', tabId, {tabId: tabId, windowId: tabValue.windowId})
        process.emit('chrome-tabs-activated', tabId, {tabId: tabId, windowId: tabValue.windowId})
      }
      sendToBackgroundPages('all', getSessionForTab(tabId), 'chrome-tabs-updated', tabId, changeInfo, tabValue)
      process.emit('chrome-tabs-updated', tabId, changeInfo, tabValue)
    }
    tabs[tabId].tabValue = tabValue
  }

  if(tabValue.windowId == -1 || tabOpenerMap[tabId]  === void 0 || tabIndexMap[tabId] === void 0){
    if(tabValue.url.startsWith('chrome://brave/')) return
    let retry = 0
    const id = setInterval(_=>{
      tabValue = getTabValue(tabId)
      if(!tabValue || retry++ > 40){
        clearInterval(id)
        return
      }
      if(tabValue.windowId == -1 || tabOpenerMap[tabId]  === void 0 || tabIndexMap[tabId] === void 0) return

      func()
      clearInterval(id)
    },50)
  }
  else{
    func()
  }
}`)
        .replace('var sendToBackgroundPages = function (extensionId, session, event) {',`var sendToBackgroundPages = function (extensionId, session, event, arg1) {
  if(event == 'chrome-tabs-created'){
    BrowserWindow.getAllWindows().forEach(win=>{
      if(win.getTitle().includes('Sushi Browser')){
        win.webContents.send('tab-create',arg1)
      }
    })
  }`)
      fs.writeFileSync(file,result)

      const initFile = path.join(sh.pwd().toString(),sh.ls('electron/browser/init.js')[0])
      const contents2 = fs.readFileSync(initFile).toString()
      const result2 = contents2
        .replace('let packagePath = null',`let packagePath
const basePath = path.join(__dirname,'../..')
if(fs.existsSync(path.join(basePath,'app.asar.7z'))){
  const binPath = path.join(basePath,\`7zip/\${process.platform === 'win32' ? 'win' : process.platform === 'darwin' ? 'mac' : 'linux'}/7za\`)
  const execSync = require('child_process').execSync
  const dataPath = path.join(basePath,'app.asar.unpacked.7z')
  const result =  execSync(\`"\${binPath}" x -y -o"\${basePath}" "\${dataPath}"\`)
  fs.unlinkSync(dataPath)
  
  const dataPath2 = path.join(basePath,'app.asar.7z')
  const result2 =  execSync(\`"\${binPath}" x -y -o"\${basePath}" "\${dataPath2}"\`)
  fs.unlinkSync(dataPath2)
  
  if(process.argv[1] == '--update-delete'){
    const portablePath = path.join(basePath, 'app.asar.unpacked/resource', 'portable.txt')
    fs.unlinkSync(portablePath)
    
    const portablePath2 = path.join(basePath,'portable.txt')
    if(fs.existsSync(portablePath2)){
      fs.renameSync(portablePath2,portablePath)
    }
  }
  
  fs.renameSync(path.join(basePath,'app'),path.join(basePath,'_app'))
}`)
      fs.writeFileSync(initFile,result2)
      sh.mv('app.asar.unpacked/resource/bin/7zip','.')

      if(sh.exec(`${isWindows ? '"C:/Program Files/7-Zip/7z.exe"' : '7z'} a -t7z -mx=9 app.asar.unpacked.7z app.asar.unpacked`).code !== 0) {
        console.log("ERROR1")
        process.exit()
      }
      sh.rm('-rf','app.asar.unpacked')

      if(sh.exec(`${isWindows ? '"C:/Program Files/7-Zip/7z.exe"' : '7z'} a -t7z -mx=9 app.asar.7z app.asar`).code !== 0) {
        console.log("ERROR2")
        process.exit()
      }
      sh.rm('-rf','app.asar')

      sh.mkdir('app')
      sh.cp('../../package.json','app/.')

      const file3 = path.join(sh.pwd().toString(),sh.ls('electron/browser/rpc-server.js')[0])

      const contents3 = fs.readFileSync(file3).toString()
      const result3 = contents3.replace('throw new Error(`Attempting','// throw new Error(`Attempting')

      fs.writeFileSync(file3,result3)

      if(sh.exec('asar pack electron electron.asar').code !== 0) {
        console.log("ERROR")
        process.exit()
      }
      sh.rm('-rf','electron')

    }

  }
  sh.cd(pwd)
}

const RELEASE_DIRECTORY = 'sushi-browser-release'
const start = Date.now()
sh.cd('../../')

// Move base directory
sh.cd(RELEASE_DIRECTORY)
const pwd = sh.pwd().toString()
console.log(pwd)

glob.sync(`${pwd}/**/*.js.map`).forEach(file=>{
  fs.unlinkSync(file)
})

sh.rm('-rf','resource/bin/7zip/linux')
sh.rm('-rf','resource/bin/aria2/linux')
sh.rm('-rf','resource/bin/ffmpeg/linux')
sh.rm('-rf','resource/bin/handbrake/linux')
sh.rm('-rf','resource/bin/tor/linux')

const plat = isWindows ? 'win' : isDarwin ? 'mac' : 'linux'
sh.cp('-Rf',`../bin/7zip/${plat}`,'resource/bin/7zip/.')
sh.cp('-Rf',`../bin/aria2/${plat}`,'resource/bin/aria2/.')
sh.cp('-Rf',`../bin/ffmpeg/${plat}`,'resource/bin/ffmpeg/.')
sh.cp('-Rf',`../bin/handbrake/${plat}`,'resource/bin/handbrake/.')
sh.cp('-Rf',`../bin/tor/${plat}`,'resource/bin/tor/.')
sh.mkdir('-p', 'resource/bin/widevine');
sh.cp('-Rf',`../bin/widevine/${plat}`,'resource/bin/widevine/.')

filesContentsReplace(`${pwd}/node_modules/youtube-dl/lib/youtube-dl.js`,"path.join(__dirname, '..', 'bin/details')","path.join(__dirname, '..', 'bin/details').replace(/app.asar([\\/\\\\])/,'app.asar.unpacked$1')")
filesContentsReplace(`${pwd}/node_modules/youtube-dl/lib/youtube-dl.js`,"(details.path) ? details.path : path.resolve(__dirname, '..', 'bin', details.exec)","((details.path) ? details.path : path.resolve(__dirname, '..', 'bin', details.exec)).replace(/app.asar([\\/\\\\])/,'app.asar.unpacked$1')")


build()



if(isDarwin){
  glob.sync(`${pwd}/${outDir}/sushi-browser*.zip`).forEach(file=>{
    sh.mv(file,`${outDir}/sushi-browser-${APP_VERSION}-mac-x64.zip`)
  })
}

if(isWindows){
  sh.mv(`${outDir}/sushi-browser-setup-x64.exe`,`${outDir}/sushi-browser-${APP_VERSION}-setup-x64.exe`)
  sh.cp('-Rf',`./${buildDir}`,`./sushi-browser-portable`)
  sh.mkdir('-p', `sushi-browser-portable/resources/app.asar.unpacked/resource`);
  fs.writeFileSync(`${pwd}/sushi-browser-portable/resources/app.asar.unpacked/resource/portable.txt`,'true')

  sh.cd(`sushi-browser-portable/resources`)
  if(sh.exec(`${isWindows ? '"C:/Program Files/7-Zip/7z.exe"' : '7z'} a -t7z -mx=9 app.asar.unpacked.7z app.asar.unpacked`).code !== 0) {
    console.log("ERROR1")
    process.exit()
  }
  sh.rm('-rf','app.asar.unpacked')
  sh.cd('../..')
  sh.exec(`"C:/Program Files/7-Zip/7z.exe" a sushi-browser-${APP_VERSION}-win-x64.zip sushi-browser-portable`)
}