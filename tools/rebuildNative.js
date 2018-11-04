const sh = require('shelljs')
const fs = require("fs")
const path = require("path")

const libs = ['../node_modules/ad-block','../node_modules/node-pty','../node_modules/winctl']

for(let lib of libs){
  rebuild(path.join(__dirname,lib))
}

function rebuild(lib){
  sh.cd(lib)

  if(sh.exec('node-gyp rebuild --target=4.0.0-nightly.20181010 --arch=x64 --dist-url=https://atom.io/download/electron').code !== 0) {
    console.log("ERROR")
    process.exit()
  }
}