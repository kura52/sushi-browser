const path = require('path');

module.exports = {
  entry: './renderer/content-scripts-injector-build.js',
  output: {
    filename: 'preload-content-scripts.js',
    path: path.resolve(__dirname, 'dist')
  },
  // mode: 'development',
  mode: 'production',
  externals: {
    'electron': 'require("electron")'
  },
  node: {
    process: false,
    __filename: true,
    __dirname: true,
    fs: 'empty',
    electron: 'empty',
    // vm: 'empty'
  },
};