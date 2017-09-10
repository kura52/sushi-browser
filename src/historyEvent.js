import { ipcMain } from 'electron'
import {historyFull,history,image} from './databaseFork'

ipcMain.on('fetch-history', async (event, range, full=false,limit) => {
  console.log(range)
  const cond =  !Object.keys(range).length ? range :
    { updated_at: (
      range.start === void 0 ? { $lte: range.end } :
        range.end === void 0 ? { $gte: range.start } :
          { $gte: range.start ,$lte: range.end }
    )}
  let data
  if(limit){
    data = await (full ? historyFull : history).find_sort_limit([cond],[{ updated_at: -1 }],[limit])
  }
  else{
    data = await (full ? historyFull : history).find_sort([cond],[{ updated_at: -1 }])
  }

  event.sender.send('history-reply', data);
})


ipcMain.on('fetch-frequently-history', async (event, range) => {
  console.log(range)
  const data = await history.find_sort_limit([{}],[{ count: -1 }],[80])
  const images = await image.find({ url: { $in: data.map(x=>x.location) }})
  const data2 = await history.find_sort_limit([{}],[{ updated_at: -1 }],[30])

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
      arr.push({ $or: [{ title: e }, full ? { text: e } : { location: e }]})
    }
    cond = cond.length == 1 ? arr[0] : { $and: arr}
  }
  else{
    cond = { $or: [{ title: cond }, full ? { text: cond } : { location: cond }]}
  }

  let data
  if(limit){
    data = await (full ? historyFull : history).find_sort_limit([cond],[{ updated_at: -1 }],[limit])
  }
  else{
    data = await (full ? historyFull : history).find_sort([cond],[{ updated_at: -1 }])
  }
  event.sender.send('history-reply', data);
})