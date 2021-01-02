const path = require('path')

const env = process.env.NODE_ENV || 'production'

module.exports = {
  // モード値を production に設定すると最適化された状態で、
  // development に設定するとソースマップ有効でJSファイルが出力される
  mode: env,
  entry: './src/index.jsx',
  output: {
    path: `${__dirname}/public`,
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js[x]?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env', {
                  targets: {
                    node: 'current',
                  },
                }],
              '@babel/preset-react',
            ],
            plugins: ['@babel/plugin-syntax-jsx'],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'public'),
    historyApiFallback: true,
    host: '0.0.0.0',
  },
}
