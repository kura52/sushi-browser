import ElementHandle from './ElementHandle'
import helper from './helper'
import defaultOptions from './defaultOptions'
import PubSub from '../../render/pubsub'
import uuid from 'node-uuid'
const ipc = chrome.ipcRenderer

function simpleIpcFunc(name,callback,...args){
  const key = Math.random().toString()
  ipc.once(`${name}-reply_${key}`,(event,...results)=>{
    if(callback) callback(...results)
  })
  ipc.send(name,key,...args)
}

const getFramesCode = `(_ => {
  const getFrameIndex = ()=>{
    if (window.top === window.self)
      return 0;
    for (var i=0; i<window.top.frames.length; i++) {
      if (window.top.frames[i] === window.self) {
        return i+1;
      }
    }
    return -1;
  };
  return {index: getFrameIndex(),url:location.href}
})();`

class FrameManager {
  /**
   * @param {!Puppeteer.CDPSession} client
   * @param {{frame: Object, childFrames: ?Array}} frameTree
   * @param {!Puppeteer.Page} page
   */
  constructor(tabId,page) {
    this.tabId = tabId
    this._page = page
    this._mainFrame = new Frame(tabId,page,this,0)
  }

  /**
   * @return {!Frame}
   */
  mainFrame() {
    return this._mainFrame;
  }

  /**
   * @return {!Array<!Frame>}
   */
  frames() {
    return new Promise(async resolve=>{
      const results = await chrome.tabs.executeAsyncFunction(this.tabId,{allFrames:true,code:getFramesCode})
      const frames = []
      for(let result of results){
        if(result.index < 0) continue
        const fr = result.index === 0 ? this._mainFrame : new Frame(this.tabId,this._page,this,result.index,result.url,this._mainFrame)
        frames.push(fr)
      }
      resolve(frames)
    })
  }

}

/**
 * @unrestricted
 */
class Frame {
  constructor(tabId, page, frameManager, frameId, url, parentFrame) {
    this.tabId = tabId
    this._page = page
    this._frameManager = frameManager
    this.frameId = frameId
    this.isMain = !this.frameId
    this._url = url
    this._parentFrame = parentFrame
    this._waitTasks = new Set()
  }

  /**
   * @param {function()|string} pageFunction
   * @param {!Array<*>} args
   * @return {!Promise<!Puppeteer.JSHandle>}
   */
  async evaluateHandle(pageFunction, ...args) {
    const context = await this._contextPromise;
    return context.evaluateHandle(pageFunction, ...args);
  }

  /**
   * @param {Function|string} pageFunction
   * @param {!Array<*>} args
   * @return {!Promise<*>}
   */
  evaluate(pageFunction, ...args) {
    if(this.isMain){
      return helper.executeScript({tabId:this.tabId,fun:pageFunction},...args)
    }
    else{
      return this.evaluateExtContext(pageFunction, ...args)
    }
  }

  /**
   * @param {Function|string} pageFunction
   * @param {!Array<*>} args
   * @return {!Promise<*>}
   */
  evaluateExtContext(pageFunction, ...args) {
    return helper.executeScriptExtContext({tabId:this.tabId,frameId:this.isMain ? void 0 :this.frameId,fun:pageFunction},...args)
  }

  /**
   * @param {string} selector
   * @return {!Promise<?ElementHandle>}
   */
  async $(selector) {
    return new ElementHandle(selector,this._page,this._frameManager)
  }

  /**
   * @return {!Promise<!ElementHandle>}
   */
  async _document() {
    if (this._documentPromise)
      return this._documentPromise;
    this._documentPromise = this._contextPromise.then(async context => {
      const document = await context.evaluateHandle('document');
      return document.asElement();
    });
    return this._documentPromise;
  }

  /**
   * @param {string} expression
   * @return {!Promise<!Array<!ElementHandle>>}
   */
  async $x(expression) {
    return new ElementHandle('html',this._page,this._frameManager).$x(expression)
  }

