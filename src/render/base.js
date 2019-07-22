window.debug = require('debug')('info')
// require('debug').enable("info")
const React = require('react')
import localForage from "localforage"
const {Component} = React
const {render,unmountComponentAtNode} = require('react-dom')
const SplitWindows = require("./SplitWindows")
const WebPageList = require("./WebPageList")
const SearchAnything = require("./SearchAnything")
const PubSub = require('./pubsub')
const sharedState = require('./sharedState')
// global.Perf = require('react-addons-perf');
const {remote} = require('electron')
const ipc = require('electron').ipcRenderer
const isDarwin = navigator.userAgent.includes('Mac OS X')
const isWin = navigator.userAgent.includes('Windows')
const [longPressMiddle,doubleShift,hoverBookmarkBar,hoverStatusBar] = ipc.sendSync('get-sync-main-states',['longPressMiddle','doubleShift','hoverBookmarkBar','hoverStatusBar'])
ipc.setMaxListeners(0)
sharedState.hoverBookmarkBar = hoverBookmarkBar
sharedState.hoverStatusBar = hoverStatusBar

// require('inferno').options.recyclingEnabled = true; // Advanced optimisation
global.lastMouseDown = []
global.lastMouseDownSet = new Set()
global.openerQueue = []
//
if(location.href.endsWith("index.html#")){
  try{
    for(let [url,path] of Object.entries(ipc.sendSync('get-sync-main-state','favicons'))){
      localForage.setItem(url,path)
    }
  }catch(e){
    console.log(e)
  }
}


function isFloatPanel(key){
  return key.startsWith('fixed-float')
}

export default class MainContent extends Component{
  constructor(props) {
    super(props)
    this.handleMouseMove = ::this.handleMouseMove
    this.handleMouseUp = ::this.handleMouseUp
  }

  handleResize(e) {
    const w = window.innerWidth
    const h = window.innerHeight
    if(w==this.w && h==this.h) return

    PubSub.publish("resizeWindow",{old_w:this.w,old_h:this.h,new_w:w,new_h:h,native:true})
    this.w = w
    this.h = h
  }

  handleMouseMove(e, visibleRepeat){
    // console.log('mousemove',e)
    if(document.getElementsByClassName('visible transition').length){
      clearTimeout(this.changeViewZIndexId)
      ipc.send('change-browser-view-z-index', true)
      // if(this.menuVisible) clearInterval(this.menuVisible)
      // this.menuVisible = setInterval(_=>this.handleMouseMove(e, true),10)
    }
    else if(document.activeElement.tagName == 'INPUT' && document.activeElement.type == 'text'){

    }
    else{
      // if(this.menuVisible) clearInterval(this.menuVisible)
      // this.menuVisible = void 0

      //@TODO CAUTION
      let target = e.target
      if(target.className == 'browser-page') target = target.children[0]
      if(target.dataset.webview){
        if(Date.now() - this.changeViewZIndexTime < 100){
          if(this.changeViewZIndexId == null){
            this.changeViewZIndexId = setTimeout(()=>{
              this.changeViewZIndexId = null
              console.log('change-browser-view-z-index',e.target.className)
              ipc.send('change-browser-view-z-index', false, target.className.slice(1))
              this.changeViewZIndexTime = Date.now()
            },100)
          }
        }
        else{
          console.log('change-browser-view-z-index',e.target.className)
          ipc.send('change-browser-view-z-index', false, target.className.slice(1))
          this.changeViewZIndexTime = Date.now()
        }
      }
      else{
        clearTimeout(this.changeViewZIndexId)
      }

      // ipc.send('change-browser-view-z-index', e.target.className !== 'browser-page' && !e.target.dataset.webview)

    }
    if(visibleRepeat) return

    // if(e.target.classList.contains('rdTabBar')){
    //   ipc.send('drag-window', {flag: true, x:e.clientX, y:e.clientY})
    //   this.dragFlag = true
    // }
    // else if(this.dragFlag && !e.target.classList.contains('rdTabBar')){
    //   ipc.send('drag-window', {flag: false})
    //   this.dragFlag = false
    // }
    if(sharedState.hoverBookmarkBar){
      if (e.target.dataset.webview && e.offsetY <= 14) { //@TODO ELECTRON
        clearTimeout(this.moveId)
        this.moveId = void 0
        const key = e.target.dataset.key
        PubSub.publish(`hover-bookmarkbar-${key}`, e.target)
        this.hoverBookmarkBar = key
      }
      else if (this.hoverBookmarkBar && !e.target.closest('.bookmark-bar')) {
        this.moveId = setTimeout(_=>{
          PubSub.publish(`hover-bookmarkbar-${this.hoverBookmarkBar}`, false)
          this.hoverBookmarkBar = void 0
          this.moveId = void 0
        },500)
      }
    }
    if(sharedState.hoverStatusBar){
      this.hoverClearId = setTimeout(_=>{
        clearTimeout(this.hoverClearId)
        if (e.target.dataset.webview && (e.target.parentNode.offsetHeight - e.offsetY) <= 20) {//@TODO ELECTRON
          console.log('hoverBookmarkBar1',e)
          // console.log(1)
          clearTimeout(this.moveStatusId)
          this.moveStatusId = void 0
          const key = e.target.dataset.key
          PubSub.publish(`hover-statusbar-${key}`, e.target)
          this.hoverStatusBar = key
        }
        else if (this.hoverStatusBar && !e.target.closest('.status-bar')) {
          console.log('hoverBookmarkBar2',e)
          console.log(2)
          this.moveStatusId = setTimeout(_=>{
            console.log(3)
            PubSub.publish(`hover-statusbar-${this.hoverStatusBar}`, false)
            this.hoverStatusBar = void 0
            this.moveStatusId = void 0
          },500)
        }
      },100)
    }

  }

