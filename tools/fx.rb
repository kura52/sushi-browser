# var arr = [];for(let e of document.querySelector('#wikiArticle').querySelectorAll('h2,.bc-table.bc-table-ext tbody tr th>code,.bc-table.bc-table-ext tbody tr td.bc-browser-chrome,.bc-table.bc-table-ext tbody tr td.bc-browser-firefox')){arr.push(e.tagName=="H2" ? `#${e.innerText.replace(/[ \r\n]+/g,' ')}` : e.innerText.replace(/[ \r\n]+/g,' '))};arr.join("\n")
# https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Browser_support_for_JavaScript_APIs

arr = []
tmp = nil
name = ""
%{#alarms
Alarm
 Full support Yes
 Full support 45
clear
 Full support Yes
 Full support 45
clearAll
 Full support Yes
 Full support 45
create
 Full support Yes
 Full support 45
get
 Full support Yes
 Full support 45
getAll
 Full support Yes
 Full support 45
onAlarm
 Full support Yes
 Full support 45
#bookmarks
BookmarkTreeNode
 Partial support Partial
 Partial support 45
BookmarkTreeNode.type
 No support No
 Full support 57
BookmarkTreeNodeType
 No support No
 Full support 57
BookmarkTreeNodeUnmodifiable
 Full support Yes
 Full support 45
CreateDetails
 Partial support Partial
 Partial support 45
CreateDetails.type
 No support No
 Full support 57
create
 Full support Yes
 Full support 45
get
 Full support Yes
 Full support 45
getChildren
 Full support Yes
 Full support 45
getRecent
 Full support Yes
 Full support 47
getSubTree
 Full support Yes
 Full support 45
getTree
 Full support Yes
 Full support 45
move
 Full support Yes
 Full support 45
onChanged
 Full support Yes
 Full support 52
onChildrenReordered
 Full support Yes
 No support No
onCreated
 Full support Yes
 Full support 52
onImportBegan
 Full support Yes
 No support No
onImportEnded
 Full support Yes
 No support No
onMoved
 Full support Yes
 Full support 52
onRemoved
 Full support Yes
 Full support 52
remove
 Full support Yes
 Full support 45
removeTree
 Full support Yes
 Full support 47
search
 Full support Yes
 Full support 47
update
 Full support Yes
 Full support 45
#browserAction
ColorArray
 Full support Yes
 Full support 45
ImageDataType
 Full support Yes
 Full support 45
disable
 Full support Yes
 Full support 45
enable
 Full support Yes
 Full support 45
getBadgeBackgroundColor
 Full support Yes
 Full support 45
getBadgeText
 Full support Yes
 Full support 45
getPopup
 Full support Yes
 Full support 45
getTitle
 Full support Yes
 Full support 45
onClicked
 Full support Yes
 Full support 45
openPopup
 No support No
 Full support 57
setBadgeBackgroundColor
 Full support Yes
 Full support 45
setBadgeText
 Full support Yes
 Full support 45Notes Full support 45Notes Notes On Firefox, the badge text is not cleared on navigation, see bug 1395074.
setIcon
 Partial support PartialNotes Partial support PartialNotes Notes Before Chrome 23, `path` couldn't specify multiple icon files, but had to be a string specifying a single icon path.
 Full support 45
setIcon.imageData
 Full support 23
 Full support 45
setPopup
 Full support Yes
 Full support 45
setTitle
 Full support Yes
 Full support 45
#browserSettings
allowPopupsForUserEvents
 No support No
 Full support 57
cacheEnabled
 No support No
 Full support 56
homepageOverride
 No support No
 Full support 57
imageAnimationBehavior
 No support No
 Full support 57
newTabPageOverride
 No support No
 Full support 57
webNotificationsDisabled
 No support No
 Full support 58
#browsingData
DataTypeSet.cache
 Full support Yes
 Full support 53
DataTypeSet.cookies
 Full support Yes
 Full support 53
DataTypeSet.downloads
 Full support Yes
 Full support 53
DataTypeSet.fileSystems
 Full support Yes
 No support No
DataTypeSet.formData
 Full support Yes
 Full support 53
DataTypeSet.history
 Full support Yes
 Full support 53
DataTypeSet.indexedDB
 Full support Yes
 No support No
DataTypeSet.localStorage
 Full support Yes
 Full support 57
DataTypeSet.passwords
 Full support Yes
 Full support 53
DataTypeSet.pluginData
 Full support Yes
 Full support 53
DataTypeSet.serverBoundCertificates
 Full support Yes
 No support No
DataTypeSet.serviceWorkers
 Full support Yes
 Full support 53
RemovalOptions.hostnames
 No support No
 Full support 56
RemovalOptions.originTypes
 Full support Yes
 No support No
RemovalOptions.since
 Full support Yes
 Full support 53Notes Full support 53Notes Notes since is not supported with the following data types: cache, indexedDB, localStorage, and serviceWorkers.
remove
 Full support Yes
 Full support 53Notes Full support 53Notes Notes Specifying dataTypes.history will also remove download history and service workers.
removeCache
 Full support Yes
 Full support 53Notes Full support 53Notes Notes removalOptions.since is not supported.
removeCookies
 Full support Yes
 Full support 53
removeDownloads
 Full support Yes
 Full support 53
removeFormData
 Full support Yes
 Full support 53
removeHistory
 Full support Yes
 Full support 53Notes Full support 53Notes Notes This function also removes download history and service workers.
removeLocalStorage
 Full support Yes
 Full support 57Notes Full support 57Notes Notes removalOptions.since is not supported.
removePasswords
 Full support Yes
 Full support 53
removePluginData
 Full support Yes
 Full support 53
settings
 Full support Yes
 Full support 53
#clipboard
setImageData
 No support No
 Full support 57
#commands
Command
 Full support Yes
 Full support 48
getAll
 Full support Yes
 Full support 48
onCommand
 Full support Yes
 Full support 48
#contextualIdentities
ContextualIdentity.cookieStoreId
 No support No
 Full support 53
ContextualIdentity.color
 No support No
 Full support 53
ContextualIdentity.colorCode
 No support No
 Full support 57
ContextualIdentity.icon
 No support No
 Full support 53
ContextualIdentity.iconUrl
 No support No
 Full support 57
ContextualIdentity.name
 No support No
 Full support 53
create
 No support No
 Full support 53Notes Full support 53Notes Notes Before version 57, this method resolves its promise with false if the contextual identities feature is disabled.
get
 No support No
 Full support 53Notes Full support 53Notes Notes Before version 57, this method resolves its promise with false if the contextual identities feature is disabled.Notes Before version 57, this method resolves its promise with null if the given identity was not found.
onCreated
 No support No
 Full support 57
onRemoved
 No support No
 Full support 57
onUpdated
 No support No
 Full support 57
query
 No support No
 Full support 53Notes Full support 53Notes Notes Before version 57, this method resolves its promise with false if the contextual identities feature is disabled.
remove
 No support No
 Full support 53Notes Full support 53Notes Notes Before version 57, this method resolves its promise with false if the contextual identities feature is disabled.Notes Before version 57, this method resolves its promise with null if the given identity was not found.
update
 No support No
 Full support 53Notes Full support 53Notes Notes Before version 57, this method resolves its promise with false if the contextual identities feature is disabled.Notes Before version 57, this method resolves its promise with null if the given identity was not found.
#cookies
Cookie
 Full support Yes
 Full support 45
CookieStore
 Full support Yes
 Full support 45
OnChangedCause
 Full support Yes
 Full support 45
get
 Full support Yes
 Full support 45Notes Full support 45Notes Notes Provides access to cookies from private browsing mode and container tabs since version 52.
getAll
 Full support Yes
 Full support 45Notes Full support 45Notes Notes Before version 52, the 'tabIds' list was empty and only cookies from the default cookie store were returned. From version 52 onwards, this has been fixed and the result includes cookies from private browsing mode and container tabs.
getAllCookieStores
 Full support Yes
 Full support 45Notes Full support 45Notes Notes Before version 52, only the default cookie store was visible. From version 52 onwards, the cookie stores for private browsing mode and container tabs are also readable.
onChanged
 Full support Yes
 Full support 45
remove
 Full support Yes
 Full support 45Notes Full support 45Notes Notes Before version 56, this function did not remove cookies from private browsing mode. From version 56 onwards this is fixed.
set
 Full support Yes
 Full support 45Notes Full support 45Notes Notes Before version 56, this function did not modify cookies in private browsing mode. From version 56 onwards this is fixed.
#devtools
inspectedWindow.eval
 Full support Yes
 Partial support 54
inspectedWindow.reload
 Full support Yes
 Full support 54
inspectedWindow.tabId
 Full support Yes
 Full support 54
network.onNavigated
 Full support Yes
 Full support 54
panels.create
 Full support Yes
 Full support 54
panels.elements
 Full support Yes
 Full support 56
panels.onThemeChanged
 No support No
 Full support 55
panels.themeName
 Full support 54
 Full support 55
#downloads
BooleanDelta
 Full support Yes
 Full support 47
DangerType
 Full support Yes
 Full support 47
DoubleDelta
 Full support Yes
 Full support 47
DownloadItem.byExtensionId
 Full support Yes
 Full support 47
DownloadItem.byExtensionName
 Full support Yes
 Full support 47
DownloadItem.bytesReceived
 Full support Yes
 Full support 47
DownloadItem.canResume
 Full support Yes
 Full support 47
DownloadItem.danger
 Full support Yes
 No support NoNotes No support NoNotes Notes Always given as 'safe'.
DownloadItem.endTime
 Full support Yes
 No support No
DownloadItem.error
 Full support Yes
 Full support 47
DownloadItem.estimatedEndTime
 Full support Yes
 Full support 57
DownloadItem.exists
 Full support Yes
 Full support 47
DownloadItem.filename
 Full support Yes
 Full support 47
DownloadItem.fileSize
 Full support Yes
 Full support 47
DownloadItem.id
 Full support Yes
 Full support 47
DownloadItem.incognito
 Full support Yes
 Full support 47
DownloadItem.mime
 Full support Yes
 Full support 47
DownloadItem.paused
 Full support Yes
 Full support 47
DownloadItem.referrer
 Full support Yes
 Full support 47
DownloadItem.startTime
 Full support Yes
 Full support 47
DownloadItem.state
 Full support Yes
 Full support 47
DownloadItem.totalBytes
 Full support Yes
 Full support 47
DownloadItem.url
 Full support Yes
 Full support 47
DownloadQuery
 Full support Yes
 Full support 47
DownloadTime
 Full support Yes
 Full support 47
FilenameConflictAction
 Full support Yes
 Partial support 47
FilenameConflictAction.prompt
 Full support Yes
 No support No
InterruptReason
 Full support Yes
 Full support 47
State
 Full support Yes
 Full support 47
StringDelta
 Full support Yes
 Full support 47
acceptDanger
 Full support Yes
 No support No
cancel
 Full support Yes
 Full support 48
download
 Partial support Partial
 Partial support 47
download.body
 Full support Yes
 Full support 52
download.conflictAction
 Full support Yes
 Full support 47
download.filename
 Full support Yes
 Full support 47
download.headers
 Full support Yes
 Full support 47
download.incognito
 No support No
 Full support 57
download.method
 Full support Yes
 Full support 47Notes Full support 47Notes Notes POST is supported from version 52.
download.saveAs
 Full support Yes
 Full support 52Notes Full support 52Notes Notes Before version 58, if this option was omitted, Firefox would never show the file chooser, regardless of the value of the browser's preference.
drag
 Full support Yes
 No support No
erase
 Full support Yes
 Full support 48
getFileIcon
 Full support Yes
 Full support 48
onChanged
 Full support Yes
 Full support 47
onCreated
 Full support Yes
 Full support 48
onErased
 Full support Yes
 Full support 48
open
 Full support Yes
 Full support 48
pause
 Full support Yes
 Full support 48
removeFile
 Full support Yes
 Full support 48
resume
 Full support Yes
 Full support 48
search
 Full support Yes
 Full support 47
setShelfEnabled
 Full support Yes
 No support No
show
 Full support Yes
 Full support 48
showDefaultFolder
 Full support Yes
 Full support 48
#events
Event
 Full support Yes
 No support No
Rule
 Full support Yes
 No support No
UrlFilter
 Full support Yes
 Full support 50
#extension
ViewType
 Full support Yes
 Full support 45
getBackgroundPage
 Full support Yes
 Full support 45
getExtensionTabs
 Full support Yes
 No support No
getURL
 Full support Yes
 Full support 45
getViews
 Full support Yes
 Full support 45Notes Full support 45Notes Notes If this is called from a page that is part of a private browsing window, such as a sidebar in a private window or a popup opened from a private window, then its return value will not include the extension's background page.
inIncognitoContext
 Full support Yes
 Full support 45
isAllowedFileSchemeAccess
 Full support Yes
 Full support 48
isAllowedIncognitoAccess
 Full support Yes
 Full support 48
lastError
 Full support Yes
 Full support 47
onRequest
 Full support Yes
 No support No
onRequestExternal
 Full support Yes
 No support No
sendRequest
 Full support Yes
 No support No
setUpdateUrlData
 Full support Yes
 No support No
#extensionTypes
ImageDetails
 Partial support PartialNotes Partial support PartialNotes Notes This feature is supported but not exposed through the 'extensionTypes' object.
 Full support 45
ImageFormat
 Partial support PartialNotes Partial support PartialNotes Notes This feature is supported but not exposed through the 'extensionTypes' object.
 Full support 45
RunAt
 Partial support 20Notes Partial support 20Notes Notes This feature is supported but not exposed through the 'extensionTypes' object.
 Full support 45
CSSOrigin
 No support No
 Full support 53
#find
find
 No support No
 Full support 57
highlightResults
 No support No
 Full support 57
removeHighlighting
 No support No
 Full support 57
#history
HistoryItem
 Full support Yes
 Partial support 49
HistoryItem.typedCount
 Full support Yes
 No support No
TransitionType
 Full support Yes
 Full support 50
VisitItem
 Full support Yes
 Full support 50
addUrl
 Partial support Partial
 Full support 49
addUrl.title
 No support No
 Full support 49
addUrl.transition
 No support No
 Full support 49
addUrl.visitTime
 No support No
 Full support 49
deleteAll
 Full support Yes
 Full support 49
deleteRange
 Full support Yes
 Full support 49
deleteUrl
 Full support Yes
 Full support 49
getVisits
 Full support Yes
 Full support 50
onTitleChanged
 No support No
 Full support 55
onVisitRemoved
 Full support Yes
 Full support 50
onVisited
 Full support Yes
 Full support 50Notes Full support 50Notes Notes Before version 56, the result object's 'title' was always an empty string. From version 56 onwards, it is set to the last known title, if that is available, or an empty string otherwise.
search
 Full support Yes
 Full support 49
#i18n
LanguageCode
 Full support 47
 Full support 45
detectLanguage
 Full support 47
 Full support 47
getAcceptLanguages
 Full support 47
 Full support 47
getMessage
 Full support 17
 Full support 45Notes Full support 45Notes Notes Firefox 47 and earlier returns "??" instead of "" if the message is not found in _locales, bug 1258199 changed this act to match Chrome, landed on Firefox 48.
getUILanguage
 Full support 35
 Full support 47
#identity
getRedirectURL
 Full support Yes
 Full support 53
launchWebAuthFlow
 Full support Yes
 Full support 53
#idle
IdleState
 Full support Yes
 Full support 45
onStateChanged
 Full support Yes
 Partial support 51
onStateChanged.locked
 Full support Yes
 No support No
queryState
 Full support Yes
 Partial support 45Notes Partial support 45Notes Notes Before version 51, Firefox always reports 'active'. After version 51, Firefox reports 'active' or 'idle' as appropriate.
queryState.locked
 Full support Yes
 No support No
setDetectionInterval
 Full support Yes
 Full support 51
#management
ExtensionInfo
 Full support Yes
 Partial support 51
ExtensionInfo.disabledReason
 Full support Yes
 No support No
ExtensionInfo.offlineEnabled
 Full support Yes
 No support No
ExtensionInfo.type
 Full support Yes
 Full support 55
ExtensionInfo.versionName
 Full support Yes
 No support No
get
 Full support Yes
 Full support 56
getAll
 Full support Yes
 Full support 55Notes Full support 55Notes Notes Before version 56, only extensions whose 'type' is 'theme' are returned.
getPermissionWarningsById
 Full support Yes
 No support No
getPermissionWarningsByManifest
 Full support Yes
 No support No
getSelf
 Full support Yes
 Full support 51
onDisabled
 Full support Yes
 No support No
onEnabled
 Full support Yes
 No support No
onInstalled
 Full support Yes
 No support No
onUninstalled
 Full support Yes
 No support No
setEnabled
 Full support Yes
 Full support 55Notes Full support 55Notes Notes Only extensions whose 'type' is 'theme' can be enabled and disabled.
uninstall
 Full support Yes
 No support No
uninstallSelf
 Partial support Partial
 Full support 51
uninstallSelf.dialogMessage
 No support No
 Full support 51
#menus
ACTION_MENU_TOP_LEVEL_LIMIT
 Full support YesAlternate Name Full support YesAlternate Name Alternate Name Uses the non-standard name: contextMenus.ACTION_MENU_TOP_LEVEL_LIMIT
 Full support 55 Full support 55 Full support 48Alternate Name Alternate Name Uses the non-standard name: contextMenus.ACTION_MENU_TOP_LEVEL_LIMIT
ContextType
 Partial support PartialAlternate Name Partial support PartialAlternate Name Alternate Name Uses the non-standard name: contextMenus.ContextType
 Full support 55 Full support 55Notes Notes 'The 'editable' context does not include password fields. Use the 'password' context for this. Full support 48Alternate Name Alternate Name Uses the non-standard name: contextMenus.ContextType
ContextType.bookmark
 No support No
 Full support 59
ContextType.browser_action
 Full support Yes
 Full support 53Notes Full support 53Notes Notes 'The 'editable' context does not include password fields. Use the 'password' context for this.
ContextType.launcher
 Full support Yes
 Full support 48
ContextType.page_action
 Full support Yes
 Full support 53
ContextType.password
 No support No
 Full support 53
ContextType.tab
 No support No
 Full support 53
ContextType.tools_menu
 No support No
 Full support 56Notes Full support 56Notes Notes Only available at menus.ContextType, not at contextMenus.ContextType.
ItemType
 Full support YesAlternate Name Full support YesAlternate Name Alternate Name Uses the non-standard name: contextMenus.ItemType
 Full support 55 Full support 55 Full support 48Alternate Name Alternate Name Uses the non-standard name: contextMenus.ItemType
OnClickData
 Partial support PartialAlternate Name Partial support PartialAlternate Name Alternate Name Uses the non-standard name: contextMenus.OnClickData
 Full support 55 Full support 55 Full support 48Alternate Name Alternate Name Uses the non-standard name: contextMenus.OnClickData
OnClickData.bookmarkId
 No support No
 Full support 59
OnClickData.frameId
 Full support 35Alternate Name Full support 35Alternate Name Alternate Name Uses the non-standard name: contextMenus.OnClickData.frameId
 Full support 55
OnClickData.linkText
 No support No
 Full support 56
OnClickData.modifiers
 No support No
 Full support 54
create
 Partial support PartialNotes Alternate Name Partial support PartialNotes Alternate Name Notes Items that don't specify 'contexts' do not inherit contexts from their parents.Alternate Name Uses the non-standard name: contextMenus.create
 Full support 55 Full support 55 Full support 48Notes Alternate Name Notes Before version 53, items that don't specify 'contexts' do not inherit contexts from their parents.Alternate Name Uses the non-standard name: contextMenus.create
create.command
 No support No
 Full support 55
create.icons
 No support No
 Full support 56
onClicked
 Full support YesAlternate Name Full support YesAlternate Name Alternate Name Uses the non-standard name: contextMenus.onClicked
 Full support 55 Full support 55 Full support 48Alternate Name Alternate Name Uses the non-standard name: contextMenus.onClicked
remove
 Full support YesAlternate Name Full support YesAlternate Name Alternate Name Uses the non-standard name: contextMenus.remove
 Full support 55 Full support 55 Full support 48Alternate Name Alternate Name Uses the non-standard name: contextMenus.remove
removeAll
 Full support YesAlternate Name Full support YesAlternate Name Alternate Name Uses the non-standard name: contextMenus.removeAll
 Full support 55 Full support 55 Full support 48Alternate Name Alternate Name Uses the non-standard name: contextMenus.removeAll
update
 Full support YesAlternate Name Full support YesAlternate Name Alternate Name Uses the non-standard name: contextMenus.update
 Full support 55 Full support 55 Full support 48Alternate Name Alternate Name Uses the non-standard name: contextMenus.update
#notifications
NotificationOptions
 Full support Yes
 Full support 45Notes Full support 45Notes Notes Only 'type', 'iconUrl', 'title', and 'message' are supported.
TemplateType
 Full support Yes
 Full support 45Notes Full support 45Notes Notes Only the 'basic' type is supported.
clear
 Full support Yes
 Full support 45
create
 Full support Yes
 Full support 45
getAll
 Full support Yes
 Full support 45
onButtonClicked
 Full support Yes
 No support No
onClicked
 Full support Yes
 Full support 47
onClosed
 Full support Yes
 Partial support 45
onClosed.byUser
 Full support Yes
 No support No
onShown
 No support No
 Full support 56
update
 Full support Yes
 No support No
#omnibox
OnInputEnteredDisposition
 Full support Yes
 Full support 52
SuggestResult
 Full support Yes
 Full support 52Notes Full support 52Notes Notes 'description' is interpreted as plain text, and XML markup is not recognised.
onInputCancelled
 Full support Yes
 Full support 52
onInputChanged
 Full support Yes
 Full support 52
onInputEntered
 Full support Yes
 Full support 52
onInputStarted
 Full support Yes
 Full support 52
setDefaultSuggestion
 Full support Yes
 Full support 52Notes Full support 52Notes Notes 'description' is interpreted as plain text, and XML markup is not recognised.
#pageAction
ImageDataType
 Full support Yes
 Full support 45
getPopup
 Full support Yes
 Full support 45
getTitle
 Full support Yes
 Full support 45
hide
 Full support Yes
 Full support 45
onClicked
 Full support Yes
 Full support 45
openPopup
 No support No
 Full support 57
setIcon
 Partial support PartialNotes Partial support PartialNotes Notes Before Chrome 23, `path` couldn't specify multiple icon files, but had to be a string specifying a single icon path.
 Full support 45
setIcon.imageData
 Full support 23
 Full support 45
setPopup
 Full support Yes
 Full support 45
setTitle
 Full support Yes
 Full support 45
show
 Full support Yes
 Full support 45
#permissions
contains
 Full support Yes
 Full support 55
getAll
 Full support Yes
 Full support 55
onAdded
 Full support Yes
 No support No
onRemoved
 Full support Yes
 No support No
Permissions
 Full support Yes
 Full support 55
remove
 Full support Yes
 Full support 55
request
 Full support Yes
 Full support 55Notes Full support 55Notes Notes The user will be prompted again for permissions that have been previously granted and then removed.
#pkcs11
getModuleSlots
 No support No
 Full support 58
installModule
 No support No
 Full support 58
isModuleInstalled
 No support No
 Full support 58
uninstallModule
 No support No
 Full support 58
#privacy
network.networkPredictionEnabled
 Full support Yes
 Full support 54
network.peerConnectionEnabled
 No support No
 Full support 55
network.webRTCIPHandlingPolicy
 Full support Yes
 Full support 54
services.passwordSavingEnabled
 Full support Yes
 Full support 56
websites.firstPartyIsolate
 No support No
 Full support 58
websites.hyperlinkAuditingEnabled
 Full support Yes
 Full support 54
websites.protectedContentEnabled
 Full support Yes
 No support No
websites.referrersEnabled
 Full support Yes
 Full support 56
websites.resistFingerprinting
 No support No
 Full support 58
websites.thirdPartyCookiesAllowed
 Full support Yes
 No support No
websites.trackingProtectionMode
 No support No
 Full support 57
#proxy
onProxyError
 No support No
 Full support 55
register
 No support No
 Full support 56 Full support 56 Full support 55Alternate Name Alternate Name Uses the non-standard name: registerProxyScript
unregister
 No support No
 Full support 56
#runtime
MessageSender
 Partial support 26
 Full support 45Notes Full support 45Notes Notes Before version 54, 'id' was the add-on's internal UUID, not the add-on ID.
MessageSender.url
 Full support 28
 Full support 45
MessageSender.tlsChannelId
 Full support 32
 Full support 45
MessageSender.frameId
 Full support 41
 Full support 45
OnInstalledReason
 Full support YesNotes Full support YesNotes Notes Uses 'chrome_update' instead of 'browser_update'.
 Full support 45
OnRestartRequiredReason
 Full support Yes
 Full support 45
PlatformArch
 Full support Yes
 Full support 45
PlatformInfo
 Full support Yes
 Partial support 45
PlatformInfo.nacl_arch
 Full support Yes
 No support No
PlatformNaclArch
 Full support Yes
 Full support 45
PlatformOs
 Full support Yes
 Full support 45
Port
 Partial support 26
 Partial support 45
Port.error
 No support No
 Full support 52
RequestUpdateCheckStatus
 Full support Yes
 No support No
connect
 Full support 26
 Full support 45
connectNative
 Full support 29
 Full support 50
getBackgroundPage
 Full support 22
 Full support 45Notes Full support 45Notes Notes If this is called from a page that is part of a private browsing window, such as a sidebar in a private window or a popup opened from a private window, then it will always return null.
getBrowserInfo
 No support No
 Full support 51
getManifest
 Full support 22
 Full support 45
getPackageDirectoryEntry
 Full support 29
 No support No
getPlatformInfo
 Full support 29
 Full support 45
getURL
 Full support 22
 Full support 45
id
 Full support 22
 Full support 45
lastError
 Full support YesNotes Full support YesNotes Notes lastError is not an Error object. Instead, it is a plain Object with the error text as the string value of the 'message' property.
 Full support 47
onBrowserUpdateAvailable
 Full support 27
 No support No
onConnect
 Full support 26
 Full support 45
onConnectExternal
 Full support 26
 Full support 54
onInstalled
 Full support 22
 Full support 52Notes Full support 52Notes Notes Before version 55, this event is not triggered for temporarily installed add-ons.
onMessage
 Full support 26
 Full support 45
onMessageExternal
 Full support 26
 Full support 54
onRestartRequired
 Full support 29
 No support No
onStartup
 Full support 23
 Full support 52
onSuspend
 Full support 22
 No support No
onSuspendCanceled
 Full support 22
 No support No
onUpdateAvailable
 Full support 25
 Full support 51
openOptionsPage
 Full support 42
 Full support 48
reload
 Full support 25
 Full support 51
requestUpdateCheck
 Full support 25
 No support No
sendMessage
 Full support 26
 Full support 45
sendNativeMessage
 Full support 29
 Full support 50
setUninstallURL
 Full support 41
 Full support 47
#sessions
Filter
 Full support Yes
 Full support 52
MAX_SESSION_RESULTS
 Full support Yes
 Full support 52
Session
 Full support Yes
 Full support 52Notes Full support 52Notes Notes 'Tab' objects in Sessions don't contain the 'url', 'title', or 'favIconUrl' properties.
forgetClosedTab
 No support No
 Full support 55
forgetClosedWindow
 No support No
 Full support 55
getRecentlyClosed
 Full support Yes
 Full support 52
getTabValue
 No support No
 Full support 57
getWindowValue
 No support No
 Full support 57
onChanged
 Full support Yes
 Full support 53
removeTabValue
 No support No
 Full support 57
removeWindowValue
 No support No
 Full support 57
restore
 Full support Yes
 Full support 52
setTabValue
 No support No
 Full support 57
setWindowValue
 No support No
 Full support 57
#sidebarAction
ImageDataType
 No support No
 Full support 54
close
 No support No
 Full support 57
getPanel
 No support No
 Full support 54
getTitle
 No support No
 Full support 54
open
 No support No
 Full support 57
setIcon
 No support No
 Full support 54
setPanel
 No support No
 Full support 54
setTitle
 No support No
 Full support 54
#storage
StorageArea
 Full support Yes
 Partial support 45
StorageArea.clear
 Full support Yes
 Full support 45
StorageArea.get
 Full support Yes
 Full support 45
StorageArea.getBytesInUse
 Full support Yes
 No support No
StorageArea.remove
 Full support Yes
 Full support 45
StorageArea.set
 Full support Yes
 Full support 45
StorageChange
 Full support Yes
 Full support 45
local
 Full support Yes
 Full support 45Notes Full support 45Notes Notes The storage API is supported in content scripts from version 48.
managed
 Full support Yes
 Full support 57Notes Full support 57Notes Notes Platform-specific storage backends, such as Windows registry keys, are not supported.Notes Enforcement of extension-provided storage schemas is not supported.Notes The onChanged event is not supported.
onChanged
 Full support Yes
 Full support 45
sync
 Full support Yes
 Full support 53
#tabs
MutedInfo
 Full support Yes
 Full support 47
MutedInfoReason
 Full support Yes
 Full support 47
PageSettings
 No support No
 Full support 56
TAB_ID_NONE
 Full support Yes
 Full support 45
Tab.active
 Full support Yes
 Full support 45
Tab.audible
 Full support 45
 Full support 45
Tab.autoDiscardable
 Full support 54
 No support No
Tab.cookieStoreId
 No support No
 Full support 52
Tab.discarded
 Full support 54
 Full support 57
Tab.favIconUrl
 Full support Yes
 Full support 45
Tab.height
 Full support 31
 Full support 45
Tab.highlighted
 Full support Yes
 Full support 45
Tab.id
 Full support Yes
 Full support 45
Tab.incognito
 Full support Yes
 Full support 45
Tab.index
 Full support Yes
 Full support 45
Tab.isArticle
 No support No
 Full support 58
Tab.isInReaderMode
 No support No
 Full support 58
Tab.lastAccessed
 No support No
 Full support 56
Tab.mutedInfo
 Full support 46
 Full support 45
Tab.openerTabId
 Full support 18
 Full support 57
Tab.pinned
 Full support Yes
 Full support 45
Tab.selected
 Full support Yes
 Full support 45
Tab.sessionId
 Full support 31
 No support No
Tab.status
 Full support Yes
 Full support 45
Tab.title
 Full support Yes
 Full support 45
Tab.url
 Full support Yes
 Full support 45
Tab.width
 Full support 31
 Full support 45
Tab.windowId
 Full support Yes
 Full support 45
TabStatus
 Full support Yes
 Full support 45
WindowType
 Full support Yes
 Full support 45
ZoomSettings
 Full support Yes
 Full support 45
ZoomSettingsMode
 Full support Yes
 Full support 45
ZoomSettingsScope
 Full support Yes
 Full support 45
captureVisibleTab
 Full support YesNotes Full support YesNotes Notes The default file format is 'jpeg'.
 Full support 47
connect
 Full support Yes
 Full support 45
create
 Full support Yes
 Full support 45
detectLanguage
 Full support Yes
 Full support 45
discard
 Full support 54Notes Full support 54Notes Notes Only accepts a single tab ID as a parameter, not an array.Notes The tab ID argument is optional: if it is omitted, the browser discards the least important tab.Notes The callback is passed a Tab object representing the tab that was discarded.
 Full support 58
duplicate
 Full support Yes
 Full support 47
executeScript
 Partial support Partial
 Partial support 43Notes Partial support 43Notes Notes Before version 50, Firefox would pass a single result value into its callback rather than an array, unless 'allFrames' had been set.
executeScript.runAt
 Full support 20
 Full support 43
executeScript.frameId
 Full support 39
 Full support 43Notes Full support 43Notes Notes 'allFrames' and 'frameId' can't both be set at the same time.
executeScript.matchAboutBlank
 Full support 39
 Full support 53
get
 Full support Yes
 Full support 45
getAllInWindow
 Full support Yes
 Full support 45
getCurrent
 Full support Yes
 Full support 45
getSelected
 Full support Yes
 No support No
getZoom
 Full support Yes
 Full support 45
getZoomSettings
 Full support Yes
 Full support 45
highlight
 Full support Yes
 No support No
insertCSS
 Partial support Partial
 Partial support 47
insertCSS.runAt
 Full support 20
 Full support 47
insertCSS.frameId
 Full support 39
 Full support 47
insertCSS.matchAboutBlank
 Full support 39
 No support No
insertCSS.cssOrigin
 No support No
 Full support 53
move
 Full support Yes
 Full support 46
onActivated
 Full support Yes
 Full support 45
onActiveChanged
 Full support Yes
 No support No
onAttached
 Full support Yes
 Full support 45
onCreated
 Full support Yes
 Full support 45
onDetached
 Full support Yes
 Full support 45
onHighlightChanged
 Full support Yes
 No support No
onHighlighted
 Full support Yes
 Full support 45
onMoved
 Full support Yes
 Full support 45
onRemoved
 Full support Yes
 Full support 45
onReplaced
 Full support Yes
 No support No
onSelectionChanged
 Full support Yes
 No support No
onUpdated
 Full support Yes
 Full support 45
onZoomChange
 Full support Yes
 Full support 45
print
 No support No
 Full support 56
printPreview
 No support No
 Full support 56
query
 Full support Yes
 Full support 45
reload
 Full support Yes
 Full support 45
remove
 Full support Yes
 Full support 45
removeCSS
 No support No
 Full support 49
saveAsPDF
 No support No
 Full support 56Notes Full support 56Notes Notes This function does not work on Mac OS X.
sendMessage
 Full support Yes
 Full support 45
sendRequest
 Full support Yes
 No support No
setZoom
 Full support Yes
 Full support 45
setZoomSettings
 Full support Yes
 Full support 45
toggleReaderMode
 No support No
 Full support 58
update
 Full support Yes
 Full support 45
#theme
Theme
 No support No
 Full support 55
getCurrent
 No support No
 Full support 58
onUpdated
 No support No
 Full support 58
reset
 No support No
 Partial support 56
reset.windowId
 No support No
 Full support 57
update
 No support No
 Partial support 55
update.windowId
 No support No
 Full support 57
#topSites
MostVisitedURL
 Full support Yes
 Full support 52
get
 Full support Yes
 Full support 52
#types
BrowserSetting
 Full support Yes
 Partial support 54
BrowserSetting.onChange
 Full support Yes
 No support No
#webNavigation
TransitionQualifier
 Full support Yes
 Partial support 48Notes Partial support 48Notes Notes 'server_redirect' is limited to top-level frames and 'client_redirect' is not supplied when redirections are created by JavaScript.
TransitionQualifier.from_address_bar
 Full support Yes
 No support No
TransitionType
 Full support Yes
 Full support 48Notes Full support 48Notes Notes 'link' and 'auto_subframe' are partially supported as the default transition type for top-level frames and subframes respectively. 'reload' and 'form_submit' are supported. All other properties are unsupported.
getAllFrames
 Full support Yes
 Full support 47
getFrame
 Full support Yes
 Full support 47
onBeforeNavigate
 Full support YesNotes Full support YesNotes Notes If the filter parameter is empty, Chrome matches all URLs.
 Full support 45Notes Full support 45Notes Notes Filtering is supported from version 50.Notes If the filter parameter is empty, Firefox raises an exception.
onCommitted
 Full support YesNotes Full support YesNotes Notes If the filter parameter is empty, Chrome matches all URLs.
 Partial support 45Notes Partial support 45Notes Notes Filtering is supported from version 50.Notes If the filter parameter is empty, Firefox raises an exception.
onCommitted.transitionQualifiers
 Full support Yes
 Full support 48
onCommitted.transitionType
 Full support Yes
 Full support 48
onCompleted
 Full support YesNotes Full support YesNotes Notes If the filter parameter is empty, Chrome matches all URLs.
 Full support 45Notes Full support 45Notes Notes Filtering is supported from version 50.Notes If the filter parameter is empty, Firefox raises an exception.
onCreatedNavigationTarget
 Partial support PartialNotes Partial support PartialNotes Notes If a blocked popup is unblocked by the user, the event is still not sent.
 Partial support 54Notes Partial support 54Notes Notes If the filter parameter is empty, Firefox raises an exception.Notes If a blocked popup is unblocked by the user, the event is then sent.
onCreatedNavigationTarget.sourceProcessId
 Full support Yes
 No support No
onCreatedNavigationTarget.windowId
 No support No
 Full support 54
onDOMContentLoaded
 Full support YesNotes Full support YesNotes Notes If the filter parameter is empty, Chrome matches all URLs.
 Full support 45Notes Full support 45Notes Notes Filtering is supported from version 50.Notes If the filter parameter is empty, Firefox raises an exception.
onErrorOccurred
 Full support YesNotes Full support YesNotes Notes If the filter parameter is empty, Chrome matches all URLs.
 Partial support 45Notes Partial support 45Notes Notes Filtering is supported from version 50.Notes If the filter parameter is empty, Firefox raises an exception.
onErrorOccurred.error
 Full support Yes
 No support No
onHistoryStateUpdated
 Full support Yes
 Partial support 47
onHistoryStateUpdated.transitionQualifiers
 Full support Yes
 Full support 48
onHistoryStateUpdated.transitionType
 Full support Yes
 Full support 48
onReferenceFragmentUpdated
 Full support YesNotes Full support YesNotes Notes If the filter parameter is empty, Chrome matches all URLs.
 Partial support 45Notes Partial support 45Notes Notes Filtering is supported from version 50.Notes If the filter parameter is empty, Firefox raises an exception.
onReferenceFragmentUpdated.transitionQualifiers
 Full support Yes
 Full support 48
onReferenceFragmentUpdated.transitionType
 Full support Yes
 Full support 48
onTabReplaced
 Full support Yes
 Full support 45Notes Full support 45Notes Notes Although you can add listeners for this event, it will never fire because the underlying functionality is not supported.
#webRequest
BlockingResponse
 Full support Yes
 Full support 45
HttpHeaders
 Full support Yes
 Full support 45
MAX_HANDLER_BEHAVIOR_CHANGED_CALLS_PER_10_MINUTES
 Full support Yes
 Full support 45
RequestFilter
 Full support Yes
 Partial support 45
RequestFilter.urls
 Full support Yes
 Full support 45Notes Full support 45Notes Notes Before Firefox 56, moz-extension:// URLs were not allowed.
RequestFilter.windowId
 Full support Yes
 Full support 53
RequestFilter.tabId
 Full support Yes
 Full support 53
ResourceType
 Partial support 44
 Partial support 45
ResourceType.ping
 Full support 49Notes Full support 49Notes Notes Requests sent by navigator.sendBeacon(), and CSP reports in Chrome 49-57 (Opera 36-44), are also labeled as `ping`.
 Full support 45
ResourceType.font
 Full support 49
 Full support 45
ResourceType.media
 Full support 58
 Full support 45
ResourceType.websocket
 Full support 58
 Full support 45
ResourceType.csp_report
 Full support 58
 Full support 45
ResourceType.xbl
 No support No
 Full support 45
ResourceType.xslt
 No support No
 Full support 45
ResourceType.beacon
 No support No
 Full support 45
ResourceType.xml_dtd
 No support No
 Full support 45
ResourceType.imageset
 No support No
 Full support 45
ResourceType.web_manifest
 No support No
 Full support 45
ResourceType.object_subrequest
 No support No
 Full support 55Notes Full support 55Notes Notes Requests have been reported as `object_subrequest` before, but the type was missing in the `ResourceType` object before Firefox 55.
StreamFilter
 No support No
 Full support 57
StreamFilter.close
 No support No
 Full support 57
StreamFilter.disconnect
 No support No
 Full support 57
StreamFilter.error
 No support No
 Full support 57
StreamFilter.ondata
 No support No
 Full support 57
StreamFilter.onerror
 No support No
 Full support 57
StreamFilter.onstart
 No support No
 Full support 57
StreamFilter.onstop
 No support No
 Full support 57
StreamFilter.resume
 No support No
 Full support 57
StreamFilter.status
 No support No
 Full support 57
StreamFilter.suspend
 No support No
 Full support 57
StreamFilter.write
 No support No
 Full support 57
UploadData
 Full support Yes
 Full support 45
filterResponseData
 No support No
 Full support 57
handlerBehaviorChanged
 Full support Yes
 Full support 45
onAuthRequired
 Full support Yes
 Partial support 54Notes Partial support 54Notes Notes To handle a request asynchronously, return a Promise from the listener.
onAuthRequired.asyncBlocking
 Full support Yes
 No support No
onBeforeRedirect
 Full support Yes
 Full support 46
onBeforeRequest
 Full support YesNotes Full support YesNotes Notes Asynchronous event listeners are not supported.
 Full support 46Notes Full support 46Notes Notes Asynchronous event listeners are supported from version 52.
onBeforeSendHeaders
 Full support YesNotes Full support YesNotes Notes Asynchronous event listeners are not supported.
 Full support 45Notes Full support 45Notes Notes Asynchronous event listeners are supported from version 52.
onCompleted
 Full support Yes
 Full support 45
onErrorOccurred
 Full support Yes
 Full support 45
onHeadersReceived
 Full support YesNotes Full support YesNotes Notes Asynchronous event listeners are not supported.
 Full support 45Notes Full support 45Notes Notes Modification of the 'Content-Type' header is supported from version 51.Notes Asynchronous event listeners are supported from version 52.
onResponseStarted
 Full support Yes
 Full support 45
onSendHeaders
 Full support Yes
 Full support 45
#windows
CreateType
 Full support YesNotes Full support YesNotes Notes `detached_panel` is not supported.
 Full support 45
WINDOW_ID_CURRENT
 Full support 18
 Full support 45
WINDOW_ID_NONE
 Full support Yes
 Full support 45
Window
 Partial support Partial
 Partial support 45
Window.alwaysOnTop
 Full support 19
 Full support 45
Window.focused
 Full support Yes
 Full support 45
Window.height
 Full support Yes
 Full support 45
Window.id
 Full support Yes
 Full support 45
Window.incognito
 Full support Yes
 Full support 45
Window.left
 Full support Yes
 Full support 45
Window.sessionId
 Full support 31
 No support No
Window.state
 Full support Yes
 Full support 45
Window.tabs
 Full support Yes
 Full support 45
Window.title
 No support No
 Full support 56
Window.top
 Full support Yes
 Full support 45
Window.type
 Full support Yes
 Full support 45
Window.width
 Full support Yes
 Full support 45
WindowState
 Full support Yes
 Partial support 45
WindowState.minimized
 Full support Yes
 Full support 45
WindowState.maximized
 Full support Yes
 Full support 45
WindowState.fullscreen
 Full support Yes
 Full support 45
WindowState.docked
 Full support Yes
 No support No
WindowType
 Full support Yes
 Full support 45
WindowType.panel
 Full support Yes
 Full support 45
WindowType.app
 Full support Yes
 Full support 45
WindowType.devtools
 Full support Yes
 Full support 45
create
 Full support Yes
 Full support 45Notes Full support 45Notes Notes 'url' and 'tabId options can't both be set together.Notes The returned 'Window' object contains the 'tabs' property only from version 52 onwards.
get
 Partial support Partial
 Full support 45
get.getInfo
 Partial support 18
 Full support 45
getAll
 Partial support Partial
 Full support 45
getAll.populate
 Full support Yes
 Full support 45
getAll.windowTypes
 Full support 46
 Full support 45
getCurrent
 Partial support Partial
 Full support 45
getCurrent.getInfo
 Partial support 18
 Full support 45
getLastFocused
 Partial support Partial
 Full support 45
getLastFocused.getInfo
 Partial support 18
 Full support 45
onCreated
 Full support Yes
 Full support 45
onFocusChanged
 Full support Yes
 Full support 45
onRemoved
 Full support Yes
 Full support 45
remove
 Full support Yes
 Full support 45
update
 Partial support Partial
 Partial support 45
update.drawAttention
 Full support Yes
 Full support 45
update.focused
 Full support Yes
 Full support 45
update.height
 Full support Yes
 Full support 45
update.left
 Full support Yes
 Full support 45
update.state
 Full support Yes
 Full support 45
update.titlePreface
 No support No
 Full support 56
update.top
 Full support Yes
 Full support 45
update.width
 Full support Yes
 Full support 45}.split("\n").each{|x|
  if x =~ /^#/
    name = x[1..-1]
  elsif x =~ /^ /
    tmp << (x =~ /No support/ ? 'N' : x =~ /Full support/ ? 'Y' : 'P')
  else
    arr << tmp if tmp
    tmp = [name,x]
  end
}

# arr.each{|x|puts x.join("\t")}

arr.each{|x| puts x.join("\t") if x[2] != x[3] && x[2] != 'Y' }