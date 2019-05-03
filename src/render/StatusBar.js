const React = require('react')
const {Component} = React
const ReactDOM = require('react-dom')

const {remote} = require('electron');
const {webContents} = remote
const PubSub = require('./pubsub')
const mainState = require('./mainStateRemote')
const NavbarMenu = require('./NavbarMenu')
const {NavbarMenuItem,NavbarMenuBarItem,NavbarMenuSubMenu} = require('./NavbarMenuItem')

const ipc = require('electron').ipcRenderer
const sharedState = require('./sharedState')
const getTheme = require('./theme')
const {messages,locale} = require('./localAndMessage')

export default class StatusBarWrapper extends Component {
  constructor(props){
    super(props)
    this.prev = void 0
  }

  componentWillMount() {
    this.props.refs2[`statusbar-${this.props.tab.key}`] = this
    console.log(68888,`hover-statusbar-${this.props.tab.key}`)
    this.token = PubSub.subscribe(`hover-statusbar-${this.props.tab.key}`,(e,val)=>{
      if(this.hoverStatusBar == val) return
      if(!sharedState.statusBar){
        clearTimeout(this.id)
        this.id = setTimeout(_=>{
          this.getWebContents(this.props.tab).executeJavaScript('document.scrollingElement.scrollWidth - document.scrollingElement.clientWidth',(result)=>{
            this.hoverStatusBar = val
            console.log(543543543,result)
            if(result !== 0){
              this.margin = true
            }
            else{
              this.margin = false
            }
            this.setState({})
          })
        },100)
      }
    })
  }

  getWebContents(tab){
    if(!tab.wv || !tab.wvId) return
    return global.currentWebContents[tab.wvId]
  }

  isShow(){
    return (sharedState.statusBar || this.hoverStatusBar) &&
      (this.props.toggleNav != 2 && this.props.toggleNav != 3) &&
      this.props.tab.page.navUrl != 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/terminal.html'
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   let val = this.isShow()
  //   if(!val) val = void 0
  //   const cond = this.prev === val
  //   if(cond){
  //     this.prev = val
  //   }
  //   else{
  //     PubSub.publish('web-view-create')
  //   }
  //   return cond
  // }

  componentWillUnmount() {
    PubSub.unsubscribe(this.token)
    if(this.props.refs2[`statusbar-${this.props.tab.key}`] == this){
      delete this.props.refs2[`statusbar-${this.props.tab.key}`]
    }
  }

  render(){
    return this.isShow() ? <StatusBar {...this.props} margin={this.margin} hoverStatusBar={this.hoverStatusBar}/> : null
  }
}

class StatusBar extends Component {
  constructor(props) {
    super(props)
    this.state = {percent: 100}
    this.refs2 = {}
    this.mouseLeaveHandler = e => PubSub.publish('mouseleave-status-bar')
    this.updateZoom = ::this.updateZoom
    this.handleFileMouseDown = ::this.handleFileMouseDown
  }

  getWebContents(tab){
    if(!tab.wv || !tab.wvId) return
    return global.currentWebContents[tab.wvId]
  }

  async getZoom(){
    let cont
    for(let i=0;i<100;i++){
      await new Promise(r=>{
        setTimeout(_=>{
          cont = this.getWebContents(this.props.tab)
          r()
        },100)
      })
      if(cont) break
    }
    if(cont){
      ipc.on(`get-on-dom-ready-reply_${this.props.tab.wvId}`,this.updateZoom)
      cont.getZoomFactor(factor=>this.setState({percent: factor * 100}))
    }
  }

  updateZoom(){
    const cont = this.getWebContents(this.props.tab)
    if(!cont.isDestroyed()){
      cont.getZoomFactor(factor=>this.setState({percent: factor * 100}))
    }

  }

  componentDidMount() {
    document.addEventListener('mouseleave',this.mouseLeaveHandler)
    this.token = PubSub.subscribe(`change-status-${this.props.tab.key}`,_=>this.setState({}))
    this.tokenZoom = PubSub.subscribe(`zoom-change_${this.props.tab.key}`,(msg,percent)=>this.setState(percent))
    this.getZoom()
  }

  componentWillUnmount() {
    ipc.removeListener(`get-on-dom-ready-reply_${this.props.tab.wvId}`,this.updateZoom)
    document.removeEventListener('mouseleave',this.mouseLeaveHandler)
    if(this.token) PubSub.unsubscribe(this.token)
  }

  getStatusText(){
    let status = this.props.tab.page.statusText
    if (!status && this.props.tab.page.isLoading)
      status = 'Loading...'
    else if(status){
      try{
        status = decodeURIComponent(status)
      }catch(e){
        console.log(e)
      }
    }
    return status
  }

