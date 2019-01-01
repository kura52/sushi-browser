const sh = require('shelljs')
const fs = require("fs")
const path = require("path")

const libs = ['../node_modules/sqlite3','../node_modules/ad-block','../node_modules/node-pty','../node_modules/winctl']

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

// node-gyp configure --module_name=node_sqlite3 --module_path=../lib/binding/electron-x64
// node-gyp rebuild --target=4.0.0-nightly.20181010 --arch=x64 --target_platform=linux --dist-url=https://atom.io/download/electron --module_name=node_sqlite3 --module_path=../lib/binding/electron-x64