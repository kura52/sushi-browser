// if(!("__DataBaseRender" in global)){
//   global.__DataBaseRender = {}
//   global.__DataBaseRender = require('electron').remote.getGlobal('__DataBase')
//
// }
//
// export default global.__DataBaseRender

export default require('electron').remote.require('../lib/databaseFork')