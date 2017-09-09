import React,{Component} from 'react'
const PubSub = require('./pubsub')
const isDarwin = navigator.userAgent.includes('Mac OS X')

const THRESHOLD = 100
function isFixedPanel(key){
  return key.startsWith('fixed-')
}

const zIndexes = {}
export default class PanelOverlay extends Component{
  constructor(props) {
    super(props)
    this.state = {dragOverElements:[],overlay: {}}
    this.handleMouseMove = ::this.handleMouseMove
    PubSub.subscribe('drag-over-overlay',(msg,{x,y})=>{
      this.handleMouseMove({clientX:x,clientX})
    })
  }

  componentWillMount(){
    const dragOverElements = []
    for(let ele of document.querySelectorAll('.browser-page-wrapper.visible')){
      const r =  ele.getBoundingClientRect()
      const wv = ele.querySelector("webview")
      dragOverElements.push({left:r.left,top:r.top,width:r.width,height:r.height,key:wv.className.slice(1),tabKey:wv.dataset.key})
    }
    this.fUpdate = true
    const max = {left: 9999999,top:9999999,width:window.innerWidth,height: window.innerHeight}
    for(let ele of document.querySelectorAll('.rdTabBar.chrome-tabs-content,.tab-base')){
      if(ele.style.zIndex != 11) zIndexes[ele] = ele.style.zIndex
      ele.style.zIndex = 11
    }
    const ele = document.querySelector(".dl-list")
    if(ele) ele.style.zIndex = 0

    this.setState({dragOverElements,max})
  }

  componentDidMount(){
    console.log(this.state)
  }

  componentWillReceiveProps(nextProps) {
    this.componentWillMount()
  }
  // shouldComponentUpdate(nextProps, nextState) {
    // const fUpdate = this.fUpdate
    // this.fUpdate = false
    // return fUpdate || JSON.stringify(this.state.overlay) !== JSON.stringify(nextState.overlay)
  // }

  componentWillUnmount(){
    for(let ele of document.querySelectorAll('.rdTabBar.chrome-tabs-content,.tab-base')){
      ele.style.zIndex = zIndexes[ele]
      delete zIndexes[ele]
    }
    const ele = document.querySelector(".dl-list")
    if(ele) ele.style.zIndex = 2

    this.setState({dragOverElements:[],overlay: {}})
  }

  handleMouseMove(e){
    const [x,y] = [e.clientX,e.clientY]
    let ret = {}
    this.state.dragOverElements.forEach((ele,i)=> {
      if(isFixedPanel(ele.key)) return
      if(x - ele.left > 0 && x - ele.left < THRESHOLD && ele.top <= y && y <= ele.top + ele.height){
        ret.left = ele.left
        ret.top = ele.top
        ret.width = THRESHOLD
        ret.height = ele.height
        ret.key = ele.key
        ret.tabKey = ele.tabKey
        ret.dirc = 'left'
      }
      else if(x - ele.left > ele.width - THRESHOLD && x - ele.left< ele.width && ele.top <= y && y <= ele.top + ele.height){
        ret.left = ele.left + ele.width - THRESHOLD
        ret.top = ele.top
        ret.width = THRESHOLD
        ret.height = ele.height
        ret.key = ele.key
        ret.tabKey = ele.tabKey
        ret.dirc = 'right'
      }
      // else if(y - ele.top > 0 && y - ele.top < THRESHOLD && ele.left <=x && x <= ele.left + ele.width){
      //   ret.left = ele.left
      //   ret.top = ele.top
      //   ret.width = ele.width
      //   ret.height = THRESHOLD
      //   ret.key = ele.key
      //   ret.tabKey = ele.tabKey
      //   ret.dirc = 'top'
      // }
      else if(y - ele.top > ele.height - THRESHOLD && y - ele.top< ele.height && ele.left <=x && x <= ele.left + ele.width){
        ret.left = ele.left
        ret.top = ele.top + ele.height - THRESHOLD
        ret.width = ele.width
        ret.height = THRESHOLD
        ret.key = ele.key
        ret.tabKey = ele.tabKey
        ret.dirc = 'bottom'
      }
    })

    if(JSON.stringify(this.state.overlay) !== JSON.stringify(ret)){
      setTimeout(_=>this.setState({overlay:ret}),10)
    }
  }

  render(){
    let max = this.state.max
    this.state.dragOverElements.forEach((ele,i)=>{
      max = {left: Math.min(max.left,ele.left),top: Math.min(max.top,ele.top),width: max.width,height: max.height}
    })

    const overlays = this.state.dragOverElements.map((ele,i)=>{
      const ov = this.state.overlay
      const o = !!ov.key
      const style = {left: ele.left - (o ? ov.left : max.left),top: ele.top - (o ? ov.top : max.top),width:ele.width,height:ele.height}
      return <div key={i} className="tabs-layout-overlay" style={style} onDragLeave={isDarwin ? (void 0) : this.handleMouseMove} onDragOver={this.handleMouseMove}/>
    })

    return <div className={`tabs-layout-overlay-wrapper${!this.state.overlay.key ? '' : ` visible ${this.state.overlay.dirc} o${this.state.overlay.key} o${this.state.overlay.tabKey}`}`} style={this.state.overlay.key ? this.state.overlay : max} onDragLeave={isDarwin ? (void 0) : this.handleMouseMove} onDragOver={this.handleMouseMove}>
      {overlays}
    </div>
  }
}
