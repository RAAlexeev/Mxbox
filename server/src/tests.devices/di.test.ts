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

import * as io from '../io'

export const dioTest =  ()=>{
  
/*     fs.writeFileSync('/sys/devices/virtual/misc/mtgpio/pin','-w=24:0 0 0 0 0 0 0')
    fs.writeFileSync('/sys/devices/virtual/misc/mtgpio/pin','-w=25:0 0 0 0 0 0 0')
    setInterval(()=>{
    fs.readFile('/sys/devices/virtual/misc/mtgpio/pin','utf8',(err,data:string)=>{
        const di=(n:number)=>(data[70+n*14]==='1')
        if(di(24)&&!di(140))fs.writeFile('/sys/devices/virtual/misc/mtgpio/pin','-w=140:0 0 0 1 0 1 0',(err)=>{if (err) console.error(err);})
        else fs.writeFile('/sys/devices/virtual/misc/mtgpio/pin','-w=140:0 0 0 0 0 1 0',(err)=>{if (err) console.error(err);})
        if(di(25)&&!di(58))fs.writeFile('/sys/devices/virtual/misc/mtgpio/pin','-w=58:0 0 0 1 0 1 0',(err)=>{if (err) console.error(err);})
        else fs.writeFile('/sys/devices/virtual/misc/mtgpio/pin','-w=28:0 0 0 0 0 1 0',(err)=>{if (err) console.error(err);})
    }) },1000) */
    
  for(let n = 0; n < 6;n++)
    io.di(n).then((value)=>io.setDO(((n<3)?n:(n-3)),value)).catch((reason)=>console.error(reason))
}