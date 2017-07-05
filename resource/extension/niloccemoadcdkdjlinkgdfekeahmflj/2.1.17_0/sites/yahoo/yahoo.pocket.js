/* global $ */

(function () {

    if (isSafari() && window.top != window) return;

    // Localization
    var i18n = {
        "en": {
            "success_saved_text": "saved to pocket"
        },
        "de" : {
            "success_saved_text" : "in pocket gespeichert"
        },
        "es" : {
            "success_saved_text" : "guardado en pocket"
        },
        "es_419" : {
            "success_saved_text" : "guardado en pocket"
        },
        "fr" : {
            "success_saved_text" : "sauvegardé dans Pocket"
        },
        "it" : {
            "success_saved_text" : "salvato in Pocket"
        },
        "ja" : {
            "success_saved_text" : "pocket に保存済み"
        },
        "ru" : {
          "success_saved_text" : "сохранены в pocket"
        },
        "ko" : {
          "success_saved_text" : "이(가) Pocket에 저장됨"
        },
        "nl" : {
          "success_saved_text" : "opgeslagen naar pocket"
        },
        "pl" : {
          "success_saved_text" : "zapisano w aplikacji pocket"
        },
        "pt_BR" : {
          "success_saved_text" : "Salvo no Pocket"
        },
        "pt_PT" : {
          "success_saved_text" : "guardado no Pocket"
        },
        "zh_CN" : {
          "success_saved_text" : "已保存到 Pocket"
        },
        "zh_TW" : {
          "success_saved_text" : "已儲存到 Pocket"
        }
    };

    var yahooOptions = {};
    yahooOptions.refreshInterval = 1500;
    yahooOptions.buttons = [
        {
            text: "pocket",
            successText: i18n[getCurrentLanguageCode()]['success_saved_text'],
            container: '.content.cf',
            className: 'side-button pocket-yahoo-button',
            selector: '.pocket-yahoo-button',
            data: function (elem) {
                // The link is direct on the element within the data-url property
                var link = $(elem).attr('data-url').trim();
                link = unescape(link);

                // First a element is the article title
                var article = $(elem).find("a")[0];
                var title = $(article).text().trim();

                return {title: title, url: link};
            }
        }
    ];

    var createButton = function (btnConfig) {
        var a = document.createElement('a');
        a.setAttribute('class', btnConfig.className);
        a.setAttribute('href', '#');
        a.style.cssText = 'top:31px;display:none;';

        return a;
    };

    var insertButtons = function () {
        var i, l = yahooOptions.buttons.length;

        for (i = 0 ; i < l; i++ ) {
            var btnConfig = yahooOptions.buttons[i];

            // Get all container objects we want to insert the Pocket button
            var containerObjects = $(btnConfig.container).not('.pocket-inserted');
            var countContainerObjects = containerObjects.length;

            if (countContainerObjects === 0) {
                continue;
            }

           $.each(containerObjects, function(idx, container) {

                // If we already added the button don't insert it again
                if (container.className.indexOf('pocket-inserted') !== -1) {
                    return false;
                }

                var $container = $(container);
                $container.addClass('pocket-inserted');

                var btn = createButton(btnConfig);
                var $btn = $(btn);

                // Shift the second side button down a bit to make place for our button
                $($container.find(".side-button")[1]).css("top", "56px");

                // Insert our side button on second place
                $btn.insertAfter($container.find(".side-button")[0]);

                // Everytime the mouse hovers over the article wrapper it should
                // show the button
                $container.hover(
                    function () { $btn.show(); },
                    function () { $btn.hide(); }
                );

                // If we are on the way to add the pocket button to the side buttons
                // and the mouse is hovering over the container, we will not get
                // the hover action and so the pocket button stays hidden.
                // We prevent this and check manually, if the mouse is hovering and
                // add the button manually if so
                if ($container.is(':hover')) {
                    $btn.show();
                }

                var getData = btnConfig.data;

                $btn.on('click', function(e) {
                    var data = getData($container);
                    var message = {
                        identifier: "yahoo",
                        action: "addURL",
                        url: data.url,
                        title: data.title,
                        actionInfo: {
                            cxt_ui: 'btn_yahoo',
                            cxt_url: window.location.href
                        }
                    };
                    sendMessage(message, function(response) {
                        // Success, Error message handling happens in the background.js
                    });
                    e.preventDefault();
                    return false;
                });
            });
        }
    };

    // Initialization
    var yahooIntervalID;
    function setAddPocketButtonInterval() {
        if (typeof yahooIntervalID === 'undefined') {
            // Call the function with no delay
            insertButtons();
            // Start the interval
            yahooIntervalID = setInterval(insertButtons, yahooOptions.refreshInterval);
        }
    }

    function removeAddPocketButtonInterval() {
        if (typeof yahooIntervalID !== 'undefined') {
            clearInterval(yahooIntervalID);
            yahooIntervalID = undefined;
        }
    }

    var yahooTimeoutID;
    function addScrollTimoutHandler() {
        // Clear the scroll timout as we don't want to fire while the user
        // still scrolling
        removeScrollTimoutHandler();

        // Add scroll timeout that will activate the scroll interval again if
        // the user finished scrolling
        yahooTimeoutID = setTimeout(function() {
            // After the user finished scrolling add Pocket button interval again
            setAddPocketButtonInterval();
        }, 500);
    }

    function removeScrollTimoutHandler() {
        if (typeof yahooTimeoutID !== 'undefined') {
            clearTimeout(yahooTimeoutID);
            yahooTimeoutID = undefined;
        }
    }

    var scrollHandler;
    function addScrollHandler() {
        // Remove scroll handler if necessary
        removeScrollHandler();

        // Add scroll event handler to prevent adding Pocket buttons while
        // the user is scrolling
        scrollHandler = function() {
            // If user starts scrolling remove interval as we don't want to
            // fire any add Pocket buttons interval while scrolling
            removeAddPocketButtonInterval();

            // Add scroll scroll timeout to determine if the user finished
            // scrolling
            addScrollTimoutHandler();
        };

        $(window).on('scroll', scrollHandler);
    }

    function removeScrollHandler() {
        if (typeof scrollHandler !== 'undefined') {
            $(window).off('scroll', scrollHandler);
        }
    }

    function addVisibilityHandler() {
        addHiddenEventListener(function() {
            if (isHidden()) {
                removeAddPocketButtonInterval();
            }
            else {
                setAddPocketButtonInterval();
            }
       });
    }

    function init() {
        // Set the interval to add Pocket buttons to Twitter
        setAddPocketButtonInterval();

        // Add scroll handler for adding Pocket buttons
        addScrollHandler();

        // Add visibility handler for removing timeouts if the tab is hidden
        addVisibilityHandler();
    }

    // Yahoo activation via options page
    addMessageListener(function (request, sender, sendResponse) {
        if (request.action === "settingChanged" && request.key === "yahoo") {
            if (request.value === "true" || request.value === true) {
                init();
            }
            else if (request.value === "false" || request.value === false) {
                // Remove interval to add the yahoo buttons if the user deactivates
                // yahooo integration
                removeScrollHandler();
                removeScrollTimoutHandler();
                removeAddPocketButtonInterval();
            }
        }
    });

    // Check if Yahoo is activated
    sendMessage({action: "getSetting", key: "yahoo"}, function (response) {
        if (response.value === "true" || response.value === true) {
            init();
        }
    });

}());
