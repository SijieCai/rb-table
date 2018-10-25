const config = require('./webpack.config');

config.mode = 'production';
config.devServer = {
  contentBase: path.join(__dirname, 'doc'),
  compress: true,
  port: 9000
}

module.exports = config;