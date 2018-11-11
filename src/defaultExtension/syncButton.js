let x,y,right,top,left
const ipc = chrome.ipcRenderer

class SyncButton{
  constructor(){
    this.mup = this.mup.bind(this)
    this.mdown = this.mdown.bind(this)
    this.mmove = this.mmove.bind(this)
  }

  mount(){
    const div = document.createElement('div')
    div.style = `height: 0px !important;
    top: 120px !important;
    padding: 0 !important;
    margin: 0 !important;
    border: 0 !important;
    z-index: 999999 !important;
    position: sticky !important;
    left: 100vw;
    -webkit-box-sizing: content-box !important;
    box-sizing: content-box !important;
    width: 87px !important;
    `
    div.innerHTML = `<div class="drag-and-drop-inject"><a href="javascript:void(0)" class="sync-button-inject" style="margin-right:3px !important;">
        <svg style="width: 32px;height: 32px;display: inline; fill: #777;" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32"
             height="32" viewBox="0 0 32 32">
          <path
            d="M27.429 16v2.286q0 0.946-0.58 1.616t-1.509 0.67h-12.571l5.232 5.25q0.679 0.643 0.679 1.607t-0.679 1.607l-1.339 1.357q-0.661 0.661-1.607 0.661-0.929 0-1.625-0.661l-11.625-11.643q-0.661-0.661-0.661-1.607 0-0.929 0.661-1.625l11.625-11.607q0.679-0.679 1.625-0.679 0.929 0 1.607 0.679l1.339 1.321q0.679 0.679 0.679 1.625t-0.679 1.625l-5.232 5.232h12.571q0.929 0 1.509 0.67t0.58 1.616z"></path>
        </svg>
      </a>
      <a href="javascript:void(0)" class="sync-button-inject" style="margin-left:3px !important;">
        <svg style="width: 32px; height: 32px; display: inline; fill: #777;" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32"
             height="32" viewBox="0 0 32 32">
          <path
            d="M26.286 17.143q0 0.964-0.661 1.625l-11.625 11.625q-0.696 0.661-1.625 0.661-0.911 0-1.607-0.661l-1.339-1.339q-0.679-0.679-0.679-1.625t0.679-1.625l5.232-5.232h-12.571q-0.929 0-1.509-0.67t-0.58-1.616v-2.286q0-0.946 0.58-1.616t1.509-0.67h12.571l-5.232-5.25q-0.679-0.643-0.679-1.607t0.679-1.607l1.339-1.339q0.679-0.679 1.607-0.679 0.946 0 1.625 0.679l11.625 11.625q0.661 0.625 0.661 1.607z"></path>
        </svg>
      </a></div></div>`
    document.body.insertBefore(div,document.body.firstChild)
    const aList = div.querySelectorAll('a')
    aList[0].addEventListener('mousedown', ()=>ipc.send('send-to-host', 'scrollPage', 'back'))
    aList[1].addEventListener('mousedown', ()=>ipc.send('send-to-host', 'scrollPage', 'next'))

    this.dad = div
    div.addEventListener('mousedown', this.mdown)
    div.addEventListener('mouseup', this.mup)


    const css = document.createElement('style')
    const rule = document.createTextNode(`
div.drag-and-drop-inject {
    padding: 0 !important;
    margin: 0 !important;
    border: 0 !important;
    padding-bottom: 7px !important; 
    background: linear-gradient(rgba(120, 120, 120,0.2), rgba(100, 100, 100,0.2)) !important;
    font-size: 30px !important;
    padding: 5px 2px !important;
    margin: 0px !important;
    right: 15px !important;
    line-height: 1 !important;
    cursor: move !important;
    border-radius: 5px !important;
    -webkit-box-sizing: content-box !important;
    box-sizing: content-box !important;
}
a.sync-button-inject {
  padding: 0 !important;
  margin: 0 !important;
  border: 0 !important;
  padding: 0px !important;
  margin: 5px !important;
  text-decoration: none !important;
  cursor: pointer !important;
  min-width: 0px !important;
  outline: none !important;
  -webkit-box-sizing: content-box !important;
  box-sizing: content-box !important;
}`)
    css.appendChild(rule)
    const head = document.getElementsByTagName('head')
    if(head[0]) head[0].appendChild(css)
  }

  unmount(){
    document.body.removeChild(this.dad)
  }


  mdown(e) {
    e.stopPropagation()
    e.preventDefault()
    const ele = this.dad
    this.drag = true

    if(e.type === "mousedown") {
      var event = e;
    } else {
      var event = e.changedTouches[0];
    }

    x = event.pageX - ele.offsetLeft;
    y = event.pageY - ele.offsetTop;

    document.body.addEventListener("mousemove", this.mmove, false);
    document.body.addEventListener("touchmove", this.mmove, false);
    document.body.addEventListener("mouseleave", this.mup, false);
    document.body.addEventListener("touchleave", this.mup, false);
  }


  mmove(e) {
    e.stopPropagation()
    e.preventDefault()
    if(!this.drag) return
    const drag = this.dad

    if(e.type === "mousemove") {
      var event = e;
    } else {
      var event = e.changedTouches[0];
    }

    e.preventDefault();

    ;[right,top,left] = ["auto",event.clientY - y + "px",event.pageX - x + "px"]
    drag.style.right = right;
    drag.style.top = top;
    drag.style.left = left;

  }

  mup(e) {
    e.stopPropagation()
    e.preventDefault()
    this.drag = false
    document.body.removeEventListener("mouseleave", this.mup, false);
    document.body.removeEventListener("touchleave", this.mup, false);
    document.body.removeEventListener("mousemove", this.mmove, false);
    document.body.removeEventListener("touchmove", this.mmove, false);
  }
}

const fsb = new SyncButton()
let started
ipc.on('sync-button', (e, isStart, weak) =>{
  if(isStart && (started === void 0 || (started === false && !weak))){
    fsb.mount()
    console.log('mount')
    started = true
  }
  else if(!isStart && started){
    fsb.unmount()
    started = false
  }
})