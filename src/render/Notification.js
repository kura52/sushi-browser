const React = require('react')

export default function Notification(props){
  let style = {position:'fixed', display: 'inline-block',width:600, margin:'auto',left:0, right:0,zIndex:11}
  console.log(props)
  if(props.data.style) style = Object.assign(style,props.data.style)

  const message = props.data.text.split(/\r?\n/).map((x,i)=> <div key={i}>{x}</div>)

  return <div className="ui bottom attached warning message" style={style}>
    <div className="content">
      <div className="header">{message}</div>
      <p style={{float: 'right'}}>
        {props.data.buttons.map((text,i)=> <button key={i} className="ui yellow small button" style={text.length < 5 ? {width: 76} : null} onClick={_=>props.delete(i)}>{text}</button>)}
      </p>
    </div>
  </div>
}