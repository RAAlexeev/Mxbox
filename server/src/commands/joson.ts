import { sendSMS } from "../tests.devices/result/send.sms";
import { sendMail } from '../tests.devices/result/send.email';

export const parseCommand = (jsonTxt:string)=>{
   jsonTxt = jsonTxt.replace(/\,(\s?)+num:/g,',numbers:').replace(/\,(\s?)+txt:/g,',text:')
   .replace(/[^e]mail:/g,'email:').replace(/addr:/,'address:').replace(/sub:/g,'subject:').replace(/msg:/g,'body')
   const cmd = JSON.parse(jsonTxt)
   if(cmd.sms){
    if( !Array.isArray(cmd.sms.numbers) ) cmd.sms.numbers= [cmd.sms.numbers]
    sendSMS(cmd.sms)
   }
   if(cmd.email){
    sendMail(cmd.email)
   }
   if(cmd.tcp){
/*     const net = require('net');

    const client = new net.Socket();
    client.connect(cmd.tcp.port, '127.0.0.1', function() {
        console.log('Connected');
       // client.write('Hello, server! Love, Client.');
    });
    
    client.on('data', function(data) {
        console.log('Received: ' + data);
        client.destroy(); // kill client after server's response
    });
    
    client.on('close', function() {
        console.log('Connection closed');
    }); */
   }
}
