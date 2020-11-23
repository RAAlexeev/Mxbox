import * as fs  from 'fs'



const _di = [56,128,89,109,24,25,27,141] 
const _do = [26,140,144,58,139]

export function setDO(n,value){
   fs.writeFile('/sys/devices/virtual/misc/mtgpio/pin',`-w=${_do[n]}:0 0 0 ${value?1:0} 0 1 0`,(err)=>{if (err) console.error('setDO:',err);})
}

export const di=(n:number)=>new Promise((resolve,reject)=>fs.readFile('/sys/devices/virtual/misc/mtgpio/pin','utf8',(err,data:string)=>{
   
   if(err)
   {
      return reject(err)
       
   }
   if(n<0)n=0
   const splitData = data.split('\n')
   console.debug('di',n,'=',splitData[_di[n]+1].charAt(6))
   return resolve(splitData[_di[n]+1].charAt(6)=="0")

  //resolve(data[70+_di[n]*14]==='0')

}))

export function ioInit(){
  for (let n=0 ;n<_di.length;n++) {
   fs.writeFile('/sys/devices/virtual/misc/mtgpio/pin',`-w=${_di[n]}:0 0 0 0 0 0 0`,(err)=>{if (err) console.error('ioInit:',err);})
  }

  for (let n=0;n<_do.length;n++) {
   setDO(n,0)
   //fs.writeFile('/sys/devices/virtual/misc/mtgpio/pin',`-w=${n}:0 0 0 0 0 1 0`,(err)=>{if (err) console.error('ioInit:',err);})
  }
  //etInterval(()=>dioTest(),50)
}

export  const getStateIO=()=>new Promise((resolve,reject)=>fs.readFile('/sys/devices/virtual/misc/mtgpio/pin','utf8',(err,data:string)=>{  

   if(err){
      
      return reject(err)
   }
     const splitData = data.split('\n')
     let ret = Array(splitData[0])
     for(let n=0;  n < 6; n++){
        ret.push(splitData[_di[n]+1])
     }
     for(let n=0;  n < 3; n++){
      ret.push(splitData[_do[n]+1])
   }
   return resolve(ret)

}))