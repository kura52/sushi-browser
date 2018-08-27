const React = require('react')
const {Component} = React
const ipc = require('electron').ipcRenderer
const PubSub = require('./pubsub')

export default class AutofillPopup extends Component {
  constructor(props) {
    super(props)
    this.state = {datas:{},active:-1}

  }

  componentDidMount() {
    this.tokenRegistWebview = PubSub.subscribe(`regist-webview_${this.props.k}`,(msg,tab)=>{
      const wv = tab.wv
      this.showAutoFill = (e) => {
        console.log('autofill',e)
        if(e.rect.height + e.rect.width == 0) return

        if(e.suggestions.length == 1){
          if(e.callback){
            e.callback(e.suggestions[0].value)
          }
          else{
            ipc.send('autofill-selection-clicked', this.state.tab.wvId, e.suggestions[0].value, 0, 0)
          }
          return
        }

        this.setState({datas:e})

        this.keyDown = (evt)=>{
          if(evt.keyCode === 13 && this.state.active != -1) { //enter
            try{
              if(e.callback){
                e.callback(this.state.datas.suggestions[this.state.active].value)
              }
              else{
                ipc.send('autofill-selection-clicked', this.state.tab.wvId, this.state.datas.suggestions[this.state.active].value, 0, this.state.active)
              }
            }
            catch(e){
              console.log(e)
            }
            evt.stopPropagation()
          }
          else if(evt.keyCode === 38 ){//up
            const now = Date.now()
            if(!this.keyPageUp){
              this.setState({active : this.state.active == -1 || this.state.active == 0 ? e.suggestions.length - 1 : this.state.active - 1})
              this.keyPageUp = now
            }
            else if(this.keyPageUplongPress && now - this.keyPageUp > 30){
              this.setState({active : this.state.active == -1 || this.state.active == 0 ? e.suggestions.length - 1 : this.state.active - 1})
              this.keyPageUp = now
            }
            else if(now - this.keyPageUp > 1000){
              this.keyPageUplongPress = true
            }
          }
          else if(evt.keyCode === 40){//down
            const now = Date.now()
            if(!this.keyPageDown){
              this.setState({active : this.state.active == e.suggestions.length - 1 ? 0 : this.state.active + 1})
              this.keyPageDown = now
            }
            else if(this.keyPageDownlongPress && now - this.keyPageDown > 30){
              this.setState({active : this.state.active == e.suggestions.length - 1 ? 0 : this.state.active + 1})
              this.keyPageDown = now
            }
            else if(now - this.keyPageDown > 1000){
              this.keyPageDownlongPress = true
            }
          }
        }

        this.keyUp = (evt)=>{
          if(evt.keyCode === 38 ) {//up
            this.keyPageUp = void 0
            this.keyPageUplongPress = false
          }
          else if(evt.keyCode === 40 ) {//down
            this.keyPageDown = void 0
            this.keyPageDownlongPress = false
          }
        }

        document.addEventListener("keydown",this.keyDown)
        document.addEventListener("keyup",this.keyUp)
      }

      this.hideAutoFill =  (e) => {
        if(this.state.datas.suggestions) {
          this.setState({datas:{},active:-1})
          wv.removeEventListener("keypress", this.keyEnter)
          document.removeEventListener("keydown", this.keyDown)
          document.removeEventListener("keyup",this.keyUp)
          this.keyPageUp = void 0
          this.keyPageUplongPress = false
          this.keyPageDown = void 0
          this.keyPageDownlongPress = false
          this.keyEnter= void 0
        }
      }
      wv.addEventListener('show-autofill-popup',this.showAutoFill)
      wv.addEventListener('hide-autofill-popup',this.hideAutoFill)

      this.tokenDidNavigate = PubSub.subscribe(`did-navigate_${tab.key}`,(msg,url)=>{
        this.hideAutoFill()
      })
      this.setState({wv,tab})
    })
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.tokenRegistWebview)
    PubSub.unsubscribe(this.tokenDidNavigate)
    if(this.showAutoFill) this.state.wv.removeEventListener('show-autofill-popup',this.showAutoFill)
    if(this.hideAutoFill) this.state.wv.removeEventListener('hide-autofill-popup',this.hideAutoFill)
  }

  componentWillUpdate(nextProps, nextState){
    if(nextState.active != -1 && !this.keyEnter){
      this.keyEnter = (e)=>{
        if (e.keyCode === 13 || e.keyCode === 38 || e.keyCode === 40 ) {
          e.stopPropagation()
          e.preventDefault()
        }
      }
      this.state.wv.addEventListener("keypress",this.keyEnter)
    }
  }

  render(){
     const style = this.state.datas.rect ? {position:'fixed',
      top:this.state.datas.rect.y + this.state.datas.rect.height,
      left:this.state.datas.rect.x } : {}
    return <div className="search ui" style={style}>
      <div ref="autofill" className={`results transition ${this.state.datas.suggestions ? 'visible' : 'hidden'}`} style={{width: "auto",borderRadius: 0}}>
        {this.state.datas.suggestions ? this.state.datas.suggestions.map((data,i)=>{
          return <a ref={`item${i}`} className={`result${this.state.active == i ? " active" : ""}`} key={i} onMouseDown={_=>{
            if(this.state.datas.callback){
              this.state.datas.callback(data.value)
            }
            else{
              const active = document.activeElement
              ipc.send('autofill-selection-clicked', this.state.tab.wvId, data.value, 0, i)
              setTimeout(_=>active.focus(),100)
            }
          }}>
            <div className="content">
              <div className="title">{data.value}</div>
            </div>
          </a>
        }) : ""}
      </div>
    </div>
  }
}