window.debug = require('debug')('info')
// require('debug').enable("info")
import process from './process'
const React = require('react')
const ReactDOM = require('react-dom')
const FavoriteExplorer = require('./favorite')

ReactDOM.render(<FavoriteExplorer items={[{
  name: 'favorite',
  path: 'root',
  type: 'directory',
  expanded: true,
  children: []
}]} />,  document.querySelector('.l-content .explorer'))