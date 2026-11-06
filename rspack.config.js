/* eslint-disable */
const { rspack } = require('@rspack/core');
const path = require('path');
const TsConfigJson = require('./tsconfig.json');
/* eslint-enable */

const isProduction = process.env.NODE_ENV === 'production';

const alias = {};
if (TsConfigJson.compilerOptions.paths) {
  const paths = TsConfigJson.compilerOptions.paths;
  Object.keys(paths).forEach((key) => {
    alias[key] = path.resolve(__dirname, paths[key][0]);
  });
}

module.exports = {
  mode: isProduction ? 'production' : 'development',
  target: 'node24',
  stats: isProduction ? 'normal' : 'errors-warnings',
  resolve: {
    extensions: ['.js', '.ts'],
    alias,
  },
  entry: {
    main: isProduction ? './src/app.ts' : ['./scripts/hot.cjs', './src/app.ts'],
  },
  output: {
    path: path.join(__dirname, isProduction ? 'dist' : '@dev'),
    filename: 'app.js',
  },
  externals: {
    express: 'commonjs express',
    mysql2: 'commonjs mysql2',
    'mysql2/promise': 'commonjs mysql2/promise',
    mssql: 'commonjs mssql',
    // redis 에서 참조하는 모듈로 빌드 시 warning 발생하여 externals 처리
    '@opentelemetry/api': 'commonjs @opentelemetry/api',
    // redis 에서 참조하는 모듈로 빌드 시 warning 발생하여 externals 처리
    '@node-rs/xxhash': 'commonjs @node-rs/xxhash',
  },
  optimization: {
    minimize: isProduction,
  },
  module: {
    rules: [
      {
        test: /\.(ts)$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            target: 'es2022',
            parser: { syntax: 'typescript', decorators: true },
            transform: { legacyDecorator: true, useDefineForClassFields: true },
          },
        },
      },
    ],
  },
  plugins: isProduction ? [] : [new rspack.HotModuleReplacementPlugin()],
};
