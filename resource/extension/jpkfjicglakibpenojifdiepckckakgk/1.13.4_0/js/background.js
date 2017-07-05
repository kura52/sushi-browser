this.GesturesInfo = {
  name: 'Chrome Gestures',
  version: '',
  normal_actions: {
    "L": {"name": "back", args: []},
    "R": {"name": "forward", args: []},
    "UD": {"name": "reload", args: []},
    "UDU": {"name": "cacheless reload", args: []},
    "UL": {"name": "go to parent dir", args: []},
    "D": {"name": "open new tab", args: []},
    "DR": {"name": "close this tab", args: []},
    "RU": {"name": "select right tab", args: []},
    "LU": {"name": "select left tab", args: []},
    "RUR": {"name": "select last tab", args: []},
    "LUL": {"name": "select first tab", args: []},
    "#FlipBack": {"name": "back", args: []},
    "#FlipForward": {"name": "forward", args: []}
  },
  linkdrag_actions: {
    "D": {"name": "open in new tab", args: []},
    "DU": {"name": "open in background tab", args: []},
    "U": {"name": "copy url", args: []},
    "UD": {"name": "copy url and text", args: []}
  },
  textdrag_actions: {
    "DR": {"name": "search with #1 in new tab", args: ['http://www.google.com/search?q=%s', 'Google']},
    "UL": {"name": "copy text", args: []},
    "UR": {"name": "copy html", args: []}
  },
  mouse_track: true,
  visualized_arrow: true,
  superdrag: false,
  useMousewheel: false,
  useTabList: false,
  useSmoothScroll: false,
  ScrollSpeedValue: 0.2,
  useScrollAcceleration: false,
  AccelerationValue: 5,
  suppress_contextmenu: true,
  minimumUnit: 10
};
this.defaultGesturesInfo = JSON.parse(JSON.stringify(GesturesInfo));
get_manifest(function (manifest) {
  this.Manifest = manifest;
  GesturesInfo.version = defaultGesturesInfo.version = manifest.version;
  MG.update();
});
if (this.localStorage) {
  if (localStorage.GuesturesInfo) {
    localStorage.GesturesInfo = localStorage.GuesturesInfo;
    delete localStorage.GuesturesInfo;
  }
  if (localStorage.GesturesInfo) {
    GesturesInfo = JSON.parse(localStorage.GesturesInfo);
  } else {
    localStorage.GesturesInfo = JSON.stringify(GesturesInfo);
  }
}
setInterval(function () {
  if (!localStorage.GesturesInfo) {
    localStorage.GesturesInfo = JSON.stringify(GesturesInfo);
  }
}, 10 * 1000);
if (GesturesInfo.actions) {
  GesturesInfo.normal_actions = {};
  Object.keys(GesturesInfo.actions).forEach(function (key) {
    GesturesInfo.normal_actions[key] = {name: GesturesInfo.actions[key], args: []};
  });
  delete GesturesInfo.actions;
  localStorage.GesturesInfo = JSON.stringify(GesturesInfo);
}
if (!GesturesInfo.linkdrag_actions) {
  var __rename_table = {
    "go to this URL": "go to #1",
    "open this URL in new tab": "open #1 in new tab",
    "open this URL in new tab background": "open #1 in new tab background",
    "run script": "run script #1"
  };
  Object.keys(GesturesInfo.normal_actions).forEach(function (a) {
    var act = GesturesInfo.normal_actions[a];
    if (act.name && __rename_table[act.name]) {
      act.name = __rename_table[act.name];
    }
  });
  GesturesInfo.linkdrag_actions = JSON.parse(JSON.stringify(defaultGesturesInfo.linkdrag_actions));
  GesturesInfo.textdrag_actions = JSON.parse(JSON.stringify(defaultGesturesInfo.textdrag_actions));
  localStorage.GesturesInfo = JSON.stringify(GesturesInfo);
}
if (!(GesturesInfo.minimumUnit > 0)) {
  GesturesInfo.minimumUnit = 10;
}
this.MG = {
  set: function (key, act, prefix, args) {
    GesturesInfo[prefix + 'actions'][key] = {name: act, args: args || []};
    localStorage.GesturesInfo = JSON.stringify(GesturesInfo);
  },
  del: function (key, prefix) {
    delete GesturesInfo[prefix + 'actions'][key];
    localStorage.GesturesInfo = JSON.stringify(GesturesInfo);
  },
  arg_set: function (key, act, prefix) {
    if (GesturesInfo[prefix + 'actions'][key]) {
      GesturesInfo[prefix + 'actions'][key] = act;
      localStorage.GesturesInfo = JSON.stringify(GesturesInfo);
    }
  },
  update: function () {
    localStorage.GesturesInfo = JSON.stringify(GesturesInfo);
  },
  action_names: [
    {
      group: 'None',
      actions: [
        {name: "no action", args: []}
      ]
    },
    {
      group: 'Navigations',
      actions: [
        {name: "back", args: []},
        {name: "fastback", args: []},
        {name: "forward", args: []},
        {name: "go to #1", args: [
          {type: 'URL'},
          {type: 'NAME'}
        ]},
        {name: "go to parent dir", args: []}
      ]
    },
    {
      group: 'Tabs',
      actions: [
        {name: "open new tab", args: []},
        {name: "open new tab background", args: []},
        {name: "open blank tab", args: []},
        {name: "open blank tab background", args: []},
        {name: "open #1 in new tab", args: [
          {type: 'URL'},
          {type: 'NAME'}
        ]},
        {name: "open #1 in new tab background", args: [
          {type: 'URL'},
          {type: 'NAME'}
        ]},
        {name: "close this tab", args: []},
        {name: "close other tabs", args: []},
        {name: "close right tabs", args: []},
        {name: "close left tabs", args: []},
        {name: "pin this tab", args: []},
        {name: "unpin this tab", args: []},
        {name: "toggle pin tab", args: []}
      ]
    },
    {
      group: 'Links',
      actions: [
        {name: "open link in new tab", args: []},
        {name: "open link in new tab background", args: []}
      ]
    },
    {
      group: 'Windows',
      actions: [
        {name: "open new window", args: []},
        {name: "close this window", args: []}
      ]
    },
    {
      group: 'TabNavigations',
      actions: [
        {name: "select right tab", args: []},
        {name: "select left tab", args: []},
        {name: "select last tab", args: []},
        {name: "select first tab", args: []},
        {name: "re-open closed tab", args: []},
        {name: "clone tab", args: []}
      ]
    },
    {
      group: 'Scroll',
      actions: [
        {name: "scroll up", args: []},
        {name: "scroll down", args: []},
        {name: "scroll right", args: []},
        {name: "scroll left", args: []},
        {name: "scroll down half page", args: []},
        {name: "scroll up half page", args: []},
        {name: "scroll down full page", args: []},
        {name: "scroll up full page", args: []},
        {name: "scroll to top", args: []},
        {name: "scroll to bottom", args: []}
      ]
    },
    {
      group: 'Load',
      actions: [
        {name: "reload", args: []},
        {name: "cacheless reload", args: []},
        {name: "reload all tabs", args: []},
        {name: "stop", args: []}
      ]
    },
    {
      group: 'Clipboard',
      actions: [
        {name: "copy url", args: []},
        {name: "copy url and title", args: []},
        {name: "copy url and title as html", args: []},
        {
          name: "copy url and title by custom tag #1",
          args: [
            {
              type: 'custom tag',
              default_value: '<a href="%URL%" target="_blank">%TITLE%</a>'
            },
            {
              type: 'NAME',
              default_value: 'with target'
            }
          ]
        }
      ]
    },
    {
      group: 'Others',
      actions: [
        {name: "config", args: []},
        {name: "run script #1", args: [
          {type: 'JavaScript'},
          {type: 'NAME'}
        ]}
      ]
    }
  ],
  linkdrag_action_names: [
    {
      group: 'None',
      actions: [
        {name: "no action", args: []}
      ]
    },
    {
      group: 'Navigations',
      actions: [
        {name: "open in new tab", args: []},
        {name: "open in background tab", args: []},
        {name: "open in new window", args: []}
      ]
    },
    {
      group: 'Clipboard',
      actions: [
        {name: "copy text", args: []},
        {name: "copy url", args: []},
        {name: "copy url and text", args: []},
        {name: "copy url and text as html", args: []}
      ]
    }
  ],
  textdrag_action_names: [
    {
      group: 'None',
      actions: [
        {name: "no action", args: []}
      ]
    },
    {
      group: 'Search',
      actions: [
        {name: "search with #1 in new tab", args: [
          {
            type: 'URL',
            default_value: 'http://www.google.com/search?q=%s'
          },
          {
            type: 'NAME',
            default_value: 'Google'
          }
        ]},
        {name: "search with #1 in current tab", args: [
          {
            type: 'URL',
            default_value: 'http://www.google.com/search?q=%s'
          },
          {
            type: 'NAME',
            default_value: 'Google'
          }
        ]},
        {name: "search with #1 in background tab", args: [
          {
            type: 'URL',
            default_value: 'http://www.google.com/search?q=%s'
          },
          {
            type: 'NAME',
            default_value: 'Google'
          }
        ]}
      ]
    },
    {
      group: 'Clipboard',
      actions: [
        {name: "copy text", args: []},
        {name: "copy text by custom tag #1", args: [
          {
            type: 'custom tag',
            default_value: '<blockquote title="%TITLE%" cite="%URL%">\n%SELECTION-STRING%\n<a href="%URL%">%TITLE%</a>\n</blockquote>'
          },
          {
            type: 'NAME',
            default_value: 'plain blockquote'
          }
        ]
        },
        {name: "copy html", args: []},
        {name: "copy html by custom tag #1", args: [
          {
            type: 'custom tag',
            default_value: '<blockquote title="%TITLE%" cite="%URL%">\n%SELECTION-HTML%\n<a href="%URL%">%TITLE%</a>\n</blockquote>'
          },
          {
            type: 'NAME',
            default_value: 'html blockquote'
          }
        ]
        },
        {name: "copy escaped html", args: []},
        {name: "copy escaped html by custom tag #1", args: [
          {
            type: 'custom tag',
            default_value: '<blockquote title="%TITLE%" cite="%URL%">\n%SELECTION-HTML%\n<a href="%URL%">%TITLE%</a>\n</blockquote>'
          },
          {
            type: 'NAME',
            default_value: 'escaped html blockquote'
          }
        ]
        }
      ]
    }
  ]
};
MG.action_names_hash = {};
MG.linkdrag_action_names_hash = {};
MG.textdrag_action_names_hash = {};

