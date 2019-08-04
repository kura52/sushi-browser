const mainState = require('../../../lib/mainState')
const electron = require('electron')
const winctl = require("../index")
const childProcess = require('child_process')
const util = require('util')
const path = require("path")
const {execSync} = childProcess
const exec = util.promisify(childProcess.exec)

let Browser = new Proxy({},  { get: function(target, name){ Browser = require('../../../lib/remoted-chrome/Browser').Browser; return typeof Browser[name] == 'function' ? Browser[name].bind(Browser) : Browser[name]}})

let wmctrl
try{
  execSync('wmctrl -l')
  wmctrl = 'wmctrl'
}catch(e){
  wmctrl = path.join(__dirname, '../../bin/wmctrl/linux/wmctrl').replace(/app.asar([\/\\])/,'app.asar.unpacked$1')
}

function scaling(num){
  return Math.round(num * mainState.scaleFactor)
}

function gaiseki(ax,ay,bx,by){
  return ax*by-bx*ay
}

function pointInCheck(X,Y,W,H,PX,PY){
  gaiseki(-W,0,PX-W-X,PY-Y) < 0 && gaiseki(0,H,PX-X,PY-Y) < 0 && gaiseki(W,0,PX-X,PY-Y-H) < 0 && gaiseki(0,-H,PX-W-X,PY-H-Y) < 0
}


class WinCtl{

  static moveTopFunc(){
    setTimeout(()=>{
      if(this.moveTopQueue.length){
        const winctlList = [...new Set(this.moveTopQueue.reverse())].reverse()
        this.moveTopQueue = []
        this.moveTopMain(winctlList)
      }
      this.moveTopFunc()
    },50)
  }

  static moveTopMain(ids){
    this.moveTopTime = Date.now()
    try{
      if(ids.length == 1){
        console.log(`${wmctrl} -v -a :ACTIVE: 2>&1 | grep -oE 0x[0-9a-z]+ | xargs -I_ sh -c "test _ != ${ids[0]} && ${wmctrl} -vi -a ${ids[0]} 2>&1 && ${wmctrl} -vi -a '_' 2>&1"`)
        execSync(`${wmctrl} -v -a :ACTIVE: 2>&1 | grep -oE 0x[0-9a-z]+ | xargs -I_ sh -c "test _ != ${ids[0]} && ${wmctrl} -vi -a ${ids[0]} 2>&1 && ${wmctrl} -vi -a '_' 2>&1"`)
      }
      else{
        const id = this.GetActiveWindow2().id
        const command = ids.filter(i=>i != id).map(id => `${wmctrl} -vi -a ${id} 2>&1`).join(' && ')
        console.log(`${wmctrl} -v -a :ACTIVE: 2>&1 | grep -oE 0x[0-9a-z]+ | xargs -I_ sh -c " ${command} && ${wmctrl} -vi -a '_' 2>&1"`)
        execSync(`${wmctrl} -v -a :ACTIVE: 2>&1 | grep -oE 0x[0-9a-z]+ | xargs -I_ sh -c " ${command} && ${wmctrl} -vi -a '_' 2>&1"`)
      }
    }catch(e){
      console.log(e.message, e.stdout.toString())
    }
  }

  static _initializer(){
    this.HWND = {
      NOTOPMOST: -2,
      TOPMOST: -1,
      TOP: 0,
      BOTTOM: 1
    }
    this.moveTopTime = 0
    this.moveTopQueue = []

    this.moveTopFunc()
  }

  static GetActiveWindow2() {
    const [_, id, level] = execSync(`${wmctrl} -v -a :ACTIVE: 2>&1 | grep -oE 0x[0-9a-z]+ | xargs -I_ sh -c "${wmctrl} -l | grep '_'  2>&1"`).toString().match(/^([^ ]+) +([^ ]+)/)
    if(level == '-1') return null

    return new WinCtl(id)
  }

  static _listWindow(){
    const stdout = execSync(`${wmctrl} -l 2>&1`).toString().split("\n",-1)

    return stdout.slice(0,stdout.length - 1).map(x=>{
      const id = x.match(/^([^ ]+)/)[0]
      return new WinCtl(id)
    })
  }

  static EnumerateWindows(callback) {
    for(const win of this._listWindow()){
      if(!callback(win)) return
    }
  }

