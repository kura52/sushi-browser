const ipc = chrome.ipcRenderer

function saveFile({savePath,content,fname}){
  console.log(savePath,content,fname)
  ipc.send('save-file',{savePath,content,fname})
  ipc.once('save-reply',(event,result)=> console.log(result))
}


document.title = url.split("/").slice(-1)[0]
__sticky(document.getElementById('topmenu'));
const editor = ace.edit("editor")
editor.setShowPrintMargin(false)
const modelist = ace.require("ace/ext/modelist")
const mode = modelist.getModeForPath(url).mode
document.getElementById("statusBar").innerHTML = "mode: " + mode + "&nbsp;&nbsp;&nbsp;position "

const StatusBar = ace.require("ace/ext/statusbar").StatusBar;
const statusBar = new StatusBar(editor, document.getElementById("statusBar"));
editor.$blockScrolling = Infinity
// editor.setOptions({
//   enableBasicAutocompletion: true,
//   enableSnippets: true
// })
editor.setTheme("ace/theme/chrome")
editor.setFontSize(14);
editor.getSession().setMode(mode)
editor.getSession().setUseWrapMode(true)
editor.getSession().setTabSize(2)
editorLoaded = true

if(xhrRes) editor.getSession().setValue(xhrRes,-1)

function saveFunc(url){
  const sp = url.split("/")
  const param = {content:editor.getSession().getValue()}
  if(url.startsWith("file://")){
    param.savePath = url.substr(7)
  }
  else{
    param.fname = sp[sp.length - 1]
  }
  saveFile(param)
}

document.getElementById('save').addEventListener('click',_=>{saveFunc(url)});
document.getElementById('saveas').addEventListener('click',()=>{
  const sp = url.split("/")
  saveFile({
    content:editor.getSession().getValue(),
    fname : sp[sp.length - 1]
  })
})

editor.commands.addCommand({
  name: 'save',
  bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
  exec: function(editor) {
    saveFunc(url)
  },
  readOnly: true
});