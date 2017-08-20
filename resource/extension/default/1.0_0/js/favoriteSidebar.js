/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 22);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = vendor_library;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(0))(1);

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(0))(5);

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(0))(1238);

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(0))(554);

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _infernoCompat = __webpack_require__(1);

var _infernoCompat2 = _interopRequireDefault(_infernoCompat);

var _infernoServer = __webpack_require__(23);

var _infernoServer2 = _interopRequireDefault(_infernoServer);

var _infiniteTree = __webpack_require__(16);

var _infiniteTree2 = _interopRequireDefault(_infiniteTree);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

const lcfirst = str => {
    str += '';
    return str.charAt(0).toLowerCase() + str.substr(1);
};

module.exports = class extends _infernoCompat2.default.Component {
    constructor(...args) {
        var _temp;

        return _temp = super(...args), this.tree = null, this.eventHandlers = {
            onClick: null,
            onDoubleClick: null,
            onKeyDown: null,
            onKeyUp: null,
            onClusterWillChange: null,
            onClusterDidChange: null,
            onContentWillUpdate: null,
            onContentDidUpdate: null,
            onOpenNode: null,
            onCloseNode: null,
            onSelectNode: null,
            onWillOpenNode: null,
            onWillCloseNode: null,
            onWillSelectNode: null
        }, _temp;
    }

    componentDidMount() {
        const _props = this.props,
              { children, className, style } = _props,
              options = _objectWithoutProperties(_props, ['children', 'className', 'style']);

        const el = _infernoCompat2.default.findDOMNode(this);
        options.el = el;

        const rowRenderer = options.rowRenderer;
        options.rowRenderer = (node, opts) => {
            let row = rowRenderer(node, opts);
            if (typeof row === 'object') {
                // Use ReactDOMServer.renderToString() to render React Component
                row = _infernoServer2.default.renderToString(row);
            }
            return row;
        };

        this.tree = new _infiniteTree2.default(options);

        Object.keys(this.eventHandlers).forEach(key => {
            if (!this.props[key]) {
                return;
            }

            const eventName = lcfirst(key.substr(2)); // e.g. onContentWillUpdate -> contentWillUpdate
            this.eventHandlers[key] = this.props[key];
            this.tree.on(eventName, this.eventHandlers[key]);
        });
    }
    componentWillUnmount() {
        Object.keys(this.eventHandlers).forEach(key => {
            if (!this.eventHandlers[key]) {
                return;
            }

            const eventName = lcfirst(key.substr(2)); // e.g. onUpdate -> update
            this.tree.removeListener(eventName, this.eventHandlers[key]);
            this.eventHandlers[key] = null;
        });

        this.tree.destroy();
        this.tree = null;
    }
    render() {
        const { children, className, style } = this.props;

        return _infernoCompat2.default.createElement(
            'div',
            { className: className, style: style },
            children
        );
    }
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (margin) {
  return (node, treeOptions) => {
    const { id, name, loadOnDemand = false, children, state, props = {} } = node;
    const droppable = treeOptions.droppable && props.droppable;
    const { depth, open, path, total, loading = false, selected = false } = state;
    const childrenLength = children.filter(node => node.favicon != "empty").length;
    const more = node.type == "directory";
    const faviconEmpty = node.favicon == "empty";

    return _infernoCompat2.default.createElement(
      'div',
      {
        className: (0, _classnames2.default)('infinite-tree-item', { 'infinite-tree-selected': selected }),
        'data-id': id,
        'data-expanded': more && open,
        'data-depth': depth,
        'data-path': path,
        'data-selected': selected,
        'data-children': childrenLength,
        'data-total': total,
        droppable: 'true',
        draggable: 'true'
      },
      _infernoCompat2.default.createElement(
        'div',
        {
          className: 'infinite-tree-node',
          style: { marginLeft: depth * margin }
        },
        !more && loadOnDemand && _infernoCompat2.default.createElement(
          'a',
          { className: (0, _classnames2.default)(treeOptions.togglerClass, 'infinite-tree-closed') },
          _infernoCompat2.default.createElement('i', { 'aria-hidden': 'true', 'class': 'fa fa-caret-right caret' })
        ),
        more && open && _infernoCompat2.default.createElement(
          'a',
          { className: (0, _classnames2.default)(treeOptions.togglerClass) },
          _infernoCompat2.default.createElement('i', { 'aria-hidden': 'true', 'class': 'fa fa-caret-down caret' })
        ),
        more && !open && _infernoCompat2.default.createElement(
          'a',
          { className: (0, _classnames2.default)(treeOptions.togglerClass, 'infinite-tree-closed') },
          _infernoCompat2.default.createElement('i', { 'aria-hidden': 'true', 'class': 'fa fa-caret-right caret' })
        ),
        node.favicon ? faviconEmpty ? _infernoCompat2.default.createElement('span', { className: 'margin-left' }) : _infernoCompat2.default.createElement('img', { src: node.favicon, className: 'favi-favorite' }) : _infernoCompat2.default.createElement('i', {
          className: (0, _classnames2.default)('infinite-tree-folder-icon', 'fa', { 'fa-folder-open folder-open': more && open }, { 'fa-folder folder': (loadOnDemand || more) && !open }, { 'fa-file doc': !more && !loadOnDemand })
        }),
        _infernoCompat2.default.createElement(
          'span',
          { className: `"infinite-tree-title${faviconEmpty ? " date-slice" : ""}` },
          name
        ),
        _infernoCompat2.default.createElement('i', {
          style: { marginLeft: 5 },
          className: (0, _classnames2.default)({ 'hidden': !loading }, 'glyphicon', 'glyphicon-refresh', { 'rotating': loading })
        }),
        more ? _infernoCompat2.default.createElement(
          'span',
          { className: 'count' },
          childrenLength
        ) : null
      )
    );
  };
};

var _infernoCompat = __webpack_require__(1);

var _infernoCompat2 = _interopRequireDefault(_infernoCompat);

var _classnames = __webpack_require__(2);

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _infernoCompat = __webpack_require__(1);

var _infernoCompat2 = _interopRequireDefault(_infernoCompat);

var _toggleClass = __webpack_require__(21);

var _toggleClass2 = _interopRequireDefault(_toggleClass);

var _limitRange = __webpack_require__(20);

var _limitRange2 = _interopRequireDefault(_limitRange);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

const topLeftLimitRange = new _limitRange2.default('top-left');
const topRightLimitRange = new _limitRange2.default('top-right');
const downRightLimitRange = new _limitRange2.default('down-right');
const downLeftLimitRange = new _limitRange2.default('down-left');

class Selection extends _infernoCompat2.default.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.state = {
      rectangleStyle: {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        opacity: 0
      }
    }, this.mousedown = ev => {
      console.log(ev.srcElement.tagName, ev);
      if (ev.srcElement.tagName != "LI" && ev.srcElement.tagName != "UL" && ev.srcElement.tagName != "DIV") return;

      const targetSelect = this.props.target;
      this.targets = Array.from(this._box.querySelectorAll(targetSelect));
      this.ctrlKey = ev.ctrlKey || ev.metaKey;

      if (this.ctrlKey) {
        window.addEventListener('keyup', this.keyup, false);
      } else {
        this.props.clearSelect();
      }

      this.clickY = ev.pageY - ev.currentTarget.offsetTop;
      this.clickX = ev.pageX - ev.currentTarget.offsetLeft;

      document.addEventListener('mousemove', this.mousemove, false);
      document.addEventListener('mouseup', this.mouseup, false);
    }, this.afterSelect = () => {
      const { afterSelect, selectedClass } = this.props;
      afterSelect(this.targets.filter(t => t.classList.contains(selectedClass)));
    }, this.keyup = ev => {
      if (!this.ctrlKey) return;
      this.afterSelect();
      window.removeEventListener('keyup', this.keyup);
    }, this.mouseup = ev => {
      const { isLimit } = this.props;

      this.state.rectangleStyle = _extends({}, this.state.rectangleStyle, {
        opacity: 0
      });
      const dom = ReactDOM.findDOMNode(this.refs.rect);
      dom.style.left = `${this.state.rectangleStyle.left}px`;
      dom.style.top = `${this.state.rectangleStyle.top}px`;
      dom.style.width = `${this.state.rectangleStyle.width}px`;
      dom.style.height = `${this.state.rectangleStyle.height}px`;
      dom.style.opacity = this.state.rectangleStyle.opacity;

      document.removeEventListener('mousemove', this.mousemove);
      document.removeEventListener('mouseup', this.mouseup);

      if (this.ctrlKey) {
        this.targets.forEach(t => t.removeAttribute('data-is-double'));
      } else {
        this.afterSelect();
      }

      if (isLimit) {
        topLeftLimitRange.reset();
        topRightLimitRange.reset();
        downRightLimitRange.reset();
        downLeftLimitRange.reset();
      }
    }, this.mousemove = ev => {
      const moveX = ev.pageX - this._box.offsetLeft - this.clickX;
      const moveY = ev.pageY - this._box.offsetTop - this.clickY;
      const { isLimit } = this.props;

      let rectangleSize = {};

      if (moveX < 0 && moveY < 0) {
        // top-left
        rectangleSize = {
          left: this.clickX + moveX,
          top: this.clickY + moveY,
          width: moveX * -1,
          height: moveY * -1
        };

        if (isLimit) {
          rectangleSize = topLeftLimitRange.getNewSize({
            rectangle: rectangleSize,
            container: this._box
          });
        }
      } else if (moveX > 0 && moveY > 0) {
        // down-right
        rectangleSize = {
          left: this.clickX,
          top: this.clickY,
          width: moveX,
          height: moveY
        };

        if (isLimit) {
          rectangleSize = downRightLimitRange.getNewSize({
            rectangle: rectangleSize,
            container: this._box
          });
        }
      } else if (moveX > 0 && moveY < 0) {
        // top-right
        rectangleSize = {
          left: this.clickX,
          top: this.clickY + moveY,
          width: moveX,
          height: moveY * -1
        };

        if (isLimit) {
          rectangleSize = topRightLimitRange.getNewSize({
            rectangle: rectangleSize,
            container: this._box
          });
        }
      } else if (moveX < 0 && moveY > 0) {
        // down-left
        rectangleSize = {
          left: this.clickX + moveX,
          top: this.clickY,
          width: moveX * -1,
          height: moveY
        };

        if (isLimit) {
          rectangleSize = downLeftLimitRange.getNewSize({
            rectangle: rectangleSize,
            container: this._box
          });
        }
      }

      this.state.rectangleStyle = _extends({}, rectangleSize, {
        opacity: 1
      });

      const dom = ReactDOM.findDOMNode(this.refs.rect);
      dom.style.left = `${this.state.rectangleStyle.left}px`;
      dom.style.top = `${this.state.rectangleStyle.top}px`;
      dom.style.width = `${this.state.rectangleStyle.width}px`;
      dom.style.height = `${this.state.rectangleStyle.height}px`;
      dom.style.opacity = this.state.rectangleStyle.opacity;

      this.targets.forEach(target => {
        const { selectedClass } = this.props;
        const tar = {
          x: target.offsetLeft,
          y: target.offsetTop,
          xx: target.offsetLeft + target.offsetWidth,
          yy: target.offsetTop + target.offsetHeight
        };

        const square = {
          x: rectangleSize.left,
          y: rectangleSize.top,
          xx: rectangleSize.left + rectangleSize.width,
          yy: rectangleSize.top + rectangleSize.height
        };

        const isDouble = Math.max(tar.x, square.x) <= Math.min(tar.xx, square.xx) && Math.max(tar.y, square.y) <= Math.min(tar.yy, square.yy);

        const hasDataDouble = target.dataset.isDouble === 'true' ? true : false;

        if (this.ctrlKey) {
          if (isDouble !== hasDataDouble) {
            (0, _toggleClass2.default)(target, selectedClass);
            target.dataset.isDouble = isDouble;
          }
        } else {
          (0, _toggleClass2.default)(target, isDouble, selectedClass);
        }
      });
    }, _temp;
  }

  componentDidMount() {
    this._box = (0, _infernoCompat.findDOMNode)(this);
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
    const _props = this.props,
          { children, target } = _props,
          props = _objectWithoutProperties(_props, ['children', 'target']);
    return _infernoCompat2.default.createElement(
      'div',
      _extends({}, props, { className: 'react-selection', onMouseDown: this.mousedown }),
      children,
      _infernoCompat2.default.createElement('div', { ref: 'rect', className: 'react-selection-rectangle' })
    );
  }
}

