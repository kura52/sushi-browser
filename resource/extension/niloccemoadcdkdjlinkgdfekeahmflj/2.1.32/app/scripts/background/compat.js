/* global chrome */
var needsCompat = false;
if (typeof browser != 'undefined')
{
  chrome = browser;
  window.chrome = chrome;
  needsCompat = true;
}

if(needsCompat) {
    var noOp = function () { };

    // Deprecated APIs
    chrome.extension.onMessage = chrome.runtime.onMessage;
    chrome.extension.sendMessage = chrome.runtime.sendMessage;
    chrome.extension.onRequest = chrome.runtime.onMessage;
    chrome.extension.sendRequest = chrome.runtime.sendMessage;

    if(!chrome.runtime.onUpdateAvailable) {
        chrome.runtime.onUpdateAvailable = Array();
    }

    if(!chrome.runtime.onUpdateAvailable.addListener) {
        chrome.runtime.onUpdateAvailable.addListener = noOp;
    }

    if(!chrome.app) {
        chrome.app = Array();
    }

    if(!chrome.app.getDetails) {
        chrome.app.getDetails = function() { return '1.9.42'; }
    }

}
