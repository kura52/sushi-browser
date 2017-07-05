/* global $, sendMessage */
(function() {

    var baseHost = "getpocket.com";
    // var baseHost = "admin:s3krit@nick1.dev.readitlater.com";
    var supportedServices = ['twitter', 'hackernews', 'reddit', 'yahoo', 'keyboard-shortcut'];

    function updateShortcutInfo() {
        var placeholder = $('#keyboard-shortcut-text').attr('placeholder');
        var keyboardShortcut = $('#keyboard-shortcut-text').val();
        if (placeholder === keyboardShortcut) {
            $(".shortcut-info").text("");
            return;
        }

        var resetToDefault = $("<a href='#''>" + PKT_EXT.i18n.getMessage("options_reset_to_default") + "</a>");
        resetToDefault.click(function(evt) {
            $('#keyboard-shortcut-text').removeClass('error');
            sendMessage({action:'setSetting', key:'keyboard-shortcut-add', value:placeholder});
            updateUI();
            $(".shortcut-info").text("");
            document.body.style.cursor = "default";
            evt.preventDefault();
        });
        $(".shortcut-info").html(resetToDefault);
    }

    function checkForValidToken () {
        // Check if the user has still a valid token
        if (!navigator.onLine) { return; }

        // Check if we have a valid token for the user
        sendMessage({action:"isValidToken"}, function(resp) {
            if (resp && resp.value === true) { return; }


            // If the token is not valid check if the username is set
            sendMessage({action: "getSetting", key: "username"}, function(response) {
                if (response && response.value === "") { return; }

                // Username is set but the token is not valid, logout user
                sendMessage({action: "logout"}, function(rsp) {
                    updateUI();
                });
            });
        });
    }

    function updateUI() {
        var usernameField = document.getElementById("username-field");
        var logoutLinkWrapper = document.getElementById("logout-link-wrapper");
        var loginLinkWrapper = document.getElementById("login-link-wrapper");

        sendMessage({action: "getSetting", key: "username"}, function(response) {
            var username = response.value;
            if (username) {
                sendMessage({action: "getDisplayUsername"}, function(response) {
                    usernameField.innerHTML = response.value;
                    logoutLinkWrapper.style.display = "inline";
                    usernameField.style.display = "inline";
                    loginLinkWrapper.style.display = "none";
                });
            }
            else {
                usernameField.style.display = "none";
                logoutLinkWrapper.style.display = "none";
                loginLinkWrapper.style.display = "inline";
            }

            $.each(supportedServices, function(index, service) {
                var checkboxId = '#' + service + '-checkbox';
                sendMessage({action: "getSetting", key: service}, function(response) {
                    $(checkboxId).prop('checked', boolFromString(response.value));
                });

            });

            $('#ril-recommendations').hide();
            sendMessage({action: "getSetting", key: "show_recs"}, function(response) {
                if(response && response.value == 'true'){
                    $('#ril-recommendations').show();
                }
            });

            sendMessage({action: "getSetting", key: "recommendations"}, function(response) {
                $('#recommendation-checkbox').prop('checked', boolFromString(response.value));
            });

            sendMessage({action: "getSetting", key: "newtab"}, function(response) {
                $('#newtab-checkbox').prop('checked', boolFromString(response.value));
            });

            sendMessage({action: "getSetting", key: "suggestions"}, function(response) {
                $('#suggestions-checkbox').prop('checked', boolFromString(response.value));
            });


            $('#ril-newtab').hide();
            sendMessage({action: "getSetting", key: "setup"}, function(response) {

                if(response && response.value){
                    var newtab = JSON.parse(response.value).new_tab

                    if(newtab){
                        $('#ril-newtab').show();
                    }
                }
            });

            sendMessage({action: "getSetting", key: 'keyboard-shortcut-add'}, function(response) {
                var keyboardShortcut = response.value;
                if (keyboardShortcut !== undefined) {
                    $('#keyboard-shortcut-text').val(keyboardShortcut);
                }
                updateShortcutInfo();
            });
        });
    }

    /**
     * Keyboard Shortcut
     */
    function validKeyboardShortcut(keyboardShortcut) {
        // Check the key combo
        // The regex:
        //
        // starts with (one or more) of     alt / shift / ctrl / command and a plus
        // then (zero or more) of           a-z / 0-9 (only one) and a plus
        // then ends with                   a-z / 0-9 (only one)
        if (keyboardShortcut.length > 0 &&
            keyboardShortcut.match(/^(((alt|shift|ctrl|command|⌘|⌥|⌃|⇧)\+)+([a-z0-9]{1}\+)*([a-z0-9]{1}))$/gi) === null ) {
            return false;
        }
        return true;
    }

    /**
     * Initialization
     */
    function initDocumentTitle() {
        var platform = "";
        if (isOpera()) {
            platform = "Opera";
        }
        else if (isYandex()) {
            platform += PKT_EXT.i18n.getMessage("yandexBrowser");
        }
        else if (isEdge()) {
            platform = "Microsoft Edge";
        }
        else if (isChrome()) {
            platform = "Chrome";
        }
        else if (isSafari()) {
            platform = "Safari";
        }

        // "Pocket for {$0} Options";
        document.title = PKT_EXT.i18n.getMessagePlaceholder("options_title", [platform]);
    }

    function initCheckboxes() {
        $.each(supportedServices, function(index, service) {
            var checkboxId = '#' + service + '-checkbox';
            $(checkboxId).on('click', function() {
                sendMessage({action:"setSetting", key: service, value:stringFromBool($(this).is(':checked'))});
            });
        });

        $('#newtab-checkbox').on('click', function() {
            sendMessage({action:"setSetting", key: "newtab", value:stringFromBool($(this).is(':checked'))});
        });

        $('#recommendation-checkbox').on('click', function() {
            sendMessage({action:"setSetting", key: "recommendations", value:stringFromBool($(this).is(':checked'))});
        });

        $('#suggestions-checkbox').on('click', function() {
            sendMessage({action:"setSetting", key: "suggestions", value:stringFromBool($(this).is(':checked'))});
        });

    }

    function initTopicLinks() {
        var $elementToHide = isMac() ? $("#ril-topics-links-win") : $("#ril-topics-links-mac");
        $elementToHide.hide();

        // Set links for topic links
        var linkEnding;
        if (isOpera()) {
            linkEnding = "?s=OPERA_EXT_OPTIONS";
        }
        else if (isYandex()) {
            linkEnding = "?s=YANDEX_EXT_OPTIONS";
        }
        else if (isEdge()) {
            linkEnding = "?s=EDGE_EXT_OPTIONS";
        }
        else if (isChrome()) {
            linkEnding = "?s=CHROME_EXT_OPTIONS";
        }
        else if (isSafari()) {
            linkEnding = "?s=SAFARI_EXT_OPTIONS";
        }

        var links = [{
            selector: ".ril-web a",
            link: "http://" + baseHost + "/a" + linkEnding
        },
        {
            selector: ".ril-iphone-ipad a",
            link: "http://" + baseHost + "/ios" + linkEnding
        },
        {
            selector: ".ril-mac a",
            link: "http://" + baseHost + "/mac" + linkEnding
        },
        {
            selector: ".ril-android a",
            link: "http://" + baseHost + "/android" + linkEnding
        },
                {
            selector: ".ril-iphone a",
            link: "http://" + baseHost + "/iphone" + linkEnding
        },
        {
            selector: ".ril-ipad a",
            link: "http://" + baseHost + "/android" + linkEnding
        }];

        $.each(links, function(i, linkObj) {
            $(linkObj.selector).attr('href', linkObj.link);
        });
    }

    function init() {

        (function initLinks() {
            $('#logout-link').on('click', function() {
                // Logout the user from the web app and trigger logout of the
                // extension
                sendMessage({action: "openTab", url: "http://" + baseHost + "/lo", inBackground: false});

            });

            $('#login-link').on('click', function() {
                sendMessage({action: "showLoginWindow"});
            });

            $('#search-support-link').on('click', function(evt) {
                var searchSupportLink = "http://help." + baseHost;
                sendMessage({action: "openTab", url: searchSupportLink});
                evt.preventDefault();
            });

            $('#send-us-an-email-link').on('click', function(evt) {
                var emailURL = "https://getpocket.com/extension/support";
                sendMessage({action: "openTab", url: emailURL});
                evt.preventDefault();
            });

            $('#get-in-touch-on-twitter-link').on('click', function(evt) {
                var twitterText;
                if (isOpera()) {
                    twitterText = "%23opera ";
                }
                else if (isYandex()) {
                    twitterText = "%23yandex ";
                }
                else if (isEdge()) {
                    twitterText = "%23MicrosoftEdge ";
                }
                else if (isChrome()) {
                    twitterText = "%23chrome ";
                }
                else if (isSafari()) {
                    twitterText = "%23safari ";
                }
                var twitterLink = "https://twitter.com/intent/tweet?screen_name=pocketsupport&text=" + twitterText;
                sendMessage({action: "openTab", url: twitterLink});
                evt.preventDefault();
            });

        }());


        (function initKeyboardShortcuts() {

            // Placeholder strings for mac and windows
            var placeholderString = (isMac() ? '⌘+⇧+P' : 'ctrl+shift+S');
            $('#keyboard-shortcut-text').attr('placeholder', placeholderString);

            // Variables for transformation between keyCode and strings that
            // keymaster.js understands
            var _mods = { 16: false, 18: false, 17: false, 91: false },
                _scope = 'all',
                // modifier keys
                shift = isMac() ? '⇧' : 'shift',
                alt = isMac() ? '⌥' : 'alt',
                ctrl = isMac() ? '⌃' : 'ctrl',
                cmd = isMac() ? '⌘' : 'command',
                _MODIFIERS = {
                    16: shift,
                    18: alt,
                    17: ctrl,
                    91: cmd
                },
                // special keys
                _MAP = {
                    8: 'backspace', 9:'tab', 12:'clear',
                    13: 'enter',
                    27: 'esc', 32: 'space',
                    37: 'left', 38: 'up',
                    39: 'right', 40: 'down',
                    46: 'del',
                    36: 'home', 35: 'end',
                    33: 'pageup', 34: 'pagedown',
                    188: ',', 190: '.', 191: '/',
                    192: '`', 189: '-', 187: '=',
                    186: ';', 222: '\'',
                    219: '[', 221: ']', 220: '\\'
                };

            // On keydown try to get the human readable form of the pressed keys
            // and join all keys with a + for keymaster.js
            var keysPressed = [];
            $('#keyboard-shortcut-text').keydown(function(event) {
                var keyCode = event.keyCode;

                // Backspace key empty the input field
                if (keyCode === 8) {
                    $(this).val('');
                }
                else if (keyCode === 13 || keyCode === 27) {
                    $(this).blur();
                }
                else {
                    // Get key
                    var keyString = _MODIFIERS[keyCode] ||
                                    _MAP[keyCode] ||
                                    String.fromCharCode(keyCode).toUpperCase();

                    // Check if key already pressed
                    if (keysPressed.indexOf(keyString) == -1) {
                        keysPressed.push(keyString);
                        $(this).val(keysPressed.join("+"));
                    }
                }

                event.preventDefault();
            });

            // Reset the keyPressed array on key up
            $('#keyboard-shortcut-text').keyup(function(event) {
                keysPressed = [];
            });

            $('#keyboard-shortcut-text').focus(function(event) {
                this.select();

                // Work around Chrome's little problem
                this.onmouseup = function() {
                    // Prevent further mouseup intervention
                    this.onmouseup = null;
                    return false;
                };

                $(".shortcut-info").text(PKT_EXT.i18n.getMessage("options_record_shortcut"));
            });

            // In the focus out try to save the keyboard shortcut
            $('#keyboard-shortcut-text').focusout(function(event) {
                // If element looses focus save the value

                // Remove error class if there was an error before
                $(this).removeClass("error");

                // Create the keyboard shortcut
                var keyboardShortcut = $(this).val()
                                 .trim()
                                 // .toUpperCase()
                                 .replace(/[\s\,\&]/gi, '+') // Convert possible spacer characters to pluses
                                 .replace(/[^A-Z0-9\⇧\⌥\⌘\^\+]/gi, ''); // Strip out almost everything
                $(this).val(keyboardShortcut);

                var key, value;
                if (keyboardShortcut === "") {
                    // Keyboard shortcut field is empty save the placeholder
                    key = 'keyboard-shortcut-add';
                    value = $('#keyboard-shortcut-text').attr('placeholder');
                    sendMessage({action:"setSetting", key: key, value:value});
                }
                else if (!validKeyboardShortcut(keyboardShortcut)) {
                    $(this).addClass('error');
                }
                else {
                    key = 'keyboard-shortcut-add';
                    value = keyboardShortcut;
                    sendMessage({action:"setSetting", key: key, value:value});
                }

                updateUI();
            });
        }());

        PKT_EXT.i18n.initLocalization();
        initDocumentTitle();
        initCheckboxes();
        initTopicLinks();
        updateUI();

        checkForValidToken();
    }

    window.onload = init;


    /**
     * Message handling
     */
    addMessageListener(function(request, sender, response) {
        if (request.action === 'updateOptions') {
            updateUI()
        }
    })

}())

