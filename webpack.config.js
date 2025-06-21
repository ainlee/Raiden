import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

// 解決 __dirname 在 ES 模組中的問題
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** 
 * Webpack 開發模式配置
 * @type {import('webpack').Configuration}
 */
export default {
  mode: 'development',
  entry: './src/main.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 5500,
    hot: true,
    open: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias: {
      '@systems': path.resolve(__dirname, 'src/systems'),
      '@scenes': path.resolve(__dirname, 'src/scenes/'),
      phaser: path.resolve(__dirname, 'node_modules/phaser/dist/phaser.js')
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|json)$/,
        type: 'asset/resource'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      // favicon: './assets/favicon.ico' // 暫時移除
    })
  ]
};