  /**
   * @param {string} selector
   * @param {Function|string} pageFunction
   * @param {!Array<*>} args
   * @return {!Promise<(!Object|undefined)>}
   */
  async $eval(selector, pageFunction, ...args) {
    const obj = {tabId:this.tabId,fun:pageFunction,handle:`document.querySelector('${helper.stringEscape(selector)}')`}
    if(this.isMain){
      return helper.executeScript(obj,...args)
    }
    else{
      obj.frameId = this.frameId
      return helper.executeScriptExtContext(obj,...args)
    }
  }

  /**
   * @param {string} selector
   * @param {Function|string} pageFunction
   * @param {!Array<*>} args
   * @return {!Promise<(!Object|undefined)>}
   */
  async $$eval(selector, pageFunction, ...args) {
    const obj = {tabId:this.tabId,fun:pageFunction,handle:`document.querySelectorAll('${helper.stringEscape(selector)}')`}
    if(this.isMain){
      return helper.executeScript(obj,...args)
    }
    else{
      obj.frameId = this.frameId
      return helper.executeScriptExtContext(obj,...args)
    }
  }

  /**
   * @param {string} selector
   * @return {!Promise<!Array<!ElementHandle>>}
   */
  async $$(selector) {
    return new ElementHandle('html',this._page,this._frameManager).$$(selector)
  }

  /**
   * @return {!Promise<String>}
   */
  async content() {
    return await this.evaluateExtContext(() => {
      let retVal = '';
      if (document.doctype)
        retVal = new XMLSerializer().serializeToString(document.doctype);
      if (document.documentElement)
        retVal += document.documentElement.outerHTML;
      return retVal;
    });
  }

  /**
   * @param {string} html
   */
  async setContent(html) {
    await this.evaluateExtContext(html => {
      document.open();
      document.write(html);
      document.close();
    }, html);
  }

  /**
   * @return {string}
   */
  name() {
    return this._name || '';
  }

  /**
   * @return {string}
   */
  url() {
    if(this.isMain){
      return ipc.sendSync('auto-get-sync',this.tabId,'url')
    }
    else{
      return this._url
    }
  }

  /**
   * @return {?Frame}
   */
  parentFrame() {
    return this._parentFrame;
  }

  /**
   * @return {!Array.<!Frame>}
   */
  childFrames() {
    return Array.from(this._childFrames);
  }

  /**
   * @param {Object} options
   * @return {!Promise<!ElementHandle>}
   */
  async addScriptTag(options) {
    if (typeof options.url === 'string') {
      const url = options.url;
      try {
        // const context = await this._contextPromise;
        // return (await context.evaluateHandle(addScriptUrl, url, options.type)).asElement();
        return (await this.evaluate(addScriptUrl, url, options.type));
      } catch (error) {
        throw new Error(`Loading script from ${url} failed`);
      }
    }

    if (typeof options.path === 'string') {
      let contents = await new Promise(resolve=>simpleIpcFunc('read-file',resolve,options.path))
      contents += '//# sourceURL=' + options.path.replace(/\n/g, '');
      // const context = await this._contextPromise;
      // return (await context.evaluateHandle(addScriptContent, contents, options.type)).asElement();
      return (await this.evaluate(addScriptContent, contents, options.type));
    }

    if (typeof options.content === 'string') {
      // const context = await this._contextPromise;
      // return (await context.evaluateHandle(addScriptContent, options.content, options.type));
      return (await this.evaluate(addScriptContent, options.content, options.type));
    }

    throw new Error('Provide an object with a `url`, `path` or `content` property');

    /**
     * @param {string} url
     * @param {string} type
     * @return {!Promise<!HTMLElement>}
     */
    async function addScriptUrl(url, type) {
      const script = document.createElement('script');
      script.src = url;
      if (type)
        script.type = type;
      document.head.appendChild(script);
      await new Promise((res, rej) => {
        script.onload = res;
        script.onerror = rej;
      });
      return script;
    }

    /**
     * @param {string} content
     * @param {string} type
     * @return {!HTMLElement}
     */
    function addScriptContent(content, type = 'text/javascript') {
      const script = document.createElement('script');
      script.type = type;
      script.text = content;
      document.head.appendChild(script);
      return script;
    }
  }

