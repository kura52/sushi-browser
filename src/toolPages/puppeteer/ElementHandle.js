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
const path = require('path');
import {ExecutionContext} from './ExecutionContext'

export default class ElementHandle {
  /**
   * @param {!Puppeteer.ExecutionContext} context
   * @param {!Puppeteer.CDPSession} client
   * @param {!Object} remoteObject
   * @param {!Puppeteer.Page} page
   * @param {!Puppeteer.FrameManager} frameManager
   */
  constructor( selector, page, frame, frameManager) {
    this._selector = selector;
    this._page = page;
    this._frame = frame;
    this._frameManager = frameManager;
    this._context = new ExecutionContext(frame)
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
    return this._frame.$eval(this._selector,e=>e)
  }

  /**
   * @override
   * @return {?ElementHandle}
   */
  asElement() {
    return this;
  }

  async dispose() {
  }

  /**
   * @return {!Promise<?Puppeteer.Frame>}
   */
  async contentFrame() {
    return Promise.resolve(this._frame)
  }

  /**
   * @return {!Promise<?{model: object}>}
   */
  _getBoxModel() {
    return this._frame.$eval(this._selector,ele=>{
      const getProps = (styles, prop)=>{
        let props = {top: 0, right: 0, bottom: 0, left: 0}
        Object.keys(props).forEach(side => {
          let _side = prop + side[0].toUpperCase() + side.substr(1)
          let _prop = parseFloat(styles[_side])
          if (!isNaN(_prop)) props[side] = _prop
        })

        return props
      }

      const calcQuad = (x,y,width,height) => [x,y,x+width,y,x+width,y+height,x,y+height]

      const getBoxQuads = (node)=>{
        if (node === document) node = document.documentElement
        const rect = node.getBoundingClientRect()
        const styles = window.getComputedStyle(node)
        const margins = getProps(styles, 'margin')
        const borders = getProps(styles, 'border')
        const paddings = getProps(styles, 'padding')
        let offsetX = 0,offsetY = 0

        const result = {}
        for(let box of ['content','padding','border','margin']){
          let x = rect.left - offsetX
          let y = rect.top - offsetY
          let width = rect.width
          let height = rect.height

          if (box === 'margin') {
            x -= margins.left
            y -= margins.top
            width += margins.left + margins.right
            height += margins.top + margins.bottom
          }
          else if (box === 'padding') {
            x += borders.left
            y += borders.top
            width -= borders.left + borders.right
            height -= borders.top + borders.bottom
          }
          else if (box === 'content') {
            x += borders.left + paddings.left
            y += borders.top + paddings.top
            width -= borders.left + borders.right + paddings.left + paddings.right
            height -= borders.top + borders.bottom + paddings.top + paddings.bottom
          }

          result[box] = calcQuad(x, y, width, height)
        }
        return result
      }
      return {model:getBoxQuads(ele)}
    })
  }

  /**
   * @param {!Array<number>} quad
   * @return {!Array<object>}
   */
  _fromProtocolQuad(quad) {
    return [
      {x: quad[0], y: quad[1]},
      {x: quad[2], y: quad[3]},
      {x: quad[4], y: quad[5]},
      {x: quad[6], y: quad[7]}
    ];
  }

  async hover() {
    await this._frame.hover(this._selector)
  }

  /**
   * @param {!Object=} options
   */
  async click(options = {}) {
    await this._frame.click(this._selector, options)
  }

  async focus() {
    await this._frame.focus(this._selector)
  }

  /**
   * @param {string} text
   * @param {{delay: (number|undefined)}=} options
   */
  async type(text, options) {
    await this._frame.type(this._selector, text, options)
  }

  /**
   * @param {string} key
   * @param {!Object=} options
   */
  async press(key, options) {
    await this.focus();
    await this._page.keyboard.press(key, options);
  }

  /**
   * @return {!Promise<?{x: number, y: number, width: number, height: number}>}
   */
  async boundingBox() {
    const result = await this._getBoxModel();

    if (!result)
      return null;

    const quad = result.model.border;
    const x = Math.min(quad[0], quad[2], quad[4], quad[6]);
    const y = Math.min(quad[1], quad[3], quad[5], quad[7]);
    const width = Math.max(quad[0], quad[2], quad[4], quad[6]) - x;
    const height = Math.max(quad[1], quad[3], quad[5], quad[7]) - y;

    return {x, y, width, height};
  }

  /**
   * @return {!Promise<?object>}
   */
  async boxModel() {
    const result = await this._getBoxModel();

    if (!result)
      return null;

    const {content, padding, border, margin} = result.model;
    if([...content,...padding,...border,...margin].every(x=>x==0)) return null

    const quad = result.model.border;
    const x = Math.min(quad[0], quad[2], quad[4], quad[6]);
    const y = Math.min(quad[1], quad[3], quad[5], quad[7]);
    const width = Math.max(quad[0], quad[2], quad[4], quad[6]) - x;
    const height = Math.max(quad[1], quad[3], quad[5], quad[7]) - y;

    return {
      content: this._fromProtocolQuad(content),
      padding: this._fromProtocolQuad(padding),
      border: this._fromProtocolQuad(border),
      margin: this._fromProtocolQuad(margin),
      width,
      height
    };
  }

