import ElementHandle from './ElementHandle'
import {JSHandle} from './ExecutionContext'

import uuid from 'node-uuid'
import PubSub from '../../render/pubsub'
const ipc = chrome.ipcRenderer
const NOT_MATCH_VALUE = -5928295

export default class Helper {

  /**
   * @param {Function|string} fun
   * @param {!Array<*>} args
   * @return {string}
   */
  static evaluationString(fun, ...args) {
    if (Helper.isString(fun)) {
      console.assert(args.length === 0, 'Cannot evaluate a string with arguments');
      return /** @type {string} */ (fun);
    }
    return `(${fun})(${args.map(Helper._serializeArgument).join(',')})`;

  }

  static wait(time){
    return new Promise(r=>setTimeout(r,time))
  }

  // static _handleNavigateEvent(details){
  //   if(details.frameId == 0) PubSub.publish('onCompleted',details.tabId)
  // }
  //
  // static _startObserveLoadEvent(){
  //   if(!Helper.observeDOMContentLoaded){
  //     Helper.observeDOMContentLoaded = true
  //     chrome.webNavigation.onCompleted.addListener(Helper._handleNavigateEvent)
  //   }
  // }
  // static _stopObserveLoadEvent(){
  //   Helper.observeDOMContentLoaded = false
  //   chrome.webNavigation.onCompleted.removeListener(Helper._handleNavigateEvent)
  //
  // }

  static _serializeArgument(arg) {
    if(arg instanceof JSHandle){
      return `(${arg._pageFunction})(${arg._args.map(Helper._serializeArgument).join(',')})`
    }
    else if(arg instanceof ElementHandle){
      return `document.querySelector('${Helper.stringEscape(arg._selector)}')`
    }
    else if (Object.is(arg, undefined))
      return 'undefined';
    return JSON.stringify(arg);
  }

  static _getFramesCode(frameId){
    return `const getFrameIndex = _=> {
    if (window.top === window.self)
      return 0;
    for (var i=0; i<window.frames.length; i++) {
      if (window.frames[i] === window.self) {
        return i+1;
      }
    }
    return -1;
  };
  if(getFrameIndex() !== ${frameId}) return ${NOT_MATCH_VALUE} 
  `
  }

  static executeScriptExtContext({tabId,frameId,fun,handle},...args){
    if (Helper.isString(fun)) {
      console.assert(args.length === 0, 'Cannot evaluate a string with arguments');
      return /** @type {string} */ (fun);
    }

    const modArgs = handle ? [handle,...args.map(Helper._serializeArgument)] : args.map(Helper._serializeArgument)
    const isSubFrame = frameId !== void 0
    return new Promise(async (resolve,reject)=>{
      let code = isSubFrame ? `(function(){${Helper._getFramesCode(frameId)};return (${fun})(${modArgs.join(',')})}())` :
        `(${fun})(${modArgs.join(',')})`
      // console.log(code)
      const result = await chrome.tabs.executeAsyncFunction(tabId,{code,allFrames:isSubFrame})
      console.log(result)
      if(result && result.length){
        if(isSubFrame){
          for(let ret of result){
            if(ret != NOT_MATCH_VALUE){ resolve(ret);break }
          }
        }
        else{
          resolve(result[0])
        }
      }
      else{
        reject('error')
      }
    })
  }

  static executeScript({tabId,fun,handle},...args){
    if (Helper.isString(fun)) {
      console.assert(args.length === 0, 'Cannot evaluate a string with arguments');
      return /** @type {string} */ (fun);
    }
    return new Promise((resolve,reject)=>{
      const modArgs = handle ? [handle,...args.map(Helper._serializeArgument)] : args.map(Helper._serializeArgument)
      const code = `(${fun})(${modArgs.join(',')})`
      Helper.simpleIpcFunc('auto-play-evaluate',resolve,tabId,code)
    })
  }

  static simpleIpcFunc(name,callback,...args){
    const key = uuid.v4()
    chrome.ipcRenderer.once(`${name}-reply_${key}`,(event,...results)=>{
      if(callback) callback(...results)
    })
    chrome.ipcRenderer.send(name,key,...args)
  }

  static isString(obj) {
    return typeof obj === 'string' || obj instanceof String;
  }

  static isNumber(obj) {
    return typeof obj === 'number' || obj instanceof Number;
  }

  static stringEscape(string){
    return ('' + string).replace(/['\\\n\r\u2028\u2029]/g, function (character) {
      // Escape all characters not included in SingleStringCharacters and
      // DoubleStringCharacters on
      // http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.4
      switch (character) {
        case "'":
        case '\\':
          return '\\' + character
        // Four possible LineTerminator characters need to be escaped:
        case '\n':
          return '\\n'
        case '\r':
          return '\\r'
        case '\u2028':
          return '\\u2028'
        case '\u2029':
          return '\\u2029'
      }
    })
  }



}