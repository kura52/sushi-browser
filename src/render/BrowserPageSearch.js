const React = require('react')
const {Component} = React
import { Checkbox } from 'semantic-ui-react';
const ipc = require('electron').ipcRenderer
const PubSub = require('./pubsub')

let options = {case:false,or:false,reg:false}

export default class BrowserPageSearch extends Component {
  constructor(props) {
    super(props)
    this.state = {...options}
  }
  componentDidUpdate(prevProps) {
    if (!prevProps.isActive && this.props.isActive){
      this.refs.input.focus()
      this.state = {...options}
      if(this.or){
        this.state.or = true
        this.or = void 0
      }
      if(this.refs.input.value) this.props.onPageSearch(this.refs.input.value,void 0,this.state.case,this.state.or,this.state.reg)
    }

    if(prevProps.isActive && !this.props.isActive){
      this.props.onClose()
      this.refs.input.value = ""
    }
  }
  // shouldComponentUpdate: function (nextProps, nextState) dd{
  //   return (this.props.isActive != nextProps.isActive)
  // },
  onKeyDown(e) {
    if (e.keyCode == 13) {
      e.preventDefault()
      this.props.onPageSearch(e.target.value,!e.shiftKey,this.state.case,this.state.or,this.state.reg)
    }
  }
  onChange(e) {
    e.preventDefault()
    this.props.onPageSearch(this.refs.input.value,void 0,this.state.case,this.state.or,this.state.reg)
  }

  changeCheck(e,name,data){
    const val = data.checked
    this.state[name] = val
    for(let name of ['case','or','reg']){
      options[name] = this.state[name]
    }
    this.props.onPageSearch(this.refs.input.value,void 0,this.state.case,this.state.or,this.state.reg)
    this.setState({})
  }

  onClickPrev(e){
    e.preventDefault()
    this.props.onPageSearch(this.refs.input.value,false)
  }
  render() {
    return <div className={(this.props.isActive ? 'visible' : 'hidden')+" browser-page-search"}>
      <input className="search-text" ref="input" type="text" placeholder="Search..." onKeyDown={::this.onKeyDown} onChange={::this.onChange}/>
      <a className="search-button" href="javascript:void(0)"><i className="search-next fa fa-angle-up" style={{fontSize: "1.5em",lineHeight: "1.2",height:"30px"}} onClick={::this.onClickPrev}></i></a>
      <a className="search-button" href="javascript:void(0)"><i className="search-prev fa fa-angle-down" style={{fontSize: "1.5em",lineHeight: "1.3",height:"30px"}} onClick={::this.onChange}></i></a>
      <span className="search-num">{this.props.progress}</span>
      <Checkbox style={{paddingLeft: 4, borderLeft: '1px solid #aaa'}} label="Case" checked={this.state.case} onChange={(e,data)=>this.changeCheck(e,'case',data)}/>
      <Checkbox label="OR" checked={this.state.or} onChange={(e,data)=>this.changeCheck(e,'or',data)}/>
      <Checkbox label="Reg" checked={this.state.reg} onChange={(e,data)=>this.changeCheck(e,'reg',data)}/>
      <Checkbox label="All" checked={false} onChange={(e,data)=>{
        if(!document.querySelector('.find-panel')){
          ipc.emit('menu-or-key-events', null, 'findAll', this.props.tab.wvId)
        }
        PubSub.publish('find-all-search',this.refs.input.value)
        this.props.onClose()
        this.refs.input.value = ""
      }}/>
      <a className="search-button" href="javascript:void(0)"><div className="search-close" style={{lineHeight: "1.5",height:"30px"}} onClick={e=>this.props.onClose(e,true)}>☓</div></a>
    </div>
  }
}