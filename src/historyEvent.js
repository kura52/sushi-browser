import { ipcMain } from 'electron'
import {tabState,history,image} from './databaseFork'
import favorite from './remoted-chrome/favorite'

ipcMain.on('fetch-history', async (event, range, tab=false,limit,tabTrash) => {
  console.log(range)
  let cond =  !Object.keys(range).length ? range :
    { updated_at: (
        range.start === void 0 ? { $lte: range.end } :
          range.end === void 0 ? { $gte: range.start } :
            { $gte: range.start ,$lte: range.end }
      )}
  if(tabTrash){
    cond = {$and : [{close: 1},cond]}
  }
  console.log(tab,cond)
  let data
  if(limit){
    data = await (tab ? tabState : history).find_sort_limit([cond],[{ updated_at: -1 }],[limit])
  }
  else{
    data = await (tab ? tabState : history).find_sort([cond],[{ updated_at: -1 }])
  }
  if(tab){
    const set = new Set()
    for(let h of data){
      console.log(h.urls)
      h.urls = h.urls.split("\t")
      for(let url of h.urls){
        set.add(url)
      }
    }
    const his = await history.find({location:{$in : [...set]}})
    const favicons = {}
    for(let h of his){
      favicons[h.location] = h.favicon
    }
    data = {tabs: data,favicons}
  }
  event.sender.send('history-reply', data);
})


ipcMain.on('fetch-frequently-history', async (event, range) => {
  console.log(1,Date.now())
  console.log(range)
  const ret = await favorite.export('top-page')
  console.log(2,Date.now())
  let favorites = []
  if(ret && ret.children){
    const locs = []
    for(let x of ret.children){
      if(x.is_file){
        favorites.push({fav:1,location:x.url,title:x.title,favicon:x.favicon,created_at:x.created_at,updated_at:x.updated_at})
        locs.push(x.url)
      }
      console.log(3,Date.now())
    }
    if(locs.length > 0){
      const hists = await history.find({location: {$in: locs}})
      console.log(4,Date.now())
      for(let fav of favorites){
        let h
        if((h = hists.find(x=>x.location == fav.location))){
          fav.count = h.count
          fav.favicon = h.favicon
        }
      }
    }
  }

  const data = favorites.concat((await history.find_sort_limit([{}],[{ pin:-1, count: -1 }],[80])))
  console.log(5,Date.now())
  const images = await image.find({ url: { $in: data.map(x=>x.location) }})
  console.log(6,Date.now())
  const data2 = await history.find_sort_limit([{ updated_at: { $gte: Date.now() - 1000 * 3600 * 24 * 14 }} ],[{ updated_at: -1 }],[30])
  console.log(7,Date.now())


  event.sender.send('history-reply', {freq:data.map(x=>{
      if(!x.capture){
        const img = images.find(im=>im.url == x.location)
        if(img){
          x.capture = img.path
        }
      }
      return {...x, path:x.capture ? x.capture : (void 0)}
    }),upd:data2});
})

ipcMain.on('search-history', async (event, cond, full=false,limit) => {
  if(Array.isArray(cond)){
    const arr = []
    for (let e of cond) {
      e = new RegExp(e,'i')
      arr.push({ $or: [{ title: e }, { location: e }]})
    }
    cond = cond.length == 1 ? arr[0] : { $and: arr}
  }
  else{
    cond = { $or: [{ title: cond }, { location: cond }]}
  }

  let data
  if(limit){
    data = await history.find_sort_limit([cond],[{ updated_at: -1 }],[limit])
  }
  else{
    data = await history.find_sort([cond],[{ updated_at: -1 }])
  }
  event.sender.send('history-reply', data);
})