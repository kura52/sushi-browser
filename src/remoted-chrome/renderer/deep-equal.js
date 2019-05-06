module.exports = function deepEqual(x, y){
  if (typeof x !== typeof y) {
    return false
  }
  if (typeof x !== 'object') {
    return x === y
  }
  const xKeys = Object.keys(x)
  const yKeys = Object.keys(y)
  if (xKeys.length !== yKeys.length) {
    return false
  }
  for (let prop in x) {
    if (x.hasOwnProperty(prop)) {
      if (!deepEqual(x[prop], y[prop])) {
        return false
      }
    }
  }
  return true
}