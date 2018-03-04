import {app, dialog,ipcMain } from 'electron'
import {getCurrentWindow} from './util'
import fs from 'fs'
import path from 'path'

function saveFile(event,savePath,content){
  fs.writeFile(savePath, content , (err)=> {
    event.sender.send('save-reply', err);
  });
}

ipcMain.on('save-file', (event, {savePath,content,fname}) => {
  if(!savePath){
    dialog.showDialog(getCurrentWindow(),
      {defaultPath: path.join(app.getPath('home'),fname),type: 'select-saveas-file',includeAllFiles:true},
      (savePaths) => {
        if(savePaths && savePaths.length == 1) saveFile(event,savePaths[0],content)
    })
  }
  else{
    saveFile(event,savePath,content)
  }
})
