import {ipcRenderer as ipc} from './ipcRenderer'

function getTheme(theme,entity,name){
  if(!theme || !theme[entity] || !theme[entity][name]){
    return void 0
  }

  const val = theme[entity][name]

  if(entity == 'colors' || entity == 'tints'){
    return `rgb${val.length == 4 ? 'a' : ''}(${val.join(',')})`
  }
  else if(entity == 'images'){
    return theme.datas[name]
  }
  return val
}

function colorOnRGB(c){
  c = c.split(/[()]/)[1].split(",").map(x=>parseInt(x))
  return (c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114) < 186 ? 'white' : 'black'
}

export default function setTheme(page){
  const key = Math.random().toString()
  ipc.send("get-main-state",key,['themeInfo','focusLocationBar','topPage','bookmarksPage','historyPage','enableDownloadList'])
  return new Promise(r=>{
    ipc.once(`get-main-state-reply_${key}`,(e,data)=>{
      r(data)
      const theme = data.themeInfo
      if(theme && theme[page]) common(theme)
      if(page == 'themeTopPage' && data.focusLocationBar === false){
        const s = document.createElement('style')
        s.setAttribute('type', 'text/css')
        s.appendChild(document.createTextNode(`.ui.big.icon.input{display: none}
      .ui.cards{padding-top: 25px;}`))
        document.head.appendChild(s)
      }
      // if(data.topPage) document.querySelector('#top-link').setAttribute('href',data.topPage)
      // if(data.bookmarksPage) document.querySelector('#bookmark-link').setAttribute('href',data.bookmarksPage)
      // if(data.historyPage) document.querySelector('#history-link').setAttribute('href',data.historyPage)
    })
  })
}

function common(theme){
  const app = document.body, arr = [], other = []
  const bgImage = getTheme(theme,'images','theme_ntp_background')
  if(bgImage){
    arr.push(`background-image: url(${bgImage})`)

    const align = getTheme(theme,'properties','ntp_background_alignment')
    if(align) arr.push(`background-position: ${align}`)

    const repeat = getTheme(theme,'properties','ntp_background_repeat')
    if(repeat) arr.push(`background-repeat: ${repeat}`)
  }

  const attrImage = getTheme(theme,'images','theme_ntp_attribution')
  if(attrImage){
    const ele = document.createElement('img')
    ele.setAttribute('src',attrImage)
    ele.style.position = 'fixed'
    ele.style.width = 'fit-content'
    ele.style.height = 'fit-content'
    ele.style.bottom = 0
    ele.style.left = 0
    document.body.appendChild(ele)
  }

  const bgColor = getTheme(theme,'colors','ntp_background')
  if(bgColor) arr.push(`background-color: ${bgColor}`)

  const sectionColor = getTheme(theme,'colors','ntp_header') || getTheme(theme,'colors','ntp_section')
  if(sectionColor) other.push(`.ui.card, .ui.cards>.card {
    box-shadow: 0 1px 3px 0 ${sectionColor}, 0 0 0 1px ${sectionColor};
}`)

  const color = getTheme(theme,'colors','ntp_text')
  if(color) other.push(`*,
   .ui.list .list>.item a.header, .ui.list>.item a.header,a.header,
       .ui.list .list>.item a.header:hover, .ui.list>.item a.header:hover { color: ${color} !important; }`)

  const linkColor = getTheme(theme,'colors','ntp_link')
  if(linkColor){
    other.push(`
      .ui.list .list>.item a.header, .ui.list>.item a.header,a.header,
       .ui.list .list>.item a.header:hover, .ui.list>.item a.header:hover{
    color: ${linkColor} !important;
  }`)
  }

  if((linkColor || color) && colorOnRGB(linkColor || color) == 'black'){
    other.push(`
      div.description{
    background-color: rgb(75, 75, 75) !important;
    border-radius: .28571429rem .28571429rem 0 0;
    }
  `)
  }

  if(arr.length || other.length) {
    const s = document.createElement('style')
    s.setAttribute('type', 'text/css')
    s.appendChild(document.createTextNode(`body{ ${arr.join(";\n")} }
    ${arr.length ? '.sticky{ background-color: initial }' : ''}
    ${other.join("\n")}`))
    document.head.appendChild(s)

  }
}