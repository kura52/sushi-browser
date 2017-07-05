PKT_EXT     	= PKT_EXT || {};
PKT_EXT.UTIL    = (function() {


	// Utility functions
	var isValidURL = function(s) {
		return (/^https?\:/i).test(s);
	}
	var isMac = function() {
	    return navigator.platform.match(/^Mac/) !== null;
	}
	var isSafari = function() {
		return window.safari !== undefined;
	}

	var isLocal = function() {
		return document.location.hostname == "localhost";
	}

	function isEdge() {
		return (/Edge\/\d+/).test(window.navigator.userAgent);
	}

	// As Opera is running now on Chromium, we have to test in Chrome that
	// we are not running Opera as the only difference between Opera and Chrome
	// is the OPR in the userAgent
	var isOpera = function() {
		return (/OPR/).test(window.navigator.userAgent);
	}

	// As the Yandex browser is running Chromium in the backed, we have to test
	// in Chrome that we are not running on Yandex as the only difference between
	// Yandex and Chrome is the YaBrowser in the userAgent
	var isYandex = function() {
		return (/YaBrowser/).test(window.navigator.userAgent);
	}

	// Test if the underlying rendering engine is Chrome / Chromium. That's the case
	// for Chrome, Opera and Yandex
	var isChrome = function() {
		return (window.chrome !== undefined && window.chrome.app !== undefined);
	}

	// Test if it's chrome only and not opera or yandex
	var isChromeOnly = function() {
		return (window.chrome !== undefined && window.chrome.app !== undefined &&
				!isOpera() && !isYandex());
	}

	// User
	var getDisplayName = function() {
		var firstName = getSetting("firstName");
		var lastName = getSetting("lastName");

		var displayName = "";
		if (typeof firstName !== 'undefined' && firstName !== "") {
			displayName += firstName;
		}

		if (typeof lastName !== 'undefined' && lastName !== "") {
			displayName += (displayName !== "" ? " " + lastName : lastName);
		}

		if (displayName !== "") {
			return displayName;
		}

		return getDisplayUsername();
	}
	var getDisplayUsername = function() {
		var username = getSetting("username");
		if (typeof username !== "undefined" && username.length > 0 && username.charAt(0) !== "*") {
			return username;
		}

		var email = getSetting("email");
		if (typeof email !== "undefined" && email !== "") {
			return email;
		}

		return "Pocket User";
	}

	// Incognito/private
	var inPrivateMode = function(tab) {
		if (isChrome()) {
			return tab.incognito;
		}
		else if (isSafari()) {
			return safari.application.privateBrowsing.enabled;
		}
	}

	// Localization
	/**
	 * Supported Language Code
	 * @return {string} Supported language code
	 */
	var getCurrentLanguageCode = function() {
	    var language = navigator.language;
	    language = (typeof language !== "undefined" ? language.toLowerCase() : 'en');

	    if (language.indexOf('en') === 0) return 'en'; // English
	    if (language.indexOf('de') === 0) return 'de'; // German
	    if (language.indexOf('fr') === 0) return 'fr'; // French
	    if (language.indexOf('it') === 0) return 'it'; // Italian
	    if (language.indexOf('es_419') === 0) return 'es_419'; // Spanish (Latin America and Caribbean)
	    if (language.indexOf('es') === 0) return 'es'; // Spanish
	    if (language.indexOf('ja') === 0) return 'ja'; // Japanese
	    if (language.indexOf('ru') === 0) return 'ru'; // Russian
	    if (language.indexOf('ko') === 0) return 'ko'; // Korean
	    if (language.indexOf('nl') === 0) return 'nl'; // Dutch
	    if (language.indexOf('pl') === 0) return 'pl'; // Polish
	    if (language.indexOf('pt_BR') === 0) return 'pt_BR'; // Portuguese Brazil
	    if (language.indexOf('pt_PT') === 0) return 'pt_PT'; // Portuguese Portugal
	    if (language.indexOf('zh_CN') === 0) return 'zh_CN'; // Chinese Simplified
	    if (language.indexOf('zh_TW') === 0) return 'zh_TW'; // Chinese Traditional
	    return 'en'; // Default is English
	};

	// Abstract browser specific funtionality
	var getBackgroundPage = function() {
		var backgroundPage = isChrome() ? chrome.extension.getBackgroundPage()
										: safari.extension.globalPage.contentWindow;
		return backgroundPage;
	}
	var getCurrentTab = function(cb) {
		if (isChrome()) {
			chrome.tabs.getSelected(null, function (tab) {
				cb(tab);
			});
		} else if (isSafari()) {
			var tab = safari.application.activeBrowserWindow.activeTab;
			cb(tab);
		}
	}
	var getAllTabs = function(cb) {
		if (isChrome()) {
			chrome.tabs.query({}, cb);
		}
		else if (isSafari()) {
			var windows = safari.application.browserWindows;
			var tabs = [];
			for (var windowIdx = 0; windowIdx < windows.length; windowIdx++) {
				var windowTabs = windows[windowIdx].tabs;
				for (var tabIdx = 0; tabIdx < windowTabs.length; tabIdx++) {
					tabs.push(windowTabs[tabIdx]);
				}
			}

			cb(tabs);
		}
		else {
			cb([]);
		}
	}
	var executeScriptInTab = function(tab, script){
		if (isChrome()) {
			chrome.tabs.executeScript(tab.id, {code: script});
		}
		else if (isSafari()) {
			if (!tab || !tab.page || !tab.page.dispatchMessage) { return; }
			tab.page.dispatchMessage("executeScript", script);
		}
	}
	var executeScriptInTabWithCallback = function(tab, script, callback) {
		if (isChrome()) {
			chrome.tabs.executeScript(tab.id, {code: script}, callback);
		}
		else if (isSafari()) {
			// TODO: Find a better way to execute script in tab with callback
			// as exectureScriptInTab is asynchron without any callback
			executeScriptInTab(tab, script);
			setTimeout(callback, 100);
		}
	}
	var executeScriptFromURLInTab = function(tab, scriptURL) {
		if (isChrome()) {
			chrome.tabs.executeScript(tab.id, {file: scriptURL});
		}
		else if (isSafari()) {
			var script = $.ajax({
				type: "GET",
				url: "../" + scriptURL,
				async: false
			});
			executeScriptInTab(tab, script.responseText);
		}
	}
	var executeScriptFromURLInTabWithCallback = function(tab, scriptURL, callback) {
		if (isChrome()) {
			chrome.tabs.executeScript(tab.id, {file: scriptURL}, callback);
		}
		else if (isSafari()) {
			var script = $.ajax({
				type: "GET",
				url: "../" + scriptURL,
				async: false
			});

			executeScriptInTabWithCallback(tab, script.responseText, callback);
		}
	}
	var executeStyleFromURLInTab = function(tab, scriptURL) {
		if (!isSafari()) {
			chrome.tabs.insertCSS(tab.id, {file: scriptURL});
		}
		else {
			safari.extension.addContentStyleSheetFromURL(scriptURL,['*'],[]);
		}
	}
	var broadcastMessageToAllTabs = function(msg) {
	    getAllTabs(function(tabs) {
			for (var i = 0; i < tabs.length; i++) {
				var tab = tabs[i];
				sendMessageToTab(tab, msg);
			}
	    });
	}
	var injectScript = function(func) {
	    var actualCode = '(' + func + ')();';

	    var script = document.createElement('script');
	    script.textContent = actualCode;
	    (document.head || document.documentElement).appendChild(script);
	    script.parentNode.removeChild(script);
	}
	var openTabWithURL = function(url, inBackground) {
		// Be sure we have a value for background
		if (typeof inBackground === 'undefined') { inBackground = false; }

		if (isChrome()) {
			chrome.tabs.create({url: url, active: !inBackground});
			return;
		}

		// In Safari only usable within the background.js. In content script
		// send a "openTab" message to the background script
		if (isSafari()) {
			var background = inBackground ? "background" : "";
			var tab = safari.application.activeBrowserWindow.openTab(background);
			tab.url = url;
		}
	}


	// Settings
	// Helper methods because localStorage can't save bools -.-
	var stringFromBool = function(bl) {
		if (bl === false) return "false";
		else return "true";
	}
	var boolFromString = function(str) {
		if (typeof str === "string") {
			if (str === "false") { return false; }
			return true;
		}

		// If the expected str is already a bool just return the bool
		// E.g. Safari settings returns bool
		return str;
	}
	var getSetting = function(key) {
		return settingContainerForKey(key)[key];
	}
	var setSetting = function(key, value) {
		var location = settingContainerForKey(key);
		if (!value && location == localStorage) {
			localStorage.removeItem(key);
		} else {
			location[key] = value;
		}
	}
	var settingContainerForKey = function(key) {
		if (isSafari()) {
			var supportedServices = ["twitter", "hackernews", "reddit", "yahoo", "linkedin", "keyboard-shortcut-add", "keyboard-shortcut"];
			var location;
			if (supportedServices.indexOf(key) !== -1) {
				location = safari.extension.settings;
			} else if (key === "username" || key === "password") {
				location = safari.extension.secureSettings;
			} else {
				location = localStorage;
			}
			return location;
		}

		return localStorage;
	}


	// Message Handling
	var addMessageListener = function(handler) {
		if (isChrome()) {
			if (window.chrome.extension.onMessage) {
				chrome.extension.onMessage.addListener(handler);
				return;
			}

			chrome.extension.onRequest.addListener(handler);
		}
		else if (isSafari()) {
			var listenable;

			if (safari.self && safari.self.addEventListener) {
				// Listenable is from an injected script
				listenable = safari.self;
			}
			else if (safari.application && safari.application.addEventListener) {
				// Listenable is from the a global html
				listenable = safari.application;
			}

			if (!listenable) { return; }

			listenable.addEventListener("message", function (message) {
				message.tab = message.target;
				var cb;

				if (message.message.__cbId) {
					var tab = message.tab;
					var cbId = message.message.__cbId;
					cb = function(data) {
						if (tab && tab.page && tab.page.dispatchMessage) {
							tab.page.dispatchMessage("__performCb", {
								cbId: cbId,
								data: data
							});
						}
					};
					message.__cbId = undefined;
				}

				handler(message.message, message, cb);
			}, false);
		}
	}

	// Message from the global page to a specific tab
	var sendMessageToTab = function(tab, message) {
		if (isChrome()) {
	        chrome.tabs.sendMessage(tab.id, message);
		}
		else if (isSafari()) {
			if (!tab || !tab.page || !tab.page.dispatchMessage) { return; }
			tab.page.dispatchMessage("message", message);
		}
	}

	// Message from an injected script to the background
	var sendMessage = function(message, cb) {
		// Prevent errors for sending message responses if there is no callback given
		if (!cb) { cb = function(resp) {}; }

		// Send the message
	    if (isChrome()) {
			if (chrome.extension.sendMessage) {
				chrome.extension.sendMessage(message, cb);
			} else {
				chrome.extension.sendRequest(message, cb);
	        }
	    }
	    else if (isSafari()) {
	        if (cb) {
	            message["__cbId"] = Callbacker.addCb(cb);
	        }

	        safari.self.tab.dispatchMessage("message", message);
	    }
	}

	// Visibility API
	// http://www.html5rocks.com/en/tutorials/pagevisibility/intro/
	var getHiddenProp = function() {
	    var prefixes = ['webkit', 'moz', 'ms', 'o'];

	    // if 'hidden' is natively supported just return it
	    if ('hidden' in document) return 'hidden';

	    // otherwise loop over all the known prefixes until we find one
	    for (var i = 0; i < prefixes.length; i++){
	        if ((prefixes[i] + 'Hidden') in document) {
	            return prefixes[i] + 'Hidden';
	        }
	    }

	    // otherwise it's not supported
	    return null;
	}
	var isHidden = function() {
	    var prop = getHiddenProp();
	    if (!prop) return false;

	    return document[prop];
	}
	var addHiddenEventListener = function(evtHandler) {
		// use the property name to generate the prefixed event name
		var visProp = getHiddenProp();
		if (visProp) {
			var evtname = visProp.replace(/[H|h]idden/,'') + 'visibilitychange';
			document.addEventListener(evtname, evtHandler);
		}
	}

	return {
        isLocal                                 : isLocal,
        isValidURL                              : isValidURL,
        isMac                                   : isMac,
        isEdge                                	: isEdge,
        isSafari                                : isSafari,
        isOpera                                 : isOpera,
        isYandex                                : isYandex,
        isChrome                                : isChrome,
        isChromeOnly                            : isChromeOnly,
        getDisplayName                          : getDisplayName,
        getDisplayUsername                      : getDisplayUsername,
        inPrivateMode                           : inPrivateMode,
        getCurrentLanguageCode                  : getCurrentLanguageCode,
        getBackgroundPage                       : getBackgroundPage,
        getCurrentTab                           : getCurrentTab,
        getAllTabs                              : getAllTabs,
        executeScriptInTab                      : executeScriptInTab,
        executeScriptInTabWithCallback          : executeScriptInTabWithCallback,
        executeScriptFromURLInTab               : executeScriptFromURLInTab,
        executeScriptFromURLInTabWithCallback   : executeScriptFromURLInTabWithCallback,
        executeStyleFromURLInTab                : executeStyleFromURLInTab,
        broadcastMessageToAllTabs               : broadcastMessageToAllTabs,
        injectScript                            : injectScript,
        openTabWithURL                          : openTabWithURL,
        stringFromBool                          : stringFromBool,
        boolFromString                          : boolFromString,
        getSetting                              : getSetting,
        setSetting                              : setSetting,
        settingContainerForKey                  : settingContainerForKey,
        addMessageListener                      : addMessageListener,
        sendMessageToTab                        : sendMessageToTab,
        sendMessage                             : sendMessage,
        getHiddenProp                           : getHiddenProp,
        isHidden                                : isHidden,
        addHiddenEventListener                  : addHiddenEventListener

	}



})();

