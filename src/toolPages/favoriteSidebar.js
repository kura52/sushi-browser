window.debug = require('debug')('info')
import process from './process'
import React from 'react';
import ReactDOM from 'react-dom';
import App from './favoriteBase';

import '../defaultExtension/contentscript'

require('./themeForPage')('themeBookmarkSidebar')

;(async ()=>{
  // await initPromise
  ReactDOM.render(
    <App sidebar={true}/>,
    document.querySelector('#classic')
  );
})()
