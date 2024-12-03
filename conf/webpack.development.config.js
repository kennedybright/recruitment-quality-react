const Config = require('webpack-config').Config

module.exports = new Config().extend('conf/webpack.deploy-default.config.js').merge({
  mode: 'development',
  devtool: 'eval-source-map',
})
