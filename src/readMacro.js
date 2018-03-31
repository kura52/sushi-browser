import fs from 'fs'

export default {
  readMacro() {
    return fs.readFileSync("../resource/extension/default/1.0_0/js/macro.js").toString()
  },
  readMacroOff() {
    return fs.readFileSync("../resource/extension/default/1.0_0/js/macroOff.js").toString()
  },
}