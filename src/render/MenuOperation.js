const {remote} = require('electron')
const isDarwin = navigator.userAgent.includes('Mac OS X')
const mainState = remote.require('./mainState')
const ipc = require('electron').ipcRenderer

export default {
  windowMinimize(){
    const win = remote.getCurrentWindow()
    if(isDarwin){
      win.setFullScreen(false)
    }
    win.minimize()
  },
  windowIsMaximized(){
    return ipc.sendSync('get-isMaximized')
  },
  windowMaximize(){
    const win = remote.getCurrentWindow()
    // console.log(1111,mainState.toggleNav)
    if(isDarwin){
      win.setFullScreen(!win.isFullScreen())
    }
    else if(win.isFullScreen()){
      ipc.send('toggle-fullscreen')
    }
    else{
      if(win.isMaximized())
        win.unmaximize()
      else
        win.maximize()
    }
  },
  windowClose(){
    const win = remote.getCurrentWindow()
    if(isDarwin){
      win.setFullScreen(false)
    }
    win.close()
  },
  windowResizeForSplit(){
    const win = remote.getCurrentWindow()

    if(win.isFullScreen()){
      if(isDarwin){
        win.setFullScreen(!win.isFullScreen())
      }
      else{
        ipc.send('toggle-fullscreen')
      }
    }
    else if(win.isMaximized()){
      win.unmaximize()
    }
  }
}