  /**
   * @param {Object} options
   * @return {!Promise<!ElementHandle>}
   */
  async addStyleTag(options) {
    if (typeof options.url === 'string') {
      const url = options.url;
      try {
        // const context = await this._contextPromise;
        // return (await context.evaluateHandle(addStyleUrl, url)).asElement();
        return (await this.evaluate(addStyleUrl, url));
      } catch (error) {
        throw new Error(`Loading style from ${url} failed`);
      }
    }

    if (typeof options.path === 'string') {
      let contents = await new Promise(resolve=>simpleIpcFunc('read-file',resolve,options.path))
      contents += '/*# sourceURL=' + options.path.replace(/\n/g, '') + '*/';
      // const context = await this._contextPromise;
      // return (await context.evaluateHandle(addStyleContent, contents)).asElement();
      return (await this.evaluate(addStyleContent, contents));
    }

    if (typeof options.content === 'string') {
      // const context = await this._contextPromise;
      // return (await context.evaluateHandle(addStyleContent, options.content)).asElement();
      return (await this.evaluate(addStyleContent, options.content));
    }

    throw new Error('Provide an object with a `url`, `path` or `content` property');

    /**
     * @param {string} url
     * @return {!Promise<!HTMLElement>}
     */
    async function addStyleUrl(url) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
      await new Promise((res, rej) => {
        link.onload = res;
        link.onerror = rej;
      });
      return link;
    }

