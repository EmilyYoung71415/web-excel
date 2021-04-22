const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProd = process.env.NODE_ENV === 'prod';
const isDev = process.env.NODE_ENV === 'dev';

module.exports = {
    mode: isProd ? 'production' : 'development',
    entry: {
        excel: './src/index.ts'
    },
    plugins: [
        new HtmlWebpackPlugin({
          title: '个人在线excel项目',
          template: './index.html',
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
            chunkFilename: isDev ? '[id].[hash].css' : '[id].css',
        })
    ],
    devtool: 'inline-source-map',
    devServer: {
        // contentBase: './dist',
        compress: true,
        port: 8081,
        host: 'localhost',
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    'style-loader', 
                    'css-loader'
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
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
};