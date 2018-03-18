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

let isStart,opMap = {}

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
  return x.tabId == y.tabId && x.url == y.url && x.inFrame == y.inFrame
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
        childToParent[y.id] = x.id
      }
      else if(left('click',x) && x.clientX == 0 && x.clientY == 0 && y.name == 'keydown'){
        childToParent[x.id] = y.id
      }
      else if(x.timeStamp == y.timeStamp){
        if(left('click',x) && left('mouseup',y)){
          childToParent[y.id] = x.id
        }
        else if(left('mouseup',x) && left('click',y)){
          childToParent[x.id] = y.id
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
        if(!childToParent[y.id] && left('click',y) && x.xpath == y.xpath && isSameFrame(x,y)){
          childToParent[y.id] = x.id
          if(++count == 2) break
        }
      }
    }
    else if(left('click',x) && !childToParent[x.id]){
      for(let j = i-1; j >=0;j--){
        const y = opList[j]
        if(i - j > OP_THRESHOLD) break
        if(!childToParent[y.id] && left('mousedown',y) && x.xpath == y.xpath && isSameFrame(x,y)){
          childToParent[y.id] = x.id
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
          childToParent[x.id] = y.id
          break
        }
      }
    }
    else if(x.name == 'input' || x.name == 'submit'){
      for(let j = i-1; j >=0;j--){
        const y = opList[j]
        if(x.timeStamp - y.timeStamp > 2000) break
        if((y.name == 'keydown' || left('click',y) || y.name == 'cut' || y.name == 'paste') &&
          x.xpath == y.xpath && isSameFrame(x,y)){
          childToParent[x.id] = y.id
          break
        }
      }
    }
    else if(x.name == 'select'){
      for(let j = i-1; j >=0;j--){
        const y = opList[j]
        if(x.timeStamp - y.timeStamp > 2000) break
        if((y.name == 'keydown' || left('mouseup',y)) && x.xpath == y.xpath && isSameFrame(x,y)){
          childToParent[x.id] = y.id
          break
        }
      }
    }
    else if(x.name == 'focusin' || x.name == 'focusout' || x.name == 'change'){
      for(let j = i-1; j >=0;j--){
        const y = opList[j]
        if(x.timeStamp - y.timeStamp > 2000) break
        if((y.name == 'keydown' || left('mousedown',y)) && isSameFrame(x,y)){
          childToParent[x.id] = y.id
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

function mergeKeyDownsInInputField(opList,childToParent){
  opList = opList.slice(0).reverse()
  for(let i =0,len = opList.length;i<len;i++){
    const x = opList[i]
    if(x.name == 'keydown' && !childToParent[x.id] && isInputable(x) && !isSpecialKey(x)){
      for(let j =i+1,len = opList.length;j<len;j++){
        const y = opList[j]
        if(y.name == 'focusin' || y.name == 'copy' || y.name == 'cut' || y.name == 'paste' || y.name == 'select') break
        if(!childToParent[y.id] && y.name == 'keydown' && !isSpecialKey(y) && x.xpath == y.xpath && isSameFrame(x,y)){
          childToParent[y.id] = x.id
        }
      }
    }
  }
  return childToParent
}

function getMergedOpList(opList,childToParent){
  const map = new Map()
  for(let op of opList){
    map.set(op.id,[op])
  }

  let resultList = []
  for(let [id,op] of map.entries()){
    const parentId = childToParent[id]
    if(parentId) map.get(parentId).push(op)
  }

  const results = []
  for(let [id,op] of map.entries()){
    if(!childToParent[id]){
      const list = flatten(op)
      results.push(list.length == 1 ? list[0] : list)
    }
  }
  return results
}

function rejectOp(op){
  return (!ENABLE_MIDDLE_MOUSE && op.button == 1) ||
    (!ENABLE_RIGHT_MOUSE && op.button == 2) ||
    (!ENABLE_META_KEYS && (op.keyCode == 16 || op.keyCode == 17 || op.keyCode == 18 || op.keyCode == 20 || op.keyCode == 136 || op.keyCode == 137 ))
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.event == "video-event"){
    chrome.tabs.sendMessage(sender.tab.id, request.inputs);
  }
  else if(request.event == 'start-op'){

  }
  else if(request.event == 'end-op'){
    let opList = []
    for(let [k,v] of Object.entries(opMap)){
      if(rejectOp(v)) continue
      opList.push(v)
    }
    opList.sort((a,b)=> a.tabId - b.tabId || a.inFrame - b.inFrame || a.timeStamp - b.timeStamp || a.index - b.index)

    const childToParent = mergeKeyDownAndClickAndMouseUp(opList)
    mergeSeveralOperation(opList,childToParent)
    mergeKeyDownsInInputField(opList,childToParent)

    const mergedOpList = getMergedOpList(opList,childToParent)

    for(let op of mergedOpList){
      console.log(op)
    }

  }
  else if(request.event == 'add-op'){
    request.tabId = sender.tab.id
    opMap[request.id] = request
  }
  else if(request.event == 'remove-op'){
    delete opMap[request.id]
  }

});

//chrome.tabs,move,create,focus,close,detach,attach,widows系,back,forward,reload,go,domreadyとか

