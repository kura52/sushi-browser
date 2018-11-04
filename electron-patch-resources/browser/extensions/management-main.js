const {ipcFuncMain} = require('./util-main')
const {ipcMain} = require('electron')

module.exports = function(manifestMap){
  ipcFuncMain('management', 'getAll', _=> Object.values(manifestMap).filter(x=>x.id).map(x=>{
      x.type = 'extension'
      x = {...x, ...x.manifest}
      return x
    })
  )

  ipcFuncMain('management', 'get', (e, id) => {
    let x = manifestMap[id]
    x.type = 'extension'
    x = {...x, ...x.manifest}
    return x
  })

  ipcMain.on('CHROME-MANAGEMENT-GETSYNC',(e,id)=>{
    let x = manifestMap[id]
    x.type = 'extension'
    x = {...x, ...x.manifest}
    e.returnValue = x
  })
}