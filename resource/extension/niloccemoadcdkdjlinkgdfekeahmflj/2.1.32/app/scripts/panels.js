'use strict';

// Errors

(function (PKT_EXT) {

    var errorContainer = void 0,
        mouseInside = void 0,
        closeValid = void 0,
        hasFocus = void 0,
        autocloseTimer = void 0,
        mainContainer = void 0,
        initalPosition = void 0,
        interfaceBuilt = void 0,
        optionPremium = void 0,
        optionRecs = void 0,
        isLocal = void 0;

    /*====================================
    =            Close Timing            =
    ====================================*/

    var startScrollCloseTimer = function startScrollCloseTimer() {
        var distanceScrolled = Math.abs($(document).scrollTop() - initalPosition);
        if (distanceScrolled < 100 || mouseInside) return;
        window.removeEventListener('scroll', startScrollCloseTimer);
        startCloseTimer(500);
    };

    var startCloseTimer = function startCloseTimer(manualtime) {

        PKT_EXT.TIMER.start({
            elapsed: manualtime,
            onEnd: closeError
        });
    };

    var stopCloseTimer = function stopCloseTimer() {
        PKT_EXT.TIMER.stop();
    };

    var closeError = function closeError() {
        stopCloseTimer();
        var main = $(mainContainer);
        if (main && main.length) main.addClass('pkt_ext_error_inactive');
    };

    /*====================================
    =            Initializers            =
    ====================================*/

    var initAutoCloseEvents = function initAutoCloseEvents() {
        var wrapper = $(errorContainer);
        initalPosition = $(document).scrollTop();

        window.addEventListener('scroll', startScrollCloseTimer);

        wrapper.off();
        wrapper.on('mouseenter', function () {
            mouseInside = true;
            stopCloseTimer();
        }).on('mouseleave', function () {
            mouseInside = false;
            startCloseTimer();
        });

        startCloseTimer(4000);
    };

    var init = function init(title, message) {

        // Check if we are local // Move this to an interface.
        isLocal = document.location.hostname === 'localhost';

        mainContainer = document.createElement('div');
        mainContainer.id = 'pkt_ext_master';
        mainContainer.className = 'pkt_ext_container pkt_ext_error_inactive pkt_ext_container_inactive';

        document.body.appendChild(mainContainer);

        errorContainer = document.createElement('div');
        errorContainer.id = 'pkt_ext_error_plate';

        mainContainer.appendChild(errorContainer);

        interfaceBuilt = true;

        showError(title, message);
    };

    /*===============================
    =            Actions            =
    ===============================*/

    var showError = function showError(title, message) {
        errorContainer.innerHTML = PKT_EXT.TEMPLATES.error({ "title": title, "message": message });

        setTimeout(function () {
            // So Greasy. Timeouts can suck it.  Required to allow css animations to trigger.
            mainContainer.classList.remove('pkt_ext_error_inactive');
            initAutoCloseEvents(mainContainer);
        }, 100);
    };

    var saveError = function saveError(title, message) {

        if (!interfaceBuilt) init(title, message);else showError(title, message);
    };

    PKT_EXT.ERROR = { saveError: saveError, closeError: closeError };
})(PKT_EXT || {});

