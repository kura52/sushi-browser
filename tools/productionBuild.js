const sh = require('shelljs')
const path = require('path')
const fs = require('fs')
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
  if(file.includes('tui-editor-Editor-all.min.js')) return
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

function fixForInferno(file){
  const contents2 = fs.readFileSync(file).toString()
  let result2 = contents2.replace(/e\.nativeEvent/g,'(e.nativeEvent || e)').replace(/\(e.nativeEvent \|\| e\) =/g,'e.nativeEvent =')
    .replace(/defaultProps\.as/g,"(defaultProps && defaultProps.as)")
  fs.writeFileSync(file,result2)
}

function build(){
  const platform = isLinux ? 'linux' : isWindows ? 'win32' : isDarwin ? 'darwin' : 'mas'
  const ret = sh.exec(`node ./node_modules/electron-packager/cli.js . ${isWindows ? 'brave' : 'sushi-browser'} --platform=${platform} --arch=x64 --overwrite --icon=${appIcon} --version=${MUON_VERSION}  --asar=true --app-version=${APP_VERSION} --build-version=${MUON_VERSION} --protocol="http" --protocol-name="HTTP Handler" --protocol="https" --protocol-name="HTTPS Handler" --version-string.ProductName="Sushi Browser" --version-string.Copyright="Copyright 2017, Sushi Browser" --version-string.FileDescription="Sushi" --asar-unpack-dir="{node_modules/{node-pty,youtube-dl/bin},node_modules/node-pty/**/*,resource/{bin,extension}/**/*}" --ignore="\\.(cache|babelrc|gitattributes|githug|gitignore|gitattributes|gitignore|gitkeep|gitmodules)|node_modules/(electron-installer-squirrel-windows|electron-installer-debian|node-gyp|electron-download|electron-rebuild|electron-packager|electron-builder|electron-prebuilt|electron-rebuild|electron-winstaller-fixed|muon-winstaller|electron-installer-redhat|react-addons-perf|babel-polyfill|infinite-tree|babel-register|jsx-to-string|happypack|es5-ext|browser-sync-ui|gulp-uglify|devtron|electron$|deasync|webpack|babel-runtime|uglify-es|babel-plugin|7zip-bin|webdriverio|semantic-ui-react/(node_modules|src)|semantic-ui-react/dist/(commonjs|umd)|babili|babel-helper|react-dom|react|@types|@gulp-sourcemaps|js-beautify)|tools|sushi-browser-|release-packed|cppunitlite|happypack|es3ify"`)

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
  sh.mv(`${pwd}/${buildDir}/LICENSE`,`${pwd}/${buildDir}/_LICENSE`)
  sh.exec(`~/.go/bin/node-prune ${pwd}/${buildDir}`)
  sh.mv(`${pwd}/${buildDir}/_LICENSE`,`${pwd}/${buildDir}/LICENSE`)
  sh.mv('app.asar.unpacked/resource/extension/default/1.0_0/css/semantic-ui/themes/default/assets2',
    'app.asar.unpacked/resource/extension/default/1.0_0/css/semantic-ui/themes/default/assets')
  sh.mv('app/resource/css/semantic-ui/themes/default/assets2','app/resource/css/semantic-ui/themes/default/assets')
  sh.rm(`${pwd}/${buildDir}/LICENSES.chromium.html`)

  if(sh.exec('asar pack app app.asar').code !== 0) {
    console.log("ERROR7")
    process.exit()
  }
  sh.rm('-rf','app')
  sh.cd(pwd)

  muonModify()

  if(ret.code !== 0) {
    console.log("ERROR2")
    process.exit()
  }


  if (isWindows) {
    sh.mv(`brave-${process.platform}-${arch}`,buildDir)
    sh.mv(`${buildDir}/brave.exe`,`${buildDir}/sushi.exe`)
    const muonInstaller = require('muon-winstaller')
    const resultPromise = muonInstaller.createWindowsInstaller({
      appDirectory: buildDir,
      outputDirectory: outDir,
      title: 'Sushi Browser',
      authors: 'kura52',
      // loadingGif: 'res/brave_splash_installing.gif',
      setupIcon: 'res/app.ico',
      // iconUrl: 'https://brave.com/favicon.ico',
      // signWithParams: format('-a -fd sha256 -f "%s" -p "%s" -t http://timestamp.verisign.com/scripts/timstamp.dll', path.resolve(cert), certPassword),
      noMsi: true,
      exe: 'sushi.exe'
    })
    resultPromise.then(() => {
      sh.mv(`${outDir}/Setup.exe`,`${outDir}/sushi-browser-setup-${arch}.exe`)
    }, (e) => console.log(`No dice: ${e.message}`))
  }
  else if (isDarwin) {

  }
  else if(isLinux){
    [`./node_modules/.bin/electron-installer-debian --src ${buildDir}/ --dest ${outDir}/ --arch amd64 --config res/linuxPackaging.json`,
      `./node_modules/.bin/electron-installer-redhat --src ${buildDir}/ --dest ${outDir}/ --arch x86_64 --config res/linuxPackaging.json`,
      `cp -R ./${buildDir} ./sushi-browser-portable;echo true > ./sushi-browser-portable/resources/app.asar.unpacked/resource/portable.txt;tar -jcvf ${outDir}/sushi-browser-${APP_VERSION}.tar.bz2 ./sushi-browser-portable`].forEach(cmd=>{
      sh.exec(cmd, {async:true}, (code, stdout, stderr) => {
      })
    })
  }
}

