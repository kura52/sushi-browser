import { ipcMain, app } from 'electron'
import {getFocusedWebContents} from './util'
import uuid from 'node-uuid'
const locale = require('../brave/app/locale')
const { URL } = require('url')

app.on('login', (e, webContents, request, authInfo, cb) => {
  e.preventDefault()
  const tabId = webContents.getId()
  const url = new URL(webContents.getURL())
  console.log(url,authInfo)
  const key = uuid.v4()
  if(webContents.hostWebContents) webContents.hostWebContents.send('show-notification',
    {id :tabId,key,title:locale.translation('basicAuthRequired'),
    text:locale.translation('basicAuthMessage').replace('{{ host }}',`http${authInfo.port == 443 ? 's' : ''}://${authInfo.host}/`),
    needInput: [locale.translation('basicAuthUsernameLabel'),
      locale.translation('basicAuthPasswordLabel'),
    ],
      auth: true})

  ipcMain.once(`reply-notification-${key}`,(e,ret)=>{
    if(ret.pressIndex !== 0){
      cb()
    }
    else{
      console.log(ret.value)
      cb(...ret.value)
    }
  })
})
