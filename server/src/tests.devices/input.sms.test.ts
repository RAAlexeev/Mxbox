import { modem } from "./result/send.sms";

//node-gsm-modem sms-gsm

modem.on('onNewMessage', (messageDetails)=>{console.dir(messageDetails)})