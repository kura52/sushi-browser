// history.back = function(){ chrome.runtime.back() }
// history.forward = function(){ chrome.runtime.forward() }
// history.go = function(ind){ chrome.runtime.go(ind) }

;(function(elmProto){
    if (elmProto.hasOwnProperty('scrollTopMax')) {
      return;
    }
    Object.defineProperties(elmProto, {
      'scrollTopMax': {
        get: function scrollTopMax() {
          return this.scrollHeight - this.clientHeight;
        }
      },
      'scrollLeftMax': {
        get: function scrollLeftMax() {
          return this.scrollWidth - this.clientWidth;
        }
      }
    });
  }
)(Element.prototype);
