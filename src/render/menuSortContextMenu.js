const {remote} = require('electron');
const {Menu} = remote
const ipc = require('electron').ipcRenderer
import Sortable from './draggable_tab/components/Sortable';
const PubSub = require('./pubsub')
const sharedState = require('./sharedState')

function updateState(node,olds){
  const mainNode = node.querySelector('.navbar-main.browser-navbar')
  const backSideNode = node.querySelector('.item.browser-navbar')

  let left=[],right=[],backSide=[],current = left,intervalEles = [],lastEles = []
  for(let node of mainNode.childNodes){
    if(node.className == "input-group" || node.className == "navbar-margin"){
      intervalEles.push(node)
      current = right
      continue
    }
    else if(node.classList.contains("main-menu") || node.className == "title-button-set"){
      lastEles.push(node)
      continue
    }
    for(let className of node.classList){
      if(className.startsWith('sort')){
        current.push(className.slice(5))
        break
      }
    }
  }
  for(let node of backSideNode.childNodes){
    for(let className of node.classList){
      if(className.startsWith('sort')){
        backSide.push(className.slice(5))
        break
      }
    }
  }

  let ele = mainNode
  while (ele.firstChild) {
    ele.removeChild(ele.firstChild);
  }
  olds.left.forEach(e=>ele.appendChild(e))
  intervalEles.forEach(e=>ele.appendChild(e))
  olds.right.forEach(e=>ele.appendChild(e))
  lastEles.forEach(e=>ele.appendChild(e))

  ele = backSideNode
  while (ele.firstChild) {
    ele.removeChild(ele.firstChild);
  }
  olds.backSide.forEach(e=>ele.appendChild(e))

  console.log({left,right,backSide})
  ipc.send('save-state',{tableName:'state',key:'navbarItems',val:{left,right,backSide}})
  PubSub.publish('sort-menu',{left,right,backSide})
}

function getState(node) {
  const mainNodes = node.querySelectorAll('.navbar-main.browser-navbar>*')
  const backSideNodes = node.querySelectorAll('.item.browser-navbar>*')
  let left=[],right=[],backSide=[],current = left
  for(let node of mainNodes){
    if(node.className == "input-group" || node.className == "navbar-margin"){
      current = right
      continue
    }
    for(let className of node.classList){
      if(className.startsWith('sort')){
        current.push(node)
        break
      }
    }
  }
  for(let node of backSideNodes){
    for(let className of node.classList){
      if(className.startsWith('sort')){
        backSide.push(node)
        break
      }
    }
  }
  return {left,right,backSide}

}
export default (tabId,navbar,e)=>{
  if(e.target.closest('.menu.visible')) return

  const node = ReactDOM.findDOMNode(navbar).parentNode
  const current = getState(node)
  Menu.buildFromTemplate([{
    label: 'Sort Menu', click: _=>{
      sharedState.menuSort = true
      const mainMenu = navbar.refs['main-menu']
      mainMenu.forceOpen()
      const sortable = new Sortable(node.querySelector('.navbar-main.browser-navbar'), {
        group: "name",
        draggable: ".draggable-source"
      })
      const sortable2 = new Sortable(node.querySelector('.item.browser-navbar'), {
        group: "name",
        draggable: ".draggable-source"
      })
      const key = Math.random().toString()
      ipc.send('show-notification-sort-menu',key,tabId)
      ipc.once(`show-notification-sort-menu-reply_${key}`,_=>{
        sharedState.menuSort = false
        sortable.destroy()
        sortable2.destroy()
        updateState(node,current)
        mainMenu.forceClose()
      })
    }
  }]).popup(remote.getCurrentWindow())
}