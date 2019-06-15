let screen, isHighDpi, Browser, BrowserPanel

require('electron').app.once('ready', ()=>{
  screen = require('electron').screen
  Browser = require('./Browser').Browser
  BrowserPanel = require('./Browser').BrowserPanel
  const func = ()=>{
    let _isHighDpi = false
    for(const display of screen.getAllDisplays()){
      if(display.scaleFactor != 1) _isHighDpi = true
    }
    isHighDpi = _isHighDpi
  }
  func()
  setInterval(func,5000)
})

let first

async function move(win,x,y,width,height){
  // if(Browser.CUSTOM_CHROMIUM){
  //   const windowId = BrowserPanel.getBrowserPanelFromNativeWindow(win).windowId
  //   return Browser.bg.evaluate((windowId, left,top,width,height) => {
  //     return new Promise(resolve => {
  //       chrome.windows.update(windowId, {left,top,width,height}, () => resolve())
  //     })
  //   }, windowId, x,y,width,height)
  // }
  // else{
    return win.move(x,y,width,height)
  // }
}

export default {
  dimensions(win){
    const dim = win.dimensions()
    if(!isHighDpi) return dim

    const rect = screen.screenToDipRect(null,
      {x:dim.left,y:dim.top,width:dim.right - dim.left,height:dim.bottom - dim.top})
    return {left:rect.x, top:rect.y, right: rect.x + rect.width, bottom: rect.y + rect.height}
  },
  move(win,x,y,width,height){
    // console.log('move', x,y,width,height)
    if(!isHighDpi) return move(win,x,y,width,height)

    x = Math.round(x)
    y = Math.round(y)
    width = Math.round(width)
    height = Math.round(height)
    // console.log(x,y,width,height)
    const _rect = screen.dipToScreenRect(null, {x: x + 10,y,width,height})
    const rect = screen.dipToScreenRect(null, {x,y,width,height})
    // console.log('ffff',rect.x ,_rect.y,_rect.width,_rect.height)

    move(win,rect.x ,_rect.y,_rect.width,_rect.height)
  },
  moveJust(win,x,y,width,height){
    // console.log('moveJust', x,y,width,height)
    move(win,x,y,width,height)
  },
  moveForChildWindow(win,x,y,width,height,parentX,parentY){
    if(!isHighDpi) return win.move(x,y,width,height)

    x = Math.round(x)
    y = Math.round(y)
    width = Math.round(width)
    height = Math.round(height)
    parentX = Math.round(parentX)
    parentY = Math.round(parentY)

    // console.log('moveForChildWindow',{x,y,parentX,parentY,width,height})

    const _parentPoint = screen.dipToScreenPoint({x: parentX + 10,y: parentY})
    const _rect = screen.dipToScreenRect(null,{x: x + parentX + 10,y: y + parentY,width,height})

    const parentPoint = screen.dipToScreenPoint({x: parentX,y: parentY})
    const rect = screen.dipToScreenRect(null, {x: x + parentX ,y: y + parentY,width,height})
    // console.log(888777,rect.x  - parentPoint.x ,rect.y  - parentPoint.y ,noChangeSize ? width: rect.width, noChangeSize ? height : rect.height)
    // console.log('eee',rect.x - parentPoint.x ,_rect.y  - _parentPoint.y ,_rect.width,_rect.height)
    win.move(rect.x - parentPoint.x ,_rect.y  - _parentPoint.y ,_rect.width,_rect.height)
  },
  dipToScreenPoint(x,y){
    if(!isHighDpi) return {x, y}

    x = Math.round(x)
    y = Math.round(y)
    const point = screen.dipToScreenPoint({x,y})
    return {x: point.x , y: point.y}
  },
  screenToDipPoint(x,y){
    if(!isHighDpi) return {x, y}

    x = Math.round(x)
    y = Math.round(y)
    const point = screen.screenToDipPoint({x,y})
    return {x: point.x , y: point.y}
  }
}