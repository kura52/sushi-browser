import React,{Component} from 'react'
import ReactDOM from 'react-dom'
import { Button, Modal,Dropdown } from 'semantic-ui-react';
const electron = require('electron')
const ipc = electron.ipcRenderer
const mainState = electron.remote.require('./mainState')

const presets = {
  General: ['Very Fast 1080p30','Very Fast 720p30','Very Fast 576p25','Very Fast 480p30','Fast 1080p30','Fast 720p30','Fast 576p25','Fast 480p30','HQ 1080p30 Surround','HQ 720p30 Surround','HQ 576p25 Surround','HQ 480p30 Surround','Super HQ 1080p30 Surround','Super HQ 720p30 Surround','Super HQ 576p25 Surround','Super HQ 480p30 Surround'],
  Devices : ['Android 1080p30','Android 720p30','Android 576p25','Android 480p30','Apple 2160p60 4K HEVC Surround','Apple 1080p60 Surround','Apple 1080p30 Surround','Apple 720p30 Surround','Apple 540p30 Surround','Apple 240p30','Chromecast 2160p60 4K HEVC Surround','Chromecast 1080p30 Surround','Fire TV 2160p60 4K HEVC Surround','Fire TV 1080p30 Surround','Playstation 1080p30 Surround','Playstation 720p30','Playstation 540p30','Roku 2160p60 4K HEVC Surround','Roku 1080p30 Surround','Roku 720p30 Surround','Roku 576p25','Roku 480p30','Windows Mobile 1080p30','Windows Mobile 720p30','Windows Mobile 540p30','Windows Mobile 480p30','Xbox 1080p30 Surround','Xbox Legacy 1080p30 Surround'],
  Web: ['Gmail Large 3 Minutes 720p30','Gmail Medium 5 Minutes 480p30','Gmail Small 10 Minutes 288p30','Vimeo YouTube HQ 2160p60 4K','Vimeo YouTube HQ 1440p60 2.5K','Vimeo YouTube HQ 1080p60','Vimeo YouTube HQ 720p60','Vimeo YouTube 720p30',],
  Matroska : ['H.265 MKV 2160p60','H.265 MKV 1080p30','H.265 MKV 720p30','H.265 MKV 576p25','H.265 MKV 480p30','H.264 MKV 2160p60','H.264 MKV 1080p30','H.264 MKV 720p30','H.264 MKV 576p25','H.264 MKV 480p30','VP9 MKV 2160p60','VP9 MKV 1080p30','VP9 MKV 720p30','VP9 MKV 576p25','VP9 MKV 480p30','VP8 MKV 1080p30','VP8 MKV 720p30','VP8 MKV 576p25','VP8 MKV 480p30'],
  Production : ['Production Max','Production Standard','Production Proxy 1080p','Production Proxy 540p'],
  Legacy : ['Normal','HighProfile','Universal','iPod','iPhone&iPodtouch','iPad','AppleTV','AppleTV2','AppleTV3','Android','AndroidTablet','WindowsPhone8']
}

const codecs = [['Auto Passthru','copy'],['AAC (avcodec)','aac'],['MP3','mp3'],['AC3','ac3'],['Vorbis','vorbis'],['Opus (libopus)','opus'],['FLAC 16-bit','flac16'],['FLAC 24-bit','flac24']]


export default class ConverterDialog extends Component{

  constructor(props) {
    const [preset,defaultSelect] = ipc.sendSync('get-sync-main-states',['defaultVideoPreset','defaultPopupSelect'])
    super(props)
    this.handleOk = ::this.handleOk
    this.state = {audioExtract: defaultSelect == 'audio', audioEncoder: 'aac', audioBitrate: 160, preset }
  }

  componentDidMount(){
    // const input = this.refs.input0
    // if(input && input.focus) input.focus()
    // if(this.props.data.needInput){
    //   const inputLast = this.refs[`input${ this.props.data.needInput.length - 1}`]
    //   if(inputLast){
    //     inputLast.inputRef.addEventListener('keydown',e=>{if(e.keyCode == 13) this.handleOk()})
    //   }
    // }
  }