  handleMouseUp(e){
    const eventMoveHandler = e2=>{
      e.sender.send('context-menu-move',{x:e2.x,y:e2.y})
      document.removeEventListener('mousemove',eventMoveHandler)
    }
    const eventUpHandler = e2=>{
      if(e2.which == 3){
        e.sender.send('context-menu-up')
        document.removeEventListener('mouseup',eventUpHandler,true)
      }
    }
    document.addEventListener('mousemove',eventMoveHandler)
    document.addEventListener('mouseup',eventUpHandler,true)
  }

  componentDidMount() {
    ipc.once('unmount-components',_=>{ //@TODO ELECTRON
      const key = this.refs.splitWindow.state.root.key
      ipc.send('save-all-windows-state',key)
      ipc.once(`save-all-windows-state-reply_${key}`,_=>{
        unmountComponentAtNode(document.querySelector('#wvlist'))
        unmountComponentAtNode(document.querySelector('#dllist'))
        unmountComponentAtNode(document.querySelector('#content'))
        unmountComponentAtNode(document.querySelector('#anything'))
        ipc.send('unmount-components-reply')
      })
    })

    document.addEventListener('contextmenu',e=>{
      if(e.target.closest('.infinite-tree-item')) return
      e.preventDefault()
      return false
    },true)

    if(!isWin){
      ipc.on('start-mouseup-handler',this.handleMouseUp)
    }

    // PubSub.subscribe('hover-bookmark-or-status-bar',e=>{
    //   if(sharedState.hoverBookmarkBar || sharedState.hoverStatusBar) {
    //
    //     PubSub.unsubscribe(this.tokenMouseMove)
    //     this.tokenMouseMove = PubSub.subscribe('webview-mousemove',(msg,e)=>{
    //       this.handleMouseMove(e)
    //     })
    //   }
    //   else{
    //     this.tokenMouseMove = PubSub.subscribe('webview-mousemove',(msg,e)=>{
    //       this.handleMouseMove(e)
    //     })
    //   }
    // })

    PubSub.subscribe('tab-moved',(msg, {tabId,fromIndex,toIndex,before,next,other})=>{
      console.log(10,'tab-moved', tabId,fromIndex,toIndex,before,next,other)
      ipc.send('tab-moved', {tabId,fromIndex,toIndex,before:!!before,next:!!next,other:!!other})
    })

    PubSub.subscribe('mouseleave-status-bar',()=>{
      console.log(4)
      this.moveStatusId = setTimeout(_=>{
        console.log(5)
        PubSub.publish(`hover-statusbar-${this.hoverStatusBar}`, false)
        this.hoverStatusBar = void 0
        this.moveStatusId = void 0
      },500)
    })

    window.addEventListener('resize', ::this.handleResize,{ passive: true })


    document.addEventListener('mousemove',this.handleMouseMove,{passive: true})
    // if(sharedState.hoverBookmarkBar || sharedState.hoverStatusBar) {
    this.tokenMouseMove = PubSub.subscribe('webview-mousemove',(msg,e)=>{
      this.handleMouseMove(e)
    })
    // }

    const handleMouseDown = e=>{
      if(e.target.closest('.ui.modal')) return
      let ele,key
      global.middleButtonLongPressing = (void 0)
      global.lastMouseDownSet.delete(e.target)
      global.lastMouseDownSet.add(e.target)

      const currentTabId = global.lastMouseDown[1]
      if(global.lastMouseDown[0] != e.target){
        const tabInfo = this.refs.splitWindow.getTab(e.target)
        if(tabInfo[0]){
          if(global.lastMouseDown[2] != tabInfo[1]){
            ipc.send("change-title",tabInfo[0].page.title)
          }
          global.lastMouseDown = [e.target, tabInfo[0].wvId, tabInfo[1]]
        }
      }
      if(currentTabId !== global.lastMouseDown[1]){
        console.log('change-tab-infos3', [{tabId:global.lastMouseDown[1],active:true}])
        ipc.send('change-tab-infos', [{tabId:global.lastMouseDown[1],active:true}])
        PubSub.publish('active-tab-change',global.lastMouseDown[1])
      }
      if(e.target.tagName == 'WEBVIEW'){
        const key = e.target.className
        if(isFloatPanel(key)){
          PubSub.publish('float-panel',{key:key.slice(1)})
        }
      }
      else if(ele = e.target.closest('.float-panel')){
        PubSub.publish('float-panel',{ele})
      }

      if(e.button == 1){
        global.middleButtonPressing = Date.now()
      }
      else{
        global.middleButtonPressing = void 0
      }
    }
    document.addEventListener('mousedown',handleMouseDown,{passive:true})
    PubSub.subscribe('webview-mousedown',(msg,e)=>{
      console.log(6644,'webview-mousedown')
      handleMouseDown(e)
    })

    const handleMouseUp = e=>{
      global.middleButtonLongPressing = (void 0)
      console.log(9983,longPressMiddle,Date.now() - global.middleButtonPressing,global.middleButtonPressing)
      if(global.middleButtonPressing) global.middleButtonLongPressing = longPressMiddle && (Date.now() - global.middleButtonPressing > 320)
    }

    document.addEventListener('mouseup',handleMouseUp,{passive:true})
    PubSub.subscribe('webview-mouseup',(msg,e)=>{
      console.log(6644,'webview-mouseup')
      handleMouseUp(e)
    })

    const isForSecondaryAction = (e) =>
      (e.ctrlKey && !isDarwin) ||
      (e.metaKey && isDarwin) ||
      e.button === 1

    // For window level shortcuts that don't work as local shortcuts
    const handleKeyDown = (e, isWebview) => {
      if (e.key === 'F4' && e.altKey && isWin) {
        ipc.send('menu-or-key-events','zoomOut')
        return
      }
      else if(!isWebview && document.activeElement.tagName != 'INPUT' &&
        !e.shiftKey && !e.altKey && !e.ctrlKey &&
        (e.key == 'end' ||e.key == 'home' || e.key == 'pagedown' || e.key == 'pageup' ||
          e.key == 'space' || e.key == 'tab')){
        ipc.send('send-keys', {key: e.key})
      }
      else{
        switch (e.which) {
          // case 27: //ESC
          //   if(remote.getCurrentWindow().isFullScreen()) ipc.send('toggle-fullscreen')
          //   break
          // case 123: //F12
          //   ipc.send('menu-or-key-events','toggleDeveloperTools')
          //   break
          case 107: //NUMPAD_PLUS
            if (isForSecondaryAction(e)) {
              ipc.send('menu-or-key-events','zoomIn')
            }
            break
          case 109: //NUMPAD_MINUS
            if (isForSecondaryAction(e)) {
              ipc.send('menu-or-key-events','zoomOut')
            }
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown, { passive: true })
    PubSub.subscribe('webview-keydown',(msg,e)=>{
      handleKeyDown(e, true)
    })


    document.addEventListener('wheel',e=>{
      if(e.ctrlKey || e.metaKey) e.preventDefault()
    }, {passive: false})
    // window.addEventListener('drop', function (event) {
    //   // allow webviews to handle dnd
    //   if (event.target.tagName === 'WEBVIEW') {
    //     return true;
    //   }
    //   event.preventDefault();
    //   return false;
    // }, true);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', ::this.handleResize,{ passive: true })
  }

  render() {
    return <SplitWindows key="splitWindow" ref="splitWindow"/>
  }
}

render(<WebPageList />, document.querySelector('#wvlist'))
render(<MainContent />, document.querySelector('#content'))

if(doubleShift){
  render(<SearchAnything />, document.querySelector('#anything'))
}
