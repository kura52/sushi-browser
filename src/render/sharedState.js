const ipc = require('electron').ipcRenderer
const [colorNormalText,colorNormalBackground,colorActiveText,colorActiveBackground,colorUnreadText,colorUnreadBackground,enableColorOfNoSelect,themeColorChange,colorTabDot,showBorderActiveTab,colorTabMode] = ipc.sendSync('get-sync-main-states',['colorNormalText','colorNormalBackground','colorActiveText','colorActiveBackground','colorUnreadText','colorUnreadBackground','enableColorOfNoSelect','themeColorChange','colorTabDot','showBorderActiveTab','colorTabMode'])
let state = {colorNormalText,colorNormalBackground,colorActiveText,colorActiveBackground,colorUnreadText,colorUnreadBackground,enableColorOfNoSelect,themeColorChange,colorTabDot,showBorderActiveTab,colorTabMode}
state.allSelectedkeys = new Set()

export default state