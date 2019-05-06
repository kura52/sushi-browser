const ipc = chrome.ipcRenderer
const isWin = navigator.userAgent.includes('Windows')

if(!isWin) {
  const handleMouseUp = e =>{
    const eventMoveHandler = e2 => {
      console.log(e2)
      ipc.send('context-menu-move')
      document.removeEventListener('mousemove', eventMoveHandler, {passive: true, capture: true})
    }
    const eventUpHandler = e2 => {
      console.log(e2)
      if (e2.which == 3) {
        ipc.send('context-menu-up')
        document.removeEventListener('mouseup', eventUpHandler, {passive: true, capture: true})
      }
    }
    document.addEventListener('mousemove', eventMoveHandler, {passive: true, capture: true})
    document.addEventListener('mouseup', eventUpHandler, {passive: true, capture: true})
  }
  ipc.on('start-mouseup-handler',handleMouseUp)
}