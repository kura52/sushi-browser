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

console.log('window.__started_', window.__started_)
window.__started_ = window.__started_ ? void 0 : 1
var ipc = chrome.ipcRenderer
if(window.__started_){

  const fullscreenListener = e => {
    console.log(3313,e,document.fullscreenElement !== null)
    ipc.send('fullscreen-change',document.fullscreenElement !== null)
  }

  const videoThumbnail = async (isCapture, isDownload, imageWidth) => {
    function getTime(seconds){
      return `${seconds > 3600 ? Math.floor(seconds / 3600).toString().padStart(2, '0') + ':' : ''}${Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`
    }

    function fillText(context, text, width, height){
      const fontSize = 16
      const margin = 2
      context.font = `${fontSize}px Arial`
      const mText = context.measureText(text)
      context.fillStyle = 'rgba(0,0,0,.6)'
      context.fillRect(width - mText.width - margin * 3, height - fontSize - margin * 3, mText.width + margin * 2, fontSize + margin * 2)
      context.fillRect(width - mText.width - margin * 3, height - fontSize - margin * 3, mText.width + margin * 2, fontSize + margin * 2)

      context.textBaseline = 'bottom'
      context.textAlign = 'end'
      context.fillStyle = '#fff'
      context.fillText(text, width - margin * 2, height - margin * 2 + 2)

    }

    const video = document.querySelector('video._video-controlled-elem__')
    const vWidth = video.videoWidth
    const vHeight = video.videoHeight

    if(imageWidth == null) imageWidth = video.videoWidth

    const canvas = document.querySelector('#_thumbnail__') || document.createElement('canvas')
    canvas.id = '_thumbnail__'
    canvas.width = imageWidth
    canvas.height = imageWidth / vWidth * vHeight

    const context = canvas.getContext('2d')

    const currentTime = video.currentTime
    const duration = video.duration

    if(isCapture){
      context.drawImage(video, 0, 0, vWidth, vHeight, 0, 0, canvas.width, canvas.height)
      const imgUrl = canvas.toDataURL()

      if(isDownload){
        return [imgUrl]
      }
      else{
        const div = document.createElement('div')
        const rect = video.getBoundingClientRect()
        div.style.left = `${ Math.round(rect.left) + window.scrollX }px`
        div.style.top = `${Math.round(rect.top + rect.height) + 60 + window.scrollY}px`
        div.style.position = 'fixed'
        div.style.zIndex = 2147483647;
        div.addEventListener('click', ()=>document.body.removeChild(div))

        const img = document.createElement('img')
        img.src = imgUrl
        img.style.width = `${imageWidth}px`
        img.style.height = 'auto'
        div.appendChild(img)
        document.body.insertBefore(div, document.body.firstChild)
      }
    }
    else{
      const SPLIT_NUM = 10
      const imgUrls = []
      const div = document.createElement('div')

      for(let i=0;i<SPLIT_NUM;i++){
        const imgUrl = await new Promise(r => {
          const time = (duration / SPLIT_NUM * i) || 1
          video.currentTime = time
          video.addEventListener('seeked', ()=>{
            context.drawImage(video, 0, 0, vWidth, vHeight, 0, 0, canvas.width, canvas.height)
            fillText(context, getTime(time), canvas.width, canvas.height)
            r(canvas.toDataURL())
          })
        })

        if(isDownload){
          imgUrls.push(imgUrl)
        }
        else{
          const img = document.createElement('img')
          img.src = imgUrl
          img.style.width = `${imageWidth}px`
          img.style.height = 'auto'
          div.appendChild(img)
        }
      }
      video.currentTime = currentTime
      if(isDownload){
        return imgUrls
      }
      else{
        const rect = video.getBoundingClientRect()
        div.style.left = `${ Math.round(rect.left) + window.scrollX }px`
        div.style.top = `${Math.round(rect.top + rect.height) + 60 + window.scrollY}px`
        div.style.position = 'fixed'
        div.style.zIndex = 2147483647;
        div.addEventListener('click', ()=>document.body.removeChild(div))
        document.body.insertBefore(div, document.body.firstChild)
      }
    }
  }

  document.addEventListener('fullscreenchange', fullscreenListener)
  document.addEventListener('webkitfullscreenchange', fullscreenListener)

  setTimeout(()=>{

    let mouseDowned = false;
    document.addEventListener('mousedown',e=>{
      if(e.button == 2) mouseDowned = true
    },{passive: true, capture: true})

    document.addEventListener('contextmenu', e => {
      if(window.__no_skip_context_menu__){
        window.__no_skip_context_menu__ = false
        return
      }

      e.preventDefault()
      e.stopImmediatePropagation()
      console.log(5555,e)

      if(!mouseDowned) return
      mouseDowned = true

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

  const ResizeEventMap = new Map()
  const funcPlay = (e) => e.target.pause()
  const funcPause = (e) => e.target.play()

  if(location.href.match(/^(http|chrome\-extension)/)){

    if(window == window.parent){
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
      },{passive: true, capture: true})


      document.addEventListener('mouseleave',e=>{
        ipc.send('send-to-host', 'webview-mousemove', {clientY: e.clientY, screenY: e.screenY,
          activeText: document.activeElement.tagName == 'INPUT' && document.activeElement.type == 'text'})
      })

      window.addEventListener("beforeunload", e=>{
        ipc.send('fullscreen-change', false, 1000)
        ipc.send('send-to-host', 'scroll-position',{x:window.scrollX ,y:window.scrollY})
        ipc.send('contextmenu-webContents-close')
      });
    }


    let preClientY = -1
    document.addEventListener('mousemove',e=>{
      // console.log('mousemove')
      if(window == window.parent && preClientY != e.clientY){
        ipc.send('send-to-host', 'webview-mousemove', {clientY: e.clientY, screenY: e.screenY,
          activeText: document.activeElement.tagName == 'INPUT' && document.activeElement.type == 'text'})
        // console.log('webview-mousemove', e.clientY)
        preClientY = e.clientY
      }
    },{passive: true, capture: true})

    const checkPos = (ele, v) => {
      const b1 = ele.getBoundingClientRect()
      const b2 = v.getBoundingClientRect()
      return b1.x == b2.x && b1.y == b2.y && b1.width == b2.width && b1.height == b2.height
    }

    let checkedVideoSet = new Set(), beforeRemoveIds = new Map(), videoList, isAddedCss = false

    const resizeEvent = (v) => {

      let x, y
      const mmove = e => {

        clickEventCancel = true
        const val = parseInt(v.style.width)
        if(val != 100 && !isNaN(val)){
          const moveX = e.pageX - x
          x = e.pageX
          const moveY = e.pageY - y
          y = e.pageY
          const xVal = v.style.left == 'auto' ? 0 : parseInt(v.style.left) + moveX * 3
          const yVal = parseInt(v.style.top) + moveY * 3
          v.style.setProperty('left', `${xVal}px`,'important')
          v.style.setProperty('top', `${yVal}px`,'important')
        }
        else{
          console.log('move-window-from-webview', e.movementX, e.movementY)
          ipc.send('move-window-from-webview', e.movementX, e.movementY)
        }
      }

      const mup = e => {
        v.removeEventListener("mousemove", mmove, false)
        v.removeEventListener("mouseleave", mup, false)
        v.removeEventListener("mouseup", mup, false)
        setTimeout(()=>clickEventCancel = false,10)
      }

      const mdown = e =>{
        if(e.button != 0) return
        x = e.pageX
        y = e.pageY
        v.addEventListener("mousemove", mmove, false)
        v.addEventListener("mouseleave", mup, false)
        v.addEventListener("mouseup", mup, false)
      }
      v.addEventListener('mousedown', mdown, false)
      v._mdown_ = mdown

      return mdown
    }

    const removeSpan = (v, span, beforeRemoveIds) => {
      beforeRemoveIds.set(v,setTimeout(_ => {
        if(!document.querySelector('._maximize_span_:hover')){
          document.documentElement.removeChild(span)
        }
        else{
          clearTimeout(beforeRemoveIds.get(v))
          removeSpan(v, span, beforeRemoveIds)
        }
      }, 2000))
    }

    setInterval(()=>{
      videoList = document.querySelectorAll('video')
      for(let v of videoList) {
        if (checkedVideoSet.has(v)) continue
        checkedVideoSet.add(v)
        const id = Math.random().toString().substring(2)

        const func = () => {

          if(!isAddedCss){
            isAddedCss = true

            const s = document.createElement('style')
            s.setAttribute('type', 'text/css')
            s.setAttribute('id', 'style_element_')
            const style = `input[type="range"]._maximize_resizer_ {
    -webkit-appearance: none;
    background-color: #cccccc;
    height: 12px;
    border-radius: 3px;
    width: 110px;
    display: block;
    margin: 4px auto;
    outline: none;
    }
  input[type="range"]._maximize_resizer_::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 10px;hange-video-val
    height: 10px;
    background: #4a4a4a;
    border-radius: 50%;
    }  
  video._maximize-org_::-webkit-media-controls-enclosure{
    position: fixed !important;
    width: 100vw !important;
    height: 100vh !important;
    left: 0 !important;
  }
    `
            s.appendChild(document.createTextNode(style));
            document.head.appendChild(s)

            const s2 = document.createElement('style')
            s2.setAttribute('type', 'text/css')
            s2.setAttribute('id', 'style_element2_')
            document.head.appendChild(s2)
          }

          console.log('func')
          const existElement = document.querySelector(`#maximize-org-video${id}`)
          if (existElement) {
            clearTimeout(beforeRemoveIds.get(v))
            removeSpan(v, existElement, beforeRemoveIds)
            return
          }

          const rect = v.getBoundingClientRect()
          let xmod = 0, ymod = 0, widthVw = parseInt(v.style.width)
          if(isNaN(widthVw)) widthVw = 100
          if(v._olds_ && widthVw > 100){
            if(widthVw > 300) widthVw = 100
            xmod = parseInt(v.style.left) * -1
            ymod = parseInt(v.style.top) * -1
          }
          const rStyle = `left:${Math.round(rect.left) + 10 + window.scrollX + xmod}px;top:${Math.round(rect.top) + 10 + window.scrollY + ymod}px`

          const span = document.createElement("span")
          span.appendChild(document.createTextNode(v._olds_ ? `Normal${widthVw == 100 ? '' : ` [${widthVw}%]`}` : 'Maximize'))

          if(v._olds_){
            const input = document.createElement('input')
            input.type = 'range'
            input.min = 0.2
            input.max = 3
            input.name = 'resizer'
            input.className = '_maximize_resizer_'
            input.step = 0.05
            input.value = `${widthVw / 100.0}`
            let preVal = input.value

            const onInput = e => {
              const value = parseFloat(input.value)
              let percent = Math.round(value * 100)
              if(percent > 300 || isNaN(percent)) percent = 100
              const left = parseInt(v.style.left)
              const top = parseInt(v.style.top)

              v.style.setProperty('width',`${percent}vw` ,'important')
              v.style.setProperty('min-width',`${percent}vw` ,'important')
              v.style.setProperty('max-width',`${percent}vw` ,'important')
              v.style.setProperty('height',`${percent}vh` ,'important')
              v.style.setProperty('min-height',`${percent}vh` ,'important')
              v.style.setProperty('max-height',`${percent}vh` ,'important')
              v.style.setProperty('left', `${left - (window.innerWidth * (value - preVal) / 2)}px`,'important')
              v.style.setProperty('top', `${top - (window.innerHeight * (value - preVal) / 2)}px`,'important')
              preVal = value
              if(percent != 100){
                span.firstChild.textContent  = `Normal [${percent}%]`
              }
              else{
                span.firstChild.textContent  = 'Normal'
                v.style.setProperty('left', '0','important')
                v.style.setProperty('top', '0','important')
              }
            }
            input.addEventListener('input', onInput)
            v.inputFunc = onInput
            span.appendChild(input)
            if(!ResizeEventMap.has(v)){
              ResizeEventMap.set(v, resizeEvent(v))
            }
          }

          span.style.cssText = `${rStyle};z-index: 2147483647;position: absolute;overflow: hidden;border-radius: 8px;background: rgba(50,50,50,0.9);text-shadow: 0 0 2px rgba(0,0,0,.5);transition: opacity .1s cubic-bezier(0.0,0.0,0.2,1);margin: 0;border: 0;font-size: 14px;color: white;padding: 4px 7px;text-align: center;`;

          span.setAttribute("id", `maximize-org-video${id}`)
          span.className = '_maximize_span_'

          // document.body.appendChild(span)
          document.documentElement.insertBefore(span, document.body)

          const onClick = async e => {
            if(e && e.target.tagName == 'INPUT') return
            if(e && e.target.childElementCount > 0 && e.clientY - 2 > e.target.children[0].getBoundingClientRect().y) return
            if(!e && v._olds_) return
            await maximizeInPanel(v)
            const rect = v.getBoundingClientRect()
            span.style.left = `${Math.round(rect.left) + 10}px`
            span.style.top = `${Math.round(rect.top) + 10}px`
            span.innerText = v._olds_ ? 'Normal' : 'Maximize'
            clearTimeout(beforeRemoveIds.get(v))
            document.documentElement.removeChild(span)
          }
          span.addEventListener('click', onClick)
          v.clickFunc = onClick

          span.addEventListener('mouseenter', () => span.style.background = 'rgba(80,80,80,0.9)')
          span.addEventListener('mouseleave', () => span.style.background = 'rgba(50,50,50,0.9)')

          removeSpan(v, span, beforeRemoveIds)

          const func = (v, span, beforeRemoveIds) => {
            beforeRemoveIds.set(v,setTimeout(_ => {
              if(!document.querySelector('._maximize_span_:hover')){
                document.documentElement.removeChild(span)
              }
              else{
                clearTimeout(beforeRemoveIds.get(v))
                func()
              }
            }, 2000))
          }
        }

        let mouseMoveEvent = {}
        const onMouseMove = e => {
          if(!e) return func()

          mouseMoveEvent = e
          const r = v.getBoundingClientRect()
          if (pointInCheck(r.left, r.top, r.width, r.height, e.clientX, e.clientY)) {
            func()
          }
        }

        document.addEventListener('mousemove', onMouseMove)
        v.mouseMoveFunc = onMouseMove

        document.addEventListener('mouseout', e2 => {
          if (e2.target != v && !checkPos(e2.target, v)) return
          const r = v.getBoundingClientRect()
          console.log(r.left, r.top, r.width, r.height, mouseMoveEvent.clientX, mouseMoveEvent.clientY)
          if (pointInCheck(r.left, r.top, r.width, r.height, mouseMoveEvent.clientX, mouseMoveEvent.clientY)) {
            const existElement = document.querySelector(`#maximize-org-video${id}`)
            if (existElement && e2.toElement != existElement) {
              clearTimeout(beforeRemoveIds.get(v))
              document.documentElement.removeChild(existElement)
            }
          }
        })
        func()
      }
    },500)

  }


  const gaiseki = (ax,ay,bx,by) => ax*by-bx*ay
  const pointInCheck = (X,Y,W,H,PX,PY) => gaiseki(-W,0,PX-W-X,PY-Y) < 0 && gaiseki(0,H,PX-X,PY-Y) < 0 && gaiseki(W,0,PX-X,PY-Y-H) < 0 && gaiseki(0,-H,PX-W-X,PY-H-Y) < 0

  async function maximizeInPanel(v, enable, isIframe){
    if(window != window.parent){
      chrome.runtime.sendMessage({event: 'maximizeInPanel-fromIframe', enable, href: location.href, width: window.innerWidth, height: window.innerHeight })
      // await new Promise(r=>setTimeout(r,500))
    }

    let _v, _vs
    if(location.href.startsWith('https://www.youtube.com')){
      _v = v
      v = v.closest('.html5-video-player')
    }

    if(enable == null){
      enable = !v._olds_
    }
    if(enable){
      v._olds_ = {}

      v._olds_.controls = v.controls
      v._olds_.htmlOverflow = document.documentElement.style.overflow
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
      v._olds_.top = v.style.top
      v._olds_.margin = v.style.margin
      v._olds_.padding = v.style.padding
      v._olds_.border = v.style.border
      v._olds_.outline = v.style.outline
      v._olds_.transform = v.style.transform
      v._olds_.opacity = v.style.opacity
      v._olds_.objectFit = v.style.objectFit

      if(_v){
        _v._olds_ = {}
        _v._olds_.width = _v.style.width
        _v._olds_.minWidth = _v.style.minWidth
        _v._olds_.maxWidth = _v.style.maxWidth
        _v._olds_.height = _v.style.height
        _v._olds_.minHeight = _v.style.minHeight
        _v._olds_.maxHeight = _v.style.maxHeight
        _v._olds_.left = _v.style.left
        _v._olds_.top = _v.style.top

        _v._olds_.theater = !!document.querySelector('#player-theater-container').childElementCount
        if(!_v._olds_.theater){
          document.querySelector('.ytp-size-button.ytp-button').click()
        }
      }

      if(!isIframe){
        if(!_v){
          v._clickCallback_ = e => {
            e.preventDefault()
            ;(async()=>{
              for(let i=0;i<10;i++){
                if(v.controls) break
                v.setAttribute('controls', true)
                await new Promise(r=>setTimeout(r,100))
              }
            })()
          }
          v.setAttribute('controls', true)
          v.addEventListener('click', v._clickCallback_)
        }
        else{
          v._clickCallback_ = e => {
            e.preventDefault()
            e.stopImmediatePropagation()
            return false
          }
          _v.addEventListener('click', v._clickCallback_)
        }
      }
      else{
        v.setAttribute('_key_', 'video')
      }

      document.documentElement.style.setProperty('overflow','hidden' ,'important')
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
      v.style.setProperty('display','inline-block' ,'important')
      v.style.setProperty('left','0' ,'important')
      v.style.setProperty('top','0' ,'important')
      v.style.setProperty('margin','0' ,'important')
      v.style.setProperty('padding','0' ,'important')
      v.style.setProperty('border','0' ,'important')
      v.style.setProperty('outline','0' ,'important')
      v.style.setProperty('transform','none' ,'important')
      v.style.setProperty('opacity','1','important')
      v.style.setProperty('object-fit','contain','important')
      ;(_v || v).classList.add('_maximize-org_')

      if(_v){
        clearInterval(_v.intervalId)
        _v.intervalId = setInterval(() => {
          if(!_v.style.getPropertyPriority('top')){
            _v.style.setProperty('width','100vw' ,'important')
            _v.style.setProperty('height','100vh' ,'important')
            _v.style.setProperty('left','auto' ,'important')
            _v.style.setProperty('top','0px' ,'important')
          }
        },50)
        _v.style.setProperty('width','100vw' ,'important')
        _v.style.setProperty('height','100vh' ,'important')
        _v.style.setProperty('left','auto' ,'important')
        _v.style.setProperty('top','0px' ,'important')
      }

      if(!isIframe) {
        v._olds_.parentNode = v.parentNode

        const replaceNode = document.createElement('span')
        v.parentNode.insertBefore(replaceNode, v)

        v._olds_.replaceNode = replaceNode

        document.documentElement.insertBefore(v, document.body)
      }

    }
    else{
      // document.removeEventListener('mousedown', v._mousedownCallback_, false)
      ;(_v || v).removeEventListener('click', v._clickCallback_)

      if(ResizeEventMap.has(_v || v)){
        ;(_v || v).removeEventListener('mousedown', ResizeEventMap.get(_v || v), false)
        ;(_v || v).removeEventListener('play', funcPlay)
        ;(_v || v).removeEventListener('pause', funcPause)
        ResizeEventMap.delete(_v || v)
      }

      v.controls = v._olds_.controls
      document.documentElement.style.overflow = v._olds_.htmlOverflow
      document.body.style.overflow = v._olds_.bodyOverflow
      v.style.width = v._olds_.width
      v.style.minWidth = v._olds_.minWidth
      v.style.maxWidth = v._olds_.maxWidth
      v.style.height = v._olds_.height
      v.style.minHeight = v._olds_.minHeight
      v.style.maxHeight = v._olds_.maxHeight
      v.style.position = v._olds_.position
      v.style.zIndex = v._olds_.zIndex
      v.style.backgroundColor = v._olds_.backgroundColor
      v.style.display = v._olds_.display
      v.style.left = v._olds_.left
      v.style.top = v._olds_.top
      v.style.margin = v._olds_.margin
      v.style.padding = v._olds_.padding
      v.style.border = v._olds_.border
      v.style.outline = v._olds_.outline
      v.style.transform = v._olds_.transform
      v.style.opacity = v._olds_.opacity
      v.style.objectFit = v._olds_.objectFit
      ;(_v || v).classList.remove('_maximize-org_')

      if(_v){
        clearInterval(_v.intervalId)

        _v.style.width = _v._olds_.width
        _v.style.minWidth = _v._olds_.minWidth
        _v.style.maxWidth = _v._olds_.maxWidth
        _v.style.height = _v._olds_.height
        _v.style.minHeight = _v._olds_.minHeight
        _v.style.maxHeight = _v._olds_.maxHeight
        _v.style.left = _v._olds_.left
        _v.style.top = _v._olds_.top
        if(!_v._olds_.theater){
          document.querySelector('.ytp-size-button.ytp-button').click()
        }

        delete _v._olds_
      }

      delete (_v || v).mouseMoveFunc
      delete (_v || v).inputFunc

      if(!isIframe) {
        v._olds_.parentNode.replaceChild(v, v._olds_.replaceNode)
      }

      delete v._olds_
      delete v._clickCallback_
      // delete (_v || v)._mousedownCallback_
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
          ipc.send('menu-command',name.split("_")[0])
          console.log(name)
          e.preventDefault()
          e.stopImmediatePropagation()
        }
      }
    }
    ipc.send('send-to-host', 'webview-keydown',{key: e.key, keyCode: e.keyCode, which: e.which, button: e.button, ctrlKey: e.ctrlKey, metaKey: e.metaKey,altKey: e.altKey})
  },{capture: true})

  function streamFunc(val, immediate, v){
    window._mediaElements_ = window._mediaElements_ || new Map()
    if(window._mediaIntervalId) clearInterval(window._mediaIntervalId)

    const func = _=> {
      const streams = v ? [v] : document.querySelectorAll('video,audio')
      for (let stream of streams) {
        const audioCtx = new (window.AudioContext)();
        let gainNode = window._mediaElements_.get(stream)
        if (!gainNode) {
          const source = audioCtx.createMediaElementSource(stream)
          gainNode = audioCtx.createGain()
          window._mediaElements_.set(stream, gainNode)
          source.connect(gainNode)
          gainNode.connect(audioCtx.destination)
        }
        if (gainNode.gain.value != val / 10.0) gainNode.gain.value = val / 10.0
      }
    }
    if(immediate) func()
    window._mediaIntervalId = setInterval(func,500)
  }

  const key = Math.random().toString()
  ipc.send("get-main-state",key,['tripleClick','alwaysOpenLinkNewTab','themeColorChange','isRecording','isVolumeControl',
    'keepAudioSeekValueVideo','rectangularSelection','fullscreenTransitionKeep','fullScreen','rockerGestureLeft','rockerGestureRight',
    'inputHistory','inputHistoryMaxChar','hoverStatusBar','hoverBookmarkBar','ALL_KEYS2','protectTab'])
  ipc.once(`get-main-state-reply_${key}`,(e,data)=> {
    mainState = data

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
    // if(data.protectTab){
    //   if(window._unloadEvent_) return
    //   window._unloadEvent_ = e => e.returnValue = ''
    //   window.addEventListener("beforeunload", window._unloadEvent_)
    // }
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

  })

  const zoomVideo = async (v, name, value, isIncrement) => {
    if(v._olds_){
      let resizer = document.querySelector('._maximize_resizer_')
      if(!resizer){
        v.mouseMoveFunc()
        await new Promise(r=>setTimeout(r,10))
        resizer = document.querySelector('._maximize_resizer_')
      }
      const val = isIncrement ? parseInt(v.style.width) / 100.0 + value : value
      resizer.value = val
      v.inputFunc()
    }
  }

  let isFirst = true, clickEventCancel
  const videoFunc = (e,inputs)=>{
    if(!isFirst) return
    isFirst = false

    const matchReg = (key) => location.href.match(new RegExp(inputs[`regex${key.charAt(0).toUpperCase()}${key.slice(1)}`],'i'))

    for(let url of (inputs.blackList || [])){
      if(url && location.href.startsWith(url)) return
    }


    const popUp = (v,text)=>{
      const rect = v.getBoundingClientRect()
      const rStyle = `left:${Math.round(rect.left)+20+window.scrollX}px;top:${Math.round(rect.top)+20+window.scrollY}px`

      const span = document.createElement("span")
      span.innerHTML = text
      span.style.cssText = `${rStyle};padding: 5px 9px;z-index: 2147483648;position: absolute;overflow: hidden;border-radius: 2px;background: rgba(28,28,28,0.9);text-shadow: 0 0 2px rgba(0,0,0,.5);transition: opacity .1s cubic-bezier(0.0,0.0,0.2,1);margin: 0;border: 0;font-size: 20px;color: white;padding: 10px 15px;`;
      span.setAttribute("id", "popup-org-video")
      const existElement = document.querySelector("#popup-org-video")
      if(existElement){
        document.documentElement.removeChild(existElement)
      }
      document.documentElement.insertBefore(span, document.body)
      setTimeout(_=>document.documentElement.removeChild(span),2000)
    }

    let nothing
    const eventHandler = async (e,name,target,isPaused)=>{
      let i = 0
      const v = target || e.target

      if(name == 'playOrPause'){
        console.log('paused1', isPaused)
        if(!clickEventCancel){
          isPaused ? v.play() : v.pause()
        }
        return
      }
      else if(name == 'fullscreen'){
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
      else if(name == 'zoomIn' || name == 'zoomOut'){
        zoomVideo(v, name, name == 'zoomIn' ? 0.1 : -0.1, true)
      }
      else{
        nothing = true
      }
      if(!nothing && (isPaused === void 0 || v.classList.contains('_maximize-org_'))){
        e.preventDefault()
        e.stopImmediatePropagation()
        return false
      }
    }

    if(inputs.click2 && matchReg('click')) {
      let isPaused = void 0, _target

      document.addEventListener('mousedown', e=> {
        if(e.button != 0) return
        console.log('moudedown')
        let target = e.target
        if(e.target.tagName !== 'VIDEO'){
          target = null
          if(!e.target.id.startsWith('maximize-org-video')){
            for(let ele of document.querySelectorAll('video')){
              const r =  ele.getBoundingClientRect()
              if(pointInCheck(r.left, r.top, r.width, r.height, e.clientX, e.clientY)){
                const orgBound = e.target.getBoundingClientRect()
                if(orgBound.width < r.width / 2 || orgBound.height < r.height / 2) continue
                target = ele
                break
              }
            }
          }
        }
        isPaused = target ? target.paused : void 0
        _target = target
        if(target){
          target.classList.add('_mousedowned_')
          ipc.send('cancel-pause-mode', isPaused)
          if(target.classList.contains('_maximize-org_')){
            e.preventDefault()
            e.stopPropagation()
            target._mdown_(e)
          }
        }
      }, true)
      document.addEventListener('click', e => {
        console.log('click')
        if (isPaused !== void 0 && _target) {
          eventHandler(e, inputs.click2,_target, isPaused)
        }
        _target = void 0
      }, true)
    }

    if(inputs.dbClick && matchReg('dbClick')){
      document.addEventListener('dblclick',e=>{
        if(e.button != 0) return
        console.log('dblclick')
        let target = e.target
        if(e.target.tagName !== 'VIDEO'){
          target = null
          for(let ele of document.querySelectorAll('video')){
            const r =  ele.getBoundingClientRect()
            if(pointInCheck(r.left, r.top, r.width, r.height, e.clientX, e.clientY)){
              const orgBound = e.target.getBoundingClientRect()
              if(orgBound.width < r.width / 2 || orgBound.height < r.height / 2) continue
              target = ele
              break
            }
          }
          if(!target) return
        }
        eventHandler(e,inputs.dbClick,target)
      },true)
    }

    if((inputs.wheelMinus && matchReg('wheelMinus')) ||
      (inputs.shiftWheelMinus && matchReg('shiftWheelMinus')) ||
      (inputs.ctrlWheelMinus && matchReg('ctrlWheelMinus')) ||
      (inputs.shiftCtrlWheelMinus && matchReg('shiftCtrlWheelMinus')) ||
      (inputs.altWheelMinus && matchReg('altWheelMinus'))){
      const minusToPlus = {rewind1: 'forward1', decSpeed: 'incSpeed', decreaseVolume: 'increaseVolume',frameBackStep: 'frameStep',zoomIn: 'zoomOut'}
      const modify = inputs.reverseWheel ? -1 : 1
      document.addEventListener('wheel',e=>{
        let target = e.target
        if(e.target.tagName !== 'VIDEO'){
          target = null
          for(let ele of document.querySelectorAll('video')){
            const r =  ele.getBoundingClientRect()
            if(pointInCheck(r.left, r.top, r.width, r.height, e.clientX, e.clientY)){
              target = ele
              break
            }
          }
          if(!target) return
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
        else if(e.altKey){
          eventHandler(e,e.deltaY * modify > 0 ? minusToPlus[inputs.altWheelMinus] : inputs.altWheelMinus,target)
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
  setTimeout(()=>clearInterval(receivedVideoEvent),10000)

  ipc.once('on-video-event',(e,inputs)=>{
    clearInterval(receivedVideoEvent)
    chrome.runtime.sendMessage({ event: "video-event",inputs })
  })

  ipc.on('on-stream-event',(e,val)=>{
    chrome.runtime.sendMessage({ event: "stream-event",val })
  })

  let equalizer
  chrome.runtime.onMessage.addListener(inputs=>{
    if(inputs.stream){
      streamFunc(inputs.val)
    }
    else if(inputs.video){
      videoFunc({},inputs.val)
    }
    else if(inputs.maximizeInPanel){
      if(window == window.parent){
        const iframes = document.querySelectorAll('iframe')
        for(const iframe of iframes){
          if(iframe._key_ == 'video' || iframe.src == inputs.href){
            maximizeInPanel(iframe, inputs.enable, true)
            return false
          }
        }
        for(const iframe of iframes){
          const rect = iframe.getBoundingClientRect()
          if(Math.round(rect.width) == inputs.width || Math.round(rect.height) == inputs.height){
            maximizeInPanel(iframe, inputs.enable, true)
            return false
          }
        }
      }
    }
    else if(inputs.controller){
      const name = inputs.name
      const val = inputs.val

      const v = document.querySelector('video._video-controlled-elem__')

      if(name == 'boost'){
        return streamFunc(val * 10, true, v)
      }

      if(name == 'seek'){
        const type = val[0]
        if(type == 'play'){
          v[v.paused ? 'play' : 'pause']()
        }
        else if(type == 'loop'){
          v.loop = !v.loop
        }
        else{
          v.currentTime +=
            type == 'backward2' ? -parseInt(val[2]) : type == 'backward1' ? -parseInt(val[1]) : type == 'step-backward' ?  - 1 / 30 :
              type == 'forward2' ? parseInt(val[2]) : type == 'forward1' ? parseInt(val[1]) : 1 / 30
        }
      }
      else if(name == 'mute'){
        v.muted = !v.muted
      }
      else if(name == 'maximize'){
        maximizeInPanel(v)
      }
      else if(name == 'fullscreen'){
        v.webkitRequestFullscreen()
      }
      else if(name == 'zoom'){
        zoomVideo(v, void 0, val)
      }
      else if(name == 'filter'){
        v.style.filter = val
      }
      else if(name == 'abRepeat'){
        console.log(val)
        v._abRepeat_ = val[0]
        v._abRepeatRange_ = val[1]
        v.removeEventListener('timeupdate', v._abRepeatEvent_)
        v._abRepeatEvent_ = null

        if(v._abRepeat_){
          v._abRepeatEvent_ = () => {
            const currentTime = v.currentTime
            if(currentTime < v._abRepeatRange_[0] || currentTime > v._abRepeatRange_[1]){
              v.currentTime = v._abRepeatRange_[0]
            }
          }
          v.addEventListener('timeupdate', v._abRepeatEvent_)
        }
      }
      else if(name == 'equalizer'){
        if(!equalizer){
          const Equalizer = require('./Equalizer')
          equalizer = new Equalizer(v)
        }
        equalizer.set(val[1])
        v._preset_= val[0]
        v._equalizer_ = val[1]
      }
      else{
        v[name] = val
      }
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

  ipc.on('get-thumbnails', async (e, key, isCapture, isDownload, imageWidth)=>{
    const result = await videoThumbnail(isCapture, isDownload, imageWidth)
    if(isDownload) ipc.send(`get-thumbnails-reply_${key}`, document.title, result)
  })

  ipc.on('execute-script-in-isolation-world', (e, key, code) => {
    ipc.send(`execute-script-in-isolation-world-reply_${key}`, Function(`return ${code}`)())
  })



  ipc.on('no-skip-context-menu', (e, key)=>{
    window.__no_skip_context_menu__ = true
    ipc.send(`no-skip-context-menu-reply_${key}`)
  })
}

