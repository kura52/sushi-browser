import ChromeRuntimeCS from './ChromeRuntimeCS'
import ChromeExtensionCS from './ChromeExtensionCS'
import ChromeI18n from './ChromeI18n'
import ChromeStorage from './ChromeStorage'

export default {
  execute(appId, baseFilePath, basePath, localMessages){
    const chrome = {}
    chrome.runtime = new ChromeRuntimeCS(appId,baseFilePath,basePath)
    chrome.extension = new ChromeExtensionCS(appId,baseFilePath,basePath,chrome.runtime)
    chrome.i18n = new ChromeI18n(appId,localMessages)
    chrome.storage = new ChromeStorage(appId)
    return chrome
  }
}