module.exports = {
  getIpcNameFunc(className){
    return function(method, extensionId){
      if(extensionId){
        return `CHROME_${className.toUpperCase()}_${method.toUpperCase()}_${extensionId}`
      }
      else{
        return `CHROME_${className.toUpperCase()}_${method.toUpperCase()}`
      }
    }
  },
  _shortId() {
    const self = this
    const uuidLength = 8

    this.DICT_RANGES = { digits: [48, 58], lowerCase: [97, 123], upperCase: [65, 91] }
    this.dict = [];
    this.dictIndex = this._i = 0

    let rangeType
    for (rangeType in self.DICT_RANGES) {
      self.dictRange = self.DICT_RANGES[rangeType]
      self.lowerBound = self.dictRange[0], self.upperBound = self.dictRange[1]
      for (this.dictIndex = this._i = this.lowerBound; this.lowerBound <= this.upperBound ? this._i < this.upperBound : this._i > this.upperBound; this.dictIndex = this.lowerBound <= this.upperBound ? ++this._i : --this._i) {
        self.dict.push(String.fromCharCode(self.dictIndex))
      }
    }

    this.dict = this.dict.sort(() => Math.random() <= 0.5)
    this.dictLength = this.dict.length

    return function(){
      let id = '', randomPartIdx, _j, idIndex
      for (idIndex = _j = 0; 0 <= uuidLength ? _j < uuidLength : _j > uuidLength; idIndex = 0 <= uuidLength ? ++_j : --_j) {
        randomPartIdx = parseInt(Math.random() * self.dictLength) % self.dictLength
        id += self.dict[randomPartIdx]
      }
      return id
    }
  }
}
