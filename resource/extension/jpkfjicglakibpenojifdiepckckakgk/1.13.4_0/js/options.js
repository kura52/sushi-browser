const msg = {
  "action_group_Load": {
    "message": "Load"
  },
  "action_group_Navigations": {
    "message": "Navigations"
  },
  "action_group_None": {
    "message": "None"
  },
  "action_group_Others": {
    "message": "Others"
  },
  "action_group_Scroll": {
    "message": "Scroll"
  },
  "action_group_TabNavigations": {
    "message": "TabNavigations"
  },
  "action_group_Tabs": {
    "message": "Tabs"
  },
  "action_group_Windows": {
    "message": "Windows"
  },
  "action_name_back": {
    "message": "back"
  },
  "action_name_cacheless_reload": {
    "message": "cacheless reload"
  },
  "action_name_clone_tab": {
    "message": "clone tab"
  },
  "action_name_close_left_tabs": {
    "message": "close left tabs"
  },
  "action_name_close_other_tabs": {
    "message": "close other tabs"
  },
  "action_name_close_right_tabs": {
    "message": "close right tabs"
  },
  "action_name_close_this_tab": {
    "message": "close this tab"
  },
  "action_name_close_this_window": {
    "message": "close this window"
  },
  "action_name_config": {
    "message": "config"
  },
  "action_name_forward": {
    "message": "forward"
  },
  "action_name_go_to_parent_dir": {
    "message": "go to parent dir"
  },
  "action_name_no_action": {
    "message": "no action"
  },
  "action_name_open_blank_tab": {
    "message": "open blank tab"
  },
  "action_name_open_blank_tab_background": {
    "message": "open blank tab background"
  },
  "action_name_open_new_tab": {
    "message": "open new tab"
  },
  "action_name_open_new_tab_background": {
    "message": "open new tab background"
  },
  "action_name_open_new_window": {
    "message": "open new window"
  },
  "action_name_pin_this_tab": {
    "message": "pin this tab"
  },
  "action_name_re_open_closed_tab": {
    "message": "re-open closed tab"
  },
  "action_name_reload": {
    "message": "reload"
  },
  "action_name_reload_all_tabs": {
    "message": "reload all tabs"
  },
  "action_name_find_in_page": {
    "message": "find in page"
  },
  "action_name_quit_browser": {
    "message": "quit browser"
  },
  "action_name_restart_browser": {
    "message": "restart browser"
  },
  "action_name_scroll_down": {
    "message": "scroll down"
  },
  "action_name_scroll_down_half_page": {
    "message": "scroll down half page"
  },
  "action_name_scroll_left": {
    "message": "scroll left"
  },
  "action_name_scroll_right": {
    "message": "scroll right"
  },
  "action_name_scroll_to_bottom": {
    "message": "scroll to bottom"
  },
  "action_name_scroll_to_top": {
    "message": "scroll to top"
  },
  "action_name_scroll_up": {
    "message": "scroll up"
  },
  "action_name_scroll_up_half_page": {
    "message": "scroll up half page"
  },
  "action_name_select_first_tab": {
    "message": "select first tab"
  },
  "action_name_select_last_tab": {
    "message": "select last tab"
  },
  "action_name_select_left_tab": {
    "message": "select left tab"
  },
  "action_name_select_right_tab": {
    "message": "select right tab"
  },
  "action_name_toggle_pin_tab": {
    "message": "toggle pin tab"
  },
  "action_name_unpin_this_tab": {
    "message": "unpin this tab"
  },
  "action_name_close_left_tab": {
    "message": "close left tab"
  },
  "action_name_close_right_tab": {
    "message": "close right tab"
  },
  "action_name_move_tab_left": {
    "message": "move tab left"
  },
  "action_name_move_tab_right": {
    "message": "move tab right"
  },
  "chrome_extension_description": {
    "message": "Chrome Mouse Gestures"
  },
  "chrome_extension_name": {
    "message": "Chrome Gestures"
  }
}

