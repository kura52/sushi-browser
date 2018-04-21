import React,{Component} from 'react'
import ReactDOM from 'react-dom'
import path from 'path'
import { Icon,Form, TextArea, Input, Button, Header, Modal,Checkbox } from 'semantic-ui-react';
const ipc = require('electron').ipcRenderer
export default class AutomationExportDialog extends Component{
  constructor(props){
    super(props)
    this.state = {puppeteer: ipc.sendSync('get-sync-main-state','puppeteer')}
  }

  componentDidMount(){
    setTimeout(_=>{
      const editor = ace.edit("editor")

      const {funcs,codes} = this.props.code

      editor.setShowPrintMargin(false)
      editor.$blockScrolling = Infinity
      editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true
      })
      editor.setTheme("ace/theme/chrome")
      editor.setFontSize(13);
      editor.getSession().setMode("ace/mode/javascript")
      editor.getSession().setUseWrapMode(true)
      editor.getSession().setTabSize(2)
      console.log(funcs.map(x=>x.replace(/^  /gm,'')).join("\n\n"))
      editor.getSession().setValue(`//Puppeteer script for running Headless Chrome [https://github.com/GoogleChrome/puppeteer]
const puppeteer = require('puppeteer')

//Functions
${funcs.join("\n\n").replace(/^  /gm,'')}

//Main
;(async function(){
${codes.map(x=>`  ${x}`).join("\n")}
  await browser.close();
}())`,-1)
    },100)
  }

  onChange(name,e,data){
    ipc.send('save-state',{tableName:'state',key:name,val:data.value || data.checked})
    this.setState({[name]:data.value})
  }

  handleSave(){
    const editor = ace.edit("editor")
    ipc.send('save-file',{content: editor.getSession().getValue(), fname: this.props.fname})
    ipc.once('save-reply',(event,result)=> this.props.onClose())
  }

  handleClip(){
    const editor = ace.edit("editor")
    ipc.send("set-clipboard",[editor.getSession().getValue()])
  }

  handleRunSushi(){
    const editor = ace.edit("editor")
    const datas = editor.getSession().getValue()
    const codes = []
    for(let data of datas.split("\n")){
      if(data.match(/require\(['"]puppeteer['"]\)|from +?['"]puppeteer['"]/)){
        data = `// ${data}`
      }
      codes.push(data)
    }
    this.props.eval(codes.join("\n"))
  }

  handleRunPupeeter(){
    const editor = ace.edit("editor")
    ipc.send('save-file',{content: editor.getSession().getValue(), savePath: path.join(this.state.puppeteer,this.props.fname)})
    ipc.once('save-reply',(event,result,savePath)=>{
      ipc.send('run-puppeteer',this.state.puppeteer,savePath)
    })
  }

  render(){
    console.log(this.props.data)
    return <Modal dimmer={false} size="small" open={true} style={{width: 'calc(100vw - 120px)', marginLeft: 'auto', marginRight: 'auto', left: 0, right: 0}}>
      <Modal.Header>Export Automation Script</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <div id="editor"></div>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <label style={{verticalAlign: 'bottom', paddingRight: 12}}>Puppeeter Project Path</label>
        <div className="ui input">
          <Input onChange={this.onChange.bind(this,'puppeteer')} defaultValue={this.state.puppeteer}/>
        </div>
        {/*<Button positive refs="clip" content="Copy to Clipboard" onClick={::this.handleClip} />*/}
        <Button positive refs="clip" content="Save As File..." onClick={::this.handleSave} />
        <Button positive refs="run" content="Run on Sushi" onClick={::this.handleRunSushi} />
        <Button positive refs="puppeteer" content="Run on Puppeteer" onClick={::this.handleRunPupeeter} />
        <Button positive refs="clip" content="Close" onClick={this.props.onClose} />
      </Modal.Actions>
    </Modal>
  }
}
