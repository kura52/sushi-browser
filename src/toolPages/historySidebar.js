window.debug = require('debug')('info')
import process from './process'
import React from 'react';
import ReactDOM from 'react-dom';
import App from './historyBase';

import '../defaultExtension/contentscript'

require('./themeForPage')('themeHistorySidebar')

ReactDOM.render(
  <App sidebar={true}/>,
  document.querySelector('#classic')
);
