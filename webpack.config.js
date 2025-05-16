const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = (env) => {
  const isProduction = env.NODE_ENV === 'production';
  const isServing = env.WEBPACK_SERVE === 'true';
  const analyzeBundle = env.ANALYZE === 'true';

  // Configuration for web app
  return {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'source-map',
    stats: 'errors-warnings',
    target: 'web',
    entry: ['./src/renderer/index.tsx'],
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash:8].js' : '[name].js',
      chunkFilename: isProduction ? '[name].[contenthash:8].chunk.js' : '[name].chunk.js',
      globalObject: 'this',
      // Set publicPath based on environment - using '/' for production as we'll host at root path on Render
      publicPath: isProduction ? '/' : 'http://localhost:9000/', 
      pathinfo: !isProduction,
      // Clean the output directory before emit
      clean: true,
    },
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
      // Prefer main field for proper tree-shaking
      mainFields: ['module', 'main'],
    },
    optimization: isProduction ? {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            ecma: 2020,
            compress: {
              passes: 3,
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
              global_defs: {
                '@process.env.NODE_ENV': JSON.stringify('production'),
              },
            },
            mangle: {
              safari10: true,
            },
            output: {
              comments: false,
              ascii_only: true,
            },
          },
          extractComments: false,
          parallel: true,
        }),
      ],
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 20000,
        maxSize: 250000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: -10,
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            name: 'react-vendor',
            chunks: 'all',
            priority: 20,
            enforce: true, 
          },
          router: {
            test: /[\\/]node_modules[\\/](react-router|react-router-dom)[\\/]/,
            name: 'router-vendor',
            chunks: 'all',
            priority: 19,
          },
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: 'mui-vendor',
            chunks: 'all',
            priority: 18,
            enforce: true,
          },
          emotion: {
            test: /[\\/]node_modules[\\/]@emotion[\\/]/,
            name: 'emotion-vendor',
            chunks: 'all',
            priority: 17,
          },
          framer: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-vendor',
            chunks: 'all',
            priority: 16,
          },
          rive: {
            test: /[\\/]node_modules[\\/]@rive-app[\\/]/,
            name: 'rive-vendor',
            chunks: 'all',
            priority: 15,
          },
          dndkit: {
            test: /[\\/]node_modules[\\/]@dnd-kit[\\/]/,
            name: 'dnd-vendor',
            chunks: 'all', 
            priority: 14,
          },
          dexie: {
            test: /[\\/]node_modules[\\/]dexie[\\/]/,
            name: 'dexie-vendor',
            chunks: 'all',
            priority: 13,
          },
        },
      },
      moduleIds: 'deterministic',
      chunkIds: 'deterministic',
      mangleExports: 'deterministic',
      nodeEnv: 'production',
      flagIncludedChunks: true,
      sideEffects: true,
      usedExports: true,
      concatenateModules: true,
    } : undefined,
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public/index.html'),
        inject: true,
        filename: 'index.html',
        // Make sure scripts use relative paths in production
        scriptLoading: 'defer',
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        } : false,
      }),
      ...(isProduction && analyzeBundle ? [new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: 'bundle-report.html',
        openAnalyzer: true,
        generateStatsFile: true,
        statsFilename: 'bundle-stats.json',
      })] : []),
    ],
    performance: {
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
      hints: isProduction ? 'warning' : false,
    },
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
};
