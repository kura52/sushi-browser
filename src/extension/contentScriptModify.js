chrome.i18n.getAcceptLanguages = callback=> callback(navigator.languages)

history.back = function(){chrome.ipcRenderer.sendToHost('history','back')}
history.forward = function(){chrome.ipcRenderer.sendToHost('history','forward')}
history.go = function(ind){chrome.ipcRenderer.sendToHost('history','go',ind)}

if(chrome.storage){
  chrome.storage.sync = chrome.storage.local
}