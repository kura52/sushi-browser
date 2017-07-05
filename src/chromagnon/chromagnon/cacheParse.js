/*
 Parse the Chrome Cache File
 See http://www.chromium.org/developers/design-documents/network-stack/disk-cache
 for design details*/

const SuperFastHash = require('./SuperFastHash');
const {CacheAddress} = require('./cacheAddress');
const {CacheBlock} = require('./cacheBlock');
const {CacheData} = require('./cacheData');
const {CacheEntry} = require('./cacheEntry');

const path = require('path');
const fs = require("fs");
const FilePointer = require("filepointer");
const {sprintf} = require("sprintf-js")
const cacheParseMap = new Map()

const myRead = (function() {
  const cache = cacheParseMap
  return function(pa,reset=false){
    if(cache.has(pa)){
      const index = cache.get(pa)
      if(reset) index.seek_set(0)
      return index
    }
    const buffer =  fs.readFileSync(pa)
    const index = new FilePointer(buffer)
    cache.set(pa,index)
    return index
  }
}())

function parse(_path, urls = null) {
  cacheParseMap.clear()
  CacheEntry.clear()
  CacheBlock.clear()
  CacheData.clear()
  /*
   Reads the whole cache and store the collected data in a table
   or find out if the given list of urls is in the cache. If yes it
   return a list of the corresponding entries.
   */
  _path = `${path.resolve(_path)}`
  let cacheBlock = new CacheBlock(path.join(_path,'index'))
  if (cacheBlock.type !== CacheBlock.INDEX) {
    throw new Error("Invalid Index File")
  }

  const index = myRead(path.join(_path,'index'))
  // const buffer = fs.readFileSync(path.join(_path,'index'))
  index.seek_set(92 * 4)
  const cache = []
  if (!urls) {
    for (let key = 0, _pj_a = cacheBlock.tableSize; key < _pj_a; key += 1) {
      if(key % 1000 == 0)console.log(key)
      const raw = index.read_uint()
      if (raw !== 0) {
        let entry = new CacheEntry(new CacheAddress(raw, {path: _path}))
        while (entry.next !== 0) {
          cache.push(entry)
          entry = new CacheEntry(new CacheAddress(entry.next, {path: _path}))
        }
        cache.push(entry)
      }
    }
  }
  else {
    for (let url, _pj_c = 0, _pj_a = urls, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
      url = _pj_a[_pj_c];
      const hash = SuperFastHash(url)
      const key = hash & (cacheBlock.tableSize - 1)
      index.seek_set(92 * 4 + key * 4)
      const addr = index.read_uint()
      if ((addr & 2147483648) === 0) {
        console.error("\u001b[32m%s\u001b[31m is not in the cache\u001b[0m" % url);
      }
      else {
        let entry = new CacheEntry(new CacheAddress(addr, {path: _path}));
        while (entry.hash !== hash && entry.next !== 0) {
          entry = new CacheEntry(new CacheAddress(entry.next, {path: _path}));
        }
        if (entry.hash === hash) {
          cache.push(entry);
        }
      }
    }
  }
  return cache;
}

function exportTol2t(cache, outpath) {

  if (outpath) {
    var wstream = fs.createWriteStream(outpath);
    for (var entry, _pj_c = 0, _pj_a = cache, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
      entry = _pj_a[_pj_c];
      wstream.write(entry.toString() + "\n")
    }
    wstream.end();
  }
  else {
    for (var entry, _pj_c = 0, _pj_a = cache, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
      entry = _pj_a[_pj_c];
      console.log(entry.toString() + "\n")
    }
  }
}

module.exports = {parse: parse,exportTol2t: exportTol2t}