/* global $, Q, OpenAdViewability, log */
// Recs
(function (PKT_EXT) {

    // log.setLevel('DEBUG')

    var recContainer = void 0,
        recList = void 0,
        recLoaded = void 0,
        loadThrottle = void 0,
        cachedRecs = 0;

    var sendMessage = PKT_EXT.INTERFACE.sendMessage;

    var domainForURL = function domainForURL(url) {
        var domainMatch = /\/\/([^\/]*)/.exec(url);
        return domainMatch ? domainMatch[1].replace(/^www\./, '') : false;
    };

    var init = function init(options) {
        recContainer = document.getElementById(options.recContainerName);
        recLoaded = options.recLoaded || null;

        if (!recContainer) return;

        recContainer.innerHTML = PKT_EXT.TEMPLATES.recommend({ loading: PKT_EXT.TRANS['loading_recommendations'] });
        recList = document.getElementById(options.recListName);
    };

    var loadRecs = function loadRecs(recID) {
        if (cachedRecs === recID) {
            recContainer.classList.add('pkt_ext_rec_active');
            showRecs();
            return;
        }

        cachedRecs = recID;
        recContainer.children[0].classList.remove('pkt_ext_loaded');
        recContainer.classList.add('pkt_ext_rec_active');
        loadThrottle = Date.now() + 1000;

        getRecs(recID).timeout(5000).then(function (result) {
            buildRecs(result, recID);
        }, function () {
            sendTimeout(recID);
            setNoRecs();
        });
    };

    var sendTimeout = function sendTimeout(recID) {
        var message = {
            action: 'timeoutRec',
            source_id: recID
        };
        sendMessage(message, function () {});
    };

    var getRecs = function getRecs(recID) {
        var recs = Q.defer();
        sendMessage({
            action: 'getRecommendation',
            item_id: recID
        }, function (responseList) {
            if (responseList.status == 'success') recs.resolve(responseList);else recs.reject('No recs');
        });

        return recs.promise;
    };

    var buildRecs = function buildRecs(response, sourceID) {
        $('.pkt_ext_rec_save').off();
        $('#pkt_ext_close_recommendations').off();
        var spoc = void 0;
        var listArray = Object.keys(response.data.feed).map(function (key) {
            var currentItem = response.data.feed[key];
            currentItem.source_id = sourceID;
            currentItem.item.domain = domainForURL(currentItem.item.resolved_url);

            if (currentItem.item.has_image == 1) {

                if (currentItem.item.images instanceof Array) {
                    currentItem.item.has_image = 0;
                } else {
                    var image_key = Object.keys(currentItem.item.images)[0];
                    currentItem.item.image_src = currentItem.item.images[image_key].src;
                }
            }

            currentItem.item.rec_url = currentItem.item.given_url || currentItem.item.resolved_url;

            if (currentItem.impression_info) {
                currentItem.sponsorurl = currentItem.post.profile.username;
                currentItem.sponsor = currentItem.post.profile.name;
                currentItem.avatar = currentItem.post.profile.avatar_url;
                currentItem.item.has_image = true;
                currentItem.item.domain = currentItem.impression_info.display.domain;
                currentItem.item.image_src = currentItem.impression_info.display.image.src;
                currentItem.item.impression_id = currentItem.impression_info.impression_id;
                spoc = currentItem;
            }
            return currentItem;
        }).sort(function (a, b) {
            return a.sort_id - b.sort_id;
        });

        if (!listArray.length) {
            return setNoRecs();
        }

        // response.data.feed[imageIndex].item.image.src = 'http://img.readitlater.com/direct?url='+encodeURI(responseList.data.feed[imageIndex].item.image.src) +'&resize=w70-h100';
        response.data.feed = listArray.slice(0, 3);
        response.data.more = response.data.reason ? PKT_EXT.TRANS['more_on'] + ' ' : PKT_EXT.TRANS['explore_recommendations'];
        recList.innerHTML = PKT_EXT.TEMPLATES.recommendList(response.data);

        checkImages();
        showRecs();
        setActions();
        if (spoc) {
            setSpocActions(spoc);
        }
    };

    var checkImages = function checkImages() {
        $('.pkt_ext_rec_image').each(function (index, rec) {
            var testImage = document.createElement('img');
            $(testImage).on('load', function () {}).on('error', function () {
                unsetImages(rec);
            }).attr('src', $(rec).data('imgsrc'));
        });
    };

    var unsetImages = function unsetImages(rec) {
        var item = $(rec);
        item.parent().removeClass('pkt_ext_has_image');
        item.remove();
    };

    var setNoRecs = function setNoRecs() {
        recList.innerHTML = PKT_EXT.TEMPLATES.recommendNoResults({
            noresponse: 'Want to find more great stories?',
            explore_recs: PKT_EXT.TRANS['explore_recommendations'] });
        setActions();
        showRecs();
    };

    var setSpocActions = function setSpocActions(spoc) {

        var context = {
            action: 'sp_impression_loaded',
            cxt_impression_id: spoc.impression_info.impression_id,
            cxt_view: 'extension_ad',
            cxt_feed_item: spoc.feed_item_id,
            cxt_index: spoc.sort_id
        };
        if (spoc.post.post_id) {
            context.cxt_post_id = spoc.post.post_id;
        }

        var spocItem = $('#pkt_ext_spoc');
        //Impressioned
        sendMessage({
            action: 'itemAction',
            data: context
        });

        //Viewable
        var oav = new OpenAdViewability();
        oav.checkViewability(spocItem[0], function (check) {
            if (check.viewabiltyStatus) {
                context.action = 'sp_impression_viewed';
                sendMessage({
                    action: 'itemAction',
                    data: context
                });
            }
        });

        //Clicked
        spocItem.parent().find('.pkt_ext_rec_open').on('click', function () {
            context.action = 'sp_impression_clicked';
            sendMessage({
                action: 'itemAction',
                data: context
            });
        });

        // User interactions
        $('#pkt_ext_spoc_label').on('click', function (e) {
            e.preventDefault();
            var dropdown = $('.pkt_ext_spoc_dropdown');
            dropdown.toggleClass('pkt_ext_drop_active');
            dropdown.on('mouseleave', function () {
                hideDropdown();
            });
        });

        $('#pkt_ext_spoc_hide_this').on('click', function (e) {
            e.preventDefault();
            $(this).closest('.pkt_ext_recommendation').remove();
        });
    };

    var setActions = function setActions() {
        $('.pkt_ext_rec_save').on('click', function (e) {
            e.preventDefault();
            var recSave = $(this);
            var rec = recSave.closest('.pkt_ext_recommendation');
            var message = {
                action: "addRecURL",
                item_id: rec.attr('rec_id'),
                url: rec.attr('rec_url'),
                title: rec.attr('rec_title'),
                source_id: rec.attr('rec_source'),
                position: parseInt(rec.attr('rec_position'), 10)
            };

            if (rec.attr('impression_id')) {
                message.cxt_impression_id = rec.attr('impression_id');
            }

            if (recSave.hasClass('saved')) {
                sendMessage({
                    action: "removeURL",
                    item_id: rec.attr('rec_id')
                }, function (response) {
                    if (response.status == 'success') {
                        recSave.removeClass('saved');
                        recSave.find('.pkt_ext_save_copy').text(PKT_EXT.TRANS['save']);
                    }
                });
            } else {
                sendMessage(message, function (response) {
                    if (response.status == 'success') {
                        recSave.addClass('saved');
                        recSave.find('.pkt_ext_save_copy').text('Saved');
                    } else if (response.status == 'error') {}
                });
            }
        });

        $('.pkt_ext_rec_open').on('click', function (e) {
            var rec = $(this).closest('.pkt_ext_recommendation');
            var message = {
                action: "openRec",
                item_id: rec.attr('rec_id'),
                url: rec.attr('rec_url'),
                title: rec.attr('rec_title'),
                source_id: rec.attr('rec_source'),
                position: parseInt(rec.attr('rec_position'), 10)
            };
            sendMessage(message, function (response) {});
        });

        $('#pkt_ext_close_recommendations').on('click', function (e) {
            e.preventDefault();
            recContainer.classList.remove('pkt_ext_rec_active');
        });
    };

    var hideDropdown = function hideDropdown() {
        $('.pkt_ext_spoc_dropdown').removeClass('pkt_ext_drop_active');
    };

    var showRecs = function showRecs() {
        var rightnow = Date.now();

        if (rightnow <= self.loadThrottle) {
            finalizeLoading();
        } else {
            setTimeout(finalizeLoading, loadThrottle - rightnow);
        }
    };

    var clearRecs = function clearRecs() {
        recContainer.classList.remove('pkt_ext_rec_active');
        hideDropdown();
    };

    var finalizeLoading = function finalizeLoading() {
        recContainer.children[0].classList.add('pkt_ext_loaded');
        if (recLoaded) recLoaded(10000);
    };

    PKT_EXT.SAVERECS = { init: init, loadRecs: loadRecs, clearRecs: clearRecs };
})(PKT_EXT || {});

