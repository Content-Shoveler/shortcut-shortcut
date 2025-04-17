const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env) => {
  const isProduction = env.NODE_ENV === 'production';
  const isServing = env.WEBPACK_SERVE === 'true';
  const target = env.WEBPACK_TARGET || 'renderer';

  const baseConfig = {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
    },
  };

  // Configuration for the renderer process
  const rendererConfig = {
    ...baseConfig,
    target: 'web',
    entry: ['./src/renderer/index.tsx'],
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'renderer.js',
      globalObject: 'this',
      publicPath: './',
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public/index.html'),
      }),
    ],
    devServer: isServing
      ? {
          static: {
            directory: path.join(__dirname, 'dist'),
            publicPath: '/',
          },
          port: 9000,
          hot: true,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          devMiddleware: {
            writeToDisk: true,
          },
          historyApiFallback: true,
        }
      : undefined,
  };

  // Configuration for the main process
  const mainConfig = {
    ...baseConfig,
    target: 'electron-main',
    entry: {
      main: './src/main/main.ts',
      preload: './src/main/preload.ts',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      publicPath: './',
    },
    node: {
      __dirname: false,
      __filename: false,
    },
  };

  return target === 'main' ? mainConfig : rendererConfig;
};
