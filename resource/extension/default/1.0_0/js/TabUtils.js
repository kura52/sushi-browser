chrome.ipcRenderer = new Proxy({}, {
  get: (target, name) => {
    if(window.ipcRenderer && window.ipcRenderer.port) return window.ipcRenderer[name]
    return (...args) => {
      const id = setInterval(()=>{
        if(window.ipcRenderer && window.ipcRenderer.port){
          window.ipcRenderer[name](...args)
          clearInterval(id)
        }
      },10)
    }
  }
})

const ipc = chrome.ipcRenderer

this.TabUtils = this.TabUtils || {};
var topURL = 'chrome://newtab/'
var blankURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/blank.html'
TabUtils.actions = {
  open_tab: function (tab) {
    chrome.tabs.create({
      index: tab.index + 1,
      url: topURL,
      selected: true
    });
  },
  open_tab_background: function (tab) {
    chrome.tabs.create({
      index: tab.index + 1,
      url: topURL,
      selected: false
    });
  },
  open_tab_last: function (tab) {
    chrome.tabs.create({
      url: topURL,
      selected: true
    });
  },
  open_tab_last_background: function (tab) {
    chrome.tabs.create({
      url: topURL,
      selected: false
    });
  },
  open_blank_tab: function (tab) {
    chrome.tabs.create({
      index: tab.index + 1,
      url: blankURL,
      selected: true
    });
  },
  open_blank_tab_last: function (tab) {
    chrome.tabs.create({
      url: blankURL,
      selected: true
    });
  },
  open_blank_tab_background: function (tab) {
    chrome.tabs.create({
      index: tab.index + 1,
      url: blankURL,
      selected: false
    });
  },
  close_tab: function (tab) {
    if (!tab.pinned) {
      const key = Math.random().toString()
      ipc.send("get-main-state",key,['protectTabs'])
      ipc.once(`get-main-state-reply_${key}`,(e,data)=> {
        if(!data.protectTabs[tab.id]){
          chrome.tabs.remove(tab.id)
        }
      })
    }
  },
  force_close_tab: function (tab) {
    chrome.tabs.remove(tab.id);
  },
  open_window: function (tab) {
    chrome.windows.create({url: topURL});
  },
  open_blank_window: function (tab) {
    chrome.windows.create({url: blankURL});
  },
  close_window: function (tab) {
    chrome.windows.remove(tab.windowId);
  },
  right_tab: function (tab, count) {
    if (!count) count = 1;
    chrome.tabs.getAllInWindow(tab.windowId, function (tabs) {
      tabs.forEach(function (_t, i) {
        console.log(_t)
        if (_t.id === tab.id) {
          var newtab = tabs[(i + count) % tabs.length] || tabs[0];
          if (newtab) {
            chrome.tabs.update(newtab.id, {selected: true});
          }
        }
      });
    });
  },
  left_tab: function (tab, count) {
    if (!count) count = 1;
    chrome.tabs.getAllInWindow(tab.windowId, function (tabs) {
      tabs.forEach(function (_t, i) {
        if (_t.id === tab.id) {
          var newtab = tabs[(i - count) % tabs.length] || tabs[tabs.length - 1];
          if (newtab) {
            chrome.tabs.update(newtab.id, {selected: true});
          }
        }
      });
    });
  },
  last_tab: function (tab) {
    chrome.tabs.getAllInWindow(tab.windowId, function (tabs) {
      tabs.forEach(function (_t, i) {
        if (_t.id === tab.id) {
          var newtab = tabs[tabs.length - 1];
          if (newtab) {
            chrome.tabs.update(newtab.id, {selected: true});
          }
        }
      });
    });
  },
  first_tab: function (tab) {
    chrome.tabs.getAllInWindow(tab.windowId, function (tabs) {
      tabs.forEach(function (_t, i) {
        if (_t.id === tab.id) {
          var newtab = tabs[0];
          if (newtab) {
            chrome.tabs.update(newtab.id, {selected: true});
          }
        }
      });
    });
  },
  close_other_tabs: function (tab) {

    const key = Math.random().toString()
    ipc.send("get-main-state",key,['protectTabs'])
    ipc.once(`get-main-state-reply_${key}`,(e,data)=> {
      chrome.tabs.getAllInWindow(tab.windowId, function (tabs) {
        tabs.forEach(function (_t, i) {
          if (_t.id !== tab.id && !_t.pinned && !data.protectTabs[_t.id]) {
            chrome.tabs.remove(_t.id);
          }
        });
      });
    })
  },
  close_right_tabs: function (tab) {
    ipc.send("get-main-state",key,['protectTabs'])
    ipc.once(`get-main-state-reply_${key}`,(e,data)=> {
      chrome.tabs.getAllInWindow(tab.windowId, function (tabs) {
        tabs.reverse().some(function (_t, i) {
          if (_t.id !== tab.id && !_t.pinned && !data.protectTabs[_t.id]) {
            chrome.tabs.remove(_t.id);
          } else {
            return true;
          }
        });
      });
    })
  },
  close_left_tabs: function (tab) {
    ipc.send("get-main-state",key,['protectTabs'])
    ipc.once(`get-main-state-reply_${key}`,(e,data)=> {
      chrome.tabs.getAllInWindow(tab.windowId, function (tabs) {
        tabs.some(function (_t, i) {
          if (_t.id !== tab.id && !_t.pinned && !data.protectTabs[_t.id]) {
            chrome.tabs.remove(_t.id);
          } else {
            return true;
          }
        });
      });
    })
  },
  clone_tab: function (tab) {
    chrome.tabs.create({
      windowId: tab.windowId,
      index: tab.index + 1,
      url: tab.url,
      selected: true
    });
  },
  reload_all_tabs: function (tab) {
    chrome.tabs.getAllInWindow(tab.windowId, function (tabs) {
      tabs.forEach(function (tab) {
        if (chrome.tabs.executeScript && tab.url.indexOf('http://') === 0) {
          var exec = chrome.tabs.executeScript(tab.id, {code: 'location.reload();'});
          if (!exec) {
            chrome.tabs.update(tab.id, {url: tab.url});
          }
          return;
        }
        chrome.tabs.update(tab.id, {url: tab.url});
      });
    });
  },
  pin_tab: function (tab) {
    chrome.tabs.update({pinned: true});
  },
  unpin_tab: function (tab) {
    chrome.tabs.update({pinned: false});
  },
  toggle_pin_tab: function (tab) {
    chrome.tabs.update({pinned: !tab.pinned});
  },
  close_left_tab: function (tab) {
    ipc.send("get-main-state",key,['protectTabs'])
    ipc.once(`get-main-state-reply_${key}`,(e,data)=> {
      chrome.tabs.query({index: tab.index - 1}, tabs => {
        if(!data.protectTabs[tabs[0].id]) chrome.tabs.remove(tabs[0].id)
      })
    })
  },
  close_right_tab: function (tab) {
    ipc.send("get-main-state",key,['protectTabs'])
    ipc.once(`get-main-state-reply_${key}`,(e,data)=> {
      chrome.tabs.query({index:tab.index+1}, tabs=>{
        if(!data.protectTabs[tabs[0].id]) chrome.tabs.remove(tabs[0].id)
      })
    })
  },
  move_tab_left: function (tab) {
    chrome.tabs.move(tab.id,{index:tab.index-1})
  },
  move_tab_right: function (tab) {
    chrome.tabs.move(tab.id,{index:tab.index+1})
  }
};
TabUtils.actions_with_connection = {
  get_title_list: function (tab, sendResponse) {
    chrome.tabs.getAllInWindow(null, function (tabs) {
      sendResponse({
        title: tabs.map(function (_tab) {
          return {
            text: _tab.title,
            selected: tab.id === _tab.id,
            id: _tab.id,
            favicon: tab.favIconUrl
          };
        })
      });
    });
  }
};
