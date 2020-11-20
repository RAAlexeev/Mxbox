module.exports = ({ file, options, env }) => ({  
  map: 'inline',//env==='development'?'inline':false,
  parser: file.extname === '.sss' ? 'sugarss' : false,
      plugins: [
      require('postcss-import'),
      require('postcss-url'), 
      require('postcss-preset-env')({
       // autoprefixer: { grid: true },
        browsers: 'last 2 versions',
        preserve: false,
        stage:2,
        features: {
          'nesting-rules': true,
          'color-mod-function': { unresolved: 'warn' }
        },
        importFrom:{
          customProperties:{
            '--button-toggle-font-size':'200%'
          }
        }
      }),
     require('postcss-color-function'),
    ],
    'cssnano': env === 'production'? {}: false
/*   plugins: {
  //  'postcss-color-function':{},//options['postcss-color-function'] ? options['postcss-color-function'] : false,
   // 'postcss-reporter':{},
   'postcss-import': {},
   // 'postcss-preset-env':options['postcss-preset-env'] ? options['postcss-preset-env'] : false,
   'postcss-preset-env': {
          browsers: 'last 2 versions',
      },
     // Convert px to rem almost everywhere, similar to sass's "remy" macro
   // 'postcss-pxtorem':{ propList: ['*', '!border', '!box-shadow'] },
    //'postcss-browser-reporter':{ disabled: false },    
    //'postcss-url':{},
   
  } */
});
