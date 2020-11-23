import { Sms, Device, ERROR_MESSAGES, pubsub, SIGNAL_GSM } from '../../schema';

//echo "-w=26:0 0 0 1 0 1 0" >/sys/devices/virtual/misc/mtgpio/pin


import{modem} from '../../init'
//const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));






  
   

export function sendSMS(sms:Sms,device?:Device){
   if( !modem.isOpened )  return 'modem:close'

    const text=device?device.name +':'+sms.text : sms.text
   for(const number of sms.numbers)
    if( number )modem.sendSMS( number, text, false, 
      function*(result){
           //function* x(result){
          
            console.log("sending... ",result)
            pubsub.publish(ERROR_MESSAGES,{ errorMessages:{ message:'Send sms: '+result.status+'|'+text}})
            yield console.log("sended... ",result)
               pubsub.publish(ERROR_MESSAGES,{ errorMessages:{ message:'Send sms: '+ result.status }})
               if(result.status!='success'){
               if( (result.response as string).search('+CMS ERROR: 41')||(result.response as string).search('+CMS ERROR: 521')
                    ||(result.response as string).search('+CMS ERROR: 522')||(result.response as string).search('+CMS ERROR: 532')
                    ||(result.response as string).search('+CMS ERROR: 435') ){  
                 
                    setTimeout( ()=>setImmediate(sendSMS, sms, device), 60000 )
               }
               pubsub.publish(ERROR_MESSAGES,{ errorMessages:{ message:'Send sms: '+ result.response }})
             } 
            
                 
           }
  ) 
  return 'пытаемся отправить SMS....'       
}