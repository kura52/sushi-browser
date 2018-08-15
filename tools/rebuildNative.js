const sh = require('shelljs')
const fs = require("fs")

const libs = ['../node_modules/node-pty','../node_modules/winctl']

for(let lib of libs){
  rebuild(lib)
}

function rebuild(lib){
  sh.cd(lib)

  if(sh.exec('node-gyp rebuild --target=8.0.8 --arch=x64 --dist-url=http://brave-laptop-binaries.s3.amazonaws.com/atom-shell/dist').code !== 0) {
    console.log("ERROR")
    process.exit()
  }
}