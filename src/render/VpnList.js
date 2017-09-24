const React = require('react')
const ReactDOM = require('react-dom');
const {Component} = React
const uuid = require("node-uuid")
const {remote} = require('electron')
const ipc = require('electron').ipcRenderer
const mainState = remote.require('./mainState')
const NavbarMenu = require('./NavbarMenu')
const {NavbarMenuItem,NavbarMenuBarItem} = require('./NavbarMenuItem')

export default class VpnList extends Component {
  constructor(props) {
    super(props)
    this.state = {list: []}
    this.uuid = `v${uuid.v4()}`
    this.outerClick = ::this.outerClick
    this.event = ::this.event
  }

  componentDidMount() {
    console.log(33)
    document.addEventListener('mousedown',this.outerClick)
    fetch(`https://sushib.me/vpngate.json?a=${Math.floor(Date.now()/1000/1800)}`).then((response)=>response.json()).then(({list})=>{
      ipc.send('get-country-names')
      ipc.once('get-country-names-reply',(e,countries)=>{
        this.setState({list,countries,visible:true,vpn:mainState.vpn})
        ipc.on('vpn-event-reply',this.event)
        console.log(list,countries)
      })
    });
  }

  event(){
    console.log(779789,mainState.vpn)
    this.setState({vpn:mainState.vpn})
  }

  componentWillUnmount() {
    ipc.removeListener('vpn-event-reply',this.event)
    document.removeEventListener('mousedown',this.outerClick)
  }


  componentDidUpdate(prevProps, prevState){
    if(this.state.visible != prevState.visible){
      if(this.state.visible){
        this.event()
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
    const vpn = this.state.vpn
    return !this.state.visible ? null : <div role="listbox" id={this.uuid} aria-expanded={false} className="ui scrolling top right dropdown" tabIndex={1} style={{lineHeight: '1.9',top: 18,zIndex:2,}}>
      <div className="menu visible transition nav-menu" style={{width: 550, left: 'auto'}}>
        {vpn ? <NavbarMenuItem bold={true} text="VPN Disconnect"
                         onClick={_=>{
                           ipc.send('vpn-event',this.uuid)
                           this.setState({visible: false})
                           this.props.onClick()
                         }} /> : null}
        {vpn ? <div className="divider" /> : null}
          {this.state.list.map((e,i)=>{
        return <NavbarMenuItem  text={`${this.state.countries[e.c] || e.c} [${e.a}]  ${e.sp}  ping:${e.p}`} img={<div className={`country-flag flag-${e.c.toLowerCase().replace(/ /g,'-').replace(/[()]/g,'')}`}></div>}
                                onClick={_=>{
                                  ipc.send('vpn-event',this.uuid,e.a)
                                  this.setState({visible: false})
                                  this.props.onClick()
                                }} />
      })}

      {/*<div className="divider" />*/}
    </div>
    </div>
    }

}
