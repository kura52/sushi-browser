window.debug = require('debug')('info')
// require('debug').enable("info")
import process from './process'
import {ipcRenderer as ipc} from './ipcRenderer'
const uuid = require('node-uuid')
import '../defaultExtension/contentscript'
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit'
import * as webLinks from 'xterm/lib/addons/webLinks/webLinks'
import * as winptyCompat from 'xterm/lib/addons/winptyCompat/winptyCompat'

function getUrlVars(){
  const vars = {}
  const param = location.search.substring(1).split('&')
  for(let i = 0; i < param.length; i++) {
    const keySearch = param[i].search(/=/)
    let key = ''
    if(keySearch != -1) key = param[i].slice(0, keySearch)
    const val = param[i].slice(param[i].indexOf('=', 0) + 1)
    if(key != '') vars[key] = decodeURIComponent(val)
  }
  return vars
}

const isWin = navigator.userAgent.includes('Windows')
const isDarwin = navigator.userAgent.includes('Mac OS X')
const DEFAULT_WINDOWS_FONT_FAMILY = 'Consolas, \'Courier New\', monospace';
const DEFAULT_MAC_FONT_FAMILY = 'Menlo, Monaco, \'Courier New\', monospace';
const DEFAULT_LINUX_FONT_FAMILY = '\'DejaVu Sans Mono\', \'Droid Sans Mono\', \'monospace\', monospace, \'Droid Sans Fallback\'';

Terminal.applyAddon(fit);
Terminal.applyAddon(webLinks);
Terminal.applyAddon(winptyCompat);
const xterm = new Terminal({
  theme: {"background":"#0f0f0f","foreground":"#cccccc","cursor":"#cccccc","cursorAccent":"#1e1e1e","selection":"rgba(255, 255, 255, 0.25)","black":"#000000","red":"#cd3131","green":"#0dbc79","yellow":"#e5e510","blue":"#2472c8","magenta":"#bc3fbc","cyan":"#11a8cd","white":"#e5e5e5","brightBlack":"#666666","brightRed":"#f14c4c","brightGreen":"#23d18b","brightYellow":"#f5f543","brightBlue":"#3b8eea","brightMagenta":"#d670d6","brightCyan":"#29b8db","brightWhite":"#e5e5e5"},
  fontFamily: isWin ? DEFAULT_WINDOWS_FONT_FAMILY : isDarwin ? DEFAULT_MAC_FONT_FAMILY : DEFAULT_LINUX_FONT_FAMILY,
  fontSize: 14,
})
xterm.open(document.getElementById('terminal'))
xterm.fit()
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

ipc.send('start-pty',key,getUrlVars().cmd)