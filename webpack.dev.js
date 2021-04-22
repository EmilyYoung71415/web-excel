const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const common = require('./webpack.config.js');

module.exports = merge(common, {
    mode: 'development',
    plugins: [
    //  you should know that the HtmlWebpackPlugin by default will generate its own index.html
        new HtmlWebpackPlugin({
            template: './index.html',
            title: 'web-excel',
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
            // chunkFilename: devMode ? '[id].[hash].css' : '[id].css',
        }),
    ],
    output: {
        filename: '[name].js',
    },
    devtool: 'inline-source-map',
    devServer: {
        // contentBase: path.join(__dirname, 'example'),
        compress: true,
        port: 8081,
        host: 'localhost',
    },
});
