const React = require('react')
const ReactDOM = require('react-dom');
const {Component} = React
const PubSub = require('./pubsub')

export default class ToolbarResizer extends Component{
  constructor(props){
    super(props)
    this.state = {}
    this.mup = ::this.mup
    this.mdown = ::this.mdown
    this.mmove = ::this.mmove
  }

  componentDidMount() {
    const navbar = ReactDOM.findDOMNode(this).parentNode
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

    this.y = event.pageY

    document.body.addEventListener("mousemove", this.mmove, false);
    document.body.addEventListener("touchmove", this.mmove, false);
    document.body.addEventListener("mouseleave", this.mup, false);
    document.body.addEventListener("touchleave", this.mup, false);
    document.body.addEventListener("mouseup", this.mup, false);
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

    const move = event.pageY - this.y
    this.y = event.pageY
    this.props.setHeight(this.props.height + (move * (this.props.minus ? -1 : 1)))
  }

  mup(e) {
    this.drag = false
    document.body.removeEventListener("mouseleave", this.mup, false);
    document.body.removeEventListener("touchleave", this.mup, false);
    document.body.removeEventListener("mousemove", this.mmove, false);
    document.body.removeEventListener("touchmove", this.mmove, false);
    document.body.removeEventListener("mouseup", this.mup, false);
    const drag = this.refs.dad
    this.props.setHeight(this.props.height,true)
  }

  render(){
    return <div key="dad" ref="dad" onMouseDown={this.mdown} className="hol-resizer" style={this.props.style}/>
  }
}