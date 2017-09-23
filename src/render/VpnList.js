const React = require('react')
const ReactDOM = require('react-dom');
const {Component} = React
const uuid = require("node-uuid")
const ipc = require('electron').ipcRenderer
const NavbarMenu = require('./NavbarMenu')
const {NavbarMenuItem,NavbarMenuBarItem} = require('./NavbarMenuItem')

export default class VpnList extends Component {
  constructor(props) {
    super(props)
    this.state = {list: []}
    this.uuid = `v${uuid.v4()}`
    this.outerClick = ::this.outerClick
  }

  componentDidMount() {
    console.log(33)
    document.addEventListener('mousedown',this.outerClick)
    fetch(`https://sushib.me/vpngate.json?a=${Math.floor(Date.now()/1000/3600)}`).then((response)=>response.json()).then(({list})=>{
      this.setState({list,visible:true})
      console.log(list)
    });
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown',this.outerClick)
  }


  componentDidUpdate(prevProps, prevState){
    if(this.state.visible != prevState.visible){
      if(this.state.visible){
        document.addEventListener('mousedown',this.outerClick)
      }
      else{
        document.removeEventListener('mousedown',this.outerClick)
      }
    }
  }


  outerClick(e){
    if(!e.srcElement.closest(`#${this.uuid}`)){
      this.setState({visible:false})
      this.props.onClick()
    }
  }

  render(){
    return !this.state.visible ? null : <div role="listbox" id={this.uuid} aria-expanded={false} className="ui scrolling top right dropdown" tabIndex={1} style={{lineHeight: '1.9',top: 18,zIndex:2,}}>
      <div className="menu visible transition nav-menu" style={{width: 550, left: 'auto'}}>
      {this.state.list.map((e,i)=>{
        return <NavbarMenuItem  text={`${e.c} [${e.a}]  ${e.sp}  ping:${e.p}`} img={<div className={`country-flag flag-${e.c.toLowerCase().replace(/ /g,'-').replace(/[()]/g,'')}`}></div>}
                                onClick={_=>{
                                  ipc.send('vpn-event',this.uuid,e.c)
                                  this.setState({visible: false})
                                  this.props.onClick()
                                }} />
      })}

      {/*<div className="divider" />*/}
    </div>
    </div>
    }

}
