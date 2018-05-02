import Browser from './Browser'
import helper from "./helper";

module.exports = class {
  /**
   * @param {!Object=} options
   * @return {!Promise<!Puppeteer.Browser>}
   */
  static launch(options) {
    // helper._startObserveLoadEvent()
    return new Promise((resolve,reject)=>{
      resolve(new Browser())
    })
  }

  // static connect(options) {
  //   return Launcher.connect(options);
  // }
  //
  // static executablePath() {
  //   return Launcher.executablePath();
  // }
  //
  // static defaultArgs() {
  //   return Launcher.defaultArgs();
  // }
  //
  // static createBrowserFetcher(options) {
  //   return new BrowserFetcher(options);
  // }
};
