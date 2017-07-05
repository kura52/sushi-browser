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
/******/ 	return __webpack_require__(__webpack_require__.s = 47);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(85);
module.exports.default = module.exports;



/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.isDef = isDef;
exports.isJustDef = isJustDef;
exports.isFunction = isFunction;
exports.isObject = isObject;
exports.isNonNullObject = isNonNullObject;
exports.isNonArrayObject = isNonArrayObject;
exports.isString = isString;
exports.isNumber = isNumber;
exports.isNativeBlob = isNativeBlob;
exports.isNativeBlobDefined = isNativeBlobDefined;
/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
 * @return False if the object is undefined or null, true otherwise.
 */
/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function isDef(p) {
    return p != null;
}
function isJustDef(p) {
    return p !== void 0;
}
function isFunction(p) {
    return typeof p === 'function';
}
function isObject(p) {
    return (typeof p === 'undefined' ? 'undefined' : _typeof(p)) === 'object';
}
function isNonNullObject(p) {
    return isObject(p) && p !== null;
}
function isNonArrayObject(p) {
    return isObject(p) && !Array.isArray(p);
}
function isString(p) {
    return typeof p === 'string' || p instanceof String;
}
function isNumber(p) {
    return typeof p === 'number' || p instanceof Number;
}
function isNativeBlob(p) {
    return isNativeBlobDefined() && p instanceof Blob;
}
function isNativeBlobDefined() {
    return typeof Blob !== 'undefined';
}
//# sourceMappingURL=type.js.map


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var inferno_shared_1 = __webpack_require__(0);
var options_1 = __webpack_require__(4);
var VNodes_1 = __webpack_require__(6);
var constants_1 = __webpack_require__(14);
var mounting_1 = __webpack_require__(15);
var unmounting_1 = __webpack_require__(24);
// We need EMPTY_OBJ defined in one place.
// Its used for comparison so we cant inline it into shared
exports.EMPTY_OBJ = {};
if (process.env.NODE_ENV !== 'production') {
    Object.freeze(exports.EMPTY_OBJ);
}
function createClassComponentInstance(vNode, Component, props, context, isSVG, lifecycle) {
    if (inferno_shared_1.isUndefined(context)) {
        context = exports.EMPTY_OBJ; // Context should not be mutable
    }
    var instance = new Component(props, context);
    vNode.children = instance;
    instance._blockSetState = false;
    instance.context = context;
    if (instance.props === exports.EMPTY_OBJ) {
        instance.props = props;
    }
    // setState callbacks must fire after render is done when called from componentWillReceiveProps or componentWillMount
    instance._lifecycle = lifecycle;
    instance._unmounted = false;
    instance._pendingSetState = true;
    instance._isSVG = isSVG;
    if (!inferno_shared_1.isNullOrUndef(instance.componentWillMount)) {
        instance._blockRender = true;
        instance.componentWillMount();
        instance._blockRender = false;
    }
    var childContext;
    if (!inferno_shared_1.isNullOrUndef(instance.getChildContext)) {
        childContext = instance.getChildContext();
    }
    if (inferno_shared_1.isNullOrUndef(childContext)) {
        instance._childContext = context;
    }
    else {
        instance._childContext = inferno_shared_1.combineFrom(context, childContext);
    }
    if (!inferno_shared_1.isNull(options_1.options.beforeRender)) {
        options_1.options.beforeRender(instance);
    }
    var input = instance.render(props, instance.state, context);
    if (!inferno_shared_1.isNull(options_1.options.afterRender)) {
        options_1.options.afterRender(instance);
    }
    if (inferno_shared_1.isArray(input)) {
        if (process.env.NODE_ENV !== 'production') {
            inferno_shared_1.throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
        }
        inferno_shared_1.throwError();
    }
    else if (inferno_shared_1.isInvalid(input)) {
        input = VNodes_1.createVoidVNode();
    }
    else if (inferno_shared_1.isStringOrNumber(input)) {
        input = VNodes_1.createTextVNode(input, null);
    }
    else {
        if (input.dom) {
            input = VNodes_1.directClone(input);
        }
        if (input.flags & 28 /* Component */) {
            // if we have an input that is also a component, we run into a tricky situation
            // where the root vNode needs to always have the correct DOM entry
            // so we break monomorphism on our input and supply it our vNode as parentVNode
            // we can optimise this in the future, but this gets us out of a lot of issues
            input.parentVNode = vNode;
        }
    }
    instance._pendingSetState = false;
    instance._lastInput = input;
    return instance;
}
exports.createClassComponentInstance = createClassComponentInstance;
function replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG, isRecycling) {
    replaceVNode(parentDom, mounting_1.mount(nextInput, null, lifecycle, context, isSVG), lastInput, lifecycle, isRecycling);
}
exports.replaceLastChildAndUnmount = replaceLastChildAndUnmount;
function replaceVNode(parentDom, dom, vNode, lifecycle, isRecycling) {
    unmounting_1.unmount(vNode, null, lifecycle, false, isRecycling);
    replaceChild(parentDom, dom, vNode.dom);
}
exports.replaceVNode = replaceVNode;
function createFunctionalComponentInput(vNode, component, props, context) {
    var input = component(props, context);
    if (inferno_shared_1.isArray(input)) {
        if (process.env.NODE_ENV !== 'production') {
            inferno_shared_1.throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
        }
        inferno_shared_1.throwError();
    }
    else if (inferno_shared_1.isInvalid(input)) {
        input = VNodes_1.createVoidVNode();
    }
    else if (inferno_shared_1.isStringOrNumber(input)) {
        input = VNodes_1.createTextVNode(input, null);
    }
    else {
        if (input.dom) {
            input = VNodes_1.directClone(input);
        }
        if (input.flags & 28 /* Component */) {
            // if we have an input that is also a component, we run into a tricky situation
            // where the root vNode needs to always have the correct DOM entry
            // so we break monomorphism on our input and supply it our vNode as parentVNode
            // we can optimise this in the future, but this gets us out of a lot of issues
            input.parentVNode = vNode;
        }
    }
    return input;
}
exports.createFunctionalComponentInput = createFunctionalComponentInput;
function setTextContent(dom, text) {
    if (text !== '') {
        dom.textContent = text;
    }
    else {
        dom.appendChild(document.createTextNode(''));
    }
}
exports.setTextContent = setTextContent;
function updateTextContent(dom, text) {
    dom.firstChild.nodeValue = text;
}
exports.updateTextContent = updateTextContent;
function appendChild(parentDom, dom) {
    parentDom.appendChild(dom);
}
exports.appendChild = appendChild;
function insertOrAppend(parentDom, newNode, nextNode) {
    if (inferno_shared_1.isNullOrUndef(nextNode)) {
        appendChild(parentDom, newNode);
    }
    else {
        parentDom.insertBefore(newNode, nextNode);
    }
}
exports.insertOrAppend = insertOrAppend;
function documentCreateElement(tag, isSVG) {
    if (isSVG === true) {
        return document.createElementNS(constants_1.svgNS, tag);
    }
    else {
        return document.createElement(tag);
    }
}
exports.documentCreateElement = documentCreateElement;
function replaceWithNewNode(lastNode, nextNode, parentDom, lifecycle, context, isSVG, isRecycling) {
    unmounting_1.unmount(lastNode, null, lifecycle, false, isRecycling);
    var dom = mounting_1.mount(nextNode, null, lifecycle, context, isSVG);
    nextNode.dom = dom;
    replaceChild(parentDom, dom, lastNode.dom);
}
exports.replaceWithNewNode = replaceWithNewNode;
function replaceChild(parentDom, nextDom, lastDom) {
    if (!parentDom) {
        parentDom = lastDom.parentNode;
    }
    parentDom.replaceChild(nextDom, lastDom);
}
exports.replaceChild = replaceChild;
function removeChild(parentDom, dom) {
    parentDom.removeChild(dom);
}
exports.removeChild = removeChild;
function removeAllChildren(dom, children, lifecycle, isRecycling) {
    if (!options_1.options.recyclingEnabled || (options_1.options.recyclingEnabled && !isRecycling)) {
        removeChildren(null, children, lifecycle, isRecycling);
    }
    dom.textContent = '';
}
exports.removeAllChildren = removeAllChildren;
function removeChildren(dom, children, lifecycle, isRecycling) {
    for (var i = 0, len = children.length; i < len; i++) {
        var child = children[i];
        if (!inferno_shared_1.isInvalid(child)) {
            unmounting_1.unmount(child, dom, lifecycle, true, isRecycling);
        }
    }
}
exports.removeChildren = removeChildren;
function isKeyed(lastChildren, nextChildren) {
    return nextChildren.length > 0 && !inferno_shared_1.isNullOrUndef(nextChildren[0]) && !inferno_shared_1.isNullOrUndef(nextChildren[0].key)
        && lastChildren.length > 0 && !inferno_shared_1.isNullOrUndef(lastChildren[0]) && !inferno_shared_1.isNullOrUndef(lastChildren[0].key);
}
exports.isKeyed = isKeyed;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Code = exports.errors = exports.FirebaseStorageError = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Copyright 2017 Google Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * you may not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * You may obtain a copy of the License at
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *   http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * See the License for the specific language governing permissions and
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */


exports.prependCode = prependCode;
exports.unknown = unknown;
exports.objectNotFound = objectNotFound;
exports.bucketNotFound = bucketNotFound;
exports.projectNotFound = projectNotFound;
exports.quotaExceeded = quotaExceeded;
exports.unauthenticated = unauthenticated;
exports.unauthorized = unauthorized;
exports.retryLimitExceeded = retryLimitExceeded;
exports.invalidChecksum = invalidChecksum;
exports.canceled = canceled;
exports.invalidEventName = invalidEventName;
exports.invalidUrl = invalidUrl;
exports.invalidDefaultBucket = invalidDefaultBucket;
exports.noDefaultBucket = noDefaultBucket;
exports.cannotSliceBlob = cannotSliceBlob;
exports.serverFileWrongSize = serverFileWrongSize;
exports.noDownloadURL = noDownloadURL;
exports.invalidArgument = invalidArgument;
exports.invalidArgumentCount = invalidArgumentCount;
exports.appDeleted = appDeleted;
exports.invalidRootOperation = invalidRootOperation;
exports.invalidFormat = invalidFormat;
exports.internalError = internalError;

var _constants = __webpack_require__(12);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FirebaseStorageError = exports.FirebaseStorageError = function () {
    function FirebaseStorageError(code, message) {
        _classCallCheck(this, FirebaseStorageError);

        this.code_ = prependCode(code);
        this.message_ = 'Firebase Storage: ' + message;
        this.serverResponse_ = null;
        this.name_ = 'FirebaseError';
    }

    _createClass(FirebaseStorageError, [{
        key: 'codeProp',
        value: function codeProp() {
            return this.code;
        }
    }, {
        key: 'codeEquals',
        value: function codeEquals(code) {
            return prependCode(code) === this.codeProp();
        }
    }, {
        key: 'serverResponseProp',
        value: function serverResponseProp() {
            return this.serverResponse_;
        }
    }, {
        key: 'setServerResponseProp',
        value: function setServerResponseProp(serverResponse) {
            this.serverResponse_ = serverResponse;
        }
    }, {
        key: 'name',
        get: function get() {
            return this.name_;
        }
    }, {
        key: 'code',
        get: function get() {
            return this.code_;
        }
    }, {
        key: 'message',
        get: function get() {
            return this.message_;
        }
    }, {
        key: 'serverResponse',
        get: function get() {
            return this.serverResponse_;
        }
    }]);

    return FirebaseStorageError;
}();

var errors = exports.errors = {};
var Code = exports.Code = {
    // Shared between all platforms
    UNKNOWN: 'unknown',
    OBJECT_NOT_FOUND: 'object-not-found',
    BUCKET_NOT_FOUND: 'bucket-not-found',
    PROJECT_NOT_FOUND: 'project-not-found',
    QUOTA_EXCEEDED: 'quota-exceeded',
    UNAUTHENTICATED: 'unauthenticated',
    UNAUTHORIZED: 'unauthorized',
    RETRY_LIMIT_EXCEEDED: 'retry-limit-exceeded',
    INVALID_CHECKSUM: 'invalid-checksum',
    CANCELED: 'canceled',
    // JS specific
    INVALID_EVENT_NAME: 'invalid-event-name',
    INVALID_URL: 'invalid-url',
    INVALID_DEFAULT_BUCKET: 'invalid-default-bucket',
    NO_DEFAULT_BUCKET: 'no-default-bucket',
    CANNOT_SLICE_BLOB: 'cannot-slice-blob',
    SERVER_FILE_WRONG_SIZE: 'server-file-wrong-size',
    NO_DOWNLOAD_URL: 'no-download-url',
    INVALID_ARGUMENT: 'invalid-argument',
    INVALID_ARGUMENT_COUNT: 'invalid-argument-count',
    APP_DELETED: 'app-deleted',
    INVALID_ROOT_OPERATION: 'invalid-root-operation',
    INVALID_FORMAT: 'invalid-format',
    INTERNAL_ERROR: 'internal-error'
};
function prependCode(code) {
    return 'storage/' + code;
}
function unknown() {
    return new FirebaseStorageError(Code.UNKNOWN, 'An unknown error occurred, please check the error payload for ' + 'server response.');
}
function objectNotFound(path) {
    return new FirebaseStorageError(Code.OBJECT_NOT_FOUND, 'Object \'' + path + '\' does not exist.');
}
function bucketNotFound(bucket) {
    return new FirebaseStorageError(Code.BUCKET_NOT_FOUND, 'Bucket \'' + bucket + '\' does not exist.');
}
function projectNotFound(project) {
    return new FirebaseStorageError(Code.PROJECT_NOT_FOUND, 'Project \'' + project + '\' does not exist.');
}
function quotaExceeded(bucket) {
    return new FirebaseStorageError(Code.QUOTA_EXCEEDED, 'Quota for bucket \'' + bucket + '\' exceeded, please view quota on ' + 'https://firebase.google.com/pricing/.');
}
function unauthenticated() {
    return new FirebaseStorageError(Code.UNAUTHENTICATED, 'User is not authenticated, please authenticate using Firebase ' + 'Authentication and try again.');
}
function unauthorized(path) {
    return new FirebaseStorageError(Code.UNAUTHORIZED, 'User does not have permission to access \'' + path + '\'.');
}
function retryLimitExceeded() {
    return new FirebaseStorageError(Code.RETRY_LIMIT_EXCEEDED, 'Max retry time for operation exceeded, please try again.');
}
function invalidChecksum(path, checksum, calculated) {
    return new FirebaseStorageError(Code.INVALID_CHECKSUM, 'Uploaded/downloaded object \'' + path + '\' has checksum \'' + checksum + '\' which does not match \'' + calculated + '\'. Please retry the upload/download.');
}
function canceled() {
    return new FirebaseStorageError(Code.CANCELED, 'User canceled the upload/download.');
}
function invalidEventName(name) {
    return new FirebaseStorageError(Code.INVALID_EVENT_NAME, 'Invalid event name \'' + name + '\'.');
}
function invalidUrl(url) {
    return new FirebaseStorageError(Code.INVALID_URL, 'Invalid URL \'' + url + '\'.');
}
function invalidDefaultBucket(bucket) {
    return new FirebaseStorageError(Code.INVALID_DEFAULT_BUCKET, 'Invalid default bucket \'' + bucket + '\'.');
}
function noDefaultBucket() {
    return new FirebaseStorageError(Code.NO_DEFAULT_BUCKET, 'No default bucket ' + 'found. Did you set the \'' + _constants.configOption + '\' property when initializing the app?');
}
function cannotSliceBlob() {
    return new FirebaseStorageError(Code.CANNOT_SLICE_BLOB, 'Cannot slice blob for upload. Please retry the upload.');
}
function serverFileWrongSize() {
    return new FirebaseStorageError(Code.SERVER_FILE_WRONG_SIZE, 'Server recorded incorrect upload file size, please retry the upload.');
}
function noDownloadURL() {
    return new FirebaseStorageError(Code.NO_DOWNLOAD_URL, 'The given file does not have any download URLs.');
}
function invalidArgument(index, fnName, message) {
    return new FirebaseStorageError(Code.INVALID_ARGUMENT, 'Invalid argument in `' + fnName + '` at index ' + index + ': ' + message);
}
function invalidArgumentCount(argMin, argMax, fnName, real) {
    var countPart = void 0;
    var plural = void 0;
    if (argMin === argMax) {
        countPart = argMin;
        plural = argMin === 1 ? 'argument' : 'arguments';
    } else {
        countPart = 'between ' + argMin + ' and ' + argMax;
        plural = 'arguments';
    }
    return new FirebaseStorageError(Code.INVALID_ARGUMENT_COUNT, 'Invalid argument count in `' + fnName + '`: Expected ' + countPart + ' ' + plural + ', received ' + real + '.');
}
function appDeleted() {
    return new FirebaseStorageError(Code.APP_DELETED, 'The Firebase app was deleted.');
}
/**
 * @param name The name of the operation that was invalid.
 */
function invalidRootOperation(name) {
    return new FirebaseStorageError(Code.INVALID_ROOT_OPERATION, 'The operation \'' + name + '\' cannot be performed on a root reference, create a non-root ' + 'reference using child, such as .child(\'file.png\').');
}
/**
 * @param format The format that was not valid.
 * @param message A message describing the format violation.
 */
function invalidFormat(format, message) {
    return new FirebaseStorageError(Code.INVALID_FORMAT, 'String does not match format \'' + format + '\': ' + message);
}
/**
 * @param message A message describing the internal error.
 */
function internalError(message) {
    throw new FirebaseStorageError(Code.INTERNAL_ERROR, 'Internal error: ' + message);
}
//# sourceMappingURL=error.js.map


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.options = {
    afterMount: null,
    afterRender: null,
    afterUpdate: null,
    beforeRender: null,
    beforeUnmount: null,
    createVNode: null,
    findDOMNodeEnabled: false,
    recyclingEnabled: false,
    roots: []
};


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.make = make;
exports.resolve = resolve;
exports.reject = reject;

var _shared_promise = __webpack_require__(18);

function make(resolver) {
  return new _shared_promise.local.Promise(resolver);
}
/**
 * @template T
 */
/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
 * @fileoverview Implements the promise abstraction interface for external
 * (public SDK) packaging, which just passes through to the firebase-app impl.
 */
/**
 * @template T
 * @param {function((function(T): void),
 *                  (function(!Error): void))} resolver
 */
function resolve(value) {
  return _shared_promise.local.Promise.resolve(value);
}
function reject(error) {
  return _shared_promise.local.Promise.reject(error);
}
//# sourceMappingURL=promise_external.js.map


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var inferno_shared_1 = __webpack_require__(0);
var utils_1 = __webpack_require__(2);
var normalization_1 = __webpack_require__(41);
var options_1 = __webpack_require__(4);
function VNode(children, className, flags, key, props, ref, type) {
    this.children = children;
    this.className = className;
    this.dom = null;
    this.flags = flags;
    this.key = key;
    this.props = props;
    this.ref = ref;
    this.type = type;
}
/**
 * Creates virtual node
 * @param {number} flags
 * @param {string|Function|null} type
 * @param {string|null=} className
 * @param {object=} children
 * @param {object=} props
 * @param {*=} key
 * @param {object|Function=} ref
 * @param {boolean=} noNormalise
 * @returns {VNode} returns new virtual node
 */
function createVNode(flags, type, className, children, props, key, ref, noNormalise) {
    if (flags & 16 /* ComponentUnknown */) {
        flags = inferno_shared_1.isStatefulComponent(type) ? 4 /* ComponentClass */ : 8 /* ComponentFunction */;
    }
    var vNode = new VNode(children === void 0 ? null : children, className === void 0 ? null : className, flags, key === void 0 ? null : key, props === void 0 ? null : props, ref === void 0 ? null : ref, type);
    if (noNormalise !== true) {
        normalization_1.normalize(vNode);
    }
    if (options_1.options.createVNode !== null) {
        options_1.options.createVNode(vNode);
    }
    return vNode;
}
exports.createVNode = createVNode;
function directClone(vNodeToClone) {
    var newVNode;
    var flags = vNodeToClone.flags;
    if (flags & 28 /* Component */) {
        var props = void 0;
        var propsToClone = vNodeToClone.props;
        if (inferno_shared_1.isNull(propsToClone)) {
            props = utils_1.EMPTY_OBJ;
        }
        else {
            props = {};
            for (var key in propsToClone) {
                props[key] = propsToClone[key];
            }
        }
        newVNode = createVNode(flags, vNodeToClone.type, null, null, props, vNodeToClone.key, vNodeToClone.ref, true);
        var newProps = newVNode.props;
        var newChildren = newProps.children;
        // we need to also clone component children that are in props
        // as the children may also have been hoisted
        if (newChildren) {
            if (inferno_shared_1.isArray(newChildren)) {
                var len = newChildren.length;
                if (len > 0) {
                    var tmpArray = [];
                    for (var i = 0; i < len; i++) {
                        var child = newChildren[i];
                        if (inferno_shared_1.isStringOrNumber(child)) {
                            tmpArray.push(child);
                        }
                        else if (!inferno_shared_1.isInvalid(child) && isVNode(child)) {
                            tmpArray.push(directClone(child));
                        }
                    }
                    newProps.children = tmpArray;
                }
            }
            else if (isVNode(newChildren)) {
                newProps.children = directClone(newChildren);
            }
        }
        newVNode.children = null;
    }
    else if (flags & 3970 /* Element */) {
        var children = vNodeToClone.children;
        var props = void 0;
        var propsToClone = vNodeToClone.props;
        if (propsToClone === null) {
            props = utils_1.EMPTY_OBJ;
        }
        else {
            props = {};
            for (var key in propsToClone) {
                props[key] = propsToClone[key];
            }
        }
        newVNode = createVNode(flags, vNodeToClone.type, vNodeToClone.className, children, props, vNodeToClone.key, vNodeToClone.ref, !children);
    }
    else if (flags & 1 /* Text */) {
        newVNode = createTextVNode(vNodeToClone.children, vNodeToClone.key);
    }
    return newVNode;
}
exports.directClone = directClone;
/*
 directClone is preferred over cloneVNode and used internally also.
 This function makes Inferno backwards compatible.
 And can be tree-shaked by modern bundlers

 Would be nice to combine this with directClone but could not do it without breaking change
 */
/**
 * Clones given virtual node by creating new instance of it
 * @param {VNode} vNodeToClone virtual node to be cloned
 * @param {Props=} props additional props for new virtual node
 * @param {...*} _children new children for new virtual node
 * @returns {VNode} new virtual node
 */
function cloneVNode(vNodeToClone, props) {
    var _children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        _children[_i - 2] = arguments[_i];
    }
    var children = _children;
    var childrenLen = _children.length;
    if (childrenLen > 0 && !inferno_shared_1.isUndefined(_children[0])) {
        if (!props) {
            props = {};
        }
        if (childrenLen === 1) {
            children = _children[0];
        }
        if (!inferno_shared_1.isUndefined(children)) {
            props.children = children;
        }
    }
    var newVNode;
    if (inferno_shared_1.isArray(vNodeToClone)) {
        var tmpArray = [];
        for (var i = 0, len = vNodeToClone.length; i < len; i++) {
            tmpArray.push(directClone(vNodeToClone[i]));
        }
        newVNode = tmpArray;
    }
    else {
        var flags = vNodeToClone.flags;
        var className = vNodeToClone.className || (props && props.className);
        var key = !inferno_shared_1.isNullOrUndef(vNodeToClone.key) ? vNodeToClone.key : (props ? props.key : null);
        var ref = vNodeToClone.ref || (props ? props.ref : null);
        if (flags & 28 /* Component */) {
            newVNode = createVNode(flags, vNodeToClone.type, className, null, (!vNodeToClone.props && !props) ? utils_1.EMPTY_OBJ : inferno_shared_1.combineFrom(vNodeToClone.props, props), key, ref, true);
            var newProps = newVNode.props;
            if (newProps) {
                var newChildren = newProps.children;
                // we need to also clone component children that are in props
                // as the children may also have been hoisted
                if (newChildren) {
                    if (inferno_shared_1.isArray(newChildren)) {
                        var len = newChildren.length;
                        if (len > 0) {
                            var tmpArray = [];
                            for (var i = 0; i < len; i++) {
                                var child = newChildren[i];
                                if (inferno_shared_1.isStringOrNumber(child)) {
                                    tmpArray.push(child);
                                }
                                else if (!inferno_shared_1.isInvalid(child) && isVNode(child)) {
                                    tmpArray.push(directClone(child));
                                }
                            }
                            newProps.children = tmpArray;
                        }
                    }
                    else if (isVNode(newChildren)) {
                        newProps.children = directClone(newChildren);
                    }
                }
            }
            newVNode.children = null;
        }
        else if (flags & 3970 /* Element */) {
            children = (props && !inferno_shared_1.isUndefined(props.children)) ? props.children : vNodeToClone.children;
            newVNode = createVNode(flags, vNodeToClone.type, className, children, (!vNodeToClone.props && !props) ? utils_1.EMPTY_OBJ : inferno_shared_1.combineFrom(vNodeToClone.props, props), key, ref, !children);
        }
        else if (flags & 1 /* Text */) {
            newVNode = createTextVNode(vNodeToClone.children, key);
        }
    }
    return newVNode;
}
exports.cloneVNode = cloneVNode;
function createVoidVNode() {
    return createVNode(4096 /* Void */, null);
}
exports.createVoidVNode = createVoidVNode;
function createTextVNode(text, key) {
    return createVNode(1 /* Text */, null, null, text, null, key);
}
exports.createTextVNode = createTextVNode;
function isVNode(o) {
    return !!o.flags;
}
exports.isVNode = isVNode;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.contains = contains;
exports.forEach = forEach;
exports.clone = clone;
/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
 * @fileoverview Contains methods for working with objects.
 */
/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function contains(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}
function forEach(obj, f) {
    for (var key in obj) {
        if (contains(obj, key)) {
            f(key, obj[key]);
        }
    }
}
function clone(obj) {
    if (obj == null) {
        return {};
    }
    var c = {};
    forEach(obj, function (key, val) {
        c[key] = val;
    });
    return c;
}
//# sourceMappingURL=object.js.map


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var inferno_shared_1 = __webpack_require__(0);
var options_1 = __webpack_require__(4);
var VNodes_1 = __webpack_require__(6);
var constants_1 = __webpack_require__(14);
var delegation_1 = __webpack_require__(86);
var mounting_1 = __webpack_require__(15);
var rendering_1 = __webpack_require__(10);
var unmounting_1 = __webpack_require__(24);
var utils_1 = __webpack_require__(2);
var processElement_1 = __webpack_require__(25);
function patch(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling) {
    if (lastVNode !== nextVNode) {
        var lastFlags = lastVNode.flags;
        var nextFlags = nextVNode.flags;
        if (nextFlags & 28 /* Component */) {
            var isClass = (nextFlags & 4 /* ComponentClass */) > 0;
            if (lastFlags & 28 /* Component */) {
                patchComponent(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isClass, isRecycling);
            }
            else {
                utils_1.replaceVNode(parentDom, mounting_1.mountComponent(nextVNode, null, lifecycle, context, isSVG, isClass), lastVNode, lifecycle, isRecycling);
            }
        }
        else if (nextFlags & 3970 /* Element */) {
            if (lastFlags & 3970 /* Element */) {
                patchElement(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling);
            }
            else {
                utils_1.replaceVNode(parentDom, mounting_1.mountElement(nextVNode, null, lifecycle, context, isSVG), lastVNode, lifecycle, isRecycling);
            }
        }
        else if (nextFlags & 1 /* Text */) {
            if (lastFlags & 1 /* Text */) {
                patchText(lastVNode, nextVNode);
            }
            else {
                utils_1.replaceVNode(parentDom, mounting_1.mountText(nextVNode, null), lastVNode, lifecycle, isRecycling);
            }
        }
        else if (nextFlags & 4096 /* Void */) {
            if (lastFlags & 4096 /* Void */) {
                patchVoid(lastVNode, nextVNode);
            }
            else {
                utils_1.replaceVNode(parentDom, mounting_1.mountVoid(nextVNode, null), lastVNode, lifecycle, isRecycling);
            }
        }
        else {
            // Error case: mount new one replacing old one
            utils_1.replaceLastChildAndUnmount(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling);
        }
    }
}
exports.patch = patch;
function unmountChildren(children, dom, lifecycle, isRecycling) {
    if (VNodes_1.isVNode(children)) {
        unmounting_1.unmount(children, dom, lifecycle, true, isRecycling);
    }
    else if (inferno_shared_1.isArray(children)) {
        utils_1.removeAllChildren(dom, children, lifecycle, isRecycling);
    }
    else {
        dom.textContent = '';
    }
}
function patchElement(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling) {
    var nextTag = nextVNode.type;
    var lastTag = lastVNode.type;
    if (lastTag !== nextTag) {
        utils_1.replaceWithNewNode(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling);
    }
    else {
        var dom = lastVNode.dom;
        var lastProps = lastVNode.props;
        var nextProps = nextVNode.props;
        var lastChildren = lastVNode.children;
        var nextChildren = nextVNode.children;
        var lastFlags = lastVNode.flags;
        var nextFlags = nextVNode.flags;
        var nextRef = nextVNode.ref;
        var lastClassName = lastVNode.className;
        var nextClassName = nextVNode.className;
        nextVNode.dom = dom;
        isSVG = isSVG || (nextFlags & 128 /* SvgElement */) > 0;
        if (lastChildren !== nextChildren) {
            var childrenIsSVG = isSVG === true && nextVNode.type !== 'foreignObject';
            patchChildren(lastFlags, nextFlags, lastChildren, nextChildren, dom, lifecycle, context, childrenIsSVG, isRecycling);
        }
        // inlined patchProps  -- starts --
        if (lastProps !== nextProps) {
            var lastPropsOrEmpty = lastProps || utils_1.EMPTY_OBJ;
            var nextPropsOrEmpty = nextProps || utils_1.EMPTY_OBJ;
            var hasControlledValue = false;
            if (nextPropsOrEmpty !== utils_1.EMPTY_OBJ) {
                var isFormElement = (nextFlags & 3584 /* FormElement */) > 0;
                if (isFormElement) {
                    hasControlledValue = processElement_1.isControlledFormElement(nextPropsOrEmpty);
                }
                for (var prop in nextPropsOrEmpty) {
                    // do not add a hasOwnProperty check here, it affects performance
                    var nextValue = nextPropsOrEmpty[prop];
                    var lastValue = lastPropsOrEmpty[prop];
                    patchProp(prop, lastValue, nextValue, dom, isSVG, hasControlledValue);
                }
                if (isFormElement) {
                    // When inferno is recycling form element, we need to process it like it would be mounting
                    processElement_1.processElement(nextFlags, nextVNode, dom, nextPropsOrEmpty, isRecycling, hasControlledValue);
                }
            }
            if (lastPropsOrEmpty !== utils_1.EMPTY_OBJ) {
                for (var prop in lastPropsOrEmpty) {
                    // do not add a hasOwnProperty check here, it affects performance
                    if (inferno_shared_1.isNullOrUndef(nextPropsOrEmpty[prop]) && !inferno_shared_1.isNullOrUndef(lastPropsOrEmpty[prop])) {
                        removeProp(prop, lastPropsOrEmpty[prop], dom, nextFlags);
                    }
                }
            }
        }
        // inlined patchProps  -- ends --
        if (lastClassName !== nextClassName) {
            if (inferno_shared_1.isNullOrUndef(nextClassName)) {
                dom.removeAttribute('class');
            }
            else {
                if (isSVG) {
                    dom.setAttribute('class', nextClassName);
                }
                else {
                    dom.className = nextClassName;
                }
            }
        }
        if (nextRef) {
            if (lastVNode.ref !== nextRef || isRecycling) {
                mounting_1.mountRef(dom, nextRef, lifecycle);
            }
        }
    }
}
exports.patchElement = patchElement;
function patchChildren(lastFlags, nextFlags, lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling) {
    var patchArray = false;
    var patchKeyed = false;
    if (nextFlags & 64 /* HasNonKeyedChildren */) {
        patchArray = true;
    }
    else if ((lastFlags & 32 /* HasKeyedChildren */) > 0 && (nextFlags & 32 /* HasKeyedChildren */) > 0) {
        patchKeyed = true;
        patchArray = true;
    }
    else if (inferno_shared_1.isInvalid(nextChildren)) {
        unmountChildren(lastChildren, dom, lifecycle, isRecycling);
    }
    else if (inferno_shared_1.isInvalid(lastChildren)) {
        if (inferno_shared_1.isStringOrNumber(nextChildren)) {
            utils_1.setTextContent(dom, nextChildren);
        }
        else {
            if (inferno_shared_1.isArray(nextChildren)) {
                mounting_1.mountArrayChildren(nextChildren, dom, lifecycle, context, isSVG);
            }
            else {
                mounting_1.mount(nextChildren, dom, lifecycle, context, isSVG);
            }
        }
    }
    else if (inferno_shared_1.isStringOrNumber(nextChildren)) {
        if (inferno_shared_1.isStringOrNumber(lastChildren)) {
            utils_1.updateTextContent(dom, nextChildren);
        }
        else {
            unmountChildren(lastChildren, dom, lifecycle, isRecycling);
            utils_1.setTextContent(dom, nextChildren);
        }
    }
    else if (inferno_shared_1.isArray(nextChildren)) {
        if (inferno_shared_1.isArray(lastChildren)) {
            patchArray = true;
            if (utils_1.isKeyed(lastChildren, nextChildren)) {
                patchKeyed = true;
            }
        }
        else {
            unmountChildren(lastChildren, dom, lifecycle, isRecycling);
            mounting_1.mountArrayChildren(nextChildren, dom, lifecycle, context, isSVG);
        }
    }
    else if (inferno_shared_1.isArray(lastChildren)) {
        utils_1.removeAllChildren(dom, lastChildren, lifecycle, isRecycling);
        mounting_1.mount(nextChildren, dom, lifecycle, context, isSVG);
    }
    else if (VNodes_1.isVNode(nextChildren)) {
        if (VNodes_1.isVNode(lastChildren)) {
            patch(lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling);
        }
        else {
            unmountChildren(lastChildren, dom, lifecycle, isRecycling);
            mounting_1.mount(nextChildren, dom, lifecycle, context, isSVG);
        }
    }
    if (patchArray) {
        if (patchKeyed) {
            patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling);
        }
        else {
            patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling);
        }
    }
}
function patchComponent(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isClass, isRecycling) {
    var lastType = lastVNode.type;
    var nextType = nextVNode.type;
    var lastKey = lastVNode.key;
    var nextKey = nextVNode.key;
    if (lastType !== nextType || lastKey !== nextKey) {
        utils_1.replaceWithNewNode(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling);
        return false;
    }
    else {
        var nextProps = nextVNode.props || utils_1.EMPTY_OBJ;
        if (isClass) {
            var instance = lastVNode.children;
            instance._updating = true;
            if (instance._unmounted) {
                if (inferno_shared_1.isNull(parentDom)) {
                    return true;
                }
                utils_1.replaceChild(parentDom, mounting_1.mountComponent(nextVNode, null, lifecycle, context, isSVG, (nextVNode.flags & 4 /* ComponentClass */) > 0), lastVNode.dom);
            }
            else {
                var hasComponentDidUpdate = !inferno_shared_1.isUndefined(instance.componentDidUpdate);
                var nextState = instance.state;
                // When component has componentDidUpdate hook, we need to clone lastState or will be modified by reference during update
                var lastState = hasComponentDidUpdate ? inferno_shared_1.combineFrom(nextState, null) : nextState;
                var lastProps = instance.props;
                var childContext = void 0;
                if (!inferno_shared_1.isNullOrUndef(instance.getChildContext)) {
                    childContext = instance.getChildContext();
                }
                nextVNode.children = instance;
                instance._isSVG = isSVG;
                if (inferno_shared_1.isNullOrUndef(childContext)) {
                    childContext = context;
                }
                else {
                    childContext = inferno_shared_1.combineFrom(context, childContext);
                }
                var lastInput = instance._lastInput;
                var nextInput = instance._updateComponent(lastState, nextState, lastProps, nextProps, context, false, false);
                var didUpdate = true;
                instance._childContext = childContext;
                if (inferno_shared_1.isInvalid(nextInput)) {
                    nextInput = VNodes_1.createVoidVNode();
                }
                else if (nextInput === inferno_shared_1.NO_OP) {
                    nextInput = lastInput;
                    didUpdate = false;
                }
                else if (inferno_shared_1.isStringOrNumber(nextInput)) {
                    nextInput = VNodes_1.createTextVNode(nextInput, null);
                }
                else if (inferno_shared_1.isArray(nextInput)) {
                    if (process.env.NODE_ENV !== 'production') {
                        inferno_shared_1.throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
                    }
                    inferno_shared_1.throwError();
                }
                else if (inferno_shared_1.isObject(nextInput)) {
                    if (!inferno_shared_1.isNull(nextInput.dom)) {
                        nextInput = VNodes_1.directClone(nextInput);
                    }
                }
                if (nextInput.flags & 28 /* Component */) {
                    nextInput.parentVNode = nextVNode;
                }
                else if (lastInput.flags & 28 /* Component */) {
                    lastInput.parentVNode = nextVNode;
                }
                instance._lastInput = nextInput;
                instance._vNode = nextVNode;
                if (didUpdate) {
                    patch(lastInput, nextInput, parentDom, lifecycle, childContext, isSVG, isRecycling);
                    if (hasComponentDidUpdate && instance.componentDidUpdate) {
                        instance.componentDidUpdate(lastProps, lastState);
                    }
                    if (!inferno_shared_1.isNull(options_1.options.afterUpdate)) {
                        options_1.options.afterUpdate(nextVNode);
                    }
                    if (options_1.options.findDOMNodeEnabled) {
                        rendering_1.componentToDOMNodeMap.set(instance, nextInput.dom);
                    }
                }
                nextVNode.dom = nextInput.dom;
            }
            instance._updating = false;
        }
        else {
            var shouldUpdate = true;
            var lastProps = lastVNode.props;
            var nextHooks = nextVNode.ref;
            var nextHooksDefined = !inferno_shared_1.isNullOrUndef(nextHooks);
            var lastInput = lastVNode.children;
            var nextInput = lastInput;
            nextVNode.dom = lastVNode.dom;
            nextVNode.children = lastInput;
            if (lastKey !== nextKey) {
                shouldUpdate = true;
            }
            else {
                if (nextHooksDefined && !inferno_shared_1.isNullOrUndef(nextHooks.onComponentShouldUpdate)) {
                    shouldUpdate = nextHooks.onComponentShouldUpdate(lastProps, nextProps);
                }
            }
            if (shouldUpdate !== false) {
                if (nextHooksDefined && !inferno_shared_1.isNullOrUndef(nextHooks.onComponentWillUpdate)) {
                    nextHooks.onComponentWillUpdate(lastProps, nextProps);
                }
                nextInput = nextType(nextProps, context);
                if (inferno_shared_1.isInvalid(nextInput)) {
                    nextInput = VNodes_1.createVoidVNode();
                }
                else if (inferno_shared_1.isStringOrNumber(nextInput) && nextInput !== inferno_shared_1.NO_OP) {
                    nextInput = VNodes_1.createTextVNode(nextInput, null);
                }
                else if (inferno_shared_1.isArray(nextInput)) {
                    if (process.env.NODE_ENV !== 'production') {
                        inferno_shared_1.throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
                    }
                    inferno_shared_1.throwError();
                }
                else if (inferno_shared_1.isObject(nextInput)) {
                    if (!inferno_shared_1.isNull(nextInput.dom)) {
                        nextInput = VNodes_1.directClone(nextInput);
                    }
                }
                if (nextInput !== inferno_shared_1.NO_OP) {
                    patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG, isRecycling);
                    nextVNode.children = nextInput;
                    if (nextHooksDefined && !inferno_shared_1.isNullOrUndef(nextHooks.onComponentDidUpdate)) {
                        nextHooks.onComponentDidUpdate(lastProps, nextProps);
                    }
                    nextVNode.dom = nextInput.dom;
                }
            }
            if (nextInput.flags & 28 /* Component */) {
                nextInput.parentVNode = nextVNode;
            }
            else if (lastInput.flags & 28 /* Component */) {
                lastInput.parentVNode = nextVNode;
            }
        }
    }
    return false;
}
exports.patchComponent = patchComponent;
function patchText(lastVNode, nextVNode) {
    var nextText = nextVNode.children;
    var dom = lastVNode.dom;
    nextVNode.dom = dom;
    if (lastVNode.children !== nextText) {
        dom.nodeValue = nextText;
    }
}
exports.patchText = patchText;
function patchVoid(lastVNode, nextVNode) {
    nextVNode.dom = lastVNode.dom;
}
exports.patchVoid = patchVoid;
function patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling) {
    var lastChildrenLength = lastChildren.length;
    var nextChildrenLength = nextChildren.length;
    var commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
    var i = 0;
    for (; i < commonLength; i++) {
        var nextChild = nextChildren[i];
        if (nextChild.dom) {
            nextChild = nextChildren[i] = VNodes_1.directClone(nextChild);
        }
        patch(lastChildren[i], nextChild, dom, lifecycle, context, isSVG, isRecycling);
    }
    if (lastChildrenLength < nextChildrenLength) {
        for (i = commonLength; i < nextChildrenLength; i++) {
            var nextChild = nextChildren[i];
            if (nextChild.dom) {
                nextChild = nextChildren[i] = VNodes_1.directClone(nextChild);
            }
            utils_1.appendChild(dom, mounting_1.mount(nextChild, null, lifecycle, context, isSVG));
        }
    }
    else if (nextChildrenLength === 0) {
        utils_1.removeAllChildren(dom, lastChildren, lifecycle, isRecycling);
    }
    else if (lastChildrenLength > nextChildrenLength) {
        for (i = commonLength; i < lastChildrenLength; i++) {
            unmounting_1.unmount(lastChildren[i], dom, lifecycle, false, isRecycling);
        }
    }
}
exports.patchNonKeyedChildren = patchNonKeyedChildren;
function patchKeyedChildren(a, b, dom, lifecycle, context, isSVG, isRecycling) {
    var aLength = a.length;
    var bLength = b.length;
    var aEnd = aLength - 1;
    var bEnd = bLength - 1;
    var aStart = 0;
    var bStart = 0;
    var i;
    var j;
    var aNode;
    var bNode;
    var nextNode;
    var nextPos;
    var node;
    if (aLength === 0) {
        if (bLength > 0) {
            mounting_1.mountArrayChildren(b, dom, lifecycle, context, isSVG);
        }
        return;
    }
    else if (bLength === 0) {
        utils_1.removeAllChildren(dom, a, lifecycle, isRecycling);
        return;
    }
    var aStartNode = a[aStart];
    var bStartNode = b[bStart];
    var aEndNode = a[aEnd];
    var bEndNode = b[bEnd];
    if (bStartNode.dom) {
        b[bStart] = bStartNode = VNodes_1.directClone(bStartNode);
    }
    if (bEndNode.dom) {
        b[bEnd] = bEndNode = VNodes_1.directClone(bEndNode);
    }
    // Step 1
    /* eslint no-constant-condition: 0 */
    outer: while (true) {
        // Sync nodes with the same key at the beginning.
        while (aStartNode.key === bStartNode.key) {
            patch(aStartNode, bStartNode, dom, lifecycle, context, isSVG, isRecycling);
            aStart++;
            bStart++;
            if (aStart > aEnd || bStart > bEnd) {
                break outer;
            }
            aStartNode = a[aStart];
            bStartNode = b[bStart];
            if (bStartNode.dom) {
                b[bStart] = bStartNode = VNodes_1.directClone(bStartNode);
            }
        }
        // Sync nodes with the same key at the end.
        while (aEndNode.key === bEndNode.key) {
            patch(aEndNode, bEndNode, dom, lifecycle, context, isSVG, isRecycling);
            aEnd--;
            bEnd--;
            if (aStart > aEnd || bStart > bEnd) {
                break outer;
            }
            aEndNode = a[aEnd];
            bEndNode = b[bEnd];
            if (bEndNode.dom) {
                b[bEnd] = bEndNode = VNodes_1.directClone(bEndNode);
            }
        }
        // Move and sync nodes from right to left.
        if (aEndNode.key === bStartNode.key) {
            patch(aEndNode, bStartNode, dom, lifecycle, context, isSVG, isRecycling);
            utils_1.insertOrAppend(dom, bStartNode.dom, aStartNode.dom);
            aEnd--;
            bStart++;
            aEndNode = a[aEnd];
            bStartNode = b[bStart];
            if (bStartNode.dom) {
                b[bStart] = bStartNode = VNodes_1.directClone(bStartNode);
            }
            continue;
        }
        // Move and sync nodes from left to right.
        if (aStartNode.key === bEndNode.key) {
            patch(aStartNode, bEndNode, dom, lifecycle, context, isSVG, isRecycling);
            nextPos = bEnd + 1;
            nextNode = nextPos < b.length ? b[nextPos].dom : null;
            utils_1.insertOrAppend(dom, bEndNode.dom, nextNode);
            aStart++;
            bEnd--;
            aStartNode = a[aStart];
            bEndNode = b[bEnd];
            if (bEndNode.dom) {
                b[bEnd] = bEndNode = VNodes_1.directClone(bEndNode);
            }
            continue;
        }
        break;
    }
    if (aStart > aEnd) {
        if (bStart <= bEnd) {
            nextPos = bEnd + 1;
            nextNode = nextPos < b.length ? b[nextPos].dom : null;
            while (bStart <= bEnd) {
                node = b[bStart];
                if (node.dom) {
                    b[bStart] = node = VNodes_1.directClone(node);
                }
                bStart++;
                utils_1.insertOrAppend(dom, mounting_1.mount(node, null, lifecycle, context, isSVG), nextNode);
            }
        }
    }
    else if (bStart > bEnd) {
        while (aStart <= aEnd) {
            unmounting_1.unmount(a[aStart++], dom, lifecycle, false, isRecycling);
        }
    }
    else {
        aLength = aEnd - aStart + 1;
        bLength = bEnd - bStart + 1;
        var sources = new Array(bLength);
        // Mark all nodes as inserted.
        for (i = 0; i < bLength; i++) {
            sources[i] = -1;
        }
        var moved = false;
        var pos = 0;
        var patched = 0;
        // When sizes are small, just loop them through
        if ((bLength <= 4) || (aLength * bLength <= 16)) {
            for (i = aStart; i <= aEnd; i++) {
                aNode = a[i];
                if (patched < bLength) {
                    for (j = bStart; j <= bEnd; j++) {
                        bNode = b[j];
                        if (aNode.key === bNode.key) {
                            sources[j - bStart] = i;
                            if (pos > j) {
                                moved = true;
                            }
                            else {
                                pos = j;
                            }
                            if (bNode.dom) {
                                b[j] = bNode = VNodes_1.directClone(bNode);
                            }
                            patch(aNode, bNode, dom, lifecycle, context, isSVG, isRecycling);
                            patched++;
                            a[i] = null;
                            break;
                        }
                    }
                }
            }
        }
        else {
            var keyIndex = new Map();
            // Map keys by their index in array
            for (i = bStart; i <= bEnd; i++) {
                keyIndex.set(b[i].key, i);
            }
            // Try to patch same keys
            for (i = aStart; i <= aEnd; i++) {
                aNode = a[i];
                if (patched < bLength) {
                    j = keyIndex.get(aNode.key);
                    if (!inferno_shared_1.isUndefined(j)) {
                        bNode = b[j];
                        sources[j - bStart] = i;
                        if (pos > j) {
                            moved = true;
                        }
                        else {
                            pos = j;
                        }
                        if (bNode.dom) {
                            b[j] = bNode = VNodes_1.directClone(bNode);
                        }
                        patch(aNode, bNode, dom, lifecycle, context, isSVG, isRecycling);
                        patched++;
                        a[i] = null;
                    }
                }
            }
        }
        // fast-path: if nothing patched remove all old and add all new
        if (aLength === a.length && patched === 0) {
            utils_1.removeAllChildren(dom, a, lifecycle, isRecycling);
            while (bStart < bLength) {
                node = b[bStart];
                if (node.dom) {
                    b[bStart] = node = VNodes_1.directClone(node);
                }
                bStart++;
                utils_1.insertOrAppend(dom, mounting_1.mount(node, null, lifecycle, context, isSVG), null);
            }
        }
        else {
            i = aLength - patched;
            while (i > 0) {
                aNode = a[aStart++];
                if (!inferno_shared_1.isNull(aNode)) {
                    unmounting_1.unmount(aNode, dom, lifecycle, true, isRecycling);
                    i--;
                }
            }
            if (moved) {
                var seq = lis_algorithm(sources);
                j = seq.length - 1;
                for (i = bLength - 1; i >= 0; i--) {
                    if (sources[i] === -1) {
                        pos = i + bStart;
                        node = b[pos];
                        if (node.dom) {
                            b[pos] = node = VNodes_1.directClone(node);
                        }
                        nextPos = pos + 1;
                        nextNode = nextPos < b.length ? b[nextPos].dom : null;
                        utils_1.insertOrAppend(dom, mounting_1.mount(node, dom, lifecycle, context, isSVG), nextNode);
                    }
                    else {
                        if (j < 0 || i !== seq[j]) {
                            pos = i + bStart;
                            node = b[pos];
                            nextPos = pos + 1;
                            nextNode = nextPos < b.length ? b[nextPos].dom : null;
                            utils_1.insertOrAppend(dom, node.dom, nextNode);
                        }
                        else {
                            j--;
                        }
                    }
                }
            }
            else if (patched !== bLength) {
                // when patched count doesn't match b length we need to insert those new ones
                // loop backwards so we can use insertBefore
                for (i = bLength - 1; i >= 0; i--) {
                    if (sources[i] === -1) {
                        pos = i + bStart;
                        node = b[pos];
                        if (node.dom) {
                            b[pos] = node = VNodes_1.directClone(node);
                        }
                        nextPos = pos + 1;
                        nextNode = nextPos < b.length ? b[nextPos].dom : null;
                        utils_1.insertOrAppend(dom, mounting_1.mount(node, null, lifecycle, context, isSVG), nextNode);
                    }
                }
            }
        }
    }
}
exports.patchKeyedChildren = patchKeyedChildren;
// // https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function lis_algorithm(arr) {
    var p = arr.slice(0);
    var result = [0];
    var i;
    var j;
    var u;
    var v;
    var c;
    var len = arr.length;
    for (i = 0; i < len; i++) {
        var arrI = arr[i];
        if (arrI === -1) {
            continue;
        }
        j = result[result.length - 1];
        if (arr[j] < arrI) {
            p[i] = j;
            result.push(i);
            continue;
        }
        u = 0;
        v = result.length - 1;
        while (u < v) {
            c = ((u + v) / 2) | 0;
            if (arr[result[c]] < arrI) {
                u = c + 1;
            }
            else {
                v = c;
            }
        }
        if (arrI < arr[result[u]]) {
            if (u > 0) {
                p[i] = result[u - 1];
            }
            result[u] = i;
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}
function isAttrAnEvent(attr) {
    return attr[0] === 'o' && attr[1] === 'n';
}
exports.isAttrAnEvent = isAttrAnEvent;
function patchProp(prop, lastValue, nextValue, dom, isSVG, hasControlledValue) {
    if (lastValue !== nextValue) {
        if (constants_1.skipProps.has(prop) || (hasControlledValue && prop === 'value')) {
            return;
        }
        else if (constants_1.booleanProps.has(prop)) {
            prop = prop === 'autoFocus' ? prop.toLowerCase() : prop;
            dom[prop] = !!nextValue;
        }
        else if (constants_1.strictProps.has(prop)) {
            var value = inferno_shared_1.isNullOrUndef(nextValue) ? '' : nextValue;
            if (dom[prop] !== value) {
                dom[prop] = value;
            }
        }
        else if (isAttrAnEvent(prop)) {
            patchEvent(prop, lastValue, nextValue, dom);
        }
        else if (inferno_shared_1.isNullOrUndef(nextValue)) {
            dom.removeAttribute(prop);
        }
        else if (prop === 'style') {
            patchStyle(lastValue, nextValue, dom);
        }
        else if (prop === 'dangerouslySetInnerHTML') {
            var lastHtml = lastValue && lastValue.__html;
            var nextHtml = nextValue && nextValue.__html;
            if (lastHtml !== nextHtml) {
                if (!inferno_shared_1.isNullOrUndef(nextHtml)) {
                    dom.innerHTML = nextHtml;
                }
            }
        }
        else {
            // We optimize for NS being boolean. Its 99.9% time false
            if (isSVG && constants_1.namespaces.has(prop)) {
                // If we end up in this path we can read property again
                dom.setAttributeNS(constants_1.namespaces.get(prop), prop, nextValue);
            }
            else {
                dom.setAttribute(prop, nextValue);
            }
        }
    }
}
exports.patchProp = patchProp;
function patchEvent(name, lastValue, nextValue, dom) {
    if (lastValue !== nextValue) {
        if (constants_1.delegatedEvents.has(name)) {
            delegation_1.handleEvent(name, lastValue, nextValue, dom);
        }
        else {
            var nameLowerCase = name.toLowerCase();
            var domEvent = dom[nameLowerCase];
            // if the function is wrapped, that means it's been controlled by a wrapper
            if (domEvent && domEvent.wrapped) {
                return;
            }
            if (!inferno_shared_1.isFunction(nextValue) && !inferno_shared_1.isNullOrUndef(nextValue)) {
                var linkEvent_1 = nextValue.event;
                if (linkEvent_1 && inferno_shared_1.isFunction(linkEvent_1)) {
                    dom[nameLowerCase] = function (e) {
                        linkEvent_1(nextValue.data, e);
                    };
                }
                else {
                    if (process.env.NODE_ENV !== 'production') {
                        inferno_shared_1.throwError("an event on a VNode \"" + name + "\". was not a function or a valid linkEvent.");
                    }
                    inferno_shared_1.throwError();
                }
            }
            else {
                dom[nameLowerCase] = nextValue;
            }
        }
    }
}
exports.patchEvent = patchEvent;
// We are assuming here that we come from patchProp routine
// -nextAttrValue cannot be null or undefined
function patchStyle(lastAttrValue, nextAttrValue, dom) {
    var domStyle = dom.style;
    if (inferno_shared_1.isString(nextAttrValue)) {
        domStyle.cssText = nextAttrValue;
        return;
    }
    for (var style in nextAttrValue) {
        // do not add a hasOwnProperty check here, it affects performance
        var value = nextAttrValue[style];
        if (!inferno_shared_1.isNumber(value) || constants_1.isUnitlessNumber.has(style)) {
            domStyle[style] = value;
        }
        else {
            domStyle[style] = value + 'px';
        }
    }
    if (!inferno_shared_1.isNullOrUndef(lastAttrValue)) {
        for (var style in lastAttrValue) {
            if (inferno_shared_1.isNullOrUndef(nextAttrValue[style])) {
                domStyle[style] = '';
            }
        }
    }
}
exports.patchStyle = patchStyle;
function removeProp(prop, lastValue, dom, nextFlags) {
    if (prop === 'value') {
        // When removing value of select element, it needs to be set to null instead empty string, because empty string is valid value for option which makes that option selected
        // MS IE/Edge don't follow html spec for textArea and input elements and we need to set empty string to value in those cases to avoid "null" and "undefined" texts
        dom.value = nextFlags & 2048 /* SelectElement */ ? null : '';
    }
    else if (prop === 'style') {
        dom.removeAttribute('style');
    }
    else if (isAttrAnEvent(prop)) {
        delegation_1.handleEvent(prop, lastValue, null, dom);
    }
    else {
        dom.removeAttribute(prop);
    }
}


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
  value: true
});

var _firebase_app = __webpack_require__(50);

// Export a single instance of firebase app
var firebase = (0, _firebase_app.createFirebaseNamespace)(); /**
                                                             * Copyright 2017 Google Inc.
                                                             *
                                                             * Licensed under the Apache License, Version 2.0 (the "License");
                                                             * you may not use this file except in compliance with the License.
                                                             * You may obtain a copy of the License at
                                                             *
                                                             *   http://www.apache.org/licenses/LICENSE-2.0
                                                             *
                                                             * Unless required by applicable law or agreed to in writing, software
                                                             * distributed under the License is distributed on an "AS IS" BASIS,
                                                             * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                             * See the License for the specific language governing permissions and
                                                             * limitations under the License.
                                                             */
// Import the createFirebaseNamespace function
exports.default = firebase;
module.exports = exports['default'];
//# sourceMappingURL=app.js.map


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var inferno_shared_1 = __webpack_require__(0);
var options_1 = __webpack_require__(4);
var VNodes_1 = __webpack_require__(6);
var hydration_1 = __webpack_require__(88);
var mounting_1 = __webpack_require__(15);
var patching_1 = __webpack_require__(8);
var unmounting_1 = __webpack_require__(24);
var utils_1 = __webpack_require__(2);
// rather than use a Map, like we did before, we can use an array here
// given there shouldn't be THAT many roots on the page, the difference
// in performance is huge: https://esbench.com/bench/5802a691330ab09900a1a2da
exports.componentToDOMNodeMap = new Map();
var roots = options_1.options.roots;
/**
 * When inferno.options.findDOMNOdeEnabled is true, this function will return DOM Node by component instance
 * @param ref Component instance
 * @returns {*|null} returns dom node
 */
function findDOMNode(ref) {
    if (!options_1.options.findDOMNodeEnabled) {
        if (process.env.NODE_ENV !== 'production') {
            inferno_shared_1.throwError('findDOMNode() has been disabled, use Inferno.options.findDOMNodeEnabled = true; enabled findDOMNode(). Warning this can significantly impact performance!');
        }
        inferno_shared_1.throwError();
    }
    var dom = ref && ref.nodeType ? ref : null;
    return exports.componentToDOMNodeMap.get(ref) || dom;
}
exports.findDOMNode = findDOMNode;
function getRoot(dom) {
    for (var i = 0, len = roots.length; i < len; i++) {
        var root = roots[i];
        if (root.dom === dom) {
            return root;
        }
    }
    return null;
}
function setRoot(dom, input, lifecycle) {
    var root = {
        dom: dom,
        input: input,
        lifecycle: lifecycle
    };
    roots.push(root);
    return root;
}
function removeRoot(root) {
    for (var i = 0, len = roots.length; i < len; i++) {
        if (roots[i] === root) {
            roots.splice(i, 1);
            return;
        }
    }
}
if (process.env.NODE_ENV !== 'production') {
    if (inferno_shared_1.isBrowser && document.body === null) {
        inferno_shared_1.warning('Inferno warning: you cannot initialize inferno without "document.body". Wait on "DOMContentLoaded" event, add script to bottom of body, or use async/defer attributes on script tag.');
    }
}
var documentBody = inferno_shared_1.isBrowser ? document.body : null;
/**
 * Renders virtual node tree into parent node.
 * @param {VNode | null | string | number} input vNode to be rendered
 * @param parentDom DOM node which content will be replaced by virtual node
 * @returns {InfernoChildren} rendered virtual node
 */
function render(input, parentDom) {
    if (documentBody === parentDom) {
        if (process.env.NODE_ENV !== 'production') {
            inferno_shared_1.throwError('you cannot render() to the "document.body". Use an empty element as a container instead.');
        }
        inferno_shared_1.throwError();
    }
    if (input === inferno_shared_1.NO_OP) {
        return;
    }
    var root = getRoot(parentDom);
    if (inferno_shared_1.isNull(root)) {
        var lifecycle = new inferno_shared_1.Lifecycle();
        if (!inferno_shared_1.isInvalid(input)) {
            if (input.dom) {
                input = VNodes_1.directClone(input);
            }
            if (!hydration_1.hydrateRoot(input, parentDom, lifecycle)) {
                mounting_1.mount(input, parentDom, lifecycle, utils_1.EMPTY_OBJ, false);
            }
            root = setRoot(parentDom, input, lifecycle);
            lifecycle.trigger();
        }
    }
    else {
        var lifecycle = root.lifecycle;
        lifecycle.listeners = [];
        if (inferno_shared_1.isNullOrUndef(input)) {
            unmounting_1.unmount(root.input, parentDom, lifecycle, false, false);
            removeRoot(root);
        }
        else {
            if (input.dom) {
                input = VNodes_1.directClone(input);
            }
            patching_1.patch(root.input, input, parentDom, lifecycle, utils_1.EMPTY_OBJ, false, false);
        }
        root.input = input;
        lifecycle.trigger();
    }
    if (root) {
        var rootInput = root.input;
        if (rootInput && (rootInput.flags & 28 /* Component */)) {
            return rootInput.children;
        }
    }
}
exports.render = render;
function createRenderer(parentDom) {
    return function renderer(lastInput, nextInput) {
        if (!parentDom) {
            parentDom = lastInput;
        }
        render(nextInput, parentDom);
    };
}
exports.createRenderer = createRenderer;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */

/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ERROR_MAP;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var CODES = {
    AVAILABLE_IN_WINDOW: 'only-available-in-window',
    AVAILABLE_IN_SW: 'only-available-in-sw',
    SHOULD_BE_INHERITED: 'should-be-overriden',
    BAD_SENDER_ID: 'bad-sender-id',
    INCORRECT_GCM_SENDER_ID: 'incorrect-gcm-sender-id',
    PERMISSION_DEFAULT: 'permission-default',
    PERMISSION_BLOCKED: 'permission-blocked',
    UNSUPPORTED_BROWSER: 'unsupported-browser',
    NOTIFICATIONS_BLOCKED: 'notifications-blocked',
    FAILED_DEFAULT_REGISTRATION: 'failed-serviceworker-registration',
    SW_REGISTRATION_EXPECTED: 'sw-registration-expected',
    GET_SUBSCRIPTION_FAILED: 'get-subscription-failed',
    INVALID_SAVED_TOKEN: 'invalid-saved-token',
    SW_REG_REDUNDANT: 'sw-reg-redundant',
    TOKEN_SUBSCRIBE_FAILED: 'token-subscribe-failed',
    TOKEN_SUBSCRIBE_NO_TOKEN: 'token-subscribe-no-token',
    TOKEN_SUBSCRIBE_NO_PUSH_SET: 'token-subscribe-no-push-set',
    USE_SW_BEFORE_GET_TOKEN: 'use-sw-before-get-token',
    INVALID_DELETE_TOKEN: 'invalid-delete-token',
    DELETE_TOKEN_NOT_FOUND: 'delete-token-not-found',
    DELETE_SCOPE_NOT_FOUND: 'delete-scope-not-found',
    BG_HANDLER_FUNCTION_EXPECTED: 'bg-handler-function-expected',
    NO_WINDOW_CLIENT_TO_MSG: 'no-window-client-to-msg',
    UNABLE_TO_RESUBSCRIBE: 'unable-to-resubscribe',
    NO_FCM_TOKEN_FOR_RESUBSCRIBE: 'no-fcm-token-for-resubscribe',
    FAILED_TO_DELETE_TOKEN: 'failed-to-delete-token',
    NO_SW_IN_REG: 'no-sw-in-reg',
    BAD_SCOPE: 'bad-scope',
    BAD_VAPID_KEY: 'bad-vapid-key',
    BAD_SUBSCRIPTION: 'bad-subscription',
    BAD_TOKEN: 'bad-token',
    BAD_PUSH_SET: 'bad-push-set',
    FAILED_DELETE_VAPID_KEY: 'failed-delete-vapid-key'
};
var ERROR_MAP = (_ERROR_MAP = {}, _defineProperty(_ERROR_MAP, CODES.AVAILABLE_IN_WINDOW, 'This method is available in a Window context.'), _defineProperty(_ERROR_MAP, CODES.AVAILABLE_IN_SW, 'This method is available in a service worker ' + 'context.'), _defineProperty(_ERROR_MAP, CODES.SHOULD_BE_INHERITED, 'This method should be overriden by ' + 'extended classes.'), _defineProperty(_ERROR_MAP, CODES.BAD_SENDER_ID, 'Please ensure that \'messagingSenderId\' is set ' + 'correctly in the options passed into firebase.initializeApp().'), _defineProperty(_ERROR_MAP, CODES.PERMISSION_DEFAULT, 'The required permissions were not granted and ' + 'dismissed instead.'), _defineProperty(_ERROR_MAP, CODES.PERMISSION_BLOCKED, 'The required permissions were not granted and ' + 'blocked instead.'), _defineProperty(_ERROR_MAP, CODES.UNSUPPORTED_BROWSER, 'This browser doesn\'t support the API\'s ' + 'required to use the firebase SDK.'), _defineProperty(_ERROR_MAP, CODES.NOTIFICATIONS_BLOCKED, 'Notifications have been blocked.'), _defineProperty(_ERROR_MAP, CODES.FAILED_DEFAULT_REGISTRATION, 'We are unable to register the ' + 'default service worker. {$browserErrorMessage}'), _defineProperty(_ERROR_MAP, CODES.SW_REGISTRATION_EXPECTED, 'A service worker registration was the ' + 'expected input.'), _defineProperty(_ERROR_MAP, CODES.GET_SUBSCRIPTION_FAILED, 'There was an error when trying to get ' + 'any existing Push Subscriptions.'), _defineProperty(_ERROR_MAP, CODES.INVALID_SAVED_TOKEN, 'Unable to access details of the saved token.'), _defineProperty(_ERROR_MAP, CODES.SW_REG_REDUNDANT, 'The service worker being used for push was made ' + 'redundant.'), _defineProperty(_ERROR_MAP, CODES.TOKEN_SUBSCRIBE_FAILED, 'A problem occured while subscribing the ' + 'user to FCM: {$message}'), _defineProperty(_ERROR_MAP, CODES.TOKEN_SUBSCRIBE_NO_TOKEN, 'FCM returned no token when subscribing ' + 'the user to push.'), _defineProperty(_ERROR_MAP, CODES.TOKEN_SUBSCRIBE_NO_PUSH_SET, 'FCM returned an invalid response ' + 'when getting an FCM token.'), _defineProperty(_ERROR_MAP, CODES.USE_SW_BEFORE_GET_TOKEN, 'You must call useServiceWorker() before ' + 'calling getToken() to ensure your service worker is used.'), _defineProperty(_ERROR_MAP, CODES.INVALID_DELETE_TOKEN, 'You must pass a valid token into ' + 'deleteToken(), i.e. the token from getToken().'), _defineProperty(_ERROR_MAP, CODES.DELETE_TOKEN_NOT_FOUND, 'The deletion attempt for token could not ' + 'be performed as the token was not found.'), _defineProperty(_ERROR_MAP, CODES.DELETE_SCOPE_NOT_FOUND, 'The deletion attempt for service worker ' + 'scope could not be performed as the scope was not found.'), _defineProperty(_ERROR_MAP, CODES.BG_HANDLER_FUNCTION_EXPECTED, 'The input to ' + 'setBackgroundMessageHandler() must be a function.'), _defineProperty(_ERROR_MAP, CODES.NO_WINDOW_CLIENT_TO_MSG, 'An attempt was made to message a ' + 'non-existant window client.'), _defineProperty(_ERROR_MAP, CODES.UNABLE_TO_RESUBSCRIBE, 'There was an error while re-subscribing ' + 'the FCM token for push messaging. Will have to resubscribe the ' + 'user on next visit. {$message}'), _defineProperty(_ERROR_MAP, CODES.NO_FCM_TOKEN_FOR_RESUBSCRIBE, 'Could not find an FCM token ' + 'and as a result, unable to resubscribe. Will have to resubscribe the ' + 'user on next visit.'), _defineProperty(_ERROR_MAP, CODES.FAILED_TO_DELETE_TOKEN, 'Unable to delete the currently saved token.'), _defineProperty(_ERROR_MAP, CODES.NO_SW_IN_REG, 'Even though the service worker registration was ' + 'successful, there was a problem accessing the service worker itself.'), _defineProperty(_ERROR_MAP, CODES.INCORRECT_GCM_SENDER_ID, 'Please change your web app manifest\'s ' + '\'gcm_sender_id\' value to \'103953800507\' to use Firebase messaging.'), _defineProperty(_ERROR_MAP, CODES.BAD_SCOPE, 'The service worker scope must be a string with at ' + 'least one character.'), _defineProperty(_ERROR_MAP, CODES.BAD_VAPID_KEY, 'The public VAPID key must be a string with at ' + 'least one character.'), _defineProperty(_ERROR_MAP, CODES.BAD_SUBSCRIPTION, 'The subscription must be a valid ' + 'PushSubscription.'), _defineProperty(_ERROR_MAP, CODES.BAD_TOKEN, 'The FCM Token used for storage / lookup was not ' + 'a valid token string.'), _defineProperty(_ERROR_MAP, CODES.BAD_PUSH_SET, 'The FCM push set used for storage / lookup was not ' + 'not a valid push set string.'), _defineProperty(_ERROR_MAP, CODES.FAILED_DELETE_VAPID_KEY, 'The VAPID key could not be deleted.'), _ERROR_MAP);
exports.default = {
    codes: CODES,
    map: ERROR_MAP
};
module.exports = exports['default'];
//# sourceMappingURL=errors.js.map


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setDomainBase = setDomainBase;
/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
 * @fileoverview Constants used in the Firebase Storage library.
 */
/**
 * Domain and scheme for API calls.
 */
/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var domainBase = exports.domainBase = 'https://firebasestorage.googleapis.com';
/**
 * Domain and scheme for object downloads.
 */
var downloadBase = exports.downloadBase = 'https://firebasestorage.googleapis.com';
/**
 * Base URL for non-upload calls to the API.
 */
var apiBaseUrl = exports.apiBaseUrl = '/v0';
/**
 * Base URL for upload calls to the API.
 */
var apiUploadBaseUrl = exports.apiUploadBaseUrl = '/v0';
function setDomainBase(domainBase) {
  domainBase = domainBase;
}
var configOption = exports.configOption = 'storageBucket';
/**
 * 1 minute
 */
var shortMaxOperationRetryTime = exports.shortMaxOperationRetryTime = 1 * 60 * 1000;
/**
 * 2 minutes
 */
var defaultMaxOperationRetryTime = exports.defaultMaxOperationRetryTime = 2 * 60 * 1000;
/**
 * 10 minutes
 */
var defaultMaxUploadRetryTime = exports.defaultMaxUploadRetryTime = 10 * 60 * 100;
/**
 * This is the value of Number.MIN_SAFE_INTEGER, which is not well supported
 * enough for us to use it directly.
 */
var minSafeInteger = exports.minSafeInteger = -9007199254740991;
//# sourceMappingURL=constants.js.map


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Location = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Copyright 2017 Google Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * you may not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * You may obtain a copy of the License at
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *   http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * See the License for the specific language governing permissions and
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */
/**
 * @fileoverview Functionality related to the parsing/composition of bucket/
 * object location.
 */


var _error = __webpack_require__(3);

var errorsExports = _interopRequireWildcard(_error);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @struct
 */
var Location = exports.Location = function () {
    function Location(bucket, path) {
        _classCallCheck(this, Location);

        this.bucket = bucket;
        this.path_ = path;
    }

    _createClass(Location, [{
        key: 'fullServerUrl',
        value: function fullServerUrl() {
            var encode = encodeURIComponent;
            return '/b/' + encode(this.bucket) + '/o/' + encode(this.path);
        }
    }, {
        key: 'bucketOnlyServerUrl',
        value: function bucketOnlyServerUrl() {
            var encode = encodeURIComponent;
            return '/b/' + encode(this.bucket) + '/o';
        }
    }, {
        key: 'path',
        get: function get() {
            return this.path_;
        }
    }], [{
        key: 'makeFromBucketSpec',
        value: function makeFromBucketSpec(bucketString) {
            var bucketLocation = void 0;
            try {
                bucketLocation = Location.makeFromUrl(bucketString);
            } catch (e) {
                // Not valid URL, use as-is. This lets you put bare bucket names in
                // config.
                return new Location(bucketString, '');
            }
            if (bucketLocation.path === '') {
                return bucketLocation;
            } else {
                throw errorsExports.invalidDefaultBucket(bucketString);
            }
        }
    }, {
        key: 'makeFromUrl',
        value: function makeFromUrl(url) {
            var location = null;
            var bucketDomain = '([A-Za-z0-9.\\-]+)';

            var gsRegex = new RegExp('^gs://' + bucketDomain + '(/(.*))?$', 'i');

            var httpRegex = new RegExp('^https?://firebasestorage\\.googleapis\\.com/' + 'v[A-Za-z0-9_]+' + '/b/' + bucketDomain + '/o' + '(/([^?#]*).*)?$', 'i');

            var groups = [{ regex: gsRegex, indices: { bucket: 1, path: 3 }, postModify: function (loc) {
                    if (loc.path.charAt(loc.path.length - 1) === '/') {
                        loc.path_ = loc.path_.slice(0, -1);
                    }
                } }, { regex: httpRegex, indices: { bucket: 1, path: 3 }, postModify: function (loc) {
                    loc.path_ = decodeURIComponent(loc.path);
                } }];
            for (var i = 0; i < groups.length; i++) {
                var group = groups[i];
                var captures = group.regex.exec(url);
                if (captures) {
                    var bucketValue = captures[group.indices.bucket];
                    var pathValue = captures[group.indices.path];
                    if (!pathValue) {
                        pathValue = '';
                    }
                    location = new Location(bucketValue, pathValue);
                    group.postModify(location);
                    break;
                }
            }
            if (location == null) {
                throw errorsExports.invalidUrl(url);
            }
            return location;
        }
    }]);

    return Location;
}();
//# sourceMappingURL=location.js.map


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.xlinkNS = 'http://www.w3.org/1999/xlink';
exports.xmlNS = 'http://www.w3.org/XML/1998/namespace';
exports.svgNS = 'http://www.w3.org/2000/svg';
exports.strictProps = new Set();
exports.strictProps.add('volume');
exports.strictProps.add('defaultChecked');
exports.booleanProps = new Set();
exports.booleanProps.add('muted');
exports.booleanProps.add('scoped');
exports.booleanProps.add('loop');
exports.booleanProps.add('open');
exports.booleanProps.add('checked');
exports.booleanProps.add('default');
exports.booleanProps.add('capture');
exports.booleanProps.add('disabled');
exports.booleanProps.add('readOnly');
exports.booleanProps.add('required');
exports.booleanProps.add('autoplay');
exports.booleanProps.add('controls');
exports.booleanProps.add('seamless');
exports.booleanProps.add('reversed');
exports.booleanProps.add('allowfullscreen');
exports.booleanProps.add('novalidate');
exports.booleanProps.add('hidden');
exports.booleanProps.add('autoFocus');
exports.booleanProps.add('selected');
exports.namespaces = new Map();
exports.namespaces.set('xlink:href', exports.xlinkNS);
exports.namespaces.set('xlink:arcrole', exports.xlinkNS);
exports.namespaces.set('xlink:actuate', exports.xlinkNS);
exports.namespaces.set('xlink:show', exports.xlinkNS);
exports.namespaces.set('xlink:role', exports.xlinkNS);
exports.namespaces.set('xlink:title', exports.xlinkNS);
exports.namespaces.set('xlink:type', exports.xlinkNS);
exports.namespaces.set('xml:base', exports.xmlNS);
exports.namespaces.set('xml:lang', exports.xmlNS);
exports.namespaces.set('xml:space', exports.xmlNS);
exports.isUnitlessNumber = new Set();
exports.isUnitlessNumber.add('animationIterationCount');
exports.isUnitlessNumber.add('borderImageOutset');
exports.isUnitlessNumber.add('borderImageSlice');
exports.isUnitlessNumber.add('borderImageWidth');
exports.isUnitlessNumber.add('boxFlex');
exports.isUnitlessNumber.add('boxFlexGroup');
exports.isUnitlessNumber.add('boxOrdinalGroup');
exports.isUnitlessNumber.add('columnCount');
exports.isUnitlessNumber.add('flex');
exports.isUnitlessNumber.add('flexGrow');
exports.isUnitlessNumber.add('flexPositive');
exports.isUnitlessNumber.add('flexShrink');
exports.isUnitlessNumber.add('flexNegative');
exports.isUnitlessNumber.add('flexOrder');
exports.isUnitlessNumber.add('gridRow');
exports.isUnitlessNumber.add('gridColumn');
exports.isUnitlessNumber.add('fontWeight');
exports.isUnitlessNumber.add('lineClamp');
exports.isUnitlessNumber.add('lineHeight');
exports.isUnitlessNumber.add('opacity');
exports.isUnitlessNumber.add('order');
exports.isUnitlessNumber.add('orphans');
exports.isUnitlessNumber.add('tabSize');
exports.isUnitlessNumber.add('widows');
exports.isUnitlessNumber.add('zIndex');
exports.isUnitlessNumber.add('zoom');
exports.isUnitlessNumber.add('fillOpacity');
exports.isUnitlessNumber.add('floodOpacity');
exports.isUnitlessNumber.add('stopOpacity');
exports.isUnitlessNumber.add('strokeDasharray');
exports.isUnitlessNumber.add('strokeDashoffset');
exports.isUnitlessNumber.add('strokeMiterlimit');
exports.isUnitlessNumber.add('strokeOpacity');
exports.isUnitlessNumber.add('strokeWidth');
exports.skipProps = new Set();
exports.skipProps.add('children');
exports.skipProps.add('childrenType');
exports.skipProps.add('defaultValue');
exports.skipProps.add('ref');
exports.skipProps.add('key');
exports.skipProps.add('checked');
exports.skipProps.add('multiple');
exports.delegatedEvents = new Set();
exports.delegatedEvents.add('onClick');
exports.delegatedEvents.add('onMouseDown');
exports.delegatedEvents.add('onMouseUp');
exports.delegatedEvents.add('onMouseMove');
exports.delegatedEvents.add('onSubmit');
exports.delegatedEvents.add('onDblClick');
exports.delegatedEvents.add('onKeyDown');
exports.delegatedEvents.add('onKeyUp');
exports.delegatedEvents.add('onKeyPress');


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var inferno_shared_1 = __webpack_require__(0);
var options_1 = __webpack_require__(4);
var VNodes_1 = __webpack_require__(6);
var patching_1 = __webpack_require__(8);
var recycling_1 = __webpack_require__(40);
var rendering_1 = __webpack_require__(10);
var utils_1 = __webpack_require__(2);
var processElement_1 = __webpack_require__(25);
function mount(vNode, parentDom, lifecycle, context, isSVG) {
    var flags = vNode.flags;
    if (flags & 3970 /* Element */) {
        return mountElement(vNode, parentDom, lifecycle, context, isSVG);
    }
    else if (flags & 28 /* Component */) {
        return mountComponent(vNode, parentDom, lifecycle, context, isSVG, (flags & 4 /* ComponentClass */) > 0);
    }
    else if (flags & 4096 /* Void */) {
        return mountVoid(vNode, parentDom);
    }
    else if (flags & 1 /* Text */) {
        return mountText(vNode, parentDom);
    }
    else {
        if (process.env.NODE_ENV !== 'production') {
            if (typeof vNode === 'object') {
                inferno_shared_1.throwError("mount() received an object that's not a valid VNode, you should stringify it first. Object: \"" + JSON.stringify(vNode) + "\".");
            }
            else {
                inferno_shared_1.throwError("mount() expects a valid VNode, instead it received an object with the type \"" + typeof vNode + "\".");
            }
        }
        inferno_shared_1.throwError();
    }
}
exports.mount = mount;
function mountText(vNode, parentDom) {
    var dom = document.createTextNode(vNode.children);
    vNode.dom = dom;
    if (!inferno_shared_1.isNull(parentDom)) {
        utils_1.appendChild(parentDom, dom);
    }
    return dom;
}
exports.mountText = mountText;
function mountVoid(vNode, parentDom) {
    var dom = document.createTextNode('');
    vNode.dom = dom;
    if (!inferno_shared_1.isNull(parentDom)) {
        utils_1.appendChild(parentDom, dom);
    }
    return dom;
}
exports.mountVoid = mountVoid;
function mountElement(vNode, parentDom, lifecycle, context, isSVG) {
    if (options_1.options.recyclingEnabled) {
        var dom_1 = recycling_1.recycleElement(vNode, lifecycle, context, isSVG);
        if (!inferno_shared_1.isNull(dom_1)) {
            if (!inferno_shared_1.isNull(parentDom)) {
                utils_1.appendChild(parentDom, dom_1);
            }
            return dom_1;
        }
    }
    var flags = vNode.flags;
    isSVG = isSVG || (flags & 128 /* SvgElement */) > 0;
    var dom = utils_1.documentCreateElement(vNode.type, isSVG);
    var children = vNode.children;
    var props = vNode.props;
    var className = vNode.className;
    var ref = vNode.ref;
    vNode.dom = dom;
    if (!inferno_shared_1.isInvalid(children)) {
        if (inferno_shared_1.isStringOrNumber(children)) {
            utils_1.setTextContent(dom, children);
        }
        else {
            var childrenIsSVG = isSVG === true && vNode.type !== 'foreignObject';
            if (inferno_shared_1.isArray(children)) {
                mountArrayChildren(children, dom, lifecycle, context, childrenIsSVG);
            }
            else if (VNodes_1.isVNode(children)) {
                mount(children, dom, lifecycle, context, childrenIsSVG);
            }
        }
    }
    if (!inferno_shared_1.isNull(props)) {
        var hasControlledValue = false;
        var isFormElement = (flags & 3584 /* FormElement */) > 0;
        if (isFormElement) {
            hasControlledValue = processElement_1.isControlledFormElement(props);
        }
        for (var prop in props) {
            // do not add a hasOwnProperty check here, it affects performance
            patching_1.patchProp(prop, null, props[prop], dom, isSVG, hasControlledValue);
        }
        if (isFormElement) {
            processElement_1.processElement(flags, vNode, dom, props, true, hasControlledValue);
        }
    }
    if (className !== null) {
        if (isSVG) {
            dom.setAttribute('class', className);
        }
        else {
            dom.className = className;
        }
    }
    if (!inferno_shared_1.isNull(ref)) {
        mountRef(dom, ref, lifecycle);
    }
    if (!inferno_shared_1.isNull(parentDom)) {
        utils_1.appendChild(parentDom, dom);
    }
    return dom;
}
exports.mountElement = mountElement;
function mountArrayChildren(children, dom, lifecycle, context, isSVG) {
    for (var i = 0, len = children.length; i < len; i++) {
        var child = children[i];
        // Verify can string/number be here. might cause de-opt. - Normalization takes care of it.
        if (!inferno_shared_1.isInvalid(child)) {
            if (child.dom) {
                children[i] = child = VNodes_1.directClone(child);
            }
            mount(children[i], dom, lifecycle, context, isSVG);
        }
    }
}
exports.mountArrayChildren = mountArrayChildren;
function mountComponent(vNode, parentDom, lifecycle, context, isSVG, isClass) {
    if (options_1.options.recyclingEnabled) {
        var dom_2 = recycling_1.recycleComponent(vNode, lifecycle, context, isSVG);
        if (!inferno_shared_1.isNull(dom_2)) {
            if (!inferno_shared_1.isNull(parentDom)) {
                utils_1.appendChild(parentDom, dom_2);
            }
            return dom_2;
        }
    }
    var type = vNode.type;
    var props = vNode.props || utils_1.EMPTY_OBJ;
    var ref = vNode.ref;
    var dom;
    if (isClass) {
        var instance = utils_1.createClassComponentInstance(vNode, type, props, context, isSVG, lifecycle);
        var input = instance._lastInput;
        instance._vNode = vNode;
        vNode.dom = dom = mount(input, null, lifecycle, instance._childContext, isSVG);
        if (!inferno_shared_1.isNull(parentDom)) {
            utils_1.appendChild(parentDom, dom);
        }
        mountClassComponentCallbacks(vNode, ref, instance, lifecycle);
        instance._updating = false;
        if (options_1.options.findDOMNodeEnabled) {
            rendering_1.componentToDOMNodeMap.set(instance, dom);
        }
    }
    else {
        var input = utils_1.createFunctionalComponentInput(vNode, type, props, context);
        vNode.dom = dom = mount(input, null, lifecycle, context, isSVG);
        vNode.children = input;
        mountFunctionalComponentCallbacks(ref, dom, lifecycle);
        if (!inferno_shared_1.isNull(parentDom)) {
            utils_1.appendChild(parentDom, dom);
        }
    }
    return dom;
}
exports.mountComponent = mountComponent;
function mountClassComponentCallbacks(vNode, ref, instance, lifecycle) {
    if (ref) {
        if (inferno_shared_1.isFunction(ref)) {
            ref(instance);
        }
        else {
            if (process.env.NODE_ENV !== 'production') {
                if (inferno_shared_1.isStringOrNumber(ref)) {
                    inferno_shared_1.throwError('string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.');
                }
                else if (inferno_shared_1.isObject(ref) && (vNode.flags & 4 /* ComponentClass */)) {
                    inferno_shared_1.throwError('functional component lifecycle events are not supported on ES2015 class components.');
                }
                else {
                    inferno_shared_1.throwError("a bad value for \"ref\" was used on component: \"" + JSON.stringify(ref) + "\"");
                }
            }
            inferno_shared_1.throwError();
        }
    }
    var hasDidMount = !inferno_shared_1.isUndefined(instance.componentDidMount);
    var afterMount = options_1.options.afterMount;
    if (hasDidMount || !inferno_shared_1.isNull(afterMount)) {
        lifecycle.addListener(function () {
            instance._updating = true;
            if (afterMount) {
                afterMount(vNode);
            }
            if (hasDidMount) {
                instance.componentDidMount();
            }
            instance._updating = false;
        });
    }
}
exports.mountClassComponentCallbacks = mountClassComponentCallbacks;
function mountFunctionalComponentCallbacks(ref, dom, lifecycle) {
    if (ref) {
        if (!inferno_shared_1.isNullOrUndef(ref.onComponentWillMount)) {
            ref.onComponentWillMount();
        }
        if (!inferno_shared_1.isNullOrUndef(ref.onComponentDidMount)) {
            lifecycle.addListener(function () { return ref.onComponentDidMount(dom); });
        }
    }
}
exports.mountFunctionalComponentCallbacks = mountFunctionalComponentCallbacks;
function mountRef(dom, value, lifecycle) {
    if (inferno_shared_1.isFunction(value)) {
        lifecycle.addListener(function () { return value(dom); });
    }
    else {
        if (inferno_shared_1.isInvalid(value)) {
            return;
        }
        if (process.env.NODE_ENV !== 'production') {
            inferno_shared_1.throwError('string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.');
        }
        inferno_shared_1.throwError();
    }
}
exports.mountRef = mountRef;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(78).default;
module.exports.default = module.exports;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.patchCapture = patchCapture;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ERROR_NAME = 'FirebaseError';
var captureStackTrace = Error.captureStackTrace;
// Export for faking in tests
function patchCapture(captureFake) {
    var result = captureStackTrace;
    captureStackTrace = captureFake;
    return result;
}

var FirebaseError = exports.FirebaseError = function FirebaseError(code, message) {
    _classCallCheck(this, FirebaseError);

    this.code = code;
    this.message = message;

    // We want the stack value, if implemented by Error
    if (captureStackTrace) {
        // Patches this.stack, omitted calls above ErrorFactory#create
        captureStackTrace(this, ErrorFactory.prototype.create);
    } else {
        var err = Error.apply(this, arguments);
        this.name = ERROR_NAME;
        // Make non-enumerable getter for the property.
        Object.defineProperty(this, 'stack', {
            get: function get() {
                return err.stack;
            }
        });
    }
};
// Back-door inheritance


FirebaseError.prototype = Object.create(Error.prototype);
FirebaseError.prototype.constructor = FirebaseError;
FirebaseError.prototype.name = ERROR_NAME;

var ErrorFactory = exports.ErrorFactory = function () {
    function ErrorFactory(service, serviceName, errors) {
        _classCallCheck(this, ErrorFactory);

        this.service = service;
        this.serviceName = serviceName;
        this.errors = errors;
        // Matches {$name}, by default.
        this.pattern = /\{\$([^}]+)}/g;
        // empty
    }

    _createClass(ErrorFactory, [{
        key: 'create',
        value: function create(code, data) {
            if (data === undefined) {
                data = {};
            }
            var template = this.errors[code];
            var fullCode = this.service + '/' + code;
            var message = void 0;
            if (template === undefined) {
                message = "Error";
            } else {
                message = template.replace(this.pattern, function (match, key) {
                    var value = data[key];
                    return value !== undefined ? value.toString() : '<' + key + '?>';
                });
            }
            // Service: Error message (service/code).
            message = this.serviceName + ': ' + message + ' (' + fullCode + ').';
            var err = new FirebaseError(fullCode, message);
            // Populate the Error object with message parts for programmatic
            // accesses (e.g., e.file).
            for (var prop in data) {
                if (!data.hasOwnProperty(prop) || prop.slice(-1) === '_') {
                    continue;
                }
                err[prop] = data[prop];
            }
            return err;
        }
    }]);

    return ErrorFactory;
}();
//# sourceMappingURL=errors.js.map


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var scope = void 0;
if (typeof global !== 'undefined') {
    scope = global;
} else if (typeof self !== 'undefined') {
    scope = self;
} else {
    try {
        scope = Function('return this')();
    } catch (e) {
        throw new Error('polyfill failed because global object is unavailable in this environment');
    }
}
var PromiseImpl = scope.Promise || __webpack_require__(59);
var local = exports.local = {
    Promise: PromiseImpl,
    GoogPromise: PromiseImpl
};
//# sourceMappingURL=shared_promise.js.map

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(27)))

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ArgSpec = undefined;
exports.validate = validate;
exports.and_ = and_;
exports.stringSpec = stringSpec;
exports.uploadDataSpec = uploadDataSpec;
exports.metadataSpec = metadataSpec;
exports.nonNegativeNumberSpec = nonNegativeNumberSpec;
exports.looseObjectSpec = looseObjectSpec;
exports.nullFunctionSpec = nullFunctionSpec;

var _error = __webpack_require__(3);

var errorsExports = _interopRequireWildcard(_error);

var _metadata = __webpack_require__(21);

var MetadataUtils = _interopRequireWildcard(_metadata);

var _type = __webpack_require__(1);

var type = _interopRequireWildcard(_type);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                          * Copyright 2017 Google Inc.
                                                                                                                                                          *
                                                                                                                                                          * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                          * you may not use this file except in compliance with the License.
                                                                                                                                                          * You may obtain a copy of the License at
                                                                                                                                                          *
                                                                                                                                                          *   http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                          *
                                                                                                                                                          * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                          * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                          * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                          * See the License for the specific language governing permissions and
                                                                                                                                                          * limitations under the License.
                                                                                                                                                          */


/**
 * @param name Name of the function.
 * @param specs Argument specs.
 * @param passed The actual arguments passed to the function.
 * @throws {fbs.Error} If the arguments are invalid.
 */
function validate(name, specs, passed) {
    var minArgs = specs.length;
    var maxArgs = specs.length;
    for (var i = 0; i < specs.length; i++) {
        if (specs[i].optional) {
            minArgs = i;
            break;
        }
    }
    var validLength = minArgs <= passed.length && passed.length <= maxArgs;
    if (!validLength) {
        throw errorsExports.invalidArgumentCount(minArgs, maxArgs, name, passed.length);
    }
    for (var _i = 0; _i < passed.length; _i++) {
        try {
            specs[_i].validator(passed[_i]);
        } catch (e) {
            if (e instanceof Error) {
                throw errorsExports.invalidArgument(_i, name, e.message);
            } else {
                throw errorsExports.invalidArgument(_i, name, e);
            }
        }
    }
}
/**
 * @struct
 */

var ArgSpec = exports.ArgSpec = function ArgSpec(validator, opt_optional) {
    _classCallCheck(this, ArgSpec);

    var self = this;
    this.validator = function (p) {
        if (self.optional && !type.isJustDef(p)) {
            return;
        }
        validator(p);
    };
    this.optional = !!opt_optional;
};

function and_(v1, v2) {
    return function (p) {
        v1(p);
        v2(p);
    };
}
function stringSpec(opt_validator, opt_optional) {
    function stringValidator(p) {
        if (!type.isString(p)) {
            throw 'Expected string.';
        }
    }
    var validator = void 0;
    if (opt_validator) {
        validator = and_(stringValidator, opt_validator);
    } else {
        validator = stringValidator;
    }
    return new ArgSpec(validator, opt_optional);
}
function uploadDataSpec() {
    return new ArgSpec(function (p) {
        var valid = p instanceof Uint8Array || p instanceof ArrayBuffer || type.isNativeBlobDefined() && p instanceof Blob;
        if (!valid) {
            throw 'Expected Blob or File.';
        }
    });
}
function metadataSpec(opt_optional) {
    return new ArgSpec(MetadataUtils.metadataValidator, opt_optional);
}
function nonNegativeNumberSpec() {
    return new ArgSpec(function (p) {
        var valid = type.isNumber(p) && p >= 0;
        if (!valid) {
            throw 'Expected a number 0 or greater.';
        }
    });
}
function looseObjectSpec(opt_validator, opt_optional) {
    return new ArgSpec(function (p) {
        var isLooseObject = p === null || type.isDef(p) && p instanceof Object;
        if (!isLooseObject) {
            throw 'Expected an Object.';
        }
        if (opt_validator !== undefined && opt_validator !== null) {
            opt_validator(p);
        }
    }, opt_optional);
}
function nullFunctionSpec(opt_optional) {
    return new ArgSpec(function (p) {
        var valid = p === null || type.isFunction(p);
        if (!valid) {
            throw 'Expected a Function.';
        }
    }, opt_optional);
}
//# sourceMappingURL=args.js.map


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.contains = contains;
exports.clone = clone;
exports.remove = remove;
/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
 * Returns true if the object is contained in the array (compared with ===).
 * @template T
 */
/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function contains(array, elem) {
    return array.indexOf(elem) !== -1;
}
/**
 * Returns a shallow copy of the array or array-like object (e.g. arguments).
 * @template T
 */
function clone(arraylike) {
    return Array.prototype.slice.call(arraylike);
}
/**
 * Removes the given element from the given array, if it is contained.
 * Directly modifies the passed-in array.
 * @template T
 */
function remove(array, elem) {
    var i = array.indexOf(elem);
    if (i !== -1) {
        array.splice(i, 1);
    }
}
//# sourceMappingURL=array.js.map


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Mapping = undefined;
exports.noXform_ = noXform_;
exports.xformPath = xformPath;
exports.getMappings = getMappings;
exports.addRef = addRef;
exports.fromResource = fromResource;
exports.fromResourceString = fromResourceString;
exports.toResourceString = toResourceString;
exports.metadataValidator = metadataValidator;

var _json = __webpack_require__(66);

var json = _interopRequireWildcard(_json);

var _location = __webpack_require__(13);

var _path = __webpack_require__(34);

var path = _interopRequireWildcard(_path);

var _type = __webpack_require__(1);

var type = _interopRequireWildcard(_type);

var _url = __webpack_require__(23);

var UrlUtils = _interopRequireWildcard(_url);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                          * Copyright 2017 Google Inc.
                                                                                                                                                          *
                                                                                                                                                          * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                          * you may not use this file except in compliance with the License.
                                                                                                                                                          * You may obtain a copy of the License at
                                                                                                                                                          *
                                                                                                                                                          *   http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                          *
                                                                                                                                                          * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                          * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                          * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                          * See the License for the specific language governing permissions and
                                                                                                                                                          * limitations under the License.
                                                                                                                                                          */


function noXform_(metadata, value) {
    return value;
}
/**
 * @struct
 */

var Mapping = exports.Mapping = function Mapping(server, opt_local, opt_writable, opt_xform) {
    _classCallCheck(this, Mapping);

    this.server = server;
    this.local = opt_local || server;
    this.writable = !!opt_writable;
    this.xform = opt_xform || noXform_;
};

var mappings_ = null;
function xformPath(fullPath) {
    var valid = type.isString(fullPath);
    if (!valid || fullPath.length < 2) {
        return fullPath;
    } else {
        fullPath = fullPath;
        return path.lastComponent(fullPath);
    }
}
function getMappings() {
    if (mappings_) {
        return mappings_;
    }
    var mappings = [];
    mappings.push(new Mapping('bucket'));
    mappings.push(new Mapping('generation'));
    mappings.push(new Mapping('metageneration'));
    mappings.push(new Mapping('name', 'fullPath', true));

    var nameMapping = new Mapping('name');
    nameMapping.xform = function (metadata, fullPath) {
        return xformPath(fullPath);
    };
    mappings.push(nameMapping);
    /**
     * Coerces the second param to a number, if it is defined.
     */

    var sizeMapping = new Mapping('size');
    sizeMapping.xform = function (metadata, size) {
        if (type.isDef(size)) {
            return +size;
        } else {
            return size;
        }
    };
    mappings.push(sizeMapping);
    mappings.push(new Mapping('timeCreated'));
    mappings.push(new Mapping('updated'));
    mappings.push(new Mapping('md5Hash', null, true));
    mappings.push(new Mapping('cacheControl', null, true));
    mappings.push(new Mapping('contentDisposition', null, true));
    mappings.push(new Mapping('contentEncoding', null, true));
    mappings.push(new Mapping('contentLanguage', null, true));
    mappings.push(new Mapping('contentType', null, true));
    mappings.push(new Mapping('metadata', 'customMetadata', true));
    /**
     * Transforms a comma-separated string of tokens into a list of download
     * URLs.
     */

    mappings.push(new Mapping('downloadTokens', 'downloadURLs', false, function (metadata, tokens) {
        var valid = type.isString(tokens) && tokens.length > 0;
        if (!valid) {
            // This can happen if objects are uploaded through GCS and retrieved
            // through list, so we don't want to throw an Error.
            return [];
        }
        var encode = encodeURIComponent;
        var tokensList = tokens.split(',');
        var urls = tokensList.map(function (token) {
            var bucket = metadata['bucket'];
            var path = metadata['fullPath'];
            var urlPart = '/b/' + encode(bucket) + '/o/' + encode(path);
            var base = UrlUtils.makeDownloadUrl(urlPart);
            var queryString = UrlUtils.makeQueryString({ 'alt': 'media', 'token': token });
            return base + queryString;
        });
        return urls;
    }));
    mappings_ = mappings;
    return mappings_;
}
function addRef(metadata, authWrapper) {
    Object.defineProperty(metadata, 'ref', { get: function () {
            var bucket = metadata['bucket'];
            var path = metadata['fullPath'];
            var loc = new _location.Location(bucket, path);
            return authWrapper.makeStorageReference(loc);
        } });
}
function fromResource(authWrapper, resource, mappings) {
    var metadata = {};
    metadata['type'] = 'file';
    var len = mappings.length;
    for (var i = 0; i < len; i++) {
        var mapping = mappings[i];
        metadata[mapping.local] = mapping.xform(metadata, resource[mapping.server]);
    }
    addRef(metadata, authWrapper);
    return metadata;
}
function fromResourceString(authWrapper, resourceString, mappings) {
    var obj = json.jsonObjectOrNull(resourceString);
    if (obj === null) {
        return null;
    }

    return fromResource(authWrapper, obj, mappings);
}
function toResourceString(metadata, mappings) {
    var resource = {};
    var len = mappings.length;
    for (var i = 0; i < len; i++) {
        var mapping = mappings[i];
        if (mapping.writable) {
            resource[mapping.server] = metadata[mapping.local];
        }
    }
    return JSON.stringify(resource);
}
function metadataValidator(p) {
    var validType = p && type.isObject(p);
    if (!validType) {
        throw 'Expected Metadata object.';
    }
    for (var key in p) {
        var val = p[key];
        if (key === 'customMetadata') {
            if (!type.isObject(val)) {
                throw 'Expected object for \'customMetadata\' mapping.';
            }
        } else {
            if (type.isNonNullObject(val)) {
                throw 'Mapping for \'' + key + '\' cannot be an object.';
            }
        }
    }
}
//# sourceMappingURL=metadata.js.map


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.StringData = exports.StringFormat = undefined;
exports.formatValidator = formatValidator;
exports.dataFromString = dataFromString;
exports.utf8Bytes_ = utf8Bytes_;
exports.percentEncodedBytes_ = percentEncodedBytes_;
exports.base64Bytes_ = base64Bytes_;
exports.dataURLBytes_ = dataURLBytes_;
exports.dataURLContentType_ = dataURLContentType_;

var _error = __webpack_require__(3);

var errorsExports = _interopRequireWildcard(_error);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                          * Copyright 2017 Google Inc.
                                                                                                                                                          *
                                                                                                                                                          * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                          * you may not use this file except in compliance with the License.
                                                                                                                                                          * You may obtain a copy of the License at
                                                                                                                                                          *
                                                                                                                                                          *   http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                          *
                                                                                                                                                          * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                          * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                          * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                          * See the License for the specific language governing permissions and
                                                                                                                                                          * limitations under the License.
                                                                                                                                                          */


var StringFormat = exports.StringFormat = {
    RAW: 'raw',
    BASE64: 'base64',
    BASE64URL: 'base64url',
    DATA_URL: 'data_url'
};
function formatValidator(stringFormat) {
    switch (stringFormat) {
        case StringFormat.RAW:
        case StringFormat.BASE64:
        case StringFormat.BASE64URL:
        case StringFormat.DATA_URL:
            return;
        default:
            throw 'Expected one of the event types: [' + StringFormat.RAW + ', ' + StringFormat.BASE64 + ', ' + StringFormat.BASE64URL + ', ' + StringFormat.DATA_URL + '].';
    }
}
/**
 * @struct
 */

var StringData = exports.StringData = function StringData(data, opt_contentType) {
    _classCallCheck(this, StringData);

    this.data = data;
    this.contentType = opt_contentType || null;
};

function dataFromString(format, string) {
    switch (format) {
        case StringFormat.RAW:
            return new StringData(utf8Bytes_(string));
        case StringFormat.BASE64:
        case StringFormat.BASE64URL:
            return new StringData(base64Bytes_(format, string));
        case StringFormat.DATA_URL:
            return new StringData(dataURLBytes_(string), dataURLContentType_(string));
    }
    // assert(false);
    throw errorsExports.unknown();
}
function utf8Bytes_(string) {
    var b = [];
    for (var i = 0; i < string.length; i++) {
        var c = string.charCodeAt(i);
        if (c <= 127) {
            b.push(c);
        } else {
            if (c <= 2047) {
                b.push(192 | c >> 6, 128 | c & 63);
            } else {
                if ((c & 64512) == 55296) {
                    // The start of a surrogate pair.
                    var valid = i < string.length - 1 && (string.charCodeAt(i + 1) & 64512) == 56320;
                    if (!valid) {
                        // The second surrogate wasn't there.
                        b.push(239, 191, 189);
                    } else {
                        var hi = c;
                        var lo = string.charCodeAt(++i);
                        c = 65536 | (hi & 1023) << 10 | lo & 1023;
                        b.push(240 | c >> 18, 128 | c >> 12 & 63, 128 | c >> 6 & 63, 128 | c & 63);
                    }
                } else {
                    if ((c & 64512) == 56320) {
                        // Invalid low surrogate.
                        b.push(239, 191, 189);
                    } else {
                        b.push(224 | c >> 12, 128 | c >> 6 & 63, 128 | c & 63);
                    }
                }
            }
        }
    }
    return new Uint8Array(b);
}
function percentEncodedBytes_(string) {
    var decoded = void 0;
    try {
        decoded = decodeURIComponent(string);
    } catch (e) {
        throw errorsExports.invalidFormat(StringFormat.DATA_URL, 'Malformed data URL.');
    }
    return utf8Bytes_(decoded);
}
function base64Bytes_(format, string) {
    switch (format) {
        case StringFormat.BASE64:
            {
                var hasMinus = string.indexOf('-') !== -1;
                var hasUnder = string.indexOf('_') !== -1;
                if (hasMinus || hasUnder) {
                    var invalidChar = hasMinus ? '-' : '_';
                    throw errorsExports.invalidFormat(format, 'Invalid character \'' + invalidChar + '\' found: is it base64url encoded?');
                }
                break;
            }
        case StringFormat.BASE64URL:
            {
                var hasPlus = string.indexOf('+') !== -1;
                var hasSlash = string.indexOf('/') !== -1;
                if (hasPlus || hasSlash) {
                    var _invalidChar = hasPlus ? '+' : '/';
                    throw errorsExports.invalidFormat(format, 'Invalid character \'' + _invalidChar + '\' found: is it base64 encoded?');
                }
                string = string.replace(/-/g, '+').replace(/_/g, '/');
                break;
            }
    }
    var bytes = void 0;
    try {
        bytes = atob(string);
    } catch (e) {
        throw errorsExports.invalidFormat(format, 'Invalid character found');
    }
    var array = new Uint8Array(bytes.length);
    for (var i = 0; i < bytes.length; i++) {
        array[i] = bytes.charCodeAt(i);
    }
    return array;
}
/**
 * @struct
 */

var DataURLParts = function DataURLParts(dataURL) {
    _classCallCheck(this, DataURLParts);

    this.base64 = false;
    this.contentType = null;
    var matches = dataURL.match(/^data:([^,]+)?,/);
    if (matches === null) {
        throw errorsExports.invalidFormat(StringFormat.DATA_URL, 'Must be formatted \'data:[<mediatype>][;base64],<data>');
    }
    var middle = matches[1] || null;
    if (middle != null) {
        this.base64 = endsWith(middle, ';base64');
        this.contentType = this.base64 ? middle.substring(0, middle.length - ';base64'.length) : middle;
    }
    this.rest = dataURL.substring(dataURL.indexOf(',') + 1);
};

function dataURLBytes_(string) {
    var parts = new DataURLParts(string);
    if (parts.base64) {
        return base64Bytes_(StringFormat.BASE64, parts.rest);
    } else {
        return percentEncodedBytes_(parts.rest);
    }
}
function dataURLContentType_(string) {
    var parts = new DataURLParts(string);
    return parts.contentType;
}
function endsWith(s, end) {
    var longEnough = s.length >= end.length;
    if (!longEnough) {
        return false;
    }
    return s.substring(s.length - end.length) === end;
}
//# sourceMappingURL=string.js.map


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.makeNormalUrl = makeNormalUrl;
exports.makeDownloadUrl = makeDownloadUrl;
exports.makeUploadUrl = makeUploadUrl;
exports.makeQueryString = makeQueryString;

var _constants = __webpack_require__(12);

var constants = _interopRequireWildcard(_constants);

var _object = __webpack_require__(7);

var object = _interopRequireWildcard(_object);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
 * @fileoverview Functions to create and manipulate URLs for the server API.
 */
function makeNormalUrl(urlPart) {
    return constants.domainBase + constants.apiBaseUrl + urlPart;
}
function makeDownloadUrl(urlPart) {
    return constants.downloadBase + constants.apiBaseUrl + urlPart;
}
function makeUploadUrl(urlPart) {
    return constants.domainBase + constants.apiUploadBaseUrl + urlPart;
}
function makeQueryString(params) {
    var encode = encodeURIComponent;
    var queryPart = '?';
    object.forEach(params, function (key, val) {
        var nextPart = encode(key) + '=' + encode(val);
        queryPart = queryPart + nextPart + '&';
    });
    // Chop off the extra '&' or '?' on the end
    queryPart = queryPart.slice(0, -1);
    return queryPart;
}
//# sourceMappingURL=url.js.map


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var inferno_shared_1 = __webpack_require__(0);
var options_1 = __webpack_require__(4);
var patching_1 = __webpack_require__(8);
var recycling_1 = __webpack_require__(40);
var rendering_1 = __webpack_require__(10);
var utils_1 = __webpack_require__(2);
function unmount(vNode, parentDom, lifecycle, canRecycle, isRecycling) {
    var flags = vNode.flags;
    if (flags & 28 /* Component */) {
        unmountComponent(vNode, parentDom, lifecycle, canRecycle, isRecycling);
    }
    else if (flags & 3970 /* Element */) {
        unmountElement(vNode, parentDom, lifecycle, canRecycle, isRecycling);
    }
    else if (flags & (1 /* Text */ | 4096 /* Void */)) {
        unmountVoidOrText(vNode, parentDom);
    }
}
exports.unmount = unmount;
function unmountVoidOrText(vNode, parentDom) {
    if (!inferno_shared_1.isNull(parentDom)) {
        utils_1.removeChild(parentDom, vNode.dom);
    }
}
function unmountComponent(vNode, parentDom, lifecycle, canRecycle, isRecycling) {
    var instance = vNode.children;
    var flags = vNode.flags;
    var isStatefulComponent = flags & 4 /* ComponentClass */;
    var ref = vNode.ref;
    var dom = vNode.dom;
    if (!isRecycling) {
        if (isStatefulComponent) {
            if (!instance._unmounted) {
                if (!inferno_shared_1.isNull(options_1.options.beforeUnmount)) {
                    options_1.options.beforeUnmount(vNode);
                }
                if (!inferno_shared_1.isUndefined(instance.componentWillUnmount)) {
                    instance.componentWillUnmount();
                }
                if (ref && !isRecycling) {
                    ref(null);
                }
                instance._unmounted = true;
                if (options_1.options.findDOMNodeEnabled) {
                    rendering_1.componentToDOMNodeMap.delete(instance);
                }
                unmount(instance._lastInput, null, instance._lifecycle, false, isRecycling);
            }
        }
        else {
            if (!inferno_shared_1.isNullOrUndef(ref)) {
                if (!inferno_shared_1.isNullOrUndef(ref.onComponentWillUnmount)) {
                    ref.onComponentWillUnmount(dom);
                }
            }
            unmount(instance, null, lifecycle, false, isRecycling);
        }
    }
    if (parentDom) {
        var lastInput = instance._lastInput;
        if (inferno_shared_1.isNullOrUndef(lastInput)) {
            lastInput = instance;
        }
        utils_1.removeChild(parentDom, dom);
    }
    if (options_1.options.recyclingEnabled && !isStatefulComponent && (parentDom || canRecycle)) {
        recycling_1.poolComponent(vNode);
    }
}
exports.unmountComponent = unmountComponent;
function unmountElement(vNode, parentDom, lifecycle, canRecycle, isRecycling) {
    var dom = vNode.dom;
    var ref = vNode.ref;
    var props = vNode.props;
    if (ref && !isRecycling) {
        unmountRef(ref);
    }
    var children = vNode.children;
    if (!inferno_shared_1.isNullOrUndef(children)) {
        unmountChildren(children, lifecycle, isRecycling);
    }
    if (!inferno_shared_1.isNull(props)) {
        for (var name_1 in props) {
            // do not add a hasOwnProperty check here, it affects performance
            if (props[name_1] !== null && patching_1.isAttrAnEvent(name_1)) {
                patching_1.patchEvent(name_1, props[name_1], null, dom);
                // We need to set this null, because same props otherwise come back if SCU returns false and we are recyling
                props[name_1] = null;
            }
        }
    }
    if (!inferno_shared_1.isNull(parentDom)) {
        utils_1.removeChild(parentDom, dom);
    }
    if (options_1.options.recyclingEnabled && (parentDom || canRecycle)) {
        recycling_1.poolElement(vNode);
    }
}
exports.unmountElement = unmountElement;
function unmountChildren(children, lifecycle, isRecycling) {
    if (inferno_shared_1.isArray(children)) {
        for (var i = 0, len = children.length; i < len; i++) {
            var child = children[i];
            if (!inferno_shared_1.isInvalid(child) && inferno_shared_1.isObject(child)) {
                unmount(child, null, lifecycle, false, isRecycling);
            }
        }
    }
    else if (inferno_shared_1.isObject(children)) {
        unmount(children, null, lifecycle, false, isRecycling);
    }
}
function unmountRef(ref) {
    if (inferno_shared_1.isFunction(ref)) {
        ref(null);
    }
    else {
        if (inferno_shared_1.isInvalid(ref)) {
            return;
        }
        if (process.env.NODE_ENV !== 'production') {
            inferno_shared_1.throwError('string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.');
        }
        inferno_shared_1.throwError();
    }
}


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var inferno_shared_1 = __webpack_require__(0);
var InputWrapper_1 = __webpack_require__(89);
var SelectWrapper_1 = __webpack_require__(90);
var TextareaWrapper_1 = __webpack_require__(91);
/**
 * There is currently no support for switching same input between controlled and nonControlled
 * If that ever becomes a real issue, then re design controlled elements
 * Currently user must choose either controlled or non-controlled and stick with that
 */
function processElement(flags, vNode, dom, nextPropsOrEmpty, mounting, isControlled) {
    if (flags & 512 /* InputElement */) {
        InputWrapper_1.processInput(vNode, dom, nextPropsOrEmpty, mounting, isControlled);
    }
    if (flags & 2048 /* SelectElement */) {
        SelectWrapper_1.processSelect(vNode, dom, nextPropsOrEmpty, mounting, isControlled);
    }
    if (flags & 1024 /* TextareaElement */) {
        TextareaWrapper_1.processTextarea(vNode, dom, nextPropsOrEmpty, mounting, isControlled);
    }
}
exports.processElement = processElement;
function isControlledFormElement(nextPropsOrEmpty) {
    return (nextPropsOrEmpty.type && InputWrapper_1.isCheckedType(nextPropsOrEmpty.type)) ? !inferno_shared_1.isNullOrUndef(nextPropsOrEmpty.checked) : !inferno_shared_1.isNullOrUndef(nextPropsOrEmpty.value);
}
exports.isControlledFormElement = isControlledFormElement;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(92).default;
module.exports.default = module.exports;



/***/ }),
/* 27 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.createSubscribe = createSubscribe;
exports.async = async;

var _shared_promise = __webpack_require__(18);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LocalPromise = _shared_promise.local.Promise;
/**
 * Helper to make a Subscribe function (just like Promise helps make a
 * Thenable).
 *
 * @param executor Function which can make calls to a single Observer
 *     as a proxy.
 * @param onNoObservers Callback when count of Observers goes to zero.
 */
function createSubscribe(executor, onNoObservers) {
    var proxy = new ObserverProxy(executor, onNoObservers);
    return proxy.subscribe.bind(proxy);
}
/**
 * Implement fan-out for any number of Observers attached via a subscribe
 * function.
 */

var ObserverProxy = function () {
    /**
     * @param executor Function which can make calls to a single Observer
     *     as a proxy.
     * @param onNoObservers Callback when count of Observers goes to zero.
     */
    function ObserverProxy(executor, onNoObservers) {
        var _this = this;

        _classCallCheck(this, ObserverProxy);

        this.observers = [];
        this.unsubscribes = [];
        this.observerCount = 0;
        // Micro-task scheduling by calling task.then().
        this.task = LocalPromise.resolve();
        this.finalized = false;
        this.onNoObservers = onNoObservers;
        // Call the executor asynchronously so subscribers that are called
        // synchronously after the creation of the subscribe function
        // can still receive the very first value generated in the executor.
        this.task.then(function () {
            executor(_this);
        }).catch(function (e) {
            _this.error(e);
        });
    }

    _createClass(ObserverProxy, [{
        key: 'next',
        value: function next(value) {
            this.forEachObserver(function (observer) {
                observer.next(value);
            });
        }
    }, {
        key: 'error',
        value: function error(_error) {
            this.forEachObserver(function (observer) {
                observer.error(_error);
            });
            this.close(_error);
        }
    }, {
        key: 'complete',
        value: function complete() {
            this.forEachObserver(function (observer) {
                observer.complete();
            });
            this.close();
        }
        /**
         * Subscribe function that can be used to add an Observer to the fan-out list.
         *
         * - We require that no event is sent to a subscriber sychronously to their
         *   call to subscribe().
         */

    }, {
        key: 'subscribe',
        value: function subscribe(nextOrObserver, error, complete) {
            var _this2 = this;

            var observer = void 0;
            if (nextOrObserver === undefined && error === undefined && complete === undefined) {
                throw new Error("Missing Observer.");
            }
            // Assemble an Observer object when passed as callback functions.
            if (implementsAnyMethods(nextOrObserver, ['next', 'error', 'complete'])) {
                observer = nextOrObserver;
            } else {
                observer = {
                    next: nextOrObserver,
                    error: error,
                    complete: complete
                };
            }
            if (observer.next === undefined) {
                observer.next = noop;
            }
            if (observer.error === undefined) {
                observer.error = noop;
            }
            if (observer.complete === undefined) {
                observer.complete = noop;
            }
            var unsub = this.unsubscribeOne.bind(this, this.observers.length);
            // Attempt to subscribe to a terminated Observable - we
            // just respond to the Observer with the final error or complete
            // event.
            if (this.finalized) {
                this.task.then(function () {
                    try {
                        if (_this2.finalError) {
                            observer.error(_this2.finalError);
                        } else {
                            observer.complete();
                        }
                    } catch (e) {
                        // nothing
                    }
                });
            }
            this.observers.push(observer);
            return unsub;
        }
        // Unsubscribe is synchronous - we guarantee that no events are sent to
        // any unsubscribed Observer.

    }, {
        key: 'unsubscribeOne',
        value: function unsubscribeOne(i) {
            if (this.observers === undefined || this.observers[i] === undefined) {
                return;
            }
            delete this.observers[i];
            this.observerCount -= 1;
            if (this.observerCount === 0 && this.onNoObservers !== undefined) {
                this.onNoObservers(this);
            }
        }
    }, {
        key: 'forEachObserver',
        value: function forEachObserver(fn) {
            if (this.finalized) {
                // Already closed by previous event....just eat the additional values.
                return;
            }
            // Since sendOne calls asynchronously - there is no chance that
            // this.observers will become undefined.
            for (var i = 0; i < this.observers.length; i++) {
                this.sendOne(i, fn);
            }
        }
        // Call the Observer via one of it's callback function. We are careful to
        // confirm that the observe has not been unsubscribed since this asynchronous
        // function had been queued.

    }, {
        key: 'sendOne',
        value: function sendOne(i, fn) {
            var _this3 = this;

            // Execute the callback asynchronously
            this.task.then(function () {
                if (_this3.observers !== undefined && _this3.observers[i] !== undefined) {
                    try {
                        fn(_this3.observers[i]);
                    } catch (e) {
                        // Ignore exceptions raised in Observers or missing methods of an
                        // Observer.
                        // Log error to console. b/31404806
                        if (typeof console !== "undefined" && console.error) {
                            console.error(e);
                        }
                    }
                }
            });
        }
    }, {
        key: 'close',
        value: function close(err) {
            var _this4 = this;

            if (this.finalized) {
                return;
            }
            this.finalized = true;
            if (err !== undefined) {
                this.finalError = err;
            }
            // Proxy is no longer needed - garbage collect references
            this.task.then(function () {
                _this4.observers = undefined;
                _this4.onNoObservers = undefined;
            });
        }
    }]);

    return ObserverProxy;
}();
/** Turn synchronous function into one called asynchronously. */


function async(fn, onError) {
    return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        LocalPromise.resolve(true).then(function () {
            fn.apply(undefined, args);
        }).catch(function (error) {
            if (onError) {
                onError(error);
            }
        });
    };
}
/**
 * Return true if the object passed in implements any of the named methods.
 */
function implementsAnyMethods(obj, methods) {
    if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object' || obj === null) {
        return false;
    }
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = methods[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var method = _step.value;

            if (method in obj && typeof obj[method] === 'function') {
                return true;
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return false;
}
function noop() {
    // do nothing
}
//# sourceMappingURL=subscribe.js.map


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */

/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _errors = __webpack_require__(17);

var _errors2 = __webpack_require__(11);

var _errors3 = _interopRequireDefault(_errors2);

var _tokenManager = __webpack_require__(58);

var _tokenManager2 = _interopRequireDefault(_tokenManager);

var _notificationPermission = __webpack_require__(31);

var _notificationPermission2 = _interopRequireDefault(_notificationPermission);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SENDER_ID_OPTION_NAME = 'messagingSenderId';

var ControllerInterface = function () {
    /**
     * An interface of the Messaging Service API
     * @param {!firebase.app.App} app
     */
    function ControllerInterface(app) {
        var _this = this;

        _classCallCheck(this, ControllerInterface);

        this.errorFactory_ = new _errors.ErrorFactory('messaging', 'Messaging', _errors3.default.map);
        if (!app.options[SENDER_ID_OPTION_NAME] || typeof app.options[SENDER_ID_OPTION_NAME] !== 'string') {
            throw this.errorFactory_.create(_errors3.default.codes.BAD_SENDER_ID);
        }
        this.messagingSenderId_ = app.options[SENDER_ID_OPTION_NAME];
        this.tokenManager_ = new _tokenManager2.default();
        this.app = app;
        this.INTERNAL = {};
        this.INTERNAL.delete = function () {
            return _this.delete;
        };
    }
    /**
     * @export
     * @return {Promise<string> | Promise<null>} Returns a promise that
     * resolves to an FCM token.
     */


    _createClass(ControllerInterface, [{
        key: 'getToken',
        value: function getToken() {
            var _this2 = this;

            // Check with permissions
            var currentPermission = this.getNotificationPermission_();
            if (currentPermission !== _notificationPermission2.default.granted) {
                if (currentPermission === _notificationPermission2.default.denied) {
                    return Promise.reject(this.errorFactory_.create(_errors3.default.codes.NOTIFICATIONS_BLOCKED));
                }
                // We must wait for permission to be granted
                return Promise.resolve(null);
            }
            return this.getSWRegistration_().then(function (registration) {
                return _this2.tokenManager_.getSavedToken(_this2.messagingSenderId_, registration).then(function (token) {
                    if (token) {
                        return token;
                    }
                    return _this2.tokenManager_.createToken(_this2.messagingSenderId_, registration);
                });
            });
        }
        /**
         * This method deletes tokens that the token manager looks after and then
         * unregisters the push subscription if it exists.
         * @export
         * @param {string} token
         * @return {Promise<void>}
         */

    }, {
        key: 'deleteToken',
        value: function deleteToken(token) {
            var _this3 = this;

            return this.tokenManager_.deleteToken(token).then(function () {
                return _this3.getSWRegistration_().then(function (registration) {
                    if (registration) {
                        return registration.pushManager.getSubscription();
                    }
                }).then(function (subscription) {
                    if (subscription) {
                        return subscription.unsubscribe();
                    }
                });
            });
        }
    }, {
        key: 'getSWRegistration_',
        value: function getSWRegistration_() {
            throw this.errorFactory_.create(_errors3.default.codes.SHOULD_BE_INHERITED);
        }
        //
        // The following methods should only be available in the window.
        //

    }, {
        key: 'requestPermission',
        value: function requestPermission() {
            throw this.errorFactory_.create(_errors3.default.codes.AVAILABLE_IN_WINDOW);
        }
        /**
         * @export
         * @param {!ServiceWorkerRegistration} registration
         */

    }, {
        key: 'useServiceWorker',
        value: function useServiceWorker() {
            throw this.errorFactory_.create(_errors3.default.codes.AVAILABLE_IN_WINDOW);
        }
        /**
         * @export
         * @param {!firebase.Observer|function(*)} nextOrObserver
         * @param {function(!Error)=} optError
         * @param {function()=} optCompleted
         * @return {!function()}
         */

    }, {
        key: 'onMessage',
        value: function onMessage() {
            throw this.errorFactory_.create(_errors3.default.codes.AVAILABLE_IN_WINDOW);
        }
        /**
         * @export
         * @param {!firebase.Observer|function()} nextOrObserver An observer object
         * or a function triggered on token refresh.
         * @param {function(!Error)=} optError Optional A function
         * triggered on token refresh error.
         * @param {function()=} optCompleted Optional function triggered when the
         * observer is removed.
         * @return {!function()} The unsubscribe function for the observer.
         */

    }, {
        key: 'onTokenRefresh',
        value: function onTokenRefresh() {
            throw this.errorFactory_.create(_errors3.default.codes.AVAILABLE_IN_WINDOW);
        }
        //
        // The following methods are used by the service worker only.
        //
        /**
         * @export
         * @param {function(Object)} callback
         */

    }, {
        key: 'setBackgroundMessageHandler',
        value: function setBackgroundMessageHandler() {
            throw this.errorFactory_.create(_errors3.default.codes.AVAILABLE_IN_SW);
        }
        //
        // The following methods are used by the service themselves and not exposed
        // publicly or not expected to be used by developers.
        //
        /**
         * This method is required to adhere to the Firebase interface.
         * It closes any currently open indexdb database connections.
         */

    }, {
        key: 'delete',
        value: function _delete() {
            this.tokenManager_.closeDatabase();
        }
        /**
         * Returns the current Notification Permission state.
         * @private
         * @return {string} The currenct permission state.
         */

    }, {
        key: 'getNotificationPermission_',
        value: function getNotificationPermission_() {
            return Notification.permission;
        }
        /**
         * @protected
         * @returns {TokenManager}
         */

    }, {
        key: 'getTokenManager',
        value: function getTokenManager() {
            return this.tokenManager_;
        }
    }]);

    return ControllerInterface;
}();

exports.default = ControllerInterface;
module.exports = exports['default'];
//# sourceMappingURL=controller-interface.js.map


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */

/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


Object.defineProperty(exports, "__esModule", {
    value: true
});
var FCM_APPLICATION_SERVER_KEY = [0x04, 0x33, 0x94, 0xF7, 0xDF, 0xA1, 0xEB, 0xB1, 0xDC, 0x03, 0xA2, 0x5E, 0x15, 0x71, 0xDB, 0x48, 0xD3, 0x2E, 0xED, 0xED, 0xB2, 0x34, 0xDB, 0xB7, 0x47, 0x3A, 0x0C, 0x8F, 0xC4, 0xCC, 0xE1, 0x6F, 0x3C, 0x8C, 0x84, 0xDF, 0xAB, 0xB6, 0x66, 0x3E, 0xF2, 0x0C, 0xD4, 0x8B, 0xFE, 0xE3, 0xF9, 0x76, 0x2F, 0x14, 0x1C, 0x63, 0x08, 0x6A, 0x6F, 0x2D, 0xB1, 0x1A, 0x95, 0xB0, 0xCE, 0x37, 0xC0, 0x9C, 0x6E];
var SUBSCRIPTION_DETAILS = {
    'userVisibleOnly': true,
    'applicationServerKey': new Uint8Array(FCM_APPLICATION_SERVER_KEY)
};
exports.default = {
    ENDPOINT: 'https://fcm.googleapis.com',
    APPLICATION_SERVER_KEY: FCM_APPLICATION_SERVER_KEY,
    SUBSCRIPTION_OPTIONS: SUBSCRIPTION_DETAILS
};
module.exports = exports['default'];
//# sourceMappingURL=fcm-details.js.map


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */

/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    granted: 'granted',
    default: 'default',
    denied: 'denied'
};
module.exports = exports['default'];
//# sourceMappingURL=notification-permission.js.map


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */

/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

// These fields are strings to prevent closure from thinking goog.getMsg
// should be used to initialise the values

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var PARAMS = {
    TYPE_OF_MSG: 'firebase-messaging-msg-type',
    DATA: 'firebase-messaging-msg-data'
};
// This value isn't using the TYPE_OF_MSG short hand as closure
// expects the variable to be defined via goog.getMsg
var msgType = {
    PUSH_MSG_RECEIVED: 'push-msg-received',
    NOTIFICATION_CLICKED: 'notification-clicked'
};
var createNewMsg = function (msgType, msgData) {
    var _message;

    var message = (_message = {}, _defineProperty(_message, PARAMS.TYPE_OF_MSG, msgType), _defineProperty(_message, PARAMS.DATA, msgData), _message);
    return message;
};
exports.default = {
    PARAMS: PARAMS,
    TYPES_OF_MSG: msgType,
    createNewMsg: createNewMsg
};
module.exports = exports['default'];
//# sourceMappingURL=worker-page-message.js.map


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FbsBlob = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Copyright 2017 Google Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * you may not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * You may obtain a copy of the License at
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *   http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * See the License for the specific language governing permissions and
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */
/**
 * @file Provides a Blob-like wrapper for various binary types (including the
 * native Blob type). This makes it possible to upload types like ArrayBuffers,
 * making uploads possible in environments without the native Blob type.
 */


var _fs = __webpack_require__(65);

var fs = _interopRequireWildcard(_fs);

var _string = __webpack_require__(22);

var string = _interopRequireWildcard(_string);

var _type = __webpack_require__(1);

var type = _interopRequireWildcard(_type);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @param opt_elideCopy If true, doesn't copy mutable input data
 *     (e.g. Uint8Arrays). Pass true only if you know the objects will not be
 *     modified after this blob's construction.
 */
var FbsBlob = exports.FbsBlob = function () {
    function FbsBlob(data, opt_elideCopy) {
        _classCallCheck(this, FbsBlob);

        var size = 0;
        var blobType = '';
        if (type.isNativeBlob(data)) {
            this.data_ = data;
            size = data.size;
            blobType = data.type;
        } else if (data instanceof ArrayBuffer) {
            if (opt_elideCopy) {
                this.data_ = new Uint8Array(data);
            } else {
                this.data_ = new Uint8Array(data.byteLength);
                this.data_.set(new Uint8Array(data));
            }
            size = this.data_.length;
        } else if (data instanceof Uint8Array) {
            if (opt_elideCopy) {
                this.data_ = data;
            } else {
                this.data_ = new Uint8Array(data.length);
                this.data_.set(data);
            }
            size = data.length;
        }
        this.size_ = size;
        this.type_ = blobType;
    }

    _createClass(FbsBlob, [{
        key: 'size',
        value: function size() {
            return this.size_;
        }
    }, {
        key: 'type',
        value: function () {
            return this.type_;
        }
    }, {
        key: 'slice',
        value: function slice(startByte, endByte) {
            if (type.isNativeBlob(this.data_)) {
                var realBlob = this.data_;
                var sliced = fs.sliceBlob(realBlob, startByte, endByte);
                if (sliced === null) {
                    return null;
                }
                return new FbsBlob(sliced);
            } else {
                var slice = new Uint8Array(this.data_.buffer, startByte, endByte - startByte);
                return new FbsBlob(slice, true);
            }
        }
    }, {
        key: 'uploadData',
        value: function uploadData() {
            return this.data_;
        }
    }], [{
        key: 'getBlob',
        value: function getBlob() {
            for (var _len = arguments.length, var_args = Array(_len), _key = 0; _key < _len; _key++) {
                var_args[_key] = arguments[_key];
            }

            if (type.isNativeBlobDefined()) {
                var blobby = var_args.map(function (val) {
                    if (val instanceof FbsBlob) {
                        return val.data_;
                    } else {
                        return val;
                    }
                });
                return new FbsBlob(fs.getBlob.apply(null, blobby));
            } else {
                var uint8Arrays = var_args.map(function (val) {
                    if (type.isString(val)) {
                        return string.dataFromString(_string.StringFormat.RAW, val).data;
                    } else {
                        // Blobs don't exist, so this has to be a Uint8Array.
                        return val.data_;
                    }
                });
                var finalLength = 0;
                uint8Arrays.forEach(function (array) {
                    finalLength += array.byteLength;
                });
                var merged = new Uint8Array(finalLength);
                var index = 0;
                uint8Arrays.forEach(function (array) {
                    for (var i = 0; i < array.length; i++) {
                        merged[index++] = array[i];
                    }
                });
                return new FbsBlob(merged, true);
            }
        }
    }]);

    return FbsBlob;
}();
//# sourceMappingURL=blob.js.map


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parent = parent;
exports.child = child;
exports.lastComponent = lastComponent;
/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
 * @fileoverview Contains helper methods for manipulating paths.
 */
/**
 * @return Null if the path is already at the root.
 */
/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function parent(path) {
    if (path.length == 0) {
        return null;
    }
    var index = path.lastIndexOf('/');
    if (index === -1) {
        return '';
    }
    var newPath = path.slice(0, index);
    return newPath;
}
function child(path, childPath) {
    var canonicalChildPath = childPath.split('/').filter(function (component) {
        return component.length > 0;
    }).join('/');
    if (path.length === 0) {
        return canonicalChildPath;
    } else {
        return path + '/' + canonicalChildPath;
    }
}
/**
 * Returns the last component of a path.
 * '/foo/bar' -> 'bar'
 * '/foo/bar/baz/' -> 'baz/'
 * '/a' -> 'a'
 */
function lastComponent(path) {
    var index = path.lastIndexOf('/', path.length - 2);
    if (index === -1) {
        return path;
    } else {
        return path.slice(index + 1);
    }
}
//# sourceMappingURL=path.js.map


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.resumableUploadChunkSize = exports.ResumableUploadStatus = undefined;
exports.handlerCheck = handlerCheck;
exports.metadataHandler = metadataHandler;
exports.sharedErrorHandler = sharedErrorHandler;
exports.objectErrorHandler = objectErrorHandler;
exports.getMetadata = getMetadata;
exports.updateMetadata = updateMetadata;
exports.deleteObject = deleteObject;
exports.determineContentType_ = determineContentType_;
exports.metadataForUpload_ = metadataForUpload_;
exports.multipartUpload = multipartUpload;
exports.checkResumeHeader_ = checkResumeHeader_;
exports.createResumableUpload = createResumableUpload;
exports.getResumableUploadStatus = getResumableUploadStatus;
exports.continueResumableUpload = continueResumableUpload;

var _array = __webpack_require__(20);

var array = _interopRequireWildcard(_array);

var _blob = __webpack_require__(33);

var _error = __webpack_require__(3);

var errorsExports = _interopRequireWildcard(_error);

var _metadata = __webpack_require__(21);

var MetadataUtils = _interopRequireWildcard(_metadata);

var _object = __webpack_require__(7);

var object = _interopRequireWildcard(_object);

var _requestinfo = __webpack_require__(69);

var _type = __webpack_require__(1);

var type = _interopRequireWildcard(_type);

var _url = __webpack_require__(23);

var UrlUtils = _interopRequireWildcard(_url);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                          * Copyright 2017 Google Inc.
                                                                                                                                                          *
                                                                                                                                                          * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                          * you may not use this file except in compliance with the License.
                                                                                                                                                          * You may obtain a copy of the License at
                                                                                                                                                          *
                                                                                                                                                          *   http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                          *
                                                                                                                                                          * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                          * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                          * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                          * See the License for the specific language governing permissions and
                                                                                                                                                          * limitations under the License.
                                                                                                                                                          */


/**
 * Throws the UNKNOWN FirebaseStorageError if cndn is false.
 */
function handlerCheck(cndn) {
    if (!cndn) {
        throw errorsExports.unknown();
    }
}
function metadataHandler(authWrapper, mappings) {
    return function (xhr, text) {
        var metadata = MetadataUtils.fromResourceString(authWrapper, text, mappings);
        handlerCheck(metadata !== null);
        return metadata;
    };
}
function sharedErrorHandler(location) {
    return function (xhr, err) {
        var newErr = void 0;
        if (xhr.getStatus() === 401) {
            newErr = errorsExports.unauthenticated();
        } else {
            if (xhr.getStatus() === 402) {
                newErr = errorsExports.quotaExceeded(location.bucket);
            } else {
                if (xhr.getStatus() === 403) {
                    newErr = errorsExports.unauthorized(location.path);
                } else {
                    newErr = err;
                }
            }
        }
        newErr.setServerResponseProp(err.serverResponseProp());
        return newErr;
    };
}
function objectErrorHandler(location) {
    var shared = sharedErrorHandler(location);

    return function (xhr, err) {
        var newErr = shared(xhr, err);
        if (xhr.getStatus() === 404) {
            newErr = errorsExports.objectNotFound(location.path);
        }
        newErr.setServerResponseProp(err.serverResponseProp());
        return newErr;
    };
}
function getMetadata(authWrapper, location, mappings) {
    var urlPart = location.fullServerUrl();
    var url = UrlUtils.makeNormalUrl(urlPart);

    var timeout = authWrapper.maxOperationRetryTime();
    var requestInfo = new _requestinfo.RequestInfo(url, 'GET', metadataHandler(authWrapper, mappings), timeout);
    requestInfo.errorHandler = objectErrorHandler(location);
    return requestInfo;
}
function updateMetadata(authWrapper, location, metadata, mappings) {
    var urlPart = location.fullServerUrl();
    var url = UrlUtils.makeNormalUrl(urlPart);

    var body = MetadataUtils.toResourceString(metadata, mappings);

    var timeout = authWrapper.maxOperationRetryTime();
    var requestInfo = new _requestinfo.RequestInfo(url, 'PATCH', metadataHandler(authWrapper, mappings), timeout);
    requestInfo.headers = { 'Content-Type': 'application/json; charset=utf-8' };
    requestInfo.body = body;
    requestInfo.errorHandler = objectErrorHandler(location);
    return requestInfo;
}
function deleteObject(authWrapper, location) {
    var urlPart = location.fullServerUrl();
    var url = UrlUtils.makeNormalUrl(urlPart);

    var timeout = authWrapper.maxOperationRetryTime();

    var requestInfo = new _requestinfo.RequestInfo(url, 'DELETE', function () {}, timeout);
    requestInfo.successCodes = [200, 204];
    requestInfo.errorHandler = objectErrorHandler(location);
    return requestInfo;
}
function determineContentType_(metadata, blob) {
    return metadata && metadata['contentType'] || blob && blob.type() || 'application/octet-stream';
}
function metadataForUpload_(location, blob, opt_metadata) {
    var metadata = object.clone(opt_metadata);
    metadata['fullPath'] = location.path;
    metadata['size'] = blob.size();
    if (!metadata['contentType']) {
        metadata['contentType'] = determineContentType_(null, blob);
    }
    return metadata;
}
function multipartUpload(authWrapper, location, mappings, blob, opt_metadata) {
    var urlPart = location.bucketOnlyServerUrl();
    var headers = { 'X-Goog-Upload-Protocol': 'multipart' };

    var boundary = function () {
        var str = '';
        for (var i = 0; i < 2; i++) {
            str = str + Math.random().toString().slice(2);
        }
        return str;
    }();
    headers['Content-Type'] = 'multipart/related; boundary=' + boundary;
    var metadata = metadataForUpload_(location, blob, opt_metadata);
    var metadataString = MetadataUtils.toResourceString(metadata, mappings);
    var preBlobPart = '--' + boundary + '\r\n' + 'Content-Type: application/json; charset=utf-8\r\n\r\n' + metadataString + '\r\n--' + boundary + '\r\n' + 'Content-Type: ' + metadata['contentType'] + '\r\n\r\n';

    var body = _blob.FbsBlob.getBlob(preBlobPart, blob, '\r\n--' + boundary + '--');
    if (body === null) {
        throw errorsExports.cannotSliceBlob();
    }
    var urlParams = { 'name': metadata['fullPath'] };
    var url = UrlUtils.makeUploadUrl(urlPart);

    var timeout = authWrapper.maxUploadRetryTime();
    var requestInfo = new _requestinfo.RequestInfo(url, 'POST', metadataHandler(authWrapper, mappings), timeout);
    requestInfo.urlParams = urlParams;
    requestInfo.headers = headers;
    requestInfo.body = body.uploadData();
    requestInfo.errorHandler = sharedErrorHandler(location);
    return requestInfo;
}
/**
 * @param current The number of bytes that have been uploaded so far.
 * @param total The total number of bytes in the upload.
 * @param opt_finalized True if the server has finished the upload.
 * @param opt_metadata The upload metadata, should
 *     only be passed if opt_finalized is true.
 * @struct
 */

var ResumableUploadStatus = exports.ResumableUploadStatus = function ResumableUploadStatus(current, total, finalized, metadata) {
    _classCallCheck(this, ResumableUploadStatus);

    this.current = current;
    this.total = total;
    this.finalized = !!finalized;
    this.metadata = metadata || null;
};

function checkResumeHeader_(xhr, opt_allowed) {
    var status = void 0;
    try {
        status = xhr.getResponseHeader('X-Goog-Upload-Status');
    } catch (e) {
        handlerCheck(false);
    }

    handlerCheck(array.contains(opt_allowed || ['active'], status));
    return status;
}
function createResumableUpload(authWrapper, location, mappings, blob, opt_metadata) {
    var urlPart = location.bucketOnlyServerUrl();
    var metadata = metadataForUpload_(location, blob, opt_metadata);
    var urlParams = { 'name': metadata['fullPath'] };
    var url = UrlUtils.makeUploadUrl(urlPart);

    var headers = {
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length': blob.size(),
        'X-Goog-Upload-Header-Content-Type': metadata['contentType'],
        'Content-Type': 'application/json; charset=utf-8'
    };
    var body = MetadataUtils.toResourceString(metadata, mappings);
    var timeout = authWrapper.maxUploadRetryTime();

    var requestInfo = new _requestinfo.RequestInfo(url, 'POST', function (xhr) {
        checkResumeHeader_(xhr);
        var url = void 0;
        try {
            url = xhr.getResponseHeader('X-Goog-Upload-URL');
        } catch (e) {
            handlerCheck(false);
        }
        handlerCheck(type.isString(url));
        return url;
    }, timeout);
    requestInfo.urlParams = urlParams;
    requestInfo.headers = headers;
    requestInfo.body = body;
    requestInfo.errorHandler = sharedErrorHandler(location);
    return requestInfo;
}
/**
 * @param url From a call to fbs.requests.createResumableUpload.
 */
function getResumableUploadStatus(authWrapper, location, url, blob) {
    var timeout = authWrapper.maxUploadRetryTime();
    var requestInfo = new _requestinfo.RequestInfo(url, 'POST', function (xhr) {
        var status = checkResumeHeader_(xhr, ['active', 'final']);
        var sizeString = void 0;
        try {
            sizeString = xhr.getResponseHeader('X-Goog-Upload-Size-Received');
        } catch (e) {
            handlerCheck(false);
        }
        var size = parseInt(sizeString, 10);
        handlerCheck(!isNaN(size));
        return new ResumableUploadStatus(size, blob.size(), status === 'final');
    }, timeout);
    requestInfo.headers = { 'X-Goog-Upload-Command': 'query' };
    requestInfo.errorHandler = sharedErrorHandler(location);
    return requestInfo;
}
/**
 * Any uploads via the resumable upload API must transfer a number of bytes
 * that is a multiple of this number.
 */
var resumableUploadChunkSize = exports.resumableUploadChunkSize = 256 * 1024;
/**
 * @param url From a call to fbs.requests.createResumableUpload.
 * @param chunkSize Number of bytes to upload.
 * @param opt_status The previous status.
 *     If not passed or null, we start from the beginning.
 * @throws fbs.Error If the upload is already complete, the passed in status
 *     has a final size inconsistent with the blob, or the blob cannot be sliced
 *     for upload.
 */
function continueResumableUpload(location, authWrapper, url, blob, chunkSize, mappings, opt_status, opt_progressCallback) {
    // TODO(andysoto): standardize on internal asserts
    // assert(!(opt_status && opt_status.finalized));
    var status = new ResumableUploadStatus(0, 0);
    if (opt_status) {
        status.current = opt_status.current;
        status.total = opt_status.total;
    } else {
        status.current = 0;
        status.total = blob.size();
    }
    if (blob.size() !== status.total) {
        throw errorsExports.serverFileWrongSize();
    }
    var bytesLeft = status.total - status.current;
    var bytesToUpload = bytesLeft;
    if (chunkSize > 0) {
        bytesToUpload = Math.min(bytesToUpload, chunkSize);
    }
    var startByte = status.current;
    var endByte = startByte + bytesToUpload;
    var uploadCommand = bytesToUpload === bytesLeft ? 'upload, finalize' : 'upload';
    var headers = {
        'X-Goog-Upload-Command': uploadCommand,
        'X-Goog-Upload-Offset': status.current
    };
    var body = blob.slice(startByte, endByte);
    if (body === null) {
        throw errorsExports.cannotSliceBlob();
    }

    var timeout = authWrapper.maxUploadRetryTime();
    var requestInfo = new _requestinfo.RequestInfo(url, 'POST', function (xhr, text) {
        // TODO(andysoto): Verify the MD5 of each uploaded range:
        // the 'x-range-md5' header comes back with status code 308 responses.
        // We'll only be able to bail out though, because you can't re-upload a
        // range that you previously uploaded.
        var uploadStatus = checkResumeHeader_(xhr, ['active', 'final']);
        var newCurrent = status.current + bytesToUpload;
        var size = blob.size();
        var metadata = void 0;
        if (uploadStatus === 'final') {
            metadata = metadataHandler(authWrapper, mappings)(xhr, text);
        } else {
            metadata = null;
        }
        return new ResumableUploadStatus(newCurrent, size, uploadStatus === 'final', metadata);
    }, timeout);
    requestInfo.headers = headers;
    requestInfo.body = body.uploadData();
    requestInfo.progressCallback = opt_progressCallback || null;
    requestInfo.errorHandler = sharedErrorHandler(location);
    return requestInfo;
}
//# sourceMappingURL=requests.js.map


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.taskStateFromInternalTaskState = taskStateFromInternalTaskState;
/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var TaskEvent = exports.TaskEvent = {
    /** Triggered whenever the task changes or progress is updated. */
    STATE_CHANGED: 'state_changed'
};
var InternalTaskState = exports.InternalTaskState = {
    RUNNING: 'running',
    PAUSING: 'pausing',
    PAUSED: 'paused',
    SUCCESS: 'success',
    CANCELING: 'canceling',
    CANCELED: 'canceled',
    ERROR: 'error'
};
var TaskState = exports.TaskState = {
    /** The task is currently transferring data. */
    RUNNING: 'running',
    /** The task was paused by the user. */
    PAUSED: 'paused',
    /** The task completed successfully. */
    SUCCESS: 'success',
    /** The task was canceled. */
    CANCELED: 'canceled',
    /** The task failed with an error. */
    ERROR: 'error'
};
function taskStateFromInternalTaskState(state) {
    switch (state) {
        case InternalTaskState.RUNNING:
        case InternalTaskState.PAUSING:
        case InternalTaskState.CANCELING:
            return TaskState.RUNNING;
        case InternalTaskState.PAUSED:
            return TaskState.PAUSED;
        case InternalTaskState.SUCCESS:
            return TaskState.SUCCESS;
        case InternalTaskState.CANCELED:
            return TaskState.CANCELED;
        case InternalTaskState.ERROR:
            return TaskState.ERROR;
        default:
            // TODO(andysoto): assert(false);
            return TaskState.ERROR;
    }
}
//# sourceMappingURL=taskenums.js.map


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
 * @enum{number}
 */
var ErrorCode = exports.ErrorCode = undefined;
(function (ErrorCode) {
    ErrorCode[ErrorCode["NO_ERROR"] = 0] = "NO_ERROR";
    ErrorCode[ErrorCode["NETWORK_ERROR"] = 1] = "NETWORK_ERROR";
    ErrorCode[ErrorCode["ABORT"] = 2] = "ABORT";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
//# sourceMappingURL=xhrio.js.map


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Reference = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Copyright 2017 Google Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * you may not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * You may obtain a copy of the License at
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *   http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * See the License for the specific language governing permissions and
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */
/**
 * @fileoverview Defines the Firebase Storage Reference class.
 */


var _args = __webpack_require__(19);

var args = _interopRequireWildcard(_args);

var _blob = __webpack_require__(33);

var _error = __webpack_require__(3);

var errorsExports = _interopRequireWildcard(_error);

var _location = __webpack_require__(13);

var _metadata = __webpack_require__(21);

var metadata = _interopRequireWildcard(_metadata);

var _object = __webpack_require__(7);

var object = _interopRequireWildcard(_object);

var _path = __webpack_require__(34);

var path = _interopRequireWildcard(_path);

var _requests = __webpack_require__(35);

var requests = _interopRequireWildcard(_requests);

var _string = __webpack_require__(22);

var fbsString = _interopRequireWildcard(_string);

var _type = __webpack_require__(1);

var type = _interopRequireWildcard(_type);

var _task = __webpack_require__(74);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Provides methods to interact with a bucket in the Firebase Storage service.
 * @param location An fbs.location, or the URL at
 *     which to base this object, in one of the following forms:
 *         gs://<bucket>/<object-path>
 *         http[s]://firebasestorage.googleapis.com/
 *                     <api-version>/b/<bucket>/o/<object-path>
 *     Any query or fragment strings will be ignored in the http[s]
 *     format. If no value is passed, the storage object will use a URL based on
 *     the project ID of the base firebase.App instance.
 */
var Reference = exports.Reference = function () {
    function Reference(authWrapper, location) {
        _classCallCheck(this, Reference);

        this.authWrapper = authWrapper;
        if (location instanceof _location.Location) {
            this.location = location;
        } else {
            this.location = _location.Location.makeFromUrl(location);
        }
    }
    /**
     * @return The URL for the bucket and path this object references,
     *     in the form gs://<bucket>/<object-path>
     * @override
     */


    _createClass(Reference, [{
        key: 'toString',
        value: function toString() {
            args.validate('toString', [], arguments);
            return 'gs://' + this.location.bucket + '/' + this.location.path;
        }
    }, {
        key: 'newRef',
        value: function newRef(authWrapper, location) {
            return new Reference(authWrapper, location);
        }
    }, {
        key: 'mappings',
        value: function mappings() {
            return metadata.getMappings();
        }
        /**
         * @return A reference to the object obtained by
         *     appending childPath, removing any duplicate, beginning, or trailing
         *     slashes.
         */

    }, {
        key: 'child',
        value: function child(childPath) {
            args.validate('child', [args.stringSpec()], arguments);
            var newPath = path.child(this.location.path, childPath);
            var location = new _location.Location(this.location.bucket, newPath);
            return this.newRef(this.authWrapper, location);
        }
        /**
         * @return A reference to the parent of the
         *     current object, or null if the current object is the root.
         */

    }, {
        key: 'put',

        /**
         * Uploads a blob to this object's location.
         * @param data The blob to upload.
         * @return An UploadTask that lets you control and
         *     observe the upload.
         */
        value: function put(data) {
            var metadata = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            args.validate('put', [args.uploadDataSpec(), args.metadataSpec(true)], arguments);
            this.throwIfRoot_('put');
            return new _task.UploadTask(this, this.authWrapper, this.location, this.mappings(), new _blob.FbsBlob(data), metadata);
        }
        /**
         * Uploads a string to this object's location.
         * @param string The string to upload.
         * @param opt_format The format of the string to upload.
         * @return An UploadTask that lets you control and
         *     observe the upload.
         */

    }, {
        key: 'putString',
        value: function putString(string) {
            var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _string.StringFormat.RAW;
            var opt_metadata = arguments[2];

            args.validate('putString', [args.stringSpec(), args.stringSpec(fbsString.formatValidator, true), args.metadataSpec(true)], arguments);
            this.throwIfRoot_('putString');
            var data = fbsString.dataFromString(format, string);
            var metadata = object.clone(opt_metadata);
            if (!type.isDef(metadata['contentType']) && type.isDef(data.contentType)) {
                metadata['contentType'] = data.contentType;
            }
            return new _task.UploadTask(this, this.authWrapper, this.location, this.mappings(), new _blob.FbsBlob(data.data, true), metadata);
        }
        /**
         * Deletes the object at this location.
         * @return A promise that resolves if the deletion succeeds.
         */

    }, {
        key: 'delete',
        value: function _delete() {
            args.validate('delete', [], arguments);
            this.throwIfRoot_('delete');
            var self = this;
            return this.authWrapper.getAuthToken().then(function (authToken) {
                var requestInfo = requests.deleteObject(self.authWrapper, self.location);
                return self.authWrapper.makeRequest(requestInfo, authToken).getPromise();
            });
        }
        /**
         *     A promise that resolves with the metadata for this object. If this
         *     object doesn't exist or metadata cannot be retreived, the promise is
         *     rejected.
         */

    }, {
        key: 'getMetadata',
        value: function getMetadata() {
            args.validate('getMetadata', [], arguments);
            this.throwIfRoot_('getMetadata');
            var self = this;
            return this.authWrapper.getAuthToken().then(function (authToken) {
                var requestInfo = requests.getMetadata(self.authWrapper, self.location, self.mappings());
                return self.authWrapper.makeRequest(requestInfo, authToken).getPromise();
            });
        }
        /**
         * Updates the metadata for this object.
         * @param metadata The new metadata for the object.
         *     Only values that have been explicitly set will be changed. Explicitly
         *     setting a value to null will remove the metadata.
         * @return A promise that resolves
         *     with the new metadata for this object.
         *     @see firebaseStorage.Reference.prototype.getMetadata
         */

    }, {
        key: 'updateMetadata',
        value: function updateMetadata(metadata) {
            args.validate('updateMetadata', [args.metadataSpec()], arguments);
            this.throwIfRoot_('updateMetadata');
            var self = this;
            return this.authWrapper.getAuthToken().then(function (authToken) {
                var requestInfo = requests.updateMetadata(self.authWrapper, self.location, metadata, self.mappings());
                return self.authWrapper.makeRequest(requestInfo, authToken).getPromise();
            });
        }
        /**
         * @return A promise that resolves with the download
         *     URL for this object.
         */

    }, {
        key: 'getDownloadURL',
        value: function getDownloadURL() {
            args.validate('getDownloadURL', [], arguments);
            this.throwIfRoot_('getDownloadURL');
            return this.getMetadata().then(function (metadata) {
                var url = metadata['downloadURLs'][0];
                if (type.isDef(url)) {
                    return url;
                } else {
                    throw errorsExports.noDownloadURL();
                }
            });
        }
    }, {
        key: 'throwIfRoot_',
        value: function throwIfRoot_(name) {
            if (this.location.path === '') {
                throw errorsExports.invalidRootOperation(name);
            }
        }
    }, {
        key: 'parent',
        get: function get() {
            var newPath = path.parent(this.location.path);
            if (newPath === null) {
                return null;
            }
            var location = new _location.Location(this.location.bucket, newPath);
            return this.newRef(this.authWrapper, location);
        }
        /**
         * @return An reference to the root of this
         *     object's bucket.
         */

    }, {
        key: 'root',
        get: function get() {
            var location = new _location.Location(this.location.bucket, '');
            return this.newRef(this.authWrapper, location);
        }
    }, {
        key: 'bucket',
        get: function get() {
            return this.location.bucket;
        }
    }, {
        key: 'fullPath',
        get: function get() {
            return this.location.path;
        }
    }, {
        key: 'name',
        get: function get() {
            return path.lastComponent(this.location.path);
        }
    }, {
        key: 'storage',
        get: function get() {
            return this.authWrapper.service();
        }
    }]);

    return Reference;
}();
//# sourceMappingURL=reference.js.map


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(80).default;
module.exports.default = module.exports;



/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var inferno_shared_1 = __webpack_require__(0);
var patching_1 = __webpack_require__(8);
var componentPools = new Map();
var elementPools = new Map();
function recycleElement(vNode, lifecycle, context, isSVG) {
    var tag = vNode.type;
    var pools = elementPools.get(tag);
    if (!inferno_shared_1.isUndefined(pools)) {
        var key = vNode.key;
        var pool = key === null ? pools.nonKeyed : pools.keyed.get(key);
        if (!inferno_shared_1.isUndefined(pool)) {
            var recycledVNode = pool.pop();
            if (!inferno_shared_1.isUndefined(recycledVNode)) {
                patching_1.patchElement(recycledVNode, vNode, null, lifecycle, context, isSVG, true);
                return vNode.dom;
            }
        }
    }
    return null;
}
exports.recycleElement = recycleElement;
function poolElement(vNode) {
    var tag = vNode.type;
    var key = vNode.key;
    var pools = elementPools.get(tag);
    if (inferno_shared_1.isUndefined(pools)) {
        pools = {
            keyed: new Map(),
            nonKeyed: []
        };
        elementPools.set(tag, pools);
    }
    if (inferno_shared_1.isNull(key)) {
        pools.nonKeyed.push(vNode);
    }
    else {
        var pool = pools.keyed.get(key);
        if (inferno_shared_1.isUndefined(pool)) {
            pool = [];
            pools.keyed.set(key, pool);
        }
        pool.push(vNode);
    }
}
exports.poolElement = poolElement;
function recycleComponent(vNode, lifecycle, context, isSVG) {
    var type = vNode.type;
    var pools = componentPools.get(type);
    if (!inferno_shared_1.isUndefined(pools)) {
        var key = vNode.key;
        var pool = key === null ? pools.nonKeyed : pools.keyed.get(key);
        if (!inferno_shared_1.isUndefined(pool)) {
            var recycledVNode = pool.pop();
            if (!inferno_shared_1.isUndefined(recycledVNode)) {
                var flags = vNode.flags;
                var failed = patching_1.patchComponent(recycledVNode, vNode, null, lifecycle, context, isSVG, (flags & 4 /* ComponentClass */) > 0, true);
                if (!failed) {
                    return vNode.dom;
                }
            }
        }
    }
    return null;
}
exports.recycleComponent = recycleComponent;
function poolComponent(vNode) {
    var hooks = vNode.ref;
    var nonRecycleHooks = hooks && (hooks.onComponentWillMount ||
        hooks.onComponentWillUnmount ||
        hooks.onComponentDidMount ||
        hooks.onComponentWillUpdate ||
        hooks.onComponentDidUpdate);
    if (nonRecycleHooks) {
        return;
    }
    var type = vNode.type;
    var key = vNode.key;
    var pools = componentPools.get(type);
    if (inferno_shared_1.isUndefined(pools)) {
        pools = {
            keyed: new Map(),
            nonKeyed: []
        };
        componentPools.set(type, pools);
    }
    if (inferno_shared_1.isNull(key)) {
        pools.nonKeyed.push(vNode);
    }
    else {
        var pool = pools.keyed.get(key);
        if (inferno_shared_1.isUndefined(pool)) {
            pool = [];
            pools.keyed.set(key, pool);
        }
        pool.push(vNode);
    }
}
exports.poolComponent = poolComponent;


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var inferno_shared_1 = __webpack_require__(0);
var VNodes_1 = __webpack_require__(6);
function applyKey(key, vNode) {
    vNode.key = key;
    return vNode;
}
function applyKeyIfMissing(key, vNode) {
    if (inferno_shared_1.isNumber(key)) {
        key = "." + key;
    }
    if (inferno_shared_1.isNull(vNode.key) || vNode.key[0] === '.') {
        return applyKey(key, vNode);
    }
    return vNode;
}
function applyKeyPrefix(key, vNode) {
    vNode.key = key + vNode.key;
    return vNode;
}
function _normalizeVNodes(nodes, result, index, currentKey) {
    for (var len = nodes.length; index < len; index++) {
        var n = nodes[index];
        var key = currentKey + "." + index;
        if (!inferno_shared_1.isInvalid(n)) {
            if (inferno_shared_1.isArray(n)) {
                _normalizeVNodes(n, result, 0, key);
            }
            else {
                if (inferno_shared_1.isStringOrNumber(n)) {
                    n = VNodes_1.createTextVNode(n, null);
                }
                else if (VNodes_1.isVNode(n) && n.dom || (n.key && n.key[0] === '.')) {
                    n = VNodes_1.directClone(n);
                }
                if (inferno_shared_1.isNull(n.key) || n.key[0] === '.') {
                    n = applyKey(key, n);
                }
                else {
                    n = applyKeyPrefix(currentKey, n);
                }
                result.push(n);
            }
        }
    }
}
function normalizeVNodes(nodes) {
    var newNodes;
    // we assign $ which basically means we've flagged this array for future note
    // if it comes back again, we need to clone it, as people are using it
    // in an immutable way
    // tslint:disable
    if (nodes['$'] === true) {
        nodes = nodes.slice();
    }
    else {
        nodes['$'] = true;
    }
    // tslint:enable
    for (var i = 0, len = nodes.length; i < len; i++) {
        var n = nodes[i];
        if (inferno_shared_1.isInvalid(n) || inferno_shared_1.isArray(n)) {
            var result = (newNodes || nodes).slice(0, i);
            _normalizeVNodes(nodes, result, i, "");
            return result;
        }
        else if (inferno_shared_1.isStringOrNumber(n)) {
            if (!newNodes) {
                newNodes = nodes.slice(0, i);
            }
            newNodes.push(applyKeyIfMissing(i, VNodes_1.createTextVNode(n, null)));
        }
        else if ((VNodes_1.isVNode(n) && n.dom !== null) || (inferno_shared_1.isNull(n.key) && (n.flags & 64 /* HasNonKeyedChildren */) === 0)) {
            if (!newNodes) {
                newNodes = nodes.slice(0, i);
            }
            newNodes.push(applyKeyIfMissing(i, VNodes_1.directClone(n)));
        }
        else if (newNodes) {
            newNodes.push(applyKeyIfMissing(i, VNodes_1.directClone(n)));
        }
    }
    return newNodes || nodes;
}
exports.normalizeVNodes = normalizeVNodes;
function normalizeChildren(children) {
    if (inferno_shared_1.isArray(children)) {
        return normalizeVNodes(children);
    }
    else if (VNodes_1.isVNode(children) && children.dom !== null) {
        return VNodes_1.directClone(children);
    }
    return children;
}
function normalizeProps(vNode, props, children) {
    if (vNode.flags & 3970 /* Element */) {
        if (inferno_shared_1.isNullOrUndef(children) && !inferno_shared_1.isNullOrUndef(props.children)) {
            vNode.children = props.children;
        }
        if (!inferno_shared_1.isNullOrUndef(props.className)) {
            vNode.className = props.className;
            delete props.className;
        }
    }
    if (props.ref) {
        vNode.ref = props.ref;
        delete props.ref;
    }
    if (!inferno_shared_1.isNullOrUndef(props.key)) {
        vNode.key = props.key;
        delete props.key;
    }
}
function getFlagsForElementVnode(type) {
    if (type === 'svg') {
        return 128 /* SvgElement */;
    }
    else if (type === 'input') {
        return 512 /* InputElement */;
    }
    else if (type === 'select') {
        return 2048 /* SelectElement */;
    }
    else if (type === 'textarea') {
        return 1024 /* TextareaElement */;
    }
    else if (type === 'media') {
        return 256 /* MediaElement */;
    }
    return 2 /* HtmlElement */;
}
exports.getFlagsForElementVnode = getFlagsForElementVnode;
function normalize(vNode) {
    var props = vNode.props;
    var children = vNode.children;
    // convert a wrongly created type back to element
    // Primitive node doesn't have defaultProps, only Component
    if (vNode.flags & 28 /* Component */) {
        // set default props
        var type = vNode.type;
        var defaultProps = type.defaultProps;
        if (!inferno_shared_1.isNullOrUndef(defaultProps)) {
            if (!props) {
                props = vNode.props = defaultProps; // Create new object if only defaultProps given
            }
            else {
                for (var prop in defaultProps) {
                    if (inferno_shared_1.isUndefined(props[prop])) {
                        props[prop] = defaultProps[prop];
                    }
                }
            }
        }
        if (inferno_shared_1.isString(type)) {
            vNode.flags = getFlagsForElementVnode(type);
            if (props && props.children) {
                vNode.children = props.children;
                children = props.children;
            }
        }
    }
    if (props) {
        normalizeProps(vNode, props, children);
        if (!inferno_shared_1.isInvalid(props.children)) {
            props.children = normalizeChildren(props.children);
        }
    }
    if (!inferno_shared_1.isInvalid(children)) {
        vNode.children = normalizeChildren(children);
    }
    if (process.env.NODE_ENV !== 'production') {
        // This code will be stripped out from production CODE
        // It helps users to track errors in their applications.
        var verifyKeys = function (vNodes) {
            var keyValues = vNodes.map(function (vnode) {
                return vnode.key;
            });
            keyValues.some(function (item, idx) {
                var hasDuplicate = keyValues.indexOf(item) !== idx;
                if (hasDuplicate) {
                    inferno_shared_1.warning('Inferno normalisation(...): Encountered two children with same key, all keys must be unique within its siblings. Duplicated key is:' + item);
                }
                return hasDuplicate;
            });
        };
        if (vNode.children && Array.isArray(vNode.children)) {
            verifyKeys(vNode.children);
        }
    }
}
exports.normalize = normalize;


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


window.process = {
  env: { NODE_ENV: 'development' },
  browser: true,
  cwd: () => window.location.pathname.match(/^(.+?)[\\/]{1,2}.+?\.html$/)[1]
};

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(48);
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});

var _app = __webpack_require__(9);

var _app2 = _interopRequireDefault(_app);

__webpack_require__(51);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Import instance of FirebaseApp from ./app
var Storage, XMLHttpRequest;

__webpack_require__(52);
__webpack_require__(60);
var AsyncStorage;

__webpack_require__(53);
// Export the single instance of firebase
exports.default = _app2.default;
module.exports = exports['default'];
//# sourceMappingURL=firebase-browser.js.map


/***/ }),
/* 45 */
/***/ (function(module, exports) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;


/***/ }),
/* 46 */
/***/ (function(module, exports) {

module.exports = chrome;

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _process = __webpack_require__(42);

var _process2 = _interopRequireDefault(_process);

var _firebase = __webpack_require__(44);

var _firebase2 = _interopRequireDefault(_firebase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

window.debug = __webpack_require__(43)('info');

const ipc = __webpack_require__(46).ipcRenderer;
const path = __webpack_require__(45);
const React = __webpack_require__(16);
const ReactDOM = __webpack_require__(16);


const config = {
  apiKey: "AIzaSyCZFJ_UVwezRCWS3IMfGusPMZqmZsN6zdE",
  authDomain: "browser-b2ecd.firebaseapp.com",
  databaseURL: "https://browser-b2ecd.firebaseio.com",
  projectId: "browser-b2ecd",
  storageBucket: "browser-b2ecd.appspot.com",
  messagingSenderId: "427711452647"
};

class Sync extends React.Component {
  constructor(props) {
    super(props);
    _firebase2.default.initializeApp(config);
  }

  componentDidMount() {
    this.auth().then(_ => _);
  }

  auth() {
    return _asyncToGenerator(function* () {
      console.log(3);
      try {
        const result = yield _firebase2.default.auth().getRedirectResult();
        if (!result.user) {
          const provider = new _firebase2.default.auth.GoogleAuthProvider();
          _firebase2.default.auth().signInWithRedirect(provider);
        }
        const credential = result.credential;
        console.log(credential);

        fetch("/sync", {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: "POST",
          body: JSON.stringify(credential)
        }).then(function (res) {
          console.log(res);
        }).catch(function (res) {
          console.log(res);
        });

        return result;
      } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        const credential = error.credential;
        console.log(error);
      }
    })();
  }

  render() {
    return React.createElement(
      'div',
      null,
      'Login Processing...'
    );
  }

}

const App = () => React.createElement(Sync, null);

ReactDOM.render(React.createElement(App, null), document.getElementById('app'));

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = __webpack_require__(93);

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.deepCopy = deepCopy;
exports.deepExtend = deepExtend;
exports.patchProperty = patchProperty;
/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
 * Do a deep-copy of basic JavaScript Objects or Arrays.
 */
/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function deepCopy(value) {
    return deepExtend(undefined, value);
}
/**
 * Copy properties from source to target (recursively allows extension
 * of Objects and Arrays).  Scalar values in the target are over-written.
 * If target is undefined, an object of the appropriate type will be created
 * (and returned).
 *
 * We recursively copy all child properties of plain Objects in the source- so
 * that namespace- like dictionaries are merged.
 *
 * Note that the target can be a function, in which case the properties in
 * the source Object are copied onto it as static properties of the Function.
 */
function deepExtend(target, source) {
    if (!(source instanceof Object)) {
        return source;
    }
    switch (source.constructor) {
        case Date:
            return new Date(source.getTime());
            // Treat Dates like scalars; if the target date object had any child
            // properties - they will be lost!

        case Object:
            if (target === undefined) {
                target = {};
            }
            break;
        case Array:
            // Always copy the array source and overwrite the target.
            target = [];
            break;
        default:
            // Not a plain Object - treat it as a scalar.
            return source;
    }
    for (var prop in source) {
        if (!source.hasOwnProperty(prop)) {
            continue;
        }
        target[prop] = deepExtend(target[prop], source[prop]);
    }
    return target;
}
// TODO: Really needed (for JSCompiler type checking)?
function patchProperty(obj, prop, value) {
    obj[prop] = value;
}
//# sourceMappingURL=deep_copy.js.map


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Copyright 2017 Google Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * you may not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * You may obtain a copy of the License at
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *   http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * See the License for the specific language governing permissions and
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */


exports.createFirebaseNamespace = createFirebaseNamespace;

var _subscribe = __webpack_require__(28);

var _errors = __webpack_require__(17);

var _shared_promise = __webpack_require__(18);

var _deep_copy = __webpack_require__(49);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LocalPromise = _shared_promise.local.Promise;
var DEFAULT_ENTRY_NAME = '[DEFAULT]';
/**
 * Global context object for a collection of services using
 * a shared authentication state.
 */

var FirebaseAppImpl = function () {
    function FirebaseAppImpl(options, name, firebase_) {
        var _this = this;

        _classCallCheck(this, FirebaseAppImpl);

        this.firebase_ = firebase_;
        this.isDeleted_ = false;
        this.services_ = {};
        this.name_ = name;
        this.options_ = (0, _deep_copy.deepCopy)(options);
        Object.keys(firebase_.INTERNAL.factories).forEach(function (serviceName) {
            // Ignore virtual services
            var factoryName = firebase_.INTERNAL.useAsService(_this, serviceName);
            if (factoryName === null) {
                return;
            }
            // Defer calling createService until service is accessed.
            var getService = _this.getService.bind(_this, factoryName);
            (0, _deep_copy.patchProperty)(_this, serviceName, getService);
        });
    }

    _createClass(FirebaseAppImpl, [{
        key: 'delete',
        value: function _delete() {
            var _this2 = this;

            return new LocalPromise(function (resolve) {
                _this2.checkDestroyed_();
                resolve();
            }).then(function () {
                _this2.firebase_.INTERNAL.removeApp(_this2.name_);
                var services = [];
                Object.keys(_this2.services_).forEach(function (serviceKey) {
                    Object.keys(_this2.services_[serviceKey]).forEach(function (instanceKey) {
                        services.push(_this2.services_[serviceKey][instanceKey]);
                    });
                });
                return LocalPromise.all(services.map(function (service) {
                    return service.INTERNAL.delete();
                }));
            }).then(function () {
                _this2.isDeleted_ = true;
                _this2.services_ = {};
            });
        }
        /**
         * Return the service instance associated with this app (creating it
         * on demand).
         */

    }, {
        key: 'getService',
        value: function getService(name, instanceString) {
            this.checkDestroyed_();
            if (typeof this.services_[name] === 'undefined') {
                this.services_[name] = {};
            }
            var instanceSpecifier = instanceString || DEFAULT_ENTRY_NAME;
            if (typeof this.services_[name][instanceSpecifier] === 'undefined') {
                var firebaseService = this.firebase_.INTERNAL.factories[name](this, this.extendApp.bind(this), instanceString);
                this.services_[name][instanceSpecifier] = firebaseService;
                return firebaseService;
            } else {
                return this.services_[name][instanceSpecifier];
            }
        }
        /**
         * Callback function used to extend an App instance at the time
         * of service instance creation.
         */

    }, {
        key: 'extendApp',
        value: function extendApp(props) {
            (0, _deep_copy.deepExtend)(this, props);
        }
        /**
         * This function will throw an Error if the App has already been deleted -
         * use before performing API actions on the App.
         */

    }, {
        key: 'checkDestroyed_',
        value: function checkDestroyed_() {
            if (this.isDeleted_) {
                error('app-deleted', { 'name': this.name_ });
            }
        }
    }, {
        key: 'name',
        get: function get() {
            this.checkDestroyed_();
            return this.name_;
        }
    }, {
        key: 'options',
        get: function get() {
            this.checkDestroyed_();
            return this.options_;
        }
    }]);

    return FirebaseAppImpl;
}();

// Prevent dead-code elimination of these methods w/o invalid property
// copying.
FirebaseAppImpl.prototype.name && FirebaseAppImpl.prototype.options || FirebaseAppImpl.prototype.delete || console.log("dc");
/**
 * Return a firebase namespace object.
 *
 * In production, this will be called exactly once and the result
 * assigned to the 'firebase' global.  It may be called multiple times
 * in unit tests.
 */
function createFirebaseNamespace() {
    var apps_ = {};
    var factories = {};
    var appHooks = {};
    // A namespace is a plain JavaScript Object.
    var namespace = {
        // Hack to prevent Babel from modifying the object returned
        // as the firebase namespace.
        '__esModule': true,
        'initializeApp':
        /**
         * Create a new App instance (name must be unique).
         */
        function (options, name) {
            if (name === undefined) {
                name = DEFAULT_ENTRY_NAME;
            } else {
                if (typeof name !== 'string' || name === '') {
                    error('bad-app-name', { 'name': name + '' });
                }
            }
            if (apps_[name] !== undefined) {
                error('duplicate-app', { 'name': name });
            }
            var app = new FirebaseAppImpl(options, name, namespace);
            apps_[name] = app;
            callAppHooks(app, 'create');
            // Ensure that getUid, getToken, addAuthListener and removeAuthListener
            // have a default implementation if no service has patched the App
            // (i.e., Auth is not present).
            if (app.INTERNAL == undefined || app.INTERNAL.getToken == undefined) {
                (0, _deep_copy.deepExtend)(app, {
                    INTERNAL: {
                        'getUid': function getUid() {
                            return null;
                        },
                        'getToken': function getToken() {
                            return LocalPromise.resolve(null);
                        },
                        'addAuthTokenListener': function addAuthTokenListener(callback) {
                            // Make sure callback is called, asynchronously, in the absence of the auth module
                            setTimeout(function () {
                                return callback(null);
                            }, 0);
                        },
                        'removeAuthTokenListener': function removeAuthTokenListener() {}
                    }
                });
            }
            return app;
        }
        /*
         * Return an array of all the non-deleted FirebaseApps.
         */
        ,
        'app': app,
        'apps': null,
        'Promise': LocalPromise,
        'SDK_VERSION': '4.0.0',
        'INTERNAL': {
            'registerService':
            /*
             * Register a Firebase Service.
             *
             * firebase.INTERNAL.registerService()
             *
             * TODO: Implement serviceProperties.
             */
            function (name, createService, serviceProperties, appHook, allowMultipleInstances) {
                if (factories[name]) {
                    error('duplicate-service', { 'name': name });
                }
                if (!!allowMultipleInstances) {
                    // Check if the service allows multiple instances per app
                    factories[name] = createService;
                } else {
                    // If not, always return the same instance when a service is instantiated
                    // with an instanceString different than the default.
                    factories[name] = function (app, extendApp) {
                        // If a new instance is requested for a service that does not allow
                        // multiple instances, return the default instance
                        return createService(app, extendApp, DEFAULT_ENTRY_NAME);
                    };
                }
                if (appHook) {
                    appHooks[name] = appHook;
                }
                var serviceNamespace = void 0;
                // The Service namespace is an accessor function ...
                serviceNamespace = function (appArg) {
                    if (appArg === undefined) {
                        appArg = app();
                    }
                    if (typeof appArg[name] !== 'function') {
                        // Invalid argument.
                        // This happens in the following case: firebase.storage('gs:/')
                        error('invalid-app-argument', { 'name': name });
                    }
                    // Forward service instance lookup to the FirebaseApp.
                    return appArg[name]();
                };
                // ... and a container for service-level properties.
                if (serviceProperties !== undefined) {
                    (0, _deep_copy.deepExtend)(serviceNamespace, serviceProperties);
                }
                // Monkey-patch the serviceNamespace onto the firebase namespace
                namespace[name] = serviceNamespace;
                return serviceNamespace;
            }
            /**
             * Patch the top-level firebase namespace with additional properties.
             *
             * firebase.INTERNAL.extendNamespace()
             */
            ,
            'createFirebaseNamespace': createFirebaseNamespace,
            'extendNamespace': function (props) {
                (0, _deep_copy.deepExtend)(namespace, props);
            },
            'createSubscribe': _subscribe.createSubscribe,
            'ErrorFactory': _errors.ErrorFactory,
            'removeApp':
            /**
             * Called by App.delete() - but before any services associated with the App
             * are deleted.
             */
            function (name) {
                var app = apps_[name];
                callAppHooks(app, 'delete');
                delete apps_[name];
            }
            /**
             * Get the App object for a given name (or DEFAULT).
             */
            ,
            'factories': factories,
            'useAsService': useAsService,
            'Promise': _shared_promise.local.GoogPromise,
            'deepExtend': _deep_copy.deepExtend
        }
    };
    // Inject a circular default export to allow Babel users who were previously
    // using:
    //
    //   import firebase from 'firebase';
    //   which becomes: var firebase = require('firebase').default;
    //
    // instead of
    //
    //   import * as firebase from 'firebase';
    //   which becomes: var firebase = require('firebase');
    (0, _deep_copy.patchProperty)(namespace, 'default', namespace);
    // firebase.apps is a read-only getter.
    Object.defineProperty(namespace, 'apps', {
        get: function () {
            // Make a copy so caller cannot mutate the apps list.
            return Object.keys(apps_).map(function (name) {
                return apps_[name];
            });
        }
    });function app(name) {
        name = name || DEFAULT_ENTRY_NAME;
        var result = apps_[name];
        if (result === undefined) {
            error('no-app', { 'name': name });
        }
        return result;
    }
    (0, _deep_copy.patchProperty)(app, 'App', FirebaseAppImpl);
    function callAppHooks(app, eventName) {
        Object.keys(factories).forEach(function (serviceName) {
            // Ignore virtual services
            var factoryName = useAsService(app, serviceName);
            if (factoryName === null) {
                return;
            }
            if (appHooks[factoryName]) {
                appHooks[factoryName](eventName, app);
            }
        });
    }
    // Map the requested service to a registered service name
    // (used to map auth to serverAuth service when needed).
    function useAsService(app, name) {
        if (name === 'serverAuth') {
            return null;
        }
        app.options;

        return name;
    }
    return namespace;
}
function error(code, args) {
    throw appErrors.create(code, args);
}
// TypeScript does not support non-string indexes!
// let errors: {[code: AppError: string} = {
var errors = {
    'no-app': 'No Firebase App \'{$name}\' has been created - ' + 'call Firebase App.initializeApp()',
    'bad-app-name': 'Illegal App name: \'{$name}',
    'duplicate-app': 'Firebase App named \'{$name}\' already exists',
    'app-deleted': 'Firebase App named \'{$name}\' already deleted',
    'duplicate-service': 'Firebase service named \'{$name}\' already registered',
    'sa-not-supported': 'Initializing the Firebase SDK with a service ' + 'account is only allowed in a Node.js environment. On client ' + 'devices, you should instead initialize the SDK with an api key and ' + 'auth domain',
    'invalid-app-argument': 'firebase.{$name}() takes either no argument or a ' + 'Firebase App instance.'
};
var appErrors = new _errors.ErrorFactory('app', 'Firebase', errors);
//# sourceMappingURL=firebase_app.js.map


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */

var firebase = __webpack_require__(9);
(function(){(function(){var h,aa=aa||{},k=this,m=function(a){return"string"==typeof a},ba=function(a){return"boolean"==typeof a},ca=function(a){return"number"==typeof a},da=function(){},ea=function(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";
if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==b&&"undefined"==typeof a.call)return"object";return b},fa=function(a){return null===a},ga=function(a){return"array"==ea(a)},ha=function(a){var b=ea(a);return"array"==b||"object"==b&&"number"==typeof a.length},p=function(a){return"function"==ea(a)},ia=function(a){var b=typeof a;return"object"==b&&null!=a||"function"==
b},ja=function(a,b,c){return a.call.apply(a.bind,arguments)},ka=function(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}},q=function(a,b,c){q=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ja:ka;return q.apply(null,arguments)},la=function(a,b){var c=
Array.prototype.slice.call(arguments,1);return function(){var b=c.slice();b.push.apply(b,arguments);return a.apply(this,b)}},ma=Date.now||function(){return+new Date},r=function(a,b){function c(){}c.prototype=b.prototype;a.Hd=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.ag=function(a,c,f){for(var d=Array(arguments.length-2),e=2;e<arguments.length;e++)d[e-2]=arguments[e];return b.prototype[c].apply(a,d)}};var t=function(a){if(Error.captureStackTrace)Error.captureStackTrace(this,t);else{var b=Error().stack;b&&(this.stack=b)}a&&(this.message=String(a))};r(t,Error);t.prototype.name="CustomError";var na=function(a,b){for(var c=a.split("%s"),d="",e=Array.prototype.slice.call(arguments,1);e.length&&1<c.length;)d+=c.shift()+e.shift();return d+c.join("%s")},oa=String.prototype.trim?function(a){return a.trim()}:function(a){return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")},wa=function(a){if(!pa.test(a))return a;-1!=a.indexOf("&")&&(a=a.replace(qa,"&amp;"));-1!=a.indexOf("<")&&(a=a.replace(ra,"&lt;"));-1!=a.indexOf(">")&&(a=a.replace(sa,"&gt;"));-1!=a.indexOf('"')&&(a=a.replace(ta,"&quot;"));-1!=a.indexOf("'")&&
(a=a.replace(ua,"&#39;"));-1!=a.indexOf("\x00")&&(a=a.replace(va,"&#0;"));return a},qa=/&/g,ra=/</g,sa=/>/g,ta=/"/g,ua=/'/g,va=/\x00/g,pa=/[\x00&<>"']/,u=function(a,b){return-1!=a.indexOf(b)},xa=function(a,b){return a<b?-1:a>b?1:0};var ya=function(a,b){b.unshift(a);t.call(this,na.apply(null,b));b.shift()};r(ya,t);ya.prototype.name="AssertionError";
var za=function(a,b,c,d){var e="Assertion failed";if(c){e+=": "+c;var f=d}else a&&(e+=": "+a,f=b);throw new ya(""+e,f||[]);},v=function(a,b,c){a||za("",null,b,Array.prototype.slice.call(arguments,2))},Aa=function(a,b){throw new ya("Failure"+(a?": "+a:""),Array.prototype.slice.call(arguments,1));},Ba=function(a,b,c){ca(a)||za("Expected number but got %s: %s.",[ea(a),a],b,Array.prototype.slice.call(arguments,2));return a},Ca=function(a,b,c){m(a)||za("Expected string but got %s: %s.",[ea(a),a],b,Array.prototype.slice.call(arguments,
2))},Da=function(a,b,c){p(a)||za("Expected function but got %s: %s.",[ea(a),a],b,Array.prototype.slice.call(arguments,2))};var Ea=Array.prototype.indexOf?function(a,b,c){v(null!=a.length);return Array.prototype.indexOf.call(a,b,c)}:function(a,b,c){c=null==c?0:0>c?Math.max(0,a.length+c):c;if(m(a))return m(b)&&1==b.length?a.indexOf(b,c):-1;for(;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},w=Array.prototype.forEach?function(a,b,c){v(null!=a.length);Array.prototype.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=m(a)?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a)},Fa=function(a,b){for(var c=m(a)?
a.split(""):a,d=a.length-1;0<=d;--d)d in c&&b.call(void 0,c[d],d,a)},Ga=Array.prototype.map?function(a,b,c){v(null!=a.length);return Array.prototype.map.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=Array(d),f=m(a)?a.split(""):a,g=0;g<d;g++)g in f&&(e[g]=b.call(c,f[g],g,a));return e},Ha=Array.prototype.some?function(a,b,c){v(null!=a.length);return Array.prototype.some.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=m(a)?a.split(""):a,f=0;f<d;f++)if(f in e&&b.call(c,e[f],f,a))return!0;return!1},
Ja=function(a){a:{var b=Ia;for(var c=a.length,d=m(a)?a.split(""):a,e=0;e<c;e++)if(e in d&&b.call(void 0,d[e],e,a)){b=e;break a}b=-1}return 0>b?null:m(a)?a.charAt(b):a[b]},Ka=function(a,b){return 0<=Ea(a,b)},Ma=function(a,b){b=Ea(a,b);var c;(c=0<=b)&&La(a,b);return c},La=function(a,b){v(null!=a.length);return 1==Array.prototype.splice.call(a,b,1).length},Na=function(a,b){var c=0;Fa(a,function(d,e){b.call(void 0,d,e,a)&&La(a,e)&&c++})},Oa=function(a){return Array.prototype.concat.apply([],arguments)},
Pa=function(a){var b=a.length;if(0<b){for(var c=Array(b),d=0;d<b;d++)c[d]=a[d];return c}return[]};var Qa=function(a){return Ga(a,function(a){a=a.toString(16);return 1<a.length?a:"0"+a}).join("")};var Ra;a:{var Sa=k.navigator;if(Sa){var Ta=Sa.userAgent;if(Ta){Ra=Ta;break a}}Ra=""}var x=function(a){return u(Ra,a)};var Ua=function(a,b){for(var c in a)b.call(void 0,a[c],c,a)},Va=function(a){var b=[],c=0,d;for(d in a)b[c++]=a[d];return b},Wa=function(a){var b=[],c=0,d;for(d in a)b[c++]=d;return b},Xa=function(a){for(var b in a)return!1;return!0},Ya=function(a,b){for(var c in a)if(!(c in b)||a[c]!==b[c])return!1;for(c in b)if(!(c in a))return!1;return!0},Za=function(a){var b={},c;for(c in a)b[c]=a[c];return b},$a="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" "),
ab=function(a,b){for(var c,d,e=1;e<arguments.length;e++){d=arguments[e];for(c in d)a[c]=d[c];for(var f=0;f<$a.length;f++)c=$a[f],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c])}};var bb=function(a){bb[" "](a);return a};bb[" "]=da;var db=function(a,b){var c=cb;return Object.prototype.hasOwnProperty.call(c,a)?c[a]:c[a]=b(a)};var eb=x("Opera"),y=x("Trident")||x("MSIE"),fb=x("Edge"),gb=fb||y,hb=x("Gecko")&&!(u(Ra.toLowerCase(),"webkit")&&!x("Edge"))&&!(x("Trident")||x("MSIE"))&&!x("Edge"),ib=u(Ra.toLowerCase(),"webkit")&&!x("Edge"),jb=function(){var a=k.document;return a?a.documentMode:void 0},kb;
a:{var mb="",nb=function(){var a=Ra;if(hb)return/rv\:([^\);]+)(\)|;)/.exec(a);if(fb)return/Edge\/([\d\.]+)/.exec(a);if(y)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(ib)return/WebKit\/(\S+)/.exec(a);if(eb)return/(?:Version)[ \/]?(\S+)/.exec(a)}();nb&&(mb=nb?nb[1]:"");if(y){var ob=jb();if(null!=ob&&ob>parseFloat(mb)){kb=String(ob);break a}}kb=mb}
var pb=kb,cb={},z=function(a){return db(a,function(){for(var b=0,c=oa(String(pb)).split("."),d=oa(String(a)).split("."),e=Math.max(c.length,d.length),f=0;0==b&&f<e;f++){var g=c[f]||"",l=d[f]||"";do{g=/(\d*)(\D*)(.*)/.exec(g)||["","","",""];l=/(\d*)(\D*)(.*)/.exec(l)||["","","",""];if(0==g[0].length&&0==l[0].length)break;b=xa(0==g[1].length?0:parseInt(g[1],10),0==l[1].length?0:parseInt(l[1],10))||xa(0==g[2].length,0==l[2].length)||xa(g[2],l[2]);g=g[3];l=l[3]}while(0==b)}return 0<=b})},qb;var rb=k.document;
qb=rb&&y?jb()||("CSS1Compat"==rb.compatMode?parseInt(pb,10):5):void 0;var sb=null,tb=null,vb=function(a){var b="";ub(a,function(a){b+=String.fromCharCode(a)});return b},ub=function(a,b){function c(b){for(;d<a.length;){var c=a.charAt(d++),e=tb[c];if(null!=e)return e;if(!/^[\s\xa0]*$/.test(c))throw Error("Unknown base64 encoding at char: "+c);}return b}wb();for(var d=0;;){var e=c(-1),f=c(0),g=c(64),l=c(64);if(64===l&&-1===e)break;b(e<<2|f>>4);64!=g&&(b(f<<4&240|g>>2),64!=l&&b(g<<6&192|l))}},wb=function(){if(!sb){sb={};tb={};for(var a=0;65>a;a++)sb[a]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(a),
tb[sb[a]]=a,62<=a&&(tb["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.".charAt(a)]=a)}};var xb=function(){this.Ea=-1};var Ab=function(a,b){this.Ea=64;this.kc=k.Uint8Array?new Uint8Array(this.Ea):Array(this.Ea);this.Qc=this.jb=0;this.i=[];this.tf=a;this.fe=b;this.Uf=k.Int32Array?new Int32Array(64):Array(64);void 0!==yb||(yb=k.Int32Array?new Int32Array(zb):zb);this.reset()},yb;r(Ab,xb);for(var Bb=[],Cb=0;63>Cb;Cb++)Bb[Cb]=0;var Db=Oa(128,Bb);Ab.prototype.reset=function(){this.Qc=this.jb=0;this.i=k.Int32Array?new Int32Array(this.fe):Pa(this.fe)};
var Eb=function(a){var b=a.kc;v(b.length==a.Ea);for(var c=a.Uf,d=0,e=0;e<b.length;)c[d++]=b[e]<<24|b[e+1]<<16|b[e+2]<<8|b[e+3],e=4*d;for(b=16;64>b;b++){d=c[b-15]|0;e=c[b-2]|0;e=(e>>>17|e<<15)^(e>>>19|e<<13)^e>>>10;var f=(c[b-16]|0)+((d>>>7|d<<25)^(d>>>18|d<<14)^d>>>3)|0;var g=(c[b-7]|0)+e|0;c[b]=f+g|0}var d=a.i[0]|0,e=a.i[1]|0,l=a.i[2]|0,n=a.i[3]|0,C=a.i[4]|0,lb=a.i[5]|0,Tb=a.i[6]|0;f=a.i[7]|0;for(b=0;64>b;b++){var Kh=((d>>>2|d<<30)^(d>>>13|d<<19)^(d>>>22|d<<10))+(d&e^d&l^e&l)|0;g=C&lb^~C&Tb;f=f+
((C>>>6|C<<26)^(C>>>11|C<<21)^(C>>>25|C<<7))|0;g=g+(yb[b]|0)|0;g=f+(g+(c[b]|0)|0)|0;f=Tb;Tb=lb;lb=C;C=n+g|0;n=l;l=e;e=d;d=g+Kh|0}a.i[0]=a.i[0]+d|0;a.i[1]=a.i[1]+e|0;a.i[2]=a.i[2]+l|0;a.i[3]=a.i[3]+n|0;a.i[4]=a.i[4]+C|0;a.i[5]=a.i[5]+lb|0;a.i[6]=a.i[6]+Tb|0;a.i[7]=a.i[7]+f|0};
Ab.prototype.update=function(a,b){void 0===b&&(b=a.length);var c=0,d=this.jb;if(m(a))for(;c<b;)this.kc[d++]=a.charCodeAt(c++),d==this.Ea&&(Eb(this),d=0);else if(ha(a))for(;c<b;){var e=a[c++];if(!("number"==typeof e&&0<=e&&255>=e&&e==(e|0)))throw Error("message must be a byte array");this.kc[d++]=e;d==this.Ea&&(Eb(this),d=0)}else throw Error("message must be string or array");this.jb=d;this.Qc+=b};
Ab.prototype.digest=function(){var a=[],b=8*this.Qc;56>this.jb?this.update(Db,56-this.jb):this.update(Db,this.Ea-(this.jb-56));for(var c=63;56<=c;c--)this.kc[c]=b&255,b/=256;Eb(this);for(c=b=0;c<this.tf;c++)for(var d=24;0<=d;d-=8)a[b++]=this.i[c]>>d&255;return a};
var zb=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,
4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298];var Gb=function(){Ab.call(this,8,Fb)};r(Gb,Ab);var Fb=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225];var Hb=function(){this.Ha=this.Ha;this.Cc=this.Cc};Hb.prototype.Ha=!1;Hb.prototype.isDisposed=function(){return this.Ha};Hb.prototype.fb=function(){if(this.Cc)for(;this.Cc.length;)this.Cc.shift()()};var Ib=!y||9<=Number(qb),Jb=y&&!z("9");!ib||z("528");hb&&z("1.9b")||y&&z("8")||eb&&z("9.5")||ib&&z("528");hb&&!z("8")||y&&z("9");var Kb=function(a,b){this.type=a;this.currentTarget=this.target=b;this.defaultPrevented=this.pb=!1;this.ne=!0};Kb.prototype.preventDefault=function(){this.defaultPrevented=!0;this.ne=!1};var Lb=function(a,b){Kb.call(this,a?a.type:"");this.relatedTarget=this.currentTarget=this.target=null;this.button=this.screenY=this.screenX=this.clientY=this.clientX=this.offsetY=this.offsetX=0;this.key="";this.charCode=this.keyCode=0;this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1;this.gb=this.state=null;a&&this.init(a,b)};r(Lb,Kb);
Lb.prototype.init=function(a,b){var c=this.type=a.type,d=a.changedTouches?a.changedTouches[0]:null;this.target=a.target||a.srcElement;this.currentTarget=b;if(b=a.relatedTarget){if(hb){a:{try{bb(b.nodeName);var e=!0;break a}catch(f){}e=!1}e||(b=null)}}else"mouseover"==c?b=a.fromElement:"mouseout"==c&&(b=a.toElement);this.relatedTarget=b;null===d?(this.offsetX=ib||void 0!==a.offsetX?a.offsetX:a.layerX,this.offsetY=ib||void 0!==a.offsetY?a.offsetY:a.layerY,this.clientX=void 0!==a.clientX?a.clientX:a.pageX,
this.clientY=void 0!==a.clientY?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0):(this.clientX=void 0!==d.clientX?d.clientX:d.pageX,this.clientY=void 0!==d.clientY?d.clientY:d.pageY,this.screenX=d.screenX||0,this.screenY=d.screenY||0);this.button=a.button;this.keyCode=a.keyCode||0;this.key=a.key||"";this.charCode=a.charCode||("keypress"==c?a.keyCode:0);this.ctrlKey=a.ctrlKey;this.altKey=a.altKey;this.shiftKey=a.shiftKey;this.metaKey=a.metaKey;this.state=a.state;this.gb=a;a.defaultPrevented&&
this.preventDefault()};Lb.prototype.preventDefault=function(){Lb.Hd.preventDefault.call(this);var a=this.gb;if(a.preventDefault)a.preventDefault();else if(a.returnValue=!1,Jb)try{if(a.ctrlKey||112<=a.keyCode&&123>=a.keyCode)a.keyCode=-1}catch(b){}};Lb.prototype.Xe=function(){return this.gb};var Mb="closure_listenable_"+(1E6*Math.random()|0),Nb=0;var Ob=function(a,b,c,d,e){this.listener=a;this.Gc=null;this.src=b;this.type=c;this.capture=!!d;this.qc=e;this.key=++Nb;this.tb=this.jc=!1},Pb=function(a){a.tb=!0;a.listener=null;a.Gc=null;a.src=null;a.qc=null};var Qb=function(a){this.src=a;this.J={};this.ec=0};Qb.prototype.add=function(a,b,c,d,e){var f=a.toString();a=this.J[f];a||(a=this.J[f]=[],this.ec++);var g=Rb(a,b,d,e);-1<g?(b=a[g],c||(b.jc=!1)):(b=new Ob(b,this.src,f,!!d,e),b.jc=c,a.push(b));return b};Qb.prototype.remove=function(a,b,c,d){a=a.toString();if(!(a in this.J))return!1;var e=this.J[a];b=Rb(e,b,c,d);return-1<b?(Pb(e[b]),La(e,b),0==e.length&&(delete this.J[a],this.ec--),!0):!1};
var Sb=function(a,b){var c=b.type;c in a.J&&Ma(a.J[c],b)&&(Pb(b),0==a.J[c].length&&(delete a.J[c],a.ec--))};Qb.prototype.fd=function(a,b,c,d){a=this.J[a.toString()];var e=-1;a&&(e=Rb(a,b,c,d));return-1<e?a[e]:null};var Rb=function(a,b,c,d){for(var e=0;e<a.length;++e){var f=a[e];if(!f.tb&&f.listener==b&&f.capture==!!c&&f.qc==d)return e}return-1};var Ub="closure_lm_"+(1E6*Math.random()|0),Vb={},Wb=0,Xb=function(a,b,c,d,e){if(ga(b))for(var f=0;f<b.length;f++)Xb(a,b[f],c,d,e);else c=Yb(c),a&&a[Mb]?a.listen(b,c,d,e):Zb(a,b,c,!1,d,e)},Zb=function(a,b,c,d,e,f){if(!b)throw Error("Invalid event type");var g=!!e,l=$b(a);l||(a[Ub]=l=new Qb(a));c=l.add(b,c,d,e,f);if(!c.Gc){d=ac();c.Gc=d;d.src=a;d.listener=c;if(a.addEventListener)a.addEventListener(b.toString(),d,g);else if(a.attachEvent)a.attachEvent(bc(b.toString()),d);else throw Error("addEventListener and attachEvent are unavailable.");
Wb++}},ac=function(){var a=cc,b=Ib?function(c){return a.call(b.src,b.listener,c)}:function(c){c=a.call(b.src,b.listener,c);if(!c)return c};return b},dc=function(a,b,c,d,e){if(ga(b))for(var f=0;f<b.length;f++)dc(a,b[f],c,d,e);else c=Yb(c),a&&a[Mb]?ec(a,b,c,d,e):Zb(a,b,c,!0,d,e)},fc=function(a,b,c,d,e){if(ga(b))for(var f=0;f<b.length;f++)fc(a,b[f],c,d,e);else c=Yb(c),a&&a[Mb]?a.ja.remove(String(b),c,d,e):a&&(a=$b(a))&&(b=a.fd(b,c,!!d,e))&&gc(b)},gc=function(a){if(!ca(a)&&a&&!a.tb){var b=a.src;if(b&&
b[Mb])Sb(b.ja,a);else{var c=a.type,d=a.Gc;b.removeEventListener?b.removeEventListener(c,d,a.capture):b.detachEvent&&b.detachEvent(bc(c),d);Wb--;(c=$b(b))?(Sb(c,a),0==c.ec&&(c.src=null,b[Ub]=null)):Pb(a)}}},bc=function(a){return a in Vb?Vb[a]:Vb[a]="on"+a},ic=function(a,b,c,d){var e=!0;if(a=$b(a))if(b=a.J[b.toString()])for(b=b.concat(),a=0;a<b.length;a++){var f=b[a];f&&f.capture==c&&!f.tb&&(f=hc(f,d),e=e&&!1!==f)}return e},hc=function(a,b){var c=a.listener,d=a.qc||a.src;a.jc&&gc(a);return c.call(d,
b)},cc=function(a,b){if(a.tb)return!0;if(!Ib){if(!b)a:{b=["window","event"];for(var c=k,d;d=b.shift();)if(null!=c[d])c=c[d];else{b=null;break a}b=c}d=b;b=new Lb(d,this);c=!0;if(!(0>d.keyCode||void 0!=d.returnValue)){a:{var e=!1;if(0==d.keyCode)try{d.keyCode=-1;break a}catch(g){e=!0}if(e||void 0==d.returnValue)d.returnValue=!0}d=[];for(e=b.currentTarget;e;e=e.parentNode)d.push(e);for(var e=a.type,f=d.length-1;!b.pb&&0<=f;f--)b.currentTarget=d[f],a=ic(d[f],e,!0,b),c=c&&a;for(f=0;!b.pb&&f<d.length;f++)b.currentTarget=
d[f],a=ic(d[f],e,!1,b),c=c&&a}return c}return hc(a,new Lb(b,this))},$b=function(a){a=a[Ub];return a instanceof Qb?a:null},jc="__closure_events_fn_"+(1E9*Math.random()>>>0),Yb=function(a){v(a,"Listener can not be null.");if(p(a))return a;v(a.handleEvent,"An object listener must have handleEvent method.");a[jc]||(a[jc]=function(b){return a.handleEvent(b)});return a[jc]};var kc=/^[+a-zA-Z0-9_.!#$%&'*\/=?^`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,63}$/;var mc=function(){this.Mc="";this.Ee=lc};mc.prototype.Ib=!0;mc.prototype.Fb=function(){return this.Mc};mc.prototype.toString=function(){return"Const{"+this.Mc+"}"};var nc=function(a){if(a instanceof mc&&a.constructor===mc&&a.Ee===lc)return a.Mc;Aa("expected object of type Const, got '"+a+"'");return"type_error:Const"},lc={},oc=function(a){var b=new mc;b.Mc=a;return b};oc("");var qc=function(){this.Fc="";this.Fe=pc};qc.prototype.Ib=!0;qc.prototype.Fb=function(){return this.Fc};qc.prototype.toString=function(){return"TrustedResourceUrl{"+this.Fc+"}"};var pc={};var sc=function(){this.qa="";this.De=rc};sc.prototype.Ib=!0;sc.prototype.Fb=function(){return this.qa};sc.prototype.toString=function(){return"SafeUrl{"+this.qa+"}"};
var tc=function(a){if(a instanceof sc&&a.constructor===sc&&a.De===rc)return a.qa;Aa("expected object of type SafeUrl, got '"+a+"' of type "+ea(a));return"type_error:SafeUrl"},uc=/^(?:(?:https?|mailto|ftp):|[^:/?#]*(?:[/?#]|$))/i,wc=function(a){if(a instanceof sc)return a;a=a.Ib?a.Fb():String(a);uc.test(a)||(a="about:invalid#zClosurez");return vc(a)},rc={},vc=function(a){var b=new sc;b.qa=a;return b};vc("about:blank");var zc=function(a){var b=[];xc(new yc,a,b);return b.join("")},yc=function(){this.Hc=void 0},xc=function(a,b,c){if(null==b)c.push("null");else{if("object"==typeof b){if(ga(b)){var d=b;b=d.length;c.push("[");for(var e="",f=0;f<b;f++)c.push(e),e=d[f],xc(a,a.Hc?a.Hc.call(d,String(f),e):e,c),e=",";c.push("]");return}if(b instanceof String||b instanceof Number||b instanceof Boolean)b=b.valueOf();else{c.push("{");f="";for(d in b)Object.prototype.hasOwnProperty.call(b,d)&&(e=b[d],"function"!=typeof e&&(c.push(f),
Ac(d,c),c.push(":"),xc(a,a.Hc?a.Hc.call(b,d,e):e,c),f=","));c.push("}");return}}switch(typeof b){case "string":Ac(b,c);break;case "number":c.push(isFinite(b)&&!isNaN(b)?String(b):"null");break;case "boolean":c.push(String(b));break;case "function":c.push("null");break;default:throw Error("Unknown type: "+typeof b);}}},Bc={'"':'\\"',"\\":"\\\\","/":"\\/","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\u000b"},Cc=/\uffff/.test("\uffff")?/[\\\"\x00-\x1f\x7f-\uffff]/g:/[\\\"\x00-\x1f\x7f-\xff]/g,
Ac=function(a,b){b.push('"',a.replace(Cc,function(a){var b=Bc[a];b||(b="\\u"+(a.charCodeAt(0)|65536).toString(16).substr(1),Bc[a]=b);return b}),'"')};var Dc=function(){};Dc.prototype.Md=null;var Ec=function(a){return a.Md||(a.Md=a.md())};var Fc,Gc=function(){};r(Gc,Dc);Gc.prototype.lc=function(){var a=Hc(this);return a?new ActiveXObject(a):new XMLHttpRequest};Gc.prototype.md=function(){var a={};Hc(this)&&(a[0]=!0,a[1]=!0);return a};
var Hc=function(a){if(!a.ee&&"undefined"==typeof XMLHttpRequest&&"undefined"!=typeof ActiveXObject){for(var b=["MSXML2.XMLHTTP.6.0","MSXML2.XMLHTTP.3.0","MSXML2.XMLHTTP","Microsoft.XMLHTTP"],c=0;c<b.length;c++){var d=b[c];try{return new ActiveXObject(d),a.ee=d}catch(e){}}throw Error("Could not create ActiveXObject. ActiveX might be disabled, or MSXML might not be installed");}return a.ee};Fc=new Gc;var Ic=function(){};r(Ic,Dc);Ic.prototype.lc=function(){var a=new XMLHttpRequest;if("withCredentials"in a)return a;if("undefined"!=typeof XDomainRequest)return new Jc;throw Error("Unsupported browser");};Ic.prototype.md=function(){return{}};
var Jc=function(){this.va=new XDomainRequest;this.readyState=0;this.onreadystatechange=null;this.responseText="";this.status=-1;this.statusText=this.responseXML=null;this.va.onload=q(this.Ze,this);this.va.onerror=q(this.ae,this);this.va.onprogress=q(this.$e,this);this.va.ontimeout=q(this.af,this)};h=Jc.prototype;h.open=function(a,b,c){if(null!=c&&!c)throw Error("Only async requests are supported.");this.va.open(a,b)};
h.send=function(a){if(a)if("string"==typeof a)this.va.send(a);else throw Error("Only string data is supported");else this.va.send()};h.abort=function(){this.va.abort()};h.setRequestHeader=function(){};h.Ze=function(){this.status=200;this.responseText=this.va.responseText;Kc(this,4)};h.ae=function(){this.status=500;this.responseText="";Kc(this,4)};h.af=function(){this.ae()};h.$e=function(){this.status=200;Kc(this,1)};var Kc=function(a,b){a.readyState=b;if(a.onreadystatechange)a.onreadystatechange()};var Lc=function(a,b,c){this.mf=c;this.Me=a;this.Ef=b;this.Bc=0;this.rc=null};Lc.prototype.get=function(){if(0<this.Bc){this.Bc--;var a=this.rc;this.rc=a.next;a.next=null}else a=this.Me();return a};Lc.prototype.put=function(a){this.Ef(a);this.Bc<this.mf&&(this.Bc++,a.next=this.rc,this.rc=a)};var Mc=function(a){k.setTimeout(function(){throw a;},0)},Nc,Oc=function(){var a=k.MessageChannel;"undefined"===typeof a&&"undefined"!==typeof window&&window.postMessage&&window.addEventListener&&!x("Presto")&&(a=function(){var a=document.createElement("IFRAME");a.style.display="none";a.src="";document.documentElement.appendChild(a);var b=a.contentWindow,a=b.document;a.open();a.write("");a.close();var c="callImmediate"+Math.random(),d="file:"==b.location.protocol?"*":b.location.protocol+"//"+b.location.host,
a=q(function(a){if(("*"==d||a.origin==d)&&a.data==c)this.port1.onmessage()},this);b.addEventListener("message",a,!1);this.port1={};this.port2={postMessage:function(){b.postMessage(c,d)}}});if("undefined"!==typeof a&&!x("Trident")&&!x("MSIE")){var b=new a,c={},d=c;b.port1.onmessage=function(){if(void 0!==c.next){c=c.next;var a=c.Pd;c.Pd=null;a()}};return function(a){d.next={Pd:a};d=d.next;b.port2.postMessage(0)}}return"undefined"!==typeof document&&"onreadystatechange"in document.createElement("SCRIPT")?
function(a){var b=document.createElement("SCRIPT");b.onreadystatechange=function(){b.onreadystatechange=null;b.parentNode.removeChild(b);b=null;a();a=null};document.documentElement.appendChild(b)}:function(a){k.setTimeout(a,0)}};var Pc=function(){this.Vc=this.ab=null},Rc=new Lc(function(){return new Qc},function(a){a.reset()},100);Pc.prototype.add=function(a,b){var c=Rc.get();c.set(a,b);this.Vc?this.Vc.next=c:(v(!this.ab),this.ab=c);this.Vc=c};Pc.prototype.remove=function(){var a=null;this.ab&&(a=this.ab,this.ab=this.ab.next,this.ab||(this.Vc=null),a.next=null);return a};var Qc=function(){this.next=this.scope=this.ed=null};Qc.prototype.set=function(a,b){this.ed=a;this.scope=b;this.next=null};
Qc.prototype.reset=function(){this.next=this.scope=this.ed=null};var Wc=function(a,b){Sc||Tc();Uc||(Sc(),Uc=!0);Vc.add(a,b)},Sc,Tc=function(){if(-1!=String(k.Promise).indexOf("[native code]")){var a=k.Promise.resolve(void 0);Sc=function(){a.then(Xc)}}else Sc=function(){var a=Xc;!p(k.setImmediate)||k.Window&&k.Window.prototype&&!x("Edge")&&k.Window.prototype.setImmediate==k.setImmediate?(Nc||(Nc=Oc()),Nc(a)):k.setImmediate(a)}},Uc=!1,Vc=new Pc,Xc=function(){for(var a;a=Vc.remove();){try{a.ed.call(a.scope)}catch(b){Mc(b)}Rc.put(a)}Uc=!1};var Yc=!y||9<=Number(qb);!hb&&!y||y&&9<=Number(qb)||hb&&z("1.9.1");y&&z("9");var $c=function(){this.qa="";this.Ce=Zc};$c.prototype.Ib=!0;$c.prototype.Fb=function(){return this.qa};$c.prototype.toString=function(){return"SafeHtml{"+this.qa+"}"};var ad=function(a){if(a instanceof $c&&a.constructor===$c&&a.Ce===Zc)return a.qa;Aa("expected object of type SafeHtml, got '"+a+"' of type "+ea(a));return"type_error:SafeHtml"},Zc={};$c.prototype.gf=function(a){this.qa=a;return this};var bd=function(a){var b=document;return m(a)?b.getElementById(a):a},dd=function(a,b){Ua(b,function(b,d){b&&b.Ib&&(b=b.Fb());"style"==d?a.style.cssText=b:"class"==d?a.className=b:"for"==d?a.htmlFor=b:cd.hasOwnProperty(d)?a.setAttribute(cd[d],b):0==d.lastIndexOf("aria-",0)||0==d.lastIndexOf("data-",0)?a.setAttribute(d,b):a[d]=b})},cd={cellpadding:"cellPadding",cellspacing:"cellSpacing",colspan:"colSpan",frameborder:"frameBorder",height:"height",maxlength:"maxLength",nonce:"nonce",role:"role",rowspan:"rowSpan",
type:"type",usemap:"useMap",valign:"vAlign",width:"width"},fd=function(a,b,c){var d=arguments,e=document,f=String(d[0]),g=d[1];if(!Yc&&g&&(g.name||g.type)){f=["<",f];g.name&&f.push(' name="',wa(g.name),'"');if(g.type){f.push(' type="',wa(g.type),'"');var l={};ab(l,g);delete l.type;g=l}f.push(">");f=f.join("")}f=e.createElement(f);g&&(m(g)?f.className=g:ga(g)?f.className=g.join(" "):dd(f,g));2<d.length&&ed(e,f,d);return f},ed=function(a,b,c){function d(c){c&&b.appendChild(m(c)?a.createTextNode(c):
c)}for(var e=2;e<c.length;e++){var f=c[e];!ha(f)||ia(f)&&0<f.nodeType?d(f):w(gd(f)?Pa(f):f,d)}},gd=function(a){if(a&&"number"==typeof a.length){if(ia(a))return"function"==typeof a.item||"string"==typeof a.item;if(p(a))return"function"==typeof a.item}return!1};var hd=function(a){a.prototype.then=a.prototype.then;a.prototype.$goog_Thenable=!0},id=function(a){if(!a)return!1;try{return!!a.$goog_Thenable}catch(b){return!1}};var A=function(a,b){this.V=0;this.sa=void 0;this.eb=this.oa=this.u=null;this.pc=this.dd=!1;if(a!=da)try{var c=this;a.call(b,function(a){jd(c,2,a)},function(a){if(!(a instanceof kd))try{if(a instanceof Error)throw a;throw Error("Promise rejected.");}catch(e){}jd(c,3,a)})}catch(d){jd(this,3,d)}},ld=function(){this.next=this.context=this.lb=this.Pa=this.child=null;this.yb=!1};ld.prototype.reset=function(){this.context=this.lb=this.Pa=this.child=null;this.yb=!1};
var md=new Lc(function(){return new ld},function(a){a.reset()},100),nd=function(a,b,c){var d=md.get();d.Pa=a;d.lb=b;d.context=c;return d},B=function(a){if(a instanceof A)return a;var b=new A(da);jd(b,2,a);return b},D=function(a){return new A(function(b,c){c(a)})},pd=function(a,b,c){od(a,b,c,null)||Wc(la(b,a))},qd=function(a){return new A(function(b){var c=a.length,d=[];if(c)for(var e=function(a,e,f){c--;d[a]=e?{Ve:!0,value:f}:{Ve:!1,reason:f};0==c&&b(d)},f=0,g;f<a.length;f++)g=a[f],pd(g,la(e,f,!0),
la(e,f,!1));else b(d)})};A.prototype.then=function(a,b,c){null!=a&&Da(a,"opt_onFulfilled should be a function.");null!=b&&Da(b,"opt_onRejected should be a function. Did you pass opt_context as the second argument instead of the third?");return rd(this,p(a)?a:null,p(b)?b:null,c)};hd(A);var td=function(a,b){b=nd(b,b,void 0);b.yb=!0;sd(a,b);return a};A.prototype.f=function(a,b){return rd(this,null,a,b)};A.prototype.cancel=function(a){0==this.V&&Wc(function(){var b=new kd(a);ud(this,b)},this)};
var ud=function(a,b){if(0==a.V)if(a.u){var c=a.u;if(c.oa){for(var d=0,e=null,f=null,g=c.oa;g&&(g.yb||(d++,g.child==a&&(e=g),!(e&&1<d)));g=g.next)e||(f=g);e&&(0==c.V&&1==d?ud(c,b):(f?(d=f,v(c.oa),v(null!=d),d.next==c.eb&&(c.eb=d),d.next=d.next.next):vd(c),wd(c,e,3,b)))}a.u=null}else jd(a,3,b)},sd=function(a,b){a.oa||2!=a.V&&3!=a.V||xd(a);v(null!=b.Pa);a.eb?a.eb.next=b:a.oa=b;a.eb=b},rd=function(a,b,c,d){var e=nd(null,null,null);e.child=new A(function(a,g){e.Pa=b?function(c){try{var e=b.call(d,c);a(e)}catch(C){g(C)}}:
a;e.lb=c?function(b){try{var e=c.call(d,b);void 0===e&&b instanceof kd?g(b):a(e)}catch(C){g(C)}}:g});e.child.u=a;sd(a,e);return e.child};A.prototype.Rf=function(a){v(1==this.V);this.V=0;jd(this,2,a)};A.prototype.Sf=function(a){v(1==this.V);this.V=0;jd(this,3,a)};
var jd=function(a,b,c){0==a.V&&(a===c&&(b=3,c=new TypeError("Promise cannot resolve to itself")),a.V=1,od(c,a.Rf,a.Sf,a)||(a.sa=c,a.V=b,a.u=null,xd(a),3!=b||c instanceof kd||yd(a,c)))},od=function(a,b,c,d){if(a instanceof A)return null!=b&&Da(b,"opt_onFulfilled should be a function."),null!=c&&Da(c,"opt_onRejected should be a function. Did you pass opt_context as the second argument instead of the third?"),sd(a,nd(b||da,c||null,d)),!0;if(id(a))return a.then(b,c,d),!0;if(ia(a))try{var e=a.then;if(p(e))return zd(a,
e,b,c,d),!0}catch(f){return c.call(d,f),!0}return!1},zd=function(a,b,c,d,e){var f=!1,g=function(a){f||(f=!0,c.call(e,a))},l=function(a){f||(f=!0,d.call(e,a))};try{b.call(a,g,l)}catch(n){l(n)}},xd=function(a){a.dd||(a.dd=!0,Wc(a.Re,a))},vd=function(a){var b=null;a.oa&&(b=a.oa,a.oa=b.next,b.next=null);a.oa||(a.eb=null);null!=b&&v(null!=b.Pa);return b};A.prototype.Re=function(){for(var a;a=vd(this);)wd(this,a,this.V,this.sa);this.dd=!1};
var wd=function(a,b,c,d){if(3==c&&b.lb&&!b.yb)for(;a&&a.pc;a=a.u)a.pc=!1;if(b.child)b.child.u=null,Ad(b,c,d);else try{b.yb?b.Pa.call(b.context):Ad(b,c,d)}catch(e){Bd.call(null,e)}md.put(b)},Ad=function(a,b,c){2==b?a.Pa.call(a.context,c):a.lb&&a.lb.call(a.context,c)},yd=function(a,b){a.pc=!0;Wc(function(){a.pc&&Bd.call(null,b)})},Bd=Mc,kd=function(a){t.call(this,a)};r(kd,t);kd.prototype.name="cancel";
var Cd=function(a,b){this.Jc=[];this.je=a;this.Td=b||null;this.Gb=this.hb=!1;this.sa=void 0;this.Ed=this.Kd=this.Zc=!1;this.Rc=0;this.u=null;this.$c=0};Cd.prototype.cancel=function(a){if(this.hb)this.sa instanceof Cd&&this.sa.cancel();else{if(this.u){var b=this.u;delete this.u;a?b.cancel(a):(b.$c--,0>=b.$c&&b.cancel())}this.je?this.je.call(this.Td,this):this.Ed=!0;this.hb||Dd(this,new Ed)}};Cd.prototype.Rd=function(a,b){this.Zc=!1;Fd(this,a,b)};
var Fd=function(a,b,c){a.hb=!0;a.sa=c;a.Gb=!b;Gd(a)},Id=function(a){if(a.hb){if(!a.Ed)throw new Hd;a.Ed=!1}};Cd.prototype.callback=function(a){Id(this);Jd(a);Fd(this,!0,a)};
var Dd=function(a,b){Id(a);Jd(b);Fd(a,!1,b)},Jd=function(a){v(!(a instanceof Cd),"An execution sequence may not be initiated with a blocking Deferred.")},Nd=function(a){var b=Kd("https://apis.google.com/js/client.js?onload="+Ld);Md(b,null,a,void 0)},Md=function(a,b,c,d){v(!a.Kd,"Blocking Deferreds can not be re-used");a.Jc.push([b,c,d]);a.hb&&Gd(a)};Cd.prototype.then=function(a,b,c){var d,e,f=new A(function(a,b){d=a;e=b});Md(this,d,function(a){a instanceof Ed?f.cancel():e(a)});return f.then(a,b,c)};
hd(Cd);
var Od=function(a){return Ha(a.Jc,function(a){return p(a[1])})},Gd=function(a){if(a.Rc&&a.hb&&Od(a)){var b=a.Rc,c=Pd[b];c&&(k.clearTimeout(c.Hb),delete Pd[b]);a.Rc=0}a.u&&(a.u.$c--,delete a.u);for(var b=a.sa,d=c=!1;a.Jc.length&&!a.Zc;){var e=a.Jc.shift(),f=e[0],g=e[1],e=e[2];if(f=a.Gb?g:f)try{var l=f.call(e||a.Td,b);void 0!==l&&(a.Gb=a.Gb&&(l==b||l instanceof Error),a.sa=b=l);if(id(b)||"function"===typeof k.Promise&&b instanceof k.Promise)d=!0,a.Zc=!0}catch(n){b=n,a.Gb=!0,Od(a)||(c=!0)}}a.sa=b;d&&
(l=q(a.Rd,a,!0),d=q(a.Rd,a,!1),b instanceof Cd?(Md(b,l,d),b.Kd=!0):b.then(l,d));c&&(b=new Qd(b),Pd[b.Hb]=b,a.Rc=b.Hb)},Hd=function(){t.call(this)};r(Hd,t);Hd.prototype.message="Deferred has already fired";Hd.prototype.name="AlreadyCalledError";var Ed=function(){t.call(this)};r(Ed,t);Ed.prototype.message="Deferred was canceled";Ed.prototype.name="CanceledError";var Qd=function(a){this.Hb=k.setTimeout(q(this.Qf,this),0);this.W=a};
Qd.prototype.Qf=function(){v(Pd[this.Hb],"Cannot throw an error that is not scheduled.");delete Pd[this.Hb];throw this.W;};var Pd={};var Kd=function(a){var b=new qc;b.Fc=a;return Rd(b)},Rd=function(a){var b={},c=b.document||document;if(a instanceof qc&&a.constructor===qc&&a.Fe===pc)var d=a.Fc;else Aa("expected object of type TrustedResourceUrl, got '"+a+"' of type "+ea(a)),d="type_error:TrustedResourceUrl";var e=document.createElement("SCRIPT");a={oe:e,dc:void 0};var f=new Cd(Sd,a),g=null,l=null!=b.timeout?b.timeout:5E3;0<l&&(g=window.setTimeout(function(){Td(e,!0);Dd(f,new Ud(1,"Timeout reached for loading script "+d))},l),a.dc=
g);e.onload=e.onreadystatechange=function(){e.readyState&&"loaded"!=e.readyState&&"complete"!=e.readyState||(Td(e,b.bg||!1,g),f.callback(null))};e.onerror=function(){Td(e,!0,g);Dd(f,new Ud(0,"Error while loading script "+d))};a=b.attributes||{};ab(a,{type:"text/javascript",charset:"UTF-8",src:d});dd(e,a);Vd(c).appendChild(e);return f},Vd=function(a){var b;return(b=(a||document).getElementsByTagName("HEAD"))&&0!=b.length?b[0]:a.documentElement},Sd=function(){if(this&&this.oe){var a=this.oe;a&&"SCRIPT"==
a.tagName&&Td(a,!0,this.dc)}},Td=function(a,b,c){null!=c&&k.clearTimeout(c);a.onload=da;a.onerror=da;a.onreadystatechange=da;b&&window.setTimeout(function(){a&&a.parentNode&&a.parentNode.removeChild(a)},0)},Ud=function(a,b){var c="Jsloader error (code #"+a+")";b&&(c+=": "+b);t.call(this,c);this.code=a};r(Ud,t);var Wd=function(a,b,c,d,e){this.reset(a,b,c,d,e)};Wd.prototype.Vd=null;var Xd=0;Wd.prototype.reset=function(a,b,c,d,e){"number"==typeof e||Xd++;d||ma();this.Nb=a;this.qf=b;delete this.Vd};Wd.prototype.re=function(a){this.Nb=a};var Yd=function(a){this.rf=a;this.be=this.ad=this.Nb=this.u=null},Zd=function(a,b){this.name=a;this.value=b};Zd.prototype.toString=function(){return this.name};var $d=new Zd("SEVERE",1E3),ae=new Zd("CONFIG",700),be=new Zd("FINE",500);Yd.prototype.getParent=function(){return this.u};Yd.prototype.re=function(a){this.Nb=a};var ce=function(a){if(a.Nb)return a.Nb;if(a.u)return ce(a.u);Aa("Root logger has no level set.");return null};
Yd.prototype.log=function(a,b,c){if(a.value>=ce(this).value)for(p(b)&&(b=b()),a=new Wd(a,String(b),this.rf),c&&(a.Vd=c),c="log:"+a.qf,k.console&&(k.console.timeStamp?k.console.timeStamp(c):k.console.markTimeline&&k.console.markTimeline(c)),k.msWriteProfilerMark&&k.msWriteProfilerMark(c),c=this;c;){var d=c,e=a;if(d.be)for(var f=0;b=d.be[f];f++)b(e);c=c.getParent()}};
var de={},ee=null,fe=function(a){ee||(ee=new Yd(""),de[""]=ee,ee.re(ae));var b;if(!(b=de[a])){b=new Yd(a);var c=a.lastIndexOf("."),d=a.substr(c+1),c=fe(a.substr(0,c));c.ad||(c.ad={});c.ad[d]=b;b.u=c;de[a]=b}return b};var ge=function(){Hb.call(this);this.ja=new Qb(this);this.He=this;this.rd=null};r(ge,Hb);ge.prototype[Mb]=!0;h=ge.prototype;h.addEventListener=function(a,b,c,d){Xb(this,a,b,c,d)};h.removeEventListener=function(a,b,c,d){fc(this,a,b,c,d)};
h.dispatchEvent=function(a){he(this);var b=this.rd;if(b){var c=[];for(var d=1;b;b=b.rd)c.push(b),v(1E3>++d,"infinite loop")}b=this.He;d=a.type||a;if(m(a))a=new Kb(a,b);else if(a instanceof Kb)a.target=a.target||b;else{var e=a;a=new Kb(d,b);ab(a,e)}var e=!0;if(c)for(var f=c.length-1;!a.pb&&0<=f;f--){var g=a.currentTarget=c[f];e=ie(g,d,!0,a)&&e}a.pb||(g=a.currentTarget=b,e=ie(g,d,!0,a)&&e,a.pb||(e=ie(g,d,!1,a)&&e));if(c)for(f=0;!a.pb&&f<c.length;f++)g=a.currentTarget=c[f],e=ie(g,d,!1,a)&&e;return e};
h.fb=function(){ge.Hd.fb.call(this);if(this.ja){var a=this.ja,b=0,c;for(c in a.J){for(var d=a.J[c],e=0;e<d.length;e++)++b,Pb(d[e]);delete a.J[c];a.ec--}}this.rd=null};h.listen=function(a,b,c,d){he(this);return this.ja.add(String(a),b,!1,c,d)};
var ec=function(a,b,c,d,e){a.ja.add(String(b),c,!0,d,e)},ie=function(a,b,c,d){b=a.ja.J[String(b)];if(!b)return!0;b=b.concat();for(var e=!0,f=0;f<b.length;++f){var g=b[f];if(g&&!g.tb&&g.capture==c){var l=g.listener,n=g.qc||g.src;g.jc&&Sb(a.ja,g);e=!1!==l.call(n,d)&&e}}return e&&0!=d.ne};ge.prototype.fd=function(a,b,c,d){return this.ja.fd(String(a),b,c,d)};var he=function(a){v(a.ja,"Event target is not initialized. Did you call the superclass (goog.events.EventTarget) constructor?")};var je="StopIteration"in k?k.StopIteration:{message:"StopIteration",stack:""},ke=function(){};ke.prototype.next=function(){throw je;};ke.prototype.Ge=function(){return this};var E=function(a,b){a&&a.log(be,b,void 0)};var le=function(a,b){this.ea={};this.A=[];this.$a=this.o=0;var c=arguments.length;if(1<c){if(c%2)throw Error("Uneven number of arguments");for(var d=0;d<c;d+=2)this.set(arguments[d],arguments[d+1])}else a&&this.addAll(a)};h=le.prototype;h.ca=function(){me(this);for(var a=[],b=0;b<this.A.length;b++)a.push(this.ea[this.A[b]]);return a};h.pa=function(){me(this);return this.A.concat()};h.Ab=function(a){return ne(this.ea,a)};h.clear=function(){this.ea={};this.$a=this.o=this.A.length=0};
h.remove=function(a){return ne(this.ea,a)?(delete this.ea[a],this.o--,this.$a++,this.A.length>2*this.o&&me(this),!0):!1};var me=function(a){var b,c;if(a.o!=a.A.length){for(b=c=0;c<a.A.length;){var d=a.A[c];ne(a.ea,d)&&(a.A[b++]=d);c++}a.A.length=b}if(a.o!=a.A.length){var e={};for(b=c=0;c<a.A.length;)d=a.A[c],ne(e,d)||(a.A[b++]=d,e[d]=1),c++;a.A.length=b}};h=le.prototype;h.get=function(a,b){return ne(this.ea,a)?this.ea[a]:b};
h.set=function(a,b){ne(this.ea,a)||(this.o++,this.A.push(a),this.$a++);this.ea[a]=b};h.addAll=function(a){if(a instanceof le){var b=a.pa();a=a.ca()}else b=Wa(a),a=Va(a);for(var c=0;c<b.length;c++)this.set(b[c],a[c])};h.forEach=function(a,b){for(var c=this.pa(),d=0;d<c.length;d++){var e=c[d],f=this.get(e);a.call(b,f,e,this)}};h.clone=function(){return new le(this)};
h.Ge=function(a){me(this);var b=0,c=this.$a,d=this,e=new ke;e.next=function(){if(c!=d.$a)throw Error("The map has changed since the iterator was created");if(b>=d.A.length)throw je;var e=d.A[b++];return a?e:d.ea[e]};return e};var ne=function(a,b){return Object.prototype.hasOwnProperty.call(a,b)};var oe=function(a){if(a.ca&&"function"==typeof a.ca)return a.ca();if(m(a))return a.split("");if(ha(a)){for(var b=[],c=a.length,d=0;d<c;d++)b.push(a[d]);return b}return Va(a)},pe=function(a){if(a.pa&&"function"==typeof a.pa)return a.pa();if(!a.ca||"function"!=typeof a.ca){if(ha(a)||m(a)){var b=[];a=a.length;for(var c=0;c<a;c++)b.push(c);return b}return Wa(a)}},qe=function(a,b){if(a.forEach&&"function"==typeof a.forEach)a.forEach(b,void 0);else if(ha(a)||m(a))w(a,b,void 0);else for(var c=pe(a),d=oe(a),
e=d.length,f=0;f<e;f++)b.call(void 0,d[f],c&&c[f],a)};var re=function(a,b,c){if(p(a))c&&(a=q(a,c));else if(a&&"function"==typeof a.handleEvent)a=q(a.handleEvent,a);else throw Error("Invalid listener argument");return 2147483647<Number(b)?-1:k.setTimeout(a,b||0)},se=function(a){var b=null;return(new A(function(c,d){b=re(function(){c(void 0)},a);-1==b&&d(Error("Failed to schedule timer."))})).f(function(a){k.clearTimeout(b);throw a;})};var te=/^(?:([^:/?#.]+):)?(?:\/\/(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\?([^#]*))?(?:#([\s\S]*))?$/,ue=function(a,b){if(a){a=a.split("&");for(var c=0;c<a.length;c++){var d=a[c].indexOf("="),e=null;if(0<=d){var f=a[c].substring(0,d);e=a[c].substring(d+1)}else f=a[c];b(f,e?decodeURIComponent(e.replace(/\+/g," ")):"")}}};var F=function(a){ge.call(this);this.headers=new le;this.Xc=a||null;this.wa=!1;this.Wc=this.c=null;this.Mb=this.ie=this.yc="";this.La=this.kd=this.uc=this.cd=!1;this.ub=0;this.Oc=null;this.Ic="";this.Sc=this.Af=this.Be=!1};r(F,ge);var ve=F.prototype,we=fe("goog.net.XhrIo");ve.K=we;var xe=/^https?$/i,ye=["POST","PUT"];
F.prototype.send=function(a,b,c,d){if(this.c)throw Error("[goog.net.XhrIo] Object is active with another request="+this.yc+"; newUri="+a);b=b?b.toUpperCase():"GET";this.yc=a;this.Mb="";this.ie=b;this.cd=!1;this.wa=!0;this.c=this.Xc?this.Xc.lc():Fc.lc();this.Wc=this.Xc?Ec(this.Xc):Ec(Fc);this.c.onreadystatechange=q(this.le,this);this.Af&&"onprogress"in this.c&&(this.c.onprogress=q(function(a){this.ke(a,!0)},this),this.c.upload&&(this.c.upload.onprogress=q(this.ke,this)));try{E(this.K,ze(this,"Opening Xhr")),
this.kd=!0,this.c.open(b,String(a),!0),this.kd=!1}catch(f){E(this.K,ze(this,"Error opening Xhr: "+f.message));this.W(5,f);return}a=c||"";var e=this.headers.clone();d&&qe(d,function(a,b){e.set(b,a)});d=Ja(e.pa());c=k.FormData&&a instanceof k.FormData;!Ka(ye,b)||d||c||e.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");e.forEach(function(a,b){this.c.setRequestHeader(b,a)},this);this.Ic&&(this.c.responseType=this.Ic);"withCredentials"in this.c&&this.c.withCredentials!==this.Be&&(this.c.withCredentials=
this.Be);try{Ae(this),0<this.ub&&(this.Sc=Be(this.c),E(this.K,ze(this,"Will abort after "+this.ub+"ms if incomplete, xhr2 "+this.Sc)),this.Sc?(this.c.timeout=this.ub,this.c.ontimeout=q(this.dc,this)):this.Oc=re(this.dc,this.ub,this)),E(this.K,ze(this,"Sending request")),this.uc=!0,this.c.send(a),this.uc=!1}catch(f){E(this.K,ze(this,"Send error: "+f.message)),this.W(5,f)}};var Be=function(a){return y&&z(9)&&ca(a.timeout)&&void 0!==a.ontimeout},Ia=function(a){return"content-type"==a.toLowerCase()};
F.prototype.dc=function(){"undefined"!=typeof aa&&this.c&&(this.Mb="Timed out after "+this.ub+"ms, aborting",E(this.K,ze(this,this.Mb)),this.dispatchEvent("timeout"),this.abort(8))};F.prototype.W=function(a,b){this.wa=!1;this.c&&(this.La=!0,this.c.abort(),this.La=!1);this.Mb=b;Ce(this);De(this)};var Ce=function(a){a.cd||(a.cd=!0,a.dispatchEvent("complete"),a.dispatchEvent("error"))};
F.prototype.abort=function(){this.c&&this.wa&&(E(this.K,ze(this,"Aborting")),this.wa=!1,this.La=!0,this.c.abort(),this.La=!1,this.dispatchEvent("complete"),this.dispatchEvent("abort"),De(this))};F.prototype.fb=function(){this.c&&(this.wa&&(this.wa=!1,this.La=!0,this.c.abort(),this.La=!1),De(this,!0));F.Hd.fb.call(this)};F.prototype.le=function(){this.isDisposed()||(this.kd||this.uc||this.La?Ee(this):this.vf())};F.prototype.vf=function(){Ee(this)};
var Ee=function(a){if(a.wa&&"undefined"!=typeof aa)if(a.Wc[1]&&4==Fe(a)&&2==Ge(a))E(a.K,ze(a,"Local request error detected and ignored"));else if(a.uc&&4==Fe(a))re(a.le,0,a);else if(a.dispatchEvent("readystatechange"),4==Fe(a)){E(a.K,ze(a,"Request complete"));a.wa=!1;try{var b=Ge(a);a:switch(b){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var c=!0;break a;default:c=!1}var d;if(!(d=c)){var e;if(e=0===b){var f=String(a.yc).match(te)[1]||null;if(!f&&k.self&&k.self.location)var g=k.self.location.protocol,
f=g.substr(0,g.length-1);e=!xe.test(f?f.toLowerCase():"")}d=e}if(d)a.dispatchEvent("complete"),a.dispatchEvent("success");else{try{var l=2<Fe(a)?a.c.statusText:""}catch(n){E(a.K,"Can not get status: "+n.message),l=""}a.Mb=l+" ["+Ge(a)+"]";Ce(a)}}finally{De(a)}}};F.prototype.ke=function(a,b){v("progress"===a.type,"goog.net.EventType.PROGRESS is of the same type as raw XHR progress.");this.dispatchEvent(He(a,"progress"));this.dispatchEvent(He(a,b?"downloadprogress":"uploadprogress"))};
var He=function(a,b){return{type:b,lengthComputable:a.lengthComputable,loaded:a.loaded,total:a.total}},De=function(a,b){if(a.c){Ae(a);var c=a.c,d=a.Wc[0]?da:null;a.c=null;a.Wc=null;b||a.dispatchEvent("ready");try{c.onreadystatechange=d}catch(e){(a=a.K)&&a.log($d,"Problem encountered resetting onreadystatechange: "+e.message,void 0)}}},Ae=function(a){a.c&&a.Sc&&(a.c.ontimeout=null);ca(a.Oc)&&(k.clearTimeout(a.Oc),a.Oc=null)},Fe=function(a){return a.c?a.c.readyState:0},Ge=function(a){try{return 2<Fe(a)?
a.c.status:-1}catch(b){return-1}},Ie=function(a){try{return a.c?a.c.responseText:""}catch(b){return E(a.K,"Can not get responseText: "+b.message),""}};
F.prototype.getResponse=function(){try{if(!this.c)return null;if("response"in this.c)return this.c.response;switch(this.Ic){case "":case "text":return this.c.responseText;case "arraybuffer":if("mozResponseArrayBuffer"in this.c)return this.c.mozResponseArrayBuffer}var a=this.K;a&&a.log($d,"Response type "+this.Ic+" is not supported on this browser",void 0);return null}catch(b){return E(this.K,"Can not get response: "+b.message),null}};var ze=function(a,b){return b+" ["+a.ie+" "+a.yc+" "+Ge(a)+"]"};var G=function(a,b){this.ia=this.Ya=this.ka="";this.nb=null;this.Ka=this.za="";this.Y=this.lf=!1;if(a instanceof G){this.Y=void 0!==b?b:a.Y;Je(this,a.ka);var c=a.Ya;H(this);this.Ya=c;Ke(this,a.ia);Le(this,a.nb);Me(this,a.za);Ne(this,a.aa.clone());a=a.Ka;H(this);this.Ka=a}else a&&(c=String(a).match(te))?(this.Y=!!b,Je(this,c[1]||"",!0),a=c[2]||"",H(this),this.Ya=Oe(a),Ke(this,c[3]||"",!0),Le(this,c[4]),Me(this,c[5]||"",!0),Ne(this,c[6]||"",!0),a=c[7]||"",H(this),this.Ka=Oe(a)):(this.Y=!!b,this.aa=
new I(null,0,this.Y))};G.prototype.toString=function(){var a=[],b=this.ka;b&&a.push(Pe(b,Qe,!0),":");var c=this.ia;if(c||"file"==b)a.push("//"),(b=this.Ya)&&a.push(Pe(b,Qe,!0),"@"),a.push(encodeURIComponent(String(c)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),c=this.nb,null!=c&&a.push(":",String(c));if(c=this.za)this.ia&&"/"!=c.charAt(0)&&a.push("/"),a.push(Pe(c,"/"==c.charAt(0)?Re:Se,!0));(c=this.aa.toString())&&a.push("?",c);(c=this.Ka)&&a.push("#",Pe(c,Te));return a.join("")};
G.prototype.resolve=function(a){var b=this.clone(),c=!!a.ka;c?Je(b,a.ka):c=!!a.Ya;if(c){var d=a.Ya;H(b);b.Ya=d}else c=!!a.ia;c?Ke(b,a.ia):c=null!=a.nb;d=a.za;if(c)Le(b,a.nb);else if(c=!!a.za){if("/"!=d.charAt(0))if(this.ia&&!this.za)d="/"+d;else{var e=b.za.lastIndexOf("/");-1!=e&&(d=b.za.substr(0,e+1)+d)}e=d;if(".."==e||"."==e)d="";else if(u(e,"./")||u(e,"/.")){for(var d=0==e.lastIndexOf("/",0),e=e.split("/"),f=[],g=0;g<e.length;){var l=e[g++];"."==l?d&&g==e.length&&f.push(""):".."==l?((1<f.length||
1==f.length&&""!=f[0])&&f.pop(),d&&g==e.length&&f.push("")):(f.push(l),d=!0)}d=f.join("/")}else d=e}c?Me(b,d):c=""!==a.aa.toString();c?Ne(b,a.aa.clone()):c=!!a.Ka;c&&(a=a.Ka,H(b),b.Ka=a);return b};G.prototype.clone=function(){return new G(this)};
var Je=function(a,b,c){H(a);a.ka=c?Oe(b,!0):b;a.ka&&(a.ka=a.ka.replace(/:$/,""))},Ke=function(a,b,c){H(a);a.ia=c?Oe(b,!0):b},Le=function(a,b){H(a);if(b){b=Number(b);if(isNaN(b)||0>b)throw Error("Bad port number "+b);a.nb=b}else a.nb=null},Me=function(a,b,c){H(a);a.za=c?Oe(b,!0):b},Ne=function(a,b,c){H(a);b instanceof I?(a.aa=b,a.aa.Cd(a.Y)):(c||(b=Pe(b,Ue)),a.aa=new I(b,0,a.Y))},J=function(a,b,c){H(a);a.aa.set(b,c)},Ve=function(a,b){return a.aa.get(b)};
G.prototype.removeParameter=function(a){H(this);this.aa.remove(a);return this};var H=function(a){if(a.lf)throw Error("Tried to modify a read-only Uri");};G.prototype.Cd=function(a){this.Y=a;this.aa&&this.aa.Cd(a);return this};
var We=function(a){return a instanceof G?a.clone():new G(a,void 0)},Xe=function(a,b){var c=new G(null,void 0);Je(c,"https");a&&Ke(c,a);b&&Me(c,b);return c},Oe=function(a,b){return a?b?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""},Pe=function(a,b,c){return m(a)?(a=encodeURI(a).replace(b,Ye),c&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null},Ye=function(a){a=a.charCodeAt(0);return"%"+(a>>4&15).toString(16)+(a&15).toString(16)},Qe=/[#\/\?@]/g,Se=/[\#\?:]/g,Re=/[\#\?]/g,Ue=/[\#\?@]/g,
Te=/#/g,I=function(a,b,c){this.o=this.j=null;this.P=a||null;this.Y=!!c},Ze=function(a){a.j||(a.j=new le,a.o=0,a.P&&ue(a.P,function(b,c){a.add(decodeURIComponent(b.replace(/\+/g," ")),c)}))},af=function(a){var b=pe(a);if("undefined"==typeof b)throw Error("Keys are undefined");var c=new I(null,0,void 0);a=oe(a);for(var d=0;d<b.length;d++){var e=b[d],f=a[d];ga(f)?$e(c,e,f):c.add(e,f)}return c};h=I.prototype;
h.add=function(a,b){Ze(this);this.P=null;a=this.X(a);var c=this.j.get(a);c||this.j.set(a,c=[]);c.push(b);this.o=Ba(this.o)+1;return this};h.remove=function(a){Ze(this);a=this.X(a);return this.j.Ab(a)?(this.P=null,this.o=Ba(this.o)-this.j.get(a).length,this.j.remove(a)):!1};h.clear=function(){this.j=this.P=null;this.o=0};h.Ab=function(a){Ze(this);a=this.X(a);return this.j.Ab(a)};h.forEach=function(a,b){Ze(this);this.j.forEach(function(c,d){w(c,function(c){a.call(b,c,d,this)},this)},this)};
h.pa=function(){Ze(this);for(var a=this.j.ca(),b=this.j.pa(),c=[],d=0;d<b.length;d++)for(var e=a[d],f=0;f<e.length;f++)c.push(b[d]);return c};h.ca=function(a){Ze(this);var b=[];if(m(a))this.Ab(a)&&(b=Oa(b,this.j.get(this.X(a))));else{a=this.j.ca();for(var c=0;c<a.length;c++)b=Oa(b,a[c])}return b};h.set=function(a,b){Ze(this);this.P=null;a=this.X(a);this.Ab(a)&&(this.o=Ba(this.o)-this.j.get(a).length);this.j.set(a,[b]);this.o=Ba(this.o)+1;return this};
h.get=function(a,b){a=a?this.ca(a):[];return 0<a.length?String(a[0]):b};var $e=function(a,b,c){a.remove(b);0<c.length&&(a.P=null,a.j.set(a.X(b),Pa(c)),a.o=Ba(a.o)+c.length)};I.prototype.toString=function(){if(this.P)return this.P;if(!this.j)return"";for(var a=[],b=this.j.pa(),c=0;c<b.length;c++)for(var d=b[c],e=encodeURIComponent(String(d)),d=this.ca(d),f=0;f<d.length;f++){var g=e;""!==d[f]&&(g+="="+encodeURIComponent(String(d[f])));a.push(g)}return this.P=a.join("&")};
I.prototype.clone=function(){var a=new I;a.P=this.P;this.j&&(a.j=this.j.clone(),a.o=this.o);return a};I.prototype.X=function(a){a=String(a);this.Y&&(a=a.toLowerCase());return a};I.prototype.Cd=function(a){a&&!this.Y&&(Ze(this),this.P=null,this.j.forEach(function(a,c){var b=c.toLowerCase();c!=b&&(this.remove(c),$e(this,b,a))},this));this.Y=a};var bf=function(){var a=K();return y&&!!qb&&11==qb||/Edge\/\d+/.test(a)},cf=function(){return k.window&&k.window.location.href||""},df=function(a,b){b=b||k.window;var c="about:blank";a&&(c=tc(wc(a)));b.location.href=c},ef=function(a,b){var c=[],d;for(d in a)d in b?typeof a[d]!=typeof b[d]?c.push(d):ga(a[d])?Ya(a[d],b[d])||c.push(d):"object"==typeof a[d]&&null!=a[d]&&null!=b[d]?0<ef(a[d],b[d]).length&&c.push(d):a[d]!==b[d]&&c.push(d):c.push(d);for(d in b)d in a||c.push(d);return c},gf=function(){var a=
K();a="Chrome"!=ff(a)?null:(a=a.match(/\sChrome\/(\d+)/i))&&2==a.length?parseInt(a[1],10):null;return a&&30>a?!1:!y||!qb||9<qb},hf=function(a){a=(a||K()).toLowerCase();return a.match(/android/)||a.match(/webos/)||a.match(/iphone|ipad|ipod/)||a.match(/blackberry/)||a.match(/windows phone/)||a.match(/iemobile/)?!0:!1},jf=function(a){a=a||k.window;try{a.close()}catch(b){}},kf=function(a,b,c){var d=Math.floor(1E9*Math.random()).toString();b=b||500;c=c||600;var e=(window.screen.availHeight-c)/2,f=(window.screen.availWidth-
b)/2;b={width:b,height:c,top:0<e?e:0,left:0<f?f:0,location:!0,resizable:!0,statusbar:!0,toolbar:!1};c=K().toLowerCase();d&&(b.target=d,u(c,"crios/")&&(b.target="_blank"));"Firefox"==ff(K())&&(a=a||"http://localhost",b.scrollbars=!0);c=a||"about:blank";(d=b)||(d={});a=window;b=c instanceof sc?c:wc("undefined"!=typeof c.href?c.href:String(c));c=d.target||c.target;e=[];for(g in d)switch(g){case "width":case "height":case "top":case "left":e.push(g+"="+d[g]);break;case "target":case "noreferrer":break;
default:e.push(g+"="+(d[g]?1:0))}var g=e.join(",");(x("iPhone")&&!x("iPod")&&!x("iPad")||x("iPad")||x("iPod"))&&a.navigator&&a.navigator.standalone&&c&&"_self"!=c?(g=a.document.createElement("A"),"undefined"!=typeof HTMLAnchorElement&&"undefined"!=typeof Location&&"undefined"!=typeof Element&&(e=g&&(g instanceof HTMLAnchorElement||!(g instanceof Location||g instanceof Element)),f=ia(g)?g.constructor.displayName||g.constructor.name||Object.prototype.toString.call(g):void 0===g?"undefined":null===g?
"null":typeof g,v(e,"Argument is not a HTMLAnchorElement (or a non-Element mock); got: %s",f)),b=b instanceof sc?b:wc(b),g.href=tc(b),g.setAttribute("target",c),d.noreferrer&&g.setAttribute("rel","noreferrer"),d=document.createEvent("MouseEvent"),d.initMouseEvent("click",!0,!0,a,1),g.dispatchEvent(d),g={}):d.noreferrer?(g=a.open("",c,g),d=tc(b),g&&(gb&&u(d,";")&&(d="'"+d.replace(/'/g,"%27")+"'"),g.opener=null,a=oc("b/12014412, meta tag with sanitized URL"),d='<META HTTP-EQUIV="refresh" content="0; url='+
wa(d)+'">',Ca(nc(a),"must provide justification"),v(!/^[\s\xa0]*$/.test(nc(a)),"must provide non-empty justification"),g.document.write(ad((new $c).gf(d))),g.document.close())):g=a.open(tc(b),c,g);if(g)try{g.focus()}catch(l){}return g},lf=function(a){return new A(function(b){var c=function(){se(2E3).then(function(){if(!a||a.closed)b();else return c()})};return c()})},mf=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,nf=function(){var a=null;return(new A(function(b){"complete"==k.document.readyState?b():(a=
function(){b()},dc(window,"load",a))})).f(function(b){fc(window,"load",a);throw b;})},pf=function(){return of(void 0)?nf().then(function(){return new A(function(a,b){var c=k.document,d=setTimeout(function(){b(Error("Cordova framework is not ready."))},1E3);c.addEventListener("deviceready",function(){clearTimeout(d);a()},!1)})}):D(Error("Cordova must run in an Android or iOS file scheme."))},of=function(a){a=a||K();return!("file:"!==qf()||!a.toLowerCase().match(/iphone|ipad|ipod|android/))},rf=function(){var a=
k.window;try{return!(!a||a==a.top)}catch(b){return!1}},sf=function(){return firebase.INTERNAL.hasOwnProperty("reactNative")?"ReactNative":firebase.INTERNAL.hasOwnProperty("node")?"Node":"Browser"},tf=function(){var a=sf();return"ReactNative"===a||"Node"===a},ff=function(a){var b=a.toLowerCase();if(u(b,"opera/")||u(b,"opr/")||u(b,"opios/"))return"Opera";if(u(b,"iemobile"))return"IEMobile";if(u(b,"msie")||u(b,"trident/"))return"IE";if(u(b,"edge/"))return"Edge";if(u(b,"firefox/"))return"Firefox";if(u(b,
"silk/"))return"Silk";if(u(b,"blackberry"))return"Blackberry";if(u(b,"webos"))return"Webos";if(!u(b,"safari/")||u(b,"chrome/")||u(b,"crios/")||u(b,"android"))if(!u(b,"chrome/")&&!u(b,"crios/")||u(b,"edge/")){if(u(b,"android"))return"Android";if((a=a.match(/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/))&&2==a.length)return a[1]}else return"Chrome";else return"Safari";return"Other"},uf=function(a){var b=sf();return("Browser"===b?ff(K()):b)+"/JsCore/"+a},K=function(){return k.navigator&&k.navigator.userAgent||""},
L=function(a,b){a=a.split(".");b=b||k;for(var c=0;c<a.length&&"object"==typeof b&&null!=b;c++)b=b[a[c]];c!=a.length&&(b=void 0);return b},xf=function(){var a;if(a=(vf()||"chrome-extension:"===qf()||of())&&!tf())a:{try{var b=k.localStorage,c=wf();if(b){b.setItem(c,"1");b.removeItem(c);a=bf()?!!k.indexedDB:!0;break a}}catch(d){}a=!1}return a},vf=function(){return"http:"===qf()||"https:"===qf()},qf=function(){return k.location&&k.location.protocol||null},yf=function(a){a=a||K();return hf(a)||"Firefox"==
ff(a)?!1:!0},zf=function(a){return"undefined"===typeof a?null:zc(a)},Af=function(a){var b={},c;for(c in a)a.hasOwnProperty(c)&&null!==a[c]&&void 0!==a[c]&&(b[c]=a[c]);return b},Bf=function(a){if(null!==a)return JSON.parse(a)},wf=function(a){return a?a:""+Math.floor(1E9*Math.random()).toString()},Cf=function(a){a=a||K();return"Safari"==ff(a)||a.toLowerCase().match(/iphone|ipad|ipod/)?!1:!0},Df=function(){var a=k.___jsl;if(a&&a.H)for(var b in a.H)if(a.H[b].r=a.H[b].r||[],a.H[b].L=a.H[b].L||[],a.H[b].r=
a.H[b].L.concat(),a.CP)for(var c=0;c<a.CP.length;c++)a.CP[c]=null},Ef=function(){return k.navigator&&"boolean"===typeof k.navigator.onLine?k.navigator.onLine:!0},Ff=function(a,b,c,d){if(a>b)throw Error("Short delay should be less than long delay!");this.Nf=a;this.pf=b;a=c||K();d=d||sf();this.kf=hf(a)||"ReactNative"===d};Ff.prototype.get=function(){return this.kf?this.pf:this.Nf};
var Gf=function(){var a=k.document;return a&&"undefined"!==typeof a.visibilityState?"visible"==a.visibilityState:!0},Hf=function(){var a=k.document,b=null;return Gf()||!a?B():(new A(function(c){b=function(){Gf()&&(a.removeEventListener("visibilitychange",b,!1),c())};a.addEventListener("visibilitychange",b,!1)})).f(function(c){a.removeEventListener("visibilitychange",b,!1);throw c;})};var If={};var Jf;try{var Kf={};Object.defineProperty(Kf,"abcd",{configurable:!0,enumerable:!0,value:1});Object.defineProperty(Kf,"abcd",{configurable:!0,enumerable:!0,value:2});Jf=2==Kf.abcd}catch(a){Jf=!1}
var M=function(a,b,c){Jf?Object.defineProperty(a,b,{configurable:!0,enumerable:!0,value:c}):a[b]=c},Lf=function(a,b){if(b)for(var c in b)b.hasOwnProperty(c)&&M(a,c,b[c])},Mf=function(a){var b={};Lf(b,a);return b},Nf=function(a){var b={},c;for(c in a)a.hasOwnProperty(c)&&(b[c]=a[c]);return b},Of=function(a,b){if(!b||!b.length)return!0;if(!a)return!1;for(var c=0;c<b.length;c++){var d=a[b[c]];if(void 0===d||null===d||""===d)return!1}return!0},Pf=function(a){var b=a;if("object"==typeof a&&null!=a){var b=
"length"in a?[]:{},c;for(c in a)M(b,c,Pf(a[c]))}return b};var Qf="oauth_consumer_key oauth_nonce oauth_signature oauth_signature_method oauth_timestamp oauth_token oauth_version".split(" "),Rf=["client_id","response_type","scope","redirect_uri","state"],Sf={Xf:{Rb:500,Qb:600,providerId:"facebook.com",zd:Rf},Yf:{Rb:500,Qb:620,providerId:"github.com",zd:Rf},Zf:{Rb:515,Qb:680,providerId:"google.com",zd:Rf},$f:{Rb:485,Qb:705,providerId:"twitter.com",zd:Qf}},Tf=function(a){for(var b in Sf)if(Sf[b].providerId==a)return Sf[b];return null};var N=function(a,b){this.code="auth/"+a;this.message=b||Uf[a]||""};r(N,Error);N.prototype.F=function(){return{code:this.code,message:this.message}};N.prototype.toJSON=function(){return this.F()};
var Vf=function(a){var b=a&&a.code;return b?new N(b.substring(5),a.message):null},Uf={"argument-error":"","app-not-authorized":"This app, identified by the domain where it's hosted, is not authorized to use Firebase Authentication with the provided API key. Review your key configuration in the Google API console.","app-not-installed":"The requested mobile application corresponding to the identifier (Android package name or iOS bundle ID) provided is not installed on this device.","captcha-check-failed":"The reCAPTCHA response token provided is either invalid, expired, already used or the domain associated with it does not match the list of whitelisted domains.",
"code-expired":"The SMS code has expired. Please re-send the verification code to try again.","cordova-not-ready":"Cordova framework is not ready.","cors-unsupported":"This browser is not supported.","credential-already-in-use":"This credential is already associated with a different user account.","custom-token-mismatch":"The custom token corresponds to a different audience.","requires-recent-login":"This operation is sensitive and requires recent authentication. Log in again before retrying this request.",
"dynamic-link-not-activated":"Please activate Dynamic Links in the Firebase Console and agree to the terms and conditions.","email-already-in-use":"The email address is already in use by another account.","expired-action-code":"The action code has expired. ","cancelled-popup-request":"This operation has been cancelled due to another conflicting popup being opened.","internal-error":"An internal error has occurred.","invalid-app-credential":"The phone verification request contains an invalid application verifier. The reCAPTCHA token response is either invalid or expired.",
"invalid-app-id":"The mobile app identifier is not registed for the current project.","invalid-user-token":"The user's credential is no longer valid. The user must sign in again.","invalid-auth-event":"An internal error has occurred.","invalid-verification-code":"The SMS verification code used to create the phone auth credential is invalid. Please resend the verification code sms and be sure use the verification code provided by the user.","invalid-cordova-configuration":"The following Cordova plugins must be installed to enable OAuth sign-in: cordova-plugin-buildinfo, cordova-universal-links-plugin, cordova-plugin-browsertab, cordova-plugin-inappbrowser and cordova-plugin-customurlscheme.",
"invalid-custom-token":"The custom token format is incorrect. Please check the documentation.","invalid-email":"The email address is badly formatted.","invalid-api-key":"Your API key is invalid, please check you have copied it correctly.","invalid-credential":"The supplied auth credential is malformed or has expired.","invalid-message-payload":"The email template corresponding to this action contains invalid characters in its message. Please fix by going to the Auth email templates section in the Firebase Console.",
"invalid-oauth-provider":"EmailAuthProvider is not supported for this operation. This operation only supports OAuth providers.","unauthorized-domain":"This domain is not authorized for OAuth operations for your Firebase project. Edit the list of authorized domains from the Firebase console.","invalid-action-code":"The action code is invalid. This can happen if the code is malformed, expired, or has already been used.","wrong-password":"The password is invalid or the user does not have a password.",
"invalid-phone-number":"The format of the phone number provided is incorrect. Please enter the phone number in a format that can be parsed into E.164 format. E.164 phone numbers are written in the format [+][country code][subscriber number including area code].","invalid-recipient-email":"The email corresponding to this action failed to send as the provided recipient email address is invalid.","invalid-sender":"The email template corresponding to this action contains an invalid sender email or name. Please fix by going to the Auth email templates section in the Firebase Console.",
"invalid-verification-id":"The verification ID used to create the phone auth credential is invalid.","missing-iframe-start":"An internal error has occurred.","auth-domain-config-required":"Be sure to include authDomain when calling firebase.initializeApp(), by following the instructions in the Firebase console.","missing-app-credential":"The phone verification request is missing an application verifier assertion. A reCAPTCHA response token needs to be provided.","missing-verification-code":"The phone auth credential was created with an empty SMS verification code.",
"missing-phone-number":"To send verification codes, provide a phone number for the recipient.","missing-verification-id":"The phone auth credential was created with an empty verification ID.","app-deleted":"This instance of FirebaseApp has been deleted.","account-exists-with-different-credential":"An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.","network-request-failed":"A network error (such as timeout, interrupted connection or unreachable host) has occurred.",
"no-auth-event":"An internal error has occurred.","no-such-provider":"User was not linked to an account with the given provider.","operation-not-allowed":"The given sign-in provider is disabled for this Firebase project. Enable it in the Firebase console, under the sign-in method tab of the Auth section.","operation-not-supported-in-this-environment":'This operation is not supported in the environment this application is running on. "location.protocol" must be http, https or chrome-extension and web storage must be enabled.',
"popup-blocked":"Unable to establish a connection with the popup. It may have been blocked by the browser.","popup-closed-by-user":"The popup has been closed by the user before finalizing the operation.","provider-already-linked":"User can only be linked to one identity for the given provider.","quota-exceeded":"The SMS quota for this project has been exceeded.","redirect-cancelled-by-user":"The redirect operation has been cancelled by the user before finalizing.","redirect-operation-pending":"A redirect sign-in operation is already pending.",
timeout:"The operation has timed out.","user-token-expired":"The user's credential is no longer valid. The user must sign in again.","too-many-requests":"We have blocked all requests from this device due to unusual activity. Try again later.","user-cancelled":"User did not grant your application the permissions it requested.","user-not-found":"There is no user record corresponding to this identifier. The user may have been deleted.","user-disabled":"The user account has been disabled by an administrator.",
"user-mismatch":"The supplied credentials do not correspond to the previously signed in user.","user-signed-out":"","weak-password":"The password must be 6 characters long or more.","web-storage-unsupported":"This browser is not supported or 3rd party cookies and data may be disabled."};var O=function(a,b,c,d,e){this.ha=a;this.R=b||null;this.vb=c||null;this.Bd=d||null;this.W=e||null;if(this.vb||this.W){if(this.vb&&this.W)throw new N("invalid-auth-event");if(this.vb&&!this.Bd)throw new N("invalid-auth-event");}else throw new N("invalid-auth-event");};O.prototype.oc=function(){return this.Bd};O.prototype.getError=function(){return this.W};O.prototype.F=function(){return{type:this.ha,eventId:this.R,urlResponse:this.vb,sessionId:this.Bd,error:this.W&&this.W.F()}};
var Wf=function(a){a=a||{};return a.type?new O(a.type,a.eventId,a.urlResponse,a.sessionId,a.error&&Vf(a.error)):null};var Xf=function(a){var b="unauthorized-domain",c=void 0,d=We(a);a=d.ia;d=d.ka;"chrome-extension"==d?c=na("This chrome extension ID (chrome-extension://%s) is not authorized to run this operation. Add it to the OAuth redirect domains list in the Firebase console -> Auth section -> Sign in method tab.",a):"http"==d||"https"==d?c=na("This domain (%s) is not authorized to run this operation. Add it to the OAuth redirect domains list in the Firebase console -> Auth section -> Sign in method tab.",a):b=
"operation-not-supported-in-this-environment";N.call(this,b,c)};r(Xf,N);var Yf=function(a){this.nf=a.sub;ma();this.mc=a.email||null};var Zf=function(a,b){return a.then(function(a){if(a.idToken){a:{var c=a.idToken.split(".");if(3==c.length){for(var c=c[1],e=(4-c.length%4)%4,f=0;f<e;f++)c+=".";try{var g=JSON.parse(vb(c));if(g.sub&&g.iss&&g.aud&&g.exp){var l=new Yf(g);break a}}catch(n){}}l=null}if(!l||b!=l.nf)throw new N("user-mismatch");return a}throw new N("user-mismatch");}).f(function(a){throw a&&a.code&&"auth/user-not-found"==a.code?new N("user-mismatch"):a;})},$f=function(a,b){if(b.idToken||b.accessToken)b.idToken&&M(this,"idToken",
b.idToken),b.accessToken&&M(this,"accessToken",b.accessToken);else if(b.oauthToken&&b.oauthTokenSecret)M(this,"accessToken",b.oauthToken),M(this,"secret",b.oauthTokenSecret);else throw new N("internal-error","failed to construct a credential");M(this,"providerId",a)};$f.prototype.Eb=function(a){return ag(a,bg(this))};$f.prototype.zc=function(a,b){var c=bg(this);c.idToken=b;return cg(a,c)};$f.prototype.od=function(a,b){var c=bg(this);return Zf(dg(a,c),b)};
var bg=function(a){var b={};a.idToken&&(b.id_token=a.idToken);a.accessToken&&(b.access_token=a.accessToken);a.secret&&(b.oauth_token_secret=a.secret);b.providerId=a.providerId;return{postBody:af(b).toString(),requestUri:"http://localhost"}};$f.prototype.F=function(){var a={providerId:this.providerId};this.idToken&&(a.oauthIdToken=this.idToken);this.accessToken&&(a.oauthAccessToken=this.accessToken);this.secret&&(a.oauthTokenSecret=this.secret);return a};
var eg=function(a,b){this.Df=b||[];Lf(this,{providerId:a,isOAuthProvider:!0});this.Sd={}};eg.prototype.setCustomParameters=function(a){this.Sd=Za(a);return this};var P=function(a){eg.call(this,a,Rf);this.Ad=[]};r(P,eg);P.prototype.addScope=function(a){Ka(this.Ad,a)||this.Ad.push(a);return this};P.prototype.$d=function(){return Pa(this.Ad)};
P.prototype.credential=function(a,b){if(!a&&!b)throw new N("argument-error","credential failed: must provide the ID token and/or the access token.");return new $f(this.providerId,{idToken:a||null,accessToken:b||null})};var fg=function(){P.call(this,"facebook.com")};r(fg,P);M(fg,"PROVIDER_ID","facebook.com");
var gg=function(a){if(!a)throw new N("argument-error","credential failed: expected 1 argument (the OAuth access token).");var b=a;ia(a)&&(b=a.accessToken);return(new fg).credential(null,b)},hg=function(){P.call(this,"github.com")};r(hg,P);M(hg,"PROVIDER_ID","github.com");
var ig=function(a){if(!a)throw new N("argument-error","credential failed: expected 1 argument (the OAuth access token).");var b=a;ia(a)&&(b=a.accessToken);return(new hg).credential(null,b)},jg=function(){P.call(this,"google.com");this.addScope("profile")};r(jg,P);M(jg,"PROVIDER_ID","google.com");var kg=function(a,b){var c=a;ia(a)&&(c=a.idToken,b=a.accessToken);return(new jg).credential(c,b)},lg=function(){eg.call(this,"twitter.com",Qf)};r(lg,eg);M(lg,"PROVIDER_ID","twitter.com");
var mg=function(a,b){var c=a;ia(c)||(c={oauthToken:a,oauthTokenSecret:b});if(!c.oauthToken||!c.oauthTokenSecret)throw new N("argument-error","credential failed: expected 2 arguments (the OAuth access token and secret).");return new $f("twitter.com",c)},ng=function(a,b){this.mc=a;this.sd=b;M(this,"providerId","password")};ng.prototype.Eb=function(a){return Q(a,og,{email:this.mc,password:this.sd})};ng.prototype.zc=function(a,b){return Q(a,pg,{idToken:b,email:this.mc,password:this.sd})};
ng.prototype.od=function(a,b){return Zf(this.Eb(a),b)};ng.prototype.F=function(){return{email:this.mc,password:this.sd}};var qg=function(){Lf(this,{providerId:"password",isOAuthProvider:!1})};Lf(qg,{PROVIDER_ID:"password"});var rg=function(a){if(!(a.verificationId&&a.Tc||a.cc&&a.phoneNumber))throw new N("internal-error");this.M=a;M(this,"providerId","phone")};rg.prototype.Eb=function(a){return a.verifyPhoneNumber(sg(this))};rg.prototype.zc=function(a,b){var c=sg(this);c.idToken=b;return Q(a,tg,c)};
rg.prototype.od=function(a,b){var c=sg(this);c.operation="REAUTH";a=Q(a,ug,c);return Zf(a,b)};rg.prototype.F=function(){var a={providerId:"phone"};this.M.verificationId&&(a.verificationId=this.M.verificationId);this.M.Tc&&(a.verificationCode=this.M.Tc);this.M.cc&&(a.temporaryProof=this.M.cc);this.M.phoneNumber&&(a.phoneNumber=this.M.phoneNumber);return a};
var sg=function(a){return a.M.cc&&a.M.phoneNumber?{temporaryProof:a.M.cc,phoneNumber:a.M.phoneNumber}:{sessionInfo:a.M.verificationId,code:a.M.Tc}},vg=function(a){try{this.Ke=a||firebase.auth()}catch(b){throw new N("argument-error","Either an instance of firebase.auth.Auth must be passed as an argument to the firebase.auth.PhoneAuthProvider constructor, or the default firebase App instance must be initialized via firebase.initializeApp().");}Lf(this,{providerId:"phone",isOAuthProvider:!1})};
vg.prototype.verifyPhoneNumber=function(a,b){var c=this.Ke.g;return B(b.verify()).then(function(d){if(!m(d))throw new N("argument-error","An implementation of firebase.auth.ApplicationVerifier.prototype.verify() must return a firebase.Promise that resolves with a string.");switch(b.type){case "recaptcha":return Q(c,wg,{phoneNumber:a,recaptchaToken:d});default:throw new N("argument-error",'Only firebase.auth.ApplicationVerifiers with type="recaptcha" are currently supported.');}})};
var xg=function(a,b){if(!a)throw new N("missing-verification-id");if(!b)throw new N("missing-verification-code");return new rg({verificationId:a,Tc:b})};Lf(vg,{PROVIDER_ID:"phone"});
var yg=function(a){if(a.temporaryProof&&a.phoneNumber)return new rg({cc:a.temporaryProof,phoneNumber:a.phoneNumber});var b=a&&a.providerId;if(!b||"password"===b)return null;var c=a&&a.oauthAccessToken,d=a&&a.oauthTokenSecret;a=a&&a.oauthIdToken;try{switch(b){case "google.com":return kg(a,c);case "facebook.com":return gg(c);case "github.com":return ig(c);case "twitter.com":return mg(c,d);default:return(new P(b)).credential(a,c)}}catch(e){return null}},zg=function(a){if(!a.isOAuthProvider)throw new N("invalid-oauth-provider");
};var Ag=function(a,b,c){N.call(this,a,c);a=b||{};a.email&&M(this,"email",a.email);a.phoneNumber&&M(this,"phoneNumber",a.phoneNumber);a.credential&&M(this,"credential",a.credential)};r(Ag,N);Ag.prototype.F=function(){var a={code:this.code,message:this.message};this.email&&(a.email=this.email);this.phoneNumber&&(a.phoneNumber=this.phoneNumber);var b=this.credential&&this.credential.F();b&&ab(a,b);return a};Ag.prototype.toJSON=function(){return this.F()};
var Bg=function(a){if(a.code){var b=a.code||"";0==b.indexOf("auth/")&&(b=b.substring(5));var c={credential:yg(a)};if(a.email)c.email=a.email;else if(a.phoneNumber)c.phoneNumber=a.phoneNumber;else return new N(b,a.message||void 0);return new Ag(b,c,a.message)}return null};var Cg=function(a){this.Wf=a};r(Cg,Dc);Cg.prototype.lc=function(){return new this.Wf};Cg.prototype.md=function(){return{}};
var R=function(a,b,c){var d="Node"==sf();d=k.XMLHttpRequest||d&&firebase.INTERNAL.node&&firebase.INTERNAL.node.XMLHttpRequest;if(!d)throw new N("internal-error","The XMLHttpRequest compatibility library was not found.");this.m=a;a=b||{};this.Jf=a.secureTokenEndpoint||"https://securetoken.googleapis.com/v1/token";this.Kf=a.secureTokenTimeout||Dg;this.pe=Za(a.secureTokenHeaders||Eg);this.Te=a.firebaseEndpoint||"https://www.googleapis.com/identitytoolkit/v3/relyingparty/";this.Ue=a.firebaseTimeout||
Fg;this.Yd=Za(a.firebaseHeaders||Gg);c&&(this.Yd["X-Client-Version"]=c,this.pe["X-Client-Version"]=c);this.Le=new Ic;this.Vf=new Cg(d)},Hg,Dg=new Ff(3E4,6E4),Eg={"Content-Type":"application/x-www-form-urlencoded"},Fg=new Ff(3E4,6E4),Gg={"Content-Type":"application/json"},Jg=function(a,b,c,d,e,f,g){Ef()?(gf()?a=q(a.Mf,a):(Hg||(Hg=new A(function(a,b){Ig(a,b)})),a=q(a.Lf,a)),a(b,c,d,e,f,g)):c&&c(null)};
R.prototype.Mf=function(a,b,c,d,e,f){var g="Node"==sf(),l=tf()?g?new F(this.Vf):new F:new F(this.Le);if(f){l.ub=Math.max(0,f);var n=setTimeout(function(){l.dispatchEvent("timeout")},f)}l.listen("complete",function(){n&&clearTimeout(n);var a=null;try{a=JSON.parse(Ie(this))||null}catch(lb){a=null}b&&b(a)});ec(l,"ready",function(){n&&clearTimeout(n);this.Ha||(this.Ha=!0,this.fb())});ec(l,"timeout",function(){n&&clearTimeout(n);this.Ha||(this.Ha=!0,this.fb());b&&b(null)});l.send(a,c,d,e)};
var Ld="__fcb"+Math.floor(1E6*Math.random()).toString(),Ig=function(a,b){((window.gapi||{}).client||{}).request?a():(k[Ld]=function(){((window.gapi||{}).client||{}).request?a():b(Error("CORS_UNSUPPORTED"))},Nd(function(){b(Error("CORS_UNSUPPORTED"))}))};
R.prototype.Lf=function(a,b,c,d,e){var f=this;Hg.then(function(){window.gapi.client.setApiKey(f.m);var g=window.gapi.auth.getToken();window.gapi.auth.setToken(null);window.gapi.client.request({path:a,method:c,body:d,headers:e,authType:"none",callback:function(a){window.gapi.auth.setToken(g);b&&b(a)}})}).f(function(a){b&&b({error:{message:a&&a.message||"CORS_UNSUPPORTED"}})})};
var Lg=function(a,b){return new A(function(c,d){"refresh_token"==b.grant_type&&b.refresh_token||"authorization_code"==b.grant_type&&b.code?Jg(a,a.Jf+"?key="+encodeURIComponent(a.m),function(a){a?a.error?d(Kg(a)):a.access_token&&a.refresh_token?c(a):d(new N("internal-error")):d(new N("network-request-failed"))},"POST",af(b).toString(),a.pe,a.Kf.get()):d(new N("internal-error"))})},Mg=function(a,b,c,d,e,f){var g=We(a.Te+b);J(g,"key",a.m);f&&J(g,"cb",ma().toString());var l="GET"==c;if(l)for(var n in d)d.hasOwnProperty(n)&&
J(g,n,d[n]);return new A(function(b,f){Jg(a,g.toString(),function(a){a?a.error?f(Kg(a,e||{})):b(a):f(new N("network-request-failed"))},c,l?void 0:zc(Af(d)),a.Yd,a.Ue.get())})},Ng=function(a){if(!kc.test(a.email))throw new N("invalid-email");},Og=function(a){"email"in a&&Ng(a)},Qg=function(a,b){return Q(a,Pg,{identifier:b,continueUri:vf()?cf():"http://localhost"}).then(function(a){return a.allProviders||[]})},Sg=function(a){return Q(a,Rg,{}).then(function(a){return a.authorizedDomains||[]})},Tg=function(a){if(!a.idToken)throw new N("internal-error");
},Ug=function(a){if(a.phoneNumber||a.temporaryProof){if(!a.phoneNumber||!a.temporaryProof)throw new N("internal-error");}else{if(!a.sessionInfo)throw new N("missing-verification-id");if(!a.code)throw new N("missing-verification-code");}};R.prototype.signInAnonymously=function(){return Q(this,Vg,{})};R.prototype.updateEmail=function(a,b){return Q(this,Wg,{idToken:a,email:b})};R.prototype.updatePassword=function(a,b){return Q(this,pg,{idToken:a,password:b})};var Xg={displayName:"DISPLAY_NAME",photoUrl:"PHOTO_URL"};
R.prototype.updateProfile=function(a,b){var c={idToken:a},d=[];Ua(Xg,function(a,f){var e=b[f];null===e?d.push(a):f in b&&(c[f]=e)});d.length&&(c.deleteAttribute=d);return Q(this,Wg,c)};R.prototype.sendPasswordResetEmail=function(a){return Q(this,Yg,{requestType:"PASSWORD_RESET",email:a})};R.prototype.sendEmailVerification=function(a){return Q(this,Zg,{requestType:"VERIFY_EMAIL",idToken:a})};R.prototype.verifyPhoneNumber=function(a){return Q(this,$g,a)};
var bh=function(a,b,c){return Q(a,ah,{idToken:b,deleteProvider:c})},ch=function(a){if(!a.requestUri||!a.sessionId&&!a.postBody)throw new N("internal-error");},dh=function(a){var b=null;a.needConfirmation?(a.code="account-exists-with-different-credential",b=Bg(a)):"FEDERATED_USER_ID_ALREADY_LINKED"==a.errorMessage?(a.code="credential-already-in-use",b=Bg(a)):"EMAIL_EXISTS"==a.errorMessage&&(a.code="email-already-in-use",b=Bg(a));if(b)throw b;if(!a.idToken)throw new N("internal-error");},ag=function(a,
b){b.returnIdpCredential=!0;return Q(a,eh,b)},cg=function(a,b){b.returnIdpCredential=!0;return Q(a,fh,b)},dg=function(a,b){b.returnIdpCredential=!0;b.autoCreate=!1;return Q(a,gh,b)},hh=function(a){if(!a.oobCode)throw new N("invalid-action-code");};R.prototype.confirmPasswordReset=function(a,b){return Q(this,ih,{oobCode:a,newPassword:b})};R.prototype.checkActionCode=function(a){return Q(this,jh,{oobCode:a})};R.prototype.applyActionCode=function(a){return Q(this,kh,{oobCode:a})};
var kh={endpoint:"setAccountInfo",C:hh,Xa:"email"},jh={endpoint:"resetPassword",C:hh,U:function(a){if(!a.email||!a.requestType)throw new N("internal-error");}},lh={endpoint:"signupNewUser",C:function(a){Ng(a);if(!a.password)throw new N("weak-password");},U:Tg,ta:!0},Pg={endpoint:"createAuthUri"},mh={endpoint:"deleteAccount",Va:["idToken"]},ah={endpoint:"setAccountInfo",Va:["idToken","deleteProvider"],C:function(a){if(!ga(a.deleteProvider))throw new N("internal-error");}},nh={endpoint:"getAccountInfo"},
Zg={endpoint:"getOobConfirmationCode",Va:["idToken","requestType"],C:function(a){if("VERIFY_EMAIL"!=a.requestType)throw new N("internal-error");},Xa:"email"},Yg={endpoint:"getOobConfirmationCode",Va:["requestType"],C:function(a){if("PASSWORD_RESET"!=a.requestType)throw new N("internal-error");Ng(a)},Xa:"email"},Rg={Ld:!0,endpoint:"getProjectConfig",de:"GET"},oh={Ld:!0,endpoint:"getRecaptchaParam",de:"GET",U:function(a){if(!a.recaptchaSiteKey)throw new N("internal-error");}},ih={endpoint:"resetPassword",
C:hh,Xa:"email"},wg={endpoint:"sendVerificationCode",Va:["phoneNumber","recaptchaToken"],Xa:"sessionInfo"},Wg={endpoint:"setAccountInfo",Va:["idToken"],C:Og,ta:!0},pg={endpoint:"setAccountInfo",Va:["idToken"],C:function(a){Og(a);if(!a.password)throw new N("weak-password");},U:Tg,ta:!0},Vg={endpoint:"signupNewUser",U:Tg,ta:!0},eh={endpoint:"verifyAssertion",C:ch,U:dh,ta:!0},gh={endpoint:"verifyAssertion",C:ch,U:function(a){if(a.errorMessage&&"USER_NOT_FOUND"==a.errorMessage)throw new N("user-not-found");
if(!a.idToken)throw new N("internal-error");},ta:!0},fh={endpoint:"verifyAssertion",C:function(a){ch(a);if(!a.idToken)throw new N("internal-error");},U:dh,ta:!0},ph={endpoint:"verifyCustomToken",C:function(a){if(!a.token)throw new N("invalid-custom-token");},U:Tg,ta:!0},og={endpoint:"verifyPassword",C:function(a){Ng(a);if(!a.password)throw new N("wrong-password");},U:Tg,ta:!0},$g={endpoint:"verifyPhoneNumber",C:Ug,U:Tg},tg={endpoint:"verifyPhoneNumber",C:function(a){if(!a.idToken)throw new N("internal-error");
Ug(a)},U:function(a){if(a.temporaryProof)throw a.code="credential-already-in-use",Bg(a);Tg(a)}},ug={Oe:{USER_NOT_FOUND:"user-not-found"},endpoint:"verifyPhoneNumber",C:Ug,U:Tg},Q=function(a,b,c){if(!Of(c,b.Va))return D(new N("internal-error"));var d=b.de||"POST",e;return B(c).then(b.C).then(function(){b.ta&&(c.returnSecureToken=!0);return Mg(a,b.endpoint,d,c,b.Oe,b.Ld||!1)}).then(function(a){return e=a}).then(b.U).then(function(){if(!b.Xa)return e;if(!(b.Xa in e))throw new N("internal-error");return e[b.Xa]})},
Kg=function(a,b){var c=(a.error&&a.error.errors&&a.error.errors[0]||{}).reason||"";var d={keyInvalid:"invalid-api-key",ipRefererBlocked:"app-not-authorized"};if(c=d[c]?new N(d[c]):null)return c;c=a.error&&a.error.message||"";d={INVALID_CUSTOM_TOKEN:"invalid-custom-token",CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_EMAIL:"invalid-email",INVALID_PASSWORD:"wrong-password",USER_DISABLED:"user-disabled",
MISSING_PASSWORD:"internal-error",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",INVALID_MESSAGE_PAYLOAD:"invalid-message-payload",INVALID_RECIPIENT_EMAIL:"invalid-recipient-email",INVALID_SENDER:"invalid-sender",EMAIL_NOT_FOUND:"user-not-found",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",
INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",CORS_UNSUPPORTED:"cors-unsupported",DYNAMIC_LINK_NOT_ACTIVATED:"dynamic-link-not-activated",INVALID_APP_ID:"invalid-app-id",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",WEAK_PASSWORD:"weak-password",OPERATION_NOT_ALLOWED:"operation-not-allowed",USER_CANCELLED:"user-cancelled",CAPTCHA_CHECK_FAILED:"captcha-check-failed",INVALID_APP_CREDENTIAL:"invalid-app-credential",INVALID_CODE:"invalid-verification-code",
INVALID_PHONE_NUMBER:"invalid-phone-number",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_APP_CREDENTIAL:"missing-app-credential",MISSING_CODE:"missing-verification-code",MISSING_PHONE_NUMBER:"missing-phone-number",MISSING_SESSION_INFO:"missing-verification-id",QUOTA_EXCEEDED:"quota-exceeded",SESSION_EXPIRED:"code-expired"};ab(d,b||{});b=(b=c.match(/^[^\s]+\s*:\s*(.*)$/))&&1<b.length?b[1]:void 0;for(var e in d)if(0===c.indexOf(e))return new N(d[e],
b);!b&&a&&(b=zf(a));return new N("internal-error",b)};var qh=function(a){this.$=a};qh.prototype.value=function(){return this.$};qh.prototype.se=function(a){this.$.style=a;return this};var rh=function(a){this.$=a||{}};rh.prototype.value=function(){return this.$};rh.prototype.se=function(a){this.$.style=a;return this};var th=function(a){this.Tf=a;this.tc=null;this.qd=sh(this)},uh=function(a){var b=new rh;b.$.where=document.body;b.$.url=a.Tf;b.$.messageHandlersFilter=L("gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER");b.$.attributes=b.$.attributes||{};(new qh(b.$.attributes)).se({position:"absolute",top:"-100px",width:"1px",height:"1px"});b.$.dontclear=!0;return b},sh=function(a){return vh().then(function(){return new A(function(b,c){L("gapi.iframes.getContext")().open(uh(a).value(),function(d){a.tc=d;a.tc.restyle({setHideOnLeave:!1});
var e=setTimeout(function(){c(Error("Network Error"))},wh.get()),f=function(){clearTimeout(e);b()};d.ping(f).then(f,function(){c(Error("Network Error"))})})})})};th.prototype.sendMessage=function(a){var b=this;return this.qd.then(function(){return new A(function(c){b.tc.send(a.type,a,c,L("gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER"))})})};
var xh=function(a,b){a.qd.then(function(){a.tc.register("authEvent",b,L("gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER"))})},yh=new Ff(3E4,6E4),wh=new Ff(5E3,15E3),zh=null,vh=function(){return zh?zh:zh=(new A(function(a,b){if(Ef()){var c=function(){Df();L("gapi.load")("gapi.iframes",{callback:a,ontimeout:function(){Df();b(Error("Network Error"))},timeout:yh.get()})};if(L("gapi.iframes.Iframe"))a();else if(L("gapi.load"))c();else{var d="__iframefcb"+Math.floor(1E6*Math.random()).toString();k[d]=function(){L("gapi.load")?
c():b(Error("Network Error"))};B(Kd("https://apis.google.com/js/api.js?onload="+d)).f(function(){b(Error("Network Error"))})}}else b(Error("Network Error"))})).f(function(a){zh=null;throw a;})};var Ah=function(a,b,c){this.B=a;this.m=b;this.w=c;this.Za=null;this.fc=Xe(this.B,"/__/auth/iframe");J(this.fc,"apiKey",this.m);J(this.fc,"appName",this.w)};Ah.prototype.Dd=function(a){this.Za=a;return this};Ah.prototype.toString=function(){this.Za?J(this.fc,"v",this.Za):this.fc.removeParameter("v");return this.fc.toString()};var Bh=function(a,b,c,d,e){this.B=a;this.m=b;this.w=c;this.Je=d;this.Za=this.R=this.yd=null;this.Ub=e};Bh.prototype.Dd=function(a){this.Za=a;return this};
Bh.prototype.toString=function(){var a=Xe(this.B,"/__/auth/handler");J(a,"apiKey",this.m);J(a,"appName",this.w);J(a,"authType",this.Je);if(this.Ub.isOAuthProvider){J(a,"providerId",this.Ub.providerId);var b=this.Ub,c=Af(b.Sd),d;for(d in c)c[d]=c[d].toString();b=b.Df;c=Za(c);for(d=0;d<b.length;d++){var e=b[d];e in c&&delete c[e]}Xa(c)||J(a,"customParameters",zf(c))}"function"===typeof this.Ub.$d&&(b=this.Ub.$d(),b.length&&J(a,"scopes",b.join(",")));this.yd?J(a,"redirectUrl",this.yd):a.removeParameter("redirectUrl");
this.R?J(a,"eventId",this.R):a.removeParameter("eventId");this.Za?J(a,"v",this.Za):a.removeParameter("v");if(this.hc)for(var f in this.hc)this.hc.hasOwnProperty(f)&&!Ve(a,f)&&J(a,f,this.hc[f]);return a.toString()};
var Ch=function(a,b,c,d){this.B=a;this.m=b;this.w=c;this.We=(this.Fa=d||null)?uf(this.Fa):null;d=this.Fa;this.df=(new Ah(a,b,c)).Dd(d).toString();this.na=[];this.g=new R(b,null,this.We);this.vc=this.xa=null},Dh=function(a){var b=cf();return Sg(a).then(function(a){a:{for(var c=We(b),e=c.ka,c=c.ia,f=0;f<a.length;f++){var g=a[f];var l=c;var n=e;0==g.indexOf("chrome-extension://")?l=We(g).ia==l&&"chrome-extension"==n:"http"!=n&&"https"!=n?l=!1:mf.test(g)?l=l==g:(g=g.split(".").join("\\."),l=(new RegExp("^(.+\\."+
g+"|"+g+")$","i")).test(l));if(l){a=!0;break a}}a=!1}if(!a)throw new Xf(cf());})};h=Ch.prototype;h.Kb=function(){if(this.vc)return this.vc;var a=this;return this.vc=nf().then(function(){a.sc=new th(a.df);Eh(a)})};h.$b=function(a,b,c){var d=new N("popup-closed-by-user"),e=new N("web-storage-unsupported"),f=this,g=!1;return this.Ma().then(function(){Fh(f).then(function(c){c||(a&&jf(a),b(e),g=!0)})}).f(function(){}).then(function(){if(!g)return lf(a)}).then(function(){if(!g)return se(c).then(function(){b(d)})})};
h.te=function(){var a=K();return!yf(a)&&!Cf(a)};h.ce=function(){return!1};h.Sb=function(a,b,c,d,e,f,g){if(!a)return D(new N("popup-blocked"));if(g&&!yf())return this.Ma().f(function(b){jf(a);e(b)}),d(),B();this.xa||(this.xa=Dh(this.g));var l=this;return this.xa.then(function(){var b=l.Ma().f(function(b){jf(a);e(b);throw b;});d();return b}).then(function(){zg(c);if(!g){var d=Gh(l.B,l.m,l.w,b,c,null,f,l.Fa);df(d,a)}}).f(function(a){"auth/network-request-failed"==a.code&&(l.xa=null);throw a;})};
h.Tb=function(a,b,c){this.xa||(this.xa=Dh(this.g));var d=this;return this.xa.then(function(){zg(b);var e=Gh(d.B,d.m,d.w,a,b,cf(),c,d.Fa);df(e)})};h.Ma=function(){var a=this;return this.Kb().then(function(){return a.sc.qd}).f(function(){a.xa=null;throw new N("network-request-failed");})};h.we=function(){return!0};
var Gh=function(a,b,c,d,e,f,g,l,n){a=new Bh(a,b,c,d,e);a.yd=f;a.R=g;f=a.Dd(l);f.hc=Za(n||null);return f.toString()},Eh=function(a){if(!a.sc)throw Error("IfcHandler must be initialized!");xh(a.sc,function(b){var c={};if(b&&b.authEvent){var d=!1;b=Wf(b.authEvent);for(c=0;c<a.na.length;c++)d=a.na[c](b)||d;c={};c.status=d?"ACK":"ERROR";return B(c)}c.status="ERROR";return B(c)})},Fh=function(a){var b={type:"webStorageSupport"};return a.Kb().then(function(){return a.sc.sendMessage(b)}).then(function(a){if(a&&
a.length&&"undefined"!==typeof a[0].webStorageSupport)return a[0].webStorageSupport;throw Error();})};Ch.prototype.bb=function(a){this.na.push(a)};Ch.prototype.Yb=function(a){Na(this.na,function(b){return b==a})};var Hh=function(a,b,c){M(this,"type","recaptcha");this.Uc=this.zb=null;this.Bb=!1;this.Qd=a;this.ya=b||{theme:"light",type:"image"};this.G=[];if(this.ya.sitekey)throw new N("argument-error","sitekey should not be provided for reCAPTCHA as one is automatically provisioned for the current project.");this.wc="invisible"===this.ya.size;if(!bd(a)||!this.wc&&bd(a).hasChildNodes())throw new N("argument-error","reCAPTCHA container is either not found or already contains inner elements!");try{this.h=c||firebase.app()}catch(g){throw new N("argument-error",
"No firebase.app.App instance is currently initialized.");}if(this.h.options&&this.h.options.apiKey)a=firebase.SDK_VERSION?uf(firebase.SDK_VERSION):null,this.g=new R(this.h.options&&this.h.options.apiKey,null,a);else throw new N("invalid-api-key");var d=this;this.Pc=[];var e=this.ya.callback;this.ya.callback=function(a){d.Cb(a);if("function"===typeof e)e(a);else if("string"===typeof e){var b=L(e,k);"function"===typeof b&&b(a)}};var f=this.ya["expired-callback"];this.ya["expired-callback"]=function(){d.Cb(null);
if("function"===typeof f)f();else if("string"===typeof f){var a=L(f,k);"function"===typeof a&&a()}}};Hh.prototype.Cb=function(a){for(var b=0;b<this.Pc.length;b++)try{this.Pc[b](a)}catch(c){}};var Ih=function(a,b){Na(a.Pc,function(a){return a==b})};Hh.prototype.b=function(a){var b=this;this.G.push(a);td(a,function(){Ma(b.G,a)});return a};
Hh.prototype.Lb=function(){var a=this;return this.zb?this.zb:this.zb=this.b(B().then(function(){if(vf())return nf();throw new N("operation-not-supported-in-this-environment","RecaptchaVerifier is only supported in a browser HTTP/HTTPS environment.");}).then(function(){return Jh()}).then(function(){return Q(a.g,oh,{})}).then(function(b){a.ya.sitekey=b.recaptchaSiteKey}).f(function(b){a.zb=null;throw b;}))};
Hh.prototype.render=function(){Lh(this);var a=this;return this.b(this.Lb().then(function(){if(null===a.Uc){var b=a.Qd;if(!a.wc){var c=bd(b),b=fd("DIV");c.appendChild(b)}a.Uc=grecaptcha.render(b,a.ya)}return a.Uc}))};Hh.prototype.verify=function(){Lh(this);var a=this;return this.b(this.render().then(function(b){return new A(function(c){var d=grecaptcha.getResponse(b);if(d)c(d);else{var e=function(b){b&&(Ih(a,e),c(b))};a.Pc.push(e);a.wc&&grecaptcha.execute(a.Uc)}})}))};
var Lh=function(a){if(a.Bb)throw new N("internal-error","RecaptchaVerifier instance has been destroyed.");};Hh.prototype.clear=function(){Lh(this);this.Bb=!0;for(var a=0;a<this.G.length;a++)this.G[a].cancel("RecaptchaVerifier instance has been destroyed.");if(!this.wc)for(var a=bd(this.Qd),b;b=a.firstChild;)a.removeChild(b)};
var Jh=function(){return new A(function(a,b){if(Ef())if(k.grecaptcha)a();else{var c="__rcb"+Math.floor(1E6*Math.random()).toString();k[c]=function(){k.grecaptcha?a():b(new N("internal-error"));delete k[c]};B(Kd("https://www.google.com/recaptcha/api.js?onload="+c+"&render=explicit")).f(function(){b(new N("internal-error","Unable to load external reCAPTCHA dependencies!"))})}else b(new N("network-request-failed"))})};var Mh=function(a){this.D=a||firebase.INTERNAL.reactNative&&firebase.INTERNAL.reactNative.AsyncStorage;if(!this.D)throw new N("internal-error","The React Native compatibility library was not found.");};h=Mh.prototype;h.get=function(a){return B(this.D.getItem(a)).then(function(a){return a&&Bf(a)})};h.set=function(a,b){return B(this.D.setItem(a,zf(b)))};h.remove=function(a){return B(this.D.removeItem(a))};h.cb=function(){};h.Ua=function(){};var Nh=function(){this.D={}};h=Nh.prototype;h.get=function(a){return B(this.D[a])};h.set=function(a,b){this.D[a]=b;return B()};h.remove=function(a){delete this.D[a];return B()};h.cb=function(){};h.Ua=function(){};var Ph=function(){if(!Oh()){if("Node"==sf())throw new N("internal-error","The LocalStorage compatibility library was not found.");throw new N("web-storage-unsupported");}this.D=k.localStorage||firebase.INTERNAL.node.localStorage},Oh=function(){var a="Node"==sf(),a=k.localStorage||a&&firebase.INTERNAL.node&&firebase.INTERNAL.node.localStorage;if(!a)return!1;try{return a.setItem("__sak","1"),a.removeItem("__sak"),!0}catch(b){return!1}};h=Ph.prototype;
h.get=function(a){var b=this;return B().then(function(){var c=b.D.getItem(a);return Bf(c)})};h.set=function(a,b){var c=this;return B().then(function(){var d=zf(b);null===d?c.remove(a):c.D.setItem(a,d)})};h.remove=function(a){var b=this;return B().then(function(){b.D.removeItem(a)})};h.cb=function(a){k.window&&Xb(k.window,"storage",a)};h.Ua=function(a){k.window&&fc(k.window,"storage",a)};var Qh=function(){this.D={}};h=Qh.prototype;h.get=function(){return B(null)};h.set=function(){return B()};h.remove=function(){return B()};h.cb=function(){};h.Ua=function(){};var Sh=function(){if(!Rh()){if("Node"==sf())throw new N("internal-error","The SessionStorage compatibility library was not found.");throw new N("web-storage-unsupported");}this.D=k.sessionStorage||firebase.INTERNAL.node.sessionStorage},Rh=function(){var a="Node"==sf(),a=k.sessionStorage||a&&firebase.INTERNAL.node&&firebase.INTERNAL.node.sessionStorage;if(!a)return!1;try{return a.setItem("__sak","1"),a.removeItem("__sak"),!0}catch(b){return!1}};h=Sh.prototype;
h.get=function(a){var b=this;return B().then(function(){var c=b.D.getItem(a);return Bf(c)})};h.set=function(a,b){var c=this;return B().then(function(){var d=zf(b);null===d?c.remove(a):c.D.setItem(a,d)})};h.remove=function(a){var b=this;return B().then(function(){b.D.removeItem(a)})};h.cb=function(){};h.Ua=function(){};var Th=function(a,b,c,d,e,f){if(!window.indexedDB)throw new N("web-storage-unsupported");this.Pe=a;this.pd=b;this.bd=c;this.Ae=d;this.$a=e;this.da={};this.ac=[];this.Ob=0;this.ef=f||k.indexedDB},Uh,Vh=function(a){return new A(function(b,c){var d=a.ef.open(a.Pe,a.$a);d.onerror=function(a){c(Error(a.target.errorCode))};d.onupgradeneeded=function(b){b=b.target.result;try{b.createObjectStore(a.pd,{keyPath:a.bd})}catch(f){c(f)}};d.onsuccess=function(a){b(a.target.result)}})},Wh=function(a){a.ge||(a.ge=
Vh(a));return a.ge},Xh=function(a,b){return b.objectStore(a.pd)},Yh=function(a,b,c){return b.transaction([a.pd],c?"readwrite":"readonly")},Zh=function(a){return new A(function(b,c){a.onsuccess=function(a){a&&a.target?b(a.target.result):b()};a.onerror=function(a){c(Error(a.target.errorCode))}})};h=Th.prototype;
h.set=function(a,b){var c=!1,d,e=this;return td(Wh(this).then(function(b){d=b;b=Xh(e,Yh(e,d,!0));return Zh(b.get(a))}).then(function(f){var g=Xh(e,Yh(e,d,!0));if(f)return f.value=b,Zh(g.put(f));e.Ob++;c=!0;f={};f[e.bd]=a;f[e.Ae]=b;return Zh(g.add(f))}).then(function(){e.da[a]=b}),function(){c&&e.Ob--})};h.get=function(a){var b=this;return Wh(this).then(function(c){return Zh(Xh(b,Yh(b,c,!1)).get(a))}).then(function(a){return a&&a.value})};
h.remove=function(a){var b=!1,c=this;return td(Wh(this).then(function(d){b=!0;c.Ob++;return Zh(Xh(c,Yh(c,d,!0))["delete"](a))}).then(function(){delete c.da[a]}),function(){b&&c.Ob--})};
h.Pf=function(){var a=this;return Wh(this).then(function(b){var c=Xh(a,Yh(a,b,!1));return c.getAll?Zh(c.getAll()):new A(function(a,b){var d=[],e=c.openCursor();e.onsuccess=function(b){(b=b.target.result)?(d.push(b.value),b["continue"]()):a(d)};e.onerror=function(a){b(Error(a.target.errorCode))}})}).then(function(b){var c={},d=[];if(0==a.Ob){for(d=0;d<b.length;d++)c[b[d][a.bd]]=b[d][a.Ae];d=ef(a.da,c);a.da=c}return d})};h.cb=function(a){0==this.ac.length&&this.Fd();this.ac.push(a)};
h.Ua=function(a){Na(this.ac,function(b){return b==a});0==this.ac.length&&this.Lc()};h.Fd=function(){var a=this;this.Lc();var b=function(){a.td=se(800).then(q(a.Pf,a)).then(function(b){0<b.length&&w(a.ac,function(a){a(b)})}).then(b).f(function(a){"STOP_EVENT"!=a.message&&b()});return a.td};b()};h.Lc=function(){this.td&&this.td.cancel("STOP_EVENT")};var ci=function(){this.Ud={Browser:$h,Node:ai,ReactNative:bi}[sf()]},di,$h={T:Ph,Id:Sh},ai={T:Ph,Id:Sh},bi={T:Mh,Id:Qh};var ei=function(a,b){this.Ne=b;M(this,"verificationId",a)};ei.prototype.confirm=function(a){a=xg(this.verificationId,a);return this.Ne(a)};var fi=function(a,b,c,d){return(new vg(a)).verifyPhoneNumber(b,c).then(function(a){return new ei(a,d)})};var gi=function(a){var b={},c=a.email,d=a.newEmail;a=a.requestType;if(!c||!a)throw Error("Invalid provider user info!");b.fromEmail=d||null;b.email=c;M(this,"operation",a);M(this,"data",Pf(b))};var hi=function(a,b,c,d,e,f){this.xf=a;this.Ff=b;this.Ye=c;this.Ac=d;this.Jd=e;this.Gf=!!f;this.mb=null;this.Na=this.Ac;if(this.Jd<this.Ac)throw Error("Proactive refresh lower bound greater than upper bound!");};hi.prototype.start=function(){this.Na=this.Ac;ii(this,!0)};
var ji=function(a,b){if(b)return a.Na=a.Ac,a.Ye();b=a.Na;a.Na*=2;a.Na>a.Jd&&(a.Na=a.Jd);return b},ii=function(a,b){a.stop();a.mb=se(ji(a,b)).then(function(){return a.Gf?B():Hf()}).then(function(){return a.xf()}).then(function(){ii(a,!0)}).f(function(b){a.Ff(b)&&ii(a,!1)})};hi.prototype.stop=function(){this.mb&&(this.mb.cancel(),this.mb=null)};var pi=function(a){var b={};b["facebook.com"]=ki;b["google.com"]=li;b["github.com"]=mi;b["twitter.com"]=ni;var c=a&&a.providerId;return c?b[c]?new b[c](a):new oi(a):null},oi=function(a){var b=Bf(a.rawUserInfo||"{}");a=a.providerId;if(!a)throw Error("Invalid additional user info!");M(this,"profile",Pf(b||{}));M(this,"providerId",a)},ki=function(a){oi.call(this,a);if("facebook.com"!=this.providerId)throw Error("Invalid provider id!");};r(ki,oi);
var mi=function(a){oi.call(this,a);if("github.com"!=this.providerId)throw Error("Invalid provider id!");M(this,"username",this.profile&&this.profile.login||null)};r(mi,oi);var li=function(a){oi.call(this,a);if("google.com"!=this.providerId)throw Error("Invalid provider id!");};r(li,oi);var ni=function(a){oi.call(this,a);if("twitter.com"!=this.providerId)throw Error("Invalid provider id!");M(this,"username",a.screenName||null)};r(ni,oi);var qi=function(a,b,c,d){this.sf=a;this.qe=b;this.Hf=c;this.Zb=d;this.Z={};di||(di=new ci);a=di;try{if(bf()){Uh||(Uh=new Th("firebaseLocalStorageDb","firebaseLocalStorage","fbase_key","value",1));var e=Uh}else e=new a.Ud.T;this.Ra=e}catch(f){this.Ra=new Nh,this.Zb=!0}try{this.Nc=new a.Ud.Id}catch(f){this.Nc=new Nh}this.Gd=q(this.ue,this);this.da={}},ri,si=function(){ri||(ri=new qi("firebase",":",!Cf(K())&&rf()?!0:!1,yf()));return ri};h=qi.prototype;
h.X=function(a,b){return this.sf+this.qe+a.name+(b?this.qe+b:"")};h.get=function(a,b){return(a.T?this.Ra:this.Nc).get(this.X(a,b))};h.remove=function(a,b){b=this.X(a,b);a.T&&!this.Zb&&(this.da[b]=null);return(a.T?this.Ra:this.Nc).remove(b)};h.set=function(a,b,c){var d=this.X(a,c),e=this,f=a.T?this.Ra:this.Nc;return f.set(d,b).then(function(){return f.get(d)}).then(function(b){a.T&&!this.Zb&&(e.da[d]=b)})};
h.addListener=function(a,b,c){a=this.X(a,b);this.Zb||(this.da[a]=k.localStorage.getItem(a));Xa(this.Z)&&this.Fd();this.Z[a]||(this.Z[a]=[]);this.Z[a].push(c)};h.removeListener=function(a,b,c){a=this.X(a,b);this.Z[a]&&(Na(this.Z[a],function(a){return a==c}),0==this.Z[a].length&&delete this.Z[a]);Xa(this.Z)&&this.Lc()};h.Fd=function(){this.Ra.cb(this.Gd);this.Zb||bf()||ti(this)};
var ti=function(a){ui(a);a.nd=setInterval(function(){for(var b in a.Z){var c=k.localStorage.getItem(b),d=a.da[b];c!=d&&(a.da[b]=c,c=new Lb({type:"storage",key:b,target:window,oldValue:d,newValue:c,zf:!0}),a.ue(c))}},1E3)},ui=function(a){a.nd&&(clearInterval(a.nd),a.nd=null)};qi.prototype.Lc=function(){this.Ra.Ua(this.Gd);ui(this)};
qi.prototype.ue=function(a){if(a&&a.Xe){var b=a.gb.key;"undefined"!==typeof a.gb.zf?this.Ra.Ua(this.Gd):ui(this);if(this.Hf){var c=k.localStorage.getItem(b);a=a.gb.newValue;a!=c&&(a?k.localStorage.setItem(b,a):a||k.localStorage.removeItem(b))}this.da[b]=k.localStorage.getItem(b);this.Nd(b)}else w(a,q(this.Nd,this))};qi.prototype.Nd=function(a){this.Z[a]&&w(this.Z[a],function(a){a()})};var vi=function(a,b){this.v=a;this.l=b||si()},wi={name:"authEvent",T:!0},xi=function(a){return a.l.get(wi,a.v).then(function(a){return Wf(a)})};vi.prototype.bb=function(a){this.l.addListener(wi,this.v,a)};vi.prototype.Yb=function(a){this.l.removeListener(wi,this.v,a)};var yi=function(a){this.l=a||si()},zi={name:"sessionId",T:!1};yi.prototype.oc=function(a){return this.l.get(zi,a)};var Ai=function(a,b,c,d,e,f){this.B=a;this.m=b;this.w=c;this.Fa=d||null;this.ve=b+":"+c;this.If=new yi;this.Zd=new vi(this.ve);this.ld=null;this.na=[];this.jf=e||500;this.Bf=f||2E3;this.Jb=this.Dc=null},Bi=function(a){return new N("invalid-cordova-configuration",a)};
Ai.prototype.Ma=function(){return this.Lb?this.Lb:this.Lb=pf().then(function(){if("function"!==typeof L("universalLinks.subscribe",k))throw Bi("cordova-universal-links-plugin is not installed");if("undefined"===typeof L("BuildInfo.packageName",k))throw Bi("cordova-plugin-buildinfo is not installed");if("function"!==typeof L("cordova.plugins.browsertab.openUrl",k))throw Bi("cordova-plugin-browsertab is not installed");if("function"!==typeof L("cordova.InAppBrowser.open",k))throw Bi("cordova-plugin-inappbrowser is not installed");
},function(){throw new N("cordova-not-ready");})};var Ci=function(){for(var a=20,b=[];0<a;)b.push("1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.floor(62*Math.random()))),a--;return b.join("")},Di=function(a){var b=new Gb;b.update(a);return Qa(b.digest())};h=Ai.prototype;h.$b=function(a,b){b(new N("operation-not-supported-in-this-environment"));return B()};h.Sb=function(){return D(new N("operation-not-supported-in-this-environment"))};h.we=function(){return!1};h.te=function(){return!0};
h.ce=function(){return!0};
h.Tb=function(a,b,c){if(this.Dc)return D(new N("redirect-operation-pending"));var d=this,e=k.document,f=null,g=null,l=null,n=null;return this.Dc=td(B().then(function(){zg(b);return Ei(d)}).then(function(){return Fi(d,a,b,c)}).then(function(){return(new A(function(a,b){g=function(){var b=L("cordova.plugins.browsertab.close",k);a();"function"===typeof b&&b();d.Jb&&"function"===typeof d.Jb.close&&(d.Jb.close(),d.Jb=null);return!1};d.bb(g);l=function(){f||(f=se(d.Bf).then(function(){b(new N("redirect-cancelled-by-user"))}))};n=
function(){Gf()&&l()};e.addEventListener("resume",l,!1);K().toLowerCase().match(/android/)||e.addEventListener("visibilitychange",n,!1)})).f(function(a){return Gi(d).then(function(){throw a;})})}),function(){l&&e.removeEventListener("resume",l,!1);n&&e.removeEventListener("visibilitychange",n,!1);f&&f.cancel();g&&d.Yb(g);d.Dc=null})};
var Fi=function(a,b,c,d){var e=Ci(),f=new O(b,d,null,e,new N("no-auth-event")),g=L("BuildInfo.packageName",k);if("string"!==typeof g)throw new N("invalid-cordova-configuration");var l=L("BuildInfo.displayName",k),n={};if(K().toLowerCase().match(/iphone|ipad|ipod/))n.ibi=g;else if(K().toLowerCase().match(/android/))n.apn=g;else return D(new N("operation-not-supported-in-this-environment"));l&&(n.appDisplayName=l);e=Di(e);n.sessionId=e;var C=Gh(a.B,a.m,a.w,b,c,null,d,a.Fa,n);return a.Ma().then(function(){var b=
a.ve;return a.If.l.set(wi,f.F(),b)}).then(function(){var b=L("cordova.plugins.browsertab.isAvailable",k);if("function"!==typeof b)throw new N("invalid-cordova-configuration");var c=null;b(function(b){if(b){c=L("cordova.plugins.browsertab.openUrl",k);if("function"!==typeof c)throw new N("invalid-cordova-configuration");c(C)}else{c=L("cordova.InAppBrowser.open",k);if("function"!==typeof c)throw new N("invalid-cordova-configuration");b=c;var d=K();d=!(!d.match(/(iPad|iPhone|iPod).*OS 7_\d/i)&&!d.match(/(iPad|iPhone|iPod).*OS 8_\d/i));
a.Jb=b(C,d?"_blank":"_system","location=yes")}})})};Ai.prototype.Cb=function(a){for(var b=0;b<this.na.length;b++)try{this.na[b](a)}catch(c){}};
var Ei=function(a){a.ld||(a.ld=a.Ma().then(function(){return new A(function(b){var c=function(d){b(d);a.Yb(c);return!1};a.bb(c);Hi(a)})}));return a.ld},Gi=function(a){var b=null;return xi(a.Zd).then(function(c){b=c;c=a.Zd;return c.l.remove(wi,c.v)}).then(function(){return b})},Hi=function(a){var b=L("universalLinks.subscribe",k);if("function"!==typeof b)throw new N("invalid-cordova-configuration");var c=new O("unknown",null,null,null,new N("no-auth-event")),d=!1,e=se(a.jf).then(function(){return Gi(a).then(function(){d||
a.Cb(c)})}),f=function(b){d=!0;e&&e.cancel();Gi(a).then(function(d){var e=c;if(d&&b&&b.url){var e=null;var f=b.url;var g=We(f),l=Ve(g,"link"),n=Ve(We(l),"link"),g=Ve(g,"deep_link_id");f=Ve(We(g),"link")||g||n||l||f;-1!=f.indexOf("/__/auth/callback")&&(e=We(f),e=Bf(Ve(e,"firebaseError")||null),e=(e="object"===typeof e?Vf(e):null)?new O(d.ha,d.R,null,null,e):new O(d.ha,d.R,f,d.oc()));e=e||c}a.Cb(e)})},g=k.handleOpenURL;k.handleOpenURL=function(a){0==a.indexOf(L("BuildInfo.packageName",k)+"://")&&f({url:a});
if("function"===typeof g)try{g(a)}catch(n){console.error(n)}};b(null,f)};Ai.prototype.bb=function(a){this.na.push(a);Ei(this).f(function(b){"auth/invalid-cordova-configuration"===b.code&&(b=new O("unknown",null,null,null,new N("no-auth-event")),a(b))})};Ai.prototype.Yb=function(a){Na(this.na,function(b){return b==a})};var Ii=function(a){this.v=a;this.l=si()},Ji={name:"pendingRedirect",T:!1},Ki=function(a){return a.l.set(Ji,"pending",a.v)},Li=function(a){return a.l.remove(Ji,a.v)},Mi=function(a){return a.l.get(Ji,a.v).then(function(a){return"pending"==a})};var Qi=function(a,b,c){this.B=a;this.m=b;this.w=c;this.bc=[];this.kb=!1;this.Yc=q(this.hd,this);this.Sa=new Ni(this);this.ud=new Oi(this);this.Pb=new Ii(this.m+":"+this.w);this.Ba={};this.Ba.unknown=this.Sa;this.Ba.signInViaRedirect=this.Sa;this.Ba.linkViaRedirect=this.Sa;this.Ba.reauthViaRedirect=this.Sa;this.Ba.signInViaPopup=this.ud;this.Ba.linkViaPopup=this.ud;this.Ba.reauthViaPopup=this.ud;this.S=Pi(this.B,this.m,this.w)},Pi=function(a,b,c){var d=firebase.SDK_VERSION||null;return of()?new Ai(a,
b,c,d):new Ch(a,b,c,d)};Qi.prototype.reset=function(){this.kb=!1;this.S.Yb(this.Yc);this.S=Pi(this.B,this.m,this.w)};Qi.prototype.Kb=function(){var a=this;this.kb||(this.kb=!0,this.S.bb(this.Yc));var b=this.S;return this.S.Ma().f(function(c){a.S==b&&a.reset();throw c;})};var Ti=function(a){a.S.te()&&a.Kb().f(function(b){var c=new O("unknown",null,null,null,new N("operation-not-supported-in-this-environment"));Ri(b)&&a.hd(c)});a.S.ce()||Si(a.Sa)};
Qi.prototype.subscribe=function(a){Ka(this.bc,a)||this.bc.push(a);if(!this.kb){var b=this;Mi(this.Pb).then(function(a){a?Li(b.Pb).then(function(){b.Kb().f(function(a){var c=new O("unknown",null,null,null,new N("operation-not-supported-in-this-environment"));Ri(a)&&b.hd(c)})}):Ti(b)}).f(function(){Ti(b)})}};Qi.prototype.unsubscribe=function(a){Na(this.bc,function(b){return b==a})};
Qi.prototype.hd=function(a){if(!a)throw new N("invalid-auth-event");for(var b=!1,c=0;c<this.bc.length;c++){var d=this.bc[c];if(d.Od(a.ha,a.R)){(b=this.Ba[a.ha])&&b.me(a,d);b=!0;break}}Si(this.Sa);return b};var Ui=new Ff(2E3,1E4),Vi=new Ff(3E4,6E4);Qi.prototype.getRedirectResult=function(){return this.Sa.getRedirectResult()};Qi.prototype.Sb=function(a,b,c,d,e){var f=this;return this.S.Sb(a,b,c,function(){f.kb||(f.kb=!0,f.S.bb(f.Yc))},function(){f.reset()},d,e)};
var Ri=function(a){return a&&"auth/cordova-not-ready"==a.code?!0:!1};Qi.prototype.Tb=function(a,b,c){var d=this,e;return Ki(this.Pb).then(function(){return d.S.Tb(a,b,c).f(function(a){if(Ri(a))throw new N("operation-not-supported-in-this-environment");e=a;return Li(d.Pb).then(function(){throw e;})}).then(function(){return d.S.we()?new A(function(){}):Li(d.Pb).then(function(){return d.getRedirectResult()}).then(function(){}).f(function(){})})})};
Qi.prototype.$b=function(a,b,c,d){return this.S.$b(c,function(c){a.Wa(b,null,c,d)},Ui.get())};var Wi={},Xi=function(a,b,c){var d=b+":"+c;Wi[d]||(Wi[d]=new Qi(a,b,c));return Wi[d]},Ni=function(a){this.l=a;this.sb=null;this.Wb=[];this.Vb=[];this.qb=null;this.xd=!1};Ni.prototype.reset=function(){this.sb=null;this.qb&&(this.qb.cancel(),this.qb=null)};
Ni.prototype.me=function(a,b){if(!a)return D(new N("invalid-auth-event"));this.reset();this.xd=!0;var c=a.ha,d=a.R,e=a.getError()&&"auth/web-storage-unsupported"==a.getError().code,f=a.getError()&&"auth/operation-not-supported-in-this-environment"==a.getError().code;"unknown"!=c||e||f?a=a.W?this.vd(a,b):b.Db(c,d)?this.wd(a,b):D(new N("invalid-auth-event")):(Yi(this,!1,null,null),a=B());return a};var Si=function(a){a.xd||(a.xd=!0,Yi(a,!1,null,null))};
Ni.prototype.vd=function(a){Yi(this,!0,null,a.getError());return B()};Ni.prototype.wd=function(a,b){var c=this;b=b.Db(a.ha,a.R);var d=a.vb,e=a.oc(),f=!!a.ha.match(/Redirect$/);return b(d,e).then(function(a){Yi(c,f,a,null)}).f(function(a){Yi(c,f,null,a)})};
var Zi=function(a,b){a.sb=function(){return D(b)};if(a.Vb.length)for(var c=0;c<a.Vb.length;c++)a.Vb[c](b)},$i=function(a,b){a.sb=function(){return B(b)};if(a.Wb.length)for(var c=0;c<a.Wb.length;c++)a.Wb[c](b)},Yi=function(a,b,c,d){b?d?Zi(a,d):$i(a,c):$i(a,{user:null});a.Wb=[];a.Vb=[]};Ni.prototype.getRedirectResult=function(){var a=this;return new A(function(b,c){a.sb?a.sb().then(b,c):(a.Wb.push(b),a.Vb.push(c),aj(a))})};
var aj=function(a){var b=new N("timeout");a.qb&&a.qb.cancel();a.qb=se(Vi.get()).then(function(){a.sb||Yi(a,!0,null,b)})},Oi=function(a){this.l=a};Oi.prototype.me=function(a,b){if(!a)return D(new N("invalid-auth-event"));var c=a.ha,d=a.R;return a.W?this.vd(a,b):b.Db(c,d)?this.wd(a,b):D(new N("invalid-auth-event"))};Oi.prototype.vd=function(a,b){b.Wa(a.ha,null,a.getError(),a.R);return B()};
Oi.prototype.wd=function(a,b){var c=a.R,d=a.ha,e=b.Db(d,c),f=a.vb;a=a.oc();return e(f,a).then(function(a){b.Wa(d,a,null,c)}).f(function(a){b.Wa(d,null,a,c)})};var bj=function(a){this.g=a;this.Ca=this.ba=null;this.Ia=0};bj.prototype.F=function(){return{apiKey:this.g.m,refreshToken:this.ba,accessToken:this.Ca,expirationTime:this.Ia}};
var dj=function(a,b){var c=b.idToken,d=b.refreshToken;b=cj(b.expiresIn);a.Ca=c;a.Ia=b;a.ba=d},cj=function(a){return ma()+1E3*parseInt(a,10)},ej=function(a,b){return Lg(a.g,b).then(function(b){a.Ca=b.access_token;a.Ia=cj(b.expires_in);a.ba=b.refresh_token;return{accessToken:a.Ca,expirationTime:a.Ia,refreshToken:a.ba}}).f(function(b){"auth/user-token-expired"==b.code&&(a.ba=null);throw b;})};
bj.prototype.getToken=function(a){a=!!a;return this.Ca&&!this.ba?D(new N("user-token-expired")):a||!this.Ca||ma()>this.Ia-3E4?this.ba?ej(this,{grant_type:"refresh_token",refresh_token:this.ba}):B(null):B({accessToken:this.Ca,expirationTime:this.Ia,refreshToken:this.ba})};var fj=function(a,b,c,d,e){Lf(this,{uid:a,displayName:d||null,photoURL:e||null,email:c||null,providerId:b})},gj=function(a,b){Kb.call(this,a);for(var c in b)this[c]=b[c]};r(gj,Kb);
var S=function(a,b,c){this.G=[];this.m=a.apiKey;this.w=a.appName;this.B=a.authDomain||null;a=firebase.SDK_VERSION?uf(firebase.SDK_VERSION):null;this.g=new R(this.m,null,a);this.la=new bj(this.g);hj(this,b.idToken);dj(this.la,b);M(this,"refreshToken",this.la.ba);ij(this,c||{});ge.call(this);this.Ec=!1;this.B&&xf()&&(this.s=Xi(this.B,this.m,this.w));this.Kc=[];this.ma=null;this.ob=jj(this);this.xb=q(this.jd,this)};r(S,ge);S.prototype.jd=function(){this.ob.mb&&(this.ob.stop(),this.ob.start())};
var kj=function(a){try{return firebase.app(a.w).auth()}catch(b){throw new N("internal-error","No firebase.auth.Auth instance is available for the Firebase App '"+a.w+"'!");}},jj=function(a){return new hi(function(){return a.getIdToken(!0)},function(a){return a&&"auth/network-request-failed"==a.code?!0:!1},function(){var b=a.la.Ia-ma()-3E5;return 0<b?b:0},3E4,96E4,!1)},lj=function(a){a.Bb||a.ob.mb||(a.ob.start(),fc(a,"tokenChanged",a.xb),Xb(a,"tokenChanged",a.xb))},mj=function(a){fc(a,"tokenChanged",
a.xb);a.ob.stop()},hj=function(a,b){a.he=b;M(a,"_lat",b)},nj=function(a,b){Na(a.Kc,function(a){return a==b})},oj=function(a){for(var b=[],c=0;c<a.Kc.length;c++)b.push(a.Kc[c](a));return qd(b).then(function(){return a})},pj=function(a){a.s&&!a.Ec&&(a.Ec=!0,a.s.subscribe(a))},ij=function(a,b){Lf(a,{uid:b.uid,displayName:b.displayName||null,photoURL:b.photoURL||null,email:b.email||null,emailVerified:b.emailVerified||!1,phoneNumber:b.phoneNumber||null,isAnonymous:b.isAnonymous||!1,providerData:[]})};
M(S.prototype,"providerId","firebase");var qj=function(){},rj=function(a){return B().then(function(){if(a.Bb)throw new N("app-deleted");})},sj=function(a){return Ga(a.providerData,function(a){return a.providerId})},uj=function(a,b){b&&(tj(a,b.providerId),a.providerData.push(b))},tj=function(a,b){Na(a.providerData,function(a){return a.providerId==b})},vj=function(a,b,c){("uid"!=b||c)&&a.hasOwnProperty(b)&&M(a,b,c)};
S.prototype.copy=function(a){var b=this;b!=a&&(Lf(this,{uid:a.uid,displayName:a.displayName,photoURL:a.photoURL,email:a.email,emailVerified:a.emailVerified,phoneNumber:a.phoneNumber,isAnonymous:a.isAnonymous,providerData:[]}),w(a.providerData,function(a){uj(b,a)}),this.la=a.la,M(this,"refreshToken",this.la.ba))};S.prototype.reload=function(){var a=this;return this.b(rj(this).then(function(){return wj(a).then(function(){return oj(a)}).then(qj)}))};
var wj=function(a){return a.getIdToken().then(function(b){var c=a.isAnonymous;return xj(a,b).then(function(){c||vj(a,"isAnonymous",!1);return b})})};S.prototype.getIdToken=function(a){var b=this;return this.b(rj(this).then(function(){return b.la.getToken(a)}).then(function(a){if(!a)throw new N("internal-error");a.accessToken!=b.he&&(hj(b,a.accessToken),b.Oa());vj(b,"refreshToken",a.refreshToken);return a.accessToken}))};
S.prototype.getToken=function(a){If["firebase.User.prototype.getToken is deprecated. Please use firebase.User.prototype.getIdToken instead."]||(If["firebase.User.prototype.getToken is deprecated. Please use firebase.User.prototype.getIdToken instead."]=!0,"undefined"!==typeof console&&"function"===typeof console.warn&&console.warn("firebase.User.prototype.getToken is deprecated. Please use firebase.User.prototype.getIdToken instead."));return this.getIdToken(a)};
var yj=function(a,b){b.idToken&&a.he!=b.idToken&&(dj(a.la,b),a.Oa(),hj(a,b.idToken),vj(a,"refreshToken",a.la.ba))};S.prototype.Oa=function(){this.dispatchEvent(new gj("tokenChanged"))};var xj=function(a,b){return Q(a.g,nh,{idToken:b}).then(q(a.yf,a))};
S.prototype.yf=function(a){a=a.users;if(!a||!a.length)throw new N("internal-error");a=a[0];ij(this,{uid:a.localId,displayName:a.displayName,photoURL:a.photoUrl,email:a.email,emailVerified:!!a.emailVerified,phoneNumber:a.phoneNumber});for(var b=zj(a),c=0;c<b.length;c++)uj(this,b[c]);vj(this,"isAnonymous",!(this.email&&a.passwordHash)&&!(this.providerData&&this.providerData.length))};
var zj=function(a){return(a=a.providerUserInfo)&&a.length?Ga(a,function(a){return new fj(a.rawId,a.providerId,a.email,a.displayName,a.photoUrl)}):[]};S.prototype.reauthenticateAndRetrieveDataWithCredential=function(a){var b=this,c=null;return this.b(a.od(this.g,this.uid).then(function(a){yj(b,a);c=Aj(b,a,"reauthenticate");b.ma=null;return b.reload()}).then(function(){return c}),!0)};S.prototype.reauthenticateWithCredential=function(a){return this.reauthenticateAndRetrieveDataWithCredential(a).then(function(){})};
var Bj=function(a,b){return wj(a).then(function(){if(Ka(sj(a),b))return oj(a).then(function(){throw new N("provider-already-linked");})})};S.prototype.linkAndRetrieveDataWithCredential=function(a){var b=this,c=null;return this.b(Bj(this,a.providerId).then(function(){return b.getIdToken()}).then(function(c){return a.zc(b.g,c)}).then(function(a){c=Aj(b,a,"link");return Cj(b,a)}).then(function(){return c}))};S.prototype.linkWithCredential=function(a){return this.linkAndRetrieveDataWithCredential(a).then(function(a){return a.user})};
S.prototype.linkWithPhoneNumber=function(a,b){var c=this;return this.b(Bj(this,"phone").then(function(){return fi(kj(c),a,b,q(c.linkAndRetrieveDataWithCredential,c))}))};S.prototype.reauthenticateWithPhoneNumber=function(a,b){var c=this;return this.b(B().then(function(){return fi(kj(c),a,b,q(c.reauthenticateAndRetrieveDataWithCredential,c))}),!0)};var Aj=function(a,b,c){var d=yg(b);b=pi(b);return Mf({user:a,credential:d,additionalUserInfo:b,operationType:c})},Cj=function(a,b){yj(a,b);return a.reload().then(function(){return a})};
h=S.prototype;h.updateEmail=function(a){var b=this;return this.b(this.getIdToken().then(function(c){return b.g.updateEmail(c,a)}).then(function(a){yj(b,a);return b.reload()}))};h.updatePhoneNumber=function(a){var b=this;return this.b(this.getIdToken().then(function(c){return a.zc(b.g,c)}).then(function(a){yj(b,a);return b.reload()}))};h.updatePassword=function(a){var b=this;return this.b(this.getIdToken().then(function(c){return b.g.updatePassword(c,a)}).then(function(a){yj(b,a);return b.reload()}))};
h.updateProfile=function(a){if(void 0===a.displayName&&void 0===a.photoURL)return rj(this);var b=this;return this.b(this.getIdToken().then(function(c){return b.g.updateProfile(c,{displayName:a.displayName,photoUrl:a.photoURL})}).then(function(a){yj(b,a);vj(b,"displayName",a.displayName||null);vj(b,"photoURL",a.photoUrl||null);w(b.providerData,function(a){"password"===a.providerId&&(M(a,"displayName",b.displayName),M(a,"photoURL",b.photoURL))});return oj(b)}).then(qj))};
h.unlink=function(a){var b=this;return this.b(wj(this).then(function(c){return Ka(sj(b),a)?bh(b.g,c,[a]).then(function(a){var c={};w(a.providerUserInfo||[],function(a){c[a.providerId]=!0});w(sj(b),function(a){c[a]||tj(b,a)});c[vg.PROVIDER_ID]||M(b,"phoneNumber",null);return oj(b)}):oj(b).then(function(){throw new N("no-such-provider");})}))};
h["delete"]=function(){var a=this;return this.b(this.getIdToken().then(function(b){return Q(a.g,mh,{idToken:b})}).then(function(){a.dispatchEvent(new gj("userDeleted"))})).then(function(){for(var b=0;b<a.G.length;b++)a.G[b].cancel("app-deleted");a.G=[];a.Bb=!0;mj(a);M(a,"refreshToken",null);a.s&&a.s.unsubscribe(a)})};
h.Od=function(a,b){return"linkViaPopup"==a&&(this.ga||null)==b&&this.fa||"reauthViaPopup"==a&&(this.ga||null)==b&&this.fa||"linkViaRedirect"==a&&(this.Aa||null)==b||"reauthViaRedirect"==a&&(this.Aa||null)==b?!0:!1};h.Wa=function(a,b,c,d){"linkViaPopup"!=a&&"reauthViaPopup"!=a||d!=(this.ga||null)||(c&&this.Qa?this.Qa(c):b&&!c&&this.fa&&this.fa(b),this.I&&(this.I.cancel(),this.I=null),delete this.fa,delete this.Qa)};
h.Db=function(a,b){return"linkViaPopup"==a&&b==(this.ga||null)?q(this.Wd,this):"reauthViaPopup"==a&&b==(this.ga||null)?q(this.Xd,this):"linkViaRedirect"==a&&(this.Aa||null)==b?q(this.Wd,this):"reauthViaRedirect"==a&&(this.Aa||null)==b?q(this.Xd,this):null};h.nc=function(){return wf(this.uid+":::")};h.linkWithPopup=function(a){var b=this;return Dj(this,"linkViaPopup",a,function(){return Bj(b,a.providerId).then(function(){return oj(b)})},!1)};
h.reauthenticateWithPopup=function(a){return Dj(this,"reauthViaPopup",a,function(){return B()},!0)};
var Dj=function(a,b,c,d,e){if(!xf())return D(new N("operation-not-supported-in-this-environment"));if(a.ma&&!e)return D(a.ma);var f=Tf(c.providerId),g=a.nc(),l=null;(!yf()||rf())&&a.B&&c.isOAuthProvider&&(l=Gh(a.B,a.m,a.w,b,c,null,g,firebase.SDK_VERSION||null));var n=kf(l,f&&f.Rb,f&&f.Qb);d=d().then(function(){Ej(a);if(!e)return a.getIdToken().then(function(){})}).then(function(){return a.s.Sb(n,b,c,g,!!l)}).then(function(){return new A(function(c,d){a.Wa(b,null,new N("cancelled-popup-request"),a.ga||
null);a.fa=c;a.Qa=d;a.ga=g;a.I=a.s.$b(a,b,n,g)})}).then(function(a){n&&jf(n);return a?Mf(a):null}).f(function(a){n&&jf(n);throw a;});return a.b(d,e)};S.prototype.linkWithRedirect=function(a){var b=this;return Fj(this,"linkViaRedirect",a,function(){return Bj(b,a.providerId)},!1)};S.prototype.reauthenticateWithRedirect=function(a){return Fj(this,"reauthViaRedirect",a,function(){return B()},!0)};
var Fj=function(a,b,c,d,e){if(!xf())return D(new N("operation-not-supported-in-this-environment"));if(a.ma&&!e)return D(a.ma);var f=null,g=a.nc();d=d().then(function(){Ej(a);if(!e)return a.getIdToken().then(function(){})}).then(function(){a.Aa=g;return oj(a)}).then(function(b){a.Ta&&(b=a.Ta,b=b.l.set(Gj,a.F(),b.v));return b}).then(function(){return a.s.Tb(b,c,g)}).f(function(b){f=b;if(a.Ta)return Hj(a.Ta);throw f;}).then(function(){if(f)throw f;});return a.b(d,e)},Ej=function(a){if(!a.s||!a.Ec){if(a.s&&
!a.Ec)throw new N("internal-error");throw new N("auth-domain-config-required");}};S.prototype.Wd=function(a,b){var c=this;this.I&&(this.I.cancel(),this.I=null);var d=null,e=this.getIdToken().then(function(d){return cg(c.g,{requestUri:a,sessionId:b,idToken:d})}).then(function(a){d=Aj(c,a,"link");return Cj(c,a)}).then(function(){return d});return this.b(e)};
S.prototype.Xd=function(a,b){var c=this;this.I&&(this.I.cancel(),this.I=null);var d=null,e=B().then(function(){return Zf(dg(c.g,{requestUri:a,sessionId:b}),c.uid)}).then(function(a){d=Aj(c,a,"reauthenticate");yj(c,a);c.ma=null;return c.reload()}).then(function(){return d});return this.b(e,!0)};S.prototype.sendEmailVerification=function(){var a=this;return this.b(this.getIdToken().then(function(b){return a.g.sendEmailVerification(b)}).then(function(b){if(a.email!=b)return a.reload()}).then(function(){}))};
S.prototype.b=function(a,b){var c=this,d=Ij(this,a,b);this.G.push(d);td(d,function(){Ma(c.G,d)});return d};var Ij=function(a,b,c){return a.ma&&!c?(b.cancel(),D(a.ma)):b.f(function(b){!b||"auth/user-disabled"!=b.code&&"auth/user-token-expired"!=b.code||(a.ma||a.dispatchEvent(new gj("userInvalidated")),a.ma=b);throw b;})};S.prototype.toJSON=function(){return this.F()};
S.prototype.F=function(){var a={uid:this.uid,displayName:this.displayName,photoURL:this.photoURL,email:this.email,emailVerified:this.emailVerified,phoneNumber:this.phoneNumber,isAnonymous:this.isAnonymous,providerData:[],apiKey:this.m,appName:this.w,authDomain:this.B,stsTokenManager:this.la.F(),redirectEventId:this.Aa||null};w(this.providerData,function(b){a.providerData.push(Nf(b))});return a};
var Jj=function(a){if(!a.apiKey)return null;var b={apiKey:a.apiKey,authDomain:a.authDomain,appName:a.appName},c={};if(a.stsTokenManager&&a.stsTokenManager.accessToken&&a.stsTokenManager.expirationTime)c.idToken=a.stsTokenManager.accessToken,c.refreshToken=a.stsTokenManager.refreshToken||null,c.expiresIn=(a.stsTokenManager.expirationTime-ma())/1E3;else return null;var d=new S(b,c,a);a.providerData&&w(a.providerData,function(a){a&&uj(d,Mf(a))});a.redirectEventId&&(d.Aa=a.redirectEventId);return d},
Kj=function(a,b,c){var d=new S(a,b);c&&(d.Ta=c);return d.reload().then(function(){return d})};var Lj=function(a){this.v=a;this.l=si()},Gj={name:"redirectUser",T:!1},Hj=function(a){return a.l.remove(Gj,a.v)},Mj=function(a,b){return a.l.get(Gj,a.v).then(function(a){a&&b&&(a.authDomain=b);return Jj(a||{})})};var Nj=function(a){this.v=a;this.l=si()},Oj={name:"authUser",T:!0},Pj=function(a,b){return a.l.set(Oj,b.F(),a.v)},Qj=function(a){return a.l.remove(Oj,a.v)},Rj=function(a,b){return a.l.get(Oj,a.v).then(function(a){a&&b&&(a.authDomain=b);return Jj(a||{})})};var T=function(a){this.Ga=!1;M(this,"app",a);if(this.h().options&&this.h().options.apiKey)a=firebase.SDK_VERSION?uf(firebase.SDK_VERSION):null,this.g=new R(this.h().options&&this.h().options.apiKey,null,a);else throw new N("invalid-api-key");this.G=[];this.Da=[];this.wb=[];this.uf=firebase.INTERNAL.createSubscribe(q(this.ff,this));this.gc=void 0;this.wf=firebase.INTERNAL.createSubscribe(q(this.hf,this));Sj(this,null);a=this.h().options.apiKey;var b=this.h().name;this.ua=new Nj(a+":"+b);a=this.h().options.apiKey;
b=this.h().name;this.rb=new Lj(a+":"+b);this.ic=this.b(Tj(this));this.ra=this.b(Uj(this));this.xc=!1;this.gd=q(this.Of,this);this.ze=q(this.ib,this);this.xb=q(this.jd,this);this.xe=q(this.bf,this);this.ye=q(this.cf,this);Vj(this);this.INTERNAL={};this.INTERNAL["delete"]=q(this["delete"],this);this.Ja=0};T.prototype.toJSON=function(){return{apiKey:this.h().options.apiKey,authDomain:this.h().options.authDomain,appName:this.h().name,currentUser:U(this)&&U(this).F()}};
var Wj=function(a){return a.Qe||D(new N("auth-domain-config-required"))},Vj=function(a){var b=a.h().options.authDomain,c=a.h().options.apiKey;b&&xf()&&(a.Qe=a.ic.then(function(){if(!a.Ga)return a.s=Xi(b,c,a.h().name),a.s.subscribe(a),U(a)&&pj(U(a)),a.Xb&&(pj(a.Xb),a.Xb=null),a.s}))};h=T.prototype;h.Od=function(a,b){switch(a){case "unknown":case "signInViaRedirect":return!0;case "signInViaPopup":return this.ga==b&&!!this.fa;default:return!1}};
h.Wa=function(a,b,c,d){"signInViaPopup"==a&&this.ga==d&&(c&&this.Qa?this.Qa(c):b&&!c&&this.fa&&this.fa(b),this.I&&(this.I.cancel(),this.I=null),delete this.fa,delete this.Qa)};h.Db=function(a,b){return"signInViaRedirect"==a||"signInViaPopup"==a&&this.ga==b&&this.fa?q(this.Se,this):null};
h.Se=function(a,b){var c=this;a={requestUri:a,sessionId:b};this.I&&(this.I.cancel(),this.I=null);var d=null,e=null,f=ag(c.g,a).then(function(a){d=yg(a);e=pi(a);return a});a=c.ic.then(function(){return f}).then(function(a){return Xj(c,a)}).then(function(){return Mf({user:U(c),credential:d,additionalUserInfo:e,operationType:"signIn"})});return this.b(a)};h.nc=function(){return wf()};
h.signInWithPopup=function(a){if(!xf())return D(new N("operation-not-supported-in-this-environment"));var b=this,c=Tf(a.providerId),d=this.nc(),e=null;(!yf()||rf())&&this.h().options.authDomain&&a.isOAuthProvider&&(e=Gh(this.h().options.authDomain,this.h().options.apiKey,this.h().name,"signInViaPopup",a,null,d,firebase.SDK_VERSION||null));var f=kf(e,c&&c.Rb,c&&c.Qb),c=Wj(this).then(function(b){return b.Sb(f,"signInViaPopup",a,d,!!e)}).then(function(){return new A(function(a,c){b.Wa("signInViaPopup",
null,new N("cancelled-popup-request"),b.ga);b.fa=a;b.Qa=c;b.ga=d;b.I=b.s.$b(b,"signInViaPopup",f,d)})}).then(function(a){f&&jf(f);return a?Mf(a):null}).f(function(a){f&&jf(f);throw a;});return this.b(c)};h.signInWithRedirect=function(a){if(!xf())return D(new N("operation-not-supported-in-this-environment"));var b=this,c=Wj(this).then(function(){return b.s.Tb("signInViaRedirect",a)});return this.b(c)};
h.getRedirectResult=function(){if(!xf())return D(new N("operation-not-supported-in-this-environment"));var a=this,b=Wj(this).then(function(){return a.s.getRedirectResult()}).then(function(a){return a?Mf(a):null});return this.b(b)};
var Xj=function(a,b){var c={};c.apiKey=a.h().options.apiKey;c.authDomain=a.h().options.authDomain;c.appName=a.h().name;return a.ic.then(function(){return Kj(c,b,a.rb)}).then(function(b){if(U(a)&&b.uid==U(a).uid)return U(a).copy(b),a.ib(b);Sj(a,b);pj(b);return a.ib(b)}).then(function(){a.Oa()})},Sj=function(a,b){U(a)&&(nj(U(a),a.ze),fc(U(a),"tokenChanged",a.xb),fc(U(a),"userDeleted",a.xe),fc(U(a),"userInvalidated",a.ye),mj(U(a)));b&&(b.Kc.push(a.ze),Xb(b,"tokenChanged",a.xb),Xb(b,"userDeleted",a.xe),
Xb(b,"userInvalidated",a.ye),0<a.Ja&&lj(b));M(a,"currentUser",b)};T.prototype.signOut=function(){var a=this,b=this.ra.then(function(){if(!U(a))return B();Sj(a,null);return Qj(a.ua).then(function(){a.Oa()})});return this.b(b)};
var Yj=function(a){var b=a.h().options.authDomain,b=Mj(a.rb,b).then(function(b){if(a.Xb=b)b.Ta=a.rb;return Hj(a.rb)});return a.b(b)},Tj=function(a){var b=a.h().options.authDomain,c=Yj(a).then(function(){return Rj(a.ua,b)}).then(function(b){return b?(b.Ta=a.rb,a.Xb&&(a.Xb.Aa||null)==(b.Aa||null)?b:b.reload().then(function(){return Pj(a.ua,b).then(function(){return b})}).f(function(c){return"auth/network-request-failed"==c.code?b:Qj(a.ua)})):null}).then(function(b){Sj(a,b||null)});return a.b(c)},Uj=
function(a){return a.ic.then(function(){return a.getRedirectResult()}).f(function(){}).then(function(){if(!a.Ga)return a.gd()}).f(function(){}).then(function(){if(!a.Ga){a.xc=!0;var b=a.ua;b.l.addListener(Oj,b.v,a.gd)}})};h=T.prototype;
h.Of=function(){var a=this,b=this.h().options.authDomain;return Rj(this.ua,b).then(function(b){if(!a.Ga){var c;if(c=U(a)&&b){c=U(a).uid;var e=b.uid;c=void 0===c||null===c||""===c||void 0===e||null===e||""===e?!1:c==e}if(c)return U(a).copy(b),U(a).getIdToken();if(U(a)||b)Sj(a,b),b&&(pj(b),b.Ta=a.rb),a.s&&a.s.subscribe(a),a.Oa()}})};h.ib=function(a){return Pj(this.ua,a)};h.jd=function(){this.Oa();this.ib(U(this))};h.bf=function(){this.signOut()};h.cf=function(){this.signOut()};
var Zj=function(a,b){var c=null,d=null;return a.b(b.then(function(b){c=yg(b);d=pi(b);return Xj(a,b)}).then(function(){return Mf({user:U(a),credential:c,additionalUserInfo:d,operationType:"signIn"})}))};h=T.prototype;h.ff=function(a){var b=this;this.addAuthTokenListener(function(){a.next(U(b))})};h.hf=function(a){var b=this;ak(this,function(){a.next(U(b))})};
h.onIdTokenChanged=function(a,b,c){var d=this;this.xc&&firebase.Promise.resolve().then(function(){p(a)?a(U(d)):p(a.next)&&a.next(U(d))});return this.uf(a,b,c)};h.onAuthStateChanged=function(a,b,c){var d=this;this.xc&&firebase.Promise.resolve().then(function(){d.gc=d.getUid();p(a)?a(U(d)):p(a.next)&&a.next(U(d))});return this.wf(a,b,c)};h.getIdToken=function(a){var b=this,c=this.ra.then(function(){return U(b)?U(b).getIdToken(a).then(function(a){return{accessToken:a}}):null});return this.b(c)};
h.signInWithCustomToken=function(a){var b=this;return this.ra.then(function(){return Zj(b,Q(b.g,ph,{token:a}))}).then(function(a){a=a.user;vj(a,"isAnonymous",!1);return b.ib(a)}).then(function(){return U(b)})};h.signInWithEmailAndPassword=function(a,b){var c=this;return this.ra.then(function(){return Zj(c,Q(c.g,og,{email:a,password:b}))}).then(function(a){return a.user})};h.createUserWithEmailAndPassword=function(a,b){var c=this;return this.ra.then(function(){return Zj(c,Q(c.g,lh,{email:a,password:b}))}).then(function(a){return a.user})};
h.signInWithCredential=function(a){return this.signInAndRetrieveDataWithCredential(a).then(function(a){return a.user})};h.signInAndRetrieveDataWithCredential=function(a){var b=this;return this.ra.then(function(){return Zj(b,a.Eb(b.g))})};h.signInAnonymously=function(){var a=this;return this.ra.then(function(){var b=U(a);return b&&b.isAnonymous?b:Zj(a,a.g.signInAnonymously()).then(function(b){b=b.user;vj(b,"isAnonymous",!0);return a.ib(b)}).then(function(){return U(a)})})};h.h=function(){return this.app};
var U=function(a){return a.currentUser};T.prototype.getUid=function(){return U(this)&&U(this).uid||null};var bk=function(a){return U(a)&&U(a)._lat||null};h=T.prototype;h.Oa=function(){if(this.xc){for(var a=0;a<this.Da.length;a++)if(this.Da[a])this.Da[a](bk(this));if(this.gc!==this.getUid()&&this.wb.length)for(this.gc=this.getUid(),a=0;a<this.wb.length;a++)if(this.wb[a])this.wb[a](bk(this))}};h.Ie=function(a){this.addAuthTokenListener(a);this.Ja++;0<this.Ja&&U(this)&&lj(U(this))};
h.Cf=function(a){var b=this;w(this.Da,function(c){c==a&&b.Ja--});0>this.Ja&&(this.Ja=0);0==this.Ja&&U(this)&&mj(U(this));this.removeAuthTokenListener(a)};h.addAuthTokenListener=function(a){var b=this;this.Da.push(a);this.b(this.ra.then(function(){b.Ga||Ka(b.Da,a)&&a(bk(b))}))};h.removeAuthTokenListener=function(a){Na(this.Da,function(b){return b==a})};var ak=function(a,b){a.wb.push(b);a.b(a.ra.then(function(){!a.Ga&&Ka(a.wb,b)&&a.gc!==a.getUid()&&(a.gc=a.getUid(),b(bk(a)))}))};h=T.prototype;
h["delete"]=function(){this.Ga=!0;for(var a=0;a<this.G.length;a++)this.G[a].cancel("app-deleted");this.G=[];this.ua&&(a=this.ua,a.l.removeListener(Oj,a.v,this.gd));this.s&&this.s.unsubscribe(this);return firebase.Promise.resolve()};h.b=function(a){var b=this;this.G.push(a);td(a,function(){Ma(b.G,a)});return a};h.fetchProvidersForEmail=function(a){return this.b(Qg(this.g,a))};h.verifyPasswordResetCode=function(a){return this.checkActionCode(a).then(function(a){return a.data.email})};
h.confirmPasswordReset=function(a,b){return this.b(this.g.confirmPasswordReset(a,b).then(function(){}))};h.checkActionCode=function(a){return this.b(this.g.checkActionCode(a).then(function(a){return new gi(a)}))};h.applyActionCode=function(a){return this.b(this.g.applyActionCode(a).then(function(){}))};h.sendPasswordResetEmail=function(a){return this.b(this.g.sendPasswordResetEmail(a).then(function(){}))};
h.signInWithPhoneNumber=function(a,b){return this.b(fi(this,a,b,q(this.signInAndRetrieveDataWithCredential,this)))};var ck="First Second Third Fourth Fifth Sixth Seventh Eighth Ninth".split(" "),V=function(a,b){return{name:a||"",N:"a valid string",optional:!!b,O:m}},dk=function(){return{name:"opt_forceRefresh",N:"a boolean",optional:!0,O:ba}},W=function(a,b){return{name:a||"",N:"a valid object",optional:!!b,O:ia}},ek=function(a,b){return{name:a||"",N:"a function",optional:!!b,O:p}},fk=function(){return{name:"",N:"null",optional:!1,O:fa}},gk=function(){return{name:"",N:"an HTML element",optional:!1,O:function(a){return!!(a&&
a instanceof Element)}}},hk=function(){return{name:"auth",N:"an instance of Firebase Auth",optional:!0,O:function(a){return!!(a&&a instanceof T)}}},ik=function(){return{name:"app",N:"an instance of Firebase App",optional:!0,O:function(a){return!!(a&&a instanceof firebase.app.App)}}},jk=function(a){return{name:a?a+"Credential":"credential",N:a?"a valid "+a+" credential":"a valid credential",optional:!1,O:function(b){if(!b)return!1;var c=!a||b.providerId===a;return!(!b.Eb||!c)}}},kk=function(){return{name:"authProvider",
N:"a valid Auth provider",optional:!1,O:function(a){return!!(a&&a.providerId&&a.hasOwnProperty&&a.hasOwnProperty("isOAuthProvider"))}}},lk=function(){return{name:"applicationVerifier",N:"an implementation of firebase.auth.ApplicationVerifier",optional:!1,O:function(a){return!!(a&&m(a.type)&&p(a.verify))}}},X=function(a,b,c,d){return{name:c||"",N:a.N+" or "+b.N,optional:!!d,O:function(c){return a.O(c)||b.O(c)}}};var Y=function(a,b){for(var c in b){var d=b[c].name;a[d]=mk(d,a[c],b[c].a)}},Z=function(a,b,c,d){a[b]=mk(b,c,d)},mk=function(a,b,c){if(!c)return b;var d=nk(a);a=function(){var a=Array.prototype.slice.call(arguments);a:{var e=Array.prototype.slice.call(a);var l=0;for(var n=!1,C=0;C<c.length;C++)if(c[C].optional)n=!0;else{if(n)throw new N("internal-error","Argument validator encountered a required argument after an optional argument.");l++}n=c.length;if(e.length<l||n<e.length)e="Expected "+(l==n?1==
l?"1 argument":l+" arguments":l+"-"+n+" arguments")+" but got "+e.length+".";else{for(l=0;l<e.length;l++)if(n=c[l].optional&&void 0===e[l],!c[l].O(e[l])&&!n){e=c[l];if(0>l||l>=ck.length)throw new N("internal-error","Argument validator received an unsupported number of arguments.");e=ck[l]+" argument "+(e.name?'"'+e.name+'" ':"")+"must be "+e.N+".";break a}e=null}}if(e)throw new N("argument-error",d+" failed: "+e);return b.apply(this,a)};for(var e in b)a[e]=b[e];for(e in b.prototype)a.prototype[e]=
b.prototype[e];return a},nk=function(a){a=a.split(".");return a[a.length-1]};Y(T.prototype,{applyActionCode:{name:"applyActionCode",a:[V("code")]},checkActionCode:{name:"checkActionCode",a:[V("code")]},confirmPasswordReset:{name:"confirmPasswordReset",a:[V("code"),V("newPassword")]},createUserWithEmailAndPassword:{name:"createUserWithEmailAndPassword",a:[V("email"),V("password")]},fetchProvidersForEmail:{name:"fetchProvidersForEmail",a:[V("email")]},getRedirectResult:{name:"getRedirectResult",a:[]},onAuthStateChanged:{name:"onAuthStateChanged",a:[X(W(),ek(),"nextOrObserver"),
ek("opt_error",!0),ek("opt_completed",!0)]},onIdTokenChanged:{name:"onIdTokenChanged",a:[X(W(),ek(),"nextOrObserver"),ek("opt_error",!0),ek("opt_completed",!0)]},sendPasswordResetEmail:{name:"sendPasswordResetEmail",a:[V("email")]},signInAndRetrieveDataWithCredential:{name:"signInAndRetrieveDataWithCredential",a:[jk()]},signInAnonymously:{name:"signInAnonymously",a:[]},signInWithCredential:{name:"signInWithCredential",a:[jk()]},signInWithCustomToken:{name:"signInWithCustomToken",a:[V("token")]},signInWithEmailAndPassword:{name:"signInWithEmailAndPassword",
a:[V("email"),V("password")]},signInWithPhoneNumber:{name:"signInWithPhoneNumber",a:[V("phoneNumber"),lk()]},signInWithPopup:{name:"signInWithPopup",a:[kk()]},signInWithRedirect:{name:"signInWithRedirect",a:[kk()]},signOut:{name:"signOut",a:[]},toJSON:{name:"toJSON",a:[V(null,!0)]},verifyPasswordResetCode:{name:"verifyPasswordResetCode",a:[V("code")]}});
Y(S.prototype,{"delete":{name:"delete",a:[]},getIdToken:{name:"getIdToken",a:[dk()]},getToken:{name:"getToken",a:[dk()]},linkAndRetrieveDataWithCredential:{name:"linkAndRetrieveDataWithCredential",a:[jk()]},linkWithCredential:{name:"linkWithCredential",a:[jk()]},linkWithPhoneNumber:{name:"linkWithPhoneNumber",a:[V("phoneNumber"),lk()]},linkWithPopup:{name:"linkWithPopup",a:[kk()]},linkWithRedirect:{name:"linkWithRedirect",a:[kk()]},reauthenticateAndRetrieveDataWithCredential:{name:"reauthenticateAndRetrieveDataWithCredential",
a:[jk()]},reauthenticateWithCredential:{name:"reauthenticateWithCredential",a:[jk()]},reauthenticateWithPhoneNumber:{name:"reauthenticateWithPhoneNumber",a:[V("phoneNumber"),lk()]},reauthenticateWithPopup:{name:"reauthenticateWithPopup",a:[kk()]},reauthenticateWithRedirect:{name:"reauthenticateWithRedirect",a:[kk()]},reload:{name:"reload",a:[]},sendEmailVerification:{name:"sendEmailVerification",a:[]},toJSON:{name:"toJSON",a:[V(null,!0)]},unlink:{name:"unlink",a:[V("provider")]},updateEmail:{name:"updateEmail",
a:[V("email")]},updatePassword:{name:"updatePassword",a:[V("password")]},updatePhoneNumber:{name:"updatePhoneNumber",a:[jk("phone")]},updateProfile:{name:"updateProfile",a:[W("profile")]}});Y(A.prototype,{f:{name:"catch"},then:{name:"then"}});Y(ei.prototype,{confirm:{name:"confirm",a:[V("verificationCode")]}});Z(qg,"credential",function(a,b){return new ng(a,b)},[V("email"),V("password")]);Y(fg.prototype,{addScope:{name:"addScope",a:[V("scope")]},setCustomParameters:{name:"setCustomParameters",a:[W("customOAuthParameters")]}});
Z(fg,"credential",gg,[X(V(),W(),"token")]);Y(hg.prototype,{addScope:{name:"addScope",a:[V("scope")]},setCustomParameters:{name:"setCustomParameters",a:[W("customOAuthParameters")]}});Z(hg,"credential",ig,[X(V(),W(),"token")]);Y(jg.prototype,{addScope:{name:"addScope",a:[V("scope")]},setCustomParameters:{name:"setCustomParameters",a:[W("customOAuthParameters")]}});Z(jg,"credential",kg,[X(V(),X(W(),fk()),"idToken"),X(V(),fk(),"accessToken",!0)]);
Y(lg.prototype,{setCustomParameters:{name:"setCustomParameters",a:[W("customOAuthParameters")]}});Z(lg,"credential",mg,[X(V(),W(),"token"),V("secret",!0)]);Y(P.prototype,{addScope:{name:"addScope",a:[V("scope")]},credential:{name:"credential",a:[X(V(),fk(),"idToken",!0),X(V(),fk(),"accessToken",!0)]},setCustomParameters:{name:"setCustomParameters",a:[W("customOAuthParameters")]}});Z(vg,"credential",xg,[V("verificationId"),V("verificationCode")]);
Y(vg.prototype,{verifyPhoneNumber:{name:"verifyPhoneNumber",a:[V("phoneNumber"),lk()]}});Y(N.prototype,{toJSON:{name:"toJSON",a:[V(null,!0)]}});Y(Ag.prototype,{toJSON:{name:"toJSON",a:[V(null,!0)]}});Y(Xf.prototype,{toJSON:{name:"toJSON",a:[V(null,!0)]}});Y(Hh.prototype,{clear:{name:"clear",a:[]},render:{name:"render",a:[]},verify:{name:"verify",a:[]}});
(function(){if("undefined"!==typeof firebase&&firebase.INTERNAL&&firebase.INTERNAL.registerService){var a={Auth:T,Error:N};Z(a,"EmailAuthProvider",qg,[]);Z(a,"FacebookAuthProvider",fg,[]);Z(a,"GithubAuthProvider",hg,[]);Z(a,"GoogleAuthProvider",jg,[]);Z(a,"TwitterAuthProvider",lg,[]);Z(a,"OAuthProvider",P,[V("providerId")]);Z(a,"PhoneAuthProvider",vg,[hk()]);Z(a,"RecaptchaVerifier",Hh,[X(V(),gk(),"recaptchaContainer"),W("recaptchaParameters",!0),ik()]);firebase.INTERNAL.registerService("auth",function(a,
c){a=new T(a);c({INTERNAL:{getUid:q(a.getUid,a),getToken:q(a.getIdToken,a),addAuthTokenListener:q(a.Ie,a),removeAuthTokenListener:q(a.Cf,a)}});return a},a,function(a,c){if("create"===a)try{c.auth()}catch(d){}});firebase.INTERNAL.extendNamespace({User:S})}else throw Error("Cannot find the firebase namespace; be sure to include firebase-app.js before this library.");})();}).call(this);
}).call(typeof global !== undefined ? global : typeof self !== undefined ? self : typeof window !== undefined ? window : {});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(27)))

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/

---

typedarray.js
Copyright (c) 2010, Linden Research, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

(function() {
            var firebase = __webpack_require__(9);
            var g,aa=this;function n(a){return void 0!==a}function ba(){}function ca(a){a.Vb=function(){return a.Ye?a.Ye:a.Ye=new a}}
function da(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";
else if("function"==b&&"undefined"==typeof a.call)return"object";return b}function ea(a){return"array"==da(a)}function fa(a){var b=da(a);return"array"==b||"object"==b&&"number"==typeof a.length}function p(a){return"string"==typeof a}function ga(a){return"number"==typeof a}function ha(a){return"function"==da(a)}function ia(a){var b=typeof a;return"object"==b&&null!=a||"function"==b}function ja(a,b,c){return a.call.apply(a.bind,arguments)}
function ka(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}function q(a,b,c){q=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ja:ka;return q.apply(null,arguments)}
function la(a,b){function c(){}c.prototype=b.prototype;a.wg=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.sg=function(a,c,f){for(var h=Array(arguments.length-2),k=2;k<arguments.length;k++)h[k-2]=arguments[k];return b.prototype[c].apply(a,h)}};function ma(a){a=String(a);if(/^\s*$/.test(a)?0:/^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g,"@").replace(/"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g,"")))try{return eval("("+a+")")}catch(b){}throw Error("Invalid JSON string: "+a);}function na(){this.Fd=void 0}
function oa(a,b,c){switch(typeof b){case "string":pa(b,c);break;case "number":c.push(isFinite(b)&&!isNaN(b)?b:"null");break;case "boolean":c.push(b);break;case "undefined":c.push("null");break;case "object":if(null==b){c.push("null");break}if(ea(b)){var d=b.length;c.push("[");for(var e="",f=0;f<d;f++)c.push(e),e=b[f],oa(a,a.Fd?a.Fd.call(b,String(f),e):e,c),e=",";c.push("]");break}c.push("{");d="";for(f in b)Object.prototype.hasOwnProperty.call(b,f)&&(e=b[f],"function"!=typeof e&&(c.push(d),pa(f,c),
c.push(":"),oa(a,a.Fd?a.Fd.call(b,f,e):e,c),d=","));c.push("}");break;case "function":break;default:throw Error("Unknown type: "+typeof b);}}var qa={'"':'\\"',"\\":"\\\\","/":"\\/","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\u000b"},ra=/\uffff/.test("\uffff")?/[\\\"\x00-\x1f\x7f-\uffff]/g:/[\\\"\x00-\x1f\x7f-\xff]/g;
function pa(a,b){b.push('"',a.replace(ra,function(a){if(a in qa)return qa[a];var b=a.charCodeAt(0),e="\\u";16>b?e+="000":256>b?e+="00":4096>b&&(e+="0");return qa[a]=e+b.toString(16)}),'"')};function sa(){this.Wa=-1};function ta(){this.Wa=-1;this.Wa=64;this.M=[];this.Wd=[];this.Af=[];this.zd=[];this.zd[0]=128;for(var a=1;a<this.Wa;++a)this.zd[a]=0;this.Pd=this.$b=0;this.reset()}la(ta,sa);ta.prototype.reset=function(){this.M[0]=1732584193;this.M[1]=4023233417;this.M[2]=2562383102;this.M[3]=271733878;this.M[4]=3285377520;this.Pd=this.$b=0};
function ua(a,b,c){c||(c=0);var d=a.Af;if(p(b))for(var e=0;16>e;e++)d[e]=b.charCodeAt(c)<<24|b.charCodeAt(c+1)<<16|b.charCodeAt(c+2)<<8|b.charCodeAt(c+3),c+=4;else for(e=0;16>e;e++)d[e]=b[c]<<24|b[c+1]<<16|b[c+2]<<8|b[c+3],c+=4;for(e=16;80>e;e++){var f=d[e-3]^d[e-8]^d[e-14]^d[e-16];d[e]=(f<<1|f>>>31)&4294967295}b=a.M[0];c=a.M[1];for(var h=a.M[2],k=a.M[3],m=a.M[4],l,e=0;80>e;e++)40>e?20>e?(f=k^c&(h^k),l=1518500249):(f=c^h^k,l=1859775393):60>e?(f=c&h|k&(c|h),l=2400959708):(f=c^h^k,l=3395469782),f=(b<<
5|b>>>27)+f+m+l+d[e]&4294967295,m=k,k=h,h=(c<<30|c>>>2)&4294967295,c=b,b=f;a.M[0]=a.M[0]+b&4294967295;a.M[1]=a.M[1]+c&4294967295;a.M[2]=a.M[2]+h&4294967295;a.M[3]=a.M[3]+k&4294967295;a.M[4]=a.M[4]+m&4294967295}
ta.prototype.update=function(a,b){if(null!=a){n(b)||(b=a.length);for(var c=b-this.Wa,d=0,e=this.Wd,f=this.$b;d<b;){if(0==f)for(;d<=c;)ua(this,a,d),d+=this.Wa;if(p(a))for(;d<b;){if(e[f]=a.charCodeAt(d),++f,++d,f==this.Wa){ua(this,e);f=0;break}}else for(;d<b;)if(e[f]=a[d],++f,++d,f==this.Wa){ua(this,e);f=0;break}}this.$b=f;this.Pd+=b}};var r;a:{var va=aa.navigator;if(va){var wa=va.userAgent;if(wa){r=wa;break a}}r=""};var t=Array.prototype,xa=t.indexOf?function(a,b,c){return t.indexOf.call(a,b,c)}:function(a,b,c){c=null==c?0:0>c?Math.max(0,a.length+c):c;if(p(a))return p(b)&&1==b.length?a.indexOf(b,c):-1;for(;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},ya=t.forEach?function(a,b,c){t.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=p(a)?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a)},za=t.filter?function(a,b,c){return t.filter.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=[],f=0,h=p(a)?
a.split(""):a,k=0;k<d;k++)if(k in h){var m=h[k];b.call(c,m,k,a)&&(e[f++]=m)}return e},Aa=t.map?function(a,b,c){return t.map.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=Array(d),f=p(a)?a.split(""):a,h=0;h<d;h++)h in f&&(e[h]=b.call(c,f[h],h,a));return e},Ba=t.reduce?function(a,b,c,d){for(var e=[],f=1,h=arguments.length;f<h;f++)e.push(arguments[f]);d&&(e[0]=q(b,d));return t.reduce.apply(a,e)}:function(a,b,c,d){var e=c;ya(a,function(c,h){e=b.call(d,e,c,h,a)});return e},Ca=t.every?function(a,b,
c){return t.every.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=p(a)?a.split(""):a,f=0;f<d;f++)if(f in e&&!b.call(c,e[f],f,a))return!1;return!0};function Da(a,b){var c=Ea(a,b,void 0);return 0>c?null:p(a)?a.charAt(c):a[c]}function Ea(a,b,c){for(var d=a.length,e=p(a)?a.split(""):a,f=0;f<d;f++)if(f in e&&b.call(c,e[f],f,a))return f;return-1}function Fa(a,b){var c=xa(a,b);0<=c&&t.splice.call(a,c,1)}function Ga(a,b,c){return 2>=arguments.length?t.slice.call(a,b):t.slice.call(a,b,c)}
function Ha(a,b){a.sort(b||Ia)}function Ia(a,b){return a>b?1:a<b?-1:0};function v(a,b){for(var c in a)b.call(void 0,a[c],c,a)}function Ja(a,b){var c={},d;for(d in a)c[d]=b.call(void 0,a[d],d,a);return c}function Ka(a,b){for(var c in a)if(!b.call(void 0,a[c],c,a))return!1;return!0}function La(a){var b=0,c;for(c in a)b++;return b}function Ma(a){for(var b in a)return b}function Na(a){var b=[],c=0,d;for(d in a)b[c++]=a[d];return b}function Oa(a){var b=[],c=0,d;for(d in a)b[c++]=d;return b}function Pa(a,b){for(var c in a)if(a[c]==b)return!0;return!1}
function Qa(a,b,c){for(var d in a)if(b.call(c,a[d],d,a))return d}function Ra(a,b){var c=Qa(a,b,void 0);return c&&a[c]}function Sa(a){for(var b in a)return!1;return!0}function Ta(a){var b={},c;for(c in a)b[c]=a[c];return b};var Ua=-1!=r.indexOf("Opera")||-1!=r.indexOf("OPR"),Va=-1!=r.indexOf("Trident")||-1!=r.indexOf("MSIE"),Wa=-1!=r.indexOf("Gecko")&&-1==r.toLowerCase().indexOf("webkit")&&!(-1!=r.indexOf("Trident")||-1!=r.indexOf("MSIE")),Xa=-1!=r.toLowerCase().indexOf("webkit");
(function(){var a="",b;if(Ua&&aa.opera)return a=aa.opera.version,ha(a)?a():a;Wa?b=/rv\:([^\);]+)(\)|;)/:Va?b=/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/:Xa&&(b=/WebKit\/(\S+)/);b&&(a=(a=b.exec(r))?a[1]:"");return Va&&(b=(b=aa.document)?b.documentMode:void 0,b>parseFloat(a))?String(b):a})();var Ya=null,Za=null,$a=null;function ab(a,b){if(!fa(a))throw Error("encodeByteArray takes an array as a parameter");bb();for(var c=b?Za:Ya,d=[],e=0;e<a.length;e+=3){var f=a[e],h=e+1<a.length,k=h?a[e+1]:0,m=e+2<a.length,l=m?a[e+2]:0,u=f>>2,f=(f&3)<<4|k>>4,k=(k&15)<<2|l>>6,l=l&63;m||(l=64,h||(k=64));d.push(c[u],c[f],c[k],c[l])}return d.join("")}
function bb(){if(!Ya){Ya={};Za={};$a={};for(var a=0;65>a;a++)Ya[a]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(a),Za[a]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.".charAt(a),$a[Za[a]]=a,62<=a&&($a["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(a)]=a)}};function cb(a,b){if(!a)throw db(b);}function db(a){return Error("Firebase Database ("+firebase.SDK_VERSION+") INTERNAL ASSERT FAILED: "+a)};function eb(a,b){return Object.prototype.hasOwnProperty.call(a,b)}function w(a,b){if(Object.prototype.hasOwnProperty.call(a,b))return a[b]}function fb(a,b){for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&b(c,a[c])};function gb(a){var b=[];fb(a,function(a,d){ea(d)?ya(d,function(d){b.push(encodeURIComponent(a)+"="+encodeURIComponent(d))}):b.push(encodeURIComponent(a)+"="+encodeURIComponent(d))});return b.length?"&"+b.join("&"):""};var hb=firebase.Promise;function ib(){var a=this;this.reject=this.resolve=null;this.ra=new hb(function(b,c){a.resolve=b;a.reject=c})}function jb(a,b){return function(c,d){c?a.reject(c):a.resolve(d);ha(b)&&(kb(a.ra),1===b.length?b(c):b(c,d))}}function kb(a){a.then(void 0,ba)};function lb(a){return"undefined"!==typeof JSON&&n(JSON.parse)?JSON.parse(a):ma(a)}function x(a){if("undefined"!==typeof JSON&&n(JSON.stringify))a=JSON.stringify(a);else{var b=[];oa(new na,a,b);a=b.join("")}return a};function mb(a){for(var b=[],c=0,d=0;d<a.length;d++){var e=a.charCodeAt(d);55296<=e&&56319>=e&&(e-=55296,d++,cb(d<a.length,"Surrogate pair missing trail surrogate."),e=65536+(e<<10)+(a.charCodeAt(d)-56320));128>e?b[c++]=e:(2048>e?b[c++]=e>>6|192:(65536>e?b[c++]=e>>12|224:(b[c++]=e>>18|240,b[c++]=e>>12&63|128),b[c++]=e>>6&63|128),b[c++]=e&63|128)}return b}function nb(a){for(var b=0,c=0;c<a.length;c++){var d=a.charCodeAt(c);128>d?b++:2048>d?b+=2:55296<=d&&56319>=d?(b+=4,c++):b+=3}return b};function y(a,b,c,d){var e;d<b?e="at least "+b:d>c&&(e=0===c?"none":"no more than "+c);if(e)throw Error(a+" failed: Was called with "+d+(1===d?" argument.":" arguments.")+" Expects "+e+".");}function A(a,b,c){var d="";switch(b){case 1:d=c?"first":"First";break;case 2:d=c?"second":"Second";break;case 3:d=c?"third":"Third";break;case 4:d=c?"fourth":"Fourth";break;default:throw Error("errorPrefix called with argumentNumber > 4.  Need to update it?");}return a=a+" failed: "+(d+" argument ")}
function B(a,b,c,d){if((!d||n(c))&&!ha(c))throw Error(A(a,b,d)+"must be a valid function.");}function ob(a,b,c){if(n(c)&&(!ia(c)||null===c))throw Error(A(a,b,!0)+"must be a valid context object.");};function pb(){return"undefined"!==typeof window&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test("undefined"!==typeof navigator&&"string"===typeof navigator.userAgent?navigator.userAgent:"")};function C(a,b){this.name=a;this.R=b}function qb(a,b){return new C(a,b)};function rb(a,b){return sb(a.name,b.name)}function tb(a,b){return sb(a,b)};function ub(a){this.uc=a;this.Cd="firebase:"}g=ub.prototype;g.set=function(a,b){null==b?this.uc.removeItem(this.Cd+a):this.uc.setItem(this.Cd+a,x(b))};g.get=function(a){a=this.uc.getItem(this.Cd+a);return null==a?null:lb(a)};g.remove=function(a){this.uc.removeItem(this.Cd+a)};g.Ze=!1;g.toString=function(){return this.uc.toString()};function vb(){this.pc={}}vb.prototype.set=function(a,b){null==b?delete this.pc[a]:this.pc[a]=b};vb.prototype.get=function(a){return eb(this.pc,a)?this.pc[a]:null};vb.prototype.remove=function(a){delete this.pc[a]};vb.prototype.Ze=!0;function wb(a){try{if("undefined"!==typeof window&&"undefined"!==typeof window[a]){var b=window[a];b.setItem("firebase:sentinel","cache");b.removeItem("firebase:sentinel");return new ub(b)}}catch(c){}return new vb}var xb=wb("localStorage"),yb=wb("sessionStorage");function zb(a,b,c,d,e){this.host=a.toLowerCase();this.domain=this.host.substr(this.host.indexOf(".")+1);this.Sc=b;this.pe=c;this.qg=d;this.gf=e||"";this.$a=xb.get("host:"+a)||this.host}function Ab(a,b){b!==a.$a&&(a.$a=b,"s-"===a.$a.substr(0,2)&&xb.set("host:"+a.host,a.$a))}
function Bb(a,b,c){D("string"===typeof b,"typeof type must == string");D("object"===typeof c,"typeof params must == object");if(b===Cb)b=(a.Sc?"wss://":"ws://")+a.$a+"/.ws?";else if(b===Db)b=(a.Sc?"https://":"http://")+a.$a+"/.lp?";else throw Error("Unknown connection type: "+b);a.host!==a.$a&&(c.ns=a.pe);var d=[];v(c,function(a,b){d.push(b+"="+a)});return b+d.join("&")}zb.prototype.toString=function(){var a=(this.Sc?"https://":"http://")+this.host;this.gf&&(a+="<"+this.gf+">");return a};function Eb(a,b){return a&&"object"===typeof a?(D(".sv"in a,"Unexpected leaf node or priority contents"),b[a[".sv"]]):a}function Fb(a,b){var c=new Gb;Hb(a,new E(""),function(a,e){Ib(c,a,Jb(e,b))});return c}function Jb(a,b){var c=a.C().H(),c=Eb(c,b),d;if(a.J()){var e=Eb(a.Ca(),b);return e!==a.Ca()||c!==a.C().H()?new Kb(e,G(c)):a}d=a;c!==a.C().H()&&(d=d.fa(new Kb(c)));a.O(H,function(a,c){var e=Jb(c,b);e!==c&&(d=d.T(a,e))});return d};var Lb=function(){var a=1;return function(){return a++}}(),D=cb,Mb=db;
function Nb(a){try{var b;bb();for(var c=$a,d=[],e=0;e<a.length;){var f=c[a.charAt(e++)],h=e<a.length?c[a.charAt(e)]:0;++e;var k=e<a.length?c[a.charAt(e)]:64;++e;var m=e<a.length?c[a.charAt(e)]:64;++e;if(null==f||null==h||null==k||null==m)throw Error();d.push(f<<2|h>>4);64!=k&&(d.push(h<<4&240|k>>2),64!=m&&d.push(k<<6&192|m))}if(8192>d.length)b=String.fromCharCode.apply(null,d);else{a="";for(c=0;c<d.length;c+=8192)a+=String.fromCharCode.apply(null,Ga(d,c,c+8192));b=a}return b}catch(l){I("base64Decode failed: ",
l)}return null}function Ob(a){var b=mb(a);a=new ta;a.update(b);var b=[],c=8*a.Pd;56>a.$b?a.update(a.zd,56-a.$b):a.update(a.zd,a.Wa-(a.$b-56));for(var d=a.Wa-1;56<=d;d--)a.Wd[d]=c&255,c/=256;ua(a,a.Wd);for(d=c=0;5>d;d++)for(var e=24;0<=e;e-=8)b[c]=a.M[d]>>e&255,++c;return ab(b)}function Pb(a){for(var b="",c=0;c<arguments.length;c++)b=fa(arguments[c])?b+Pb.apply(null,arguments[c]):"object"===typeof arguments[c]?b+x(arguments[c]):b+arguments[c],b+=" ";return b}var Qb=null,Rb=!0;
function Sb(a,b){cb(!b||!0===a||!1===a,"Can't turn on custom loggers persistently.");!0===a?("undefined"!==typeof console&&("function"===typeof console.log?Qb=q(console.log,console):"object"===typeof console.log&&(Qb=function(a){console.log(a)})),b&&yb.set("logging_enabled",!0)):ha(a)?Qb=a:(Qb=null,yb.remove("logging_enabled"))}function I(a){!0===Rb&&(Rb=!1,null===Qb&&!0===yb.get("logging_enabled")&&Sb(!0));if(Qb){var b=Pb.apply(null,arguments);Qb(b)}}
function Tb(a){return function(){I(a,arguments)}}function Ub(a){if("undefined"!==typeof console){var b="FIREBASE INTERNAL ERROR: "+Pb.apply(null,arguments);"undefined"!==typeof console.error?console.error(b):console.log(b)}}function Vb(a){var b=Pb.apply(null,arguments);throw Error("FIREBASE FATAL ERROR: "+b);}function J(a){if("undefined"!==typeof console){var b="FIREBASE WARNING: "+Pb.apply(null,arguments);"undefined"!==typeof console.warn?console.warn(b):console.log(b)}}
function Wb(a){var b,c,d,e,f,h=a;f=c=a=b="";d=!0;e="https";if(p(h)){var k=h.indexOf("//");0<=k&&(e=h.substring(0,k-1),h=h.substring(k+2));k=h.indexOf("/");-1===k&&(k=h.length);b=h.substring(0,k);f="";h=h.substring(k).split("/");for(k=0;k<h.length;k++)if(0<h[k].length){var m=h[k];try{m=decodeURIComponent(m.replace(/\+/g," "))}catch(l){}f+="/"+m}h=b.split(".");3===h.length?(a=h[1],c=h[0].toLowerCase()):2===h.length&&(a=h[0]);k=b.indexOf(":");0<=k&&(d="https"===e||"wss"===e)}"firebase"===a&&Vb(b+" is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead");
c&&"undefined"!=c||Vb("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com");d||"undefined"!==typeof window&&window.location&&window.location.protocol&&-1!==window.location.protocol.indexOf("https:")&&J("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().");return{jc:new zb(b,d,c,"ws"===e||"wss"===e),path:new E(f)}}function Xb(a){return ga(a)&&(a!=a||a==Number.POSITIVE_INFINITY||a==Number.NEGATIVE_INFINITY)}
function Yb(a){if("complete"===document.readyState)a();else{var b=!1,c=function(){document.body?b||(b=!0,a()):setTimeout(c,Math.floor(10))};document.addEventListener?(document.addEventListener("DOMContentLoaded",c,!1),window.addEventListener("load",c,!1)):document.attachEvent&&(document.attachEvent("onreadystatechange",function(){"complete"===document.readyState&&c()}),window.attachEvent("onload",c))}}
function sb(a,b){if(a===b)return 0;if("[MIN_NAME]"===a||"[MAX_NAME]"===b)return-1;if("[MIN_NAME]"===b||"[MAX_NAME]"===a)return 1;var c=Zb(a),d=Zb(b);return null!==c?null!==d?0==c-d?a.length-b.length:c-d:-1:null!==d?1:a<b?-1:1}function $b(a,b){if(b&&a in b)return b[a];throw Error("Missing required key ("+a+") in object: "+x(b));}
function ac(a){if("object"!==typeof a||null===a)return x(a);var b=[],c;for(c in a)b.push(c);b.sort();c="{";for(var d=0;d<b.length;d++)0!==d&&(c+=","),c+=x(b[d]),c+=":",c+=ac(a[b[d]]);return c+"}"}function bc(a,b){if(a.length<=b)return[a];for(var c=[],d=0;d<a.length;d+=b)d+b>a?c.push(a.substring(d,a.length)):c.push(a.substring(d,d+b));return c}function cc(a,b){if(ea(a))for(var c=0;c<a.length;++c)b(c,a[c]);else v(a,b)}
function dc(a){D(!Xb(a),"Invalid JSON number");var b,c,d,e;0===a?(d=c=0,b=-Infinity===1/a?1:0):(b=0>a,a=Math.abs(a),a>=Math.pow(2,-1022)?(d=Math.min(Math.floor(Math.log(a)/Math.LN2),1023),c=d+1023,d=Math.round(a*Math.pow(2,52-d)-Math.pow(2,52))):(c=0,d=Math.round(a/Math.pow(2,-1074))));e=[];for(a=52;a;--a)e.push(d%2?1:0),d=Math.floor(d/2);for(a=11;a;--a)e.push(c%2?1:0),c=Math.floor(c/2);e.push(b?1:0);e.reverse();b=e.join("");c="";for(a=0;64>a;a+=8)d=parseInt(b.substr(a,8),2).toString(16),1===d.length&&
(d="0"+d),c+=d;return c.toLowerCase()}var ec=/^-?\d{1,10}$/;function Zb(a){return ec.test(a)&&(a=Number(a),-2147483648<=a&&2147483647>=a)?a:null}function fc(a){try{a()}catch(b){setTimeout(function(){J("Exception was thrown by user callback.",b.stack||"");throw b;},Math.floor(0))}}function gc(a,b,c){Object.defineProperty(a,b,{get:c})}function hc(a,b){var c=setTimeout(a,b);"object"===typeof c&&c.unref&&c.unref();return c};function ic(a){var b={},c={},d={},e="";try{var f=a.split("."),b=lb(Nb(f[0])||""),c=lb(Nb(f[1])||""),e=f[2],d=c.d||{};delete c.d}catch(h){}return{tg:b,Je:c,data:d,mg:e}}function jc(a){a=ic(a);var b=a.Je;return!!a.mg&&!!b&&"object"===typeof b&&b.hasOwnProperty("iat")}function kc(a){a=ic(a).Je;return"object"===typeof a&&!0===w(a,"admin")};function lc(){}var mc={};function nc(a){return q(a.compare,a)}lc.prototype.nd=function(a,b){return 0!==this.compare(new C("[MIN_NAME]",a),new C("[MIN_NAME]",b))};lc.prototype.Hc=function(){return oc};function pc(a){D(!a.e()&&".priority"!==K(a),"Can't create PathIndex with empty path or .priority key");this.bc=a}la(pc,lc);g=pc.prototype;g.xc=function(a){return!a.P(this.bc).e()};g.compare=function(a,b){var c=a.R.P(this.bc),d=b.R.P(this.bc),c=c.sc(d);return 0===c?sb(a.name,b.name):c};
g.Ec=function(a,b){var c=G(a),c=L.F(this.bc,c);return new C(b,c)};g.Fc=function(){var a=L.F(this.bc,qc);return new C("[MAX_NAME]",a)};g.toString=function(){return this.bc.slice().join("/")};function rc(){}la(rc,lc);g=rc.prototype;g.compare=function(a,b){var c=a.R.C(),d=b.R.C(),c=c.sc(d);return 0===c?sb(a.name,b.name):c};g.xc=function(a){return!a.C().e()};g.nd=function(a,b){return!a.C().Z(b.C())};g.Hc=function(){return oc};g.Fc=function(){return new C("[MAX_NAME]",new Kb("[PRIORITY-POST]",qc))};
g.Ec=function(a,b){var c=G(a);return new C(b,new Kb("[PRIORITY-POST]",c))};g.toString=function(){return".priority"};var H=new rc;function sc(){}la(sc,lc);g=sc.prototype;g.compare=function(a,b){return sb(a.name,b.name)};g.xc=function(){throw Mb("KeyIndex.isDefinedOn not expected to be called.");};g.nd=function(){return!1};g.Hc=function(){return oc};g.Fc=function(){return new C("[MAX_NAME]",L)};g.Ec=function(a){D(p(a),"KeyIndex indexValue must always be a string.");return new C(a,L)};g.toString=function(){return".key"};
var tc=new sc;function uc(){}la(uc,lc);g=uc.prototype;g.compare=function(a,b){var c=a.R.sc(b.R);return 0===c?sb(a.name,b.name):c};g.xc=function(){return!0};g.nd=function(a,b){return!a.Z(b)};g.Hc=function(){return oc};g.Fc=function(){return vc};g.Ec=function(a,b){var c=G(a);return new C(b,c)};g.toString=function(){return".value"};var wc=new uc;function xc(a,b){this.od=a;this.cc=b}xc.prototype.get=function(a){var b=w(this.od,a);if(!b)throw Error("No index defined for "+a);return b===mc?null:b};function yc(a,b,c){var d=Ja(a.od,function(d,f){var h=w(a.cc,f);D(h,"Missing index implementation for "+f);if(d===mc){if(h.xc(b.R)){for(var k=[],m=c.Wb(qb),l=M(m);l;)l.name!=b.name&&k.push(l),l=M(m);k.push(b);return zc(k,nc(h))}return mc}h=c.get(b.name);k=d;h&&(k=k.remove(new C(b.name,h)));return k.Oa(b,b.R)});return new xc(d,a.cc)}
function Ac(a,b,c){var d=Ja(a.od,function(a){if(a===mc)return a;var d=c.get(b.name);return d?a.remove(new C(b.name,d)):a});return new xc(d,a.cc)}var Bc=new xc({".priority":mc},{".priority":H});function Kb(a,b){this.B=a;D(n(this.B)&&null!==this.B,"LeafNode shouldn't be created with null/undefined value.");this.aa=b||L;Cc(this.aa);this.Db=null}var Dc=["object","boolean","number","string"];g=Kb.prototype;g.J=function(){return!0};g.C=function(){return this.aa};g.fa=function(a){return new Kb(this.B,a)};g.Q=function(a){return".priority"===a?this.aa:L};g.P=function(a){return a.e()?this:".priority"===K(a)?this.aa:L};g.Da=function(){return!1};g.Ve=function(){return null};
g.T=function(a,b){return".priority"===a?this.fa(b):b.e()&&".priority"!==a?this:L.T(a,b).fa(this.aa)};g.F=function(a,b){var c=K(a);if(null===c)return b;if(b.e()&&".priority"!==c)return this;D(".priority"!==c||1===Ec(a),".priority must be the last token in a path");return this.T(c,L.F(N(a),b))};g.e=function(){return!1};g.Eb=function(){return 0};g.O=function(){return!1};g.H=function(a){return a&&!this.C().e()?{".value":this.Ca(),".priority":this.C().H()}:this.Ca()};
g.hash=function(){if(null===this.Db){var a="";this.aa.e()||(a+="priority:"+Fc(this.aa.H())+":");var b=typeof this.B,a=a+(b+":"),a="number"===b?a+dc(this.B):a+this.B;this.Db=Ob(a)}return this.Db};g.Ca=function(){return this.B};g.sc=function(a){if(a===L)return 1;if(a instanceof O)return-1;D(a.J(),"Unknown node type");var b=typeof a.B,c=typeof this.B,d=xa(Dc,b),e=xa(Dc,c);D(0<=d,"Unknown leaf type: "+b);D(0<=e,"Unknown leaf type: "+c);return d===e?"object"===c?0:this.B<a.B?-1:this.B===a.B?0:1:e-d};
g.nb=function(){return this};g.yc=function(){return!0};g.Z=function(a){return a===this?!0:a.J()?this.B===a.B&&this.aa.Z(a.aa):!1};g.toString=function(){return x(this.H(!0))};function Gc(){this.set={}}g=Gc.prototype;g.add=function(a,b){this.set[a]=null!==b?b:!0};g.contains=function(a){return eb(this.set,a)};g.get=function(a){return this.contains(a)?this.set[a]:void 0};g.remove=function(a){delete this.set[a]};g.clear=function(){this.set={}};g.e=function(){return Sa(this.set)};g.count=function(){return La(this.set)};function Hc(a,b){v(a.set,function(a,d){b(d,a)})}g.keys=function(){var a=[];v(this.set,function(b,c){a.push(c)});return a};function Ic(a){D(ea(a)&&0<a.length,"Requires a non-empty array");this.Bf=a;this.Dc={}}Ic.prototype.Ge=function(a,b){var c;c=this.Dc[a]||[];var d=c.length;if(0<d){for(var e=Array(d),f=0;f<d;f++)e[f]=c[f];c=e}else c=[];for(d=0;d<c.length;d++)c[d].Ie.apply(c[d].Ma,Array.prototype.slice.call(arguments,1))};Ic.prototype.gc=function(a,b,c){Jc(this,a);this.Dc[a]=this.Dc[a]||[];this.Dc[a].push({Ie:b,Ma:c});(a=this.Ue(a))&&b.apply(c,a)};
Ic.prototype.Ic=function(a,b,c){Jc(this,a);a=this.Dc[a]||[];for(var d=0;d<a.length;d++)if(a[d].Ie===b&&(!c||c===a[d].Ma)){a.splice(d,1);break}};function Jc(a,b){D(Da(a.Bf,function(a){return a===b}),"Unknown event: "+b)};var Kc=function(){var a=0,b=[];return function(c){var d=c===a;a=c;for(var e=Array(8),f=7;0<=f;f--)e[f]="-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c%64),c=Math.floor(c/64);D(0===c,"Cannot push at time == 0");c=e.join("");if(d){for(f=11;0<=f&&63===b[f];f--)b[f]=0;b[f]++}else for(f=0;12>f;f++)b[f]=Math.floor(64*Math.random());for(f=0;12>f;f++)c+="-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);D(20===c.length,"nextPushId: Length should be 20.");
return c}}();function Lc(){Ic.call(this,["online"]);this.hc=!0;if("undefined"!==typeof window&&"undefined"!==typeof window.addEventListener&&!pb()){var a=this;window.addEventListener("online",function(){a.hc||(a.hc=!0,a.Ge("online",!0))},!1);window.addEventListener("offline",function(){a.hc&&(a.hc=!1,a.Ge("online",!1))},!1)}}la(Lc,Ic);Lc.prototype.Ue=function(a){D("online"===a,"Unknown event type: "+a);return[this.hc]};ca(Lc);function Mc(){Ic.call(this,["visible"]);var a,b;"undefined"!==typeof document&&"undefined"!==typeof document.addEventListener&&("undefined"!==typeof document.hidden?(b="visibilitychange",a="hidden"):"undefined"!==typeof document.mozHidden?(b="mozvisibilitychange",a="mozHidden"):"undefined"!==typeof document.msHidden?(b="msvisibilitychange",a="msHidden"):"undefined"!==typeof document.webkitHidden&&(b="webkitvisibilitychange",a="webkitHidden"));this.Mb=!0;if(b){var c=this;document.addEventListener(b,
function(){var b=!document[a];b!==c.Mb&&(c.Mb=b,c.Ge("visible",b))},!1)}}la(Mc,Ic);Mc.prototype.Ue=function(a){D("visible"===a,"Unknown event type: "+a);return[this.Mb]};ca(Mc);function E(a,b){if(1==arguments.length){this.o=a.split("/");for(var c=0,d=0;d<this.o.length;d++)0<this.o[d].length&&(this.o[c]=this.o[d],c++);this.o.length=c;this.Y=0}else this.o=a,this.Y=b}function P(a,b){var c=K(a);if(null===c)return b;if(c===K(b))return P(N(a),N(b));throw Error("INTERNAL ERROR: innerPath ("+b+") is not within outerPath ("+a+")");}
function Nc(a,b){for(var c=a.slice(),d=b.slice(),e=0;e<c.length&&e<d.length;e++){var f=sb(c[e],d[e]);if(0!==f)return f}return c.length===d.length?0:c.length<d.length?-1:1}function K(a){return a.Y>=a.o.length?null:a.o[a.Y]}function Ec(a){return a.o.length-a.Y}function N(a){var b=a.Y;b<a.o.length&&b++;return new E(a.o,b)}function Oc(a){return a.Y<a.o.length?a.o[a.o.length-1]:null}g=E.prototype;
g.toString=function(){for(var a="",b=this.Y;b<this.o.length;b++)""!==this.o[b]&&(a+="/"+this.o[b]);return a||"/"};g.slice=function(a){return this.o.slice(this.Y+(a||0))};g.parent=function(){if(this.Y>=this.o.length)return null;for(var a=[],b=this.Y;b<this.o.length-1;b++)a.push(this.o[b]);return new E(a,0)};
g.n=function(a){for(var b=[],c=this.Y;c<this.o.length;c++)b.push(this.o[c]);if(a instanceof E)for(c=a.Y;c<a.o.length;c++)b.push(a.o[c]);else for(a=a.split("/"),c=0;c<a.length;c++)0<a[c].length&&b.push(a[c]);return new E(b,0)};g.e=function(){return this.Y>=this.o.length};g.Z=function(a){if(Ec(this)!==Ec(a))return!1;for(var b=this.Y,c=a.Y;b<=this.o.length;b++,c++)if(this.o[b]!==a.o[c])return!1;return!0};
g.contains=function(a){var b=this.Y,c=a.Y;if(Ec(this)>Ec(a))return!1;for(;b<this.o.length;){if(this.o[b]!==a.o[c])return!1;++b;++c}return!0};var Q=new E("");function Pc(a,b){this.Qa=a.slice();this.Ha=Math.max(1,this.Qa.length);this.Qe=b;for(var c=0;c<this.Qa.length;c++)this.Ha+=nb(this.Qa[c]);Qc(this)}Pc.prototype.push=function(a){0<this.Qa.length&&(this.Ha+=1);this.Qa.push(a);this.Ha+=nb(a);Qc(this)};Pc.prototype.pop=function(){var a=this.Qa.pop();this.Ha-=nb(a);0<this.Qa.length&&--this.Ha};
function Qc(a){if(768<a.Ha)throw Error(a.Qe+"has a key path longer than 768 bytes ("+a.Ha+").");if(32<a.Qa.length)throw Error(a.Qe+"path specified exceeds the maximum depth that can be written (32) or object contains a cycle "+Rc(a));}function Rc(a){return 0==a.Qa.length?"":"in property '"+a.Qa.join(".")+"'"};function Sc(){this.children={};this.bd=0;this.value=null}function Tc(a,b,c){this.ud=a?a:"";this.Pc=b?b:null;this.A=c?c:new Sc}function Uc(a,b){for(var c=b instanceof E?b:new E(b),d=a,e;null!==(e=K(c));)d=new Tc(e,d,w(d.A.children,e)||new Sc),c=N(c);return d}g=Tc.prototype;g.Ca=function(){return this.A.value};function Vc(a,b){D("undefined"!==typeof b,"Cannot set value to undefined");a.A.value=b;Wc(a)}g.clear=function(){this.A.value=null;this.A.children={};this.A.bd=0;Wc(this)};
g.kd=function(){return 0<this.A.bd};g.e=function(){return null===this.Ca()&&!this.kd()};g.O=function(a){var b=this;v(this.A.children,function(c,d){a(new Tc(d,b,c))})};function Xc(a,b,c,d){c&&!d&&b(a);a.O(function(a){Xc(a,b,!0,d)});c&&d&&b(a)}function Yc(a,b){for(var c=a.parent();null!==c&&!b(c);)c=c.parent()}g.path=function(){return new E(null===this.Pc?this.ud:this.Pc.path()+"/"+this.ud)};g.name=function(){return this.ud};g.parent=function(){return this.Pc};
function Wc(a){if(null!==a.Pc){var b=a.Pc,c=a.ud,d=a.e(),e=eb(b.A.children,c);d&&e?(delete b.A.children[c],b.A.bd--,Wc(b)):d||e||(b.A.children[c]=a.A,b.A.bd++,Wc(b))}};function Zc(a,b){this.La=a;this.ba=b?b:$c}g=Zc.prototype;g.Oa=function(a,b){return new Zc(this.La,this.ba.Oa(a,b,this.La).X(null,null,!1,null,null))};g.remove=function(a){return new Zc(this.La,this.ba.remove(a,this.La).X(null,null,!1,null,null))};g.get=function(a){for(var b,c=this.ba;!c.e();){b=this.La(a,c.key);if(0===b)return c.value;0>b?c=c.left:0<b&&(c=c.right)}return null};
function ad(a,b){for(var c,d=a.ba,e=null;!d.e();){c=a.La(b,d.key);if(0===c){if(d.left.e())return e?e.key:null;for(d=d.left;!d.right.e();)d=d.right;return d.key}0>c?d=d.left:0<c&&(e=d,d=d.right)}throw Error("Attempted to find predecessor key for a nonexistent key.  What gives?");}g.e=function(){return this.ba.e()};g.count=function(){return this.ba.count()};g.Gc=function(){return this.ba.Gc()};g.ec=function(){return this.ba.ec()};g.ha=function(a){return this.ba.ha(a)};
g.Wb=function(a){return new bd(this.ba,null,this.La,!1,a)};g.Xb=function(a,b){return new bd(this.ba,a,this.La,!1,b)};g.Zb=function(a,b){return new bd(this.ba,a,this.La,!0,b)};g.We=function(a){return new bd(this.ba,null,this.La,!0,a)};function bd(a,b,c,d,e){this.Hd=e||null;this.le=d;this.Pa=[];for(e=1;!a.e();)if(e=b?c(a.key,b):1,d&&(e*=-1),0>e)a=this.le?a.left:a.right;else if(0===e){this.Pa.push(a);break}else this.Pa.push(a),a=this.le?a.right:a.left}
function M(a){if(0===a.Pa.length)return null;var b=a.Pa.pop(),c;c=a.Hd?a.Hd(b.key,b.value):{key:b.key,value:b.value};if(a.le)for(b=b.left;!b.e();)a.Pa.push(b),b=b.right;else for(b=b.right;!b.e();)a.Pa.push(b),b=b.left;return c}function cd(a){if(0===a.Pa.length)return null;var b;b=a.Pa;b=b[b.length-1];return a.Hd?a.Hd(b.key,b.value):{key:b.key,value:b.value}}function dd(a,b,c,d,e){this.key=a;this.value=b;this.color=null!=c?c:!0;this.left=null!=d?d:$c;this.right=null!=e?e:$c}g=dd.prototype;
g.X=function(a,b,c,d,e){return new dd(null!=a?a:this.key,null!=b?b:this.value,null!=c?c:this.color,null!=d?d:this.left,null!=e?e:this.right)};g.count=function(){return this.left.count()+1+this.right.count()};g.e=function(){return!1};g.ha=function(a){return this.left.ha(a)||a(this.key,this.value)||this.right.ha(a)};function ed(a){return a.left.e()?a:ed(a.left)}g.Gc=function(){return ed(this).key};g.ec=function(){return this.right.e()?this.key:this.right.ec()};
g.Oa=function(a,b,c){var d,e;e=this;d=c(a,e.key);e=0>d?e.X(null,null,null,e.left.Oa(a,b,c),null):0===d?e.X(null,b,null,null,null):e.X(null,null,null,null,e.right.Oa(a,b,c));return gd(e)};function hd(a){if(a.left.e())return $c;a.left.ea()||a.left.left.ea()||(a=id(a));a=a.X(null,null,null,hd(a.left),null);return gd(a)}
g.remove=function(a,b){var c,d;c=this;if(0>b(a,c.key))c.left.e()||c.left.ea()||c.left.left.ea()||(c=id(c)),c=c.X(null,null,null,c.left.remove(a,b),null);else{c.left.ea()&&(c=jd(c));c.right.e()||c.right.ea()||c.right.left.ea()||(c=kd(c),c.left.left.ea()&&(c=jd(c),c=kd(c)));if(0===b(a,c.key)){if(c.right.e())return $c;d=ed(c.right);c=c.X(d.key,d.value,null,null,hd(c.right))}c=c.X(null,null,null,null,c.right.remove(a,b))}return gd(c)};g.ea=function(){return this.color};
function gd(a){a.right.ea()&&!a.left.ea()&&(a=ld(a));a.left.ea()&&a.left.left.ea()&&(a=jd(a));a.left.ea()&&a.right.ea()&&(a=kd(a));return a}function id(a){a=kd(a);a.right.left.ea()&&(a=a.X(null,null,null,null,jd(a.right)),a=ld(a),a=kd(a));return a}function ld(a){return a.right.X(null,null,a.color,a.X(null,null,!0,null,a.right.left),null)}function jd(a){return a.left.X(null,null,a.color,null,a.X(null,null,!0,a.left.right,null))}
function kd(a){return a.X(null,null,!a.color,a.left.X(null,null,!a.left.color,null,null),a.right.X(null,null,!a.right.color,null,null))}function md(){}g=md.prototype;g.X=function(){return this};g.Oa=function(a,b){return new dd(a,b,null)};g.remove=function(){return this};g.count=function(){return 0};g.e=function(){return!0};g.ha=function(){return!1};g.Gc=function(){return null};g.ec=function(){return null};g.ea=function(){return!1};var $c=new md;function O(a,b,c){this.k=a;(this.aa=b)&&Cc(this.aa);a.e()&&D(!this.aa||this.aa.e(),"An empty node cannot have a priority");this.yb=c;this.Db=null}g=O.prototype;g.J=function(){return!1};g.C=function(){return this.aa||L};g.fa=function(a){return this.k.e()?this:new O(this.k,a,this.yb)};g.Q=function(a){if(".priority"===a)return this.C();a=this.k.get(a);return null===a?L:a};g.P=function(a){var b=K(a);return null===b?this:this.Q(b).P(N(a))};g.Da=function(a){return null!==this.k.get(a)};
g.T=function(a,b){D(b,"We should always be passing snapshot nodes");if(".priority"===a)return this.fa(b);var c=new C(a,b),d,e;b.e()?(d=this.k.remove(a),c=Ac(this.yb,c,this.k)):(d=this.k.Oa(a,b),c=yc(this.yb,c,this.k));e=d.e()?L:this.aa;return new O(d,e,c)};g.F=function(a,b){var c=K(a);if(null===c)return b;D(".priority"!==K(a)||1===Ec(a),".priority must be the last token in a path");var d=this.Q(c).F(N(a),b);return this.T(c,d)};g.e=function(){return this.k.e()};g.Eb=function(){return this.k.count()};
var nd=/^(0|[1-9]\d*)$/;g=O.prototype;g.H=function(a){if(this.e())return null;var b={},c=0,d=0,e=!0;this.O(H,function(f,h){b[f]=h.H(a);c++;e&&nd.test(f)?d=Math.max(d,Number(f)):e=!1});if(!a&&e&&d<2*c){var f=[],h;for(h in b)f[h]=b[h];return f}a&&!this.C().e()&&(b[".priority"]=this.C().H());return b};g.hash=function(){if(null===this.Db){var a="";this.C().e()||(a+="priority:"+Fc(this.C().H())+":");this.O(H,function(b,c){var d=c.hash();""!==d&&(a+=":"+b+":"+d)});this.Db=""===a?"":Ob(a)}return this.Db};
g.Ve=function(a,b,c){return(c=od(this,c))?(a=ad(c,new C(a,b)))?a.name:null:ad(this.k,a)};function pd(a,b){var c;c=(c=od(a,b))?(c=c.Gc())&&c.name:a.k.Gc();return c?new C(c,a.k.get(c)):null}function qd(a,b){var c;c=(c=od(a,b))?(c=c.ec())&&c.name:a.k.ec();return c?new C(c,a.k.get(c)):null}g.O=function(a,b){var c=od(this,a);return c?c.ha(function(a){return b(a.name,a.R)}):this.k.ha(b)};g.Wb=function(a){return this.Xb(a.Hc(),a)};
g.Xb=function(a,b){var c=od(this,b);if(c)return c.Xb(a,function(a){return a});for(var c=this.k.Xb(a.name,qb),d=cd(c);null!=d&&0>b.compare(d,a);)M(c),d=cd(c);return c};g.We=function(a){return this.Zb(a.Fc(),a)};g.Zb=function(a,b){var c=od(this,b);if(c)return c.Zb(a,function(a){return a});for(var c=this.k.Zb(a.name,qb),d=cd(c);null!=d&&0<b.compare(d,a);)M(c),d=cd(c);return c};g.sc=function(a){return this.e()?a.e()?0:-1:a.J()||a.e()?1:a===qc?-1:0};
g.nb=function(a){if(a===tc||Pa(this.yb.cc,a.toString()))return this;var b=this.yb,c=this.k;D(a!==tc,"KeyIndex always exists and isn't meant to be added to the IndexMap.");for(var d=[],e=!1,c=c.Wb(qb),f=M(c);f;)e=e||a.xc(f.R),d.push(f),f=M(c);d=e?zc(d,nc(a)):mc;e=a.toString();c=Ta(b.cc);c[e]=a;a=Ta(b.od);a[e]=d;return new O(this.k,this.aa,new xc(a,c))};g.yc=function(a){return a===tc||Pa(this.yb.cc,a.toString())};
g.Z=function(a){if(a===this)return!0;if(a.J())return!1;if(this.C().Z(a.C())&&this.k.count()===a.k.count()){var b=this.Wb(H);a=a.Wb(H);for(var c=M(b),d=M(a);c&&d;){if(c.name!==d.name||!c.R.Z(d.R))return!1;c=M(b);d=M(a)}return null===c&&null===d}return!1};function od(a,b){return b===tc?null:a.yb.get(b.toString())}g.toString=function(){return x(this.H(!0))};function G(a,b){if(null===a)return L;var c=null;"object"===typeof a&&".priority"in a?c=a[".priority"]:"undefined"!==typeof b&&(c=b);D(null===c||"string"===typeof c||"number"===typeof c||"object"===typeof c&&".sv"in c,"Invalid priority type found: "+typeof c);"object"===typeof a&&".value"in a&&null!==a[".value"]&&(a=a[".value"]);if("object"!==typeof a||".sv"in a)return new Kb(a,G(c));if(a instanceof Array){var d=L,e=a;v(e,function(a,b){if(eb(e,b)&&"."!==b.substring(0,1)){var c=G(a);if(c.J()||!c.e())d=
d.T(b,c)}});return d.fa(G(c))}var f=[],h=!1,k=a;fb(k,function(a){if("string"!==typeof a||"."!==a.substring(0,1)){var b=G(k[a]);b.e()||(h=h||!b.C().e(),f.push(new C(a,b)))}});if(0==f.length)return L;var m=zc(f,rb,function(a){return a.name},tb);if(h){var l=zc(f,nc(H));return new O(m,G(c),new xc({".priority":l},{".priority":H}))}return new O(m,G(c),Bc)}var rd=Math.log(2);
function sd(a){this.count=parseInt(Math.log(a+1)/rd,10);this.Oe=this.count-1;this.Cf=a+1&parseInt(Array(this.count+1).join("1"),2)}function td(a){var b=!(a.Cf&1<<a.Oe);a.Oe--;return b}
function zc(a,b,c,d){function e(b,d){var f=d-b;if(0==f)return null;if(1==f){var l=a[b],u=c?c(l):l;return new dd(u,l.R,!1,null,null)}var l=parseInt(f/2,10)+b,f=e(b,l),z=e(l+1,d),l=a[l],u=c?c(l):l;return new dd(u,l.R,!1,f,z)}a.sort(b);var f=function(b){function d(b,h){var k=u-b,z=u;u-=b;var z=e(k+1,z),k=a[k],F=c?c(k):k,z=new dd(F,k.R,h,null,z);f?f.left=z:l=z;f=z}for(var f=null,l=null,u=a.length,z=0;z<b.count;++z){var F=td(b),fd=Math.pow(2,b.count-(z+1));F?d(fd,!1):(d(fd,!1),d(fd,!0))}return l}(new sd(a.length));
return null!==f?new Zc(d||b,f):new Zc(d||b)}function Fc(a){return"number"===typeof a?"number:"+dc(a):"string:"+a}function Cc(a){if(a.J()){var b=a.H();D("string"===typeof b||"number"===typeof b||"object"===typeof b&&eb(b,".sv"),"Priority must be a string or number.")}else D(a===qc||a.e(),"priority of unexpected type.");D(a===qc||a.C().e(),"Priority nodes can't have a priority of their own.")}var L=new O(new Zc(tb),null,Bc);function ud(){O.call(this,new Zc(tb),L,Bc)}la(ud,O);g=ud.prototype;
g.sc=function(a){return a===this?0:1};g.Z=function(a){return a===this};g.C=function(){return this};g.Q=function(){return L};g.e=function(){return!1};var qc=new ud,oc=new C("[MIN_NAME]",L),vc=new C("[MAX_NAME]",qc);function vd(a,b){this.value=a;this.children=b||wd}var wd=new Zc(function(a,b){return a===b?0:a<b?-1:1});function xd(a){var b=R;v(a,function(a,d){b=b.set(new E(d),a)});return b}g=vd.prototype;g.e=function(){return null===this.value&&this.children.e()};function yd(a,b,c){if(null!=a.value&&c(a.value))return{path:Q,value:a.value};if(b.e())return null;var d=K(b);a=a.children.get(d);return null!==a?(b=yd(a,N(b),c),null!=b?{path:(new E(d)).n(b.path),value:b.value}:null):null}
function zd(a,b){return yd(a,b,function(){return!0})}g.subtree=function(a){if(a.e())return this;var b=this.children.get(K(a));return null!==b?b.subtree(N(a)):R};g.set=function(a,b){if(a.e())return new vd(b,this.children);var c=K(a),d=(this.children.get(c)||R).set(N(a),b),c=this.children.Oa(c,d);return new vd(this.value,c)};
g.remove=function(a){if(a.e())return this.children.e()?R:new vd(null,this.children);var b=K(a),c=this.children.get(b);return c?(a=c.remove(N(a)),b=a.e()?this.children.remove(b):this.children.Oa(b,a),null===this.value&&b.e()?R:new vd(this.value,b)):this};g.get=function(a){if(a.e())return this.value;var b=this.children.get(K(a));return b?b.get(N(a)):null};
function Ad(a,b,c){if(b.e())return c;var d=K(b);b=Ad(a.children.get(d)||R,N(b),c);d=b.e()?a.children.remove(d):a.children.Oa(d,b);return new vd(a.value,d)}function Bd(a,b){return Cd(a,Q,b)}function Cd(a,b,c){var d={};a.children.ha(function(a,f){d[a]=Cd(f,b.n(a),c)});return c(b,a.value,d)}function Dd(a,b,c){return Ed(a,b,Q,c)}function Ed(a,b,c,d){var e=a.value?d(c,a.value):!1;if(e)return e;if(b.e())return null;e=K(b);return(a=a.children.get(e))?Ed(a,N(b),c.n(e),d):null}
function Fd(a,b,c){Gd(a,b,Q,c)}function Gd(a,b,c,d){if(b.e())return a;a.value&&d(c,a.value);var e=K(b);return(a=a.children.get(e))?Gd(a,N(b),c.n(e),d):R}function Hd(a,b){Id(a,Q,b)}function Id(a,b,c){a.children.ha(function(a,e){Id(e,b.n(a),c)});a.value&&c(b,a.value)}function Jd(a,b){a.children.ha(function(a,d){d.value&&b(a,d.value)})}var R=new vd(null);vd.prototype.toString=function(){var a={};Hd(this,function(b,c){a[b.toString()]=c.toString()});return x(a)};var Kd=/[\[\].#$\/\u0000-\u001F\u007F]/,Ld=/[\[\].#$\u0000-\u001F\u007F]/;function Md(a){return p(a)&&0!==a.length&&!Kd.test(a)}function Nd(a){return null===a||p(a)||ga(a)&&!Xb(a)||ia(a)&&eb(a,".sv")}function Od(a,b,c,d){d&&!n(b)||Pd(A(a,1,d),b,c)}
function Pd(a,b,c){c instanceof E&&(c=new Pc(c,a));if(!n(b))throw Error(a+"contains undefined "+Rc(c));if(ha(b))throw Error(a+"contains a function "+Rc(c)+" with contents: "+b.toString());if(Xb(b))throw Error(a+"contains "+b.toString()+" "+Rc(c));if(p(b)&&b.length>10485760/3&&10485760<nb(b))throw Error(a+"contains a string greater than 10485760 utf8 bytes "+Rc(c)+" ('"+b.substring(0,50)+"...')");if(ia(b)){var d=!1,e=!1;fb(b,function(b,h){if(".value"===b)d=!0;else if(".priority"!==b&&".sv"!==b&&(e=
!0,!Md(b)))throw Error(a+" contains an invalid key ("+b+") "+Rc(c)+'.  Keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]"');c.push(b);Pd(a,h,c);c.pop()});if(d&&e)throw Error(a+' contains ".value" child '+Rc(c)+" in addition to actual children.");}}
function Qd(a,b){var c,d;for(c=0;c<b.length;c++){d=b[c];for(var e=d.slice(),f=0;f<e.length;f++)if((".priority"!==e[f]||f!==e.length-1)&&!Md(e[f]))throw Error(a+"contains an invalid key ("+e[f]+") in path "+d.toString()+'. Keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]"');}b.sort(Nc);e=null;for(c=0;c<b.length;c++){d=b[c];if(null!==e&&e.contains(d))throw Error(a+"contains a path "+e.toString()+" that is ancestor of another path "+d.toString());e=d}}
function Rd(a,b,c){var d=A(a,1,!1);if(!ia(b)||ea(b))throw Error(d+" must be an object containing the children to replace.");var e=[];fb(b,function(a,b){var k=new E(a);Pd(d,b,c.n(k));if(".priority"===Oc(k)&&!Nd(b))throw Error(d+"contains an invalid value for '"+k.toString()+"', which must be a valid Firebase priority (a string, finite number, server value, or null).");e.push(k)});Qd(d,e)}
function Sd(a,b,c){if(Xb(c))throw Error(A(a,b,!1)+"is "+c.toString()+", but must be a valid Firebase priority (a string, finite number, server value, or null).");if(!Nd(c))throw Error(A(a,b,!1)+"must be a valid Firebase priority (a string, finite number, server value, or null).");}
function Td(a,b,c){if(!c||n(b))switch(b){case "value":case "child_added":case "child_removed":case "child_changed":case "child_moved":break;default:throw Error(A(a,1,c)+'must be a valid event type: "value", "child_added", "child_removed", "child_changed", or "child_moved".');}}function Ud(a,b){if(n(b)&&!Md(b))throw Error(A(a,2,!0)+'was an invalid key: "'+b+'".  Firebase keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]").');}
function Vd(a,b){if(!p(b)||0===b.length||Ld.test(b))throw Error(A(a,1,!1)+'was an invalid path: "'+b+'". Paths must be non-empty strings and can\'t contain ".", "#", "$", "[", or "]"');}function Wd(a,b){if(".info"===K(b))throw Error(a+" failed: Can't modify data under /.info/");}
function Xd(a,b){var c=b.path.toString(),d;!(d=!p(b.jc.host)||0===b.jc.host.length||!Md(b.jc.pe))&&(d=0!==c.length)&&(c&&(c=c.replace(/^\/*\.info(\/|$)/,"/")),d=!(p(c)&&0!==c.length&&!Ld.test(c)));if(d)throw Error(A(a,1,!1)+'must be a valid firebase URL and the path can\'t contain ".", "#", "$", "[", or "]".');};function Gb(){this.k=this.B=null}Gb.prototype.find=function(a){if(null!=this.B)return this.B.P(a);if(a.e()||null==this.k)return null;var b=K(a);a=N(a);return this.k.contains(b)?this.k.get(b).find(a):null};function Ib(a,b,c){if(b.e())a.B=c,a.k=null;else if(null!==a.B)a.B=a.B.F(b,c);else{null==a.k&&(a.k=new Gc);var d=K(b);a.k.contains(d)||a.k.add(d,new Gb);a=a.k.get(d);b=N(b);Ib(a,b,c)}}
function Yd(a,b){if(b.e())return a.B=null,a.k=null,!0;if(null!==a.B){if(a.B.J())return!1;var c=a.B;a.B=null;c.O(H,function(b,c){Ib(a,new E(b),c)});return Yd(a,b)}return null!==a.k?(c=K(b),b=N(b),a.k.contains(c)&&Yd(a.k.get(c),b)&&a.k.remove(c),a.k.e()?(a.k=null,!0):!1):!0}function Hb(a,b,c){null!==a.B?c(b,a.B):a.O(function(a,e){var f=new E(b.toString()+"/"+a);Hb(e,f,c)})}Gb.prototype.O=function(a){null!==this.k&&Hc(this.k,function(b,c){a(b,c)})};function Zd(a,b){this.type=$d;this.source=a;this.path=b}Zd.prototype.Mc=function(){return this.path.e()?new Zd(this.source,Q):new Zd(this.source,N(this.path))};Zd.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" listen_complete)"};function ae(a,b,c){this.type=be;this.source=a;this.path=b;this.children=c}ae.prototype.Mc=function(a){if(this.path.e())return a=this.children.subtree(new E(a)),a.e()?null:a.value?new ce(this.source,Q,a.value):new ae(this.source,Q,a);D(K(this.path)===a,"Can't get a merge for a child not on the path of the operation");return new ae(this.source,N(this.path),this.children)};ae.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" merge: "+this.children.toString()+")"};function de(a,b,c){this.type=ee;this.source=fe;this.path=a;this.Ob=b;this.Id=c}de.prototype.Mc=function(a){if(this.path.e()){if(null!=this.Ob.value)return D(this.Ob.children.e(),"affectedTree should not have overlapping affected paths."),this;a=this.Ob.subtree(new E(a));return new de(Q,a,this.Id)}D(K(this.path)===a,"operationForChild called for unrelated child.");return new de(N(this.path),this.Ob,this.Id)};
de.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" ack write revert="+this.Id+" affectedTree="+this.Ob+")"};function ce(a,b,c){this.type=ge;this.source=a;this.path=b;this.Ga=c}ce.prototype.Mc=function(a){return this.path.e()?new ce(this.source,Q,this.Ga.Q(a)):new ce(this.source,N(this.path),this.Ga)};ce.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" overwrite: "+this.Ga.toString()+")"};var ge=0,be=1,ee=2,$d=3;function he(a,b,c,d){this.ee=a;this.Se=b;this.Hb=c;this.Ee=d;D(!d||b,"Tagged queries must be from server.")}var fe=new he(!0,!1,null,!1),ie=new he(!1,!0,null,!1);he.prototype.toString=function(){return this.ee?"user":this.Ee?"server(queryID="+this.Hb+")":"server"};function je(a,b,c){this.A=a;this.da=b;this.Sb=c}function ke(a){return a.da}function le(a){return a.Sb}function me(a,b){return b.e()?a.da&&!a.Sb:ne(a,K(b))}function ne(a,b){return a.da&&!a.Sb||a.A.Da(b)}je.prototype.j=function(){return this.A};function oe(a,b){this.N=a;this.Ld=b}function pe(a,b,c,d){return new oe(new je(b,c,d),a.Ld)}function qe(a){return a.N.da?a.N.j():null}oe.prototype.w=function(){return this.Ld};function re(a){return a.Ld.da?a.Ld.j():null};function se(){}se.prototype.Te=function(){return null};se.prototype.fe=function(){return null};var te=new se;function ue(a,b,c){this.xf=a;this.Ka=b;this.yd=c}ue.prototype.Te=function(a){var b=this.Ka.N;if(ne(b,a))return b.j().Q(a);b=null!=this.yd?new je(this.yd,!0,!1):this.Ka.w();return this.xf.qc(a,b)};ue.prototype.fe=function(a,b,c){var d=null!=this.yd?this.yd:re(this.Ka);a=this.xf.Xd(d,b,1,c,a);return 0===a.length?null:a[0]};function ve(a,b){this.Sd=a;this.Df=b}function we(a){this.U=a}
we.prototype.eb=function(a,b,c,d){var e=new xe,f;if(b.type===ge)b.source.ee?c=ye(this,a,b.path,b.Ga,c,d,e):(D(b.source.Se,"Unknown source."),f=b.source.Ee||le(a.w())&&!b.path.e(),c=ze(this,a,b.path,b.Ga,c,d,f,e));else if(b.type===be)b.source.ee?c=Ae(this,a,b.path,b.children,c,d,e):(D(b.source.Se,"Unknown source."),f=b.source.Ee||le(a.w()),c=Be(this,a,b.path,b.children,c,d,f,e));else if(b.type===ee)if(b.Id)if(b=b.path,null!=c.lc(b))c=a;else{f=new ue(c,a,d);d=a.N.j();if(b.e()||".priority"===K(b))ke(a.w())?
b=c.Aa(re(a)):(b=a.w().j(),D(b instanceof O,"serverChildren would be complete if leaf node"),b=c.rc(b)),b=this.U.ya(d,b,e);else{var h=K(b),k=c.qc(h,a.w());null==k&&ne(a.w(),h)&&(k=d.Q(h));b=null!=k?this.U.F(d,h,k,N(b),f,e):a.N.j().Da(h)?this.U.F(d,h,L,N(b),f,e):d;b.e()&&ke(a.w())&&(d=c.Aa(re(a)),d.J()&&(b=this.U.ya(b,d,e)))}d=ke(a.w())||null!=c.lc(Q);c=pe(a,b,d,this.U.Na())}else c=Ce(this,a,b.path,b.Ob,c,d,e);else if(b.type===$d)d=b.path,b=a.w(),f=b.j(),h=b.da||d.e(),c=De(this,new oe(a.N,new je(f,
h,b.Sb)),d,c,te,e);else throw Mb("Unknown operation type: "+b.type);e=Na(e.fb);d=c;b=d.N;b.da&&(f=b.j().J()||b.j().e(),h=qe(a),(0<e.length||!a.N.da||f&&!b.j().Z(h)||!b.j().C().Z(h.C()))&&e.push(Ee(qe(d))));return new ve(c,e)};
function De(a,b,c,d,e,f){var h=b.N;if(null!=d.lc(c))return b;var k;if(c.e())D(ke(b.w()),"If change path is empty, we must have complete server data"),le(b.w())?(e=re(b),d=d.rc(e instanceof O?e:L)):d=d.Aa(re(b)),f=a.U.ya(b.N.j(),d,f);else{var m=K(c);if(".priority"==m)D(1==Ec(c),"Can't have a priority with additional path components"),f=h.j(),k=b.w().j(),d=d.ad(c,f,k),f=null!=d?a.U.fa(f,d):h.j();else{var l=N(c);ne(h,m)?(k=b.w().j(),d=d.ad(c,h.j(),k),d=null!=d?h.j().Q(m).F(l,d):h.j().Q(m)):d=d.qc(m,
b.w());f=null!=d?a.U.F(h.j(),m,d,l,e,f):h.j()}}return pe(b,f,h.da||c.e(),a.U.Na())}function ze(a,b,c,d,e,f,h,k){var m=b.w();h=h?a.U:a.U.Ub();if(c.e())d=h.ya(m.j(),d,null);else if(h.Na()&&!m.Sb)d=m.j().F(c,d),d=h.ya(m.j(),d,null);else{var l=K(c);if(!me(m,c)&&1<Ec(c))return b;var u=N(c);d=m.j().Q(l).F(u,d);d=".priority"==l?h.fa(m.j(),d):h.F(m.j(),l,d,u,te,null)}m=m.da||c.e();b=new oe(b.N,new je(d,m,h.Na()));return De(a,b,c,e,new ue(e,b,f),k)}
function ye(a,b,c,d,e,f,h){var k=b.N;e=new ue(e,b,f);if(c.e())h=a.U.ya(b.N.j(),d,h),a=pe(b,h,!0,a.U.Na());else if(f=K(c),".priority"===f)h=a.U.fa(b.N.j(),d),a=pe(b,h,k.da,k.Sb);else{c=N(c);var m=k.j().Q(f);if(!c.e()){var l=e.Te(f);d=null!=l?".priority"===Oc(c)&&l.P(c.parent()).e()?l:l.F(c,d):L}m.Z(d)?a=b:(h=a.U.F(k.j(),f,d,c,e,h),a=pe(b,h,k.da,a.U.Na()))}return a}
function Ae(a,b,c,d,e,f,h){var k=b;Hd(d,function(d,l){var u=c.n(d);ne(b.N,K(u))&&(k=ye(a,k,u,l,e,f,h))});Hd(d,function(d,l){var u=c.n(d);ne(b.N,K(u))||(k=ye(a,k,u,l,e,f,h))});return k}function Fe(a,b){Hd(b,function(b,d){a=a.F(b,d)});return a}
function Be(a,b,c,d,e,f,h,k){if(b.w().j().e()&&!ke(b.w()))return b;var m=b;c=c.e()?d:Ad(R,c,d);var l=b.w().j();c.children.ha(function(c,d){if(l.Da(c)){var F=b.w().j().Q(c),F=Fe(F,d);m=ze(a,m,new E(c),F,e,f,h,k)}});c.children.ha(function(c,d){var F=!ne(b.w(),c)&&null==d.value;l.Da(c)||F||(F=b.w().j().Q(c),F=Fe(F,d),m=ze(a,m,new E(c),F,e,f,h,k))});return m}
function Ce(a,b,c,d,e,f,h){if(null!=e.lc(c))return b;var k=le(b.w()),m=b.w();if(null!=d.value){if(c.e()&&m.da||me(m,c))return ze(a,b,c,m.j().P(c),e,f,k,h);if(c.e()){var l=R;m.j().O(tc,function(a,b){l=l.set(new E(a),b)});return Be(a,b,c,l,e,f,k,h)}return b}l=R;Hd(d,function(a){var b=c.n(a);me(m,b)&&(l=l.set(a,m.j().P(b)))});return Be(a,b,c,l,e,f,k,h)};function Ge(a){this.V=a;this.g=a.m.g}function He(a,b,c,d){var e=[],f=[];ya(b,function(b){b.type===Ie&&a.g.nd(b.qe,b.Ja)&&f.push(new S(Je,b.Ja,b.Xa))});Ke(a,e,Le,b,d,c);Ke(a,e,Me,b,d,c);Ke(a,e,Je,f,d,c);Ke(a,e,Ie,b,d,c);Ke(a,e,Ne,b,d,c);return e}function Ke(a,b,c,d,e,f){d=za(d,function(a){return a.type===c});Ha(d,q(a.Ff,a));ya(d,function(c){var d=Oe(a,c,f);ya(e,function(e){e.nf(c.type)&&b.push(e.createEvent(d,a.V))})})}
function Oe(a,b,c){"value"!==b.type&&"child_removed"!==b.type&&(b.Dd=c.Ve(b.Xa,b.Ja,a.g));return b}Ge.prototype.Ff=function(a,b){if(null==a.Xa||null==b.Xa)throw Mb("Should only compare child_ events.");return this.g.compare(new C(a.Xa,a.Ja),new C(b.Xa,b.Ja))};function Pe(a,b){this.V=a;var c=a.m,d=new Qe(c.g),c=T(c)?new Qe(c.g):c.xa?new Re(c):new Se(c);this.hf=new we(c);var e=b.w(),f=b.N,h=d.ya(L,e.j(),null),k=c.ya(L,f.j(),null);this.Ka=new oe(new je(k,f.da,c.Na()),new je(h,e.da,d.Na()));this.Za=[];this.Jf=new Ge(a)}function Te(a){return a.V}g=Pe.prototype;g.w=function(){return this.Ka.w().j()};g.hb=function(a){var b=re(this.Ka);return b&&(T(this.V.m)||!a.e()&&!b.Q(K(a)).e())?b.P(a):null};g.e=function(){return 0===this.Za.length};g.Nb=function(a){this.Za.push(a)};
g.kb=function(a,b){var c=[];if(b){D(null==a,"A cancel should cancel all event registrations.");var d=this.V.path;ya(this.Za,function(a){(a=a.Me(b,d))&&c.push(a)})}if(a){for(var e=[],f=0;f<this.Za.length;++f){var h=this.Za[f];if(!h.matches(a))e.push(h);else if(a.Xe()){e=e.concat(this.Za.slice(f+1));break}}this.Za=e}else this.Za=[];return c};
g.eb=function(a,b,c){a.type===be&&null!==a.source.Hb&&(D(re(this.Ka),"We should always have a full cache before handling merges"),D(qe(this.Ka),"Missing event cache, even though we have a server cache"));var d=this.Ka;a=this.hf.eb(d,a,b,c);b=this.hf;c=a.Sd;D(c.N.j().yc(b.U.g),"Event snap not indexed");D(c.w().j().yc(b.U.g),"Server snap not indexed");D(ke(a.Sd.w())||!ke(d.w()),"Once a server snap is complete, it should never go back");this.Ka=a.Sd;return Ue(this,a.Df,a.Sd.N.j(),null)};
function Ve(a,b){var c=a.Ka.N,d=[];c.j().J()||c.j().O(H,function(a,b){d.push(new S(Me,b,a))});c.da&&d.push(Ee(c.j()));return Ue(a,d,c.j(),b)}function Ue(a,b,c,d){return He(a.Jf,b,c,d?[d]:a.Za)};function We(a,b,c,d){this.ae=b;this.Md=c;this.Dd=d;this.hd=a}We.prototype.Yb=function(){var a=this.Md.wb();return"value"===this.hd?a.path:a.getParent().path};We.prototype.ge=function(){return this.hd};We.prototype.Tb=function(){return this.ae.Tb(this)};We.prototype.toString=function(){return this.Yb().toString()+":"+this.hd+":"+x(this.Md.be())};function Xe(a,b,c){this.ae=a;this.error=b;this.path=c}Xe.prototype.Yb=function(){return this.path};Xe.prototype.ge=function(){return"cancel"};
Xe.prototype.Tb=function(){return this.ae.Tb(this)};Xe.prototype.toString=function(){return this.path.toString()+":cancel"};function Ye(){this.vb=[]}function Ze(a,b){for(var c=null,d=0;d<b.length;d++){var e=b[d],f=e.Yb();null===c||f.Z(c.Yb())||(a.vb.push(c),c=null);null===c&&(c=new $e(f));c.add(e)}c&&a.vb.push(c)}function af(a,b,c){Ze(a,c);bf(a,function(a){return a.Z(b)})}function cf(a,b,c){Ze(a,c);bf(a,function(a){return a.contains(b)||b.contains(a)})}
function bf(a,b){for(var c=!0,d=0;d<a.vb.length;d++){var e=a.vb[d];if(e)if(e=e.Yb(),b(e)){for(var e=a.vb[d],f=0;f<e.jd.length;f++){var h=e.jd[f];if(null!==h){e.jd[f]=null;var k=h.Tb();Qb&&I("event: "+h.toString());fc(k)}}a.vb[d]=null}else c=!1}c&&(a.vb=[])}function $e(a){this.qa=a;this.jd=[]}$e.prototype.add=function(a){this.jd.push(a)};$e.prototype.Yb=function(){return this.qa};function Qe(a){this.g=a}g=Qe.prototype;g.F=function(a,b,c,d,e,f){D(a.yc(this.g),"A node must be indexed if only a child is updated");e=a.Q(b);if(e.P(d).Z(c.P(d))&&e.e()==c.e())return a;null!=f&&(c.e()?a.Da(b)?df(f,new S(Le,e,b)):D(a.J(),"A child remove without an old child only makes sense on a leaf node"):e.e()?df(f,new S(Me,c,b)):df(f,new S(Ie,c,b,e)));return a.J()&&c.e()?a:a.T(b,c).nb(this.g)};
g.ya=function(a,b,c){null!=c&&(a.J()||a.O(H,function(a,e){b.Da(a)||df(c,new S(Le,e,a))}),b.J()||b.O(H,function(b,e){if(a.Da(b)){var f=a.Q(b);f.Z(e)||df(c,new S(Ie,e,b,f))}else df(c,new S(Me,e,b))}));return b.nb(this.g)};g.fa=function(a,b){return a.e()?L:a.fa(b)};g.Na=function(){return!1};g.Ub=function(){return this};function Se(a){this.he=new Qe(a.g);this.g=a.g;var b;a.ka?(b=ef(a),b=a.g.Ec(ff(a),b)):b=a.g.Hc();this.Uc=b;a.na?(b=gf(a),a=a.g.Ec(hf(a),b)):a=a.g.Fc();this.vc=a}g=Se.prototype;g.matches=function(a){return 0>=this.g.compare(this.Uc,a)&&0>=this.g.compare(a,this.vc)};g.F=function(a,b,c,d,e,f){this.matches(new C(b,c))||(c=L);return this.he.F(a,b,c,d,e,f)};
g.ya=function(a,b,c){b.J()&&(b=L);var d=b.nb(this.g),d=d.fa(L),e=this;b.O(H,function(a,b){e.matches(new C(a,b))||(d=d.T(a,L))});return this.he.ya(a,d,c)};g.fa=function(a){return a};g.Na=function(){return!0};g.Ub=function(){return this.he};function Re(a){this.sa=new Se(a);this.g=a.g;D(a.xa,"Only valid if limit has been set");this.oa=a.oa;this.Ib=!jf(a)}g=Re.prototype;g.F=function(a,b,c,d,e,f){this.sa.matches(new C(b,c))||(c=L);return a.Q(b).Z(c)?a:a.Eb()<this.oa?this.sa.Ub().F(a,b,c,d,e,f):kf(this,a,b,c,e,f)};
g.ya=function(a,b,c){var d;if(b.J()||b.e())d=L.nb(this.g);else if(2*this.oa<b.Eb()&&b.yc(this.g)){d=L.nb(this.g);b=this.Ib?b.Zb(this.sa.vc,this.g):b.Xb(this.sa.Uc,this.g);for(var e=0;0<b.Pa.length&&e<this.oa;){var f=M(b),h;if(h=this.Ib?0>=this.g.compare(this.sa.Uc,f):0>=this.g.compare(f,this.sa.vc))d=d.T(f.name,f.R),e++;else break}}else{d=b.nb(this.g);d=d.fa(L);var k,m,l;if(this.Ib){b=d.We(this.g);k=this.sa.vc;m=this.sa.Uc;var u=nc(this.g);l=function(a,b){return u(b,a)}}else b=d.Wb(this.g),k=this.sa.Uc,
m=this.sa.vc,l=nc(this.g);for(var e=0,z=!1;0<b.Pa.length;)f=M(b),!z&&0>=l(k,f)&&(z=!0),(h=z&&e<this.oa&&0>=l(f,m))?e++:d=d.T(f.name,L)}return this.sa.Ub().ya(a,d,c)};g.fa=function(a){return a};g.Na=function(){return!0};g.Ub=function(){return this.sa.Ub()};
function kf(a,b,c,d,e,f){var h;if(a.Ib){var k=nc(a.g);h=function(a,b){return k(b,a)}}else h=nc(a.g);D(b.Eb()==a.oa,"");var m=new C(c,d),l=a.Ib?pd(b,a.g):qd(b,a.g),u=a.sa.matches(m);if(b.Da(c)){for(var z=b.Q(c),l=e.fe(a.g,l,a.Ib);null!=l&&(l.name==c||b.Da(l.name));)l=e.fe(a.g,l,a.Ib);e=null==l?1:h(l,m);if(u&&!d.e()&&0<=e)return null!=f&&df(f,new S(Ie,d,c,z)),b.T(c,d);null!=f&&df(f,new S(Le,z,c));b=b.T(c,L);return null!=l&&a.sa.matches(l)?(null!=f&&df(f,new S(Me,l.R,l.name)),b.T(l.name,l.R)):b}return d.e()?
b:u&&0<=h(l,m)?(null!=f&&(df(f,new S(Le,l.R,l.name)),df(f,new S(Me,d,c))),b.T(c,d).T(l.name,L)):b};function S(a,b,c,d){this.type=a;this.Ja=b;this.Xa=c;this.qe=d;this.Dd=void 0}function Ee(a){return new S(Ne,a)}var Me="child_added",Le="child_removed",Ie="child_changed",Je="child_moved",Ne="value";function xe(){this.fb={}}
function df(a,b){var c=b.type,d=b.Xa;D(c==Me||c==Ie||c==Le,"Only child changes supported for tracking");D(".priority"!==d,"Only non-priority child changes can be tracked.");var e=w(a.fb,d);if(e){var f=e.type;if(c==Me&&f==Le)a.fb[d]=new S(Ie,b.Ja,d,e.Ja);else if(c==Le&&f==Me)delete a.fb[d];else if(c==Le&&f==Ie)a.fb[d]=new S(Le,e.qe,d);else if(c==Ie&&f==Me)a.fb[d]=new S(Me,b.Ja,d);else if(c==Ie&&f==Ie)a.fb[d]=new S(Ie,b.Ja,d,e.qe);else throw Mb("Illegal combination of changes: "+b+" occurred after "+
e);}else a.fb[d]=b};function lf(){this.Rb=this.na=this.Kb=this.ka=this.xa=!1;this.oa=0;this.mb="";this.dc=null;this.zb="";this.ac=null;this.xb="";this.g=H}var mf=new lf;function jf(a){return""===a.mb?a.ka:"l"===a.mb}function ff(a){D(a.ka,"Only valid if start has been set");return a.dc}function ef(a){D(a.ka,"Only valid if start has been set");return a.Kb?a.zb:"[MIN_NAME]"}function hf(a){D(a.na,"Only valid if end has been set");return a.ac}
function gf(a){D(a.na,"Only valid if end has been set");return a.Rb?a.xb:"[MAX_NAME]"}function nf(a){var b=new lf;b.xa=a.xa;b.oa=a.oa;b.ka=a.ka;b.dc=a.dc;b.Kb=a.Kb;b.zb=a.zb;b.na=a.na;b.ac=a.ac;b.Rb=a.Rb;b.xb=a.xb;b.g=a.g;b.mb=a.mb;return b}g=lf.prototype;g.ne=function(a){var b=nf(this);b.xa=!0;b.oa=a;b.mb="l";return b};g.oe=function(a){var b=nf(this);b.xa=!0;b.oa=a;b.mb="r";return b};g.Nd=function(a,b){var c=nf(this);c.ka=!0;n(a)||(a=null);c.dc=a;null!=b?(c.Kb=!0,c.zb=b):(c.Kb=!1,c.zb="");return c};
g.gd=function(a,b){var c=nf(this);c.na=!0;n(a)||(a=null);c.ac=a;n(b)?(c.Rb=!0,c.xb=b):(c.vg=!1,c.xb="");return c};function of(a,b){var c=nf(a);c.g=b;return c}function pf(a){var b={};a.ka&&(b.sp=a.dc,a.Kb&&(b.sn=a.zb));a.na&&(b.ep=a.ac,a.Rb&&(b.en=a.xb));if(a.xa){b.l=a.oa;var c=a.mb;""===c&&(c=jf(a)?"l":"r");b.vf=c}a.g!==H&&(b.i=a.g.toString());return b}function T(a){return!(a.ka||a.na||a.xa)}function qf(a){return T(a)&&a.g==H}
function rf(a){var b={};if(qf(a))return b;var c;a.g===H?c="$priority":a.g===wc?c="$value":a.g===tc?c="$key":(D(a.g instanceof pc,"Unrecognized index type!"),c=a.g.toString());b.orderBy=x(c);a.ka&&(b.startAt=x(a.dc),a.Kb&&(b.startAt+=","+x(a.zb)));a.na&&(b.endAt=x(a.ac),a.Rb&&(b.endAt+=","+x(a.xb)));a.xa&&(jf(a)?b.limitToFirst=a.oa:b.limitToLast=a.oa);return b}g.toString=function(){return x(pf(this))};function sf(a){this.W=a}var tf=new sf(new vd(null));function uf(a,b,c){if(b.e())return new sf(new vd(c));var d=zd(a.W,b);if(null!=d){var e=d.path,d=d.value;b=P(e,b);d=d.F(b,c);return new sf(a.W.set(e,d))}a=Ad(a.W,b,new vd(c));return new sf(a)}function vf(a,b,c){var d=a;fb(c,function(a,c){d=uf(d,b.n(a),c)});return d}sf.prototype.Ed=function(a){if(a.e())return tf;a=Ad(this.W,a,R);return new sf(a)};function wf(a,b){var c=zd(a.W,b);return null!=c?a.W.get(c.path).P(P(c.path,b)):null}
function xf(a){var b=[],c=a.W.value;null!=c?c.J()||c.O(H,function(a,c){b.push(new C(a,c))}):a.W.children.ha(function(a,c){null!=c.value&&b.push(new C(a,c.value))});return b}function yf(a,b){if(b.e())return a;var c=wf(a,b);return null!=c?new sf(new vd(c)):new sf(a.W.subtree(b))}sf.prototype.e=function(){return this.W.e()};sf.prototype.apply=function(a){return zf(Q,this.W,a)};
function zf(a,b,c){if(null!=b.value)return c.F(a,b.value);var d=null;b.children.ha(function(b,f){".priority"===b?(D(null!==f.value,"Priority writes must always be leaf nodes"),d=f.value):c=zf(a.n(b),f,c)});c.P(a).e()||null===d||(c=c.F(a.n(".priority"),d));return c};function Af(){this.Jd=L}Af.prototype.j=function(a){return this.Jd.P(a)};Af.prototype.toString=function(){return this.Jd.toString()};function Bf(a){this.oc=a}Bf.prototype.getToken=function(a){return this.oc.INTERNAL.getToken(a).then(null,function(a){return a&&"auth/token-not-initialized"===a.code?(I("Got auth/token-not-initialized error.  Treating as null token."),null):Promise.reject(a)})};function Cf(a,b){a.oc.INTERNAL.addAuthTokenListener(b)};function Df(){this.S=tf;this.la=[];this.Bc=-1}function Ef(a,b){for(var c=0;c<a.la.length;c++){var d=a.la[c];if(d.Zc===b)return d}return null}g=Df.prototype;
g.Ed=function(a){var b=Ea(this.la,function(b){return b.Zc===a});D(0<=b,"removeWrite called with nonexistent writeId.");var c=this.la[b];this.la.splice(b,1);for(var d=c.visible,e=!1,f=this.la.length-1;d&&0<=f;){var h=this.la[f];h.visible&&(f>=b&&Ff(h,c.path)?d=!1:c.path.contains(h.path)&&(e=!0));f--}if(d){if(e)this.S=Gf(this.la,Hf,Q),this.Bc=0<this.la.length?this.la[this.la.length-1].Zc:-1;else if(c.Ga)this.S=this.S.Ed(c.path);else{var k=this;v(c.children,function(a,b){k.S=k.S.Ed(c.path.n(b))})}return!0}return!1};
g.Aa=function(a,b,c,d){if(c||d){var e=yf(this.S,a);return!d&&e.e()?b:d||null!=b||null!=wf(e,Q)?(e=Gf(this.la,function(b){return(b.visible||d)&&(!c||!(0<=xa(c,b.Zc)))&&(b.path.contains(a)||a.contains(b.path))},a),b=b||L,e.apply(b)):null}e=wf(this.S,a);if(null!=e)return e;e=yf(this.S,a);return e.e()?b:null!=b||null!=wf(e,Q)?(b=b||L,e.apply(b)):null};
g.rc=function(a,b){var c=L,d=wf(this.S,a);if(d)d.J()||d.O(H,function(a,b){c=c.T(a,b)});else if(b){var e=yf(this.S,a);b.O(H,function(a,b){var d=yf(e,new E(a)).apply(b);c=c.T(a,d)});ya(xf(e),function(a){c=c.T(a.name,a.R)})}else e=yf(this.S,a),ya(xf(e),function(a){c=c.T(a.name,a.R)});return c};g.ad=function(a,b,c,d){D(c||d,"Either existingEventSnap or existingServerSnap must exist");a=a.n(b);if(null!=wf(this.S,a))return null;a=yf(this.S,a);return a.e()?d.P(b):a.apply(d.P(b))};
g.qc=function(a,b,c){a=a.n(b);var d=wf(this.S,a);return null!=d?d:ne(c,b)?yf(this.S,a).apply(c.j().Q(b)):null};g.lc=function(a){return wf(this.S,a)};g.Xd=function(a,b,c,d,e,f){var h;a=yf(this.S,a);h=wf(a,Q);if(null==h)if(null!=b)h=a.apply(b);else return[];h=h.nb(f);if(h.e()||h.J())return[];b=[];a=nc(f);e=e?h.Zb(c,f):h.Xb(c,f);for(f=M(e);f&&b.length<d;)0!==a(f,c)&&b.push(f),f=M(e);return b};
function Ff(a,b){return a.Ga?a.path.contains(b):!!Qa(a.children,function(c,d){return a.path.n(d).contains(b)})}function Hf(a){return a.visible}
function Gf(a,b,c){for(var d=tf,e=0;e<a.length;++e){var f=a[e];if(b(f)){var h=f.path;if(f.Ga)c.contains(h)?(h=P(c,h),d=uf(d,h,f.Ga)):h.contains(c)&&(h=P(h,c),d=uf(d,Q,f.Ga.P(h)));else if(f.children)if(c.contains(h))h=P(c,h),d=vf(d,h,f.children);else{if(h.contains(c))if(h=P(h,c),h.e())d=vf(d,Q,f.children);else if(f=w(f.children,K(h)))f=f.P(N(h)),d=uf(d,Q,f)}else throw Mb("WriteRecord should have .snap or .children");}}return d}function If(a,b){this.Lb=a;this.W=b}g=If.prototype;
g.Aa=function(a,b,c){return this.W.Aa(this.Lb,a,b,c)};g.rc=function(a){return this.W.rc(this.Lb,a)};g.ad=function(a,b,c){return this.W.ad(this.Lb,a,b,c)};g.lc=function(a){return this.W.lc(this.Lb.n(a))};g.Xd=function(a,b,c,d,e){return this.W.Xd(this.Lb,a,b,c,d,e)};g.qc=function(a,b){return this.W.qc(this.Lb,a,b)};g.n=function(a){return new If(this.Lb.n(a),this.W)};function Jf(a,b){this.rf={};this.Vc=new Kf(a);this.va=b;var c=1E4+2E4*Math.random();hc(q(this.lf,this),Math.floor(c))}Jf.prototype.lf=function(){var a=this.Vc.get(),b={},c=!1,d;for(d in a)0<a[d]&&eb(this.rf,d)&&(b[d]=a[d],c=!0);c&&this.va.ye(b);hc(q(this.lf,this),Math.floor(6E5*Math.random()))};function Lf(){this.tc={}}function Mf(a,b,c){n(c)||(c=1);eb(a.tc,b)||(a.tc[b]=0);a.tc[b]+=c}Lf.prototype.get=function(){return Ta(this.tc)};function Kf(a){this.Ef=a;this.rd=null}Kf.prototype.get=function(){var a=this.Ef.get(),b=Ta(a);if(this.rd)for(var c in this.rd)b[c]-=this.rd[c];this.rd=a;return b};var Nf={},Of={};function Pf(a){a=a.toString();Nf[a]||(Nf[a]=new Lf);return Nf[a]}function Qf(a,b){var c=a.toString();Of[c]||(Of[c]=b());return Of[c]};function Rf(a,b,c){this.f=Tb("p:rest:");this.L=a;this.Gb=b;this.$c=c;this.$={}}function Sf(a,b){if(n(b))return"tag$"+b;D(qf(a.m),"should have a tag if it's not a default query.");return a.path.toString()}g=Rf.prototype;
g.$e=function(a,b,c,d){var e=a.path.toString();this.f("Listen called for "+e+" "+a.ja());var f=Sf(a,c),h={};this.$[f]=h;a=rf(a.m);var k=this;Tf(this,e+".json",a,function(a,b){var u=b;404===a&&(a=u=null);null===a&&k.Gb(e,u,!1,c);w(k.$,f)===h&&d(a?401==a?"permission_denied":"rest_error:"+a:"ok",null)})};g.uf=function(a,b){var c=Sf(a,b);delete this.$[c]};g.kf=function(){};g.re=function(){};g.cf=function(){};g.xd=function(){};g.put=function(){};g.af=function(){};g.ye=function(){};
function Tf(a,b,c,d){c=c||{};c.format="export";a.$c.getToken(!1).then(function(e){(e=e&&e.accessToken)&&(c.auth=e);var f=(a.L.Sc?"https://":"http://")+a.L.host+b+"?"+gb(c);a.f("Sending REST request for "+f);var h=new XMLHttpRequest;h.onreadystatechange=function(){if(d&&4===h.readyState){a.f("REST Response for "+f+" received. status:",h.status,"response:",h.responseText);var b=null;if(200<=h.status&&300>h.status){try{b=lb(h.responseText)}catch(c){J("Failed to parse JSON response for "+f+": "+h.responseText)}d(null,
b)}else 401!==h.status&&404!==h.status&&J("Got unsuccessful REST response for "+f+" Status: "+h.status),d(h.status);d=null}};h.open("GET",f,!0);h.send()})};function Uf(a){this.te=a;this.Bd=[];this.Qb=0;this.Yd=-1;this.Fb=null}function Vf(a,b,c){a.Yd=b;a.Fb=c;a.Yd<a.Qb&&(a.Fb(),a.Fb=null)}function Wf(a,b,c){for(a.Bd[b]=c;a.Bd[a.Qb];){var d=a.Bd[a.Qb];delete a.Bd[a.Qb];for(var e=0;e<d.length;++e)if(d[e]){var f=a;fc(function(){f.te(d[e])})}if(a.Qb===a.Yd){a.Fb&&(clearTimeout(a.Fb),a.Fb(),a.Fb=null);break}a.Qb++}};var Cb="websocket",Db="long_polling";var Xf=null;"undefined"!==typeof MozWebSocket?Xf=MozWebSocket:"undefined"!==typeof WebSocket&&(Xf=WebSocket);function Yf(a,b,c,d){this.Zd=a;this.f=Tb(this.Zd);this.frames=this.zc=null;this.pb=this.qb=this.Fe=0;this.Va=Pf(b);a={v:"5"};"undefined"!==typeof location&&location.href&&-1!==location.href.indexOf("firebaseio.com")&&(a.r="f");c&&(a.s=c);d&&(a.ls=d);this.Ke=Bb(b,Cb,a)}var Zf;
Yf.prototype.open=function(a,b){this.ib=b;this.Xf=a;this.f("Websocket connecting to "+this.Ke);this.wc=!1;xb.set("previous_websocket_failure",!0);try{this.Ia=new Xf(this.Ke)}catch(c){this.f("Error instantiating WebSocket.");var d=c.message||c.data;d&&this.f(d);this.bb();return}var e=this;this.Ia.onopen=function(){e.f("Websocket connected.");e.wc=!0};this.Ia.onclose=function(){e.f("Websocket connection was disconnected.");e.Ia=null;e.bb()};this.Ia.onmessage=function(a){if(null!==e.Ia)if(a=a.data,e.pb+=
a.length,Mf(e.Va,"bytes_received",a.length),$f(e),null!==e.frames)ag(e,a);else{a:{D(null===e.frames,"We already have a frame buffer");if(6>=a.length){var b=Number(a);if(!isNaN(b)){e.Fe=b;e.frames=[];a=null;break a}}e.Fe=1;e.frames=[]}null!==a&&ag(e,a)}};this.Ia.onerror=function(a){e.f("WebSocket error.  Closing connection.");(a=a.message||a.data)&&e.f(a);e.bb()}};Yf.prototype.start=function(){};
Yf.isAvailable=function(){var a=!1;if("undefined"!==typeof navigator&&navigator.userAgent){var b=navigator.userAgent.match(/Android ([0-9]{0,}\.[0-9]{0,})/);b&&1<b.length&&4.4>parseFloat(b[1])&&(a=!0)}return!a&&null!==Xf&&!Zf};Yf.responsesRequiredToBeHealthy=2;Yf.healthyTimeout=3E4;g=Yf.prototype;g.sd=function(){xb.remove("previous_websocket_failure")};function ag(a,b){a.frames.push(b);if(a.frames.length==a.Fe){var c=a.frames.join("");a.frames=null;c=lb(c);a.Xf(c)}}
g.send=function(a){$f(this);a=x(a);this.qb+=a.length;Mf(this.Va,"bytes_sent",a.length);a=bc(a,16384);1<a.length&&bg(this,String(a.length));for(var b=0;b<a.length;b++)bg(this,a[b])};g.Tc=function(){this.Ab=!0;this.zc&&(clearInterval(this.zc),this.zc=null);this.Ia&&(this.Ia.close(),this.Ia=null)};g.bb=function(){this.Ab||(this.f("WebSocket is closing itself"),this.Tc(),this.ib&&(this.ib(this.wc),this.ib=null))};g.close=function(){this.Ab||(this.f("WebSocket is being closed"),this.Tc())};
function $f(a){clearInterval(a.zc);a.zc=setInterval(function(){a.Ia&&bg(a,"0");$f(a)},Math.floor(45E3))}function bg(a,b){try{a.Ia.send(b)}catch(c){a.f("Exception thrown from WebSocket.send():",c.message||c.data,"Closing connection."),setTimeout(q(a.bb,a),0)}};function cg(a,b,c,d){this.Zd=a;this.f=Tb(a);this.jc=b;this.pb=this.qb=0;this.Va=Pf(b);this.tf=c;this.wc=!1;this.Cb=d;this.Yc=function(a){return Bb(b,Db,a)}}var dg,eg;
cg.prototype.open=function(a,b){this.Ne=0;this.ia=b;this.bf=new Uf(a);this.Ab=!1;var c=this;this.sb=setTimeout(function(){c.f("Timed out trying to connect.");c.bb();c.sb=null},Math.floor(3E4));Yb(function(){if(!c.Ab){c.Ta=new fg(function(a,b,d,k,m){gg(c,arguments);if(c.Ta)if(c.sb&&(clearTimeout(c.sb),c.sb=null),c.wc=!0,"start"==a)c.id=b,c.ff=d;else if("close"===a)b?(c.Ta.Kd=!1,Vf(c.bf,b,function(){c.bb()})):c.bb();else throw Error("Unrecognized command received: "+a);},function(a,b){gg(c,arguments);
Wf(c.bf,a,b)},function(){c.bb()},c.Yc);var a={start:"t"};a.ser=Math.floor(1E8*Math.random());c.Ta.Qd&&(a.cb=c.Ta.Qd);a.v="5";c.tf&&(a.s=c.tf);c.Cb&&(a.ls=c.Cb);"undefined"!==typeof location&&location.href&&-1!==location.href.indexOf("firebaseio.com")&&(a.r="f");a=c.Yc(a);c.f("Connecting via long-poll to "+a);hg(c.Ta,a,function(){})}})};
cg.prototype.start=function(){var a=this.Ta,b=this.ff;a.Vf=this.id;a.Wf=b;for(a.Ud=!0;ig(a););a=this.id;b=this.ff;this.fc=document.createElement("iframe");var c={dframe:"t"};c.id=a;c.pw=b;this.fc.src=this.Yc(c);this.fc.style.display="none";document.body.appendChild(this.fc)};
cg.isAvailable=function(){return dg||!eg&&"undefined"!==typeof document&&null!=document.createElement&&!("object"===typeof window&&window.chrome&&window.chrome.extension&&!/^chrome/.test(window.location.href))&&!("object"===typeof Windows&&"object"===typeof Windows.rg)&&!0};g=cg.prototype;g.sd=function(){};g.Tc=function(){this.Ab=!0;this.Ta&&(this.Ta.close(),this.Ta=null);this.fc&&(document.body.removeChild(this.fc),this.fc=null);this.sb&&(clearTimeout(this.sb),this.sb=null)};
g.bb=function(){this.Ab||(this.f("Longpoll is closing itself"),this.Tc(),this.ia&&(this.ia(this.wc),this.ia=null))};g.close=function(){this.Ab||(this.f("Longpoll is being closed."),this.Tc())};g.send=function(a){a=x(a);this.qb+=a.length;Mf(this.Va,"bytes_sent",a.length);a=mb(a);a=ab(a,!0);a=bc(a,1840);for(var b=0;b<a.length;b++){var c=this.Ta;c.Qc.push({jg:this.Ne,pg:a.length,Pe:a[b]});c.Ud&&ig(c);this.Ne++}};function gg(a,b){var c=x(b).length;a.pb+=c;Mf(a.Va,"bytes_received",c)}
function fg(a,b,c,d){this.Yc=d;this.ib=c;this.ve=new Gc;this.Qc=[];this.$d=Math.floor(1E8*Math.random());this.Kd=!0;this.Qd=Lb();window["pLPCommand"+this.Qd]=a;window["pRTLPCB"+this.Qd]=b;a=document.createElement("iframe");a.style.display="none";if(document.body){document.body.appendChild(a);try{a.contentWindow.document||I("No IE domain setting required")}catch(e){a.src="javascript:void((function(){document.open();document.domain='"+document.domain+"';document.close();})())"}}else throw"Document body has not initialized. Wait to initialize Firebase until after the document is ready.";
a.contentDocument?a.gb=a.contentDocument:a.contentWindow?a.gb=a.contentWindow.document:a.document&&(a.gb=a.document);this.Ea=a;a="";this.Ea.src&&"javascript:"===this.Ea.src.substr(0,11)&&(a='<script>document.domain="'+document.domain+'";\x3c/script>');a="<html><body>"+a+"</body></html>";try{this.Ea.gb.open(),this.Ea.gb.write(a),this.Ea.gb.close()}catch(f){I("frame writing exception"),f.stack&&I(f.stack),I(f)}}
fg.prototype.close=function(){this.Ud=!1;if(this.Ea){this.Ea.gb.body.innerHTML="";var a=this;setTimeout(function(){null!==a.Ea&&(document.body.removeChild(a.Ea),a.Ea=null)},Math.floor(0))}var b=this.ib;b&&(this.ib=null,b())};
function ig(a){if(a.Ud&&a.Kd&&a.ve.count()<(0<a.Qc.length?2:1)){a.$d++;var b={};b.id=a.Vf;b.pw=a.Wf;b.ser=a.$d;for(var b=a.Yc(b),c="",d=0;0<a.Qc.length;)if(1870>=a.Qc[0].Pe.length+30+c.length){var e=a.Qc.shift(),c=c+"&seg"+d+"="+e.jg+"&ts"+d+"="+e.pg+"&d"+d+"="+e.Pe;d++}else break;jg(a,b+c,a.$d);return!0}return!1}function jg(a,b,c){function d(){a.ve.remove(c);ig(a)}a.ve.add(c,1);var e=setTimeout(d,Math.floor(25E3));hg(a,b,function(){clearTimeout(e);d()})}
function hg(a,b,c){setTimeout(function(){try{if(a.Kd){var d=a.Ea.gb.createElement("script");d.type="text/javascript";d.async=!0;d.src=b;d.onload=d.onreadystatechange=function(){var a=d.readyState;a&&"loaded"!==a&&"complete"!==a||(d.onload=d.onreadystatechange=null,d.parentNode&&d.parentNode.removeChild(d),c())};d.onerror=function(){I("Long-poll script failed to load: "+b);a.Kd=!1;a.close()};a.Ea.gb.body.appendChild(d)}}catch(e){}},Math.floor(1))};function kg(a){lg(this,a)}var mg=[cg,Yf];function lg(a,b){var c=Yf&&Yf.isAvailable(),d=c&&!(xb.Ze||!0===xb.get("previous_websocket_failure"));b.qg&&(c||J("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."),d=!0);if(d)a.Wc=[Yf];else{var e=a.Wc=[];cc(mg,function(a,b){b&&b.isAvailable()&&e.push(b)})}}function ng(a){if(0<a.Wc.length)return a.Wc[0];throw Error("No transports available");};function og(a,b,c,d,e,f,h){this.id=a;this.f=Tb("c:"+this.id+":");this.te=c;this.Lc=d;this.ia=e;this.se=f;this.L=b;this.Ad=[];this.Le=0;this.sf=new kg(b);this.Ua=0;this.Cb=h;this.f("Connection created");pg(this)}
function pg(a){var b=ng(a.sf);a.I=new b("c:"+a.id+":"+a.Le++,a.L,void 0,a.Cb);a.xe=b.responsesRequiredToBeHealthy||0;var c=qg(a,a.I),d=rg(a,a.I);a.Xc=a.I;a.Rc=a.I;a.D=null;a.Bb=!1;setTimeout(function(){a.I&&a.I.open(c,d)},Math.floor(0));b=b.healthyTimeout||0;0<b&&(a.md=hc(function(){a.md=null;a.Bb||(a.I&&102400<a.I.pb?(a.f("Connection exceeded healthy timeout but has received "+a.I.pb+" bytes.  Marking connection healthy."),a.Bb=!0,a.I.sd()):a.I&&10240<a.I.qb?a.f("Connection exceeded healthy timeout but has sent "+
a.I.qb+" bytes.  Leaving connection alive."):(a.f("Closing unhealthy connection after timeout."),a.close()))},Math.floor(b)))}function rg(a,b){return function(c){b===a.I?(a.I=null,c||0!==a.Ua?1===a.Ua&&a.f("Realtime connection lost."):(a.f("Realtime connection failed."),"s-"===a.L.$a.substr(0,2)&&(xb.remove("host:"+a.L.host),a.L.$a=a.L.host)),a.close()):b===a.D?(a.f("Secondary connection lost."),c=a.D,a.D=null,a.Xc!==c&&a.Rc!==c||a.close()):a.f("closing an old connection")}}
function qg(a,b){return function(c){if(2!=a.Ua)if(b===a.Rc){var d=$b("t",c);c=$b("d",c);if("c"==d){if(d=$b("t",c),"d"in c)if(c=c.d,"h"===d){var d=c.ts,e=c.v,f=c.h;a.qf=c.s;Ab(a.L,f);0==a.Ua&&(a.I.start(),sg(a,a.I,d),"5"!==e&&J("Protocol version mismatch detected"),c=a.sf,(c=1<c.Wc.length?c.Wc[1]:null)&&tg(a,c))}else if("n"===d){a.f("recvd end transmission on primary");a.Rc=a.D;for(c=0;c<a.Ad.length;++c)a.wd(a.Ad[c]);a.Ad=[];ug(a)}else"s"===d?(a.f("Connection shutdown command received. Shutting down..."),
a.se&&(a.se(c),a.se=null),a.ia=null,a.close()):"r"===d?(a.f("Reset packet received.  New host: "+c),Ab(a.L,c),1===a.Ua?a.close():(vg(a),pg(a))):"e"===d?Ub("Server Error: "+c):"o"===d?(a.f("got pong on primary."),wg(a),xg(a)):Ub("Unknown control packet command: "+d)}else"d"==d&&a.wd(c)}else if(b===a.D)if(d=$b("t",c),c=$b("d",c),"c"==d)"t"in c&&(c=c.t,"a"===c?yg(a):"r"===c?(a.f("Got a reset on secondary, closing it"),a.D.close(),a.Xc!==a.D&&a.Rc!==a.D||a.close()):"o"===c&&(a.f("got pong on secondary."),
a.pf--,yg(a)));else if("d"==d)a.Ad.push(c);else throw Error("Unknown protocol layer: "+d);else a.f("message on old connection")}}og.prototype.ua=function(a){zg(this,{t:"d",d:a})};function ug(a){a.Xc===a.D&&a.Rc===a.D&&(a.f("cleaning up and promoting a connection: "+a.D.Zd),a.I=a.D,a.D=null)}
function yg(a){0>=a.pf?(a.f("Secondary connection is healthy."),a.Bb=!0,a.D.sd(),a.D.start(),a.f("sending client ack on secondary"),a.D.send({t:"c",d:{t:"a",d:{}}}),a.f("Ending transmission on primary"),a.I.send({t:"c",d:{t:"n",d:{}}}),a.Xc=a.D,ug(a)):(a.f("sending ping on secondary."),a.D.send({t:"c",d:{t:"p",d:{}}}))}og.prototype.wd=function(a){wg(this);this.te(a)};function wg(a){a.Bb||(a.xe--,0>=a.xe&&(a.f("Primary connection is healthy."),a.Bb=!0,a.I.sd()))}
function tg(a,b){a.D=new b("c:"+a.id+":"+a.Le++,a.L,a.qf);a.pf=b.responsesRequiredToBeHealthy||0;a.D.open(qg(a,a.D),rg(a,a.D));hc(function(){a.D&&(a.f("Timed out trying to upgrade."),a.D.close())},Math.floor(6E4))}function sg(a,b,c){a.f("Realtime connection established.");a.I=b;a.Ua=1;a.Lc&&(a.Lc(c,a.qf),a.Lc=null);0===a.xe?(a.f("Primary connection is healthy."),a.Bb=!0):hc(function(){xg(a)},Math.floor(5E3))}
function xg(a){a.Bb||1!==a.Ua||(a.f("sending ping on primary."),zg(a,{t:"c",d:{t:"p",d:{}}}))}function zg(a,b){if(1!==a.Ua)throw"Connection is not connected";a.Xc.send(b)}og.prototype.close=function(){2!==this.Ua&&(this.f("Closing realtime connection."),this.Ua=2,vg(this),this.ia&&(this.ia(),this.ia=null))};function vg(a){a.f("Shutting down all connections");a.I&&(a.I.close(),a.I=null);a.D&&(a.D.close(),a.D=null);a.md&&(clearTimeout(a.md),a.md=null)};function Ag(a,b,c,d,e,f){this.id=Bg++;this.f=Tb("p:"+this.id+":");this.qd={};this.$={};this.pa=[];this.Oc=0;this.Kc=[];this.ma=!1;this.Sa=1E3;this.td=3E5;this.Gb=b;this.Jc=c;this.ue=d;this.L=a;this.ob=this.Fa=this.Cb=this.ze=null;this.$c=e;this.de=!1;this.ke=0;if(f)throw Error("Auth override specified in options, but not supported on non Node.js platforms");this.Vd=f;this.ub=null;this.Mb=!1;this.Gd={};this.ig=0;this.Re=!0;this.Ac=this.me=null;Cg(this,0);Mc.Vb().gc("visible",this.Zf,this);-1===a.host.indexOf("fblocal")&&
Lc.Vb().gc("online",this.Yf,this)}var Bg=0,Dg=0;g=Ag.prototype;g.ua=function(a,b,c){var d=++this.ig;a={r:d,a:a,b:b};this.f(x(a));D(this.ma,"sendRequest call when we're not connected not allowed.");this.Fa.ua(a);c&&(this.Gd[d]=c)};
g.$e=function(a,b,c,d){var e=a.ja(),f=a.path.toString();this.f("Listen called for "+f+" "+e);this.$[f]=this.$[f]||{};D(qf(a.m)||!T(a.m),"listen() called for non-default but complete query");D(!this.$[f][e],"listen() called twice for same path/queryId.");a={G:d,ld:b,eg:a,tag:c};this.$[f][e]=a;this.ma&&Eg(this,a)};
function Eg(a,b){var c=b.eg,d=c.path.toString(),e=c.ja();a.f("Listen on "+d+" for "+e);var f={p:d};b.tag&&(f.q=pf(c.m),f.t=b.tag);f.h=b.ld();a.ua("q",f,function(f){var k=f.d,m=f.s;if(k&&"object"===typeof k&&eb(k,"w")){var l=w(k,"w");ea(l)&&0<=xa(l,"no_index")&&J("Using an unspecified index. Consider adding "+('".indexOn": "'+c.m.g.toString()+'"')+" at "+c.path.toString()+" to your security rules for better performance")}(a.$[d]&&a.$[d][e])===b&&(a.f("listen response",f),"ok"!==m&&Fg(a,d,e),b.G&&b.G(m,
k))})}g.kf=function(a){this.ob=a;this.f("Auth token refreshed");this.ob?Gg(this):this.ma&&this.ua("unauth",{},function(){});if(a&&40===a.length||kc(a))this.f("Admin auth credential detected.  Reducing max reconnect time."),this.td=3E4};function Gg(a){if(a.ma&&a.ob){var b=a.ob,c=jc(b)?"auth":"gauth",d={cred:b};null===a.Vd?d.noauth=!0:"object"===typeof a.Vd&&(d.authvar=a.Vd);a.ua(c,d,function(c){var d=c.s;c=c.d||"error";a.ob===b&&("ok"===d?a.ke=0:Hg(a,d,c))})}}
g.uf=function(a,b){var c=a.path.toString(),d=a.ja();this.f("Unlisten called for "+c+" "+d);D(qf(a.m)||!T(a.m),"unlisten() called for non-default but complete query");if(Fg(this,c,d)&&this.ma){var e=pf(a.m);this.f("Unlisten on "+c+" for "+d);c={p:c};b&&(c.q=e,c.t=b);this.ua("n",c)}};g.re=function(a,b,c){this.ma?Ig(this,"o",a,b,c):this.Kc.push({we:a,action:"o",data:b,G:c})};g.cf=function(a,b,c){this.ma?Ig(this,"om",a,b,c):this.Kc.push({we:a,action:"om",data:b,G:c})};
g.xd=function(a,b){this.ma?Ig(this,"oc",a,null,b):this.Kc.push({we:a,action:"oc",data:null,G:b})};function Ig(a,b,c,d,e){c={p:c,d:d};a.f("onDisconnect "+b,c);a.ua(b,c,function(a){e&&setTimeout(function(){e(a.s,a.d)},Math.floor(0))})}g.put=function(a,b,c,d){Jg(this,"p",a,b,c,d)};g.af=function(a,b,c,d){Jg(this,"m",a,b,c,d)};function Jg(a,b,c,d,e,f){d={p:c,d:d};n(f)&&(d.h=f);a.pa.push({action:b,mf:d,G:e});a.Oc++;b=a.pa.length-1;a.ma?Kg(a,b):a.f("Buffering put: "+c)}
function Kg(a,b){var c=a.pa[b].action,d=a.pa[b].mf,e=a.pa[b].G;a.pa[b].fg=a.ma;a.ua(c,d,function(d){a.f(c+" response",d);delete a.pa[b];a.Oc--;0===a.Oc&&(a.pa=[]);e&&e(d.s,d.d)})}g.ye=function(a){this.ma&&(a={c:a},this.f("reportStats",a),this.ua("s",a,function(a){"ok"!==a.s&&this.f("reportStats","Error sending stats: "+a.d)}))};
g.wd=function(a){if("r"in a){this.f("from server: "+x(a));var b=a.r,c=this.Gd[b];c&&(delete this.Gd[b],c(a.b))}else{if("error"in a)throw"A server-side error has occurred: "+a.error;"a"in a&&(b=a.a,a=a.b,this.f("handleServerMessage",b,a),"d"===b?this.Gb(a.p,a.d,!1,a.t):"m"===b?this.Gb(a.p,a.d,!0,a.t):"c"===b?Lg(this,a.p,a.q):"ac"===b?Hg(this,a.s,a.d):"sd"===b?this.ze?this.ze(a):"msg"in a&&"undefined"!==typeof console&&console.log("FIREBASE: "+a.msg.replace("\n","\nFIREBASE: ")):Ub("Unrecognized action received from server: "+
x(b)+"\nAre you using the latest client?"))}};g.Lc=function(a,b){this.f("connection ready");this.ma=!0;this.Ac=(new Date).getTime();this.ue({serverTimeOffset:a-(new Date).getTime()});this.Cb=b;if(this.Re){var c={};c["sdk.js."+firebase.SDK_VERSION.replace(/\./g,"-")]=1;pb()?c["framework.cordova"]=1:"object"===typeof navigator&&"ReactNative"===navigator.product&&(c["framework.reactnative"]=1);this.ye(c)}Mg(this);this.Re=!1;this.Jc(!0)};
function Cg(a,b){D(!a.Fa,"Scheduling a connect when we're already connected/ing?");a.ub&&clearTimeout(a.ub);a.ub=setTimeout(function(){a.ub=null;Ng(a)},Math.floor(b))}g.Zf=function(a){a&&!this.Mb&&this.Sa===this.td&&(this.f("Window became visible.  Reducing delay."),this.Sa=1E3,this.Fa||Cg(this,0));this.Mb=a};g.Yf=function(a){a?(this.f("Browser went online."),this.Sa=1E3,this.Fa||Cg(this,0)):(this.f("Browser went offline.  Killing connection."),this.Fa&&this.Fa.close())};
g.df=function(){this.f("data client disconnected");this.ma=!1;this.Fa=null;for(var a=0;a<this.pa.length;a++){var b=this.pa[a];b&&"h"in b.mf&&b.fg&&(b.G&&b.G("disconnect"),delete this.pa[a],this.Oc--)}0===this.Oc&&(this.pa=[]);this.Gd={};Og(this)&&(this.Mb?this.Ac&&(3E4<(new Date).getTime()-this.Ac&&(this.Sa=1E3),this.Ac=null):(this.f("Window isn't visible.  Delaying reconnect."),this.Sa=this.td,this.me=(new Date).getTime()),a=Math.max(0,this.Sa-((new Date).getTime()-this.me)),a*=Math.random(),this.f("Trying to reconnect in "+
a+"ms"),Cg(this,a),this.Sa=Math.min(this.td,1.3*this.Sa));this.Jc(!1)};
function Ng(a){if(Og(a)){a.f("Making a connection attempt");a.me=(new Date).getTime();a.Ac=null;var b=q(a.wd,a),c=q(a.Lc,a),d=q(a.df,a),e=a.id+":"+Dg++,f=a.Cb,h=!1,k=null,m=function(){k?k.close():(h=!0,d())};a.Fa={close:m,ua:function(a){D(k,"sendRequest call when we're not connected not allowed.");k.ua(a)}};var l=a.de;a.de=!1;a.$c.getToken(l).then(function(l){h?I("getToken() completed but was canceled"):(I("getToken() completed. Creating connection."),a.ob=l&&l.accessToken,k=new og(e,a.L,b,c,d,function(b){J(b+
" ("+a.L.toString()+")");a.ab("server_kill")},f))}).then(null,function(b){a.f("Failed to get token: "+b);h||m()})}}g.ab=function(a){I("Interrupting connection for reason: "+a);this.qd[a]=!0;this.Fa?this.Fa.close():(this.ub&&(clearTimeout(this.ub),this.ub=null),this.ma&&this.df())};g.kc=function(a){I("Resuming connection for reason: "+a);delete this.qd[a];Sa(this.qd)&&(this.Sa=1E3,this.Fa||Cg(this,0))};
function Lg(a,b,c){c=c?Aa(c,function(a){return ac(a)}).join("$"):"default";(a=Fg(a,b,c))&&a.G&&a.G("permission_denied")}function Fg(a,b,c){b=(new E(b)).toString();var d;n(a.$[b])?(d=a.$[b][c],delete a.$[b][c],0===La(a.$[b])&&delete a.$[b]):d=void 0;return d}
function Hg(a,b,c){I("Auth token revoked: "+b+"/"+c);a.ob=null;a.de=!0;a.Fa.close();if("invalid_token"===b||"permission_denied"===b)a.ke++,3<=a.ke&&(a.Sa=3E4,a=a.$c,b='Provided authentication credentials for the app named "'+a.oc.name+'" are invalid. This usually indicates your app was not initialized correctly. ',b="credential"in a.oc.options?b+'Make sure the "credential" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':"serviceAccount"in
a.oc.options?b+'Make sure the "serviceAccount" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':b+'Make sure the "apiKey" and "databaseURL" properties provided to initializeApp() match the values provided for your app at https://console.firebase.google.com/.',J(b))}
function Mg(a){Gg(a);v(a.$,function(b){v(b,function(b){Eg(a,b)})});for(var b=0;b<a.pa.length;b++)a.pa[b]&&Kg(a,b);for(;a.Kc.length;)b=a.Kc.shift(),Ig(a,b.action,b.we,b.data,b.G)}function Og(a){var b;b=Lc.Vb().hc;return Sa(a.qd)&&b};function Pg(a){a instanceof Qg||Vb("Don't call new Database() directly - please use firebase.database().");this.ta=a;this.ba=new U(a,Q);this.INTERNAL=new Rg(this)}var Sg={TIMESTAMP:{".sv":"timestamp"}};g=Pg.prototype;g.app=null;g.jf=function(a){Tg(this,"ref");y("database.ref",0,1,arguments.length);return n(a)?this.ba.n(a):this.ba};
g.gg=function(a){Tg(this,"database.refFromURL");y("database.refFromURL",1,1,arguments.length);var b=Wb(a);Xd("database.refFromURL",b);var c=b.jc;c.host!==this.ta.L.host&&Vb("database.refFromURL: Host name does not match the current database: (found "+c.host+" but expected "+this.ta.L.host+")");return this.jf(b.path.toString())};function Tg(a,b){null===a.ta&&Vb("Cannot call "+b+" on a deleted database.")}g.Pf=function(){y("database.goOffline",0,0,arguments.length);Tg(this,"goOffline");this.ta.ab()};
g.Qf=function(){y("database.goOnline",0,0,arguments.length);Tg(this,"goOnline");this.ta.kc()};Object.defineProperty(Pg.prototype,"app",{get:function(){return this.ta.app}});function Rg(a){this.Ya=a}Rg.prototype.delete=function(){Tg(this.Ya,"delete");var a=Ug.Vb(),b=this.Ya.ta;w(a.lb,b.app.name)!==b&&Vb("Database "+b.app.name+" has already been deleted.");b.ab();delete a.lb[b.app.name];this.Ya.ta=null;this.Ya.ba=null;this.Ya=this.Ya.INTERNAL=null;return firebase.Promise.resolve()};
Pg.prototype.ref=Pg.prototype.jf;Pg.prototype.refFromURL=Pg.prototype.gg;Pg.prototype.goOnline=Pg.prototype.Qf;Pg.prototype.goOffline=Pg.prototype.Pf;Rg.prototype["delete"]=Rg.prototype.delete;function V(a,b,c){this.A=a;this.V=b;this.g=c}V.prototype.H=function(){y("Firebase.DataSnapshot.val",0,0,arguments.length);return this.A.H()};V.prototype.val=V.prototype.H;V.prototype.be=function(){y("Firebase.DataSnapshot.exportVal",0,0,arguments.length);return this.A.H(!0)};V.prototype.exportVal=V.prototype.be;V.prototype.toJSON=function(){y("Firebase.DataSnapshot.toJSON",0,1,arguments.length);return this.be()};V.prototype.toJSON=V.prototype.toJSON;
V.prototype.Lf=function(){y("Firebase.DataSnapshot.exists",0,0,arguments.length);return!this.A.e()};V.prototype.exists=V.prototype.Lf;V.prototype.n=function(a){y("Firebase.DataSnapshot.child",0,1,arguments.length);ga(a)&&(a=String(a));Vd("Firebase.DataSnapshot.child",a);var b=new E(a),c=this.V.n(b);return new V(this.A.P(b),c,H)};V.prototype.child=V.prototype.n;
V.prototype.Da=function(a){y("Firebase.DataSnapshot.hasChild",1,1,arguments.length);Vd("Firebase.DataSnapshot.hasChild",a);var b=new E(a);return!this.A.P(b).e()};V.prototype.hasChild=V.prototype.Da;V.prototype.C=function(){y("Firebase.DataSnapshot.getPriority",0,0,arguments.length);return this.A.C().H()};V.prototype.getPriority=V.prototype.C;
V.prototype.forEach=function(a){y("Firebase.DataSnapshot.forEach",1,1,arguments.length);B("Firebase.DataSnapshot.forEach",1,a,!1);if(this.A.J())return!1;var b=this;return!!this.A.O(this.g,function(c,d){return a(new V(d,b.V.n(c),H))})};V.prototype.forEach=V.prototype.forEach;V.prototype.kd=function(){y("Firebase.DataSnapshot.hasChildren",0,0,arguments.length);return this.A.J()?!1:!this.A.e()};V.prototype.hasChildren=V.prototype.kd;
V.prototype.getKey=function(){y("Firebase.DataSnapshot.key",0,0,arguments.length);return this.V.getKey()};gc(V.prototype,"key",V.prototype.getKey);V.prototype.Eb=function(){y("Firebase.DataSnapshot.numChildren",0,0,arguments.length);return this.A.Eb()};V.prototype.numChildren=V.prototype.Eb;V.prototype.wb=function(){y("Firebase.DataSnapshot.ref",0,0,arguments.length);return this.V};gc(V.prototype,"ref",V.prototype.wb);function Vg(a,b,c){this.Pb=a;this.rb=b;this.tb=c||null}g=Vg.prototype;g.nf=function(a){return"value"===a};g.createEvent=function(a,b){var c=b.m.g;return new We("value",this,new V(a.Ja,b.wb(),c))};g.Tb=function(a){var b=this.tb;if("cancel"===a.ge()){D(this.rb,"Raising a cancel event on a listener with no cancel callback");var c=this.rb;return function(){c.call(b,a.error)}}var d=this.Pb;return function(){d.call(b,a.Md)}};g.Me=function(a,b){return this.rb?new Xe(this,a,b):null};
g.matches=function(a){return a instanceof Vg?a.Pb&&this.Pb?a.Pb===this.Pb&&a.tb===this.tb:!0:!1};g.Xe=function(){return null!==this.Pb};function Wg(a,b,c){this.ga=a;this.rb=b;this.tb=c}g=Wg.prototype;g.nf=function(a){a="children_added"===a?"child_added":a;return("children_removed"===a?"child_removed":a)in this.ga};g.Me=function(a,b){return this.rb?new Xe(this,a,b):null};
g.createEvent=function(a,b){D(null!=a.Xa,"Child events should have a childName.");var c=b.wb().n(a.Xa);return new We(a.type,this,new V(a.Ja,c,b.m.g),a.Dd)};g.Tb=function(a){var b=this.tb;if("cancel"===a.ge()){D(this.rb,"Raising a cancel event on a listener with no cancel callback");var c=this.rb;return function(){c.call(b,a.error)}}var d=this.ga[a.hd];return function(){d.call(b,a.Md,a.Dd)}};
g.matches=function(a){if(a instanceof Wg){if(!this.ga||!a.ga)return!0;if(this.tb===a.tb){var b=La(a.ga);if(b===La(this.ga)){if(1===b){var b=Ma(a.ga),c=Ma(this.ga);return c===b&&(!a.ga[b]||!this.ga[c]||a.ga[b]===this.ga[c])}return Ka(this.ga,function(b,c){return a.ga[c]===b})}}}return!1};g.Xe=function(){return null!==this.ga};function Xg(){this.za={}}g=Xg.prototype;g.e=function(){return Sa(this.za)};g.eb=function(a,b,c){var d=a.source.Hb;if(null!==d)return d=w(this.za,d),D(null!=d,"SyncTree gave us an op for an invalid query."),d.eb(a,b,c);var e=[];v(this.za,function(d){e=e.concat(d.eb(a,b,c))});return e};g.Nb=function(a,b,c,d,e){var f=a.ja(),h=w(this.za,f);if(!h){var h=c.Aa(e?d:null),k=!1;h?k=!0:(h=d instanceof O?c.rc(d):L,k=!1);h=new Pe(a,new oe(new je(h,k,!1),new je(d,e,!1)));this.za[f]=h}h.Nb(b);return Ve(h,b)};
g.kb=function(a,b,c){var d=a.ja(),e=[],f=[],h=null!=Yg(this);if("default"===d){var k=this;v(this.za,function(a,d){f=f.concat(a.kb(b,c));a.e()&&(delete k.za[d],T(a.V.m)||e.push(a.V))})}else{var m=w(this.za,d);m&&(f=f.concat(m.kb(b,c)),m.e()&&(delete this.za[d],T(m.V.m)||e.push(m.V)))}h&&null==Yg(this)&&e.push(new U(a.u,a.path));return{hg:e,Kf:f}};function Zg(a){return za(Na(a.za),function(a){return!T(a.V.m)})}g.hb=function(a){var b=null;v(this.za,function(c){b=b||c.hb(a)});return b};
function $g(a,b){if(T(b.m))return Yg(a);var c=b.ja();return w(a.za,c)}function Yg(a){return Ra(a.za,function(a){return T(a.V.m)})||null};function ah(a){this.wa=R;this.jb=new Df;this.De={};this.ic={};this.Cc=a}function bh(a,b,c,d,e){var f=a.jb,h=e;D(d>f.Bc,"Stacking an older write on top of newer ones");n(h)||(h=!0);f.la.push({path:b,Ga:c,Zc:d,visible:h});h&&(f.S=uf(f.S,b,c));f.Bc=d;return e?ch(a,new ce(fe,b,c)):[]}function dh(a,b,c,d){var e=a.jb;D(d>e.Bc,"Stacking an older merge on top of newer ones");e.la.push({path:b,children:c,Zc:d,visible:!0});e.S=vf(e.S,b,c);e.Bc=d;c=xd(c);return ch(a,new ae(fe,b,c))}
function eh(a,b,c){c=c||!1;var d=Ef(a.jb,b);if(a.jb.Ed(b)){var e=R;null!=d.Ga?e=e.set(Q,!0):fb(d.children,function(a,b){e=e.set(new E(a),b)});return ch(a,new de(d.path,e,c))}return[]}function fh(a,b,c){c=xd(c);return ch(a,new ae(ie,b,c))}function gh(a,b,c,d){d=hh(a,d);if(null!=d){var e=ih(d);d=e.path;e=e.Hb;b=P(d,b);c=new ce(new he(!1,!0,e,!0),b,c);return jh(a,d,c)}return[]}
function kh(a,b,c,d){if(d=hh(a,d)){var e=ih(d);d=e.path;e=e.Hb;b=P(d,b);c=xd(c);c=new ae(new he(!1,!0,e,!0),b,c);return jh(a,d,c)}return[]}
ah.prototype.Nb=function(a,b){var c=a.path,d=null,e=!1;Fd(this.wa,c,function(a,b){var f=P(a,c);d=d||b.hb(f);e=e||null!=Yg(b)});var f=this.wa.get(c);f?(e=e||null!=Yg(f),d=d||f.hb(Q)):(f=new Xg,this.wa=this.wa.set(c,f));var h;null!=d?h=!0:(h=!1,d=L,Jd(this.wa.subtree(c),function(a,b){var c=b.hb(Q);c&&(d=d.T(a,c))}));var k=null!=$g(f,a);if(!k&&!T(a.m)){var m=lh(a);D(!(m in this.ic),"View does not exist, but we have a tag");var l=mh++;this.ic[m]=l;this.De["_"+l]=m}h=f.Nb(a,b,new If(c,this.jb),d,h);k||
e||(f=$g(f,a),h=h.concat(nh(this,a,f)));return h};
ah.prototype.kb=function(a,b,c){var d=a.path,e=this.wa.get(d),f=[];if(e&&("default"===a.ja()||null!=$g(e,a))){f=e.kb(a,b,c);e.e()&&(this.wa=this.wa.remove(d));e=f.hg;f=f.Kf;b=-1!==Ea(e,function(a){return T(a.m)});var h=Dd(this.wa,d,function(a,b){return null!=Yg(b)});if(b&&!h&&(d=this.wa.subtree(d),!d.e()))for(var d=oh(d),k=0;k<d.length;++k){var m=d[k],l=m.V,m=ph(this,m);this.Cc.Ae(qh(l),rh(this,l),m.ld,m.G)}if(!h&&0<e.length&&!c)if(b)this.Cc.Od(qh(a),null);else{var u=this;ya(e,function(a){a.ja();
var b=u.ic[lh(a)];u.Cc.Od(qh(a),b)})}sh(this,e)}return f};ah.prototype.Aa=function(a,b){var c=this.jb,d=Dd(this.wa,a,function(b,c){var d=P(b,a);if(d=c.hb(d))return d});return c.Aa(a,d,b,!0)};function oh(a){return Bd(a,function(a,c,d){if(c&&null!=Yg(c))return[Yg(c)];var e=[];c&&(e=Zg(c));v(d,function(a){e=e.concat(a)});return e})}function sh(a,b){for(var c=0;c<b.length;++c){var d=b[c];if(!T(d.m)){var d=lh(d),e=a.ic[d];delete a.ic[d];delete a.De["_"+e]}}}
function qh(a){return T(a.m)&&!qf(a.m)?a.wb():a}function nh(a,b,c){var d=b.path,e=rh(a,b);c=ph(a,c);b=a.Cc.Ae(qh(b),e,c.ld,c.G);d=a.wa.subtree(d);if(e)D(null==Yg(d.value),"If we're adding a query, it shouldn't be shadowed");else for(e=Bd(d,function(a,b,c){if(!a.e()&&b&&null!=Yg(b))return[Te(Yg(b))];var d=[];b&&(d=d.concat(Aa(Zg(b),function(a){return a.V})));v(c,function(a){d=d.concat(a)});return d}),d=0;d<e.length;++d)c=e[d],a.Cc.Od(qh(c),rh(a,c));return b}
function ph(a,b){var c=b.V,d=rh(a,c);return{ld:function(){return(b.w()||L).hash()},G:function(b){if("ok"===b){if(d){var f=c.path;if(b=hh(a,d)){var h=ih(b);b=h.path;h=h.Hb;f=P(b,f);f=new Zd(new he(!1,!0,h,!0),f);b=jh(a,b,f)}else b=[]}else b=ch(a,new Zd(ie,c.path));return b}f="Unknown Error";"too_big"===b?f="The data requested exceeds the maximum size that can be accessed with a single request.":"permission_denied"==b?f="Client doesn't have permission to access the desired data.":"unavailable"==b&&
(f="The service is unavailable");f=Error(b+" at "+c.path.toString()+": "+f);f.code=b.toUpperCase();return a.kb(c,null,f)}}}function lh(a){return a.path.toString()+"$"+a.ja()}function ih(a){var b=a.indexOf("$");D(-1!==b&&b<a.length-1,"Bad queryKey.");return{Hb:a.substr(b+1),path:new E(a.substr(0,b))}}function hh(a,b){var c=a.De,d="_"+b;return d in c?c[d]:void 0}function rh(a,b){var c=lh(b);return w(a.ic,c)}var mh=1;
function jh(a,b,c){var d=a.wa.get(b);D(d,"Missing sync point for query tag that we're tracking");return d.eb(c,new If(b,a.jb),null)}function ch(a,b){return th(a,b,a.wa,null,new If(Q,a.jb))}function th(a,b,c,d,e){if(b.path.e())return uh(a,b,c,d,e);var f=c.get(Q);null==d&&null!=f&&(d=f.hb(Q));var h=[],k=K(b.path),m=b.Mc(k);if((c=c.children.get(k))&&m)var l=d?d.Q(k):null,k=e.n(k),h=h.concat(th(a,m,c,l,k));f&&(h=h.concat(f.eb(b,e,d)));return h}
function uh(a,b,c,d,e){var f=c.get(Q);null==d&&null!=f&&(d=f.hb(Q));var h=[];c.children.ha(function(c,f){var l=d?d.Q(c):null,u=e.n(c),z=b.Mc(c);z&&(h=h.concat(uh(a,z,f,l,u)))});f&&(h=h.concat(f.eb(b,e,d)));return h};function Qg(a,b,c){this.app=c;var d=new Bf(c);this.L=a;this.Va=Pf(a);this.Vc=null;this.ca=new Ye;this.vd=1;this.Ra=null;if(b||0<=("object"===typeof window&&window.navigator&&window.navigator.userAgent||"").search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i))this.va=new Rf(this.L,q(this.Gb,this),d),setTimeout(q(this.Jc,this,!0),0);else{b=c.options.databaseAuthVariableOverride;if("undefined"!==da(b)&&null!==b){if("object"!==da(b))throw Error("Only objects are supported for option databaseAuthVariableOverride");
try{x(b)}catch(e){throw Error("Invalid authOverride provided: "+e);}}this.va=this.Ra=new Ag(this.L,q(this.Gb,this),q(this.Jc,this),q(this.ue,this),d,b)}var f=this;Cf(d,function(a){f.va.kf(a)});this.og=Qf(a,q(function(){return new Jf(this.Va,this.va)},this));this.mc=new Tc;this.ie=new Af;this.pd=new ah({Ae:function(a,b,c,d){b=[];c=f.ie.j(a.path);c.e()||(b=ch(f.pd,new ce(ie,a.path,c)),setTimeout(function(){d("ok")},0));return b},Od:ba});vh(this,"connected",!1);this.ia=new Gb;this.Ya=new Pg(this);this.fd=
0;this.je=null;this.K=new ah({Ae:function(a,b,c,d){f.va.$e(a,c,b,function(b,c){var e=d(b,c);cf(f.ca,a.path,e)});return[]},Od:function(a,b){f.va.uf(a,b)}})}g=Qg.prototype;g.toString=function(){return(this.L.Sc?"https://":"http://")+this.L.host};g.name=function(){return this.L.pe};function wh(a){a=a.ie.j(new E(".info/serverTimeOffset")).H()||0;return(new Date).getTime()+a}function xh(a){a=a={timestamp:wh(a)};a.timestamp=a.timestamp||(new Date).getTime();return a}
g.Gb=function(a,b,c,d){this.fd++;var e=new E(a);b=this.je?this.je(a,b):b;a=[];d?c?(b=Ja(b,function(a){return G(a)}),a=kh(this.K,e,b,d)):(b=G(b),a=gh(this.K,e,b,d)):c?(d=Ja(b,function(a){return G(a)}),a=fh(this.K,e,d)):(d=G(b),a=ch(this.K,new ce(ie,e,d)));d=e;0<a.length&&(d=yh(this,e));cf(this.ca,d,a)};g.Jc=function(a){vh(this,"connected",a);!1===a&&zh(this)};g.ue=function(a){var b=this;cc(a,function(a,d){vh(b,d,a)})};
function vh(a,b,c){b=new E("/.info/"+b);c=G(c);var d=a.ie;d.Jd=d.Jd.F(b,c);c=ch(a.pd,new ce(ie,b,c));cf(a.ca,b,c)}g.Jb=function(a,b,c,d){this.f("set",{path:a.toString(),value:b,ug:c});var e=xh(this);b=G(b,c);var e=Jb(b,e),f=this.vd++,e=bh(this.K,a,e,f,!0);Ze(this.ca,e);var h=this;this.va.put(a.toString(),b.H(!0),function(b,c){var e="ok"===b;e||J("set at "+a+" failed: "+b);e=eh(h.K,f,!e);cf(h.ca,a,e);Ah(d,b,c)});e=Bh(this,a);yh(this,e);cf(this.ca,e,[])};
g.update=function(a,b,c){this.f("update",{path:a.toString(),value:b});var d=!0,e=xh(this),f={};v(b,function(a,b){d=!1;var c=G(a);f[b]=Jb(c,e)});if(d)I("update() called with empty data.  Don't do anything."),Ah(c,"ok");else{var h=this.vd++,k=dh(this.K,a,f,h);Ze(this.ca,k);var m=this;this.va.af(a.toString(),b,function(b,d){var e="ok"===b;e||J("update at "+a+" failed: "+b);var e=eh(m.K,h,!e),f=a;0<e.length&&(f=yh(m,a));cf(m.ca,f,e);Ah(c,b,d)});v(b,function(b,c){var d=Bh(m,a.n(c));yh(m,d)});cf(this.ca,
a,[])}};function zh(a){a.f("onDisconnectEvents");var b=xh(a),c=[];Hb(Fb(a.ia,b),Q,function(b,e){c=c.concat(ch(a.K,new ce(ie,b,e)));var f=Bh(a,b);yh(a,f)});a.ia=new Gb;cf(a.ca,Q,c)}g.xd=function(a,b){var c=this;this.va.xd(a.toString(),function(d,e){"ok"===d&&Yd(c.ia,a);Ah(b,d,e)})};function Ch(a,b,c,d){var e=G(c);a.va.re(b.toString(),e.H(!0),function(c,h){"ok"===c&&Ib(a.ia,b,e);Ah(d,c,h)})}
function Dh(a,b,c,d,e){var f=G(c,d);a.va.re(b.toString(),f.H(!0),function(c,d){"ok"===c&&Ib(a.ia,b,f);Ah(e,c,d)})}function Eh(a,b,c,d){var e=!0,f;for(f in c)e=!1;e?(I("onDisconnect().update() called with empty data.  Don't do anything."),Ah(d,"ok")):a.va.cf(b.toString(),c,function(e,f){if("ok"===e)for(var m in c){var l=G(c[m]);Ib(a.ia,b.n(m),l)}Ah(d,e,f)})}function Fh(a,b,c){c=".info"===K(b.path)?a.pd.Nb(b,c):a.K.Nb(b,c);af(a.ca,b.path,c)}g.ab=function(){this.Ra&&this.Ra.ab("repo_interrupt")};
g.kc=function(){this.Ra&&this.Ra.kc("repo_interrupt")};g.Be=function(a){if("undefined"!==typeof console){a?(this.Vc||(this.Vc=new Kf(this.Va)),a=this.Vc.get()):a=this.Va.get();var b=Ba(Oa(a),function(a,b){return Math.max(b.length,a)},0),c;for(c in a){for(var d=a[c],e=c.length;e<b+2;e++)c+=" ";console.log(c+d)}}};g.Ce=function(a){Mf(this.Va,a);this.og.rf[a]=!0};g.f=function(a){var b="";this.Ra&&(b=this.Ra.id+":");I(b,arguments)};
function Ah(a,b,c){a&&fc(function(){if("ok"==b)a(null);else{var d=(b||"error").toUpperCase(),e=d;c&&(e+=": "+c);e=Error(e);e.code=d;a(e)}})};function Gh(a,b,c,d,e){function f(){}a.f("transaction on "+b);var h=new U(a,b);h.gc("value",f);c={path:b,update:c,G:d,status:null,ef:Lb(),He:e,of:0,Rd:function(){h.Ic("value",f)},Td:null,Ba:null,cd:null,dd:null,ed:null};d=a.K.Aa(b,void 0)||L;c.cd=d;d=c.update(d.H());if(n(d)){Pd("transaction failed: Data returned ",d,c.path);c.status=1;e=Uc(a.mc,b);var k=e.Ca()||[];k.push(c);Vc(e,k);"object"===typeof d&&null!==d&&eb(d,".priority")?(k=w(d,".priority"),D(Nd(k),"Invalid priority returned by transaction. Priority must be a valid string, finite number, server value, or null.")):
k=(a.K.Aa(b)||L).C().H();e=xh(a);d=G(d,k);e=Jb(d,e);c.dd=d;c.ed=e;c.Ba=a.vd++;c=bh(a.K,b,e,c.Ba,c.He);cf(a.ca,b,c);Hh(a)}else c.Rd(),c.dd=null,c.ed=null,c.G&&(a=new V(c.cd,new U(a,c.path),H),c.G(null,!1,a))}function Hh(a,b){var c=b||a.mc;b||Ih(a,c);if(null!==c.Ca()){var d=Jh(a,c);D(0<d.length,"Sending zero length transaction queue");Ca(d,function(a){return 1===a.status})&&Kh(a,c.path(),d)}else c.kd()&&c.O(function(b){Hh(a,b)})}
function Kh(a,b,c){for(var d=Aa(c,function(a){return a.Ba}),e=a.K.Aa(b,d)||L,d=e,e=e.hash(),f=0;f<c.length;f++){var h=c[f];D(1===h.status,"tryToSendTransactionQueue_: items in queue should all be run.");h.status=2;h.of++;var k=P(b,h.path),d=d.F(k,h.dd)}d=d.H(!0);a.va.put(b.toString(),d,function(d){a.f("transaction put response",{path:b.toString(),status:d});var e=[];if("ok"===d){d=[];for(f=0;f<c.length;f++){c[f].status=3;e=e.concat(eh(a.K,c[f].Ba));if(c[f].G){var h=c[f].ed,k=new U(a,c[f].path);d.push(q(c[f].G,
null,null,!0,new V(h,k,H)))}c[f].Rd()}Ih(a,Uc(a.mc,b));Hh(a);cf(a.ca,b,e);for(f=0;f<d.length;f++)fc(d[f])}else{if("datastale"===d)for(f=0;f<c.length;f++)c[f].status=4===c[f].status?5:1;else for(J("transaction at "+b.toString()+" failed: "+d),f=0;f<c.length;f++)c[f].status=5,c[f].Td=d;yh(a,b)}},e)}function yh(a,b){var c=Lh(a,b),d=c.path(),c=Jh(a,c);Mh(a,c,d);return d}
function Mh(a,b,c){if(0!==b.length){for(var d=[],e=[],f=za(b,function(a){return 1===a.status}),f=Aa(f,function(a){return a.Ba}),h=0;h<b.length;h++){var k=b[h],m=P(c,k.path),l=!1,u;D(null!==m,"rerunTransactionsUnderNode_: relativePath should not be null.");if(5===k.status)l=!0,u=k.Td,e=e.concat(eh(a.K,k.Ba,!0));else if(1===k.status)if(25<=k.of)l=!0,u="maxretry",e=e.concat(eh(a.K,k.Ba,!0));else{var z=a.K.Aa(k.path,f)||L;k.cd=z;var F=b[h].update(z.H());n(F)?(Pd("transaction failed: Data returned ",F,
k.path),m=G(F),"object"===typeof F&&null!=F&&eb(F,".priority")||(m=m.fa(z.C())),z=k.Ba,F=xh(a),F=Jb(m,F),k.dd=m,k.ed=F,k.Ba=a.vd++,Fa(f,z),e=e.concat(bh(a.K,k.path,F,k.Ba,k.He)),e=e.concat(eh(a.K,z,!0))):(l=!0,u="nodata",e=e.concat(eh(a.K,k.Ba,!0)))}cf(a.ca,c,e);e=[];l&&(b[h].status=3,setTimeout(b[h].Rd,Math.floor(0)),b[h].G&&("nodata"===u?(k=new U(a,b[h].path),d.push(q(b[h].G,null,null,!1,new V(b[h].cd,k,H)))):d.push(q(b[h].G,null,Error(u),!1,null))))}Ih(a,a.mc);for(h=0;h<d.length;h++)fc(d[h]);Hh(a)}}
function Lh(a,b){for(var c,d=a.mc;null!==(c=K(b))&&null===d.Ca();)d=Uc(d,c),b=N(b);return d}function Jh(a,b){var c=[];Nh(a,b,c);c.sort(function(a,b){return a.ef-b.ef});return c}function Nh(a,b,c){var d=b.Ca();if(null!==d)for(var e=0;e<d.length;e++)c.push(d[e]);b.O(function(b){Nh(a,b,c)})}function Ih(a,b){var c=b.Ca();if(c){for(var d=0,e=0;e<c.length;e++)3!==c[e].status&&(c[d]=c[e],d++);c.length=d;Vc(b,0<c.length?c:null)}b.O(function(b){Ih(a,b)})}
function Bh(a,b){var c=Lh(a,b).path(),d=Uc(a.mc,b);Yc(d,function(b){Oh(a,b)});Oh(a,d);Xc(d,function(b){Oh(a,b)});return c}
function Oh(a,b){var c=b.Ca();if(null!==c){for(var d=[],e=[],f=-1,h=0;h<c.length;h++)4!==c[h].status&&(2===c[h].status?(D(f===h-1,"All SENT items should be at beginning of queue."),f=h,c[h].status=4,c[h].Td="set"):(D(1===c[h].status,"Unexpected transaction status in abort"),c[h].Rd(),e=e.concat(eh(a.K,c[h].Ba,!0)),c[h].G&&d.push(q(c[h].G,null,Error("set"),!1,null))));-1===f?Vc(b,null):c.length=f+1;cf(a.ca,b.path(),e);for(h=0;h<d.length;h++)fc(d[h])}};function Ug(){this.lb={};this.wf=!1}Ug.prototype.ab=function(){for(var a in this.lb)this.lb[a].ab()};Ug.prototype.kc=function(){for(var a in this.lb)this.lb[a].kc()};Ug.prototype.ce=function(a){this.wf=a};ca(Ug);Ug.prototype.interrupt=Ug.prototype.ab;Ug.prototype.resume=Ug.prototype.kc;var W={};W.nc=Ag;W.DataConnection=W.nc;Ag.prototype.ng=function(a,b){this.ua("q",{p:a},b)};W.nc.prototype.simpleListen=W.nc.prototype.ng;Ag.prototype.Hf=function(a,b){this.ua("echo",{d:a},b)};W.nc.prototype.echo=W.nc.prototype.Hf;Ag.prototype.interrupt=Ag.prototype.ab;W.zf=og;W.RealTimeConnection=W.zf;og.prototype.sendRequest=og.prototype.ua;og.prototype.close=og.prototype.close;
W.Rf=function(a){var b=Ag.prototype.put;Ag.prototype.put=function(c,d,e,f){n(f)&&(f=a());b.call(this,c,d,e,f)};return function(){Ag.prototype.put=b}};W.hijackHash=W.Rf;W.yf=zb;W.ConnectionTarget=W.yf;W.ja=function(a){return a.ja()};W.queryIdentifier=W.ja;W.Uf=function(a){return a.u.Ra.$};W.listens=W.Uf;W.ce=function(a){Ug.Vb().ce(a)};W.forceRestClient=W.ce;W.Context=Ug;function Ph(a,b){this.committed=a;this.snapshot=b};function X(a,b,c,d){this.u=a;this.path=b;this.m=c;this.Nc=d}
function Qh(a){var b=null,c=null;a.ka&&(b=ff(a));a.na&&(c=hf(a));if(a.g===tc){if(a.ka){if("[MIN_NAME]"!=ef(a))throw Error("Query: When ordering by key, you may only pass one argument to startAt(), endAt(), or equalTo().");if("string"!==typeof b)throw Error("Query: When ordering by key, the argument passed to startAt(), endAt(),or equalTo() must be a string.");}if(a.na){if("[MAX_NAME]"!=gf(a))throw Error("Query: When ordering by key, you may only pass one argument to startAt(), endAt(), or equalTo().");if("string"!==
typeof c)throw Error("Query: When ordering by key, the argument passed to startAt(), endAt(),or equalTo() must be a string.");}}else if(a.g===H){if(null!=b&&!Nd(b)||null!=c&&!Nd(c))throw Error("Query: When ordering by priority, the first argument passed to startAt(), endAt(), or equalTo() must be a valid priority value (null, a number, or a string).");}else if(D(a.g instanceof pc||a.g===wc,"unknown index type."),null!=b&&"object"===typeof b||null!=c&&"object"===typeof c)throw Error("Query: First argument passed to startAt(), endAt(), or equalTo() cannot be an object.");
}function Rh(a){if(a.ka&&a.na&&a.xa&&(!a.xa||""===a.mb))throw Error("Query: Can't combine startAt(), endAt(), and limit(). Use limitToFirst() or limitToLast() instead.");}function Sh(a,b){if(!0===a.Nc)throw Error(b+": You can't combine multiple orderBy calls.");}g=X.prototype;g.wb=function(){y("Query.ref",0,0,arguments.length);return new U(this.u,this.path)};
g.gc=function(a,b,c,d){y("Query.on",2,4,arguments.length);Td("Query.on",a,!1);B("Query.on",2,b,!1);var e=Th("Query.on",c,d);if("value"===a)Fh(this.u,this,new Vg(b,e.cancel||null,e.Ma||null));else{var f={};f[a]=b;Fh(this.u,this,new Wg(f,e.cancel,e.Ma))}return b};
g.Ic=function(a,b,c){y("Query.off",0,3,arguments.length);Td("Query.off",a,!0);B("Query.off",2,b,!0);ob("Query.off",3,c);var d=null,e=null;"value"===a?d=new Vg(b||null,null,c||null):a&&(b&&(e={},e[a]=b),d=new Wg(e,null,c||null));e=this.u;d=".info"===K(this.path)?e.pd.kb(this,d):e.K.kb(this,d);af(e.ca,this.path,d)};
g.$f=function(a,b){function c(k){f&&(f=!1,e.Ic(a,c),b&&b.call(d.Ma,k),h.resolve(k))}y("Query.once",1,4,arguments.length);Td("Query.once",a,!1);B("Query.once",2,b,!0);var d=Th("Query.once",arguments[2],arguments[3]),e=this,f=!0,h=new ib;kb(h.ra);this.gc(a,c,function(b){e.Ic(a,c);d.cancel&&d.cancel.call(d.Ma,b);h.reject(b)});return h.ra};
g.ne=function(a){y("Query.limitToFirst",1,1,arguments.length);if(!ga(a)||Math.floor(a)!==a||0>=a)throw Error("Query.limitToFirst: First argument must be a positive integer.");if(this.m.xa)throw Error("Query.limitToFirst: Limit was already set (by another call to limit, limitToFirst, or limitToLast).");return new X(this.u,this.path,this.m.ne(a),this.Nc)};
g.oe=function(a){y("Query.limitToLast",1,1,arguments.length);if(!ga(a)||Math.floor(a)!==a||0>=a)throw Error("Query.limitToLast: First argument must be a positive integer.");if(this.m.xa)throw Error("Query.limitToLast: Limit was already set (by another call to limit, limitToFirst, or limitToLast).");return new X(this.u,this.path,this.m.oe(a),this.Nc)};
g.ag=function(a){y("Query.orderByChild",1,1,arguments.length);if("$key"===a)throw Error('Query.orderByChild: "$key" is invalid.  Use Query.orderByKey() instead.');if("$priority"===a)throw Error('Query.orderByChild: "$priority" is invalid.  Use Query.orderByPriority() instead.');if("$value"===a)throw Error('Query.orderByChild: "$value" is invalid.  Use Query.orderByValue() instead.');Vd("Query.orderByChild",a);Sh(this,"Query.orderByChild");var b=new E(a);if(b.e())throw Error("Query.orderByChild: cannot pass in empty path.  Use Query.orderByValue() instead.");
b=new pc(b);b=of(this.m,b);Qh(b);return new X(this.u,this.path,b,!0)};g.bg=function(){y("Query.orderByKey",0,0,arguments.length);Sh(this,"Query.orderByKey");var a=of(this.m,tc);Qh(a);return new X(this.u,this.path,a,!0)};g.cg=function(){y("Query.orderByPriority",0,0,arguments.length);Sh(this,"Query.orderByPriority");var a=of(this.m,H);Qh(a);return new X(this.u,this.path,a,!0)};
g.dg=function(){y("Query.orderByValue",0,0,arguments.length);Sh(this,"Query.orderByValue");var a=of(this.m,wc);Qh(a);return new X(this.u,this.path,a,!0)};g.Nd=function(a,b){y("Query.startAt",0,2,arguments.length);Od("Query.startAt",a,this.path,!0);Ud("Query.startAt",b);var c=this.m.Nd(a,b);Rh(c);Qh(c);if(this.m.ka)throw Error("Query.startAt: Starting point was already set (by another call to startAt or equalTo).");n(a)||(b=a=null);return new X(this.u,this.path,c,this.Nc)};
g.gd=function(a,b){y("Query.endAt",0,2,arguments.length);Od("Query.endAt",a,this.path,!0);Ud("Query.endAt",b);var c=this.m.gd(a,b);Rh(c);Qh(c);if(this.m.na)throw Error("Query.endAt: Ending point was already set (by another call to endAt or equalTo).");return new X(this.u,this.path,c,this.Nc)};
g.If=function(a,b){y("Query.equalTo",1,2,arguments.length);Od("Query.equalTo",a,this.path,!1);Ud("Query.equalTo",b);if(this.m.ka)throw Error("Query.equalTo: Starting point was already set (by another call to startAt or equalTo).");if(this.m.na)throw Error("Query.equalTo: Ending point was already set (by another call to endAt or equalTo).");return this.Nd(a,b).gd(a,b)};
g.toString=function(){y("Query.toString",0,0,arguments.length);for(var a=this.path,b="",c=a.Y;c<a.o.length;c++)""!==a.o[c]&&(b+="/"+encodeURIComponent(String(a.o[c])));return this.u.toString()+(b||"/")};g.toJSON=function(){y("Query.toJSON",0,1,arguments.length);return this.toString()};g.ja=function(){var a=ac(pf(this.m));return"{}"===a?"default":a};
g.isEqual=function(a){y("Query.isEqual",1,1,arguments.length);if(!(a instanceof X))throw Error("Query.isEqual failed: First argument must be an instance of firebase.database.Query.");var b=this.u===a.u,c=this.path.Z(a.path),d=this.ja()===a.ja();return b&&c&&d};
function Th(a,b,c){var d={cancel:null,Ma:null};if(b&&c)d.cancel=b,B(a,3,d.cancel,!0),d.Ma=c,ob(a,4,d.Ma);else if(b)if("object"===typeof b&&null!==b)d.Ma=b;else if("function"===typeof b)d.cancel=b;else throw Error(A(a,3,!0)+" must either be a cancel callback or a context object.");return d}X.prototype.on=X.prototype.gc;X.prototype.off=X.prototype.Ic;X.prototype.once=X.prototype.$f;X.prototype.limitToFirst=X.prototype.ne;X.prototype.limitToLast=X.prototype.oe;X.prototype.orderByChild=X.prototype.ag;
X.prototype.orderByKey=X.prototype.bg;X.prototype.orderByPriority=X.prototype.cg;X.prototype.orderByValue=X.prototype.dg;X.prototype.startAt=X.prototype.Nd;X.prototype.endAt=X.prototype.gd;X.prototype.equalTo=X.prototype.If;X.prototype.toString=X.prototype.toString;X.prototype.isEqual=X.prototype.isEqual;gc(X.prototype,"ref",X.prototype.wb);function Y(a,b){this.ta=a;this.qa=b}Y.prototype.cancel=function(a){y("Firebase.onDisconnect().cancel",0,1,arguments.length);B("Firebase.onDisconnect().cancel",1,a,!0);var b=new ib;this.ta.xd(this.qa,jb(b,a));return b.ra};Y.prototype.cancel=Y.prototype.cancel;Y.prototype.remove=function(a){y("Firebase.onDisconnect().remove",0,1,arguments.length);Wd("Firebase.onDisconnect().remove",this.qa);B("Firebase.onDisconnect().remove",1,a,!0);var b=new ib;Ch(this.ta,this.qa,null,jb(b,a));return b.ra};
Y.prototype.remove=Y.prototype.remove;Y.prototype.set=function(a,b){y("Firebase.onDisconnect().set",1,2,arguments.length);Wd("Firebase.onDisconnect().set",this.qa);Od("Firebase.onDisconnect().set",a,this.qa,!1);B("Firebase.onDisconnect().set",2,b,!0);var c=new ib;Ch(this.ta,this.qa,a,jb(c,b));return c.ra};Y.prototype.set=Y.prototype.set;
Y.prototype.Jb=function(a,b,c){y("Firebase.onDisconnect().setWithPriority",2,3,arguments.length);Wd("Firebase.onDisconnect().setWithPriority",this.qa);Od("Firebase.onDisconnect().setWithPriority",a,this.qa,!1);Sd("Firebase.onDisconnect().setWithPriority",2,b);B("Firebase.onDisconnect().setWithPriority",3,c,!0);var d=new ib;Dh(this.ta,this.qa,a,b,jb(d,c));return d.ra};Y.prototype.setWithPriority=Y.prototype.Jb;
Y.prototype.update=function(a,b){y("Firebase.onDisconnect().update",1,2,arguments.length);Wd("Firebase.onDisconnect().update",this.qa);if(ea(a)){for(var c={},d=0;d<a.length;++d)c[""+d]=a[d];a=c;J("Passing an Array to Firebase.onDisconnect().update() is deprecated. Use set() if you want to overwrite the existing data, or an Object with integer keys if you really do want to only update some of the children.")}Rd("Firebase.onDisconnect().update",a,this.qa);B("Firebase.onDisconnect().update",2,b,!0);
c=new ib;Eh(this.ta,this.qa,a,jb(c,b));return c.ra};Y.prototype.update=Y.prototype.update;var Z={Mf:function(){dg=Zf=!0}};Z.forceLongPolling=Z.Mf;Z.Nf=function(){eg=!0};Z.forceWebSockets=Z.Nf;Z.Tf=function(){return Yf.isAvailable()};Z.isWebSocketsAvailable=Z.Tf;Z.lg=function(a,b){a.u.Ra.ze=b};Z.setSecurityDebugCallback=Z.lg;Z.Be=function(a,b){a.u.Be(b)};Z.stats=Z.Be;Z.Ce=function(a,b){a.u.Ce(b)};Z.statsIncrementCounter=Z.Ce;Z.fd=function(a){return a.u.fd};Z.dataUpdateCount=Z.fd;Z.Sf=function(a,b){a.u.je=b};Z.interceptServerData=Z.Sf;function U(a,b){if(!(a instanceof Qg))throw Error("new Firebase() no longer supported - use app.database().");X.call(this,a,b,mf,!1);this.then=void 0;this["catch"]=void 0}la(U,X);g=U.prototype;g.getKey=function(){y("Firebase.key",0,0,arguments.length);return this.path.e()?null:Oc(this.path)};
g.n=function(a){y("Firebase.child",1,1,arguments.length);if(ga(a))a=String(a);else if(!(a instanceof E))if(null===K(this.path)){var b=a;b&&(b=b.replace(/^\/*\.info(\/|$)/,"/"));Vd("Firebase.child",b)}else Vd("Firebase.child",a);return new U(this.u,this.path.n(a))};g.getParent=function(){y("Firebase.parent",0,0,arguments.length);var a=this.path.parent();return null===a?null:new U(this.u,a)};
g.Of=function(){y("Firebase.ref",0,0,arguments.length);for(var a=this;null!==a.getParent();)a=a.getParent();return a};g.Gf=function(){return this.u.Ya};g.set=function(a,b){y("Firebase.set",1,2,arguments.length);Wd("Firebase.set",this.path);Od("Firebase.set",a,this.path,!1);B("Firebase.set",2,b,!0);var c=new ib;this.u.Jb(this.path,a,null,jb(c,b));return c.ra};
g.update=function(a,b){y("Firebase.update",1,2,arguments.length);Wd("Firebase.update",this.path);if(ea(a)){for(var c={},d=0;d<a.length;++d)c[""+d]=a[d];a=c;J("Passing an Array to Firebase.update() is deprecated. Use set() if you want to overwrite the existing data, or an Object with integer keys if you really do want to only update some of the children.")}Rd("Firebase.update",a,this.path);B("Firebase.update",2,b,!0);c=new ib;this.u.update(this.path,a,jb(c,b));return c.ra};
g.Jb=function(a,b,c){y("Firebase.setWithPriority",2,3,arguments.length);Wd("Firebase.setWithPriority",this.path);Od("Firebase.setWithPriority",a,this.path,!1);Sd("Firebase.setWithPriority",2,b);B("Firebase.setWithPriority",3,c,!0);if(".length"===this.getKey()||".keys"===this.getKey())throw"Firebase.setWithPriority failed: "+this.getKey()+" is a read-only object.";var d=new ib;this.u.Jb(this.path,a,b,jb(d,c));return d.ra};
g.remove=function(a){y("Firebase.remove",0,1,arguments.length);Wd("Firebase.remove",this.path);B("Firebase.remove",1,a,!0);return this.set(null,a)};
g.transaction=function(a,b,c){y("Firebase.transaction",1,3,arguments.length);Wd("Firebase.transaction",this.path);B("Firebase.transaction",1,a,!1);B("Firebase.transaction",2,b,!0);if(n(c)&&"boolean"!=typeof c)throw Error(A("Firebase.transaction",3,!0)+"must be a boolean.");if(".length"===this.getKey()||".keys"===this.getKey())throw"Firebase.transaction failed: "+this.getKey()+" is a read-only object.";"undefined"===typeof c&&(c=!0);var d=new ib;ha(b)&&kb(d.ra);Gh(this.u,this.path,a,function(a,c,h){a?
d.reject(a):d.resolve(new Ph(c,h));ha(b)&&b(a,c,h)},c);return d.ra};g.kg=function(a,b){y("Firebase.setPriority",1,2,arguments.length);Wd("Firebase.setPriority",this.path);Sd("Firebase.setPriority",1,a);B("Firebase.setPriority",2,b,!0);var c=new ib;this.u.Jb(this.path.n(".priority"),a,null,jb(c,b));return c.ra};
g.push=function(a,b){y("Firebase.push",0,2,arguments.length);Wd("Firebase.push",this.path);Od("Firebase.push",a,this.path,!0);B("Firebase.push",2,b,!0);var c=wh(this.u),d=Kc(c),c=this.n(d),e=this.n(d),d=null!=a?c.set(a,b).then(function(){return e}):hb.resolve(e);c.then=q(d.then,d);c["catch"]=q(d.then,d,void 0);ha(b)&&kb(d);return c};g.ib=function(){Wd("Firebase.onDisconnect",this.path);return new Y(this.u,this.path)};U.prototype.child=U.prototype.n;U.prototype.set=U.prototype.set;
U.prototype.update=U.prototype.update;U.prototype.setWithPriority=U.prototype.Jb;U.prototype.remove=U.prototype.remove;U.prototype.transaction=U.prototype.transaction;U.prototype.setPriority=U.prototype.kg;U.prototype.push=U.prototype.push;U.prototype.onDisconnect=U.prototype.ib;gc(U.prototype,"database",U.prototype.Gf);gc(U.prototype,"key",U.prototype.getKey);gc(U.prototype,"parent",U.prototype.getParent);gc(U.prototype,"root",U.prototype.Of);if("undefined"===typeof firebase)throw Error("Cannot install Firebase Database - be sure to load firebase-app.js first.");
try{firebase.INTERNAL.registerService("database",function(a){var b=Ug.Vb(),c=a.options.databaseURL;n(c)||Vb("Can't determine Firebase Database URL.  Be sure to include databaseURL option when calling firebase.intializeApp().");var d=Wb(c),c=d.jc;Xd("Invalid Firebase Database URL",d);d.path.e()||Vb("Database URL must point to the root of a Firebase Database (not including a child path).");(d=w(b.lb,a.name))&&Vb("FIREBASE INTERNAL ERROR: Database initialized multiple times.");d=new Qg(c,b.wf,a);b.lb[a.name]=
d;return d.Ya},{Reference:U,Query:X,Database:Pg,enableLogging:Sb,INTERNAL:Z,TEST_ACCESS:W,ServerValue:Sg})}catch(Uh){Vb("Failed to register the Firebase Database Service ("+Uh+")")};
            module.exports = firebase.database;
          })();
          //# sourceMappingURL=database.js.map
          


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */

/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.registerMessaging = registerMessaging;

var _windowController = __webpack_require__(55);

var _windowController2 = _interopRequireDefault(_windowController);

var _swController = __webpack_require__(54);

var _swController2 = _interopRequireDefault(_swController);

var _app = __webpack_require__(9);

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function registerMessaging(instance) {
    instance.INTERNAL.registerService('messaging', function factoryMethod(app) {
        if (self && 'ServiceWorkerGlobalScope' in self) {
            return new _swController2.default(app);
        }
        // Assume we are in the window context.
        return new _windowController2.default(app);
    }, {
        // no-inline
        'Messaging': _windowController2.default
    });
}
registerMessaging(_app2.default);
//# sourceMappingURL=messaging.js.map


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */

/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _controllerInterface = __webpack_require__(29);

var _controllerInterface2 = _interopRequireDefault(_controllerInterface);

var _errors = __webpack_require__(11);

var _errors2 = _interopRequireDefault(_errors);

var _workerPageMessage = __webpack_require__(32);

var _workerPageMessage2 = _interopRequireDefault(_workerPageMessage);

var _fcmDetails = __webpack_require__(30);

var _fcmDetails2 = _interopRequireDefault(_fcmDetails);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FCM_MSG = 'FCM_MSG';

var SWController = function (_ControllerInterface) {
    _inherits(SWController, _ControllerInterface);

    function SWController(app) {
        _classCallCheck(this, SWController);

        var _this = _possibleConstructorReturn(this, (SWController.__proto__ || Object.getPrototypeOf(SWController)).call(this, app));

        self.addEventListener('push', function (e) {
            return _this.onPush_(e);
        }, false);
        self.addEventListener('pushsubscriptionchange', function (e) {
            return _this.onSubChange_(e);
        }, false);
        self.addEventListener('notificationclick', function (e) {
            return _this.onNotificationClick_(e);
        }, false);
        /**
         * @private
         * @type {function(Object)|null}
         */
        _this.bgMessageHandler_ = null;
        return _this;
    }
    /**
    * A handler for push events that shows notifications based on the content of
    * the payload.
    *
    * The payload must be a JSON-encoded Object with a `notification` key. The
    * value of the `notification` property will be used as the NotificationOptions
    * object passed to showNotification. Additionally, the `title` property of the
    * notification object will be used as the title.
    *
    * If there is no notification data in the payload then no notification will be
    * shown.
    * @private
    */


    _createClass(SWController, [{
        key: 'onPush_',
        value: function onPush_(event) {
            var _this2 = this;

            var msgPayload = void 0;
            try {
                msgPayload = event.data.json();
            } catch (err) {
                // Not JSON so not an FCM message
                return;
            }
            var handleMsgPromise = this.hasVisibleClients_().then(function (hasVisibleClients) {
                if (hasVisibleClients) {
                    // Do not need to show a notification.
                    if (msgPayload.notification || _this2.bgMessageHandler_) {
                        // Send to page
                        return _this2.sendMessageToWindowClients_(msgPayload);
                    }
                    return;
                }
                var notificationDetails = _this2.getNotificationData_(msgPayload);
                if (notificationDetails) {
                    var notificationTitle = notificationDetails.title || '';
                    return self.registration.showNotification(notificationTitle, notificationDetails);
                } else if (_this2.bgMessageHandler_) {
                    return _this2.bgMessageHandler_(msgPayload);
                }
            });
            event.waitUntil(handleMsgPromise);
        }
        /**
        * @private
        */

    }, {
        key: 'onSubChange_',
        value: function onSubChange_(event) {
            var _this3 = this;

            var promiseChain = this.getToken().then(function (token) {
                if (!token) {
                    // We can't resubscribe if we don't have an FCM token for this scope.
                    throw _this3.errorFactory_.create(_errors2.default.codes.NO_FCM_TOKEN_FOR_RESUBSCRIBE);
                }
                var tokenDetails = null;
                var tokenManager = _this3.getTokenManager();
                return tokenManager.getTokenDetailsFromToken(token).then(function (details) {
                    tokenDetails = details;
                    if (!tokenDetails) {
                        throw _this3.errorFactory_.create(_errors2.default.codes.INVALID_SAVED_TOKEN);
                    }
                    // Attempt to get a new subscription
                    return self.registration.pushManager.subscribe(_fcmDetails2.default.SUBSCRIPTION_OPTIONS);
                }).then(function (newSubscription) {
                    // Send new subscription to FCM.
                    return tokenManager.subscribeToFCM(tokenDetails.fcmSenderId, newSubscription, tokenDetails.fcmPushSet);
                }).catch(function (err) {
                    // The best thing we can do is log this to the terminal so
                    // developers might notice the error.
                    return tokenManager.deleteToken(tokenDetails.fcmToken).then(function () {
                        throw _this3.errorFactory_.create(_errors2.default.codes.UNABLE_TO_RESUBSCRIBE, {
                            'message': err
                        });
                    });
                });
            });
            event.waitUntil(promiseChain);
        }
        /**
        * @private
        */

    }, {
        key: 'onNotificationClick_',
        value: function onNotificationClick_(event) {
            var _this4 = this;

            if (!(event.notification && event.notification.data && event.notification.data[FCM_MSG])) {
                // Not an FCM notification, do nothing.
                return;
            }
            // Prevent other listeners from receiving the event
            event.stopImmediatePropagation();
            event.notification.close();
            var msgPayload = event.notification.data[FCM_MSG];
            var clickAction = msgPayload['notification']['click_action'];
            if (!clickAction) {
                // Nothing to do.
                return;
            }
            var promiseChain = this.getWindowClient_(clickAction).then(function (windowClient) {
                if (!windowClient) {
                    // Unable to find window client so need to open one.
                    return self.clients.openWindow(clickAction);
                }
                return windowClient;
            }).then(function (windowClient) {
                if (!windowClient) {
                    // Window Client will not be returned if it's for a third party origin.
                    return;
                }
                // Delete notification data from payload before sending to the page.
                msgPayload['notification'];

                delete msgPayload['notification'];
                var internalMsg = _workerPageMessage2.default.createNewMsg(_workerPageMessage2.default.TYPES_OF_MSG.NOTIFICATION_CLICKED, msgPayload);
                // Attempt to send a message to the client to handle the data
                // Is affected by: https://github.com/slightlyoff/ServiceWorker/issues/728
                return _this4.attemptToMessageClient_(windowClient, internalMsg);
            });
            event.waitUntil(promiseChain);
        }
        /**
         * @private
         * @param {Object} msgPayload
         * @return {NotificationOptions|undefined}
         */

    }, {
        key: 'getNotificationData_',
        value: function getNotificationData_(msgPayload) {
            if (!msgPayload) {
                return;
            }
            if (_typeof(msgPayload.notification) !== 'object') {
                return;
            }
            var notificationInformation = Object.assign({}, msgPayload.notification);
            // Put the message payload under FCM_MSG name so we can identify the
            // notification as being an FCM notification vs a notification from
            // somewhere else (i.e. normal web push or developer generated
            // notification).
            notificationInformation['data'] = _defineProperty({}, FCM_MSG, msgPayload);
            return notificationInformation;
        }
        /**
         * Calling setBackgroundMessageHandler will opt in to some specific
         * behaviours.
         * 1.) If a notification doesn't need to be shown due to a window already
         * being visible, then push messages will be sent to the page.
         * 2.) If a notification needs to be shown, and the message contains no
         * notification data this method will be called
         * and the promise it returns will be passed to event.waitUntil.
         * If you do not set this callback then all push messages will let and the
         * developer can handle them in a their own 'push' event callback
         * @export
         * @param {function(Object)} callback The callback to be called when a push
         * message is received and a notification must be shown. The callback will
         * be given the data from the push message.
         */

    }, {
        key: 'setBackgroundMessageHandler',
        value: function setBackgroundMessageHandler(callback) {
            if (callback && typeof callback !== 'function') {
                throw this.errorFactory_.create(_errors2.default.codes.BG_HANDLER_FUNCTION_EXPECTED);
            }
            this.bgMessageHandler_ = callback;
        }
        /**
         * @private
         * @param {string} url The URL to look for when focusing a client.
         * @return {Object} Returns an existing window client or a newly opened
         * WindowClient.
         */

    }, {
        key: 'getWindowClient_',
        value: function getWindowClient_(url) {
            // Use URL to normalize the URL when comparing to windowClients.
            // This at least handles whether to include trailing slashes or not
            var parsedURL = new URL(url).href;
            return self.clients.matchAll({
                type: 'window',
                includeUncontrolled: true
            }).then(function (clientList) {
                var suitableClient = null;
                for (var i = 0; i < clientList.length; i++) {
                    var parsedClientUrl = new URL(clientList[i].url).href;
                    if (parsedClientUrl === parsedURL) {
                        suitableClient = clientList[i];
                        break;
                    }
                }
                if (suitableClient) {
                    suitableClient.focus();
                    return suitableClient;
                }
            });
        }
        /**
         * This message will attempt to send the message to a window client.
         * @private
         * @param {Object} client The WindowClient to send the message to.
         * @param {Object} message The message to send to the client.
         * @returns {Promise} Returns a promise that resolves after sending the
         * message. This does not guarantee that the message was successfully
         * received.
         */

    }, {
        key: 'attemptToMessageClient_',
        value: function attemptToMessageClient_(client, message) {
            var _this5 = this;

            return new Promise(function (resolve, reject) {
                if (!client) {
                    return reject(_this5.errorFactory_.create(_errors2.default.codes.NO_WINDOW_CLIENT_TO_MSG));
                }
                client.postMessage(message);
                resolve();
            });
        }
        /**
         * @private
         * @returns {Promise<boolean>} If there is currently a visible WindowClient,
         * this method will resolve to true, otherwise false.
         */

    }, {
        key: 'hasVisibleClients_',
        value: function hasVisibleClients_() {
            return self.clients.matchAll({
                type: 'window',
                includeUncontrolled: true
            }).then(function (clientList) {
                return clientList.some(function (client) {
                    return client.visibilityState === 'visible';
                });
            });
        }
        /**
         * @private
         * @param {Object} msgPayload The data from the push event that should be sent
         * to all available pages.
         * @returns {Promise} Returns a promise that resolves once the message
         * has been sent to all WindowClients.
         */

    }, {
        key: 'sendMessageToWindowClients_',
        value: function sendMessageToWindowClients_(msgPayload) {
            var _this6 = this;

            return self.clients.matchAll({
                type: 'window',
                includeUncontrolled: true
            }).then(function (clientList) {
                var internalMsg = _workerPageMessage2.default.createNewMsg(_workerPageMessage2.default.TYPES_OF_MSG.PUSH_MSG_RECEIVED, msgPayload);
                return Promise.all(clientList.map(function (client) {
                    return _this6.attemptToMessageClient_(client, internalMsg);
                }));
            });
        }
        /**
         * This will register the default service worker and return the registration.
         * @private
         * @return {Promise<!ServiceWorkerRegistration>} The service worker
         * registration to be used for the push service.
         */

    }, {
        key: 'getSWRegistration_',
        value: function getSWRegistration_() {
            return Promise.resolve(self.registration);
        }
    }]);

    return SWController;
}(_controllerInterface2.default);

exports.default = SWController;
module.exports = exports['default'];
//# sourceMappingURL=sw-controller.js.map


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */

/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _controllerInterface = __webpack_require__(29);

var _controllerInterface2 = _interopRequireDefault(_controllerInterface);

var _errors = __webpack_require__(11);

var _errors2 = _interopRequireDefault(_errors);

var _workerPageMessage = __webpack_require__(32);

var _workerPageMessage2 = _interopRequireDefault(_workerPageMessage);

var _defaultSw = __webpack_require__(57);

var _defaultSw2 = _interopRequireDefault(_defaultSw);

var _notificationPermission = __webpack_require__(31);

var _notificationPermission2 = _interopRequireDefault(_notificationPermission);

var _subscribe = __webpack_require__(28);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WindowController = function (_ControllerInterface) {
    _inherits(WindowController, _ControllerInterface);

    /**
     * A service that provides a MessagingService instance.
     * @param {!firebase.app.App} app
     */
    function WindowController(app) {
        _classCallCheck(this, WindowController);

        /**
         * @private
         * @type {ServiceWorkerRegistration}
         */
        var _this = _possibleConstructorReturn(this, (WindowController.__proto__ || Object.getPrototypeOf(WindowController)).call(this, app));

        _this.registrationToUse_;
        /**
         * @private
         * @type {Promise}
         */
        _this.manifestCheckPromise_;
        /**
         * @private
         * @type {firebase.Observer}
         */
        _this.messageObserver_ = null;
        /**
         * @private {!firebase.Subscribe} The subscribe function to the onMessage
         * observer.
         */
        _this.onMessage_ = (0, _subscribe.createSubscribe)(function (observer) {
            _this.messageObserver_ = observer;
        });
        /**
         * @private
         * @type {firebase.Observer}
         */
        _this.tokenRefreshObserver_ = null;
        _this.onTokenRefresh_ = (0, _subscribe.createSubscribe)(function (observer) {
            _this.tokenRefreshObserver_ = observer;
        });
        _this.setupSWMessageListener_();
        return _this;
    }
    /**
     * This method returns an FCM token if it can be generated.
     * The return promise will reject if the browser doesn't support
     * FCM, if permission is denied for notifications or it's not
     * possible to generate a token.
     * @export
     * @return {Promise<string> | Promise<null>} Returns a promise the
     * resolves to an FCM token or null if permission isn't granted.
     */


    _createClass(WindowController, [{
        key: 'getToken',
        value: function getToken() {
            var _this2 = this;

            // Check that the required API's are available
            if (!this.isSupported_()) {
                return Promise.reject(this.errorFactory_.create(_errors2.default.codes.UNSUPPORTED_BROWSER));
            }
            return this.manifestCheck_().then(function () {
                return _get(WindowController.prototype.__proto__ || Object.getPrototypeOf(WindowController.prototype), 'getToken', _this2).call(_this2);
            });
        }
        /**
         * The method checks that a manifest is defined and has the correct GCM
         * sender ID.
         * @private
         * @return {Promise} Returns a promise that resolves if the manifest matches
         * our required sender ID
         */

    }, {
        key: 'manifestCheck_',
        value: function manifestCheck_() {
            var _this3 = this;

            if (this.manifestCheckPromise_) {
                return this.manifestCheckPromise_;
            }
            var manifestTag = document.querySelector('link[rel="manifest"]');
            if (!manifestTag) {
                this.manifestCheckPromise_ = Promise.resolve();
            } else {
                this.manifestCheckPromise_ = fetch(manifestTag.href).then(function (response) {
                    return response.json();
                }).catch(function () {
                    // If the download or parsing fails allow check.
                    // We only want to error if we KNOW that the gcm_sender_id is incorrect.
                    return Promise.resolve();
                }).then(function (manifestContent) {
                    if (!manifestContent) {
                        return;
                    }
                    if (!manifestContent['gcm_sender_id']) {
                        return;
                    }
                    if (manifestContent['gcm_sender_id'] !== '103953800507') {
                        throw _this3.errorFactory_.create(_errors2.default.codes.INCORRECT_GCM_SENDER_ID);
                    }
                });
            }
            return this.manifestCheckPromise_;
        }
        /**
         * Request permission if it is not currently granted
         * @export
         * @returns {Promise} Resolves if the permission was granted, otherwise
         * rejects
         */

    }, {
        key: 'requestPermission',
        value: function requestPermission() {
            var _this4 = this;

            if (Notification.permission === _notificationPermission2.default.granted) {
                return Promise.resolve();
            }
            return new Promise(function (resolve, reject) {
                var managePermissionResult = function (result) {
                    if (result === _notificationPermission2.default.granted) {
                        return resolve();
                    } else if (result === _notificationPermission2.default.denied) {
                        return reject(_this4.errorFactory_.create(_errors2.default.codes.PERMISSION_BLOCKED));
                    } else {
                        return reject(_this4.errorFactory_.create(_errors2.default.codes.PERMISSION_DEFAULT));
                    }
                };
                // The Notification.requestPermission API was changed to
                // return a promise so now have to handle both in case
                // browsers stop support callbacks for promised version
                var permissionPromise = Notification.requestPermission(function (result) {
                    if (permissionPromise) {
                        // Let the promise manage this
                        return;
                    }
                    managePermissionResult(result);
                });
                if (permissionPromise) {
                    // Prefer the promise version as it's the future API.
                    permissionPromise.then(managePermissionResult);
                }
            });
        }
        /**
         * This method allows a developer to override the default service worker and
         * instead use a custom service worker.
         * @export
         * @param {!ServiceWorkerRegistration} registration The service worker
         * registration that should be used to receive the push messages.
         */

    }, {
        key: 'useServiceWorker',
        value: function useServiceWorker(registration) {
            if (!(registration instanceof ServiceWorkerRegistration)) {
                throw this.errorFactory_.create(_errors2.default.codes.SW_REGISTRATION_EXPECTED);
            }
            if (typeof this.registrationToUse_ !== 'undefined') {
                throw this.errorFactory_.create(_errors2.default.codes.USE_SW_BEFORE_GET_TOKEN);
            }
            this.registrationToUse_ = registration;
        }
        /**
         * @export
         * @param {!firebase.Observer|function(*)} nextOrObserver An observer object
         * or a function triggered on message.
         * @param {function(!Error)=} optError Optional A function triggered on
         * message error.
         * @param {function()=} optCompleted Optional function triggered when the
         * observer is removed.
         * @return {!function()} The unsubscribe function for the observer.
         */

    }, {
        key: 'onMessage',
        value: function onMessage(nextOrObserver, optError, optCompleted) {
            return this.onMessage_(nextOrObserver, optError, optCompleted);
        }
        /**
         * @export
         * @param {!firebase.Observer|function()} nextOrObserver An observer object
         * or a function triggered on token refresh.
         * @param {function(!Error)=} optError Optional A function
         * triggered on token refresh error.
         * @param {function()=} optCompleted Optional function triggered when the
         * observer is removed.
         * @return {!function()} The unsubscribe function for the observer.
         */

    }, {
        key: 'onTokenRefresh',
        value: function onTokenRefresh(nextOrObserver, optError, optCompleted) {
            return this.onTokenRefresh_(nextOrObserver, optError, optCompleted);
        }
        /**
         * Given a registration, wait for the service worker it relates to
         * become activer
         * @private
         * @param  {ServiceWorkerRegistration} registration Registration to wait
         * for service worker to become active
         * @return {Promise<!ServiceWorkerRegistration>} Wait for service worker
         * registration to become active
         */

    }, {
        key: 'waitForRegistrationToActivate_',
        value: function waitForRegistrationToActivate_(registration) {
            var _this5 = this;

            var serviceWorker = registration.installing || registration.waiting || registration.active;
            return new Promise(function (resolve, reject) {
                if (!serviceWorker) {
                    // This is a rare scenario but has occured in firefox
                    reject(_this5.errorFactory_.create(_errors2.default.codes.NO_SW_IN_REG));
                    return;
                }
                // Because the Promise function is called on next tick there is a
                // small chance that the worker became active or redundant already.
                if (serviceWorker.state === 'activated') {
                    resolve(registration);
                    return;
                }
                if (serviceWorker.state === 'redundant') {
                    reject(_this5.errorFactory_.create(_errors2.default.codes.SW_REG_REDUNDANT));
                    return;
                }
                var stateChangeListener = function () {
                    if (serviceWorker.state === 'activated') {
                        resolve(registration);
                    } else if (serviceWorker.state === 'redundant') {
                        reject(_this5.errorFactory_.create(_errors2.default.codes.SW_REG_REDUNDANT));
                    } else {
                        // Return early and wait to next state change
                        return;
                    }
                    serviceWorker.removeEventListener('statechange', stateChangeListener);
                };
                serviceWorker.addEventListener('statechange', stateChangeListener);
            });
        }
        /**
         * This will regiater the default service worker and return the registration
         * @private
         * @return {Promise<!ServiceWorkerRegistration>} The service worker
         * registration to be used for the push service.
         */

    }, {
        key: 'getSWRegistration_',
        value: function getSWRegistration_() {
            var _this6 = this;

            if (this.registrationToUse_) {
                return this.waitForRegistrationToActivate_(this.registrationToUse_);
            }
            // Make the registration null so we know useServiceWorker will not
            // use a new service worker as registrationToUse_ is no longer undefined
            this.registrationToUse_ = null;
            return navigator.serviceWorker.register(_defaultSw2.default.path, {
                scope: _defaultSw2.default.scope
            }).catch(function (err) {
                throw _this6.errorFactory_.create(_errors2.default.codes.FAILED_DEFAULT_REGISTRATION, {
                    'browserErrorMessage': err.message
                });
            }).then(function (registration) {
                return _this6.waitForRegistrationToActivate_(registration).then(function () {
                    _this6.registrationToUse_ = registration;
                    // We update after activation due to an issue with Firefox v49 where
                    // a race condition occassionally causes the service work to not
                    // install
                    registration.update();
                    return registration;
                });
            });
        }
        /**
         * This method will set up a message listener to handle
         * events from the service worker that should trigger
         * events in the page.
         *
         * @private
         */

    }, {
        key: 'setupSWMessageListener_',
        value: function setupSWMessageListener_() {
            var _this7 = this;

            if (!('serviceWorker' in navigator)) {
                return;
            }
            navigator.serviceWorker.addEventListener('message', function (event) {
                if (!event.data || !event.data[_workerPageMessage2.default.PARAMS.TYPE_OF_MSG]) {
                    // Not a message from FCM
                    return;
                }
                var workerPageMessage = event.data;
                switch (workerPageMessage[_workerPageMessage2.default.PARAMS.TYPE_OF_MSG]) {
                    case _workerPageMessage2.default.TYPES_OF_MSG.PUSH_MSG_RECEIVED:
                    case _workerPageMessage2.default.TYPES_OF_MSG.NOTIFICATION_CLICKED:
                        var pushMessage = workerPageMessage[_workerPageMessage2.default.PARAMS.DATA];
                        _this7.messageObserver_.next(pushMessage);
                        break;
                    default:
                        // Noop.
                        break;
                }
            }, false);
        }
        /**
         * Checks to see if the required API's are valid or not.
         * @private
         * @return {boolean} Returns true if the desired APIs are available.
         */

    }, {
        key: 'isSupported_',
        value: function isSupported_() {
            return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && ServiceWorkerRegistration.prototype.hasOwnProperty('showNotification') && PushSubscription.prototype.hasOwnProperty('getKey');
        }
    }]);

    return WindowController;
}(_controllerInterface2.default);

exports.default = WindowController;
module.exports = exports['default'];
//# sourceMappingURL=window-controller.js.map


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
function toBase64(arrayBuffer) {
    var uint8Version = new Uint8Array(arrayBuffer);
    return window.btoa(String.fromCharCode.apply(null, uint8Version));
}

exports.default = function (arrayBuffer) {
    var base64String = toBase64(arrayBuffer);
    return base64String.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

module.exports = exports['default'];
//# sourceMappingURL=array-buffer-to-base64.js.map


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */

/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    path: '/firebase-messaging-sw.js',
    scope: '/firebase-cloud-messaging-push-scope'
};
module.exports = exports['default'];
//# sourceMappingURL=default-sw.js.map


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */

/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _errors = __webpack_require__(17);

var _errors2 = __webpack_require__(11);

var _errors3 = _interopRequireDefault(_errors2);

var _arrayBufferToBase = __webpack_require__(56);

var _arrayBufferToBase2 = _interopRequireDefault(_arrayBufferToBase);

var _fcmDetails = __webpack_require__(30);

var _fcmDetails2 = _interopRequireDefault(_fcmDetails);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FCM_TOKEN_DETAILS_DB = 'fcm_token_details_db';
var FCM_TOKEN_OBJ_STORE = 'fcm_token_object_Store';
var FCM_TOKEN_DETAILS_DB_VERSION = 1;

var TokenManager = function () {
    function TokenManager() {
        _classCallCheck(this, TokenManager);

        this.errorFactory_ = new _errors.ErrorFactory('messaging', 'Messaging', _errors3.default.map);
        this.openDbPromise_ = null;
    }
    /**
     * Get the indexedDB as a promsie.
     * @private
     * @return {Promise<IDBDatabase>} The IndexedDB database
     */


    _createClass(TokenManager, [{
        key: 'openDatabase_',
        value: function openDatabase_() {
            if (this.openDbPromise_) {
                return this.openDbPromise_;
            }
            this.openDbPromise_ = new Promise(function (resolve, reject) {
                var request = indexedDB.open(FCM_TOKEN_DETAILS_DB, FCM_TOKEN_DETAILS_DB_VERSION);
                request.onerror = function (event) {
                    reject(event.target.error);
                };
                request.onsuccess = function (event) {
                    resolve(event.target.result);
                };
                request.onupgradeneeded = function (event) {
                    var db = event.target.result;
                    var objectStore = db.createObjectStore(FCM_TOKEN_OBJ_STORE, {
                        keyPath: 'swScope'
                    });
                    // Make sure the sender ID can be searched
                    objectStore.createIndex('fcmSenderId', 'fcmSenderId', {
                        unique: false
                    });
                    objectStore.createIndex('fcmToken', 'fcmToken', {
                        unique: true
                    });
                };
            });
            return this.openDbPromise_;
        }
        /**
         * Close the currently open database.
         * @return {Promise<?>} Returns the result of the promise chain.
         */

    }, {
        key: 'closeDatabase',
        value: function closeDatabase() {
            var _this = this;

            if (this.openDbPromise_) {
                return this.openDbPromise_.then(function (db) {
                    db.close();
                    _this.openDbPromise_ = null;
                });
            }
            return Promise.resolve();
        }
        /**
         * Given a token, this method will look up the details in indexedDB.
         * @public
         * @param {string} fcmToken
         * @return {Promise<Object>} The details associated with that token.
         */

    }, {
        key: 'getTokenDetailsFromToken',
        value: function getTokenDetailsFromToken(fcmToken) {
            return this.openDatabase_().then(function (db) {
                return new Promise(function (resolve, reject) {
                    var transaction = db.transaction([FCM_TOKEN_OBJ_STORE]);
                    var objectStore = transaction.objectStore(FCM_TOKEN_OBJ_STORE);
                    var index = objectStore.index('fcmToken');
                    var request = index.get(fcmToken);
                    request.onerror = function (event) {
                        reject(event.target.error);
                    };
                    request.onsuccess = function (event) {
                        resolve(event.target.result);
                    };
                });
            });
        }
    }, {
        key: 'getTokenDetailsFromSWScope_',
        value: function getTokenDetailsFromSWScope_(swScope) {
            return this.openDatabase_().then(function (db) {
                return new Promise(function (resolve, reject) {
                    var transaction = db.transaction([FCM_TOKEN_OBJ_STORE]);
                    var objectStore = transaction.objectStore(FCM_TOKEN_OBJ_STORE);
                    var scopeRequest = objectStore.get(swScope);
                    scopeRequest.onerror = function (event) {
                        reject(event.target.error);
                    };
                    scopeRequest.onsuccess = function (event) {
                        resolve(event.target.result);
                    };
                });
            });
        }
    }, {
        key: 'getAllTokenDetailsForSenderId_',
        value: function getAllTokenDetailsForSenderId_(senderId) {
            return this.openDatabase_().then(function (db) {
                return new Promise(function (resolve, reject) {
                    var transaction = db.transaction([FCM_TOKEN_OBJ_STORE]);
                    var objectStore = transaction.objectStore(FCM_TOKEN_OBJ_STORE);
                    var senderIdTokens = [];
                    var cursorRequest = objectStore.openCursor();
                    cursorRequest.onerror = function (event) {
                        reject(event.target.error);
                    };
                    cursorRequest.onsuccess = function (event) {
                        var cursor = event.target.result;
                        if (cursor) {
                            if (cursor.value['fcmSenderId'] === senderId) {
                                senderIdTokens.push(cursor.value);
                            }
                            cursor.continue();
                        } else {
                            resolve(senderIdTokens);
                        }
                    };
                });
            });
        }
        /**
         * Given a PushSubscription and messagingSenderId, get an FCM token.
         * @public
         * @param  {string} senderId The 'messagingSenderId' to tie the token to.
         * @param  {PushSubscription} subscription The PushSusbcription to "federate".
         * @param  {string=} pushSet If defined this will swap the subscription for
         * matching FCM token.
         * @return {Promise<!Object>} Returns the FCM token to be used in place
         * of the PushSubscription.
         */

    }, {
        key: 'subscribeToFCM',
        value: function subscribeToFCM(senderId, subscription, pushSet) {
            var _this2 = this;

            var p256dh = (0, _arrayBufferToBase2.default)(subscription['getKey']('p256dh'));
            var auth = (0, _arrayBufferToBase2.default)(subscription['getKey']('auth'));
            var fcmSubscribeBody = 'authorized_entity=' + senderId + '&' + ('endpoint=' + subscription.endpoint + '&') + ('encryption_key=' + p256dh + '&') + ('encryption_auth=' + auth);
            if (pushSet) {
                fcmSubscribeBody += '&pushSet=' + pushSet;
            }
            var headers = new Headers();
            headers.append('Content-Type', 'application/x-www-form-urlencoded');
            var subscribeOptions = {
                method: 'POST',
                headers: headers,
                body: fcmSubscribeBody
            };
            return fetch(_fcmDetails2.default.ENDPOINT + '/fcm/connect/subscribe', subscribeOptions).then(function (response) {
                return response.json();
            }).then(function (response) {
                var fcmTokenResponse = response;
                if (fcmTokenResponse['error']) {
                    var message = fcmTokenResponse['error']['message'];
                    throw _this2.errorFactory_.create(_errors3.default.codes.TOKEN_SUBSCRIBE_FAILED, { 'message': message });
                }
                if (!fcmTokenResponse['token']) {
                    throw _this2.errorFactory_.create(_errors3.default.codes.TOKEN_SUBSCRIBE_NO_TOKEN);
                }
                if (!fcmTokenResponse['pushSet']) {
                    throw _this2.errorFactory_.create(_errors3.default.codes.TOKEN_SUBSCRIBE_NO_PUSH_SET);
                }
                return {
                    'token': fcmTokenResponse['token'],
                    'pushSet': fcmTokenResponse['pushSet']
                };
            });
        }
        /**
         * Checks the that fields in the PushSubscription are equivalent to the
         * details stores in the masterTokenDetails.
         * @private
         * @param  {PushSubscription} subscription The push subscription we expect
         * the master token to match.
         * @param  {Object}  masterTokenDetails The saved details we wish to compare
         * with the PushSubscription
         * @return {boolean} true if the subscription and token details are
         * equivalent.
         */

    }, {
        key: 'isSameSubscription_',
        value: function isSameSubscription_(subscription, masterTokenDetails) {
            // getKey() isn't defined in the PushSubscription externs file, hence
            // subscription['getKey']('<key name>').
            return subscription.endpoint === masterTokenDetails['endpoint'] && (0, _arrayBufferToBase2.default)(subscription['getKey']('auth')) === masterTokenDetails['auth'] && (0, _arrayBufferToBase2.default)(subscription['getKey']('p256dh')) === masterTokenDetails['p256dh'];
        }
        /**
         * Save the details for the fcm token for re-use at a later date.
         * @private
         * @param  {string} senderId The 'messagingSenderId' used for this project
         * @param  {ServiceWorkerRegistration} swRegistration The service worker
         * used to subscribe the user for web push
         * @param  {PushSubscription} subscription The push subscription passed to
         * FCM for the current token.
         * @param  {string} fcmToken The FCM token currently used on this
         * device.
         * @param  {string} fcmPushSet The FCM push tied to the fcm token.
         * @return {Promise<void>}
         */

    }, {
        key: 'saveTokenDetails_',
        value: function saveTokenDetails_(senderId, swRegistration, subscription, fcmToken, fcmPushSet) {
            var details = {
                'swScope': swRegistration.scope,
                'endpoint': subscription.endpoint,
                'auth': (0, _arrayBufferToBase2.default)(subscription['getKey']('auth')),
                'p256dh': (0, _arrayBufferToBase2.default)(subscription['getKey']('p256dh')),
                'fcmToken': fcmToken,
                'fcmPushSet': fcmPushSet,
                'fcmSenderId': senderId
            };
            return this.openDatabase_().then(function (db) {
                return new Promise(function (resolve, reject) {
                    var transaction = db.transaction([FCM_TOKEN_OBJ_STORE], 'readwrite');
                    var objectStore = transaction.objectStore(FCM_TOKEN_OBJ_STORE);
                    var request = objectStore.put(details);
                    request.onerror = function (event) {
                        reject(event.target.error);
                    };
                    request.onsuccess = function () {
                        resolve();
                    };
                });
            });
        }
        /**
         * Returns the saved FCM Token if one is available and still valid,
         * otherwise `null` is returned.
         * @param {string} senderId This should be the sender ID associated with the
         * FCM Token being retrieved.
         * @param {ServiceWorkerRegistration} swRegistration Registration to be used
         * to subscribe the user to push.
         * @return {Promise<string> | Promise} Returns the saved FCM Token if
         * avilable and valid.
         * @export
         */

    }, {
        key: 'getSavedToken',
        value: function getSavedToken(senderId, swRegistration) {
            var _this3 = this;

            if (!(swRegistration instanceof ServiceWorkerRegistration)) {
                return Promise.reject(this.errorFactory_.create(_errors3.default.codes.SW_REGISTRATION_EXPECTED));
            }
            if (typeof senderId !== 'string' || senderId.length === 0) {
                return Promise.reject(this.errorFactory_.create(_errors3.default.codes.BAD_SENDER_ID));
            }
            return this.getAllTokenDetailsForSenderId_(senderId).then(function (allTokenDetails) {
                if (allTokenDetails.length === 0) {
                    return;
                }
                var index = allTokenDetails.findIndex(function (tokenDetails) {
                    return swRegistration.scope === tokenDetails['swScope'] && senderId === tokenDetails['fcmSenderId'];
                });
                if (index === -1) {
                    return;
                }
                return allTokenDetails[index];
            }).then(function (tokenDetails) {
                if (!tokenDetails) {
                    return;
                }
                return swRegistration.pushManager.getSubscription().catch(function () {
                    throw _this3.errorFactory_.create(_errors3.default.codes.GET_SUBSCRIPTION_FAILED);
                }).then(function (subscription) {
                    if (subscription && _this3.isSameSubscription_(subscription, tokenDetails)) {
                        return tokenDetails['fcmToken'];
                    }
                });
            });
        }
        /**
         * Creates a new FCM token.
         */

    }, {
        key: 'createToken',
        value: function createToken(senderId, swRegistration) {
            var _this4 = this;

            if (typeof senderId !== 'string' || senderId.length === 0) {
                return Promise.reject(this.errorFactory_.create(_errors3.default.codes.BAD_SENDER_ID));
            }
            if (!(swRegistration instanceof ServiceWorkerRegistration)) {
                return Promise.reject(this.errorFactory_.create(_errors3.default.codes.SW_REGISTRATION_EXPECTED));
            }
            // Check for existing subscription first
            var subscription = void 0;
            var fcmTokenDetails = void 0;
            return swRegistration.pushManager.getSubscription().then(function (subscription) {
                if (subscription) {
                    return subscription;
                }
                return swRegistration.pushManager.subscribe(_fcmDetails2.default.SUBSCRIPTION_OPTIONS);
            }).then(function (sub) {
                subscription = sub;
                return _this4.subscribeToFCM(senderId, subscription);
            }).then(function (tokenDetails) {
                fcmTokenDetails = tokenDetails;
                return _this4.saveTokenDetails_(senderId, swRegistration, subscription, fcmTokenDetails['token'], fcmTokenDetails['pushSet']);
            }).then(function () {
                return fcmTokenDetails['token'];
            });
        }
        /**
         * This method deletes details of the current FCM token.
         * It's returning a promise in case we need to move to an async
         * method for deleting at a later date.
         * @param {string} token Token to be deleted
         * @return {Promise<Object>} Resolves once the FCM token details have been
         * deleted and returns the deleted details.
         */

    }, {
        key: 'deleteToken',
        value: function deleteToken(token) {
            var _this5 = this;

            if (typeof token !== 'string' || token.length === 0) {
                return Promise.reject(this.errorFactory_.create(_errors3.default.codes.INVALID_DELETE_TOKEN));
            }
            return this.getTokenDetailsFromToken(token).then(function (details) {
                if (!details) {
                    throw _this5.errorFactory_.create(_errors3.default.codes.DELETE_TOKEN_NOT_FOUND);
                }
                return _this5.openDatabase_().then(function (db) {
                    return new Promise(function (resolve, reject) {
                        var transaction = db.transaction([FCM_TOKEN_OBJ_STORE], 'readwrite');
                        var objectStore = transaction.objectStore(FCM_TOKEN_OBJ_STORE);
                        var request = objectStore.delete(details['swScope']);
                        request.onerror = function (event) {
                            reject(event.target.error);
                        };
                        request.onsuccess = function (event) {
                            if (event.target.result === 0) {
                                reject(_this5.errorFactory_.create(_errors3.default.codes.FAILED_TO_DELETE_TOKEN));
                                return;
                            }
                            resolve(details);
                        };
                    });
                });
            });
        }
    }]);

    return TokenManager;
}();

exports.default = TokenManager;
module.exports = exports['default'];
//# sourceMappingURL=token-manager.js.map


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(setImmediate) {(function (root) {

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function noop() {}
  
  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  function Promise(fn) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = 0;
    this._handled = false;
    this._value = undefined;
    this._deferreds = [];

    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise._immediateFn(function () {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (newValue instanceof Promise) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise._immediateFn(function() {
        if (!self._handled) {
          Promise._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, self) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var prom = new (this.constructor)(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise.all = function (arr) {
    var args = Array.prototype.slice.call(arr);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for (var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
    function (fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  /**
   * Set the immediate function to execute callbacks
   * @param fn {function} Function to execute
   * @deprecated
   */
  Promise._setImmediateFn = function _setImmediateFn(fn) {
    Promise._immediateFn = fn;
  };

  /**
   * Change the function to execute on unhandled rejection
   * @param {function} fn Function to execute on unhandled rejection
   * @deprecated
   */
  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
    Promise._unhandledRejectionFn = fn;
  };
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Promise;
  } else if (!root.Promise) {
    root.Promise = Promise;
  }

})(this);

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(95).setImmediate))

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.registerStorage = registerStorage;

var _string = __webpack_require__(22);

var _taskenums = __webpack_require__(36);

var _xhriopool = __webpack_require__(72);

var _reference = __webpack_require__(38);

var _service = __webpack_require__(73);

var _app = __webpack_require__(9);

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Type constant for Firebase Storage.
 */
var STORAGE_TYPE = 'storage'; /**
                              * Copyright 2017 Google Inc.
                              *
                              * Licensed under the Apache License, Version 2.0 (the "License");
                              * you may not use this file except in compliance with the License.
                              * You may obtain a copy of the License at
                              *
                              *   http://www.apache.org/licenses/LICENSE-2.0
                              *
                              * Unless required by applicable law or agreed to in writing, software
                              * distributed under the License is distributed on an "AS IS" BASIS,
                              * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                              * See the License for the specific language governing permissions and
                              * limitations under the License.
                              */

function factory(app, unused, opt_url) {
    return new _service.Service(app, new _xhriopool.XhrIoPool(), opt_url);
}
function registerStorage(instance) {
    instance.INTERNAL.registerService(STORAGE_TYPE, factory, {
        // no-inline
        'TaskState': _taskenums.TaskState,
        'TaskEvent': _taskenums.TaskEvent,
        'StringFormat': _string.StringFormat,
        'Storage': _service.Service,
        'Reference': _reference.Reference
    }, undefined,
    // Allow multiple storage instances per app.
    true);
}
registerStorage(_app2.default);
//# sourceMappingURL=storage.js.map


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.async = async;

var _promise_external = __webpack_require__(5);

var promiseimpl = _interopRequireWildcard(_promise_external);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Returns a function that invokes f with its arguments asynchronously as a
 * microtask, i.e. as soon as possible after the current script returns back
 * into browser code.
 */
function async(f) {
    return function () {
        for (var _len = arguments.length, argsToForward = Array(_len), _key = 0; _key < _len; _key++) {
            argsToForward[_key] = arguments[_key];
        }

        promiseimpl.resolve(true).then(function () {
            f.apply(null, argsToForward);
        });
    };
} /**
  * Copyright 2017 Google Inc.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *   http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */
/**
 * @fileoverview Method for invoking a callback asynchronously.
 */
//# sourceMappingURL=async.js.map


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AuthWrapper = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _constants = __webpack_require__(12);

var constants = _interopRequireWildcard(_constants);

var _error2 = __webpack_require__(3);

var errorsExports = _interopRequireWildcard(_error2);

var _failrequest = __webpack_require__(64);

var _location = __webpack_require__(13);

var _promise_external = __webpack_require__(5);

var promiseimpl = _interopRequireWildcard(_promise_external);

var _requestmap = __webpack_require__(70);

var _type = __webpack_require__(1);

var type = _interopRequireWildcard(_type);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @param app If null, getAuthToken always resolves with null.
 * @param service The storage service associated with this auth wrapper.
 *     Untyped to avoid circular type dependencies.
 * @struct
 */
var AuthWrapper = exports.AuthWrapper = function () {
    function AuthWrapper(app, maker, requestMaker, service, pool) {
        _classCallCheck(this, AuthWrapper);

        this.bucket_ = null;
        this.deleted_ = false;
        this.app_ = app;
        if (this.app_ !== null) {
            var options = this.app_.options;
            if (type.isDef(options)) {
                this.bucket_ = AuthWrapper.extractBucket_(options);
            }
        }
        this.storageRefMaker_ = maker;
        this.requestMaker_ = requestMaker;
        this.pool_ = pool;
        this.service_ = service;
        this.maxOperationRetryTime_ = constants.defaultMaxOperationRetryTime;
        this.maxUploadRetryTime_ = constants.defaultMaxUploadRetryTime;
        this.requestMap_ = new _requestmap.RequestMap();
    }

    _createClass(AuthWrapper, [{
        key: 'getAuthToken',
        value: function getAuthToken() {
            // TODO(andysoto): remove ifDef checks after firebase-app implements stubs
            // (b/28673818).
            if (this.app_ !== null && type.isDef(this.app_.INTERNAL) && type.isDef(this.app_.INTERNAL.getToken)) {
                return this.app_.INTERNAL.getToken().then(function (response) {
                    if (response !== null) {
                        return response.accessToken;
                    } else {
                        return null;
                    }
                }, function () {
                    return null;
                });
            } else {
                return promiseimpl.resolve(null);
            }
        }
    }, {
        key: 'bucket',
        value: function bucket() {
            if (this.deleted_) {
                throw errorsExports.appDeleted();
            } else {
                return this.bucket_;
            }
        }
        /**
         * The service associated with this auth wrapper. Untyped to avoid circular
         * type dependencies.
         */

    }, {
        key: 'service',
        value: function service() {
            return this.service_;
        }
        /**
         * Returns a new firebaseStorage.Reference object referencing this AuthWrapper
         * at the given Location.
         * @param loc The Location.
         * @return Actually a firebaseStorage.Reference, typing not allowed
         *     because of circular dependency problems.
         */

    }, {
        key: 'makeStorageReference',
        value: function makeStorageReference(loc) {
            return this.storageRefMaker_(this, loc);
        }
    }, {
        key: 'makeRequest',
        value: function makeRequest(requestInfo, authToken) {
            if (!this.deleted_) {
                var request = this.requestMaker_(requestInfo, authToken, this.pool_);
                this.requestMap_.addRequest(request);
                return request;
            } else {
                return new _failrequest.FailRequest(errorsExports.appDeleted());
            }
        }
        /**
         * Stop running requests and prevent more from being created.
         */

    }, {
        key: 'deleteApp',
        value: function deleteApp() {
            this.deleted_ = true;
            this.app_ = null;
            this.requestMap_.clear();
        }
    }, {
        key: 'maxUploadRetryTime',
        value: function maxUploadRetryTime() {
            return this.maxUploadRetryTime_;
        }
    }, {
        key: 'setMaxUploadRetryTime',
        value: function setMaxUploadRetryTime(time) {
            this.maxUploadRetryTime_ = time;
        }
    }, {
        key: 'maxOperationRetryTime',
        value: function maxOperationRetryTime() {
            return this.maxOperationRetryTime_;
        }
    }, {
        key: 'setMaxOperationRetryTime',
        value: function setMaxOperationRetryTime(time) {
            this.maxOperationRetryTime_ = time;
        }
    }], [{
        key: 'extractBucket_',
        value: function extractBucket_(config) {
            var bucketString = config[constants.configOption] || null;
            if (bucketString == null) {
                return null;
            }
            var loc = _location.Location.makeFromBucketSpec(bucketString);
            return loc.bucket;
        }
    }]);

    return AuthWrapper;
}();
//# sourceMappingURL=authwrapper.js.map


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.start = start;
exports.stop = stop;
/**
* Copyright 2017 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
 * @param f May be invoked
 *     before the function returns.
 * @param callback Get all the arguments passed to the function
 *     passed to f, including the initial boolean.
 */
function start(f, callback, timeout) {
    // TODO(andysoto): make this code cleaner (probably refactor into an actual
    // type instead of a bunch of functions with state shared in the closure)
    var waitSeconds = 1;
    // Would type this as "number" but that doesn't work for Node so ¯\_(ツ)_/¯
    var timeoutId = null;
    var hitTimeout = false;
    var cancelState = 0;
    function canceled() {
        return cancelState === 2;
    }
    var triggeredCallback = false;
    function triggerCallback() {
        if (!triggeredCallback) {
            triggeredCallback = true;
            callback.apply(null, arguments);
        }
    }
    function callWithDelay(millis) {
        timeoutId = setTimeout(function () {
            timeoutId = null;
            f(handler, canceled());
        }, millis);
    }
    function handler(success) {
        for (var _len = arguments.length, var_args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            var_args[_key - 1] = arguments[_key];
        }

        if (triggeredCallback) {
            return;
        }
        if (success) {
            triggerCallback.apply(null, arguments);
            return;
        }
        var mustStop = canceled() || hitTimeout;
        if (mustStop) {
            triggerCallback.apply(null, arguments);
            return;
        }
        if (waitSeconds < 64) {
            /* TODO(andysoto): don't back off so quickly if we know we're offline. */
            waitSeconds *= 2;
        }
        var waitMillis = void 0;
        if (cancelState === 1) {
            cancelState = 2;
            waitMillis = 0;
        } else {
            waitMillis = (waitSeconds + Math.random()) * 1000;
        }
        callWithDelay(waitMillis);
    }
    var stopped = false;
    function stop(wasTimeout) {
        if (stopped) {
            return;
        }
        stopped = true;
        if (triggeredCallback) {
            return;
        }
        if (timeoutId !== null) {
            if (!wasTimeout) {
                cancelState = 2;
            }
            clearTimeout(timeoutId);
            callWithDelay(0);
        } else {
            if (!wasTimeout) {
                cancelState = 1;
            }
        }
    }
    callWithDelay(0);
    setTimeout(function () {
        hitTimeout = true;
        stop(true);
    }, timeout);
    return stop;
}
/**
 * Stops the retry loop from repeating.
 * If the function is currently "in between" retries, it is invoked immediately
 * with the second parameter as "true". Otherwise, it will be invoked once more
 * after the current invocation finishes iff the current invocation would have
 * triggered another retry.
 */
function stop(id) {
    id(false);
}
//# sourceMappingURL=backoff.js.map


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FailRequest = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _promise_external = __webpack_require__(5);

var promiseimpl = _interopRequireWildcard(_promise_external);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A request whose promise always fails.
 * @struct
 * @template T
 */
var FailRequest = exports.FailRequest = function () {
    function FailRequest(error) {
        _classCallCheck(this, FailRequest);

        this.promise_ = promiseimpl.reject(error);
    }
    /** @inheritDoc */


    _createClass(FailRequest, [{
        key: 'getPromise',
        value: function getPromise() {
            return this.promise_;
        }
        /** @inheritDoc */

    }, {
        key: 'cancel',
        value: function cancel() {
            arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        }
    }]);

    return FailRequest;
}();
//# sourceMappingURL=failrequest.js.map


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getBlob = getBlob;
exports.sliceBlob = sliceBlob;

var _type = __webpack_require__(1);

var type = _interopRequireWildcard(_type);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function getBlobBuilder() {
    if (typeof BlobBuilder !== 'undefined') {
        return BlobBuilder;
    } else if (typeof WebKitBlobBuilder !== 'undefined') {
        return WebKitBlobBuilder;
    } else {
        return undefined;
    }
}
/**
 * Concatenates one or more values together and converts them to a Blob.
 *
 * @param var_args The values that will make up the resulting blob.
 * @return The blob.
 */
function getBlob() {
    var BlobBuilder = getBlobBuilder();

    for (var _len = arguments.length, var_args = Array(_len), _key = 0; _key < _len; _key++) {
        var_args[_key] = arguments[_key];
    }

    if (BlobBuilder !== undefined) {
        var bb = new BlobBuilder();
        for (var i = 0; i < var_args.length; i++) {
            bb.append(var_args[i]);
        }
        return bb.getBlob();
    } else {
        if (type.isNativeBlobDefined()) {
            return new Blob(var_args);
        } else {
            throw Error('This browser doesn\'t seem to support creating Blobs');
        }
    }
}
/**
 * Slices the blob. The returned blob contains data from the start byte
 * (inclusive) till the end byte (exclusive). Negative indices cannot be used.
 *
 * @param blob The blob to be sliced.
 * @param start Index of the starting byte.
 * @param end Index of the ending byte.
 * @return The blob slice or null if not supported.
 */
function sliceBlob(blob, start, end) {
    if (blob.webkitSlice) {
        return blob.webkitSlice(start, end);
    } else if (blob.mozSlice) {
        return blob.mozSlice(start, end);
    } else if (blob.slice) {
        return blob.slice(start, end);
    }
    return null;
}
//# sourceMappingURL=fs.js.map


/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.jsonObjectOrNull = jsonObjectOrNull;

var _type = __webpack_require__(1);

var type = _interopRequireWildcard(_type);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Returns the Object resulting from parsing the given JSON, or null if the
 * given string does not represent a JSON object.
 */
function jsonObjectOrNull(s) {
    var obj = void 0;
    try {
        obj = JSON.parse(s);
    } catch (e) {
        return null;
    }
    if (type.isNonArrayObject(obj)) {
        return obj;
    } else {
        return null;
    }
} /**
  * Copyright 2017 Google Inc.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *   http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */
//# sourceMappingURL=json.js.map


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Observer = undefined;

var _type = __webpack_require__(1);

var type = _interopRequireWildcard(_type);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                          * Copyright 2017 Google Inc.
                                                                                                                                                          *
                                                                                                                                                          * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                          * you may not use this file except in compliance with the License.
                                                                                                                                                          * You may obtain a copy of the License at
                                                                                                                                                          *
                                                                                                                                                          *   http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                          *
                                                                                                                                                          * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                          * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                          * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                          * See the License for the specific language governing permissions and
                                                                                                                                                          * limitations under the License.
                                                                                                                                                          */


/**
 * @struct
 */
var Observer = exports.Observer = function Observer(nextOrObserver, opt_error, opt_complete) {
    _classCallCheck(this, Observer);

    var asFunctions = type.isFunction(nextOrObserver) || type.isDef(opt_error) || type.isDef(opt_complete);
    if (asFunctions) {
        this.next = nextOrObserver;
        this.error = opt_error || null;
        this.complete = opt_complete || null;
    } else {
        var observer = nextOrObserver;
        this.next = observer['next'];
        this.error = observer['error'];
        this.complete = observer['complete'];
    }
};
//# sourceMappingURL=observer.js.map


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RequestEndStatus = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Copyright 2017 Google Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * you may not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * You may obtain a copy of the License at
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *   http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * See the License for the specific language governing permissions and
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */
/**
 * @fileoverview Defines methods used to actually send HTTP requests from
 * abstract representations.
 */


exports.addAuthHeader_ = addAuthHeader_;
exports.addVersionHeader_ = addVersionHeader_;
exports.makeRequest = makeRequest;

var _array = __webpack_require__(20);

var array = _interopRequireWildcard(_array);

var _backoff = __webpack_require__(63);

var backoff = _interopRequireWildcard(_backoff);

var _error = __webpack_require__(3);

var errorsExports = _interopRequireWildcard(_error);

var _object = __webpack_require__(7);

var object = _interopRequireWildcard(_object);

var _promise_external = __webpack_require__(5);

var promiseimpl = _interopRequireWildcard(_promise_external);

var _type = __webpack_require__(1);

var type = _interopRequireWildcard(_type);

var _url = __webpack_require__(23);

var UrlUtils = _interopRequireWildcard(_url);

var _xhrio = __webpack_require__(37);

var XhrIoExports = _interopRequireWildcard(_xhrio);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @struct
 * @template T
 */
var NetworkRequest = function () {
    function NetworkRequest(url, method, headers, body, successCodes, additionalRetryCodes, callback, errorCallback, timeout, progressCallback, pool) {
        _classCallCheck(this, NetworkRequest);

        this.pendingXhr_ = null;
        this.backoffId_ = null;
        this.resolve_ = null;
        this.reject_ = null;
        this.canceled_ = false;
        this.appDelete_ = false;
        this.url_ = url;
        this.method_ = method;
        this.headers_ = headers;
        this.body_ = body;
        this.successCodes_ = successCodes.slice();
        this.additionalRetryCodes_ = additionalRetryCodes.slice();
        this.callback_ = callback;
        this.errorCallback_ = errorCallback;
        this.progressCallback_ = progressCallback;
        this.timeout_ = timeout;
        this.pool_ = pool;
        var self = this;
        this.promise_ = promiseimpl.make(function (resolve, reject) {
            self.resolve_ = resolve;
            self.reject_ = reject;
            self.start_();
        });
    }
    /**
     * Actually starts the retry loop.
     */


    _createClass(NetworkRequest, [{
        key: 'start_',
        value: function start_() {
            var self = this;
            function doTheRequest(backoffCallback, canceled) {
                if (canceled) {
                    backoffCallback(false, new RequestEndStatus(false, null, true));
                    return;
                }
                var xhr = self.pool_.createXhrIo();
                self.pendingXhr_ = xhr;
                function progressListener(progressEvent) {
                    var loaded = progressEvent.loaded;
                    var total = progressEvent.lengthComputable ? progressEvent.total : -1;
                    if (self.progressCallback_ !== null) {
                        self.progressCallback_(loaded, total);
                    }
                }
                if (self.progressCallback_ !== null) {
                    xhr.addUploadProgressListener(progressListener);
                }
                xhr.send(self.url_, self.method_, self.body_, self.headers_).then(function (xhr) {
                    if (self.progressCallback_ !== null) {
                        xhr.removeUploadProgressListener(progressListener);
                    }
                    self.pendingXhr_ = null;
                    xhr = xhr;
                    var hitServer = xhr.getErrorCode() === XhrIoExports.ErrorCode.NO_ERROR;
                    var status = xhr.getStatus();
                    if (!hitServer || self.isRetryStatusCode_(status)) {
                        var wasCanceled = xhr.getErrorCode() === XhrIoExports.ErrorCode.ABORT;
                        backoffCallback(false, new RequestEndStatus(false, null, wasCanceled));
                        return;
                    }
                    var successCode = array.contains(self.successCodes_, status);
                    backoffCallback(true, new RequestEndStatus(successCode, xhr));
                });
            }
            /**
             * @param requestWentThrough True if the request eventually went
             *     through, false if it hit the retry limit or was canceled.
             */
            function backoffDone(requestWentThrough, status) {
                var resolve = self.resolve_;
                var reject = self.reject_;
                var xhr = status.xhr;
                if (status.wasSuccessCode) {
                    try {
                        var result = self.callback_(xhr, xhr.getResponseText());
                        if (type.isJustDef(result)) {
                            resolve(result);
                        } else {
                            resolve();
                        }
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    if (xhr !== null) {
                        var err = errorsExports.unknown();
                        err.setServerResponseProp(xhr.getResponseText());
                        if (self.errorCallback_) {
                            reject(self.errorCallback_(xhr, err));
                        } else {
                            reject(err);
                        }
                    } else {
                        if (status.canceled) {
                            var _err = self.appDelete_ ? errorsExports.appDeleted() : errorsExports.canceled();
                            reject(_err);
                        } else {
                            var _err2 = errorsExports.retryLimitExceeded();
                            reject(_err2);
                        }
                    }
                }
            }
            if (this.canceled_) {
                backoffDone(false, new RequestEndStatus(false, null, true));
            } else {
                this.backoffId_ = backoff.start(doTheRequest, backoffDone, this.timeout_);
            }
        }
        /** @inheritDoc */

    }, {
        key: 'getPromise',
        value: function getPromise() {
            return this.promise_;
        }
        /** @inheritDoc */

    }, {
        key: 'cancel',
        value: function cancel(appDelete) {
            this.canceled_ = true;
            this.appDelete_ = appDelete || false;
            if (this.backoffId_ !== null) {
                backoff.stop(this.backoffId_);
            }
            if (this.pendingXhr_ !== null) {
                this.pendingXhr_.abort();
            }
        }
    }, {
        key: 'isRetryStatusCode_',
        value: function isRetryStatusCode_(status) {
            // The codes for which to retry came from this page:
            // https://cloud.google.com/storage/docs/exponential-backoff
            var isExtraRetryCode = array.contains([
            // Request Timeout: web server didn't receive full request in time.
            408,
            // Too Many Requests: you're getting rate-limited, basically.
            429], status);
            var isRequestSpecificRetryCode = array.contains(this.additionalRetryCodes_, status);
            return status >= 500 && status < 600 || isExtraRetryCode || isRequestSpecificRetryCode;
        }
    }]);

    return NetworkRequest;
}();
/**
 * A collection of information about the result of a network request.
 * @param opt_canceled Defaults to false.
 * @struct
 */


var RequestEndStatus = exports.RequestEndStatus = function RequestEndStatus(wasSuccessCode, xhr, opt_canceled) {
    _classCallCheck(this, RequestEndStatus);

    this.wasSuccessCode = wasSuccessCode;
    this.xhr = xhr;
    this.canceled = !!opt_canceled;
};

function addAuthHeader_(headers, authToken) {
    if (authToken !== null && authToken.length > 0) {
        headers['Authorization'] = 'Firebase ' + authToken;
    }
}
function addVersionHeader_(headers) {
    var number = typeof firebase !== 'undefined' ? firebase.SDK_VERSION : 'AppManager';
    headers['X-Firebase-Storage-Version'] = 'webjs/' + number;
}
/**
 * @template T
 */
function makeRequest(requestInfo, authToken, pool) {
    var queryPart = UrlUtils.makeQueryString(requestInfo.urlParams);
    var url = requestInfo.url + queryPart;
    var headers = object.clone(requestInfo.headers);
    addAuthHeader_(headers, authToken);
    addVersionHeader_(headers);
    return new NetworkRequest(url, requestInfo.method, headers, requestInfo.body, requestInfo.successCodes, requestInfo.additionalRetryCodes, requestInfo.handler, requestInfo.errorHandler, requestInfo.timeout, requestInfo.progressCallback, pool);
}
//# sourceMappingURL=request.js.map


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RequestInfo = exports.RequestInfo = function RequestInfo(url, method,
/**
 * Returns the value with which to resolve the request's promise. Only called
 * if the request is successful. Throw from this function to reject the
 * returned Request's promise with the thrown error.
 * Note: The XhrIo passed to this function may be reused after this callback
 * returns. Do not keep a reference to it in any way.
 */
handler, timeout) {
  _classCallCheck(this, RequestInfo);

  this.url = url;
  this.method = method;
  this.handler = handler;
  this.timeout = timeout;
  this.urlParams = {};
  this.headers = {};
  this.body = null;
  this.errorHandler = null;
  /**
   * Called with the current number of bytes uploaded and total size (-1 if not
   * computable) of the request body (i.e. used to report upload progress).
   */
  this.progressCallback = null;
  this.successCodes = [200];
  this.additionalRetryCodes = [];
};
//# sourceMappingURL=requestinfo.js.map


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RequestMap = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Copyright 2017 Google Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * you may not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * You may obtain a copy of the License at
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *   http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * See the License for the specific language governing permissions and
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */


var _object = __webpack_require__(7);

var object = _interopRequireWildcard(_object);

var _constants = __webpack_require__(12);

var constants = _interopRequireWildcard(_constants);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @struct
 */
var RequestMap = exports.RequestMap = function () {
    function RequestMap() {
        _classCallCheck(this, RequestMap);

        this.map_ = {};
        this.id_ = constants.minSafeInteger;
    }
    /**
     * Registers the given request with this map.
     * The request is unregistered when it completes.
     * @param r The request to register.
     */


    _createClass(RequestMap, [{
        key: 'addRequest',
        value: function addRequest(r) {
            var id = this.id_;
            this.id_++;
            this.map_[id] = r;
            var self = this;
            function unmap() {
                delete self.map_[id];
            }
            r.getPromise().then(unmap, unmap);
        }
        /**
         * Cancels all registered requests.
         */

    }, {
        key: 'clear',
        value: function clear() {
            object.forEach(this.map_, function (key, val) {
                if (val) {
                    val.cancel(true);
                }
            });
            this.map_ = {};
        }
    }]);

    return RequestMap;
}();
//# sourceMappingURL=requestmap.js.map


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.NetworkXhrIo = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Copyright 2017 Google Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * you may not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * You may obtain a copy of the License at
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *   http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * See the License for the specific language governing permissions and
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */


var _error = __webpack_require__(3);

var errorsExports = _interopRequireWildcard(_error);

var _object = __webpack_require__(7);

var object = _interopRequireWildcard(_object);

var _promise_external = __webpack_require__(5);

var promiseimpl = _interopRequireWildcard(_promise_external);

var _type = __webpack_require__(1);

var type = _interopRequireWildcard(_type);

var _xhrio = __webpack_require__(37);

var XhrIoExports = _interopRequireWildcard(_xhrio);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * We use this instead of goog.net.XhrIo because goog.net.XhrIo is hyuuuuge and
 * doesn't work in React Native on Android.
 */
var NetworkXhrIo = exports.NetworkXhrIo = function () {
    function NetworkXhrIo() {
        var _this = this;

        _classCallCheck(this, NetworkXhrIo);

        this.sent_ = false;
        this.xhr_ = new XMLHttpRequest();
        this.errorCode_ = XhrIoExports.ErrorCode.NO_ERROR;
        this.sendPromise_ = promiseimpl.make(function (resolve) {
            _this.xhr_.addEventListener('abort', function () {
                _this.errorCode_ = XhrIoExports.ErrorCode.ABORT;
                resolve(_this);
            });
            _this.xhr_.addEventListener('error', function () {
                _this.errorCode_ = XhrIoExports.ErrorCode.NETWORK_ERROR;
                resolve(_this);
            });
            _this.xhr_.addEventListener('load', function () {
                resolve(_this);
            });
        });
    }
    /**
     * @override
     */


    _createClass(NetworkXhrIo, [{
        key: 'send',
        value: function send(url, method, opt_body, opt_headers) {
            var _this2 = this;

            if (this.sent_) {
                throw errorsExports.internalError('cannot .send() more than once');
            }
            this.sent_ = true;
            this.xhr_.open(method, url, true);
            if (type.isDef(opt_headers)) {
                object.forEach(opt_headers, function (key, val) {
                    _this2.xhr_.setRequestHeader(key, val.toString());
                });
            }
            if (type.isDef(opt_body)) {
                this.xhr_.send(opt_body);
            } else {
                this.xhr_.send();
            }
            return this.sendPromise_;
        }
        /**
         * @override
         */

    }, {
        key: 'getErrorCode',
        value: function getErrorCode() {
            if (!this.sent_) {
                throw errorsExports.internalError('cannot .getErrorCode() before sending');
            }
            return this.errorCode_;
        }
        /**
         * @override
         */

    }, {
        key: 'getStatus',
        value: function getStatus() {
            if (!this.sent_) {
                throw errorsExports.internalError('cannot .getStatus() before sending');
            }
            try {
                return this.xhr_.status;
            } catch (e) {
                return -1;
            }
        }
        /**
         * @override
         */

    }, {
        key: 'getResponseText',
        value: function getResponseText() {
            if (!this.sent_) {
                throw errorsExports.internalError('cannot .getResponseText() before sending');
            }
            return this.xhr_.responseText;
        }
        /**
         * Aborts the request.
         * @override
         */

    }, {
        key: 'abort',
        value: function abort() {
            this.xhr_.abort();
        }
        /**
         * @override
         */

    }, {
        key: 'getResponseHeader',
        value: function getResponseHeader(header) {
            return this.xhr_.getResponseHeader(header);
        }
        /**
         * @override
         */

    }, {
        key: 'addUploadProgressListener',
        value: function addUploadProgressListener(listener) {
            if (type.isDef(this.xhr_.upload)) {
                this.xhr_.upload.addEventListener('progress', listener);
            }
        }
        /**
         * @override
         */

    }, {
        key: 'removeUploadProgressListener',
        value: function removeUploadProgressListener(listener) {
            if (type.isDef(this.xhr_.upload)) {
                this.xhr_.upload.removeEventListener('progress', listener);
            }
        }
    }]);

    return NetworkXhrIo;
}();
//# sourceMappingURL=xhrio_network.js.map


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.XhrIoPool = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Copyright 2017 Google Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * you may not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * You may obtain a copy of the License at
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *   http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * See the License for the specific language governing permissions and
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */


var _xhrio_network = __webpack_require__(71);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Factory-like class for creating XhrIo instances.
 */
var XhrIoPool = exports.XhrIoPool = function () {
    function XhrIoPool() {
        _classCallCheck(this, XhrIoPool);
    }

    _createClass(XhrIoPool, [{
        key: 'createXhrIo',
        value: function createXhrIo() {
            return new _xhrio_network.NetworkXhrIo();
        }
    }]);

    return XhrIoPool;
}();
//# sourceMappingURL=xhriopool.js.map


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ServiceInternals = exports.Service = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Copyright 2017 Google Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * you may not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * You may obtain a copy of the License at
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *   http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * See the License for the specific language governing permissions and
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */


var _args = __webpack_require__(19);

var args = _interopRequireWildcard(_args);

var _authwrapper = __webpack_require__(62);

var _location = __webpack_require__(13);

var _promise_external = __webpack_require__(5);

var fbsPromiseImpl = _interopRequireWildcard(_promise_external);

var _request = __webpack_require__(68);

var RequestExports = _interopRequireWildcard(_request);

var _reference = __webpack_require__(38);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A service that provides firebaseStorage.Reference instances.
 * @param opt_url gs:// url to a custom Storage Bucket
 *
 * @struct
 */
var Service = exports.Service = function () {
    function Service(app, pool, url) {
        _classCallCheck(this, Service);

        this.bucket_ = null;

        this.authWrapper_ = new _authwrapper.AuthWrapper(app, function (authWrapper, loc) {
            return new _reference.Reference(authWrapper, loc);
        }, RequestExports.makeRequest, this, pool);
        this.app_ = app;
        if (url != null) {
            this.bucket_ = _location.Location.makeFromBucketSpec(url);
        } else {
            var authWrapperBucket = this.authWrapper_.bucket();
            if (authWrapperBucket != null) {
                this.bucket_ = new _location.Location(authWrapperBucket, '');
            }
        }
        this.internals_ = new ServiceInternals(this);
    }
    /**
     * Returns a firebaseStorage.Reference for the given path in the default
     * bucket.
     */


    _createClass(Service, [{
        key: 'ref',
        value: function (path) {
            args.validate('ref', [args.stringSpec(function (path) {
                if (/^[A-Za-z]+:\/\//.test(path)) {
                    throw 'Expected child path but got a URL, use refFromURL instead.';
                }
            }, true)], arguments);
            if (this.bucket_ == null) {
                throw new Error('No Storage Bucket defined in Firebase Options.');
            }
            var ref = new _reference.Reference(this.authWrapper_, this.bucket_);
            if (path != null) {
                return ref.child(path);
            } else {
                return ref;
            }
        }
        /**
         * Returns a firebaseStorage.Reference object for the given absolute URL,
         * which must be a gs:// or http[s]:// URL.
         */

    }, {
        key: 'refFromURL',
        value: function refFromURL(url) {
            args.validate('refFromURL', [args.stringSpec(function (p) {
                if (!/^[A-Za-z]+:\/\//.test(p)) {
                    throw 'Expected full URL but got a child path, use ref instead.';
                }
                try {
                    _location.Location.makeFromUrl(p);
                } catch (e) {
                    throw 'Expected valid full URL but got an invalid one.';
                }
            }, false)], arguments);
            return new _reference.Reference(this.authWrapper_, url);
        }
    }, {
        key: 'setMaxUploadRetryTime',
        value: function setMaxUploadRetryTime(time) {
            args.validate('setMaxUploadRetryTime', [args.nonNegativeNumberSpec()], arguments);
            this.authWrapper_.setMaxUploadRetryTime(time);
        }
    }, {
        key: 'setMaxOperationRetryTime',
        value: function setMaxOperationRetryTime(time) {
            args.validate('setMaxOperationRetryTime', [args.nonNegativeNumberSpec()], arguments);
            this.authWrapper_.setMaxOperationRetryTime(time);
        }
    }, {
        key: 'maxUploadRetryTime',
        get: function get() {
            return this.authWrapper_.maxUploadRetryTime();
        }
    }, {
        key: 'maxOperationRetryTime',
        get: function get() {
            return this.authWrapper_.maxOperationRetryTime();
        }
    }, {
        key: 'app',
        get: function get() {
            return this.app_;
        }
    }, {
        key: 'INTERNAL',
        get: function get() {
            return this.internals_;
        }
    }]);

    return Service;
}();
/**
 * @struct
 */


var ServiceInternals = exports.ServiceInternals = function () {
    function ServiceInternals(service) {
        _classCallCheck(this, ServiceInternals);

        this.service_ = service;
    }
    /**
     * Called when the associated app is deleted.
     * @see {!fbs.AuthWrapper.prototype.deleteApp}
     */


    _createClass(ServiceInternals, [{
        key: 'delete',
        value: function _delete() {
            this.service_.authWrapper_.deleteApp();
            return fbsPromiseImpl.resolve(undefined);
        }
    }]);

    return ServiceInternals;
}();
//# sourceMappingURL=service.js.map


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UploadTask = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Copyright 2017 Google Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * you may not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * You may obtain a copy of the License at
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *   http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * See the License for the specific language governing permissions and
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */
/**
 * @fileoverview Defines types for interacting with blob transfer tasks.
 */


var _taskenums = __webpack_require__(36);

var fbsTaskEnums = _interopRequireWildcard(_taskenums);

var _observer = __webpack_require__(67);

var _tasksnapshot = __webpack_require__(75);

var _args = __webpack_require__(19);

var fbsArgs = _interopRequireWildcard(_args);

var _array = __webpack_require__(20);

var fbsArray = _interopRequireWildcard(_array);

var _async = __webpack_require__(61);

var _error = __webpack_require__(3);

var errors = _interopRequireWildcard(_error);

var _promise_external = __webpack_require__(5);

var fbsPromiseimpl = _interopRequireWildcard(_promise_external);

var _requests = __webpack_require__(35);

var fbsRequests = _interopRequireWildcard(_requests);

var _type = __webpack_require__(1);

var typeUtils = _interopRequireWildcard(_type);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represents a blob being uploaded. Can be used to pause/resume/cancel the
 * upload and manage callbacks for various events.
 */
var UploadTask = exports.UploadTask = function () {
    /**
     * @param ref The firebaseStorage.Reference object this task came
     *     from, untyped to avoid cyclic dependencies.
     * @param blob The blob to upload.
     */
    function UploadTask(ref, authWrapper, location, mappings, blob) {
        var _this = this;

        var metadata = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;

        _classCallCheck(this, UploadTask);

        this.transferred_ = 0;
        this.needToFetchStatus_ = false;
        this.needToFetchMetadata_ = false;
        this.observers_ = [];
        this.error_ = null;
        this.uploadUrl_ = null;
        this.request_ = null;
        this.chunkMultiplier_ = 1;
        this.resolve_ = null;
        this.reject_ = null;
        this.ref_ = ref;
        this.authWrapper_ = authWrapper;
        this.location_ = location;
        this.blob_ = blob;
        this.metadata_ = metadata;
        this.mappings_ = mappings;
        this.resumable_ = this.shouldDoResumable_(this.blob_);
        this.state_ = _taskenums.InternalTaskState.RUNNING;
        this.errorHandler_ = function (error) {
            _this.request_ = null;
            _this.chunkMultiplier_ = 1;
            if (error.codeEquals(errors.Code.CANCELED)) {
                _this.needToFetchStatus_ = true;
                _this.completeTransitions_();
            } else {
                _this.error_ = error;
                _this.transition_(_taskenums.InternalTaskState.ERROR);
            }
        };
        this.metadataErrorHandler_ = function (error) {
            _this.request_ = null;
            if (error.codeEquals(errors.Code.CANCELED)) {
                _this.completeTransitions_();
            } else {
                _this.error_ = error;
                _this.transition_(_taskenums.InternalTaskState.ERROR);
            }
        };
        this.promise_ = fbsPromiseimpl.make(function (resolve, reject) {
            _this.resolve_ = resolve;
            _this.reject_ = reject;
            _this.start_();
        });
        // Prevent uncaught rejections on the internal promise from bubbling out
        // to the top level with a dummy handler.
        this.promise_.then(null, function () {});
    }

    _createClass(UploadTask, [{
        key: 'makeProgressCallback_',
        value: function makeProgressCallback_() {
            var _this2 = this;

            var sizeBefore = this.transferred_;
            return function (loaded) {
                _this2.updateProgress_(sizeBefore + loaded);
            };
        }
    }, {
        key: 'shouldDoResumable_',
        value: function shouldDoResumable_(blob) {
            return blob.size() > 256 * 1024;
        }
    }, {
        key: 'start_',
        value: function start_() {
            if (this.state_ !== _taskenums.InternalTaskState.RUNNING) {
                // This can happen if someone pauses us in a resume callback, for example.
                return;
            }
            if (this.request_ !== null) {
                return;
            }
            if (this.resumable_) {
                if (this.uploadUrl_ === null) {
                    this.createResumable_();
                } else {
                    if (this.needToFetchStatus_) {
                        this.fetchStatus_();
                    } else {
                        if (this.needToFetchMetadata_) {
                            // Happens if we miss the metadata on upload completion.
                            this.fetchMetadata_();
                        } else {
                            this.continueUpload_();
                        }
                    }
                }
            } else {
                this.oneShotUpload_();
            }
        }
    }, {
        key: 'resolveToken_',
        value: function resolveToken_(callback) {
            var _this3 = this;

            this.authWrapper_.getAuthToken().then(function (authToken) {
                switch (_this3.state_) {
                    case _taskenums.InternalTaskState.RUNNING:
                        callback(authToken);
                        break;
                    case _taskenums.InternalTaskState.CANCELING:
                        _this3.transition_(_taskenums.InternalTaskState.CANCELED);
                        break;
                    case _taskenums.InternalTaskState.PAUSING:
                        _this3.transition_(_taskenums.InternalTaskState.PAUSED);
                        break;
                    default:
                }
            });
        }
        // TODO(andysoto): assert false

    }, {
        key: 'createResumable_',
        value: function createResumable_() {
            var _this4 = this;

            this.resolveToken_(function (authToken) {
                var requestInfo = fbsRequests.createResumableUpload(_this4.authWrapper_, _this4.location_, _this4.mappings_, _this4.blob_, _this4.metadata_);
                var createRequest = _this4.authWrapper_.makeRequest(requestInfo, authToken);
                _this4.request_ = createRequest;
                createRequest.getPromise().then(function (url) {
                    _this4.request_ = null;
                    _this4.uploadUrl_ = url;
                    _this4.needToFetchStatus_ = false;
                    _this4.completeTransitions_();
                }, _this4.errorHandler_);
            });
        }
    }, {
        key: 'fetchStatus_',
        value: function fetchStatus_() {
            var _this5 = this;

            // TODO(andysoto): assert(this.uploadUrl_ !== null);
            var url = this.uploadUrl_;
            this.resolveToken_(function (authToken) {
                var requestInfo = fbsRequests.getResumableUploadStatus(_this5.authWrapper_, _this5.location_, url, _this5.blob_);
                var statusRequest = _this5.authWrapper_.makeRequest(requestInfo, authToken);
                _this5.request_ = statusRequest;
                statusRequest.getPromise().then(function (status) {
                    status = status;
                    _this5.request_ = null;
                    _this5.updateProgress_(status.current);
                    _this5.needToFetchStatus_ = false;
                    if (status.finalized) {
                        _this5.needToFetchMetadata_ = true;
                    }
                    _this5.completeTransitions_();
                }, _this5.errorHandler_);
            });
        }
    }, {
        key: 'continueUpload_',
        value: function continueUpload_() {
            var _this6 = this;

            var chunkSize = fbsRequests.resumableUploadChunkSize * this.chunkMultiplier_;
            var status = new fbsRequests.ResumableUploadStatus(this.transferred_, this.blob_.size());
            // TODO(andysoto): assert(this.uploadUrl_ !== null);
            var url = this.uploadUrl_;
            this.resolveToken_(function (authToken) {
                var requestInfo = void 0;
                try {
                    requestInfo = fbsRequests.continueResumableUpload(_this6.location_, _this6.authWrapper_, url, _this6.blob_, chunkSize, _this6.mappings_, status, _this6.makeProgressCallback_());
                } catch (e) {
                    _this6.error_ = e;
                    _this6.transition_(_taskenums.InternalTaskState.ERROR);
                    return;
                }
                var uploadRequest = _this6.authWrapper_.makeRequest(requestInfo, authToken);
                _this6.request_ = uploadRequest;
                uploadRequest.getPromise().then(function (newStatus) {
                    _this6.increaseMultiplier_();
                    _this6.request_ = null;
                    _this6.updateProgress_(newStatus.current);
                    if (newStatus.finalized) {
                        _this6.metadata_ = newStatus.metadata;
                        _this6.transition_(_taskenums.InternalTaskState.SUCCESS);
                    } else {
                        _this6.completeTransitions_();
                    }
                }, _this6.errorHandler_);
            });
        }
    }, {
        key: 'increaseMultiplier_',
        value: function increaseMultiplier_() {
            var currentSize = fbsRequests.resumableUploadChunkSize * this.chunkMultiplier_;
            // Max chunk size is 32M.
            if (currentSize < 32 * 1024 * 1024) {
                this.chunkMultiplier_ *= 2;
            }
        }
    }, {
        key: 'fetchMetadata_',
        value: function fetchMetadata_() {
            var _this7 = this;

            this.resolveToken_(function (authToken) {
                var requestInfo = fbsRequests.getMetadata(_this7.authWrapper_, _this7.location_, _this7.mappings_);
                var metadataRequest = _this7.authWrapper_.makeRequest(requestInfo, authToken);
                _this7.request_ = metadataRequest;
                metadataRequest.getPromise().then(function (metadata) {
                    _this7.request_ = null;
                    _this7.metadata_ = metadata;
                    _this7.transition_(_taskenums.InternalTaskState.SUCCESS);
                }, _this7.metadataErrorHandler_);
            });
        }
    }, {
        key: 'oneShotUpload_',
        value: function oneShotUpload_() {
            var _this8 = this;

            this.resolveToken_(function (authToken) {
                var requestInfo = fbsRequests.multipartUpload(_this8.authWrapper_, _this8.location_, _this8.mappings_, _this8.blob_, _this8.metadata_);
                var multipartRequest = _this8.authWrapper_.makeRequest(requestInfo, authToken);
                _this8.request_ = multipartRequest;
                multipartRequest.getPromise().then(function (metadata) {
                    _this8.request_ = null;
                    _this8.metadata_ = metadata;
                    _this8.updateProgress_(_this8.blob_.size());
                    _this8.transition_(_taskenums.InternalTaskState.SUCCESS);
                }, _this8.errorHandler_);
            });
        }
    }, {
        key: 'updateProgress_',
        value: function updateProgress_(transferred) {
            var old = this.transferred_;
            this.transferred_ = transferred;
            // A progress update can make the "transferred" value smaller (e.g. a
            // partial upload not completed by server, after which the "transferred"
            // value may reset to the value at the beginning of the request).
            if (this.transferred_ !== old) {
                this.notifyObservers_();
            }
        }
    }, {
        key: 'transition_',
        value: function transition_(state) {
            if (this.state_ === state) {
                return;
            }
            switch (state) {
                case _taskenums.InternalTaskState.CANCELING:
                    // TODO(andysoto):
                    // assert(this.state_ === InternalTaskState.RUNNING ||
                    //        this.state_ === InternalTaskState.PAUSING);
                    this.state_ = state;
                    if (this.request_ !== null) {
                        this.request_.cancel();
                    }
                    break;
                case _taskenums.InternalTaskState.PAUSING:
                    // TODO(andysoto):
                    // assert(this.state_ === InternalTaskState.RUNNING);
                    this.state_ = state;
                    if (this.request_ !== null) {
                        this.request_.cancel();
                    }
                    break;
                case _taskenums.InternalTaskState.RUNNING:
                    // TODO(andysoto):
                    // assert(this.state_ === InternalTaskState.PAUSED ||
                    //        this.state_ === InternalTaskState.PAUSING);
                    var wasPaused = this.state_ === _taskenums.InternalTaskState.PAUSED;
                    this.state_ = state;
                    if (wasPaused) {
                        this.notifyObservers_();
                        this.start_();
                    }
                    break;
                case _taskenums.InternalTaskState.PAUSED:
                    // TODO(andysoto):
                    // assert(this.state_ === InternalTaskState.PAUSING);
                    this.state_ = state;
                    this.notifyObservers_();
                    break;
                case _taskenums.InternalTaskState.CANCELED:
                    // TODO(andysoto):
                    // assert(this.state_ === InternalTaskState.PAUSED ||
                    //        this.state_ === InternalTaskState.CANCELING);
                    this.error_ = errors.canceled();
                    this.state_ = state;
                    this.notifyObservers_();
                    break;
                case _taskenums.InternalTaskState.ERROR:
                    // TODO(andysoto):
                    // assert(this.state_ === InternalTaskState.RUNNING ||
                    //        this.state_ === InternalTaskState.PAUSING ||
                    //        this.state_ === InternalTaskState.CANCELING);
                    this.state_ = state;
                    this.notifyObservers_();
                    break;
                case _taskenums.InternalTaskState.SUCCESS:
                    // TODO(andysoto):
                    // assert(this.state_ === InternalTaskState.RUNNING ||
                    //        this.state_ === InternalTaskState.PAUSING ||
                    //        this.state_ === InternalTaskState.CANCELING);
                    this.state_ = state;
                    this.notifyObservers_();
                    break;
            }
        }
    }, {
        key: 'completeTransitions_',
        value: function completeTransitions_() {
            switch (this.state_) {
                case _taskenums.InternalTaskState.PAUSING:
                    this.transition_(_taskenums.InternalTaskState.PAUSED);
                    break;
                case _taskenums.InternalTaskState.CANCELING:
                    this.transition_(_taskenums.InternalTaskState.CANCELED);
                    break;
                case _taskenums.InternalTaskState.RUNNING:
                    this.start_();
                    break;
                default:
                    // TODO(andysoto): assert(false);
                    break;
            }
        }
    }, {
        key: 'on',

        /**
         * Adds a callback for an event.
         * @param type The type of event to listen for.
         */
        value: function on(type) {
            var nextOrObserver = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
            var error = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
            var completed = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;

            var nextOrObserverMessage = 'Expected a function or an Object with one of ' + '`next`, `error`, `complete` properties.';
            var nextValidator = fbsArgs.nullFunctionSpec(true).validator;
            var observerValidator = fbsArgs.looseObjectSpec(null, true).validator;
            function nextOrObserverValidator(p) {
                try {
                    nextValidator(p);
                    return;
                } catch (e) {}
                try {
                    observerValidator(p);
                    var anyDefined = typeUtils.isJustDef(p['next']) || typeUtils.isJustDef(p['error']) || typeUtils.isJustDef(p['complete']);
                    if (!anyDefined) {
                        throw '';
                    }
                } catch (e) {
                    throw nextOrObserverMessage;
                }
            }
            var specs = [fbsArgs.stringSpec(function () {
                if (type !== _taskenums.TaskEvent.STATE_CHANGED) {
                    throw 'Expected one of the event types: [' + _taskenums.TaskEvent.STATE_CHANGED + '].';
                }
            }), fbsArgs.looseObjectSpec(nextOrObserverValidator, true), fbsArgs.nullFunctionSpec(true), fbsArgs.nullFunctionSpec(true)];
            fbsArgs.validate('on', specs, arguments);
            var self = this;
            function makeBinder(specs) {
                return function (nextOrObserver, error) {
                    if (specs !== null) {
                        fbsArgs.validate('on', specs, arguments);
                    }
                    var observer = new _observer.Observer(nextOrObserver, error, completed);
                    self.addObserver_(observer);
                    return function () {
                        self.removeObserver_(observer);
                    };
                };
            }

            var binderSpecs = [fbsArgs.looseObjectSpec(function (p) {
                if (p === null) {
                    throw nextOrObserverMessage;
                }
                nextOrObserverValidator(p);
            }), fbsArgs.nullFunctionSpec(true), fbsArgs.nullFunctionSpec(true)];
            var typeOnly = !(typeUtils.isJustDef(nextOrObserver) || typeUtils.isJustDef(error) || typeUtils.isJustDef(completed));
            if (typeOnly) {
                return makeBinder(binderSpecs);
            } else {
                return makeBinder(null)(nextOrObserver, error, completed);
            }
        }
        /**
         * This object behaves like a Promise, and resolves with its snapshot data
         * when the upload completes.
         *     The fulfillment callback. Promise chaining works as normal.
         * @param onRejected The rejection callback.
         */

    }, {
        key: 'then',
        value: function then(onFulfilled, onRejected) {
            return this.promise_.then(onFulfilled, onRejected);
        }
        /**
         * Equivalent to calling `then(null, onRejected)`.
         */

    }, {
        key: 'catch',
        value: function _catch(onRejected) {
            return this.then(null, onRejected);
        }
        /**
         * Adds the given observer.
         */

    }, {
        key: 'addObserver_',
        value: function addObserver_(observer) {
            this.observers_.push(observer);
            this.notifyObserver_(observer);
        }
        /**
         * Removes the given observer.
         */

    }, {
        key: 'removeObserver_',
        value: function removeObserver_(observer) {
            fbsArray.remove(this.observers_, observer);
        }
    }, {
        key: 'notifyObservers_',
        value: function notifyObservers_() {
            var _this9 = this;

            this.finishPromise_();
            var observers = fbsArray.clone(this.observers_);
            observers.forEach(function (observer) {
                _this9.notifyObserver_(observer);
            });
        }
    }, {
        key: 'finishPromise_',
        value: function finishPromise_() {
            if (this.resolve_ !== null) {
                var triggered = true;
                switch (fbsTaskEnums.taskStateFromInternalTaskState(this.state_)) {
                    case _taskenums.TaskState.SUCCESS:
                        (0, _async.async)(this.resolve_.bind(null, this.snapshot))();
                        break;
                    case _taskenums.TaskState.CANCELED:
                    case _taskenums.TaskState.ERROR:
                        var toCall = this.reject_;
                        (0, _async.async)(toCall.bind(null, this.error_))();
                        break;
                    default:
                        triggered = false;
                        break;
                }
                if (triggered) {
                    this.resolve_ = null;
                    this.reject_ = null;
                }
            }
        }
    }, {
        key: 'notifyObserver_',
        value: function notifyObserver_(observer) {
            var externalState = fbsTaskEnums.taskStateFromInternalTaskState(this.state_);
            switch (externalState) {
                case _taskenums.TaskState.RUNNING:
                case _taskenums.TaskState.PAUSED:
                    if (observer.next !== null) {
                        (0, _async.async)(observer.next.bind(observer, this.snapshot))();
                    }
                    break;
                case _taskenums.TaskState.SUCCESS:
                    if (observer.complete !== null) {
                        (0, _async.async)(observer.complete.bind(observer))();
                    }
                    break;
                case _taskenums.TaskState.CANCELED:
                case _taskenums.TaskState.ERROR:
                    if (observer.error !== null) {
                        (0, _async.async)(observer.error.bind(observer, this.error_))();
                    }
                    break;
                default:
                    // TODO(andysoto): assert(false);
                    if (observer.error !== null) {
                        (0, _async.async)(observer.error.bind(observer, this.error_))();
                    }
            }
        }
        /**
         * Resumes a paused task. Has no effect on a currently running or failed task.
         * @return True if the operation took effect, false if ignored.
         */

    }, {
        key: 'resume',
        value: function resume() {
            fbsArgs.validate('resume', [], arguments);
            var valid = this.state_ === _taskenums.InternalTaskState.PAUSED || this.state_ === _taskenums.InternalTaskState.PAUSING;
            if (valid) {
                this.transition_(_taskenums.InternalTaskState.RUNNING);
            }
            return valid;
        }
        /**
         * Pauses a currently running task. Has no effect on a paused or failed task.
         * @return True if the operation took effect, false if ignored.
         */

    }, {
        key: 'pause',
        value: function pause() {
            fbsArgs.validate('pause', [], arguments);
            var valid = this.state_ === _taskenums.InternalTaskState.RUNNING;
            if (valid) {
                this.transition_(_taskenums.InternalTaskState.PAUSING);
            }
            return valid;
        }
        /**
         * Cancels a currently running or paused task. Has no effect on a complete or
         * failed task.
         * @return True if the operation took effect, false if ignored.
         */

    }, {
        key: 'cancel',
        value: function cancel() {
            fbsArgs.validate('cancel', [], arguments);
            var valid = this.state_ === _taskenums.InternalTaskState.RUNNING || this.state_ === _taskenums.InternalTaskState.PAUSING;
            if (valid) {
                this.transition_(_taskenums.InternalTaskState.CANCELING);
            }
            return valid;
        }
    }, {
        key: 'snapshot',
        get: function get() {
            var externalState = fbsTaskEnums.taskStateFromInternalTaskState(this.state_);
            return new _tasksnapshot.UploadTaskSnapshot(this.transferred_, this.blob_.size(), externalState, this.metadata_, this, this.ref_);
        }
    }]);

    return UploadTask;
}();
//# sourceMappingURL=task.js.map


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! @license Firebase v4.0.0
Build: rev-c054dab
Terms: https://firebase.google.com/terms/ */



Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UploadTaskSnapshot = exports.UploadTaskSnapshot = function () {
    function UploadTaskSnapshot(bytesTransferred, totalBytes, state, metadata, task, ref) {
        _classCallCheck(this, UploadTaskSnapshot);

        this.bytesTransferred = bytesTransferred;
        this.totalBytes = totalBytes;
        this.state = state;
        this.metadata = metadata;
        this.task = task;
        this.ref = ref;
    }

    _createClass(UploadTaskSnapshot, [{
        key: 'downloadURL',
        get: function get() {
            if (this.metadata !== null) {
                var urls = this.metadata['downloadURLs'];
                if (urls != null && urls[0] != null) {
                    return urls[0];
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }
    }]);

    return UploadTaskSnapshot;
}();
//# sourceMappingURL=tasksnapshot.js.map


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Inlined PropTypes, there is propType checking ATM.
// tslint:disable-next-line:no-empty
function proptype() { }
proptype.isRequired = proptype;
var getProptype = function () { return proptype; };
var PropTypes = {
    any: getProptype,
    array: proptype,
    arrayOf: getProptype,
    bool: proptype,
    checkPropTypes: function () { return null; },
    element: getProptype,
    func: proptype,
    instanceOf: getProptype,
    node: getProptype,
    number: proptype,
    object: proptype,
    objectOf: getProptype,
    oneOf: getProptype,
    oneOfType: getProptype,
    shape: getProptype,
    string: proptype,
    symbol: proptype
};
exports.default = PropTypes;


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * borrowed React SVGDOMPropertyConfig
 * @link https://github.com/facebook/react/blob/c78464f8ea9a5b00ec80252d20a71a1482210e57/src/renderers/dom/shared/SVGDOMPropertyConfig.js
 */
exports.default = {
    accentHeight: 'accent-height',
    accumulate: 0,
    additive: 0,
    alignmentBaseline: 'alignment-baseline',
    allowReorder: 'allowReorder',
    alphabetic: 0,
    amplitude: 0,
    arabicForm: 'arabic-form',
    ascent: 0,
    attributeName: 'attributeName',
    attributeType: 'attributeType',
    autoReverse: 'autoReverse',
    azimuth: 0,
    baseFrequency: 'baseFrequency',
    baseProfile: 'baseProfile',
    baselineShift: 'baseline-shift',
    bbox: 0,
    begin: 0,
    bias: 0,
    by: 0,
    calcMode: 'calcMode',
    capHeight: 'cap-height',
    clip: 0,
    clipPath: 'clip-path',
    clipPathUnits: 'clipPathUnits',
    clipRule: 'clip-rule',
    colorInterpolation: 'color-interpolation',
    colorInterpolationFilters: 'color-interpolation-filters',
    colorProfile: 'color-profile',
    colorRendering: 'color-rendering',
    contentScriptType: 'contentScriptType',
    contentStyleType: 'contentStyleType',
    cursor: 0,
    cx: 0,
    cy: 0,
    d: 0,
    decelerate: 0,
    descent: 0,
    diffuseConstant: 'diffuseConstant',
    direction: 0,
    display: 0,
    divisor: 0,
    dominantBaseline: 'dominant-baseline',
    dur: 0,
    dx: 0,
    dy: 0,
    edgeMode: 'edgeMode',
    elevation: 0,
    enableBackground: 'enable-background',
    end: 0,
    exponent: 0,
    externalResourcesRequired: 'externalResourcesRequired',
    fill: 0,
    fillOpacity: 'fill-opacity',
    fillRule: 'fill-rule',
    filter: 0,
    filterRes: 'filterRes',
    filterUnits: 'filterUnits',
    floodColor: 'flood-color',
    floodOpacity: 'flood-opacity',
    focusable: 0,
    fontFamily: 'font-family',
    fontSize: 'font-size',
    fontSizeAdjust: 'font-size-adjust',
    fontStretch: 'font-stretch',
    fontStyle: 'font-style',
    fontVariant: 'font-variant',
    fontWeight: 'font-weight',
    format: 0,
    from: 0,
    fx: 0,
    fy: 0,
    g1: 0,
    g2: 0,
    glyphName: 'glyph-name',
    glyphOrientationHorizontal: 'glyph-orientation-horizontal',
    glyphOrientationVertical: 'glyph-orientation-vertical',
    glyphRef: 'glyphRef',
    gradientTransform: 'gradientTransform',
    gradientUnits: 'gradientUnits',
    hanging: 0,
    horizAdvX: 'horiz-adv-x',
    horizOriginX: 'horiz-origin-x',
    ideographic: 0,
    imageRendering: 'image-rendering',
    in: 0,
    in2: 0,
    intercept: 0,
    k: 0,
    k1: 0,
    k2: 0,
    k3: 0,
    k4: 0,
    kernelMatrix: 'kernelMatrix',
    kernelUnitLength: 'kernelUnitLength',
    kerning: 0,
    keyPoints: 'keyPoints',
    keySplines: 'keySplines',
    keyTimes: 'keyTimes',
    lengthAdjust: 'lengthAdjust',
    letterSpacing: 'letter-spacing',
    lightingColor: 'lighting-color',
    limitingConeAngle: 'limitingConeAngle',
    local: 0,
    markerEnd: 'marker-end',
    markerHeight: 'markerHeight',
    markerMid: 'marker-mid',
    markerStart: 'marker-start',
    markerUnits: 'markerUnits',
    markerWidth: 'markerWidth',
    mask: 0,
    maskContentUnits: 'maskContentUnits',
    maskUnits: 'maskUnits',
    mathematical: 0,
    mode: 0,
    numOctaves: 'numOctaves',
    offset: 0,
    opacity: 0,
    operator: 0,
    order: 0,
    orient: 0,
    orientation: 0,
    origin: 0,
    overflow: 0,
    overlinePosition: 'overline-position',
    overlineThickness: 'overline-thickness',
    paintOrder: 'paint-order',
    panose1: 'panose-1',
    pathLength: 'pathLength',
    patternContentUnits: 'patternContentUnits',
    patternTransform: 'patternTransform',
    patternUnits: 'patternUnits',
    pointerEvents: 'pointer-events',
    points: 0,
    pointsAtX: 'pointsAtX',
    pointsAtY: 'pointsAtY',
    pointsAtZ: 'pointsAtZ',
    preserveAlpha: 'preserveAlpha',
    preserveAspectRatio: 'preserveAspectRatio',
    primitiveUnits: 'primitiveUnits',
    r: 0,
    radius: 0,
    refX: 'refX',
    refY: 'refY',
    renderingIntent: 'rendering-intent',
    repeatCount: 'repeatCount',
    repeatDur: 'repeatDur',
    requiredExtensions: 'requiredExtensions',
    requiredFeatures: 'requiredFeatures',
    restart: 0,
    result: 0,
    rotate: 0,
    rx: 0,
    ry: 0,
    scale: 0,
    seed: 0,
    shapeRendering: 'shape-rendering',
    slope: 0,
    spacing: 0,
    specularConstant: 'specularConstant',
    specularExponent: 'specularExponent',
    speed: 0,
    spreadMethod: 'spreadMethod',
    startOffset: 'startOffset',
    stdDeviation: 'stdDeviation',
    stemh: 0,
    stemv: 0,
    stitchTiles: 'stitchTiles',
    stopColor: 'stop-color',
    stopOpacity: 'stop-opacity',
    strikethroughPosition: 'strikethrough-position',
    strikethroughThickness: 'strikethrough-thickness',
    string: 0,
    stroke: 0,
    strokeDasharray: 'stroke-dasharray',
    strokeDashoffset: 'stroke-dashoffset',
    strokeLinecap: 'stroke-linecap',
    strokeLinejoin: 'stroke-linejoin',
    strokeMiterlimit: 'stroke-miterlimit',
    strokeOpacity: 'stroke-opacity',
    strokeWidth: 'stroke-width',
    surfaceScale: 'surfaceScale',
    systemLanguage: 'systemLanguage',
    tableValues: 'tableValues',
    targetX: 'targetX',
    targetY: 'targetY',
    textAnchor: 'text-anchor',
    textDecoration: 'text-decoration',
    textLength: 'textLength',
    textRendering: 'text-rendering',
    to: 0,
    transform: 0,
    u1: 0,
    u2: 0,
    underlinePosition: 'underline-position',
    underlineThickness: 'underline-thickness',
    unicode: 0,
    unicodeBidi: 'unicode-bidi',
    unicodeRange: 'unicode-range',
    unitsPerEm: 'units-per-em',
    vAlphabetic: 'v-alphabetic',
    vHanging: 'v-hanging',
    vIdeographic: 'v-ideographic',
    vMathematical: 'v-mathematical',
    values: 0,
    vectorEffect: 'vector-effect',
    version: 0,
    vertAdvY: 'vert-adv-y',
    vertOriginX: 'vert-origin-x',
    vertOriginY: 'vert-origin-y',
    viewBox: 'viewBox',
    viewTarget: 'viewTarget',
    visibility: 0,
    widths: 0,
    wordSpacing: 'word-spacing',
    writingMode: 'writing-mode',
    x: 0,
    x1: 0,
    x2: 0,
    xChannelSelector: 'xChannelSelector',
    xHeight: 'x-height',
    xlinkActuate: 'xlink:actuate',
    xlinkArcrole: 'xlink:arcrole',
    xlinkHref: 'xlink:href',
    xlinkRole: 'xlink:role',
    xlinkShow: 'xlink:show',
    xlinkTitle: 'xlink:title',
    xlinkType: 'xlink:type',
    xmlBase: 'xml:base',
    // xmlns: 0,
    xmlLang: 'xml:lang',
    xmlSpace: 'xml:space',
    xmlnsXlink: 'xmlns:xlink',
    y: 0,
    y1: 0,
    y2: 0,
    yChannelSelector: 'yChannelSelector',
    z: 0,
    zoomAndPan: 'zoomAndPan'
};


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var inferno_1 = __webpack_require__(26);
exports.cloneVNode = inferno_1.cloneVNode;
exports.createVNode = inferno_1.createVNode;
exports.EMPTY_OBJ = inferno_1.EMPTY_OBJ;
exports.findDOMNode = inferno_1.findDOMNode;
exports.render = inferno_1.render;
var inferno_component_1 = __webpack_require__(39);
exports.Component = inferno_component_1.default;
var inferno_create_class_1 = __webpack_require__(82);
exports.createClass = inferno_create_class_1.default;
var inferno_create_element_1 = __webpack_require__(84);
var inferno_shared_1 = __webpack_require__(0);
exports.NO_OP = inferno_shared_1.NO_OP;
var isValidElement_1 = __webpack_require__(79);
exports.isValidElement = isValidElement_1.default;
var PropTypes_1 = __webpack_require__(76);
exports.PropTypes = PropTypes_1.default;
var SVGDOMPropertyConfig_1 = __webpack_require__(77);
inferno_1.options.findDOMNodeEnabled = true;
function unmountComponentAtNode(container) {
    inferno_1.render(null, container);
    return true;
}
exports.unmountComponentAtNode = unmountComponentAtNode;
var ARR = [];
var Children = {
    map: function (children, fn, ctx) {
        if (inferno_shared_1.isNullOrUndef(children)) {
            return children;
        }
        children = Children.toArray(children);
        if (ctx && ctx !== children) {
            fn = fn.bind(ctx);
        }
        return children.map(fn);
    },
    forEach: function (children, fn, ctx) {
        if (inferno_shared_1.isNullOrUndef(children)) {
            return;
        }
        children = Children.toArray(children);
        if (ctx && ctx !== children) {
            fn = fn.bind(ctx);
        }
        for (var i = 0, len = children.length; i < len; i++) {
            fn(children[i], i, children);
        }
    },
    count: function (children) {
        children = Children.toArray(children);
        return children.length;
    },
    only: function (children) {
        children = Children.toArray(children);
        if (children.length !== 1) {
            throw new Error('Children.only() expects only one child.');
        }
        return children[0];
    },
    toArray: function (children) {
        if (inferno_shared_1.isNullOrUndef(children)) {
            return [];
        }
        return inferno_shared_1.isArray(children) ? children : ARR.concat(children);
    }
};
exports.Children = Children;
inferno_component_1.default.prototype.isReactComponent = {};
var currentComponent = null;
inferno_1.options.beforeRender = function (component) {
    currentComponent = component;
};
inferno_1.options.afterRender = function () {
    currentComponent = null;
};
var version = '15.4.2';
exports.version = version;
function normalizeProps(name, props) {
    if ((name === 'input' || name === 'textarea') && props.type !== 'radio' && props.onChange) {
        var type = props.type;
        var eventName = void 0;
        if (type === 'checkbox') {
            eventName = 'onclick';
        }
        else if (type === 'file') {
            eventName = 'onchange';
        }
        else {
            eventName = 'oninput';
        }
        if (!props[eventName]) {
            props[eventName] = props.onChange;
            delete props.onChange;
        }
    }
    for (var prop in props) {
        if (prop === 'onDoubleClick') {
            props.onDblClick = props[prop];
            delete props[prop];
        }
        if (prop === 'htmlFor') {
            props.for = props[prop];
            delete props[prop];
        }
        var mappedProp = SVGDOMPropertyConfig_1.default[prop];
        if (mappedProp && mappedProp !== prop) {
            props[mappedProp] = props[prop];
            delete props[prop];
        }
    }
}
// we need to add persist() to Event (as React has it for synthetic events)
// this is a hack and we really shouldn't be modifying a global object this way,
// but there isn't a performant way of doing this apart from trying to proxy
// every prop event that starts with "on", i.e. onClick or onKeyPress
// but in reality devs use onSomething for many things, not only for
// input events
if (typeof Event !== 'undefined' && !Event.prototype.persist) {
    // tslint:disable-next-line:no-empty
    Event.prototype.persist = function () { };
}
function iterableToArray(iterable) {
    var iterStep;
    var tmpArr = [];
    do {
        iterStep = iterable.next();
        if (iterStep.value) {
            tmpArr.push(iterStep.value);
        }
    } while (!iterStep.done);
    return tmpArr;
}
var hasSymbolSupport = typeof Symbol !== 'undefined';
var injectStringRefs = function (originalFunction) {
    return function (name, _props) {
        var children = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            children[_i - 2] = arguments[_i];
        }
        var props = _props || {};
        var ref = props.ref;
        if (typeof ref === 'string' && !inferno_shared_1.isNull(currentComponent)) {
            currentComponent.refs = currentComponent.refs || {};
            props.ref = function (val) {
                this.refs[ref] = val;
            }.bind(currentComponent);
        }
        if (typeof name === 'string') {
            normalizeProps(name, props);
        }
        // React supports iterable children, in addition to Array-like
        if (hasSymbolSupport) {
            for (var i = 0, len = children.length; i < len; i++) {
                var child = children[i];
                if (child && !inferno_shared_1.isArray(child) && !inferno_shared_1.isString(child) && inferno_shared_1.isFunction(child[Symbol.iterator])) {
                    children[i] = iterableToArray(child[Symbol.iterator]());
                }
            }
        }
        var vnode = originalFunction.apply(void 0, [name, props].concat(children));
        if (vnode.className) {
            vnode.props = vnode.props || {};
            vnode.props.className = vnode.className;
        }
        return vnode;
    };
};
var createElement = injectStringRefs(inferno_create_element_1.default);
exports.createElement = createElement;
var cloneElement = injectStringRefs(inferno_1.cloneVNode);
exports.cloneElement = cloneElement;
var oldCreateVNode = inferno_1.options.createVNode;
inferno_1.options.createVNode = function (vNode) {
    var children = vNode.children;
    var props = vNode.props;
    if (inferno_shared_1.isNullOrUndef(props)) {
        props = vNode.props = {};
    }
    if (!inferno_shared_1.isNullOrUndef(children) && inferno_shared_1.isNullOrUndef(props.children)) {
        props.children = children;
    }
    if (oldCreateVNode) {
        oldCreateVNode(vNode);
    }
};
// Credit: preact-compat - https://github.com/developit/preact-compat :)
function shallowDiffers(a, b) {
    for (var i in a) {
        if (!(i in b)) {
            return true;
        }
    }
    for (var i in b) {
        if (a[i] !== b[i]) {
            return true;
        }
    }
    return false;
}
function PureComponent(props, context) {
    inferno_component_1.default.call(this, props, context);
}
exports.PureComponent = PureComponent;
PureComponent.prototype = new inferno_component_1.default({}, {});
PureComponent.prototype.shouldComponentUpdate = function (props, state) {
    return shallowDiffers(this.props, props) || shallowDiffers(this.state, state);
};
var WrapperComponent = (function (_super) {
    __extends(WrapperComponent, _super);
    function WrapperComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WrapperComponent.prototype.getChildContext = function () {
        // tslint:disable-next-line
        return this.props['context'];
    };
    WrapperComponent.prototype.render = function (props) {
        return props.children;
    };
    return WrapperComponent;
}(inferno_component_1.default));
function unstable_renderSubtreeIntoContainer(parentComponent, vNode, container, callback) {
    var wrapperVNode = inferno_1.createVNode(4, WrapperComponent, null, null, {
        children: vNode,
        context: parentComponent.context
    });
    var component = inferno_1.render(wrapperVNode, container);
    if (callback) {
        // callback gets the component as context, no other argument.
        callback.call(component);
    }
    return component;
}
exports.unstable_renderSubtreeIntoContainer = unstable_renderSubtreeIntoContainer;
// Credit: preact-compat - https://github.com/developit/preact-compat
var ELEMENTS = 'a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param picture pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr circle clipPath defs ellipse g image line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan'.split(' ');
function createFactory(type) {
    return createElement.bind(null, type);
}
exports.createFactory = createFactory;
var DOM = {};
exports.DOM = DOM;
for (var i = ELEMENTS.length; i--;) {
    DOM[ELEMENTS[i]] = createFactory(ELEMENTS[i]);
}
// Mask React global in browser enviornments when React is not used.
if (inferno_shared_1.isBrowser && typeof window.React === 'undefined') {
    var exports_1 = {
        Children: Children,
        Component: inferno_component_1.default,
        DOM: DOM,
        EMPTY_OBJ: inferno_1.EMPTY_OBJ,
        NO_OP: inferno_shared_1.NO_OP,
        PropTypes: PropTypes_1.default,
        PureComponent: PureComponent,
        cloneElement: cloneElement,
        cloneVNode: inferno_1.cloneVNode,
        createClass: inferno_create_class_1.default,
        createElement: createElement,
        createFactory: createFactory,
        createVNode: inferno_1.createVNode,
        findDOMNode: inferno_1.findDOMNode,
        isValidElement: isValidElement_1.default,
        render: inferno_1.render,
        unmountComponentAtNode: unmountComponentAtNode,
        unstable_renderSubtreeIntoContainer: unstable_renderSubtreeIntoContainer,
        version: version
    };
    window.React = exports_1;
    window.ReactDOM = exports_1;
}
exports.default = {
    Children: Children,
    Component: inferno_component_1.default,
    DOM: DOM,
    EMPTY_OBJ: inferno_1.EMPTY_OBJ,
    NO_OP: inferno_shared_1.NO_OP,
    PropTypes: PropTypes_1.default,
    PureComponent: PureComponent,
    cloneElement: cloneElement,
    cloneVNode: inferno_1.cloneVNode,
    createClass: inferno_create_class_1.default,
    createElement: createElement,
    createFactory: createFactory,
    createVNode: inferno_1.createVNode,
    findDOMNode: inferno_1.findDOMNode,
    isValidElement: isValidElement_1.default,
    render: inferno_1.render,
    unmountComponentAtNode: unmountComponentAtNode,
    unstable_renderSubtreeIntoContainer: unstable_renderSubtreeIntoContainer,
    version: version
};


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var inferno_shared_1 = __webpack_require__(0);
function isValidElement(obj) {
    var isNotANullObject = inferno_shared_1.isObject(obj) && inferno_shared_1.isNull(obj) === false;
    if (isNotANullObject === false) {
        return false;
    }
    var flags = obj.flags;
    return (flags & (28 /* Component */ | 3970 /* Element */)) > 0;
}
exports.default = isValidElement;


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Make sure u use EMPTY_OBJ from 'inferno', otherwise it'll be a different reference
var inferno_1 = __webpack_require__(26);
var inferno_shared_1 = __webpack_require__(0);
var noOp = inferno_shared_1.ERROR_MSG;
if (process.env.NODE_ENV !== 'production') {
    noOp = 'Inferno Error: Can only update a mounted or mounting component. This usually means you called setState() or forceUpdate() on an unmounted component. This is a no-op.';
}
var componentCallbackQueue = new Map();
// when a components root VNode is also a component, we can run into issues
// this will recursively look for vNode.parentNode if the VNode is a component
function updateParentComponentVNodes(vNode, dom) {
    if (vNode.flags & 28 /* Component */) {
        var parentVNode = vNode.parentVNode;
        if (parentVNode) {
            parentVNode.dom = dom;
            updateParentComponentVNodes(parentVNode, dom);
        }
    }
}
var resolvedPromise = Promise.resolve();
function addToQueue(component, force, callback) {
    var queue = componentCallbackQueue.get(component);
    if (queue === void 0) {
        queue = [];
        componentCallbackQueue.set(component, queue);
        resolvedPromise.then(function () {
            componentCallbackQueue.delete(component);
            component._updating = true;
            applyState(component, force, function () {
                for (var i = 0, len = queue.length; i < len; i++) {
                    queue[i].call(component);
                }
            });
            component._updating = false;
        });
    }
    if (!inferno_shared_1.isNullOrUndef(callback)) {
        queue.push(callback);
    }
}
function queueStateChanges(component, newState, callback) {
    if (inferno_shared_1.isFunction(newState)) {
        newState = newState(component.state, component.props, component.context);
    }
    var pending = component._pendingState;
    if (inferno_shared_1.isNullOrUndef(pending)) {
        component._pendingState = pending = newState;
    }
    else {
        for (var stateKey in newState) {
            pending[stateKey] = newState[stateKey];
        }
    }
    if (inferno_shared_1.isBrowser && !component._pendingSetState && !component._blockRender) {
        if (!component._updating) {
            component._pendingSetState = true;
            component._updating = true;
            applyState(component, false, callback);
            component._updating = false;
        }
        else {
            addToQueue(component, false, callback);
        }
    }
    else {
        var state = component.state;
        if (state === null) {
            component.state = pending;
        }
        else {
            for (var key in pending) {
                state[key] = pending[key];
            }
        }
        component._pendingState = null;
        if (!inferno_shared_1.isNullOrUndef(callback) && component._blockRender) {
            component._lifecycle.addListener(callback.bind(component));
        }
    }
}
function applyState(component, force, callback) {
    if (component._unmounted) {
        return;
    }
    if (force || !component._blockRender) {
        component._pendingSetState = false;
        var pendingState = component._pendingState;
        var prevState = component.state;
        var nextState = inferno_shared_1.combineFrom(prevState, pendingState);
        var props = component.props;
        var context_1 = component.context;
        component._pendingState = null;
        var nextInput = component._updateComponent(prevState, nextState, props, props, context_1, force, true);
        var didUpdate = true;
        if (inferno_shared_1.isInvalid(nextInput)) {
            nextInput = inferno_1.createVNode(4096 /* Void */, null);
        }
        else if (nextInput === inferno_shared_1.NO_OP) {
            nextInput = component._lastInput;
            didUpdate = false;
        }
        else if (inferno_shared_1.isStringOrNumber(nextInput)) {
            nextInput = inferno_1.createVNode(1 /* Text */, null, null, nextInput);
        }
        else if (inferno_shared_1.isArray(nextInput)) {
            if (process.env.NODE_ENV !== 'production') {
                inferno_shared_1.throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
            }
            inferno_shared_1.throwError();
        }
        var lastInput = component._lastInput;
        var vNode = component._vNode;
        var parentDom = (lastInput.dom && lastInput.dom.parentNode) || (lastInput.dom = vNode.dom);
        component._lastInput = nextInput;
        if (didUpdate) {
            var childContext = void 0;
            if (!inferno_shared_1.isNullOrUndef(component.getChildContext)) {
                childContext = component.getChildContext();
            }
            if (inferno_shared_1.isNullOrUndef(childContext)) {
                childContext = component._childContext;
            }
            else {
                childContext = inferno_shared_1.combineFrom(context_1, childContext);
            }
            var lifeCycle = component._lifecycle;
            inferno_1.internal_patch(lastInput, nextInput, parentDom, lifeCycle, childContext, component._isSVG, false);
            lifeCycle.trigger();
            if (!inferno_shared_1.isNullOrUndef(component.componentDidUpdate)) {
                component.componentDidUpdate(props, prevState, context_1);
            }
            if (!inferno_shared_1.isNull(inferno_1.options.afterUpdate)) {
                inferno_1.options.afterUpdate(vNode);
            }
        }
        var dom = vNode.dom = nextInput.dom;
        if (inferno_1.options.findDOMNodeEnabled) {
            inferno_1.internal_DOMNodeMap.set(component, nextInput.dom);
        }
        updateParentComponentVNodes(vNode, dom);
    }
    else {
        component.state = component._pendingState;
        component._pendingState = null;
    }
    if (!inferno_shared_1.isNullOrUndef(callback)) {
        callback.call(component);
    }
}
var alreadyWarned = false;
var Component = (function () {
    function Component(props, context) {
        this.state = null;
        this._blockRender = false;
        this._blockSetState = true;
        this._pendingSetState = false;
        this._pendingState = null;
        this._lastInput = null;
        this._vNode = null;
        this._unmounted = false;
        this._lifecycle = null;
        this._childContext = null;
        this._isSVG = false;
        this._updating = true;
        /** @type {object} */
        this.props = props || inferno_1.EMPTY_OBJ;
        /** @type {object} */
        this.context = context || inferno_1.EMPTY_OBJ; // context should not be mutable
    }
    Component.prototype.forceUpdate = function (callback) {
        if (this._unmounted || !inferno_shared_1.isBrowser) {
            return;
        }
        applyState(this, true, callback);
    };
    Component.prototype.setState = function (newState, callback) {
        if (this._unmounted) {
            return;
        }
        if (!this._blockSetState) {
            queueStateChanges(this, newState, callback);
        }
        else {
            if (process.env.NODE_ENV !== 'production') {
                inferno_shared_1.throwError('cannot update state via setState() in componentWillUpdate() or constructor.');
            }
            inferno_shared_1.throwError();
        }
    };
    Component.prototype.setStateSync = function (newState) {
        if (process.env.NODE_ENV !== 'production') {
            if (!alreadyWarned) {
                alreadyWarned = true;
                // tslint:disable-next-line:no-console
                console.warn('Inferno WARNING: setStateSync has been deprecated and will be removed in next release. Use setState instead.');
            }
        }
        this.setState(newState);
    };
    Component.prototype._updateComponent = function (prevState, nextState, prevProps, nextProps, context, force, fromSetState) {
        if (this._unmounted === true) {
            if (process.env.NODE_ENV !== 'production') {
                inferno_shared_1.throwError(noOp);
            }
            inferno_shared_1.throwError();
        }
        if ((prevProps !== nextProps || nextProps === inferno_1.EMPTY_OBJ) || prevState !== nextState || force) {
            if (prevProps !== nextProps || nextProps === inferno_1.EMPTY_OBJ) {
                if (!inferno_shared_1.isNullOrUndef(this.componentWillReceiveProps) && !fromSetState) {
                    // keep a copy of state before componentWillReceiveProps
                    var beforeState = inferno_shared_1.combineFrom(this.state);
                    this._blockRender = true;
                    this.componentWillReceiveProps(nextProps, context);
                    this._blockRender = false;
                    var afterState = this.state;
                    if (beforeState !== afterState) {
                        // if state changed in componentWillReceiveProps, reassign the beforeState
                        this.state = beforeState;
                        // set the afterState as pending state so the change gets picked up below
                        this._pendingSetState = true;
                        this._pendingState = afterState;
                    }
                }
                if (this._pendingSetState) {
                    nextState = inferno_shared_1.combineFrom(nextState, this._pendingState);
                    this._pendingSetState = false;
                    this._pendingState = null;
                }
            }
            /* Update if scu is not defined, or it returns truthy value or force */
            if (inferno_shared_1.isNullOrUndef(this.shouldComponentUpdate) || (this.shouldComponentUpdate && this.shouldComponentUpdate(nextProps, nextState, context)) || force) {
                if (!inferno_shared_1.isNullOrUndef(this.componentWillUpdate)) {
                    this._blockSetState = true;
                    this.componentWillUpdate(nextProps, nextState, context);
                    this._blockSetState = false;
                }
                this.props = nextProps;
                this.state = nextState;
                this.context = context;
                if (inferno_1.options.beforeRender) {
                    inferno_1.options.beforeRender(this);
                }
                var render = this.render(nextProps, nextState, context);
                if (inferno_1.options.afterRender) {
                    inferno_1.options.afterRender(this);
                }
                return render;
            }
            else {
                this.props = nextProps;
                this.state = nextState;
                this.context = context;
            }
        }
        return inferno_shared_1.NO_OP;
    };
    // tslint:disable-next-line:no-empty
    Component.prototype.render = function (nextProps, nextState, nextContext) { };
    return Component;
}());
exports.default = Component;


/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var inferno_component_1 = __webpack_require__(39);
var inferno_shared_1 = __webpack_require__(0);
// don't autobind these methods since they already have guaranteed context.
var AUTOBIND_BLACKLIST = new Set();
AUTOBIND_BLACKLIST.add('constructor');
AUTOBIND_BLACKLIST.add('render');
AUTOBIND_BLACKLIST.add('shouldComponentUpdate');
AUTOBIND_BLACKLIST.add('componentWillReceiveProps');
AUTOBIND_BLACKLIST.add('componentWillUpdate');
AUTOBIND_BLACKLIST.add('componentDidUpdate');
AUTOBIND_BLACKLIST.add('componentWillMount');
AUTOBIND_BLACKLIST.add('componentDidMount');
AUTOBIND_BLACKLIST.add('componentWillUnmount');
AUTOBIND_BLACKLIST.add('componentDidUnmount');
function extend(base, props) {
    for (var key in props) {
        if (!inferno_shared_1.isNullOrUndef(props[key])) {
            base[key] = props[key];
        }
    }
    return base;
}
function bindAll(ctx) {
    for (var i in ctx) {
        var v = ctx[i];
        if (typeof v === 'function' && !v.__bound && !AUTOBIND_BLACKLIST.has(i)) {
            (ctx[i] = v.bind(ctx)).__bound = true;
        }
    }
}
function collateMixins(mixins, keyed) {
    if (keyed === void 0) { keyed = {}; }
    for (var i = 0, len = mixins.length; i < len; i++) {
        var mixin = mixins[i];
        // Surprise: Mixins can have mixins
        if (mixin.mixins) {
            // Recursively collate sub-mixins
            collateMixins(mixin.mixins, keyed);
        }
        for (var key in mixin) {
            if (mixin.hasOwnProperty(key) && typeof mixin[key] === 'function') {
                (keyed[key] || (keyed[key] = [])).push(mixin[key]);
            }
        }
    }
    return keyed;
}
function multihook(hooks, mergeFn) {
    return function () {
        var ret;
        for (var i = 0, len = hooks.length; i < len; i++) {
            var hook = hooks[i];
            var r = hook.apply(this, arguments);
            if (mergeFn) {
                ret = mergeFn(ret, r);
            }
            else if (!inferno_shared_1.isUndefined(r)) {
                ret = r;
            }
        }
        return ret;
    };
}
function mergeNoDupes(previous, current) {
    if (!inferno_shared_1.isUndefined(current)) {
        if (!inferno_shared_1.isObject(current)) {
            inferno_shared_1.throwError('Expected Mixin to return value to be an object or null.');
        }
        if (!previous) {
            previous = {};
        }
        for (var key in current) {
            if (current.hasOwnProperty(key)) {
                if (previous.hasOwnProperty(key)) {
                    inferno_shared_1.throwError("Mixins return duplicate key " + key + " in their return values");
                }
                previous[key] = current[key];
            }
        }
    }
    return previous;
}
function applyMixin(key, inst, mixin) {
    var hooks = inferno_shared_1.isUndefined(inst[key]) ? mixin : mixin.concat(inst[key]);
    if (key === 'getDefaultProps' || key === 'getInitialState' || key === 'getChildContext') {
        inst[key] = multihook(hooks, mergeNoDupes);
    }
    else {
        inst[key] = multihook(hooks);
    }
}
function applyMixins(Cl, mixins) {
    for (var key in mixins) {
        if (mixins.hasOwnProperty(key)) {
            var mixin = mixins[key];
            var inst = void 0;
            if (key === 'getDefaultProps') {
                inst = Cl;
            }
            else {
                inst = Cl.prototype;
            }
            if (inferno_shared_1.isFunction(mixin[0])) {
                applyMixin(key, inst, mixin);
            }
            else {
                inst[key] = mixin;
            }
        }
    }
}
function createClass(obj) {
    var Cl = (function (_super) {
        __extends(Cl, _super);
        function Cl(props, context) {
            var _this = _super.call(this, props, context) || this;
            bindAll(_this);
            if (_this.getInitialState) {
                _this.state = _this.getInitialState();
            }
            return _this;
        }
        Cl.prototype.replaceState = function (nextState, callback) {
            this.setState(nextState, callback);
        };
        Cl.prototype.isMounted = function () {
            return !this._unmounted;
        };
        return Cl;
    }(inferno_component_1.default));
    Cl.displayName = obj.displayName || 'Component';
    Cl.propTypes = obj.propTypes;
    Cl.mixins = obj.mixins && collateMixins(obj.mixins);
    Cl.getDefaultProps = obj.getDefaultProps;
    extend(Cl.prototype, obj);
    if (obj.statics) {
        extend(Cl, obj.statics);
    }
    if (obj.mixins) {
        applyMixins(Cl, collateMixins(obj.mixins));
    }
    Cl.defaultProps = inferno_shared_1.isUndefined(Cl.getDefaultProps) ? undefined : Cl.getDefaultProps();
    return Cl;
}
exports.default = createClass;


/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(81).default;
module.exports.default = module.exports;



/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var inferno_1 = __webpack_require__(26);
var inferno_shared_1 = __webpack_require__(0);
var componentHooks = new Set();
componentHooks.add('onComponentWillMount');
componentHooks.add('onComponentDidMount');
componentHooks.add('onComponentWillUnmount');
componentHooks.add('onComponentShouldUpdate');
componentHooks.add('onComponentWillUpdate');
componentHooks.add('onComponentDidUpdate');
/**
 * Creates virtual node
 * @param {string|Function|Component<any, any>} type Type of node
 * @param {object=} props Optional props for virtual node
 * @param {...{object}=} _children Optional children for virtual node
 * @returns {VNode} new virtual ndoe
 */
function createElement(type, props) {
    var _children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        _children[_i - 2] = arguments[_i];
    }
    if (inferno_shared_1.isInvalid(type) || inferno_shared_1.isObject(type)) {
        throw new Error('Inferno Error: createElement() name parameter cannot be undefined, null, false or true, It must be a string, class or function.');
    }
    var children = _children;
    var ref = null;
    var key = null;
    var className = null;
    var flags = 0;
    var newProps;
    if (_children) {
        if (_children.length === 1) {
            children = _children[0];
        }
        else if (_children.length === 0) {
            children = void 0;
        }
    }
    if (inferno_shared_1.isString(type)) {
        flags = inferno_1.getFlagsForElementVnode(type);
        if (!inferno_shared_1.isNullOrUndef(props)) {
            newProps = {};
            for (var prop in props) {
                if (prop === 'className' || prop === 'class') {
                    className = props[prop];
                }
                else if (prop === 'key') {
                    key = props.key;
                }
                else if (prop === 'children' && inferno_shared_1.isUndefined(children)) {
                    children = props.children; // always favour children args, default to props
                }
                else if (prop === 'ref') {
                    ref = props.ref;
                }
                else {
                    newProps[prop] = props[prop];
                }
            }
        }
    }
    else {
        flags = 16 /* ComponentUnknown */;
        if (!inferno_shared_1.isUndefined(children)) {
            if (!props) {
                props = {};
            }
            props.children = children;
            children = null;
        }
        if (!inferno_shared_1.isNullOrUndef(props)) {
            newProps = {};
            for (var prop in props) {
                if (componentHooks.has(prop)) {
                    if (!ref) {
                        ref = {};
                    }
                    ref[prop] = props[prop];
                }
                else if (prop === 'key') {
                    key = props.key;
                }
                else {
                    newProps[prop] = props[prop];
                }
            }
        }
    }
    return inferno_1.createVNode(flags, type, className, children, newProps, key, ref);
}
exports.default = createElement;


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(83).default;
module.exports.default = module.exports;



/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.NO_OP = '$NO_OP';
exports.ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';
// This should be boolean and not reference to window.document
exports.isBrowser = !!(typeof window !== 'undefined' && window.document);
function toArray(children) {
    return exports.isArray(children) ? children : (children ? [children] : children);
}
exports.toArray = toArray;
// this is MUCH faster than .constructor === Array and instanceof Array
// in Node 7 and the later versions of V8, slower in older versions though
exports.isArray = Array.isArray;
function isStatefulComponent(o) {
    return !isUndefined(o.prototype) && !isUndefined(o.prototype.render);
}
exports.isStatefulComponent = isStatefulComponent;
function isStringOrNumber(o) {
    var type = typeof o;
    return type === 'string' || type === 'number';
}
exports.isStringOrNumber = isStringOrNumber;
function isNullOrUndef(o) {
    return isUndefined(o) || isNull(o);
}
exports.isNullOrUndef = isNullOrUndef;
function isInvalid(o) {
    return isNull(o) || o === false || isTrue(o) || isUndefined(o);
}
exports.isInvalid = isInvalid;
function isFunction(o) {
    return typeof o === 'function';
}
exports.isFunction = isFunction;
function isString(o) {
    return typeof o === 'string';
}
exports.isString = isString;
function isNumber(o) {
    return typeof o === 'number';
}
exports.isNumber = isNumber;
function isNull(o) {
    return o === null;
}
exports.isNull = isNull;
function isTrue(o) {
    return o === true;
}
exports.isTrue = isTrue;
function isUndefined(o) {
    return o === void 0;
}
exports.isUndefined = isUndefined;
function isObject(o) {
    return typeof o === 'object';
}
exports.isObject = isObject;
function throwError(message) {
    if (!message) {
        message = exports.ERROR_MSG;
    }
    throw new Error("Inferno Error: " + message);
}
exports.throwError = throwError;
function warning(message) {
    // tslint:disable-next-line:no-console
    console.warn(message);
}
exports.warning = warning;
function combineFrom(first, second) {
    var out = {};
    if (first) {
        for (var key in first) {
            out[key] = first[key];
        }
    }
    if (second) {
        for (var key in second) {
            out[key] = second[key];
        }
    }
    return out;
}
exports.combineFrom = combineFrom;
function Lifecycle() {
    this.listeners = [];
}
exports.Lifecycle = Lifecycle;
Lifecycle.prototype.addListener = function addListener(callback) {
    this.listeners.push(callback);
};
Lifecycle.prototype.trigger = function trigger() {
    var listeners = this.listeners;
    var listener;
    // We need to remove current listener from array when calling it, because more listeners might be added
    while (listener = listeners.shift()) {
        listener();
    }
};


/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var inferno_shared_1 = __webpack_require__(0);
var isiOS = inferno_shared_1.isBrowser && !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
var delegatedEvents = new Map();
function handleEvent(name, lastEvent, nextEvent, dom) {
    var delegatedRoots = delegatedEvents.get(name);
    if (nextEvent) {
        if (!delegatedRoots) {
            delegatedRoots = { items: new Map(), docEvent: null };
            delegatedRoots.docEvent = attachEventToDocument(name, delegatedRoots);
            delegatedEvents.set(name, delegatedRoots);
        }
        if (!lastEvent) {
            if (isiOS && name === 'onClick') {
                trapClickOnNonInteractiveElement(dom);
            }
        }
        delegatedRoots.items.set(dom, nextEvent);
    }
    else if (delegatedRoots) {
        var items = delegatedRoots.items;
        if (items.delete(dom)) {
            // If any items were deleted, check if listener need to be removed
            if (items.size === 0) {
                document.removeEventListener(normalizeEventName(name), delegatedRoots.docEvent);
                delegatedEvents.delete(name);
            }
        }
    }
}
exports.handleEvent = handleEvent;
function dispatchEvent(event, target, items, count, isClick, eventData) {
    var eventsToTrigger = items.get(target);
    if (eventsToTrigger) {
        count--;
        // linkEvent object
        eventData.dom = target;
        if (eventsToTrigger.event) {
            eventsToTrigger.event(eventsToTrigger.data, event);
        }
        else {
            eventsToTrigger(event);
        }
        if (event.cancelBubble) {
            return;
        }
    }
    if (count > 0) {
        var parentDom = target.parentNode;
        // Html Nodes can be nested fe: span inside button in that scenario browser does not handle disabled attribute on parent,
        // because the event listener is on document.body
        // Don't process clicks on disabled elements
        if (parentDom === null || (isClick && parentDom.nodeType === 1 && parentDom.disabled)) {
            return;
        }
        dispatchEvent(event, parentDom, items, count, isClick, eventData);
    }
}
function normalizeEventName(name) {
    return name.substr(2).toLowerCase();
}
function stopPropagation() {
    this.cancelBubble = true;
    this.stopImmediatePropagation();
}
function attachEventToDocument(name, delegatedRoots) {
    var docEvent = function (event) {
        var count = delegatedRoots.items.size;
        if (count > 0) {
            event.stopPropagation = stopPropagation;
            // Event data needs to be object to save reference to currentTarget getter
            var eventData_1 = {
                dom: document
            };
            try {
                Object.defineProperty(event, 'currentTarget', {
                    configurable: true,
                    get: function get() {
                        return eventData_1.dom;
                    }
                });
            }
            catch (e) { }
            dispatchEvent(event, event.target, delegatedRoots.items, count, event.type === 'click', eventData_1);
        }
    };
    document.addEventListener(normalizeEventName(name), docEvent);
    return docEvent;
}
// tslint:disable-next-line:no-empty
function emptyFn() { }
function trapClickOnNonInteractiveElement(dom) {
    // Mobile Safari does not fire properly bubble click events on
    // non-interactive elements, which means delegated click listeners do not
    // fire. The workaround for this bug involves attaching an empty click
    // listener on the target node.
    // http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
    // Just set it using the onclick property so that we don't have to manage any
    // bookkeeping for it. Not sure if we need to clear it when the listener is
    // removed.
    // TODO: Only do this for the relevant Safaris maybe?
    dom.onclick = emptyFn;
}


/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var inferno_shared_1 = __webpack_require__(0);
/**
 * Links given data to event as first parameter
 * @param {*} data data to be linked, it will be available in function as first parameter
 * @param {Function} event Function to be called when event occurs
 * @returns {{data: *, event: Function}}
 */
function linkEvent(data, event) {
    if (inferno_shared_1.isFunction(event)) {
        return { data: data, event: event };
    }
    return null; // Return null when event is invalid, to avoid creating unnecessary event handlers
}
exports.linkEvent = linkEvent;


/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var inferno_shared_1 = __webpack_require__(0);
var options_1 = __webpack_require__(4);
var constants_1 = __webpack_require__(14);
var mounting_1 = __webpack_require__(15);
var patching_1 = __webpack_require__(8);
var rendering_1 = __webpack_require__(10);
var utils_1 = __webpack_require__(2);
var processElement_1 = __webpack_require__(25);
function normalizeChildNodes(parentDom) {
    var dom = parentDom.firstChild;
    while (dom) {
        if (dom.nodeType === 8) {
            if (dom.data === '!') {
                var placeholder = document.createTextNode('');
                parentDom.replaceChild(placeholder, dom);
                dom = dom.nextSibling;
            }
            else {
                var lastDom = dom.previousSibling;
                parentDom.removeChild(dom);
                dom = lastDom || parentDom.firstChild;
            }
        }
        else {
            dom = dom.nextSibling;
        }
    }
}
function hydrateComponent(vNode, dom, lifecycle, context, isSVG, isClass) {
    var type = vNode.type;
    var ref = vNode.ref;
    vNode.dom = dom;
    var props = vNode.props || utils_1.EMPTY_OBJ;
    if (isClass) {
        var _isSVG = dom.namespaceURI === constants_1.svgNS;
        var instance = utils_1.createClassComponentInstance(vNode, type, props, context, _isSVG, lifecycle);
        var input = instance._lastInput;
        instance._vNode = vNode;
        hydrate(input, dom, lifecycle, instance._childContext, _isSVG);
        mounting_1.mountClassComponentCallbacks(vNode, ref, instance, lifecycle);
        instance._updating = false; // Mount finished allow going sync
        if (options_1.options.findDOMNodeEnabled) {
            rendering_1.componentToDOMNodeMap.set(instance, dom);
        }
    }
    else {
        var input = utils_1.createFunctionalComponentInput(vNode, type, props, context);
        hydrate(input, dom, lifecycle, context, isSVG);
        vNode.children = input;
        vNode.dom = input.dom;
        mounting_1.mountFunctionalComponentCallbacks(ref, dom, lifecycle);
    }
    return dom;
}
function hydrateElement(vNode, dom, lifecycle, context, isSVG) {
    var children = vNode.children;
    var props = vNode.props;
    var className = vNode.className;
    var flags = vNode.flags;
    var ref = vNode.ref;
    isSVG = isSVG || (flags & 128 /* SvgElement */) > 0;
    if (dom.nodeType !== 1 || dom.tagName.toLowerCase() !== vNode.type) {
        if (process.env.NODE_ENV !== 'production') {
            inferno_shared_1.warning('Inferno hydration: Server-side markup doesn\'t match client-side markup or Initial render target is not empty');
        }
        var newDom = mounting_1.mountElement(vNode, null, lifecycle, context, isSVG);
        vNode.dom = newDom;
        utils_1.replaceChild(dom.parentNode, newDom, dom);
        return newDom;
    }
    vNode.dom = dom;
    if (children) {
        hydrateChildren(children, dom, lifecycle, context, isSVG);
    }
    else if (dom.firstChild !== null) {
        dom.textContent = ''; // dom has content, but VNode has no children remove everything from DOM
    }
    if (props) {
        var hasControlledValue = false;
        var isFormElement = (flags & 3584 /* FormElement */) > 0;
        if (isFormElement) {
            hasControlledValue = processElement_1.isControlledFormElement(props);
        }
        for (var prop in props) {
            // do not add a hasOwnProperty check here, it affects performance
            patching_1.patchProp(prop, null, props[prop], dom, isSVG, hasControlledValue);
        }
        if (isFormElement) {
            processElement_1.processElement(flags, vNode, dom, props, true, hasControlledValue);
        }
    }
    if (!inferno_shared_1.isNullOrUndef(className)) {
        if (isSVG) {
            dom.setAttribute('class', className);
        }
        else {
            dom.className = className;
        }
    }
    else {
        if (dom.className !== '') {
            dom.removeAttribute('class');
        }
    }
    if (ref) {
        mounting_1.mountRef(dom, ref, lifecycle);
    }
    return dom;
}
function hydrateChildren(children, parentDom, lifecycle, context, isSVG) {
    normalizeChildNodes(parentDom);
    var dom = parentDom.firstChild;
    if (inferno_shared_1.isStringOrNumber(children)) {
        if (dom && dom.nodeType === 3) {
            if (dom.nodeValue !== children) {
                dom.nodeValue = children;
            }
        }
        else if (children) {
            parentDom.textContent = children;
        }
        dom = dom.nextSibling;
    }
    else if (inferno_shared_1.isArray(children)) {
        for (var i = 0, len = children.length; i < len; i++) {
            var child = children[i];
            if (!inferno_shared_1.isNull(child) && inferno_shared_1.isObject(child)) {
                if (!inferno_shared_1.isNull(dom)) {
                    var nextSibling = dom.nextSibling;
                    hydrate(child, dom, lifecycle, context, isSVG);
                    dom = nextSibling;
                }
                else {
                    mounting_1.mount(child, parentDom, lifecycle, context, isSVG);
                }
            }
        }
    }
    else {
        // It's VNode
        hydrate(children, dom, lifecycle, context, isSVG);
        dom = dom.nextSibling;
    }
    // clear any other DOM nodes, there should be only a single entry for the root
    while (dom) {
        var nextSibling = dom.nextSibling;
        parentDom.removeChild(dom);
        dom = nextSibling;
    }
}
function hydrateText(vNode, dom) {
    if (dom.nodeType !== 3) {
        var newDom = mounting_1.mountText(vNode, null);
        vNode.dom = newDom;
        utils_1.replaceChild(dom.parentNode, newDom, dom);
        return newDom;
    }
    var text = vNode.children;
    if (dom.nodeValue !== text) {
        dom.nodeValue = text;
    }
    vNode.dom = dom;
    return dom;
}
function hydrateVoid(vNode, dom) {
    vNode.dom = dom;
    return dom;
}
function hydrate(vNode, dom, lifecycle, context, isSVG) {
    var flags = vNode.flags;
    if (flags & 28 /* Component */) {
        hydrateComponent(vNode, dom, lifecycle, context, isSVG, (flags & 4 /* ComponentClass */) > 0);
    }
    else if (flags & 3970 /* Element */) {
        hydrateElement(vNode, dom, lifecycle, context, isSVG);
    }
    else if (flags & 1 /* Text */) {
        hydrateText(vNode, dom);
    }
    else if (flags & 4096 /* Void */) {
        hydrateVoid(vNode, dom);
    }
    else {
        if (process.env.NODE_ENV !== 'production') {
            inferno_shared_1.throwError("hydrate() expects a valid VNode, instead it received an object with the type \"" + typeof vNode + "\".");
        }
        inferno_shared_1.throwError();
    }
}
function hydrateRoot(input, parentDom, lifecycle) {
    if (!inferno_shared_1.isNull(parentDom)) {
        var dom = parentDom.firstChild;
        if (!inferno_shared_1.isNull(dom)) {
            hydrate(input, dom, lifecycle, utils_1.EMPTY_OBJ, false);
            dom = parentDom.firstChild;
            // clear any other DOM nodes, there should be only a single entry for the root
            while (dom = dom.nextSibling) {
                parentDom.removeChild(dom);
            }
            return true;
        }
    }
    return false;
}
exports.hydrateRoot = hydrateRoot;


/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var inferno_shared_1 = __webpack_require__(0);
var utils_1 = __webpack_require__(2);
function isCheckedType(type) {
    return type === 'checkbox' || type === 'radio';
}
exports.isCheckedType = isCheckedType;
function onTextInputChange(e) {
    var vNode = this.vNode;
    var props = vNode.props || utils_1.EMPTY_OBJ;
    var dom = vNode.dom;
    var previousValue = props.value;
    if (props.onInput) {
        var event_1 = props.onInput;
        if (event_1.event) {
            event_1.event(event_1.data, e);
        }
        else {
            event_1(e);
        }
    }
    else if (props.oninput) {
        props.oninput(e);
    }
    // the user may have updated the vNode from the above onInput events syncronously
    // so we need to get it from the context of `this` again
    var newVNode = this.vNode;
    var newProps = newVNode.props || utils_1.EMPTY_OBJ;
    // If render is going async there is no value change yet, it will come back to process input soon
    if (previousValue !== newProps.value) {
        // When this happens we need to store current cursor position and restore it, to avoid jumping
        applyValue(newProps, dom);
    }
}
function wrappedOnChange(e) {
    var props = this.vNode.props || utils_1.EMPTY_OBJ;
    var event = props.onChange;
    if (event.event) {
        event.event(event.data, e);
    }
    else {
        event(e);
    }
}
function onCheckboxChange(e) {
    e.stopPropagation(); // This click should not propagate its for internal use
    var vNode = this.vNode;
    var props = vNode.props || utils_1.EMPTY_OBJ;
    var dom = vNode.dom;
    if (props.onClick) {
        var event_2 = props.onClick;
        if (event_2.event) {
            event_2.event(event_2.data, e);
        }
        else {
            event_2(e);
        }
    }
    else if (props.onclick) {
        props.onclick(e);
    }
    // the user may have updated the vNode from the above onInput events syncronously
    // so we need to get it from the context of `this` again
    var newVNode = this.vNode;
    var newProps = newVNode.props || utils_1.EMPTY_OBJ;
    // If render is going async there is no value change yet, it will come back to process input soon
    applyValue(newProps, dom);
}
function processInput(vNode, dom, nextPropsOrEmpty, mounting, isControlled) {
    applyValue(nextPropsOrEmpty, dom);
    if (isControlled) {
        dom.vNode = vNode; // TODO: Remove this when implementing Fiber's
        if (mounting) {
            if (isCheckedType(nextPropsOrEmpty.type)) {
                dom.onclick = onCheckboxChange;
                dom.onclick.wrapped = true;
            }
            else {
                dom.oninput = onTextInputChange;
                dom.oninput.wrapped = true;
            }
            if (nextPropsOrEmpty.onChange) {
                dom.onchange = wrappedOnChange;
                dom.onchange.wrapped = true;
            }
        }
    }
}
exports.processInput = processInput;
function applyValue(nextPropsOrEmpty, dom) {
    var type = nextPropsOrEmpty.type;
    var value = nextPropsOrEmpty.value;
    var checked = nextPropsOrEmpty.checked;
    var multiple = nextPropsOrEmpty.multiple;
    var defaultValue = nextPropsOrEmpty.defaultValue;
    var hasValue = !inferno_shared_1.isNullOrUndef(value);
    if (type && type !== dom.type) {
        dom.setAttribute('type', type);
    }
    if (multiple && multiple !== dom.multiple) {
        dom.multiple = multiple;
    }
    if (!inferno_shared_1.isNullOrUndef(defaultValue) && !hasValue) {
        dom.defaultValue = defaultValue + '';
    }
    if (isCheckedType(type)) {
        if (hasValue) {
            dom.value = value;
        }
        if (!inferno_shared_1.isNullOrUndef(checked)) {
            dom.checked = checked;
        }
    }
    else {
        if (hasValue && dom.value !== value) {
            dom.defaultValue = value;
            dom.value = value;
        }
        else if (!inferno_shared_1.isNullOrUndef(checked)) {
            dom.checked = checked;
        }
    }
}
exports.applyValue = applyValue;


/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var inferno_shared_1 = __webpack_require__(0);
var VNodes_1 = __webpack_require__(6);
var utils_1 = __webpack_require__(2);
function updateChildOptionGroup(vNode, value) {
    var type = vNode.type;
    if (type === 'optgroup') {
        var children = vNode.children;
        if (inferno_shared_1.isArray(children)) {
            for (var i = 0, len = children.length; i < len; i++) {
                updateChildOption(children[i], value);
            }
        }
        else if (VNodes_1.isVNode(children)) {
            updateChildOption(children, value);
        }
    }
    else {
        updateChildOption(vNode, value);
    }
}
function updateChildOption(vNode, value) {
    var props = vNode.props || utils_1.EMPTY_OBJ;
    var dom = vNode.dom;
    // we do this as multiple may have changed
    dom.value = props.value;
    if ((inferno_shared_1.isArray(value) && value.indexOf(props.value) !== -1) || props.value === value) {
        dom.selected = true;
    }
    else if (!inferno_shared_1.isNullOrUndef(value) || !inferno_shared_1.isNullOrUndef(props.selected)) {
        dom.selected = props.selected || false;
    }
}
function onSelectChange(e) {
    var vNode = this.vNode;
    var props = vNode.props || utils_1.EMPTY_OBJ;
    var dom = vNode.dom;
    var previousValue = props.value;
    if (props.onChange) {
        var event_1 = props.onChange;
        if (event_1.event) {
            event_1.event(event_1.data, e);
        }
        else {
            event_1(e);
        }
    }
    else if (props.onchange) {
        props.onchange(e);
    }
    // the user may have updated the vNode from the above onInput events syncronously
    // so we need to get it from the context of `this` again
    var newVNode = this.vNode;
    var newProps = newVNode.props || utils_1.EMPTY_OBJ;
    // If render is going async there is no value change yet, it will come back to process input soon
    if (previousValue !== newProps.value) {
        // When this happens we need to store current cursor position and restore it, to avoid jumping
        applyValue(newVNode, dom, newProps, false);
    }
}
function processSelect(vNode, dom, nextPropsOrEmpty, mounting, isControlled) {
    applyValue(vNode, dom, nextPropsOrEmpty, mounting);
    if (isControlled) {
        dom.vNode = vNode; // TODO: Remove this when implementing Fiber's
        if (mounting) {
            dom.onchange = onSelectChange;
            dom.onchange.wrapped = true;
        }
    }
}
exports.processSelect = processSelect;
function applyValue(vNode, dom, nextPropsOrEmpty, mounting) {
    if (nextPropsOrEmpty.multiple !== dom.multiple) {
        dom.multiple = nextPropsOrEmpty.multiple;
    }
    var children = vNode.children;
    if (!inferno_shared_1.isInvalid(children)) {
        var value = nextPropsOrEmpty.value;
        if (mounting && inferno_shared_1.isNullOrUndef(value)) {
            value = nextPropsOrEmpty.defaultValue;
        }
        if (inferno_shared_1.isArray(children)) {
            for (var i = 0, len = children.length; i < len; i++) {
                updateChildOptionGroup(children[i], value);
            }
        }
        else if (VNodes_1.isVNode(children)) {
            updateChildOptionGroup(children, value);
        }
    }
}
exports.applyValue = applyValue;


/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var inferno_shared_1 = __webpack_require__(0);
var utils_1 = __webpack_require__(2);
function wrappedOnChange(e) {
    var props = this.vNode.props || utils_1.EMPTY_OBJ;
    var event = props.onChange;
    if (event.event) {
        event.event(event.data, e);
    }
    else {
        event(e);
    }
}
function onTextareaInputChange(e) {
    var vNode = this.vNode;
    var props = vNode.props || utils_1.EMPTY_OBJ;
    var previousValue = props.value;
    if (props.onInput) {
        var event_1 = props.onInput;
        if (event_1.event) {
            event_1.event(event_1.data, e);
        }
        else {
            event_1(e);
        }
    }
    else if (props.oninput) {
        props.oninput(e);
    }
    // the user may have updated the vNode from the above onInput events syncronously
    // so we need to get it from the context of `this` again
    var newVNode = this.vNode;
    var newProps = newVNode.props || utils_1.EMPTY_OBJ;
    // If render is going async there is no value change yet, it will come back to process input soon
    if (previousValue !== newProps.value) {
        // When this happens we need to store current cursor position and restore it, to avoid jumping
        applyValue(newVNode, vNode.dom, false);
    }
}
function processTextarea(vNode, dom, nextPropsOrEmpty, mounting, isControlled) {
    applyValue(nextPropsOrEmpty, dom, mounting);
    if (isControlled) {
        dom.vNode = vNode; // TODO: Remove this when implementing Fiber's
        if (mounting) {
            dom.oninput = onTextareaInputChange;
            dom.oninput.wrapped = true;
            if (nextPropsOrEmpty.onChange) {
                dom.onchange = wrappedOnChange;
                dom.onchange.wrapped = true;
            }
        }
    }
}
exports.processTextarea = processTextarea;
function applyValue(nextPropsOrEmpty, dom, mounting) {
    var value = nextPropsOrEmpty.value;
    var domValue = dom.value;
    if (inferno_shared_1.isNullOrUndef(value)) {
        if (mounting) {
            var defaultValue = nextPropsOrEmpty.defaultValue;
            if (!inferno_shared_1.isNullOrUndef(defaultValue)) {
                if (defaultValue !== domValue) {
                    dom.defaultValue = defaultValue;
                    dom.value = defaultValue;
                }
            }
            else if (domValue !== '') {
                dom.defaultValue = '';
                dom.value = '';
            }
        }
    }
    else {
        /* There is value so keep it controlled */
        if (domValue !== value) {
            dom.defaultValue = value;
            dom.value = value;
        }
    }
}
exports.applyValue = applyValue;


/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:object-literal-sort-keys */
var inferno_shared_1 = __webpack_require__(0);
exports.NO_OP = inferno_shared_1.NO_OP;
var normalization_1 = __webpack_require__(41);
exports.getFlagsForElementVnode = normalization_1.getFlagsForElementVnode;
exports.internal_normalize = normalization_1.normalize;
var options_1 = __webpack_require__(4);
exports.options = options_1.options;
var VNodes_1 = __webpack_require__(6);
exports.cloneVNode = VNodes_1.cloneVNode;
exports.createVNode = VNodes_1.createVNode;
var constants_1 = __webpack_require__(14);
exports.internal_isUnitlessNumber = constants_1.isUnitlessNumber;
var linkEvent_1 = __webpack_require__(87);
exports.linkEvent = linkEvent_1.linkEvent;
var patching_1 = __webpack_require__(8);
exports.internal_patch = patching_1.patch;
var rendering_1 = __webpack_require__(10);
exports.internal_DOMNodeMap = rendering_1.componentToDOMNodeMap;
exports.createRenderer = rendering_1.createRenderer;
exports.findDOMNode = rendering_1.findDOMNode;
exports.render = rendering_1.render;
var utils_1 = __webpack_require__(2);
exports.EMPTY_OBJ = utils_1.EMPTY_OBJ;
if (process.env.NODE_ENV !== 'production') {
    /* tslint:disable-next-line:no-empty */
    var testFunc = function testFn() { };
    if ((testFunc.name || testFunc.toString()).indexOf('testFn') === -1) {
        inferno_shared_1.warning(('It looks like you\'re using a minified copy of the development build ' +
            'of Inferno. When deploying Inferno apps to production, make sure to use ' +
            'the production build which skips development warnings and is faster. ' +
            'See http://infernojs.org for more details.'));
    }
}
var version = '3.4.3';
exports.version = version;
// we duplicate it so it plays nicely with different module loading systems
exports.default = {
    EMPTY_OBJ: utils_1.EMPTY_OBJ,
    NO_OP: inferno_shared_1.NO_OP,
    cloneVNode: VNodes_1.cloneVNode,
    createRenderer: rendering_1.createRenderer,
    createVNode: VNodes_1.createVNode,
    findDOMNode: rendering_1.findDOMNode,
    getFlagsForElementVnode: normalization_1.getFlagsForElementVnode,
    internal_DOMNodeMap: rendering_1.componentToDOMNodeMap,
    internal_isUnitlessNumber: constants_1.isUnitlessNumber,
    internal_normalize: normalization_1.normalize,
    internal_patch: patching_1.patch,
    linkEvent: linkEvent_1.linkEvent,
    options: options_1.options,
    render: rendering_1.render,
    version: version // DOM
};


/***/ }),
/* 93 */
/***/ (function(module, exports) {

/**
 * Helpers.
 */

var s = 1000
var m = s * 60
var h = m * 60
var d = h * 24
var y = d * 365.25

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function (val, options) {
  options = options || {}
  var type = typeof val
  if (type === 'string' && val.length > 0) {
    return parse(val)
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ?
			fmtLong(val) :
			fmtShort(val)
  }
  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val))
}

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str)
  if (str.length > 10000) {
    return
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str)
  if (!match) {
    return
  }
  var n = parseFloat(match[1])
  var type = (match[2] || 'ms').toLowerCase()
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y
    case 'days':
    case 'day':
    case 'd':
      return n * d
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n
    default:
      return undefined
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd'
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h'
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm'
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's'
  }
  return ms + 'ms'
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms'
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name
  }
  return Math.ceil(ms / n) + ' ' + name + 's'
}


/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
      // Callback can either be a function or a string
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      // Copy function arguments
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
      }
      // Store and register the task
      var task = { callback: callback, args: args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
        case 0:
            callback();
            break;
        case 1:
            callback(args[0]);
            break;
        case 2:
            callback(args[0], args[1]);
            break;
        case 3:
            callback(args[0], args[1], args[2]);
            break;
        default:
            callback.apply(undefined, args);
            break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(27)))

/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

var apply = Function.prototype.apply;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) {
  if (timeout) {
    timeout.close();
  }
};

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// setimmediate attaches itself to the global object
__webpack_require__(94);
exports.setImmediate = setImmediate;
exports.clearImmediate = clearImmediate;


/***/ })
/******/ ]);