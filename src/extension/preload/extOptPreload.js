import ChromeStorage from '../chromeApi/ChromeStorage'

const appId = window.location.href.split("resource/extension/")[1].split("/")[0]
const chromes =  require('electron').remote.getGlobal('chrome')

chromes[appId].storage = new ChromeStorage(appId)

global.chrome = chromes[appId]