export default function(inputHistoryMaxChar){
  const ipc = chrome.ipcRenderer
  const key = Math.random().toString

  function isString(o) {
    return typeof o === 'string';
  }

  let timeoutId, hasCode, gettingCode
  function main(isTmp) {
    if(!hasCode) return
    const value = []
    const data = {
      value,
      frameUrl: window.location.href,
      host: window.location.host,
      now: Date.now()
    }
    for (let ele of document.querySelectorAll('input:not([type="submit"]):not([type="hidden"]):not([type="reset"]):not([type="button"]):not([type="image"]):not([type="password"]):not([disabled]),select:not([disabled]),textarea:not([disabled]),[contenteditable="true"]:not([disabled])')) {
      const val = getValue(ele)
      if (val) value.push(val)
    }
    console.log(5553, data.value)
    if(value.length){
      data.value = JSON.stringify(value)
      ipc.send('input-history-data', key, data, isTmp)
    }
  }

  function exec() {
    if(timeoutId) return
    if(!gettingCode){
      gettingCode = true
      const key = Math.random().toString()
      ipc.send('get-selector-code',key)
      ipc.once(`get-selector-code_${key}`,(e,code)=>{
        Function(code)()
        hasCode = true
      })
    }
    timeoutId = setTimeout(_=>{
      timeoutId = void 0
      main(true)
    },3000)
  }

  function on(eventName) {
    if(eventName.startsWith('_')) return
    const handler = async e=>{
      if(!e.isTrusted) return

      const target = e.target
      const tag = target.tagName && target.tagName.toLowerCase()
      const type = target.type && target.type.toLowerCase()
      if((!tag.match(/^(input|textarea)$/) && !target.isContentEditable) ||
        (tag == 'input' && (type == 'checkbox' || type == 'radio' || type == 'password' ||
          type == 'submit' || type == 'hidden' || type == 'reset' || type == 'button' || type == 'image'))) return
      if(eventName == 'focusin'){
        if(!hasCode){
          await new Promise(r=>{
            gettingCode = true
            const key = Math.random().toString()
            ipc.send('get-selector-code',key)
            ipc.once(`get-selector-code_${key}`,(e,code)=>{
              Function(code)()
              hasCode = true
              r()
            })
          })
        }
        const r = target.getBoundingClientRect()
        ipc.send('focus-input','in',{x:r.x, y:r.y, width:r.width, height:r.height,
          tag,
          type,
          optSelector: window.__select__(target),
          selector: window.__simpleSelect__(target),
          frameUrl: window.location.href,
          host: window.location.host
        })
      }
      else if(eventName == 'focusout'){
        setTimeout(()=>ipc.send('focus-input','out',{
            optSelector: window.__select__(target),
            selector: window.__simpleSelect__(target),
            frameUrl: window.location.href,
            host: window.location.host
          }),400)
      }
      else{
        exec()
      }
    }
    window.addEventListener(eventName, handler, {passive: true})
    // window.addEventListener(eventName, handler, {capture: true,passive: true})
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

    if(isString(value) && tag != 'select'){
      value = value.slice(0,inputHistoryMaxChar)
    }

    return (value !== 0 && !value) ? (void 0) : {
      tag,
      type,
      value,
      optSelector: window.__select__(target),
      selector: window.__simpleSelect__(target),
      editable: target.isContentEditable
    }
  }


  for(let eventName of ['mousedown','select','focusin','focusout','click','keydown','input','change']){
    on(eventName)
  }

  function closeHandler(){
    main()
    ipc.send('focus-input','out',{
      frameUrl: window.location.href
    })
  }

  ipc.once('record-input-history',closeHandler)
  window.addEventListener('beforeunload',closeHandler);
}