/* globals $, PKT_EXT, log */
// Save
(function (PKT_EXT) {

    var saveContainer = void 0,
        mouseInside = void 0,
        closeValid = void 0,
        autocloseTimer = void 0,
        mainContainer = void 0,
        initalPosition = void 0,
        interfaceBuilt = void 0,
        optionPremium = void 0,
        optionRecs = void 0,
        optionSuggestions = void 0,
        isActive = void 0,
        isLocal = void 0,
        localeCopy = void 0;

    /*====================================
    =            Close Timing            =
    ====================================*/

    var startScrollCloseTimer = function startScrollCloseTimer() {
        var distanceScrolled = Math.abs($(document).scrollTop() - initalPosition);
        if (distanceScrolled < 100 || mouseInside) return;
        window.removeEventListener('scroll', startScrollCloseTimer);
        startCloseTimer(500);
    };

    var startCloseTimer = function startCloseTimer(manualtime) {

        PKT_EXT.TIMER.start({
            elapsed: manualtime,
            onEnd: closeSave
            // panel: '.pkt_ext_component_save:hover',
            // container: (optionRecs) ? document.querySelector('.pkt_ext_timer_container') : null
        });
    };

    var stopCloseTimer = function stopCloseTimer() {
        PKT_EXT.TIMER.stop();
    };

    var closeSave = function closeSave(force) {

        if ($('.pkt_ext_component_save:hover').length !== 0 && !force) return;

        stopCloseTimer();
        isActive = false;
        var main = $(mainContainer);
        if (main && main.length) main.addClass('pkt_ext_container_inactive');

        if (optionRecs) PKT_EXT.SAVERECS.clearRecs();
    };

    /*====================================
    =            Initializers            =
    ====================================*/

    var initAutoCloseEvents = function initAutoCloseEvents(time) {

        var delay = time || 4000;
        var wrapper = $('.pkt_ext_component_save');
        initalPosition = $(document).scrollTop();

        window.addEventListener('scroll', startScrollCloseTimer);

        wrapper.off();
        wrapper.on('mouseenter', function () {
            mouseInside = true;
            stopCloseTimer();
        }).on('mouseleave', function () {
            mouseInside = false;
            startCloseTimer();
        }).on('click', function () {
            closeValid = false;
        });

        var tagInput = $(PKT_EXT.TAGGING.getInput());

        tagInput.focus(function () {
            PKT_EXT.TIMER.setForce(true);
            stopCloseTimer();
        });

        tagInput.blur(function () {
            PKT_EXT.TIMER.setForce(false);
            if (!mouseInside) startCloseTimer();
        });

        startCloseTimer(delay);
    };

    var init = function init(urlToSave, itemID, features, saveType) {

        log.debug('Initializing: Save');

        // Check if we are local // Move this to an interface.
        // isLocal                 = (document.location.hostname == "localhost")

        mainContainer = document.createElement('div');
        mainContainer.id = 'pkt_ext_master';
        mainContainer.className = 'pkt_ext_container pkt_ext_container_inactive';
        document.body.appendChild(mainContainer);

        saveContainer = document.createElement('div');
        saveContainer.id = 'pkt_ext_save_plate';
        saveContainer.innerHTML = PKT_EXT.TEMPLATES.save(PKT_EXT.TRANS);

        mainContainer.appendChild(saveContainer);

        PKT_EXT.TOOLBAR.init({
            closePanel: closeSave
        });

        optionPremium = features && features.premstatus;
        optionSuggestions = features && features.suggestions;
        optionRecs = features && features.recs;

        PKT_EXT.TAGGING.init({
            containerName: 'pkt_ext_tag_input_wrapper',
            listContainerName: 'pkt_ext_suggested_tags',
            saveButtonName: '',
            placeholder: PKT_EXT.TRANS['add_tags'],
            closePanel: closeSave
        });

        if (optionRecs) {
            PKT_EXT.SAVERECS.init({
                recContainerName: 'pkt_ext_save_recs',
                recListName: 'pkt_ext_recommendations_list',
                recLoaded: initAutoCloseEvents // () => {}
            });
        } else {
            initAutoCloseEvents(5000);
        }

        interfaceBuilt = true;
        showSave(urlToSave, itemID, saveType);
    };

    /*===============================
    =            Actions            =
    ===============================*/

    var showSave = function showSave(urlToSave, itemID, saveType) {

        log.debug('Show Saves', saveType);

        // let toolbarMessage = (isActive) ? PKT_EXT.TRANS['another'] + PKT_EXT.TRANS[saveType + '_saved'] : PKT_EXT.TRANS[saveType + '_saved']
        var toolbarMessage = PKT_EXT.TRANS['page_saved'];
        PKT_EXT.TOOLBAR.setMessage(toolbarMessage);
        PKT_EXT.TOOLBAR.setItemId(itemID);
        PKT_EXT.TAGGING.setURL(urlToSave);

        if (optionPremium && optionSuggestions) PKT_EXT.TAGGING.getSuggestions(urlToSave);
        if (optionRecs) PKT_EXT.SAVERECS.loadRecs(itemID);

        mainContainer.classList.remove('pkt_ext_container_inactive');
        isActive = true;
    };

    var saveURL = function saveURL(urlToSave, itemID, features, saveType) {

        log.debug('Save URL', interfaceBuilt);

        if (!interfaceBuilt) {
            init(urlToSave, itemID, features, saveType);
        } else {
            showSave(urlToSave, itemID, saveType);
        }
    };

    PKT_EXT.SAVE = { saveURL: saveURL, closeSave: closeSave };
})(PKT_EXT || {});

