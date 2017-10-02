const {webContents} = require('electron')
export default function(){
  let num = 0
  for(let cont of webContents.getAllWebContents()){
    if(cont.isDestroyed() || cont.isBackgroundPage()) continue
    const m = cont.session.partition.match(/^persist:(\d+)$/)
    if(m){
      num = Math.max(num,parseInt(m[1]))
    }
  }
  return num + 1
}