  static WindowFromPoint2() {
    const point = electron.screen.getCursorScreenPoint()
    const stdouts = execSync(`${wmctrl} -lG 2>&1`).toString().split("\n",-1)

    const ret = []
    for(const stdout of stdouts.slice(0,stdouts.length - 1)){
      const mat = stdout.match(/^([^ ]+) +([^ ]+) +([^ ]+) +([^ ]+) +([^ ]+) +([^ ]+)/)
      if(pointInCheck(parseInt(mat[3]), parseInt(mat[4]), parseInt(mat[5]), parseInt(mat[6]), point.x, point.y)){
        ret.push(mat[1].replace(/^0x0/, '0x'))
      }
    }

    const id = execSync(`xwininfo -root -tree | grep -oE "${ret.join("|")}"`).toString().split("\n", 1)[0]

    return id.replace(/^0x/, '0x0')
  }

  static NonActiveWindowFromPoint() {
    const id = this.WindowFromPoint2()
    return id === this.GetActiveWindow2().id ? id : null
  }


  static FindWindows(validateFunc) {
    return new Promise(resolve => {
      const result = []
      this.EnumerateWindows(function(win) {
        if(validateFunc == null || validateFunc(win)) {
          result.push(win)
        }
        return true
      })

      resolve(result)
    })
  }

  static FindByTitle(title) {
    console.log(0,title)
    const pattern = new RegExp(title);

    const FindByTitlePromise = new Promise((resolve, reject) => {
      let result = null
      WinCtl.EnumerateWindows(function(win) {
        const title = win.getTitle()
        console.log(1,title)
        if(pattern.test(title)) {
          result = win
          return false
        }
        return true
      })

      if(result) {
        resolve(result);
      }
      else {
        reject()
      }
    })

    return FindByTitlePromise
  }

  static conflictAboveWindow(winIds){
    const activeId = this.GetActiveWindow2().id

    const lines = execSync(`xwininfo -root -tree | grep -E "^           0x"`).toString().split("\n", -1)

    // console.log(7788999,winIds)

    const selfs = []
    const others = []
    let activeAppear = false

    let order = 0
    for(const line of lines){
      const match = line.match(/0x([0-9a-z]+) .+?(\d+)x(\d+)\+0\+0  \+(\d+)\+(\d+)/)
      if(match == null) continue

      const id = `0x0${match[1]}`

      if(activeId == id) activeAppear = true
      if(!activeAppear) continue

      const include = winIds.includes(id)

      ;(include ? selfs : others).push({order: order++, id,
        x: parseInt(match[4]), y: parseInt(match[5]), width: parseInt(match[2]), height: parseInt(match[3])})
    }

    // console.log('selfs', selfs)
    // console.log('others', others)

    for(const self of selfs){
      for(const other of others){
        if(self.order < other.order) break

        if(this.conflictRect(self, other)) return true
      }
    }

    return false
}

  static conflictRect(a,b){
     return (a.x < b.x + b.width && b.x < a.x + a.width) && (a.y < b.y + b.height && b.y < a.y + a.height);
  }

  constructor(id){
    this.id = id
  }

  setChromeWindowId(windowId){
    this.windowId = windowId
  }

  setBrowserWindow(bw){
    this.bw = bw
  }

  getTitle(){
    if(this.bw){
      return this.bw.getTitle()
    }
    else{
      for(let i=0;i<1000;i++){
        try{
          return execSync(`${wmctrl} -l | grep "${this.id}" 2>&1`).toString().match(/^([^ ]+) +([^ ]+) +([^ ]+) +(.+)/)[4]
        }catch(e){
          console.log(e)
        }
      }
    }
  }

  getHwnd(){
    return this.id
  }

  getClassName(){
    return '' //no-op
  }

  setForegroundWindowEx(){
    if(this.bw){
      return this.bw.focus()
    }
    else{
      execSync(`${wmctrl} -vi -a ${this.id} 2>&1`)
    }
  }

  getWindowModuleFileName(){
    const pid = execSync(`${wmctrl} -lp | grep "${this.id}" 2>&1`).toString().match(/^([^ ]+) +([^ ]+) +([^ ]+)/)[3]
    return execSync(`ps h o command p ${pid}`).toString().replace("\n","")
  }

