import { db, Device} from '../schema'
import cron from 'node-cron'
import { sendMail } from './result/send.email'
import { sendSMS } from './result/send.sms'
import { setDO } from './result/set.do'
import { TestDevicesModbus } from './modbus.test'
const tasks:any[] = []
export const loadCronTask = ()=>{
    db.find( { 'rules.trigs.type':1 }, ( err, devices:Device[] )=>{
        for(const device of devices){
            for(const rule of device.rules){
                if(rule.trigs)
                for(const trig of rule.trigs){
                   if(trig)
                   if(trig.type === 1 ){
                      try{
                       tasks.push(cron.schedule(trig.cron,()=>{
                        //    if(rule.acts)
                        //     for(const act of rule.acts){
                        //         if(act.sms) sendSMS(act.sms, device) 
                        //         if(act.email) sendMail(act.email, device)
                        //         if(act.DO) act.DO.forEach((val, index)=>setDO( val, index) ) 
                       
                            //}
                            TestDevicesModbus.onTrig(device, rule)
                        })) 
                    }catch(err){
                        console.error(err)
                    }    
                   }      
            }
        }
    }
})}

export const reloadCronTask =()=>{
    while (tasks.length) {
       tasks.pop().destroy()  
    }
    loadCronTask()
}