const {ipcFuncMain, ipcFuncMainCb, getIpcNameFunc, shortId} = require('./util-main')
const {ipcMain, BrowserWindow} = require('electron')
const getIpcName = getIpcNameFunc('alarms')

module.exports = function(sendToBackgroundPage) {
  const alarmMap = {}

  const clear = (e, extensionId, name)=> {
    if(alarmMap[extensionId] && alarmMap[extensionId][name]){
      clearTimeout(alarmMap[extensionId][name][1])
      clearInterval(alarmMap[extensionId][name][2])
      delete alarmMap[extensionId][name]
      return true
    }
    return false
  }

  ipcFuncMain('alarms', 'create', (e, extensionId, name, alarmInfo)=> {
    if(!alarmMap[extensionId]) alarmMap[extensionId] = {}
    clear(e, extensionId, name)

    const alarm = {name, ...alarmInfo}

    let setIntervalId
    const setTimeoutId = setTimeout(()=>{
      sendToBackgroundPage(extensionId, getIpcName('onAlarm'), alarm)
      if(alarmInfo.periodInMinutes && alarmMap[extensionId][name]){
        setIntervalId = setInterval(()=>{
          sendToBackgroundPage(extensionId, getIpcName('onAlarm'), alarm)
        },alarmInfo.periodInMinutes * 1000 * 60)
      }
    }, alarmInfo.when ? alarmInfo.when - Date.now() : alarmInfo.delayInMinutes * 1000 * 60)
    alarmMap[extensionId][name] = [alarm,setTimeoutId,setIntervalId]
  })

  ipcFuncMain('alarms', 'get', (e, extensionId, name)=> {
    return alarmMap[extensionId] && alarmMap[extensionId][name]
  })

  ipcFuncMain('alarms', 'getAll', (e, extensionId)=> {
    return alarmMap[extensionId] && Object.values(alarmMap[extensionId])
  })

  ipcFuncMain('alarms', 'clear', clear)

  ipcFuncMain('alarms', 'clearAll', (e, extensionId)=> {
    if(alarmMap[extensionId] && alarmMap[extensionId].length){
      for(let name of Object.keys(alarmMap[extensionId])){
        clear(e, extensionId, name)
      }
      return true
    }
    return false
  })
}