import ChromeStorage from '../chromeApi/ChromeStorage'
import ChromeWebRequestBG from '../chromeApi/ChromeWebRequestBG'

const appId = window.location.href.split("resource/extension/")[1].split("/")[0]
const chromes =  require('electron').remote.getGlobal('chrome')
global.chrome = chromes[appId]

chromes[appId].storage = new ChromeStorage(appId)
chromes[appId].webRequest = new ChromeWebRequestBG(appId)
chromes[appId].webRequest.initEvent()