function ActionRegister(groups, new_group) {
  var actions = MG[groups];
  if (new_group) {
    var new_actions;
    if (actions.some(function (group) {
      if (group.group === new_group.group) {
        new_actions = new_group.actions;
        new_group = group;
        return true;
      }
    })) {
      new_actions.forEach(function (new_action) {
        if (!new_group.actions.some(function (act, i, ary) {
          if (act.name === new_action.name) {
            ary[i] = new_action;
            return true;
          }
        })) {
          new_group.actions.push(new_action);
        }
      });
    } else {
      actions.push(new_group);
    }
    actions = [new_group];
  }

  actions.forEach(function (action_group, i) {
    var group = chrome.i18n.getMessage('action_group_' + action_group.group);
    if (group) action_group.label = group;
    action_group.labels = action_group.actions.map(function (act, i, actions) {
      if (!act.args) {
        act.args = [];
      }
      MG[groups + '_hash'][action_group.group + '::' + act.name] = act;
      var action = chrome.i18n.getMessage('action_name_' + act.name.replace(/\W/g, '_'));
      return (action || act.name).replace(/#1/, '...');
    });
  });
}
ActionRegister('action_names');
ActionRegister('linkdrag_action_names');
ActionRegister('textdrag_action_names');
var TabHistory = {};
var LastTabs = {};
chrome.tabs.onUpdated.addListener(function (tabid, info) {
  if (info.status === 'loading') {
    chrome.tabs.get(tabid, function (tab) {
      TabHistory[tabid] = tab;
    });
  }
});
chrome.tabs.onRemoved.addListener(function (tabid) {
  if (TabHistory[tabid]) {
    var tab = TabHistory[tabid];
    if (LastTabs[tab.windowId]) {
      LastTabs[tab.windowId].push(tab);
    } else {
      LastTabs[tab.windowId] = [tab];
    }
    delete TabHistory[tabid];
  }
});
var clipNode, clipRange;
//chrome.extension.onConnectExternal.addListener(ConnectionHandler);
//chrome.self.onConnect.addListener(ConnectionHandler);
function ConnectionHandler(port) {
  if (port.name === 'chrome_gestures') {
    port.onMessage.addListener(function (type, con) {
    });
  } else {
  }
}
chrome.extension.onMessage.addListener(RequestHandler);

function RequestHandler(message, con, sender) {
  var tab = con.tab;
  if (message.init) {
    sender({conf: GesturesInfo});
    return true;
  }
  if (message.action === 'copy') {
    clipNode.value = String(message.message).replace();
    clipNode.select();
    document.execCommand('copy', false, null);
    return true;
  }
  if (message.action === 'open_tab') {
    if (message.links && message.links.length) {
      message.links.forEach(function (link) {
        chrome.tabs.create({index: tab.index + 1, url: link, selected: !!message.foreground});
      });
    } else if (message.link) {
      chrome.tabs.create({index: tab.index + 1, url: message.link, selected: !!message.foreground});
    }
    return true;
  } else if (message.action === 'open_window') {
    chrome.windows.create({url: message.link});
    return true;
  } else if (message.action === 'goto') {
    chrome.tabs.update(tab.id, {url: message.link});
    return true;
  }
  if (message.tabid) {
    chrome.tabs.update(message.tabid, {selected: true});
    return true;
  }
  if (message === 'config') {
    chrome.tabs.create({index: tab.index + 1, url: 'options_page.html#actions'});
    return true;
  } else if (message === 'closed_tab') {
    if (LastTabs[tab.windowId]) {
      var last_tab = LastTabs[tab.windowId].pop();
      if (last_tab && last_tab.url) {
        chrome.tabs.create({windowId: last_tab.windowId, index: tab.index + 1, url: last_tab.url, selected: true});
      }
      if (!LastTabs[tab.windowId].length) {
        delete LastTabs[tab.windowId];
      }
    }
    return true;
  } else if (message.action && TabUtils.actions[message.action]) {
    TabUtils.actions[message.action](tab, message.times);
    return true;
  } else if (TabUtils.actions[message]) {
    TabUtils.actions[message](tab);
    return true;
  } else if (TabUtils.actions_with_connection[message]) {
    TabUtils.actions_with_connection[message](tab, sender);
    return true;
  }
}
function RequestExternalHandler(def, con, sender) {
  if (def.group && Array.isArray(def.actions)) {
    try {
      if (def.type === 'drag-link') {
        ActionRegister('linkdrag_action_names', def);
      } else if (def.type === 'drag-text') {
        ActionRegister('textdrag_action_names', def);
      } else {
        ActionRegister('action_names', def);
      }
      sender({status: 'success'});
    } catch (e) {
      sender({status: 'error', message: e.message});
    }
  } else {
    if (RequestHandler(def, con, sender)) return;
    sender({});
  }
}
function get_manifest(callback) {
  var url = './manifest.json';
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(JSON.parse(xhr.responseText));
  };
  xhr.open('GET', url, true);
  xhr.send(null);
}
window.addEventListener('load', function () {
  clipNode = document.createElement('textarea');
  document.body.appendChild(clipNode);
  clipRange = document.createRange();
}, false);
