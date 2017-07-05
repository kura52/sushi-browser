(function() {

    if (isSafari() && window.top != window) return;

    // Localization
    var i18n = {
        "en": {
            "button_text": "save to pocket",
            "success_saved_text": "saved to pocket"
        },
        "de" : {
            "button_text" : "in pocket speichern",
            "success_saved_text" : "in pocket gespeichert"
        },
        "es" : {
            "button_text" : "guardar en pocket",
            "success_saved_text" : "guardado en pocket"
        },
        "es_419" : {
            "button_text" : "guardar en pocket",
            "success_saved_text" : "guardado en pocket"
        },
        "fr" : {
            "button_text" : "sauvegarder dans Pocket",
            "success_saved_text" : "sauvegardé dans Pocket"
        },
        "it" : {
            "button_text" : "salva in pocket",
            "success_saved_text" : "salvato in Pocket"
        },
        "ja" : {
            "button_text" : "pocket に保存",
            "success_saved_text" : "pocket に保存済み"
        },
        "ru" : {
            "button_text" : "сохранить в pocket",
            "success_saved_text" : "сохранены в pocket"
        },
        "ko" : {
          "button_text" : "Pocket에 저장",
          "success_saved_text" : "이(가) Pocket에 저장됨"
        },
        "nl" : {
          "button_text" : "opslaan naar pocket",
          "success_saved_text" : "opgeslagen naar pocket"
        },
        "pl" : {
          "button_text" : "zapisz do pocket",
          "success_saved_text" : "zapisano w aplikacji pocket"
        },
        "pt_BR" : {
          "button_text" : "Salvar no Pocket",
          "success_saved_text" : "Salvo no Pocket"
        },
        "pt_PT" : {
          "button_text" : "guardar no pocket",
          "success_saved_text" : "guardado no Pocket"
        },
        "zh_CN" : {
          "button_text" : "保存到 Pocket",
          "success_saved_text" : "已保存到 Pocket"
        },
        "zh_TW" : {
          "button_text" : "儲存到 Pocket",
          "success_saved_text" : "已儲存到 Pocket"
        }
    };

    var config = {};
    config.base = "http://news.ycombinator.org/";
    config.buttons = [
        {
            text: i18n[getCurrentLanguageCode()]['button_text'],
            successText: i18n[getCurrentLanguageCode()]['success_saved_text'],
            container: 'td.subtext',
            className: 'pocket-hn-button',
            selector: '.pocket-hn-button',
            data: function (elem) {
                var article = $(elem).parents('tr').prev('tr').find('.title').children('a');
                var title = $(article).text().trim();
                var href = $(article).attr('href').trim();

                // Resolve links that are self post like http://news.ycombinator.com/item?id=5239673
                // that has the href: item?id=5239673
                var link = resolveURL(href, config.base);

                return {title: title, url: link};
            }
        }
    ];

    var createButton = function (btnConfig) {
        var a = document.createElement('a');
        a.setAttribute('class', btnConfig.className);
        a.setAttribute('href', '#');
        $(a).text(btnConfig.text);
        return a;
    };

    var insertButtons = function () {
        var i, l=config.buttons.length;
        for (i = 0 ; i < l; i++ ) {

            var btnConfig = config.buttons[i];

            $(btnConfig.container).each(function () {

                var container = $(this);

                if ( $(container).hasClass('pocket-inserted') ) return;

                $(container).addClass('pocket-inserted');

                var btn = createButton(btnConfig);
                $(container).append(btn);
                $(btn).before(' | ');

                var getData = btnConfig.data;

                $(btn).on('click', function clickCallback(e) {
                    var data = getData(btn);
                    var message = {
                        identifier: "hackernews",
                        action: "addURL",
                        url: data.url,
                        title: data.title,
                        actionInfo: {
                            cxt_ui: 'btn_hackernews',
                            cxt_url: window.location.href
                        }
                    };
                    sendMessage(message, function (response) {
                        if (response.status === "success") {
                            $(btn).replaceWith($('<span>' + btnConfig.successText + '</span>'));
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

    // Hackernews activation via options page
    addMessageListener(function(request, sender, sendResponse) {
        if (request.action === "settingChanged" && request.key === "hackernews") {
            if (request.value === "true" || request.value === true) {
                insertButtons();
            }
        }
    });

    // Check if Hackernews is activated on start
    sendMessage({action: "getSetting", key: "hackernews"}, function(response) {
        if (response.value === "true" || response.value === true) {
            insertButtons();
        }
    });

}());