  /**
   * @return {!Promise<?{x: number, y: number, width: number, height: number}>}
   */
  async _assertBoundingBox() {
    const boundingBox = await this.boundingBox();
    if (boundingBox)
      return boundingBox;

    throw new Error('Node is either not visible or not an HTMLElement');
  }

  /**
   *
   * @param {!Object=} options
   * @returns {!Promise<Object>}
   */
  async screenshot(options = {}) {
    let needsViewportReset = false;

    let boundingBox = await this._assertBoundingBox();

    // const viewport = this._page.viewport();
    //
    // if (boundingBox.width > viewport.width || boundingBox.height > viewport.height) {
    //   const newViewport = {
    //     width: Math.max(viewport.width, Math.ceil(boundingBox.width)),
    //     height: Math.max(viewport.height, Math.ceil(boundingBox.height)),
    //   };
    //   await this._page.setViewport(Object.assign({}, viewport, newViewport));
    //
    //   needsViewportReset = true;
    // }

    const { pageX, pageY } = await this._frame.$eval(this._selector,function(element) {
      element.scrollIntoView({block: 'center', inline: 'center', behavior: 'instant'});
      return {pageX:window.scrollX,pageY:window.scrollY}
    });

    boundingBox = await this._assertBoundingBox();

    // const { layoutViewport: { pageX, pageY } } = await this._client.send('Page.getLayoutMetrics');

    const clip = Object.assign({}, boundingBox);
    clip.x += pageX;
    clip.y += pageY;

    const imageData = await this._page.screenshot(Object.assign({}, {
      clip
    }, options));

    // if (needsViewportReset)
    //   await this._page.setViewport(viewport);

    return imageData;
  }

