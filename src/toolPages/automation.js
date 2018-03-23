window.debug = require('debug')('info')
// require('debug').enable("info")
import {ipcRenderer as ipc} from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import uuid from 'node-uuid';
import Selection from '../render/react-selection/indexTable';
import path from 'path';
const isWin = navigator.userAgent.includes('Windows')


const PubSub = require('pubsub-js')

const { Form, TextArea, Grid, Sidebar, Segment, Container, Menu, Input, Divider, Button, Checkbox, Icon, Table, Dropdown } = require('semantic-ui-react');
const { StickyContainer, Sticky } = require('react-sticky');
const l10n = require('../../brave/js/l10n')
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'
l10n.init()


function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function getUrlVars(){
  var vars = {};
  var param = location.search.substring(1).split('&');
  for(var i = 0; i < param.length; i++) {
    var keySearch = param[i].search(/=/);
    var key = '';
    if(keySearch != -1) key = param[i].slice(0, keySearch);
    var val = param[i].slice(param[i].indexOf('=', 0) + 1);
    if(key != '') vars[key] = decodeURIComponent(val);
  }
  return vars;
}

function eachSlice(arr,size){
  const newArray = []
  for (let i = 0, l = arr.length; i < l; i += size){
    newArray.push(arr.slice(i, i + size))
  }
  return newArray
}

function equalArray(a,b){
  const len = a.length
  if(len != b.length) return false
  for(let i=0;i<len;i++){
    if(a[i] !== b[i]) return false
  }
  return true
}

let defaultData
class Converter extends React.Component {
  constructor(props) {
    super(props)
    this.state = defaultData
  }

  render(){
    const state = this.getActiveVideo()
    return <div className="main">
      <div className="cont">
        <Selector ref="selector" parent={this} addFiles={::this.addFiles}/>
        {this.renderConverter()}
      </div>
      <div className="side1">
        <div className="list-group">
          {this.makePresetList((state.out && state.out.PresetName) || defaultData.defaultVideoPreset)}
        </div>
      </div>
    </div>

  }
}

const key = Math.random().toString()
ipc.send("get-main-state",key,['defaultDownloadPath'])
ipc.once(`get-main-state-reply_${key}`,(e,data)=>{
  defaultData = data
  ReactDOM.render(<Converter />,  document.getElementById('app'))
})