/*global module */
var PKT_EXT = PKT_EXT || {};

// Timer
(function (PKT_EXT) {

    var timer = void 0,
        timerBar = void 0,
        duration = void 0,
        container = void 0,
        panel = void 0,
        force = void 0,
        onEnd = void 0;

    /*====================================
    =            Close Timing            =
    ====================================*/

    var start = function start(optionObect) {
        stop();

        var options = optionObect || {};
        duration = options.elapsed ? options.elapsed : 1000;
        onEnd = options.onEnd || false;
        container = options.container || null;
        panel = options.panel || null;

        return begin();
    };

    var begin = function begin() {

        timer = setTimeout(function () {
            end();
        }, duration);

        return container ? render() : '';
    };

    var stop = function stop() {
        clearTimeout(timer);
        if (timerBar) timerBar.parentElement.classList.add('pkt_ext_timer_paused');
    };

    var end = function end() {
        if (!force) {
            clearTimeout(timer);
            if (container) container.innerHTML = '';
            if (onEnd) onEnd();
        }
    };

    var setForce = function setForce(bool) {
        force = bool ? 1 : 0;
    };

    var render = function render() {

        if (duration <= 1000 || document.querySelector(panel)) return container.innerHTML = '';

        container.innerHTML = PKT_EXT.TEMPLATES.timer({ 'duration': duration });
        timerBar = document.querySelector('.pkt_ext_timer_progress');
        window.getComputedStyle(timerBar).width;

        timerBar.classList.add('pkt_ext_timer_active');
        return container;
    };

    PKT_EXT.TIMER = { start: start, stop: stop, render: render, setForce: setForce };
})(PKT_EXT || {});

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = PKT_EXT.TIMER;
}

