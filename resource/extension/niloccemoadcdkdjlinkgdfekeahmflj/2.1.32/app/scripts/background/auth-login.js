/*
    Injected in the Pocket login successfull page to get the user credentials
    from the cookie we need to login the user into the extension
 */

(function() {

    var isSafari = function() {
        return window.safari !== undefined;
    };

    if (isSafari() && window.top != window) return;

    /**
     * Return the document's cookies as an object of name/value pairs.
     * Assume that cookie values are encoded with encodeURIComponent().
     * @param  {string} cookieString String of cookie information
     * @return {Object}              document's cookies as an object
     */
    var getCookies = function(cookieString) {
        var cookies = {};                       // The object we will return
        var all = cookieString;                 // Get all cookies in one big string
        if (all === "")                         // If the property is the empty string
            return cookies;                     // return an empty object
        var list = all.split("; ");             // Split into individual name=value pairs
        for (var i = 0; i < list.length; i++) {  // For each cookie
            var cookie = list[i];               // Get cookie
            var p = cookie.indexOf("=");        // Find the first = sign
            var name = cookie.substring(0,p);   // Get cookie name
            var value = cookie.substring(p+1);  // Get cookie value
            value = decodeURIComponent(value);  // Decode the value
            cookies[name] = value;              // Store name and value in object
        }
        return cookies;
    };

    // Create cookies object from documents cookies
    var cookies = getCookies(document.cookie);

    // Get sess_exttok and sess_user_id we need to login the user
    var message = {
        userId: cookies['sess_user_id'],
        token: cookies['sess_exttok']
    };

    // Wait a second and send the login successfull page
    setTimeout(function() {
        // Let the background know that the user successfully logged in
        sendMessage({action: "loginSuccessfull", value:message}, function(response) {
        });
    }, 1500);

}());