    /**
     * @param {string} content
     * @return {!HTMLElement}
     */
    function addStyleContent(content) {
      const style = document.createElement('style');
      style.type = 'text/css';
      style.appendChild(document.createTextNode(content));
      document.head.appendChild(style);
      return style;
    }
  }

  _waitUntilElement(selector){
    return new Promise(async (resolve,reject)=>{
      const ret = await this.evaluateExtContext(x=>{
        return !!document.querySelector(x)
      },selector)
      if(ret){
        resolve(true)
        return
      }

      const startDate = Date.now()
      const id = setInterval(async _=>{
        const ret = await this.evaluateExtContext(x=>{
          console.log(document.querySelector(x),x)
          return !!document.querySelector(x)
        },selector)

        if(ret){
          clearInterval(id)
          resolve(true)
        }
        else if(Date.now() - startDate > defaultOptions.timeout){
          clearInterval(id)
          reject("timeout")
        }
      },100)
    })
  }

  _getElementPos(selector){
    return this.evaluateExtContext(x=>{
      const r = document.querySelector(x).getBoundingClientRect()
      return {x:r.x,y:r.y,width:r.width,height:r.height,ww:window.innerWidth,wh:window.innerHeight}
    },selector)
  }

  _scrollPos(selector){
    return this.$eval(selector,ele=>{
      ele.scrollIntoView({block: 'center', inline: 'center', behavior: 'instant'});
      return {currentX:window.scrollX,currentY:window.scrollY}
    })
  }

  async scrollTo(x,y){
    const pos = await this._scrollPos(x,y)
    return {x:pop.currentX, y:pop.currentY}
  }

  async mouseCommmon(selector) {
    let mouseX, mouseY, topX, topY, parentPos

    if(!this.isMain){
      const num = await this.parentFrame().evaluateExtContext(frameId => {
        const subFrame = window.top.frames[frameId - 1]
        let i = 0
        for(let f of document.querySelectorAll('iframe')){
          ++i
          if(f.contentWindow == subFrame){
            return i
          }
        }
      },this.frameId)
      parentPos = await this.parentFrame().mouseCommmon(`iframe:nth-of-type(${num})`)
    }

    // await this._waitUntilElement(selector)
    // var {x, y, width, height, ww, wh} = await this._getElementPos(selector)
    // console.log(x, y, width, height)
    //
    // let absX = Math.round(x + width / 2)
    // let absY = Math.round(y + height / 2)
    // const scrollX = Math.max(0, Math.round(absX - ww / 2))
    // const scrollY = Math.max(0, Math.round(absY - wh / 2))
    // console.log(absX, absY, scrollX, scrollY)
    const {currentX, currentY} = await this._scrollPos(selector)
    // await helper.wait(10)
    var {x, y, width, height, ww, wh} = await this._getElementPos(selector)
    let absX = Math.round(x + width / 2)
    let absY = Math.round(y + height / 2)

    mouseX = absX //- currentX
    mouseY = absY //- currentY
    topX = x //- currentX
    topY = y //- currentY

    if(!this.isMain){
      mouseX = Math.round(mouseX + parentPos.topX)
      mouseY = Math.round(mouseY + parentPos.topY)
    }
    console.log({mouseX,mouseY, x, y, currentX, currentY, absX, absY})
    return {mouseX, mouseY, topX, topY}
  }

  /**
   * @param {string} selector
   * @param {!Object=} options
   */
  async click(selector, options = {}) {
    let {mouseX, mouseY} = await this.mouseCommmon(selector)
    this._page.mouse.click(mouseX,mouseY,options)
  }

  /**
   * @param {string} selector
   */
  async focus(selector) {
    return this.evaluateExtContext(x => document.querySelector(x).focus(),selector)
  }

  /**
   * @param {string} selector
   */
  async hover(selector) {
    let {mouseX, mouseY} = await this.mouseCommmon(selector)
    this._page.mouse.move(mouseX,mouseY)
  }

  /**
   * @param {string} selector
   * @param {!Array<string>} values
   * @return {!Promise<!Array<string>>}
   */
  select(selector, ...values){
    for (const value of values)
      console.assert(helper.isString(value), 'Values must be strings. Found value "' + value + '" of type "' + (typeof value) + '"');
    return this.$eval(selector, (element, values) => {
      if (element.nodeName.toLowerCase() !== 'select')
        throw new Error('Element is not a <select> element.');

      const options = Array.from(element.options);
      element.value = undefined;
      for (const option of options) {
        option.selected = values.includes(option.value);
        if (option.selected && !element.multiple)
          break;
      }
      element.dispatchEvent(new Event('input', { 'bubbles': true }));
      element.dispatchEvent(new Event('change', { 'bubbles': true }));
      return options.filter(option => option.selected).map(option => option.value);
    }, values);
  }

  /**
   * @param {string} selector
   */
  async tap(selector) {
    const handle = await this.$(selector);
    console.assert(handle, 'No node found for selector: ' + selector);
    await handle.tap();
    await handle.dispose();
  }


  /**
   * @param {string} selector
   * @param {string} text
   * @param {{delay: (number|undefined)}=} options
   */
  async type(selector, text, options) {
    await this.focus(selector)
    await this._page.keyboard.type(text, options);
  }

  /**
   * @param {(string|number|Function)} selectorOrFunctionOrTimeout
   * @param {!Object=} options
   * @param {!Array<*>} args
   * @return {!Promise}
   */
  waitFor(selectorOrFunctionOrTimeout, options = {}, ...args) {
    const xPathPattern = '//';

    if (helper.isString(selectorOrFunctionOrTimeout)) {
      const string = /** @type {string} */ (selectorOrFunctionOrTimeout);
      if (string.startsWith(xPathPattern))
        return this.waitForXPath(string, options);
      return this.waitForSelector(string, options);
    }
    if (helper.isNumber(selectorOrFunctionOrTimeout))
      return new Promise(fulfill => setTimeout(fulfill, selectorOrFunctionOrTimeout));
    if (typeof selectorOrFunctionOrTimeout === 'function')
      return this.waitForFunction(selectorOrFunctionOrTimeout, options, ...args);
    return Promise.reject(new Error('Unsupported target type: ' + (typeof selectorOrFunctionOrTimeout)));
  }

  /**
   * @param {string} selector
   * @param {!Object=} options
   * @return {!Promise}
   */
  waitForSelector(selector, options = {}) {
    return this._waitForSelectorOrXPath(selector, false, options);
  }

  /**
   * @param {string} xpath
   * @param {!Object=} options
   * @return {!Promise}
   */
  waitForXPath(xpath, options = {}) {
    return this._waitForSelectorOrXPath(xpath, true, options);
  }

  /**
   * @param {Function|string} pageFunction
   * @param {!Object=} options
   * @return {!Promise}
   */
  waitForFunction(pageFunction, options = {}, ...args) {
    const timeout = helper.isNumber(options.timeout) ? options.timeout : defaultOptions.timeout;
    const polling = options.polling || 'raf';
    return new WaitTask(this, pageFunction, 'function', polling, timeout, ...args).promise;
  }

  /**
   * @return {!Promise<string>}
   */
  async title() {
    return this.evaluateExtContext(() => document.title)
  }

  /**
   * @param {string} selectorOrXPath
   * @param {boolean} isXPath
   * @param {!Object=} options
   * @return {!Promise}
   */
  _waitForSelectorOrXPath(selectorOrXPath, isXPath, options = {}) {
    const waitForVisible = !!options.visible;
    const waitForHidden = !!options.hidden;
    const polling = waitForVisible || waitForHidden ? 'raf' : 'mutation';
    const timeout = helper.isNumber(options.timeout) ? options.timeout : defaultOptions.timeout;
    return new WaitTask(this, predicate, `${isXPath ? 'XPath' : 'selector'} "${selectorOrXPath}"`, polling, timeout, selectorOrXPath, isXPath, waitForVisible, waitForHidden).promise;

    /**
     * @param {string} selectorOrXPath
     * @param {boolean} isXPath
     * @param {boolean} waitForVisible
     * @param {boolean} waitForHidden
     * @return {?Node|boolean}
     */
    function predicate(selectorOrXPath, isXPath, waitForVisible, waitForHidden) {
      const node = isXPath
        ? document.evaluate(selectorOrXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
        : document.querySelector(selectorOrXPath);
      if (!node)
        return waitForHidden;
      if (!waitForVisible && !waitForHidden)
        return node;
      const element = /** @type {Element} */ (node.nodeType === Node.TEXT_NODE ? node.parentElement : node);

      const style = window.getComputedStyle(element);
      const isVisible = style && style.visibility !== 'hidden' && hasVisibleBoundingBox();
      const success = (waitForVisible === isVisible || waitForHidden === !isVisible);
      return success ? node : null;

      /**
       * @return {boolean}
       */
      function hasVisibleBoundingBox() {
        const rect = element.getBoundingClientRect();
        return !!(rect.top || rect.bottom || rect.width || rect.height);
      }
    }
  }

  /**
   * @param {!Object} framePayload
   */
  _navigated(framePayload) {
    this._name = framePayload.name;
    this._url = framePayload.url;
  }

  /**
   * @param {string} loaderId
   * @param {string} name
   */
  _onLifecycleEvent(loaderId, name) {
    if (name === 'init') {
      this._loaderId = loaderId;
      this._lifecycleEvents.clear();
    }
    this._lifecycleEvents.add(name);
  }

  _detach() {
    for (const waitTask of this._waitTasks)
      waitTask.terminate(new Error('waitForFunction failed: frame got detached.'));
    this._detached = true;
    if (this._parentFrame)
      this._parentFrame._childFrames.delete(this);
    this._parentFrame = null;
  }
}

