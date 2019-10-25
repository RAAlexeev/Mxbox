/* import { db, Device} from '../schema'
setInterval(()=> 
db.find( { 'rules.trigs.type':2 },(err,devices:Device[])=>{
    if(err)
    { console.error(err)
     return   
    }else
    for(const device of devices ){
        for( const rule of device.rules ){
           for(const trig of rule.trigs ){
                trig.condition
           }
        }
    }

}),1000) */
import  * as fs  from 'fs'

export const dioTest =  ()=>{
  
    fs.writeFileSync('/sys/devices/virtual/misc/mtgpio/pin','-w=24:0 0 0 0 0 0 0-w=25:0 0 0 0 0 0 0')
    setInterval(()=>{
    fs.readFile('/sys/devices/virtual/misc/mtgpio/pin','utf8',(err,data:string)=>{
        const di=(n:number)=>(data[70+n*14]==='1')
        if(di(24)&&!di(140))fs.writeFile('/sys/devices/virtual/misc/mtgpio/pin','-w=140:0 0 0 1 0 1 0',(err)=>{if (err) console.error(err);})
        else fs.writeFile('/sys/devices/virtual/misc/mtgpio/pin','-w=140:0 0 0 0 0 1 0',(err)=>{if (err) console.error(err);})
        if(di(25)&&!di(58))fs.writeFile('/sys/devices/virtual/misc/mtgpio/pin','-w=58:0 0 0 1 0 1 0',(err)=>{if (err) console.error(err);})
        else fs.writeFile('/sys/devices/virtual/misc/mtgpio/pin','-w=28:0 0 0 0 0 1 0',(err)=>{if (err) console.error(err);})
    }) },1000)
  
}