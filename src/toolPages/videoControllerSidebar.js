import {ipcRenderer as ipc} from "./ipcRenderer";

window.debug = require('debug')('info')
import process from './process'
import React from 'react';
import ReactDOM from 'react-dom';
import App from './videoControllerBase';

import '../defaultExtension/contentscript'

const key = Math.random().toString()
const isSidebar = location.href == "chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/video_controller_sidebar.html"

ipc.send("get-main-state",key,['mediaSeek1Video','mediaSeek3Video','isVolumeControl'])
ipc.once(`get-main-state-reply_${key}`,async (e,data)=>{
  ipc.send('get-all-tabs-video-list', key)
  ipc.once(`get-all-tabs-video-list-reply_${key}`, async (e, videos) => {
    let l10n
    if(!isSidebar){
      l10n = require('../../brave/js/l10n')
      const initPromise = l10n.init()
      await initPromise
    }
    ReactDOM.render(<App videos={videos} data={data} sidebar={isSidebar} toolPage={!isSidebar} l10n={l10n} />,  document.getElementById('app'))
  })
})