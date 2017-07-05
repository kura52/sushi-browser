/*
 Chrome Cache Entry
 See http://www.chromium.org/developers/design-documents/network-stack/disk-cache
 for design details*/
const {CacheAddress} = require('./cacheAddress');
const {CacheData} = require('./cacheData');
const FilePointer = require("filepointer");
const {sprintf} = require("sprintf-js")
const fs = require("fs");
const struct = require('python-struct');
const path = require('path')
const cacheEntryMap = new Map()

function formatDate (date, format) {
    if (!format) format = 'YYYY-MM-DD hh:mm:ss.SSS';
    format = format.replace(/YYYY/g, date.getFullYear());
    format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
    format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
    format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
    format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
    format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
    if (format.match(/S/g)) {
        var milliSeconds = ('00' + date.getMilliseconds()).slice(-3);
        var length = format.match(/S/g).length;
        for (var i = 0; i < length; i++) format = format.replace(/S/, milliSeconds.substring(i, i + 1));
    }
    return format;
};

const BASE = new Date(1600,12,1).valueOf()

const myRead = (function() {
  const cache = cacheEntryMap
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


class CacheEntry {
    /*
     See /net/disk_cache/disk_format.h for details.
     */
    constructor(address) {
        /*
         Parse a Chrome Cache Entry at the given address
         */
        h:  this.httpHeader = null;
        var block = myRead(path.join(address.path,address.fileSelector))
        block.seek_set(8192 + address.blockNumber * address.entrySize)

        this.hash = block.read_uint()
        //console.log(this.hash)
        this.next = block.read_uint()
        //console.log(this.next)
        this.rankingNode = block.read_uint()
        //console.log(this.rankingNode)
        this.usageCounter = block.read_uint()
        //console.log(this.usageCounter)
        this.reuseCounter = block.read_uint()
        //console.log(this.reuseCounter)
        this.state = block.read_uint()
        //console.log(this.state)
        this.creationTime = new Date(Math.round(struct.unpack("Q", block.copy(8))[0].toNumber()/1000)+BASE)
        this.keyLength = block.read_uint()
        //console.log(this.keyLength)
        this.keyAddress = block.read_uint()
        //console.log(this.keyAddress)
        const dataSize = [];
        for (var _ = 0, _pj_a = 4; (_ < _pj_a); _ += 1) {
            dataSize.push(block.read_uint());
        }
        this.data = [];
        for (var index = 0, _pj_a = 4; (index < _pj_a); index += 1) {
            let addr = block.read_uint()
            try{
                addr = new CacheAddress(addr, {path: address.path});
                this.data.push(new CacheData(addr, dataSize[index], true));
            }catch(e){}
        }
        for (var data, _pj_c = 0, _pj_a = this.data, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            data = _pj_a[_pj_c];
            if ((data.type === CacheData.HTTP_HEADER)) {
                this.httpHeader = data;
                break;
            }
        }
        this.flags = block.read_uint()
        block.seek_cur(5 * 4);
        if ((this.keyAddress === 0)) {
            this.key = block.read_str(this.keyLength);
        } else {
            const addr = new CacheAddress(this.keyAddress, {path: address.path});
            this.key = new CacheData(addr, this.keyLength, true);
        }
    }
    keyToStr() {
        /*
         Since the key can be a string or a CacheData object, this function is an
         utility to display the content of the key whatever type is it.
         */
        if (this.keyAddress === 0) {
            return this.key;
        } else {
            return this.key.data();
        }
    }
    toString() {
        let string = sprintf("Hash: 0x%08x",this.hash) + "\n";
        if (this.next !== 0) {
            string += sprintf("Next: 0x%08x" , this.next) + "\n";
        }
        string += sprintf("Usage Counter: %d" , this.usageCounter) + sprintf("\nReuse Counter: %d" , this.reuseCounter) + sprintf("\nCreation Time: %s" , formatDate(this.creationTime)) + "\n";
        if ((this.keyAddress !== 0)) {
            string += sprintf("Key Address: 0x%08x" , this.keyAddress) + "\n";
        }
        string += sprintf("Key: %s" , this.keyToStr()) + "\n";
        if ((this.flags !== 0)) {
            string += sprintf("Flags: 0x%08x" , this.flags) + "\n";
        }
        string += sprintf("State: %s" , CacheEntry.STATE[this.state]);
        for (var data, _pj_c = 0, _pj_a = this.data, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            data = _pj_a[_pj_c];
            string += sprintf("\nData (%d bytes) at 0x%08x : %s" , data.size, data.address.addr, data);
        }
        return string;
    }
}
Object.assign(CacheEntry, {"STATE": ["Normal", "Evicted (data were deleted)", "Doomed (shit happened)"],clear:()=>cacheEntryMap.clear()});

module.exports = {CacheEntry: CacheEntry}