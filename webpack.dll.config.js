const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    vendor: ['filepointer',
      'glob',
      'immutable',
      'inline-style-prefixer',
      'invariant',
      'jquery',
      'jsdom',
      'jsx-to-string',
      'lodash',
      'mime',
      'mkdirp',
      'moment',
      'mousetrap',
      'nedb-promise',
      'node-pty',
      'node-static',
      'node-uuid',
      'promisify-me',
      'pubsub-js',
      'punycode',
      'python-struct',
      'react',
      'react-dom',
      'react-mixin',
      'react-sticky',
      'react-style-proptype',
      'request',
      'semantic-ui-react',
      'sortablejs',
      'sprintf-js',
      'axon',
      'binascii',
      'body-parser',
      'clipboard',
      'firebase',
      'inferno',
      "inferno-compat",
      "inferno-server",
      "infinite-tree",
      "nedb-party",
      "underscore",
      'warning']
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].dll.js',
    library: '[name]_library'
  },
  plugins: [
    // new webpack.DefinePlugin({
    //   "process.env.NODE_ENV": JSON.stringify("production")
    // }),
    new webpack.DllPlugin({
      path: path.join(__dirname, 'dist', '[name]-manifest.json'),
      name: '[name]_library'
    })
  ],
  node: {
    process: false,
    __filename: true,
    __dirname: true,
    fs: 'empty',
    tls: 'empty',
    net: 'empty',
    child_process: 'empty',
  }
};