const isMain = location.href.startsWith("file://")

const events = {}

exports.default = isMain ? require('electron') : {
  ipcRenderer: {
    on: (channel, listener) => {
      const key = channel + listener.toString()
      events[key] = (message, sender) => {
        if (!message.ipc || channel != message.channel) return

        listener({}, ...message.args)
      }
      chrome.runtime.onMessage.addListener(events[key])
    },
    once: (channel, listener) => {
      const handler = (message, sender) => {
        if (!message.ipc || channel != message.channel) return

        listener({}, ...message.args)
        chrome.runtime.onMessage.removeListener(handler)
      }
      chrome.runtime.onMessage.addListener(handler)
    },
    send: (channel, ...args) => {
      chrome.runtime.sendMessage({ipcToBg: true, channel, args})
    },
    removeListener: (channel, listener) => {
      const key = channel + listener.toString()
      chrome.runtime.onMessage.removeListener(events[key])
      delete events[key]
    }
  }
}

module.exports = exports['default'];