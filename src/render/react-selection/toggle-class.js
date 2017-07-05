const toggleClass = function(el, condition, className) {
  let toggle = condition ? 'add' : 'remove'

  if (typeof condition === 'string' && arguments.length === 2) {
    className = condition
    toggle = el.classList.contains(className) ? 'remove' : 'add'
  }

  el.classList[toggle](className)

  return el
}

module.exports = toggleClass
