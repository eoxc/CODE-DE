const webpack = require('webpack');
const path = require('path');
const packageJson = require('./package.json');
const eoxcPackageJson = require('eoxc/package.json');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const MomentTimezoneDataPlugin = require('moment-timezone-data-webpack-plugin');

const currentYear = new Date().getFullYear();

const babelConfigLoader = {
  loader: 'babel-loader',
  options: {
    presets: ['@babel/preset-env'],
    plugins: ['@babel/plugin-proposal-object-rest-spread'],
    cacheDirectory: true
  }
};

module.exports = {
  entry: {
    'code-de': ['./src/preload.js', './src/main.js']
  },
  resolve: {
    alias: {
      // necessary to avoid multiple packings of backbone due to marionette
      backbone: path.join(__dirname, 'node_modules', 'backbone', 'backbone'),
      scrollintoview: 'anno.js/bower_components/scrollintoview',
    },
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: `[name].bundle.${packageJson.version}.js`,
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
      {
        test: /\.json$/,
        use: { loader: 'json-loader' },
        type: 'javascript/auto'
      },
      {
        test: require.resolve('jquery'),
        use: [{
          loader: 'expose-loader',
          options: '$'
        }, {
          loader: 'expose-loader',
          options: 'jQuery'
        }]
      },
      { test: /node_modules.*eoxc.*js$/, use: babelConfigLoader },
      { test: /node_modules.*opensearch.*js$/, use: babelConfigLoader },
      { test: /node_modules.*ol.*js$/, use: babelConfigLoader },
      { test: /\.js$/, exclude: /node_modules/, use: babelConfigLoader },
      { test: /\.coffee$/, loader: 'coffee-loader' },
      { test: /\.litcoffee$/, loader: 'coffee-loader?literate' },
      { test: /\.less$/,
        use: [MiniCssExtractPlugin.loader,
          { loader: 'css-loader' },
          { loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                require('autoprefixer')(),
              ]
            }
          },
        { loader: 'less-loader' }] },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader' },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                require('autoprefixer')(),
              ]
            }
          },
          { loader: 'sass-loader', options: {} },
        ]
      },
      { test: /\.hbs$/, loader: 'handlebars-loader', options: { helperDirs: path.join(__dirname, 'node_modules', 'eoxc', 'src', 'helpers') } },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'url-loader?limit=10000',
      },
      {
        test: /\.(png|woff2|woff|ttf|eot|svg)($|\?)/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        }
      },
      { test: /font-awesome\.config\.js/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader' },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                require('autoprefixer')(),
              ]
            }
          },
          { loader: 'font-awesome-loader' },
        ],
      },
    ],
  },
  plugins: [
    new MomentLocalesPlugin(),
    new MomentTimezoneDataPlugin({
      startYear: currentYear - 20,
      endYear: currentYear + 12
    }),
    new MiniCssExtractPlugin({
      filename: `[name].bundle.${packageJson.version}.css`,
      chunkFilename: '[id].css'
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      _: 'underscore',
    }),
    new webpack.BannerPlugin(
      `CODE-DE version: ${packageJson.version}\neoxc version: ${eoxcPackageJson.version}`
    ),
  ],
};
