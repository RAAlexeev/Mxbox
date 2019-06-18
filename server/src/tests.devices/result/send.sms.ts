import { Sms, Device } from '../../schema';

const cmd = require('node-cmd')
cmd.run('stop ril-daemon')


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





  modem.on('open', () => {
  
        
            modem.setModemMode(  (msg,err)=>{
                if(err)
                    console.error(err)
                else modem.isInit=true
            },'PDU')
        
  
})
   
modem.open('/dev/radio/atci1', options,(err,res)=>{
    if(err){
        console.error('reboot',err)
        cmd('reboot')
    }
    else
    console.log(res)
})  



export function sendSMS(sms:Sms,device?:Device){
   
    const interval = setInterval((sms:Sms,device:Device)=>{
         const text=device.name +':'+sms.text
        for(const mumber of sms.numbers)
         modem.sendSMS( mumber, text, false, 
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