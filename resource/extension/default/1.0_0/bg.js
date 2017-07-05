
chrome.idle.setDetectionInterval(15)
chrome.idle.onStateChanged.addListener((idleState) => {
  if(idleState == "idle"){
    chrome.ipcRenderer.send('get-favicon', {})
  }
})