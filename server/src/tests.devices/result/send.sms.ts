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
      await sleep(30000)        
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
           setInterval(getNetworkSignal,10000)

            modem.setModemMode( (msg, err)=>{
                if(err)
                    console.error(err)
                else modem.isInit=true
                modem.enableEcho();
                sendSMS({numbers:["+79620306137"],text:"mxBox стартовал"})    
            },'PDU')
           
       
            modem.executeCommand('AT+CNMI=0',()=>{
            setInterval(()=>{
                modem.getSimInbox((data, err)=>{
                if(err){
                    console.error(err) 
                    return
                }
                modem.deleteAllSimMessages()
                if(data.data.length)inputSMS(data.data) 
                
            })},30000)  
 
        })
})
   
const lamp = { intervalId:undefined, state:false }
process.on('exit',(code)=>setDO(3,0)) // погасить
const getNetworkSignal = ()=>{
    if(!(RTUproxyReguest.length||TCPproxyReguest.length)){
        modem.executeCommand('AT+CREG?',(res, err)=>{
            console.log("AT+CREG?:",res)
            if( !err ){
                modem.getNetworkSignal((result, error)=>{
       
                    if(!error){
                        const q=parseInt(result.data.signalQuality)
                    // console.dir( result )
                        //console.log( 'q:',q,lamp.intervalId )
                        pubsub.publish( SIGNAL_GSM, {signalGSM:{value:q,  CREG: res.data}} );
                        if( res.data.stat == 1 && q > 6 && q <= 30  ){     
                            clearInterval( lamp.intervalId ) 
                            lamp.intervalId = undefined
                            setDO(3,1) // зажеч   
                        }else{
                        if( res.data.stat == 1 && q <= 6  && ( lamp.intervalId ==undefined))
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
                    
                    }else{
                        console.log('getNetworkSignal:', error)
                        setDO(3,0)  // погасить
                        pubsub.publish( SIGNAL_GSM, {signalGSM:{value:-1}});
                    }
    
    
            })
            }  
        }).logic = (newpart) => {
            if (newpart.startsWith('+CREG:')) {
                let value = newpart.split(' ')
                   value = value[1].split(',')
              return {
                resultData: {
                  status: 'success',
                  request: '+CREG?',
                  data:{
                      n:parseInt( value[0] ),
                      stat:parseInt(value[1] )
                  } 
                },
                returnResult: true
              }
            } else if (newpart.includes('ERROR')) {
              return {
                resultData: {
                  status: 'ERROR',
                  request: '+CREG?',
                  data: `+CREG?  ${newpart}`
                },
                returnResult: true
              }
            }
          }

  }
}
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