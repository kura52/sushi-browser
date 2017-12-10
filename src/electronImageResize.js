'use strict';

var electron = require('electron');
var BrowserWindow = electron.BrowserWindow || electron.remote.BrowserWindow;
var nativeImage = electron.nativeImage;

let win
export default {
  open(opts){
    win = new BrowserWindow({
      x: 0,
      y: 0,
      width: opts.width,
      height: opts.height,
      show: false,
      frame: false,
      enableLargerThanScreen: true,
      webPreferences: {
        nodeIntegration: false
      }
    });
  },

  close(){
    win.close()
  },

  capture(params){

    var opts = params || {};
    return new Promise((resolve, reject) => {
      if (typeof opts.url !== 'string') {
        reject(new TypeError('Expected option: `url` of type string'));
        return;
      }

      if (typeof opts.height !== 'number' && typeof opts.width !== 'number') {
        reject(new TypeError('Expected option: `height` or `width` of type number'));
        return;
      }

      if (!(typeof opts.height === 'number' && typeof opts.width === 'number')) {
        var imageLocation = opts.url.replace('file://', '');
        var originalSize = nativeImage.createFromPath(imageLocation).getSize();

        if (typeof opts.height !== 'number') {
          opts.height = parseInt(originalSize.height * opts.width / originalSize.width, 10);
        } else {
          opts.width = parseInt(originalSize.width * opts.height / originalSize.height, 10);
        }
      }

      if (typeof opts.delay !== 'number') {
        opts.delay = 100;
      }


      var isRejected = false;
      var $reject = err => {
        win.close();
        isRejected = true;
        return reject(err);
      };

      win.once('closed', () => {
        win = null;
      });

      win.loadURL(opts.url);

      win.webContents.once('did-get-response-details',
        (event, status, newURL, originalURL, httpResponseCode) => {
          if (httpResponseCode !== 200) {
            $reject(
              new Error(
                `Expected: 200. Received: ${httpResponseCode}. Response not ok: ${originalURL}`
              )
            );
          }
        });

      win.webContents.once('did-fail-load', (ev, errCode, errDescription, url) =>
        $reject(new Error(`failed loading: ${url} ${errDescription}`))
      );
      win.webContents.once('did-finish-load', () => {
        if (isRejected) return;
        setTimeout(() => {
          win.capturePage(img => {
            if (isRejected) return;
            resolve(img);
          });
        }, opts.delay);
      });
    });
  }
}
