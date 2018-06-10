window.debug = require('debug')('info')
import process from './process'
import React from 'react';
import ReactDOM from 'react-dom';
import App from './noteBase';



ReactDOM.render(
  <App sidebar={true}/>,
  document.querySelector('#classic')
);
