function getUrlVars(){
  var vars = {};
  var param = location.search.substring(1).split('&');
  for(var i = 0; i < param.length; i++) {
    var keySearch = param[i].search(/=/);
    var key = '';
    if(keySearch != -1) key = param[i].slice(0, keySearch);
    var val = param[i].slice(param[i].indexOf('=', 0) + 1);
    if(key != '') vars[key] = decodeURIComponent(val);
  }
  return vars;
}

const accessKey = chrome.ipcRenderer.sendSync('get-access-key')
const url = getUrlVars().url
let editorLoaded,xhrRes

var xhr = new XMLHttpRequest();
xhr.open('GET', `chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/?key=${accessKey}&file=${url}`, true);
xhr.responseType = 'text';
xhr.onreadystatechange = function(e) {
  console.log(this.readyState,this.status)
  if(this.readyState == this.HEADERS_RECEIVED) {
    const contType = xhr.getResponseHeader("Content-Type")
    if(contType && contType.includes("/html")){
      chrome.ipcRenderer.sendToHost("html-content",url)
    }
  }
  else if (this.status == 200 || xhr.response) {
    xhrRes = xhr.response
    if(editorLoaded){
      editor.getSession().setValue(xhrRes,-1)
    }
  }
};
xhr.send();