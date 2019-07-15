const { execSync } = require('child_process');

export default class WinCtl{

  static GetActiveWindow2() {
    const ret = execSync(`wmctrl -v -a :ACTIVE: 2>&1`)
    const mat = ret.match(/: *(0x[0-9a-f]+)/)
    return new WinCtl(mat[1])
  }

  static EnumerateWindows() {

  }

  static WindowFromPoint2() {

  }

  static NonActiveWindowFromPoint() {

  }

  constructor(id){
    this.id = id
  }

  getTitle(){

  }

  getHwnd(){

  }

  getClassName(){

  }

  setForegroundWindowEx(){

  }

  getWindowModuleFileName(){

  }

  setWindowPos(){

  }

  moveTop(){

  }


  setWindowLongPtr(){

  }

  setWindowLongPtrRestore(){

  }

  setWindowLongPtrEx(){

  }

  setWindowLongPtrExRestore(){

  }


  setParent(){

  }

  showWindow(){

  }

  move(){

  }

  moveRelative(){

  }

  dimensions(){

  }


}