Selection.propTypes = {
  target: _infernoCompat.PropTypes.string.isRequired,
  selectedClass: _infernoCompat.PropTypes.string,
  afterSelect: _infernoCompat.PropTypes.func,
  isLimit: _infernoCompat.PropTypes.bool
};
Selection.defaultProps = {
  target: '.react-selection-target',
  selectedClass: 'react-selection-selected',
  isLimit: false,
  afterSelect() {}
};
module.exports = Selection;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


window.process = {
  env: { NODE_ENV: 'development' },
  browser: true,
  cwd: () => window.location.pathname.match(/^(.+?)[\\/]{1,2}.+?\.html$/)[1]
};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(0))(1042);

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(0))(1047);

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(0))(1049);

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(0))(125);

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(0))(40);

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = chrome;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
const preventDefault = e => {
    if (typeof e.preventDefault !== 'undefined') {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }
};

const stopPropagation = e => {
    if (typeof e.stopPropagation !== 'undefined') {
        e.stopPropagation();
    } else {
        e.cancelBubble = true;
    }
};

// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Compatibility
const addEventListener = (target, type, listener) => {
    if (target.addEventListener) {
        // Standard
        target.addEventListener(type, listener, false);
    } else if (target.attachEvent) {
        // IE8
        // In Internet Explorer versions before IE 9, you have to use attachEvent rather than the standard addEventListener.
        target.attachEvent('on' + type, listener);
    }
};

// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener
const removeEventListener = (target, type, listener) => {
    if (target.removeEventListener) {
        // Standard
        target.removeEventListener(type, listener, false);
    } else if (target.detachEvent) {
        // IE8
        // In Internet Explorer versions before IE 9, you have to use detachEvent rather than the standard removeEventListener.
        target.detachEvent('on' + type, listener);
    }
};

exports.preventDefault = preventDefault;
exports.stopPropagation = stopPropagation;
exports.addEventListener = addEventListener;
exports.removeEventListener = removeEventListener;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _infiniteTree = __webpack_require__(17);

var _infiniteTree2 = _interopRequireDefault(_infiniteTree);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = _infiniteTree2.default;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint prefer-spread: 0 */
/* eslint operator-assignment: 0 */


var _events = __webpack_require__(28);

var _events2 = _interopRequireDefault(_events);

var _classnames = __webpack_require__(2);

var _classnames2 = _interopRequireDefault(_classnames);

var _clusterize = __webpack_require__(24);

var _clusterize2 = _interopRequireDefault(_clusterize);

var _elementClass = __webpack_require__(3);

var _elementClass2 = _interopRequireDefault(_elementClass);

var _isDom = __webpack_require__(27);

var _isDom2 = _interopRequireDefault(_isDom);

var _flattree = __webpack_require__(25);

var _lookupTable = __webpack_require__(18);

var _lookupTable2 = _interopRequireDefault(_lookupTable);

var _renderer = __webpack_require__(19);

var _domEvents = __webpack_require__(15);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const error = (...args) => {
    if (console && console.error) {
        const prefix = '[InfiniteTree]';
        console.error.apply(console, [prefix].concat(args));
    }
};

const ensureNodeInstance = node => {
    if (!node) {
        // undefined or null
        return false;
    }
    if (!(node instanceof _flattree.Node)) {
        error('The node must be a Node object.');
        return false;
    }
    return true;
};

const createRootNode = rootNode => {
    return Object.assign(rootNode || new _flattree.Node(), {
        parent: null,
        children: [],
        state: {
            depth: -1,
            open: true, // always open
            path: '',
            prefixMask: '',
            total: 0
        }
    });
};

class InfiniteTree extends _events2.default.EventEmitter {

