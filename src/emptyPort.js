export default function(callback,size) {
  const net = require('net')
  const server = new net.Server()
  const ports = new Set()

  function listen(port) {
    if (port++ >= 20000) {
      callback(new Error('empty port not found'))
      return
    }
    server.listen(port, '127.0.0.1',(error)=>{
      if (error) {
        listen(port + 1);
        return
      }
      ports.add(port)
      if(ports.size == size){
        server.close(_=>callback(null, [...ports]))
      }
      else{
        server.close(_=>listen(10000 + Math.floor(Math.random() * 1000)))
      }
    })
  }
  listen(10000 + Math.floor(Math.random() * 1000))
}