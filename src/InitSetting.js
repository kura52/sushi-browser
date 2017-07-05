import { state } from './databaseFork'

export default (async ()=>{
  const initSetting =  (await state.findOne({key: 1})) || {}
  return initSetting
})()

