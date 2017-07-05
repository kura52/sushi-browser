/*global $, Q, PKT_EXT, getImageCacheUrl, chrome, log, isLocal, getCurrentLanguageCode*/

(function(PKT_EXT){

    let should_recent, tab_count, active_new = true
    const sendMessage = PKT_EXT.INTERFACE.sendMessage

    const injectContainer = function(force){
        $(function(){
            let googleTiles = document.getElementById('most-visited')
            let tileWrapper = document.getElementById('mv-tiles')
            if(googleTiles){

                $('#most-visited').css('margin-top', '0')
                $('#prm-pt').css('margin-top', '15px').insertBefore('#most-visited')

                if( force ){
                    tileWrapper.style.height = '11em'
                    googleTiles.style.opacity = 1
                }
                else {
                    googleTiles.style.display = 'none'
                }

                isLocal() ?
                googleTiles.insertAdjacentHTML('afterend', PKT_EXT.TEMPLATES.newtab()) :
                $('body').append(PKT_EXT.TEMPLATES.newtab())

            }
        })
    }

    const hideChromeSiteTiles = function(){
        $(function(){
            let googleTiles = document.getElementById('most-visited')

            if(googleTiles){
                googleTiles.style.opacity = 0
            }
        })
    }

    const showChromeSiteTiles = function(){
        $(function(){
            let googleTiles = document.getElementById('most-visited')

            if(googleTiles){
                googleTiles.style.opacity = 1
            }
        })
    }

    const removeContainer = function(){
        let googleTiles = document.getElementById('most-visited')

        if(googleTiles){
            document.getElementById('mv-tiles').style.height = ''
            googleTiles.style.display = ''
            googleTiles.style.opacity = ''
        }
        let newtab = document.getElementById('pkt_ext_newtab')
        newtab.parentNode.removeChild(newtab)

        showConfirm()
    }

    const showConfirm = function(){
        let googleTiles = document.getElementById('most-visited')

        if(googleTiles){
            googleTiles.insertAdjacentHTML('beforebegin', PKT_EXT.TEMPLATES.newtab_confirm())
            $('#most-visited').css('margin-top', '63px')
            $('#prm-pt').css('margin-top', '').insertAfter('#most-visited')
            setConfirmActions()
        }
    }

    const removeConfirm = function(){
        let newtabConfirm = document.getElementById('pkt_ext_newtab_confirm')
        newtabConfirm.parentNode.removeChild(newtabConfirm)
    }

    const showRecents = function(){
        let googleTiles = document.getElementById('most-visited')
        document.getElementById('mv-tiles').style.height = '11em'
        googleTiles.style.display = ''
        googleTiles.style.opacity = ''
        sendMessage({
            action: 'sendAnalyticsNewtab',
            ctx: {
                view: 'extension',
                section: 'newtab',
                identifier: 'toggle_recents_on'
            }
        })
    }

    const hideRecents = function(){
        let googleTiles = document.getElementById('most-visited')
        googleTiles.style.display = 'none'
        sendMessage({
            action: 'sendAnalyticsNewtab',
            ctx: {
                view: 'extension',
                section: 'newtab',
                identifier: 'toggle_recents_off'
            }
        })
    }

    const setConfirmActions = function(){
        $('#pkt_ext_newtab_confirm_close').on('click', function(e){
            e.preventDefault()
            removeConfirm()

        })
        $('#pkt_ext_newtab_survey').attr('href', 'https://www.surveymonkey.com/r/hiddingrecs')
        $('#pkt_ext_newtab_enable').on('click', function(e){
            e.preventDefault()
            sendMessage({
                action: 'setSetting',
                key: 'newtab',
                value: 'true'
            }, () => {
                removeConfirm()
                initNewTab()
            })
        })
    }

    const checkImages = function() {
        $('.pkt_ext_newtab_backtile').each(function(index, rec){
            let testImage   = document.createElement('img')
            let recElement  = $(rec)
            let imageSource = recElement.data('imgsrc')
            let urlSource   = 'url(\'' + imageSource + '\')'

            $(testImage)
                .on('load', () => {
                    if(testImage.naturalHeight < 80 || testImage.naturalWidth < 80) {
                        recElement.hide()
                    }
                    else{
                        recElement.parent().addClass('pkt_ext_has_image')
                        rec.style.backgroundImage = urlSource
                        rec.classList.add('image_active')
                    }
                })
                .on('error', function() { recElement.hide() })
                .attr('src', imageSource)
        })
    }

    const domainForURL = function(url){
        let domainMatch = /\/\/([^\/]*)/.exec(url)
        return domainMatch ? domainMatch[1].replace(/^www\./,'') : false
    }

    const slugForURL = function(url){
        var index = url.lastIndexOf('/')+1
        return url.substr(index)
    }

    const unsetActiveNew = function(){

        active_new = false
        sendMessage({
            action: 'setSetting',
            key: 'active_new',
            value: 'false'
        }, () => {
            $('.pkt_ext_newtab_intro').hide()
            $('.pkt_ext_trending_hide').removeClass('pkt_ext_active_new')
        })
    }

    const toggleRecentOption = function(isOn){

        if(isOn){
            should_recent = true
            $('.pkt_ext_show_recent').hide()
            $('.pkt_ext_hide_recent').show()
        } else {
            should_recent = false
            $('.pkt_ext_show_recent').show()
            $('.pkt_ext_hide_recent').hide()
        }
    }

    const setActions = function (){
        let feedback_panel = $('.pkt_ext_newtab_feedback'),
            feedback_timer,
            feedback_survey = 'https://www.surveymonkey.com/r/newtabrollout'

        $('.pkt_ext_rec_save').on('click', function(e){
            e.preventDefault()
            let recSave = $(this)
            let rec = recSave.closest('.pkt_ext_recommendation')
            let message = {
                action      : 'saveRecToPocket',
                item_id     : rec.attr('rec_id'),
                url         : rec.attr('rec_url'),
                title       : rec.attr('rec_title'),
                source_id   : rec.attr('rec_source'),
                position    : parseInt(rec.attr('rec_position'), 10)
            }

            if(recSave.hasClass('saved')){
                sendMessage({
                    action: 'removeURL',
                    item_id: rec.attr('rec_id')
                }, (response) => {
                    if (response.status == 'success') {
                        recSave.removeClass('saved')
                        recSave.find('.pkt_ext_save_copy').text(PKT_EXT.TRANS['save'])
                    }
                })

            } else {
                sendMessage(message,
                    (response) => {
                        if (response && response.status == 'success') {
                            recSave.addClass('saved')
                            recSave.find('.pkt_ext_save_copy').text('Saved')
                        }
                        else {
                            log.warn(response)
                        }
                    })

                sendMessage({
                    action: 'sendAnalyticsNewtab',
                    ctx: {
                        view: 'extension',
                        section: 'newtab',
                        identifier: 'rec_save',
                        cxt_item_id : message.item_id,
                        cxt_index: rec.attr('rec_index')
                    }
                })

            }
        })

        $('.pkt_ext_read_link').on('click', function(e){
            e.preventDefault()
            var rec = $(this).closest('.pkt_ext_tile')
            sendMessage({
                action: 'sendAnalyticsNewtab',
                ctx: {
                    view: 'extension',
                    section: 'newtab',
                    identifier: 'rec_click',
                    cxt_item_id : rec.attr('rec_id'),
                    cxt_index: rec.attr('rec_index')
                }
            })
            window.location = $(this).attr('href')
        })

        $('.pkt_ext_tile_viewmore').on('click', function(e){
            e.preventDefault()
            sendMessage({
                action: 'sendAnalyticsNewtab',
                ctx: {
                    view: 'extension',
                    section: 'newtab',
                    identifier: 'view_more_stories'
                }
            })
            window.location = $(this).attr('href')
        })

        $('.pkt_ext_via_pocket').on('click', function(e){
            e.preventDefault()
            sendMessage({
                action: 'sendAnalyticsNewtab',
                ctx: {
                    view: 'extension',
                    section: 'newtab',
                    identifier: 'click_via_pocket'
                }
            })
            window.location = $(this).attr('href')
        })

        $('.pkt_ext_trending_topic').on('click', function(e){
            e.preventDefault()
            var trend = $(this)
            sendMessage({
                action: 'sendAnalyticsNewtab',
                ctx: {
                    view: 'extension',
                    section: 'newtab',
                    identifier: 'topic_click',
                    cxt_slug : trend.attr('topic_slug'),
                    cxt_index: trend.attr('topic_position')
                }
            })
            window.location = $(this).attr('href')
        })

        $('.pkt_ext_hide_newtab').on('click', function(e){
            e.preventDefault()
            sendMessage({
                action: 'sendAnalyticsNewtab',
                ctx: {
                    view: 'extension',
                    section: 'newtab',
                    identifier: 'hide'
                }
            })

            sendMessage({
                action: 'setSetting',
                key: 'newtab',
                value: 'false'
            }, () => {
                removeContainer()
                unsetActiveNew()
            })
        })

        $('.pkt_ext_trending_hide').on('click', function(e){
            e.preventDefault()
            e.stopPropagation()
            feedback_panel.toggle()
            feedback_timer = setTimeout(function(){
                feedback_panel.hide()
            }, 10000)
        })

        $('.pkt_ext_show_recent').on('click', function(e){
            e.preventDefault()
            sendMessage({
                action: 'setSetting',
                key: 'newtab_recents',
                value: 'true'
            }, showRecents)

            toggleRecentOption(true)
            unsetActiveNew()
        })

        $('.pkt_ext_hide_recent').on('click', function(e){
            e.preventDefault()
            sendMessage({
                action: 'setSetting',
                key: 'newtab_recents',
                value: 'false'
            }, hideRecents)

            toggleRecentOption(false)
            unsetActiveNew()
        })

        $('.pkt_ext_send_feedback').attr('href', feedback_survey)

        feedback_panel.on('mouseenter', function(){
            clearTimeout(feedback_timer)
        })
        feedback_panel.on('mouseleave', function(){
            hidePanel(feedback_panel, feedback_timer)
        })

        $('html').click(function() {
            hidePanel(feedback_panel, feedback_timer)
        })

        feedback_panel.on('click', function(e){
            e.stopPropagation()
        })
    }

    const hidePanel = function(feedback_panel, feedback_timer){
        clearTimeout(feedback_timer)
        feedback_panel.hide()
    }

    const buildNewTabRecs = function(recData, tabCount, trends){
        log.debug('Building New Tab Recs', {recData, tabCount})
        for (var i = 0; i < recData.list.length; i++) {
            recData.list[i].has_image = recData.list[i].has_image === '1'
            if(recData.list[i].has_image && recData.list[i].images[1]){
                recData.list[i].resolved_image = getImageCacheUrl(recData.list[i].images[1].src, 'w200')
            }
            recData.list[i].domain = domainForURL(recData.list[i].resolved_url)
            recData.list[i].index_position = i+1

            if(recData.list[i].impression_info){
                var impression = recData.list[i].impression_info
                var item       = recData.list[i].item
                if(impression.display.format.tile_type && impression.display.format.tile_type === 'icon_tile') {
                    recData.list[i].is_topic_tile   = true
                    item.redirect_url               = item.redirect_url + '&extra_content=tile'
                    recData.list[i].resolved_id     = item.resolved_id
                    recData.list[i].resolved_url    = item.resolved_url
                } else {
                    recData.list[i].has_image       = true
                    recData.list[i].resolved_image  = impression.display.image.src
                    recData.list[i].resolved_url    = item.resolved_url
                    recData.list[i].redirect_url    = item.redirect_url + '&extra_content=tile'
                    recData.list[i].title           = item.title
                    recData.list[i].excerpt         = item.excerpt
                    recData.list[i].domain          = impression.display.domain
                    recData.list[i].resolved_id     = item.resolved_id
                }

                if(tabCount % 4 !== 0){
                    recData.list[i] = recData.list[i+1]
                }
            }
        }
        recData.list.pop()
        recData['active_new_class'] = (active_new) ? 'pkt_ext_active_new' : ''
        $(function(){
            log.debug('Injecting Recommendations')
            $('#pkt_ext_must_reads').append(PKT_EXT.TEMPLATES.newtab_recs(recData))
            toggleRecentOption(should_recent)
            sendNewTabRecsAnalytics(recData, trends)
        })
    }

    const sendNewTabRecsAnalytics = function(recData, trends){
        let cxt_obj = {
            view: 'extension',
            section: 'newtab',
            identifier: 'displayed',
            cxt_recs_cnt : recData.list.length,
            cxt_topics_cnt : trends.value.topics.length,
            cxt_imp1_item_id : recData.list[0].resolved_id,
            cxt_imp2_item_id : recData.list[1].resolved_id,
            cxt_imp3_item_id : recData.list[2].resolved_id,
            cxt_recents_ind : (should_recent) ? 1 : 0,
            cxt_intro_ind : (active_new) ? 1 : 0,
        }
        log.debug(cxt_obj)

        sendMessage({
            action: 'sendAnalyticsNewtab',
            ctx: cxt_obj
        })
    }

    const buildNewTabTrends = function(trendData, active_new){
        log.debug('Building New Tab Trends', {trendData})
        for (var i = 0; i < trendData.topics.length; i++) {
            trendData.topics[i].slug =slugForURL(trendData.topics[i].url)
            trendData.topics[i].topic_position = i+1
        }
        trendData['hasTopics'] = trendData.topics.length
        trendData['active_new'] = active_new
        trendData['view_more_link'] = 'https://getpocket.com/a/recommended/?s=newtab'
        $(function(){
            log.debug('Injecting Trend Data')
            $('#pkt_ext_trending').append(PKT_EXT.TEMPLATES.newtab_trends(trendData))

        })
    }

    const getGlobalRecommendations = function(){
        let recs = Q.defer()
        sendMessage({
            action: 'getGlobalRecommendations',
        }, (response) => {
            if (response && response.status == 'success') recs.resolve(response.data)
            else recs.reject('No recs')

            if(response.server){
                log.debug('Live Response Needs Caching', response.data)
                sendMessage({
                    action: 'setSetting',
                    key: 'new_tab_rec_updated',
                    value: Date.now()
                }, () => {})
            } else {
                log.debug('Cached Response', response)
            }
        })

        return recs.promise
    }

    const getGlobalTrendingTopics = function(){

        let trends = Q.defer()
        sendMessage({
            action: 'getGlobalTrendingTopics',
        }, (response) => {
            if (response && response.status == 'success') trends.resolve(response.data)
            else trends.reject('No trendingData')
        })
        return trends.promise
    }

    /* Initialize New Tab
    –––––––––––––––––––––––––––––––––––––––––––––––––– */
    const initNewTab = function(){

        if(isLocal()) log.setLevel('DEBUG')

        log.debug('Initialize New Tab')
        hideChromeSiteTiles()
        returnSetup()
        .then(
            setup => { getNewtabSettings(setup) },
            () => { log.warn('Setup Not Returned')}
        )
    }

    const buildNewTab = function( settings ){

        if(!settings.should_show_pocket_newtab){
            log.debug('New Tab Unset, Reseting to Original State')
            return showChromeSiteTiles()
        }

        log.debug('Building New Tab')
        Q.allSettled([
            getGlobalRecommendations().timeout(5000, 'timed out'),
            getGlobalTrendingTopics().timeout(5000, 'timed out')
        ])
        .spread(function (recs, trends) {
            log.debug('Recs and Trends settled')

            should_recent = settings.should_show_google_tiles
            active_new    = settings.is_active_new
            tab_count     = settings.new_tab_open_count

            // TabCount should dump us into recessive mode.
            if(tab_count > 9 && active_new){
                active_new = false
                sendMessage({
                    action: 'setSetting',
                    key: 'active_new',
                    value: 'false'
                }, () => {})
            }

            log.debug('Should we show recent tiles? ', {active_new, tab_count, should_recent})
            injectContainer(should_recent)

            if(recs.state === 'fulfilled'){
                log.debug('Recs Fullfilled', recs.value)
                buildNewTabRecs(recs.value, settings.new_tab_open_count, trends)
            }

            if(trends.state === 'fulfilled'){
                log.debug('Trends Fullfilled', trends)
                buildNewTabTrends(trends.value, active_new)
            }

            setActions()
            checkImages()

        })

    }

    /* Getting All Settings
    –––––––––––––––––––––––––––––––––––––––––––––––––– */
    const isResponseValid = function( response ){
        return ( response && Object.getOwnPropertyNames(response).length > 0 )
    }

    const returnSetup = function(){
        log.debug('Getting Setup')
        let setup = Q.defer()
        sendMessage({ action: 'getSetup' }, (response) => {
            if (response.status == 'success') setup.resolve(response.setup)
            else setup.reject('Response Error')
        })
        return setup.promise
    }

    const returnTabCount = function( ){
        let tabCount = Q.defer()
        sendMessage({
            action: 'getSetting',
            key: 'new_tab_count'
        }, (response) => {
            let newtabCount = '0'
            if (Object.getOwnPropertyNames(response).length) {
                newtabCount = parseInt(response.value,10) + 1
            }
            tabCount.resolve(newtabCount)
            sendMessage({
                action: 'setSetting',
                key: 'new_tab_count',
                value: newtabCount
            }, ()=>{})
        })
        return tabCount.promise
    }

    const returnUserOption = function( setup ){

        let newTabOption = Q.defer()
        sendMessage({
            action: 'getSetting',
            key: 'newtab'
        }, (response) => {

            if(getCurrentLanguageCode() !== 'en') {
                sendMessage({
                    action: 'setSetting',
                    key: 'newtab',
                    value: 'false'
                }, () => {})
                return newTabOption.resolve(false)
            }

            if ( !isResponseValid(response) ) {
                sendMessage({
                    action: 'setSetting',
                    key: 'newtab',
                    value: setup.new_tab
                }, () => {})
                newTabOption.resolve(setup.new_tab)
            }

            if ( isResponseValid( response ) && response.value == 'true' && setup.new_tab ) {
                newTabOption.resolve(true)
            } else {
                newTabOption.resolve(false)
            }
        })
        return newTabOption.promise
    }

    const returnGoogleTileOption = function( setup ){
        let checkRecent = Q.defer()
        sendMessage({
            action: 'getSetting',
            key: 'newtab_recents'
        }, (response) => {
            var showGoogleTiles = false
            if ( !isResponseValid(response) ) {
                sendMessage({
                    action: 'setSetting',
                    key: 'newtab_recents',
                    value: 'false'
                }, () => {})
            }
            if (isResponseValid(response) && response.value == 'true') {
                showGoogleTiles = true
            }

            checkRecent.resolve(showGoogleTiles)

        })
        return checkRecent.promise
    }

    const returnActiveNewOption = function(){
        let isNew = Q.defer()
        sendMessage({
            action: 'getSetting',
            key: 'active_new'
        }, (response) => {
            active_new = true
            if(!isResponseValid(response)){
                sendMessage({
                    action: 'setSetting',
                    key: 'active_new',
                    value: active_new
                }, function(){})
            }
            if (isResponseValid(response) && response.value == 'false') {
                active_new = false
            }
            isNew.resolve(active_new)
        })
        return isNew.promise
    }

    const getNewtabSettings = function( setup ){
        log.debug('Getting New Tab Settings')
        Q.allSettled([
            returnTabCount(),
            returnUserOption(setup),
            returnGoogleTileOption(setup),
            returnActiveNewOption()
        ])
        .spread(function ( count, optIn, tiles, active) {
            log.debug('All Settings Returned: ', { count, optIn, tiles, active})
            var settings = {
                new_tab_open_count: count.value,
                should_show_pocket_newtab: optIn.value,
                should_show_google_tiles: (tiles.value && !active.value),
                is_active_new: active.value
            }
            buildNewTab(settings)
        })
    }

    /* Message Handling
    –––––––––––––––––––––––––––––––––––––––––––––––––– */
    const handleMessageResponse = function(request) {
        if(request && request.status == 'success'){
            var savedRec = $('#pkt_'+request.item_id)
            savedRec.find('.pkt_ext_rec_save').addClass('saved')
            savedRec.find('.pkt_ext_save_copy').text('Saved')
        }
    }

    // http://regexr.com/3ep2r
    if((/http(s)?:\/\/www\.google\.([a-zA-z]{2}|com)(\.[a-zA-z]{2,3})?\/_\/chrome\/newtab/).test(document.location.href)){
        // Handles General Messages send to the newtab from background.js
        chrome.runtime.onMessage.addListener(handleMessageResponse)

        sendMessage({
            action: 'getSetting',
            key: 'loglevel'
        }, (response) => {
            log.setLevel(response.value || 'SILENT')
        })

        initNewTab()

    }

    PKT_EXT.newtab = { initNewTab }

}(PKT_EXT || {}))



