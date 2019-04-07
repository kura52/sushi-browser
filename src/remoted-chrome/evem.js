import {EventEmitter} from "events";

const evem = new EventEmitter()
evem.setMaxListeners(0)

export default evem