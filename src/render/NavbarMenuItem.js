const React = require('react')
import { Dropdown } from 'semantic-ui-react';


function handleClick(props,e){
  props.onClick(e)
}

export default {
  NavbarMenuItem(props){
    const needInput = props.input != (void 0)
    return <div role="option" className={`item${needInput ? ' checkbox' : ''}`} onClick={handleClick.bind(null,props)}>
      {props.icon ? <i aria-hidden="true" className={`${props.icon} icon`} /> : null}
      {props.favicon ? <img src={props.favicon} className="favi"/> : null}
      {props.img ? props.img : null}
      <span className="text" style={props.bold ? {fontWeight: 'bold'} : {}}>{props.text}</span>
      {needInput? <div className="ui icon input">
        <select className="dl-select" onChange={e=>{props.onChange(e.target.value)}}>
          {Array.from(new Array(9)).map((v,n)=>{
            return <option selected={props.input == n} value={n}>{n}</option>
          })}
        </select>
        {/*<Dropdown selection onChange={(e,data)=> props.onChange(data)}/> options={[{key:'s1',value:'1',text:'1'},{key:'d2',value:'2',text:'2'}]} />*/}
        </div> : null}
    </div>
  },
  NavbarMenuBarItem(props){
    return <div role="option" className="item browser-navbar">
      {props.children}
    </div>
  }
}