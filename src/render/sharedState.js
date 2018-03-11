const ipc = require('electron').ipcRenderer
const [colorNormalText,colorNormalBackground,colorActiveText,colorActiveBackground,colorUnreadText,colorUnreadBackground,enableColorOfNoSelect,themeColorChange,colorTabDot,showBorderActiveTab,colorTabMode,notLoadTabUntilSelected] = ipc.sendSync('get-sync-main-states',['colorNormalText','colorNormalBackground','colorActiveText','colorActiveBackground','colorUnreadText','colorUnreadBackground','enableColorOfNoSelect','themeColorChange','colorTabDot','showBorderActiveTab','colorTabMode','notLoadTabUntilSelected'])
let state = {colorNormalText,colorNormalBackground,colorActiveText,colorActiveBackground,colorUnreadText,colorUnreadBackground,enableColorOfNoSelect,themeColorChange,colorTabDot,showBorderActiveTab,colorTabMode,notLoadTabUntilSelected}
state.allSelectedkeys = new Set()

export default state