const path = require('path');
const webpack = require('webpack');


function merge ({fileName,src,dest=src.replace("src/","lib/").replace("src\\","lib\\")}, env) {
  var config = {
    entry: src + "/" + fileName,
    output: {
      path: dest,
      filename: fileName
    }
  }
  var merged = Object.assign({}, env, config)
  merged.plugins = (config.plugins || []).concat(env.plugins || [])
  return merged
}

const baseConfig = {
  cache: true,
  devtool: '#source-map',
  plugins: [
    new webpack.DllReferencePlugin({context: ".",manifest: require('./dist/vendor-manifest.json')}),
    new webpack.DefinePlugin({'process.env': {NODE_ENV: JSON.stringify("production")}}),
    // new HappyPack({
    //     // cache: true,
    //     loaders: ["babel"],
    //     threads: 4
    // }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ],
  node: {
    process: false,
    __filename: true,
    __dirname: true,
    fs: 'empty',
    electron: 'empty'
  },
  externals: {
    'electron': 'require("electron")'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        // exclude: /node_modules\/(base64\-js|ieee754|create\-hash|sha.js|miller\-rabin|elliptic|des.js|minimalistic\-crypto\-utils|bn\.js|ripemd160|react|react-dom|buffer|browserify\-aes|hash\.js|asn1\.js|lodash|react\-addons\-perf|node\-uuid|immutable|inferno|punycode)/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query:{
          cacheDirectory: true
        }
      }
    ]
  }
}


const baseConfigExt = {
  cache: true,
  devtool: '#source-map',
  plugins: [
    new webpack.DefinePlugin({'process.env': {NODE_ENV: JSON.stringify("production")}}),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ],
  node: {
    process: false,
    __filename: true,
    __dirname: true,
    fs: 'empty'
  },
  externals: {
    'electron': 'chrome'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        // exclude: /node_modules\/(base64\-js|ieee754|create\-hash|sha.js|miller\-rabin|elliptic|des.js|minimalistic\-crypto\-utils|bn\.js|ripemd160|react|react-dom|buffer|browserify\-aes|hash\.js|asn1\.js|lodash|react\-addons\-perf|node\-uuid|immutable|inferno|punycode)/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query:{
          cacheDirectory: true
        }
      }
    ]
  }
}


const baseConfig2 = Object.assign({},baseConfig)
baseConfig2.plugins = baseConfig.plugins.slice(1)
baseConfig2.externals = {'electron': 'chrome'}
delete baseConfig2.devtool

// delete baseConfig.plugins

module.exports = [
  merge({fileName:"base.js",src:path.join(__dirname,"./src/render")},baseConfig),
  // merge({fileName:"top.js",src:path.join(__dirname,"./src/toolPages"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfig2),
  // merge({fileName:"downloader.js",src:path.join(__dirname,"./src/toolPages"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfig2),
  // merge({fileName:"download.js",src:path.join(__dirname,"./src/toolPages"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfig2),
  // merge({fileName:"selector.js",src:path.join(__dirname,"./src/toolPages"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfig2),
  // merge({fileName:"history.js",src:path.join(__dirname,"./src/toolPages"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfig2),
  // merge({fileName:"tabHistorySidebar.js",src:path.join(__dirname,"./src/toolPages"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfig2),
  // merge({fileName:"tabTrashHistorySidebar.js",src:path.join(__dirname,"./src/toolPages"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfig2),
  // merge({fileName:"noteSidebar.js",src:path.join(__dirname,"./src/toolPages"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfig2),
  // merge({fileName:"savedStateSidebar.js",src:path.join(__dirname,"./src/toolPages"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfig2),
  // merge({fileName:"historySidebar.js",src:path.join(__dirname,"./src/toolPages"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfig2),
  // merge({fileName:"explorerMenu.js",src:path.join(__dirname,"./src/toolPages"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfig2),
  // merge({fileName:"explorerSidebar.js",src:path.join(__dirname,"./src/toolPages"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfig2),
  // merge({fileName:"favoriteInit.js",src:path.join(__dirname,"./src/toolPages"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfig2),
  // merge({fileName:"favoriteSidebar.js",src:path.join(__dirname,"./src/toolPages"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfig2),
  // merge({fileName:"terminal.js",src:path.join(__dirname,"./src/toolPages"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfig2),
  // merge({fileName:"sync.js",src:path.join(__dirname,"./src/toolPages"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfig2),
  // merge({fileName:"settings.js",src:path.join(__dirname,"./src/toolPages"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfig2),
  // merge({fileName:"converter.js",src:path.join(__dirname,"./src/toolPages"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfig2),
  // merge({fileName:"automation.js",src:path.join(__dirname,"./src/toolPages"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfig2),
  // merge({fileName:"inputHistorySetting.js",src:path.join(__dirname,"./src/toolPages"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfig2),
  // merge({fileName:"macro.js",src:path.join(__dirname,"./src/defaultExtension/"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfigExt),
  // merge({fileName:"mobilePanel.js",src:path.join(__dirname,"./src/defaultExtension/"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfigExt),
  merge({fileName:"contentscript.js",src:path.join(__dirname,"./src/defaultExtension/"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfigExt),
  // merge({fileName:"bg.js",src:path.join(__dirname,"./src/defaultExtension/"),dest:path.join(__dirname,"./resource/extension/default/1.0_0/js")},baseConfigExt),
]