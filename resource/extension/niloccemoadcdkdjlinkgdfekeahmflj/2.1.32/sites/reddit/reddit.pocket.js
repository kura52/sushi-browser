(function () {

    if (isSafari() && window.top != window) return;

    // Localization
    var i18n = {
        "en" : {
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

    // Module
    var BASE_URL = "http://www.reddit.com/";

    $('head').append('<style>.pkt_added {text-decoration:none !important;}</style>');

    var config = {};
    config.buttons = [
        {
            text: "pocket",
            successText: i18n[getCurrentLanguageCode()]['success_saved_text'],
            container: 'div.entry ul.flat-list',
            className: 'pocket-reddit-button',
            selector: '.pocket-reddit-button',
            data: function (elem) {
                var article = $(elem).closest('.entry').find('a.title');
                if (article === undefined || article.length === 0) {
                    // No title it has to be a comment
                    article = $(elem).closest('.entry').find(".first a");
                }
                var title = $(article).text().trim();
                var link = $(article).attr('href').trim();
                link = resolveURL(link, BASE_URL);

                return {title: title, url: link};
            }
        }
    ];

    var createButton = function (btnConfig) {
        var a = document.createElement('a');
        a.setAttribute('class', btnConfig.className);
        a.setAttribute('href', '#');
        $(a).text(btnConfig.text);

        var li = document.createElement('li');
        li.appendChild(a);

        return li;
    };

    var insertButtons = function () {

        var l = config.buttons.length;
        var i;
        for (i = 0 ; i < l; i++) {

            var btnConfig = config.buttons[i];

            $(btnConfig.container).each(function() {

                var container = $(this);

                if ( $(container).hasClass('pocket-inserted') ) return;

                // We don't wanna add pocket links to "load more comments" entries
                var $moreComments = $(container).parent().children(".morecomments");
                if ( $moreComments.length !== 0) {
                    var $moreCommentLinks = $moreComments.children("a");
                    $moreCommentLinks.click(function () {
                        // After clicking the "More comment links" insert pocket into the new links
                        setTimeout(function () {
                            insertButtons();
                        }, 1000);
                    });
                    return;
                }

                $(container).addClass('pocket-inserted');

                var btn = createButton(btnConfig);

                $(container).append(btn);

                var getData = btnConfig.data;

                $(btn).on('click', function(e) {
                    var data = getData(btn);
                    var message = {
                        identifier: "reddit",
                        action: "addURL",
                        url: data.url,
                        title: data.title,
                        actionInfo: {
                            cxt_ui: 'btn_reddit',
                            cxt_url: window.location.href
                        }
                    };
                    sendMessage(message, function (response) {
                        if (response.status === "success") {
                            $(btn).replaceWith($('<li><a class="' + btnConfig.className + ' pkt_added">' + btnConfig.successText  + '</a></li>'));
                            document.body.style.cursor = "default";
                        }

                        // Success, Error message handling happens in the background.js
                    });
                    e.preventDefault();
                });
            });
        }
    };


    // Helper methods
    var resolveURL = function (url, base_url) {
        if (/^https?:/.test(url)) return url; // url is already absolute

        var doc = document,
        old_base = doc.getElementsByTagName('base')[0],
        old_href = old_base && old_base.href,
        doc_head = doc.head || doc.getElementsByTagName('head')[0],
        our_base = old_base || doc_head.appendChild(doc.createElement('base')),
        resolver = doc.createElement('a'),
        resolved_url;
        our_base.href = base_url;
        resolver.href = url;
        resolved_url  = resolver.href; // browser magic at work here

        if (old_base) old_base.href = old_href;
        else doc_head.removeChild(our_base);
        return resolved_url;
    };


    // Reddit activation via options page
    addMessageListener(function(request, sender, sendResponse) {
        if (request.action === "settingChanged" && request.key === "reddit") {
            if (request.value === "true" || request.value === true) {
                insertButtons();
            }
        }
    });

    // Check if Reddit is activated on start
    sendMessage({action: "getSetting", key: "reddit"}, function(response) {
        if (response.value === "true" || response.value === true) {
            insertButtons();
        }
    });

}());