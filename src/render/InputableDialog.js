import React,{Component} from 'react'
import ReactDOM from 'react-dom'
import { Icon,Form, TextArea, Input, Button, Header, Modal,Checkbox } from 'semantic-ui-react';
const ipc = require('electron').ipcRenderer
const {app} = require('electron').remote.require('electron')
export default class InputableDialog extends Component{

  constructor(props) {
    super(props)
    this.handleOk = ::this.handleOk
    this.autoInput = ::this.autoInput
  }

  componentDidMount(){
    const input = this.refs.input0 && ReactDOM.findDOMNode(this.refs.input0)
    if(input) input.focus()
    if(this.props.data.needInput){
      const inputLast = this.refs[`input${ this.props.data.needInput.length - 1}`]
      if(inputLast){
        ReactDOM.findDOMNode(inputLast).addEventListener('keydown',e=>{if(e.keyCode == 13) this.handleOk()})
      }
    }
    if(this.props.data.auth){
      ipc.once('auto-play-auth',this.autoInput)
    }
  }

  autoInput(e,user,pass){
    this.refs.input0.input.value = user
    this.refs.input1.input.value = pass
    this.handleOk()
  }

  renderInputs(){
    const len = this.props.data.needInput.length
    return this.props.data.needInput.map((x,i)=>{
      if(this.props.data.option && this.props.data.option[i] == "textArea"){
        return <p key={i}>{x}
          <Form><TextArea ref={`input${i}`} className="inputable-dialog"
                          defaultValue={this.props.data.initValue ? this.props.data.initValue[i] : ""} placeholder='Enter URLs' rows={10} /></Form>
        </p>
      }
      else if(this.props.data.option &&this.props.data.option[i] == "dialog"){
        return <p key={i}>{x}
          <div style={{display:'flex'}}>
            <Input focus={false} ref={`input${i}`} className="inputable-dialog"
                   defaultValue={app.getPath('downloads')}
                   onKeyDown={e=>{
                     if(len == 1 && x == "" && e.keyCode==13){
                       this.props.delete(0,[e.target.value])
                     }
                   }}/>
            <Button icon='folder' onClick={_=>{
              const key = Math.random().toString()
              ipc.send('show-dialog-exploler',key,{})
              ipc.once(`show-dialog-exploler-reply_${key}`,(e,val)=>{
                if(!val) return
                ReactDOM.findDOMNode(this.refs[`input${i}`]).querySelector('input').value = val
              })
            }}/>
          </div>
        </p>
      }
      else if(this.props.data.option && this.props.data.option[i] == "toggle"){
        return <p key={i}>
          <Checkbox toggle ref={`input${i}`} className="inputable-dialog"/>
          <span className="toggle-label">{x}</span>
        </p>
      }
      else{
        return <p key={i}>{x}
          <Input ref={`input${i}`} focus className="inputable-dialog"
                 defaultValue={this.props.data.initValue ? this.props.data.initValue[i] : ""}
                 onKeyDown={e=>{
                   if(len == 1 && x == "" && e.keyCode==13){
                     this.props.delete(0,[e.target.value])
                   }
                 }}/>
        </p>
      }
    })
  }

  handleOk(){
    this.props.delete(0,[...document.querySelectorAll('.inputable-dialog > input:not(.hidden),textArea.inputable-dialog,.checkbox.inputable-dialog')].map(x=>{
      return x.className.includes('checkbox') ? x.classList.contains('checked') : x.value
    }))
    ipc.removeListener('auto-play-auth',this.autoInput)
  }

  render(){
    console.log(this.props.data)
    return <Modal dimmer={false} size="small" open={true}>
      <Modal.Header>{this.props.data.title}</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Header>{this.props.data.text.split(/\r?\n/).map((x,i)=> <div key={i}>{x}</div>)}</Header>
          {this.renderInputs()}
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button positive refs="ok" content="OK" onClick={this.handleOk} />
        <Button color='black' content="Cancel" onClick={_=>{
          this.props.delete(1)
          ipc.removeListener('auto-play-auth',this.autoInput)}}/>
      </Modal.Actions>
    </Modal>
  }
}