/* global PKT_EXT, Q, autoComplete*/
// Tagging
(function (PKT_EXT, taglib) {

    var container = void 0,
        listContainer = void 0,
        saveButton = void 0,
        taggleList = void 0,
        tagObject = void 0,
        actionCopy = void 0,
        cachedURL = void 0,
        noTags = void 0,
        currentURL = void 0,
        tagAutocomplete = void 0,
        closePanel = void 0,
        cleanState = [],
        suggestedList = [],
        autoCompleteList = [],
        activeTags = [],
        savedTags = [],
        activeTagElements = {};

    /*----------  Utilities <SHOULD BE MOVED>  ----------*/

    var sendMessage = PKT_EXT.INTERFACE.sendMessage;

    /*----------  Tag Actions  ----------*/

    var addAction = function addAction(el) {
        return el.addEventListener('click', function () {
            return tagObject.add(el.textContent);
        });
    };
    var removeAction = function removeAction(el) {
        return el.removeEventListener('click', function () {
            return tagObject.add(el.textContent);
        });
    };

    /*----------  Getting Tags  ----------*/
    var getSuggestions = function getSuggestions(urlSaved) {
        if (cachedURL === urlSaved) return;
        getSuggestionList(urlSaved).timeout(5000).then(function (suggestions) {
            return suggestionListBuild(suggestions);
        }, function () {
            return suggestionListBuild();
        });
    };
    var getSuggestionList = function getSuggestionList(urlSaved) {

        var suggestions = Q.defer();
        sendMessage({
            action: 'getSuggestedTags',
            url: urlSaved
        }, function (response) {
            if (response.status == 'success') suggestions.resolve(response.value.suggestedTags);else suggestions.resolve();
        });

        return suggestions.promise;
    };

    var getUserTags = function getUserTags() {
        var tags = Q.defer();
        sendMessage({ action: 'getTags' }, function (response) {
            if (response.value && response.value.tags.length) tags.resolve(response.value.tags);else tags.reject();
        });
        return tags.promise;
    };

    /*----------  Saving Tags  ----------*/

    var saveUserTags = function saveUserTags() {

        sendMessage({
            action: 'addTags',
            url: currentURL,
            tags: tagObject.getTagValues(),
            analytics: {
                cxt_suggested_available: 0,
                cxt_entered: 0,
                cxt_suggested: 0,
                cxt_removed: 0
            }
        }, function (response) {
            if (response.status == 'success') {
                setSaveComplete();
            } else if (response.status == 'error') {
                setSaveFail();
            }
        });
    };
    var editUserTags = function editUserTags() {

        sendMessage({
            action: 'editTags',
            url: currentURL,
            tags: tagObject.getTagValues(),
            analytics: {
                cxt_suggested_available: 0,
                cxt_entered: 0,
                cxt_suggested: 0,
                cxt_removed: 0
            }
        }, function (response) {
            if (response.status == 'success') {
                setSaveComplete();
            } else if (response.status == 'error') {
                setSaveFail();
            }
        });
    };
    var setSaveFail = function setSaveFail() {
        setTimeout(function () {
            return taggleList.classList.remove('saving');
        }, 500);
        actionCopy.innerHTML = 'Tags Save Error';
    };
    var setSaveComplete = function setSaveComplete() {
        setTimeout(function () {
            return taggleList.classList.remove('saving');
        }, 500);
        actionCopy.innerHTML = 'Tags Saved';
    };
    var setURL = function setURL(urlToSave) {
        clearTags();
        currentURL = urlToSave;
    };

    /*----------  Manipulating Tags  ----------*/

    var clearTags = function clearTags() {
        if (tagObject) tagObject.removeAll();
    };

    var suggestionAdd = function suggestionAdd(suggestion) {
        var el = document.createElement('li');
        el.innerText = suggestion;

        addAction(el);
        activeTagElements[suggestion] = el;
        listContainer.appendChild(el);
    };
    var suggestionRemove = function suggestionRemove(suggestion) {

        if (activeTagElements[suggestion] !== undefined) {
            var el = activeTagElements[suggestion];
            removeAction(el);

            el.parentNode.removeChild(el);
            delete activeTagElements[suggestion];
        }
    };
    var suggestionListBuild = function suggestionListBuild(listItems) {
        suggestionListClear();
        if (!listItems || !listItems.length) {
            noTags.innerHTML = PKT_EXT.TRANS['tags_suggested_empty'];
            noTags.classList.add('active');
            return;
        }

        suggestedList = listItems.map(function (item) {
            return item.tag;
        }).sort(function (a, b) {
            return b.length - a.length;
        });

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = suggestedList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var item = _step.value;

                suggestionAdd(item);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    };
    var suggestionListClear = function suggestionListClear() {
        noTags.innerHTML = '';
        noTags.classList.remove('active', 'error');

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = suggestedList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var item = _step2.value;

                suggestionRemove(item);
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }
    };

    /*----------  Initialize all the things  ----------*/

    var init = function init(options) {

        closePanel = options.closePanel;
        noTags = document.getElementById('pkt_ext_no_suggestions');
        container = document.getElementById(options.containerName);
        listContainer = document.getElementById(options.listContainerName);
        actionCopy = document.querySelector('.pkt_ext_logo_action_copy');

        if (!container || !listContainer) return;

        initTagInput(options.placeholder, container);
    };
    var initTagInput = function initTagInput(placeholder, container) {
        tagObject = new taglib(container, {
            placeholder: placeholder,
            preserveCase: true,
            onTagRemove: function onTagRemove(event, tag) {
                if (suggestedList.indexOf(tag) >= 0) suggestionAdd(tag);
                activeTags = tagObject.getTags().values;
                editUserTags();
                taggleList.classList.add('saving');
            },
            onBeforeTagAdd: function onBeforeTagAdd(event, tag) {
                if (suggestedList.indexOf(tag) >= 0) suggestionRemove(tag);
                if (tag.length > 25) {
                    noTags.innerHTML = PKT_EXT.TRANS['invalid_tags'];
                    noTags.classList.add('active', 'error');
                    return false;
                }
                // TODO: OPTIMIZE THIS
                noTags.innerHTML = '';
                noTags.classList.remove('active', 'error');
                return tag;
            },
            onTagAdd: function onTagAdd() {
                activeTags = tagObject.getTags().values;
                saveUserTags();
                taggleList.classList.add('saving');
            },
            onEmptySubmit: function onEmptySubmit() {
                closePanel(true);
            }
        });
        var tagInput = tagObject.getInput();
        taggleList = tagInput.parentNode.parentNode;
        initAutoComplete(container);
    };

    var initAutoComplete = function initAutoComplete(container) {
        getUserTags().then(function (tags) {
            var tagInput = tagObject.getInput();
            tagAutocomplete = new autoComplete({
                container: container,
                selector: tagInput,
                minChars: 1,
                source: function source(term, suggest) {
                    term = term.toLowerCase();
                    autoCompleteList = tags;
                    var topMatches = autoCompleteList.filter(function (word) {
                        return word.charAt(0) === term.charAt(0);
                    });
                    var matches = topMatches.filter(function (x) {
                        return ~x.toLowerCase().indexOf(term);
                    });
                    suggest(matches);
                },
                onSelect: function onSelect(e, term) {
                    if (e.type == 'mousedown') {
                        tagObject.add(term);
                    }
                }
            });
        }, function () {});
    };

    var getInput = function getInput() {
        return tagObject.getInput();
    };

    PKT_EXT.TAGGING = { init: init, getInput: getInput, getSuggestions: getSuggestions, setURL: setURL };
})(PKT_EXT || {}, window.Taggle);

