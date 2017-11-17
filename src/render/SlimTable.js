const React = require('react')
const ReactDOM = require('react-dom')
const {Component} = React
const PubSub = require('./pubsub')
const ipc = require('electron').ipcRenderer

export default class SlimTable extends Component{
  constructor(props) {
    super(props)
    this.initBind()
    this.state = {}
  }

  initBind(){
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }


  render() {
    return  <div className="column">
      <table className="ui celled definition compact table more-slim">
        <thead className="full-width">
        <tr>
          <th>Name</th>
          <th>Registration Date</th>
          <th>E-mail address</th>
          <th>Premium Plan</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>John Lilki</td>
          <td>September 14, 2013</td>
          <td>jhlilk22@yahoo.com</td>
          <td>No</td>
        </tr>
        </tbody>
      </table>
    </div>
  }
}
