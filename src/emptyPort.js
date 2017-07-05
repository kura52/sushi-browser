export default function(callback) {
  const net = require('net')
  const server = new net.Server()

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
      server.close(_=>callback(null, port))
    })
  }
  listen(10000 + Math.floor(Math.random() * 1000))
}