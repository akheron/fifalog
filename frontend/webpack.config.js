const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  entry: path.resolve(__dirname, 'src/index.tsx'),
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'index.css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          {
            loader: 'css-loader',
            options: { modules: { localIdentName: '[local]__[hash:base64]' } },
          },
          { loader: 'sass-loader' },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, '../dist/frontend/'),
    filename: 'index.js',
  },
  devtool: 'eval-source-map'
}