    // Creates new InfiniteTree object.
    constructor(el, options) {
        super();

        this.options = {
            autoOpen: false,
            droppable: false,
            el: null,
            layout: 'div',
            loadNodes: null,
            noDataClass: 'infinite-tree-no-data',
            noDataText: 'No data',
            nodeIdAttr: 'data-id',
            rowRenderer: _renderer.defaultRowRenderer,
            selectable: true,
            shouldSelectNode: null,
            togglerClass: 'infinite-tree-toggler'
        };
        this.state = {
            openNodes: [],
            rootNode: createRootNode(),
            selectedNode: null
        };
        this.clusterize = null;
        this.nodeTable = new _lookupTable2.default();
        this.nodes = [];
        this.rows = [];
        this.scrollElement = null;
        this.contentElement = null;
        this.draggableTarget = null;
        this.droppableTarget = null;
        this.contentListener = {
            'click': event => {
                event = event || window.event;

                // Wrap stopPropagation that allows click event handler to stop execution
                // by setting the cancelBubble property
                const stopPropagation = event.stopPropagation;
                event.stopPropagation = function () {
                    // Setting the cancelBubble property in browsers that don't support it doesn't hurt.
                    // Of course it doesn't actually cancel the bubbling, but the assignment itself is safe.
                    event.cancelBubble = true;

                    if (stopPropagation) {
                        stopPropagation.call(event);
                    }
                };

                // Call setTimeout(fn, 0) to re-queues the execution of subsequent calls, it allows the
                // click event to bubble up to higher level event handlers before handling tree events.
                setTimeout(() => {
                    // Stop execution if the cancelBubble property is set to true by higher level event handlers
                    if (event.cancelBubble === true) {
                        return;
                    }

                    // Emit a "click" event
                    this.emit('click', event);

                    // Stop execution if the cancelBubble property is set to true after emitting the click event
                    if (event.cancelBubble === true) {
                        return;
                    }

                    let itemTarget = null;
                    let clickToggler = false;

                    if (event.target) {
                        itemTarget = event.target !== event.currentTarget ? event.target : null;
                    } else if (event.srcElement) {
                        // IE8
                        itemTarget = event.srcElement;
                    }

                    while (itemTarget && itemTarget.parentElement !== this.contentElement) {
                        if ((0, _elementClass2.default)(itemTarget).has(this.options.togglerClass)) {
                            clickToggler = true;
                        }
                        itemTarget = itemTarget.parentElement;
                    }

                    if (!itemTarget || itemTarget.hasAttribute('disabled')) {
                        return;
                    }

                    const id = itemTarget.getAttribute(this.options.nodeIdAttr);
                    const node = this.getNodeById(id);
                    if (!node) {
                        return;
                    }

                    // Click on the toggler to open/close a tree node
                    if (clickToggler) {
                        this.toggleNode(node);
                        return;
                    }

                    this.selectNode(node); // selectNode will re-render the tree
                }, 0);
            },
            'dblclick': event => {
                // Emit a "doubleClick" event
                this.emit('doubleClick', event);
            },
            'keydown': event => {
                // Emit a "keyDown" event
                this.emit('keyDown', event);
            },
            'keyup': event => {
                // Emit a "keyUp" event
                this.emit('keyUp', event);
            },
            // https://developer.mozilla.org/en-US/docs/Web/Events/dragstart
            // The dragstart event is fired when the user starts dragging an element or text selection.
            'dragstart': event => {
                event = event || window.event;

                this.draggableTarget = event.target || event.srcElement;
            },
            // https://developer.mozilla.org/en-US/docs/Web/Events/dragend
            // The dragend event is fired when a drag operation is being ended (by releasing a mouse button or hitting the escape key).
            'dragend': event => {
                console.log('dragend');
                event = event || window.event;

                const { hoverClass = '' } = this.options.droppable;

                // Draggable
                this.draggableTarget = null;

                // Droppable
                if (this.droppableTarget) {
                    (0, _elementClass2.default)(this.droppableTarget).remove(hoverClass);
                    this.droppableTarget = null;
                }
            },
            // https://developer.mozilla.org/en-US/docs/Web/Events/dragenter
            // The dragenter event is fired when a dragged element or text selection enters a valid drop target.
            'dragenter': event => {
                console.log('dragenter');
                event = event || window.event;

                let itemTarget = null;

                if (event.target) {
                    itemTarget = event.target !== event.currentTarget ? event.target : null;
                } else if (event.srcElement) {
                    // IE8
                    itemTarget = event.srcElement;
                }

                while (itemTarget && itemTarget.parentElement !== this.contentElement) {
                    itemTarget = itemTarget.parentElement;
                }

                if (!itemTarget) {
                    return;
                }

                if (this.droppableTarget === itemTarget) {
                    return;
                }

                const { accept, hoverClass = '' } = this.options.droppable;

                (0, _elementClass2.default)(this.droppableTarget).remove(hoverClass);
                this.droppableTarget = null;

                let canDrop = true; // Defaults to true

                if (typeof accept === 'function') {
                    const id = itemTarget.getAttribute(this.options.nodeIdAttr);
                    const node = this.getNodeById(id);

                    canDrop = !!accept.call(this, event, {
                        type: 'dragenter',
                        draggableTarget: this.draggableTarget,
                        droppableTarget: itemTarget,
                        node: node
                    });
                }

                if (canDrop) {
                    (0, _elementClass2.default)(itemTarget).add(hoverClass);
                    this.droppableTarget = itemTarget;
                }
            },
            // https://developer.mozilla.org/en-US/docs/Web/Events/dragover
            // The dragover event is fired when an element or text selection is being dragged over a valid drop target (every few hundred milliseconds).
            'dragover': event => {
                console.log('dragover');
                event = event || window.event;

                (0, _domEvents.preventDefault)(event);
            },
            // https://developer.mozilla.org/en-US/docs/Web/Events/drop
            // The drop event is fired when an element or text selection is dropped on a valid drop target.
            'drop': event => {
                console.log('drop');
                event = event || window.event;

                // prevent default action (open as link for some elements)
                (0, _domEvents.preventDefault)(event);

                if (!(this.draggableTarget && this.droppableTarget)) {
                    return;
                }

                const { accept, drop, hoverClass = '' } = this.options.droppable;
                const id = this.droppableTarget.getAttribute(this.options.nodeIdAttr);
                const node = this.getNodeById(id);

                let canDrop = true; // Defaults to true

                if (typeof accept === 'function') {
                    canDrop = !!accept.call(this, event, {
                        type: 'drop',
                        draggableTarget: this.draggableTarget,
                        droppableTarget: this.droppableTarget,
                        node: node
                    });
                }

                if (canDrop && typeof drop === 'function') {
                    drop.call(this, event, {
                        draggableTarget: this.draggableTarget,
                        droppableTarget: this.droppableTarget,
                        node: node
                    });
                }

                (0, _elementClass2.default)(this.droppableTarget).remove(hoverClass);
                this.droppableTarget = null;
            }
        };
        if ((0, _isDom2.default)(el)) {
            options = _extends({}, options, { el });
        } else {
            options = el;
        }

        // Assign options
        this.options = _extends({}, this.options, options);

        if (!this.options.el) {
            console.error('Failed to initialize infinite-tree: el is not specified.', options);
            return;
        }

        this.create();

        // Load tree data if it's provided
        if (options.data) {
            this.loadData(options.data);
        }
    }
    create() {
        if (!this.options.el) {
            error('The element option is not specified.');
        }

        let tag = null;

        this.scrollElement = document.createElement('div');

        if (this.options.layout === 'table') {
            const tableElement = document.createElement('table');
            tableElement.className = (0, _classnames2.default)('infinite-tree', 'infinite-tree-table');
            const contentElement = document.createElement('tbody');
            tableElement.appendChild(contentElement);
            this.scrollElement.appendChild(tableElement);
            this.contentElement = contentElement;

            // The tag name for supporting elements
            tag = 'tr';
        } else {
            const contentElement = document.createElement('div');
            this.scrollElement.appendChild(contentElement);
            this.contentElement = contentElement;

            // The tag name for supporting elements
            tag = 'div';
        }

        this.scrollElement.className = (0, _classnames2.default)('infinite-tree', 'infinite-tree-scroll');
        this.contentElement.className = (0, _classnames2.default)('infinite-tree', 'infinite-tree-content');

        this.options.el.appendChild(this.scrollElement);

        this.clusterize = new _clusterize2.default({
            tag: tag,
            rows: [],
            scrollElem: this.scrollElement,
            contentElem: this.contentElement,
            no_data_text: this.options.noDataText,
            no_data_class: this.options.noDataClass,
            callbacks: {
                clusterWillChange: () => {
                    this.emit('clusterWillChange');
                },
                clusterChanged: () => {
                    this.emit('clusterDidChange');
                }
            },
            options: {
                rows_in_block: 25,
                blocks_in_cluster: 8
            }
        });

        (0, _domEvents.addEventListener)(this.contentElement, 'click', this.contentListener.click);
        (0, _domEvents.addEventListener)(this.contentElement, 'dblclick', this.contentListener.dblclick);
        (0, _domEvents.addEventListener)(this.contentElement, 'keydown', this.contentListener.keydown);
        (0, _domEvents.addEventListener)(this.contentElement, 'keyup', this.contentListener.keyup);

        if (this.options.droppable) {
            (0, _domEvents.addEventListener)(document, 'dragstart', this.contentListener.dragstart);
            (0, _domEvents.addEventListener)(document, 'dragend', this.contentListener.dragend);
            (0, _domEvents.addEventListener)(this.contentElement, 'dragenter', this.contentListener.dragenter);
            (0, _domEvents.addEventListener)(this.contentElement, 'dragleave', this.contentListener.dragleave);
            (0, _domEvents.addEventListener)(this.contentElement, 'dragover', this.contentListener.dragover);
            (0, _domEvents.addEventListener)(this.contentElement, 'drop', this.contentListener.drop);
        }
    }
    destroy() {
        (0, _domEvents.removeEventListener)(this.contentElement, 'click', this.contentListener.click);
        (0, _domEvents.removeEventListener)(this.contentElement, 'dblclick', this.contentListener.dblclick);
        (0, _domEvents.removeEventListener)(this.contentElement, 'keydown', this.contentListener.keydown);
        (0, _domEvents.removeEventListener)(this.contentElement, 'keyup', this.contentListener.keyup);

        if (this.options.droppable) {
            (0, _domEvents.removeEventListener)(document, 'dragstart', this.contentListener.dragstart);
            (0, _domEvents.removeEventListener)(document, 'dragend', this.contentListener.dragend);
            (0, _domEvents.removeEventListener)(this.contentElement, 'dragenter', this.contentListener.dragenter);
            (0, _domEvents.removeEventListener)(this.contentElement, 'dragleave', this.contentListener.dragleave);
            (0, _domEvents.removeEventListener)(this.contentElement, 'dragover', this.contentListener.dragover);
            (0, _domEvents.removeEventListener)(this.contentElement, 'drop', this.contentListener.drop);
        }

        this.clear();

        if (this.clusterize) {
            this.clusterize.destroy(true); // True to remove all data from the list
            this.clusterize = null;
        }

        // Remove all child nodes
        while (this.contentElement.firstChild) {
            this.contentElement.removeChild(this.contentElement.firstChild);
        }
        while (this.scrollElement.firstChild) {
            this.scrollElement.removeChild(this.scrollElement.firstChild);
        }
        if (this.options.el) {
            const containerElement = this.options.el;
            while (containerElement.firstChild) {
                containerElement.removeChild(containerElement.firstChild);
            }
        }
        this.contentElement = null;
        this.scrollElement = null;
    }
    // Adds an array of new child nodes to a parent node at the specified index.
    // * If the parent is null or undefined, inserts new childs at the specified index in the top-level.
    // * If the parent has children, the method adds the new child to it at the specified index.
    // * If the parent does not have children, the method adds the new child to the parent.
    // * If the index value is greater than or equal to the number of children in the parent, the method adds the child at the end of the children.
    // @param {Array} newNodes An array of new child nodes.
    // @param {number} [index] The 0-based index of where to insert the child node.
    // @param {Node} parentNode The Node object that defines the parent node.
    // @return {boolean} Returns true on success, false otherwise.
    addChildNodes(newNodes, index, parentNode) {
        newNodes = [].concat(newNodes || []); // Ensure array
        if (newNodes.length === 0) {
            return false;
        }

        if (typeof index === 'object') {
            // The 'object' type might be Node or null
            parentNode = index || this.state.rootNode; // Defaults to rootNode if not specified
            index = parentNode.children.length;
        } else {
            parentNode = parentNode || this.state.rootNode; // Defaults to rootNode if not specified
        }

        if (!ensureNodeInstance(parentNode)) {
            return false;
        }

        if (typeof index !== 'number') {
            index = parentNode.children.length;
        }

        // Assign parent
        newNodes.forEach(newNode => {
            newNode.parent = parentNode;
        });

        // Insert new child node at the specified index
        parentNode.children.splice.apply(parentNode.children, [index, 0].concat(newNodes));

        // Get the index of the first new node within the array of child nodes
        index = parentNode.children.indexOf(newNodes[0]);

        const deleteCount = parentNode.state.total;
        const nodes = (0, _flattree.flatten)(parentNode.children, { openNodes: this.state.openNodes });
        const rows = nodes.map(node => this.options.rowRenderer(node, this.options));

        if (parentNode === this.state.rootNode) {
            this.nodes = nodes;
            this.rows = rows;
        } else {
            const parentOffset = this.nodes.indexOf(parentNode);
            if (parentOffset >= 0) {
                // Update nodes & rows
                this.nodes.splice.apply(this.nodes, [parentOffset + 1, deleteCount].concat(nodes));
                this.rows.splice.apply(this.rows, [parentOffset + 1, deleteCount].concat(rows));

                // Update the row corresponding to the parent node
                this.rows[parentOffset] = this.options.rowRenderer(parentNode, this.options);
            }
        }

        // Update the lookup table with newly added nodes
        parentNode.children.slice(index).forEach(childNode => {
            this.flattenNode(childNode).forEach(node => {
                if (node.id !== undefined) {
                    this.nodeTable.set(node.id, node);
                }
            });
        });

        // Updates list with new data
        this.update();

        return true;
    }
    // Adds a new child node to the end of the list of children of a specified parent node.
    // * If the parent is null or undefined, inserts the child at the specified index in the top-level.
    // * If the parent has children, the method adds the child as the last child.
    // * If the parent does not have children, the method adds the child to the parent.
    // @param {object} newNode The new child node.
    // @param {Node} parentNode The Node object that defines the parent node.
    // @return {boolean} Returns true on success, false otherwise.
    appendChildNode(newNode, parentNode) {
        // Defaults to rootNode if the parentNode is not specified
        parentNode = parentNode || this.state.rootNode;

        if (!ensureNodeInstance(parentNode)) {
            return false;
        }

        const index = parentNode.children.length;
        const newNodes = [].concat(newNode || []); // Ensure array
        return this.addChildNodes(newNodes, index, parentNode);
    }
    // Clears the tree.
    clear() {
        this.clusterize.clear();
        this.nodeTable.clear();
        this.nodes = [];
        this.rows = [];
        this.state.openNodes = [];
        this.state.rootNode = createRootNode(this.state.rootNode);
        this.state.selectedNode = null;
    }
    // Closes a node to hide its children.
    // @param {Node} node The Node object.
    // @param {object} [options] The options object.
    // @param {boolean} [options.silent] Pass true to prevent "closeNode" and "selectNode" events from being triggered.
    // @return {boolean} Returns true on success, false otherwise.
    closeNode(node, options) {
        const { silent = false } = _extends({}, options);

        if (!ensureNodeInstance(node)) {
            return false;
        }

        this.emit('willCloseNode', node);

        // Retrieve node index
        const nodeIndex = this.nodes.indexOf(node);
        if (nodeIndex < 0) {
            error('Invalid node index');
            return false;
        }

        // Check if the closeNode action can be performed
        if (this.state.openNodes.indexOf(node) < 0) {
            return false;
        }

        // Keep selected node unchanged if "node" is equal to "this.state.selectedNode"
        if (this.state.selectedNode && this.state.selectedNode !== node) {
            // row #0 - node.0         => parent node (total=4)
            // row #1   - node.0.0     => close this node; next selected node (total=2)
            // row #2       node.0.0.0 => selected node (total=0)
            // row #3       node.0.0.1
            // row #4     node.0.1
            const selectedIndex = this.nodes.indexOf(this.state.selectedNode);
            const rangeFrom = nodeIndex + 1;
            const rangeTo = nodeIndex + node.state.total;

            if (rangeFrom <= selectedIndex && selectedIndex <= rangeTo) {
                this.selectNode(node, options);
            }
        }

        node.state.open = false; // Set the open state to false
        const openNodes = this.state.openNodes.filter(node => {
            return node.hasChildren() && node.state.open;
        });
        this.state.openNodes = openNodes;

        const deleteCount = node.state.total;

        // Subtract the deleteCount for all ancestors (parent, grandparent, etc.) of the current node
        for (let p = node; p !== null; p = p.parent) {
            p.state.total = p.state.total - deleteCount;
        }

        // Update nodes & rows
        this.nodes.splice(nodeIndex + 1, deleteCount);
        this.rows.splice(nodeIndex + 1, deleteCount);

        // Update the row corresponding to the node
        this.rows[nodeIndex] = this.options.rowRenderer(node, this.options);

        if (!silent) {
            // Emit a "closeNode" event
            this.emit('closeNode', node);
        }

        // Updates list with new data
        this.update();

        return true;
    }
    // Flattens all child nodes of a parent node by performing full tree traversal using child-parent link.
    // No recursion or stack is involved.
    // @param {Node} parentNode The Node object that defines the parent node.
    // @return {array} Returns an array of Node objects containing all the child nodes of the parent node.
    flattenChildNodes(parentNode) {
        // Defaults to rootNode if the parentNode is not specified
        parentNode = parentNode || this.state.rootNode;

        if (!ensureNodeInstance(parentNode)) {
            return [];
        }

        let list = [];
        let node = parentNode.getFirstChild(); // Ignore parent node
        while (node) {
            list.push(node);
            if (node.hasChildren()) {
                node = node.getFirstChild();
            } else {
                // Find the parent level
                while (node.getNextSibling() === null && node.parent !== parentNode) {
                    // Use child-parent link to get to the parent level
                    node = node.getParent();
                }

                // Get next sibling
                node = node.getNextSibling();
            }
        }

        return list;
    }
    // Flattens a node by performing full tree traversal using child-parent link.
    // No recursion or stack is involved.
    // @param {Node} node The Node object.
    // @return {array} Returns a flattened list of Node objects.
    flattenNode(node) {
        if (!ensureNodeInstance(node)) {
            return [];
        }

        return [node].concat(this.flattenChildNodes(node));
    }
    // Gets a list of child nodes.
    // @param {Node} [parentNode] The Node object that defines the parent node. If null or undefined, returns a list of top level nodes.
    // @return {array} Returns an array of Node objects containing all the child nodes of the parent node.
    getChildNodes(parentNode) {
        // Defaults to rootNode if the parentNode is not specified
        parentNode = parentNode || this.state.rootNode;

        if (!ensureNodeInstance(parentNode)) {
            return [];
        }

        return parentNode.children;
    }
    // Gets a node by its unique id. This assumes that you have given the nodes in the data a unique id.
    // @param {string|number} id An unique node id. A null value will be returned if the id doesn't match.
    // @return {Node} Returns a node the matches the id, null otherwise.
    getNodeById(id) {
        let node = this.nodeTable.get(id);
        if (!node) {
            // Find the first node that matches the id
            node = this.nodes.filter(node => node.id === id)[0];
            if (!node) {
                return null;
            }
            this.nodeTable.set(node.id, node);
        }
        return node;
    }
    // Returns the node at the specified point. If the specified point is outside the visible bounds or either coordinate is negative, the result is null.
    // @param {number} x A horizontal position within the current viewport.
    // @param {number} y A vertical position within the current viewport.
    // @return {Node} The Node object under the given point.
    getNodeFromPoint(x, y) {
        let el = document.elementFromPoint(x, y);
        while (el && el.parentElement !== this.contentElement) {
            el = el.parentElement;
        }
        if (!el) {
            return null;
        }
        const id = el.getAttribute(this.options.nodeIdAttr);
        const node = this.getNodeById(id);

        return node;
    }
    // Gets an array of open nodes.
    // @return {array} Returns an array of Node objects containing open nodes.
    getOpenNodes() {
        // returns a shallow copy of an array into a new array object.
        return this.state.openNodes.slice();
    }
    // Gets the root node.
    // @return {Node} Returns the root node, or null if empty.
    getRootNode() {
        return this.state.rootNode;
    }
    // Gets the selected node.
    // @return {Node} Returns the selected node, or null if not selected.
    getSelectedNode() {
        return this.state.selectedNode;
    }
    // Gets the index of the selected node.
    // @return {number} Returns the index of the selected node, or -1 if not selected.
    getSelectedIndex() {
        return this.nodes.indexOf(this.state.selectedNode);
    }
    // Inserts the specified node after the reference node.
    // @param {object} newNode The new sibling node.
    // @param {Node} referenceNode The Node object that defines the reference node.
    // @return {boolean} Returns true on success, false otherwise.
    insertNodeAfter(newNode, referenceNode) {
        if (!ensureNodeInstance(referenceNode)) {
            return false;
        }

        const parentNode = referenceNode.getParent();
        const index = parentNode.children.indexOf(referenceNode) + 1;
        const newNodes = [].concat(newNode || []); // Ensure array

        return this.addChildNodes(newNodes, index, parentNode);
    }
    // Inserts the specified node before the reference node.
    // @param {object} newNode The new sibling node.
    // @param {Node} referenceNode The Node object that defines the reference node.
    // @return {boolean} Returns true on success, false otherwise.
    insertNodeBefore(newNode, referenceNode) {
        if (!ensureNodeInstance(referenceNode)) {
            return false;
        }

        const parentNode = referenceNode.getParent();
        const index = parentNode.children.indexOf(referenceNode);
        const newNodes = [].concat(newNode || []); // Ensure array

        return this.addChildNodes(newNodes, index, parentNode);
    }
    // Loads data in the tree.
    // @param {object|array} data The data is an object or array of objects that defines the node.
    loadData(data = [], noUpdate) {
        this.nodes = (0, _flattree.flatten)(data, { openAllNodes: this.options.autoOpen });

        // Clear lookup table
        this.nodeTable.clear();

        this.state.openNodes = this.nodes.filter(node => {
            return node.hasChildren() && node.state.open;
        });
        this.state.selectedNode = null;

        const rootNode = ((node = null) => {
            // Finding the root node
            while (node && node.parent !== null) {
                node = node.parent;
            }
            return node;
        })(this.nodes.length > 0 ? this.nodes[0] : null);

        this.state.rootNode = rootNode || createRootNode(this.state.rootNode); // Create a new root node if rootNode is null

        // Update the lookup table with newly added nodes
        this.flattenChildNodes(this.state.rootNode).forEach(node => {
            if (node.id !== undefined) {
                this.nodeTable.set(node.id, node);
            }
        });

        // Update rows
        this.rows = this.nodes.map(node => this.options.rowRenderer(node, this.options));

        // Updates list with new data
        if (!noUpdate) this.update();
    }
    // Moves a node from its current position to the new position.
    // @param {Node} node The Node object.
    // @param {Node} parentNode The Node object that defines the parent node.
    // @param {number} [index] The 0-based index of where to insert the child node.
    // @return {boolean} Returns true on success, false otherwise.
    moveNodeTo(node, parentNode, index) {
        if (!ensureNodeInstance(node) || !ensureNodeInstance(parentNode)) {
            return false;
        }

        for (let p = parentNode; p !== null; p = p.parent) {
            if (p === node) {
                error(`Cannot move an ancestor node (id=${node.id}) to the specified parent node (id=${parentNode.id}).`);
                return false;
            }
        }

        return this.removeNode(node) && this.addChildNodes(node, index, parentNode);
    }
    // Opens a node to display its children.
    // @param {Node} node The Node object.
    // @param {object} [options] The options object.
    // @param {boolean} [options.silent] Pass true to prevent "openNode" event from being triggered.
    // @return {boolean} Returns true on success, false otherwise.
    openNode(node, options, noUpdate) {
        const { silent = false } = _extends({}, options);

        if (!ensureNodeInstance(node)) {
            return false;
        }

        this.emit('willOpenNode', node);

        // Retrieve node index
        const nodeIndex = this.nodes.indexOf(node);
        if (nodeIndex < 0) {
            error('Invalid node index');
            return false;
        }

        // Check if the openNode action can be performed
        if (this.state.openNodes.indexOf(node) >= 0) {
            return false;
        }

        if (!node.hasChildren() && node.loadOnDemand) {
            if (typeof this.options.loadNodes !== 'function') {
                return false;
            }

            // Reentrancy not allowed
            if (node.state.loading === true) {
                return false;
            }

            // Set loading state to true
            node.state.loading = true;
            this.rows[nodeIndex] = this.options.rowRenderer(node, this.options);

            // Updates list with new data
            this.update();

            this.options.loadNodes(node, (err, nodes) => {
                // Set loading state to false
                node.state.loading = false;
                this.rows[nodeIndex] = this.options.rowRenderer(node, this.options);

                // Updates list with new data
                this.update();

                if (err) {
                    return;
                }
                if (!nodes) {
                    return;
                }

                nodes = [].concat(nodes || []); // Ensure array
                if (nodes.length === 0) {
                    return;
                }

                // Append child nodes
                nodes.forEach(childNode => {
                    this.appendChildNode(childNode, node);
                });

                // Ensure the node has children to prevent from infinite loop
                if (node.hasChildren()) {
                    // Call openNode again
                    this.openNode(node, options);
                }
            });

            return true;
        }

        node.state.open = true; // Set node.state.open to true
        const openNodes = [node].concat(this.state.openNodes); // the most recently used items first
        this.state.openNodes = openNodes;

        const nodes = (0, _flattree.flatten)(node.children, { openNodes: this.state.openNodes });
        const rows = nodes.map(node => this.options.rowRenderer(node, this.options));

        // Update nodes & rows
        this.nodes.splice.apply(this.nodes, [nodeIndex + 1, 0].concat(nodes));
        this.rows.splice.apply(this.rows, [nodeIndex + 1, 0].concat(rows));

        // Update the row corresponding to the node
        this.rows[nodeIndex] = this.options.rowRenderer(node, this.options);

        // Add all child nodes to the lookup table if the first child does not exist in the lookup table
        if (nodes.length > 0 && !this.nodeTable.get(nodes[0])) {
            nodes.forEach(node => {
                if (node.id !== undefined) {
                    this.nodeTable.set(node.id, node);
                }
            });
        }

        if (!silent) {
            // Emit a "openNode" event
            this.emit('openNode', node);
        }

        // Updates list with new data
        if (!noUpdate) this.update();

        return true;
    }
    // Removes all child nodes from a parent node.
    // @param {Node} parentNode The Node object that defines the parent node.
    // @param {object} [options] The options object.
    // @param {boolean} [options.silent] Pass true to prevent "selectNode" event from being triggered.
    // @return {boolean} Returns true on success, false otherwise.
    removeChildNodes(parentNode, options) {
        if (!ensureNodeInstance(parentNode)) {
            return false;
        }

        if (parentNode.children.length === 0) {
            return false;
        }
        if (parentNode === this.state.rootNode) {
            this.clear();
            return true;
        }

        const parentNodeIndex = this.nodes.indexOf(parentNode);

        // Update selected node
        if (parentNodeIndex >= 0 && this.state.selectedNode) {
            // row #0 - node.0         => parent node (total=4)
            // row #1   - node.0.0
            // row #2       node.0.0.0 => current selected node
            // row #3       node.0.0.1
            // row #4     node.0.1
            const selectedIndex = this.nodes.indexOf(this.state.selectedNode);
            const rangeFrom = parentNodeIndex + 1;
            const rangeTo = parentNodeIndex + parentNode.state.total;

            if (rangeFrom <= selectedIndex && selectedIndex <= rangeTo) {
                if (parentNode === this.state.rootNode) {
                    this.selectNode(null, options);
                } else {
                    this.selectNode(parentNode, options);
                }
            }
        }

        // Get the nodes being removed
        const removedNodes = this.flattenChildNodes(parentNode);

        // Get the number of nodes to be removed
        const deleteCount = parentNode.state.total;

        // Subtract the deleteCount for all ancestors (parent, grandparent, etc.) of the current node
        for (let p = parentNode; p !== null; p = p.parent) {
            p.state.total = p.state.total - deleteCount;
        }

        // Update parent node
        parentNode.children = [];
        parentNode.state.open = parentNode.state.open && parentNode.children.length > 0;

        if (parentNodeIndex >= 0) {
            // Update nodes & rows
            this.nodes.splice(parentNodeIndex + 1, deleteCount);
            this.rows.splice(parentNodeIndex + 1, deleteCount);

            // Update the row corresponding to the parent node
            this.rows[parentNodeIndex] = this.options.rowRenderer(parentNode, this.options);
        }

        {
            // Update open nodes and lookup table
            this.state.openNodes = this.state.openNodes.filter(node => {
                return removedNodes.indexOf(node) < 0 && node.hasChildren() && node.state.open;
            });

            removedNodes.forEach(node => {
                this.nodeTable.unset(node.id);
            });
        }

        // Updates list with new data
        this.update();

        return true;
    }
    // Removes a node and all of its child nodes.
    // @param {Node} node The Node object.
    // @param {object} [options] The options object.
    // @param {boolean} [options.silent] Pass true to prevent "selectNode" event from being triggered.
    // @return {boolean} Returns true on success, false otherwise.
    removeNode(node, options, noUpdate) {
        if (!ensureNodeInstance(node)) {
            return false;
        }

        const parentNode = node.parent;
        if (!parentNode) {
            return false;
        }

        // Retrieve node index
        const nodeIndex = this.nodes.indexOf(node);
        const parentNodeIndex = this.nodes.indexOf(parentNode);

        // Update selected node
        if (nodeIndex >= 0 && this.state.selectedNode) {
            // row #0 - node.0         => parent node (total=4)
            // row #1   - node.0.0     => remove this node (total=2)
            // row #2       node.0.0.0 => current selected node (total=0)
            // row #3       node.0.0.1
            // row #4     node.0.1     => next selected node (total=0)
            const selectedIndex = this.nodes.indexOf(this.state.selectedNode);
            const rangeFrom = nodeIndex;
            const rangeTo = nodeIndex + node.state.total + 1;

            if (rangeFrom <= selectedIndex && selectedIndex <= rangeTo) {
                // Change the selected node in the following order:
                // 1. next sibling node
                // 2. previous sibling node
                // 3. parent node
                const selectedNode = node.getNextSibling() || node.getPreviousSibling() || node.getParent();

                if (selectedNode === this.state.rootNode) {
                    this.selectNode(null, options);
                } else {
                    this.selectNode(selectedNode, options);
                }
            }
        }

        // Get the nodes being removed
        const removedNodes = this.flattenNode(node);

        // Get the number of nodes to be removed
        const deleteCount = node.state.total + 1;

        // Subtract the deleteCount for all ancestors (parent, grandparent, etc.) of the current node
        for (let p = parentNode; p !== null; p = p.parent) {
            p.state.total = p.state.total - deleteCount;
        }

        // Update parent node
        parentNode.children.splice(parentNode.children.indexOf(node), 1);
        parentNode.state.open = parentNode.state.open && parentNode.children.length > 0;

        if (nodeIndex >= 0) {
            // Update nodes & rows
            this.nodes.splice(nodeIndex, deleteCount);
            this.rows.splice(nodeIndex, deleteCount);
        }

        // Update the row corresponding to the parent node
        if (parentNodeIndex >= 0) {
            this.rows[parentNodeIndex] = this.options.rowRenderer(parentNode, this.options);
        }

        {
            // Update open nodes and lookup table
            this.state.openNodes = this.state.openNodes.filter(node => {
                return removedNodes.indexOf(node) < 0 && node.hasChildren() && node.state.open;
            });

            removedNodes.forEach(node => {
                this.nodeTable.unset(node.id);
            });
        }

        // Updates list with new data
        if (!noUpdate) this.update();

        return true;
    }
    // Sets the current scroll position to this node.
    // @param {Node} node The Node object.
    // @return {boolean} Returns true on success, false otherwise.
    scrollToNode(node) {
        if (!ensureNodeInstance(node)) {
            return false;
        }

        // Retrieve node index
        const nodeIndex = this.nodes.indexOf(node);
        if (nodeIndex < 0) {
            return false;
        }
        if (!this.contentElement) {
            return false;
        }

        // Scroll to a desired position
        let firstChild = this.contentElement.firstChild;
        while (firstChild) {
            const className = firstChild.className || '';
            if (className.indexOf('clusterize-extra-row') < 0 && firstChild.offsetHeight > 0) {
                break;
            }
            firstChild = firstChild.nextSibling;
        }
        // If all items in the list is the same height, it can be calculated by nodeIndex * height.
        const offsetHeight = firstChild && firstChild.offsetHeight || 0;
        if (offsetHeight > 0) {
            this.scrollTop(nodeIndex * offsetHeight);
        }

        // Find the absolute position of the node
        const nodeSelector = `[${this.options.nodeIdAttr}="${node.id}"]`;
        const nodeEl = this.contentElement.querySelector(nodeSelector);
        if (nodeEl) {
            this.scrollTop(nodeEl.offsetTop);
        }

        return true;
    }
    // Gets (or sets) the current vertical position of the scroll bar.
    // @param {number} [value] If the value is specified, indicates the new position to set the scroll bar to.
    // @return {number} Returns the vertical scroll position.
    scrollTop(value) {
        if (!this.scrollElement) {
            return 0;
        }
        if (value !== undefined) {
            this.scrollElement.scrollTop = Number(value);
        }
        return this.scrollElement.scrollTop;
    }
    // Selects a node.
    // @param {Node} node The Node object. If null or undefined, deselects the current node.
    // @param {object} [options] The options object.
    // @param {boolean} [options.autoScroll] Pass true to automatically scroll to the selected node. Defaults to true.
    // @param {boolean} [options.silent] Pass true to prevent "selectNode" event from being triggered. Defaults to false.
    // @return {boolean} Returns true on success, false otherwise.
    selectNode(node = null, options) {
        const { selectable, shouldSelectNode } = this.options;
        const { autoScroll = true, silent = false } = _extends({}, options);

        this.emit('willSelectNode', node);

        if (!selectable) {
            return false;
        }
        if (typeof shouldSelectNode === 'function' && !shouldSelectNode(node)) {
            return false;
        }
        if (node === this.state.rootNode) {
            return false;
        }

        if (node === null) {
            // Deselect the current node
            if (this.state.selectedNode) {
                const selectedNode = this.state.selectedNode;
                const selectedIndex = this.nodes.indexOf(this.state.selectedNode);

                selectedNode.state.selected = false;
                this.rows[selectedIndex] = this.options.rowRenderer(selectedNode, this.options);
                this.state.selectedNode = null;

                if (!silent) {
                    // Emit a "selectNode" event
                    this.emit('selectNode', null);
                }

                // Updates list with new data
                this.update();

                return true;
            }

            return false;
        }

        if (!ensureNodeInstance(node)) {
            return false;
        }

        // Retrieve node index
        const nodeIndex = this.nodes.indexOf(node);
        if (nodeIndex < 0) {
            error('Invalid node index');
            return false;
        }

        // Select this node
        if (this.state.selectedNode !== node) {
            node.state.selected = true;

            // Update the row corresponding to the node
            this.rows[nodeIndex] = this.options.rowRenderer(node, this.options);
        }

        // Deselect the current node
        if (this.state.selectedNode) {
            const selectedNode = this.state.selectedNode;
            const selectedIndex = this.nodes.indexOf(this.state.selectedNode);
            selectedNode.state.selected = false;
            this.rows[selectedIndex] = this.options.rowRenderer(selectedNode, this.options);
        }

        if (this.state.selectedNode !== node) {
            this.state.selectedNode = node;

            if (!silent) {
                // Emit a "selectNode" event
                this.emit('selectNode', node);
            }

            if (autoScroll) {
                const nodeSelector = `[${this.options.nodeIdAttr}="${node.id}"]`;
                const nodeEl = this.contentElement.querySelector(nodeSelector);
                if (nodeEl) {
                    const offsetTop = nodeEl.offsetTop || 0;
                    const offsetHeight = nodeEl.offsetHeight || 0;

                    // Scroll Up
                    if (offsetTop < this.scrollElement.scrollTop) {
                        this.scrollElement.scrollTop = offsetTop;
                    }

                    // Scroll Down
                    if (offsetTop + offsetHeight >= this.scrollElement.scrollTop + this.scrollElement.clientHeight) {
                        this.scrollElement.scrollTop += offsetHeight;
                    }
                }
            }
        } else {
            this.state.selectedNode = null;

            if (!silent) {
                // Emit a "selectNode" event
                this.emit('selectNode', null);
            }
        }

        // Updates list with new data
        this.update();

        return true;
    }
    // Swaps two nodes.
    // @param {Node} node1 The Node object.
    // @param {Node} node2 The Node object.
    // @return {boolean} Returns true on success, false otherwise.
    swapNodes(node1, node2) {
        if (!ensureNodeInstance(node1) || !ensureNodeInstance(node1.parent)) {
            return false;
        }
        if (!ensureNodeInstance(node2) || !ensureNodeInstance(node2.parent)) {
            return false;
        }

        const parentNode1 = node1.parent;
        const parentNode2 = node2.parent;

        for (let p = parentNode1; p !== null; p = p.parent) {
            if (p === node2) {
                error('Cannot swap two nodes with one being an ancestor of the other.');
                return false;
            }
        }
        for (let p = parentNode2; p !== null; p = p.parent) {
            if (p === node1) {
                error('Cannot swap two nodes with one being an ancestor of the other.');
                return false;
            }
        }

        const nodeIndex1 = parentNode1.children.indexOf(node1);
        const nodeIndex2 = parentNode2.children.indexOf(node2);

        return this.moveNodeTo(node1, parentNode2, nodeIndex2) && this.moveNodeTo(node2, parentNode1, nodeIndex1);
    }
    // Toggles a node to display or hide its children.
    // @param {Node} node The Node object.
    // @param {object} [options] The options object.
    // @param {boolean} [options.silent] Pass true to prevent "closeNode", "openNode", and "selectNode" events from being triggered.
    // @return {boolean} Returns true on success, false otherwise.
    toggleNode(node, options) {
        if (!ensureNodeInstance(node)) {
            return false;
        }

        if (this.state.openNodes.indexOf(node) >= 0) {
            // close node
            return this.closeNode(node, options);
        } else {
            // open node
            return this.openNode(node, options);
        }
    }
    // Serializes the current state of a node to a JSON string.
    // @param {Node} node The Node object. If null, returns the whole tree.
    // @return {string} Returns a JSON string represented the tree.
    toString(node = null) {
        const traverse = node => {
            let s = '[';
            if (node && node.children) {
                for (let i = 0; i < node.children.length; ++i) {
                    let list = [];
                    s = s + '{';
                    Object.keys(node).forEach(key => {
                        let value = node[key];
                        if (key === 'parent') {
                            // ignore parent
                            return;
                        }
                        if (key === 'children') {
                            // traverse child nodes
                            list.push('"' + key + '":' + traverse(node.children[i]));
                            return;
                        }
                        if (typeof value === 'string' || typeof value === 'object') {
                            list.push('"' + key + '":' + JSON.stringify(value));
                        } else {
                            // primitive types
                            list.push('"' + key + '":' + value);
                        }
                    });
                    s = s + list.join(',');
                    s = s + '}' + (i === node.children.length - 1 ? '' : ',');
                }
            }
            s = s + ']';
            return s;
        };

        if (!node) {
            node = this.state.rootNode;
        }

        return traverse(node);
    }
    // Updates the tree.
    update() {
        // Emit a "contentWillUpdate" event
        this.emit('contentWillUpdate');

        // Update the list with new data
        this.clusterize.update(this.rows);

        // Emit a "contentWillUpdate" event
        this.emit('contentDidUpdate');
    }
    // Updates the data of a node.
    // @param {Node} node The Node object.
    // @param {object} data The data object.
    // @param {object} [options] The options object.
    // @param {boolean} [options.shallowRendering] True to render only the parent node, false to render the parent node and all expanded child nodes. Defaults to false.
    updateNode(node, data, options, noUpdate) {
        if (!ensureNodeInstance(node)) {
            return;
        }

        // Clone a new one
        data = _extends({}, data);

        if (data.id !== undefined && data.id !== null) {
            this.nodeTable.unset(node.id);
            this.nodeTable.set(data.id, node);
            node.id = data.id;
        }

        // Ignore keys: id, children, parent, and state
        delete data.id;
        delete data.children;
        delete data.parent;
        delete data.state;

        node = Object.assign(node, data);

        // Retrieve node index
        const nodeIndex = this.nodes.indexOf(node);
        if (nodeIndex >= 0) {
            const { shallowRendering = false } = _extends({}, options);

            // Update the row corresponding to the node
            this.rows[nodeIndex] = this.options.rowRenderer(node, this.options);

            if (!shallowRendering) {
                const rangeFrom = nodeIndex + 1;
                const rangeTo = nodeIndex + node.state.total;
                for (let index = rangeFrom; index <= rangeTo; ++index) {
                    this.rows[index] = this.options.rowRenderer(this.nodes[index], this.options);
                }
            }

            // Updates list with new data
            if (!noUpdate) this.update();
        }
    }
}

