const React = require('react')
import { Dropdown } from 'semantic-ui-react';


function handleClick(props,e){
  props.onClick && props.onClick(e)
}

function NavbarMenuItem(props){
  const needInput = props.input != (void 0)
  return <div role="option" className={`item${needInput ? ' checkbox' : ''} ${props.className || ''}`} onClick={handleClick.bind(null,props)}>
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
}

class NavbarMenuSubMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {visible: false}
    this.onMouseOver = ::this.onMouseOver
    this.onMouseLeave = ::this.onMouseLeave
  }

  toggleVisible(){
    this.setState({visible:!this.state.visible})
  }

  onMouseOver(e){
    if(!this.state.visible){
      this.setState({visible:true})
    }
  }

  onMouseLeave(e){
    if(this.state.visible){
      this.setState({visible:false})
    }
  }

  render(){
    return <div role="option" className="item" onMouseOver={this.onMouseOver} onMouseLeave={this.onMouseLeave}>
      <i aria-hidden="true" class="dropdown icon"/>
      {this.props.icon ? <i aria-hidden="true" className={`${this.props.icon} icon`} /> : null}
      <span className="text">{this.props.text}</span>
      <div className={`menu transition submenu${this.state.visible ? ' visible' : ''}`}>
        {this.props.children}
      </div>
    </div>
  }
}

export default {
  NavbarMenuBarItem(props){
    return <div role="option" className="item browser-navbar">
      {props.children}
    </div>
  },
  NavbarMenuItem,
  NavbarMenuSubMenu
}