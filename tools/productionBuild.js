const sh = require('shelljs')
const path = require('path')
const fs = require('fs')
const glob = require("glob")

const ELECTRON_VERSION = fs.readFileSync('../ELECTRON_VERSION.txt').toString()
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

// %LOCALAPPDATA%/electron/Cache
function build(){
  const platform = isLinux ? 'linux' : isWindows ? 'win32' : isDarwin ? 'darwin' : 'mas'
  const ret = sh.exec(`electron-packager . sushi-browser --download.cacheRoot=E:\\electron\\src\\out\\Release --electronVersion=${ELECTRON_VERSION} --platform=${platform} --arch=${arch} --overwrite --icon=${appIcon} --protocol="http" --protocol-name="HTTP Handler" --protocol="https" --protocol-name="HTTPS Handler" --appCopyright="Copyright 2017, Sushi Browser" --asar.unpackDir="{node_modules/{node-pty,iohook,youtube-dl/bin},node_modules/node-pty/**/*,node_modules/iohook/**/*,resource/{bin,extension}/**/*}" --ignore="\\.(cache|babelrc|gitattributes|githug|gitignore|gitattributes|gitignore|gitkeep|gitmodules)|node_modules/(electron-installer-squirrel-windows|electron-installer-debian|node-gyp|electron-download|electron-rebuild|electron-packager|electron-builder|electron-prebuilt|electron-rebuild|electron-winstaller-fixed|muon-winstaller|electron-installer-redhat|react-addons-perf|babel-polyfill|infinite-tree|babel-register|jsx-to-string|happypack|es5-ext|browser-sync-ui|gulp-uglify|devtron|electron$|deasync|webpack|babel-runtime|uglify-es|babel-plugin|7zip-bin|webdriverio|semantic-ui-react/(node_modules|src)|semantic-ui-react/dist/(commonjs|umd)|babili|babel-helper|react-dom|react|@types|@gulp-sourcemaps|js-beautify)|tools|sushi-browser-|release-packed|cppunitlite|happypack|es3ify"`)

  if(ret.code !== 0) {
    console.log(`electron-packager . sushi-browser --download.cacheRoot=E:\\electron\\src\\out\\Release --electronVersion=${ELECTRON_VERSION} --platform=${platform} --arch=${arch} --overwrite --icon=${appIcon} --protocol="http" --protocol-name="HTTP Handler" --protocol="https" --protocol-name="HTTPS Handler" --appCopyright="Copyright 2017, Sushi Browser" --asar.unpackDir="{node_modules/{node-pty,iohook,youtube-dl/bin},node_modules/node-pty/**/*,node_modules/iohook/**/*,resource/{bin,extension}/**/*}" --ignore="\\.(cache|babelrc|gitattributes|githug|gitignore|gitattributes|gitignore|gitkeep|gitmodules)|node_modules/(electron-installer-squirrel-windows|electron-installer-debian|node-gyp|electron-download|electron-rebuild|electron-packager|electron-builder|electron-prebuilt|electron-rebuild|electron-winstaller-fixed|muon-winstaller|electron-installer-redhat|react-addons-perf|babel-polyfill|infinite-tree|babel-register|jsx-to-string|happypack|es5-ext|browser-sync-ui|gulp-uglify|devtron|electron$|deasync|webpack|babel-runtime|uglify-es|babel-plugin|7zip-bin|webdriverio|semantic-ui-react/(node_modules|src)|semantic-ui-react/dist/(commonjs|umd)|babili|babel-helper|react-dom|react|@types|@gulp-sourcemaps|js-beautify)|tools|sushi-browser-|release-packed|cppunitlite|happypack|es3ify"`)
    console.log("ERROR2")
    process.exit()
  }

  if (isWindows) {
    // sh.mv(`brave-${process.platform}-${arch}`, buildDir)
    // sh.mv(`${buildDir}/sushi-browser.exe`, `${buildDir}/electron.exe`) //@TODO ELECTRON
  }

  const pwd = sh.pwd().toString()
  sh.cd(`${buildDir}/resources`)
  sh.rm('-rf','inspector')

  if(sh.exec('asar e app.asar app').code !== 0) {
    console.log("ERROR5")
    process.exit()
  }
  sh.rm('app.asar')
  sh.rm('-rf','app/resource/bin')
  sh.rm('-rf','app/resource/extension')
  sh.rm('-rf','app/resource/winctl/build/**/*.{obj,tlog,ilk,pdb}')
  sh.rm('-rf','app/resource/tui-editor/node_modules')
  sh.rm('-rf','app/node_modules/**/*.{obj,tlog,ilk,pdb}')
  sh.rm('-rf','app/node_modules/youtube-dl/bin')
  sh.rm('-rf','app/node_modules/jpeg-js/test')
  // sh.cp(`${pwd}/resource/extensions.txt`, `app.asar.unpacked/resource/.`)
  sh.rm('-rf','app.asar.unpacked/node_modules/**/*.{obj,tlog,ilk,pdb}')


  sh.mv('app/resource/css/semantic-ui/themes/default/assets','app/resource/css/semantic-ui/themes/default/assets2')
  sh.mv('app.asar.unpacked/resource/extension/default/1.0_0/css/semantic-ui/themes/default/assets',
    'app.asar.unpacked/resource/extension/default/1.0_0/css/semantic-ui/themes/default/assets2')


  sh.mv(`${pwd}/${buildDir}/LICENSE`,`${pwd}/${buildDir}/_LICENSE`)
  sh.exec(`node-prune ${pwd}/${buildDir}`)
  sh.mv(`${pwd}/${buildDir}/_LICENSE`,`${pwd}/${buildDir}/LICENSE`)
  sh.rm(`${pwd}/${buildDir}/LICENSES.chromium.html`)
  sh.cp(`app/VERSION.txt`,`${pwd}/${buildDir}/VERSION.txt`)
  // sh.cp('-Rf',`${pwd}/../WidevineCdm`,`${pwd}/${buildDir}/.`)
  fs.writeFileSync(`${pwd}/${buildDir}/update.cmd`,`@echo off
cd /d %~dp0
for /f "tokens=1" %%i in (VERSION.txt) do (
  set ver=%%i
)

resources\\app.asar.unpacked\\resource\\bin\\aria2\\win\\aria2c.exe --check-certificate=false --auto-file-renaming=false --allow-overwrite=true https://sushi-browser.com/check.json

for /f "tokens=1" %%j in (check.json) do (
  set ver2=%%j
)

set newver=%ver2:~8,6%

echo old:%ver% new:%newver%

if not "%ver%"=="%newver%" (

  set has_chromium=""
  if exist custom_chromium (
    set has_chromium="-chromium"
    echo Custom Chromium Edition
  )
  
  resources\\app.asar.unpacked\\resource\\bin\\aria2\\win\\aria2c.exe --check-certificate=false --auto-file-renaming=false --allow-overwrite=true https://github.com/kura52/sushi-browser/releases/download/%newver%/sushi-browser-%newver%-win-x64%has_chromium%.zip
  resources\\7zip\\win\\7za.exe x -y -o"_update_%newver%" "sushi-browser-%newver%-win-x64%has_chromium%.zip"
  
  if exist sushi-browser-%newver%-win-x64%has_chromium%.zip (
    del /Q sushi-browser-%newver%-win-x64%has_chromium%.zip
  
    if exist custom_chromium (
      del /Q custom_chromium
    )
    
    taskkill /F /IM sushi-browser.exe
    copy /Y resources\\app.asar.unpacked\\resource\\portable.txt resources\\portable.txt
    rd /s /q resources\\_app
    rd /s /q resources\\app.asar.unpacked
    del /Q resources\\app.asar
    del /Q resources\\electron.asar
    cd _update_%newver%\\sushi-browser-portable
    xcopy /S /E /Y . ..\\..
    cd ..\\..
    powershell Start-Process sushi-browser.exe --update-delete
  )
)`)
  fs.writeFileSync(`${pwd}/${buildDir}/add_to_default_browser.cmd`,`powershell start-process __add_to_default_browser.cmd -verb runas`)
  fs.writeFileSync(`${pwd}/${buildDir}/__add_to_default_browser.cmd`,`reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Sushi\\Capabilities" /v ApplicationDescription /t REG_SZ /d "Sushi Browser" /f
reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Sushi\\Capabilities" /v ApplicationName /t REG_SZ /d "Sushi" /f
reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Sushi\\Capabilities" /v ApplicationIcon /t REG_SZ /d "%~dp0sushi-browser.exe,0" /f

reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Sushi\\Capabilities\\FileAssociations" /v .htm /t REG_SZ /d "SushiURL" /f
reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Sushi\\Capabilities\\FileAssociations" /v .html /t REG_SZ /d "SushiURL" /f
reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Sushi\\Capabilities\\FileAssociations" /v .shtml /t REG_SZ /d "SushiURL" /f
reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Sushi\\Capabilities\\FileAssociations" /v .xht /t REG_SZ /d "SushiURL" /f
reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Sushi\\Capabilities\\FileAssociations" /v .xhtml /t REG_SZ /d "SushiURL" /f
reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Sushi\\Capabilities\\FileAssociations" /v .webp /t REG_SZ /d "SushiURL" /f

reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Sushi\\Capabilities\\URLAssociations" /v ftp /t REG_SZ /d "SushiURL" /f
reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Sushi\\Capabilities\\URLAssociations" /v http /t REG_SZ /d "SushiURL" /f
reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Sushi\\Capabilities\\URLAssociations" /v https /t REG_SZ /d "SushiURL" /f


reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\RegisteredApplications" /v Sushi /t REG_SZ /d "Software\\Sushi\\Capabilities" /f

reg add "HKEY_LOCAL_MACHINE\\Software\\Classes\\SushiURL" /t REG_SZ /d "Sushi Document" /f
reg add "HKEY_LOCAL_MACHINE\\Software\\Classes\\SushiURL" /v FriendlyTypeName /t REG_SZ /d "Sushi Document" /f

reg add "HKEY_LOCAL_MACHINE\\Software\\Classes\\SushiURL\\shell\\open\\command" /t REG_SZ /d "\\"%~dp0sushi-browser.exe\\" -- \\"%%1\\"" /f

pause`)


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
    const electronInstaller = require('electron-winstaller')
    const resultPromise = electronInstaller.createWindowsInstaller({
      appDirectory: buildDir,
      outputDirectory: outDir,
      title: 'Sushi Browser',
      authors: 'kura52',
      loadingGif: 'res/install.gif',
      // loadingGif: 'res/brave_splash_installing.gif',
      setupIcon: 'res/app.ico',
      iconUrl: 'https://sushi-browser.com/favicon.ico',
      // signWithParams: format('-a -fd sha256 -f "%s" -p "%s" -t http://timestamp.verisign.com/scripts/timstamp.dll', path.resolve(cert), certPassword),
      noMsi: true,
      exe: 'sushi-browser.exe'
    })
    resultPromise.then(() => {
      // sh.mv(`${outDir}/Setup.exe`,`${outDir}/sushi-browser-setup-${arch}.exe`)
    }, (e) => console.log(`No dice: ${e.message}`))
  }
  else if(isLinux){
    sh.cp('../custom_chromium.7z', `${pwd}/${buildDir}`)
    fs.writeFileSync(`${pwd}/${buildDir}/version`, 'v6.0.7')

    if(sh.exec(`cp -R ./${buildDir} ./sushi-browser-portable;echo true > ./sushi-browser-portable/resources/app.asar.unpacked/resource/portable.txt`).code !== 0) {
      console.log("ERROR71")
      process.exit()
    }
    sh.cd('./sushi-browser-portable/resources')

    if(sh.exec(`7z a -t7z -mx=9 app.asar.unpacked.7z app.asar.unpacked`).code !== 0) {
      console.log("ERROR11")
      process.exit()
    }
    sh.rm('-rf','app.asar.unpacked')

    if(sh.exec(`7z a -t7z -mx=9 app.asar.7z app.asar`).code !== 0) {
      console.log("ERROR21")
      process.exit()
    }
    sh.rm('-rf','app.asar')

    sh.mkdir('app')
    sh.cp('../../package.json','app/.')
    sh.cd('../..')

    if(sh.exec(`tar -jcvf ${outDir}/sushi-browser-${APP_VERSION}.tar.bz2 ./sushi-browser-portable`).code !== 0) {
      console.log("ERROR22")
      process.exit()
    }

    if(sh.exec(`7z x -y -o"${buildDir}" ${buildDir}/custom_chromium.7z`).code !== 0){
      console.log("ERROR23")
      process.exit()
    }

    sh.rm(`${buildDir}/custom_chromium.7z`)

    ;[`electron-installer-debian --src ${buildDir}/ --dest ${outDir}/ --arch amd64 --config res/linuxPackaging.json`,
      `electron-installer-redhat --src ${buildDir}/ --dest ${outDir}/ --arch x86_64 --config res/linuxPackaging.json`].forEach(cmd=>{
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
    const paths = glob.sync(`${pwd}/${dirc}/**/app.asar`)
    console.log(paths)
    if(paths.length == 1) {
      const base = paths[0].split("/").slice(0, -1).join("/")
      sh.cd(`${base}`)
      sh.mv('app.asar.unpacked/resource/bin/7zip', '.')

      if (isWindows) {
        if (sh.exec(`${isWindows ? '"C:/Program Files/7-Zip/7z.exe"' : '7z'} a -t7z -mx=9 app.asar.unpacked.7z app.asar.unpacked`).code !== 0) {
          console.log("ERROR1")
          process.exit()
        }
        sh.rm('-rf', 'app.asar.unpacked')

        if (sh.exec(`${isWindows ? '"C:/Program Files/7-Zip/7z.exe"' : '7z'} a -t7z -mx=9 app.asar.7z app.asar`).code !== 0) {
          console.log("ERROR2")
          process.exit()
        }
        sh.rm('-rf', 'app.asar')

        sh.mkdir('app')
        sh.cp('../../package.json', 'app/.')
      }
    }

  }
  sh.cd(pwd)
}

const RELEASE_DIRECTORY = 'sushi-browser-release'
const start = Date.now()
sh.cd('../../')

// Create release directory
sh.rm('-rf', RELEASE_DIRECTORY);
sh.cp('-R', 'web-dev-browser', RELEASE_DIRECTORY)


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

for(const bin of ['aria2', 'ffmpeg', 'handbrake', '7zip']){
  sh.rm('-rf',`resource/bin/${bin}/mac`)
  if(isLinux){
    sh.rm('-rf',`resource/bin/${bin}/win`)
  }
  else{
    sh.rm('-rf',`resource/bin/${bin}/linux`)
  }
  sh.rm('-rf',`resource/bin/${bin}/win32`)
}

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
  '839736845446313156',
  '1552752544932680961'].join("|")})`)




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

// filesContentsReplace(`${pwd}/brave/extension/extensions.js`,/true \|\| !fs.existsSync\(appPath\)/,'!fs.existsSync(appPath)')

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
filesContentsReplace(jsFiles,/console\.trace\(/,'//debug(')
filesContentsReplace(jsFiles,/window.debug = require\('debug'\)\('info'\)/,"// window.debug = require('debug')('info')")
filesContentsReplace(jsFiles,/global.debug = require\('debug'\)\('info'\)/,"// global.debug = require('debug')('info')")
filesContentsReplace(jsFiles,/extensions.init\(true\)/,"extensions.init(setting.ver !== fs.readFileSync(path.join(__dirname, '../VERSION.txt')).toString())")

const jsFiles2 = glob.sync(`${pwd}/brave/**/*.js`)
filesContentsReplace(jsFiles2,/console\.log\(/,'//debug(')

if(isLinux){
  const jsFiles3 = glob.sync(`${pwd}/resource/winctl/linux/index.js`)
  filesContentsReplace(jsFiles3,/console\.log\(/,'//debug(')
}

// Babel Use babili
// filesContentsReplace(`${pwd}/.babelrc`,/"react"\]/,'"react","babili"]')
filesContentsReplace(`${pwd}/.babelrc`,'] // ,["lodash", { "id": ["lodash", "semantic-ui-react"] }]]',',["lodash", { "id": ["lodash", "semantic-ui-react"] }]]')

console.log((Date.now() - start)/1000)


filesContentsReplace(`${pwd}/node_modules/youtube-dl/lib/get-binary.js`,"path.join(binPath, 'details')","path.join(binPath, 'details').replace(/app.asar([\\/\\\\])/,'app.asar.unpacked$1')")
filesContentsReplace(`${pwd}/node_modules/youtube-dl/lib/get-binary.js`,"details.path\n" +
  "    ? details.path\n" +
  "    : path.resolve(__dirname, '..', 'bin', details.exec)","(details.path\n" +
  "    ? details.path\n" +
  "    : path.resolve(__dirname, '..', 'bin', details.exec)).replace(/app.asar([\\/\\\\])/,'app.asar.unpacked$1')")


// Build Filestory
const compiledJsFiles = ['resource/extension/default/1.0_0/js/top.js',
  'resource/extension/default/1.0_0/js/download.js',
  'resource/extension/default/1.0_0/js/downloader.js',
  'resource/extension/default/1.0_0/js/selector.js',
  'resource/extension/default/1.0_0/js/history.js',
  'resource/extension/default/1.0_0/js/tabHistorySidebar.js',
  // 'resource/extension/default/1.0_0/js/noteSidebar.js',
  'resource/extension/default/1.0_0/js/tabTrashHistorySidebar.js',
  'resource/extension/default/1.0_0/js/savedStateSidebar.js',
  'resource/extension/default/1.0_0/js/historySidebar.js',
  'resource/extension/default/1.0_0/js/explorerMenu.js',
  'resource/extension/default/1.0_0/js/explorerSidebar.js',
  'resource/extension/default/1.0_0/js/favoriteInit.js',
  'resource/extension/default/1.0_0/js/favoriteSidebar.js',
  'resource/extension/default/1.0_0/js/terminal.js',
  // 'resource/extension/default/1.0_0/js/sync.js',
  'resource/extension/default/1.0_0/js/settings.js',
  'resource/extension/default/1.0_0/js/inputHistorySetting.js',
  'resource/extension/default/1.0_0/js/macro.js',
  'resource/extension/default/1.0_0/js/mobilePanel.js',
  'resource/extension/default/1.0_0/js/converter.js',
  'resource/extension/default/1.0_0/js/automation.js',
  'resource/extension/default/1.0_0/js/contentscript.js',
  'resource/extension/default/1.0_0/js/video_main.js',
  'resource/extension/default/1.0_0/js/videoControllerSidebar.js',
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

    if(isWindows){
      // sh.mv(`${outDir}/sushi-browser-setup-x64.exe`,`${outDir}/sushi-browser-${APP_VERSION}-setup-x64.exe`)
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
  })
})

