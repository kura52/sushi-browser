import React,{Component} from 'react'
import { Input, Button, Header, Modal } from 'semantic-ui-react';

export default class InputableDialog extends Component{

  componentDidMount(){
    const input = document.querySelector('.inputable-dialog > input')
    input.focus()
    input.select()
  }

  renderInputs(){
    const len = this.props.data.needInput.length
    return this.props.data.needInput.map((x,i)=>{
      return <p key={i}>{x}
        <Input focus className="inputable-dialog"
               defaultValue={this.props.data.initValue ? this.props.data.initValue[i] : ""}
               onKeyDown={e=>{
                 if(len == 1 && x == "" && e.keyCode==13){
                   this.props.delete(0,[e.target.value])
                 }
               }}/>
      </p>
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
        <Button positive content="OK" onClick={_=>this.props.delete(0,[...document.querySelectorAll('.inputable-dialog > input')].map(x=>x.value))} />
        <Button color='black' content="Cancel" onClick={_=>{this.props.delete(1)}}/>
      </Modal.Actions>
    </Modal>
  }
}
