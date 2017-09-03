window.debug = require('debug')('info')
import process from './process'
const React = require('react')
const ReactDOM = require('react-dom')
const App = require('./favoriteBase')

ReactDOM.render(
  <App favoritePage={true}/>,
  document.querySelector('#classic')
);
