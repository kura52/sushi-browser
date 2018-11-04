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
const arch = 'ia32'
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
  const ret = sh.exec(`electron-packager . sushi-browser --electronVersion=${ELECTRON_VERSION} --platform=${platform} --arch=${arch} --overwrite --icon=${appIcon} --protocol="http" --protocol-name="HTTP Handler" --protocol="https" --protocol-name="HTTPS Handler" --appCopyright="Copyright 2017, Sushi Browser" --asar.unpackDir="{node_modules/{node-pty,youtube-dl/bin},node_modules/node-pty/**/*,resource/{bin,extension}/**/*}" --ignore="\\.(cache|babelrc|gitattributes|githug|gitignore|gitattributes|gitignore|gitkeep|gitmodules)|node_modules/(electron-installer-squirrel-windows|electron-installer-debian|node-gyp|electron-download|electron-rebuild|electron-packager|electron-builder|electron-prebuilt|electron-rebuild|electron-winstaller-fixed|muon-winstaller|electron-installer-redhat|react-addons-perf|babel-polyfill|infinite-tree|babel-register|jsx-to-string|happypack|es5-ext|browser-sync-ui|gulp-uglify|devtron|electron$|deasync|webpack|babel-runtime|uglify-es|babel-plugin|7zip-bin|webdriverio|semantic-ui-react/(node_modules|src)|semantic-ui-react/dist/(commonjs|umd)|babili|babel-helper|react-dom|react|@types|@gulp-sourcemaps|js-beautify)|tools|sushi-browser-|release-packed|cppunitlite|happypack|es3ify"`)

  if(ret.code !== 0) {
    console.log("ERROR2")
    process.exit()
  }

  // if (isWindows) {
  //   sh.mv(`brave-${process.platform}-${arch}`, buildDir)
  //   sh.mv(`${buildDir}/brave.exe`, `${buildDir}/sushi.exe`)
  // }

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
  resources\\app.asar.unpacked\\resource\\bin\\aria2\\win\\aria2c.exe --check-certificate=false --auto-file-renaming=false --allow-overwrite=true https://sushib.me/dl/sushi-browser-%newver%-win-ia32.zip
  resources\\7zip\\win\\7za.exe x -y -o"_update_%newver%" "sushi-browser-%newver%-win-ia32.zip"

  if exist sushi-browser-%newver%-win-ia32.zip (
    del /Q sushi-browser-%newver%-win-ia32.zip
  
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
    fs.writeFileSync(`${pwd}/${buildDir}/add_to_default_browser.cmd`,`powershell start-process __add_to_default_browser.cmd -verb runas`)
    fs.writeFileSync(`${pwd}/${buildDir}/__add_to_default_browser.cmd`,`reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Sushi\\Capabilities" /v ApplicationDescription /t REG_SZ /d "Sushi Browser" /f
reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Sushi\\Capabilities" /v ApplicationName /t REG_SZ /d "Sushi" /f
reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Sushi\\Capabilities" /v ApplicationIcon /t REG_SZ /d "%~dp0sushi.exe,0" /f

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

reg add "HKEY_LOCAL_MACHINE\\Software\\Classes\\SushiURL\\shell\\open\\command" /t REG_SZ /d "\\"%~dp0sushi.exe\\" -- \\"%%1\\"" /f

pause`)
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
      iconUrl: 'https://sushib.me/favicon.ico',
      // signWithParams: format('-a -fd sha256 -f "%s" -p "%s" -t http://timestamp.verisign.com/scripts/timstamp.dll', path.resolve(cert), certPassword),
      noMsi: true,
      exe: 'sushi.exe'
    })
    resultPromise.then(() => {
      // sh.mv(`${outDir}/Setup.exe`,`${outDir}/sushi-browser-setup-${arch}.exe`)
    }, (e) => console.log(`No dice: ${e.message}`))
  }

}

const RELEASE_DIRECTORY = 'sushi-browser-release32'
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

const plat = isWindows ? 'win32' : isDarwin ? 'mac' : 'linux'
sh.cp('-Rf',`../bin/7zip/${plat}`,'resource/bin/7zip/.')
sh.cp('-Rf',`../bin/aria2/${plat}`,'resource/bin/aria2/.')
sh.cp('-Rf',`../bin/ffmpeg/${plat}`,'resource/bin/ffmpeg/.')
sh.cp('-Rf',`../bin/handbrake/${plat}`,'resource/bin/handbrake/.')
sh.cp('-Rf',`../bin/tor/${plat}`,'resource/bin/tor/.')
sh.mkdir('-p', 'resource/bin/widevine');
sh.cp('-Rf',`../bin/widevine/${plat}`,'resource/bin/widevine/.')

sh.mv('resource/bin/7zip/win32','resource/bin/7zip/win')
sh.mv('resource/bin/aria2/win32','resource/bin/aria2/win')
sh.mv('resource/bin/ffmpeg/win32','resource/bin/ffmpeg/win')
sh.mv('resource/bin/handbrake/win32','resource/bin/handbrake/win')
sh.mv('resource/bin/widevine/win32','resource/bin/widevine/win')
sh.mv('resource/bin/tor/win32','resource/bin/tor/win')

filesContentsReplace(`${pwd}/node_modules/youtube-dl/lib/youtube-dl.js`,"path.join(__dirname, '..', 'bin/details')","path.join(__dirname, '..', 'bin/details').replace(/app.asar([\\/\\\\])/,'app.asar.unpacked$1')")
filesContentsReplace(`${pwd}/node_modules/youtube-dl/lib/youtube-dl.js`,"(details.path) ? details.path : path.resolve(__dirname, '..', 'bin', details.exec)","((details.path) ? details.path : path.resolve(__dirname, '..', 'bin', details.exec)).replace(/app.asar([\\/\\\\])/,'app.asar.unpacked$1')")


build()

if(isWindows){
  sh.mv(`${outDir}/sushi-browser-setup-ia32.exe`,`${outDir}/sushi-browser-${APP_VERSION}-setup-ia32.exe`)
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
  sh.exec(`"C:/Program Files/7-Zip/7z.exe" a sushi-browser-${APP_VERSION}-win-ia32.zip sushi-browser-portable`)
}