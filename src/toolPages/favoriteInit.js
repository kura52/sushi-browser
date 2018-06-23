window.debug = require('debug')('info')
import process from './process'
import React from 'react';
import ReactDOM from 'react-dom';
import App from './favoriteBase';

require('./themeForPage')('themeBookmark')

ReactDOM.render(
  <App favoritePage={true}/>,
  document.querySelector('#classic')
);
