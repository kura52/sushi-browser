chrome.i18n.getAcceptLanguages = callback=>{
  let lang = navigator.languages.map(lang=>lang == 'zh-CN' || lang == 'pt-BR' ? lang.replace('-','_') : lang.slice(0,2))
  if(!lang) lang = [navigator.language == 'zh-CN' || navigator.language == 'pt-BR' ? navigator.language.replace('-','_') : navigator.language.slice(0,2)]
  callback(lang)
}

chrome.i18n._getUILanguage = chrome.i18n.getUILanguage
chrome.i18n.getUILanguage = _=>{
  const lang = chrome.i18n._getUILanguage()
  return lang == 'zh-CN' || lang == 'pt-BR' ? lang.replace('-','_') : lang.slice(0,2)
}

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