class WaitTask {
  /**
   * @param {!Frame} frame
   * @param {Function|string} predicateBody
   * @param {string|number} polling
   * @param {number} timeout
   * @param {!Array<*>} args
   */
  constructor(frame, predicateBody, title, polling, timeout, ...args) {
    if (helper.isString(polling))
      console.assert(polling === 'raf' || polling === 'mutation', 'Unknown polling option: ' + polling);
    else if (helper.isNumber(polling))
      console.assert(polling > 0, 'Cannot poll with non-positive interval: ' + polling);
    else
      throw new Error('Unknown polling options: ' + polling);

    this._frame = frame;
    this._polling = polling;
    this._timeout = timeout;
    this._predicateBody = helper.isString(predicateBody) ? 'return ' + predicateBody : 'return (' + predicateBody + ')(...args)';
    this._args = args;
    this._runCount = 0;
    frame._waitTasks.add(this);
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
    // Since page navigation requires us to re-install the pageScript, we should track
    // timeout on our end.
    if (timeout)
      this._timeoutTimer = setTimeout(() => this.terminate(new Error(`waiting for ${title} failed: timeout ${timeout}ms exceeded`)), timeout);
    this.rerun();
  }

  /**
   * @param {!Error} error
   */
  terminate(error) {
    this._terminated = true;
    this._reject(error);
    this._cleanup();
  }

