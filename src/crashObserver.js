import {BrowserWindow} from 'electron'

let num
setInterval(_=>{
  const wins = BrowserWindow.getAllWindows()
  len = wins.length
  if(num + len === 0){
    for (let ptyProcess of ptyProcessSet){
      try{ ptyProcess.destroy() }catch(e){}
    }
    try{ global.__CHILD__.kill() }catch(e){}
    try{ app.quit() }catch(e){}
  }
  num = len
},12000)