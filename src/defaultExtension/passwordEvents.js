const ipc = chrome.ipcRenderer

document.addEventListener('submit',e=>{
  ipc.send('send-to-host', 'webview-mousedown',e.button)
},{passive: true, capture: true})
