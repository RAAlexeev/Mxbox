
import {db, Device, pubsub, ERROR_MESSAGES} from '../schema'
import{TestDevicesModbus} from './modbus.test'
//node-gsm-modem sms-gsm

//console.log('onMessage')
//modem.on('onNewMessage', (messageDetails)=>{console.dir(messageDetails)})

export const  inputSMS = ({data})=>{
  for(const inSms of data){
    pubsub.publish(ERROR_MESSAGES,{errorMessages:{message:inSms.message+'['+inSms.sender+']'}})
  }
   
    db.find( {'rules.trigs.type':2}, async(err,devices:Device[])=>{
        if(err){
            console.error(err)
            return
        }
        
        for(const dev of devices){
            for(const rule of dev.rules){
                if(rule.trigs)
                for(const trig of rule.trigs){
                    if(trig)
                    if(trig.type === 2){
                      if(trig.sms){
                        for(const number of trig.sms.numbers ){
                            const n = number.replace(/^\+?8/,'7')
                          for(const inSms of data){
                            console.log(n,inSms.sender,trig.sms.text === inSms.message)
                            pubsub.publish(ERROR_MESSAGES,{errorMessages:{message:inSms.toString()}})
                            if(  n  === inSms.sender  ){
                              if(trig.sms.text === inSms.message){
                                 
                                   await TestDevicesModbus.onTrig(dev, rule)
                                  
                              }
                            }
                          }
                        }
                      }
                    }
                }
            }    
        }
    })

}