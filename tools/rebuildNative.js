const sh = require('shelljs')
const fs = require("fs")

const libs = ['../node_modules/node-pty','../node_modules/youtube-dl','../node_modules/winctl','../node_modules/sharp']

for(let lib of libs){
  rebuild(lib)
}

function rebuild(lib){
  sh.cd(lib)

  if(sh.exec('node-gyp rebuild --target=4.0.3 --arch=x64 --dist-url=http://brave-laptop-binaries.s3.amazonaws.com/atom-shell/dist').code !== 0) {
    console.log("ERROR")
    process.exit()
  }
}