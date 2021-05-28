import cmd from 'node-cmd'
import serialportgsm from 'serialport-gsm'
import {inputSMS} from './tests.devices/input.sms.test'
import { setDO, di} from './io';

import { db_settings, ERROR_MESSAGES, pubsub, SIGNAL_GSM } from './schema';
import { RTUproxyReguest } from './tests.devices/modbus.test';
import { TCPproxyReguest } from './tests.devices/modbusProxy/TCP.proxy';
import { connectToWiFi } from './connectToWiFi';
import { sendSMS } from './tests.devices/result/send.sms';
import setSoftap from './set.softap';
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
    db_settings.loadDatabase()
    db_settings.findOne({_id:'settings'},(err, settings:any)=>{
        if(err)console.error(err)
        else if(settings&& settings.tz){

        }
    })
   setTimeout(()=>cmd.run("rm -R /data/mxBox/bakdist"), 50000)
   setSoftap()
   //loadAP()
   cmd.run("iptables -P INPUT DROP;iptables -P OUTPUT DROP;iptables -P FORWARD DROP;iptables  -A INPUT -i lo  -j ACCEPT;iptables -A OUTPUT -p udp --dport 53 -j ACCEPT;iptables  -A INPUT -p udp --dport 67  -j ACCEPT;iptables  -A INPUT -p udp --dport 68  -j ACCEPT;iptables -A OUTPUT -p icmp -j ACCEPT;iptables -A INPUT -p icmp -j ACCEPT;iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT;iptables  -A OUTPUT -p tcp --dport 465 -j ACCEPT;iptables  -A OUTPUT -s 192.168.43.1  -j ACCEPT;iptables  -A INPUT -d 192.168.43.1  -j ACCEPT")
  

   const lamp = { intervalId:undefined, state:false }

   process.on('exit',(code)=>setDO(3,0)) // погасить


const getNetworkSignal = ()=>{
    if(RTUproxyReguest.length||TCPproxyReguest.length)return
    {

        modem.executeCommand('AT+CREG?',(res, err)=>{
            console.log("AT+CREG?:",res)
            if(!res) return 
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
                    }}else{
                        console.log('getNetworkSignal:', error)
                        setDO(3,0)  // погасить
                        pubsub.publish( SIGNAL_GSM, {signalGSM:{value:-1}});
                    }
    
    
            })
            }  
        }).logic = (newpart) => {
            if(!newpart)return
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
    modem.on('open', () => {
       


         modem.setModemMode( (msg, err)=>{
             if(err)
                 console.error(err)
             else modem.isInit=true
         },'PDU')
         modem.enableEcho();
         setInterval(getNetworkSignal, 10000)    
         modem.executeCommand('AT+CNMI=0',()=>{

         setInterval(()=>{
             modem.getSimInbox((data, err)=>{
             if(err){
                 console.error(err) 
                 return
             }
             modem.deleteAllSimMessages()
             console.dir(data) // pubsub.publish(ERROR_MESSAGES,{errorMessages:{message:data.data.message}})
             /*{ status: ←[32m'success'←[39m,
                request: ←[32m'getSimInbox'←[39m,
                data:
                 [ { sender: ←[32m'79136094380'←[39m,
                     message: ←[32m'123'←[39m,
                     index: ←[33m1←[39m,
                     dateTimeSent: ←[35m2021-05-13T09:57:05.000Z←[39m,
                     header: ←[36m[Object]←[39m } ] }*/
             if(data.data&&data.data.length)inputSMS(data) 
             
         })},30000) 
         //sendSMS({numbers:['+79620306137'],text:'Старт'})     
     })
    }) 

    if (!err) {          
      const pid = data.substr(10,6)
      console.log("pid:",pid)
      if( !(parseInt( pid ) > 0) ){
        
        await sleep(10000)
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