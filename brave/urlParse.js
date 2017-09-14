const LRUCache = require('lru-cache')

let urlParse = require('url').parse
let cachedUrlParse = new LRUCache(30)

module.exports = (url, ...args) => {
  let parsedUrl = cachedUrlParse.get(url)
  if (parsedUrl) {
    // make a copy so we don't alter the cached object with any changes
    return Object.assign({}, parsedUrl)
  }

  parsedUrl = urlParse(url, ...args)
  cachedUrlParse.set(url, parsedUrl)
  return parsedUrl
}