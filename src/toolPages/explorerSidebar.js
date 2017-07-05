window.debug = require('debug')('info')
// require('debug').enable("info")
import process from './process'
const React = require('react')
const ReactDOM = require('react-dom')
const {FileExplorer,getHome} = require('./explorer')
const path = require('path')

;(async ()=>{
  const homePath = await getHome()

  ReactDOM.render(<FileExplorer items={[{
    name: path.basename(homePath),
    path: homePath,
    type: 'directory',
    expanded: true,
    children: []
  }]} sidebar={true}  />,  document.querySelector('.l-content .explorer'))

})()

