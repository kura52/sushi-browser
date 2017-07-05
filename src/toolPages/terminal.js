window.debug = require('debug')('info')
// require('debug').enable("info")
import process from './process'
const ipc = require('electron').ipcRenderer
const uuid = require('node-uuid')

const xterm = new Terminal()
xterm.open(document.getElementById('terminal'))
xterm.fit()
xterm.linkify()
const key = uuid.v4()

xterm.on('data', function(data){
  console.log("xterm_on_data")
  ipc.send(`send-pty_${key}`,data)
});

ipc.on(`pty-out_${key}`, function(event,data){
  console.log("pty-out-recieve")
  xterm.write(data)
});


ipc.on(`fit_${key}`, function(event,data){
  console.log("fit")
  xterm.fit()
  const rowsHeight = document.getElementsByClassName("xterm-viewport")[0].clientHeight
  document.getElementById("header").style.height = `${window.innerHeight - rowsHeight}px`
});

ipc.on(`ping_${key}`, function(event,data){
  console.log("ping-receive")
  ipc.send(`ping-reply_${key}`,"")
});

function handleResize(e) {
  const w = document.getElementsByClassName("xterm-scroll-area")[0].clientWidth
  const h = document.getElementById("terminal").clientHeight
  if(w==window.preW && h==window.preH) return

  const cols = parseInt(w / 8.5)
  const rows = parseInt(h / 16)
  console.log(rows,cols)

  ipc.send(`resize_${key}`,{rows,cols,w,h})
  window.preW = w
  window.preH = h
}

window.addEventListener('resize', handleResize, { passive: true });
window.onload = handleResize

ipc.send('start-pty',key)