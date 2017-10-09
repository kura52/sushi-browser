const {BrowserWindow} = require('electron')
import path from 'path'
import fs from 'fs'


export default class OptionPage {
  constructor({basePath, options_page} = {}) {
    this.bgWin = new BrowserWindow({
      webPreferences: {preload: path.join(__dirname, 'preload/extOptPreload.js')}
    });
    // this.bgWin.hide();
    this.bgWin.loadURL(`file://${path.join(basePath,options_page)}`);
  }
}