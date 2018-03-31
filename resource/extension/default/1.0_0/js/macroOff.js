if(window.__isRecording__){
  for(let [name,callback] of Object.entries(window.__isRecording__)){
    window.removeEventListener(name, callback, {capture: true,passive: true})
  }
  window.__isRecording__ = void 0
}