exports.default = InfiniteTree;
module.exports = exports['default'];

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
class LookupTable {
    constructor() {
        this.data = {};
    }

    clear() {
        this.data = {};
    }
    get(key) {
        return this.data[key];
    }
    has(key) {
        return this.data[key] !== undefined;
    }
    set(key, value) {
        this.data[key] = value;
        return value;
    }
    unset(key) {
        if (this.data[key] !== undefined) {
            delete this.data[key];
        }
    }
}

exports.default = LookupTable;
module.exports = exports["default"];

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.defaultRowRenderer = undefined;

var _classnames = __webpack_require__(2);

var _classnames2 = _interopRequireDefault(_classnames);

var _escapeHtml = __webpack_require__(4);

var _escapeHtml2 = _interopRequireDefault(_escapeHtml);

var _html5Tag = __webpack_require__(26);

var _html5Tag2 = _interopRequireDefault(_html5Tag);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const defaultRowRenderer = (node, treeOptions) => {
    const { id, name, loadOnDemand = false, children, state } = node;
    const droppable = treeOptions.droppable;
    const { depth, open, path, total, selected = false } = state;
    const childrenLength = Object.keys(children).length;
    const more = node.hasChildren();

    let togglerContent = '';
    if (!more && loadOnDemand) {
        togglerContent = '►';
    }
    if (more && open) {
        togglerContent = '▼';
    }
    if (more && !open) {
        togglerContent = '►';
    }
    const toggler = (0, _html5Tag2.default)('a', {
        'class': (() => {
            if (!more && loadOnDemand) {
                return (0, _classnames2.default)(treeOptions.togglerClass, 'infinite-tree-closed');
            }
            if (more && open) {
                return (0, _classnames2.default)(treeOptions.togglerClass);
            }
            if (more && !open) {
                return (0, _classnames2.default)(treeOptions.togglerClass, 'infinite-tree-closed');
            }
            return '';
        })()
    }, togglerContent);
    const title = (0, _html5Tag2.default)('span', {
        'class': (0, _classnames2.default)('infinite-tree-title')
    }, (0, _escapeHtml2.default)(name));
    const treeNode = (0, _html5Tag2.default)('div', {
        'class': 'infinite-tree-node',
        'style': `margin-left: ${depth * 18}px`
    }, toggler + title);

    return (0, _html5Tag2.default)('div', {
        'data-id': id,
        'data-expanded': more && open,
        'data-depth': depth,
        'data-path': path,
        'data-selected': selected,
        'data-children': childrenLength,
        'data-total': total,
        'class': (0, _classnames2.default)('infinite-tree-item', { 'infinite-tree-selected': selected }),
        'droppable': droppable
    }, treeNode);
}; /* eslint import/prefer-default-export: 0 */
exports.defaultRowRenderer = defaultRowRenderer;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/**
 *
 * @param rectangle
 * @param container
 * @param direction top-left, top-right, down-right, down-left
 */
