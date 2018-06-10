import { ipcMain,BrowserWindow } from 'electron'

ipcMain.on("close-tab-from-other-window-to-main", (event, data) => {

  console.log(data)
  const win = BrowserWindow.fromId(data.windowId)

  ipcMain.once("detach-tab-to-main", (event2, data2) => {
    console.log(data)
    const win = BrowserWindow.fromId(data.windowId)
    event.sender.send("detach-tab-from-other-window",data2)
    ipcMain.once("detach-tab-from-other-window-finish",e=>{
      // setTimeout(_=>win.webContents.send(`detach-tab-from-other-window-finish-from-main`),100)
    })
  })

  setTimeout(_=>win.webContents.send(`close-tab-from-other-window`,data),100)

})