  runAndCheckNavigate(func){
    let finished
    let preURL = this._frame.url()
    return new Promise(async resolve=>{
      const listener = details=>{
        if(details.tabId == this._frame.tabId){
          func().then(result=>{
            finished = true
            chrome.webNavigation.onBeforeNavigate.removeListener(listener)
            resolve(result)
          })
        }
      }
      func().then(result=>{
        finished = true
        chrome.webNavigation.onBeforeNavigate.removeListener(listener)
        resolve(result)
      })
      chrome.webNavigation.onBeforeNavigate.addListener(listener)
      setImmediate(async _=>{
        while(!this._terminated && !this._cleanuped){
          await helper.wait(100)
          const URL = this._frame.url()
          if(preURL != URL){
            preURL = URL
            func().then(result=>{
              finished = true
              chrome.webNavigation.onBeforeNavigate.removeListener(listener)
              resolve(result)
            })
          }
        }
        chrome.webNavigation.onBeforeNavigate.removeListener(listener)
      })
    })
  }

  async rerun() {
    const runCount = ++this._runCount;
    /** @type {?JSHandle} */
    let success = null;
    let error = null;
    try {
      success = await this.runAndCheckNavigate(_=>this._frame.evaluateExtContext(waitForPredicatePageFunction, this._predicateBody, this._polling, this._timeout, ...this._args));
    } catch (e) {
      error = e;
    }

    if (this._terminated || runCount !== this._runCount) {
      // if (success)
      //   await success.dispose();
      return;
    }

    // Ignore timeouts in pageScript - we track timeouts ourselves.
    if (!error && await this._frame.evaluate(s => !s, success)) {
    //   await success.dispose();
      return;
    }

    // When the page is navigated, the promise is rejected.
    // We will try again in the new execution context.
    if (error && error.message.includes('Execution context was destroyed'))
      return;

    // We could have tried to evaluate in a context which was already
    // destroyed.
    if (error && error.message.includes('Cannot find context with specified id'))
      return;

    if (error)
      this._reject(error);
    else
      this._resolve(success);

    this._cleanup();
  }

  _cleanup() {
    clearTimeout(this._timeoutTimer);
    this._frame._waitTasks.delete(this);
    this._runningTask = null;
    this._cleanuped = true
  }
}

/**
 * @param {string} predicateBody
 * @param {string} polling
 * @param {number} timeout
 * @return {!Promise<*>}
 */
async function waitForPredicatePageFunction(predicateBody, polling, timeout, ...args) {
  const predicate = new Function('...args', predicateBody);
  let timedOut = false;
  setTimeout(() => timedOut = true, timeout);
  if (polling === 'raf')
    return await pollRaf();
  if (polling === 'mutation')
    return await pollMutation();
  if (typeof polling === 'number')
    return await pollInterval(polling);

  /**
   * @return {!Promise<*>}
   */
  function pollMutation() {
    const success = predicate.apply(null, args);
    if (success)
      return Promise.resolve(success);

    let fulfill;
    const result = new Promise(x => fulfill = x);
    const observer = new MutationObserver(mutations => {
      if (timedOut) {
        observer.disconnect();
        fulfill();
      }
      const success = predicate.apply(null, args);
      if (success) {
        observer.disconnect();
        fulfill(success);
      }
    });
    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: true
    });
    return result;
  }

  /**
   * @return {!Promise<*>}
   */
  function pollRaf() {
    let fulfill;
    const result = new Promise(x => fulfill = x);
    onRaf();
    return result;

    function onRaf() {
      if (timedOut) {
        fulfill();
        return;
      }
      const success = predicate.apply(null, args);
      if (success)
        fulfill(success);
      else
        requestAnimationFrame(onRaf);
    }
  }

  /**
   * @param {number} pollInterval
   * @return {!Promise<*>}
   */
  function pollInterval(pollInterval) {
    let fulfill;
    const result = new Promise(x => fulfill = x);
    onTimeout();
    return result;

    function onTimeout() {
      if (timedOut) {
        fulfill();
        return;
      }
      const success = predicate.apply(null, args);
      if (success)
        fulfill(success);
      else
        setTimeout(onTimeout, pollInterval);
    }
  }
}

module.exports = {FrameManager, Frame};
