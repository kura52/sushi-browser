import {webContents} from './remoted-chrome/BrowserView'

export default function(isPrivate){
  if(isPrivate){
    for(let cont of webContents.getAllWebContents()){
      if(cont.isDestroyed() /*|| cont.isBackgroundPage()*/) continue
      const m = cont.session.partition.match(/^private(\d+)$/)
      if(m) return cont.session.partition
    }
    return `persist:p${Date.now()}${Math.random()*100000000000000000}`
  }
  let num = 0
  for(let cont of webContents.getAllWebContents()){
    if(cont.isDestroyed() /*|| cont.isBackgroundPage()*/) continue
    const m = cont.session.partition.match(/^persist:(\d+)$/)
    if(m){
      num = Math.max(num,parseInt(m[1]))
    }
  }
  return num + 1
}