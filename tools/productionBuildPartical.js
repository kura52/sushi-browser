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


function build(){
  const platform = isLinux ? 'darwin,linux' : isWindows ? 'win32' : isDarwin ? 'darwin' : 'mas'
  const ret = sh.exec(`node ./node_modules/electron-packager/cli.js . ${isWindows ? 'brave' : 'sushi-browser'} --platform=${platform} --arch=x64 --overwrite --icon=${appIcon} --version=${MUON_VERSION}  --asar=false --app-version=${APP_VERSION} --build-version=${MUON_VERSION} --protocol="http" --protocol-name="HTTP Handler" --protocol="https" --protocol-name="HTTPS Handler" --version-string.CompanyName="Sushi Browser" --version-string.ProductName="Sushi Browser" --version-string.Copyright="Copyright 2017, Sushi Browser" --version-string.FileDescription="Sushi" --ignore="\\.(cache|babelrc|gitattributes|githug|gitignore|gitattributes|gitignore|gitkeep|gitmodules)|node_modules/(electron-installer-squirrel-windows|electron-installer-debian|node-gyp|npm|electron-download|electron-rebuild|electron-packager|electron-builder|electron-prebuilt|electron-rebuild|electron-winstaller-fixed|muon-winstaller|electron-installer-redhat|react-addons-perf|babel-polyfill|infinite-tree|babel-register|jsx-to-string|happypack|es5-ext|browser-sync-ui|gulp-uglify|devtron|electron$|deasync|webpack|babel-runtime|uglify-es|node-inspector|node-pre-gyp)|tools|sushi-browser-|release-packed"`)

  if(ret.code !== 0) {
    console.log("ERROR2")
    process.exit()
  }

  if (isWindows) {
    sh.mv(`brave-${process.platform}-${arch}`, buildDir)
    sh.mv(`${buildDir}/brave.exe`, `${buildDir}/sushi.exe`)
  }

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
      sh.mv(`${outDir}/Setup.exe`,`${outDir}/sushi-browser-setup-${arch}.exe`)
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


    if(sh.exec(`ditto -c -k --sequesterRsrc --keepParent ${buildDir}/sushi-browser.app ${outDir}/sushi-browser-${APP_VERSION}.zip`).code !== 0) {
      console.log("ERROR6")
      process.exit()
    }


  }
  else if(isLinux){
    [`./node_modules/.bin/electron-installer-debian --src ${buildDir}/ --dest ${outDir}/ --arch amd64 --config res/linuxPackaging.json`,
      `./node_modules/.bin/electron-installer-redhat --src ${buildDir}/ --dest ${outDir}/ --arch x86_64 --config res/linuxPackaging.json`,
      `tar -jcvf ${outDir}/sushi-browser.tar.bz2 ./${buildDir}`].forEach(cmd=>{
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
        .replace('tabContents.close','tabContents.forceClose')
        .replace("evt.sender.send('chrome-tabs-create-response-' + responseId, tab.tabValue(), error)","evt.sender.send('chrome-tabs-create-response-' + responseId, tab && tab.tabValue(), error)")

      fs.writeFileSync(file,result)

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
build()



if(isDarwin){
  glob.sync(`${pwd}/${outDir}/sushi-browser*.zip`).forEach(file=>{
    sh.mv(file,`${outDir}/sushi-browser-${APP_VERSION}-mac-x64.zip`)
  })
}

if(isWindows){
  sh.mv(`${outDir}/sushi-browser-setup-x64.exe`,`${outDir}/sushi-browser-${APP_VERSION}-setup-x64.exe`)
  sh.mv('sushi-browser-win32-x64',`sushi-browser-${APP_VERSION}-win-x64`)
  sh.exec(`"C:/Program Files/7-Zip/7z.exe" a sushi-browser-${APP_VERSION}-win-x64.zip sushi-browser-${NEXT_APP_VERSION}-win-x64`)
}