import { state,token } from './databaseFork'

async function getState(){
  const datas = await state.findOne({key: 1})
  try{
    if(datas && datas.adBlockDisableSite.length){
      datas.adBlockDisableSite = JSON.parse(datas.adBlockDisableSite)
    }
  }catch(e){
    datas.adBlockDisableSite = {}
  }
  const tokenData = await token.findOne({login: true})
  if(tokenData) datas.emailSync = tokenData.email
  return datas
}

let val = (async ()=>{return (await getState()) || {}})()
export default {
  get val(){
    return val
  },
  reload(){
    val = (async ()=>{return (await getState()) || {}})()
  }
}

