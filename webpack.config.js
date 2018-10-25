// const webpack = require('webpack');
const path = require('path');
module.exports = {
  context: __dirname,
  entry: "./docs/index.js",
  output: {
    path: path.join(__dirname, 'docs'),
    filename: "bundle.js",
    publicPath: '/rb-table'
  },
  externals: {
    'react': "React",
    'react-dom': "ReactDOM",
  },
  module: {
    rules: [
      { test: /\.js$/, use: 'babel-loader', exclude: /node_modules/ },
      { test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader'] },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ]
  },
  devtool: '',
  mode: 'production'
};