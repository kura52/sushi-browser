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

  componentDidMount(){
    this.event = (e, type, ...args) =>{
      if(type == 'text-keydown'){
        const [value, shiftKey] = args
        this.setState({value})
        this.props.onPageSearch(this.state.value,!shiftKey,this.state.case,this.state.or,this.state.reg)
      }
      else if(type == 'text-input'){
        const [value] = args
        this.setState({value})
        this.props.onPageSearch(this.state.value,void 0,this.state.case,this.state.or,this.state.reg)
      }
      else if(type == 'back'){
        this.props.onPageSearch(this.state.value,false)
      }
      else if(type == 'forward'){
        this.props.onPageSearch(this.state.value,void 0,this.state.case,this.state.or,this.state.reg)
      }
      else if(type == 'check'){
        const [op, checked] = args
        if(op == 'all'){
          if(!document.querySelector('.find-panel')){
            ipc.emit('menu-or-key-events', null, 'findAll', this.props.tab.wvId)
          }
          PubSub.publish('find-all-search',this.refs.input.value)
          this.props.onClose()
          this.setState({value})
        }
        else{
          this.changeCheck({}, op, {checked})
        }
      }
      else if(type == 'close'){
        this.props.onClose(e,true)
      }
    }
    ipc.on(`page-search-event-${this.props.k}-${this.props.tab.key}`, this.event)
  }

  componentWillUnmount(){
    ipc.removeListener(`page-search-event-${this.props.k}-${this.props.tab.key}`, this.event)
  }

  updateComponent(){
    const r = this.props.isActive ? ReactDOM.findDOMNode(this.props.parent).getBoundingClientRect() : {left:0, top:-1, width:0, height:0}
    ipc.send('set-overlap-component', 'page-search', this.props.k, this.props.tab.key, r.left + r.width - 446.72 -14, r.top, 446.72, 30, this.props.progress, this.state )
    if(this.state.focus) this.state.focus = false
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isActive && this.props.isActive){
      // this.refs.input.focus()
      // this.state = {...options}
      if(this.or){
        this.state.or = true
        this.or = void 0
      }
      if(this.state.value){
        this.props.onPageSearch(this.state.value,void 0,this.state.case,this.state.or,this.state.reg)
      }
      this.updateComponent()
    }
    else if(prevProps.isActive && !this.props.isActive){
      this.props.onClose()
      this.state.value = ""
      this.updateComponent()
    }
    else if(prevProps.progress != this.props.progress){
      this.updateComponent()
    }
    else if(this.state.focus){
      this.updateComponent()
    }
  }

  // onKeyDown(e) {
  //   if (e.keyCode == 13) {
  //     e.preventDefault()
  //     this.props.onPageSearch(e.target.value,!e.shiftKey,this.state.case,this.state.or,this.state.reg)
  //   }
  // }
  // onChange(e) {
  //   e.preventDefault()
  //   this.props.onPageSearch(this.refs.input.value,void 0,this.state.case,this.state.or,this.state.reg)
  // }

  changeCheck(e,name,data){
    const val = data.checked
    this.state[name] = val
    for(let name of ['case','or','reg']){
      options[name] = this.state[name]
    }
    this.props.onPageSearch(this.state.value,void 0,this.state.case,this.state.or,this.state.reg)
    this.setState({})
  }

  // onClickPrev(e){
  //   e.preventDefault()
  //   this.props.onPageSearch(this.state.value,false)
  // }
  render() {
    return null

    // return <div className={(this.props.isActive ? 'visible' : 'hidden')+" browser-page-search"}>
    //   <input className="search-text" ref="input" type="text" placeholder="Search..." onKeyDown={::this.onKeyDown} onChange={::this.onChange}/>
    //   <a className="search-button" href="javascript:void(0)"><i className="search-next fa fa-angle-up" style={{fontSize: "1.5em",lineHeight: "1.2",height:"30px"}} onClick={::this.onClickPrev}></i></a>
    //   <a className="search-button" href="javascript:void(0)"><i className="search-prev fa fa-angle-down" style={{fontSize: "1.5em",lineHeight: "1.3",height:"30px"}} onClick={::this.onChange}></i></a>
    //   <span className="search-num">{this.props.progress}</span>
    //   <Checkbox style={{paddingLeft: 4, borderLeft: '1px solid #aaa'}} label="Case" checked={this.state.case} onChange={(e,data)=>this.changeCheck(e,'case',data)}/>
    //   <Checkbox label="OR" checked={this.state.or} onChange={(e,data)=>this.changeCheck(e,'or',data)}/>
    //   <Checkbox label="Reg" checked={this.state.reg} onChange={(e,data)=>this.changeCheck(e,'reg',data)}/>
    //   <Checkbox label="All" checked={false} onChange={(e,data)=>{
    //     if(!document.querySelector('.find-panel')){
    //       ipc.emit('menu-or-key-events', null, 'findAll', this.props.tab.wvId)
    //     }
    //     PubSub.publish('find-all-search',this.refs.input.value)
    //     this.props.onClose()
    //     this.refs.input.value = ""
    //   }}/>
    //   <a className="search-button" href="javascript:void(0)"><div className="search-close" style={{lineHeight: "1.5",height:"30px"}} onClick={e=>this.props.onClose(e,true)}>☓</div></a>
    // </div>
  }
}