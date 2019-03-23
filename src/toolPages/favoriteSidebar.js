window.debug = require('debug')('info')
import process from './process'
import React from 'react';
import ReactDOM from 'react-dom';
import App from './favoriteBase';
import '../defaultExtension/contentscript'
import l10n from '../../brave/js/l10n';
const initPromise = l10n.init()

require('./themeForPage')('themeBookmarkSidebar')

;(async ()=>{
  await initPromise
  ReactDOM.render(
    <App sidebar={true}/>,
    document.querySelector('#classic')
  );
})()
