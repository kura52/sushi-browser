/*
Chrome Cache Address
See /net/disk_cache/addr.h for design details*/
class CacheAddressError {
    constructor(value) {
        this.value = value;
    }
    toString() {
        return this.value.toString();
    }
}

class CacheAddress {
    /*
    Object representing a Chrome Cache Address
    */
    constructor(uint_32, {path}) {
        /*
        Parse the 32 bits of the uint_32
        */
        if (uint_32 === 0) {
            throw new CacheAddressError("Null Address");
        }
        this.addr = uint_32;
        // console.log(path)
        this.path = path;
        this.binary = `0b${uint_32.toString(2)}`;
        if (this.binary.length !== 34) {
            throw new CacheAddressError("Uninitialized Address");
        }
        this.blockType = parseInt(this.binary.slice(3, 6), 2);
        if (this.blockType === CacheAddress.SEPARATE_FILE) {
            this.fileSelector = "f_%06x" % parseInt(this.binary.slice(6), 2);
        }
        else {
            if (this.blockType === CacheAddress.RANKING_BLOCK) {
                this.fileSelector = "data_" + parseInt(this.binary.slice(10, 18), 2).toString();
            }
            else {
                this.entrySize = CacheAddress.typeArray[this.blockType][1];
                this.contiguousBlock = parseInt(this.binary.slice(8, 10), 2);
                this.fileSelector = "data_" + parseInt(this.binary.slice(10, 18), 2).toString();
                this.blockNumber = parseInt(this.binary.slice(18), 2);
            }
        }
    }
    toString() {
        var string;
        string = `0x${this.addr.toString(16)} (`;
        if (this.blockType >= CacheAddress.BLOCK_256) {
            string += this.contiguousBlock.toString() + " contiguous blocks in ";
        }
        string += CacheAddress.typeArray[this.blockType][0] + " : " + this.fileSelector + ")";
        return string;
    }
}
Object.assign(CacheAddress, {"BLOCK_1024": 3, "BLOCK_256": 2, "BLOCK_4096": 4, "RANKING_BLOCK": 1, "SEPARATE_FILE": 0, "typeArray": [["Separate file", 0], ["Ranking block file", 36], ["256 bytes block file", 256], ["1k bytes block file", 1024], ["4k bytes block file", 4096]]});

module.exports = {CacheAddress: CacheAddress}
