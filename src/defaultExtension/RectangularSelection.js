const ipc = chrome.ipcRenderer
const isWin = navigator.userAgent.includes('Windows')
const EOL = isWin ? "\r\n" : "\n"


export default class RectangularSelection{
  constructor(){
    this._replaceNodes = new Map()
    this.mdown = this.mdown.bind(this)
    this.mmove = this.mmove.bind(this)
    this.mup = this.mup.bind(this)
    this.keyDown = this.keyDown.bind(this)
    this.getTaskAndExec = this.getTaskAndExec.bind(this)

    document.addEventListener('mousedown',this.mdown,false)
  }


  rectCrossCheck(ax,ay,aw,ah,bx,by,bw,bh){
    return ax < bx + bw && bx < ax + aw && ay < by + bh && by < ay + ah
  }

  getTextNode(node){
    if(!node || this.set.has(node)) return
    this.set.add(node)
    for(let n of node.childNodes || []){
      if((n.constructor.name == 'Text' && !n.data.match(/^[ \t\r\n]+$/)) || n.tagName == 'V1_'){
        this.textNodes.set(n,node)
      }
      else{
        this.getTextNode(n)
      }
    }
  }

  selectRectangular(rect,replaceNodesPre){
    this.set = new Set()
    this.textNodes = new Map()

    for(let n of document.querySelectorAll("v2_")){
      if(n.style.color == 'white'){
        n.style.color = null
        n.style.backgroundColor = null
      }
    }

    this.getTextNode(document.body)

    // console.log(textNodes)
    console.log(rect.left, rect.top, rect.w, rect.h)
    const replaceNodes = new Map()
    for(let [text,parent] of this.textNodes) {
      const pRect = parent.getBoundingClientRect()
      if(!this.rectCrossCheck(rect.left, rect.top, rect.w, rect.h, pRect.x, pRect.y, pRect.width, pRect.height)) continue

      let vals
      if((vals = replaceNodesPre.get(parent))){
        if(replaceNodes.has(parent)){
          replaceNodes.get(parent).set(text,vals.get(text))
        }
        else{
          replaceNodes.set(parent,new Map([[text,vals.get(text)]]))
        }
        vals.delete(text)
        if(!vals.size) replaceNodesPre.delete(parent)
        continue
      }
      console.log(parent,text,replaceNodesPre,replaceNodesPre.get(parent))
      const virtual = document.createElement("v1_")
      virtual.style = "padding:0;margin:0;border:0;"
      virtual.innerHTML = text.data.split("").map(x=>`<v2_ style="padding:0;margin:0;border:0;">${x}</v2_>`).join("")
      parent.replaceChild(virtual,text)
      if(replaceNodes.has(parent)){
        replaceNodes.get(parent).set(virtual,text)
      }
      else{
        replaceNodes.set(parent,new Map([[virtual,text]]))
      }
    }

    for(let [parent,vals] of replaceNodesPre){
      for(let [virtual,text] of vals) {
        parent.replaceChild(text, virtual)
      }
    }
    // console.log(replaceNodes)

    for(let n of document.querySelectorAll("v2_")){
      const b = n.getBoundingClientRect()
      const x = b.x + b.width / 2.0
      const y = b.y + b.height / 2.0

      if(x >= rect.left && x <= rect.left + rect.w && y >= rect.top && y <= rect.top + rect.h){
        n.style.backgroundColor = "#3390ff"
        n.style.color = "white"
      }
    }
    console.log(111,replaceNodes)
    return replaceNodes
  }

  getTaskAndExec(){
    if(this.task && !this.exec){
      this.exec = true
      const task = this.task
      this.task = void 0
      task()
      this.exec = void 0
    }
  }

