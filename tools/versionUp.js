const sh = require('shelljs')
const path = require('path')
const fs = require('fs')
const glob = require("glob")

const CODE_NAME = 'Tako(Octopus)'
const CURRENT_APP_VERSION = fs.readFileSync('../VERSION.txt').toString()
const NEXT_APP_VERSION = "0.2.0"

const isWindows = process.platform === 'win32'
const isDarwin = process.platform === 'darwin'
const isLinux = process.platform === 'linux'
const outDir = 'release-packed'
const arch = 'x64'
const buildDir = `sushi-browser-${process.platform}-${arch}`

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

const start = Date.now()
const RELEASE_DIRECTORY = 'sushi-browser-release'
sh.cd('..')
let pwd = sh.pwd().toString()
console.log(pwd)

fileContentsReplace(path.join(pwd,'package.json'),`"version": "${CURRENT_APP_VERSION}"`,`"version": "${NEXT_APP_VERSION}"`)
fileContentsReplace(path.join(pwd,'VERSION.txt'),/.+/,NEXT_APP_VERSION)
filesContentsReplace([path.join(pwd,'README.md'),path.join(pwd,'ja','README.md')],CURRENT_APP_VERSION,NEXT_APP_VERSION)


glob.sync(`${pwd}/../web/**/index.html`).forEach(file=>{
  filesContentsReplace(file,CURRENT_APP_VERSION,NEXT_APP_VERSION)
})
glob.sync(`${pwd}/../web/**/download.html`).forEach(file=>{
  filesContentsReplace(file,CURRENT_APP_VERSION,NEXT_APP_VERSION)
})

console.log(`Sushi Browser v${NEXT_APP_VERSION} ${CODE_NAME}

## Applications
- [Windows Installer v${NEXT_APP_VERSION}](https://sushib.me/dl/sushi-browser-${NEXT_APP_VERSION}-setup-x64.exe)
- [Windows Portable v${NEXT_APP_VERSION}](https://sushib.me/dl/sushi-browser-${NEXT_APP_VERSION}-win-x64.zip)
- [MacOS dmg v${NEXT_APP_VERSION}](https://sushib.me/dl/SushiBrowser-${NEXT_APP_VERSION}.dmg)
- [MacOS Portable v${NEXT_APP_VERSION}](https://sushib.me/dl/sushi-browser-${NEXT_APP_VERSION}-mac-x64.zip)
- [Linux rpm (for Fedora/CentOS) v${NEXT_APP_VERSION}](https://sushib.me/dl/sushi-browser-${NEXT_APP_VERSION}.x86_64.rpm)
- [Linux deb (for Debian/Ubuntu) v${NEXT_APP_VERSION}](https://sushib.me/dl/sushi-browser_${NEXT_APP_VERSION}_amd64.deb)
- [Linux Portable v${NEXT_APP_VERSION}](https://sushib.me/dl/sushi-browser-${NEXT_APP_VERSION}.tar.bz2)`)
filesContentsReplace(path.join(pwd,'ja','README.md'),CURRENT_APP_VERSION,NEXT_APP_VERSION)
