/*
Parse the header of a Chrome Cache File
See http://www.chromium.org/developers/design-documents/network-stack/disk-cache
for design details*/

const path = require('path');
const fs = require("fs");
const FilePointer = require("filepointer");
const {sprintf} = require("sprintf-js")
const cacheBlockMap = new Map()

const myRead = (function() {
    const cache = cacheBlockMap
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

class CacheBlock {
    /*
    Object representing a block of the cache. It can be the index file or any
    other block type : 256B, 1024B, 4096B, Ranking Block.
    See /net/disk_cache/disk_format.h for details.
    */
    constructor(filename) {
        /*
        Parse the header of a cache file
        */
        console.log(filename)
        const header = myRead(filename,true)
        const magic = header.read_uint()
        if (magic === CacheBlock.BLOCK_MAGIC) {
            this.type = CacheBlock.BLOCK;
            header.seek_cur(2);
            this.version = header.read_short()
            this.header = header.read_short()
            this.nextFile = header.read_short()
            this.blockSize = header.read_uint()
            this.entryCount = header.read_uint()
            this.entryMax = header.read_uint()
            this.empty = [];
            for (var _ = 0, _pj_a = 4; (_ < _pj_a); _ += 1) {
                this.empty.push(header.read_uint());
            }
            this.position = [];
            for (var _ = 0, _pj_a = 4; (_ < _pj_a); _ += 1) {
                this.position.push(header.read_uint());
            }
        } else {
            if (magic === CacheBlock.INDEX_MAGIC) {
                this.type = CacheBlock.INDEX;
                header.seek_cur(2);
                this.version = header.read_short()
                this.entryCount = header.read_uint()
                this.byteCount = header.read_uint()
                this.lastFileCreated = sprintf("f_%06x",header.read_uint());
                header.seek_cur(4 * 2);
                this.tableSize = header.read_uint()
            } else {
                throw new Error("Invalid Chrome Cache File");
            }
        }
    }
}
Object.assign(CacheBlock, {"BLOCK": 1, "BLOCK_MAGIC": 3238316739, "INDEX": 0, "INDEX_MAGIC": 3238251203,clear:()=>cacheBlockMap.clear()});

module.exports = {CacheBlock: CacheBlock}