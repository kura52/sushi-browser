const React = require('react')
const ReactDOM = require('react-dom');
const {Component} = React
const PubSub = require('./pubsub')


function isFixedPanel(key){
  return key.startsWith('fixed-')
}

let x,y,right,top,left


export default class FloatSyncScrollButton extends Component{
  constructor(props){
    super(props)
    this.state = {}
    this.mup = ::this.mup
    this.mdown = ::this.mdown
    this.mmove = ::this.mmove
  }

  componentDidMount() {
    const navbar = ReactDOM.findDOMNode(this).parentNode
    this.token = PubSub.subscribe("move-dad-button",(msg)=>{
      this.setState({})
    })
    this.setState({style: {top:navbar.offsetTop + navbar.offsetHeight + 120}})

  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.token)
  }

  mdown(e) {
    const ele = this.refs.dad
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
    if(!this.drag) return
    const drag = this.refs.dad

    if(e.type === "mousemove") {
      var event = e;
    } else {
      var event = e.changedTouches[0];
    }

    e.preventDefault();

    ;[right,top,left] = ["auto",event.pageY - y + "px",event.pageX - x + "px"]
    drag.style.right = right;
    drag.style.top = top;
    drag.style.left = left;

  }

  mup(e) {
    this.drag = false
    document.body.removeEventListener("mouseleave", this.mup, false);
    document.body.removeEventListener("touchleave", this.mup, false);
    document.body.removeEventListener("mousemove", this.mmove, false);
    document.body.removeEventListener("touchmove", this.mmove, false);
    PubSub.publish("move-dad-button")
  }

  render(){
    let style = right ? {top,left,right} : this.state.style
    if(this.props.toggleNav == 2){
      if(!style) style = {}
      style.visibility = 'visible'
    }
    return <div ref="dad" className="drag-and-drop" style={Object.assign({paddingBottom:7},style)}
                onMouseDown={this.mdown} onMouseUp={this.mup}  onContextMenu={this.props.onContextMenu}>
        <a href="javascript:void(0)" className="drag-button" onMouseDown={(e)=>{this.props.scrollPage("back");e.stopPropagation()} }>

          <i className="fa fa-arrow-left"/>
        </a>
        <a href="javascript:void(0)" className="drag-button" onMouseDown={(e)=>{this.props.scrollPage("next");e.stopPropagation()} }>
          <i className="fa fa-arrow-right"/>
        </a>
      </div>
  }
}