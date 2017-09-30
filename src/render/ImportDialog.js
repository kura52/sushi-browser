import React,{Component} from 'react'
import { Input, Button, Header, Modal,Checkbox,Menu,Dropdown } from 'semantic-ui-react';

export default class ImportDialog extends Component{

  constructor(props){
    super(props)
    this.state = {checkBoxes: this.props.data.detail[0]}
  }

  onChange(e,data){
    console.log(data)
    this.setState({checkBoxes: this.props.data.detail[data.value]})
  }

  changeCheck(val){
    this.state.checkBoxes[val] = !this.state.checkBoxes[val]
    this.setState({})
  }

  buildCheckBoxes(checkBoxes){
    console.log(checkBoxes)
    return [
      <p key='history'><Checkbox ref='history' toggle label='Browser History' onChange={_=>::this.changeCheck('valHist')}
                                 checked={checkBoxes.history && !checkBoxes.valHist} disabled={!checkBoxes.history} /></p>,
      <p key='favorites'><Checkbox ref='favorites' toggle label='Bookmarks' onChange={_=>::this.changeCheck('valBook')}
                                   checked={checkBoxes.favorites && !checkBoxes.valBook} disabled={!checkBoxes.favorites} /></p>,
      <p key='cookies'><Checkbox ref='cookies' toggle label='Cookies' onChange={_=>::this.changeCheck('valCookie')}
                                 checked={checkBoxes.cookies && !checkBoxes.valCookie}  defaultChecked={checkBoxes.cookies} disabled={!checkBoxes.cookies} /></p>
    ]
  }

  makeReturnVal(){
    const checkBoxes = this.state.checkBoxes
    const map = {
      'index': checkBoxes.index.toString(),
      'type': checkBoxes.type
    }
    let enable = false
    if(checkBoxes.history && !checkBoxes.valHist) map.history = enable = true
    if(checkBoxes.favorites && !checkBoxes.valBook) map.favorites = enable =  true
    if(checkBoxes.cookies && !checkBoxes.valCookie) map.cookies = enable = true
    console.log(map)
    return {map,disabled:!enable}
  }

  render(){
    console.log(this.props.data)
    return <Modal dimmer={false} size="small" open={true}>
      <Modal.Header>Import Browser Data</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <p>
            <Menu compact>
              <Dropdown text={this.state.checkBoxes.name} options={this.props.data.detail.map((d,key)=>{return {key,text:d.name,value:d.index}})}
                        item onChange={::this.onChange}/>
            </Menu>
          </p>
          {this.buildCheckBoxes(this.state.checkBoxes)}
          <p>Please make sure the selected browser is closed before importing your data.</p>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button positive content="Import" onClick={_=>this.props.delete(0,this.makeReturnVal().map)}
                disabled={this.makeReturnVal().disabled}/>
        <Button color='black' content="Cancel" onClick={_=>{this.props.delete(1)}}/>
      </Modal.Actions>
    </Modal>
  }
}
