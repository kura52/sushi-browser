/*
 Python implementation of SuperFastHash algorithm
 Maybe it is better to use c_uint32 to limit the size of variables to 32bits
 instead of using 0xFFFFFFFF mask.*/
const binascii = require('binascii')

function get16bits(data) {
    /* Returns the first 16bits of a string */
    const str = data.slice(0, 2)
    return parseInt(binascii.hexlify(`${str[1]}${str[0]}`), 16)
}
module.exports = function superFastHash(data) {
    let hash, length
    hash = length = data.length
    if (length === 0) {
        return 0
    }
    const rem = length & 3
    length >>= 2
    while (length > 0) {
        hash += (get16bits(data) & 4294967295) >>> 0
        hash = hash >>> 0
        const tmp = (((get16bits(data.slice(2)) << 11) >>> 0) ^ hash) >>> 0
        hash = (((((hash << 16) >>> 0) & 4294967295) >>> 0) ^ tmp) >>> 0
        data = data.slice(4)
        hash += hash >>> 11
        hash = hash >>> 0
        hash = (hash & 4294967295) >>> 0
        length -= 1
    }
    if (rem === 3) {
        hash += get16bits(data)
        hash = hash >>> 0
        hash ^= ((((hash << 16) >>> 0) & 4294967295) >>> 0)
        hash = hash >>> 0
        hash ^= ((parseInt(binascii.hexlify(data[2]), 16) << 18) & 4294967295) >>> 0
        hash = hash >>> 0
        hash += hash >>> 11
        hash = hash >>> 0
    }
    else if (rem === 2) {
        hash += get16bits(data)
        hash = hash >>> 0
        hash ^= ((((hash << 11) >>> 0) & 4294967295) >>> 0)
        hash = hash >>> 0
        hash += hash >>> 17
        hash = hash >>> 0
    }
    else if (rem === 1) {
        hash += parseInt(binascii.hexlify(data[0]), 16)
        hash = hash >>> 0
        hash ^= ((((hash << 10) >>> 0) & 4294967295) >>> 0)
        hash = hash >>> 0
        hash += hash >>> 1
        hash = hash >>> 0
    }
    hash = (hash & 4294967295) >>> 0
    hash ^= ((((hash << 3) >>> 0) & 4294967295) >>> 0)
    hash = hash >>> 0
    hash += hash >>> 5
    hash = hash >>> 0
    hash = (hash & 4294967295) >>> 0
    hash ^= ((hash << 4)>>>0) & 4294967295
    hash = hash >>> 0
    hash += hash >>> 17
    hash = hash >>> 0
    hash = (hash & 4294967295) >>> 0
    hash ^= ((hash << 25)>>>0) & 4294967295
    hash = hash >>> 0
    hash += hash >>> 6
    hash = hash >>> 0
    hash = (hash & 4294967295) >>> 0
    return hash
}
