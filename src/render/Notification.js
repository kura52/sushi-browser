const React = require('react')
const ReactDOM = require('react-dom')
const ipc = require('electron').ipcRenderer

export default function Notification(props){
  ipc.send('change-browser-view-z-index', true)

  let style = {position:'fixed', display: 'inline-block',width:600, margin:'auto',left:0, right:0,zIndex:11}
  console.log(props)
  if(props.data.style) style = Object.assign(style,props.data.style)

  const message = props.data.text.includes('When you run update.cmd') ?
    props.data.text.split(/\r?\n/).map((x,i)=> i == 0 ? <div key={i}>{x}</div> : <div key={i}><a style={{textDecoration: 'underline'}}onClick={_=>ipc.send('open-update-cmd')}>{x}</a></div>) :
    props.data.text.split(/\r?\n/).map((x,i)=> <div key={i}>{x}</div>)

  if(props.data.windowDialog){
    const rect = document.querySelector(`.w${props.k}`).getBoundingClientRect()
    const style = {top : rect.y + 10, left: rect.x + ((rect.width - 480)/2 > 0 ? (rect.width - 480)/2 : 10)}
    const func = (e,i)=>{document.querySelector(`.alert-button${i}`).click()}
    ipc.once('auto-play-notification',func)
    return <div className="alertDialog visible transition"　style={style}>
      <div className="alertDialogTitle">{props.data.title}</div>
      <div className="alertDialogBody">{message}</div>
      <div>
        <div className="alertDialogButtonWrapper">
          {props.data.buttons.map((text,i)=> <button key={i} className={`ui ${i == 0 ? 'blue' : 'basic'} small button alert-button${i}`} onClick={_=>{props.delete(i);ipc.removeListener('auto-play-notification',func)}}>{text}</button>).reverse()}
          {/*{props.data.buttons.map((text,i)=> <button className="alertDialogButtonWrapper">OK</button>)}*/}
        </div>
      </div>
    </div>
  }
  else{
    return <div className="ui bottom attached warning message visible transition" style={style}>
      <div className="content">
        <div className="header">{message}</div>
        <p style={{float: 'right'}}>
          {props.data.buttons.map((text,i)=> <button key={i} className="ui yellow small button" style={text.length < 5 ? {width: 76} : null}
                                                     onClick={_=>{props.delete(i)}}>{text}</button>)}
        </p>
      </div>
    </div>
  }
}