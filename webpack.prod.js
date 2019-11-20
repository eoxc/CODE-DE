const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new CleanWebpackPlugin(),
  ],
  devtool: 'source-map',
  optimization: {
    moduleIds: 'hashed',
    runtimeChunk: false,
    splitChunks: {
      maxInitialRequests: Infinity,
      minSize: 1000,
      chunks: 'all',
      cacheGroups: {
        eoxdeps: {
          test: /[\\/]node_modules[\\/](D3.TimeSlider|libcoverage|opensearch-browser)[\\/]/,
          name: 'eoxdeps~code-de',
        },
        vendorslarge: {
          test: /[\\/]node_modules[\\/](turf-jsts|bluebird|ol|d3)[\\/]/,
          name: 'vendorslarge~code-de',
        },
        eoxc: {
          test: /[\\/]node_modules[\\/](eoxc)[\\/]/,
          name: 'eoxc~code-de',
        },
      },
    },
  },
});
