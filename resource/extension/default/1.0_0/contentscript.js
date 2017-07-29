// function handleFileSelect(evt) {
//   evt.stopPropagation()
//   evt.preventDefault()
//
//   const files = evt.dataTransfer.files
//   if(files.length > 0){
//     chrome.runtime.sendMessage({transitionPath: `file://${files[0].path}`})
//   }
//   else{
//     chrome.runtime.sendMessage({transitionPath: evt.dataTransfer.getData("text")})
//   }
//
// }
//
// function handleDragOver(evt) {
//   evt.stopPropagation()
//   evt.preventDefault()
//   evt.dataTransfer.dropEffect = 'copy' // Explicitly show this is a copy.
// }
//
// // Setup the dnd listeners.
// document.addEventListener('dragover', handleDragOver, false)
// document.addEventListener('drop', handleFileSelect, false)
const ipc = chrome.ipcRenderer

let timer
window.addEventListener('scroll', (e)=>{
  if(window.__scrollSync__ !== 0 || window.__scrollSync__ === (void 0)) return
  ipc.sendToHost("webview-scroll",{
    top: e.target.scrollingElement ? e.target.scrollingElement.scrollTop : undefined,
    left: e.target.scrollingElement ? e.target.scrollingElement.scrollLeft : 0,
    scrollbar: window.innerHeight - document.documentElement.clientHeight
  })
},{passive:true})

//style setting
let styleVal
if((styleVal = localStorage.getItem('meiryo')) !== null){
  if(styleVal === "true"){
    setTimeout(_=>{
      const css = document.createElement('style')
      const rule = document.createTextNode('html{ font-family: Arial, "メイリオ", sans-serif}')
      css.appendChild(rule)
      document.getElementsByTagName('head')[0].appendChild(css)
    },0)
  }
}
else{
  ipc.send('need-meiryo')
  ipc.once('need-meiryo-reply',(e,styleVal)=>{
    localStorage.setItem('meiryo',styleVal)
    if(styleVal){
      const css = document.createElement('style')
      const rule = document.createTextNode('html{ font-family: Arial, "メイリオ", sans-serif}')
      css.appendChild(rule)
      document.getElementsByTagName('head')[0].appendChild(css)
    }
  })
}