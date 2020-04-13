import * as express  from 'express';
const app = express();
import {apollo} from './index'
import {  modbusTestRun } from './tests.devices/modbus.test';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import { schema } from './schema';
import { AddressInfo } from 'net';
import { loadCronTask } from './tests.devices/cron.test';
import * as zlib from 'zlib'
import * as tar from 'tar-fs'
import * as fs from 'fs'
import { ioInit } from './io';
import { init } from './tests.devices/result/send.sms';
import { getAPN } from './APN';
//echo 0 > /proc/sys/kernel/printk
//stop console
apollo.applyMiddleware({app});
app.get('/download', function(req, res){
  const file = `/data/mxBox/DB/setings.tar.gz`;
  const gzip = zlib.createGzip() 
  const p = new Promise((resolve,reject)=>tar.pack('/data/mxBox/DB').pipe(gzip).pipe(fs.createWriteStream(file))
              .on('error', error => reject({error}))
  .on('finish', () => resolve({file})))
  //console.log(file)
  p.then(()=>res.download(file)); // Set disposition and send it.
})
//app.get('/dio_test',(req,res) =>{dioTest()})
app.use('/', express.static('./dist/client'));

/*  app.get(/^\/..*$/, function(req, res) { 
  res.redirect('/');
});  */
//app.get('/dio_test',(req,res) =>{dioTest()})
app.get('*', (req,res) =>{
  
  res.sendFile('index.html',{root:"./dist/client"});
})

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
//ioInit()
init()
getAPN()
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

//export {server};

