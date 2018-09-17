const ipc = require('electron').ipcRenderer

const handler = {
  get: function(target, name){
    return name in target ? target[name] : ipc.sendSync('main-state-op','get',name);
  }
}

export default new Proxy({
  set(name,val){
    ipc.send('main-state-op','set',name,void 0,val)
  },
  add(name,key,val){
    ipc.send('main-state-op','add',name,key,val)
    this[name][key] = val
  },
  del(name,key){
    ipc.send('main-state-op','del',name,key)
  }
},handler)