export default {
  set(name,val){
    this[name] = val
  },
  add(name,key,val){
    this[name][key] = val
  },
  del(name,key){
    delete this[name][key]
  }
}