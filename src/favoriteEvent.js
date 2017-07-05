import { ipcMain } from 'electron'
import {favorite} from './databaseFork'

ipcMain.on('fetch-favorite', async (event, range) => {
  console.log(range)
  const cond =  !Object.keys(range).length ? range :
  { created_at: (
    range.start === void 0 ? { $lte: range.end } :
      range.end === void 0 ? { $gte: range.start } :
      { $gte: range.start ,$lte: range.end }
  )}
  const data = await favorite.find_sort([cond],[{ updated_at: -1 }])
  event.sender.send('favorite-reply', data);
})
