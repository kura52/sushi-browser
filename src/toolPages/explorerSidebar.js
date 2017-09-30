window.debug = require('debug')('info')
// require('debug').enable("info")
import process from './process'
import React from 'react';
import ReactDOM from 'react-dom';
import {FileExplorer, getHome} from './explorer';
import path from 'path';

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

