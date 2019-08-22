const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/template.html',
      minify: false,
      chunksSortMode: 'manual',
      // sorting order necessary for CSS overwrites not having enough !default
      chunks: ['vendors~code-de', 'vendorslarge~code-de', 'eoxdeps~code-de', 'eoxc~code-de', 'code-de']
    }),
  ],
  devtool: 'source-map',
  optimization: {
    moduleIds: 'hashed',
    minimizer: [
      new UglifyJSPlugin({
        sourceMap: true,
        cache: true,
        parallel: true,
        uglifyOptions: {
          compress: {
            passes: 2,
            drop_console: true,
          }
        }
      }),
      new OptimizeCSSAssetsPlugin({})
    ],
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
