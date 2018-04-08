import fs from 'fs'
import mainState from './mainState'

export default {
  readMacro() {
    let data = fs.readFileSync("../resource/extension/default/1.0_0/js/macro.js").toString()
    ;['autoMousedown','autoMouseup','autoClick','autoDblclick','autoKeydown','autoInput','autoChange','autoSelect','autoSubmit','autoScroll','autoMousemove','autoFocusin','autoFocusout','autoCut','autoCopy','autoPaste','autoBack','autoForward','autoGoIndex','autoNavigate','autoTabCreate','autoTabRemoved','autoTabSelected'].forEach(x=>{
      if(!mainState[x]){
        const event = x.slice(4).toLowerCase()
        if(event == 'scroll'){
          data = data.replace('window.addEventListener("scroll','false && window.addEventListener("scroll')
        }
        else{
          data = data.replace(`"${event}"`,`"_${event}"`)
        }
      }
    })
    if(!isNaN(mainState.autoMousemoveTime)){
      data = data.replace('3000',`parseFloat(${mainState.autoMousemoveTime}) * 1000`)
    }
    if(mainState.autoHighlight){
      data += `;\n${fs.readFileSync("../resource/extension/default/1.0_0/js/TargetSelector2.js").toString()}`
    }
    return data
  },
  readMacroOff() {
    let data = fs.readFileSync("../resource/extension/default/1.0_0/js/macroOff.js").toString()
    if(mainState.autoHighlight){
      data += `;\n${fs.readFileSync("../resource/extension/default/1.0_0/js/TargetSelectorOff2.js").toString()}`
    }
    return data
  },
  readTargetSelector(){
    return fs.readFileSync("../resource/extension/default/1.0_0/js/TargetSelector.js").toString()
  },
  readTargetSelectorOff(){
    return fs.readFileSync("../resource/extension/default/1.0_0/js/TargetSelectorOff.js").toString()
  }
}