import {EventEmitter} from "events";

const evem = new EventEmitter()
evem.setMaxListeners(0)
let eventQueue = []

evem.queueEmit = function(event, ...args){
  if(this.listenerCount(event[0]))
    this.emit(event, ...args)
  else
    eventQueue.push([event, args, 0])
}

evem.startEventObserve = function(){
  setInterval(()=>{
    const rest = []
    for(const event of eventQueue){
      if(this.listenerCount(event[0])){
        this.emit(event[0], ...event[1])
      }
      else{
        event[2] += 1
        if(event[2] < 100){
          rest.push(event)
        }
      }
    }
    eventQueue = rest
  },40)
}

evem.startEventObserve()

export default evem