window.debug = require('debug')('info')
import process from './process'
const ipc = require('electron').ipcRenderer
const path = require('path')
const React = require('react')
const ReactDOM = require('react-dom')

class Sync extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount(){
    this.auth().then(_=>_)
  }

  async auth(){
    console.log(3)
    try{
      const result = await firebase.auth().getRedirectResult()
      if(!result.user){
        const provider = new firebase.auth.GoogleAuthProvider()
        firebase.auth().signInWithRedirect(provider)
      }
      const credential = result.credential;
      console.log(credential)

      fetch("/sync",
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: "POST",
          body: JSON.stringify(credential)
        }).then(function(res){
          console.log(res)
        })
        .catch(function(res){
          console.log(res)
        })

        return result
    }catch(error){
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      const credential = error.credential;
      console.log(error)
    }
  }

  render(){
    return <div>
      Login Processing...
      {/*<button onClick={_=>{*/}
        {/*console.log(4)*/}
        {/*const provider = new firebase.auth.GoogleAuthProvider()*/}
        {/*firebase.auth().signInWithRedirect(provider)*/}
      {/*}}>login</button>*/}
    </div>
  }

}

const App = () => (
    <Sync/>
)


ReactDOM.render(<App />,  document.getElementById('app'))