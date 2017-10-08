import localForage from "localforage";
const itemMap = {}

export default {
  getItem(key){
    let val = itemMap[key]
    if(val) return val
    return (itemMap[key] = localForage.getItem(key))
  },
  setItem(key,val){
    itemMap[key] = new Promise(r=>r(val))
    return localForage.setItem(key,val)
  },
  removeItem(key){
    delete itemMap[key]
    return localForage.removeItem(key)
  }
}