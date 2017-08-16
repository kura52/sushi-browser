import { state } from './databaseFork'

let val = (async ()=>{return (await state.findOne({key: 1})) || {}})()
export default {
  get val(){
    return val
  },
  reload(){
    val = (async ()=>{return (await state.findOne({key: 1})) || {}})()
  }
}

