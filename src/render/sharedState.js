const ipc = require('electron').ipcRenderer
const [colorNormalText,colorNormalBackground,colorActiveText,colorActiveBackground,colorUnreadText,colorUnreadBackground,enableColorOfNoSelect,themeColorChange,colorTabDot,showBorderActiveTab] = ipc.sendSync('get-sync-main-states',['colorNormalText','colorNormalBackground','colorActiveText','colorActiveBackground','colorUnreadText','colorUnreadBackground','enableColorOfNoSelect','themeColorChange','colorTabDot','showBorderActiveTab'])
let state = {colorNormalText,colorNormalBackground,colorActiveText,colorActiveBackground,colorUnreadText,colorUnreadBackground,enableColorOfNoSelect,themeColorChange,colorTabDot,showBorderActiveTab}
state.allSelectedkeys = new Set()

export default state