(function(){
  let starting
  const _targetSelector = ()=>{
    if(starting) return

    if(location.href != 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/automation.html') {
      function TargetSelector(callback, cleanupCallback) {
        this.callback = callback;
        this.cleanupCallback = cleanupCallback;

        // This is for XPCOM/XUL addon and can't be used
        //var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
        //this.win = wm.getMostRecentWindow('navigator:browser').getBrowser().contentWindow;

        // Instead, we simply assign global content window to this.win
        this.win = window;
        var doc = this.win.document;
        if(!doc.body) return
        starting = true
        var div = doc.createElement("div");
        div.setAttribute("style", "display: none;");
        doc.body.insertBefore(div, doc.body.firstChild);
        this.div = div;

        var span = doc.createElement("span");
        div.setAttribute("style", "display: none;");
        div.appendChild(span)
        this.span = span;

        this.e = null;
        this.r = null;
        doc.addEventListener("mousemove", this, true);
        doc.addEventListener("click", this, true);
      }

      TargetSelector.prototype.cleanup = function () {
        try {
          if (this.div) {
            if (this.div.parentNode) {
              this.div.parentNode.removeChild(this.div);
            }
            this.div = null;
            this.span = null;
          }
          if (this.win) {
            var doc = this.win.document;
            doc.removeEventListener("mousemove", this, true);
            doc.removeEventListener("click", this, true);
          }
        } catch (e) {
          if (e != "TypeError: can't access dead object") {
            throw e;
          }
        }
        this.win = null;
        if (this.cleanupCallback) {
          this.cleanupCallback();
        }
      };

      TargetSelector.prototype.handleEvent = function (evt) {
        switch (evt.type) {
          case "mousemove":
            this.highlight(evt.target.ownerDocument, evt.clientX, evt.clientY);
        }
      };

      TargetSelector.prototype.highlight = function (doc, x, y) {
        if (doc) {
          var e = doc.elementFromPoint(x, y);
          if (e && e != this.e) {
            this.highlightElement(e);
          }
        }
      };

      TargetSelector.prototype.highlightElement = function (element) {
        if (element && element != this.e) {
          this.e = element;
        } else {
          return;
        }
        var r = element.getBoundingClientRect();
        var or = this.r;
        if (r.left >= 0 && r.top >= 0 && r.width > 0 && r.height > 0) {
          if (or && r.top == or.top && r.left == or.left && r.width == or.width && r.height == or.height) {
            return;
          }
          this.r = r;
          var style = "pointer-events: none; position: absolute; background-color: rgba(128, 194, 250, 0.2); z-index: 10000;";
          var pos = "top:" + (r.top + this.win.scrollY) + "px; left:" + (r.left + this.win.scrollX) + "px; width:" + r.width + "px; height:" + r.height + "px;";
          this.div.setAttribute("style", style + pos);
          this.span.setAttribute("style", "line-height: 1.4285em;font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;width:max-content;font-size:14px;position: absolute;margin:0;margin-top: -23px;background-color: #f6f8fa;border: 1px solid #e1e4e8;padding: 1px 3px;border-top-left-radius: 4px;border-top-right-radius: 4px;")

          var name = `${element.tagName.toLowerCase()}${element.id ? `#${element.id.toLowerCase()}` : ''}${element.className ? `.${element.className.replace(/ +/g,'.').toLowerCase()}` : ''}`
          this.span.innerHTML = `<b>${name}</b>  ${Math.round(r.width*100)/100}x${Math.round(r.height*100)/100}`
        } else if (or) {
          this.div.setAttribute("style", "display: none;");
          this.span.setAttribute("style", "display: none;");
        }
      };

      window.__targetSelector2__ = new TargetSelector((element, win) => {}, _ => {});
    }
  }
  _targetSelector()
  document.addEventListener("DOMContentLoaded",_targetSelector)
}())

