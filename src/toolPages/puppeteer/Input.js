import helper from "./helper";
import defaultOptions from './defaultOptions'
const keyDefinitions = require('./USKeyboardLayout');

const puppeteerKeyToElectron = {
  ArrowUp : 'Up',
  ArrowRight : 'Right',
  ArrowLeft : 'Left',
  ArrowDown : 'Down',
  AudioVolumeMute : 'VolumeMute',
  AudioVolumeDown : 'VolumeDown',
  AudioVolumeUp : 'VolumeUp',
  Meta : 'Command',
  ShiftLeft : 'Shift',
  MetaLeft : 'Meta',
  ControlLeft : 'Control',
  AltLeft : 'Alt'
}

class Keyboard {

  constructor(tabId) {
    this.tabId = tabId
    this._pressedKeys = new Set()
    this._modifiers = new Set()
  }

  common(mode,key,text,options={}){
    if(!helper.isNumber(options.delay)) options.delay = defaultOptions.typeInterval
    if(mode != 'type' && this._modifiers.size) options.modifiers = [...this._modifiers]

    return new Promise(resolve=>helper.simpleIpcFunc('auto-play-keyboard',
      _=>resolve(void 0),mode,this.tabId,key,text,options))
  }

  /**
   * @param {string} key
   * @param {{text: string}=} options
   */
  down(key, options = { text: undefined }) {
    const description = this._keyDescriptionForString(key)
    this._pressedKeys.add(description.code)
    this._modifierAdd(description.key)

    const text = options.text === undefined ? description.text : options.text

    return this.common('down',description.key,text)
  }


  _modifierAdd(key) {
    if (key === 'Alt' || key === 'Control' || key === 'Meta' || key === 'Shift')
      this._modifiers.add(key)
  }

  _modifierRemove(key) {
    if (key === 'Alt' || key === 'Control' || key === 'Meta' || key === 'Shift')
      this._modifiers.remove(key)
  }

  /**
   * @param {string} keyString
   * @return {KeyDescription}
   */
  _keyDescriptionForString(keyString) {
    const shift = this._modifiers.has('Shift')
    const description = {
      key: '',
      text: ''
    };

    const definition = keyDefinitions[keyString];
    console.assert(definition, `Unknown key: "${keyString}"`);

    if (definition.key)
      description.key = definition.key;
    if (shift && definition.shiftKey)
      description.key = definition.shiftKey;

    description.key = puppeteerKeyToElectron[description.key] || description.key

    if (description.key.length === 1)
      description.text = description.key;


    if (definition.text)
      description.text = definition.text;
    if (shift && definition.shiftText)
      description.text = definition.shiftText;

    // if any modifiers besides shift are pressed, no text should be sent
    if (this._modifiers.length > 2 || (!shift && this._modifiers.length == 1))
      description.text = ''

    return description;
  }

  /**
   * @param {string} key
   */
  up(key) {
    const description = this._keyDescriptionForString(key)
    this._pressedKeys.add(description.code)
    this._modifierRemove(description.key)

    return this.common('up',description.key)
  }

  /**
   * @param {string} char
   */
  sendCharacter(char) {
    const description = this._keyDescriptionForString(key)

    return this.common('press',description.key)
  }

  /**
   * @param {string} text
   * @param {{delay: (number|undefined)}=} options
   */
  type(text, options = {}) {
    return this.common('type',void 0,text,options)
  }

  /**
   * @param {string} key
   * @param {!Object=} options
   */
  press(key, options = {}) {
    const description = this._keyDescriptionForString(key)
    this._pressedKeys.add(description.code)
    this._modifierAdd(description.key)

    const text = options.text === undefined ? description.text : options.text

    return this.common('click',description.key,text)
  }
}

class Mouse {
  constructor(tabId, keyboard) {
    this.tabId = tabId
    this._keyboard = keyboard
  }

  _addModifierOption(options){
    if(this._keyboard._modifiers.size) options.modifiers = [...this._keyboard._modifiers]
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {Object=} options
   * @return {!Promise}
   */
  async move(x, y, options = {}) {
    this._addModifierOption(options)
    this._x = x, this._y = y
    return new Promise(resolve=>helper.simpleIpcFunc('auto-play-mouse',_=>resolve(void 0),'move',this.tabId,x,y,options))
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {!Object=} options
   */
  async click(x, y, options = {}) {
    this._addModifierOption(options)
    this._x = x, this._y = y
    return new Promise(resolve=>helper.simpleIpcFunc('auto-play-mouse',_=>resolve(void 0),'click',this.tabId,x,y,options))
  }

  /**
   * @param {!Object=} options
   */
  async down(options = {}) {
    this._addModifierOption(options)
    return new Promise(resolve=>helper.simpleIpcFunc('auto-play-mouse',_=>resolve(void 0),'down',this.tabId,this._x,this._y,options))
  }

  /**
   * @param {!Object=} options
   */
  async up(options = {}) {
    this._addModifierOption(options)
    return new Promise(resolve=>helper.simpleIpcFunc('auto-play-mouse',_=>resolve(void 0),'down',this.tabId,this._x,this._y,options))
  }
}

module.exports = { Keyboard, Mouse};
