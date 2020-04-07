import  * as fs  from 'fs'
import { dioTest } from './tests.devices/di.test';
export const _di = [56,128,89,109,24,25] 
export const _do = [58,140,139,26]
export function setDO(n,value:number){
   fs.writeFile('/sys/devices/virtual/misc/mtgpio/pin',`-w=${_do[n]}:0 0 0 ${value} 0 1 0`,(err)=>{if (err) console.error('setDO:',err);})
}
export const di=(n:number)=>new Promise((resolve,reject)=>fs.readFile('/sys/devices/virtual/misc/mtgpio/pin','utf8',(err,data:string)=>{
   if(err)reject(err)
   else resolve(data[70+_di[n]*14]==='1')
}))

export function ioInit(){
  for (const n in _di) {
   fs.writeFile('/sys/devices/virtual/misc/mtgpio/pin',`-w=${n}:0 0 0 0 0 0 0`,(err)=>{if (err) console.error('ioInit:',err);})
  }
  for (const n in _do) {
   setDO(n,0)
   //fs.writeFile('/sys/devices/virtual/misc/mtgpio/pin',`-w=${n}:0 0 0 0 0 1 0`,(err)=>{if (err) console.error('ioInit:',err);})
  }
  setInterval(()=>  dioTest(),50)
}