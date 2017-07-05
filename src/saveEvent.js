import {app, dialog,ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'

function saveFile(event,savePath,content){
  fs.writeFile(savePath, content , (err)=> {
    event.sender.send('save-reply', err);
  });
}

ipcMain.on('save-file', (event, {savePath,content,fname}) => {
  if(!savePath){
    dialog.showSaveDialog(null,
      {title: 'Save File', defaultPath: path.join(app.getPath('home'),fname)},
      (savePath) => {
        if(savePath) saveFile(event,savePath,content)
    })
  }
  else{
    saveFile(event,savePath,content)
  }
})
