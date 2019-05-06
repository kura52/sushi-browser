const React = require('react')
const ReactDOM = require('react-dom');
const {Component} = React


export default class FloatSyncScrollButton extends Component{
  constructor(props){
    super(props)
  }

  componentDidMount() {
    this.props.wv.send('sync-button', true)
  }

  componentWillUnmount() {
    this.props.wv.send('sync-button', false)
  }


  render(){
    return null
  }
}