const React = require('react')
const ReactDOM = require('react-dom');
const {Component} = React
const PubSub = require('./pubsub')

let x
export default class VerticalTabResizer extends Component{
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

    x = event.pageX

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

    const move = event.pageX - x
    x = event.pageX
    if(this.props.direction == "left"){
      this.props.setWidth(this.props.width + move)
    }
    else{
      this.props.setWidth(this.props.width - move)
    }
  }

  mup(e) {
    this.drag = false
    document.body.removeEventListener("mouseleave", this.mup, false);
    document.body.removeEventListener("touchleave", this.mup, false);
    document.body.removeEventListener("mousemove", this.mmove, false);
    document.body.removeEventListener("touchmove", this.mmove, false);
    document.body.removeEventListener("mouseup", this.mup, false);
    const drag = this.refs.dad
    this.props.setWidth(this.props.width,true)
  }

  render(){
    return  <div ref="dad" onMouseDown={this.mdown} className="vertical-resizer" />
  }
}