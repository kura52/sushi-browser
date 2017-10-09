import ChromeRuntime from './ChromeRuntime'
import ChromeExtension from './ChromeExtension'
import ChromeTabs from './ChromeTabs'
import ChromeWindows from './ChromeWindows'
import ChromeBrowserAction from './ChromeBrowserAction'
import ChromePageAction from './ChromePageAction'
import ChromeI18n from './ChromeI18n'
import ChromeWebNavigation from './ChromeWebNavigation'
import ChromeWebRequest from './ChromeWebRequest'
import ChromeContextMenus from './ChromeContextMenus'


export default {
  execute(appId,version,basePath,localMessages,manifest){
    if(!global.chrome) global.chrome = {}
    const chrome = {}
    chrome.runtime = new ChromeRuntime(appId,`https://localhost:7173/${appId}/${version}/`,manifest)
    chrome.extension = new ChromeExtension(appId,basePath,chrome.runtime)
    chrome.windows = new ChromeWindows(appId)
    chrome.tabs = new ChromeTabs(appId)
    chrome.browserAction = new ChromeBrowserAction(appId)
    chrome.pageAction = new ChromePageAction(appId)
    chrome.i18n = new ChromeI18n(appId,localMessages)
    new ChromeWebRequest(appId)
    chrome.webNavigation = new ChromeWebNavigation(appId)
    chrome.contextMenus = new ChromeContextMenus(appId)

    global.chrome[appId] = chrome
  }
}