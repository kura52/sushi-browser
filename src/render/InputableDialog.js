import React,{Component} from 'react'
import ReactDOM from 'react-dom'
import { Icon,Form, TextArea, Input, Button, Header, Modal } from 'semantic-ui-react';
const ipc = require('electron').ipcRenderer
const {app} = require('electron').remote.require('electron')
export default class InputableDialog extends Component{

  componentDidMount(){
    const input = document.querySelector('.inputable-dialog > input')
    input.focus()
    input.select()
  }

  renderInputs(){
    const len = this.props.data.needInput.length
    return this.props.data.needInput.map((x,i)=>{
      if(this.props.data.option && this.props.data.option[i] == "textArea"){
        return <p key={i}>{x}
          <Form><TextArea ref={`input${i}`} className="inputable-dialog" placeholder='Enter URLs' rows={5} /></Form>
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
        <Button positive content="OK" onClick={_=>this.props.delete(0,[...document.querySelectorAll('.inputable-dialog > input,textArea.inputable-dialog')].map(x=>x.value))} />
        <Button color='black' content="Cancel" onClick={_=>{this.props.delete(1)}}/>
      </Modal.Actions>
    </Modal>
  }
}
