import { state } from './databaseFork'

let val = state.findOne({key: 1})
export default {
  get val(){
    return val
  },
  reload(){
    val = state.findOne({key: 1})
  }
}

