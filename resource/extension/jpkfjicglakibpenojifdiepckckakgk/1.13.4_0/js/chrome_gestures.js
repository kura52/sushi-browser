// Chrome Gestures
// This Script based on Gomita & Arc Cosine 's Script.
// cf:
//    http://www.xuldev.org/misc/script/MouseGestures.uc.js
//    http://github.com/ArcCosine/userscript/raw/master/simple_guestures.user.js#
// license http://0-oo.net/pryn/MIT_license.txt (The MIT license)

(function () {
  if (this.ChromeGesture) return;

  var isWin = navigator.userAgent.includes('Windows')

  var connection = {
    postMessage: function (message, response) {
      if (response) {
        chrome.extension.sendMessage(message, response);
      } else {
        chrome.extension.sendMessage(message);
      }
    }
  }
  var Root, NotRoot;
  var LOG_SEC = Math.log(1000);

  var ACTION = {
    "back": function () {
      history.back();
    },
    "fastback": function () {
      history.go(-history.length + 1);
    },
    "forward": function () {
      history.forward();
    },
    "reload": function () {
      location.reload();
    },
    "cacheless reload": function () {
      location.reload(true);
    },
    "reload all tabs": function () {
      connection.postMessage('reload_all_tabs');
    },
    "stop": function () {
      window.stop();
    },
    "go to parent dir": function () {
      if (location.hash) {
        location.href = location.pathname + (location.search ? '?' + location.search : '');
      } else {
        var paths = location.pathname.split('/');
        var path = paths.pop();
        if (!location.search && path === '') paths.pop();
        location.href = paths.join('/') + '/';
      }
    },
    "open new tab": function () {
      connection.postMessage('open_tab');
    },
    "open new tab background": function () {
      connection.postMessage('open_tab_background');
    },
    "open blank tab": function () {
      connection.postMessage('open_blank_tab');
    },
    "open blank tab background": function () {
      connection.postMessage('open_blank_tab_background');
    },
    "close this tab": function () {
      connection.postMessage('close_tab');
    },
    "open new window": function () {
      connection.postMessage('open_window');
    },
    "close this window": function () {
      connection.postMessage('close_window');
    },
    "select right tab": function () {
      connection.postMessage('right_tab');
    },
    "select left tab": function () {
      connection.postMessage('left_tab');
    },
    "select last tab": function () {
      connection.postMessage('last_tab');
    },
    "select first tab": function () {
      connection.postMessage('first_tab');
    },
    "re-open closed tab": function () {
      connection.postMessage('closed_tab');
    },
    "clone tab": function () {
      connection.postMessage('clone_tab');
    },
    "close other tabs": function () {
      connection.postMessage('close_other_tabs');
    },
    "close right tabs": function () {
      connection.postMessage('close_right_tabs');
    },
    "close left tabs": function () {
      connection.postMessage('close_left_tabs');
    },
    "pin this tab": function () {
      connection.postMessage('pin_tab');
    },
    "unpin this tab": function () {
      connection.postMessage('unpin_tab');
    },
    "toggle pin tab": function () {
      connection.postMessage('toggle_pin_tab');
    },
    "close left tab": function () {
      connection.postMessage('close_left_tab');
    },
    "close right tab": function () {
      connection.postMessage('close_right_tab');
    },
    "move tab left": function () {
      connection.postMessage('move_tab_left');
    },
    "move tab right": function () {
      connection.postMessage('move_tab_right');
    },
    "scroll down": function (config) {
      if (config.smooth_scroll) {
        SmoothScroll(0, 100, 100);
      } else {
        window.scrollBy(0, 100);
      }
    },
    "scroll up": function (config) {
      if (config.smooth_scroll) {
        SmoothScroll(0, -100, 100);
      } else {
        window.scrollBy(0, -100);
      }
    },
    "scroll right": function (config) {
      if (config.smooth_scroll) {
        SmoothScroll(50, 0, 100);
      } else {
        window.scrollBy(50, 0);
      }
    },
    "scroll left": function (config) {
      if (config.smooth_scroll) {
        SmoothScroll(-50, 0, 100);
      } else {
        window.scrollBy(-50, 0);
      }
    },
    "scroll down half page": function (config) {
      if (config.smooth_scroll) {
        SmoothScroll(0, window.innerHeight / 2);
      } else {
        window.scrollBy(0, window.innerHeight / 2);
      }
    },
    "scroll up half page": function (config) {
      if (config.smooth_scroll) {
        SmoothScroll(0, -window.innerHeight / 2);
      } else {
        window.scrollBy(0, -window.innerHeight / 2);
      }
    },
    "scroll down full page": function (config) {
      if (config.smooth_scroll) {
        SmoothScroll(0, window.innerHeight * 0.9);
      } else {
        window.scrollBy(0, window.innerHeight * 0.9);
      }
    },
    "scroll up full page": function (config) {
      if (config.smooth_scroll) {
        SmoothScroll(0, -window.innerHeight * 0.9);
      } else {
        window.scrollBy(0, -window.innerHeight * 0.9);
      }
    },
    "scroll to top": function (config) {
      if (config.smooth_scroll) {
        SmoothScroll(0, -1 * Root.scrollHeight);
      } else {
        window.scrollBy(0, -1 * Root.scrollHeight);
      }
    },
    "scroll to bottom": function (config) {
      if (config.smooth_scroll) {
        SmoothScroll(0, Root.scrollHeight);
      } else {
        window.scrollBy(0, Root.scrollHeight);
      }
    },
    "open #1 in new tab": function (arg) {
      if (arg.action && arg.action.args && arg.action.args[0]) {
        connection.postMessage({action: 'open_tab', 'link': arg.action.args[0], foreground: true});
      }
    },
    "open #1 in new tab background": function (arg) {
      if (arg.action && arg.action.args && arg.action.args[0]) {
        connection.postMessage({action: 'open_tab', 'link': arg.action.args[0]});
      }
    },
    "go to #1": function (arg) {
      if (arg.action && arg.action.args && arg.action.args[0]) {
        var url = arg.action.args[0];
        if (url.indexOf('javascript:') === 0) {
          location.href = url;
        } else {
          connection.postMessage({action: 'goto', 'link': url});
        }
      }
    },
    "copy url": function (arg) {
      connection.postMessage({action: 'copy', 'message': location.href});
    },
    "copy url and title": function (arg) {
      connection.postMessage({action: 'copy', 'message': document.title + ' ' + location.href});
    },
    "copy url and title as html": function (arg) {
      connection.postMessage({action: 'copy', 'message': '<a href="' + location.href + '">' + document.title + '</a>'});
    },
    "copy url and title by custom tag #1": function (arg) {
      if (arg.action && arg.action.args && arg.action.args[0]) {
        var format = arg.action.args[0];
        var data = {
          'URL': location.href,
          'TITLE': document.title
        };
        var message = format.replace(/%(\w+)%/g, function (_, _1) {
          return data[_1] || '';
        });
        connection.postMessage({
          action: 'copy',
          'message': message
        });
      }
    },
    "run script #1": function (arg) {
      if (arg.action && arg.action.args && arg.action.args[0]) {
        var script = arg.action.args[0];
        try {
          eval(script);
        } catch (e) {
          alert(e);
        }
      }
    },
    "find in page": function () {
      chrome.ipcRenderer.send('menu-or-key-events','findOnPage',void 0,void 0,true)
    },
    "quit browser": function () {
      chrome.ipcRenderer.send('quit-browser')
    },
    "restart browser": function () {
      chrome.ipcRenderer.send('quit-browser','restart')
    },
    "open link in new tab": function (arg) {
      var link = $X('ancestor-or-self::a', GM.target)[0] || false;
      if (link && link.href && link.href.indexOf('javascript:') !== 0) {
        connection.postMessage({action: 'open_tab', 'link': link.href, foreground: true});
      }
    },
    "open link in new tab background": function (arg) {
      var link = $X('ancestor-or-self::a', GM.target)[0] || false;
      if (link && link.href && link.href.indexOf('javascript:') !== 0) {
        connection.postMessage({action: 'open_tab', 'link': link.href});
      }
    },
    "config": function () {
      connection.postMessage('config');
    }
  };
  var LINK_ACTION = {
    "no action": function () {
    },
    "open in new tab": function (arg) {
      if (arg.target) {
        connection.postMessage({action: 'open_tab', 'link': arg.target.href, foreground: true});
      }
    },
    "open in background tab": function (arg) {
      if (arg.target) {
        connection.postMessage({action: 'open_tab', 'link': arg.target.href});
      }
    },
    "open in new window": function (arg) {
      if (arg.target) {
        connection.postMessage({action: 'open_window', 'link': arg.target.href});
      }
    },
    "copy text": function (arg) {
      if (arg.target) {
        connection.postMessage({action: 'copy', 'message': arg.target.textContent.trim()});
      }
    },
    "copy url": function (arg) {
      if (arg.target) {
        connection.postMessage({action: 'copy', 'message': arg.target.href});
      }
    },
    "copy url and text": function (arg) {
      if (arg.target) {
        connection.postMessage({action: 'copy', 'message': arg.target.textContent.trim() + ' ' + arg.target.href});
      }
    },
    "copy url and text as html": function (arg) {
      if (arg.target) {
        connection.postMessage({action: 'copy', 'message': '<a href="' + arg.target.href + '">' + arg.target.textContent.trim() + '</a>'});
      }
    }
  };
  var TEXT_ACTION = {
    "no action": function () {
    },
    "search with #1 in new tab": function (arg) {
      if (arg.action && arg.action.args && arg.action.args[0]) {
        var url = arg.action.args[0].replace('%s', encodeURIComponent(String(getSelection()).trim()));
        connection.postMessage({action: 'open_tab', 'link': url, foreground: true});
      }
    },
    "search with #1 in current tab": function (arg) {
      if (arg.action && arg.action.args && arg.action.args[0]) {
        var url = arg.action.args[0].replace('%s', String(getSelection()).trim());
        connection.postMessage({action: 'goto', 'link': url, foreground: true});
      }
    },
    "search with #1 in background tab": function (arg) {
      if (arg.action && arg.action.args && arg.action.args[0]) {
        var url = arg.action.args[0].replace('%s', String(getSelection()).trim());
        connection.postMessage({action: 'open_tab', 'link': url});
      }
    },
    "copy text": function (arg) {
      connection.postMessage({action: 'copy', 'message': String(getSelection()).trim()});
    },
    "copy text by custom tag #1": function (arg) {
      if (arg.action && arg.action.args && arg.action.args[0]) {
        var format = arg.action.args[0];
        var data = {
          'URL': location.href,
          'TITLE': document.title,
          'SELECTION-STRING': String(getSelection()),
          'SELECTION-HTML': (new XMLSerializer).serializeToString(window.getSelection().getRangeAt(0).cloneContents())
        };
        var message = format.replace(/%([-\w]+)%/g, function (_, _1) {
          return data[_1] || '';
        });
        connection.postMessage({
          action: 'copy',
          'message': message
        });
      }
    },
    "copy html": function (arg) {
      connection.postMessage({
        action: 'copy',
        'message': (new XMLSerializer).serializeToString(window.getSelection().getRangeAt(0).cloneContents())
      });
    },
    "copy html by custom tag #1": function (arg) {
      if (arg.action && arg.action.args && arg.action.args[0]) {
        var format = arg.action.args[0];
        var data = {
          'URL': location.href,
          'TITLE': document.title,
          'SELECTION-STRING': String(getSelection()),
          'SELECTION-HTML': (new XMLSerializer).serializeToString(window.getSelection().getRangeAt(0).cloneContents())
        };
        var message = format.replace(/%([-\w]+)%/g, function (_, _1) {
          return data[_1] || '';
        });
        connection.postMessage({
          action: 'copy',
          'message': message
        });
      }
    },
    "copy escaped html": function (arg) {
      connection.postMessage({
        action: 'copy',
        'message': (new XMLSerializer).serializeToString(window.getSelection().getRangeAt(0).cloneContents()).replace(/&<>/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
      });
    },
    "copy escaped html by custom tag #1": function (arg) {
      if (arg.action && arg.action.args && arg.action.args[0]) {
        var format = arg.action.args[0];
        var data = {
          'URL': location.href,
          'TITLE': document.title,
          'SELECTION-STRING': String(getSelection()),
          'SELECTION-HTML': (new XMLSerializer).serializeToString(window.getSelection().getRangeAt(0).cloneContents()).replace(/&<>/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
        };
        var message = format.replace(/%([-\w]+)%/g, function (_, _1) {
          return data[_1] || '';
        });
        connection.postMessage({
          action: 'copy',
          'message': message
        });
      }
    }
  };

  function easeOutCubic(t, b, c, d) {
    return c * ((t = t / d - 1) * t * t + 1) + b;
  }

  function easeOutQuart(t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
  }

  function SmoothScroll(_x, _y, _duration) {
    if (SmoothScroll.timer) {
      _x += SmoothScroll.X - window.pageXOffset;
      _y += SmoothScroll.Y - window.pageYOffset;
      SmoothScroll.fin();
    }
    SmoothScroll.X = _x + window.pageXOffset;
    SmoothScroll.Y = _y + window.pageYOffset;
    var from_x = window.pageXOffset;
    var from_y = window.pageYOffset;
    var duration = _duration || 400;
    var easing = easeOutQuart;
    var begin = Date.now();
    SmoothScroll.fin = function () {
      clearInterval(SmoothScroll.timer);
      SmoothScroll.timer = void 0;
    };
    SmoothScroll.timer = setInterval(scroll, 10);
    function scroll() {
      var now = Date.now();
      var time = now - begin;
      var prog_x = easing(time, from_x, _x, duration);
      var prog_y = easing(time, from_y, _y, duration);
      window.scrollTo(prog_x, prog_y);
      if (time > duration) {
        SmoothScroll.fin();
        window.scrollTo(from_x + _x, from_y + _y);
      }
    }
  }

  function SmoothScrollByElement(target) {
    this.target = target;
    this._target = target === document.documentElement ? document.body : target;
  }

  SmoothScrollByElement.noSmooth = function () {
    SmoothScrollByElement.prototype.scroll = function (_x, _y) {
      var self = this, target = this._target;
      target.scrollLeft += _x;
      target.scrollTop += _y;
    };
  };
  SmoothScrollByElement.prototype = {
    scroll: function (_x, _y, _duration) {
      var self = this, target = this.target, _target = this._target, isDown = _y > 0;
      if (self.timer >= 0) {
        _x += self.X - _target.scrollLeft;
        _y += self.Y - _target.scrollTop;
        self.fin();
      }
      var x = _target.scrollLeft;
      var y = _target.scrollTop;
      self.X = _x + x;
      self.Y = _y + y;
      var duration = _duration || 400;
      var easing = easeOutQuart;
      var begin = Date.now();
      self.fin = function () {
        clearInterval(self.timer);
        self.timer = void 0;
      };
      self.timer = setInterval(scroll, 10);
      function scroll() {
        var now = Date.now();
        var time = now - begin;
        if (time > duration || (!isDown && _target.scrollTop === 0) || (isDown && (_target.scrollTop + target.clientHeight + 16 >= target.scrollHeight))) {
          self.fin();
          _target.scrollLeft = x + _x;
          _target.scrollTop = y + _y;
          return;
        }
        var prog_x = easing(time, x, _x, duration);
        var prog_y = easing(time, y, _y, duration);
        _target.scrollLeft = prog_x;
        _target.scrollTop = prog_y;
      }
    },
    isScrollable: function (dir) {
      var self = this, target = this.target, _target = this._target;
      if (target.clientHeight <= target.scrollHeight) {
        if (dir === 'down') {
          if ((_target.scrollTop + target.clientHeight) < target.scrollHeight) {
            return true;
          }
        } else if (dir === 'up' && _target.scrollTop > 0) {
          return true;
        }
      }
      return false;
    }
  };

  var ARROW_ICON = {
    U: chrome.extension.getURL('up.png'),
    R: chrome.extension.getURL('right.png'),
    D: chrome.extension.getURL('down.png'),
    L: chrome.extension.getURL('left.png')
  };
  var FIELD_ID = 'chrome-gestures-helper-field';
  var _config
  var showContext
  var GM = {
    _lastX: 0,
    _lastY: 0,
    _directionChain: "",
    _isMousedown: false,
    _isLeftMousedown: false,
    _scroll_targets: [],
    init: function (config) {
      _config = config
      GM.config = config;
      GM.mouse_track = config.mouse_track;
      GM.normal_actions = config.normal_actions;
      GM.linkdrag_actions = config.linkdrag_actions;
      GM.textdrag_actions = config.textdrag_actions;
      GM.visualized_arrow = GM.config.visualized_arrow;
      //GM.action_config = config.actions;
      window.addEventListener("mousedown", GM, false);
      window.addEventListener("mousemove", GM, isWin ? false : {passive: true});
      window.addEventListener("mouseup", GM, false);
      if (config.superdrag) {
        window.addEventListener("dragstart", GM, false);
        window.addEventListener("drag", GM, false);
        window.addEventListener("drop", GM, false);
        window.addEventListener("dragenter", GM, false);
        window.addEventListener("dragover", GM, false);
        window.addEventListener("dragend", GM, false);
      }
      if (config.useMousewheel) {
        if (!config.useSmoothScroll) {
          SmoothScrollByElement.noSmooth();
        }
        GM.config.AccelerationValue || (GM.config.AccelerationValue = 5);
        GM.config.ScrollSpeedValue || (GM.config.ScrollSpeedValue = 0.1);
      }
      // GM.isLeft = true;
      document.addEventListener("contextmenu", GM, false);
    },
    handleEvent: function (e) {
      // console.log(e)
      switch (e.type) {
        case "mousedown":
          if(e.button === 2){
            showContext = true
            if(_config.useMousewheel){
              window.addEventListener("mousewheel", GM, {passive: true} );
            }
          }
          if (e.button === 2 && !GM._isLeftMousedown) {
            // if (window.getSelection().toString().length > 0) {
            //   return;
            // }
            GM._isMousedown = true;
            GM._startGuesture(e);
          } else if (e.button === 0 && GM._isMousedown && !GM._isMousemove) {
            GM.flip_case = '#FlipBack';
          } else if (e.button === 2 && GM._isLeftMousedown && !GM._isMousemove) {
            GM.flip_case = '#FlipForward';
          } else if (e.button === 0 && GM.isLeft && !e.target.draggable) {
            GM._isLeftMousedown = true;
            GM.notdrag = true;
            //console.log(e.target , );
            GM._startGuesture(e);
          } else if (e.button === 0) {
            GM._isLeftMousedown = true;
          }
          break;
        case "mousemove":
          if(GM._isMousedown && isWin){
            e.preventDefault();
          }
          if (!GM.isLeft && GM._isMousedown && !GM.wheel_action) {
            GM._isMousemove = true;
            GM._progressGesture(e);
          } else if (GM._isLeftMousedown && GM.notdrag) {
            GM._isMousemove = true;
            GM._progressGesture(e);
            window.getSelection().removeAllRanges();
          }
          break;
        case "dragstart":
          var link = $X('ancestor-or-self::a', e.target)[0] || false;
          GM.linkdrag = link && link.href && link.href.indexOf('javascript:') !== 0;
          GM.dragging = true;
          GM._startGuesture(e);
          break;
        case "drag":
          if (GM.dragging) {
            GM._progressGesture(e);
          }
          break;
        case "dragend":
          if (e.clientY > 0) {
            GM.superdrag_action(e);
          }
          GM.dragging = false;
          if (GM.field && GM.field.parentNode) {
            GM.field.parentNode.removeChild(GM.field);
            GM.mouse_track_start = false;
          }
          break;
        case "mouseup":
          var r;
          if(e.button === 2){
            if(_config.useMousewheel){
              window.removeEventListener("mousewheel", GM);
            }
            if (GM._isMousemove && (r = GM._stopGuesture(e))) {
              showContext = false
              e.preventDefault();
            }
            if (GM.wheel_action) {
              showContext = false
              GM.wheel_action = false;
              e.preventDefault();
              GM.title_end();
            }
          }
          if (GM._isMousedown || (GM.isLeft && GM._isLeftMousedown)) {
            if (GM.field && GM.field.parentNode) {
              GM.field.parentNode.removeChild(GM.field);
              GM.mouse_track_start = false;
            }
          }
          GM._isMousedown = GM._isMousemove = GM._isLeftMousedown = GM.notdrag = false;
          break;
        case "mousewheel":
          if (GM._isMousedown && GM.config.useTabList) {
            var dir = e.wheelDeltaY > 0 ? -1 : 1;
            if (GM.titled) {
              GM.title_change(dir);
            } else {
              connection.postMessage('get_title_list', function (message) {
                GM.title_list(message.title);
              });
            }
            GM.wheel_action = true;
            e.preventDefault();
          } else {
            var target = e.target, targets = GM._scroll_targets, scroll_object;
            var dir = e.wheelDeltaY > 0 ? 'up' : 'down';
            if (document.TEXT_NODE === target.nodeType) {
              target = target.parentElement;
            }
            do {
              if (!targets.some(function (_so) {
                if (_so.target === target) {
                  scroll_object = _so;
                  return true;
                }
              })) {
                if (target.clientHeight > 0 && (target.scrollHeight - target.clientHeight) > 16 && target !== NotRoot) {
                  var overflow = getComputedStyle(target, "").getPropertyValue("overflow");
                  if (overflow === 'scroll' || overflow === 'auto' || (target.tagName === Root.tagName && overflow !== 'hidden')) {
                    scroll_object = new SmoothScrollByElement(target);
                    targets.push(scroll_object);
                  }
                }
              }
              if (scroll_object && scroll_object.isScrollable(dir)) {
                var x = -e.wheelDeltaX, y = -e.wheelDeltaY;
                if (GM.config.useScrollAcceleration) {
                  var AccelerationValue = GM.config.AccelerationValue;
                  var prev = GM.prev_scroll_time || 0;
                  var now = GM.prev_scroll_time = Date.now();
                  var accele = (1 - Math.min(Math.log(now - prev + 1), LOG_SEC) / LOG_SEC) * AccelerationValue + 1;
                  x *= accele;
                  y *= accele;
                }
                var ax = Math.abs(x), ay = Math.abs(y);
                scroll_object.scroll(x, y, Math.log(Math.max(ax, ay)) * GM.config.ScrollSpeedValue * 100);
                e.preventDefault();
                return;
              }
            } while (target = target.parentElement);
          }
          break;
        case "contextmenu":
          if(showContext === false){
            e.preventDefault();
          }
          showContext = void 0
          break;
      }
    },
    superdrag_action: function (e) {
      var act, action;
      var link = $X('ancestor-or-self::a', e.target)[0] || false;
      if (link && link.href && link.href.indexOf('javascript:') !== 0) {
        act = GM.linkdrag_actions[GM._directionChain];
        action = act && LINK_ACTION[act.name];
      } else {
        act = GM.textdrag_actions[GM._directionChain];
        action = act && TEXT_ACTION[act.name];
      }
      if (act && !action) {
        var ev = document.createEvent('Event');
        ev.initEvent(act.name, true, false);
        var target = link || e.target;
        if (target.dispatchEvent) {
          target.dispatchEvent(ev);
        } else {
          document.dispatchEvent(ev);
        }
        return true;
      }
      if (action) {
        action({config: GM.config, key: GM._directionChain, action: act, target: link || e.target, event: e});
        return true;
      }
    },
    title_list: function (titles) {
      var title_list = document.createElement('ul');
      title_list.id = 'chrome_gestures_title_list';
      title_list.setAttribute('style', 'position:fixed;width:40%;top:30%;left:30%;background:#fff;list-style-type:none;margin:0;padding:0;display:block;');
      titles.forEach(function (title) {
        var li = document.createElement('li');
        li.textContent = title.text;
        li.setAttribute('style', 'background:#fff;border:none;margin:3px;padding:4px;display:block;font-size:12pt;');
        if (title.selected) {
          li.style.background = '-webkit-gradient(linear, left top, left bottom, from(#aaa), to(#eee))';
        }
        title_list.appendChild(li);
      });
      (document.body || document.documentElement).appendChild(title_list);
      GM.titled = true;
      GM.title_end = function () {
        GM.titled = false;
        title_list.parentNode.removeChild(title_list);
        titles.some(function (title) {
          if (title.selected) {
            connection.postMessage({tabid: title.id});
            return true;
          }
        });
      }
      GM.title_change = function (dir) {
        title_list.parentNode.removeChild(title_list);
        var index = 0;
        titles.some(function (title, i) {
          index = i;
          if (title.selected) {
            title.selected = false;
            return true;
          }
        });
        index += dir;
        if (index >= titles.length) {
          index = 0;
        } else if (index < 0) {
          index = titles.length - 1;
        }
        titles[index].selected = true;
        GM.title_list(titles);
      }
    },
    _startGuesture: function (e) {
      GM._lastX = e.clientX;
      GM._lastY = e.clientY;
      GM._directionChain = '';
      GM.target = e.target;
    },
    _progressGesture: function (e) {
      var x = e.clientX;
      var y = e.clientY;
      if (x === 0 && y === 0) {
        GM.dragging = GM._isMousedown = GM._isMousemove = false;
        if (GM.field && GM.field.parentNode) {
          GM.field.parentNode.removeChild(GM.field);
          GM.mouse_track_start = false;
        }
        return;
      }
      var dx = Math.abs(x - GM._lastX);
      var dy = Math.abs(y - GM._lastY);
      if (dx < GM.config.minimumUnit / 2 && dy < GM.config.minimumUnit / 2) return;
      if (GM.mouse_track) {
        if (!GM.mouse_track_start) {
          var field = GM.field = document.createElement("div");
          field.id = FIELD_ID;
          var style = document.createElement("style");
          style.textContent = '#' + FIELD_ID + ' *:after {display:none;}';
          field.appendChild(style);
          var SVG = 'http://www.w3.org/2000/svg';
          var svg = GM.svg = document.createElementNS(SVG, "svg");
          svg.style.position = "absolute";
          field.style.position = "fixed";
          field.addEventListener('click', function (_e) {
            GM.mouse_track_start = false;
            if (field.parentNode) field.parentNode.removeChild(field);
          }, false);
          var polyline = document.createElementNS(SVG, 'polyline');
          polyline.setAttribute('stroke', 'rgba(18,89,199,0.8)');
          polyline.setAttribute('stroke-width', '2');
          polyline.setAttribute('fill', 'none');
          GM.polyline = polyline;
          field.appendChild(svg);
          (document.body || document.documentElement).appendChild(field);
          field.style.left = "0px";
          field.style.top = "0px";
          field.style.display = 'block';
          field.style.zIndex = '1000000';
          field.style.textAlign = 'left';
          field.style.width = Root.clientWidth + 'px';
          field.style.height = Root.clientHeight + 'px';
          if (GM.visualized_arrow) {
            var pop = GM.pop = document.createElement("p");
            var label = GM.label = document.createElement("span");
            var arrows = GM.arrows = document.createElement("span");
            pop.setAttribute('style', 'display:block;background:transparent;position:absolute;top:45%;width:100%;text-align:center;min-height:4em;margin:0px;padding:0px;');
            label.setAttribute('style', 'font-size:large;font-weight:bold;color:white;display:inline-block;background:rgba(0,0,0,0.5);margin:0px;padding:10px;');
            arrows.setAttribute('style', 'display:inline-block;background:rgba(0,0,0,0.5);margin:10px;padding:10px;');
            pop.appendChild(arrows);
            pop.appendChild(document.createElement('br'));
            pop.appendChild(label);
            field.appendChild(pop);
          }
          svg.setAttribute('width', Root.clientWidth);
          svg.setAttribute('height', Root.clientHeight);
          field.style.background = 'transparent';
          field.style.border = 'none';
          GM.mouse_track_start = true;
          svg.appendChild(polyline);
        }
        GM.startX = e.clientX;
        GM.startY = e.clientY;
        var p = GM.svg.createSVGPoint();
        p.x = GM.startX;
        p.y = GM.startY;
        GM.polyline.points.appendItem(p);
      }
      if (dx < GM.config.minimumUnit && dy < GM.config.minimumUnit) return;
      var direction;
      if (dx > dy) {
        direction = x < GM._lastX ? "L" : "R";
      } else {
        direction = y < GM._lastY ? "U" : "D";
      }
      var lastDirection = GM._directionChain[GM._directionChain.length - 1];
      if (direction !== lastDirection) {
        GM._directionChain += direction;
        if (GM.mouse_track && GM.visualized_arrow) {
          var img = document.createElement('img');
          img.src = ARROW_ICON[direction];
          GM.arrows.appendChild(img);
          var act;
          if (!GM.dragging) {
            act = GM.normal_actions[GM._directionChain];
          } else {
            if (GM.linkdrag) {
              act = GM.linkdrag_actions[GM._directionChain];
            } else {
              act = GM.textdrag_actions[GM._directionChain];
            }
          }
          if (act) {
            var name = act.name, _name;
            if ((_name = chrome.i18n.getMessage('action_name_' + name.replace(/\W/g, '_')))) {
              name = _name;
            }
            GM.label.textContent = name.replace(/#(\d+)/g, function (_, _1) {
              return act.args[parseInt(_1, 10)] || '...';
            });
            GM.label.style.display = 'inline-block';
          } else {
            GM.label.style.display = 'none';
          }
        }
      }
      GM._lastX = x;
      GM._lastY = y;
    },
    _stopGuesture: function (e) {
      var isGS = GM._performAction(e);
      GM._directionChain = "";
      return isGS !== false;
    },
    _performAction: function (e) {
      if (GM.flip_case) {
        GM._directionChain = GM.flip_case;
        GM.flip_case = false;
      }
      var act = GM.normal_actions[GM._directionChain];
      var action = act && ACTION[act.name];
      if (act && !action) {
        var ev = document.createEvent('MessageEvent');
        ev.initMessageEvent(act.name, true, false, JSON.stringify(act), location.protocol + "//" + location.host, "", window);
        document.dispatchEvent(ev);
        return true;
      }
      if (action) {
        action({config: GM.config, key: GM._directionChain, action: act, event: e});
        return true;
      } else if (GM._directionChain && GM.config.suppress_contextmenu) {
        return true;
      } else {
        return false;
      }
    }
  };
// e.g. '//body[@class = "foo"]/p' -> '//prefix:body[@class = "foo"]/prefix:p'
// http://nanto.asablo.jp/blog/2008/12/11/4003371
  function addDefaultPrefix(xpath, prefix) {
    var tokenPattern = /([A-Za-z_\u00c0-\ufffd][\w\-.\u00b7-\ufffd]*|\*)\s*(::?|\()?|(".*?"|'.*?'|\d+(?:\.\d*)?|\.(?:\.|\d+)?|[\)\]])|(\/\/?|!=|[<>]=?|[\(\[|,=+-])|([@$])/g;
    var TERM = 1, OPERATOR = 2, MODIFIER = 3;
    var tokenType = OPERATOR;
    prefix += ':';
    function replacer(token, identifier, suffix, term, operator, modifier) {
      if (suffix) {
        tokenType =
          (suffix == ':' || (suffix == '::' && (identifier == 'attribute' || identifier == 'namespace')))
            ? MODIFIER : OPERATOR;
      } else if (identifier) {
        if (tokenType == OPERATOR && identifier != '*')
          token = prefix + token;
        tokenType = (tokenType == TERM) ? OPERATOR : TERM;
      } else {
        tokenType = term ? TERM : operator ? OPERATOR : MODIFIER;
      }
      return token;
    }

    return xpath.replace(tokenPattern, replacer);
  }

// $X on XHTML
// $X(exp);
// $X(exp, context);
// @target Freifox3, Chrome3, Safari4, Opera10
// @source http://gist.github.com/184276.txt
  function $X(exp, context) {
    context || (context = document);
    var _document = context.ownerDocument || document,
      documentElement = _document.documentElement;
    var isXHTML = documentElement.tagName !== 'HTML' && _document.createElement('p').tagName === 'p';
    var defaultPrefix = null;
    if (isXHTML) {
      defaultPrefix = '__default__';
      exp = addDefaultPrefix(exp, defaultPrefix);
    }
    function resolver(prefix) {
      return context.lookupNamespaceURI(prefix === defaultPrefix ? null : prefix) ||
        documentElement.namespaceURI || '';
    }

    var result = _document.evaluate(exp, context, resolver, XPathResult.ANY_TYPE, null);
    switch (result.resultType) {
      case XPathResult.STRING_TYPE :
        return result.stringValue;
      case XPathResult.NUMBER_TYPE :
        return result.numberValue;
      case XPathResult.BOOLEAN_TYPE:
        return result.booleanValue;
      case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
        // not ensure the order.
        var ret = [], i = null;
        while (i = result.iterateNext()) ret.push(i);
        return ret;
    }
    return null;
  }

  connection.postMessage({init: true, location: location}, function (message) {
    if(message && message.disable == 'true') return

    if (/BackCompat/i.test(document.compatMode)) {
      var body_check = function () {
        Root = document.body;
        if (!Root) {
          setTimeout(body_check, 100);
        }
      };
      body_check();
    } else {
      NotRoot = document.body;
      Root = document.documentElement;
    }
    GM.init(message.conf);
  });
  this.ChromeGesture = GM;
}).call(window);
