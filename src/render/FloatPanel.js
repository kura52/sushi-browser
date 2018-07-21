const React = require('react')
const ReactDOM = require('react-dom');
const {Component} = React
const PubSub = require('./pubsub')

let focus = 0
export default class FloatPanel extends Component{
  constructor(props){
    super(props)
    this.state = {style:{...this.props.style,zIndex:4}}
    this.mdown = ::this.mdown
    this.mmove = ::this.mmove
    this.mup = ::this.mup
    this.resizerDown = ::this.resizerDown
    this.resizerMove = ::this.resizerMove
    this.resizerUp = ::this.resizerUp

  }

  componentDidMount() {
    this.tokenMenuShow = PubSub.subscribe(`menu-showed_${this.props.k}`,(msg,show)=>{
      console.log(show,this.state.style.zIndex)
      if(show && this.state.style.zIndex == 4){
        this.state.style.zIndex = 5
        // this.state.style.pointerEvents = 'none'
        this.setState({})
        console.log(this.state)
      }
      else if(!show && this.state.style.zIndex == 5){
        this.state.style.zIndex = 4
        // this.state.style.pointerEvents = 'auto'
        this.setState({})
      }
    })
    this.tokenResize = PubSub.subscribe('resizeWindow',(_,e)=>{
      if(e.new_w){
        this.state.style.left = this.state.style.left * e.new_w / e.old_w
        this.state.style.top = this.state.style.top * e.new_h / e.old_h
      }
      this.setState({})
    })

    this.tokenZIndex= PubSub.subscribe('float-panel',(_,data)=>{
      if(data.key){
        if(this.props.k == data.key){
          if(!this.state.focus){
            this.setState({focus:true})
            PubSub.publish('float-panel-focus',this.props.k)
          }
        }
        else{
          if(this.state.focus){
            this.setState({focus:false})
          }
        }
      }
      if(data.ele){
        if(ReactDOM.findDOMNode(this.refs.dad) == data.ele){
          if(!this.state.focus){
            this.setState({focus:true})
            PubSub.publish('float-panel-focus',this.props.k)
          }
        }
        else{
          if(this.state.focus){
            this.setState({focus:false})
          }
        }
      }
    })

    this.tokenMaxmize = PubSub.subscribe(`maximize-float-panel_${this.props.k}`,_=>{
      if(this.state.maximize){
        this.state.style.left = this.state.normal.left
        this.state.style.top = this.state.normal.top
        this.state.style.width = this.state.normal.width
        this.state.style.height = this.state.normal.height
        console.log(444,this.state.style)
        const drag = this.refs.dad
        drag.style.left = this.state.normal.left ? `${this.state.style.left}px` : null
        drag.style.top = this.state.normal.top ? `${this.state.style.top}px` : null
        drag.style.width = this.state.normal.width ? `${this.state.style.width}px` : null
        drag.style.height = this.state.normal.height ? `${this.state.style.height}px` : null
        this.setState({maximize:false,normal:(void 0)})
      }
      else{
        const preStyle = {...this.state.style}
        this.state.style.left = 0
        this.state.style.top = 0
        this.state.style.width = '100%'
        this.state.style.height = '100%'
        const drag = this.refs.dad
        drag.style.left = this.state.style.left
        drag.style.top = this.state.style.top
        drag.style.width = this.state.style.width
        drag.style.height = this.state.style.height
        this.setState({maximize:true,normal:preStyle})
      }
    })

  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.tokenMenuShow)
    PubSub.unsubscribe(this.tokenResize)
    PubSub.unsubscribe(this.tokenZIndex)
    PubSub.unsubscribe(this.tokenMaxmize)
  }

  mdown(e) {
    const cName = e.target.className
    if(cName != 'navbar-margin' && cName != 'navbar-main browser-navbar' && cName != 'rdTabBar chrome-tabs-content'){
      return
    }

    if (this.clicked) {
      PubSub.publish(`maximize-float-panel_${this.props.k}`)
      this.clicked = false;
      return;
    }


    this.clicked = true;
    setTimeout( ()=> {
      this.clicked = false;
    }, 300);

    const ele = this.refs.dad
    this.drag = true
    this.first = true

    if(e.type === "mousedown") {
      var event = e;
    } else {
      var event = e.changedTouches[0];
    }

    this.x = event.pageX - ele.offsetLeft
    this.y = event.pageY - ele.offsetTop

    document.addEventListener("mousemove", this.mmove, false)
    document.addEventListener("touchmove", this.mmove, false)
  }


  mmove(e) {
    const drag = this.refs.dad

    if(e.type === "mousemove") {
      var event = e;
    } else {
      var event = e.changedTouches[0];
    }

    // e.preventDefault();

    this.state.style.left = event.pageX - this.x
    this.state.style.top = event.pageY - this.y
    drag.style.left = `${this.state.style.left}px`
    drag.style.top = `${this.state.style.top}px`
    this.props.children.children.webViewCreate()
    PubSub.publish(`move-window_${this.props.k}`)

    if(this.first){
      document.addEventListener("mouseleave", this.mup, false)
      document.addEventListener("touchleave", this.mup, false)
      this.first = false
    }
  }

  mup(e) {
    if(!this.drag) return
    this.drag = false
    document.removeEventListener("mouseleave", this.mup, false)
    document.removeEventListener("touchleave", this.mup, false)
    document.removeEventListener("mousemove", this.mmove, false)
    document.removeEventListener("touchmove", this.mmove, false)
    this.setState({})
  }


  resizerDown(e) {
    console.log(e)
    this.downEle = e.srcElement.classList[1]
    const ele = this.refs.dad
    this.dragResizer = true

    e.stopPropagation()
    e.preventDefault()

    if(e.type === "mousedown") {
      var event = e;
    } else {
      var event = e.changedTouches[0];
    }

    this.rect = ele.getBoundingClientRect()
    this.x = e.clientX
    this.y = e.clientY

    document.addEventListener("mousemove", this.resizerMove, false)
    document.addEventListener("touchmove", this.resizerMove, false)
    document.addEventListener("mouseup", this.resizerUp, false)
    document.addEventListener("touchend", this.resizerUp, false)
    document.addEventListener("mouseleave", this.resizerUp, false)
    document.addEventListener("touchleave", this.resizerUp, false)

  }

  resizerMove(e) {
    const isLeft = this.downEle.includes('left')
    const isRight = this.downEle.includes('right')

    const isTop = this.downEle.includes('top')
    const isBottom = this.downEle.includes('bottom')

    const ele = this.refs.dad

    if(isLeft || isRight){
      this.state.style.width = this.rect.width + (e.clientX - this.x) * (isLeft ? -1 : 1)
      ele.style.width = `${this.state.style.width}px`
    }

    if(isTop || isBottom){
      this.state.style.height = this.rect.height + (e.clientY - this.y) * (isTop ? -1 : 1)
      ele.style.height = `${this.state.style.height}px`
    }


    if(isTop){
      this.state.style.top = e.clientY
      ele.style.top = `${this.state.style.top}px`
    }
    if(isLeft){
      this.state.style.left = e.clientX
      ele.style.left = `${this.state.style.left}px`
    }
    this.props.children.children.webViewCreate()
    this.setState({})

  }

  resizerUp(e) {
    if(!this.dragResizer) return
    this.dragResizer = false
    document.removeEventListener("mouseleave", this.resizerUp, false)
    document.removeEventListener("touchleave", this.resizerUp, false)
    document.removeEventListener("mouseup", this.resizerUp, false)
    document.removeEventListener("touchend", this.resizerUp, false)
    document.removeEventListener("mousemove", this.resizerMove, false)
    document.removeEventListener("touchmove", this.resizerMove, false)
    this.setState({})
  }

  render(){
    const style = {...this.state.style}

    if(this.state.focus){
      style.zIndex += 2
    }
    return <div ref="dad" className={`drag-and-drop float-panel s${this.props.k}`} style={style}
                onMouseDown={this.mdown} onMouseUp={this.mup} >
      {this.props.children}
      <div ref="resizer-right" className="resizer-common resizer-right" onMouseDown={this.resizerDown}></div>
      <div ref="resizer-bottom" className="resizer-common resizer-bottom" onMouseDown={this.resizerDown}></div>
      <div ref="resizer-left" className="resizer-common resizer-left" onMouseDown={this.resizerDown}></div>
      <div ref="resizer-top" className="resizer-common resizer-top" onMouseDown={this.resizerDown}></div>
      <div ref="resizer-right-top" className="resizer-common resizer-right-top" onMouseDown={this.resizerDown}></div>
      <div ref="resizer-right-bottom" className="resizer-common resizer-right-bottom" onMouseDown={this.resizerDown}></div>
      <div ref="resizer-left-bottom" className="resizer-common resizer-left-bottom" onMouseDown={this.resizerDown}></div>
      <div ref="resizer-left-top" className="resizer-common resizer-left-top" onMouseDown={this.resizerDown}></div>
    </div>
  }
}