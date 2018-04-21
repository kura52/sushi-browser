const ipc = chrome.ipcRenderer

class Dialog {
  /**
   * @param {!Puppeteer.CDPSession} client
   * @param {string} type
   * @param {string} message
   * @param {(string|undefined)} defaultValue
   */
  constructor(type, message, defaultValue = '',tabId) {
    this._type = type;
    this._message = message;
    this._defaultValue = defaultValue;
    this._tabId = tabId;
  }

  /**
   * @return {string}
   */
  type() {
    return this._type;
  }

  /**
   * @return {string}
   */
  message() {
    return this._message;
  }

  /**
   * @return {string}
   */
  defaultValue() {
    return this._defaultValue;
  }

  /**
   * @param {string=} promptText
   */
  async accept(promptText) {
    ipc.send('auto-play-notification',this._tabId,0)
  }

  async dismiss() {
    ipc.send('auto-play-notification',this._tabId,this._type == 'alert' ? 0 : 1)
  }
}

Dialog.Type = {
  Alert: 'alert',
  // BeforeUnload: 'beforeunload',
  Confirm: 'confirm',
  Prompt: 'prompt'
};

module.exports = Dialog;
