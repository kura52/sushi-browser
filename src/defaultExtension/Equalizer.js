const ipc = chrome.ipcRenderer

const EQ = [
  { label: 'master', gain: 1 },
  { label: '32', f: 32, gain: 0, type: 'lowshelf' },
  { label: '64', f: 64, gain: 0, type: 'peaking' },
  { label: '125', f: 125, gain: 0, type: 'peaking' },
  { label: '250', f: 250, gain: 0, type: 'peaking' },
  { label: '500', f: 500, gain: 0, type: 'peaking' },
  { label: '1k', f: 1000, gain: 0, type: 'peaking' },
  { label: '2k', f: 2000, gain: 0, type: 'peaking' },
  { label: '4k', f: 4000, gain: 0, type: 'peaking' },
  { label: '8k', f: 8000, gain: 0, type: 'peaking' },
  { label: '16k', f: 16000, gain: 0, type: 'highshelf' }
]

export default class Equalizer {

  constructor(stream){
    this.audioCtx = new (window.AudioContext)()
    this.filters = []
    for(const node of EQ){
      let filter = false
      if (node.f) {
        filter = this.createFilter(node.f, node.type)
      }
      else {
        window._mediaElements_ = window._mediaElements_ || new Map()
        let gainNode = window._mediaElements_.get(stream)
        if(!gainNode){
          gainNode = this.audioCtx.createGain()
          window._mediaElements_.set(stream, gainNode)
          const source = this.audioCtx.createMediaElementSource(stream)
          source.connect(gainNode)
        }
        filter = gainNode
        // filter.gain.value = 1
        filter.channelCountMode = "explicit"
      }
      this.filters.push(filter)
    }

    this.attach(stream)
  }

  createFilter(freq, type, gainValue) {
    const filter = this.audioCtx.createBiquadFilter()
    filter.type = type
    filter.gain.value = gainValue || 0
    filter.Q.value = 1
    filter.frequency.value = freq || 0
    return filter
  }

  attach(stream) {
    for(let i = 0; i < this.filters.length - 1; i++) {
      const node = this.filters[i + 1]
      this.filters[i].connect(node)
    }
    this.filters[this.filters.length - 1].connect(this.audioCtx.destination)
  }

  set(eq) {
    this.filters.slice(1).forEach((filter, i) => {
      filter.gain.value = eq[i]
    })
  }

}