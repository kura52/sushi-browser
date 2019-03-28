chrome.ipcRenderer = new Proxy({}, {
  get: (target, name) => {
    if(window.ipcRenderer && window.ipcRenderer.port) return window.ipcRenderer[name]
    return (...args) => {
      const id = setInterval(()=>{
        if(window.ipcRenderer && window.ipcRenderer.port){
          window.ipcRenderer[name](...args)
          clearInterval(id)
        }
      },10)
    }
  }
})

const ipc = chrome.ipcRenderer
const OP_THRESHOLD = 300
const automationURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/automation.html'
let ENABLE_RIGHT_MOUSE = false
let ENABLE_MIDDLE_MOUSE = false
let ENABLE_META_KEYS = false

chrome.idle.setDetectionInterval(60)
chrome.idle.onStateChanged.addListener(idleState => {
  if(idleState == "idle"){
    ipc.send('get-favicon', {})
    ipc.send('visit-timer', 'idle')
  }
  else if(idleState == "locked"){
    ipc.send('visit-timer', 'idle')
  }
  else{
    ipc.send('visit-timer', 'active')
  }
})

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

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


function mergeClickAndTabCreate(opList){
  const childToParent = {}
  let x = opList[0]
  for(let y of opList.slice(1)){
    if(left('click',x) && y.name == 'tabCreate' && y.now - x.now < 150){
      childToParent[y.key] = x.key
    }
    x = y
  }
  return childToParent
}

