const {remote} = require('electron')
const isDarwin = navigator.userAgent.includes('Mac OS X')
const mainState = require('./mainStateRemote')
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
      if(win.isMaximized()){
        // win.unmaximize()
        win.nativeWindow.showWindow(9)
      }
      else{
        // win.maximize()
        win.nativeWindow.showWindow(3)
      }
    }
  },
  windowClose(){
    const win = remote.getCurrentWindow()
    if(isDarwin){
      win.setFullScreen(false)
    }
    ipc.send('close-window')
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
      // win.unmaximize()
      win.nativeWindow.showWindow(9)
    }
  }
}
