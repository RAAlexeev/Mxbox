var webpack = require('webpack');
var path = require('path');

// variables
var isProduction = process.argv.indexOf('-p') >= 0;
var sourcePath = path.join(__dirname, './src');
var outPath = path.join(__dirname, './dist');
// Try the environment variable, otherwise use root
const ASSET_PATH = process.env.ASSET_PATH || '/';
const NodemonPlugin = require( 'nodemon-webpack-plugin' ) // Ding
// plugins
var nodeExternals = require('webpack-node-externals');
const serverConf={
  externals:{
    serialport: "serialport",
    //node_modbus:"node-modbus"
    
  },
  //mode:"development",
  mode:"production",
  context: path.join(__dirname, './src'),
  entry: {
    main: './app-server.ts',
     vendor : [
      'apollo-server-express',
      'graphql',
      'nedb'
    ] 
  },
  output: {
    path: outPath,
    filename: '[name].js',
    chunkFilename: '[name].js',
    library:'bundle.js',
    libraryTarget: "commonjs2",
    publicPath: '/'
  },
  target:'async-node',
  resolve: {
    extensions: ['.js', '.ts'],
    // Fix webpack's default behavior to not load packages with jsnext:main module
    // (jsnext:main directs not usually distributable es6 format, but es6 sources)
    modules: [
      'node_modules',
     // 'src',
    ],
    //mainFields: ['main' ]
  },
  module: {
    rules: [
      // .ts, .tsx
      {
        test: /\.tsx?$/,
        exclude: /\/node_modules\//,
        use: 'awesome-typescript-loader',
      },
      {
        type: 'javascript/auto',
        test: /\.mjs$/,
        use: []
      }
    ]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      debug: true
    }),
    new NodemonPlugin(), // Dong
],
node: { 
  __dirname: true, __filename:true 
},
optimization: {
  splitChunks: {
    chunks: 'async',
    minSize: 30000,
    maxSize: 0,
    minChunks: 1,
    maxAsyncRequests: 5,
    maxInitialRequests: 3,
    automaticNameDelimiter: '~',
    name: true,
    cacheGroups: {
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        priority: -10
      },
      default: {
        minChunks: 2,
        priority: -20,
        reuseExistingChunk: true
      }
    }
  }
}
//externals: [nodeExternals()]
}


module.exports = [serverConf]