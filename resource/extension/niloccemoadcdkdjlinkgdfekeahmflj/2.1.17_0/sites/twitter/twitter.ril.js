/*jshint -W083 */

$(function () {

    if (isSafari() && window.top != window) return;

    var twitterBaseURL = "http://twitter.com";

    /**
     * Helper to get the full path to the file based on the extension
     * @param  {String} path Path to local file
     * @return {String}      Full path to local file based on extension
     */
    var pathHelper = function(path) {
        return (window.safari !== undefined)  ? safari.extension.baseURI + path
                                              : chrome.extension.getURL(path);
    };

    var hdpi = (window.devicePixelRatio > 1);

    var linksFromTweetText = function($tweetText) {
        return $tweetText.find('a')
                         .not('[data-screen-name]')
                         .not('.twitter-atreply')
                         .not('.twitter-hashtag');
    };

    var twitterIdFromTweet = function(tweetcontainer) {
        var returnid = 0;
        if (typeof $(tweetcontainer).attr('data-tweet-id') == 'string')
        {
            returnid = $(tweetcontainer).attr('data-tweet-id');
        }
        else if (typeof $(tweetcontainer).attr('data-item-id') == 'string')
        {
            returnid = $(tweetcontainer).attr('data-item-id');
        }
        return returnid;
    };

    var basePocketButton = function(){

    };

    /**
     * Twitter Options provides information about the interval we try to add
     * Pocket to tweets for different Twitter Site Layouts
     * @type {Object}
     */
    var twitterOptions = {
        refreshInterval: 1500,
        pocketButtons: [
            // {
            //     // Fall 2014 new stream, profile
            //     name: "pocket-action",
            //     text: "Save to Pocket",
            //     container: '.js-stream-item .js-actions:not(.ProfileTweet-actionList--withCircle, .ProfileTweet-actionList)',
            //     after: [".pocket-action", ".js-toggleRt"],
            //     className: 'ProfileTweet-action js-tooltip',
            //     selector: '.pocket-action',
            //     create: function(tweetId, title, className) {
            //         var div = document.createElement('div');
            //         div.className = "action-pocket-container";

            //         // Normal is 10px, this adds space for display: inline-block hidden space
            //         // li.style.marginLeft = '12px';

            //         var a = document.createElement('a');
            //         a.setAttribute('class', className);
            //         a.setAttribute('href', '#');
            //         a.setAttribute('data-original-title', title); // Tooltip text

            //         var i = document.createElement('span');
            //         i.setAttribute('class', 'icon icon-pocket');

            //         $(a).append(i);
            //         $(div).append(a);

            //         return div;
            //     },
            //     links: function($container) {
            //         // Return all links from the container
            //         var $tweet = $container.parents('div.tweet');
            //         var $tweetText;
            //         if (!$tweet.length)
            //         {
            //             // profile mode
            //             var c = $container.closest('.js-tweet');
            //             var text = c.find('.js-tweet-text').first();
            //             $tweetText = $(text);

            //             // Return links from text
            //             return linksFromTweetText($tweetText);
            //         }
            //         else
            //         {
            //             $tweetText = $tweet.find('p.js-tweet-text');
            //             return linksFromTweetText($tweetText);
            //         }
            //     },
            //     data: function(action) {
            //         // Return object with username, html, links and tweetId properties
            //         var $action = $(action);
            //         var $tweet = $action.parents('div.tweet');
            //         var $tweetText;
            //         var tweetUsername;
            //         var tweetHTML;
            //         var tweetLinks;
            //         var tweetId;
            //         if (!$tweet.length)
            //         {
            //             $tweet = $action.closest(".ProfileTweet");
            //             $tweetText = $tweet.find('p.js-tweet-text');

            //             tweetUsername = $tweet.attr('data-screen-name');
            //             tweetHTML = $tweetText.html().replace(/\n/g, ' ');
            //             tweetLinks = linksFromTweetText($tweetText);
            //             tweetId = twitterIdFromTweet($tweet);
            //         }
            //         else
            //         {
            //             $tweetText = $tweet.find('p.js-tweet-text');

            //             tweetUsername = $tweet.attr('data-screen-name');
            //             tweetHTML = $tweetText.html().replace(/\n/g, ' ');
            //             tweetLinks = linksFromTweetText($tweetText);
            //             tweetId = twitterIdFromTweet($tweet);

            //         }
            //         return {
            //             "username": tweetUsername,
            //             "text": tweetHTML,
            //             "links": tweetLinks,
            //             "tweetId": tweetId
            //         };
            //     }
            // },
            {
              // August 2015 stream changes (circles)
              // Sept 2015 changes extended that button-based markup to all versions of twitter.com,
              // making "--withCircle" a variant of that
              name: "pocket-profile-stream-AUG-2015",
              text: "Save to Pocket",
              container:
                '.js-stream-tweet .js-actions.ProfileTweet-actionList,' +
                '.permalink .js-actionable-tweet .js-actions.ProfileTweet-actionList,' +
                '.js-stream-tweet .js-actions.ProfileTweet-actionList--withCircle,' +
                '.permalink .js-actionable-tweet .js-actions.ProfileTweet-actionList--withCircle'
              ,
              after: '.js-toggleRt, .js-toggle-rt',
              default: '',
              selector: '.pocket-action',
              create: function (tweetId, title, className) {

                /* Desired DOM structure:
                  <div class="ProfileTweet-action ProfileTweet-action--pocket js-toggleState">
                    <button class="ProfileTweet-actionButton js-actionButton" type="button">
                      <div class="IconContainer js-tooltip" data-original-title="Add to Pocket">
                        <span class="Icon Icon--circleFill"></span> <!-- enabled via CSS for circle variant -->
                        <span class="Icon Icon--circle"></span> <!-- enabled via CSS for circle variant -->
                        <span class="Icon Icon--pocket"></span>
                        <span class="u-hiddenVisually">Pocket</span>
                      </div>
                    </button>
                  <div>
                */

                var action = document.createElement('div');
                action.className = 'ProfileTweet-action ProfileTweet-action--pocket js-toggleState';
                var button = document.createElement('button');
                button.className = 'ProfileTweet-actionButton js-actionButton';
                button.type = 'button';
                var iconCntr = document.createElement('div');
                iconCntr.className = 'IconContainer js-tooltip';
                iconCntr.setAttribute('data-original-title', title); // tooltip text
                var icon = document.createElement('span');
                icon.className = 'Icon Icon--pocket';
                var circle = document.createElement('span');
                circle.className = 'Icon Icon--circle';
                var circleFill = document.createElement('span');
                circleFill.className = 'Icon Icon--circleFill';
                var text = document.createElement('span');
                text.className = 'u-hiddenVisually';
                text.textContent = 'Pocket';

                iconCntr.appendChild(circleFill);
                iconCntr.appendChild(circle);
                iconCntr.appendChild(icon);
                iconCntr.appendChild(text);
                button.appendChild(iconCntr);
                action.appendChild(button);

                return action;
              },
                links: function($container) {
                    // Return all links from the container
                    var $tweet = $container.parents('div.tweet');
                    var $tweetText;
                    if (!$tweet.length)
                    {
                        // profile mode
                        var c = $container.closest('.js-tweet');
                        var text = c.find('.js-tweet-text').first();
                        $tweetText = $(text);

                        // Return links from text
                        return linksFromTweetText($tweetText);
                    }
                    else
                    {
                        $tweetText = $tweet.find('p.js-tweet-text');
                        return linksFromTweetText($tweetText);
                    }
                },
              data: function (action) {
                    // Return object with username, html, links and tweetId properties
                    var $action = $(action);
                    var $tweet = $action.parents('div.tweet');
                    var $tweetText;
                    var tweetUsername;
                    var tweetHTML;
                    var tweetLinks;
                    var tweetId;
                    if (!$tweet.length){
                        $tweet = $action.closest(".ProfileTweet");
                        $tweetText = $tweet.find('p.js-tweet-text');

                        tweetUsername = $tweet.attr('data-screen-name');
                        tweetHTML = $tweetText.html().replace(/\n/g, ' ');
                        tweetLinks = linksFromTweetText($tweetText);
                        tweetId = twitterIdFromTweet($tweet);
                    }
                    else{
                        $tweetText = $tweet.find('p.js-tweet-text');

                        tweetUsername = $tweet.attr('data-screen-name');
                        tweetHTML = $tweetText.html().replace(/\n/g, ' ');
                        tweetLinks = linksFromTweetText($tweetText);
                        tweetId = twitterIdFromTweet($tweet);

                    }
                    return {
                        "username": tweetUsername,
                        "text": tweetHTML,
                        "links": tweetLinks,
                        "tweetId": tweetId
                    };
                // // NOTE: .js-stream-tweet - new in OCT 2014
                // var $tweet = $(elem).closest('.js-tweet, .js-stream-tweet, .js-actionable-tweet');
                // var $text = $tweet.find('.js-tweet-text').first();

                // // Build the RT text
                // var screenname = $tweet.attr('data-screen-name');
                // if (!screenname) {
                //   screenname = $tweet.find('.js-action-profile-name')
                //     .filter(function(i){ return $(this).text()[0] === '@' })
                //     .first()
                //     .text()
                //     .trim()
                //     .replace(/^@/, '');
                // }
                // var text = getFullTweetText($text, screenname);

                // // Send back the data
                // return {
                //   text: text,
                //   placement: 'twitter-feed',
                //   retweeted_tweet_id:          $tweet.attr('data-item-id'),
                //   retweeted_user_id:           $tweet.attr('data-user-id'),
                //   retweeted_user_name:         $tweet.attr('data-screen-name'),
                //   retweeted_user_display_name: $tweet.attr('data-name')
                // };
              },
              clear: function (elem) {
              },
              activator: function (elem, btnConfig) {
                var $btn = $(elem);

                // Remove extra margin on the last item in the list to prevent overflow
                var moreActions = $btn.siblings('.js-more-tweet-actions').get(0);
                if (moreActions) {
                  moreActions.style.marginRight = '0px';
                }

                if( $btn.closest('.in-reply-to').length > 0 ) {
                  $btn.find('i').css({'background-position-y': '-21px'});
                }
              }
            }

        ]
    };

    function addLinkWithInformation(tweetUsername, tweetText, tweetLinks, tweetId) {
        var message = {
            identifier: "twitter",
            action: "addURL",
            url: tweetLinks[0].href, // naively use the first link
            title: tweetUsername + ": " + tweetText,
            actionInfo: {
                ref_id: tweetId,
                cxt_ui: 'btn_twitter',
                cxt_url: window.location.href
            }
        };
        sendMessage(message, function (response) {
            // Success, Error message handling happens in the background.js
        });
    }

    function addActionHandler(pocketAction, buttonOption) {
        // Add handler to save link
        $(pocketAction).on("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            if ($(this).hasClass('pocket-saved'))
            {
                return;
            }

            $(this).addClass('pocket-saved').find('.icon-pocket').addClass('icon-pocket-saved');
            $(this).find('.ProfileTweet-action').attr('data-original-title','Saved to Pocket');

            // Get information for adding link
            var buttonOptionData = buttonOption.data(this);
            var username =  buttonOptionData.username;
            var text = buttonOptionData.text;
            var links = buttonOptionData.links;
            var tweetId = buttonOptionData.tweetId;

            addLinkWithInformation(username, text, links, tweetId);
        });
    }

    function addMutationObserver(){
        // select the target node
        var target = document.querySelector('#stream-items-id');

        // create an observer instance
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                console.log(mutation);
            });
        });

        // configuration of the observer:
        var config = { attributes: true, childList: true, characterData: true }

        // pass in the target node, as well as the observer options
        observer.observe(target, config);

        console.log(target, config, observer);

    }

    /**
     * Go through all tweets and add Pocket to tweets based on the twitter options
     */
    function addPocketToTweets() {
        var buttonsLength = twitterOptions.pocketButtons.length;
        for (var i = 0; i < buttonsLength; i++) {
            var buttonOption = twitterOptions.pocketButtons[i];

            // Get all container objects we want to insert the Pocket button
            var containerObjects = $(buttonOption.container).not('.pocket-inserted');
            var countContainerObjects = containerObjects.length;

            // We don't have to do anything as there is no container anymore
            // with no Pocket button
            if (countContainerObjects === 0) { continue; }

            // Go through all button container and add the Pocket button
            for (var j = 0; j < countContainerObjects; j++) {
                var container = containerObjects[j];

                // If we already added the button to the tweet don't insert it again
                if (container.className.indexOf('pocket-inserted') !== -1) {
                    continue;
                }

                var $container = $(container);
                $container.addClass('pocket-inserted');

                // Get all links from the tweet text
                var links = buttonOption.links($container);

                // Add the pocket button only to tweets with links
                if (links.length === 0) { continue; }

                // Get stuff
                var tweetId = $container.parents('.tweet').attr('data-item-id');
                var pocketAction = buttonOption.create(tweetId, buttonOption.text, buttonOption.className);
                addActionHandler(pocketAction, buttonOption);

                // Append action to container
                $(buttonOption.after).each(function (index, value) {
                    var afterAction = $container.find(value);
                    if (afterAction.length > 0) {
                        afterAction.after(pocketAction);
                        return false; // Skip iteration
                    }
                });
            }
        }
    }

    // Initialization
    var twitterIntervalID;
    function setAddPocketButtonInterval() {
        // Don't add a twitter interval twice
        if (typeof twitterIntervalID === 'undefined') {
            // Call the function with no delay
            addPocketToTweets();
            // Start the interval
            twitterIntervalID = setInterval(addPocketToTweets, twitterOptions.refreshInterval);
        }
    }

    function removeAddPocketButtonInterval() {
        if (typeof twitterIntervalID !== 'undefined') {
            clearInterval(twitterIntervalID);
            twitterIntervalID = undefined;
        }
    }

    var twitterTimeoutID;
    function addScrollTimoutHandler() {
        // Clear the scroll timout as we don't want to fire while the user
        // still scrolling
        removeScrollTimoutHandler();

        // Add scroll timeout that will activate the scroll interval again if
        // the user finished scrolling
        twitterTimeoutID = setTimeout(function() {
            // After the user finished scrolling add Pocket button interval again
            setAddPocketButtonInterval();
        }, 500);
    }

    function removeScrollTimoutHandler() {
        if (typeof twitterTimeoutID !== 'undefined') {
            clearTimeout(twitterTimeoutID);
            twitterTimeoutID = undefined;
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

    function addPocketClass() {
        document.body.classList.add('pocket-twitter');
        setTimeout(addPocketClass, 2000);
    }
    function init() {

        // addMutationObserver();
        addPocketClass();

        // Set the interval to add Pocket buttons to Twitter
        setAddPocketButtonInterval();

        // Add scroll handler for adding Pocket buttons
        addScrollHandler();

        // Add visibility handler for removing timeouts if the tab is hidden
        addVisibilityHandler();
    }

    // Twitter activation via options page
    addMessageListener(function(request, sender, sendResponse) {
        if (request.action === "settingChanged" && request.key === "twitter") {
            if (request.value === "true" || request.value === true) {
                init();
            }
            else if (request.value === "false" || request.value === false) {
                // Remove interval to add the pocket links to tweets if the user deactivates
                // twitter integration
                removeScrollHandler();
                removeScrollTimoutHandler();
                removeAddPocketButtonInterval();
            }
        }
    });

    // Check if Twitter is activated on start
    sendMessage({action: "getSetting", key: "twitter"}, function(response) {
        if (response.value === "true" || response.value === true) {
            init();
        }
    });

});
