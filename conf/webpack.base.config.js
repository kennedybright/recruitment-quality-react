const Config = require('webpack-config').Config
const webpack = require('webpack')
const BannerPlugin = webpack.BannerPlugin
const commons = require('./commons')

module.exports = new Config().merge({
  // Exclude packages from the bundle
  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react',
      umd: 'react',
    },
    'react-dom': {
      root: 'ReactDOM',
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom',
      umd: 'react-dom',
    },
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        resourceQuery: { not: [/raw/] },
        use: {
          loader: 'ts-loader',
        },
      },
      {
        resourceQuery: /raw/,
        type: 'asset/source',
      },
      {
        test: /\.(gif|png|jpg|jpeg)$/,
        use: {
          loader: 'asset/inline',
          options: { limit: 8192, name: commons.urlLoaderNameTemplate },
        },
      },
      {
        test: /\.(svg|woff|ttf|eot)$/,
        use: {
          loader: 'asset/inline',
          options: { limit: 1, name: commons.urlLoaderNameTemplate },
        },
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        defaultVendors: {
          name: 'vendors',
          chunks: 'all',
          enforce: true,
          priority: 20,
          test: /node_modules/,
        },
        commons: {
          name: 'commons',
          chunks: 'all',
          enforce: true,
          minChunks: 2,
          reuseExistingChunk: true,
          priority: 10,
        },
      },
    },
  },

  plugins: [
    // DON'T delete: for Legacy apps you may want to use process.env
    // please install: `yarn add -D process`
    // then uncomment ProvidePlugin and process.env section at DefinePlugin
    // see details:
    // https://webpack.js.org/migrate/5/ (at Level 5: Runtime Errors. section)
    // https://stackoverflow.com/questions/41359504/webpack-bundle-js-uncaught-referenceerror-process-is-not-defined
    // new webpack.ProvidePlugin({
    //   process: 'process/browser',
    // }),
    new webpack.DefinePlugin({
      // DON'T delete: for Legacy apps or for 3rd party libs you may need use:
      // 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      // 'process.env.DEBUG': JSON.stringify(process.env.DEBUG || false),
      __APP_NAME__: JSON.stringify(commons.appName),
      __APP_VERSION__: JSON.stringify(commons.version),
      __NODE_ENV__: JSON.stringify(process.env.NODE_ENV || 'development'),
      __DEBUG__: JSON.stringify(process.env.DEBUG || false),
    }),
    new BannerPlugin(
      [
        `@appName: ${commons.appName} Frontend`,
        `@version: ${JSON.stringify(commons.version)}`,
        `@buildTime: ${new Date().toLocaleString('en-US', {
          timeZone: 'UTC',
        })}`,
      ].join('\n')
    ),
  ],
})