// Toolbar
(function (PKT_EXT) {

    var overflow = void 0,
        overflowTrigger = void 0,
        overflowTimer = void 0,
        pocketLogo = void 0,
        closePanel = void 0,
        messagebox = void 0,
        savedItemId = void 0;

    /*=================================
    =            Utilities            =
    =================================*/
    var sendMessage = PKT_EXT.INTERFACE.sendMessage;

    var addAction = function addAction(el, callback) {
        el.addEventListener('click', callback);
    };

    var removeAction = function removeAction(el, callback) {
        el.removeEventListener('click', callback);
    };

    /*================================
    =            Triggers            =
    ================================*/

    var overflowHide = function overflowHide() {
        overflow.removeClass('active');
        clearTimeout(overflowTimer);
    };

    /*===============================
    =            Actions            =
    ===============================*/

    var setIcon = function setIcon(iconState) {
        var iconClass = iconState || '';
        pocketLogo.removeClass('archived removed');
        pocketLogo.addClass(iconClass);
    };
    var setMessage = function setMessage(copy, iconState) {
        messagebox.text(copy);
        setIcon(iconState);
    };

    var setItemId = function setItemId(itemID) {
        savedItemId = itemID;
    };
    /*===================================
    =            Initalizers            =
    ===================================*/

    var initOverflowTriggers = function initOverflowTriggers() {
        overflowTrigger.off();

        overflowTrigger.on('click', function (e) {
            e.preventDefault();
        });

        overflowTrigger.on('mouseenter', function (e) {
            overflow.addClass('active');
            clearTimeout(overflowTimer);
        });

        overflowTrigger.on('mouseleave', function (e) {
            overflowTimer = setTimeout(function () {
                overflow.removeClass('active');
            }, 1250);
        });

        overflow.on('mouseenter', function (e) {
            overflow.removeClass('active').addClass('active');
            clearTimeout(overflowTimer);
        });

        overflow.on('mouseleave', function (e) {
            clearTimeout(overflowTimer);
            overflowTimer = setTimeout(function () {
                overflow.removeClass('active');
            }, 350);
        });
    };

    var initRemovePageInput = function initRemovePageInput() {
        var el = document.querySelector('.pkt_ext_action_removeitem');
        addAction(el, function (e) {
            e.preventDefault();
            overflowHide();

            sendMessage({
                action: "removeURL",
                item_id: savedItemId
            }, function (response) {
                if (response.status == 'success') {
                    setMessage(PKT_EXT.TRANS['page_removed'], 'removed');
                    closePanel(true);
                }
            });
        });
    };

    var initArchivePageInput = function initArchivePageInput() {
        $('.pkt_ext_action_archive').click(function (e) {
            e.preventDefault();
            overflowHide();

            // $('.pkt_ext_logo_action_copy').text(self.translations.processingArchive);

            sendMessage({
                action: "archiveURL",
                item_id: savedItemId
            }, function (response) {

                if (response.status == 'success') {
                    setMessage(PKT_EXT.TRANS['page_archived'], 'archived');
                    // $('.pkt_ext_logo_action_copy').text(self.translations.pageArchived);
                } else if (response.status == 'error') {
                    // $('.pkt_ext_edit_msg').addClass('pkt_ext_edit_msg_error pkt_ext_edit_msg_active').text(response.error);
                }
            });
        });
    };

    var initSettings = function initSettings() {
        $('.pkt_ext_action_options').click(function (e) {
            e.preventDefault();
            overflowHide();

            sendMessage({
                action: "openSettings"
            }, function () {});
        });
    };

    var init = function init(options) {
        closePanel = options.closePanel;
        overflow = $('.pkt_ext_overflow');
        overflowTrigger = $('.pkt_ext_action_overflow');
        messagebox = $('.pkt_ext_logo_action_copy');
        pocketLogo = $('.pkt_ext_logo');

        messagebox.text(PKT_EXT.TRANS['page_saved']);

        initOverflowTriggers();
        initRemovePageInput();
        initArchivePageInput();
        initSettings();
    };

    PKT_EXT.TOOLBAR = { init: init, setMessage: setMessage, setItemId: setItemId };
})(PKT_EXT || {});