/*
Stores the data fetched in the cache.
Parse the HTTP header if asked.*/
const {CacheAddress} = require('./cacheAddress');
const FilePointer = require("filepointer");
const fs = require("fs");
const path = require('path')
const cacheDataMap = new Map()

const myRead = (function() {
  const cache = cacheDataMap
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


class CacheData {
    /*
    Retrieve data at the given address
    Can save it to a separate file for export
    */
    constructor(address, size, isHTTPHeader = false) {
        /*
        It is a lazy evaluation object : the file is open only if it is
        needed. It can parse the HTTP header if asked to do so.
        See net/http/http_util.cc LocateStartOfStatusLine and
        LocateEndOfHeaders for details.
        */
        this.size = size;
        this.address = address;
        this.type = CacheData.UNKNOWN;
        if ((isHTTPHeader && (this.address.blockType !== CacheAddress.SEPARATE_FILE))) {
            let string = "";
            const block = myRead(path.join(this.address.path,this.address.fileSelector))
            // const buffer = fs.readFileSync(path.join(this.address.path,this.address.fileSelector))
            block.seek_set(8192 + this.address.blockNumber * this.address.entrySize);
            for (var _ = 0, _pj_a = this.size; (_ < _pj_a); _ += 1) {
                string += block.read_str(1)
            }
            const start = string.match(/HTTP/, string);
            if ((start === null)) {
                return;
            } else {
                string = string.slice(start.index);
            }
            const end = string.match(/\u0000\u0000/);
            if ((end === null)) {
                return;
            } else {
                string = string.slice(0, (end.index + end[0].length - 2));
            }
            this.headers = {};
            for (var line, _pj_c = 0, _pj_a = string.split(/\u0000/), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
                line = _pj_a[_pj_c];
                const stripped = line.split(":");
                this.headers[stripped[0].toLowerCase()] = stripped.slice(1).join(":").replace(/^\s*(.*?)\s*$/, "$1")
            }
            this.type = CacheData.HTTP_HEADER;
        }
    }
    save(filename = null) {
        /* Save the data to the specified filename */
        if ((this.address.blockType === cacheAddress.CacheAddress.SEPARATE_FILE)) {
            var r = fs.createReadStream(path.join(this.address.path,this.address.fileSelector)),
              w = fs.createWriteStream(filename);
            r.pipe(w);
        } else {
            const block = myRead(path.join(this.address.path,this.address.fileSelector))
            // const buffer = fs.readFileSync(path.join(this.address.path,this.address.fileSelector))
            block.seek_set(8192 + this.address.blockNumber * this.address.entrySize);
            fs.writeFileSync(filename, block.copy(this.size))
        }
    }
    data() {
        /* Returns a string representing the data */
        const block = myRead(path.join(this.address.path,this.address.fileSelector))
        // const buffer = fs.readFileSync(path.join(this.address.path,this.address.fileSelector))
        block.seek_set(8192 + this.address.blockNumber * this.address.entrySize);
        const data = block.copy(this.size).toString('utf8');
        return data;
    }
    toString() {
        /*
        Display the type of cacheData
        */
        if ((this.type === CacheData.HTTP_HEADER)) {
            if (this.headers["content-type"]) {
                return ("HTTP Header %s" % this.headers["content-type"]);
            } else {
                return "HTTP Header";
            }
        } else {
            return "Data";
        }
    }
}
Object.assign(CacheData, {"HTTP_HEADER": 0, "UNKNOWN": 1,clear:()=>cacheDataMap.clear()});

module.exports = {CacheData: CacheData}