  activeStyle(isActive){
    return isActive ? {backgroundColor: '#deecfd', borderColor: '#deecfd'} : {}
  }

  makeValues2(...items){
    return items.map(item=>({text:item[0], value:item[1]}))
  }

  renderAudioConvert(){
    const ac = this.state.audioEncoder

    const bitrates = ac == 'aac' ? ['64','80','96','112','128','160','192','224','256','320','384','448','512'] :
      ac == 'mp3' ? ['32','40','48','56','64','80','96','112','128','160','192','224','256','320'] :
        ac == 'ac3' ? ['112','128','160','192','224','256','320','384','448','512','576','640'] :
          ac == 'vorbis' ? ['56','64','80','96','112','128','160','192','224','256','320','384','448'] :
            ['32','40','48','56','64','80','96','112','128','160','192','224','256','320','384','448','512']

    return <span>
          <br/>
        <label style={{verticalAlign: 'baseline',paddingRight: 10}}>Audio Codec:</label>
        <Dropdown className="video-codec" selection options={this.makeValues2(...codecs)}
                  value={this.state.audioEncoder} onChange={(e,data)=>this.setState({audioEncoder: data.value})}/>
        <div style={{height: 5}}/>
        {ac.match(/copy|flac/) ? '' :<span>
          <label className="avg" style={{display: 'inline', paddingRight: 43}}>Bitrate: </label>
          <Dropdown className="bitrate" selection options={this.makeValues2(...bitrates.map(x=>[x,parseInt(x)]))}
                  value={this.state.audioBitrate} onChange={(e,data)=>this.setState({audioBitrate: parseInt(data.value)})}/> kbps

        </span>}
      </span>
  }

  renderVideoPresets(){
    const arr = []
    let i = 0
    for(let [category,values] of Object.entries(presets)){
      arr.push(<li key={i++} className="preset" style={{fontWeight: 'bold'}}>{category}</li>)
      for(let x of values){
        arr.push(<li key={i++} onClick={e=>this.setState({preset: e.target.textContent})} className="preset val" style={{paddingLeft: 8, ...this.activeStyle(x==this.state.preset)}}>{x}</li>)
      }
    }
    return <ul style={{display: 'flex', flexWrap: 'wrap', flexDirection: 'column', maxHeight: 650,
      border: '1px solid #D4D4D5',borderRadius: 3, padding: '10px 20px 10px 20px'}}>{arr}</ul>
  }
  
  renderInputs() {
    return <span>
      <div className="field" style={{display: 'inline',paddingLeft: 7}}>
        <div className="ui radio checkbox" style={{paddingRight: 22}} onClick={e=>{mainState.set('defaultPopupSelect','video');this.setState({audioExtract:false})}}>
          <input type="radio" className="hidden" readOnly tabIndex={0} value="0" checked={!this.state.audioExtract}/>
          <label>Convert Video</label>
        </div>

        <div className="ui radio checkbox" onClick={e=>{mainState.set('defaultPopupSelect','audio');;this.setState({audioExtract:true})}}>
          <input type="radio" className="hidden" readOnly tabIndex={0} value="1" checked={this.state.audioExtract}/>
          <label>Extract/Convert Audio</label>
        </div>
      </div>
      <br/>
      <div>{this.state.audioExtract ? this.renderAudioConvert() : this.renderVideoPresets()}</div>
    </span>
  }

  handleOk(){
    this.props.delete(0,this.state.audioExtract ? [this.state.audioEncoder, this.state.audioBitrate] : this.state.preset)
  }

  render(){
    console.log(this.props.data)
    return <Modal dimmer={false} size="small" open={true}>
      <Modal.Header>Video Converter</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <div>Name: {this.props.data.initValue[1]}</div>
          <br/>
          {this.renderInputs()}
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button positive refs="ok" content="OK" onClick={this.handleOk} />
        <Button color='black' content="Cancel" onClick={_=>{this.props.delete(1)}}/>
      </Modal.Actions>
    </Modal>
  }
}
