import React, {PropTypes} from 'react'
import {findDOMNode} from 'react-dom'
import toggleClass from './toggle-class'
import LimitRange from './limit-range'

const topLeftLimitRange = new LimitRange('top-left')
const topRightLimitRange = new LimitRange('top-right')
const downRightLimitRange = new LimitRange('down-right')
const downLeftLimitRange = new LimitRange('down-left')

class Selection extends React.Component {
  static propTypes = {
    target: PropTypes.string.isRequired,
    selectedClass: PropTypes.string,
    afterSelect: PropTypes.func,
    isLimit: PropTypes.bool,
    style: PropTypes.object
  }

  static defaultProps = {
    target: '.react-selection-target',
    selectedClass: 'react-selection-selected',
    isLimit: false,
    afterSelect() {

    }
  }

  state = {
    rectangleStyle: {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      opacity: 0,
    }
  }

  componentDidMount() {
    this._box = findDOMNode(this)
  }

  mousedown = (ev)=> {
    console.log(ev.srcElement.tagName,ev)
    if(ev.srcElement.tagName != "LI" && ev.srcElement.tagName != "UL" && ev.srcElement.tagName != "DIV") return
    if(ev.srcElement.classList.contains('infinite-tree-item')) return

    const targetSelect = this.props.target
    this.targets = Array.from(this._box.querySelectorAll(targetSelect))
    this.ctrlKey = (ev.ctrlKey || ev.metaKey)

    if (this.ctrlKey) {
      window.addEventListener('keyup', this.keyup, false)
    } else {
      this.props.clearSelect()
    }

    this.clickY = ev.pageY - ev.currentTarget.offsetTop
    this.clickX = ev.pageX - ev.currentTarget.offsetLeft

    document.addEventListener('mousemove', this.mousemove, false)
    document.addEventListener('mouseup', this.mouseup, false)
    window.selectMouseMove = this.mousemove
    window.selectMouseUp = this.mouseup
    window.selectClear = () => {
      this.state.rectangleStyle = {
        ...this.state.rectangleStyle,
        opacity: 0,
      }
    }
  }

  afterSelect = ()=> {
    const {afterSelect, selectedClass} = this.props
    afterSelect(this.targets.filter(t => t.classList.contains(selectedClass)))
  }

  keyup = (ev) =>{
    if (!this.ctrlKey) return
    this.afterSelect()
    window.removeEventListener('keyup', this.keyup)
  }

  mouseup = (ev)=> {
    const {isLimit} = this.props

    this.state.rectangleStyle = {
      ...this.state.rectangleStyle,
      opacity: 0,
    }
    const dom = ReactDOM.findDOMNode(this.refs.rect)
    dom.style.left = `${this.state.rectangleStyle.left}px`
    dom.style.top = `${this.state.rectangleStyle.top}px`
    dom.style.width = `${this.state.rectangleStyle.width}px`
    dom.style.height = `${this.state.rectangleStyle.height}px`
    dom.style.opacity = this.state.rectangleStyle.opacity

    document.removeEventListener('mousemove', this.mousemove)
    document.removeEventListener('mouseup', this.mouseup)

    if (this.ctrlKey) {
      this.targets.forEach((t)=> t.removeAttribute('data-is-double'))
    } else {
      this.afterSelect()
    }

    if (isLimit) {
      topLeftLimitRange.reset()
      topRightLimitRange.reset()
      downRightLimitRange.reset()
      downLeftLimitRange.reset()
    }
  }

  mousemove = (ev)=> {
    const moveX = (ev.pageX - this._box.offsetLeft) - this.clickX
    const moveY = (ev.pageY - this._box.offsetTop) - this.clickY
    const {isLimit} = this.props

    let rectangleSize = {}

    if (moveX < 0 && moveY < 0) { // top-left
      rectangleSize = {
        left: this.clickX + moveX,
        top: this.clickY + moveY,
        width: moveX * -1,
        height: moveY * -1,
      }

      if (isLimit) {
        rectangleSize = topLeftLimitRange.getNewSize({
          rectangle: rectangleSize,
          container: this._box,
        })
      }
    } else if (moveX > 0 && moveY > 0) { // down-right
      rectangleSize = {
        left: this.clickX,
        top: this.clickY,
        width: moveX,
        height: moveY,
      }

      if (isLimit) {
        rectangleSize = downRightLimitRange.getNewSize({
          rectangle: rectangleSize,
          container: this._box,
        })
      }
    } else if (moveX > 0 && moveY < 0) { // top-right
      rectangleSize = {
        left: this.clickX,
        top: this.clickY + moveY,
        width: moveX,
        height: moveY * -1,
      }

      if (isLimit) {
        rectangleSize = topRightLimitRange.getNewSize({
          rectangle: rectangleSize,
          container: this._box,
        })
      }
    } else if (moveX < 0 && moveY > 0) { // down-left
      rectangleSize = {
        left: this.clickX + moveX,
        top: this.clickY,
        width: moveX * -1,
        height: moveY,
      }

      if (isLimit) {
        rectangleSize = downLeftLimitRange.getNewSize({
          rectangle: rectangleSize,
          container: this._box,
        })
      }
    }

    this.state.rectangleStyle = {
      ...rectangleSize,
      opacity: 1,
    }

    const dom = ReactDOM.findDOMNode(this.refs.rect)
    dom.style.left = `${this.state.rectangleStyle.left}px`
    dom.style.top = `${this.state.rectangleStyle.top}px`
    dom.style.width = `${this.state.rectangleStyle.width}px`
    dom.style.height = `${this.state.rectangleStyle.height}px`
    dom.style.opacity = this.state.rectangleStyle.opacity

    this.targets.forEach((target)=> {
      const {selectedClass} = this.props
      const tar = {
        x: target.offsetLeft,
        y: target.offsetTop,
        xx: target.offsetLeft + target.offsetWidth,
        yy: target.offsetTop + target.offsetHeight,
      }

      const square = {
        x: rectangleSize.left,
        y: rectangleSize.top,
        xx: rectangleSize.left + rectangleSize.width,
        yy: rectangleSize.top + rectangleSize.height,
      }

      const isDouble = Math.max(tar.x, square.x) <= Math.min(tar.xx, square.xx) &&
        Math.max(tar.y, square.y) <= Math.min(tar.yy, square.yy)

      const hasDataDouble = target.dataset.isDouble === 'true' ? true : false

      if (this.ctrlKey) {
        if (isDouble !== hasDataDouble) {
          toggleClass(target, selectedClass)
          target.dataset.isDouble = isDouble
        }
      } else {
        toggleClass(target, isDouble, selectedClass)
      }
    })
  }

  // shouldComponentUpdate({target, selectedClass, isLimit},
  //   {rectangleStyle: {left, top, width, height, opacity}}) {
  //
  //   const {props, state: {rectangleStyle}} = this
  //
  //   return target !== props.target ||
  //       selectedClass !== props.selectedClass ||
  //       isLimit !== props.isLimit ||
  //       left !== rectangleStyle.left ||
  //       top !== rectangleStyle.top ||
  //       width !== rectangleStyle.width ||
  //       height !== rectangleStyle.height ||
  //       opacity !== rectangleStyle.opacity
  // }

  render() {
    const {children, target, ...props} = this.props
    return (
      <div {...props} className="react-selection" onMouseDown={this.mousedown} style={this.props.style}>
        {children}
        <div ref="rect" key="rect" className="react-selection-rectangle"/>
      </div>
    )
  }
}

module.exports = Selection
