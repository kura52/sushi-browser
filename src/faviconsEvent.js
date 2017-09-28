import {ipcMain} from 'electron'
import mainState from './mainState'
import {favicon} from './databaseFork'
import path from 'path'

export default (cb)=>{
  favicon.find().then(ret=>{
    const favicons = {}
    for(let e of ret){
      if(!e.data) continue
      favicons[e.url] = e.data
    }
    mainState.favicons = favicons
    ipcMain.on("favicon-get",(e,val)=>{
      if(val){
        favicon.find({ updated_at: { $gte: val } }).then(ret=> {
          console.log(543543543,ret.length,val)
          const favicons = {}
          for (let e of ret) {
            if (!e.data) continue
            favicons[e.url] = e.data
          }
          e.sender.send("favicon-get-reply",favicons)
        })
      }
      else{
        e.sender.send("favicon-get-reply",favicons)
      }
    })
    cb()
  })
}