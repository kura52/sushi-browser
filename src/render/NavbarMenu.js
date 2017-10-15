const React = require('react')
const ReactDOM = require('react-dom');
const {Component} = React
const {NavbarMenuItem,NavbarMenuBarItem} = require('./NavbarMenuItem')
import uuid from 'node-uuid'
const PubSub = require('./pubsub')
const ipc = require('electron').ipcRenderer

export default class NavbarMenu extends Component {
  constructor(props) {
    super(props)
    this.uuid = `a${uuid.v4()}`
    this.state = {visible: false,firstVisible:false}
    this.onMouseOver = ::this.onMouseOver
    this.onMouseLeave = ::this.onMouseLeave
  }

  componentDidMount() {
    // const tokenSetVal = PubSub.subscribe()
    // this.setState({tokens: [tokenSetVal]})
    const self = this
    this.outerClick = e=>{
      if(!e.srcElement.closest(`#${this.uuid}`)){
        self.setState({visible:false})
        this.closeBind()
      }
    }
  }

  closeBind(){
    if(this.props.tab){
      ipc.send('set-pos-window',{id:this.props.tab.bind.id,top:'above'})
    }
  }

  // mouseOver(e){
  //   const isClosest = e.srcElement.closest(`#${this.uuid}`)
  //   if(isClosest && !this.state.visible){
  //     this.setState({visible:true})
  //   }
  //   else if(!e.srcElement.closest(`#${this.uuid}`) && this.state.visible){
  //     this.setState({visible:false})
  //     document.removeEventListener('mouseover',this.mouseOver)
  //   }
  // }
  //
  // onMouseOver(e){
  //   if(!this.state.visible){
  //     document.addEventListener('mouseover',this.mouseOver)
  //   }
  // }

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

  componentWillUnmount() {
    // this.mount = false
    // this.state.tokens.forEach(x => PubSub.unsubscribe(x));
    document.removeEventListener('mousedown',this.outerClick)
    if(this.props.mouseOver){
      document.removeEventListener('mouseover',this.mouseOver)

    }
  }

  componentDidUpdate(prevProps, prevState){
    if(this.state.visible != prevState.visible && !this.props.mouseOver){
      if(this.state.visible){
        document.addEventListener('mousedown',this.outerClick)
        if(this.props.isFloat){
          PubSub.publish(`menu-showed_${this.props.k}`,true)
        }
      }
      else{
        document.removeEventListener('mousedown',this.outerClick)
        if(this.props.isFloat){
          PubSub.publish(`menu-showed_${this.props.k}`,false)
        }
      }
    }
    if(!this.state.visible) return

    if(!this.props.mouseOver){
      const func = _=>{
        const left = parseInt(this.refs.div.offsetLeft)
        const width = parseInt(this.refs.menu.offsetWidth)
        console.log(38,left,width)
        if(left - width < 0){
          this.refs.menu.style.left = `${5 - left}px`
          this.refs.menu.style.setProperty('right', 'auto', 'important')
        }
        else{
          this.refs.menu.style.left = 'auto'
          this.refs.menu.style.right = null
        }
      }
      if(this.props.timeOut){
        setTimeout(func,this.props.timeOut)
      }
      else{
        func()
      }
    }
  }


  handleClick(){
    if(!this.state.visible && this.props.openPromise){
      this.props.openPromise().then(ret=>{
        const dataList = this.props.onClick(ret);
        this.setState({visible:!this.state.visible,firstVisible:true,dataList})
      })
    }
    else if(!this.state.visible){
      this.props.onClick();
      this.setState({visible:!this.state.visible,firstVisible:true})
    }
    else{
      this.setState({visible:!this.state.visible})
      this.closeBind()
    }
  }

  forceOpen(){
    this.setState({forceOpen:true})
  }

  forceClose(){
    this.setState({forceOpen:false})
  }

  render(){
    const self = this
    const list = this.state.dataList ? this.props.children.concat(this.state.dataList) : this.props.children
    return <div onContextMenu={this.props.onContextMenu} onMouseOver={this.props.mouseOver ? this.onMouseOver : (void 0)}
                onMouseLeave={this.props.mouseOver ? this.onMouseLeave : (void 0)} id={this.uuid} ref="div" role="listbox"
                aria-expanded="false" className={`${this.props.className != 'main-menu' ? 'draggable-source' : ''} ui top${this.props.mouseOver ? '' : ' right pointing'} nav-button dropdown ${this.props.className}`}
                tabIndex={1} style={{lineHeight: '1.9',minWidth:0}}>
      <a ref="button" href="javascript:void(0)" title={this.props.title} onClick={this.props.mouseOver ? e=>this.props.onClick(e) : ::this.handleClick}>
        <i className={`fa fa-${this.props.icon}`} />
      </a>
      {!this.state.visible && !this.props.alwaysView ? null : <div ref="menu" className={`menu${this.state.visible || this.state.forceOpen ? " visible" : ""} transition ${this.props.mouseOver ? 'nav2-menu' : 'nav-menu'}`} style={this.props.style}>
        {(list || []).map((child) => {
            if(child && (child.type == NavbarMenuBarItem || (child.type == NavbarMenuItem))){
              return React.cloneElement(child, {
                onClick(e){
                  if(!child.props.keepVisible){
                    self.setState({visible: false})
                    self.closeBind()
                  }
                  child.props.onClick(e)
                }
              })
            }
            else{
              return child
            }
          }
        )}
      </div>
      }
    </div>

  }
}