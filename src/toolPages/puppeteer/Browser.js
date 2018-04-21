import Page from './Page'
import helper from './helper'
const pagesMap = {}

class Browser{
  /**
   * @return {?Puppeteer.ChildProcess}
   */
  process() {
    return this._process;
  }

  /**
   * @return {!Promise<!Puppeteer.Page>}
   */
  newPage({url, active}={}) {
    return new Page({url,active})
  }

  /**
   * @return {!Array<!Target>}
   */
  targets() {
    return Array.from(this._targets.values()).filter(target => target._isInitialized);
  }

  /**
   * @return {!Promise<!Array<!Puppeteer.Page>>}
   */
  pages() {
    return new Promise(resolve=>{
      chrome.windows.getAll({populate:true},windows=>{
        const pages = []
        for(let win of windows){
          for(let tab of win.tabs){
            if(!pagesMap[tab.id]){
              pagesMap[tab.id] = new Page({tab})
            }
            pages.push(pagesMap[tab.id])
          }
        }
        resolve(Promise.all(pages))
      })
    })
  }

  /**
   * @return {!Promise<string>}
   */
  version() {
    return new Promise(r=>r(navigator.appVersion.match(/(Chrome\/[\d\.]+)/)[0]))
  }

  /**
   * @return {!Promise<string>}
   */
  userAgent() {
    return new Promise(r=>r(navigator.userAgent))
  }

  async close() {
    helper._stopObserveLoadEvent()
  }

  disconnect() {
    this._connection.dispose();
  }


}

/** @enum {string} */
Browser.Events = {
  TargetCreated: 'targetcreated',
  TargetDestroyed: 'targetdestroyed',
  TargetChanged: 'targetchanged',
  Disconnected: 'disconnected'
};

module.exports = Browser;

/**
 * @typedef {Object} BrowserOptions
 * @property {boolean=} appMode
 * @property {boolean=} ignoreHTTPSErrors
 */