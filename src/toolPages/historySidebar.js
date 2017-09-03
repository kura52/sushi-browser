window.debug = require('debug')('info')
import process from './process'
const React = require('react')
const ReactDOM = require('react-dom')
const App = require('./historyBase')


ReactDOM.render(
  <App sidebar={true}/>,
  document.querySelector('#classic')
);
