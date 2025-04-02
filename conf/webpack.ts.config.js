const Config = require('webpack-config').Config

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
    alias: {
        "react/jsx-dev-runtime": "react/jsx-dev-runtime.js",
        "react/jsx-runtime": "react/jsx-runtime.js"
    }
  },
})
