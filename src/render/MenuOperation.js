const {remote} = require('electron')
const isDarwin = navigator.userAgent.includes('Mac OS X')

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
    if(isDarwin){
      win.setFullScreen(!win.isFullScreen())
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
