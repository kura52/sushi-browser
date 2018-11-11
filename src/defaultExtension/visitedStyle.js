const ipc = chrome.ipcRenderer

function getStyle(rule, styles, i, validStyle){
  if(rule.cssRules){
    for(let rule2 of rule.cssRules){
      getStyle(rule2, styles, i, validStyle)
    }
    return
  }
  if(rule.selectorText && rule.selectorText.includes(':visited')){
    const selector = rule.selectorText.split(", ").filter(x=>x.includes(':visited')).join(", ")
    const selectorValues = []
    for(let [key, values] of rule.styleMap){
      if(validStyle.has(key)){
        selectorValues.push(`${key}:${values.join(' ')}`)
      }
    }
    if(!selectorValues.length) return
    const cssText = `${selector}{${selectorValues.join(';')};}`
    if(styles[i]){
      styles[i].push(cssText)
    }
    else{
      styles[i] = [cssText]
    }
  }
}

export default function getVisitedStyle(name){
  const _cssText = localStorage.getItem('__cssText__')
  if(_cssText){
    const s = document.createElement('style')
    s.setAttribute('type', 'text/css')
    s.appendChild(document.createTextNode(_cssText.replace(/:visited/g, name)))
    document.head.appendChild(s)
    return
  }

  let i = 1
  const styles = []
  const promises = []
  const validStyle = new Set([ 'color', 'background-color', 'border-color', 'border-bottom-color', 'border-left-color', 'border-right-color', 'border-top-color', 'column-rule-color', 'outline-color'])
  for(let styleSheet of document.styleSheets){
    try{
      for(let rule of styleSheet.rules){
        getStyle(rule, styles, i, validStyle)
      }
    }
    catch(e){
      console.log(e, styleSheet)
      const _i = i
      const promise = new Promise(r => {
        const key = Math.random().toString()
        ipc.send('fetch-style', key, styleSheet.href)
        ipc.once(`fetch-style-reply_${key}`, (e, text)=>{
          r([_i, text])
        })
      })
      promises.push(promise)
    }
    i++
  }

  Promise.all(promises).then(data => {
    for(let [i, text] of data){
      if(!text) continue
      const iframe = document.createElement('iframe')
      iframe.srcdoc = `<style type="text/css">${text}</style>`
      iframe.style = "display: none;"
      document.body.appendChild(iframe)
      const styleSheet = iframe.contentDocument.styleSheets
      try{
        for(let rule of styleSheet.rules){
          getStyle(rule, styles, i, name, validStyle)
        }
      }
      catch(e){}
      document.body.removeChild(iframe)
    }

    const cssText = styles.flat().join("")
    localStorage.setItem('__cssText__', cssText)
    const s = document.createElement('style')
    s.setAttribute('type', 'text/css')
    s.appendChild(document.createTextNode(cssText.replace(/:visited/g, name)))
    document.head.appendChild(s)
    console.log(8, styles.flat().join(""))

  })
}
