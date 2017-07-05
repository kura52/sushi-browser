//Copy 'electron-load-devtool'

const fs = require('fs');
const os = require('os');
const path = require('path');

export default function(appId){
  try {
    const env = process.env;
    const homedir = os.homedir();

    const macos = () => path.join(homedir, 'Library/Application Support/Google/Chrome/Default/Extensions');

    const windows = () => {
      const appData = env.LOCALAPPDATA || path.join(homedir, 'AppData', 'Local');
      return path.join(appData, 'Google', 'Chrome', 'User Data', 'Default', 'Extensions');
    };

    const linux = chrome => {
      chrome = chrome || 'google-chrome';
      return path.join(homedir, '.config', chrome, 'Default', 'Extensions');
    }

    const extensionPath = name => {
      if (process.platform === 'darwin') {
        return macos();
      }

      if (process.platform === 'win32') {
        return windows();
      }

      return linux(name);
    };

    const extension = extensionPath();

    return path.join(extension, appId)
  } catch (err) {
    console.warn(`Skip loading '${appId}' because it can't be found. Please install at Chrome Web Store.`);
    return;
  }

}
