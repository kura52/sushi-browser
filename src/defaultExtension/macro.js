if(!window.__isRecording__){
  window.__isRecording__ = {}

  const loadTime = Date.now()
  const { select } = require('./optimal-select')

  const EA_keys = {8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Ctrl",18:"Alt",19:"Pause",20:"Caps Lock",27:"Esc",32:"Space",33:"Page Up",34:"Page Down",35:"End",36:"Home",37:"Left",38:"Up",39:"Right",40:"Down",44:"Impr ecran",45:"Insert",46:"Delete",91:"Windows / Command",92:"Menu Demarrer Windows",93:"Menu contextuel Windows",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",136:"Num Lock",137:"Scroll Lock",144:"Verr Num",145:"Arret defil",229:'IME'};


  function escapeValue(value) {
    return value && value.replace(/['"`\\/:\?&!#$%^()[\]{|}*+;,.<=>@~]/g, '\\$&').replace(/\n/g, '\A');
  }

  function getKey(keyCode){
    return EA_keys[keyCode] || String.fromCharCode(keyCode)
  }

  function stringToUnicode(str){
    let result = ""
    for(let i=0,len=str.length;i<len;i++){
      result += `\\u${str.charCodeAt(i).toString(16)}`
    }
    return result
  }

  const optCssSelector = element=>select(element, {
    root: document,
    priority: ['id', 'class','tag', 'value'],
    ignore: {
      attribute (name, value, defaultPredicate) {
        return !(/^(title|value|alt|label|name|class|id)$/).test(name) || (name == 'class' && /^\s*$/.test(value)) || (name == 'value' && (element.tagName == 'INPUT' && !/^checkbox|radio|file|submit|image|reset|button$/i.test(element.type)) || element.tagName == 'TEXTAREA')
      }
    }
  })
  const simpleCssSelector = element=>select(element, {
    root: document,
    priority: ['id','tag'],
    ignore: {
      attribute (name, value, defaultPredicate) {
        return name != 'id'
      }
    }
  })

  function createXPathAndSelector(element) {
    for (var segs = [],sels = []; element && element.nodeType == 1; element = element.parentNode) {
      if(element.id) {
        const escapedId = escapeValue(element.id)
        const uniqueIdCount = document.querySelectorAll(`[id="${escapedId}"]`).length

        if (uniqueIdCount == 1) {
          segs.unshift(`//*[@id="${element.id}"]`)
          if(/^\d|[\s]\d/.test(escapedId) === false){
            sels.unshift(`#${escapedId}`)
          }
          else{
            sels.unshift(`[id="${escapedId}"]`)
          }
          return {xpath:segs.join('/'),selector:sels.join(' > ')};
        }
        if (element.nodeName) {
          segs.unshift(`${element.nodeName.toLowerCase()}[@id="${element.id}"]`);
          if(/^\d|[\s]\d/.test(id) === false){
            sels.unshift(`${escapeValue(element.nodeName.toLowerCase())}#${escapedId}`);
          }
          else{
            sels.unshift(`${escapeValue(element.nodeName.toLowerCase())}[id="${escapedId}"]`);
          }
        }
      }
      // else if(element.className) {
      //   segs.unshift(`${element.nodeName.toLowerCase()}[@class="${element.className.trim()}"]`)
      //   sels.unshift(`${element.nodeName.toLowerCase()}.${element.className.trim().replace(/[ \t]+/g,".")}`)
      // }
      else {
        for (var i = 1, i2 = 1,sib = element.previousSibling; sib; sib = sib.previousSibling) {
          if (sib.nodeName == element.nodeName) i++
        }
        let onlyElement = i == 1
        if(onlyElement){
          for(sib = element.nextSibling;sib;sib = sib.nextSibling){
            if(sib.nodeName == element.nodeName){
              onlyElement = false
              break
            }
          }
        }
        let className = element.className
        if(!onlyElement && element.className){
          for(sib = element.previousSibling;sib;sib = sib.previousSibling){
            if(sib.nodeName == element.nodeName && sib.className.trim().replace(/[ \t]+/g, ".") == element.className.trim().replace(/[ \t]+/g, ".")){
              className = null
              break
            }
          }
          if(className){
            for(sib = element.nextSibling;sib;sib = sib.nextSibling){
              if(sib.nodeName == element.nodeName && sib.className.trim().replace(/[ \t]+/g, ".") == element.className.trim().replace(/[ \t]+/g, ".")){
                className = null
                break
              }
            }
          }
        }
        segs.unshift(element.nodeName.toLowerCase() + (onlyElement ? '' : `[${i}]`))
        sels.unshift(element.nodeName.toLowerCase() + (onlyElement ? '' : className ? `.${className.trim().replace(/[ \t]+/g, ".")}` : `:nth-of-type(${i})`))
      }

    }

    return {xpath:segs.length ? '/' + segs.join('/') : null,selector: sels.length ? sels.join(' > ') : null}
  }

  function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
  }

  function getFrameIndex() {
    if (window.top === window.self)
      return 0;
    for (var i=0; i<window.top.frames.length; i++) {
      if (window.top.frames[i] === window.self) {
        return i+1;
      }
    }

    return -1;
  }

  let index = 0
  /* Start Scroll */
  let scrollTimer,scrollObject,scrollStartTime,scrollStartTop,scrollStartLeft
  function finishScrollEvent(e) {
    const target = e.target == document ? document.scrollingElement : e.target
    const {xpath,selector} = createXPathAndSelector(e.target)
    const data = {
      index: index++,
      key: uuidv4(),
      name: 'scroll',
      event: 'add-op',
      optSelector: e.target == document ? 'html' : optCssSelector(e.target),
      selector : selector || 'html',
      xpath: xpath || '/',
      clientX: e.clientX,
      clientY: e.clientY,
      bubbles: e.bubbles,
      cancelable: e.cancelable,
      scrollTopStart: scrollStartTop,
      scrollLeftStart: scrollStartLeft,
      timeStamp: loadTime +e.timeStamp,
      now: Date.now(),
      frame: getFrameIndex(),
      url: window.location.href,
      time: scrollStartTime,
      value: `${scrollStartTop}, ${scrollStartLeft}`
    }
    console.log(data)
    chrome.runtime.sendMessage(data)

    scrollObject = null
  }

  function updateScrollEvent(e) {
    var scrollTimeMillis = 100
    if (scrollObject == null) {
      scrollObject = e.target == document ? document.scrollingElement : e.target
    }
    else {
      clearTimeout(scrollTimer)
    }
    scrollStartTime = Date.now()
    scrollStartTop = scrollObject.scrollTop
    scrollStartLeft = scrollObject.scrollLeft
    scrollTimer = setTimeout(_=>finishScrollEvent(e), scrollTimeMillis)
  }

  function onScroll(){
    window.__isRecording__.scroll = e=>{
      if(!e.isTrusted) return

      preEventTime = Date.now()
      setTimeout(()=>updateScrollEvent(e), 1);
    }
    window.addEventListener("scroll", window.__isRecording__.scroll, {capture: true,passive: true})
  }

  let preEventTime = Date.now()
  function on(eventName) {
    if(eventName.startsWith('_')) return
    window.__isRecording__[eventName] = e=>{
      if(!e.isTrusted) return

      if(eventName == 'mouseout'){
        preEventTime = Date.now()
        return
      }

      const target = e.target
      const {xpath,selector} = createXPathAndSelector(e.target)
      const data = {
        index: index++,
        key: uuidv4(),
        name: eventName,
        event: 'add-op',
        optSelector: e.target == document ? 'html' : optCssSelector(e.target),
        selector : selector || 'html',
        xpath: xpath || '/',
        tag: target.tagName && target.tagName.toLowerCase(),
        type: target.type && target.type.toLowerCase(),
        clientX: e.clientX,
        clientY: e.clientY,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        metaKey: e.metaKey,
        button: e.button,
        bubbles: e.bubbles,
        cancelable: e.cancelable,
        contentEditable: target.isContentEditable,
        text: e.target.innerText || '',
        timeStamp: loadTime + e.timeStamp,
        now: Date.now(),
        frame: getFrameIndex(),
        url: window.location.href
      }
      if (eventName == 'select') data.selectValue = target.value
      else if (eventName == 'keyup' || eventName == 'keydown'){
        data.keyCode = e.keyCode
        data.keyData = e.key
        data.keyChar = getKey(e.keyCode)

        setTimeout(_=>{
          data.value = target.value
          preEventTime = data.now
          chrome.runtime.sendMessage(data)
        },0)
      }
      else if (eventName == 'input' || eventName == 'change') {
        if (data.tag=='input' || data.tag=='textarea'){
          if(data.type == 'checkbox' || data.type == 'radio')
            data.value = target.checked
          else
            data.value = target.value
        }
        else if(data.tag == 'select'){
          data.value = JSON.stringify([...target.selectedOptions].map(x=>({index:x.index,value:x.value,text:x.text})))
        }
        else
          data.value = data.text
      }
      else if(eventName == 'mouseup' || eventName == 'copy' || eventName == 'cut' || eventName == 'paste' || eventName == 'keydown'){
        data.selection = window.getSelection().toString()
      }
      else if(eventName == 'mousemove'){
        setTimeout(_=>{
          if(data.now == preEventTime){
            console.log(data)
            chrome.runtime.sendMessage(data)
          }
        },3000)
        preEventTime = data.now
        return
      }

      preEventTime = data.now
      chrome.runtime.sendMessage(data)
      //selectonを取る,eventをtimestampでまとめる
      //jsをinjectionする
      //frameはipc+getframeindex
      //座標特定
      //https://github.com/GoogleChrome/puppeteer/blob/master/lib/USKeyboardLayout.js

    }
    window.addEventListener(eventName, window.__isRecording__[eventName], {capture: true,passive: true})
  }

  if(location.href != 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/automation.html'){
//,'mouseout','keyup',
    for(let eventName of ["mousedown","mouseup","mousemove","select","focusin","focusout","click","dblclick","keydown","input","change","submit","copy","cut","paste","mouseout"]){
      on(eventName)
    }
    onScroll()
  }
}
