const {Event} = require('./event')
const {ipcFuncRenderer} = require('./util')

class Idle {
  constructor () {
    this._intervalInSeconds = 60

    this.onStateChanged = new Event(()=>{
      ipcFuncRenderer('idle','querySystemIdleState', idleState => {
        let prevState = idleState
        this.intervalFunc = () => {
          ipcFuncRenderer('idle','querySystemIdleState', idleState => {
            if(prevState != idleState){
              this.onStateChanged.emit(idleState)
              prevState = idleState
            }
          } ,5)
        }
        this.intervalId = setInterval(this.intervalFunc, this._intervalInSeconds)
      }, 5)
    })

    for(let name of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) this[name] = name == 'constructor' ? this[name] : this[name].bind(this)

  }

  queryState(detectionIntervalInSeconds, callback){
    ipcFuncRenderer('idle','querySystemIdleState', idleState => {
      callback(idleState == 'unknown' ? 'active' : idleState)
    }, 5)
  }

  setDetectionInterval(intervalInSeconds){
    this._intervalInSeconds = intervalInSeconds
    clearInterval(this.intervalId)
    setInterval(this.intervalFunc, this._intervalInSeconds)
  }
}

exports.setup = (...args) => {
  return new Idle(...args)
}