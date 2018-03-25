const OP_THRESHOLD = 300
let ENABLE_RIGHT_MOUSE = false
let ENABLE_MIDDLE_MOUSE = false
let ENABLE_META_KEYS = false

chrome.idle.setDetectionInterval(15)
chrome.idle.onStateChanged.addListener((idleState) => {
  if(idleState == "idle"){
    chrome.ipcRenderer.send('get-favicon', {})
  }
})

function flatten(array){
  for(let i = 0; i < array.length; ) {
    const value = array[i]
    if (Array.isArray(value)) {
      if (value.length > 0) {
        value.unshift(i, 1)
        array.splice.apply(array, value)
        value.splice(0, 2)
      }
      else {
        array.splice(i, 1)
      }
    }
    else {
      i++
    }
  }
  return array
}

function isSameFrame(x,y){
  return x.tabId == y.tabId && x.url == y.url && x.frame == y.frame
}

function isSamePos(x,y){
  return x.clientX == y.clientX && x.clientY == y.clientY
}

function left(name,x){
  return x.name == name && x.button == 0
}

function mergeKeyDownAndClickAndMouseUp(opList){
  const childToParent = {}
  let x = opList[0]
  for(let y of opList.slice(1)){
    if( isSameFrame(x,y)){
      if(x.name == 'keydown' && left('click',y) && y.clientX == 0 && y.clientY == 0){
        childToParent[y.key] = x.key
      }
      else if(left('click',x) && x.clientX == 0 && x.clientY == 0 && y.name == 'keydown'){
        childToParent[x.key] = y.key
      }
      else if(x.timeStamp == y.timeStamp){
        if(left('click',x) && left('mouseup',y)){
          if(isSamePos(x,y) && x.xpath == y.xpath){
            childToParent[y.key] = x.key
          }
          else{
            childToParent[x.key] = y.key
          }
        }
        else if(left('mouseup',x) && left('click',y)){
          if(isSamePos(x,y) && x.xpath == y.xpath){
            childToParent[x.key] = y.key
          }
          else{
            childToParent[y.key] = x.key
          }
        }
      }
    }
    x = y
  }
  return childToParent
}

function mergeSeveralOperation(opList,childToParent){
  for(let i =0,len = opList.length;i<len;i++){
    const x = opList[i]
    if(left('dblclick',x)){
      let count = 0
      for(let j = i-1; j >=0;j--){
        const y = opList[j]
        if(x.timeStamp - y.timeStamp > 2000) break
        if(!childToParent[y.key] && left('click',y) && x.xpath == y.xpath && isSameFrame(x,y)){
          childToParent[y.key] = x.key
          if(++count == 2) break
        }
      }
    }
    else if(left('click',x) && !childToParent[x.key]){
      for(let j = i-1; j >=0;j--){
        const y = opList[j]
        if(i - j > OP_THRESHOLD) break
        if(!childToParent[y.key] && left('mousedown',y) && x.xpath == y.xpath && isSameFrame(x,y)){
          childToParent[y.key] = x.key
          break
        }
      }
    }
    else if(x.name == 'copy' || x.name == 'cut' || x.name == 'paste'){
      for(let j = i-1; j >=0;j--){
        const y = opList[j]
        if(x.timeStamp - y.timeStamp > 2000) break
        if(y.name == 'keydown' && ((x.name == 'copy' && y.ctrlKey && y.keyChar == 'C') ||
            (x.name == 'cut' && y.ctrlKey && y.keyChar == 'X') ||
            (x.name == 'paste' && y.ctrlKey && y.keyChar == 'V')) &&
          x.xpath == y.xpath && isSameFrame(x,y)){
          childToParent[x.key] = y.key
          break
        }
      }
    }
    else if(x.name == 'input' || x.name == 'submit'){
      for(let j = i-1; j >=0;j--){
        const y = opList[j]
        if(x.timeStamp - y.timeStamp > 2000) break
        if((y.name == 'keydown' || left('click',y)) &&
          (x.xpath == y.xpath || x.name == 'change') &&
          isSameFrame(x,y)){
          childToParent[x.key] = y.key
          break
        }
      }
    }
    else if(x.name == 'select'){
      for(let j = i-1; j >=0;j--){
        const y = opList[j]
        if(x.timeStamp - y.timeStamp > 2000) break
        if((y.name == 'keydown' || left('mouseup',y)) && x.xpath == y.xpath && isSameFrame(x,y)){
          childToParent[x.key] = y.key
          break
        }
      }
    }
    else if(x.name == 'focusin' || x.name == 'focusout' || x.name == 'change'){
      for(let j = i-1; j >=0;j--){
        const y = opList[j]
        if(x.timeStamp - y.timeStamp > 2000) break
        if((y.name == 'keydown' || left('mousedown',y)) && isSameFrame(x,y)){
          childToParent[x.key] = y.key
          break
        }
      }
    }
  }
  return childToParent
}

function isInputable(op){
  return (op.tag == 'input' && !(/^checkbox|radio|file|submit|image|reset|button|range|color$/).test(op.type || "")) ||
    op.tag == 'textarea' || op.contentEditable
}

function isSpecialKey(op){
  return op.keyChar == 'Tab' || op.keyChar == 'F5' || op.keyChar == 'Backspace' || op.keyChar == 'Delete' ||
    op.keyChar == 'Left' || op.keyChar == 'Up' || op.keyChar == 'Right' || op.keyChar == 'Down' ||
    (op.ctrlKey && (op.keyChar == 'A' || op.keyChar == 'X' || op.keyChar == 'C' || op.keyChar == 'V')) ||
    (op.tag == 'input' && op.keyChar == 'Enter')
}