  setWindowPos(type){

    if(this.bw){
      if(type == WinCtl.HWND.TOPMOST){
        this.bw.setAlwaysOnTop(true)
      }
      else if(type == WinCtl.HWND.NOTOPMOST){
        this.bw.setAlwaysOnTop(false)
      }
    }
    else{
      if(type == WinCtl.HWND.TOPMOST){
        console.log(`${wmctrl} -vi -r ${this.id} -b 'add,above' 2>&1`)
        execSync(`${wmctrl} -vi -r ${this.id} -b 'add,above' 2>&1`)
      }
      else if(type == WinCtl.HWND.NOTOPMOST){
        execSync(`${wmctrl} -vi -r ${this.id} -b 'remove,above' 2>&1`)
      }
    }
    // else if(type == WinCtl.HWND.BOTTOM){
    //
    // }
  }

  _moveTop(){
    // const now = Date.now()
    // if(now - WinCtl.moveTopTime < 500){
    //   // return
    // }
    // else{
    //   WinCtl.moveTopTime = now
    // }
    // console.trace()
    // const aWin = WinCtl.GetActiveWindow2()
    // if(aWin && aWin.id != this.id){
      try{
        // console.log(execSync(`${wmctrl} -v -a :ACTIVE: 2>&1`).toString())
        exec(`${wmctrl} -v -a :ACTIVE: 2>&1 | grep -oE 0x[0-9a-z]+ | xargs -I_ sh -c "test _ != ${this.id} && ${wmctrl} -vi -a ${this.id} 2>&1 && ${wmctrl} -vi -a '_' 2>&1"`)
      }catch(e){
        console.log(e.message, e.stdout.toString())
      }
    // }
    // console.log(`${wmctrl} -v -a :ACTIVE: 2>&1 | grep -oE 0x[0-9]+ | xargs -I_ sh -c "${wmctrl} -vi -a ${this.id} 2>&1 && ${wmctrl} -vi -a '_' 2>&1"`)
  }

  moveTop(){
    WinCtl.moveTopQueue.push(this.id)
  }

  setWindowLongPtr(){
    // no-op
  }

  setWindowLongPtrRestore(){
    // no-op
  }

  setWindowLongPtrEx(val){
    if(val == 0x00000080){
      execSync(`${wmctrl} -vi -r ${this.id} -b 'add,skip_taskbar' 2>&1`)
    }
  }

  setWindowLongPtrExRestore(){
    if(val == 0x00000080){
      execSync(`${wmctrl} -vi -r ${this.id} -b 'remove,skip_taskbar' 2>&1`)
    }
  }

  setParent(){
    // no-op
  }

  showWindow(nCmdShow){
    if(!this.windowId) return

    if(nCmdShow == 0 || nCmdShow == 6){ //SW_HIDE, SW_MINIMIZE
      Browser.bg.evaluate((windowId) => chrome.windows.update(windowId, {state: 'minimized'}), this.windowId)
    }
    else if(nCmdShow == 5){ //SW_SHOW
      Browser.bg.evaluate((windowId) => chrome.windows.update(windowId, {focused: true}), this.windowId)
    }
    else if(nCmdShow == 9){ //SW_RESTORE
      Browser.bg.evaluate((windowId) => chrome.windows.update(windowId, {state: 'normal'}), this.windowId)
    }
  }

  async move(x, y, width, height){
    // console.trace(x,y,width,height)
    x = scaling(x)
    y = scaling(y)
    width = scaling(width)
    height = scaling(height)

    // if(this.windowId){
    //   await Browser.bg.evaluate((windowId, left,top,width,height) => {
    //     return new Promise(resolve => {
    //       chrome.windows.update(windowId, {left,top,width,height}, () => resolve())
    //     })
    //   }, this.windowId, x,y,width,height)
    // }
    // else{
      await exec(`${wmctrl} -vi -r ${this.id} -e 0,${x},${y},${width},${height} 2>&1`)
    // }
  }

  moveRelative(){
    // no-op
  }

  dimensions(){
    const mat = execSync(`${wmctrl} -lG | grep "${this.id}" 2>&1`).toString().match(/^([^ ]+) +([^ ]+) +([^ ]+) +([^ ]+) +([^ ]+) +([^ ]+)/)
    return {left: parseInt(mat[3]), top: parseInt(mat[4]), right: parseInt(mat[3]) + parseInt(mat[5]), bottom: parseInt(mat[4]) + parseInt(mat[6])}
  }

  destroyWindow(){
    execSync(`${wmctrl} -vi -c ${this.id} 2>&1`)
  }

}

WinCtl._initializer()

module.exports = WinCtl;