const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const resolve = dir => path.join(__dirname, '..', dir);

module.exports = {
  entry: {
    webexcel: './src/index.js',
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    //  you should know that the HtmlWebpackPlugin by default will generate its own index.html
    new HtmlWebpackPlugin({
      template: './index.html',
      title: 'web-excel',
    }),
    new MiniCssExtractPlugin({
      filename: `styles/[name].css`
    })
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          'babel-loader',
        ],
        include: [resolve('src'), resolve('test')],
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader',
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          'file-loader',
        ],
      },
    ],
  },
};
