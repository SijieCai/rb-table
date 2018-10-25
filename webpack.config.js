// const webpack = require('webpack');

module.exports = {
  context: __dirname,
  entry: "./examples/index.js",
  output: {
    path: __dirname,
    filename: "bundle.js"
  },
  externals: {
    'react': "React",
    'react-dom': "ReactDOM",
  },
  module: {
    rules: [
      { test: /\.js$/, use: 'babel-loader' },
      { test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader'] },
    ]
  },
  devtool: '',
  mode: 'development'
};