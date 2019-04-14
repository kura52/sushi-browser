const React = require('react')
const ReactDOM = require('react-dom');
const {Component} = React
const ipc = require('electron').ipcRenderer
import uuid from 'node-uuid'
const PubSub = require('./pubsub')
const {syncReplace} = require('./databaseRender')

const SYNC_REPLACE_NUM = 5

export default class SyncReplace extends Component {
  constructor(props) {
    super(props)
    this.uuid = `a${uuid.v4()}`
    this.state = {visible: false}
  }

  componentDidMount() {
    const self = this
    this.outerClick = e=>{
      if(!e.srcElement.closest(`#${this.uuid}`)) self.setState({visible:false})
    }
  }


  componentWillUnmount() {
    document.removeEventListener('mousedown',this.outerClick)
  }

  componentDidUpdate(prevProps, prevState){
    if(this.state.visible != prevState.visible){
      if(this.state.visible){
        ;(async _=>{
          const items = await syncReplace.find({})
          for(let i=0;i<SYNC_REPLACE_NUM;i++){
            const item = items.find(x=>x.key == this.getInd(i))
            console.log(item)
            if(item){
              let vals = item.val.split("\t",-1)
              if(vals.length == 2) vals = ["",...vals]
              vals.unshift(this.state[this.getInd(i)] ? this.state[this.getInd(i)][0] : false)
              this.state[this.getInd(i)] = vals
            }
            else{
              this.state[this.getInd(i)] = [this.state[this.getInd(i)] ? this.state[this.getInd(i)][0] : false,"","",""]
            }
          }
          document.addEventListener('mousedown',this.outerClick)
          this.tokenMouseDown = PubSub.subscribe('webview-mousedown',(msg,e)=>this.outerClick(e))
          this.setState({})
        })()
      }
      else{
        document.removeEventListener('mousedown',this.outerClick)
        PubSub.unsubscribe(this.tokenMouseDown)
      }
    }
  }

  async setVal(index,order,val){
    if(!this.state[this.getInd(0)]){
      const items = await syncReplace.find({})
      for(let i=0;i<SYNC_REPLACE_NUM;i++){
        const item = items.find(x=>x.key == this.getInd(i))
        console.log(item)
        if(item){
          let vals = item.val.split("\t",-1)
          if(vals.length == 2) vals = ["",...vals]
          vals.unshift(this.state[this.getInd(i)] ? this.state[this.getInd(i)][0] : false)
          this.state[this.getInd(i)] = vals
        }
        else{
          this.state[this.getInd(i)] = [this.state[this.getInd(i)] ? this.state[this.getInd(i)][0] : false,"","",""]
        }
      }
    }

    let preCheck = false
    for(let i=0;i<SYNC_REPLACE_NUM;i++){
      preCheck = preCheck || this.state[this.getInd(i)][0]
    }

    this.state[this.getInd(index)][order] = val

    let currentCheck = false
    for(let i=0;i<SYNC_REPLACE_NUM;i++){
      currentCheck = currentCheck || this.state[this.getInd(i)][0]
    }

    const changeFlag = order == 0 ? (!preCheck && currentCheck || preCheck && !currentCheck): false

    if(order!==0){
      const key = this.getInd(index)
      syncReplace.update({key},{key, val: this.state[this.getInd(index)].slice(1).join("\t")}, { upsert: true })
    }
    const sendVal = []
    for(let [k,v] of Object.entries(this.state)){
      if(k.startsWith('syncReplace_')){
        sendVal.push(v)
      }
    }

    if(changeFlag){
      this.props.changeSyncMode(sendVal)
    }
    else{
      this.props.updateReplaceInfo(sendVal)
    }
    this.setState({})
  }

  setVals(replaceInfo){
    replaceInfo.forEach((val,i)=>{
      this.state[this.getInd(i)] = val
    })
  }

  clearAllCheck(){
    for(let i=0;i<SYNC_REPLACE_NUM;i++){
      if(this.state[this.getInd(i)])
        this.state[this.getInd(i)][0] = false
    }
  }

  getInd(index) {
    return `syncReplace_${index}`;
  }

  buildSyncMenu() {
    console.log(this.state)
    const ret = []
    for(let i=0;i<SYNC_REPLACE_NUM;i++){
      const vals = this.state[this.getInd(i)]
      if(!vals) continue
      ret.push(<div role="option" className="item" key={i}>
        <div className={`ui checkbox ${vals[0] ? "checked" : ""}`} style={{verticalAlign: "text-bottom"}}
             onClick={(e) => this.setVal(i,0,!e.target.previousSibling.checked)}>
          <input type="checkbox" tabIndex={0} className="hidden" checked={vals[0]} onBlur={this.handleBlur}/>
          <label />
        </div>
        <div className="ui mini icon input" style={{width: 120}}>
          <input type="text" placeholder="Name" value={vals[1]} onChange={(e) => this.setVal(i,1,e.target.value)} onBlur={this.handleBlur}/>
        </div>
        <div className="ui mini icon input" style={{width: 120}}>
          <input type="text" placeholder="Search" value={vals[2]} onChange={(e) => this.setVal(i,2,e.target.value)} onBlur={this.handleBlur}/>
        </div>
        <div className="ui mini icon input" style={{width: 120}}>
          <input type="text" placeholder="Replace"  value={vals[3]} onChange={(e) => this.setVal(i,3,e.target.value)} onBlur={this.handleBlur}/>
        </div>
      </div>)
    }
    return ret
  }



  render(){
    return <div id={this.uuid} role="listbox"  style={{lineHeight: 1.9}} onContextMenu={this.props.onContextMenu}
                className="sort-syncReplace draggable-source ui scrolling pointing nav-button dropdown" tabIndex={0}>
      <a ref="button" href="javascript:void(0)" className={this.props.replaceInfo ? "sync" : ""} title="Switch Sync URL Replace Mode" onClick={(e)=>this.setState({visible:!this.state.visible})} >
        <i className="fa fa-circle" />
      </a>
      <div className={`menu${this.state.visible ? " visible" : ""} transition nav-menu sync-replace`}>
        <div style={{position:'fixed',top:-5,right:0,zIndex:3000}}>
          <a href="javascript:void(0)" className="sync-replace" onClick={e=>this.setState({visible:false})}><i aria-hidden="true" className="fa fa-times"></i></a>
        </div>
        {this.buildSyncMenu()}
      </div>
    </div>
  }
}