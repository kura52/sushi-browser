/* globals getCurrentLanguageCode */
var PKT_EXT     = PKT_EXT || {}

PKT_EXT.i18n    = (function(PKT_EXT) {

    if (!String.prototype.supplant) {
        String.prototype.supplant = function (o) {
            return this.replace(/\{([^{}]*)\}/g,
            function (a, b) {
                var r = o[b]
                return typeof r === 'string' || typeof r === 'number' ? r : a
            })
        }
    }

    var getLocalizationObjects = function(){
        var path = '_locales/' + getCurrentLanguageCode() + '/messages.json'
        path = PKT_EXT.INTERFACE.getPath( path )

        var xhr = new XMLHttpRequest()
        xhr.open('GET', path, false)
        xhr.send(null)

        return JSON.parse(xhr.responseText)
    }
    var localizationObjects = getLocalizationObjects()

    /**
     * Search
     * @param  {string} key Key to search for the localized string
     * @return {string}     Localized String for the given key
     */
    var getMessageForKey = function(key) {
        var localizationObject = localizationObjects[key]
        if (typeof localizationObject === 'undefined') return localizationObject
        return localizationObject['message']
    }


    // Public methods

    /**
     * Get localized string for a given key. Replace all placeholder that are existing
     * in the localized string of the key that are wrapped in { } braces and
     * named $0, $1 with the placeholder value in the placeholderValue array.
     * E.g. "This has a {$0}.", ["placeholder"] -> "This has a placeholder."
     * @param  {string} key               Key for the localized string
     * @param  {Array}  placeholderValues Placeholder values to replace within the localization process
     * @return {string}                   Localized string
     */
    var getMessagePlaceholder = function(key, placeholderValues) {
        var locString = getMessageForKey(key)

        // If we didn't found a localized string return undefined
        if (typeof locString === 'undefined') return locString

        // Substitute all placeholder
        // String with multiple placeholders: This is a {$1} string with multiple {$2}
        if (typeof placeholderValues !== 'undefined' && placeholderValues.length > 0) {
            // Create params to substitute
            var params = {}
            for (var i = 0; i < placeholderValues.length; i++) {
                var placeholderValue = placeholderValues[i]
                var placeholderKey = '$'+i
                params[placeholderKey] = placeholderValue
            }
            locString = locString.supplant(params)
        }

        return locString
    }

    /**
     * Get localized string for a given key. Helper method for getMessagePlaceholder
     * @param  {string} key Key for the localized string
     * @return {string}     Localized string
     */
    var getMessage = function(key) {
        // Helper function to call getMessagePlaceholder and no placeholder values
        return getMessagePlaceholder(key, undefined)
    }

    /**
     * Search the html file for "data-localize" attributes and replace the
     * inner html of the element with the localized text
     * http://stackoverflow.com/questions/9496427/how-to-get-elements-by-attribute-selector-w-native-javascript-w-o-queryselector
     */
    var initLocalization = function() {
        // Search for all elements with data-localize attribute and localize
        // the string
        var elementsToLocalize = document.querySelectorAll('[data-localize]')
        for (var i = 0; i < elementsToLocalize.length; i++) {
            var elementToLocalize = elementsToLocalize[i]
            var attributeValue = elementToLocalize.dataset['localize']
            var locString = getMessage(attributeValue)
            if (typeof locString !== 'undefined') {
                elementToLocalize.innerHTML = locString
            }
        }
    }

    /**
     * Get path for the file with localizations for the Pocker overlay that
     * appears on top of the pages after save
     * @return {string} File path to loclization file for Pocket overlay
     */
    var getFilePathForPocketOverlayLocalization = function() {
        return '_locales/' + getCurrentLanguageCode() + '/r.js'
    }

    /*
     * Module interface
     */
    return {
        initLocalization : initLocalization,
        getMessage: getMessage,
        getMessagePlaceholder: getMessagePlaceholder,
        getCurrentSupportedLanguageCode: getCurrentLanguageCode,
        getFilePathForPocketOverlayLocalization: getFilePathForPocketOverlayLocalization
    }

}(PKT_EXT || {}))