class LimitRange {
  constructor(direction = '') {
    this.freezeWidth = false;
    this.freezeHeight = false;

    this.direction = direction;
  }

  getNewSize({ rectangle, container }) {
    const { left, top, width, height } = rectangle;
    const { offsetWidth, offsetHeight } = container;
    const size = _extends({}, rectangle);

    const maxWidth = offsetWidth - left;
    const maxHeight = offsetHeight - top;

    switch (this.direction) {
      case 'top-left':
        if (left <= 0) {
          if (!this.freezeWidth) this.freezeWidth = width + left;
          size.left = 0;
          size.width = this.freezeWidth;
        }

        if (top <= 0) {
          if (!this.freezeHeight) this.freezeHeight = height + top;
          size.top = 0;
          size.height = this.freezeHeight;
        }
        break;

      case 'top-right':
        if (maxWidth - width <= 0) {
          if (!this.freezeWidth) this.freezeWidth = maxWidth;
          size.width = this.freezeWidth;
        }

        if (top <= 0) {
          size.top = 0;
          if (!this.freezeHeight) this.freezeHeight = height;
          size.height = this.freezeHeight;
        }
        break;

      case 'down-right':
        if (maxWidth - width <= 0) {
          if (!this.freezeWidth) this.freezeWidth = maxWidth;
          size.width = this.freezeWidth;
        }

        if (maxHeight - height <= 0) {
          if (!this.freezeHeight) this.freezeHeight = maxHeight;
          size.height = this.freezeHeight;
        }
        break;

      case 'down-left':
        if (maxHeight - height <= 0) {
          if (!this.freezeHeight) this.freezeHeight = maxHeight;
          size.height = this.freezeHeight;
        }
        if (left <= 0) {
          if (!this.freezeWidth) this.freezeWidth = width + left;
          size.left = 0;
          size.width = this.freezeWidth;
        }

        break;
    }
    return size;
  }

