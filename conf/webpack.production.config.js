const Config = require('webpack-config').Config
const TerserPlugin = require('terser-webpack-plugin')

module.exports = new Config().extend('conf/webpack.deploy-default.config.js').merge({
  mode: 'production',
  devtool: false,
  optimization: {
    usedExports: true,
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          sourceMap: false,
        },
      }),
    ],
  },
})
