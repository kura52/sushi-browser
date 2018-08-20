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