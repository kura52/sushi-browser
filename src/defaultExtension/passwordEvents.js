const ipc = chrome.ipcRenderer

document.addEventListener("DOMContentLoaded",()=>{
  const passField = document.querySelector('input[type=password]')
  const form = passField.closest('form')

  const textFields = document.querySelectorAll('input[type=text],input[type=email]')
  for(let textField of textFields){
    const style = window.getComputedStyle(textField)
    if(style.display == 'none' || style.visibility == 'hidden' || (['0px','1px'].includes(style.width) && ['0px','1px'].includes(style.height))) continue

    const datas = ipc.sendSync('get-password', location.origin)
    if(datas.length){
      textField.value = datas[0].username
      textField.style.backgroundColor = '#f8ffbe'
      passField.value = datas[0].password
      passField.style.backgroundColor = '#f8ffbe'
    }
    return
  }
})

const eventHandler = e=>{
  const passField = document.querySelector('input[type=password]')
  if(!passField.value.length) return
  const password = passField.value

  const form = passField.closest('form')
  const textFields = document.querySelectorAll('input[type=text],input[type=email]')

  let id
  for(let textField of textFields){
    if(textField.value.length > 2){
      id = textField.value
      break
    }
  }
  if(!id) return

  ipc.send('record-password', {url: location.href, origin: location.origin, time: Date.now(), id, password})
}

document.addEventListener('submit',eventHandler,{capture: true})
window.addEventListener('beforeunload', eventHandler);