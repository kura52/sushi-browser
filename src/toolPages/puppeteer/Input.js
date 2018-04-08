import helper from "./helper";
import defaultOptions from './defaultOptions'
const keyDefinitions = require('./USKeyboardLayout');

/**
 * @typedef {Object} KeyDescription
 * @property {number} keyCode
 * @property {string} key
 * @property {string} text
 * @property {string} code
 * @property {number} location
 */

class Keyboard {
  /**
   * @param {!Puppeteer.CDPSession} client
   */
  constructor(tabId) {
    this.tabId = tabId
  }

  common(mode,text,options){
    if(options.delay === void 0) options.delay = defaultOptions.typeInterval
    return new Promise(resolve=>helper.simpleIpcFunc('auto-play-keyboard',
      _=>resolve(void 0),mode,this.tabId,text,options))
  }

  /**
   * @param {string} key
   * @param {{text: string}=} options
   */
  async down(key, options = { text: undefined }) {
    //@TODO text?
    this.common('down',keyDefinitions[key].key,options)
  }

  /**
   * @param {string} key
   * @return {number}
   */
  _modifierBit(key) {
    if (key === 'Alt')
      return 1;
    if (key === 'Control')
      return 2;
    if (key === 'Meta')
      return 4;
    if (key === 'Shift')
      return 8;
    return 0;
  }

  /**
   * @param {string} keyString
   * @return {KeyDescription}
   */
  _keyDescriptionForString(keyString) {
    const shift = this._modifiers & 8;
    const description = {
      key: '',
      keyCode: 0,
      code: '',
      text: '',
      location: 0
    };

    const definition = keyDefinitions[keyString];
    console.assert(definition, `Unknown key: "${keyString}"`);

    if (definition.key)
      description.key = definition.key;
    if (shift && definition.shiftKey)
      description.key = definition.shiftKey;

    if (definition.keyCode)
      description.keyCode = definition.keyCode;
    if (shift && definition.shiftKeyCode)
      description.keyCode = definition.shiftKeyCode;

    if (definition.code)
      description.code = definition.code;

    if (definition.location)
      description.location = definition.location;

    if (description.key.length === 1)
      description.text = description.key;

    if (definition.text)
      description.text = definition.text;
    if (shift && definition.shiftText)
      description.text = definition.shiftText;

    // if any modifiers besides shift are pressed, no text should be sent
    if (this._modifiers & ~8)
      description.text = '';

    return description;
  }

  /**
   * @param {string} key
   */
  async up(key) {
    this.common('up',keyDefinitions[key].key,{})
  }

  /**
   * @param {string} text
   * @param {{delay: (number|undefined)}=} options
   */
  async type(text, options = {}) {
    this.common('type',text,options)
  }

  /**
   * @param {string} key
   * @param {!Object=} options
   */
  async press(key, options) {
    this.common('press',keyDefinitions[key].key,options)
  }
}

class Mouse {
  constructor(tabId) {
    this.tabId = tabId
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {Object=} options
   * @return {!Promise}
   */
  async move(x, y, options = {}) {
    this._x = x, this._y = y
    return new Promise(resolve=>helper.simpleIpcFunc('auto-play-mouse',_=>resolve(void 0),'move',this.tabId,x,y,options))
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {!Object=} options
   */
  async click(x, y, options = {}) {
    this._x = x, this._y = y
    return new Promise(resolve=>helper.simpleIpcFunc('auto-play-mouse',_=>resolve(void 0),'click',this.tabId,x,y,options))
  }

  /**
   * @param {!Object=} options
   */
  async down(options = {}) {
    return new Promise(resolve=>helper.simpleIpcFunc('auto-play-mouse',_=>resolve(void 0),'down',this.tabId,this._x,this._y,options))
  }

  /**
   * @param {!Object=} options
   */
  async up(options = {}) {
    return new Promise(resolve=>helper.simpleIpcFunc('auto-play-mouse',_=>resolve(void 0),'down',this.tabId,this._x,this._y,options))
  }
}

module.exports = { Keyboard, Mouse};
