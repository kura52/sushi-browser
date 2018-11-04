exports.setup = ()=>{
  return {
    getAll(permissions,callback){callback([])}, //@TODO
    contains(permissions,callback){callback(true)}, //@TODO
    request(permissions,callback){callback(true)}, //@TODO
    remove(permissions,callback){callback(true)}, //@TODO
  }
}