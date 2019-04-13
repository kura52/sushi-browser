window.debug = require('debug')('info')
// require('debug').enable("info")
import process from './process'
import React from 'react';
import ReactDOM from 'react-dom';
import {FileExplorer, getHome} from './explorer';
import path from 'path';

import '../defaultExtension/contentscript'

;(async ()=>{
  const homePath = await getHome()

  require('./themeForPage')('themeExplorerSidebar')

  ReactDOM.render(<FileExplorer items={[{
    name: path.basename(homePath),
    path: homePath,
    type: 'directory',
    expanded: true,
    children: []
  }]} sidebar={true}  />,  document.querySelector('.l-content .explorer'))

})()

