import * as express  from 'express';
const app = express();
import {apollo} from './index'
import {  modbusTestRun } from './tests.devices/modbus.test';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import { schema } from './schema';
import { AddressInfo } from 'net';
import { sendSMS } from './tests.devices/result/send.sms';



apollo.applyMiddleware({app});
app.use('/', express.static('./'));
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
  var server = /*http.createServer(options,*/ app/*)*/.listen(process.env.PORT || 3001,   ()=>{
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
modbusTestRun()
//export {server};