

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
//var nodeExternals = require('webpack-node-externals');

var WebpackAutoInject = require('webpack-auto-inject-version');

const serverConf={
   // mode:" --mode=production",
  //mode:"production",
  externals:{
  
    //bindings:'bindings',
    serialport:'serialport'
   //node_modbus:"node-modbus"  
  }, 
  context: path.join(__dirname, './src'),
  entry: {
    main: './app-server.ts'
  },
  output: {
    path: outPath,
    filename: '[name].js',
    chunkFilename: '[name].js',
    library:'lib',
    libraryTarget: "commonjs",
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
      },
      {
      test: /\.node$/,
      use: 'node-loader'
      }
    ]
  },
  plugins: [
    new WebpackAutoInject({
      // options
      // example:
      components: {
          AutoIncreaseVersion: true
      }
  }),
    new webpack.LoaderOptionsPlugin({
     // debug: true
    }),
    new NodemonPlugin(), // Dong
],
node: { 
  __dirname: true, __filename:true 
},
optimization: {
  
  // minimize: false,
  // splitChunks: {

  //   chunks: 'async',
  //  // minSize: 30000,
  //  // maxSize: 0,
  //   minChunks: 1,
  //   maxAsyncRequests: 5,
  //   maxInitialRequests: 3,
  //   automaticNameDelimiter: '~',
  //   name: true,
  //   cacheGroups: {
  //     vendors: {
  //       test: /[\\/]node_modules[\\/]/,
  //       priority: -10,
  //      reuseExistingChunk: true
  //     },
  //     default: {
  //       priority: -20
        
  //     }
  //   }
  // }
},
//externals: [nodeExternals()]
}


module.exports = [serverConf]