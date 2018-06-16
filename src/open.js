var exec = require('child_process').exec
  , path = require('path')
;


/**
 * open a file or uri using the default application for the file type.
 *
 * @return {ChildProcess} - the child process object.
 * @param {string} target - the file/uri to open.
 * @param {string} appName - (optional) the application to be used to open the
 *      file (for example, "chrome", "firefox")
 * @param {function(Error)} callback - called with null on success, or
 *      an error object that contains a property 'code' with the exit
 *      code of the process.
 */

module.exports = open;

function open(appName, target, callback, cwd, noEscape) {
  target = target || ""

  var opener;
  if (typeof(appName) === 'function') {
    callback = appName;
    appName = null;
  }

  switch (process.platform) {
    case 'darwin':
      if (appName) {
        opener = 'open -a ' + (noEscape ? appName : escape(appName))
      }
      else {
        opener = 'open';
      }
      break;
    case 'win32':
      // if the first parameter to start is quoted, it uses that as the title
      // so we pass a blank title so we can quote the file we are opening
      if (appName) {
        opener = 'start "" ' + (noEscape ? appName : escape(appName))
      }
      else {
        opener = 'start ""';
      }
      break;
    default:
      if (appName) {
        opener = noEscape ? appName : escape(appName)
      }
      else {
        opener = 'xdg-open';
      }
      break;
  }

  if (process.env.SUDO_USER) {
    opener = 'sudo -u ' + process.env.SUDO_USER + ' ' + opener;
  }
  // console.log(opener + ' "' + escape(target) + '" &', {cwd})
  if(cwd){
    return exec(`${opener} ${escape(target)} &`, {cwd}, callback);
  }
  return exec(`${opener} ${escape(target)} &`, callback);
}

function escape(s) {
  return '"'+s.replace(/(["\t\n\r\f'$`\\])/g,'\\$1')+'"'
  // return s.replace(/"/g, '\\\"');
}