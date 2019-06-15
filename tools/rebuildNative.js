const sh = require('shelljs')
const fs = require("fs")
const path = require("path")

const libs = [
  '../node_modules/node-pty',
  '../resource/winctl',
  '../node_modules/robotjs',
  '../node_modules/iohook']

for(let lib of libs){
  rebuild(path.join(__dirname,lib))
}

function rebuild(lib){
  sh.cd(lib)

  // node-gyp rebuild --target=5.0.4 --arch=ia32 --dist-url=https://atom.io/download/electron
  if(sh.exec('node-gyp rebuild --target=5.0.4 --arch=x64 --dist-url=https://atom.io/download/electron').code !== 0) {
    console.log("ERROR")
    process.exit()
  }
}