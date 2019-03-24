import mime from 'mime'
const fs = require('fs')
const http = require('http')

function sendFile(req, res, filePath, fileSize) {
  const mimeType = mime.getType(filePath)
  const range = req.headers.range
  let file
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': mimeType,
    })
    file = fs.createReadStream(filePath, {start, end})
  }
  else {
    res.writeHead(200, { 'Content-Length': fileSize, 'Content-Type': mimeType})
    file = fs.createReadStream(filePath)
  }
  file.pipe(res)
  file.on('error', (err) => sendError(req, res, 500))
}

function sendSuccess(res) {
  res.writeHead(200, {'Content-Type' : 'text/plain'})
  res.write('')
  res.end()
}

function sendError(req, res, statusCode) {
  res.writeHead(statusCode, {'Content-Type': 'text/html'})
  res.write(`<!DOCTYPE html><html><body><h1>${statusCode}</h1></body></html>`)
  res.end()
  console.log(`ERROR ${statusCode}: ${req.method} ${req.url}`)
}

export default function createServer(port, key, listener){
  const server = http.createServer((req, res) => {
    const parsed = new URL(`http://localhost:${port}${req.url}`)
    const _key = parsed.searchParams.get('key')
    if(key != _key || req.headers.host != `localhost:${port}`) return sendError(req, res, 403)

    const data = parsed.searchParams.get('data')
    if(data){
      // console.log(555, data)
      listener(JSON.parse(data))
      sendSuccess(res)
      // console.log(`http://localhost:${port}${req.url}`, filePath)
    }
    else{
      const filePath = parsed.searchParams.get('file')
      fs.stat(filePath, (err, stats) => {
        if (err) {
          if ((/ENOENT/).test(err.message)) return sendError(req, res, 404)
          else return sendError(req, res, 500)
        }

        return sendFile(req, res, filePath, stats.size)
      })
    }
  })
  server.listen(port)
}