  reset() {
    this.freezeWidth = false;
    this.freezeHeight = false;

    return this;
  }
}

module.exports = LimitRange;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const toggleClass = function (el, condition, className) {
  let toggle = condition ? 'add' : 'remove';

  if (typeof condition === 'string' && arguments.length === 2) {
    className = condition;
    toggle = el.classList.contains(className) ? 'remove' : 'add';
  }

  el.classList[toggle](className);

  return el;
};

module.exports = toggleClass;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


let getAllChildren = (() => {
  var _ref = _asyncToGenerator(function* (nodePath) {
    const dbKey = path.basename(nodePath);
    const ret = yield getAllFavorites([dbKey]);
    // console.log(treeBuild(ret,nodePath))
    return treeBuild(ret, nodePath)[0].children;
  });

  return function getAllChildren(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _process = __webpack_require__(8);

var _process2 = _interopRequireDefault(_process);

var _classnames = __webpack_require__(2);

var _classnames2 = _interopRequireDefault(_classnames);

var _elementClass = __webpack_require__(3);

var _elementClass2 = _interopRequireDefault(_elementClass);

var _escapeHtml = __webpack_require__(4);

var _escapeHtml2 = _interopRequireDefault(_escapeHtml);

var _index = __webpack_require__(7);

var _index2 = _interopRequireDefault(_index);

var _reactInfiniteTree = __webpack_require__(5);

var _reactInfiniteTree2 = _interopRequireDefault(_reactInfiniteTree);

var _renderer = __webpack_require__(6);

var _renderer2 = _interopRequireDefault(_renderer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

window.debug = __webpack_require__(12)('info');

const ipc = __webpack_require__(14).ipcRenderer;
const uuid = __webpack_require__(9);
const React = __webpack_require__(1);
const ReactDOM = __webpack_require__(1);
const path = __webpack_require__(13);
const { StickyContainer, Sticky } = __webpack_require__(10);
const { Menu, Segment, Input } = __webpack_require__(11);

const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd';

let resourcePath;
let setTime = localStorage.getItem('favicon-set');
ipc.send("favicon-get", setTime ? parseInt(setTime) : null);
ipc.once("favicon-get-reply", (e, ret) => {
  localStorage.setItem('favicon-set', Date.now().toString());
  for (let [k, v] of Object.entries(ret)) {
    localStorage.setItem(k, v);
  }
});

function faviconGet(x) {
  return x.favicon == "resource/file.png" ? void 0 : x.favicon && localStorage.getItem(x.favicon);
}

ipc.send("get-resource-path", {});
ipc.once("get-resource-path-reply", (e, data) => {
  resourcePath = data;
});

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function showDialog(input) {
  return new Promise((resolve, reject) => {
    const key = uuid.v4();
    ipc.send('show-dialog-exploler', key, input);
    ipc.once(`show-dialog-exploler-reply_${key}`, (event, ret) => {
      resolve(ret);
    });
  });
}

function getFavorites(dbKey) {
  return new Promise((resolve, reject) => {
    const key = uuid.v4();
    ipc.send('get-favorites', key, dbKey);
    ipc.once(`get-favorites-reply_${key}`, (event, ret) => {
      resolve(ret);
    });
  });
}

function getAllFavorites(dbKey) {
  return new Promise((resolve, reject) => {
    const key = uuid.v4();
    ipc.send('get-all-favorites', key, dbKey);
    ipc.once(`get-all-favorites-reply_${key}`, (event, ret) => {
      resolve(ret);
    });
  });
}

function insertFavorite(writePath, data) {
  return new Promise((resolve, reject) => {
    const key = uuid.v4();
    ipc.send('insert-favorite', key, writePath, data);
    ipc.once(`insert-favorite-reply_${key}`, (event, ret) => {
      resolve(ret);
    });
  });
}

function renameFavorite(dbKey, newName) {
  return new Promise((resolve, reject) => {
    const key = uuid.v4();
    ipc.send('rename-favorite', key, dbKey, newName);
    ipc.once(`rename-favorite-reply_${key}`, (event, ret) => {
      resolve(ret);
    });
  });
}

function openFavorite(dbKey, id) {
  return new Promise((resolve, reject) => {
    const key = uuid.v4();
    ipc.send('open-favorite', key, dbKey, id);
    ipc.once(`open-favorite-reply_${key}`, (event, ret) => {
      resolve(ret);
    });
  });
}

function deleteFavorite(dbKey, newName) {
  return new Promise((resolve, reject) => {
    const key = uuid.v4();
    ipc.send('delete-favorite', key, dbKey, newName);
    ipc.once(`delete-favorite-reply_${key}`, (event, ret) => {
      resolve(ret);
    });
  });
}

function moveFavorite(args) {
  return new Promise((resolve, reject) => {
    const key = uuid.v4();
    ipc.send('move-favorite', key, args);
    ipc.once(`move-favorite-reply_${key}`, (event, ret) => {
      resolve(ret);
    });
  });
}

function treeBuild(datas, nodePath) {
  const newChildren = [];
  for (let x of datas) {
    const id = `${nodePath}/${x.key}`;
    const data = {
      id,
      name: x.title,
      url: x.url,
      favicon: faviconGet(x),
      // loadOnDemand: !x.is_file,
      type: x.is_file ? 'file' : 'directory'
    };
    if (x.children2) {
      data.children = treeBuild(x.children2, id);
    }
    newChildren.push(data);
  }
  return newChildren;
}

function searchOpenNodes(nodes, set, tree) {
  for (let node of nodes) {
    if (node.type == "directory" && set.has(node.id)) {
      tree.openNode(node);
      set.delete(node.id);
      if (set.size == 0) break;
      searchOpenNodes(node.children, set, tree);
    }
  }
}

let selectedNodes = [];
let treeAllData;
class App extends React.Component {
  componentDidMount() {
    ReactDOM.findDOMNode(this.refs.stickey).style.height = "100%";
  }

  afterSelect(selectedTargets) {
    if (selectedTargets.length == 0) return;

    const tree = this.refs.content.refs.iTree.tree;
    // const selectedNode = tree.getSelectedNode();
    // if (selectedNodes.length === 0 && selectedNode) {
    //   selectedNodes.push(selectedNode);
    //   tree.state.selectedNode = null;
    // }


    const targetNodes = selectedTargets.map(ele => {
      const nodeId = ele.dataset.id;
      return tree.getNodeById(nodeId);
    });

    for (let currentNode of targetNodes) {
      const index = selectedNodes.indexOf(currentNode);

      // Remove current node if the array length of selected nodes is greater than 1
      if (index >= 0 && selectedNodes.length > 1) {
        currentNode.state.selected = false;
        selectedNodes.splice(index, 1);
        tree.updateNode(currentNode, {}, { shallowRendering: true }, true);
      }

      // Add current node to the selected nodes
      if (index < 0) {
        currentNode.state.selected = true;
        selectedNodes.push(currentNode);
        tree.updateNode(currentNode, {}, { shallowRendering: true }, true);
      }
    }

    tree.update();
  }

  clearSelect() {
    const tree = this.refs.content.refs.iTree.tree;
    // Empty an array of selected nodes
    selectedNodes.forEach(selectedNode => {
      selectedNode.state.selected = false;
      tree.updateNode(selectedNode, {}, { shallowRendering: true }, true);
    });
    selectedNodes = [];

    tree.update();
  }

  recurNewTreeData(datas, reg) {
    const newDatas = [];
    for (let ele of datas) {
      if (ele.type == "file") {
        if (reg.test(`${ele.name}\t${ele.url}`)) {
          newDatas.push(ele);
        }
      } else {
        const newChildren = this.recurNewTreeData(ele.children, reg);
        if (newChildren.length > 0) {
          newDatas.push({
            id: ele.id,
            name: ele.name,
            url: ele.url,
            favicon: ele.favicon,
            type: ele.type,
            children: newChildren
          });
        }
      }
    }
    return newDatas;
  }

  onChange(e, data) {
    e.preventDefault();
    if (!treeAllData) return;
    const regList = [...new Set(escapeRegExp(data.value).split(/[ 　]+/, -1).filter(x => x))];
    const reg = new RegExp(regList.length > 1 ? `(?=.*${regList.join(")(?=.*")})` : regList[0], "i");

    console.log(reg);

    const tree = this.refs.content.refs.iTree.tree;
    const openNodes = new Set(tree.getOpenNodes().map(node => node.id));

    tree.loadData(this.recurNewTreeData(treeAllData, reg), true);
    for (let nodeId of openNodes) {
      const node = tree.getNodeById(nodeId);
      tree.openNode(node, void 0, true);
    }
    tree.update();
  }

  render() {
    return React.createElement(
      StickyContainer,
      { ref: 'stickey' },
      React.createElement(
        Sticky,
        null,
        React.createElement(
          'div',
          null,
          React.createElement(
            Menu,
            { pointing: true, secondary: true },
            React.createElement(Menu.Item, { key: 'favorite', icon: 'star', active: true }),
            React.createElement(Menu.Item, { as: 'a', href: `${baseURL}/history_sidebar.html`, key: 'history', icon: 'history' }),
            React.createElement(Menu.Item, { as: 'a', href: `${baseURL}/tabs_sidebar.html`, key: 'tabs', icon: 'align justify' }),
            React.createElement(Menu.Item, { as: 'a', href: `${baseURL}/explorer_sidebar.html`, key: 'file-explorer', icon: 'folder' })
          ),
          React.createElement(Input, { ref: 'input', icon: 'search', placeholder: 'Search...', size: 'small', onChange: this.onChange.bind(this) })
        )
      ),
      React.createElement(
        _index2.default,
        { ref: 'select', target: '.infinite-tree-item', selectedClass: 'selection-selected',
          afterSelect: this.afterSelect.bind(this), clearSelect: this.clearSelect.bind(this) },
        React.createElement(Contents, { ref: 'content' })
      )
    );
  }
}

class Contents extends React.Component {
  // tree = null;

  updatePreview(node) {
    console.log(node);
  }

  loadAllData() {
    const tree = this.refs.iTree.tree;
    getAllChildren('root').then(data => {
      console.log(data);
      treeAllData = data;
      tree.loadData(data, true);

      const prevState = localStorage.getItem("favorite-sidebar-open-node");
      if (prevState) {
        const openNodes = new Set(prevState.split("\t", -1));
        for (let nodeId of openNodes) {
          const node = tree.getNodeById(nodeId);
          tree.openNode(node, void 0, true);
        }
      }
      tree.update();
    });
  }

  componentDidMount() {
    this.loadAllData();
    ipc.on("update-datas", (e, data) => {
      this.loadAllData();
    });

    document.addEventListener('mousedown', event => {
      const tree = this.refs.iTree.tree;
      const currentNode = tree.getNodeFromPoint(event.x, event.y);
      if (!currentNode) {
        return;
      }

      if (event.which == 3) {
        const nodes = [currentNode, ...new Set([selectedNodes, ...selectedNodes])];
        ipc.send("favorite-menu", nodes.map(node => node.url || node.title));
        this.menuKey = nodes;
        return;
      }
    });
    this.initEvents();
  }

  initEvents() {
    this.event = (e, cmd) => {
      if (cmd == "open") {
        const nodes = this.menuKey;
        const keys = nodes.map(node => node.id);
        this.menuKey = void 0;
        openFavorite(keys.map(k => path.basename(k))).then(_ => _);
      }
      // else if(cmd == "delete") {
      //   const nodes = this.menuKey
      //   const keys = nodes.map(node=> node.id)
      //   this.menuKey = (void 0)
      //   const parentNodes = this.getNodesFromKeys(nodes.map(n => n.props.parent && n.props.parent.path))
      //   deleteFavorite(keys.map(k=>path.basename(k)),parentNodes.map(parent=>path.basename(parent.props.k))).then(ret => {
      //     Promise.all(this.reloadDatas([...new Set(parentNodes)])).then(_ => {
      //       this.setState({treeItems: this.renderFolder(this.state.items)})
      //     })
      //   })
      // }
      // else if(cmd == "rename"){
      //   const nodes = this.menuKey
      //   const keys = nodes.map(node=> node.id)
      //   this.menuKey = (void 0)
      //   showDialog({
      //     inputable: true, title: 'Rename',
      //     text: `Enter a new Name`,
      //     initValue: nodes[0].props.isLeaf ? [nodes[0].props.title,nodes[0].props.url] : [nodes[0].props.title],
      //     needInput: nodes[0].props.isLeaf ? ["Title","URL"] : ["Title"]
      //   }).then(value => {
      //     if (!value) return
      //     const parentNodes = this.getNodesFromKeys(nodes.map(n => n.props.parent && n.props.parent.path))
      //     let writePath = keys[0]
      //     const data = nodes[0].props.isLeaf ? {title:value[0], url:value[1]} : {title:value[0]}
      //     renameFavorite(path.basename(writePath),data).then(ret => {
      //       Promise.all(this.reloadDatas(parentNodes)).then(_ => {
      //         this.setState({treeItems: this.renderFolder(this.state.items)})
      //       })
      //     })
      //   })
      // }
      // else if(cmd == "create-page" || cmd == "create-dirctory") {
      //   const isPage = cmd == "create-page"
      //   const nodes = this.menuKey
      //   const keys = nodes.map(node=> node.id)
      //   this.menuKey = (void 0)
      //   showDialog({
      //     inputable: true, title: `New ${isPage ? 'Page' : 'Directory'}`,
      //     text: `Enter a new ${isPage ? 'page title and URL' : 'directory name'}`,
      //     needInput: isPage ? ["Title","URL"] : [""]
      //   }).then(value => {
      //     console.log(value)
      //     if (!value) return
      //     const parentNodes = this.getNodesFromKeys(nodes.map(n => n.props.parent && n.props.parent.path))
      //     let writePath = nodes[0].props.isLeaf ? parentNodes[0].props.k : keys[0]
      //     const data = isPage ? {title:value[0], url:value[1], is_file:true} : {title:value[0], is_file:false,children:[]}
      //     insertFavorite(path.basename(writePath),data).then(ret => {
      //       Promise.all(this.reloadDatas(nodes[0].props.isLeaf ? parentNodes : nodes)).then(_ => {
      //         this.setState({treeItems: this.renderFolder(this.state.items)})
      //       })
      //     })
      //   })
      // }
    };
    ipc.on('favorite-menu-reply', this.event);
  }

  render() {
    const self = this;
    return React.createElement(
      'div',
      { style: { paddingLeft: 4, paddingTop: 4, width: 'calc(100vw - 4px)' } },
      React.createElement(_reactInfiniteTree2.default, {
        ref: 'iTree',
        noDataText: 'Loading...',
        loadNodes: (parentNode, done) => {
          console.log(11, parentNode.id);
          getAllChildren(parentNode.id).then(children => done(null, children));
        },
        rowRenderer: (0, _renderer2.default)(18),
        selectable: true // Defaults to true
        , droppable: {
          hoverClass: 'infinite-tree-drop-hover',
          accept: opts => {
            const { type, draggableTarget, droppableTarget, node } = opts;

            if ((0, _elementClass2.default)(event.target).has('infinite-tree-overlay')) {
              (0, _elementClass2.default)(event.target).add('hover'); // add hover class
            } else {
              const el = self.refs.iTree.tree.contentElement.querySelector('.infinite-tree-overlay');
              (0, _elementClass2.default)(el).remove('hover'); // remove hover class
            }

            return true;
          },
          drop: (e, opts) => {
            const { draggableTarget, droppableTarget, node } = opts;

            if ((0, _elementClass2.default)(event.target).has('infinite-tree-overlay')) {
              (0, _elementClass2.default)(event.target).remove('hover'); // remove hover class
              const innerHTML = 'Dropped to an overlay element';
              document.querySelector('#classic [data-id="dropped-result"]').innerHTML = innerHTML;
              return;
            }

            //console.log('drop:', event, event.dataTransfer.getData('text'));
            // const innerHTML = 'Dropped to <b>' + escapeHTML(node.name) + '</b>';
            // document.querySelector('#classic [data-id="dropped-result"]').innerHTML = innerHTML;
          }
        },
        shouldSelectNode: node => {
          // Defaults to null
          if (!node || node === this.refs.iTree.tree.getSelectedNode()) {
            return false; // Prevent from deselecting the current node
          }
          return true;
        },
        onClick: event => {
          const tree = this.refs.iTree.tree;
          const currentNode = tree.getNodeFromPoint(event.x, event.y);
          if (!currentNode) {
            return;
          }

          const multipleSelectionMode = event.ctrlKey || event.metaKey;

          if (!multipleSelectionMode) {
            if (selectedNodes.length > 0) {
              // Call event.stopPropagation() to stop event bubbling
              event.stopPropagation();

              // Empty an array of selected nodes
              selectedNodes.forEach(selectedNode => {
                selectedNode.state.selected = false;
                tree.updateNode(selectedNode, {}, { shallowRendering: true });
              });
              selectedNodes = [];

              // Select current node
              tree.state.selectedNode = currentNode;
              currentNode.state.selected = true;
              tree.updateNode(currentNode, {}, { shallowRendering: true });
            }
            if (currentNode.type == 'file') {
              ipc.sendToHost("open-tab-opposite", currentNode.url, true);
            } else {
              tree.toggleNode(currentNode);
            }
            return;
          }

          // Call event.stopPropagation() to stop event bubbling
          event.stopPropagation();

          const selectedNode = tree.getSelectedNode();
          if (selectedNodes.length === 0 && selectedNode) {
            selectedNodes.push(selectedNode);
            tree.state.selectedNode = null;
          }

          const index = selectedNodes.indexOf(currentNode);

          // Remove current node if the array length of selected nodes is greater than 1
          if (index >= 0 && selectedNodes.length > 1) {
            currentNode.state.selected = false;
            selectedNodes.splice(index, 1);
            tree.updateNode(currentNode, {}, { shallowRendering: true });
          }

          // Add current node to the selected nodes
          if (index < 0) {
            currentNode.state.selected = true;
            selectedNodes.push(currentNode);
            tree.updateNode(currentNode, {}, { shallowRendering: true });
          }
        },
        onDoubleClick: event => {
          const target = event.target || event.srcElement; // IE8
          console.log('onDoubleClick', target);
        },
        onKeyDown: event => {
          const tree = this.refs.iTree.tree;
          const target = event.target || event.srcElement; // IE8
          console.log('onKeyDown', target);
          event.preventDefault();

          const node = tree.getSelectedNode();
          const nodeIndex = tree.getSelectedIndex();

          if (event.keyCode === 37) {
            // Left
            tree.closeNode(node);
          } else if (event.keyCode === 38) {
            // Up
            const prevNode = tree.nodes[nodeIndex - 1] || node;
            tree.selectNode(prevNode);
          } else if (event.keyCode === 39) {
            // Right
            tree.openNode(node);
          } else if (event.keyCode === 40) {
            // Down
            const nextNode = tree.nodes[nodeIndex + 1] || node;
            tree.selectNode(nextNode);
          }
        }
        // onContentWillUpdate={() => {
        //   console.log('onContentWillUpdate');
        // }}
        // onContentDidUpdate={() => {
        //   this.updatePreview(this.refs.iTree.tree.getSelectedNode());
        // }}
        , onOpenNode: node => {
          localStorage.setItem("favorite-sidebar-open-node", this.refs.iTree.tree.getOpenNodes().map(node => node.id).join("\t"));
        },
        onCloseNode: node => {
          localStorage.setItem("favorite-sidebar-open-node", this.refs.iTree.tree.getOpenNodes().map(node => node.id).join("\t"));
        }
        // onClusterDidChange={() => {
        //   const tree = this.refs.iTree.tree
        //   // No overlay on filtered mode
        //   if (tree.filtered) {
        //     return;
        //   }
        //
        //   const overlayElement = document.createElement('div');
        //   const top = tree.nodes.indexOf(tree.getNodeById('<root>.1'));
        //   const bottom = tree.nodes.indexOf(tree.getNodeById('<root>.2'));
        //   const el = tree.contentElement.querySelector('.infinite-tree-item');
        //   if (!el) {
        //     return;
        //   }
        //   const height = parseFloat(getComputedStyle(el).height);
        //
        //   overlayElement.className = classNames(
        //     'infinite-tree-overlay'
        //   );
        //   overlayElement.style.top = top * height + 'px';
        //   overlayElement.style.height = (bottom - top) * height + 'px';
        //   overlayElement.style.lineHeight = (bottom - top) * height + 'px';
        //   overlayElement.appendChild(document.createTextNode('OVERLAY'));
        //   tree.contentElement.appendChild(overlayElement);
        // }}
        // onSelectNode={(node) => {
        //   this.updatePreview(node);
        // }}
      })
    );
  }
}

ReactDOM.render(React.createElement(App, null), document.querySelector('#classic'));

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(0))(1029);

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(0))(1202);

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(0))(1302);

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(0))(1340);

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(0))(1403);

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(0))(45);

/***/ })
/******/ ]);