// chrome.i18n = {}
// chrome.i18n.getMessage = m => msg[m] && msg[m]["message"]

window.onload = function () {
  setTimeout(__onload, 100);
};
function __onload() {
  document.addEventListener('click', function (evt) {
    var target = evt.target;
    if (target instanceof HTMLAnchorElement && target.href && target.href.indexOf('http') === 0) {
      evt.preventDefault();
      chrome.tabs.create({url: target.href});
    }
  }, false);
  BackGround = chrome.extension.getBackgroundPage();
//_ = BackGround._;
  GesturesInfo = BackGround.GesturesInfo;
  MG = BackGround.MG;
  if (this.ChromeGesture) {
    ChromeGesture.mouse_track = true;
    ChromeGesture.visualized_arrow = true;
    ChromeGesture.normal_actions = GesturesInfo.normal_actions;
    ChromeGesture.linkdrag_actions = GesturesInfo.linkdrag_actions;
    ChromeGesture.textdrag_actions = GesturesInfo.textdrag_actions;
    ChromeGesture.config = GesturesInfo;
  }
  function L10N() {
    document.querySelector('#menu_tabs > li.news').style.display = 'none';
    var labels = document.querySelectorAll('label')
    for (var i = 0; i < labels.length; i++) {
      var message = chrome.i18n.getMessage('options_' + labels[i].htmlFor);
      if (message) {
        labels[i].innerHTML = message;
      }
    }
  }

  L10N();

  var WIDTH = 800;
  var HEIGHT = Math.max(window.innerHeight - 100, 500);
  var cover = document.getElementById('cover');
  cover.addEventListener('click', function (evt) {
    if (evt.target === cover) {
      cover_close();
    }
  }, false);
  var _performAction = ChromeGesture._performAction;
  var superdrag_action = ChromeGesture.superdrag_action;

  function cover_close(callback) {
    cover.style.display = 'none';
    while (cover.firstChild) cover.removeChild(cover.firstChild);
    ChromeGesture._performAction = _performAction;
    ChromeGesture.superdrag_action = superdrag_action;
  }

  var GP = {
    "U": "↑",
    "D": "↓",
    "L": "←",
    "R": "→"
  };
  var ARROW_ICON = {
    U: 'up.png',
    R: 'right.png',
    D: 'down.png',
    L: 'left.png'
  };
  var PG = {
    "↑": "U",
    "↓": "D",
    "←": "L",
    "→": "R"
  }

  $X('//section/div/input[@type="checkbox"]').forEach(function (box) {
    var id = box.id;
    var val = GesturesInfo[id];
    if (val === true || val === false) {
      box.checked = val;
    } else {
      //return;
    }
    box.addEventListener('click', function () {
      if (box.checked) {
        GesturesInfo[id] = true;
      } else {
        GesturesInfo[id] = false;
      }
      MG.update();
    }, false);
  });
  $X('//section/div/div/input[@type="range"]').forEach(function (box) {
    var id = box.id;
    var output = document.querySelector('#' + id + '_value');
    var val = GesturesInfo[id];
    if (id === 'ScrollSpeedValue') {
      box.value = val * 10;
      output.textContent = String(val);
      update = updateFix;
    } else {
      box.value = val;
      output.textContent = box.value;
    }
    box.addEventListener('change', update, false);
    function update() {
      GesturesInfo[id] = +this.value;
      output.textContent = box.value;
      MG.update();
    }

    function updateFix() {
      GesturesInfo[id] = this.value / 10;
      output.textContent = box.value / 10;
      MG.update();
    }

    var reset = box.parentNode.parentNode.querySelector('button');
    if (reset) {
      reset.addEventListener('click', function () {
        box.value = box.placeholder;
        update.call(box);
      }, false);
    }
  });

  var useMousewheel = document.getElementById('useMousewheel');
  useMousewheel.addEventListener('click', toggleMouseSettings, false);
  function toggleMouseSettings() {
    $X('id("basics")/div[contains(@class,"Mousewheel")]//input').forEach(function (input) {
      input.disabled = !useMousewheel.checked;
    });
  }

  if (!useMousewheel.checked) {
    toggleMouseSettings();
  }

  var drag_actions = document.getElementById('drag-actions');
  var dragtab = $X('id("menu_tabs")/li[@class="drag-actions"]')[0];
  document.getElementById('superdrag').addEventListener('click', toggle_drag_conf, false);
  function toggle_drag_conf(e) {
    if (e.target.checked) {
      drag_actions.style.visibility = 'visible';
      dragtab.style.display = 'inline-block';
    } else {
      drag_actions.style.visibility = 'hidden';
      dragtab.style.display = 'none';
    }
  }

  toggle_drag_conf({target: document.getElementById('superdrag')});

  document.getElementById('ExtensionVersion').textContent = BackGround.Manifest.version;

  var ActionConfig = function (prefix, ActionNames) {
    var action_list = document.getElementById(prefix + 'action_list');
    var append_action = document.getElementById(prefix + 'append_action');
    //var action_text = document.getElementById(prefix + 'action_text');
    var actions = GesturesInfo[prefix + 'actions'];
    var ActionKeys = [];
    for (var k in actions) ActionKeys.push(k);
    var Actions = ActionKeys.sort().map(function (k) {
      var act = actions[k];
      return {key: k, name: act.name, args: act.args};
    }).map(create_action);

    function create_action(act, i) {
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.innerHTML = '<span class="lt">Gesture:</span>';
      var key = document.createElement('span');
      key.className = 'key';
      //key.textContent = act.key.split('').map(function(s){
      act.key.split('').forEach(function (s) {
        var img = document.createElement('img');
        img.src = ARROW_ICON[s];
        key.appendChild(img);
      });
      dt.appendChild(key);
      var action = document.createElement('select');
      var args_list;
      MG[ActionNames].forEach(function (group) {
        var optg = document.createElement('optgroup');
        optg.setAttribute('label', group.label || group.group);
        group.actions.forEach(function (_act, i) {
          var opt = document.createElement('option');
          opt.value = group.group + '::' + _act.name;
          opt.textContent = (group.labels && group.labels[i]) || _act.name;
          if (_act.name === act.name) {
            if (_act.args.length) {
              set_arg(_act);
            }
            opt.selected = true;
          }
          optg.appendChild(opt);
        });
        action.appendChild(optg);
      });
      function set_arg(_act) {
        args_list = document.createElement('ul');
        var args = [];
        _act.args.forEach(function (_arg, i) {
          var _i = i + 1;//, KEY = act.key;
          var _li = document.createElement('li');
          _li.innerHTML = '<span class="lt">' + _arg.type + ':</span>';
          var arg;
          if (_arg.type === 'custom tag') {
            arg = document.createElement('textarea');
          } else if (_arg.type === 'hidden') {
            arg = document.createElement('input');
            arg.type = 'hidden';
          } else {
            arg = document.createElement('input');
            arg.type = 'text';
            if (_arg.type === 'KEY') {
              arg.maxLength = 1;
            }
          }
          if (act.args[i] !== void 0) {
            arg.value = act.args[i];
          } else if (_arg.default_value !== void 0) {
            arg.value = _arg.default_value;
          }
          arg.addEventListener('change', function () {
            args[i] = arg.value;
            MG.arg_set(act.key, {name: _act.name, args: args}, prefix);
          }, false);
          arg.setAttribute('placeholder', _arg.type);
          _li.appendChild(arg);
          args_list.appendChild(_li);
          args.push(arg.value || '');
        });
        dd.insertBefore(args_list, dd.firstChild);
        return args;
      }

      function del_arg() {
        if (args_list) {
          dd.removeChild(args_list);
          args_list = null;
        }
      }

      action.addEventListener('change', function (e) {
        del_arg();
        var _act = MG[ActionNames + '_hash'][action.value], args;
        if (_act.args.length) {
          args = set_arg(_act);
        }
        act.name = action.value;
        act.label = chrome.i18n.getMessage('action_name_' + act.name.replace(/\W/g, '_'));
        MG.set(act.key, _act.name, prefix, args);
      }, false);
      var span = document.createElement('span');
      span.className = 'lt';
      span.textContent = 'Action:';
      dd.appendChild(span);
      dd.appendChild(action);
      if (act.key.indexOf('#') !== 0) {
        var del = document.createElement('button');
        del.textContent = 'Del';
        del.addEventListener('click', function () {
          action.disabled = !action.disabled;
          if (action.disabled) {
            MG.del(act.key, prefix);
            del.textContent = 'Undo';
            dt.className = 'disabled';
            dd.className = 'disabled';
          } else {
            MG.set(act.key, action.value, prefix);
            del.textContent = 'Del';
            dt.className = '';
            dd.className = '';
          }
        });
        dd.appendChild(del);
      } else {
        key.textContent = act.key.slice(1);
      }
      action_list.insertBefore(dt, act.point);
      action_list.insertBefore(dd, act.point);
      act.list = dt;
      act.dlist = dd;
      if (act.focus) {
        action.focus();
      }
      return act;
    }

    append_action.addEventListener('click', function () {
      cover.style.height = document.documentElement.clientHeight + 'px';
      cover.style.width = document.documentElement.clientWidth + 'px';
      cover.style.display = 'block';
      var h3 = document.createElement('h3');
      h3.textContent = 'Please do mouse action';
      cover.appendChild(h3);
      var action_result = document.createElement('div');
      action_result.id = 'action_result';
      cover.appendChild(action_result);
      var ok = document.createElement('button');
      ok.textContent = 'ok';
      ok.disabled = true;
      var cancel = document.createElement('button');
      cancel.textContent = 'cancel';
      cover.appendChild(ok);
      cover.appendChild(cancel);
      cancel.addEventListener('click', cover_close, false);
      var ActionResult = '';
      ok.addEventListener('click', function (evt) {
        cover_close();
        if (ActionResult) {
          actionInit(ActionResult);
        }
      });
      var dummy = document.createElement('div');
      dummy.setAttribute('style', 'margin:3em 0;');
      cover.appendChild(dummy);
      if (ActionNames.indexOf('linkdrag') === 0) {
        var a = document.createElement('a');
        a.href = "options_page.html";
        a.textContent = 'drag this link';
        dummy.appendChild(a);
      }
      if (ActionNames.indexOf('textdrag') === 0) {
        var span = document.createElement('span');
        span.textContent = 'drag this text';
        dummy.appendChild(span);
        getSelection().selectAllChildren(span);
      }
      ChromeGesture.superdrag_action = ChromeGesture._performAction = function () {
        ActionResult = this._directionChain || '';
        action_result.innerHTML = '';
        ActionResult.split('').forEach(function (s) {
          var img = document.createElement('img');
          img.src = ARROW_ICON[s];
          action_result.appendChild(img);
        });
        if (ActionResult) {
          ok.disabled = false;
        } else {
          ok.disabled = true;
        }
      };
    });
    var actionInit = function (key) {
      if (!key || /[^UDLR]/i.test(key)) {
        return;
      }
      if (ActionKeys.indexOf(key) !== -1) {
        var i = ActionKeys.indexOf(key);
        var s = Actions[i].dlist.getElementsByTagName('select')[0];
        if (s) s.focus();
        return;
      }
      ActionKeys.push(key);
      ActionKeys.sort();
      var index = ActionKeys.indexOf(key);
      var point = (Actions[index] || {}).list;
      var act = {key: key, focus: true, point: point, name: 'no action', args: []};
      Actions = Actions.slice(0, index).concat([act], Actions.slice(index));
      create_action(act, index);
      MG.set(act.key, act.name, prefix);
      //action_text.value ='';
    };
  };

  ActionConfig('normal_', 'action_names');
  ActionConfig('linkdrag_', 'linkdrag_action_names');
  ActionConfig('textdrag_', 'textdrag_action_names');

  var config_text = document.getElementById('config_text');
  var export_conf = document.getElementById('export_conf');
  export_conf.addEventListener('click', function () {
    config_text.value = JSON.stringify(GesturesInfo, null, 2);
  }, false);
  var import_conf = document.getElementById('import_conf');
  import_conf.addEventListener('click', function () {
    if (!config_text.value) {
      return;
    }
    try {
      JSON.parse(config_text.value);
    } catch (e) {
      alert('インポートに失敗しました。正しいJSONではありません。');
      return;
    }
    var conf = JSON.parse(config_text.value);
    var _config = GesturesInfo;
    try {
      if (conf.version !== BackGround.Manifest.version) {
        if (!confirm('設定がExportされた際のバージョンと現在の使用しているバージョンが異なるため、正常にインポートできない可能性があります。現在の設定をバックアップしてから続行することを推奨します。\n続行しますか?')) {
          return;
        }
      }
      GesturesInfo = conf;
      BackGround.GesturesInfo = GesturesInfo;
      MG.update();
    } catch (e) {
      alert('インポートに失敗しました。');
      BackGround.GesturesInfo = _config;
      MG.update();
      return;
    }
    alert('正常にインポートできました。新しい設定を再読み込みします。');
    location.reload();
  }, false);
  var reset_all = document.getElementById('reset_all');
  reset_all.addEventListener('click', function () {
    if (confirm('Are sure you want to delete this config? There is NO undo!')) {
      GesturesInfo = BackGround.defaultGesturesInfo;
      BackGround.GesturesInfo = GesturesInfo;
      MG.update();
      location.reload();
    }
  }, false);


  var sections = $X('//section[contains(@class, "content")]');
  var inner_container = document.getElementById('inner_container');
  var container = document.getElementById('container');
  inner_container.style.width = sections.length * (WIDTH + 20) + 'px';
//inner_container.style.height = HEIGHT + 'px';
//container.style.height = HEIGHT + 'px';
  container.style.marginTop = '-2px';
  sections.forEach(function (section, _i) {
    section.style.visibility = 'hidden';
    section.style.height = '100px';
  });
  var btns = $X('id("menu_tabs")/li/a');
  var default_title = document.title;
  btns.forEach(function (btn, i, btns) {
    btn.addEventListener('click', function (evt) {
      evt.preventDefault();
      btns.forEach(function (btn) {
        btn.className = '';
      })
      btn.className = 'active';
      sections[i].style.visibility = 'visible';
      sections[i].style.height = 'auto';
      new Tween(inner_container.style, {marginLeft: {to: i * -WIDTH, tmpl: '$#px'}, time: 0.2, onComplete: function () {
        document.title = default_title + btn.hash;
        location.hash = btn.hash;
        window.scrollBy(0, -1000);
        sections.forEach(function (section, _i) {
          if (i !== _i) {
            section.style.visibility = 'hidden';
            section.style.height = '100px';
          }
        });
      }});
    }, false);
  });
  if (location.hash) {
    sections.some(function (section, i) {
      if ('#' + section.id === location.hash) {
        btns.forEach(function (btn) {
          btn.className = '';
        })
        btns[i].className = 'active';
        inner_container.style.marginLeft = -WIDTH * i + 'px';
        section.style.visibility = 'visible';
        section.style.height = 'auto';
        document.title = default_title + location.hash;
      }
    });
  } else {
    sections[0].style.height = 'auto';
    sections[0].style.visibility = 'visible';
    document.title = default_title + '#' + sections[0].id;
  }
};
