var webpack = require('webpack');
var path = require('path');

// variables
var isProduction = process.env === 'production';
var sourcePath = path.join(__dirname, './src');
var outPath = path.join(__dirname, './dist');

// plugins
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
//const reactToolboxVariables = require('./reactToolbox.css');
// const srv = require( '../server-test/dist/main.js')
 const clientConf = {
  mode:'development',//"production",
  context: sourcePath,
  entry: {
    main: './index.ts',
   // vendors: [
   // "webpack-material-design-icons"
   // ]
  },
  output: {
    path: outPath,
    devtoolModuleFilenameTemplate: 'webpack://[namespace]/[resource-path]?[loaders]',
    filename: '[name]-[hash].js',
    publicPath: '/'
  },
  target: 'web',
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
    mainFields: ['module', 'browser', 'main']
  },
  module: {
    rules: [
      // .ts, .tsx
      {      
        test: /\.tsx?$/,
        exclude: /[\\/]node_modules[\\/]/,
        use: 'awesome-typescript-loader',
      },


      // css

      {
          test: /\.css$/i,
          //exclude: /node_modules[\\/]/,
          use: [
            {
              loader: 'style-loader',
            },
             {
              loader: 'css-loader',
              options: {
                  modules: true,
                  url: true,
                  import: true,
                  importLoaders: 2,
                  localIdentName: '[name]__[local]___[hash:base64:5]', 
                
                 modules: true,
               /*   getLocalIdent: (context, localIdentName, localName, options) => (
                    getScopedName(localName, context.resourcePath)
                ) */
                
                
                  
              },
            }, 
            {
              loader: 'postcss-loader',
            },
            {
              loader:'resolve-url-loader',
            }
          ]
      },

      {
        type: 'javascript/auto',
        test: /\.mjs$/,
        use: []
      },
      // static assets
      { test: /\.html$/, use: 'html-loader' },
     // { test: /\.png$/, use: 'url-loader?limit=10000' },
    //  { test: /\.jpg$/, use: 'file-loader' },
      { test: /\.(jpe?g|png|gif|svg|eot|woff|ttf|svg|woff2)$/, use: "url-loader?name=[name].[ext]" }
    ],
  },
  plugins: [
      new ExtractTextPlugin({
      filename: 'styles.css',
      disable: !isProduction
    }),
    new HtmlWebpackPlugin({
      template: 'assets/index.html'
    }),
    new CopyWebpackPlugin([
      { from: '../static' }
    ])
  ],
  devServer: {
    //before: (app,server)=> srv(app,server),  
    proxy:{
      '/graphql':'http://localhost:3001',
      pathRewrite: {'^/' : ''}
    },
    contentBase: sourcePath,
    hot: true,
    host:"::",
    port:3000,
    stats: {
      warnings: true
    },
  },
 optimization: { 

  runtimeChunk: "single",
  splitChunks: {
   chunks: 'async',
   maxInitialRequests: Infinity,
   minSize: 0,
   cacheGroups: {
     vendor: {
       test: /[\\/]node_modules[\\/]/,
       name: 'vendor',
       enforce: true,
       chunks: 'initial'
     },
   },
 },
}, 
  node: {
    // workaround for webpack-dev-server issue
    // https://github.com/webpack/webpack-dev-server/issues/60#issuecomment-103411179
    fs: 'empty',
    net: 'empty',
    
  }
};

const serverConf={
  externals:{
    serialport: "serialport",
    //node_modbus:"node-modbus"
    
  },
  //mode:"development",
  mode:"production",
  context:  path.resolve(__dirname,'../server-test/src'),
  entry: {
    main: path.resolve(__dirname,'../server-test/src/app-server.ts'),
/*     vendor : [
      'apollo-server-express',
      'graphql',
      'nedb'
    ] */
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
  
node: { 
  __dirname: true, __filename:true 
},
 optimization: { 
  namedChunks: true,
 // runtimeChunk: "single",
    splitChunks: {
      
      chunks: 'async',
      maxInitialRequests: Infinity,
      minSize: 0,
   cacheGroups: {
     vendor: {
       test: /[\\/]node_modules[\\/]/,
       name: 'vendor',
       enforce: true,
       //chunks: 'all'
     },
   },
 }, 
},  
//externals: [nodeExternals()]
}

module.exports = [clientConf]