function mergeScrollAndKeyDownsInInputField(opList,childToParent){
  opList = opList.slice(0).reverse()
  for(let i =0,len = opList.length;i<len;i++){
    const x = opList[i]
    if(x.name == 'keydown' && !childToParent[x.key] && isInputable(x) && !isSpecialKey(x)){
      for(let j =i+1,len = opList.length;j<len;j++){
        const y = opList[j]
        if(y.name == 'focusin' || y.name == 'copy' || y.name == 'cut' || y.name == 'paste' || y.name == 'select') break
        if(!childToParent[y.key] && y.name == 'keydown' && !isSpecialKey(y) && x.xpath == y.xpath && isSameFrame(x,y)){
          childToParent[y.key] = x.key
        }
      }
    }
    else if(x.name == 'scroll' && !childToParent[x.key]){
      for(let j =i+1,len = opList.length;j<len;j++){
        const y = opList[j]
        if(!(y.name == 'scroll' && x.path == y.path)) break
        childToParent[y.key] = x.key
      }
    }
  }
  return childToParent
}

function formatOp(ops){
  ops[0].relate = ops.slice(1).map(x=>x.name).filter(x=>x!=ops[0].name).join(', ')
  return ops[0]
}

function getMergedOpList(opList,childToParent){
  const map = new Map()
  for(let op of opList){
    map.set(op.key,[op])
  }

  let resultList = []
  for(let [id,op] of map.entries()){
    const parentId = childToParent[id]
    if(parentId) map.get(parentId).push(op)
  }

  const results = []
  let i=0
  for(let [id,op] of map.entries()){
    if(!childToParent[id]){
      const list = flatten(op)
      results.push(formatOp(list))
    }
  }
  results.sort((a,b)=> a.timeStamp - b.timeStamp || a.index - b.index || a.tabId - b.tabId || a.frame - b.frame )
  results.forEach((op,i)=>op.no = i+1)

  return results
}

function rejectOp(op){
  return (!ENABLE_MIDDLE_MOUSE && op.button == 1) ||
    (!ENABLE_RIGHT_MOUSE && op.button == 2) ||
    (!ENABLE_META_KEYS && (op.keyCode == 16 || op.keyCode == 17 || op.keyCode == 18 || op.keyCode == 20 || op.keyCode == 136 || op.keyCode == 137 ))
}

function sendOps(){
  if(sendTime >= addTime) return
  sendTime = Date.now()

  let opList = []
  for(let [k,v] of Object.entries(opMap)){
    if(rejectOp(v)) continue
    opList.push(v)
  }
  opList.sort((a,b)=> a.tabId - b.tabId || a.frame - b.frame || a.timeStamp - b.timeStamp || a.index - b.index)

  const childToParent = mergeKeyDownAndClickAndMouseUp(opList)
  mergeSeveralOperation(opList,childToParent)
  mergeScrollAndKeyDownsInInputField(opList,childToParent)

  const mergedOpList = getMergedOpList(opList,childToParent)
  chrome.tabs.sendMessage(senderId,{event:'send-op', opList: JSON.stringify(mergedOpList)})
}

let isStart,senderId,opMap = {},opMap2={},opMap3={},addTime = 0,sendTime = -1
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.event == "video-event"){
    chrome.tabs.sendMessage(sender.tab.id, request.inputs);
  }
  else if(request.event == 'start-op'){
    senderId = sender.tab.id
    chrome.ipcRenderer.send('record-op',true)

    chrome.tabs.onCreated.addListener(tab=>{console.log('chrome.tabs.onCreated',tab)})
    chrome.tabs.onActivated.addListener(activeInfo=>{console.log('chrome.tabs.onActivated',activeInfo)})
    chrome.tabs.onRemoved.addListener((tabId,removeInfo)=>{console.log('chrome.tabs.onRemoved',tabId,removeInfo)})
    // chrome.tabs.onMoved.addListener((tabId,{windowId,fromIndex,toIndex})=>{console.log('chrome.tabs.onMoved',tabId,{windowId,fromIndex,toIndex})})
    // chrome.tabs.onAttached.addListener((tabId,{newWindowId,newPosition})=>{console.log('chrome.tabs.onAttached',tabId,{newWindowId,newPosition})})
    // chrome.tabs.onDetached.addListener((tabId,{oldWindowId,oldPosition})=>{console.log('chrome.tabs.onDetached',tabId,{oldWindowId,oldPosition})})

    // chrome.windows.onCreated.addListener(window=>{console.log('chrome.windows.onCreated',window)})
    // chrome.windows.onRemoved.addListener(windowId=>console.log('chrome.windows.onRemoved',windowId))
    chrome.windows.onFocusChanged.addListener(windowId=>console.log('chrome.windows.onFocusChanged',windowId))
  }
  else if(request.event == 'end-op'){
    chrome.ipcRenderer.send('record-op',false)
    sendOps()
  }
  else if(request.event == 'add-op'){
    request.tabId = sender.tab.id
    opMap[request.key] = request
    addTime = Date.now()
  }
  else if(request.event == 'remove-op'){
    delete opMap[request.key]
  }

});

chrome.ipcRenderer.on('add-op',(e,op)=>{
  opMap2[op.key] = op
  addTime = Date.now()
})

setInterval(sendOps,300)

//chrome.tabs,move,create,focus,close,detach,attach,widows系,back,forward,reload,go,domreadyとか

