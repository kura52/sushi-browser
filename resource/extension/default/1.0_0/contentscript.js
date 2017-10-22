const ipc = chrome.ipcRenderer

if(location.href.startsWith('http') && window == window.parent){
  document.addEventListener("DOMContentLoaded",_=>{
    const key = Math.random().toString()
    ipc.send('need-get-inner-text',key)
    ipc.once(`need-get-inner-text-reply_${key}`,(e,result)=>{
      if(result) ipc.send('get-inner-text',location.href,document.title,document.documentElement.innerText)
    })
    if(location.href.startsWith('https://chrome.google.com/webstore')){
      setInterval(_=>{
        const ele = document.querySelector(".h-e-f-Ra-c.e-f-oh-Md-zb-k")
        if(ele && !ele.innerHTML){
          ele.innerHTML = `<div role="button" class="dd-Va g-c-wb g-eg-ua-Uc-c-za g-c-Oc-td-jb-oa g-c g-c-Sc-ci" aria-label="add to chrome" tabindex="0" style="user-select: none;"><div class="g-c-Hf"><div class="g-c-x"><div class="g-c-s g-c-Zi-s g-c-s-L-Si"></div><div class="g-c-R webstore-test-button-label">add to chrome</div></div></div></div>`
          ele.querySelector(".dd-Va.g-c-wb.g-eg-ua-Uc-c-za.g-c-Oc-td-jb-oa.g-c.g-c-Sc-ci").addEventListener('click',_=>ipc.send('add-extension',location.href.split("/").slice(-1)[0].split("?")[0]))
        }
        let buttons = document.querySelectorAll(".dd-Va.g-c-wb.g-eg-ua-Kb-c-za.g-c-Oc-td-jb-oa.g-c")
        if(buttons && buttons.length){
          for(let button of buttons){
            const loc = button.parentNode.parentNode.parentNode.parentNode.href.split("/").slice(-1)[0].split("?")[0]
            const parent = button.parentNode
            parent.innerHTML = `<div role="button" class="dd-Va g-c-wb g-eg-ua-Kb-c-za g-c-Oc-td-jb-oa g-c" aria-label="add to chrome" tabindex="0" style="user-select: none;"><div class="g-c-Hf"><div class="g-c-x"><div class="g-c-s g-c-Zi-s g-c-s-L-Si"></div><div class="g-c-R webstore-test-button-label">add to chrome</div></div></div></div>`
            parent.querySelector(".dd-Va.g-c-wb.g-eg-ua-Kb-c-za.g-c-Oc-td-jb-oa.g-c").addEventListener('click',e=>{
              e.stopPropagation()
              e.preventDefault()
              ipc.send('add-extension',loc)},true)
          }
        }
      },1000)

    }
  })
}

function handleDragEnd(evt) {
  const target = evt.target
  if(!target) return

  let url
  if(target.href){
    url = target.href
  }
  else if(target.nodeName == "#text"){
    ipc.sendToHost("link-drop",{screenX: evt.screenX, screenY: evt.screenY, text:window.getSelection().toString() || target.data})
  }
  else{
    const parent = target.closest("a")
    if(parent){
      url = parent.href
    }
    else{
      url = target.src
    }
  }
  if(!url){
  }

  ipc.sendToHost("link-drop",{screenX: evt.screenX, screenY: evt.screenY, url})
}

document.addEventListener('dragend', handleDragEnd, false)


let timer
window.addEventListener('scroll', (e)=>{
  if(window.__scrollSync__ !== 0 || window.__scrollSync__ === (void 0)) return
  ipc.sendToHost("webview-scroll",{
    top: e.target.scrollingElement ? e.target.scrollingElement.scrollTop : undefined,
    left: e.target.scrollingElement ? e.target.scrollingElement.scrollLeft : 0,
    scrollbar: window.innerHeight - document.documentElement.clientHeight
  })
},{passive:true})

ipc.send("get-main-state",['tripleClick'])
ipc.once("get-main-state-reply",(e,data)=>{
  if(data.tripleClick){
    window.addEventListener('click', e=>{
      if (e.detail === 3) {
        window.scrollTo(e.pageX,window.scrollY);
      }
    },{passive:true})
  }
})


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