window.__started_ = window.__started_ ? void 0 : 1
var ipc = chrome.ipcRenderer
if(window.__started_){
  const openTime = Date.now()
  if(location.href.startsWith('http') && window == window.parent){
    document.addEventListener("DOMContentLoaded",_=>{
      // const key = Math.random().toString()
      // ipc.send('need-get-inner-text',key)
      // ipc.once(`need-get-inner-text-reply_${key}`,(e,result)=>{
      //   if(result) ipc.send('get-inner-text',location.href,document.title,document.documentElement.innerText)
      // })
      if(location.href.startsWith('https://chrome.google.com/webstore')){
        setInterval(_=>{
          const ele = document.querySelector(".h-e-f-Ra-c.e-f-oh-Md-zb-k")
          if(ele && !ele.innerHTML){
            ele.innerHTML = `<div role="button" class="dd-Va g-c-wb g-eg-ua-Uc-c-za g-c-Oc-td-jb-oa g-c g-c-Sc-ci" aria-label="add to chrome" tabindex="0" style="user-select: none;"><div class="g-c-Hf"><div class="g-c-x"><div class="g-c-s g-c-Zi-s g-c-s-L-Si"></div><div class="g-c-R webstore-test-button-label">add to chrome</div></div></div></div>`
            ele.querySelector(".dd-Va.g-c-wb.g-eg-ua-Uc-c-za.g-c-Oc-td-jb-oa.g-c.g-c-Sc-ci").addEventListener('click',_=>ipc.send('add-extension',{id:location.href.split("/").slice(-1)[0].split("?")[0]}))
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
                ipc.send('add-extension',{id:loc})},true)
            }
          }
        },1000)
      }
      else if(location.href.match(/^https:\/\/addons\.mozilla\.org\/.+?\/firefox/) && !document.querySelector('.Badge.Badge-not-compatible')){
        let url
        setInterval(_=>{
          const b = document.querySelector('.Button--confirm.Button--puffy')
          if(!b) return
          b.classList.remove('Button--confirm')
          b.classList.add('InstallButton-button')
          b.classList.add('Button--action')
          b.innerText = 'Add to Sushi'

          const isDarwin = navigator.userAgent.includes('Mac OS X')
          const isWin = navigator.userAgent.includes('Windows')
          const files = Object.values(JSON.parse(document.querySelector('#redux-store-state').textContent).addons.byID)[0].platformFiles
          const url = (files['all'] || files[isWin ? 'windows' : isDarwin ? 'mac' : 'linux']).url + 'dp-btn-primary'

          b.addEventListener('click',_=>ipc.send('add-extension',{url}))
          b.href = 'javascript:void(0)'
        },1000)
      }
    })
  }

  function handleDragEnd(evt) {
    console.log(evt)
    const target = evt.target
    if(!target) return

    let url,text
    if(target.href){
      url = target.href
      text = target.innerText
    }
    else if(target.nodeName == "#text"){
      ipc.sendToHost("link-drop",{screenX: evt.screenX, screenY: evt.screenY, text:window.getSelection().toString() || target.data})
    }
    else{
      const parent = target.closest("a")
      if(parent){
        url = parent.href
        text = target.innerText
      }
      else{
        url = target.src
        text = target.getAttribute('alt')
      }
    }

    ipc.sendToHost("link-drop",{screenX: evt.screenX, screenY: evt.screenY, url,text})
  }
  // if(location.href.match(/^chrome-extension:\/\/dckpbojndfoinamcdamhkjhnjnmjkfjd\/(favorite|favorite_sidebar)\.html/)){
  //   console.log("favorite")
  //   document.addEventListener("drop", e=>{
  //     e.preventDefault()
  //     e.stopPropagation()
  //     console.log('drop',e)
  //   }, false)
  //
  //   document.addEventListener("dragend", function( event ) {
  //     event.preventDefault();
  //     event.stopPropagation()
  //     console.log('dragend',event)
  //   }, false);
  // }
  // else{
    document.addEventListener('dragend', handleDragEnd, false)
  // }



  let timer
  window.addEventListener('scroll', (e)=>{
    if(window.__scrollSync__ !== 0 || window.__scrollSync__ === (void 0)) return
    ipc.sendToHost("webview-scroll",{
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
  })

  const key = Math.random().toString()
  ipc.send("get-main-state",key,['tripleClick','alwaysOpenLinkNewTab','themeColorChange','isRecording','isVolumeControl'])
  ipc.once(`get-main-state-reply_${key}`,(e,data)=> {
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
            ipc.sendToHost('theme-color-computed', computeThemeColor())
          }
        }
      })
    }
    if (data.isRecording) {
      Function(data.isRecording)()
    }
    if(data.isVolumeControl !== void 0){
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
          if(gainNode.gain.value != data.isVolumeControl/10.0) gainNode.gain.value = data.isVolumeControl/10.0;
        }
      },500)
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
  const videoFunc = (e,inputs)=>{
    for(let url of (inputs.blackList || [])){
      if(url && location.href.startsWith(url)) return
    }

    const gaiseki = (ax,ay,bx,by) => ax*by-bx*ay
    const pointInCheck = (X,Y,W,H,PX,PY) => gaiseki(-W,0,PX-W-X,PY-Y) < 0 && gaiseki(0,H,PX-X,PY-Y) < 0 && gaiseki(W,0,PX-X,PY-Y-H) < 0 && gaiseki(0,-H,PX-W-X,PY-H-Y) < 0

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
    const eventHandler = (e,name,target)=>{
      const v = target || e.target
      if(name == 'playOrPause'){
        v.paused ? v.play() : v.pause()
      }
      else if(name == 'fullscreen'){
        if(location.href.startsWith('https://www.youtube.com')){
          const newStyle = document.createElement('style')
          newStyle.type = "text/css"
          document.head.appendChild(newStyle)
          const css = document.styleSheets[0]

          const idx = document.styleSheets[0].cssRules.length;
          css.insertRule(".ytp-popup.ytp-generic-popup { display: none; }", idx)
        }
        const isFullscreen = v.scrollWidth == window.innerWidth || v.scrollHeight == window.innerHeight
        const isFull = ipc.sendSync('toggle-fullscreen-sync')
        console.log(isFullscreen,isFull,v.offsetWidth, window.innerWidth,v.offsetHeight, window.innerHeight)
        if(isFullscreen == isFull){
          e.preventDefault()
          e.stopPropagation()
          return
        }
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
      }
      else if(name == 'exitFullscreen'){
        const isFull = ipc.send('toggle-fullscreen-sync',1)
        const isFullscreen = v.offsetWidth == window.innerWidth || v.offsetHeight == window.innerHeight
        if(isFullscreen == isFull) return
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
        v.playbackRate -= 0.1
        popUp(v,`Speed: ${Math.round(v.playbackRate * 100)}%`)
      }
      else if(name == 'incSpeed'){
        v.playbackRate += 0.1
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
        v.volume -= 0.1
        popUp(v,`Volume: ${Math.round(v.volume * 100)}%`)
      }
      else if(name == 'increaseVolume'){
        v.volume += 0.1
        popUp(v,`Volume: ${Math.round(v.volume * 100)}%`)
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
        e.stopPropagation()
      }
    }

    if(inputs.click) {
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

    if(inputs.dbClick){
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

    if(inputs.wheelMinus || inputs.shiftWheelMinus || inputs.ctrlWheelMinus|| inputs.shiftCtrlWheelMinus){
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
      },true)
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
            if(!target) return
          }
        }
        const addInput = {}
        if(e.ctrlKey) addInput.ctrlKey = true
        if(e.metaKey) addInput.metaKey = true
        if(e.shiftKey) addInput.shiftKey = true
        if(e.altKey) addInput.altKey = true

        eventHandler(e,inputs[JSON.stringify({code: e.code.toLowerCase().replace('arrow','').replace('escape','esc'),...addInput})] || inputs[JSON.stringify({key: e.key.toLowerCase().replace('arrow','').replace('escape','esc'),...addInput})],target)
      },true)
    }
  }
  ipc.once('on-video-event',(e,inputs)=>{
    chrome.runtime.sendMessage({ event: "video-event",inputs })
  })
  chrome.runtime.onMessage.addListener(inputs=>{
    videoFunc({},inputs)
    return false
  })
}
