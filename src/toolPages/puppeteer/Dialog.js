class Dialog {
  /**
   * @param {!Puppeteer.CDPSession} client
   * @param {string} type
   * @param {string} message
   * @param {(string|undefined)} defaultValue
   */
  constructor(client, type, message, defaultValue = '') {
    this._client = client;
    this._type = type;
    this._message = message;
    this._handled = false;
    this._defaultValue = defaultValue;
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
    console.assert(!this._handled, 'Cannot accept dialog which is already handled!');
    this._handled = true;
    await this._client.send('Page.handleJavaScriptDialog', {
      accept: true,
      promptText: promptText
    });
  }

  async dismiss() {
    console.assert(!this._handled, 'Cannot dismiss dialog which is already handled!');
    this._handled = true;
    await this._client.send('Page.handleJavaScriptDialog', {
      accept: false
    });
  }
}

Dialog.Type = {
  Alert: 'alert',
  BeforeUnload: 'beforeunload',
  Confirm: 'confirm',
  Prompt: 'prompt'
};

module.exports = Dialog;
helper.tracePublicAPI(Dialog);
