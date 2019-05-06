const sh = require('shelljs')
const path = require('path')
const fs = require('fs')

const contents = fs.readFileSync('../dist/vendor.dll.js').toString()
let result = contents.replace(/e\.nativeEvent/g,'(e.nativeEvent || e)')
  .replace(/defaultProps\.as/g,"(defaultProps && defaultProps.as)")
fs.writeFileSync('../dist/vendor.dll.js',result)
result = result.replace(/\/\/# sourceMappingURL=.+/g,'')
fs.writeFileSync('../resource/extension/default/1.0_0/js/vendor.dll.js',result)


// fs.writeFileSync('./resource/extension/default/1.0_0/js/top.js',
// fs.readFileSync('./resource/extension/default/1.0_0/js/top.js').toString().replace(/\/\/# sourceMappingURL=.+/g,''))

function a(file){
  const contents2 = fs.readFileSync(file).toString()
  let result2 = contents2.replace(/e\.nativeEvent/g,'(e.nativeEvent || e)').replace(/\(e.nativeEvent \|\| e\) =/g,'e.nativeEvent =')
    .replace(/defaultProps\.as/g,"(defaultProps && defaultProps.as)")
  fs.writeFileSync(file,result2)
}

[
  '../resource/extension/default/1.0_0/js/top.js',
  '../resource/extension/default/1.0_0/js/downloader.js',
  '../resource/extension/default/1.0_0/js/download.js',
  '../resource/extension/default/1.0_0/js/selector.js',
  '../resource/extension/default/1.0_0/js/history.js',
  '../resource/extension/default/1.0_0/js/tabHistorySidebar.js',
  '../resource/extension/default/1.0_0/js/noteSidebar.js',
  '../resource/extension/default/1.0_0/js/tabTrashHistorySidebar.js',
  '../resource/extension/default/1.0_0/js/savedStateSidebar.js',
  '../resource/extension/default/1.0_0/js/historySidebar.js',
  '../resource/extension/default/1.0_0/js/explorerMenu.js',
  '../resource/extension/default/1.0_0/js/explorerSidebar.js',
  '../resource/extension/default/1.0_0/js/favoriteInit.js',
  '../resource/extension/default/1.0_0/js/favoriteSidebar.js',
  '../resource/extension/default/1.0_0/js/terminal.js',
  '../resource/extension/default/1.0_0/js/sync.js',
  '../resource/extension/default/1.0_0/js/settings.js',
  '../resource/extension/default/1.0_0/js/video_main.js',
  '../lib/render/base.js'
].forEach(f=>a(f))