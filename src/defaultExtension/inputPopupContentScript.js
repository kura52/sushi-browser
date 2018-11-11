let x,y,right,top,left
const ipc = chrome.ipcRenderer

let span
ipc.on('input-popup', (e, isStart, style) =>{
  if(isStart){
    if(!span){
      span = document.createElement('span')
      span.style = `padding: 0 !important;
  margin: 0 !important;
  border: 0 !important;
  padding: 0px !important;
  text-decoration: none !important;
  cursor: pointer !important;
  min-width: 0px !important;
  outline: none !important;
  -webkit-box-sizing: content-box !important;
  box-sizing: content-box !important;
  position: fixed !important;
  z-index: 9999999 !important;`
      span.innerHTML = `<img style="width: 16px !important; height: 16px !important; opacity: 0.5 !important;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAdCAYAAABWk2cPAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAmhJREFUSEvN1k2ITWEYB/Df7c74LAZhQwn5KAsWLCzIR0KUlYVkUBayUEqKsiKiyEbJSsJGs2AhXyn5SEqSzWAo+YiM6foK95pr8d4zc+bcc++5xij/+tep5/+8//Oc5z3P++ZkI4dhWIypmFLhRzxDB+6jHd2VnH6jGZNwAJ3CguUa7MYlLBdeMKcfGIlD+K6+WRrvYzYG+QPMwE1/bhZnARuEqjMxS+jR3xhG7MZ2DFUHM/HIwBhGLKIVQ6RgHO4YWMOIX7BGCnb7N4YR2zFCDC14qtr0Ex7iW0qsFjsqTNOvFcPqFFEnjmEJTgmfKKlJ8oHQv1bht/mVyLkshsOJ4Hvs09v8MTiBrwldnPewrKKHRbitr74gDBxwIRFsU/1jj8Jx6RXfEkZkEitUaydGwWQ/r2JyFIxhNI7is179DSyIiypoxjbVpksjQSERLAl9TDMehYPCJruC+X3DoAlb8Uq16bpI9Dwl+AunpRu3YBfmJQN6K3yjes0yVkbCazUEJZwVjrMkkj0nVLgDr6WvV8b0SHyyjqiE88L5WQ9N2Im3aq/1U+wA2FhHGBm3Sf/UkMce9Q3Lwr/bg/F4qX5CERdVf+om7MU79fPL2FLJ6cF+2UlFYapEFeeFIdKI4QthyPTBBDyWnVwUNt4mHMGHBnJKWK8GFqJL9iJFoR2NaMvCQBmuBvJCBSWNLdYIr2OsDAwV7jZZt79GeE7tHV+FwZgjnBz9MS5gs5SNk4WcMGfX467GzD8Ix+Q06ROrB1mX4rywwFysEl4k4g9hM3XhCc4IR99P4SVqIss0jlyF0XOEeLX/L34DIpTVLg2frc4AAAAASUVORK5CYII=">`
      document.body.appendChild(span)
      span.addEventListener('click', ()=> ipc.send('send-to-host','input-popup-click'))
    }
    span.style.setProperty('top',`${style.top}px`, 'important')
    span.style.setProperty('left',`${style.left}px`, 'important')
  }
  else if(!isStart && span){
    document.body.removeChild(span)
    span = void 0
  }
})