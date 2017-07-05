(function() {
    var config = {};
    config.refreshIntervall = 1000;
    config.buttons = [
        {
            // linkedin.com and linkedin.com/home
            text: "Pocket",
            successHTML: "<li><span><a>Saved to Pocket<a></span></li>",
            container: '.feed-actions',
            className: 'feed-pocket',
            selector: '.feed-pocket',
            after: '.feed-share',
            data: function (elem) {
                //var article = $(elem).parents('.feed-body').find('.feed-external-url');
                var article = $(elem).parents('.feed-body').find('.share-title').children('a');
                var url = $(article).attr('href').trim().split('?')[1].split('=')[1].split("&")[0];
                url = unescape(url);
                var title = $(article).text().trim();
                return {
                     text: title,
                      url: url
                };
            },
            createButton: function () {
                var a = document.createElement('a');
                a.setAttribute('href', '#');
                $(a).text(this.text);

                var span = document.createElement('span');
                span.appendChild(a);

                var li = document.createElement('li');
                li.setAttribute('class', this.className);
                li.appendChild(span);

                return li;
            }
        },
        {
            // linkedin.com/today
            text: "Pocket",
            successHTML: "<li class='social-gestures-save social-gestures-pocket'><a>Saved to Pocket</a></li>",
            container: '.social-gestures .flat-list',
            className: 'social-gestures-save social-gestures-pocket',
            selector: '.social-gestures-pocket',
            after: '.social-gestures-share',
            data: function (elem) {
                var article = $(elem).parents('.card').find('.card-title').children('a');
                var title = $(article).text().trim();
                var link = $(article).attr('href').trim();

                return {
                     text: title,
                      url: link
                };
            },
            createButton: function () {
                var a = document.createElement('a');
                a.setAttribute('href', '#');
                $(a).text(this.text);

                var li = document.createElement('li');
                li.setAttribute('class', this.className);
                li.appendChild(a);

                return li;
            }
        }
    ];

    var insertButtons = function () {
        var i, l = config.buttons.length;
        for (i = 0 ; i < l; i++ ) {
            var btnConfig = config.buttons[i];
            console.log();
            $(btnConfig.container).each(function () {
                var container = $(this);
                if ($(container).hasClass('pocket-inserted')) return;

                $(container).addClass('pocket-inserted');

                var btn = btnConfig.createButton();
                $(container).find(btnConfig.after).after(btn);

                var getData = btnConfig.data;

                $(btn).click(function clickCallback(e) {
                    var data = getData(btn);
                    var message = {
                        identifier: "linkedin",
                        action: "addURL",
                        url: data.url,
                        title: data.title,
                        actionInfo: {
                            cxt_ui: 'btn_linkedin',
                            cxt_url: window.location.href
                        }
                    };
                    sendMessage(message, function (response) {
                        if (response.status === "success") {
                            $(btn).replaceWith(btnConfig.successHTML);
                            document.body.style.cursor = "default";
                        }
                        // Success, Error message handling happens in the background.js
                    });
                    e.preventDefault();
                });
            });
        }
    };

    function initialize() {
        setInterval(function () {
            insertButtons();
        }, config.refreshInterval);
    }

        // Check if Twitter is activated
    sendMessage({action: "getSetting", key: "linkedin"}, function (response) {
        if (response.value === "true" || response.value === true) {
            initialize();
        }
    });

}());