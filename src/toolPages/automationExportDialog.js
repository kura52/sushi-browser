import React,{Component} from 'react'
import ReactDOM from 'react-dom'
import path from 'path'
import { Dropdown, Input, Button, Modal } from 'semantic-ui-react';
const ipc = require('electron').ipcRenderer

function formatDate(longDate) {
  const date = new Date(longDate)
  return `${date.getFullYear()}/${('0' + (date.getMonth() + 1)).slice(-2)}/${('0' + date.getDate()).slice(-2)} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`
}

export default class AutomationExportDialog extends Component{
  constructor(props){
    super(props)
    const [puppeteer, automationHistory] = ipc.sendSync('get-sync-main-states',['puppeteer','automationHistory'])
    this.state = {puppeteer, automationHistory, latest: automationHistory.length ? automationHistory[automationHistory.length - 1] : null}
  }

  componentDidMount(){
    setTimeout(_=>{
      const editor = ace.edit("editor")

      const {funcs,codes} = this.props.code

      editor.setShowPrintMargin(false)
      editor.$blockScrolling = Infinity
      // editor.setOptions({
      //   enableBasicAutocompletion: true,
      //   enableSnippets: true
      // })
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
  updateHistory(val){
    const now = Date.now()
    this.state.automationHistory.push([now,val])

    const map = {}
    for(let [key,val] of this.state.automationHistory){
      map[val] = key
    }
    const arr = []
    for(let [val,key] of Object.entries(map)){
      if(arr.length > 100) break
      arr.push([key,val])
    }

    ipc.send('save-state',{tableName:'state',key:'automationHistory',val:arr})
    this.setState({automationHistory: arr, latest:now})
  }

  buildOptions(){
    return this.state.automationHistory.map(x=>({text:formatDate(x[0]) ,value:x[0]})).reverse()
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

  handleUpdateTextArea(e,data){
    const editor = ace.edit("editor")
    const rec = this.state.automationHistory.find(x=>x[0] == data.value)
    editor.getSession().setValue(rec[1])
    this.setState({latest: rec[0]})
  }

  handleRunSushi(){
    const editor = ace.edit("editor")
    ipc.send("open-dev-tool")
    const datas = editor.getSession().getValue()
    this.updateHistory(datas)
    const codes = []
    for(let data of datas.split("\n")){
      if(data.match(/require\(['"]puppeteer['"]\)|from +?['"]puppeteer['"]/)){
        data = `// ${data}\n;`
      }
      codes.push(data)
    }
    this.props.eval(codes.join("\n"))
  }

  handleRunPupeeter(){
    const editor = ace.edit("editor")
    const datas = editor.getSession().getValue()
    this.updateHistory(datas)
    ipc.send('save-file',{content: datas, savePath: path.join(this.state.puppeteer,this.props.fname)})
    ipc.once('save-reply',(event,result,savePath)=>{
      ipc.send('run-puppeteer',this.state.puppeteer,savePath)
    })
  }

  render(){
    console.log(this.props.data)
    return <Modal dimmer={false} size="small" open={true} style={{width: 'calc(100vw - 120px)', marginLeft: 'auto', marginRight: 'auto', left: 0, right: 0}}>
      <Modal.Header>
        Export/Playground Script
        <span className="auto-run-history">
          <label style={{verticalAlign: 'baseline', paddingRight: 12}} >Run History</label>
          <Dropdown selection  options={this.buildOptions()} value={this.state.latest} onChange={::this.handleUpdateTextArea}/>
        </span>
      </Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <div id="editor"></div>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <label style={{verticalAlign: 'bottom', paddingRight: 12}}>Puppeteer Project Path</label>
        <div className="ui input">
          <Input onChange={this.onChange.bind(this,'puppeteer')} defaultValue={this.state.puppeteer}/>
        </div>
        {/*<Button positive refs="clip" content="Copy to Clipboard" onClick={::this.handleClip} />*/}
        <Button positive refs="clip" content="Save File" onClick={::this.handleSave} />
        <Button positive refs="run" content="Run" onClick={::this.handleRunSushi} />
        <Button positive refs="puppeteer" content="Run on Puppeteer" onClick={::this.handleRunPupeeter} />
        <Button positive refs="clip" content="Close" onClick={this.props.onClose} />
      </Modal.Actions>
    </Modal>
  }
}
