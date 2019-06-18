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

        test: /\.css$/,    
        //exclude:/style\.css/,    
        use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: true,
                sourceMap: !isProduction,
                importLoaders: 2,
                localIdentName: '[local]__[hash:base64:5]',
                autoprefixer: false,
              }
            },
            'postcss-loader',
            'resolve-url-loader',
            
     /*        {
              loader: 'postcss-loader',
              options: {
               // exec: true ,
               
                config: {
                  ctx: {
                    
                    'postcss-preset-env': {
                     // stage:2,
                     // features: {
                   //     'nesting-rules': true,

                     // }
                    },
                    cssnano: {},

                  }
                }
              }
            } */
               
           
          ]
      //  }) 
      },
      {
        type: 'javascript/auto',
        test: /\.mjs$/,
        use: []
      },
      // static assets
      { test: /\.html$/, use: 'html-loader' },
     // { test: /\.png$/, use: 'url-loader?limit=10000' },
      { test: /\.jpg$/, use: 'file-loader' },
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
  context: path.join(__dirname, './src/server'),
  mode:"development",
  entry: {
    main: './index.ts',
  },
  output: {
    path: outPath,
    filename: 'server.js',
    publicPath: '/'
  },
  devtool:'eval-source-map',
  target:'web',
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
    // Fix webpack's default behavior to not load packages with jsnext:main module
    // (jsnext:main directs not usually distributable es6 format, but es6 sources)
    mainFields: ['module','main']
  },
  module: {
    rules: [
      // .ts, .tsx
      {
        test: /\.tsx?$/,
        use: 'awesome-typescript-loader?configFileName=server.tsconfig.json',
      },
      {
        type: 'javascript/auto',
        test: /\.mjs$/,
        use: [  ]
      }
    ]
  }
}

module.exports = [clientConf]