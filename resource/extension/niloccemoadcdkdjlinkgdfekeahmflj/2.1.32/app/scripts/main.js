/* global chrome PKT_EXT */
(function(PKT_EXT){


    var showStateSaved  = function(urlToSave, itemID, features, saveType) {
        PKT_EXT.ERROR.closeError()
        PKT_EXT.SAVE.saveURL( urlToSave, itemID, features, saveType)
    }


    var showStateError  = function() {
        PKT_EXT.SAVE.closeSave()
        PKT_EXT.ERROR.saveError(PKT_EXT.TRANS['page_not_saved'], PKT_EXT.TRANS['page_not_saved_detail'])
    }


    var showStateUnauthorized  = function() {
        PKT_EXT.SAVE.closeSave()
        PKT_EXT.ERROR.saveError(PKT_EXT.TRANS['server_error'], PKT_EXT.TRANS['server_error_detail'])
    }


    var addMessageListener = function(){
        chrome.runtime.onMessage.addListener(handleMessageResponse)
    }

    var handleMessageResponse = function(request) {
        switch(request.status){

            case 'success':
                showStateSaved(request.features.url, request.item_id, request.features, request.saveType)
                break

            case 'unauthorized':
                showStateUnauthorized()
                break

            case 'error':
                showStateError()
                break

        }

        return true

    }

    if(!(/chrome\/newtab/).test(document.location.href)) {
        addMessageListener(handleMessageResponse)
    }

}(PKT_EXT || {}))
