import firebase from 'firebase'
import {ipcMain} from 'electron'
import path from 'path'
import FirebaseSetting from './FirebaseSetting'
import {getCurrentWindow} from './util'
import {token,history,favorite} from './databaseFork'
import fs from 'fs'
import zlib from 'zlib'

let fb
async function process(){
  const datas = await FirebaseSetting()
  const time = await token.findOne({key:'sync_at'})
  const sync_at = (time && time.sync_at) || 0

  const favorites = await favorite.find({ updated_at: { $gte: sync_at } })
  const favoriteList = []
  for(let fav of favorites){
    const d = {
      url : fav.url,
      title : fav.title,
      favicon : fav.favicon,
      is_file : fav.is_file,
      key: fav.key,
    }
    if(fav.children) d.children = fav.children
    favoriteList.push(d)
  }

  const histories = await history.find({ updated_at: { $gte: sync_at } })
  const historyList = []
  for(let hist of histories){
    historyList.push({
      location : hist.location,
      count : hist.count,
      title : hist.title,
      favicon : hist.favicon,
      updated_at : hist.updated_at
    })
  }

  // console.log(favoriteList)
  zlib.gzip(JSON.stringify([favoriteList,historyList]),
    (error, buf)=>{
      if (error) throw error;
      // console.log(new Buffer(buf).toString('base64'))
      getCurrentWindow().webContents.send('sync-datas',{sync_at,email:datas.email,password:datas.password,base64:new Buffer(buf).toString('base64')})
    })
}

async function intervalRun(timeout){
  const interval = 60*60*6*1000
  if(timeout != (void 0)){
    const time = await token.findOne({key:'sync_at'})
    const diff = Date.now() - (time ? time.sync_at : 0)
    timeout = diff > interval ? 0 : interval - diff
  }
  setTimeout(_=>{
    process()
    setInterval(process,interval)
  },timeout)
}

FirebaseSetting().then(ret=>{
  if(ret){
    fb = ret
    intervalRun()
  }
})


ipcMain.on('start-sync',async (e,k)=>{
  let firstTry = await FirebaseSetting()
  if(firstTry){
    if(!fb){
      fb = firstTry
      intervalRun(0)
    }
    return
  }
  else{
    const cont = e.sender
    const emptyPort = require('./emptyPort');
    emptyPort((err, port) => {
      const express = require("express");
      const bodyParser = require('body-parser');
      const app = express();

      app.use(bodyParser.urlencoded({
        extended: true
      }));
      app.use(bodyParser.json());

      const sendFile = (app,files)=>{
        for(let file of files){
          app.get(`/${file}`, function(req, res){
            res.sendFile(path.join(__dirname, `../resource/extension/default/1.0_0/${file}`))
          });
        }
      }

      sendFile(app,['sync.html','css/semantic-ui/semantic.min.css','js/vendor.dll.js','js/sync.js'])

      let server
      app.post('/sync', (req, res)=>{
        if(req.body.idToken){
          res.send('success');
          FirebaseSetting(req.body).then(ret=>{
            if(ret){
              cont.send("close-sync-tab",port)
              server.close()
              if(!fb){
                fb = ret
                intervalRun(0)
              }
            }
            else{
              console.log("error1")
            }
          })
        }
        else{
          console.log("error2")
        }
      })

      server = app.listen(port,_=>{
        cont.send('new-tab', (void 0), `http://localhost:${port}/sync.html`, false, k)
      })
    });
  }
})


ipcMain.on('sync-datas-to-main',(e,base64)=>{
  zlib.gunzip(Buffer.from(base64, 'base64'), async (err, binary)=>{
    const [favoriteList,historyList] = JSON.parse(binary.toString('utf-8'))

    for (let hist of historyList) {
      const ret = await history.findOne({location:hist.location})
      if(ret){
        const updData = {updated_at:hist.updated_at}
        if(hist.count > ret.count){
          updData.count = hist.count
        }
        await history.update({location: hist.location}, {$set:updData})
      }
      else{
        hist.created_at = hist.updated_at
        await history.insert(hist)
      }
    }

    const now = Date.now()
    for(let fav of favoriteList) {
      const ret = await favorite.findOne({key:fav.key})
      if(ret){
        if(!fav.is_file) {
          fav.children = fav.children || []
          if(ret.children){
            fav.children = ret.children.concat(fav.children)
          }
          fav.children = [...new Set(fav.children)]
          await favorite.update({key: fav.key}, {$set: {children: fav.children,updated_at: now}})
        }
      }
      else{
        fav.created_at = now
        fav.updated_at = now
        await favorite.insert(fav)
      }
    }
  })
})