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
let inteval;
export const dioTest = ()=>{
  if(inteval){
    clearInterval(inteval)
    inteval = undefined
    return false
  }
   else{
      inteval = setInterval(()=>{ 
              for(let n = 0; n < 3; n++)
                  io.di( n ).then( ( value1 )=>{
                          io.di( n + 3 ).then( ( value2 )=>io.setDO(n, value1||value2) ).catch((reason)=>console.error(reason))
                  }).catch((reason)=>console.error(reason))
                  
    
    },100)
  return true
  }
}

