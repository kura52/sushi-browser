const {remote} = require('electron')
const isDarwin = navigator.userAgent.includes('Mac OS X')
const mainState = remote.require('./mainState')
const ipc = require('electron').ipcRenderer

export default {
  windowMinimize(){
    remote.getCurrentWindow().minimize()
  },
  windowIsMaximized(){
    const win = remote.getCurrentWindow()
    return win.isMaximized() || win.isFullScreen()
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
    remote.getCurrentWindow().close()
  }
}
