/*
    Injected in the Pocket logout page to logout the user if the user logged
    out of the web app
 */

(function() {

    var isSafari = function() {
        return window.safari !== undefined;
    };

    if (isSafari() && window.top != window) return;

    // As we inject this  on Safari in /login we have to check if the e=4 is
    // in the url and prevent logout if it's not in the url
    var url = document.URL;
    if (isSafari() && url.indexOf("e=4") === -1) return;

    // Let the background know that the user successfully logged out
    sendMessage({action: "logout"}, function(response) {});
}());