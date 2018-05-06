/**
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

class ExecutionContext {
  /**
   * @param {!Puppeteer.CDPSession} client
   * @param {!Object} contextPayload
   * @param {function(*):!JSHandle} objectHandleFactory
   * @param {?Puppeteer.Frame} frame
   */
  constructor(frame) {
    this._frame = frame;
  }

  /**
   * @return {?Puppeteer.Frame}
   */
  frame() {
    return this._frame;
  }

  /**
   * @param {Function|string} pageFunction
   * @param {...*} args
   * @return {!Promise<(!Object|undefined)>}
   */
  async evaluate(pageFunction, ...args) {
    const handle = await this.evaluateHandle(pageFunction, ...args);
    const result = await handle.jsonValue().catch(error => {
      if (error.message.includes('Object reference chain is too long'))
        return;
      throw error;
    });
    await handle.dispose();
    return result;
  }

  /**
   * @param {Function|string} pageFunction
   * @param {...*} args
   * @return {!Promise<!JSHandle>}
   */
  async evaluateHandle(pageFunction, ...args) {
    return new JSHandle(this._frame, pageFunction, ...args)
  }

}

class JSHandle {
  /**
   * @param {!ExecutionContext} context
   * @param {!Puppeteer.CDPSession} client
   * @param {!Object} remoteObject
   */
  constructor(frame, pageFunction, ...args) {
    return this._init(frame, pageFunction, ...args)
  }

  async _init(frame, pageFunction, ...args){
    this._frame = frame
    this._context = new ExecutionContext(frame)
    this._pageFunction = pageFunction;
    this._result = await this._frame.evaluate(pageFunction, ...args)
    this._args = args;
  }

  /**
   * @return {!ExecutionContext}
   */
  executionContext() {
    return this._context;
  }


  /**
   * @return {!Promise<?Object>}
   */
  async jsonValue() {
    return this._result
  }

  /**
   * @return {?Puppeteer.ElementHandle}
   */
  asElement() {
    return null;
  }

  async dispose() {
  }

  /**
   * @override
   * @return {string}
   */
  toString() {
    return 'JSHandle:'
  }
}

module.exports = {ExecutionContext, JSHandle};
