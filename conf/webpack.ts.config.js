const Config = require('webpack-config').Config
const path = require('path')

module.exports = new Config().extend('conf/webpack.base.config.js').merge({
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        resourceQuery: { not: [/raw/] },
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    // symlinks: false
  },
})
