const { select } = require('./optimal-select')
window.__select__ = element => select(element, {
  root: document,
  priority: ['id', 'class','tag', 'value'],
  ignore: {
    attribute (name, value, defaultPredicate) {
      return !(/^(title|value|alt|label|name|class|id)$/).test(name) || (name == 'class' && /^\s*$/.test(value)) || (name == 'value' && (element.tagName == 'INPUT' && !/^checkbox|radio|file|submit|image|reset|button$/i.test(element.type)) || element.tagName == 'TEXTAREA')
    }
  }
})


const escapeValue = (value) => value && value.replace(/['"`\\/:\?&!#$%^()[\]{|}*+;,.<=>@~]/g, '\\$&').replace(/\n/g, '\A')
const createSelector = (element)=>{
  for (var sels = []; element && element.nodeType == 1; element = element.parentNode) {
    if(element.id) {
      const escapedId = escapeValue(element.id)
      const uniqueIdCount = document.querySelectorAll(`[id="${escapedId}"]`).length

      if (uniqueIdCount == 1) {
        sels.unshift(`[id="${escapedId}"]`)
        return sels.join(' > ')
      }
      if (element.nodeName) sels.unshift(`${escapeValue(element.nodeName.toLowerCase())}[id="${escapedId}"]`);
    }
    else {
      for (var i = 1, i2 = 1,sib = element.previousSibling; sib; sib = sib.previousSibling) {
        if (sib.nodeName == element.nodeName) i++
      }
      let onlyElement = i == 1
      if(onlyElement){
        for(sib = element.nextSibling;sib;sib = sib.nextSibling){
          if(sib.nodeName == element.nodeName){
            onlyElement = false
            break
          }
        }
      }
      let className = element.className
      if(!onlyElement && element.className){
        for(sib = element.previousSibling;sib;sib = sib.previousSibling){
          if(sib.nodeName == element.nodeName && sib.className.trim().replace(/[ \t]+/g, ".") == element.className.trim().replace(/[ \t]+/g, ".")){
            className = null
            break
          }
        }
        if(className){
          for(sib = element.nextSibling;sib;sib = sib.nextSibling){
            if(sib.nodeName == element.nodeName && sib.className.trim().replace(/[ \t]+/g, ".") == element.className.trim().replace(/[ \t]+/g, ".")){
              className = null
              break
            }
          }
        }
      }
      sels.unshift(element.nodeName.toLowerCase() + (onlyElement ? '' : className ? `.${className.trim().replace(/[ \t]+/g, ".")}` : `:nth-of-type(${i})`))
    }
  }
  return sels.length ? sels.join(' > ') : null
}

window.__simpleSelect__ = createSelector