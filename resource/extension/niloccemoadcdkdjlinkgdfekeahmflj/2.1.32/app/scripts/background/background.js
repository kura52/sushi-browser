/* globals $, PKT_EXT, log, isChromeOnly, chrome, sendMessageToTab, authentication, getCurrentLanguageCode, broadcastMessageToAllTabs,  isValidURL,  addMessageListener, getSetting, setSetting, openTabWithURL, isMac */

(function () {

    var baseHost            = 'getpocket.com',
        baseURL             = 'https://' + baseHost,
        featureSet          = {},
        messageWaiting      = '',
        delayedMessageData  = {}

/*==========================================================================
 HELPERS
===========================================================================*/

    function getFeatures(callback){


        var suggestions = true // getSetting("suggestions") === 'true' || 0;
        var premstatus  = getSetting('premium_status') === '1' || 0
        var savecount   = (typeof getSetting('saveCount') == 'undefined') ? 1 : parseInt(getSetting('saveCount'))

        if(typeof getSetting('recommendations') === 'undefined') { setSetting('recommendations', true) }

        PKT_EXT.API.getFeatures({
            success: function(response) {

                Object.keys(response.features).forEach(function(key) {
                    setSetting(key, response.features[key])
                })

                var recs        = (isChromeOnly()
                    &&  getSetting('recommendations') === 'true'
                    && response.features.show_recs) || 0


                featureSet = {
                    suggestions:    suggestions,
                    premstatus:     premstatus,
                    recs:           recs,
                    savecount:      savecount
                }

                if(callback) callback()

            },
            error: function(status, xhr) {

                featureSet = {
                    suggestions:    suggestions,
                    premstatus:     premstatus,
                    recs:           false,
                    savecount:      savecount
                }

                if(callback) callback()
            }
        }, false)



    }

/*==========================================================================
 TOOLBAR ICON MANIPULATION
===========================================================================*/

    function showToolbarIcon(tabId, iconName) {
        // Change toolbar icon to new icon
        var smallIconPath, bigIconPath

        if(isEdge()){

            smallIconPath = 'app/images/' + iconName + '-20.png'
            bigIconPath = 'app/images/' + iconName + '-40.png'
            chrome.browserAction.setIcon({
                tabId: tabId,
                path: {
                    '20': smallIconPath,
                    '40': bigIconPath
                }
            })

        }else{
            smallIconPath = 'app/images/' + iconName + '-19.png'
            bigIconPath = 'app/images/' + iconName + '-38.png'
            chrome.browserAction.setIcon({
                tabId: tabId,
                path: {
                    '19': smallIconPath,
                    '38': bigIconPath
                }
            })

        }

    }

    function showNormalToolbarIcon(tabId) {
        showToolbarIcon(tabId, 'browser-action-icon')
    }

    function showSavedToolbarIcon(tabId) {
        showToolbarIcon(tabId, 'browser-action-icon-added')
    }

/*==========================================================================
 RESPONSE TO SAVE ACTIONS
===========================================================================*/
    function onSaveSuccess(tab, showToolbarIcon, itemId, saveType) {

        if (typeof showToolbarIcon !== 'undefined' && showToolbarIcon === true) {
            showSavedToolbarIcon(tab.id)
        }

        featureSet.savecount += 1
        setSetting('saveCount',featureSet.savecount)

        featureSet.recs = (getSetting('recommendations') === 'true' && getSetting('show_recs') === 'true')

        chrome.tabs.sendMessage(tab.id, {status: 'success', item_id: itemId, features: featureSet, saveType: saveType })
    }

    function onSaveError(tab, xhr) {
        // Handle error message
        var errorMessage = xhr.getResponseHeader('X-Error')
        errorMessage = (errorMessage === null || typeof errorMessage === 'undefined') ?
            PKT_EXT.i18n.getMessage('background_save_url_error_no_message') : PKT_EXT.i18n.getMessagePlaceholder('background_save_url_error_message', [errorMessage])

        sendMessageToTab(tab, { status: 'error', message: errorMessage })
    }

/*==========================================================================
 SAVE/REMOVE/ARCHIVE ACTION
===========================================================================*/

    var saveLinkToPocket = function(tab, options) {
        var title           = options.title || tab.title || ''
        var url             = options.url || tab.url  || ''
        var saveType        = options.saveType || 'page'
        var showSavedIcon   = (typeof options.showSavedIcon !== 'undefined') ? options.showSavedIcon : true

        // // Login before, if not authorized
        if (!PKT_EXT.API.isAuthorized()) {
            return authentication.showLoginWindow(function() { saveLinkToPocket(tab, options) })
        }

        if(!Object.keys(featureSet).length){
            return getFeatures(function(){ saveLinkToPocket(tab, options) })
        }

        // Check for valid url and present it to the user if it's not valid
        if (!isValidURL(url)) {
            return chrome.tabs.sendMessage(tab.id, {status: 'error'})
        }

        featureSet.url = url

        // Add the url to Pocket
        PKT_EXT.API.add(title, url, {
            actionInfo: options.actionInfo,
            success: function(data) {
                var itemid = null
                if (typeof data.action_results
                    && data.action_results.length
                    && typeof data.action_results[0]) {
                    itemid = data.action_results[0].item_id
                }

                onSaveSuccess(tab, showSavedIcon, itemid, saveType)

            },
            error: function(status, xhr) {
                // Not authorized
                if (status === 401) {
                    sendMessageToTab(tab, {'status': 'unauthorized'})
                    authentication.showLoginWindow(function() { saveLinkToPocket(tab, options) })
                    return
                }

                // Handle error message
                onSaveError(tab, xhr)

                // Error callback
                if (options.error) { options.error(status, xhr) }
            }
        })
    }


    var saveRecToPocket = function(tab, options, sendResponse){

        var title           = options.title || ''
        var url             = options.url || ''

        // // Login before, if not authorized
        if (!PKT_EXT.API.isAuthorized()) {
            return authentication.showLoginWindow(function() { saveLinkToPocket(tab, options, sendResponse) })
        }

        // Check for valid url and present it to the user if it's not valid
        if (!isValidURL(url)) {
            return chrome.tabs.sendMessage(tab.id, {status: 'error'})
        }


        // // Add the url to Pocket
        PKT_EXT.API.add(title, url, {
            actionInfo: options.actionInfo,
            success: function(response) {
                sendResponse({ status: 'success', data: response })
                // chrome.tabs.sendMessage(tab.id, {status: 'success'})
            },
            error: function(status) {
                // Not authorized
                if (status === 401) {
                    authentication.showLoginWindow(function() { saveLinkToPocket(tab, options, sendResponse) })
                    return
                }

            }
        })
    }

/*==========================================================================
 SETUP
===========================================================================*/
    var setupDefaults = function(){

        $.each({
            twitter: "true",
            hackernews: "true",
            reddit: "true",
            // yahoo: "true",
            "keyboard-shortcut": "true",
            "keyboard-shortcut-add": (isMac() ? String.fromCharCode("8984") + "+" + String.fromCharCode("8679") + "+P" : "ctrl+shift+S")
        }, function (key, value) {
            if (!getSetting(key)) {
                setSetting(key, value);
            }
        });

        // Check for first time installation and show an installed page
        if (!boolFromString(getSetting("installed"))) {
            setSetting("installed", "true");
            openTabWithURL(baseURL + "/installed/", isYandex());
        }

        // Change command key in the keyboard shortcut on windows or linux to ctrl
        if (!isMac() && getSetting("keyboard-shortcut-add").match("command")){
            setSetting("keyboard-shortcut-add", getSetting("keyboard-shortcut-add").replace(/command/g, "ctrl"));
        }

    }

    var setupToolbarItems = function() {

        chrome.browserAction.onClicked.addListener(function(tab, url) {
            var action = true

            if(tab.url.indexOf('https://www.msn.com/spartan/dhp') == -1
                && tab.url.indexOf('https://www.msn.com/spartan/dhp') == -1
                && tab.url.indexOf('https://www.msn.com/spartan/ntp') == -1
                && tab.url.indexOf('about:') == -1
                && tab.url.indexOf('read:') == -1
                && tab.url.indexOf('ms-browser-extension://') == -1){
                action = true
            } else {
                action = false
            }

            if(action){
                // // Check if we are in the "new Tab" site and open the Pocket Web App if so
                if (typeof url === 'undefined' && tab.active && tab.url === 'chrome://newtab/') {
                    chrome.tabs.update(tab.id, {url: baseURL})
                    return
                }
                // Try to save the link
                saveLinkToPocket(tab, {
                    url: url,
                    actionInfo: {
                        cxt_ui: 'toolbar'
                    },
                    saveType: 'page'
                })
            }

        })
    }

    var setupRightContext = function(){
        // Add a context menu entry for adding links to Pocket
        var onClickHandler = function(info, tab) {

            var url     = info.linkUrl,
                title   = info.selectionText || url,
                cxt_ui  = 'right_click_link',
                saveType= 'link';

            if (!url) {
                url     = tab.url;
                title   = tab.title;
                cxt_ui  = 'right_click_page';
                saveType= 'page';
            }

            saveLinkToPocket(tab, {
                showSavedIcon: false,
                url: url,
                title: title,
                saveType: saveType,
                actionInfo: {
                    cxt_ui: cxt_ui,
                    cxt_url: tab.url
                }
            });
        };

        var onClickBAHandler = function(info, tab){
            chrome.tabs.create({ url: 'https://getpocket.com/a/?s=ext_rc_open'})
            // chrome.tabs.getSelected(null, function(tab){
            //   chrome.tabs.update(tab.id, {url: "https://getpocket.com/a/?s=ext_rc_open"});
            // })
        };

        chrome.contextMenus.removeAll();

        chrome.contextMenus.create({
            "title": PKT_EXT.i18n.getMessage("contextMenuEntryTitle"),
            "contexts": ["page", "frame", "editable", "image", "video", "audio", "link", "selection"],
            "onclick": onClickHandler
        });

       chrome.contextMenus.create({
            "title": PKT_EXT.i18n.getMessage("contextMenuEntryVisit"),
            "contexts": ["browser_action"],
            "onclick": onClickBAHandler
        });
    }

    var setupExtensionModificationListeners = function(){

        // PKT_EXT.API.setupHeartbeat();
        chrome.tabs.onActivated.addListener(function(activeInfo){
            chrome.tabs.get(activeInfo.tabId, function(tab){
                if((/chrome\:\/\/newtab/).test(tab.url)){ chrome.contextMenus.removeAll()}
                else{ setupRightContext()}
            })

        })
        chrome.tabs.onUpdated.addListener(function(tabId){
            chrome.tabs.get(tabId, function(tab){
                if((/chrome\:\/\/newtab/).test(tab.url)){ chrome.contextMenus.removeAll()}
                else{ setupRightContext()}
            })
        })
        // chrome.runtime.onSuspend.addListener(function(){
        //     PKT_EXT.API.sendAnalyticsNewtab({
        //         view: 'extension',
        //         section: 'settings',
        //         identifier: 'uninstall'
        //     })
        // })

        chrome.runtime.onUpdateAvailable.addListener(function() {
            chrome.runtime.reload()

        })
    }

    var getPulse = function(){
        if(typeof getSetting('new_tab_pulse') !== 'undefined'){
            return parseInt(getSetting('new_tab_pulse'), 10)
        } else {
            setSetting('new_tab_pulse', Date.now())
            setSetting('new_tab_pulse_delay', 43200000)
            return Date.now()
        }
    }

    function shouldRefresh(){
        var last_updated = getSetting('new_tab_rec_updated')

        if(typeof last_updated === 'undefined') return true

        var elapsedTime = Date.now() - last_updated
        return (elapsedTime > 900000)
    }
/*==========================================================================
 MESSAGING TO PAGES FROM BACKGROUND
===========================================================================*/

    addMessageListener(function messageListenerCallback(request, sender, sendResponse) {

        switch(request.action){
            case 'getFeatures':

                var featureForce = request.force || false

                if(!featureForce){
                    // Check for pre-existing
                    var presetFeatures = JSON.parse(getSetting('features'))
                    if(presetFeatures){
                        sendResponse({ status: 'success', features: presetFeatures})
                        return true
                    }
                }


                PKT_EXT.API.getFeatures({
                    success: function(response) {
                        setSetting('features', JSON.stringify(response.features))
                        sendResponse({ status: 'success', features: response.features})
                    },
                    error: function(status, xhr) {
                        sendResponse({ status: 'error', error: xhr.getResponseHeader('X-Error') })
                    }
                }, featureForce)
                return true
            case 'getSetup':
                // Check pulse
                var new_tab_pulse = getPulse()
                var pulse_delay = getSetting('new_tab_pulse_delay') || 43200000
                var pulse_check = (Date.now() - new_tab_pulse <  pulse_delay)


                var setupForce = request.force || false
                if(!setupForce && typeof getSetting('setup') !== 'undefined'){

                    // Check for pre-existing
                    var presetSetup = JSON.parse(getSetting('setup'))

                    if( presetSetup
                        && presetSetup.new_tab
                        && pulse_check
                        && getCurrentLanguageCode() === 'en'){

                        // Return preset result
                        sendResponse({ status: 'success', setup: presetSetup})
                        return true

                    } else {

                        log.debug('Getting Setup')
                        // Set current time to pulse and make a check
                        setSetting('new_tab_pulse_delay', getSetting('new_tab_pulse_delay') || 43200000)
                        setSetting('new_tab_pulse', Date.now())
                    }
                }

                PKT_EXT.API.getSetup({
                    success: function(response) {
                        setSetting('setup', JSON.stringify(response))
                        sendResponse({ status: 'success', setup: response})
                    },
                    error: function(status, xhr) {
                        sendResponse({ status: 'error', error: xhr.getResponseHeader('X-Error') })
                    }
                }, setupForce)
                return true

            case "getSetting":
                sendResponse({"value": getSetting(request.key)});
                break;

            case "setSetting":
                setSetting(request.key, request.value);
                broadcastMessageToAllTabs({ action:"settingChanged", key: request.key, value:request.value });
                break;

            case "getDisplayName":
                sendResponse({"value": getDisplayName()});
                break;

            case "getDisplayUsername":
                sendResponse({"value": getDisplayUsername()});
                break;

            case "isValidToken":
                PKT_EXT.API.isValidToken(function(isValid) {
                    sendResponse({value: isValid});
                });
                return true
            case "openTab":
                var inBackground = typeof request.inBackground !== "undefined" ? request.inBackground : true;
                openTabWithURL(request.url, inBackground);
                break;

            case "openSettings":
                if(chrome.runtime.openOptionsPage) { chrome.runtime.openOptionsPage()}
                else{chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') })}
                // chrome.tabs.create({ 'url': 'chrome://extensions/?options=' + chrome.runtime.id });
                break;

            case "addRecURL":
                if (!request.url) return;

                var url             = request.url;
                var title           = request.title || '';
                var actionObject    =  {
                        action          : 'itemrec_save',
                        item_id         : request.item_id,
                        cxt_ui          : 'onsave_rec',
                        cxt_view        : 'ext_recs',
                        cxt_src_item    : request.source_id,
                        cxt_index       : request.position
                    }

                if(request.impression_id) actionObject.cxt_impression_id = request.impression_id

                PKT_EXT.API.addRec(title, url, {
                    actionInfo: actionObject,
                    success: function(data) {
                        sendResponse({status: "success"});
                    },
                    error: function(status, xhr) {
                        sendResponse({
                            status: "error",
                            error: xhr.getResponseHeader("X-Error")
                        });
                    }
                });
                return true;
                break;

            case "openRec":
                if (!request.url) return;

                var url             = request.url;
                var title           = request.title || '';
                var actionObject    =  {
                        action          : 'itemrec_open',
                        item_id         : request.item_id,
                        cxt_ui          : 'onsave_rec',
                        cxt_view        : 'ext_recs',
                        cxt_src_item    : request.source_id,
                        cxt_index       : request.position
                    }

                PKT_EXT.API.openRec(actionObject);
                return true;
                break;
            case "timeoutRec":
                var actionObject    =  {
                        action          : 'itemrec_timeout',
                        item_id         : request.source_id,
                        cxt_ui          : 'onsave_rec',
                        cxt_view        : 'ext_recs',
                        cxt_src_item    : request.source_id
                    }
                PKT_EXT.API.timeoutRec(actionObject);
                return true;
                break;
            case "addURL":

                saveLinkToPocket(sender.tab, request);
                return true;
                break;

            case "removeURL":
                if (!PKT_EXT.API.isAuthorized()) { return; }

                PKT_EXT.API.remove(request.item_id, {
                    success: function() {
                        showNormalToolbarIcon(sender.tab.id);
                        sendResponse({status: "success"});
                    },
                    error: function(status, xhr) {
                        sendResponse({
                            status: "error",
                            error: xhr.getResponseHeader("X-Error")
                        });
                    }
                });
                return true;
                break;

            case "archiveURL":

                if (!PKT_EXT.API.isAuthorized()) { return; }
                PKT_EXT.API.archive(request.item_id, {
                    success: function() {
                        showNormalToolbarIcon(sender.tab.id);
                        sendResponse({status: "success"});
                    },
                    error: function(status, xhr) {
                        sendResponse({
                            status: "error",
                            error: xhr.getResponseHeader("X-Error")
                        });
                    }
                });
                return true;
                break;

            case "getTags":
                PKT_EXT.API.getTags(function(tags, usedTags) {
                    sendResponse({"value": {"tags": tags, "usedTags": usedTags}});
                });
                return true;
                break;

            case "getSuggestedTags":
                PKT_EXT.API.getSuggestedTags(request.url, {
                    success: function(data) {
                        if (data.status) sendResponse({status: "success", "value": { "suggestedTags": data.suggested_tags }});
                        else sendResponse({status: "error", error: "Invalid User"});
                    },
                    error: function(status, xhr) {
                        sendResponse({ status: "error", error: xhr.getResponseHeader("X-Error") });
                    }
                });
                return true;
                break;

            case "editTags":
            case "addTags":
                if (!PKT_EXT.API.isAuthorized()) { return; }
                var tags            = request.tags;
                var urlToAddTags    = request.url;
                var actionInfo = {
                    cxt_ui: 'popover',
                    cxt_view: 'ext_popover',
                    cxt_url: sender.tab.url,
                    cxt_suggested_available: request.analytics.cxt_suggested_available,
                    cxt_enter_cnt: request.analytics.cxt_entered,
                    cxt_suggested_cnt: request.analytics.cxt_suggested,
                    cxt_remove_cnt: request.analytics.cxt_removed
                };

                PKT_EXT.API.addTags(urlToAddTags, tags, {
                    actionInfo: actionInfo,
                    success: function() {
                        sendResponse({status: "success"});
                    },
                    error: function(status, xhr) {
                        if (status === 401) {
                            if (listenerReady) {
                                delayedMessageData = {};
                                messageWaiting = '';
                                sendMessageToTab(sender.tab, {status: "unauthorized"});
                            }
                            else {
                                delayedMessageData = {
                                    status: 'unauthorized'
                                };
                                messageWaiting = 'unauthorized';
                            }
                            authentication.showLoginWindow(function() {
                                messageListenerCallback(request, sender, sendResponse);
                            });
                            return true;
                        }

                        sendResponse({
                            status: "error",
                            error: xhr.getResponseHeader("X-Error")
                        });
                    }
                });
                return true;
                break;
            case "itemAction":
                PKT_EXT.API.itemAction(request.data);
                break;
            case "getRecommendation":
                if (!PKT_EXT.API.isAuthorized()) { return; }
                PKT_EXT.API.getRecommendations(request.item_id, {
                    success: function(response) {
                        sendResponse({ status: "success", data: response });
                    },
                    error: function(status, xhr) {
                        sendResponse({ status: "error", error: xhr.getResponseHeader("X-Error") });
                    }
                });
                return true;
                break;
            case "saveRecToPocket":
                saveRecToPocket(sender.tab, request, sendResponse)
                return true
                break
            case "getGlobalRecommendations":
                var cachedRecResponse = getSetting('global_recommendations')
                if( shouldRefresh() || typeof cachedRecResponse === 'undefined'){
                    log.debug('Getting recs from the server')
                    PKT_EXT.API.getGlobalRecommendations({
                        success: function(response) {
                            sendResponse({ status: "success", data: response, server: true });
                            setSetting('global_recommendations', JSON.stringify(response) )
                        },
                        error: function(status, xhr) {
                            sendResponse({ status: "error", error: xhr.getResponseHeader("X-Error") });
                        }
                    })
                } else {
                    sendResponse({ status: "success", data: JSON.parse(cachedRecResponse), server: false  })
                }
                return true
                break;
            case "getGlobalTrendingTopics":
                PKT_EXT.API.getGlobalTrendingTopics({
                    success: function(response) {
                        sendResponse({ status: "success", data: response });
                        // setSetting('global_trends', JSON.stringify(response) )
                    },
                    error: function(status, xhr) {
                        sendResponse({ status: "error", error: xhr.getResponseHeader("X-Error") });
                    }
                })
                return true
                break;
                // }

                // if(typeof cachedTrendResponse !== 'undefined'){
                //     sendResponse({ status: "success", data: JSON.parse(cachedTrendResponse)  })
                // } else {
                //     sendResponse({ status: "error", error: "Bad Cache Value" });
                // }

                // return true

            case "sendAnalyticsNewtab":
                PKT_EXT.API.sendAnalyticsNewtab(request.ctx)
                break
            case "listenerReady":
                listenerReady = true;
                if (messageWaiting == 'success') {
                    messageWaiting = '';
                    setTimeout(function() {
                        onSaveSuccess(delayedMessageData.tab,delayedMessageData.status,delayedMessageData.item_id,delayedMessageData.saveType);
                        delayedMessageData = {};
                    },50);
                }
                else if (messageWaiting == 'error') {
                    messageWaiting = '';
                    setTimeout(function() {
                        sendMessageToTab(delayedMessageData.tab,{status: delayedMessageData.status, message: delayedMessageData.message});
                        delayedMessageData = {};
                    },50);
                }
                else if (messageWaiting == 'unauthorized') {
                    messageWaiting = '';
                    setTimeout(function() {
                        sendMessageToTab(delayedMessageData.tab,{status: delayedMessageData.status});
                        delayedMessageData = {};
                    },50);
                }
                return true;
                break;


        }
    })



/*==========================================================================
 INITALIZE THE EXTENSION
===========================================================================*/

    setupDefaults()
    setupToolbarItems()
    setupRightContext()
    showNormalToolbarIcon()
    setupExtensionModificationListeners()



})()
