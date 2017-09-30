window.debug = require('debug')('info')
import process from './process'
import React from 'react';
import ReactDOM from 'react-dom';
import App from './favoriteBase';



ReactDOM.render(
  <App sidebar={true}/>,
  document.querySelector('#classic')
);
