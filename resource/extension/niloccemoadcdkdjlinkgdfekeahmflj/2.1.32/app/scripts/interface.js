'use strict';

var PKT_EXT = PKT_EXT || {};

(function (PKT_EXT) {

    var sendMessage = function sendMessage(message, cb) {
        if (window.chrome.extension.sendMessage) {
            window.chrome.extension.sendMessage(message, cb);
        } else {
            window.chrome.extension.sendRequest(message, cb);
        }
    };

    var getKey = function getKey() {
        return '7035-d3382df43fe0195174c42f9c';
    };
    // if (isSafari()) {
    //     oAuthKey = "9346-1e342af73fe11d5174042e9d";
    //     apiKey = "135gbu4epq447VX194TjSfto95A0jbz0";
    // }
    // else if (isOpera()) {
    //     oAuthKey = "15449-d65f5fdc5cbb3fef26248f12";
    //     apiKey = "3a6ZtR00Aa825u31drgc530b97d9te43";
    // }
    // else if (isYandex()) {
    //     oAuthKey = "23283-dd493d5fba22fd9b6f39e35a";
    //     apiKey = "3a6ZtR00Aa825u31drgc530b97d9te43";
    // }
    // else if(isEdge()){
    //     oAuthKey = "53720-f36d6ecabb107bbb7c3b5ab9";
    // }
    // else if (isChromeOnly()) {
    //     oAuthKey = "7035-d3382df43fe0195174c42f9c";
    //     // apiKey = "801p7PR9A5b78x11f4ghRD8CVFdrA689";
    // }

    var getPath = function getPath(path) {
        return window.chrome.extension.getURL(path);
    };

    PKT_EXT.INTERFACE = {
        getPath: getPath,
        getKey: getKey,
        sendMessage: sendMessage
    };
})(PKT_EXT || {});