const ipc = chrome.ipcRenderer

function getFrameIndex() {
  if (window.top === window.self)
    return 0;
  for (var i=0; i<window.frames.length; i++) {
    if (window.frames[i] === window.self) {
      return i+1;
    }
  }
  return -1;
}

let timeoutId, hasCode
function main() {
  if(!hasCode) return
  const value = []
  const data = {
    value,
    frameUrl: `${getFrameIndex()}\t${window.location.href}`,
    now: Date.now()
  }
  for (let ele of document.querySelectorAll('input:not([type="submit"]):not([type="hidden"]):not([type="reset"]):not([type="button"]):not([type="image"]):not([disabled]),select:not([disabled]),textarea:not([disabled]),[contenteditable="true"]:not([disabled])')) {
    const val = getValue(ele)
    if (val) value.push(val)
  }
  console.log(5553, data.value)
  data.value = JSON.stringify(value)
  ipc.send('input-history-data', data)
}

function exec() {
  if(timeoutId) return
  if(!hasCode){
    hasCode = true
    const key = Math.random().toString()
    ipc.send('get-selector-code',key)
    ipc.once(`get-selector-code_${key}`,(e,code)=>{
      Function(code)()
    })
  }
  timeoutId = setTimeout(_=>{
    timeoutId = void 0
    main()
  },3000)
}

function on(eventName) {
  if(eventName.startsWith('_')) return
  const handler = e=>{
    if(!e.isTrusted) return

    const target = e.target
    const tag = target.tagName && target.tagName.toLowerCase()
    if(!tag.match(/^(input|select|textarea)$/) && !target.isContentEditable) return
    if(eventName == 'focusin'){

    }
    else if(eventName == 'focusout'){

    }
    else{
      exec()
    }
  }
  window.addEventListener(eventName, handler, {capture: true,passive: true})
}

function getValue(target){
  const tag = target.tagName && target.tagName.toLowerCase()
  const type = target.type && target.type.toLowerCase()

  const style = window.getComputedStyle(target)
  if(style.display == 'none' || style.visibility == 'hidden' || (target.scrollWidth == 0 && target.scrollHeight == 0)) return

  let value

  if (tag == 'input' || tag == 'textarea') {
    if (type == 'checkbox' || type == 'radio') {
      value = target.checked
    }
    else
      value = target.value
  }
  else if (tag == 'select') {
    value = JSON.stringify([...target.selectedOptions].map(x => ({
      index: x.index,
      value: x.value,
      text: x.text
    })))
    if(!value.length) return
  }
  else
    value = target.innerText || ''

  return (value !== 0 && !value) ? (void 0) : {
    tag,
    type,
    value,
    optSelector:window.__select__(target),
    selector: window.__simpleSelect__(target),
    editable: target.isContentEditable
  }
}


for(let eventName of ['mousedown','select','focusin','focusout','click','keydown','input','change']){
  on(eventName)
}

ipc.once('record-input-history',main)


window.addEventListener('beforeunload', main);