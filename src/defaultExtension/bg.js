
chrome.idle.setDetectionInterval(15)
chrome.idle.onStateChanged.addListener((idleState) => {
  if(idleState == "idle"){
    chrome.ipcRenderer.send('get-favicon', {})
  }
})

let isStart,opMap = {}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.event == "video-event"){
    chrome.tabs.sendMessage(sender.tab.id, request.inputs);
  }
  else if(request.event == 'start-op'){

  }
  else if(request.event == 'end-op'){

  }
  else if(request.event == 'add-op'){
    opMap[request.id] = request
  }
  else if(request.event == 'remove-op'){
    delete opMap[request.id]
  }

});

