const config = require('./webpack.config');
const path = require('path');
config.mode = 'development';
config.devServer = {
  contentBase: path.join(__dirname, 'docs'),
  compress: true,
  port: 9000,
  index: 'playground.html'
}

module.exports = config;