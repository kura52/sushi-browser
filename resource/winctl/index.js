'use strict';

var winctl = require('bindings')('winctl');

winctl.FindWindows = function(validateFunc) {
	return new Promise(resolve => {
		var result = [];
		winctl.EnumerateWindows(function(win) {
			if(validateFunc == null || validateFunc(win)) {
				result.push(win);
			}
			return true;
		});

		resolve(result);
	});
};

winctl.FindByTitle = function(title) {
	var pattern = new RegExp(title);

	var FindByTitlePromise = new Promise((resolve, reject) => {
		var result = null;
		winctl.EnumerateWindows(function(win) {
			var title = win.getTitle();
			if(pattern.test(title)) {
				result = win;
				return false;
			}
			return true;
		});

		if(result) {
			resolve(result);
		} else {
			reject();
		}
	});

	return FindByTitlePromise;
};

winctl.WindowStates = {
	HIDE: 0,
	SHOWNORMAL: 1,
	SHOWMINIMIZED: 2,
	MAXIMIZE: 3,
	SHOWMAXIMIZED: 3,
	SHOWNOACTIVATE: 4,
	SHOW: 5,
	MINIMIZE: 6,
	SHOWMINNOACTIVE: 7,
	SHOWNA: 8,
	RESTORE: 9,
	SHOWDEFAULT: 10,
	FORCEMINIMIZE: 11
};

winctl.AncestorFlags = {
	PARENT: 1,
	ROOT: 2,
	ROOTOWNER: 3
};

winctl.HWND = {
	NOTOPMOST: -2,
	TOPMOST: -1,
	TOP: 0,
	BOTTOM: 1
};

winctl.SWP = {
	NOSIZE: 0x0001,
	NOMOVE: 0x0002,
	NOZORDER: 0x0004,
	NOREDRAW: 0x0008,
	NOACTIVATE: 0x0010,
	DRAWFRAME: 0x0020,
	FRAMECHANGED: 0x0020,
	SHOWWINDOW: 0x0040,
	HIDEWINDOW: 0x0080,
	NOCOPYBITS: 0x0100,
	NOOWNERZORDER: 0x0200,
	NOREPOSITION: 0x0200,
	NOSENDCHANGING: 0x0400,
	DEFERERASE: 0x2000,
	ASYNCWINDOWPOS: 0x4000
};

const EventEmitter = require('events');
class WindowEventsEmitter extends EventEmitter {
	constructor() {
		super();

		this.activeWindow = winctl.GetActiveWindow();
		this.existingWindows = null;

		this.eventLoops = {
			"active-window": {
				func: this.checkActiveWindow.bind(this),
				events: ["active-window"],
				interval: 50
			},
			"window-list": {
				func: this.checkNewWindow.bind(this),
				events: ["open-window", "close-window"],
				interval: 50
			}
		};
	}

	addListener(evt, listener) {
		super.addListener(evt, listener);
		this.updatePollingLoops();
	}

	removeAllListeners(evt) {
		super.removeAllListeners(evt);
		this.updatePollingLoops();
	}

	removeListener(evt, listener) {
		super.removeListeners(evt, listener);
		this.updatePollingLoops();
	}

	updatePollingLoops() {
		Object.keys(this.eventLoops).forEach(loopName => {
			var props = this.eventLoops[loopName];

			var listenerCount = props.events.reduce((prev, curr) => prev + this.listenerCount(curr), 0);
			if(listenerCount > 0 && props.id == null) {
				props.id = setInterval(props.func, props.interval);
			} else if(listenerCount == 0 && props.id != null) {
				clearInterval(props.id);
				props.id = null;
			}
		});
	}

	checkActiveWindow() {
		var currentWindow = winctl.GetActiveWindow();
		if(currentWindow.getHwnd() != this.activeWindow.getHwnd()) {
			this.emit("active-window", currentWindow, this.activeWindow);
			this.activeWindow = currentWindow;
		}
	}

	checkNewWindow() {
		var isFirst = false;
		if(this.existingWindows == null) {
			isFirst = true;
			this.existingWindows = {};
		}

		winctl.FindWindows(win => win.isVisible() && win.getTitle()).then(windows => {
			windows.forEach(window => {
				if(this.existingWindows[window.getHwnd()] == null) {
					// New window
					this.existingWindows[window.getHwnd()] = true;
					if(!isFirst) {
						this.emit("open-window", window);
					}
				}
			});


		});
	}
}

winctl.Events = new WindowEventsEmitter();

module.exports = winctl;