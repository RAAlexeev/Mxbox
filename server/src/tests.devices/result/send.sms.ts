import { Sms, Device } from '../../schema';

const cmd = require('node-cmd')

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
cmd.get("ps|grep ril", (err,data,stderr)=>{
    if (!err) {          
      const pid = String(data).substr(10,6)
      console.log("pid:",pid)
    //  if(pid){
              cmd.get("kill -STOP "+ pid, async (err,data,stderr)=>{
                const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
                await sleep(3000)
                if (!err) {
                    modem.open('/dev/radio/atci1', options,(err,res)=>{
                        if(err){
                            console.error('reboot',err)
                            cmd.get('reboot')
                        }
                        else
                        cmd.get('svc wifi disable && service call wifi 29 i32 0 i32 1'/* && stop ril-daemon*/,(err, data, stderr)=>{
                            if (!err) {
                               console.log(data)
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



  modem.on('open', () => {


            getNetworkSignal()
            modem.setModemMode(  (msg,err)=>{
                if(err)
                    console.error(err)
                else modem.isInit=true
            },'PDU')
        
  
})
   
  
const getNetworkSignal = ()=>{
    //console.log(getNetworkSignal)
    modem.getNetworkSignal(async(result, error)=>{

        if(!error){
            console.dir(result)
        }else
            console.log('getNetworkSignal:',error)

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        
        await sleep(10000)

        setImmediate(() => {
            getNetworkSignal()
        })
    })
}

export function sendSMS(sms:Sms,device?:Device){
   
    const interval = setInterval((sms:Sms,device:Device)=>{
         const text=device.name +':'+sms.text
        for(const mumber of sms.numbers)
         if(mumber)modem.sendSMS( mumber, text, false, 
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