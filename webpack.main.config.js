const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/main/main.ts',
  target: 'electron-main',
  module: {
    rules: [{
      test: /\.ts$/,
      include: /src/,
      use: [{ loader: 'ts-loader' }]
    }]
  },
  output: {
    path: path.join(__dirname, './dist'),
    filename: 'main.js'
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './src/main/preload.js', to: './preload.js' },
        { from: './credentials.json', to: './credentials.json' },
      ],
    }),
    
    
  ],
  
  resolve: {
    extensions: ['.ts', '.js']
  },
  node: {
    __dirname: false,
    __filename: false
  },
  devtool: 'source-map'
};