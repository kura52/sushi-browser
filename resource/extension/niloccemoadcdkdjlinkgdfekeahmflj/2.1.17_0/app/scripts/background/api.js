/* global $, getSetting, setSetting, PKT_EXT, getCurrentLanguageCode, log, isChromeOnly, chrome*/
/*
 * Pocket API module
 */
(function(PKT_EXT) {

    // Set BaseURL
    // var baseURL = "https://admin:s3krit@sechs.dev.readitlater.com/v3";
    var baseURL =   getSetting('baseURL')
    if(!baseURL)    setSetting('baseURL', 'https://getpocket.com/v3')

    // trace  > debug  > info  > warn  > error > silent
    log.setLevel(getSetting('loglevel') || 'SILENT')

    // Auth key for the API requests
    var oAuthKey = PKT_EXT.INTERFACE.getKey()
    if(!oAuthKey) {
        log.error('Invalid oAuth Key')
        return
    }

    // HELPER METHOD FOR API REQUESTS
    function apiRequest(options) {
        var url             = getSetting('baseURL') + options.path,
            data            = options.data || {}

        data.consumer_key   = oAuthKey

        $.ajax({
            url         : url,
            type        : 'POST',
            headers     : { 'X-Accept' : 'application/json'},
            data        : data,
            dataType    : 'json',
            success     : options.success,
            error       : options.error
        })
    }

    // CHECK IF TOKEN IS STILL VALID
    function isValidToken(callback) {
        apiRequest({
            path    : '/oauth/is_valid_token',
            data    : { access_token: getSetting('oauth_token') },
            success : function() { if (callback) { callback(true) } },
            error   : function() { if (callback) { callback(false) } }
        })
    }

    // CHECK IF THE USER IS AUTHORIZED
    function isAuthorized() {
        return (typeof getSetting('username') !== 'undefined') &&
               (typeof getSetting('oauth_token') !== 'undefined')
    }

    // CLEAR SAVED SETTINGS
    function logout() {
        // Clear user login information
        setSetting('username', undefined)
        setSetting('email', undefined)
        setSetting('firstName', undefined)
        setSetting('lastName', undefined)
        setSetting('oauth_token', undefined)
        setSetting('premium_status', undefined)

        // Clear tags
        setSetting('tagsFetchedSince', undefined)
        setSetting('tags', undefined)
        setSetting('usedTags', undefined)

        // Clear legacy
        setSetting('password', undefined)
        setSetting('token', undefined) // Clean old token value

        // Clear heartbeat references
        setSetting('guid', undefined)
        setSetting('heartbeatTimestamp', undefined)
        setSetting('alreadyLoggedIn', undefined)

        setupHeartbeat(function() {
            setSetting('guid', undefined)
            setSetting('heartbeatTimestamp',undefined)
        })

        // Clear prem upsell reference
        setSetting('premUpsell', undefined)
        setSetting('premUpsellTime', undefined)
        setSetting('premUpsellCount', undefined)

        // Clear save count
        setSetting('saveCount', undefined)
    }

    /**
     * Login the user with cookie information we got from the login successfull
     * page
     * @param  {Object} info      Info object with userId and token for the user
     * @param  {Object} callbacks Optional object to get the successs or error
     *                            callback
     */
    function login(info, callbacks) {
        callbacks = callbacks || {}

        var guid = getSetting('guid')
        if (typeof guid == 'undefined'){
            PKT_EXT.API.getGuid(function(data) {
                if (data.guid) {
                    setSetting('guid', data.guid)
                    login(info, callbacks)
                    log.info('Not Enough Data - Rechecking')
                } else {
                    log.info('Not Enough Data - Terminating')
                }
            })
            return
        }
        apiRequest({
            path: '/oauth/authorize',
            data: {
                guid: guid,
                token: info.token,
                user_id: info.userId,
                account: '1',
                grant_type: 'extension'
            },
            success: function(data) {
                var username        = data['username']
                var accessToken     = data['access_token']
                var account         = data['account']
                var email           = account['email']
                var firstName       = account['first_name'] || ''
                var lastName        = account['last_name'] || ''
                var premiumStatus   = account['premium_status']

                setSetting('username', username)
                setSetting('email', email)
                setSetting('firstName', firstName)
                setSetting('lastName', lastName)
                setSetting('oauth_token', accessToken)
                setSetting('token', undefined)
                setSetting('premium_status', premiumStatus)

                if (callbacks.success) { callbacks.success() }
                fetchTags()
            },
            error: function(data, textStatus) {
                log.error('Login Error:')
                log.error(data.error)
                log.error(textStatus)

                if (callbacks.error) {
                    callbacks.error.apply(callbacks, Array.apply(null, arguments))
                }
            }
        })
    }

    /**
     * Add a new link to Pocket
     * @param {string} title   Title of the link
     * @param {string} url     URL of the link
     * @param {Object} options Object with success and error callbacks
     */
    function add(title, url, options) {
        var action = {
            action: 'add',
            url: url,
            title: title
        }
        sendAction(action, options)
    }

    function addRec(title, url, options) {
        var actions = [
            { action: 'add', url: url, title: title},
            options.actionInfo
        ]
        var data = {
            access_token: getSetting('oauth_token'),
            actions: JSON.stringify(actions)
        }

        apiRequest({
            path: '/send',
            data: data,
            success: function(data) {
                if (options.success) options.success(data)
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    logout()
                }

                if (options.error) options.error(xhr.status, xhr)
            }
        })
    }

    function openRec(actions){
        apiRequest({
            path: '/send',
            data: {
                access_token: getSetting('oauth_token'),
                actions: JSON.stringify([actions])
            }
        })
    }

    function timeoutRec(actions){
        apiRequest({
            path: '/send',
            data: {
                access_token: getSetting('oauth_token'),
                actions: JSON.stringify([actions])
            }
        })
    }

    /**
     * Remove an item identified by item id from the users list
     * @param  {string} itemId  The id from the item we want to remove
     * @param  {Object} options Object with sucess and error callbacks
     */
    function remove(itemId, options) {
        var action = {
            action: 'delete',
            item_id: itemId
        }
        sendAction(action, options)
    }

    /**
     * Archive an item identified by item id from the users list
     * @param  {string} itemId  The id from the item we want to remove
     * @param  {Object} options Object with sucess and error callbacks
     */
    function archive(itemId, options) {
        var action = {
            action: 'archive',
            item_id: itemId
        }
        sendAction(action, options)
    }

    function getRecommendations(itemId, options){
        if (!isAuthorized()) return
        var lang = getCurrentLanguageCode()
        var sendData = {
            resolved_id     : itemId,
            version         : 2,
            locale_lang     : lang,
            count           : 3,
            access_token    : getSetting('oauth_token')
        }
        apiRequest({
            path: '/getSuggestedItems',
            data: sendData,
            success: function(data) {
                if (options.success) options.success(data)
            },
            error: function(xhr) {
                if (options.error) options.error(xhr.status, xhr)
            }
        })
    }

    function getGlobalRecommendations(options){
        var guid = getSetting('guid')
        var lang = getCurrentLanguageCode()
        if (typeof guid == 'undefined'){
            PKT_EXT.API.getGuid(function(data) {
                if (data.guid) {
                    setSetting('guid', data.guid)
                    getGlobalRecommendations(options)
                    log.info('Not Enough Data - Rechecking') // Should be split into opposing functions
                } else {
                    log.info('Not Enough Data - Terminating')
                }
            })

            return
        }

        var sendData = {
            version: 1,
            locale_lang: lang,
            count: 3,
            access_token: getSetting('oauth_token'),
            guid: guid
        }
        apiRequest({
            path: '/getGlobalRecs',
            data: sendData,
            success: function(data) { if (options.success) options.success(data) },
            error: function(xhr) { if (options.error) options.error(xhr.status, xhr) }
        })
    }


    function getGlobalTrendingTopics(options){
        var guid = getSetting('guid')
        if (typeof guid == 'undefined'){
            PKT_EXT.API.getGuid(function(data) {
                if (data.guid) {
                    setSetting('guid', data.guid)
                    getGlobalRecommendations(options)
                    log.info('Not Enough Data - Rechecking') // Should be split into opposing functions
                } else {
                    log.info('Not Enough Data - Terminating')
                }
            })

            return
        }
        var sendData = {
            access_token: getSetting('oauth_token'),
            guid: guid
        }
        apiRequest({
            path: '/getTrendingTopics',
            data: sendData,
            success: function(data) {
                if (options.success) options.success(data)
            },
            error: function(xhr) {
                if (options.error) options.error(xhr.status, xhr)
            }
        })
    }


    /**
     * General function to send all kinds of actions like adding of links or
     * removing of items via the API
     */
    function sendAction(action, options) {

        // Options can have an 'actionInfo' object. This actionInfo object
        // get passed through to the action object that we send to the API
        if (typeof options.actionInfo !== 'undefined') {
            action = $.extend(action, options.actionInfo)
        }

        apiRequest({
            path: '/send',
            data: {
                access_token: getSetting('oauth_token'),
                actions: JSON.stringify([action])
            },
            success: function(data) {
                if (options.success) options.success(data)
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    logout()
                }

                if (options.error) options.error(xhr.status, xhr)
            }
        })
    }


    /**
     * Fetch tags from the API and save them in the settings
     */
    function fetchTags(options) {
        if (!isAuthorized()) return

        options = options || {}

        var since = getSetting('tagsFetchedSince')
        var premiumstatus = getSetting('premium_status')

        var senddata =  {
            access_token: getSetting('oauth_token'),
            tags: 1,
            taglist: 1,
            account: 1,
            since: since ? since : 0
        }

        if (typeof premiumstatus == 'undefined') {
            senddata.forceaccount = 1
        }

        apiRequest({
            path: '/get',
            data: senddata,
            success: function(data) {
                // If we got the account back, update premium status
                if (data.account) {
                    setSetting('premium_status',data.account['premium_status'])
                }

                // Check if we actually got any tags within the response
                if (data.tags) {
                    // If a tagslist is in the response replace the tags
                    setSetting('tags', JSON.stringify(data.tags))
                }

                // Save since value for further requests
                setSetting('tagsFetchedSince', data.since)

                if (options.success) { options.success() }
            },
            error: function() {
                if (options.error) { options.error() }
            }
        })
    }


    /**
     * Add tags to the item identified by the url. Also updates the used tags
     * list
     * @param {string} url     The item identifier by url
     * @param {Array}  tags    Tags adding to the item
     * @param {Object} options Can providea an actionInfo object with further
     *                         data to send to the API. Can have success and error
     *                         callbacks
     */
    function addTags(url, tags, options) {
        // Create actoin we send
        var action = {
            action: 'tags_add',
            url: url,
            tags: tags
        }

        // Backup the success callback as we need it later
        var finalSuccessCallback = options.success

        // Switch the success callback
        options.success = function(data) {

            // Update used tags
            var usedTagsJSON = getSetting('usedTags')
            var usedTags = usedTagsJSON ? JSON.parse(usedTagsJSON) : {}

            // Check for each tag if it's already in the used tags
            for (var i = 0; i < tags.length; i++) {
                var tagToSave = tags[i].trim()
                var newUsedTagObject = {
                    'tag': tagToSave,
                    'timestamp': new Date()
                }
                usedTags[tagToSave] = newUsedTagObject
            }
            setSetting('usedTags', JSON.stringify(usedTags))

            // Let the callback know that we are finished
            if (finalSuccessCallback) { finalSuccessCallback(data) }
        }

        // Execute the action
        sendAction(action, options)
    }


    /**
     * Add tags to the item identified by the url. Also updates the used tags
     * list
     * @param {string} url     The item identifier by url
     * @param {Array}  tags    Tags adding to the item
     * @param {Object} options Can providea an actionInfo object with further
     *                         data to send to the API. Can have success and error
     *                         callbacks
     */
    function editTags(url, tags, options) {
        // Create actoin we send
        var action = {
            action  : 'tags_replace',
            url     : url,
            tags    : tags
        }

        // Backup the success callback as we need it later
        var finalSuccessCallback = options.success

        // Switch the success callback
        options.success = function(data) {
            // console.log(data)
            // // Update used tags
            // var usedTagsJSON = getSetting("usedTags");
            // var usedTags = usedTagsJSON ? JSON.parse(usedTagsJSON) : {};

            // // Check for each tag if it's already in the used tags
            // for (var i = 0; i < tags.length; i++) {
            //     var tagToSave = tags[i].trim();
            //     var newUsedTagObject = {
            //         "tag": tagToSave,
            //         "timestamp": new Date()
            //     };
            //     usedTags[tagToSave] = newUsedTagObject;
            // }
            // setSetting("usedTags", JSON.stringify(usedTags));

            // Let the callback know that we are finished
            if (finalSuccessCallback) { finalSuccessCallback(data) }
        }

        // Execute the action
        sendAction(action, options)
    }


    /**
     * Fetch tags from the API and get all tags and used tags within the callback
     * @param  {Function} callback Function with tags and used tags as parameter
     */
    function getTags(callback) {

        // Callback if we finished fetching tags
        var fetchTagsCallback = function() {
            // Get tags list
            var tagsJSON = getSetting('tags'),
                tags = ''

            if (tagsJSON) { tags = JSON.parse(tagsJSON) }

            // Get used tags list
            var usedTagsJSON = getSetting('usedTags'),
                usedTags = []

            if (usedTagsJSON) {
                var usedTagsObject = JSON.parse(usedTagsJSON),
                    usedTagsObjectArray = []

                for (var tagKey in usedTagsObject) {
                    usedTagsObjectArray.push(usedTagsObject[tagKey])
                }

                // Sort usedTagsObjectArray based on timestamp
                usedTagsObjectArray.sort(function(a, b) {
                    a = new Date(a.timestamp)
                    b = new Date(b.timestamp)
                    return a < b ? -1 : a > b ? 1 : 0
                })

                // Get all keys tags
                for (var j = 0; j < usedTagsObjectArray.length; j++) {
                    usedTags.push(usedTagsObjectArray[j].tag)
                }

                // Reverse to set the last recent used tags to the front
                usedTags.reverse()
            }

            // Let the listener know we have the tags
            if (callback) { callback(tags, usedTags) }
        }

        // Start and fetch tags in case we have new
        fetchTags({success: fetchTagsCallback, error: fetchTagsCallback})
    }


    /**
     * Fetch suggested tags from the API based on URL
     * @param {string} url     The item identifier by url
     * @param {Object} options Can providea an actionInfo object with further
     *                         data to send to the API. Can have success and error
     *                         callbacks
     */
    function getSuggestedTags(url, options) {
        if (!isAuthorized()) return

        options = options || {}

        apiRequest({
            path: '/suggested_tags',
            data: {
                access_token: getSetting('oauth_token'),
                url: url
            },
            success: function(data) {
                if (options.success) { options.success(data) }
            },
            error: function(xhr) {
                if (options.error) { options.error(xhr.status, xhr) }
            }
        })
    }


    /**
     * Setup heartbeat
     */
    function setupHeartbeat(callback) {
        if (!isChromeOnly()) { return }

        var time = getSetting('heartbeatTimestamp'),
            now = Date.now(),
            guid

        // time differential is just 10 to ensure we send it every time for testing, change to msInDay for later
        var msInDay = 86400 * 1000
        if (typeof time == 'undefined' || ((now-time) > msInDay)) {
            guid = getSetting('guid')
            if (typeof guid == 'undefined') {
                PKT_EXT.API.getGuid(function(data) {
                    if (data.tests) {
                        if (data.tests.extension_install_signup_v1) {
                            setSetting('experimentVariant',data.tests.extension_install_signup_v1.option)
                        }
                        if (data.tests.premium_ext_upsell_v2 &&
                            data.tests.premium_ext_upsell_v2.option == 'show_upsell' &&
                            (window.navigator.language.toLowerCase() == 'en-us' ||
                                window.navigator.language.toLowerCase() == 'en')) {
                            setSetting('premUpsell','1')
                        }
                        else {
                            setSetting('premUpsell','0')
                        }

                    }
                    if (data.guid) {
                        setSetting('guid',data.guid)
                        setupHeartbeat()
                    }
                    else {
                        setTimeout(setupHeartbeat,3600000)
                    }
                })
                return
            }

            // send AB test if applicable
            if (typeof getSetting('oauth_token') !== 'undefined' && typeof getSetting('guid') !== 'undefined')
            {
                var variant = 'control'
                if (getSetting('premium_status') !== '1' && getSetting('premUpsell') == '1')
                {
                    variant = 'show_upsell'
                }
                PKT_EXT.API.sendAbTestTrack(getSetting('guid'),getSetting('oauth_token'),'premium_ext_upsell_v2',variant)


            }

            chrome.windows.getAll({populate:true},function(windows) {
                var tabcount = 0
                for (var i = 0; i < windows.length; i++){
                    tabcount += windows[i].tabs.length
                }

                PKT_EXT.API.sendHeartbeat(guid,tabcount,windows.length,function(success) {
                    if (success){
                        setSetting('heartbeatTimestamp',now)
                        if (callback){ callback(now) }
                    }
                    else {
                        setTimeout(setupHeartbeat,3600000)
                    }
                })
            })
        }
        else {
            // regardless of the scenario, for experiment purposes, check to see if guid exists, if not grab one
            guid = getSetting('guid')
            if (typeof guid == 'undefined') {
                PKT_EXT.API.getGuid(function(data) {
                    if (data.guid) {
                        setSetting('guid',data.guid)
                    }
                    if (data.tests) {
                        if (data.tests.extension_install_signup_v1) {
                            setSetting('experimentVariant',data.tests.extension_install_signup_v1.option)
                        }
                        if (data.tests.premium_ext_upsell_v2 && data.tests.premium_ext_upsell_v2.option == 'show_upsell' &&
                            (window.navigator.language.toLowerCase() == 'en-us' || window.navigator.language.toLowerCase() == 'en')) {
                            setSetting('premUpsell','1')
                        }
                        else {
                            setSetting('premUpsell','0')
                        }

                    }
                })
            }

        }
    }

    /**
     * Send heartbeat detail
     * @param {string}   guid     user guid
     * @param {integer}  tabs     number of tabs open
     * @param {integer}  windows  number of windows open
     * @param {function} callback return boolean on success status or not
     */
    function sendHeartbeat(guid,tabs,windows,callback) {
        if (typeof guid == 'undefined' || !guid) {
            if (callback) { callback(false) }
            return
        }
        apiRequest({
            path: '/pv',
            data: {
                access_token: getSetting('oauth_token'),
                guid: guid,
                actions: JSON.stringify([{view: 'ext_heartbeat',cxt_t: tabs,cxt_w: windows}])
            },
            success: function() {
                if (callback) { callback(true) }
            },
            error: function() {
                if (callback) { callback(false) }
            }
        })
    }

    /**
     * Get user guid
     * @param {function} callback return guid, other data on success, false on not
     */
    function getGuid(callback) {
        apiRequest({
            path: '/guid',
            data: { abt: 1 },
            success: function(data) {
                if (callback) {
                    if (data.status) {
                        callback(data)
                        if(chrome) chrome.runtime.setUninstallURL('https://getpocket.com/chrome-exit-survey/?gd='+data.guid)
                    }
                    else {
                        callback(false)
                    }
                }
            },
            error: function() {
                if (callback) {
                    callback(false)
                }
            }
        })
    }

    /**
     * Tell server about a/b experiment call
     @ @param {string}   guid     for the user in question
     * @param {string}   atoken   access token (optional, pass null if not defined)
     * @param {string}   testname pass in the test name
     * @param {string}   variant  pass in the specific variant tested
     * @param {function} callback return true on success, false on not
     */
    function sendAbTestTrack(guid,token,testname,variant,callback) {
        apiRequest({
            path: '/abtr',
            data: {
                guid: guid,
                access_token: token,
                actions: JSON.stringify([{action: 'pv_ab', ab_test: testname, ab_test_option: variant}])
            },
            success: function(data) {
                if (callback) {
                    if (data.status) { callback(data,true) }
                    else { callback(data,false) }
                }
            },
            error: function() {
                if (callback) { callback(false) }
            }
        })
    }

    /**
     *
     @ @param {string}   guid     for the user in question
     * @param {string}   atoken   access token (optional, pass null if not defined)
     * @param {string}   testname pass in the test name
     * @param {string}   variant  pass in the specific variant tested
     * @param {function} callback return true on success, false on not
     */
    function sendAbTest(guid,callback) {
        apiRequest({
            path: '/abt',
            data: {
                guid: guid,
                access_token: getSetting('oauth_token'),
                test_type: 11
            },
            success: function(data) {
                if (callback) {
                    if (data.status) { callback(data) }
                    else { callback(data) }
                }
            },
            error: function(xhr) {
                if (callback) { callback(xhr) }
            }
        })
    }

    function getFeatures(options, force){
        var lang = getCurrentLanguageCode()
        var sendData = {
            locale_lang: lang,
            access_token: getSetting('oauth_token')
        }

        if(force) { sendData[force] = 1 }

        apiRequest({
            path: '/checkFeatures',
            data: sendData,
            success: function(data) {
                if (options.success) options.success(data)
            },
            error: function(xhr) {
                if (options.error) options.error(xhr.status, xhr)
            }
        })
    }

    function getSetup(options, force){
        var lang = getCurrentLanguageCode()
        var guid = getSetting('guid')
        if (typeof guid == 'undefined'){
            PKT_EXT.API.getGuid(function(data) {
                if (data.guid) {
                    setSetting('guid', data.guid)
                    getSetup(options, force)
                    log.info('Not Enough Data - Rechecking') // Should be split into opposing functions
                } else {
                    log.info('Not Enough Data - Terminating')
                }
            })

            return
        }

        var sendData = {
            locale_lang: lang,
            guid: guid,
        }

        if(force) { sendData[force] = 1 }

        apiRequest({
            path: '/checkSetup',
            data: sendData,
            success: function(data) {
                if (options.success) {
                    options.success(data.features)
                }
            },
            error: function(xhr) {
                // console.log(xhr)
                if (options.error) options.error(xhr.status, xhr)
            }
        })
    }

    function itemAction(requestData){

        var data = {
            access_token:getSetting('oauth_token'),
            actions: JSON.stringify([requestData])
        }

        apiRequest({
            path: '/send',
            data: data,
            success: function() {
                // console.log('item action sent', data)
            },
            error: function(xhr) {
                log.error(xhr)
            }
        })
    }
    /**
     * More generic analytics call to refer to various actions
     * @param {string}   guid     user guid
     * @param {string}   page     page to pass back to analytics
     * @param {function} callback return boolean on success status or not
     */
    function sendAnalyticsCall( guid, page, callback ) {
        if (typeof guid == 'undefined' || !guid) {
            if (callback) { callback(false) }
            return
        }
        apiRequest({
            path: '/pv',
            data: {
                access_token: getSetting('oauth_token'),
                guid: guid,
                actions: JSON.stringify([{view: 'web', type_id: 1, section: 'extension', page: page}])
            },
            success: function() {
                if (callback) callback(true)
            },
            error: function() {
                if (callback) callback(false)
            }
        })
    }


    /**
     * More generic analytics call to refer to various actions
     * @param {string}   guid     user guid
     * @param {string}   page     page to pass back to analytics
     * @param {function} callback return boolean on success status or not
     */
    function sendAnalyticsNewtab( ctx, callback ) {
        var guid = getSetting('guid')
        if (typeof guid == 'undefined'){
            PKT_EXT.API.getGuid(function(data) {
                if (data.guid) {
                    setSetting('guid', data.guid)
                    sendAnalyticsNewtab(ctx, callback)
                    log.info('Not Enough Data - Rechecking') // Should be split into opposing functions
                } else {
                    log.info('Not Enough Data - Terminating')
                }
            })

            return
        }
        apiRequest({
            path: '/pv',
            data: {
                access_token: getSetting('oauth_token'),
                guid: guid,
                actions: JSON.stringify([ctx])
            },
            success: function() { //data
                if (callback) callback(true)
            },
            error: function() { //xhr
                if (callback) callback(false)
            }
        })
    }

    /**
     * Public functions
     */
    PKT_EXT.API = {
        isAuthorized                : isAuthorized,
        login                       : login,
        logout                      : logout,
        add                         : add,
        addRec                      : addRec,
        openRec                     : openRec,
        timeoutRec                  : timeoutRec,
        archive                     : archive,
        remove                      : remove,
        addTags                     : addTags,
        editTags                    : editTags,
        getTags                     : getTags,
        getRecommendations          : getRecommendations,
        getSuggestedTags            : getSuggestedTags,
        setupHeartbeat              : setupHeartbeat,
        sendHeartbeat               : sendHeartbeat,
        getGuid                     : getGuid,
        sendAbTest                  : sendAbTest,
        sendAbTestTrack             : sendAbTestTrack,
        sendAnalyticsCall           : sendAnalyticsCall,
        itemAction                  : itemAction,
        isValidToken                : isValidToken,
        getGlobalRecommendations    : getGlobalRecommendations,
        getGlobalTrendingTopics     : getGlobalTrendingTopics,
        getFeatures                 : getFeatures,
        getSetup                    : getSetup,
        sendAnalyticsNewtab         : sendAnalyticsNewtab
    }
}(PKT_EXT || {}))
