const {powerMonitor, ipcMain} = require('electron')
const { ipcFuncMainCb } = require('./util-main')

module.exports = function(manifestMap){

  ipcFuncMainCb('idle','querySystemIdleState',(e, sec, cb)=>{
    powerMonitor.querySystemIdleState(sec, idleState => {
      cb(idleState)
    })
  })

}