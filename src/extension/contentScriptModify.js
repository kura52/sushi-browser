chrome.i18n.getAcceptLanguages = callback=> callback(navigator.languages)

history.back = function(){chrome.ipcRenderer.sendToHost('history','back')}
history.forward = function(){chrome.ipcRenderer.sendToHost('history','forward')}
history.go = function(ind){chrome.ipcRenderer.sendToHost('history','go',ind)}

if(chrome.storage){
  chrome.storage.sync = chrome.storage.local
}

(function(elmProto){
    if (elmProto.hasOwnProperty('scrollTopMax')) {
      return;
    }
    Object.defineProperties(elmProto, {
      'scrollTopMax': {
        get: function scrollTopMax() {
          return this.scrollHeight - this.clientHeight;
        }
      },
      'scrollLeftMax': {
        get: function scrollLeftMax() {
          return this.scrollWidth - this.clientWidth;
        }
      }
    });
  }
)(Element.prototype);
