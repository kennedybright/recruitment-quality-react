const Config = require('webpack-config').Config
const AssetsPlugin = require('assets-webpack-plugin')
const commons = require('./commons')

module.exports = new Config().extend('conf/webpack.ts.config.js').merge({
  entry: commons.entry,
  output: {
    library: {
      name: 'usremoterecqa',
      type: 'umd',
    },
    path: commons.path,
    chunkLoadingGlobal: commons.chunkLoadingGlobal,
    filename: commons.filenameChunkhashTemplate,
    chunkFilename: commons.filenameChunkhashTemplate,
  },
  performance: {
    maxEntrypointSize: 2048000,
    maxAssetSize: 2048000
  },
  plugins: [
    new AssetsPlugin({
      filename: commons.assetsManifestFileName,
      path: commons.path,
      prettyPrint: true,
      removeFullPathAutoPrefix: true,
      processOutput: function (assets) {
        assets.init_scripts = commons.initScreens
        assets.version = commons.version
        return JSON.stringify(assets)
      },
    }),
  ],
})