  /**
   * @param {string} selector
   * @return {!Promise<?ElementHandle>}
   */
  async $(selector) {
    const newSelector = await this._frame.$eval(this._selector,(ele,selector)=>{
      const escapeValue = (value) => value && value.replace(/['"`\\/:\?&!#$%^()[\]{|}*+;,.<=>@~]/g, '\\$&').replace(/\n/g, '\A')
      const createSelector = (element)=>{
        for (var sels = []; element && element.nodeType == 1; element = element.parentNode) {
          if(element.id) {
            const escapedId = escapeValue(element.id)
            const uniqueIdCount = document.querySelectorAll(`[id="${escapedId}"]`).length

            if (uniqueIdCount == 1) {
              sels.unshift(`[id="${escapedId}"]`)
              return sels.join(' > ')
            }
            if (element.nodeName) sels.unshift(`${escapeValue(element.nodeName.toLowerCase())}[id="${escapedId}"]`);
          }
          else {
            for (var i = 1, i2 = 1,sib = element.previousSibling; sib; sib = sib.previousSibling) {
              if (sib.nodeName == element.nodeName) i++
            }
            let onlyElement = i == 1
            if(onlyElement){
              for(sib = element.nextSibling;sib;sib = sib.nextSibling){
                if(sib.nodeName == element.nodeName){
                  onlyElement = false
                  break
                }
              }
            }
            let className = element.className
            if(!onlyElement && element.className){
              for(sib = element.previousSibling;sib;sib = sib.previousSibling){
                if(sib.nodeName == element.nodeName && sib.className.trim().replace(/[ \t]+/g, ".") == element.className.trim().replace(/[ \t]+/g, ".")){
                  className = null
                  break
                }
              }
              if(className){
                for(sib = element.nextSibling;sib;sib = sib.nextSibling){
                  if(sib.nodeName == element.nodeName && sib.className.trim().replace(/[ \t]+/g, ".") == element.className.trim().replace(/[ \t]+/g, ".")){
                    className = null
                    break
                  }
                }
              }
            }
            sels.unshift(element.nodeName.toLowerCase() + (onlyElement ? '' : className ? `.${className.trim().replace(/[ \t]+/g, ".")}` : `:nth-of-type(${i})`))
          }
        }
        return sels.length ? sels.join(' > ') : null
      }
      return createSelector(ele.querySelector(selector))
    },selector)

    return new ElementHandle(newSelector,this._page,this._frame,this._frameManager)
  }

  /**
   * @param {string} selector
   * @return {!Promise<!Array<!ElementHandle>>}
   */
  async $$(selector) {
    const newSelectors = await this._frame.$eval(this._selector,(ele,selector)=>{
      const escapeValue = (value) => value && value.replace(/['"`\\/:\?&!#$%^()[\]{|}*+;,.<=>@~]/g, '\\$&').replace(/\n/g, '\A')
      const createSelector = (element)=>{
        for (var sels = []; element && element.nodeType == 1; element = element.parentNode) {
          if(element.id) {
            const escapedId = escapeValue(element.id)
            const uniqueIdCount = document.querySelectorAll(`[id="${escapedId}"]`).length

            if (uniqueIdCount == 1) {
              sels.unshift(`[id="${escapedId}"]`)
              return sels.join(' > ')
            }
            if (element.nodeName) sels.unshift(`${escapeValue(element.nodeName.toLowerCase())}[id="${escapedId}"]`);
          }
          else {
            for (var i = 1, i2 = 1,sib = element.previousSibling; sib; sib = sib.previousSibling) {
              if (sib.nodeName == element.nodeName) i++
            }
            let onlyElement = i == 1
            if(onlyElement){
              for(sib = element.nextSibling;sib;sib = sib.nextSibling){
                if(sib.nodeName == element.nodeName){
                  onlyElement = false
                  break
                }
              }
            }
            let className = element.className
            if(!onlyElement && element.className){
              for(sib = element.previousSibling;sib;sib = sib.previousSibling){
                if(sib.nodeName == element.nodeName && sib.className.trim().replace(/[ \t]+/g, ".") == element.className.trim().replace(/[ \t]+/g, ".")){
                  className = null
                  break
                }
              }
              if(className){
                for(sib = element.nextSibling;sib;sib = sib.nextSibling){
                  if(sib.nodeName == element.nodeName && sib.className.trim().replace(/[ \t]+/g, ".") == element.className.trim().replace(/[ \t]+/g, ".")){
                    className = null
                    break
                  }
                }
              }
            }
            sels.unshift(element.nodeName.toLowerCase() + (onlyElement ? '' : className ? `.${className.trim().replace(/[ \t]+/g, ".")}` : `:nth-of-type(${i})`))
          }
        }
        return sels.length ? sels.join(' > ') : null
      }
      return [...ele.querySelectorAll(selector)].map(ele=>createSelector(ele))
    },selector)

    return newSelectors.map(newSelector => new ElementHandle(newSelector,this._page,this._frame,this._frameManager))
  }

  /**
   * @param {string} expression
   * @return {!Promise<!Array<!ElementHandle>>}
   */
  async $x(expression) {
    const newSelectors = await this._frame.$eval(this._selector,(ele,expression)=>{
      const escapeValue = (value) => value && value.replace(/['"`\\/:\?&!#$%^()[\]{|}*+;,.<=>@~]/g, '\\$&').replace(/\n/g, '\A')
      const createSelector = (element)=>{
        for (var sels = []; element && element.nodeType == 1; element = element.parentNode) {
          if(element.id) {
            const escapedId = escapeValue(element.id)
            const uniqueIdCount = document.querySelectorAll(`[id="${escapedId}"]`).length

            if (uniqueIdCount == 1) {
              sels.unshift(`[id="${escapedId}"]`)
              return sels.join(' > ')
            }
            if (element.nodeName) sels.unshift(`${escapeValue(element.nodeName.toLowerCase())}[id="${escapedId}"]`);
          }
          else {
            for (var i = 1, i2 = 1,sib = element.previousSibling; sib; sib = sib.previousSibling) {
              if (sib.nodeName == element.nodeName) i++
            }
            let onlyElement = i == 1
            if(onlyElement){
              for(sib = element.nextSibling;sib;sib = sib.nextSibling){
                if(sib.nodeName == element.nodeName){
                  onlyElement = false
                  break
                }
              }
            }
            let className = element.className
            if(!onlyElement && element.className){
              for(sib = element.previousSibling;sib;sib = sib.previousSibling){
                if(sib.nodeName == element.nodeName && sib.className.trim().replace(/[ \t]+/g, ".") == element.className.trim().replace(/[ \t]+/g, ".")){
                  className = null
                  break
                }
              }
              if(className){
                for(sib = element.nextSibling;sib;sib = sib.nextSibling){
                  if(sib.nodeName == element.nodeName && sib.className.trim().replace(/[ \t]+/g, ".") == element.className.trim().replace(/[ \t]+/g, ".")){
                    className = null
                    break
                  }
                }
              }
            }
            sels.unshift(element.nodeName.toLowerCase() + (onlyElement ? '' : className ? `.${className.trim().replace(/[ \t]+/g, ".")}` : `:nth-of-type(${i})`))
          }
        }
        return sels.length ? sels.join(' > ') : null
      }
      const iterator = document.evaluate(expression, ele, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE)
      const arr = [];
      let item;
      while ((item = iterator.iterateNext()))
        arr.push(createSelector(item));
      return arr
    },expression)

    return newSelectors.map(newSelector => new ElementHandle(newSelector,this._page,this._frame,this._frameManager))
  }
}
