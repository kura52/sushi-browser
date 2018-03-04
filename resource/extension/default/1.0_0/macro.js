function getFrameIndex() {
  if (window.top === window.self)
    return 0;
  for (var i=0; i<window.top.frames.length; i++) {
    if (window.top.frames[i] === window.self) {
      return i+1;
    }
  }

  return -1;
}

/* Start Scroll */
let scrollTimer,scrollObject,scrollStartTime,scrollStartTop,scrollStartLeft
function finishScrollEvent() {
  scrollObject = document.body; // temp fix

  chrome.runtime.sendMessage({
    action: "addEvent",
    evt: "scroll",
    evt_data: {
      bubbles: false, // TODO: Investigate
      cancelable: false, // TODO: Investigate
      scrollTopStart: scrollStartTop,
      scrollTopEnd: scrollObject.scrollTop,
      scrollLeftStart: scrollStartLeft,
      scrollLeftEnd: scrollObject.scrollLeft,
      inFrame: getFrameIndex(),
      url: window.location.href,
      scrollTime: Date.now()-scrollStartTime,
      endtime: Date.now()
    },
    time: scrollStartTime
  });

  scrollObject = null;
  scrollStartTop = null; // not necessary
  scrollStartLeft = null; // not necessary
}

function updateScrollEvent(e) {
  // Designed to support multiple element scrolling event listeners

  var scrollTimeMillis = 100;

  if (scrollObject == null) {
    scrollStartTime = Date.now();
    scrollObject = document.body; // e.target; temp removed
    scrollStartTop = scrollObject.scrollTop;
    scrollStartLeft = scrollObject.scrollLeft;
    scrollTimer = setTimeout(finishScrollEvent, scrollTimeMillis);
  } else {//} if (scrollObject == e.target) {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(finishScrollEvent, scrollTimeMillis);
  } // in theory, 2x concurrent scrolling, should be impossible but isn't
}

function onScroll(){
  window.addEventListener("scroll", function (e) {
    setTimeout(function () {
      chrome.storage.local.get('recording', function (isRecording) {
        if (isRecording.recording) {
          updateScrollEvent(e);
        }
      });
    }, 1);
  }, false)
}

function on(eventName) {
  window.addEventListener(eventName, function (e) {
    const target = e.target
    const evt_data = {
      path: processPath(e.path),
      csspath: getCSSPath(e.target, false),
      csspathfull: getCSSPath(e.target, true),
      clientX: e.clientX,
      clientY: e.clientY,
      altKey: e.altKey,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      metaKey: e.metaKey,
      button: e.button,
      bubbles: e.bubbles,
      cancelable: e.cancelable,
      innerText: e.target.innerText || '',
      inFrame: getFrameIndex(),
      url: window.location.href,
      isTrusted: e.isTrusted
    }
    if (eventName == 'select') evt_data['selectValue'] = target.value
    else if (eventName == 'keyup' || eventName == 'keydown' || eventName == 'keypress'){
      evt_data['keyCode'] = e.keyCode
    }
    else if (eventName == 'input' || eventName == 'change') {
      evt_data['type'] = target.tagName.toLowerCase();
      if (target.tagName=='input' || target.tagName=='textarea'){
        if(target.type == 'checkbox' || target.type == 'radio')
          evt_data['value'] = target.checked
        else
          evt_data['value'] = target.value
      }
      else if(target.tagName == 'select'){
        evt_data['value'] = target.checked
      }
      else
        evt_data['value'] = target.innerText;
    }

    //selectonを取る,eventをtimestampでまとめる
    //jsをinjectionする
  }, {capture: true,passive: true});
}

// dragstart
// dragenter
// dragover
// dragleave
// drag
// drop
// dragend
// mousedown
// mouseup
// mouseover
// mouseout
// select
// focusin
// focusout
// click
// keydown
// keypress
// keyup
// input
// change
// submit
// scroll