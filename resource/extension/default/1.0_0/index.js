var ipc = chrome.ipcRenderer

let timer
window.addEventListener('scroll', (e)=>{
  // console.log(window.__scrollSync__ )
  if(window.__scrollSync__ !== 0 || window.__scrollSync__ === (void 0)) return
  ipc.sendToHost("webview-scroll",{
    top: e.target.scrollingElement ? e.target.scrollingElement.scrollTop : undefined,
    left: e.target.scrollingElement ? e.target.scrollingElement.scrollLeft : 0,
    scrollbar: window.innerHeight - document.documentElement.clientHeight
  })
},{passive:true})

window.addEventListener('drop', function (event) {
  console.log(event)
  return true
});