function mergeKeyDownAndClickAndMouseUp(opList,childToParent){
  let x = opList[0]
  for(let y of opList.slice(1)){
    if(isSameFrame(x,y)){
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
    else if(x.name == 'tabSelected' && !childToParent[x.key]){
      for(let j =i+1,len = opList.length;j<len;j++){
        const y = opList[j]
        if(!(y.name == 'tabSelected' && x.url == y.url)) break
        childToParent[y.key] = x.key
      }
    }
    else if(x.name == 'tabLoaded' && !childToParent[x.key]){
      for(let j =i+1,len = opList.length;j<len;j++){
        const y = opList[j]
        if(!(y.name == 'tabLoaded' && x.url == y.url)) break
        childToParent[y.key] = x.key
      }
    }
    else if(x.name == 'mousemove' && !childToParent[x.key]){
      for(let j =i+1,len = opList.length;j<len;j++){
        const y = opList[j]
        if(!(y.name == 'mousemove' && isSameFrame(x,y) && x.xpath == y.xpath)) break
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
  results.sort((a,b)=> a.now - b.now || a.index - b.index || a.tabId - b.tabId || a.frame - b.frame )

  return results
}

function rejectOp(op){
  return (!ENABLE_MIDDLE_MOUSE && op.button == 1) ||
    (!ENABLE_RIGHT_MOUSE && op.button == 2) ||
    (!ENABLE_META_KEYS && (op.keyCode == 16 || op.keyCode == 17 || op.keyCode == 18 || op.keyCode == 20 || op.keyCode == 136 || op.keyCode == 137 ))
}

function buildMergedList(){
  let opList = []
  for(let [k,v] of Object.entries(opMap)){
    if(rejectOp(v)) continue
    opList.push(v)
  }

  let ind = 0
  for(let [k,v] of Object.entries(opMap2)){
    opList.push({...v,key:k,index:++ind,frame:0})
  }

  opList.sort((a,b)=> a.now - b.now || a.index - b.index || a.tabId - b.tabId || a.frame - b.frame)
  const childToParent = mergeClickAndTabCreate(opList)

  opList.sort((a,b)=> a.tabId - b.tabId || a.frame - b.frame || a.now - b.now || a.index - b.index)

  mergeKeyDownAndClickAndMouseUp(opList,childToParent)
  mergeSeveralOperation(opList,childToParent)
  mergeScrollAndKeyDownsInInputField(opList,childToParent)

  return getMergedOpList(opList,childToParent)
}

function sendOps(){
  if(sendTime >= changeTime) return
  sendTime = Date.now()
  const mergedOpList = buildMergedList()

  let opList
  if(insertPos === void 0){
    opList = [...fixedOpList,...mergedOpList]
  }
  else{
    opList = [...fixedOpList.slice(0,insertPos),...mergedOpList,...fixedOpList.slice(insertPos+1)]
  }

  chrome.tabs.sendMessage(senderId,{event:'send-op', menuKey:currentKey, opList: JSON.stringify(opList)})
}

function addTabOp(name,tab,now){
  if(!fixedOpList.length && !Object.keys(opMap).length && !Object.keys(opMap2).length && op.name == 'tabSelected'){
    return
  }
  opMap2[uuidv4()] = {name,value:tab.url,url:tab.url,tabId:tab.id,now}
  console.log(opMap2)
  changeTime = Date.now()
}

function handleTabCreated(tab){
  const now = Date.now()
  console.log(tab)
  addTabOp('tabCreate',tab,now)
  if(tab.active) addTabOp('tabSelected',tab,now)
}

function handleTabActived(activeInfo){
  const now = Date.now()
  chrome.tabs.get(activeInfo.tabId, tab => {
    console.log(tab)
    if(tab.url == automationURL) return
    addTabOp('tabSelected',tab,now)
  })
}

function fixedOperations(){
  const mergedOpList = buildMergedList()
  opMap = {}
  opMap2 = {}
  if(insertPos === void 0){
    fixedOpList = [...fixedOpList,...mergedOpList]
  }
  else{
    fixedOpList = [...fixedOpList.slice(0,insertPos),...mergedOpList,...fixedOpList.slice(insertPos+1)]
  }
}

function handleTabRemoved(tabId, removeInfo){
  const now = Date.now()
  chrome.sessions.getRecentlyClosed(sessions => {
    const tab = sessions.find(x=>x.tab && x.tab.id == tabId).tab
    addTabOp('tabRemoved',tab,now)
  })
}

function handleWindowFocusChanged(windowId){
  const now = Date.now()
  chrome.tabs.query({active: true, windowId}, tabs => {
    const tab = tabs[0]
    if(tab.url != automationURL) addTabOp('tabSelected',tab,now)
  })
}

function handleNavigateEvent(details){
  const now = Date.now()
  chrome.tabs.query({active: true}, tabs => {
    const tab = tabs[0]
    if(tab.url != automationURL && tab.id == details.tabId && details.frameId == 0) addTabOp('tabLoaded',tab,now)
  })
}

function addTabEvents(){
  chrome.tabs.onCreated.addListener(handleTabCreated)
  chrome.tabs.onActivated.addListener(handleTabActived)
  chrome.tabs.onRemoved.addListener(handleTabRemoved)
  chrome.windows.onFocusChanged.addListener(handleWindowFocusChanged)
  chrome.webNavigation.onCompleted.addListener(handleNavigateEvent)
  // chrome.tabs.onMoved.addListener((tabId,{windowId,fromIndex,toIndex})=>{console.log('chrome.tabs.onMoved',tabId,{windowId,fromIndex,toIndex})})
  // chrome.tabs.onAttached.addListener((tabId,{newWindowId,newPosition})=>{console.log('chrome.tabs.onAttached',tabId,{newWindowId,newPosition})})
  // chrome.tabs.onDetached.addListener((tabId,{oldWindowId,oldPosition})=>{console.log('chrome.tabs.onDetached',tabId,{oldWindowId,oldPosition})})
  // chrome.windows.onCreated.addListener(window=>{console.log('chrome.windows.onCreated',window)})
  // chrome.windows.onRemoved.addListener(windowId=>console.log('chrome.windows.onRemoved',windowId))
}

function removeTabEvents() {
  chrome.tabs.onCreated.removeListener(handleTabCreated)
  chrome.tabs.onActivated.removeListener(handleTabActived)
  chrome.tabs.onRemoved.removeListener(handleTabRemoved)
  chrome.windows.onFocusChanged.removeListener(handleWindowFocusChanged)
  chrome.webNavigation.onCompleted.removeListener(handleNavigateEvent)
}

function endOp(){
  if(!currentKey) return

  clearInterval(intervalId)
  ipc.send('record-op',false)
  fixedOperations()
  allMap[currentKey] = fixedOpList
  saveOperations(currentKey)
  sendOps()
  removeTabEvents()
  currentKey = void 0
  opMap = {}
  opMap2 = {}
  insertPos = void 0
}

function saveOperations(menuKey){
  ipc.send('update-automation',menuKey,allMap[menuKey])
}

function getList(request) {
  let list
  if (currentKey && currentKey == request.menuKey) {
    fixedOperations()
    list = fixedOpList
  }
  else {
    list = allMap[request.menuKey] || []
  }
  return list;
}

let isStart,senderId,allMap = {},
  opMap, opMap2, fixedOpList, currentKey, insertPos,intervalId,
  changeTime = 0,sendTime = -1
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.event == "video-event"){
    chrome.tabs.sendMessage(sender.tab.id, {video: true,val: request.inputs});
  }
  else if(request.event == "stream-event"){
    chrome.tabs.sendMessage(sender.tab.id, {stream:true, val:request.val});
  }
  else if(request.event == 'start-op') {
    currentKey = request.key //MenuKey
    opMap = {}
    opMap2 = {}
    fixedOpList = allMap[currentKey] || []
    insertPos = void 0

    if(request.opKeys.length){
      const opKeys = new Set(request.opKeys)
      for(let i=fixedOpList.length-1;i>=0;i--){
        if(opKeys.has(fixedOpList[i].key)){
          insertPos = i
          break
        }
      }
    }

    senderId = sender.tab.id
    ipc.send('record-op', true)
    addTabEvents()
    intervalId = setInterval(sendOps,300)
  }
  else if(request.event == 'get-op') {
    const fixedOpList = getList(request)
    chrome.tabs.sendMessage(sender.tab.id,{event:'send-op', menuKey:request.menuKey, opList: JSON.stringify(fixedOpList)})
  }
  else if(request.event == 'update-op'){
    const fixedOpList = getList(request)
    const op = fixedOpList.find(op=>op.key == request.opKey)
    op[request.name] = request.value

    chrome.tabs.sendMessage(sender.tab.id,{event:'send-op', menuKey:request.menuKey, opList: JSON.stringify(fixedOpList)})
    saveOperations(request.menuKey)
  }
  else if(request.event == 'end-op'){
    endOp()
  }
  else if(request.event == 'add-op'){
    if(!fixedOpList.length && !Object.keys(opMap).length && !Object.keys(opMap2).length){
      let key = uuidv4()
      opMap[key] =  {key, name: 'navigate', value:request.url, url:request.url, tabId:sender.tab.id, now: request.now - 1}
      key = uuidv4()
      opMap[key] =  {key, name: 'tabLoaded', value:request.url, url:request.url, tabId:sender.tab.id, now: request.now - 1}
    }
    request.tabId = sender.tab.id
    opMap[request.key] = request //opKey
    changeTime = Date.now()
  }
  else if(request.event == 'remove-op'){
    const fixedOpList = getList(request)
    const index = fixedOpList.findIndex(op=>op.key == request.opKey)
    fixedOpList.splice(index,1)

    chrome.tabs.sendMessage(sender.tab.id,{event:'send-op', menuKey:request.menuKey, opList: JSON.stringify(fixedOpList)})
    saveOperations(request.menuKey)
  }
  else if(request.event == 'move-op'){
    const fixedOpList = getList(request)
    const dragKey = request.args[0][0]
    const dragIndex = fixedOpList.findIndex(op=>op.key == dragKey)
    const dragOp = fixedOpList.splice(dragIndex,1)[0]

    const dropKey = request.args[0][3]
    const dropIndex = fixedOpList.findIndex(op=>op.key == dropKey)
    fixedOpList.splice(dropIndex+1,0,dragOp)

    chrome.tabs.sendMessage(sender.tab.id,{event:'send-op', menuKey:request.menuKey, opList: JSON.stringify(fixedOpList)})
    saveOperations(request.menuKey)
  }
});

ipc.on('add-op',(e,op)=>{
  opMap2[op.key] = op
  changeTime = Date.now()
})

ipc.send('get-automation')
ipc.once('get-automation-reply',(e,datas)=>{
  console.log(e,datas)
  for(let data of datas){
    allMap[data.key] = data.ops
  }
})


const RegNormal = /^(application\/(font|javascript|json|x-javascript|xml)|text\/(css|html|javascript|plain))/
const RegRichMedia = /^(video|audio|application\/x\-mpegurl|application\/vnd\.apple\.mpegurl)/
const mime = require('mime')

chrome.webRequest.onHeadersReceived.addListener((details)=>{
  const headers = details.responseHeaders, newURL = details.url
  const contType = headers.find(x=>x.name == 'Content-Type' || x.name == 'content-type' || x.name == 'CONTENT-TYPE')
  if(!contType) return

  // console.log(contType[0])

  const matchNormal = contType && contType.value.match(RegNormal)
  // if(!matchNormal && ((contType && contType[0].match(RegForDL)) || newURL.match(RegForDLExt))){
    // console.log(6755,contType && contType[0],newURL,tab.getURL())
    // const url = details.firstPartyUrl
    // const map = cache.get(url)
    // if(map){
    //   map[newURL] = contType && contType[0]
    // }
    // else{
    //   cache.set(url,{[newURL]:contType && contType[0]})
    // }
  // }

  const urlMatch = newURL.match(/\.(mp4|webm|avi|3gp|m3u8)$/)
  if((!contType || matchNormal || contType.value.startsWith('image')) && !urlMatch) return

  let record,ret,parseUrl
  if(ret = (contType.value.match(RegRichMedia))){
    let len = headers.find(x=>x.name == 'Content-Length' || x.name == 'content-length' || x.name == 'CONTENT-LENGTH')
    len = len ? len.value : null
    parseUrl = new URL(newURL)
    const pathname = parseUrl.pathname
    const ind = pathname.lastIndexOf('/')
    record = {tabId:details.tabId,type:ret[0],contType,size:len,url:newURL,fname: pathname.slice(ind+1)}
  }
  else{
    let len = headers.find(x=>x.name == 'Content-Length' || x.name == 'content-length' || x.name == 'CONTENT-LENGTH')
    len = len ? len.value : null
    parseUrl = new URL(newURL)
    const pathname = parseUrl.pathname
    let type
    if(ret = (pathname && (type = mime.getType(pathname)) && type.match(RegRichMedia))){
      const ind = pathname.lastIndexOf('/')
      record = {tabId:details.tabId,type:ret[0],contType,size:len,url:newURL,fname: pathname.slice(ind+1)}
    }
    else if(urlMatch){
      const ind = pathname.lastIndexOf('/')
      record = {tabId:details.tabId,contType,size:len,url:newURL,fname: pathname.slice(ind+1)}
    }
  }


  if(record){
    ipc.send("did-get-response-details-main", record)
  }
},
  {urls: ['<all_urls>']},
  ['responseHeaders'])

chrome.downloads.onCreated.addListener((item)=>{
  ipc.send('download-start', item.finalUrl, item.filename)
  chrome.downloads.cancel(item.id)
  chrome.downloads.erase({id: item.id})
})

//chrome.tabs,move,create,focus,close,detach,attach,widows系,back,forward,reload,go,domreadyとか

