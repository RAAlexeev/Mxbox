import { db, Device} from '../schema'
import cron from 'node-cron'
import { TestDevicesModbus } from './modbus.test'
const tasks:any[] = []
export const loadCronTask = ()=>{
    db.find( { 'rules.trigs.type':1 }, ( err, devices:Device[] )=>{
        for(const device of devices){
            for(const rule of device.rules){
                if(rule && rule.trigs)
                for(const trig of rule.trigs){
                   if(trig)
                   if(trig.type === 1 ){
                      try{
                       tasks.push(cron.schedule(trig.cron,()=>TestDevicesModbus.onTrig(device, rule))) 
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