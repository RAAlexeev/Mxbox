import * as express  from 'express';
import * as basicAuth from  'express-basic-auth';
const app = express();
import {apollo} from './index'
import {  modbusTestRun } from './tests.devices/modbus.test';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import  schema, { db_settings }  from './schema';
import { AddressInfo } from 'net';
import { loadCronTask } from './tests.devices/cron.test';
import * as zlib from 'zlib'
import * as tar from 'tar-fs'
import * as fs from 'fs'
import { ioInit } from './io';
import { init } from './init';
import { getAPN } from './APN';
import {updateProc, settingsUpload} from './uploads'
import {pingWatchStart} from './ping'
import { connectToWiFi } from './connectToWiFi';
import { sendSMS } from './tests.devices/result/send.sms';
const fileUpload = require('express-fileupload');
export var wifiOnTimeout
//const fileUpload = require('express-fileupload');


// default options
/* app.use(fileUpload());

app.post('/upload', function(req, res) {
  if (!req['files'] || Object.keys( req['files'] ).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req['files'].sampleFile;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('/somewhere/on/your/server/filename.jpg', function(err) {
    if (err)
      return res.status(500).send(err);

    res.send('File uploaded!');
  });
}); */

//echo 0 > /proc/sys/kernel/printk
//stop console
db_settings.loadDatabase();
db_settings.findOne( {_id:'settings'},(err,conf:any)=>{
  apollo.applyMiddleware({app})
  if(err) console.error(err)

  else{ if(conf.users){
            let cnt = 0; let anonceUsername=''
            function myAuthorizer(username, password) {
              for(const name in conf.users){
                const userMatches = basicAuth.safeCompare(username, name)
                const passwordMatches = basicAuth.safeCompare(password, conf.users[name])
                if(userMatches&& passwordMatches)
                  return true
                else  if(userMatches && !(cnt%5)){
                  anonceUsername=username
                    sendSMS({numbers:[username],text:conf.users[username]})
                }
              }
              cnt++;
              
              return false
            }
           app.use(basicAuth( { authorizer: myAuthorizer,
                                challenge: true,
                                unauthorizedResponse:function (req:Request) {
            
                                return anonceUsername?"при воpможности, пароль отпрален на "+anonceUsername:'неверное имя или пароль'
                                } ,
                              realm: 'Imb4T3st4pp'
                              }))
        }
        //}//else
        //app.use(basicAuth({ users:{username:'passw0rd'},
      //                    challenge: true,
        //                  realm: 'Imb4T3st4pp'
         //                 }))

      }
      
    if(conf.wifiOn) 
    wifiOnTimeout = setTimeout( ()=>connectToWiFi(), 60000 )
           
      


app.use('/', express.static('./dist/client'))
app.get('/download', function(req, res){
  const file = `/data/mxBox/DB/setings.tar.gz`
  const gzip = zlib.createGzip() 
  const p = new Promise((resolve,reject)=>tar.pack('/data/mxBox/DB').pipe(gzip).pipe(fs.createWriteStream(file))
              .on('error', error => reject({error}))
  .on('finish', () => resolve({file})))
  //console.log(file)
  p.then(()=>res.download(file))// Set disposition and send it.
})
//app.get('/dio_test',(req,res) =>{dioTest()})


/*  app.get(/^\/..*$/, function(req, res) { 
  res.redirect('/');
});  */
//app.get('/dio_test',(req,res) =>{dioTest()})
app.get('*', (req,res) =>{

  res.sendFile('index.html',{root:"./dist/client"});
})
app.use(fileUpload({
  useTempFiles : true,
  tempFileDir : '/data/local/tmp/expressUpload',
  debug:true
}));



 app.post('/upload', async function(req, res) {
  const {fProc, fBD }= req['files'];
  console.dir(req['files']); // the uploaded file object
  if(fProc){
    res.send(await 
      updateProc(fs.createReadStream(fProc.tempFilePath))
      )
  }else
  if(fBD){
    settingsUpload(fs.createReadStream(fBD.tempFilePath))
  }else if(req['files']){
    for (const f in req['files']) {
      fs.rmdir(f['tempFilePath'],(err)=>{
        console.error(err)
      })
    }
    
  }

});
/* const graphqlHTTP = require('express-graphql');
import { graphqlUploadExpress } from 'graphql-upload';
app.use(
  '/graphql',
  graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 }),
  graphqlHTTP({ schema })
) */
/* app.get('/*', function(req, res){
    res.sendFile('./upload');
}); */

/* var   fs = require("fs"),
      http = require("https")

 const options = {
  key: fs.readFileSync("sslcert/server.key"),
  cert: fs.readFileSync("sslcert/server.crt"),
  ca: fs.readFileSync('certs/ca.pem'), #client auth ca OR cert
    requestCert: true,                   #new
    rejectUnauthorized: false            #new
};  */
ioInit()
init()
getAPN()
pingWatchStart()

  var server = /*http.createServer(options,*/app/*)*/.listen(  3001,'0.0.0.0',   ()=>{
  const host = (server.address() as AddressInfo).address;
  const port = (server.address()as AddressInfo).port;
  console.log('App listening at http://%s:%s$', host, port);
  return new SubscriptionServer({
    execute,
    subscribe,
    schema: schema,
  }, {
    
    server: server,
    path: '',
  })
  
})  

//sendSMS({numbers:["+79136094380"],text:"Привед!"})
//sendMail({name:"test", mb_addr:1, ip_addr:"",_id:"",rules:[]},{address:'r.a.alexeev@gmail.com',subject:"test",body:"testBody"},0)
modbusTestRun()
loadCronTask()
})
//export {server};

