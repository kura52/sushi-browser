const isMain = location.href.startsWith("file://")

exports.default = isMain ? require('electron') : {
  ipcRenderer: {
    on: (channel, listener) => {
      chrome.runtime.onMessage.addListener((message, sender) => {
        if (!message.ipc || channel != message.channel) return

        listener({}, ...message.args)
      })
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
    }
  }
}

module.exports = exports['default'];