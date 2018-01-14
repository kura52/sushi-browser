
chrome.idle.setDetectionInterval(15)
chrome.idle.onStateChanged.addListener((idleState) => {
  if(idleState == "idle"){
    chrome.ipcRenderer.send('get-favicon', {})
  }
})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.event == "video-event"){
    chrome.tabs.sendMessage(sender.tab.id, request.inputs);
  }
});