  mdown(e){
    // document.removeEventListener('mousedown',this.mdown,false)
    if(e.button !== 0) return

    if(e.altKey){
      this.task = void 0
      if(!this._clearId){
        this._clearId = setInterval(this.getTaskAndExec,250)
      }
      document.addEventListener('mouseup',this.mup,false)
      document.addEventListener('mousemove',this.mmove,false)
      this.canvas = document.createElement('canvas')
      this.canvas.style = 'position:fixed;top:0;left:0;z-index:9999999;cursor:crosshair;'
      this.canvas.width = document.body.scrollWidth
      this.canvas.height = document.body.scrollHeight

      document.body.appendChild(this.canvas)

      this.ctx = this.canvas.getContext('2d')
      this.rect = {}
      this.rect.startX = e.clientX
      this.rect.startY = e.clientY
      this.rect.scrollX = window.scrollX
      this.rect.scrollY = window.scrollY
      this.drag = true
    }
    else{
      this.task = void 0
      ipc.send('rectangular-selection',false)
      document.removeEventListener("keydown",this.keyDown,false)
      for(let [parent,vals] of this._replaceNodes){
        for(let [virtual,text] of vals) {
          parent.replaceChild(text, virtual)
        }
      }
      this._replaceNodes = new Map()
    }
  }

  mmove(e){
    if (this.drag) {
      const diffScrollX = this.rect.scrollX - window.scrollX
      const diffScrollY = this.rect.scrollY - window.scrollY
      this.rect.w = Math.abs(e.clientX - this.rect.startX) - diffScrollX
      this.rect.h = Math.abs(e.clientY - this.rect.startY) - diffScrollY
      this.rect.left = Math.min(e.clientX, this.rect.startX) + diffScrollX
      this.rect.top = Math.min(e.clientY, this.rect.startY) + diffScrollY

      // console.log(canvas.width,canvas.height,rect)
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)
      // ctx.setLineDash([2]);
      // ctx.fillStyle = "rgba(204,204,204,0.5)"
      this.ctx.strokeRect(this.rect.left, this.rect.top, this.rect.w, this.rect.h)
      // ctx.fill()
      this.task = _=> {this._replaceNodes = this.selectRectangular(this.rect,this._replaceNodes)}

    }
  }

  mup(e){
    this.drag = false
    document.body.removeChild(this.canvas)
    document.removeEventListener('mousemove',this.mmove,false)
    document.removeEventListener('mouseup',this.mup,false)

    this.task = _=> {
      this._replaceNodes = this.selectRectangular(this.rect,this._replaceNodes)

      let  i = 0, map = {}
      for(let n of document.querySelectorAll("v2_")){
        if(n.style.color !== 'white' || window.getComputedStyle(n).visibility == 'hidden') continue
        const rect = n.getBoundingClientRect()
        if(map[rect.y]){
          map[rect.y].push([i,rect,n])
        }
        else{
          map[rect.y] = [[i,rect,n]]
        }
        i++
      }

      const arr = []
      for(let [k,v] of Object.entries(map)){
        arr.push([v.length, k, v])
      }
      arr.sort((a,b)=> b - a)

      let n = 0, skip = new Set(), newArr = []
      for(let [len,y,v] of arr){
        if(skip.has(n++)) continue

        let m = n
        for(let [len2,y2,v2] of arr.slice(n)){
          if(skip.has(m)) continue
          if(Math.abs(y-y2) <= 3){
            v.push(...v2)
            skip.add(m)
          }
          m++
        }
        newArr.push(v)
      }

      let data = "",j = 0
      for(let v of newArr.sort((a,b)=>(a[0][1].y - b[0][1].y))){
        v.sort((a,b)=>(a[1].x - b[1].x == 0 ? a[0] - b[0] : a[1].x - b[1].x))
        data += v.map((x,i)=> (!v[i+1] || v[i+1][1].x - (x[1].x + x[1].width) < 10 ) ? x[2].innerText : `${x[2].innerText}\t`).join("")
        data += (newArr[j+1] && (newArr[j+1][0][1].y - (v[0][1].y + v[0][1].height)) > 10 ? EOL + EOL : EOL)
        j++
      }

      ipc.send('rectangular-selection',data)

      this.data = data
      document.addEventListener("keydown",this.keyDown,false)
    }

  }

  keyDown(e){
    if(e.ctrlKey && e.keyCode == 67){
      e.stopPropagation()
      e.preventDefault()
      ipc.send('set-clipboard',[this.data])
      return false
    }
  }

}
