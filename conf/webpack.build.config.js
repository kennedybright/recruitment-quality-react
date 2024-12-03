const Config = require('webpack-config').Config
const WebpackNotifierPlugin = require('webpack-notifier')
const commons = require('./commons')

module.exports = new Config().extend('conf/webpack.ts.config.js').merge({
  mode: 'development',
  devtool: 'eval-source-map',
  entry: commons.entry,
  output: {
    library: {
      name: 'usremoterecqa',
      type: 'umd',
    },
    path: commons.path,
    chunkLoadingGlobal: commons.chunkLoadingGlobal,
    filename: commons.filenameTemplate,
    chunkLoading: 'jsonp',
    chunkFilename: commons.filenameTemplate,
    devtoolModuleFilenameTemplate: 'webpack://[namespace]/[resource-path]?[loaders]',
  },

  plugins: [new WebpackNotifierPlugin()],
})
