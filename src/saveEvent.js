import {app, dialog,ipcMain } from 'electron'
import {getCurrentWindow} from './util'
import fs from 'fs'
import path from 'path'

function saveFile(event,savePath,content){
  fs.writeFile(savePath, content , (err)=> {
    event.sender.send('save-reply', err, savePath);
  });
}

function getUniqFileName(basePath,index=0){
  const savePath = makePath(basePath,index)
  return fs.existsSync(savePath) ? getUniqFileName(basePath,index+1) : savePath
}

function makePath(basePath,index){
  if(index === 0) return basePath
  const base = path.basename(basePath)
  const val = base.lastIndexOf('.')
  if(val == -1){
    return `${basePath} (${index})`
  }
  else{
    return path.join(path.dirname(basePath),`${base.slice(0,val)}_${index}${base.slice(val)}`)
  }
}

ipcMain.on('save-file', (event, {savePath,content,fname,isDesktop}) => {
  if(!savePath){
    dialog.showSaveDialog(getCurrentWindow(),
      { defaultPath: getUniqFileName(path.join(app.getPath(isDesktop ? 'desktop' : 'downloads'),fname)) },
      (savePath) => {
        if(savePath) saveFile(event,savePath,content)
    })
  }
  else{
    saveFile(event,savePath,content)
  }
})


// ipcMain.on('save-file-tmp', (event, {content,fname}) => {
//   const savePath = path.join(app.getPath('temp'),fname)
//   saveFile(event,savePath,content)
// })