import css2xpath from './css2xpath'
import { select } from './optimal-select'


const cssSelector = element=>select(element, {
  root: document,
  priority: ['id', 'class','tag', 'value'],
  ignore: {
    attribute (name, value, defaultPredicate) {
      return !(/^(title|value|alt|label|name|class|id)$/).test(name)
    }
  }
})

function createXPathFromElement(element) {
  var allNodes = document.getElementsByTagName('*');
  for (var segs = []; element && element.nodeType == 1; element = element.parentNode) {
    if ((element.getAttribute('id') != null) && (element.getAttribute('id') !== '')) {
      var uniqueIdCount = 0;
      for (var n = 0; n < allNodes.length; n++) {
        if (((allNodes[n].getAttribute('id') != null) || (allNodes[n].getAttribute('id') !== ''))
          && allNodes[n].id == element.id)
          uniqueIdCount++;
        if (uniqueIdCount > 1)
          break;
      }

      if (uniqueIdCount == 1) {
        segs.unshift('id("' + element.getAttribute('id') + '")');
        return segs.join('/');
      }
      if (element.nodeName) {
        segs.unshift(element.nodeName.toLowerCase() + '[@id="' + element.id + '"]');
      }
    // } else if ((element.className != null) && (element.className !== '')) {
    //   segs.unshift(element.nodeName.toLowerCase() + '[@class="' + element.className.trim() + '"]');
    } else {
      for (var i = 1, sib = element.previousSibling; sib; sib = sib.previousSibling) {
        if (sib.nodeName == element.nodeName)
          i++;
      }
      segs.unshift(element.nodeName.toLowerCase() + (i == 1 ? '' : '[' + i + ']'));
    }

  }

  return segs.length ? '/' + segs.join('/') : null;
}


function getCSSPath(el, ignoreIds) {
  if (!(el instanceof Element))
    return;
  var path = [];
  while (el.nodeType === Node.ELEMENT_NODE) {
    var selector = el.nodeName.toLowerCase();
    if (el.id && !ignoreIds) {
      selector = '#' + el.id.replace( /(:|\.|\[|\]|,)/g, "\\$1" ); // extra regex for css chars in id
      path.unshift(selector);
      break;
    }
    // else if (el.className) {
    //   selector += '.' + el.className.replace( /(:|\.|\[|\]|,)/g, "\\$1" ).replace(/ /g,'.'); // extra regex for css chars in id
    // }
    else {
      var sib = el, nth = 1;
      while (sib = sib.previousElementSibling) {
        if (sib.nodeName.toLowerCase() == selector)
          nth++;
      }
      if (nth != 1)
        selector += ":nth-of-type("+nth+")";
    }
    path.unshift(selector);
    el = el.parentNode;
    if (el == null)
      return;
  }
  return path.join(" > ");
}
function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

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
    data: {
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
    const csspath = cssSelector(e.target)
    const data = {
      id: uuidv4(),
      event: 'record-op',
      optSelector: csspath,
      selector: getCSSPath(e.target),
      xpath: createXPathFromElement(e.target),
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
      timeStamp: e.timeStamp,
      inFrame: getFrameIndex(),
      url: window.location.href,
      isTrusted: e.isTrusted
    }
    if (eventName == 'select') data.selectValue = target.value
    else if (eventName == 'keyup' || eventName == 'keydown' || eventName == 'keypress'){
      data.keyCode = e.keyCode
    }
    else if (eventName == 'input' || eventName == 'change') {
      data.type = target.tagName.toLowerCase();
      if (target.tagName=='input' || target.tagName=='textarea'){
        if(target.type == 'checkbox' || target.type == 'radio')
          data.value = target.checked
        else
          data.value = target.value
      }
      else if(target.tagName == 'select'){
        data.value = target.selectedOptions
      }
      else
        data.value = target.innerText;
    }
    else if(eventName == 'mouseup'){
      data.selection = window.getSelection().toString()
    }

    console.log(data)

    chrome.runtime.sendMessage(data)
    //selectonを取る,eventをtimestampでまとめる
    //jsをinjectionする
    //frameはipc+getframeindex
    //座標特定

  }, {capture: true,passive: true});
}

for(let eventName of ['mousedown','mouseup','mouseover','mouseout','select','focusin','focusout','click','keydown','keypress','keyup','input','change','submit']){
  on(eventName)
}
