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

    const DICT_RANGES = { digits: [48, 58], lowerCase: [97, 123], upperCase: [65, 91] }
    let dict = [];
    let dictIndex = 0, _i = 0

    let rangeType
    for (rangeType in DICT_RANGES) {
      const dictRange = DICT_RANGES[rangeType]
      const lowerBound = dictRange[0], upperBound = dictRange[1]
      for (dictIndex = _i = lowerBound; lowerBound <= upperBound ? _i < upperBound : _i > upperBound; dictIndex = lowerBound <= upperBound ? ++_i : --_i) {
        dict.push(String.fromCharCode(dictIndex))
      }
    }

    dict = dict.sort(() => Math.random() <= 0.5)
    const dictLength = dict.length

    return function(){
      let id = '', randomPartIdx, _j, idIndex
      for (idIndex = _j = 0; 0 <= uuidLength ? _j < uuidLength : _j > uuidLength; idIndex = 0 <= uuidLength ? ++_j : --_j) {
        randomPartIdx = parseInt(Math.random() * dictLength) % dictLength
        id += dict[randomPartIdx]
      }
      return id
    }
  }
}
