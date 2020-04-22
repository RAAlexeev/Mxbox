import { Sms, Device, ERROR_MESSAGES, pubsub, SIGNAL_GSM } from '../../schema';

import cmd  from 'node-cmd'
import { isUndefined } from 'util';
import { RTUproxyReguest } from '../modbus.test';
import { TCPproxyReguest } from '../modbusProxy/TCP.proxy';
//echo "-w=26:0 0 0 1 0 1 0" >/sys/devices/virtual/misc/mtgpio/pin
import serialportgsm from 'serialport-gsm'
import {inputSMS} from '../input.sms.test'
import { setDO } from '../../io';

export const modem = serialportgsm.Modem()
const options = {
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    rtscts: false,
    xon: false,
    xoff: false,
    xany: false,
    autoDeleteOnReceive: true,
    enableConcatenation: true,
    incomingCallIndication: true,
    incomingSMSIndication: true,
    pin: '',
    customInitCommand: '',
    logger: console
}
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const init = ()=> cmd.get("ps|grep rild", async(err,data,stderr)=>{
     

    if (!err) {          
      const pid = data.substr(10,6)
      console.log("pid:",pid)
      if( !(parseInt( pid ) > 0) ){
        
        await sleep(1000)
        setImmediate(() => {
            init()
        })
        return
      }
      await sleep(60000)        
      cmd.get("kill -STOP "+ pid, async (err,data,stderr)=>{
                await sleep(100)
                if (!err) {
                    modem.open('/dev/radio/atci1', options,(err,res)=>{
                        if(err){
                            console.error('reboot',err)
                            cmd.run('reboot')
                        }
      
                         
      
                        console.log(res)
                    
                })}
        
                 else {
                    console.error('init:', err)
                }
              })    
      //   }    

        } else {
        console.error('init:', err)
     }  
})




  modem.on('open', () => {
           setInterval(getNetworkSignal,40000)

            modem.setModemMode( (msg, err)=>{
                if(err)
                    console.error(err)
                else modem.isInit=true
            },'PDU')
            modem.enableEcho();
       
            modem.executeCommand('AT+CNMI=0',()=>{
            setInterval(()=>{
                modem.getSimInbox((data, err)=>{
                if(err){
                    console.error(err) 
                    return
                }
                modem.deleteAllSimMessages()
                if(data.data.length)inputSMS(data) 
                
            })},30000)     
        })
})
   
const lamp = { intervalId:undefined, state:false }
process.on('exit',(code)=>setDO(3,0)) // погасить
const getNetworkSignal = ()=>{
    if(!(RTUproxyReguest.length||TCPproxyReguest.length))
    modem.getNetworkSignal((result, error)=>{
       
        if(!error){
            const q=parseInt(result.data.signalQuality)
           // console.dir( result )
            //console.log( 'q:',q,lamp.intervalId )
            pubsub.publish( SIGNAL_GSM, q );
            if( q > 6 && q <= 30 ){     
                clearInterval( lamp.intervalId ) 
                lamp.intervalId = undefined
                setDO(3,1) // зажеч   
               }else{
              if( q <= 6  && isUndefined( lamp.intervalId ))
                lamp.intervalId = setInterval(()=>{
                    lamp.state =  !lamp.state
                    if( lamp.state ) 
                     setDO(3,1) // зажеч      
                    else
                    setDO(3,0)  // погасить
                    
                    },200) as any
               else{
                clearInterval(lamp.intervalId)
                setDO(3,0)  // погасить
               }
            }

        }else
            console.log('getNetworkSignal:',error)
        
            pubsub.publish( SIGNAL_GSM, -1);


    })
}

export function sendSMS(sms:Sms,device?:Device){
    let interval
   const sendSMS =(sms:Sms,device?:Device)=>{
    const text=device?device.name +':'+sms.text:sms.text
   for(const mumber of sms.numbers)
    if( mumber )modem.sendSMS( mumber, text, false, 
       (result)=>{
          async function* x(){
          
               console.log("sending... ",result)
               yield console.log("sended... ",result)
               if(result.status!='success'){
               if( (result.response as string).search('+CMS ERROR: 41')||(result.response as string).search('+CMS ERROR: 521')
                    ||(result.response as string).search('+CMS ERROR: 522')||(result.response as string).search('+CMS ERROR: 532')
                    ||(result.response as string).search('+CMS ERROR: 435') ){  
                    await sleep(600000) 
                    setImmediate(sendSMS,sms,device)
               }
               pubsub.publish(ERROR_MESSAGES, { deviceLinkState:{ message:'Send sms: '+ result.response }  });  
             }
                 
           }
       x().next()
   }) 
}

sendSMS(sms,device)  
            
}