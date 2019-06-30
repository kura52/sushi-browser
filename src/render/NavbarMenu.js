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
      if(!e.target.closest(`#${this.uuid}`)){
        self.setState({visible:false})
        this.closeBind()
      }
    }
  }

  closeBind(){
    if(this.props.tab){
      ipc.send('set-pos-window',{id:this.props.tab.bind.id,tabId:this.props.tab.wvId,top:'above'})
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
    this.mouseOverTime = Date.now()
    if(!this.state.visible){
      this.setState({visible:true})
      this.props.onMouseOver && this.props.onMouseOver()
    }
  }

  onMouseLeave(e){
    if(this.state.visible){
      const now = Date.now()
      setTimeout(_=>{
        if((this.mouseOverTime || 0) - now < 0){
          this.props.onMouseLeave && this.props.onMouseLeave()
          this.setState({visible:false})
        }
      },100)
    }
  }

  componentWillUnmount() {
    // this.mount = false
    // this.state.tokens.forEach(x => PubSub.unsubscribe(x));
    document.removeEventListener('mousedown',this.outerClick)
    PubSub.unsubscribe(this.tokenMouseDown)
    if(this.props.mouseOver){
      document.removeEventListener('mouseover',this.mouseOver)
    }
  }

  componentDidUpdate(prevProps, prevState){
    if(this.state.visible != prevState.visible && !this.props.mouseOver){
      if(this.state.visible){
        document.addEventListener('mousedown',this.outerClick)
        this.tokenMouseDown = PubSub.subscribe('webview-mousedown',(msg,e)=>this.outerClick(e))
        if(this.props.isFloat){
          PubSub.publish(`menu-showed_${this.props.k}`,true)
        }
      }
      else{
        document.removeEventListener('mousedown',this.outerClick)
        PubSub.unsubscribe(this.tokenMouseDown)
        if(this.props.isFloat){
          PubSub.publish(`menu-showed_${this.props.k}`,false)
        }
      }
    }
    if(!this.state.visible) return

    if(!this.props.mouseOver && !this.props.rightDisplay){
      const func = _=>{

        if(this.props.fixed && this.refs && this.refs.div){
          const rect = ReactDOM.findDOMNode(this.refs.div).getBoundingClientRect()
          this.refs.menu.style.position = 'fixed'
          this.refs.menu.style.zIndex = 1001
          this.refs.menu.style.width = 'max-content'

          const left = parseInt(this.refs.div.getBoundingClientRect().x)
          const width = parseInt(this.refs.menu.offsetWidth)
          const totalWidth = parseInt(window.innerWidth)

          this.refs.menu.style.setProperty('top', `${rect.top + 10}px`, 'important')
          if(totalWidth < left + width){
            this.refs.menu.style.setProperty('left', `${rect.left + rect.width + 5 - width}px`, 'important')
            this.refs.menu.style.setProperty('right', 'auto', 'important')
          }
          else{
            this.refs.menu.style.setProperty('left', `${rect.left}px`, 'important')
            this.refs.menu.style.right = null
          }
        }
        else{
          if(!this.refs.menu) return
          const left = parseInt(this.refs.div.getBoundingClientRect().x)
          const width = parseInt(this.refs.menu.offsetWidth)
          const totalWidth = parseInt(window.innerWidth)
          console.log(38,left,width,totalWidth)

          if(this.refs.menu.style.zIndex){
            this.refs.menu.style.position = 'absolute'
            this.refs.menu.style.zIndex = null
            this.refs.menu.style.width = null
          }
          if(this.props.alignLeft){
            if((totalWidth - left) - width < 0){
              this.refs.menu.style.setProperty('left', `${-5 -left + totalWidth - width}px`, 'important')
              this.refs.menu.style.setProperty('right', 'auto', 'important')
            }
          }
          else{
            if(left - width < 0){
              this.refs.menu.style.setProperty('left', `${5 -width}px`, 'important')
              this.refs.menu.style.setProperty('right', 'auto', 'important')
            }
            else{
              this.refs.menu.style.left =  'auto'
              this.refs.menu.style.right = null
            }
          }
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

  menuClose(){
    this.setState({visible: false})
    this.closeBind()
  }

  render(){
    const self = this
    let style = {lineHeight: '1.9',minWidth:0}
    if(this.props.style) style = {...style,...this.props.style}

    let styleMenu = {}
    if(this.props.audio && this.refs && this.refs.div){
      const bound = this.refs.div.getBoundingClientRect()
      styleMenu.top = `${bound.top + bound.height - 2}px`
      styleMenu.left = `${bound.left + bound.width - 18}px`
    }

    let list = this.state.dataList ? this.props.children.concat(this.state.dataList) : this.props.children
    if(list && !Array.isArray(list)) list = [list]
    return <div onContextMenu={this.props.onContextMenu} onMouseOver={this.props.mouseOver ? this.onMouseOver : (void 0)}
                onMouseLeave={this.props.mouseOver ? this.onMouseLeave : (void 0)} id={this.uuid} key="div" ref="div" role="listbox"
                aria-expanded="false" className={`${this.props.className != 'main-menu' ? 'draggable-source' : ''} ui top${this.props.mouseOver || this.props.rightDisplay ? '' : ' right pointing'} nav-button dropdown ${this.props.className}`}
                tabIndex={1} style={style}>
      <a ref="button" tabIndex="-1" href="javascript:void(0)" className={this.props.sync ? 'sync' : void 0} title={this.props.title} onClick={this.props.mouseOver ? e=>this.props.onClick(e) : ::this.handleClick} style={{outline: 'none'}}>
        {this.props.icon ? <i className={`fa fa-${this.props.icon}`} /> : null}
        {this.props.badget || null}
      </a>
      {!this.state.visible ? null :
        <div key="menu" ref="menu" style={{...styleMenu,...this.props.style}}
             className={`menu${this.state.visible || this.state.forceOpen ? " visible" : ""} transition left ${this.props.audio ? 'nav-menu-audio' : this.props.rightDisplay ? 'nav3-menu' : this.props.mouseOver ? 'nav2-menu' : 'nav-menu'}`} >
        {(list || []).map((child) => {
            if(child && (child.type == NavbarMenuBarItem || child.type == NavbarMenuItem)){
              return React.cloneElement(child, {
                onClick(e){
                  if(!child.props.keepVisible) self.menuClose()
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