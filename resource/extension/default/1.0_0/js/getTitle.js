const t = location.search.substring(5)
let decode_title
if(t.length > 0){
  decode_title = decodeURIComponent(t)
  document.title = decode_title
}


const ipc = chrome.ipcRenderer
ipc.on('update-bind-title', (event, title) => {
  console.log( decode_title != title,decode_title,title)
  if(title && title.length > 0 && decode_title != title){
    window.location.href = `?url=${encodeURIComponent(title)}`
  }
})