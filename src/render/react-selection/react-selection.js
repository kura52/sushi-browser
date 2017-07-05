'use strict';

(function webpackUniversalModuleDefinition(root, factory) {
	if (typeof exports === 'object' && typeof module === 'object') module.exports = factory(require('inferno-compat'), require('inferno-compat'));else if (typeof define === 'function' && define.amd) define(["react", "react-dom"], factory);else if (typeof exports === 'object') exports["ReactSelection"] = factory(require('inferno-compat'), require('inferno-compat'));else root["ReactSelection"] = factory(root["React"], root["ReactDOM"]);
})(undefined, function (__WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_3__) {
	return (/******/function (modules) {
			// webpackBootstrap
			/******/ // The module cache
			/******/var installedModules = {};

			/******/ // The require function
			/******/function __webpack_require__(moduleId) {

				/******/ // Check if module is in cache
				/******/if (installedModules[moduleId])
					/******/return installedModules[moduleId].exports;

				/******/ // Create a new module (and put it into the cache)
				/******/var module = installedModules[moduleId] = {
					/******/exports: {},
					/******/id: moduleId,
					/******/loaded: false
					/******/ };

				/******/ // Execute the module function
				/******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

				/******/ // Flag the module as loaded
				/******/module.loaded = true;

				/******/ // Return the exports of the module
				/******/return module.exports;
				/******/
			}

			/******/ // expose the modules object (__webpack_modules__)
			/******/__webpack_require__.m = modules;

			/******/ // expose the module cache
			/******/__webpack_require__.c = installedModules;

			/******/ // __webpack_public_path__
			/******/__webpack_require__.p = "";

			/******/ // Load entry module and return exports
			/******/return __webpack_require__(0);
			/******/
		}(
		/************************************************************************/
		/******/[
		/* 0 */
		/***/function (module, exports, __webpack_require__) {

			module.exports = __webpack_require__(1);

			/***/
		},
		/* 1 */
		/***/function (module, exports, __webpack_require__) {

			'use strict';

			var _extends = Object.assign || function (target) {
				for (var i = 1; i < arguments.length; i++) {
					var source = arguments[i];for (var key in source) {
						if (Object.prototype.hasOwnProperty.call(source, key)) {
							target[key] = source[key];
						}
					}
				}return target;
			};

			var _createClass = function () {
				function defineProperties(target, props) {
					for (var i = 0; i < props.length; i++) {
						var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
					}
				}return function (Constructor, protoProps, staticProps) {
					if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
				};
			}();

			var _react = __webpack_require__(2);

			var _react2 = _interopRequireDefault(_react);

			var _reactDom = __webpack_require__(3);

			var _toggleClass = __webpack_require__(4);

			var _toggleClass2 = _interopRequireDefault(_toggleClass);

			var _limitRange = __webpack_require__(5);

			var _limitRange2 = _interopRequireDefault(_limitRange);

			function _interopRequireDefault(obj) {
				return obj && obj.__esModule ? obj : { default: obj };
			}

			function _objectWithoutProperties(obj, keys) {
				var target = {};for (var i in obj) {
					if (keys.indexOf(i) >= 0) continue;if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;target[i] = obj[i];
				}return target;
			}

			function _classCallCheck(instance, Constructor) {
				if (!(instance instanceof Constructor)) {
					throw new TypeError("Cannot call a class as a function");
				}
			}

			function _possibleConstructorReturn(self, call) {
				if (!self) {
					throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
				}return call && (typeof call === "object" || typeof call === "function") ? call : self;
			}

			function _inherits(subClass, superClass) {
				if (typeof superClass !== "function" && superClass !== null) {
					throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
				}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
			}

			__webpack_require__(6);

			var topLeftLimitRange = new _limitRange2.default('top-left');
			var topRightLimitRange = new _limitRange2.default('top-right');
			var downRightLimitRange = new _limitRange2.default('down-right');
			var downLeftLimitRange = new _limitRange2.default('down-left');

			var Selection = function (_React$Component) {
				_inherits(Selection, _React$Component);

				function Selection() {
					var _Object$getPrototypeO;

					var _temp, _this, _ret;

					_classCallCheck(this, Selection);

					for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
						args[_key] = arguments[_key];
					}

					return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Selection)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.state = {
						rectangleStyle: {
							left: 0,
							top: 0,
							width: 0,
							height: 0,
							opacity: 0
						}
					}, _this.mousedown = function (ev) {
						var targetSelect = _this.props.target;
						_this.targets = Array.from(_this._box.querySelectorAll(targetSelect));
						_this.ctrlKey = ev.ctrlKey || ev.metaKey;

						if (_this.ctrlKey) {
							window.addEventListener('keyup', _this.keyup, false);
						} else {
							_this.targets.forEach(function (target) {
								target.classList.remove(_this.props.selectedClass);
							});
						}

						_this.clickY = ev.pageY - ev.currentTarget.offsetTop;
						_this.clickX = ev.pageX - ev.currentTarget.offsetLeft;

						document.addEventListener('mousemove', _this.mousemove, false);
						document.addEventListener('mouseup', _this.mouseup, false);
					}, _this.afterSelect = function () {
						var _this$props = _this.props;
						var afterSelect = _this$props.afterSelect;
						var selectedClass = _this$props.selectedClass;

						afterSelect(_this.targets.filter(function (t) {
							return t.classList.contains(selectedClass);
						}));
					}, _this.keyup = function (ev) {
						if (!_this.ctrlKey) return;
						_this.afterSelect();
						window.removeEventListener('keyup', _this.keyup);
					}, _this.mouseup = function (ev) {
						var isLimit = _this.props.isLimit;

						_this.setState({
							rectangleStyle: _extends({}, _this.state.rectangleStyle, {
								opacity: 0
							})
						});

						document.removeEventListener('mousemove', _this.mousemove);
						document.removeEventListener('mouseup', _this.mouseup);

						if (_this.ctrlKey) {
							_this.targets.forEach(function (t) {
								return t.removeAttribute('data-is-double');
							});
						} else {
							_this.afterSelect();
						}

						if (isLimit) {
							topLeftLimitRange.reset();
							topRightLimitRange.reset();
							downRightLimitRange.reset();
							downLeftLimitRange.reset();
						}
					}, _this.mousemove = function (ev) {
						var moveX = ev.pageX - _this._box.offsetLeft - _this.clickX;
						var moveY = ev.pageY - _this._box.offsetTop - _this.clickY;
						var isLimit = _this.props.isLimit;

						var rectangleSize = {};

						if (moveX < 0 && moveY < 0) {
							// top-left
							rectangleSize = {
								left: _this.clickX + moveX,
								top: _this.clickY + moveY,
								width: moveX * -1,
								height: moveY * -1
							};

							if (isLimit) {
								rectangleSize = topLeftLimitRange.getNewSize({
									rectangle: rectangleSize,
									container: _this._box
								});
							}
						} else if (moveX > 0 && moveY > 0) {
							// down-right
							rectangleSize = {
								left: _this.clickX,
								top: _this.clickY,
								width: moveX,
								height: moveY
							};

							if (isLimit) {
								rectangleSize = downRightLimitRange.getNewSize({
									rectangle: rectangleSize,
									container: _this._box
								});
							}
						} else if (moveX > 0 && moveY < 0) {
							// top-right
							rectangleSize = {
								left: _this.clickX,
								top: _this.clickY + moveY,
								width: moveX,
								height: moveY * -1
							};

							if (isLimit) {
								rectangleSize = topRightLimitRange.getNewSize({
									rectangle: rectangleSize,
									container: _this._box
								});
							}
						} else if (moveX < 0 && moveY > 0) {
							// down-left
							rectangleSize = {
								left: _this.clickX + moveX,
								top: _this.clickY,
								width: moveX * -1,
								height: moveY
							};

							if (isLimit) {
								rectangleSize = downLeftLimitRange.getNewSize({
									rectangle: rectangleSize,
									container: _this._box
								});
							}
						}

						_this.setState({
							rectangleStyle: _extends({}, rectangleSize, {
								opacity: 1
							})
						});

						_this.targets.forEach(function (target) {
							var selectedClass = _this.props.selectedClass;

							var tar = {
								x: target.offsetLeft,
								y: target.offsetTop,
								xx: target.offsetLeft + target.offsetWidth,
								yy: target.offsetTop + target.offsetHeight
							};

							var square = {
								x: rectangleSize.left,
								y: rectangleSize.top,
								xx: rectangleSize.left + rectangleSize.width,
								yy: rectangleSize.top + rectangleSize.height
							};

							var isDouble = Math.max(tar.x, square.x) <= Math.min(tar.xx, square.xx) && Math.max(tar.y, square.y) <= Math.min(tar.yy, square.yy);

							var hasDataDouble = target.dataset.isDouble === 'true' ? true : false;

							if (_this.ctrlKey) {
								if (isDouble !== hasDataDouble) {
									(0, _toggleClass2.default)(target, selectedClass);
									target.dataset.isDouble = isDouble;
								}
							} else {
								(0, _toggleClass2.default)(target, isDouble, selectedClass);
							}
						});
					}, _temp), _possibleConstructorReturn(_this, _ret);
				}

				_createClass(Selection, [{
					key: 'componentDidMount',
					value: function componentDidMount() {
						this._box = (0, _reactDom.findDOMNode)(this);
					}
				}, {
					key: 'shouldComponentUpdate',
					value: function shouldComponentUpdate(_ref, _ref2) {
						var target = _ref.target;
						var selectedClass = _ref.selectedClass;
						var isLimit = _ref.isLimit;
						var _ref2$rectangleStyle = _ref2.rectangleStyle;
						var left = _ref2$rectangleStyle.left;
						var top = _ref2$rectangleStyle.top;
						var width = _ref2$rectangleStyle.width;
						var height = _ref2$rectangleStyle.height;
						var opacity = _ref2$rectangleStyle.opacity;
						var props = this.props;
						var rectangleStyle = this.state.rectangleStyle;

						return target !== props.target || selectedClass !== props.selectedClass || isLimit !== props.isLimit || left !== rectangleStyle.left || top !== rectangleStyle.top || width !== rectangleStyle.width || height !== rectangleStyle.height || opacity !== rectangleStyle.opacity;
					}
				}, {
					key: 'render',
					value: function render() {
						var _props = this.props;
						var children = _props.children;
						var target = _props.target;

						var props = _objectWithoutProperties(_props, ['children', 'target']);

						return _react2.default.createElement('div', _extends({}, props, { className: 'react-selection', onMouseDown: this.mousedown }), children, _react2.default.createElement('div', { className: 'react-selection-rectangle', style: this.state.rectangleStyle }));
					}
				}]);

				return Selection;
			}(_react2.default.Component);

			Selection.propTypes = {
				target: _react.PropTypes.string.isRequired,
				selectedClass: _react.PropTypes.string,
				afterSelect: _react.PropTypes.func,
				isLimit: _react.PropTypes.bool
			};
			Selection.defaultProps = {
				target: '.react-selection-target',
				selectedClass: 'react-selection-selected',
				isLimit: false,
				afterSelect: function afterSelect() {}
			};

			module.exports = Selection;

			/***/
		},
		/* 2 */
		/***/function (module, exports) {

			module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

			/***/
		},
		/* 3 */
		/***/function (module, exports) {

			module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

			/***/
		},
		/* 4 */
		/***/function (module, exports) {

			'use strict';

			var toggleClass = function toggleClass(el, condition, className) {
				var toggle = condition ? 'add' : 'remove';

				if (typeof condition === 'string' && arguments.length === 2) {
					className = condition;
					toggle = el.classList.contains(className) ? 'remove' : 'add';
				}

				el.classList[toggle](className);

				return el;
			};

			module.exports = toggleClass;

			/***/
		},
		/* 5 */
		/***/function (module, exports) {

			'use strict';

			var _extends = Object.assign || function (target) {
				for (var i = 1; i < arguments.length; i++) {
					var source = arguments[i];for (var key in source) {
						if (Object.prototype.hasOwnProperty.call(source, key)) {
							target[key] = source[key];
						}
					}
				}return target;
			};

			var _createClass = function () {
				function defineProperties(target, props) {
					for (var i = 0; i < props.length; i++) {
						var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
					}
				}return function (Constructor, protoProps, staticProps) {
					if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
				};
			}();

			function _classCallCheck(instance, Constructor) {
				if (!(instance instanceof Constructor)) {
					throw new TypeError("Cannot call a class as a function");
				}
			}

			/**
    *
    * @param rectangle
    * @param container
    * @param direction top-left, top-right, down-right, down-left
    */

			var LimitRange = function () {
				function LimitRange() {
					var direction = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

					_classCallCheck(this, LimitRange);

					this.freezeWidth = false;
					this.freezeHeight = false;

					this.direction = direction;
				}

				_createClass(LimitRange, [{
					key: 'getNewSize',
					value: function getNewSize(_ref) {
						var rectangle = _ref.rectangle;
						var container = _ref.container;
						var left = rectangle.left;
						var top = rectangle.top;
						var width = rectangle.width;
						var height = rectangle.height;
						var offsetWidth = container.offsetWidth;
						var offsetHeight = container.offsetHeight;

						var size = _extends({}, rectangle);

						var maxWidth = offsetWidth - left;
						var maxHeight = offsetHeight - top;

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
				}, {
					key: 'reset',
					value: function reset() {
						this.freezeWidth = false;
						this.freezeHeight = false;

						return this;
					}
				}]);

				return LimitRange;
			}();

			module.exports = LimitRange;

			/***/
		},
		/* 6 */
		/***/function (module, exports) {}

		// removed by extract-text-webpack-plugin

		/***/
		/******/])
	);
});
;
//# sourceMappingURL=react-selection.js.map
