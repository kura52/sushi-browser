// Google Plus
// Not maintained anymore
$(function() {
	var addURL = function(url, title, notificationId, target) {
		chrome.extension.sendMessage({action:"addURL", url:url, title:title}, function(response) {
			var $notification = $('#' + notificationId);
            var text = "saved!";
            var color = "green";
            if (response.status == "error") {
                text = "Did you login?";
                color = "red";
            };
            $notification.text(text);
            $notification.css({color:color});

            window.setTimeout(function() {
                $notification.remove();
                target.show();
            }, 2500);
		});
	};

    var init = function(){
        var setRILLinks = window.setInterval(function(){
            $elm = $('<span role="button" class="c-C rd-ril" tabindex="0">Pocket</span>');
            $('.vo:not(:has(span.rd-ril))').append("&nbsp;&nbsp;-&nbsp;&nbsp;").append($elm);
        }, 200);

        $('.rd-ril').live('click', function(event) {
            var $target = $(event.target);
            var $targetParents = $(this).parents();

            var url = 'https://plus.google.com/';
            url += $targetParents.find('.oj:first').attr('href');
            var title = $targetParents.find('div.rXnUBd:first').text();

            var notificationId = 'ril-notify-' + Math.floor(Math.random()*2);

            $target.after('<span id="' + notificationId + '" style="padding-left:5px;">Saving...</span>')
            $target.hide();
            addURL(url, title, notificationId, $target);
        });
    };

    chrome.extension.sendMessage({action:"getSetting", key:"gplus"}, function(response) {
        if (response.value === "true") {
            init();
        };
    });
});
