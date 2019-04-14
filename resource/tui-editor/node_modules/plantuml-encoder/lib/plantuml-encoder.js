'use strict'

var utf8bytes = require('utf8-bytes')
var pakoDeflate = require('pako/lib/deflate.js')
var encode64 = require('./encode64')

// 1. Encode in UTF-8
// 2. Compress using Deflate algorithm
// 3. Reencode using a transformation close to base64

module.exports.encode = function (text) {
  var data = utf8bytes(text)
  var deflated = pakoDeflate.deflate(data, { level: 9, to: 'string', raw: true })
  return encode64.encode(deflated)
}
