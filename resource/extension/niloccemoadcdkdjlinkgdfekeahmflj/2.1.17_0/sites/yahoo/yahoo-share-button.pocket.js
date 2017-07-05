(function() {

    var $socialButtons = $(".social-buttons");
    if ($socialButtons.length === 0) {
        return;
    }


    var insertedPocketButton = function() {
        var shareButtonsContainer = $(".yui3-ymsb").children()[0];
        return $(shareButtonsContainer).hasClass("ymsb-pocket");
    };

    var executePocketButtonCode = function() {
        $("#pocket-btn-js").remove()
        !function(d,i){if(!d.getElementById(i)){var j=d.createElement("script");j.id=i;j.src="https://widgets.getpocket.com/v1/j/btn.js?v=1";var w=d.getElementById(i);d.body.appendChild(j);}}(document,"pocket-btn-js");
    };

    var init = function() {
        // Add css
        $('head').append('<style>' +
            '.yui3-ymsb-content .ymsb-module {' +
                'margin-right: 5px !important;' +
            '}' +
            '' +
            '.ymsb-mail-module a span {' +
                'font-size: 0;' +
            '}' +
            '' +
            '.ymsb-googleplus-module {' +
                'width: 60px !important;' +
            '}' +
            '' +
            '.ymsb-retweet-module {' +
                'width: 100px !important;' +
            '}' +
            '' +
            '.ymsb-print-module a span {' +
                'font-size: 0;' +
            '}' +
            '' +
            '.twttr-static-module {' +
                'width: 100px !important;' +
            '}' +
            '' +
            '.gplus-static {' +
                'width: 50px !important;' +
            '}' +
            '' +
            '.ymsb-pocket-module {' +
                'margin-top: 4px !important;' +
                'width: 100px !important;' +
        '}</style>');

        // First inject the button on load first load
        var $pocketModule = $('<li class="ymsb-module ymsb-pocket-module lang-en-US"><a data-pocket-label="pocket" data-pocket-count="horizontal" class="pocket-btn" data-lang="en"></a></li>');
        $(".gplus-static").after($pocketModule);
        executePocketButtonCode();


        // After mouseover the share widgets load again ... so load the Pocket button again
        $socialButtons.mouseover(function() {
            // Check if we already inserted the Pocket button
            if (insertedPocketButton()) {
                return;
            }

            // The container will be replaced completly after the mouseover and the Pocket
            // button was not inserted so we have to have a timeout to push the adding
            // of the pocket button a bit later
            setTimeout(function() {
                // Check if we inserted it after the timeout
                if (insertedPocketButton()) {
                    return;
                }

                // Add the Pocket button after the Google Plus button
                var $pocketModule = $('<li class="ymsb-module ymsb-pocket-module lang-en-US"><a data-pocket-label="pocket" data-pocket-count="horizontal" class="pocket-btn" data-lang="en"></a></li>');
                $(".ymsb-googleplus-module").after($pocketModule);

                // Add class to prevent adding the Pocket button again
                var shareButtonsContainer = $(".yui3-ymsb").children()[0];
                $(shareButtonsContainer).addClass("ymsb-pocket");

                // Execute the js code to load and initialize the Pocket button
                executePocketButtonCode();
            }, 0);
        });
    };

    // Check if Yahoo is activated
    sendMessage({action: "getSetting", key: "yahoo"}, function (response) {
        if (response.value === "true" || response.value === true) {
            init();
        }
    });

}());