function muonModify(){
  const dircs = []
  const pwd = sh.pwd().toString()
  if (isWindows) {
    dircs.push(buildDir)
  }
  else if(isLinux){
    dircs.push(buildDir)
    dircs.push(`sushi-browser-darwin-${arch}`)
  }
  for(let dirc of dircs){
    const paths = glob.sync(`${pwd}/${dirc}/**/electron.asar`)
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
        .replace('if (tabs[tabId]) {','if (tabs[tabId] || (tab && tab.tabValue && tab.tabValue.url && tab.tabValue.url.startsWith("chrome-devtools://"))) {')

      fs.writeFileSync(file,result)

//       const initFile = path.join(sh.pwd().toString(),sh.ls('electron/browser/init.js')[0])
//       const contents2 = fs.readFileSync(initFile).toString()
//       const result2 = contents2
//         .replace('let packagePath = null',`let packagePath
// const basePath = path.join(__dirname,'../..')
// if(fs.existsSync(path.join(basePath,'app.asar.7z'))){
//   const binPath = path.join(basePath,\`7zip/\${process.platform === 'win32' ? 'win' : process.platform === 'darwin' ? 'mac' : 'linux'}/7za\`)
//   const execSync = require('child_process').execSync
//   const dataPath = path.join(basePath,'app.asar.unpacked.7z')
//   const result =  execSync(\`\${binPath} x -y -o\${basePath} \${dataPath}\`)
//   fs.unlinkSync(dataPath)
//
//   const dataPath2 = path.join(basePath,'app.asar.7z')
//   const result2 =  execSync(\`\${binPath} x -y -o\${basePath} \${dataPath2}\`)
//   fs.unlinkSync(dataPath2)
//
//   fs.renameSync(path.join(basePath,'app'),path.join(basePath,'_app'))
// }`)
//       fs.writeFileSync(initFile,result2)
//       sh.mv('app.asar.unpacked/resource/bin/7zip','.')
//
//       if(sh.exec('7z a -t7z -mx=9 app.asar.unpacked.7z app.asar.unpacked').code !== 0) {
//         console.log("ERROR1")
//         process.exit()
//       }
//       sh.rm('-rf','app.asar.unpacked')
//
//       if(sh.exec('7z a -t7z -mx=9 app.asar.7z app.asar').code !== 0) {
//         console.log("ERROR2")
//         process.exit()
//       }
//       sh.rm('-rf','app.asar')
//
//       sh.mkdir('app')
//       sh.cp('../../package.json','app/.')

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

// Create release directory
sh.rm('-rf', RELEASE_DIRECTORY);
sh.cp('-R', 'sushi-browser', RELEASE_DIRECTORY)


// Move base directory
sh.cd(RELEASE_DIRECTORY)
const pwd = sh.pwd().toString()
console.log(pwd)

// sh.rm('-rf','sushi-browser-*')
// build()



// Remove No Develop Directory
sh.rm('-rf', 'release-packed')
sh.mkdir('release-packed')
sh.rm('-rf', 'lib')
sh.rm('-rf', 'dist')
sh.rm('-rf', '.git')
sh.rm('-rf', '.idea')
sh.rm('-rf', 'ja')
sh.rm('-rf', 'README.md')
sh.rm('resource/extension/default/1.0_0/js/vendor.dll.js')

sh.rm('-rf','resource/bin/aria2/mac')
sh.rm('-rf','resource/bin/aria2/win')
sh.rm('-rf','resource/bin/aria2/win32')

sh.rm('-rf','resource/bin/ffmpeg/mac')
sh.rm('-rf','resource/bin/ffmpeg/win')
sh.rm('-rf','resource/bin/ffmpeg/win32')

sh.rm('-rf','resource/bin/handbrake/mac')
sh.rm('-rf','resource/bin/handbrake/win')
sh.rm('-rf','resource/bin/handbrake/win32')

sh.rm('-rf','resource/bin/7zip/mac')
sh.rm('-rf','resource/bin/7zip/win')
sh.rm('-rf','resource/bin/7zip/win32')

glob.sync(`${pwd}/**/*.js.map`).forEach(file=>{
  fs.unlinkSync(file)
})

const chrome_valid = new RegExp(`^(${['994289308992179865',
  '1725149567830788547',
  '4643612240819915418',
  '4256316378292851214',
  '2019718679933488176',
  '782057141565633384',
  '5116628073786783676',
  '1465176863081977902',
  '3007771295016901659',
  '5078638979202084724',
  '4589268276914962177',
  '3551320343578183772',
  '2448312741937722512',
  '1524430321211440688',
  '42126664696688958',
  '2663302507110284145',
  '3635030235490426869',
  '4888510611625056742',
  '5860209693144823476',
  '5846929185714966548',
  '7955383984025963790',
  '3128230619496333808',
  '3391716558283801616',
  '6606070663386660533',
  '9011178328451474963',
  '9065203028668620118',
  '2473195200299095979',
  '1047431265488717055',
  '9218430445555521422',
  '8926389886865778422',
  '2893168226686371498',
  '4289540628985791613',
  '3095995014811312755',
  '6550675742724504774',
  '5453029940327926427',
  '4989966318180235467',
  '6326175484149238433',
  '9147392381910171771',
  '8260864402787962391',
  '8477384620836102176',
  '7701040980221191251',
  '6146563240635539929',
  '8026334261755873520',
  '1375321115329958930',
  '5513242761114685513',
  '5582839680698949063',
  '5317780077021120954',
  '8986267729801483565',
  '8888432776533519951',
  '5431318178759467895',
  '2948300991547862301',
  '7853747251428735',
  '8251578425305135684',
  '2845382757467349449',
  '8870318296973696995',
  '480990236307250886',
  '7754704193130578113',
  '7791543448312431591',
  '59174027418879706',
  '4250229828105606438',
  '1864111464094315414',
  '5222676887888702881',
  '839736845446313156'].join("|")})`)




glob.sync(`${pwd}/resource/extension/default/1.0_0/locales/**/chrome.properties`).forEach(file=>{
  const datas = fs.readFileSync(file).toString()
  const ret = []
  for(let line of datas.split("\n")){
    if(line.match(chrome_valid)) ret.push(line)
  }
  fs.writeFileSync(file, ret.join("\n"))
})


// Remove vender-all
const htmls = glob.sync(`${pwd}/resource/extension/default/**/*.html`).concat(glob.sync(`${pwd}/*.html`))
for(let html of htmls){
  filesContentsReplace(html,/<script src="js\/vendor\.dll\.js"><\/script>/,'<!--<script src="js/vendor.dll.js"></script>-->')
  filesContentsReplace(html,/<script src="dist\/vendor\.dll\.js"><\/script>/,'<!--<script src="dist/vendor.dll.js"></script>-->')
  filesContentsReplace(html,/<!--<!--<script src="js\/vendor\.dll\.js"><\/script>-->-->/,'<!--<script src="js/vendor.dll.js"></script>-->')
  filesContentsReplace(html,/<!--<!--<script src="dist\/vendor\.dll\.js"><\/script>-->-->/,'<!--<script src="dist/vendor.dll.js"></script>-->')
}

filesContentsReplace(`${pwd}/brave/extension/extensions.js`,/true \|\| !fs.existsSync\(appPath\)/,'!fs.existsSync(appPath)')

// development to production
filesContentsReplace([`${pwd}/index.html`,`${pwd}/resource/extension/default/1.0_0/js/process.js`],
  /env : {NODE_ENV: 'development'},/,"env : {NODE_ENV: 'production'},")

const webpackFile = `${pwd}/webpack.config.js`
filesContentsReplace(webpackFile,/\/\/ +?merge\(/,'merge(')
filesContentsReplace(webpackFile,/\/\/ +?baseConfig2.plugins.shift()/,'baseConfig2.plugins.shift()')
filesContentsReplace(webpackFile,/\/\/ +?new webpack\.DefinePlugin\({'process.env':/,"new webpack.DefinePlugin({'process.env':")
filesContentsReplace(webpackFile,/new webpack\.DllReferencePlugin/,'// new webpack.DllReferencePlugin')
filesContentsReplace(webpackFile,/devtool:/,'// devtool:')


// Remove hidden file
glob.sync(`${pwd}/**/.directory`).forEach(file=>{
  if(file.includes(RELEASE_DIRECTORY)){
    sh.rm(file)
  }
})

// Replace console.log
const jsFiles = glob.sync(`${pwd}/src/**/*.js`)
filesContentsReplace(jsFiles,/console\.log\(/,'//debug(')
filesContentsReplace(jsFiles,/window.debug = require\('debug'\)\('info'\)/,"// window.debug = require('debug')('info')")
filesContentsReplace(jsFiles,/global.debug = require\('debug'\)\('info'\)/,"// global.debug = require('debug')('info')")
filesContentsReplace(jsFiles,/extensions.init\(true\)/,"extensions.init(setting.ver !== fs.readFileSync(path.join(__dirname, '../VERSION.txt')).toString())")

const jsFiles2 = glob.sync(`${pwd}/brave/**/*.js`)
filesContentsReplace(jsFiles2,/console\.log\(/,'//debug(')

// Babel Use babili
// filesContentsReplace(`${pwd}/.babelrc`,/"react"\]/,'"react","babili"]')
filesContentsReplace(`${pwd}/.babelrc`,'] // ,["lodash", { "id": ["lodash", "semantic-ui-react"] }]]',',["lodash", { "id": ["lodash", "semantic-ui-react"] }]]')

console.log((Date.now() - start)/1000)


filesContentsReplace(`${pwd}/node_modules/youtube-dl/lib/youtube-dl.js`,"path.join(__dirname, '..', 'bin/details')","path.join(__dirname, '..', 'bin/details').replace(/app.asar([\\/\\\\])/,'app.asar.unpacked$1')")
filesContentsReplace(`${pwd}/node_modules/youtube-dl/lib/youtube-dl.js`,"(details.path) ? details.path : path.resolve(__dirname, '..', 'bin', details.exec)","((details.path) ? details.path : path.resolve(__dirname, '..', 'bin', details.exec)).replace(/app.asar([\\/\\\\])/,'app.asar.unpacked$1')")


// Build Filestory
const compiledJsFiles = ['resource/extension/default/1.0_0/js/top.js',
  'resource/extension/default/1.0_0/js/download.js',
  'resource/extension/default/1.0_0/js/downloader.js',
  'resource/extension/default/1.0_0/js/selector.js',
  'resource/extension/default/1.0_0/js/history.js',
  'resource/extension/default/1.0_0/js/tabHistorySidebar.js',
  'resource/extension/default/1.0_0/js/noteSidebar.js',
  'resource/extension/default/1.0_0/js/tabTrashHistorySidebar.js',
  'resource/extension/default/1.0_0/js/savedStateSidebar.js',
  'resource/extension/default/1.0_0/js/historySidebar.js',
  'resource/extension/default/1.0_0/js/explorerMenu.js',
  'resource/extension/default/1.0_0/js/explorerSidebar.js',
  'resource/extension/default/1.0_0/js/favoriteInit.js',
  'resource/extension/default/1.0_0/js/favoriteSidebar.js',
  'resource/extension/default/1.0_0/js/terminal.js',
  'resource/extension/default/1.0_0/js/sync.js',
  'resource/extension/default/1.0_0/js/settings.js',
  'resource/extension/default/1.0_0/js/macro.js',
  'resource/extension/default/1.0_0/js/mobilePanel.js',
  'resource/extension/default/1.0_0/js/converter.js',
  'resource/extension/default/1.0_0/js/automation.js',
  'resource/extension/default/1.0_0/js/contentscript.js',
  'lib/render/base.js']

filesContentsReplace(webpackFile,/merge\({fileName:"([^b])/,'// merge({fileName:"$1')


sh.exec('node ./node_modules/gulp/bin/gulp.js --color --gulpfile gulpfile.release.js default', {async:true}, (code, stdout, stderr) => {
})

if(sh.exec('webpack').code !== 0) {
  console.log("ERROR1")
  process.exit()
}

// filesContentsReplace(`${pwd}/.babelrc`,/"react","babili"\]/,'"react"]')

const promises = []

fixForInferno(`${pwd}/${compiledJsFiles.slice(-1)[0]}`)
const promises2 = [new Promise((resolve,reject)=>{
  sh.exec(`uglifyjs --compress --mangle -o ${compiledJsFiles.slice(-1)[0]} -- ${compiledJsFiles.slice(-1)[0]}`, {async:true}, (code, stdout, stderr) => {
    resolve()
  })
})]
// const promises2 = []

for(let f of compiledJsFiles.slice(0,-1)){
  filesContentsReplace(webpackFile,/\/\/ +?merge\(/,'merge(')
  filesContentsReplace(webpackFile,/merge\({/,'// merge({')
  const fsplit = f.split("/")
  const fname = fsplit[fsplit.length - 1]
  const webpackName = `webpack.${fname}.config.js`
  sh.cp('webpack.config.js',webpackName)
  filesContentsReplace(`${pwd}/${webpackName}`,new RegExp(`// merge\\({fileName:"(${fname})`),'merge({fileName:"$1')

  const promise = new Promise((resolve,reject)=>{
    console.log(`webpack --config ${webpackName}`)
    sh.exec(`webpack --config ${webpackName}`, {async:true}, (code, stdout, stderr) => {
      resolve()
    })
  })
  promises.push(promise)
}

//Uglify build files
Promise.all(promises).then(_=>{
  compiledJsFiles.slice(0,-1).forEach(f=>fixForInferno(`${pwd}/${f}`))

  const uglifyFiles = compiledJsFiles.slice(0,-1)
  for(let f of uglifyFiles){
    const promise = new Promise((resolve,reject)=>{
      sh.exec(`uglifyjs --compress --mangle -o ${f} -- ${f}`, {async:true}, (code, stdout, stderr) => {
        resolve()
      })
    })
    promises2.push(promise)
  }

  Promise.all(promises2).then(_ => {
    sh.rm('-rf','sushi-browser-*')
    build()

  })
})

