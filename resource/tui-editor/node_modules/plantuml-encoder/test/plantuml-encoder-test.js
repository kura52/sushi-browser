/* global describe it */
var chai = require('chai')
var plantumlEncoder = require('../lib/plantuml-encoder')

var expect = chai.expect

describe('plantuml-encoder', function () {
  describe('#encode()', function () {
    it('should encode "A -> B: Hello"', function () {
      var encoded = plantumlEncoder.encode('A -> B: Hello')
      expect(encoded).to.equal('SrJGjLDmibBmICt9oGS0')
    })
    it('should encode UTF-8 "A -> B: Hello/你好"', function () {
      var encoded = plantumlEncoder.encode('A -> B: Hello/你好')
      expect(encoded).to.equal('SrJGjLDmibBmICt9oTT_idV1qwLx0G00')
    })
  })
})