  zoomCoomon(type){
    const percent = this.state.percent + parseInt(mainState.zoomBehavior) * (type == 'zoomOut' ? -1 : 1)
    this.getWebContents(this.props.tab).setZoomFactor(percent/100.0)
    this.setState({percent})
  }

  handleFileMouseDown(e){
    this.mouseDown = e.target
    this.button = e.button
  }

  handleFileMouseUp(url,e){
    if(this.mouseDown !== e.target || this.button !== e.button) return
    this.mouseDown = void 0
    this.button = void 0

    const tab = this.props.tab
    if(e.button == 0){
      if(mainState.toolbarLink){
        tab.events['new-tab']({}, tab.wvId, url)
      }
      else{
        tab.events['load-url']({}, tab.wvId, url)
      }
    }
    else if(e.button == 1){
      tab.events['create-web-contents'](null, {id:tab.wvId,targetUrl:url,disposition:'background-tab'})
    }
  }

  renderButton(icon,title,url){
    url = url.includes('://') ? url : `chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/${url}.html`
    return <a className="status-bar-button" title={locale.translation(title)}
              onMouseDown={this.handleFileMouseDown}
              onMouseUp={this.handleFileMouseUp.bind(this, url)}>
      <i className={`fa fa-${icon}`}/>
    </a>
  }

  renderButtonEvent(icon,title,onClick){
    return <a className="status-bar-button" title={locale.translation(title)} onClick={onClick}>
      <i className={`fa fa-${icon}`}/>
    </a>
  }


  render(){
    const bgImage = getTheme('images','theme_toolbar')|| void 0
    let style = {backgroundImage: bgImage,
      backgroundColor: bgImage ? 'initial' : void 0,
      backgroundPositionY: bgImage ? -57 : void 0,
      color: (getTheme('colors','bookmark_text') || void 0)}
    if(sharedState.hoverStatusBar){
      const rect = this.props.hoverStatusBar.getBoundingClientRect()
      style = {overflow: 'hidden',position: 'fixed',zIndex:1000,width:rect.width,bottom:this.props.margin ? 15 : 0,left:rect.left,
        paddingTop: 2,height:25 ,borderBottom: '1px solid rgb(148, 148, 148)',...style}
    }
    return <div ref="bar" className={`status-bar ${this.props.hoverStatusBar ? 'visible transition' : ''}`} style={style}>
      <p className="status-text">{this.getStatusText()}</p>
      <span style={{float: 'right'}}>
        {this.renderButton('home','480990236307250886',sharedState.homeURL)}
        {this.renderButton('star','bookmarks','chrome://bookmarks2/')}
        {this.renderButton('history','history','chrome://history/')}
        {this.renderButton('download','downloads','download')}
        {this.renderButton('sticky-note','note','note')}
        {this.renderButton('cog','settings','chrome://setting/')}
        {/*{this.renderButton('folder','fileExplorer','explorer')}*/}
        {/*{this.renderButton('terminal','4589268276914962177','terminal')}*/}
        <span className="vertical-divider"/>

        {this.renderButtonEvent('print','print',()=>this.getWebContents(this.props.tab).print())}
        {this.renderButtonEvent('search','search',()=>ipc.emit('menu-or-key-events',null,'findOnPage',this.props.tab.wvId))}
        {/*{this.renderButtonEvent('bug','toggleDeveloperTools',()=>ipc.emit('menu-or-key-events',null,'toggleDeveloperTools',this.props.tab.wvId))}*/}
        <span className="vertical-divider"/>

        <a className='zoom-reset' onClick={_=>{
          ipc.send('set-zoom',this.props.tab.wvId,1)
          PubSub.publish(`zoom_${this.props.tab.key}`,100)
          this.setState({percent: 100})
        }}>Reset</a>
        <a className="zoom-change" onClick={this.zoomCoomon.bind(this,'zoomOut')}><i className="fa fa-minus"/></a>
         <input className="zoom" type="range" min="20" max="500" name="zoom" step="10" value={this.state.percent}
                onInput={e=>{
                  const percent = parseInt(e.target.value)
                  clearTimeout(this.clearId)
                  this.clearId = setTimeout(_=>{
                    ipc.send('set-zoom',this.props.tab.wvId,percent/100.0)
                    PubSub.publish(`zoom_${this.props.tab.key}`,percent)
                  },100)
                  this.setState({percent})
                }}/>
        <a className="zoom-change" onClick={this.zoomCoomon.bind(this,'zoomIn')}><i className="fa fa-plus"/></a>
        <span className='zoom-text'>{this.state.percent}%</span>
        </span>
    </div>
  }
}