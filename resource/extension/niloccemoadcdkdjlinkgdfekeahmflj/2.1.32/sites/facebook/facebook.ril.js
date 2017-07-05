$(function() {

	var getElementsByClass = function(searchClass, node, tag){
		var classElements = new Array();
		if ( node == null )
			node = document;
		if ( tag == null )
			tag = '*';
		var els = node.getElementsByTagName(tag);
		var elsLen = els.length;
		var pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");
		for (i = 0, j = 0; i < elsLen; i++) {
			if ( pattern.test(els[i].className) ) {
				classElements[j] = els[i];
				j++;
			}
		}
		return classElements;
	};

	// Check for new entries and add there the Pocket link
	var getNewFormCommentable = function(){
		var facebookElements = new Array();
		facebookElementsTmp = getElementsByClass("commentable_item", null, "form");
		var pattern = new RegExp("(^|\\s)ril_updated(\\s|$)");
		for (infc = 0, jnfc = 0; infc < facebookElementsTmp.length; infc++){
			if (!pattern.test(facebookElementsTmp[infc].className)){
				var like_link = getElementsByClass('like_link', facebookElementsTmp[infc]);
				if (like_link.length > 0) {
					facebookElements[jnfc] = facebookElementsTmp[infc];
					jnfc++;
				}
			}
		}
		return facebookElements;
	};

	var getFacebookElementId = function(facebookElement){
		var infosElement = JSON.parse(facebookElement.elements.namedItem("feedback_params").getAttribute('value'));
		return infosElement.target_fbid;
	};

	var setRILLinks = function(facebookElements){
		var arrayId = new Array();
		for (indexdl = 0; indexdl < facebookElements.length; indexdl++)
		{
			/*var linkObject = facebookElements[indexdl];
			//alert(linkObject.parentNode.querySelector('.uiAttachmentTitle'));
			if (linkObject.parentNode.querySelector('.uiAttachmentTitle'))
				linkObject = linkObject.parentNode.querySelector('.uiAttachmentTitle').querySelector('a').href;
			else {
				linkObject = getElementsByClass('uiStreamSource', facebookElements[indexdl])[0];
				linkObject = linkObject.querySelector('a').href;
			}*/


			var like_link = getElementsByClass('like_link', facebookElements[indexdl])[0];

			//var timestamp = getElementsByClass('uiStreamSource', facebookElements[indexdl])[0];
			//var linkinfos = facebookElements[indexdl].parentNode.parentNode.parentNode.parentNode.querySelector('.uiAttachmentTitle');


			if (like_link) {
				var elementId = getFacebookElementId(facebookElements[indexdl]);
				arrayId[indexdl] = elementId;
				var link = document.createElement('div');
				link.setAttribute('style', 'display:inline');
				link.innerHTML = ' · <a href="#">Pocket</a>'
				like_link.parentNode.insertBefore(link, like_link.nextSibling);

				facebookElements[indexdl].setAttribute('class', facebookElements[indexdl].getAttribute('class', false)+' ril_updated', false);

				$(link).click(function() {
					alert("Pocket");
					return false;
				});
			}
		}

		return arrayId;
	};



	var init = function(){
		var newElements = getNewFormCommentable();
		if (newElements.length> 0) {
			var arrayElementId = new Array();
			arrayElementId = setRILLinks(newElements);
		}
	};

	chrome.extension.sendRequest({action:"getSetting", key:"facebook"}, function(response) {
		if (response.value === "true") {
			setInterval(init, 500);
		};
	});
});