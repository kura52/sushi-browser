// content scripts
chrome.ipcRenderer = {
  on: (channel, listener) => {
    chrome.runtime.onMessage.addListener((message, sender) => {
      if(!message.ipc || channel != message.channel) return

      listener({}, ...message.args)
    })
  },
  once: (channel, listener) => {
    const handler = (message, sender) => {
      if(!message.ipc || channel != message.channel) return

      listener({}, ...message.args)
      chrome.runtime.onMessage.removeListener(handler)
    }
    chrome.runtime.onMessage.addListener(handler)
  },
  send: (channel, ...args) => {
    chrome.runtime.sendMessage({ipcToBg: true, channel, args})
  }
}


window.__started_ = window.__started_ ? void 0 : 1
var ipc = chrome.ipcRenderer
if(window.__started_){

  const fullscreenListener = e => {
    console.log(3313,e,document.fullscreenElement !== null)
    ipc.send('fullscreen-change',document.fullscreenElement !== null)
  }

  document.addEventListener('fullscreenchange', fullscreenListener)
  document.addEventListener('webkitfullscreenchange', fullscreenListener)

  setTimeout(()=>{
    document.addEventListener('contextmenu', e => {
      if(window.__no_skip_context_menu__){
        window.__no_skip_context_menu__ = false
        return
      }

      e.preventDefault()
      e.stopImmediatePropagation()
      console.log(5555,e)
      const target = e.target
      const linkURL = (target.closest('a') || target).href
      const isFrame = window.top != window
      const selectionText = document.getSelection().toString()

      let mediaFlags = {}, mediaType = 'none', isEditable = false, inputFieldType = 'none', editFlags = {
        canUndo: false,
        canRedo: false,
        canCut: false,
        canCopy: !!selectionText,
        canPaste: false,
        canDelete: false,
        canSelectAll : false,
      }

      const mediaTarget = target.closest('img,video,audio') || target


      if(mediaTarget.tagName == 'AUDIO' || mediaTarget.tagName == 'VIDEO'){
        mediaType = mediaTarget.tagName.toLowerCase()
        mediaFlags = {
          inError: mediaTarget.error,
          isPaused: mediaTarget.paused,
          isMuted: mediaTarget.muted,
          hasAudio: !!mediaTarget.webkitAudioDecodedByteCount,
          isLooping: mediaTarget.loop,
          isControlsVisible: mediaTarget.controls,
          canToggleControls: true,
          canRotate: true
        }
      }
      else if(target.tagName == 'CANVAS'){
        mediaType = target.tagName.toLowerCase()
      }
      else if(mediaTarget.tagName == 'IMG'){
        mediaType = 'image'
      }
      if(target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable){
        const type = target.type && target.type.toLowerCase()
        if(target.tagName == 'INPUT' && (type == 'checkbox' || type == 'radio' ||
          type == 'submit' || type == 'hidden' || type == 'reset' || type == 'button' || type == 'image')){

        }
        else{
          isEditable = true
          editFlags = {
            canUndo: true,
            canRedo: true,
            canCut: !!selectionText,
            canCopy: !!selectionText,
            canPaste: true,
            canDelete: true,
            canSelectAll : true,
          }

          if(type == 'password'){
            inputFieldType = type
          }
          else{
            inputFieldType = 'plainText'
          }
        }
      }

      document.addEventListener('mousedown',e =>{
        ipc.send('contextmenu-webContents-close')
      },{once: true})

      ipc.send('contextmenu-webContents', {
        srcURL: target.src,
        linkURL,
        pageURL: isFrame ? void 0 : location.href,
        frameURL: isFrame ? location.href : void 0,
        linkText: linkURL ? target.innerText : void 0,
        mediaType,
        mediaFlags,
        editFlags,
        isEditable ,
        inputFieldType,
        x: e.x,
        y: e.y,
        screenX: e.screenX,
        screenY: e.screenY,
        selectionText
      })
    })
  },100)

  let preAElemsLength = 0

  // const visitedLinkName = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
  //
  // const setVisitedLinkColor = (force) => {
  //   const aElems = document.getElementsByTagName('a')
  //   const length = aElems.length
  //   if(!force && preAElemsLength == length) return
  //   preAElemsLength = length
  //   const checkElems = {}
  //   for (let i = 0; i < length; i++) {
  //     const ele = aElems[i]
  //     if(ele.classList.contains(visitedLinkName)) continue
  //     const url = ele.href
  //     if (url.startsWith('http')) {
  //       let arr = checkElems[url]
  //       if(arr){
  //         arr.push(ele)
  //       }
  //       else{
  //         checkElems[url] = [ele]
  //       }
  //     }
  //   }
  //   const urls = Object.keys(checkElems)
  //   if(!urls.length) return
  //
  //   const key = Math.random().toString()
  //   ipc.send('get-visited-links', key, urls)
  //   ipc.on(`get-visited-links-reply_${key}`, (e, urls) => {
  //     for (let url of urls) {
  //       for(let ele of checkElems[url]){
  //         ele.classList.add(visitedLinkName)
  //       }
  //     }
  //   })
  // }

  const openTime = Date.now()
  if(location.href.match(/^(http|chrome\-extension)/) && window == window.parent){
    // require('./passwordEvents')
    require('./webviewEvents')
    require('./syncButton')
    require('./inputPopupContentScript.js')

    let mdownEvent
    document.addEventListener('mousedown',e=>{
      mdownEvent = e
      ipc.send('send-to-host', 'webview-mousedown',e.button)
    },{passive: true, capture: true})

    document.addEventListener('mouseup',e=>{
      ipc.send('send-to-host', 'webview-mouseup',e.button)
      // if(mdownEvent && e.target == mdownEvent.target &&
      //   e.button == mdownEvent.button && (e.button == 0 || e.button == 1)){
      //   const ele = e.target.closest('a')
      //   if(ele && ele.href.startsWith('http')){
      //     setTimeout(()=>setVisitedLinkColor(true),200)
      //   }
      // }
    },{passive: true, capture: true})

    let preClientY = -1, checkVideoEvent = {}, beforeRemoveIds = {}
    document.addEventListener('mousemove',e=>{
      // console.log('mousemove')
      if(preClientY != e.clientY){
        ipc.send('send-to-host', 'webview-mousemove', e.clientY)
        // console.log('webview-mousemove', e.clientY)
        preClientY = e.clientY
      }

      if(!checkVideoEvent[e.target] && document.querySelector('video')){
        checkVideoEvent[e.target] = true
        let target
        if(e.target.tagName !== 'VIDEO'){
          const children = [...e.target.children]
          for(const x of children){
            checkVideoEvent[x] = true
            if(x.tagName == "VIDEO"){
              target = x
              console.log(11,target)
              break
            }
          }
          if(!target){
            for(let c of children){
              if(c.children){
                for(const x of [...c.children]){
                  checkVideoEvent[x] = true
                  if(x.tagName == "VIDEO"){
                    target = x
                    console.log(12,target)
                    break
                  }
                }
              }
              if(target) break
            }
            if(!target){
              for(let ele of document.querySelectorAll('video')){
                const r =  ele.getBoundingClientRect()
                if(pointInCheck(r.left, r.top, r.width, r.height, e.clientX, e.clientY)){
                  target = ele
                  console.log(13,target)
                  break
                }
              }
              if(!target) return
            }
          }
        }
        else{
          target = e.target
        }

        console.log(553,target)
        const v = target
        const func = ()=>{

          const existElement = document.querySelector("#maximize-org-video")
          if(existElement){
            clearTimeout(beforeRemoveIds[target])
            beforeRemoveIds[target] = setTimeout(_=>document.body.removeChild(existElement),2000)
            return
          }

          const rect = v.getBoundingClientRect()
          const rStyle = `left:${Math.round(rect.left) + 10}px;top:${Math.round(rect.top) + 10}px`

          const span = document.createElement("span")
          span.innerHTML = v._olds_ ? 'Normal' : 'Maximize'
          span.style.cssText = `${rStyle};z-index: 2147483647;position: absolute;overflow: hidden;border-radius: 8px;background: rgba(50,50,50,0.9);text-shadow: 0 0 2px rgba(0,0,0,.5);transition: opacity .1s cubic-bezier(0.0,0.0,0.2,1);margin: 0;border: 0;font-size: 14px;color: white;padding: 4px 7px;`;
          span.setAttribute("id", "maximize-org-video")

          document.body.appendChild(span)

          span.addEventListener('click', ()=> {
            maximizeInPanel(v)
            const rect = v.getBoundingClientRect()
            span.style.left = `${Math.round(rect.left) + 10}px`
            span.style.top = `${Math.round(rect.top) + 10}px`
            span.innerText = v._olds_ ? 'Normal' : 'Maximize'
            clearTimeout(beforeRemoveIds[target])
            document.body.removeChild(span)
          })

          span.addEventListener('mouseenter', () => span.style.background = 'rgba(80,80,80,0.9)')
          span.addEventListener('mouseleave', () => span.style.background = 'rgba(50,50,50,0.9)')

          beforeRemoveIds[target] = setTimeout(_=>document.body.removeChild(span),2000)
        }

        document.addEventListener('mousemove', e => {
          const r =  v.getBoundingClientRect()
          if(pointInCheck(r.left, r.top, r.width, r.height, e.clientX, e.clientY)){
            func()
          }
        })
        document.addEventListener('mouseleave', e2 =>{
          const r =  v.getBoundingClientRect()
          if(pointInCheck(r.left, r.top, r.width, r.height, e.clientX, e.clientY)){
            const existElement = document.querySelector("#maximize-org-video")
            if(existElement && e2.toElement != existElement){
              clearTimeout(beforeRemoveIds[target])
              document.body.removeChild(existElement)
            }
          }
        })
        func()
      }

    },{passive: true, capture: true})

    window.addEventListener("beforeunload", e=>{
      ipc.send('send-to-host', 'scroll-position',{x:window.scrollX ,y:window.scrollY})
      ipc.send('contextmenu-webContents-close')
      ipc.send('fullscreen-change', false, 1000)
    });

    document.addEventListener("DOMContentLoaded",_=>{
      // const visitedStyle = require('./visitedStyle')
      // setTimeout(()=> visitedStyle(`.${visitedLinkName}`), 0)
      // setVisitedLinkColor()
      // setInterval(()=>setVisitedLinkColor(),1000)
      // const key = Math.random().toString()
      // ipc.send('need-get-inner-text',key)
      // ipc.once(`need-get-inner-text-reply_${key}`,(e,result)=>{
      //   if(result) ipc.send('get-inner-text',location.href,document.title,document.documentElement.innerText)
      // })
      if(location.href.startsWith('https://chrome.google.com/webstore')){
        setInterval(_=>{
          const ele = document.querySelector(".h-e-f-Ra-c.e-f-oh-Md-zb-k")
          if(ele && !ele.innerHTML){
            ele.innerHTML = `<div role="button" class="dd-Va g-c-wb g-eg-ua-Uc-c-za g-c-Oc-td-jb-oa g-c g-c-Sc-ci" aria-label="add to chrome" tabindex="0" style="user-select: none;"><div class="g-c-Hf"><div class="g-c-x"><div class="g-c-R webstore-test-button-label">add to chrome</div></div></div></div>`
            ele.querySelector(".dd-Va.g-c-wb.g-eg-ua-Uc-c-za.g-c-Oc-td-jb-oa.g-c.g-c-Sc-ci").addEventListener('click',_=>ipc.send('add-extension',{id:location.href.split("/").slice(-1)[0].split("?")[0]}))
          }
          let buttons = document.querySelectorAll(".dd-Va.g-c-wb.g-eg-ua-Kb-c-za.g-c-Oc-td-jb-oa.g-c")
          if(buttons && buttons.length){
            for(let button of buttons){
              const loc = button.parentNode.parentNode.parentNode.parentNode.href.split("/").slice(-1)[0].split("?")[0]
              const parent = button.parentNode
              parent.innerHTML = `<div role="button" class="dd-Va g-c-wb g-eg-ua-Kb-c-za g-c-Oc-td-jb-oa g-c" aria-label="add to chrome" tabindex="0" style="user-select: none;"><div class="g-c-Hf"><div class="g-c-x"><div class="g-c-R webstore-test-button-label">add to chrome</div></div></div></div>`
              parent.querySelector(".dd-Va.g-c-wb.g-eg-ua-Kb-c-za.g-c-Oc-td-jb-oa.g-c").addEventListener('click',e=>{
                e.stopImmediatePropagation()
                e.preventDefault()
                ipc.send('add-extension',{id:loc})},true)
            }
          }
        },1000)
      }
      else if(location.href.match(/^https:\/\/addons\.mozilla\.org\/.+?\/firefox/) && !document.querySelector('.Badge.Badge-not-compatible')){
        let url
        const func = _=>ipc.send('add-extension',{url})
        setInterval(_=>{
          const b = document.querySelector('.Button--action.Button--puffy:not(.Button--disabled)')
          if(!b) return
          if(b.href != 'javascript:void(0)') url = b.href

          b.innerText = 'Add to Sushi'
          b.addEventListener('click',func)
          b.href = 'javascript:void(0)'
        },1000)
      }
    })
    // setInterval(()=>setVisitedLinkColor(),1000)
  }

  // function handleDragEnd(evt) {
  //   console.log(evt)
  //   const target = evt.target
  //   if(!target) return
  //
  //   let url,text
  //   if(target.href){
  //     url = target.href
  //     text = target.innerText
  //   }
  //   else if(target.nodeName == "#text"){
  //     ipc.send('send-to-host', "link-drop",{screenX: evt.screenX, screenY: evt.screenY, text:window.getSelection().toString() || target.data})
  //   }
  //   else{
  //     const parent = target.closest("a")
  //     if(parent){
  //       url = parent.href
  //       text = target.innerText
  //     }
  //     else{
  //       url = target.src
  //       text = target.getAttribute('alt')
  //     }
  //   }
  //
  //   ipc.send('send-to-host', "link-drop",{screenX: evt.screenX, screenY: evt.screenY, url,text})
  // }
  // if(location.href.match(/^chrome-extension:\/\/dckpbojndfoinamcdamhkjhnjnmjkfjd\/(favorite|favorite_sidebar)\.html/)){
  //   console.log("favorite")
  //   document.addEventListener("drop", e=>{
  //     e.preventDefault()
  //     e.stopImmediatePropagation()
  //     console.log('drop',e)
  //   }, false)
  //
  //   document.addEventListener("dragend", function( event ) {
  //     event.preventDefault();
  //     event.stopImmediatePropagation()
  //     console.log('dragend',event)
  //   }, false);
  // }
  // else{
  // document.addEventListener('dragend', handleDragEnd, false)
  // }

  const gaiseki = (ax,ay,bx,by) => ax*by-bx*ay
  const pointInCheck = (X,Y,W,H,PX,PY) => gaiseki(-W,0,PX-W-X,PY-Y) < 0 && gaiseki(0,H,PX-X,PY-Y) < 0 && gaiseki(W,0,PX-X,PY-Y-H) < 0 && gaiseki(0,-H,PX-W-X,PY-H-Y) < 0

  function maximizeInPanel(v, enable){
    if(enable == null){
      enable = !v._olds_
    }
    if(enable){
      v._olds_ = {}

      v._olds_.controls = v.controls
      v._olds_.bodyOverflow = document.body.style.overflow
      v._olds_.width = v.style.width
      v._olds_.minWidth = v.style.minWidth
      v._olds_.maxWidth = v.style.maxWidth
      v._olds_.height = v.style.height
      v._olds_.minHeight = v.style.minHeight
      v._olds_.maxHeight = v.style.maxHeight
      v._olds_.position = v.style.position
      v._olds_.zIndex = v.style.zIndex
      v._olds_.backgroundColor = v.style.backgroundColor
      v._olds_.display = v.style.display
      v._olds_.left = v.style.left
      v._olds_.margin = v.style.margin
      v._olds_.padding = v.style.padding
      v._olds_.border = v.style.border
      v._olds_.outline = v.style.outline


      v.setAttribute('controls', true)
      document.body.style.setProperty('overflow','hidden' ,'important')

      v.style.setProperty('width','100vw' ,'important')
      v.style.setProperty('min-width','100vw' ,'important')
      v.style.setProperty('max-width','100vw' ,'important')
      v.style.setProperty('height','100vh' ,'important')
      v.style.setProperty('min-height','100vh' ,'important')
      v.style.setProperty('max-height','100vh' ,'important')
      v.style.setProperty('position','fixed' ,'important')
      v.style.setProperty('z-index','21474836476' ,'important')
      v.style.setProperty('background-color','black' ,'important')
      v.style.setProperty('display','block' ,'important')
      v.style.setProperty('left','0' ,'important')
      v.style.setProperty('top','0' ,'important')
      v.style.setProperty('margin','0' ,'important')
      v.style.setProperty('padding','0' ,'important')
      v.style.setProperty('border','0' ,'important')
      v.style.setProperty('outline','0' ,'important')

      v._olds_.parentNode = v.parentNode

      const replaceNode = document.createElement('span')
      v.parentNode.insertBefore(replaceNode, v)

      v._olds_.replaceNode = replaceNode

      document.documentElement.insertBefore(v, document.body)

    }
    else{
      v.controls = v._olds_.controls
      document.body.style.overflow = v._olds_.bodyOverflow
      v.style.width = v._olds_.width
      v.style.minWidth = v._olds_.minWidth
      v.style.maxWidth = v._olds_.maxWidth
      v.style.height = v._olds_.height
      v.style.minHeight = v._olds_.minHeight
      v.style.maxWidth = v._olds_.maxWidth
      v.style.position = v._olds_.position
      v.style.zIndex = v._olds_.zIndex
      v.style.backgroundColor = v._olds_.backgroundColor
      v.style.display = v._olds_.display
      v.style.left = v._olds_.left
      v.style.margin = v._olds_.margin
      v.style.padding = v._olds_.padding
      v.style.border = v._olds_.border
      v.style.outline = v._olds_.outline

      v._olds_.parentNode.replaceChild(v, v._olds_.replaceNode)

      delete v._olds_
    }
  }

  let timer
  window.addEventListener('scroll', (e)=>{
    if(window.__scrollSync__ !== 0 || window.__scrollSync__ === (void 0)) return
    ipc.send('send-to-host', "webview-scroll",{
      top: e.target.scrollingElement ? e.target.scrollingElement.scrollTop : undefined,
      left: e.target.scrollingElement ? e.target.scrollingElement.scrollLeft : 0,
      scrollbar: window.innerHeight - document.documentElement.clientHeight
    })
  },{passive:true})


  document.addEventListener('wheel',e=>{
    if(e.ctrlKey || e.metaKey){
      e.preventDefault()
      ipc.send('menu-or-key-events',e.deltaY > 0 ? 'zoomOut' : 'zoomIn')
    }
  }, {passive: false})

  let mainState
  const codeSet = new Set([8,9,13,16,17,18,33,34,37,38,39,40,45,46,48,49,50,51,52,53,54,55,56,57,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,96,97,98,99,100,101,102,103,104,105,186,187,188,189,190,191,192,219,220,221,222])
  document.addEventListener('keydown',e=>{
    if(mainState){
      const addInput = {}
      if(e.ctrlKey) addInput.ctrlKey = true
      if(e.metaKey) addInput.metaKey = true
      if(e.shiftKey) addInput.shiftKey = true
      if(e.altKey) addInput.altKey = true
      if(Object.keys(addInput).length || !codeSet.has(e.keyCode)){
        const name = mainState[JSON.stringify({code: e.code.toLowerCase().replace('arrow','').replace('escape','esc'),...addInput})] || mainState[JSON.stringify({key: e.key.toLowerCase().replace('arrow','').replace('escape','esc'),...addInput})]
        if(name){
          ipc.send('menu-or-key-events',name)
          console.log(name)
          e.preventDefault()
          e.stopImmediatePropagation()
        }
      }
    }
    ipc.send('send-to-host', 'webview-keydown',{key: e.key, keyCode: e.keyCode, which: e.which, button: e.button, ctrlKey: e.ctrlKey, metaKey: e.metaKey,altKey: e.altKey})
    },{capture: true})

  function streamFunc(val){
    window._mediaElements_ = window._mediaElements_ || {}
    if(window._mediaIntervalId) clearInterval(window._mediaIntervalId)
    window._mediaIntervalId = setInterval(_=>{
      for(let stream of document.querySelectorAll('video,audio')){
        const audioCtx = new (window.AudioContext)();
        let gainNode = window._mediaElements_[stream]
        if(!gainNode){
          const source = audioCtx.createMediaElementSource(stream);
          window._mediaElements_[stream] = source
          gainNode = audioCtx.createGain();
          window._mediaElements_[stream] = gainNode
          source.connect(gainNode);
          gainNode.connect(audioCtx.destination);
        }
        if(gainNode.gain.value != val/10.0) gainNode.gain.value = val/10.0;
      }
    },500)
  }

  const key = Math.random().toString()
  ipc.send("get-main-state",key,['tripleClick','alwaysOpenLinkNewTab','themeColorChange','isRecording','isVolumeControl',
    'keepAudioSeekValueVideo','rectangularSelection','fullscreenTransitionKeep','fullScreen','rockerGestureLeft','rockerGestureRight',
    'inputHistory','inputHistoryMaxChar','hoverStatusBar','hoverBookmarkBar','ALL_KEYS2'])
  ipc.once(`get-main-state-reply_${key}`,(e,data)=> {
    mainState = data
    if(data.fullscreenTransitionKeep){
      let full = data.fullScreen ? true : false
      let preV = "_"
      setInterval(_=>{
        const v = document.querySelector('video')
        if(full && v && v.src && v.src != preV){
          if(v.scrollWidth == window.innerWidth || v.scrollHeight == window.innerHeight || v.webkitDisplayingFullscreen){}
          else{
            const fullscreenButton = document.querySelector('.ytp-fullscreen-button,.fullscreenButton,.button-bvuiFullScreenOn,.fullscreen-icon,.full-screen-button,.np_ButtonFullscreen,.vjs-fullscreen-control,.qa-fullscreen-button,[data-testid="fullscreen_control"],.vjs-fullscreen-control,.EnableFullScreenButton,.DisableFullScreenButton,.mhp1138_fullscreen,button.fullscreenh,.screenFullBtn,.player-fullscreenbutton')
            if(fullscreenButton){
              const callback = e => {
                e.stopImmediatePropagation()
                e.preventDefault()
                document.removeEventListener('mouseup',callback ,true)
                fullscreenButton.click()
                if(location.href.startsWith('https://www.youtube.com')){
                  let retry = 0
                  const id = setInterval(_=>{
                    if(retry++>500) clearInterval(id)
                    const e = document.querySelector('.html5-video-player').classList
                    if(!e.contains('ytp-autohide')){
                      // e.add('ytp-autohide')
                      if(document.querySelector('.ytp-fullscreen-button.ytp-button').getAttribute('aria-expanded') == 'true'){
                        v.click()
                      }
                    }
                  },10)
                }
              }
              document.addEventListener('mouseup',callback ,true);
              setTimeout(_=>ipc.send('send-to-host', 'full-screen-mouseup'),500)
            }
            else{
              const callback = e => {
                e.stopImmediatePropagation()
                e.preventDefault()
                document.removeEventListener('mouseup',callback ,true)
                v.webkitRequestFullscreen()
              }
              let i = 0
              const cId = setInterval(_=>{
                document.addEventListener('mouseup',callback ,true);
                ipc.send('send-to-host', 'full-screen-mouseup')
                if(i++ == 5){
                  clearInterval(cId)
                }
              },100)
            }
          }
          preV = v.src
        }

        if(v && v.src){
          const currentFull = v.scrollWidth == window.innerWidth || v.scrollHeight == window.innerHeight || v.webkitDisplayingFullscreen
          if(v && full != currentFull){
            full = currentFull
            if(full){
              ipc.send("full-screen-html",true)
            }
            else{
              ipc.send("full-screen-html",false)
            }
          }
        }
      },500)
    }
    if (data.tripleClick) {
      window.addEventListener('click', e => {
        if (e.detail === 3) {
          window.scrollTo(e.pageX, window.scrollY);
        }
      }, {passive: true})
    }
    if (data.alwaysOpenLinkNewTab != 'speLinkNone' || data.themeColorChange) {
      document.addEventListener("DOMContentLoaded",_=>{
        if(data.alwaysOpenLinkNewTab != 'speLinkNone'){
          const href = location.href
          const func = _=> {
            for (let link of document.querySelectorAll('a:not([target="_blank"])')) {
              if (link.href == "") {
              }
              else if (data.alwaysOpenLinkNewTab == 'speLinkAllLinks') {
                link.target = "_blank"
                link.dataset.lockTab = "1"
              }
              else if (link.origin != "null" && !href.startsWith(link.origin)) {
                link.target = "_blank"
                link.dataset.lockTab = "1"
              }
            }
          }
          func()
          setInterval(func,500)
        }
        if(data.themeColorChange){
          const rgbaFromStr = function (rgba) {
            if (!rgba) {
              return undefined
            }
            return rgba.split('(')[1].split(')')[0].split(',')
          }
          const distance = function (v1, v2) {
            let d = 0
            for (let i = 0; i < v2.length; i++) {
              d += (v1[i] - v2[i]) * (v1[i] - v2[i])
            }
            return Math.sqrt(d)
          }
          const getElementColor = function (el) {
            const currentColorRGBA = window.getComputedStyle(el).backgroundColor
            const currentColor = rgbaFromStr(currentColorRGBA)
            // Ensure that the selected color is not too similar to an inactive tab color
            const threshold = 50
            if (currentColor !== undefined &&
              Number(currentColor[3]) !== 0 &&
              distance(currentColor, [199, 199, 199]) > threshold) {
              return currentColorRGBA
            }
            return undefined
          }
          // Determines a good tab color
          const computeThemeColor = function () {
            // Use y = 3 to avoid hitting a border which are often gray
            const samplePoints = [[3, 3], [window.innerWidth / 2, 3], [window.innerWidth - 3, 3]]
            const els = []
            for (const point of samplePoints) {
              const el = document.elementFromPoint(point[0], point[1])
              if (el) {
                els.push(el)
                if (el.parentElement) {
                  els.push(el.parentElement)
                }
              }
            }
            els.push(document.body)
            for (const el of els) {
              if (el !== document.documentElement && el instanceof window.Element) {
                const themeColor = getElementColor(el)
                if (themeColor) {
                  return themeColor
                }
              }
            }
            return undefined
          }

          if(window.top == window.self) {
            ipc.send('send-to-host', 'theme-color-computed', computeThemeColor())
          }
        }
      })
    }
    if (data.isRecording) {
      Function(data.isRecording)()
    }
    if(data.isVolumeControl !== void 0){
      streamFunc(data.isVolumeControl)
    }

    if(data.keepAudioSeekValueVideo){
      const diffArray = (arr1, arr2)=>arr1.filter(e=>!arr2.includes(e))
      let pre = []
      const id = setInterval(_=>{
        try{
          const volume = localStorage.getItem("vol")
          if(volume !== null){
            const videos = [...document.querySelectorAll('video')]
            const srcs = videos.map(v=>v.src)
            if(diffArray(pre,srcs).length || diffArray(srcs,pre).length){
              pre = srcs
              for(let v of videos){
                let i = 0
                const id2 = setInterval(_=>{
                  if(i++ > 300) clearInterval(id2)
                  v.volume = parseFloat(volume)
                },10)
              }
            }
          }
        }catch(e){
          clearInterval(id)
        }
      },100)
    }
    if(data.rectangularSelection){
      const RectangularSelection = require('./RectangularSelection')
      new RectangularSelection()
    }

    if(data.rockerGestureLeft != 'none' || data.rockerGestureRight != 'none'){
      let downRight

      document.addEventListener('contextmenu',e=>{
        if(!downRight || downRight == "send"){
          e.stopImmediatePropagation()
          e.preventDefault()
        }
        downRight = void 0
      },false)

      document.addEventListener('mousedown',e=>{
        if(e.button === 0 && e.buttons == 3 && data.rockerGestureLeft != 'none'){
          ipc.send('menu-command',data.rockerGestureLeft)
          e.stopImmediatePropagation()
          e.preventDefault()
          downRight = 'send'
          return false
        }
        else if(e.button === 2){
          downRight = 'on'
          if(e.buttons == 3 && data.rockerGestureRight != 'none'){
            ipc.send('menu-command',data.rockerGestureRight)
            e.stopImmediatePropagation()
            e.preventDefault()
            downRight = 'send'
            return false
          }
        }
      },false)
    }

    if(data.inputHistory && !location.href.startsWith('chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd')){
      require('./inputHistory')(data.inputHistoryMaxChar)
    }
    // if(data.hoverStatusBar || data.hoverBookmarkBar){
    //   document.addEventListener('mousemove',e=>{
    //     ipc.send('send-to-host', 'webview-mousemove',e.clientY)
    //   },{passive:true})
    // }

  })


//style setting
  let styleVal
  if((styleVal = localStorage.getItem('meiryo')) !== null){
    if(styleVal === "true"){
      setTimeout(_=>{
        const css = document.createElement('style')
        const rule = document.createTextNode('html{ font-family: Arial, "メイリオ", sans-serif}')
        css.appendChild(rule)
        const head = document.getElementsByTagName('head')
        if(head[0]) head[0].appendChild(css)
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
        const head = document.getElementsByTagName('head')
        if(head[0]) head[0].appendChild(css)
      }
    })
  }


  let isFirst = true
  const videoFunc = (e,inputs)=>{
    if(!isFirst) return
    isFirst = false

    const matchReg = (key) => location.href.match(new RegExp(inputs[`regex${key.charAt(0).toUpperCase()}${key.slice(1)}`],'i'))

    for(let url of (inputs.blackList || [])){
      if(url && location.href.startsWith(url)) return
    }


    const popUp = (v,text)=>{
      const rect = v.getBoundingClientRect()
      const rStyle = `left:${Math.round(rect.left)+20}px;top:${Math.round(rect.top)+20}px`

      const span = document.createElement("span")
      span.innerHTML = text
      span.style.cssText = `${rStyle};padding: 5px 9px;z-index: 99999999;position: absolute;overflow: hidden;border-radius: 2px;background: rgba(28,28,28,0.9);text-shadow: 0 0 2px rgba(0,0,0,.5);transition: opacity .1s cubic-bezier(0.0,0.0,0.2,1);margin: 0;border: 0;font-size: 20px;color: white;padding: 10px 15px;`;
      span.setAttribute("id", "popup-org-video")
      const existElement = document.querySelector("#popup-org-video")
      if(existElement){
        document.body.removeChild(existElement)
      }
      document.body.appendChild(span)
      setTimeout(_=>document.body.removeChild(span),2000)
    }

    let nothing
    const eventHandler = async (e,name,target)=>{
      const v = target || e.target
      if(name == 'playOrPause'){
        v.paused ? v.play() : v.pause()
      }
      else if(name == 'fullscreen'){
        // if(location.href.startsWith('https://www.youtube.com')){
        //   const newStyle = document.createElement('style')
        //   newStyle.type = "text/css"
        //   document.head.appendChild(newStyle)
        //   const css = document.styleSheets[0]
        //
        //   const idx = document.styleSheets[0].cssRules.length;
        //   css.insertRule(".ytp-popup.ytp-generic-popup { display: none; }", idx)
        // }
        // const isFullscreen = v.scrollWidth == window.innerWidth || v.scrollHeight == window.innerHeight
        // const isFull = await new Promise(r=>{
        //   const key = Math.random().toString()
        //   ipc.send('toggle-fullscreen2',void 0, key)
        //   ipc.once(`toggle-fullscreen2-reply_${key}`, (e,result) => r(result))
        // })
        // console.log(isFullscreen,isFull,v.offsetWidth, window.innerWidth,v.offsetHeight, window.innerHeight)
        // if(isFullscreen == isFull){
        //   e.preventDefault()
        //   e.stopImmediatePropagation()
        //   return
        // }
        const fullscreenButton = document.querySelector('.ytp-fullscreen-button,.fullscreenButton,.button-bvuiFullScreenOn,.fullscreen-icon,.full-screen-button,.np_ButtonFullscreen,.vjs-fullscreen-control,.qa-fullscreen-button,[data-testid="fullscreen_control"],.vjs-fullscreen-control,.EnableFullScreenButton,.DisableFullScreenButton,.mhp1138_fullscreen,button.fullscreenh,.screenFullBtn,.player-fullscreenbutton')
        console.log(fullscreenButton,v.webkitDisplayingFullscreen)
        if(fullscreenButton){
          fullscreenButton.click()
        }
        else{
          if(v.webkitDisplayingFullscreen){
            v.webkitExitFullscreen()
          }
          else{
            v.webkitRequestFullscreen()
          }
        }
        // maximizeInPanel(v)
      }
      else if(name == 'exitFullscreen'){
        // const isFull = await new Promise(r=>{
        //   const key = Math.random().toString()
        //   ipc.send('toggle-fullscreen2',1, key)
        //   ipc.once(`toggle-fullscreen2-reply_${key}`, (e,result) => r(result))
        // })
        // const isFullscreen = v.offsetWidth == window.innerWidth || v.offsetHeight == window.innerHeight
        // if(isFullscreen == isFull) return
        const fullscreenButton = document.querySelector('.ytp-fullscreen-button,.fullscreenButton,.button-bvuiFullScreenOn,.fullscreen-icon,.full-screen-button,.np_ButtonFullscreen,.vjs-fullscreen-control,.qa-fullscreen-button,[data-testid="fullscreen_control"],.vjs-fullscreen-control,.EnableFullScreenButton,.DisableFullScreenButton,.mhp1138_fullscreen,button.fullscreenh,.screenFullBtn,.player-fullscreenbutton')
        if(fullscreenButton){
          fullscreenButton.click()
        }
        else{
          if(v.webkitDisplayingFullscreen){
            v.webkitExitFullscreen()
          }
          else{
            v.webkitRequestFullscreen()
          }
        }

        // maximizeInPanel(v)
      }
      else if(name == 'mute'){
        v.muted = !v.muted
        popUp(v,`Mute: ${v.muted ? "ON" : "OFF"}`)
      }
      else if(name == 'rewind1'){
        v.currentTime -= parseInt(inputs.mediaSeek1)
      }
      else if(name == 'rewind2'){
        v.currentTime -= parseInt(inputs.mediaSeek2)
      }
      else if(name == 'rewind3'){
        v.currentTime -= parseInt(inputs.mediaSeek3)
      }
      else if(name == 'forward1'){
        v.currentTime += parseInt(inputs.mediaSeek1)
      }
      else if(name == 'forward2'){
        v.currentTime += parseInt(inputs.mediaSeek2)
      }
      else if(name == 'forward3'){
        v.currentTime += parseInt(inputs.mediaSeek3)
      }
      else if(name == 'frameStep'){
        v.currentTime += 1 / 30
      }
      else if(name == 'frameBackStep'){
        v.currentTime -= 1 / 30
      }
      else if(name == 'decSpeed'){
        const seek = parseInt(inputs.speedSeek)/100.0
        v.playbackRate -= seek
        popUp(v,`Speed: ${Math.round(v.playbackRate * 100)}%`)
      }
      else if(name == 'incSpeed'){
        const seek = parseInt(inputs.speedSeek)/100.0
        v.playbackRate += seek
        popUp(v,`Speed: ${Math.round(v.playbackRate * 100)}%`)
      }
      else if(name == 'normalSpeed'){
        v.playbackRate = 1
        popUp(v,`Speed: ${Math.round(v.playbackRate * 100)}%`)
      }
      else if(name == 'halveSpeed'){
        v.playbackRate *= 0.5
        popUp(v,`Speed: ${Math.round(v.playbackRate * 100)}%`)
      }
      else if(name == 'doubleSpeed'){
        v.playbackRate *= 2
        popUp(v,`Speed: ${Math.round(v.playbackRate * 100)}%`)
      }
      else if(name == 'decreaseVolume'){
        const band = parseInt(inputs.audioSeek)
        const seek = band/100.0
        v.volume = Math.max(Math.round(v.volume*100/band)*band/100 - seek, 0)
        popUp(v,`Volume: ${Math.round(v.volume * 100)}%`)
        if(inputs.keepAudioSeekValue) localStorage.setItem("vol",v.volume)
      }
      else if(name == 'increaseVolume'){
        const band = parseInt(inputs.audioSeek)
        const seek = band/100.0
        v.volume = Math.min(Math.round(v.volume*100/band)*band/100 + seek, 1)
        popUp(v,`Volume: ${Math.round(v.volume * 100)}%`)
        if(inputs.keepAudioSeekValue) localStorage.setItem("vol",v.volume)
      }
      else if(name == 'plRepeat'){
        v.loop = !v.loop
        popUp(v,`Loop: ${v.loop ? "ON" : "OFF"}`)
      }
      else{
        nothing = true
      }
      if(!nothing){
        e.preventDefault()
        e.stopImmediatePropagation()
        return false
      }
    }

    if(inputs.click && matchReg('click')) {
      document.addEventListener('click', e => {
        let target = e.target
        if(e.target.tagName !== 'VIDEO'){
          const children = [...e.target.children]
          target = children.find(x=>x.tagName == "VIDEO")
          if(!target){
            for(let c of children){
              target = c.children && [...c.children].find(x=>x.tagName == "VIDEO")
              if(target) break
            }
            if(!target){
              for(let ele of document.querySelectorAll('video')){
                const r =  ele.getBoundingClientRect()
                if(pointInCheck(r.left, r.top, r.width, r.height, e.clientX, e.clientY)){
                  target = ele
                  break
                }
              }
              if(!target) return
            }
          }
        }
        if (e.which == 1) {
          eventHandler(e, inputs.click,target)
        }
      }, true)
    }

    if(inputs.dbClick && matchReg('dbClick')){
      document.addEventListener('dblclick',e=>{
        let target = e.target
        if(e.target.tagName !== 'VIDEO'){
          const children = [...e.target.children]
          target = children.find(x=>x.tagName == "VIDEO")
          if(!target){
            for(let c of children){
              target = c.children && [...c.children].find(x=>x.tagName == "VIDEO")
              if(target) break
            }
            if(!target){
              for(let ele of document.querySelectorAll('video')){
                const r =  ele.getBoundingClientRect()
                if(pointInCheck(r.left, r.top, r.width, r.height, e.clientX, e.clientY)){
                  target = ele
                  break
                }
              }
              if(!target) return
            }
          }
        }
        eventHandler(e,inputs.dbClick,target)
      },true)
    }

    if((inputs.wheelMinus && matchReg('wheelMinus')) ||
      (inputs.shiftWheelMinus && matchReg('shiftWheelMinus')) ||
      (inputs.ctrlWheelMinus && matchReg('ctrlWheelMinus')) ||
      (inputs.shiftCtrlWheelMinus && matchReg('shiftCtrlWheelMinus'))){
      const minusToPlus = {rewind1: 'forward1', decSpeed: 'incSpeed', decreaseVolume: 'increaseVolume',frameBackStep: 'frameStep'}
      const modify = inputs.reverseWheel ? -1 : 1
      document.addEventListener('wheel',e=>{
        let target = e.target
        if(e.target.tagName !== 'VIDEO'){
          const children = [...e.target.children]
          target = children.find(x=>x.tagName == "VIDEO")
          if(!target){
            for(let c of children){
              target = c.children && [...c.children].find(x=>x.tagName == "VIDEO")
              if(target) break
            }
            if(!target){
              for(let ele of document.querySelectorAll('video')){
                const r =  ele.getBoundingClientRect()
                if(pointInCheck(r.left, r.top, r.width, r.height, e.clientX, e.clientY)){
                  target = ele
                  break
                }
              }
              if(!target) return
            }
          }
        }
        if(e.ctrlKey || e.metaKey){
          if(e.shiftKey){
            eventHandler(e,e.deltaY * modify > 0 ? minusToPlus[inputs.shiftCtrlWheelMinus] : inputs.shiftCtrlWheelMinus,target)
          }
          else{
            eventHandler(e,e.deltaY * modify > 0 ? minusToPlus[inputs.ctrlWheelMinus] : inputs.ctrlWheelMinus,target)
          }
        }
        else if(e.shiftKey){
          eventHandler(e,e.deltaY * modify > 0 ? minusToPlus[inputs.shiftWheelMinus] : inputs.shiftWheelMinus,target)
        }
        else{
          eventHandler(e,e.deltaY * modify > 0 ? minusToPlus[inputs.wheelMinus] : inputs.wheelMinus,target)
        }
      },{capture: true, passive: false})
    }

    if(inputs.enableKeyDown){
      document.addEventListener('keydown',e=>{
        let target
        if(e.target.tagName !== 'VIDEO'){
          const children = [...e.target.children]
          target = children.find(x=>x.tagName == "VIDEO")
          if(!target){
            for(let c of children){
              target = c.children && [...c.children].find(x=>x.tagName == "VIDEO")
              if(target) break
            }
            if(!target){
              target = document.querySelector('video')
              if(!target) return
            }
          }
        }
        const addInput = {}
        if(e.ctrlKey) addInput.ctrlKey = true
        if(e.metaKey) addInput.metaKey = true
        if(e.shiftKey) addInput.shiftKey = true
        if(e.altKey) addInput.altKey = true
        const name = inputs[JSON.stringify({code: e.code.toLowerCase().replace('arrow','').replace('escape','esc'),...addInput})] || inputs[JSON.stringify({key: e.key.toLowerCase().replace('arrow','').replace('escape','esc'),...addInput})]

        if(matchReg(name)) eventHandler(e,name,target)
      },true)
    }
  }

  let retry = 0
  let receivedVideoEvent = setInterval(async _=>{
    if(document.querySelector('video,audio')){
      const [inputs] = await new Promise(r=>{
        const key = Math.random().toString()
        ipc.send('get-sync-main-states',['inputsVideo'],key)
        ipc.once(`get-sync-main-states-reply_${key}`, (e,result) => r(result))
      })
      chrome.runtime.sendMessage({ event: "video-event",inputs })
      clearInterval(receivedVideoEvent)
    }
    if(retry++ > 3) clearInterval(receivedVideoEvent)
  },1000)

  ipc.once('on-video-event',(e,inputs)=>{
    clearInterval(receivedVideoEvent)
    chrome.runtime.sendMessage({ event: "video-event",inputs })
  })

  ipc.on('on-stream-event',(e,val)=>{
    chrome.runtime.sendMessage({ event: "stream-event",val })
  })
  chrome.runtime.onMessage.addListener(inputs=>{
    if(inputs.stream){
      streamFunc(inputs.val)
    }
    else if(inputs.video){
      videoFunc({},inputs.val)
    }
    return false
  })

  ipc.on('mobile-scroll',(e,{type,code,optSelector,selector,move})=>{
    if(type == 'init'){
      if(!window.__scroll__){
        window.__scroll__ = true

        Function(code)()

        let pre = 0
        document.addEventListener('scroll',(e)=>{
          if(Date.now() - window.__scroll_time__ < 300) return
          const w = window.innerWidth
          const h = window.innerHeight
          const scrollY = window.scrollY
          const ele = document.elementFromPoint(Math.min(300,w / 2),h/2)
          console.log(e,ele)
          chrome.ipcRenderer.send('sync-mobile-scroll',window.__select__(ele), window.__simpleSelect__(ele), (scrollY - pre)/document.body.scrollHeight)
          pre = scrollY
        },{capture: true, passive: true})
      }
    }
    else if(type == 'scroll'){
      console.log(4324324)
      const scrollY = window.scrollY
      let ele = document.querySelector(optSelector)
      window.__scroll_time__ = Date.now()
      if(ele){
        ele.scrollIntoViewIfNeeded()
      }
      else{
        ele = document.querySelector(selector)
        if(ele) ele.scrollIntoViewIfNeeded()
      }
      if(scrollY == window.scrollY){
        if(Date.now() - window.__into_view__ > 400){
          window.scrollTo(window.scrollX, window.scrollY + move * document.body.scrollHeight)
        }
      }
      else if(ele){
        window.__into_view__ = Date.now()
      }
    }
  })

  ipc.on('execute-script-in-isolation-world', (e, key, code) => {
    ipc.send(`execute-script-in-isolation-world-reply_${key}`, Function(`return ${code}`)())
  })

  ipc.on('no-skip-context-menu', (e, key)=>{
    window.__no_skip_context_menu__ = true
    ipc.send(`no-skip-context-menu-reply_${key}`)
  })
}
