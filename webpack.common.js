const webpack = require('webpack');
const path = require('path');

const packageJson = require('./package.json');
const eoxcPackageJson = require('eoxc/package.json');
const autoprefixer = require('autoprefixer');
const precss = require('precss');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    'code-de': ['babel-polyfill', './src/preload.js', './src/main.js'],
    'font-awesome': 'font-awesome/scss/font-awesome.scss',
  },
  resolve: {
    alias: {
      // necessary to avoid multiple packings of backbone due to marionette
      backbone: path.join(__dirname, 'node_modules', 'backbone', 'backbone'),
      handlebars: 'handlebars/dist/handlebars.min.js',
      'opensearch-browser': 'opensearch-browser/dist',
      scrollintoview: 'anno.js/bower_components/scrollintoview',
    },
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
    library: 'code-de',
    libraryTarget: 'umd',
  },
  devServer: {
    host: '0.0.0.0',
    inline: true,
    disableHostCheck: true,
  },
  module: {
    rules: [
      { test: /jquery\.js$/, loader: 'expose-loader?jQuery!expose-loader?$' },
      { test: /node_modules.*eoxc.*js$/, loader: 'babel-loader' },
      { test: /node_modules.*opensearch.*js$/, loader: 'babel-loader' },
      { test: /node_modules.*ol.*js$/, loader: 'babel-loader' },
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
      { test: /\.coffee$/, loader: 'coffee-loader' },
      { test: /\.litcoffee$/, loader: 'coffee-loader?literate' },
      { test: /\.css$/, loaders: ['style-loader', 'css-loader'] },
      {
        test: /\.(scss)$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader', // translates CSS into CommonJS modules
            }, {
              loader: 'postcss-loader', // Run post css actions
              options: {
                plugins() {
                  return [
                    precss,
                    autoprefixer
                  ];
                }
              }
            }, {
              loader: 'sass-loader' // compiles SASS to CSS
            }
          ]
        })
      },
      { test: /\.less$/, loaders: ['style-loader', 'css-loader', 'less-loader'] },
      { test: /\.hbs$/, loader: 'handlebars-loader', options: { knownHelpersOnly: false, helperDirs: path.join(__dirname, 'src', 'helpers') } },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'url-loader?limit=10000',
      },
      {
        test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
        use: 'file-loader',
      },
      { test: /font-awesome\.config\.js/,
        use: [
          { loader: 'style-loader' },
          { loader: 'font-awesome-loader' },
        ],
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'main.css', allChunks: true,
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      jquery: 'jquery',
      'window.jQuery': 'jquery',
    }),
    new webpack.BannerPlugin(
      `CODE-DE version: ${packageJson.version}\neoxc version: ${eoxcPackageJson.version}`
    ),
  ],
  //devtool: 'source-map',
  cache: true,
};
