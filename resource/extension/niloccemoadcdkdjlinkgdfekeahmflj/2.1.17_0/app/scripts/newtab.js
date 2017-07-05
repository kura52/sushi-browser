/*global $, Q, PKT_EXT, getImageCacheUrl, chrome, log*/

(function(PKT_EXT){

    let setup, should_recent, active_new = true
    const sendMessage = PKT_EXT.INTERFACE.sendMessage

    const injectContainer = function(force){
        $(function(){
            let googleTiles = document.getElementById('most-visited')

            if(googleTiles){

                $('#most-visited').css('margin-top', '0')
                $('#prm-pt').css('margin-top', '15px').insertBefore('#most-visited')

                if( force ){
                    document.getElementById('mv-tiles').style.height = '11em'
                }
                else {
                    googleTiles.style.display = 'none'
                }

                $('body').append(PKT_EXT.TEMPLATES.newtab())

                // googleTiles.insertAdjacentHTML('afterend', PKT_EXT.TEMPLATES.newtab())
            }
        })
    }

    const prepNewTab = function(){
        // $(function(){
        //     let googleTiles = document.getElementById('most-visited')

        //     if(googleTiles){
        //         googleTiles.style.opacity = 0
        //     }
        // })
    }

    const removeContainer = function(){
        let googleTiles = document.getElementById('most-visited')

        if(googleTiles){
            document.getElementById('mv-tiles').style.height = ''
            googleTiles.style.display = ''
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
        $('#pkt_ext_newtab_survey').on('click', function(e){
            // e.preventDefault()
            // sendMessage({
            //     action: 'sendAnalyticsNewtab',
            //     ctx: {
            //         view: 'extension',
            //         section: 'newtab',
            //         identifier: 'rec_save',
            //         cxt_item_id : message.item_id,
            //         cxt_index: rec.attr('rec_index')
            //     }
            // })
        })
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
            let testImage = document.createElement('img')
            $(testImage)
                .on('load', () => {
                    if(testImage.naturalHeight < 80 || testImage.naturalWidth < 80) { unsetImages(rec) }
                    else{ rec.classList.add('image_active') }
                })
                .on('error', function() {unsetImages(rec)})
                .attr('src', $(rec).data('imgsrc'))
        })
    }

    const unsetImages = function(rec){
        let item = $(rec)
        item.css('background-image', '')
        item.parent().removeClass('pkt_ext_has_image')
    }

    const domainForURL = function(url){
        let domainMatch = /\/\/([^\/]*)/.exec(url)
        return domainMatch ? domainMatch[1].replace(/^www\./,'') : false
    }

    const slugForURL = function(url){
        var index = url.lastIndexOf('/')+1
        return url.substr(index)
    }

    const getSurveyLink = function(){
        return (setup && setup.new_tab_recent) ? 'https://www.surveymonkey.com/r/newtabwithrecents' : 'https://www.surveymonkey.com/r/newtabnorecents'
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
                            console.warn(response)
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

    const buildNewTabRecs = function(recData){
        for (var i = 0; i < recData.list.length; i++) {
            recData.list[i].has_image = recData.list[i].has_image === '1'
            if(recData.list[i].has_image && recData.list[i].images[1]){
                recData.list[i].resolved_image = getImageCacheUrl(recData.list[i].images[1].src)
            }
            recData.list[i].domain = domainForURL(recData.list[i].resolved_url)
            recData.list[i].index_position = i+1
        }
        recData['active_new_class'] = (active_new) ? 'pkt_ext_active_new' : ''
        $(function(){
            $('#pkt_ext_must_reads').append(PKT_EXT.TEMPLATES.newtabReads(recData))
            toggleRecentOption(should_recent)
        })
    }

    const buildNewTabTrends = function(trendData){
        for (var i = 0; i < trendData.topics.length; i++) {
            trendData.topics[i].slug =slugForURL(trendData.topics[i].url)
            trendData.topics[i].topic_position = i+1
        }
        trendData['hasTopics'] = trendData.topics.length
        trendData['active_new'] = (active_new && !setup.new_tab_recent)
        $(function(){
            $('#pkt_ext_trending').append(PKT_EXT.TEMPLATES.newtabTrends(trendData))

        })
    }


    const getGlobalRecommendations = function(){
        let recs = Q.defer()
        sendMessage({
            action: 'getGlobalRecommendations',
        }, (response) => {
            if (response && response.status == 'success') recs.resolve(response.data)
            else recs.reject('No recs')
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

    const getActiveNew = function(){
        let isNew = Q.defer()
        sendMessage({
            action: 'getSetting',
            key: 'active_new'
        }, (response) => {
            if (response && (Object.getOwnPropertyNames(response).length > 0 && response.value == 'false')) {
                active_new = false
            } else {
                active_new = true
            }
            isNew.resolve(active_new)
        })
        return isNew.promise
    }

    const getNewTabRecents = function(){
        let checkRecent = Q.defer()
        sendMessage({
            action: 'getSetting',
            key: 'newtab_recents'
        }, (response) => {
            if(!Object.getOwnPropertyNames(response).length) {
                checkRecent.resolve({should_recent: setup.new_tab_recent , active_new: true})
            } else if (response && (Object.getOwnPropertyNames(response).length > 0 && response.value == 'true')) {
                checkRecent.resolve({should_recent: true , active_new: false})
            } else {
                checkRecent.resolve({should_recent: false, active_new: false})
            }

        })
        return checkRecent.promise
    }
    const getNewTabCount = function(){
        let stillActive = Q.defer()
        sendMessage({
            action: 'getSetting',
            key: 'new_tab_count'
        }, (response) => {
            if (!Object.getOwnPropertyNames(response).length) {
                stillActive.resolve(0)
            } else {
                stillActive.resolve(parseInt(response.value,10))
            }

        })
        return stillActive.promise
    }
    const initNewTab = function(force){
        if(setup && !setup.new_tab && !force) return


        Q.allSettled([
            getGlobalRecommendations(),
            getGlobalTrendingTopics(),
            getActiveNew(),
            getNewTabRecents(),
            getNewTabCount()
        ])
        .spread(function (recs, trends, activeNew, recents, tabCount) {

            should_recent = recents.value.should_recent
            active_new    = (activeNew.value && recents.value.active_new)

            // TabCount should dump us into recessive mode.
            log.debug(tabCount.value,tabCount.value > 9,active_new)
            if(tabCount.value > 9 && active_new){
                active_new = false
                sendMessage({
                    action: 'setSetting',
                    key: 'active_new',
                    value: 'false'
                }, () => {})
            }


            // Set Active New Once
            sendMessage({
                action: 'setSetting',
                key: 'active_new',
                value: (active_new) ? 'true' : 'false'
            }, () => {})

            injectContainer(recents.value.should_recent)
            if(recs.state === 'fulfilled') buildNewTabRecs(recs.value)
            if(trends.state === 'fulfilled') buildNewTabTrends(trends.value)

            setActions()
            checkImages()

            let cxt_obj = {
                view: 'extension',
                section: 'newtab',
                identifier: 'displayed',
                cxt_recs_cnt : recs.value.list.length,
                cxt_topics_cnt : trends.value.topics.length,
                cxt_imp1_item_id : recs.value.list[0].item_id,
                cxt_imp2_item_id : recs.value.list[1].item_id,
                cxt_imp3_item_id : recs.value.list[2].item_id,
                cxt_recents_ind : (should_recent) ? 1 : 0,
                cxt_intro_ind : (active_new) ? 1 : 0,
            }
            log.debug(cxt_obj)

            sendMessage({
                action: 'sendAnalyticsNewtab',
                ctx: cxt_obj
            })

        })

    }

    const shouldNewTab = function(){

        sendMessage({
            action: 'getSetting',
            key: 'newtab'
        }, (response) => {
            if (!Object.getOwnPropertyNames(response).length) {

                sendMessage({
                    action: 'setSetting',
                    key: 'newtab',
                    value: 'true'
                }, () => {
                    initNewTab()
                })

            }
            else if (response && (Object.getOwnPropertyNames(response).length > 0 && response.value == 'true')) {
                initNewTab()
            }
        })


    }

    const handleMessageResponse = function(request) {
        if(request && request.status == 'success'){
            var savedRec = $('#pkt_'+request.item_id)
            savedRec.find('.pkt_ext_rec_save').addClass('saved')
            savedRec.find('.pkt_ext_save_copy').text('Saved')
        }
    }

    // Find out if we are in the test or not

    // http://regexr.com/3ep2r
    if((/http(s)?:\/\/www\.google\.([a-zA-z]{2}|com)(\.[a-zA-z]{2,3})?\/_\/chrome\/newtab/).test(document.location.href)){

        log.debug('Initializing Newtab')

        chrome.runtime.onMessage.addListener(handleMessageResponse)

        sendMessage({
            action: 'getSetting',
            key: 'new_tab_count'
        }, (response) => {
            let newtabCount = '0'
            if (Object.getOwnPropertyNames(response).length) {
                newtabCount = parseInt(response.value,10) + 1
            }

            sendMessage({
                action: 'setSetting',
                key: 'new_tab_count',
                value: newtabCount
            }, ()=>{})

        })

        sendMessage({
            action: 'getSetup',
        }, (response) => {

            if (response.status == 'success') {
                setup = response.setup
                shouldNewTab()
            }

        })

        prepNewTab()
    }

    PKT_EXT.newtab = { initNewTab }

}(PKT_EXT || {}))



