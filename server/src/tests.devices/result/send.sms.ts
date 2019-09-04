import { Sms, Device } from '../../schema';

import cmd  from 'node-cmd'
import { isUndefined } from 'util';
import { RTUproxyReguest } from '../modbus.test';
import { TCPproxyReguest } from '../modbusProxy/TCP.proxy';
//echo "-w=26:0 0 0 1 0 1 0" >/sys/devices/virtual/misc/mtgpio/pin
const serialportgsm = require('serialport-gsm')

const modem = serialportgsm.Modem()
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

const init = ()=> cmd.get("ps|grep rild", async(err,data,stderr)=>{
     

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
      await sleep(10000)        
      cmd.get("kill -STOP "+ pid, async (err,data,stderr)=>{
                await sleep(100)
                if (!err) {
                    modem.open('/dev/radio/atci1', options,(err,res)=>{
                        if(err){
                            console.error('reboot',err)
                            cmd.run('reboot')
                        }
                        else
                        cmd.get('svc wifi disable && service call wifi 29 i32 0 i32 1'/* && stop ril-daemon*/,(err, data, stderr)=>{
                            if (!err) {
                               console.log(data)

                               setTimeout(()=>cmd.run('stop zygote'),50000)
                            } else {
                               console.log('error', err)
                            }
                        })//service call wifi  29  i32 0 i32 1
                        console.log(res)
                    }) 
                } else {
                    console.log('error', err)
                }
              })    
      //   }    

        } else {
        console.log('error', err)
     }  
})


init()

  modem.on('open', () => {


           setInterval(getNetworkSignal,40000)
            modem.setModemMode(  (msg,err)=>{
                if(err)
                    console.error(err)
                else modem.isInit=true
            },'PDU')
        
  
})
   
const lamp = { intervalId:undefined, state:false }
process.on('exit',(code)=>cmd.run('echo "-w=26:0 0 0 0 0 1 0" > /sys/devices/virtual/misc/mtgpio/pin')) // погасить
const getNetworkSignal = ()=>{
    if(!(RTUproxyReguest.length||TCPproxyReguest.length))
    modem.getNetworkSignal(async(result, error)=>{
       
        if(!error){
            const q=parseInt(result.data.signalQuality)
           // console.dir( result )
            //console.log( 'q:',q,lamp.intervalId )
           
            if( q > 6 && q <= 30 ){     
                clearInterval( lamp.intervalId ) 
                lamp.intervalId = undefined
                cmd.run('echo "-w=26:0 0 0 1 0 1 0" > /sys/devices/virtual/misc/mtgpio/pin') // зажеч   
               }else{
              if( q <= 6  && isUndefined( lamp.intervalId ))
                lamp.intervalId = setInterval(()=>{
                    lamp.state =  !lamp.state
                    if( lamp.state ) 
                    cmd.run('echo "-w=26:0 0 0 1 0 1 0" > /sys/devices/virtual/misc/mtgpio/pin') // зажеч   
                    else
                    cmd.run('echo "-w=26:0 0 0 0 0 1 0" > /sys/devices/virtual/misc/mtgpio/pin') // погасить
                    
                    },200) as any
               else{
                clearInterval(lamp.intervalId)
                cmd.run('echo "-w=26:0 0 0 0 0 1 0" > /sys/devices/virtual/misc/mtgpio/pin') // погасить
               }
            }

        }else
            console.log('getNetworkSignal:',error)
        



    })
}

export function sendSMS(sms:Sms,device?:Device){
   
    const interval = setInterval((sms:Sms,device:Device)=>{
         const text=device.name +':'+sms.text
        for(const mumber of sms.numbers)
         if( mumber )modem.sendSMS( mumber, text, false, 
            (result)=>{
                function* x(){
                    if(result.status==='success')
                        clearInterval(interval)
                    yield console.log("sending... ",result)
                        console.log("sended... ",result)  
                        
                }
            x().next()
        }) 
    },10000,sms,device)

            
}