const Config = require('webpack-config').Config
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = () => {
  const mode = process.env.NODE_ENV === 'production' ? 'production' : 'build'
  const loadedWebpackFileName = `conf/webpack.${mode}.config.js`

  console.log('analyze config: ', loadedWebpackFileName)
  
  return new Config().extend(loadedWebpackFileName).merge({
    plugins: [
      new BundleAnalyzerPlugin({
        generateStatsFile: true,
        statsOptions: { source: false }
      })
    ],
  })
}
