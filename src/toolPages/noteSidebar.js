window.debug = require('debug')('info')
import process from './process'
import React from 'react';
import ReactDOM from 'react-dom';
import App from './noteBase';

function getUrlVars(){
  const vars = {};
  const param = location.search.substring(1).split('&');
  for(let i = 0; i < param.length; i++) {
    const keySearch = param[i].search(/=/);
    let key = '';
    if(keySearch != -1) key = param[i].slice(0, keySearch);
    const val = param[i].slice(param[i].indexOf('=', 0) + 1);
    if(key != '') vars[key] = decodeURIComponent(val);
  }
  return vars;
}

const isSidebar = location.href == "chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/note_sidebar.html"
let id,content
if(!isSidebar){
  const vars =  getUrlVars()
  id = vars.id
  content = vars.content
}


ReactDOM.render(
  <App sidebar={isSidebar} favoritePage={!isSidebar} id={id} content={content}/>,
  document.querySelector('#classic')
);
