document.addEventListener("DOMContentLoaded",()=>{
  const {ipcRenderer} = require('electron')

  ipcRenderer.on('page-search-data', (e, panelKey, tabKey, progress, state) => {
    window.panelKey = panelKey
    window.tabKey = tabKey
    document.querySelector('.search-num').innerHTML = progress

    for(let id of ['case','or','reg']){
      const ele = document.querySelector(`#${id}`)
      const checkbox = ele.parentNode
      if(!state[id]){
        checkbox.querySelector('input').checked = false
        checkbox.classList.remove('checked')
      }
      else{
        checkbox.querySelector('input').checked = true
        checkbox.classList.add('checked')
      }
    }
    const text = document.querySelector('#text')
    text.value = state.value || ""

    if(state.focus){
      text.focus()
    }
  })

  const text = document.querySelector('#text')
  text.addEventListener('keydown', (e)=>{
    if (e.keyCode == 13) {
      e.preventDefault()
      ipcRenderer.send('page-search-event',window.panelKey, window.tabKey, 'text-keydown', e.target.value, e.shiftKey)
    }
    else
    if (e.keyCode == 27) { // ESC
      ipcRenderer.send('page-search-event', window.panelKey, window.tabKey, 'close')
    }
  })

  text.addEventListener('input', (e)=>{
    e.preventDefault()
    ipcRenderer.send('page-search-event', window.panelKey, window.tabKey,'text-input', e.target.value)
  })

  const back = document.querySelector('#back')
  back.addEventListener('click', (e)=>{
    ipcRenderer.send('page-search-event', window.panelKey, window.tabKey, 'back')
  })

  const forward = document.querySelector('#forward')
  forward.addEventListener('click', (e)=>{
    ipcRenderer.send('page-search-event', window.panelKey, window.tabKey, 'forward')
  })

  for(let id of ['case','or','reg','all']){
    const ele = document.querySelector(`#${id}`)
    ele.addEventListener('click', (e)=>{
      const checkbox = e.target.closest('.ui.checkbox')
      if(checkbox.classList.contains('checked')){
        checkbox.querySelector('input').checked = false
        checkbox.classList.remove('checked')
      }
      else{
        checkbox.querySelector('input').checked = true
        checkbox.classList.add('checked')
      }
      ipcRenderer.send('page-search-event', window.panelKey, window.tabKey, 'check', id, checkbox.classList.contains('checked'))
    })
  }

  const close = document.querySelector('#close')
  close.addEventListener('click', (e)=>{
    ipcRenderer.send('page-search-event', window.panelKey, window.tabKey, 'close')
  })
})