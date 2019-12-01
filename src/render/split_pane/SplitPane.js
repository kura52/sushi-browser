import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Prefixer from 'inline-style-prefixer';
import stylePropType from 'react-style-proptype';

import Pane from './Pane';
import Resizer from './Resizer';
import PubSub from '../pubsub';
const ipc = require('electron').ipcRenderer


const USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.2 (KHTML, like Gecko) Safari/537.2';

function unFocus(document, window) {
  if (document.selection) {
    document.selection.empty();
  } else {
    try {
      window.getSelection().removeAllRanges();
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }
}

class SplitPane extends Component {
  constructor(...args) {
    super(...args);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onAlign = this.onAlign.bind(this);
    this.handleWheel = this.handleWheel.bind(this);

    this.windowIsMaximized = this.props.order == -1 ? _=>true : require('../MenuOperation').windowIsMaximized

    this.state = {
      active: false,
    };
  }

  componentWillMount() {
    this.setSize(this.props, void 0);
  }

  handleWheel(e){
    // if(!this.webview1){
    const now = Date.now()
    // const xMod = this.props.split === 'vertical' ? 11 : 0
    // const yMod = this.props.split === 'vertical' ? 0 : 50
    const xMod = 11
    const yMod = 50
    if(!this.preExec || now - this.preExec > 1000){
      const same = false
      this.webviews = new Set()
      this.webviews.add(document.elementFromPoint(e.clientX-xMod,e.clientY-yMod))
      this.webviews.add(document.elementFromPoint(e.clientX-xMod,e.clientY+yMod))
      this.webviews.add(document.elementFromPoint(e.clientX+xMod,e.clientY-yMod))
      this.webviews.add(document.elementFromPoint(e.clientX+xMod,e.clientY+yMod))
    }
    console.log('multi-scroll-webviews1')
    PubSub.publishSync('multi-scroll-webviews',{deltaY: - e.deltaY,
      webviews:this.webviews ? [...this.webviews] : []})
    // webviews:[{wv:this.webview1,x:e.clientX-xMod,y:e.clientY-yMod,c:0},{wv:this.webview2,x:e.clientX+xMod,y:e.clientY+yMod,c:1}]})

    this.preExec = now
    // }
  }


  componentDidMount() {
    this.resizer = ReactDOM.findDOMNode(this).querySelector(`.Resizer.r${this.props.k}`)
    this.resizer.addEventListener('wheel',this.handleWheel,{passive: true})

    // document.addEventListener('mouseup', this.onMouseUp);
    // document.addEventListener('mousemove', this.onMouseMove);
    // document.addEventListener('touchmove', this.onTouchMove);
    this.tokenResize = PubSub.subscribe("resizeWindow",(_,e)=>{
      this.onResize(e)
    })
    this.tokenAlign = PubSub.subscribe("align-panel",(_,e)=>{
      this.onAlign(e)
    })

    const rect = this.splitPane.getBoundingClientRect()
    console.log('didmount',rect)
    this.setState({width:rect.width, height:rect.height})
  }

  componentWillReceiveProps(nextProps) {
    this.setSize(this.props,nextProps);
  }

  componentDidUpdate(prevProps, prevState){
    if(prevProps.split != this.props.split){
      if(typeof (this.state.size) == "string" && this.state.size.includes("%")){
        return
      }
      this.onResize(this.props.split == "vertical" ? {new_w:this.state.width,old_w:this.state.height} : {new_h:this.state.height,old_h:this.state.width})
    }
    if(this.state.size != prevState.size){
      this.props.node.size = this.state.size
    }

    // const xMod = this.props.split === 'vertical' ? 11 : 0
    // const yMod = this.props.split === 'vertical' ? 0 : 11
    // const pos = ReactDOM.findDOMNode(this).querySelector(".Resizer").getBoundingClientRect()
    // this.webview1 = document.elementFromPoint(pos.left-xMod,pos.top-yMod)
    // this.webview2 = document.elementFromPoint(pos.left+xMod,pos.top+yMod)

  }

  componentWillUnmount() {
    this.resizer.addEventListener('wheel',this.handleWheel)
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('touchmove', this.onTouchMove);
    PubSub.unsubscribe(this.tokenResize)
    PubSub.unsubscribe(this.tokenAlign)
  }

  onMouseDown(event) {

    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('touchmove', this.onTouchMove);
    const eventWithTouches = Object.assign(
      {},
      event,
      { touches: [{ clientX: event.clientX, clientY: event.clientY }] },
    );
    this.onTouchStart(eventWithTouches);
  }

  onMouseOver(event) {
    // console.log('onMouseOver(event)', event)
    // event.target.style.borderLeft = '5px solid rgba(255, 255, 255, 0.1)'
    // event.target.style.borderRight = '5px solid rgba(255, 255, 255, 0.1)'
    // ipc.send('change-browser-view-z-index', true)
  }

  onMouseOut(event) {
    // console.log('onMouseOut(event)', event)
    // setTimeout(()=>{
    //   event.target.style.borderLeft = '5px solid rgba(255, 255, 255, 0)'
    //   event.target.style.borderRight = '5px solid rgba(255, 255, 255, 0)'
    // },1000)
    // ipc.send('change-browser-view-z-index', true)
  }

  onTouchStart(event) {
    if (this.props.allowResize) {
      unFocus(document, window);
      const position = this.props.split === 'vertical' ? event.touches[0].clientX : event.touches[0].clientY;
      if (typeof this.props.onDragStarted === 'function') {
        this.props.onDragStarted();
      }
      this.pane1 = this.pane1 || ReactDOM.findDOMNode(this).querySelector(".Pane1")
      this.setState({
        active: true,
        position
      });
    }
  }

  onMouseMove(event) {
    const eventWithTouches = Object.assign(
      {},
      event,
      { touches: [{ clientX: event.clientX, clientY: event.clientY }] },
    );
    this.onTouchMove(eventWithTouches);
  }

  onTouchMove(event) {
    if (this.props.allowResize) {
      if (this.state.active) {
        unFocus(document, window);
        if (this.pane1) {
          const node = this.pane1;

          const {width,height} = node.getBoundingClientRect()
          const current = this.props.split === 'vertical'
            ? event.touches[0].clientX
            : event.touches[0].clientY;
          const size = this.props.split === 'vertical'
            ? width
            : height;
          const position = this.state.position;
          const newPosition = position - current

          let maxSize = this.props.maxSize;
          if ((this.props.maxSize !== undefined) && (this.props.maxSize <= 0)) {
            const splPane = this.splitPane;
            if (this.props.split === 'vertical') {
              maxSize = this.state.width + this.props.maxSize;
            } else {
              maxSize = this.state.height + this.props.maxSize;
            }
          }

          let newSize = size - newPosition;
          this.setState({
            position: current,
            size: newSize
          });

          if (this.props.onChange) {
            this.props.onChange(current);
          }
        }
      }
    }
  }

  getFixedPanel(){
    return this.props.children.map(x=>{
      const match = x.key.match(/^fixed-(left|right|bottom|top)/)
      return match ? match[1] : void 0
    }).find(x=>x)
  }

  async onResize(event){
    console.log("eve",event)
    if(!event.old_w && !this.w){
      let maxBounds
      if(ipc.sendSync){
        maxBounds = JSON.parse(ipc.sendSync('get-sync-main-state','maxState'))
      }
      else{
       maxBounds = await new Promise(r=>{
         const key = Math.random().toString()
         ipc.send('get-sync-main-states',['maxState'],key)
         ipc.once(`get-sync-main-states-reply_${key}`, (e,result) => r(result[0]))
        })
      }
      event.old_w = maxBounds.maximize ? maxBounds.maxWidth : maxBounds.width
      event.old_h = maxBounds.maximize ? maxBounds.maxHeight : maxBounds.height
    }
    if (this.props.allowResize) {
      const rect = this.splitPane.getBoundingClientRect()
      const wh = {width:rect.width, height:rect.height}
      console.log(event,this.state.size,wh)
      // if(wh.width == this.state.width && wh.height == this.state.height) return

      unFocus(document, window);
      if(this.state.size == "100%"){
        this.setState({...wh})
        PubSub.publish("resize");
        return
      }
      let fPanel
      if(typeof (this.state.size) != "string" || !this.state.size.includes("%")){
        if((fPanel = this.getFixedPanel()) && (fPanel == "left" || fPanel == "top")){
          // this.setState({...wh})
          this.state.width = wh.width
          this.state.height = wh.height
        }
        else{
          console.log(3,this.state,event,wh)
          if(!this.state.width){
            this.state.width = wh.width
            this.state.height = wh.height
          }

          const fixedObj = this.props.existsAllFixedPanel()
          const wMod = fixedObj.left + fixedObj.right
          const hMod = fixedObj.top + fixedObj.bottom
          let ratio = this.props.split === 'vertical' ? (event.new_w - wMod) / ((event.old_w || this.w) - wMod): (event.new_h - hMod) / ((event.old_h || this.h) - hMod)
          if(isNaN(ratio)) ratio = 1
          const size = fPanel ? (this.props.split === 'vertical' ? wh.width - fixedObj.right : wh.height - fixedObj.bottom) : Math.round(this.state.size * ratio)
          console.log(size,fPanel,wh.width,fixedObj.right,wh.height,fixedObj.bottom,this.state.size,ratio,wMod,hMod,this.props.split)
          this.setState({...wh,size})
        }
      }
      PubSub.publish("resize");
    }
    this.w = event.new_w
    this.h = event.new_h
    this.props.notifyChange(Date.now())
  }

  onAlign(event){
    if (this.props.allowResize) {
      unFocus(document, window);
      console.log(this.props.k)
      if(this.getFixedPanel()) return
      const rates = event.map.get(this.props.k)
      const rate = this.props.split === 'vertical' ? rates[0] : rates[1]
      console.log(event)
      console.log(event.size*rate)
      if(this.props.split === event.dirc){
        this.setState({size:event.size*rate})
      }
      PubSub.publish("resize")
    }
    this.props.notifyChange(Date.now())
  }


  sizeChange(size,percent){
    if (this.props.allowResize) {
      unFocus(document, window);
      this.setState({size:percent ? `${size}%` : size})
      PubSub.publish("resize")
    }
    this.props.notifyChange(Date.now())
  }

  onMouseUp() {
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('touchmove', this.onTouchMove);
    if (this.props.allowResize) {
      if (this.state.active) {
        if (typeof this.props.onDragFinished === 'function') {
          this.props.onDragFinished(this.state.size);
        }
      }
      this.setState({active: false, position:undefined})
      this.pane1 = void 0
    }
    // this.props.notifyChange(Date.now())
  }

  setSize(props, nextProps) {
    if(isNaN(nextProps && nextProps.size)){
      console.log('setSize',props && props.size,nextProps && nextProps.size)
    }
    if(nextProps && props.size == nextProps.size) return
    if(!nextProps) nextProps = props

    this.setState({size : nextProps.size})
  }

  swapPosition(){
    if(typeof (this.state.size) == "string" && this.state.size.includes("%")){
      return
    }
    if(!this.state.width){
      const rect = this.splitPane.getBoundingClientRect()
      const wh = {width:rect.width, height:rect.height}
      this.state.width = wh.width
      this.state.height = wh.height
    }
    const size = (this.props.split === 'vertical' ? this.state.width : this.state.height) - this.state.size
    this.setState({size})
  }

  getSize(){
    if(this.state.width && this.state.height){
      return {width:this.state.width,height:this.state.height}
    }
    else{
      const rect = this.splitPane.getBoundingClientRect()
      const wh = {width:rect.width, height:rect.height}
      this.state.width = wh.width
      this.state.height = wh.height
      return wh
    }
  }

  render() {
    const { split, allowResize } = this.props;
    const disabledClass = allowResize ? '' : 'disabled';

    const style = Object.assign({},
      this.props.style || {}, {
        display: 'flex',
        flex: 1,
        position: 'relative',
        outline: 'none',
        overflow: 'hidden',
        MozUserSelect: 'text',
        WebkitUserSelect: 'text',
        msUserSelect: 'text',
        userSelect: 'text',
      });

    if (split === 'vertical') {
      Object.assign(style, {
        flexDirection: 'row',
        height: '100%',
        // position: 'absolute',
        left: 0,
        right: 0,
      });
    } else {
      Object.assign(style, {
        flexDirection: 'column',
        height: this.props.heightModify ? `calc(100% - ${this.props.heightModify}px)` : '100%',
        minHeight: this.props.heightModify ? `calc(100% - ${this.props.heightModify}px)` : '100%',
        // position: 'absolute',
        top: 0,
        bottom: 0,
        width: '100%',
      });
    }

    if(this.props.order===0 && !this.windowIsMaximized()){
      Object.assign(style, {
        border: "2px solid rgb(183, 183, 183)",
        // padding: 1,
        // backgroundColor: "rgb(212, 212, 212)"
        // border: "1px solid rgb(148, 148, 148)"
      })
    }

    const children = this.props.children;
    const classes = ['SplitPane', this.props.className, split, disabledClass];

    const pane1Style = this.props.prefixer.prefix(
      Object.assign({},
        this.props.paneStyle || {},
        this.props.pane1Style || {}),
    );

    const pane2Style = this.props.prefixer.prefix(
      Object.assign({},
        this.props.paneStyle || {},
        this.props.pane2Style || {}),
    );

    const size = this.state.size || this.props.minSize

    console.log('render',this.state.size,this.props.minSize)
    return (
      <div
        className={classes.join(' ')}
        style={this.props.prefixer.prefix(style)}
        ref={(node) => { this.splitPane = node; }}
      >

        <Pane
          key="pane1" className="Pane1"
          style={pane1Style}
          split={split}
          size={size}
        >
          {children[0]}
        </Pane>
        <Resizer
          key="resizer"
          className={`${size == "100%" || size == "0%" ? " hide" : ""} r${this.props.k}`}
          resizerClassName={this.props.resizerClassName}
          onMouseDown={this.onMouseDown}
          onMouseOver={this.onMouseOver}
          onMouseOut={this.onMouseOut}
          onTouchStart={this.onTouchStart}
          onTouchEnd={this.onMouseUp}
          style={this.props.resizerStyle || {}}
          split={split}
        />
        {!children[1] ? "" : <Pane
          key="pane2"
          className="Pane2"
          style={pane2Style}
          split={split}
          size={size.toString().includes("%") ? `calc(${100 - parseInt(size.replace("%",""))}% - 1px)` : `calc(100% - ${size + 1}px)`}
        >
          {children[1]}
        </Pane>}
      </div>
    );
  }
}

SplitPane.propTypes = {
  primary: PropTypes.oneOf(['first', 'second']),
  minSize: PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
  ]),
  maxSize: PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
  ]),
  size: PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
  ]),
  allowResize: PropTypes.bool,
  split: PropTypes.oneOf(['vertical', 'horizontal']),
  onDragStarted: PropTypes.func,
  onDragFinished: PropTypes.func,
  onChange: PropTypes.func,
  prefixer: PropTypes.instanceOf(Prefixer).isRequired,
  style: stylePropType,
  resizerStyle: stylePropType,
  paneStyle: stylePropType,
  pane1Style: stylePropType,
  pane2Style: stylePropType,
  className: PropTypes.string,
  resizerClassName: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
  notifyChange: PropTypes.func,
  existsAllFixedPanel: PropTypes.func,
  order: PropTypes.number
};

SplitPane.defaultProps = {
  split: 'vertical',
  minSize: 0,
  allowResize: true,
  prefixer: new Prefixer({ userAgent: USER_AGENT }),
  primary: 'first',
};

export default SplitPane;
