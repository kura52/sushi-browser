// Shared and Utility functions between all browser extensions. Injected in
// any site and used by the background page

// Utility functions
function isValidURL(s) {
    return (/^https?\:/i).test(s);
}
function isMac() {
    return navigator.platform.match(/^Mac/) !== null;
}

function isSafari() {
    return window.safari !== undefined;
}

function isLocal() {
    return document.location.hostname == "localhost"
}

// As Opera is running now on Chromium, we have to test in Chrome that
// we are not running Opera as the only difference between Opera and Chrome
// is the OPR in the userAgent
function isOpera() {
    return (/OPR/).test(window.navigator.userAgent);
}

// As the Yandex browser is running Chromium in the backed, we have to test
// in Chrome that we are not running on Yandex as the only difference between
// Yandex and Chrome is the YaBrowser in the userAgent
function isYandex() {
    return (/YaBrowser/).test(window.navigator.userAgent);
}
function isEdge() {
    return (/Edge\/\d+/).test(window.navigator.userAgent);
}
// Test if the underlying rendering engine is Chrome / Chromium. That's the case
// for Chrome, Opera and Yandex
function isChrome() {
    return (window.chrome !== undefined && window.chrome.app !== undefined);
}

// Test if it's chrome only and not opera or yandex
function isChromeOnly() {
    return (isChrome() && !isOpera() && !isYandex() && !isEdge() );
}

// User

function getDisplayName() {
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

function getDisplayUsername() {
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

function inPrivateMode(tab) {
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
    var language = navigator.languages ? navigator.languages[0]: (navigator.language || navigator.userLanguage)

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

function getBackgroundPage() {
    var backgroundPage = isChrome() ? chrome.extension.getBackgroundPage()
                                    : safari.extension.globalPage.contentWindow;
    return backgroundPage;
}

function getCurrentTab(cb) {
    if (isChrome()) {
        chrome.tabs.getSelected(null, function (tab) {
            cb(tab);
        });
    } else if (isSafari()) {
        var tab = safari.application.activeBrowserWindow.activeTab;
        cb(tab);
    }
}

function getAllTabs(cb) {
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

function executeScriptInTab(tab, script){
    if (isChrome()) {
        chrome.tabs.executeScript(tab.id, {code: script});
    }
    else if (isSafari()) {
        if (!tab || !tab.page || !tab.page.dispatchMessage) { return; }
        tab.page.dispatchMessage("executeScript", script);
    }
}

function executeScriptInTabWithCallback(tab, script, callback) {
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

function executeScriptFromURLInTab(tab, scriptURL) {
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

function executeScriptFromURLInTabWithCallback(tab, scriptURL, callback) {
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

function executeStyleFromURLInTab(tab, scriptURL) {
    if (!isSafari()) {
        chrome.tabs.insertCSS(tab.id, {file: scriptURL});
    }
    else {
        safari.extension.addContentStyleSheetFromURL(scriptURL,['*'],[]);
    }
}

function broadcastMessageToAllTabs(msg) {
    getAllTabs(function(tabs) {
        for (var i = 0; i < tabs.length; i++) {
            var tab = tabs[i];
            sendMessageToTab(tab, msg);
        }
    });
}

function injectScript(func) {
    var actualCode = '(' + func + ')();';

    var script = document.createElement('script');
    script.textContent = actualCode;
    (document.head || document.documentElement).appendChild(script);
    script.parentNode.removeChild(script);
}

function openTabWithURL(url, inBackground) {
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
function stringFromBool(bl) {
    if (bl === false) return "false";
    else return "true";
}

function boolFromString(str) {
    if (typeof str === "string") {
        if (str === "false") { return false; }
        return true;
    }

    // If the expected str is already a bool just return the bool
    // E.g. Safari settings returns bool
    return str;
}

function getSetting(key) {
    return settingContainerForKey(key)[key];
}

function setSetting(key, value) {
    var location = settingContainerForKey(key);
    if (!value && location == localStorage) {
        localStorage.removeItem(key);
    } else {
        location[key] = value;
    }
}

function settingContainerForKey(key) {
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

function addMessageListener(handler) {
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
function sendMessageToTab(tab, message) {
    if (isChrome()) {
        chrome.tabs.sendMessage(tab.id, message);
    }
    else if (isSafari()) {
        if (!tab || !tab.page || !tab.page.dispatchMessage) { return; }
        tab.page.dispatchMessage("message", message);
    }
}

// Message from an injected script to the background
function sendMessage(message, cb) {
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
function getHiddenProp() {
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

function isHidden() {
    var prop = getHiddenProp();
    if (!prop) return false;

    return document[prop];
}

function addHiddenEventListener(evtHandler) {
    // use the property name to generate the prefixed event name
    var visProp = getHiddenProp();
    if (visProp) {
        var evtname = visProp.replace(/[H|h]idden/,'') + 'visibilitychange';
        document.addEventListener(evtname, evtHandler);
    }
}

function getImageCacheUrl(url, resize, fallback, lowquality) {
    if (!url)
        return;

    if (fallback)
        vars = 'f='+fallback;
    else
        vars = '';

    parts = parseUri(url);

    /*
    javascript:alert(getImageCacheUrl('http://ideashower.com/favicon.ico'))

    TODO : move this to server and out of JS

    http://ideashower.com/favicon.ico
    /i/ideashower.com/favicon.ico

    http://ideashower.com/favicon.ico?foo=bar
    /i/ideashower.com/favicon/QS/foo=bar/image.ico

    http://ideashower.com/favicon.ico -w280
    /i/ideashower.com/favicon/RS/w280.ico

    http://ideashower.com/favicon.ico?foo=bar -w280
    /i/ideashower.com/favicon/QS/foo=bar/RS/w280.ico

    --

    http://ideashower.com/favicon
    /i/ideashower.com/favicon.jpg?ne=1

    http://ideashower.com/favicon?foo=bar
    /i/ideashower.com/favicon/QS/foo=bar/image.jpg?ne=1 (ne= no extension)

    */

    // only allow http
    if (parts['protocol'] != 'http' && parts['protocol'] != 'https')
        return;

    // --

    // get extension
    var extParts = /\.(jpg|gif|jpeg|png|ico)$/i.exec(parts['file']);
    var extension = extParts ? extParts[1] : false;

    if (!extension)
    {
        // force it to be a jpg and flag it with no-extension
        extension = 'jpg';
        vars += '&ne=1';
    }

    // query string
    var qs = '';
    if (parts['query'])
        qs = '/QS/' + encodeURIComponent(encodeURIComponent(parts['query'])) + '/EQS';

    // resize options
    var rs = '';
    if (resize)
        rs = '/RS/' + resize;

    if (parts['protocol'] == 'https')
    {
        if (!vars) vars = '';
        vars += '&ssl=1';
    }

    if (lowquality)
    {
        vars += '&lq=1';
    }

    url =   'https://img.readitlater.com/i/' +
            parts['host'] +
            parts['directory'] +
            parts['file'].replace('.'+extension, '') +
            qs +
            rs +
            (qs && !rs ? '/image' : '') +
            '.' + extension +
            (vars ? '?'+vars : '')
            ;

    return url;
}
