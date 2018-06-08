window.debug = require('debug')('info')
// require('debug').enable("info")
const React = require('react')
import localForage from "localforage"
const {Component} = React
const {render,unmountComponentAtNode} = require('react-dom')
const SplitWindows = require("./SplitWindows")
const WebPageList = require("./WebPageList")
const DownloadList = require("./DownloadList")
const SearchAnything = require("./SearchAnything")
const PubSub = require('./pubsub')
const sharedState = require('./sharedState')
// global.Perf = require('react-addons-perf');
const {remote} = require('electron')
const ipc = require('electron').ipcRenderer
const isDarwin = navigator.userAgent.includes('Mac OS X')
const isWin = navigator.userAgent.includes('Windows')
const [longPressMiddle,doubleShift,hoverBookmarkBar] = ipc.sendSync('get-sync-main-states',['longPressMiddle','doubleShift','hoverBookmarkBar'])
sharedState.hoverBookmarkBar = hoverBookmarkBar

// require('inferno').options.recyclingEnabled = true; // Advanced optimisation
global.lastMouseDown = []
global.lastMouseDownSet = new Set()
global.openerQueue = []

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
  }

  handleResize(e) {
    const w = window.innerWidth
    const h = window.innerHeight
    if(w==this.w && h==this.h) return

    PubSub.publish("resizeWindow",{old_w:this.w,old_h:this.h,new_w:w,new_h:h,native:true})
    this.w = w
    this.h = h
  }

  handleMouseMove(e){
    if (e.target.tagName == 'WEBVIEW' && e.offsetY <= 28) {
      clearTimeout(this.moveId)
      this.moveId = void 0
      const key = e.target.dataset.key
      PubSub.publish(`hover-bookmarkbar-${key}`, e.target)
      this.hoverBookmarkBar = key
    }
    else if (this.hoverBookmarkBar && !e.target.closest('.bookmark-bar')) {
      if(this.moveId) return
      this.moveId = setTimeout(_=>{
        PubSub.publish(`hover-bookmarkbar-${this.hoverBookmarkBar}`, false)
        this.hoverBookmarkBar = void 0
        this.moveId = void 0
      },700)
    }

  }

  componentDidMount() {
    ipc.once('unmount-components',_=>{
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

    PubSub.subscribe('hover-bookmark-bar',e=>{
      if(sharedState.hoverBookmarkBar) {
        document.removeEventListener('mousemove',this.handleMouseMove,{passive: true})
        document.addEventListener('mousemove',this.handleMouseMove,{passive: true})
      }
      else{
        document.removeEventListener('mousemove',this.handleMouseMove,{passive: true})
      }
    })

    window.addEventListener('resize', ::this.handleResize,{ passive: true })


    if(sharedState.hoverBookmarkBar) {
      document.addEventListener('mousemove',this.handleMouseMove,{passive: true})
    }

    document.addEventListener('mousedown',e=>{
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
    },{passive:true})

    document.addEventListener('mouseup',e=>{
      global.middleButtonLongPressing = (void 0)
      console.log(9983,longPressMiddle,Date.now() - global.middleButtonPressing,global.middleButtonPressing)
      if(global.middleButtonPressing) global.middleButtonLongPressing = longPressMiddle && (Date.now() - global.middleButtonPressing > 320)
    },{passive:true})

    // For window level shortcuts that don't work as local shortcuts
    document.addEventListener('keydown', (e) => {
      const isForSecondaryAction = (e) =>
        (e.ctrlKey && !isDarwin) ||
        (e.metaKey && isDarwin) ||
        e.button === 1
      if (e.key === 'F4' && e.altKey && isWin) {
        ipc.send('menu-or-key-events','zoomOut')
        return
      }
      switch (e.which) {
        case 27: //ESC
          if(remote.getCurrentWindow().isFullScreen()) ipc.send('toggle-fullscreen')
          break
        case 123: //F12
          ipc.send('menu-or-key-events','toggleDeveloperTools')
          break
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
    }, { passive: true })


    document.addEventListener('wheel',e=>{
      if(e.ctrlKey || e.metaKey) e.preventDefault()
    })
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
    return <SplitWindows ref="splitWindow"/>
  }
}

render(<WebPageList />, document.querySelector('#wvlist'))
render(<DownloadList />, document.querySelector('#dllist'))
render(<MainContent />, document.querySelector('#content'))

if(doubleShift){
  render(<SearchAnything />, document.querySelector('#anything'))
}
